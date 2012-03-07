// -*- Javascript -*-
'use strict';

// Scheduler is an interface describing something that can produce SchedulerCommands.
// Scheduler has a run() method that produces a SchedulerCommand.
//  "I am yielding control but I am ready to run again."
// Scheduler has a wait() method that produces a SchedulerCommand.
//  "Wake me up when someone sends a message to me."
// Scheduler has a sleep(interval) method that produces a SchedulerCommand.
//  "Wake me up after this interval of time."
// Scheduler has a acquire(resource) method that produces a SchedulerCommand.
//  "Put me on the list for this resource, and wake me when I can have it."
// Note: there is no 'die' method, though it might be reasonable.
//
// SchedulerCommand is an interface.
// SchedulerCommand has a stop() method that returns nothing.
//  "Stop everything, we're done here."
// SchedulerCommand has a send(to_whom, message) method that returns nothing.
//  "Please deliver this to so-and-so."
// SchedulerCommand has a release(resource) method that returns nothing.
//  "I'm done with this, you can give it to someone else."
// SchedulerCommand has  spawn(address, task) method that returns nothing.
//  "Start this task at this address."
//
// These classes Run, Wait, Sleep, Acquire are scheduler commands.
function Run() {
}
Run.prototype.accept = function (visitor) {
    visitor.run()
}
function Wait() {
}
Wait.prototype.accept = function (visitor) {
    visitor.wait()
}
function Sleep(interval) {
    this.interval = interval
}
Sleep.prototype.accept = function (visitor) {
    visitor.sleep(this.interval)
}
function Acquire(resource) {
    this.resource = resource
}
Acquire.prototype.accept = function (visitor) {
    visitor.acquire(this.resource)
}
// These classes stop, send, release are scheduler commands
// In particular, they're scheduler command adapters,
// that wrap an existing scheduler command and modify it,
// to do something else in addition.
function Stop(rest) {
    this.rest = rest
}
Stop.prototype.accept = function (visitor) {
    visitor.stop()
    this.rest.accept(visitor)
}
function Send(address, message, rest) {
    this.address = address
    this.message = message
    this.rest = rest
}
Send.prototype.accept = function (visitor) {
    visitor.send(this.address, this.message)
    this.rest.accept(visitor)
}
function Release(resource, rest) {
    this.resource = resource
    this.rest = rest
}
Release.prototype.accept = function (visitor) {
    visitor.release(this.resource)
    this.rest.accept(visitor)
}
function Spawn(address, task, rest) {
    this.address = address
    this.task = task
    this.rest = rest
}
Spawn.prototype.accept = function (visitor) {
    visitor.spawn(this.address, this.task)
    this.rest.accept(visitor)
}
// CommandPrinter is a scheduler command visitor
// that jaws.logs what it sees
function CommandPrinter() {
}
CommandPrinter.prototype.run = function () {
    jaws.log('run')
}
CommandPrinter.prototype.wait = function () {
    jaws.log('wait')
}
CommandPrinter.prototype.sleep = function (interval) {
    jaws.log('sleep for '+interval)
}
CommandPrinter.prototype.acquire = function (resource) {
    jaws.log('acquire '+resource)
}
CommandPrinter.prototype.stop = function () {
    jaws.log('stop')
}
CommandPrinter.prototype.send = function (address, message) {
    jaws.log('send (to '+address+') "'+message+'"')
}
CommandPrinter.prototype.release = function (resource) {
    jaws.log('release '+resource)
}
CommandPrinter.prototype.spawn = function (task) {
    jaws.log('spawn '+task)
}

// RecordSchedulerCommand is an implementation of SchedulerCommand
function RecordSchedulerCommand(initial) {
    this.command = initial
}
RecordSchedulerCommand.prototype.stop = function () {
    this.command = new Stop(this.command)
}
RecordSchedulerCommand.prototype.send = function (address, message) {
    this.command = new Send(address, message, this.command)
}
RecordSchedulerCommand.prototype.release = function (resource) {
    this.command = new Release(resource, this.command)
}
RecordSchedulerCommand.prototype.spawn = function (address, task) {
    this.command = new Spawn(address, task, this.command)
}
RecordSchedulerCommand.prototype.accept = function (visitor) {
    this.command.accept(visitor)
}

// RecordScheduler is an implementation of Scheduler 
// that produces RecordSchedulerCommands.
function RecordScheduler() {
}
RecordScheduler.prototype.run = function () {
    return new RecordSchedulerCommand(new Run())
}
RecordScheduler.prototype.wait = function () {
    return new RecordSchedulerCommand(new Wait())
}
RecordScheduler.prototype.sleep = function (interval) {
    return new RecordSchedulerCommand(new Sleep(interval))
}
RecordScheduler.prototype.acquire = function (resource) {
    return new RecordSchedulerCommand(new Acquire(resource))
}

// A task is an interface
// A task has a method, step, that takes a Scheduler and possibly a message
// and returns a SchedulerCommand produced from that Scheduler.
// It should not keep the Scheduler around.
//
// Chores is an example task, using a simple switch-based state machine.
function Chores() {
    this.state = 0
}
Chores.prototype.step = function (scheduler, message) {
    var answer;
    switch (this.state) {
    case 0:
	answer = scheduler.acquire('human')
	this.state = 1
	break
    case 1:
	answer = scheduler.wait()
	answer.send('human', 'time to chop the wood')
	this.state = 2
	break
    case 2:
	// assume the message is correct for now
	answer = scheduler.acquire('human')
	answer.release('human')
	this.state = 3
	break
    case 3:
	answer = scheduler.wait()
	answer.send('human', 'time to carry the water')
	this.state = 4
	break
    case 4:
	// assume the message is correct for now
	answer = scheduler.sleep('1 day')
	answer.release('human')
	this.state = 0
	break;
    }
    return answer
}

// A distribution is something that has a generate method,
// that generates numbers randomly according to some distribution
//
// A flat distribution over the integers between a lower and upper bound.
// including the lower bound and excluding the upper.
// 
// It's used in the barbershop simulation.
function Flat(lower, upper) {
    this.lower = lower
    this.upper = upper
}
Flat.prototype.generate = function () {
    return Math.floor(
	Math.random() * (this.upper - this.lower)
    ) + this.lower
}
Flat.prototype.toString = function () {
    return '[' + this.lower + ', ' + this.upper + ')';
}
// BarbershopCustomer is another simple task
function BarbershopCustomer() {
    this.number = BarbershopCustomer.count
    this.state = 0
    BarbershopCustomer.count += 1
}
BarbershopCustomer.count = 0
BarbershopCustomer.service_time = new Flat(5, 15)
BarbershopCustomer.prototype.toString = function () {
    return 'Customer' + this.number
}
BarbershopCustomer.prototype.step = function (s, message_ignored) {
    var answer
    switch (this.state) {
    case 0:
	answer = s.acquire('barber')
	this.state += 1
	break
    case 1:
	jaws.log(this + ' sits down to get their hair cut.')
	answer = s.sleep(BarbershopCustomer.service_time.generate())
	this.state += 1
	break
    case 2:
	jaws.log(this + ' finishes their haircut, pays and leaves')
	// more properly this should be 'die',
	// but it's equivalent since we won't get any messages
	answer = s.wait()
	answer.release('barber')
	this.state += 1
	break
    case 3:
	throw 'unexpected step in '+this.toString()
	break
    }
    return answer
}
// BarbershopClosing is another simple task
// It's responsible for waiting until closing time,
// and then stopping the simulation.
function BarbershopClosing() {
    this.state = 0
}
BarbershopClosing.prototype.step = function (s, message_ignored) {
    var answer
    switch (this.state) {
    case 0:
	answer = s.sleep(8 * 60)
	this.state += 1
	break
    case 1:
	answer = s.wait()
	answer.stop()
	this.state += 1
	break
    default:
	throw 'this should never happen!'
	break
    }
    return answer
}
// BarbershopGenerator is a simple task
// It's responsible for generating customers intermittently.
function BarbershopGenerator() {
    this.state = 0
}
BarbershopGenerator.interarrival_time = new Flat(1, 25)
BarbershopGenerator.prototype.step = function (s, message_ignored) {
    var answer
    var customer
    switch (this.state) {
    case 0:
	answer = s.sleep(BarbershopGenerator.interarrival_time.generate())
	this.state = 1
	break
    case 1:
	answer = s.sleep(BarbershopGenerator.interarrival_time.generate())
	customer = new BarbershopCustomer()
	jaws.log(customer+' arrives.')
	answer.spawn(customer.toString(), customer)
	this.state = 1 // note: stay in the same state
	break
    default:
	throw 'this should never happen!'
	break
    }
    return answer

}

// Scheduler is a 'real' scheduler
function Scheduler() {
    this.clock = 0
    this.agenda = []
    this.running = true
    this.resources = {}
    this.tasks = {}
}
// TODO: maybe there should be a SchedulerStep object with
// lifetime equal to one step?
Scheduler.prototype.step = function () {
    // figure out what to do next
    this.agenda.sort(function (a, b) { return b.time - a.time })
    if (this.agenda.length > 0) {
	this.current_event = this.agenda.pop()
	// advance the clock
	this.clock = this.current_event.time
	// ask the task what it wants to do
	var command = this.current_event.task.step(new RecordScheduler())
	// jaws.log it
	// command.accept(new CommandPrinter())
	// do it
	command.accept(this)
    } else {
	jaws.log('nothing to do!')
    }
}
// mutators for scheduler
Scheduler.prototype.addResource = function (name) {
    this.resources[name] = { current: null, waiting_line: [] }
}
// services for Scheduler
Scheduler.prototype.run = function () {
    this.agenda.push({time: this.clock, task: this.current_event.task})
}
Scheduler.prototype.wait = function () {
    // nothing to do?
}
Scheduler.prototype.sleep = function (interval) {
    this.agenda.push({time: this.clock + interval, task: this.current_event.task})
}
Scheduler.prototype.acquire = function (resource) {
    if (this.resources[resource].current === null) {
	jaws.log(resource+' is available now');
	this.resources[resource].current = this.current_event.task
	this.agenda.push({time: this.clock, task: this.current_event.task})
    } else {
	jaws.log(resource+' is not currently available');
	this.resources[resource].waiting_line.push(this.current_event.task)
    }
}
Scheduler.prototype.stop = function () {
    this.running = false
}
Scheduler.prototype.send = function (address, message) {
    // TODO
}
Scheduler.prototype.release = function (resource) {
    var new_task
    if (this.current_event.task !== this.resources[resource].current) {
	throw 'you cannot release something you do not have!'
    }
    if (this.resources[resource].waiting_line.length > 0) {
	new_task = this.resources[resource].waiting_line.shift()
	this.resources[resource].current = new_task
	this.agenda.push({time: this.clock, task: new_task})
    } else {
	jaws.log(resource+' released, idling.')
	this.resources[resource].current = null
    }
}
Scheduler.prototype.spawn = function (task_name, task) {
    if (this.tasks[task_name]) {
	throw 'cannot spawn a task on top of another task!'
    } else {
	this.tasks[task_name] = task
	this.agenda.push({time: this.clock, task: task})
    }
}
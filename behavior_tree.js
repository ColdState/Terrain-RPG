// My attempt at implementing behavior trees,
// as described by Damian Isla, Chirs Hecker,
// Alex Champandard, and Bjoern Knafla.
//
// I'm incompetent in javascript, so this probably
// looks very awkward. Sorry.
//
// Note there's a dependency on Object.extend(subclass, superclass),
// to implement inheritance.

'use strict'

function BehaviorTree() {

	var Done = function () {}
	Done.prototype.done = function () { return true }
	Done.prototype.pushLeft = function () { return this }
	Done.prototype.pushRight = function () { return this }
	this.Done = Done; // stick it into the namespace

	var failure = new Done()
	this.failure = failure; // stick it into the namespace

	var success = new Done()
	this.success = success; // stick it into the namespace

	var Running = function () {}
	Running.prototype.done = function () { return false }
	Running.prototype.pushLeft = function () {
		return new Left(this)
	}
	Running.prototype.pushRight = function () {
		return new Right(this)
	}
	this.Running = Running

	var sequential_and = {}
	sequential_and.shortCutsOn = function (result) {
		return result === failure
	}
	sequential_and.id = function () { return success }
        sequential_and.killer = failure
	sequential_and.reactive = function () { return false }
	this.sequential_and = sequential_and
	
	var sequential_or = {}
	sequential_or.shortCutsOn = function (result) {
		return result === success
	}
	sequential_or.id = function () { return failure }
        sequential_or.killer = success
	sequential_or.reactive = function () { return false }
	this.sequential_or = sequential_or

	var reactive_and = {}
	reactive_and.shortCutsOn = function (result) {
		return result === failure
	}
	reactive_and.id = function () { return success }
        reactive_and.killer = failure
	reactive_and.reactive = function () { return true }
	this.reactive_and = reactive_and

	var reactive_or = {}
	reactive_or.shortCutsOn = function (result) {
		return result === success
	}
	reactive_or.id = function () { return failure }
        reactive_or.killer = success
	reactive_or.reactive = function () { return true }
	this.reactive_or = reactive_or

	function Branch(left, op, right) {
		this.left = left
		this.op = op
		this.right = right
	}
	Branch.prototype.myEval = function (left_lambda, right_lambda) {
		var x = left_lambda()
		if (this.op.shortCutsOn(x)) {
			return x
		} else if (!x.done()) {
			return x.pushLeft()
		} else if (x === this.op.id()) {
			return right_lambda().pushRight()
		}
		throw new Error("This should not happen")
	}
	Branch.prototype.start = function () {
	    var that = this
	    return this.myEval(function () { return that.left.start() },
			       function () { return that.right.start() })
	}
	this.Branch = Branch

	function Leaf(x) {
		this.x = x
	}
	Leaf.prototype.start = function () {
		return this.x
	}
	this.Leaf = Leaf

	function Delay(delayed) {
		this.delayed = delayed
	}
	Delay.prototype.start = function () {
		return new Resume()
	}
	Delay.prototype.resume = function () {
		return this.delayed.start()
	}
	this.Delay = Delay

	function Resume() {}
	Object.extend(Resume, Running)
	Resume.prototype.step = function (delay) {
		return delay.resume()
	}
	Resume.prototype.toString = function () {
		return ''
	}
	this.Resume = Resume

	function Left(path) {
		this.path = path
	}
	Object.extend(Left, Running)
	Left.prototype.step = function (tree) {
	    var that = this
	    return tree.myEval(
		function () { return that.path.step(tree.left); },
		function () { return tree.right.start(); })
	}
	Left.prototype.toString = function () {
		return 'l' + this.path
	}
	this.Left = Left

	function Right(path) {
		this.path = path
	}
	Object.extend(Right, Running)
	Right.prototype.step = function (tree) {
		var that = this
		if (tree.op.reactive()) {
			return tree.myEval(
			    function () { return tree.left.start(); },
			    function () { return that.path.step(tree.right); })
		} else {
			return this.path.step(tree.right).pushRight()
		}
	}
	Right.prototype.toString = function () {
		return 'r' + this.path
	}
	this.Right = Right

        function Prioritized(items) {
	    return items.reduce( function (l, r) {
		return new Branch(l, reactive_or, r)
	    })
        }
        this.Prioritized = Prioritized

        function Sequence(items) {
	    return items.reduce( function (l, r) {
		return new Branch(l, sequential_and, r) 
	    })
	}
    this.Sequence = Sequence

    function Rule(test, action) {
	return new Branch(test, reactive_and, action)
    }
    this.Rule = Rule
}


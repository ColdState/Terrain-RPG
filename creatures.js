// This is where we define what creatures are
//
// Dependencies are unclear,
// but it definitely uses jaws and 
// behavior trees.

'use strict';

function Creatures(jaws, behavior_tree) {
	function Go(mind, direction) {
		this.mind = mind
		this.direction = direction
	}
	Go.prototype.start = function() {
		this.mind.go(this.direction)
		// come back to exactly here next time
		return new behavior_tree.Resume()
	}
	Go.prototype.resume = function() {
		return behavior_tree.success
	}

	// Keep on truckin
	function KeepOn(mind) {
		this.mind = mind
	}
	KeepOn.prototype.start = function() {
		this.mind.tomorrow()
		return new behavior_tree.Resume()
	}
	KeepOn.prototype.resume = function() {
		this.mind.tomorrow()
		return new behavior_tree.Resume()
	}

	// CreatureMind conforms to the 'step' interface required for a task to be
	// schedulable.
	function CreatureMind() {
		// do a little dance, then coast
		this.policy = behavior_tree.Sequence([ new Go(this, 0),
				new Go(this, 1), new Go(this, 2), new Go(this, 3),
				new KeepOn(this) ])
		// TODO: these members are only used temporarily; a bad smell.
		// Refactor introducing a new object holding these members,
		// which has a lifetime corresponding to their current duration-of-use.
		this.scheduler = null
		this.scheduler_command = null
	}
	CreatureMind.prototype.step = function(scheduler, message_ignored) {
		this.scheduler = scheduler
		// TODO: this clumsy null-as-first-flag nonsense is disgusting
		if (this.mind_state) {
			this.mind_state = this.mind_state.step(this.policy)
		} else {
			this.mind_state = this.policy.start()
		}
		return this.scheduler_command
	}
	CreatureMind.prototype.go = function(direction) {
		// set the heading
		this.heading = direction
		// wait a bit before going on to the next step
		this.scheduler_command = this.scheduler.sleep(random(5))
	}
	CreatureMind.prototype.tomorrow = function() {
		// wait until tomorrow
		this.scheduler_command = this.scheduler.sleep(1)
	}

	function Creature(options) {
		this.id = options.id
		this.sprite = options.sprite;
		this.x = options.x;
		this.y = options.y;
		this.name = 'Creature ' + this.id
		this.color = options.color
		this.pixels_per_move = options.pixels_per_move
		this.square_size = options.square_size
		this.mind = new CreatureMind()
	}
	Creature.prototype.draw = function() {
		if (this.sprite) {
			this.sprite.x = this.my_rect.x
			this.sprite.y = this.my_rect.y
			this.sprite.draw()
		} else {
			jaws.context.fillStyle = this.color
			jaws.context.fillRect(this.my_rect.x, this.my_rect.y,
					this.square_size, this.square_size);
		}
	}
	Creature.prototype.move = function(dx, dy) {
		this.my_rect.move(dx, dy);
	}
	Creature.prototype.rect = function() {
		return this.my_rect;
	}
	Creature.prototype.update = function(map) {
		var d = this.pixels_per_move / ticks_per_turn
		switch (this.mind.heading) {
		case 0:
			maybeMove(this, -d, 0, map);
			break;
		case 1:
			maybeMove(this, d, 0, map);
			break;
		case 2:
			maybeMove(this, 0, -d, map);
			break;
		case 3:
			maybeMove(this, 0, d, map);
			break;
		}
	}

	function Herbivore(options) {
		options.color = 'blue'
		options.square_size = 10

		Creature.call(this, options) // Use parent's constructor
		this.my_rect = new jaws.Rect(options.x, options.y, 32, 32);
	}
	Object.extend(Herbivore, Creature)

	function Carnivore(options) {
		options.color = 'red'
		options.square_size = 15
		Creature.call(this, options) // Use parent's constructor
		this.my_rect = new jaws.Rect(options.x, options.y, 32, 32);
	}
	Object.extend(Carnivore, Creature)
	return {
		Carnivore : Carnivore,
		Herbivore : Herbivore
	}
}

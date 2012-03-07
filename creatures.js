function CreatureMind(body) {
	this.body = body
	this.step = function(scheduler) {
		// Change the body's heading, as a side effect
		this.body.heading = random(3)
		
		// Request rescheduling immediatly
		var command = scheduler.run()
		return command
	}
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
	
	this.mind = new CreatureMind(this)
	
	// Initial heading at random
	this.heading = random(3)
}
Creature.prototype.draw = function () {
	if(this.sprite) {
		this.sprite.x = this.my_rect.x
		this.sprite.y = this.my_rect.y
		this.sprite.draw()
	} else {
		jaws.context.fillStyle = this.color
		jaws.context.fillRect(this.my_rect.x, this.my_rect.y, this.square_size, this.square_size);
	}
}
Creature.prototype.move = function (dx, dy) {
	this.my_rect.move(dx, dy);
}
Creature.prototype.rect = function () {
	return this.my_rect;
}
Creature.prototype.update = function (map) {
	switch (this.heading) {
		case 0: maybeMove(this, -this.pixels_per_move, 0, map); break;
		case 1: maybeMove(this, this.pixels_per_move, 0, map); break;
		case 2: maybeMove(this, 0, -this.pixels_per_move, map); break;
		case 3: maybeMove(this, 0, this.pixels_per_move, map); break;
	}
}

function Herbivore(options) {
	options.color = 'blue'
	options.square_size = 10
	
	Creature.call(this, options)  // Use parent's constructor
	this.my_rect = new jaws.Rect(options.x, options.y, 32, 32);
}
Object.extend(Herbivore, Creature)

function Carnivore(options) {
	options.color = 'red'
	options.square_size = 15
	Creature.call(this, options)  // Use parent's constructor
	this.my_rect = new jaws.Rect(options.x, options.y, 32, 32);
}
Object.extend(Carnivore, Creature)

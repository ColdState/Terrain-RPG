function Herbivore(options) {
    this.sprite = options.sprite;
    this.x = options.x;
    this.y = options.y;
    this.my_rect = new jaws.Rect(options.x, options.y, 32, 32);
}
Herbivore.prototype.draw = function () {
	if(this.sprite) {
		this.sprite.x = this.my_rect.x
		this.sprite.y = this.my_rect.y
		this.sprite.draw()
	} else {
		jaws.context.fillStyle = 'blue';
		jaws.context.fillRect(this.my_rect.x, this.my_rect.y, 10, 10);
	}
}
Herbivore.prototype.rect = function () {
    return this.my_rect;
}
Herbivore.prototype.move = function (dx, dy) {
    this.my_rect.move(dx, dy);
}
Herbivore.prototype.steer = function (map) {
    switch (random(3)) {
    case 0: maybeMove(this, -2, 0, map); break;
    case 1: maybeMove(this, 2, 0, map); break;
    case 2: maybeMove(this, 0, -2, map); break;
    case 3: maybeMove(this, 0, 2, map); break;
    }
}

function Carnivore(options) {
    this.sprite = options.sprite;
    this.x = options.x;
    this.y = options.y;
    this.my_rect = new jaws.Rect(options.x, options.y, 15, 15);
}
Carnivore.prototype.draw = function () {
    jaws.context.fillStyle = 'red';
    jaws.context.fillRect(this.my_rect.x, this.my_rect.y, 15, 15);
}
Carnivore.prototype.rect = function () {
    return this.my_rect;
}
Carnivore.prototype.move = function(dx, dy) {
    this.my_rect.move(dx, dy);
}
Carnivore.prototype.steer = function (map) {
    switch (random(3)) {
    case 0: maybeMove(this, -4, 0, map); break;
    case 1: maybeMove(this, 4, 0, map); break;
    case 2: maybeMove(this, 0, -4, map); break;
    case 3: maybeMove(this, 0, 4, map); break;
    }
}
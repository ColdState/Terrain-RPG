'use strict';

function TerrainTile(options) {
    this.my_rect = options.rect;
    this.sprite = options.sprite;
};
TerrainTile.prototype.rect = function () {
    return this.my_rect;
};
TerrainTile.prototype.draw = function () {
	jaws.context.save();
	jaws.context.translate(this.my_rect.x, this.my_rect.y);
	this.sprite.draw();
	jaws.context.restore();
};

function Mountain(options) {
    TerrainTile.call(this, options);
};
Object.extend(Mountain, TerrainTile);
Mountain.prototype.draw = function () {
    jaws.context.fillStyle = 'brown';
    jaws.context.fillRect(this.my_rect.x, this.my_rect.y,
			  this.my_rect.width, this.my_rect.height);
};
// In general, mountains are impassable
Mountain.prototype.impassable = true;

function Forest(options) {
	options.sprite = new jaws.Sprite({
		image: 'forest_x32.png',
		x: 0, y: 0});
    TerrainTile.call(this, options);
};
Object.extend(Forest, TerrainTile);

function Grass(options) {
	options.sprite = new jaws.Sprite({
		image: 'grass_x32.png',
		x: 0, y: 0});
    TerrainTile.call(this, options);
};
Object.extend(Grass, TerrainTile);

function Lake(options) {
    TerrainTile.call(this, options);
};
Object.extend(Lake, TerrainTile);
Lake.prototype.draw = function () {
    jaws.context.fillStyle = 'blue';
    jaws.context.fillRect(this.my_rect.x, this.my_rect.y,
			  this.my_rect.width, this.my_rect.height);
};


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
	options.sprite = new jaws.Sprite({
		image: 'images/terrain/mountain_x32.png',
		x: 0, y: 0});
    TerrainTile.call(this, options);
};
Object.extend(Mountain, TerrainTile);

// In general, mountains are impassable
Mountain.prototype.impassable = true;
Mountain.prototype.clone = function (options) {
    return new Mountain(options);
};

function Forest(options) {
	options.sprite = new jaws.Sprite({
		image: 'images/terrain/forest_x32.png',
		x: 0, y: 0});
    TerrainTile.call(this, options);
};
Object.extend(Forest, TerrainTile);
Forest.prototype.clone = function (options) {
    return new Forest(options);
};

function Grass(options) {
    options.sprite = new jaws.Sprite({
	image: 'images/terrain/grass_x32.png',
	x: 0, y: 0});
    TerrainTile.call(this, options);
};
Object.extend(Grass, TerrainTile);
Grass.prototype.clone = function (options) {
    return new Grass(options);
};

function Lake(options) {
	options.sprite = new jaws.Sprite({
		image: 'images/terrain/lake_x32.png',
		x: 0, y: 0});
    TerrainTile.call(this, options);
};
Object.extend(Lake, TerrainTile);

Lake.prototype.clone = function (options) {
    // When you clone a lake you actually get a forest
    return new Forest(options);
};


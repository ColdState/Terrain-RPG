'use strict';

function TerrainTile(options) {
    this.my_rect = options.rect;
    this.sprite = options.sprite;
};
TerrainTile.prototype.rect = function () {
    return this.my_rect;
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

function Forest(options) {
    TerrainTile.call(this, options);
};
Object.extend(Forest, TerrainTile);
Forest.prototype.draw = function () {
    jaws.context.fillStyle = 'DarkGreen';
    jaws.context.fillRect(this.my_rect.x, this.my_rect.y,
			  this.my_rect.width, this.my_rect.height);
};

function Grass(rect) {
    this.my_rect = rect;
};
Object.extend(Grass, TerrainTile);
Grass.prototype.draw = function () {
    jaws.context.fillStyle = 'LightGreen';
    jaws.context.fillRect(this.my_rect.x, this.my_rect.y,
			  this.my_rect.width, this.my_rect.height);
};

function Lake(rect) {
    this.my_rect = rect;
};
Object.extend(Lake, TerrainTile);
Lake.prototype.draw = function () {
    jaws.context.fillStyle = 'blue';
    jaws.context.fillRect(this.my_rect.x, this.my_rect.y,
			  this.my_rect.width, this.my_rect.height);
};


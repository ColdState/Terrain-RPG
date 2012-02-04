'use strict';

function random(max) {
    return Math.floor(Math.random() * (max + 1));
};

function wrap(value, max) {
    value %= max;
    // we want to guarantee the output is within [0..max),
    // and javascript modulus doesn't quite do it,
    // so we have to fix up negatives.
    if (value < 0) {
	value += max;  
    }
    return value;
}

function OneWayObstacle(direction, rect) {
    this.direction = direction;
    this.my_rect = rect;
};
OneWayObstacle.prototype.rect = function () {
    return this.my_rect;
};
OneWayObstacle.prototype.draw = function () {
    jaws.context.fillStyle = 'black';
    jaws.context.fillRect(this.my_rect.x, this.my_rect.y,
			  this.my_rect.width, this.my_rect.height);
};
OneWayObstacle.prototype.toString = function () {
    return 'OneWayObstacle('+this.direction+
	', new jaws.Rect('+this.my_rect.x+
	', '+this.my_rect.y+
	', '+this.my_rect.width+
	', '+this.my_rect.height+
	'))';
};

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
    jaws.context.fillStyle = 'brown';
    jaws.context.fillRect(this.my_rect.x, this.my_rect.y,
			  this.my_rect.width, this.my_rect.height);
};

function Grass(rect) {
    this.my_rect = rect;
};
Object.extend(Grass, TerrainTile);
Grass.prototype.draw = function () {
    jaws.context.fillStyle = 'brown';
    jaws.context.fillRect(this.my_rect.x, this.my_rect.y,
			  this.my_rect.width, this.my_rect.height);
};

function Lake(rect) {
    this.my_rect = rect;
};
Object.extend(Lake, TerrainTile);
Lake.prototype.draw = function () {
    jaws.context.fillStyle = 'brown';
    jaws.context.fillRect(this.my_rect.x, this.my_rect.y,
			  this.my_rect.width, this.my_rect.height);
};

function TerrainRPG(jaws) {
    var map_width = 700; // blocks
    var map_height = 700; // blocks
    var cell_size = 32; // pixels

    var game = {};    
    
    // Called once when a game state is activated.
    // Use it for one-time setup code.
    game.setup = function() {
        this.viewport = new jaws.Viewport({max_x: map_width * cell_size,
					   max_y: map_height * cell_size});

        // A tilemap, each cell is 32x32 pixels.
        this.tile_map = new jaws.TileMap({size: [map_width, map_height],
					  cell_size: [32, 32]});
	for (var row = 0; row < map_width; ++row) {
	    for (var col = 0; col < map_height; ++col) {
		switch (random(4)) {
		case 0:
		    this.tile_map.push(new Mountain({ rect: new jaws.Rect(row * cell_size,
								     col * cell_size,
								     cell_size, cell_size)}));
		    break;
		case 1:
		    break;
		case 2:
		    break;
		case 3:
		    break;
		}
	    }
	}
	this.tile_map.push(
	    new OneWayObstacle('left',
			       new jaws.Rect(100, 100, 100, 100)
			      )
	);

        this.player = new jaws.Sprite({x:10, y:10,
				       scale: 2, anchor: "center"});
        
        var anim = new jaws.Animation({sprite_sheet: "droid_11x15.png",
				       frame_size: [11,15],
				       frame_duration: 100});
        this.player.anim_default = anim.slice(0,5);
        this.player.anim_up = anim.slice(6,8);
        this.player.anim_down = anim.slice(8,10);
        this.player.anim_left = anim.slice(10,12);
        this.player.anim_right = anim.slice(12,14);

        this.player.setImage( this.player.anim_default.next() );
        jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
    }

    // update() will get called each game tick with your specified FPS.
    // Put game logic here.
    game.update = function() {
        this.player.setImage( this.player.anim_default.next() )
        if (jaws.pressed("left"))  {
	    // TODO: check for obstacle
	    this.player.move(-2,0);
	    var possible_obstacles = this.tile_map.atRect(this.player.rect());
	    for (var i in possible_obstacles) {
		if (possible_obstacles[i].direction === 'left' &&
		    possible_obstacles[i].rect().collideRect(this.player.rect())) {
		    this.player.move(2,0);
		    break;
		}
	    }
	    this.player.setImage(this.player.anim_left.next());
	}
        if (jaws.pressed("right")) {
	    this.player.move(2,0);
	    this.player.setImage(this.player.anim_right.next());
	}
        if (jaws.pressed("up")) {
	    this.player.move(0, -2);
	    this.player.setImage(this.player.anim_up.next());
	}
        if (jaws.pressed("down")) {
	    this.player.move(0, 2);
	    this.player.setImage(this.player.anim_down.next());
	}

        // this.viewport.centerAround(this.player)
    }

    game.draw = function() {
	jaws.context.fillStyle = 'green';
	jaws.context.fillRect(0, 0, jaws.width, jaws.height);
        this.viewport.drawTileMap( this.tile_map );
        this.viewport.draw( this.player );
    }

    return game;
};


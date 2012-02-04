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

function Critter(options) {
    this.sprite = options.sprite;
    this.rect = options.rect;
};
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

function maybeMove(player, x, y, map) {
    player.move(x, y);
    var possible_obstacles = map.atRect(player.rect());
    for (var i in possible_obstacles) {
	if (possible_obstacles[i].impassable &&
	    possible_obstacles[i].rect().collideRect(player.rect())) {
	    // take the move back
	    player.move(-x, -y);
	    break;
	}
    }
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
		var options = { rect: new jaws.Rect(row * cell_size,
						    col * cell_size,
						    cell_size, cell_size)};
		var tile;
		if (row === 0 ||
		    row + 1 === map_width ||
		    col === 0 ||
		    col + 1 === map_height) {
		    tile = new Mountain(options);
		} else {
		    switch (random(3)) {
		    case 0: tile = new Mountain(options); break;
		    case 1: tile = new Forest(options); break;
		    case 2: tile = new Grass(options); break;
		    case 3: tile = new Lake(options); break;
		    }
		}
		this.tile_map.push(tile);
	    }
	}
	this.tile_map.push(
	    new OneWayObstacle('left',
			       new jaws.Rect(100, 100, 100, 100)
			      )
	);

        this.player = new jaws.Sprite({x:250, y:250,
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
	    maybeMove(this.player, -2, 0, this.tile_map);
	    this.player.setImage(this.player.anim_left.next());
	}
        if (jaws.pressed("right")) {
	    maybeMove(this.player, 2, 0, this.tile_map);
	    this.player.setImage(this.player.anim_right.next());
	}
        if (jaws.pressed("up")) {
	    maybeMove(this.player, 0, -2, this.tile_map);
	    this.player.setImage(this.player.anim_up.next());
	}
        if (jaws.pressed("down")) {
	    maybeMove(this.player, 0, 2, this.tile_map);
	    this.player.setImage(this.player.anim_down.next());
	}

        this.viewport.centerAround(this.player)
    }

    game.draw = function() {
	// a visible color that shouldn't show
	jaws.context.fillStyle = 'magenta'; 
	jaws.context.fillRect(0, 0, jaws.width, jaws.height);
        this.viewport.drawTileMap( this.tile_map );
        this.viewport.draw( this.player );
    }

    return game;
};


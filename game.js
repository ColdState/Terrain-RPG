'use strict';

var map_width = 30; // blocks
var map_height = 30; // blocks
var cell_size = 32; // pixels
var initial_critter_count = 20;
var herbivore_probability = 95; // percent

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
}



function fillMap(map) {
    for (var row = 0; row < map_width; ++row) {
	for (var col = 0; col < map_height; ++col) {
	    var options = {
		rect: new jaws.Rect(row * cell_size, col * cell_size,
				    cell_size, cell_size)};
	    var tile;
	    if (row === 0 ||
		row + 1 === map_height ||
		col === 0 ||
		col + 1 === map_width) {
		// borders are always mountains
		tile = new Mountain(options);
	    } else {
		switch (random(1)) {
		case 0:
		    // generate randomly
		    // Mountain is disallowed except on edges for now
		    switch (random(2)+1) {
		    case 0: tile = new Mountain(options); break;
		    case 1: tile = new Forest(options); break;
		    case 2: tile = new Grass(options); break;
		    case 3: tile = new Lake(options); break;
		    }
		    break;
		case 1:
		    // duplicate something nearby
		    // there always is something nearby,
		    // because of the mountains on the border.
		    var neighbors = map.atRect(new jaws.Rect(
			options.rect.x - cell_size,
			options.rect.y - cell_size,
			cell_size * 3, cell_size * 3));
		    var neighbor = neighbors[random(neighbors.length - 1)];
		    tile = neighbor.clone(options);
		    break;
		}
	    }
	    map.push(tile);
	}
    }
}

function TerrainRPG(jaws) {

	var game = {};    

	// Called once when a game state is activated.
	// Use it for one-time setup code.
	game.setup = function() {
		this.viewport = new jaws.Viewport({max_x: map_width * cell_size,
					 max_y: map_height * cell_size});

		// A tilemap, each cell is 32x32 pixels.

		// We generate a first map,
		// then we generate a second one from the first one.
		var first_map = new jaws.TileMap({size: [map_width, map_height],
					  cell_size: [32, 32]});
		fillMap(first_map);
		this.tile_map = new jaws.TileMap({size: [map_width, map_height],
					  cell_size: [32, 32]});
		fillMap(this.tile_map);

		this.player = new jaws.Sprite({image: "images/cloud_x32.png", x:250, y:250,
				       anchor: "center"});
		jaws.preventDefaultKeys(["up", "down", "left", "right", "space"]);
		this.critters = [];
		for (var i = 0; i < initial_critter_count; ++i) {
			var critter_x = random(map_width * cell_size)
			var critter_y = random(map_height * cell_size)
			var options = {
				x: critter_x,
				y: critter_y
			};
			var critter;
			var sprite;
			if (random(100) < herbivore_probability) {
				sprite = new jaws.Sprite({image: "images/creatures/nuper_x32.png", x:critter_x, y:critter_y,
				       anchor: "center"});
				options.sprite = sprite
				critter = new Herbivore(options);
			} else {
				critter = new Carnivore(options);
			}
			this.critters.push(critter);
		}
	}

	// update() will get called each game tick with your specified FPS.
	// Put game logic here.
	game.update = function() {
		if (jaws.pressed("left"))  {
			maybeMove(this.player, -2, 0, this.tile_map);
		}
		if (jaws.pressed("right")) {
		maybeMove(this.player, 2, 0, this.tile_map);
		}
		if (jaws.pressed("up")) {
			maybeMove(this.player, 0, -2, this.tile_map);
		}
		if (jaws.pressed("down")) {
			maybeMove(this.player, 0, 2, this.tile_map);
		}
		this.viewport.centerAround(this.player)
		for (var i in this.critters) {
			this.critters[i].steer(this.tile_map);
		}
	}

	game.draw = function() {
		// a visible color that shouldn't show
		jaws.context.fillStyle = 'magenta'; 
		jaws.context.fillRect(0, 0, jaws.width, jaws.height);
		this.viewport.drawTileMap( this.tile_map );
		for (var i in this.critters) {
			this.viewport.draw( this.critters[i] );
		}
		this.viewport.draw( this.player );
	}

	return game;
};


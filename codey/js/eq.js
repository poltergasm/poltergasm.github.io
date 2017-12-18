(function(w, d) {
	// eq settings
	var EQ 			= {}
	EQ.level 		= [];
	EQ.origLevel 	= [];
	EQ.map 			= d.querySelector('#map');
	EQ.infoNode 	= d.querySelector('#info');
	EQ.hud			= {
		hearts: d.querySelector('#hearts')
	};

	// player settings
	var Player 		= {};
	Player.loc      = null;
	Player.isDead   = false;
	Player.hearts   = 3;
	Player.attackLevel = 1;
	Player.fighting = false;

	EQ.createRow = function() {
		var r = d.createElement("div");
		r.className = "row";
		this.map.appendChild(r);
		return r;
	};

	EQ.createCol = function(root, n, i) {
		var isPath = false;
		var isPlayer = false;
		var isEnemy = false;
		var atkLevel = 0;
		var defLevel = 0;
		var name = '';
		switch(n) {
			case '@':
				// Player
				isPlayer = true;
				n = '&#129497';
				name = 'Player';
				break;
			case 'd':
				// death
				isPlayer = true;
				n = '&#9760';
				name = 'Player';
				break;
			case 'x':
				// solid wall
				n = '&#127794';
				name = 'wall';
				break;
			case 'e':
				// end
				n = '&#9749';
				name = 'Coffee';
				break;
			case 'g':
				// ghost
				isEnemy = true;
				atkLevel = 2;
				defLevel = 5;
				n = '&#128123';
				name = 'Ghost';
				break;
			case 'c':
				// crab
				isEnemy = true;
				atkLevel = 1;
				defLevel = 1;
				n = '&#x1F980';
				name = 'Crab';
				break;
			case 'f':
				// fire
				n = '&#128293';
				name = 'fire'
				break;
			case 's':
				// gemstone
				n = '&#128142';
				name = 'gemstone';
				break;
			case '=':
				// path
				isPath = true;
				n = '::'
				name = 'path';
				break;
		}

		var r = d.createElement("div");
		r.setAttribute("data-tile", i);
		r.className = "two columns";
		// if it's a path, add some padding
		if (isEnemy) {
			r.setAttribute("data-enemy", "true");
			r.setAttribute("data-attack-level", atkLevel);
			r.setAttribute("data-defence-level", defLevel);
		}
		if (isPath) { r.className = r.className + ' isPath'; }
		if (isPlayer) {
			r.className = r.className + ' Player';
			r.setAttribute("data-loc", i);
		}
		r.setAttribute("data-name", name);
		r.innerHTML = n;
		root.appendChild(r);
		return r;
	};

	EQ.updateMap = function() {
		var hearts = '';
		for (var i = 0; i < Player.hearts; i++) { hearts += '&#x2764;'; }
		this.hud.hearts.innerHTML = hearts;
		while (this.map.firstChild) {
			this.map.removeChild(this.map.firstChild);
		}

		var len = this.level.length;
	    var newRow = this.createRow();
	    for (var i = 0; i < len; i++) {
	    	this.createCol(newRow, this.level[i], i);
	    	if (i > 0 && (i+1) % 6 === 0) {
	    		newRow = this.createRow();
	    	}
		}
	};

	EQ.info = function(t, nl=false) {
		if (nl) {
			this.infoNode.innerHTML = this.infoNode.innerHTML + "<br>" + t;
		} else {
			this.infoNode.innerHTML = t;
		}
	};

	EQ.getAttr = function(r, f) { return r.getAttribute("data-" + f); };
	EQ.moveDest = function(dest) {
		// make sure we can move that way
		var tile = d.querySelector("[data-tile='" + dest + "']");
		if (this.getAttr(tile, "name") == "wall") {
			this.info("I'm not walking into a wall");
		} else {
	    	var curLoc = Player.loc;
	    	this.level[dest] = '@';
			this.level[curLoc] = '=';
			Player.loc = dest;

			// oops we hit a bad guy
			if (this.getAttr(tile, "enemy")) {
				Player.hearts = 0;
				this.level[dest] = 'd';
				this.info("Oops. You were killed by a " + this.getAttr(tile, "name"));
				Player.isDead = true;
			}

			this.updateMap();
		}
	};

	EQ.resetGame = function() {
		EQ.level = EQ.origLevel.slice();
		Player.isDead = false;
		Player.loc = 7;
		Player.hearts = 3;
		EQ.updateMap();
		EQ.info("Let's try this again...");
	};

	EQ.killPlayer = function() {
		this.level[Player.loc] = 'd';
		Player.isDead = true;
		EQ.updateMap();
		EQ.info("You died!");
	};

	Player.takeDamage = function(n) {
		Player.hearts = Player.hearts - n;
		if (Player.hearts > 0) { return true; }

		// ded
		return false;
	};

	EQ.fightMob = function(mob, tile) {
		var mobDef = parseInt(EQ.getAttr(tile, "defence-level"));
		var mobAtk = parseInt(EQ.getAttr(tile, "attack-level"));
		var fighting = true;

		var combat = setInterval(function() {
			var playerRoll = Math.floor(Math.random() * (Player.attackLevel+1));
			var mobRoll    = Math.floor(Math.random() * (mobDef+1));

			if (playerRoll > mobRoll) {
				EQ.info("You slayed the <strong>" + mob + "</strong>!");
				EQ.level[EQ.getAttr(tile, "tile")] = '=';
				EQ.updateMap();
				Player.fighting = false;
				if (typeof Player.onattackend !== "undefined") { Player.onattackend(mob); }
				clearInterval(combat);
				return true;
			}

			// got hit
			if (playerRoll == mobRoll) {
				EQ.info("The <strong>" + mob + "</strong> evades your attack");
			} else {
				if (Player.takeDamage(1)) {
					EQ.info("The <strong>" + mob + "</strong> hit you [" + playerRoll + "/" + mobRoll + "]");
					EQ.updateMap();
				} else {
					EQ.killPlayer();
					Player.fighting = false;
					clearInterval(combat);
				}
			}

		}, 3000);

		Player.fighting = true;
		return true;
	};

	Player.attack = function(mob) {
		mob = mob.toLowerCase();

		// look north
		var dest  = (Player.loc-6);
		var tile = d.querySelector("[data-tile='" + dest + "']");
		if (EQ.getAttr(tile, "name").toLowerCase() == mob) {
			EQ.info("Found a <strong>" + mob + "</strong> to the <strong>north</strong>. Preparing to attack!");
			EQ.fightMob(mob, tile);
			return true;
		}

		// look east
		dest = (Player.loc+1);
		tile = d.querySelector("[data-tile='" + dest + "']");
		if (EQ.getAttr(tile, "name").toLowerCase() == mob) {
			EQ.info("Found a <strong>" + mob + "</strong> to the <strong>east</strong>. Preparing to attack!");
			EQ.fightMob(mob, tile);
			return true;
		}

		// look south
		dest = (Player.loc+6);
		tile = d.querySelector("[data-tile='" + dest + "']");
		if (EQ.getAttr(tile, "name").toLowerCase() == mob) {
			EQ.info("Found a <strong>" + mob + "</strong> to the <strong>south</strong>. Preparing to attack!");
			return EQ.fightMob(mob, tile);
			//return true;
		}

		// look west
		dest = (Player.loc-1);
		tile = d.querySelector("[data-tile='" + dest + "']");
		if (EQ.getAttr(tile, "name").toLowerCase() == mob) {
			EQ.info("Found a <strong>" + mob + "</strong> to the <strong>west</strong>. Preparing to attack!");
			EQ.fightMob(mob, tile);
			return true;
		}

		// reached here then found nothing to fight
		EQ.info("I can't find a " + mob + " to fight");
	};

	Player.goSouth = function() {
		var curLoc = Player.loc;
		var dest   = curLoc+6;
		if (typeof EQ.level[dest] !== 'undefined') {
			EQ.moveDest(dest);
		} else {
			EQ.info("I can't go that way!");
		}
	};

	Player.goEast = function() {
		var curLoc = Player.loc;
		var dest   = curLoc+1;
		if (typeof EQ.level[dest] !== 'undefined') {
			EQ.moveDest(dest);
		} else {
			EQ.info("I can't go that way!");
		}
	};

	Player.goNorth = function() {
		var curLoc = Player.loc;
		var dest   = curLoc-6;
		if (typeof EQ.level[dest] !== 'undefined') {
			EQ.moveDest(dest);
		} else {
			EQ.info("I can't go that way!");
		}
	};

	Player.goWest = function() {
		var curLoc = Player.loc;
		var dest   = curLoc-1;
		if (typeof EQ.level[dest] !== 'undefined') {
			EQ.moveDest(dest);
		} else {
			EQ.info("I can't go that way!");
		}
	};

	Player.look = function(dir) {
		var t = 0;
		var loc = Player.loc;
		switch(dir) {
			case 'north':
				t = loc-6;
				break;
			case 'east':
				t = loc+1;
				break;
			case 'south':
				t = loc+6;
				break;
			case 'west':
				t = loc-1;
				break;
			default:
				EQ.info("I don't know how to look that way...");
				break;
		}

		if (t != 0) {
			if (typeof EQ.level[t] !== 'undefined') {
	    		var tile = d.querySelector("[data-tile='" + t + "']");
	    		EQ.info("You see a <strong>" + EQ.getAttr(tile, "name") + "</strong>");

	    		// is it bad?
	    		if (EQ.getAttr(tile, "enemy")) {
	    			var mobDef = parseInt(EQ.getAttr(tile, "defence-level"))
	    			EQ.info("It has <strong>" + mobDef + "</strong> defence", true);
	    			var diff = (Player.attackLevel / mobDef) * 100;
	    			if (diff < 50) {
	    				EQ.info("This enemy will be challenging", true);
	    			}
	    		}
	    	} else {
	    		EQ.info("There is nothing there");
	    	}
		}
	};

	window.EQ = EQ;
	window.Player = Player;

	window.addEventListener("load", function() {
		var editor = ace.edit("editor");
	    editor.setTheme("ace/theme/monokai");
	    editor.getSession().setMode("ace/mode/javascript");
	    EQ.editor = editor;
		EQ.onload();
	});
})(window, document);

(function() {
	var interval = {
	    // a reference to all intervals
	    intervals : {},

	    // create a new interval
	    make : function (fn, delay) {
	        var newInterval = setInterval.apply(
	            window,
	            [ fn, delay ].concat([].slice.call(arguments, 2))
	        );

	        this.intervals[newInterval] = true;

	        return newInterval;
	    },

	    // clear a single interval
	    clear : function (id) {
	        return clearInterval(this.intervals[id]);
	    },

	    // clear all intervals
	    clearAll : function () {
	        var all = Object.keys(this.intervals), len = all.length;

	        while ( len --> 0 ) {
	            clearInterval(all.shift());
	        }
	    }
	};

	class EQuest {
		constructor() {
			this.level  	= {};
			this.origLevel	= [];
			this.mapWidth	= 6;
			this.map 		= document.querySelector("#map");
			this.hud        = {
				hearts: document.querySelector("#hearts"),
				gems: document.querySelector('#gems')
			};

			this.player     = {};
			this.editor 	= null;
			this.gems   	= 0;
			this.prompt     = document.querySelector("#prompt > input");
			this.levelName  = document.querySelector('#level-title');
			EQuest.infoNode = document.querySelector("#log");
		}

		createRow() {
			let r = document.createElement("div");
			r.className = "row";
			this.map.appendChild(r);
			return r;
		}

		setAttr(e, k, v) {
			e.setAttribute("data-" + k, v);
		}

		getAttr(e, k) {
			return e.getAttribute("data-" + k);
		}

		createCol(root, n, i) {
			let isPath 		= false;
			let isPlayer 	= false;
			let isEnemy 	= false;
			let isGem       = false;
			let atkPower    = 0;
			let defPower	= 0;
			let health      = 0;
			let idx         = -1;
			let canPatrol   = false;
			let atkMod      = false;
			let defMod      = false;
			let toRoom      = -1;
			let name 		= "Unknown";

			let reDoor
			if (n == "@") {
					// The Player
					isPlayer = true;
					n 		 = "mage";
					idx   	 = 8;
					name 	 = "Player";
			} else if (n == "d") {
					// Player death
					isPlayer = true;
					n 		 = "skull";
					idx 	 = 10;
					name 	 = "Player";
			} else if (n == "x") {
					// Solid wall
					idx 	 = 12;
					n 		 = "tree";
					name 	 = "wall";
			} else if (n.substring(0, 1) == "e") {
					// Exit
					let found = n.match(/^e(\d+)/)
					idx 	 = 2;
					n 		 = "door";
					name 	 = "door";
					toRoom   = found[1];
			} else if (n == "g") {
					// Ghost
					isEnemy  = true;
					atkPower = 3;
					defPower = 5;
					health   = 6;
					n        = "ghost";
					idx 	 = 5;
					name     = "Ghost";
			} else if (n == "c") {
					// Crab
					isEnemy	 = true;
					atkPower = 2;
					defPower = 1;
					health   = 3;
					idx 	 = 1;
					n 		 = "crab";
					name     = "Crab";
			} else if (n == "k") {
					// Scorpion
					isEnemy	 = true;
					atkPower = 3;
					defPower = 1;
					health   = 3;
					idx 	 = 9;
					n 		 = "scorpion";
					name     = "Scorpion";
			} else if (n == "m") {
					// Monster
					isEnemy	 = true;
					canPatrol = true;
					atkPower = 1;
					defPower = 0;
					health   = 1;
					idx 	 = 7;
					n 		 = "jellyfish";
					name     = "Jellyfish";
			} else if (n == "f") {
					// Fire
					isEnemy  = true;
					atkPower = 1000;
					defPower = 9000;
					health   = 9000;
					idx 	 = 3;
					n 		 = "fire";
					name 	 = "fire";
			} else if (n == "s") {
					// Gemstone
					idx  	 = 4;
					n 		 = "gemstone";
					name 	 = "gemstone";
					isGem    = true;
			} else if (n == "=") {
					// Path
					isPath 	 = true;
					n 	   	 = "::";
					name   	 = "path";
			} else if (n == "a4") {
					// Attack modifier
					atkMod 	 = {
						value: 4
					};
					idx      = 0;
					n 		 = "bolt";
					name 	 = "attack powerup";
			} else {
					// Unknown characters fill with solid wall
					idx 	 = 12;
					n 		 = "tree";
					name 	 = "wall";
			} // End switch

			let r = document.createElement("div");
			this.setAttr(r, "tile", i);
			r.className = "two columns";

			if (isPath) {
				r.className = r.className + " isPath";
			} else if (isEnemy) {
				this.setAttr(r, "enemy", "true");
				this.setAttr(r, "attack-power", atkPower);
				this.setAttr(r, "defence-power", defPower);
				this.setAttr(r, "max-health", health);
				if (canPatrol) {
					this.setAttr(r, "patrol", "true");
					this.setAttr(r, "loc", i);
				}
			} else if (isPlayer) {
				r.className = r.className + " Player";
				this.setAttr(r, "loc", i);
			} else if (atkMod) {
				this.setAttr(r, "mod", "attack");
				this.setAttr(r, "val", atkMod.value);
			} else if (isGem) {
				this.setAttr(r, "gem", "true");
			} else if (toRoom) {
				this.setAttr(r, "door", toRoom);
			}

			this.setAttr(r, "name", name);
			//r.innerHTML = n;
			if (idx > -1) {
				let img = document.createElement("img");
				img.src = sprites.canvas.sprites[idx].src;
				img.className = "sprite";
				r.appendChild(img);
			} else {
				r.innerHTML = n;
			}
			root.appendChild(r);
			return r;
		}

		static info(t, nl=false) {
			EQuest.infoNode.innerHTML += "<br>" + t;
			EQuest.infoNode.scrollTop = EQuest.infoNode.scrollHeight;
		}

		updateMap() {
			// clear any intervals
			interval.clearAll();

			// fill hearts
			let hearts = "";
			let heartSrc = sprites.canvas.sprites[6].src;
			for (let i = 0; i < this.player.hearts; i++) {
				hearts += '<img class="sprite" src="' + heartSrc + '">';
			}
			this.hud.hearts.innerHTML = hearts;

			// clear map
			while (this.map.firstChild) {
				this.map.removeChild(this.map.firstChild);
			}

			// now create the map
			let room = this.level.rooms[this.level.currentRoom.number]
			let cells = room.length;
			let row   = this.createRow();
			for (let i = 0; i < cells; i++) {
				this.createCol(row, room[i], i);
				if (i > 0 && (i+1) % this.mapWidth === 0) {
					row = this.createRow();
				}
			}

			// gems
			let gemSrc = sprites.canvas.sprites[4].src;
			let gems = document.querySelectorAll("[data-gem='true']");
			this.gems = gems.length;
			let gemPrint = "";
			for (let i = 0; i < this.gems; i++) {
				gemPrint += '<img class="sprite" src="' + gemSrc + '">';
			}
			this.hud.gems.innerHTML = gemPrint;

			// patrolling enemies
			let patrols = document.querySelectorAll("[data-patrol='true']");
			if (patrols.length > 0) {
				let pLen = patrols.length;
				let dirs = ["north", "east", "south", "west"];
				let base = this;
				for (let i = 0; i < pLen; i++) {
					let m = patrols[i];
					let mloc = parseInt(patrols[i].getAttribute("data-loc"));
					interval.make(function() {
						// pick a direction to walk
						let dir = dirs[Math.floor(Math.random() * dirs.length)];
						switch(dir) {
							case "north": dir = (mloc - base.mapWidth); break;
							case "east" : dir = (mloc + 1); break;
							case "south": dir = (mloc + base.mapWidth); break;
							case "west" : dir = (mloc - 1); break;
						}

						// can we go that way?
						if (typeof room[dir] !== "undefined") {
							let tile = document.querySelector("[data-tile='" + dir + "']");
							let tileName = base.getAttr(tile, "name");
							if (tileName == "Player") {
								EQuest.info("You were squashed by <strong>" + base.getAttr(m, "name") + "</strong>");
								base.killPlayer();
								interval.clearAll();
							} else {
								if (tileName == "path") {
									room[dir] = "m";
									room[mloc] = "=";
									base.updateMap();
								}
							}
						}
					}, 5000);
				}
			}
		}

		moveDest(dest) {
			let tile = document.querySelector("[data-tile='" + dest + "']");
			if (this.getAttr(tile, "name") == "wall") {
				EQuest.info("I'm not walking into a wall");
			} else {
				let room = this.level.rooms[this.level.currentRoom.number];
				let curLoc = this.player.loc;
				// did we run over a powerup?
				if (room[dest] == "a4") {
					let aval = parseInt(this.getAttr(tile, "val"));
					this.player.attackPower = (this.player.attackPower + aval);
					EQuest.info("You picked up a <strong>lightning</strong> mod");
					EQuest.info("Your attack power is now <strong>" + this.player.attackPower + "</strong>", true);
				}

				let lastDestTile = room[dest];
				room[dest] = "@";
				room[curLoc] = "=";
				this.player.loc = dest;

				// oops, we hit a bad guy
				if (this.getAttr(tile, "enemy")) {
					let tileN = this.getAttr(tile, "name");
					this.player.hearts = 0;
					room[dest] = "d";
					EQuest.info("You walked into a <strong>" + tileN + "</strong> and died");
					this.player.isDead = true;
				}

				// hit a door
				if (this.getAttr(tile, "door")) {
					let roomNum = parseInt(this.getAttr(tile, "door"));
					this.level.currentRoom.number = (roomNum - 1);
					this.player.loc = this.level.rooms[this.level.currentRoom.number].indexOf("@");
				}

				if (lastDestTile == "s") {
					this.gems = (this.gems - 1);
					if (this.gems == 0) {
						EQuest.info("Congratulations, you found all the gemstones!");
						EQuest.info("Click <strong>Reset</strong> to play again, or load a new map", true);
						this.player.finishedMap = true;
					}
				}

				this.updateMap();
			}
		}

		resetGame() {
			this.level.rooms[this.level.currentRoom.number] = this.origLevel.slice();
			this.player.isDead = false;
			this.player.loc    = 7;
			this.player.hearts = 8;
			this.player.attackPower = 1;
			this.updateMap();
			EQuest.info("Let's try this again...");
		}

		// Player related stuff

		killPlayer() {
			let room = this.level.rooms[this.level.currentRoom.number];
			room[this.player.loc] = "d";
			this.player.isDead = true;
			this.updateMap();
			EQuest.info("You died!");
		}

		takeDamage(n) {
			if (n > 0) { this.player.hearts = this.player.hearts - n; }
			if (this.player.hearts > 0) { return n; }

			return false;
		}

		fightMob(mob, tile) {
			let mobDef 		= parseInt(this.getAttr(tile, "defence-power"));
			let mobAtk 		= parseInt(this.getAttr(tile, "attack-power"));
			let mobHealth 	= parseInt(this.getAttr(tile, "max-health"));
			let fighting = true;
			let base = this;
			let room = this.level.rooms[this.level.currentRoom.number];
			let combat = setInterval(function() {
				let playerRoll = Math.floor(Math.random() * (base.player.attackPower+1));
				let mobRoll    = Math.floor(Math.random() * (mobDef+1));
				if (playerRoll > mobRoll) {
					mobHealth = mobHealth - playerRoll;
					EQuest.info("You hit the <strong>" + mob + "</strong> for <strong>" + playerRoll + "</strong> damage");
					if (mobHealth < 1) {
						let str = "You slayed the <strong>" + mob + "</strong>";
						if (mobHealth < -15) {
							console.log(mobHealth);
							str = "You smashed the <strong>" + mob + "</strong> into dust";
						}
						EQuest.info(str);
						room[base.getAttr(tile, "tile")] = "=";
						base.updateMap();
						base.player.fighting = false;

						clearInterval(combat);
						return true;
					} else {
						EQuest.info("It has <strong>" + mobHealth + "</strong> remaining", true);
					}
				} else {

					// continue fighting
					if (playerRoll == mobRoll) {
						EQuest.info("The <strong>" + mob + "</strong> evaded your attack");
					} else {
						let damageTaken = base.player.takeDamage(Math.floor(Math.random() * mobAtk));
						if (damageTaken !== false) {
							if (damageTaken == 0) {
								EQuest.info("You dodged the <strong>" + mob + "'s</strong> attack");
							} else {
								EQuest.info("The <strong>" + mob + "</strong> hit you for <strong>" + damageTaken + "</strong> damage");
								base.updateMap();
							}
						} else {
							base.killPlayer();
							base.fighting = false;
							clearInterval(combat);
						}
					}
				}
			}, 3000);

			this.player.fighting = true;
			return true;
		}

		lookForMob(name, dest, mob) {
			mob = mob.toLowerCase();
			let tile = document.querySelector("[data-tile='" + dest + "']");
			if (this.getAttr(tile, "name").toLowerCase() == mob) {
				EQuest.info("Found a <strong>" + mob + "</strong> to the <strong>" + name + "</strong>. Preparing to attack");
				return tile;
			}

			return false;
		}

		attack(mob) {
			let dests = {
				north: 	(this.player.loc - this.mapWidth),
				east: 	(this.player.loc + 1),
				south: 	(this.player.loc + this.mapWidth),
				west: 	(this.player.loc - 1)
			};

			let canAttack = false;
			let canAttackTile;
			let base = this;
			for (let key in dests) {
				if (dests.hasOwnProperty(key)) {
					canAttackTile = this.lookForMob(key, dests[key], mob);
					if (canAttackTile) break;
				}
			};

			if (!canAttackTile) {
				EQuest.info("I can't find a <strong>" + mob + "</strong> to fight");
			} else {
				this.fightMob(mob, canAttackTile);
			}
		}

		move(d) {
			let dest 	= 0;
			let badWay 	= false;
			let curLoc  = this.player.loc;

			switch(d) {
				case "north": dest = (curLoc - this.mapWidth); break;
				case "east" : dest = (curLoc + 1); break;
				case "south": dest = (curLoc + this.mapWidth); break;
				case "west" : dest = (curLoc - 1); break;
				default:
					badWay = true;
					EQuest.info("I don't know how to move that way");
					break;
			}

			let room = this.level.rooms[this.level.currentRoom.number];
			if (typeof room[dest] !== "undefined") {
				this.moveDest(dest);
			} else {
				EQuest.info("I'm not walking into the void");
			}
		}

		look(d) {
			let t = 0;
			let loc = this.player.loc;
			switch(d.toLowerCase()) {
				case "north": t = (loc - this.mapWidth); break;
				case "east" : t = (loc + 1); break;
				case "south": t = (loc + this.mapWidth); break;
				case "west" : t = (loc - 1); break;
				default:
					EQuest.info("I'm not sure how to look that way");
					break;
			}

			if (t != 0) {
				let room = this.level.rooms[this.level.currentRoom.number];
				if (typeof room[t] !== "undefined") {
					let tile = document.querySelector("[data-tile='" + t + "']");
					EQuest.info("You see a <strong>" + this.getAttr(tile, "name") + "</strong>");

					// is it an enemy?
					if (this.getAttr(tile, "enemy")) {
						let mobDef = parseInt(this.getAttr(tile, "defence-power"));
						EQuest.info("It has <strong>" + mobDef + "</strong> defence", true);
						let diff = (this.player.attackPower / mobDef) * 100;
						if (diff < 50) {
							EQuest.info("This enemy will be challenging", true);
						}
					}
				} else {
					EQuest.info("There is nothing there");
				}
			}
		}
	}

	let e = new EQuest();

	class Player {
		constructor(eq) {
			this.eq 		 = eq;
			this.loc 		 = 7;
			this.isDead 	 = false;
			this.finishedMap = false;
			this.hearts		 = 8;
			this.attackPower = 1;
			this.fighting    = false;
		}

		move(d) { this.eq.move(d); }
		attack(m) { this.eq.attack(m); }
		takeDamage(n) { return this.eq.takeDamage(n); }
		look(d) { this.eq.look(d); }
	}

	e.player = new Player(e);
	window.eQuest = e;
	window.EQuest = EQuest;
})();

window.addEventListener("load", function() {
	eQuest.onload();
});
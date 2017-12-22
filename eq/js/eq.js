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
			this.level  	= [];
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
			EQuest.infoNode = document.querySelector("#info");
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
			let name 		= "Unknown";

			switch(n) {
				case "@":
					// The Player
					isPlayer = true;
					n 		 = "mage";
					idx   	 = 6;
					name 	 = "Player";
					break;
				case "d":
					// Player death
					isPlayer = true;
					n 		 = "&#9980";
					name 	 = "Player";
					break;
				case "x":
					// Solid wall
					idx 	 = 9;
					n 		 = "tree";
					name 	 = "wall";
					break;
				case "e":
					// Exit
					n 		 = "&#128682";
					name 	 = "door";
					break;
				case "g":
					// Ghost
					isEnemy  = true;
					atkPower = 3;
					defPower = 5;
					health   = 6;
					n        = "ghost";
					idx 	 = 3;
					name     = "Ghost";
					break;
				case "c":
					// Crab
					isEnemy	 = true;
					atkPower = 2;
					defPower = 1;
					health   = 3;
					idx 	 = 1;
					n 		 = "crab";
					name     = "Crab";
					break;
				case "m":
					// Monster
					isEnemy	 = true;
					canPatrol = true;
					atkPower = 2;
					defPower = 2;
					health   = 1;
					idx 	 = 5;
					n 		 = "jellyfish";
					name     = "Jellyfish";
					break;
				case "f":
					// Fire
					isEnemy  = true;
					atkPower = 1000;
					defPower = 9000;
					health   = 9000;
					n 		 = "&#128293";
					name 	 = "fire";
					break;
				case "s":
					// Gemstone
					idx  	 = 2;
					n 		 = "gemstone";
					name 	 = "gemstone";
					isGem    = true;
					break;
				case "=":
					// Path
					isPath 	 = true;
					n 	   	 = "::";
					name   	 = "path";
					break;
				case "a4":
					// Attack modifier
					atkMod 	 = {
						value: 4
					};
					idx      = 0;
					n 		 = "bolt";
					name 	 = "attack powerup";
					break;
				default:
					// Unknown characters fill with solid wall
					idx 	 = 9;
					n 		 = "tree";
					name 	 = "wall";
					break;
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
			if (nl) {
				EQuest.infoNode.innerHTML += "<br>" + t;
			} else {
				EQuest.infoNode.innerHTML = t;
			}
		}

		updateMap() {
			// clear any intervals
			interval.clearAll();

			// fill hearts
			let hearts = "";
			let heartSrc = sprites.canvas.sprites[4].src;
			for (let i = 0; i < this.player.hearts; i++) {
				hearts += '<img class="sprite" src="' + heartSrc + '">';
			}
			this.hud.hearts.innerHTML = hearts;

			// clear map
			while (this.map.firstChild) {
				this.map.removeChild(this.map.firstChild);
			}

			// now create the map
			let cells = this.level.length;
			let row   = this.createRow();
			for (let i = 0; i < cells; i++) {
				this.createCol(row, this.level[i], i);
				if (i > 0 && (i+1) % this.mapWidth === 0) {
					row = this.createRow();
				}
			}

			// gems
			let gemSrc = sprites.canvas.sprites[2].src;
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
						if (typeof base.level[dir] !== "undefined") {
							let tile = document.querySelector("[data-tile='" + dir + "']");
							let tileName = base.getAttr(tile, "name");
							if (tileName == "Player") {
								EQuest.info("You were squashed by <strong>" + base.getAttr(m, "name") + "</strong>");
								setTimeout(function() {
									base.killPlayer();
									interval.clearAll();
								}, 1000);
							} else {
								if (tileName == "path") {
									base.level[dir] = "m";
									base.level[mloc] = "=";
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
				let curLoc = this.player.loc;
				// did we run over a powerup?
				if (this.level[dest] == "a4") {
					let aval = parseInt(this.getAttr(tile, "val"));
					this.player.attackPower = (this.player.attackPower + aval);
					EQuest.info("You picked up a <strong>lightning</strong> mod");
					EQuest.info("Your attack power is now <strong>" + this.player.attackPower + "</strong>", true);
				}

				let lastDestTile = this.level[dest];
				this.level[dest] = "@";
				this.level[curLoc] = "=";
				this.player.loc = dest;

				// oops, we hit a bad guy
				if (this.getAttr(tile, "enemy")) {
					let tileN = this.getAttr(tile, "name");
					this.player.hearts = 0;
					this.level[dest] = "d";
					EQuest.info("You walked into a <strong>" + tileN + "</strong> and died");
					this.player.isDead = true;
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
			this.level = this.origLevel.slice();
			this.player.isDead = false;
			this.player.loc    = 7;
			this.player.hearts = 8;
			this.updateMap();
			EQuest.info("Let's try this again...");
		}

		// Player related stuff

		killPlayer() {
			this.level[this.player.loc] = "d";
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
			let combat = setInterval(function() {
				let playerRoll = Math.floor(Math.random() * (base.player.attackPower+1));
				let mobRoll    = Math.floor(Math.random() * (mobDef+1));
				if (playerRoll > mobRoll) {
					mobHealth = mobHealth - playerRoll;
					if (mobHealth < 1) {
						EQuest.info("You slayed the <strong>" + mob + "</strong>");
						base.level[base.getAttr(tile, "tile")] = "=";
						base.updateMap();
						base.player.fighting = false;

						if (typeof Game.onattackend !== "undefined") {
							try {
								Game.onattackend(mob, tile);
							} catch(err) {
								console.log("An error occurred in the onattackend callback: %s", err);
								clearInterval(combat);
								return true;
							}
						}

						clearInterval(combat);
						return true;
					} else {
						EQuest.info("You hit the <strong>" + mob + "</strong> for <strong>" + playerRoll + "</strong> damage");
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
					canAttackTile = base.lookForMob(key, dests[key], mob);
					if (canAttackTile) break;
				}
			};

			if (canAttackTile === "undefined") {
				EQuest.info("I can't find a " + mob + " to fight");
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

			if (typeof this.level[dest] !== "undefined") {
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
				if (typeof this.level[t] !== "undefined") {
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
	let editor = ace.edit("editor");
	editor.setTheme("ace/theme/textmate");
	editor.getSession().setMode("ace/mode/javascript");
	eQuest.editor = editor;
	eQuest.onload();
});
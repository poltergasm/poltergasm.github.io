(function() {
	class EQuest {
		constructor() {
			this.level  	= [];
			this.origLevel	= [];
			this.mapWidth	= 6;
			this.map 		= document.querySelector("#map");
			EQuest.infoNode   = document.querySelector("#info");
			this.hud        = {
				hearts: document.querySelector("#hearts")
			};

			this.player = {};
			this.editor 	= null;
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
			let atkPower    = 0;
			let defPower	= 0;
			let name 		= "Unknown";

			switch(n) {
				case "@":
					// The Player
					isPlayer = true;
					n 		 = "&#129497";
					name 	 = "Player";
					break;
				case "d":
					// Player death
					isPlayer = true;
					n 		 = "&#9760";
					name 	 = "Player";
					break;
				case "x":
					// Solid wall
					n 		 = "&#127794";
					name 	 = "wall";
					break;
				case "e":
					// Exit
					n 		 = "&#9749";
					name 	 = "coffee";
					break;
				case "g":
					// Ghost
					isEnemy  = true;
					atkPower = 3;
					defPower = 5;
					n        = "&#128123";
					name     = "Ghost";
					break;
				case "c":
					// Crab
					isEnemy	 = true;
					atkPower = 2;
					defPower = 1;
					n 		 = "&#x1F980";
					name     = "Crab";
					break;
				case "f":
					// Fire
					isEnemy  = true;
					atkPower = 1000;
					defPower = 9000;
					n 		 = "&#128293";
					name 	 = "fire";
					break;
				case "s":
					// Gemstone
					n 		 = "&#128142";
					name 	 = "gemstone";
					break;
				case "=":
					// Path
					isPath 	 = true;
					n 	   	 = "::";
					name   	 = "path";
					break;
				default:
					// Unknown characters fill with solid wall
					n 		 = "&#127794";
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
			} else if (isPlayer) {
				r.className = r.className + " Player";
				this.setAttr(r, "loc", i);
			}

			this.setAttr(r, "name", name);
			r.innerHTML = n;
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
			// fill hearts
			let hearts = "";
			for (let i = 0; i < this.player.hearts; i++) {
				hearts += "&#x2764";
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
		}

		moveDest(dest) {
			let tile = document.querySelector("[data-tile='" + dest + "']");
			if (this.getAttr(tile, "name") == "wall") {
				EQuest.info("I'm not walking into a wall");
			} else {
				let curLoc = this.player.loc;
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
			let mobDef = parseInt(this.getAttr(tile, "defence-power"));
			let mobAtk = parseInt(this.getAttr(tile, "attack-power"));
			let fighting = true;
			let base = this;
			let combat = setInterval(function() {
				let playerRoll = Math.floor(Math.random() * (base.player.attackPower+1));
				let mobRoll    = Math.floor(Math.random() * (mobDef+1));

				if (playerRoll > mobRoll) {
					EQuest.info("You slayed the <strong>" + mob + "</strong>");
					base.level[base.getAttr(tile, "tile")] = "=";
					base.updateMap();
					base.player.fighting = false;

					if (typeof Game.onattackend !== "undefined") {
						Game.onattackend(mob);
					}

					clearInterval(combat);
					return true;
				}

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
	}

	let e = new EQuest();

	class Player {
		constructor(eq) {
			this.eq 		 = eq;
			this.loc 		 = 7;
			this.isDead 	 = false;
			this.hearts		 = 8;
			this.attackPower = 1;
			this.fighting    = false;
		}

		move(d) { this.eq.move(d); }
		attack(m) { this.eq.attack(m); }
		takeDamage(n) { return this.eq.takeDamage(n); }
	}

	e.player = new Player(e);
	window.EQuest = e;
})();

window.addEventListener("load", function() {
	let editor = ace.edit("editor");
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/javascript");
	EQuest.editor = editor;
	EQuest.onload();
});
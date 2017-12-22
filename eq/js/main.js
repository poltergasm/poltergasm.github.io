
eQuest.onload = function() {
	this.level =  ['x', 'x', 'x', 'x', 'x', 'x',
                 'x', '@', 'x', '=', 'm', 'x',
                 'x', '=', 'g', '=', '=', 'x',
                 'x', 'c', 'x', '=', '=', 'x',
                 'x', 'a4', 'x', 's', 's', 'x',
                 'x', 'x', 'x', 'x', 'x', 'x'];
    this.origLevel = this.level.slice();
    this.player.loc = 7;

    let base = this;
	this.updateMap();
	this.prompt.focus();
	this.prompt.addEventListener("keyup", function(e) {
		e.preventDefault();
		if (e.keyCode === 13) {
			let words = base.prompt.value;
			words = words.split(" ");
			if (words.length > 0) {
				if (base.player.isDead) {
					if (words[0] != "reload") {
						EQuest.info("You can't do that while you're dead. Try <strong>reload</strong>");
						base.prompt.value = "";
						return false;
					}
				}
			
				switch(words[0]) {
					case "north": base.player.move("north"); break;
					case "east" : base.player.move("east"); break;
					case "south": base.player.move("south"); break;
					case "west" : base.player.move("west"); break;
					case "attack":
						if (words.length < 2) {
							EQuest.info("What did you want me to attack exactly?");
						} else {
							base.attack(words[1]);
						}
						break;
					case "reload": base.resetGame(); break;
					default:
						EQuest.info("I don't understand <strong>" + words[0] + "</strong>");
				}
			}

			base.prompt.value = "";
		}
	});
};

let btnImport = document.querySelector('#submitMap');
let tipCard   = document.querySelectorAll('.tip-card');

btnImport.addEventListener('click', function(e) {
	let code = document.querySelector('#mapcode');
	if (code.value.length > 0) {
		let val = code.value;
		// make it acceptable for JSON.parse
		val = val.replace(/'/g, '"');
		let arr = JSON.parse(val);
		eQuest.level = arr;
		eQuest.origLevel = arr.slice();
		eQuest.player.loc = arr.indexOf('@');
		eQuest.updateMap();
	}

	e.preventDefault();
});

// create tip cards
let tipCardBody = document.querySelector('.tips-body');
let tipCardMenu = tipCardBody.innerHTML; // save a copy of the menu
let tipCardMenuNode = document.querySelector('#tip-card-menu');
let tipCardControl  = document.querySelector('.tip-card-control');
let tipCardControlMenu = document.querySelector('.tip-card-control a');
let currentTipCard  = null;

let tipsLen = tipCard.length;
for (let i = 0; i < tipsLen; i++) {
	tipCard[i].addEventListener("click", function() {
		let action = this.getAttribute("data-attr");
		currentTipCard = document.querySelector("#tip-" + action);
		if (currentTipCard) {
			tipCardMenuNode.style.display = "none";
			tipCardControl.style.display = "block";
			currentTipCard.style.display = "block";
		}
	});
}

tipCardControlMenu.addEventListener("click", function() {
	tipCardControl.style.display = "none";
	currentTipCard.style.display = "none";
	tipCardMenuNode.style.display = "block";
});
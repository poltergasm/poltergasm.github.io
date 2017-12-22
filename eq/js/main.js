
EQuest.onload = function() {
	this.level =  ['x', 'x', 'x', 'x', 'x', 'x',
                 'x', '@', 'x', '=', 'm', 'x',
                 'x', '=', 'g', '=', '=', 'x',
                 'x', 'c', 'x', '=', '=', 'x',
                 'x', 'a4', 'x', 'x', 's', 'x',
                 'x', 'x', 'x', 'x', 'x', 'x'];
    this.origLevel = this.level.slice();
    this.player.loc = 7;

	this.updateMap();
};

let btnRun = document.querySelector('#run');
let btnReset = document.querySelector('#reset');
let btnImport = document.querySelector('#submitMap');
let tipCard   = document.querySelectorAll('.tip-card');
btnRun.addEventListener('click', function() {
	if (EQuest.player.isDead) {
		EQuest.info("You can't do that while you're dead");
	} else {
    	let val = EQuest.editor.getValue();
    	val += "\nlet _g = new Game(EQuest.player); window.Game = _g;";
    	let fn = new Function(val);
    	fn();
    }
});

btnReset.addEventListener('click', function() {
	EQuest.resetGame();
});

btnImport.addEventListener('click', function(e) {
	let code = document.querySelector('#mapcode');
	if (code.value.length > 0) {
		let val = code.value;
		// make it acceptable for JSON.parse
		val = val.replace(/'/g, '"');
		let arr = JSON.parse(val);
		EQuest.level = arr;
		EQuest.origLevel = arr.slice();
		EQuest.player.loc = arr.indexOf('@');
		EQuest.updateMap();
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
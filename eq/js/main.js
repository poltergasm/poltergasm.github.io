
EQuest.onload = function() {
	this.level =  ['x', 'x', 'x', 'x', 'x', 'x',
                 'x', '@', 'x', 'x', 'f', 'x',
                 'x', '=', 'g', 'x', 'x', 'x',
                 'x', 'c', 'x', 'x', 'x', 'x',
                 'x', 'e', 'x', 'x', 'x', 'x'];
    this.origLevel = this.level.slice();
    this.player.loc = 7;

	this.updateMap();
};

var btnRun = document.querySelector('#run');
var btnReset = document.querySelector('#reset');
var btnImport = document.querySelector('#submitMap')
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
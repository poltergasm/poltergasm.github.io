
EQ.onload = function() {
	EQ.level =  ['x', 'x', 'x', 'x', 'x', 'x',
                 'x', '@', 'x', 'x', 'f', 'x',
                 'x', '=', 'g', 'x', 'x', 'x',
                 'x', 'c', 'x', 'x', 'x', 'x',
                 'x', 'e', 'x', 'x', 'x', 'x'];
    EQ.origLevel = EQ.level.slice();
    Player.loc = 7;

	EQ.updateMap();
};

var btnRun = document.querySelector('#run');
var btnReset = document.querySelector('#reset');
var btnImport = document.querySelector('#submitMap')
btnRun.addEventListener('click', function() {
	if (Player.isDead) {
		EQ.info("You can't do that while you're dead");
	} else {
    	var val = EQ.editor.getValue();
    	val += "\nMain();";
    	var fn = new Function(val);
    	fn();
    }
});

btnReset.addEventListener('click', function() {
	EQ.resetGame();
});

btnImport.addEventListener('click', function(e) {
	var code = document.querySelector('#mapcode');
	if (code.value.length > 0) {
		var val = code.value;
		// make it acceptable for JSON.parse
		val = val.replace(/'/g, '"');
		var arr = JSON.parse(val);
		EQ.level = arr;
		EQ.origLevel = arr.slice();
		Player.loc = arr.indexOf('@');
		EQ.updateMap();
	}

	e.preventDefault();
});
// gx related shit
gx.ready = function() {
	var jazz       = gx.Audio("assets/snd/jazz.ogg");
	var rain       = gx.Audio("assets/snd/rain.ogg");

	var spritesheet = gx.Spritesheet("assets/img/fireplace.png", {
		frameWidth: 640,
		frameHeight: 360,
		frames: 21
	});

	var fireplace = gx.Entity({
		name: "Fireplace",
		anim: spritesheet
	});

	gx.onload = function() {
		fireplace.render();
		jazz.play();
		rain.play();
	};

	gx.init();
};

// general javascript garbage for buttons
document.querySelector('#toggleJazz').onclick = function() {
	var d = this.getAttribute("data-attr");
	if (d == 'on') {
		this.setAttribute("data-attr", "off");
		this.innerHTML = "Toggle ON Jazz";
		jazz.pause();
	} else {
		this.setAttribute("data-attr", "on");
		this.innerHTML = "Toggle OFF Jazz";
		jazz.play();
	}
};

document.querySelector('#toggleRain').onclick = function() {
	var d = this.getAttribute("data-attr");
	if (d == 'on') {
		this.setAttribute("data-attr", "off");
		this.innerHTML = "Toggle ON Rain";
		rain.pause();
	} else {
		this.setAttribute("data-attr", "on");
		this.innerHTML = "Toggle OFF Rain";
		rain.play();
	}
};

document.querySelector('#runSlow').onclick = function() {
	var d = this.getAttribute("data-attr");
	if (d == 'on') {
		this.setAttribute("data-attr", "off");
		this.innerHTML = "Normal Mode";
		spritesheet.ticks = 8;
		fireplace.render(true);
	} else {
		this.setAttribute("data-attr", "on");
		this.innerHTML = "Slow Mode";
		spritesheet.ticks = 30;
		fireplace.render(true);
	}
};
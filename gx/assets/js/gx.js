var gx = function() {};

gx._getPixelRatio = function() {
	dpr = window.devicePixelRatio || 1,
    bsr = this.ctx.webkitBackingStorePixelRatio ||
          this.ctx.mozBackingStorePixelRatio ||
          this.ctx.msBackingStorePixelRatio ||
          this.ctx.oBackingStorePixelRatio ||
          this.ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
};

gx.setup = function() {
	// a place to store assets
	var canW = this.canvas.width;
	var canH = this.canvas.height;
	var ratio = this._getPixelRatio();

	this.assets 	= [];
	this.images     = [];
	this.audio      = [];
	this.imagePaths = [];
	this.canvas.width = canW * ratio;
	this.canvas.height = canH * ratio;
	this.canvas.style.width = canW + 'px';
	this.canvas.style.height = canH + 'px';
	if (typeof this.ready !== "undefined")
		this.ready();
};

gx.load = function() {
	// fill background to black
	this.ctx.fillStyle = '#000';
	this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	this.ctx.font = '32px "Russo One"';
	this.ctx.fillStyle = 'white';
	this.ctx.fillText('Loading assets...', 20, this.canvas.height/2);
};

gx.loadAssets = function() {
	var images = this.images;
	var audio  = this.audio;
	var assets = images.concat(audio);

	this.numberOfAssets = assets.length;
	this.assetsLoaded   = 0;

	var listenType = 'load';
	// because we can't access 'this' inside event listener
	var obj = this;

	for (var i = 0; i < this.numberOfAssets; i++) {
		var img = assets[i];
		if (img.tagName == 'IMG') listenType = 'load';
		if (img.tagName == 'AUDIO') listenType = 'canplaythrough';
		img.addEventListener(listenType, function(e) {
			console.log("Loaded %s", e.path[0].src);
			obj.assetsLoaded += 1;
			if (obj.assetsLoaded == obj.numberOfAssets) {
				obj.allAssetsLoaded();
			}

		}, true);
	}
};

gx.allAssetsLoaded = function() {
	console.log("All assets loaded (%d)", this.assetsLoaded);
	// check for onload function once all assets have been loaded
	if (typeof this.onload !== "undefined")
		this.onload();	
};

gx.setBackground = function(img) {
	this.ctx.drawImage(img, 0, 0, img.width, img.height,
		0, 0, this.canvas.width, this.canvas.height);
};

gx.init = function() {
	this.loadAssets();
};

gx.Image = function(i) {
	var img = new Image();
	img.src = i;
	this.images.push(img);
	return img;
};

gx.Spritesheet = function(i, o) {
	var img = this.Image(i);
	Object.keys(o).forEach(function(key) {
		img[key] = o[key];
	});

	return img;
};

gx.Audio = function(i) {
	var audio = new Audio(i);
	audio.load();
	this.audio.push(audio);
	return audio;
};

gx.Entity = function(o) {
	var g = this;
	var frames = o.anim['frames'] ? o.anim['frames'] : 21
	var currentFrame = 0;
	var ent = {
		game: g,
		render: function(u=false) {
			var ticks = o.anim['ticks'] ? o.anim['ticks'] : 30;
			if (u) {
				clearInterval(this.intval);
			}

			var intHandle = function() {
				return setInterval(function() {
					g.ctx.clearRect(0, 0, g.canvas.width, g.canvas.height);
					g.ctx.drawImage(
						o.anim,
						o.anim.frameWidth*currentFrame,
						0,
						o.anim.frameWidth,
						o.anim.frameHeight,
						0,
						0,
						g.canvas.width,
						g.canvas.height
					);

					currentFrame += 1;
					if (currentFrame == frames)
						currentFrame = 0;

				}, 1000/ticks);
			};

			this.intval = intHandle();
		}
	};
	Object.keys(o).forEach(function(key) {
		ent[key] = o[key];
	});

	return ent;
};

window.gx = gx;

(function(w, d) {
	w.addEventListener("load", function(e) {
		var ctx = false;
		var canvas = d.querySelector('#coue');
		if (canvas) {
			// store canvas and context into game object
			gx.canvas = canvas;
			gx.ctx    = canvas.getContext('2d');
		} else {
			// couldn't find canvas element
			console.error("Unable to locate canvas");
		}

		gx.setup();
		gx.load();
	});
})(window, document);
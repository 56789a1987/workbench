window.flappyGamePlaying = false;
window.playFlappyGame = function () {
	if (window.flappyGamePlaying)
		return;
	window.flappyGamePlaying = true;
	window.onFlappyGameStart && window.onFlappyGameStart();
	try {
		if (typeof window.audioCtx == "undefined") {
			window.audioCtx = new AudioContext();
		}
		var beep = function (freq, type, vol, dur) {
			var oscillator = audioCtx.createOscillator();
			var gainNode = audioCtx.createGain();
			oscillator.connect(gainNode);
			gainNode.connect(audioCtx.destination);
			oscillator.type = type;
			oscillator.frequency.value = parseInt(freq);
			gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
			gainNode.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + dur * .01);
			oscillator.start(audioCtx.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(1e-3, audioCtx.currentTime + dur);
			oscillator.stop(audioCtx.currentTime + dur);
		}
	} catch (e) { }
	var mute = false,
		playScoreSound = function () {
			if (mute) return;
			beep && beep(440 * Math.pow(2, 3 / 12), "square", .2, .8);
			beep && setTimeout(function () {
				beep(440 * Math.pow(2, 10 / 12), "square", .2, 1);
			}, 100);
		}
	setTimeout(function () {
		layer.style.opacity = 1;
		layer.style.transform = "scale(1,1)";
		playing = 0;
	}, 100);
	var exit = function () {
		document.body.removeChild(layer);
		document.removeEventListener("keydown", tap);
		document.body.style.overflow = "";
		playing = -1;
		window.onFlappyGameExit && window.onFlappyGameExit();
		window.flappyGamePlaying = false;
	}
	document.body.style.overflow = "hidden";
	var layer = document.createElement("div");
	with (layer.style) {
		position = "absolute";
		top = left = 0;
		height = width = "100%";
		zIndex = 999;
		transition = "all 1s";
		opacity = 0;
		transform = "scale(0,0)";
		fontFamily = "monospace";
		overflow = "hidden";
	}
	document.body.appendChild(layer);
	var gamelayer = document.createElement("div");
	with (gamelayer.style) {
		position = "absolute";
		top = left = 0;
		height = width = "100%";
	}
	layer.appendChild(gamelayer);
	var randcol = function () {
		return "hsl(" + parseInt(Math.random() * 360) + ",100%," + (30 + parseInt(Math.random() * 40)) + "%)";
	}
	var setBg = function () {
		var colors = ["200,100%,70%", "140,100%,75%", "60,100%,75%", "30,100%,75%", "300,100%,80%", "270,100%,80%"];
		layer.style.background = "linear-gradient(hsla(" + colors[parseInt(Math.random() * colors.length)] + ",.9), rgba(255,255,255,.75))";
	}
	setBg();
	var buttonlayer = document.createElement("div");
	with (buttonlayer.style) {
		position = "absolute";
		top = right = 0;
	}
	layer.appendChild(buttonlayer);
	var addButton = function (text, color, func) {
		var elem = document.createElement("div");
		with (elem.style) {
			margin = "5px 5px 0 0";
			border = "1px solid #FFF";
			float = "right";
			fontSize = "18px";
			padding = "5px";
			borderRadius = "5px";
			color = "#FFF";
			opacity = .8;
			cursor = "pointer";
			boxShadow = "1px 1px 2px rgba(0,0,0,.5)";
		}
		elem.style.background = color;
		elem.innerHTML = text;
		buttonlayer.appendChild(elem);
		var f = function (e) {
			e.preventDefault();
			e.cancelBubble = true;
			func();
		}
		elem.addEventListener("mousedown", f);
		elem.addEventListener("touchstart", f);
		return elem;
	}
	addButton("Quit", "#FF3300", function () {
		exit();
	});
	var pausebtn = addButton("Pause", "#666", function () {
		pause = !pause;
		pausebtn.style.background = pause ? "#FC0" : "#666";
		pausebtn.style.color = pause ? "#000" : "#FFF";
	});
	var mutebtn = addButton("Mute", "#666", function () {
		mute = !mute;
		mutebtn.style.background = mute ? "#FC0" : "#666";
		mutebtn.style.color = mute ? "#000" : "#FFF";
	});
	var scmeter = addButton("0", "#007FFF", function () { });
	buttonlayer.appendChild(document.createElement("br"));
	var animbtn = addButton("Lo-Fi", "#666", function () {
		anim = !anim;
		animbtn.style.background = anim ? "#FC0" : "#666";
		animbtn.style.color = anim ? "#000" : "#FFF";
	});
	var movebtn = addButton("Move", "#666", function () {
		move = !move;
		movebtn.style.background = move ? "#FC0" : "#666";
		movebtn.style.color = move ? "#000" : "#FFF";
	});
	var dragbtn = addButton("Drag", "#666", function () {
		drag = !drag;
		dragbtn.style.background = drag ? "#FC0" : "#666";
		dragbtn.style.color = drag ? "#000" : "#FFF";
	});
	var ty = 100,
		my = 0,
		ds = 0,
		sc = 0,
		playing = -1,
		time = 0;
	var pause = false,
		move = false,
		drag = false,
		anim = false;
	var player = document.createElement("div");
	with (player.style) {
		position = "absolute";
		left = "155px";
		top = (ty - 45) + "px";
		width = "90px";
		height = "80px";
		//background = "#FFF";
		backgroundImage = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAC0CAYAAABsb0igAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF+mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHhtcDpDcmVhdGVEYXRlPSIyMDE5LTEwLTAxVDE0OjU4OjQ2KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOS0xMC0wMVQxNTowNzowNSswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOS0xMC0wMVQxNTowNzowNSswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjMzQ0MzU2MC04NTk4LWIyNGYtYTg3Yi1iMWQ0YjA0MzBmMmIiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDoyMmIzZDQ0Ni03MGRkLTEyNDQtOGViMS05N2EwMWExMjEwODkiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpmZjVlNTQwMC01NWFiLTA2NGUtYTcyOC1hZjc4NGU2MGFkNGIiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmZmNWU1NDAwLTU1YWItMDY0ZS1hNzI4LWFmNzg0ZTYwYWQ0YiIgc3RFdnQ6d2hlbj0iMjAxOS0xMC0wMVQxNDo1ODo0NiswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpjMzQ0MzU2MC04NTk4LWIyNGYtYTg3Yi1iMWQ0YjA0MzBmMmIiIHN0RXZ0OndoZW49IjIwMTktMTAtMDFUMTU6MDc6MDUrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz696HRLAAAcnUlEQVR42u3dPY4dx7nGcVLJvZkCbUCAFIwFZUN6AYIEJU4UCLAjWYngjM4IMPQuJtYGvAJv4HIL3oKX4Lmskd7he+pU9+k+n91dvxr8wfkSAf5Vffp5qqv7vHh8fHwBAAAAANeABAAAAAAKCAAAAAAFBAAAAAAUEAAAAAAKCAAAAAAoIAAAAAAUEAAAAAAKCAAAAAAoIAAAAAB6KiDGtsabD1OCBf74MwzDMAwjDwVEgLmYO/7440+BMwzDMAwFRIC5WDAJZ4XH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')";
		backgroundPositionX = "-720px";
	}
	gamelayer.appendChild(player);
	var tap = function (e) {
		e.cancelBubble = true;
		e.preventDefault();
		if (playing == 0) playing = 1, frame();
		if (playing == 1 && !drag && !pause) {
			ds = -10;
			mute || beep && beep(440 * Math.pow(2, 3 / 12), "square", .06, .1);
		}
		if (playing == 2) {
			playing = 3;
			var lt = document.querySelectorAll(".flappy-bar").length,
				nw = 0;
			document.querySelectorAll(".flappy-bar").forEach(function (b) {
				nw++;
				setTimeout(function () {
					b.querySelector("#pipe_up").style.top = "-200%";
				}, nw * 200);
				setTimeout(function () {
					b.querySelector("#pipe_down").style.top = "100%";
				}, nw * 200 + 100);
				setTimeout(function () {
					gamelayer.removeChild(b);
				}, nw * 200 + 1100);
			});
			setTimeout(function () {
				if (playing == -1) return;
				playing = sc = time = ds = 0;
				ty = 100;
				scmeter.innerHTML = 0;
				frame();
				layer.style.transition = "";
				player.style.backgroundPositionY = 0;
				setBg();
				mute || beep && beep(440 * Math.pow(2, 3 / 12), "square", .06, .1);
			}, lt * 200 + 1200);
		}
	}
	layer.addEventListener("mousedown", tap);
	document.addEventListener("keydown", tap);
	layer.addEventListener("touchstart", function (e) {
		if (drag) my = e.touches[0].pageY;
		tap(e);
	});
	layer.addEventListener("mousemove", function (e) {
		if (drag) my = e.pageY;
	});
	layer.addEventListener("touchmove", function (e) {
		if (drag) my = e.touches[0].pageY;
	});
	var gameover = function () {
		playing = 2;
		player.style.backgroundPositionY = "-90px";
		layer.style.transition = "all .1s";
		for (var s = 0; s < 5; s++)(function () {
			var z = s;
			setTimeout(function () {
				layer.style.top = layer.style.left = (10 - z * 2.5) * (z % 2 == 1 ? 1 : -1) + "px";
			}, z * 100);
		})();
		if (navigator.vibrate && !mute) navigator.vibrate(500);
		if (mute) return;
		beep && beep(440 * Math.pow(2, -34 / 12), "square", .1, .7);
		beep && setTimeout(function () {
			beep(440 * Math.pow(2, -34 / 12), "square", .1, .7);
		}, 80);
	}
	var frame = function () {
		if (playing == 1 && pause) {
			requestAnimationFrame(frame);
			return false;
		}
		time++;
		var ww = layer.offsetWidth,
			wh = layer.offsetHeight;
		if (time % 90 == 45) {
			var bar = document.createElement("div"),
				bx = ww + 36,
				by = 120 + Math.random() * (wh - 240);
			bar.setAttribute("data-x", bx);
			bar.setAttribute("data-y", by);
			bar.setAttribute("data-move", Math.random() > .5 ? 1 : -1);
			bar.className = "flappy-bar";
			with (bar.style) {
				position = "absolute";
				width = "36px";
				height = "100%";
			}
			bar.style.left = bx + "px";
			bar.style.top = by + "px";
			gamelayer.appendChild(bar);
			var pipe_up = document.createElement("div"),
				pipe_down = document.createElement("div");
			pipe_up.id = "pipe_up", pipe_down.id = "pipe_down";
			with (pipe_up.style) {
				position = "absolute";
				height = width = "100%";
				left = 0;
				top = "-200%";
				opacity = 1;
				if (!anim) transition = "all 1s";
			}
			with (pipe_down.style) {
				position = "absolute";
				height = width = "100%";
				left = 0;
				top = "100%";
				opacity = 1;
				if (!anim) transition = "all 1s";
			}
			bar.appendChild(pipe_up), bar.appendChild(pipe_down);
			var pipe_up_l = document.createElement("div"),
				pipe_down_l = document.createElement("div");
			var pipe_up_b = document.createElement("div"),
				pipe_down_b = document.createElement("div");
			pipe_up_b.id = "pipe_up_b", pipe_down_b.id = "pipe_down_b";
			with (pipe_up_l.style) {
				position = "absolute";
				height = "100%";
				width = "8px";
				left = "14px";
				bottom = "24px";
				background = "linear-gradient(90deg, #CCC, #FFF)";
				border = "1px solid #999";
				boxSizing = "border-box";
				boxShadow = "0 0 4px rgba(0,0,0,.75)";
			}
			with (pipe_down_l.style) {
				position = "absolute";
				height = "100%";
				width = "8px";
				left = "14px";
				top = "24px";
				background = "linear-gradient(90deg, #CCC, #FFF)";
				border = "1px solid #999";
				boxSizing = "border-box";
				boxShadow = "0 0 4px rgba(0,0,0,.75)";
			}
			with (pipe_up_b.style) {
				position = "absolute";
				height = width = "48px";
				left = "-6px";
				bottom = 0;
				borderRadius = "50%";
				background = randcol();
				backgroundImage = "repeating-conic-gradient(" + randcol() + " 0 30deg, " + randcol() + " 0 60deg, " + randcol() + " 0 90deg)";
				boxShadow = "0 0 4px rgba(0,0,0,.75)";
			}
			with (pipe_down_b.style) {
				position = "absolute";
				height = width = "48px";
				left = "-6px";
				top = 0;
				borderRadius = "50%";
				background = randcol();
				backgroundImage = "repeating-conic-gradient(" + randcol() + " 0 30deg, " + randcol() + " 0 60deg, " + randcol() + " 0 90deg)";
				boxShadow = "0 0 4px rgba(0,0,0,.75)";
			}
			pipe_up.appendChild(pipe_up_l), pipe_down.appendChild(pipe_down_l);
			pipe_up.appendChild(pipe_up_b), pipe_down.appendChild(pipe_down_b);
			setTimeout(function () {
				pipe_up.style.top = "calc(-100% - 62px)", pipe_down.style.top = "62px";
			}, 10);
		}
		player.style.backgroundPositionX = -80 * (9 - parseInt(time / 4) % 10) + "px";
		player.style.transform = "rotate(" + (-Math.atan2(3, ds) / Math.PI * 180 + 90) / 3 + "deg)";
		if (drag) ds = (my - ty) * .1;
		else ds += .5;
		ty += ds;
		if (ty < 0) ty = ds = 0;
		if (ty > wh && playing != -1) gameover();
		document.querySelectorAll(".flappy-bar").forEach(function (b) {
			var bx = Number(b.getAttribute("data-x")),
				by = Number(b.getAttribute("data-y")),
				mv = Number(b.getAttribute("data-move"));
			bx -= 3;
			if (move) by += 2 * mv;
			if (by < 120 || by > wh - 120) mv = -mv;
			by > wh - 120 && (by = wh - 120);
			b.setAttribute("data-x", bx), b.setAttribute("data-y", by), b.setAttribute("data-move", mv);
			b.style.left = bx + "px", b.style.top = by + "px";
			if (!anim) b.querySelector("#pipe_up_b").style.transform = "rotate(-" + time + "deg)", b.querySelector("#pipe_down_b").style.transform = "rotate(" + time + "deg)";
			if (bx > 164 && bx < 200) {
				if (ty < by - 62 || ty > by + 62) {
					b.style.filter = "brightness(0)";
					playing != -1 && gameover();
				}
			}
			if (bx < 164 && !b.hasAttribute("data-pass")) {
				b.setAttribute("data-pass", 1);
				b.querySelector("#pipe_up").style.top = "calc(-100% - 150px)";
				b.querySelector("#pipe_down").style.top = "150px";
				b.querySelector("#pipe_up").style.opacity = b.querySelector("#pipe_down").style.opacity = .25;
				playScoreSound();
				sc++;
				scmeter.innerHTML = sc;
			}
			if (bx < -36) gamelayer.removeChild(b);
		});
		player.style.top = (ty - 45) + "px";
		if (playing == 1) requestAnimationFrame(frame);
	}
}

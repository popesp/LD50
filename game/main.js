import scene_mainmenu from "./scenes/mainmenu.js";
import scene_encounter from "./scenes/encounter/encounter.js";
import scene_shop from "./scenes/shop.js";
import scene_howtoplay from "./scenes/howtoplay.js";
import scene_rewards from "./scenes/rewards.js";
import {WIDTH_CANVAS, HEIGHT_CANVAS} from "./globals.js";


document.addEventListener("DOMContentLoaded", function()
{
	const dom_container = document.getElementById("container");

	const game = new Phaser.Game({
		type: Phaser.AUTO,
		title: "LD50",
		parent: dom_container,
		width: WIDTH_CANVAS,
		height: HEIGHT_CANVAS,
		scene: [scene_mainmenu, scene_encounter, scene_shop, scene_howtoplay, scene_rewards],
		backgroundColor: 0x0a0808
	});

	function resize()
	{
		let w = window.innerWidth;
		let h = window.innerHeight;

		const r = HEIGHT_CANVAS/WIDTH_CANVAS;

		if(w*r > window.innerHeight)
			w = Math.min(w, Math.ceil(h/r), WIDTH_CANVAS);
		h = Math.floor(w*r);

		dom_container.style.width = game.canvas.style.width = `${w}px`;
		dom_container.style.height = game.canvas.style.height = `${h}px`;
		dom_container.style.top = `${Math.floor((window.innerHeight - h)/2)}px`;
		dom_container.style.left = `${Math.floor((window.innerWidth - w)/2)}px`;
	}

	window.addEventListener("resize", resize);
	resize();
});
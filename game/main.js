const WIDTH_CANVAS = 1280;
const HEIGHT_CANVAS = 720;
const PADDING_CANVAS = 20;


const GameState = {
	unlocks: [],
	currency: 0,
	state_run: null
};


document.addEventListener("DOMContentLoaded", function()
{
	const dom_container = document.getElementById("container");

	const game = new Phaser.Game({
		type: Phaser.AUTO,
		title: "LD50",
		parent: dom_container,
		width: WIDTH_CANVAS,
		height: HEIGHT_CANVAS,
		scene: [main_menu, encounter_scene, upgrade_shop],
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
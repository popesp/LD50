const WIDTH_CANVAS = 1280;
const HEIGHT_CANVAS = 720;

const WIDTH_CARD = 150;
const HEIGHT_CARD = 210;


const CARD_DATA = [{
	name: "Restore Sanity",
	description: "Place this card on the bottom of your deck",
	type: "Action",
	effect: function(state, target)
	{

	}
}];

const state = {
	effects: [],
	hand: [CARD_DATA[0], CARD_DATA[0], CARD_DATA[0]],
	deck: new Array(10).fill(CARD_DATA[0]),
	energy: 1
};

const cardcontainers = [];


document.addEventListener("DOMContentLoaded", function()
{
	const dom_container = document.getElementById("container");

	const game = new Phaser.Game({
		type: Phaser.AUTO,
		title: "LD50",
		parent: dom_container,
		width: WIDTH_CANVAS,
		height: HEIGHT_CANVAS,
		scene: {
			preload: function()
			{
				this.load.image("card", "assets/card.png");
			},
			create: function()
			{
				const min = WIDTH_CANVAS*0.25;
				const max = WIDTH_CANVAS*0.75;

				for(let index_card = 0; index_card < state.hand.length; ++index_card)
				{
					const card = state.hand[index_card];
					const x = state.hand.length === 1 ? WIDTH_CANVAS/2 : min + index_card*(max - min)/(state.hand.length - 1);

					const cardsprite = this.add.image(0, 0, "card");
					cardsprite.setDisplaySize(WIDTH_CARD, HEIGHT_CARD);

					const cardname = this.add.text(0, 10 - HEIGHT_CARD/2, card.name, {color: "black", fontSize: "14px"});
					cardname.setOrigin(0.5, 0);

					const carddescription = this.add.text(0, 20, card.description, {color: "black", fontSize: "12px", align: "center", wordWrap: {width: WIDTH_CARD - 20}});
					carddescription.setOrigin(0.5, 0);

					cardcontainers.push(this.add.container(x, HEIGHT_CANVAS - 105, [cardsprite, cardname, carddescription]));
				}

				this.add.line(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, 0, 0, WIDTH_CANVAS, 0, "0xff0000");
				this.add.line(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, 0, 0, 0, HEIGHT_CANVAS, "0xff0000");

				// new Phaser.Line(min, handle1.y, min, handle2.y);
			},
			update: function()
			{
			}
		},
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
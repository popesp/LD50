const WIDTH_CANVAS = 1280;
const HEIGHT_CANVAS = 720;
const PADDING_CANVAS = 20;

const WIDTH_CARD = 150;
const HEIGHT_CARD = 210;

const PADDING_CARD = 10;
const OFFSET_DESCRIPTION = 20;
const SPACING_CARD = 20;


const state = {
	deck: [...new Array(4).fill(CARD_DATA[0]), ...new Array(4).fill(CARD_DATA[1])],
	player: {
		hand: [],
		deck: [],
		energy: 1
	},
	enemy: {
		hand: [],
		deck: [],
		energy: 1
	}
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
				const min_x = WIDTH_CANVAS/2 - (state.hand.length - 1)*(WIDTH_CARD/2 + SPACING_CARD/2);

				for(let index_card = 0; index_card < state.hand.length; ++index_card)
				{
					const card = state.hand[index_card];
					const x = min_x + index_card*(WIDTH_CARD + SPACING_CARD);

					const cardsprite = this.add.image(0, 0, "card");
					cardsprite.setDisplaySize(WIDTH_CARD, HEIGHT_CARD);

					const cardname = this.add.text(0, PADDING_CARD - HEIGHT_CARD/2, card.name, {color: "black", fontSize: "14px"});
					cardname.setOrigin(0.5, 0);

					const carddescription = this.add.text(0, OFFSET_DESCRIPTION, card.description, {color: "black", fontSize: "12px", align: "center", wordWrap: {width: WIDTH_CARD - PADDING_CARD*2}});
					carddescription.setOrigin(0.5, 0);

					cardcontainers.push(this.add.container(x, HEIGHT_CANVAS - HEIGHT_CARD/2 - PADDING_CANVAS, [cardsprite, cardname, carddescription]));
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
import {WIDTH_CANVAS, PADDING_CANVAS, FONT_DEFAULT} from "../globals.js";


const WIDTH_BACK_BUTTON = 200;
const HEIGHT_BACK_BUTTON = 50;

export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {"key": "how_to_play"});
	},
	create: function()
	{
		this.music = this.sound.add("spook");
		this.music.loop = true;
		this.music.play();

		// TITLE TEXT
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*2, "HOW TO PLAY", {fontFamily: FONT_DEFAULT, color: "white", fontSize: "40px"});
		title_text.setOrigin(0.5, 0);

		// Back Button
		const back_btn = this.add.image(0, 0, "back_arrow");
		back_btn.setOrigin(0);
		back_btn.setDisplaySize(WIDTH_BACK_BUTTON, HEIGHT_BACK_BUTTON);
		back_btn.setPosition(PADDING_CANVAS);
		back_btn.setInteractive({useHandCursor: true});
		back_btn.on("pointerdown", () =>
		{
			this.music.stop();
			this.scene.start("main_menu");
			this.sound.play("button-press");
		});

		// Text
		// "THE ELDRITCH HORRORS, WAKING FROM THEIR ETERNAL\n\
		// SLUMBER, HAVE BEGUN THEIR ASSAULT ON YOUR \nWORLD... IT IS UP TO YOU TO FIGHT BACK AND \nTRY TO DELAY THE INEVITABLE...\n\
		// \nGameplay:\n\
		const help_text = this.add.text(WIDTH_CANVAS/2, 200,
			"			Click on cards in your hand to play them\n\
			Cards cost one energy to play\n\
			Energy is set to one at the beginning of each turn\n\
			If you run out of cards in your deck before your opponent, you lose\n\
			Some cards create persistent effects on the field\n\
			Gain gold by defeating opponents and spend it in the shop\n\
			Cards purchased this way are permanently included in your deck\n\
			The Infinite always wins... or does it?",
			{fontFamily: FONT_DEFAULT, color: "white", fontSize: "24px", align: "left", lineSpacing: 20});
		help_text.setOrigin(0.5, 0);
	}
});
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
		const help_text = this.add.text(100, 200,
			"			Click on cards in your hand to play them\n\
			Every card cost 1 action energy to play\n\
			Try to make your opponent run out of cards before you do\n\
			Use STATIC cards to create persistent effects on the field\n\
			Gain gold by deating enemies and spend it in the CARD SHOP\n\
			But how can we defeat that which is INFINITE...",
			{fontFamily: FONT_DEFAULT, color: "white", fontSize: "24px"});
		help_text.setOrigin(0, 0);
	}
});
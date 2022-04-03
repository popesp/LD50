const WIDTH_BACK_BUTTON = 200;
const HEIGHT_BACK_BUTTON = 100;

const upgrade_shop = new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {"key": "upgrade_shop"});
	},
	preload: function()
	{
		this.load.image("back_arrow", "assets/back_arrow.png");
		this.load.audio("thumpy", "assets/music/thumpy.mp3");
	},
	create: function()
	{
		this.music = this.sound.add("thumpy");
		this.music.loop = true;
		this.music.play()
		// TITLE TEXT
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*2, "UPGRADE SHOP", {color: "white", fontSize: "40px"});
		title_text.setOrigin(0.5, 0);

		// Points remaining
		const points_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*2, "Points: " + GameState.currency, {color: "white", fontSize: "40px"});
		points_text.setOrigin(1, 0);
		points_text.setPosition(WIDTH_CANVAS - PADDING_CANVAS*2, PADDING_CANVAS*2);

		// Back Button
		const back_btn = this.add.image(0, 0, "back_arrow");
		back_btn.setOrigin(0);
		back_btn.setDisplaySize(WIDTH_BACK_BUTTON, HEIGHT_BACK_BUTTON);
		back_btn.setPosition(PADDING_CANVAS)
		back_btn.setInteractive({useHandCursor: true});
		back_btn.on("pointerdown", () => 
		{
			this.music.stop();
			this.scene.start("main_menu");
		});
	},
	update: function()
	{

	}
});
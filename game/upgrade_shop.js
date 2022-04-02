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
	},
	create: function()
	{
		// TITLE TEXT
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS, "UPGRADE SHOP", {color: "white", fontSize: "40px"});
		title_text.setOrigin(0.5);

		// Back Button
		const back_btn = this.add.image(0, 0, "back_arrow");
		back_btn.setOrigin(0);
		back_btn.setDisplaySize(WIDTH_BACK_BUTTON, HEIGHT_BACK_BUTTON);
		back_btn.setInteractive({useHandCursor: true});
		back_btn.on("pointerdown", () => this.scene.start("main_menu"));

		// const start_game_container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, [back_btn]);
		// start_game_container.setSize(WIDTH_START_BUTTON, HEIGHT_START_BUTTON);
		// start_game_container.setInteractive({useHandCursor: true});
		// start_game_container.on("pointerdown", () => this.scene.start("encounter_scene"));

		// gameObjects.push(end_turn_btn_container);


	},
	update: function()
	{

	}
});
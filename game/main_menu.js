const WIDTH_START_BUTTON = 200;
const HEIGHT_START_BUTTON = 50;

const WIDTH_UPGRADE_BUTTON = 200;
const HEIGHT_UPGRADE_BUTTON = 50;

let garbageBin = [];

function collectGarbage()
{
	// Clean up game objects
	for(const trash of garbageBin)
		trash.destroy();
	garbageBin = [];
}


const main_menu = new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {"key": "main_menu"});
	},
	preload: function()
	{
		this.load.image("end_turn_btn", "assets/end_turn_btn.png");
	},
	create: function()
	{
		// TITLE TEXT
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*6.66, "C'THULU RISING", {color: "white", fontSize: "40px"});
		title_text.setOrigin(0.5);

		// Start New Run Button
		const start_game_btn = this.add.image(0, 0, "end_turn_btn");
		start_game_btn.setDisplaySize(200, 50);
		const start_game_text = this.add.text(0, 0, "START NEW RUN", {color: "white", fontSize: "24px"});
		start_game_text.setOrigin(0.5);
		const start_game_container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, [start_game_btn, start_game_text]);
		start_game_container.setSize(WIDTH_START_BUTTON, HEIGHT_START_BUTTON);
		start_game_container.setInteractive({useHandCursor: true});
		garbageBin.push(start_game_container);

		start_game_container.on("pointerdown", () =>
		{
			// Clean up game objects
			for(const trash of garbageBin)
				trash.destroy();
			garbageBin = [];

			GameState.state_run = {
				source_deck: [...new Array(5).fill(CARD_DATA.self_reflection), ...new Array(9).fill(CARD_DATA.mind_blast), ...new Array(2).fill(CARD_DATA.taste_of_flesh)],
				// source_deck: [...new Array(5).fill(CARD_DATA.i_win)],
				index_encounter: 0,
				state_encounter: null
			};

			this.scene.start("encounter_scene");
		});

		// gameObjects.push(end_turn_btn_container);


		// Upgrade Shop Button
		const upgrade_shop_btn = this.add.image(0, 0, "end_turn_btn");
		upgrade_shop_btn.setDisplaySize(200, 50);
		const upgrade_shop_text = this.add.text(0, 0, "UPGRADE SHOP", {color: "white", fontSize: "24px"});
		upgrade_shop_text.setOrigin(0.5);
		const upgrade_shop_container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + HEIGHT_START_BUTTON*2, [upgrade_shop_btn, upgrade_shop_text]);
		upgrade_shop_container.setSize(WIDTH_UPGRADE_BUTTON, HEIGHT_UPGRADE_BUTTON);
		upgrade_shop_container.setInteractive({useHandCursor: true});
		garbageBin.push(upgrade_shop_container);
		upgrade_shop_container.on("pointerdown", () =>
		{
			// Clean up game objects
			for(const trash of garbageBin)
				trash.destroy();
			garbageBin = [];
			this.scene.start("upgrade_shop");
		});
	},
	update: function()
	{

	}
});
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
		// UI
		this.load.image("back_arrow", "assets/back_arrow.png");
		this.load.image("button", "assets/button.png");
		this.load.image("background", "assets/cthulhu.png")

		// Music
		this.load.audio("spook", "assets/music/spook.mp3");
		this.load.audio("thumpy", "assets/music/thumpy.mp3");
		this.load.audio("eldritchambience", "assets/music/eldritchambience.mp3");

		// Cards
		this.load.image("card", "assets/card_front.png");
		this.load.image("player_back", "assets/player_back.png");
		this.load.image("enemy_back", "assets/enemy_back.png");

		this.load.image("card_mind_blast", "assets/card-art/mind-blast.png");
		this.load.image("card_restore_sanity", "assets/card-art/restore-sanity.png");
		this.load.image("card_self_reflection", "assets/card-art/self-reflection.png");
		this.load.image("card_taste_of_flesh", "assets/card-art/taste-of-flesh.png");
		this.load.image("card_submit_to_madness", "assets/card-art/submit-to-madness.png");
		this.load.image("card_mind_worm", "assets/card-art/mind-worm.png");
		this.load.image("card_cosmic_insight", "assets/card-art/cosmic-insight.png");
		this.load.image("card_a_blank", "assets/card-art/a_blank.png");
		this.load.image("card_bump_in_the_night", "assets/card-art/bump-in-the-night.png");
		this.load.image("card_deja_vu", "assets/card-art/deja-vu.png");
		this.load.image("card_point_of_grace", "assets/card-art/point-of-grace.png");
		this.load.image("card_gaze_into_abyss", "assets/card-art/gaze-into-abyss.png");
		this.load.image("card_the_lighthouse", "assets/card-art/the-lighthouse.png");
		this.load.image("card_the_electric_chair", "assets/card-art/the-electric-chair.png");
		
	},
	create: function()
	{

		this.music = this.sound.add("spook");
		this.music.loop = true;
		this.music.play()
		this.add.image(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, "background")
		
		// TITLE TEXT
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*6.66, "C'THULHU RISING", {color: "white", fontSize: "40px"});
		title_text.setOrigin(0.5);

		// Start New Run Button
		const start_game_btn = this.add.image(0, 0, "button");
		start_game_btn.setDisplaySize(200, 50);
		const start_game_text = this.add.text(0, 0, "START NEW RUN", {color: "black", fontSize: "24px"});
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
				source_deck: [
					...new Array(5).fill(CARD_DATA.feed_the_queen),
					// ...new Array(10).fill(CARD_DATA.point_of_grace),
					// ...new Array(5).fill(CARD_DATA.gaze_into_the_abyss),
					// ...new Array(5).fill(CARD_DATA.deja_vu),
					// ...new Array(5).fill(CARD_DATA.self_reflection),
					// ...new Array(5).fill(CARD_DATA.mind_blast),
					...new Array(5).fill(CARD_DATA.mind_worm),
					...new Array(5).fill(CARD_DATA.maggot_infestation),
					...GameState.unlocks
				],
				index_encounter: 0,
				state_encounter: null
			};
			this.music.stop();
			this.scene.start("encounter_scene");
		});

		// gameObjects.push(button_container);


		// Upgrade Shop Button
		const upgrade_shop_btn = this.add.image(0, 0, "button");
		upgrade_shop_btn.setDisplaySize(200, 50);
		const upgrade_shop_text = this.add.text(0, 0, "CARD SHOP", {color: "black", fontSize: "24px"});
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
			this.music.stop();
			this.scene.start("upgrade_shop");
		});
	},
	update: function()
	{

	}
});
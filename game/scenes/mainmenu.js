import {WIDTH_CANVAS, HEIGHT_CANVAS, PADDING_CANVAS, FONT_DEFAULT, FONT_TITLE} from "../globals.js";
import {CARD_DATA} from "../data/cards.js";
import GameState from "../gamestate.js";


const WIDTH_START_BUTTON = 200;
const HEIGHT_START_BUTTON = 50;
const Y_START_BUTTON = -70;

const WIDTH_UPGRADE_BUTTON = 200;
const HEIGHT_UPGRADE_BUTTON = 50;


export default new Phaser.Class({
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
		this.load.image("background", "assets/main_bg.png");

		// Music
		this.load.audio("spook", "assets/music/spook.mp3");
		this.load.audio("thumpy", "assets/music/thumpy.mp3");
		this.load.audio("eldritchambience", "assets/music/eldritchambience.mp3");

		// Sounds
		this.load.audio("button-press", "assets/sounds/invalid-action.mp3");
		this.load.audio("pass_turn", "assets/sounds/button-press.mp3");

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
		this.load.image("card_blank", "assets/card-art/a-blank.png");
		this.load.image("card_bump_in_the_night", "assets/card-art/bump-in-the-night.png");
		this.load.image("card_deja_vu", "assets/card-art/deja-vu.png");
		this.load.image("card_point_of_grace", "assets/card-art/point-of-grace.png");
		this.load.image("card_gaze_into_abyss", "assets/card-art/gaze-into-abyss.png");
		this.load.image("card_the_lighthouse", "assets/card-art/the-lighthouse.png");
		this.load.image("card_the_electric_chair", "assets/card-art/the-electric-chair.png");
		this.load.image("card_hysteric_whisper", "assets/card-art/hysteric-whisper.png");
		this.load.image("card_spilled_beans", "assets/card-art/spilled-beans.png");
		this.load.image("card_eye_for_an_eye", "assets/card-art/eye-for-an-eye.png");
		this.load.image("card_shifting_shadows", "assets/card-art/shifting-shadows.png");
		this.load.image("card_the_inevitable", "assets/card-art/encroaching-mist.png");
		this.load.image("card_dark_expanse", "assets/card-art/dark-expanse.png");
		this.load.image("card_candles_flicker", "assets/card-art/candles-flicker.png");
		this.load.image("card_rope_burn", "assets/card-art/rope-burn.png");
		this.load.image("card_flawed_wisdom", "assets/card-art/flawed-wisdom.png");
		this.load.image("card_see_beyond", "assets/card-art/see-beyond.png");
		this.load.image("card_mind_flood", "assets/card-art/mind-flood.png");
		this.load.image("card_i_win", "assets/card-art/i-win.png");
	},
	create: function()
	{
		this.music = this.sound.add("spook");
		this.music.loop = true;
		this.music.play();

		// TITLE TEXT
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*6.66, "Cards of the Cosmos", {fontFamily: FONT_TITLE, color: "white", fontSize: "50px"});
		title_text.setOrigin(0.5);

		// Start New Run Button
		const start_game_btn = this.add.image(0, 0, "button");
		start_game_btn.setDisplaySize(200, 50);
		const start_game_text = this.add.text(0, 0, "Start New Run", {fontFamily: FONT_DEFAULT, color: "black", fontSize: "24px"});
		start_game_text.setOrigin(0.5);
		const start_game_container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2+Y_START_BUTTON, [start_game_btn, start_game_text]);
		start_game_container.setSize(WIDTH_START_BUTTON, HEIGHT_START_BUTTON);
		start_game_container.setInteractive({useHandCursor: true});

		start_game_container.on("pointerdown", () =>
		{
			this.sound.play("pass_turn");
			GameState.state_run = {
				source_deck: [
					...new Array(6).fill(CARD_DATA.mind_blast),
					...new Array(3).fill(CARD_DATA.self_reflection),
					...new Array(1).fill(CARD_DATA.hysteric_whisper),

					// ...new Array(50).fill(CARD_DATA.mind_blast),
					// ...new Array(100).fill(CARD_DATA.rope_burn),
					// ...new Array(20).fill(CARD_DATA.encroaching_mist),
					// ...new Array(5).fill(CARD_DATA.see_beyond),
					// ...new Array(5).fill(CARD_DATA.mind_flood),
					// ...new Array(5).fill(CARD_DATA.flawed_wisdom),
					// ...new Array(5).fill(
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
		const upgrade_shop_text = this.add.text(0, 0, "Card Shop", {fontFamily: FONT_DEFAULT, color: "black", fontSize: "24px"});
		upgrade_shop_text.setOrigin(0.5);
		const upgrade_shop_container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + HEIGHT_START_BUTTON*2+Y_START_BUTTON, [upgrade_shop_btn, upgrade_shop_text]);
		upgrade_shop_container.setSize(WIDTH_UPGRADE_BUTTON, HEIGHT_UPGRADE_BUTTON);
		upgrade_shop_container.setInteractive({useHandCursor: true});
		upgrade_shop_container.on("pointerdown", () =>
		{
			this.sound.play("button-press");
			this.music.stop();
			this.scene.start("upgrade_shop");
		});

		// How To Button
		const how_to_play_btn = this.add.image(0, 0, "button");
		how_to_play_btn.setDisplaySize(200, 50);
		const how_to_play_text = this.add.text(0, 0, "How To Play", {fontFamily: FONT_DEFAULT, color: "black", fontSize: "24px"});
		how_to_play_text.setOrigin(0.5);
		const how_to_play_container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + HEIGHT_START_BUTTON*4+Y_START_BUTTON, [how_to_play_btn, how_to_play_text]);
		how_to_play_container.setSize(WIDTH_UPGRADE_BUTTON, HEIGHT_UPGRADE_BUTTON);
		how_to_play_container.setInteractive({useHandCursor: true});
		how_to_play_container.on("pointerdown", () =>
		{
			this.scene.start("how_to_play");
			this.music.stop();
		});

		const credit_text = this.add.text(WIDTH_CANVAS/2, 650, "BY: DAN, MATT, STEPHEN, SHAWN & VNU", {fontFamily: FONT_DEFAULT, color: "white", fontSize: "20px"});
		credit_text.setOrigin(0.5);
	}
});
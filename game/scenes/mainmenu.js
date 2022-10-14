import {WIDTH_CANVAS, HEIGHT_CANVAS, PADDING_CANVAS, FONT_DEFAULT, FONT_TITLE} from "../globals.js";
import {CARD_DATA} from "../data/cards.js";
import GameState from "../gamestate.js";
import Phaser from "phaser";


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
		this.load.image("back_arrow", require("../assets/back_arrow.png").default);
		this.load.image("button", require("../assets/button.png").default);
		this.load.image("background", require("../assets/main_bg.png").default);
		this.load.image("menu_bg", require("../assets/menu_bg.png").default);

		// Music
		this.load.audio("spook", require("../assets/music/spook.mp3").default);
		this.load.audio("thumpy", require("../assets/music/thumpy.mp3").default);
		this.load.audio("eldritchambience", require("../assets/music/eldritchambience.mp3").default);

		// Sounds
		this.load.audio("button-press", require("../assets/sounds/invalid-action.mp3").default);
		this.load.audio("pass_turn", require("../assets/sounds/button-press.mp3").default);

		// Cards
		this.load.image("card", require("../assets/card_front.png").default);
		this.load.image("player_back", require("../assets/player_back.png").default);
		this.load.image("enemy_back", require("../assets/enemy_back.png").default);

		for(const key of Object.keys(CARD_DATA))
			this.load.image(`card_${key}`, require(`../assets/card-art/${key}.png`).default);
	},
	create: function()
	{
		this.music = this.sound.add("spook");
		this.music.loop = true;
		this.music.play();

		const bg = this.add.image(0, 0, "menu_bg");
		bg.setOrigin(0);
		bg.setDisplaySize(WIDTH_CANVAS, HEIGHT_CANVAS);
		bg.setPosition(0);

		this.add.rectangle(WIDTH_CANVAS/2, PADDING_CANVAS*6.66, 800, 100, "0x000000");

		// TITLE TEXT
		const title_text = this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*6.66, "CARDS OF THE COSMOS", {fontFamily: FONT_TITLE, color: "white", fontSize: "60px"});
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

			this.sound.play("button-press");
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
			this.sound.play("button-press");
			this.scene.start("how_to_play");
			this.music.stop();
		});

		const credit_text = this.add.text(WIDTH_CANVAS/2, 640, "BY: DAN, MATT, STEPHEN, SHAWN & VNU", {fontFamily: FONT_DEFAULT, color: "white", fontSize: "20px"});
		credit_text.setOrigin(0.5);
	}
});
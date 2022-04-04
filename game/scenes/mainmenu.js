import {WIDTH_CANVAS, HEIGHT_CANVAS, PADDING_CANVAS} from "../globals.js";
import {CARD_DATA} from "../data/cards.js";
import GameState from "../gamestate.js";


const WIDTH_BUTTON = 200;
const HEIGHT_BUTTON = 50;


const BUTTONS = [
	{
		label: "START NEW RUN",
		action: function(scene)
		{
			GameState.state_run = {
				source_deck: [
					// ...new Array(6).fill(CARD_DATA.mind_blast),
					// ...new Array(3).fill(CARD_DATA.self_reflection),
					// ...new Array(1).fill(CARD_DATA.hysteric_whisper),

					// ...new Array(50).fill(CARD_DATA.mind_blast),
					// ...new Array(100).fill(CARD_DATA.rope_burn),
					// ...new Array(20).fill(CARD_DATA.encroaching_mist),
					...new Array(5).fill(CARD_DATA.see_beyond),
					...new Array(5).fill(CARD_DATA.mind_flood),
					...new Array(5).fill(CARD_DATA.flawed_wisdom)
					// ...new Array(5).fill(
				],
				index_encounter: 0,
				state_encounter: null
			};

			scene.scene.start("encounter_scene");
		}
	},
	{
		label: "CARD SHOP",
		action: function(scene)
		{
			scene.scene.start("upgrade_shop");
		}
	},
	{
		label: "HOW TO PLAY",
		action: function(scene)
		{
			scene.scene.start("how_to_play");
		}
	}
];


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
		this.load.image("background", "assets/cthulhu.png");

		// Music
		this.load.audio("spook", "assets/music/spook.mp3");
		this.load.audio("thumpy", "assets/music/thumpy.mp3");
		this.load.audio("eldritchambience", "assets/music/eldritchambience.mp3");

		// Sounds
		this.load.audio("button-press", "assets/sounds/button-press.mp3");

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
		this.load.image("card_encroaching_mist", "assets/card-art/encroaching-mist.png");
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

		this.add.image(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, "background").displayWidth = WIDTH_CANVAS;
		this.add.text(WIDTH_CANVAS/2, PADDING_CANVAS*6.66, "INFINITE RISING", {color: "white", fontSize: "40px"}).setOrigin(0.5);

		// main menu buttons
		for(let index_button = 0; index_button < BUTTONS.length; ++index_button)
		{
			const button = BUTTONS[index_button];

			const container = this.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + HEIGHT_BUTTON*2*index_button, [
				this.add.image(0, 0, "button").setDisplaySize(WIDTH_BUTTON, HEIGHT_BUTTON),
				this.add.text(0, 0, button.label, {color: "black", fontSize: "24px"}).setOrigin(0.5)
			]);

			container.setSize(WIDTH_BUTTON, HEIGHT_BUTTON);
			container.setInteractive({useHandCursor: true});
			container.on("pointerdown", () =>
			{
				this.sound.play("button-press");
				this.music.stop();

				button.action(this);
			});
		}
	}
});
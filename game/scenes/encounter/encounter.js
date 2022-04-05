import Random from "../../random.js";
import {CARD_DATA, createCard} from "../../data/cards.js";
import {WIDTH_CANVAS, HEIGHT_CANVAS, PADDING_CANVAS, WIDTH_CARD, HEIGHT_CARD, FONT_DEFAULT} from "../../globals.js";
import {makeCardContainer} from "../../helpers.js";
import GameState from "../../gamestate.js";
import {drawCard, playCard, addPassive} from "./functions.js";
import {log} from "../../debug.js";


const X_DISCARD_PLAYER = WIDTH_CANVAS - WIDTH_CARD/2 - PADDING_CANVAS;
const Y_DISCARD_PLAYER = HEIGHT_CANVAS - HEIGHT_CARD/2 - PADDING_CANVAS;
const X_DISCARD_ENEMY = WIDTH_CANVAS - WIDTH_CARD/2 - PADDING_CANVAS;
const Y_DISCARD_ENEMY = HEIGHT_CARD/2 + PADDING_CANVAS;
const Y_HAND_PLAYER = HEIGHT_CANVAS - HEIGHT_CARD/2 - PADDING_CANVAS;
const Y_HAND_ENEMY = PADDING_CANVAS + HEIGHT_CARD/2;
const X_DECK_PLAYER = PADDING_CANVAS + WIDTH_CARD/2;
const Y_DECK_PLAYER = HEIGHT_CANVAS - PADDING_CANVAS - HEIGHT_CARD/2 - 0;
const X_DECK_ENEMY = PADDING_CANVAS + WIDTH_CARD/2;
const Y_DECK_ENEMY = PADDING_CANVAS + HEIGHT_CARD/2;
const X_PLAY_PLAYER = WIDTH_CANVAS/2 + 250;
const Y_PLAY_PLAYER = Y_HAND_PLAYER - 100;
const X_PLAY_ENEMY = WIDTH_CANVAS/2 + 250;
const Y_PLAY_ENEMY = Y_HAND_ENEMY + 100;

const OFFSET_DECKCOUNT = HEIGHT_CARD/2 + 5;

const WIDTH_END_BUTTON = 200;
const HEIGHT_END_BUTTON = 50;

const DEFAULT_HANDLIMIT = 5;
const DEFAULT_HANDSIZE = 2;
const DEFAULT_ENERGY = 1;


let gameObjects = [];

const ENCOUNTERS = [
	{
		name: "Grokthur's Demonic Embrace",
		source_deck: [
			...new Array(10).fill(CARD_DATA.bump_in_the_night)
		],
		starting_passives: [],
		bounty: 2
	},
	{
		name: "Demetrion's Horrid Palace",
		source_deck: [
			...new Array(2).fill(CARD_DATA.taste_of_flesh),
			...new Array(2).fill(CARD_DATA.bump_in_the_night),
			...new Array(8).fill(CARD_DATA.eye_for_an_eye)
		],
		starting_passives: [],
		bounty: 4
	},
	{
		name: "spooky",
		source_deck: [
			...new Array(5).fill(CARD_DATA.dark_expanse),
			...new Array(3).fill(CARD_DATA.taste_of_flesh),
			...new Array(2).fill(CARD_DATA.submit_to_madness)
		],
		starting_passives: [],
		bounty: 8
	},
	// {
	// 	name: "another guy",
	// 	source_deck: [
	// 		...new Array(30).fill(CARD_DATA.encroaching_mist)
	// 	],
	// 	starting_passives: [],
	// 	bounty: 32
	// },
	{
		name: "The End of All Things",
		source_deck: [
			...new Array(4).fill(CARD_DATA.the_inevitable),
			...new Array(2).fill(CARD_DATA.shifting_shadows)],
		starting_passives: [],
		bounty: 1
	}
];

function StateController(scene)
{
	this.scene = scene;
	this.node_current = null;
	this.root = {parent: null, queue: []};
}

StateController.prototype.wrap = function(child, tweenConfigs = [], fn, sound)
{
	const node = {fn, tweenConfigs, queue: [], parent: this.root, sound};

	if(child && this.node_current !== null)
	{
		node.parent = this.node_current;
		this.node_current.queue.push(node);
	}
	else if(this.node_current !== null)
		this.node_current.parent.queue.push(node);
	else
		this.root.queue.push(node);

	if(this.node_current === null)
		this.process(this.root);
};

StateController.prototype.process = function(parent)
{
	const controller = this;
	controller.node_current = parent.queue.shift() ?? null;
	if(controller.node_current === null)
	{
		if(parent.parent !== null)
			controller.process(parent.parent);

		return;
	}
	if(controller.node_current.tweenConfigs.length === 0)
	{
		log("no animations");
		controller.node_current.fn?.();

		if(controller.node_current.queue.length > 0)
			parent = controller.node_current;

		controller.node_current = null;
		controller.process(parent);
	}
	else
	{
		if(controller.node_current.sound)
			controller.scene.sound.play(controller.node_current.sound);
		let tweens_before = controller.node_current.tweenConfigs.map(config => controller.scene.tweens.add({
			...config,
			onComplete: function(tween)
			{
				tweens_before = tweens_before.filter(activetween => activetween !== tween);
				if(tweens_before.length === 0)
				{
					log("animation done");
					controller.node_current.fn?.();

					if(controller.node_current.queue.length > 0)
						parent = controller.node_current;

					controller.node_current = null;
					controller.process(parent);
				}
			}
		}));
	}
};

StateController.prototype.gameobj_card = function(card, x, y, pointerCallback, faceup = true)
{
	if(faceup)
	{
		const cardcontainer = makeCardContainer(this.scene, card, x, y);

		if(pointerCallback)
		{
			cardcontainer.setSize(WIDTH_CARD, HEIGHT_CARD);
			cardcontainer.setInteractive({useHandCursor: true});
			cardcontainer.on("pointerdown", pointerCallback);
		}

		return cardcontainer;
	}

	return this.scene.add.image(x, y, "enemy_back").setDisplaySize(WIDTH_CARD, HEIGHT_CARD);
};

function enemyTurnLogic(state)
{
	if(!state.controller.node_current && state.caster_winner === null)
	{
		if(state.enemy.energy > 0 && state.enemy.hand.length > 0)
		{
			let card;
			if(state.enemy.deck < 2)
				card = state.enemy.hand.find((card) => card.name !== "Taste of Flesh");

			if(card === undefined)
				card = state.enemy.hand[Random.int(0, state.enemy.hand.length)];

			playCard(state, state.enemy, card);
		}
		else
			startTurn(state, state.player);
	}
}

function startEncounter(state_run, encounter, scene)
{
	if(state_run.state_encounter !== null)
	{
		state_run.state_encounter.player.hand.forEach(card => card.gameobj?.destroy());
		state_run.state_encounter.enemy.hand.forEach(card => card.gameobj?.destroy());
		state_run.state_encounter.player.discard_pile.forEach(card => card.gameobj?.destroy());
		state_run.state_encounter.enemy.discard_pile.forEach(card => card.gameobj?.destroy());
	}

	const state = {
		caster_current: null,
		caster_winner: null,
		needs_update: true,
		player: {
			name: "Player",
			hand: [],
			handlimit: DEFAULT_HANDLIMIT,
			deck: state_run.source_deck.map(createCard),
			discard_pile: [],
			energy: 1,
			skip_draw: false,
			turn_count: 0,
			X_DISCARD: X_DISCARD_PLAYER,
			Y_DISCARD: Y_DISCARD_PLAYER,
			Y_HAND: Y_HAND_PLAYER,
			X_DECK: X_DECK_PLAYER,
			Y_DECK: Y_DECK_PLAYER,
			X_PLAY: X_PLAY_PLAYER,
			Y_PLAY: Y_PLAY_PLAYER
		},
		enemy: {
			name: "Enemy",
			hand: [],
			handlimit: DEFAULT_HANDLIMIT,
			deck: encounter.source_deck.map(createCard),
			discard_pile: [],
			energy: 1,
			skip_draw: false,
			turn_count: 0,
			bounty: encounter.bounty,
			isFinalBoss: GameState.state_run.index_encounter === ENCOUNTERS.length - 1,
			X_DISCARD: X_DISCARD_ENEMY,
			Y_DISCARD: Y_DISCARD_ENEMY,
			Y_HAND: Y_HAND_ENEMY,
			X_DECK: X_DECK_ENEMY,
			Y_DECK: Y_DECK_ENEMY,
			X_PLAY: X_PLAY_ENEMY,
			Y_PLAY: Y_PLAY_ENEMY
		},
		triggers: {
			draw: [],
			mind_flood: [],
			see_beyond: [],
			discard: [],
			hand_size_discard: [],
			start_turn: []
		},
		passives: [],
		controller: new StateController(scene),
		turn_actions: 0
	};

	log("=== Starting encounter ===");

	Random.shuffle(state.player.deck);
	Random.shuffle(state.enemy.deck);

	// draw cards for players
	for(let i = 0; i < DEFAULT_HANDSIZE; ++i)
	{
		drawCard(state, state.player, false);
		drawCard(state, state.enemy, false);
	}

	for(const initial_passive of encounter.starting_passives)
		addPassive(state, state.enemy, initial_passive);

	startTurn(state, state.player);

	return state;
}

function startTurn(state, caster)
{
	caster.turn_count ++;
	state.turn_actions = 0;

	log(`Starting ${caster.name}'s turn`);

	// Increment bounty for final boss
	if(caster === state.enemy && state.enemy.isFinalBoss)
		state.enemy.bounty++;

	state.caster_current = caster;
	caster.energy = DEFAULT_ENERGY;

	for(const trigger of state.triggers.start_turn)
	{
		if(state.caster_winner !== null)
			return;
		trigger.effect(state, caster, trigger.owner);
	}
	//skip_draw is to handle electric chair, and setting it to false handles case where it is destroyed before next turn
	if(caster.skip_draw !== true)
		drawCard(state, caster, false);
	else
		caster.skip_draw = false;
	if(state.caster_winner !== null) // Winner has been determined
		return;
}

function redrawBoard(state_run, scene)
{
	const state = state_run.state_encounter;

	state.needs_update = false;
	// Clean up game objects
	for(const obj of gameObjects)
		obj.destroy();
	gameObjects = [];

	// player deck
	const player_deck_container = scene.add.container(
		PADDING_CANVAS + WIDTH_CARD/2,
		HEIGHT_CANVAS - PADDING_CANVAS - HEIGHT_CARD/2 - 0,
		[scene.add.text(0, -OFFSET_DECKCOUNT, state.player.deck.length, {fontFamily: FONT_DEFAULT, color: "#8c5114", fontSize: "72px"}).setOrigin(0.5, 1)]
	);
	if(state.player.deck.length > 0)
		player_deck_container.add(scene.add.image(0, 0, "player_back").setDisplaySize(WIDTH_CARD, HEIGHT_CARD));
	gameObjects.push(player_deck_container);

	// enemy deck
	const length_text = state.enemy.isFinalBoss ? "∞" : state.enemy.deck.length;
	const enemy_deck_container = scene.add.container(
		PADDING_CANVAS + WIDTH_CARD/2,
		PADDING_CANVAS + HEIGHT_CARD/2,
		[scene.add.text(0, OFFSET_DECKCOUNT, length_text, {fontFamily: FONT_DEFAULT, color: "#8c5114", fontSize: "72px"}).setOrigin(0.5, 0)]
	);
	if(state.enemy.deck.length > 0)
		enemy_deck_container.add(scene.add.image(0, 0, "enemy_back").setDisplaySize(WIDTH_CARD, HEIGHT_CARD));
	gameObjects.push(enemy_deck_container);

	// player discard
	if(state.player.discard_pile.length)
	{
		const player_discarded_card = state.player.discard_pile[state.player.discard_pile.length - 1];
		const cardcontainer = makeCardContainer(scene, player_discarded_card, X_DISCARD_PLAYER, Y_DISCARD_PLAYER);
		gameObjects.push(cardcontainer);
		cardcontainer.setDepth(1);
	}

	// enemy discard
	if(state.enemy.discard_pile.length)
	{
		const enemy_discarded_card = state.enemy.discard_pile[state.enemy.discard_pile.length - 1];
		const cardcontainer = makeCardContainer(scene, enemy_discarded_card, WIDTH_CANVAS - WIDTH_CARD/2 - PADDING_CANVAS, HEIGHT_CARD/2 + PADDING_CANVAS);
		gameObjects.push(cardcontainer);
		cardcontainer.setDepth(1);
	}

	// End Turn button
	if(state.caster_current === state.player)
	{
		const button = scene.add.image(0, 0, "button");
		button.setDisplaySize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);

		const end_text = scene.add.text(0, 0, "END TURN", {fontFamily: FONT_DEFAULT, color: "black", fontSize: "18px"});
		end_text.setOrigin(0.5);

		const end_turn_btn_container = scene.add.container(WIDTH_CANVAS - PADDING_CANVAS - WIDTH_END_BUTTON/2, HEIGHT_CANVAS/2, [button, end_text]);
		end_turn_btn_container.setSize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);
		if(!state.caster_winner)
		{
			end_turn_btn_container.setInteractive({useHandCursor: true});
			end_turn_btn_container.on("pointerdown", function()
			{
				if(!state.controller.node_current)
				{
					scene.sound.play("pass_turn");
					startTurn(state, state.enemy);
				}
			});
		}

		gameObjects.push(end_turn_btn_container);
	}

	// Energy display
	// player
	const player_energy_icon = scene.add.image(0, 0, "energy");
	player_energy_icon.setDisplaySize(75, 75);
	const player_energy_text = scene.add.text(15, 0, state.player.energy, {fontFamily: FONT_DEFAULT, color: "white", fontSize: "24px"});
	player_energy_text.setOrigin(0, 0.5);
	const player_energy_container = scene.add.container(WIDTH_CANVAS - PADDING_CANVAS - 50, HEIGHT_CANVAS/2 + 75, [player_energy_icon, player_energy_text]);
	gameObjects.push(player_energy_container);
	// enemy
	const enemy_energy_icon = scene.add.image(0, 0, "energy");
	enemy_energy_icon.setDisplaySize(75, 75);
	const enemy_energy_text = scene.add.text(15, 0, state.enemy.energy, {fontFamily: FONT_DEFAULT, color: "white", fontSize: "24px"});
	enemy_energy_text.setOrigin(0, 0.5);
	const enemy_energy_container = scene.add.container(WIDTH_CANVAS - PADDING_CANVAS - 50, HEIGHT_CANVAS/2 - 75, [enemy_energy_icon, enemy_energy_text]);
	gameObjects.push(enemy_energy_container);

	// Passive Display
	const player_passive_start = {
		x: WIDTH_CANVAS/2,
		y: HEIGHT_CANVAS/2 + 100
	};
	const enemy_passive_start = {
		x: WIDTH_CANVAS/2,
		y: HEIGHT_CANVAS/2 - 100
	};
	const player_passives = [];
	const enemy_passives = [];
	for(let index_passive = 0; index_passive < state.passives.length; ++index_passive)
	{
		const passive = state.passives[index_passive];
		if(passive.owner === state.player)
			player_passives.push(" " + passive.config.name);
		else
			enemy_passives.push(" " + passive.config.name);
	}

	gameObjects.push(scene.add.text(enemy_passive_start.x, enemy_passive_start.y, enemy_passives.toString(), {fontFamily: FONT_DEFAULT, color: "white", fontSize: "18px", align: "center"}).setOrigin(0.5));
	gameObjects.push(scene.add.text(player_passive_start.x, player_passive_start.y, player_passives.toString(), {fontFamily: FONT_DEFAULT, color: "white", fontSize: "18px", align: "center"}).setOrigin(0.5));

	if(state.caster_winner !== null)
		if(state.caster_winner === state.player)
		{
			let victory_text = "Victory! You claimed " + state.enemy.bounty + " gold.";

			if(GameState.state_run.index_encounter === ENCOUNTERS.length-1)
			{
				scene.sound.play("ticking");
				victory_text = "Congratulations! You have delayed the inevitable...for all time...";
				scene.cameras.main.fadeOut(10000, 0, 0, 0);
			}

			const game_end_text = scene.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, victory_text, {fontFamily: FONT_DEFAULT, color: "white", fontSize: "32px", align: "center"}).setOrigin(0.5);
			gameObjects.push(game_end_text);

			if(GameState.state_run.index_encounter !== ENCOUNTERS.length-1)
			{
				scene.sound.play("defeat_boss");
				const btn_next = scene.add.image(0, 0, "button");
				btn_next.setDisplaySize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);

				const text_next = scene.add.text(0, 0, "Next", {fontFamily: FONT_DEFAULT, color: "black", fontSize: "18px"});
				text_next.setOrigin(0.5);

				const btn_next_container = scene.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + 50, [btn_next, text_next]);
				btn_next_container.setSize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);
				btn_next_container.setInteractive({useHandCursor: true});
				btn_next_container.on("pointerdown", function()
				{
					scene.sound.play("pass_turn");
					state_run.index_encounter++;
					GameState.state_run.state_encounter = startEncounter(state_run, ENCOUNTERS[state_run.index_encounter], scene);
				});

				gameObjects.push(btn_next_container);
			}
		}
		else
		{
			const lose_text = state.enemy.isFinalBoss ? `You lost...but perhaps there is still hope.` : "You Lose";
			state.player.currency += state.enemy.bounty;
			const game_end_text = scene.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, lose_text, {fontFamily: FONT_DEFAULT, color: "white", fontSize: "32px", align: "center"}).setOrigin(0.5);
			gameObjects.push(game_end_text);

			const btn_menu = scene.add.image(0, 0, "button");
			btn_menu.setDisplaySize(WIDTH_END_BUTTON*2, HEIGHT_END_BUTTON);

			const text_menu = scene.add.text(0, 0, "Card Shop", {fontFamily: FONT_DEFAULT, color: "black", fontSize: "18px"});
			text_menu.setOrigin(0.5);

			const btn_menu_container = scene.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + 50, [btn_menu, text_menu]);
			btn_menu_container.setSize(WIDTH_END_BUTTON*2, HEIGHT_END_BUTTON);
			btn_menu_container.setInteractive({useHandCursor: true});
			btn_menu_container.on("pointerdown", () =>
			{
				scene.music.stop();
				scene.scene.start("upgrade_shop");
			});

			gameObjects.push(btn_menu_container);
		}
}


export default new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {"key": "encounter_scene"});
	},
	preload: function()
	{
		this.load.image("energy", "assets/energy.png");

		// Sounds
		this.load.audio("defeat_boss", "assets/sounds/defeat-boss.mp3");
		this.load.audio("draw_card", "assets/sounds/draw-card.mp3");
		this.load.audio("play_card", "assets/sounds/play-card.mp3");
		this.load.audio("remove_card", "assets/sounds/remove-card.mp3");
		this.load.audio("invalid_action", "assets/sounds/invalid-action.mp3");
		this.load.audio("ticking", "assets/sounds/ticking.mp3");
	},
	create: function()
	{
		const bg = this.add.image(0, 0, "background");
		bg.setOrigin(0);
		bg.setDisplaySize(WIDTH_CANVAS, HEIGHT_CANVAS);
		bg.setPosition(0);
		GameState.state_run.state_encounter = startEncounter(GameState.state_run, ENCOUNTERS[GameState.state_run.index_encounter], this);
		this.music = this.sound.add("eldritchambience", {volume: 0.75});
		this.music.loop = true;
		this.music.play();
		this.cameras.main.setBackgroundColor("#421278");
	},
	update: function()
	{
		const state = GameState.state_run.state_encounter;
		if(state.needs_update)
			redrawBoard(GameState.state_run, this);

		// AI start
		if(state.caster_current === state.enemy)
			enemyTurnLogic(state);
	}
});

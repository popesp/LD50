


const WIDTH_CARD = 150;
const HEIGHT_CARD = 210;
const WIDTH_CARDIMAGE = 94;
const HEIGHT_CARDIMAGE = 56;
const PADDING_CARD = 10;
const OFFSET_DESCRIPTION = 20;
const SPACING_CARD = 10;

const WIDTH_END_BUTTON = 100;
const HEIGHT_END_BUTTON = 50;

const DEFAULT_HANDLIMIT = 5;
const DEFAULT_HANDSIZE = 2;
const DEFAULT_ENERGY = 1;

let gameObjects = [];

const ENCOUNTERS = [
	{
		name: "Grokthur's Demonic Embrace",
		source_deck: [...new Array(4).fill(CARD_DATA.restore_sanity), ...new Array(4).fill(CARD_DATA.mind_blast), ...new Array(4).fill(CARD_DATA.submit_to_madness)],
		starting_passives: []
	},
	{
		name: "Demetrion's Horrid Palace",
		source_deck: [...new Array(4).fill(CARD_DATA.restore_sanity), ...new Array(4).fill(CARD_DATA.mind_blast), ...new Array(4).fill(CARD_DATA.submit_to_madness)],
		starting_passives: [PASSIVE_DATA.mind_worm]
	}
];

function determineWinner(state, caster)
{
	console.log(caster);
	if(caster === state.enemy)
		state.caster_winner = state.player;
	else
		state.caster_winner = state.enemy;
}

function shuffleDeck(deck)
{
	for(let i = deck.length - 1; i > 0; --i)
	{
		const j = Math.floor(Math.random()*(i+1));

		const tmp = deck[i];
		deck[i] = deck[j];
		deck[j] = tmp;
	}
}

function createCard(card_config)
{
	return {...card_config};
}

function enemyTurnLogic(state)
{
	while(state.enemy.energy > 0 && state.enemy.hand.length > 0)
	{
		playCard(state, state.enemy, state.enemy.hand[Math.floor(Math.random()*(state.enemy.hand.length))]);
	}

	startTurn(state, state.player);
}

function startEncounter(state_run, encounter)
{
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
			energy: 1
		},
		enemy: {
			name: "Enemy",
			hand: [],
			handlimit: DEFAULT_HANDLIMIT,
			deck: encounter.source_deck.map(createCard),
			discard_pile: [],
			energy: 1
		},
		triggers: {
			draw: [],
			discard: []
		},
		passives: []
	};

	console.log("=== Starting encounter ===");

	shuffleDeck(state.player.deck);
	shuffleDeck(state.enemy.deck);

	// draw cards for players
	for(let i = 0; i < DEFAULT_HANDSIZE; ++i)
	{
		drawCard(state, state.player);
		drawCard(state, state.enemy);
	}

	for(const initial_passive of encounter.starting_passives)
		addPassive(state, state.enemy, initial_passive);

	startTurn(state, state.player);

	return state;
}

function discardCard(state, caster, card)
{
	if(card !== undefined)
		caster.discard_pile.push(card);

	state.needs_update = true;
}

function getTopCard(state, caster)
{
	const card = caster.deck.pop();
	if(card === undefined)
		determineWinner(state, caster);

	return card;
}

function drawCard(state, caster)
{
	const card = getTopCard(state, caster);
	if(card === undefined) // GAME IS OVER
		return;

	if(caster.handlimit === caster.hand.length && card !== undefined)
		discardCard(state, caster, card);
	else if(card !== undefined)
	{
		console.log(`${caster.name} drew a ${card.name}`);
		caster.hand.push(card);
	}

	state.needs_update = true;
	for(const trigger of state.triggers.draw)
		trigger.effect(state, caster, trigger.owner);
}

function playCard(state, caster, card)
{
	if(caster.energy === 0 || state.caster_current !== caster)
		return;

	console.log(`${caster.name} played a ${card.name}`);
	caster.energy--;
	//Remove card from hand
	caster.hand = caster.hand.filter(handcard => handcard !== card);

	card.effect.bind(card)(state, caster);

	discardCard(state, caster, card);
}

function startTurn(state, caster)
{
	console.log(`Starting ${caster.name}'s turn`);

	state.caster_current = caster;
	caster.energy = DEFAULT_ENERGY;
	drawCard(state, caster);
	if(state.caster_winner !== null) // Winner has been determined
		return;

	// AI start
	if(state.caster_current === state.enemy)
		enemyTurnLogic(state);
}

function makeCardContainer(scene, card, x, y)
{
	const cardsprite = scene.add.image(0, 0, "card");
	cardsprite.setDisplaySize(WIDTH_CARD, HEIGHT_CARD);

	const cardimage = scene.add.image(0, -20, `card_${card.key}`);
	cardimage.setDisplaySize(WIDTH_CARDIMAGE, HEIGHT_CARDIMAGE);

	const cardname = scene.add.text(0, PADDING_CARD - HEIGHT_CARD/2, card.name, {color: "black", fontSize: "14px"});
	cardname.setOrigin(0.5, 0);

	const carddescription = scene.add.text(0, OFFSET_DESCRIPTION, card.description, {color: "black", fontSize: "12px", align: "center", wordWrap: {width: WIDTH_CARD - PADDING_CARD*2}});
	carddescription.setOrigin(0.5, 0);

	const cardcontainer = scene.add.container(x, y, [cardsprite, cardimage, cardname, carddescription]);

	return cardcontainer;
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
	if(state.player.deck.length)
		gameObjects.push(scene.add.container(
			PADDING_CANVAS + WIDTH_CARD/2,
			HEIGHT_CANVAS - PADDING_CANVAS - HEIGHT_CARD/2 - 0,
			[
				scene.add.image(0, 0, "player_back").setDisplaySize(WIDTH_CARD, HEIGHT_CARD),
				scene.add.text(0, -PADDING_CARD - HEIGHT_CARD/2, state.player.deck.length, {color: "white", fontSize: "24px"}).setOrigin(0.5, 1)
			]
		));

	// enemy deck
	if(state.enemy.deck.length)
		gameObjects.push(scene.add.container(
			PADDING_CANVAS + WIDTH_CARD/2,
			PADDING_CANVAS + HEIGHT_CARD/2,
			[
				scene.add.image(0, 0, "enemy_back").setDisplaySize(WIDTH_CARD, HEIGHT_CARD),
				scene.add.text(0, PADDING_CARD + HEIGHT_CARD/2, state.enemy.deck.length, {color: "white", fontSize: "24px"}).setOrigin(0.5, 0)
			]
		));

	// player hand
	const min_x_player = WIDTH_CANVAS/2 - (state.player.hand.length - 1)*(WIDTH_CARD/2 + SPACING_CARD/2);
	for(let index_card = 0; index_card < state.player.hand.length; ++index_card)
	{
		const card = state.player.hand[index_card];
		const x = min_x_player + index_card*(WIDTH_CARD + SPACING_CARD);

		const cardcontainer = makeCardContainer(scene, card, x, HEIGHT_CANVAS - HEIGHT_CARD/2 - PADDING_CANVAS);
		cardcontainer.setSize(WIDTH_CARD, HEIGHT_CARD);
		cardcontainer.setInteractive({useHandCursor: true});
		cardcontainer.on("pointerdown", () => playCard(state, state.player, card));

		gameObjects.push(cardcontainer);
	}

	// enemy hand
	const min_x_enemy = WIDTH_CANVAS/2 - (state.enemy.hand.length - 1)*(WIDTH_CARD/2 + SPACING_CARD/2);
	for(let index_card = 0; index_card < state.enemy.hand.length; ++index_card)
	{
		const x = min_x_enemy + index_card*(WIDTH_CARD + SPACING_CARD);

		const cardsprite = scene.add.image(x, PADDING_CANVAS + HEIGHT_CARD/2, "enemy_back").setDisplaySize(WIDTH_CARD, HEIGHT_CARD);
		gameObjects.push(cardsprite);
	}

	// player discard
	if(state.player.discard_pile.length)
	{
		const player_discarded_card = state.player.discard_pile[state.player.discard_pile.length - 1];
		const cardcontainer = makeCardContainer(scene, player_discarded_card, WIDTH_CANVAS - WIDTH_CARD/2 - PADDING_CANVAS, HEIGHT_CANVAS - HEIGHT_CARD/2 - PADDING_CANVAS);
		gameObjects.push(cardcontainer);
	}

	// enemy discard
	if(state.enemy.discard_pile.length)
	{
		const enemy_discarded_card = state.enemy.discard_pile[state.enemy.discard_pile.length - 1];
		const cardcontainer = makeCardContainer(scene, enemy_discarded_card, WIDTH_CANVAS - WIDTH_CARD/2 - PADDING_CANVAS, HEIGHT_CARD/2 + PADDING_CANVAS);
		gameObjects.push(cardcontainer);
	}

	// End Turn button
	if(state.caster_current === state.player)
	{
		const end_turn_btn = scene.add.image(0, 0, "end_turn_btn");
		end_turn_btn.setDisplaySize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);

		const end_text = scene.add.text(0, 0, "END TURN", {color: "white", fontSize: "18px"});
		end_text.setOrigin(0.5);

		const end_turn_btn_container = scene.add.container(WIDTH_CANVAS - PADDING_CANVAS - WIDTH_END_BUTTON/2, HEIGHT_CANVAS/2, [end_turn_btn, end_text]);
		end_turn_btn_container.setSize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);
		end_turn_btn_container.setInteractive({useHandCursor: true});
		end_turn_btn_container.on("pointerdown", () => startTurn(state, state.enemy));

		gameObjects.push(end_turn_btn_container);
	}

	// Energy display
	// player
	const player_energy_icon = scene.add.image(0, 0, "energy");
	player_energy_icon.setDisplaySize(25, 25);
	const player_energy_text = scene.add.text(15, 0, state.player.energy, {color: "white", fontSize: "18px"});
	player_energy_text.setOrigin(0, 0.5);
	const player_energy_container = scene.add.container(WIDTH_CANVAS - PADDING_CANVAS - 50, HEIGHT_CANVAS/2 + 50, [player_energy_icon, player_energy_text]);
	gameObjects.push(player_energy_container);
	// enemy
	const enemy_energy_icon = scene.add.image(0, 0, "energy");
	enemy_energy_icon.setDisplaySize(25, 25);
	const enemy_energy_text = scene.add.text(15, 0, state.enemy.energy, {color: "white", fontSize: "18px"});
	enemy_energy_text.setOrigin(0, 0.5);
	const enemy_energy_container = scene.add.container(WIDTH_CANVAS - PADDING_CANVAS - 50, HEIGHT_CANVAS/2 - 50, [enemy_energy_icon, enemy_energy_text]);
	gameObjects.push(enemy_energy_container);

	// Passive Display
	const player_passive_start = {
		x: WIDTH_CANVAS/2 + 300,
		y: HEIGHT_CANVAS/2 + 50
	};
	const enemy_passive_start = {
		x: WIDTH_CANVAS/2 + 300,
		y: PADDING_CANVAS
	};
	for(let index_passive = 0; index_passive < state.passives.length; ++index_passive)
	{
		const passive = state.passives[index_passive];
		if(passive.owner === state.enemy)
			scene.add.text(enemy_passive_start.x, enemy_passive_start.y + (10 * index_passive), passive.config.name, {color: "white", fontSize: "12px", align: "center"});
		else
			scene.add.text(player_passive_start.x, player_passive_start.y + (10 * index_passive), passive.config.name, {color: "white", fontSize: "12px", align: "center"});
	}

	if(state.caster_winner !== null)
		if(state.caster_winner === state.player)
		{
			scene.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, "Encounter Complete", {color: "white", fontSize: "32px", align: "center"}).setOrigin(0.5);

			const btn_next = scene.add.image(0, 0, "end_turn_btn");
			btn_next.setDisplaySize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);

			const text_next = scene.add.text(0, 0, "Next", {color: "white", fontSize: "18px"});
			text_next.setOrigin(0.5);

			const btn_next_container = scene.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + 50, [btn_next, text_next]);
			btn_next_container.setSize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);
			btn_next_container.setInteractive({useHandCursor: true});
			btn_next_container.on("pointerdown", function()
			{
				state_run.index_encounter++;
				startEncounter(state_run, ENCOUNTERS[state_run.index_encounter]);
			});

			gameObjects.push(btn_next_container);
		}
		else
		{
			scene.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, "You Lose", {color: "white", fontSize: "32px", align: "center"}).setOrigin(0.5);

			const btn_menu = scene.add.image(0, 0, "end_turn_btn");
			btn_menu.setDisplaySize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);

			const text_menu = scene.add.text(0, 0, "Main Menu", {color: "white", fontSize: "18px"});
			text_menu.setOrigin(0.5);

			const btn_menu_container = scene.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + 50, [btn_menu, text_menu]);
			btn_menu_container.setSize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);
			btn_menu_container.setInteractive({useHandCursor: true});
			btn_menu_container.on("pointerdown", () => scene.scene.start("main_menu"));

			gameObjects.push(btn_menu_container);
		}
}


const encounter_scene = new Phaser.Class({
	Extends: Phaser.Scene,
	initialize: function()
	{
		Phaser.Scene.call(this, {"key": "encounter_scene"});
	},
	preload: function()
	{
		this.load.image("card", "assets/card.png");
		this.load.image("player_back", "assets/player_back.png");
		this.load.image("enemy_back", "assets/enemy_back.png");
		this.load.image("end_turn_btn", "assets/end_turn_btn.png");
		this.load.image("energy", "assets/energy.png");
		this.load.image("card_mind_blast", "assets/card-art/mind-blast.png");
		this.load.image("card_restore_sanity", "assets/card-art/restore-sanity.png");
	},
	create: function()
	{
		GameState.state_run.state_encounter = startEncounter(GameState.state_run, ENCOUNTERS[GameState.state_run.index_encounter]);
	},
	update: function()
	{
		if(GameState.state_run.state_encounter.needs_update)
			redrawBoard(GameState.state_run, this);
	}
});

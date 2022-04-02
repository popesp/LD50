
const PADDING_CANVAS = 20;

const WIDTH_CARD = 150;
const HEIGHT_CARD = 210;
const PADDING_CARD = 10;
const OFFSET_DESCRIPTION = 20;
const SPACING_CARD = 10;

const WIDTH_END_BUTTON = 100;
const HEIGHT_END_BUTTON = 50;

const DEFAULT_HANDLIMIT = 5;
const DEFAULT_HANDSIZE = 2;
const DEFAULT_ENERGY_MAX = 1;

let gameObjects = [];



const state = {
	needs_update: true,
	source_deck: [...new Array(2).fill(CARD_DATA[0]), ...new Array(2).fill(CARD_DATA[1]), ...new Array(2).fill(CARD_DATA[2]), ...new Array(4).fill(CARD_DATA[3])],
	current_caster: null,
	player: {
		name: "Player",
		hand: [],
		handlimit: DEFAULT_HANDLIMIT,
		deck: [],
		discard_pile: [],
		energy: 1,
		energy_max: DEFAULT_ENERGY_MAX
	},
	enemy: {
		name: "Enemy",
		hand: [],
		handlimit: DEFAULT_HANDLIMIT,
		deck: [],
		discard_pile: [],
		energy: 1,
		energy_max: DEFAULT_ENERGY_MAX
	},
	triggers: {}
};

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

function enemyTurnLogic()
{
	while(state.enemy.energy > 0)
	{
		playCard(state.enemy, state.enemy.hand[Math.floor(Math.random()*(state.enemy.hand.length))]);
	}

	startTurn(state.player);
}

function startEncounter()
{
	console.log("=== Starting encounter ===");

	// player
	state.player.deck = state.source_deck.map(createCard);
	shuffleDeck(state.player.deck);

	// enemy
	state.enemy.deck = [...new Array(4).fill(CARD_DATA[0]), ...new Array(4).fill(CARD_DATA[1]), ...new Array(4).fill(CARD_DATA[2])].map(createCard);
	shuffleDeck(state.enemy.deck);

	// draw cards for players
	for(let i = 0; i < DEFAULT_HANDSIZE; ++i)
	{
		drawCard(state.player);
		drawCard(state.enemy);
	}

	startTurn(state.player);
}

function discardCard(caster, card)
{
	caster.discard_pile.push(card);

	state.needs_update = true;
}

function drawCard(caster)
{
	const card = getTopCard(caster);

	if(caster.handlimit === caster.hand.length)
		discardCard(caster, card);
	else
		caster.hand.push(card);

	state.needs_update = true;
}

function getTopCard(caster)
{
	const card = caster.deck.pop();
	if(card === undefined)
	{
		// Determine_Winner();
	}

	return card;
}

function playCard(caster, card)
{
	if(caster.energy === 0 || state.current_caster !== caster)
		return;

	console.log(`${caster.name} played a ${card.name}`);
	caster.energy = caster.energy + -1;
	//Remove card from hand
	caster.hand = caster.hand.filter(handcard => handcard !== card);

	card.effect.bind(card)(state, caster);

	discardCard(caster, card);
}

function startTurn(caster)
{
	console.log("Starting turn for ", caster.name);

	state.current_caster = caster;
	caster.energy = caster.energy_max;
	drawCard(caster);

	// AI start
	if(state.current_caster === state.enemy)
		enemyTurnLogic();
}

function makeCardContainer(scene, card, x, y)
{
	const cardsprite = scene.add.image(0, 0, "card");
	cardsprite.setDisplaySize(WIDTH_CARD, HEIGHT_CARD);

	const cardname = scene.add.text(0, PADDING_CARD - HEIGHT_CARD/2, card.name, {color: "black", fontSize: "14px"});
	cardname.setOrigin(0.5, 0);

	const carddescription = scene.add.text(0, OFFSET_DESCRIPTION, card.description, {color: "black", fontSize: "12px", align: "center", wordWrap: {width: WIDTH_CARD - PADDING_CARD*2}});
	carddescription.setOrigin(0.5, 0);

	const cardcontainer = scene.add.container(x, y, [cardsprite, cardname, carddescription]);

	return cardcontainer;
}

function redrawBoard(scene)
{
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
		cardcontainer.setInteractive();
		cardcontainer.on("pointerdown", () => playCard(state.player, card));

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
	if(state.current_caster === state.player)
	{
		const end_turn_btn = scene.add.image(0, 0, "end_turn_btn");
		end_turn_btn.setDisplaySize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);

		const end_text = scene.add.text(0, 0, "END TURN", {color: "white", fontSize: "18px"});
		end_text.setOrigin(0.5);

		const end_turn_btn_container = scene.add.container(WIDTH_CANVAS - PADDING_CANVAS - WIDTH_END_BUTTON/2, HEIGHT_CANVAS/2, [end_turn_btn, end_text]);
		end_turn_btn_container.setSize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);
		end_turn_btn_container.setInteractive();
		end_turn_btn_container.on("pointerdown", () => startTurn(state.enemy));

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
	},
	create: function()
	{
		startEncounter();
	},
	update: function()
	{
		if(state.needs_update)
			redrawBoard(this);
	}
});
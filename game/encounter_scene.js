
const PADDING_CANVAS = 20;

const WIDTH_CARD = 150;
const HEIGHT_CARD = 210;

const PADDING_CARD = 10;
const OFFSET_DESCRIPTION = 20;
const SPACING_CARD = 20;

const DEFAULT_HANDLIMIT = 5;
const DEFAULT_HANDSIZE = 2;
const DEFAULT_ENERGY_MAX = 1;

let cardcontainers = [];



const state = {
	needs_update: true,
	source_deck: [...new Array(4).fill(CARD_DATA[0]), ...new Array(4).fill(CARD_DATA[1]), ...new Array(4).fill(CARD_DATA[2])],
	player: {
		name: 'Player',
		hand: [],
		handlimit: DEFAULT_HANDLIMIT,
		deck: [],
		discard_pile: [],
		energy: 1,
		energy_max: DEFAULT_ENERGY_MAX
	},
	enemy: {
		name: 'Enemy',
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

function startEncounter()
{
	console.log('Starting encounter...');
	// player
	state.player.deck = state.source_deck.map(createCard);


	shuffleDeck(state.player.deck);

	// enemy
	state.enemy.deck = [];
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
	console.log('Discarding card: ', card);
	caster.discard_pile.push(card);

	state.needs_update = true;
}

function drawCard(caster)
{
	const card = getTopCard(caster);
	console.log('Drawing card:', card);

	if(caster.handlimit === caster.hand.length)
		discardCard(caster, card);
	else
		caster.hand.push(card);

	state.needs_update = true;
}

function getTopCard(caster)
{
	const card = caster.deck.pop();
	console.log("Top card: ", card);
	if(card === undefined)
	{
		// Determine_Winner();
	}

	return card;
}

function playCard(caster, card)
{
	if(caster.energy === 0)
		return;

	console.log('Playing card:', card);
	caster.energy = caster.energy + -1;
	//Remove card from hand
	caster.hand = caster.hand.filter(handcard => handcard !== card);

	card.effect.bind(card)(state, caster);

	discardCard(caster, card);
}

function startTurn(caster)
{
	console.log('Starting turn for ', caster.name);
	caster.energy = caster.energy_max;
	drawCard(caster);
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
	for(const card of cardcontainers)
		card.destroy();
	cardcontainers = [];

	// Render cards
	const min_x = WIDTH_CANVAS/2 - (state.player.hand.length - 1)*(WIDTH_CARD/2 + SPACING_CARD/2);
	for(let index_card = 0; index_card < state.player.hand.length; ++index_card)
	{
		const card = state.player.hand[index_card];
		const x = min_x + index_card*(WIDTH_CARD + SPACING_CARD);

		const cardcontainer = makeCardContainer(scene, card, x, HEIGHT_CANVAS - HEIGHT_CARD/2 - PADDING_CANVAS);
		cardcontainer.setSize(WIDTH_CARD, HEIGHT_CARD);
		cardcontainer.setInteractive();
		cardcontainer.on('pointerdown', () => playCard(state.player, card));

		cardcontainers.push(cardcontainer);
	}

	// Discard piles
	if(state.player.discard_pile.length)
	{
		const player_discarded_card = state.player.discard_pile[state.player.discard_pile.length - 1];
		const cardcontainer = makeCardContainer(scene, player_discarded_card, WIDTH_CANVAS  - WIDTH_CARD/2 - PADDING_CANVAS, HEIGHT_CANVAS  - HEIGHT_CARD/2 - PADDING_CANVAS);
		cardcontainers.push(cardcontainer);
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
	},
	create: function()
	{
		startEncounter();

		// this.add.line(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, 0, 0, WIDTH_CANVAS, 0, "0xff0000");
		// this.add.line(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, 0, 0, 0, HEIGHT_CANVAS, "0xff0000");

		// new Phaser.Line(min, handle1.y, min, handle2.y);
	},
	update: function()
	{
		if(state.needs_update)
			redrawBoard(this);

	}
});
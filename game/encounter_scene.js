const WIDTH_CANVAS = 1280;
const HEIGHT_CANVAS = 720;
const PADDING_CANVAS = 20;

const WIDTH_CARD = 150;
const HEIGHT_CARD = 210;
const WIDTH_CARDIMAGE = 141;
const HEIGHT_CARDIMAGE = 85;
const PADDING_CARD = 5;
const OFFSET_DESCRIPTION = 15;
const SPACING_CARD = 10;

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

const WIDTH_END_BUTTON = 100;
const HEIGHT_END_BUTTON = 50;

const DEFAULT_HANDLIMIT = 5;
const DEFAULT_HANDSIZE = 2;
const DEFAULT_ENERGY = 1;

const random = new Random();

let gameObjects = [];

const ENCOUNTERS = [
	{
		name: "Grokthur's Demonic Embrace",
		source_deck: [
			...new Array(0).fill(CARD_DATA.taste_of_flesh),
			...new Array(10).fill(CARD_DATA.bump_in_the_night),
			...new Array(0).fill(CARD_DATA.submit_to_madness)],
		starting_passives: [],
		bounty: 1
	},
	{
		name: "Demetrion's Horrid Palace",
		source_deck: [...new Array(4).fill(CARD_DATA.taste_of_flesh), ...new Array(4).fill(CARD_DATA.bump_in_the_night), ...new Array(4).fill(CARD_DATA.submit_to_madness)],
		starting_passives: [PASSIVE_DATA.mind_worm],
		bounty: 2
	},
	{
		name: "The End of All Things",
		source_deck: [...new Array(4).fill(CARD_DATA.mind_blast)],
		starting_passives: [],
		bounty: 1
	}
];

function StateController(scene)
{
	this.scene = scene;
	this.queue = [];
	this.locked = false;
	this.command_current = null;
}

StateController.prototype.wrap = function(fn, tweenConfigs, guid)
{
	const command = this.queue.find(command => command.guid === guid);

	if(!command)
		this.queue.push({subcommands: [{fn, tweenConfigs}], guid});
	else
		command.subcommands.push({fn, tweenConfigs});

	if(!this.locked)
		this.process();
};

StateController.prototype.process = function()
{
	const controller = this;
	if(controller.queue.length === 0 && controller.command_current === null)
		return;

	if(controller.command_current === null)
		controller.command_current = controller.queue[0];

	controller.locked = true;

	const subcommand = controller.command_current.subcommands.pop();

	subcommand.tweens = subcommand.tweenConfigs.map(tweenConfig => controller.scene.tweens.add({
		...tweenConfig,
		onComplete: function(tween)
		{
			subcommand.tweens = subcommand.tweens.filter(activetween => activetween !== tween);
			if(subcommand.tweens.length === 0)
			{
				subcommand.fn();
				if(controller.command_current.subcommands.length === 0)
				{
					controller.queue.shift();
					controller.command_current = null;
				}

				controller.locked = false;
				controller.process();
			}
		}
	}));
};

StateController.prototype.gameobj_card = function(card, x, y, pointerCallback, faceup = true)
{
	if(faceup)
	{
		const cardsprite = this.scene.add.image(0, 0, "card");
		cardsprite.setDisplaySize(WIDTH_CARD, HEIGHT_CARD);

		const cardimage = this.scene.add.image(0, -41, `card_${card.key}`);
		cardimage.setDisplaySize(WIDTH_CARDIMAGE, HEIGHT_CARDIMAGE);

		const cardname = this.scene.add.text(0, PADDING_CARD - HEIGHT_CARD/2, card.name, {color: "black", fontSize: "14px"});
		cardname.setOrigin(0.5, 0);

		const carddescription = this.scene.add.text(0, OFFSET_DESCRIPTION, card.description, {color: "black", fontSize: "12px", align: "center", wordWrap: {width: WIDTH_CARD - PADDING_CARD*2}});
		carddescription.setOrigin(0.5, 0);

		const cardcontainer = this.scene.add.container(x, y, [cardsprite, cardimage, cardname, carddescription]);

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

function determineWinner(state, caster)
{
	console.log('Determining winner:', caster);
	if(caster === state.enemy)
	{
		state.caster_winner = state.player;
		GameState.currency += state.enemy.bounty;
	}
	else
		state.caster_winner = state.enemy;

	state.needs_update = true;
	console.log(`${state.caster_winner.name} won the game.`);
}

function createCard(card_config)
{
	return {...card_config};
}

function enemyTurnLogic(state)
{
	if(!state.controller.locked)
	{
		if(state.enemy.energy > 0 && state.enemy.hand.length > 0 && state.caster_winner === null)
			playCard(state, state.enemy, state.enemy.hand[Math.floor(Math.random()*(state.enemy.hand.length))]);
		else
			startTurn(state, state.player);
	}
}

function startEncounter(state_run, encounter, scene)
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
			energy: 1,
			skip_draw: false,
			X_DISCARD: X_DISCARD_PLAYER,
			Y_DISCARD: Y_DISCARD_PLAYER,
			Y_HAND: Y_HAND_PLAYER,
			X_DECK: X_DECK_PLAYER,
			Y_DECK: Y_DECK_PLAYER
		},
		enemy: {
			name: "Enemy",
			hand: [],
			handlimit: DEFAULT_HANDLIMIT,
			deck: encounter.source_deck.map(createCard),
			discard_pile: [],
			energy: 1,
			skip_draw: false,
			bounty: encounter.bounty,
			isFinalBoss: GameState.state_run.index_encounter === ENCOUNTERS.length - 1 ? true : false,
			X_DISCARD: X_DISCARD_ENEMY,
			Y_DISCARD: Y_DISCARD_ENEMY,
			Y_HAND: Y_HAND_ENEMY,
			X_DECK: X_DECK_ENEMY,
			Y_DECK: Y_DECK_ENEMY
		},
		triggers: {
			draw: [],
			discard: [],
			start_turn: []
		},
		passives: [],
		controller: new StateController(scene)
	};

	console.log("=== Starting encounter ===");

	random.shuffle(state.player.deck);
	random.shuffle(state.enemy.deck);

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

function discardCard(state, caster, card, guid)
{
	if(card !== undefined)
		state.controller.wrap(function()
		{
			caster.discard_pile.push(card);
			state.needs_update = true;
		}, [{
			targets: card.gameobj,
			ease: Phaser.Math.Easing.Cubic.InOut,
			duration: 1000,
			x: caster.X_DISCARD,
			y: caster.Y_DISCARD
		}], guid ?? random.identifier());
}

function randomcard()
{
	let keys = Object.keys(CARD_DATA);
	return CARD_DATA[keys[ keys.length * Math.random() << 0]];
};

function getTopCard(state, caster)
{
	let card;
	// Generate "infinite" deck for final boss
	if(caster.isFinalBoss)
		card = randomcard();
	else
		card = caster.deck.pop();

	if(card === undefined && state.caster_winner === null)
		determineWinner(state, caster);

	return card;
}

function drawCard(state, caster, guid)
{
	const card = getTopCard(state, caster);
	if(card === undefined) // GAME IS OVER
		return;

	guid = guid ?? random.identifier();
	const gameobj = state.controller.gameobj_card(card, caster.X_DECK, caster.Y_DECK, () => playCard(state, state.player, card), caster === state.player);
	card.gameobj = gameobj;

	state.controller.wrap(function()
	{
		if(caster.handlimit === caster.hand.length)
			discardCard(state, caster, card, guid);
		else
		{
			const min_x = WIDTH_CANVAS/2 - caster.hand.length*(WIDTH_CARD/2 + SPACING_CARD/2);
			state.controller.wrap(function()
			{
				console.log(`${caster.name} drew a ${card.name}`);
				caster.hand.push(card);

				state.needs_update = true;
				for(const trigger of state.triggers.draw)
					trigger.effect(state, caster, trigger.owner);
			}, [{
				targets: gameobj,
				ease: Phaser.Math.Easing.Cubic.InOut,
				duration: 200,
				x: min_x + caster.hand.length*(WIDTH_CARD + SPACING_CARD),
				y: caster.Y_HAND
			}, ...caster.hand.map(function(card, index_card)
			{
				return {
					targets: card.gameobj,
					ease: Phaser.Math.Easing.Cubic.InOut,
					duration: 200,
					x: min_x + index_card*(WIDTH_CARD + SPACING_CARD),
					y: caster.Y_HAND
				};
			})], guid);
		}
	}, [{
		targets: gameobj,
		ease: Phaser.Math.Easing.Cubic.Out,
		duration: 200,
		x: WIDTH_CANVAS/2,
		y: HEIGHT_CANVAS/2
	}], guid);
}

function playCard(state, caster, card, guid)
{
	if(caster.energy === 0 || state.caster_current !== caster || state.caster_winner !== null)
		return;

	caster.energy--;
	caster.hand = caster.hand.filter(handcard => handcard !== card);
	guid = guid ?? random.identifier();

	const min_x = WIDTH_CANVAS/2 - (caster.hand.length - 1)*(WIDTH_CARD/2 + SPACING_CARD/2);
	state.controller.wrap(function()
	{
		card.effect.bind(card)(state, caster, guid);
		console.log(`${caster.name} played a ${card.name}`);
		discardCard(state, caster, card);
	}, [{
		targets: card.gameobj,
		ease: Phaser.Math.Easing.Cubic.Out,
		duration: 200,
		x: WIDTH_CANVAS/2,
		y: HEIGHT_CANVAS/2
	}, ...caster.hand.map(function(card, index_card)
	{
		return {
			targets: card.gameobj,
			ease: Phaser.Math.Easing.Cubic.InOut,
			duration: 200,
			x: min_x + index_card*(WIDTH_CARD + SPACING_CARD),
			y: caster.Y_HAND
		};
	})], guid);
}

function startTurn(state, caster)
{
	console.log(`Starting ${caster.name}'s turn`);

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
		drawCard(state, caster);
	else
		caster.skip_draw = false;
	if(state.caster_winner !== null) // Winner has been determined
		return;
}

function makeCardContainer(scene, card, x, y)
{
	const cardsprite = scene.add.image(0, 0, "card");
	cardsprite.setDisplaySize(WIDTH_CARD, HEIGHT_CARD);

	const cardimage = scene.add.image(0, -41, `card_${card.key}`);
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
	const player_deck_container = scene.add.container(
		PADDING_CANVAS + WIDTH_CARD/2,
		HEIGHT_CANVAS - PADDING_CANVAS - HEIGHT_CARD/2 - 0,
		[scene.add.text(0, -PADDING_CARD - HEIGHT_CARD/2, state.player.deck.length, {color: "white", fontSize: "24px"}).setOrigin(0.5, 1)]
	);
	if(state.player.deck.length > 0)
		player_deck_container.add(scene.add.image(0, 0, "player_back").setDisplaySize(WIDTH_CARD, HEIGHT_CARD));
	gameObjects.push(player_deck_container);

	// enemy deck
	const length_text = state.enemy.isFinalBoss ? "∞" : state.enemy.deck.length;
	const font_size = state.enemy.isFinalBoss ? "40px" : "24px";
	const enemy_deck_container = scene.add.container(
		PADDING_CANVAS + WIDTH_CARD/2,
		PADDING_CANVAS + HEIGHT_CARD/2,
		// [scene.add.text(0, PADDING_CARD + HEIGHT_CARD/2, state.enemy.deck.length, {color: "white", fontSize: "24px"}).setOrigin(0.5, 0)]
		[scene.add.text(0, PADDING_CARD + HEIGHT_CARD/2, length_text, {color: "white", fontSize: font_size}).setOrigin(0.5, 0)]
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
		const button = scene.add.image(0, 0, "button");
		button.setDisplaySize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);

		const end_text = scene.add.text(0, 0, "END TURN", {color: "black", fontSize: "18px"});
		end_text.setOrigin(0.5);

		const end_turn_btn_container = scene.add.container(WIDTH_CANVAS - PADDING_CANVAS - WIDTH_END_BUTTON/2, HEIGHT_CANVAS/2, [button, end_text]);
		end_turn_btn_container.setSize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);
		if(!state.caster_winner)
		{
			end_turn_btn_container.setInteractive({useHandCursor: true});
			end_turn_btn_container.on("pointerdown", function()
			{
				if(!state.controller.locked)
					startTurn(state, state.enemy);
			});
		}

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
		y: HEIGHT_CANVAS/2 - 50
	};
	for(let index_passive = 0; index_passive < state.passives.length; ++index_passive)
	{
		const passive = state.passives[index_passive];
		if(passive.owner === state.enemy)
			gameObjects.push(scene.add.text(enemy_passive_start.x, enemy_passive_start.y + (10 * index_passive), passive.config.name, {color: "white", fontSize: "12px", align: "center"}));
		else
			gameObjects.push(scene.add.text(player_passive_start.x, player_passive_start.y + (10 * index_passive), passive.config.name, {color: "white", fontSize: "12px", align: "center"}));
	}

	if(state.caster_winner !== null)
		if(state.caster_winner === state.player)
		{
			const game_end_text = scene.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, "Victory! You claimed " + state.enemy.bounty + " gold.", {color: "white", fontSize: "32px", align: "center"}).setOrigin(0.5);
			gameObjects.push(game_end_text);

			const btn_next = scene.add.image(0, 0, "button");
			btn_next.setDisplaySize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);

			const text_next = scene.add.text(0, 0, "Next", {color: "black", fontSize: "18px"});
			text_next.setOrigin(0.5);

			const btn_next_container = scene.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + 50, [btn_next, text_next]);
			btn_next_container.setSize(WIDTH_END_BUTTON, HEIGHT_END_BUTTON);
			btn_next_container.setInteractive({useHandCursor: true});
			btn_next_container.on("pointerdown", function()
			{
				state_run.index_encounter++;
				GameState.state_run.state_encounter = startEncounter(state_run, ENCOUNTERS[state_run.index_encounter], scene);
			});

			gameObjects.push(btn_next_container);
		}
		else
		{
			const lose_text = state.enemy.isFinalBoss ? `You lost...but perhaps there is still hope. You gained ${state.enemy.bounty} gold.` : "You Lose";
			state.player.currency += state.enemy.bounty;
			const game_end_text = scene.add.text(WIDTH_CANVAS/2, HEIGHT_CANVAS/2, lose_text, {color: "white", fontSize: "32px", align: "center"}).setOrigin(0.5);
			gameObjects.push(game_end_text);

			const btn_menu = scene.add.image(0, 0, "button");
			btn_menu.setDisplaySize(WIDTH_END_BUTTON*2, HEIGHT_END_BUTTON);

			const text_menu = scene.add.text(0, 0, "Main Menu", {color: "black", fontSize: "18px"});
			text_menu.setOrigin(0.5);

			const btn_menu_container = scene.add.container(WIDTH_CANVAS/2, HEIGHT_CANVAS/2 + 50, [btn_menu, text_menu]);
			btn_menu_container.setSize(WIDTH_END_BUTTON*2, HEIGHT_END_BUTTON);
			btn_menu_container.setInteractive({useHandCursor: true});
			btn_menu_container.on("pointerdown", () => 
			{
				scene.music.stop();
				scene.scene.start("main_menu");
			});

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
		this.load.image("energy", "assets/energy.png");
	},
	create: function()
	{
		GameState.state_run.state_encounter = startEncounter(GameState.state_run, ENCOUNTERS[GameState.state_run.index_encounter], this);
		this.music = this.sound.add("eldritchambience");
		this.music.loop = true;
		this.music.play();
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

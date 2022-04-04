import {WIDTH_CANVAS, HEIGHT_CANVAS, WIDTH_CARD, HEIGHT_CARD, SPACING_CARD} from "../../globals.js";
import Random from "../../random.js";
import GameState from "../../gamestate.js";
import {createCard} from "../../data/cards.js";
import {log} from "../../debug.js";

const DURATION_DRAW = 300;
const DURATION_LIFT = 200;
const DURATION_DISCARD = 200;
const DURATION_PLAY = 800;
const DURATION_HAND = 300;
const SCALE_PLAY = 1.5;

const MAX_ACTION_SPEED_COUNT = 30;
const MIN_ACTION_SPEED_COUNT = 10;
const MAX_DURATION_MULTIPLIER = .2;

const MAX_ACTION_COUNT = 50;


function calculate_animation_duration(base_duration, num_actions)
{
	if(num_actions < MAX_ACTION_SPEED_COUNT && num_actions > MIN_ACTION_SPEED_COUNT)
		return base_duration * (1 - (((num_actions - MIN_ACTION_SPEED_COUNT)/(MAX_ACTION_SPEED_COUNT - MIN_ACTION_SPEED_COUNT)) * (1 - MAX_DURATION_MULTIPLIER)));
	else if(num_actions >= MAX_ACTION_SPEED_COUNT)
		return base_duration * MAX_DURATION_MULTIPLIER;

	return base_duration;
}

function determineWinner(state, caster)
{
	log(`Determining winner: ${caster}`);
	if(caster === state.enemy)
	{
		state.caster_winner = state.player;
		GameState.currency += state.enemy.bounty;
	}
	else
		state.caster_winner = state.enemy;

	state.needs_update = true;
	log(`${state.caster_winner.name} won the game.`);
}

export function getTopCard(state, caster, child)
{
	// Generate "infinite" deck for final boss
	const card = caster.isFinalBoss ? createCard(caster.deck[Random.int(0, caster.deck.length)]) : caster.deck.pop();
	if(card === undefined)
	{
		if(state.caster_winner === null)
			determineWinner(state, caster);
		return undefined;
	}

	card.gameobj = state.controller.gameobj_card(card, caster.X_DECK, caster.Y_DECK, () => playCard(state, state.player, card, false), caster === state.player);

	log(`queuing lift ${card.name} for ${caster.name}`);
	state.controller.wrap(child, [{
		targets: card.gameobj,
		ease: Phaser.Math.Easing.Cubic.Out,
		duration: calculate_animation_duration(DURATION_LIFT, state.turn_actions),
		x: WIDTH_CANVAS/2,
		y: HEIGHT_CANVAS/2
	}], null, "draw_card");

	return card;
}

export function discardCard(state, caster, card, child, activate_triggers = true)
{
	state.turn_actions++;

	if(card !== undefined)
	{
		card.gameobj.removeInteractive();

		log(`queuing discard ${card.name} for ${caster.name}`);
		state.controller.wrap(child, [{
			targets: card.gameobj,
			ease: Phaser.Math.Easing.Cubic.InOut,
			duration: calculate_animation_duration(DURATION_DISCARD, state.turn_actions),
			x: caster.X_DISCARD,
			y: caster.Y_DISCARD,
			displayWidth: WIDTH_CARD,
			displayHeight: HEIGHT_CARD
		}], function()
		{
			caster.discard_pile.push(card);

			if(activate_triggers)
				for(const trigger of state.triggers.discard)
				{
					if(state.caster_winner !== null)
						return;
					trigger.effect(state, caster, trigger.owner, child);
				}

			state.needs_update = true;
		}, "remove_card");
	}
}

export function addPassive(state, caster, passive)
{
	// TODO(shawn): animate this
	for(const trigger of passive.triggers)
		state.triggers[trigger.action].push({effect: trigger.effect, owner: caster});

	state.passives.push({owner: caster, config: passive});
}

export function drawCard(state, caster, child)
{
	state.turn_actions++;

	const card = getTopCard(state, caster, child);
	if(card === undefined) // GAME IS OVER
		return;

	if(caster === state.enemy && state.turn_actions > MAX_ACTION_COUNT) // Assume infinite loop is completed
	{
		state.caster_winner = state.player;
		return;
	}

	if(caster.handlimit === caster.hand.length)
	{
		discardCard(state, caster, card, child, false);
		state.controller.wrap(child, [], function()
		{

			for(const trigger of state.triggers.draw)
				trigger.effect(state, caster, trigger.owner, child);

			state.needs_update = true;
		});
	}
	else
	{
		const min_x = WIDTH_CANVAS/2 - caster.hand.length*(WIDTH_CARD/2 + SPACING_CARD/2);
		log(`${caster.name} drew a ${card.name}`);
		caster.hand.push(card);

		state.controller.wrap(child, [{
			targets: card.gameobj,
			ease: Phaser.Math.Easing.Cubic.InOut,
			duration: calculate_animation_duration(DURATION_DRAW, state.turn_actions),
			x: min_x + caster.hand.length*(WIDTH_CARD + SPACING_CARD),
			y: caster.Y_HAND
		}, ...caster.hand.map(function(card, index_card)
		{
			return {
				targets: card.gameobj,
				ease: Phaser.Math.Easing.Cubic.InOut,
				duration: calculate_animation_duration(DURATION_HAND, state.turn_actions),
				x: min_x + index_card*(WIDTH_CARD + SPACING_CARD),
				y: caster.Y_HAND
			};
		})], function()
		{
			for(const trigger of state.triggers.draw)
				trigger.effect(state, caster, trigger.owner, child);

			state.needs_update = true;
		});
	}
}

export function playCard(state, caster, card, child)
{
	state.turn_actions++;
	if(caster.energy === 0 || state.caster_current !== caster || state.caster_winner !== null)
		return;

	if(caster === state.enemy)
	{
		card.gameobj.destroy();
		card.gameobj = state.controller.gameobj_card(card, card.gameobj.x, card.gameobj.y, undefined, true);
	}

	caster.energy--;
	caster.hand = caster.hand.filter(handcard => handcard !== card);

	const min_x = WIDTH_CANVAS/2 - (caster.hand.length - 1)*(WIDTH_CARD/2 + SPACING_CARD/2);
	state.controller.wrap(child, [{
		targets: card.gameobj,
		ease: Phaser.Math.Easing.Cubic.Out,
		duration: calculate_animation_duration(DURATION_PLAY, state.turn_actions),
		x: caster.X_PLAY,
		y: caster.Y_PLAY,
		displayWidth: WIDTH_CARD*SCALE_PLAY,
		displayHeight: HEIGHT_CARD*SCALE_PLAY,
		depth: 1
	}, ...caster.hand.map(function(card, index_card)
	{
		return {
			targets: card.gameobj,
			ease: Phaser.Math.Easing.Cubic.In,
			duration: calculate_animation_duration(DURATION_HAND, state.turn_actions),
			x: min_x + index_card*(WIDTH_CARD + SPACING_CARD),
			y: caster.Y_HAND
		};
	})], function()
	{
		card.effect.bind(card)(state, caster, true);
		log(`${caster.name} played a ${card.name}`);
		discardCard(state, caster, card, false, false);
	}, "play_card");
}
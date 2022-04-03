import {WIDTH_CANVAS, HEIGHT_CANVAS, WIDTH_CARD, SPACING_CARD} from "../../globals.js";
import {randomCard} from "../../data/cards.js";
import GameState from "../../gamestate.js";
import Random from "../../random.js";
import {log} from "../../debug.js";

const DEFAULT_DURATION = 200;


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

export function getTopCard(state, caster, guid)
{
	// Generate "infinite" deck for final boss
	const card = caster.isFinalBoss ? randomCard() : caster.deck.pop();
	if(card === undefined && state.caster_winner === null)
		determineWinner(state, caster);

	card.gameobj = state.controller.gameobj_card(card, caster.X_DECK, caster.Y_DECK, () => playCard(state, state.player, card), caster === state.player);

	log(`queuing lift ${card.name} for ${caster.name}`);
	state.controller.wrap(function()
	{}, [{
		targets: card.gameobj,
		ease: Phaser.Math.Easing.Cubic.Out,
		duration: 200,
		x: WIDTH_CANVAS/2,
		y: HEIGHT_CANVAS/2
	}], guid ?? Random.identifier());

	return card;
}

export function discardCard(state, caster, card, guid)
{
	const anim_duration = caster.drawn_cards > 10 ? DEFAULT_DURATION*5 / (caster.drawn_cards-10) : DEFAULT_DURATION*5;

	if(card !== undefined)
	{
		card.gameobj.removeInteractive();

		log(`queuing discard ${card.name} for ${caster.name}`);
		state.controller.wrap(function()
		{
			caster.discard_pile.push(card);
			state.needs_update = true;
		}, [{
			targets: card.gameobj,
			ease: Phaser.Math.Easing.Cubic.InOut,
			duration: anim_duration,
			x: caster.X_DISCARD,
			y: caster.Y_DISCARD
		}], guid ?? Random.identifier());

		for(const trigger of state.triggers.discard)
		{
			if(state.caster_winner !== null)
				return;
			trigger.effect(state, caster, trigger.owner);
		}
	}
}

export function addPassive(state, caster, passive)
{
	// TODO(shawn): animate this
	for(const trigger of passive.triggers)
		state.triggers[trigger.action].push({effect: trigger.effect, owner: caster});

	state.passives.push({owner: caster, config: passive});
}

export function drawCard(state, caster, guid)
{
	//rope burn replacement effect
	if(caster.handlimit === caster.hand.length && state.triggers.hand_size_discard.length > 0)
	{
		log("in here");
		for(const trigger of state.triggers.hand_size_discard)
		{
			if(state.caster_winner !== null)
				return;
			trigger.effect(state, caster, trigger.owner);
		}
	}

	const card = getTopCard(state, caster, guid);
	if(card === undefined) // GAME IS OVER
		return;
	caster.drawn_cards++;
	if(caster === state.enemy && caster.drawn_cards > 100) // Assume infinite loop is completed
	{
		state.caster_winner = state.player;
		return;
	}
	const anim_duration = caster.drawn_cards > 10 ? DEFAULT_DURATION / (caster.drawn_cards-10) : DEFAULT_DURATION;

	guid = guid ?? Random.identifier();

	for(const trigger of state.triggers.draw)
		trigger.effect(state, caster, trigger.owner);

	if(caster.handlimit === caster.hand.length)
		discardCard(state, caster, card, guid);
	else
	{
		log(`${caster.name} drew a ${card.name}`);
		const min_x = WIDTH_CANVAS/2 - caster.hand.length*(WIDTH_CARD/2 + SPACING_CARD/2);
		caster.hand.push(card);

		state.controller.wrap(function()
		{

			state.needs_update = true;

		}, [{
			targets: card.gameobj,
			ease: Phaser.Math.Easing.Cubic.InOut,
			duration: 200,
			x: min_x + caster.hand.length*(WIDTH_CARD + SPACING_CARD),
			y: caster.Y_HAND
		}, ...caster.hand.map(function(card, index_card)
		{
			return {
				targets: card.gameobj,
				ease: Phaser.Math.Easing.Cubic.InOut,
				duration: anim_duration,
				x: min_x + index_card*(WIDTH_CARD + SPACING_CARD),
				y: caster.Y_HAND
			};
		})], guid);
	}
}

export function playCard(state, caster, card, guid)
{
	if(caster.energy === 0 || state.caster_current !== caster || state.caster_winner !== null)
		return;

	if(caster === state.enemy)
	{
		card.gameobj.destroy();
		card.gameobj = state.controller.gameobj_card(card, card.gameobj.x, card.gameobj.y, undefined, true);
	}

	caster.energy--;
	caster.hand = caster.hand.filter(handcard => handcard !== card);
	guid = guid ?? Random.identifier();

	const anim_duration = caster.drawn_cards > 10 ? DEFAULT_DURATION / (caster.drawn_cards-10) : DEFAULT_DURATION;

	const min_x = WIDTH_CANVAS/2 - (caster.hand.length - 1)*(WIDTH_CARD/2 + SPACING_CARD/2);
	state.controller.wrap(function()
	{
		card.effect.bind(card)(state, caster, guid);
		log(`${caster.name} played a ${card.name}`);
		discardCard(state, caster, card);
	}, [{
		targets: card.gameobj,
		ease: Phaser.Math.Easing.Cubic.Out,
		duration: anim_duration,
		x: WIDTH_CANVAS/2,
		y: HEIGHT_CANVAS/2
	}, ...caster.hand.map(function(card, index_card)
	{
		return {
			targets: card.gameobj,
			ease: Phaser.Math.Easing.Cubic.InOut,
			duration: anim_duration,
			x: min_x + index_card*(WIDTH_CARD + SPACING_CARD),
			y: caster.Y_HAND
		};
	})], guid);
}
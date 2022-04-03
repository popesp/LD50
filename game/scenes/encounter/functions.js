import {WIDTH_CANVAS, HEIGHT_CANVAS, WIDTH_CARD, SPACING_CARD} from "../../globals.js";
import {randomCard} from "../../data/cards.js";
import GameState from "../../gamestate.js";
import Random from "../../random.js";
import {log} from "../../debug.js";


function determineWinner(state, caster)
{
	log('Determining winner:', caster);
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

export function getTopCard(state, caster)
{
	let card;
	// Generate "infinite" deck for final boss
	if(caster.isFinalBoss)
		card = randomCard();
	else
		card = caster.deck.pop();

	if(card === undefined && state.caster_winner === null)
		determineWinner(state, caster);

	return card;
}

export function discardCard(state, caster, card, guid)
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
		}], guid ?? Random.identifier());
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
	const card = getTopCard(state, caster);
	if(card === undefined) // GAME IS OVER
		return;

	guid = guid ?? Random.identifier();
	const gameobj = state.controller.gameobj_card(card, caster.X_DECK, caster.Y_DECK, () => playCard(state, state.player, card), caster === state.player);
	card.gameobj = gameobj;

	state.controller.wrap(function()
	{
		for(const trigger of state.triggers.draw)
			trigger.effect(state, caster, trigger.owner);

		if(caster.handlimit === caster.hand.length)
			discardCard(state, caster, card, guid);
		else
		{
			const min_x = WIDTH_CANVAS/2 - caster.hand.length*(WIDTH_CARD/2 + SPACING_CARD/2);
			state.controller.wrap(function()
			{
				log(`${caster.name} drew a ${card.name}`);
				caster.hand.push(card);

				state.needs_update = true;

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

export function playCard(state, caster, card, guid)
{
	if(caster.energy === 0 || state.caster_current !== caster || state.caster_winner !== null)
		return;

	caster.energy--;
	caster.hand = caster.hand.filter(handcard => handcard !== card);
	guid = guid ?? Random.identifier();

	const min_x = WIDTH_CANVAS/2 - (caster.hand.length - 1)*(WIDTH_CARD/2 + SPACING_CARD/2);
	state.controller.wrap(function()
	{
		card.effect.bind(card)(state, caster, guid);
		log(`${caster.name} played a ${card.name}`);
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
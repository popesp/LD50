import {discardCard, getTopCard, drawCard} from "../scenes/encounter/functions.js";
import {log} from "../debug.js";


export const PASSIVE_DATA = Object.fromEntries(Object.entries({
	fuck_yo_deck: {
		name: "Git Fuk",
		description: "When your opponent discards, draw a card",
		type: "relic",
		triggers: [
			{
				action: "discard",
				effect: function(state, caster, owner, child)
				{
					if(caster !== owner)
					{
						drawCard(state, owner, child);
					}
				}
			}
		]
	},
	flawed_wisdom: {
		name: "Flawed Wisdom",
		description: "Everytime your opponent draws a card, discard a card from the top of their deck",
		type: "relic",
		triggers: [
			{
				action: "draw",
				effect: function(state, caster, owner, child)
				{
					if(caster !== owner)
					{
						discardCard(state, caster, getTopCard(state, caster, child), child);
						for(const trigger of state.triggers.mind_flood)
						{
							trigger.effect(state, caster, trigger.owner);
						}
					}
				}
			}
		]
	},
	mind_flood: {
		name: "Mind Flood",
		description: "For the rest of the game, if your opponent discards a card, they discard an additional card",
		type: "relic",
		triggers: [
			{
				action: "discard",
				effect: function(state, caster, owner, child)
				{
					if(caster !== owner)
					{
						discardCard(state, caster, getTopCard(state, caster, child), child, false);
						for(const trigger of state.triggers.see_beyond)
						{
							trigger.effect(state, caster, trigger.owner);
						}
					}
				}
			}
		]
	},
	see_beyond: {
		name: "See Beyond",
		description: "For the rest of the game, anytime your opponent discards from 'Mind Flood', they draw a card",
		type: "relic",
		triggers: [
			{
				action: "see_beyond",
				effect: function(state, caster, owner, child)
				{
					if(caster !== owner)
						drawCard(state, caster, child);
				}
			}
		]
	},
	cosmic_insight: {
		name: "Cosmic Insight",
		description: "For the rest of the game, each player draws an extra card at the start of their turn",
		type: "relic",
		triggers: [
			{
				action: "start_turn",
				effect: function(state, caster, owner, child)
				{
					drawCard(state, caster, child);
				}
			}
		]
	},
	the_lighthouse: {
		name: "The Lighthouse",
		description: "For the rest of the game, at the start of your turn gain an extra action",
		type: "relic",
		triggers: [
			{
				action: "start_turn",
				effect: function(state, caster, owner)
				{
					// TODO(shawn): animate
					if(caster === owner)
						caster.energy ++;
				}
			}
		]
	},
	the_electric_chair: {
		name: "The Electric Chair",
		description: "For the rest of the game, at the start of your turn gain two extra actions, but you no longer draw a card for your turn",
		type: "relic",
		triggers: [
			{
				action: "start_turn",
				effect: function(state, caster, owner)
				{
					if(caster === owner)
					{
						// TODO(shawn): animate
						caster.energy += 2;
						caster.skip_draw = true;
					}
				}
			}
		]
	},
	candles_flicker: {
		name: "Candle's Flicker",
		description: "For the rest of the game, when your opponent would discard 1 or more cards from their deck, you draw a card",
		type: "relic",
		triggers: [
			{
				//needs discard funtion rework to discard from hand
				action: "discard",
				effect: function(state, caster, owner, child)
				{
					if(caster !== owner)
					{
						const target = state.player === caster ? state.enemy : state.player;
						drawCard(state, target, child);
					}
				}
			}
		]
	},
	rope_burn: {
		name: "Rope Burn",
		description: "For the rest of the game, if you would draw a card while your hand is full, discard a card from the enemy deck instead",
		type: "relic",
		triggers: [
			{
				action: "hand_size_discard",
				effect: function(state, caster, owner, child)
				{
					log("in here!!!");
					if(caster !== owner)
					{
						discardCard(state, caster, getTopCard(state, caster, child), child);
					}
				}
			}
		]
	}
}).map(([key, cardconfig]) => ([key, {...cardconfig, key}])));
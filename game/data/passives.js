import {discardCard, getTopCard, drawCard} from "../scenes/encounter/functions.js";
import {log} from "../debug.js";


export const PASSIVE_DATA = {
	mind_worm: {
		name: "Mind Worm",
		description: "Everytime your opponent draws a card, discard a card from the top of their deck",
		type: "relic",
		key: "mind_worm",
		triggers: [
			{
				action: "draw",
				effect: function(state, caster, owner, guid)
				{
					if(caster !== owner)
					{
						discardCard(state, caster, getTopCard(state, caster), guid);
						for(const trigger of state.triggers.maggot)
						{
							trigger.effect(state, caster, trigger.owner);
						}
					}
				}
			}
		]
	},
	maggot_infestation: {
		name: "Maggot Infestation",
		description: "For the rest of the game, anytime Mind Worm would discard a card, it discards that many cards +1",
		type: "relic",
		key: "maggot_infestation",
		triggers: [
			{
				action: "maggot",
				effect: function(state, caster, owner, guid)
				{
					if(caster !== owner)
					{
						discardCard(state, caster, getTopCard(state, caster), guid);
						for(const trigger of state.triggers.queen)
						{
							trigger.effect(state, caster, trigger.owner);
						}
					}
				}
			}
		]
	},
	feed_the_queen: {
		name: "Feed the Queen",
		description: "For the rest of the game, when an enemy discards 2 or more cards from their deck, they also draw a card",
		type: "relic",
		key: "feed_the_queen",
		triggers: [
			{
				action: "queen",
				effect: function(state, caster, owner, guid)
				{
					if(caster !== owner)
						drawCard(state, caster, getTopCard(state, caster), guid);
				}
			}
		]
	},
	cosmic_insight: {
		name: "Cosmic Insight",
		description: "For the rest of the game, each player draws an extra card at the start of their turn",
		type: "relic",
		key: "cosmic_insight",
		triggers: [
			{
				action: "start_turn",
				effect: function(state, caster, owner, guid)
				{
					drawCard(state, caster, guid);
				}
			}
		]
	},
	the_lighthouse: {
		name: "The Lighthouse",
		description: "For the rest of the game, at the start of your turn gain an extra action",
		type: "relic",
		key: "the_lighthouse",
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
		key: "the_electric_chair",
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
		key: "candles_flicker",
		triggers: [
			{
				//needs discard funtion rework to discard from hand
				action: "discard",
				effect: function(state, caster, owner, guid)
				{
					if(caster !== owner)
					{
						const target = state.player === caster ? state.enemy : state.player;
						drawCard(state, target, guid);
					}
				}
			}
		]
	},
	rope_burn: {
		name: "Rope Burn",
		description: "For the rest of the game, if you would draw a card while your hand is full, discard a card from the enemy deck instead",
		type: "relic",
		key: "rope_burn",
		triggers: [
			{
				action: "hand_size_discard",
				effect: function(state, caster, owner, guid)
				{
					console.log('in here!!!')
					if(caster !== owner)
					{
						discardCard(state, caster, getTopCard(state, caster), guid);
					}
				}
			}
		]
	}
};
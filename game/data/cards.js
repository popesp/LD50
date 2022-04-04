import {PASSIVE_DATA} from "./passives.js";
import {discardCard, getTopCard, addPassive, drawCard, playCard} from "../scenes/encounter/functions.js";


export function createCard(config)
{
	return {...config};
}

export const CARD_DATA = Object.fromEntries(Object.entries({
	i_win: {
		name: "I Win Button",
		description: "Devs hold all the power",
		type: "Action",
		class: "Player",
		effect: function(state, caster, child)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
		}
	},
	restore_sanity: {
		name: "Restore Sanity",
		description: "Place 2 'Self Reflection' cards on the bottom of your deck",
		type: "Action",
		class: "Player",
		effect: function(state, caster)
		{
			// TODO(shawn): animate this
			caster.deck.unshift(createCard(CARD_DATA.self_reflection), createCard(CARD_DATA.self_reflection));
		}
	},
	self_reflection: {
		name: "Self Reflection",
		description: "Gain 1 energy and place a 'Blank' on the top of your deck",
		type: "Action",
		class: "Player",
		effect: function(state, caster)
		{
			// TODO(shawn): animate this
			caster.deck.push(createCard(CARD_DATA.blank));
			caster.energy++;
		}
	},
	blank: {
		name: "Blank",
		description: "[This card has no effect]",
		type: "Action",
		class: "Player",
		effect: function()
		{
		}
	},
	mind_blast: {
		name: "Mind Blast",
		description: "Discard the top 2 cards from the enemy deck",
		type: "Action",
		effect: function(state, caster, child)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
		}
	},
	submit_to_madness: {
		name: "Submit to Madness",
		description: "Discard the top card of your deck and gain 2 energy",
		type: "Action",
		class: "Player",
		effect: function(state, caster, child)
		{
			discardCard(state, caster, getTopCard(state, caster, child), child);
			caster.energy += 2;
		}
	},
	deja_vu: {
		name: "Deja Vu",
		description: "Place the top card of your discard pile on the top of your deck",
		type: "Action",
		class: "Player",
		effect: function(state, caster)
		{
			// TODO(shawn): animate
			if(caster.discard_pile.length)
				caster.deck.push(caster.discard_pile.pop());
		}
	},
	gaze_into_abyss: {
		name: "Gaze into Abyss",
		description: "Play the top card of the enemy deck",
		type: "Action",
		class: "Player",
		effect: function(state, caster, child)
		{
			const target = state.player === caster ? state.enemy : state.player;
			const played_card = getTopCard(state, target, child);

			caster.energy++; //increment energy to play the card
			playCard(state, caster, played_card, child);
		}
	},
	point_of_grace: {
		name: "Point of Grace",
		description: "Add a random passive card from your deck to your hand",
		type: "Action",
		class: "Player",
		effect: function(state, caster)
		{
			for(let i = 0; i < caster.deck.length; ++i)
			{
				const card = caster.deck[i];
				if(card.type === "Passive")
				{
					// TODO(shawn): animate
					const totes_random_card = caster.deck.splice(i, 1);
					caster.hand.push(totes_random_card[0]);
					break;
				}
			}
		}
	},
	spilled_beans: {
		name: "Spilled Beans",
		description: "Discard cards from the enemy deck equal to your hand size, then put your hand on the bottom of your deck",
		type: "Action",
		class: "Player",
		effect: function(state, caster, child)
		{
			const target = state.player === caster ? state.enemy : state.player;
			// animation not updating when card is being played
			while(caster.hand.length > 0)
			{
				discardCard(state, target, getTopCard(state, target, child), child);
				caster.deck.push(caster.hand.splice(0, 1)[0]);
			}
		}
	},
	hysteric_whisper: {
		name: "Hysteric Whisper",
		description: "Each player discards a random card from their hand, then you draw a card",
		type: "Action",
		class: "Player",
		effect: function(state, caster, child)
		{
			if(caster.hand.length > 0)
				discardCard(state, caster, caster.hand.splice(0, 1)[0], child);

			const target = state.player === caster ? state.enemy : state.player;
			if(target.hand.length > 0)
				discardCard(state, target, target.hand.splice(0, 1)[0], child);

			drawCard(state, caster, child);
		}
	},
	//Passive Cards
	fuck_yo_deck: {
		name: "Git Fuk",
		description: "When enemy discards, draw a card",
		type: "Passive",
		class: "Player",
		effect: function(state, caster, child)
		{
			addPassive(state, caster, PASSIVE_DATA.fuck_yo_deck, child);
		}
	},
	flawed_wisdom: {
		name: "Flawed Wisdom",
		description: "Everytime your enemy draws a card, discard a card from the top of their deck",
		type: "Passive",
		class: "Player",
		effect: function(state, caster, child)
		{
			addPassive(state, caster, PASSIVE_DATA.flawed_wisdom, child);
		}
	},
	mind_flood: {
		name: "Mind Flood",
		description: "For the rest of the game, if your enemy discards a card, they discard an additional card",
		type: "Passive",
		class: "Player",
		effect: function(state, caster, child)
		{
			addPassive(state, caster, PASSIVE_DATA.mind_flood, child);
		}
	},
	see_beyond: {
		name: "See Beyond",
		description: "For the rest of the game, when 'Mind Flood' would discard a card from your enemy's deck, they also draw a card",
		type: "Passive",
		class: "Player",
		effect: function(state, caster, child)
		{
			addPassive(state, caster, PASSIVE_DATA.see_beyond, child);
		}
	},
	cosmic_insight: {
		name: "Cosmic Insight",
		description: "For the rest of the game, each player draws an extra card at the start of their turn",
		type: "Passive",
		class: "Player",
		effect: function(state, caster, child)
		{
			addPassive(state, caster, PASSIVE_DATA.cosmic_insight, child);
		}
	},
	the_lighthouse: {
		name: "The Lighthouse",
		description: "For the rest of the game, gain 1 energy at the start of each turn",
		type: "Passive",
		class: "Player",
		effect: function(state, caster, child)
		{
			addPassive(state, caster, PASSIVE_DATA.the_lighthouse, child);
		}
	},
	the_electric_chair: {
		name: "The Electric Chair",
		description: "For the rest of the game, at the start of your turn gain 2 extra energy, but you no longer draw a card for your turn",
		type: "Passive",
		class: "Player",
		effect: function(state, caster, child)
		{
			addPassive(state, caster, PASSIVE_DATA.the_electric_chair, child);
		}
	},
	candles_flicker: {
		//needs discard funtion rework to discard from hand
		name: "Candle's Flicker",
		description: "For the rest of the game, when your enemy would discard 1 or more cards from their deck, you draw a card",
		type: "Passive",
		class: "Player",
		effect: function(state, caster, child)
		{
			addPassive(state, caster, PASSIVE_DATA.candles_flicker, child);
		}
	},
	rope_burn: {
		name: "Rope Burn",
		description: "For the rest of the game, if you would draw a card while your hand is full, discard a card from your enemy's deck instead",
		type: "Passive",
		class: "Player",
		effect: function(state, caster, child)
		{
			addPassive(state, caster, PASSIVE_DATA.rope_burn, child);
		}
	},

	//Enemy Only Cards
	bump_in_the_night: {
		name: "Bump in the Night",
		description: "Discard the top card from the enemy deck",
		type: "Action",
		class: "Monster",
		effect: function(state, caster, child)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target, child), child);
		}
	},
	taste_of_flesh: {
		name: "Taste of Flesh",
		description: "Draw 2 cards and gain 1 energy",
		type: "Action",
		class: "Monster",
		effect: function(state, caster, child)
		{
			drawCard(state, caster, child);
			drawCard(state, caster, child);
			caster.energy++;
		}
	},
	eye_for_an_eye: {
		name: "Eye for an Eye",
		description: "Each player discards the top 3 cards of their deck",
		type: "Action",
		class: "Monster",
		effect: function(state, caster, child)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);
			discardCard(state, target, getTopCard(state, target, child), child);

			discardCard(state, caster, getTopCard(state, caster, child), child);
			discardCard(state, caster, getTopCard(state, caster, child), child);
			discardCard(state, caster, getTopCard(state, caster, child), child);
		}
	},
	shifting_shadows: {
		name: "Shifting Shadows",
		description: "If you have less cards in your deck than your enemy, discard the top 3 cards of their deck, otherwise draw 2.",
		type: "Action",
		class: "Monster",
		effect: function(state, caster, child)
		{
			if(state.caster_current.name === "Player")
			{
				if(state.player.deck.length < state.enemy.deck.length)
				{
					const target = state.player === caster ? state.enemy : state.player;
					discardCard(state, target, getTopCard(state, target, child), child);
					discardCard(state, target, getTopCard(state, target, child), child);
					discardCard(state, target, getTopCard(state, target, child), child);
				}
				else
				{
					drawCard(state, caster, child);
					drawCard(state, caster, child);
				}
			}
			else if(state.enemy.deck.length < state.player.deck.length)
			{
				const target = state.player === caster ? state.enemy : state.player;
				discardCard(state, target, getTopCard(state, target, child), child);
				discardCard(state, target, getTopCard(state, target, child), child);
				discardCard(state, target, getTopCard(state, target, child), child);
			}
			else
			{
				drawCard(state, caster, child);
				drawCard(state, caster, child);
			}
		}
	},
	encroaching_mist: {
		name: "Encroaching Mist",
		description: "Remove a card from the top of your enemy's deck for each of your turns that have passed",
		type: "Action",
		class: "Monster",
		effect: function(state, caster, child)
		{
			const target = state.player === caster ? state.enemy : state.player;
			for(let i = 1; i < caster.turn_count; i++)
				discardCard(state, target, getTopCard(state, target, child), child);
		}
	},
	dark_expanse: {
		name: "Dark Expanse",
		description: "Place three 'Dark Expanse' cards on the bottom of your deck",
		type: "Action",
		class: "Monster",
		effect: function(state, caster)
		{
			caster.deck.unshift(createCard(CARD_DATA.dark_expanse), createCard(CARD_DATA.dark_expanse), createCard(CARD_DATA.dark_expanse));
		}
	}
}).map(([key, cardconfig]) => ([key, {...cardconfig, key}])));
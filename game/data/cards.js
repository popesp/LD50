import {PASSIVE_DATA} from "./passives.js";
import {discardCard, getTopCard, addPassive, drawCard, playCard} from "../scenes/encounter/functions.js";
import Random from "../random.js";


export function randomCard()
{
	const cards = Object.values(CARD_DATA);
	return createCard(cards[Random.int(0, cards.length)]);
}

export function createCard(config)
{
	return {...config};
}

export const CARD_DATA = Object.fromEntries(Object.entries({
	i_win: {
		name: "I Win Button",
		description: "Devs hold all the power",
		type: "Action",
		effect: function(state, caster, guid)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
		}
	},
	restore_sanity: {
		name: "Restore Sanity",
		description: "Place 2 'Self Reflection' cards on the bottom of your deck",
		type: "Action",
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
		effect: function()
		{
		}
	},
	mind_blast: {
		name: "Mind Blast",
		description: "Discard the top 2 cards from the enemy deck",
		type: "Action",
		effect: function(state, caster, guid)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
		}
	},
	submit_to_madness: {
		name: "Submit to Madness",
		description: "Discard the top card of your deck and gain 2 energy",
		type: "Action",
		effect: function(state, caster, guid)
		{
			discardCard(state, caster, getTopCard(state, caster, guid), guid);
			caster.energy += 2;
		}
	},
	deja_vu: {
		name: "Deja Vu",
		description: "Place the top card of your discard pile on the top of your deck",
		type: "Action",
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
		effect: function(state, caster, guid)
		{
			const target = state.player === caster ? state.enemy : state.player;
			const played_card = getTopCard(state, target, guid);

			caster.energy++; //increment energy to play the card
			playCard(state, caster, played_card, guid);
		}
	},
	point_of_grace: {
		name: "Point of Grace",
		description: "Add a random passive card from your deck to your hand",
		type: "Action",
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
	spilt_beans: {
		name: "Spilt Beans",
		description: "Discard cards from the enemy deck equal to your hand size, then put your hand on the bottom of your deck",
		type: "Action",
		effect: function(state, caster, guid)
		{
			const target = state.player === caster ? state.enemy : state.player;
			// animation not updating when card is being played
			while(caster.hand.length > 0)
			{
				discardCard(state, target, getTopCard(state, target, guid), guid);
				caster.deck.push(caster.hand.splice(0, 1)[0]);
			}
		}
	},
	hysterical_whispers: {
		name: "Hysterical Whispers",
		description: "Each player discards a random card from their hand, then you draw a card",
		type: "Action",
		effect: function(state, caster, guid)
		{
			if(caster.hand.length > 0)
				discardCard(state, caster, caster.hand.splice(0, 1)[0], guid);

			const target = state.player === caster ? state.enemy : state.player;
			if(target.hand.length > 0)
				discardCard(state, target, target.hand.splice(0, 1)[0], guid);

			drawCard(state, caster, guid);
		}
	},
	//Passive Cards
	mind_worm: {
		name: "Mind Worm",
		description: "For the rest of the game, when your opponent draws a card, discard the top card of their deck",
		type: "Passive",
		effect: function(state, caster, guid)
		{
			addPassive(state, caster, PASSIVE_DATA.mind_worm, guid);
		}
	},
	maggot_infestation: {
		name: "Maggot Infestation",
		description: "For the rest of the game, anytime Mind Worm would discard a card, it discards that many cards +1",
		type: "Passive",
		effect: function(state, caster, guid)
		{
			addPassive(state, caster, PASSIVE_DATA.maggot_infestation, guid);
		}
	},
	feed_the_queen: {
		name: "Feed the Queen",
		description: "For the rest of the game, when the enemy discards 2 or more cards from their deck, they also draw a card",
		type: "Passive",
		effect: function(state, caster, guid)
		{
			addPassive(state, caster, PASSIVE_DATA.feed_the_queen, guid);
		}
	},
	cosmic_insight: {
		name: "Cosmic Insight",
		description: "For the rest of the game, each player draws an extra card at the start of their turn",
		type: "Passive",
		effect: function(state, caster, guid)
		{
			addPassive(state, caster, PASSIVE_DATA.cosmic_insight, guid);
		}
	},
	the_lighthouse: {
		name: "The Lighthouse",
		description: "For the rest of the game, gain 1 energy at the start of each turn",
		type: "Passive",
		effect: function(state, caster, guid)
		{
			addPassive(state, caster, PASSIVE_DATA.the_lighthouse, guid);
		}
	},
	the_electric_chair: {
		name: "The Electric Chair",
		description: "For the rest of the game, at the start of your turn gain 2 extra actions, but you no longer draw a card for your turn",
		type: "Passive",
		effect: function(state, caster, guid)
		{
			addPassive(state, caster, PASSIVE_DATA.the_electric_chair, guid);
		}
	},
	candles_flicker: {
		//needs discard funtion rework to discard from hand
		name: "Candle's Flicker",
		description: "For the rest of the game, when your opponent would discard 1 or more cards from their deck, you draw a card",
		type: "Passive",
		effect: function(state, caster, guid)
		{
			addPassive(state, caster, PASSIVE_DATA.candles_flicker, guid);
		}
	},
	rope_burn: {
		name: "Rope Burn",
		description: "For the rest of the game, if you would draw a card while your hand is full, discard a card from the enemy deck instead",
		type: "Passive",
		effect: function(state, caster, guid)
		{
			addPassive(state, caster, PASSIVE_DATA.rope_burn, guid);
		}
	},

	//Enemy Only Cards
	bump_in_the_night: {
		name: "Bump in the Night",
		description: "Discard the top card from the enemy deck",
		type: "Action",
		effect: function(state, caster, guid)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target, guid), guid);
		}
	},
	taste_of_flesh: {
		name: "Taste of Flesh",
		description: "Draw 2 cards and gain 1 energy",
		type: "Action",
		effect: function(state, caster, guid)
		{
			drawCard(state, caster, guid);
			drawCard(state, caster, guid);
			caster.energy++;
		}
	},
	eye_for_an_eye: {
		name: "Eye for an Eye",
		description: "Each player discards the top 3 cards of their deck",
		type: "Action",
		effect: function(state, caster, guid)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);
			discardCard(state, target, getTopCard(state, target, guid), guid);

			discardCard(state, caster, getTopCard(state, caster, guid), guid);
			discardCard(state, caster, getTopCard(state, caster, guid), guid);
			discardCard(state, caster, getTopCard(state, caster, guid), guid);
		}
	},
	shifting_shadows: {
		name: "Shifting Shadows",
		description: "If you have less cards in your deck than your enemy discard the top 3 cards of their deck, otherwise draw 2.",
		type: "Action",
		effect: function(state, caster, guid)
		{
			if(state.caster_current.name === "Player")
			{
				if(state.player.deck.length < state.enemy.deck.length)
				{
					const target = state.player === caster ? state.enemy : state.player;
					discardCard(state, target, getTopCard(state, target), guid);
					discardCard(state, target, getTopCard(state, target), guid);
					discardCard(state, target, getTopCard(state, target), guid);
				}
				else
				{
					drawCard(state, caster, guid);
					drawCard(state, caster, guid);
				}
			}
			else if(state.enemy.deck.length < state.player.deck.length)
			{
				const target = state.player === caster ? state.enemy : state.player;
				discardCard(state, target, getTopCard(state, target), guid);
				discardCard(state, target, getTopCard(state, target), guid);
				discardCard(state, target, getTopCard(state, target), guid);
			}
			else
			{
				drawCard(state, caster, guid);
				drawCard(state, caster, guid);
			}
		}
	},
	encroaching_mist: {
		name: "Encroaching Mist",
		description: "Remove a card from the top of enemy deck for each of your turn's that have passed",
		type: "Action",
		effect: function(state, caster, guid)
		{
			const target = state.player === caster ? state.enemy : state.player;
			for(let i = 1; i < caster.turn_count; i++)
				discardCard(state, target, getTopCard(state, target), guid);
		}
	},
	dark_expanse: {
		name: "Dark Expanse",
		description: "Place three 'Dark Expanse' cards on the bottom of your deck",
		type: "Action",
		effect: function(state, caster)
		{
			caster.deck.unshift(createCard(CARD_DATA.dark_expanse), createCard(CARD_DATA.dark_expanse), createCard(CARD_DATA.dark_expanse));
		}
	}
}).map(([key, cardconfig]) => ([key, {...cardconfig, key}])));
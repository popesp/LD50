const CARD_DATA = Object.fromEntries(Object.entries({
	i_win: {
		name: "I Win Button",
		description: "Devs hold all the power",
		type: "Action",
		effect: function(state, caster)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
		}
	},
	restore_sanity: {
		name: "Restore Sanity",
		description: "Place two 'Self Reflection' cards on the bottom of your deck",
		type: "Action",
		effect: function(state, caster)
		{
			caster.deck.unshift(createCard(CARD_DATA.self_reflection), createCard(CARD_DATA.self_reflection));
		}
	},
	self_reflection: {
		name: "Self Reflection",
		description: "Gain one energy, and place a blank card on the top of your deck",
		type: "Action",
		effect: function(state, caster)
		{
			caster.deck.push(createCard(CARD_DATA.blank));
			caster.energy++;
		}
	},
	blank: {
		name: "A Blank",
		description: "[This card has no effect]",
		type: "Action",
		effect: function(state, caster)
		{

		}
	},
	mind_blast: {
		name: "Mind Blast",
		description: "Discard the top 2 cards from the enemy deck",
		type: "Action",
		effect: function(state, caster)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target));
			discardCard(state, target, getTopCard(state, target));
		}
	},
	submit_to_madness: {
		name: "Submit to Madness",
		description: "Discard the top card of your deck and gain two energy",
		type: "Action",
		effect: function(state, caster)
		{
			discardCard(state, caster, getTopCard(state, caster));
			caster.energy += 2;
		}
	},
	//Passive Cards
	mind_worm: {
		name: "Mind Worm",
		description: "For the rest of the game, when your opponent draws a card, discard the top card of their deck",
		type: "Action",
		effect: function(state, caster)
		{
			addPassive(state, caster, PASSIVE_DATA.mind_worm);
		}
	},
	cosmic_insight: {
		name: "Cosmic Insight",
		description: "For the rest of the game, each player draws an extra card at the start of their turn",
		type: "Action",
		effect: function(state, caster)
		{
			addPassive(state, caster, PASSIVE_DATA.cosmic_insight);
		}
	},

	//Enemy Cards
	bump_in_the_night: {
		name: "Bump in the Night",
		description: "Discard the top card from the enemy deck",
		type: "Action",
		effect: function(state, caster)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target));
		}
	},
	taste_of_flesh: {
		name: "Taste of Flesh",
		description: "Draw two cards and gain one energy",
		type: "Action",
		effect: function(state, caster)
		{
			drawCard(state, caster);
			drawCard(state, caster);
			caster.energy++;
		}
	}
}).map(([key, cardconfig]) => ([key, {...cardconfig, key}])));
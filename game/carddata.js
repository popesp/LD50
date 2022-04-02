const CARD_DATA = Object.fromEntries(Object.entries({
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
		description: "Gain one energy",
		type: "Action",
		effect: function(state, caster)
		{
			caster.energy++;
		}
	},
	mind_blast: {
		name: "Mind Blast",
		description: "Remove the top 2 cards from the enemy deck",
		type: "Action",
		effect: function(state, caster)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target));
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
	mind_worm: {
		name: "Mind Worm",
		description: "Create a mind worm",
		type: "Action",
		effect: function(state, caster)
		{
			addPassive(state, caster, PASSIVE_DATA.mind_worm);
		}
	}
}).map(([key, cardconfig]) => ([key, {...cardconfig, key}])));
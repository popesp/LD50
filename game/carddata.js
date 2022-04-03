const CARD_DATA = Object.fromEntries(Object.entries({
	i_win: {
		name: "I Win Button",
		description: "Devs hold all the power",
		type: "Action",
		effect: function(state, caster, guid)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
		}
	},
	restore_sanity: {
		name: "Restore Sanity",
		description: "Place two 'Self Reflection' cards on the bottom of your deck",
		type: "Action",
		effect: function(state, caster, guid)
		{
			// TODO(shawn): animate this
			caster.deck.unshift(createCard(CARD_DATA.self_reflection), createCard(CARD_DATA.self_reflection));
		}
	},
	self_reflection: {
		name: "Self Reflection",
		description: "Gain one energy, and place a blank card on the top of your deck",
		type: "Action",
		effect: function(state, caster, guid)
		{
			// TODO(shawn): animate this
			caster.deck.push(createCard(CARD_DATA.a_blank));
			caster.energy++;
		}
	},
	a_blank: {
		name: "A Blank",
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
			discardCard(state, target, getTopCard(state, target), guid);
			discardCard(state, target, getTopCard(state, target), guid);
		}
	},
	submit_to_madness: {
		name: "Submit to Madness",
		description: "Discard the top card of your deck and gain two energy",
		type: "Action",
		effect: function(state, caster, guid)
		{
			discardCard(state, caster, getTopCard(state, caster), guid);
			caster.energy += 2;
		}
	},
	deja_vu: {
		name: 'Deja Vu',
		description: "Place the top card of your discard pile on to the top of your deck",
		type: "Action",
		effect: function(state, caster, guid)
		{
			// TODO(shawn): animate
			if(caster.discard_pile.length)
				caster.deck.push(caster.discard_pile.pop());
		}
	},
	gaze_into_abyss: {
		name: 'Gaze into Abyss',
		description: "Play the top card of the enemy deck",
		type: "Action",
		effect: function(state, caster, guid)
		{
			const target = state.player === caster ? state.enemy : state.player;
			const played_card = getTopCard(state, target);

			caster.energy++; //increment energy to play the card
			playCard(state, caster, played_card, guid);
		}
	},
	point_of_grace: {
		name: 'Point of Grace',
		description: "Add a random passive card from your deck to your hand",
		type: "Action",
		effect: function(state, caster, guid)
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
	cosmic_insight: {
		name: "Cosmic Insight",
		description: "For the rest of the game, each player draws an extra card at the start of their turn",
		type: "Passive",
		effect: function(state, caster, guid)
		{
			addPassive(state, caster, PASSIVE_DATA.cosmic_insight, guid);
		}
	},

	//Enemy Cards
	bump_in_the_night: {
		name: "Bump in the Night",
		description: "Discard the top card from the enemy deck",
		type: "Action",
		effect: function(state, caster, guid)
		{
			const target = state.player === caster ? state.enemy : state.player;
			discardCard(state, target, getTopCard(state, target), guid);
		}
	},
	taste_of_flesh: {
		name: "Taste of Flesh",
		description: "Draw two cards and gain one energy",
		type: "Action",
		effect: function(state, caster, guid)
		{
			drawCard(state, caster, guid);
			drawCard(state, caster, guid);
			caster.energy++;
		}
	}
}).map(([key, cardconfig]) => ([key, {...cardconfig, key}])));
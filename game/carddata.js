const CARD_DATA = [{
	name: "Restore Sanity",
	description: "Place a copy of this card on the bottom of your deck",
	type: "Action",
	effect: function(state, caster)
	{
		caster.deck.unshift(this);
	}
},
{
	name: "Mind Blast",
	description: "Remove the top 2 cards from the enemy deck",
	type: "Action",
	effect: function(state, caster)
	{
		const target = state.player === caster ? state.enemy : state.player;
		discardCard(target, getTopCard(target));
		discardCard(target, getTopCard(target));
	}
},
{
	name: "Taste of Flesh",
	description: "Draw two cards and gain one energy",
	type: "Action",
	effect: function(state, caster)
	{
		drawCard(caster);
		drawCard(caster);
		caster.energy++;
	}
},
{
	name: "Submit to Madness",
	description: "Discard the top card of your deck and gain two energy",
	type: "Action",
	effect: function(state, caster)
	{
		discardCard(caster, getTopCard(caster));
		caster.energy += 2;
	}
}
];
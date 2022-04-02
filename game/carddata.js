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
		console.log("Is this shit working???");
		drawCard(caster);
		drawCard(caster);
		caster.energy++;
	}
}
];
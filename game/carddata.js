const CARD_DATA = [{
	name: "Restore Sanity",
	description: "Place this card on the bottom of your deck",
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
		
	}
}];
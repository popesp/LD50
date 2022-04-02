const BASIC_PASSIVE_DATA = {
	mind_worm: {
		name: "Mind Worm",
		description: "Everytime your opponent draws a card, remove a card from the top of their deck",
		type: "relic",
		triggers: [
			{
				trigger: {
					action: "draw",
					target: "enemy"
				},
				effect: function(state, caster)
				{
					caster.deck.unshift(this);
				}
			}
		]
	}
};

const CTHULHU_PASSIVE_DATA = {

};
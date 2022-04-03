const PASSIVE_DATA = {
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
						discardCard(state, caster, getTopCard(state, caster), guid);
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
				effect: function(state, caster, owner, guid)
				{
					if(caster !== owner)
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
				effect: function(state, caster, owner, guid)
				{
					if(caster === owner)
					{
						caster.energy += 2;
						caster.skip_draw = true;
					}
						
					
				}
			}
		]
	}
};

function addPassive(state, caster, passive, guid)
{
	// TODO(shawn): animate this
	for(const trigger of passive.triggers)
		state.triggers[trigger.action].push({effect: trigger.effect, owner: caster});

	state.passives.push({owner: caster, config: passive});
}
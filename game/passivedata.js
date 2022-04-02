const PASSIVE_DATA = {
	mind_worm: {
		name: "Mind Worm",
		description: "Everytime your opponent draws a card, remove a card from the top of their deck",
		type: "relic",
		triggers: [
			{
				action: "draw",
				effect: function(state, caster, owner)
				{
					if(caster !== owner)
						discardCard(state, caster, getTopCard(state, caster));
				}
			}
		]
	}
};

function addPassive(state, caster, passive)
{
	for(const trigger of passive.triggers)
		state.triggers[trigger.action].push({effect: trigger.effect, owner: caster});

	state.passives.push({owner: caster, config: passive});
}
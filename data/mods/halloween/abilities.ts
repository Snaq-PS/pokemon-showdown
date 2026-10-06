export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	fallingfighter: {
		onStart(source) {
			this.add('-ability', source, 'Gravity Field');
			this.field.addPseudoWeather('gravity', source);
		},
		flags: {},
		name: "Falling Fighter",
		rating: 4,
		num: 10001,
	},
};

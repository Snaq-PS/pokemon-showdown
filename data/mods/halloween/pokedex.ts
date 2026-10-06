export const Pokedex: import('../../../sim/dex-species').ModdedSpeciesDataTable = {
	// https://www.smogon.com/forums/threads/pet-mods-halloween-calendar-prompt-3.3788834/#post-11150240
	// https://www.smogon.com/forums/threads/pet-mods-halloween-calendar-prompt-3.3788834/#post-11150254
	// https://www.smogon.com/forums/threads/pet-mods-halloween-calendar-prompt-3.3788834/page-2#post-11150813
	seedstrom: {
		num: 10001,
		name: "Seedstrom",
		types: ["Grass", "Flying"],
		baseStats: { hp: 95, atk: 110, def: 80, spa: 60, spd: 75, spe: 115 },
		abilities: { 0: "Seed Sower", 1: "Wind Rider", H: "Delta Stream" },
		heightm: 0,
		weightkg: 50,
		eggGroups: ["Undiscovered"],
	},
	gravitart: {
		num: 10002,
		name: "Gravitart",
		types: ["Grass", "Dragon"],
		baseStats: { hp: 100, atk: 95, def: 102, spa: 89, spd: 73, spe: 26 },
		abilities: { 0: "Falling Fighter", 1: "Grassy Surge", H: "Strong Jaw" },
		heightm: 0,
		weightkg: 20,
		eggGroups: ["Undiscovered"],
	},
	harvesta: {
		num: 10003,
		name: "Harvesta",
		types: ["Grass", "Fire"],
		baseStats: { hp: 85, atk: 135, def: 85, spa: 60, spd: 85, spe: 100 },
		abilities: { 0: "Harvest", 1: "Leaf Guard" },
		heightm: 1.2,
		weightkg: 30,
		eggGroups: ["Undiscovered"],
		color: "Brown",
	},
};

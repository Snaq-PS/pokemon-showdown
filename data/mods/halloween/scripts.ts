import { Pokemon } from '../../../sim/pokemon';
import { Species } from '../../../sim/dex-species';

export const Scripts: ModdedBattleScriptsData = {
	gen: 9,

	init() {
		this.modData('Learnsets', 'lurantis').learnset.icehammer = ['9L1'];

		// Start with this mod's new species, then include their complete evolution/form families.
		const parentPokedex = this.mod(this.parentMod).data.Pokedex;
		const families = new Map<string, Set<string>>();
		const normalPokemon = new Set<string>();
		const capPokemon = new Set<string>();
		for (const id in this.data.Pokedex) families.set(id, new Set());
		for (const [id, species] of Object.entries(this.data.Pokedex)) {
			if (!parentPokedex[id]) {
				if (species.isNonstandard === 'CAP') {
					capPokemon.add(id);
				} else if (species.isNonstandard !== 'Unobtainable' && this.data.FormatsData[id]?.tier !== 'Illegal') {
					normalPokemon.add(id);
				}
			}
			for (const name of [species.prevo, species.baseSpecies, ...(species.evos || []),
				...(species.otherFormes || []), ...(species.cosmeticFormes || [])]) {
				const relative = this.toID(name);
				if (!families.has(relative) || relative === id) continue;
				families.get(id)!.add(relative);
				families.get(relative)!.add(id);
			}
		}
		for (const roster of [normalPokemon, capPokemon]) {
			// Set iteration also visits newly added relatives until the whole family is included.
			for (const id of roster) {
				for (const relative of families.get(id) || []) roster.add(relative);
			}
		}
		for (const [id, species] of Object.entries(this.data.Pokedex)) {
			// Cosmetic aliases inherit eligibility from their base; their own FormatsData entry denotes an event forme.
			if (species.isCosmeticForme) continue;
			const formats = this.data.FormatsData[id] || {};
			if (capPokemon.has(id) && (species.isNonstandard === 'CAP' || !normalPokemon.has(id))) {
				this.data.FormatsData[id] = {
					...formats,
					tier: 'CAP',
					doublesTier: 'CAP',
					natDexTier: 'CAP',
					isNonstandard: 'CAP',
				};
			} else if (!normalPokemon.has(id)) {
				this.data.FormatsData[id] = {
					...formats,
					tier: 'Illegal',
					doublesTier: 'Illegal',
					natDexTier: 'Illegal',
					isNonstandard: 'Unobtainable',
				};
			} else if (formats.tier === 'Illegal' && species.isNonstandard !== 'Unobtainable') {
				// A previously excluded submission can now qualify as a winner's evolutionary relative.
				this.data.FormatsData[id] = { ...formats, tier: 'OU', doublesTier: 'DOU', natDexTier: 'OU' };
			}
		}

		// The global "grimm" alias means Grimmsnarl; keep this mod's created Grimm accessible.
		this.species.speciesCache.set('grimm' as ID, new Species({
			...this.data.Pokedex.grimm,
			...this.data.FormatsData.grimm,
		}));
		const originalGet = this.species.get;
		this.species.get = function (name) {
			if (typeof name === 'string') {
				const id = this.dex.toID(name);
				if (id === 'sweyrupvanilla') name = 'Sweyrup';
				if (id === 'alcremiechocolateswirlmilk') name = 'Alcremie-Chocolate-Swirl';
				if (id === 'grimmhalloween') name = 'Grimm';
			}
			return originalGet.call(this, name);
		};
	},
	pokemon: {
		setStatus(status, source = null, sourceEffect = null, ignoreImmunities = false) {
			const previousStatus = this.status;
			const effect = sourceEffect || this.battle.effect;
			const result = Pokemon.prototype.setStatus.call(this, status, source, sourceEffect, ignoreImmunities);
			// Detect a real cure, including Rest replacing an existing major status with sleep.
			if (result && previousStatus && previousStatus !== this.status &&
				(!this.status || (this.status === 'slp' && effect?.id === 'rest'))) {
				for (const holder of this.battle.getAllActive()) {
					if (!holder.hp || !this.isAlly(holder) || !holder.hasAbility('moralsupport')) continue;
					const uses = holder.m.moralSupportUses || 0;
					if (uses >= 2) continue;
					holder.m.moralSupportUses = uses + 1;
					this.battle.boost({ spa: 1 }, holder, holder, this.battle.dex.abilities.get('moralsupport'));
				}
			}
			return result;
		},
	},
};

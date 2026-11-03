export const Conditions: import('../../../sim/dex-conditions').ModdedConditionDataTable = {
	slipstream: {
		name: 'Slipstream',
		noCopy: true,
		onStart(pokemon) {
			if (pokemon.m.slipstreamHealing === undefined) pokemon.m.slipstreamHealing = 0;
			this.add('-start', pokemon, 'Slipstream');
		},
		onEnd(pokemon) {
			delete pokemon.m.slipstreamHealing;
			this.add('-end', pokemon, 'Slipstream');
		},
	},
	partiallytrapped: {
		inherit: true,
		durationCallback(target, source) {
			if (source?.hasAbility('wrapup') || source?.hasItem('gripclaw')) return 8;
			return this.random(5, 7);
		},
		onStart(pokemon, source) {
			this.add('-activate', pokemon, 'move: ' + this.effectState.sourceEffect, `[of] ${source}`);
			this.effectState.boundDivisor = source.hasAbility('wrapup') || source.hasItem('bindingband') ? 6 : 8;
		},
	},
	brn: {
		inherit: true,
		onResidual(pokemon) {
			const sources = pokemon.foes().filter(foe => foe.hasAbility('scarletflame'));
			if (!sources.length) {
				this.damage(pokemon.baseMaxhp / 16);
				return;
			}
			const tick = Math.max(1, Math.floor(pokemon.baseMaxhp / 16));
			this.add('-activate', sources[0], 'ability: Scarlet Flame');
			this.directDamage(tick * (1 + sources.length), pokemon, sources[0], this.effect);
		},
	},
	seedling: {
		name: 'Seedling', effectType: 'Condition', duration: 3,
		onSideStart(side, source) {
			this.effectState.mask = source.item;
			this.add('-sidestart', side, 'Seedling');
		},
		onSideResidualOrder: 26,
		onSideResidualSubOrder: 6,
		onSideEnd(side) {
			this.add('-sideend', side, 'Seedling');
			const source = this.effectState.source;
			const move = this.dex.getActiveMove('greenthumb');
			for (const pokemon of side.active) {
				if (!pokemon?.hp) continue;
				if (this.effectState.mask === 'hearthflamemask') this.boost({ atk: 1, spa: 1 }, pokemon, source, move);
				if (this.effectState.mask === 'cornerstonemask') this.boost({ def: 1, spd: 1 }, pokemon, source, move);
				if (this.effectState.mask === 'wellspringmask') {
					this.heal(pokemon.baseMaxhp / 4, pokemon, source, move);
					pokemon.cureStatus();
				}
			}
		},
	},
	psychotrapincoming: {
		name: 'Psycho Trap Incoming',
		onSwitchIn(target) {
			target.side.removeSlotCondition(target, 'psychotrapincoming');
			this.boost({ atk: -1, spa: -1 }, target, this.effectState.source, this.dex.getActiveMove('psychotrap'));
		},
	},
	crimsonwarzone: {
		name: "Crimson Warzone",
		duration: 5,
		onFieldStart() {
			this.add('-fieldstart', 'Crimson Warzone');
		},
		onFieldRestart() {
			this.effectState.duration = 5;
			this.add('-fieldstart', 'Crimson Warzone');
		},
		onModifyAtk(atk, pokemon) {
			if (pokemon.isGrounded()) return this.chainModify(1.25);
		},
		onModifySpA(spa, pokemon) {
			if (pokemon.isGrounded()) return this.chainModify(1.25);
		},
		onDisableMove(pokemon) {
			if (!pokemon.isGrounded()) return;
			for (const slot of pokemon.moveSlots) {
				if (this.dex.moves.get(slot.id).category === 'Status' && slot.id !== 'mefirst') pokemon.disableMove(slot.id);
			}
		},
		onBeforeMovePriority: 5,
		onBeforeMove(pokemon, target, move) {
			if (pokemon.isGrounded() && move.category === 'Status' && move.id !== 'mefirst' &&
				!(move.isZ && move.isZOrMaxPowered)) {
				this.add('cant', pokemon, 'move: Taunt', move);
				return false;
			}
		},
		onFieldResidualOrder: 27,
		onFieldResidualSubOrder: 7,
		onFieldEnd() {
			this.add('-fieldend', 'Crimson Warzone');
		},
	},
	// CAP submissions
	promotionersblessing: {
		name: "Promotioner's Blessing",
		onSideStart(side, source) {
			this.add('-activate', source, "ability: Promotioner's Blessing");
		},
		onSwitchIn(pokemon) {
			if (!pokemon.hp) return;
			const stats: (keyof Pokemon['storedStats'])[] = ['atk', 'def', 'spa', 'spd', 'spe'];
			this.prng.shuffle(stats);
			stats.sort((a, b) => pokemon.storedStats[a] - pokemon.storedStats[b]);
			this.boost({ [this.sample(stats.slice(0, 3))]: 1 }, pokemon, this.effectState.source,
				this.dex.abilities.get('promotionersblessing'));
			if (this.randomChance(7, 10) && !pokemon.set.shiny) {
				pokemon.set.shiny = true;
				pokemon.details = pokemon.getUpdatedDetails();
				if (!pokemon.illusion) this.add('detailschange', pokemon, pokemon.details);
			}
		},
	},
};

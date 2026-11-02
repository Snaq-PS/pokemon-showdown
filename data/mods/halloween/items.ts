export const Items: import('../../../sim/dex-items').ModdedItemDataTable = {
	oldhuntersblade: {
		name: "Old Hunter's Blade",
		num: 11001,
		gen: 9,
		shortDesc: "Hauntmare: 1.2x Fighting/Steel power. Once, dodges a Fighting move and uses Phantom Force.",
		onBasePowerPriority: 15,
		onBasePower(basePower, user, target, move) {
			if (user.baseSpecies.baseSpecies === 'Hauntmare' && ['Fighting', 'Steel'].includes(move.type)) {
				return this.chainModify([4915, 4096]);
			}
		},
		onTakeItem: false,
		onTryHit(target, source, move) {
			if (target.baseSpecies.baseSpecies !== 'Hauntmare' || source === target ||
				move.type !== 'Fighting' || target.m.oldHuntersBladeUsed) return;
			target.m.oldHuntersBladeUsed = true;
			this.add('-activate', target, "item: Old Hunter's Blade");
			if (!source.hasType('Ghost') && source.addType('Ghost')) {
				this.add('-start', source, 'typeadd', 'Ghost', "[from] item: Old Hunter's Blade");
			}
			target.addVolatile('oldhuntersblade', source, this.effect);
			target.addVolatile('phantomforce', target, this.dex.getActiveMove('phantomforce'));
			this.queue.cancelMove(target);
			this.add('-prepare', target, 'Phantom Force');
			return null;
		},
		condition: {
			noCopy: true,
			onStart(target, source) {
				this.effectState.startTurn = this.turn;
				this.effectState.targetLoc = target.getLocOf(source);
			},
			onLockMove: 'phantomforce',
			onBeforeMovePriority: 100,
			onBeforeMove() {
				return false;
			},
			onResidualOrder: 40,
			onResidual(pokemon) {
				if (this.turn <= this.effectState.startTurn) return;
				const target = pokemon.getAtLoc(this.effectState.targetLoc);
				pokemon.removeVolatile('oldhuntersblade');
				if (!pokemon.hp || !pokemon.isActive) return;
				const move = this.dex.getActiveMove('phantomforce');
				delete move.onTryMove;
				this.actions.useMove(move, pokemon, { target, sourceEffect: this.dex.items.get('oldhuntersblade') });
			},
			onEnd(pokemon) {
				pokemon.removeVolatile('phantomforce');
			},
		},
	},
	shapemask: {
		name: "Shape Mask",
		num: 11002,
		gen: 9,
		fling: { basePower: 60 },
		shortDesc: "Ogerpon-Shape: 1.2x power; Ivy Cudgel is Steel-type. Enables its Dark Tera forme.",
		onBasePowerPriority: 15,
		onBasePower(basePower, user) {
			if (user.baseSpecies.name.startsWith('Ogerpon-Shape')) return this.chainModify([4915, 4096]);
		},
		onModifyType(move, pokemon) {
			if (move.id === 'ivycudgel' && pokemon.species.name.startsWith('Ogerpon-Shape')) move.type = 'Steel';
		},
		onTakeItem(item, source) {
			if (source.baseSpecies.baseSpecies === 'Ogerpon') return false;
			return true;
		},
		forcedForme: 'Ogerpon-Shape',
		itemUser: ['Ogerpon-Shape'],
	},
	royalrazor: {
		name: "Royal Razor",
		num: 11003,
		gen: 9,
		spritenum: 0,
		desc: "If held by Pirouetch, it changes to its Revealed forme.",
		forcedForme: "Pirouetch-Revealed",
		itemUser: ["Pirouetch-Revealed"],
		onStart(pokemon) {
			// Also handle unvalidated teams that enter battle as the base forme.
			if (pokemon.baseSpecies.name === 'Pirouetch' && !pokemon.transformed) {
				pokemon.formeChange('Pirouetch-Revealed', null, true);
			}
		},
		onTakeItem(item, pokemon, source) {
			if (pokemon.baseSpecies.baseSpecies === 'Pirouetch' || source?.baseSpecies.baseSpecies === 'Pirouetch') {
				return false;
			}
			return true;
		},
	},
	flameplate: {
		inherit: true,
		onTakeItem(item, pokemon, source) {
			if (pokemon.baseSpecies.num === 493 || source?.baseSpecies.num === 493 ||
				pokemon.baseSpecies.baseSpecies === 'Grimm' || source?.baseSpecies.baseSpecies === 'Grimm') {
				return false;
			}
			return true;
		},
	},
	princeshat: {
		name: "Prince's Hat",
		spritenum: 0,
		num: 11004,
		gen: 9,
		forcedForme: "Swirlix-Hatted",
		itemUser: ["Swirlix", "Swirlix-Hatted"],
		onTakeItem(item, pokemon, source) {
			if (pokemon.baseSpecies.baseSpecies === 'Swirlix' || source?.baseSpecies.baseSpecies === 'Swirlix') return false;
		},
	},
	goldenflower: {
		name: "Golden Flower",
		spritenum: 0,
		num: 11005,
		gen: 9,
		forcedForme: "Spritzee-Blossom",
		itemUser: ["Spritzee", "Spritzee-Blossom"],
		onTakeItem(item, pokemon, source) {
			if (pokemon.baseSpecies.baseSpecies === 'Spritzee' || source?.baseSpecies.baseSpecies === 'Spritzee') return false;
		},
	},
	warpweed: {
		name: "Warpweed",
		spritenum: 0,
		num: 11006,
		gen: 9,
		// Sleep, grounding and hazard checks are integrated in scripts.ts.
		onSetStatus(status, target, source, effect) {
			if (target.species.id !== 'partiweed') return;
			if ((effect as Move)?.status) this.add('-immune', target, '[from] item: Warpweed');
			return false;
		},
		onTryAddVolatile(status, target) {
			if (target.species.id === 'partiweed' && status.id === 'yawn') return null;
		},
		onBasePowerPriority: 20,
		onBasePower(basePower, attacker, defender, move) {
			if (attacker.species.id === 'partiweed' && move.type === 'Electric' &&
				this.field.isTerrain('electricterrain') && !attacker.isGrounded() && !attacker.isSemiInvulnerable()) {
				return this.chainModify([5325, 4096]);
			}
		},
		onTryHit(target, source, move) {
			if (target.species.id === 'melloweed' && move.type === 'Ground' && move.id !== 'thousandarrows') {
				this.add('-immune', target, '[from] item: Warpweed');
				return null;
			}
		},
	},
	// Memories
	bugmemory: {
		inherit: true,
		isNonstandard: null,
	},
	darkmemory: {
		inherit: true,
		isNonstandard: null,
	},
	dragonmemory: {
		inherit: true,
		isNonstandard: null,
	},
	electricmemory: {
		inherit: true,
		isNonstandard: null,
	},
	fairymemory: {
		inherit: true,
		isNonstandard: null,
	},
	fightingmemory: {
		inherit: true,
		isNonstandard: null,
	},
	firememory: {
		inherit: true,
		isNonstandard: null,
	},
	flyingmemory: {
		inherit: true,
		isNonstandard: null,
	},
	ghostmemory: {
		inherit: true,
		isNonstandard: null,
	},
	grassmemory: {
		inherit: true,
		isNonstandard: null,
	},
	groundmemory: {
		inherit: true,
		isNonstandard: null,
	},
	icememory: {
		inherit: true,
		isNonstandard: null,
	},
	poisonmemory: {
		inherit: true,
		isNonstandard: null,
	},
	psychicmemory: {
		inherit: true,
		isNonstandard: null,
	},
	rockmemory: {
		inherit: true,
		isNonstandard: null,
	},
	steelmemory: {
		inherit: true,
		isNonstandard: null,
	},
	watermemory: {
		inherit: true,
		isNonstandard: null,
	},
};

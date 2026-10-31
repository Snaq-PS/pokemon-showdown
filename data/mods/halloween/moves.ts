import { Moves as BaseMoves } from '../../moves';

export const Moves: import('../../../sim/dex-moves').ModdedMoveDataTable = {
	// Modified Moves
	bounce: {
		inherit: true,
		shortDesc: "Charges turn 1; attacks turn 2 with 30% paralysis. Storm Swing hits for 2x damage.",
		condition: {
			duration: 2,
			onInvulnerability(target, source, move) {
				if (['gust', 'twister', 'skyuppercut', 'thunder', 'hurricane', 'smackdown', 'thousandarrows', 'stormswing']
					.includes(move.id)) {
					return;
				}
				return false;
			},
			onSourceModifyDamage(damage, source, target, move) {
				if (move.id === 'gust' || move.id === 'twister' || move.id === 'stormswing') {
					return this.chainModify(2);
				}
			},
		},
	},
	fly: {
		inherit: true,
		shortDesc: "Charges turn 1; attacks turn 2. Storm Swing hits for 2x damage.",
		condition: {
			duration: 2,
			onInvulnerability(target, source, move) {
				if (['gust', 'twister', 'skyuppercut', 'thunder', 'hurricane', 'smackdown', 'thousandarrows', 'stormswing']
					.includes(move.id)) {
					return;
				}
				return false;
			},
			onSourceModifyDamage(damage, source, target, move) {
				if (move.id === 'gust' || move.id === 'twister' || move.id === 'stormswing') {
					return this.chainModify(2);
				}
			},
		},
	},
	heatcrash: {
		inherit: true,
		shortDesc: "Power depends on weight ratio; 120 BP with Falling Fighter.",
		basePowerCallback(pokemon, target) {
			const targetWeight = target.getWeight();
			const pokemonWeight = pokemon.getWeight();
			let bp;
			if (pokemonWeight >= targetWeight * 5 || pokemon.ability === 'fallingfighter') {
				bp = 120;
			} else if (pokemonWeight >= targetWeight * 4) {
				bp = 100;
			} else if (pokemonWeight >= targetWeight * 3) {
				bp = 80;
			} else if (pokemonWeight >= targetWeight * 2) {
				bp = 60;
			} else {
				bp = 40;
			}
			this.debug(`BP: ${bp}`);
			return bp;
		},
	},
	heavyslam: {
		inherit: true,
		shortDesc: "Power depends on weight ratio; 120 BP with Falling Fighter.",
		basePowerCallback(pokemon, target) {
			const targetWeight = target.getWeight();
			const pokemonWeight = pokemon.getWeight();
			let bp;
			if (pokemonWeight >= targetWeight * 5 || pokemon.ability === 'fallingfighter') {
				bp = 120;
			} else if (pokemonWeight >= targetWeight * 4) {
				bp = 100;
			} else if (pokemonWeight >= targetWeight * 3) {
				bp = 80;
			} else if (pokemonWeight >= targetWeight * 2) {
				bp = 60;
			} else {
				bp = 40;
			}
			this.debug(`BP: ${bp}`);
			return bp;
		},
	},
	multiattack: {
		inherit: true,
		isNonstandard: null,
	},
	skydrop: {
		inherit: true,
		shortDesc: "Lifts the target, then drops it next turn. Storm Swing hits for 2x damage.",
		condition: {
			duration: 2,
			onAnyDragOut(pokemon) {
				if (pokemon === this.effectState.target || pokemon === this.effectState.source) return false;
			},
			onFoeTrapPokemonPriority: -15,
			onFoeTrapPokemon(defender) {
				if (defender !== this.effectState.source) return;
				defender.trapped = true;
			},
			onFoeBeforeMovePriority: 12,
			onFoeBeforeMove(attacker, defender, move) {
				if (attacker === this.effectState.source) {
					attacker.activeMoveActions--;
					this.debug('Sky drop nullifying.');
					return null;
				}
			},
			onRedirectTargetPriority: 99,
			onRedirectTarget(target, source, source2) {
				if (source !== this.effectState.target) return;
				if (this.effectState.source.fainted) return;
				return this.effectState.source;
			},
			onAnyInvulnerability(target, source, move) {
				if (target !== this.effectState.target && target !== this.effectState.source) {
					return;
				}
				if (source === this.effectState.target && target === this.effectState.source) {
					return;
				}
				if (['gust', 'twister', 'skyuppercut', 'thunder', 'hurricane', 'smackdown', 'thousandarrows', 'stormswing']
					.includes(move.id)) {
					return;
				}
				return false;
			},
			onAnyBasePower(basePower, target, source, move) {
				if (target !== this.effectState.target && target !== this.effectState.source) {
					return;
				}
				if (source === this.effectState.target && target === this.effectState.source) {
					return;
				}
				if (move.id === 'gust' || move.id === 'twister' || move.id === 'stormswing') {
					this.debug('BP doubled on midair target');
					return this.chainModify(2);
				}
			},
			onFaint(target) {
				if (target.volatiles['skydrop'] && target.volatiles['twoturnmove'].source) {
					this.add('-end', target.volatiles['twoturnmove'].source, 'Sky Drop', '[interrupt]');
				}
			},
		},
	},

	// Prompt 1
	stormswing: {
		num: 10001,
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		name: "Storm Swing",
		pp: 16,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1, wind: 1 },
		target: "allAdjacent",
		type: "Flying",
		shortDesc: 'Damage doubles if the target is using Fly, Bounce, or Sky Drop.',
	},
	hideaway: {
		name: "Hide Away",
		num: 10002,
		gen: 9,
		accuracy: true,
		basePower: 0,
		category: 'Status',
		pp: 10,
		priority: 0,
		flags: {},
		target: 'all',
		type: 'Grass',
		terrain: 'grassyterrain',
		selfSwitch: true,
		shortDesc: 'Sets Grassy Terrain, then switches the user out.',
	},
	// Prompt 2
	disguiseslap: {
		name: 'Disguise Slap',
		num: 10003,
		gen: 9,
		accuracy: 100,
		basePower: 50,
		category: 'Physical',
		pp: 10,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Normal',
		shortDesc: '50 + half Fling power; applies the item effect without consuming it.',
		onPrepareHit(target, source) {
			if (source.ignoringItem(true) || !source.item || source.hasItem(['kingsrock', 'razorfang'])) return false;
		},
		onModifyMove(move, source) {
			const item = source.getItem();
			move.basePower = 50 + Math.floor((item.fling?.basePower || 0) / 2);
			if (!item.fling || ['kingsrock', 'razorfang'].includes(item.id)) return;
			if (item.isBerry) {
				move.secondaries = [
					{
						chance: 100,
						onHit(target, user, attack) {
							if (this.singleEvent('Eat', item, user.itemState, target, user, attack)) {
								this.runEvent('EatItem', target, user, attack, item);
								if (item.id === 'leppaberry') target.staleness = 'external';
							}
							if (item.onEat) target.ateBerry = true;
						},
					},
				];
			} else if (item.fling.effect) {
				move.secondaries = [{ chance: 100, onHit: item.fling.effect }];
			} else if (item.fling.status) {
				move.secondaries = [{ chance: 100, status: item.fling.status }];
			} else if (item.fling.volatileStatus) {
				move.secondaries = [{ chance: 100, volatileStatus: item.fling.volatileStatus }];
			}
		},
	},
	// Prompt 3
	humanshield: {
		name: 'Human Shield',
		num: 10004,
		gen: 9,
		accuracy: true,
		basePower: 0,
		category: 'Status',
		pp: 10,
		priority: 4,
		flags: { noassist: 1, failcopycat: 1 },
		target: 'self',
		type: 'Psychic',
		stallingMove: true,
		volatileStatus: 'humanshield',
		shortDesc: 'Protects the user; blocked attackers lose 1 Sp. Atk.',
		onPrepareHit(pokemon) {
			return !!this.queue.willAct() && this.runEvent('StallMove', pokemon);
		},
		onHit(pokemon) {
			pokemon.addVolatile('stall');
		},
		condition: {
			duration: 1,
			onStart(target) {
				this.add('-singleturn', target, 'Protect');
			},
			onTryHitPriority: 3,
			onTryHit(target, source, move) {
				if (this.checkMoveBypassesProtect(move, source, target)) return;
				if (move.smartTarget) move.smartTarget = false;
				else this.add('-activate', target, 'move: Protect');
				if (source.volatiles.lockedmove?.duration === 2) delete source.volatiles.lockedmove;
				if (move.category !== 'Status') this.boost({ spa: -1 }, source, target, this.dex.getActiveMove('humanshield'));
				return this.NOT_FAIL;
			},
			onHit(target, source, move) {
				if (move.isZOrMaxPowered && move.category !== 'Status') {
					this.boost({ spa: -1 }, source, target, this.dex.getActiveMove('humanshield'));
				}
			},
		},
	},
	broomsweep: {
		name: 'Broom Sweep',
		num: 10005,
		gen: 9,
		accuracy: 100,
		basePower: 90,
		category: 'Special',
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Flying',
		shortDesc: 'Removes hazards, opposing screens/Safeguard/Mist and terrain.',
		onAfterHit(target, source) {
			const hazards = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge'];
			for (const id of ['reflect', 'lightscreen', 'auroraveil', 'safeguard', 'mist', ...hazards]) {
				if (target.side.removeSideCondition(id) && hazards.includes(id)) {
					this.add('-sideend', target.side, this.dex.conditions.get(id).name, '[from] move: Broom Sweep', `[of] ${source}`);
				}
			}
			for (const id of hazards) {
				if (source.side.removeSideCondition(id)) {
					this.add('-sideend', source.side, this.dex.conditions.get(id).name, '[from] move: Broom Sweep', `[of] ${source}`);
				}
			}
			this.field.clearTerrain();
		},
		onAfterSubDamage(damage, target, source) {
			const hazards = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge'];
			for (const id of ['reflect', 'lightscreen', 'auroraveil', 'safeguard', 'mist', ...hazards]) {
				if (target.side.removeSideCondition(id) && hazards.includes(id)) {
					this.add('-sideend', target.side, this.dex.conditions.get(id).name, '[from] move: Broom Sweep', `[of] ${source}`);
				}
			}
			for (const id of hazards) {
				if (source.side.removeSideCondition(id)) {
					this.add('-sideend', source.side, this.dex.conditions.get(id).name, '[from] move: Broom Sweep', `[of] ${source}`);
				}
			}
			this.field.clearTerrain();
		},
	},
	// Prompt 5
	plasmadrainer: {
		name: 'Plasma Drainer',
		num: 10006,
		gen: 9,
		accuracy: 100,
		basePower: 90,
		category: 'Physical',
		pp: 10,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1, heal: 1, metronome: 1 },
		target: 'normal',
		type: 'Electric',
		shortDesc: 'Drains 1/2 damage; removes 3 PP from the target\'s last move.',
		drain: [1, 2],
		onHit(target) {
			let move = target.lastMove;
			if (!move || move.isZ) return;
			if (move.isMax && move.baseMove) move = this.dex.getActiveMove(move.baseMove);
			const deducted = target.deductPP(move.id, 3);
			if (deducted) this.add('-activate', target, 'move: Spite', move.name, deducted);
		},
	},
	psychotrap: {
		name: 'Psycho Trap',
		num: 10007,
		gen: 9,
		accuracy: 100,
		basePower: 60,
		category: 'Physical',
		pp: 15,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Psychic',
		shortDesc: 'Intercepts switches; the incoming Pokemon loses 1 Atk and Sp. Atk.',
		beforeTurnCallback(pokemon, target) {
			pokemon.addVolatile('psychotrap', pokemon, this.dex.getActiveMove('psychotrap'));
			if (pokemon.volatiles.psychotrap) pokemon.volatiles.psychotrap.chosenTarget = target;
		},
		onModifyMove(move, source, target) {
			if (target?.beingCalledBack || target?.switchFlag) {
				move.accuracy = true;
				move.tracksTarget = true;
			}
		},
		condition: {
			duration: 1,
			onFoeBeforeSwitchOut(pokemon) {
				const source: Pokemon = this.effectState.source;
				if (this.effectState.chosenTarget !== pokemon || !source.isAdjacent(pokemon) || !source.hp ||
					(source.volatiles.encore && source.volatiles.encore.move !== 'psychotrap') ||
					!this.queue.cancelMove(source)) return;
				if (!(pokemon as Pokemon & { pursuitActivated?: boolean }).pursuitActivated) {
					this.add('-activate', pokemon, 'move: Psycho Trap');
					(pokemon as Pokemon & { pursuitActivated?: boolean }).pursuitActivated = true;
				}
				for (const [index, action] of this.queue.entries()) {
					if (action.pokemon !== source) continue;
					if (action.choice === 'megaEvo') this.actions.runMegaEvo(source);
					else if (action.choice === 'terastallize') this.actions.terastallize(source);
					else continue;
					this.queue.list.splice(index, 1);
					break;
				}
				pokemon.removeVolatile('destinybond');
				this.actions.runMove('psychotrap', source, source.getLocOf(pokemon), { sourceEffect: this.effectState.sourceEffect });
				if (source.moveThisTurnResult) {
					pokemon.side.addSlotCondition(pokemon, 'psychotrapincoming', source, this.dex.getActiveMove('psychotrap'));
				}
			},
		},
	},
	stargaze: {
		name: 'Stargaze',
		num: 10008,
		gen: 9,
		accuracy: true,
		basePower: 0,
		category: 'Status',
		pp: 10,
		priority: 0,
		flags: { snatch: 1, metronome: 1 },
		target: 'self',
		type: 'Fairy',
		shortDesc: '+1 Sp. Atk/Sp. Def and Focus Energy; crit boosts do not stack.',
		boosts: { spa: 1, spd: 1 },
		volatileStatus: 'focusenergy',
	},
	// Prompt 6
	patchworkpress: {
		name: 'Patchwork Press',
		num: 10009,
		gen: 9,
		accuracy: 100,
		basePower: 80,
		category: 'Special',
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Ghost',
		shortDesc: 'Torments a target that has not moved yet. Ignores Normalize.',
		secondary: {
			chance: 100,
			onHit(target, source, move) {
				if (this.queue.willMove(target)) target.addVolatile('torment', source, move);
			},
		},
	},
	doubledip: {
		name: 'Double Dip',
		num: 10010,
		gen: 9,
		accuracy: true,
		basePower: 0,
		category: 'Status',
		pp: 5,
		priority: 0,
		flags: { failinstruct: 1, noassist: 1, failcopycat: 1, nosleeptalk: 1 },
		target: 'self',
		type: 'Normal',
		shortDesc: 'Repeats the last move twice at 0.75x power, spending 5 of its PP.',
		callsMove: true,
		beforeMoveCallback(source) {
			source.m.doubleDipMove = source.lastMove?.id;
			source.m.doubleDipTargetLoc = source.lastMoveTargetLoc;
		},
		onHit(source, target, move) {
			const id = source.m.doubleDipMove;
			const repeated = this.dex.moves.get(id);
			const slot = source.getMoveData(repeated.id);
			if (!id || repeated.id === 'doubledip' || !slot?.pp || repeated.isZ || repeated.isMax ||
				repeated.callsMove || repeated.flags.failinstruct || repeated.flags.charge || repeated.flags.recharge) return false;
			source.deductPP(repeated.id, 5);
			source.addVolatile('doubledip');
			try {
				for (let i = 0; i < 2 && source.hp && source.isActive; i++) {
					const repeatedTarget = this.getTarget(source, repeated, source.m.doubleDipTargetLoc);
					this.actions.useMove(repeated, source, { target: repeatedTarget, sourceEffect: move });
				}
			} finally {
				source.removeVolatile('doubledip');
			}
		},
		condition: {
			onBasePowerPriority: 12,
			onBasePower(basePower, source, target, move) {
				if (move.sourceEffect === 'doubledip') return this.chainModify(0.75);
			},
		},
	},
	// Prompt 7
	pumpkinpapow: {
		name: 'Pumpkin Papow',
		num: 10011,
		gen: 9,
		accuracy: 100,
		basePower: 90,
		category: 'Physical',
		pp: 10,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Grass',
		shortDesc: 'Recycles consumed Berries for the user\'s entire team.',
		onAfterHit(target, source, move) {
			for (const ally of source.side.pokemon) {
				if (ally.item || !ally.lastItem) continue;
				const berry = this.dex.items.get(ally.lastItem);
				if (!berry.isBerry) continue;
				if (ally.isActive && ally.hp) {
					if (!ally.setItem(berry, source, move)) continue;
					this.add('-item', ally, berry.name, '[from] move: Pumpkin Papow');
				} else {
					// setItem deliberately rejects benched/fainted Pokemon; restore their
					// inventory without running entry/item callbacks while off the field.
					ally.item = berry.id;
					ally.itemState = this.initEffectState({ id: berry.id, target: ally });
				}
				ally.lastItem = '';
			}
		},
		onAfterSubDamage(damage, target, source, move) {
			for (const ally of source.side.pokemon) {
				if (ally.item || !ally.lastItem) continue;
				const berry = this.dex.items.get(ally.lastItem);
				if (!berry.isBerry) continue;
				if (ally.isActive && ally.hp) {
					if (!ally.setItem(berry, source, move)) continue;
					this.add('-item', ally, berry.name, '[from] move: Pumpkin Papow');
				} else {
					// setItem deliberately rejects benched/fainted Pokemon; restore their
					// inventory without running entry/item callbacks while off the field.
					ally.item = berry.id;
					ally.itemState = this.initEffectState({ id: berry.id, target: ally });
				}
				ally.lastItem = '';
			}
		},
	},
	// Prompt 8
	greenthumb: {
		name: 'Green Thumb',
		num: 10012,
		gen: 9,
		accuracy: true,
		basePower: 0,
		category: 'Status',
		pp: 10,
		priority: 0,
		flags: { snatch: 1, metronome: 1 },
		target: 'allySide',
		type: 'Grass',
		shortDesc: 'Plants a mask-dependent Seedling that blooms after two turns.',
		onTry(source) {
			return source.hasItem(['hearthflamemask', 'wellspringmask', 'cornerstonemask']);
		},
		sideCondition: 'seedling',
	},
	// Prompt 9
	coldones: {
		name: 'Cold Ones',
		num: 10013,
		gen: 9,
		accuracy: 100,
		basePower: 20,
		category: 'Physical',
		pp: 10,
		priority: 1,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Fairy',
		shortDesc: 'Hits twice. Priority +1.',
		multihit: 2,
	},
	pridepiercer: {
		name: 'Pride Piercer',
		num: 10014,
		gen: 9,
		accuracy: 100,
		basePower: 90,
		category: 'Physical',
		pp: 10,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
		target: 'normal',
		type: 'Ice',
		shortDesc: 'Sets a rainbow on the user\'s side for four turns.',
		self: { sideCondition: 'waterpledge' },
	},
	// Prompt 10
	wrapperslice: {
		name: 'Wrapper Slice',
		num: 10015,
		gen: 9,
		accuracy: 100,
		basePower: 80,
		category: 'Physical',
		pp: 10,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1, heal: 1 },
		target: 'normal',
		type: 'Fairy',
		shortDesc: 'Drains 1/2 the damage dealt. Slicing move.',
		drain: [1, 2],
	},
	hiddenrazor: {
		name: 'Hidden Razor',
		num: 10016,
		gen: 9,
		accuracy: 100,
		basePower: 70,
		category: 'Physical',
		pp: 15,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1, metronome: 1, slicing: 1 },
		target: 'normal',
		type: 'Steel',
		shortDesc: 'High critical-hit ratio. Slicing move.',
		critRatio: 2,
	},
	// Prompt 11
	ironcage: {
		name: 'Iron Cage',
		num: 10017,
		gen: 9,
		accuracy: 90,
		basePower: 80,
		category: 'Physical',
		pp: 15,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Steel',
		shortDesc: 'Traps the target for 4-5 turns, dealing 1/8 max HP each turn.',
		volatileStatus: 'partiallytrapped',
	},
	// Prompt 12
	silentwind: {
		name: 'Silent Wind',
		num: 10018,
		gen: 9,
		accuracy: 100,
		basePower: 90,
		category: 'Special',
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1, wind: 1 },
		target: 'normal',
		type: 'Flying',
		shortDesc: 'Adds Ghost to the target, or lowers Sp. Def if already Ghost.',
		secondary: {
			chance: 100,
			onHit(target, source, move) {
				if (target.hasType('Ghost')) this.boost({ spd: -1 }, target, source, move);
				else if (target.addType('Ghost')) this.add('-start', target, 'typeadd', 'Ghost', '[from] move: Silent Wind');
			},
		},
	},
	papelpummel: {
		name: 'Papel Pummel',
		num: 10019,
		gen: 9,
		accuracy: 100,
		basePower: 80,
		category: 'Physical',
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Grass',
		shortDesc: 'Uses higher offensive stat; type/effect varies with Spirpapel forme.',
		secondary: {
			chance: 100,
			onHit() { },
		},
		onModifyType(move, source) {
			const types: { [id: string]: string } = {
				spirpapel: 'Grass',
				spirpapelcalaca: 'Ghost',
				spirpapelvela: 'Fire',
				spirpapelcempasuchil: 'Ground',
			};
			move.type = types[source.species.id] || 'Grass';
		},
		onModifyMove(move, source) {
			if (source.getStat('spa', false, true) > source.getStat('atk', false, true)) move.category = 'Special';
			if (source.species.id === 'spirpapel') {
				move.onEffectiveness = function (typeMod, target, type) {
					if (type === 'Grass') return 1;
				};
			} else if (source.species.id === 'spirpapelcalaca') {
				move.secondaries = [
					{
						chance: 100,
						onHit(target, user) {
							target.addVolatile('healblock', user, this.dex.getActiveMove('psychicnoise'));
						},
					},
				];
			} else if (source.species.id === 'spirpapelvela') {
				move.secondaries = [
					{
						chance: 100,
						onHit(target) {
							target.clearBoosts();
							this.add('-clearboost', target);
						},
					},
				];
			} else if (source.species.id === 'spirpapelcempasuchil') {
				move.ignoreImmunity = { Ground: true };
				move.onEffectiveness = BaseMoves.thousandarrows.onEffectiveness;
				move.secondaries = [{ chance: 100, volatileStatus: 'smackdown' }];
			}
		},
	},
	// Prompt 13
	jackflare: {
		name: 'Jack Flare',
		num: 10020,
		gen: 9,
		accuracy: 100,
		basePower: 85,
		category: 'Special',
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Fire',
		shortDesc: 'Lowers the target\'s Attack by 1.',
		secondary: { chance: 100, boosts: { atk: -1 } },
	},
	// Prompt 14
	chillout: {
		name: 'Chill Out',
		num: 10021,
		gen: 9,
		accuracy: 100,
		basePower: 120,
		category: 'Special',
		pp: 5,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Ice',
		shortDesc: 'Uses higher offense; lowers the user\'s Def and Sp. Def by 1.',
		onModifyMove(move, source) {
			if (source.getStat('atk', false, true) > source.getStat('spa', false, true)) move.category = 'Physical';
		},
		self: { boosts: { def: -1, spd: -1 } },
		zMove: { basePower: 190 },
	},
	bunkshot: {
		...BaseMoves.gunkshot,
		name: 'Bunk Shot',
		num: 10022,
		gen: 9,
		shortDesc: "30% chance to poison the target.",
	},
	vish: {
		...BaseMoves.wish,
		name: 'Vish',
		num: 10023,
		gen: 9,
		shortDesc: "Next turn, heals the active ally by 1/2 the user's max HP.",
	},
	crowfeast: {
		name: 'Crow Feast',
		num: 10024,
		gen: 9,
		accuracy: 100,
		basePower: 60,
		category: 'Physical',
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Flying',
		shortDesc: '+20 BP per target stat-drop stage; lowers its Attack by 1.',
		basePowerCallback(source, target) {
			return 60 + 20 * Object.values(target.boosts).reduce((sum, stage) => sum + Math.max(0, -stage), 0);
		},
		secondary: { chance: 100, boosts: { atk: -1 } },
	},
	jaroma: {
		name: 'Jaroma',
		num: 10025,
		gen: 9,
		accuracy: 100,
		basePower: 100,
		category: 'Special',
		pp: 10,
		priority: 0,
		flags: { protect: 1, mirror: 1, metronome: 1 },
		target: 'normal',
		type: 'Grass',
		shortDesc: 'High critical-hit ratio; 20% chance to set Grassy Terrain.',
		critRatio: 2,
		secondary: {
			chance: 20,
			onHit(target, source, move) {
				this.field.setTerrain('grassyterrain', source, move);
			},
		},
	},
};

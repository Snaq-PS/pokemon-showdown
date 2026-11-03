export const Abilities: import('../../../sim/dex-abilities').ModdedAbilityDataTable = {
	// Prompt 1
	fallingfighter: {
		onStart(source) {
			this.add('-ability', source, 'Gravity Field');
			this.field.addPseudoWeather('gravity', source);
		},
		flags: {},
		name: "Falling Fighter",
		shortDesc: "On switch-in, this Pokemon starts Gravity.",
		rating: 4,
		num: 10001,
	},
	// Prompt 2
	thegreenlady: {
		name: "The Green Lady",
		num: 10002,
		gen: 9,
		rating: 2,
		flags: {},
		shortDesc: "While Grassy Terrain is active, this Pokemon also has the Grass type.",
		onType(types, pokemon) {
			if (this.field.isTerrain('grassyterrain') && !types.includes('Grass') &&
				pokemon.addedType !== 'Grass') return [...types, 'Grass'];
		},
	},
	asoneheadless: {
		name: "As One (Headless)",
		num: 10003,
		gen: 9,
		rating: 4,
		shortDesc: "Blocks the first damage, loses 1/8 HP and its head; Attack +1 per move KO.",
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1,
			failskillswap: 1, cantsuppress: 1, breakable: 1, notransform: 1 },
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (effect?.effectType === 'Move' && ['headlesshorsemanpumpkinhead'].includes(target.species.id)) {
				this.add('-activate', target, 'ability: Spooky Disguise');
				this.effectState.busted = true;
				return 0;
			}
		},
		onCriticalHit(target, source, move) {
			if (!target) return;
			if (!['headlesshorsemanpumpkinhead'].includes(target.species.id)) {
				return;
			}
			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move)) return;
			return false;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target || move.category === 'Status') return;
			if (!['headlesshorsemanpumpkinhead'].includes(target.species.id)) {
				return;
			}

			const hitSub = target.volatiles['substitute'] && !move.flags['bypasssub'] && !(move.infiltrates && this.gen >= 6);
			if (hitSub) return;

			if (!target.runImmunity(move)) return;
			return 0;
		},
		onUpdate(pokemon) {
			if (['headlesshorsemanpumpkinhead'].includes(pokemon.species.id) && this.effectState.busted) {
				const speciesid = 'Headless Horseman';
				pokemon.formeChange(speciesid, this.effect, true);
				this.damage(pokemon.baseMaxhp / 8, pokemon, pokemon, this.dex.species.get(speciesid));
			}
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect?.effectType === 'Move') this.boost({ atk: length }, source);
		},
	},
	// Prompt 3
	abduction: {
		name: "Abduction",
		num: 10004,
		gen: 9,
		rating: 4.5,
		flags: {},
		shortDesc: "This Pokemon's eligible attacks hit twice. Second hit has 1/4 damage.",
		onPrepareHit(source, target, move) {
			if (move.category === 'Status' || move.multihit || move.flags['noparentalbond'] || move.flags['charge'] ||
				move.flags['futuremove'] || move.spreadHit || move.isZ || move.isMax) return;
			move.multihit = 2;
			move.multihitType = 'parentalbond';
		},
		// Damage modifier implemented in BattleActions#modifyDamage()
		onSourceModifySecondaries(secondaries, target, source, move) {
			if (move.multihitType === 'parentalbond' && move.id === 'secretpower' && move.hit < 2) {
				// hack to prevent accidentally suppressing King's Rock/Razor Fang
				return secondaries.filter(effect => effect.volatileStatus === 'flinch');
			}
		},
	},
	jumpscare: {
		name: "Jumpscare",
		num: 10005,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "Once per battle, flinches opposing Pokemon on switch-in.",
		onStart(pokemon) {
			if (pokemon.m.jumpscareUsed) return;
			pokemon.m.jumpscareUsed = true;
			this.add('-ability', pokemon, 'Jumpscare');
			for (const foe of pokemon.foes()) foe.addVolatile('flinch', pokemon, this.effect);
		},
	},
	costumeconfusion: {
		name: "Costume Confusion",
		num: 10006,
		gen: 9,
		rating: 4.5,
		shortDesc: "First hit costs 1/8 HP and enrages/taunts Mimikry. Certain moves gain 2x power.",
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1,
			failskillswap: 1, cantsuppress: 1, breakable: 1, notransform: 1 },
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (damage > 0 && effect?.effectType === 'Move' && target.species.id === 'mimikry' && !target.m.costumeBroken) {
				target.m.costumeBroken = true;
				target.m.costumePending = true;
				this.add('-activate', target, 'ability: Costume Confusion');
				return 0;
			}
		},
		onCriticalHit(target, source, move) {
			if (target.species.id !== 'mimikry' || target.m.costumeBroken) return;
			const hitSub = target.volatiles.substitute && !move.flags.bypasssub && !move.infiltrates;
			if (!hitSub && target.runImmunity(move)) return false;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (!target || move.category === 'Status' || target.species.id !== 'mimikry' || target.m.costumeBroken) return;
			const hitSub = target.volatiles.substitute && !move.flags.bypasssub && !move.infiltrates;
			if (!hitSub && target.runImmunity(move)) return 0;
		},
		onUpdate(pokemon) {
			if (!pokemon.m.costumePending) return;
			delete pokemon.m.costumePending;
			pokemon.formeChange('Mimikry-Enraged', this.effect, true);
			this.damage(pokemon.baseMaxhp / 8, pokemon, pokemon, this.dex.species.get('Mimikry-Enraged'));
			if (pokemon.hp) pokemon.addVolatile('taunt', pokemon, this.effect);
		},
		onBasePowerPriority: 20,
		onBasePower(basePower, pokemon, target, move) {
			if (pokemon.species.id === 'mimikryenraged' &&
				['lashout', 'stompingtantrum', 'outrage', 'ragingfury', 'thrash', 'temperflare'].includes(move.id)) {
				return this.chainModify(2);
			}
		},
	},
	princesspower: {
		name: "Princess Power",
		num: 10007,
		gen: 9,
		rating: 4,
		flags: { breakable: 1 },
		shortDesc: "Levitate + Queenly Majesty: airborne and protects its side from priority moves.",
		// Airborne behavior is integrated in Scripts.pokemon.isGrounded.
		onFoeTryMove(target, source, move) {
			const exceptions = ['perishsong', 'flowershield', 'rototiller'];
			if (move.target === 'foeSide' || (move.target === 'all' && !exceptions.includes(move.id))) return;
			const holder = this.effectState.target;
			if ((source.isAlly(holder) || move.target === 'all') && move.priority > 0.1) {
				this.attrLastMove('[still]');
				this.add('cant', holder, 'ability: Princess Power', move, `[of] ${target}`);
				return false;
			}
		},
	},
	cushionhead: {
		name: "Cushion Head",
		num: 10008,
		gen: 9,
		rating: 4,
		flags: { breakable: 1 },
		shortDesc: "Fluffy + Rock Head: half contact damage, double Fire damage, no recoil.",
		onSourceModifyDamage(damage, source, target, move) {
			let mod = 1;
			if (move.type === 'Fire') mod *= 2;
			if (move.flags['contact']) mod /= 2;
			return this.chainModify(mod);
		},
		onDamage(damage, target, source, effect) {
			if (effect.id === 'recoil') {
				if (!this.activeMove) throw new Error("Battle.activeMove is null");
				if (this.activeMove.id !== 'struggle') return null;
			}
		},
	},
	// Prompt 4
	doomroom: {
		name: "Doom Room",
		num: 10009,
		gen: 9,
		rating: 3.5,
		flags: {},
		shortDesc: "The user's Trick Room, Magic Room and Wonder Room last two extra turns.",
		onModifyMove(move) {
			if (['trickroom', 'magicroom', 'wonderroom'].includes(move.id)) {
				(move as ActiveMove & { doomRoomWasActive?: boolean }).doomRoomWasActive = !!this.field.pseudoWeather[move.id];
			}
		},
		onAfterMove(pokemon, target, move) {
			if (!['trickroom', 'magicroom', 'wonderroom'].includes(move.id) ||
				(move as ActiveMove & { doomRoomWasActive?: boolean }).doomRoomWasActive !== false) return;
			const room = this.field.pseudoWeather[move.id];
			if (room?.source === pokemon && room.duration) room.duration += 2;
		},
	},
	spookyscary: {
		name: "Spooky Scary",
		num: 10010,
		gen: 9,
		rating: 3.5,
		flags: {},
		shortDesc: "While active, all damaging sound moves become physical.",
		onAnyModifyMove(move) {
			if (move.flags['sound'] && move.category !== 'Status') move.category = 'Physical';
		},
	},
	productive: {
		name: "Productive",
		num: 10011,
		gen: 9,
		rating: 4.5,
		flags: {},
		shortDesc: "Move KOs add one extra hit at 1/4 base power to eligible attacks; resets on switching.",
		onSwitchIn(pokemon) {
			pokemon.m.productiveKOs = 0;
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect?.effectType === 'Move') source.m.productiveKOs = (source.m.productiveKOs || 0) + length;
		},
		onPrepareHit(source, target, move) {
			const copies = source.m.productiveKOs || 0;
			if (!copies || move.category === 'Status' || move.multihit || move.flags['noparentalbond'] ||
				move.flags['charge'] || move.flags['futuremove'] || move.spreadHit || move.isZ || move.isMax) return;
			move.multihit = 1 + copies;
			(move as ActiveMove & { productiveHits?: boolean }).productiveHits = true;
		},
		onBasePowerPriority: 20,
		onBasePower(basePower, pokemon, target, move) {
			if ((move as ActiveMove & { productiveHits?: boolean }).productiveHits && move.hit > 1) return this.chainModify(0.25);
		},
	},
	embodyaspectshape: {
		name: "Embody Aspect (Shape)",
		num: 10012,
		gen: 9,
		rating: 4.5,
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		shortDesc: "Attack +1 per move KO; on switch-in, Attack +1 per prior KO this battle.",
		// Scripts.runEvent records confirmed move KOs, including those scored before Terastallizing.
		onSwitchIn(pokemon) {
			const kos = pokemon.m.shapeKOs || 0;
			if (kos) this.boost({ atk: kos }, pokemon);
		},
		onSourceAfterFaint(length, target, source, effect) {
			if (effect?.effectType === 'Move') this.boost({ atk: length }, source);
		},
	},
	// Prompt 5
	segmentation: {
		name: "Segmentation",
		num: 10013,
		gen: 9,
		rating: 4,
		flags: { breakable: 1 },
		shortDesc: "Next two attack hits deal 2/3 damage. Healing to full restores one charge (max two).",
		onStart(pokemon) {
			pokemon.m.segmentationCharges ??= 2;
			pokemon.m.segmentationWasHurt ??= pokemon.hp < pokemon.maxhp;
		},
		onDamage(damage, target, source, effect) {
			if (damage <= 0) return;
			target.m.segmentationWasHurt = true;
			target.m.segmentationCharges ??= 2;
			if (effect?.effectType === 'Move' && target.m.segmentationCharges > 0) {
				target.m.segmentationCharges--;
				this.add('-activate', target, 'ability: Segmentation');
				return this.modify(damage, [2, 3]);
			}
		},
		onUpdate(pokemon) {
			if (pokemon.hp < pokemon.maxhp) {
				pokemon.m.segmentationWasHurt = true;
			} else if (pokemon.m.segmentationWasHurt) {
				pokemon.m.segmentationWasHurt = false;
				pokemon.m.segmentationCharges = Math.min(2, (pokemon.m.segmentationCharges ?? 2) + 1);
			}
		},
	},
	naughtylist: {
		name: "Naughty List",
		num: 10014,
		gen: 9,
		rating: 3.5,
		flags: {},
		shortDesc: "Present is always a 120-power Dark attack and never heals the target.",
		onModifyType(move) {
			if (move.id === 'present') move.type = 'Dark';
		},
		onModifyMove(move) {
			if (move.id !== 'present') return;
			move.type = 'Dark';
			move.basePower = 120;
			delete move.heal;
			delete move.infiltrates;
		},
	},
	// Prompt 6
	reassure: {
		name: "Reassure",
		num: 10015,
		gen: 9,
		rating: 3.5,
		flags: {},
		shortDesc: "On switch-in, lowers adjacent opponents' Special Attack by one stage.",
		onStart(pokemon) {
			this.add('-ability', pokemon, 'Reassure');
			for (const foe of pokemon.adjacentFoes()) {
				if (foe.volatiles['substitute']) this.add('-immune', foe);
				else this.boost({ spa: -1 }, foe, pokemon, this.effect, true);
			}
		},
	},
	barfout: {
		name: "Barf Out",
		num: 10016,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "At turn end, recycles its consumed item; a consumed Red Card causes Self-Destruct instead.",
		onResidualOrder: 28,
		onResidual(pokemon) {
			if (!pokemon.hp || pokemon.item || !pokemon.lastItem) return;
			this.actions.useMove(pokemon.lastItem === 'redcard' ? 'selfdestruct' : 'recycle',
				pokemon, { sourceEffect: this.effect });
		},
	},
	// Prompt 7
	fizzybody: {
		name: "Fizzy Body",
		num: 10017,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "Contact attackers become confused and have a 30% chance to become drowsy.",
		onDamagingHit(damage, target, source, move) {
			if (!this.checkMoveMakesContact(move, source, target)) return;
			source.addVolatile('confusion', target, this.effect);
			if (this.randomChance(3, 10) && !source.status && source.runStatusImmunity('slp')) {
				source.addVolatile('yawn', target, this.effect);
			}
		},
	},
	evangeleyes: {
		name: "Evangel Eyes",
		num: 10018,
		gen: 9,
		rating: 4,
		flags: { breakable: 1 },
		shortDesc: "Takes half damage from Dark attacks; its special moves do not check accuracy.",
		onSourceModifyDamage(damage, source, target, move) {
			if (move.type === 'Dark') return this.chainModify(0.5);
		},
		onModifyMovePriority: -1,
		onModifyMove(move) {
			if (move.category === 'Special') move.accuracy = true;
		},
	},
	// Prompt 8
	tableturn: {
		name: "Table-Turn",
		num: 10019,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "While active, inverts type weaknesses, resistances and natural immunities for everyone.",
		onAnyNegateImmunity: false,
		onAnyEffectiveness(typeMod, target, type, move) {
			// One field inversion, even when more than one active Pokemon has Table-Turn.
			const holder = this.getAllActive().find(pokemon => pokemon.hasAbility('tableturn'));
			if (holder !== this.effectState.target) return;
			if (move?.id === 'freezedry' && type === 'Water') return;
			if (move && !this.dex.getImmunity(move, type)) return 1;
			if (typeMod) return -typeMod;
		},
	},
	codearmor: {
		name: "Code Armor",
		num: 10020,
		gen: 9,
		rating: 3,
		flags: {},
		shortDesc: "After a contact hit, its primary type becomes a random different type.",
		onDamagingHit(damage, target, source, move) {
			if (!target.hp || source.isAlly(target) || target.terastallized ||
				!this.checkMoveMakesContact(move, source, target)) return;
			const options = [...new Set([...this.dex.types.names(), '???', 'Bird', 'Stellar'])]
				.filter(type => type !== target.types[0]);
			const type = this.sample(options);
			const types = [...new Set([type, ...target.types.slice(1)])];
			const addedType = target.addedType;
			// Stellar is explicitly allowed by this submission, unlike ordinary type changes.
			target.setType(types, true);
			if (addedType && !types.includes(addedType)) target.addType(addedType);
			this.add('-start', target, 'typechange', target.getTypes().join('/'), '[from] ability: Code Armor');
		},
	},
	pumpkindisguise: {
		name: "Pumpkin Disguise",
		num: 10021,
		gen: 9,
		rating: 3,
		flags: { breakable: 1 },
		shortDesc: "Immune to major status; contact attackers have a 30% chance to be burned.",
		onSetStatus(status, target, source, effect) {
			if ((effect as Move)?.status) this.add('-immune', target, '[from] ability: Pumpkin Disguise');
			return false;
		},
		onTryAddVolatile(status, target) {
			if (status.id === 'yawn') {
				this.add('-immune', target, '[from] ability: Pumpkin Disguise');
				return null;
			}
		},
		onDamagingHit(damage, target, source, move) {
			if (this.checkMoveMakesContact(move, source, target) && this.randomChance(3, 10)) {
				source.trySetStatus('brn', target);
			}
		},
	},
	// Prompt 9
	movesurvey: {
		name: "MOVE SURVEY",
		num: 10022,
		gen: 9,
		rating: 4,
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		shortDesc: "Types match its first two moves; its Plates and Memories cannot be removed.",
		onTypePriority: 1,
		onType(types, pokemon) {
			const slots = pokemon.moveSlots.length ? pokemon.moveSlots : pokemon.baseMoveSlots;
			const item = pokemon.ignoringItem() ? null : pokemon.getItem();
			const result: string[] = [];
			for (const slot of slots.slice(0, 2)) {
				const move = this.dex.moves.get(slot.id);
				let type = move.type;
				if (move.id === 'judgment') type = item?.onPlate || 'Normal';
				if (move.id === 'multiattack') type = item?.onMemory || 'Normal';
				if (move.id === 'hiddenpower') type = pokemon.hpType;
				if (!result.includes(type)) result.push(type);
			}
			return result.length ? result : ['???'];
		},
		onTakeItem(item) {
			if (item.onPlate || item.onMemory) return false;
		},
	},
	moralsupport: {
		name: "Moral Support",
		num: 10023,
		gen: 9,
		rating: 3,
		flags: {},
		shortDesc: "Gains +1 Sp. Atk when its or an ally's major status is cured; twice per switch-in.",
		onSwitchIn(pokemon) {
			pokemon.m.moralSupportUses = 0;
		},
	},
	// Prompt 10
	wrapup: {
		name: "Wrap-Up",
		num: 10024,
		gen: 9,
		rating: 3,
		flags: {},
		shortDesc: "Its partial trapping lasts 7 turns and deals 1/6 max HP each turn.",
	},
	// Prompt 11
	blackcatblitz: {
		name: "Black-Cat Blitz",
		num: 10025,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "Charge/recharge moves take one turn and have 1.1x power.",
		onChargeMove(pokemon, target, move) {
			this.attrLastMove('[still]');
			this.addMove('-anim', pokemon, move.name, target);
			return false;
		},
		onModifyMove(move) {
			if (move.flags['recharge'] && move.self?.volatileStatus === 'mustrecharge') {
				delete move.self.volatileStatus;
			}
			// Sky Drop has a bespoke charge sequence and never fires ChargeMove.
			if (move.id === 'skydrop') {
				move.accuracy = 100;
				move.flags['contact'] = 1;
				move.onTryHit = function (target, source) {
					if (target.isAlly(source) || target.volatiles['substitute']) return false;
					if (target.getWeight() >= 2000) {
						this.add('-fail', target, 'move: Sky Drop', '[heavy]');
						return null;
					}
					if (target.hasType('Flying')) {
						this.add('-immune', target);
						return null;
					}
				};
				delete move.onHit;
			}
		},
		onBasePowerPriority: 20,
		onBasePower(basePower, source, target, move) {
			if (move.flags['charge'] || move.flags['recharge']) return this.chainModify([4506, 4096]);
		},
		onTryAddVolatile(status) {
			if (status.id === 'mustrecharge') return false;
		},
	},
	mirrorshards: {
		name: "Mirror Shards",
		num: 10026,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "When hit, permanently learns a random move from the attacker.",
		onDamagingHit(damage, target, source) {
			if (!target.hp || source.isAlly(target)) return;
			const candidates = source.moveSlots;
			if (!candidates.length) return;
			const copied = this.dex.moves.get(this.sample(candidates).id);
			if (target.baseMoveSlots.some(known => known.id === copied.id)) return;
			const ppUps = copied.noPPBoosts || copied.id === 'trumpcard' ? 0 : 3;
			const pp = this.calculatePP(copied, ppUps);
			const slot = {
				move: copied.name,
				id: copied.id,
				pp,
				maxpp: pp,
				target: copied.target,
				disabled: false,
				disabledSource: '',
				used: false,
			};
			target.baseMoveSlots.push(slot);
			if (!target.moveSlots.some(known => known.id === copied.id)) target.moveSlots.push(slot);
			target.ppUps.push(ppUps);
			this.add('-activate', target, 'ability: Mirror Shards', copied.name);
		},
	},
	toxicsoar: {
		name: "Toxic Soar",
		num: 10027,
		gen: 9,
		rating: 3.5,
		flags: {},
		shortDesc: "The secondary-effect chances of its Poison/Flying moves are doubled.",
		onModifyMovePriority: -2,
		onModifyMove(move) {
			if (move.type !== 'Poison' && move.type !== 'Flying') return;
			for (const secondary of move.secondaries || []) {
				if (secondary.chance) secondary.chance *= 2;
			}
			if (move.self?.chance) move.self.chance *= 2;
		},
	},
	wrappedup: {
		name: "Wrapped Up",
		num: 10028,
		gen: 9,
		rating: 3,
		flags: { failroleplay: 1, noreceiver: 1, noentrain: 1, notrace: 1, failskillswap: 1, cantsuppress: 1 },
		shortDesc: "Slweesh starts Wrapped; its first attacking move permanently unwraps it.",
		onStart(pokemon) {
			if (pokemon.species.baseSpecies !== 'Slweesh' || pokemon.transformed || pokemon.m.unwrapped) return;
			if (pokemon.species.id !== 'slweeshwrapped') pokemon.formeChange('Slweesh-Wrapped', this.effect, true);
		},
		onModifyMovePriority: 1,
		onModifyMove(move, pokemon) {
			if (move.category === 'Status' || pokemon.species.id !== 'slweeshwrapped' || pokemon.transformed) return;
			pokemon.m.unwrapped = true;
			pokemon.formeChange('Slweesh', this.effect, true);
		},
	},
	// Prompt 12
	etherealsugars: {
		name: "Ethereal Sugars",
		num: 10029,
		gen: 9,
		rating: 3,
		flags: {},
		shortDesc: "Its Fire moves are super effective against Ghost types.",
		onModifyMove(move) {
			if (move.type !== 'Fire') return;
			const original = move.onEffectiveness;
			move.onEffectiveness = function (typeMod, target, type, activeMove) {
				if (type === 'Ghost') return 1;
				return original?.call(this, typeMod, target, type, activeMove);
			};
		},
	},
	ofrenda: {
		name: "Ofrenda",
		num: 10030,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "When another Pokemon faints, restores 20% max HP and gains +1 Sp. Def.",
		onAnyFaintPriority: 1,
		onAnyFaint() {
			const pokemon = this.effectState.target;
			if (!pokemon.hp) return;
			this.heal(pokemon.baseMaxhp / 5, pokemon, pokemon, this.effect);
			this.boost({ spd: 1 }, pokemon, pokemon, this.effect);
		},
	},
	// Prompt 13
	scarletflame: {
		name: "Scarlet Flame",
		num: 10031,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "Burned foes lose an extra 1/16 HP; their burn damage ignores abilities.",
		// Implemented in brn's residual handler to bypass all damage-modifying abilities.
	},
	frameperfect: {
		name: "Frame Perfect",
		num: 10032,
		gen: 9,
		rating: 3.5,
		flags: {},
		shortDesc: "Move power is multiplied by (200 - its accuracy) / 100.",
		onBasePowerPriority: 20,
		onBasePower(basePower, source, target, move) {
			const accuracy = this.dex.moves.get(move.id).accuracy;
			if (accuracy !== true && accuracy < 100) return this.chainModify([200 - accuracy, 100]);
		},
	},
	gelatinous: {
		name: "Gelatinous",
		num: 10033,
		gen: 9,
		rating: 3.5,
		flags: { breakable: 1 },
		shortDesc: "Takes half damage from noncontact moves, doubled damage from Fire/Water.",
		onSourceModifyDamage(damage, source, target, move) {
			// Long Reach removes contact; Protective Pads only prevent contact effects.
			const contact = move.flags['contact'] && !source.hasAbility('longreach');
			let modifier = contact ? 1 : 0.5;
			if (move.type === 'Fire' || move.type === 'Water') modifier *= 2;
			return this.chainModify(modifier);
		},
	},
	quantuminstantiation: {
		name: "Quantum Instantiation",
		num: 10034,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "Hits inflict Slipstream; later hits on marked targets build up to 1.7x power.",
		onSourceDamagingHit(damage, target, source) {
			if (damage <= 0 || source === target) return;
			if (target.m.slipstreamHealing !== undefined) {
				source.m.quantumHits = Math.min(7, (source.m.quantumHits || 0) + 1);
			} else if (target.hp) {
				target.addVolatile('slipstream', source, this.effect);
			}
		},
		onBasePowerPriority: 20,
		onBasePower(basePower, source) {
			if (source.m.quantumHits) return this.chainModify([10 + Math.min(7, source.m.quantumHits), 10]);
		},
	},
	// Prompt 14
	phlegmplaster: {
		name: "Phlegm Plaster",
		num: 10035,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "Prevents removal of field effects except their natural expiration.",
	},
	vashavay: {
		name: "Vash Avay",
		num: 10036,
		gen: 9,
		rating: 4,
		flags: {},
		shortDesc: "Ignores entry hazards; removes Toxic Spikes and Sticky Web on its own side.",
		onStart(pokemon) {
			for (const hazard of ['toxicspikes', 'stickyweb']) {
				if (pokemon.side.removeSideCondition(hazard)) {
					this.add('-sideend', pokemon.side, this.dex.moves.get(hazard).name, '[from] ability: Vash Avay', `[of] ${pokemon}`);
				}
			}
		},
	},
	decoy: {
		name: "Decoy",
		num: 10037,
		gen: 9,
		rating: 3,
		flags: { breakable: 1 },
		shortDesc: "The first Flying-type damaging hit it takes in a battle deals 0 damage.",
		onDamagePriority: 1,
		onDamage(damage, target, source, effect) {
			if (target.m.decoyUsed || effect?.effectType !== 'Move' || effect.type !== 'Flying') return;
			target.m.decoyUsed = true;
			this.add('-activate', target, 'ability: Decoy');
			return 0;
		},
		onEffectiveness(typeMod, target, type, move) {
			if (target && !target.m.decoyUsed && move.type === 'Flying' && move.category !== 'Status') return 0;
		},
		onCriticalHit(target, source, move) {
			if (target && !target.m.decoyUsed && move.type === 'Flying') return false;
		},
	},
	swoon: {
		name: "Swoon",
		num: 10038,
		rating: 4,
		shortDesc: "This Pokemon's slicing attacks give the target a perish count of 3.",
		onSourceDamagingHit(damage, target, source, move) {
			if (!move.flags['slicing'] || !target.hp || target.volatiles['perishsong']) return;
			if (target.addVolatile('perishsong', source, this.effect)) {
				this.add('-activate', source, 'ability: Swoon');
				this.add('-start', target, 'perish3');
			}
		},
	},
	corruptingpowder: {
		name: "Corrupting Powder",
		num: 10039,
		rating: 3.5,
		shortDesc: "On fainting, starts Crimson Warzone for 5 turns.",
		onFaint(pokemon) {
			this.add('-activate', pokemon, 'ability: Corrupting Powder');
			this.field.addPseudoWeather('crimsonwarzone', pokemon, this.effect);
		},
	},
	mountaineer: {
		inherit: true,
		isNonstandard: null,
	},
	// CAP submissions
	promotionersblessing: {
		name: "Promotioner's Blessing",
		num: 10040,
		gen: 9,
		rating: 5,
		shortDesc: "After entry, allies entering gain +1 to a random low stat; 70% chance to become shiny.",
		onStart(pokemon) {
			if (pokemon.side.addSideCondition('promotionersblessing', pokemon, this.effect)) {
				// The switch-in event collected its handlers before the new side condition existed.
				this.singleEvent('SwitchIn', this.dex.conditions.get('promotionersblessing'),
					pokemon.side.sideConditions['promotionersblessing'], pokemon);
			}
		},
	},
	beathereafter: {
		name: "Beat Hereafter",
		num: 10041,
		gen: 9,
		rating: 3,
		shortDesc: "On entry, 1.5x Speed for a number of turns equal to fainted allies.",
		onStart(pokemon) {
			if (pokemon.side.pokemon.some(ally => ally !== pokemon && ally.fainted)) pokemon.addVolatile('beathereafter');
		},
		onModifySpe(spe, pokemon) {
			if (pokemon.volatiles['beathereafter']) return this.chainModify(1.5);
		},
		condition: {
			durationCallback(pokemon) {
				return pokemon.side.pokemon.filter(ally => ally !== pokemon && ally.fainted).length;
			},
			onStart(pokemon) {
				this.add('-start', pokemon, 'ability: Beat Hereafter');
			},
			onResidualOrder: 28,
			onResidualSubOrder: 2,
			onEnd(pokemon) {
				this.add('-end', pokemon, 'ability: Beat Hereafter');
			},
		},
	},
	// Modified Abilities
	normalize: {
		inherit: true,
		onModifyTypePriority: 1,
		onModifyType(move, pokemon) {
			const noModifyType = [
				'hiddenpower', 'judgment', 'multiattack', 'naturalgift', 'revelationdance',
				'struggle', 'technoblast', 'terrainpulse', 'weatherball', 'patchworkpress',
			];
			if (!(move.isZ && move.category !== 'Status') &&
				// TODO: Figure out actual interaction
				(!noModifyType.includes(move.id) || this.activeMove?.isMax) && !(move.name === 'Tera Blast' && pokemon.terastallized)) {
				move.type = 'Normal';
				move.typeChangerBoosted = this.effect;
			}
		},
		onBasePowerPriority: 23,
		onBasePower(basePower, pokemon, target, move) {
			if (move.typeChangerBoosted === this.effect) return this.chainModify([4915, 4096]);
		},
	},
	megasol: {
		inherit: true,
		isNonstandard: null,
	},
};

/**
 * Sherwood Combat — Боевая система (16 скиллов)
 * Адаптирован под новую структуру с UI
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Combat = {
    _battle: null,
    _skills: {},
    _playerBuffs: {},
    _battleOverlay: null,
    _battleLog: [],

    init: function() {
        this._skills = {
            triple_shot: { id: 'triple_shot', name: 'Тройной выстрел', icon: 'assets/skills/triple_shot_skill.png', description: '3 выстрела по 70% урона', damageMultiplier: 0.7, hits: 3, cooldown: 2, currentCooldown: 0, unlocked: true, cost: 0, type: 'damage' },
            power_shot: { id: 'power_shot', name: 'Критический выстрел', icon: 'assets/skills/skill_critical_shot.png', description: 'Выстрел с 200% урона и шансом крита 50%', damageMultiplier: 2.0, critChance: 0.5, hits: 1, cooldown: 3, currentCooldown: 0, unlocked: true, cost: 100, type: 'damage' },
            poison_arrow: { id: 'poison_arrow', name: 'Ядовитый выстрел', icon: 'assets/skills/poison_shot_skill.png', description: 'Отравляет врага на 3 хода (5% HP за ход)', damageMultiplier: 0.6, hits: 1, dotDamage: 0.05, dotDuration: 3, cooldown: 4, currentCooldown: 0, unlocked: true, cost: 0, type: 'damage' },
            ricochet: { id: 'ricochet', name: 'Рикошет', icon: 'assets/skills/ricochet_skill.png', description: 'Удар отскакивает и наносит 50% урона второй раз', damageMultiplier: 1.0, ricochetDamage: 0.5, hits: 1, cooldown: 3, currentCooldown: 0, unlocked: true, cost: 50, type: 'damage' },
            fire_shot: { id: 'fire_shot', name: 'Огненный выстрел', icon: 'assets/skills/skill_shot_fire.png', description: 'Поджигает врага: 8% HP за ход, 3 хода', damageMultiplier: 0.8, hits: 1, dotDamage: 0.08, dotDuration: 3, cooldown: 4, currentCooldown: 0, unlocked: false, cost: 200, type: 'damage' },
            cold_shot: { id: 'cold_shot', name: 'Ледяной выстрел', icon: 'assets/skills/skill_shot_of_cold.png', description: 'Замедляет врага: -50% урона на 2 хода', damageMultiplier: 0.7, hits: 1, slowPercent: 0.5, slowDuration: 2, cooldown: 3, currentCooldown: 0, unlocked: false, cost: 150, type: 'damage' },
            piercing_shot: { id: 'piercing_shot', name: 'Пробивающий выстрел', icon: 'assets/skills/skill_piercing_shot.png', description: 'Игнорирует 50% защиты врага', damageMultiplier: 1.2, armorPierce: 0.5, hits: 1, cooldown: 3, currentCooldown: 0, unlocked: false, cost: 150, type: 'damage' },
            grad_arrows: { id: 'grad_arrows', name: 'Град стрел', icon: 'assets/skills/skill_grad_arrows.png', description: '5 выстрелов по 40% урона', damageMultiplier: 0.4, hits: 5, cooldown: 5, currentCooldown: 0, unlocked: false, cost: 300, type: 'damage' },
            vampirism: { id: 'vampirism', name: 'Вампиризм', icon: 'assets/skills/skill_vampirism.png', description: 'Восстанавливает 50% нанесённого урона', damageMultiplier: 1.0, lifesteal: 0.5, hits: 1, cooldown: 4, currentCooldown: 0, unlocked: false, cost: 250, type: 'damage' },
            parry: { id: 'parry', name: 'Парирование', icon: 'assets/skills/skill_parry.png', description: 'Отражает 100% урона врага 1 ход', damageMultiplier: 0, parry: true, hits: 1, cooldown: 5, currentCooldown: 0, unlocked: false, cost: 200, type: 'defense' },
            double_defense: { id: 'double_defense', name: 'Двойная защита', icon: 'assets/skills/skill_double_defense.png', description: 'Удваивает защиту на 2 хода', damageMultiplier: 0, defenseBoost: 1.0, defenseDuration: 2, hits: 1, cooldown: 4, currentCooldown: 0, unlocked: false, cost: 200, type: 'defense' },
            roots: { id: 'roots', name: 'Корни земли', icon: 'assets/skills/skill_element_of_roots.png', description: 'Опутывает врага: -30% урона и 3% HP за ход', damageMultiplier: 0.5, hits: 1, rootDamage: 0.03, rootSlow: 0.3, rootDuration: 3, cooldown: 4, currentCooldown: 0, unlocked: false, cost: 300, type: 'damage' },
            double_damage: { id: 'double_damage', name: 'Двойной урон', icon: 'assets/skills/skill_boost_agility_double_damage.png', description: 'Удваивает урон на 2 хода', damageMultiplier: 1.0, damageBoost: 1.0, boostDuration: 2, hits: 1, cooldown: 5, currentCooldown: 0, unlocked: false, cost: 400, type: 'buff' },
            health: { id: 'health', name: 'Лечение', icon: 'assets/skills/health_skill.png', description: 'Восстанавливает 15% максимального HP', damageMultiplier: 0, healPercent: 0.15, hits: 1, cooldown: 4, currentCooldown: 0, unlocked: true, cost: 0, type: 'heal' },
            passive_block: { id: 'passive_block', name: 'Пассивный блок', icon: 'assets/skills/passive_blocking_skill.png', description: 'Шанс 30% заблокировать урон врага', damageMultiplier: 1.0, blockChance: 0.3, hits: 1, cooldown: 0, currentCooldown: 0, unlocked: true, passive: true, cost: 0, type: 'passive' },
            control: { id: 'control', name: 'Контроль', icon: 'assets/skills/control_skill.png', description: 'Оглушает врага на 1 ход', damageMultiplier: 0.3, stunDuration: 1, hits: 1, cooldown: 5, currentCooldown: 0, unlocked: false, cost: 350, type: 'damage' }
        };

        this._playerBuffs = {
            double_damage: { remainingTurns: 0 },
            double_defense: { remainingTurns: 0 },
            parry: { remainingTurns: 0 }
        };

        this._battleLog = [];
        console.log('⚔️ Combat инициализирован');
    },

    getSkills: function() {
        return this._skills;
    },

    unlockSkill: function(id) {
        if (!this._skills[id]) return { success: false, reason: 'Скилл не найден' };
        if (this._skills[id].unlocked) return { success: false, reason: 'Уже открыт' };

        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };

        if ((p.resources.gold || 0) < this._skills[id].cost) {
            return { success: false, reason: 'Нужно ' + this._skills[id].cost + ' золота' };
        }

        p.resources.gold -= this._skills[id].cost;
        this._skills[id].unlocked = true;
        Sherwood.saveGame();
        return { success: true };
    },

    start: function(monsterId, isBoss, mode, monsterStats) {
        var p = Sherwood.getPlayer();
        if (!p) return;

        var enemyName = 'Монстр';
        var enemyImage = monsterId || 'plague_crow.png';

        if (Sherwood.Bestiary && Sherwood.Bestiary.BEASTS) {
            var beastData = Sherwood.Bestiary.BEASTS[monsterId];
            if (beastData && beastData.name) {
                enemyName = beastData.name;
            }
        }

        var baseHp, baseAtk, baseDef;

        if (monsterStats && monsterStats.atk && monsterStats.def && monsterStats.hp) {
            baseAtk = monsterStats.atk;
            baseDef = monsterStats.def;
            baseHp = monsterStats.hp;
        } else {
            var playerLevel = p.level || 1;
            baseHp = Math.floor(100 + playerLevel * 20);
            baseAtk = Math.floor(10 + playerLevel * 3);
            baseDef = Math.floor(8 + playerLevel * 2);
        }

        if (isBoss) {
            baseHp = Math.floor(baseHp * 3);
            baseAtk = Math.floor(baseAtk * 1.5);
            baseDef = Math.floor(baseDef * 1.2);
            enemyName = '👑 ' + enemyName;
        }

        var enemy = {
            name: enemyName,
            image: enemyImage,
            hp: baseHp,
            maxHp: baseHp,
            attack: baseAtk,
            defense: baseDef,
            isBoss: isBoss || false,
            mode: mode || 'dungeon',
            dots: [],
            stunned: 0,
            slowed: { percent: 0, remainingTurns: 0 },
            rooted: { damage: 0, slow: 0, remainingTurns: 0 }
        };

        this._battle = {
            enemy: enemy,
            playerHp: p.stats.hp,
            playerMaxHp: p.stats.maxHp,
            turn: 0,
            attackCounter: 0,
            chargedSkills: []
        };

        for (var id in this._skills) {
            this._skills[id].currentCooldown = 0;
        }

        this._playerBuffs = {
            double_damage: { remainingTurns: 0 },
            double_defense: { remainingTurns: 0 },
            parry: { remainingTurns: 0 }
        };

        this._battleLog = [];
        this._showBattleUI();

        return this._battle;
    },

    getState: function() {
        if (!this._battle) return null;
        return {
            enemyName: this._battle.enemy.name,
            enemyImage: this._battle.enemy.image,
            enemyHp: this._battle.enemy.hp,
            enemyMaxHp: this._battle.enemy.maxHp,
            enemyAttack: this._battle.enemy.attack,
            enemyDefense: this._battle.enemy.defense,
            isBoss: this._battle.enemy.isBoss
        };
    },

    _tickCooldowns: function() {
        for (var id in this._skills) {
            if (this._skills[id].currentCooldown > 0) {
                this._skills[id].currentCooldown--;
            }
        }
    },

    _getRandomChargedSkills: function() {
        var unlocked = [];
        for (var id in this._skills) {
            if (this._skills[id].unlocked && !this._skills[id].passive && this._skills[id].type !== 'passive') {
                unlocked.push(id);
            }
        }
        for (var i = unlocked.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = unlocked[i];
            unlocked[i] = unlocked[j];
            unlocked[j] = tmp;
        }
        return unlocked.slice(0, 2);
    },

    _calculateDamage: function(attack, defense) {
        var baseDamage = attack * 0.1;
        var pierceDamage = Math.max(0, attack - defense) * 0.4;
        var damage = Math.max(1, Math.floor(baseDamage + pierceDamage));
        var spread = Math.floor(Math.random() * 5);
        damage += spread;
        return damage;
    },

    attack: function() {
        if (!this._battle) return { error: 'Нет боя' };

        var b = this._battle;
        var p = Sherwood.getPlayer();

        this._tickCooldowns();

        if (!b.attackCounter) b.attackCounter = 0;
        b.attackCounter++;

        if (b.attackCounter >= 2) {
            b.attackCounter = 0;
            b.chargedSkills = this._getRandomChargedSkills();
        }

        var rawDamage = this._calculateDamage(p.stats.attack, b.enemy.defense);

        var damageBonus = this._playerBuffs.double_damage.remainingTurns > 0 ? 1.0 : 0;
        rawDamage = Math.floor(rawDamage * (1 + damageBonus));

        var crit = Math.random() * 100 < 15;
        if (crit) rawDamage = Math.floor(rawDamage * 1.8);

        b.enemy.hp -= rawDamage;
        if (b.enemy.hp < 0) b.enemy.hp = 0;

        var result = {
            damage: rawDamage,
            crit: crit,
            enemyHp: b.enemy.hp,
            enemyMaxHp: b.enemy.maxHp,
            enemyDead: b.enemy.hp <= 0,
            enemyImage: b.enemy.image
        };

        this.addBattleLog('💢 ' + (crit ? '💥 КРИТ! ' : '') + rawDamage + ' урона!');

        if (b.enemy.hp <= 0) {
            result.win = true;
            result.exp = Math.floor(b.enemy.maxHp * 0.3);
            result.gold = Math.floor(b.enemy.maxHp * 0.1);
            this.addBattleLog('🏆 Победа! +' + result.exp + ' опыта, +' + result.gold + ' золота');
            this._battle = null;
            this._closeBattleUI();
            Sherwood.saveGame();
            return result;
        }

        var enemyResult = this._enemyTurn();

        if (enemyResult.playerDead) {
            result.playerDead = true;
            result.exp = Math.floor(b.enemy.maxHp * 0.1);
            result.gold = 0;
            this.addBattleLog('💀 Ты погиб!');
            this._battle = null;
            this._closeBattleUI();
            Sherwood.saveGame();
            return result;
        }

        p.stats.hp = b.playerHp;
        result.playerHp = b.playerHp;
        result.enemyDamage = enemyResult.enemyDamage;

        if (enemyResult.enemyDamage > 0) {
            this.addBattleLog('💢 Враг нанёс ' + enemyResult.enemyDamage + ' урона! (' + b.playerHp + '/' + b.playerMaxHp + ')');
        }

        Sherwood.saveGame();
        this._updateBattleUI();
        return result;
    },

    useSkill: function(skillId) {
        if (!this._battle) return { error: 'Нет боя' };

        var skill = this._skills[skillId];
        if (!skill) return { error: 'Скилл не найден' };
        if (!skill.unlocked) return { error: 'Скилл не открыт' };

        var b = this._battle;
        var p = Sherwood.getPlayer();

        this._tickCooldowns();

        var result = {
            skillName: skill.name,
            damage: 0,
            heal: 0,
            enemyHp: b.enemy.hp,
            enemyMaxHp: b.enemy.maxHp,
            enemyDead: false,
            enemyImage: b.enemy.image,
            effects: []
        };

        switch (skill.type) {
            case 'heal':
                var healAmount = Math.floor(p.stats.maxHp * skill.healPercent);
                p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + healAmount);
                b.playerHp = p.stats.hp;
                result.heal = healAmount;
                result.effects.push('+ ' + healAmount + ' HP');
                this.addBattleLog('💚 Лечение! +' + healAmount + ' HP');
                break;

            case 'defense':
                if (skill.parry) {
                    this._playerBuffs.parry.remainingTurns = 1;
                    result.effects.push('Парирование активно');
                    this.addBattleLog('🛡️ Парирование активно!');
                }
                if (skill.defenseBoost) {
                    this._playerBuffs.double_defense.remainingTurns = skill.defenseDuration;
                    result.effects.push('Защита удвоена на ' + skill.defenseDuration + ' хода');
                    this.addBattleLog('🛡️ Защита удвоена на ' + skill.defenseDuration + ' хода!');
                }
                break;

            case 'buff':
                if (skill.damageBoost) {
                    this._playerBuffs.double_damage.remainingTurns = skill.boostDuration;
                    result.effects.push('Урон удвоен на ' + skill.boostDuration + ' хода');
                    this.addBattleLog('⚡ Урон удвоен на ' + skill.boostDuration + ' хода!');
                }
                break;

            default:
                var totalDamage = 0;
                var hits = skill.hits || 1;
                var armorPierce = skill.armorPierce || 0;
                var effectiveDefense = b.enemy.defense * (1 - armorPierce);

                for (var h = 0; h < hits; h++) {
                    var hitDamage = this._calculateDamage(p.stats.attack * skill.damageMultiplier, effectiveDefense);

                    if (skill.critChance && Math.random() < skill.critChance) {
                        hitDamage = Math.floor(hitDamage * 1.8);
                        result.crit = true;
                    }

                    totalDamage += hitDamage;
                    b.enemy.hp -= hitDamage;

                    if (b.enemy.hp < 0) b.enemy.hp = 0;
                    if (b.enemy.hp <= 0) break;
                }

                result.damage = totalDamage;
                result.hits = hits;
                this.addBattleLog('💥 ' + skill.name + ': ' + totalDamage + ' урона!');

                if (skill.ricochetDamage && b.enemy.hp > 0) {
                    var ricochetDamage = Math.floor(totalDamage * skill.ricochetDamage);
                    b.enemy.hp -= ricochetDamage;
                    result.damage += ricochetDamage;
                    result.effects.push('Рикошет: +' + ricochetDamage);
                    this.addBattleLog('🔄 Рикошет: +' + ricochetDamage + ' урона!');
                }

                if (skill.dotDamage && skill.dotDuration && b.enemy.hp > 0) {
                    b.enemy.dots.push({ damagePerTurn: skill.dotDamage, remainingTurns: skill.dotDuration, name: skill.name });
                    result.effects.push(skill.name + ' на ' + skill.dotDuration + ' хода');
                    this.addBattleLog('☠️ ' + skill.name + ' на ' + skill.dotDuration + ' хода!');
                }

                if (skill.slowPercent && skill.slowDuration && b.enemy.hp > 0) {
                    b.enemy.slowed.percent = skill.slowPercent;
                    b.enemy.slowed.remainingTurns = skill.slowDuration;
                    result.effects.push('Враг замедлен на ' + skill.slowDuration + ' хода');
                    this.addBattleLog('🐢 Враг замедлен на ' + skill.slowDuration + ' хода!');
                }

                if (skill.rootDamage && skill.rootDuration && b.enemy.hp > 0) {
                    b.enemy.rooted.damage = skill.rootDamage;
                    b.enemy.rooted.slow = skill.rootSlow;
                    b.enemy.rooted.remainingTurns = skill.rootDuration;
                    result.effects.push('Корни на ' + skill.rootDuration + ' хода');
                    this.addBattleLog('🌿 Корни на ' + skill.rootDuration + ' хода!');
                }

                if (skill.stunDuration && b.enemy.hp > 0) {
                    b.enemy.stunned = skill.stunDuration;
                    result.effects.push('Враг оглушён на ' + skill.stunDuration + ' ход');
                    this.addBattleLog('😵 Враг оглушён на ' + skill.stunDuration + ' ход!');
                }

                if (skill.lifesteal && totalDamage > 0) {
                    var lifestealAmount = Math.floor(totalDamage * skill.lifesteal);
                    p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + lifestealAmount);
                    b.playerHp = p.stats.hp;
                    result.heal = lifestealAmount;
                    result.effects.push('+ ' + lifestealAmount + ' HP (вампиризм)');
                    this.addBattleLog('🩸 +' + lifestealAmount + ' HP (вампиризм)!');
                }
                break;
        }

        if (b.chargedSkills) {
            var idx = b.chargedSkills.indexOf(skillId);
            if (idx !== -1) {
                b.chargedSkills[idx] = null;
            }
        }

        result.enemyHp = b.enemy.hp;
        result.enemyMaxHp = b.enemy.maxHp;

        if (b.enemy.hp <= 0) {
            result.enemyDead = true;
            result.win = true;
            result.exp = Math.floor(b.enemy.maxHp * 0.3);
            result.gold = Math.floor(b.enemy.maxHp * 0.1);
            this.addBattleLog('🏆 Победа! +' + result.exp + ' опыта, +' + result.gold + ' золота');
            this._battle = null;
            this._closeBattleUI();
            Sherwood.saveGame();
            return result;
        }

        if (b.enemy.stunned > 0) {
            b.enemy.stunned--;
            result.enemyStunned = true;
            this.addBattleLog('😵 Враг оглушён и пропускает ход!');
        } else {
            var enemyResult = this._enemyTurn();

            if (enemyResult.playerDead) {
                result.playerDead = true;
                result.exp = Math.floor(b.enemy.maxHp * 0.1);
                result.gold = 0;
                this.addBattleLog('💀 Ты погиб!');
                this._battle = null;
                this._closeBattleUI();
                Sherwood.saveGame();
                return result;
            }

            result.enemyDamage = enemyResult.enemyDamage;
            if (enemyResult.enemyDamage > 0) {
                this.addBattleLog('💢 Враг нанёс ' + enemyResult.enemyDamage + ' урона!');
            }
        }

        if (this._playerBuffs.double_damage.remainingTurns > 0) this._playerBuffs.double_damage.remainingTurns--;
        if (this._playerBuffs.double_defense.remainingTurns > 0) this._playerBuffs.double_defense.remainingTurns--;
        if (this._playerBuffs.parry.remainingTurns > 0) this._playerBuffs.parry.remainingTurns--;

        if (b.enemy.slowed.remainingTurns > 0) b.enemy.slowed.remainingTurns--;
        if (b.enemy.rooted.remainingTurns > 0) b.enemy.rooted.remainingTurns--;

        p.stats.hp = b.playerHp;
        result.playerHp = b.playerHp;

        Sherwood.saveGame();
        this._updateBattleUI();
        return result;
    },

    _enemyTurn: function() {
        if (!this._battle) return { playerDead: false };

        var b = this._battle;
        var p = Sherwood.getPlayer();

        if (this._playerBuffs.parry.remainingTurns > 0) {
            this._playerBuffs.parry.remainingTurns--;
            return { playerDead: false, enemyDamage: 0, parried: true };
        }

        var attackValue = b.enemy.attack;

        if (b.enemy.slowed.remainingTurns > 0) {
            attackValue = Math.floor(attackValue * (1 - b.enemy.slowed.percent));
        }

        if (b.enemy.rooted.remainingTurns > 0) {
            attackValue = Math.floor(attackValue * (1 - b.enemy.rooted.slow));
        }

        var defenseValue = p.stats.defense;

        if (this._playerBuffs.double_defense.remainingTurns > 0) {
            defenseValue *= 2;
        }

        var enemyDamage = this._calculateDamage(attackValue, defenseValue);

        var passiveBlock = this._skills.passive_block;
        if (passiveBlock && passiveBlock.unlocked && passiveBlock.blockChance) {
            if (Math.random() < passiveBlock.blockChance) {
                enemyDamage = 0;
            }
        }

        b.playerHp -= enemyDamage;
        if (b.playerHp < 0) b.playerHp = 0;
        p.stats.hp = b.playerHp;

        return {
            playerDead: b.playerHp <= 0,
            enemyDamage: enemyDamage,
            playerHp: b.playerHp
        };
    },

    flee: function() {
        if (!this._battle) return { success: true };

        var b = this._battle;
        var p = Sherwood.getPlayer();

        if (Math.random() < 0.6) {
            this.addBattleLog('🏃 Ты сбежал!');
            this._battle = null;
            this._closeBattleUI();
            Sherwood.saveGame();
            return { success: true };
        }

        var enemyDamage = Math.max(1, Math.floor(b.enemy.attack - p.stats.defense * 0.3));
        p.stats.hp = Math.max(0, p.stats.hp - enemyDamage);
        b.playerHp = p.stats.hp;

        if (p.stats.hp <= 0) {
            this.addBattleLog('💀 Ты погиб при попытке бегства!');
            this._battle = null;
            this._closeBattleUI();
            Sherwood.saveGame();
            return { lose: true, damage: enemyDamage };
        }

        this.addBattleLog('🏃 Побег не удался! Враг нанёс ' + enemyDamage + ' урона');
        Sherwood.saveGame();
        this._updateBattleUI();
        return { success: false, damage: enemyDamage };
    },

    isInBattle: function() {
        return this._battle !== null;
    },

    addBattleLog: function(msg) {
        this._battleLog.push(msg);
        if (this._battleLog.length > 50) this._battleLog.shift();

        var logEl = document.getElementById('combat-log');
        if (logEl) {
            logEl.innerHTML += '<div>' + msg + '</div>';
            logEl.scrollTop = logEl.scrollHeight;
        }
    },

    // ========== UI ==========

    _showBattleUI: function() {
        var b = this._battle;
        if (!b) return;

        var enemy = b.enemy;
        var p = Sherwood.getPlayer();

        var overlay = document.createElement('div');
        overlay.id = 'combat-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:400;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:"Courier New",monospace;color:#fff;';

        var skillButtons = '';
        var skillKeys = Object.keys(this._skills);
        for (var i = 0; i < skillKeys.length; i++) {
            var id = skillKeys[i];
            var skill = this._skills[id];
            if (skill.unlocked && !skill.passive && skill.type !== 'passive') {
                var cd = skill.currentCooldown || 0;
                var disabled = cd > 0 ? 'disabled' : '';
                var color = cd > 0 ? '#555' : (skill.type === 'heal' ? '#2d6a4f' : (skill.type === 'defense' || skill.type === 'buff' ? '#2d4a6a' : '#6a2d2d'));
                skillButtons += '<button onclick="Sherwood.Combat.useSkillFromUI(\'' + id + '\')" ' + disabled + ' style="padding:4px 8px;background:' + color + ';border:1px solid ' + (cd > 0 ? '#333' : (skill.type === 'heal' ? '#52b788' : (skill.type === 'defense' || skill.type === 'buff' ? '#5288b7' : '#ff6b6b'))) + ';border-radius:4px;color:#fff;cursor:' + (cd > 0 ? 'default' : 'pointer') + ';font-size:9px;flex:1;min-width:50px;">' + skill.name + (cd > 0 ? ' (' + cd + ')' : '') + '</button>';
            }
        }

        var enemyImg = enemy.image ? 'assets/all_beasts/' + enemy.image : '';
        if (enemy.mode === 'portal') enemyImg = 'assets/portal_beasts/' + enemy.image;
        if (enemy.mode === 'quest') enemyImg = 'assets/beast_quest/' + enemy.image;

        overlay.innerHTML = '<div style="background:linear-gradient(180deg,#1a0f08,#2d1a10);border:3px solid ' + (enemy.isBoss ? '#ff6b35' : '#8B4513') + ';border-radius:12px;padding:15px;max-width:480px;width:95%;">' +
            '<div style="text-align:center;margin-bottom:6px;"><div style="color:' + (enemy.isBoss ? '#ff6b35' : '#ffa500') + ';font-size:16px;font-weight:bold;">' + (enemy.isBoss ? '👑 БОСС' : '⚔️ БИТВА') + '</div>' +
            '<div style="font-size:14px;color:#fff;">' + enemy.name + '</div>' +
            (enemyImg ? '<img src="' + enemyImg + '" style="width:50px;height:50px;object-fit:contain;margin:2px 0;" onerror="this.style.display=\'none\'">' : '') +
            '</div>' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:4px;"><div><div style="font-size:10px;color:#888;">Враг</div>' +
            '<div style="font-size:16px;font-weight:bold;color:#ff6b6b;">❤️ ' + enemy.hp + '</div>' +
            '<div style="width:120px;height:5px;background:#333;border-radius:3px;overflow:hidden;"><div id="combat-enemy-hp" style="width:' + (enemy.hp / enemy.maxHp * 100) + '%;height:100%;background:linear-gradient(90deg,#ff0000,#ff4444);transition:width 0.3s;"></div></div></div>' +
            '<div style="text-align:right;"><div style="font-size:10px;color:#888;">Герой</div>' +
            '<div style="font-size:16px;font-weight:bold;color:#4ecdc4;">❤️ ' + b.playerHp + '</div>' +
            '<div style="width:120px;height:5px;background:#333;border-radius:3px;overflow:hidden;margin-left:auto;"><div id="combat-player-hp" style="width:' + (b.playerHp / b.playerMaxHp * 100) + '%;height:100%;background:linear-gradient(90deg,#00ff00,#44ff44);transition:width 0.3s;"></div></div></div></div>' +
            '<div id="combat-log" style="background:rgba(0,0,0,0.5);border:1px solid #333;border-radius:4px;padding:4px;height:60px;overflow-y:auto;font-size:11px;color:#888;margin-bottom:4px;"></div>' +
            '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:4px;">' + skillButtons + '</div>' +
            '<div style="display:flex;gap:6px;"><button onclick="Sherwood.Combat.attackFromUI()" class="btn btn-danger" style="flex:2;padding:8px;font-size:14px;font-weight:bold;">⚔️ АТАКА</button>' +
            '<button onclick="Sherwood.Combat.fleeFromUI()" class="btn" style="flex:1;padding:8px;font-size:12px;">🏃 Бежать</button></div></div>';

        document.body.appendChild(overlay);
        this._battleOverlay = overlay;

        var logEl = document.getElementById('combat-log');
        if (logEl && this._battleLog.length > 0) {
            logEl.innerHTML = this._battleLog.slice(-20).join('<br>');
            logEl.scrollTop = logEl.scrollHeight;
        }
    },

    _updateBattleUI: function() {
        if (!this._battleOverlay) return;
        var b = this._battle;
        if (!b) return;

        var enemyHpBar = document.getElementById('combat-enemy-hp');
        var playerHpBar = document.getElementById('combat-player-hp');

        if (enemyHpBar) enemyHpBar.style.width = (b.enemy.hp / b.enemy.maxHp * 100) + '%';
        if (playerHpBar) playerHpBar.style.width = (b.playerHp / b.playerMaxHp * 100) + '%';

        var hpElements = this._battleOverlay.querySelectorAll('[style*="font-size:16px"][style*="font-weight:bold;color:#ff6b6b;"]');
        if (hpElements.length > 0) hpElements[0].textContent = '❤️ ' + b.enemy.hp;
        var playerHpElements = this._battleOverlay.querySelectorAll('[style*="font-size:16px"][style*="font-weight:bold;color:#4ecdc4;"]');
        if (playerHpElements.length > 0) playerHpElements[0].textContent = '❤️ ' + b.playerHp;

        var logEl = document.getElementById('combat-log');
        if (logEl) {
            var logs = this._battleLog.slice(-20);
            logEl.innerHTML = logs.join('<br>');
            logEl.scrollTop = logEl.scrollHeight;
        }
    },

    _closeBattleUI: function() {
        if (this._battleOverlay) {
            this._battleOverlay.remove();
            this._battleOverlay = null;
        }
        if (typeof UI !== 'undefined' && UI.loadHome) {
            setTimeout(function() { UI.loadHome(); }, 500);
        }
    },

    // ========== UI ХЭНДЛЕРЫ ==========

    attackFromUI: function() {
        var result = this.attack();
        if (result && result.error) {
            UI._showToast('❌ ' + result.error);
            return;
        }
        if (result && (result.win || result.playerDead)) {
            if (result.win) {
                var p = Sherwood.getPlayer();
                if (p) {
                    Sherwood.addExp(result.exp || 0);
                    Sherwood.addResource('gold', result.gold || 0);
                }
            }
            this._closeBattleUI();
            if (result.win) {
                UI._showToast('🏆 Победа! +' + (result.exp || 0) + ' опыта, +' + (result.gold || 0) + ' золота');
            } else {
                UI._showToast('💀 Ты погиб...');
            }
        }
    },

    useSkillFromUI: function(skillId) {
        var result = this.useSkill(skillId);
        if (result && result.error) {
            UI._showToast('❌ ' + result.error);
            return;
        }
        if (result && (result.win || result.playerDead)) {
            if (result.win) {
                var p = Sherwood.getPlayer();
                if (p) {
                    Sherwood.addExp(result.exp || 0);
                    Sherwood.addResource('gold', result.gold || 0);
                }
            }
            this._closeBattleUI();
            if (result.win) {
                UI._showToast('🏆 Победа! +' + (result.exp || 0) + ' опыта, +' + (result.gold || 0) + ' золота');
            } else {
                UI._showToast('💀 Ты погиб...');
            }
        }
    },

    fleeFromUI: function() {
        var result = this.flee();
        if (result && result.success) {
            this._closeBattleUI();
        } else if (result && result.lose) {
            this._closeBattleUI();
            UI._showToast('💀 Ты погиб при попытке бегства!');
        }
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Combat = Sherwood.Combat;

console.log('⚔️ Combat загружен!');

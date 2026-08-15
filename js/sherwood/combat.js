/**
 * Sherwood Combat — Боевая система (16 скиллов)
 */

Sherwood.Combat = {
    _battle: null,
    _skills: {},
    _playerBuffs: {},

    init: function() {
        this._skills = {
            triple_shot: {
                id: 'triple_shot',
                name: 'Тройной выстрел',
                icon: 'assets/skills/triple_shot_skill.png',
                description: '3 выстрела по 70% урона',
                damageMultiplier: 0.7,
                hits: 3,
                cooldown: 2,
                currentCooldown: 0,
                unlocked: true,
                cost: 0,
                type: 'damage'
            },
            power_shot: {
                id: 'power_shot',
                name: 'Критический выстрел',
                icon: 'assets/skills/skill_critical_shot.png',
                description: 'Выстрел с 200% урона и шансом крита 50%',
                damageMultiplier: 2.0,
                critChance: 0.5,
                hits: 1,
                cooldown: 3,
                currentCooldown: 0,
                unlocked: true,
                cost: 100,
                type: 'damage'
            },
            poison_arrow: {
                id: 'poison_arrow',
                name: 'Ядовитый выстрел',
                icon: 'assets/skills/poison_shot_skill.png',
                description: 'Отравляет врага на 3 хода (5% HP за ход)',
                damageMultiplier: 0.6,
                hits: 1,
                dotDamage: 0.05,
                dotDuration: 3,
                cooldown: 4,
                currentCooldown: 0,
                unlocked: true,
                cost: 0,
                type: 'damage'
            },
            ricochet: {
                id: 'ricochet',
                name: 'Рикошет',
                icon: 'assets/skills/ricochet_skill.png',
                description: 'Удар отскакивает и наносит 50% урона второй раз',
                damageMultiplier: 1.0,
                ricochetDamage: 0.5,
                hits: 1,
                cooldown: 3,
                currentCooldown: 0,
                unlocked: true,
                cost: 50,
                type: 'damage'
            },
            fire_shot: {
                id: 'fire_shot',
                name: 'Огненный выстрел',
                icon: 'assets/skills/skill_shot_fire.png',
                description: 'Поджигает врага: 8% HP за ход, 3 хода',
                damageMultiplier: 0.8,
                hits: 1,
                dotDamage: 0.08,
                dotDuration: 3,
                cooldown: 4,
                currentCooldown: 0,
                unlocked: false,
                cost: 200,
                type: 'damage'
            },
            cold_shot: {
                id: 'cold_shot',
                name: 'Ледяной выстрел',
                icon: 'assets/skills/skill_shot_of_cold.png',
                description: 'Замедляет врага: -50% урона на 2 хода',
                damageMultiplier: 0.7,
                hits: 1,
                slowPercent: 0.5,
                slowDuration: 2,
                cooldown: 3,
                currentCooldown: 0,
                unlocked: false,
                cost: 150,
                type: 'damage'
            },
            piercing_shot: {
                id: 'piercing_shot',
                name: 'Пробивающий выстрел',
                icon: 'assets/skills/skill_piercing_shot.png',
                description: 'Игнорирует 50% защиты врага',
                damageMultiplier: 1.2,
                armorPierce: 0.5,
                hits: 1,
                cooldown: 3,
                currentCooldown: 0,
                unlocked: false,
                cost: 150,
                type: 'damage'
            },
            grad_arrows: {
                id: 'grad_arrows',
                name: 'Град стрел',
                icon: 'assets/skills/skill_grad_arrows.png',
                description: '5 выстрелов по 40% урона',
                damageMultiplier: 0.4,
                hits: 5,
                cooldown: 5,
                currentCooldown: 0,
                unlocked: false,
                cost: 300,
                type: 'damage'
            },
            vampirism: {
                id: 'vampirism',
                name: 'Вампиризм',
                icon: 'assets/skills/skill_vampirism.png',
                description: 'Восстанавливает 50% нанесённого урона',
                damageMultiplier: 1.0,
                lifesteal: 0.5,
                hits: 1,
                cooldown: 4,
                currentCooldown: 0,
                unlocked: false,
                cost: 250,
                type: 'damage'
            },
            parry: {
                id: 'parry',
                name: 'Парирование',
                icon: 'assets/skills/skill_parry.png',
                description: 'Отражает 100% урона врага 1 ход',
                damageMultiplier: 0,
                parry: true,
                hits: 1,
                cooldown: 5,
                currentCooldown: 0,
                unlocked: false,
                cost: 200,
                type: 'defense'
            },
            double_defense: {
                id: 'double_defense',
                name: 'Двойная защита',
                icon: 'assets/skills/skill_double_defense.png',
                description: 'Удваивает защиту на 2 хода',
                damageMultiplier: 0,
                defenseBoost: 1.0,
                defenseDuration: 2,
                hits: 1,
                cooldown: 4,
                currentCooldown: 0,
                unlocked: false,
                cost: 200,
                type: 'defense'
            },
            roots: {
                id: 'roots',
                name: 'Корни земли',
                icon: 'assets/skills/skill_element_of_roots.png',
                description: 'Опутывает врага: -30% урона и 3% HP за ход',
                damageMultiplier: 0.5,
                hits: 1,
                rootDamage: 0.03,
                rootSlow: 0.3,
                rootDuration: 3,
                cooldown: 4,
                currentCooldown: 0,
                unlocked: false,
                cost: 300,
                type: 'damage'
            },
            double_damage: {
                id: 'double_damage',
                name: 'Двойной урон',
                icon: 'assets/skills/skill_boost_agility_double_damage.png',
                description: 'Удваивает урон на 2 хода',
                damageMultiplier: 1.0,
                damageBoost: 1.0,
                boostDuration: 2,
                hits: 1,
                cooldown: 5,
                currentCooldown: 0,
                unlocked: false,
                cost: 400,
                type: 'buff'
            },
            health: {
                id: 'health',
                name: 'Лечение',
                icon: 'assets/skills/health_skill.png',
                description: 'Восстанавливает 30% максимального HP',
                damageMultiplier: 0,
                healPercent: 0.3,
                hits: 1,
                cooldown: 4,
                currentCooldown: 0,
                unlocked: true,
                cost: 0,
                type: 'heal'
            },
            passive_block: {
                id: 'passive_block',
                name: 'Пассивный блок',
                icon: 'assets/skills/passive_blocking_skill.png',
                description: 'Шанс 30% заблокировать урон врага',
                damageMultiplier: 1.0,
                blockChance: 0.3,
                hits: 1,
                cooldown: 0,
                currentCooldown: 0,
                unlocked: true,
                passive: true,
                cost: 0,
                type: 'passive'
            },
            control: {
                id: 'control',
                name: 'Контроль',
                icon: 'assets/skills/control_skill.png',
                description: 'Оглушает врага на 1 ход',
                damageMultiplier: 0.3,
                stunDuration: 1,
                hits: 1,
                cooldown: 5,
                currentCooldown: 0,
                unlocked: false,
                cost: 350,
                type: 'damage'
            }
        };
        
        this._playerBuffs = {
            double_damage: { remainingTurns: 0 },
            double_defense: { remainingTurns: 0 },
            parry: { remainingTurns: 0 }
        };
    },

    getSkills: function() {
        return this._skills;
    },

    unlockSkill: function(id) {
        if (!this._skills[id]) return { success: false, reason: 'Скилл не найден' };
        if (this._skills[id].unlocked) return { success: false, reason: 'Уже открыт' };
        var p = Sherwood.getPlayer();
        if ((p.resources.gold || 0) < this._skills[id].cost) return { success: false, reason: 'Нужно ' + this._skills[id].cost + ' золота' };
        p.resources.gold -= this._skills[id].cost;
        this._skills[id].unlocked = true;
        Sherwood.saveGame();
        return { success: true };
    },

    start: function(monsterId, isBoss, mode) {
        var p = Sherwood.getPlayer();
        if (!p) return;

        var enemyName = 'Монстр';
        var enemyImage = monsterId || 'image (1).png';
        
        if (Sherwood.Bestiary && Sherwood.Bestiary.getBeast) {
            var beast = Sherwood.Bestiary.getBeast(monsterId);
            if (beast && beast.name) {
                enemyName = beast.name;
            }
        }

        var level = p.level || 1;
        var monsterLevel = 1;
        
        if (monsterId) {
            var numMatch = monsterId.match(/\((\d+)\)/);
            if (numMatch) {
                monsterLevel = Math.min(90, parseInt(numMatch[1], 10));
            }
        }
        
        var baseHp = 50 + monsterLevel * 8;
        var baseAtk = 8 + monsterLevel * 1.5;
        var baseDef = 2 + monsterLevel * 0.8;
        
        if (isBoss) {
            baseHp *= 3;
            baseAtk *= 1.8;
            baseDef *= 1.5;
            enemyName = 'БОСС: ' + enemyName;
        }

        var enemy = {
            name: enemyName,
            image: enemyImage,
            hp: Math.floor(baseHp),
            maxHp: Math.floor(baseHp),
            attack: Math.floor(baseAtk),
            defense: Math.floor(baseDef),
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
            turn: 0
        };
        
        for (var id in this._skills) {
            this._skills[id].currentCooldown = 0;
        }
        
        this._playerBuffs = {
            double_damage: { remainingTurns: 0 },
            double_defense: { remainingTurns: 0 },
            parry: { remainingTurns: 0 }
        };
        
        return this._battle;
    },

    getState: function() {
        if (!this._battle) return null;
        return {
            enemyName: this._battle.enemy.name,
            enemyImage: this._battle.enemy.image,
            enemyHp: this._battle.enemy.hp,
            enemyMaxHp: this._battle.enemy.maxHp,
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

    getCooldowns: function() {
        this._tickCooldowns();
        var result = {};
        for (var id in this._skills) {
            result[id] = this._skills[id].currentCooldown;
        }
        return result;
    },

    attack: function() {
        if (!this._battle) return { error: 'Нет боя' };
        
        var b = this._battle;
        var p = Sherwood.getPlayer();
        
        this._tickCooldowns();
        
        var damageBonus = this._playerBuffs.double_damage.remainingTurns > 0 ? 1.0 : 0;
        var rawDamage = Math.max(1, p.stats.attack - b.enemy.defense + Math.floor(Math.random() * 10));
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
        
        if (b.enemy.hp <= 0) {
            result.win = true;
            result.exp = Math.floor(b.enemy.maxHp * 0.3);
            result.gold = Math.floor(b.enemy.maxHp * 0.1);
            this._battle = null;
            return result;
        }
        
        var enemyResult = this._enemyTurn();
        if (enemyResult.playerDead) {
            result.playerDead = true;
            result.exp = Math.floor(b.enemy.maxHp * 0.1);
            result.gold = 0;
            this._battle = null;
            return result;
        }
        
        p.stats.hp = b.playerHp;
        result.playerHp = b.playerHp;
        result.enemyDamage = enemyResult.enemyDamage;
        
        Sherwood.saveGame();
        return result;
    },

    useSkill: function(skillId) {
        if (!this._battle) return { error: 'Нет боя' };
        
        var skill = this._skills[skillId];
        if (!skill) return { error: 'Скилл не найден' };
        if (!skill.unlocked) return { error: 'Скилл не открыт' };
        if (skill.currentCooldown > 0) return { error: 'Перезарядка: ' + skill.currentCooldown };
        
        var b = this._battle;
        var p = Sherwood.getPlayer();
        
        this._tickCooldowns();
        
        if (skill.cooldown > 0) {
            skill.currentCooldown = skill.cooldown;
        }
        
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
                break;
                
            case 'defense':
                if (skill.parry) {
                    this._playerBuffs.parry.remainingTurns = 1;
                    result.effects.push('Парирование активно');
                }
                if (skill.defenseBoost) {
                    this._playerBuffs.double_defense.remainingTurns = skill.defenseDuration;
                    result.effects.push('Защита удвоена на ' + skill.defenseDuration + ' хода');
                }
                break;
                
            case 'buff':
                if (skill.damageBoost) {
                    this._playerBuffs.double_damage.remainingTurns = skill.boostDuration;
                    result.effects.push('Урон удвоен на ' + skill.boostDuration + ' хода');
                }
                break;
                
            default:
                // Damage skills
                var totalDamage = 0;
                var hits = skill.hits || 1;
                var armorPierce = skill.armorPierce || 0;
                var effectiveDefense = b.enemy.defense * (1 - armorPierce);
                
                for (var h = 0; h < hits; h++) {
                    var hitDamage = Math.max(1, Math.floor((p.stats.attack - effectiveDefense) * skill.damageMultiplier));
                    
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
                
                // Рикошет
                if (skill.ricochetDamage && b.enemy.hp > 0) {
                    var ricochetDamage = Math.floor(totalDamage * skill.ricochetDamage);
                    b.enemy.hp -= ricochetDamage;
                    result.damage += ricochetDamage;
                    result.effects.push('Рикошет: +' + ricochetDamage);
                }
                
                // DoT (яд, огонь)
                if (skill.dotDamage && skill.dotDuration && b.enemy.hp > 0) {
                    b.enemy.dots.push({
                        damagePerTurn: skill.dotDamage,
                        remainingTurns: skill.dotDuration,
                        name: skill.name
                    });
                    result.effects.push(skill.name + ' на ' + skill.dotDuration + ' хода');
                }
                
                // Замедление
                if (skill.slowPercent && skill.slowDuration && b.enemy.hp > 0) {
                    b.enemy.slowed.percent = skill.slowPercent;
                    b.enemy.slowed.remainingTurns = skill.slowDuration;
                    result.effects.push('Враг замедлен на ' + skill.slowDuration + ' хода');
                }
                
                // Корни
                if (skill.rootDamage && skill.rootDuration && b.enemy.hp > 0) {
                    b.enemy.rooted.damage = skill.rootDamage;
                    b.enemy.rooted.slow = skill.rootSlow;
                    b.enemy.rooted.remainingTurns = skill.rootDuration;
                    result.effects.push('Корни на ' + skill.rootDuration + ' хода');
                }
                
                // Стан
                if (skill.stunDuration && b.enemy.hp > 0) {
                    b.enemy.stunned = skill.stunDuration;
                    result.effects.push('Враг оглушён на ' + skill.stunDuration + ' ход');
                }
                
                // Вампиризм
                if (skill.lifesteal && totalDamage > 0) {
                    var lifestealAmount = Math.floor(totalDamage * skill.lifesteal);
                    p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + lifestealAmount);
                    b.playerHp = p.stats.hp;
                    result.heal = lifestealAmount;
                    result.effects.push('+ ' + lifestealAmount + ' HP (вампиризм)');
                }
                
                break;
        }
        
        result.enemyHp = b.enemy.hp;
        result.enemyMaxHp = b.enemy.maxHp;
        
        // Проверка победы
        if (b.enemy.hp <= 0) {
            result.enemyDead = true;
            result.win = true;
            result.exp = Math.floor(b.enemy.maxHp * 0.3);
            result.gold = Math.floor(b.enemy.maxHp * 0.1);
            this._battle = null;
            return result;
        }
        
        // Ход врага (если не оглушён)
        if (b.enemy.stunned > 0) {
            b.enemy.stunned--;
            result.enemyStunned = true;
        } else {
            var enemyResult = this._enemyTurn();
            if (enemyResult.playerDead) {
                result.playerDead = true;
                result.exp = Math.floor(b.enemy.maxHp * 0.1);
                result.gold = 0;
                this._battle = null;
                return result;
            }
            result.enemyDamage = enemyResult.enemyDamage;
        }
        
        // Тик баффов игрока
        if (this._playerBuffs.double_damage.remainingTurns > 0) this._playerBuffs.double_damage.remainingTurns--;
        if (this._playerBuffs.double_defense.remainingTurns > 0) this._playerBuffs.double_defense.remainingTurns--;
        if (this._playerBuffs.parry.remainingTurns > 0) this._playerBuffs.parry.remainingTurns--;
        
        // Тик эффектов врага
        if (b.enemy.slowed.remainingTurns > 0) b.enemy.slowed.remainingTurns--;
        if (b.enemy.rooted.remainingTurns > 0) b.enemy.rooted.remainingTurns--;
        
        p.stats.hp = b.playerHp;
        result.playerHp = b.playerHp;
        
        Sherwood.saveGame();
        return result;
    },

    _enemyTurn: function() {
        if (!this._battle) return { playerDead: false };
        
        var b = this._battle;
        var p = Sherwood.getPlayer();
        
        // Обработка DoT на враге
        var totalDot = 0;
        var remainingDots = [];
        for (var i = 0; i < b.enemy.dots.length; i++) {
            var dot = b.enemy.dots[i];
            var tickDamage = Math.max(1, Math.floor(b.enemy.maxHp * dot.damagePerTurn));
            b.enemy.hp -= tickDamage;
            totalDot += tickDamage;
            dot.remainingTurns--;
            if (dot.remainingTurns > 0) {
                remainingDots.push(dot);
            }
        }
        b.enemy.dots = remainingDots;
        
        // Корни наносят урон
        if (b.enemy.rooted.remainingTurns > 0) {
            var rootTick = Math.max(1, Math.floor(b.enemy.maxHp * b.enemy.rooted.damage));
            b.enemy.hp -= rootTick;
            totalDot += rootTick;
        }
        
        if (b.enemy.hp < 0) b.enemy.hp = 0;
        
        if (b.enemy.hp <= 0) {
            return { playerDead: false, enemyDeadByDot: true, dotDamage: totalDot };
        }
        
        // Проверка парирования
        if (this._playerBuffs.parry.remainingTurns > 0) {
            return { playerDead: false, enemyDamage: 0, parried: true };
        }
        
        // Урон врага (с учётом замедления)
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
        
        var enemyDamage = Math.max(1, Math.floor(attackValue - defenseValue * 0.5 + Math.random() * 5));
        
        // Пассивный блок
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
            playerHp: b.playerHp,
            dotDamage: totalDot
        };
    },

    flee: function() {
        if (!this._battle) return { success: true };
        
        var b = this._battle;
        var p = Sherwood.getPlayer();
        
        if (Math.random() < 0.6) {
            this._battle = null;
            Sherwood.saveGame();
            return { success: true };
        }
        
        var enemyDamage = Math.max(1, Math.floor(b.enemy.attack - p.stats.defense * 0.3));
        p.stats.hp = Math.max(0, p.stats.hp - enemyDamage);
        b.playerHp = p.stats.hp;
        
        if (p.stats.hp <= 0) {
            this._battle = null;
            Sherwood.saveGame();
            return { lose: true, damage: enemyDamage };
        }
        
        Sherwood.saveGame();
        return { success: false, damage: enemyDamage };
    },

    isInBattle: function() {
        return this._battle !== null;
    }
};

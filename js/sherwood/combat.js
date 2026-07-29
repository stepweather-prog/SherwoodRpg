Sherwood.Combat = {
    _battle: null,
    _effects: [],
    _turn: 0,
    _hitCount: 0,
    _cooldowns: {},

    start: function(monsterId, isBoss, mode) {
        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Нет игрока' };
        var img = monsterId || 'image (1).png';
        var monsterNames = {
            'image (1).png': 'Леший','image (3).png': 'Проклятый олень','image (74).png': 'Древесный голем','image (9).png': 'Рогатый Леший',
            'image (29).png': 'Олень (Фаза тарана)','image (75).png': 'Голем (Замах)','image (18).png': 'Рогатый владыка Леший','image (15).png': 'Проклятый титан Леший',
            'image (12).png': 'Болотный утопленник','image (13).png': 'Кикимора болотная','image (17).png': 'Болотный упырь','image (59).png': 'Упырь (Когти)',
            'image (62).png': 'Утопленник (Мертвец недр)','image (14).png': 'Костяной гигант','image (16).png': 'Рогатая кикимора','image (52).png': 'Кикимора (Выпад)',
            'image (53).png': 'Кикимора (Крик)','image (60).png': 'Упырь (Удар)','image (61).png': 'Упырь (Прыжок)','image (63).png': 'Скелетный гигант',
            'image (54).png': 'Кикимора багровой ярости','image (10).png': 'Трёхглавый пёс преисподней','image (11).png': 'Заражённый секач',
            'image (32).png': 'Волк-оборотень','image (35).png': 'Дьявольский ёж','image (33).png': 'Оборотень (Ярость)','image (36).png': 'Ёж (Ярость)',
            'image (49).png': 'Костяной ликантроп','image (50).png': 'Ликантроп (Замах)','image (37).png': 'Кристаллический ёж','image (34).png': 'Волк-оборотень (Босс)'
        };
        var name = monsterNames[monsterId] || 'Монстр';
        var hp = isBoss ? 400 : 100 + Math.floor(Math.random() * 120);
        var atk = isBoss ? 30 : 12 + Math.floor(Math.random() * 15);
        var def = isBoss ? 15 : 3 + Math.floor(Math.random() * 10);
        var armor = isBoss ? 40 : 10 + Math.floor(Math.random() * 20);
        this._battle = {
            enemyImage: img,
            enemyName: name,
            enemyHp: hp,
            enemyMaxHp: hp,
            enemyAtk: atk,
            enemyDef: def,
            enemyArmor: armor,
            enemyMaxArmor: armor,
            isBoss: !!isBoss,
            mode: mode || 'dungeon',
            playerHp: p.stats.hp,
            playerMaxHp: p.stats.maxHp,
            playerAtk: p.stats.attack,
            playerDef: p.stats.defense,
            playerAgi: p.stats.agility,
            playerArmor: Math.floor(p.stats.defense * 0.3),
            playerMaxArmor: Math.floor(p.stats.defense * 0.3)
        };
        this._effects = [];
        this._turn = 1;
        this._hitCount = 0;
        this._cooldowns = {};
        return { success: true };
    },

    getState: function() {
        var b = this._battle;
        if (!b) return null;
        return {
            enemyImage: b.enemyImage,
            enemyName: b.enemyName,
            enemyHp: b.enemyHp,
            enemyMaxHp: b.enemyMaxHp,
            enemyArmor: b.enemyArmor,
            enemyMaxArmor: b.enemyMaxArmor,
            playerHp: b.playerHp,
            playerMaxHp: b.playerMaxHp,
            isBoss: b.isBoss,
            cooldowns: Object.assign({}, this._cooldowns)
        };
    },

    isActive: function() { return !!this._battle; },

    _calcDamage: function(atk, def) {
        if (def <= 0) def = 1;
        return Math.max(1, Math.floor((atk * atk) / (atk + def)));
    },

    attack: function() {
        var b = this._battle;
        if (!b) return null;

        var raw = this._calcDamage(b.playerAtk, b.enemyDef);
        var crit = Math.random() * 100 < 15;
        if (crit) raw = Math.floor(raw * 1.8);
        var armDmg = Math.min(Math.floor(raw * 0.3), b.enemyArmor);
        var hpDmg = raw - armDmg;
        if (b.enemyArmor > 0) hpDmg = Math.floor(hpDmg * 0.5);
        hpDmg = Math.max(1, hpDmg);
        b.enemyArmor -= armDmg;
        if (b.enemyArmor < 0) b.enemyArmor = 0;
        b.enemyHp -= hpDmg;
        if (b.enemyHp < 0) b.enemyHp = 0;

        this._hitCount++;

        var r = {
            type: 'attack',
            damage: hpDmg,
            armorDmg: armDmg,
            crit: crit,
            enemyHp: b.enemyHp,
            enemyMaxHp: b.enemyMaxHp
        };

        if (b.enemyHp <= 0) {
            r.win = true;
            r.exp = b.isBoss ? 150 : 35;
            r.gold = b.isBoss ? 120 : 25;
            this._battle = null;
            return r;
        }

        var er = this._enemyTurn();
        r.enemy = er;
        r.enemyName = b.enemyName;

        if (b.playerHp <= 0) {
            r.lose = true;
            r.exp = Math.floor((b.isBoss ? 150 : 35) * 0.3);
            r.gold = Math.floor((b.isBoss ? 120 : 25) * 0.3);
            this._battle = null;
        }

        return r;
    },

    _enemyTurn: function() {
        var b = this._battle;
        if (!b) return null;

        for (var i = this._effects.length - 1; i >= 0; i--) {
            var e = this._effects[i];
            if (e.target === 'enemy') {
                if (e.type === 'stun') {
                    e.turns--;
                    if (e.turns <= 0) this._effects.splice(i, 1);
                    return { stun: true };
                }
                if (e.type === 'poison') {
                    b.enemyHp -= e.dmg;
                    if (b.enemyHp < 0) b.enemyHp = 0;
                    e.turns--;
                    if (e.turns <= 0) this._effects.splice(i, 1);
                    var result = { poison: true, dmg: e.dmg, enemyHp: b.enemyHp };
                    if (b.enemyHp <= 0) {
                        this._battle = null;
                        return { poison: true, dmg: e.dmg, win: true };
                    }
                    return result;
                }
            }
        }

        var raw = this._calcDamage(b.enemyAtk, b.playerDef);
        var armDmg = Math.min(Math.floor(raw * 0.3), b.playerArmor);
        var hpDmg = raw - armDmg;
        if (b.playerArmor > 0) hpDmg = Math.floor(hpDmg * 0.5);
        hpDmg = Math.max(1, hpDmg);
        b.playerArmor -= armDmg;
        if (b.playerArmor < 0) b.playerArmor = 0;
        b.playerHp -= hpDmg;
        if (b.playerHp < 0) b.playerHp = 0;

        if (Math.random() < 0.2 && b.isBoss) {
            return {
                damage: hpDmg,
                armorDmg: armDmg,
                playerHp: b.playerHp,
                isSkill: true,
                skillName: 'Мощный удар',
                playerArmor: b.playerArmor
            };
        }

        return {
            damage: hpDmg,
            armorDmg: armDmg,
            playerHp: b.playerHp,
            playerArmor: b.playerArmor
        };
    },

    _giveReward: function(r) {
        if (!r) return;
        if (r.exp) Sherwood.addExp(r.exp);
        if (r.gold) Sherwood.addResource('gold', r.gold);
        if (r.gold) Sherwood.addResource('silver', Math.floor(r.gold * 2));

        try {
            if (typeof Sherwood.Bag !== 'undefined' && Sherwood.Bag.addItem) {
                var lootRoll = Math.random();

                if (lootRoll < 0.20) {
                    Sherwood.Bag.addItem({
                        id: 'skin_of_the_sherwood_creature',
                        name: 'Шкура шервудской твари',
                        icon: 'assets/interface/skin_of_the_sherwood_creature.png',
                        grade: 'common', type: 'resource', quantity: 1, maxStack: 50, sellPrice: 5
                    });
                } else if (lootRoll < 0.35) {
                    var arrowParts = [
                        { id: 'branch', name: 'Ветка', icon: 'assets/interface/branch_of_the_damned_yew.png', sellPrice: 3 },
                        { id: 'feather', name: 'Перо', icon: 'assets/interface/feather_beast_1.png', sellPrice: 3 },
                        { id: 'bone', name: 'Кость', icon: 'assets/interface/bone_growth_of_the_beast.png', sellPrice: 3 }
                    ];
                    var part = arrowParts[Math.floor(Math.random() * arrowParts.length)];
                    Sherwood.Bag.addItem({
                        id: part.id, name: part.name, icon: part.icon,
                        grade: 'common', type: 'resource', quantity: 1, maxStack: 99, sellPrice: part.sellPrice
                    });
                } else if (lootRoll < 0.45) {
                    Sherwood.addResource('scrolls', 1);
                } else if (lootRoll < 0.52) {
                    var chapter = Sherwood.getPlayer().questProgress.currentChapter || 1;
                    Sherwood.Bag.addItem({
                        id: 'ingot_chapter_' + chapter,
                        name: 'Слиток обликов (Глава ' + chapter + ')',
                        icon: 'assets/ingots resource crafting skin/ingot_chapter_' + chapter + '.png',
                        grade: 'rare', type: 'resource', quantity: 1, maxStack: 99, sellPrice: 20
                    });
                }
            }
        } catch(e) {}

        Sherwood.saveGame();
    },

    flee: function() {
        var b = this._battle;
        if (!b) return { success: false, reason: 'Нет боя' };

        var chance = 40 + (b.playerAgi || 0) * 0.5;
        if (Math.random() * 100 < chance) {
            this._battle = null;
            return { success: true };
        }

        var raw = this._calcDamage(b.enemyAtk, b.playerDef);
        var armDmg = Math.min(Math.floor(raw * 0.3), b.playerArmor);
        var hpDmg = raw - armDmg;
        if (b.playerArmor > 0) hpDmg = Math.floor(hpDmg * 0.5);
        hpDmg = Math.max(1, hpDmg);
        b.playerArmor -= armDmg;
        if (b.playerArmor < 0) b.playerArmor = 0;
        b.playerHp -= hpDmg;
        if (b.playerHp < 0) b.playerHp = 0;

        if (b.playerHp <= 0) {
            this._battle = null;
            return { success: false, lose: true, damage: hpDmg };
        }

        return { success: false, damage: hpDmg };
    },

    getSkills: function() {
    var p = Sherwood.getPlayer();
    var unlocked = p ? (p.unlockedSkills || []) : [];
    return {
        power_shot: {
            id: 'power_shot',
            name: 'Мощный выстрел',
            damageMultiplier: 1.8,
            cooldown: 3,
            description: 'Наносит 180% урона',
            icon: 'assets/skills/skill_critical_shot.png',
            unlocked: unlocked.indexOf('power_shot') !== -1,
            cost: 200
        },
        triple_shot: {
            id: 'triple_shot',
            name: 'Тройной выстрел',
            damageMultiplier: 0.7,
            cooldown: 4,
            description: '3 выстрела по 70% урона',
            icon: 'assets/skills/triple_shot_skill.png',
            unlocked: unlocked.indexOf('triple_shot') !== -1,
            cost: 300
        },
        poison_arrow: {
            id: 'poison_arrow',
            name: 'Отравленная стрела',
            damageMultiplier: 1.0,
            cooldown: 5,
            description: 'Отравляет врага на 3 хода',
            icon: 'assets/skills/poison_shot_skill.png',
            unlocked: unlocked.indexOf('poison_arrow') !== -1,
            cost: 250
        },
        stunning_shot: {
            id: 'stunning_shot',
            name: 'Оглушающий выстрел',
            damageMultiplier: 0.5,
            cooldown: 6,
            description: 'Оглушает врага на 1 ход',
            icon: 'assets/skills/control_skill.png',
            unlocked: unlocked.indexOf('stunning_shot') !== -1,
            cost: 350
        }
    };
},

unlockSkill: function(skillId) {
    var skills = this.getSkills();
    if (!skills[skillId]) return { success: false, reason: 'Навык не найден' };
    if (skills[skillId].unlocked) return { success: false, reason: 'Уже открыт' };
    var cost = skills[skillId].cost;
    var p = Sherwood.getPlayer();
    if (!p) return { success: false, reason: 'Нет игрока' };
    if ((p.resources.gold || 0) < cost) return { success: false, reason: 'Не хватает золота' };
    p.resources.gold -= cost;
    if (!p.unlockedSkills) p.unlockedSkills = [];
    p.unlockedSkills.push(skillId);
    Sherwood.saveGame();
    return { success: true, skill: skillId };
},
    unlockSkill: function(skillId) {
        var skills = this.getSkills();
        if (!skills[skillId]) return { success: false, reason: 'Навык не найден' };
        if (skills[skillId].unlocked) return { success: false, reason: 'Уже открыт' };
        var cost = skills[skillId].cost;
        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Нет игрока' };
        if ((p.resources.gold || 0) < cost) return { success: false, reason: 'Не хватает золота' };
        p.resources.gold -= cost;
        skills[skillId].unlocked = true;
        Sherwood.saveGame();
        return { success: true, skill: skillId };
    },

    useSkill: function(skillId) {
        var b = this._battle;
        if (!b) return null;
        var skills = this.getSkills();
        if (!skills[skillId] || !skills[skillId].unlocked) return { error: 'Навык не открыт' };
        if (this._cooldowns[skillId] && this._cooldowns[skillId] > 0) {
            return { error: 'Перезарядка: ' + this._cooldowns[skillId] + ' ходов' };
        }

        var skill = skills[skillId];
        var raw = this._calcDamage(b.playerAtk, b.enemyDef) * skill.damageMultiplier;
        var crit = Math.random() * 100 < 20;
        if (crit) raw = Math.floor(raw * 1.8);
        var hpDmg = Math.max(1, Math.floor(raw));
        b.enemyHp -= hpDmg;
        if (b.enemyHp < 0) b.enemyHp = 0;

        if (skillId === 'poison_arrow') {
            this._effects.push({ target: 'enemy', type: 'poison', dmg: Math.floor(hpDmg * 0.2) + 5, turns: 3 });
        }
        if (skillId === 'stunning_shot') {
            this._effects.push({ target: 'enemy', type: 'stun', turns: 1 });
        }

        this._cooldowns[skillId] = skill.cooldown;

        var r = {
            type: 'skill',
            skillId: skillId,
            skillName: skill.name,
            damage: hpDmg,
            crit: crit,
            enemyHp: b.enemyHp,
            enemyMaxHp: b.enemyMaxHp
        };

        if (b.enemyHp <= 0) {
            r.win = true;
            r.exp = b.isBoss ? 150 : 35;
            r.gold = b.isBoss ? 120 : 25;
            this._battle = null;
            return r;
        }

        var er = this._enemyTurn();
        r.enemy = er;
        if (b.playerHp <= 0) {
            r.lose = true;
            r.exp = Math.floor((b.isBoss ? 150 : 35) * 0.3);
            r.gold = Math.floor((b.isBoss ? 120 : 25) * 0.3);
            this._battle = null;
        }

        return r;
    },

    getCooldowns: function() {
        var result = {};
        for (var key in this._cooldowns) {
            if (this._cooldowns.hasOwnProperty(key)) {
                result[key] = this._cooldowns[key];
                if (this._cooldowns[key] > 0) this._cooldowns[key]--;
            }
        }
        return result;
    }
};

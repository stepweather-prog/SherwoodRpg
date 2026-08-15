/**
 * Sherwood Combat — Боевая система
 */

Sherwood.Combat = {
    _battle: null,
    _skills: {},

    init: function() {
        this._skills = {
            triple_shot: {
                id: 'triple_shot',
                name: 'Тройной выстрел',
                icon: 'assets/skills/triple_shot.png',
                description: '3 выстрела по 70% урона',
                damageMultiplier: 0.7,
                hits: 3,
                cooldown: 2,
                currentCooldown: 0,
                unlocked: true,
                cost: 0
            },
            power_shot: {
                id: 'power_shot',
                name: 'Мощный выстрел',
                icon: 'assets/skills/power_shot.png',
                description: 'Выстрел с 150% урона',
                damageMultiplier: 1.5,
                hits: 1,
                cooldown: 3,
                currentCooldown: 0,
                unlocked: true,
                cost: 0
            },
            poison_arrow: {
                id: 'poison_arrow',
                name: 'Ядовитая стрела',
                icon: 'assets/skills/poison_arrow.png',
                description: 'Отравляет врага на 3 хода',
                damageMultiplier: 0.6,
                hits: 1,
                dotDamage: 0.05,
                dotDuration: 3,
                cooldown: 4,
                currentCooldown: 0,
                unlocked: true,
                cost: 0
            }
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

        // Баг 2: Имя из бестиария
        var enemyName = 'Монстр';
        var enemyImage = monsterId || 'image (1).png';
        
        if (Sherwood.Bestiary && Sherwood.Bestiary.getBeast) {
            var beast = Sherwood.Bestiary.getBeast(monsterId);
            if (beast && beast.name) {
                enemyName = beast.name;
            }
        }

        // Баг 3: Статы масштабируются от уровня игрока и монстра
        var level = p.level || 1;
        var monsterLevel = 1;
        
        // Определяем уровень монстра из имени файла
        if (monsterId) {
            var numMatch = monsterId.match(/\((\d+)\)/);
            if (numMatch) {
                monsterLevel = Math.min(90, parseInt(numMatch[1], 10));
            }
        }
        
        var scale = 1 + (monsterLevel / 15) + (level / 30);
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
            dots: []
        };

        this._battle = {
            enemy: enemy,
            playerHp: p.stats.hp,
            playerMaxHp: p.stats.maxHp,
            turn: 0
        };
        
        // Сброс кулдаунов
        for (var id in this._skills) {
            this._skills[id].currentCooldown = 0;
        }
        
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

    // Баг 6: Тик кулдаунов при каждом действии
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
        
        // Тик кулдаунов
        this._tickCooldowns();
        
        // Урон игрока
        var rawDamage = Math.max(1, p.stats.attack - b.enemy.defense + Math.floor(Math.random() * 10));
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
            // Победа
            result.win = true;
            result.exp = Math.floor(b.enemy.maxHp * 0.3);
            result.gold = Math.floor(b.enemy.maxHp * 0.1);
            this._battle = null;
            return result;
        }
        
        // Ход врага
        var enemyResult = this._enemyTurn();
        if (enemyResult.playerDead) {
            result.playerDead = true;
            result.exp = Math.floor(b.enemy.maxHp * 0.1);
            result.gold = 0;
            this._battle = null;
            return result;
        }
        
        // Баг 1: Синхронизация HP с игроком
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
        
        // Тик кулдаунов
        this._tickCooldowns();
        
        // Установка кулдауна
        skill.currentCooldown = skill.cooldown;
        
        // Баг 4: Множественные удары
        var totalDamage = 0;
        var hits = skill.hits || 1;
        
        for (var h = 0; h < hits; h++) {
            var hitDamage = Math.max(1, Math.floor((p.stats.attack - b.enemy.defense) * skill.damageMultiplier));
            totalDamage += hitDamage;
            b.enemy.hp -= hitDamage;
            if (b.enemy.hp < 0) b.enemy.hp = 0;
            if (b.enemy.hp <= 0) break;
        }
        
        // Применение яда
        if (skill.dotDamage && skill.dotDuration && b.enemy.hp > 0) {
            b.enemy.dots.push({
                damagePerTurn: skill.dotDamage,
                remainingTurns: skill.dotDuration,
                name: skill.name
            });
        }
        
        var result = {
            damage: totalDamage,
            hits: hits,
            enemyHp: b.enemy.hp,
            enemyMaxHp: b.enemy.maxHp,
            enemyDead: b.enemy.hp <= 0,
            enemyImage: b.enemy.image
        };
        
        // Баг 8: Проверка победы после скилла
        if (b.enemy.hp <= 0) {
            result.win = true;
            result.exp = Math.floor(b.enemy.maxHp * 0.3);
            result.gold = Math.floor(b.enemy.maxHp * 0.1);
            this._battle = null;
            return result;
        }
        
        // Ход врага
        var enemyResult = this._enemyTurn();
        if (enemyResult.playerDead) {
            result.playerDead = true;
            result.exp = Math.floor(b.enemy.maxHp * 0.1);
            result.gold = 0;
            this._battle = null;
            return result;
        }
        
        // Синхронизация HP
        p.stats.hp = b.playerHp;
        result.playerHp = b.playerHp;
        result.enemyDamage = enemyResult.enemyDamage;
        
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
        if (b.enemy.hp < 0) b.enemy.hp = 0;
        
        // Баг 7: Проверка смерти от яда
        if (b.enemy.hp <= 0) {
            return { playerDead: false, enemyDeadByDot: true, dotDamage: totalDot };
        }
        
        // Урон врага
        var enemyDamage = Math.max(1, Math.floor(b.enemy.attack - p.stats.defense * 0.5 + Math.random() * 5));
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
        
        // Шанс побега 60%
        if (Math.random() < 0.6) {
            this._battle = null;
            Sherwood.saveGame();
            return { success: true };
        }
        
        // Не удалось — враг бьёт
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

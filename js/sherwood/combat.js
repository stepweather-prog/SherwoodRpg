Sherwood.Combat = {
    _battle: null,
    _effects: [],
    _turn: 0,
    _hitCount: 0,
    _cooldowns: {},

    start: function(monsterId, isBoss, mode) {
        var p = Sherwood.getPlayer();
        var hp = isBoss ? 400 + Math.floor(Math.random() * 200) : 80 + Math.floor(Math.random() * 120);
        var atk = isBoss ? 30 + Math.floor(Math.random() * 20) : 10 + Math.floor(Math.random() * 15);
        var def = isBoss ? 15 + Math.floor(Math.random() * 10) : 2 + Math.floor(Math.random() * 10);
        var armor = isBoss ? 40 + Math.floor(Math.random() * 30) : 10 + Math.floor(Math.random() * 20);
        var img = monsterId || 'image (1).png';
        var name = (Sherwood.Bestiary && Sherwood.Bestiary.BEASTS && Sherwood.Bestiary.BEASTS[monsterId]) ? Sherwood.Bestiary.BEASTS[monsterId].name : (monsterId || 'Монстр');
        this._battle = {
            enemyImage: img, enemyName: name,
            enemyHp: hp, enemyMaxHp: hp,
            enemyAtk: atk, enemyDef: def,
            enemyArmor: armor, enemyMaxArmor: armor,
            isBoss: !!isBoss, mode: mode || 'dungeon',
            playerHp: p.stats.hp, playerMaxHp: p.stats.maxHp,
            playerAtk: p.stats.attack, playerDef: p.stats.defense, playerAgi: p.stats.agility,
            playerArmor: p.stats.defense, playerMaxArmor: p.stats.defense
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
            enemyImage: b.enemyImage, enemyName: b.enemyName,
            enemyHp: b.enemyHp, enemyMaxHp: b.enemyMaxHp,
            enemyArmor: b.enemyArmor, enemyMaxArmor: b.enemyMaxArmor,
            playerHp: b.playerHp, playerMaxHp: b.playerMaxHp,
            playerArmor: b.playerArmor, playerMaxArmor: b.playerMaxArmor,
            isBoss: b.isBoss, turn: this._turn,
            cooldowns: Object.assign({}, this._cooldowns)
        };
    },

    isActive: function() { return !!this._battle; },

    _chargeRate: function() {
        var m = this._battle.mode;
        return (m === 'dungeon' || m === 'portal' || m === 'raid') ? 2 : 3;
    },

    _canUseSkill: function(id) {
        return !this._cooldowns[id] && this._hitCount >= this._chargeRate();
    },

    _calcDamage: function(atk, def) {
        if (def <= 0) def = 1;
        return Math.max(1, Math.floor((atk * atk) / (atk + def)));
    },

    attack: function() {
        var b = this._battle; if (!b) return null;
        var rawDmg = this._calcDamage(b.playerAtk, b.enemyDef);
        var crit = Math.random() * 100 < 15;
        if (crit) rawDmg = Math.floor(rawDmg * 1.8);
        // Сначала бьём по броне
        var armorDmg = Math.floor(rawDmg * 0.3);
        var hpDmg = rawDmg - Math.min(armorDmg, b.enemyArmor);
        armorDmg = Math.min(armorDmg, b.enemyArmor);
        b.enemyArmor -= armorDmg;
        if (b.enemyArmor > 0) hpDmg = Math.floor(hpDmg * 0.5);
        hpDmg = Math.max(1, hpDmg);
        b.enemyHp -= hpDmg;
        if (b.enemyHp < 0) b.enemyHp = 0;
        this._hitCount++;
        var r = { type: 'attack', damage: hpDmg, armorDmg: armorDmg, crit: crit, enemyHp: b.enemyHp, enemyMaxHp: b.enemyMaxHp, enemyArmor: b.enemyArmor };
        if (b.enemyHp <= 0) { r.win = true; r.exp = b.isBoss ? 150 : 35; r.gold = b.isBoss ? 120 : 25; this._giveReward(r); this._battle = null; return r; }
        var er = this._enemyTurn();
        r.enemy = er;
        if (b.playerHp <= 0) { r.lose = true; this._battle = null; }
        return r;
    },

    skill: function(id) {
        var b = this._battle; if (!b) return null;
        if (!this._canUseSkill(id)) return { fail: true, reason: 'Навык недоступен' };
        var skills = {
            power_shot: { mult: 1.8 },
            triple_shot: { mult: 0.7, hits: 3 },
            poison_arrow: { mult: 1.0, poison: { dmg: Math.floor(b.enemyMaxHp * 0.08) + 5, turns: 2 } },
            stunning_shot: { mult: 0.5, stun: 1 }
        };
        var s = skills[id];
        if (!s) return { fail: true };
        var rawDmg = Math.floor(this._calcDamage(b.playerAtk, b.enemyDef) * s.mult);
        if (s.hits) rawDmg = Math.floor(rawDmg * s.hits);
        var crit = Math.random() * 100 < 20;
        if (crit) rawDmg = Math.floor(rawDmg * 1.8);
        var armorDmg = Math.floor(rawDmg * 0.3);
        var hpDmg = rawDmg - Math.min(armorDmg, b.enemyArmor);
        armorDmg = Math.min(armorDmg, b.enemyArmor);
        b.enemyArmor -= armorDmg;
        if (b.enemyArmor > 0) hpDmg = Math.floor(hpDmg * 0.5);
        hpDmg = Math.max(1, hpDmg);
        b.enemyHp -= hpDmg;
        if (b.enemyHp < 0) b.enemyHp = 0;
        this._hitCount = 0;
        this._cooldowns[id] = true;
        var r = { type: 'skill', skill: id, damage: hpDmg, armorDmg: armorDmg, crit: crit, enemyHp: b.enemyHp, enemyMaxHp: b.enemyMaxHp, enemyArmor: b.enemyArmor };
        if (s.poison) { this._effects.push({ target: 'enemy', type: 'poison', dmg: s.poison.dmg, turns: s.poison.turns }); r.poison = true; }
        if (s.stun) { this._effects.push({ target: 'enemy', type: 'stun', turns: s.stun }); r.stun = true; }
        if (b.enemyHp <= 0) { r.win = true; r.exp = b.isBoss ? 150 : 35; r.gold = b.isBoss ? 120 : 25; this._giveReward(r); this._battle = null; return r; }
        var er = this._enemyTurn();
        r.enemy = er;
        if (b.playerHp <= 0) { r.lose = true; this._battle = null; }
        return r;
    },

    _enemyTurn: function() {
        var b = this._battle;
        for (var i = this._effects.length - 1; i >= 0; i--) {
            var e = this._effects[i];
            if (e.target === 'enemy' && e.type === 'stun') { e.turns--; if (e.turns <= 0) this._effects.splice(i, 1); return { stun: true }; }
            if (e.target === 'enemy' && e.type === 'poison') { b.enemyHp -= e.dmg; if (b.enemyHp < 0) b.enemyHp = 0; e.turns--; if (e.turns <= 0) this._effects.splice(i, 1); return { poison: true, dmg: e.dmg }; }
        }
        var rawDmg = this._calcDamage(b.enemyAtk, b.playerDef);
        var armorDmg = Math.floor(rawDmg * 0.3);
        var hpDmg = rawDmg - Math.min(armorDmg, b.playerArmor);
        armorDmg = Math.min(armorDmg, b.playerArmor);
        b.playerArmor -= armorDmg;
        if (b.playerArmor > 0) hpDmg = Math.floor(hpDmg * 0.5);
        hpDmg = Math.max(1, hpDmg);
        b.playerHp -= hpDmg;
        if (b.playerHp < 0) b.playerHp = 0;
        return { damage: hpDmg, armorDmg: armorDmg, playerHp: b.playerHp, playerArmor: b.playerArmor };
    },

    _giveReward: function(r) {
        Sherwood.addExp(r.exp);
        Sherwood.addResource('gold', r.gold);
        Sherwood.addResource('silver', Math.floor(r.gold * 1.5));
        Sherwood.saveGame();
    },

    flee: function() {
        if (!this._battle) return { fail: true };
        var b = this._battle;
        var chance = 40 + (b.playerAgi || 0) * 0.5;
        if (Math.random() * 100 < chance) { this._battle = null; return { success: true }; }
        var rawDmg = this._calcDamage(b.enemyAtk, b.playerDef);
        var armorDmg = Math.floor(rawDmg * 0.3);
        var hpDmg = rawDmg - Math.min(armorDmg, b.playerArmor);
        armorDmg = Math.min(armorDmg, b.playerArmor);
        b.playerArmor -= armorDmg;
        if (b.playerArmor > 0) hpDmg = Math.floor(hpDmg * 0.5);
        hpDmg = Math.max(1, hpDmg);
        b.playerHp -= hpDmg;
        if (b.playerHp <= 0) { this._battle = null; return { fail: true, lose: true, damage: hpDmg }; }
        return { fail: true, damage: hpDmg };
    }
};

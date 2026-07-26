/**
 * Sherwood RPG — Core
 * Ядро игры: игрок, сохранение, ресурсы, статы, события, формулы
 */

if (typeof Sherwood === 'undefined') { var Sherwood = {}; }

Sherwood._player = null;
Sherwood._saveTimeout = null;
Sherwood._saveDelay = 500; // мс задержка автосохранения

// ============================================================
//  ИГРОК
// ============================================================

Sherwood.getPlayer = function() {
    if (!this._player) this._loadGame();
    return this._player;
};

Sherwood.setPlayer = function(p) {
    this._player = p;
    this.saveGame();
};

// ============================================================
//  СОХРАНЕНИЕ
// ============================================================

Sherwood._saveKey = 'sherwood_save_data';

Sherwood.saveGame = function() {
    if (!this._player) return;
    if (this._saveTimeout) clearTimeout(this._saveTimeout);
    var self = this;
    this._saveTimeout = setTimeout(function() {
        try { localStorage.setItem(self._saveKey, JSON.stringify(self._player)); } catch(e) {}
        self._saveTimeout = null;
    }, this._saveDelay);
};

Sherwood.saveGameNow = function() {
    if (this._saveTimeout) {
        clearTimeout(this._saveTimeout);
        this._saveTimeout = null;
    }
    if (!this._player) return;
    try { localStorage.setItem(this._saveKey, JSON.stringify(this._player)); } catch(e) {}
};

Sherwood._loadGame = function() {
    try {
        var data = localStorage.getItem(this._saveKey);
        if (data) {
            this._player = JSON.parse(data);
            this._ensureDefaults();
            return;
        }
    } catch(e) {}
    this._createNewPlayer();
    this.saveGameNow();
};

Sherwood._ensureDefaults = function() {
    var p = this._player;
    if (!p) return;

    var defaults = {
        name: 'Охотник',
        level: 1,
        exp: 0,
        expToLevel: 100,
        stats: { attack: 10, defense: 5, agility: 3, hp: 100, maxHp: 100 },
        resources: { gold: 0, silver: 100, trophies: 0, scrolls: 0, ingots: 0, wood: 0, feathers: 0 },
        inventory: [],
        equipment: {},
        dungeon: { tickets: 5, maxTickets: 5 },
        bagSize: 10,
        bestiary: {},
        questProgress: { completed: [], currentChapter: 1 },
        trophies: [],
        trainingLevels: { attack: 0, defense: 0, hp: 0, agility: 0 },
        unlockedSkins: [],
        activeSkin: 'skin_1_basic',
        questEnergy: { current: 50, max: 50 },
        portal: { completed: [] },
        arena: { wins: 0, losses: 0, rank: 'Новичок' },
        raid: { raidsToday: 0, lastRaidDate: '' },
        tavern: { questsCompleted: 0, dailyQuestsDone: 0 }
    };

    for (var key in defaults) {
        if (defaults.hasOwnProperty(key)) {
            if (p[key] === undefined || p[key] === null) {
                p[key] = JSON.parse(JSON.stringify(defaults[key]));
            }
        }
    }

    // Проверка вложенных объектов
    if (!p.stats) p.stats = defaults.stats;
    if (!p.resources) p.resources = defaults.resources;
    if (!p.dungeon) p.dungeon = defaults.dungeon;
    if (!p.questProgress) p.questProgress = defaults.questProgress;
    if (!p.trainingLevels) p.trainingLevels = defaults.trainingLevels;
    if (!p.questEnergy) p.questEnergy = defaults.questEnergy;
    if (!p.portal) p.portal = defaults.portal;
    if (!p.arena) p.arena = defaults.arena;
    if (!p.raid) p.raid = defaults.raid;
    if (!p.tavern) p.tavern = defaults.tavern;

    // Если currentChapter отсутствует
    if (p.questProgress && p.questProgress.currentChapter === undefined) {
        p.questProgress.currentChapter = 1;
    }
};

Sherwood._createNewPlayer = function() {
    this._player = {
        name: 'Охотник',
        level: 1,
        exp: 0,
        expToLevel: 100,
        stats: { attack: 10, defense: 5, agility: 3, hp: 100, maxHp: 100 },
        resources: { gold: 0, silver: 100, trophies: 0, scrolls: 0, ingots: 0, wood: 0, feathers: 0 },
        inventory: [],
        equipment: {},
        dungeon: { tickets: 5, maxTickets: 5 },
        bagSize: 10,
        bestiary: {},
        questProgress: { completed: [], currentChapter: 1 },
        trophies: [],
        trainingLevels: { attack: 0, defense: 0, hp: 0, agility: 0 },
        unlockedSkins: [],
        activeSkin: 'skin_1_basic',
        questEnergy: { current: 50, max: 50 },
        portal: { completed: [] },
        arena: { wins: 0, losses: 0, rank: 'Новичок' },
        raid: { raidsToday: 0, lastRaidDate: '' },
        tavern: { questsCompleted: 0, dailyQuestsDone: 0 }
    };
};

// ============================================================
//  РЕСУРСЫ
// ============================================================

Sherwood.addResource = function(type, amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return;
    var p = this.getPlayer();
    if (!p) return;
    if (!p.resources) p.resources = {};
    var oldValue = p.resources[type] || 0;
    p.resources[type] = Math.max(0, oldValue + amount);
    this.dispatch({
        type: 'RESOURCE_CHANGED',
        payload: { type: type, amount: amount, newValue: p.resources[type] }
    });
    this.saveGame();
};

Sherwood.hasResource = function(type, amount) {
    var p = this.getPlayer();
    return p && p.resources && (p.resources[type] || 0) >= amount;
};

Sherwood.spendResource = function(type, amount) {
    if (!this.hasResource(type, amount)) return false;
    var p = this.getPlayer();
    p.resources[type] -= amount;
    this.dispatch({
        type: 'RESOURCE_CHANGED',
        payload: { type: type, amount: -amount, newValue: p.resources[type] }
    });
    this.saveGame();
    return true;
};

// ============================================================
//  ОПЫТ
// ============================================================

Sherwood.addExp = function(amount) {
    if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) return;
    var p = this.getPlayer();
    if (!p || p.level >= 100) return;

    p.exp += amount;
    while (p.exp >= p.expToLevel && p.level < 100) {
        p.exp -= p.expToLevel;
        p.level++;
        p.expToLevel = Math.min(Math.floor(p.expToLevel * 1.3), 999999);
        this.dispatch({ type: 'PLAYER_LEVEL_UP', payload: { level: p.level } });
        this._recalcStats();
    }
    if (p.level >= 100) {
        p.exp = 0;
        p.expToLevel = 0;
    }
    this.saveGame();
};

Sherwood.getExpToLevel = function() {
    var p = this.getPlayer();
    return p ? p.expToLevel : 100;
};

Sherwood.getLevelProgress = function() {
    var p = this.getPlayer();
    if (!p) return 0;
    if (p.level >= 100) return 100;
    return Math.min(100, (p.exp / (p.expToLevel || 1)) * 100);
};

// ============================================================
//  СОБЫТИЯ
// ============================================================

Sherwood._events = {};

Sherwood.on = function(event, cb) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(cb);
};

Sherwood.off = function(event, cb) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(function(f) { return f !== cb; });
};

Sherwood.dispatch = function(event) {
    if (!event || !event.type) return;
    var cbs = this._events[event.type] || [];
    for (var i = 0; i < cbs.length; i++) {
        try { cbs[i](event.payload); } catch(e) {}
    }
};

// ============================================================
//  ФОРМУЛЫ
// ============================================================

Sherwood.getJewelryBonus = function(level, baseMultiplier) {
    if (typeof level !== 'number' || level < 0) level = 0;
    return Math.round(baseMultiplier * Math.pow(level + 1, 1.8));
};

Sherwood.getMonsterHP = function(chapter, floor) {
    chapter = Math.max(1, chapter || 1);
    floor = Math.max(1, floor || 1);
    return Math.round(100 * Math.pow(chapter, 2.1) * (1 + floor * 0.15));
};

Sherwood.getStatUpgradeCost = function(currentLevel) {
    currentLevel = Math.max(0, currentLevel || 0);
    return Math.round(10 * Math.pow(currentLevel + 1, 1.15));
};

Sherwood.calculateDamage = function(attack, defense) {
    attack = Math.max(1, attack || 0);
    defense = Math.max(0, defense || 0);
    return Math.max(1, Math.floor((attack * attack) / (attack + defense)));
};

Sherwood.calculateCrit = function(agility) {
    var chance = 5 + (agility || 0) * 0.3;
    return Math.min(50, chance);
};

// ============================================================
//  ПЕРЕСЧЁТ СТАТОВ
// ============================================================

Sherwood._recalcStats = function() {
    var p = this.getPlayer();
    if (!p) return;

    var ba = 0, bd = 0, bag = 0, bh = 0;

    // Экипировка
    for (var k in p.equipment) {
        if (p.equipment.hasOwnProperty(k)) {
            var eq = p.equipment[k];
            if (eq && eq.stats) {
                ba += eq.stats.attack || 0;
                bd += eq.stats.defense || 0;
                bag += eq.stats.agility || 0;
                bh += eq.stats.hp || 0;
            }
        }
    }

    // Тренировки
    var tl = p.trainingLevels || {};
    ba += (tl.attack || 0) * 2;
    bd += (tl.defense || 0) * 2;
    bag += (tl.agility || 0) * 1;
    bh += (tl.hp || 0) * 10;

    // Трофеи
    for (var i = 0; i < (p.trophies || []).length; i++) {
        var t = p.trophies[i];
        if (t && t.bonus) {
            ba += t.bonus.attack || 0;
            bd += t.bonus.defense || 0;
            bag += t.bonus.agility || 0;
            bh += t.bonus.hp || 0;
        }
    }

    var MAX = 30000;
    p.stats.attack = Math.min(Math.floor(10 + (p.level - 1) * 2 + ba), MAX);
    p.stats.defense = Math.min(Math.floor(5 + (p.level - 1) * 1 + bd), MAX);
    p.stats.agility = Math.min(Math.floor(3 + (p.level - 1) * 0.5 + bag), MAX);
    p.stats.maxHp = Math.min(Math.floor(100 + (p.level - 1) * 15 + bh), MAX);

    if (!p.stats.hp || p.stats.hp > p.stats.maxHp) {
        p.stats.hp = p.stats.maxHp;
    }

    this.saveGame();
};

// ============================================================
//  ТРОФЕИ
// ============================================================

Sherwood.addTrophy = function(id, name, bonus, icon, category) {
    var p = this.getPlayer();
    if (!p) return false;
    if (!p.trophies) p.trophies = [];
    if (p.trophies.some(function(t) { return t.id === id; })) return false;

    p.trophies.push({
        id: id,
        name: name || 'Трофей',
        bonus: bonus || {},
        icon: icon || '',
        category: category || 'chapter',
        acquiredAt: Date.now()
    });

    this._recalcStats();
    this.saveGame();
    this.dispatch({ type: 'TROPHY_UNLOCKED', payload: { trophy: id } });
    return true;
};

Sherwood.getTrophies = function() {
    var p = this.getPlayer();
    return p ? (p.trophies || []) : [];
};

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================

Sherwood.init = function() {
    this.getPlayer();
    this._recalcStats();

    // Инициализация подсистем (только если они есть)
    var subsystems = ['Dungeon', 'Bag', 'Quests', 'Tavern', 'Daily', 'Portal', 'Forge', 'Raid', 'Arena', 'BlackMarket', 'Chat', 'Bestiary', 'Combat'];
    for (var i = 0; i < subsystems.length; i++) {
        var name = subsystems[i];
        if (typeof Sherwood[name] !== 'undefined' && Sherwood[name].init) {
            try { Sherwood[name].init(); } catch(e) {
                console.warn('⚠️ Ошибка инициализации ' + name + ':', e);
            }
        }
    }

    this.dispatch({ type: 'GAME_INITIALIZED' });
    console.log('🏹 Sherwood RPG готов!');
};

// ============================================================
//  АВТОЗАПУСК
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    if (typeof Sherwood !== 'undefined' && Sherwood.init) {
        Sherwood.init();
    }
});

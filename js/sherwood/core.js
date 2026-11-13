/**
 * Sherwood RPG — Core
 * Ядро игры: игрок, сохранение, ресурсы, статы, события, формулы
 */

if (typeof Sherwood === 'undefined') { var Sherwood = {}; }

Sherwood._player = null;
Sherwood._saveTimeout = null;
Sherwood._saveDelay = 500;

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
    if (this._saveTimeout) { clearTimeout(this._saveTimeout); this._saveTimeout = null; }
    if (!this._player) return;
    try { localStorage.setItem(this._saveKey, JSON.stringify(this._player)); } catch(e) {}
};

Sherwood._loadGame = function() {
    try {
        var data = localStorage.getItem(this._saveKey);
        if (data) { this._player = JSON.parse(data); this._ensureDefaults(); return; }
    } catch(e) {}
    this._createNewPlayer();
    this.saveGameNow();
};

Sherwood._ensureDefaults = function() {
    var p = this._player;
    if (!p) return;

    var defaults = {
        name: 'Охотник',
        level: 1, exp: 0, expToLevel: 500,
        experiencePoints: 20,
        talentPoints: 0,
        stats: { attack: 150, defense: 150, hp: 150, maxHp: 150, mana: 150, maxMana: 150 },
        resources: { gold: 100, silver: 100, scrolls: 0, ingots: 0, wood: 0, feathers: 0, branches: 0, bones: 0 },
        inventory: [], equipment: {},
        dungeon: { tickets: 10, maxTickets: 15, autoTickets: 10 },
        bagSize: 5, bestiary: {},
        questProgress: { completed: [], currentChapter: 1 },
        trophies: [],
        trainingLevels: { attack: 0, defense: 0, hp: 0 },
        unlockedSkins: ['skin1_01'], activeSkin: 'skin1_01',
        questEnergy: { current: 50, max: 50 },
        portal: { completed: [], difficulty: {} },
        arena: { wins: 0, losses: 0, rank: 'Новичок' },
        raid: { raidsToday: 0, lastRaidDate: '' },
        tavern: { questsCompleted: 0, dailyQuestsDone: 0 },
        daily: { chapterCompleted: [] },
        keset: { silver: 0, maxSilver: 2500000, minWithdraw: 10000 },
        eternityBonds: { count: 0, bonus: 0 },
        hearthBonus: null, hearthCooldown: 0,
        bagResources: null,
        nameChanges: 0,
        jewelry: { rings: [], amulets: [] },
        dungeonProgress: null,
        activeDungeon: null,
        marketData: null,
        questAttempts: null,
        wallet: null
    };

    for (var key in defaults) {
        if (defaults.hasOwnProperty(key)) {
            if (p[key] === undefined || p[key] === null) {
                p[key] = JSON.parse(JSON.stringify(defaults[key]));
            }
        }
    }

    if (!p.stats) p.stats = defaults.stats;
    if (!p.stats.attack) p.stats = defaults.stats;
    if (!p.stats.mana) p.stats.mana = 200;
    if (!p.stats.maxMana) p.stats.maxMana = 200;
    if (!p.resources) p.resources = defaults.resources;
    if (!p.dungeon) p.dungeon = defaults.dungeon;
    if (!p.dungeon.autoTickets && p.dungeon.autoTickets !== 0) p.dungeon.autoTickets = 3;
    if (!p.questProgress) p.questProgress = defaults.questProgress;
    if (!p.trainingLevels) p.trainingLevels = defaults.trainingLevels;
    if (!p.portal) p.portal = defaults.portal;
    if (!p.arena) p.arena = defaults.arena;
    if (!p.raid) p.raid = defaults.raid;
    if (!p.tavern) p.tavern = defaults.tavern;
    if (!p.daily) p.daily = defaults.daily;
    if (!p.keset) p.keset = defaults.keset;
    if (!p.eternityBonds) p.eternityBonds = defaults.eternityBonds;
    if (!p.unlockedSkins || p.unlockedSkins.length === 0) p.unlockedSkins = ['skin1_01'];
    if (!p.activeSkin) p.activeSkin = 'skin1_01';
    if (!p.nameChanges && p.nameChanges !== 0) p.nameChanges = 0;
    if (!p.jewelry) p.jewelry = { rings: [], amulets: [] };

    if (!p.dungeonProgress) {
        p.dungeonProgress = { 
            forest: { level: 1, cups: {} },
            swamp: { level: 1, cups: {} },
            cave: { level: 1, cups: {} }
        };
    }
    if (!p.marketData) p.marketData = {};
    if (p.activeDungeon === undefined) p.activeDungeon = null;
    if (!p.questAttempts) p.questAttempts = { today: 0, lastDate: '', freeAccel: false, accelUsed: 0, lastAttempt: 0 };
    if (!p.wallet) p.wallet = { cells: [], totalSilver: 0 };
    
    if (p.hearthBonus && p.hearthBonus.endTime && Date.now() > p.hearthBonus.endTime) {
        p.hearthBonus = null;
    }
    if (p.hearthCooldown && Date.now() > p.hearthCooldown) {
        p.hearthCooldown = 0;
    }
};

Sherwood._createNewPlayer = function() {
    this._player = {
        name: 'Охотник',
        level: 1, exp: 0, expToLevel: 500,
        experiencePoints: 20,
        talentPoints: 0,
        stats: { attack: 150, defense: 150, hp: 150, maxHp: 150, mana: 150, maxMana: 150 },
        resources: { gold: 100, silver: 100, scrolls: 0, ingots: 0, wood: 0, feathers: 0, branches: 0, bones: 0 },
        inventory: [], equipment: {},
        dungeon: { tickets: 10, maxTickets: 15, autoTickets: 10 },
        bagSize: 5, bestiary: {},
        questProgress: { completed: [], currentChapter: 1 },
        trophies: [],
        trainingLevels: { attack: 0, defense: 0, hp: 0 },
        unlockedSkins: ['skin1_01'], activeSkin: 'skin1_01',
        questEnergy: { current: 50, max: 50 },
        portal: { completed: [], difficulty: {} },
        arena: { wins: 0, losses: 0, rank: 'Новичок' },
        raid: { raidsToday: 0, lastRaidDate: '' },
        tavern: { questsCompleted: 0, dailyQuestsDone: 0 },
        daily: { chapterCompleted: [] },
        keset: { silver: 0, maxSilver: 2500000, minWithdraw: 10000 },
        eternityBonds: { count: 0, bonus: 0 },
        hearthBonus: null, hearthCooldown: 0,
        bagResources: null,
        nameChanges: 0,
        jewelry: { rings: [], amulets: [] },
        dungeonProgress: {
            forest: { level: 1, cups: {} },
            swamp: { level: 1, cups: {} },
            cave: { level: 1, cups: {} }
        },
        activeDungeon: null,
        marketData: {},
        questAttempts: { today: 0, lastDate: '', freeAccel: false, accelUsed: 0, lastAttempt: 0 },
        wallet: { cells: [], totalSilver: 0 }
    };
    
    this._player.wallet.cells = [];
    for (var i = 0; i < 30; i++) this._player.wallet.cells.push(0);
    this._player.wallet.totalSilver = 0;
};

// ============================================================
//  РЕСУРСЫ
// ============================================================

Sherwood.addResource = function(type, amount) {
    if (typeof amount !== 'number' || isNaN(amount)) return;
    var p = this.getPlayer();
    if (!p) return;
    if (!p.resources) p.resources = {};
    
    if (type === 'gold' || type === 'silver') {
        if (typeof Sherwood.Bag !== 'undefined' && Sherwood.Bag._resources) {
            Sherwood.Bag._resources[type] = (Sherwood.Bag._resources[type] || 0) + amount;
        }
    }
    
    p.resources[type] = Math.max(0, (p.resources[type] || 0) + amount);
    this.dispatch({ type: 'RESOURCE_CHANGED', payload: { type: type, amount: amount, newValue: p.resources[type] } });
    this.saveGame();
};

Sherwood.hasResource = function(type, amount) {
    var p = this.getPlayer();
    return p && p.resources && (p.resources[type] || 0) >= amount;
};

Sherwood.spendResource = function(type, amount) {
    if (!this.hasResource(type, amount)) return false;
    var p = this.getPlayer();
    
    if (type === 'gold' || type === 'silver') {
        if (typeof Sherwood.Bag !== 'undefined' && Sherwood.Bag._resources) {
            Sherwood.Bag._resources[type] = Math.max(0, (Sherwood.Bag._resources[type] || 0) - amount);
        }
    }
    
    p.resources[type] -= amount;
    this.dispatch({ type: 'RESOURCE_CHANGED', payload: { type: type, amount: -amount, newValue: p.resources[type] } });
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
        
        // НАЧИСЛЕНИЕ ОЧКОВ ОПЫТА И ТАЛАНТОВ
        p.experiencePoints = (p.experiencePoints || 0) + 1;
        p.talentPoints = (p.talentPoints || 0) + 1;
        
        // Формула: 500 * (уровень ^ 1.8)
// 1 ур: ~500, 2 ур: ~1750, 3 ур: ~3500, 5 ур: ~8500, 10 ур: ~28000
p.expToLevel = Math.floor(500 * Math.pow(p.level, 1.8));
        this.dispatch({ type: 'PLAYER_LEVEL_UP', payload: { level: p.level } });
        this._recalcStats();
    }
    if (p.level >= 100) { p.exp = 0; p.expToLevel = 0; }
    this.saveGame();
};

Sherwood.getExpToLevel = function() { var p = this.getPlayer(); return p ? p.expToLevel : 500; };
Sherwood.getLevelProgress = function() { var p = this.getPlayer(); if (!p) return 0; if (p.level >= 100) return 100; return Math.min(100, (p.exp / (p.expToLevel || 1)) * 100); };

// ============================================================
//  СОБЫТИЯ
// ============================================================

Sherwood._events = {};
Sherwood.on = function(event, cb) { if (!this._events[event]) this._events[event] = []; this._events[event].push(cb); };
Sherwood.off = function(event, cb) { if (!this._events[event]) return; this._events[event] = this._events[event].filter(function(f) { return f !== cb; }); };
Sherwood.dispatch = function(event) { if (!event || !event.type) return; var cbs = this._events[event.type] || []; for (var i = 0; i < cbs.length; i++) { try { cbs[i](event.payload); } catch(e) {} } };

// ============================================================
//  ФОРМУЛЫ
// ============================================================

Sherwood.getJewelryBonus = function(level, baseMultiplier) {
    if (typeof level !== 'number' || level < 0) level = 0;
    return Math.round(baseMultiplier * Math.pow(level + 1, 1.8));
};

Sherwood.calculateDamage = function(attack, defense) {
    attack = Math.max(1, attack || 0);
    defense = Math.max(0, defense || 0);
    return Math.max(1, Math.floor((attack * attack) / (attack + defense)));
};

// ============================================================
//  СКИНЫ И ИХ БОНУСЫ
// ============================================================

Sherwood.SKIN_BONUSES = {
    'skin1_01': { name: 'Лесной мародер', bonus: 0, chapter: 1 },
    'skin9_01': { name: 'Черный инквизитор', bonus: 520, chapter: 9 },
    'skin8_01': { name: 'Костяной жнец', bonus: 430, chapter: 8 },
    'skin4_01': { name: 'Отреченный рыцарь', bonus: 110, chapter: 4 },
    'skin16_03': { name: 'Дух Истинного Шервуда', bonus: 1070, chapter: 16 },
    'bonus_skin_sec': { name: 'Бог бездны', bonus: 1100, chapter: 16, bonus: true }
};

Sherwood.getSkinBonus = function(skinId) { var skin = this.SKIN_BONUSES[skinId]; return skin ? skin.bonus : 0; };
Sherwood.getActiveSkinBonus = function() { var p = this.getPlayer(); if (!p) return 0; return this.getSkinBonus(p.activeSkin || 'skin1_01'); };

Sherwood.canCraftSkin = function(skinId) {
    var p = this.getPlayer(); if (!p) return { can: false };
    if (!this.SKIN_BONUSES[skinId]) return { can: false };
    if (p.unlockedSkins && p.unlockedSkins.indexOf(skinId) !== -1) return { can: false };
    return { can: true };
};

Sherwood.craftSkin = function(skinId) {
    var check = this.canCraftSkin(skinId); if (!check.can) return check;
    var p = this.getPlayer();
    if (!p.unlockedSkins) p.unlockedSkins = [];
    p.unlockedSkins.push(skinId);
    if (p.unlockedSkins.length === 1) p.activeSkin = skinId;
    this._recalcStats(); this.saveGame();
    return { success: true, skinId: skinId };
};

Sherwood.equipSkin = function(skinId) {
    var p = this.getPlayer(); if (!p) return { success: false };
    if (!p.unlockedSkins || p.unlockedSkins.indexOf(skinId) === -1) return { success: false };
    p.activeSkin = skinId;
    this._recalcStats(); this.saveGame();
    return { success: true, skinId: skinId };
};

// ============================================================
//  СКРИЖАЛИ
// ============================================================

Sherwood.buyScrolls = function(type, count) {
    if (!count || count <= 0) return { success: false };
    var p = this.getPlayer(); if (!p) return { success: false };
    var totalCost = 20 * count;
    if ((p.resources.gold || 0) < totalCost) return { success: false, reason: 'Нужно ' + totalCost + ' золота' };
    p.resources.gold -= totalCost;
    p.resources.scrolls = (p.resources.scrolls || 0) + count;
    this.saveGame();
    return { success: true, count: count, cost: totalCost };
};

Sherwood.getScrollCount = function() { var p = this.getPlayer(); return p ? (p.resources.scrolls || 0) : 0; };

// ============================================================
//  КОНВЕРТАЦИЯ ВАЛЮТ
// ============================================================

Sherwood.convertGoldToSilver = function(amount) {
    if (!amount || amount <= 0) return { success: false };
    var p = this.getPlayer(); if (!p) return { success: false };
    if ((p.resources.gold || 0) < amount) return { success: false, reason: 'Недостаточно золота' };
    p.resources.gold -= amount;
    p.resources.silver = (p.resources.silver || 0) + amount * 100;
    this.saveGame();
    return { success: true, gold: amount, silver: amount * 100 };
};

// ============================================================
//  ТРОФЕИ
// ============================================================

Sherwood.addTrophy = function(id, name, bonus, icon, category) {
    var p = this.getPlayer(); if (!p) return false;
    if (!p.trophies) p.trophies = [];
    if (p.trophies.some(function(t) { return t.id === id; })) return false;
    p.trophies.push({ id: id, name: name || 'Трофей', bonus: bonus || {}, icon: icon || '', category: category || 'chapter', acquiredAt: Date.now() });
    this._recalcStats(); this.saveGame();
    return true;
};

Sherwood.getTrophies = function() { var p = this.getPlayer(); return p ? (p.trophies || []) : []; };

// ============================================================
//  ПЕРЕСЧЁТ СТАТОВ
// ============================================================

Sherwood._recalcStats = function() {
    var p = this.getPlayer(); if (!p) return;

    var ba = 0, bd = 0, bh = 0;

    for (var k in p.equipment) {
        if (p.equipment.hasOwnProperty(k)) {
            var eq = p.equipment[k];
            if (eq && eq.stats) { ba += eq.stats.attack || 0; bd += eq.stats.defense || 0; bh += eq.stats.hp || 0; }
        }
    }

    var tl = p.trainingLevels || {};
    ba += (tl.attack || 0) * 25;
    bd += (tl.defense || 0) * 25;
    bh += (tl.hp || 0) * 25;

    for (var i = 0; i < (p.trophies || []).length; i++) {
        var t = p.trophies[i];
        if (t && t.bonus) { ba += t.bonus.attack || 0; bd += t.bonus.defense || 0; bh += t.bonus.hp || 0; }
    }

    if (p.eternityBonds && p.eternityBonds.bonus) {
        ba += p.eternityBonds.bonus;
        bd += p.eternityBonds.bonus;
        bh += p.eternityBonds.bonus * 5;
    }

    var hearthMultiplier = 1;
    if (p.hearthBonus && p.hearthBonus.active && Date.now() < p.hearthBonus.endTime) {
        hearthMultiplier = 1.5;
    }

    var totalSkinBonus = p.unlockedSkins ? p.unlockedSkins.length : 0;
    var totalMultiplier = 1 + totalSkinBonus / 100;

    var MAX = 999999;
    var levelBonus = (p.level - 1) * 50;   // +50 за каждый уровень после 1-го

    var baseAttack = Math.min(150 + levelBonus + ba, MAX);
    var baseDefense = Math.min(150 + levelBonus + bd, MAX);
    var baseMaxHp = Math.min(150 + levelBonus + bh, MAX);
    var baseMaxMana = Math.min(150 + levelBonus, MAX);

    p.stats.attack = Math.min(Math.floor(baseAttack * totalMultiplier), MAX);
    p.stats.defense = Math.min(Math.floor(baseDefense * totalMultiplier), MAX);
    p.stats.maxHp = Math.min(Math.floor(baseMaxHp * totalMultiplier), MAX);
    p.stats.maxMana = baseMaxMana;

    if (!p.stats.hp || p.stats.hp > p.stats.maxHp) p.stats.hp = p.stats.maxHp;
    if (!p.stats.mana || p.stats.mana > p.stats.maxMana) p.stats.mana = p.stats.maxMana;

    this.saveGame();
};

// ============================================================
//  ВОЗВРАТ НА ГЛАВНУЮ (ДЛЯ СТАРЫХ МОДУЛЕЙ)
// ============================================================

if (typeof window.showHomeScreen !== 'function') {
    window.showHomeScreen = function() {
        if (typeof window.closeAllScreens === 'function') {
            window.closeAllScreens();
        }
        
        var homeScreen = document.getElementById('homeScreen');
        var menuScreen = document.getElementById('menuScreen');
        if (homeScreen) homeScreen.style.display = 'flex';
        if (menuScreen) menuScreen.style.display = 'none';
        
        if (typeof window.updateTopBar === 'function') {
            window.updateTopBar();
        }
        if (typeof window.initMainCarousel === 'function') {
            window.initMainCarousel();
        }
        
        console.log('🏠 Возврат на главную (из core.js)');
    };
}

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================

Sherwood.init = function() {
    this.getPlayer(); 
    this._recalcStats();
    
    var subsystems = ['Dungeon', 'Quests', 'Tavern', 'Portal', 'Forge', 'Raid', 'Arena', 'BlackMarket', 'Bestiary', 'Combat'];
    for (var i = 0; i < subsystems.length; i++) {
        var name = subsystems[i];
        if (typeof Sherwood[name] !== 'undefined' && Sherwood[name].init) {
            try { Sherwood[name].init(); } catch(e) { console.warn('Ошибка ' + name + ':', e); }
        }
    }
    
    this.dispatch({ type: 'GAME_INITIALIZED' });
    console.log('🏹 Sherwood RPG готов!');
};

// Сохранение при закрытии вкладки
window.addEventListener('beforeunload', function() {
    if (Sherwood._player) {
        try { localStorage.setItem(Sherwood._saveKey, JSON.stringify(Sherwood._player)); } catch(e) {}
    }
});

document.addEventListener('DOMContentLoaded', function() { 
    if (typeof Sherwood !== 'undefined' && Sherwood.init) Sherwood.init(); 
});

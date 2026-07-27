/**
 * Sherwood RPG — Core
 * Ядро игры: игрок, сохранение, ресурсы, статы, события, формулы
 * СКИНЫ: прирост статов до +225%, крафт за скрижали
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
        resources: { gold: 0, silver: 100, trophies: 0, scrolls: 0, ingots: 0, wood: 0, feathers: 0, branches: 0, bones: 0 },
        inventory: [],
        equipment: {},
        dungeon: { tickets: 5, maxTickets: 5 },
        bagSize: 10,
        bestiary: {},
        questProgress: { completed: [], currentChapter: 1 },
        trophies: [],
        trainingLevels: { attack: 0, defense: 0, hp: 0, agility: 0 },
        unlockedSkins: ['skin_1_basic'],
        activeSkin: 'skin_1_basic',
        questEnergy: { current: 50, max: 50 },
        portal: { completed: [] },
        arena: { wins: 0, losses: 0, rank: 'Новичок' },
        raid: { raidsToday: 0, lastRaidDate: '' },
        tavern: { questsCompleted: 0, dailyQuestsDone: 0 },
        daily: { chapterCompleted: [] }
    };

    for (var key in defaults) {
        if (defaults.hasOwnProperty(key)) {
            if (p[key] === undefined || p[key] === null) {
                p[key] = JSON.parse(JSON.stringify(defaults[key]));
            }
        }
    }

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
    if (!p.daily) p.daily = defaults.daily;

    if (!p.unlockedSkins || p.unlockedSkins.length === 0) {
        p.unlockedSkins = ['skin_1_basic'];
    }
    if (!p.activeSkin) {
        p.activeSkin = 'skin_1_basic';
    }

    if (p.questProgress && p.questProgress.currentChapter === undefined) {
        p.questProgress.currentChapter = 1;
    }
    
    if (!p.resources.feathers && p.resources.feathers !== 0) p.resources.feathers = 0;
    if (!p.resources.branches && p.resources.branches !== 0) p.resources.branches = 0;
    if (!p.resources.bones && p.resources.bones !== 0) p.resources.bones = 0;
};

Sherwood._createNewPlayer = function() {
    this._player = {
        name: 'Охотник',
        level: 1,
        exp: 0,
        expToLevel: 100,
        stats: { attack: 10, defense: 5, agility: 3, hp: 100, maxHp: 100 },
        resources: { gold: 0, silver: 100, trophies: 0, scrolls: 0, ingots: 0, wood: 0, feathers: 0, branches: 0, bones: 0 },
        inventory: [],
        equipment: {},
        dungeon: { tickets: 5, maxTickets: 5 },
        bagSize: 10,
        bestiary: {},
        questProgress: { completed: [], currentChapter: 1 },
        trophies: [],
        trainingLevels: { attack: 0, defense: 0, hp: 0, agility: 0 },
        unlockedSkins: ['skin_1_basic'],
        activeSkin: 'skin_1_basic',
        questEnergy: { current: 50, max: 50 },
        portal: { completed: [] },
        arena: { wins: 0, losses: 0, rank: 'Новичок' },
        raid: { raidsToday: 0, lastRaidDate: '' },
        tavern: { questsCompleted: 0, dailyQuestsDone: 0 },
        daily: { chapterCompleted: [] }
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
//  СКИНЫ И ИХ БОНУСЫ
// ============================================================

Sherwood.SKIN_BONUSES = {
    'skin_1_basic': { name: 'Охотник', bonus: 0, chapter: 1 },
    'skin_2': { name: 'Следопыт', bonus: 5, chapter: 2 },
    'skin_3': { name: 'Лесной страж', bonus: 10, chapter: 3 },
    'skin_4': { name: 'Болотный охотник', bonus: 15, chapter: 4 },
    'skin_5': { name: 'Пещерный воин', bonus: 20, chapter: 5 },
    'skin_6': { name: 'Рыцарь Шервуда', bonus: 30, chapter: 6 },
    'skin_7': { name: 'Теневой лучник', bonus: 40, chapter: 7 },
    'skin_8': { name: 'Изумрудный следопыт', bonus: 55, chapter: 8 },
    'skin_9': { name: 'Проклятый охотник', bonus: 70, chapter: 9 },
    'skin_10': { name: 'Владыка порталов', bonus: 90, chapter: 10 },
    'skin_11': { name: 'Страж бездны', bonus: 110, chapter: 11 },
    'skin_12': { name: 'Королевский егерь', bonus: 135, chapter: 12 },
    'skin_13': { name: 'Хранитель склепа', bonus: 160, chapter: 13 },
    'skin_14': { name: 'Отродье Шервуда', bonus: 190, chapter: 14 },
    'skin_15': { name: 'Вечный Хранитель', bonus: 225, chapter: 15 }
};

Sherwood.SKIN_CRAFT_COSTS = {
    'skin_2': { tablets: 5, silver: 5000, ingots: 10 },
    'skin_3': { tablets: 10, silver: 15000, ingots: 25 },
    'skin_4': { tablets: 20, silver: 30000, ingots: 50 },
    'skin_5': { tablets: 35, silver: 50000, ingots: 80 },
    'skin_6': { tablets: 50, silver: 75000, ingots: 120 },
    'skin_7': { tablets: 75, silver: 100000, ingots: 170 },
    'skin_8': { tablets: 110, silver: 150000, ingots: 230 },
    'skin_9': { tablets: 150, silver: 200000, ingots: 300 },
    'skin_10': { tablets: 200, silver: 275000, ingots: 400 },
    'skin_11': { tablets: 280, silver: 375000, ingots: 550 },
    'skin_12': { tablets: 380, silver: 500000, ingots: 750 },
    'skin_13': { tablets: 500, silver: 650000, ingots: 1000 },
    'skin_14': { tablets: 650, silver: 800000, ingots: 1300 },
    'skin_15': { tablets: 800, silver: 1000000, ingots: 1500 }
};

Sherwood.getSkinBonus = function(skinId) {
    var skin = this.SKIN_BONUSES[skinId];
    return skin ? skin.bonus : 0;
};

Sherwood.getActiveSkinBonus = function() {
    var p = this.getPlayer();
    if (!p) return 0;
    var skinId = p.activeSkin || 'skin_1_basic';
    return this.getSkinBonus(skinId);
};

Sherwood.canCraftSkin = function(skinId) {
    var p = this.getPlayer();
    if (!p) return { can: false, reason: 'Игрок не найден' };
    
    var skinData = this.SKIN_BONUSES[skinId];
    if (!skinData) return { can: false, reason: 'Скин не найден' };
    
    var progress = p.questProgress || { completed: [] };
    if (skinData.chapter > 1 && progress.completed.indexOf(skinData.chapter - 1) === -1) {
        return { can: false, reason: 'Нужно пройти главу ' + (skinData.chapter - 1) };
    }
    
    var cost = this.SKIN_CRAFT_COSTS[skinId];
    if (!cost) return { can: false, reason: 'Нет данных о стоимости' };
    
    var resources = p.resources || {};
    if ((resources.scrolls || 0) < cost.tablets) {
        return { can: false, reason: 'Нужно ' + cost.tablets + ' скрижалей (у вас ' + (resources.scrolls || 0) + ')' };
    }
    if ((resources.silver || 0) < cost.silver) {
        return { can: false, reason: 'Нужно ' + cost.silver + ' серебра' };
    }
    if ((resources.ingots || 0) < cost.ingots) {
        return { can: false, reason: 'Нужно ' + cost.ingots + ' слитков' };
    }
    
    if (p.unlockedSkins && p.unlockedSkins.indexOf(skinId) !== -1) {
        return { can: false, reason: 'Уже разблокирован' };
    }
    
    return { can: true };
};

Sherwood.craftSkin = function(skinId) {
    var check = this.canCraftSkin(skinId);
    if (!check.can) return check;
    
    var p = this.getPlayer();
    var cost = this.SKIN_CRAFT_COSTS[skinId];
    
    p.resources.scrolls -= cost.tablets;
    p.resources.silver -= cost.silver;
    p.resources.ingots -= cost.ingots;
    
    if (!p.unlockedSkins) p.unlockedSkins = [];
    p.unlockedSkins.push(skinId);
    
    if (p.unlockedSkins.length === 1) {
        p.activeSkin = skinId;
    }
    
    this._recalcStats();
    this.saveGame();
    this.dispatch({ type: 'SKIN_UNLOCKED', payload: { skinId: skinId } });
    
    return { success: true, skinId: skinId };
};

Sherwood.equipSkin = function(skinId) {
    var p = this.getPlayer();
    if (!p) return { success: false, reason: 'Игрок не найден' };
    if (!p.unlockedSkins || p.unlockedSkins.indexOf(skinId) === -1) {
        return { success: false, reason: 'Скин не разблокирован' };
    }
    p.activeSkin = skinId;
    this._recalcStats();
    this.saveGame();
    this.dispatch({ type: 'SKIN_EQUIPPED', payload: { skinId: skinId } });
    return { success: true, skinId: skinId };
};

// ============================================================
//  СКРИЖАЛИ
// ============================================================

Sherwood.SCROLL_PRICES = {
    'skin': 30,
    'ring': 30,
    'amulet': 30
};

Sherwood.SCROLL_SELL_PRICES = {
    'skin': 20,
    'ring': 20,
    'amulet': 20
};

Sherwood.buyScrolls = function(type, count) {
    if (!count || count <= 0) return { success: false, reason: 'Неверное количество' };
    var price = this.SCROLL_PRICES[type];
    if (!price) return { success: false, reason: 'Неизвестный тип скрижалей' };
    
    var p = this.getPlayer();
    if (!p) return { success: false, reason: 'Игрок не найден' };
    
    var totalCost = price * count;
    if ((p.resources.gold || 0) < totalCost) {
        return { success: false, reason: 'Нужно ' + totalCost + ' золота (у вас ' + (p.resources.gold || 0) + ')' };
    }
    
    p.resources.gold -= totalCost;
    var scrollType = type === 'skin' ? 'scrolls' : (type + '_scrolls');
    p.resources[scrollType] = (p.resources[scrollType] || 0) + count;
    
    this.saveGame();
    this.dispatch({ type: 'SCROLLS_BOUGHT', payload: { type: type, count: count, cost: totalCost } });
    
    return { success: true, type: type, count: count, cost: totalCost };
};

Sherwood.sellScrolls = function(type, count) {
    if (!count || count <= 0) return { success: false, reason: 'Неверное количество' };
    var price = this.SCROLL_SELL_PRICES[type];
    if (!price) return { success: false, reason: 'Неизвестный тип скрижалей' };
    
    var p = this.getPlayer();
    if (!p) return { success: false, reason: 'Игрок не найден' };
    
    var scrollType = type === 'skin' ? 'scrolls' : (type + '_scrolls');
    if ((p.resources[scrollType] || 0) < count) {
        return { success: false, reason: 'Недостаточно скрижалей' };
    }
    
    p.resources[scrollType] -= count;
    p.resources.gold = (p.resources.gold || 0) + price * count;
    
    this.saveGame();
    return { success: true, type: type, count: count, gold: price * count };
};

Sherwood.getScrollCount = function(type) {
    var p = this.getPlayer();
    if (!p) return 0;
    if (type === 'skin') return p.resources.scrolls || 0;
    return p.resources[type + '_scrolls'] || 0;
};

// ============================================================
//  КОНВЕРТАЦИЯ ВАЛЮТ
// ============================================================

Sherwood.convertGoldToSilver = function(amount) {
    if (!amount || amount <= 0) return { success: false, reason: 'Неверное количество' };
    var p = this.getPlayer();
    if (!p) return { success: false, reason: 'Игрок не найден' };
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
//  ПЕРЕСЧЁТ СТАТОВ
// ============================================================

Sherwood._recalcStats = function() {
    var p = this.getPlayer();
    if (!p) return;

    var ba = 0, bd = 0, bag = 0, bh = 0;

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

    var tl = p.trainingLevels || {};
    ba += (tl.attack || 0) * 2;
    bd += (tl.defense || 0) * 2;
    bag += (tl.agility || 0) * 1;
    bh += (tl.hp || 0) * 10;

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
    var baseAttack = Math.min(Math.floor(10 + (p.level - 1) * 2 + ba), MAX);
    var baseDefense = Math.min(Math.floor(5 + (p.level - 1) * 1 + bd), MAX);
    var baseAgility = Math.min(Math.floor(3 + (p.level - 1) * 0.5 + bag), MAX);
    var baseMaxHp = Math.min(Math.floor(100 + (p.level - 1) * 15 + bh), MAX);

    var skinBonus = this.getActiveSkinBonus();
    var skinMultiplier = 1 + skinBonus / 100;

    p.stats.attack = Math.min(Math.floor(baseAttack * skinMultiplier), MAX);
    p.stats.defense = Math.min(Math.floor(baseDefense * skinMultiplier), MAX);
    p.stats.agility = Math.min(Math.floor(baseAgility * skinMultiplier), MAX);
    p.stats.maxHp = Math.min(Math.floor(baseMaxHp * skinMultiplier), MAX);

    if (!p.stats.hp || p.stats.hp > p.stats.maxHp) {
        p.stats.hp = p.stats.maxHp;
    }

    this.saveGame();
};

// ============================================================
//  СУМКА
// ============================================================

Sherwood.Bag = {
    _inventory: [],
    _equipment: { head: null, torso: null, hands: null, legs: null, feet: null, weapon1: null, weapon2: null, belt: null, amulet: null, ring: null },
    _maxSlots: 10,
    _expansionLevel: 0,

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        this._inventory = player.inventory || [];
        this._equipment = player.equipment || this._equipment;
        this._expansionLevel = player.bagExpansion || 0;
        this._maxSlots = 10 + this._expansionLevel * 10;
        if (player.bagSize && player.bagSize > this._maxSlots) this._maxSlots = player.bagSize;
        if (!player.unlockedSkins || player.unlockedSkins.length === 0) {
            player.unlockedSkins = ['skin_1_basic'];
            player.activeSkin = 'skin_1_basic';
            Sherwood.saveGame();
        }
    },

    getItems: function() { return this._inventory; },
    getEquipment: function() { return this._equipment; },
    getMaxSlots: function() { return this._maxSlots; },
    getFreeSlots: function() { return this._maxSlots - this._inventory.length; },
    isFull: function() { return this._inventory.length >= this._maxSlots; },

    getExpansionInfo: function() {
        var costSkin = 1000 + this._expansionLevel * 500;
        var costSilver = 5000 + this._expansionLevel * 2500;
        return {
            current: this._maxSlots,
            level: this._expansionLevel,
            canExpand: this._maxSlots < 150,
            costSkin: costSkin,
            costSilver: costSilver,
            nextSlots: Math.min(this._maxSlots + 10, 150)
        };
    },

    expandBag: function() {
        var info = this.getExpansionInfo();
        if (!info.canExpand) return { success: false, reason: 'Максимум 150 слотов' };

        var skins = 0;
        for (var i = 0; i < this._inventory.length; i++) {
            var item = this._inventory[i];
            if (item.id && (item.id.indexOf('skin_') === 0 || item.id === 'skin_of_the_sherwood_creature')) {
                skins += item.quantity || 1;
            }
        }
        if (skins < info.costSkin) {
            return { success: false, reason: 'Нужно ' + info.costSkin + ' шкур (у вас ' + skins + ')' };
        }

        var player = Sherwood.getPlayer();
        if ((player.resources.silver || 0) < info.costSilver) {
            return { success: false, reason: 'Нужно ' + info.costSilver + ' серебра' };
        }

        player.resources.silver -= info.costSilver;

        var toRemove = info.costSkin;
        for (var i = this._inventory.length - 1; i >= 0 && toRemove > 0; i--) {
            var item = this._inventory[i];
            if (item.id && (item.id.indexOf('skin_') === 0 || item.id === 'skin_of_the_sherwood_creature')) {
                var qty = item.quantity || 1;
                if (qty <= toRemove) {
                    toRemove -= qty;
                    this._inventory.splice(i, 1);
                } else {
                    item.quantity -= toRemove;
                    toRemove = 0;
                }
            }
        }

        this._expansionLevel++;
        this._maxSlots = 10 + this._expansionLevel * 10;
        player.bagSize = this._maxSlots;
        player.bagExpansion = this._expansionLevel;

        this._save();
        Sherwood.saveGame();
        return { success: true, newSlots: this._maxSlots, level: this._expansionLevel };
    },

    addItem: function(item) {
        if (!item) return false;

        var maxStack = item.maxStack || 25;
        var quantity = item.quantity || 1;

        if (item.id) {
            for (var i = 0; i < this._inventory.length; i++) {
                var existing = this._inventory[i];
                if (existing.id === item.id && existing.grade === item.grade && (existing.quantity || 1) < maxStack) {
                    var space = maxStack - (existing.quantity || 1);
                    var add = Math.min(quantity, space);
                    existing.quantity = (existing.quantity || 1) + add;
                    quantity -= add;
                    if (quantity <= 0) {
                        this._save();
                        Sherwood.dispatch({ type: 'ITEM_ACQUIRED', payload: { item: item } });
                        return true;
                    }
                }
            }
        }

        while (quantity > 0) {
            if (this.isFull()) {
                Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: item } });
                return false;
            }
            var addQty = Math.min(quantity, maxStack);
            var newItem = Object.assign({}, item);
            newItem.quantity = addQty;
            newItem.maxStack = maxStack;
            this._inventory.push(newItem);
            quantity -= addQty;
        }

        this._save();
        Sherwood.dispatch({ type: 'ITEM_ACQUIRED', payload: { item: item } });
        return true;
    },

    removeItem: function(index, quantity) {
        if (typeof quantity === 'undefined') quantity = 1;
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item) return false;

        if (item.quantity && item.quantity > quantity) {
            item.quantity -= quantity;
            this._save();
            return true;
        }

        this._inventory.splice(index, 1);
        this._save();
        return true;
    },

    equipItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item || !item.part) return false;

        var part = item.part;
        var oldItem = this._equipment[part];

        if (part === 'ring' || part === 'amulet') {
            if (oldItem) {
                if (this.isFull()) {
                    Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: oldItem } });
                    return false;
                }
                this._inventory.push(oldItem);
            }
            this._equipment[part] = item;
            this._inventory.splice(index, 1);
            if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
            Sherwood.dispatch({ type: 'ITEM_EQUIPPED', payload: { part: part, item: item } });
            this._save();
            return true;
        }

        if (oldItem) {
            if (this.isFull()) {
                Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: oldItem } });
                return false;
            }
            this._inventory.push(oldItem);
        }

        this._equipment[part] = item;
        this._inventory.splice(index, 1);
        if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
        Sherwood.dispatch({ type: 'ITEM_EQUIPPED', payload: { part: part, item: item } });
        this._save();
        return true;
    },

    unequipItem: function(part) {
        if (!part || !this._equipment[part]) return false;
        var item = this._equipment[part];

        if (this.isFull()) {
            Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: item } });
            return false;
        }

        this._inventory.push(item);
        this._equipment[part] = null;
        if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
        this._save();
        return true;
    },

    discardItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;
        this._inventory.splice(index, 1);
        this._save();
        return true;
    },

    sellItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item) return false;

        var price = item.sellPrice || 5;
        var qty = item.quantity || 1;
        var totalPrice = price * qty;

        Sherwood.addResource('silver', totalPrice);
        this._inventory.splice(index, 1);
        this._save();
        return { success: true, price: totalPrice };
    },

    addLoot: function(loot) {
        if (!loot) return;
        if (loot.gold) Sherwood.addResource('gold', loot.gold);
        if (loot.silver) Sherwood.addResource('silver', loot.silver);
        if (loot.exp) Sherwood.addExp(loot.exp);
        if (loot.items && loot.items.length > 0) {
            for (var i = 0; i < loot.items.length; i++) {
                this.addItem(loot.items[i]);
            }
        }
        if (loot.skins) {
            for (var i = 0; i < loot.skins; i++) {
                this.addItem({
                    id: 'skin_of_the_sherwood_creature',
                    name: 'Кожа шервудской твари',
                    icon: 'assets/interface/skin_of_the_sherwood_creature.png',
                    grade: 'common',
                    type: 'resource',
                    quantity: 1,
                    maxStack: 25,
                    sellPrice: 5
                });
            }
        }
    },

    getSkinCount: function() {
        var count = 0;
        for (var i = 0; i < this._inventory.length; i++) {
            var item = this._inventory[i];
            if (item.id && (item.id.indexOf('skin_') === 0 || item.id === 'skin_of_the_sherwood_creature')) {
                count += item.quantity || 1;
            }
        }
        return count;
    },

    _save: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        player.inventory = this._inventory;
        player.equipment = this._equipment;
        player.bagSize = this._maxSlots;
        player.bagExpansion = this._expansionLevel;
        Sherwood.saveGame();
    }
};

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================

Sherwood.init = function() {
    this.getPlayer();
    this._recalcStats();

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

document.addEventListener('DOMContentLoaded', function() {
    if (typeof Sherwood !== 'undefined' && Sherwood.init) {
        Sherwood.init();
    }
});

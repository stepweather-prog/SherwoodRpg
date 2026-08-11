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
        stats: { attack: 50, defense: 50, hp: 200, maxHp: 200 },
        resources: { gold: 0, silver: 100, scrolls: 0, ingots: 0, wood: 0, feathers: 0, branches: 0, bones: 0 },
        inventory: [], equipment: {},
        dungeon: { tickets: 15, maxTickets: 15, autoTickets: 3 },
        bagSize: 10, bestiary: {},
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
        bagResources: null
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
};

Sherwood._createNewPlayer = function() {
    this._player = {
        name: 'Охотник',
        level: 1, exp: 0, expToLevel: 500,
        stats: { attack: 50, defense: 50, hp: 200, maxHp: 200 },
        resources: { gold: 0, silver: 100, scrolls: 0, ingots: 0, wood: 0, feathers: 0, branches: 0, bones: 0 },
        inventory: [], equipment: {},
        dungeon: { tickets: 15, maxTickets: 15, autoTickets: 3 },
        bagSize: 10, bestiary: {},
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
        bagResources: null
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
    
    // Золото и серебро дублируем в Bag._resources
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
        p.expToLevel = Math.min(Math.floor(p.expToLevel * 1.3), 999999);
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
    'skin1_02': { name: 'Стрелок из чащи', bonus: 5, chapter: 1 },
    'skin1_03': { name: 'Теневой налётчик', bonus: 10, chapter: 1 },
    'skin2_01': { name: 'Гвардеец-дезертир', bonus: 15, chapter: 2 },
    'skin2_02': { name: 'Вампир: Кровавый Лорд', bonus: 20, chapter: 2 },
    'skin2_03': { name: 'Браконьер-ветеран', bonus: 30, chapter: 2 },
    'bonus_skin_2': { name: 'Теневой лучник', bonus: 40, chapter: 2, bonus: true },
    'skin3_01': { name: 'Полуночный ассасин', bonus: 55, chapter: 3 },
    'skin3_02': { name: 'Наемник застав', bonus: 70, chapter: 3 },
    'skin3_03': { name: 'Мастер петли', bonus: 90, chapter: 3 },
    'skin4_01': { name: 'Отреченный рыцарь', bonus: 110, chapter: 4 },
    'skin4_02': { name: 'Железный бастион', bonus: 135, chapter: 4 },
    'skin4_03': { name: 'Паладин Шервуда', bonus: 160, chapter: 4 },
    'bonus_skin_4': { name: 'Отродье Шервуда', bonus: 190, chapter: 4, bonus: true },
    'skin5_01': { name: 'Ловчий-каратель', bonus: 225, chapter: 5 },
    'skin5_02': { name: 'Егерь престола', bonus: 240, chapter: 5 },
    'skin5_03': { name: 'Партизан-снайпер', bonus: 260, chapter: 5 },
    'skin6_01': { name: 'Гробовщик', bonus: 280, chapter: 6 },
    'skin6_02': { name: 'Судья виселицы', bonus: 300, chapter: 6 },
    'skin6_03': { name: 'Вестник смерти', bonus: 320, chapter: 6 },
    'bonus_skin_6': { name: 'Призрачный лучник', bonus: 350, chapter: 6, bonus: true },
    'skin7_01': { name: 'Штурмовой латник', bonus: 370, chapter: 7 },
    'skin7_02': { name: 'Осадный арбалетчик', bonus: 390, chapter: 7 },
    'skin7_03': { name: 'Разрушитель стен', bonus: 410, chapter: 7 },
    'skin8_01': { name: 'Костяной жнец', bonus: 430, chapter: 8 },
    'skin8_02': { name: 'Собиратель трофеев', bonus: 450, chapter: 8 },
    'skin8_03': { name: 'Мститель Кромки', bonus: 470, chapter: 8 },
    'bonus_skin_8': { name: 'Король Шервуда', bonus: 500, chapter: 8, bonus: true },
    'skin9_01': { name: 'Черный инквизитор', bonus: 520, chapter: 9 },
    'skin9_02': { name: 'Каратель грешников', bonus: 540, chapter: 9 },
    'skin9_03': { name: 'Магистр ордена', bonus: 560, chapter: 9 },
    'skin10_01': { name: 'Маг-лучник астрала', bonus: 580, chapter: 10 },
    'skin10_02': { name: 'Вестник Бездны', bonus: 600, chapter: 10 },
    'skin10_03': { name: 'Изумрудный стражник', bonus: 620, chapter: 10 },
    'bonus_skin_10': { name: 'Владыка бездны', bonus: 650, chapter: 10, bonus: true },
    'skin11_01': { name: 'Рогатый демон чащи', bonus: 670, chapter: 11 },
    'skin11_02': { name: 'Шаман крови', bonus: 690, chapter: 11 },
    'skin11_03': { name: 'Воплощение Древнего Бога', bonus: 710, chapter: 11 },
    'skin12_01': { name: 'Убийца драконов', bonus: 730, chapter: 12 },
    'skin12_02': { name: 'Рыцарь проклятого золота', bonus: 750, chapter: 12 },
    'skin12_03': { name: 'Хранитель склепа', bonus: 770, chapter: 12 },
    'bonus_skin_12': { name: 'Король демонов', bonus: 800, chapter: 12, bonus: true },
    'skin13_01': { name: 'Призрак савана', bonus: 820, chapter: 13 },
    'skin13_02': { name: 'Эфирный скиталец', bonus: 840, chapter: 13 },
    'skin13_03': { name: 'Кошмар Шервуда', bonus: 860, chapter: 13 },
    'skin14_01': { name: 'Токсичный призрак', bonus: 880, chapter: 14 },
    'skin14_02': { name: 'Грозовой снайпер', bonus: 900, chapter: 14 },
    'skin14_03': { name: 'Ведьмин огонь', bonus: 920, chapter: 14 },
    'bonus_skin_14': { name: 'Властелин всего', bonus: 950, chapter: 14, bonus: true },
    'skin15_01': { name: 'Владыка Хаоса', bonus: 970, chapter: 15 },
    'skin15_02': { name: 'Император Бездны', bonus: 990, chapter: 15 },
    'skin15_03': { name: 'Повелитель пустоты', bonus: 1010, chapter: 15 },
    'skin16_01': { name: 'Первородная Тьма', bonus: 1030, chapter: 16 },
    'skin16_02': { name: 'Пожиратель Королевств', bonus: 1050, chapter: 16 },
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
    ba += (tl.attack || 0) * 2;
    bd += (tl.defense || 0) * 2;
    bh += (tl.hp || 0) * 10;

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

    var MAX = 30000;
    var baseAttack = Math.min(Math.floor(50 + (p.level - 1) * 5 + ba), MAX);
    var baseDefense = Math.min(Math.floor(50 + (p.level - 1) * 5 + bd), MAX);
    var baseMaxHp = Math.min(Math.floor(200 + (p.level - 1) * 5 + bh), MAX);

    p.stats.attack = Math.min(Math.floor(baseAttack * totalMultiplier), MAX);
    p.stats.defense = Math.min(Math.floor(baseDefense * totalMultiplier), MAX);
    p.stats.maxHp = Math.min(Math.floor(baseMaxHp * totalMultiplier), MAX);

    if (!p.stats.hp || p.stats.hp > p.stats.maxHp) p.stats.hp = p.stats.maxHp;
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
    
    _resources: {
        gold: 0,
        silver: 0,
        skins: 0,
        entranceTickets: 0,
        autoFightTickets: 0,
        amuletTablets: 0,
        ringTablets: 0,
        skinTablets: 0,
        portalToken1: 0,
        portalToken2: 0,
        portalToken3: 0
    },

    _resourceIds: {
        'skin_of_the_sherwood_creature': 'skins',
        'entrance_ticket': 'entranceTickets',
        'dungeon_ticket': 'entranceTickets',
        'autofight_ticket': 'autoFightTickets',
        'auto_ticket': 'autoFightTickets',
        'amulet_tablet': 'amuletTablets',
        'amulet_scroll': 'amuletTablets',
        'ring_tablet': 'ringTablets',
        'ring_scroll': 'ringTablets',
        'skin_tablet': 'skinTablets',
        'appearance_tablet': 'skinTablets',
        'portal_token_1': 'portalToken1',
        'portal_token_2': 'portalToken2',
        'portal_token_3': 'portalToken3'
    },

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        this._inventory = player.inventory || [];
        this._equipment = player.equipment || this._equipment;
        this._expansionLevel = player.bagExpansion || 0;
        this._maxSlots = 10 + this._expansionLevel * 10;
        if (player.bagSize && player.bagSize > this._maxSlots) this._maxSlots = player.bagSize;
        if (!player.unlockedSkins || player.unlockedSkins.length === 0) {
            player.unlockedSkins = ['skin1_01']; player.activeSkin = 'skin1_01'; Sherwood.saveGame();
        }
        
        if (player.bagResources) {
            this._resources = player.bagResources;
            if (this._resources.gold === undefined) this._resources.gold = player.resources ? (player.resources.gold || 0) : 0;
            if (this._resources.silver === undefined) this._resources.silver = player.resources ? (player.resources.silver || 0) : 0;
            if (this._resources.portalToken1 === undefined) this._resources.portalToken1 = 0;
            if (this._resources.portalToken2 === undefined) this._resources.portalToken2 = 0;
            if (this._resources.portalToken3 === undefined) this._resources.portalToken3 = 0;
        } else {
            this._resources.gold = player.resources ? (player.resources.gold || 0) : 0;
            this._resources.silver = player.resources ? (player.resources.silver || 0) : 0;
        }
        
        for (var i = this._inventory.length - 1; i >= 0; i--) {
            var item = this._inventory[i];
            var resKey = this._resourceIds[item.id];
            if (resKey) {
                this._resources[resKey] += item.quantity || 1;
                this._inventory.splice(i, 1);
            }
        }
        
        for (var i = 0; i < this._inventory.length; i++) {
            if (!this._inventory[i].maxStack || this._inventory[i].maxStack < 100) {
                this._inventory[i].maxStack = 100;
            }
        }
        
        this._save();
    },

    getItems: function() { return this._inventory; },
    getEquipment: function() { return this._equipment; },
    getMaxSlots: function() { return this._maxSlots; },
    getFreeSlots: function() { return this._maxSlots - this._inventory.length; },
    isFull: function() { return this._inventory.length >= this._maxSlots; },
    
    getResources: function() { return this._resources; },
    
    getResource: function(type) { return this._resources[type] || 0; },
    
    addResource: function(type, amount) {
        if (!amount || amount <= 0) return;
        if (this._resources[type] === undefined) this._resources[type] = 0;
        this._resources[type] += amount;
        this._save();
    },
    
    spendResource: function(type, amount) {
        if ((this._resources[type] || 0) < amount) return false;
        this._resources[type] -= amount;
        this._save();
        return true;
    },

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

        if (this._resources.skins < info.costSkin) {
            return { success: false, reason: 'Нужно ' + info.costSkin + ' шкур (у вас ' + this._resources.skins + ')' };
        }

        if (this._resources.silver < info.costSilver) {
            return { success: false, reason: 'Нужно ' + info.costSilver + ' серебра' };
        }

        this._resources.silver -= info.costSilver;
        this._resources.skins -= info.costSkin;

        this._expansionLevel++;
        this._maxSlots = 10 + this._expansionLevel * 10;
        var player = Sherwood.getPlayer();
        player.bagSize = this._maxSlots;
        player.bagExpansion = this._expansionLevel;

        this._save();
        Sherwood.saveGame();
        return { success: true, newSlots: this._maxSlots, level: this._expansionLevel };
    },

    addItem: function(item) {
        if (!item) return false;
        
        var resKey = this._resourceIds[item.id];
        if (resKey) {
            this._resources[resKey] += item.quantity || 1;
            this._save();
            Sherwood.dispatch({ type: 'ITEM_ACQUIRED', payload: { item: item } });
            return true;
        }

        var maxStack = item.maxStack || 150;
        var quantity = item.quantity || 1;

        if (item.id) {
            for (var i = 0; i < this._inventory.length; i++) {
                var existing = this._inventory[i];
                if (existing.id === item.id && existing.name === item.name && (existing.quantity || 1) < maxStack) {
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

        this._resources.silver += totalPrice;
        this._inventory.splice(index, 1);
        this._save();
        return { success: true, price: totalPrice };
    },

    addLoot: function(loot) {
        if (!loot) return;
        if (loot.gold) this._resources.gold += loot.gold;
        if (loot.silver) this._resources.silver += loot.silver;
        if (loot.exp) Sherwood.addExp(loot.exp);
        if (loot.items && loot.items.length > 0) {
            for (var i = 0; i < loot.items.length; i++) {
                this.addItem(loot.items[i]);
            }
        }
        if (loot.skins) this._resources.skins += loot.skins;
        if (loot.entranceTickets) this._resources.entranceTickets += loot.entranceTickets;
        if (loot.autoFightTickets) this._resources.autoFightTickets += loot.autoFightTickets;
        if (loot.amuletTablets) this._resources.amuletTablets += loot.amuletTablets;
        if (loot.ringTablets) this._resources.ringTablets += loot.ringTablets;
        if (loot.skinTablets) this._resources.skinTablets += loot.skinTablets;
        if (loot.portalToken1) this._resources.portalToken1 += loot.portalToken1;
        if (loot.portalToken2) this._resources.portalToken2 += loot.portalToken2;
        if (loot.portalToken3) this._resources.portalToken3 += loot.portalToken3;
        this._save();
    },

    getSkinCount: function() {
        return this._resources.skins;
    },

    _save: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        player.inventory = this._inventory;
        player.equipment = this._equipment;
        player.bagSize = this._maxSlots;
        player.bagExpansion = this._expansionLevel;
        player.bagResources = this._resources;
        if (player.resources) {
            player.resources.gold = this._resources.gold;
            player.resources.silver = this._resources.silver;
        }
        Sherwood.saveGame();
    }
};

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================

Sherwood.init = function() {
    this.getPlayer(); this._recalcStats();
    var subsystems = ['Dungeon', 'Bag', 'Quests', 'Tavern', 'Daily', 'Portal', 'Forge', 'Raid', 'Arena', 'BlackMarket', 'Chat', 'Bestiary', 'Combat'];
    for (var i = 0; i < subsystems.length; i++) {
        var name = subsystems[i];
        if (typeof Sherwood[name] !== 'undefined' && Sherwood[name].init) {
            try { Sherwood[name].init(); } catch(e) { console.warn('Ошибка ' + name + ':', e); }
        }
    }
    this.dispatch({ type: 'GAME_INITIALIZED' });
    console.log('🏹 Sherwood RPG готов!');
};

document.addEventListener('DOMContentLoaded', function() { if (typeof Sherwood !== 'undefined' && Sherwood.init) Sherwood.init(); });

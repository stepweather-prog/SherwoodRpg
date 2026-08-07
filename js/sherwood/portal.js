/**
 * Sherwood Portal — Порталы (7 уровней)
 */

Sherwood.Portal = {
    _currentPortal: null,
    _currentLevel: 0,
    _inPortal: false,
    _deathCount: 0,
    _timerInterval: null,
    _timeRemaining: 0,

    PORTALS: [
        {
            id: 1, name: 'Портал Нашествия', icon: '🌀', bg: 'assets/backgrounds/portal_1.jpeg',
            enemies: [
                { name: 'Костяной стрелок', image: 'image (7).png', hp: 800, attack: 60, defense: 30, exp: 150, gold: 100 },
                { name: 'Забытый гвардеец', image: 'image (6).png', hp: 1200, attack: 75, defense: 40, exp: 250, gold: 180, isBoss: true }
            ],
            rewards: { gold: 300, exp: 500, silver: 800 }
        },
        {
            id: 2, name: 'Портал Черепных Пауков', icon: '🕷️', bg: 'assets/backgrounds/portal_2.png',
            enemies: [
                { name: 'Черепной паук', image: 'image (19).png', hp: 1100, attack: 70, defense: 35, exp: 180, gold: 130 },
                { name: 'Хранитель Врат', image: 'image (11).png', hp: 1600, attack: 90, defense: 50, exp: 300, gold: 220, isBoss: true }
            ],
            rewards: { gold: 400, exp: 650, silver: 1000 }
        },
        {
            id: 3, name: 'Портал Увядания', icon: '🥀', bg: 'assets/backgrounds/portal_3.png',
            enemies: [
                { name: 'Проклятая нимфа', image: 'image (25).png', hp: 1500, attack: 85, defense: 40, exp: 220, gold: 160 },
                { name: 'Рогатый дух увядания', image: 'image (10).png', hp: 2100, attack: 105, defense: 60, exp: 380, gold: 280, isBoss: true }
            ],
            rewards: { gold: 550, exp: 850, silver: 1300 },
            trophy: { id: 'portal_3', name: 'Окровавленный Клык Волка', bonus: { attack: 15, defense: 15, hp: 15 }, icon: 'assets/all_trophies/portal_trophies/1_wolf_fang.png' }
        },
        {
            id: 4, name: 'Портал Цепей', icon: '⛓️', bg: 'assets/backgrounds/portal_1.jpeg',
            enemies: [
                { name: 'Повелитель цепей', image: 'image (8).png', hp: 2000, attack: 100, defense: 50, exp: 280, gold: 200 },
                { name: 'Тюремщик Разлома', image: 'image (23).png', hp: 2400, attack: 115, defense: 65, exp: 350, gold: 260 },
                { name: 'Кислотный голем', image: 'image (9).png', hp: 3200, attack: 135, defense: 80, exp: 500, gold: 380, isBoss: true }
            ],
            rewards: { gold: 700, exp: 1100, silver: 1700 },
            trophy: { id: 'portal_4', name: 'Сердце Ненасытного Тритона', bonus: { attack: 30, defense: 30, hp: 30 }, icon: 'assets/all_trophies/portal_trophies/2_heart_of_the_Insatiable_triton.png' }
        },
        {
            id: 5, name: 'Портал Ликантропов', icon: '🐺', bg: 'assets/backgrounds/portal_2.png',
            enemies: [
                { name: 'Кровавый упырь', image: 'image (18).png', hp: 2700, attack: 120, defense: 60, exp: 350, gold: 250 },
                { name: 'Изумрудный ликантроп', image: 'image (24).png', hp: 3200, attack: 140, defense: 75, exp: 450, gold: 320 },
                { name: 'Двойной ликантроп', image: 'image (29).png', hp: 4000, attack: 160, defense: 90, exp: 600, gold: 450, isBoss: true }
            ],
            rewards: { gold: 900, exp: 1400, silver: 2200 },
            trophy: { id: 'portal_5', name: 'Изумрудный Осколок Исполина', bonus: { attack: 50, defense: 50, hp: 50 }, icon: 'assets/all_trophies/portal_trophies/3_emerald_shard_of_the_giant.png' }
        },
        {
            id: 6, name: 'Портал Скорпиона', icon: '🦂', bg: 'assets/backgrounds/portal_3.png',
            enemies: [
                { name: 'Страж портала', image: 'image (14).png', hp: 3500, attack: 140, defense: 70, exp: 420, gold: 300 },
                { name: 'Элитный страж', image: 'image (17).png', hp: 4000, attack: 155, defense: 80, exp: 500, gold: 360 },
                { name: 'Механический скорпион', image: 'image (15).png', hp: 5000, attack: 185, defense: 100, exp: 750, gold: 550, isBoss: true }
            ],
            rewards: { gold: 1150, exp: 1800, silver: 2800 },
            trophy: { id: 'portal_6', name: 'Проклятая Эмблема Склепа', bonus: { attack: 80, defense: 80, hp: 80 }, icon: 'assets/all_trophies/portal_trophies/4_cursed_emblem_of_the_crypt.png' }
        },
        {
            id: 7, name: 'Портал Искажения', icon: '👁️', bg: 'assets/backgrounds/portal_1.jpeg',
            enemies: [
                { name: 'Страж искажения', image: 'image (16).png', hp: 4500, attack: 170, defense: 85, exp: 550, gold: 400 },
                { name: 'Элита портала', image: 'image (21).png', hp: 5200, attack: 190, defense: 95, exp: 650, gold: 480 },
                { name: 'Владыка Искажения', image: 'image (12).png', hp: 6000, attack: 210, defense: 110, exp: 850, gold: 650 },
                { name: 'Кристаллический змей', image: 'image (20).png', hp: 7500, attack: 240, defense: 130, exp: 1100, gold: 850, isBoss: true }
            ],
            rewards: { gold: 1500, exp: 2500, silver: 4000 },
            trophy: { id: 'portal_7', name: 'Корона Лесного Владыки', bonus: { attack: 150, defense: 150, hp: 150 }, icon: 'assets/all_trophies/portal_trophies/5_crown_of_the_forest_lord.png' }
        }
    ],

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.portal) player.portal = { completed: [], difficulty: {} };
    },

    getPortal: function(portalId) {
        for (var i = 0; i < this.PORTALS.length; i++) {
            if (this.PORTALS[i].id === portalId) return this.PORTALS[i];
        }
        return null;
    },

    getAllPortals: function() { return this.PORTALS; },

    isPortalUnlocked: function() { return true; },

    canEnter: function() { return { can: true }; },

    enterPortal: function(portalId) {
        var portal = this.getPortal(portalId);
        if (!portal) return { success: false, reason: 'Портал не найден' };
        
        var requiredArrows = portalId * 150;
        if (typeof Sherwood.Forge !== 'undefined') {
            var arrowCount = Sherwood.Forge.getArrowCount ? Sherwood.Forge.getArrowCount() : 0;
            if (arrowCount < requiredArrows) {
                return { success: false, reason: 'Нужно ' + requiredArrows + ' стрел (у вас ' + arrowCount + ')' };
            }
            var bag = Sherwood.Bag;
            var items = bag.getItems();
            var toRemove = requiredArrows;
            for (var i = items.length - 1; i >= 0 && toRemove > 0; i--) {
                if (items[i].id && items[i].id.indexOf('arrow_') === 0) {
                    var qty = items[i].quantity || 1;
                    if (qty <= toRemove) { toRemove -= qty; bag.removeItem(i); }
                    else { items[i].quantity -= toRemove; toRemove = 0; }
                }
            }
            bag._save();
        }
        
        var player = Sherwood.getPlayer();
        var difficulty = player.portal.difficulty ? (player.portal.difficulty[portalId] || 0) : 0;
        var isHardMode = difficulty > 0 && difficulty % 2 === 0;
        var enemyMult = isHardMode ? 1.5 : 1;
        
        this._currentPortal = JSON.parse(JSON.stringify(portal));
        for (var i = 0; i < this._currentPortal.enemies.length; i++) {
            this._currentPortal.enemies[i].hp = Math.floor(this._currentPortal.enemies[i].hp * enemyMult);
            this._currentPortal.enemies[i].attack = Math.floor(this._currentPortal.enemies[i].attack * enemyMult);
            this._currentPortal.enemies[i].defense = Math.floor(this._currentPortal.enemies[i].defense * enemyMult);
            this._currentPortal.enemies[i].maxHp = this._currentPortal.enemies[i].hp;
        }
        
        this._currentLevel = 0;
        this._inPortal = true;
        this._deathCount = 0;
        this._timeRemaining = 10800;
        this._startTimer();
        return { success: true, portal: this._currentPortal, enemies: this._currentPortal.enemies, timeLimit: this._timeRemaining };
    },

    _startTimer: function() {
        if (this._timerInterval) clearInterval(this._timerInterval);
        var self = this;
        this._timerInterval = setInterval(function() {
            self._timeRemaining--;
            if (self._timeRemaining <= 0) self._exitPortal(false);
        }, 1000);
    },

    getCurrentBattle: function() {
        if (!this._inPortal || !this._currentPortal) return null;
        var enemy = this._currentPortal.enemies[this._currentLevel];
        if (!enemy) return null;
        return { portal: this._currentPortal, level: this._currentLevel + 1, totalLevels: this._currentPortal.enemies.length, enemy: enemy, timeRemaining: this._timeRemaining, deathCount: this._deathCount, isBoss: enemy.isBoss || false };
    },

    portalAttack: function() {
        if (!this._inPortal) return null;
        var battle = this.getCurrentBattle(); if (!battle) return null;
        var player = Sherwood.getPlayer(), enemy = battle.enemy;
        var damage = Math.max(1, player.stats.attack - enemy.defense + Math.floor(Math.random() * 20));
        enemy.hp -= damage;
        var result = { damage: damage, enemyName: enemy.name, enemyHp: Math.max(0, enemy.hp), enemyMaxHp: enemy.maxHp || (enemy.hp + damage), enemyDead: enemy.hp <= 0, isBoss: enemy.isBoss || false };
        if (!enemy.maxHp) enemy.maxHp = enemy.hp + damage;
        if (enemy.hp <= 0) {
            if (Sherwood.Bestiary && enemy.image) Sherwood.Bestiary.registerKill(enemy.image);
            result.exp = enemy.exp; result.gold = enemy.gold;
            Sherwood.addExp(enemy.exp); Sherwood.addResource('gold', enemy.gold); Sherwood.addResource('silver', Math.floor(enemy.gold * 1.5));
            this._currentLevel++;
            if (this._currentLevel >= this._currentPortal.enemies.length) return this._completePortal();
            result.nextEnemy = this._currentPortal.enemies[this._currentLevel];
            return result;
        }
        var enemyDamage = Math.max(1, enemy.attack - player.stats.defense + Math.floor(Math.random() * 15));
        player.stats.hp = Math.max(0, player.stats.hp - enemyDamage);
        result.enemyDamage = enemyDamage; result.playerHp = player.stats.hp;
        if (player.stats.hp <= 0) return this._handleDeath();
        return result;
    },

    _handleDeath: function() {
        this._deathCount++;
        var player = Sherwood.getPlayer();
        if (this._deathCount > 5) { this._exitPortal(false); return { dead: true, portalFailed: true }; }
        var cost = this._deathCount <= 2 ? { cost: this._deathCount * 2500, currency: 'silver' } : { cost: 50 + (this._deathCount - 2) * 50, currency: 'gold' };
        if (cost.cost > 0 && (player.resources[cost.currency] || 0) < cost.cost) { this._exitPortal(false); return { dead: true, portalFailed: true }; }
        if (cost.cost > 0) player.resources[cost.currency] -= cost.cost;
        player.stats.hp = player.stats.maxHp; Sherwood.saveGame();
        return { dead: true, deathCount: this._deathCount, cost: cost, resurrected: true, playerHp: player.stats.hp };
    },

    _completePortal: function() {
        var portal = this._currentPortal, player = Sherwood.getPlayer();
        var timesCompleted = player.portal.completed ? player.portal.completed.filter(function(id) { return id === portal.id; }).length : 0;
        var firstTime = timesCompleted === 0;
        var isHardMode = timesCompleted > 0 && timesCompleted % 2 === 0;
        
        var mult = firstTime ? 1 : (isHardMode ? 0.5 : 0.3);
        var difficultyMult = isHardMode ? 1.5 : 1;
        
        Sherwood.addExp(Math.floor(portal.rewards.exp * mult * difficultyMult));
        Sherwood.addResource('gold', Math.floor(portal.rewards.gold * mult * difficultyMult));
        Sherwood.addResource('silver', Math.floor(portal.rewards.silver * mult * difficultyMult));
        
        if (firstTime) {
            if (!player.portal.completed) player.portal.completed = [];
            player.portal.completed.push(portal.id);
            
            if (portal.trophy && typeof Sherwood.addTrophy === 'function') {
                Sherwood.addTrophy(portal.trophy.id, portal.trophy.name, portal.trophy.bonus, portal.trophy.icon, 'portal');
            }
        }
        
        if (!player.portal.difficulty) player.portal.difficulty = {};
        player.portal.difficulty[portal.id] = (player.portal.difficulty[portal.id] || 0) + 1;
        
        if (this._timerInterval) clearInterval(this._timerInterval);
        this._inPortal = false;
        var cp = this._currentPortal;
        this._currentPortal = null;
        return { portalComplete: true, portal: cp, rewards: { gold: Math.floor(portal.rewards.gold * mult * difficultyMult), exp: Math.floor(portal.rewards.exp * mult * difficultyMult), silver: Math.floor(portal.rewards.silver * mult * difficultyMult) }, firstTime: firstTime, hardMode: isHardMode };
    },

    _exitPortal: function(success) {
        if (this._timerInterval) clearInterval(this._timerInterval);
        this._inPortal = false;
        this._currentPortal = null;
        if (!success) { var player = Sherwood.getPlayer(); player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.1)); Sherwood.saveGame(); }
    },

    fleePortal: function() { this._exitPortal(false); return { success: true }; },
    getTimeRemaining: function() { return this._timeRemaining; },
    isInPortal: function() { return this._inPortal; }
};

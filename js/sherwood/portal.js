/**
 * Sherwood Portal — Порталы (7 уровней)
 * Обновлено: новые боссы, элитная охрана, иконки
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
            id: 1, name: 'Портал Нашествия', icon: 'assets/portal_beasts/visual_portals/invasion_portal.png', bg: 'assets/backgrounds/portal_1.jpeg',
            enemies: [
                { name: 'Костяной стрелок', image: 'assets/all_beasts/armored_beetle.png', hp: 800, attack: 60, defense: 30, exp: 150, gold: 100 },
                { name: 'Кислотный Короед-Пожиратель', image: 'assets/all_beasts/acid_devourer.png', hp: 1000, attack: 70, defense: 35, exp: 200, gold: 140 },
                { name: 'Повелитель Гнили', image: 'assets/all_beasts/blight_lord_beetle.png', hp: 1200, attack: 75, defense: 40, exp: 250, gold: 180 },
                { name: 'Жнец-Полководец', image: 'assets/portal_beasts/the_reaper_commander.png', hp: 2500, attack: 120, defense: 60, exp: 500, gold: 400, isBoss: true }
            ],
            rewards: { gold: 300, exp: 500, silver: 800 }
        },
        {
            id: 2, name: 'Портал Черных Пауков', icon: 'assets/portal_beasts/visual_portals/skull_spider_portal.png', bg: 'assets/backgrounds/portal_2.png',
            enemies: [
                { name: 'Окулярный Арахнид', image: 'assets/all_beasts/ocular_arachnid.png', hp: 1100, attack: 70, defense: 35, exp: 180, gold: 130 },
                { name: 'Выжигающий Арахнид', image: 'assets/all_beasts/searing_arachnid.png', hp: 1400, attack: 85, defense: 45, exp: 280, gold: 200 },
                { name: 'Арахнид-Некромант', image: 'assets/all_beasts/necromantic_arachnid.png', hp: 1600, attack: 90, defense: 50, exp: 300, gold: 220 },
                { name: 'Ткачиха Мрака', image: 'assets/portal_beasts/the_dark_weaver.png', hp: 3000, attack: 140, defense: 70, exp: 600, gold: 450, isBoss: true }
            ],
            rewards: { gold: 400, exp: 650, silver: 1000 }
        },
        {
            id: 3, name: 'Портал Увядания', icon: 'assets/portal_beasts/visual_portals/portal_of_withering.png', bg: 'assets/backgrounds/portal_3.png',
            enemies: [
                { name: 'Оживший Тис', image: 'assets/all_beasts/animated_yew.png', hp: 1500, attack: 85, defense: 40, exp: 220, gold: 160 },
                { name: 'Дочь Корней', image: 'assets/all_beasts/root_daughter.png', hp: 1800, attack: 95, defense: 50, exp: 300, gold: 220 },
                { name: 'Повелительница корней', image: 'assets/all_beasts/mistress_of_the_roots.png', hp: 2100, attack: 105, defense: 60, exp: 380, gold: 280 },
                { name: 'Истлевший Титан', image: 'assets/portal_beasts/the_decayed_titan.png', hp: 4000, attack: 170, defense: 90, exp: 800, gold: 600, isBoss: true }
            ],
            rewards: { gold: 550, exp: 850, silver: 1300 },
            trophy: { id: 'portal_3', name: 'Окровавленный Клык Волка', bonus: { attack: 15, defense: 15, hp: 15 }, icon: 'assets/all_trophies/portal_trophies/1_wolf_fang.png' }
        },
        {
            id: 4, name: 'Портал Цепей', icon: 'assets/portal_beasts/visual_portals/portal_of_chains.png', bg: 'assets/backgrounds/portal_1.jpeg',
            enemies: [
                { name: 'Ржавый Слуга', image: 'assets/all_beasts/rusty_servant.png', hp: 2000, attack: 100, defense: 50, exp: 280, gold: 200 },
                { name: 'Ржавый Страх', image: 'assets/all_beasts/rusty_dread.png', hp: 2400, attack: 115, defense: 65, exp: 350, gold: 260 },
                { name: 'Истязатель', image: 'assets/all_beasts/tormentor.png', hp: 2800, attack: 125, defense: 70, exp: 420, gold: 300 },
                { name: 'Вечный Узник', image: 'assets/portal_beasts/the_eternal_prisoner.png', hp: 4500, attack: 190, defense: 100, exp: 900, gold: 700, isBoss: true }
            ],
            rewards: { gold: 700, exp: 1100, silver: 1700 },
            trophy: { id: 'portal_4', name: 'Сердце Ненасытного Тритона', bonus: { attack: 30, defense: 30, hp: 30 }, icon: 'assets/all_trophies/portal_trophies/2_heart_of_the_Insatiable_triton.png' }
        },
        {
            id: 5, name: 'Портал Ликантропов', icon: 'assets/portal_beasts/visual_portals/lycanthrope_portal.png', bg: 'assets/backgrounds/portal_2.png',
            enemies: [
                { name: 'Гниющий Волк', image: 'assets/all_beasts/putrid_wolf.png', hp: 2700, attack: 120, defense: 60, exp: 350, gold: 250 },
                { name: 'Волк-Потрошитель', image: 'assets/all_beasts/ripper_wolf.png', hp: 3200, attack: 140, defense: 75, exp: 450, gold: 320 },
                { name: 'Повелитель Стаи', image: 'assets/all_beasts/fox_pack_lord.png', hp: 3600, attack: 150, defense: 80, exp: 550, gold: 400 },
                { name: 'Кровавый Вожак', image: 'assets/portal_beasts/the_blood_alpha.png', hp: 5000, attack: 210, defense: 110, exp: 1000, gold: 800, isBoss: true }
            ],
            rewards: { gold: 900, exp: 1400, silver: 2200 },
            trophy: { id: 'portal_5', name: 'Изумрудный Осколок Исполина', bonus: { attack: 50, defense: 50, hp: 50 }, icon: 'assets/all_trophies/portal_trophies/3_emerald_shard_of_the_giant.png' }
        },
        {
            id: 6, name: 'Портал Скорпиона', icon: 'assets/portal_beasts/visual_portals/scorpio_portal.png', bg: 'assets/backgrounds/portal_3.png',
            enemies: [
                { name: 'Базальтовый Пожиратель', image: 'assets/all_beasts/basalt_devourer.png', hp: 3500, attack: 140, defense: 70, exp: 420, gold: 300 },
                { name: 'Громила Грота', image: 'assets/all_beasts/grotto_brute.png', hp: 4000, attack: 155, defense: 80, exp: 500, gold: 360 },
                { name: 'Пещерный Наблюдатель', image: 'assets/all_beasts/cave_watcher.png', hp: 4300, attack: 165, defense: 85, exp: 550, gold: 400 },
                { name: 'Базальтовый Жнец', image: 'assets/portal_beasts/the_basalt_reaper.png', hp: 6000, attack: 240, defense: 130, exp: 1200, gold: 900, isBoss: true }
            ],
            rewards: { gold: 1150, exp: 1800, silver: 2800 },
            trophy: { id: 'portal_6', name: 'Проклятая Эмблема Склепа', bonus: { attack: 80, defense: 80, hp: 80 }, icon: 'assets/all_trophies/portal_trophies/4_cursed_emblem_of_the_crypt.png' }
        },
        {
            id: 7, name: 'Портал Искажения', icon: 'assets/portal_beasts/visual_portals/portal_of_distortion.png', bg: 'assets/backgrounds/portal_1.jpeg',
            enemies: [
                { name: 'Енот Порчи', image: 'assets/all_beasts/corruption_raccoon.png', hp: 4500, attack: 170, defense: 85, exp: 550, gold: 400 },
                { name: 'Слепой Терзатель', image: 'assets/all_beasts/blind_render.png', hp: 5200, attack: 190, defense: 95, exp: 650, gold: 480 },
                { name: 'Страж Преисподней', image: 'assets/all_beasts/underworld_guardian.png', hp: 6000, attack: 210, defense: 110, exp: 850, gold: 650 },
                { name: 'Воплощение Искажения', image: 'assets/portal_beasts/embodiment_of_distortion.png', hp: 7500, attack: 260, defense: 140, exp: 1500, gold: 1100, isBoss: true }
            ],
            rewards: { gold: 1500, exp: 2500, silver: 4000 },
            trophy: { id: 'portal_7', name: 'Корона Лесного Владыки', bonus: { attack: 150, defense: 150, hp: 150 }, icon: 'assets/all_trophies/portal_trophies/5_crown_of_the_forest_lord.png' }
        }
    ],

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.portal) player.portal = { completed: [], difficulty: {} };
        if (!player.portal.completed) player.portal.completed = [];
        if (!player.portal.difficulty) player.portal.difficulty = {};
    },

    getPortal: function(portalId) {
        for (var i = 0; i < this.PORTALS.length; i++) {
            if (this.PORTALS[i].id === portalId) return this.PORTALS[i];
        }
        return null;
    },

    getAllPortals: function() { return this.PORTALS; },

    getRequirements: function(portalId) {
        return {
            arrows: portalId * 150,
            level: portalId * 5
        };
    },

    canEnter: function(portalId) {
        var req = this.getRequirements(portalId);
        var player = Sherwood.getPlayer();
        if (!player) return false;
        
        var arrowCount = 0;
        if (typeof Sherwood.Forge !== 'undefined' && Sherwood.Forge.getArrowCount) {
            arrowCount = Sherwood.Forge.getArrowCount();
        }
        
        if (arrowCount < req.arrows) return false;
        if ((player.level || 1) < req.level) return false;
        
        return true;
    },

    isPortalUnlocked: function() { return true; },

    enterPortal: function(portalId) {
        var portal = this.getPortal(portalId);
        if (!portal) return { success: false, reason: 'Портал не найден' };
        
        var req = this.getRequirements(portalId);
        var player = Sherwood.getPlayer();
        
        if ((player.level || 1) < req.level) {
            return { success: false, reason: 'Нужен уровень ' + req.level };
        }
        
        if (typeof Sherwood.Forge !== 'undefined' && Sherwood.Forge.getArrowCount) {
            var arrowCount = Sherwood.Forge.getArrowCount();
            if (arrowCount < req.arrows) {
                return { success: false, reason: 'Нужно ' + req.arrows + ' стрел (у вас ' + arrowCount + ')' };
            }
            
            var bag = Sherwood.Bag;
            var items = bag.getItems();
            var toRemove = req.arrows;
            for (var i = items.length - 1; i >= 0 && toRemove > 0; i--) {
                if (items[i].id && items[i].id.indexOf('arrow') === 0) {
                    var qty = items[i].quantity || 1;
                    if (qty <= toRemove) { toRemove -= qty; bag.removeItem(i); }
                    else { items[i].quantity -= toRemove; toRemove = 0; }
                }
            }
            bag._save();
        }
        
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
        
        Sherwood.saveGame();
        
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
        return { 
            portal: this._currentPortal, 
            level: this._currentLevel + 1, 
            totalLevels: this._currentPortal.enemies.length, 
            enemy: enemy, 
            timeRemaining: this._timeRemaining, 
            deathCount: this._deathCount, 
            isBoss: enemy.isBoss || false 
        };
    },

    portalAttack: function() {
        if (!this._inPortal) return null;
        
        var battle = this.getCurrentBattle(); 
        if (!battle) return null;
        
        var player = Sherwood.getPlayer(); 
        var enemy = battle.enemy;
        
        if (player.stats.hp <= 0) {
            return { dead: true, portalFailed: true };
        }
        
        var damage = Math.max(1, Math.floor(player.stats.attack - enemy.defense + Math.random() * 20));
        enemy.hp -= damage;
        
        if (!enemy.maxHp) enemy.maxHp = enemy.hp + damage;
        
        var result = { 
            damage: damage, 
            enemyName: enemy.name, 
            enemyHp: Math.max(0, enemy.hp), 
            enemyMaxHp: enemy.maxHp, 
            enemyDead: enemy.hp <= 0, 
            isBoss: enemy.isBoss || false 
        };
        
        if (enemy.hp <= 0) {
            if (Sherwood.Bestiary && enemy.image) Sherwood.Bestiary.registerKill(enemy.image);
            result.exp = enemy.exp; 
            result.gold = enemy.gold;
            Sherwood.addExp(enemy.exp); 
            Sherwood.addResource('gold', enemy.gold); 
            Sherwood.addResource('silver', Math.floor(enemy.gold * 1.5));
            this._currentLevel++;
            
            if (this._currentLevel >= this._currentPortal.enemies.length) {
                var completeResult = this._completePortal();
                completeResult.damage = damage;
                return completeResult;
            }
            
            result.nextEnemy = this._currentPortal.enemies[this._currentLevel];
            Sherwood.saveGame();
            return result;
        }
        
        var enemyDamage = Math.max(1, Math.floor(enemy.attack - player.stats.defense + Math.random() * 15));
        player.stats.hp = Math.max(0, player.stats.hp - enemyDamage);
        result.enemyDamage = enemyDamage; 
        result.playerHp = player.stats.hp;
        
        if (player.stats.hp <= 0) {
            return this._handleDeath();
        }
        
        Sherwood.saveGame();
        return result;
    },

    _handleDeath: function() {
        this._deathCount++;
        var player = Sherwood.getPlayer();
        
        if (this._deathCount > 5) { 
            this._exitPortal(false); 
            return { dead: true, portalFailed: true }; 
        }
        
        var cost = this._deathCount <= 2 
            ? { cost: this._deathCount * 2500, currency: 'silver' } 
            : { cost: 50 + (this._deathCount - 2) * 50, currency: 'gold' };
        
        if (cost.cost > 0 && (player.resources[cost.currency] || 0) < cost.cost) { 
            this._exitPortal(false); 
            return { dead: true, portalFailed: true }; 
        }
        
        if (cost.cost > 0) player.resources[cost.currency] -= cost.cost;
        player.stats.hp = player.stats.maxHp; 
        Sherwood.saveGame();
        
        return { dead: true, deathCount: this._deathCount, cost: cost, resurrected: true, playerHp: player.stats.hp };
    },

    _completePortal: function() {
        var portal = this._currentPortal;
        var player = Sherwood.getPlayer();
        
        var timesCompleted = player.portal.completed ? player.portal.completed.filter(function(id) { return id === portal.id; }).length : 0;
        var firstTime = timesCompleted === 0;
        var isHardMode = timesCompleted > 0 && timesCompleted % 2 === 0;
        
        var mult = firstTime ? 1 : (isHardMode ? 0.5 : 0.3);
        var difficultyMult = isHardMode ? 1.5 : 1;
        
        var expReward = Math.floor(portal.rewards.exp * mult * difficultyMult);
        var goldReward = Math.floor(portal.rewards.gold * mult * difficultyMult);
        var silverReward = Math.floor(portal.rewards.silver * mult * difficultyMult);
        
        Sherwood.addExp(expReward);
        Sherwood.addResource('gold', goldReward);
        Sherwood.addResource('silver', silverReward);
        
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
        
        Sherwood.saveGame();
        
        return { 
            portalComplete: true, 
            portal: cp, 
            rewards: { gold: goldReward, exp: expReward, silver: silverReward }, 
            firstTime: firstTime, 
            hardMode: isHardMode 
        };
    },

    _exitPortal: function(success) {
        if (this._timerInterval) clearInterval(this._timerInterval);
        this._inPortal = false;
        this._currentPortal = null;
        if (!success) { 
            var player = Sherwood.getPlayer(); 
            player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.1)); 
            Sherwood.saveGame(); 
        }
    },

    fleePortal: function() { 
        this._exitPortal(false); 
        return { success: true }; 
    },
    
    getTimeRemaining: function() { return this._timeRemaining; },
    isInPortal: function() { return this._inPortal; }
};

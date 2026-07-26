/**
 * Sherwood Portal — Порталы (7 уровней)
 * Исправлен: вход за стрелы, сохранение прогресса, механика выкупа
 */

Sherwood.Portal = {
    _currentPortal: null,
    _currentLevel: 0,
    _inPortal: false,
    _deathCount: 0,
    _timerInterval: null,
    _timeRemaining: 0,
    _respawnTimer: null,

    PORTALS: [
        {
            id: 1,
            name: 'Портал Нашествия',
            icon: '🌀',
            bg: 'assets/backgrounds/portal_1.jpeg',
            tokenIcon: 'assets/interface/resource_token_on_entrance_portal_1.png',
            statRequirement: { attack: 200, defense: 100 },
            arrowCost: 5,
            enemies: [
                { name: 'Костяной стрелок', image: 'image (7).png', hp: 800, attack: 60, defense: 30, exp: 150, gold: 100 },
                { name: 'Забытый гвардеец', image: 'image (6).png', hp: 1200, attack: 75, defense: 40, exp: 250, gold: 180, isBoss: true }
            ],
            rewards: { gold: 300, exp: 500, silver: 800 }
        },
        {
            id: 2,
            name: 'Портал Черепных Пауков',
            icon: '🕷️',
            bg: 'assets/backgrounds/portal_2.png',
            tokenIcon: 'assets/interface/resource_token_on_entrance_portal_2.png',
            statRequirement: { attack: 400, defense: 200 },
            arrowCost: 10,
            enemies: [
                { name: 'Черепной паук', image: 'image (19).png', hp: 1100, attack: 70, defense: 35, exp: 180, gold: 130 },
                { name: 'Хранитель Врат', image: 'image (11).png', hp: 1600, attack: 90, defense: 50, exp: 300, gold: 220, isBoss: true }
            ],
            rewards: { gold: 400, exp: 650, silver: 1000 }
        },
        {
            id: 3,
            name: 'Портал Увядания',
            icon: '🥀',
            bg: 'assets/backgrounds/portal_3.png',
            tokenIcon: 'assets/interface/resource_token_on_entrance_portal_3.png',
            statRequirement: { attack: 600, defense: 300 },
            arrowCost: 15,
            enemies: [
                { name: 'Проклятая нимфа', image: 'image (25).png', hp: 1500, attack: 85, defense: 40, exp: 220, gold: 160 },
                { name: 'Рогатый дух увядания', image: 'image (10).png', hp: 2100, attack: 105, defense: 60, exp: 380, gold: 280, isBoss: true }
            ],
            rewards: { gold: 550, exp: 850, silver: 1300 }
        },
        {
            id: 4,
            name: 'Портал Цепей',
            icon: '⛓️',
            bg: 'assets/backgrounds/portal_1.jpeg',
            tokenIcon: 'assets/interface/portal_entrance_token.png',
            statRequirement: { attack: 900, defense: 450 },
            arrowCost: 20,
            enemies: [
                { name: 'Повелитель цепей', image: 'image (8).png', hp: 2000, attack: 100, defense: 50, exp: 280, gold: 200 },
                { name: 'Тюремщик Разлома', image: 'image (23).png', hp: 2400, attack: 115, defense: 65, exp: 350, gold: 260 },
                { name: 'Кислотный голем', image: 'image (9).png', hp: 3200, attack: 135, defense: 80, exp: 500, gold: 380, isBoss: true }
            ],
            rewards: { gold: 700, exp: 1100, silver: 1700 }
        },
        {
            id: 5,
            name: 'Портал Ликантропов',
            icon: '🐺',
            bg: 'assets/backgrounds/portal_2.png',
            tokenIcon: 'assets/interface/portal_entrance_token.png',
            statRequirement: { attack: 1300, defense: 650 },
            arrowCost: 30,
            enemies: [
                { name: 'Кровавый упырь', image: 'image (18).png', hp: 2700, attack: 120, defense: 60, exp: 350, gold: 250 },
                { name: 'Изумрудный ликантроп', image: 'image (24).png', hp: 3200, attack: 140, defense: 75, exp: 450, gold: 320 },
                { name: 'Двойной ликантроп', image: 'image (29).png', hp: 4000, attack: 160, defense: 90, exp: 600, gold: 450, isBoss: true }
            ],
            rewards: { gold: 900, exp: 1400, silver: 2200 }
        },
        {
            id: 6,
            name: 'Портал Скорпиона',
            icon: '🦂',
            bg: 'assets/backgrounds/portal_3.png',
            tokenIcon: 'assets/interface/portal_entrance_token.png',
            statRequirement: { attack: 1800, defense: 900 },
            arrowCost: 40,
            enemies: [
                { name: 'Страж портала', image: 'image (14).png', hp: 3500, attack: 140, defense: 70, exp: 420, gold: 300 },
                { name: 'Элитный страж', image: 'image (17).png', hp: 4000, attack: 155, defense: 80, exp: 500, gold: 360 },
                { name: 'Механический скорпион', image: 'image (15).png', hp: 5000, attack: 185, defense: 100, exp: 750, gold: 550, isBoss: true }
            ],
            rewards: { gold: 1150, exp: 1800, silver: 2800 }
        },
        {
            id: 7,
            name: 'Портал Искажения',
            icon: '👁️',
            bg: 'assets/backgrounds/portal_1.jpeg',
            tokenIcon: 'assets/interface/portal_entrance_token.png',
            statRequirement: { attack: 2500, defense: 1200 },
            arrowCost: 50,
            enemies: [
                { name: 'Страж искажения', image: 'image (16).png', hp: 4500, attack: 170, defense: 85, exp: 550, gold: 400 },
                { name: 'Элита портала', image: 'image (21).png', hp: 5200, attack: 190, defense: 95, exp: 650, gold: 480 },
                { name: 'Владыка Искажения', image: 'image (12).png', hp: 6000, attack: 210, defense: 110, exp: 850, gold: 650 },
                { name: 'Кристаллический змей', image: 'image (20).png', hp: 7500, attack: 240, defense: 130, exp: 1100, gold: 850, isBoss: true }
            ],
            rewards: { gold: 1500, exp: 2500, silver: 4000 }
        }
    ],

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.portal) {
            player.portal = { completed: [], deathCounts: {} };
        }
    },

    getPortal: function(portalId) {
        for (var i = 0; i < this.PORTALS.length; i++) {
            if (this.PORTALS[i].id === portalId) {
                return this.PORTALS[i];
            }
        }
        return null;
    },

    getAllPortals: function() {
        return this.PORTALS;
    },

    isPortalUnlocked: function(portalId) {
        if (portalId === 1) return true;
        var player = Sherwood.getPlayer();
        if (!player || !player.portal) return false;
        return player.portal.completed && player.portal.completed.indexOf(portalId - 1) !== -1;
    },

    canEnter: function(portalId) {
        var portal = this.getPortal(portalId);
        if (!portal) return { can: false, reason: 'Портал не найден' };

        if (!this.isPortalUnlocked(portalId)) {
            return { can: false, reason: 'Портал заблокирован' };
        }

        var player = Sherwood.getPlayer();
        if (!player) return { can: false, reason: 'Игрок не найден' };

        if (player.stats.attack < portal.statRequirement.attack || 
            player.stats.defense < portal.statRequirement.defense) {
            return { 
                can: false, 
                reason: 'Недостаточно статов',
                required: portal.statRequirement 
            };
        }

        if (this._inPortal) {
            return { can: false, reason: 'Вы уже в портале' };
        }

        // Проверка стрел
        var arrowCount = Sherwood.Forge ? Sherwood.Forge.getArrowCount() : 0;
        if (arrowCount < portal.arrowCost) {
            return { 
                can: false, 
                reason: 'Нужно ' + portal.arrowCost + ' стрел (у вас ' + arrowCount + ')' 
            };
        }

        return { can: true };
    },

    enterPortal: function(portalId) {
        var check = this.canEnter(portalId);
        if (!check.can) return check;

        var portal = this.getPortal(portalId);
        if (!portal) return { success: false, reason: 'Портал не найден' };

        // Списываем стрелы
        var arrowCount = Sherwood.Forge ? Sherwood.Forge.getArrowCount() : 0;
        if (arrowCount < portal.arrowCost) {
            return { success: false, reason: 'Недостаточно стрел' };
        }

        // Удаляем стрелы из сумки
        var bag = Sherwood.Bag;
        var items = bag.getItems();
        var removed = 0;
        for (var i = items.length - 1; i >= 0 && removed < portal.arrowCost; i--) {
            if (items[i].id && items[i].id.indexOf('arrow_') === 0) {
                var toRemove = Math.min(items[i].quantity || 1, portal.arrowCost - removed);
                bag.removeItem(i, toRemove);
                removed += toRemove;
            }
        }

        // Сброс состояния портала
        this._currentPortal = portal;
        this._currentLevel = 0;
        this._inPortal = true;
        this._deathCount = 0;
        this._timeRemaining = 10800; // 3 часа

        // Сброс HP врагов
        for (var i = 0; i < portal.enemies.length; i++) {
            var enemy = portal.enemies[i];
            enemy.maxHp = enemy.hp;
        }

        this._startTimer();

        return {
            success: true,
            portal: portal,
            enemies: portal.enemies,
            timeLimit: this._timeRemaining
        };
    },

    _startTimer: function() {
        if (this._timerInterval) clearInterval(this._timerInterval);
        this._timerInterval = setInterval(function() {
            Sherwood.Portal._timeRemaining--;
            if (Sherwood.Portal._timeRemaining <= 0) {
                Sherwood.Portal._exitPortal(false);
            }
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

        // Расчёт урона
        var damage = Math.max(1, player.stats.attack - enemy.defense + Math.floor(Math.random() * 20));
        enemy.hp -= damage;

        var result = {
            damage: damage,
            enemyName: enemy.name,
            enemyHp: Math.max(0, enemy.hp),
            enemyMaxHp: enemy.maxHp || (enemy.hp + damage),
            enemyDead: enemy.hp <= 0,
            isBoss: enemy.isBoss || false
        };

        if (!enemy.maxHp) enemy.maxHp = enemy.hp + damage;

        if (enemy.hp <= 0) {
            // Враг убит
            result.exp = enemy.exp;
            result.gold = enemy.gold;
            Sherwood.addExp(enemy.exp);
            Sherwood.addResource('gold', enemy.gold);
            Sherwood.addResource('silver', Math.floor(enemy.gold * 1.5));

            this._currentLevel++;
            if (this._currentLevel >= this._currentPortal.enemies.length) {
                // Все враги убиты
                return this._completePortal();
            }
            result.nextEnemy = this._currentPortal.enemies[this._currentLevel];
            return result;
        }

        // Ответ врага
        var enemyDamage = Math.max(1, enemy.attack - player.stats.defense + Math.floor(Math.random() * 15));
        player.stats.hp = Math.max(0, player.stats.hp - enemyDamage);
        result.enemyDamage = enemyDamage;
        result.playerHp = player.stats.hp;

        if (player.stats.hp <= 0) {
            return this._handleDeath();
        }

        return result;
    },

    portalSkill: function(skillId) {
        // Заглушка — использует ту же логику, что и attack
        return this.portalAttack();
    },

    _handleDeath: function() {
        this._deathCount++;
        var player = Sherwood.getPlayer();

        var deathCosts = [
            { cost: 0, currency: 'silver' },
            { cost: 5000, currency: 'silver' },
            { cost: 10000, currency: 'silver' },
            { cost: 150, currency: 'gold' },
            { cost: 200, currency: 'gold' }
        ];

        var costIndex = Math.min(this._deathCount - 1, deathCosts.length - 1);
        var cost = deathCosts[costIndex];

        if (this._deathCount > 5) {
            this._exitPortal(false);
            return { dead: true, portalFailed: true, reason: 'Слишком много смертей' };
        }

        var canPay = cost.cost === 0 || (player.resources[cost.currency] || 0) >= cost.cost;
        if (!canPay) {
            this._exitPortal(false);
            return { dead: true, portalFailed: true, reason: 'Не хватает средств на выкуп' };
        }

        if (cost.cost > 0) {
            player.resources[cost.currency] -= cost.cost;
        }

        player.stats.hp = player.stats.maxHp;
        Sherwood.saveGame();

        return {
            dead: true,
            deathCount: this._deathCount,
            cost: cost,
            resurrected: true,
            playerHp: player.stats.hp
        };
    },

    _completePortal: function() {
        var portal = this._currentPortal;
        var player = Sherwood.getPlayer();

        // Проверяем, не пройден ли уже портал
        if (player.portal.completed && player.portal.completed.indexOf(portal.id) !== -1) {
            // Уже пройден — даём только часть награды
            var partialReward = {
                gold: Math.floor(portal.rewards.gold * 0.3),
                exp: Math.floor(portal.rewards.exp * 0.3),
                silver: Math.floor(portal.rewards.silver * 0.3)
            };
            Sherwood.addExp(partialReward.exp);
            Sherwood.addResource('gold', partialReward.gold);
            Sherwood.addResource('silver', partialReward.silver);

            if (this._timerInterval) clearInterval(this._timerInterval);
            this._inPortal = false;
            var completedPortal = this._currentPortal;
            this._currentPortal = null;

            return {
                portalComplete: true,
                portal: completedPortal,
                rewards: partialReward,
                alreadyCompleted: true
            };
        }

        // Первое прохождение — полная награда
        Sherwood.addExp(portal.rewards.exp);
        Sherwood.addResource('gold', portal.rewards.gold);
        Sherwood.addResource('silver', portal.rewards.silver);

        if (!player.portal.completed) player.portal.completed = [];
        if (player.portal.completed.indexOf(portal.id) === -1) {
            player.portal.completed.push(portal.id);
        }

        // Трофеи за порталы
        if (typeof Sherwood.Trophy !== 'undefined' && Sherwood.Trophy.unlock) {
            var trophyId = 'portal_' + portal.id;
            Sherwood.Trophy.unlock(trophyId, portal.name + ' пройден!', portal.icon);
        }

        if (this._timerInterval) clearInterval(this._timerInterval);
        this._inPortal = false;
        var completedPortal = this._currentPortal;
        this._currentPortal = null;

        return {
            portalComplete: true,
            portal: completedPortal,
            rewards: portal.rewards,
            alreadyCompleted: false
        };
    },

    _exitPortal: function(success) {
        if (this._timerInterval) clearInterval(this._timerInterval);
        this._inPortal = false;
        var portal = this._currentPortal;
        this._currentPortal = null;

        var player = Sherwood.getPlayer();
        if (!success) {
            // Штраф за провал
            player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.1));
        }
        Sherwood.saveGame();

        if (typeof SherwoodUI !== 'undefined' && SherwoodUI.loadHome) {
            SherwoodUI.loadHome();
        }
    },

    fleePortal: function() {
        this._exitPortal(false);
        return { success: true, fled: true };
    },

    getTimeRemaining: function() {
        return this._timeRemaining;
    },

    isInPortal: function() {
        return this._inPortal;
    },

    getPortalRewards: function(portalId) {
        var portal = this.getPortal(portalId);
        if (!portal) return null;
        return portal.rewards;
    },

    getArrowCost: function(portalId) {
        var portal = this.getPortal(portalId);
        if (!portal) return 0;
        return portal.arrowCost;
    },

    // Обновление статов врагов при входе
    _resetEnemyStats: function(portal) {
        for (var i = 0; i < portal.enemies.length; i++) {
            var enemy = portal.enemies[i];
            enemy.hp = enemy.maxHp || enemy.hp;
        }
    }
};

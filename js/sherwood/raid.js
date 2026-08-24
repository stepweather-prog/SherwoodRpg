/**
 * Sherwood Raid — Мировой рейд
 * Изначальный Ужас — Спящий в Корнях
 */

Sherwood.Raid = {
    _raidActive: false,
    _raidBoss: null,
    _participants: [],
    _maxParticipants: 10,
    _raidsToday: 0,
    _maxRaidsPerDay: 3,
    _currentStage: 0,
    _totalStages: 3,
    _playerAlive: true,

    RAID_BOSSES: [
        {
            id: 'primordial_dread',
            name: 'Изначальный Ужас — Спящий в Корнях',
            image: 'original_horror.png',
            hp: 50000, maxHp: 50000,
            attack: 350, defense: 180,
            exp: 10000, gold: 8000,
            stages: [
                { name: 'Пробуждение Корней', enemies: [
                    { name: 'Голем Скверного Дуба', image: 'blighted_oak_golem.png', hp: 5000, maxHp: 5000, attack: 140, defense: 70 },
                    { name: 'Корневой Палач', image: 'root_executioner.png', hp: 5500, maxHp: 5500, attack: 155, defense: 75 },
                    { name: 'Древний Владыка', image: 'blight_lord_leshy.png', hp: 6000, maxHp: 6000, attack: 170, defense: 85 }
                ]},
                { name: 'Стражи Бездны', enemies: [
                    { name: 'Проклятая Жрица', image: 'cursed_priestess.png', hp: 7000, maxHp: 7000, attack: 190, defense: 95 },
                    { name: 'Лорд Хаоса', image: 'chaos_lord.png', hp: 7500, maxHp: 7500, attack: 205, defense: 100 },
                    { name: 'Скверный Король', image: 'blight_king.png', hp: 8000, maxHp: 8000, attack: 220, defense: 110 }
                ]},
                { name: 'Изначальный Ужас', enemies: [
                    { name: 'Изначальный Ужас', image: 'original_horror.png', hp: 50000, maxHp: 50000, attack: 350, defense: 180, isRaidBoss: true }
                ]}
            ]
        }
    ],

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.raid) p.raid = { raidsToday: 0, lastRaidDate: new Date().toDateString(), participants: [] };
        var today = new Date().toDateString();
        if (p.raid.lastRaidDate !== today) {
            p.raid.raidsToday = 0;
            p.raid.lastRaidDate = today;
            p.raid.participants = [];
        }
        this._raidsToday = p.raid.raidsToday || 0;
        this._participants = p.raid.participants || [];
        if (p.raid.activeRaid) {
            this._raidBoss = p.raid.activeRaid;
            this._raidActive = true;
            this._currentStage = p.raid.currentStage || 0;
            this._playerAlive = p.raid.playerAlive !== false;
        }
    },

    getAvailableRaids: function() {
        return this.RAID_BOSSES;
    },

    canJoinRaid: function() {
        var p = Sherwood.getPlayer();
        if (!p) return { can: false, reason: 'Игрок не найден' };
        // Обновляем прогресс ежедневного задания
    if (typeof Sherwood.Daily !== 'undefined') {
        Sherwood.Daily.updateProgress('raid_fights', 1);
    }
        var today = new Date().toDateString();
        if (p.raid.lastRaidDate !== today) {
            p.raid.raidsToday = 0;
            p.raid.lastRaidDate = today;
            p.raid.participants = [];
            Sherwood.saveGame();
        }

        if ((p.raid.raidsToday || 0) >= this._maxRaidsPerDay) {
            return { can: false, reason: 'Лимит рейдов на сегодня (3/3)' };
        }

        if (this._raidActive) {
            return { can: false, reason: 'Рейд уже идёт' };
        }

        var player = Sherwood.getPlayer();
        if (!player || player.stats.hp <= 0) {
            return { can: false, reason: 'Игрок мёртв' };
        }

        return { can: true };
    },

    startRaid: function(bossIndex) {
        var check = this.canJoinRaid();
        if (!check.can) return check;

        var bossTemplate = this.RAID_BOSSES[bossIndex || 0];
        this._raidBoss = JSON.parse(JSON.stringify(bossTemplate));
        this._raidActive = true;
        this._currentStage = 0;
        this._playerAlive = true;

        var p = Sherwood.getPlayer();
        p.raid.raidsToday = (p.raid.raidsToday || 0) + 1;
        p.raid.participants = [p.name || 'Охотник'];
        p.raid.activeRaid = this._raidBoss;
        p.raid.currentStage = 0;
        p.raid.playerAlive = true;
        Sherwood.saveGame();

        this._participants = p.raid.participants;

        return {
            success: true,
            boss: this._raidBoss,
            currentStage: this._raidBoss.stages[0],
            stageIndex: 1,
            totalStages: this._totalStages,
            participants: this._participants
        };
    },

    getRaidStatus: function() {
        if (!this._raidActive || !this._raidBoss) return null;

        var stage = this._raidBoss.stages[this._currentStage] || null;
        var enemies = stage ? stage.enemies : [];
        var aliveEnemies = enemies.filter(function(e) { return e.hp > 0; });

        return {
            boss: this._raidBoss,
            stage: stage,
            stageName: stage ? stage.name : 'Завершено',
            stageIndex: this._currentStage + 1,
            totalStages: this._totalStages,
            participants: this._participants || [],
            enemies: enemies,
            aliveEnemies: aliveEnemies,
            isComplete: this._currentStage >= this._totalStages,
            playerAlive: this._playerAlive
        };
    },

    getCurrentEnemy: function() {
        if (!this._raidActive || !this._raidBoss) return null;
        if (this._currentStage >= this._totalStages) return null;

        var stage = this._raidBoss.stages[this._currentStage];
        for (var i = 0; i < stage.enemies.length; i++) {
            if (stage.enemies[i].hp > 0) {
                return stage.enemies[i];
            }
        }
        return null;
    },

    _getNextEnemy: function() {
        var enemy = this.getCurrentEnemy();
        if (enemy) return enemy;

        this._currentStage++;

        if (this._currentStage >= this._totalStages) {
            return null;
        }

        var stage = this._raidBoss.stages[this._currentStage];
        if (stage && stage.enemies.length > 0) {
            return stage.enemies[0];
        }

        return null;
    },

    raidAttack: function() {
        if (!this._raidActive || !this._raidBoss) {
            return { error: 'Рейд не активен' };
        }

        if (this._currentStage >= this._totalStages) {
            return { raidComplete: true };
        }

        if (!this._playerAlive) {
            return { playerDead: true, message: 'Вы погибли в рейде' };
        }

        var enemy = this.getCurrentEnemy();

        if (!enemy) {
            this._currentStage++;
            if (this._currentStage >= this._totalStages) {
                return this._completeRaid();
            }
            var newEnemy = this.getCurrentEnemy();
            if (newEnemy) {
                return { stageComplete: true, nextEnemy: newEnemy, stageIndex: this._currentStage + 1 };
            }
            return { error: 'Нет врагов' };
        }

        var p = Sherwood.getPlayer();
        if (!p) return { error: 'Игрок не найден' };

        var dmg = Math.max(1, Math.floor((p.stats.attack * p.stats.attack) / (p.stats.attack + (enemy.defense || 10))));
        var crit = Math.random() * 100 < 15;
        if (crit) dmg = Math.floor(dmg * 1.8);

        var extra = Math.random() * 100 < 20 ? Math.floor(dmg * 0.3) : 0;
        dmg += extra;

        enemy.hp -= dmg;
        if (enemy.hp < 0) enemy.hp = 0;

        var result = {
            damage: dmg,
            crit: crit,
            extra: extra,
            enemyHp: enemy.hp,
            enemyMaxHp: enemy.maxHp,
            enemyName: enemy.name,
            enemyImage: enemy.image,
            enemyDead: enemy.hp <= 0
        };

        if (enemy.hp <= 0) {
            var stage = this._raidBoss.stages[this._currentStage];
            var allDead = stage.enemies.every(function(e) { return e.hp <= 0; });

            if (allDead) {
                this._currentStage++;
                if (this._currentStage >= this._totalStages) {
                    return this._completeRaid();
                }
                result.stageComplete = true;
                result.nextStage = this._raidBoss.stages[this._currentStage];
                result.stageIndex = this._currentStage + 1;
            } else {
                result.nextEnemy = this.getCurrentEnemy();
            }

            this._saveProgress();
            return result;
        }

        var edmg = Math.max(1, Math.floor((enemy.attack * enemy.attack) / (enemy.attack + p.stats.defense)));
        var armorReduction = Math.min(p.stats.defense * 0.2, edmg * 0.3);
        edmg = Math.max(1, edmg - armorReduction);

        p.stats.hp = Math.max(0, p.stats.hp - edmg);
        result.enemyDamage = edmg;
        result.playerHp = p.stats.hp;

        if (p.stats.hp <= 0) {
            p.stats.hp = 1;
            this._playerAlive = false;
            result.playerDead = true;
            Sherwood.saveGame();
        }

        this._saveProgress();
        Sherwood.saveGame();
        return result;
    },

    _completeRaid: function() {
        var boss = this._raidBoss;
        var totalExp = boss.exp + Math.floor(Math.random() * 2000);
        var totalGold = boss.gold + Math.floor(Math.random() * 1000);
        var totalSilver = totalGold * 3 + Math.floor(Math.random() * 2000);

        var aliveCount = this._playerAlive ? 1 : 0;

        if (this._playerAlive) {
            Sherwood.addExp(totalExp);
            Sherwood.addResource('gold', totalGold);
            Sherwood.addResource('silver', totalSilver);
        }

        var trophy = {
            id: 'raid_victory_' + Date.now(),
            name: 'Узы Вечности',
            icon: '👑',
            description: 'Рейд пройден! Выжило: ' + aliveCount + ' участников'
        };

        var player = Sherwood.getPlayer();
        if (player && this._playerAlive) {
            if (!player.trophies) player.trophies = [];
            player.trophies.push(trophy);
            
            // Узы Вечности — перманентный бонус за добивание
            if (!player.eternityBonds) player.eternityBonds = { count: 0, bonus: 0 };
            player.eternityBonds.count++;
            player.eternityBonds.bonus = player.eternityBonds.count * 5;
        }

        this._raidActive = false;
        this._raidBoss = null;

        if (player && player.raid) {
            player.raid.activeRaid = null;
            player.raid.currentStage = 0;
            player.raid.playerAlive = true;
            Sherwood.saveGame();
        }

        return {
            raidComplete: true,
            rewards: {
                exp: this._playerAlive ? totalExp : Math.floor(totalExp * 0.1),
                gold: this._playerAlive ? totalGold : 0,
                silver: this._playerAlive ? totalSilver : Math.floor(totalSilver * 0.2)
            },
            aliveCount: aliveCount,
            trophy: trophy,
            won: this._playerAlive
        };
    },

    _saveProgress: function() {
        var player = Sherwood.getPlayer();
        if (player && player.raid) {
            player.raid.activeRaid = this._raidBoss;
            player.raid.currentStage = this._currentStage;
            player.raid.playerAlive = this._playerAlive;
            player.raid.participants = this._participants;
            Sherwood.saveGame();
        }
    },

    fleeRaid: function() {
        this._raidActive = false;
        this._raidBoss = null;
        var player = Sherwood.getPlayer();
        if (player && player.raid) {
            player.raid.activeRaid = null;
            player.raid.currentStage = 0;
            Sherwood.saveGame();
        }
        return { success: true };
    },

    isRaidActive: function() {
        return this._raidActive;
    },

    isPlayerAlive: function() {
        return this._playerAlive;
    },

    getParticipantCount: function() {
        return this._participants ? this._participants.length : 0;
    },

    joinRaid: function(playerName) {
        if (!this._raidActive) return { success: false, reason: 'Рейд не активен' };
        if (this._participants.indexOf(playerName) !== -1) {
            return { success: false, reason: 'Уже в рейде' };
        }
        this._participants.push(playerName);
        var player = Sherwood.getPlayer();
        if (player && player.raid) {
            player.raid.participants = this._participants;
            Sherwood.saveGame();
        }
        return { success: true, participants: this._participants };
    }
};

/**
 * Sherwood Raid — Мировой рейд
 * Исправлен: участники, этапы, награды
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
            id: 'sherwood_abomination',
            name: 'Шервудское Отродье',
            image: 'image (2).png',
            hp: 15000, maxHp: 15000,
            attack: 200, defense: 100,
            exp: 2000, gold: 1500,
            stages: [
                { name: 'Элиты подземок', enemies: [
                    { name: 'Проклятый титан', image: 'image (15).png', hp: 2000, maxHp: 2000, attack: 80, defense: 40 },
                    { name: 'Костяной гигант', image: 'image (14).png', hp: 2200, maxHp: 2200, attack: 85, defense: 45 },
                    { name: 'Кристаллический ёж', image: 'image (37).png', hp: 2500, maxHp: 2500, attack: 90, defense: 50 }
                ]},
                { name: 'Боссы квестов', enemies: [
                    { name: 'Лесное Лихо', image: 'image (46).png', hp: 3500, maxHp: 3500, attack: 110, defense: 60 },
                    { name: 'Проклятый Король', image: 'image (44).png', hp: 4000, maxHp: 4000, attack: 130, defense: 70 }
                ]},
                { name: 'Мировой босс', enemies: [
                    { name: 'Шервудское Отродье', image: 'image (2).png', hp: 15000, maxHp: 15000, attack: 200, defense: 100, isRaidBoss: true }
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
        // Восстанавливаем активный рейд
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

        // Проверяем дату
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
        // Глубокое копирование
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
        // Проверяем, есть ли живые враги в текущем этапе
        var enemy = this.getCurrentEnemy();
        if (enemy) return enemy;

        // Переход на следующий этап
        this._currentStage++;

        if (this._currentStage >= this._totalStages) {
            // Рейд завершён
            return null;
        }

        // Возвращаем первого врага из следующего этапа
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

        // Получаем текущего врага
        var enemy = this.getCurrentEnemy();

        if (!enemy) {
            // Переход на следующий этап
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

        // Атака
        var p = Sherwood.getPlayer();
        if (!p) return { error: 'Игрок не найден' };

        // Расчёт урона игрока
        var dmg = Math.max(1, Math.floor((p.stats.attack * p.stats.attack) / (p.stats.attack + (enemy.defense || 10))));
        var crit = Math.random() * 100 < 15;
        if (crit) dmg = Math.floor(dmg * 1.8);

        // Шанс на дополнительный урон
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

        // Проверка, что враг убит
        if (enemy.hp <= 0) {
            // Проверяем, все ли враги в этапе убиты
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
                // Следующий враг в том же этапе
                result.nextEnemy = this.getCurrentEnemy();
            }

            // Сохраняем прогресс
            this._saveProgress();
            return result;
        }

        // Ответ врага
        var edmg = Math.max(1, Math.floor((enemy.attack * enemy.attack) / (enemy.attack + p.stats.defense)));
        // Броня поглощает часть урона
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
        var totalExp = boss.exp + Math.floor(Math.random() * 500);
        var totalGold = boss.gold + Math.floor(Math.random() * 300);
        var totalSilver = totalGold * 3 + Math.floor(Math.random() * 500);

        // Награда только выжившим
        var aliveCount = this._playerAlive ? 1 : 0;

        if (this._playerAlive) {
            Sherwood.addExp(totalExp);
            Sherwood.addResource('gold', totalGold);
            Sherwood.addResource('silver', totalSilver);
        }

        // Трофеи для выживших
        var trophy = {
            id: 'raid_victory_' + Date.now(),
            name: 'Победа над Шервудским Отродьем',
            icon: '👑',
            description: 'Рейд пройден! Выжило: ' + aliveCount + ' участников'
        };

        var player = Sherwood.getPlayer();
        if (player && this._playerAlive) {
            if (!player.trophies) player.trophies = [];
            player.trophies.push(trophy);
        }

        // Сбрасываем рейд
        this._raidActive = false;
        this._raidBoss = null;

        // Очищаем сохранённый рейд
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

    // Проверка, жив ли игрок в рейде
    isPlayerAlive: function() {
        return this._playerAlive;
    },

    // Получить количество участников
    getParticipantCount: function() {
        return this._participants ? this._participants.length : 0;
    },

    // Присоединиться к рейду (для мультиплеера)
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

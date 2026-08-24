/**
 * Sherwood Arena — Арена (3x3 бой с ботами)
 */

Sherwood.Arena = {
    _inMatch: false,
    _opponents: [],
    _currentOpponent: null,
    _playerBattleHp: 0,
    _chargePercent: 0,
    _chargeInterval: null,
    _wins: 0,
    _losses: 0,
    _rank: 'Новичок',
    _lastPlayerAttack: 0,
    _playerAttackCooldown: 3000, // 3 секунды

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.arena) p.arena = { wins: 0, losses: 0, rank: 'Новичок' };
        this._wins = p.arena.wins || 0;
        this._losses = p.arena.losses || 0;
        this._rank = p.arena.rank || 'Новичок';
    },

    getStats: function() {
        return { wins: this._wins, losses: this._losses, rank: this._rank };
    },

    isInMatch: function() { return this._inMatch; },

    refreshOpponents: function() {
        this._generateOpponents();
    },

    getOpponents: function() {
        return this._opponents.slice();
    },

    _generateOpponents: function() {
        this._opponents = [];
        var player = Sherwood.getPlayer();
        if (!player) return;

        var roles = ['tank', 'damager', 'balanced'];

        for (var i = 0; i < 3; i++) {
            var diff = Math.floor(Math.random() * 15) - 7;
            var role = roles[i];

            var attack = player.stats.attack + diff;
            var defense = player.stats.defense + Math.floor(diff / 2);
            var hp = player.stats.maxHp + diff * 3;

            if (role === 'tank') {
                attack = Math.floor(attack * 0.85);
                defense = Math.floor(defense * 1.3);
                hp = Math.floor(hp * 1.4);
            } else if (role === 'damager') {
                attack = Math.floor(attack * 1.25);
                defense = Math.floor(defense * 0.8);
                hp = Math.floor(hp * 0.85);
            } else {
                attack = Math.floor(attack * 1.0);
                defense = Math.floor(defense * 1.0);
                hp = Math.floor(hp * 1.0);
            }

            var skins = ['skin1_01', 'skin1_02', 'skin1_03', 'skin2_01', 'skin2_02'];
            var skin = skins[Math.floor(Math.random() * skins.length)];

            this._opponents.push({
                name: 'Бот ' + (i + 1),
                role: role,
                skin: 'assets/hero_skins/' + skin + '.png',
                stats: {
                    attack: Math.max(10, attack),
                    defense: Math.max(5, defense),
                    hp: Math.max(50, hp),
                    maxHp: Math.max(50, hp)
                }
            });
        }
    },

    startMatch: function() {
        if (this._inMatch) return { success: false, reason: 'Матч уже идёт' };
        var player = Sherwood.getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };

        this._generateOpponents();
        this._currentOpponent = this._opponents[0];
        this._playerBattleHp = player.stats.maxHp;
        this._inMatch = true;
        this._chargePercent = 0;
        this._lastPlayerAttack = 0;

        player.stats.hp = player.stats.maxHp;
        Sherwood.saveGame();

        // Обновляем прогресс ежедневного задания
        if (typeof Sherwood.Daily !== 'undefined') {
            Sherwood.Daily.updateProgress('arena_fights', 1);
        }

        return { success: true, opponents: this._opponents };
    },

    getCurrentOpponent: function() {
        return this._currentOpponent;
    },

    getChargePercent: function() {
        return this._chargePercent;
    },

    canPlayerAttack: function() {
        var timeSinceLast = Date.now() - this._lastPlayerAttack;
        return timeSinceLast >= 1500; // Можно бить через 1.5 секунды
    },

    getAttackPower: function() {
        var timeSinceLast = Date.now() - this._lastPlayerAttack;
        if (timeSinceLast >= this._playerAttackCooldown) {
            return 1; // Полная сила
        }
        if (timeSinceLast >= 1500) {
            return 0.5; // Половина силы
        }
        return 0; // Нельзя бить
    },

    startCharge: function() {
        var self = this;
        if (this._chargeInterval) clearInterval(this._chargeInterval);
        this._chargeInterval = setInterval(function() {
            if (self._inMatch && self._chargePercent < 1) {
                self._chargePercent += 0.1;
                if (self._chargePercent > 1) self._chargePercent = 1;
            }
        }, 100);
    },

    stopCharge: function() {
        if (this._chargeInterval) {
            clearInterval(this._chargeInterval);
            this._chargeInterval = null;
        }
    },

    playerAttack: function() {
        if (!this._inMatch || !this._currentOpponent) return { error: 'Нет боя' };
        
        var attackPower = this.getAttackPower();
        if (attackPower === 0) return { error: 'Атака не готова' };
        
        var player = Sherwood.getPlayer();
        var opp = this._currentOpponent;

        if (opp.stats.hp <= 0) {
            return this.switchTarget();
        }

        var chargePercent = this._chargePercent;
        if (chargePercent < 0.05) chargePercent = 0.05;

        var rawDamage = Math.max(1, Math.floor((player.stats.attack - opp.stats.defense) * 0.4 + player.stats.attack * 0.1));
        var chargeMultiplier = 0.7 + (chargePercent * 0.8);
        var damage = Math.floor(rawDamage * chargeMultiplier * attackPower);

        var critChance = chargePercent >= 1 ? 30 : 5;
        var crit = Math.random() * 100 < critChance;
        if (crit) damage = Math.floor(damage * 2.0);

        opp.stats.hp -= damage;
        if (opp.stats.hp < 0) opp.stats.hp = 0;

        this._lastPlayerAttack = Date.now();

        var result = {
            damage: damage,
            crit: crit,
            attackPower: attackPower,
            enemyHp: opp.stats.hp,
            enemyMaxHp: opp.stats.maxHp,
            enemyName: opp.name,
            enemyDead: opp.stats.hp <= 0
        };

        if (opp.stats.hp <= 0) {
            var aliveBots = this._opponents.filter(function(o) { return o.stats.hp > 0; });

            if (aliveBots.length === 0) {
                result.win = true;
                result.rewards = this._getWinRewards();
                this._wins++;
                this._updateRank();
                this._saveStats();
                player.stats.hp = player.stats.maxHp;
                Sherwood.saveGame();
                this._inMatch = false;
                this.stopCharge();
                return result;
            }

            this._currentOpponent = aliveBots[0];
            result.nextEnemy = aliveBots[0];
            Sherwood.saveGame();
            return result;
        }

        var botsResult = this._botsFight();

        if (botsResult.playerDead) {
            result.playerDead = true;
            result.rewards = { exp: 20, silver: 50 };
            this._losses++;
            this._saveStats();
            player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.2));
            Sherwood.saveGame();
            this._inMatch = false;
            this.stopCharge();
            return result;
        }

        if (botsResult.allBotsDead) {
            result.win = true;
            result.rewards = this._getWinRewards();
            this._wins++;
            this._updateRank();
            this._saveStats();
            player.stats.hp = player.stats.maxHp;
            Sherwood.saveGame();
            this._inMatch = false;
            this.stopCharge();
            return result;
        }

        this._chargePercent = 0;
        Sherwood.saveGame();
        return result;
    },

    switchTarget: function() {
        var aliveBots = this._opponents.filter(function(o) { return o.stats.hp > 0; });
        if (aliveBots.length === 0) {
            this._inMatch = false;
            this.stopCharge();
            return { win: true, rewards: this._getWinRewards() };
        }
        this._currentOpponent = aliveBots[0];
        return { success: true, nextEnemy: aliveBots[0] };
    },

    _botsFight: function() {
        var player = Sherwood.getPlayer();
        var allBots = this._opponents.slice();
        var playerHp = this._playerBattleHp;

        // Перемешиваем ботов для случайного порядка
        for (var i = allBots.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = allBots[i];
            allBots[i] = allBots[j];
            allBots[j] = temp;
        }

        // Каждый бот атакует случайную цель (бот или игрок)
        for (var bi = 0; bi < allBots.length; bi++) {
            var attacker = allBots[bi];
            if (!attacker || attacker.stats.hp <= 0) continue;

            var possibleTargets = [];

            // Другие боты
            for (var tj = 0; tj < allBots.length; tj++) {
                if (tj !== bi && allBots[tj].stats.hp > 0) {
                    possibleTargets.push({ type: 'bot', bot: allBots[tj] });
                }
            }

            // Игрок
            if (playerHp > 0) {
                possibleTargets.push({ type: 'player' });
            }

            if (possibleTargets.length === 0) continue;

            var target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];

            if (target.type === 'bot') {
                var targetBot = target.bot;
                var botDamage = Math.max(1, Math.floor((attacker.stats.attack - targetBot.stats.defense) * 0.35 + attacker.stats.attack * 0.08));
                targetBot.stats.hp = Math.max(0, targetBot.stats.hp - botDamage);
            } else {
                var playerDamage = Math.max(1, Math.floor((attacker.stats.attack - player.stats.defense) * 0.3 + attacker.stats.attack * 0.05));
                playerHp -= playerDamage;
            }
        }

        this._playerBattleHp = Math.max(0, playerHp);
        player.stats.hp = this._playerBattleHp;

        if (player.stats.hp <= 0) {
            return { playerDead: true };
        }

        var aliveBots = this._opponents.filter(function(o) { return o.stats.hp > 0; });
        if (aliveBots.length === 0) {
            return { allBotsDead: true };
        }

        return { ok: true };
    },

    _getWinRewards: function() {
        return { exp: 150, gold: 80, silver: 200 };
    },

    _updateRank: function() {
        var total = this._wins + this._losses;
        if (this._wins >= 50) this._rank = 'Легенда';
        else if (this._wins >= 25) this._rank = 'Ветеран';
        else if (this._wins >= 10) this._rank = 'Боец';
        else if (this._wins >= 3) this._rank = 'Новичок+';
        else this._rank = 'Новичок';
    },

    _saveStats: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.arena) p.arena = {};
        p.arena.wins = this._wins;
        p.arena.losses = this._losses;
        p.arena.rank = this._rank;
        Sherwood.saveGame();
    },

    flee: function() {
        this._inMatch = false;
        this.stopCharge();
        this._losses++;
        this._saveStats();
        var player = Sherwood.getPlayer();
        if (player) { player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.2)); Sherwood.saveGame(); }
        return { success: true };
    }
};

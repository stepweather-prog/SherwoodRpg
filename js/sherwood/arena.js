/**
 * Sherwood Arena — PvP Арена
 * Исправлен: скины, ранги, механика боя
 */

Sherwood.Arena = {
    _opponents: [],
    _currentOpponent: null,
    _inMatch: false,
    _wins: 0,
    _losses: 0,
    _rank: 'Новичок',

    RANKS: ['Новичок', 'Боец', 'Ветеран', 'Мастер', 'Чемпион', 'Легенда'],
    RANK_THRESHOLDS: [0, 10, 30, 60, 100, 200],
    SKIN_FILES: ['skin_1_basic', 'skin_2', 'skin_3', 'skin_4', 'skin_5', 'skin_6', 'skin_7', 'skin_8', 'skin_9', 'skin_10', 'skin_11', 'skin_12', 'skin_13', 'skin_14', 'skin_15'],

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.arena) {
            player.arena = { wins: 0, losses: 0, rank: 'Новичок' };
        }
        this._wins = player.arena.wins || 0;
        this._losses = player.arena.losses || 0;
        this._rank = player.arena.rank || 'Новичок';
        this._generateOpponents();
    },

    _generateOpponents: function() {
        this._opponents = [];
        var player = Sherwood.getPlayer();
        if (!player) return;

        for (var i = 0; i < 5; i++) {
            var diff = Math.floor(Math.random() * 20) - 10;
            var attack = Math.max(10, player.stats.attack + diff);
            var defense = Math.max(5, player.stats.defense + Math.floor(diff / 2));
            var hp = Math.max(50, player.stats.maxHp + diff * 5);
            // Базовая HP всегда больше 50
            hp = Math.max(50, hp);

            // Правильный скин
            var skinIndex = Math.floor(Math.random() * this.SKIN_FILES.length);
            var skinFile = this.SKIN_FILES[skinIndex] + '.png';

            this._opponents.push({
                id: i,
                name: 'Игрок_' + Math.floor(Math.random() * 1000),
                skin: 'assets/hero_skins/' + skinFile,
                stats: {
                    attack: attack,
                    defense: defense,
                    hp: hp,
                    maxHp: hp
                },
                reward: {
                    exp: 40 + Math.abs(diff) * 3,
                    gold: 20 + Math.abs(diff) * 2,
                    silver: 30 + Math.abs(diff) * 3
                }
            });
        }
    },

    getOpponents: function() {
        return this._opponents;
    },

    getStats: function() {
        var rankIndex = this.RANKS.indexOf(this._rank);
        var nextRank = rankIndex < this.RANKS.length - 1 ? this.RANKS[rankIndex + 1] : 'Максимум';
        var nextThreshold = rankIndex < this.RANK_THRESHOLDS.length - 1 ? this.RANK_THRESHOLDS[rankIndex + 1] : this._wins;
        var progress = Math.min(100, Math.round((this._wins / (nextThreshold || 1)) * 100));

        return {
            wins: this._wins,
            losses: this._losses,
            rank: this._rank,
            nextRank: nextRank,
            nextThreshold: nextThreshold,
            progress: progress,
            totalMatches: this._wins + this._losses
        };
    },

    startMatch: function(opponentIndex) {
        if (this._inMatch) return { success: false, reason: 'Уже в бою' };
        if (opponentIndex < 0 || opponentIndex >= this._opponents.length) {
            return { success: false, reason: 'Противник не найден' };
        }

        this._currentOpponent = { ...this._opponents[opponentIndex] };
        this._inMatch = true;

        return { success: true, opponent: this._currentOpponent };
    },

    getCurrentMatch: function() {
        if (!this._inMatch || !this._currentOpponent) return null;
        return {
            opponent: this._currentOpponent,
            player: Sherwood.getPlayer()
        };
    },

    arenaAttack: function() {
        if (!this._inMatch || !this._currentOpponent) {
            return { error: 'Нет активного боя' };
        }

        var player = Sherwood.getPlayer();
        var opp = this._currentOpponent;

        // Проверка, что противник жив
        if (opp.stats.hp <= 0) {
            return this._winMatch({ opponentAlreadyDead: true });
        }

        // Урон игрока
        var playerDamage = Math.max(1, player.stats.attack - opp.stats.defense + Math.floor(Math.random() * 15));
        opp.stats.hp -= playerDamage;
        opp.stats.hp = Math.max(0, opp.stats.hp);

        var result = {
            playerDamage: playerDamage,
            opponentHp: opp.stats.hp,
            opponentMaxHp: opp.stats.maxHp,
            opponentDead: opp.stats.hp <= 0,
            isPlayerTurn: true
        };

        // Проверка победы
        if (opp.stats.hp <= 0) {
            return this._winMatch(result);
        }

        // Урон противника
        var oppDamage = Math.max(1, opp.stats.attack - player.stats.defense + Math.floor(Math.random() * 15));
        player.stats.hp = Math.max(0, player.stats.hp - oppDamage);

        result.opponentDamage = oppDamage;
        result.playerHp = player.stats.hp;
        result.playerDead = player.stats.hp <= 0;

        // Проверка поражения
        if (player.stats.hp <= 0) {
            return this._loseMatch(result);
        }

        Sherwood.saveGame();
        return result;
    },

    _winMatch: function(result) {
        this._wins++;
        var reward = this._currentOpponent.reward || { exp: 50, gold: 30, silver: 50 };

        Sherwood.addExp(reward.exp);
        Sherwood.addResource('gold', reward.gold);
        if (reward.silver) Sherwood.addResource('silver', reward.silver);

        // Доп. бонус за победу над сильным противником
        var bonus = Math.floor((this._currentOpponent.stats.attack - Sherwood.getPlayer().stats.attack) / 5);
        if (bonus > 0) {
            Sherwood.addResource('gold', bonus * 2);
            Sherwood.addExp(bonus * 3);
            reward.bonus = bonus;
        }

        this._updateRank();

        var player = Sherwood.getPlayer();
        if (player) {
            player.arena.wins = this._wins;
            player.arena.rank = this._rank;
            // Восстанавливаем HP
            player.stats.hp = player.stats.maxHp;
            Sherwood.saveGame();
        }

        this._inMatch = false;
        var opponent = this._currentOpponent;
        this._currentOpponent = null;

        result.win = true;
        result.rewards = reward;
        result.newRank = this._rank;
        result.opponent = opponent;
        return result;
    },

    _loseMatch: function(result) {
        this._losses++;

        var player = Sherwood.getPlayer();
        if (player) {
            player.arena.losses = this._losses;
            // Восстанавливаем 20% HP
            player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.2));
            Sherwood.saveGame();
        }

        this._inMatch = false;
        this._currentOpponent = null;

        result.win = false;
        return result;
    },

    _updateRank: function() {
        var newRank = this._rank;
        var rankIndex = this.RANKS.indexOf(this._rank);

        for (var i = 0; i < this.RANK_THRESHOLDS.length; i++) {
            if (this._wins >= this.RANK_THRESHOLDS[i]) {
                newRank = this.RANKS[i];
            }
        }

        if (newRank !== this._rank) {
            this._rank = newRank;
            // Обновляем в игроке
            var player = Sherwood.getPlayer();
            if (player && player.arena) {
                player.arena.rank = this._rank;
                Sherwood.saveGame();
            }
            Sherwood.dispatch({
                type: 'ARENA_RANK_UP',
                payload: { oldRank: this._rank, newRank: newRank }
            });
        }
    },

    fleeMatch: function() {
        if (!this._inMatch) return { success: false, reason: 'Нет активного боя' };

        // Убегаем без боя — засчитывается как поражение
        var result = {
            playerDamage: 0,
            opponentDamage: 0,
            playerHp: Sherwood.getPlayer().stats.hp,
            opponentHp: this._currentOpponent.stats.hp,
            fled: true
        };

        return this._loseMatch(result);
    },

    refreshOpponents: function() {
        this._generateOpponents();
        return { success: true };
    },

    isInMatch: function() {
        return this._inMatch;
    },

    // Получить информацию о текущем ранге
    getRankInfo: function() {
        var rankIndex = this.RANKS.indexOf(this._rank);
        var nextRank = rankIndex < this.RANKS.length - 1 ? this.RANKS[rankIndex + 1] : null;
        var nextWins = rankIndex < this.RANK_THRESHOLDS.length - 1 ? this.RANK_THRESHOLDS[rankIndex + 1] : this._wins;
        var progress = Math.min(100, Math.round((this._wins / (nextWins || 1)) * 100));

        return {
            currentRank: this._rank,
            nextRank: nextRank,
            wins: this._wins,
            winsNeeded: nextWins - this._wins,
            progress: progress
        };
    },

    // Добавить искусственного противника (для тестирования)
    addCustomOpponent: function(name, attack, defense, hp) {
        this._opponents.push({
            id: 'custom_' + Date.now(),
            name: name || 'Тестовый противник',
            skin: 'assets/hero_skins/skin_1_basic.png',
            stats: {
                attack: attack || 20,
                defense: defense || 10,
                hp: hp || 100,
                maxHp: hp || 100
            },
            reward: { exp: 60, gold: 40, silver: 60 }
        });
        return this._opponents;
    }
};

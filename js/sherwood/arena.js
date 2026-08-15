/**
 * Sherwood Arena — PvP Арена
 * Полная боевая логика — боты как живые игроки
 */

Sherwood.Arena = {
    _opponents: [],
    _currentOpponent: null,
    _inMatch: false,
    _playerBattleHp: 0,
    _playerBattleMaxHp: 0,
    _wins: 0,
    _losses: 0,
    _rank: 'Новичок',
    _tickets: 15,
    _maxTickets: 15,
    _boughtExtraToday: false,

    RANKS: ['Новичок', 'Боец', 'Ветеран', 'Мастер', 'Чемпион', 'Легенда'],
    RANK_THRESHOLDS: [0, 10, 30, 60, 100, 200],
    SKIN_FILES: ['skin1_01', 'skin1_02', 'skin1_03', 'skin2_01', 'skin2_02', 'skin2_03', 'skin3_01', 'skin3_02', 'skin3_03', 'skin4_01', 'skin4_02', 'skin4_03', 'skin5_01', 'skin5_02', 'skin5_03', 'skin6_01', 'skin6_02', 'skin6_03', 'skin7_01', 'skin7_02', 'skin7_03', 'skin8_01', 'skin8_02', 'skin8_03', 'skin9_01', 'skin9_02', 'skin9_03', 'skin10_01', 'skin10_02', 'skin10_03', 'skin11_01', 'skin11_02', 'skin11_03', 'skin12_01', 'skin12_02', 'skin12_03', 'skin13_01', 'skin13_02', 'skin13_03', 'skin14_01', 'skin14_02', 'skin14_03', 'skin15_01', 'skin15_02', 'skin15_03', 'skin16_01', 'skin16_02', 'skin16_03'],

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        
        if (!player.arena) {
            player.arena = { 
                wins: 0, 
                losses: 0, 
                rank: 'Новичок', 
                tickets: 15, 
                maxTickets: 15, 
                lastTicketDate: '', 
                boughtExtraToday: false 
            };
        }
        
        var today = new Date().toDateString();
        
        if (player.arena.lastTicketDate !== today) {
            player.arena.tickets = 15;
            player.arena.maxTickets = 15;
            player.arena.lastTicketDate = today;
            player.arena.boughtExtraToday = false;
            Sherwood.saveGame();
        }
        
        this._tickets = player.arena.tickets || 15;
        this._maxTickets = player.arena.maxTickets || 15;
        this._wins = player.arena.wins || 0;
        this._losses = player.arena.losses || 0;
        this._rank = player.arena.rank || 'Новичок';
        this._boughtExtraToday = player.arena.boughtExtraToday || false;
        
        this._generateOpponents();
    },

    _generateOpponents: function() {
        this._opponents = [];
        var player = Sherwood.getPlayer();
        if (!player) return;

        var usedSkins = {};
        
        for (var i = 0; i < 3; i++) {
            var diff = Math.floor(Math.random() * 20) - 10;
            var attack = Math.max(10, player.stats.attack + diff);
            var defense = Math.max(5, player.stats.defense + Math.floor(diff / 2));
            var hp = Math.max(50, player.stats.maxHp + diff * 5);

            var skinIndex;
            var attempts = 0;
            do {
                skinIndex = Math.floor(Math.random() * this.SKIN_FILES.length);
                attempts++;
            } while (usedSkins[skinIndex] && attempts < 50);
            usedSkins[skinIndex] = true;
            
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
            totalMatches: this._wins + this._losses,
            tickets: this._tickets,
            maxTickets: this._maxTickets
        };
    },

    getTickets: function() {
        return this._tickets;
    },

    spendTicket: function() {
        if (this._tickets <= 0) return false;
        this._tickets--;
        var player = Sherwood.getPlayer();
        if (player && player.arena) {
            player.arena.tickets = this._tickets;
            Sherwood.saveGame();
        }
        return true;
    },

    refreshOpponents: function() {
        this._generateOpponents();
        return { success: true };
    },

    isInMatch: function() {
        return this._inMatch;
    },

    canBuyExtraTickets: function() {
        return !this._boughtExtraToday;
    },

    buyExtraTickets: function() {
        var player = Sherwood.getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };
        
        if (this._boughtExtraToday) {
            return { success: false, reason: 'Доп. тикеты уже куплены сегодня' };
        }
        
        if ((player.resources.gold || 0) < 200) {
            return { success: false, reason: 'Нужно 200 золота' };
        }
        
        player.resources.gold -= 200;
        this._tickets += 5;
        this._boughtExtraToday = true;
        
        if (!player.arena) player.arena = {};
        player.arena.tickets = this._tickets;
        player.arena.boughtExtraToday = this._boughtExtraToday;
        Sherwood.saveGame();
        
        return { success: true, ticketsAdded: 5, newTotal: this._tickets };
    },

    // Начать бой
    startMatch: function() {
        if (this._inMatch) return { success: false, reason: 'Бой уже идёт' };
        if (this._tickets <= 0) return { success: false, reason: 'Нет тикетов' };
        
        if (this._opponents.length === 0) this._generateOpponents();
        
        this.spendTicket();
        
        var player = Sherwood.getPlayer();
        this._currentOpponent = this._opponents[0];
        this._playerBattleHp = player.stats.hp;
        this._playerBattleMaxHp = player.stats.maxHp;
        this._inMatch = true;
        
        return { success: true, opponent: this._currentOpponent };
    },

    // Атака игрока
    playerAttack: function(chargePercent) {
        if (!this._inMatch || !this._currentOpponent) return { error: 'Нет боя' };
        
        var player = Sherwood.getPlayer();
        var opp = this._currentOpponent;
        
        if (opp.stats.hp <= 0) {
            return this.switchTarget();
        }
        
        if (chargePercent < 0.05) chargePercent = 0.05;
        
        var minDamage = Math.max(1, Math.floor((player.stats.attack - opp.stats.defense) * 0.3));
        var maxDamage = Math.max(minDamage + 1, Math.floor((player.stats.attack - opp.stats.defense) * 1.2));
        var damage = Math.floor(minDamage + (maxDamage - minDamage) * chargePercent);
        
        var crit = chargePercent >= 1 && Math.random() * 100 < 20;
        if (crit) damage = Math.floor(damage * 1.8);
        
        opp.stats.hp -= damage;
        if (opp.stats.hp < 0) opp.stats.hp = 0;
        
        var result = {
            damage: damage,
            crit: crit,
            enemyHp: opp.stats.hp,
            enemyMaxHp: opp.stats.maxHp,
            enemyName: opp.name,
            enemyDead: opp.stats.hp <= 0
        };
        
        // Враг убит
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
                return result;
            }
            
            this._currentOpponent = aliveBots[0];
            result.nextEnemy = aliveBots[0];
            Sherwood.saveGame();
            return result;
        }
        
        // Боты бьют ВСЕХ (включая игрока)
        var botsResult = this._botsFight();
        
        if (botsResult.playerDead) {
            result.playerDead = true;
            result.rewards = { exp: 20, silver: 50 };
            this._losses++;
            this._saveStats();
            player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.2));
            Sherwood.saveGame();
            this._inMatch = false;
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
            return result;
        }
        
        // Контрудар текущего противника (если жив)
        if (this._currentOpponent && this._currentOpponent.stats.hp > 0) {
            var oppDamage = Math.max(1, Math.floor((this._currentOpponent.stats.attack - player.stats.defense) * 0.5 + Math.random() * 10));
            this._playerBattleHp -= oppDamage;
            player.stats.hp = Math.max(0, this._playerBattleHp);
            result.enemyDamage = oppDamage;
            result.playerHp = player.stats.hp;
            
            if (player.stats.hp <= 0) {
                result.playerDead = true;
                result.rewards = { exp: 20, silver: 50 };
                this._losses++;
                this._saveStats();
                player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.2));
                Sherwood.saveGame();
                this._inMatch = false;
                return result;
            }
        }
        
        Sherwood.saveGame();
        return result;
    },

    // Боты бьют ВСЕХ: друг друга И игрока
    _botsFight: function() {
        var player = Sherwood.getPlayer();
        
        for (var i = 0; i < this._opponents.length; i++) {
            var attacker = this._opponents[i];
            if (!attacker || attacker.stats.hp <= 0) continue;
            
            var targets = [];
            
            // Другие боты
            for (var j = 0; j < this._opponents.length; j++) {
                if (i !== j && this._opponents[j].stats.hp > 0) {
                    targets.push({ type: 'bot', index: j });
                }
            }
            
            // Игрок
            if (player.stats.hp > 0) {
                targets.push({ type: 'player' });
            }
            
            if (targets.length === 0) continue;
            
            var target = targets[Math.floor(Math.random() * targets.length)];
            var botDamage = Math.max(1, Math.floor(attacker.stats.attack * 0.3 + Math.random() * 20));
            
            if (target.type === 'bot') {
                this._opponents[target.index].stats.hp = Math.max(0, this._opponents[target.index].stats.hp - botDamage);
            } else if (target.type === 'player') {
                this._playerBattleHp -= botDamage;
                player.stats.hp = Math.max(0, this._playerBattleHp);
            }
        }
        
        if (player.stats.hp <= 0) {
            return { playerDead: true };
        }
        
        var aliveBots = this._opponents.filter(function(o) { return o.stats.hp > 0; });
        if (aliveBots.length === 0) {
            return { allBotsDead: true };
        }
        
        return { ok: true };
    },

    // Смена цели
    switchTarget: function() {
        if (!this._inMatch) return { success: false, reason: 'Нет боя' };
        
        var aliveBots = [];
        for (var i = 0; i < this._opponents.length; i++) {
            if (this._opponents[i].stats.hp > 0 && this._opponents[i] !== this._currentOpponent) {
                aliveBots.push(this._opponents[i]);
            }
        }
        
        if (aliveBots.length === 0) {
            return { success: false, reason: 'Нет других целей' };
        }
        
        this._currentOpponent = aliveBots[0];
        return { success: true, opponent: this._currentOpponent };
    },

    // Состояние боя
    getBattleState: function() {
        if (!this._inMatch || !this._currentOpponent) return null;
        
        return {
            opponent: this._currentOpponent,
            playerHp: this._playerBattleHp,
            playerMaxHp: this._playerBattleMaxHp
        };
    },

    // Завершение боя
    endMatch: function() {
        this._inMatch = false;
        this._currentOpponent = null;
        this._playerBattleHp = 0;
        this._playerBattleMaxHp = 0;
        Sherwood.saveGame();
    },

    // Побег
    fleeMatch: function() {
        this._inMatch = false;
        this._currentOpponent = null;
        Sherwood.saveGame();
        return { success: true };
    },

    // Награды за победу
    _getWinRewards: function() {
        var rankIndex = this.RANKS.indexOf(this._rank);
        if (rankIndex < 0) rankIndex = 0;
        return {
            exp: 150 + rankIndex * 50,
            gold: 80 + rankIndex * 30,
            silver: 200 + rankIndex * 100
        };
    },

    // Обновление ранга
    _updateRank: function() {
        var newRank = this._rank;
        for (var i = this.RANK_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this._wins >= this.RANK_THRESHOLDS[i]) {
                newRank = this.RANKS[i];
                break;
            }
        }
        this._rank = newRank;
    },

    // Сохранение статистики
    _saveStats: function() {
        var player = Sherwood.getPlayer();
        if (player && player.arena) {
            player.arena.wins = this._wins;
            player.arena.losses = this._losses;
            player.arena.rank = this._rank;
            Sherwood.saveGame();
        }
    }
};

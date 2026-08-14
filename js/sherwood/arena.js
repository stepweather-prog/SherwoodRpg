/**
 * Sherwood Arena — PvP Арена
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
    SKIN_FILES: ['skin1_01', 'skin1_02', 'skin1_03', 'skin2_01', 'skin2_02', 'skin2_03', 'skin3_01', 'skin3_02', 'skin3_03', 'skin4_01', 'skin4_02', 'skin4_03', 'skin5_01', 'skin5_02', 'skin5_03', 'skin6_01', 'skin6_02', 'skin6_03', 'skin7_01', 'skin7_02', 'skin7_03', 'skin8_01', 'skin8_02', 'skin8_03', 'skin9_01', 'skin9_02', 'skin9_03', 'skin10_01', 'skin10_02', 'skin10_03', 'skin11_01', 'skin11_02', 'skin11_03', 'skin12_01', 'skin12_02', 'skin12_03', 'skin13_01', 'skin13_02', 'skin13_03', 'skin14_01', 'skin14_02', 'skin14_03', 'skin15_01', 'skin15_02', 'skin15_03', 'skin16_01', 'skin16_02', 'skin16_03'],

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

    refreshOpponents: function() {
        this._generateOpponents();
        return { success: true };
    },

    isInMatch: function() {
        return this._inMatch;
    }
};

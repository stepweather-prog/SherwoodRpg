Sherwood.Dungeon = {
    _dungeon: null,

    // === ПРОГРЕСС ПОДЗЕМКИ ===
    _ensureProgress: function() {
        var p = Sherwood.getPlayer();
        if (!p) return null;
        if (!p.dungeonProgress) p.dungeonProgress = {};
        if (!p.dungeonProgress.byDungeon) p.dungeonProgress.byDungeon = {};
        if (!p.dungeonProgress.floors || p.dungeonProgress.floors.length !== 6) {
            p.dungeonProgress.floors = [
                { cups: 0 }, { cups: 0 }, { cups: 0 },
                { cups: 0 }, { cups: 0 }, { cups: 0 }
            ];
        }
        return p.dungeonProgress;
    },

    getFloorCups: function(floor) {
        var prog = this._ensureProgress();
        if (!prog) return 0;
        return prog.floors[floor - 1].cups || 0;
    },

    isFloorAvailable: function(floor, diff) {
        var prog = this._ensureProgress();
        if (!prog) return false;
        var N = floor, K = diff;
        if (N < 1 || N > 6 || K < 1 || K > 3) return false;
        var thisCups = prog.floors[N - 1].cups || 0;
        var prevCups = (N > 1) ? (prog.floors[N - 2].cups || 0) : 0;
        if (K === 1) {
            if (N === 1) return true;
            return prevCups >= 2;
        }
        if (K === 2) return thisCups >= 1;
        if (K === 3) return thisCups >= 2;
        return false;
    },

    grantCup: function(floor, diff) {
        var prog = this._ensureProgress();
        if (!prog) return;
        var cur = prog.floors[floor - 1].cups || 0;
        if (diff > cur) prog.floors[floor - 1].cups = diff;
        Sherwood.saveGame();
        console.log('🏆 Кубок выдан: этаж ' + floor + ', сложность ' + diff);
    },

    getTotalCups: function() {
        var prog = this._ensureProgress();
        if (!prog) return 0;
        var total = 0;
        for (var i = 0; i < prog.floors.length; i++) {
            total += prog.floors[i].cups || 0;
        }
        return total;
    },

    // === БИЛЕТЫ ===
    getEntranceTickets: function() {
        if (Sherwood.Bag && Sherwood.Bag.getTicketCount) return Sherwood.Bag.getTicketCount('entrance');
        return 0;
    },
    spendEntranceTicket: function() {
        if (Sherwood.Bag && Sherwood.Bag.removeItem) {
            var items = Sherwood.Bag.getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === 'entrance_ticket') {
                    Sherwood.Bag.removeItem(i, 1);
                    return true;
                }
            }
        }
        return false;
    },

    getAutoFightTickets: function() {
        if (Sherwood.Bag && Sherwood.Bag.getTicketCount) return Sherwood.Bag.getTicketCount('autofight');
        return 0;
    },
    spendAutoFightTicket: function() {
        if (Sherwood.Bag && Sherwood.Bag.removeItem) {
            var items = Sherwood.Bag.getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === 'autofight_ticket') {
                    Sherwood.Bag.removeItem(i, 1);
                    return true;
                }
            }
        }
        return false;
    },

    // === ДОКУПКА ===
    getBuyTicketCost: function(type) {
        var p = Sherwood.getPlayer();
        if (!p) return 0;
        if (!p._ticketBuyCount) p._ticketBuyCount = { entrance: 0, autofight: 0 };
        var count = p._ticketBuyCount[type] || 0;
        if (type === 'entrance') return 30 + Math.floor(count / 3) * 5;
        return 20 + Math.floor(count / 3) * 5;
    },

    buyTicket: function(type) {
        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };
        var cost = this.getBuyTicketCost(type);
        if ((p.resources.gold || 0) < cost) return { success: false, reason: 'Не хватает ' + cost + ' золота' };
        p.resources.gold -= cost;
        if (!p._ticketBuyCount) p._ticketBuyCount = { entrance: 0, autofight: 0 };
        p._ticketBuyCount[type] = (p._ticketBuyCount[type] || 0) + 1;
        if (type === 'entrance') Sherwood.Bag._addAsItem('entranceTickets', 1);
        else Sherwood.Bag._addAsItem('autoFightTickets', 1);
        Sherwood.saveGame();
        return { success: true, cost: cost };
    },

    // === АВТОБОЙ ===
    startAutoFight: function(floor, diff) {
        var cups = this.getFloorCups(floor);
        if (cups < diff) return { success: false, reason: 'Этаж не пройден на этой сложности' };
        if (!this.spendAutoFightTicket()) {
            return { success: false, reason: 'Нет билетов автобоя! Докупить за ' + this.getBuyTicketCost('autofight') + ' золота?' };
        }
        var self = this;
        setTimeout(function() {
            self.grantCup(floor, diff);
            var p = Sherwood.getPlayer();
            if (p) {
                p.resources.gold = (p.resources.gold || 0) + 100;
                p.resources.silver = (p.resources.silver || 0) + 50;
                if (Sherwood.addExp) Sherwood.addExp(200);
                Sherwood.saveGame();
            }
            UI._showToast('✅ Автобой завершён! Этаж ' + floor + ', сложность ' + diff);
        }, 3000);
        return { success: true };
    },

    startFreeAutoFight: function(floor, diff) {
        var cups = this.getFloorCups(floor);
        if (cups < diff) return { success: false, reason: 'Этаж не пройден на этой сложности' };
        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };
        if (!p._freeAutoFightTimers) p._freeAutoFightTimers = {};
        var key = floor + '_' + diff;
        if (p._freeAutoFightTimers[key]) return { success: false, reason: 'Уже идёт автобой' };
        p._freeAutoFightTimers[key] = Date.now() + 15 * 60 * 1000;
        Sherwood.saveGame();
        UI._showToast('⏳ Бесплатный автобой начат. Награды через 15 минут.');
        return { success: true };
    },

    checkFreeAutoFights: function() {
        var p = Sherwood.getPlayer();
        if (!p || !p._freeAutoFightTimers) return;
        var now = Date.now();
        for (var key in p._freeAutoFightTimers) {
            if (now >= p._freeAutoFightTimers[key]) {
                var parts = key.split('_');
                var floor = parseInt(parts[0]);
                var diff = parseInt(parts[1]);
                this.grantCup(floor, diff);
                p.resources.gold = (p.resources.gold || 0) + 100;
                p.resources.silver = (p.resources.silver || 0) + 50;
                if (Sherwood.addExp) Sherwood.addExp(200);
                delete p._freeAutoFightTimers[key];
                UI._showToast('✅ Бесплатный автобой завершён! Этаж ' + floor);
            }
        }
        Sherwood.saveGame();
    },

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        this._ensureProgress();
        Sherwood.saveGame();
        console.log('🏚️ Dungeon логика инициализирована');
    }
};

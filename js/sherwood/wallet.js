/**
 * Sherwood Wallet — Кошелёк (кесет, сейф-копилка)
 *
 * Копилка — сам кошелёк ЦЕЛИКОМ: после прохождения этажа подземки
 * 25% заработанного серебра добавляется к общему накоплению.
 *
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Wallet = {
    CELLS: 6,
    CELL_CAPACITY: 20000,
    RUN_PERCENT: 25,

    _state: function () {
        var p = Sherwood.getPlayer();
        if (!p) return null;
        if (!p.keset || typeof p.keset !== 'object') p.keset = {};

        var total = 0;

        if (typeof p.keset.totalSilver === 'number' && isFinite(p.keset.totalSilver)) {
            total = Math.max(0, Math.floor(p.keset.totalSilver));
        }

        // Миграция старых форматов (массив ячеек): числа или {type, amount}.
        // Берём максимум из totalSilver и суммы ячеек — ничего не теряется.
        if (p.keset.cells && p.keset.cells.length) {
            var cellsSum = 0;
            for (var i = 0; i < p.keset.cells.length; i++) {
                var c = p.keset.cells[i];
                if (typeof c === 'number' && isFinite(c)) cellsSum += Math.max(0, Math.floor(c));
                else if (c && typeof c === 'object' && c.type === 'silver' && isFinite(c.amount)) cellsSum += Math.max(0, Math.floor(c.amount));
            }
            if (cellsSum > total) total = cellsSum;
        }

        if (p.keset.cells) delete p.keset.cells;

        p.keset.totalSilver = total;
        return p.keset;
    },

    getInfo: function () {
        var st = this._state();
        if (!st) return { total: 0, capacity: this.CELLS * this.CELL_CAPACITY, isFull: false, filledCells: 0, cells: [] };
        var capacity = this.CELLS * this.CELL_CAPACITY;
        var total = Math.min(st.totalSilver, capacity);
        var cells = [];
        var remaining = total;
        for (var i = 0; i < this.CELLS; i++) {
            var inCell = Math.max(0, Math.min(this.CELL_CAPACITY, remaining));
            cells.push(inCell);
            remaining -= inCell;
        }
        return {
            total: total,
            capacity: capacity,
            isFull: st.totalSilver >= capacity,
            filledCells: cells.filter(function (v) { return v >= Sherwood.Wallet.CELL_CAPACITY; }).length,
            cells: cells
        };
    },

    addFromRun: function (gold, silver) {
        var share = Math.floor(((silver || 0) * this.RUN_PERCENT) / 100);
        if (share <= 0) return { success: true, stored: 0, overflow: 0, isFull: this.getInfo().isFull };
        return this.addSilver(share);
    },

    addSilver: function (amount) {
        var st = this._state();
        if (!st || !(amount > 0)) return { success: false, stored: 0, overflow: 0, isFull: this.getInfo().isFull };
        var capacity = this.CELLS * this.CELL_CAPACITY;
        var free = capacity - st.totalSilver;
        var stored = Math.min(Math.floor(amount), Math.max(0, free));
        st.totalSilver += stored;
        var overflow = Math.floor(amount) - stored;
        Sherwood.saveGame();
        return { success: true, stored: stored, overflow: overflow, isFull: st.totalSilver >= capacity };
    },

    withdrawAll: function () {
        var info = this.getInfo();
        if (!info.isFull) {
            return { success: false, reason: 'Заполни все ' + this.CELLS + ' ячейки, чтобы забрать серебро' };
        }
        var st = this._state();
        var total = info.total;
        Sherwood.addResource('silver', total);
        st.totalSilver = 0;
        Sherwood.saveGame();
        return { success: true, withdrawn: total };
    }
};

// ============================================================
//  UI КОШЕЛЬКА (замена UI.wallet из ui_screens.js)
// ============================================================
(function () {
    if (typeof UI === 'undefined') return;

    UI.wallet = function () {
        UI._playSound('click');
        var info = Sherwood.Wallet.getInfo();

        var h = '<div style="text-align:center;padding:10px;">';
        h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:4px;">Кошелёк</div>';
        h += '<div style="color:#c0c0c0;font-size:0.9em;margin-bottom:12px;">Накоплено: <span style="color:#e0e0ff;font-weight:bold;">' + info.total + '</span> / ' + info.capacity + ' серебра</div>';

        h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:300px;margin:0 auto 20px;">';
        for (var i = 0; i < info.cells.length; i++) {
            var cellSilver = info.cells[i];
            var pct = Math.min(100, Math.round((cellSilver / Sherwood.Wallet.CELL_CAPACITY) * 100));
            var full = pct >= 100;
            h += '<div style="position:relative;width:86px;height:86px;background:url(\'assets/interface/wallet_cell.png\') center/contain no-repeat;background-size:cover;border:2px solid ' + (full ? '#ffd700' : (cellSilver > 0 ? '#c9a040' : '#555')) + ';border-radius:8px;display:flex;align-items:center;justify-content:center;box-sizing:border-box;">';
            if (cellSilver > 0) {
                h += '<img src="assets/interface/resource_silver.png" style="width:44px;height:44px;object-fit:contain;opacity:' + (0.3 + (pct / 100) * 0.7) + ';">';
                h += '<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.65em;font-weight:bold;text-shadow:0 0 4px #000;">' + pct + '%</span>';
            }
            h += '</div>';
        }
        h += '</div>';

        if (info.isFull) {
            h += '<button onclick="UI._withdrawWallet()" style="background:#c9a040;border:none;border-radius:8px;padding:14px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:0.95em;margin-bottom:8px;">Забрать всё: ' + info.total + ' серебра</button>';
        } else {
            h += '<div style="color:#888;font-size:0.85em;margin-bottom:8px;">Заполни все ячейки, чтобы забрать серебро</div>';
            h += '<div style="color:#6b5a3a;font-size:0.8em;">25% серебра за этаж подземки падает сюда</div>';
        }
        h += '</div>';

        UI._openScreen('Кошелёк', 'profile', h, 'UI.profile()');
    };

    UI._withdrawWallet = function () {
        var r = Sherwood.Wallet.withdrawAll();
        if (r.success) {
            UI._showToast('💰 Забрано ' + r.withdrawn + ' серебра!');
            UI.updateDisplay();
            UI.wallet();
        } else {
            UI._showToast(r.reason);
        }
    };

    UI._addWalletSilver = function (amount) {
        Sherwood.Wallet.addSilver(amount);
    };
})();

window.Sherwood = window.Sherwood || {};
window.Sherwood.Wallet = Sherwood.Wallet;

console.log('💰 Кошелёк загружен!');

/**
 * Sherwood Wallet — Кесет (кошелёк)
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Wallet = {
    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.keset) {
            p.keset = { cells: [], totalSilver: 0 };
        }
        if (!p.keset.cells || p.keset.cells.length === 0) {
            p.keset.cells = [];
            for (var i = 0; i < 6; i++) p.keset.cells.push(0);
            p.keset.totalSilver = 0;
            Sherwood.saveGame();
        }
        console.log('👛 Кесет инициализирован');
    },

    getTotal: function() {
        var p = Sherwood.getPlayer();
        if (!p || !p.keset) return 0;
        var total = 0;
        for (var i = 0; i < p.keset.cells.length; i++) {
            total += p.keset.cells[i];
        }
        return total;
    },

    getCells: function() {
        var p = Sherwood.getPlayer();
        if (!p || !p.keset) return [];
        return p.keset.cells;
    },

    addSilver: function(amount) {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.keset) {
            p.keset = { cells: [], totalSilver: 0 };
        }
        if (!p.keset.cells || p.keset.cells.length === 0) {
            p.keset.cells = [];
            for (var i = 0; i < 6; i++) p.keset.cells.push(0);
        }
        var maxPerCell = 20000;
        var remaining = amount;
        for (var i = 0; i < p.keset.cells.length && remaining > 0; i++) {
            var space = maxPerCell - p.keset.cells[i];
            if (space > 0) {
                var add = Math.min(remaining, space);
                p.keset.cells[i] += add;
                remaining -= add;
            }
        }
        p.keset.totalSilver = 0;
        for (var i = 0; i < p.keset.cells.length; i++) {
            p.keset.totalSilver += p.keset.cells[i];
        }
        Sherwood.saveGame();
    },

    withdraw: function() {
        var p = Sherwood.getPlayer();
        if (!p || !p.keset) return { success: false, reason: 'Нет данных' };
        var total = this.getTotal();
        if (total < 100000) {
            return { success: false, reason: 'Минимум 100,000 серебра для снятия' };
        }
        Sherwood.addResource('silver', total);
        for (var i = 0; i < p.keset.cells.length; i++) {
            p.keset.cells[i] = 0;
        }
        p.keset.totalSilver = 0;
        Sherwood.saveGame();
        return { success: true, amount: total };
    },

    // ========== UI ==========

    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Кошелёк', '👛');
            }
            return;
        }
        UI._playSound('click');

        var p = Sherwood.getPlayer();
        if (!p || !p.keset) {
            UI._showToast('❌ Нет данных');
            return;
        }

        var cells = p.keset.cells;
        var total = this.getTotal();

        var h = '<div style="padding:20px;text-align:center;max-width:400px;margin:0 auto;">';
        h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:4px;">👛 Кесет</div>';
        h += '<div style="color:#c0c0c0;font-size:0.9em;margin-bottom:16px;">Накоплено: <span style="color:#ffd700;font-weight:bold;">' + total + '</span> серебра</div>';

        h += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:220px;margin:0 auto 20px;">';
        for (var i = 0; i < cells.length; i++) {
            var cellSilver = cells[i];
            var pct = Math.min(100, Math.round((cellSilver / 20000) * 100));
            h += '<div style="position:relative;width:100px;height:100px;background:url(\'assets/interface/wallet_cell.png\') center/contain no-repeat;background-size:cover;border:2px solid ' + (cellSilver > 0 ? '#ffd700' : '#555') + ';border-radius:8px;display:flex;align-items:center;justify-content:center;">';
            if (cellSilver > 0) {
                h += '<img src="assets/interface/resource_silver.png" style="width:40px;height:40px;object-fit:contain;opacity:' + (0.3 + (pct / 100) * 0.7) + ';">';
                h += '<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.5em;font-weight:bold;text-shadow:0 0 4px #000;">' + pct + '%</span>';
            }
            h += '</div>';
        }
        h += '</div>';

        if (total >= 100000) {
            h += '<button onclick="Sherwood.Wallet._withdrawFromUI()" class="btn btn-gold" style="padding:12px 30px;font-size:1em;font-weight:bold;width:100%;">💰 Забрать ' + total + ' серебра</button>';
        } else {
            h += '<div style="color:#888;font-size:0.8em;">Нужно минимум 100,000 серебра для снятия</div>';
        }
        h += '</div>';

        UI._openScreenScrollable('👛 Кошелёк', 'wallet', h);
    },

    _withdrawFromUI: function() {
        var r = this.withdraw();
        if (r.success) {
            UI._playSound('loot_fly');
            UI._showToast('✅ Забрано ' + r.amount + ' серебра!');
            UI.updateDisplay();
            this.showUI();
        } else {
            UI._showToast('❌ ' + r.reason);
        }
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Wallet = Sherwood.Wallet;

console.log('👛 Кошелёк загружен!');

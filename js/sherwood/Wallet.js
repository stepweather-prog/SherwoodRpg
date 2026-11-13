/**
 * Sherwood Wallet — Кесет (сейф-копилка)
 *  — при прохождении этажа сюда падает рандомно золото или серебро
 *  — не более 50% от полученного за проходку
 *  — одна ячейка = одно попадание (без лимита, без долива)
 *  — когда все 6 ячеек заняты, можно забрать всё
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Wallet = {
    CELLS_COUNT: 6,

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.keset) {
            p.keset = { cells: [], totalGold: 0, totalSilver: 0 };
        }
        if (!p.keset.cells || p.keset.cells.length === 0) {
            p.keset.cells = [];
            for (var i = 0; i < this.CELLS_COUNT; i++) {
                p.keset.cells.push({ type: null, amount: 0 });
            }
            p.keset.totalGold = 0;
            p.keset.totalSilver = 0;
            Sherwood.saveGame();
        }
        // Миграция со старого формата
        for (var i = 0; i < p.keset.cells.length; i++) {
            if (typeof p.keset.cells[i] === 'number') {
                p.keset.cells[i] = { type: null, amount: 0 };
            }
        }
        console.log('👛 Кесет инициализирован');
    },

    getTotalGold: function() {
        var p = Sherwood.getPlayer();
        if (!p || !p.keset) return 0;
        var total = 0;
        for (var i = 0; i < p.keset.cells.length; i++) {
            if (p.keset.cells[i].type === 'gold') total += p.keset.cells[i].amount;
        }
        return total;
    },

    getTotalSilver: function() {
        var p = Sherwood.getPlayer();
        if (!p || !p.keset) return 0;
        var total = 0;
        for (var i = 0; i < p.keset.cells.length; i++) {
            if (p.keset.cells[i].type === 'silver') total += p.keset.cells[i].amount;
        }
        return total;
    },

    getCells: function() {
        var p = Sherwood.getPlayer();
        if (!p || !p.keset) return [];
        return p.keset.cells;
    },

    isFull: function() {
        var p = Sherwood.getPlayer();
        if (!p || !p.keset) return false;
        for (var i = 0; i < p.keset.cells.length; i++) {
            if (p.keset.cells[i].type === null) return false;
        }
        return true;
    },

    /**
     * Кладёт награду в первую свободную ячейку.
     * @param {string} type — 'gold' или 'silver'
     * @param {number} amount — сколько класть
     * @returns {boolean} — удалось ли
     */
    _addToFreeCell: function(type, amount) {
        if (!amount || amount <= 0) return false;
        var p = Sherwood.getPlayer();
        if (!p || !p.keset) return false;

        for (var i = 0; i < p.keset.cells.length; i++) {
            if (p.keset.cells[i].type === null) {
                p.keset.cells[i].type = type;
                p.keset.cells[i].amount = amount;
                p.keset.totalGold = this.getTotalGold();
                p.keset.totalSilver = this.getTotalSilver();
                Sherwood.saveGame();
                return true;
            }
        }
        return false; // нет свободных ячеек
    },

    /**
     * Вызывается после прохождения этажа.
     * @param {number} goldEarned — сколько золота дали за проходку
     * @param {number} silverEarned — сколько серебра дали за проходку
     * @returns {object} { goldAdded, silverAdded, cellUsed }
     */
    addFromRun: function(goldEarned, silverEarned) {
        var result = { goldAdded: 0, silverAdded: 0, cellUsed: false };
        if (!goldEarned && !silverEarned) return result;

        var maxGold = Math.floor((goldEarned || 0) * 0.5);
        var maxSilver = Math.floor((silverEarned || 0) * 0.5);

        // Случайно: золото ИЛИ серебро
        if (maxGold > 0 && maxSilver > 0) {
            if (Math.random() < 0.5) {
                var amt = Math.floor(Math.random() * (maxGold + 1));
                if (amt > 0 && this._addToFreeCell('gold', amt)) {
                    result.goldAdded = amt;
                    result.cellUsed = true;
                }
            } else {
                var amt = Math.floor(Math.random() * (maxSilver + 1));
                if (amt > 0 && this._addToFreeCell('silver', amt)) {
                    result.silverAdded = amt;
                    result.cellUsed = true;
                }
            }
        } else if (maxGold > 0) {
            var amt = Math.floor(Math.random() * (maxGold + 1));
            if (amt > 0 && this._addToFreeCell('gold', amt)) {
                result.goldAdded = amt;
                result.cellUsed = true;
            }
        } else if (maxSilver > 0) {
            var amt = Math.floor(Math.random() * (maxSilver + 1));
            if (amt > 0 && this._addToFreeCell('silver', amt)) {
                result.silverAdded = amt;
                result.cellUsed = true;
            }
        }

        return result;
    },

    withdrawAll: function() {
        var p = Sherwood.getPlayer();
        if (!p || !p.keset) return { success: false, reason: 'Нет данных' };

        if (!this.isFull()) {
            return { success: false, reason: 'Кесет ещё не заполнен' };
        }

        var totalGold = this.getTotalGold();
        var totalSilver = this.getTotalSilver();

        if (totalGold > 0) Sherwood.addResource('gold', totalGold);
        if (totalSilver > 0) Sherwood.addResource('silver', totalSilver);

        for (var i = 0; i < p.keset.cells.length; i++) {
            p.keset.cells[i] = { type: null, amount: 0 };
        }
        p.keset.totalGold = 0;
        p.keset.totalSilver = 0;
        Sherwood.saveGame();

        return { success: true, gold: totalGold, silver: totalSilver };
    },

    // ========== UI ==========
    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') showGenericScreen('Кошелёк', '👛');
            return;
        }
        UI._playSound('click');

        var p = Sherwood.getPlayer();
        if (!p || !p.keset) {
            UI._showToast('❌ Нет данных');
            return;
        }

        var cells = p.keset.cells;
        var totalGold = this.getTotalGold();
        var totalSilver = this.getTotalSilver();
        var full = this.isFull();

        var h = '<div style="padding:20px;text-align:center;max-width:400px;margin:0 auto;">';
        h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:4px;">👛 Кесет</div>';
        h += '<div style="color:#c0c0c0;font-size:0.85em;margin-bottom:12px;">';
        h += 'Золото: <span style="color:#ffd700;font-weight:bold;">' + totalGold + '</span> | ';
        h += 'Серебро: <span style="color:#c0c0c0;font-weight:bold;">' + totalSilver + '</span>';
        h += '</div>';

        h += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:220px;margin:0 auto 20px;">';
        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            var isGold = cell.type === 'gold';
            var isSilver = cell.type === 'silver';
            var isEmpty = !cell.type;
            var borderColor = isEmpty ? '#555' : (isGold ? '#ffd700' : '#c0c0c0');
            var icon = isGold ? 'assets/interface/resource_gold.png' : (isSilver ? 'assets/interface/resource_silver.png' : null);

            h += '<div style="position:relative;width:100px;height:100px;background:url(\'assets/interface/wallet_cell.png\') center/contain no-repeat;background-size:cover;border:2px solid ' + borderColor + ';border-radius:8px;display:flex;align-items:center;justify-content:center;">';
            if (icon) {
                h += '<img src="' + icon + '" style="width:40px;height:40px;object-fit:contain;">';
                h += '<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.5em;font-weight:bold;text-shadow:0 0 4px #000;">' + cell.amount + '</span>';
            }
            h += '</div>';
        }
        h += '</div>';

        if (full) {
            h += '<button onclick="Sherwood.Wallet._withdrawFromUI()" class="btn btn-gold" style="padding:12px 30px;font-size:1em;font-weight:bold;width:100%;">💰 Забрать всё (' + totalGold + ' 🪙, ' + totalSilver + ' 🥈)</button>';
        } else {
            h += '<div style="color:#888;font-size:0.8em;">Заполните все ' + this.CELLS_COUNT + ' ячеек, чтобы забрать</div>';
        }
        h += '</div>';

        UI._openScreenScrollable('👛 Кошелёк', 'wallet', h);
    },

    _withdrawFromUI: function() {
        var r = this.withdrawAll();
        if (r.success) {
            UI._playSound('loot_fly');
            UI._showToast('✅ Забрано: ' + r.gold + ' 🪙 и ' + r.silver + ' 🥈');
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

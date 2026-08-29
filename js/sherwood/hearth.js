/**
 * Sherwood Hearth — Очаг Шервуда
 * Бонус +50% к трофеям за 100 дерева
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Hearth = {
    _overlay: null,

    init: function() {
        console.log('🔥 Очаг инициализирован');
    },

    // ========== UI ==========

    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Очаг', '🔥');
            }
            return;
        }
        UI._playSound('click');

        var p = Sherwood.getPlayer();
        if (!p) return;

        var bonusActive = p.hearthBonus && p.hearthBonus.active;
        var bonusEnd = p.hearthBonus ? (p.hearthBonus.endTime || 0) : 0;
        var now = Date.now();
        var cooldownEnd = p.hearthCooldown || 0;

        var wood = 0;
        try {
            var bag = Sherwood.Bag.getItems();
            for (var i = 0; i < bag.length; i++) {
                if (bag[i].id === 'wood' || bag[i].name === 'Дерево') {
                    wood += bag[i].quantity || 0;
                }
            }
        } catch(e) {}

        var canActivate = wood >= 100 && now > cooldownEnd;

        var h = '<div style="padding:20px;text-align:center;max-width:400px;margin:0 auto;">';
        h += '<div style="font-size:48px;margin-bottom:10px;">🔥</div>';
        h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:8px;">Очаг Шервуда</div>';
        h += '<div style="color:#888;font-size:0.85em;margin-bottom:15px;">Согрейся у очага и получи <span style="color:#ffd700;">+50% к трофеям</span> на 24 часа</div>';

        h += '<div style="background:rgba(0,0,0,0.5);padding:12px;border-radius:8px;margin-bottom:15px;">';
        h += '<div style="color:#aaa;font-size:0.8em;">Древесина в сумке</div>';
        h += '<div style="font-size:24px;font-weight:bold;color:#8B4513;">' + wood + ' / 100</div>';
        h += '<div style="width:100%;height:6px;background:#333;border-radius:3px;overflow:hidden;margin-top:4px;"><div style="width:' + Math.min(100, (wood / 100) * 100) + '%;height:100%;background:linear-gradient(90deg,#8B4513,#ffa500);border-radius:3px;"></div></div>';
        h += '</div>';

        if (bonusActive && now < bonusEnd) {
            h += '<div style="background:rgba(76,175,80,0.2);border:1px solid #4caf50;border-radius:8px;padding:12px;margin-bottom:15px;">';
            h += '<div style="color:#4caf50;font-size:1.1em;">✅ Бонус активен!</div>';
            h += '<div style="color:#aaa;font-size:0.8em;">Осталось: <span style="color:#ffd700;">' + Math.ceil((bonusEnd - now) / 3600000) + ' ч.</span></div>';
            h += '</div>';
        } else if (now <= cooldownEnd) {
            h += '<div style="background:rgba(255,152,0,0.2);border:1px solid #ff9800;border-radius:8px;padding:12px;margin-bottom:15px;">';
            h += '<div style="color:#ff9800;font-size:1.1em;">⏳ Перезарядка</div>';
            h += '<div style="color:#aaa;font-size:0.8em;">Осталось: <span style="color:#ffd700;">' + Math.ceil((cooldownEnd - now) / 3600000) + ' ч.</span></div>';
            h += '</div>';
        } else if (canActivate) {
            h += '<button onclick="Sherwood.Hearth._activateFromUI()" class="btn btn-gold" style="padding:12px 40px;font-size:1.1em;font-weight:bold;width:100%;">🔥 Подкинуть дров (100)</button>';
        } else {
            h += '<div style="background:rgba(244,67,54,0.2);border:1px solid #f44336;border-radius:8px;padding:12px;margin-bottom:15px;">';
            h += '<div style="color:#f44336;font-size:1em;">❌ Недостаточно древесины</div>';
            h += '<div style="color:#888;font-size:0.8em;">Нужно 100 древесины</div>';
            h += '</div>';
        }

        h += '<div style="color:#555;font-size:0.6em;margin-top:10px;">Бонус действует 24 часа | Перезарядка 48 часов</div>';
        h += '</div>';

        UI._openScreenScrollable('🔥 Очаг', 'hearth', h);
    },

    _activateFromUI: function() {
        var p = Sherwood.getPlayer();
        if (!p) { UI._showToast('❌ Игрок не найден'); return; }

        var spent = 0;
        var wood = 0;
        try {
            var bag = Sherwood.Bag.getItems();
            for (var i = 0; i < bag.length; i++) {
                if (bag[i].id === 'wood' || bag[i].name === 'Дерево') {
                    wood += bag[i].quantity || 0;
                }
            }
        } catch(e) {}

        if (wood < 100) {
            UI._showToast('❌ Нужно 100 древесины (у вас ' + wood + ')');
            return;
        }

        try {
            var bag = Sherwood.Bag.getItems();
            for (var i = bag.length - 1; i >= 0 && spent < 100; i--) {
                if (bag[i].id === 'wood' || bag[i].name === 'Дерево') {
                    var q = bag[i].quantity || 1;
                    var take = Math.min(q, 100 - spent);
                    spent += take;
                    if (q <= take) {
                        bag.splice(i, 1);
                    } else {
                        bag[i].quantity -= take;
                    }
                }
            }
            Sherwood.Bag._save();
        } catch(e) {
            UI._showToast('❌ Ошибка списания древесины');
            return;
        }

        p.hearthBonus = { active: true, endTime: Date.now() + 86400000 };
        p.hearthCooldown = Date.now() + 86400000 + 86400000;

        if (typeof Sherwood._recalcStats === 'function') {
            Sherwood._recalcStats();
        }
        Sherwood.saveGame();

        UI._showToast('✅ Очаг разожжён! +50% к трофеям на 24 часа!');
        this.showUI();
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Hearth = Sherwood.Hearth;

console.log('🔥 Очаг загружен!');

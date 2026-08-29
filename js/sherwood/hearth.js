/**
 * Sherwood Hearth — Очаг Шервуда
 * Бонус +50% к трофеям за 100 дерева
 */

if (typeof Sherwood === 'undefined') { var Sherwood = {}; }

Sherwood.Hearth = {
    _overlay: null,

    init: function() {
        console.log('🔥 Очаг инициализирован');
    },

    // ============================================================
    //  UI — ПОКАЗ ОЧАГА
    // ============================================================

    showUI: function() {
        if (typeof window.showHearthScreen === 'function') {
            window.showHearthScreen();
            return;
        }
        this._renderHearthUI();
    },

    _renderHearthUI: function() {
        var old = document.getElementById('hearth-screen');
        if (old) old.remove();

        var p = Sherwood.getPlayer();
        if (!p) return;

        var bonusActive = p.hearthBonus && p.hearthBonus.active;
        var bonusEnd = p.hearthBonus ? (p.hearthBonus.endTime || 0) : 0;
        var now = Date.now();
        var cooldownEnd = p.hearthCooldown || 0;

        // Считаем дерево в сумке
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

        var screenHTML = `
        <div id="hearth-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/fireplace_visual.png') center/cover no-repeat;display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
                <button onclick="Sherwood.Hearth.closeUI()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                    <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
                </button>
                <span style="color:#e0c080;font-size:1.2em;">🔥 Очаг Шервуда</span>
            </div>

            <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;color:#fff;font-family:monospace;">
                <div style="background:rgba(0,0,0,0.7);border:2px solid #8B4513;border-radius:12px;padding:30px;max-width:400px;width:100%;text-align:center;">

                    <div style="font-size:64px;margin-bottom:10px;">🔥</div>
                    <div style="color:#e0c080;font-size:20px;font-weight:bold;margin-bottom:8px;">Очаг Шервуда</div>
                    <div style="color:#888;font-size:14px;margin-bottom:15px;">
                        Согрейся у очага и получи <span style="color:#ffd700;">+50% к трофеям</span> на 24 часа
                    </div>

                    <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;margin-bottom:15px;">
                        <div style="color:#aaa;font-size:14px;">Древесина в сумке</div>
                        <div style="font-size:28px;font-weight:bold;color:#8B4513;">${wood} / 100</div>
                        <div style="width:100%;height:6px;background:#333;border-radius:3px;overflow:hidden;margin-top:4px;">
                            <div style="width:${Math.min(100, (wood/100)*100)}%;height:100%;background:linear-gradient(90deg,#8B4513,#ffa500);border-radius:3px;"></div>
                        </div>
                    </div>

                    ${bonusActive && now < bonusEnd ? `
                        <div style="background:rgba(76,175,80,0.2);border:1px solid #4caf50;border-radius:8px;padding:12px;margin-bottom:15px;">
                            <div style="color:#4caf50;font-size:18px;">✅ Бонус активен!</div>
                            <div style="color:#aaa;font-size:13px;">
                                +50% к трофеям на <span style="color:#ffd700;">${Math.ceil((bonusEnd - now) / 3600000)} ч.</span>
                            </div>
                        </div>
                    ` : now <= cooldownEnd ? `
                        <div style="background:rgba(255,152,0,0.2);border:1px solid #ff9800;border-radius:8px;padding:12px;margin-bottom:15px;">
                            <div style="color:#ff9800;font-size:18px;">⏳ Перезарядка</div>
                            <div style="color:#aaa;font-size:13px;">
                                Осталось: <span style="color:#ffd700;">${Math.ceil((cooldownEnd - now) / 3600000)} ч.</span>
                            </div>
                        </div>
                    ` : canActivate ? `
                        <button onclick="Sherwood.Hearth.activateFromUI()" class="btn btn-gold" style="padding:12px 40px;font-size:18px;font-weight:bold;width:100%;">
                            🔥 Подкинуть дров (100)
                        </button>
                    ` : `
                        <div style="background:rgba(244,67,54,0.2);border:1px solid #f44336;border-radius:8px;padding:12px;margin-bottom:15px;">
                            <div style="color:#f44336;font-size:16px;">❌ Недостаточно древесины</div>
                            <div style="color:#888;font-size:13px;">Нужно 100 древесины</div>
                        </div>
                    `}

                    <div style="color:#555;font-size:11px;margin-top:15px;">
                        Бонус действует 24 часа | Перезарядка 48 часов
                    </div>

                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', screenHTML);
    },

    // ============================================================
    //  АКТИВАЦИЯ
    // ============================================================

    activateFromUI: function() {
        var p = Sherwood.getPlayer();
        if (!p) {
            alert('❌ Игрок не найден');
            return;
        }

        var spent = 0;
        var wood = 0;

        // Считаем дерево
        try {
            var bag = Sherwood.Bag.getItems();
            for (var i = 0; i < bag.length; i++) {
                if (bag[i].id === 'wood' || bag[i].name === 'Дерево') {
                    wood += bag[i].quantity || 0;
                }
            }
        } catch(e) {}

        if (wood < 100) {
            alert('❌ Нужно 100 древесины (у вас ' + wood + ')');
            return;
        }

        // Списываем 100 дерева
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
            alert('❌ Ошибка списания древесины');
            return;
        }

        // Активируем бонус
        p.hearthBonus = {
            active: true,
            endTime: Date.now() + 86400000 // 24 часа
        };
        p.hearthCooldown = Date.now() + 86400000 + 86400000; // 48 часов

        if (typeof Sherwood._recalcStats === 'function') {
            Sherwood._recalcStats();
        }
        Sherwood.saveGame();

        alert('✅ Очаг разожжён! +50% к трофеям на 24 часа!');
        this._renderHearthUI();
    },

    // ============================================================
    //  ЗАКРЫТИЕ
    // ============================================================

    closeUI: function() {
        var screen = document.getElementById('hearth-screen');
        if (screen) screen.remove();

        if (typeof window.showHomeScreen === 'function') {
            window.showHomeScreen();
        }
    }
};

// ---------- ЭКСПОРТ ----------
window.Sherwood = window.Sherwood || {};
window.Sherwood.Hearth = Sherwood.Hearth;

console.log('🔥 Очаг загружен!');

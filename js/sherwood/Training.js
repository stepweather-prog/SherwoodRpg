/**
 * Sherwood Training — Тренировка
 * Прокачка атаки, защиты и HP за ресурсы
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Training = {
    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.trainingLevels) {
            p.trainingLevels = { attack: 0, defense: 0, hp: 0 };
            Sherwood.saveGame();
        }
        console.log('💪 Тренировка инициализирована');
    },

    getLevels: function() {
        var p = Sherwood.getPlayer();
        return p ? p.trainingLevels : { attack: 0, defense: 0, hp: 0 };
    },

    getStatInfo: function(stat) {
        var levels = this.getLevels();
        var current = levels[stat] || 0;
        var nextLevel = current + 1;
        var isGoldLevel = nextLevel % 5 === 0;
        var cost;
        if (isGoldLevel) {
            cost = Math.round(5 * Math.pow(1.15, Math.floor(nextLevel / 5)));
        } else {
            cost = Math.round(10 * Math.pow(nextLevel, 1.15));
        }
        var currency = isGoldLevel ? 'gold' : 'silver';
        var currencyName = isGoldLevel ? 'золота' : 'серебра';
        var bonus = { attack: 3, defense: 3, hp: 3 };
        return {
            stat: stat,
            level: current,
            nextLevel: nextLevel,
            cost: cost,
            currency: currency,
            currencyName: currencyName,
            bonus: bonus[stat] || 0,
            isGoldLevel: isGoldLevel,
            isMax: current >= 1000
        };
    },

    train: function(stat) {
        var info = this.getStatInfo(stat);
        if (info.isMax) {
            return { success: false, reason: 'Максимальный уровень (1000)' };
        }

        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };

        if ((p.resources[info.currency] || 0) < info.cost) {
            return { success: false, reason: 'Нужно ' + info.cost + ' ' + info.currencyName };
        }

        p.resources[info.currency] -= info.cost;
        if (!p.trainingLevels) p.trainingLevels = { attack: 0, defense: 0, hp: 0 };
        p.trainingLevels[stat] = info.nextLevel;

        if (typeof Sherwood._recalcStats === 'function') {
            Sherwood._recalcStats();
        }
        Sherwood.saveGame();

        return {
            success: true,
            stat: stat,
            newLevel: info.nextLevel,
            cost: info.cost,
            currency: info.currencyName
        };
    },

    // ========== UI ==========

    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Тренировка', '💪');
            }
            return;
        }
        UI._playSound('click');

        var p = Sherwood.getPlayer();
        if (!p) return;

        var stats = ['attack', 'defense', 'hp'];
        var names = { attack: '⚔️ Атака', defense: '🛡️ Защита', hp: '❤️ Здоровье' };
        var colors = { attack: '#f44336', defense: '#2196f3', hp: '#4caf50' };
        var icons = { attack: UI._statIcons.attack, defense: UI._statIcons.defense, hp: UI._statIcons.hp };

        var h = '<div style="padding:10px;max-width:400px;margin:0 auto;">';
        h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;text-align:center;margin-bottom:12px;">💪 Тренировка</div>';

        // ТРИ ВКЛАДКИ-ПЛАШКИ
        h += '<div style="display:flex;justify-content:center;gap:0;margin-bottom:30px;">';
        for (var i = 0; i < stats.length; i++) {
            var s = stats[i];
            var isActive = (this._selectedStat === s);
            h += '<div onclick="Sherwood.Training._selectStat(\'' + s + '\')" style="width:140px;height:50px;background:' + (isActive ? colors[s] : 'rgba(0,0,0,0.5)') + ';border:2px solid ' + colors[s] + ';border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;margin:0 -2px;transition:all 0.2s;">';
            h += '<span style="color:#fff;font-size:14px;font-weight:bold;text-shadow:0 2px 4px #000;">' + names[s] + '</span>';
            h += '</div>';
        }
        h += '</div>';

        // ВЕРТИКАЛЬНЫЙ СПИСОК ТРЕНИРОВОК (все три, с отступами)
        for (var j = 0; j < stats.length; j++) {
            var stat = stats[j];
            var info = this.getStatInfo(stat);

            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:15px;margin-bottom:20px;">';
            h += '<div style="display:flex;align-items:center;gap:10px;">';
            h += '<img src="' + icons[stat] + '" style="width:50px;height:50px;object-fit:contain;">';
            h += '<div style="flex:1;">';
            h += '<div style="color:' + colors[stat] + ';font-weight:bold;font-size:16px;">' + names[stat] + '</div>';
            h += '<div style="color:#aaa;font-size:0.8em;margin-top:4px;">Уровень: ' + info.level + '/1000</div>';
            h += '<div style="color:#888;font-size:0.7em;margin-top:4px;">+' + info.bonus + ' за уровень</div>';
            h += '</div>';
            h += '</div>';

            if (info.isMax) {
                h += '<div style="color:#4caf50;font-weight:bold;text-align:center;margin-top:8px;">✅ МАКСИМУМ</div>';
            } else {
                var currencyIcon = info.currency === 'gold' ? '💰' : '🥈';
                h += '<div style="color:#e0c080;font-size:0.8em;text-align:center;margin:8px 0;">Следующая тренировка: ' + currencyIcon + ' ' + info.cost + ' ' + info.currencyName + '</div>';
                h += '<button onclick="Sherwood.Training._trainFromUI(\'' + stat + '\')" class="btn btn-gold" style="width:100%;padding:10px;font-size:0.9em;">⬆ Тренировать</button>';
            }
            h += '</div>';
        }

        h += '<div id="training-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:8px;min-height:20px;"></div>';
        h += '</div>';

        UI._openScreenScrollable('💪 Тренировка', 'training', h);
    },

    _selectedStat: 'attack',

    _selectStat: function(stat) {
        this._selectedStat = stat;
        this.showUI();
    },

    _trainFromUI: function(stat) {
        var result = this.train(stat);
        var log = document.getElementById('training-log');
        if (result.success) {
            if (log) log.textContent = '✅ ' + stat + ' → ' + result.newLevel + ' (-' + result.cost + ' ' + result.currency + ')';
            UI._playSound('levelup');
            UI.updateDisplay();
            this.showUI();
        } else {
            if (log) log.textContent = '❌ ' + result.reason;
            UI._showToast('❌ ' + result.reason);
        }
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Training = Sherwood.Training;

console.log('💪 Тренировка загружена!');

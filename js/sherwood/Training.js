/**
 * Sherwood Training — Тренировка
 * Прокачка атаки, защиты и HP за очки опыта
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
        var cost = Math.round(10 * Math.pow(nextLevel, 1.15));
        var bonus = { attack: 3, defense: 3, hp: 3 };
        return {
            stat: stat,
            level: current,
            nextLevel: nextLevel,
            cost: cost,
            bonus: bonus[stat] || 0,
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

        if ((p.experiencePoints || 0) < info.cost) {
            return { success: false, reason: 'Нужно ' + info.cost + ' очков опыта' };
        }

        p.experiencePoints -= info.cost;
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
            cost: info.cost
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
        var icons = {
            attack: 'assets/assets2/icons/power.png',
            defense: 'assets/assets2/icons/armor.png',
            hp: 'assets/assets2/icons/life.png'
        };

        var h = '<div style="text-align:center;padding:10px;">';
        h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:15px;">💪 Тренировка</div>';
        
        // Очки тренировки (крупная иконка слева от текста)
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:20px;">';
        h += '<img src="assets/assets2/game_details/tablet_of_experience.png" style="width:40px;height:40px;object-fit:contain;">';
        h += '<span style="color:#aaa;font-size:18px;font-weight:bold;">Очки тренировки: ' + (p.experiencePoints || 0) + '</span>';
        h += '</div>';

        // ТРИ ВКЛАДКИ-ПЛАШКИ (в стиле таверны)
        h += '<div style="display:flex;justify-content:center;gap:10px;margin-bottom:30px;">';
        for (var i = 0; i < stats.length; i++) {
            var s = stats[i];
            var isActive = (this._selectedStat === s);
            h += '<div onclick="Sherwood.Training._selectStat(\'' + s + '\')" style="width:150px;height:55px;background:url(\'assets/interface/all_stat.png\') center/100% 100% no-repeat;border:2px solid ' + (isActive ? colors[s] : 'rgba(255,255,255,0.3)') + ';border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:' + (isActive ? '0 0 15px ' + colors[s] + '88' : '0 2px 4px rgba(0,0,0,0.5)') + ';">';
            h += '<span style="color:' + (isActive ? colors[s] : '#fff') + ';font-size:14px;font-weight:bold;text-shadow:0 2px 4px #000;">' + names[s] + '</span>';
            h += '</div>';
        }
        h += '</div>';

        // ВЕРТИКАЛЬНЫЙ СПИСОК ТРЕНИРОВОК (все три видны сразу)
        h += '<div style="overflow-y:auto;height:60vh;scrollbar-width:none;-ms-overflow-style:none;">';
        h += '<style>.training-scroll::-webkit-scrollbar { display: none; } .training-scroll { scrollbar-width: none; }</style>';
        h += '<div class="training-scroll" style="display:flex;flex-direction:column;gap:20px;max-width:420px;margin:0 auto;padding:10px;">';
        
        for (var j = 0; j < stats.length; j++) {
            var stat = stats[j];
            var info = this.getStatInfo(stat);

            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:15px;text-align:center;">';
            
                        // Иконка статы
            h += '<img src="' + icons[stat] + '" style="display:block;margin:0 auto;width:60px;height:60px;object-fit:contain;">';
            
            // Название + уровень + бонус (увеличили отступы от иконки)
            h += '<div style="color:' + colors[stat] + ';font-weight:bold;font-size:15px;margin-top:20px;">' + names[stat] + '</div>';
            h += '<div style="color:#aaa;font-size:12px;margin-top:8px;">Уровень: ' + info.level + '/1000</div>';
            h += '<div style="color:#aaa;font-size:11px;margin-top:8px;">+' + info.bonus + ' за уровень</div>';

            if (info.isMax) {
                h += '<div style="color:#4caf50;font-weight:bold;font-size:14px;margin-top:15px;">✅ МАКСИМУМ</div>';
            } else {
                // Стоимость + кнопка
                h += '<div style="color:#ffd700;font-size:12px;margin-top:12px;">Стоимость: ⭐ ' + info.cost + ' очков опыта</div>';
                h += '<button onclick="Sherwood.Training._trainFromUI(\'' + stat + '\')" style="background:#c9a040;border:none;border-radius:6px;padding:8px 16px;color:#000;font-weight:bold;cursor:pointer;font-size:12px;margin-top:12px;">⬆ Тренировать</button>';
            }
            
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
            if (log) log.textContent = '✅ ' + stat + ' → ' + result.newLevel + ' (-' + result.cost + ' очков опыта)';
            UI._playSound('levelup');
            UI.updateDisplay();
            this.showUI();
        } else {
            if (log) log.textContent = '❌ ' + result.reason;
            UI._showToast('❌ ' + result.reason);
        }
    }
};

// ВАЖНО: Переопределяем UI.training, чтобы кнопка в таверне вызывала ТВОЮ версию
if (typeof UI !== 'undefined') {
    UI.training = function() {
        Sherwood.Training.showUI();
    };
}

window.Sherwood = window.Sherwood || {};
window.Sherwood.Training = Sherwood.Training;

console.log('💪 Тренировка загружена!');

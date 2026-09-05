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

        if ((p.exp || 0) < info.cost) {
            return { success: false, reason: 'Нужно ' + info.cost + ' опыта' };
        }

        p.exp -= info.cost;
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
        var icons = { attack: UI._statIcons.attack, defense: UI._statIcons.defense, hp: UI._statIcons.hp };

        var h = '<div style="padding:10px;max-width:420px;margin:0 auto;">';
        h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;text-align:center;margin-bottom:12px;">💪 Тренировка</div>';
        
        // Очки тренировки (иконка слева от текста)
        h += '<div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:15px;width:100%;justify-content:center;">';
        h += '<img src="assets/assets2/game_details/tablet_of_experience.png" style="width:24px;height:24px;object-fit:contain;">';
        h += '<span style="color:#aaa;font-size:14px;">Очки тренировки: ' + (p.exp || 0) + '</span>';
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
        h += '<div style="overflow-y:auto;scrollbar-width:none;-ms-overflow-style:none;">';
        h += '<style>/* Скрыть полосу прокрутки */ .training-scroll::-webkit-scrollbar { display: none; } .training-scroll { scrollbar-width: none; }</style>';
        h += '<div class="training-scroll" style="display:flex;flex-direction:column;gap:20px;">';
        
        for (var j = 0; j < stats.length; j++) {
            var stat = stats[j];
            var info = this.getStatInfo(stat);

            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:15px;">';
            
            // Иконка сверху по центру
            h += '<div style="text-align:center;margin-bottom:10px;">';
            h += '<img src="' + icons[stat] + '" style="width:50px;height:50px;object-fit:contain;">';
            h += '</div>';
            
            // Название
            h += '<div style="text-align:center;color:' + colors[stat] + ';font-weight:bold;font-size:16px;">' + names[stat] + '</div>';
            
            // Уровень
            h += '<div style="text-align:center;color:#aaa;font-size:0.8em;margin-top:4px;">Уровень: ' + info.level + '/1000</div>';
            
            // Бонус
            h += '<div style="text-align:center;color:#888;font-size:0.7em;margin-top:4px;">+' + info.bonus + ' за уровень</div>';

            if (info.isMax) {
                h += '<div style="text-align:center;color:#4caf50;font-weight:bold;margin-top:8px;">✅ МАКСИМУМ</div>';
            } else {
                // Стоимость
                h += '<div style="text-align:center;color:#e0c080;font-size:0.8em;margin:8px 0;">Следующая тренировка: ⭐ ' + info.cost + ' опыта</div>';
                
                // Кнопка тренировки
                h += '<div style="text-align:center;">';
                h += '<button onclick="Sherwood.Training._trainFromUI(\'' + stat + '\')" style="width:100%;padding:10px;background:#c9a040;border:none;border-radius:6px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;margin-top:5px;">⬆ Тренировать</button>';
                h += '</div>';
            }
            
            h += '</div>';
        }
        h += '</div>';
        h += '</div>';

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
            if (log) log.textContent = '✅ ' + stat + ' → ' + result.newLevel + ' (-' + result.cost + ' опыта)';
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

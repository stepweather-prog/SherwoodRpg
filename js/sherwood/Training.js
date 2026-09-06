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
        if (typeof UI === 'undefined' || !UI._openScreenScrollable) {
            console.error('UI не загружен!');
            return;
        }
        UI._playSound('click');

        var p = Sherwood.getPlayer();
        if (!p) return;

        var stats = ['attack', 'defense', 'hp'];
        var names = { attack: 'Атака', defense: 'Защита', hp: 'Здоровье' };
        var colors = { attack: '#f44336', defense: '#2196f3', hp: '#4caf50' };
        var icons = {
            attack: 'assets/assets2/icons/power.png',
            defense: 'assets/assets2/icons/armor.png',
            hp: 'assets/assets2/icons/life.png'
        };

        // Фон: используем родной фон тренировки
        var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/backgrounds/training.png\') center/cover no-repeat;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;-ms-overflow-style:none;">';
        h += '<style>.training-scroll::-webkit-scrollbar { display: none; } .training-scroll { scrollbar-width: none; }</style>';

        h += '<div class="training-scroll" style="display:flex;flex-direction:column;align-items:center;padding-top:40px;width:100%;">';

        // 1. Иконка очков + число
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:30px;">';
        h += '<img src="assets/assets2/game_details/tablet_of_experience.png" style="width:36px;height:36px;object-fit:contain;">';
        h += '<span style="color:#ffd700;font-size:18px;font-weight:bold;">' + (p.experiencePoints || 0) + '</span>';
        h += '</div>';

        // 2. Три плашки в одну линию
        h += '<div style="display:flex;justify-content:center;gap:8px;margin-bottom:30px;width:100%;max-width:280px;">';
        for (var i = 0; i < stats.length; i++) {
            var s = stats[i];
            var isActive = (this._selectedStat === s);
            h += '<div onclick="Sherwood.Training._selectStat(\'' + s + '\')" style="flex:1;height:40px;background:url(\'assets/interface/all_stat.png\') center/100% 100% no-repeat;display:flex;align-items:center;justify-content:center;cursor:pointer;">';
            h += '<span style="color:' + (isActive ? colors[s] : '#fff') + ';font-size:12px;font-weight:bold;text-shadow:0 2px 4px #000;">' + names[s] + '</span>';
            h += '</div>';
        }
        h += '</div>';

        // 3. Все три статы (вертикальный столбик)
        h += '<div style="width:90%;max-width:320px;">';
        for (var j = 0; j < stats.length; j++) {
            var stat = stats[j];
            var info = this.getStatInfo(stat);

            h += '<div style="display:flex;flex-direction:column;align-items:center;text-align:center;width:100%;margin-bottom:25px;">';
            
            // Иконка статы
            h += '<img src="' + icons[stat] + '" style="display:block;margin:0 auto;width:60px;height:60px;object-fit:contain;">';
            
            // Название + уровень + бонус
            h += '<div style="color:' + colors[stat] + ';font-weight:bold;font-size:14px;margin-top:8px;">' + names[stat] + '</div>';
            h += '<div style="color:#aaa;font-size:12px;margin-top:4px;">Уровень: ' + info.level + '/1000</div>';
            h += '<div style="color:#aaa;font-size:11px;margin-top:4px;">+' + info.bonus + ' за уровень</div>';

            // Кнопки + / -
            h += '<div style="display:flex;align-items:center;justify-content:center;gap:15px;margin-top:10px;">';
            h += '<button onclick="Sherwood.Training._removePoint(\'' + stat + '\')" style="background:#f44336;border:none;border-radius:50%;padding:5px 10px;color:#fff;font-weight:bold;cursor:pointer;font-size:16px;">-</button>';
            h += '<span style="color:#fff;font-size:16px;font-weight:bold;">' + info.level + '</span>';
            h += '<button onclick="Sherwood.Training._addPoint(\'' + stat + '\')" style="background:#4caf50;border:none;border-radius:50%;padding:5px 10px;color:#fff;font-weight:bold;cursor:pointer;font-size:16px;">+</button>';
            h += '</div>';

            // Стоимость
            h += '<div style="color:#ffd700;font-size:12px;margin-top:12px;">Стоимость: ⭐ ' + info.cost + ' очков опыта</div>';
            
            h += '</div>';
        }
        h += '</div>';

        // 4. Кнопка подтвердить
        h += '<div style="width:100%;max-width:320px;padding:20px 0 30px 0;text-align:center;">';
        h += '<button onclick="Sherwood.Training._confirmTraining()" style="width:100%;background:#c9a040;border:none;border-radius:8px;padding:12px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;">Подтвердить</button>';
        h += '</div>';

        h += '</div>';
        h += '</div>';

        // Кнопка назад ведет в Таверну
        UI._openScreenScrollable('💪 Тренировка', null, h, 'UI.tavern()');
    },

    _selectedStat: 'attack',

    _selectStat: function(stat) {
        this._selectedStat = stat;
        this.showUI();
    },

    // ========== НОВЫЕ ФУНКЦИИ ДЛЯ РАСПРЕДЕЛЕНИЯ ==========

    _addPoint: function(stat) {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if ((p.experiencePoints || 0) < this.getStatInfo(stat).cost) {
            UI._showToast('Нужно ' + this.getStatInfo(stat).cost + ' очков опыта');
            return;
        }
        var lvl = (p.trainingLevels && p.trainingLevels[stat]) || 0;
        if (lvl >= 1000) {
            UI._showToast('Макс. уровень!');
            return;
        }
        
        p.experiencePoints -= this.getStatInfo(stat).cost;
        if (!p.trainingLevels) p.trainingLevels = { attack: 0, defense: 0, hp: 0 };
        p.trainingLevels[stat] = lvl + 1;
        
        if (typeof Sherwood._recalcStats === 'function') {
            Sherwood._recalcStats();
        }
        Sherwood.saveGame();
        UI.updateDisplay();
        this.showUI();
    },

    _removePoint: function(stat) {
        var p = Sherwood.getPlayer();
        if (!p) return;
        var lvl = (p.trainingLevels && p.trainingLevels[stat]) || 0;
        if (lvl <= 0) {
            UI._showToast('Уровень 0, нечего убирать');
            return;
        }
        
        // Рассчитываем стоимость предыдущего уровня (чтобы вернуть очки)
        var cost = Math.round(10 * Math.pow(lvl, 1.15));
        p.experiencePoints += cost;
        p.trainingLevels[stat] = lvl - 1;
        
        if (typeof Sherwood._recalcStats === 'function') {
            Sherwood._recalcStats();
        }
        Sherwood.saveGame();
        UI.updateDisplay();
        this.showUI();
    },

    _confirmTraining: function() {
        UI._showToast('Тренировка подтверждена!');
        UI.tavern();
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

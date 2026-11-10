/**
 * Sherwood Training — Тренировка
 * Прокачка атаки, защиты и HP за очки опыта
 * Стиль: как в дереве талантов (карточки + всплывающее описание)
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
        var cost = 1;   // 1 очко = 1 улучшение
        var bonus = { attack: 50, defense: 50, hp: 50 };
        return {
            stat: stat,
            level: current,
            nextLevel: nextLevel,
            cost: cost,
            bonus: bonus[stat] || 0,
            isMax: current >= 30000
        };
    },

    train: function(stat) {
        var info = this.getStatInfo(stat);
        if (info.isMax) {
            return { success: false, reason: 'Максимальный уровень (30000)' };
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

    // ============================================================
    //  ВСПЛЫВАЮЩЕЕ ОКНО С ОПИСАНИЕМ ХАРАКТЕРИСТИКИ
    // ============================================================
    _showStatInfo: function(stat) {
        var names = { attack: 'Атака', defense: 'Защита', hp: 'Здоровье' };
        var colors = { attack: '#f44336', defense: '#2196f3', hp: '#4caf50' };
        var icons = {
            attack: 'assets/assets2/icons/power.png',
            defense: 'assets/assets2/icons/armor.png',
            hp: 'assets/assets2/icons/life.png'
        };
        var desc = {
            attack: 'Увеличивает урон персонажа. Каждый уровень добавляет +50 к атаке.',
            defense: 'Снижает получаемый урон. Каждый уровень добавляет +50 к защите.',
            hp: 'Увеличивает максимальный запас здоровья. Каждый уровень добавляет +50 HP.'
        };

        var info = this.getStatInfo(stat);
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';

        var modal = document.createElement('div');
        modal.style.cssText = 'background:linear-gradient(to bottom, #2a1e12, #110a04);border:2px solid #8b6b3a;border-radius:12px;padding:25px 20px;max-width:340px;width:100%;text-align:center;box-shadow:0 0 30px rgba(139,107,58,0.4);position:relative;';

        modal.innerHTML =
            '<img src="' + icons[stat] + '" style="width:70px;height:70px;object-fit:contain;margin:0 auto 15px auto;display:block;filter:drop-shadow(0 0 10px ' + colors[stat] + 'aa);" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">' +
            '<div style="color:' + colors[stat] + ';font-size:18px;font-weight:bold;margin-bottom:8px;">' + names[stat] + '</div>' +
            '<div style="color:#fff;font-size:12px;margin-bottom:15px;">Уровень: ' + info.level + '</div>' +
            '<div style="color:#ccc;font-size:13px;line-height:1.6;margin-bottom:20px;text-align:left;background:rgba(0,0,0,0.3);padding:12px;border-radius:6px;">' + desc[stat] + '</div>' +
            '<button onclick="this.parentElement.parentElement.remove()" style="background:#c9a040;border:none;border-radius:6px;padding:10px 25px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;">Понятно</button>';

        overlay.appendChild(modal);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });

        document.body.appendChild(overlay);
    },

    // ============================================================
    //  UI ТРЕНИРОВКИ В СТИЛЕ ТАЛАНТОВ
    // ============================================================
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

        var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/backgrounds/training.png\') center/cover no-repeat;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;-ms-overflow-style:none;">';
        h += '<style>.training-scroll::-webkit-scrollbar { display: none; } .training-scroll { scrollbar-width: none; }</style>';
        h += '<div class="training-scroll" style="display:flex;flex-direction:column;align-items:center;padding-top:40px;padding-bottom:60px;width:100%;">';

        // Очки опыта + подсказка
        h += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:20px;">';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;">';
        h += '<img src="assets/assets2/game_details/tablet_of_experience.png" style="width:36px;height:36px;object-fit:contain;">';
        h += '<span style="color:#ffd700;font-size:18px;font-weight:bold;">' + (p.experiencePoints || 0) + '</span>';
        h += '</div>';
        h += '<div style="color:#888;font-size:10px;margin-top:4px;text-align:center;">Начисляются за победы над врагами</div>';
        h += '</div>';

        // Сетка карточек характеристик
        h += '<div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:15px;width:95%;max-width:360px;margin-bottom:30px;">';

        for (var i = 0; i < stats.length; i++) {
            var stat = stats[i];
            var info = this.getStatInfo(stat);

            // Контейнер колонки
            h += '<div style="display:flex;flex-direction:column;align-items:center;width:100%;">';

            // Квадратная карточка с иконкой
            h += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;padding:10px;background:rgba(10,8,5,0.9);border:2px solid #6b5a3a;width:100%;box-shadow:0 4px 15px rgba(0,0,0,0.9);aspect-ratio:1/1;">';
            h += '<img onclick="Sherwood.Training._showStatInfo(\'' + stat + '\')" src="' + icons[stat] + '" style="display:block;margin:0 auto;width:60px;height:60px;object-fit:contain;filter:drop-shadow(0 0 8px ' + colors[stat] + 'aa);cursor:pointer;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '</div>'; // конец карточки

            // Название под карточкой
            h += '<div onclick="Sherwood.Training._showStatInfo(\'' + stat + '\')" style="color:' + colors[stat] + ';font-size:12px;font-weight:bold;margin-top:10px;text-align:center;cursor:pointer;text-shadow:0 2px 4px #000;line-height:1.2;">' + names[stat] + '</div>';

            // Уровень
            h += '<div style="color:#ffa500;font-size:11px;font-weight:bold;margin-top:4px;margin-bottom:8px;">Ур. ' + info.level + '</div>';

            // Кнопки + и - под названием и уровнем
            h += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;background:rgba(0,0,0,0.6);border-radius:20px;padding:4px 10px;border:1px solid rgba(139,107,58,0.5);">';
            h += '<button onclick="Sherwood.Training._removePoint(\'' + stat + '\')" style="background:#f44336;border:none;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;cursor:pointer;font-size:14px;padding:0;">-</button>';
            h += '<span style="color:#fff;font-size:13px;font-weight:bold;min-width:18px;">' + info.level + '</span>';
            h += '<button onclick="Sherwood.Training._addPoint(\'' + stat + '\')" style="background:#4caf50;border:none;border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;cursor:pointer;font-size:14px;padding:0;">+</button>';
            h += '</div>';

            h += '</div>'; // конец колонки
        }
        h += '</div>'; // конец сетки

        // Кнопка "Подтвердить"
        h += '<div style="width:90%;max-width:340px;text-align:center;">';
        h += '<button onclick="Sherwood.Training._confirmTraining()" style="width:100%;background:#c9a040;border:none;border-radius:8px;padding:12px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;">Подтвердить</button>';
        h += '</div>';

        h += '</div>';
        h += '</div>';

        UI._openScreenScrollable('💪 Тренировка', null, h, 'UI.tavern()');
    },

    _selectedStat: 'attack',

    _selectStat: function(stat) {
        this._selectedStat = stat;
        this.showUI();
    },

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
        
        var cost = this.getStatInfo(stat).cost;
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

console.log('💪 Тренировка загружена (v2, стиль талантов)!');

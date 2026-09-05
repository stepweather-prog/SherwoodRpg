// ============================================================
//  js/sherwood/talents.js — Таланты героя (Профиль + Таверна)
// ============================================================

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Talents = {
    BRANCHES: {
        damage: { id: 'damage', name: 'Атакующие', color: '#f44336', icon: 'assets/assets2/talents/simple_attack.png' },
        passive: { id: 'passive', name: 'Пассивные', color: '#2196f3', icon: 'assets/assets2/talents/blocking.png' },
        heal: { id: 'heal', name: 'Исцеляющие', color: '#4caf50', icon: 'assets/assets2/talents/healing.png' }
    },

    TALENTS: [
        { id: 'simple_attack', name: 'Простая атака', branch: 'damage', icon: 'assets/assets2/talents/simple_attack.png', desc: 'Увеличивает базовый урон на 10%.', maxLevel: 5 },
        { id: 'poisoning', name: 'Отравление', branch: 'damage', icon: 'assets/assets2/talents/poisoning.png', desc: 'Каждая атака имеет шанс отравить врага.', maxLevel: 3 },
        { id: 'vampirism', name: 'Вампиризм', branch: 'damage', icon: 'assets/assets2/talents/vampirism.png', desc: 'Восстанавливает HP за каждый нанесённый удар.', maxLevel: 3 },
        { id: 'stunning', name: 'Оглушение', branch: 'damage', icon: 'assets/assets2/talents/stunning.png', desc: 'Шанс оглушить врага после атаки.', maxLevel: 3 },
        { id: 'ricochet', name: 'Рикошет', branch: 'damage', icon: 'assets/assets2/talents/Ricochet.png', desc: 'Атака может отскочить к другому врагу.', maxLevel: 2 },
        { id: 'riot', name: 'Бунт', branch: 'damage', icon: 'assets/assets2/talents/Riot.png', desc: 'Повышает урон, когда HP низкий.', maxLevel: 3 },
        { id: 'force_of_elements', name: 'Сила стихий', branch: 'damage', icon: 'assets/assets2/talents/force of the elements.png', desc: 'Добавляет стихийный урон к атакам.', maxLevel: 5 },
        { id: 'evil_eye', name: 'Злой глаз', branch: 'damage', icon: 'assets/assets2/talents/evil_eye.png', desc: 'Снижает удачу врага.', maxLevel: 2 },

        { id: 'blocking', name: 'Блокировка', branch: 'passive', icon: 'assets/assets2/talents/blocking.png', desc: 'Уменьшает получаемый урон на 8%.', maxLevel: 3 },
        { id: 'parry', name: 'Парирование', branch: 'passive', icon: 'assets/assets2/talents/parry.png', desc: 'Шанс полностью отразить атаку врага.', maxLevel: 2 },
        { id: 'silence', name: 'Тишина', branch: 'passive', icon: 'assets/assets2/talents/Silence.png', desc: 'Шанс запретить врагу использовать навыки.', maxLevel: 2 },
        { id: 'numbness', name: 'Онемение', branch: 'passive', icon: 'assets/assets2/talents/Numbness.png', desc: 'Снижает скорость атаки врагов.', maxLevel: 3 },
        { id: 'ignore', name: 'Игнор', branch: 'passive', icon: 'assets/assets2/talents/ignore.png', desc: 'Игнорирует часть защиты врага.', maxLevel: 3 },

        { id: 'healing', name: 'Исцеление', branch: 'heal', icon: 'assets/assets2/talents/healing.png', desc: 'Увеличивает эффективность лечения на 15%.', maxLevel: 4 },
        { id: 'healer', name: 'Хилер', branch: 'heal', icon: 'assets/assets2/talents/Healer.png', desc: 'Увеличивает лечение союзников.', maxLevel: 3 },
        { id: 'funnel', name: 'Воронка', branch: 'heal', icon: 'assets/assets2/talents/funnel.png', desc: 'Притягивает врагов к центру.', maxLevel: 2 },
        { id: 'inspiration', name: 'Вдохновение', branch: 'heal', icon: 'assets/assets2/talents/inspiration.png', desc: 'Повышает урон всей команды.', maxLevel: 2 },
        { id: 'knot', name: 'Узел', branch: 'heal', icon: 'assets/assets2/talents/knot.png', desc: 'Связывает врагов, снижая их мобильность.', maxLevel: 2 }
    ],

    _selectedBranch: 'damage',
    _talentLevels: {},

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.talents) p.talents = {};
        this._talentLevels = p.talents;
        console.log('⚡ Таланты инициализированы');
    },

    getAllTalents: function() { return this.TALENTS; },
    getTalentLevel: function(id) { return this._talentLevels[id] || 0; },

    canUpgrade: function(talent) {
        var lvl = this.getTalentLevel(talent.id);
        if (lvl >= talent.maxLevel) return { can: false, reason: 'Максимальный уровень' };
        return { can: true };
    },

    upgradeTalent: function(id) {
        var talent = null;
        for (var i = 0; i < this.TALENTS.length; i++) {
            if (this.TALENTS[i].id === id) { talent = this.TALENTS[i]; break; }
        }
        if (!talent) return { success: false, reason: 'Талант не найден' };
        var lvl = this.getTalentLevel(id);
        if (lvl >= talent.maxLevel) return { success: false, reason: 'Максимальный уровень' };
        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };
        if (!p.talentPoints) p.talentPoints = 0;
        var cost = 1;
        if (p.talentPoints < cost) {
            return { success: false, reason: 'Нужно ' + cost + ' очков талантов!' };
        }
        p.talentPoints -= cost;
        this._talentLevels[id] = lvl + 1;
        p.talents = this._talentLevels;
        Sherwood.saveGame();
        return { success: true, newLevel: lvl + 1 };
    },

    showLearnedTalents: function() {
        if (typeof UI === 'undefined' || !UI._openScreenScrollable) {
            console.error('UI не загружен!');
            return;
        }

        UI._playSound('click');
        var allTalents = this.getAllTalents();
        var learnedTalents = [];
        for (var i = 0; i < allTalents.length; i++) {
            var lvl = this.getTalentLevel(allTalents[i].id);
            if (lvl > 0) {
                learnedTalents.push(allTalents[i]);
            }
        }
        var p = Sherwood.getPlayer();
        var talentPoints = p ? (p.talentPoints || 0) : 0;

        var h = '<div style="text-align:center;padding:20px;">';
        h += '<div style="color:#e0c080;font-size:22px;font-weight:bold;margin-bottom:20px;">Изученные таланты</div>';
        
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:20px;">';
        h += '<img src="assets/assets2/game_details/tablet_of_talents.png" style="width:40px;height:40px;object-fit:contain;">';
        h += '<span style="color:#aaa;font-size:18px;font-weight:bold;">Очки талантов: ' + talentPoints + '</span>';
        h += '</div>';
        
        if (learnedTalents.length === 0) {
            h += '<div style="color:#aaa;font-size:16px;">Вы ещё не изучили ни одного таланта.</div>';
        } else {
            h += '<div style="overflow-y:auto;height:60vh;scrollbar-width:none;-ms-overflow-style:none;max-width:420px;margin:0 auto;padding:10px;">';
            h += '<style>.talents-scroll::-webkit-scrollbar { display: none; } .talents-scroll { scrollbar-width: none; }</style>';
            h += '<div class="talents-scroll" style="display:flex;flex-direction:column;gap:15px;">';
            
            for (var i = 0; i < learnedTalents.length; i++) {
                var t = learnedTalents[i];
                var lvl = this.getTalentLevel(t.id);
                h += '<div style="background:rgba(0,0,0,0.6);border:2px solid #ffa500;border-radius:10px;padding:15px;text-align:center;">';
                
                h += '<div style="text-align:center;margin-bottom:10px;">';
                h += '<img src="' + t.icon + '" style="width:50px;height:50px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                h += '</div>';
                
                h += '<div style="color:#fff;font-size:14px;font-weight:bold;">' + t.name + '</div>';
                h += '<div style="color:#ffa500;font-size:12px;margin-top:4px;">Ур. ' + lvl + '/' + t.maxLevel + '</div>';
                
                h += '<div style="margin-top:10px;">';
                h += '<button onclick="Sherwood.Talents._upgradeTalent(\'' + t.id + '\')" style="background:#c9a040;border:none;border-radius:6px;padding:6px 12px;color:#000;font-weight:bold;cursor:pointer;font-size:12px;">⬆ Улучшить</button>';
                h += '</div>';
                
                h += '</div>';
            }
            h += '</div>';
            h += '</div>';
        }
        h += '</div>';
        UI._openScreenScrollable('⚡ Таланты', 'talents', h, 'UI.profile()');
    },

                showUI: function() {
        if (typeof UI === 'undefined' || !UI._openScreenScrollable) {
            console.error('UI не загружен!');
            return;
        }

        UI._playSound('click');
        var allTalents = this.getAllTalents();
        var p = Sherwood.getPlayer();
        var talentPoints = p ? (p.talentPoints || 0) : 0;
        var selectedBranch = this._selectedBranch;

        // 1. ВОЗВРАЩАЕМ ТВОЙ РОДНОЙ ФОН ДЕРЕВА (отсюда и была ошибка 404)
        var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/talents/background_talents.png\') center/cover no-repeat;overflow-y:auto;overflow-x:hidden;">';

        // 2. Внутренний контейнер
        h += '<div style="display:flex;flex-direction:column;align-items:center;padding-top:60px;width:100%;">';

        // Заголовок и очки
        h += '<div style="color:#e0c080;font-size:20px;font-weight:bold;margin-bottom:10px;text-shadow:0 2px 4px #000;">Изучить таланты</div>';
        
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:15px;">';
        h += '<img src="assets/assets2/game_details/tablet_of_talents.png" style="width:32px;height:32px;object-fit:contain;">';
        h += '<span style="color:#ffd700;font-size:16px;font-weight:bold;">Очки: ' + talentPoints + '</span>';
        h += '</div>';

        // Кнопки веток
        h += '<div style="display:flex;justify-content:center;gap:6px;margin-bottom:20px;width:100%;max-width:280px;">';
        var branchesOrder = ['damage', 'passive', 'heal'];
        for (var b = 0; b < branchesOrder.length; b++) {
            var branchId = branchesOrder[b];
            var branch = this.BRANCHES[branchId];
            var isActive = (branchId === selectedBranch);
            h += '<div onclick="Sherwood.Talents._selectBranch(\'' + branchId + '\')" style="flex:1;height:40px;background:url(\'assets/interface/all_stat.png\') center/100% 100% no-repeat;border:2px solid ' + (isActive ? branch.color : 'rgba(255,255,255,0.3)') + ';border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:' + (isActive ? '0 0 10px ' + branch.color + '88' : '0 2px 4px rgba(0,0,0,0.5)') + ';">';
            h += '<span style="color:' + (isActive ? branch.color : '#fff') + ';font-size:11px;font-weight:bold;text-shadow:0 2px 4px #000;">' + branch.name + '</span>';
            h += '</div>';
        }
        h += '</div>';

        // Фильтруем таланты по ветке
        var branchTalents = [];
        for (var i = 0; i < allTalents.length; i++) {
            if (allTalents[i].branch === selectedBranch) {
                branchTalents.push(allTalents[i]);
            }
        }

        // 3. Список талантов
        h += '<div style="width:90%;max-width:320px;padding:10px;">';
        
        for (var j = 0; j < branchTalents.length; j++) {
            var t = branchTalents[j];
            var lvl = this.getTalentLevel(t.id);
            h += '<div style="background:rgba(0,0,0,0.7);border:2px solid ' + (lvl > 0 ? '#ffa500' : '#555') + ';border-radius:10px;padding:15px;text-align:center;margin-bottom:15px;">';
            
            // ИКОНКА ПО ЦЕНТРУ (убрал сдвиг вправо)
            h += '<img src="' + t.icon + '" style="display:block;margin:0 auto;width:50px;height:50px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            
            h += '<div style="color:#fff;font-size:14px;font-weight:bold;">' + t.name + '</div>';
            h += '<div style="color:#aaa;font-size:11px;margin-top:6px;line-height:1.5;">' + t.desc + '</div>';
            h += '<div style="color:#ffa500;font-size:12px;margin-top:8px;">Ур. ' + lvl + '/' + t.maxLevel + '</div>';
            
            h += '<div style="margin-top:10px;">';
            h += '<button onclick="Sherwood.Talents._upgradeTalent(\'' + t.id + '\')" style="background:#c9a040;border:none;border-radius:6px;padding:8px 16px;color:#000;font-weight:bold;cursor:pointer;font-size:12px;width:100%;">⬆ Улучшить</button>';
            h += '</div>';
            
            h += '</div>';
        }
        h += '</div>';

        h += '</div>';
        h += '</div>';
        
        // Передаем 'UI.tavern()', чтобы кнопка назад возвращала в Таверну!
        UI._openScreenScrollable('⚡ Таланты', null, h, 'UI.tavern()');
    },
    _selectBranch: function(branchId) {
        this._selectedBranch = branchId;
        this.showUI();
    },

    _upgradeTalent: function(id) {
        var r = this.upgradeTalent(id);
        if (!r.success) {
            UI._showToast(r.reason || 'Ошибка');
            return;
        }
        UI._showToast('Талант улучшен до уровня ' + r.newLevel + '!');
        this.showUI();
    }
};

if (typeof UI !== 'undefined' && UI.talents) {
    UI.talents = function() {
        Sherwood.Talents.showUI();
    };
}

window.Sherwood = window.Sherwood || {};
window.Sherwood.Talents = Sherwood.Talents;

console.log('⚡ Таланты загружены!');

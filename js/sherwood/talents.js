// ============================================================
//  js/sherwood/talents.js — Таланты героя
// ============================================================

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Talents = {
    TALENTS: [
        { id: 'simple_attack', name: 'Простая атака', icon: 'assets/assets2/talents/simple_attack.png', desc: 'Увеличивает базовый урон на 10%.', maxLevel: 5 },
        { id: 'poisoning', name: 'Отравление', icon: 'assets/assets2/talents/poisoning.png', desc: 'Каждая атака имеет шанс отравить врага.', maxLevel: 3 },
        { id: 'vampirism', name: 'Вампиризм', icon: 'assets/assets2/talents/vampirism.png', desc: 'Восстанавливает HP за каждый нанесённый удар.', maxLevel: 3 },
        { id: 'healing', name: 'Исцеление', icon: 'assets/assets2/talents/healing.png', desc: 'Увеличивает эффективность лечения на 15%.', maxLevel: 4 },
        { id: 'blocking', name: 'Блокировка', icon: 'assets/assets2/talents/blocking.png', desc: 'Уменьшает получаемый урон на 8%.', maxLevel: 3 },
        { id: 'parry', name: 'Парирование', icon: 'assets/assets2/talents/parry.png', desc: 'Шанс полностью отразить атаку врага.', maxLevel: 2 },
        { id: 'stunning', name: 'Оглушение', icon: 'assets/assets2/talents/stunning.png', desc: 'Шанс оглушить врага после атаки.', maxLevel: 3 },
        { id: 'silence', name: 'Тишина', icon: 'assets/assets2/talents/Silence.png', desc: 'Шанс запретить врагу использовать навыки.', maxLevel: 2 },
        { id: 'numbness', name: 'Онемение', icon: 'assets/assets2/talents/Numbness.png', desc: 'Снижает скорость атаки врагов.', maxLevel: 3 },
        { id: 'ignore', name: 'Игнор', icon: 'assets/assets2/talents/ignore.png', desc: 'Игнорирует часть защиты врага.', maxLevel: 3 },
        { id: 'ricochet', name: 'Рикошет', icon: 'assets/assets2/talents/Ricochet.png', desc: 'Атака может отскочить к другому врагу.', maxLevel: 2 },
        { id: 'riot', name: 'Бунт', icon: 'assets/assets2/talents/Riot.png', desc: 'Повышает урон, когда HP низкий.', maxLevel: 3 },
        { id: 'funnel', name: 'Воронка', icon: 'assets/assets2/talents/funnel.png', desc: 'Притягивает врагов к центру.', maxLevel: 2 },
        { id: 'inspiration', name: 'Вдохновение', icon: 'assets/assets2/talents/inspiration.png', desc: 'Повышает урон всей команды.', maxLevel: 2 },
        { id: 'knot', name: 'Узел', icon: 'assets/assets2/talents/knot.png', desc: 'Связывает врагов, снижая их мобильность.', maxLevel: 2 },
        { id: 'healer', name: 'Хилер', icon: 'assets/assets2/talents/Healer.png', desc: 'Увеличивает лечение союзников.', maxLevel: 3 },
        { id: 'force_of_elements', name: 'Сила стихий', icon: 'assets/assets2/talents/force of the elements.png', desc: 'Добавляет стихийный урон к атакам.', maxLevel: 5 },
        { id: 'evil_eye', name: 'Злой глаз', icon: 'assets/assets2/talents/evil_eye.png', desc: 'Снижает удачу врага.', maxLevel: 2 }
    ],

    _selectedTalent: null,
    _talentLevels: {},

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.talents) p.talents = {};
        this._talentLevels = p.talents;
        console.log('⚡ Таланты инициализированы');
    },

    getAllTalents: function() { return this.TALENTS; },

    getTalentLevel: function(id) {
        return this._talentLevels[id] || 0;
    },

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
        this._talentLevels[id] = lvl + 1;
        var p = Sherwood.getPlayer();
        if (p) {
            p.talents = this._talentLevels;
            Sherwood.saveGame();
        }
        return { success: true, newLevel: lvl + 1 };
    },

    // ========== UI ==========

    showUI: function() {
        if (typeof UI === 'undefined' || !UI._openScreenScrollable) {
            console.error('UI не загружен!');
            return;
        }

        UI._playSound('click');
        var allTalents = this.getAllTalents();
        var h = '<div style="text-align:center;padding:10px;">';
        h += '<div style="color:#e0c080;font-size:22px;font-weight:bold;margin-bottom:20px;">Таланты</div>';
        h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;max-width:420px;margin:0 auto;">';

        for (var i = 0; i < allTalents.length; i++) {
            var t = allTalents[i];
            var lvl = this.getTalentLevel(t.id);
            var icon = t.icon;
            if (lvl > 0) {
                icon = t.icon.replace('.png', '_upgraded.png'); // если есть апгрейд иконки
            }

            h += '<div onclick="Sherwood.Talents._showTalentInfo(\'' + t.id + '\')" style="background:rgba(0,0,0,0.6);border:2px solid ' + (lvl > 0 ? '#ffa500' : '#555') + ';border-radius:10px;padding:8px;cursor:pointer;">';
            h += '<img src="' + t.icon + '" style="width:60px;height:60px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '<div style="color:#fff;font-size:10px;margin-top:4px;">' + t.name + '</div>';
            h += '<div style="color:#ffa500;font-size:10px;">Ур. ' + lvl + '/' + t.maxLevel + '</div>';
            h += '</div>';
        }

        h += '</div>';
        h += '</div>';

        UI._openScreenScrollable('⚡ Таланты', 'talents', h, 'UI.profile()');
    },

    _showTalentInfo: function(id) {
        var talent = null;
        for (var i = 0; i < this.TALENTS.length; i++) {
            if (this.TALENTS[i].id === id) { talent = this.TALENTS[i]; break; }
        }
        if (!talent) return;

        var lvl = this.getTalentLevel(talent.id);
        var h = '<div style="text-align:center;padding:20px;">';
        h += '<img src="' + talent.icon + '" style="width:120px;height:120px;object-fit:contain;margin-bottom:15px;">';
        h += '<div style="color:#ffa500;font-size:22px;font-weight:bold;">' + talent.name + '</div>';
        h += '<div style="color:#fff;font-size:14px;margin-top:10px;">' + talent.desc + '</div>';
        h += '<div style="color:#aaa;font-size:12px;margin-top:10px;">Уровень: ' + lvl + '/' + talent.maxLevel + '</div>';

        if (lvl < talent.maxLevel) {
            h += '<button onclick="Sherwood.Talents._upgradeTalent(\'' + talent.id + '\')" style="margin-top:20px;background:#c9a040;border:none;border-radius:8px;padding:12px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:16px;">Улучшить</button>';
        } else {
            h += '<div style="color:#4caf50;margin-top:20px;font-size:16px;font-weight:bold;">МАКСИМАЛЬНЫЙ УРОВЕНЬ</div>';
        }
        h += '</div>';

        UI._openScreen(talent.name, 'talents', h, 'Sherwood.Talents.showUI()');
    },

    _upgradeTalent: function(id) {
        var r = this.upgradeTalent(id);
        if (!r.success) {
            UI._showToast(r.reason || 'Ошибка');
            return;
        }
        UI._showToast('Талант улучшен до уровня ' + r.newLevel + '!');
        this._showTalentInfo(id);
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Talents = Sherwood.Talents;

console.log('⚡ Таланты загружены!');

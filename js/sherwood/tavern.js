/**
 * Sherwood Talents — Таланты героя (v10)
 *  — Шрифт талантов как у табличек (золотистый, 0.9em)
 *  — Кнопка "Назад" возвращает в лагерь
 */

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
        { id: 'stunning', name: 'Оглушение', branch: 'damage', icon: 'assets/assets2/talents/stunning.png',
          desc: 'Оглушает врага на 10 секунд. Тратит 20% скверны. Кулдаун 20 сек.', maxLevel: 1 },
        { id: 'rage', name: 'Ярость', branch: 'damage', icon: 'assets/assets2/talents/Riot.png',
          desc: 'Работает только на полной сфере. Тратит 65% скверны. 3 удара с +20% урона. Кулдаун 25 сек.', maxLevel: 1 },
        { id: 'healing', name: 'Лечение', branch: 'heal', icon: 'assets/assets2/talents/healing.png',
          desc: 'Лечит 10 HP за уровень. Тратит 5% скверны за уровень. Кулдаун 8 сек.', maxLevel: 50 },
        { id: 'vampirism', name: 'Вампиризм', branch: 'passive', icon: 'assets/assets2/talents/vampirism.png',
          desc: '30% шанс в начале боя. 20 сек действует. Базово 5% от урона в HP, +5% за уровень. Максимум 50%.', maxLevel: 10 },
        { id: 'ricochet', name: 'Рикошет', branch: 'passive', icon: 'assets/assets2/talents/Ricochet.png',
          desc: '45% шанс вернуть удар врага ему же. В этот момент скверна не начисляется.', maxLevel: 1 }
    ],

    _selectedBranch: 'damage',
    _talentLevels: {},

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.talents) p.talents = {};

        var allowed = ['stunning', 'rage', 'healing', 'vampirism', 'ricochet'];
        for (var key in p.talents) {
            if (allowed.indexOf(key) === -1) {
                delete p.talents[key];
            }
        }

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

    _showTalentInfo: function(id) {
        var talent = null;
        for (var i = 0; i < this.TALENTS.length; i++) {
            if (this.TALENTS[i].id === id) { talent = this.TALENTS[i]; break; }
        }
        if (!talent) return;

        var lvl = this.getTalentLevel(talent.id);
        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
        
        var modal = document.createElement('div');
        modal.style.cssText = 'background:linear-gradient(to bottom, #2a1e12, #110a04);border:2px solid #8b6b3a;border-radius:12px;padding:25px 20px;max-width:340px;width:100%;text-align:center;box-shadow:0 0 30px rgba(139,107,58,0.4);position:relative;';
        
        modal.innerHTML = 
            '<img src="' + talent.icon + '" style="width:70px;height:70px;object-fit:contain;margin:0 auto 15px auto;display:block;filter:drop-shadow(0 0 10px rgba(255,165,0,0.6));" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">' +
            '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:8px;text-shadow:0 2px 4px #000;">' + talent.name + '</div>' +
            '<div style="color:#fff;font-size:0.85em;margin-bottom:15px;">Уровень: ' + lvl + ' / ' + talent.maxLevel + '</div>' +
            '<div style="color:#ccc;font-size:0.8em;line-height:1.6;margin-bottom:20px;text-align:left;background:rgba(0,0,0,0.3);padding:12px;border-radius:6px;">' + talent.desc + '</div>' +
            '<button onclick="this.parentElement.parentElement.remove()" style="background:#c9a040;border:none;border-radius:6px;padding:10px 25px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;">Понятно</button>';

        overlay.appendChild(modal);
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) overlay.remove();
        });

        document.body.appendChild(overlay);
    },

    // ============================================================
    //  ЭКРАН «ИЗУЧЕННЫЕ ТАЛАНТЫ» (профиль)
    // ============================================================
    showLearnedTalents: function() {
        if (typeof UI === 'undefined' || !UI._openScreenScrollable) return;

        UI._playSound('click');
        var allTalents = this.getAllTalents();
        var learnedTalents = [];
        for (var i = 0; i < allTalents.length; i++) {
            var lvl = this.getTalentLevel(allTalents[i].id);
            if (lvl > 0) learnedTalents.push(allTalents[i]);
        }
        var p = Sherwood.getPlayer();
        var talentPoints = p ? (p.talentPoints || 0) : 0;

        var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/backgrounds/visual_talents.png\') center/cover no-repeat;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;-ms-overflow-style:none;">';
        h += '<style>.talents-scroll::-webkit-scrollbar { display: none; } .talents-scroll { scrollbar-width: none; }</style>';
        h += '<div class="talents-scroll" style="display:flex;flex-direction:column;align-items:center;padding-top:40px;padding-bottom:60px;width:100%;">';

        // Заголовок
        h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:20px;text-shadow:0 2px 4px #000;">Изученные таланты</div>';

        // Очки талантов
        h += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:30px;">';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;">';
        h += '<img src="assets/assets2/game_details/tablet_of_talents.png" style="width:36px;height:36px;object-fit:contain;">';
        h += '<span style="color:#ffd700;font-size:1.1em;font-weight:bold;text-shadow:0 2px 4px #000;">' + talentPoints + '</span>';
        h += '</div>';
        h += '<div style="color:#888;font-size:0.65em;margin-top:4px;text-align:center;">Доступно очков для распределения</div>';
        h += '</div>';

        if (learnedTalents.length === 0) {
            h += '<div style="color:#aaa;font-size:1em;text-shadow:0 2px 4px #000;">Вы ещё не изучили ни одного таланта.</div>';
        } else {
            h += '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(130px, 1fr));gap:20px;width:95%;max-width:360px;margin-bottom:30px;">';

            for (var i = 0; i < learnedTalents.length; i++) {
                var t = learnedTalents[i];
                var lvl = this.getTalentLevel(t.id);

                h += '<div style="display:flex;flex-direction:column;align-items:center;width:100%;">';
                
                h += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;padding:10px;background:rgba(10,8,5,0.9);border:2px solid #6b5a3a;width:100%;box-shadow:0 4px 15px rgba(0,0,0,0.9);aspect-ratio:1/1;">';
                h += '<img onclick="Sherwood.Talents._showTalentInfo(\'' + t.id + '\')" src="' + t.icon + '" style="display:block;margin:0 auto;width:60px;height:60px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(255,165,0,0.6));cursor:pointer;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                h += '</div>';

                h += '<div onclick="Sherwood.Talents._showTalentInfo(\'' + t.id + '\')" style="color:#e0c080;font-size:0.85em;font-weight:bold;margin-top:10px;text-align:center;cursor:pointer;text-shadow:0 2px 4px #000;line-height:1.2;">' + t.name + '</div>';
                h += '<div style="color:#ffa500;font-size:0.75em;font-weight:bold;margin-top:4px;text-shadow:0 2px 4px #000;">Ур. ' + lvl + '/' + t.maxLevel + '</div>';

                h += '</div>';
            }
            h += '</div>';
        }

        h += '</div>';
        h += '</div>';

        // Возврат в профиль
        UI._openScreenScrollable('Таланты', 'talents', h, 'UI.profile()');
    },

    // ============================================================
    //  ЭКРАН РАСПРЕДЕЛЕНИЯ ТАЛАНТОВ (таверна)
    // ============================================================
    showUI: function() {
        if (typeof UI === 'undefined' || !UI._openScreenScrollable) return;

        UI._playSound('click');
        var allTalents = this.getAllTalents();
        var p = Sherwood.getPlayer();
        var talentPoints = p ? (p.talentPoints || 0) : 0;
        var selectedBranch = this._selectedBranch;

        var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/backgrounds/visual_talents.png\') center/cover no-repeat;overflow-y:auto;overflow-x:hidden;scrollbar-width:none;-ms-overflow-style:none;">';
        h += '<style>.talents-scroll::-webkit-scrollbar { display: none; } .talents-scroll { scrollbar-width: none; }</style>';
        h += '<div class="talents-scroll" style="display:flex;flex-direction:column;align-items:center;padding-top:40px;padding-bottom:60px;width:100%;">';

        // Очки талантов
        h += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:20px;">';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;">';
        h += '<img src="assets/assets2/game_details/tablet_of_talents.png" style="width:36px;height:36px;object-fit:contain;">';
        h += '<span style="color:#ffd700;font-size:1.1em;font-weight:bold;text-shadow:0 2px 4px #000;">' + talentPoints + '</span>';
        h += '</div>';
        h += '<div style="color:#888;font-size:0.65em;margin-top:4px;text-align:center;">Начисляются за получение нового уровня</div>';
        h += '</div>';

        // Вкладки веток
        h += '<div style="display:flex;justify-content:center;gap:6px;margin-bottom:30px;width:90%;max-width:340px;">';
        var branchesOrder = ['damage', 'passive', 'heal'];
        for (var b = 0; b < branchesOrder.length; b++) {
            var branchId = branchesOrder[b];
            var branch = this.BRANCHES[branchId];
            var isActive = (branchId === selectedBranch);
            h += '<div onclick="Sherwood.Talents._selectBranch(\'' + branchId + '\')" style="flex:1;height:40px;background:url(\'assets/interface/all_stat.png\') center/100% 100% no-repeat;border:2px solid ' + (isActive ? branch.color : 'rgba(255,255,255,0.3)') + ';border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.2s;box-shadow:' + (isActive ? '0 0 10px ' + branch.color + '88' : '0 2px 4px rgba(0,0,0,0.5)') + ';">';
            h += '<span style="color:' + (isActive ? branch.color : '#e0c080') + ';font-size:0.75em;font-weight:bold;text-shadow:0 2px 4px #000;">' + branch.name + '</span>';
            h += '</div>';
        }
        h += '</div>';

        var branchTalents = [];
        for (var i = 0; i < allTalents.length; i++) {
            if (allTalents[i].branch === selectedBranch) branchTalents.push(allTalents[i]);
        }

        // Дерево
        h += '<div style="position:relative;width:100%;max-width:340px;display:flex;flex-direction:column;align-items:center;">';

        if (branchTalents.length === 2) {
            h += '<div style="position:absolute;top:40px;left:50%;transform:translateX(-50%);width:150px;height:4px;background:#8b6b3a;z-index:1;border-radius:2px;"></div>';
            h += '<div style="position:absolute;top:0px;left:50%;transform:translateX(-50%);width:4px;height:42px;background:#8b6b3a;z-index:1;"></div>';
            h += '<div style="position:absolute;top:40px;left:calc(50% - 75px);transform:translateX(-50%);width:4px;height:30px;background:#8b6b3a;z-index:1;"></div>';
            h += '<div style="position:absolute;top:40px;left:calc(50% + 75px);transform:translateX(-50%);width:4px;height:30px;background:#8b6b3a;z-index:1;"></div>';
        } 
        else if (branchTalents.length === 1) {
            h += '<div style="position:absolute;top:0px;left:50%;transform:translateX(-50%);width:4px;height:50px;background:#8b6b3a;z-index:1;"></div>';
        }

        h += '<div style="display:flex;justify-content:center;align-items:flex-start;gap:20px;margin-top:70px;z-index:2;width:100%;">';

        for (var j = 0; j < branchTalents.length; j++) {
            var t = branchTalents[j];
            var lvl = this.getTalentLevel(t.id);

            h += '<div style="display:flex;flex-direction:column;align-items:center;width:130px;">';
            
            h += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;padding:10px;background:rgba(10,8,5,0.9);border:2px solid #6b5a3a;width:100%;box-shadow:0 4px 15px rgba(0,0,0,0.9);aspect-ratio:1/1;">';
            h += '<img onclick="Sherwood.Talents._showTalentInfo(\'' + t.id + '\')" src="' + t.icon + '" style="display:block;margin:0 auto;width:70px;height:70px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(255,165,0,0.6));cursor:pointer;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '</div>';

            h += '<div onclick="Sherwood.Talents._showTalentInfo(\'' + t.id + '\')" style="color:#e0c080;font-size:0.85em;font-weight:bold;margin-top:10px;text-align:center;cursor:pointer;text-shadow:0 2px 4px #000;line-height:1.2;">' + t.name + '</div>';

            h += '<div style="color:#ffa500;font-size:0.75em;font-weight:bold;margin-top:4px;margin-bottom:8px;text-shadow:0 2px 4px #000;">Ур. ' + lvl + '/' + t.maxLevel + '</div>';

            h += '<div style="display:flex;align-items:center;justify-content:center;gap:10px;background:rgba(0,0,0,0.6);border-radius:20px;padding:4px 12px;border:1px solid rgba(139,107,58,0.5);">';
            h += '<button onclick="Sherwood.Talents._removePoint(\'' + t.id + '\')" style="background:#f44336;border:none;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;cursor:pointer;font-size:16px;padding:0;">-</button>';
            h += '<span style="color:#fff;font-size:14px;font-weight:bold;min-width:20px;text-shadow:0 2px 4px #000;">' + lvl + '</span>';
            h += '<button onclick="Sherwood.Talents._addPoint(\'' + t.id + '\')" style="background:#4caf50;border:none;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;cursor:pointer;font-size:16px;padding:0;">+</button>';
            h += '</div>';

            h += '</div>';
        }

        h += '</div>';
        h += '</div>';

        // Кнопка "Подтвердить" — теперь выходит в лагерь
        h += '<div style="width:90%;max-width:340px;text-align:center;margin-top:40px;">';
        h += '<button onclick="UI.loadHome()" style="width:100%;background:#c9a040;border:none;border-radius:8px;padding:12px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">Подтвердить и выйти в лагерь</button>';
        h += '</div>';

        h += '</div>';
        h += '</div>';

        // Возврат в лагерь
        UI._openScreenScrollable('Таланты', null, h, 'UI.loadHome()');
    },

    _addPoint: function(id) {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.talentPoints || p.talentPoints <= 0) {
            UI._showToast('Нет очков талантов!');
            return;
        }
        var t = this.getTalentLevel(id);
        var max = 0;
        for (var i = 0; i < this.TALENTS.length; i++) {
            if (this.TALENTS[i].id === id) { max = this.TALENTS[i].maxLevel; break; }
        }
        if (t >= max) {
            UI._showToast('Макс. уровень!');
            return;
        }
        p.talentPoints--;
        this._talentLevels[id] = t + 1;
        p.talents = this._talentLevels;
        Sherwood.saveGame();
        this.showUI();
    },

    _removePoint: function(id) {
        var p = Sherwood.getPlayer();
        if (!p) return;
        var t = this.getTalentLevel(id);
        if (t <= 0) {
            UI._showToast('Уровень 0, нечего убирать');
            return;
        }
        p.talentPoints++;
        this._talentLevels[id] = t - 1;
        p.talents = this._talentLevels;
        Sherwood.saveGame();
        this.showUI();
    },

    _confirmTalents: function() {
        UI._showToast('Таланты распределены!');
        UI.loadHome();
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

console.log('⚡ Таланты загружены (v10: шрифт как на табличках, возврат в лагерь)');

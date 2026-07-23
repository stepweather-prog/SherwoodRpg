Sherwood.Tavern = {
    _currentQuest: null,
    _questsCompleted: 0,
    _dailyCompleted: 0,
    _lastAttemptTime: 0,
    _battleMode: true,
    _cooldown: 25 * 60 * 1000,
    _rowCooldown: 12 * 60 * 60 * 1000,
    _allCompleted: false,

    ROWS: [
        {
            id: 'row1', name: 'Заботы Шервудского леса', npc: 'Старый егерь Бертрам',
            unlockChapter: 1,
            quests: [
                { name: 'Волчья стая', desc: 'Разогнать стаю волков у восточной опушки.', enemy: { name: 'Матерый волк', image: 'image (32).png', hp: 250, atk: 22, def: 8 }, reward: { exp: 60, gold: 50, silver: 200 } },
                { name: 'Пропавший дровосек', desc: 'Найти дровосека в туманной чаще.', enemy: { name: 'Болотный упырь', image: 'image (17).png', hp: 200, atk: 20, def: 6 }, reward: { exp: 55, gold: 45, silver: 180 } },
                { name: 'Ядовитые споры', desc: 'Собрать образцы спор.', enemy: { name: 'Лесной дух', image: 'image (1).png', hp: 180, atk: 16, def: 5 }, reward: { exp: 50, gold: 40, silver: 150 } },
                { name: 'Браконьеры', desc: 'Прогнать браконьеров из рощи.', enemy: { name: 'Призрак разбойника', image: 'image (41).png', hp: 300, atk: 26, def: 10 }, reward: { exp: 70, gold: 55, silver: 220 } }
            ]
        },
        {
            id: 'row2', name: 'Тревоги Первородного болота', npc: 'Травница Мора',
            unlockChapter: 5,
            quests: [
                { name: 'Трясина', desc: 'Найти редкий болотный цветок.', enemy: { name: 'Кикимора болотная', image: 'image (13).png', hp: 350, atk: 30, def: 12 }, reward: { exp: 80, gold: 65, silver: 300 } },
                { name: 'Утопленник', desc: 'Упокоить бродячего утопленника.', enemy: { name: 'Болотный утопленник', image: 'image (12).png', hp: 400, atk: 34, def: 14 }, reward: { exp: 90, gold: 75, silver: 350 } },
                { name: 'Змеиное логово', desc: 'Зачистить логово гадюк.', enemy: { name: 'Костяной гигант', image: 'image (14).png', hp: 500, atk: 40, def: 18 }, reward: { exp: 110, gold: 100, silver: 450 } },
                { name: 'Дух трясины', desc: 'Изгнать злого духа.', enemy: { name: 'Рогатая кикимора', image: 'image (16).png', hp: 550, atk: 44, def: 20 }, reward: { exp: 130, gold: 120, silver: 500 } }
            ]
        },
        {
            id: 'row3', name: 'Опасности Базальтовых шахт', npc: 'Шахтёр Грим',
            unlockChapter: 9,
            quests: [
                { name: 'Обвал', desc: 'Спасти шахтёров из-под завала.', enemy: { name: 'Трёхглавый пёс', image: 'image (10).png', hp: 600, atk: 50, def: 24 }, reward: { exp: 140, gold: 130, silver: 600 } },
                { name: 'Кристальная жила', desc: 'Добыть редкий кристалл.', enemy: { name: 'Кристаллический ёж', image: 'image (37).png', hp: 700, atk: 56, def: 28 }, reward: { exp: 160, gold: 150, silver: 700 } },
                { name: 'Пещерный ужас', desc: 'Убить тварь в шахтах.', enemy: { name: 'Волк-оборотень', image: 'image (34).png', hp: 800, atk: 62, def: 32 }, reward: { exp: 200, gold: 180, silver: 850 } },
                { name: 'Древний механизм', desc: 'Активировать механизм гномов.', enemy: { name: 'Заражённый секач', image: 'image (11).png', hp: 900, atk: 68, def: 36 }, reward: { exp: 240, gold: 220, silver: 1000 } }
            ]
        },
        {
            id: 'row4', name: 'Поручения Хранителя', npc: 'Хранитель Шервуда',
            unlockChapter: 13,
            quests: [
                { name: 'Скрижаль портала', desc: 'Добыть скрижаль для портала.', enemy: { name: 'Изумрудный призрак', image: 'image (77).png', hp: 1200, atk: 80, def: 42 }, reward: { exp: 300, gold: 280, silver: 1500 } },
                { name: 'Отродье', desc: 'Уничтожить отродье из разлома.', enemy: { name: 'Мясной инсектоид', image: 'image (55).png', hp: 1500, atk: 95, def: 50 }, reward: { exp: 400, gold: 380, silver: 2000 } },
                { name: 'Древний страж', desc: 'Одолеть стража врат.', enemy: { name: 'Рунический Джаггернаут', image: 'image (79).png', hp: 2000, atk: 115, def: 60 }, reward: { exp: 550, gold: 500, silver: 3000 } },
                { name: 'Последний долг', desc: 'Запечатать последний разлом.', enemy: { name: 'Шервудское Отродье', image: 'image (2).png', hp: 3000, atk: 140, def: 75 }, reward: { exp: 800, gold: 750, silver: 5000 } }
            ]
        }
    ],

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p.tavern) p.tavern = {
            questsCompleted: 0, dailyCompleted: 0, lastAttempt: 0, battleMode: true,
            completedQuests: [], rowCooldowns: {}, allCompleted: false, lastDailyReset: ''
        };
        var t = p.tavern;
        this._questsCompleted = t.questsCompleted || 0;
        this._dailyCompleted = t.dailyCompleted || 0;
        this._lastAttemptTime = t.lastAttempt || 0;
        this._battleMode = t.battleMode !== false;
        this._allCompleted = t.allCompleted || false;
        var today = new Date().toDateString();
        if (t.lastDailyReset !== today) { t.dailyCompleted = 0; t.lastDailyReset = today; this._dailyCompleted = 0; }
        if (this._questsCompleted >= 100) this._allCompleted = true;
    },

    getAvailableRows: function() {
        var p = Sherwood.getPlayer();
        var completed = p.questProgress ? (p.questProgress.completed || []) : [];
        var rows = [];
        for (var i = 0; i < this.ROWS.length; i++) {
            var row = this.ROWS[i];
            if (row.unlockChapter === 1 || completed.indexOf(row.unlockChapter - 1) !== -1) {
                var t = p.tavern;
                var rowCd = (t.rowCooldowns && t.rowCooldowns[row.id]) ? t.rowCooldowns[row.id] : 0;
                if (rowCd && Date.now() - rowCd < this._rowCooldown) continue;
                rows.push(row);
            }
        }
        return rows;
    },

    getCurrentQuest: function() { return this._currentQuest; },
    isOnCooldown: function() { return Date.now() - this._lastAttemptTime < this._cooldown; },
    getCooldownRemaining: function() {
        var r = this._cooldown - (Date.now() - this._lastAttemptTime);
        return r <= 0 ? 0 : Math.ceil(r / 60000);
    },
    getBattleMode: function() { return this._battleMode; },
    isAllCompleted: function() { return this._allCompleted; },

    startQuest: function(rowIndex, questIndex) {
        if (this.isOnCooldown()) return { success: false, reason: 'Перезарядка ' + this.getCooldownRemaining() + ' мин.' };
        var rows = this.getAvailableRows();
        if (rowIndex < 0 || rowIndex >= rows.length) return { success: false, reason: 'Ряд недоступен' };
        var row = rows[rowIndex];
        if (questIndex < 0 || questIndex >= row.quests.length) return { success: false, reason: 'Квест не найден' };
        this._currentQuest = { row: row, quest: row.quests[questIndex], rowIndex: rowIndex, questIndex: questIndex };
        return { success: true, quest: this._currentQuest, mode: (this._allCompleted || !this._battleMode) ? 'auto' : 'battle' };
    },

    completeQuest: function() {
        if (!this._currentQuest) return null;
        var q = this._currentQuest.quest;
        var r = q.reward;
        Sherwood.addExp(r.exp);
        Sherwood.addResource('gold', r.gold);
        Sherwood.addResource('silver', r.silver);
        if (Math.random() < 0.2) Sherwood.addResource('scrolls', 1 + Math.floor(Math.random() * 2));
        this._questsCompleted++;
        this._dailyCompleted++;
        this._lastAttemptTime = Date.now();
        this._battleMode = this._allCompleted ? true : !this._battleMode;
        var p = Sherwood.getPlayer();
        var t = p.tavern;
        t.questsCompleted = this._questsCompleted;
        t.dailyCompleted = this._dailyCompleted;
        t.lastAttempt = this._lastAttemptTime;
        t.battleMode = this._battleMode;
        t.allCompleted = this._allCompleted;
        if (!t.completedQuests) t.completedQuests = [];
        t.completedQuests.push(this._currentQuest.quest.name);
        if (this._questsCompleted >= 100) { this._allCompleted = true; t.allCompleted = true; }
        var row = this._currentQuest.row;
        var rowComplete = row.quests.every(function(q) { return t.completedQuests.indexOf(q.name) !== -1; });
        if (rowComplete) {
            if (!t.rowCooldowns) t.rowCooldowns = {};
            t.rowCooldowns[row.id] = Date.now();
        }
        var dailyBonus = null;
        if (this._dailyCompleted > 0 && this._dailyCompleted % 10 === 0) {
            dailyBonus = { autoRuns: 5, dungeonTickets: 5 };
            p.dungeon.tickets = Math.min(p.dungeon.maxTickets || 5, (p.dungeon.tickets || 0) + 5);
        }
        Sherwood.saveGame();
        var result = { success: true, reward: r, nextMode: this._battleMode, dailyBonus: dailyBonus };
        this._currentQuest = null;
        return result;
    },

    failQuest: function() {
        this._lastAttemptTime = Date.now();
        this._battleMode = false;
        var p = Sherwood.getPlayer();
        p.tavern.lastAttempt = this._lastAttemptTime;
        p.tavern.battleMode = false;
        this._currentQuest = null;
        Sherwood.saveGame();
    },

    cancelQuest: function() { this._currentQuest = null; return { success: true }; },
    getCompletedCount: function() { return this._questsCompleted; },
    getDailyCompleted: function() { return this._dailyCompleted; },
    getBattleMode: function() { return this._battleMode; },

    autoBattle: function() {
        if (!this._currentQuest) return { success: false, reason: 'Нет активного квеста' };
        var p = Sherwood.getPlayer();
        var e = this._currentQuest.quest.enemy;
        var chance = Math.min(90, 50 + p.stats.attack * 0.2 + p.stats.agility * 0.1);
        if (Math.random() * 100 < chance) {
            var r = this.completeQuest();
            return { success: true, completed: true, reward: r.reward, dailyBonus: r.dailyBonus };
        }
        this._lastAttemptTime = Date.now();
        this._battleMode = false;
        var p2 = Sherwood.getPlayer();
        p2.tavern.lastAttempt = this._lastAttemptTime;
        p2.tavern.battleMode = false;
        Sherwood.saveGame();
        return { success: true, completed: false, failed: true, damage: Math.floor(Math.random() * 25) + 10 };
    }
};

Sherwood.Daily = {
    _dailyQuests: [],
    _chapterQuests: {},
    _dailyCompleted: [],
    _chapterCompleted: [],
    _lastRefresh: '',

    DAILY_TEMPLATES: [
        { id: 'kill_beasts', name: 'Истребитель', desc: 'Убить 50 бестий', target: 50, type: 'kill_beasts', reward: { gold: 10, silver: 500, exp: 100 } },
        { id: 'dungeon_floors', name: 'Подземный герой', desc: 'Пройти 3 этажа подземок', target: 3, type: 'dungeon_floors', reward: { gold: 15, silver: 400, exp: 120 } },
        { id: 'quest_fights', name: 'Квестовый боец', desc: 'Сразиться 5 раз в квестах', target: 5, type: 'quest_fights', reward: { gold: 15, silver: 300, exp: 120 } },
        { id: 'open_chests', name: 'Кладоискатель', desc: 'Открыть 5 сундуков', target: 5, type: 'open_chests', reward: { gold: 10, silver: 350, exp: 90 } },
        { id: 'collect_loot', name: 'Собиратель', desc: 'Собрать 20 предметов лута', target: 20, type: 'collect_loot', reward: { gold: 20, silver: 600, exp: 150 } },
        { id: 'tavern_daily', name: 'Завсегдатай', desc: 'Выполнить задание таверны', target: 1, type: 'tavern_complete', reward: { gold: 20, silver: 500, exp: 150 } },
        { id: 'arena_wins', name: 'Гладиатор', desc: 'Победить на арене 3 раза', target: 3, type: 'arena_wins', reward: { gold: 25, silver: 700, exp: 200 } }
    ],

    CHAPTER_TEMPLATES: [
        { chapter: 1, quests: [
            { id: 'ch1_kill', name: 'Лесной патруль', desc: 'Убить 20 врагов', target: 20, type: 'kill_beasts', reward: { gold: 20, silver: 400, exp: 150 } },
            { id: 'ch1_dungeon', name: 'Глубины чащи', desc: 'Пройти 2 этажа подземки', target: 2, type: 'dungeon_floors', reward: { gold: 25, silver: 500, exp: 180 } },
            { id: 'ch1_train', name: 'Сила охотника', desc: 'Поднять Атаку до 20', target: 20, type: 'stat_attack', reward: { gold: 15, silver: 300, exp: 100 } },
            { id: 'ch1_chest', name: 'Лесной клад', desc: 'Открыть 3 сундука', target: 3, type: 'open_chests', reward: { gold: 20, silver: 350, exp: 130 } },
            { id: 'ch1_boss', name: 'Победить Лесное Лихо', desc: 'Убить босса 1 главы', target: 1, type: 'kill_boss_ch1', reward: { gold: 50, silver: 1000, exp: 300 } },
            { id: 'ch1_collect', name: 'Сбор ресурсов', desc: 'Собрать 10 предметов', target: 10, type: 'collect_loot', reward: { gold: 15, silver: 250, exp: 100 } },
            { id: 'ch1_arena', name: 'Новичок арены', desc: 'Победить на арене 1 раз', target: 1, type: 'arena_wins', reward: { gold: 30, silver: 500, exp: 200 } }
        ]},
        { chapter: 2, quests: [
            { id: 'ch2_kill', name: 'Болотный охотник', desc: 'Убить 30 врагов', target: 30, type: 'kill_beasts', reward: { gold: 30, silver: 600, exp: 200 } },
            { id: 'ch2_dungeon', name: 'Топи болот', desc: 'Пройти 3 этажа подземки', target: 3, type: 'dungeon_floors', reward: { gold: 35, silver: 700, exp: 250 } },
            { id: 'ch2_train', name: 'Непробиваемый', desc: 'Поднять Защиту до 30', target: 30, type: 'stat_defense', reward: { gold: 25, silver: 400, exp: 150 } },
            { id: 'ch2_chest', name: 'Болотные дары', desc: 'Открыть 5 сундуков', target: 5, type: 'open_chests', reward: { gold: 30, silver: 500, exp: 180 } },
            { id: 'ch2_boss', name: 'Победить Лихо', desc: 'Убить босса 2 главы', target: 1, type: 'kill_boss_ch2', reward: { gold: 80, silver: 1500, exp: 500 } },
            { id: 'ch2_collect', name: 'Собиратель болот', desc: 'Собрать 15 предметов', target: 15, type: 'collect_loot', reward: { gold: 20, silver: 400, exp: 150 } },
            { id: 'ch2_quest', name: 'Квестовый воин', desc: 'Сразиться 3 раза в квестах', target: 3, type: 'quest_fights', reward: { gold: 30, silver: 600, exp: 200 } },
            { id: 'ch2_ring', name: 'Кольцо силы', desc: 'Добыть кольцо', target: 1, type: 'get_ring', reward: { gold: 50, silver: 800, exp: 300 } }
        ]},
        { chapter: 3, quests: [
            { id: 'ch3_kill', name: 'Пещерный охотник', desc: 'Убить 40 врагов', target: 40, type: 'kill_beasts', reward: { gold: 40, silver: 800, exp: 300 } },
            { id: 'ch3_dungeon', name: 'Глубины шахт', desc: 'Пройти 4 этажа', target: 4, type: 'dungeon_floors', reward: { gold: 50, silver: 900, exp: 350 } },
            { id: 'ch3_train', name: 'Живучий', desc: 'Поднять Здоровье до 300', target: 300, type: 'stat_hp', reward: { gold: 35, silver: 500, exp: 200 } },
            { id: 'ch3_chest', name: 'Сокровища шахт', desc: 'Открыть 7 сундуков', target: 7, type: 'open_chests', reward: { gold: 40, silver: 700, exp: 250 } },
            { id: 'ch3_boss', name: 'Победить Хозяина', desc: 'Убить босса 3 главы', target: 1, type: 'kill_boss_ch3', reward: { gold: 120, silver: 2000, exp: 700 } },
            { id: 'ch3_collect', name: 'Шахтёр', desc: 'Собрать 20 предметов', target: 20, type: 'collect_loot', reward: { gold: 30, silver: 500, exp: 200 } },
            { id: 'ch3_amulet', name: 'Амулет защиты', desc: 'Добыть амулет', target: 1, type: 'get_amulet', reward: { gold: 80, silver: 1200, exp: 400 } },
            { id: 'ch3_tavern', name: 'Посетитель таверны', desc: 'Выполнить 2 задания таверны', target: 2, type: 'tavern_complete', reward: { gold: 50, silver: 800, exp: 300 } },
            { id: 'ch3_train_agi', name: 'Быстрый как ветер', desc: 'Поднять Ловкость до 25', target: 25, type: 'stat_agility', reward: { gold: 30, silver: 500, exp: 200 } },
            { id: 'ch3_arena', name: 'Боец арены', desc: 'Победить на арене 5 раз', target: 5, type: 'arena_wins', reward: { gold: 60, silver: 1000, exp: 400 } }
        ]}
    ],

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.daily) p.daily = { completed: [], chapterCompleted: [], lastRefresh: '', dailyQuests: [], chapterQuests: {}, progress: {} };
        var today = new Date().toDateString();
        if (p.daily.lastRefresh !== today) {
            p.daily.completed = [];
            p.daily.dailyQuests = this._generateDailyQuests();
            p.daily.lastRefresh = today;
            if (p.daily.progress) { for (var key in p.daily.progress) { p.daily.progress[key] = 0; } }
            Sherwood.saveGame();
        }
        this._dailyQuests = p.daily.dailyQuests || [];
        this._dailyCompleted = p.daily.completed || [];
        this._chapterCompleted = p.daily.chapterCompleted || [];
        this._chapterQuests = p.daily.chapterQuests || {};
        this._lastRefresh = p.daily.lastRefresh || today;
    },

    _generateDailyQuests: function() {
        var pool = this.DAILY_TEMPLATES.slice();
        var quests = [];
        for (var i = 0; i < 7; i++) {
            if (pool.length === 0) break;
            var idx = Math.floor(Math.random() * pool.length);
            quests.push(Object.assign({}, pool[idx], { progress: 0, completed: false }));
            pool.splice(idx, 1);
        }
        return quests;
    },

    getChapterQuests: function(chapterId) {
        var p = Sherwood.getPlayer();
        if (!p.daily.chapterQuests) p.daily.chapterQuests = {};
        if (!p.daily.chapterQuests[chapterId]) {
            var template = null;
            for (var i = 0; i < this.CHAPTER_TEMPLATES.length; i++) {
                if (this.CHAPTER_TEMPLATES[i].chapter === chapterId) { template = this.CHAPTER_TEMPLATES[i]; break; }
            }
            if (template) {
                p.daily.chapterQuests[chapterId] = template.quests.map(function(q) {
                    return Object.assign({}, q, { progress: 0, completed: false });
                });
                Sherwood.saveGame();
            } else {
                p.daily.chapterQuests[chapterId] = [];
            }
        }
        return p.daily.chapterQuests[chapterId] || [];
    },

    getDailyQuests: function() { return this._dailyQuests; },
    getDailyCompleted: function() { return this._dailyCompleted; },

    updateProgress: function(type, amount) {
        var p = Sherwood.getPlayer();
        if (!p.daily.progress) p.daily.progress = {};
        var updated = false;
        for (var i = 0; i < this._dailyQuests.length; i++) {
            var q = this._dailyQuests[i];
            if (q.type === type && !q.completed) {
                q.progress = (q.progress || 0) + (amount || 1);
                p.daily.progress[q.id] = q.progress;
                if (q.progress >= q.target) { q.progress = q.target; q.completed = true; }
                updated = true;
            }
        }
        var chQuests = p.daily.chapterQuests || {};
        for (var chId in chQuests) {
            if (!chQuests.hasOwnProperty(chId)) continue;
            for (var j = 0; j < chQuests[chId].length; j++) {
                var cq = chQuests[chId][j];
                if (cq.type === type && !cq.completed) {
                    cq.progress = (cq.progress || 0) + (amount || 1);
                    if (cq.progress >= cq.target) { cq.progress = cq.target; cq.completed = true; }
                    updated = true;
                }
            }
        }
        if (updated) { p.daily.dailyQuests = this._dailyQuests; p.daily.chapterQuests = chQuests; Sherwood.saveGame(); }
    },

    claimDailyReward: function(questIndex) {
        if (questIndex < 0 || questIndex >= this._dailyQuests.length) return { success: false, reason: 'Not found' };
        var q = this._dailyQuests[questIndex];
        if (!q.completed) return { success: false, reason: 'Not done' };
        if (this._dailyCompleted.indexOf(q.id) !== -1) return { success: false, reason: 'Claimed' };
        this._dailyCompleted.push(q.id);
        Sherwood.addExp(q.reward.exp);
        Sherwood.addResource('gold', q.reward.gold);
        Sherwood.addResource('silver', q.reward.silver || 0);
        var p = Sherwood.getPlayer(); p.daily.completed = this._dailyCompleted; Sherwood.saveGame();
        return { success: true, reward: q.reward };
    },

    claimChapterReward: function(chapterId, questIndex) {
        var quests = this.getChapterQuests(chapterId);
        if (questIndex < 0 || questIndex >= quests.length) return { success: false, reason: 'Not found' };
        var q = quests[questIndex];
        if (!q.completed) return { success: false, reason: 'Not done' };
        if (this._chapterCompleted.indexOf(q.id) !== -1) return { success: false, reason: 'Claimed' };
        this._chapterCompleted.push(q.id);
        Sherwood.addExp(q.reward.exp);
        Sherwood.addResource('gold', q.reward.gold);
        if (q.reward.silver) Sherwood.addResource('silver', q.reward.silver);
        var p = Sherwood.getPlayer(); p.daily.chapterCompleted = this._chapterCompleted; Sherwood.saveGame();
        return { success: true, reward: q.reward };
    }
};

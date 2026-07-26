Sherwood.Daily = {
    _dailyQuests: [],
    _chapterQuests: {},
    _dailyCompleted: [],
    _chapterCompleted: [],
    _lastRefresh: '',

    DAILY_TEMPLATES: [
        { id: 'kill_beasts', name: 'Истребитель', desc: 'Убить 50 бестий в подземках', target: 50, type: 'kill_beasts', difficulty: 1, reward: { gold: 10, exp: 100 } },
        { id: 'train_all', name: 'Тренировка', desc: 'Поднять все 4 параметра героя 1 раз', target: 4, type: 'train_all', difficulty: 1, reward: { gold: 10, exp: 80 } },
        { id: 'quest_fights', name: 'Квестовый боец', desc: 'Сразиться 5 раз в квестах', target: 5, type: 'quest_fights', difficulty: 1, reward: { gold: 15, exp: 120 } },
        { id: 'tavern_daily', name: 'Завсегдатай таверны', desc: 'Закрыть ежедневные задания таверны', target: 1, type: 'tavern_complete', difficulty: 2, reward: { gold: 20, exp: 150 } },
        { id: 'sell_items', name: 'Торговец', desc: 'Продать 20 вещей', target: 20, type: 'sell_items', difficulty: 2, reward: { gold: 25, exp: 180 } },
        { id: 'open_chests', name: 'Кладоискатель', desc: 'Открыть 10 сундуков в подземках', target: 10, type: 'open_chests', difficulty: 1, reward: { gold: 10, exp: 90 } },
        { id: 'craft_items', name: 'Кузнец', desc: 'Создать 3 предмета в кузнице', target: 3, type: 'craft_items', difficulty: 2, reward: { gold: 15, exp: 130 } },
        { id: 'portal_runs', name: 'Покоритель порталов', desc: 'Зайти в портал 3 раза', target: 3, type: 'portal_runs', difficulty: 2, reward: { gold: 20, exp: 200 } }
    ],

    CHAPTER_TEMPLATES: [
        { chapter: 1, quests: [
            { id: 'ch1_boss', name: 'Победить Лесное Лихо', desc: 'Убить босса 1 главы', target: 1, type: 'kill_boss_ch1', reward: { gold: 50, exp: 300, silver: 500 } },
            { id: 'ch1_train_atk', name: 'Сила охотника', desc: 'Поднять Атаку до 15', target: 15, type: 'stat_attack', reward: { gold: 20, exp: 100 } },
            { id: 'ch1_beasts', name: 'Лесной патруль', desc: 'Убить 30 врагов в подземках', target: 30, type: 'kill_beasts', reward: { gold: 30, exp: 200, silver: 300 } }
        ]},
        { chapter: 2, quests: [
            { id: 'ch2_boss', name: 'Победить Разъярённое Лихо', desc: 'Убить босса 2 главы', target: 1, type: 'kill_boss_ch2', reward: { gold: 80, exp: 500, silver: 800 } },
            { id: 'ch2_train_def', name: 'Непробиваемый', desc: 'Поднять Защиту до 25', target: 25, type: 'stat_defense', reward: { gold: 40, exp: 200 } },
            { id: 'ch2_ring', name: 'Кольцо силы', desc: 'Добыть кольцо', target: 1, type: 'get_ring', reward: { gold: 60, exp: 300, silver: 500 } }
        ]},
        { chapter: 3, quests: [
            { id: 'ch3_boss', name: 'Победить Хозяина чащи', desc: 'Убить босса 3 главы', target: 1, type: 'kill_boss_ch3', reward: { gold: 120, exp: 700, silver: 1200 } },
            { id: 'ch3_train_hp', name: 'Живучий', desc: 'Поднять Здоровье до 200', target: 200, type: 'stat_hp', reward: { gold: 50, exp: 250 } },
            { id: 'ch3_amulet', name: 'Амулет защиты', desc: 'Добыть амулет', target: 1, type: 'get_amulet', reward: { gold: 80, exp: 400, silver: 700 } }
        ]},
        { chapter: 4, quests: [
            { id: 'ch4_boss', name: 'Победить Призрака Ордена', desc: 'Убить босса 4 главы', target: 1, type: 'kill_boss_ch4', reward: { gold: 160, exp: 900, silver: 1600 } },
            { id: 'ch4_train_agi', name: 'Быстрый как ветер', desc: 'Поднять Ловкость до 15', target: 15, type: 'stat_agility', reward: { gold: 60, exp: 300 } },
            { id: 'ch4_dungeon', name: 'Подземный герой', desc: 'Пройти 5 этажей подземок', target: 5, type: 'dungeon_floors', reward: { gold: 100, exp: 500, silver: 900 } }
        ]},
        { chapter: 5, quests: [
            { id: 'ch5_boss', name: 'Победить Фантомного духа', desc: 'Убить босса 5 главы', target: 1, type: 'kill_boss_ch5', reward: { gold: 200, exp: 1200, silver: 2000 } },
            { id: 'ch5_beasts', name: 'Охотник на нечисть', desc: 'Убить 80 врагов в подземках', target: 80, type: 'kill_beasts', reward: { gold: 100, exp: 600, silver: 1000 } },
            { id: 'ch5_train_two', name: 'Сбалансированный', desc: 'Поднять Атаку до 50 и Защиту до 40', target: 2, type: 'train_two_stats', reward: { gold: 150, exp: 800, silver: 1500 } }
        ]}
    ],

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.daily) {
            p.daily = { completed: [], chapterCompleted: [], lastRefresh: '', dailyQuests: [], chapterQuests: {}, progress: {} };
        }

        var today = new Date().toDateString();
        if (p.daily.lastRefresh !== today) {
            p.daily.completed = [];
            p.daily.dailyQuests = this._generateDailyQuests();
            p.daily.lastRefresh = today;
            // Сбрасываем прогресс ежедневных заданий
            if (p.daily.progress) {
                for (var key in p.daily.progress) {
                    if (p.daily.progress.hasOwnProperty(key)) {
                        p.daily.progress[key] = 0;
                    }
                }
            }
            Sherwood.saveGame();
        }

        this._dailyQuests = p.daily.dailyQuests || [];
        this._dailyCompleted = p.daily.completed || [];
        this._chapterCompleted = p.daily.chapterCompleted || [];
        this._chapterQuests = p.daily.chapterQuests || {};
        this._lastRefresh = p.daily.lastRefresh || today;

        // Восстанавливаем прогресс из сохранения
        if (p.daily.progress) {
            for (var key in p.daily.progress) {
                if (p.daily.progress.hasOwnProperty(key)) {
                    // Применяем сохранённый прогресс к квестам
                    for (var i = 0; i < this._dailyQuests.length; i++) {
                        if (this._dailyQuests[i].id === key) {
                            this._dailyQuests[i].progress = p.daily.progress[key];
                            if (this._dailyQuests[i].progress >= this._dailyQuests[i].target) {
                                this._dailyQuests[i].completed = true;
                            }
                        }
                    }
                }
            }
        }
    },

    _generateDailyQuests: function() {
        var pool = this.DAILY_TEMPLATES.slice();
        var quests = [];
        for (var i = 0; i < 5; i++) {
            if (pool.length === 0) break;
            var idx = Math.floor(Math.random() * pool.length);
            var q = Object.assign({}, pool[idx], { progress: 0, completed: false });
            quests.push(q);
            pool.splice(idx, 1);
        }
        return quests;
    },

    getChapterQuests: function(chapterId) {
        var template = null;
        for (var i = 0; i < this.CHAPTER_TEMPLATES.length; i++) {
            if (this.CHAPTER_TEMPLATES[i].chapter === chapterId) {
                template = this.CHAPTER_TEMPLATES[i];
                break;
            }
        }
        if (!template) return [];

        var p = Sherwood.getPlayer();
        if (!p.daily.chapterQuests) p.daily.chapterQuests = {};
        if (!p.daily.chapterQuests[chapterId]) {
            p.daily.chapterQuests[chapterId] = template.quests.map(function(q) {
                return Object.assign({}, q, { progress: 0, completed: false });
            });
            Sherwood.saveGame();
        }

        this._chapterQuests = p.daily.chapterQuests;
        return this._chapterQuests[chapterId] || [];
    },

    getDailyQuests: function() {
        return this._dailyQuests;
    },

    getDailyCompleted: function() {
        return this._dailyCompleted;
    },

    isChapterComplete: function(chapterId) {
        var quests = this.getChapterQuests(chapterId);
        if (quests.length === 0) return false;
        for (var i = 0; i < quests.length; i++) {
            if (!quests[i].completed) return false;
        }
        return true;
    },

    canProgressToNextChapter: function(chapterId) {
        return this.isChapterComplete(chapterId);
    },

    claimDailyReward: function(questIndex) {
        if (questIndex < 0 || questIndex >= this._dailyQuests.length) {
            return { success: false, reason: 'Квест не найден' };
        }
        var q = this._dailyQuests[questIndex];
        if (!q.completed) {
            return { success: false, reason: 'Квест не выполнен' };
        }
        if (this._dailyCompleted.indexOf(q.id) !== -1) {
            return { success: false, reason: 'Награда уже получена' };
        }

        this._dailyCompleted.push(q.id);
        Sherwood.addExp(q.reward.exp);
        Sherwood.addResource('gold', q.reward.gold);

        var p = Sherwood.getPlayer();
        p.daily.completed = this._dailyCompleted;
        Sherwood.saveGame();
        return { success: true, reward: q.reward };
    },

    claimChapterReward: function(chapterId, questIndex) {
        var quests = this.getChapterQuests(chapterId);
        if (questIndex < 0 || questIndex >= quests.length) {
            return { success: false, reason: 'Квест не найден' };
        }
        var q = quests[questIndex];
        if (!q.completed) {
            return { success: false, reason: 'Квест не выполнен' };
        }
        if (this._chapterCompleted.indexOf(q.id) !== -1) {
            return { success: false, reason: 'Награда уже получена' };
        }

        this._chapterCompleted.push(q.id);
        Sherwood.addExp(q.reward.exp);
        Sherwood.addResource('gold', q.reward.gold);
        if (q.reward.silver) Sherwood.addResource('silver', q.reward.silver);

        var p = Sherwood.getPlayer();
        p.daily.chapterCompleted = this._chapterCompleted;
        Sherwood.saveGame();
        return { success: true, reward: q.reward };
    },

    updateProgress: function(type, amount) {
        var updated = false;
        var p = Sherwood.getPlayer();
        if (!p.daily.progress) p.daily.progress = {};

        // Обновляем ежедневные квесты
        for (var i = 0; i < this._dailyQuests.length; i++) {
            var q = this._dailyQuests[i];
            if (q.type === type && !q.completed) {
                q.progress = (q.progress || 0) + (amount || 1);
                p.daily.progress[q.id] = q.progress;
                if (q.progress >= q.target) {
                    q.progress = q.target;
                    q.completed = true;
                    updated = true;
                }
                updated = true;
            }
        }

        // Обновляем квесты глав
        var chapterQuests = p.daily.chapterQuests || {};
        for (var chId in chapterQuests) {
            if (!chapterQuests.hasOwnProperty(chId)) continue;
            var quests = chapterQuests[chId];
            for (var j = 0; j < quests.length; j++) {
                var q = quests[j];
                if (q.type === type && !q.completed) {
                    q.progress = (q.progress || 0) + (amount || 1);
                    if (q.progress >= q.target) {
                        q.progress = q.target;
                        q.completed = true;
                        updated = true;
                    }
                    updated = true;
                }
            }
        }

        if (updated) {
            // Сохраняем изменения
            p.daily.dailyQuests = this._dailyQuests;
            p.daily.chapterQuests = chapterQuests;
            Sherwood.saveGame();
        }
    },

    // Сброс прогресса (для отладки или тестирования)
    reset: function() {
        var p = Sherwood.getPlayer();
        if (p && p.daily) {
            p.daily.completed = [];
            p.daily.chapterCompleted = [];
            p.daily.progress = {};
            p.daily.dailyQuests = this._generateDailyQuests();
            this._dailyCompleted = [];
            this._chapterCompleted = [];
            this._dailyQuests = p.daily.dailyQuests;
            Sherwood.saveGame();
        }
    }
};

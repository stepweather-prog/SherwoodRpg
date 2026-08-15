/**
 * Sherwood Daily — Ежедневные квесты и квесты глав (15 глав)
 */

Sherwood.Daily = (function() {
    'use strict';

    var DAILY_QUESTS_PER_DAY = 4;

    var CHAPTER_REQUIREMENTS = {};
    for (var i = 1; i <= 15; i++) {
        CHAPTER_REQUIREMENTS[i] = { 
            minLevel: 1 + (i - 1) * 3, 
            requiredChapter: i > 1 ? i - 1 : null 
        };
    }

    var DAILY_TEMPLATES = [
        { id: 'dq_kill_beasts',    name: 'Истребитель',         desc: 'Убить {t} бестий',          target: 50, type: 'kill_beasts',      reward: { gold: 10, silver: 500, exp: 100 } },
        { id: 'dq_dungeon_floors', name: 'Подземный герой',     desc: 'Пройти {t} этажей подземок', target: 3,  type: 'dungeon_floors',   reward: { gold: 15, silver: 400, exp: 120 } },
        { id: 'dq_quest_fights',   name: 'Квестовый боец',      desc: 'Сразиться {t} раз в квестах', target: 5, type: 'quest_fights',    reward: { gold: 15, silver: 300, exp: 120 } },
        { id: 'dq_open_chests',    name: 'Кладоискатель',        desc: 'Открыть {t} сундуков',       target: 5,  type: 'open_chests',     reward: { gold: 10, silver: 350, exp: 90 } },
        { id: 'dq_collect_loot',   name: 'Собиратель',           desc: 'Собрать {t} предметов лута', target: 20, type: 'collect_loot',    reward: { gold: 20, silver: 600, exp: 150 } },
        { id: 'dq_tavern',         name: 'Завсегдатай',          desc: 'Выполнить задание таверны',  target: 1,  type: 'tavern_complete',  reward: { gold: 20, silver: 500, exp: 150 } },
        { id: 'dq_arena_wins',     name: 'Гладиатор',            desc: 'Победить на арене {t} раз',  target: 3,  type: 'arena_wins',      reward: { gold: 25, silver: 700, exp: 200 } },
        { id: 'dq_craft_items',    name: 'Кузнец',               desc: 'Скрафтить {t} предметов',    target: 3,  type: 'craft_items',     reward: { gold: 15, silver: 450, exp: 130 } },
        { id: 'dq_sell_items',     name: 'Торговец',             desc: 'Продать {t} предметов',      target: 10, type: 'sell_items',      reward: { gold: 25, silver: 300, exp: 110 } },
        { id: 'dq_use_potions',    name: 'Травник',              desc: 'Использовать {t} зелий',     target: 5,  type: 'use_potions',     reward: { gold: 10, silver: 400, exp: 100 } }
    ];

    var CHAPTER_TEMPLATES = [];

    // Генерация шаблонов для 15 глав
    var chapterNames = [
        '', 'Проклятие Зелёного Сердца', 'Чёрный орден', 'Рождение Охотника',
        'Бестии Смертной Чащи', 'Шепот Тёмного Лешего', 'Твари Искажённой Эволюции',
        'Эхо Прошлых Сражений', 'Ужас Болотных Недр', 'Первые Трофеи',
        'Открытие Порталов', 'Королева Короедов', 'Призрачный Король',
        'Хранитель Склепа', 'Пробуждение Отродья', 'Доспех Вечности'
    ];

    for (var ch = 1; ch <= 15; ch++) {
        var targetBase = ch * 20;
        var rewardMult = ch;
        
        CHAPTER_TEMPLATES.push({
            chapter: ch,
            name: chapterNames[ch] || ('Глава ' + ch),
            quests: [
                { id: 'ch' + ch + '_kill',     name: 'Охотник главы ' + ch,      desc: 'Убить {t} врагов',                 target: targetBase,          type: 'kill_beasts',     reward: { gold: 20 * rewardMult, silver: 400 * rewardMult, exp: 150 * rewardMult } },
                { id: 'ch' + ch + '_dungeon',  name: 'Подземелья главы ' + ch,  desc: 'Пройти {t} этажей подземки',      target: Math.min(2 + ch, 10), type: 'dungeon_floors',  reward: { gold: 25 * rewardMult, silver: 500 * rewardMult, exp: 180 * rewardMult } },
                { id: 'ch' + ch + '_train',    name: 'Сила главы ' + ch,        desc: 'Поднять Атаку до {t}',            target: 20 + ch * 10,       type: 'stat_attack',    reward: { gold: 15 * rewardMult, silver: 300 * rewardMult, exp: 100 * rewardMult } },
                { id: 'ch' + ch + '_chest',    name: 'Клады главы ' + ch,       desc: 'Открыть {t} сундуков',             target: 3 + ch,             type: 'open_chests',    reward: { gold: 20 * rewardMult, silver: 350 * rewardMult, exp: 130 * rewardMult } },
                { id: 'ch' + ch + '_boss',     name: 'Босс главы ' + ch,        desc: 'Убить босса ' + ch + ' главы',   target: 1,                    type: 'kill_boss_ch' + ch, reward: { gold: 50 * rewardMult, silver: 1000 * rewardMult, exp: 300 * rewardMult } },
                { id: 'ch' + ch + '_collect',  name: 'Сбор главы ' + ch,        desc: 'Собрать {t} предметов',            target: 10 + ch * 2,        type: 'collect_loot',   reward: { gold: 15 * rewardMult, silver: 250 * rewardMult, exp: 100 * rewardMult } },
                { id: 'ch' + ch + '_arena',    name: 'Арена главы ' + ch,       desc: 'Победить на арене {t} раз',        target: Math.min(1 + ch, 20), type: 'arena_wins',   reward: { gold: 30 * rewardMult, silver: 500 * rewardMult, exp: 200 * rewardMult } }
            ]
        });
    }

    var _dailyQuests = [];
    var _dailyClaimed = [];
    var _chapterClaimed = [];
    var _lastRefresh = '';
    var _listeners = {};

    function _randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function _getTodayString() {
        return new Date().toDateString();
    }

    function _getPlayer() {
        return Sherwood.getPlayer();
    }

    function _emit(event, data) {
        var callbacks = _listeners[event];
        if (!callbacks) return;
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](data);
        }
    }

    function _ensureDailyData(p) {
        if (!p.daily) {
            p.daily = {
                dailyQuests: [],
                dailyProgress: {},
                dailyClaimed: [],
                chapterProgress: {},
                chapterClaimed: [],
                chapterQuests: {},
                lastRefresh: ''
            };
        }
        if (!p.daily.dailyClaimed) p.daily.dailyClaimed = [];
        if (!p.daily.chapterClaimed) p.daily.chapterClaimed = [];
        if (!p.daily.chapterProgress) p.daily.chapterProgress = {};
        if (!p.daily.chapterQuests) p.daily.chapterQuests = {};
        if (!p.daily.dailyProgress) p.daily.dailyProgress = {};
    }

    function _formatDesc(template, target) {
        return (template || '').replace('{t}', target);
    }

    function _instantiateQuest(template) {
        return {
            id: template.id,
            name: template.name,
            desc: _formatDesc(template.desc, template.target),
            target: template.target,
            type: template.type,
            reward: JSON.parse(JSON.stringify(template.reward)),
            progress: 0,
            completed: false
        };
    }

    function _generateDailyQuests() {
        var pool = DAILY_TEMPLATES.slice();
        var selected = [];
        var count = Math.min(DAILY_QUESTS_PER_DAY, pool.length);

        for (var i = 0; i < count && pool.length > 0; i++) {
            var idx = _randomInt(0, pool.length - 1);
            selected.push(_instantiateQuest(pool[idx]));
            pool.splice(idx, 1);
        }

        return selected;
    }

    function _isChapterUnlocked(chapterId) {
        var req = CHAPTER_REQUIREMENTS[chapterId];
        if (!req) return false;

        var p = _getPlayer();
        if (!p) return false;

        if ((p.level || 1) < req.minLevel) return false;

        if (req.requiredChapter !== null) {
            var prevBossType = 'kill_boss_ch' + req.requiredChapter;
            var prevQuests = p.daily.chapterQuests[req.requiredChapter];
            if (!prevQuests) return false;

            var bossKilled = false;
            for (var i = 0; i < prevQuests.length; i++) {
                if (prevQuests[i].type === prevBossType && prevQuests[i].completed) {
                    bossKilled = true;
                    break;
                }
            }
            if (!bossKilled) return false;
        }

        return true;
    }

    function _saveDaily() {
        var p = _getPlayer();
        if (!p) return;
        p.daily.dailyQuests = _dailyQuests;
        p.daily.dailyProgress = {};
        for (var i = 0; i < _dailyQuests.length; i++) {
            var q = _dailyQuests[i];
            if (q.progress > 0) {
                p.daily.dailyProgress[q.id] = q.progress;
            }
        }
        p.daily.dailyClaimed = _dailyClaimed;
        p.daily.chapterClaimed = _chapterClaimed;
        p.daily.lastRefresh = _lastRefresh;
        
        var chapterQuests = p.daily.chapterQuests || {};
        var chapterProgress = p.daily.chapterProgress || {};
        for (var chId in chapterQuests) {
            if (!chapterQuests.hasOwnProperty(chId)) continue;
            for (var j = 0; j < chapterQuests[chId].length; j++) {
                var cq = chapterQuests[chId][j];
                if (cq.progress > 0) {
                    chapterProgress[cq.id] = cq.progress;
                }
                if (cq.completed) {
                    chapterProgress[cq.id] = cq.target;
                }
            }
        }
        p.daily.chapterProgress = chapterProgress;
        p.daily.chapterQuests = chapterQuests;
        
        Sherwood.saveGame();
    }

    return {
        CHAPTER_TEMPLATES: CHAPTER_TEMPLATES,
        CHAPTER_REQUIREMENTS: CHAPTER_REQUIREMENTS,

        init: function() {
            var p = _getPlayer();
            if (!p) return;

            _ensureDailyData(p);

            var today = _getTodayString();

            if (p.daily.lastRefresh === today && p.daily.dailyQuests && p.daily.dailyQuests.length > 0) {
                _dailyQuests = p.daily.dailyQuests;
                _dailyClaimed = p.daily.dailyClaimed || [];
                _chapterClaimed = p.daily.chapterClaimed || [];

                var progress = p.daily.dailyProgress || {};
                for (var i = 0; i < _dailyQuests.length; i++) {
                    var q = _dailyQuests[i];
                    if (progress[q.id] !== undefined) {
                        q.progress = progress[q.id];
                        if (q.progress >= q.target) {
                            q.progress = q.target;
                            q.completed = true;
                        }
                    }
                }
            } else {
                _dailyQuests = _generateDailyQuests();
                _dailyClaimed = [];
                p.daily.dailyProgress = {};
                p.daily.dailyClaimed = [];
                p.daily.lastRefresh = today;
                p.daily.dailyQuests = _dailyQuests;
                Sherwood.saveGame();
            }

            _lastRefresh = today;
            _chapterClaimed = p.daily.chapterClaimed || [];

            var chapterProgress = p.daily.chapterProgress || {};
            var chapterQuests = p.daily.chapterQuests || {};
            for (var chId in chapterQuests) {
                if (!chapterQuests.hasOwnProperty(chId)) continue;
                var quests = chapterQuests[chId];
                for (var j = 0; j < quests.length; j++) {
                    var cq = quests[j];
                    if (chapterProgress[cq.id] !== undefined) {
                        cq.progress = chapterProgress[cq.id];
                        if (cq.progress >= cq.target) {
                            cq.progress = cq.target;
                            cq.completed = true;
                        }
                    }
                }
            }

            _emit('init', { dailyQuests: _dailyQuests });
        },

        getDailyQuests: function() {
            return _dailyQuests.slice();
        },

        getChapterInfo: function(chapterId) {
            var template = null;
            for (var i = 0; i < CHAPTER_TEMPLATES.length; i++) {
                if (CHAPTER_TEMPLATES[i].chapter === chapterId) {
                    template = CHAPTER_TEMPLATES[i];
                    break;
                }
            }
            if (!template) return null;

            var unlocked = _isChapterUnlocked(chapterId);
            var req = CHAPTER_REQUIREMENTS[chapterId] || {};

            return {
                chapter: chapterId,
                name: template.name,
                unlocked: unlocked,
                requirement: req,
                questCount: template.quests.length
            };
        },

        getChapterQuests: function(chapterId) {
            var p = _getPlayer();
            _ensureDailyData(p);

            if (!p.daily.chapterQuests[chapterId]) {
                var template = null;
                for (var i = 0; i < CHAPTER_TEMPLATES.length; i++) {
                    if (CHAPTER_TEMPLATES[i].chapter === chapterId) {
                        template = CHAPTER_TEMPLATES[i];
                        break;
                    }
                }

                if (!template) {
                    p.daily.chapterQuests[chapterId] = [];
                    return [];
                }

                p.daily.chapterQuests[chapterId] = template.quests.map(function(q) {
                    return _instantiateQuest(q);
                });
                Sherwood.saveGame();
            }

            return p.daily.chapterQuests[chapterId];
        },

        updateProgress: function(type, amount) {
            var p = _getPlayer();
            if (!p || !p.daily) return { updated: false, completedQuests: [] };

            amount = amount || 1;
            var updated = false;
            var completedQuests = [];

            for (var i = 0; i < _dailyQuests.length; i++) {
                var q = _dailyQuests[i];
                if (q.type !== type || q.completed) continue;

                q.progress = Math.min(q.target, (q.progress || 0) + amount);
                updated = true;

                if (q.progress >= q.target) {
                    q.completed = true;
                    completedQuests.push({ source: 'daily', quest: q });
                    _emit('questCompleted', { source: 'daily', quest: q });
                }
            }

            var chapterQuests = p.daily.chapterQuests || {};
            for (var chId in chapterQuests) {
                if (!chapterQuests.hasOwnProperty(chId)) continue;
                var quests = chapterQuests[chId];
                for (var j = 0; j < quests.length; j++) {
                    var cq = quests[j];
                    if (cq.type !== type || cq.completed) continue;

                    cq.progress = Math.min(cq.target, (cq.progress || 0) + amount);
                    updated = true;

                    if (!p.daily.chapterProgress) p.daily.chapterProgress = {};
                    p.daily.chapterProgress[cq.id] = cq.progress;

                    if (cq.progress >= cq.target) {
                        cq.completed = true;
                        completedQuests.push({ source: 'chapter', chapterId: chId, quest: cq });
                        _emit('questCompleted', { source: 'chapter', chapterId: chId, quest: cq });
                    }
                }
            }

            if (updated) {
                _saveDaily();
            }

            return { updated: updated, completedQuests: completedQuests };
        },

        claimDailyReward: function(questId) {
            var quest = null;
            for (var i = 0; i < _dailyQuests.length; i++) {
                if (_dailyQuests[i].id === questId) { quest = _dailyQuests[i]; break; }
            }

            if (!quest) return { success: false, reason: 'Квест не найден' };
            if (!quest.completed) return { success: false, reason: 'Квест не выполнен' };
            if (_dailyClaimed.indexOf(questId) !== -1) return { success: false, reason: 'Награда уже получена' };

            _dailyClaimed.push(questId);

            if (Sherwood.addExp) Sherwood.addExp(quest.reward.exp);
            if (Sherwood.addResource) {
                Sherwood.addResource('gold', quest.reward.gold);
                if (quest.reward.silver) Sherwood.addResource('silver', quest.reward.silver);
            }

            _saveDaily();

            var result = { success: true, reward: quest.reward, quest: quest };
            _emit('rewardClaimed', { source: 'daily', questId: questId, reward: quest.reward });

            return result;
        },

        claimChapterReward: function(chapterId, questId) {
            var p = _getPlayer();
            if (!p || !p.daily) return { success: false, reason: 'Ошибка данных' };

            var quests = this.getChapterQuests(chapterId);
            var quest = null;
            for (var i = 0; i < quests.length; i++) {
                if (quests[i].id === questId) { quest = quests[i]; break; }
            }

            if (!quest) return { success: false, reason: 'Квест не найден' };
            if (!quest.completed) return { success: false, reason: 'Квест не выполнен' };
            if (_chapterClaimed.indexOf(questId) !== -1) return { success: false, reason: 'Награда уже получена' };

            _chapterClaimed.push(questId);

            if (Sherwood.addExp) Sherwood.addExp(quest.reward.exp);
            if (Sherwood.addResource) {
                Sherwood.addResource('gold', quest.reward.gold);
                if (quest.reward.silver) Sherwood.addResource('silver', quest.reward.silver);
            }

            _saveDaily();

            var result = { success: true, reward: quest.reward, quest: quest };
            _emit('rewardClaimed', { source: 'chapter', chapterId: chapterId, questId: questId, reward: quest.reward });

            return result;
        },

        getChapterProgress: function(chapterId) {
            var quests = this.getChapterQuests(chapterId);
            var completed = 0;
            var claimed = 0;

            for (var i = 0; i < quests.length; i++) {
                if (quests[i].completed) completed++;
                if (_chapterClaimed.indexOf(quests[i].id) !== -1) claimed++;
            }

            return {
                chapter: chapterId,
                total: quests.length,
                completed: completed,
                claimed: claimed,
                percent: quests.length > 0 ? Math.round((completed / quests.length) * 100) : 0
            };
        },

        isChapterUnlocked: function(chapterId) {
            return _isChapterUnlocked(chapterId);
        },

        getAllChapters: function() {
            var result = [];
            for (var i = 0; i < CHAPTER_TEMPLATES.length; i++) {
                var ct = CHAPTER_TEMPLATES[i];
                var info = this.getChapterInfo(ct.chapter);
                var progress = this.getChapterProgress(ct.chapter);
                result.push({
                    chapter: ct.chapter,
                    name: ct.name,
                    unlocked: info.unlocked,
                    requirement: info.requirement,
                    questCount: ct.quests.length,
                    completed: progress.completed,
                    total: progress.total,
                    percent: progress.percent
                });
            }
            return result;
        },

        on: function(event, callback) {
            if (!_listeners[event]) _listeners[event] = [];
            _listeners[event].push(callback);
        },

        off: function(event, callback) {
            if (!_listeners[event]) return;
            _listeners[event] = _listeners[event].filter(function(cb) { return cb !== callback; });
        }
    };

})();

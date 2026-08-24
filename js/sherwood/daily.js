/**
 * Sherwood Daily — Ежедневные квесты и квесты глав (15 глав)
 */

Sherwood.Daily = (function() {
    'use strict';

    var DAILY_QUESTS_PER_DAY = 8;

    var CHAPTER_REQUIREMENTS = {};
    for (var i = 1; i <= 15; i++) {
        CHAPTER_REQUIREMENTS[i] = { 
            minLevel: 1 + (i - 1) * 3, 
            requiredChapter: i > 1 ? i - 1 : null 
        };
    }

    // Новые ежедневные задания
    var DAILY_TEMPLATES = [
        { id: 'dq_tavern_contracts', name: 'Контрактник', desc: 'Взять {t} контрактов в таверне', target: 10, type: 'tavern_contracts', reward: { gold: 5, silver: 0, exp: 50, parts: true } },
        { id: 'dq_arena_fights', name: 'Гладиатор', desc: 'Сразиться {t} раз на арене', target: 10, type: 'arena_fights', reward: { gold: 5, silver: 0, exp: 50, parts: true } },
        { id: 'dq_quest_fights', name: 'Квестовый боец', desc: 'Сразиться {t} раз в квесте', target: 6, type: 'quest_fights', reward: { gold: 5, silver: 0, exp: 50, parts: true } },
        { id: 'dq_raid_fights', name: 'Рейдер', desc: 'Сразиться {t} раз в рейде', target: 1, type: 'raid_fights', reward: { gold: 5, silver: 0, exp: 50, parts: true } },
        { id: 'dq_dungeon_kills', name: 'Истребитель', desc: 'Убить {t} врагов в подземелье', target: 50, type: 'dungeon_kills', reward: { gold: 5, silver: 0, exp: 50, parts: true } },
        { id: 'dq_dungeon_loot', name: 'Собиратель', desc: 'Собрать {t} раз лут в подземке', target: 50, type: 'dungeon_loot', reward: { gold: 5, silver: 0, exp: 50, parts: true } },
        { id: 'dq_dungeon_floors', name: 'Подземный герой', desc: 'Пройти {t} этажей подземелья', target: 5, type: 'dungeon_floors', reward: { gold: 5, silver: 0, exp: 50, parts: true } },
        { id: 'dq_use_potions', name: 'Травник', desc: 'Выпить {t} зелий лечения', target: 15, type: 'use_potions', reward: { gold: 5, silver: 0, exp: 50, parts: true } }
    ];

    var CHAPTER_TEMPLATES = [];

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

    // Генерация случайных частей стрелы
    function _generateArrowParts() {
        var parts = [];
        var partTypes = ['bone', 'branch', 'feather'];
        var count = _randomInt(1, 5);
        
        var type = partTypes[_randomInt(0, partTypes.length - 1)];
        parts.push({ type: type, quantity: count });
        
        return parts;
    }

    // Проверка: все ли ежедневные задания были выполнены вчера
    function _wereAllDailyCompletedYesterday() {
        var p = _getPlayer();
        if (!p || !p.daily) return false;
        
        var yesterdayStr = '';
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterdayStr = yesterday.toDateString();
        
        // Проверяем сохранённый флаг
        if (p.daily.allCompletedYesterday === yesterdayStr) {
            return true;
        }
        
        return false;
    }

    // Сохраняем флаг выполнения всех заданий
    function _saveAllCompletedFlag() {
        var p = _getPlayer();
        if (!p || !p.daily) return;
        
        var allCompleted = true;
        for (var i = 0; i < _dailyQuests.length; i++) {
            if (!_dailyQuests[i].completed) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted) {
            var today = _getTodayString();
            p.daily.allCompletedYesterday = today;
        }
    }

    function _generateDailyQuests() {
        var selected = [];
        for (var i = 0; i < DAILY_TEMPLATES.length; i++) {
            selected.push(_instantiateQuest(DAILY_TEMPLATES[i]));
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
            var prevQuests = p.daily.chapterQuests[req.requiredChapter];
            if (!prevQuests || prevQuests.length === 0) return false;
            
            var allCompleted = true;
            for (var i = 0; i < prevQuests.length; i++) {
                if (!prevQuests[i].completed) {
                    allCompleted = false;
                    break;
                }
            }
            if (!allCompleted) return false;
            
            var prevChapterId = req.requiredChapter;
            var questProgress = p.questProgress;
            if (questProgress && questProgress.completed) {
                if (questProgress.completed.indexOf(prevChapterId) === -1) {
                    return false;
                }
            } else {
                return false;
            }
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

        getDailyCompleted: function() {
            return _dailyClaimed.slice();
        },

        getChapterCompleted: function() {
            return _chapterClaimed.slice();
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
                _saveAllCompletedFlag();
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

            // Проверяем множитель x2
            var multiplier = _wereAllDailyCompletedYesterday() ? 2 : 1;

            // Награда: части стрелы (1-5 штук), серебро (100-300), 5 золота
            var parts = _generateArrowParts();
            var silver = _randomInt(100, 300) * multiplier;
            var gold = 5 * multiplier;

            // Добавляем части стрелы
            if (Sherwood.Bag && Sherwood.Bag.addItem) {
                for (var pIdx = 0; pIdx < parts.length; pIdx++) {
                    var part = parts[pIdx];
                    var itemId = part.type;
                    var itemName = '';
                    if (part.type === 'bone') itemName = 'Кость';
                    else if (part.type === 'branch') itemName = 'Ветвь';
                    else if (part.type === 'feather') itemName = 'Перо';
                    
                    Sherwood.Bag.addItem({
                        id: itemId,
                        name: itemName,
                        quantity: part.quantity * multiplier,
                        icon: 'assets/interface/arrow_part_' + part.type + '.png'
                    });
                }
            } else {
                // Если Bag недоступен — добавляем через ресурсы
                for (var pIdx2 = 0; pIdx2 < parts.length; pIdx2++) {
                    var part2 = parts[pIdx2];
                    Sherwood.addResource(part2.type, part2.quantity * multiplier);
                }
            }

            // Добавляем ресурсы
            if (Sherwood.addResource) {
                Sherwood.addResource('gold', gold);
                Sherwood.addResource('silver', silver);
            }
            
            if (Sherwood.addExp) Sherwood.addExp(quest.reward.exp * multiplier);

            _saveDaily();

            var reward = {
                gold: gold,
                silver: silver,
                exp: quest.reward.exp * multiplier,
                parts: parts.map(function(p) { return { type: p.type, quantity: p.quantity * multiplier }; }),
                multiplier: multiplier
            };

            var result = { success: true, reward: reward, quest: quest };
            _emit('rewardClaimed', { source: 'daily', questId: questId, reward: reward });

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

/**
 * Sherwood Tavern — Таверна «Весёлый Разбойник»
 * Квесты от NPC, секретная глава
 */

Sherwood.Tavern = {
    _currentQuest: null,
    _completedQuests: [],
    _rows: [],
    _secretQuestUnlocked: false,

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.tavern) p.tavern = { questsCompleted: 0, dailyQuestsDone: 0 };
        this._completedQuests = p.tavern.completedQuests || [];
        this._secretQuestUnlocked = p.tavern.secretUnlocked || false;
        this._generateRows();
        this._checkSecretQuest();
    },

    _generateRows: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;

        var rows = [
            {
                id: 1,
                name: 'Рядовые контракты',
                npc: 'Старый Охотник',
                quests: [
                    {
                        id: 'hunt_1',
                        name: 'Зачистка леса',
                        desc: 'Убить 5 бестий в подземках',
                        target: 5,
                        type: 'kill_beasts',
                        enemy: { name: 'Лесная тварь', image: 'image (1).png', hp: 100, atk: 15, def: 5 },
                        reward: { exp: 80, gold: 20, silver: 100 }
                    }
                ]
            },
            {
                id: 2,
                name: 'Опасные контракты',
                npc: 'Седой Следопыт',
                quests: [
                    {
                        id: 'hunt_2',
                        name: 'Истребление упырей',
                        desc: 'Убить 8 болотных упырей',
                        target: 8,
                        type: 'kill_beasts',
                        enemy: { name: 'Болотный упырь', image: 'image (12).png', hp: 200, atk: 25, def: 10 },
                        reward: { exp: 150, gold: 40, silver: 200 }
                    }
                ]
            }
        ];

        // Добавляем больше рядов в зависимости от прогресса
        var completed = this._completedQuests.length || 0;
        if (completed >= 10) {
            rows.push({
                id: 3,
                name: 'Элитные контракты',
                npc: 'Бертрам',
                quests: [
                    {
                        id: 'hunt_3',
                        name: 'Охота на Лешего',
                        desc: 'Убить Древнего Лешего',
                        target: 1,
                        type: 'kill_boss',
                        enemy: { name: 'Древний Леший', image: 'image (15).png', hp: 800, atk: 50, def: 30 },
                        reward: { exp: 500, gold: 120, silver: 600 }
                    }
                ]
            });
        }
        if (completed >= 20) {
            rows.push({
                id: 4,
                name: 'Легендарные контракты',
                npc: 'Бертрам',
                quests: [
                    {
                        id: 'hunt_4',
                        name: 'Проклятый Король',
                        desc: 'Убить Проклятого Короля Разбойников',
                        target: 1,
                        type: 'kill_boss',
                        enemy: { name: 'Проклятый Король', image: 'image (44).png', hp: 1500, atk: 80, def: 50 },
                        reward: { exp: 1000, gold: 300, silver: 1500 }
                    }
                ]
            });
        }

        this._rows = rows;
    },

    _checkSecretQuest: function() {
        var completed = this._completedQuests.length || 0;
        if (completed >= 25 && !this._secretQuestUnlocked) {
            this._secretQuestUnlocked = true;
            var p = Sherwood.getPlayer();
            if (p && p.tavern) {
                p.tavern.secretUnlocked = true;
                Sherwood.saveGame();
            }
            Sherwood.dispatch({ type: 'SECRET_CHAPTER_UNLOCKED' });
        }
    },

    getAvailableRows: function() {
        return this._rows;
    },

    getCurrentQuest: function() {
        return this._currentQuest;
    },

    startQuest: function(rowIndex, questIndex) {
        if (!this._rows[rowIndex] || !this._rows[rowIndex].quests[questIndex]) {
            return { success: false, reason: 'Квест не найден' };
        }
        var quest = this._rows[rowIndex].quests[questIndex];
        if (this._completedQuests.indexOf(quest.id) !== -1) {
            return { success: false, reason: 'Квест уже выполнен' };
        }
        var row = this._rows[rowIndex];
        this._currentQuest = {
            row: row,
            quest: quest,
            rowIndex: rowIndex,
            questIndex: questIndex,
            progress: 0,
            completed: false
        };
        // Создаём врага для боя
        var enemy = quest.enemy;
        enemy.maxHp = enemy.hp;
        return {
            success: true,
            quest: quest,
            row: row,
            mode: 'battle',
            enemy: enemy
        };
    },

    autoBattle: function() {
        if (!this._currentQuest) return { completed: false, failed: true };
        var p = Sherwood.getPlayer();
        var quest = this._currentQuest.quest;
        var enemy = quest.enemy;
        var win = Math.random() < 0.7 + (p.stats.attack / 200);
        if (win) {
            return this._completeQuest();
        } else {
            var damage = Math.floor((enemy.atk || 20) * (1 + Math.random() * 0.5));
            p.stats.hp = Math.max(1, p.stats.hp - damage);
            Sherwood.saveGame();
            return { completed: false, failed: true, damage: damage };
        }
    },

    _completeQuest: function() {
        var quest = this._currentQuest.quest;
        var p = Sherwood.getPlayer();
        this._completedQuests.push(quest.id);
        this._currentQuest = null;
        p.tavern.questsCompleted = (p.tavern.questsCompleted || 0) + 1;
        Sherwood.addExp(quest.reward.exp);
        Sherwood.addResource('gold', quest.reward.gold);
        Sherwood.addResource('silver', quest.reward.silver || 0);
        Sherwood.saveGame();
        this._checkSecretQuest();
        return {
            completed: true,
            reward: quest.reward,
            secretUnlocked: this._secretQuestUnlocked
        };
    },

    completeQuest: function() {
        if (!this._currentQuest) return null;
        return this._completeQuest();
    },

    failQuest: function() {
        this._currentQuest = null;
    },

    cancelQuest: function() {
        this._currentQuest = null;
    },

    getCompletedCount: function() {
        return this._completedQuests.length;
    },

    isOnCooldown: function() {
        // Заглушка — кулдаун 25 минут
        return false;
    },

    getCooldownRemaining: function() {
        return 0;
    },

    getBattleMode: function() {
        return this._currentQuest ? true : false;
    },

    checkSecretQuest: function() {
        return this._secretQuestUnlocked;
    },

    startSecretQuest: function() {
        if (!this._secretQuestUnlocked) {
            return { success: false, reason: 'Секретная глава не открыта' };
        }
        // Запускаем бой с Безликим Палачом
        var battle = Sherwood.Combat.startPvE('the_faceless_executioner', true, 'secret');
        if (battle) {
            battle.isSecretQuest = true;
            return { success: true, battle: battle };
        }
        return { success: false, reason: 'Ошибка начала боя' };
    },

    completeSecretQuest: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;

        // Трофеи
        Sherwood.addTrophy('head_of_the_faceless_executioner', 'Голова Безликого Палача', { bossDamage: 5 }, 'assets/all_trophies/head_of_the_faceless_executioner.png', 'secret');
        Sherwood.addTrophy('soul_reapers_bow', 'Лук Жнеца Душ', { attack: 15, critDamage: 10 }, 'assets/all_trophies/soul_reaper\'s_bow_trophy.png', 'secret');
        Sherwood.addTrophy('heart_of_black_forest', 'Сердце Чернолесья', { allStats: 10 }, 'assets/all_trophies/heart_of_black_forest.png', 'secret');

        // Скин
        if (p.unlockedSkins.indexOf('skin_soulreaper') === -1) {
            p.unlockedSkins.push('skin_soulreaper');
        }

        if (!p.questProgress) p.questProgress = {};
        p.questProgress.secretChapterUnlocked = true;

        Sherwood.saveGame();
        Sherwood.dispatch({ type: 'SECRET_QUEST_COMPLETED' });
    }
};

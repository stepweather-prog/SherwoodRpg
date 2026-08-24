/**
 * Sherwood Tavern — Таверна «Весёлый Разбойник»
 * Полная боевая логика + Таланты
 */

Sherwood.Tavern = {
    _currentQuest: null,
    _completedQuests: [],
    _dailyQuestsDone: 0,
    _maxDailyQuests: 20,
    _totalQuests: 100,
    _cooldownEnd: 0,
    _cooldownMinutes: 20,
    _secretQuestUnlocked: false,
    _tab: 1, // 1 - Контракты, 2 - Таланты

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.tavern) p.tavern = { questsCompleted: 0, dailyQuestsDone: 0, cooldownEnd: 0, secretUnlocked: false, currentQuest: null };
        
        this._completedQuests = p.tavern.questsCompleted ? this._generateQuestIds(p.tavern.questsCompleted) : [];
        this._dailyQuestsDone = p.tavern.dailyQuestsDone || 0;
        this._cooldownEnd = p.tavern.cooldownEnd || 0;
        this._secretQuestUnlocked = p.tavern.secretUnlocked || false;
        
        var today = new Date().toDateString();
        if (p.tavern.lastDate !== today) {
            p.tavern.dailyQuestsDone = 0;
            p.tavern.lastDate = today;
            this._dailyQuestsDone = 0;
            Sherwood.saveGame();
        }
        
        if (p.tavern.currentQuest) {
            this._currentQuest = p.tavern.currentQuest;
        }
    },

    _generateQuestIds: function(count) {
        var ids = [];
        for (var i = 1; i <= count; i++) ids.push('tavern_' + i);
        return ids;
    },

    _getQuestById: function(id) {
        var questNum = parseInt(id.replace('tavern_', ''));
        var chapter = Math.ceil(questNum / 7);
        if (chapter > 15) chapter = 15;
        var enemyIndex = (questNum % 7) + 1;
        
        var enemies = [
            { name: 'Лесная тварь', image: 'forest_strangler.png', hp: 100 + chapter * 50, atk: 15 + chapter * 10, def: 5 + chapter * 5 },
            { name: 'Болотный упырь', image: 'searing_arachnid.png', hp: 120 + chapter * 50, atk: 18 + chapter * 10, def: 8 + chapter * 5 },
            { name: 'Древесный голем', image: 'blight_lord_beetle.png', hp: 150 + chapter * 60, atk: 20 + chapter * 12, def: 12 + chapter * 6 },
            { name: 'Костяной гигант', image: 'root_executioner.png', hp: 180 + chapter * 70, atk: 25 + chapter * 15, def: 15 + chapter * 8 },
            { name: 'Проклятый титан', image: 'blight_lord_leshy.png', hp: 220 + chapter * 80, atk: 30 + chapter * 18, def: 20 + chapter * 10 },
            { name: 'Кислотный кошмар', image: 'ash_overlord.png', hp: 280 + chapter * 100, atk: 38 + chapter * 22, def: 28 + chapter * 14 },
            { name: 'Владыка портала', image: 'chaos_lord.png', hp: 350 + chapter * 120, atk: 45 + chapter * 28, def: 35 + chapter * 18, isBoss: true }
        ];
        
        var enemy = enemies[enemyIndex - 1];
        return {
            id: id,
            name: 'Контракт #' + questNum,
            desc: 'Охота на ' + enemy.name + ' (Глава ' + chapter + ')',
            enemy: enemy,
            reward: { exp: 50 + chapter * 30, gold: 10 + chapter * 5, silver: 100 + chapter * 50 }
        };
    },

    getAvailableRows: function() {
        return [{ id: 1, name: 'Контракты', npc: 'Егерь', quests: [] }];
    },

    getCurrentQuest: function() {
        if (!this._currentQuest) return null;
        return { quest: this._currentQuest, row: { npc: 'Егерь' } };
    },

    startQuest: function() {
        if (this._dailyQuestsDone >= this._maxDailyQuests) {
            return { success: false, reason: 'Лимит на сегодня (' + this._maxDailyQuests + ')' };
        }
        if (Date.now() < this._cooldownEnd) {
            var remain = Math.ceil((this._cooldownEnd - Date.now()) / 60000);
            return { success: false, reason: 'Перезарядка ' + remain + ' мин.' };
        }
        if (this._completedQuests.length >= this._totalQuests) {
            return { success: false, reason: 'Все квесты выполнены' };
        }
        
        var nextQuestId = 'tavern_' + (this._completedQuests.length + 1);
        var quest = this._getQuestById(nextQuestId);
        
        this._currentQuest = quest;
        this._saveCurrentQuest();
        
        // Обновляем прогресс ежедневного задания
        if (typeof Sherwood.Daily !== 'undefined') {
            Sherwood.Daily.updateProgress('tavern_contracts', 1);
        }
        
        return { success: true, quest: quest, mode: 'battle', enemy: quest.enemy };
    },

    attackQuest: function() {
        if (!this._currentQuest) return { error: 'Нет квеста' };
        
        var p = Sherwood.getPlayer();
        var quest = this._currentQuest;
        var enemy = quest.enemy;
        
        if (!enemy.maxHp) enemy.maxHp = enemy.hp;
        
        var dmg = Sherwood.calculateDamage(p.stats.attack, enemy.def || 5);
        var crit = Math.random() * 100 < 15;
        if (crit) dmg = Math.floor(dmg * 1.8);
        
        enemy.hp -= dmg;
        if (enemy.hp < 0) enemy.hp = 0;
        
        var result = {
            damage: dmg,
            crit: crit,
            enemyHp: enemy.hp,
            enemyMaxHp: enemy.maxHp,
            enemyName: enemy.name,
            enemyDead: enemy.hp <= 0
        };
        
        if (enemy.hp <= 0) {
            var r = this._completeQuest();
            result.win = true;
            result.rewards = r.reward;
            
            p.stats.hp = p.stats.maxHp;
            Sherwood.saveGame();
            
            return result;
        }
        
        var edmg = Sherwood.calculateDamage(enemy.atk || 20, p.stats.defense);
        p.stats.hp = Math.max(0, p.stats.hp - edmg);
        result.enemyDamage = edmg;
        result.playerHp = p.stats.hp;
        
        if (p.stats.hp <= 0) {
            result.playerDead = true;
            this._currentQuest = null;
            this._saveCurrentQuest();
            p.stats.hp = 1;
            Sherwood.saveGame();
            return result;
        }
        
        this._saveCurrentQuest();
        Sherwood.saveGame();
        return result;
    },

    autoBattle: function() {
        if (!this._currentQuest) return { completed: false, failed: true };
        
        var p = Sherwood.getPlayer();
        var quest = this._currentQuest;
        var enemy = quest.enemy;
        
        var win = this._completedQuests.indexOf(quest.id) !== -1 ? true : Math.random() < 0.7 + (p.stats.attack / 200);
        
        if (win) {
            var r = this._completeQuest();
            p.stats.hp = p.stats.maxHp;
            Sherwood.saveGame();
            return { completed: true, reward: r.reward };
        }
        
        var damage = Math.floor((enemy.atk || 20) * (1 + Math.random() * 0.5));
        p.stats.hp = Math.max(1, p.stats.hp - damage);
        Sherwood.saveGame();
        return { completed: false, failed: true, damage: damage };
    },

    _completeQuest: function() {
        var quest = this._currentQuest;
        var p = Sherwood.getPlayer();
        
        if (this._completedQuests.indexOf(quest.id) === -1) {
            this._completedQuests.push(quest.id);
        }
        
        this._currentQuest = null;
        this._dailyQuestsDone++;
        p.tavern.questsCompleted = this._completedQuests.length;
        p.tavern.dailyQuestsDone = this._dailyQuestsDone;
        
        this._cooldownEnd = Date.now() + this._cooldownMinutes * 60 * 1000;
        p.tavern.cooldownEnd = this._cooldownEnd;
        
        Sherwood.addExp(quest.reward.exp);
        Sherwood.addResource('silver', quest.reward.silver || 0);
        if (quest.reward.gold) Sherwood.addResource('gold', quest.reward.gold);
        
        if (Math.random() < 0.10) Sherwood.addResource('scrolls', 1);
        
        this._saveCurrentQuest();
        Sherwood.saveGame();
        this._checkSecretQuest();
        
        // Обновляем прогресс ежедневного задания
        if (typeof Sherwood.Daily !== 'undefined') {
            Sherwood.Daily.updateProgress('tavern_complete', 1);
        }
        
        return { success: true, reward: quest.reward };
    },

    completeQuest: function() {
        if (!this._currentQuest) return null;
        return this._completeQuest();
    },

    failQuest: function() { 
        this._currentQuest = null; 
        this._saveCurrentQuest();
    },
    
    cancelQuest: function() { 
        this._currentQuest = null; 
        this._saveCurrentQuest();
    },

    getCompletedCount: function() { return this._completedQuests.length; },
    isOnCooldown: function() { return Date.now() < this._cooldownEnd; },
    
    getCooldownRemaining: function() {
        var r = this._cooldownEnd - Date.now();
        return r <= 0 ? 0 : Math.ceil(r / 60000);
    },
    
    getBattleMode: function() { return this._currentQuest ? true : false; },
    
    _checkSecretQuest: function() {
        if (this._completedQuests.length >= 100 && !this._secretQuestUnlocked) {
            this._secretQuestUnlocked = true;
            var p = Sherwood.getPlayer();
            p.tavern.secretUnlocked = true;
            Sherwood.saveGame();
        }
    },

    checkSecretQuest: function() { return this._secretQuestUnlocked; },
    getDailyQuestsDone: function() { return this._dailyQuestsDone; },
    getMaxDailyQuests: function() { return this._maxDailyQuests; },
    
    // ========== ТАЛАНТЫ ==========
    
    getTalents: function() {
        return Sherwood.Combat ? Sherwood.Combat.getSkills() : {};
    },

    _saveCurrentQuest: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.tavern) p.tavern = {};
        p.tavern.currentQuest = this._currentQuest ? JSON.parse(JSON.stringify(this._currentQuest)) : null;
        Sherwood.saveGame();
    }
};

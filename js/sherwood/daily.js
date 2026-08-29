/**
 * Sherwood Daily — Ежедневные задания
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Daily = {
    _dailyQuests: [],
    _dailyCompleted: [],
    _chapterCompleted: [],
    _lastReset: null,

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.daily) p.daily = { quests: [], completed: [], chapterCompleted: [], lastReset: null };
        
        var today = new Date().toDateString();
        if (p.daily.lastReset !== today) {
            p.daily.quests = this._generateDailyQuests();
            p.daily.completed = [];
            p.daily.lastReset = today;
            Sherwood.saveGame();
        }
        
        this._dailyQuests = p.daily.quests || this._generateDailyQuests();
        this._dailyCompleted = p.daily.completed || [];
        this._chapterCompleted = p.daily.chapterCompleted || [];
        console.log('📅 Ежедневные задания инициализированы');
    },

    _generateDailyQuests: function() {
        return [
            { id: 'daily_1', name: 'Убийца монстров', desc: 'Убей 10 монстров в подземке', progress: 0, target: 10, reward: { exp: 100, gold: 50 }, type: 'kill', completed: false },
            { id: 'daily_2', name: 'Собиратель сокровищ', desc: 'Найди 5 сундуков в подземке', progress: 0, target: 5, reward: { exp: 80, gold: 40 }, type: 'chest', completed: false },
            { id: 'daily_3', name: 'Боец', desc: 'Победи 3 боссов', progress: 0, target: 3, reward: { exp: 150, gold: 75 }, type: 'boss', completed: false }
        ];
    },

    getDailyQuests: function() { return this._dailyQuests; },
    getDailyCompleted: function() { return this._dailyCompleted; },
    getChapterQuests: function(chapter) { return []; },
    
    updateProgress: function(type, amount) {
        if (!amount) amount = 1;
        for (var i = 0; i < this._dailyQuests.length; i++) {
            var q = this._dailyQuests[i];
            if (q.completed || q.type !== type) continue;
            q.progress = Math.min(q.target, q.progress + amount);
            if (q.progress >= q.target) q.completed = true;
        }
        var p = Sherwood.getPlayer();
        if (p && p.daily) {
            p.daily.quests = this._dailyQuests;
            p.daily.completed = this._dailyCompleted;
            Sherwood.saveGame();
        }
    },

    claimDailyReward: function(id) {
        for (var i = 0; i < this._dailyQuests.length; i++) {
            if (this._dailyQuests[i].id === id) {
                var q = this._dailyQuests[i];
                if (!q.completed) return { success: false, reason: 'Задание не выполнено' };
                if (this._dailyCompleted.indexOf(id) !== -1) return { success: false, reason: 'Награда уже получена' };
                this._dailyCompleted.push(id);
                Sherwood.addExp(q.reward.exp);
                Sherwood.addResource('gold', q.reward.gold);
                var p = Sherwood.getPlayer();
                if (p && p.daily) p.daily.completed = this._dailyCompleted;
                Sherwood.saveGame();
                return { success: true };
            }
        }
        return { success: false, reason: 'Задание не найдено' };
    },

    claimChapterReward: function(chapter, index) {
        return { success: false, reason: 'В разработке' };
    },

    // ========== UI ==========
    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Ежедневные', '📅');
            }
            return;
        }
        UI._playSound('click');
        
        var quests = this._dailyQuests;
        var completed = this._dailyCompleted;
        var h = '<div style="padding:10px;max-width:400px;margin:0 auto;">';
        h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;text-align:center;margin-bottom:12px;">📅 Ежедневные задания</div>';
        
        for (var i = 0; i < quests.length; i++) {
            var q = quests[i];
            var claimed = completed.indexOf(q.id) !== -1;
            var progressPct = Math.round((q.progress || 0) / q.target * 100);
            
            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid ' + (q.completed ? '#4caf50' : '#555') + ';border-radius:8px;padding:10px;margin-bottom:8px;">';
            h += '<div style="color:#e0c080;font-weight:bold;">' + q.name + '</div>';
            h += '<div style="color:#aaa;font-size:0.75em;">' + q.desc + '</div>';
            h += '<div style="margin:4px 0;"><div style="background:rgba(255,255,255,0.1);border-radius:4px;height:6px;overflow:hidden;"><div style="background:' + (q.completed ? '#4caf50' : '#ff8800') + ';height:100%;width:' + progressPct + '%;"></div></div></div>';
            h += '<div style="color:#aaa;font-size:0.7em;">' + (q.progress || 0) + '/' + q.target + '</div>';
            
            if (q.completed && !claimed) {
                h += '<button onclick="Sherwood.Daily._claimFromUI(' + i + ')" class="btn btn-success" style="margin-top:6px;padding:4px 15px;font-size:0.75em;">Забрать награду</button>';
            } else if (claimed) {
                h += '<div style="color:#4caf50;font-size:0.7em;margin-top:4px;">✅ Получено</div>';
            }
            h += '</div>';
        }
        h += '</div>';
        UI._openScreenScrollable('📅 Ежедневные', 'daily', h);
    },

    _claimFromUI: function(index) {
        var q = this._dailyQuests[index];
        if (!q) return;
        var r = this.claimDailyReward(q.id);
        if (r.success) {
            UI._playSound('loot_fly');
            UI.updateDisplay();
            this.showUI();
        } else {
            UI._showToast(r.reason || 'Ошибка');
        }
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Daily = Sherwood.Daily;

console.log('📅 Ежедневные задания загружены!');

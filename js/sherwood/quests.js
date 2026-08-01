Sherwood.Quests = {
    _currentChapter: null,
    _currentStage: 0,
    _currentEnemy: null,
    _inBattle: false,
    _attemptsToday: 0,
    _lastAttempt: 0,
    _freeAccelUsed: false,

    CHAPTERS: [
        {
            id: 1, name: 'Проклятие Зелёного Сердца',
            lore: 'Шервудский лес отравлен. Из расколотых недр хлынула сизая порча. Первыми жертвами стали рудокопы — их раздувшиеся тела намертво обвил неоновый мох.',
            boss: { name: 'Лесное Лихо', image: 'image (46).png', hp: 400, atk: 28, def: 15, exp: 150, gold: 100 },
            stages: 5,
            rewards: { exp: 200, gold: 50, silver: 500 },
            enemies: [
                { name: 'Леший', image: 'image (1).png', hp: 100, atk: 15, def: 8, exp: 30, gold: 15 },
                { name: 'Проклятый олень', image: 'image (3).png', hp: 120, atk: 18, def: 10, exp: 35, gold: 18 },
                { name: 'Древесный голем', image: 'image (74).png', hp: 140, atk: 20, def: 12, exp: 40, gold: 20 },
                { name: 'Рогатый Леший', image: 'image (9).png', hp: 160, atk: 22, def: 13, exp: 45, gold: 22 },
                { name: 'Олень (Фаза тарана)', image: 'image (29).png', hp: 180, atk: 25, def: 14, exp: 50, gold: 25 }
            ]
        }
    ],

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p.questProgress) p.questProgress = { completed: [], currentChapter: 1, secretCompleted: false };
        if (!p.questAttempts) p.questAttempts = { today: 0, lastDate: '', freeAccel: false, accelUsed: 0, lastAttempt: 0 };
        var today = new Date().toDateString();
        if (p.questAttempts.lastDate !== today) { p.questAttempts.today = 0; p.questAttempts.lastDate = today; p.questAttempts.freeAccel = false; }
        this._attemptsToday = p.questAttempts.today || 0;
        this._freeAccelUsed = p.questAttempts.freeAccel || false;
        this._lastAttempt = p.questAttempts.lastAttempt || 0;
    },

    getChapter: function(id) {
        for (var i = 0; i < this.CHAPTERS.length; i++) {
            if (this.CHAPTERS[i].id === id) return this.CHAPTERS[i];
        }
        return null;
    },
    getAllChapters: function() { return this.CHAPTERS; },
    getProgress: function() { return Sherwood.getPlayer().questProgress; },
    isUnlocked: function() { return true; },
    isOnCooldown: function() { return Date.now() - this._lastAttempt < 30 * 60 * 1000; },
    getCooldownRemaining: function() { var r = 30 * 60 * 1000 - (Date.now() - this._lastAttempt); return r <= 0 ? 0 : Math.ceil(r / 60000); },
    getAccelCost: function() {
        var p = Sherwood.getPlayer();
        var used = p.questAttempts ? (p.questAttempts.accelUsed || 0) : 0;
        if (used === 0 && !this._freeAccelUsed) return { cost: 0, currency: 'free' };
        var costs = [30, 60, 100, 150, 220, 300];
        var idx = Math.min(used - (this._freeAccelUsed ? 0 : 1), costs.length - 1);
        if (idx < 0) idx = 0;
        return { cost: costs[idx], currency: 'gold' };
    },
    accelerate: function() {
        if (!this.isOnCooldown()) return { success: false, reason: 'Нет перезарядки' };
        var info = this.getAccelCost();
        var p = Sherwood.getPlayer();
        if (info.currency === 'free') { this._freeAccelUsed = true; p.questAttempts.freeAccel = true; }
        else { if ((p.resources.gold || 0) < info.cost) return { success: false, reason: 'Недостаточно золота' }; p.resources.gold -= info.cost; p.questAttempts.accelUsed = (p.questAttempts.accelUsed || 0) + 1; }
        this._lastAttempt = 0; p.questAttempts.lastAttempt = 0;
        Sherwood.saveGame(); return { success: true };
    },
    getAttemptsToday: function() { return this._attemptsToday; },
    getBattle: function() {
        if (!this._currentEnemy) return null;
        return { chapter: this._currentChapter, stage: this._currentStage + 1, total: this._currentChapter.stages, enemy: this._currentEnemy };
    },
    startChapter: function(id) {
        var ch = this.getChapter(id);
        if (!ch) return { success: false, reason: 'Глава не найдена' };
        if (this.isOnCooldown()) return { success: false, reason: 'Перезарядка ' + this.getCooldownRemaining() + ' мин.', cooldown: true };
        
        var p = Sherwood.getPlayer();
        p.stats.hp = p.stats.maxHp;
        
        if (this._currentChapter && this._currentChapter.id === id && this._currentEnemy) {
            this._inBattle = true;
            this._lastAttempt = Date.now();
            p.questAttempts.lastAttempt = this._lastAttempt;
            Sherwood.saveGame();
            return { success: true, chapter: ch, enemy: this._currentEnemy, stage: this._currentStage + 1, total: ch.stages };
        }
        
        this._currentChapter = ch;
        this._currentStage = 0;
        var firstEnemy = ch.enemies[0];
        this._currentEnemy = { name: firstEnemy.name, image: firstEnemy.image, hp: firstEnemy.hp, maxHp: firstEnemy.hp, atk: firstEnemy.atk, def: firstEnemy.def, exp: firstEnemy.exp, gold: firstEnemy.gold, isBoss: false };
        this._inBattle = true;
        this._lastAttempt = Date.now();
        p.questAttempts.today = (p.questAttempts.today || 0) + 1;
        p.questAttempts.lastAttempt = this._lastAttempt;
        this._attemptsToday = p.questAttempts.today;
        Sherwood.saveGame();
        return { success: true, chapter: ch, enemy: this._currentEnemy, stage: 1, total: ch.stages };
    },
    attack: function() {
        if (!this._inBattle) return null;
        var p = Sherwood.getPlayer();
        var e = this._currentEnemy;
        var dmg = Math.max(1, Math.floor((p.stats.attack * p.stats.attack) / (p.stats.attack + e.def)));
        var crit = Math.random() * 100 < 15;
        if (crit) dmg = Math.floor(dmg * 1.8);
        e.hp -= dmg;
        if (e.hp < 0) e.hp = 0;
        var r = { damage: dmg, crit: crit, enemyHp: e.hp, enemyMaxHp: e.maxHp, enemyDead: e.hp <= 0 };
        if (e.hp <= 0) {
            if (Sherwood.Bestiary && e.image) Sherwood.Bestiary.registerKill(e.image);
            Sherwood.addExp(e.exp);
            if (this._attemptsToday <= 4) Sherwood.addResource('gold', e.gold);
            this._currentStage++;
            var ch = this._currentChapter;
            if (this._currentStage >= ch.stages) {
                var boss = ch.boss;
                this._currentEnemy = { name: boss.name, image: boss.image, hp: boss.hp, maxHp: boss.hp, atk: boss.atk, def: boss.def, exp: boss.exp, gold: boss.gold, isBoss: true };
                this._inBattle = false;
                r.chapterComplete = true;
                r.rewards = ch.rewards;
            } else {
                var nextEnemy = ch.enemies[this._currentStage];
                this._currentEnemy = { name: nextEnemy.name, image: nextEnemy.image, hp: nextEnemy.hp, maxHp: nextEnemy.hp, atk: nextEnemy.atk, def: nextEnemy.def, exp: nextEnemy.exp, gold: nextEnemy.gold, isBoss: false };
                this._inBattle = false;
                r.stageComplete = true;
            }
        } else {
            var edmg = Math.max(1, Math.floor((e.atk * e.atk) / (e.atk + p.stats.defense)));
            p.stats.hp = Math.max(0, p.stats.hp - edmg);
            r.enemyDamage = edmg; r.playerHp = p.stats.hp; r.playerDead = p.stats.hp <= 0;
            if (p.stats.hp <= 0) {
                this._inBattle = false;
                r.lose = true;
            }
        }
        Sherwood.saveGame();
        return r;
    },
    flee: function() { this._inBattle = false; this._currentEnemy = null; return { success: true }; }
};

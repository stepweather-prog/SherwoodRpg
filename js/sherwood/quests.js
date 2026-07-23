Sherwood.Quests = {
    _chapters: [
        {
            id: 1, name: 'Проклятие Зелёного Сердца', stages: 5, energyCost: 5,
            enemies: [
                { name: 'Проклятый олень', image: 'image (3).png', hp: 80, attack: 12, defense: 3, exp: 25, gold: 15 },
                { name: 'Древесный голем', image: 'image (74).png', hp: 120, attack: 15, defense: 8, exp: 35, gold: 20 },
                { name: 'Леший', image: 'image (1).png', hp: 100, attack: 14, defense: 5, exp: 30, gold: 18 },
                { name: 'Рогатый Леший', image: 'image (9).png', hp: 150, attack: 18, defense: 10, exp: 40, gold: 25 },
                { name: 'Лесное Лихо (Босс)', image: 'image (46).png', hp: 400, attack: 28, defense: 15, exp: 150, gold: 100, isBoss: true }
            ],
            rewards: { gold: 200, exp: 300, silver: 500 },
            trophy: { id: 'trophy_ch1', name: 'Сломанный охотничий рог', icon: 'assets/all_trophies/trophies_chapters/chapter_1_broken_hunting_horn_of_the_league.png', bonus: { attack: 5 } }
        },
        {
            id: 2, name: 'Чёрный орден', stages: 5, energyCost: 6,
            enemies: [
                { name: 'Лесное Лихо', image: 'image (46).png', hp: 130, attack: 16, defense: 6, exp: 30, gold: 20 },
                { name: 'Проклятый олень', image: 'image (29).png', hp: 160, attack: 20, defense: 8, exp: 35, gold: 22 },
                { name: 'Рогатый Леший', image: 'image (9).png', hp: 180, attack: 22, defense: 12, exp: 45, gold: 28 },
                { name: 'Лихо (Атака)', image: 'image (48).png', hp: 200, attack: 25, defense: 14, exp: 50, gold: 30 },
                { name: 'Разъярённое Лихо (Босс)', image: 'image (47).png', hp: 550, attack: 35, defense: 18, exp: 200, gold: 130, isBoss: true }
            ],
            rewards: { gold: 280, exp: 400, silver: 700 },
            trophy: { id: 'trophy_ch2', name: 'Песочные часы', icon: 'assets/all_trophies/trophies_chapters/chapter_2_the_hourglass_of_the_robbers.png', bonus: { defense: 3 } }
        },
        {
            id: 3, name: 'Рождение Охотника', stages: 5, energyCost: 7,
            enemies: [
                { name: 'Лесной дух', image: 'image (1).png', hp: 160, attack: 18, defense: 7, exp: 35, gold: 22 },
                { name: 'Проклятый олень', image: 'image (3).png', hp: 190, attack: 22, defense: 9, exp: 40, gold: 25 },
                { name: 'Владыка Леший', image: 'image (18).png', hp: 220, attack: 26, defense: 14, exp: 50, gold: 32 },
                { name: 'Голем (Атака)', image: 'image (75).png', hp: 250, attack: 28, defense: 16, exp: 55, gold: 35 },
                { name: 'Хозяин чащи (Босс)', image: 'image (19).png', hp: 700, attack: 42, defense: 22, exp: 250, gold: 160, isBoss: true }
            ],
            rewards: { gold: 350, exp: 500, silver: 900 },
            trophy: { id: 'trophy_ch3', name: 'Тяжёлый наконечник', icon: 'assets/all_trophies/trophies_chapters/chapter_3_heavy_tip.png', bonus: { attack: 8 } }
        }
    ],
    _currentChapter: null,
    _currentStage: 0,
    _currentEnemy: null,
    _inBattle: false,

    init: function() {
        const p = Sherwood.getPlayer();
        if (!p.questProgress) p.questProgress = { completed: [], currentChapter: 1 };
        if (!p.questEnergy) p.questEnergy = { current: 50, max: 50 };
    },

    getChapter: function(id) { return this._chapters.find(c => c.id === id) || null; },
    getAllChapters: function() { return this._chapters; },
    getProgress: function() { return Sherwood.getPlayer().questProgress; },
    isUnlocked: function(id) { if (id === 1) return true; return Sherwood.getPlayer().questProgress.completed.includes(id - 1); },

    startChapter: function(id) {
        const ch = this.getChapter(id);
        if (!ch) return { success: false, reason: 'Глава не найдена' };
        if (!this.isUnlocked(id)) return { success: false, reason: 'Заблокирована' };
        const p = Sherwood.getPlayer();
        if ((p.questEnergy?.current || 0) < ch.energyCost) return { success: false, reason: 'Нет энергии' };
        p.questEnergy.current -= ch.energyCost;
        this._currentChapter = ch;
        this._currentStage = 0;
        this._currentEnemy = { ...ch.enemies[0], maxHp: ch.enemies[0].hp };
        this._inBattle = true;
        return { success: true, chapter: ch, enemy: this._currentEnemy, stage: 1, total: ch.stages };
    },

    getBattle: function() {
        if (!this._inBattle) return null;
        return { chapter: this._currentChapter, stage: this._currentStage + 1, total: this._currentChapter.stages, enemy: this._currentEnemy };
    },

    attack: function() {
        if (!this._inBattle) return null;
        const p = Sherwood.getPlayer();
        const e = this._currentEnemy;
        const dmg = Math.max(1, p.stats.attack - e.defense + Math.floor(Math.random() * 10));
        e.hp -= dmg;
        const r = { damage: dmg, enemyHp: Math.max(0, e.hp), enemyMaxHp: e.maxHp, enemyDead: e.hp <= 0 };
        if (e.hp <= 0) {
            Sherwood.addExp(e.exp); Sherwood.addResource('gold', e.gold);
            this._currentStage++;
            if (this._currentStage >= this._currentChapter.stages) {
                const ch = this._currentChapter;
                Sherwood.addExp(ch.rewards.exp); Sherwood.addResource('gold', ch.rewards.gold); Sherwood.addResource('silver', ch.rewards.silver);
                Sherwood.getPlayer().questProgress.completed.push(ch.id);
                if (ch.trophy && typeof Sherwood.addTrophy === 'function') Sherwood.addTrophy(ch.trophy.id, ch.trophy.name, ch.trophy.bonus, ch.trophy.icon, 'chapter');
                this._inBattle = false;
                r.chapterComplete = true; r.rewards = ch.rewards;
            } else {
                this._currentEnemy = { ...this._currentChapter.enemies[this._currentStage], maxHp: this._currentChapter.enemies[this._currentStage].hp };
                r.nextEnemy = this._currentEnemy;
            }
        } else {
            const edmg = Math.max(1, e.attack - p.stats.defense + Math.floor(Math.random() * 8));
            p.stats.hp = Math.max(0, p.stats.hp - edmg);
            r.enemyDamage = edmg; r.playerHp = p.stats.hp; r.playerDead = p.stats.hp <= 0;
        }
        Sherwood.saveGame();
        return r;
    },

    flee: function() { this._inBattle = false; this._currentEnemy = null; return { success: true }; },

    getEnergy: function() { return Sherwood.getPlayer().questEnergy || { current: 50, max: 50 }; }
};

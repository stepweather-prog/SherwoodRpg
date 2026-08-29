/**
 * Sherwood Raid — Мировой рейд
 * Изначальный Ужас — Спящий в Корнях
 * Открывается после прохождения всех 16 глав
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Raid = {
    _raidActive: false,
    _raidBoss: null,
    _participants: [],
    _maxParticipants: 10,
    _raidsToday: 0,
    _maxRaidsPerDay: 3,
    _currentStage: 0,
    _totalStages: 3,
    _playerAlive: true,
    _isUnlocked: false,

    RAID_BOSSES: [{
        id: 'primordial_dread',
        name: 'Изначальный Ужас — Спящий в Корнях',
        image: 'original_horror.png',
        hp: 50000, maxHp: 50000,
        attack: 350, defense: 180,
        exp: 10000, gold: 8000,
        requiredChapters: 16,
        stages: [
            {
                name: 'Пробуждение Корней',
                enemies: [
                    { name: 'Голем Скверного Дуба', image: 'blighted_oak_golem.png', hp: 5000, maxHp: 5000, attack: 140, defense: 70 },
                    { name: 'Корневой Палач', image: 'root_executioner.png', hp: 5500, maxHp: 5500, attack: 155, defense: 75 },
                    { name: 'Древний Владыка', image: 'blight_lord_leshy.png', hp: 6000, maxHp: 6000, attack: 170, defense: 85 }
                ]
            },
            {
                name: 'Стражи Бездны',
                enemies: [
                    { name: 'Проклятая Жрица', image: 'cursed_priestess.png', hp: 7000, maxHp: 7000, attack: 190, defense: 95 },
                    { name: 'Лорд Хаоса', image: 'chaos_lord.png', hp: 7500, maxHp: 7500, attack: 205, defense: 100 },
                    { name: 'Скверный Король', image: 'blight_king.png', hp: 8000, maxHp: 8000, attack: 220, defense: 110 }
                ]
            },
            {
                name: 'Изначальный Ужас',
                enemies: [
                    { name: 'Изначальный Ужас', image: 'original_horror.png', hp: 50000, maxHp: 50000, attack: 350, defense: 180, isRaidBoss: true }
                ]
            }
        ],
        rewards: {
            exp: 15000, gold: 10000, silver: 50000,
            trophy: {
                id: 'raid_victory',
                name: 'Узы Вечности',
                icon: '👑',
                bonus: { attack: 50, defense: 50, hp: 100 },
                description: 'Рейд пройден! Ты запечатал Изначальный Ужас.'
            }
        }
    }],

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.raid) {
            p.raid = {
                raidsToday: 0,
                lastRaidDate: new Date().toDateString(),
                participants: [],
                completed: false,
                attempts: 0
            };
        }
        var today = new Date().toDateString();
        if (p.raid.lastRaidDate !== today) {
            p.raid.raidsToday = 0;
            p.raid.lastRaidDate = today;
            p.raid.participants = [];
            Sherwood.saveGame();
        }
        this._raidsToday = p.raid.raidsToday || 0;
        this._participants = p.raid.participants || [];
        this._isUnlocked = this._checkUnlock();
        if (p.raid.activeRaid) {
            this._raidBoss = p.raid.activeRaid;
            this._raidActive = true;
            this._currentStage = p.raid.currentStage || 0;
            this._playerAlive = p.raid.playerAlive !== false;
        }
        console.log('⚔️ Рейд инициализирован');
    },

    _checkUnlock: function() {
        if (typeof Sherwood.Tavern !== 'undefined' && Sherwood.Tavern.getCompletedCount) {
            return Sherwood.Tavern.getCompletedCount() >= 16;
        }
        return false;
    },

    isUnlocked: function() { return this._isUnlocked; },

    getAvailableRaids: function() { return this.RAID_BOSSES; },

    canJoinRaid: function() {
        var p = Sherwood.getPlayer();
        if (!p) return { can: false, reason: 'Игрок не найден' };
        if (!this._isUnlocked) return { can: false, reason: 'Рейд запечатан. Пройди все 16 глав.' };
        if ((p.raid.raidsToday || 0) >= this._maxRaidsPerDay) {
            return { can: false, reason: 'Лимит рейдов на сегодня (3/3)' };
        }
        if (this._raidActive) return { can: false, reason: 'Рейд уже идёт' };
        if (!p.stats || p.stats.hp <= 0) return { can: false, reason: 'Игрок мёртв' };
        if (p.raid.completed) return { can: false, reason: 'Рейд уже пройден. Жди обновления.' };
        return { can: true };
    },

    startRaid: function() {
        var check = this.canJoinRaid();
        if (!check.can) return check;

        var bossTemplate = this.RAID_BOSSES[0];
        this._raidBoss = JSON.parse(JSON.stringify(bossTemplate));
        this._raidActive = true;
        this._currentStage = 0;
        this._playerAlive = true;

        var p = Sherwood.getPlayer();
        p.raid.raidsToday = (p.raid.raidsToday || 0) + 1;
        p.raid.participants = [p.name || 'Охотник'];
        p.raid.activeRaid = this._raidBoss;
        p.raid.currentStage = 0;
        p.raid.playerAlive = true;
        p.raid.attempts = (p.raid.attempts || 0) + 1;
        Sherwood.saveGame();

        this._participants = p.raid.participants;

        return {
            success: true,
            boss: this._raidBoss,
            currentStage: this._raidBoss.stages[0],
            stageIndex: 1,
            totalStages: this._totalStages,
            participants: this._participants
        };
    },

    getRaidStatus: function() {
        if (!this._raidActive || !this._raidBoss) return null;
        var stage = this._raidBoss.stages[this._currentStage] || null;
        var enemies = stage ? stage.enemies : [];
        var aliveEnemies = enemies.filter(function(e) { return e.hp > 0; });
        return {
            boss: this._raidBoss,
            stage: stage,
            stageName: stage ? stage.name : 'Завершено',
            stageIndex: this._currentStage + 1,
            totalStages: this._totalStages,
            participants: this._participants || [],
            enemies: enemies,
            aliveEnemies: aliveEnemies,
            isComplete: this._currentStage >= this._totalStages,
            playerAlive: this._playerAlive
        };
    },

    getCurrentEnemy: function() {
        if (!this._raidActive || !this._raidBoss) return null;
        if (this._currentStage >= this._totalStages) return null;
        var stage = this._raidBoss.stages[this._currentStage];
        for (var i = 0; i < stage.enemies.length; i++) {
            if (stage.enemies[i].hp > 0) return stage.enemies[i];
        }
        return null;
    },

    raidAttack: function() {
        if (!this._raidActive || !this._raidBoss) return { error: 'Рейд не активен' };
        if (this._currentStage >= this._totalStages) return { raidComplete: true };
        if (!this._playerAlive) return { playerDead: true, message: 'Вы погибли в рейде' };

        var enemy = this.getCurrentEnemy();
        if (!enemy) {
            this._currentStage++;
            if (this._currentStage >= this._totalStages) return this._completeRaid();
            var newEnemy = this.getCurrentEnemy();
            if (newEnemy) return { stageComplete: true, nextEnemy: newEnemy, stageIndex: this._currentStage + 1 };
            return { error: 'Нет врагов' };
        }

        var p = Sherwood.getPlayer();
        if (!p) return { error: 'Игрок не найден' };

        var dmg = Math.max(1, Math.floor((p.stats.attack * p.stats.attack) / (p.stats.attack + (enemy.defense || 10))));
        var crit = Math.random() * 100 < 15;
        if (crit) dmg = Math.floor(dmg * 1.8);
        var extra = Math.random() * 100 < 20 ? Math.floor(dmg * 0.3) : 0;
        dmg += extra;

        enemy.hp -= dmg;
        if (enemy.hp < 0) enemy.hp = 0;

        var result = {
            damage: dmg,
            crit: crit,
            extra: extra,
            enemyHp: enemy.hp,
            enemyMaxHp: enemy.maxHp,
            enemyName: enemy.name,
            enemyImage: enemy.image,
            enemyDead: enemy.hp <= 0
        };

        if (enemy.hp <= 0) {
            var stage = this._raidBoss.stages[this._currentStage];
            var allDead = stage.enemies.every(function(e) { return e.hp <= 0; });
            if (allDead) {
                this._currentStage++;
                if (this._currentStage >= this._totalStages) return this._completeRaid();
                result.stageComplete = true;
                result.nextStage = this._raidBoss.stages[this._currentStage];
                result.stageIndex = this._currentStage + 1;
            } else {
                result.nextEnemy = this.getCurrentEnemy();
            }
            this._saveProgress();
            return result;
        }

        var edmg = Math.max(1, Math.floor((enemy.attack * enemy.attack) / (enemy.attack + p.stats.defense)));
        var armorReduction = Math.min(p.stats.defense * 0.2, edmg * 0.3);
        edmg = Math.max(1, edmg - armorReduction);

        p.stats.hp = Math.max(0, p.stats.hp - edmg);
        result.enemyDamage = edmg;
        result.playerHp = p.stats.hp;

        if (p.stats.hp <= 0) {
            p.stats.hp = 1;
            this._playerAlive = false;
            result.playerDead = true;
            Sherwood.saveGame();
        }

        this._saveProgress();
        Sherwood.saveGame();
        return result;
    },

    _completeRaid: function() {
        var boss = this._raidBoss;
        var rewards = boss.rewards || { exp: 10000, gold: 8000, silver: 40000, trophy: null };
        var totalExp = rewards.exp + Math.floor(Math.random() * 2000);
        var totalGold = rewards.gold + Math.floor(Math.random() * 1000);
        var totalSilver = rewards.silver + Math.floor(Math.random() * 2000);

        var p = Sherwood.getPlayer();

        if (this._playerAlive) {
            Sherwood.addExp(totalExp);
            Sherwood.addResource('gold', totalGold);
            Sherwood.addResource('silver', totalSilver);
            if (p && p.raid) p.raid.completed = true;
            if (!p.eternityBonds) p.eternityBonds = { count: 0, bonus: 0 };
            p.eternityBonds.count++;
            p.eternityBonds.bonus = p.eternityBonds.count * 5;
            if (rewards.trophy && typeof Sherwood.addTrophy === 'function') {
                Sherwood.addTrophy(rewards.trophy.id, rewards.trophy.name, rewards.trophy.bonus || { attack: 50, defense: 50, hp: 100 }, rewards.trophy.icon || '👑', 'raid');
            }
        }

        this._raidActive = false;
        this._raidBoss = null;
        if (p && p.raid) {
            p.raid.activeRaid = null;
            p.raid.currentStage = 0;
            p.raid.playerAlive = true;
            Sherwood.saveGame();
        }

        return {
            raidComplete: true,
            rewards: {
                exp: this._playerAlive ? totalExp : Math.floor(totalExp * 0.1),
                gold: this._playerAlive ? totalGold : 0,
                silver: this._playerAlive ? totalSilver : Math.floor(totalSilver * 0.2)
            },
            aliveCount: this._playerAlive ? 1 : 0,
            trophy: rewards.trophy,
            won: this._playerAlive,
            eternityBond: this._playerAlive ? p.eternityBonds.bonus : 0
        };
    },

    _saveProgress: function() {
        var player = Sherwood.getPlayer();
        if (player && player.raid) {
            player.raid.activeRaid = this._raidBoss;
            player.raid.currentStage = this._currentStage;
            player.raid.playerAlive = this._playerAlive;
            player.raid.participants = this._participants;
            Sherwood.saveGame();
        }
    },

    fleeRaid: function() {
        this._raidActive = false;
        this._raidBoss = null;
        var player = Sherwood.getPlayer();
        if (player && player.raid) {
            player.raid.activeRaid = null;
            player.raid.currentStage = 0;
            Sherwood.saveGame();
        }
        return { success: true };
    },

    isRaidActive: function() { return this._raidActive; },
    isPlayerAlive: function() { return this._playerAlive; },
    getParticipantCount: function() { return this._participants ? this._participants.length : 0; },

    // ========== UI ==========

    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Рейд', '⚔️');
            }
            return;
        }
        UI._playSound('click');

        if (this.isRaidActive()) {
            this._showRaidBattle();
            return;
        }

        var raids = this.getAvailableRaids();
        var check = this.canJoinRaid();
        var player = Sherwood.getPlayer();
        var raidsToday = player.raid ? (player.raid.raidsToday || 0) : 0;
        var maxRaids = 3;
        var completed = player.raid ? player.raid.completed : false;

        if (!this._isUnlocked) {
            var h = '<div style="text-align:center;padding:40px 20px;">';
            h += '<div style="font-size:64px;margin-bottom:20px;">🔒</div>';
            h += '<div style="font-size:20px;color:#ffa500;">Рейд запечатан</div>';
            h += '<div style="color:#888;margin-top:10px;">Пройди все 16 глав, чтобы открыть доступ к рейду.</div>';
            h += '<div style="color:#555;margin-top:10px;font-size:14px;">Изначальный Ужас ждёт своего часа...</div>';
            h += '</div>';
            UI._openScreenScrollable('⚔️ Рейд', 'raid', h);
            return;
        }

        if (completed) {
            var h = '<div style="text-align:center;padding:40px 20px;">';
            h += '<div style="font-size:64px;margin-bottom:20px;">🏆</div>';
            h += '<div style="font-size:20px;color:#ffd700;font-weight:bold;">Рейд пройден!</div>';
            h += '<div style="color:#888;margin-top:10px;">Изначальный Ужас повержен. Шервуд спасён.</div>';
            h += '<div style="color:#aaa;margin-top:20px;font-style:italic;">«Узы Вечности скрепили твою победу. Ты вошёл в легенду.»</div>';
            h += '</div>';
            UI._openScreenScrollable('⚔️ Рейд', 'raid', h);
            return;
        }

        var h = '<div style="text-align:center;padding:20px;">';
        h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:4px;">⚔️ Мировой Рейд</div>';
        h += '<div style="color:#aaa;font-size:0.75em;margin-bottom:16px;">Доступно: ' + (maxRaids - raidsToday) + ' / ' + maxRaids + ' сегодня</div>';

        for (var i = 0; i < raids.length; i++) {
            var raid = raids[i];
            h += '<div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:10px;border:2px solid #ff6b35;margin-bottom:15px;max-width:400px;margin-left:auto;margin-right:auto;">';
            h += '<div style="color:#ff6b35;font-size:1.1em;font-weight:bold;">' + raid.name + '</div>';
            h += '<img src="assets/beast_quest/the_primordial_core.png" style="width:120px;height:120px;object-fit:contain;display:block;margin:10px auto;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '<div style="color:#aaa;font-size:0.7em;">HP ' + raid.hp.toLocaleString() + ' | АТК ' + raid.attack + ' | ' + raid.stages.length + ' этапа</div>';
            h += '<div style="color:#ffd700;font-size:0.65em;">🏆 Награда: +' + raid.exp + ' XP +' + raid.gold + ' золота</div>';
            if (check.can) {
                h += '<button onclick="Sherwood.Raid._startRaid()" class="btn btn-danger" style="margin-top:10px;padding:10px 30px;font-size:1.1em;font-weight:bold;">⚔️ НАЧАТЬ РЕЙД</button>';
            } else {
                h += '<div style="color:#f44336;font-size:0.7em;margin-top:8px;">' + check.reason + '</div>';
            }
            h += '</div>';
        }
        h += '</div>';
        UI._openScreenScrollable('⚔️ Рейд', 'raid', h);
    },

    _startRaid: function() {
        UI._stopMusic();
        var r = this.startRaid();
        if (!r.success) { UI._showToast(r.reason); this.showUI(); return; }
        UI._playSound('trap');
        this._showRaidBattle();
    },

    _showRaidBattle: function() {
        var s = this.getRaidStatus();
        if (!s) { this.showUI(); return; }
        var enemy = null;
        for (var i = 0; i < s.enemies.length; i++) {
            if (s.enemies[i].hp > 0) { enemy = s.enemies[i]; break; }
        }
        if (!enemy) { this._raidAttack(); return; }
        UI._showBattleScreen({
            name: enemy.name,
            image: 'assets/beast_quest/' + (enemy.image || 'plague_crow.png'),
            hp: enemy.hp,
            maxHp: enemy.maxHp,
            attack: enemy.attack,
            defense: enemy.defense
        }, 'raid', s.boss.name + ' - Этап ' + s.stageIndex + '/' + s.totalStages, '', 'Sherwood.Raid._raidAttack()', 'Sherwood.Raid._raidFlee()', 'assets/interface/fight_raid.png');
    },

    _raidAttack: function() {
        UI._playHitSounds();
        var r = this.raidAttack();
        if (!r) return;

        if (r.raidComplete) {
            UI._showDialog('Рейд пройден! +' + r.rewards.exp + 'XP +' + r.rewards.gold + 'G', '#ffd700');
            UI._stopMusic();
            UI.updateDisplay();
            var scrolls = Math.random() < 0.3 ? 1 + Math.floor(Math.random() * 3) : 0;
            if (scrolls) Sherwood.addResource('scrolls', scrolls);
            UI._pendingRewards = { exp: r.rewards.exp, gold: r.rewards.gold, silver: r.rewards.silver, scrolls: scrolls };
            UI._afterRewardAction = function() { UI._playMusic('main_theme'); Sherwood.Raid.showUI(); };
            UI._showVictoryScreen(UI._pendingRewards);
            return;
        }

        if (r.stageComplete) {
            UI._showDialog('Этап пройден!', '#4caf50');
            var self = this;
            setTimeout(function() { self._showRaidBattle(); }, 1200);
            return;
        }

        if (r.playerDead) {
            UI._showDialog('Вы погибли!', '#f44336');
            UI._stopMusic();
            var scrolls = Math.random() < 0.08 ? 1 : 0;
            if (scrolls) Sherwood.addResource('scrolls', scrolls);
            UI._pendingRewards = { exp: Math.floor(50), silver: Math.floor(100), scrolls: scrolls };
            UI._afterRewardAction = function() { UI._playMusic('main_theme'); Sherwood.Raid.showUI(); };
            UI._showDefeatScreen(UI._pendingRewards);
            return;
        }

        UI._hitEnemyCard();
        UI._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        UI._showDialog((r.crit ? 'КРИТ! ' : '') + 'Вы нанесли ' + r.damage + ' урона', r.crit ? '#ff6a00' : '#fff');
        if (r.enemyDamage) {
            var self = this;
            setTimeout(function() { UI._showDialog('Враг нанёс ' + r.enemyDamage + ' урона', '#f44336'); }, 700);
        }
        UI.updateDisplay();
        var self = this;
        setTimeout(function() { self._showRaidBattle(); }, 1000);
    },

    _raidFlee: function() {
        UI._stopMusic();
        this.fleeRaid();
        UI._playMusic('main_theme');
        this.showUI();
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Raid = Sherwood.Raid;

console.log('⚔️ Рейд загружен!');

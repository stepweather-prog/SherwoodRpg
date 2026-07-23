/**
 * Sherwood Raid — Рейды (мировой босс)
 */

Sherwood.Raid = {
    _raidActive: false,
    _raidBoss: null,
    _participants: [],
    _maxParticipants: 10,
    _raidsToday: 0,
    _maxRaidsPerDay: 3,
    _currentStage: 0,
    _totalStages: 3,

    RAID_BOSSES: [
        {
            id: 'sherwood_abomination',
            name: 'Шервудское Отродье',
            image: 'image (2).png',
            hp: 15000,
            maxHp: 15000,
            attack: 200,
            defense: 100,
            exp: 2000,
            gold: 1500,
            stages: [
                { name: 'Элиты подземок', enemies: [
                    { name: 'Проклятый титан', image: 'image (15).png', hp: 2000, attack: 80, defense: 40 },
                    { name: 'Костяной гигант', image: 'image (14).png', hp: 2200, attack: 85, defense: 45 },
                    { name: 'Кристаллический ёж', image: 'image (37).png', hp: 2500, attack: 90, defense: 50 }
                ]},
                { name: 'Боссы квестов', enemies: [
                    { name: 'Лесное Лихо', image: 'image (46).png', hp: 3500, attack: 110, defense: 60 },
                    { name: 'Проклятый Король', image: 'image (44).png', hp: 4000, attack: 130, defense: 70 }
                ]},
                { name: 'Мировой босс', enemies: [
                    { name: 'Шервудское Отродье', image: 'image (2).png', hp: 15000, attack: 200, defense: 100, isRaidBoss: true }
                ]}
            ]
        }
    ],

    init: function() {
        const player = Sherwood.getPlayer();
        if (!player.raid) {
            player.raid = { raidsToday: 0, lastRaidDate: new Date().toDateString() };
        }
        const today = new Date().toDateString();
        if (player.raid.lastRaidDate !== today) {
            player.raid.raidsToday = 0;
            player.raid.lastRaidDate = today;
        }
        this._raidsToday = player.raid.raidsToday || 0;
    },

    getAvailableRaids: function() {
        return this.RAID_BOSSES;
    },

    canJoinRaid: function() {
        if (this._raidActive) return { can: true, reason: 'Рейд уже активен' };
        const player = Sherwood.getPlayer();
        const today = new Date().toDateString();
        if (player.raid.lastRaidDate !== today) {
            player.raid.raidsToday = 0;
            player.raid.lastRaidDate = today;
        }
        if ((player.raid.raidsToday || 0) >= this._maxRaidsPerDay) {
            return { can: false, reason: 'Лимит рейдов на сегодня' };
        }
        return { can: true };
    },

    startRaid: function(bossIndex) {
        const check = this.canJoinRaid();
        if (!check.can) return check;
        
        const bossTemplate = this.RAID_BOSSES[bossIndex || 0];
        this._raidBoss = { ...bossTemplate, hp: bossTemplate.maxHp, maxHp: bossTemplate.maxHp };
        this._raidActive = true;
        this._participants = [Sherwood.getPlayer().name];
        this._currentStage = 0;
        
        const player = Sherwood.getPlayer();
        player.raid.raidsToday = (player.raid.raidsToday || 0) + 1;
        Sherwood.saveGame();
        
        return {
            success: true,
            boss: this._raidBoss,
            currentStage: this._raidBoss.stages[0],
            stageIndex: 1,
            totalStages: this._totalStages
        };
    },

    getRaidStatus: function() {
        if (!this._raidActive || !this._raidBoss) return null;
        const stage = this._raidBoss.stages[this._currentStage];
        return {
            boss: this._raidBoss,
            stage: stage,
            stageIndex: this._currentStage + 1,
            totalStages: this._totalStages,
            participants: this._participants
        };
    },

    raidAttack: function() {
        if (!this._raidActive || !this._raidBoss) return null;
        
        const stage = this._raidBoss.stages[this._currentStage];
        const player = Sherwood.getPlayer();
        
        const target = stage.enemies.find(e => e.hp > 0) || stage.enemies[0];
        if (!target) return { stageComplete: true };
        
        const damage = Math.max(1, Math.floor(player.stats.attack * (1 + Math.random() * 0.5)) - target.defense);
        target.hp = Math.max(0, (target.hp || target.maxHp || 100) - damage);
        if (!target.maxHp) target.maxHp = target.hp + damage;
        if (!target.hp && target.hp !== 0) target.hp = target.maxHp - damage;
        
        const enemyDead = target.hp <= 0;
        const result = {
            damage: damage,
            enemyName: target.name,
            enemyHp: Math.max(0, target.hp),
            enemyMaxHp: target.maxHp,
            enemyDead: enemyDead
        };
        
        if (enemyDead) {
            const expReward = Math.floor(target.exp || 100);
            const goldReward = Math.floor(target.gold || 80);
            Sherwood.addExp(expReward);
            Sherwood.addResource('gold', goldReward);
            result.exp = expReward;
            result.gold = goldReward;
            
            const allDead = stage.enemies.every(e => e.hp <= 0);
            if (allDead) {
                this._currentStage++;
                if (this._currentStage >= this._totalStages) {
                    return this._completeRaid();
                }
                result.stageComplete = true;
                result.nextStage = this._raidBoss.stages[this._currentStage];
            }
        } else {
            const bossDamage = Math.max(1, Math.floor(target.attack * (0.5 + Math.random() * 0.5)) - player.stats.defense);
            player.stats.hp = Math.max(0, player.stats.hp - bossDamage);
            result.bossDamage = bossDamage;
            result.playerHp = player.stats.hp;
            if (player.stats.hp <= 0) {
                result.playerDead = true;
                player.stats.hp = 1;
            }
        }
        
        Sherwood.saveGame();
        return result;
    },

    _completeRaid: function() {
        const boss = this._raidBoss;
        const player = Sherwood.getPlayer();
        
        const totalExp = boss.exp + Math.floor(Math.random() * 500);
        const totalGold = boss.gold + Math.floor(Math.random() * 300);
        
        Sherwood.addExp(totalExp);
        Sherwood.addResource('gold', totalGold);
        Sherwood.addResource('silver', Math.floor(totalGold * 2));
        
        this._raidActive = false;
        const completedBoss = this._raidBoss;
        this._raidBoss = null;
        
        return {
            raidComplete: true,
            boss: completedBoss,
            rewards: { exp: totalExp, gold: totalGold, silver: Math.floor(totalGold * 2) }
        };
    },

    fleeRaid: function() {
        this._raidActive = false;
        this._raidBoss = null;
        return { success: true };
    },

    isRaidActive: function() {
        return this._raidActive;
    }
};

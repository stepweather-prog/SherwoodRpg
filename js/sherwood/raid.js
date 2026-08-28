/**
 * Sherwood Raid — Мировой рейд
 * Изначальный Ужас — Спящий в Корнях
 * Открывается после прохождения всех 16 глав
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
    _playerAlive: true,
    _isUnlocked: false,

    // ============================================================
    //  ДАННЫЕ РЕЙДА
    // ============================================================

    RAID_BOSSES: [{
        id: 'primordial_dread',
        name: 'Изначальный Ужас — Спящий в Корнях',
        image: 'original_horror.png',
        hp: 50000,
        maxHp: 50000,
        attack: 350,
        defense: 180,
        exp: 10000,
        gold: 8000,
        // Требуется пройти все 16 глав
        requiredChapters: 16,
        stages: [{
            name: 'Пробуждение Корней',
            enemies: [{
                name: 'Голем Скверного Дуба',
                image: 'blighted_oak_golem.png',
                hp: 5000,
                maxHp: 5000,
                attack: 140,
                defense: 70
            }, {
                name: 'Корневой Палач',
                image: 'root_executioner.png',
                hp: 5500,
                maxHp: 5500,
                attack: 155,
                defense: 75
            }, {
                name: 'Древний Владыка',
                image: 'blight_lord_leshy.png',
                hp: 6000,
                maxHp: 6000,
                attack: 170,
                defense: 85
            }]
        }, {
            name: 'Стражи Бездны',
            enemies: [{
                name: 'Проклятая Жрица',
                image: 'cursed_priestess.png',
                hp: 7000,
                maxHp: 7000,
                attack: 190,
                defense: 95
            }, {
                name: 'Лорд Хаоса',
                image: 'chaos_lord.png',
                hp: 7500,
                maxHp: 7500,
                attack: 205,
                defense: 100
            }, {
                name: 'Скверный Король',
                image: 'blight_king.png',
                hp: 8000,
                maxHp: 8000,
                attack: 220,
                defense: 110
            }]
        }, {
            name: 'Изначальный Ужас',
            enemies: [{
                name: 'Изначальный Ужас',
                image: 'original_horror.png',
                hp: 50000,
                maxHp: 50000,
                attack: 350,
                defense: 180,
                isRaidBoss: true
            }]
        }],
        // Награда за прохождение
        rewards: {
            exp: 15000,
            gold: 10000,
            silver: 50000,
            trophy: {
                id: 'raid_victory',
                name: 'Узы Вечности',
                icon: '👑',
                bonus: { attack: 50, defense: 50, hp: 100 },
                description: 'Рейд пройден! Ты запечатал Изначальный Ужас.'
            }
        }
    }],

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================

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
        
        // Восстановление активного рейда
        if (p.raid.activeRaid) {
            this._raidBoss = p.raid.activeRaid;
            this._raidActive = true;
            this._currentStage = p.raid.currentStage || 0;
            this._playerAlive = p.raid.playerAlive !== false;
        }
        
        console.log('⚔️ Рейд инициализирован');
        console.log('🔓 Открыт:', this._isUnlocked);
        console.log('📊 Попыток сегодня:', this._raidsToday);
    },

    // ============================================================
    //  ПРОВЕРКА ОТКРЫТИЯ
    // ============================================================

    _checkUnlock: function() {
        // Проверяем, пройдены ли все 16 глав
        if (typeof Sherwood.Tavern !== 'undefined' && Sherwood.Tavern.getCompletedCount) {
            var completed = Sherwood.Tavern.getCompletedCount();
            var required = this.RAID_BOSSES[0].requiredChapters || 16;
            return completed >= required;
        }
        return false;
    },

    isUnlocked: function() {
        return this._isUnlocked;
    },

    // ============================================================
    //  МЕТОДЫ РЕЙДА
    // ============================================================

    getAvailableRaids: function() {
        return this.RAID_BOSSES;
    },

    canJoinRaid: function() {
        var p = Sherwood.getPlayer();
        if (!p) return { can: false, reason: 'Игрок не найден' };
        
        // Проверка открытия
        if (!this._isUnlocked) {
            return { can: false, reason: 'Рейд запечатан. Пройди все 16 глав.' };
        }
        
        // Проверка лимита на день
        if ((p.raid.raidsToday || 0) >= this._maxRaidsPerDay) {
            return { can: false, reason: 'Лимит рейдов на сегодня (3/3)' };
        }
        
        // Проверка активного рейда
        if (this._raidActive) {
            return { can: false, reason: 'Рейд уже идёт' };
        }
        
        // Проверка HP игрока
        if (!p.stats || p.stats.hp <= 0) {
            return { can: false, reason: 'Игрок мёртв' };
        }
        
        // Проверка, не пройден ли уже рейд
        if (p.raid.completed) {
            return { can: false, reason: 'Рейд уже пройден. Жди обновления.' };
        }
        
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
            if (stage.enemies[i].hp > 0) {
                return stage.enemies[i];
            }
        }
        return null;
    },

    _getNextEnemy: function() {
        var enemy = this.getCurrentEnemy();
        if (enemy) return enemy;

        this._currentStage++;

        if (this._currentStage >= this._totalStages) {
            return null;
        }

        var stage = this._raidBoss.stages[this._currentStage];
        if (stage && stage.enemies.length > 0) {
            return stage.enemies[0];
        }

        return null;
    },

    raidAttack: function() {
        if (!this._raidActive || !this._raidBoss) {
            return { error: 'Рейд не активен' };
        }

        if (this._currentStage >= this._totalStages) {
            return { raidComplete: true };
        }

        if (!this._playerAlive) {
            return { playerDead: true, message: 'Вы погибли в рейде' };
        }

        var enemy = this.getCurrentEnemy();

        if (!enemy) {
            this._currentStage++;
            if (this._currentStage >= this._totalStages) {
                return this._completeRaid();
            }
            var newEnemy = this.getCurrentEnemy();
            if (newEnemy) {
                return { stageComplete: true, nextEnemy: newEnemy, stageIndex: this._currentStage + 1 };
            }
            return { error: 'Нет врагов' };
        }

        var p = Sherwood.getPlayer();
        if (!p) return { error: 'Игрок не найден' };

        // Урон игрока
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

        // Проверка смерти врага
        if (enemy.hp <= 0) {
            var stage = this._raidBoss.stages[this._currentStage];
            var allDead = stage.enemies.every(function(e) { return e.hp <= 0; });

            if (allDead) {
                this._currentStage++;
                if (this._currentStage >= this._totalStages) {
                    return this._completeRaid();
                }
                result.stageComplete = true;
                result.nextStage = this._raidBoss.stages[this._currentStage];
                result.stageIndex = this._currentStage + 1;
            } else {
                result.nextEnemy = this.getCurrentEnemy();
            }

            this._saveProgress();
            return result;
        }

        // Атака врага
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
        var rewards = boss.rewards || {
            exp: 10000,
            gold: 8000,
            silver: 40000,
            trophy: null
        };
        
        var totalExp = rewards.exp + Math.floor(Math.random() * 2000);
        var totalGold = rewards.gold + Math.floor(Math.random() * 1000);
        var totalSilver = rewards.silver + Math.floor(Math.random() * 2000);

        var aliveCount = this._playerAlive ? 1 : 0;
        var p = Sherwood.getPlayer();

        // Награда только если выжил
        if (this._playerAlive) {
            Sherwood.addExp(totalExp);
            Sherwood.addResource('gold', totalGold);
            Sherwood.addResource('silver', totalSilver);
            
            // Отмечаем рейд как пройденный
            if (p && p.raid) {
                p.raid.completed = true;
            }
            
            // Узы Вечности — перманентный бонус
            if (!p.eternityBonds) p.eternityBonds = { count: 0, bonus: 0 };
            p.eternityBonds.count++;
            p.eternityBonds.bonus = p.eternityBonds.count * 5;
            
            // Трофей
            if (rewards.trophy && typeof Sherwood.addTrophy === 'function') {
                Sherwood.addTrophy(
                    rewards.trophy.id,
                    rewards.trophy.name,
                    rewards.trophy.bonus || { attack: 50, defense: 50, hp: 100 },
                    rewards.trophy.icon || '👑',
                    'raid'
                );
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
            aliveCount: aliveCount,
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

    isRaidActive: function() {
        return this._raidActive;
    },

    isPlayerAlive: function() {
        return this._playerAlive;
    },

    getParticipantCount: function() {
        return this._participants ? this._participants.length : 0;
    },

    joinRaid: function(playerName) {
        if (!this._raidActive) return { success: false, reason: 'Рейд не активен' };
        if (this._participants.indexOf(playerName) !== -1) {
            return { success: false, reason: 'Уже в рейде' };
        }
        this._participants.push(playerName);
        var player = Sherwood.getPlayer();
        if (player && player.raid) {
            player.raid.participants = this._participants;
            Sherwood.saveGame();
        }
        return { success: true, participants: this._participants };
    },

    // ============================================================
    //  UI — ПОКАЗ РЕЙДА
    // ============================================================

    showUI: function() {
        if (typeof window.showRaidScreen === 'function') {
            window.showRaidScreen();
            return;
        }
        this._renderRaidUI();
    },

    _renderRaidUI: function() {
        var old = document.getElementById('raid-screen');
        if (old) old.remove();
        
        var isUnlocked = this._isUnlocked;
        var isActive = this._raidActive;
        var status = this.getRaidStatus();
        var p = Sherwood.getPlayer();
        var completed = p && p.raid ? p.raid.completed : false;
        
        var screenHTML = `
        <div id="raid-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/background_raid.png') center/cover no-repeat;display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
                <button onclick="Sherwood.Raid.closeUI()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                    <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
                </button>
                <span style="color:#e0c080;font-size:1.2em;">⚔️ Мировой Рейд</span>
                <span style="color:#888;font-size:12px;margin-left:auto;">
                    ${isUnlocked ? '✅ Открыт' : '🔒 Закрыт'}
                </span>
            </div>
            
            <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
                <div style="max-width:600px;margin:0 auto;">
                    ${this._renderRaidContent(isUnlocked, isActive, status, completed)}
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', screenHTML);
    },

    _renderRaidContent: function(isUnlocked, isActive, status, completed) {
        if (!isUnlocked) {
            return `
            <div style="text-align:center;padding:40px 20px;">
                <div style="font-size:64px;margin-bottom:20px;">🔒</div>
                <div style="font-size:20px;color:#ffa500;">Рейд запечатан</div>
                <div style="color:#888;margin-top:10px;">Пройди все 16 глав, чтобы открыть доступ к рейду.</div>
                <div style="color:#555;margin-top:10px;font-size:14px;">
                    Изначальный Ужас ждёт своего часа...
                </div>
            </div>`;
        }
        
        if (completed) {
            return `
            <div style="text-align:center;padding:40px 20px;">
                <div style="font-size:64px;margin-bottom:20px;">🏆</div>
                <div style="font-size:20px;color:#ffd700;font-weight:bold;">Рейд пройден!</div>
                <div style="color:#888;margin-top:10px;">Изначальный Ужас повержен. Шервуд спасён.</div>
                <div style="color:#aaa;margin-top:20px;font-style:italic;">
                    «Узы Вечности скрепили твою победу. Ты вошёл в легенду.»
                </div>
            </div>`;
        }
        
        if (isActive && status) {
            return this._renderActiveRaid(status);
        }
        
        // Рейд доступен, но не активен
        return `
        <div style="background:rgba(255,255,255,0.05);padding:20px;border-radius:8px;border:2px solid #ff6b35;margin-bottom:15px;">
            <div style="text-align:center;">
                <div style="font-size:48px;margin-bottom:10px;">👾</div>
                <div style="font-size:20px;color:#ff6b35;font-weight:bold;">Изначальный Ужас — Спящий в Корнях</div>
                <div style="color:#888;font-size:14px;margin-top:5px;">
                    ❤️ ${this.RAID_BOSSES[0].hp} HP | ⚔️ ${this.RAID_BOSSES[0].attack} атака
                </div>
                <div style="color:#aaa;font-size:13px;margin-top:10px;">
                    ⚔️ 3 этапа | 👥 до 10 участников
                </div>
                <div style="color:#ffd700;font-size:13px;margin-top:5px;">
                    🏆 Награда: +${this.RAID_BOSSES[0].rewards.exp} опыта, +${this.RAID_BOSSES[0].rewards.gold} золота
                </div>
                <div style="color:#888;font-size:12px;margin-top:5px;">
                    📅 Сегодня: ${this._raidsToday}/${this._maxRaidsPerDay}
                </div>
                <button onclick="Sherwood.Raid.startRaidFromUI()" class="btn btn-danger" style="margin-top:15px;padding:15px 40px;font-size:18px;font-weight:bold;">
                    ⚔️ НАЧАТЬ РЕЙД
                </button>
            </div>
        </div>`;
    },

    _renderActiveRaid: function(status) {
        var stage = status.stage;
        var enemies = status.enemies || [];
        var aliveEnemies = status.aliveEnemies || [];
        var isBossStage = status.stageIndex === status.totalStages;
        
        var html = `
        <div style="background:rgba(255,0,0,0.1);border:2px solid #ff6b6b;border-radius:8px;padding:15px;margin-bottom:15px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="color:#ff6b6b;font-weight:bold;font-size:16px;">⚔️ РЕЙД ИДЁТ</div>
                    <div style="color:#ffa500;font-size:14px;">${status.stageName}</div>
                    <div style="color:#888;font-size:12px;">Этап ${status.stageIndex}/${status.totalStages}</div>
                    <div style="color:#888;font-size:12px;">👥 Участников: ${status.participants.length}</div>
                </div>
                <div style="text-align:right;">
                    ${status.playerAlive ? 
                        '<span style="color:#52b788;">✅ Жив</span>' : 
                        '<span style="color:#ff6b6b;">💀 Мёртв</span>'
                    }
                </div>
            </div>
            
            <div style="margin-top:10px;max-height:200px;overflow-y:auto;">
                ${enemies.map(function(e) {
                    var isAlive = e.hp > 0;
                    var color = isAlive ? '#ff6b6b' : '#52b788';
                    var statusIcon = isAlive ? '⚔️' : '✅';
                    return `
                    <div style="display:flex;justify-content:space-between;padding:4px 8px;background:rgba(255,255,255,0.03);margin:2px 0;border-radius:4px;">
                        <span style="color:${color};">${statusIcon} ${e.name}</span>
                        <span style="color:${color};">${isAlive ? '❤️ ' + e.hp : 'Повержен'}</span>
                    </div>
                `;
                }).join('')}
            </div>
            
            <div style="display:flex;gap:10px;margin-top:12px;">
                <button onclick="Sherwood.Raid.attackFromUI()" class="btn btn-danger" style="flex:2;padding:12px;font-size:16px;">⚔️ АТАКОВАТЬ</button>
                <button onclick="Sherwood.Raid.fleeFromUI()" class="btn" style="flex:1;padding:12px;">🏃 Бежать</button>
            </div>
            
            <div id="raid-battle-log" style="margin-top:8px;padding:6px;background:rgba(0,0,0,0.5);border-radius:4px;height:60px;overflow-y:auto;font-size:12px;color:#888;"></div>
        </div>`;
        
        return html;
    },

    startRaidFromUI: function() {
        var result = this.startRaid();
        if (!result.success) {
            alert('❌ ' + result.reason);
            return;
        }
        this._renderRaidUI();
    },

    attackFromUI: function() {
        var result = this.raidAttack();
        if (!result) return;
        
        var log = document.getElementById('raid-battle-log');
        if (log) {
            var msg = '';
            if (result.damage) {
                msg += `💢 ${result.crit ? '💥 КРИТ! ' : ''}${result.damage} урона!`;
                if (result.extra) msg += ` +${result.extra} доп. урона!`;
            }
            if (result.enemyDamage) {
                msg += ` Враг нанёс ${result.enemyDamage} урона.`;
            }
            if (result.enemyDead) {
                msg += ' 🏆 Враг повержен!';
            }
            if (result.stageComplete) {
                msg += ` ✅ ${result.nextStage.name} начат!`;
            }
            if (result.raidComplete) {
                msg += ` 🎉 РЕЙД ПРОЙДЕН!`;
            }
            if (result.playerDead) {
                msg += ` 💀 Ты погиб в рейде...`;
            }
            
            log.innerHTML += `<div>${msg}</div>`;
            log.scrollTop = log.scrollHeight;
        }
        
        // Обновляем UI
        setTimeout(function() {
            this._renderRaidUI();
            if (result.raidComplete && result.won) {
                alert('🏆 РЕЙД ПРОЙДЕН! Ты запечатал Изначальный Ужас!');
            } else if (result.raidComplete && !result.won) {
                alert('💀 Рейд провален. Ты погиб.');
            } else if (result.playerDead) {
                alert('💀 Ты погиб! Рейд продолжается без тебя...');
            }
        }.bind(this), 300);
    },

    fleeFromUI: function() {
        if (confirm('Точно покинуть рейд? Прогресс будет потерян.')) {
            this.fleeRaid();
            this._renderRaidUI();
        }
    },

    closeUI: function() {
        var screen = document.getElementById('raid-screen');
        if (screen) screen.remove();
        if (typeof Menu !== 'undefined' && Menu.show) {
            Menu.show();
        }
    }
};

// ---------- ЭКСПОРТ ----------
window.Sherwood = window.Sherwood || {};
window.Sherwood.Raid = Sherwood.Raid;

console.log('⚔️ Рейд загружен!');
console.log('🔓 Открыт:', Sherwood.Raid.isUnlocked());
console.log('👾 Босс:', Sherwood.Raid.RAID_BOSSES[0].name);

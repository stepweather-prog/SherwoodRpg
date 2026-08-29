// ============================================================
//  js/sherwood/quests.js — ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ С UI
// ============================================================

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Quests = {
    _currentQuest: null,
    _currentEnemy: null,
    _currentStage: 0,
    _inBattle: false,
    _battleLog: [],
    _battleOverlay: null,

    // ============================================================
    //  ДАННЫЕ КВЕСТОВ
    // ============================================================

    CHAPTERS: [
        {
            id: 1,
            name: 'Кровь Великого Дуба',
            quest: 'Останови осквернение леса',
            stages: 5,
            enemy: { name: 'Чумной Ворон', image: 'plague_crow.png', hp: 1000, atk: 400, def: 200, exp: 30, gold: 15 },
            boss: { name: 'Лесничий-Отступник', image: 'fallen_forester.png', hp: 8000, atk: 800, def: 800, exp: 150, gold: 100 },
            rewards: { exp: 200, gold: 50, silver: 500 },
            lore: 'Шервудский лес веками был щитом...'
        },
        {
            id: 2,
            name: 'Кара Скверны',
            quest: 'Очисти лес от искажённых тварей',
            stages: 5,
            enemy: { name: 'Искажённый Бес', image: 'warped_imp.png', hp: 4000, atk: 1200, def: 800, exp: 40, gold: 20 },
            boss: { name: 'Вожак Искаженной Стаи', image: 'blight_alpha_stag.png', hp: 35000, atk: 2500, def: 2000, exp: 200, gold: 130 },
            rewards: { exp: 400, gold: 100, silver: 1000 },
            lore: 'Смерть Дуба вызвала цепную реакцию...'
        }
        // ... остальные главы
    ],

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.questProgress) {
            p.questProgress = { completed: [], currentChapter: 1 };
        }
        console.log('📋 Квесты инициализированы');
    },

    // ============================================================
    //  МЕТОДЫ
    // ============================================================

    getAllChapters: function() {
        return this.CHAPTERS;
    },

    getChapter: function(id) {
        return this.CHAPTERS.find(function(ch) { return ch.id === id; });
    },

    getProgress: function() {
        var p = Sherwood.getPlayer();
        return p ? p.questProgress : { completed: [], currentChapter: 1 };
    },

    getBattle: function() {
        if (!this._inBattle || !this._currentEnemy) return null;
        return {
            chapter: this._currentQuest,
            enemy: this._currentEnemy,
            stage: this._currentStage + 1,
            total: this._currentQuest ? this._currentQuest.stages : 5
        };
    },

    isOnCooldown: function() {
        return false;
    },

    getCooldownRemaining: function() {
        return 0;
    },

    startChapter: function(id) {
        var ch = this.getChapter(id);
        if (!ch) return { success: false, reason: 'Глава не найдена' };

        var p = Sherwood.getPlayer();
        if (p.questProgress.completed.indexOf(id) !== -1) {
            return { success: false, reason: 'Глава уже пройдена' };
        }

        this._currentQuest = ch;
        this._currentStage = 0;
        this._inBattle = true;
        this._currentEnemy = JSON.parse(JSON.stringify(ch.enemy));
        this._battleLog = [];

        return {
            success: true,
            chapter: ch,
            enemy: this._currentEnemy,
            stage: 1,
            total: ch.stages
        };
    },

    attack: function() {
        if (!this._inBattle || !this._currentEnemy) {
            return { error: 'Нет активного боя' };
        }

        var p = Sherwood.getPlayer();
        var enemy = this._currentEnemy;
        var ch = this._currentQuest;

        // Урон игрока
        var dmg = Math.max(1, p.stats.attack - enemy.def + Math.floor(Math.random() * 20));
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
            this._currentStage++;
            if (this._currentStage >= ch.stages) {
                // Глава пройдена
                p.questProgress.completed.push(ch.id);
                p.questProgress.currentChapter = ch.id + 1;
                Sherwood.saveGame();

                // Награда
                Sherwood.addExp(ch.rewards.exp);
                Sherwood.addResource('gold', ch.rewards.gold);
                Sherwood.addResource('silver', ch.rewards.silver);

                this._inBattle = false;
                result.chapterComplete = true;
                result.rewards = ch.rewards;
                return result;
            }

            // Следующий враг
            if (this._currentStage === ch.stages - 1) {
                // Босс
                this._currentEnemy = JSON.parse(JSON.stringify(ch.boss));
                result.nextEnemy = this._currentEnemy;
                result.isBoss = true;
            } else {
                // Обычный враг
                var nextEnemy = JSON.parse(JSON.stringify(ch.enemy));
                var mult = 1 + (this._currentStage * 0.2);
                nextEnemy.hp = Math.floor(nextEnemy.hp * mult);
                nextEnemy.atk = Math.floor(nextEnemy.atk * mult);
                nextEnemy.def = Math.floor(nextEnemy.def * mult);
                this._currentEnemy = nextEnemy;
                result.nextEnemy = nextEnemy;
            }

            result.enemyDead = true;
            result.stageComplete = true;
            return result;
        }

        // Атака врага
        var edmg = Math.max(1, enemy.atk - p.stats.defense + Math.floor(Math.random() * 15));
        p.stats.hp = Math.max(0, p.stats.hp - edmg);
        result.enemyDamage = edmg;
        result.playerHp = p.stats.hp;

        if (p.stats.hp <= 0) {
            this._inBattle = false;
            result.playerDead = true;
            p.stats.hp = 1;
            Sherwood.saveGame();
            return result;
        }

        Sherwood.saveGame();
        return result;
    },

    flee: function() {
        this._inBattle = false;
        this._currentEnemy = null;
        this._currentQuest = null;
        return { success: true };
    },

    // ============================================================
    //  UI — ПОКАЗ КВЕСТОВ
    // ============================================================

    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Квесты', '📋');
            }
            return;
        }

        UI._playSound('click');

        var prog = this.getProgress();
        var currentChapter = prog.currentChapter || 1;
        var ch = this.getChapter(currentChapter);

        if (!ch) {
            UI._showPlaceholder('Квесты', 'quests');
            return;
        }

        var completed = prog.completed && prog.completed.indexOf(ch.id) !== -1;
        var isActive = this._inBattle && this._currentQuest && this._currentQuest.id === ch.id;

        var displayEnemy, displayImage, isBossStage = false;
        if (completed) {
            displayEnemy = ch.boss;
            displayImage = 'assets/beast_quest/' + ch.boss.image;
            isBossStage = true;
        } else if (isActive && this._currentEnemy) {
            displayEnemy = this._currentEnemy;
            displayImage = 'assets/all_beasts/' + displayEnemy.image;
            if (this._currentStage >= ch.stages - 1) {
                displayImage = 'assets/beast_quest/' + ch.boss.image;
                isBossStage = true;
            }
        } else {
            displayEnemy = ch.enemy;
            displayImage = 'assets/all_beasts/' + ch.enemy.image;
        }

        var cardImg = isBossStage ? 'assets/interface/quest_boss.png' : 'assets/interface/quest_regular.png';

        var h = '';
        h += '<div style="text-align:center;">';
        h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:4px;">Глава ' + ch.id + ' — ' + ch.name + '</div>';
        h += '<div style="color:#fff;font-size:1em;font-weight:bold;margin-bottom:4px;">' + displayEnemy.name + '</div>';
        h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:20px;">HP ' + displayEnemy.hp + ' | АТК ' + (displayEnemy.atk || displayEnemy.attack) + ' | ЗЩТ ' + (displayEnemy.def || displayEnemy.defense) + '</div>';
        h += '<div style="position:relative;display:block;width:360px;height:360px;margin:0 auto 24px;"><img src="' + cardImg + '" style="width:360px;height:360px;object-fit:contain;position:absolute;top:0;left:0;"><img src="' + displayImage + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:210px;height:210px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'"></div>';

        if (completed) {
            h += '<div style="color:#4caf50;font-size:1em;font-weight:bold;">✅ Пройдено</div>';
        } else if (isActive) {
            var stageText = (this._currentStage || 0) + 1 + '/' + ch.stages;
            h += '<div style="color:#ffa500;font-size:0.9em;margin-bottom:8px;">⚔️ Этап ' + stageText + '</div>';
            h += '<button onclick="Sherwood.Quests._showQuestBattle()" style="background:#c9a040;border:none;border-radius:8px;padding:12px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">⚔️ В бой</button>';
        } else {
            h += '<button onclick="Sherwood.Quests._startQuest(' + ch.id + ')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">⚔️ Начать главу</button>';
        }

        h += '<div style="margin-top:8px;color:#888;font-size:0.7em;">🏆 Награда: +' + ch.rewards.exp + ' опыта, +' + ch.rewards.gold + ' золота</div>';
        h += '</div>';

        UI._openScreenScrollable('Квесты', 'quests', h);
    },

    // ============================================================
    //  UI ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ============================================================

    _startQuest: function(id) {
        var r = this.startChapter(id);
        if (!r.success) {
            UI._showToast(r.reason || 'Ошибка');
            this.showUI();
            return;
        }
        this._showQuestBattle();
    },

    _showQuestBattle: function() {
        if (!this._inBattle || !this._currentEnemy) {
            this.showUI();
            return;
        }

        var b = this.getBattle();
        if (!b) return;

        var ch = this._currentQuest;
        var enemy = this._currentEnemy;

        UI._showBattleScreen({
            name: enemy.name,
            image: 'assets/all_beasts/' + (enemy.image || 'plague_crow.png'),
            hp: enemy.hp,
            maxHp: enemy.maxHp || enemy.hp,
            attack: enemy.atk || 0,
            defense: enemy.def || 0
        }, 'quest', ch.name + ' — Этап ' + b.stage + '/' + b.total, '', 'Sherwood.Quests._questAttack()', 'Sherwood.Quests._questFlee()');
    },

    _questAttack: function() {
        UI._playHitSounds();
        var result = this.attack();

        if (result.error) {
            UI._showDialog(result.error, '#ff9800');
            return;
        }

        if (result.chapterComplete) {
            UI._showDialog('🏆 Глава пройдена!', '#ffd700');
            UI._playSound('victory');
            UI._stopMusic();
            UI._pendingRewards = result.rewards;
            UI._afterRewardAction = function() {
                UI._playMusic('main_theme');
                Sherwood.Quests.showUI();
            };
            UI._showVictoryScreen(UI._pendingRewards);
            return;
        }

        if (result.playerDead) {
            UI._showDialog('💀 Поражение...', '#f44336');
            UI._playSound('defeat');
            UI._stopMusic();
            UI._pendingRewards = { exp: 10, silver: 50 };
            UI._afterRewardAction = function() {
                Sherwood.Quests.showUI();
            };
            UI._showDefeatScreen(UI._pendingRewards);
            return;
        }

        if (result.enemyDead) {
            UI._showDialog('✅ Враг повержен!', '#4caf50');
            UI._updateEnemyHP(0, result.enemyMaxHp || 100);
            if (result.stageComplete) {
                UI._playSound('victory');
            }
            var self = this;
            setTimeout(function() {
                self._showQuestBattle();
            }, 1000);
            return;
        }

        UI._hitEnemyCard();
        UI._updateEnemyHP(result.enemyHp, result.enemyMaxHp);
        UI._showDialog((result.crit ? '💥 КРИТ! ' : '') + 'Урон: ' + result.damage, result.crit ? '#ff6a00' : '#fff');

        if (result.enemyDamage) {
            var self = this;
            setTimeout(function() {
                UI._showDialog('💢 Враг нанёс ' + result.enemyDamage + ' урона', '#f44336');
                UI.updateDisplay();
            }, 700);
        }

        var self = this;
        setTimeout(function() {
            self._showQuestBattle();
        }, 1200);
    },

    _questFlee: function() {
        this.flee();
        UI._stopMusic();
        this.showUI();
    }
};

// ============================================================
//  ЭКСПОРТ
// ============================================================

window.Sherwood = window.Sherwood || {};
window.Sherwood.Quests = Sherwood.Quests;

console.log('📋 Квесты загружены!');

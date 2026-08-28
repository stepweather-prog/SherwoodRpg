/**
 * Sherwood Portal — Порталы (7 уровней)
 * Связаны с сюжетом: открываются по мере прохождения глав
 */

Sherwood.Portal = {
    _currentPortal: null,
    _currentEnemies: [],
    _currentLevel: 0,
    _inPortal: false,
    _deathCount: 0,
    _timerInterval: null,
    _timeRemaining: 0,

    // ============================================================
    //  ДАННЫЕ ПОРТАЛОВ
    // ============================================================

    PORTALS: [
        {
            id: 1,
            name: 'Портал Нашествия',
            icon: '🌀',
            bg: 'assets/backgrounds/portal_1.jpeg',
            // Открывается после главы 5
            requiredChapter: 5,
            boss: { 
                name: 'Жнец-Полководец', 
                image: 'the_reaper_commander.png', 
                hp: 3000, 
                attack: 120, 
                defense: 60, 
                exp: 500, 
                gold: 400 
            },
            guard: { 
                name: 'Матка Лесных Короедов', 
                image: 'the_hive_mother.png', 
                hp: 2000, 
                attack: 95, 
                defense: 46, 
                exp: 300, 
                gold: 250 
            },
            rewards: { gold: 500, exp: 800, silver: 1200 }
        },
        {
            id: 2,
            name: 'Портал Черных Пауков',
            icon: '🕷️',
            bg: 'assets/backgrounds/portal_2.png',
            requiredChapter: 7,
            boss: { 
                name: 'Ткачиха Мрака', 
                image: 'the_dark_weaver.png', 
                hp: 3500, 
                attack: 135, 
                defense: 65, 
                exp: 600, 
                gold: 480 
            },
            guard: { 
                name: 'Проклятый Король Разбойников', 
                image: 'the_cursed_outlaw_king.png', 
                hp: 2300, 
                attack: 105, 
                defense: 50, 
                exp: 350, 
                gold: 300 
            },
            rewards: { gold: 650, exp: 1000, silver: 1500 }
        },
        {
            id: 3,
            name: 'Портал Увядания',
            icon: '🥀',
            bg: 'assets/backgrounds/portal_3.png',
            requiredChapter: 9,
            boss: { 
                name: 'Истлевший Титан', 
                image: 'the_decayed_titan.png', 
                hp: 4000, 
                attack: 150, 
                defense: 70, 
                exp: 700, 
                gold: 560 
            },
            guard: { 
                name: 'Древний Хранитель Склепа', 
                image: 'ancient_crypt_warden.png', 
                hp: 2600, 
                attack: 115, 
                defense: 55, 
                exp: 400, 
                gold: 350 
            },
            rewards: { gold: 800, exp: 1200, silver: 1800 },
            trophy: { 
                id: 'portal_3', 
                name: 'Окровавленный Клык Волка', 
                bonus: { attack: 15, defense: 15, hp: 15 }, 
                icon: 'assets/all_trophies/portal_trophies/1_wolf_fang.png' 
            }
        },
        {
            id: 4,
            name: 'Портал Цепей',
            icon: '⛓️',
            bg: 'assets/backgrounds/portal_1.jpeg',
            requiredChapter: 10,
            boss: { 
                name: 'Вечный Узник', 
                image: 'the_eternal_prisoner.png', 
                hp: 4500, 
                attack: 165, 
                defense: 75, 
                exp: 800, 
                gold: 640 
            },
            guard: { 
                name: 'Эхо Трех Порталов', 
                image: 'echo_of_the_triumvirate.png', 
                hp: 3000, 
                attack: 130, 
                defense: 60, 
                exp: 450, 
                gold: 400 
            },
            rewards: { gold: 950, exp: 1400, silver: 2100 },
            trophy: { 
                id: 'portal_4', 
                name: 'Сердце Ненасытного Тритона', 
                bonus: { attack: 30, defense: 30, hp: 30 }, 
                icon: 'assets/all_trophies/portal_trophies/2_heart_of_the_Insatiable_triton.png' 
            }
        },
        {
            id: 5,
            name: 'Портал Ликантропов',
            icon: '🐺',
            bg: 'assets/backgrounds/portal_2.png',
            requiredChapter: 12,
            boss: { 
                name: 'Кровавый Вожак', 
                image: 'the_blood_alpha.png', 
                hp: 5000, 
                attack: 180, 
                defense: 80, 
                exp: 900, 
                gold: 720 
            },
            guard: { 
                name: 'Палач Священного Древа', 
                image: 'sacred_tree_executioner.png', 
                hp: 3500, 
                attack: 145, 
                defense: 68, 
                exp: 500, 
                gold: 450 
            },
            rewards: { gold: 1100, exp: 1600, silver: 2400 },
            trophy: { 
                id: 'portal_5', 
                name: 'Изумрудный Осколок Исполина', 
                bonus: { attack: 50, defense: 50, hp: 50 }, 
                icon: 'assets/all_trophies/portal_trophies/3_emerald_shard_of_the_giant.png' 
            }
        },
        {
            id: 6,
            name: 'Портал Скорпиона',
            icon: '🦂',
            bg: 'assets/backgrounds/portal_3.png',
            requiredChapter: 14,
            boss: { 
                name: 'Базальтовый Жнец', 
                image: 'the_basalt_reaper.png', 
                hp: 5500, 
                attack: 195, 
                defense: 85, 
                exp: 1000, 
                gold: 800 
            },
            guard: { 
                name: 'Шервудское Отродье', 
                image: 'sherwood_abomination.png', 
                hp: 4500, 
                attack: 170, 
                defense: 80, 
                exp: 600, 
                gold: 500 
            },
            rewards: { gold: 1250, exp: 1800, silver: 2700 },
            trophy: { 
                id: 'portal_6', 
                name: 'Проклятая Эмблема Склепа', 
                bonus: { attack: 80, defense: 80, hp: 80 }, 
                icon: 'assets/all_trophies/portal_trophies/4_cursed_emblem_of_the_crypt.png' 
            }
        },
        {
            id: 7,
            name: 'Портал Искажения',
            icon: '👁️',
            bg: 'assets/backgrounds/portal_1.jpeg',
            requiredChapter: 15,
            boss: { 
                name: 'Воплощение Искажения', 
                image: 'embodiment_of_distortion.png', 
                hp: 7000, 
                attack: 220, 
                defense: 100, 
                exp: 1200, 
                gold: 1000 
            },
            guard: { 
                name: 'Изначальный Стержень', 
                image: 'the_primordial_core.png', 
                hp: 5000, 
                attack: 180, 
                defense: 90, 
                exp: 700, 
                gold: 600 
            },
            rewards: { gold: 1500, exp: 2200, silver: 3500 },
            trophy: { 
                id: 'portal_7', 
                name: 'Корона Лесного Владыки', 
                bonus: { attack: 150, defense: 150, hp: 150 }, 
                icon: 'assets/all_trophies/portal_trophies/5_crown_of_the_forest_lord.png' 
            }
        }
    ],

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.portal) {
            player.portal = { 
                completed: [], 
                difficulty: {},
                deaths: 0
            };
        }
        console.log('🌀 Порталы инициализированы');
        console.log('📊 Всего порталов:', this.PORTALS.length);
    },

    // ============================================================
    //  МЕТОДЫ
    // ============================================================

    getPortal: function(portalId) {
        return this.PORTALS.find(function(p) { return p.id === portalId; });
    },

    getAllPortals: function() {
        return this.PORTALS;
    },

    isPortalUnlocked: function(portalId) {
        var portal = this.getPortal(portalId);
        if (!portal) return false;
        
        // Проверяем, пройдена ли требуемая глава
        if (typeof Sherwood.Tavern !== 'undefined' && Sherwood.Tavern.getCompletedCount) {
            var completedChapters = Sherwood.Tavern.getCompletedCount();
            return completedChapters >= portal.requiredChapter;
        }
        return true;
    },

    isPortalCompleted: function(portalId) {
        var player = Sherwood.getPlayer();
        if (!player || !player.portal) return false;
        return player.portal.completed.indexOf(portalId) !== -1;
    },

    getPortalStatus: function(portalId) {
        var portal = this.getPortal(portalId);
        if (!portal) return null;
        
        var completed = this.isPortalCompleted(portalId);
        var unlocked = this.isPortalUnlocked(portalId);
        var difficulty = this.getPortalDifficulty(portalId);
        
        return {
            id: portal.id,
            name: portal.name,
            icon: portal.icon,
            unlocked: unlocked,
            completed: completed,
            difficulty: difficulty,
            requiredChapter: portal.requiredChapter
        };
    },

    getPortalDifficulty: function(portalId) {
        var player = Sherwood.getPlayer();
        if (!player || !player.portal) return 0;
        return player.portal.difficulty[portalId] || 0;
    },

    canEnter: function(portalId) {
        var portal = this.getPortal(portalId);
        if (!portal) return { can: false, reason: 'Портал не найден' };
        
        if (!this.isPortalUnlocked(portalId)) {
            return { can: false, reason: 'Портал ещё не открыт. Пройди главу ' + portal.requiredChapter };
        }
        
        if (this._inPortal) {
            return { can: false, reason: 'Ты уже в портале!' };
        }
        
        // Проверка стрел
        var requiredArrows = portalId * 150;
        if (typeof Sherwood.Forge !== 'undefined' && Sherwood.Forge.getArrowCount) {
            var arrowCount = Sherwood.Forge.getArrowCount();
            if (arrowCount < requiredArrows) {
                return { 
                    can: false, 
                    reason: 'Нужно ' + requiredArrows + ' стрел (у тебя ' + arrowCount + ')' 
                };
            }
        }
        
        return { can: true };
    },

    // ============================================================
    //  ВХОД В ПОРТАЛ
    // ============================================================

    enterPortal: function(portalId) {
        var check = this.canEnter(portalId);
        if (!check.can) {
            return { success: false, reason: check.reason };
        }
        
        var portal = this.getPortal(portalId);
        if (!portal) return { success: false, reason: 'Портал не найден' };
        
        // Списываем стрелы
        var requiredArrows = portalId * 150;
        if (typeof Sherwood.Forge !== 'undefined' && Sherwood.Forge.getArrowCount) {
            var bag = Sherwood.Bag;
            var items = bag.getItems();
            var toRemove = requiredArrows;
            for (var i = items.length - 1; i >= 0 && toRemove > 0; i--) {
                if (items[i].id && items[i].id.indexOf('arrow_') === 0) {
                    var qty = items[i].quantity || 1;
                    if (qty <= toRemove) { 
                        toRemove -= qty; 
                        bag.removeItem(i); 
                    } else { 
                        items[i].quantity -= toRemove; 
                        toRemove = 0; 
                    }
                }
            }
            bag._save();
        }
        
        var difficulty = this.getPortalDifficulty(portalId);
        var isHardMode = difficulty > 0 && difficulty % 2 === 0;
        var enemyMult = isHardMode ? 1.5 : 1;
        
        this._currentPortal = JSON.parse(JSON.stringify(portal));
        this._currentEnemies = [];
        
        // Создаём врагов
        var guard = this._currentPortal.guard;
        if (guard) {
            var guardEnemy = {
                name: guard.name,
                image: guard.image,
                hp: Math.floor(guard.hp * enemyMult),
                maxHp: Math.floor(guard.hp * enemyMult),
                attack: Math.floor(guard.attack * enemyMult),
                defense: Math.floor(guard.defense * enemyMult),
                exp: guard.exp,
                gold: guard.gold,
                isBoss: false,
                isGuard: true
            };
            this._currentEnemies.push(guardEnemy);
        }
        
        var boss = this._currentPortal.boss;
        var bossEnemy = {
            name: boss.name,
            image: boss.image,
            hp: Math.floor(boss.hp * enemyMult),
            maxHp: Math.floor(boss.hp * enemyMult),
            attack: Math.floor(boss.attack * enemyMult),
            defense: Math.floor(boss.defense * enemyMult),
            exp: boss.exp,
            gold: boss.gold,
            isBoss: true,
            isGuard: false
        };
        this._currentEnemies.push(bossEnemy);
        
        this._currentLevel = 0;
        this._inPortal = true;
        this._deathCount = 0;
        this._timeRemaining = 10800; // 3 часа
        this._startTimer();
        
        return { 
            success: true, 
            portal: this._currentPortal, 
            enemies: this._currentEnemies, 
            timeLimit: this._timeRemaining,
            hardMode: isHardMode
        };
    },

    _startTimer: function() {
        if (this._timerInterval) clearInterval(this._timerInterval);
        var self = this;
        this._timerInterval = setInterval(function() {
            self._timeRemaining--;
            if (self._timeRemaining <= 0) {
                self._exitPortal(false);
                if (typeof Sherwood.UI !== 'undefined') {
                    Sherwood.UI.showNotification('⏰ Время вышло! Ты покинул портал.');
                }
            }
        }, 1000);
    },

    // ============================================================
    //  БОЙ
    // ============================================================

    getCurrentBattle: function() {
        if (!this._inPortal || !this._currentPortal) return null;
        var enemy = this._currentEnemies[this._currentLevel];
        if (!enemy) return null;
        return {
            portal: this._currentPortal,
            level: this._currentLevel + 1,
            totalLevels: this._currentEnemies.length,
            enemy: enemy,
            timeRemaining: this._timeRemaining,
            deathCount: this._deathCount,
            isBoss: enemy.isBoss || false
        };
    },

    portalAttack: function() {
        if (!this._inPortal) return null;
        var battle = this.getCurrentBattle();
        if (!battle) return null;
        
        var player = Sherwood.getPlayer();
        var enemy = battle.enemy;
        
        // Урон игрока
        var damage = Math.max(1, player.stats.attack - enemy.defense + Math.floor(Math.random() * 20));
        enemy.hp -= damage;
        
        var result = {
            damage: damage,
            enemyName: enemy.name,
            enemyHp: Math.max(0, enemy.hp),
            enemyMaxHp: enemy.maxHp || (enemy.hp + damage),
            enemyDead: enemy.hp <= 0,
            isBoss: enemy.isBoss || false
        };
        
        if (!enemy.maxHp) enemy.maxHp = enemy.hp + damage;
        
        // Проверка смерти врага
        if (enemy.hp <= 0) {
            if (Sherwood.Bestiary && enemy.image) {
                Sherwood.Bestiary.registerKill(enemy.image);
            }
            
            result.exp = enemy.exp;
            result.gold = enemy.gold;
            Sherwood.addExp(enemy.exp);
            Sherwood.addResource('gold', enemy.gold);
            Sherwood.addResource('silver', Math.floor(enemy.gold * 1.5));
            
            this._currentLevel++;
            
            // Проверка завершения портала
            if (this._currentLevel >= this._currentEnemies.length) {
                return this._completePortal();
            }
            
            result.nextEnemy = this._currentEnemies[this._currentLevel];
            return result;
        }
        
        // Атака врага
        var enemyDamage = Math.max(1, enemy.attack - player.stats.defense + Math.floor(Math.random() * 15));
        player.stats.hp = Math.max(0, player.stats.hp - enemyDamage);
        result.enemyDamage = enemyDamage;
        result.playerHp = player.stats.hp;
        
        // Проверка смерти игрока
        if (player.stats.hp <= 0) {
            return this._handleDeath();
        }
        
        return result;
    },

    _handleDeath: function() {
        this._deathCount++;
        var player = Sherwood.getPlayer();
        
        // Слишком много смертей
        if (this._deathCount > 5) {
            this._exitPortal(false);
            return { 
                dead: true, 
                portalFailed: true,
                reason: 'Слишком много смертей. Ты изгнан из портала.'
            };
        }
        
        // Стоимость воскрешения
        var cost;
        if (this._deathCount <= 2) {
            cost = { cost: this._deathCount * 2500, currency: 'silver' };
        } else {
            cost = { cost: 50 + (this._deathCount - 2) * 50, currency: 'gold' };
        }
        
        // Проверка ресурсов
        if (cost.cost > 0 && (player.resources[cost.currency] || 0) < cost.cost) {
            this._exitPortal(false);
            return { 
                dead: true, 
                portalFailed: true,
                reason: 'Недостаточно ' + cost.currency + ' для воскрешения'
            };
        }
        
        // Списываем ресурсы
        if (cost.cost > 0) {
            player.resources[cost.currency] -= cost.cost;
        }
        
        // Воскрешение
        player.stats.hp = player.stats.maxHp;
        Sherwood.saveGame();
        
        return {
            dead: true,
            deathCount: this._deathCount,
            cost: cost,
            resurrected: true,
            playerHp: player.stats.hp
        };
    },

    _completePortal: function() {
        var portal = this._currentPortal;
        var player = Sherwood.getPlayer();
        var timesCompleted = player.portal.completed ? player.portal.completed.filter(function(id) { return id === portal.id; }).length : 0;
        var firstTime = timesCompleted === 0;
        var isHardMode = timesCompleted > 0 && timesCompleted % 2 === 0;
        
        // Множитель награды
        var mult = firstTime ? 1 : (isHardMode ? 0.5 : 0.3);
        var difficultyMult = isHardMode ? 1.5 : 1;
        
        // Награда
        var rewardGold = Math.floor(portal.rewards.gold * mult * difficultyMult);
        var rewardExp = Math.floor(portal.rewards.exp * mult * difficultyMult);
        var rewardSilver = Math.floor(portal.rewards.silver * mult * difficultyMult);
        
        Sherwood.addExp(rewardExp);
        Sherwood.addResource('gold', rewardGold);
        Sherwood.addResource('silver', rewardSilver);
        
        // Отмечаем прохождение
        if (!player.portal.completed) player.portal.completed = [];
        if (player.portal.completed.indexOf(portal.id) === -1) {
            player.portal.completed.push(portal.id);
        }
        
        // Трофей за первое прохождение
        if (firstTime && portal.trophy && typeof Sherwood.addTrophy === 'function') {
            Sherwood.addTrophy(
                portal.trophy.id,
                portal.trophy.name,
                portal.trophy.bonus,
                portal.trophy.icon,
                'portal'
            );
        }
        
        // Увеличиваем сложность
        if (!player.portal.difficulty) player.portal.difficulty = {};
        player.portal.difficulty[portal.id] = (player.portal.difficulty[portal.id] || 0) + 1;
        
        // Останавливаем таймер
        if (this._timerInterval) clearInterval(this._timerInterval);
        this._inPortal = false;
        var completedPortal = this._currentPortal;
        this._currentPortal = null;
        this._currentEnemies = [];
        Sherwood.saveGame();
        
        return {
            portalComplete: true,
            portal: completedPortal,
            rewards: {
                gold: rewardGold,
                exp: rewardExp,
                silver: rewardSilver
            },
            firstTime: firstTime,
            hardMode: isHardMode,
            trophy: firstTime && portal.trophy ? portal.trophy.name : null
        };
    },

    _exitPortal: function(success) {
        if (this._timerInterval) clearInterval(this._timerInterval);
        this._inPortal = false;
        this._currentPortal = null;
        this._currentEnemies = [];
        
        if (!success) {
            var player = Sherwood.getPlayer();
            player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.1));
            Sherwood.saveGame();
        }
    },

    // ============================================================
    //  УТИЛИТЫ
    // ============================================================

    fleePortal: function() {
        this._exitPortal(false);
        return { success: true };
    },

    getTimeRemaining: function() {
        return this._timeRemaining;
    },

    isInPortal: function() {
        return this._inPortal;
    },

    getPortalProgress: function() {
        var player = Sherwood.getPlayer();
        if (!player || !player.portal) return { completed: [], total: this.PORTALS.length };
        
        return {
            completed: player.portal.completed || [],
            total: this.PORTALS.length,
            difficulty: player.portal.difficulty || {}
        };
    },

    // ============================================================
    //  UI — ПОКАЗ ПОРТАЛОВ
    // ============================================================

    showUI: function() {
        if (typeof window.showPortalsScreen === 'function') {
            window.showPortalsScreen();
            return;
        }
        this._renderPortalUI();
    },

    _renderPortalUI: function() {
        var old = document.getElementById('portals-screen');
        if (old) old.remove();
        
        var player = Sherwood.getPlayer();
        var portals = this.PORTALS;
        var completed = player.portal?.completed || [];
        
        var screenHTML = `
        <div id="portals-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/portal.png') center/cover no-repeat;display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
                <button onclick="Sherwood.Portal.closeUI()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                    <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
                </button>
                <span style="color:#e0c080;font-size:1.2em;">🌀 Порталы</span>
                <span style="color:#888;font-size:12px;margin-left:auto;">
                    📊 ${completed.length}/${portals.length}
                </span>
            </div>
            
            <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
                <div style="max-width:600px;margin:0 auto;">
                    ${this._renderPortalList()}
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', screenHTML);
    },

    _renderPortalList: function() {
        var portals = this.PORTALS;
        var html = '';
        
        portals.forEach(function(portal) {
            var status = this.getPortalStatus(portal.id);
            var isCompleted = status.completed;
            var isUnlocked = status.unlocked;
            var difficulty = status.difficulty;
            var isHardMode = difficulty > 0 && difficulty % 2 === 0;
            
            var statusColor = isCompleted ? '#52b788' : (isUnlocked ? '#ffa500' : '#555');
            var statusIcon = isCompleted ? '✅' : (isUnlocked ? '🌀' : '🔒');
            var statusText = isCompleted ? 'Пройден' : (isUnlocked ? 'Доступен' : 'Закрыт');
            
            html += `
            <div style="background:rgba(255,255,255,0.05);padding:12px 16px;border-radius:8px;border-left:4px solid ${statusColor};margin-bottom:10px;${!isUnlocked ? 'opacity:0.5;' : ''}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-weight:bold;color:${statusColor};">
                            ${statusIcon} ${portal.icon} ${portal.id}. ${portal.name}
                        </div>
                        <div style="color:#888;font-size:11px;">
                            Босс: ${portal.boss.name} | Требуется глава ${portal.requiredChapter}
                            ${isHardMode ? ' | ⚔️ Сложный режим' : ''}
                            ${difficulty > 0 ? ' | Пройдено: ' + difficulty : ''}
                        </div>
                        <div style="color:#ffd700;font-size:11px;">
                            Награда: +${portal.rewards.exp} опыта, +${portal.rewards.gold} золота
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:12px;color:${statusColor};">${statusText}</div>
                        ${isUnlocked && !isCompleted ? 
                            `<button onclick="Sherwood.Portal.enterPortalFromUI(${portal.id})" class="btn btn-gold" style="padding:4px 15px;font-size:12px;margin-top:4px;">Войти</button>` : 
                            isCompleted ? 
                            `<span style="color:#52b788;font-size:20px;">🏆</span>` :
                            `<span style="color:#555;font-size:14px;">🔒</span>`
                        }
                    </div>
                </div>
            </div>`;
        }, this);
        
        return html;
    },

    enterPortalFromUI: function(portalId) {
        var result = this.enterPortal(portalId);
        
        if (!result.success) {
            alert('❌ ' + result.reason);
            return;
        }
        
        // Закрываем UI порталов
        this.closeUI();
        
        // Показываем экран битвы
        var battle = this.getCurrentBattle();
        if (battle) {
            this._showBattleUI(battle);
        }
    },

    _showBattleUI: function(battle) {
        // Используем существующую функцию из main.js если есть
        if (typeof window.showPortalBattleUI === 'function') {
            window.showPortalBattleUI(battle);
            return;
        }
        
        // Простой UI боя
        var overlay = document.createElement('div');
        overlay.id = 'portal-battle-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.95);
            z-index: 400;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Courier New', monospace;
            color: #fff;
        `;
        
        var enemy = battle.enemy;
        var portal = battle.portal;
        
        overlay.innerHTML = `
            <div style="background:linear-gradient(180deg,#1a0f08,#2d1a10);border:3px solid ${enemy.isBoss ? '#ff6b35' : '#8B4513'};border-radius:12px;padding:30px;max-width:500px;width:90%;">
                <div style="text-align:center;margin-bottom:15px;">
                    <div style="color:${enemy.isBoss ? '#ff6b35' : '#ffa500'};font-size:20px;font-weight:bold;">
                        ${enemy.isBoss ? '👑 БОСС ПОРТАЛА' : '⚔️ СТРАЖ ПОРТАЛА'}
                    </div>
                    <div style="color:#888;font-size:14px;">${portal.name}</div>
                    <div style="color:#aaa;font-size:12px;">${enemy.isBoss ? 'Финальный бой' : 'Стражи портала'}</div>
                </div>
                
                <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                    <div>
                        <div style="color:#ff6b6b;">👾 ${enemy.name}</div>
                        <div style="font-size:24px;font-weight:bold;">❤️ ${enemy.hp}</div>
                        <div style="width:150px;height:8px;background:#333;border-radius:4px;overflow:hidden;">
                            <div style="width:${(enemy.hp/enemy.maxHp)*100}%;height:100%;background:linear-gradient(90deg,#ff0000,#ff4444);"></div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <div style="color:#4ecdc4;">🧙 Герой</div>
                        <div style="font-size:24px;font-weight:bold;">❤️ ${Sherwood.getPlayer().stats.hp}</div>
                        <div style="width:150px;height:8px;background:#333;border-radius:4px;overflow:hidden;margin-left:auto;">
                            <div style="width:${(Sherwood.getPlayer().stats.hp/Sherwood.getPlayer().stats.maxHp)*100}%;height:100%;background:linear-gradient(90deg,#00ff00,#44ff44);"></div>
                        </div>
                    </div>
                </div>
                
                <div style="display:flex;gap:10px;margin-top:15px;">
                    <button onclick="Sherwood.Portal.attackFromUI()" class="btn btn-danger" style="flex:2;padding:12px;font-size:16px;">⚔️ АТАКОВАТЬ</button>
                    <button onclick="Sherwood.Portal.fleeFromUI()" class="btn" style="flex:1;padding:12px;">🏃 Бежать</button>
                </div>
                
                <div id="portal-battle-log" style="margin-top:10px;padding:8px;background:rgba(0,0,0,0.5);border-radius:4px;height:80px;overflow-y:auto;font-size:12px;color:#888;"></div>
            </div>
        `;
        
        document.body.appendChild(overlay);
    },

    attackFromUI: function() {
        var result = this.portalAttack();
        if (!result) return;
        
        var log = document.getElementById('portal-battle-log');
        if (log) {
            var msg = '';
            if (result.damage) {
                msg += `💢 ${result.crit ? '💥 КРИТ! ' : ''}${result.damage} урона!`;
            }
            if (result.enemyDamage) {
                msg += ` Враг нанёс ${result.enemyDamage} урона.`;
            }
            if (result.enemyDead) {
                msg += ' 🏆 Враг повержен!';
            }
            if (result.nextEnemy) {
                msg += ` ⚔️ Следующий враг: ${result.nextEnemy.name}`;
            }
            if (result.portalComplete) {
                msg += ` 🎉 ПОРТАЛ ПРОЙДЕН! +${result.rewards.exp} опыта, +${result.rewards.gold} золота`;
            }
            if (result.resurrected) {
                msg += ` 💀 Воскрешён! Стоимость: ${result.cost.cost} ${result.cost.currency}`;
            }
            if (result.portalFailed) {
                msg += ` ❌ ${result.reason || 'Портал провален!'}`;
            }
            
            log.innerHTML += `<div>${msg}</div>`;
            log.scrollTop = log.scrollHeight;
        }
        
        // Обновляем UI
        setTimeout(function() {
            var battle = this.getCurrentBattle();
            if (!battle || result.portalComplete || result.portalFailed) {
                // Закрываем окно боя
                var overlay = document.getElementById('portal-battle-overlay');
                if (overlay) overlay.remove();
                this.showUI();
                if (result.portalComplete) {
                    alert('🎉 ' + (result.portal.name) + ' пройден!');
                } else if (result.portalFailed) {
                    alert('❌ ' + (result.reason || 'Портал провален'));
                }
            } else {
                this._showBattleUI(battle);
            }
        }.bind(this), 500);
    },

    fleeFromUI: function() {
        if (confirm('Точно покинуть портал? Прогресс будет потерян.')) {
            this.fleePortal();
            var overlay = document.getElementById('portal-battle-overlay');
            if (overlay) overlay.remove();
            this.showUI();
        }
    },

    closeUI: function() {
        var screen = document.getElementById('portals-screen');
        if (screen) screen.remove();
        var overlay = document.getElementById('portal-battle-overlay');
        if (overlay) overlay.remove();
        
        if (typeof Menu !== 'undefined' && Menu.show) {
            Menu.show();
        }
    }
};

// ---------- ЭКСПОРТ ----------
window.Sherwood = window.Sherwood || {};
window.Sherwood.Portal = Sherwood.Portal;

console.log('🌀 Порталы загружены!');
console.log('📊 Всего порталов:', Sherwood.Portal.PORTALS.length);

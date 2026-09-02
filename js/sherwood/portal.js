/**
 * Sherwood Portal — Порталы (7 уровней)
 * Связаны с сюжетом: открываются по мере прохождения глав
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Portal = {
    _currentPortal: null,
    _currentEnemies: [],
    _currentLevel: 0,
    _inPortal: false,
    _deathCount: 0,
    _timerInterval: null,
    _timeRemaining: 0,

    PORTALS: [
        {
            id: 1, name: 'Портал Нашествия', icon: '🌀', bg: 'assets/backgrounds/portal_1.jpeg',
            requiredChapter: 5,
            boss: { name: 'Жнец-Полководец', image: 'the_reaper_commander.png', hp: 3000, attack: 120, defense: 60, exp: 500, gold: 400 },
            guard: { name: 'Матка Лесных Короедов', image: 'the_hive_mother.png', hp: 2000, attack: 95, defense: 46, exp: 300, gold: 250 },
            rewards: { gold: 500, exp: 800, silver: 1200 }
        },
        {
            id: 2, name: 'Портал Черных Пауков', icon: '🕷️', bg: 'assets/backgrounds/portal_2.png',
            requiredChapter: 7,
            boss: { name: 'Ткачиха Мрака', image: 'the_dark_weaver.png', hp: 3500, attack: 135, defense: 65, exp: 600, gold: 480 },
            guard: { name: 'Проклятый Король Разбойников', image: 'the_cursed_outlaw_king.png', hp: 2300, attack: 105, defense: 50, exp: 350, gold: 300 },
            rewards: { gold: 650, exp: 1000, silver: 1500 }
        },
        {
            id: 3, name: 'Портал Увядания', icon: '🥀', bg: 'assets/backgrounds/portal_3.png',
            requiredChapter: 9,
            boss: { name: 'Истлевший Титан', image: 'the_decayed_titan.png', hp: 4000, attack: 150, defense: 70, exp: 700, gold: 560 },
            guard: { name: 'Древний Хранитель Склепа', image: 'ancient_crypt_warden.png', hp: 2600, attack: 115, defense: 55, exp: 400, gold: 350 },
            rewards: { gold: 800, exp: 1200, silver: 1800 },
            trophy: { id: 'portal_3', name: 'Окровавленный Клык Волка', bonus: { attack: 15, defense: 15, hp: 15 }, icon: 'assets/all_trophies/portal_trophies/1_wolf_fang.png' }
        },
        {
            id: 4, name: 'Портал Цепей', icon: '⛓️', bg: 'assets/backgrounds/portal_1.jpeg',
            requiredChapter: 10,
            boss: { name: 'Вечный Узник', image: 'the_eternal_prisoner.png', hp: 4500, attack: 165, defense: 75, exp: 800, gold: 640 },
            guard: { name: 'Эхо Трех Порталов', image: 'echo_of_the_triumvirate.png', hp: 3000, attack: 130, defense: 60, exp: 450, gold: 400 },
            rewards: { gold: 950, exp: 1400, silver: 2100 },
            trophy: { id: 'portal_4', name: 'Сердце Ненасытного Тритона', bonus: { attack: 30, defense: 30, hp: 30 }, icon: 'assets/all_trophies/portal_trophies/2_heart_of_the_Insatiable_triton.png' }
        },
        {
            id: 5, name: 'Портал Ликантропов', icon: '🐺', bg: 'assets/backgrounds/portal_2.png',
            requiredChapter: 12,
            boss: { name: 'Кровавый Вожак', image: 'the_blood_alpha.png', hp: 5000, attack: 180, defense: 80, exp: 900, gold: 720 },
            guard: { name: 'Палач Священного Древа', image: 'sacred_tree_executioner.png', hp: 3500, attack: 145, defense: 68, exp: 500, gold: 450 },
            rewards: { gold: 1100, exp: 1600, silver: 2400 },
            trophy: { id: 'portal_5', name: 'Изумрудный Осколок Исполина', bonus: { attack: 50, defense: 50, hp: 50 }, icon: 'assets/all_trophies/portal_trophies/3_emerald_shard_of_the_giant.png' }
        },
        {
            id: 6, name: 'Портал Скорпиона', icon: '🦂', bg: 'assets/backgrounds/portal_3.png',
            requiredChapter: 14,
            boss: { name: 'Базальтовый Жнец', image: 'the_basalt_reaper.png', hp: 5500, attack: 195, defense: 85, exp: 1000, gold: 800 },
            guard: { name: 'Шервудское Отродье', image: 'sherwood_abomination.png', hp: 4500, attack: 170, defense: 80, exp: 600, gold: 500 },
            rewards: { gold: 1250, exp: 1800, silver: 2700 },
            trophy: { id: 'portal_6', name: 'Проклятая Эмблема Склепа', bonus: { attack: 80, defense: 80, hp: 80 }, icon: 'assets/all_trophies/portal_trophies/4_cursed_emblem_of_the_crypt.png' }
        },
        {
            id: 7, name: 'Портал Искажения', icon: '👁️', bg: 'assets/backgrounds/portal_1.jpeg',
            requiredChapter: 15,
            boss: { name: 'Воплощение Искажения', image: 'embodiment_of_distortion.png', hp: 7000, attack: 220, defense: 100, exp: 1200, gold: 1000 },
            guard: { name: 'Изначальный Стержень', image: 'the_primordial_core.png', hp: 5000, attack: 180, defense: 90, exp: 700, gold: 600 },
            rewards: { gold: 1500, exp: 2200, silver: 3500 },
            trophy: { id: 'portal_7', name: 'Корона Лесного Владыки', bonus: { attack: 150, defense: 150, hp: 150 }, icon: 'assets/all_trophies/portal_trophies/5_crown_of_the_forest_lord.png' }
        }
    ],

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.portal) player.portal = { completed: [], difficulty: {}, deaths: 0 };
        console.log('🌀 Порталы инициализированы');
    },

    getPortal: function(id) {
        for (var i = 0; i < this.PORTALS.length; i++) {
            if (this.PORTALS[i].id === id) return this.PORTALS[i];
        }
        return null;
    },

    getAllPortals: function() { return this.PORTALS; },

    isPortalUnlocked: function(id) {
        var portal = this.getPortal(id);
        if (!portal) return false;
        if (typeof Sherwood.Tavern !== 'undefined' && Sherwood.Tavern.getCompletedCount) {
            return Sherwood.Tavern.getCompletedCount() >= portal.requiredChapter;
        }
        return true;
    },

    isPortalCompleted: function(id) {
        var player = Sherwood.getPlayer();
        if (!player || !player.portal) return false;
        return player.portal.completed.indexOf(id) !== -1;
    },

    getPortalStatus: function(id) {
        var portal = this.getPortal(id);
        if (!portal) return null;
        return {
            id: portal.id, name: portal.name, icon: portal.icon,
            unlocked: this.isPortalUnlocked(id),
            completed: this.isPortalCompleted(id),
            difficulty: this.getPortalDifficulty(id),
            requiredChapter: portal.requiredChapter
        };
    },

    getPortalDifficulty: function(id) {
        var player = Sherwood.getPlayer();
        if (!player || !player.portal) return 0;
        return player.portal.difficulty[id] || 0;
    },

    canEnter: function(id) {
        var portal = this.getPortal(id);
        if (!portal) return { can: false, reason: 'Портал не найден' };
        if (!this.isPortalUnlocked(id)) {
            return { can: false, reason: 'Портал ещё не открыт. Пройди главу ' + portal.requiredChapter };
        }
        if (this._inPortal) return { can: false, reason: 'Ты уже в портале!' };
        var requiredArrows = id * 150;
        var arrowCount = 0;
        if (typeof Sherwood.Forge !== 'undefined' && Sherwood.Forge.getArrowCount) {
            arrowCount = Sherwood.Forge.getArrowCount();
        }
        if (arrowCount < requiredArrows) {
            return { can: false, reason: 'Нужно ' + requiredArrows + ' стрел (у тебя ' + arrowCount + ')' };
        }
        return { can: true };
    },

    enterPortal: function(id) {
        var check = this.canEnter(id);
        if (!check.can) return { success: false, reason: check.reason };

        var portal = this.getPortal(id);
        if (!portal) return { success: false, reason: 'Портал не найден' };

        // Списываем стрелы
        var requiredArrows = id * 150;
        if (typeof Sherwood.Forge !== 'undefined' && Sherwood.Forge.getArrowCount) {
            var bag = Sherwood.Bag;
            var items = bag.getItems();
            var toRemove = requiredArrows;
            for (var i = items.length - 1; i >= 0 && toRemove > 0; i--) {
                if (items[i].id && items[i].id.indexOf('arrow_') === 0) {
                    var qty = items[i].quantity || 1;
                    if (qty <= toRemove) { toRemove -= qty; bag.removeItem(i); }
                    else { items[i].quantity -= toRemove; toRemove = 0; }
                }
            }
            bag._save();
        }

        var difficulty = this.getPortalDifficulty(id);
        var isHardMode = difficulty > 0 && difficulty % 2 === 0;
        var enemyMult = isHardMode ? 1.5 : 1;

        this._currentPortal = JSON.parse(JSON.stringify(portal));
        this._currentEnemies = [];

        var guard = this._currentPortal.guard;
        if (guard) {
            this._currentEnemies.push({
                name: guard.name, image: guard.image,
                hp: Math.floor(guard.hp * enemyMult), maxHp: Math.floor(guard.hp * enemyMult),
                attack: Math.floor(guard.attack * enemyMult), defense: Math.floor(guard.defense * enemyMult),
                exp: guard.exp, gold: guard.gold, isBoss: false, isGuard: true
            });
        }

        var boss = this._currentPortal.boss;
        this._currentEnemies.push({
            name: boss.name, image: boss.image,
            hp: Math.floor(boss.hp * enemyMult), maxHp: Math.floor(boss.hp * enemyMult),
            attack: Math.floor(boss.attack * enemyMult), defense: Math.floor(boss.defense * enemyMult),
            exp: boss.exp, gold: boss.gold, isBoss: true, isGuard: false
        });

        this._currentLevel = 0;
        this._inPortal = true;
        this._deathCount = 0;
        this._timeRemaining = 10800;
        this._startTimer();

        return { success: true, portal: this._currentPortal, enemies: this._currentEnemies, timeLimit: this._timeRemaining, hardMode: isHardMode };
    },

    _startTimer: function() {
        if (this._timerInterval) clearInterval(this._timerInterval);
        var self = this;
        this._timerInterval = setInterval(function() {
            self._timeRemaining--;
            if (self._timeRemaining <= 0) {
                self._exitPortal(false);
                UI._showToast('⏰ Время вышло! Ты покинул портал.');
            }
        }, 1000);
    },

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

        if (enemy.hp <= 0) {
            if (Sherwood.Bestiary && enemy.image) Sherwood.Bestiary.registerKill(enemy.image);
            result.exp = enemy.exp;
            result.gold = enemy.gold;
            Sherwood.addExp(enemy.exp);
            Sherwood.addResource('gold', enemy.gold);
            Sherwood.addResource('silver', Math.floor(enemy.gold * 1.5));
            this._currentLevel++;

            if (this._currentLevel >= this._currentEnemies.length) {
                return this._completePortal();
            }
            result.nextEnemy = this._currentEnemies[this._currentLevel];
            return result;
        }

        var enemyDamage = Math.max(1, enemy.attack - player.stats.defense + Math.floor(Math.random() * 15));
        player.stats.hp = Math.max(0, player.stats.hp - enemyDamage);
        result.enemyDamage = enemyDamage;
        result.playerHp = player.stats.hp;

        if (player.stats.hp <= 0) {
            return this._handleDeath();
        }

        return result;
    },

    _handleDeath: function() {
        this._deathCount++;
        var player = Sherwood.getPlayer();

        if (this._deathCount > 5) {
            this._exitPortal(false);
            return { dead: true, portalFailed: true, reason: 'Слишком много смертей. Ты изгнан из портала.' };
        }

        var cost;
        if (this._deathCount <= 2) {
            cost = { cost: this._deathCount * 2500, currency: 'silver' };
        } else {
            cost = { cost: 50 + (this._deathCount - 2) * 50, currency: 'gold' };
        }

        if (cost.cost > 0 && (player.resources[cost.currency] || 0) < cost.cost) {
            this._exitPortal(false);
            return { dead: true, portalFailed: true, reason: 'Недостаточно ' + cost.currency + ' для воскрешения' };
        }

        if (cost.cost > 0) player.resources[cost.currency] -= cost.cost;
        player.stats.hp = player.stats.maxHp;
        Sherwood.saveGame();

        return { dead: true, deathCount: this._deathCount, cost: cost, resurrected: true, playerHp: player.stats.hp };
    },

    _completePortal: function() {
        var portal = this._currentPortal;
        var player = Sherwood.getPlayer();
        var timesCompleted = player.portal.completed ? player.portal.completed.filter(function(id) { return id === portal.id; }).length : 0;
        var firstTime = timesCompleted === 0;
        var isHardMode = timesCompleted > 0 && timesCompleted % 2 === 0;

        var mult = firstTime ? 1 : (isHardMode ? 0.5 : 0.3);
        var difficultyMult = isHardMode ? 1.5 : 1;

        var rewardGold = Math.floor(portal.rewards.gold * mult * difficultyMult);
        var rewardExp = Math.floor(portal.rewards.exp * mult * difficultyMult);
        var rewardSilver = Math.floor(portal.rewards.silver * mult * difficultyMult);

        Sherwood.addExp(rewardExp);
        Sherwood.addResource('gold', rewardGold);
        Sherwood.addResource('silver', rewardSilver);

        if (!player.portal.completed) player.portal.completed = [];
        if (player.portal.completed.indexOf(portal.id) === -1) {
            player.portal.completed.push(portal.id);
        }

        if (firstTime && portal.trophy && typeof Sherwood.addTrophy === 'function') {
            Sherwood.addTrophy(portal.trophy.id, portal.trophy.name, portal.trophy.bonus, portal.trophy.icon, 'portal');
        }

        if (!player.portal.difficulty) player.portal.difficulty = {};
        player.portal.difficulty[portal.id] = (player.portal.difficulty[portal.id] || 0) + 1;

        if (this._timerInterval) clearInterval(this._timerInterval);
        this._inPortal = false;
        var completedPortal = this._currentPortal;
        this._currentPortal = null;
        this._currentEnemies = [];
        Sherwood.saveGame();

        return {
            portalComplete: true,
            portal: completedPortal,
            rewards: { gold: rewardGold, exp: rewardExp, silver: rewardSilver },
            firstTime: firstTime, hardMode: isHardMode,
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

    fleePortal: function() { this._exitPortal(false); return { success: true }; },
    getTimeRemaining: function() { return this._timeRemaining; },
    isInPortal: function() { return this._inPortal; },

 // ========== UI ==========

showUI: function() {
    if (typeof UI === 'undefined') {
        if (typeof showGenericScreen === 'function') {
            showGenericScreen('Порталы', '🌀');
        }
        return;
    }
    UI._playSound('click');
    if (this.isInPortal()) { this._showPortalBattle(); return; }

    var allPortals = this.getAllPortals();
    var arrowCount = (typeof Sherwood.Forge !== 'undefined' && Sherwood.Forge.getArrowCount) ? Sherwood.Forge.getArrowCount() : 0;
    var iconMap = { 1: 'invasion_portal.png', 2: 'skull_spider_portal.png', 3: 'portal_of_withering.png', 4: 'portal_of_chains.png', 5: 'lycanthrope_portal.png', 6: 'scorpio_portal.png', 7: 'portal_of_distortion.png' };

    var h = '<div id="portal-carousel" style="position:relative;height:500px;overflow:hidden;touch-action:pan-y;margin:0 -12px;width:calc(100% + 24px);">';

    for (var i = 0; i < allPortals.length; i++) {
        var portal = allPortals[i];
        var iconFile = iconMap[portal.id] || 'invasion_portal.png';
        var requiredArrows = portal.id * 150;
        var canEnter = arrowCount >= requiredArrows;
        var isCompleted = this.isPortalCompleted(portal.id);
        var isUnlocked = this.isPortalUnlocked(portal.id);
        var display = (i === 0) ? 'flex' : 'none';

        // ИСПРАВЛЕНИЕ: Центрируем контент, используем плашку из профиля
        h += '<div class="portal-slide" data-index="' + i + '" style="display:' + display + ';flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:100%;padding:20px;">';
        
        // 1. ИКОНКА (сверху, с большим отступом)
        h += '<img src="assets/portal_beasts/visual_portals/' + iconFile + '" style="width:150px;height:150px;object-fit:contain;margin:0 auto 30px;display:block;">';
        
        // 2. ПЛАШКА С НАЗВАНИЕМ (точно такая же, как в профиле!)
        h += '<div style="background:url(\'assets/assets2/game_details/sections_menu.png\') center/100% 100% no-repeat;padding:10px 45px;color:#ffa500;font-size:1.1em;font-weight:bold;text-shadow:0 2px 4px #000;display:inline-block;line-height:1.2;margin-bottom:15px;">' + portal.name + '</div>';
        
        // 3. Остальное
        h += '<div style="color:#aaa;font-size:0.7em;margin-bottom:10px;">Стрел: ' + arrowCount + ' / ' + requiredArrows + '</div>';

        if (isCompleted) {
            h += '<div style="color:#52b788;font-weight:bold;margin-bottom:10px;">✅ Пройден</div>';
        } else if (isUnlocked && canEnter) {
            h += '<button onclick="Sherwood.Portal._enterPortal(' + portal.id + ')" style="background:#c9a040;border:none;border-radius:8px;padding:10px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">⚔️ В бой</button>';
        } else if (isUnlocked && !canEnter) {
            h += '<div style="color:#ff6b6b;font-size:0.8em;">❌ Недостаточно стрел</div>';
        } else {
            h += '<div style="color:#555;font-size:0.8em;">🔒 Закрыт (Глава ' + portal.requiredChapter + ')</div>';
        }

        h += '</div>';
    }

    h += '</div>';

    UI._openScreen('🌀 Порталы', 'portal', h);

    // Свайпы и колесо
    var carousel = document.getElementById('portal-carousel');
    if (carousel) {
        var startY = 0;
        var currentIndex = 0;

        carousel.addEventListener('wheel', function(e) {
            e.preventDefault();
            if (Math.abs(e.deltaY) < 20) return;
            var slides = carousel.querySelectorAll('.portal-slide');
            slides[currentIndex].style.display = 'none';
            if (e.deltaY > 0) { currentIndex = (currentIndex + 1) % slides.length; }
            else { currentIndex = (currentIndex - 1 + slides.length) % slides.length; }
            slides[currentIndex].style.display = 'flex';
        }, { passive: false });

        carousel.addEventListener('touchstart', function(e) { startY = e.touches[0].clientY; }, { passive: true });
        carousel.addEventListener('touchend', function(e) {
            var delta = e.changedTouches[0].clientY - startY;
            if (Math.abs(delta) < 50) return;
            var slides = carousel.querySelectorAll('.portal-slide');
            slides[currentIndex].style.display = 'none';
            if (delta < 0) { currentIndex = (currentIndex + 1) % slides.length; }
            else { currentIndex = (currentIndex - 1 + slides.length) % slides.length; }
            slides[currentIndex].style.display = 'flex';
        }, { passive: true });
    }
},

    // Свайпы и колесо
    var carousel = document.getElementById('portal-carousel');
    if (carousel) {
        var startY = 0;
        var currentIndex = 0;

        carousel.addEventListener('wheel', function(e) {
            e.preventDefault();
            if (Math.abs(e.deltaY) < 20) return;
            var slides = carousel.querySelectorAll('.portal-slide');
            slides[currentIndex].style.display = 'none';
            if (e.deltaY > 0) { currentIndex = (currentIndex + 1) % slides.length; }
            else { currentIndex = (currentIndex - 1 + slides.length) % slides.length; }
            slides[currentIndex].style.display = 'flex';
        }, { passive: false });

        carousel.addEventListener('touchstart', function(e) { startY = e.touches[0].clientY; }, { passive: true });
        carousel.addEventListener('touchend', function(e) {
            var delta = e.changedTouches[0].clientY - startY;
            if (Math.abs(delta) < 50) return;
            var slides = carousel.querySelectorAll('.portal-slide');
            slides[currentIndex].style.display = 'none';
            if (delta < 0) { currentIndex = (currentIndex + 1) % slides.length; }
            else { currentIndex = (currentIndex - 1 + slides.length) % slides.length; }
            slides[currentIndex].style.display = 'flex';
        }, { passive: true });
    }
},

    _enterPortal: function(id) {
        var r = this.enterPortal(id);
        if (!r.success) { UI._showToast(r.reason || 'Не удалось войти в портал'); return; }
        UI._stopMusic();
        UI._playSound('trap');
        this._showPortalBattle();
    },

    _showPortalBattle: function() {
        var battle = this.getCurrentBattle();
        if (!battle) { this.showUI(); return; }
        var enemy = battle.enemy;
        if (!enemy.maxHp) enemy.maxHp = enemy.hp;
        UI._showBattleScreen({
            name: enemy.name,
            image: 'assets/portal_beasts/' + (enemy.image || 'plague_crow.png'),
            hp: enemy.hp,
            maxHp: enemy.maxHp,
            attack: enemy.attack,
            defense: enemy.defense
        }, 'portal', battle.portal.name + ' - Волна ' + battle.level + '/' + battle.totalLevels, '', 'Sherwood.Portal._portalAttack()', 'Sherwood.Portal._portalFlee()', battle.portal.bg || 'portal');
    },

    _portalAttack: function() {
        UI._playHitSounds();
        var r = this.portalAttack();
        if (!r) return;

        if (r.portalComplete) {
            UI._playSound('victory');
            UI._stopMusic();
            var scrolls = Math.random() < 0.3 ? 1 + Math.floor(Math.random() * 3) : 0;
            if (scrolls) Sherwood.addResource('scrolls', scrolls);
            UI._pendingRewards = { exp: r.rewards.exp, gold: r.rewards.gold, silver: r.rewards.silver, scrolls: scrolls };
            UI._afterRewardAction = function() { UI._playMusic('main_theme'); Sherwood.Portal.showUI(); };
            UI._showVictoryScreen(UI._pendingRewards);
            return;
        }

        if (r.portalFailed) {
            UI._playSound('defeat');
            UI._stopMusic();
            UI._pendingRewards = { exp: 10, silver: 50 };
            UI._afterRewardAction = function() { UI._playMusic('main_theme'); Sherwood.Portal.showUI(); };
            UI._showDefeatScreen(UI._pendingRewards);
            return;
        }

        if (r.dead && r.resurrected) {
            UI._showDialog('Вы погибли! Воскрешение за ' + r.cost.cost + ' ' + (r.cost.currency === 'gold' ? 'золота' : 'серебра'), '#ff9800');
            UI.updateDisplay();
            var self = this;
            setTimeout(function() { self._showPortalBattle(); }, 1500);
            return;
        }

        if (r.enemyDead) {
            UI._showDialog(r.enemyName + ' повержен!', '#4caf50');
            UI.updateDisplay();
            var self = this;
            setTimeout(function() { self._showPortalBattle(); }, 1200);
            return;
        }

        UI._showDialog('Вы нанесли ' + r.damage + ' урона', '#fff');
        UI._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        if (r.enemyDamage) {
            var self = this;
            setTimeout(function() {
                UI._showDialog(r.enemyName + ' нанёс ' + r.enemyDamage + ' урона', '#f44336');
                UI.updateDisplay();
            }, 700);
        }
        var self = this;
        setTimeout(function() { self._showPortalBattle(); }, 1200);
    },

    _portalFlee: function() {
        UI._stopMusic();
        this.fleePortal();
        UI._playMusic('main_theme');
        this.showUI();
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Portal = Sherwood.Portal;

console.log('🌀 Порталы загружены!');

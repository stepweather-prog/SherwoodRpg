// ============================================================
//  js/sherwood/ui_screens.js — ПОЛНОСТЬЮ РАБОЧИЙ UI
//  Всё взято из старого SherwoodUI
// ============================================================

if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

if (typeof UI === 'undefined') { var UI = {}; }

// Расширяем существующий UI из ui_common.js
Object.assign(UI, {
    _bg: {
        main: 'assets/backgrounds/homepage_screen.jpeg', bag: 'assets/backgrounds/bag.jpeg', profile: 'assets/backgrounds/character_page.jpeg',
        bestiary: 'assets/backgrounds/character_page.jpeg', quests: 'assets/backgrounds/skill_page.jpeg', training: 'assets/backgrounds/training.jpeg',
        forge: 'assets/backgrounds/forge.jpeg', tavern: 'assets/backgrounds/section_tavern.png', market: 'assets/backgrounds/market.jpeg',
        arena: 'assets/backgrounds/arena.jpeg', raid: 'assets/backgrounds/background_raid.png', settings: 'assets/backgrounds/settings_page.jpeg',
        daily: 'assets/backgrounds/tasks.jpeg', portal: 'assets/backgrounds/portal_1.jpeg', chat: 'assets/backgrounds/chat_background.png',
        dungeon_select: 'assets/backgrounds/underground_1_floor_1.jpg', dungeon_forest: 'assets/backgrounds/underground_1_floor_1.jpg',
        dungeon_swamp: 'assets/backgrounds/underground_2_floor_1.jpeg', dungeon_cave: 'assets/backgrounds/underground_3_floor_1.jpeg',
        dungeon_fight: 'assets/backgrounds/underground_1_floor_1.jpg', portal_3: 'assets/backgrounds/portal_3.png',
        hearth: 'assets/backgrounds/background_hearth.jpeg', wallet: 'assets/interface/wallet_visual.png'
    },
    _statIcons: { attack: 'assets/interface/icon_power.png', defense: 'assets/interface/icon_defense.png', hp: 'assets/interface/icon_health.png' },
    _sounds: {}, _currentMusic: null, _currentMusicKey: null, _soundEnabled: true, _musicEnabled: true,
    _mainThemeWasPlaying: false, _mainThemeKey: null, _mainThemeTime: 0,
    _audioFiles: {
        'main_theme': 'assets/assets2/tune/main_theme.ogg',
        'main_theme_2': 'assets/assets2/tune/main_theme_2.ogg',
        'dungeon_1': 'assets/assets2/tune/dungeon_1.ogg',
        'dungeon_2': 'assets/assets2/tune/dungeon_2.ogg',
        'dungeon_3': 'assets/assets2/tune/dungeon_3.ogg',
        'click': 'assets/assets2/tune/click.wav',
        'hit': 'assets/assets2/tune/hit.wav',
        'chest_open': 'assets/assets2/tune/chest_open.wav',
        'altar': 'assets/assets2/tune/altar.wav',
        'cauldron': 'assets/assets2/tune/cauldron.wav',
        'potion': 'assets/assets2/tune/potion.wav',
        'loot_fly': 'assets/assets2/tune/loot_fly.wav',
        'trap': 'assets/assets2/tune/trap.wav',
        'tile_open': 'assets/assets2/tune/tile_open.wav',
        'steps': 'assets/assets2/tune/steps.wav',
        'bag_drop': 'assets/assets2/tune/bag_drop.wav',
        'defeat': 'assets/assets2/tune/defeat.wav',
        'levelup': 'assets/assets2/tune/levelup.wav',
        'forge': 'assets/assets2/tune/forge.wav',
        'heal': 'assets/assets2/tune/heal.wav',
        'victory': 'assets/assets2/tune/victory.wav'
    },
    _previousScreen: null, _dailyTab: 1, _pendingRewards: null, _afterRewardAction: null,
    _screenLayer: null, _ticketDisplayInterval: null, _bestiaryTab: 0,
    _arenaDefeatShown: false, _arenaVictoryShown: false,
    _currentArenaOpponents: null, _currentArenaOpponentIndex: 0,
    _arenaCooldownInterval: null,

    init: function() {
    this._screenLayer = document.createElement('div');
    this._screenLayer.id = 'ui-screen-layer';
    this._screenLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:40;display:none;background:#000;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;';
    
    var gameZone = document.getElementById('gameZone');
    if (gameZone) {
        gameZone.appendChild(this._screenLayer);
    } else {
        document.body.appendChild(this._screenLayer);
    }
        try { this._initSounds(); } catch(e) {}
        try { this._loadAudioSettings(); } catch(e) {}
        try { this.updateDisplay(); } catch(e) {}
        if (typeof Sherwood !== 'undefined') {
            try { Sherwood.on('RESOURCE_CHANGED', function() { UI.updateDisplay(); }); } catch(e) {}
            try { Sherwood.on('PLAYER_LEVEL_UP', function() { UI._playSound('levelup'); UI.updateDisplay(); }); } catch(e) {}
        }
        console.log('🖥️ UI экраны загружены!');
    },

    _initSounds: function() {
        for (var k in this._audioFiles) {
            try {
                var a = new Audio(this._audioFiles[k]);
                a.preload = 'auto';
                a.volume = 0.5;
                this._sounds[k] = a;
            } catch(e) {}
        }
    },

    _playSound: function(k) {
        try { if (!this._soundEnabled) return; var s = this._sounds[k]; if (s) { s.currentTime = 0; s.play().catch(function() {}); } } catch(e) {}
    },

    _playMusic: function(k) {
        try {
            if (!this._musicEnabled) return;
            if (this._currentMusicKey === k && this._currentMusic && !this._currentMusic.paused) return;
            this._stopMusic();
            var m = this._sounds[k];
            if (m) {
                m.volume = (k.indexOf('dungeon_') === 0) ? 0.4 : 0.5;
                m.currentTime = 0;
                m.play().catch(function() {});
                this._currentMusic = m;
                this._currentMusicKey = k;
                if (k === 'main_theme') { m.loop = false; var self = this; m.onended = function() { self._playMusic('main_theme_2'); }; }
                if (k === 'main_theme_2') { m.loop = false; var self = this; m.onended = function() { self._playMusic('main_theme'); }; }
            }
        } catch(e) {}
    },

    _stopMusic: function() { try { if (this._currentMusic) { this._currentMusic.pause(); this._currentMusic.currentTime = 0; this._currentMusic = null; this._currentMusicKey = null; } } catch(e) {} },
    _pauseMusic: function() { try { if (this._currentMusic) { this._currentMusic.pause(); } } catch(e) {} },
    _resumeMusic: function() { try { if (this._currentMusic && this._musicEnabled) { this._currentMusic.play().catch(function() {}); } } catch(e) {} },
    _saveAudioSettings: function() { try { localStorage.setItem('sherwood_audio', JSON.stringify({ sound: this._soundEnabled, music: this._musicEnabled })); } catch(e) {} },
    _loadAudioSettings: function() { try { var s = localStorage.getItem('sherwood_audio'); if (s) { var d = JSON.parse(s); this._soundEnabled = d.sound !== false; this._musicEnabled = d.music !== false; } } catch(e) {} },
    _toggleSound: function(en) { this._soundEnabled = en; this._saveAudioSettings(); if (!en) { for (var k in this._sounds) { try { this._sounds[k].pause(); this._sounds[k].currentTime = 0; } catch(e) {} } } this.settings(); },
    _toggleMusic: function(en) { this._musicEnabled = en; this._saveAudioSettings(); if (!en) { this._stopMusic(); } else { this._playMusic('main_theme'); } this.settings(); },

    updateDisplay: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        try { var el = document.getElementById('gold-display'); if (el) el.textContent = p.resources.gold || 0; } catch(e) {}
        try { var el = document.getElementById('silver-display'); if (el) el.textContent = p.resources.silver || 0; } catch(e) {}
        try { var el = document.getElementById('level-display'); if (el) el.textContent = p.level || 1; } catch(e) {}
        try { var expEl = document.getElementById('exp-display'), expMaxEl = document.getElementById('exp-max-display'), expFill = document.getElementById('exp-fill-bar'); var pct = p.expToLevel > 0 ? Math.round((p.exp / p.expToLevel) * 100) : 0; if (expEl) expEl.textContent = pct + '%'; if (expMaxEl) expMaxEl.textContent = p.expToLevel || 500; if (expFill) expFill.style.width = pct + '%'; } catch(e) {}
        try { var stats = document.querySelectorAll('.stat-value'); if (stats.length >= 3) { stats[0].textContent = p.stats.attack; stats[1].textContent = p.stats.defense; stats[2].textContent = p.stats.hp; } } catch(e) {}
    },

    _showPlaceholder: function(title, bgKey, backAction) {
        this._playSound('click');
        this._openScreen(title, bgKey, '<div style="text-align:center;padding:40px 0;"><div style="font-size:3em;margin-bottom:16px;">🚧</div><div style="font-size:1.2em;color:#e0c080;margin-bottom:8px;">' + title + '</div><div style="font-size:0.7em;color:#888;">В разработке</div></div>', backAction);
    },

    loadHome: function() {
    if (this._screenLayer) {
        this._screenLayer.style.display = 'none';
        this._screenLayer.innerHTML = '';
    }
    if (this._ticketDisplayInterval) {
        clearInterval(this._ticketDisplayInterval);
        this._ticketDisplayInterval = null;
    }
    try { this.updateDisplay(); } catch(e) {}
    if (typeof showHomeScreen === 'function') {
        showHomeScreen();
    }
},

    _showToast: function(msg) {
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999;background:rgba(0,0,0,0.9);color:#f44336;padding:12px 24px;border-radius:8px;border:1px solid #f44336;font-size:0.9em;font-family:"Georgia",serif;pointer-events:none;';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 2000);
    },

    _showVictoryScreen: function(rewards) {
        var h = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:url(\'assets/interface/vertical_slab_victory.png\') center/100% 100% no-repeat;z-index:100;">';
        h += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">';
        var rewardItems = [];
        if (rewards.cupEarned) { rewardItems.push({ icon: 'assets/interface/resource_cup_for_completed_tasks.png', quantity: 1, label: 'Кубок' }); }
        if (rewards.exp) { rewardItems.push({ icon: 'assets/interface/icon_health.png', quantity: rewards.exp, label: 'Опыт' }); }
        if (rewards.gold) { rewardItems.push({ icon: 'assets/interface/resource_gold.png', quantity: rewards.gold, label: 'Золото' }); }
        if (rewards.silver) { rewardItems.push({ icon: 'assets/interface/resource_silver.png', quantity: rewards.silver, label: 'Серебро' }); }
        if (rewards.scrolls) { rewardItems.push({ icon: 'assets/interface/resource_appearance_crafting_tablet.png', quantity: rewards.scrolls, label: 'Скрижали' }); }
        if (rewards.items && rewards.items.length > 0) {
            var lootMap = {};
            for (var i = 0; i < rewards.items.length; i++) {
                var item = rewards.items[i];
                var key = item.icon + '|' + item.name;
                if (!lootMap[key]) lootMap[key] = { icon: item.icon, name: item.name, quantity: 0 };
                lootMap[key].quantity += item.quantity || 1;
            }
            var lootKeys = Object.keys(lootMap);
            for (var k = 0; k < lootKeys.length; k++) {
                var li = lootMap[lootKeys[k]];
                rewardItems.push({ icon: li.icon, quantity: li.quantity, label: li.name });
            }
        }
        if (rewardItems.length > 0) {
            h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:250px;margin:0 auto;">';
            for (var ri = 0; ri < rewardItems.length; ri++) {
                var rw = rewardItems[ri];
                h += '<div style="text-align:center;">';
                h += '<div style="color:#fff;font-size:0.8em;font-weight:bold;margin-bottom:2px;text-shadow:0 0 4px #000;">' + rw.quantity + '</div>';
                h += '<div style="background:url(\'assets/interface/wallet_cell.png\') center/contain no-repeat;background-size:cover;width:70px;height:70px;margin:0 auto;display:flex;align-items:center;justify-content:center;">';
                h += '<img src="' + rw.icon + '" style="width:44px;height:44px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                h += '</div>';
                h += '<div style="color:#ddd;font-size:0.6em;margin-top:2px;text-shadow:0 0 4px #000;">' + rw.label + '</div>';
                h += '</div>';
            }
            h += '</div>';
        }
        h += '</div>';
        h += '<button onclick="UI._claimReward()" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:10px;padding:12px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:1.1em;z-index:2;">Забрать</button>';
        h += '</div>';
        if (this._screenLayer) { this._screenLayer.innerHTML = h; this._screenLayer.style.display = 'block'; }
    },

    _showDefeatScreen: function(rewards) {
        var h = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:url(\'assets/interface/vertical_slab_defeat.png\') center/100% 100% no-repeat;z-index:100;">';
        h += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">';
        var rewardItems = [];
        if (rewards.exp) { rewardItems.push({ icon: 'assets/interface/icon_health.png', quantity: rewards.exp, label: 'Опыт' }); }
        if (rewards.gold) { rewardItems.push({ icon: 'assets/interface/resource_gold.png', quantity: rewards.gold, label: 'Золото' }); }
        if (rewards.silver) { rewardItems.push({ icon: 'assets/interface/resource_silver.png', quantity: rewards.silver, label: 'Серебро' }); }
        if (rewards.scrolls) { rewardItems.push({ icon: 'assets/interface/resource_appearance_crafting_tablet.png', quantity: rewards.scrolls, label: 'Скрижали' }); }
        if (rewards.items && rewards.items.length > 0) {
            var lootMap = {};
            for (var i = 0; i < rewards.items.length; i++) {
                var item = rewards.items[i];
                var key = item.icon + '|' + item.name;
                if (!lootMap[key]) lootMap[key] = { icon: item.icon, name: item.name, quantity: 0 };
                lootMap[key].quantity += item.quantity || 1;
            }
            var lootKeys = Object.keys(lootMap);
            for (var k = 0; k < lootKeys.length; k++) {
                var li = lootMap[lootKeys[k]];
                rewardItems.push({ icon: li.icon, quantity: li.quantity, label: li.name });
            }
        }
        if (rewardItems.length > 0) {
            h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:250px;margin:0 auto;">';
            for (var ri = 0; ri < rewardItems.length; ri++) {
                var rw = rewardItems[ri];
                h += '<div style="text-align:center;">';
                h += '<div style="color:#fff;font-size:0.8em;font-weight:bold;margin-bottom:2px;text-shadow:0 0 4px #000;">' + rw.quantity + '</div>';
                h += '<div style="background:url(\'assets/interface/wallet_cell.png\') center/contain no-repeat;background-size:cover;width:70px;height:70px;margin:0 auto;display:flex;align-items:center;justify-content:center;">';
                h += '<img src="' + rw.icon + '" style="width:44px;height:44px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                h += '</div>';
                h += '<div style="color:#ddd;font-size:0.6em;margin-top:2px;text-shadow:0 0 4px #000;">' + rw.label + '</div>';
                h += '</div>';
            }
            h += '</div>';
        }
        h += '</div>';
        h += '<button onclick="UI._claimReward()" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:10px;padding:12px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:1.1em;z-index:2;">Забрать</button>';
        h += '</div>';
        if (this._screenLayer) { this._screenLayer.innerHTML = h; this._screenLayer.style.display = 'block'; }
    },

    _claimReward: function() {
        this._pendingRewards = null;
        if (Sherwood.Dungeon && Sherwood.Dungeon.init) { Sherwood.Dungeon.init(); }
        if (this._afterRewardAction) { var cb = this._afterRewardAction; this._afterRewardAction = null; cb(); }
    },

    // ============================================================
    //  ПРОФИЛЬ
    // ============================================================

    profile: function() {
        this._playSound('click');
        var p = Sherwood.getPlayer();
        var eq = Sherwood.Bag ? Sherwood.Bag.getEquipment() : {};
        var ring = eq.ring, amulet = eq.amulet;
        var trophies = p.trophies || [];
        var activeSkin = p.activeSkin || 'skin1_01';
        var h = '';
        h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:8px;">';
        h += '<div style="text-align:center;"><img src="' + this._statIcons.attack + '" style="width:120px;height:120px;object-fit:contain;"><div style="color:#fff;font-size:2em;font-weight:bold;">' + p.stats.attack + '</div></div>';
        h += '<div style="text-align:center;"><img src="' + this._statIcons.defense + '" style="width:120px;height:120px;object-fit:contain;"><div style="color:#fff;font-size:2em;font-weight:bold;">' + p.stats.defense + '</div></div>';
        h += '<div style="text-align:center;"><img src="' + this._statIcons.hp + '" style="width:120px;height:120px;object-fit:contain;"><div style="color:#fff;font-size:2em;font-weight:bold;">' + p.stats.hp + '</div></div></div>';
        h += '<div style="text-align:center;margin-bottom:8px;">';
        h += '<div onclick="UI._showSkinSelector()" style="cursor:pointer;display:inline-block;position:relative;">';
        h += '<img src="assets/hero_skins/' + activeSkin + '.png" style="width:200px;height:200px;border-radius:14px;border:3px solid #ffd700;object-fit:contain;" onerror="this.src=\'assets/hero_skins/skin1_01.png\'">';
        h += '<div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.8);color:#ffd700;font-size:0.7em;font-weight:bold;padding:4px 12px;border-radius:4px;">Сменить</div>';
        h += '</div>';
        h += '<div style="color:#e0c080;font-weight:bold;margin-top:8px;font-size:1.2em;">' + p.name + '</div>';
        h += '<div style="color:#aaa;font-size:0.9em;">Уровень ' + p.level + '</div></div>';
        h += '<div style="display:flex;flex-direction:column;gap:8px;align-items:center;">';
        h += '<div onclick="UI._showAllTrophies()" style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px 20px;width:80%;max-width:300px;cursor:pointer;"><img src="' + (trophies.length > 0 && trophies[0].icon ? trophies[0].icon : 'assets/all_trophies/asset_isolated_on_a_solid.png') + '" style="width:40px;height:40px;object-fit:contain;"><span style="color:#e0c080;">' + (trophies.length > 0 ? trophies.length + ' трофеев' : 'Трофеи') + '</span></div>';
        h += '<div onclick="UI._showAllRings()" style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px 20px;width:80%;max-width:300px;cursor:pointer;"><img src="' + (ring ? ring.icon || 'assets/interface/ring_first_level.png' : 'assets/interface/ring_first_level.png') + '" style="width:40px;height:40px;object-fit:contain;"><span style="color:#e0c080;">' + (ring ? ring.name : 'Кольца') + '</span></div>';
        h += '<div onclick="UI._showAllAmulets()" style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px 20px;width:80%;max-width:300px;cursor:pointer;"><img src="' + (amulet ? amulet.icon || 'assets/interface/sherwood_amulet_level_one.png' : 'assets/interface/sherwood_amulet_level_one.png') + '" style="width:40px;height:40px;object-fit:contain;"><span style="color:#e0c080;">' + (amulet ? amulet.name : 'Амулеты') + '</span></div>';
        h += '<div onclick="UI._showTalentsFromProfile()" style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px 20px;width:80%;max-width:300px;cursor:pointer;"><img src="assets/all_buttons/ranger_skills_button.png" style="width:40px;height:40px;object-fit:contain;"><span style="color:#e0c080;">Таланты</span></div>';
        h += '<div onclick="UI._previousScreen=\'profile\';UI.training();" style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px 20px;width:80%;max-width:300px;cursor:pointer;"><img src="assets/all_buttons/training.png" style="width:40px;height:40px;object-fit:contain;"><span style="color:#e0c080;">Тренировка</span></div>';
        h += '<div onclick="UI._previousScreen=\'profile\';UI.forge();" style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px 20px;width:80%;max-width:300px;cursor:pointer;"><img src="assets/all_buttons/forge.png" style="width:40px;height:40px;object-fit:contain;"><span style="color:#e0c080;">Кузница</span></div>';
        h += '<div onclick="UI._previousScreen=\'profile\';UI.wallet();" style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px 20px;width:80%;max-width:300px;cursor:pointer;"><img src="assets/interface/wallet.png" style="width:40px;height:40px;object-fit:contain;"><span style="color:#e0c080;">Кесет</span></div>';
        h += '<div onclick="UI._previousScreen=\'profile\';UI.bestiary();" style="display:flex;align-items:center;gap:10px;background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px 20px;width:80%;max-width:300px;cursor:pointer;"><img src="assets/all_buttons/bestiary.png" style="width:40px;height:40px;object-fit:contain;"><span style="color:#e0c080;">Бестиарий</span></div>';
        h += '</div>';
        this._openScreenScrollable('Профиль', 'profile', h);
    },

    _showTalentsFromProfile: function() {
        var skills = Sherwood.Combat ? Sherwood.Combat.getSkills() : {};
        var player = Sherwood.getPlayer();
        if (!player.activeSkills) player.activeSkills = {};
        var h = '<div style="padding:10px;"><div style="color:#e0c080;font-size:1.1em;font-weight:bold;text-align:center;margin-bottom:12px;">Мои таланты</div>';
        var hasUnlocked = false;
        for (var id in skills) {
            var s = skills[id];
            if (!s.unlocked) continue;
            hasUnlocked = true;
            var isActive = player.activeSkills[id] !== false;
            h += '<div onclick="UI._toggleTalentFromProfile(\'' + id + '\')" style="cursor:pointer;background:rgba(0,0,0,0.5);border:2px solid ' + (isActive ? '#4caf50' : '#555') + ';border-radius:8px;padding:10px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">';
            h += '<img src="' + s.icon + '" style="width:44px;height:44px;object-fit:contain;">';
            h += '<div style="flex:1;"><div style="color:#e0c080;">' + s.name + '</div><div style="color:#aaa;font-size:0.7em;">' + s.description + '</div></div>';
            if (isActive) { h += '<div style="color:#4caf50;font-size:0.7em;font-weight:bold;">Вкл</div>'; } else { h += '<div style="color:#888;font-size:0.7em;font-weight:bold;">Выкл</div>'; }
            h += '</div>';
        }
        if (!hasUnlocked) { h += '<div style="color:#aaa;text-align:center;padding:20px;">Нет изученных талантов</div>'; }
        h += '<div style="color:#aaa;font-size:0.65em;text-align:center;margin-top:8px;">Нажми на талант чтобы включить или выключить</div></div>';
        this._openScreenScrollable('Таланты', 'profile', h, 'UI.profile()');
    },

    _toggleTalentFromProfile: function(id) {
        var player = Sherwood.getPlayer();
        if (!player.activeSkills) player.activeSkills = {};
        if (player.activeSkills[id] === false) { player.activeSkills[id] = true; } else { player.activeSkills[id] = false; }
        Sherwood.saveGame();
        this._showTalentsFromProfile();
    },

    _showSkinSelector: function() {
        var player = Sherwood.getPlayer();
        var unlockedSkins = player.unlockedSkins || ['skin1_01'];
        var activeSkin = player.activeSkin || 'skin1_01';
        var h = '<div style="text-align:center;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:12px;">Выбор облика</div><div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
        for (var i = 0; i < unlockedSkins.length; i++) {
            var sid = unlockedSkins[i];
            var data = Sherwood.SKIN_BONUSES[sid];
            var skinName = data ? data.name : sid;
            var isActive = sid === activeSkin;
            h += '<div onclick="' + (isActive ? '' : 'UI._selectSkin(\'' + sid + '\')') + '" style="cursor:' + (isActive ? 'default' : 'pointer') + ';background:rgba(0,0,0,0.5);border:2px solid ' + (isActive ? '#ffd700' : '#555') + ';border-radius:8px;padding:10px;width:80%;text-align:center;">';
            h += '<img src="assets/hero_skins/' + sid + '.png" style="width:64px;height:64px;object-fit:contain;border-radius:4px;" onerror="this.src=\'assets/hero_skins/skin1_01.png\'">';
            h += '<div style="color:' + (isActive ? '#ffd700' : '#e0c080') + ';font-size:0.75em;font-weight:bold;margin-top:4px;">' + skinName + '</div>';
            if (isActive) { h += '<div style="color:#ffd700;font-size:0.6em;margin-top:2px;">Установлен</div>'; } else { h += '<div style="color:#4caf50;font-size:0.6em;margin-top:2px;">Нажми чтобы надеть</div>'; }
            h += '</div>';
        }
        h += '</div>';
        this._openScreenScrollable('Смена облика', 'profile', h, 'UI.profile()');
    },

    _selectSkin: function(skinId) {
        var r = Sherwood.Forge ? Sherwood.Forge.equipSkin(skinId) : { success: false };
        if (r.success) {
            var heroImg = document.querySelector('.hero-layer img');
            if (heroImg) heroImg.src = 'assets/hero_skins/' + skinId + '.png';
            this._showToast('Облик установлен!');
            this.profile();
        } else { this._showToast(r.reason || 'Ошибка'); }
    },

    _showAllTrophies: function() {
        var trophies = Sherwood.getPlayer().trophies || [];
        var h = '<div style="padding:10px;"><div style="color:#e0c080;font-weight:bold;margin-bottom:8px;">Трофеи (' + trophies.length + ')</div>';
        if (trophies.length === 0) {
            h += '<div style="text-align:center;padding:20px;"><img src="assets/all_trophies/asset_isolated_on_a_solid.png" style="width:180px;height:180px;object-fit:contain;"><div style="color:#aaa;margin-top:8px;">Нет трофеев</div></div>';
        }
        for (var i = 0; i < trophies.length; i++) {
            var t = trophies[i];
            h += '<div style="display:flex;gap:12px;background:rgba(0,0,0,0.5);border:1px solid #c9a040;border-radius:10px;padding:10px;margin-bottom:8px;">';
            if (t.icon && t.icon.indexOf('bonds_of_eternity') !== -1) {
                h += '<img src="' + t.icon + '" style="width:80px;height:80px;object-fit:contain;flex-shrink:0;">';
            } else {
                h += '<div style="position:relative;width:80px;height:80px;flex-shrink:0;"><img src="assets/all_trophies/asset_isolated_on_a_solid.png" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;z-index:0;"><img src="' + (t.icon || 'assets/all_trophies/asset_isolated_on_a_solid.png') + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:56px;height:56px;object-fit:contain;z-index:1;border-radius:8px;"></div>';
            }
            h += '<div style="flex:1;"><div style="color:#e0c080;font-weight:bold;">' + t.name + '</div>';
            if (t.bonus) h += '<div style="color:#aaa;font-size:0.7em;margin-top:4px;">АТК +' + (t.bonus.attack||0) + ' | ЗЩТ +' + (t.bonus.defense||0) + ' | HP +' + (t.bonus.hp||0) + '</div>';
            h += '</div></div>';
        }
        h += '</div>';
        this._openScreen('Трофеи', 'profile', h, 'UI.profile()');
    },

    _showAllRings: function() {
        var equipment = Sherwood.Bag ? Sherwood.Bag.getEquipment() : {};
        var ring = equipment.ring;
        var h = '<div style="padding:10px;"><div style="color:#e0c080;font-weight:bold;margin-bottom:8px;">Кольца</div>';
        if (!ring) h += '<div style="color:#aaa;">Нет колец</div>';
        else {
            h += '<div style="display:flex;gap:12px;background:rgba(0,0,0,0.5);border:1px solid #c9a040;border-radius:10px;padding:10px;margin-bottom:8px;"><img src="' + (ring.icon || 'assets/interface/ring_first_level.png') + '" style="width:80px;height:80px;object-fit:contain;border-radius:8px;flex-shrink:0;"><div style="flex:1;"><div style="color:#e0c080;font-weight:bold;">' + ring.name + '</div>';
            if (ring.stats) h += '<div style="color:#aaa;font-size:0.7em;margin-top:4px;">АТК +' + (ring.stats.attack||0) + ' | ЗЩТ +' + (ring.stats.defense||0) + '</div>';
            h += '</div></div>';
        }
        h += '</div>';
        this._openScreen('Кольца', 'profile', h, 'UI.profile()');
    },

    _showAllAmulets: function() {
        var equipment = Sherwood.Bag ? Sherwood.Bag.getEquipment() : {};
        var amulet = equipment.amulet;
        var h = '<div style="padding:10px;"><div style="color:#e0c080;font-weight:bold;margin-bottom:8px;">Амулеты</div>';
        if (!amulet) h += '<div style="color:#aaa;">Нет амулетов</div>';
        else {
            h += '<div style="display:flex;gap:12px;background:rgba(0,0,0,0.5);border:1px solid #c9a040;border-radius:10px;padding:10px;margin-bottom:8px;"><img src="' + (amulet.icon || 'assets/interface/sherwood_amulet_level_one.png') + '" style="width:80px;height:80px;object-fit:contain;border-radius:8px;flex-shrink:0;"><div style="flex:1;"><div style="color:#e0c080;font-weight:bold;">' + amulet.name + '</div>';
            if (amulet.stats) h += '<div style="color:#aaa;font-size:0.7em;margin-top:4px;">HP +' + (amulet.stats.hp||0) + ' | ЗЩТ +' + (amulet.stats.defense||0) + '</div>';
            h += '</div></div>';
        }
        h += '</div>';
        this._openScreen('Амулеты', 'profile', h, 'UI.profile()');
    },

    // ============================================================
    //  КУЗНИЦА
    // ============================================================

    forge: function() {
        var gb = this._previousScreen === 'profile' ? 'UI.profile()' : 'UI.loadHome()';
        this._previousScreen = null;
        this._playSound('click');
        if (!Sherwood.Forge) { this._showPlaceholder('Кузница', 'forge', gb); return; }
        var player = Sherwood.getPlayer();
        var resources = Sherwood.Bag ? Sherwood.Bag.getResources() : {};
        var skinDrawings = resources.skinTablets || 0;
        var ringTablets = resources.ringTablets || 0;
        var amuletTablets = resources.amuletTablets || 0;
        var arrowCount = Sherwood.Forge.getArrowCount ? Sherwood.Forge.getArrowCount() : 0;
        var h = '';
        h += '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;">';
        h += '<div onclick="UI._showSkinCrafting()" style="cursor:pointer;position:relative;width:70px;height:70px;background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;border:2px solid #c9a040;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><img src="assets/interface/skin_drawing.png" style="width:44px;height:44px;object-fit:contain;"><span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.6em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 6px;border-radius:4px;">' + skinDrawings + '</span></div>';
        h += '<div onclick="UI._showRingCrafting()" style="cursor:pointer;position:relative;width:70px;height:70px;background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;border:2px solid #c9a040;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><img src="assets/interface/ring_crafting_tablet_resource.png" style="width:44px;height:44px;object-fit:contain;"><span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.6em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 6px;border-radius:4px;">' + ringTablets + '</span></div>';
        h += '<div onclick="UI._showAmuletCrafting()" style="cursor:pointer;position:relative;width:70px;height:70px;background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;border:2px solid #c9a040;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><img src="assets/interface/amulet_crafting_tablet_resource.png" style="width:44px;height:44px;object-fit:contain;"><span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.6em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 6px;border-radius:4px;">' + amuletTablets + '</span></div>';
        h += '<div onclick="UI._craftArrowFromForge()" style="cursor:pointer;position:relative;width:70px;height:70px;background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;border:2px solid #c9a040;border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;"><img src="assets/interface/sherwood_hollow_arrow.png" style="width:44px;height:44px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'"><span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.6em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 6px;border-radius:4px;">' + arrowCount + '</span></div>';
        h += '</div>';
        var ring = Sherwood.Bag && Sherwood.Bag._equipment ? Sherwood.Bag._equipment.ring : null;
        var amulet = Sherwood.Bag && Sherwood.Bag._equipment ? Sherwood.Bag._equipment.amulet : null;
        var ringLevel = Sherwood.Forge.getEnhanceLevel('ring');
        var ringCost = Sherwood.Forge.getEnhanceCost('ring');
        var amuletLevel = Sherwood.Forge.getEnhanceLevel('amulet');
        var amuletCost = Sherwood.Forge.getEnhanceCost('amulet');
        var skinLevel = Sherwood.Forge.getEnhanceLevel('skin');
        var skinCost = Sherwood.Forge.getEnhanceCost('skin');
        h += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:16px;align-items:center;width:100%;">';
        if (ring) { h += '<button onclick="UI._enhanceEquipped(\'ring\')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 20px;color:#000;font-weight:bold;cursor:pointer;font-size:0.85em;width:80%;max-width:300px;">Заточить кольцо (+' + ringLevel + ') — ' + ringCost + ' сер.</button>'; } else { h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:12px 20px;color:#888;font-size:0.85em;width:80%;max-width:300px;text-align:center;">Нет кольца</div>'; }
        if (amulet) { h += '<button onclick="UI._enhanceEquipped(\'amulet\')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 20px;color:#000;font-weight:bold;cursor:pointer;font-size:0.85em;width:80%;max-width:300px;">Заточить амулет (+' + amuletLevel + ') — ' + amuletCost + ' сер.</button>'; } else { h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:12px 20px;color:#888;font-size:0.85em;width:80%;max-width:300px;text-align:center;">Нет амулета</div>'; }
        h += '<button onclick="UI._enhanceEquipped(\'skin\')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 20px;color:#000;font-weight:bold;cursor:pointer;font-size:0.85em;width:80%;max-width:300px;">Заточить скин (+' + skinLevel + ') — ' + skinCost + ' сер.</button>';
        h += '</div>';
        var items = Sherwood.Bag ? Sherwood.Bag.getItems() : [];
        var enhanceItems = items.filter(function(i) { return i.part && i.part !== 'ring' && i.part !== 'amulet'; });
        if (enhanceItems.length > 0) {
            for (var i = 0; i < enhanceItems.length; i++) {
                var item = enhanceItems[i];
                var idx = items.indexOf(item);
                var lvl = item.enhancement || 0;
                h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:6px;padding:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;"><div><div style="color:#e0c080;font-size:0.8em;">' + item.name + '</div><div style="color:#aaa;font-size:0.6em;">Заточка: +' + lvl + '</div></div><button onclick="UI._enhanceItem(' + idx + ')" style="background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Точить</button></div>';
            }
        }
        h += '<div id="forge-info" style="text-align:center;color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:12px;min-height:24px;"></div>';
        this._openScreenScrollable('Кузница', 'forge', h, gb);
    },

    _showSkinCrafting: function() {
        var skins = Sherwood.Forge.getCraftSkins();
        var player = Sherwood.getPlayer();
        var unlocked = player.unlockedSkins || [];
        var resources = Sherwood.Bag.getResources();
        var skinDrawings = resources.skinTablets || 0;
        var h = '<div style="text-align:center;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:12px;">Создание обликов</div><div style="color:#aaa;font-size:0.7em;margin-bottom:8px;">Чертежей: ' + skinDrawings + '</div><div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
        for (var i = 0; i < skins.length; i++) {
            var skin = skins[i];
            var owned = unlocked.indexOf(skin.id) !== -1;
            h += '<div style="background:rgba(0,0,0,0.5);border:2px solid ' + (owned ? '#4caf50' : '#555') + ';border-radius:8px;padding:12px;width:80%;text-align:center;"><img src="' + skin.icon + '" style="width:64px;height:64px;object-fit:contain;border-radius:4px;" onerror="this.src=\'assets/hero_skins/skin1_01.png\'"><div style="color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:4px;">' + skin.name + '</div>';
            if (owned) { h += '<div style="color:#4caf50;font-size:0.7em;font-weight:bold;margin-top:4px;">ВЫКОВАН</div>'; } else {
                h += '<div style="color:#aaa;font-size:0.65em;margin-top:4px;">Чертежей: ' + skin.cost.drawings + ' | Скрижалей: ' + skin.cost.tablets + '</div><button onclick="UI._craftSkin(\'' + skin.id + '\')" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:6px 16px;color:#000;cursor:pointer;font-size:0.7em;font-weight:bold;">Создать</button>';
            }
            h += '</div>';
        }
        h += '</div>';
        this._openScreenScrollable('Облики', 'forge', h, 'UI.forge()');
    },

    _showRingCrafting: function() {
        var rings = Sherwood.BlackMarket.getAvailableRings();
        var player = Sherwood.getPlayer();
        var resources = Sherwood.Bag.getResources();
        var ringTablets = resources.ringTablets || 0;
        var ownedRings = player.marketData && player.marketData.ownedJewelry ? player.marketData.ownedJewelry.rings : [];
        var h = '<div style="text-align:center;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:12px;">Ковка колец</div><div style="color:#aaa;font-size:0.7em;margin-bottom:8px;">Скрижалей: ' + ringTablets + '</div><div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
        for (var i = 0; i < rings.length; i++) {
            var ring = rings[i];
            var owned = ownedRings.indexOf(ring.id) !== -1 || Sherwood.BlackMarket.isJewelryOwned('ring', ring.id);
            h += '<div style="background:rgba(0,0,0,0.5);border:2px solid ' + (owned ? '#4caf50' : '#555') + ';border-radius:8px;padding:12px;width:80%;text-align:center;"><img src="' + ring.icon + '" style="width:64px;height:64px;object-fit:contain;border-radius:4px;"><div style="color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:4px;">' + ring.name + '</div><div style="color:#aaa;font-size:0.65em;margin-top:2px;">АТК +' + ring.stats.attack + ' | ЗЩТ +' + ring.stats.defense + '</div>';
            if (owned) { h += '<div style="color:#4caf50;font-size:0.7em;font-weight:bold;margin-top:4px;">ВЫКОВАН</div>'; } else {
                h += '<div style="color:#aaa;font-size:0.65em;margin-top:4px;">Скрижалей: 10</div><button onclick="UI._buyRingFromMarket(\'' + ring.id + '\')" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:6px 16px;color:#000;cursor:pointer;font-size:0.7em;font-weight:bold;">Создать</button>';
            }
            h += '</div>';
        }
        h += '</div>';
        this._openScreenScrollable('Кольца', 'forge', h, 'UI.forge()');
    },

    _showAmuletCrafting: function() {
        var amulets = Sherwood.BlackMarket.getAvailableAmulets();
        var player = Sherwood.getPlayer();
        var resources = Sherwood.Bag.getResources();
        var amuletTablets = resources.amuletTablets || 0;
        var ownedAmulets = player.marketData && player.marketData.ownedJewelry ? player.marketData.ownedJewelry.amulets : [];
        var h = '<div style="text-align:center;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:12px;">Ковка амулетов</div><div style="color:#aaa;font-size:0.7em;margin-bottom:8px;">Скрижалей: ' + amuletTablets + '</div><div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
        for (var i = 0; i < amulets.length; i++) {
            var amulet = amulets[i];
            var owned = ownedAmulets.indexOf(amulet.id) !== -1 || Sherwood.BlackMarket.isJewelryOwned('amulet', amulet.id);
            h += '<div style="background:rgba(0,0,0,0.5);border:2px solid ' + (owned ? '#4caf50' : '#555') + ';border-radius:8px;padding:12px;width:80%;text-align:center;"><img src="' + amulet.icon + '" style="width:64px;height:64px;object-fit:contain;border-radius:4px;"><div style="color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:4px;">' + amulet.name + '</div><div style="color:#aaa;font-size:0.65em;margin-top:2px;">HP +' + amulet.stats.hp + ' | ЗЩТ +' + amulet.stats.defense + '</div>';
            if (owned) { h += '<div style="color:#4caf50;font-size:0.7em;font-weight:bold;margin-top:4px;">ВЫКОВАН</div>'; } else {
                h += '<div style="color:#aaa;font-size:0.65em;margin-top:4px;">Скрижалей: 10</div><button onclick="UI._buyAmuletFromMarket(\'' + amulet.id + '\')" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:6px 16px;color:#000;cursor:pointer;font-size:0.7em;font-weight:bold;">Создать</button>';
            }
            h += '</div>';
        }
        h += '</div>';
        this._openScreenScrollable('Амулеты', 'forge', h, 'UI.forge()');
    },

    _craftArrowFromForge: function() {
        var arrowInfo = Sherwood.Forge.getArrowCraftInfo();
        var info = document.getElementById('forge-info');
        if (arrowInfo.canCraft > 0) {
            var r = Sherwood.Forge.craftArrowBatch(1);
            if (r.success) { if (info) info.textContent = 'Создано стрел: ' + (r.crafted || 1); } else { if (info) info.textContent = r.reason || 'Ошибка'; }
        } else { if (info) info.textContent = 'Не хватает: 1 Ветка + 1 Перо + 1 Кость'; }
        var self = this;
        setTimeout(function() { self.forge(); }, 800);
    },

    _buyRingFromMarket: function(ringId) {
        var r = Sherwood.BlackMarket.buyJewelry('ring', ringId);
        if (r.success) { this._showToast('Кольцо выковано!'); } else { this._showToast(r.reason || 'Ошибка'); }
        var self = this;
        setTimeout(function() { self._showRingCrafting(); }, 800);
    },

    _buyAmuletFromMarket: function(amuletId) {
        var r = Sherwood.BlackMarket.buyJewelry('amulet', amuletId);
        if (r.success) { this._showToast('Амулет выкован!'); } else { this._showToast(r.reason || 'Ошибка'); }
        var self = this;
        setTimeout(function() { self._showAmuletCrafting(); }, 800);
    },

    _craftSkin: function(skinId) {
        var r = Sherwood.Forge.craftSkin(skinId);
        if (r.success) { this._showToast('Облик выкован!'); } else { this._showToast(r.reason || 'Ошибка'); }
        var self = this;
        setTimeout(function() { self._showSkinCrafting(); }, 800);
    },

    _enhanceItem: function(idx) {
        var r = Sherwood.Forge.enhanceItem(idx);
        var log = document.getElementById('forge-log');
        if (r.enhanced) { if (log) log.textContent = 'Улучшено! +' + r.newLevel; }
        else if (r.broken) { if (log) log.textContent = 'Сломано!'; }
        else if (r.failed) { if (log) log.textContent = 'Неудача'; }
        else { if (log) log.textContent = (r.reason || 'Ошибка'); }
        this.updateDisplay();
        var self = this;
        setTimeout(function() { self.forge(); }, 800);
    },

    _enhanceEquipped: function(type) {
        var r = Sherwood.Forge.enhanceEquipped(type);
        if (r.success) { this._playSound('forge'); this._showToast('Улучшено!'); this.updateDisplay(); this.forge(); } else { this._showToast(r.reason || 'Ошибка'); }
    },

    // ============================================================
    //  ТРЕНИРОВКА
    // ============================================================

    training: function() {
        var gb = this._previousScreen === 'profile' ? 'UI.profile()' : 'UI.loadHome()';
        this._previousScreen = null;
        this._playSound('click');
        var p = Sherwood.getPlayer();
        if (!p.trainingLevels) p.trainingLevels = { attack: 0, defense: 0, hp: 0 };
        var tl = p.trainingLevels;
        var stats = ['attack', 'defense', 'hp'];
        var names = { attack: 'Атака', defense: 'Защита', hp: 'Здоровье' };
        var colors = { attack: '#f44336', defense: '#2196f3', hp: '#4caf50' };
        var bonuses = { attack: 3, defense: 3, hp: 3 };
        var h = '<div style="padding:10px;display:flex;flex-direction:column;gap:10px;">';
        for (var i = 0; i < stats.length; i++) {
            var s = stats[i];
            var lvl = tl[s] || 0;
            var nextLevel = lvl + 1;
            var isGoldLevel = nextLevel % 5 === 0;
            var cost;
            if (isGoldLevel) { cost = Math.round(5 * Math.pow(1.15, Math.floor(nextLevel / 5))); } else { cost = Math.round(10 * Math.pow(nextLevel, 1.15)); }
            var currency = isGoldLevel ? 'золота' : 'серебра';
            var currencyIcon = isGoldLevel ? 'assets/interface/resource_gold.png' : 'assets/interface/resource_silver.png';
            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:10px;padding:12px;display:flex;flex-direction:column;align-items:center;">';
            h += '<div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">';
            h += '<img src="' + this._statIcons[s] + '" style="width:64px;height:64px;object-fit:contain;">';
            h += '<div style="text-align:left;">';
            h += '<div style="color:#e0c080;font-size:1em;font-weight:bold;">' + names[s] + '</div>';
            h += '<div style="color:#aaa;font-size:0.8em;">Уровень: ' + lvl + '/1000</div>';
            h += '<div style="color:' + colors[s] + ';font-size:0.7em;">+' + bonuses[s] + ' за уровень</div>';
            h += '</div></div>';
            h += '<div style="color:#e0c080;font-size:0.75em;margin-bottom:6px;">Следующая тренировка: <img src="' + currencyIcon + '" style="width:16px;height:16px;vertical-align:middle;"> ' + cost + ' ' + currency + '</div>';
            if (lvl >= 1000) { h += '<div style="color:#4caf50;font-weight:bold;">МАКСИМУМ</div>'; } else {
                h += '<button onclick="UI._doTraining(\'' + s + '\')" style="background:#c9a040;border:none;border-radius:6px;padding:10px 24px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">Тренировать</button>';
            }
            h += '</div>';
        }
        h += '<div id="training-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:8px;"></div></div>';
        this._openScreenScrollable('Тренировка', 'training', h, gb);
    },

    _doTraining: function(stat) {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.trainingLevels) p.trainingLevels = { attack: 0, defense: 0, hp: 0 };
        var cur = p.trainingLevels[stat] || 0;
        if (cur >= 1000) { var log = document.getElementById('training-log'); if (log) log.textContent = 'Макс. уровень!'; return; }
        var nextLevel = cur + 1;
        var isGoldLevel = nextLevel % 5 === 0;
        var cost;
        if (isGoldLevel) { cost = Math.round(5 * Math.pow(1.15, Math.floor(nextLevel / 5))); } else { cost = Math.round(10 * Math.pow(nextLevel, 1.15)); }
        var currency = isGoldLevel ? 'gold' : 'silver';
        var currencyName = isGoldLevel ? 'золота' : 'серебра';
        if ((p.resources[currency] || 0) < cost) { var log = document.getElementById('training-log'); if (log) log.textContent = 'Нужно ' + cost + ' ' + currencyName + '!'; return; }
        p.resources[currency] -= cost;
        p.trainingLevels[stat] = nextLevel;
        if (Sherwood.Daily) Sherwood.Daily.updateProgress('stat_' + stat, p.stats[stat]);
        if (Sherwood._recalcStats) Sherwood._recalcStats();
        if (Sherwood.saveGame) Sherwood.saveGame();
        this.updateDisplay();
        this.training();
        var log = document.getElementById('training-log');
        if (log) log.textContent = stat + ' → ' + nextLevel + ' (-' + cost + ' ' + currencyName + ')';
    },

    // ============================================================
    //  БЕСТИАРИЙ
    // ============================================================

    bestiary: function() {
        var gb = this._previousScreen === 'profile' ? 'UI.profile()' : 'UI.loadHome()';
        this._previousScreen = null;
        this._playSound('click');
        if (!Sherwood.Bestiary) { this._showPlaceholder('Бестиарий', 'bestiary', gb); return; }
        var progress = Sherwood.Bestiary.getDiscoveryProgress();
        var tabs = ['Проклятая чаща', 'Первородное болото', 'Базальтовый грот', 'Квест', 'Портал'];
        if (!this._bestiaryTab) this._bestiaryTab = 0;
        var h = '<div style="text-align:center;margin-bottom:8px;color:#aaa;">Открыто: '+progress.discovered+'/'+progress.total+' ('+progress.percent+'%)</div>';
        h += '<div style="background:rgba(0,0,0,0.3);border-radius:6px;height:10px;margin-bottom:8px;overflow:hidden;"><div style="background:#c9a040;height:100%;width:'+progress.percent+'%;"></div></div>';
        h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">';
        for (var t=0; t<tabs.length; t++) {
            var active = (this._bestiaryTab === t) ? '#c9a040' : 'rgba(255,255,255,0.1)';
            var color = (this._bestiaryTab === t) ? '#000' : '#fff';
            h += '<button onclick="UI._bestiaryTab='+t+';UI.bestiary();" style="background:'+active+';border:1px solid #555;border-radius:6px;padding:4px 10px;color:'+color+';cursor:pointer;font-size:0.7em;">'+tabs[t]+'</button>';
        }
        h += '</div>';
        var beasts = Sherwood.Bestiary.getBeastsByZone(tabs[this._bestiaryTab]);
        if (beasts.length === 0) { h += '<div style="color:#aaa;text-align:center;">Нет бестий</div>'; }
        h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:350px;margin:0 auto;">';
        for (var i=0; i<beasts.length; i++) {
            var b = beasts[i], disc = b.kills > 0;
            var beastImgPath = 'assets/all_beasts/' + b.id;
            if (b.zone === 'Квест') beastImgPath = 'assets/beast_quest/' + b.id;
            if (b.zone === 'Портал') beastImgPath = 'assets/portal_beasts/' + b.id;
            h += '<div onclick="UI._showBeastInfo(\''+b.id+'\')" style="background:rgba(0,0,0,0.5);border:1px solid '+(disc?'#4caf50':'#555')+';border-radius:8px;padding:8px;display:flex;flex-direction:column;align-items:center;cursor:pointer;">';
            h += '<img src="' + beastImgPath + '" style="width:80px;height:80px;object-fit:contain;border-radius:4px;'+(disc?'':'filter:grayscale(1);opacity:0.5;')+'" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '<div style="color:'+(disc?'#fff':'#888')+';font-size:0.6em;text-align:center;margin-top:4px;">'+(disc?b.name:'???')+'</div>';
            h += '<div style="color:#aaa;font-size:0.5em;">Убито: '+b.kills+'</div>';
            if (disc && !b.rewardClaimed) {
                h += '<button onclick="event.stopPropagation();UI._claimBestiaryReward(\''+b.id+'\')" style="background:#ff9800;border:none;border-radius:4px;padding:2px 8px;color:#fff;cursor:pointer;font-size:0.5em;margin-top:2px;">+'+b.reward+' Сер.</button>';
            }
            if (disc && b.rewardClaimed) { h += '<span style="color:#4caf50;font-size:0.5em;margin-top:2px;">✓</span>'; }
            h += '</div>';
        }
        h += '</div>';
        this._openScreen('Бестиарий', 'bestiary', h, gb);
    },

    _showBeastInfo: function(beastId) {
        var b = Sherwood.Bestiary.getBeast(beastId);
        if (!b) return;
        var disc = b.kills > 0;
        var beastImgPath = 'assets/all_beasts/' + beastId;
        if (b.zone === 'Квест') beastImgPath = 'assets/beast_quest/' + beastId;
        if (b.zone === 'Портал') beastImgPath = 'assets/portal_beasts/' + beastId;
        var h = '<div style="display:flex;gap:12px;padding:12px;"><div style="width:140px;flex-shrink:0;"><img src="' + beastImgPath + '" style="width:140px;height:140px;object-fit:contain;border:2px solid #c9a040;border-radius:10px;'+(disc?'':'filter:grayscale(1);opacity:0.5;')+'" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'"><div style="text-align:center;color:#e0c080;font-weight:bold;margin-top:4px;">'+b.name+'</div><div style="text-align:center;color:#aaa;font-size:0.7em;">'+b.floor+' | '+b.type+'</div></div><div style="flex:1;"><div style="color:#ccc;font-size:0.8em;line-height:1.4;">'+(disc?b.lore:'Убейте эту бестию чтобы открыть лор.')+'</div><div style="color:#aaa;font-size:0.7em;margin-top:8px;">Убито: '+b.kills+' | Награда: '+(b.reward||50)+' Сер.</div>';
        if (disc && !b.rewardClaimed) h += '<button onclick="UI._claimBestiaryReward(\''+beastId+'\')" style="margin-top:8px;background:#ff9800;border:none;border-radius:6px;padding:6px 16px;color:#fff;cursor:pointer;">Забрать '+(b.reward||50)+' Сер.</button>';
        if (disc && b.rewardClaimed) h += '<div style="color:#4caf50;margin-top:8px;">Награда получена</div>';
        h += '</div></div>';
        this._openScreen(b.name, 'bestiary', h, 'UI.bestiary()');
    },

    _claimBestiaryReward: function(beastId) {
        if (!Sherwood.Bestiary) return;
        var r = Sherwood.Bestiary.claimReward(beastId);
        if (r.success) { this.updateDisplay(); this.bestiary(); }
    },

    // ============================================================
    //  ВАЛЛЕТ (КЕСЕТ)
    // ============================================================

    wallet: function() {
        this._playSound('click');
        var p = Sherwood.getPlayer();
        if (!p.keset) p.keset = { cells: [], totalSilver: 0 };
        if (!p.keset.cells || p.keset.cells.length === 0) {
            p.keset.cells = [];
            for (var i = 0; i < 6; i++) p.keset.cells.push(0);
            p.keset.totalSilver = 0;
        }
        var cells = p.keset.cells;
        var totalFilled = 0;
        for (var i = 0; i < cells.length; i++) { totalFilled += cells[i]; }
        var h = '<div style="text-align:center;padding:10px;"><div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:4px;">Кесет</div><div style="color:#c0c0c0;font-size:0.9em;margin-bottom:12px;">Накоплено: ' + totalFilled + ' серебра</div>';
        h += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:220px;margin:0 auto 20px;">';
        for (var i = 0; i < cells.length; i++) {
            var cellSilver = cells[i];
            var pct = Math.min(100, Math.round((cellSilver / 20000) * 100));
            h += '<div style="position:relative;width:100px;height:100px;background:url(\'assets/interface/wallet_cell.png\') center/contain no-repeat;background-size:cover;border:2px solid ' + (cellSilver > 0 ? '#ffd700' : '#555') + ';border-radius:8px;display:flex;align-items:center;justify-content:center;">';
            if (cellSilver > 0) {
                h += '<img src="assets/interface/resource_silver.png" style="width:48px;height:48px;object-fit:contain;opacity:' + (0.3 + (pct / 100) * 0.7) + ';"><span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.5em;font-weight:bold;text-shadow:0 0 4px #000;">' + pct + '%</span>';
            }
            h += '</div>';
        }
        h += '</div>';
        if (totalFilled >= 100000) {
            h += '<button onclick="UI._withdrawWallet()" style="background:#c9a040;border:none;border-radius:8px;padding:14px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:0.95em;margin-bottom:8px;">Забрать ' + totalFilled + ' серебра</button>';
        } else {
            h += '<div style="color:#888;font-size:0.85em;margin-bottom:8px;">Нужно минимум 100,000 серебра для снятия</div>';
        }
        h += '</div>';
        this._openScreen('Кесет', 'wallet', h, 'UI.profile()');
    },

    _withdrawWallet: function() {
        var p = Sherwood.getPlayer();
        if (!p.keset) return;
        var totalFilled = 0;
        for (var i = 0; i < p.keset.cells.length; i++) totalFilled += p.keset.cells[i];
        if (totalFilled < 100000) { this._showToast('Минимум 100,000 серебра для снятия'); return; }
        Sherwood.addResource('silver', totalFilled);
        for (var i = 0; i < p.keset.cells.length; i++) p.keset.cells[i] = 0;
        p.keset.totalSilver = 0;
        Sherwood.saveGame();
        this.updateDisplay();
        this.wallet();
    },

    _addWalletSilver: function(amount) {
        var p = Sherwood.getPlayer();
        if (!p.keset) p.keset = { cells: [], totalSilver: 0 };
        if (!p.keset.cells || p.keset.cells.length === 0) {
            p.keset.cells = [];
            for (var i = 0; i < 6; i++) p.keset.cells.push(0);
        }
        var maxPerCell = 20000;
        var remaining = amount;
        for (var i = 0; i < p.keset.cells.length && remaining > 0; i++) {
            var space = maxPerCell - p.keset.cells[i];
            if (space > 0) {
                var add = Math.min(remaining, space);
                p.keset.cells[i] += add;
                remaining -= add;
            }
        }
        p.keset.totalSilver = 0;
        for (var i = 0; i < p.keset.cells.length; i++) p.keset.totalSilver += p.keset.cells[i];
        Sherwood.saveGame();
    },

    // ============================================================
    //  НАСТРОЙКИ
    // ============================================================

    settings: function() {
        this._playSound('click');
        var p = Sherwood.getPlayer();
        var nm = p ? p.name : 'Охотник';
        var nameChanges = p ? (p.nameChanges || 0) : 0;
        var h = '';
        h += '<div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;"><div style="color:#fff;margin-bottom:8px;">Имя</div><div style="display:flex;gap:8px;"><input id="pni" value="' + nm + '" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:8px 12px;color:#fff;"><button onclick="UI._changePlayerName()" style="background:#c9a040;border:none;border-radius:6px;padding:8px 16px;color:#000;font-weight:bold;cursor:pointer;">Сохранить</button></div>';
        if (nameChanges === 0) { h += '<div style="color:#4caf50;font-size:0.7em;margin-top:4px;">Первая смена имени — бесплатно</div>'; } else { h += '<div style="color:#ffd700;font-size:0.7em;margin-top:4px;">Смена имени: 500 золота</div>'; }
        h += '<div id="name-status" style="color:#aaa;font-size:0.7em;margin-top:4px;"></div></div>';
        h += '<div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="color:#fff;">Звуки</span><button onclick="UI._toggleSound(' + !this._soundEnabled + ')" style="width:60px;height:30px;background:' + (this._soundEnabled ? '#4caf50' : '#555') + ';border:none;border-radius:15px;cursor:pointer;position:relative;"><span style="position:absolute;top:3px;' + (this._soundEnabled ? 'right:3px;' : 'left:3px;') + 'width:24px;height:24px;background:#fff;border-radius:50%;transition:0.2s;"></span></button></div><div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#fff;">Музыка</span><button onclick="UI._toggleMusic(' + !this._musicEnabled + ')" style="width:60px;height:30px;background:' + (this._musicEnabled ? '#4caf50' : '#555') + ';border:none;border-radius:15px;cursor:pointer;position:relative;"><span style="position:absolute;top:3px;' + (this._musicEnabled ? 'right:3px;' : 'left:3px;') + 'width:24px;height:24px;background:#fff;border-radius:50%;transition:0.2s;"></span></button></div></div>';
        h += '<button onclick="UI._saveProgress()" style="width:100%;background:#4caf50;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;margin-bottom:8px;">Сохранить прогресс</button>';
        h += '<button onclick="UI._resetCharacter()" style="width:100%;background:#ff9800;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;margin-bottom:8px;">Сбросить персонажа (5000 золота)</button>';
        h += '<button onclick="UI._exitGame()" style="width:100%;background:#f44336;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;">Выйти</button>';
        this._openScreen('Настройки', 'settings', h);
    },

    _changePlayerName: function() {
        var inp = document.getElementById('pni'), st = document.getElementById('name-status');
        if (!inp || !st) return;
        var nm = inp.value.trim();
        if (!nm) { st.textContent = 'Пустое имя'; st.style.color = '#f44336'; return; }
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.nameChanges) p.nameChanges = 0;
        if (p.nameChanges === 0) {
            p.name = nm;
            p.nameChanges = 1;
            Sherwood.saveGame();
            st.textContent = 'Имя изменено бесплатно!';
            st.style.color = '#4caf50';
        } else {
            if ((p.resources.gold || 0) < 500) { st.textContent = 'Нужно 500 золота для смены имени'; st.style.color = '#f44336'; return; }
            Sherwood.spendResource('gold', 500);
            p.name = nm;
            p.nameChanges++;
            Sherwood.saveGame();
            st.textContent = 'Имя изменено за 500 золота!';
            st.style.color = '#4caf50';
        }
        this.updateDisplay();
        this.settings();
    },

    _saveProgress: function() {
        if (Sherwood.saveGameNow) { Sherwood.saveGameNow(); this._showToast('Прогресс сохранён!'); }
        else if (Sherwood.saveGame) { Sherwood.saveGame(); this._showToast('Прогресс сохранён!'); }
    },

    _resetCharacter: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if ((p.resources.gold || 0) < 5000) { this._showToast('Нужно 5000 золота для сброса'); return; }
        if (!confirm('Сбросить персонажа за 5000 золота? Весь прогресс будет удалён!')) return;
        var remainingGold = (p.resources.gold || 0) - 5000;
        var remainingSilver = p.resources.silver || 0;
        Sherwood._createNewPlayer();
        p = Sherwood.getPlayer();
        p.resources.gold = remainingGold;
        p.resources.silver = remainingSilver;
        p.nameChanges = 0;
        Sherwood._recalcStats();
        Sherwood.saveGameNow();
        this._showToast('Персонаж сброшен!');
        this.loadHome();
    },

    _exitGame: function() {
        if (confirm('Выйти в главное меню?')) {
            if (Sherwood.saveGameNow) Sherwood.saveGameNow();
            else if (Sherwood.saveGame) Sherwood.saveGame();
            this._stopMusic();
            this.loadHome();
            location.reload();
        }
    },

    // ============================================================
    //  СУМКА
    // ============================================================

    bag: function() {
        this._playSound('click');
        var bag = Sherwood.Bag;
        var items = bag ? bag.getItems() : [];
        var max = bag ? bag.getMaxSlots() : 10;
        var resources = bag ? bag.getResources() : {};
        var h = '';
        h += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px;">';
        var resDefs = [
            { key: 'gold', icon: 'assets/interface/resource_gold.png' }, { key: 'silver', icon: 'assets/interface/resource_silver.png' },
            { key: 'skins', icon: 'assets/interface/skin_of_the_sherwood_creature.png' }, { key: 'entranceTickets', icon: 'assets/interface/resource_key_to_locked_levels.png' },
            { key: 'autoFightTickets', icon: 'assets/interface/ticket_autofight.png' }, { key: 'amuletTablets', icon: 'assets/interface/amulet_crafting_tablet_resource.png' },
            { key: 'ringTablets', icon: 'assets/interface/ring_crafting_tablet_resource.png' }, { key: 'skinTablets', icon: 'assets/interface/resource_appearance_crafting_tablet.png' },
            { key: 'portalToken1', icon: 'assets/interface/resource_token_on_entrance_portal_1.png' }, { key: 'portalToken2', icon: 'assets/interface/resource_token_on_entrance_portal_2.png' }, { key: 'portalToken3', icon: 'assets/interface/resource_token_on_entrance_portal_3.png' }
        ];
        for (var r = 0; r < resDefs.length; r++) {
            var rd = resDefs[r];
            var count = resources[rd.key] || 0;
            h += '<div style="position:relative;width:70px;height:70px;"><img src="assets/interface/visual_resource.png" style="width:100%;height:100%;object-fit:contain;"><img src="' + rd.icon + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'"><span style="position:absolute;top:2px;right:6px;color:#fff;font-size:0.6em;font-weight:bold;text-shadow:0 1px 2px #000;">' + count + '</span></div>';
        }
        h += '</div>';
        h += '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;margin-bottom:6px;">' + items.length + '/' + max + ' ячеек</div>';
        var expInfo = bag.getExpansionInfo();
        var expBtn = expInfo.canExpand ? '<button onclick="UI._expandBag()" style="margin-top:10px;background:#c9a040;border:none;border-radius:8px;padding:8px 18px;color:#000;font-weight:bold;cursor:pointer;font-size:0.8em;">Расширить +10 (' + expInfo.costSilver + ' серебра + ' + expInfo.costSkin + ' шкур)</button>' : '<span style="color:#666;font-size:0.7em;">Максимум для вашего уровня</span>';
        h += expBtn;
        h += '<div id="bag-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:260px;margin:16px auto 0;">';
        for (var i = 0; i < max; i++) {
            var item = items[i];
            if (item) {
                var gc = Sherwood.GradeColors ? Sherwood.GradeColors[item.grade] : '#9d9d9d';
                h += '<div draggable="true" data-bag-index="' + i + '" ondragstart="UI._bagDragStart(event,' + i + ')" ondragover="UI._bagDragOver(event)" ondrop="UI._bagDrop(event,' + i + ')" onclick="UI._bagAction(' + i + ')" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:80px;height:80px;border:2px solid ' + gc + ';border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;padding:4px;"><img src="' + (item.icon || 'assets/interface/labyrinth_of_icons.png') + '" style="width:44px;height:44px;object-fit:contain;">';
                if (item.quantity > 1) { h += '<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.65em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 6px;border-radius:4px;">' + item.quantity + '</span>'; }
                h += '</div>';
            } else {
                h += '<div data-bag-index="' + i + '" ondragover="UI._bagDragOver(event)" ondrop="UI._bagDrop(event,' + i + ')" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:80px;height:80px;border:2px solid #555;border-radius:8px;display:flex;align-items:center;justify-content:center;"></div>';
            }
        }
        h += '</div><div id="bag-info" style="text-align:center;color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:14px;min-height:24px;">Нажми на предмет</div>';
        this._openScreenScrollable('Сумка', 'bag', h);
    },

    _bagDragStart: function(e, index) { e.dataTransfer.setData('text/plain', index); e.dataTransfer.effectAllowed = 'move'; },
    _bagDragOver: function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; },
    _bagDrop: function(e, targetIndex) {
        e.preventDefault();
        var sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;
        var items = Sherwood.Bag.getItems();
        if (sourceIndex >= items.length) return;
        var sourceItem = items[sourceIndex];
        var targetItem = items[targetIndex];
        if (targetItem && sourceItem.id === targetItem.id && sourceItem.name === targetItem.name) {
            var maxStack = sourceItem.maxStack || 100;
            var totalQty = (sourceItem.quantity || 1) + (targetItem.quantity || 1);
            if (totalQty <= maxStack) { targetItem.quantity = totalQty; items.splice(sourceIndex, 1); } else { targetItem.quantity = maxStack; sourceItem.quantity = totalQty - maxStack; }
        } else { items[sourceIndex] = targetItem; items[targetIndex] = sourceItem; }
        Sherwood.Bag._save();
        this.bag();
    },

    _expandBag: function() {
        var r = Sherwood.Bag.expandBag();
        var info = document.getElementById('bag-info');
        if (r.success) { if (info) info.textContent = 'Сумка расширена до ' + r.newSlots + ' ячеек!'; this.updateDisplay(); } else { if (info) info.textContent = (r.reason || 'Ошибка'); }
        var self = this;
        setTimeout(function() { self.bag(); }, 800);
    },

    _bagAction: function(i) {
        var bag = Sherwood.Bag;
        if (!bag) return;
        var items = bag.getItems();
        if (i >= items.length) return;
        var item = items[i];
        if (!item) return;
        var info = document.getElementById('bag-info');
        if (!info) return;
        var a = '';
        if (item.part) { a += '<button onclick="Sherwood.Bag.equipItem(' + i + ');UI.bag();" style="background:#4caf50;border:none;border-radius:6px;padding:6px 14px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;">Надеть</button>'; }
        a += '<button onclick="Sherwood.Bag.sellItem(' + i + ');UI.bag();" style="background:#ff9800;border:none;border-radius:6px;padding:6px 14px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;">Продать</button>';
        a += '<button onclick="Sherwood.Bag.discardItem(' + i + ');UI.bag();" style="background:#f44336;border:none;border-radius:6px;padding:6px 14px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;">Выкинуть</button>';
        info.innerHTML = '<div style="color:#e0c080;font-size:0.95em;font-weight:bold;">' + (item.name || 'Предмет') + '</div><div style="color:#aaa;font-size:0.75em;">' + (item.grade || 'обычный') + ' x' + (item.quantity || 1) + '</div><div style="margin-top:8px;">' + a + '</div>';
    },

    // ============================================================
    //  ДОПОЛНИТЕЛЬНЫЕ ЭКРАНЫ
    // ============================================================

    quests: function() { this._showPlaceholder('Квесты', 'quests'); },
    tavern: function() {
    this._playSound('click');
    if (typeof Sherwood !== 'undefined' && Sherwood.Tavern && Sherwood.Tavern.showUI) {
        Sherwood.Tavern.showUI();
    } else {
        this._showPlaceholder('Таверна', 'tavern');
    }
},
    portals: function() { this._showPlaceholder('Порталы', 'portal'); },
    raid: function() { this._showPlaceholder('Рейд', 'raid'); },
    daily: function() { this._showPlaceholder('Ежедневные', 'daily'); },

    // ============================================================
    //  ПОДЗЕМКА (БАЗОВАЯ)
    // ============================================================

    dungeon: function() {
        this._playSound('click');
        if (typeof Sherwood.Dungeon2D5 !== 'undefined' && Sherwood.Dungeon2D5.render) {
            Sherwood.Dungeon2D5.render();
        } else {
            this._showPlaceholder('Подземка', 'dungeon_forest');
        }
    },

    // ============================================================
    //  РЫНОК
    // ============================================================

    market: function() {
        this._playSound('click');
        if (typeof Sherwood.BlackMarket !== 'undefined' && Sherwood.BlackMarket.showUI) {
            Sherwood.BlackMarket.showUI();
        } else {
            this._showPlaceholder('Рынок', 'market');
        }
    },

    // ============================================================
    //  ЭКСПОРТ
    // ============================================================

        showUI: function() {
        this.loadHome();
    }
});

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ (уже вызван в ui_common.js)
// ============================================================

// ============================================================
//  ГЛОБАЛЬНЫЙ ЭКСПОРТ
// ============================================================

window.UI = UI;
window.Sherwood = window.Sherwood || {};
window.Sherwood.UI = UI;

console.log('🖥️ UI экраны полностью загружены!');

// ============================================================
//  ПРИНУДИТЕЛЬНАЯ ПРОВЕРКА
// ============================================================

(function ensureUIScreens() {
    console.log('🔧 Проверка UI экранов...');
    if (typeof UI !== 'undefined' && UI.profile) {
        console.log('✅ UI.profile существует');
    }
    if (typeof UI !== 'undefined' && UI._openScreen) {
        console.log('✅ UI._openScreen существует');
    }
    setTimeout(function() {
        console.log('🧪 UI слой готов к отображению');
        if (UI._screenLayer) {
            UI._screenLayer.style.display = 'none';
        }
    }, 1000);
})();

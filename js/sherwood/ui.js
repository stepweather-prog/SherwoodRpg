const SherwoodUI = {
    _bg: {
        main: 'assets/backgrounds/homepage_screen.jpeg', bag: 'assets/backgrounds/bag.jpeg', profile: 'assets/backgrounds/character_page.jpeg',
        bestiary: 'assets/backgrounds/character_page.jpeg', quests: 'assets/backgrounds/skill_page.jpeg', training: 'assets/backgrounds/training.jpeg',
        forge: 'assets/backgrounds/forge.jpeg', tavern: 'assets/backgrounds/tavern.jpeg', market: 'assets/backgrounds/market.jpeg',
        arena: 'assets/backgrounds/arena.jpeg', raid: 'assets/backgrounds/background_raid.png', settings: 'assets/backgrounds/settings_page.jpeg',
        daily: 'assets/backgrounds/tasks.jpeg', portal: 'assets/backgrounds/portal_1.jpeg', chat: 'assets/backgrounds/chat_background.png',
        dungeon_select: 'assets/backgrounds/underground_1_floor_1.jpg', dungeon_forest: 'assets/backgrounds/underground_1_floor_1.jpg',
        dungeon_swamp: 'assets/backgrounds/underground_2_floor_1.jpeg', dungeon_cave: 'assets/backgrounds/underground_3_floor_1.jpeg',
        dungeon_fight: 'assets/backgrounds/underground_1_floor_1.jpg',
        portal_3: 'assets/backgrounds/portal_3.png',
        hearth: 'assets/backgrounds/background_hearth.jpeg', talents: 'assets/backgrounds/background_talents.png', wallet: 'assets/interface/wallet_visual.png'
    },
    
    _statIcons: { attack: 'assets/interface/icon_power.png', defense: 'assets/interface/icon_defense.png', hp: 'assets/interface/icon_health.png' },
    _sounds: {}, _currentMusic: null, _currentMusicKey: null, _soundEnabled: true, _musicEnabled: true,
    _mainThemeWasPlaying: false, _mainThemeKey: null, _mainThemeTime: 0,
    _audioFiles: {
        'main_theme': 'assets/sounds/main_theme.ogg',
        'main_theme_2': 'assets/sounds/main_theme_2.ogg',
        'dungeon_1': 'assets/sounds/dungeon_1.ogg',
        'dungeon_2': 'assets/sounds/dungeon_2.ogg',
        'dungeon_3': 'assets/sounds/dungeon_3.ogg',
        'click': 'assets/sounds/click.wav',
        'hit': 'assets/sounds/hit.wav',
        'chest_open': 'assets/sounds/chest_open.wav',
        'altar': 'assets/sounds/altar.wav',
        'cauldron': 'assets/sounds/cauldron.wav',
        'potion': 'assets/sounds/potion.wav',
        'loot_fly': 'assets/sounds/loot_fly.wav',
        'trap': 'assets/sounds/trap.wav',
        'tile_open': 'assets/sounds/tile_open.wav',
        'steps': 'assets/sounds/steps.wav',
        'bag_drop': 'assets/sounds/bag_drop.wav',
        'defeat': 'assets/sounds/defeat.wav',
        'levelup': 'assets/sounds/levelup.wav',
        'forge': 'assets/sounds/forge.wav',
        'heal': 'assets/sounds/heal.wav',
        'victory': 'assets/sounds/victory.wav'
    },
    _previousScreen: null, _dungeon: null, _dailyTab: 1, _pendingRewards: null, _afterRewardAction: null,
    _lastBgKey: null,

    init: function() {
        this._mainElements = ['.bg-layer', '.portal-video-bg', '.arch-layer', '.hero-layer', '.top-panel', '.left-buttons-column', '.right-buttons-column', '.bottom-stats'];
        this.container = document.getElementById('game-container'); 
        if (!this.container) return;
        
        this._screenLayer = document.createElement('div'); 
        this._screenLayer.id = 'screen-layer';
        this._screenLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:50;display:none;';
        this.container.appendChild(this._screenLayer);
        
        try { this._initSounds(); } catch(e) {}
        this.bindPlayButton();
        
        try { this._loadAudioSettings(); } catch(e) {}
        this._updateHeroSkin();
        
        try {
            var silverEl = document.getElementById('silver-display');
            if (silverEl) {
                silverEl.parentElement.style.cursor = 'pointer';
                silverEl.parentElement.onclick = function() { SherwoodUI._showExchangePanel(); };
            }
        } catch(e) {}
        
        if (this._musicEnabled) {
            try { this._playMusic('main_theme'); } catch(e) {}
        }
        
        try { this.updateDisplay(); } catch(e) {}
        
        if (typeof Sherwood !== 'undefined') {
            try { Sherwood.on('RESOURCE_CHANGED', function() { SherwoodUI.updateDisplay(); }); } catch(e) {}
            try { Sherwood.on('PLAYER_LEVEL_UP', function() { SherwoodUI._playSound('levelup'); SherwoodUI.updateDisplay(); }); } catch(e) {}
        }
        
        window.addEventListener('beforeunload', function() {
            if (typeof Sherwood !== 'undefined' && Sherwood.saveGameNow) {
                Sherwood.saveGameNow();
            }
        });
        
        this._preloadBackgrounds();
        this._scaleGame();
        window.addEventListener('resize', function() { SherwoodUI._scaleGame(); });
    },
        
    _preloadBackgrounds: function() {
        var urls = [];
        for (var key in this._bg) {
            if (this._bg.hasOwnProperty(key)) urls.push(this._bg[key]);
        }
        urls.push('assets/backgrounds/wallpaper_subway_1.png');
        urls.push('assets/backgrounds/wallpaper_subway_2.png');
        urls.push('assets/backgrounds/wallpaper_subway_3.jpeg');
        urls.push('assets/dungeon_tiles/visual_dungeon/sherwood_thicket.png');
        urls.push('assets/dungeon_tiles/visual_dungeon/the_cursed_thicket.png');
        urls.push('assets/dungeon_tiles/visual_dungeon/primordial_swamp.png');
        urls.push('assets/dungeon_tiles/visual_dungeon/basalt_grotto.png');
        urls.push('assets/interface/quest_section.png');
        urls.push('assets/backgrounds/section_tavern.png');
        urls.push('assets/interface/section_arena.png');
        urls.push('assets/interface/raid_visual.png');
        urls.push('assets/backgrounds/character_page.jpeg');
        urls.push('assets/interface/tasks_visual.png');
        urls.push('assets/interface/tasks_chapters_visual.png');
        urls.push('assets/interface/wallet_visual.png');
        urls.push('assets/interface/blades_arena.png');
        urls.push('assets/portal_beasts/visual_portals/ancient_parchment_of_portals.png');
        urls.push('assets/interface/vertical_slab_victory.png');
        urls.push('assets/interface/vertical_slab_defeat.png');
        for (var i = 0; i < urls.length; i++) {
            var img = new Image();
            img.src = urls[i];
        }
    },

    _scaleGame: function() {
        var container = document.getElementById('game-container');
        if (!container) return;
        var windowWidth = window.innerWidth;
        var windowHeight = window.innerHeight;
        var gameWidth = 480;
        var gameHeight = 800;
        var scale = Math.min(windowWidth / gameWidth, windowHeight / gameHeight);
        scale = Math.min(scale, 1);
        if (scale < 1) {
            container.style.transform = 'scale(' + scale + ')';
            container.style.transformOrigin = 'top center';
        } else {
            container.style.transform = '';
            container.style.transformOrigin = '';
            container.style.width = '';
            container.style.marginLeft = '';
        }
    },    _updateHeroSkin: function() {
        try {
            var p = Sherwood.getPlayer();
            if (!p) return;
            var skin = p.activeSkin || 'skin1_01';
            var heroImg = document.querySelector('.hero-layer img');
            if (heroImg) heroImg.src = 'assets/hero_skins/' + skin + '.png';
        } catch(e) {}
    },
    
    updateDisplay: function() {
        var p = Sherwood.getPlayer(); if (!p) return;
        try { var el = document.getElementById('gold-display'); if (el) el.textContent = p.resources.gold || 0; } catch(e) {}
        try { var el = document.getElementById('silver-display'); if (el) el.textContent = p.resources.silver || 0; } catch(e) {}
        try { var el = document.getElementById('level-display'); if (el) el.textContent = p.level || 1; } catch(e) {}
        try {
            var expEl = document.getElementById('exp-display');
            var expFill = document.getElementById('exp-fill-bar');
            var pct = p.expToLevel > 0 ? Math.round((p.exp / p.expToLevel) * 100) : 0;
            if (expEl) expEl.textContent = pct + '%';
            if (expFill) expFill.style.width = pct + '%';
        } catch(e) {}
        try {
            var stats = document.querySelectorAll('.stat-value');
            if (stats.length >= 3) { stats[0].textContent = p.stats.attack; stats[1].textContent = p.stats.defense; stats[2].textContent = p.stats.hp + '/' + p.stats.maxHp; }
        } catch(e) {}
    },

    _showExchangePanel: function() {
        var p = Sherwood.getPlayer();
        var maxGold = p.resources.gold || 0;
        if (maxGold <= 0) { this._showToast('Нет золота для обмена'); return; }
        var h = '<div style="text-align:center;padding:20px;">';
        h += '<div style="color:#e0c080;font-size:1.2em;margin-bottom:16px;">Обмен золота на серебро</div>';
        h += '<div style="color:#aaa;font-size:0.85em;margin-bottom:4px;">Курс: 1 золото = 100 серебра</div>';
        h += '<div style="color:#ffd700;font-size:1em;margin-bottom:20px;">Доступно: ' + maxGold + ' золота</div>';
        h += '<div style="margin-bottom:20px;"><input id="exchange-amount" type="range" min="1" max="' + maxGold + '" value="1" oninput="document.getElementById(\'exchange-value\').textContent = this.value + \' золота = \' + (this.value * 100) + \' серебра\'" style="width:80%;height:8px;"></div>';
        h += '<div id="exchange-value" style="color:#fff;font-size:1em;margin-bottom:24px;">1 золота = 100 серебра</div>';
        h += '<div style="display:flex;gap:24px;justify-content:center;">';
        h += '<button onclick="SherwoodUI._doExchange()" style="background:transparent;border:none;cursor:pointer;padding:0;width:120px;height:120px;"><img src="assets/all_buttons/exchange_button.png" style="width:100%;height:100%;object-fit:contain;"></button>';
        h += '<button onclick="SherwoodUI.loadHome()" style="background:transparent;border:none;cursor:pointer;padding:0;width:120px;height:120px;"><img src="assets/all_buttons/cancel_button.png" style="width:100%;height:100%;object-fit:contain;"></button>';
        h += '</div></div>';
        this._openScreen('Обмен', 'market', h);
    },

    _doExchange: function() {
        var amountEl = document.getElementById('exchange-amount');
        if (!amountEl) return;
        var amount = parseInt(amountEl.value);
        if (amount > 0) {
            var r = Sherwood.convertGoldToSilver(amount);
            if (r.success) {
                SherwoodUI.updateDisplay();
                var p = Sherwood.getPlayer();
                var maxGold = p.resources.gold || 0;
                if (maxGold > 0) { SherwoodUI._showExchangePanel(); } else { SherwoodUI.loadHome(); }
            } else { this._showToast(r.reason); }
        }
    },

    _showToast: function(msg) {
        var toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999;background:rgba(0,0,0,0.9);color:#f44336;padding:12px 24px;border-radius:8px;border:1px solid #f44336;font-size:0.9em;font-family:\'Georgia\',serif;pointer-events:none;';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(function() { toast.remove(); }, 2000);
    },

    _initSounds: function() {
        for (var k in this._audioFiles) { try { var a = new Audio(this._audioFiles[k]); a.preload = 'auto'; a.volume = 0.5; this._sounds[k] = a; } catch(e) {} }
        try { this._sounds['main_theme_2'].loop = true; this._sounds['main_theme_2'].volume = 0.5; } catch(e) {}
        try { this._sounds['dungeon_1'].loop = true; this._sounds['dungeon_1'].volume = 0.4; } catch(e) {}
        try { this._sounds['dungeon_2'].loop = true; this._sounds['dungeon_2'].volume = 0.4; } catch(e) {}
        try { this._sounds['dungeon_3'].loop = true; this._sounds['dungeon_3'].volume = 0.4; } catch(e) {}
    },

    _playSound: function(k) { try { if (!this._soundEnabled) return; var s = this._sounds[k]; if (s) { s.currentTime = 0; s.play().catch(function() {}); } } catch(e) {} },
    _stopSound: function(k) { try { var s = this._sounds[k]; if (s) { s.pause(); s.currentTime = 0; } } catch(e) {} },

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
                if (k === 'main_theme') {
                    m.loop = false;
                    var self = this;
                    m.onended = function() { self._playMusic('main_theme_2'); };
                }
                if (k === 'main_theme_2') { m.loop = true; }
                if (k.indexOf('dungeon_') === 0) { m.loop = true; }
            }
        } catch(e) {}
    },

    _stopMusic: function() { try { if (this._currentMusic) { this._currentMusic.pause(); this._currentMusic.currentTime = 0; this._currentMusic = null; this._currentMusicKey = null; } } catch(e) {} },
    _pauseMusic: function() { try { if (this._currentMusic) { this._currentMusic.pause(); } } catch(e) {} },
    _resumeMusic: function() { try { if (this._currentMusic && this._musicEnabled) { this._currentMusic.play().catch(function() {}); } } catch(e) {} },
    _playHitSounds: function() { try { this._playSound('hit'); } catch(e) {} },
    _saveAudioSettings: function() { try { localStorage.setItem('sherwood_audio', JSON.stringify({ sound: this._soundEnabled, music: this._musicEnabled })); } catch(e) {} },
    _loadAudioSettings: function() { try { var s = localStorage.getItem('sherwood_audio'); if (s) { var d = JSON.parse(s); this._soundEnabled = d.sound !== false; this._musicEnabled = d.music !== false; } } catch(e) {} },

    bindPlayButton: function() {
        try {
            var self = this; var btn = document.getElementById('playBtn');
            if (btn) btn.addEventListener('click', function() {
                try { document.getElementById('loadingScreen').classList.add('hidden'); } catch(e) {}
                try { document.getElementById('mainInterface').classList.add('active'); } catch(e) {}
                try { self._playSound('click'); self._playMusic('main_theme'); } catch(e) {}
            });
        } catch(e) {}
    },

    loadHome: function() {
        try { if (this._screenLayer) { this._screenLayer.style.display = 'none'; this._screenLayer.innerHTML = ''; } } catch(e) {}
        try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = ''; }); }); } catch(e) {}
        try { this.container.style.background = ''; } catch(e) {}
        this._previousScreen = null;
        this._lastBgKey = null;
        try {
            var self = this;
            if (!this._regenInterval) {
                this._regenInterval = setInterval(function() {
                    var pl = Sherwood.getPlayer();
                    if (pl && !Sherwood.Combat._battle && !Sherwood.Dungeon.getDungeon()) {
                        var regen = Math.floor(pl.stats.maxHp * 0.25);
                        pl.stats.hp = Math.min(pl.stats.maxHp, pl.stats.hp + regen);
                        self.updateDisplay();
                        Sherwood.saveGame();
                    }
                }, 15000);
            }
        } catch(e) {}
        this._updateHeroSkin();
        if (this._musicEnabled && !this._currentMusic) {
            try { this._playMusic('main_theme'); } catch(e) {}
        }
        try { this.updateDisplay(); } catch(e) {}
    },

    _openScreen: function(title, bgKey, html, backFn) {
        try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = 'none'; }); }); } catch(e) {}
        var bgUrl = this._bg[bgKey] || bgKey;
        if (this._lastBgKey !== bgKey) {
            try { this.container.style.background = "url('" + bgUrl + "') center/cover no-repeat"; } catch(e) {}
            this._lastBgKey = bgKey;
        }
        var goBack = backFn || 'SherwoodUI.loadHome()';
        try { if (this._screenLayer) { this._screenLayer.innerHTML = '<div style="min-height:100%;padding:16px;display:flex;flex-direction:column;overflow-y:auto;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;"><button onclick="' + goBack + '" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;">' + title + '</span></div><div style="flex:1;overflow-y:auto;">' + html + '</div></div>'; this._screenLayer.style.display = 'block'; } } catch(e) {} 
    },

    _openScreenScrollable: function(title, bgKey, html, backFn) {
        try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = 'none'; }); }); } catch(e) {}
        var bgUrl = this._bg[bgKey] || bgKey;
        if (this._lastBgKey !== bgKey) {
            try { this.container.style.background = "url('" + bgUrl + "') center/cover no-repeat"; } catch(e) {}
            this._lastBgKey = bgKey;
        }
        var goBack = backFn || 'SherwoodUI.loadHome()';
        try { 
            if (this._screenLayer) { 
                this._screenLayer.innerHTML = '<div style="height:100%;display:flex;flex-direction:column;overflow:hidden;">' +
                    '<div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;">' +
                    '<button onclick="' + goBack + '" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button>' +
                    '<span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">' + title + '</span></div>' +
                    '<div style="flex:1;overflow-y:auto;overflow-x:hidden;padding:8px 12px 20px 12px;-webkit-overflow-scrolling:touch;">' + html + '</div></div>'; 
                this._screenLayer.style.display = 'block'; 
            } 
        } catch(e) {}
    },

    _showPlaceholder: function(title, bgKey, backAction) { this._playSound('click'); this._openScreen(title, bgKey, '<div style="text-align:center;padding:40px 0;"><div style="font-size:3em;margin-bottom:16px;">&#128679;</div><div style="font-size:1.2em;color:#e0c080;margin-bottom:8px;">'+title+'</div><div style="font-size:0.7em;color:#888;">В разработке</div></div>', backAction); },    _showVictoryScreen: function(rewards) {
        var h = '<div style="display:flex;align-items:center;justify-content:center;min-height:100%;padding:20px;">';
        h += '<div style="position:relative;display:inline-block;">';
        h += '<img src="assets/interface/vertical_slab_victory.png" style="width:600px;height:auto;display:block;">';
        h += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">';
        if (rewards.dungeonId && rewards.dungeonLevel) {
            h += '<div style="margin:10px 0;"><img src="assets/interface/resource_cup_for_completed_tasks.png" style="width:56px;height:56px;object-fit:contain;"><div style="color:#ffd700;font-size:1.2em;font-weight:bold;">+1 Кубок</div><div style="color:#aaa;font-size:0.9em;">Этаж ' + rewards.dungeonLevel + '</div></div>';
        }
        if (rewards.exp) h += '<div style="color:#fff;font-size:1.6em;margin:4px 0;">+ ' + rewards.exp + ' Опыта</div>';
        if (rewards.gold) h += '<div style="color:#ffd700;font-size:1.6em;margin:4px 0;"><img src="assets/interface/resource_gold.png" style="width:28px;height:28px;vertical-align:middle;object-fit:contain;"> + ' + rewards.gold + ' Золота</div>';
        if (rewards.silver) h += '<div style="color:#c0c0c0;font-size:1.6em;margin:4px 0;"><img src="assets/interface/resource_silver.png" style="width:28px;height:28px;vertical-align:middle;object-fit:contain;"> + ' + rewards.silver + ' Серебра</div>';
        if (rewards.scrolls) h += '<div style="color:#9c27b0;font-size:1.6em;margin:4px 0;">+ ' + rewards.scrolls + ' Скрижалей</div>';
        h += '</div>';
        h += '<button onclick="SherwoodUI._claimReward()" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:14px;padding:16px 50px;color:#000;font-weight:bold;cursor:pointer;font-size:1.5em;z-index:2;">Забрать</button>';
        h += '</div></div>';
        this._openScreen('Победа', 'dungeon_fight', h);
    },

    _showDefeatScreen: function(rewards) { 
        var h = '<div style="text-align:center;padding:10px;"><div style="position:relative;display:inline-block;"><img src="assets/interface/vertical_slab_defeat.png" style="width:400px;height:auto;display:block;"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;"><div style="color:#f44336;font-size:1.3em;font-weight:bold;">&#128128; ПОРАЖЕНИЕ</div>'; 
        if (rewards.exp) h += '<div style="color:#fff;font-size:1em;">+ ' + rewards.exp + ' XP</div>'; 
        if (rewards.silver) h += '<div style="color:#c0c0c0;font-size:1em;">+ ' + rewards.silver + ' Серебра</div>'; 
        if (rewards.scrolls) h += '<div style="color:#9c27b0;font-size:1em;">+ ' + rewards.scrolls + ' Свитков</div>'; 
        h += '</div><button onclick="SherwoodUI._claimReward()" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:8px;padding:10px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;z-index:2;">Забрать</button></div></div>'; 
        this._openScreen('Поражение', 'dungeon_fight', h); 
    },
        hearth: function() {
        this._playSound('click');
        var p = Sherwood.getPlayer();
        var bonusActive = p.hearthBonus && p.hearthBonus.active;
        var bonusEnd = p.hearthBonus ? p.hearthBonus.endTime || 0 : 0;
        var now = Date.now();
        var cooldownEnd = p.hearthCooldown || 0;
        var wood = 0;
        try { var bag = Sherwood.Bag.getItems(); for (var i=0;i<bag.length;i++) { if (bag[i].id === 'wood' || bag[i].name === 'Дерево') wood += bag[i].quantity || 0; } } catch(e) {}
        var canActivate = wood >= 100 && now > cooldownEnd;
        var h = '<div style="text-align:center;padding:20px;"><div style="font-size:3em;">&#128293;</div><div style="color:#e0c080;font-size:1.2em;margin:12px 0;">Очаг Шервуда</div><div style="color:#aaa;font-size:0.85em;">Дерева в сумке: ' + wood + ' / 100</div>';
        if (bonusActive && now < bonusEnd) {
            var rem = Math.ceil((bonusEnd - now)/3600000);
            h += '<div style="color:#4caf50;margin:12px 0;">&#9989; Бонус +50% к трофеям активен! Осталось: ' + rem + ' ч.</div>';
        } else if (now <= cooldownEnd) {
            var cd = Math.ceil((cooldownEnd - now)/3600000);
            h += '<div style="color:#ff9800;margin:12px 0;">&#9203; Перезарядка: ' + cd + ' ч.</div>';
        } else if (canActivate) {
            h += '<button onclick="SherwoodUI._activateHearth()" style="margin-top:12px;background:#c9a040;border:none;border-radius:8px;padding:10px 24px;color:#000;font-weight:bold;cursor:pointer;">Подкинуть дров (100)</button>';
        } else {
            h += '<div style="color:#f44336;margin:12px 0;">Недостаточно дерева (нужно 100)</div>';
        }
        h += '</div>';
        this._openScreen('Очаг', 'hearth', h);
    },

    _activateHearth: function() {
        var p = Sherwood.getPlayer();
        var spent = 0;
        try { var bag = Sherwood.Bag.getItems(); for (var i=bag.length-1;i>=0&&spent<100;i--) { if (bag[i].id==='wood'||bag[i].name==='Дерево') { var q=bag[i].quantity||1; var t=Math.min(q,100-spent); spent+=t; if(q<=t) bag.splice(i,1); else bag[i].quantity-=t; } } Sherwood.Bag._save(); } catch(e) {}
        p.hearthBonus = { active: true, endTime: Date.now() + 86400000 };
        p.hearthCooldown = Date.now() + 86400000 + 86400000;
        Sherwood._recalcStats();
        Sherwood.saveGame();
        this.hearth();
    },

    talents: function() {
        this._playSound('click');
        var skills = Sherwood.Combat ? Sherwood.Combat.getSkills() : {};
        var h = '<div style="padding:10px;"><div style="color:#e0c080;font-size:1.1em;text-align:center;margin-bottom:12px;">&#127807; Таланты</div>';
        for (var id in skills) { 
            var s = skills[id]; 
            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px;margin-bottom:8px;display:flex;align-items:center;gap:10px;">';
            h += '<img src="' + s.icon + '" style="width:44px;height:44px;object-fit:contain;" onerror="this.src=\'assets/skills/skill_shot_normal.png\'">';
            h += '<div style="flex:1;"><div style="color:#e0c080;">' + s.name + '</div><div style="color:#aaa;font-size:0.7em;">' + s.description + '</div></div>';
            if (s.unlocked) {
                h += '<div style="color:#4caf50;font-size:0.7em;">Открыт</div>';
            } else {
                h += '<button onclick="SherwoodUI._unlockTalent(\'' + id + '\')" style="background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Изучить (' + s.cost + ' Золота)</button>';
            }
            h += '</div>'; 
        }
        h += '</div>';
        this._openScreen('Таланты', 'talents', h);
    },

    _unlockTalent: function(id) { 
        if(!Sherwood.Combat||!Sherwood.Combat.unlockSkill) return; 
        var r=Sherwood.Combat.unlockSkill(id); 
        if(r.success){this.updateDisplay();this.talents();} 
        else this._showToast(r.reason||'Ошибка'); 
    },

    subway: function() { this.showDungeon(); },

    showDungeon: function() {
        this._playSound('click');
        if (this._currentMusicKey === 'main_theme' || this._currentMusicKey === 'main_theme_2') {
            this._mainThemeWasPlaying = true;
            this._mainThemeKey = this._currentMusicKey;
        }
        this._playMusic('dungeon_1');
        
        var dungeons = Sherwood.Dungeon.getAvailable();
        var dungeonList = [
            { id: 'forest', name: 'Проклятая чаща', icon: 'the_cursed_thicket.png' },
            { id: 'swamp', name: 'Первородное болото', icon: 'primordial_swamp.png' },
            { id: 'cave', name: 'Базальтовый грот', icon: 'basalt_grotto.png' }
        ];
        
        var h = '';
        var p = Sherwood.getPlayer();
        var tickets = p.dungeon ? p.dungeon.tickets : 0;
        
        var afActive = Sherwood.Dungeon.isAutoFightActive();
        if (afActive) {
            var afRemain = Sherwood.Dungeon.getAutoFightRemaining();
            h += '<div style="text-align:center;background:rgba(201,160,64,0.3);border:1px solid #c9a040;border-radius:8px;padding:8px;margin-bottom:12px;">';
            h += '<div style="color:#ffd700;font-size:0.85em;">⚔️ Автобой активен</div>';
            h += '<div style="color:#aaa;font-size:0.7em;">Осталось: ' + afRemain + ' мин.</div>';
            h += '</div>';
        }
        
        for (var i = 0; i < dungeonList.length; i++) {
            var dl = dungeonList[i];
            var d = dungeons[dl.id];
            if (d) {
                h += '<div style="text-align:center;margin-bottom:24px;">';
                h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:10px;">' + dl.name + '</div>';
                h += '<img src="assets/dungeon_tiles/visual_dungeon/' + dl.icon + '" style="width:160px;height:160px;object-fit:contain;display:block;margin:0 auto 10px;">';
                if (d.unlocked) {
                    h += '<button onclick="SherwoodUI._showDungeonLevels(\'' + dl.id + '\')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:0.95em;">Войти</button>';
                } else {
                    h += '<div style="color:#f44336;font-size:0.8em;">Заблокировано</div>';
                }
                h += '</div>';
            }
        }
        
        h += '<div style="color:#aaa;font-size:0.85em;margin-top:16px;text-align:center;">Билетов: ' + tickets + '</div>';
        
        this._openScreenScrollable('Подземелья', 'dungeon_select', h);
    },

    _showDungeonLevels: function(dungeonId) {
        var d = Sherwood.Dungeon.getAvailable()[dungeonId];
        if (!d) return;
        var progress = Sherwood.Dungeon._progress[dungeonId] || { level: 1, cups: {} };
        var cups = progress.cups || {};
        var dungeonNames = { forest: 'Проклятая чаща', swamp: 'Первородное болото', cave: 'Базальтовый грот' };
        var dungeonIcons = { forest: 'the_cursed_thicket.png', swamp: 'primordial_swamp.png', cave: 'basalt_grotto.png' };
        
        var tp, te;
        if (dungeonId === 'forest') { tp = 'assets/dungeon_tiles/dungeon1/tiles'; te = '.jpeg'; }
        else if (dungeonId === 'swamp') { tp = 'assets/dungeon_tiles/dungeon2/tiles2.'; te = '.png'; }
        else { tp = 'assets/dungeon_tiles/dungeon3/tiles3.'; te = '.png'; }
        
        var h = '';
        h += '<div style="text-align:center;margin-bottom:16px;">';
        h += '<img src="assets/dungeon_tiles/visual_dungeon/' + (dungeonIcons[dungeonId] || 'the_cursed_thicket.png') + '" style="width:100px;height:100px;object-fit:contain;">';
        h += '<div style="color:#e0c080;font-size:1em;font-weight:bold;margin-top:8px;">' + (dungeonNames[dungeonId] || dungeonId) + '</div>';
        h += '</div>';
        h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:360px;margin:0 auto;">';
        
        for (var lvl = 1; lvl <= 8; lvl++) {
            var unlocked = lvl <= progress.level;
            var cupCount = cups[lvl] || 0;
            var img = unlocked ? (tp + lvl + te) : 'assets/interface/closed_level_lock_icon.png';
            h += '<div style="text-align:center;">';
            h += '<div style="display:flex;justify-content:center;gap:2px;margin-bottom:2px;min-height:20px;">';
            for (var c = 0; c < 3; c++) {
                if (c < cupCount) h += '<img src="assets/interface/resource_cup_for_completed_tasks.png" style="width:16px;height:16px;object-fit:contain;">';
                else h += '<div style="width:16px;height:16px;"></div>';
            }
            h += '</div>';
            h += '<div onclick="' + (unlocked ? 'SherwoodUI._showDungeonActions(\'' + dungeonId + '\',' + lvl + ')' : '') + '" style="width:56px;height:56px;background-image:url(\'' + img + '\');background-size:cover;background-position:center;border:2px solid ' + (unlocked ? '#c9a040' : '#555') + ';border-radius:8px;cursor:' + (unlocked ? 'pointer' : 'default') + ';display:flex;align-items:center;justify-content:center;position:relative;margin:0 auto;">';
            h += '<span style="position:absolute;bottom:2px;right:4px;font-size:0.6em;color:' + (unlocked ? '#000' : '#888') + ';font-weight:bold;">' + lvl + '</span>';
            h += '</div>';
            h += '</div>';
        }
        h += '</div>';
        
        this._openScreenScrollable('Выбор этажа', 'dungeon_select', h);
    },

    _showDungeonActions: function(dungeonId, level) {
        var progress = Sherwood.Dungeon._progress[dungeonId] || { level: 1, cups: {} };
        var cups = progress.cups || {};
        var cupCount = cups[level] || 0;
        var autoTickets = Sherwood.Bag.getResource('autoFightTickets');
        
        var h = '<div style="text-align:center;padding:20px;">';
        h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:12px;">Этаж ' + level + '</div>';
        h += '<div style="margin-bottom:16px;">';
        for (var c = 0; c < 3; c++) {
            h += '<img src="assets/interface/resource_cup_for_completed_tasks.png" style="width:24px;height:24px;object-fit:contain;margin:0 2px;' + (c >= cupCount ? 'opacity:0.3;' : '') + '">';
        }
        h += '<div style="color:#aaa;font-size:0.7em;">' + cupCount + '/3 кубков</div>';
        h += '</div>';
        h += '<button onclick="SherwoodUI._startDungeon(\'' + dungeonId + '\',' + level + ')" style="display:block;width:80%;margin:0 auto 8px;background:#c9a040;border:none;border-radius:8px;padding:12px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">Войти (1 билет)</button>';
        
        if (cupCount >= 3) {
            if (Sherwood.Dungeon.isAutoFightActive()) {
                h += '<div style="width:80%;margin:0 auto 8px;background:#555;border:none;border-radius:8px;padding:12px;color:#999;font-size:0.9em;">Автобой уже активен</div>';
            } else {
                h += '<button onclick="SherwoodUI._startAutoFight(\'' + dungeonId + '\',' + level + ',false)" style="display:block;width:80%;margin:0 auto 8px;background:#ff9800;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.9em;">Автобой (15 мин) — 50 золота</button>';
            }
            if (autoTickets > 0) {
                h += '<button onclick="SherwoodUI._startAutoFight(\'' + dungeonId + '\',' + level + ',true)" style="display:block;width:80%;margin:0 auto 8px;background:#4caf50;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.9em;">Мгновенный автобой — 1 тикет (' + autoTickets + ' шт.)</button>';
            }
        }
        h += '</div>';
        
        this._openScreen('Действия', 'dungeon_select', h);
    },

    _startAutoFight: function(dungeonId, level, instant) {
        var result = Sherwood.Dungeon.startAutoFight(dungeonId, level, instant);
        if (result.success) {
            if (result.instant) {
                this._showToast('Автобой завершён!');
                this._showDungeonLevels(dungeonId);
            } else {
                this._showToast('Автобой запущен на 15 минут!');
                this.showDungeon();
            }
        } else {
            this._showToast(result.reason);
        }
    },

    _startDungeon: function(id, level) { 
        var d = Sherwood.Dungeon.generate(id, level); 
        if (!d) { this._showToast('Нет билетов!'); return; } 
        this._renderDungeon(); 
    },    _renderDungeon: function() {
        var d = Sherwood.Dungeon.getDungeon(); 
        if (!d) { this.showDungeon(); return; }
        
        var p = Sherwood.getPlayer();
        var dungeons = Sherwood.Dungeon.getAvailable();
        var dd = dungeons[d.id] || { bg: this._bg.dungeon_forest, tiles: "dungeon1" };
        
        this.container.style.background = "url(" + dd.bg + ") center/cover no-repeat";
        try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = "none"; }); }); } catch(e) {}
        
        var dungId = d.id || 'forest';
        var altarImg = 'assets/interface/altar_of_the_first_dungeon.png';
        var cauldronImg = 'assets/interface/cauldron_first_dungeon.png';
        var chestLockedImg = 'assets/interface/locked_chest_first_dungeon.png';
        var chestOpenImg = 'assets/interface/open_chest_first_dungeon.png';
        var exitImg = 'assets/interface/exit_completion_dungeon.png';
        
        if (dungId === 'swamp') {
            altarImg = 'assets/interface/altar_of_the_second_dungeon.png';
            cauldronImg = 'assets/interface/cauldron_of_the_second_dungeon.png';
            chestLockedImg = 'assets/interface/locked_chest_second_dungeon.png';
            chestOpenImg = 'assets/interface/open_chest_of_the_second_dungeon.png';
            exitImg = 'assets/interface/completion_of_the_second_underground_level.png';
        } else if (dungId === 'cave') {
            altarImg = 'assets/interface/the_third_altar_of_the_dungeon.png';
            cauldronImg = 'assets/interface/the_third_cauldron_of_the_dungeon.png';
            chestLockedImg = 'assets/interface/locked_chest_third_dungeon.png';
            chestOpenImg = 'assets/interface/open_chest_third_dungeon.png';
            exitImg = 'assets/interface/completion_of_level_three_subway.png';
        }
        
        var size = d.size;
        var cs = Math.floor(Math.min(this.container.clientWidth, this.container.clientHeight - 80) / 4);
        var floorBg = "assets/dungeon_tiles/" + dd.tiles + "/floorBg_" + (d.id === "forest" ? "1" : d.id === "swamp" ? "2" : "3") + ".png";
        var px = d.px, py = d.py;
        var gridW = cs * size, gridH = cs * size;
        var scrollX = Math.max(0, Math.min(px * cs - this.container.clientWidth / 2 + cs / 2, gridW - this.container.clientWidth));
        var scrollY = Math.max(0, Math.min(py * cs - (this.container.clientHeight - 80) / 2 + cs / 2, gridH - (this.container.clientHeight - 80)));

        var html = "<div style='position:relative;width:" + gridW + "px;height:" + gridH + "px;background-image:url(" + floorBg + ");background-size:100% 100%;overflow:hidden;font-size:0;line-height:0;'>";
        html += "<div style='position:absolute;left:" + (-scrollX) + "px;top:" + (-scrollY) + "px;width:" + gridW + "px;height:" + gridH + "px;font-size:0;line-height:0;'>";

        // Плитки (туман войны)
        for (var y = 0; y < size; y++) { 
            for (var x = 0; x < size; x++) { 
                var cellData = d.grid[y] && d.grid[y][x];
                if (!cellData || cellData.open) continue;
                html += "<img src='assets/interface/labyrinth_asset.png' style='position:absolute;left:" + (x*cs) + "px;top:" + (y*cs) + "px;width:" + cs + "px;height:" + cs + "px;z-index:2;'>"; 
            } 
        }

        // Затемнение (туман войны)
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                if (!d.grid[y] || !d.grid[y][x]) continue;
                var cell = d.grid[y][x];
                if (!cell.open) {
                    var distToPlayer = Math.abs(px - x) + Math.abs(py - y);
                    var opacity = distToPlayer <= 1 ? '0.3' : '0.7';
                    html += "<div style='position:absolute;left:" + (x*cs) + "px;top:" + (y*cs) + "px;width:" + cs + "px;height:" + cs + "px;background:rgba(0,0,0," + opacity + ");z-index:3;'></div>";
                }
            }
        }

        // Объекты и герой
        for (var y = 0; y < size; y++) {
            for (var x = 0; x < size; x++) {
                if (!d.grid[y] || !d.grid[y][x]) continue;
                var cell = d.grid[y][x], isPlayer = (x === px && y === py);
                var onclick = "", glow = "";
                if (!isPlayer) {
                    var clickDist = Math.abs(px - x) + Math.abs(py - y);
                    if (!cell.open && clickDist === 1 && cell.type !== 0) {
                        onclick = "onclick='SherwoodUI._dungeonMove(" + x + "," + y + ")'";
                        glow = "box-shadow:inset 0 0 14px rgba(255,255,200,0.7);";
                    } else if (cell.open) {
                        onclick = "onclick='SherwoodUI._dungeonMove(" + x + "," + y + ")'";
                    }
                }
                var content = "";
                if (!isPlayer) {
                    if (cell.open && cell.monster) content = "<img src='assets/all_beasts/" + (cell.monsterId || "image (1).png") + "' style='width:90%;height:90%;object-fit:contain;'>";
                    else if (cell.open && cell.lootBag && !cell.lootCollected) content = "<img src='assets/interface/loot_bag_of_beasts.png' style='width:70%;height:70%;object-fit:contain;'>";
                    else if (cell.open && cell.lootBag && cell.lootCollected) content = "<img src='assets/interface/empty_bag_of_loot_beasts.png' style='width:70%;height:70%;object-fit:contain;'>";
                    else if (cell.open && cell.chest && !cell.looted) content = "<img src='" + chestLockedImg + "' style='width:80%;height:80%;object-fit:contain;'>";
                    else if (cell.open && cell.chest && cell.looted) content = "<img src='" + chestOpenImg + "' style='width:80%;height:80%;object-fit:contain;'>";
                    else if (cell.open && cell.altar) {
                        content = "<img src='" + altarImg + "' style='width:80%;height:80%;object-fit:contain;" + (cell.altarCollected ? "opacity:0.4;" : "") + "'>";
                    }
                    else if (cell.open && cell.cauldron) {
                        content = "<img src='" + cauldronImg + "' style='width:80%;height:80%;object-fit:contain;" + (cell.cauldronCollected ? "opacity:0.4;" : "") + "'>";
                    }
                    else if (cell.open && cell.potion && !cell.potionCollected) content = "<img src='assets/interface/resource_life_potion.png' style='width:70%;height:70%;object-fit:contain;'>";
                    else if (cell.open && cell.exit) content = cell.locked ? "<img src='assets/interface/closed_level_lock_icon.png' style='width:80%;height:80%;object-fit:contain;'>" : "<img src='" + exitImg + "' style='width:80%;height:80%;object-fit:contain;'>";
                }
                if (isPlayer) {
                    if (d.isMoving) {
                        var vf = "step_down.webm";
                        if (d.heroDirection === "up") vf = "step_up.webm";
                        else if (d.heroDirection === "left") vf = "step_left.webm";
                        else if (d.heroDirection === "right") vf = "step_right.webm";
                        content = "<video autoplay muted playsinline style='position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:4;'><source src='assets/animation/" + vf + "' type='video/webm'></video>";
                    } else {
                        var hi = "assets/animation/step_down.png";
                        if (d.heroDirection === "up") hi = "assets/animation/step_up.png";
                        else if (d.heroDirection === "left") hi = "assets/animation/step_left.png";
                        else if (d.heroDirection === "right") hi = "assets/animation/step_right.png";
                        content = "<img src='" + hi + "' style='position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;z-index:4;'>";
                    }
                }
                html += "<div " + onclick + " style='position:absolute;left:" + (x*cs) + "px;top:" + (y*cs) + "px;width:" + cs + "px;height:" + cs + "px;display:flex;align-items:center;justify-content:center;font-size:" + (cs*0.35) + "px;z-index:4;cursor:" + (onclick ? "pointer" : "default") + ";" + glow + "'>" + (content||"") + "</div>";
            }
        }
        html += "</div></div>";

        var hp = p.stats.hp || 0;
        var maxHp = p.stats.maxHp || 100;
        var hpPct = maxHp > 0 ? Math.round((hp / maxHp) * 100) : 0;

        var topBar = "<div style='padding:4px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;'>" +
            "<button onclick='SherwoodUI._leaveDungeon()' style='background:transparent;border:none;cursor:pointer;padding:0;width:36px;height:36px;'><img src='assets/all_buttons/back.png' style='width:100%;height:100%;object-fit:contain;'></button>" +
            "<div style='color:#70a0e0;font-weight:bold;font-size:0.85em;'>" + (d.id||"") + " " + (d.level||1) + "</div>" +
            "<div style='position:relative;width:200px;height:100px;'>" +
            "<img src='assets/interface/life_scale.png' style='width:100%;height:100%;position:absolute;top:0;left:0;z-index:1;'>" +
            "<div style='position:absolute;top:67px;left:18px;right:18px;bottom:9px;overflow:hidden;z-index:0;'>" +
            "<div style='background:url(assets/interface/life_interface_asset_horizontal_progress_bar.jpeg) left/auto 100%;height:100%;width:" + hpPct + "%;transition:width 0.5s;'></div>" +
            "</div>" +
            "<span style='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.65em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;'>" + hp + "/" + maxHp + "</span>" +
            "</div></div>" +
            "<div style='background:rgba(0,0,0,0.5);padding:3px;text-align:center;flex-shrink:0;'><span style='font-size:10px;color:#aaa;'>" + (d.monstersKilled||0) + "/" + (d.totalMonsters||0) + " | " + (d.monstersKilled >= d.totalMonsters ? "ВЫХОД ОТКРЫТ" : "УБЕЙ ВСЕХ") + "</span></div>";

        if (this._screenLayer) { 
            this._screenLayer.innerHTML = "<div style='min-height:100%;background:rgba(0,0,0,0.4);display:flex;flex-direction:column;'>" + topBar + "<div style='flex:1;overflow:auto;'>" + html + "</div></div>"; 
            this._screenLayer.style.display = "block"; 
        }
    },

    _dungeonMove: function(tx, ty) {
        var d = Sherwood.Dungeon.getDungeon(); 
        if (!d) return;
        
        var res = Sherwood.Dungeon.move(tx, ty);
        if (!res || !res.ok) return;
        
        this._renderDungeon();
        this.updateDisplay();
        
        if (res.type === 'battle') { 
            this._pauseMusic(); 
            Sherwood.Combat.start(res.monsterId, res.boss, 'dungeon'); 
            var self = this;
            setTimeout(function() { self._showCombatScreen(); }, 400); 
            return; 
        }
        
        if (res.type === 'chest' || res.type === 'altar' || res.type === 'cauldron' || res.type === 'potion' || res.type === 'lootBag') { 
            this._showInteractButton(res.type); 
            return; 
        }
        
        if (res.type === 'exit') { 
            this._stopMusic(); 
            var reward = Sherwood.Dungeon.complete(); 
            this._afterRewardAction = function() { 
                SherwoodUI._playMusic('main_theme'); 
                SherwoodUI.showDungeon(); 
            }; 
            this._showVictoryScreen(reward); 
            return; 
        }
        
        if (res.type === 'exit_locked') { 
            this._showToast('Закрыто! Убейте всех монстров!'); 
        }
    },

    _leaveDungeon: function() {
        Sherwood.Dungeon.leave();
        this._stopMusic();
        this._playMusic('main_theme');
        this.showDungeon();
    },

    _showInteractButton: function(type) {
        var self = this;
        var d = Sherwood.Dungeon.getDungeon();
        if (!d) return;
        
        var dungId = d.id || 'forest';
        var icon = '';
        if (type === 'altar') icon = dungId === 'forest' ? 'assets/interface/altar_of_the_first_dungeon.png' : dungId === 'swamp' ? 'assets/interface/altar_of_the_second_dungeon.png' : 'assets/interface/the_third_altar_of_the_dungeon.png';
        else if (type === 'cauldron') icon = dungId === 'forest' ? 'assets/interface/cauldron_first_dungeon.png' : dungId === 'swamp' ? 'assets/interface/cauldron_of_the_second_dungeon.png' : 'assets/interface/the_third_cauldron_of_the_dungeon.png';
        else if (type === 'potion') icon = 'assets/interface/resource_life_potion.png';
        else if (type === 'chest') icon = dungId === 'forest' ? 'assets/interface/locked_chest_first_dungeon.png' : dungId === 'swamp' ? 'assets/interface/locked_chest_second_dungeon.png' : 'assets/interface/locked_chest_third_dungeon.png';
        else if (type === 'lootBag') icon = 'assets/interface/loot_bag_of_beasts.png';
        
        var oldBtn = document.getElementById('interact-btn');
        if (oldBtn) oldBtn.remove();
        
        var btn = document.createElement('div');
        btn.id = 'interact-btn';
        btn.style.cssText = 'position:absolute;bottom:20%;left:50%;transform:translateX(-50%);z-index:100;width:80px;height:80px;background:rgba(0,0,0,0.8);border:3px solid #c9a040;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;';
        btn.innerHTML = '<img src="' + icon + '" style="width:56px;height:56px;object-fit:contain;">';
        
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            btn.remove();
            if (type === 'altar') self._collectAltar();
            else if (type === 'cauldron') self._collectCauldron();
            else if (type === 'potion') self._collectPotion();
            else if (type === 'chest') self._collectChest();
            else if (type === 'lootBag') self._collectLootBag();
        });
        
        this._screenLayer.appendChild(btn);
    },

    _collectAltar: function() {
        var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
        var cell = d.grid[d.py][d.px]; if (!cell || !cell.altar || cell.altarCollected) return;
        var scrolls = 1 + Math.floor(Math.random() * 3);
        var silver = 100 + Math.floor(Math.random() * 200);
        Sherwood.addResource('scrolls', scrolls);
        Sherwood.addResource('silver', silver);
        cell.altarCollected = true;
        this._playSound('altar');
        this._playSound('loot_fly');
        this._showFlyingLoot([{ icon: 'assets/interface/resource_appearance_crafting_tablet.png', text: '+' + scrolls }, { icon: 'assets/interface/silver_plaque.png', text: '+' + silver }]);
        this.updateDisplay();
        Sherwood.Dungeon._saveDungeon();
        this._renderDungeon();
    },

    _collectCauldron: function() {
        var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
        var cell = d.grid[d.py][d.px]; if (!cell || !cell.cauldron || cell.cauldronCollected) return;
        var gold = 1 + Math.floor(Math.random() * 3);
        var silver = 50 + Math.floor(Math.random() * 150);
        Sherwood.addResource('gold', gold);
        Sherwood.addResource('silver', silver);
        cell.cauldronCollected = true;
        this._playSound('cauldron');
        this._playSound('loot_fly');
        this._showFlyingLoot([{ icon: 'assets/interface/gold_plate.png', text: '+' + gold }, { icon: 'assets/interface/silver_plaque.png', text: '+' + silver }]);
        this.updateDisplay();
        Sherwood.Dungeon._saveDungeon();
        this._renderDungeon();
    },

    _collectPotion: function() {
        var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
        var cell = d.grid[d.py][d.px]; if (!cell || !cell.potion || cell.potionCollected) return;
        var p = Sherwood.getPlayer();
        if (p.stats.hp >= p.stats.maxHp) { this._showToast('HP уже полное!'); return; }
        var heal = d.id === 'cave' ? Math.floor(p.stats.maxHp * 0.4) : Math.floor(p.stats.maxHp * 0.2);
        p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
        cell.potionCollected = true;
        cell.potion = false;
        this._playSound('potion');
        this._playSound('loot_fly');
        this._showFlyingLoot([{ icon: 'assets/interface/icon_health.png', text: '+' + heal + ' HP' }]);
        Sherwood.saveGame();
        this.updateDisplay();
        Sherwood.Dungeon._saveDungeon();
        this._renderDungeon();
    },

    _collectChest: function() {
        var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
        var cell = d.grid[d.py][d.px]; if (!cell || !cell.chest || cell.looted) return;
        cell.looted = true;
        d.chestsOpened++;
        var lootReward = cell.lootReward || cell.reward || {};
        var g = lootReward.gold || 1;
        var s = lootReward.silver || 200;
        var exp = lootReward.exp || 0;
        if (g) Sherwood.addResource('gold', g);
        if (s) Sherwood.addResource('silver', s);
        if (exp) Sherwood.addExp(exp);
        if (Sherwood.Daily) Sherwood.Daily.updateProgress('open_chests', 1);
        this._playSound('chest_open');
        this._playSound('loot_fly');
        this._showFlyingLoot([{ icon: 'assets/interface/gold_plate.png', text: '+' + g }, { icon: 'assets/interface/silver_plaque.png', text: '+' + s }]);
        this.updateDisplay();
        Sherwood.Dungeon._saveDungeon();
        this._renderDungeon();
    },

    _collectLootBag: function() {
        var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
        var cell = d.grid[d.py][d.px]; if (!cell || !cell.lootBag || cell.lootCollected) return;
        cell.lootCollected = true;
        var lootReward = cell.lootReward || {};
        var exp = lootReward.exp || 0;
        var gold = lootReward.gold || 0;
        var silver = lootReward.silver || 0;
        if (exp) Sherwood.addExp(exp);
        if (gold) Sherwood.addResource('gold', gold);
        if (silver) Sherwood.addResource('silver', silver);
        this._playSound('bag_drop');
        this._playSound('loot_fly');
        this.updateDisplay();
        Sherwood.Dungeon._saveDungeon();
        this._renderDungeon();
    },

    _showFlyingLoot: function(items) {
        this._playSound('loot_fly');
        var self = this;
        for (var i = 0; i < items.length; i++) {
            (function(item, index) {
                var el = document.createElement('div');
                el.style.cssText = 'position:absolute;bottom:25%;left:50%;z-index:200;width:40px;height:40px;background:rgba(0,0,0,0.8);border:1px solid #c9a040;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all 0.8s ease-out;';
                el.innerHTML = '<img src="' + item.icon + '" style="width:24px;height:24px;object-fit:contain;"><span style="color:#ffd700;font-size:0.5em;">' + item.text + '</span>';
                self._screenLayer.appendChild(el);
                setTimeout(function() { el.style.left = '70%'; el.style.top = '10%'; el.style.bottom = 'auto'; el.style.opacity = '0'; el.style.transform = 'scale(0.5)'; }, 50 + index * 100);
                setTimeout(function() { el.remove(); }, 900 + index * 100);
            })(items[i], i);
        }
    },    _showBattleScreen: function(enemyData, mode, modeTitle, extraInfo, onAttack, onFlee, customBg) {
        var e = enemyData, p = Sherwood.getPlayer();
        var ehp = e.maxHp > 0 ? Math.round((e.hp / e.maxHp) * 100) : 100;
        var php = p.stats.maxHp > 0 ? Math.round((p.stats.hp / p.stats.maxHp) * 100) : 100;
        var activeSkin = p.activeSkin || 'skin1_01';
        var imgPath = (mode === 'arena') ? e.image : 'assets/all_beasts/' + e.image;
        
        var h = '<div style="text-align:center;">';
        
        // Статы врага
        h += '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:2px;color:#fff;font-size:0.9em;font-weight:bold;text-shadow:0 0 4px #000;">';
        h += '<span style="color:#f44336;">АТК ' + (e.attack || '?') + '</span>';
        h += '<span style="color:#2196f3;">ЗЩТ ' + (e.defense || '?') + '</span>';
        h += '</div>';
        
        h += '<div style="color:#f44336;font-weight:bold;font-size:1.2em;margin-bottom:2px;text-shadow:0 0 4px #000;">' + e.name + '</div>';
        
        // HP врага
        h += '<div style="position:relative;width:250px;height:120px;margin:0 auto 4px;">';
        h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;">';
        h += '<div style="position:absolute;top:80px;left:23px;right:23px;bottom:12px;overflow:hidden;z-index:0;">';
        h += '<div id="enemy-hp-bar" style="background:url(assets/interface/filling_the_poisoned_health_bar.jpeg) left/auto 100%;height:100%;width:' + ehp + '%;transition:width 0.5s ease-out;"></div>';
        h += '</div>';
        h += '<span id="enemy-hp-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:1.1em;font-weight:bold;text-shadow:0 0 6px #000;z-index:2;">' + e.hp + '/' + e.maxHp + '</span></div>';
        
        // Карта врага
        h += '<div style="margin:4px 0;position:relative;display:inline-block;">';
        h += '<img src="' + imgPath + '" id="enemy-card" style="width:280px;height:280px;object-fit:contain;position:relative;z-index:1;border-radius:16px;" onerror="this.style.display=&quot;none&quot;">';
        h += '<div id="enemy-hit-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;pointer-events:none;display:none;"></div>';
        h += '<div id="damage-numbers" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;pointer-events:none;"></div>';
        h += '</div>';
        
        // Кнопки: скилы + удар
        var skills = Sherwood.Combat ? Sherwood.Combat.getSkills() : {};
        var unlockedSkills = [];
        for (var id in skills) { if (skills[id].unlocked && !skills[id].passive) unlockedSkills.push(skills[id]); }
        
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:4px;margin:4px auto;flex-wrap:nowrap;overflow-x:auto;max-width:340px;position:relative;">';
        for (var i = 0; i < unlockedSkills.length; i++) {
            var sk = unlockedSkills[i];
            var cd = sk.currentCooldown || 0;
            h += '<button onclick="SherwoodUI._useSkill(\'' + sk.id + '\')" style="background:rgba(201,168,76,0.2);border:1px solid #c9a040;border-radius:50%;width:42px;height:42px;cursor:pointer;padding:2px;position:relative;' + (cd > 0 ? 'opacity:0.4;' : '') + '">';
            h += '<img src="' + sk.icon + '" style="width:100%;height:100%;object-fit:contain;border-radius:50%;" onerror="this.src=\'assets/skills/skill_shot_normal.png\'">';
            if (cd > 0) h += '<span style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.7em;font-weight:bold;text-shadow:0 0 4px #000;">' + cd + '</span>';
            h += '</button>';
        }
        h += '</div>';
        
        // Кнопка удара — отдельная строка
        h += '<div style="text-align:center;margin:4px 0;"><button onclick="' + onAttack + '" style="background:url(assets/skills/skill_shot_normal.png) center/contain no-repeat;width:56px;height:56px;border:3px solid #c9a040;border-radius:50%;cursor:pointer;display:inline-block;"></button></div>';
        
        // HP героя
        h += '<div style="position:relative;width:250px;height:120px;margin:2px auto;">';
        h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;">';
        h += '<div style="position:absolute;top:80px;left:23px;right:23px;bottom:12px;overflow:hidden;z-index:0;">';
        h += '<div id="player-hp-bar" style="background:url(assets/interface/life_interface_asset_horizontal_progress_bar.jpeg) left/auto 100%;height:100%;width:' + php + '%;transition:width 0.5s ease-out;"></div>';
        h += '</div>';
        h += '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:1.1em;font-weight:bold;text-shadow:0 0 6px #000;z-index:2;">' + p.stats.hp + '/' + p.stats.maxHp + '</span></div>';
        
        // Статы героя
        h += '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:2px;color:#fff;font-size:0.9em;font-weight:bold;text-shadow:0 0 4px #000;">';
        h += '<span style="color:#f44336;">АТК ' + p.stats.attack + '</span>';
        h += '<span style="color:#2196f3;">ЗЩТ ' + p.stats.defense + '</span>';
        h += '<span style="color:#4caf50;">HP ' + p.stats.maxHp + '</span>';
        h += '</div>';
        
        h += '<div id="battle-dialog" style="background:rgba(0,0,0,0.75);border:1px solid #555;border-radius:8px;padding:5px;margin:2px 4%;min-height:40px;max-height:40px;overflow-y:auto;color:#aaa;font-size:0.65em;text-align:left;line-height:1.3;"></div>';
        h += '</div>';
        
        var bgKey = customBg || 'dungeon_fight';
        if (!customBg && mode === 'dungeon' && Sherwood.Dungeon && Sherwood.Dungeon.getDungeon()) {
            var d = Sherwood.Dungeon.getDungeon();
            if (d.id === 'forest') {
                this.container.style.background = "url('assets/backgrounds/wallpaper_subway_1.png') center/cover no-repeat";
                bgKey = '';
            } else if (d.id === 'swamp') {
                this.container.style.background = "url('assets/backgrounds/wallpaper_subway_2.png') center/cover no-repeat";
                bgKey = '';
            } else if (d.id === 'cave') {
                this.container.style.background = "url('assets/backgrounds/wallpaper_subway_3.jpeg') center/cover no-repeat";
                bgKey = '';
            }
        }
        
        this._openScreen('', bgKey, h);
    },

    _useSkill: function(skillId) {
        if (!Sherwood.Combat) return;
        this._playHitSounds();
        var r = Sherwood.Combat.useSkill(skillId);
        if (!r) return;
        if (r.error) { this._showDialog(r.error, '#ff9800'); return; }
        this._handleCombatResult(r);
    },

    _showDialog: function(msg, color) { 
        var dlg = document.getElementById('battle-dialog'); 
        if (dlg) { dlg.innerHTML += '<div style="color:' + (color||'#fff') + ';margin:1px 0;">' + msg + '</div>'; dlg.scrollTop = dlg.scrollHeight; } 
    },

    _showDamageNumber: function(dmg, isCrit) {
        var container = document.getElementById('damage-numbers');
        if (!container) return;
        var el = document.createElement('div');
        el.style.cssText = 'position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);color:' + (isCrit ? '#ff6a00' : '#ffd700') + ';font-size:' + (isCrit ? '1.8em' : '1.2em') + ';font-weight:bold;text-shadow:0 0 8px #000;z-index:10;pointer-events:none;';
        el.textContent = (isCrit ? '💥 ' : '') + dmg;
        container.appendChild(el);
        setTimeout(function() { el.remove(); }, 1000);
    },

    _showCriticalHitAnim: function() {
        var overlay = document.getElementById('enemy-hit-overlay');
        if (!overlay) return;
        overlay.style.display = 'block';
        setTimeout(function() { overlay.style.display = 'none'; }, 800);
    },

    _hitEnemyCard: function() {
        var card = document.getElementById('enemy-card');
        if (!card) return;
        card.style.transform = 'translateX(2px) scale(0.95)';
        card.style.filter = 'brightness(1.3)';
        setTimeout(function() { card.style.transform = ''; card.style.filter = ''; }, 200);
    },

    _updateEnemyHP: function(hp, max) { 
        var bar = document.getElementById('enemy-hp-bar');
        var txt = document.getElementById('enemy-hp-text'); 
        if (bar) { var pct = max > 0 ? Math.round((hp / max) * 100) : 0; bar.style.width = pct + '%'; } 
        if (txt) txt.textContent = hp + '/' + max; 
    },

    _showCombatScreen: function() { 
        var b = Sherwood.Combat.getState(); 
        if (!b) { this._renderDungeon(); return; } 
        this._showBattleScreen(
            { name: b.enemyName, image: b.enemyImage, hp: b.enemyHp, maxHp: b.enemyMaxHp }, 
            "dungeon", 
            (b.isBoss ? "БОСС: " : "") + b.enemyName, 
            "", 
            "SherwoodUI._combatAttack()", 
            "SherwoodUI._combatFlee()"
        ); 
    },

    _combatAttack: function() { 
        this._playHitSounds(); 
        var r = Sherwood.Combat.attack();
        if (!r) return;
        if (r.error) { this._showDialog(r.error, '#ff9800'); return; }
        this._handleCombatResult(r);
    },

    _combatFlee: function() { 
        var r = Sherwood.Combat.flee(); 
        if (r.success) { this._resumeMusic(); this._leaveDungeon(); return; } 
        if (r.lose) { this._showDialog('Поражение...', '#f44336'); this._resumeMusic(); var self = this; setTimeout(function() { self._leaveDungeon(); }, 1200); return; } 
        this._showDialog('Побег не удался! Враг: -' + r.damage, '#ff9800'); 
        this._showCombatScreen(); 
    },

    _handleCombatResult: function(r) {
        if (!r) return;
        
        if (r.win) {
            if (r.exp) Sherwood.addExp(r.exp);
            if (r.gold) { Sherwood.addResource('gold', r.gold); Sherwood.addResource('silver', Math.floor(r.gold * 2)); }
            Sherwood.saveGame();
            if (Sherwood.Daily) { Sherwood.Daily.updateProgress('kill_beasts', 1); Sherwood.Daily.updateProgress('collect_loot', 1); }
            if (Sherwood.Dungeon && Sherwood.Dungeon.killMonster) {
                Sherwood.Dungeon.killMonster({ exp: r.exp, gold: r.gold, silver: Math.floor(r.gold * 2) });
            }
            if (Sherwood.Bestiary && r.enemyImage) Sherwood.Bestiary.registerKill(r.enemyImage);
            this._resumeMusic();
            this.updateDisplay();
            this._renderDungeon();
            return;
        }
        
        if (r.playerDead) {
            this._resumeMusic();
            this.updateDisplay();
            var scrolls = Math.random() < 0.08 ? 1 : 0;
            if (scrolls) Sherwood.addResource('scrolls', scrolls);
            this._pendingRewards = { exp: Math.floor(r.exp || 10), silver: Math.floor(r.gold || 50), scrolls: scrolls };
            this._afterRewardAction = function() { SherwoodUI._leaveDungeon(); };
            this._showDefeatScreen(this._pendingRewards);
            return;
        }
        
        this._hitEnemyCard();
        this._showDamageNumber(r.damage, r.crit);
        if (r.crit) this._showCriticalHitAnim();
        this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        this._showDialog((r.crit ? 'КРИТ! ' : '') + 'Урон: ' + r.damage, r.crit ? '#ff6a00' : '#fff');
        if (r.heal > 0) this._showDialog('+ ' + r.heal + ' HP', '#4caf50');
        if (r.enemyDamage) { var self = this; setTimeout(function() { self._showDialog('Враг бьёт: ' + r.enemyDamage, '#f44336'); self.updateDisplay(); }, 700); }
        this.updateDisplay();
        var self = this;
        setTimeout(function() { self._showCombatScreen(); }, 1000);
    },    quest: function() {
        this._playSound('click');
        if (!Sherwood.Quests) { this._showPlaceholder('Квесты', 'quests'); return; }
        
        var prog = Sherwood.Quests.getProgress();
        var currentChapter = prog.currentChapter || 1;
        var ch = Sherwood.Quests.getChapter(currentChapter);
        if (!ch) { this._showPlaceholder('Квесты', 'quests'); return; }
        
        var completed = prog.completed && prog.completed.indexOf(ch.id) !== -1;
        var cooldown = Sherwood.Quests.isOnCooldown();
        var cdRemain = Sherwood.Quests.getCooldownRemaining();
        var isActive = Sherwood.Quests._currentChapter && Sherwood.Quests._currentChapter.id === ch.id && Sherwood.Quests._currentEnemy;
        
        var displayEnemy;
        if (completed) displayEnemy = ch.boss;
        else if (isActive) displayEnemy = Sherwood.Quests._currentEnemy;
        else displayEnemy = ch.enemies[0];
        
        var h = '';
        h += '<div style="text-align:center;">';
        h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:4px;">Глава ' + ch.id + ' — ' + ch.name + '</div>';
        h += '<div style="color:#fff;font-size:1em;font-weight:bold;margin-bottom:4px;">' + displayEnemy.name + '</div>';
        h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:20px;">HP ' + displayEnemy.hp + ' | АТК ' + displayEnemy.atk + ' | ЗЩТ ' + displayEnemy.def + '</div>';
        h += '<img src="assets/all_beasts/' + displayEnemy.image + '" style="width:210px;height:210px;object-fit:contain;">';
        
        if (completed) {
            h += '<div style="color:#4caf50;font-size:1em;font-weight:bold;">Пройдено</div>';
        } else if (cooldown) {
            h += '<div style="color:#ff9800;font-size:1em;margin-bottom:8px;">Перезарядка: ' + cdRemain + ' мин.</div>';
        } else if (isActive) {
            h += '<button onclick="SherwoodUI._showQuestBattle()" style="background:#c9a040;border:none;border-radius:8px;padding:12px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">В бой</button>';
        } else {
            h += '<button onclick="SherwoodUI._startQuest(' + ch.id + ')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">В бой</button>';
        }
        h += '</div>';
        
        this._openScreenScrollable('Квесты', 'quests', h);
    },

    _startQuest: function(id) { 
        var r = Sherwood.Quests.startChapter(id); 
        if (!r.success) { this._showToast(r.reason || 'Ошибка'); return; } 
        this._stopMusic(); 
        this._showQuestBattle(); 
    },

    _showQuestBattle: function() { 
        var e = Sherwood.Quests._currentEnemy;
        if (!e) { this.quest(); return; }
        this._showBattleScreen(
            { name: e.name, image: e.image, hp: e.hp, maxHp: e.maxHp }, 
            'quest', 
            '', 
            '', 
            "SherwoodUI._questAttack()", 
            "SherwoodUI._questFlee()"
        ); 
    },

    _questAttack: function() { 
        this._playHitSounds(); 
        var r = Sherwood.Quests.attack();
        if (!r) return;
        
        this._hitEnemyCard();
        this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        this._showDialog((r.crit ? 'КРИТ! ' : '') + 'Вы нанесли ' + r.damage + ' урона', r.crit ? '#ff6a00' : '#fff');
        
        if (r.chapterComplete) {
            this._stopMusic();
            var scrolls = Math.random() < 0.25 ? 1 + Math.floor(Math.random() * 3) : 0;
            if (scrolls) Sherwood.addResource('scrolls', scrolls);
            this._pendingRewards = { exp: r.rewards.exp, gold: r.rewards.gold, silver: r.rewards.silver, scrolls: scrolls };
            this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.quest(); };
            this._showVictoryScreen(this._pendingRewards);
            return;
        }
        
        if (r.stageComplete) {
            var self = this;
            setTimeout(function() { self._showQuestBattle(); }, 1000);
            return;
        }
        
        if (r.playerDead) {
            this._stopMusic();
            this._pendingRewards = { exp: 10, silver: 50 };
            this._afterRewardAction = function() { SherwoodUI.quest(); };
            this._showDefeatScreen(this._pendingRewards);
            return;
        }
        
        if (r.enemyDamage) {
            var self = this;
            setTimeout(function() { self._showDialog('Враг нанёс ' + r.enemyDamage + ' урона', '#f44336'); }, 700);
        }
        
        var self = this;
        setTimeout(function() { self._showQuestBattle(); }, 1000);
    },

    _questFlee: function() { 
        if (!confirm('Побег сбросит прогресс. Убежать?')) return;
        this._stopMusic(); 
        Sherwood.Quests.flee(); 
        this.quest(); 
    },

    tavern: function() {
        this._playSound('click');
        if (!Sherwood.Tavern) { this._showPlaceholder('Таверна', 'tavern'); return; }
        
        var completedCount = Sherwood.Tavern.getCompletedCount();
        var dailyDone = Sherwood.Tavern.getDailyQuestsDone();
        var dailyMax = Sherwood.Tavern.getMaxDailyQuests();
        var active = Sherwood.Tavern.getCurrentQuest();
        var cooldown = Sherwood.Tavern.isOnCooldown();
        var cdRemain = Sherwood.Tavern.getCooldownRemaining();
        
        var h = '';
        h += '<div style="display:flex;flex-direction:column;align-items:center;gap:32px;padding:20px;">';
        h += '<img src="assets/interface/old_huntsman_bertram.png" style="width:260px;height:260px;object-fit:contain;">';
        
        if (active && active.quest) {
            var q = active.quest;
            h += '<div style="text-align:center;">';
            h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;">' + q.name + '</div>';
            h += '<div style="color:#aaa;font-size:0.9em;">' + q.desc + '</div>';
            h += '<div style="color:#f44336;font-size:0.9em;">' + q.enemy.name + ' (HP ' + q.enemy.hp + ')</div>';
            h += '<button onclick="SherwoodUI._tavernBattle()" style="margin-top:12px;background:#c9a040;border:none;border-radius:12px;padding:14px 40px;color:#000;font-weight:bold;cursor:pointer;font-size:1em;">В бой</button>';
            h += '</div>';
        } else if (cooldown) {
            h += '<div style="text-align:center;color:#ff9800;">Перезарядка: ' + cdRemain + ' мин.</div>';
        } else {
            var nextQuest = Sherwood.Tavern._getQuestById('tavern_' + (completedCount + 1));
            if (!nextQuest) { this._showToast('Нет доступных квестов'); return; }
            h += '<div style="text-align:center;">';
            h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;">' + nextQuest.name + '</div>';
            h += '<div style="color:#aaa;font-size:0.9em;">' + nextQuest.desc + '</div>';
            h += '<div style="color:#f44336;font-size:0.9em;">' + nextQuest.enemy.name + ' (HP ' + nextQuest.enemy.hp + ')</div>';
            if (dailyDone < dailyMax && completedCount < 100) {
                h += '<button onclick="SherwoodUI._tavernStart()" style="margin-top:12px;background:#c9a040;border:none;border-radius:12px;padding:14px 40px;color:#000;font-weight:bold;cursor:pointer;font-size:1em;">В бой</button>';
            }
            h += '</div>';
        }
        
        h += '<div style="color:#e0c080;">Выполнено: ' + completedCount + '/100 | Сегодня: ' + dailyDone + '/' + dailyMax + '</div>';
        h += '</div>';
        
        this._openScreenScrollable('Таверна', 'tavern', h);
    },

    _tavernStart: function() {
        var result = Sherwood.Tavern.startQuest();
        if (!result.success) { this._showToast(result.reason); return; }
        this._stopMusic();
        this._showTavernBattle();
    },

    _tavernBattle: function() { 
        this._stopMusic(); 
        this._showTavernBattle(); 
    },

    _showTavernBattle: function() {
        var active = Sherwood.Tavern.getCurrentQuest();
        if (!active || !active.quest) { this.tavern(); return; }
        var e = active.quest.enemy;
        if (!e.maxHp) e.maxHp = e.hp || 100;
        this._showBattleScreen(
            { name: e.name, image: e.image, hp: e.hp, maxHp: e.maxHp }, 
            'tavern', 
            '', 
            '', 
            "SherwoodUI._tavernBattleAttack()", 
            "SherwoodUI._tavernCancel()"
        );
    },

    _tavernBattleAttack: function() {
        this._playHitSounds();
        var r = Sherwood.Tavern.attackQuest();
        if (!r) { this.tavern(); return; }
        
        this._hitEnemyCard();
        this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        this._showDialog((r.crit ? 'КРИТ! ' : '') + 'Вы: ' + r.damage + ' урона', r.crit ? '#ff6a00' : '#fff');
        
        if (r.win) {
            this._stopMusic();
            this.updateDisplay();
            this._showToast('Победа! +' + r.rewards.exp + 'XP +' + r.rewards.gold + 'G');
            var self = this;
            setTimeout(function() { self.tavern(); }, 1500);
            return;
        }
        
        if (r.playerDead) {
            this._stopMusic();
            var self = this;
            setTimeout(function() { self.tavern(); }, 1500);
            return;
        }
        
        var self = this;
        setTimeout(function() {
            self._showDialog('Враг: ' + r.enemyDamage + ' урона', '#f44336');
            setTimeout(function() { self._showTavernBattle(); }, 800);
        }, 700);
        
        this.updateDisplay();
    },

    _tavernCancel: function() { 
        this._stopMusic(); 
        Sherwood.Tavern.cancelQuest(); 
        this.tavern(); 
    },        daily: function() { 
        this._playSound('click'); 
        if (!Sherwood.Daily) { this._showPlaceholder('Задания','daily'); return; } 
        
        var dailyQuests = Sherwood.Daily.getDailyQuests();
        var dailyCompleted = Sherwood.Daily.getDailyCompleted();
        var p = Sherwood.getPlayer();
        var currentChapter = p.questProgress ? (p.questProgress.currentChapter || 1) : 1;
        var chapterQuests = Sherwood.Daily.getChapterQuests(currentChapter);
        var chapterCompleted = Sherwood.Daily.getChapterCompleted();
        
        var html = '';
        
        var t1b = (!SherwoodUI._dailyTab || SherwoodUI._dailyTab === 1) ? '#c9a040' : 'rgba(255,255,255,0.1)';
        var t1c = (!SherwoodUI._dailyTab || SherwoodUI._dailyTab === 1) ? '#000' : '#fff';
        var t2b = (SherwoodUI._dailyTab === 2) ? '#c9a040' : 'rgba(255,255,255,0.1)';
        var t2c = (SherwoodUI._dailyTab === 2) ? '#000' : '#fff';
        
        html += '<div style="display:flex;gap:4px;margin-bottom:8px;flex-shrink:0;">';
        html += '<button onclick="SherwoodUI._dailyTab=1;SherwoodUI.daily();" style="flex:1;background:' + t1b + ';border:1px solid #555;border-radius:6px;padding:8px;color:' + t1c + ';cursor:pointer;font-size:0.8em;font-weight:bold;">Ежедневные</button>';
        html += '<button onclick="SherwoodUI._dailyTab=2;SherwoodUI.daily();" style="flex:1;background:' + t2b + ';border:1px solid #555;border-radius:6px;padding:8px;color:' + t2c + ';cursor:pointer;font-size:0.8em;font-weight:bold;">Глава ' + currentChapter + '</button>';
        html += '</div>';
        
        var frameImage = (!SherwoodUI._dailyTab || SherwoodUI._dailyTab === 1) 
            ? 'assets/interface/tasks_visual.png' 
            : 'assets/interface/tasks_chapters_visual.png';
        
        var isDaily = (!SherwoodUI._dailyTab || SherwoodUI._dailyTab === 1);
        var quests = isDaily ? dailyQuests : chapterQuests;
        var completed = isDaily ? dailyCompleted : chapterCompleted;
        
        html += '<div style="display:flex;flex-direction:column;align-items:center;">';
        
        if (!quests || quests.length === 0) {
            html += '<div style="color:#e0c080;font-weight:bold;font-size:1em;padding:20px;">Нет заданий</div>';
        }
        
        for (var i = 0; i < quests.length; i++) {
            var q = quests[i];
            var claimed = completed.indexOf(q.id) !== -1;
            var progressPct = q.target > 0 ? Math.round((q.progress || 0) / q.target * 100) : 0;
            
            html += '<div style="position:relative;width:90%;max-width:400px;height:110px;overflow:hidden;margin-bottom:4px;">';
            html += '<img src="' + frameImage + '" style="position:absolute;left:0;width:100%;height:auto;top:50%;transform:translateY(-50%);">';
            
            if (isDaily) {
                html += '<div style="position:absolute;top:8px;left:20px;right:20px;bottom:8px;background:rgba(0,0,0,0.75);border-radius:8px;z-index:0;"></div>';
            }
            
            html += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 28px;box-sizing:border-box;z-index:1;">';
            html += '<div style="color:#fff;font-weight:900;font-size:0.8em;text-shadow:0 1px 3px #000;margin-bottom:1px;text-align:center;">' + q.name + '</div>';
            html += '<div style="color:#ddd;font-weight:700;font-size:0.6em;text-shadow:0 1px 2px #000;margin-bottom:2px;text-align:center;">' + q.desc + '</div>';
            
            html += '<div style="width:75%;background:rgba(0,0,0,0.7);border-radius:4px;height:8px;margin:2px 0;overflow:hidden;border:1px solid rgba(255,255,255,0.4);">';
            html += '<div style="background:' + (q.completed ? '#00ff00' : '#ffaa00') + ';height:100%;width:' + progressPct + '%;transition:width 0.5s;"></div>';
            html += '</div>';
            
            html += '<div style="color:#fff;font-weight:700;font-size:0.55em;text-shadow:0 1px 2px #000;margin-bottom:2px;text-align:center;">' + (q.progress || 0) + '/' + q.target + ' | <span style="color:#ffd700;">+' + q.reward.gold + ' зол.</span> <span style="color:#ffaa00;">+' + q.reward.exp + ' XP</span></div>';
            
            if (q.completed && !claimed) {
                html += '<button onclick="';
                if (isDaily) html += 'SherwoodUI._claimDaily(\'' + q.id + '\')';
                else html += 'SherwoodUI._claimChapter(' + currentChapter + ',\'' + q.id + '\')';
                html += '" style="background:#00c853;border:2px solid #fff;border-radius:20px;padding:4px 22px;color:#fff;font-weight:900;cursor:pointer;font-size:0.65em;">ГОТОВО</button>';
            } else if (claimed) {
                html += '<div style="color:#00ff00;font-weight:900;font-size:0.6em;">✓ ПОЛУЧЕНО</div>';
            }
            
            html += '</div>';
            html += '</div>';
        }
        
        html += '</div>';
        html += '<div id="daily-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:4px;"></div>';
        
        this._openScreenScrollable('Задания', 'daily', html);
    },

    _claimDaily: function(questId) { 
        var r = Sherwood.Daily.claimDailyReward(questId);
        var log = document.getElementById('daily-log'); 
        if (r.success) { 
            if (log) log.textContent = 'Награда получена!'; 
            this.updateDisplay(); 
            this._playSound('loot_fly');
        } else { 
            if (log) log.textContent = r.reason; 
        } 
        var self = this; 
        setTimeout(function() { self.daily(); }, 600); 
    },

    _claimChapter: function(chapterId, questId) { 
        var r = Sherwood.Daily.claimChapterReward(chapterId, questId);
        var log = document.getElementById('daily-log'); 
        if (r.success) { 
            if (log) log.textContent = 'Награда получена!'; 
            this.updateDisplay(); 
            this._playSound('loot_fly');
        } else { 
            if (log) log.textContent = r.reason; 
        } 
        var self = this; 
        setTimeout(function() { self.daily(); }, 600); 
    },

    portal: function() {
        this._playSound('click');
        if (!Sherwood.Portal) { this._showPlaceholder('Порталы', 'portal'); return; }
        if (Sherwood.Portal.isInPortal()) { this._showPortalBattle(); return; }
        
        var allPortals = Sherwood.Portal.getAllPortals();
        var arrowCount = (typeof Sherwood.Forge !== 'undefined' && Sherwood.Forge.getArrowCount) ? Sherwood.Forge.getArrowCount() : 0;
        var playerLevel = Sherwood.getPlayer().level || 1;
        
        var h = '';
        
        var iconMap = {
            1: 'invasion_portal.png',
            2: 'skull_spider_portal.png',
            3: 'portal_of_withering.png',
            4: 'portal_of_chains.png',
            5: 'lycanthrope_portal.png',
            6: 'scorpio_portal.png',
            7: 'portal_of_distortion.png'
        };
        
        for (var i = 0; i < allPortals.length; i++) {
            var portalData = allPortals[i];
            var iconFile = iconMap[portalData.id] || 'invasion_portal.png';
            var req = Sherwood.Portal.getRequirements(portalData.id);
            var canEnter = Sherwood.Portal.canEnter(portalData.id);
            
            h += '<div style="text-align:center;margin-bottom:32px;">';
            h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:10px;">' + portalData.name + '</div>';
            h += '<img src="assets/portal_beasts/visual_portals/' + iconFile + '" style="width:160px;height:160px;object-fit:contain;display:block;margin:0 auto 10px;">';
            h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:8px;">Стрел: ' + arrowCount + ' / ' + req.arrows + ' | Уровень: ' + playerLevel + ' / ' + req.level + '</div>';
            
            if (canEnter) {
                h += '<button onclick="SherwoodUI._enterPortal(' + portalData.id + ')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:0.95em;">В бой</button>';
            } else {
                h += '<button disabled style="background:#555;border:none;border-radius:8px;padding:12px 36px;color:#999;font-weight:bold;font-size:0.95em;">В бой</button>';
            }
            
            h += '</div>';
        }
        
        this._openScreenScrollable('Порталы', 'portal', h);
    },

    _enterPortal: function(id) { 
        var r = Sherwood.Portal.enterPortal(id); 
        if (!r.success) { this._showToast(r.reason); return; } 
        this._stopMusic(); 
        this._playSound('trap'); 
        this._showPortalBattle(); 
    },

    _showPortalBattle: function() {
        var battle = Sherwood.Portal.getCurrentBattle();
        if (!battle) { this.portal(); return; }
        
        var enemy = battle.enemy;
        if (!enemy.maxHp) enemy.maxHp = enemy.hp;
        
        var extraInfo = 'Волна ' + battle.level + '/' + battle.totalLevels;
        
        this._showBattleScreen(
            { name: enemy.name + (enemy.isBoss ? ' (БОСС)' : ''), image: enemy.image, hp: enemy.hp, maxHp: enemy.maxHp },
            'portal',
            battle.portal.name,
            extraInfo,
            'SherwoodUI._portalAttack()',
            'SherwoodUI._portalFlee()',
            battle.portal.bg || 'portal'
        );
    },

    _portalAttack: function() {
        this._playHitSounds();
        var r = Sherwood.Portal.portalAttack();
        if (!r) return;
        
        this._hitEnemyCard();
        this._showDamageNumber(r.damage, r.crit);
        this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        this._showDialog('Урон: ' + r.damage, '#fff');
        
        if (r.portalComplete) {
            this._playSound('victory');
            this._stopMusic();
            var scrolls = Math.random() < 0.3 ? 1 + Math.floor(Math.random() * 3) : 0;
            if (scrolls) Sherwood.addResource('scrolls', scrolls);
            this._pendingRewards = { exp: r.rewards.exp, gold: r.rewards.gold, silver: r.rewards.silver, scrolls: scrolls };
            this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.portal(); };
            this._showVictoryScreen(this._pendingRewards);
            return;
        }
        
        if (r.portalFailed) {
            this._stopMusic();
            this._pendingRewards = { exp: 10, silver: 50 };
            this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.portal(); };
            this._showDefeatScreen(this._pendingRewards);
            return;
        }
        
        if (r.dead && r.resurrected) {
            this._showDialog('Воскрешение за ' + r.cost.cost + ' ' + (r.cost.currency === 'gold' ? 'золота' : 'серебра'), '#ff9800');
            this.updateDisplay();
            var self = this;
            setTimeout(function() { self._showPortalBattle(); }, 1500);
            return;
        }
        
        if (r.enemyDead) {
            this._showDialog(r.enemyName + ' повержен!', '#4caf50');
            this.updateDisplay();
            var self = this;
            setTimeout(function() { self._showPortalBattle(); }, 1200);
            return;
        }
        
        if (r.enemyDamage) {
            var self = this;
            setTimeout(function() { self._showDialog(r.enemyName + ' бьёт: ' + r.enemyDamage, '#f44336'); }, 700);
        }
        
        this.updateDisplay();
        var self = this;
        setTimeout(function() { self._showPortalBattle(); }, 1000);
    },

    _portalFlee: function() {
        this._stopMusic();
        Sherwood.Portal.fleePortal();
        this._playMusic('main_theme');
        this.portal();
    },

    raid: function() { 
        this._playSound('click'); 
        if (!Sherwood.Raid) { this._showPlaceholder('Рейд','raid'); return; } 
        
        if (Sherwood.Raid.isRaidActive()) { this._showRaidBattle(); return; } 
        
        var raids = Sherwood.Raid.getAvailableRaids();
        var check = Sherwood.Raid.canJoinRaid();
        var player = Sherwood.getPlayer();
        var raidsToday = player.raid ? (player.raid.raidsToday || 0) : 0;
        
        var html = '';
        html += '<div style="text-align:center;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:4px;">Рейд</div>';
        html += '<div style="text-align:center;color:#aaa;font-size:0.75em;margin-bottom:16px;">Доступно: ' + (3 - raidsToday) + ' / 3</div>';
        
        for (var i = 0; i < raids.length; i++) {
            var raid = raids[i];
            html += '<div style="display:flex;flex-direction:column;align-items:center;margin-bottom:24px;">';
            html += '<div style="color:#e0c080;font-weight:bold;font-size:0.9em;margin-bottom:8px;">' + raid.name + '</div>';
            html += '<div style="position:relative;width:400px;height:400px;">';
            html += '<img src="assets/interface/raid_visual.png" style="width:100%;height:100%;object-fit:contain;">';
            html += '<img src="assets/all_beasts/' + (raid.image || 'image (55).png') + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:180px;height:180px;object-fit:contain;">';
            
            if (check.can) {
                html += '<button onclick="SherwoodUI._startRaid(' + i + ')" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:8px;padding:10px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">РЕЙД</button>';
            } else {
                html += '<div style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#555;border:none;border-radius:8px;padding:10px 30px;color:#999;font-weight:bold;font-size:0.9em;">РЕЙД</div>';
            }
            html += '</div>';
            html += '<div style="color:#aaa;font-size:0.7em;">HP ' + raid.hp.toLocaleString() + ' | АТК ' + raid.attack + '</div>';
            if (!check.can) html += '<div style="color:#f44336;font-size:0.65em;">' + check.reason + '</div>';
            html += '</div>';
        }
        
        this._openScreenScrollable('Рейд', 'raid', html);
    },

    _startRaid: function(i) { 
        this._stopMusic(); 
        var r = Sherwood.Raid.startRaid(i); 
        if (!r.success) { this._showToast(r.reason); this.raid(); return; } 
        this._playSound('trap'); 
        this._showRaidBattle(); 
    },

    _showRaidBattle: function() { 
        var s = Sherwood.Raid.getRaidStatus(); 
        if (!s) { this.raid(); return; } 
        
        var enemy = null; 
        for (var i = 0; i < s.enemies.length; i++) { 
            if (s.enemies[i].hp > 0) { enemy = s.enemies[i]; break; } 
        } 
        if (!enemy) { this._raidAttack(); return; } 
        
        this._showBattleScreen(
            { name: enemy.name, image: enemy.image, hp: enemy.hp, maxHp: enemy.maxHp },
            'raid',
            s.boss.name + ' - Этап ' + s.stageIndex + '/' + s.totalStages,
            '',
            'SherwoodUI._raidAttack()',
            'SherwoodUI._raidFlee()',
            'assets/interface/fight_raid.png'
        ); 
    },

    _raidAttack: function() { 
        this._playHitSounds(); 
        var r = Sherwood.Raid.raidAttack(); 
        if (!r) return; 
        
        this._hitEnemyCard();
        this._showDamageNumber(r.damage || 0, r.crit);
        this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        if (r.damage) this._showDialog('Вы нанесли ' + r.damage + ' урона', '#fff');
        
        if (r.raidComplete) { 
            this._stopMusic(); 
            this.updateDisplay(); 
            var scrolls = Math.random() < 0.3 ? 1 + Math.floor(Math.random() * 3) : 0; 
            if (scrolls) Sherwood.addResource('scrolls', scrolls); 
            this._pendingRewards = { exp: r.rewards.exp, gold: r.rewards.gold, silver: r.rewards.silver, scrolls: scrolls }; 
            this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.raid(); }; 
            this._showVictoryScreen(this._pendingRewards); 
            return;
        } 
        
        if (r.stageComplete) { 
            var self = this; 
            setTimeout(function() { self._showRaidBattle(); }, 1200); 
            return;
        } 
        
        if (r.playerDead) { 
            this._stopMusic(); 
            this._pendingRewards = { exp: 50, silver: 100 }; 
            this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.raid(); }; 
            this._showDefeatScreen(this._pendingRewards); 
            return;
        } 
        
        if (r.enemyDamage) { 
            var self = this; 
            setTimeout(function() { self._showDialog('Враг: ' + r.enemyDamage, '#f44336'); }, 700); 
        } 
        
        this.updateDisplay(); 
        var self = this; 
        setTimeout(function() { self._showRaidBattle(); }, 1000); 
    },

    _raidFlee: function() { 
        this._stopMusic(); 
        Sherwood.Raid.fleeRaid(); 
        this._playMusic('main_theme'); 
        this.raid(); 
    },    arena: function() {
        this._playSound('click');
        if (!Sherwood.Arena) { this._showPlaceholder('Арена', 'arena'); return; }
        if (Sherwood.Arena.isInMatch()) { this._showArenaBattle(); return; }
        
        var stats = Sherwood.Arena.getStats();
        var h = '';
        
        h += '<div style="text-align:center;">';
        h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:4px;">' + stats.rank + '</div>';
        h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:8px;">Побед: ' + stats.wins + ' | Поражений: ' + stats.losses + '</div>';
        
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:16px;">';
        h += '<img src="assets/interface/ticket_arena.png" style="width:24px;height:24px;object-fit:contain;">';
        h += '<span style="color:#fff;font-size:0.9em;font-weight:bold;">' + stats.tickets + ' / ' + stats.maxTickets + '</span>';
        h += '</div>';
        
        if (Sherwood.Arena.canBuyExtraTickets()) {
            h += '<button onclick="if(confirm(\'Купить 5 тикетов за 200 золота?\'))SherwoodUI._buyArenaTickets()" style="margin-bottom:16px;background:#ff9800;border:none;border-radius:6px;padding:8px 16px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.7em;">+5 тикетов (200 золота)</button>';
        }
        
        h += '<img src="assets/interface/blades_arena.png" style="width:200px;height:200px;object-fit:contain;display:block;margin:0 auto 20px;">';
        
        if (stats.tickets > 0) {
            h += '<button onclick="SherwoodUI._startArenaBattle()" style="background:#c9a040;border:none;border-radius:8px;padding:14px 40px;color:#000;font-weight:bold;cursor:pointer;font-size:1em;">В бой</button>';
        } else {
            h += '<div style="color:#f44336;font-size:0.9em;font-weight:bold;">Нет тикетов</div>';
        }
        h += '</div>';
        
        this._openScreenScrollable('Арена', 'arena', h);
    },

    _buyArenaTickets: function() {
        var r = Sherwood.Arena.buyExtraTickets();
        if (r.success) {
            this._showToast('+5 тикетов куплено!');
            this.arena();
        } else {
            this._showToast(r.reason);
        }
    },

    _startArenaBattle: function() {
        var r = Sherwood.Arena.startMatch();
        if (!r.success) {
            this._showToast(r.reason);
            this.arena();
            return;
        }
        
        this._stopMusic();
        this._showArenaBattle();
    },

    _showArenaBattle: function() {
        var state = Sherwood.Arena.getBattleState();
        if (!state) {
            this.arena();
            return;
        }
        
        var opp = state.opponent;
        var skinFile = opp.skin || 'assets/hero_skins/skin1_01.png';
        
        this._arenaCharge = 0;
        this._arenaChargeMax = 5000;
        this._arenaChargeStart = null;
        
        this._showArenaBattleScreen(
            { name: opp.name, image: skinFile, hp: opp.stats.hp, maxHp: opp.stats.maxHp },
            state.playerHp,
            state.playerMaxHp
        );
        
        this._arenaStartCharge();
        
        var self = this;
        setTimeout(function() { self._addArenaSwitchButton(); }, 100);
    },

    _showArenaBattleScreen: function(enemyData, playerHp, playerMaxHp) {
        var e = enemyData;
        var p = Sherwood.getPlayer();
        var ehp = e.maxHp > 0 ? Math.round((e.hp / e.maxHp) * 100) : 100;
        var php = playerMaxHp > 0 ? Math.round((playerHp / playerMaxHp) * 100) : 100;
        
        var h = '<div style="text-align:center;display:flex;flex-direction:column;height:100%;overflow:hidden;">';
        
        h += '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:2px;flex-shrink:0;">';
        h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_power.png" style="width:24px;height:24px;"><span style="color:#fff;font-size:0.75em;">' + p.stats.attack + '</span></div>';
        h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_defense.png" style="width:24px;height:24px;"><span style="color:#fff;font-size:0.75em;">' + p.stats.defense + '</span></div>';
        h += '</div>';
        
        h += '<div style="position:relative;width:250px;height:120px;margin:0 auto 2px;">';
        h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;">';
        h += '<div style="position:absolute;top:80px;left:23px;right:23px;bottom:12px;overflow:hidden;z-index:0;">';
        h += '<div id="enemy-hp-bar" style="background:url(assets/interface/filling_the_poisoned_health_bar.jpeg) left/auto 100%;height:100%;width:' + ehp + '%;"></div>';
        h += '</div>';
        h += '<span id="enemy-hp-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.65em;z-index:2;">' + e.hp + '/' + e.maxHp + '</span></div>';
        
        h += '<img src="' + e.image + '" id="enemy-card" style="width:280px;height:280px;object-fit:contain;margin:0 auto;" onerror="this.style.display=&quot;none&quot;">';
        h += '<div id="damage-numbers" style="position:relative;height:0;z-index:3;pointer-events:none;"></div>';
        
        h += '<div style="display:flex;justify-content:center;margin:2px 0;flex-shrink:0;">';
        h += '<button id="attack-btn" onmousedown="SherwoodUI._arenaAttack(); return false;" ontouchstart="SherwoodUI._arenaAttack(); return false;" style="background:url(assets/skills/skill_shot_normal.png) center/contain no-repeat;width:60px;height:60px;border:3px solid #c9a040;border-radius:50%;cursor:pointer;z-index:999;position:relative;"></button>';
        h += '</div>';
        
        h += '<div style="position:relative;width:250px;height:120px;margin:2px auto;">';
        h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;">';
        h += '<div style="position:absolute;top:80px;left:23px;right:23px;bottom:12px;overflow:hidden;z-index:0;">';
        h += '<div id="player-hp-bar" style="background:url(assets/interface/life_interface_asset_horizontal_progress_bar.jpeg) left/auto 100%;height:100%;width:' + php + '%;"></div>';
        h += '</div>';
        h += '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.65em;z-index:2;">HP ' + playerHp + '/' + playerMaxHp + '</span></div>';
        
        h += '<div id="battle-dialog" style="background:rgba(0,0,0,0.75);border:1px solid #555;border-radius:8px;padding:5px;margin:2px 4%;min-height:40px;max-height:40px;overflow-y:auto;color:#aaa;font-size:0.6em;text-align:left;"></div>';
        h += '</div>';
        
        this._openScreen('', 'arena', h);
    },

    _addArenaSwitchButton: function() {
        var oldBtn = document.getElementById('arena-switch-btn');
        if (oldBtn) oldBtn.remove();
        
        var btn = document.createElement('button');
        btn.id = 'arena-switch-btn';
        btn.style.cssText = 'position:absolute;bottom:100px;left:10px;z-index:100;background:rgba(0,0,0,0.7);border:2px solid #c9a040;border-radius:50%;cursor:pointer;padding:0;width:44px;height:44px;display:flex;align-items:center;justify-content:center;';
        btn.innerHTML = '<span style="color:#ffd700;font-size:1.2em;">⇄</span>';
        btn.onclick = function(e) { e.stopPropagation(); SherwoodUI._arenaSwitchTarget(); };
        this._screenLayer.appendChild(btn);
    },

    _arenaStartCharge: function() {
        if (this._arenaChargeStart) return;
        this._arenaChargeStart = Date.now();
        
        if (this._arenaChargeInterval) clearInterval(this._arenaChargeInterval);
        
        this._arenaChargeInterval = setInterval(function() {
            SherwoodUI._updateArenaCharge();
        }, 100);
    },

    _updateArenaCharge: function() {
        if (!this._arenaChargeStart) return;
        
        this._arenaCharge = Date.now() - this._arenaChargeStart;
        if (this._arenaCharge > this._arenaChargeMax) this._arenaCharge = this._arenaChargeMax;
        
        var chargePercent = this._arenaCharge / this._arenaChargeMax;
        var attackBtn = document.getElementById('attack-btn');
        if (attackBtn) {
            attackBtn.style.filter = 'brightness(' + (0.4 + chargePercent * 0.6) + ')';
        }
        
        if (this._arenaCharge >= this._arenaChargeMax) {
            clearInterval(this._arenaChargeInterval);
            this._arenaChargeInterval = null;
            var btn = document.getElementById('attack-btn');
            if (btn) { btn.style.filter = 'brightness(1.3)'; btn.style.boxShadow = '0 0 20px rgba(255,215,0,0.8)'; }
            this._playSound('levelup');
        }
    },

    _resetArenaCharge: function() {
        this._arenaChargeStart = null;
        this._arenaCharge = 0;
        if (this._arenaChargeInterval) { clearInterval(this._arenaChargeInterval); this._arenaChargeInterval = null; }
        var btn = document.getElementById('attack-btn');
        if (btn) { btn.style.filter = ''; btn.style.boxShadow = ''; }
    },

    _arenaAttack: function() {
        this._playHitSounds();
        var chargePercent = this._arenaCharge / this._arenaChargeMax;
        
        var r = Sherwood.Arena.playerAttack(chargePercent);
        if (!r) return;
        
        if (r.error) { this._showDialog(r.error, '#ff9800'); return; }
        
        this._hitEnemyCard();
        this._showDamageNumber(r.damage, r.crit);
        this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        this._showDialog('Урон: ' + r.damage, '#fff');
        
        this._resetArenaCharge();
        
        if (r.win) {
            this._stopMusic();
            var rewards = r.rewards || { exp: 100, gold: 50, silver: 100 };
            Sherwood.addExp(rewards.exp);
            Sherwood.addResource('gold', rewards.gold);
            Sherwood.addResource('silver', rewards.silver);
            this._pendingRewards = rewards;
            this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.arena(); };
            this._showVictoryScreen(rewards);
            return;
        }
        
        if (r.playerDead) {
            this._stopMusic();
            var rewards = { exp: 20, silver: 50 };
            this._pendingRewards = rewards;
            this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.arena(); };
            this._showDefeatScreen(rewards);
            return;
        }
        
        if (r.nextEnemy) {
            var self = this;
            setTimeout(function() { self._showArenaBattle(); }, 1500);
            return;
        }
        
        if (r.enemyDamage) {
            var self = this;
            setTimeout(function() { self._showDialog('Враг: ' + r.enemyDamage, '#f44336'); }, 700);
        }
        
        this.updateDisplay();
        var self = this;
        setTimeout(function() { self._showArenaBattle(); }, 1000);
    },

    _arenaSwitchTarget: function() {
        var r = Sherwood.Arena.switchTarget();
        if (!r.success) { this._showDialog(r.reason, '#ff9800'); return; }
        this._resetArenaCharge();
        var self = this;
        setTimeout(function() { self._showArenaBattle(); }, 300);
    },

    _arenaFlee: function() { 
        this._stopMusic(); 
        this._resetArenaCharge();
        Sherwood.Arena.fleeMatch();
        this._playMusic('main_theme'); 
        this.arena(); 
    },    settings: function() { 
        this._playSound('click'); 
        var p = Sherwood.getPlayer();
        var nm = p ? p.name : 'Охотник';
        
        var h = '';
        h += '<div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;">';
        h += '<div style="color:#fff;margin-bottom:8px;">Имя</div>';
        var safeName = nm.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        h += '<input id="pni" value="' + safeName + '" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:8px 12px;color:#fff;font-family:\'Georgia\',serif;font-size:0.9em;">';
        h += '<button onclick="SherwoodUI._changePlayerName()" style="background:#c9a040;border:none;border-radius:6px;padding:8px 16px;color:#000;font-weight:bold;cursor:pointer;">Сохранить</button>';
        h += '</div>';
        
        h += '<div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;">';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
        h += '<span style="color:#fff;">Звуки</span>';
        h += '<button onclick="SherwoodUI._toggleSound(' + !this._soundEnabled + ')" style="width:60px;height:30px;background:' + (this._soundEnabled ? '#4caf50' : '#555') + ';border:none;border-radius:15px;cursor:pointer;"></button>';
        h += '</div>';
        h += '<div style="display:flex;justify-content:space-between;align-items:center;">';
        h += '<span style="color:#fff;">Музыка</span>';
        h += '<button onclick="SherwoodUI._toggleMusic(' + !this._musicEnabled + ')" style="width:60px;height:30px;background:' + (this._musicEnabled ? '#4caf50' : '#555') + ';border:none;border-radius:15px;cursor:pointer;"></button>';
        h += '</div>';
        h += '</div>';
        
        h += '<button onclick="SherwoodUI._saveProgress()" style="width:100%;background:#4caf50;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;margin-bottom:8px;">Сохранить</button>';
        h += '<button onclick="SherwoodUI._exitGame()" style="width:100%;background:#f44336;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;">Выйти</button>';
        
        this._openScreenScrollable('Настройки','settings',h);
    },

    _changePlayerName: function() { 
        var inp = document.getElementById('pni'); 
        if (!inp) return; 
        var nm = inp.value.trim(); 
        if (!nm) return; 
        var p = Sherwood.getPlayer(); 
        if (p) { p.name = nm; Sherwood.saveGame(); this._showToast('Имя сохранено!'); } 
    },

    _saveProgress: function() {
        if (Sherwood.saveGameNow) Sherwood.saveGameNow();
        this._saveAudioSettings();
        this._showToast('Прогресс сохранён!');
    },

    _toggleSound: function(en) { 
        this._soundEnabled = en; 
        this._saveAudioSettings(); 
        this.settings();
    },

    _toggleMusic: function(en) { 
        this._musicEnabled = en; 
        this._saveAudioSettings(); 
        if (!en) this._stopMusic(); 
        else this._playMusic('main_theme'); 
        this.settings();
    },

    _exitGame: function() { 
        if (confirm('Выйти в главное меню?')) { 
            if (Sherwood.saveGameNow) Sherwood.saveGameNow(); 
            this._stopMusic(); 
            if (this._screenLayer) { this._screenLayer.style.display = 'none'; this._screenLayer.innerHTML = ''; } 
            if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = ''; }); }); 
            this.container.style.background = ''; 
            this._lastBgKey = null;
            document.getElementById('mainInterface').classList.remove('active'); 
            document.getElementById('loadingScreen').classList.remove('hidden'); 
        } 
    },

    chat: function() { 
        this._playSound('click'); 
        if (!Sherwood.Chat) { this._showPlaceholder('Чат','chat'); return; } 
        
        var msgs = Sherwood.Chat.getRecentMessages(50);
        var h = '';
        for (var i = 0; i < msgs.length; i++) {
            var m = msgs[i];
            if (m.isSystem) h += '<div style="color:#888;font-size:0.75em;text-align:center;margin:4px 0;">[' + m.time + '] ' + m.text + '</div>';
            else {
                var me = m.sender === Sherwood.Chat.getUsername();
                h += '<div style="margin-bottom:6px;display:flex;flex-direction:column;align-items:' + (me ? 'flex-end' : 'flex-start') + ';">';
                h += '<div style="color:#c9a040;font-size:0.65em;">' + m.sender + ' <span style="color:#666;">' + m.time + '</span></div>';
                h += '<div style="background:' + (me ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.08)') + ';border-radius:8px;padding:6px 10px;color:#ddd;font-size:0.8em;max-width:80%;">' + m.text + '</div>';
                h += '</div>';
            }
        }
        
        var c = '<div style="display:flex;flex-direction:column;height:100%;">';
        c += '<div id="chat-msgs" style="flex:1;background:rgba(0,0,0,0.5);border-radius:8px;padding:12px;margin-bottom:8px;overflow-y:auto;min-height:300px;">' + (h || '<div style="color:#666;text-align:center;">Пусто</div>') + '</div>';
        c += '<div style="display:flex;gap:8px;"><input id="chat-input" placeholder="Сообщение..." style="flex:1;background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:8px;padding:10px;color:#fff;font-size:0.85em;"><button onclick="SherwoodUI._sendChat()" style="background:transparent;border:none;cursor:pointer;padding:0;width:44px;height:44px;"><img src="assets/all_buttons/send_text.png" style="width:100%;height:100%;object-fit:contain;"></button></div>';
        c += '</div>';
        
        this._openScreenScrollable('Чат','chat',c);
        setTimeout(function() { var el = document.getElementById('chat-msgs'); if (el) el.scrollTop = el.scrollHeight; }, 100);
    },

    _sendChat: function() { 
        var inp = document.getElementById('chat-input'); 
        if (!inp) return; 
        var t = inp.value.trim(); 
        if (!t) return; 
        inp.value = ''; 
        Sherwood.Chat.sendMessage(t); 
        this.chat(); 
    },    market: function() {
        this._playSound('click');
        if (!Sherwood.BlackMarket) { this._showPlaceholder('Рынок', 'market'); return; }
        
        var items = Sherwood.BlackMarket.getShopItems();
        var canRefresh = Sherwood.BlackMarket.canRefresh();
        
        var h = '';
        
        if (canRefresh) {
            h += '<div style="text-align:center;margin-bottom:12px;">';
            h += '<button onclick="SherwoodUI._refreshMarket()" style="background:#ff9800;border:none;border-radius:8px;padding:10px 24px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.85em;">Обновить за 150 золота</button>';
            h += '</div>';
        }
        
        h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:400px;margin:0 auto;">';
        
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var purchased = Sherwood.BlackMarket.isPurchased(item.id);
            
            h += '<div onclick="' + (purchased ? '' : 'SherwoodUI._buyItem(\'' + item.id + '\')') + '" style="position:relative;cursor:' + (purchased ? 'default' : 'pointer') + ';">';
            h += '<img src="assets/interface/product_slot.png" style="width:100%;height:auto;display:block;">';
            h += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;box-sizing:border-box;">';
            h += '<img src="' + item.icon + '" style="width:44px;height:44px;object-fit:contain;margin-bottom:4px;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '<div style="color:#e0c080;font-size:0.65em;font-weight:bold;text-align:center;">' + item.name + '</div>';
            if (purchased) {
                h += '<div style="color:#4caf50;font-size:0.6em;">Куплено</div>';
            } else {
                h += '<div style="color:' + (item.currency === 'gold' ? '#ffd700' : '#c0c0c0') + ';font-size:0.65em;">' + item.price + ' ' + (item.currency === 'gold' ? 'зол.' : 'сер.') + '</div>';
            }
            h += '</div>';
            h += '</div>';
        }
        
        h += '</div>';
        h += '<div id="market-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:8px;"></div>';
        
        this._openScreenScrollable('Рынок', 'market', h);
    },

    _refreshMarket: function() {
        if (!confirm('Обновить товары за 150 золота?')) return;
        var r = Sherwood.BlackMarket.refresh();
        if (r.success) {
            this._showToast('Товары обновлены!');
            this.market();
        } else {
            this._showToast(r.reason);
        }
    },

    _buyItem: function(itemId) {
        var r = Sherwood.BlackMarket.buyItem(itemId);
        var log = document.getElementById('market-log');
        if (r.success) {
            if (log) log.textContent = 'Куплено!';
            this.updateDisplay();
            this._playSound('loot_fly');
        } else {
            if (log) log.textContent = r.reason || 'Ошибка';
            this._showToast(r.reason || 'Ошибка');
        }
        var self = this;
        setTimeout(function() { self.market(); }, 800);
    },

    _buyRing: function(ringId) {
        var r = Sherwood.BlackMarket.buyRing(ringId);
        var log = document.getElementById('market-log');
        if (r.success) {
            if (log) log.textContent = 'Кольцо куплено!';
            this.updateDisplay();
        } else {
            if (log) log.textContent = r.reason || 'Ошибка';
            this._showToast(r.reason || 'Ошибка');
        }
        var self = this;
        setTimeout(function() { self.market(); }, 800);
    },

    _buyAmulet: function(amuletId) {
        var r = Sherwood.BlackMarket.buyAmulet(amuletId);
        var log = document.getElementById('market-log');
        if (r.success) {
            if (log) log.textContent = 'Амулет куплен!';
            this.updateDisplay();
        } else {
            if (log) log.textContent = r.reason || 'Ошибка';
            this._showToast(r.reason || 'Ошибка');
        }
        var self = this;
        setTimeout(function() { self.market(); }, 800);
    },

    bag: function() {
        this._playSound('click');
        var bag = Sherwood.Bag;
        if (!bag) return;
        
        var items = bag.getItems();
        var max = bag.getMaxSlots();
        var resources = bag.getResources();
        
        var h = '';
        
        h += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px;">';
        
        var resDefs = [
            { key: 'gold', icon: 'assets/interface/resource_gold.png' },
            { key: 'silver', icon: 'assets/interface/resource_silver.png' },
            { key: 'skins', icon: 'assets/interface/skin_of_the_sherwood_creature.png' },
            { key: 'entranceTickets', icon: 'assets/interface/resource_key_to_locked_levels.png' },
            { key: 'autoFightTickets', icon: 'assets/interface/ticket_autofight.png' },
            { key: 'portalToken1', icon: 'assets/interface/resource_token_on_entrance_portal_1.png' },
            { key: 'portalToken2', icon: 'assets/interface/resource_token_on_entrance_portal_2.png' },
            { key: 'portalToken3', icon: 'assets/interface/resource_token_on_entrance_portal_3.png' }
        ];
        
        for (var r = 0; r < resDefs.length; r++) {
            var rd = resDefs[r];
            var count = resources[rd.key] || 0;
            h += '<div style="position:relative;width:70px;height:70px;">';
            h += '<img src="assets/interface/visual_resource.png" style="width:100%;height:100%;object-fit:contain;">';
            h += '<img src="' + rd.icon + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;object-fit:contain;">';
            h += '<span style="position:absolute;top:2px;right:6px;color:#fff;font-size:0.6em;font-weight:bold;">' + count + '</span>';
            h += '</div>';
        }
        
        h += '</div>';
        h += '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;margin-bottom:6px;">' + items.length + '/' + max + ' ячеек</div>';
        
        var expInfo = bag.getExpansionInfo();
        if (expInfo.canExpand) {
            h += '<button onclick="if(confirm(\'Расширить сумку за ' + expInfo.costSilver + ' серебра и ' + expInfo.costSkin + ' шкур?\'))SherwoodUI._expandBag()" style="margin:10px auto;background:#c9a040;border:none;border-radius:8px;padding:8px 18px;color:#000;font-weight:bold;cursor:pointer;font-size:0.8em;display:block;">Расширить +10</button>';
        }
        
        h += '<div id="bag-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:400px;margin:16px auto 0;">';
        
        for (var i = 0; i < max; i++) {
            var item = items[i];
            if (item) {
                var gc = '#9d9d9d';
                h += '<div draggable="true" data-bag-index="' + i + '" ondragstart="SherwoodUI._bagDragStart(event,' + i + ')" ondragover="SherwoodUI._bagDragOver(event)" ondrop="SherwoodUI._bagDrop(event,' + i + ')" onclick="SherwoodUI._bagAction(' + i + ')" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:70px;height:70px;border:2px solid ' + gc + ';border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;padding:4px;">';
                h += '<img src="' + (item.icon || 'assets/interface/labyrinth_of_icons.png') + '" style="width:40px;height:40px;object-fit:contain;">';
                if (item.quantity > 1) {
                    h += '<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.65em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 6px;border-radius:4px;">' + item.quantity + '</span>';
                }
                h += '</div>';
            } else {
                h += '<div data-bag-index="' + i + '" ondragover="SherwoodUI._bagDragOver(event)" ondrop="SherwoodUI._bagDrop(event,' + i + ')" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:70px;height:70px;border:2px solid #555;border-radius:8px;"></div>';
            }
        }
        
        h += '</div>';
        h += '<div id="bag-info" style="text-align:center;color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:14px;min-height:24px;">Нажми на предмет</div>';
        
        this._openScreenScrollable('Сумка', 'bag', h);
    },

    _bagDragStart: function(e, index) {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
    },

    _bagDragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    _bagDrop: function(e, targetIndex) {
        e.preventDefault();
        var sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;
        
        var r = Sherwood.Bag.moveItem(sourceIndex, targetIndex);
        if (r.success) this.bag();
    },

    _expandBag: function() { 
        var r = Sherwood.Bag.expandBag();
        if (r.success) { 
            this._showToast('Сумка расширена до ' + r.newSlots + ' ячеек!'); 
            this.updateDisplay(); 
        } else { 
            this._showToast(r.reason || 'Ошибка'); 
        } 
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
        if (item.part) {
            a += '<button onclick="Sherwood.Bag.equipItem(' + i + ');SherwoodUI.bag();" style="background:#4caf50;border:none;border-radius:6px;padding:6px 14px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;">Надеть</button>';
        }
        a += '<button onclick="if(confirm(\'Продать?\'))Sherwood.Bag.sellItem(' + i + ');SherwoodUI.bag();" style="background:#ff9800;border:none;border-radius:6px;padding:6px 14px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;">Продать</button>';
        a += '<button onclick="if(confirm(\'Выкинуть?\'))Sherwood.Bag.discardItem(' + i + ');SherwoodUI.bag();" style="background:#f44336;border:none;border-radius:6px;padding:6px 14px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;">Выкинуть</button>';
        
        info.innerHTML = '<div style="color:#e0c080;font-size:0.95em;font-weight:bold;">' + (item.name || 'Предмет') + '</div><div style="color:#aaa;font-size:0.75em;">x' + (item.quantity || 1) + '</div><div style="margin-top:8px;">' + a + '</div>';
    },

    wallet: function() {
        this._playSound('click');
        var p = Sherwood.getPlayer();
        if (!p.wallet) p.wallet = { cells: [], totalSilver: 0 };
        if (!p.wallet.cells || p.wallet.cells.length === 0) {
            p.wallet.cells = [];
            for (var i = 0; i < 30; i++) p.wallet.cells.push(0);
            p.wallet.totalSilver = 0;
        }
        
        var cells = p.wallet.cells;
        var maxPerCell = 20000;
        var maxTotal = 30 * maxPerCell;
        var filledCells = 0;
        var totalFilled = 0;
        for (var i = 0; i < cells.length; i++) {
            totalFilled += cells[i];
            if (cells[i] >= maxPerCell) filledCells++;
        }
        
        var canWithdraw = totalFilled >= 100000;
        
        var h = '';
        h += '<div style="text-align:center;padding:10px;">';
        h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:4px;">Кошелёк</div>';
        h += '<div style="color:#c0c0c0;font-size:0.9em;margin-bottom:8px;">Накоплено: ' + totalFilled + ' / ' + maxTotal + ' серебра</div>';
        h += '<div style="color:#aaa;font-size:0.75em;margin-bottom:16px;">Ячеек заполнено: ' + filledCells + ' / 30</div>';
        
        h += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:380px;margin:0 auto 20px;">';
        for (var i = 0; i < cells.length; i++) {
            var cellSilver = cells[i];
            var pct = Math.min(100, Math.round((cellSilver / maxPerCell) * 100));
            h += '<div style="position:relative;width:68px;height:68px;background:url(\'assets/interface/wallet_cell.png\') center/contain no-repeat;background-size:cover;border:2px solid ' + (cellSilver >= maxPerCell ? '#ffd700' : '#555') + ';border-radius:8px;display:flex;align-items:center;justify-content:center;">';
            if (cellSilver > 0) {
                h += '<img src="assets/interface/resource_silver.png" style="width:36px;height:36px;object-fit:contain;opacity:' + (0.3 + (pct / 100) * 0.7) + ';">';
            }
            h += '</div>';
        }
        h += '</div>';
        
        if (canWithdraw) {
            h += '<button onclick="if(confirm(\'Забрать ' + totalFilled + ' серебра?\'))SherwoodUI._withdrawWallet()" style="background:#c9a040;border:none;border-radius:8px;padding:14px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:0.95em;">Забрать ' + totalFilled + ' серебра</button>';
        } else {
            h += '<div style="color:#888;font-size:0.85em;">Нужно минимум 100,000 серебра</div>';
        }
        
        h += '</div>';
        
        this._openScreen('Кошелёк', 'wallet', h, 'SherwoodUI.profile()');
    },

    _withdrawWallet: function() {
        var p = Sherwood.getPlayer();
        if (!p.wallet) return;
        var totalFilled = 0;
        for (var i = 0; i < p.wallet.cells.length; i++) totalFilled += p.wallet.cells[i];
        if (totalFilled < 100000) { this._showToast('Минимум 100,000 серебра'); return; }
        Sherwood.addResource('silver', totalFilled);
        for (var i = 0; i < p.wallet.cells.length; i++) p.wallet.cells[i] = 0;
        p.wallet.totalSilver = 0;
        Sherwood.saveGame();
        this.updateDisplay();
        this.wallet();
    },

    _addWalletSilver: function(amount) {
        var p = Sherwood.getPlayer();
        if (!p.wallet) p.wallet = { cells: [], totalSilver: 0 };
        if (!p.wallet.cells || p.wallet.cells.length === 0) {
            p.wallet.cells = [];
            for (var i = 0; i < 30; i++) p.wallet.cells.push(0);
        }
        var maxPerCell = 20000;
        var remaining = amount;
        for (var i = 0; i < p.wallet.cells.length && remaining > 0; i++) {
            var space = maxPerCell - p.wallet.cells[i];
            if (space > 0) {
                var add = Math.min(remaining, space);
                p.wallet.cells[i] += add;
                remaining -= add;
            }
        }
        Sherwood.saveGame();
    },    profile: function() {
        this._playSound('click');
        var p = Sherwood.getPlayer();
        var eq = Sherwood.Bag ? Sherwood.Bag.getEquipment() : {};
        var ring = eq.ring, amulet = eq.amulet;
        var trophies = p.trophies || [];
        var activeSkin = p.activeSkin || 'skin1_01';
        
        var h = '<div style="text-align:center;margin-bottom:12px;">';
        h += '<div onclick="SherwoodUI._showSkinSelection()" style="cursor:pointer;display:inline-block;position:relative;">';
        h += '<img src="assets/hero_skins/' + activeSkin + '.png" style="width:90px;height:90px;border-radius:12px;border:2px solid #c9a040;object-fit:contain;" onerror="this.src=\'assets/hero_skins/skin1_01.png\'">';
        h += '<div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.7);border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;"><span style="color:#ffd700;font-size:0.7em;">⚙</span></div>';
        h += '</div>';
        h += '<div style="color:#e0c080;font-weight:bold;margin-top:4px;">' + p.name + '</div>';
        h += '<div style="color:#aaa;">Уровень ' + p.level + '</div>';
        h += '</div>';
        
        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:rgba(0,0,0,0.4);border-radius:10px;padding:12px;margin-bottom:12px;">';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><img src="' + this._statIcons.attack + '" style="width:22px;height:22px;"><span style="color:#f44336;">' + p.stats.attack + '</span></div>';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><img src="' + this._statIcons.defense + '" style="width:22px;height:22px;"><span style="color:#2196f3;">' + p.stats.defense + '</span></div>';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><img src="' + this._statIcons.hp + '" style="width:22px;height:22px;"><span style="color:#4caf50;">' + p.stats.hp + '/' + p.stats.maxHp + '</span></div>';
        h += '</div>';
        
        h += '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:12px;">';
        h += '<div class="profile-action-btn" onclick="SherwoodUI._showAllTrophies()"><img src="' + (trophies.length > 0 && trophies[0].icon ? trophies[0].icon : 'assets/interface/trophy_stand.png') + '"><span class="action-label">' + (trophies.length > 0 ? trophies.length + ' трофеев' : 'Трофеи') + '</span></div>';
        h += '<div class="profile-action-btn" onclick="SherwoodUI._showAllRings()"><img src="' + (ring ? ring.icon || 'assets/interface/ring_first_level.png' : 'assets/interface/ring_first_level.png') + '"><span class="action-label">Кольца</span></div>';
        h += '<div class="profile-action-btn" onclick="SherwoodUI._showAllAmulets()"><img src="' + (amulet ? amulet.icon || 'assets/interface/sherwood_amulet_level_one.png' : 'assets/interface/sherwood_amulet_level_one.png') + '"><span class="action-label">Амулеты</span></div>';
        h += '</div>';
        
        h += '<div class="profile-actions">';
        h += '<div class="profile-action-btn" onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.training();"><img src="assets/all_buttons/training.png"><span class="action-label">Тренировка</span></div>';
        h += '<div class="profile-action-btn" onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.forge();"><img src="assets/all_buttons/forge.png"><span class="action-label">Кузница</span></div>';
        h += '<div class="profile-action-btn" onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.wallet();"><img src="assets/interface/wallet.png"><span class="action-label">Кошелёк</span></div>';
        h += '<div class="profile-action-btn" onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.bestiary();"><img src="assets/all_buttons/bestiary.png"><span class="action-label">Бестиарий</span></div>';
        h += '</div>';
        
        this._openScreen('Профиль', 'profile', h);
    },

    _showSkinSelection: function() {
        this._playSound('click');
        var p = Sherwood.getPlayer();
        var unlockedSkins = p.unlockedSkins || ['skin1_01'];
        var activeSkin = p.activeSkin || 'skin1_01';
        
        var h = '<div style="text-align:center;padding:10px;">';
        h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:16px;">Выбор облика</div>';
        h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:400px;margin:0 auto;">';
        
        for (var i = 0; i < unlockedSkins.length; i++) {
            var sid = unlockedSkins[i];
            var isActive = activeSkin === sid;
            var skinName = Sherwood.SKIN_BONUSES[sid] ? Sherwood.SKIN_BONUSES[sid].name : sid;
            
            h += '<div onclick="' + (isActive ? '' : 'SherwoodUI._selectSkin(\'' + sid + '\')') + '" style="background:rgba(0,0,0,0.6);border:2px solid ' + (isActive ? '#ffd700' : '#4caf50') + ';border-radius:10px;padding:10px;text-align:center;cursor:' + (isActive ? 'default' : 'pointer') + ';">';
            h += '<img src="assets/hero_skins/' + sid + '.png" style="width:64px;height:64px;object-fit:contain;border-radius:8px;margin:0 auto;" onerror="this.src=\'assets/hero_skins/skin1_01.png\'">';
            h += '<div style="color:#e0c080;font-size:0.6em;margin-top:4px;">' + skinName + '</div>';
            if (isActive) h += '<div style="color:#ffd700;font-size:0.6em;">Активен</div>';
            else h += '<div style="color:#4caf50;font-size:0.6em;">Надеть</div>';
            h += '</div>';
        }
        
        h += '</div></div>';
        
        this._openScreenScrollable('Облики', 'profile', h);
    },

    _selectSkin: function(skinId) {
        var p = Sherwood.getPlayer();
        if (!p || !p.unlockedSkins || p.unlockedSkins.indexOf(skinId) === -1) return;
        p.activeSkin = skinId;
        if (Sherwood._recalcStats) Sherwood._recalcStats();
        Sherwood.saveGame();
        this._updateHeroSkin();
        this.updateDisplay();
        this._showSkinSelection();
    },

    _showAllTrophies: function() {
        var trophies = Sherwood.getPlayer().trophies || [];
        var h = '<div style="padding:10px;"><div style="color:#e0c080;font-weight:bold;margin-bottom:8px;">Трофеи (' + trophies.length + ')</div>';
        if (trophies.length === 0) h += '<div style="color:#aaa;">Нет трофеев</div>';
        for (var i = 0; i < trophies.length; i++) {
            var t = trophies[i];
            h += '<div style="display:flex;gap:12px;background:rgba(0,0,0,0.5);border:1px solid #c9a040;border-radius:10px;padding:10px;margin-bottom:8px;">';
            h += '<img src="' + (t.icon || 'assets/interface/trophy_stand.png') + '" style="width:56px;height:56px;object-fit:contain;border-radius:8px;">';
            h += '<div style="flex:1;"><div style="color:#e0c080;font-weight:bold;">' + t.name + '</div>';
            if (t.bonus) h += '<div style="color:#aaa;font-size:0.7em;">АТК +' + (t.bonus.attack||0) + ' | ЗЩТ +' + (t.bonus.defense||0) + ' | HP +' + (t.bonus.hp||0) + '</div>';
            h += '</div></div>';
        }
        h += '</div>';
        this._openScreenScrollable('Трофеи', 'profile', h, 'SherwoodUI.profile()');
    },

    _showAllRings: function() {
        var player = Sherwood.getPlayer();
        var jewelry = (player.marketData && player.marketData.ownedJewelry) ? player.marketData.ownedJewelry : { rings: [], amulets: [] };
        var purchasedRingIds = jewelry.rings || [];
        var allRings = Sherwood.BlackMarket ? (Sherwood.BlackMarket.RINGS || []) : [];
        
        var h = '<div style="padding:10px;"><div style="color:#e0c080;font-weight:bold;margin-bottom:8px;">Кольца (' + purchasedRingIds.length + ')</div>';
        if (purchasedRingIds.length === 0) h += '<div style="color:#aaa;">Нет купленных колец</div>';
        
        for (var i = 0; i < allRings.length; i++) {
            var ringData = allRings[i];
            var ringId = 'ring_' + ringData.chapter;
            if (purchasedRingIds.indexOf(ringId) === -1) continue;
            
            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #c9a040;border-radius:10px;padding:10px;margin-bottom:8px;">';
            h += '<div style="color:#e0c080;font-weight:bold;">Кольцо главы ' + ringData.chapter + '</div>';
            h += '<div style="color:#aaa;font-size:0.7em;">АТК +' + (ringData.stats.attack || 0) + ' | ЗЩТ +' + (ringData.stats.defense || 0) + '</div>';
            h += '</div>';
        }
        h += '</div>';
        this._openScreenScrollable('Кольца', 'profile', h, 'SherwoodUI.profile()');
    },

    _showAllAmulets: function() {
        var player = Sherwood.getPlayer();
        var jewelry = (player.marketData && player.marketData.ownedJewelry) ? player.marketData.ownedJewelry : { rings: [], amulets: [] };
        var purchasedAmuletIds = jewelry.amulets || [];
        var allAmulets = Sherwood.BlackMarket ? (Sherwood.BlackMarket.AMULETS || []) : [];
        
        var h = '<div style="padding:10px;"><div style="color:#e0c080;font-weight:bold;margin-bottom:8px;">Амулеты (' + purchasedAmuletIds.length + ')</div>';
        if (purchasedAmuletIds.length === 0) h += '<div style="color:#aaa;">Нет купленных амулетов</div>';
        
        for (var i = 0; i < allAmulets.length; i++) {
            var amuletData = allAmulets[i];
            var amuletId = 'amulet_' + amuletData.chapter;
            if (purchasedAmuletIds.indexOf(amuletId) === -1) continue;
            
            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #c9a040;border-radius:10px;padding:10px;margin-bottom:8px;">';
            h += '<div style="color:#e0c080;font-weight:bold;">Амулет главы ' + amuletData.chapter + '</div>';
            h += '<div style="color:#aaa;font-size:0.7em;">HP +' + (amuletData.stats.hp || 0) + ' | ЗЩТ +' + (amuletData.stats.defense || 0) + '</div>';
            h += '</div>';
        }
        h += '</div>';
        this._openScreenScrollable('Амулеты', 'profile', h, 'SherwoodUI.profile()');
    },

    training: function() { 
        var gb = this._previousScreen === 'profile' ? 'SherwoodUI.profile()' : 'SherwoodUI.loadHome()'; 
        this._previousScreen = null; 
        this._playSound('click'); 
        var p = Sherwood.getPlayer();
        var tl = p.trainingLevels || {};
        var stats = ['attack', 'defense', 'hp'];
        var names = { attack: 'Атака', defense: 'Защита', hp: 'Здоровье' };
        
        var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'; 
        for (var i = 0; i < stats.length; i++) { 
            var s = stats[i], lvl = tl[s] || 0; 
            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:12px;text-align:center;">';
            h += '<img src="' + this._statIcons[s] + '" style="width:28px;height:28px;">';
            h += '<div style="color:#e0c080;">' + names[s] + '</div>';
            h += '<div style="color:#aaa;font-size:0.8em;">Ур. ' + lvl + '/300</div>';
            h += '<button onclick="SherwoodUI._doTraining(\'' + s + '\')" style="margin-top:8px;background:#c9a040;border:none;border-radius:4px;padding:6px 16px;color:#000;cursor:pointer;font-size:0.8em;">Тренировать</button>';
            h += '</div>'; 
        } 
        h += '</div><div id="training-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:12px;"></div>'; 
        this._openScreen('Тренировка', 'training', h, gb); 
    },

    _doTraining: function(stat) {
        var p = Sherwood.getPlayer(); 
        if (!p) return;
        if (!p.trainingLevels) p.trainingLevels = { attack: 0, defense: 0, hp: 0 };
        var cur = p.trainingLevels[stat] || 0;
        if (cur >= 300) return;
        
        var nextLevel = cur + 1;
        var isGoldLevel = nextLevel % 5 === 0;
        var cost = isGoldLevel ? Math.round(5 * Math.pow(1.15, Math.floor(nextLevel / 5))) : Math.round(10 * Math.pow(nextLevel, 1.15));
        var currency = isGoldLevel ? 'gold' : 'silver';
        
        if ((p.resources[currency] || 0) < cost) {
            var log = document.getElementById('training-log');
            if (log) log.textContent = 'Нужно ' + cost + ' ' + (isGoldLevel ? 'золота' : 'серебра');
            return;
        }
        
        p.resources[currency] -= cost;
        p.trainingLevels[stat] = nextLevel;
        if (Sherwood._recalcStats) Sherwood._recalcStats();
        Sherwood.saveGame();
        this.updateDisplay();
        this.training();
    },

    forge: function() {
        var gb = this._previousScreen === 'profile' ? 'SherwoodUI.profile()' : 'SherwoodUI.loadHome()';
        this._previousScreen = null;
        this._playSound('click');
        if (!Sherwood.Forge) { this._showPlaceholder('Кузница', 'forge', gb); return; }
        
        var arrowInfo = Sherwood.Forge.getArrowCraftInfo();
        var arrowCount = Sherwood.Forge.getArrowCount();
        
        var h = '';
        h += '<div style="color:#e0c080;margin-bottom:4px;">Стрелы</div>';
        h += '<div style="color:#aaa;font-size:0.7em;">В сумке: ' + arrowCount + ' шт.</div>';
        h += '<div style="color:#aaa;font-size:0.65em;">Веток: ' + arrowInfo.branches + ' | Перьев: ' + arrowInfo.feathers + ' | Костей: ' + arrowInfo.bones + '</div>';
        if (arrowInfo.canCraft > 0) {
            h += '<button onclick="SherwoodUI._craftArrow(1)" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Создать 1</button>';
            if (arrowInfo.canCraft >= 10) h += '<button onclick="SherwoodUI._craftArrow(10)" style="margin-left:4px;background:#ff9800;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Создать 10</button>';
        }
        
        h += '<div id="forge-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:8px;"></div>';
        this._openScreen('Кузница', 'forge', h, gb);
    },

    _craftArrow: function(count) { 
        var r = Sherwood.Forge.craftArrowBatch(count); 
        if (r.success) { this._showToast('Создано: ' + r.crafted); } 
        else { this._showToast(r.reason || 'Ошибка'); } 
        this.updateDisplay(); 
        var self = this; 
        setTimeout(function() { self.forge(); }, 800); 
    },

    bestiary: function() { 
        var gb = this._previousScreen === 'profile' ? 'SherwoodUI.profile()' : 'SherwoodUI.loadHome();'; 
        this._previousScreen = null; 
        this._playSound('click'); 
        if (!Sherwood.Bestiary) { this._showPlaceholder('Бестиарий', 'bestiary', gb); return; } 
        
        var progress = Sherwood.Bestiary.getDiscoveryProgress();
        var tabs = ['Проклятая чаща', 'Первородное болото', 'Базальтовые шахты', 'Квест', 'Рейд', 'Портал'];
        if (!this._bestiaryTab) this._bestiaryTab = 0;
        
        var h = '';
        h += '<div style="text-align:center;margin-bottom:8px;color:#aaa;">Открыто: ' + progress.discovered + '/' + progress.total + '</div>';
        
        h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px;justify-content:center;">';
        for (var t = 0; t < tabs.length; t++) {
            var active = (this._bestiaryTab === t) ? '#c9a040' : 'rgba(255,255,255,0.1)';
            var color = (this._bestiaryTab === t) ? '#000' : '#fff';
            h += '<button onclick="SherwoodUI._bestiaryTab=' + t + ';SherwoodUI.bestiary();" style="background:' + active + ';border:1px solid #555;border-radius:6px;padding:4px 10px;color:' + color + ';cursor:pointer;font-size:0.7em;">' + tabs[t] + '</button>';
        }
        h += '</div>';
        
        var beasts = Sherwood.Bestiary.getBeastsByZone(tabs[this._bestiaryTab]);
        
        if (beasts.length === 0) {
            h += '<div style="color:#aaa;text-align:center;padding:40px 0;">Нет бестий</div>';
        } else {
            h += '<div style="display:flex;flex-direction:column;align-items:center;gap:24px;">';
            for (var i = 0; i < beasts.length; i++) {
                var b = beasts[i];
                var disc = b.kills > 0;
                h += '<div onclick="SherwoodUI._showBeastInfo(\'' + b.id + '\')" style="cursor:pointer;text-align:center;width:100%;max-width:320px;">';
                h += '<div style="position:relative;width:200px;height:200px;margin:0 auto;border-radius:16px;overflow:hidden;border:2px solid ' + (disc ? '#c9a040' : '#555') + ';background:rgba(0,0,0,0.5);">';
                h += '<img src="assets/all_beasts/' + b.id + '" style="width:100%;height:100%;object-fit:contain;' + (disc ? '' : 'filter:grayscale(1);opacity:0.4;') + '">';
                if (!disc) h += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;"><span style="color:#fff;font-size:2.5em;">?</span></div>';
                h += '</div>';
                h += '<div style="color:' + (disc ? '#e0c080' : '#666') + ';font-size:1.2em;font-weight:bold;margin-top:10px;">' + (disc ? b.name : '???') + '</div>';
                if (disc && !b.rewardClaimed) h += '<button onclick="event.stopPropagation();SherwoodUI._claimBestiaryReward(\'' + b.id + '\')" style="margin-top:6px;background:#ff9800;border:none;border-radius:6px;padding:6px 16px;color:#fff;cursor:pointer;font-size:0.65em;">Забрать +' + b.reward + ' Сер.</button>';
                h += '</div>';
            }
            h += '</div>';
        }
        
        this._openScreenScrollable('Бестиарий', 'bestiary', h);
    },

    _showBeastInfo: function(beastId) { 
        var b = Sherwood.Bestiary.getBeast(beastId); 
        if (!b) return; 
        var disc = b.kills > 0;
        var h = '<div style="padding:12px;">';
        h += '<img src="assets/all_beasts/' + b.id + '" style="width:140px;height:140px;object-fit:contain;border:2px solid #c9a040;border-radius:10px;' + (disc ? '' : 'filter:grayscale(1);opacity:0.5;') + '">';
        h += '<div style="color:#e0c080;font-weight:bold;">' + b.name + '</div>';
        h += '<div style="color:#aaa;font-size:0.7em;">' + b.floor + ' | ' + b.type + '</div>';
        h += '<div style="color:#ccc;font-size:0.8em;line-height:1.4;">' + (disc ? b.lore : 'Убейте чтобы открыть') + '</div>';
        h += '<div style="color:#aaa;font-size:0.7em;margin-top:8px;">Убито: ' + b.kills + ' | Награда: ' + (b.reward || 50) + ' Сер.</div>';
        if (disc && !b.rewardClaimed) h += '<button onclick="SherwoodUI._claimBestiaryReward(\'' + b.id + '\')" style="margin-top:8px;background:#ff9800;border:none;border-radius:6px;padding:6px 16px;color:#fff;cursor:pointer;">Забрать</button>';
        h += '</div>';
        this._openScreenScrollable(b.name, 'bestiary', h, 'SherwoodUI.bestiary()'); 
    },

    _claimBestiaryReward: function(beastId) { 
        if (!Sherwood.Bestiary) return; 
        var r = Sherwood.Bestiary.claimReward(beastId); 
        if (r.success) { this.updateDisplay(); this.bestiary(); } 
    },

    _bestiaryTab: 0,

    _claimReward: function() { 
        this._pendingRewards = null; 
        if (this._afterRewardAction) { 
            var cb = this._afterRewardAction; 
            this._afterRewardAction = null; 
            cb(); 
        } 
    },

};  // ← КОНЕЦ ОБЪЕКТА

(function() {
    var self = SherwoodUI;
    var allButtons = document.querySelectorAll('.btn[data-action], .side-btn[data-action], .top-btn[data-action]');
    for (var i = 0; i < allButtons.length; i++) {
        (function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var a = el.dataset.action;
                if (a && typeof self[a] === 'function') { try { self._playSound('click'); } catch(e) {} self[a](); }
            });
        })(allButtons[i]);
    }
})();

document.addEventListener('DOMContentLoaded', function() { if (typeof SherwoodUI !== 'undefined' && SherwoodUI.init) SherwoodUI.init(); });

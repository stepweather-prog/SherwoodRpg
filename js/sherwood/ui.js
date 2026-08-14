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
    
    // ЗАГРУЗКА НАСТРОЕК ДО МУЗЫКИ
    try { this._loadAudioSettings(); } catch(e) {}
    
    // ОБНОВЛЕНИЕ СКИНА
    this._updateHeroSkin();
    
    try {
        var silverEl = document.getElementById('silver-display');
        if (silverEl) {
            silverEl.parentElement.style.cursor = 'pointer';
            silverEl.parentElement.onclick = function() { SherwoodUI._showExchangePanel(); };
        }
    } catch(e) {}
    
    // МУЗЫКА ТОЛЬКО ЕСЛИ ВКЛЮЧЕНА
    if (this._musicEnabled) {
        try { this._playMusic('main_theme'); } catch(e) {}
    }
    
    try { this.updateDisplay(); } catch(e) {}
    
    if (typeof Sherwood !== 'undefined') {
        try { Sherwood.on('RESOURCE_CHANGED', function() { SherwoodUI.updateDisplay(); }); } catch(e) {}
        try { Sherwood.on('PLAYER_LEVEL_UP', function() { SherwoodUI._playSound('levelup'); SherwoodUI.updateDisplay(); }); } catch(e) {}
    }
    
    // СОХРАНЕНИЕ ПРИ ЗАКРЫТИИ
    window.addEventListener('beforeunload', function() {
        if (typeof Sherwood !== 'undefined' && Sherwood.saveGameNow) {
            Sherwood.saveGameNow();
        }
    });
    
    this._scaleGame();
    window.addEventListener('resize', function() { SherwoodUI._scaleGame(); });
},
        
_scaleGame: function() {
    var container = document.getElementById('game-container');
    if (!container) return;
    
    var windowWidth = window.innerWidth;
    var windowHeight = window.innerHeight;
    var gameWidth = 480;
    var gameHeight = 800;
    
    var scale = Math.min(windowWidth / gameWidth, windowHeight / gameHeight);
    
    if (scale < 1) {
        container.style.transform = 'scale(' + scale + ')';
        container.style.transformOrigin = 'top center';
    } else {
        container.style.transform = '';
        container.style.transformOrigin = '';
    }
},

_updateHeroSkin: function() {
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
        var expMaxEl = document.getElementById('exp-max-display');
        var expFill = document.getElementById('exp-fill-bar');
        var pct = p.expToLevel > 0 ? Math.round((p.exp / p.expToLevel) * 100) : 0;
        if (expEl) expEl.textContent = pct + '%';
        if (expMaxEl) expMaxEl.textContent = p.expToLevel || 500;
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
    
    // Обновление скина при возврате на главную
    this._updateHeroSkin();
    
    // Музыка если включена и не играет
    if (this._musicEnabled && !this._currentMusic) {
        try { this._playMusic('main_theme'); } catch(e) {}
    }
    
    try { this.updateDisplay(); } catch(e) {}
},

    _openScreen: function(title, bgKey, html, backFn) {
    try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = 'none'; }); }); } catch(e) {}
    try { this.container.style.background = "url('" + (this._bg[bgKey] || bgKey) + "') center/cover no-repeat"; } catch(e) {}
    var goBack = backFn || 'SherwoodUI.loadHome()';
    try { if (this._screenLayer) { this._screenLayer.innerHTML = '<div style="min-height:100%;padding:16px;display:flex;flex-direction:column;overflow-y:auto;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;"><button onclick="' + goBack + '" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;">' + title + '</span></div><div style="flex:1;overflow-y:auto;">' + html + '</div></div>'; this._screenLayer.style.display = 'block'; } } catch(e) {} },
_showPlaceholder: function(title, bgKey, backAction) { this._playSound('click'); this._openScreen(title, bgKey, '<div style="text-align:center;padding:40px 0;"><div style="font-size:3em;margin-bottom:16px;">&#128679;</div><div style="font-size:1.2em;color:#e0c080;margin-bottom:8px;">'+title+'</div><div style="font-size:0.7em;color:#888;">В разработке</div></div>', backAction); },

    _showVictoryScreen: function(rewards) {
    var h = '<div style="display:flex;align-items:center;justify-content:center;min-height:100%;padding:20px;">';
    h += '<div style="position:relative;display:inline-block;">';
    h += '<img src="assets/interface/vertical_slab_victory.png" style="width:600px;height:auto;display:block;">';
    h += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">';
    
    if (rewards.dungeonId && rewards.dungeonLevel) {
        h += '<div style="margin:10px 0;">';
        h += '<img src="assets/interface/resource_cup_for_completed_tasks.png" style="width:56px;height:56px;object-fit:contain;">';
        h += '<div style="color:#ffd700;font-size:1.2em;font-weight:bold;">+1 Кубок</div>';
        h += '<div style="color:#aaa;font-size:0.9em;">Этаж ' + rewards.dungeonLevel + '</div>';
        h += '</div>';
    }
    
    if (rewards.exp) h += '<div style="color:#fff;font-size:1.6em;margin:4px 0;">+ ' + rewards.exp + ' Опыта</div>';
    if (rewards.gold) h += '<div style="color:#ffd700;font-size:1.6em;margin:4px 0;"><img src="assets/interface/resource_gold.png" style="width:28px;height:28px;vertical-align:middle;object-fit:contain;"> + ' + rewards.gold + ' Золота</div>';
    if (rewards.silver) h += '<div style="color:#c0c0c0;font-size:1.6em;margin:4px 0;"><img src="assets/interface/resource_silver.png" style="width:28px;height:28px;vertical-align:middle;object-fit:contain;"> + ' + rewards.silver + ' Серебра</div>';
    if (rewards.scrolls) h += '<div style="color:#9c27b0;font-size:1.6em;margin:4px 0;">+ ' + rewards.scrolls + ' Скрижалей</div>';
    if (rewards.ingots) h += '<div style="color:#ff9800;font-size:1.6em;margin:4px 0;">+ ' + rewards.ingots + ' Слитков</div>';
    
    if (rewards.items && rewards.items.length > 0) {
        var lootMap = {};
        for (var i = 0; i < rewards.items.length; i++) {
            var item = rewards.items[i];
            var key = item.icon + '|' + item.name;
            if (!lootMap[key]) lootMap[key] = { icon: item.icon, name: item.name, quantity: 0 };
            lootMap[key].quantity += item.quantity || 1;
        }
        var lootKeys = Object.keys(lootMap);
        h += '<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:12px;justify-content:center;">';
        for (var k = 0; k < lootKeys.length; k++) {
            var li = lootMap[lootKeys[k]];
            h += '<div style="text-align:center;">';
            h += '<img src="' + li.icon + '" style="width:44px;height:44px;object-fit:contain;">';
            h += '<div style="color:#fff;font-size:1em;">' + li.name + '</div>';
            h += '<div style="color:#aaa;font-size:0.85em;">x' + li.quantity + '</div>';
            h += '</div>';
        }
        h += '</div>';
    }
    
    h += '</div>';
    h += '<button onclick="SherwoodUI._claimReward()" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:14px;padding:16px 50px;color:#000;font-weight:bold;cursor:pointer;font-size:1.5em;z-index:2;">Забрать</button>';
    h += '</div></div>';
    
    this._openScreen('Победа', 'dungeon_fight', h);
},
    _showDefeatScreen: function(rewards) { var h = '<div style="text-align:center;padding:10px;"><div style="position:relative;display:inline-block;"><img src="assets/interface/vertical_slab_defeat.png" style="width:400px;height:auto;display:block;"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;"><div style="color:#f44336;font-size:1.3em;font-weight:bold;">&#128128; ПОРАЖЕНИЕ</div>'; if (rewards.exp) h += '<div style="color:#fff;font-size:1em;">+ ' + rewards.exp + ' XP</div>'; if (rewards.silver) h += '<div style="color:#c0c0c0;font-size:1em;">+ ' + rewards.silver + ' Серебра</div>'; if (rewards.scrolls) h += '<div style="color:#9c27b0;font-size:1em;">+ ' + rewards.scrolls + ' Свитков</div>'; h += '</div><button onclick="SherwoodUI._claimReward()" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:8px;padding:10px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;z-index:2;">Забрать</button></div></div>'; this._openScreen('Поражение', 'dungeon_fight', h); },
    _claimReward: function() { this._pendingRewards = null; if (this._afterRewardAction) { var cb = this._afterRewardAction; this._afterRewardAction = null; cb(); } },

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
    for (var id in skills) { var s=skills[id]; h+='<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px;margin-bottom:8px;display:flex;align-items:center;gap:10px;"><img src="'+s.icon+'" style="width:44px;height:44px;object-fit:contain;"><div style="flex:1;"><div style="color:#e0c080;">'+s.name+'</div><div style="color:#aaa;font-size:0.7em;">'+s.description+'</div></div>';
    if (s.unlocked) h+='<div style="color:#4caf50;font-size:0.7em;">Открыт</div>';
    else h+='<button onclick="SherwoodUI._unlockTalent(\''+id+'\')" style="background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Изучить ('+s.cost+' Золота)</button>';
    h+='</div>'; }
    h += '</div>';
    this._openScreen('Таланты', 'talents', h);
},

_unlockTalent: function(id) { if(!Sherwood.Combat||!Sherwood.Combat.unlockSkill) return; var r=Sherwood.Combat.unlockSkill(id); if(r.success){this.updateDisplay();this.talents();} else this._showToast(r.reason||'Ошибка'); },
// ========== ПОДЗЕМКА ==========
     subway: function() { this.showDungeon(); },
    showDungeon: function() {
    this._playSound('click');
    if (this._currentMusicKey === 'main_theme' || this._currentMusicKey === 'main_theme_2') {
        this._mainThemeWasPlaying = true;
        this._mainThemeKey = this._currentMusicKey;
        this._mainThemeTime = this._currentMusic ? this._currentMusic.currentTime : 0;
    }
    this._playMusic('dungeon_1');
    
    var dungeons = Sherwood.Dungeon ? Sherwood.Dungeon.getAvailable() : {};
    var dungeonList = [
        { id: 'forest', name: 'Проклятая чаща', icon: 'the_cursed_thicket.png' },
        { id: 'swamp', name: 'Первородное болото', icon: 'primordial_swamp.png' },
        { id: 'cave', name: 'Базальтовый грот', icon: 'basalt_grotto.png' }
    ];
    
    var h = '';
    var p = Sherwood.getPlayer();
    var tickets = p ? (p.dungeon ? p.dungeon.tickets : 0) : 0;
    
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
                h += '<div style="color:#aaa;font-size:0.65em;">Нужно пройти последний этаж предыдущей подземки на 3 кубка</div>';
            }
            
            h += '</div>';
        }
    }
    
    h += '<div style="color:#aaa;font-size:0.85em;margin-top:16px;text-align:center;">Билетов: ' + tickets + '</div>';
    
    var bgImage = 'assets/dungeon_tiles/visual_dungeon/sherwood_thicket.png';
    
    try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = 'none'; }); }); } catch(e) {}
    this.container.style.background = "url('" + bgImage + "') center/cover no-repeat";
    
    if (this._screenLayer) { 
        this._screenLayer.innerHTML = '<div style="height:100%;background:rgba(0,0,0,0.3);display:flex;flex-direction:column;overflow:hidden;"><div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;"><button onclick="SherwoodUI.loadHome()" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">Подземелья</span></div><div style="flex:1;overflow-y:auto;overflow-x:hidden;padding:20px;padding-top:30px;padding-bottom:40px;-webkit-overflow-scrolling:touch;">' + h + '</div></div>'; 
        this._screenLayer.style.display = 'block'; 
    }
},

_showDungeonLevels: function(dungeonId) {
    var dungeons = Sherwood.Dungeon ? Sherwood.Dungeon.getAvailable() : {};
    var d = dungeons[dungeonId];
    if (!d) return;
    
    var progress = Sherwood.Dungeon._progress[dungeonId] || { level: 1, cups: {} };
    var cups = progress.cups || {};
    var dungeonNames = { forest: 'Проклятая чаща', swamp: 'Первородное болото', cave: 'Базальтовый грот' };
    var dungeonIcons = { forest: 'the_cursed_thicket.png', swamp: 'primordial_swamp.png', cave: 'basalt_grotto.png' };
    
    var tp, te;
    if (dungeonId === 'forest') {
        tp = 'assets/dungeon_tiles/dungeon1/tiles';
        te = '.jpeg';
    } else if (dungeonId === 'swamp') {
        tp = 'assets/dungeon_tiles/dungeon2/tiles2.';
        te = '.png';
    } else {
        tp = 'assets/dungeon_tiles/dungeon3/tiles3.';
        te = '.png';
    }
    
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
            if (c < cupCount) {
                h += '<img src="assets/interface/resource_cup_for_completed_tasks.png" style="width:16px;height:16px;object-fit:contain;">';
            } else {
                h += '<div style="width:16px;height:16px;"></div>';
            }
        }
        h += '</div>';
        
        h += '<div onclick="' + (unlocked ? 'SherwoodUI._showDungeonActions(\'' + dungeonId + '\',' + lvl + ')' : '') + '" style="width:56px;height:56px;background-image:url(\'' + img + '\');background-size:cover;background-position:center;border:2px solid ' + (unlocked ? '#c9a040' : '#555') + ';border-radius:8px;cursor:' + (unlocked ? 'pointer' : 'default') + ';display:flex;align-items:center;justify-content:center;position:relative;margin:0 auto;">';
        h += '<span style="position:absolute;bottom:2px;right:4px;font-size:0.6em;color:' + (unlocked ? '#000' : '#888') + ';font-weight:bold;">' + lvl + '</span>';
        h += '</div>';
        
        h += '</div>';
    }
    
    h += '</div>';
    
    var bgImage = 'assets/dungeon_tiles/visual_dungeon/sherwood_thicket.png';
    
    if (this._screenLayer) { 
        this._screenLayer.innerHTML = '<div style="height:100%;background:url(\'' + bgImage + '\') center/cover no-repeat;display:flex;flex-direction:column;overflow:hidden;"><div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;"><button onclick="SherwoodUI.showDungeon()" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">Выбор этажа</span></div><div style="flex:1;overflow-y:auto;overflow-x:hidden;padding:20px;-webkit-overflow-scrolling:touch;">' + h + '</div></div>'; 
        this._screenLayer.style.display = 'block'; 
    }
},

_showDungeonActions: function(dungeonId, level) {
    var progress = Sherwood.Dungeon._progress[dungeonId] || { level: 1, cups: {} };
    var cups = progress.cups || {};
    var cupCount = cups[level] || 0;
    var maxCups = 3;
    var autoFightCups = 5;
    var p = Sherwood.getPlayer();
    var autoTickets = Sherwood.Bag.getResource('autoFightTickets');
    
    var h = '<div style="text-align:center;padding:20px;">';
    h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:12px;">Этаж ' + level + '</div>';
    
    h += '<div style="margin-bottom:16px;">';
    for (var c = 0; c < maxCups; c++) {
        h += '<img src="assets/interface/resource_cup_for_completed_tasks.png" style="width:24px;height:24px;object-fit:contain;margin:0 2px;' + (c >= cupCount ? 'opacity:0.3;' : '') + '">';
    }
    h += '<div style="color:#aaa;font-size:0.7em;">' + cupCount + '/' + maxCups + ' кубков</div>';
    h += '</div>';
    
    h += '<button onclick="SherwoodUI._startDungeon(\'' + dungeonId + '\',' + level + ')" style="display:block;width:80%;margin:0 auto 8px;background:#c9a040;border:none;border-radius:8px;padding:12px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">Войти (1 билет)</button>';
    
    if (cupCount >= autoFightCups) {
        if (Sherwood.Dungeon.isAutoFightActive()) {
            h += '<div style="width:80%;margin:0 auto 8px;background:#555;border:none;border-radius:8px;padding:12px;color:#999;font-size:0.9em;">Автобой уже активен</div>';
        } else {
            h += '<button onclick="SherwoodUI._startAutoFight(\'' + dungeonId + '\',' + level + ',false)" style="display:block;width:80%;margin:0 auto 8px;background:#ff9800;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.9em;">Автобой (15 мин) — 50 золота</button>';
        }
        
        if (autoTickets > 0) {
            h += '<button onclick="SherwoodUI._startAutoFight(\'' + dungeonId + '\',' + level + ',true)" style="display:block;width:80%;margin:0 auto 8px;background:#4caf50;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.9em;">Мгновенный автобой — 1 тикет (' + autoTickets + ' шт.)</button>';
        } else {
            h += '<div style="width:80%;margin:0 auto 8px;background:#555;border:none;border-radius:8px;padding:12px;color:#999;font-size:0.9em;">Мгновенный автобой — нет тикетов</div>';
        }
    }
    
    h += '<div style="color:#aaa;font-size:0.65em;margin-top:8px;">3 кубка — следующий этаж. 5 кубков — автобой.</div>';
    h += '</div>';
    
    if (this._screenLayer) { 
        this._screenLayer.innerHTML = '<div style="height:100%;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;overflow:hidden;"><div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;"><button onclick="SherwoodUI._showDungeonLevels(\'' + dungeonId + '\')" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">Действия</span></div><div style="flex:1;overflow-y:auto;overflow-x:hidden;padding:20px;display:flex;align-items:center;justify-content:center;">' + h + '</div></div>'; 
        this._screenLayer.style.display = 'block'; 
    }
},

_startAutoFight: function(dungeonId, level, instant) {
    var result = Sherwood.Dungeon.startAutoFight(dungeonId, level, instant);
    if (result.success) {
        if (result.instant) {
            this._showToast('Автобой завершён! Кубок получен.');
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
    if (!Sherwood.Dungeon || !Sherwood.Dungeon.generate) return; 
    var d = Sherwood.Dungeon.generate(id, level); 
    if (!d) { this._showToast('Нет билетов!'); return; } 
    this._renderDungeon(); 
},

    _renderDungeon: function() {
    var d = Sherwood.Dungeon.getDungeon(); if (!d) { this.showDungeon(); return; }
    var p = Sherwood.getPlayer();
    var dungeons = Sherwood.Dungeon.getAvailable(), dd = dungeons[d.id] || { bg: this._bg.dungeon_forest, tiles: "dungeon1", ext: ".jpeg" };
    this.container.style.background = "url(" + dd.bg + ") center/cover no-repeat";
    try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = "none"; }); }); } catch(e) {}
    var dungId = d.id || 'forest';
    var altarImg = dungId === 'forest' ? 'assets/interface/altar_of_the_first_dungeon.png' : dungId === 'swamp' ? 'assets/interface/altar_of_the_second_dungeon.png' : 'assets/interface/the_third_altar_of_the_dungeon.png';
    var cauldronImg = dungId === 'forest' ? 'assets/interface/cauldron_first_dungeon.png' : dungId === 'swamp' ? 'assets/interface/cauldron_of_the_second_dungeon.png' : 'assets/interface/the_third_cauldron_of_the_dungeon.png';
    var chestLockedImg = dungId === 'forest' ? 'assets/interface/locked_chest_first_dungeon.png' : dungId === 'swamp' ? 'assets/interface/locked_chest_second_dungeon.png' : 'assets/interface/locked_chest_third_dungeon.png';
    var chestOpenImg = dungId === 'forest' ? 'assets/interface/open_chest_first_dungeon.png' : dungId === 'swamp' ? 'assets/interface/open_chest_of_the_second_dungeon.png' : 'assets/interface/open_chest_third_dungeon.png';
    
    var exitImg, exitLockedImg = 'assets/interface/closed_level_lock_icon.png';
    if (dungId === 'forest') {
        exitImg = 'assets/interface/exit_completion_dungeon.png';
    } else if (dungId === 'swamp') {
        exitImg = 'assets/interface/completion_of_the_second_underground_level.png';
    } else {
        exitImg = 'assets/interface/completion_of_level_three_subway.png';
    }
    
    var size = d.size, cs = Math.floor(Math.min(this.container.clientWidth, this.container.clientHeight - 80) / 4);
    var floorBg = "assets/dungeon_tiles/" + dd.tiles + "/floorBg_" + (d.id === "forest" ? "1" : d.id === "swamp" ? "2" : "3") + ".png";
    var px = d.px, py = d.py;
    var gridW = cs * size, gridH = cs * size;
    var scrollX = Math.max(0, Math.min(px * cs - this.container.clientWidth / 2 + cs / 2, gridW - this.container.clientWidth));
    var scrollY = Math.max(0, Math.min(py * cs - (this.container.clientHeight - 80) / 2 + cs / 2, gridH - (this.container.clientHeight - 80)));

    var html = "<div style='position:relative;width:" + gridW + "px;height:" + gridH + "px;background-image:url(" + floorBg + ");background-size:100% 100%;overflow:hidden;font-size:0;line-height:0;'>";
    html += "<div style='position:absolute;left:" + (-scrollX) + "px;top:" + (-scrollY) + "px;width:" + gridW + "px;height:" + gridH + "px;font-size:0;line-height:0;'>";

    for (var y = 0; y < size; y++) { 
        for (var x = 0; x < size; x++) { 
            var cellData = d.grid[y] && d.grid[y][x];
            if (!cellData || cellData.open) continue;
            html += "<img src='assets/interface/labyrinth_asset.png' style='position:absolute;left:" + (x*cs) + "px;top:" + (y*cs) + "px;width:" + cs + "px;height:" + cs + "px;z-index:2;'>"; 
        } 
    }

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
                else if (cell.open && cell.lootCollected) content = "<img src='assets/interface/empty_bag_of_loot_beasts.png' style='width:70%;height:70%;object-fit:contain;'>";
                else if (cell.open && cell.chest) content = "<img src='" + (cell.looted ? chestOpenImg : chestLockedImg) + "' style='width:80%;height:80%;object-fit:contain;'>";
                else if (cell.open && cell.altar) content = "<img src='" + altarImg + "' style='width:80%;height:80%;object-fit:contain;'>";
                else if (cell.open && cell.cauldron) content = "<img src='" + cauldronImg + "' style='width:80%;height:80%;object-fit:contain;'>";
                else if (cell.open && cell.potion) content = "<img src='assets/interface/resource_life_potion.png' style='width:70%;height:70%;object-fit:contain;'>";
                else if (cell.open && cell.exit) content = cell.locked ? "<img src='" + exitLockedImg + "' style='width:80%;height:80%;object-fit:contain;'>" : "<img src='" + exitImg + "' style='width:80%;height:80%;object-fit:contain;'>";
            }
            if (isPlayer) {
                if (d.isMoving) {
                    var vf = "step_down.webm"; if (d.heroDirection === "up") vf = "step_up.webm"; else if (d.heroDirection === "left") vf = "step_left.webm"; else if (d.heroDirection === "right") vf = "step_right.webm";
                    content = "<video autoplay muted playsinline style='position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:4;'><source src='assets/animation/" + vf + "' type='video/webm'></video>";
                } else {
                    var hi = "assets/animation/step_down.png"; if (d.heroDirection === "up") hi = "assets/animation/step_up.png"; else if (d.heroDirection === "left") hi = "assets/animation/step_left.png"; else if (d.heroDirection === "right") hi = "assets/animation/step_right.png";
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
        "<div style='position:relative;width:300px;height:150px;'>" +
        "<img src='assets/interface/life_scale.png' style='width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;'>" +
        "<div style='position:absolute;top:100px;left:28px;right:28px;bottom:14px;overflow:hidden;z-index:0;'>" +
        "<div style='background:url(assets/interface/life_interface_asset_horizontal_progress_bar.jpeg) left/auto 100%;height:100%;width:" + hpPct + "%;transition:width 0.5s;'></div>" +
        "</div>" +
        "<span style='position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.7em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;'>" + hp + "/" + maxHp + "</span>" +
        "</div>" +
        "</div>" +
        "<div style='background:rgba(0,0,0,0.5);padding:3px;text-align:center;flex-shrink:0;'><span style='font-size:10px;color:#aaa;'>" + (d.monstersKilled||0) + "/" + (d.totalMonsters||0) + " | " + (d.monstersKilled >= d.totalMonsters ? "EXIT OPEN" : "KILL ALL") + "</span></div>";

    if (this._screenLayer) { 
        this._screenLayer.innerHTML = "<div style='min-height:100%;background:rgba(0,0,0,0.4);display:flex;flex-direction:column;'>" + topBar + "<div style='flex:1;overflow:auto;'>" + html + "</div></div>"; 
        this._screenLayer.style.display = "block"; 
    }
},
    _dungeonMove: function(tx, ty) {
    var d = Sherwood.Dungeon.getDungeon(); 
    if (!d) return;
    
    var cell = d.grid[ty] && d.grid[ty][tx];
    if (!cell) return;
    
    var dist = Math.abs(d.px - tx) + Math.abs(d.py - ty);
    
    if (tx === d.px && ty === d.py) {
        if (cell.lootBag && !cell.lootCollected) { this._showInteractButton('lootBag'); return; }
        if (cell.chest && !cell.looted) { this._showInteractButton('chest'); return; }
        if (cell.altar && !cell.altarCollected) { this._showInteractButton('altar'); return; }
        if (cell.cauldron && !cell.cauldronCollected) { this._showInteractButton('cauldron'); return; }
        if (cell.potion && !cell.potionCollected) { this._showInteractButton('potion'); return; }
        if (cell.exit && !cell.locked) { this._doStep(tx, ty); return; }
        if (cell.exit && cell.locked) { this._showToast('Kill all monsters first!'); return; }
        return;
    }
    
    if (!cell.open && dist === 1) {
        if (cell.type === 0) return;
        cell.open = true;
        this._playSound('tile_open');
        this._renderDungeon();
        return;
    }
    
    if (cell.open && dist === 1) {
        if (cell.exit && cell.locked) {
            this._showToast('Kill all monsters first!');
            return;
        }
        this._doStep(tx, ty);
        return;
    }
    
    if (cell.open && dist > 1) {
        this._walkPath(tx, ty);
        return;
    }
},

_walkPath: function(toX, toY) {
    var d = Sherwood.Dungeon.getDungeon(); 
    if (!d) return;
    
    var size = d.size;
    var visited = {};
    var queue = [{x: d.px, y: d.py, path: []}];
    visited[d.py + ',' + d.px] = true;
    var dirs = [[0,-1],[0,1],[-1,0],[1,0]];
    
    while (queue.length > 0) {
        var cur = queue.shift();
        if (cur.x === toX && cur.y === toY) {
            if (cur.path.length === 0) return;
            d.isMoving = true;
            this._renderDungeon();
            var self = this;
            var i = 0;
            
            function nextStep() {
                if (i >= cur.path.length) {
                    d.isMoving = false;
                    self._stopSound('steps');
                    self._renderDungeon();
                    return;
                }
                self._doStep(cur.path[i].x, cur.path[i].y);
                i++;
                if (i < cur.path.length) {
                    setTimeout(nextStep, 1000);
                } else {
                    setTimeout(function() {
                        d.isMoving = false;
                        self._stopSound('steps');
                        self._renderDungeon();
                    }, 1000);
                }
            }
            nextStep();
            return;
        }
        for (var j = 0; j < dirs.length; j++) {
            var nx = cur.x + dirs[j][0], ny = cur.y + dirs[j][1];
            if (nx >= 0 && nx < size && ny >= 0 && ny < size && !visited[ny + ',' + nx]) {
                var c = d.grid[ny][nx];
                if (c && c.open && !c.monster) {
                    visited[ny + ',' + nx] = true;
                    queue.push({x: nx, y: ny, path: cur.path.concat([{x: nx, y: ny}])});
                }
            }
        }
    }
},

_doStep: function(tx, ty) {
    var d = Sherwood.Dungeon.getDungeon(); 
    if (!d) return;
    
    var prevX = d.px;
    var prevY = d.py;
    
    if (tx > d.px) d.heroDirection = 'right';
    else if (tx < d.px) d.heroDirection = 'left';
    else if (ty > d.py) d.heroDirection = 'down';
    else if (ty < d.py) d.heroDirection = 'up';
    
    var res = Sherwood.Dungeon.move(tx, ty);
    if (!res || !res.ok) { 
        this._stopSound('steps'); 
        this._renderDungeon(); 
        return; 
    }
    
    this._playSound('steps');
    
    var currentCell = d.grid[d.py][d.px];
    if (currentCell && currentCell.lootBag && !currentCell.lootCollected) {
        currentCell.lootCollected = false;
        currentCell.lootBag = true;
    }
    
    this._renderDungeon();
    SherwoodUI.updateDisplay();
    
    if (res.type === 'battle') { 
        this._stopSound('steps'); 
        d.isMoving = false;
        d.px = prevX;
        d.py = prevY;
        this._renderDungeon();
        this._pauseMusic(); 
        this._playSound('trap'); 
        Sherwood.Combat.start(res.monsterId, res.boss, 'dungeon'); 
        setTimeout(function() { SherwoodUI._showCombatScreen(); }, 400); 
        return; 
    }
    
    if (res.type === 'lootBag' && currentCell && !currentCell.lootCollected) { 
        this._stopSound('steps'); 
        this._playSound('bag_drop'); 
        this._showInteractButton('lootBag'); 
        return; 
    }
    
    if (res.type === 'chest' && currentCell && !currentCell.looted) { 
        this._stopSound('steps'); 
        this._playSound('chest_open'); 
        this._showInteractButton('chest'); 
        return; 
    }
    
    if (res.type === 'altar' && currentCell && !currentCell.altarCollected) { 
        this._stopSound('steps'); 
        this._playSound('altar'); 
        this._showInteractButton('altar'); 
        return; 
    }
    
    if (res.type === 'cauldron' && currentCell && !currentCell.cauldronCollected) { 
        this._stopSound('steps'); 
        this._playSound('cauldron'); 
        this._showInteractButton('cauldron'); 
        return; 
    }
    
    if (res.type === 'potion' && currentCell && !currentCell.potionCollected) { 
        this._stopSound('steps'); 
        this._playSound('potion'); 
        this._showInteractButton('potion'); 
        return; 
    }
    
    if (res.type === 'exit') { 
    this._stopSound('steps'); 
    this._stopMusic(); 
    var reward = Sherwood.Dungeon.complete(); 
    SherwoodUI._addWalletSilver(Math.floor((reward.silver || 0) * 0.1));
    SherwoodUI.updateDisplay(); 
    this._afterRewardAction = function() { 
        SherwoodUI._playMusic('main_theme'); 
        SherwoodUI.showDungeon(); 
    }; 
    this._showVictoryScreen(reward); 
    return; 
}
    
    if (res.type === 'exit_locked') { 
        this._stopSound('steps'); 
        this._showToast('Закрыто! Убейте всех монстров!'); 
        return; 
    }
    
    this._stopSound('steps');
},
_showInteractButton: function(type) {
    var self = this;
    var d = Sherwood.Dungeon.getDungeon();
    if (!d) return;
    var dungId = d.id || 'forest';
    var icon = '';
    
    var altarImg = dungId === 'forest' ? 'assets/interface/altar_of_the_first_dungeon.png' : dungId === 'swamp' ? 'assets/interface/altar_of_the_second_dungeon.png' : 'assets/interface/the_third_altar_of_the_dungeon.png';
    var cauldronImg = dungId === 'forest' ? 'assets/interface/cauldron_first_dungeon.png' : dungId === 'swamp' ? 'assets/interface/cauldron_of_the_second_dungeon.png' : 'assets/interface/the_third_cauldron_of_the_dungeon.png';
    var chestImg = dungId === 'forest' ? 'assets/interface/locked_chest_first_dungeon.png' : dungId === 'swamp' ? 'assets/interface/locked_chest_second_dungeon.png' : 'assets/interface/locked_chest_third_dungeon.png';
    
    if (type === 'altar') icon = altarImg;
    else if (type === 'cauldron') icon = cauldronImg;
    else if (type === 'potion') icon = 'assets/interface/resource_life_potion.png';
    else if (type === 'chest') icon = chestImg;
    else if (type === 'lootBag') icon = 'assets/interface/loot_bag_of_beasts.png';
    
    var oldBtn = document.getElementById('interact-btn');
    if (oldBtn) oldBtn.remove();
    
    var cell = d.grid[d.py][d.px];
    
    if (type === 'lootBag' && cell && cell.lootCollected) return;
    if (type === 'chest' && cell && cell.looted) return;
    if (type === 'altar' && cell && cell.altarCollected) return;
    if (type === 'cauldron' && cell && cell.cauldronCollected) return;
    if (type === 'potion' && cell && cell.potionCollected) return;
    
    var btn = document.createElement('div');
    btn.id = 'interact-btn';
    btn.style.cssText = 'position:absolute;bottom:20%;left:50%;transform:translateX(-50%);z-index:100;width:80px;height:80px;background:rgba(0,0,0,0.8);border:3px solid #c9a040;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;pointer-events:auto;';
    btn.innerHTML = '<img src="' + icon + '" style="width:56px;height:56px;object-fit:contain;">';
    
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        btn.remove();
        
        if (type === 'altar') self._collectAltar();
        else if (type === 'cauldron') self._collectCauldron();
        else if (type === 'potion') self._collectPotion();
        else if (type === 'chest') self._collectChest();
        else if (type === 'lootBag') self._collectLootBag();
    });
    
    this._screenLayer.appendChild(btn);
    
    if (type === 'chest' || type === 'lootBag') {
        var reward = (cell && cell.reward) ? cell.reward : { gold: 5, silver: 200 };
        var flyEl = document.createElement('div');
        flyEl.style.cssText = 'position:fixed;top:10%;left:50%;transform:translateX(-50%);z-index:101;color:#ffd700;font-size:1.2em;font-weight:bold;text-shadow:0 0 10px #000;animation:lootFly 1.5s ease-out forwards;pointer-events:none;';
        var flyHtml = '';
        if (reward.gold) flyHtml += '+' + reward.gold + ' <img src="assets/interface/resource_gold.png" style="width:20px;height:20px;vertical-align:middle;"> ';
        if (reward.silver) flyHtml += '+' + reward.silver + ' <img src="assets/interface/resource_silver.png" style="width:20px;height:20px;vertical-align:middle;"> ';
        flyEl.innerHTML = flyHtml;
        this._screenLayer.appendChild(flyEl);
        setTimeout(function() { if (flyEl.parentNode) flyEl.parentNode.removeChild(flyEl); }, 1600);
    }
},
_collectAltar: function() {
    var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
    var cell = d.grid[d.py][d.px]; if (!cell || !cell.altar) return;
    var scrolls = 1 + Math.floor(Math.random() * 3);
    var silver = 100 + Math.floor(Math.random() * 200);
    Sherwood.addResource('scrolls', scrolls);
    Sherwood.addResource('silver', silver);
    cell.altarCollected = true;
    if (!d.collectedLoot) d.collectedLoot = [];
    d.collectedLoot.push({ icon: 'assets/interface/resource_appearance_crafting_tablet.png', name: 'Свитки', quantity: scrolls });
    d.collectedLoot.push({ icon: 'assets/interface/silver_plaque.png', name: 'Серебро', quantity: silver });
    this._playSound('altar');
    this._showFlyingLoot([{ icon: 'assets/interface/resource_appearance_crafting_tablet.png', text: '+' + scrolls }, { icon: 'assets/interface/silver_plaque.png', text: '+' + silver }]);
    SherwoodUI.updateDisplay();
},

_collectCauldron: function() {
    var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
    var cell = d.grid[d.py][d.px]; if (!cell || !cell.cauldron) return;
    var gold = 1 + Math.floor(Math.random() * 3);
    var silver = 50 + Math.floor(Math.random() * 150);
    Sherwood.addResource('gold', gold);
    Sherwood.addResource('silver', silver);
    cell.cauldronCollected = true;
    if (!d.collectedLoot) d.collectedLoot = [];
    d.collectedLoot.push({ icon: 'assets/interface/gold_plate.png', name: 'Золото', quantity: gold });
    d.collectedLoot.push({ icon: 'assets/interface/silver_plaque.png', name: 'Серебро', quantity: silver });
    this._playSound('cauldron');
    this._showFlyingLoot([{ icon: 'assets/interface/gold_plate.png', text: '+' + gold }, { icon: 'assets/interface/silver_plaque.png', text: '+' + silver }]);
    SherwoodUI.updateDisplay();
},
_collectPotion: function() {
    var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
    var cell = d.grid[d.py][d.px]; if (!cell || !cell.potion) return;
    var p = Sherwood.getPlayer();
    if (p.stats.hp >= p.stats.maxHp) { this._showToast('HP уже полное!'); return; }
    var heal = d.id === 'cave' ? Math.floor(p.stats.maxHp * 0.4) : Math.floor(p.stats.maxHp * 0.2);
    p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
    cell.potionCollected = true;
    if (!d.collectedLoot) d.collectedLoot = [];
    d.collectedLoot.push({ icon: 'assets/interface/icon_health.png', name: 'Здоровье', quantity: heal });
    this._playSound('potion');
    this._showFlyingLoot([{ icon: 'assets/interface/icon_health.png', text: '+' + heal + ' HP' }]);
    Sherwood.saveGame();
    SherwoodUI.updateDisplay();
    this._renderDungeon();
},

_collectChest: function() {
    var d = Sherwood.Dungeon.getDungeon(); 
    if (!d) return;
    var cell = d.grid[d.py][d.px]; 
    if (!cell || !cell.chest || cell.looted) return;
    
    cell.looted = true;
    d.chestsOpened = (d.chestsOpened || 0) + 1;
    
    var g = cell.reward ? (cell.reward.gold || 1) : 1;
    var s = cell.reward ? (cell.reward.silver || 200) : 200;
    
    Sherwood.addResource('gold', g);
    Sherwood.addResource('silver', s);
    if (Sherwood.Daily) Sherwood.Daily.updateProgress('open_chests', 1);
    
    if (!d.collectedLoot) d.collectedLoot = [];
    d.collectedLoot.push({ icon: 'assets/interface/gold_plate.png', name: 'Золото', quantity: g });
    d.collectedLoot.push({ icon: 'assets/interface/silver_plaque.png', name: 'Серебро', quantity: s });
    
    this._playSound('chest_open');
    this._showFlyingLoot([
        { icon: 'assets/interface/gold_plate.png', text: '+' + g },
        { icon: 'assets/interface/silver_plaque.png', text: '+' + s }
    ]);
    
    Sherwood.saveGame();
    SherwoodUI.updateDisplay();
    this._renderDungeon();
},

_collectLootBag: function() {
    var d = Sherwood.Dungeon.getDungeon(); 
    if (!d) return;
    var cell = d.grid[d.py][d.px]; 
    if (!cell || !cell.lootBag || cell.lootCollected) return;
    
    cell.lootCollected = true;
    cell.lootBag = false;
    
    var reward = cell.reward || { gold: 1, silver: 100, exp: 10 };
    if (reward.exp) Sherwood.addExp(reward.exp);
    if (reward.gold) Sherwood.addResource('gold', reward.gold);
    if (reward.silver) Sherwood.addResource('silver', reward.silver);
    
    if (!d.collectedLoot) d.collectedLoot = [];
    if (reward.exp) d.collectedLoot.push({ icon: 'assets/interface/icon_health.png', name: 'Опыт', quantity: reward.exp });
    if (reward.gold) d.collectedLoot.push({ icon: 'assets/interface/gold_plate.png', name: 'Золото', quantity: reward.gold });
    if (reward.silver) d.collectedLoot.push({ icon: 'assets/interface/silver_plaque.png', name: 'Серебро', quantity: reward.silver });
    
    this._playSound('bag_drop');
    this._showFlyingLoot([
        { icon: 'assets/interface/gold_plate.png', text: '+' + (reward.gold || 0) },
        { icon: 'assets/interface/silver_plaque.png', text: '+' + (reward.silver || 0) }
    ]);
    
    Sherwood.saveGame();
    SherwoodUI.updateDisplay();
    this._renderDungeon();
},

_showFlyingLoot: function(items) {
    this._playSound('loot_fly');
    var self = this;
    var bagIcon = document.querySelector('.btn[data-action="bag"]');
    var containerRect = this.container.getBoundingClientRect();
    var targetX = containerRect.width - 50;
    var targetY = 50;
    if (bagIcon) {
        var bagRect = bagIcon.getBoundingClientRect();
        targetX = bagRect.left - containerRect.left + bagRect.width / 2;
        targetY = bagRect.top - containerRect.top;
    }
    for (var i = 0; i < items.length; i++) {
        (function(item, index) {
            var el = document.createElement('div');
            el.style.cssText = 'position:absolute;bottom:25%;left:50%;z-index:200;width:40px;height:40px;background:rgba(0,0,0,0.8);border:1px solid #c9a040;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all 0.8s ease-out;';
            el.innerHTML = '<img src="' + item.icon + '" style="width:24px;height:24px;object-fit:contain;"><span style="color:#ffd700;font-size:0.5em;">' + item.text + '</span>';
            self._screenLayer.appendChild(el);
            setTimeout(function() { el.style.left = targetX + 'px'; el.style.top = targetY + 'px'; el.style.bottom = 'auto'; el.style.opacity = '0'; el.style.transform = 'scale(0.5)'; }, 50 + index * 100);
            setTimeout(function() { el.remove(); }, 900 + index * 100);
        })(items[i], i);
    }
},

_leaveDungeon: function() {
    if (Sherwood.Dungeon) Sherwood.Dungeon.leave();
    this._stopMusic();
    if (this._mainThemeWasPlaying && this._mainThemeKey) {
        this._playMusic(this._mainThemeKey);
        if (this._currentMusic && this._mainThemeTime) {
            this._currentMusic.currentTime = this._mainThemeTime;
        }
        this._mainThemeWasPlaying = false;
    } else {
        this._playMusic('main_theme');
    }
    this.showDungeon();
},
    
_withdrawKeset: function() {
    var p = Sherwood.getPlayer();
    if (!p.keset || p.keset.silver < (p.keset.minWithdraw || 10000)) {
        this._showToast('Недостаточно серебра в кесете. Минимум: ' + (p.keset ? p.keset.minWithdraw : 10000));
        return;
    }
    var amount = p.keset.silver;
    p.keset.silver = 0;
    p.resources.silver = (p.resources.silver || 0) + amount;
    Sherwood.saveGame();
    this.updateDisplay();
    this._showToast('Снято: ' + amount + ' серебра из кесета');
},

// ========== БОЙ ==========
_showBattleScreen: function(enemyData, mode, modeTitle, extraInfo, onAttack, onFlee, customBg) {
    var e = enemyData, p = Sherwood.getPlayer();
    var ehp = e.maxHp > 0 ? Math.round((e.hp / e.maxHp) * 100) : 100, php = p.stats.maxHp > 0 ? Math.round((p.stats.hp / p.stats.maxHp) * 100) : 100;
    var activeSkin = (Sherwood.Forge && Sherwood.Forge.getActiveSkin ? Sherwood.Forge.getActiveSkin() : 'skin1_01');
    var imgPath = (mode === 'arena') ? e.image : 'assets/all_beasts/' + e.image;
    var h = '<div style="text-align:center;">';
    
    h += '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:2px;">';
    h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_power.png" style="width:28px;height:28px;"><span style="color:#fff;font-size:0.8em;font-weight:bold;">' + p.stats.attack + '</span></div>';
    h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_defense.png" style="width:28px;height:28px;"><span style="color:#fff;font-size:0.8em;font-weight:bold;">' + p.stats.defense + '</span></div>';
    h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_health.png" style="width:28px;height:28px;"><span style="color:#fff;font-size:0.8em;font-weight:bold;">' + p.stats.hp + '/' + p.stats.maxHp + '</span></div>';
    h += '</div>';
    
    h += '<div style="color:#f44336;font-weight:bold;font-size:1.1em;margin-bottom:2px;">' + e.name + '</div>';
    
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:4px;">';
    h += '<div style="width:48px;height:48px;border-radius:50%;border:2px solid #f44336;overflow:hidden;flex-shrink:0;"><img src="' + imgPath + '" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display=&quot;none&quot;"></div>';
    h += '<div style="position:relative;width:300px;height:150px;">';
    h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;">';
    h += '<div style="position:absolute;top:100px;left:28px;right:28px;bottom:14px;overflow:hidden;z-index:0;">';
    h += '<div id="enemy-hp-bar" style="background:url(assets/interface/filling_the_poisoned_health_bar.jpeg) left/auto 100%;height:100%;width:' + ehp + '%;transition:width 0.5s ease-out;"></div>';
    h += '</div>';
    h += '<span id="enemy-hp-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.7em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;">' + e.hp + '/' + e.maxHp + '</span></div>';
    h += '</div>';
    
    h += '<div style="margin:4px 0;position:relative;display:inline-block;" id="enemy-card-area">';
    h += '<img src="' + imgPath + '" id="enemy-card" style="width:220px;height:220px;object-fit:contain;position:relative;z-index:1;border-radius:16px;transition:filter 0.15s;" onerror="this.style.display=&quot;none&quot;">';
    h += '<div id="enemy-hit-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;pointer-events:none;display:none;"></div>';
    h += '<div id="damage-numbers" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;pointer-events:none;"></div>';
    h += '</div>';
    
    var skills = Sherwood.Combat ? Sherwood.Combat.getSkills() : {};
    var unlockedSkills = [];
    for (var id in skills) { if (skills[id].unlocked) unlockedSkills.push(skills[id]); }
    
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:4px;margin:4px 0;">';
    for (var i = 0; i < Math.min(2, unlockedSkills.length); i++) {
        var sk = unlockedSkills[i];
        h += '<button onclick="SherwoodUI._useSkill(\'' + sk.id + '\')" style="background:rgba(201,168,76,0.2);border:1px solid #c9a040;border-radius:50%;width:46px;height:46px;cursor:pointer;padding:2px;position:relative;"><img src="' + sk.icon + '" style="width:100%;height:100%;object-fit:contain;border-radius:50%;"></button>';
    }
    h += '<button onclick="' + onAttack + '" style="background:url(assets/skills/skill_shot_normal.png) center/contain no-repeat;width:64px;height:64px;border:3px solid #c9a040;border-radius:50%;cursor:pointer;"></button>';
    for (var i = 2; i < unlockedSkills.length; i++) {
        var sk = unlockedSkills[i];
        h += '<button onclick="SherwoodUI._useSkill(\'' + sk.id + '\')" style="background:rgba(201,168,76,0.2);border:1px solid #c9a040;border-radius:50%;width:46px;height:46px;cursor:pointer;padding:2px;position:relative;"><img src="' + sk.icon + '" style="width:100%;height:100%;object-fit:contain;border-radius:50%;"></button>';
    }
    h += '</div>';
    
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin:2px 0;">';
    h += '<div id="player-avatar" style="width:48px;height:48px;border-radius:50%;border:2px solid #c9a040;overflow:hidden;flex-shrink:0;position:relative;">';
    h += '<img src="assets/hero_skins/' + activeSkin + '.png" style="width:100%;height:100%;object-fit:contain;position:relative;z-index:1;">';
    h += '<div id="player-hit-anim" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;display:none;"></div>';
    h += '</div>';
    h += '<div style="position:relative;width:300px;height:150px;">';
    h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;">';
    h += '<div style="position:absolute;top:100px;left:28px;right:28px;bottom:14px;overflow:hidden;z-index:0;">';
    h += '<div id="player-hp-bar" style="background:url(assets/interface/life_interface_asset_horizontal_progress_bar.jpeg) left/auto 100%;height:100%;width:' + php + '%;transition:width 0.5s ease-out;"></div>';
    h += '</div>';
    h += '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.7em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;">HP ' + p.stats.hp + '/' + p.stats.maxHp + '</span></div>';
    h += '</div>';
    
    h += '<div id="battle-dialog" style="background:rgba(0,0,0,0.75);border:1px solid #555;border-radius:8px;padding:6px;margin:4px 4%;min-height:55px;max-height:55px;overflow-y:auto;color:#aaa;font-size:0.65em;text-align:left;line-height:1.3;"></div>';
    h += '</div>';
    
    this._openScreen('', customBg || 'dungeon_fight', h);
},
_useSkill: function(skillId) {
    if (!Sherwood.Combat) return;
    this._playHitSounds();
    var r = Sherwood.Combat.useSkill(skillId);
    if (!r) return;
    if (r.error) { this._showDialog(r.error, '#ff9800'); return; }
    this._handleCombat(r);
},

_showDialog: function(msg, color) { var dlg = document.getElementById('battle-dialog'); if (dlg) { dlg.innerHTML += '<div style="color:' + (color||'#fff') + ';margin:1px 0;">' + msg + '</div>'; dlg.scrollTop = dlg.scrollHeight; } },

_showDamageNumber: function(dmg, isCrit) {
    var container = document.getElementById('damage-numbers');
    if (!container) return;
    var el = document.createElement('div');
    el.style.cssText = 'position:absolute;top:40%;left:50%;transform:translate(-50%,-50%);color:' + (isCrit ? '#ff6a00' : '#ffd700') + ';font-size:' + (isCrit ? '1.8em' : '1.2em') + ';font-weight:bold;text-shadow:0 0 8px #000;z-index:10;pointer-events:none;animation:dmgFloat 1s ease-out forwards;';
    el.textContent = (isCrit ? '💥 ' : '') + dmg;
    container.appendChild(el);
    setTimeout(function() { el.remove(); }, 1000);
},

_showPlayerHitAnim: function() {
    var container = document.getElementById('player-hit-anim');
    if (!container) return;
    container.style.display = 'block';
    container.innerHTML = '<video autoplay muted playsinline style="width:100%;height:100%;object-fit:cover;"><source src="assets/animation/hit.webm" type="video/webm"></video>';
    setTimeout(function() { container.style.display = 'none'; container.innerHTML = ''; }, 600);
},

_showCriticalHitAnim: function() {
    var overlay = document.getElementById('enemy-hit-overlay');
    if (!overlay) return;
    overlay.style.display = 'block';
    overlay.innerHTML = '<video autoplay muted playsinline style="width:100%;height:100%;object-fit:contain;"><source src="assets/animation/critical_hit.webm" type="video/webm"></video>';
    setTimeout(function() { overlay.style.display = 'none'; overlay.innerHTML = ''; }, 800);
},

_hitEnemyCard: function() {
    var card = document.getElementById('enemy-card');
    if (!card) return;
    card.style.transition = 'transform 0.1s, filter 0.15s';
    card.style.transform = 'translateX(2px) rotate(0.5deg) scale(0.95)';
    card.style.filter = 'brightness(1.3) saturate(2) hue-rotate(-10deg)';
    setTimeout(function() {
        card.style.transform = '';
        card.style.filter = '';
    }, 200);
},

_updateEnemyHP: function(hp, max) { 
    var bar = document.getElementById('enemy-hp-bar'), txt = document.getElementById('enemy-hp-text'); 
    if (bar) { var pct = max > 0 ? Math.round((hp / max) * 100) : 0; bar.style.width = pct + '%'; } 
    if (txt) txt.textContent = hp + '/' + max; 
    var p = Sherwood.getPlayer();
    if (p) { var playerBar = document.getElementById('player-hp-bar'); if (playerBar) { var php = p.stats.maxHp > 0 ? Math.round((p.stats.hp / p.stats.maxHp) * 100) : 0; playerBar.style.width = php + '%'; } }
},

_showCombatScreen: function() { 
    var b = Sherwood.Combat.getState(); 
    if (!b) { this._renderDungeon(); return; } 
    this._showBattleScreen({ name: b.enemyName, image: b.enemyImage, hp: b.enemyHp, maxHp: b.enemyMaxHp }, "dungeon", (b.isBoss ? "БОСС: " : "") + b.enemyName, "", "SherwoodUI._combatAttack()", "SherwoodUI._combatFlee"); 
},

_combatAttack: function() { this._playHitSounds(); this._handleCombat(Sherwood.Combat.attack()); },

_combatFlee: function() { var r = Sherwood.Combat.flee(); if (r.success) { this._resumeMusic(); this._leaveDungeon(); return; } if (r.lose) { this._showDialog('Поражение...', '#f44336'); this._resumeMusic(); var self = this; setTimeout(function() { self._leaveDungeon(); }, 1200); return; } this._showDialog('Побег не удался! Враг: -' + r.damage, '#ff9800'); this._showCombatScreen(); },

_handleCombat: function(r) {
    if (!r) return;
    if (r.win) {
        if (r.exp) Sherwood.addExp(r.exp);
        if (r.gold) { Sherwood.addResource('gold', r.gold); Sherwood.addResource('silver', Math.floor(r.gold * 2)); }
        Sherwood.saveGame();
        if (Sherwood.Daily) { Sherwood.Daily.updateProgress('kill_beasts', 1); Sherwood.Daily.updateProgress('collect_loot', 1); }
        if (Sherwood.Dungeon && Sherwood.Dungeon.killMonster) Sherwood.Dungeon.killMonster();
        if (Sherwood.Bestiary && r.enemyImage) Sherwood.Bestiary.registerKill(r.enemyImage);
        this._resumeMusic();
        this.updateDisplay();
        var d = Sherwood.Dungeon.getDungeon();
        if (d) {
            d.px = d.prevPx || d.px;
            d.py = d.prevPy || d.py;
        }
        this._renderDungeon();
    } else if (r.lose) {
        this._resumeMusic(); this.updateDisplay();
        var scrolls = Math.random() < 0.08 ? 1 : 0;
        if (scrolls) Sherwood.addResource('scrolls', scrolls);
        this._pendingRewards = { exp: Math.floor(r.exp * 0.3), silver: Math.floor(r.gold * 1.5), scrolls: scrolls };
        this._afterRewardAction = function() { SherwoodUI._leaveDungeon(); };
        this._showDefeatScreen(this._pendingRewards);
    } else {
        this._hitEnemyCard();
        this._showPlayerHitAnim();
        this._showDamageNumber(r.damage, r.crit);
        if (r.crit) this._showCriticalHitAnim();
        this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        this._showDialog((r.crit ? 'CRIT ' : '') + 'Damage: ' + r.damage, r.crit ? '#ff6a00' : '#fff');
        if (r.armorDmg) this._showDialog('Armor broken: ' + r.armorDmg, '#2196f3');
        if (r.enemy && r.enemy.damage) { var self = this; setTimeout(function() { self._showDialog((r.enemyName || 'Enemy') + ' hit: ' + r.enemy.damage, '#f44336'); }, 700); }
        this.updateDisplay(); var self = this; setTimeout(function() { self._showCombatScreen(); }, 1000);
    }
},

// ===== КВЕСТЫ =====
quest: function() {
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
    if (completed) {
        displayEnemy = ch.boss;
    } else if (isActive) {
        displayEnemy = Sherwood.Quests._currentEnemy;
    } else {
        displayEnemy = ch.enemies[0];
    }
    
    var isBoss = completed || (isActive && Sherwood.Quests._currentStage >= ch.stages - 1);
    var cardImg = isBoss ? 'assets/interface/quest_boss.png' : 'assets/interface/quest_regular.png';
    
    var h = '';
    h += '<div style="text-align:center;">';
    h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:4px;">Глава ' + ch.id + ' — ' + ch.name + '</div>';
    h += '<div style="color:#fff;font-size:1em;font-weight:bold;margin-bottom:4px;">' + displayEnemy.name + '</div>';
    h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:20px;">HP ' + displayEnemy.hp + ' | АТК ' + displayEnemy.atk + ' | ЗЩТ ' + displayEnemy.def + '</div>';
    
    h += '<div style="position:relative;display:block;width:360px;height:360px;margin:0 auto 24px;">';
    h += '<img src="' + cardImg + '" style="width:360px;height:360px;object-fit:contain;position:absolute;top:0;left:0;">';
    h += '<img src="assets/all_beasts/' + displayEnemy.image + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:210px;height:210px;object-fit:contain;">';
    h += '</div>';
    
    if (completed) {
        h += '<div style="color:#4caf50;font-size:1em;font-weight:bold;">Пройдено</div>';
    } else if (cooldown) {
        h += '<div style="color:#ff9800;font-size:1em;margin-bottom:8px;">Перезарядка: ' + cdRemain + ' мин.</div>';
        h += '<button onclick="SherwoodUI._questAccel()" style="background:#ff9800;border:none;border-radius:8px;padding:12px 30px;color:#fff;cursor:pointer;font-size:0.9em;">Ускорить (50 золота)</button>';
    } else if (isActive) {
        h += '<button onclick="SherwoodUI._showQuestBattle()" style="background:#c9a040;border:none;border-radius:8px;padding:12px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">В бой</button>';
    } else {
        h += '<button onclick="SherwoodUI._startQuest(' + ch.id + ')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">В бой</button>';
    }
    
    h += '</div>';
    
    var bgImage = 'assets/interface/quest_section.png';
    
    if (this._screenLayer) { 
        this._screenLayer.innerHTML = '<div style="height:100%;background:url(\'' + bgImage + '\') center/cover no-repeat;display:flex;flex-direction:column;overflow:hidden;"><div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;"><button onclick="SherwoodUI.loadHome()" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">Квесты</span></div><div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px;">' + h + '</div></div>'; 
        this._screenLayer.style.display = 'block'; 
    }
},

_prevChapter: function() { var p=Sherwood.getPlayer(),cur=p.questProgress.currentChapter||1; if(cur>1) p.questProgress.currentChapter=cur-1; Sherwood.saveGame(); this.quest(); },
_nextChapter: function() { var p=Sherwood.getPlayer(),cur=p.questProgress.currentChapter||1; if(cur<15&&p.questProgress.completed.indexOf(cur)!==-1) p.questProgress.currentChapter=cur+1; Sherwood.saveGame(); this.quest(); },
_questAccel: function() { var r=Sherwood.Quests.accelerate(); if(!r.success) this._showToast(r.reason); this.quest(); },
_startQuest: function(id) { var r=Sherwood.Quests.startChapter(id); if(!r.success) { if(r.cooldown) this.quest(); else this._showToast(r.reason||'Ошибка'); return; } this._stopMusic(); this._showQuestBattle(); },
_showQuestBattle: function() { 
    var e = Sherwood.Quests._currentEnemy;
    if (!e) { this.quest(); return; }
    var b = Sherwood.Quests.getBattle();
    var stageText = b ? 'Этап ' + b.stage + '/' + b.total : '';
    var chapterName = b ? b.chapter.name : '';
    this._showBattleScreen({ name:e.name, image:e.image, hp:e.hp, maxHp:e.maxHp }, 'quest', 'Глава ' + chapterName + ' - ' + stageText, '', "SherwoodUI._questAttack()", "SherwoodUI._questFlee()"); 
},
_questAttack: function() { this._playHitSounds(); this._handleQuestResult(Sherwood.Quests.attack()); },
_questFlee: function() { this._stopMusic(); Sherwood.Quests.flee(); this.quest(); },
_handleQuestResult: function(r) {
    if (!r) return;
    if (r.enemyDead) {
        var b = Sherwood.Quests.getBattle();
        if (b && b.enemy && b.enemy.image) { if (Sherwood.Bestiary) Sherwood.Bestiary.registerKill(b.enemy.image); }
        if (Sherwood.Daily) Sherwood.Daily.updateProgress('quest_fights', 1);
        this._showDialog('Враг повержен!','#4caf50');
        this.updateDisplay();
        if (r.chapterComplete) {
            this._showDialog('Глава пройдена!','#ffd700');
            this._playSound('victory');
            this._stopMusic();
            var ch = b ? b.chapter : null;
            var scrolls = Math.random() < 0.25 ? 1 + Math.floor(Math.random() * 3) : 0;
            if (scrolls) Sherwood.addResource('scrolls', scrolls);
            this._pendingRewards = { exp: ch ? ch.rewards.exp : 200, gold: ch ? ch.rewards.gold : 100, silver: ch ? ch.rewards.silver : 500, scrolls: scrolls };
            this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.quest(); };
            this._showVictoryScreen(this._pendingRewards);
                } else if (r.stageComplete) {
            this._playSound('victory');
            this._stopMusic();
            var e = Sherwood.Quests._currentEnemy;
            this._pendingRewards = { exp: e ? e.exp : 30, gold: e ? e.gold : 15, silver: (e ? e.gold : 15) * 10 };
            this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.quest(); };
            this._showVictoryScreen(this._pendingRewards);
        }
    } else if (r.playerDead) {
        this._showDialog('Поражение...','#f44336');
        this._playSound('defeat');
        this._stopMusic();
        var scrolls = Math.random() < 0.08 ? 1 : 0;
        if (scrolls) Sherwood.addResource('scrolls', scrolls);
        this._pendingRewards = { exp: Math.floor(r.rewards ? r.rewards.exp * 0.3 : 10), silver: Math.floor(r.rewards ? r.rewards.silver * 0.5 : 50), scrolls: scrolls };
        this._afterRewardAction = function() { SherwoodUI.quest(); };
        this._showDefeatScreen(this._pendingRewards);
    } else {
        this._hitEnemyCard();
        this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        this._showDialog((r.crit ? 'КРИТ! ' : '') + 'Вы нанесли ' + r.damage + ' урона', r.crit ? '#ff6a00' : '#fff');
        if (r.enemyDamage) { var self = this; setTimeout(function() { self._showDialog('Враг нанёс ' + r.enemyDamage + ' урона', '#f44336'); }, 700); }
        var self = this; setTimeout(function() { self._showQuestBattle(); }, 1000);
    }
},
// ===== ТАВЕРНА =====
tavern: function() {
    this._playSound('click');
    if (!Sherwood.Tavern) { this._showPlaceholder('Таверна', 'tavern'); return; }
    
    var completedCount = Sherwood.Tavern.getCompletedCount ? Sherwood.Tavern.getCompletedCount() : 0;
    var dailyDone = Sherwood.Tavern.getDailyQuestsDone ? Sherwood.Tavern.getDailyQuestsDone() : 0;
    var dailyMax = Sherwood.Tavern.getMaxDailyQuests ? Sherwood.Tavern.getMaxDailyQuests() : 20;
    var active = Sherwood.Tavern.getCurrentQuest ? Sherwood.Tavern.getCurrentQuest() : null;
    var cooldown = Sherwood.Tavern.isOnCooldown ? Sherwood.Tavern.isOnCooldown() : false;
    var cdRemain = Sherwood.Tavern.getCooldownRemaining ? Sherwood.Tavern.getCooldownRemaining() : 0;
    var isActive = active && active.quest;
    
    var h = '';
    
    h += '<div style="display:flex;flex-direction:column;align-items:center;gap:32px;padding:20px;">';
    
    h += '<div style="position:relative;width:260px;height:260px;flex-shrink:0;">';
    h += '<img src="assets/interface/old_huntsman_bertram.png" style="width:100%;height:100%;object-fit:contain;">';
    h += '</div>';
    
    if (isActive) {
        var q = active.quest;
        h += '<div style="position:relative;width:440px;min-height:300px;display:flex;align-items:center;justify-content:center;">';
        h += '<img src="assets/interface/contracts.png" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:fill;">';
        h += '<div style="position:relative;z-index:1;text-align:center;padding:36px 28px;width:100%;">';
        h += '<div style="color:#000;font-size:1.4em;font-weight:900;margin-bottom:16px;">' + q.name + '</div>';
        h += '<div style="color:#000;font-size:1.2em;font-weight:900;margin-bottom:12px;">' + q.desc + '</div>';
        h += '<div style="color:#8b0000;font-size:1.1em;font-weight:900;margin-bottom:12px;">Противник: ' + q.enemy.name + ' (HP ' + q.enemy.hp + ')</div>';
        h += '<div style="color:#000;font-size:1em;font-weight:900;">Режим: Бой</div>';
        h += '</div>';
        h += '</div>';
        
        h += '<button onclick="SherwoodUI._tavernBattle()" style="background:#c9a040;border:none;border-radius:12px;padding:18px 56px;color:#000;font-weight:900;cursor:pointer;font-size:1.2em;">В бой</button>';
    } else if (cooldown) {
        h += '<div style="position:relative;width:440px;min-height:300px;display:flex;align-items:center;justify-content:center;">';
        h += '<img src="assets/interface/contracts.png" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:fill;">';
        h += '<div style="position:relative;z-index:1;text-align:center;padding:36px 28px;width:100%;">';
        h += '<div style="color:#000;font-size:1.4em;font-weight:900;margin-bottom:16px;">Перезарядка: ' + cdRemain + ' мин.</div>';
        h += '<div style="color:#000;font-size:1.1em;font-weight:900;">Контрактов сегодня: ' + dailyDone + '/' + dailyMax + '</div>';
        h += '</div>';
        h += '</div>';
    } else {
        var nextQuestId = completedCount + 1;
        var nextQuest = Sherwood.Tavern._getQuestById('tavern_' + nextQuestId);
        
        h += '<div style="position:relative;width:440px;min-height:300px;display:flex;align-items:center;justify-content:center;">';
        h += '<img src="assets/interface/contracts.png" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:fill;">';
        h += '<div style="position:relative;z-index:1;text-align:center;padding:36px 28px;width:100%;">';
        h += '<div style="color:#000;font-size:1.4em;font-weight:900;margin-bottom:16px;">' + nextQuest.name + '</div>';
        h += '<div style="color:#000;font-size:1.2em;font-weight:900;margin-bottom:12px;">' + nextQuest.desc + '</div>';
        h += '<div style="color:#8b0000;font-size:1.1em;font-weight:900;margin-bottom:12px;">Противник: ' + nextQuest.enemy.name + ' (HP ' + nextQuest.enemy.hp + ')</div>';
        h += '<div style="color:#000;font-size:1.1em;font-weight:900;">+' + nextQuest.reward.exp + 'XP +' + nextQuest.reward.gold + 'G</div>';
        h += '</div>';
        h += '</div>';
        
        if (dailyDone < dailyMax && completedCount < 100) {
            h += '<button onclick="SherwoodUI._tavernStart(0,0)" style="background:#c9a040;border:none;border-radius:12px;padding:18px 56px;color:#000;font-weight:900;cursor:pointer;font-size:1.2em;">В бой</button>';
        }
    }
    
    h += '<div style="color:#e0c080;font-size:1em;font-weight:900;text-shadow:0 0 10px rgba(0,0,0,0.9);">Выполнено: ' + completedCount + '/100 | Сегодня: ' + dailyDone + '/' + dailyMax + '</div>';
    h += '</div>';
    
    var bgImage = 'assets/backgrounds/section_tavern.png';
    
    if (this._screenLayer) { 
        this._screenLayer.innerHTML = '<div style="height:100%;background:url(\'' + bgImage + '\') center/cover no-repeat;display:flex;flex-direction:column;overflow:hidden;"><div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;"><button onclick="SherwoodUI.loadHome()" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">Таверна</span></div><div style="flex:1;overflow-y:auto;overflow-x:hidden;display:flex;align-items:center;justify-content:center;">' + h + '</div></div>'; 
        this._screenLayer.style.display = 'block'; 
    }
},

_tavernStart: function(r, q) {
    var result = Sherwood.Tavern.startQuest(r, q);
    if (!result || !result.success) { 
        var log = document.getElementById('tavern-log'); 
        if (log) log.textContent = (result ? result.reason : 'Ошибка'); 
        return; 
    }
    if (result.mode === 'battle') { 
        this._stopMusic(); 
        this._showTavernBattle(); 
    } else {
        this._tavernAuto();
    }
},

_tavernBattle: function() { 
    this._stopMusic(); 
    this._showTavernBattle(); 
},

_showTavernBattle: function() {
    var active = Sherwood.Tavern.getCurrentQuest ? Sherwood.Tavern.getCurrentQuest() : null;
    if (!active || !active.quest || !active.row) { this.tavern(); return; }
    var e = active.quest.enemy; 
    if (!e.maxHp) e.maxHp = e.hp || 100;
    this._showBattleScreen({ name: e.name, image: e.image, hp: e.hp || 100, maxHp: e.maxHp }, 'tavern', active.row.npc + ' - ' + active.quest.name, '', "SherwoodUI._tavernBattleAttack()", "SherwoodUI._tavernCancel()");
},

_tavernBattleAttack: function() {
    this._playHitSounds();
    var active = Sherwood.Tavern.getCurrentQuest ? Sherwood.Tavern.getCurrentQuest() : null;
    if (!active || !active.quest || !active.quest.enemy) { this.tavern(); return; }
    var p = Sherwood.getPlayer(); 
    var e = active.quest.enemy; 
    if (!e.maxHp) e.maxHp = e.hp || 100;
    var dmg = Math.max(1, Math.floor((p.stats.attack * p.stats.attack) / (p.stats.attack + (e.def || 5))));
    var crit = Math.random() * 100 < 15; 
    if (crit) dmg = Math.floor(dmg * 1.8);
    e.hp -= dmg;
    if (e.hp <= 0) {
        var r = Sherwood.Tavern.completeQuest();
        if (Sherwood.Daily) Sherwood.Daily.updateProgress('tavern_complete', 1);
        this._showDialog('Победа! +' + r.reward.exp + 'XP +' + r.reward.gold + 'G', '#ffd700');
        this._stopMusic(); 
        SherwoodUI.updateDisplay();
        var self = this; 
        setTimeout(function() { self.tavern(); }, 1500);
    } else {
        var edmg = Math.max(1, Math.floor((e.atk * e.atk) / (e.atk + p.stats.defense)));
        p.stats.hp = Math.max(0, p.stats.hp - edmg);
        this._hitEnemyCard(); 
        this._updateEnemyHP(e.hp, e.maxHp);
        this._showDialog((crit ? 'КРИТ! ' : '') + 'Вы: ' + dmg + ' урона', crit ? '#ff6a00' : '#fff');
        if (p.stats.hp <= 0) {
            var self = this; 
            setTimeout(function() { self._showDialog('Поражение...', '#f44336'); }, 700);
            Sherwood.Tavern.failQuest(); 
            p.stats.hp = 1;
            this._stopMusic(); 
            setTimeout(function() { self.tavern(); }, 1500);
        } else {
            var self = this; 
            setTimeout(function() { self._showDialog('Враг: ' + edmg + ' урона', '#f44336'); }, 700);
            setTimeout(function() { self._showTavernBattle(); }, 1200);
        }
    }
    SherwoodUI.updateDisplay();
},

_tavernAuto: function() {
    var r = Sherwood.Tavern.autoBattle ? Sherwood.Tavern.autoBattle() : { completed: false };
    if (r.completed) { 
        if (Sherwood.Daily) Sherwood.Daily.updateProgress('tavern_complete', 1); 
        SherwoodUI.updateDisplay(); 
    }
    var self = this; 
    setTimeout(function() { self.tavern(); }, 800);
},

_tavernCancel: function() { 
    this._stopMusic(); 
    if (Sherwood.Tavern.cancelQuest) Sherwood.Tavern.cancelQuest(); 
    this.tavern(); 
},
// ===== ЕЖЕДНЕВНЫЕ =====
    daily: function() { 
    this._playSound('click'); 
    if (!Sherwood.Daily) { this._showPlaceholder('Задания','daily'); return; } 
    
    Sherwood.Daily.init();
    var dailyQuests = Sherwood.Daily.getDailyQuests();
    var dailyCompleted = Sherwood.Daily.getDailyCompleted();
    var p = Sherwood.getPlayer();
    var currentChapter = p.questProgress ? (p.questProgress.currentChapter || 1) : 1;
    var chapterQuests = Sherwood.Daily.getChapterQuests(currentChapter);
    var chapterCompleted = p.daily ? (p.daily.chapterCompleted || []) : [];
    
    var html = '';
    
    // Табы переключения
    var t1b = (!SherwoodUI._dailyTab || SherwoodUI._dailyTab === 1) ? '#c9a040' : 'rgba(255,255,255,0.1)';
    var t1c = (!SherwoodUI._dailyTab || SherwoodUI._dailyTab === 1) ? '#000' : '#fff';
    var t2b = (SherwoodUI._dailyTab === 2) ? '#c9a040' : 'rgba(255,255,255,0.1)';
    var t2c = (SherwoodUI._dailyTab === 2) ? '#000' : '#fff';
    
    html += '<div style="display:flex;gap:4px;margin-bottom:8px;flex-shrink:0;">';
    html += '<button onclick="SherwoodUI._dailyTab=1;SherwoodUI.daily();" style="flex:1;background:' + t1b + ';border:1px solid #555;border-radius:6px;padding:8px;color:' + t1c + ';cursor:pointer;font-size:0.8em;font-weight:bold;">Ежедневные</button>';
    html += '<button onclick="SherwoodUI._dailyTab=2;SherwoodUI.daily();" style="flex:1;background:' + t2b + ';border:1px solid #555;border-radius:6px;padding:8px;color:' + t2c + ';cursor:pointer;font-size:0.8em;font-weight:bold;">Глава ' + currentChapter + '</button>';
    html += '</div>';
    
    // Выбираем рамку в зависимости от вкладки
    var frameImage = (!SherwoodUI._dailyTab || SherwoodUI._dailyTab === 1) 
        ? 'assets/interface/tasks_visual.png' 
        : 'assets/interface/tasks_chapters_visual.png';
    
    // Для ежедневных (неоновая рамка) — тёмная подложка под текст
    // Для главы — белый текст с тенью
    var isDaily = (!SherwoodUI._dailyTab || SherwoodUI._dailyTab === 1);
    
    var quests = isDaily ? dailyQuests : chapterQuests;
    var completed = isDaily ? dailyCompleted : chapterCompleted;
    
    // Контейнер списка заданий (столбик по центру, рамки вплотную)
    html += '<div style="display:flex;flex-direction:column;align-items:center;">';
    
    if (quests.length === 0) {
        html += '<div style="color:#e0c080;font-weight:bold;font-size:1em;padding:20px;">Нет заданий</div>';
    }
    
    for (var i = 0; i < quests.length; i++) {
        var q = quests[i];
        var claimed = completed.indexOf(q.id) !== -1;
        var progressPct = Math.round((q.progress || 0) / q.target * 100);
        
        // Каждое задание: обрезаем прозрачные края через overflow:hidden
        html += '<div style="position:relative;width:90%;max-width:400px;height:110px;overflow:hidden;margin-bottom:4px;">';
        
        // Картинка рамки
        html += '<img src="' + frameImage + '" style="position:absolute;left:0;width:100%;height:auto;top:50%;transform:translateY(-50%);">';
        
        // Тёмная подложка для текста (только для ежедневных)
        if (isDaily) {
            html += '<div style="position:absolute;top:8px;left:20px;right:20px;bottom:8px;background:rgba(0,0,0,0.75);border-radius:8px;z-index:0;"></div>';
        }
        
        // Текст поверх рамки
        html += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px 28px;box-sizing:border-box;z-index:1;">';
        
        // Название задания
        if (isDaily) {
            // Для неоновой рамки — белый текст с чёрной тенью
            html += '<div style="color:#fff;font-weight:900;font-size:0.8em;text-shadow:0 1px 3px #000, 0 0 8px rgba(0,0,0,0.8);margin-bottom:1px;text-align:center;line-height:1.2;">' + q.name + '</div>';
            
            // Описание
            html += '<div style="color:#ddd;font-weight:700;font-size:0.6em;text-shadow:0 1px 2px #000;margin-bottom:2px;text-align:center;line-height:1.2;">' + q.desc + '</div>';
        } else {
            // Для главы — белый жирный шрифт с тенью
            html += '<div style="color:#fff;font-weight:900;font-size:0.8em;text-shadow:0 0 4px rgba(0,0,0,0.9);margin-bottom:1px;text-align:center;line-height:1.2;">' + q.name + '</div>';
            html += '<div style="color:#fff;font-weight:700;font-size:0.6em;text-shadow:0 0 4px rgba(0,0,0,0.9);margin-bottom:2px;text-align:center;line-height:1.2;">' + q.desc + '</div>';
        }
        
        // Прогресс-бар (яркий, контрастный)
        html += '<div style="width:75%;background:rgba(0,0,0,0.7);border-radius:4px;height:8px;margin:2px 0;overflow:hidden;border:1px solid rgba(255,255,255,0.4);">';
        html += '<div style="background:' + (q.completed ? '#00ff00' : '#ffaa00') + ';height:100%;width:' + progressPct + '%;transition:width 0.5s;box-shadow:0 0 6px ' + (q.completed ? 'rgba(0,255,0,0.6)' : 'rgba(255,170,0,0.6)') + ';"></div>';
        html += '</div>';
        
        // Прогресс и награда
        if (isDaily) {
            html += '<div style="color:#fff;font-weight:700;font-size:0.55em;text-shadow:0 1px 2px #000;margin-bottom:2px;text-align:center;">' + (q.progress || 0) + '/' + q.target + ' | <span style="color:#ffd700;">+' + q.reward.gold + ' зол.</span> <span style="color:#ffaa00;">+' + q.reward.exp + ' XP</span></div>';
        } else {
            html += '<div style="color:#fff;font-weight:700;font-size:0.55em;text-shadow:0 0 4px rgba(0,0,0,0.9);margin-bottom:2px;text-align:center;">' + (q.progress || 0) + '/' + q.target + ' | +' + q.reward.gold + ' зол. +' + q.reward.exp + ' XP</div>';
        }
        
        // Кнопка "ГОТОВО" или статус
        if (q.completed && !claimed) {
            html += '<button onclick="';
            if (isDaily) {
                html += 'SherwoodUI._claimDaily(' + i + ')';
            } else {
                html += 'SherwoodUI._claimChapter(' + currentChapter + ',' + i + ')';
            }
            // Кнопка яркая с тенью и обводкой
            html += '" style="background:#00c853;border:2px solid #fff;border-radius:20px;padding:4px 22px;color:#fff;font-weight:900;cursor:pointer;font-size:0.65em;letter-spacing:1px;text-shadow:0 1px 2px rgba(0,0,0,0.5);box-shadow:0 2px 8px rgba(0,0,0,0.5), 0 0 10px rgba(0,200,83,0.4);">ГОТОВО</button>';
        } else if (claimed) {
            html += '<div style="color:#00ff00;font-weight:900;font-size:0.6em;text-shadow:0 0 6px rgba(0,255,0,0.5), 0 1px 2px #000;">✓ ПОЛУЧЕНО</div>';
        }
        
        html += '</div>'; // конец текста
        html += '</div>'; // конец рамки задания
    }
    
    html += '</div>'; // конец контейнера списка
    
    // Лог
    html += '<div id="daily-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:4px;"></div>';
    
    // Открываем с прокруткой
    this._openScreenScrollable('Задания', 'daily', html);
},

_openScreenScrollable: function(title, bgKey, html, backFn) {
    try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = 'none'; }); }); } catch(e) {}
    try { this.container.style.background = "url('" + (this._bg[bgKey] || bgKey) + "') center/cover no-repeat"; } catch(e) {}
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

_claimDaily: function(i) { 
    var r = Sherwood.Daily.claimDailyReward(i);
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

_claimChapter: function(ch, i) { 
    var r = Sherwood.Daily.claimChapterReward(ch, i);
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

    // ===== ПОРТАЛЫ =====
portal: function() {
    this._playSound('click');
    if (!Sherwood.Portal) { this._showPlaceholder('Порталы', 'portal'); return; }
    if (Sherwood.Portal.isInPortal()) { this._showPortalBattle(); return; }
    
    var allPortals = Sherwood.Portal.getAllPortals();
    var player = Sherwood.getPlayer();
    var arrowCount = (typeof Sherwood.Forge !== 'undefined' && Sherwood.Forge.getArrowCount) ? Sherwood.Forge.getArrowCount() : 0;
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
        var portal = allPortals[i];
        var iconFile = iconMap[portal.id] || 'invasion_portal.png';
        var requiredArrows = portal.id * 150;
        var canEnter = arrowCount >= requiredArrows;
        
        h += '<div style="text-align:center;margin-bottom:32px;">';
        h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:10px;">' + portal.name + '</div>';
        h += '<img src="assets/portal_beasts/visual_portals/' + iconFile + '" style="width:160px;height:160px;object-fit:contain;display:block;margin:0 auto 10px;">';
        h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:8px;">Стрел: ' + arrowCount + ' / ' + requiredArrows + '</div>';
        
        if (canEnter) {
            h += '<button onclick="SherwoodUI._enterPortal(' + portal.id + ')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:0.95em;">В бой</button>';
        } else {
            h += '<button disabled style="background:#555;border:none;border-radius:8px;padding:12px 36px;color:#999;font-weight:bold;font-size:0.95em;cursor:default;">В бой</button>';
        }
        
        h += '</div>';
    }
    
    var bgImage = 'assets/portal_beasts/visual_portals/ancient_parchment_of_portals.png';
    
    if (this._screenLayer) { 
        this._screenLayer.innerHTML = '<div style="height:100%;background:url(\'' + bgImage + '\') center/cover no-repeat;display:flex;flex-direction:column;overflow:hidden;"><div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;"><button onclick="SherwoodUI.loadHome()" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">Порталы</span></div><div style="flex:1;overflow-y:auto;overflow-x:hidden;padding:20px;padding-top:30px;padding-bottom:40px;-webkit-overflow-scrolling:touch;">' + h + '</div></div>'; 
        this._screenLayer.style.display = 'block'; 
    }
},
    _enterPortal: function(id) { 
    var r = Sherwood.Portal.enterPortal(id); 
    if (!r.success) { this._showToast(r.reason || 'Не удалось войти в портал'); return; } 
    this._stopMusic(); 
    this._playSound('trap'); 
    this._showPortalBattle(); 
},
    _showPortalBattle: function() {
    var battle = Sherwood.Portal.getCurrentBattle();
    if (!battle) { this.portal(); return; }
    
    var enemy = battle.enemy;
    if (!enemy.maxHp) enemy.maxHp = enemy.hp;
    
    var extraInfo = 'Волна ' + battle.level + '/' + battle.totalLevels + ' | Время: ' + Math.floor(battle.timeRemaining / 60) + ':' + (battle.timeRemaining % 60).toString().padStart(2, '0');
    
    this._showBattleScreen(
        { 
            name: enemy.name + (enemy.isBoss ? ' (БОСС)' : ''), 
            image: enemy.image, 
            hp: enemy.hp, 
            maxHp: enemy.maxHp 
        },
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
        this._playSound('defeat');
        this._stopMusic();
        this._pendingRewards = { exp: 10, silver: 50 };
        this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.portal(); };
        this._showDefeatScreen(this._pendingRewards);
        return;
    }
    
    if (r.dead && r.resurrected) {
        this._showDialog('Вы погибли! Воскрешение за ' + r.cost.cost + ' ' + (r.cost.currency === 'gold' ? 'золота' : 'серебра'), '#ff9800');
        this.updateDisplay();
        var self = this;
        setTimeout(function() { self._showPortalBattle(); }, 1500);
        return;
    }
    
    if (r.enemyDead) {
        this._hitEnemyCard();
        this._updateEnemyHP(0, r.enemyMaxHp);
        this._showDialog(r.enemyName + ' повержен!', '#4caf50');
        this.updateDisplay();
        var self = this;
        setTimeout(function() { self._showPortalBattle(); }, 1200);
        return;
    }
    
    // Обычный удар
    this._hitEnemyCard();
    this._showPlayerHitAnim();
    this._showDamageNumber(r.damage, r.crit);
    if (r.crit) this._showCriticalHitAnim();
    this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
    this._showDialog((r.crit ? 'CRIT ' : '') + 'Damage: ' + r.damage, r.crit ? '#ff6a00' : '#fff');
    
    if (r.enemyDamage) {
        var self = this;
        setTimeout(function() { 
            self._showDialog(r.enemyName + ' hit: ' + r.enemyDamage, '#f44336'); 
            self.updateDisplay(); 
        }, 700);
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
    // ===== РЕЙД =====
raid: function() { 
    this._playSound('click'); 
    if (!Sherwood.Raid) { this._showPlaceholder('Рейд','raid'); return; } 
    
    Sherwood.Raid.init();
    
    if (Sherwood.Raid.isRaidActive()) { 
        this._showRaidBattle(); 
        return; 
    } 
    
    var raids = Sherwood.Raid.getAvailableRaids();
    var check = Sherwood.Raid.canJoinRaid();
    var player = Sherwood.getPlayer();
    var raidsToday = player.raid ? (player.raid.raidsToday || 0) : 0;
    var maxRaids = 3;
    
    var html = '';
    
    html += '<div style="text-align:center;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:4px;">Рейд</div>';
    html += '<div style="text-align:center;color:#aaa;font-size:0.75em;margin-bottom:16px;">Доступно: ' + (maxRaids - raidsToday) + ' / ' + maxRaids + '</div>';
    
    for (var i = 0; i < raids.length; i++) {
        var raid = raids[i];
        
        html += '<div style="display:flex;flex-direction:column;align-items:center;margin-bottom:24px;">';
        html += '<div style="color:#e0c080;font-weight:bold;font-size:0.9em;margin-bottom:8px;">' + raid.name + '</div>';
        
        // Круглая рамка raid_visual.png 400x400
        html += '<div style="position:relative;width:400px;height:400px;">';
        html += '<img src="assets/interface/raid_visual.png" style="width:100%;height:100%;object-fit:contain;">';
        
        // Карта босса по центру (image (55).png)
        html += '<img src="assets/all_beasts/image (55).png" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:180px;height:180px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
        
        // Кнопка РЕЙД внизу
        if (check.can) {
            html += '<button onclick="SherwoodUI._startRaid(' + i + ')" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);z-index:2;background:#c9a040;border:none;border-radius:8px;padding:10px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">РЕЙД</button>';
        } else {
            html += '<div style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);z-index:2;background:#555;border:none;border-radius:8px;padding:10px 30px;color:#999;font-weight:bold;font-size:0.9em;">РЕЙД</div>';
        }
        
        html += '</div>';
        
        html += '<div style="color:#aaa;font-size:0.7em;margin-top:4px;">HP ' + raid.hp.toLocaleString() + ' | АТК ' + raid.attack + ' | ' + raid.stages.length + ' этапа</div>';
        html += '<div style="color:#ffd700;font-size:0.65em;">Награда: +' + raid.exp + ' XP +' + raid.gold + ' золота</div>';
        
        if (!check.can) {
            html += '<div style="color:#f44336;font-size:0.65em;margin-top:4px;">' + check.reason + '</div>';
        }
        
        html += '</div>';
    }
    
    if (raids.length === 0) {
        html += '<div style="color:#aaa;text-align:center;padding:20px;">Нет доступных рейдов</div>';
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
    
    // Фон боя fight_raid.png
    this._showBattleScreen(
        { name: enemy.name, image: enemy.image, hp: enemy.hp, maxHp: enemy.maxHp },
        'raid',
        s.boss.name + ' - Этап ' + s.stageIndex + '/' + s.totalStages,
        '',
        'SherwoodUI._raidAttack()',
        'SherwoodUI._raidFlee()',
        'assets/interface/fight_raid.png'  // передаём фон боя
    ); 
},

_raidAttack: function() { 
    this._playHitSounds(); 
    var r = Sherwood.Raid.raidAttack(); 
    if (!r) return; 
    
    if (r.raidComplete) { 
        this._showDialog('Рейд пройден! +' + r.rewards.exp + 'XP +' + r.rewards.gold + 'G', '#ffd700'); 
        this._stopMusic(); 
        this.updateDisplay(); 
        var scrolls = Math.random() < 0.3 ? 1 + Math.floor(Math.random() * 3) : 0; 
        if (scrolls) Sherwood.addResource('scrolls', scrolls); 
        this._pendingRewards = { exp: r.rewards.exp, gold: r.rewards.gold, silver: r.rewards.silver, scrolls: scrolls }; 
        this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.raid(); }; 
        this._showVictoryScreen(this._pendingRewards); 
    } else if (r.stageComplete) { 
        this._showDialog('Этап пройден!', '#4caf50'); 
        var self = this; 
        setTimeout(function() { self._showRaidBattle(); }, 1200); 
    } else if (r.playerDead) { 
        this._showDialog('Вы погибли!', '#f44336'); 
        this._stopMusic(); 
        var scrolls = Math.random() < 0.08 ? 1 : 0; 
        if (scrolls) Sherwood.addResource('scrolls', scrolls); 
        this._pendingRewards = { exp: Math.floor(50), silver: Math.floor(100), scrolls: scrolls }; 
        this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.raid(); }; 
        this._showDefeatScreen(this._pendingRewards); 
    } else { 
        this._hitEnemyCard(); 
        this._updateEnemyHP(r.enemyHp, r.enemyMaxHp); 
        this._showDialog((r.crit ? 'КРИТ! ' : '') + 'Вы нанесли ' + r.damage + ' урона', r.crit ? '#ff6a00' : '#fff'); 
        if (r.enemyDamage) { 
            var self = this; 
            setTimeout(function() { self._showDialog('Враг нанёс ' + r.enemyDamage + ' урона', '#f44336'); }, 700); 
        } 
        this.updateDisplay(); 
        var self = this; 
        setTimeout(function() { self._showRaidBattle(); }, 1000); 
    } 
},

_raidFlee: function() { 
    this._stopMusic(); 
    Sherwood.Raid.fleeRaid(); 
    this._playMusic('main_theme'); 
    this.raid(); 
},

    // ===== АРЕНА =====
arena: function() {
    this._playSound('click');
    if (!Sherwood.Arena) { this._showPlaceholder('Арена', 'arena'); return; }
    if (Sherwood.Arena.isInMatch()) { this._showArenaBattle(); return; }
    
    var stats = Sherwood.Arena.getStats();
    var h = '';
    
    h += '<div style="text-align:center;">';
    h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:4px;">' + stats.rank + '</div>';
    h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:30px;">Побед: ' + stats.wins + ' | Поражений: ' + stats.losses + '</div>';
    h += '<img src="assets/interface/blades_arena.png" style="width:240px;height:240px;object-fit:contain;display:block;margin:0 auto 30px;">';
    h += '<button onclick="SherwoodUI._startArenaBattle()" style="background:#c9a040;border:none;border-radius:8px;padding:14px 40px;color:#000;font-weight:bold;cursor:pointer;font-size:1em;">В бой</button>';
    h += '</div>';
    
    var bgImage = 'assets/interface/section_arena.png';
    
    if (this._screenLayer) { 
        this._screenLayer.innerHTML = '<div style="height:100%;background:url(\'' + bgImage + '\') center/cover no-repeat;display:flex;flex-direction:column;overflow:hidden;"><div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;"><button onclick="SherwoodUI.loadHome()" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">Арена</span></div><div style="flex:1;display:flex;align-items:center;justify-content:center;padding:20px;">' + h + '</div></div>'; 
        this._screenLayer.style.display = 'block'; 
    }
},

_startArenaBattle: function() {
    this._stopMusic();
    Sherwood.Arena.refreshOpponents();
    var opps = Sherwood.Arena.getOpponents();
    if (opps.length < 3) {
        this._showToast('Недостаточно противников');
        return;
    }
    this._currentArenaOpponents = [opps[0], opps[1], opps[2]];
    this._currentArenaOpponentIndex = 0;
    this._showArenaBattle();
},

_showArenaBattle: function() {
    if (!this._currentArenaOpponents || this._currentArenaOpponentIndex >= this._currentArenaOpponents.length) {
        this._arenaVictory();
        return;
    }
    
    var aliveOpponents = this._currentArenaOpponents.filter(function(o) { return o.stats.hp > 0; });
    if (aliveOpponents.length === 0) {
        this._arenaVictory();
        return;
    }
    
    if (this._currentArenaOpponents[this._currentArenaOpponentIndex].stats.hp <= 0) {
        this._currentArenaOpponentIndex = this._currentArenaOpponents.indexOf(aliveOpponents[0]);
    }
    
    var opp = this._currentArenaOpponents[this._currentArenaOpponentIndex];
    var skinFile = opp.skin || 'assets/hero_skins/skin1_01.png';
    
    // Сбрасываем заряд
    this._arenaCharge = 0;
    this._arenaChargeMax = 5000;
    this._arenaChargeStart = null;
    
    this._showArenaBattleScreen(
        { name: opp.name, image: skinFile, hp: opp.stats.hp, maxHp: opp.stats.maxHp },
        'SherwoodUI._arenaStartCharge()',
        'SherwoodUI._arenaFlee()'
    );
    
    // Добавляем кнопку смены цели
    var self = this;
    setTimeout(function() {
        self._addArenaSwitchButton();
    }, 100);
},

_showArenaBattleScreen: function(enemyData, onAttack, onFlee) {
    var e = enemyData, p = Sherwood.getPlayer();
    var ehp = e.maxHp > 0 ? Math.round((e.hp / e.maxHp) * 100) : 100;
    var php = p.stats.maxHp > 0 ? Math.round((p.stats.hp / p.stats.maxHp) * 100) : 100;
    var activeSkin = p.activeSkin || 'skin1_01';
    var imgPath = e.image;
    
    var h = '<div style="text-align:center;display:flex;flex-direction:column;height:100%;overflow:hidden;">';
    
    // 1. СТАТЫ — САМЫЙ ВЕРХ
    h += '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:2px;flex-shrink:0;">';
    h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_power.png" style="width:24px;height:24px;"><span style="color:#fff;font-size:0.75em;font-weight:bold;">' + p.stats.attack + '</span></div>';
    h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_defense.png" style="width:24px;height:24px;"><span style="color:#fff;font-size:0.75em;font-weight:bold;">' + p.stats.defense + '</span></div>';
    h += '<div style="display:flex;align-items:center;gap:2px;"><img src="assets/interface/icon_health.png" style="width:24px;height:24px;"><span style="color:#fff;font-size:0.75em;font-weight:bold;">' + p.stats.hp + '/' + p.stats.maxHp + '</span></div>';
    h += '</div>';
    
    // 2. ВРАГ И ЕГО ШКАЛА
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:2px;flex-shrink:0;">';
    h += '<div style="width:40px;height:40px;border-radius:50%;border:2px solid #f44336;overflow:hidden;flex-shrink:0;"><img src="' + imgPath + '" style="width:100%;height:100%;object-fit:contain;" onerror="this.style.display=&quot;none&quot;"></div>';
    h += '<div style="position:relative;width:250px;height:120px;">';
    h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;">';
    h += '<div style="position:absolute;top:80px;left:23px;right:23px;bottom:12px;overflow:hidden;z-index:0;">';
    h += '<div id="enemy-hp-bar" style="background:url(assets/interface/filling_the_poisoned_health_bar.jpeg) left/auto 100%;height:100%;width:' + ehp + '%;transition:width 0.5s ease-out;"></div>';
    h += '</div>';
    h += '<span id="enemy-hp-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.65em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;">' + e.hp + '/' + e.maxHp + '</span></div>';
    h += '</div>';
    
    // 3. КАРТА ВРАГА
    h += '<div style="position:relative;display:inline-block;margin:0 auto;flex-shrink:0;">';
    h += '<img src="' + imgPath + '" id="enemy-card" style="width:150px;height:150px;object-fit:contain;position:relative;z-index:1;border-radius:16px;transition:filter 0.15s;" onerror="this.style.display=&quot;none&quot;">';
    h += '<div id="enemy-hit-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;pointer-events:none;display:none;"></div>';
    h += '<div id="damage-numbers" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;pointer-events:none;"></div>';
    h += '</div>';
    
    // 4. КНОПКА АТАКИ — НАД HP ГЕРОЯ
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:4px;margin:2px 0;flex-shrink:0;">';
    h += '<button id="attack-btn" onclick="' + onAttack + '" style="background:url(assets/skills/skill_shot_normal.png) center/contain no-repeat;width:60px;height:60px;border:3px solid #c9a040;border-radius:50%;cursor:pointer;transition:filter 0.3s, box-shadow 0.3s;"></button>';
    h += '</div>';
    
    // 5. ШКАЛА ЖИЗНИ ИГРОКА
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin:2px 0;flex-shrink:0;">';
    h += '<div id="player-avatar" style="width:40px;height:40px;border-radius:50%;border:2px solid #c9a040;overflow:hidden;flex-shrink:0;position:relative;">';
    h += '<img src="assets/hero_skins/' + activeSkin + '.png" style="width:100%;height:100%;object-fit:contain;position:relative;z-index:1;">';
    h += '<div id="player-hit-anim" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;display:none;"></div>';
    h += '</div>';
    h += '<div style="position:relative;width:250px;height:120px;">';
    h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:1;">';
    h += '<div style="position:absolute;top:80px;left:23px;right:23px;bottom:12px;overflow:hidden;z-index:0;">';
    h += '<div id="player-hp-bar" style="background:url(assets/interface/life_interface_asset_horizontal_progress_bar.jpeg) left/auto 100%;height:100%;width:' + php + '%;transition:width 0.5s ease-out;"></div>';
    h += '</div>';
    h += '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.65em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;">HP ' + p.stats.hp + '/' + p.stats.maxHp + '</span></div>';
    h += '</div>';
    
    // 6. ЛОГ БОЯ — ПОД ШКАЛОЙ ИГРОКА
    h += '<div id="battle-dialog" style="background:rgba(0,0,0,0.75);border:1px solid #555;border-radius:8px;padding:5px;margin:2px 4%;min-height:40px;max-height:40px;overflow-y:auto;color:#aaa;font-size:0.6em;text-align:left;line-height:1.3;flex-shrink:0;"></div>';
    
    h += '</div>';
    
    this._openScreen('', 'arena', h);
},

_addArenaSwitchButton: function() {
    var oldBtn = document.getElementById('arena-switch-btn');
    if (oldBtn) oldBtn.remove();
    
    var btn = document.createElement('button');
    btn.id = 'arena-switch-btn';
    btn.style.cssText = 'position:absolute;bottom:120px;left:10px;z-index:100;background:rgba(0,0,0,0.7);border:2px solid #c9a040;border-radius:50%;cursor:pointer;padding:0;width:44px;height:44px;display:flex;align-items:center;justify-content:center;';
    btn.innerHTML = '<span style="color:#ffd700;font-size:1.2em;">⇄</span>';
    btn.onclick = function(e) { 
        e.stopPropagation(); 
        SherwoodUI._arenaSwitchTarget(); 
    };
    this._screenLayer.appendChild(btn);
},

_arenaStartCharge: function() {
    if (this._arenaChargeStart) return;
    this._arenaChargeStart = Date.now();
    
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
        
        var attackBtn = document.getElementById('attack-btn');
        if (attackBtn) {
            attackBtn.style.filter = 'brightness(1.3)';
            attackBtn.style.boxShadow = '0 0 20px rgba(255,215,0,0.8)';
        }
        
        this._showDialog('Полный заряд!', '#ffd700');
        this._playSound('levelup');
    }
},

_resetArenaCharge: function() {
    this._arenaChargeStart = null;
    this._arenaCharge = 0;
    if (this._arenaChargeInterval) {
        clearInterval(this._arenaChargeInterval);
        this._arenaChargeInterval = null;
    }
    
    var attackBtn = document.getElementById('attack-btn');
    if (attackBtn) {
        attackBtn.style.filter = '';
        attackBtn.style.boxShadow = '';
    }
},

_arenaAttack: function() {
    this._playHitSounds();
    
    if (!this._currentArenaOpponents || this._currentArenaOpponentIndex >= this._currentArenaOpponents.length) {
        this._arenaVictory();
        return;
    }
    
    var opp = this._currentArenaOpponents[this._currentArenaOpponentIndex];
    if (!opp || opp.stats.hp <= 0) {
        this._arenaSwitchTarget();
        return;
    }
    
    var player = Sherwood.getPlayer();
    
    var chargePercent = this._arenaCharge / this._arenaChargeMax;
    var minDamage = Math.max(1, Math.floor((player.stats.attack - opp.stats.defense) * 0.3));
    var maxDamage = Math.max(minDamage + 1, Math.floor((player.stats.attack - opp.stats.defense) * 1.2));
    var damage = Math.floor(minDamage + (maxDamage - minDamage) * chargePercent);
    
    if (damage < 1) damage = 1;
    
    var crit = chargePercent >= 1 && Math.random() * 100 < 20;
    if (crit) damage = Math.floor(damage * 1.8);
    
    opp.stats.hp -= damage;
    if (opp.stats.hp < 0) opp.stats.hp = 0;
    
    this._hitEnemyCard();
    this._showDamageNumber(damage, crit);
    if (crit) this._showCriticalHitAnim();
    this._updateEnemyHP(Math.max(0, opp.stats.hp), opp.stats.maxHp);
    
    this._showDialog(
        (crit ? 'CRIT! ' : '') + 'Урон: ' + damage + ' (заряд ' + Math.floor(chargePercent * 100) + '%)',
        crit ? '#ff6a00' : '#fff'
    );
    
    this._resetArenaCharge();
    
    if (opp.stats.hp <= 0) {
        this._showDialog(opp.name + ' повержен!', '#4caf50');
        if (Sherwood.Daily) Sherwood.Daily.updateProgress('arena_wins', 1);
        
        var aliveOpponents = this._currentArenaOpponents.filter(function(o) { return o.stats.hp > 0; });
        
        if (aliveOpponents.length === 0) {
            var self = this;
            setTimeout(function() { self._arenaVictory(); }, 1500);
            return;
        }
        
        this._currentArenaOpponentIndex = this._currentArenaOpponents.indexOf(aliveOpponents[0]);
        
        var self = this;
        setTimeout(function() { self._showArenaBattle(); }, 1500);
        return;
    }
    
    this._arenaBotsFight();
    
    var oppDamage = Math.max(1, Math.floor((opp.stats.attack - player.stats.defense) * 0.5 + Math.random() * 10));
    player.stats.hp = Math.max(0, player.stats.hp - oppDamage);
    
    this._showPlayerHitAnim();
    
    var self = this;
    setTimeout(function() {
        self._showDialog(opp.name + ' бьёт: ' + oppDamage + ' урона', '#f44336');
        SherwoodUI.updateDisplay();
        
        if (player.stats.hp <= 0) {
            self._arenaDefeat();
            return;
        }
        
        self._arenaStartCharge();
    }, 700);
    
    this.updateDisplay();
},

_arenaSwitchTarget: function() {
    if (!this._currentArenaOpponents) return;
    
    var aliveIndices = [];
    for (var i = 0; i < this._currentArenaOpponents.length; i++) {
        if (this._currentArenaOpponents[i].stats.hp > 0 && i !== this._currentArenaOpponentIndex) {
            aliveIndices.push(i);
        }
    }
    
    if (aliveIndices.length === 0) {
        this._showDialog('Нет других живых противников!', '#ff9800');
        return;
    }
    
    this._currentArenaOpponentIndex = aliveIndices[0];
    this._resetArenaCharge();
    this._showDialog('Цель сменена!', '#4caf50');
    
    var self = this;
    setTimeout(function() { self._showArenaBattle(); }, 300);
},

_arenaBotsFight: function() {
    if (!this._currentArenaOpponents) return;
    
    var player = Sherwood.getPlayer();
    var playerAlive = player.stats.hp > 0;
    
    for (var i = 0; i < this._currentArenaOpponents.length; i++) {
        var attacker = this._currentArenaOpponents[i];
        if (!attacker || attacker.stats.hp <= 0) continue;
        
        var targets = [];
        
        for (var j = 0; j < this._currentArenaOpponents.length; j++) {
            if (i !== j && this._currentArenaOpponents[j].stats.hp > 0) {
                targets.push({ type: 'bot', index: j });
            }
        }
        
        if (playerAlive) {
            targets.push({ type: 'player' });
        }
        
        if (targets.length === 0) continue;
        
        var target = targets[Math.floor(Math.random() * targets.length)];
        var botDamage = Math.max(1, Math.floor(attacker.stats.attack * 0.3 + Math.random() * 20));
        
        if (target.type === 'bot') {
            var targetBot = this._currentArenaOpponents[target.index];
            targetBot.stats.hp = Math.max(0, targetBot.stats.hp - botDamage);
        } else if (target.type === 'player') {
            player.stats.hp = Math.max(0, player.stats.hp - botDamage);
        }
    }
    
    this.updateDisplay();
    
    var aliveBots = this._currentArenaOpponents.filter(function(o) { return o.stats.hp > 0; });
    
    if (player.stats.hp <= 0) {
        this._arenaDefeat();
        return;
    }
    
    if (aliveBots.length === 0) {
        var self = this;
        setTimeout(function() { self._arenaVictory(); }, 1000);
    }
},

_arenaVictory: function() {
    this._stopMusic();
    this._resetArenaCharge();
    Sherwood.Arena._wins++;
    var exp = 150, gold = 80, silver = 200;
    Sherwood.addExp(exp);
    Sherwood.addResource('gold', gold);
    Sherwood.addResource('silver', silver);
    Sherwood.saveGame();
    SherwoodUI.updateDisplay();
    this._currentArenaOpponents = null;
    this._pendingRewards = { exp: exp, gold: gold, silver: silver };
    this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.arena(); };
    this._showVictoryScreen(this._pendingRewards);
},

_arenaDefeat: function() {
    this._stopMusic();
    this._resetArenaCharge();
    Sherwood.Arena._losses++;
    var player = Sherwood.getPlayer();
    player.stats.hp = Math.max(1, Math.floor(player.stats.maxHp * 0.2));
    Sherwood.saveGame();
    this._currentArenaOpponents = null;
    this._pendingRewards = { exp: 20, silver: 50 };
    this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.arena(); };
    this._showDefeatScreen(this._pendingRewards);
},

_arenaFlee: function() { 
    this._stopMusic(); 
    this._resetArenaCharge();
    this._currentArenaOpponents = null; 
    Sherwood.Arena._losses++;
    this._playMusic('main_theme'); 
    this.arena(); 
},
// ========== НАСТРОЙКИ / ЧАТ / РЫНОК / ПРОФИЛЬ / СУМКА ==========
    settings: function() { 
    this._playSound('click'); 
    var p = Sherwood.getPlayer();
    var nm = p ? p.name : 'Охотник';
    var nameChanges = p ? (p.nameChanges || 0) : 0;
    
    var h = '';
    
    h += '<div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;">';
    h += '<div style="color:#fff;margin-bottom:8px;">Имя</div>';
    h += '<div style="display:flex;gap:8px;">';
    h += '<input id="pni" value="' + nm + '" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:8px 12px;color:#fff;font-family:\'Georgia\',serif;font-size:0.9em;">';
    h += '<button onclick="SherwoodUI._changePlayerName()" style="background:#c9a040;border:none;border-radius:6px;padding:8px 16px;color:#000;font-weight:bold;cursor:pointer;">Сохранить</button>';
    h += '</div>';
    if (nameChanges === 0) {
        h += '<div style="color:#4caf50;font-size:0.7em;margin-top:4px;">Первая смена имени — бесплатно</div>';
    } else {
        h += '<div style="color:#ffd700;font-size:0.7em;margin-top:4px;">Смена имени: 500 золота</div>';
    }
    h += '<div id="name-status" style="color:#aaa;font-size:0.7em;margin-top:4px;"></div>';
    h += '</div>';
    
    h += '<div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">';
    h += '<span style="color:#fff;">Звуки</span>';
    h += '<button onclick="SherwoodUI._toggleSound(' + !this._soundEnabled + ')" style="width:60px;height:30px;background:' + (this._soundEnabled ? '#4caf50' : '#555') + ';border:none;border-radius:15px;cursor:pointer;position:relative;"><span style="position:absolute;top:3px;' + (this._soundEnabled ? 'right:3px;' : 'left:3px;') + 'width:24px;height:24px;background:#fff;border-radius:50%;transition:0.2s;"></span></button>';
    h += '</div>';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;">';
    h += '<span style="color:#fff;">Музыка</span>';
    h += '<button onclick="SherwoodUI._toggleMusic(' + !this._musicEnabled + ')" style="width:60px;height:30px;background:' + (this._musicEnabled ? '#4caf50' : '#555') + ';border:none;border-radius:15px;cursor:pointer;position:relative;"><span style="position:absolute;top:3px;' + (this._musicEnabled ? 'right:3px;' : 'left:3px;') + 'width:24px;height:24px;background:#fff;border-radius:50%;transition:0.2s;"></span></button>';
    h += '</div>';
    h += '</div>';
    
    h += '<button onclick="SherwoodUI._saveProgress()" style="width:100%;background:#4caf50;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;margin-bottom:8px;">Сохранить прогресс</button>';
    
    h += '<button onclick="SherwoodUI._resetCharacter()" style="width:100%;background:#ff9800;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;margin-bottom:8px;">Сбросить персонажа (5000 золота)</button>';
    
    h += '<button onclick="SherwoodUI._exitGame()" style="width:100%;background:#f44336;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;">Выйти</button>';
    
    this._openScreen('Настройки','settings',h);
},
    _changePlayerName: function() { var inp=document.getElementById('pni'),st=document.getElementById('name-status'); if(!inp||!st) return; var nm=inp.value.trim(); if(!nm) { st.textContent='Пустое имя'; st.style.color='#f44336'; return; } var p=Sherwood.getPlayer(); if(p) { p.name=nm; Sherwood.saveGame(); if(Sherwood.Chat) Sherwood.Chat.setUsername(nm); st.textContent='Сохранено!'; st.style.color='#4caf50'; } },
    _saveProgress: function() {
    // Сохраняем игру
    if (Sherwood.saveGameNow) {
        Sherwood.saveGameNow();
    } else if (Sherwood.saveGame) {
        Sherwood.saveGame();
    }
    
    // Сохраняем настройки звука и музыки
    this._saveAudioSettings();
    
    this._showToast('Прогресс сохранён!');
},

_resetCharacter: function() {
    var p = Sherwood.getPlayer();
    if (!p) return;
    
    if ((p.resources.gold || 0) < 5000) {
        this._showToast('Нужно 5000 золота для сброса');
        return;
    }
    
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
    _toggleSound: function(en) { 
    this._soundEnabled = en; this._saveAudioSettings(); 
    if (!en) { for (var k in this._sounds) { try { this._sounds[k].pause(); this._sounds[k].currentTime = 0; } catch(e) {} } }
    this.settings();
},

_toggleMusic: function(en) { 
    this._musicEnabled = en; this._saveAudioSettings(); 
    if (!en) { this._stopMusic(); } 
    else { this._playMusic('main_theme'); }
    this.settings();
},

    _exitGame: function() { if(confirm('Выйти в главное меню?')) { if(Sherwood.saveGameNow) Sherwood.saveGameNow(); else if(Sherwood.saveGame) Sherwood.saveGame(); this._stopMusic(); if(this._screenLayer) { this._screenLayer.style.display='none'; this._screenLayer.innerHTML=''; } if(this._mainElements) this._mainElements.forEach(function(sel){document.querySelectorAll(sel).forEach(function(el){el.style.display='';});}); this.container.style.background=''; document.getElementById('mainInterface').classList.remove('active'); document.getElementById('loadingScreen').classList.remove('hidden'); this.updateDisplay(); } },
    chat: function() { this._playSound('click'); if(!Sherwood.Chat) { this._showPlaceholder('Чат','chat'); return; } var msgs=Sherwood.Chat.getRecentMessages(50),h=''; for (var i=0;i<msgs.length;i++) { var m=msgs[i]; if(m.isSystem) h+='<div style="color:#888;font-size:0.75em;text-align:center;margin:4px 0;">['+m.time+'] '+m.text+'</div>'; else { var me=m.sender===Sherwood.Chat.getUsername(); h+='<div style="margin-bottom:6px;display:flex;flex-direction:column;align-items:'+(me?'flex-end':'flex-start')+';"><div style="color:#c9a040;font-size:0.65em;">'+m.sender+' <span style="color:#666;">'+m.time+'</span></div><div style="background:'+(me?'rgba(201,168,76,0.2)':'rgba(255,255,255,0.08)')+';border-radius:8px;padding:6px 10px;color:#ddd;font-size:0.8em;max-width:80%;word-break:break-word;">'+m.text+'</div></div>'; } } var c='<div style="display:flex;flex-direction:column;height:100%;"><div id="chat-msgs" style="flex:1;background:rgba(0,0,0,0.5);border-radius:8px;padding:12px;margin-bottom:8px;overflow-y:auto;color:#ccc;font-size:0.85em;min-height:300px;">'+(h||'<div style="color:#666;text-align:center;">Пусто</div>')+'</div><div style="display:flex;gap:8px;"><input id="chat-input" placeholder="Сообщение..." style="flex:1;background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:8px;padding:10px;color:#fff;font-family:\'Georgia\',serif;font-size:0.85em;" onkeydown="if(event.key===\'Enter\')SherwoodUI._sendChat()"><button onclick="SherwoodUI._sendChat()" style="background:transparent;border:none;cursor:pointer;padding:0;width:44px;height:44px;"><img src="assets/all_buttons/send_text.png" style="width:100%;height:100%;object-fit:contain;"></button></div></div>'; this._openScreen('Чат','chat',c); setTimeout(function(){var el=document.getElementById('chat-msgs');if(el)el.scrollTop=el.scrollHeight;},100); },
    _sendChat: function() { var inp=document.getElementById('chat-input'); if(!inp) return; var t=inp.value.trim(); if(!t) return; inp.value=''; Sherwood.Chat.sendMessage(t); this.chat(); },
    market: function() {
    this._playSound('click');
    if (!Sherwood.BlackMarket) { this._showPlaceholder('Рынок', 'market'); return; }
    
    var items = Sherwood.BlackMarket.getShopItems();
    var tab1 = Sherwood.BlackMarket._shopTab || 1;
    var canRefresh = Sherwood.BlackMarket.canRefresh();
    
    var h = '';
    
    h += '<div style="display:flex;gap:4px;margin-bottom:12px;">';
    h += '<button onclick="Sherwood.BlackMarket._shopTab=1;SherwoodUI.market();" style="flex:1;background:' + (tab1 === 1 ? '#c9a040' : 'rgba(255,255,255,0.1)') + ';border:1px solid #555;border-radius:6px;padding:8px;color:' + (tab1 === 1 ? '#000' : '#fff') + ';cursor:pointer;font-size:0.8em;font-weight:bold;">Товары</button>';
    h += '<button onclick="Sherwood.BlackMarket._shopTab=2;SherwoodUI.market();" style="flex:1;background:' + (tab1 === 2 ? '#c9a040' : 'rgba(255,255,255,0.1)') + ';border:1px solid #555;border-radius:6px;padding:8px;color:' + (tab1 === 2 ? '#000' : '#fff') + ';cursor:pointer;font-size:0.8em;font-weight:bold;">Ювелирка</button>';
    h += '</div>';
    
    if (tab1 === 1) {
        h += '<div style="text-align:center;margin-bottom:12px;">';
        if (canRefresh) {
            h += '<button onclick="SherwoodUI._refreshMarket()" style="background:#ff9800;border:none;border-radius:8px;padding:10px 24px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.85em;">Обновить за 150 золота</button>';
        } else {
            h += '<div style="color:#888;font-size:0.75em;">Обновлений сегодня больше нет</div>';
        }
        h += '</div>';
        
        h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:400px;margin:0 auto;">';
        
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.tab && item.tab !== 1) continue;
            var purchased = Sherwood.BlackMarket.isPurchased(i);
            
            h += '<div onclick="' + (purchased ? '' : 'SherwoodUI._buyItem(' + i + ')') + '" style="position:relative;cursor:' + (purchased ? 'default' : 'pointer') + ';">';
            h += '<img src="assets/interface/product_slot.png" style="width:100%;height:auto;display:block;">';
            h += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8px;box-sizing:border-box;">';
            h += '<img src="' + item.icon + '" style="width:44px;height:44px;object-fit:contain;margin-bottom:4px;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '<div style="color:#e0c080;font-size:0.65em;font-weight:bold;text-align:center;line-height:1.1;">' + item.name + '</div>';
            h += '<div style="color:#aaa;font-size:0.55em;text-align:center;">x' + (item.quantity || 1) + '</div>';
            
            if (purchased) {
                h += '<div style="color:#4caf50;font-size:0.6em;font-weight:bold;">Куплено</div>';
            } else {
                h += '<div style="color:' + (item.currency === 'gold' ? '#ffd700' : '#c0c0c0') + ';font-size:0.65em;font-weight:bold;">' + item.price + ' ' + (item.currency === 'gold' ? 'зол.' : 'сер.') + '</div>';
            }
            
            h += '</div>';
            h += '</div>';
        }
        
        h += '</div>';
    } else {
        // Вкладка Ювелирка
        var rings = Sherwood.BlackMarket.getAvailableRings();
        var amulets = Sherwood.BlackMarket.getAvailableAmulets();
        var player = Sherwood.getPlayer();
        
        h += '<div style="color:#e0c080;font-size:1em;font-weight:bold;margin-bottom:8px;">Кольца</div>';
        for (var i = 0; i < rings.length; i++) {
            var ring = rings[i];
            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:10px;">';
            h += '<img src="' + ring.icon + '" style="width:48px;height:48px;object-fit:contain;">';
            h += '<div style="flex:1;">';
            h += '<div style="color:#e0c080;font-size:0.8em;font-weight:bold;">' + ring.name + '</div>';
            h += '<div style="color:#aaa;font-size:0.6em;">АТК +' + ring.stats.attack + ' | ЗЩТ +' + ring.stats.defense + '</div>';
            h += '</div>';
            h += '<button onclick="SherwoodUI._buyRing(\'' + ring.id + '\')" style="background:#4caf50;border:none;border-radius:4px;padding:6px 12px;color:#fff;cursor:pointer;font-size:0.7em;">' + ring.price + ' сер.</button>';
            h += '</div>';
        }
        
        h += '<div style="color:#e0c080;font-size:1em;font-weight:bold;margin:12px 0 8px;">Амулеты</div>';
        for (var i = 0; i < amulets.length; i++) {
            var amulet = amulets[i];
            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:10px;">';
            h += '<img src="' + amulet.icon + '" style="width:48px;height:48px;object-fit:contain;">';
            h += '<div style="flex:1;">';
            h += '<div style="color:#e0c080;font-size:0.8em;font-weight:bold;">' + amulet.name + '</div>';
            h += '<div style="color:#aaa;font-size:0.6em;">HP +' + amulet.stats.hp + ' | ЗЩТ +' + amulet.stats.defense + '</div>';
            h += '</div>';
            h += '<button onclick="SherwoodUI._buyAmulet(\'' + amulet.id + '\')" style="background:#4caf50;border:none;border-radius:4px;padding:6px 12px;color:#fff;cursor:pointer;font-size:0.7em;">' + amulet.price + ' сер.</button>';
            h += '</div>';
        }
    }
    
    h += '<div id="market-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:8px;"></div>';
    
    this._openScreenScrollable('Рынок', 'market', h);
},

_refreshMarket: function() {
    var r = Sherwood.BlackMarket.refresh();
    if (r.success) {
        this._showToast('Товары обновлены!');
        this.market();
    } else {
        this._showToast(r.reason);
    }
},
_buyItem: function(i) {
    var r = Sherwood.BlackMarket.buyItem(i);
    var log = document.getElementById('market-log');
    if (r.success) {
        if (log) log.textContent = 'Куплено!';
        this.updateDisplay();
        this._playSound('loot_fly');
    } else {
        if (log) log.textContent = (r.reason || 'Ошибка');
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
        this._playSound('loot_fly');
    } else {
        if (log) log.textContent = (r.reason || 'Ошибка');
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
        this._playSound('loot_fly');
    } else {
        if (log) log.textContent = (r.reason || 'Ошибка');
        this._showToast(r.reason || 'Ошибка');
    }
    var self = this;
    setTimeout(function() { self.market(); }, 800);
},

        bag: function() {
    this._playSound('click');
    var bag = Sherwood.Bag;
    var items = bag ? bag.getItems() : [];
    var max = bag ? bag.getMaxSlots() : 10;
    var resources = bag ? bag.getResources() : {};
    
    var h = '';
    
    h += '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:12px;">';
    
    var resDefs = [
        { key: 'gold', icon: 'assets/interface/resource_gold.png' },
        { key: 'silver', icon: 'assets/interface/resource_silver.png' },
        { key: 'skins', icon: 'assets/interface/skin_of_the_sherwood_creature.png' },
        { key: 'entranceTickets', icon: 'assets/interface/resource_key_to_locked_levels.png' },
        { key: 'autoFightTickets', icon: 'assets/interface/ticket_autofight.png' },
        { key: 'amuletTablets', icon: 'assets/interface/amulet_crafting_tablet_resource.png' },
        { key: 'ringTablets', icon: 'assets/interface/ring_crafting_tablet_resource.png' },
        { key: 'skinTablets', icon: 'assets/interface/resource_appearance_crafting_tablet.png' },
        { key: 'portalToken1', icon: 'assets/interface/resource_token_on_entrance_portal_1.png' },
        { key: 'portalToken2', icon: 'assets/interface/resource_token_on_entrance_portal_2.png' },
        { key: 'portalToken3', icon: 'assets/interface/resource_token_on_entrance_portal_3.png' }
    ];
    
    for (var r = 0; r < resDefs.length; r++) {
        var rd = resDefs[r];
        var count = resources[rd.key] || 0;
        h += '<div style="position:relative;width:70px;height:70px;">';
        h += '<img src="assets/interface/visual_resource.png" style="width:100%;height:100%;object-fit:contain;">';
        h += '<img src="' + rd.icon + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:36px;height:36px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
        h += '<span style="position:absolute;top:2px;right:6px;color:#fff;font-size:0.6em;font-weight:bold;text-shadow:0 1px 2px #000;">' + count + '</span>';
        h += '</div>';
    }
    
    h += '</div>';
    
    h += '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;margin-bottom:6px;">' + items.length + '/' + max + ' ячеек</div>';
    
    var expInfo = bag.getExpansionInfo();
    var expBtn = expInfo.canExpand ? '<button onclick="SherwoodUI._expandBag()" style="margin-top:10px;background:#c9a040;border:none;border-radius:8px;padding:8px 18px;color:#000;font-weight:bold;cursor:pointer;font-size:0.8em;">Расширить +10 (' + expInfo.costSilver + ' серебра + ' + expInfo.costSkin + ' шкур)</button>' : '<span style="color:#666;font-size:0.7em;">Максимум для вашего уровня</span>';
    h += expBtn;
    
    h += '<div id="bag-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:400px;margin:16px auto 0;">';
    
    for (var i = 0; i < max; i++) {
        var item = items[i];
        if (item) {
            var gc = Sherwood.GradeColors ? Sherwood.GradeColors[item.grade] : '#9d9d9d';
            h += '<div draggable="true" data-bag-index="' + i + '" ondragstart="SherwoodUI._bagDragStart(event,' + i + ')" ondragover="SherwoodUI._bagDragOver(event)" ondrop="SherwoodUI._bagDrop(event,' + i + ')" onclick="SherwoodUI._bagAction(' + i + ')" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:70px;height:70px;border:2px solid ' + gc + ';border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;padding:4px;">';
            h += '<img src="' + (item.icon || 'assets/interface/labyrinth_of_icons.png') + '" style="width:40px;height:40px;object-fit:contain;">';
            if (item.quantity > 1) {
                h += '<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.65em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 6px;border-radius:4px;">' + item.quantity + '</span>';
            }
            h += '</div>';
        } else {
            h += '<div data-bag-index="' + i + '" ondragover="SherwoodUI._bagDragOver(event)" ondrop="SherwoodUI._bagDrop(event,' + i + ')" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:70px;height:70px;border:2px solid #555;border-radius:8px;display:flex;align-items:center;justify-content:center;"></div>';
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
    
    var items = Sherwood.Bag.getItems();
    if (sourceIndex >= items.length) return;
    
    var sourceItem = items[sourceIndex];
    var targetItem = items[targetIndex];
    
    if (targetItem && sourceItem.id === targetItem.id && sourceItem.name === targetItem.name) {
        var maxStack = sourceItem.maxStack || 100;
        var totalQty = (sourceItem.quantity || 1) + (targetItem.quantity || 1);
        if (totalQty <= maxStack) {
            targetItem.quantity = totalQty;
            items.splice(sourceIndex, 1);
        } else {
            targetItem.quantity = maxStack;
            sourceItem.quantity = totalQty - maxStack;
        }
    } else {
        items[sourceIndex] = targetItem;
        items[targetIndex] = sourceItem;
    }
    
    Sherwood.Bag._save();
    this.bag();
},

_expandBag: function() { 
    var r = Sherwood.Bag.expandBag();
    var info = document.getElementById('bag-info'); 
    if (r.success) { 
        if (info) info.textContent = 'Сумка расширена до ' + r.newSlots + ' ячеек!'; 
        this.updateDisplay(); 
    } else { 
        if (info) info.textContent = (r.reason || 'Ошибка'); 
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
    if (item.part === 'ring' || item.part === 'amulet') {
        a += '<button onclick="Sherwood.Bag.equipItem(' + i + ');SherwoodUI.bag();" style="background:#9c27b0;border:none;border-radius:6px;padding:6px 14px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;">Надеть</button>';
    } else if (item.part) {
        a += '<button onclick="Sherwood.Bag.equipItem(' + i + ');SherwoodUI.bag();" style="background:#4caf50;border:none;border-radius:6px;padding:6px 14px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;">Надеть</button>';
    }
    a += '<button onclick="Sherwood.Bag.sellItem(' + i + ');SherwoodUI.bag();" style="background:#ff9800;border:none;border-radius:6px;padding:6px 14px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;">Продать</button>';
    a += '<button onclick="Sherwood.Bag.discardItem(' + i + ');SherwoodUI.bag();" style="background:#f44336;border:none;border-radius:6px;padding:6px 14px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;">Выкинуть</button>';
    info.innerHTML = '<div style="color:#e0c080;font-size:0.95em;font-weight:bold;">' + (item.name || 'Предмет') + '</div><div style="color:#aaa;font-size:0.75em;">' + (item.grade || 'обычный') + ' x' + (item.quantity || 1) + '</div><div style="margin-top:8px;">' + a + '</div>';
},
    // ===== КОШЕЛь =====
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
    var totalSilver = p.wallet.totalSilver || 0;
    var maxPerCell = 20000;
    var maxTotal = 30 * maxPerCell;
    var filledCells = 0;
    var totalFilled = 0;
    for (var i = 0; i < cells.length; i++) {
        totalFilled += cells[i];
        if (cells[i] >= maxPerCell) filledCells++;
    }
    var allFull = filledCells >= 30;
    var canWithdraw = totalFilled >= 10000;
    
    var h = '';
    h += '<div style="text-align:center;padding:10px;">';
    h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:4px;">Кошелёк</div>';
    h += '<div style="color:#c0c0c0;font-size:0.9em;margin-bottom:8px;">Накоплено: ' + totalFilled + ' / ' + maxTotal + ' серебра</div>';
    h += '<div style="color:#aaa;font-size:0.75em;margin-bottom:16px;">Ячеек заполнено: ' + filledCells + ' / 30</div>';
    
    h += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:380px;margin:0 auto 20px;">';
    for (var i = 0; i < cells.length; i++) {
        var cellSilver = cells[i];
        var pct = Math.min(100, Math.round((cellSilver / maxPerCell) * 100));
        var glow = allFull ? 'box-shadow:0 0 14px 5px rgba(255,215,0,0.8);' : '';
        h += '<div style="position:relative;width:68px;height:68px;background:url(\'assets/interface/wallet_cell.png\') center/contain no-repeat;background-size:cover;border:2px solid ' + (cellSilver >= maxPerCell ? '#ffd700' : '#555') + ';border-radius:8px;display:flex;align-items:center;justify-content:center;' + glow + '">';
        if (cellSilver > 0) {
            h += '<img src="assets/interface/resource_silver.png" style="width:36px;height:36px;object-fit:contain;opacity:' + (0.3 + (pct / 100) * 0.7) + ';">';
        }
        if (cellSilver > 0) {
            h += '<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.5em;font-weight:bold;text-shadow:0 0 4px #000;">' + pct + '%</span>';
        }
        h += '</div>';
    }
    h += '</div>';
    
    if (canWithdraw) {
        h += '<button onclick="SherwoodUI._withdrawWallet()" style="background:#c9a040;border:none;border-radius:8px;padding:14px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:0.95em;margin-bottom:8px;">Забрать ' + totalFilled + ' серебра</button>';
        if (allFull) {
            h += '<button onclick="SherwoodUI._withdrawWalletDouble()" style="background:#ffd700;border:none;border-radius:8px;padding:14px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:0.95em;margin-bottom:8px;">Забрать x2 (' + (totalFilled * 2) + ') за 100 золота</button>';
        }
    } else {
        h += '<div style="color:#888;font-size:0.85em;margin-bottom:8px;">Нужно минимум 10,000 серебра для снятия</div>';
    }
    
    h += '</div>';
    
    this._openScreen('Кошелёк', 'wallet', h, 'SherwoodUI.profile()');
},

_withdrawWallet: function() {
    var p = Sherwood.getPlayer();
    if (!p.wallet) return;
    var totalFilled = 0;
    for (var i = 0; i < p.wallet.cells.length; i++) totalFilled += p.wallet.cells[i];
    if (totalFilled < 100000) { this._showToast('Минимум 100,000 серебра для снятия'); return; }
    Sherwood.addResource('silver', totalFilled);
    for (var i = 0; i < p.wallet.cells.length; i++) p.wallet.cells[i] = 0;
    p.wallet.totalSilver = 0;
    Sherwood.saveGame();
    this.updateDisplay();
    this.wallet();
},

_withdrawWalletDouble: function() {
    var p = Sherwood.getPlayer();
    if (!p.wallet) return;
    if ((p.resources.gold || 0) < 100) { this._showToast('Нужно 100 золота'); return; }
    var totalFilled = 0;
    for (var i = 0; i < p.wallet.cells.length; i++) totalFilled += p.wallet.cells[i];
    p.resources.gold -= 100;
    Sherwood.addResource('silver', totalFilled * 2);
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
    p.wallet.totalSilver = 0;
    for (var i = 0; i < p.wallet.cells.length; i++) p.wallet.totalSilver += p.wallet.cells[i];
    Sherwood.saveGame();
},
    profile: function() {
    this._playSound('click');
    var p = Sherwood.getPlayer();
    var eq = Sherwood.Bag ? Sherwood.Bag.getEquipment() : {};
    var ring = eq.ring, amulet = eq.amulet;
    var trophies = p.trophies || [];
    var activeSkin = p.activeSkin || 'skin1_01';
    var unlockedSkins = p.unlockedSkins || ['skin1_01'];

    var h = '<div style="text-align:center;margin-bottom:12px;">';
    h += '<div onclick="SherwoodUI._showSkinSelection()" style="cursor:pointer;display:inline-block;position:relative;">';
    h += '<img src="assets/hero_skins/' + activeSkin + '.png" style="width:90px;height:90px;border-radius:12px;border:2px solid #c9a040;object-fit:contain;" onerror="this.src=\'assets/hero_skins/skin1_01.png\'">';
    h += '<div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.7);border-radius:50%;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border:1px solid #c9a040;">';
    h += '<span style="color:#ffd700;font-size:0.7em;">⚙</span>';
    h += '</div>';
    h += '</div>';
    h += '<div style="color:#e0c080;font-weight:bold;margin-top:4px;">' + p.name + '</div>';
    h += '<div style="color:#aaa;">Уровень ' + p.level + '</div>';
    h += '<div style="color:#888;font-size:0.6em;margin-top:2px;">Нажми на героя для смены облика</div>';
    h += '</div>';

    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:rgba(0,0,0,0.4);border-radius:10px;padding:12px;margin-bottom:12px;">';
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><img src="' + this._statIcons.attack + '" style="width:22px;height:22px;"><span style="color:#f44336;">' + p.stats.attack + '</span></div>';
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><img src="' + this._statIcons.defense + '" style="width:22px;height:22px;"><span style="color:#2196f3;">' + p.stats.defense + '</span></div>';
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><img src="' + this._statIcons.hp + '" style="width:22px;height:22px;"><span style="color:#4caf50;">' + p.stats.hp + '</span></div>';
    h += '</div>';

    var skills = Sherwood.Combat ? Sherwood.Combat.getSkills() : {};
    var unlockedList = [];
    for (var id in skills) { if (skills[id].unlocked) unlockedList.push(skills[id]); }
    if (unlockedList.length > 0) {
        h += '<div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;margin-bottom:12px;">';
        h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><img src="assets/all_buttons/ranger_skills_button.png" style="width:32px;height:32px;"><span style="color:#e0c080;font-weight:bold;">Таланты</span></div>';
        h += '<div style="display:flex;flex-wrap:wrap;gap:6px;">';
        for (var i = 0; i < unlockedList.length; i++) {
            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #c9a040;border-radius:6px;padding:6px;text-align:center;width:70px;">';
            h += '<img src="' + unlockedList[i].icon + '" style="width:32px;height:32px;object-fit:contain;"><div style="color:#ffa500;font-size:0.5em;margin-top:2px;">' + unlockedList[i].name + '</div></div>';
        }
        h += '</div></div>';
    }

    h += '<div style="display:flex;justify-content:center;gap:12px;margin-bottom:12px;">';
    h += '<div class="profile-action-btn" onclick="SherwoodUI._showAllTrophies()"><img src="' + (trophies.length > 0 && trophies[0].icon ? trophies[0].icon : 'assets/interface/trophy_stand.png') + '"><span class="action-label">' + (trophies.length > 0 ? trophies.length + ' трофеев' : 'Трофеи') + '</span></div>';
    h += '<div class="profile-action-btn" onclick="SherwoodUI._showAllRings()"><img src="' + (ring ? ring.icon || 'assets/interface/ring_first_level.png' : 'assets/interface/ring_first_level.png') + '"><span class="action-label">' + (ring ? ring.name : 'Кольца') + '</span></div>';
    h += '<div class="profile-action-btn" onclick="SherwoodUI._showAllAmulets()"><img src="' + (amulet ? amulet.icon || 'assets/interface/sherwood_amulet_level_one.png' : 'assets/interface/sherwood_amulet_level_one.png') + '"><span class="action-label">' + (amulet ? amulet.name : 'Амулеты') + '</span></div>';
    h += '</div>';

    h += '<div class="profile-actions">';
    h += '<div class="profile-action-btn" onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.training();"><img src="assets/all_buttons/training.png"><span class="action-label">Тренировка</span></div>';
    h += '<div class="profile-action-btn" onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.forge();"><img src="assets/all_buttons/forge.png"><span class="action-label">Кузница</span></div>';
    h += '<div class="profile-action-btn" onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.wallet();"><img src="assets/interface/wallet.png"><span class="action-label">Кошелёк</span></div>';
    h += '<div class="profile-action-btn" onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.bestiary();"><img src="assets/all_buttons/bestiary.png"><span class="action-label">Бестиарий</span></div>';
    h += '</div>';

    h += '<div id="profile-info" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:12px;"></div>';
    this._openScreen('Профиль', 'profile', h);
},
    _showSkinSelection: function() {
    this._playSound('click');
    var p = Sherwood.getPlayer();
    var unlockedSkins = p.unlockedSkins || ['skin1_01'];
    var activeSkin = p.activeSkin || 'skin1_01';
    
    var h = '<div style="text-align:center;padding:10px;">';
    h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:16px;">Выбор облика</div>';
    h += '<div style="color:#aaa;font-size:0.75em;margin-bottom:16px;">Открыто: ' + unlockedSkins.length + '</div>';
    
    h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:400px;margin:0 auto;">';
    
    for (var i = 0; i < unlockedSkins.length; i++) {
        var sid = unlockedSkins[i];
        var isActive = activeSkin === sid;
        var skinName = Sherwood.SKIN_BONUSES[sid] ? Sherwood.SKIN_BONUSES[sid].name : sid;
        var skinBonus = Sherwood.SKIN_BONUSES[sid] ? Sherwood.SKIN_BONUSES[sid].bonus : 0;
        
        h += '<div onclick="' + (isActive ? '' : 'SherwoodUI._selectSkin(\'' + sid + '\')') + '" style="background:rgba(0,0,0,0.6);border:2px solid ' + (isActive ? '#ffd700' : '#4caf50') + ';border-radius:10px;padding:10px;text-align:center;cursor:' + (isActive ? 'default' : 'pointer') + ';position:relative;">';
        
        if (isActive) {
            h += '<div style="position:absolute;top:4px;right:4px;background:#ffd700;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;">';
            h += '<span style="color:#000;font-size:0.7em;font-weight:bold;">✓</span>';
            h += '</div>';
        }
        
        h += '<img src="assets/hero_skins/' + sid + '.png" style="width:64px;height:64px;object-fit:contain;border-radius:8px;margin:0 auto;" onerror="this.src=\'assets/hero_skins/skin1_01.png\'">';
        h += '<div style="color:#e0c080;font-size:0.6em;margin-top:4px;">' + skinName + '</div>';
        h += '<div style="color:#ffd700;font-size:0.55em;margin-top:2px;">Бонус: +' + skinBonus + '</div>';
        
        if (isActive) {
            h += '<div style="color:#ffd700;font-size:0.6em;font-weight:bold;margin-top:4px;">Активен</div>';
        } else {
            h += '<div style="color:#4caf50;font-size:0.6em;margin-top:4px;">Надеть</div>';
        }
        
        h += '</div>';
    }
    
    h += '</div>';
    h += '</div>';
    
    var bgImage = 'assets/interface/wallet_visual.png';
    
    if (this._screenLayer) { 
        this._screenLayer.innerHTML = '<div style="height:100%;background:url(\'' + bgImage + '\') center/cover no-repeat;display:flex;flex-direction:column;overflow:hidden;"><div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;"><button onclick="SherwoodUI.profile()" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">Облики</span></div><div style="flex:1;overflow-y:auto;overflow-x:hidden;padding:20px;-webkit-overflow-scrolling:touch;">' + h + '</div></div>'; 
        this._screenLayer.style.display = 'block'; 
    }
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
_equipSkinFromProfile: function(sid) {
    var r = Sherwood.Forge.equipSkin(sid);
    if (r.success) {
        var heroImg = document.querySelector('.hero-layer img');
        if (heroImg) heroImg.src = 'assets/hero_skins/' + sid + '.png';
        this.profile();
    }
},
_showAllTrophies: function() {
    var trophies = Sherwood.getPlayer().trophies || [];
    var h = '<div style="padding:10px;"><div style="color:#e0c080;font-weight:bold;margin-bottom:8px;">Трофеи (' + trophies.length + ')</div>';
    if (trophies.length === 0) h += '<div style="color:#aaa;">Нет трофеев</div>';
    for (var i = 0; i < trophies.length; i++) {
        var t = trophies[i];
        h += '<div style="display:flex;gap:12px;background:rgba(0,0,0,0.5);border:1px solid #c9a040;border-radius:10px;padding:10px;margin-bottom:8px;">';
        h += '<div style="position:relative;width:80px;height:80px;flex-shrink:0;">';
        h += '<img src="assets/all_trophies/asset_isolated_on_a_solid.png" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:contain;z-index:0;">';
        h += '<img src="' + (t.icon || 'assets/interface/trophy_stand.png') + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:56px;height:56px;object-fit:contain;z-index:1;border-radius:8px;">';
        h += '</div>';
        h += '<div style="flex:1;"><div style="color:#e0c080;font-weight:bold;">' + t.name + '</div>';
        if (t.bonus) h += '<div style="color:#aaa;font-size:0.7em;margin-top:4px;">АТК +' + (t.bonus.attack||0) + ' | ЗЩТ +' + (t.bonus.defense||0) + ' | HP +' + (t.bonus.hp||0) + '</div>';
        h += '</div></div>';
    }
    h += '</div>';
    this._openScreen('Трофеи', 'profile', h, 'SherwoodUI.profile()');
},

_showAllRings: function() {
    var player = Sherwood.getPlayer();
    var jewelry = player.jewelry || { rings: [], amulets: [] };
    var purchasedRingIds = jewelry.rings || [];
    
    var allRings = Sherwood.BlackMarket ? Sherwood.BlackMarket._RINGS : [];
    var h = '<div style="padding:10px;"><div style="color:#e0c080;font-weight:bold;margin-bottom:8px;">Кольца (' + purchasedRingIds.length + ' куплено)</div>';
    
    if (purchasedRingIds.length === 0) {
        h += '<div style="color:#aaa;">Нет купленных колец</div>';
    }
    
    for (var i = 0; i < allRings.length; i++) {
        var ring = allRings[i];
        var isPurchased = purchasedRingIds.indexOf(ring.id) !== -1;
        
        if (!isPurchased) continue;
        
        h += '<div style="display:flex;gap:12px;background:rgba(0,0,0,0.5);border:1px solid #c9a040;border-radius:10px;padding:10px;margin-bottom:8px;">';
        h += '<img src="' + ring.icon + '" style="width:80px;height:80px;object-fit:contain;border-radius:8px;flex-shrink:0;">';
        h += '<div style="flex:1;"><div style="color:#e0c080;font-weight:bold;">' + ring.name + '</div>';
        h += '<div style="color:#aaa;font-size:0.7em;margin-top:4px;">АТК +' + (ring.stats.attack || 0) + ' | ЗЩТ +' + (ring.stats.defense || 0) + '</div>';
        h += '<div style="color:#4caf50;font-size:0.7em;margin-top:4px;">✓ Куплено</div>';
        h += '</div></div>';
    }
    
    h += '</div>';
    this._openScreen('Кольца', 'profile', h, 'SherwoodUI.profile()');
},

_showAllAmulets: function() {
    var player = Sherwood.getPlayer();
    var jewelry = player.jewelry || { rings: [], amulets: [] };
    var purchasedAmuletIds = jewelry.amulets || [];
    
    var allAmulets = Sherwood.BlackMarket ? Sherwood.BlackMarket._AMULETS : [];
    var h = '<div style="padding:10px;"><div style="color:#e0c080;font-weight:bold;margin-bottom:8px;">Амулеты (' + purchasedAmuletIds.length + ' куплено)</div>';
    
    if (purchasedAmuletIds.length === 0) {
        h += '<div style="color:#aaa;">Нет купленных амулетов</div>';
    }
    
    for (var i = 0; i < allAmulets.length; i++) {
        var amulet = allAmulets[i];
        var isPurchased = purchasedAmuletIds.indexOf(amulet.id) !== -1;
        
        if (!isPurchased) continue;
        
        h += '<div style="display:flex;gap:12px;background:rgba(0,0,0,0.5);border:1px solid #c9a040;border-radius:10px;padding:10px;margin-bottom:8px;">';
        h += '<img src="' + amulet.icon + '" style="width:80px;height:80px;object-fit:contain;border-radius:8px;flex-shrink:0;">';
        h += '<div style="flex:1;"><div style="color:#e0c080;font-weight:bold;">' + amulet.name + '</div>';
        h += '<div style="color:#aaa;font-size:0.7em;margin-top:4px;">HP +' + (amulet.stats.hp || 0) + ' | ЗЩТ +' + (amulet.stats.defense || 0) + '</div>';
        h += '<div style="color:#4caf50;font-size:0.7em;margin-top:4px;">✓ Куплено</div>';
        h += '</div></div>';
    }
    
    h += '</div>';
    this._openScreen('Амулеты', 'profile', h, 'SherwoodUI.profile()');
},
_showProfileInfo: function(type) { var info=document.getElementById('profile-info'); if(!info) return; if(type==='trophies') { var t=Sherwood.getPlayer().trophies||[]; info.innerHTML=t.length?t.map(function(x){return x.name;}).join(' | '):'Нет трофеев'; } },
training: function() { var gb=this._previousScreen==='profile'?'SherwoodUI.profile()':'SherwoodUI.loadHome()'; this._previousScreen=null; this._playSound('click'); var p=Sherwood.getPlayer(),tl=p.trainingLevels||{},stats=['attack','defense','hp'],names={attack:'Атака',defense:'Защита',hp:'Здоровье'},colors={attack:'#f44336',defense:'#2196f3',hp:'#4caf50'},h='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'; for (var i=0;i<stats.length;i++) { var s=stats[i],lvl=tl[s]||0; h+='<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:12px;text-align:center;"><div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;"><img src="'+this._statIcons[s]+'" style="width:28px;height:28px;"><span style="color:#e0c080;">'+names[s]+'</span></div><div style="color:#aaa;font-size:0.8em;">Ур. '+lvl+'/200</div><div style="color:'+colors[s]+';font-size:0.7em;">+'+(s==='hp'?10:2)+' за ур.</div><button onclick="SherwoodUI._doTraining(\''+s+'\')" style="margin-top:8px;background:#c9a040;border:none;border-radius:4px;padding:6px 16px;color:#000;cursor:pointer;font-size:0.8em;">Тренировать</button></div>'; } h+='</div><div id="training-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:12px;"></div>'; this._openScreen('Тренировка','training',h,gb); },
_doTraining: function(stat) {
    var p = Sherwood.getPlayer(); if (!p) return;
    if (!p.trainingLevels) p.trainingLevels = { attack: 0, defense: 0, hp: 0 };
    var cur = p.trainingLevels[stat] || 0;
    if (cur >= 200) { var log = document.getElementById('training-log'); if (log) log.textContent = 'Макс. уровень!'; return; }
    
    var nextLevel = cur + 1;
    var isGoldLevel = nextLevel % 5 === 0;
    var cost;
    if (isGoldLevel) {
        cost = Math.round(5 * Math.pow(1.15, Math.floor(nextLevel / 5)));
    } else {
        cost = Math.round(10 * Math.pow(nextLevel, 1.15));
    }
    var currency = isGoldLevel ? 'gold' : 'silver';
    
    if ((p.resources[currency] || 0) < cost) {
        var log = document.getElementById('training-log');
        if (log) log.textContent = 'Нужно ' + cost + ' ' + (isGoldLevel ? 'золота' : 'серебра') + '!';
        return;
    }
    p.resources[currency] -= cost;
    p.trainingLevels[stat] = nextLevel;
    if (Sherwood.Daily) Sherwood.Daily.updateProgress('stat_' + stat, p.stats[stat]);
    if (Sherwood._recalcStats) Sherwood._recalcStats();
    if (Sherwood.saveGame) Sherwood.saveGame();
    this.updateDisplay();
    this.training();
    var log = document.getElementById('training-log');
    if (log) log.textContent = stat + ' → ' + nextLevel + ' (-' + cost + ' ' + (isGoldLevel ? 'золота' : 'серебра') + ')';
},

forge: function() {
    var gb = this._previousScreen === 'profile' ? 'SherwoodUI.profile()' : 'SherwoodUI.loadHome()';
    this._previousScreen = null;
    this._playSound('click');
    if (!Sherwood.Forge) { this._showPlaceholder('Кузница', 'forge', gb); return; }
    var items = Sherwood.Bag ? Sherwood.Bag.getItems() : [];
    var enhanceItems = items.filter(function(i) { return i.part || i.type === 'equipment'; });
    var skins = Sherwood.Forge.getCraftSkins(); var player = Sherwood.getPlayer();
    var unlocked = player.unlockedSkins || []; var active = player.activeSkin || 'skin1_01';
    var ringInfo = Sherwood.Forge.getRingCraftInfo(); var amuletInfo = Sherwood.Forge.getAmuletCraftInfo();
    var arrowInfo = Sherwood.Forge.getArrowCraftInfo(); var arrowCount = Sherwood.Forge.getArrowCount();
    
    var h = '';
    h += '<div style="margin-bottom:12px;"><div style="color:#e0c080;margin-bottom:4px;">Заточка</div>';
    for (var i = 0; i < enhanceItems.length; i++) { var item = enhanceItems[i], idx = items.indexOf(item), lvl = item.enhancement || 0; h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:6px;padding:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;"><div><div style="color:#e0c080;font-size:0.8em;">' + item.name + '</div><div style="color:#aaa;font-size:0.6em;">Заточка: +' + lvl + '</div></div><button onclick="SherwoodUI._enhanceItem(' + idx + ')" style="background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Точить</button></div>'; }
    h += enhanceItems.length === 0 ? '<div style="color:#aaa;font-size:0.7em;">Нет предметов</div>' : '';
    h += '</div>';
    h += '<div style="margin-bottom:12px;"><div style="color:#e0c080;margin-bottom:4px;">Стрелы Шервудской лощины</div>';
    h += '<div style="color:#aaa;font-size:0.7em;">В сумке: ' + arrowCount + ' шт.</div>';
    h += '<div style="color:#aaa;font-size:0.65em;">Веток: ' + arrowInfo.branches + ' | Перьев: ' + arrowInfo.feathers + ' | Костей: ' + arrowInfo.bones + '</div>';
    if (arrowInfo.canCraft > 0) { h += '<button onclick="SherwoodUI._craftArrow(1)" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Создать 1 стрелу</button>'; if (arrowInfo.canCraft >= 10) h += '<button onclick="SherwoodUI._craftArrow(10)" style="margin-left:4px;background:#ff9800;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Создать 10</button>'; if (arrowInfo.canCraft >= 100) h += '<button onclick="SherwoodUI._craftArrow(100)" style="margin-left:4px;background:#f44336;border:none;border-radius:4px;padding:4px 10px;color:#fff;cursor:pointer;font-size:0.7em;">Создать все</button>'; }
    else { h += '<div style="color:#888;font-size:0.6em;">Нужно: 1 Ветка + 1 Перо + 1 Кость</div>'; }
    h += '</div>';
    h += '<div style="margin-bottom:12px;"><div style="color:#e0c080;margin-bottom:4px;">Кольца</div>';
    h += '<div style="color:#aaa;font-size:0.7em;">Уровень: ' + ringInfo.currentLevel + '/' + ringInfo.maxLevel + ' | Свитков: ' + ringInfo.scrolls + '</div>';
    if (ringInfo.canCraft) { h += '<button onclick="SherwoodUI._craftRing()" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Улучшить (' + ringInfo.cost + ' свитков)</button>'; }
    else { h += '<div style="color:#888;font-size:0.6em;">' + (ringInfo.reason || 'Нужно ' + ringInfo.cost + ' свитков') + '</div>'; }
    h += '</div>';
    h += '<div style="margin-bottom:12px;"><div style="color:#e0c080;margin-bottom:4px;">Амулеты</div>';
    h += '<div style="color:#aaa;font-size:0.7em;">Уровень: ' + amuletInfo.currentLevel + '/' + amuletInfo.maxLevel + ' | Свитков: ' + amuletInfo.scrolls + '</div>';
    if (amuletInfo.canCraft) { h += '<button onclick="SherwoodUI._craftAmulet()" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Улучшить (' + amuletInfo.cost + ' свитков)</button>'; }
    else { h += '<div style="color:#888;font-size:0.6em;">' + (amuletInfo.reason || 'Нужно ' + amuletInfo.cost + ' свитков') + '</div>'; }
    h += '</div>';
    h += '<div><div style="color:#e0c080;margin-bottom:4px;">Облики</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
    for (var i = 0; i < skins.length; i++) { 
        var skin = skins[i];
        var owned = unlocked.indexOf(skin.id) !== -1, isActive = active === skin.id; 
        h += '<div style="background:rgba(0,0,0,0.5);border:2px solid ' + (isActive ? '#ffd700' : owned ? '#4caf50' : '#555') + ';border-radius:8px;padding:8px;text-align:center;">'; 
        h += '<img src="' + skin.icon + '" style="width:48px;height:48px;object-fit:contain;border-radius:4px;" onerror="this.src=\'assets/hero_skins/skin1_01.png\'">'; 
        h += '<div style="color:#e0c080;font-size:0.7em;">' + skin.name + '</div>'; 
        if (owned) { 
            h += isActive ? '<div style="color:#ffd700;font-size:0.6em;">Активен</div>' : '<button onclick="SherwoodUI._equipSkin(\'' + skin.id + '\')" style="margin-top:4px;background:#4caf50;border:none;border-radius:4px;padding:3px 8px;color:#fff;cursor:pointer;font-size:0.6em;">Надеть</button>'; 
        } else { 
            h += '<button onclick="SherwoodUI._craftSkin(\'' + skin.id + '\')" style="margin-top:4px;background:#ff9800;border:none;border-radius:4px;padding:3px 8px;color:#fff;cursor:pointer;font-size:0.6em;">Создать</button>'; 
        } 
        h += '</div>'; 
    }
    h += '</div></div><div id="forge-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:8px;"></div>';
    this._openScreenScrollable('Кузница', 'forge', h, gb);
},

_enhanceItem: function(idx) { var r = Sherwood.Forge.enhanceItem(idx); var log = document.getElementById('forge-log'); if (r.enhanced) { if (log) log.textContent = 'Улучшено! +' + r.newLevel; } else if (r.broken) { if (log) log.textContent = 'Сломано!'; } else if (r.failed) { if (log) log.textContent = 'Неудача'; } else { if (log) log.textContent = (r.reason || 'Ошибка'); } this.updateDisplay(); var self = this; setTimeout(function() { self.forge(); }, 800); },
_craftArrow: function(count) { var r = Sherwood.Forge.craftArrowBatch(count); var log = document.getElementById('forge-log'); if (r.success) { if (log) log.textContent = 'Создано: ' + (r.crafted || 1); } else { if (log) log.textContent = (r.reason || 'Ошибка'); } this.updateDisplay(); var self = this; setTimeout(function() { self.forge(); }, 800); },
_craftRing: function() { var r = Sherwood.Forge.craftRing(); var log = document.getElementById('forge-log'); if (r.success) { if (log) log.textContent = 'Кольцо улучшено до ' + r.newLevel + '!'; } else { if (log) log.textContent = (r.reason || 'Ошибка'); } this.updateDisplay(); var self = this; setTimeout(function() { self.forge(); }, 800); },
_craftAmulet: function() { var r = Sherwood.Forge.craftAmulet(); var log = document.getElementById('forge-log'); if (r.success) { if (log) log.textContent = 'Амулет улучшен до ' + r.newLevel + '!'; } else { if (log) log.textContent = (r.reason || 'Ошибка'); } this.updateDisplay(); var self = this; setTimeout(function() { self.forge(); }, 800); },
_craftSkin: function(sid) { var r = Sherwood.Forge.craftSkin(sid); var log = document.getElementById('forge-log'); if (r.success) { if (log) log.textContent = 'Облик создан!'; } else { if (log) log.textContent = (r.reason || 'Ошибка'); } this.updateDisplay(); var self = this; setTimeout(function() { self.forge(); }, 800); },
_equipSkin: function(sid) { 
    var r = Sherwood.Forge.equipSkin(sid); 
    if (r.success) {
        var heroImg = document.querySelector('.hero-layer img'); 
        if (heroImg) heroImg.src = 'assets/hero_skins/' + sid + '.png'; 
        this.updateDisplay();
        this.forge(); 
    }
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
    
    h += '<div style="text-align:center;margin-bottom:8px;color:#aaa;">Открыто: ' + progress.discovered + '/' + progress.total + ' (' + progress.percent + '%)</div>';
    h += '<div style="background:rgba(0,0,0,0.3);border-radius:6px;height:10px;margin-bottom:8px;overflow:hidden;"><div style="background:#c9a040;height:100%;width:' + progress.percent + '%;"></div></div>';
    
    h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px;justify-content:center;">';
    for (var t = 0; t < tabs.length; t++) {
        var active = (this._bestiaryTab === t) ? '#c9a040' : 'rgba(255,255,255,0.1)';
        var color = (this._bestiaryTab === t) ? '#000' : '#fff';
        h += '<button onclick="SherwoodUI._bestiaryTab=' + t + ';SherwoodUI.bestiary();" style="background:' + active + ';border:1px solid #555;border-radius:6px;padding:4px 10px;color:' + color + ';cursor:pointer;font-size:0.7em;">' + tabs[t] + '</button>';
    }
    h += '</div>';
    
    var beasts = Sherwood.Bestiary.getBeastsByZone(tabs[this._bestiaryTab]);
    
    if (beasts.length === 0) {
        h += '<div style="color:#aaa;text-align:center;padding:40px 0;">Нет бестий в этом разделе</div>';
    } else {
        h += '<div style="display:flex;flex-direction:column;align-items:center;gap:24px;">';
        
        for (var i = 0; i < beasts.length; i++) {
            var b = beasts[i];
            var disc = b.kills > 0;
            
            h += '<div onclick="SherwoodUI._showBeastInfo(\'' + b.id + '\')" style="cursor:pointer;text-align:center;width:100%;max-width:320px;">';
            
            // КРУПНАЯ КАРТА БЕСТИИ
            h += '<div style="position:relative;width:240px;height:240px;margin:0 auto;border-radius:16px;overflow:hidden;border:2px solid ' + (disc ? '#c9a040' : '#555') + ';background:rgba(0,0,0,0.5);' + (disc ? 'box-shadow:0 0 20px rgba(201,160,64,0.4);' : '') + '">';
            
            // Картинка
            h += '<img src="assets/all_beasts/' + b.id + '" style="width:100%;height:100%;object-fit:contain;' + (disc ? '' : 'filter:grayscale(1);opacity:0.4;') + '" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            
            // Затемнение если не открыт
            if (!disc) {
                h += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;">';
                h += '<span style="color:#fff;font-size:2.5em;text-shadow:0 0 10px #000;">?</span>';
                h += '</div>';
            }
            
            // Количество убийств
            if (disc && b.kills > 0) {
                h += '<div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.8);border-radius:10px;padding:2px 8px;color:#fff;font-size:0.6em;">x' + b.kills + '</div>';
            }
            
            h += '</div>';
            
            // КРУПНОЕ НАЗВАНИЕ
            h += '<div style="color:' + (disc ? '#e0c080' : '#666') + ';font-size:1.2em;font-weight:bold;margin-top:10px;text-shadow:' + (disc ? '0 0 10px rgba(201,160,64,0.6)' : 'none') + ';">';
            h += (disc ? b.name : '???');
            h += '</div>';
            
            // Инфо
            h += '<div style="color:#aaa;font-size:0.7em;margin-top:4px;">';
            h += b.floor + ' | ' + b.type;
            h += '</div>';
            
            // Кнопка награды
            if (disc && !b.rewardClaimed) {
                h += '<button onclick="event.stopPropagation();SherwoodUI._claimBestiaryReward(\'' + b.id + '\')" style="margin-top:6px;background:#ff9800;border:none;border-radius:6px;padding:6px 16px;color:#fff;cursor:pointer;font-size:0.65em;">Забрать +' + b.reward + ' Сер.</button>';
            } else if (disc && b.rewardClaimed) {
                h += '<div style="color:#4caf50;font-size:0.65em;margin-top:6px;">✓ Награда получена</div>';
            }
            
            h += '</div>';
        }
        
        h += '</div>';
    }
    
    var bgImage = 'assets/backgrounds/character_page.jpeg';
    
    if (this._screenLayer) { 
        this._screenLayer.innerHTML = '<div style="height:100%;background:url(\'' + bgImage + '\') center/cover no-repeat;display:flex;flex-direction:column;overflow:hidden;"><div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;"><button onclick="' + gb + '" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;flex-shrink:0;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;flex-shrink:0;">Бестиарий</span></div><div style="flex:1;overflow-y:auto;overflow-x:hidden;padding:16px;-webkit-overflow-scrolling:touch;">' + h + '</div></div>'; 
        this._screenLayer.style.display = 'block'; 
    }
},

_showBeastInfo: function(beastId) { 
    var b = Sherwood.Bestiary.getBeast(beastId); 
    if (!b) return; 
    var disc = b.kills > 0;
    var h = '<div style="display:flex;gap:12px;padding:12px;">';
    h += '<div style="width:140px;flex-shrink:0;">';
    h += '<img src="assets/all_beasts/'+b.id+'" style="width:140px;height:140px;object-fit:contain;border:2px solid #c9a040;border-radius:10px;'+(disc?'':'filter:grayscale(1);opacity:0.5;')+'" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
    h += '<div style="text-align:center;color:#e0c080;font-weight:bold;margin-top:4px;">'+b.name+'</div>';
    h += '<div style="text-align:center;color:#aaa;font-size:0.7em;">'+b.floor+' | '+b.type+'</div>';
    h += '</div>';
    h += '<div style="flex:1;">';
    h += '<div style="color:#ccc;font-size:0.8em;line-height:1.4;">'+(disc?b.lore:'Убейте эту бестию чтобы открыть лор.')+'</div>';
    h += '<div style="color:#aaa;font-size:0.7em;margin-top:8px;">Убито: '+b.kills+' | Награда: '+(b.reward||50)+' Сер.</div>';
    if (disc && !b.rewardClaimed) h += '<button onclick="SherwoodUI._claimBestiaryReward(\''+b.id+'\')" style="margin-top:8px;background:#ff9800;border:none;border-radius:6px;padding:6px 16px;color:#fff;cursor:pointer;">Забрать '+(b.reward||50)+' Сер.</button>';
    if (disc && b.rewardClaimed) h += '<div style="color:#4caf50;margin-top:8px;">Награда получена</div>';
    h += '</div>';
    h += '</div>';
    this._openScreen(b.name, 'bestiary', h, 'SherwoodUI.bestiary()'); 
},

_claimBestiaryReward: function(beastId) { 
    if (!Sherwood.Bestiary) return; 
    var r = Sherwood.Bestiary.claimReward(beastId); 
    if (r.success) { this.updateDisplay(); this.bestiary(); } 
},

_bestiaryTab: 0,

};

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

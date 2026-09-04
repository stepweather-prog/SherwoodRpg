// ============================================================
//  ui_screens.js — ОБЪЕДИНЕННЫЙ ФАЙЛ (без ui_common.js)
// ============================================================

if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }
if (typeof UI === 'undefined') { var UI = {}; }

// ============================================================
//  НАСТРОЙКИ И ПЕРЕМЕННЫЕ
// ============================================================
UI._bg = {
    bag: 'assets/assets2/backgrounds/bag.png',
    profile: 'assets/assets2/backgrounds/profile_visual.png',
    bestiary: 'assets/assets2/backgrounds/bestiary_visual.png',
    quests: 'assets/assets2/backgrounds/quest.png',
    training: 'assets/assets2/backgrounds/training.png',
    forge: 'assets/assets2/backgrounds/forge.png',
    tavern: 'assets/assets2/backgrounds/section_tavern.png',
    market: 'assets/assets2/backgrounds/market.png',
    raid: 'assets/assets2/backgrounds/background_raid.png',
    settings: 'assets/assets2/backgrounds/settings_visual.png',
    portal: 'assets/assets2/backgrounds/portal.png',
    talents: 'assets/assets2/backgrounds/visual_talents.png',
    dungeon: 'assets/assets2/backgrounds/visual_dungeon.png'
};

UI._statIcons = { 
    attack: 'assets/assets2/interface/icon_power.png', 
    defense: 'assets/assets2/interface/icon_defense.png', 
    hp: 'assets/assets2/interface/icon_health.png' 
};

UI._sounds = {};
UI._currentMusic = null;
UI._currentMusicKey = null;
UI._soundEnabled = true;
UI._musicEnabled = true;
UI._screenLayer = null;
UI._pendingRewards = null;
UI._afterRewardAction = null;
UI._dungeonVideo = null;
UI._dailyTab = 1; 
UI._ticketDisplayInterval = null;
UI._bestiaryTab = 0;
UI._arenaDefeatShown = false; 
UI._arenaVictoryShown = false;
UI._currentArenaOpponents = null; 
UI._currentArenaOpponentIndex = 0;
UI._arenaCooldownInterval = null;

UI._audioFiles = {
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
    'victory': 'assets/assets2/tune/victory.wav',
    'main_theme': 'assets/assets2/tune/main_theme.ogg',
    'main_theme_2': 'assets/assets2/tune/main_theme_2.ogg',
    'main_theme_3': 'assets/assets2/tune/main_theme_3.ogg',
    'dungeon_1': 'assets/assets2/tune/dungeon_1.ogg',
    'dungeon_2': 'assets/assets2/tune/dungeon_2.ogg',
    'dungeon_3': 'assets/assets2/tune/dungeon_3.ogg'
};

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================
UI.init = function() {
    UI._screenLayer = document.createElement('div');
    UI._screenLayer.id = 'ui-screen-layer';
    UI._screenLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:40;display:none;background:transparent;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;';
    
    var gameZone = document.getElementById('gameZone');
    if (gameZone) {
        gameZone.appendChild(UI._screenLayer);
    } else {
        document.body.appendChild(UI._screenLayer);
    }
    
    try { UI._initSounds(); } catch(e) {}
    try { UI._loadAudioSettings(); } catch(e) {}
    try { UI.updateDisplay(); } catch(e) {}
    
    if (typeof Sherwood !== 'undefined') {
        try { Sherwood.on('RESOURCE_CHANGED', function() { UI.updateDisplay(); }); } catch(e) {}
        try { Sherwood.on('PLAYER_LEVEL_UP', function() { UI._playSound('levelup'); UI.updateDisplay(); }); } catch(e) {}
    }
    
    console.log('UI Common загружен!');
};

// ============================================================
//  ЗВУКИ И МУЗЫКА
// ============================================================
UI._initSounds = function() {
    for (var k in UI._audioFiles) {
        try {
            var a = new Audio(UI._audioFiles[k]);
            a.preload = 'auto';
            a.volume = 0.5;
            UI._sounds[k] = a;
        } catch(e) {}
    }
    try { UI._sounds['main_theme_2'].loop = true; UI._sounds['main_theme_2'].volume = 0.5; } catch(e) {}
    try { UI._sounds['dungeon_1'].loop = true; UI._sounds['dungeon_1'].volume = 0.4; } catch(e) {}
    try { UI._sounds['dungeon_2'].loop = true; UI._sounds['dungeon_2'].volume = 0.4; } catch(e) {}
    try { UI._sounds['dungeon_3'].loop = true; UI._sounds['dungeon_3'].volume = 0.4; } catch(e) {}
};

UI._playSound = function(k) {
    try {
        if (!UI._soundEnabled) return;
        var s = UI._sounds[k];
        if (s) { s.currentTime = 0; s.play().catch(function() {}); }
    } catch(e) {}
};

UI._playMusic = function(k) {
    try {
        if (!UI._musicEnabled) return;
        if (UI._currentMusicKey === k && UI._currentMusic && !UI._currentMusic.paused) return;
        UI._stopMusic();
        var m = UI._sounds[k];
        if (m) {
            m.volume = (k.indexOf('dungeon_') === 0) ? 0.4 : 0.5;
            m.currentTime = 0;
            m.play().catch(function() {});
            UI._currentMusic = m;
            UI._currentMusicKey = k;
            
            // Главная музыка: 3 трека по очереди
            if (k === 'main_theme') {
                m.loop = false;
                var self = UI;
                m.onended = function() { self._playMusic('main_theme_2'); };
            }
            if (k === 'main_theme_2') {
                m.loop = false;
                var self = UI;
                m.onended = function() { self._playMusic('main_theme_3'); };
            }
            if (k === 'main_theme_3') {
                m.loop = false;
                var self = UI;
                m.onended = function() { self._playMusic('main_theme'); };
            }
        }
    } catch(e) {}
};

UI._stopMusic = function() {
    try {
        if (UI._currentMusic) {
            UI._currentMusic.pause();
            UI._currentMusic.currentTime = 0;
            UI._currentMusic = null;
            UI._currentMusicKey = null;
        }
    } catch(e) {}
};

UI._pauseMusic = function() {
    try { if (UI._currentMusic) { UI._currentMusic.pause(); } } catch(e) {}
};

UI._resumeMusic = function() {
    try { if (UI._currentMusic && UI._musicEnabled) { UI._currentMusic.play().catch(function() {}); } } catch(e) {}
};

UI._saveAudioSettings = function() {
    try { localStorage.setItem('sherwood_audio', JSON.stringify({ sound: UI._soundEnabled, music: UI._musicEnabled })); } catch(e) {}
};

UI._loadAudioSettings = function() {
    try {
        var s = localStorage.getItem('sherwood_audio');
        if (s) { var d = JSON.parse(s); UI._soundEnabled = d.sound !== false; UI._musicEnabled = d.music !== false; }
    } catch(e) {}
};

UI._toggleSound = function(en) {
    UI._soundEnabled = en;
    UI._saveAudioSettings();
    if (!en) {
        for (var k in UI._sounds) {
            try { UI._sounds[k].pause(); UI._sounds[k].currentTime = 0; } catch(e) {}
        }
    }
    UI.settings();
};

UI._toggleMusic = function(en) {
    UI._musicEnabled = en;
    UI._saveAudioSettings();
    if (!en) { UI._stopMusic(); } else { UI._playMusic('main_theme'); }
    UI.settings();
};

// ============================================================
//  ОБНОВЛЕНИЕ ДИСПЛЕЯ
// ============================================================
UI.updateDisplay = function() {
    var p = Sherwood.getPlayer();
    if (!p) return;
    try { var el = document.getElementById('gold-display'); if (el) el.textContent = p.resources.gold || 0; } catch(e) {}
    try { var el = document.getElementById('silver-display'); if (el) el.textContent = p.resources.silver || 0; } catch(e) {}
    try { var el = document.getElementById('level-display'); if (el) el.textContent = p.level || 1; } catch(e) {}
    try { var expEl = document.getElementById('exp-display'), expMaxEl = document.getElementById('exp-max-display'), expFill = document.getElementById('exp-fill-bar'); var pct = p.expToLevel > 0 ? Math.round((p.exp / p.expToLevel) * 100) : 0; if (expEl) expEl.textContent = pct + '%'; if (expMaxEl) expMaxEl.textContent = p.expToLevel || 500; if (expFill) expFill.style.width = pct + '%'; } catch(e) {}
    try { var stats = document.querySelectorAll('.stat-value'); if (stats.length >= 3) { stats[0].textContent = p.stats.attack; stats[1].textContent = p.stats.defense; stats[2].textContent = p.stats.hp; } } catch(e) {}
};

// ============================================================
//  ВИДЕО-ФОН ДЛЯ ПОДЗЕМКИ
// ============================================================
UI._initDungeonVideo = function() {
    if (!UI._dungeonVideo) {
        UI._dungeonVideo = document.createElement('video');
        UI._dungeonVideo.src = 'assets/assets2/animation/Loading_dangeon.mp4';
        UI._dungeonVideo.muted = true;
        UI._dungeonVideo.playsInline = true;
        UI._dungeonVideo.loop = false;
        UI._dungeonVideo.preload = 'auto';
        UI._dungeonVideo.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;z-index:0;pointer-events:none;';
        
        UI._dungeonVideo.addEventListener('loadeddata', function() {
            try {
                UI._dungeonVideo.currentTime = 15;
                UI._dungeonVideo.pause();
            } catch(e) {}
        });
        
        UI._dungeonVideo.addEventListener('canplay', function() {
            try {
                if (UI._dungeonVideo.currentTime < 15) {
                    UI._dungeonVideo.currentTime = 15;
                    UI._dungeonVideo.pause();
                }
            } catch(e) {}
        });
    }
    return UI._dungeonVideo;
};

UI._showDungeonVideo = function() {
    UI._initDungeonVideo();
    
    var screenLayer = UI._screenLayer;
    if (!screenLayer) return;
    
    if (UI._dungeonVideo.parentNode) {
        UI._dungeonVideo.parentNode.removeChild(UI._dungeonVideo);
    }
    
    screenLayer.insertBefore(UI._dungeonVideo, screenLayer.firstChild);
    
    try {
        UI._dungeonVideo.currentTime = 15;
        UI._dungeonVideo.pause();
    } catch(e) {}
    
    console.log('✅ Видео-фон подземки установлен на 15-й секунде');
};

UI._hideDungeonVideo = function() {
    if (UI._dungeonVideo && UI._dungeonVideo.parentNode) {
        UI._dungeonVideo.parentNode.removeChild(UI._dungeonVideo);
    }
};

// ============================================================
//  ЭКРАНЫ — ЕДИНАЯ ФУНКЦИЯ (ИСПРАВЛЕННАЯ ШАПКА)
// ============================================================
UI._openScreen = function(title, bgKey, html, backFn) {
    var goBack = backFn || 'UI.loadHome()';
    try {
        if (UI._screenLayer) {
            var bgStyle = 'background:transparent;';
            if (UI._bg && UI._bg[bgKey]) {
                bgStyle = 'background-image:url(\'' + UI._bg[bgKey] + '\');background-size:cover;background-position:center;background-repeat:no-repeat;background-color:transparent;';
            }
            
            if (bgKey === null) {
                bgStyle = 'background:transparent;';
            }
            
            UI._screenLayer.innerHTML = `
                <div style="width:100%;min-height:100%;display:flex;flex-direction:column;${bgStyle}">
                    <div style="display:flex;flex-direction:row;justify-content:center;align-items:center;gap:10px;padding:10px;flex-shrink:0;position:sticky;top:0;z-index:10;background:transparent;">
                        <button onclick="${goBack}" style="background:transparent;border:none;cursor:pointer;color:#e0c080;font-size:18px;font-weight:bold;text-shadow:0 2px 4px #000;">Назад</button>
                        <span style="color:#e0c080;font-size:18px;font-weight:bold;">${title}</span>
                    </div>
                    <div style="flex:1;padding:8px 12px 20px 12px;width:100%;">
                        ${html}
                    </div>
                </div>
            `;
            UI._screenLayer.style.display = 'block';
            UI._screenLayer.style.width = '100%';
            UI._screenLayer.style.height = '100%';
            UI._screenLayer.style.position = 'absolute';
            UI._screenLayer.style.top = '0';
            UI._screenLayer.style.left = '0';
            UI._screenLayer.style.zIndex = '40';
            UI._screenLayer.style.background = 'transparent';
        }
    } catch(e) {}
};

UI._openScreenScrollable = function(title, bgKey, html, backFn) {
    var goBack = backFn || 'UI.loadHome()';
    try {
        if (UI._screenLayer) {
            var bgStyle = 'background:transparent;';
            if (UI._bg && UI._bg[bgKey]) {
                bgStyle = 'background-image:url(\'' + UI._bg[bgKey] + '\');background-size:cover;background-position:center;background-repeat:no-repeat;background-color:transparent;';
            }
            
            if (bgKey === null) {
                bgStyle = 'background:transparent;';
            }
            
            UI._screenLayer.innerHTML = `
                <div style="width:100%;min-height:100%;display:flex;flex-direction:column;${bgStyle}">
                    <div style="display:flex;flex-direction:row;justify-content:center;align-items:center;gap:10px;padding:10px;flex-shrink:0;position:sticky;top:0;z-index:10;background:transparent;">
                        <button onclick="${goBack}" style="background:transparent;border:none;cursor:pointer;color:#e0c080;font-size:18px;font-weight:bold;text-shadow:0 2px 4px #000;">Назад</button>
                        <span style="color:#e0c080;font-size:18px;font-weight:bold;">${title}</span>
                    </div>
                    <div style="flex:1;padding:8px 12px 20px 12px;width:100%;">
                        ${html}
                    </div>
                </div>
            `;
            UI._screenLayer.style.display = 'block';
            UI._screenLayer.style.width = '100%';
            UI._screenLayer.style.height = '100%';
            UI._screenLayer.style.position = 'absolute';
            UI._screenLayer.style.top = '0';
            UI._screenLayer.style.left = '0';
            UI._screenLayer.style.zIndex = '40';
            UI._screenLayer.style.background = 'transparent';
        }
    } catch(e) {}
};

UI._showPlaceholder = function(title, bgKey, backAction) {
    UI._playSound('click');
    UI._openScreen(title, bgKey, `
        <div style="text-align:center;padding:40px 0;">
            <div style="font-size:3em;margin-bottom:16px;">🚧</div>
            <div style="font-size:1.2em;color:#e0c080;margin-bottom:8px;">${title}</div>
            <div style="font-size:0.7em;color:#888;">В разработке</div>
        </div>
    `, backAction);
};

UI.loadHome = function() {
    UI._hideDungeonVideo();
    
    try {
        if (UI._screenLayer) {
            UI._screenLayer.style.display = 'none';
            UI._screenLayer.innerHTML = '';
        }
    } catch(e) {}
    
    // Возвращаем музыку главной
    UI._playMusic('main_theme');
    
    if (typeof showHomeScreen === 'function') {
        showHomeScreen();
    }
};

// ============================================================
//  ТОСТЫ И НАГРАДЫ
// ============================================================
UI._showToast = function(msg) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999;background:url(\'assets/assets2/Sherwood_Square/substrate.png\') center/cover no-repeat;color:#f44336;padding:12px 24px;border-radius:8px;border:1px solid #f44336;font-size:0.9em;font-family:"Georgia",serif;pointer-events:none;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2000);
};

UI._showVictoryScreen = function(rewards) {
    var h = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/interface/vertical_slab_victory.png\') center/100% 100% no-repeat;z-index:100;">';
    h += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">';
    
    var rewardItems = [];
    if (rewards.cupEarned) { rewardItems.push({ icon: 'assets/assets2/interface/resource_cup_for_completed_tasks.png', quantity: 1, label: 'Кубок' }); }
    if (rewards.exp) { rewardItems.push({ icon: 'assets/assets2/interface/icon_health.png', quantity: rewards.exp, label: 'Опыт' }); }
    if (rewards.gold) { rewardItems.push({ icon: 'assets/assets2/interface/resource_gold.png', quantity: rewards.gold, label: 'Золото' }); }
    if (rewards.silver) { rewardItems.push({ icon: 'assets/assets2/interface/resource_silver.png', quantity: rewards.silver, label: 'Серебро' }); }
    if (rewards.scrolls) { rewardItems.push({ icon: 'assets/assets2/interface/resource_appearance_crafting_tablet.png', quantity: rewards.scrolls, label: 'Скрижали' }); }
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
            h += '<div style="background:url(\'assets/assets2/interface/wallet_cell.png\') center/contain no-repeat;background-size:cover;width:70px;height:70px;margin:0 auto;display:flex;align-items:center;justify-content:center;">';
            h += '<img src="' + rw.icon + '" style="width:44px;height:44px;object-fit:contain;" onerror="this.src=\'assets/assets2/interface/labyrinth_of_icons.png\'">';
            h += '</div>';
            h += '<div style="color:#ddd;font-size:0.6em;margin-top:2px;text-shadow:0 0 4px #000;">' + rw.label + '</div>';
            h += '</div>';
        }
        h += '</div>';
    }
    
    h += '</div>';
    h += '<button onclick="UI._claimReward()" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:10px;padding:12px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:1.1em;z-index:2;">Забрать</button>';
    h += '</div>';
    
    if (UI._screenLayer) {
        UI._screenLayer.innerHTML = h;
        UI._screenLayer.style.display = 'block';
    }
};

UI._showDefeatScreen = function(rewards) {
    var h = '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/interface/vertical_slab_defeat.png\') center/100% 100% no-repeat;z-index:100;">';
    h += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">';
    
    var rewardItems = [];
    if (rewards.exp) { rewardItems.push({ icon: 'assets/assets2/interface/icon_health.png', quantity: rewards.exp, label: 'Опыт' }); }
    if (rewards.gold) { rewardItems.push({ icon: 'assets/assets2/interface/resource_gold.png', quantity: rewards.gold, label: 'Золото' }); }
    if (rewards.silver) { rewardItems.push({ icon: 'assets/assets2/interface/resource_silver.png', quantity: rewards.silver, label: 'Серебро' }); }
    if (rewards.scrolls) { rewardItems.push({ icon: 'assets/assets2/interface/resource_appearance_crafting_tablet.png', quantity: rewards.scrolls, label: 'Скрижали' }); }
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
            h += '<div style="background:url(\'assets/assets2/interface/wallet_cell.png\') center/contain no-repeat;background-size:cover;width:70px;height:70px;margin:0 auto;display:flex;align-items:center;justify-content:center;">';
            h += '<img src="' + rw.icon + '" style="width:44px;height:44px;object-fit:contain;" onerror="this.src=\'assets/assets2/interface/labyrinth_of_icons.png\'">';
            h += '</div>';
            h += '<div style="color:#ddd;font-size:0.6em;margin-top:2px;text-shadow:0 0 4px #000;">' + rw.label + '</div>';
            h += '</div>';
        }
        h += '</div>';
    }
    
    h += '</div>';
    h += '<button onclick="UI._claimReward()" style="position:absolute;bottom:30px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:10px;padding:12px 36px;color:#000;font-weight:bold;cursor:pointer;font-size:1.1em;z-index:2;">Забрать</button>';
    h += '</div>';
    
    if (UI._screenLayer) {
        UI._screenLayer.innerHTML = h;
        UI._screenLayer.style.display = 'block';
    }
};

UI._claimReward = function() {
    UI._pendingRewards = null;
    if (Sherwood.Dungeon && Sherwood.Dungeon.init) { Sherwood.Dungeon.init(); }
    if (UI._afterRewardAction) {
        var cb = UI._afterRewardAction;
        UI._afterRewardAction = null;
        cb();
    }
};

// ============================================================
//  ЭКРАНЫ ИГРЫ
// ============================================================

UI.profile = function() {
    UI._playSound('click');
    var p = Sherwood.getPlayer();
    var eq = Sherwood.Bag ? Sherwood.Bag.getEquipment() : {};
    var ring = eq.ring, amulet = eq.amulet;
    var trophies = p.trophies || [];
    
    var sections = [
        { name: trophies.length > 0 ? trophies.length + ' трофеев' : 'Трофеи', icon: trophies.length > 0 && trophies[0].icon ? trophies[0].icon : 'assets/all_trophies/asset_isolated_on_a_solid.png', action: 'UI._showAllTrophies()' },
        { name: ring ? ring.name : 'Кольца', icon: ring ? ring.icon || 'assets/interface/ring_first_level.png' : 'assets/interface/ring_first_level.png', action: 'UI._showAllRings()' },
        { name: amulet ? amulet.name : 'Амулеты', icon: amulet ? amulet.icon || 'assets/interface/sherwood_amulet_level_one.png' : 'assets/interface/sherwood_amulet_level_one.png', action: 'UI._showAllAmulets()' },
        { name: 'Кесет', icon: 'assets/interface/wallet.png', action: 'UI.wallet()' },
        { name: 'Сумка', icon: 'assets/assets2/icons/hero_bag.png', action: 'UI.bag()' },
        { name: 'Таланты', icon: 'assets/all_buttons/ranger_skills_button.png', action: 'Sherwood.Talents.showLearnedTalents()' }
    ];
    
    var h = '';
    
    // Статы
    h += '<div style="position:relative;width:94%;max-width:460px;height:100px;margin:0 auto 10px;">';
    h += '<div style="position:absolute;top:15px;left:0;width:100%;height:100px;background-image:url(\'assets/assets2/game_details/main_panel_stat1.png\');background-size:100% 100%;background-repeat:no-repeat;"></div>';
    h += '<img src="assets/assets2/icons/progress.png" style="position:absolute;top:0;left:8.33%;transform:translateX(-50%);width:58px;height:58px;object-fit:contain;">';
    h += '<img src="assets/assets2/icons/power.png" style="position:absolute;top:0;left:25%;transform:translateX(-50%);width:58px;height:58px;object-fit:contain;">';
    h += '<img src="assets/assets2/icons/armor.png" style="position:absolute;top:0;left:41.66%;transform:translateX(-50%);width:58px;height:58px;object-fit:contain;">';
    h += '<img src="assets/assets2/icons/life.png" style="position:absolute;top:0;left:58.33%;transform:translateX(-50%);width:58px;height:58px;object-fit:contain;">';
    h += '<img src="assets/assets2/icons/resource_gold.png" style="position:absolute;top:0;left:75%;transform:translateX(-50%);width:58px;height:58px;object-fit:contain;">';
    h += '<img src="assets/assets2/icons/resource_silver.png" style="position:absolute;top:0;left:91.66%;transform:translateX(-50%);width:58px;height:58px;object-fit:contain;">';
    h += '<span style="position:absolute;top:60px;left:8.33%;transform:translateX(-50%);color:#fff;font-size:13px;font-weight:bold;text-shadow:1px 1px 2px #000;">' + (p.expToLevel > 0 ? Math.round((p.exp / p.expToLevel) * 100) + '%' : p.exp) + '</span>';
    h += '<span style="position:absolute;top:60px;left:25%;transform:translateX(-50%);color:#fff;font-size:13px;font-weight:bold;text-shadow:1px 1px 2px #000;">' + p.stats.attack + '</span>';
    h += '<span style="position:absolute;top:60px;left:41.66%;transform:translateX(-50%);color:#fff;font-size:13px;font-weight:bold;text-shadow:1px 1px 2px #000;">' + p.stats.defense + '</span>';
    h += '<span style="position:absolute;top:60px;left:58.33%;transform:translateX(-50%);color:#fff;font-size:13px;font-weight:bold;text-shadow:1px 1px 2px #000;">' + p.stats.hp + '</span>';
    h += '<span style="position:absolute;top:60px;left:75%;transform:translateX(-50%);color:#fff;font-size:13px;font-weight:bold;text-shadow:1px 1px 2px #000;">' + (p.resources.gold || 0) + '</span>';
    h += '<span style="position:absolute;top:60px;left:91.66%;transform:translateX(-50%);color:#fff;font-size:13px;font-weight:bold;text-shadow:1px 1px 2px #000;">' + (p.resources.silver || 0) + '</span>';
    h += '</div>';
    
    // Карусель — один подраздел, всё по центру (ИСПРАВЛЕНИЕ)
    h += '<div id="profile-carousel" style="position:relative;height:400px;overflow:hidden;touch-action:pan-y;margin:0 -12px;">';
    for (var i = 0; i < sections.length; i++) {
        var section = sections[i];
        var display = (i === 0) ? 'flex' : 'none';
        
        h += '<div class="profile-slide" data-index="' + i + '" onclick="' + section.action + '" style="display:' + display + ';flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:100%;padding:20px;cursor:pointer;">';
        
        h += '<img src="' + section.icon + '" style="width:140px;height:140px;object-fit:contain;margin:0 auto 30px;display:block;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
        
        h += '<div style="background:url(\'assets/assets2/game_details/sections_menu.png\') center/100% 100% no-repeat;padding:10px 45px;color:#ffa500;font-size:1.1em;font-weight:bold;text-shadow:0 2px 4px #000;display:inline-block;line-height:1.2;margin-top:180px;margin-bottom:15px;">' + section.name + '</div>';
        h += '</div>';
    }
    h += '</div>';
    
    UI._openScreen('Профиль', 'profile', h);
    
    // Свайпы
    var self = UI;
    var carousel = document.getElementById('profile-carousel');
    if (carousel) {
        var startY = 0;
        var currentIndex = 0;
        
        carousel.addEventListener('wheel', function(e) {
            e.preventDefault();
            if (Math.abs(e.deltaY) < 20) return;
            var slides = carousel.querySelectorAll('.profile-slide');
            slides[currentIndex].style.display = 'none';
            if (e.deltaY > 0) { currentIndex = (currentIndex + 1) % slides.length; }
            else { currentIndex = (currentIndex - 1 + slides.length) % slides.length; }
            slides[currentIndex].style.display = 'flex';
        }, { passive: false });
        
        carousel.addEventListener('touchstart', function(e) { startY = e.touches[0].clientY; }, { passive: true });
        carousel.addEventListener('touchend', function(e) {
            var delta = e.changedTouches[0].clientY - startY;
            if (Math.abs(delta) < 50) return;
            var slides = carousel.querySelectorAll('.profile-slide');
            slides[currentIndex].style.display = 'none';
            if (delta < 0) { currentIndex = (currentIndex + 1) % slides.length; }
            else { currentIndex = (currentIndex - 1 + slides.length) % slides.length; }
            slides[currentIndex].style.display = 'flex';
        }, { passive: true });
    }
};

// ============================================================
//  КУЗНИЦА
// ============================================================
UI.forge = function() {
    var gb = 'UI.loadHome()';
    UI._playSound('click');
    if (!Sherwood.Forge) { UI._showPlaceholder('Кузница', 'forge', gb); return; }
    var player = Sherwood.getPlayer();
    var resources = Sherwood.Bag ? Sherwood.Bag.getResources() : {};
    var skinDrawings = resources.skinTablets || 0;
    var ringTablets = resources.ringTablets || 0;
    var amuletTablets = resources.amuletTablets || 0;
    var arrowCount = Sherwood.Forge.getArrowCount ? Sherwood.Forge.getArrowCount() : 0;
    var h = '';
    h += '<div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;flex-wrap:wrap;">';
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
    if (ring) { h += '<button onclick="UI._enhanceEquipped(\'ring\')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 20px;color:#000;font-weight:bold;cursor:pointer;font-size:0.85em;width:90%;max-width:300px;">Заточить кольцо (+' + ringLevel + ') — ' + ringCost + ' сер.</button>'; } else { h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:12px 20px;color:#888;font-size:0.85em;width:90%;max-width:300px;text-align:center;">Нет кольца</div>'; }
    if (amulet) { h += '<button onclick="UI._enhanceEquipped(\'amulet\')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 20px;color:#000;font-weight:bold;cursor:pointer;font-size:0.85em;width:90%;max-width:300px;">Заточить амулет (+' + amuletLevel + ') — ' + amuletCost + ' сер.</button>'; } else { h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:12px 20px;color:#888;font-size:0.85em;width:90%;max-width:300px;text-align:center;">Нет амулета</div>'; }
    h += '<button onclick="UI._enhanceEquipped(\'skin\')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 20px;color:#000;font-weight:bold;cursor:pointer;font-size:0.85em;width:90%;max-width:300px;">Заточить скин (+' + skinLevel + ') — ' + skinCost + ' сер.</button>';
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
    UI._openScreenScrollable('Кузница', 'forge', h, gb);
};

UI._showSkinCrafting = function() {
    var skins = Sherwood.Forge.getCraftSkins();
    var player = Sherwood.getPlayer();
    var unlocked = player.unlockedSkins || [];
    var resources = Sherwood.Bag.getResources();
    var skinDrawings = resources.skinTablets || 0;
    var h = '<div style="text-align:center;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:12px;">Создание обликов</div><div style="color:#aaa;font-size:0.7em;margin-bottom:8px;">Чертежей: ' + skinDrawings + '</div><div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
    for (var i = 0; i < skins.length; i++) {
        var skin = skins[i];
        var owned = unlocked.indexOf(skin.id) !== -1;
        h += '<div style="background:rgba(0,0,0,0.5);border:2px solid ' + (owned ? '#4caf50' : '#555') + ';border-radius:8px;padding:12px;width:90%;text-align:center;"><img src="' + skin.icon + '" style="width:64px;height:64px;object-fit:contain;border-radius:4px;" onerror="this.src=\'assets/hero_skins/skin1_01.png\'"><div style="color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:4px;">' + skin.name + '</div>';
        if (owned) { h += '<div style="color:#4caf50;font-size:0.7em;font-weight:bold;margin-top:4px;">ВЫКОВАН</div>'; } else {
            h += '<div style="color:#aaa;font-size:0.65em;margin-top:4px;">Чертежей: ' + skin.cost.drawings + ' | Скрижалей: ' + skin.cost.tablets + '</div><button onclick="UI._craftSkin(\'' + skin.id + '\')" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:6px 16px;color:#000;cursor:pointer;font-size:0.7em;font-weight:bold;">Создать</button>';
        }
        h += '</div>';
    }
    h += '</div>';
    UI._openScreenScrollable('Облики', 'forge', h, 'UI.forge()');
};

UI._showRingCrafting = function() {
    var rings = Sherwood.BlackMarket.getAvailableRings();
    var player = Sherwood.getPlayer();
    var resources = Sherwood.Bag.getResources();
    var ringTablets = resources.ringTablets || 0;
    var ownedRings = player.marketData && player.marketData.ownedJewelry ? player.marketData.ownedJewelry.rings : [];
    var h = '<div style="text-align:center;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:12px;">Ковка колец</div><div style="color:#aaa;font-size:0.7em;margin-bottom:8px;">Скрижалей: ' + ringTablets + '</div><div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
    for (var i = 0; i < rings.length; i++) {
        var ring = rings[i];
        var owned = ownedRings.indexOf(ring.id) !== -1 || Sherwood.BlackMarket.isJewelryOwned('ring', ring.id);
        h += '<div style="background:rgba(0,0,0,0.5);border:2px solid ' + (owned ? '#4caf50' : '#555') + ';border-radius:8px;padding:12px;width:90%;text-align:center;"><img src="' + ring.icon + '" style="width:64px;height:64px;object-fit:contain;border-radius:4px;"><div style="color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:4px;">' + ring.name + '</div><div style="color:#aaa;font-size:0.65em;margin-top:2px;">АТК +' + ring.stats.attack + ' | ЗЩТ +' + ring.stats.defense + '</div>';
        if (owned) { h += '<div style="color:#4caf50;font-size:0.7em;font-weight:bold;margin-top:4px;">ВЫКОВАН</div>'; } else {
            h += '<div style="color:#aaa;font-size:0.65em;margin-top:4px;">Скрижалей: 10</div><button onclick="UI._buyRingFromMarket(\'' + ring.id + '\')" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:6px 16px;color:#000;cursor:pointer;font-size:0.7em;font-weight:bold;">Создать</button>';
        }
        h += '</div>';
    }
    h += '</div>';
    UI._openScreenScrollable('Кольца', 'forge', h, 'UI.forge()');
};

UI._showAmuletCrafting = function() {
    var amulets = Sherwood.BlackMarket.getAvailableAmulets();
    var player = Sherwood.getPlayer();
    var resources = Sherwood.Bag.getResources();
    var amuletTablets = resources.amuletTablets || 0;
    var ownedAmulets = player.marketData && player.marketData.ownedJewelry ? player.marketData.ownedJewelry.amulets : [];
    var h = '<div style="text-align:center;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:12px;">Ковка амулетов</div><div style="color:#aaa;font-size:0.7em;margin-bottom:8px;">Скрижалей: ' + amuletTablets + '</div><div style="display:flex;flex-direction:column;align-items:center;gap:8px;">';
    for (var i = 0; i < amulets.length; i++) {
        var amulet = amulets[i];
        var owned = ownedAmulets.indexOf(amulet.id) !== -1 || Sherwood.BlackMarket.isJewelryOwned('amulet', amulet.id);
        h += '<div style="background:rgba(0,0,0,0.5);border:2px solid ' + (owned ? '#4caf50' : '#555') + ';border-radius:8px;padding:12px;width:90%;text-align:center;"><img src="' + amulet.icon + '" style="width:64px;height:64px;object-fit:contain;border-radius:4px;"><div style="color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:4px;">' + amulet.name + '</div><div style="color:#aaa;font-size:0.65em;margin-top:2px;">HP +' + amulet.stats.hp + ' | ЗЩТ +' + amulet.stats.defense + '</div>';
        if (owned) { h += '<div style="color:#4caf50;font-size:0.7em;font-weight:bold;margin-top:4px;">ВЫКОВАН</div>'; } else {
            h += '<div style="color:#aaa;font-size:0.65em;margin-top:4px;">Скрижалей: 10</div><button onclick="UI._buyAmuletFromMarket(\'' + amulet.id + '\')" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:6px 16px;color:#000;cursor:pointer;font-size:0.7em;font-weight:bold;">Создать</button>';
        }
        h += '</div>';
    }
    h += '</div>';
    UI._openScreenScrollable('Амулеты', 'forge', h, 'UI.forge()');
};

UI._craftArrowFromForge = function() {
    var arrowInfo = Sherwood.Forge.getArrowCraftInfo();
    var info = document.getElementById('forge-info');
    if (arrowInfo.canCraft > 0) {
        var r = Sherwood.Forge.craftArrowBatch(1);
        if (r.success) { if (info) info.textContent = 'Создано стрел: ' + (r.crafted || 1); } else { if (info) info.textContent = r.reason || 'Ошибка'; }
    } else { if (info) info.textContent = 'Не хватает: 1 Ветка + 1 Перо + 1 Кость'; }
    var self = UI;
    setTimeout(function() { self.forge(); }, 800);
};

UI._buyRingFromMarket = function(ringId) {
    var r = Sherwood.BlackMarket.buyJewelry('ring', ringId);
    if (r.success) { UI._showToast('Кольцо выковано!'); } else { UI._showToast(r.reason || 'Ошибка'); }
    var self = UI;
    setTimeout(function() { self._showRingCrafting(); }, 800);
};

UI._buyAmuletFromMarket = function(amuletId) {
    var r = Sherwood.BlackMarket.buyJewelry('amulet', amuletId);
    if (r.success) { UI._showToast('Амулет выкован!'); } else { UI._showToast(r.reason || 'Ошибка'); }
    var self = UI;
    setTimeout(function() { self._showAmuletCrafting(); }, 800);
};

UI._craftSkin = function(skinId) {
    var r = Sherwood.Forge.craftSkin(skinId);
    if (r.success) { UI._showToast('Облик выкован!'); } else { UI._showToast(r.reason || 'Ошибка'); }
    var self = UI;
    setTimeout(function() { self._showSkinCrafting(); }, 800);
};

UI._enhanceItem = function(idx) {
    var r = Sherwood.Forge.enhanceItem(idx);
    var log = document.getElementById('forge-log');
    if (r.enhanced) { if (log) log.textContent = 'Улучшено! +' + r.newLevel; }
    else if (r.broken) { if (log) log.textContent = 'Сломано!'; }
    else if (r.failed) { if (log) log.textContent = 'Неудача'; }
    else { if (log) log.textContent = (r.reason || 'Ошибка'); }
    UI.updateDisplay();
    var self = UI;
    setTimeout(function() { self.forge(); }, 800);
};

UI._enhanceEquipped = function(type) {
    var r = Sherwood.Forge.enhanceEquipped(type);
    if (r.success) { UI._playSound('forge'); UI._showToast('Улучшено!'); UI.updateDisplay(); UI.forge(); } else { UI._showToast(r.reason || 'Ошибка'); }
};

// ============================================================
//  ТРЕНИРОВКА
// ============================================================
UI.training = function() {
    var gb = 'UI.tavern()';
    UI._playSound('click');
    var p = Sherwood.getPlayer();
    if (!p.trainingLevels) p.trainingLevels = { attack: 0, defense: 0, hp: 0 };
    if (!p.experiencePoints) p.experiencePoints = 0;
    var tl = p.trainingLevels;
    var stats = ['attack', 'defense', 'hp'];
    var names = { attack: 'Атака', defense: 'Защита', hp: 'Здоровье' };
    var colors = { attack: '#f44336', defense: '#2196f3', hp: '#4caf50' };
    var bonuses = { attack: 3, defense: 3, hp: 3 };
    var icons = {
        attack: 'assets/assets2/icons/power.png',
        defense: 'assets/assets2/icons/armor.png',
        hp: 'assets/assets2/icons/life.png'
    };
    var h = '<div style="padding:10px;display:flex;flex-direction:column;gap:15px;">';
    for (var i = 0; i < stats.length; i++) {
        var s = stats[i];
        var lvl = tl[s] || 0;
        var nextLevel = lvl + 1;
        var cost = 1;
        var currencyIcon = 'assets/assets2/game_details/tablet_of_experience.png';
        h += '<div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:15px;">';
        h += '<img src="' + icons[s] + '" style="width:70px;height:70px;object-fit:contain;margin-bottom:8px;">';
        h += '<div style="color:#e0c080;font-size:1em;font-weight:bold;">' + names[s] + '</div>';
        h += '<div style="color:#aaa;font-size:0.8em;">Уровень: ' + lvl + '/1000</div>';
        h += '<div style="color:' + colors[s] + ';font-size:0.7em;">+' + bonuses[s] + ' за уровень</div>';
        h += '<div style="color:#e0c080;font-size:0.75em;margin-bottom:6px;">Стоимость: <img src="' + currencyIcon + '" style="width:16px;height:16px;vertical-align:middle;"> ' + cost + ' очков опыта</div>';
        if (lvl >= 1000) {
            h += '<div style="color:#4caf50;font-weight:bold;">МАКСИМУМ</div>';
        } else {
            h += '<button onclick="UI._doTraining(\'' + s + '\')" style="background:#c9a040;border:none;border-radius:6px;padding:10px 24px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">Тренировать</button>';
        }
        h += '</div>';
    }
    h += '<div id="training-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:8px;"></div></div>';
    UI._openScreenScrollable('Тренировка', 'training', h, gb);
};

UI._doTraining = function(stat) {
    var p = Sherwood.getPlayer();
    if (!p) return;
    if (!p.trainingLevels) p.trainingLevels = { attack: 0, defense: 0, hp: 0 };
    if (!p.experiencePoints) p.experiencePoints = 0;
    var cur = p.trainingLevels[stat] || 0;
    if (cur >= 1000) { var log = document.getElementById('training-log'); if (log) log.textContent = 'Макс. уровень!'; return; }
    
    var cost = 1;
    if (p.experiencePoints < cost) {
        var log = document.getElementById('training-log');
        if (log) log.textContent = 'Нужно ' + cost + ' очков опыта!';
        return;
    }
    
    p.experiencePoints -= cost;
    p.trainingLevels[stat] = cur + 1;
    if (Sherwood.Daily) Sherwood.Daily.updateProgress('stat_' + stat, p.stats[stat]);
    if (Sherwood._recalcStats) Sherwood._recalcStats();
    if (Sherwood.saveGame) Sherwood.saveGame();
    UI.updateDisplay();
    UI.training();
    var log = document.getElementById('training-log');
    if (log) log.textContent = stat + ' → ' + (cur + 1) + ' (-' + cost + ' очков опыта)';
};

// ============================================================
//  БЕСТИАРИЙ
// ============================================================
UI.bestiary = function() {
    var gb = 'UI.loadHome()';
    UI._playSound('click');
    if (!Sherwood.Bestiary) { UI._showPlaceholder('Бестиарий', 'bestiary', gb); return; }
    var progress = Sherwood.Bestiary.getDiscoveryProgress();
    var tabs = ['Проклятая чаща', 'Первородное болото', 'Базальтовый грот', 'Квест', 'Портал'];
    if (!UI._bestiaryTab) UI._bestiaryTab = 0;
    var h = '<div style="text-align:center;margin-bottom:8px;color:#aaa;">Открыто: '+progress.discovered+'/'+progress.total+' ('+progress.percent+'%)</div>';
    h += '<div style="background:rgba(0,0,0,0.3);border-radius:6px;height:10px;margin-bottom:8px;overflow:hidden;"><div style="background:#c9a040;height:100%;width:'+progress.percent+'%;"></div></div>';
    h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;">';
    for (var t=0; t<tabs.length; t++) {
        var active = (UI._bestiaryTab === t) ? '#c9a040' : 'rgba(255,255,255,0.1)';
        var color = (UI._bestiaryTab === t) ? '#000' : '#fff';
        h += '<button onclick="UI._bestiaryTab='+t+';UI.bestiary();" style="background:'+active+';border:1px solid #555;border-radius:6px;padding:4px 10px;color:'+color+';cursor:pointer;font-size:0.7em;">'+tabs[t]+'</button>';
    }
    h += '</div>';
    var beasts = Sherwood.Bestiary.getBeastsByZone(tabs[UI._bestiaryTab]);
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
    UI._openScreen('Бестиарий', 'bestiary', h, gb);
};

UI._showBeastInfo = function(beastId) {
    var b = Sherwood.Bestiary.getBeast(beastId);
    if (!b) return;
    var disc = b.kills > 0;
    var beastImgPath = 'assets/all_beasts/' + beastId;
    if (b.zone === 'Квест') beastImgPath = 'assets/beast_quest/' + beastId;
    if (b.zone === 'Портал') beastImgPath = 'assets/portal_beasts/' + beastId;
    var h = '<div style="display:flex;gap:12px;padding:12px;"><div style="width:40%;flex-shrink:0;"><img src="' + beastImgPath + '" style="width:100%;height:auto;object-fit:contain;border:2px solid #c9a040;border-radius:10px;'+(disc?'':'filter:grayscale(1);opacity:0.5;')+'" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'"><div style="text-align:center;color:#e0c080;font-weight:bold;margin-top:4px;">'+b.name+'</div><div style="text-align:center;color:#aaa;font-size:0.7em;">'+b.floor+' | '+b.type+'</div></div><div style="flex:1;"><div style="color:#ccc;font-size:0.8em;line-height:1.4;">'+(disc?b.lore:'Убейте эту бестию чтобы открыть лор.')+'</div><div style="color:#aaa;font-size:0.7em;margin-top:8px;">Убито: '+b.kills+' | Награда: '+(b.reward||50)+' Сер.</div>';
    if (disc && !b.rewardClaimed) h += '<button onclick="UI._claimBestiaryReward(\''+beastId+'\')" style="margin-top:8px;background:#ff9800;border:none;border-radius:6px;padding:6px 16px;color:#fff;cursor:pointer;">Забрать '+(b.reward||50)+' Сер.</button>';
    if (disc && b.rewardClaimed) h += '<div style="color:#4caf50;margin-top:8px;">Награда получена</div>';
    h += '</div></div>';
    UI._openScreen(b.name, 'bestiary', h, 'UI.bestiary()');
};

UI._claimBestiaryReward = function(beastId) {
    if (!Sherwood.Bestiary) return;
    var r = Sherwood.Bestiary.claimReward(beastId);
    if (r.success) { UI.updateDisplay(); UI.bestiary(); }
};

// ============================================================
//  ВАЛЛЕТ (КЕСЕТ)
// ============================================================
UI.wallet = function() {
    UI._playSound('click');
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
    UI._openScreen('Кесет', 'profile', h, 'UI.profile()');
};

UI._withdrawWallet = function() {
    var p = Sherwood.getPlayer();
    if (!p.keset) return;
    var totalFilled = 0;
    for (var i = 0; i < p.keset.cells.length; i++) totalFilled += p.keset.cells[i];
    if (totalFilled < 100000) { UI._showToast('Минимум 100,000 серебра для снятия'); return; }
    Sherwood.addResource('silver', totalFilled);
    for (var i = 0; i < p.keset.cells.length; i++) p.keset.cells[i] = 0;
    p.keset.totalSilver = 0;
    Sherwood.saveGame();
    UI.updateDisplay();
    UI.wallet();
};

UI._addWalletSilver = function(amount) {
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
};

// ============================================================
//  НАСТРОЙКИ
// ============================================================
UI.settings = function() {
    UI._playSound('click');
    var p = Sherwood.getPlayer();
    var nm = p ? p.name : 'Охотник';
    var nameChanges = p ? (p.nameChanges || 0) : 0;
    var h = '';
    h += '<div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;"><div style="color:#fff;margin-bottom:8px;">Имя</div><div style="display:flex;gap:8px;"><input id="pni" value="' + nm + '" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:8px 12px;color:#fff;"><button onclick="UI._changePlayerName()" style="background:#c9a040;border:none;border-radius:6px;padding:8px 16px;color:#000;font-weight:bold;cursor:pointer;">Сохранить</button></div>';
    if (nameChanges === 0) { h += '<div style="color:#4caf50;font-size:0.7em;margin-top:4px;">Первая смена имени — бесплатно</div>'; } else { h += '<div style="color:#ffd700;font-size:0.7em;margin-top:4px;">Смена имени: 500 золота</div>'; }
    h += '<div id="name-status" style="color:#aaa;font-size:0.7em;margin-top:4px;"></div></div>';
    h += '<div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="color:#fff;">Звуки</span><button onclick="UI._toggleSound(' + !UI._soundEnabled + ')" style="width:60px;height:30px;background:' + (UI._soundEnabled ? '#4caf50' : '#555') + ';border:none;border-radius:15px;cursor:pointer;position:relative;"><span style="position:absolute;top:3px;' + (UI._soundEnabled ? 'right:3px;' : 'left:3px;') + 'width:24px;height:24px;background:#fff;border-radius:50%;transition:0.2s;"></span></button></div><div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#fff;">Музыка</span><button onclick="UI._toggleMusic(' + !UI._musicEnabled + ')" style="width:60px;height:30px;background:' + (UI._musicEnabled ? '#4caf50' : '#555') + ';border:none;border-radius:15px;cursor:pointer;position:relative;"><span style="position:absolute;top:3px;' + (UI._musicEnabled ? 'right:3px;' : 'left:3px;') + 'width:24px;height:24px;background:#fff;border-radius:50%;transition:0.2s;"></span></button></div></div>';
    h += '<button onclick="UI._saveProgress()" style="width:100%;background:#4caf50;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;margin-bottom:8px;">Сохранить прогресс</button>';
    h += '<button onclick="UI._resetCharacter()" style="width:100%;background:#ff9800;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;margin-bottom:8px;">Сбросить персонажа (5000 золота)</button>';
    h += '<button onclick="UI._exitGame()" style="width:100%;background:#f44336;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;">Выйти</button>';
    UI._openScreen('Настройки', 'settings', h);
};

UI._changePlayerName = function() {
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
    UI.updateDisplay();
    UI.settings();
};

UI._saveProgress = function() {
    if (Sherwood.saveGameNow) { Sherwood.saveGameNow(); UI._showToast('Прогресс сохранён!'); }
    else if (Sherwood.saveGame) { Sherwood.saveGame(); UI._showToast('Прогресс сохранён!'); }
};

UI._resetCharacter = function() {
    var p = Sherwood.getPlayer();
    if (!p) return;
    if ((p.resources.gold || 0) < 5000) { UI._showToast('Нужно 5000 золота для сброса'); return; }
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
    UI._showToast('Персонаж сброшен!');
    UI.loadHome();
};

UI._exitGame = function() {
    if (confirm('Выйти в главное меню?')) {
        if (Sherwood.saveGameNow) Sherwood.saveGameNow();
        else if (Sherwood.saveGame) Sherwood.saveGame();
        
        UI._stopMusic();
        
        if (typeof playExitVideo === 'function') {
            playExitVideo(function() {
                location.reload();
            });
        } else {
            location.reload();
        }
    }
};

// ============================================================
//  СУМКА
// ============================================================
UI.bag = function() {
    UI._playSound('click');
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
    UI._openScreenScrollable('Сумка', 'bag', h);
};

UI._bagDragStart = function(e, index) { e.dataTransfer.setData('text/plain', index); e.dataTransfer.effectAllowed = 'move'; };
UI._bagDragOver = function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
UI._bagDrop = function(e, targetIndex) {
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
    UI.bag();
};

UI._expandBag = function() {
    var r = Sherwood.Bag.expandBag();
    var info = document.getElementById('bag-info');
    if (r.success) { if (info) info.textContent = 'Сумка расширена до ' + r.newSlots + ' ячеек!'; UI.updateDisplay(); } else { if (info) info.textContent = (r.reason || 'Ошибка'); }
    var self = UI;
    setTimeout(function() { self.bag(); }, 800);
};

UI._bagAction = function(i) {
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
};

// ============================================================
//  ДОПОЛНИТЕЛЬНЫЕ ЭКРАНЫ
// ============================================================
UI.quests = function() {
    UI._playSound('click');
    if (typeof Sherwood.Quests !== 'undefined' && Sherwood.Quests.showUI) {
        Sherwood.Quests.showUI();
    } else {
        UI._showPlaceholder('Квесты', 'quests');
    }
};

UI.tavern = function() {
    UI._playSound('click');
    if (typeof Sherwood !== 'undefined' && Sherwood.Tavern && Sherwood.Tavern.showUI) {
        Sherwood.Tavern.showUI();
    } else {
        UI._showPlaceholder('Таверна', 'tavern');
    }
};

UI.portals = function() {
    UI._playSound('click');
    if (typeof Sherwood.Portal !== 'undefined' && Sherwood.Portal.showUI) {
        Sherwood.Portal.showUI();
    } else {
        UI._showPlaceholder('Порталы', 'portal');
    }
};

UI.raid = function() {
    UI._playSound('click');
    
    if (typeof Sherwood.Raid === 'undefined' || !Sherwood.Raid.showUI) {
        UI._showPlaceholder('Рейд', 'raid');
        return;
    }
    
    if (Sherwood.Raid.isRaidActive && Sherwood.Raid.isRaidActive()) {
        Sherwood.Raid.showUI();
        return;
    }
    
    var video = document.createElement('video');
    video.src = 'assets/assets2/animation/raid_entrance.webm';
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', 'true');
    
    if (UI._screenLayer) {
        UI._screenLayer.innerHTML = '';
        UI._screenLayer.appendChild(video);
        UI._screenLayer.style.display = 'block';
    }
    
    var videoStyles = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);object-fit:fill;z-index:100;';
    
    if (window.innerWidth < 480) {
        video.style.cssText = videoStyles + 'width:100vw;height:100vh;';
    } else if (window.innerWidth >= 480 && window.innerHeight <= 800) {
        video.style.cssText = videoStyles + 'width:480px;height:100vh;';
    } else {
        video.style.cssText = videoStyles + 'width:480px;height:800px;';
    }
    
    try {
        video.play().catch(function() {
            var onTouch = function() {
                video.play();
                document.removeEventListener('touchstart', onTouch);
            };
            document.addEventListener('touchstart', onTouch);
        });
    } catch(e) {}
    
    video.onended = function() {
        UI._screenLayer.innerHTML = '';
        Sherwood.Raid.showUI();
    };
    
    video.onerror = function() {
        UI._screenLayer.innerHTML = '';
        Sherwood.Raid.showUI();
    };
    
    setTimeout(function() {
        if (UI._screenLayer && UI._screenLayer.contains(video)) {
            UI._screenLayer.innerHTML = '';
            Sherwood.Raid.showUI();
        }
    }, 5000);
};

UI.dungeon = function() {
    UI._playSound('click');
    
    var h = '<div style="text-align:center;padding:20px;background:url(\'assets/assets2/backgrounds/visual_dungeon.png\') center/cover no-repeat;width:100%;height:100%;">';
    h += '<div style="color:#e0c080;font-size:22px;font-weight:bold;margin-bottom:20px;">🏚️ Подземка</div>';
    h += '<div style="display:flex;flex-direction:column;align-items:center;gap:15px;">';
    h += '<img src="assets/dungeon_tiles/visual_dungeon/the_cursed_thicket.png" style="width:100px;height:100px;object-fit:contain;">';
    h += '<button onclick="UI.loadIframeDungeon()" style="padding:10px 30px;background:#c9a040;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;">⚔️ Войти в подземку</button>';
    h += '</div>';
    h += '</div>';
    
    UI._openScreenScrollable('🏚️ Подземка', null, h, 'UI.loadHome()');
};

UI.loadIframeDungeon = function() {
    UI._playSound('click');
    UI._stopMusic();
    var iframe = document.createElement('iframe');
    iframe.src = 'dungeon.html';
    iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;z-index:100;';
    if (UI._screenLayer) {
        UI._screenLayer.innerHTML = '';
        UI._screenLayer.appendChild(iframe);
        UI._screenLayer.style.display = 'block';
    }
};

UI.market = function() {
    UI._playSound('click');
    if (typeof Sherwood.BlackMarket !== 'undefined' && Sherwood.BlackMarket.showUI) {
        Sherwood.BlackMarket.showUI();
    } else {
        UI._showPlaceholder('Рынок', 'market');
    }
};

UI.showUI = function() {
    UI.loadHome();
};

// ============================================================
//  ЭКСПОРТ
// ============================================================
window.UI = UI;
window.Sherwood = window.Sherwood || {};
window.Sherwood.UI = UI;

console.log('UI экраны полностью загружены!');

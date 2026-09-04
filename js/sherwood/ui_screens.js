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
    
    // Карусель — один подраздел, всё по центру
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

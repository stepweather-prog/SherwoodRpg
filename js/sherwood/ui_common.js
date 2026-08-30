// ============================================================
//  ui_common.js — ОБЩИЕ ФУНКЦИИ UI
//  Звуки, экраны, тосты, победа/поражение
// ============================================================

if (typeof UI === 'undefined') { var UI = {}; }

UI._bg = {
    main: 'assets/assets2/backgrounds/homepage_screen.jpeg', 
    bag: 'assets/assets2/backgrounds/bag.jpeg', 
    profile: 'assets/assets2/backgrounds/character_page.jpeg',
    bestiary: 'assets/assets2/backgrounds/character_page.jpeg', 
    quests: 'assets/assets2/backgrounds/skill_page.jpeg', 
    training: 'assets/assets2/backgrounds/training.jpeg',
    forge: 'assets/assets2/backgrounds/forge.jpeg', 
    tavern: 'assets/assets2/backgrounds/section_tavern.png', 
    market: 'assets/assets2/backgrounds/market.jpeg',
    arena: 'assets/assets2/backgrounds/arena.jpeg', 
    raid: 'assets/assets2/backgrounds/background_raid.png', 
    settings: 'assets/assets2/backgrounds/settings_page.jpeg',
    daily: 'assets/assets2/backgrounds/tasks.jpeg', 
    portal: 'assets/assets2/backgrounds/portal_1.jpeg', 
    chat: 'assets/assets2/backgrounds/chat_background.png',
    dungeon_select: 'assets/assets2/backgrounds/underground_1_floor_1.jpg', 
    dungeon_forest: 'assets/assets2/backgrounds/underground_1_floor_1.jpg',
    dungeon_swamp: 'assets/assets2/backgrounds/underground_2_floor_1.jpeg', 
    dungeon_cave: 'assets/assets2/backgrounds/underground_3_floor_1.jpeg',
    dungeon_fight: 'assets/assets2/backgrounds/underground_1_floor_1.jpg', 
    portal_3: 'assets/assets2/backgrounds/portal_3.png',
    hearth: 'assets/assets2/backgrounds/background_hearth.jpeg', 
    wallet: 'assets/assets2/interface/wallet_visual.png'
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

UI._audioFiles = {
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
};

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================

UI.init = function() {
    UI._screenLayer = document.createElement('div');
    UI._screenLayer.id = 'ui-screen-layer';
    UI._screenLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:40;display:none;background:rgba(0,0,0,0.9);overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;';
    
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
    
    console.log('🔊 UI Common загружен!');
};

// ============================================================
//  ЗВУКИ
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
            if (k === 'main_theme') {
                m.loop = false;
                var self = UI;
                m.onended = function() { self._playMusic('main_theme_2'); };
            }
            if (k === 'main_theme_2') {
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
//  ЭКРАНЫ
// ============================================================

UI._openScreen = function(title, bgKey, html, backFn) {
    var goBack = backFn || 'UI.loadHome()';
    try {
        if (UI._screenLayer) {
            var bgStyle = '';
            if (UI._bg && UI._bg[bgKey]) {
                bgStyle = 'background-image:url(\'' + UI._bg[bgKey] + '\');background-size:cover;background-position:center;background-repeat:no-repeat;';
            }
            UI._screenLayer.innerHTML = `
                <div style="width:100%;min-height:100%;padding:16px;display:flex;flex-direction:column;overflow-y:auto;${bgStyle}">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-shrink:0;">
                        <button onclick="${goBack}" style="background:transparent;border:none;cursor:pointer;padding:0;width:40px;height:40px;">
                            <img src="assets/assets2/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;">
                        </button>
                        <span style="color:#e0c080;font-size:1.1em;">${title}</span>
                    </div>
                    <div style="flex:1;overflow-y:auto;">${html}</div>
                </div>
            `;
            UI._screenLayer.style.display = 'block';
            UI._screenLayer.style.width = '100%';
            UI._screenLayer.style.height = '100%';
            UI._screenLayer.style.position = 'absolute';
            UI._screenLayer.style.top = '0';
            UI._screenLayer.style.left = '0';
            UI._screenLayer.style.zIndex = '40';
        }
    } catch(e) {}
};

UI._openScreenScrollable = function(title, bgKey, html, backFn) {
    var goBack = backFn || 'UI.loadHome()';
    try {
        if (UI._screenLayer) {
            var bgStyle = '';
            if (UI._bg && UI._bg[bgKey]) {
                bgStyle = 'background-image:url(\'' + UI._bg[bgKey] + '\');background-size:cover;background-position:center;background-repeat:no-repeat;';
            }
            UI._screenLayer.innerHTML = `
                <div style="width:100%;min-height:100%;display:flex;flex-direction:column;${bgStyle}">
                    <div style="display:flex;align-items:center;gap:12px;padding:12px;flex-shrink:0;position:sticky;top:0;background:rgba(0,0,0,0.8);z-index:10;">
                        <button onclick="${goBack}" style="background:transparent;border:none;cursor:pointer;padding:0;width:40px;height:40px;">
                            <img src="assets/assets2/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;">
                        </button>
                        <span style="color:#e0c080;font-size:1.1em;">${title}</span>
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
    try {
        if (UI._screenLayer) {
            UI._screenLayer.style.display = 'none';
            UI._screenLayer.innerHTML = '';
        }
    } catch(e) {}
    try { UI.updateDisplay(); } catch(e) {}
    if (typeof showHomeScreen === 'function') {
        showHomeScreen();
    }
};

// ============================================================
//  ТОСТЫ
// ============================================================

UI._showToast = function(msg) {
    var toast = document.createElement('div');
    toast.style.cssText = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:999;background:#000;color:#f44336;padding:12px 24px;border-radius:8px;border:1px solid #f44336;font-size:0.9em;font-family:"Georgia",serif;pointer-events:none;';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2000);
};

// ============================================================
//  ПОБЕДА / ПОРАЖЕНИЕ
// ============================================================

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
//  ЭКСПОРТ
// ============================================================

window.UI = UI;
window.Sherwood = window.Sherwood || {};
window.Sherwood.UI = UI;

console.log('🔊 UI Common загружен!');

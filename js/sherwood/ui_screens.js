// ============================================================
//  ui_screens.js точный
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
    dungeon: 'assets/assets2/backgrounds/visual_dungeon.png',
    thicket: 'assets/assets2/backgrounds/sherwood_thicket.png'
};

UI._statIcons = { 
    attack: 'assets/interface/icon_power.png', 
    defense: 'assets/interface/icon_defense.png', 
    hp: 'assets/interface/icon_health.png' 
};

UI._sounds = {};
UI._currentMusic = null;
UI._currentMusicKey = null;
//UI._soundEnabled = true;
//UI._musicEnabled = true;
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
UI._cameFromCamp = false;
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
    'victory': 'assets/assets2/tune/victory.wav'
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
    try { if (typeof Settings !== 'undefined' && Settings._applyVolumes) Settings._applyVolumes(); } catch(e) {}
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
    try { UI._sounds['main_theme_2'].loop = true; UI._sounds['assets/assets2/music/city_theme1.ogg',
        'assets/assets2/music/main_theme_6.ogg',
        'assets/assets2/music/main_theme_5.ogg',
        'assets/assets2/music/main_theme_4.ogg',
        'assets/assets2/music/main_theme_3.ogg',
        'assets/assets2/music/main_theme_2.ogg',
        'assets/assets2/music/main_theme.ogg',
        'assets/assets2/music/dungeon_1.ogg',
        'assets/assets2/music/dungeon_2.ogg',
        'assets/assets2/music/dungeon_3.ogg'].volume = 0.3; } catch(e) {}
    try { UI._sounds['dungeon_1'].loop = true; UI._sounds['dungeon_1'].volume = 0.4; } catch(e) {}
    try { UI._sounds['dungeon_2'].loop = true; UI._sounds['dungeon_2'].volume = 0.4; } catch(e) {}
    try { UI._sounds['dungeon_3'].loop = true; UI._sounds['dungeon_3'].volume = 0.4; } catch(e) {}
};
// ============================================================
//  ЗВУКИ (теперь через AudioManager)
// ============================================================
UI._playSound = function(key) {
    try {
        if (window.AudioManager && AudioManager.playSoundEffect) {
            AudioManager.playSoundEffect(key);
        }
    } catch(e) {}
};
// ============================================================
//  ОБЕРТКИ ДЛЯ СОВМЕСТИМОСТИ (теперь всё через AudioManager)
// ============================================================
UI._playMusic = function(k) {
    try {
        if (typeof AudioManager !== 'undefined') {
            // Превращаем ключ 'main_theme' в вызов AudioManager
            if (k === 'main_theme' || k.indexOf('main_theme') !== -1 || k === 'city_theme1') {
                AudioManager.playCityTheme();
            } else if (k.indexOf('dungeon_') === 0) {
                // В подземке мы пока оставим старую логику, если она важна
                // (или можно сделать свой метод для подземки)
                AudioManager.playSoundEffect('click'); 
            }
        }
    } catch(e) {}
};

UI._stopMusic = function() {
    try {
        if (typeof AudioManager !== 'undefined') AudioManager.stopCityTheme();
        if (window.audioPlayer) { window.audioPlayer.pause(); window.audioPlayer.currentTime = 0; }
    } catch(e) {}
};

UI._pauseMusic = function() {
    try {
        if (typeof AudioManager !== 'undefined' && AudioManager.currentMusic) AudioManager.currentMusic.pause();
        if (window.audioPlayer) window.audioPlayer.pause();
    } catch(e) {}
};

UI._resumeMusic = function() {
    try {
        if (typeof AudioManager !== 'undefined' && AudioManager.currentMusic) AudioManager.currentMusic.play().catch(function(){});
        if (window.audioPlayer) window.audioPlayer.play().catch(function(){});
    } catch(e) {}
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
//  ЭКРАНЫ — ТОЛЬКО ВСТАВКА HTML (БЕЗ ШАПОК И СТРЕЛОК)
// ============================================================
UI._openScreen = function(title, bgKey, html, backFn) {
    try {
        if (UI._screenLayer) {
            var bgStyle = 'background:transparent;';
            if (UI._bg && UI._bg[bgKey]) {
                bgStyle = 'background-image:url(\'' + UI._bg[bgKey] + '\');background-size:cover;background-position:center;background-repeat:no-repeat;background-color:transparent;';
            }
            if (bgKey === null) {
                bgStyle = 'background:transparent;';
            }

            // Проверяем, есть ли уже своя кнопка "Назад" в HTML
            var hasCustomBack = html.indexOf('UI.loadHome()') !== -1 || html.indexOf('← Назад') !== -1 || html.indexOf('←') !== -1;
            
            // Если нет — добавляем свою
            var backBtn = '';
            if (!hasCustomBack) {
                backBtn = '<button onclick="' + (backFn || 'UI.loadHome()') + '" style="position:absolute;top:15px;left:15px;z-index:9999;background:rgba(0,0,0,0.8);border:2px solid #c8a050;border-radius:8px;padding:8px 16px;color:#c8a050;font-size:18px;font-weight:bold;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.5);">← Назад</button>';
            }

            UI._screenLayer.innerHTML = `
                <div style="width:100%;min-height:100%;display:flex;flex-direction:column;${bgStyle}">
                    <div style="flex:1;padding:8px 12px 20px 12px;width:100%;position:relative;">
                        ${backBtn}
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
    try {
        if (UI._screenLayer) {
            var bgStyle = 'background:transparent;';
            if (UI._bg && UI._bg[bgKey]) {
                bgStyle = 'background-image:url(\'' + UI._bg[bgKey] + '\');background-size:cover;background-position:center;background-repeat:no-repeat;background-color:transparent;';
            }
            if (bgKey === null) {
                bgStyle = 'background:transparent;';
            }

            // Проверяем, есть ли уже своя кнопка "Назад" в HTML
            var hasCustomBack = html.indexOf('UI.loadHome()') !== -1 || html.indexOf('← Назад') !== -1 || html.indexOf('←') !== -1;
            
            // Если нет — добавляем свою
            var backBtn = '';
            if (!hasCustomBack) {
                backBtn = '<button onclick="' + (backFn || 'UI.loadHome()') + '" style="position:absolute;top:15px;left:15px;z-index:9999;background:rgba(0,0,0,0.8);border:2px solid #c8a050;border-radius:8px;padding:8px 16px;color:#c8a050;font-size:18px;font-weight:bold;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.5);">← Назад</button>';
            }

            UI._screenLayer.innerHTML = `
                <div style="width:100%;min-height:100%;display:flex;flex-direction:column;${bgStyle}">
                    <div style="flex:1;padding:8px 12px 20px 12px;width:100%;position:relative;">
                        ${backBtn}
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
    var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/backgrounds/vertical_slab_victory.png\') center/100% 100% no-repeat;z-index:100;">';
    h += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">';
    
    var rewardItems = [];
    if (rewards.cupEarned) { rewardItems.push({ icon: 'assets/interface/resource_cup_for_completed_tasks.png', quantity: 1, label: 'Кубок' }); }
    if (rewards.exp) { rewardItems.push({ icon: 'assets/assets2/icons/progress.png', quantity: rewards.exp, label: 'Опыт' }); }
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
    
    if (UI._screenLayer) {
        UI._screenLayer.innerHTML = h;
        UI._screenLayer.style.display = 'block';
    }
};

UI._showDefeatScreen = function(rewards) {
    var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/backgrounds/vertical_slab_defeat.png\') center/100% 100% no-repeat;z-index:100;">';
    h += '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;">';
    
    var rewardItems = [];
    if (rewards.exp) { rewardItems.push({ icon: 'assets/assets2/icons/progress.png', quantity: rewards.exp, label: 'Опыт' }); }
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
    } else {
        // Фолбэк: сначала портал, потом подземка
        if (UI._lastPortal && Sherwood.Portal && Sherwood.Portal.showUI) {
            Sherwood.Portal.showUI();
        } else if (UI._lastDungeon && UI._dungeonShowFloors) {
            UI._dungeonShowFloors(UI._lastDungeon);
        } else if (UI.dungeon) {
            UI.dungeon();
        } else {
            UI.loadHome();
        }
    }
};

// ============================================================
//  ЭКРАНЫ ИГРЫ
// ============================================================

UI.profile = function() {
    UI._playSound('click');
    UI._stopMusic();

    try {
        if (window.stopMainMusic) window.stopMainMusic();
        if (window.audioPlayer) {
            window.audioPlayer.pause();
            window.audioPlayer.currentTime = 0;
            window.audioPlayer.src = '';
        }
        if (window.isMusicPlaying !== undefined) window.isMusicPlaying = false;
    } catch(e){}

    UI._cameFromCamp = true;

    var url = 'profile_camp.html';
    if (UI._campReturnInfo && UI._campReturnInfo.gx !== undefined) {
        url += '?returnGX=' + UI._campReturnInfo.gx + '&returnGY=' + UI._campReturnInfo.gy;
    }

    var iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;z-index:100;';
    if (UI._screenLayer) {
        UI._screenLayer.innerHTML = '';
        UI._screenLayer.appendChild(iframe);
        UI._screenLayer.style.display = 'block';
    }
};
// ============================================================
//  ВСЕ ТРОФЕИ
// ============================================================
UI._showAllTrophies = function() {
    UI._playSound('click');
    var p = Sherwood.getPlayer();
    var trophies = (p && p.trophies) || [];

    var h = '<div style="text-align:center;padding:10px;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:12px;">🏆 Трофеи: ' + trophies.length + '</div>';

    if (trophies.length === 0) {
        h += '<div style="text-align:center;color:#888;padding:40px 20px;">Пока нет трофеев.<br>Побеждай боссов и проходи подземелья.</div>';
    } else {
        h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:400px;margin:0 auto;">';
        for (var i = 0; i < trophies.length; i++) {
            var t = trophies[i];
            var icon = t.icon || 'assets/interface/labyrinth_of_icons.png';
            h += '<div onclick="UI._showTrophyInfo(' + i + ')" style="background:rgba(0,0,0,0.5);border:2px solid #c9a040;border-radius:8px;padding:8px;display:flex;flex-direction:column;align-items:center;cursor:pointer;">';
            h += '<img src="' + icon + '" style="width:70px;height:70px;object-fit:contain;border-radius:4px;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '<div style="color:#ffd27a;font-size:0.65em;text-align:center;margin-top:6px;line-height:1.3;">' + (t.name || 'Трофей') + '</div>';
            h += '</div>';
        }
        h += '</div>';
    }

    UI._openScreenScrollable('🏆 Трофеи', 'profile', h, 'UI.profile()');
};

UI._showTrophyInfo = function(index) {
    var p = Sherwood.getPlayer();
    if (!p || !p.trophies || !p.trophies[index]) return;
    var t = p.trophies[index];

    var bonusText = '';
    if (t.bonus) {
        if (t.bonus.attack) bonusText += '⚔️ Атака +' + t.bonus.attack + '<br>';
        if (t.bonus.defense) bonusText += '🛡️ Защита +' + t.bonus.defense + '<br>';
        if (t.bonus.hp) bonusText += '❤️ HP +' + t.bonus.hp + '<br>';
    }

    var h = '<div style="display:flex;flex-direction:column;align-items:center;padding:20px;text-align:center;">';
    h += '<img src="' + (t.icon || 'assets/interface/labyrinth_of_icons.png') + '" style="width:160px;height:160px;object-fit:contain;margin-bottom:20px;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
    h += '<div style="color:#ffd27a;font-size:1.2em;font-weight:bold;margin-bottom:10px;">' + (t.name || 'Трофей') + '</div>';
    h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:16px;">' + (t.category || 'chapter') + '</div>';
    if (bonusText) {
        h += '<div style="color:#fff;font-size:0.9em;line-height:1.8;text-shadow:0 2px 4px #000;">' + bonusText + '</div>';
    }
    h += '</div>';

    UI._openScreen(t.name || 'Трофей', 'profile', h, 'UI._showAllTrophies()');
};

// ============================================================
//  ВСЕ КОЛЬЦА
// ============================================================
UI._showAllRings = function() {
    UI._playSound('click');
    var p = Sherwood.getPlayer();
    var ownedRings = [];

    var bag = Sherwood.Bag;
    if (bag) {
        var items = bag.getItems();
        for (var i = 0; i < items.length; i++) {
            if (items[i].part === 'ring') ownedRings.push(items[i]);
        }
        var eq = bag.getEquipment();
        if (eq && eq.ring) ownedRings.push(eq.ring);
    }
    if (p && p.marketData && p.marketData.ownedJewelry && p.marketData.ownedJewelry.rings) {
        for (var k = 0; k < p.marketData.ownedJewelry.rings.length; k++) {
            var rid = p.marketData.ownedJewelry.rings[k];
            if (typeof Sherwood.BlackMarket !== 'undefined') {
                var info = Sherwood.BlackMarket.getRingInfo ? Sherwood.BlackMarket.getRingInfo(rid) : null;
                if (info) ownedRings.push(info);
            }
        }
    }

    var h = '<div style="text-align:center;padding:10px;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:12px;">💍 Кольца: ' + ownedRings.length + '</div>';

    if (ownedRings.length === 0) {
        h += '<div style="text-align:center;color:#888;padding:40px 20px;">Нет кольца.<br>Выкуй в кузнице или купи на рынке.</div>';
    } else {
        h += '<div style="display:flex;flex-direction:column;align-items:center;gap:10px;max-width:400px;margin:0 auto;">';
        for (var i = 0; i < ownedRings.length; i++) {
            var r = ownedRings[i];
            h += '<div style="background:rgba(0,0,0,0.5);border:2px solid #c9a040;border-radius:8px;padding:10px;width:90%;display:flex;align-items:center;gap:12px;">';
            h += '<img src="' + (r.icon || 'assets/interface/ring_first_level.png') + '" style="width:64px;height:64px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '<div style="flex:1;text-align:left;">';
            h += '<div style="color:#ffd27a;font-size:0.9em;font-weight:bold;">' + (r.name || 'Кольцо') + '</div>';
            if (r.stats) {
                h += '<div style="color:#aaa;font-size:0.7em;margin-top:4px;">АТК +' + (r.stats.attack || 0) + ' | ЗЩТ +' + (r.stats.defense || 0) + '</div>';
            }
            h += '</div>';
            h += '</div>';
        }
        h += '</div>';
    }

    UI._openScreenScrollable('💍 Кольца', 'profile', h, 'UI.profile()');
};

// ============================================================
//  ВСЕ АМУЛЕТЫ
// ============================================================
UI._showAllAmulets = function() {
    UI._playSound('click');
    var p = Sherwood.getPlayer();
    var ownedAmulets = [];

    var bag = Sherwood.Bag;
    if (bag) {
        var items = bag.getItems();
        for (var i = 0; i < items.length; i++) {
            if (items[i].part === 'amulet') ownedAmulets.push(items[i]);
        }
        var eq = bag.getEquipment();
        if (eq && eq.amulet) ownedAmulets.push(eq.amulet);
    }
    if (p && p.marketData && p.marketData.ownedJewelry && p.marketData.ownedJewelry.amulets) {
        for (var k = 0; k < p.marketData.ownedJewelry.amulets.length; k++) {
            var aid = p.marketData.ownedJewelry.amulets[k];
            if (typeof Sherwood.BlackMarket !== 'undefined') {
                var info = Sherwood.BlackMarket.getAmuletInfo ? Sherwood.BlackMarket.getAmuletInfo(aid) : null;
                if (info) ownedAmulets.push(info);
            }
        }
    }

    var h = '<div style="text-align:center;padding:10px;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:12px;">📿 Амулеты: ' + ownedAmulets.length + '</div>';

    if (ownedAmulets.length === 0) {
        h += '<div style="text-align:center;color:#888;padding:40px 20px;">Нет амулета.<br>Выкуй в кузнице или купи на рынке.</div>';
    } else {
        h += '<div style="display:flex;flex-direction:column;align-items:center;gap:10px;max-width:400px;margin:0 auto;">';
        for (var i = 0; i < ownedAmulets.length; i++) {
            var a = ownedAmulets[i];
            h += '<div style="background:rgba(0,0,0,0.5);border:2px solid #c9a040;border-radius:8px;padding:10px;width:90%;display:flex;align-items:center;gap:12px;">';
            h += '<img src="' + (a.icon || 'assets/interface/sherwood_amulet_level_one.png') + '" style="width:64px;height:64px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '<div style="flex:1;text-align:left;">';
            h += '<div style="color:#ffd27a;font-size:0.9em;font-weight:bold;">' + (a.name || 'Амулет') + '</div>';
            if (a.stats) {
                h += '<div style="color:#aaa;font-size:0.7em;margin-top:4px;">HP +' + (a.stats.hp || 0) + ' | ЗЩТ +' + (a.stats.defense || 0) + '</div>';
            }
            h += '</div>';
            h += '</div>';
        }
        h += '</div>';
    }

    UI._openScreenScrollable('📿 Амулеты', 'profile', h, 'UI.profile()');
};

//  КУЗНИЦА
// ============================================================
UI.forge = function() {
    UI._playSound('click');
    if (typeof Sherwood !== 'undefined' && Sherwood.Forge && Sherwood.Forge.showUI) {
        Sherwood.Forge.showUI();
    } else {
        UI._showPlaceholder('Кузница', 'forge', 'UI.loadHome()');
    }
};


/// ============================================================
//  БЕСТИАРИЙ — делегируем в Sherwood.Bestiary
// ============================================================
UI.bestiary = function() {
    UI._playSound('click');
    if (typeof Sherwood !== 'undefined' && Sherwood.Bestiary && Sherwood.Bestiary.showUI) {
        Sherwood.Bestiary.showUI();
    } else {
        UI._showPlaceholder('Бестиарий', 'bestiary', 'UI.loadHome()');
    }
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
    if (typeof Settings !== 'undefined' && Settings.showUI) {
        Settings.showUI();
    } else {
        UI._showPlaceholder('Настройки', 'settings');
    }
};
        
// ============================================================
//  СУМКА — новая версия (без верхних ресурсов, фон fixed)
// ============================================================
UI.bag = function() {
    UI._playSound('click');
    if (Sherwood.Bag && Sherwood.Bag.showUI) {
        Sherwood.Bag.showUI();
    } else {
        UI._showPlaceholder('Сумка', 'bag');
    }
};
// ============================================================
//  ДОПОЛНИТЕЛЬНЫЕ ЭКРАНЫ
// ============================================================
UI.camp = function() {
    UI._playSound('click');
    UI._stopMusic();

    try {
        if (window.stopMainMusic) window.stopMainMusic();
        if (window.audioPlayer) {
            window.audioPlayer.pause();
            window.audioPlayer.currentTime = 0;
            window.audioPlayer.src = '';
        }
        if (window.isMusicPlaying !== undefined) window.isMusicPlaying = false;
    } catch(e){}

    UI._cameFromCamp = true;

    var url = 'camp.html';
    if (UI._campReturnInfo && UI._campReturnInfo.gx !== undefined) {
        url += '?returnGX=' + UI._campReturnInfo.gx + '&returnGY=' + UI._campReturnInfo.gy;
    }

    // Если возвращаемся из подраздела (не с главной), видео не показываем
        if (UI._campReturnInfo || sessionStorage.getItem('camp_video_shown')) {
        var iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;z-index:100;';
        if (UI._screenLayer) {
            UI._screenLayer.innerHTML = '';
            UI._screenLayer.appendChild(iframe);
            UI._screenLayer.style.display = 'block';
        }
        return;
    }
    sessionStorage.setItem('camp_video_shown', '1');

    // Первый вход в Лагерь — показываем видео
    const video = document.createElement('video');
    video.src = 'assets/assets2/animation/exit_game.webm';
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    
    let videoStyles = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);object-fit:fill;z-index:3000;background:#000;';
    if (window.innerWidth < 480) { video.style.cssText = videoStyles + 'width:100vw;height:100vh;'; }
    else if (window.innerWidth >= 480 && window.innerHeight <= 800) { video.style.cssText = videoStyles + 'width:480px;height:100vh;'; }
    else { video.style.cssText = videoStyles + 'width:480px;height:800px;'; }
    
    document.body.appendChild(video);
    
    var videoFinished = false;
    function openCamp() {
        if (videoFinished) return;
        videoFinished = true;
        try { video.remove(); } catch(e) {}
        
        var iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;z-index:100;';
        if (UI._screenLayer) {
            UI._screenLayer.innerHTML = '';
            UI._screenLayer.appendChild(iframe);
            UI._screenLayer.style.display = 'block';
        }
    }
    
    video.onended = openCamp;
    video.onerror = openCamp;
    setTimeout(openCamp, 8000);
};
UI.thicket = function() {
    UI._playSound('click');
    if (typeof Sherwood !== 'undefined' && Sherwood.Thicket && Sherwood.Thicket.showUI) {
        Sherwood.Thicket.showUI();
    } else {
        UI._showPlaceholder('Шервудская чащоба', 'quests');
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


// ============================================================
//  ПОДЗЕМКА — КАРУСЕЛЬ
// ============================================================
UI.dungeon = function() {
    UI._playSound('click');
    UI._stopMusic();

    var dungeons = [
    { id: 1, name: 'Проклятая чаща', icon: 'assets/dungeon_tiles/visual_dungeon/the_cursed_thicket.png' },
    { id: 2, name: 'Первородное болото', icon: 'assets/dungeon_tiles/visual_dungeon/primordial_swamp.png' },
    { id: 3, name: 'Базальтовый грот', icon: 'assets/dungeon_tiles/visual_dungeon/basalt_grotto.png' },
    { id: 4, name: 'Разлом времени', icon: 'assets/assets2/game_details/rift_in_time.png' }
];

    var h = '<div id="dungeon-carousel" style="position:relative;height:500px;overflow:hidden;touch-action:pan-y;margin:0 -12px;width:calc(100% + 24px);">';

    for (var i = 0; i < dungeons.length; i++) {
        var d = dungeons[i];
        var display = (i === 0) ? 'flex' : 'none';

        h += '<div class="dungeon-slide" data-index="' + i + '" style="display:' + display + ';flex-direction:column;align-items:center;justify-content:center;text-align:center;min-height:100%;padding:20px;">';
        h += '<img src="' + d.icon + '" style="width:150px;height:150px;object-fit:contain;margin:0 auto 30px;display:block;">';
        h += '<div style="background:url(\'assets/assets2/game_details/sections_menu.png\') center/100% 100% no-repeat;padding:10px 45px;color:#ffa500;font-size:1.1em;font-weight:bold;text-shadow:0 2px 4px #000;display:inline-block;line-height:1.2;margin-top:180px;margin-bottom:15px;">' + d.name + '</div>';
        h += '<button onclick="UI._dungeonShowFloors(' + d.id + ')" style="background:#c9a040;border:none;border-radius:8px;padding:10px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;margin-top:10px;">⚔️ Войти</button>';
        h += '</div>';
    }
    h += '</div>';

    UI._openScreen('🏚️ Подземка', 'thicket', h, 'UI.camp()');
    var carousel = document.getElementById('dungeon-carousel');
    if (carousel) {
        var startY = 0;
        var currentIndex = 0;
        carousel.addEventListener('wheel', function(e) {
            e.preventDefault();
            if (Math.abs(e.deltaY) < 20) return;
            var slides = carousel.querySelectorAll('.dungeon-slide');
            slides[currentIndex].style.display = 'none';
            if (e.deltaY > 0) { currentIndex = (currentIndex + 1) % slides.length; }
            else { currentIndex = (currentIndex - 1 + slides.length) % slides.length; }
            slides[currentIndex].style.display = 'flex';
        }, { passive: false });
        carousel.addEventListener('touchstart', function(e) { startY = e.touches[0].clientY; }, { passive: true });
        carousel.addEventListener('touchend', function(e) {
            var delta = e.changedTouches[0].clientY - startY;
            if (Math.abs(delta) < 50) return;
            var slides = carousel.querySelectorAll('.dungeon-slide');
            slides[currentIndex].style.display = 'none';
            if (delta < 0) { currentIndex = (currentIndex + 1) % slides.length; }
            else { currentIndex = (currentIndex - 1 + slides.length) % slides.length; }
            slides[currentIndex].style.display = 'flex';
        }, { passive: true });
    }
};
// === ПРОГРЕСС ПОДЗЕМОК (в UI, не в dungeon.js) ===
UI._ensureDungeonProgress = function() {
    var p = Sherwood.getPlayer();
    if (!p) return null;
    if (!p.dungeonProgress || !p.dungeonProgress.byDungeon) {
        p.dungeonProgress = { byDungeon: {} };
    }
    return p.dungeonProgress;
};

UI._getDungeonFloorsData = function(dungeonId) {
    var prog = UI._ensureDungeonProgress();
    if (!prog) return [];
    if (!prog.byDungeon[dungeonId]) {
        prog.byDungeon[dungeonId] = [
            { cups: 0 }, { cups: 0 }, { cups: 0 },
            { cups: 0 }, { cups: 0 }, { cups: 0 }
        ];
    }
    return prog.byDungeon[dungeonId];
};

UI._getFloorCups = function(dungeonId, floor) {
    var floors = UI._getDungeonFloorsData(dungeonId);
    return floors[floor - 1].cups || 0;
};

UI._isFloorAvailable = function(dungeonId, floor, diff) {
    var floors = UI._getDungeonFloorsData(dungeonId);
    var N = floor, K = diff;
    if (N < 1 || N > 6 || K < 1 || K > 3) return false;
    var thisCups = floors[N - 1].cups || 0;
    var prevCups = (N > 1) ? (floors[N - 2].cups || 0) : 0;
    if (K === 1) {
        if (N === 1) return true;
        return prevCups >= 2;
    }
    if (K === 2) return thisCups >= 1;
    if (K === 3) return thisCups >= 2;
    return false;
};

UI._grantCup = function(dungeonId, floor, diff) {
    var floors = UI._getDungeonFloorsData(dungeonId);
    var cur = floors[floor - 1].cups || 0;
    if (diff > cur) floors[floor - 1].cups = diff;

    // Синхронизация со старой структурой dungeon.js (p.dungeonProgress.floors)
    var p = Sherwood.getPlayer();
    if (p) {
        if (!p.dungeonProgress) p.dungeonProgress = {};
        if (!p.dungeonProgress.floors || p.dungeonProgress.floors.length !== 6) {
            p.dungeonProgress.floors = [{cups:0},{cups:0},{cups:0},{cups:0},{cups:0},{cups:0}];
        }
        var legacy = p.dungeonProgress.floors[floor - 1];
        if (diff > (legacy.cups || 0)) legacy.cups = diff;
    }

    Sherwood.saveGame();
    console.log('🏆 Кубок: подземка ' + dungeonId + ', этаж ' + floor + ', сложность ' + diff);
};

UI._dungeonShowFloors = function(dungeonId) {
    if (Sherwood.Dungeon && Sherwood.Dungeon.showFloors) {
        Sherwood.Dungeon.showFloors(dungeonId);
    }
};

UI._dungeonEnter = function(dungeonId, floor, diff) {
    UI._playSound('click');
    UI._stopMusic();

    // Проверяем билет
    if (!Sherwood.Dungeon.spendEntranceTicket()) {
        var cost = Sherwood.Dungeon.getBuyTicketCost('entrance');
        if (UI._showToast) UI._showToast('❌ Нет ключей! Докупить за ' + cost + ' золота?');
        return;
    }

    try {
        if (window.stopMainMusic) window.stopMainMusic();
        if (window.audioPlayer) {
            window.audioPlayer.pause();
            window.audioPlayer.currentTime = 0;
            window.audioPlayer.src = '';
        }
        if (window.isMusicPlaying !== undefined) window.isMusicPlaying = false;
    } catch(e){}

    UI._lastDungeon = dungeonId;
    UI._lastFloor = floor;
    UI._lastDiff = diff;

    var iframe = document.createElement('iframe');
    iframe.src = 'dungeon.html?dungeon=' + dungeonId + '&floor=' + floor + '&diff=' + diff;
    iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;z-index:100;';
    if (UI._screenLayer) {
        UI._screenLayer.innerHTML = '';
        UI._screenLayer.appendChild(iframe);
        UI._screenLayer.style.display = 'block';
    }
};

// Дополнительные функции для кнопок
UI._buyDungeonTicket = function(type) {
    var r = Sherwood.Dungeon.buyTicket(type);
    if (r.success) {
        UI._showToast('✅ Куплено за ' + r.cost + ' золота');
        UI._dungeonShowFloors(UI._lastDungeon || 1);
    } else {
        UI._showToast('❌ ' + r.reason);
    }
};

UI._startAutoFight = function(dungeonId, floor, diff) {
    var r = Sherwood.Dungeon.startAutoFight(floor, diff);
    if (r.success) {
        UI._showToast('✅ Автобой запущен...');
        setTimeout(function() { UI._dungeonShowFloors(dungeonId); }, 3100);
    } else {
        UI._showToast('❌ ' + r.reason);
    }
};

UI._startFreeAutoFight = function(dungeonId, floor, diff) {
    var r = Sherwood.Dungeon.startFreeAutoFight(floor, diff);
    if (r.success) {
        UI._showToast('⏳ Бесплатный автобой начат. Награды через 15 минут.');
        setTimeout(function() { UI._dungeonShowFloors(dungeonId); }, 1000);
    } else {
        UI._showToast('❌ ' + r.reason);
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
UI.loadHome = function() {
    try { if (UI._hideDungeonVideo) UI._hideDungeonVideo(); } catch(e) {}
    UI._cameFromCamp = false;
    UI._campReturnInfo = null;
    try {
        if (UI._screenLayer) {
            UI._screenLayer.style.display = 'none';
            UI._screenLayer.innerHTML = '';
            UI._screenLayer.style.overflow = 'auto';
        }
    } catch(e) {}
    try { UI.updateDisplay(); } catch(e) {}
    if (typeof showHomeScreen === 'function') {
        showHomeScreen();
    }
};
// ============================================================
//  ЭКСПОРТ
// ============================================================
window.UI = UI;
window.Sherwood = window.Sherwood || {};
window.Sherwood.UI = UI;

console.log('UI экраны полностью загружены!');

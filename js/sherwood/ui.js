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
        hearth: 'assets/backgrounds/background_hearth.jpeg', talents: 'assets/backgrounds/background_talents.png'
    },
    
    _statIcons: { attack: 'assets/interface/icon_power.png', defense: 'assets/interface/icon_defense.png', agility: 'assets/interface/icon_dexterity.png', hp: 'assets/interface/icon_health.png' },
    _sounds: {}, _currentMusic: null, _currentMusicKey: null, _soundEnabled: true, _musicEnabled: true,
    _audioFiles: {
        'main_theme': 'assets/sounds/sherwood_rpg.mp3',
        'click': 'assets/sounds/button_click.ogg', 'shot': 'assets/sounds/arrow_hit_2.wav', 'arrow_hit': 'assets/sounds/arrow_hit_2.wav',
        'victory': 'assets/sounds/level_completed.wav', 'defeat': 'assets/sounds/defeat.wav', 'levelup': 'assets/sounds/levelup.wav',
        'chest_open': 'assets/sounds/chest_opens.wav', 'trap': 'assets/sounds/trap.wav',
        'steps': 'assets/sounds/hero_steps.flac', 'altar': 'assets/sounds/altar_underground.mp3', 'bottle_health': 'assets/sounds/bottle_health.mp3'
    },
    _previousScreen: null, _dungeon: null, _dailyTab: 1, _pendingRewards: null, _afterRewardAction: null,

    init: function() {
    this._mainElements = ['.bg-layer', '.arch-layer', '.hero-frame', '.top-panel', '.left-buttons', '.right-buttons', '.bottom-stats', '#top-buttons-bar'];
    this.container = document.getElementById('game-container'); if (!this.container) return;
    this._screenLayer = document.createElement('div'); this._screenLayer.id = 'screen-layer';
    this._screenLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:50;display:none;';
    this.container.appendChild(this._screenLayer);
    try { this._initSounds(); } catch(e) {}
    this.bindPlayButton();
        try {
    var silverEl = document.getElementById('silver-display');
    if (silverEl) {
        silverEl.parentElement.style.cursor = 'pointer';
        silverEl.parentElement.onclick = function() {
            var amount = prompt('Обменять золото на серебро.\nКурс: 1 золото = 100 серебра.\nСколько золота обменять?', '1');
            if (amount && parseInt(amount) > 0) {
                var r = Sherwood.convertGoldToSilver(parseInt(amount));
                if (r.success) SherwoodUI.updateDisplay();
                else alert(r.reason);
            }
        };
    }
} catch(e) {}
    try { this._playMusic('main_theme'); } catch(e) {}
    try { this.updateDisplay(); } catch(e) {}
    if (typeof Sherwood !== 'undefined') {
        try { Sherwood.on('RESOURCE_CHANGED', function() { SherwoodUI.updateDisplay(); }); } catch(e) {}
        try { Sherwood.on('PLAYER_LEVEL_UP', function() { SherwoodUI._playSound('levelup'); SherwoodUI.updateDisplay(); }); } catch(e) {}
    }
    try { this._loadAudioSettings(); } catch(e) {}
},

_initSounds: function() {
    for (var k in this._audioFiles) { try { var a = new Audio(this._audioFiles[k]); a.preload = 'auto'; a.volume = 0.5; this._sounds[k] = a; } catch(e) {} }
    try { var bgm = new Audio('assets/sounds/subway_3.wav'); bgm.preload = 'auto'; bgm.loop = true; bgm.volume = 0.25; this._sounds['battle_bgm'] = bgm; } catch(e) {}
    try { var main = new Audio('assets/sounds/sherwood_rpg.mp3'); main.preload = 'auto'; main.loop = true; main.volume = 0.5; this._sounds['main_theme'] = main; } catch(e) {}
},
_playSound: function(k) { try { if (!this._soundEnabled) return; var s = this._sounds[k]; if (s) { s.currentTime = 0; s.play().catch(function() {}); } } catch(e) {} },
_playMusic: function(k) {
    try {
        if (!this._musicEnabled) return;
        if (k === 'main_theme' && Sherwood.Dungeon && Sherwood.Dungeon.getDungeon()) return;
        if (k === 'main_theme' && Sherwood.Combat && Sherwood.Combat.isActive && Sherwood.Combat.isActive()) return;
        if (this._currentMusicKey === k && this._currentMusic && !this._currentMusic.paused) return;
        this._stopMusic(); this._stopBattleMusic();
        var m = this._sounds[k]; if (m) { m.loop = true; m.volume = 0.7; m.currentTime = 0; m.play().catch(function() {}); this._currentMusic = m; this._currentMusicKey = k; }
    } catch(e) {}
},

_stopMusic: function() { try { if (this._currentMusic) { this._currentMusic.pause(); this._currentMusic.currentTime = 0; this._currentMusic = null; this._currentMusicKey = null; } } catch(e) {} },
_stopBattleMusic: function() { try { var bgm = this._sounds['battle_bgm']; if (bgm) { bgm.pause(); bgm.currentTime = 0; } } catch(e) {} },
_playHitSounds: function() {
    try { this._playSound('shot'); } catch(e) {}
    try { var bgm = this._sounds['battle_bgm']; if (bgm && bgm.paused) { bgm.currentTime = 0; bgm.play().catch(function() {}); } } catch(e) {}
},
_saveAudioSettings: function() { try { localStorage.setItem('sherwood_audio', JSON.stringify({ sound: this._soundEnabled, music: this._musicEnabled })); } catch(e) {} },
_loadAudioSettings: function() { try { var s = localStorage.getItem('sherwood_audio'); if (s) { var d = JSON.parse(s); this._soundEnabled = d.sound !== false; this._musicEnabled = d.music !== false; } } catch(e) {} },

bindButtons: function() {
    var self = this;
    try {
        var buttons = document.querySelectorAll('#mainInterface .btn[data-action]');
        for (var i = 0; i < buttons.length; i++) {
            (function(el) {
                el.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var a = el.dataset.action;
                    if (a && typeof self[a] === 'function') { try { self._playSound('click'); } catch(e) {} self[a](); }
                });
            })(buttons[i]);
        }
    } catch(e) { setTimeout(function() { self.bindButtons(); }, 500); }
},
    bindPlayButton: function() {
        try {
            var self = this; var btn = document.getElementById('playBtn');
            if (btn) btn.addEventListener('click', function() {
                try { document.getElementById('loadingScreen').classList.add('hidden'); } catch(e) {}
                try { document.getElementById('mainInterface').classList.add('active'); } catch(e) {}
                try { self._playMusic('forest_ambient'); } catch(e) {}
            });
        } catch(e) {}
    },

    updateDisplay: function() {
    try {
        var p = (typeof Sherwood !== 'undefined' && Sherwood.getPlayer) ? Sherwood.getPlayer() : null; if (!p) return;
        try { document.getElementById('gold-display').textContent = this._fmt(p.resources ? p.resources.gold || 0 : 0); } catch(e) {}
        try { document.getElementById('silver-display').textContent = this._fmt(p.resources ? p.resources.silver || 0 : 0); } catch(e) {}
        try { document.getElementById('exp-display').textContent = this._fmt(p.exp || 0); } catch(e) {}
        try { document.getElementById('exp-max-display').textContent = this._fmt(p.expToLevel || 100); } catch(e) {}
        try { var expPct = Sherwood.getLevelProgress(); var fill = document.getElementById('exp-fill'); if (fill) fill.style.width = expPct + '%'; } catch(e) {}
        try { var ae = document.querySelector('.stat-value.attack'); if (ae) ae.textContent = p.stats ? p.stats.attack || 0 : 0; } catch(e) {}
        try { var de = document.querySelector('.stat-value.defense'); if (de) de.textContent = p.stats ? p.stats.defense || 0 : 0; } catch(e) {}
        try { var ge = document.querySelector('.stat-value.agility'); if (ge) ge.textContent = p.stats ? p.stats.agility || 0 : 0; } catch(e) {}
        try { var he = document.querySelector('.stat-value.hp'); if (he) he.textContent = p.stats ? p.stats.hp || 0 : 0; } catch(e) {}
    } catch(e) {}
},
    _fmt: function(n) { return (n === undefined || n === null) ? '0' : n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); },

    loadHome: function() {
        try { if (this._screenLayer) { this._screenLayer.style.display = 'none'; this._screenLayer.innerHTML = ''; } } catch(e) {}
        try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = ''; }); }); } catch(e) {}
        try { this.container.style.background = ''; } catch(e) {}
        try { this._stopBattleMusic(); this._playMusic('main_theme'); } catch(e) {}
        this._previousScreen = null;
        try { this.updateDisplay(); } catch(e) {}
    },
    _openScreen: function(title, bgKey, html, backFn) {
        try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = 'none'; }); }); } catch(e) {}
        try { this.container.style.background = "url('" + (this._bg[bgKey] || bgKey) + "') center/cover no-repeat"; } catch(e) {}
        var goBack = backFn || 'SherwoodUI.loadHome()';
        try { if (this._screenLayer) { this._screenLayer.innerHTML = '<div style="min-height:100%;background:rgba(0,0,0,0.7);padding:16px;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;"><button onclick="' + goBack + '" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;">' + title + '</span></div><div style="flex:1;">' + html + '</div></div>'; this._screenLayer.style.display = 'block'; } } catch(e) {}
    },
    _showPlaceholder: function(title, bgKey, backAction) { this._playSound('click'); this._openScreen(title, bgKey, '<div style="text-align:center;padding:40px 0;"><div style="font-size:3em;margin-bottom:16px;">🏗️</div><div style="font-size:1.2em;color:#e0c080;margin-bottom:8px;">'+title+'</div><div style="font-size:0.7em;color:#888;">В разработке</div></div>', backAction); },

    _showVictoryScreen: function(rewards) { var h = '<div style="text-align:center;padding:10px;"><div style="position:relative;display:inline-block;"><img src="assets/interface/vertical_slab_victory.png" style="width:300px;height:auto;display:block;"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;"><div style="color:#ffd700;font-size:1.1em;font-weight:bold;">🏆 ПОБЕДА!</div>'; if (rewards.exp) h += '<div style="color:#fff;font-size:0.85em;">+ ' + rewards.exp + ' XP</div>'; if (rewards.gold) h += '<div style="color:#ffd700;">+ ' + rewards.gold + ' 🪙</div>'; if (rewards.silver) h += '<div style="color:#c0c0c0;">+ ' + rewards.silver + ' ⚪</div>'; if (rewards.scrolls) h += '<div style="color:#9c27b0;">+ ' + rewards.scrolls + ' 📜</div>'; if (rewards.ingots) h += '<div style="color:#ff9800;">+ ' + rewards.ingots + ' 🔩</div>'; h += '</div><button onclick="SherwoodUI._claimReward()" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:8px;padding:8px 24px;color:#000;font-weight:bold;cursor:pointer;font-size:0.8em;z-index:2;">Забрать</button></div></div>'; this._openScreen('🏆 Победа', 'dungeon_fight', h); },
    _showDefeatScreen: function(rewards) { var h = '<div style="text-align:center;padding:10px;"><div style="position:relative;display:inline-block;"><img src="assets/interface/vertical_slab_defeat.png" style="width:300px;height:auto;display:block;"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;width:80%;"><div style="color:#f44336;font-size:1.1em;font-weight:bold;">💀 ПОРАЖЕНИЕ</div>'; if (rewards.exp) h += '<div style="color:#fff;font-size:0.85em;">+ ' + rewards.exp + ' XP</div>'; if (rewards.silver) h += '<div style="color:#c0c0c0;">+ ' + rewards.silver + ' ⚪</div>'; if (rewards.scrolls) h += '<div style="color:#9c27b0;">+ ' + rewards.scrolls + ' 📜</div>'; h += '</div><button onclick="SherwoodUI._claimReward()" style="position:absolute;bottom:20px;left:50%;transform:translateX(-50%);background:#c9a040;border:none;border-radius:8px;padding:8px 24px;color:#000;font-weight:bold;cursor:pointer;font-size:0.8em;z-index:2;">Забрать</button></div></div>'; this._openScreen('💀 Поражение', 'dungeon_fight', h); },
    _claimReward: function() { this._pendingRewards = null; if (this._afterRewardAction) { var cb = this._afterRewardAction; this._afterRewardAction = null; cb(); } },
    hearth: function() {
    this._playSound('click');
    var p = Sherwood.getPlayer();
    var bonusActive = p.hearthBonus && p.hearthBonus.active;
    var bonusEnd = p.hearthBonus ? p.hearthBonus.endTime || 0 : 0;
    var now = Date.now();
    var cooldown = p.hearthCooldown || 0;
    var wood = 0;
    try { var bag = Sherwood.Bag.getItems(); for (var i=0;i<bag.length;i++) { if (bag[i].id === 'wood' || bag[i].name === 'Дерево') wood += bag[i].quantity || 0; } } catch(e) {}
    var canActivate = wood >= 100 && now > cooldown;
    var h = '<div style="text-align:center;padding:20px;"><div style="font-size:3em;">🔥</div><div style="color:#e0c080;font-size:1.2em;margin:12px 0;">Очаг Шервуда</div><div style="color:#aaa;font-size:0.85em;">Дерева в сумке: ' + wood + ' / 100</div>';
    if (bonusActive && now < bonusEnd) { var rem = Math.ceil((bonusEnd - now)/3600000); h += '<div style="color:#4caf50;margin:12px 0;">✅ Бонус +20% активен! Осталось: ' + rem + ' ч.</div>'; }
    else if (canActivate) { h += '<button onclick="SherwoodUI._activateHearth()" style="margin-top:12px;background:#c9a040;border:none;border-radius:8px;padding:10px 24px;color:#000;font-weight:bold;cursor:pointer;">Подкинуть дров (100 🌿)</button>'; }
    else if (now <= cooldown) { var cd = Math.ceil((cooldown - now)/3600000); h += '<div style="color:#ff9800;margin:12px 0;">⏳ Перезарядка: ' + cd + ' ч.</div>'; }
    else { h += '<div style="color:#f44336;margin:12px 0;">Недостаточно дерева (нужно 100)</div>'; }
    h += '</div>';
    this._openScreen('🔥 Очаг', 'hearth', h);
},

_activateHearth: function() {
    var p = Sherwood.getPlayer();
    var spent = 0;
    try { var bag = Sherwood.Bag.getItems(); for (var i=bag.length-1;i>=0&&spent<100;i--) { if (bag[i].id==='wood'||bag[i].name==='Дерево') { var q=bag[i].quantity||1; var t=Math.min(q,100-spent); spent+=t; if(q<=t) bag.splice(i,1); else bag[i].quantity-=t; } } Sherwood.Bag._save(); } catch(e) {}
    p.hearthBonus = { active: true, endTime: Date.now() + 86400000 };
    p.hearthCooldown = Date.now() + 604800000;
    Sherwood._recalcStats();
    Sherwood.saveGame();
    this.hearth();
},

talents: function() {
    this._playSound('click');
    var skills = Sherwood.Combat ? Sherwood.Combat.getSkills() : {};
    var h = '<div style="padding:10px;"><div style="color:#e0c080;font-size:1.1em;text-align:center;margin-bottom:12px;">🌿 Таланты</div>';
    for (var id in skills) { var s=skills[id]; h+='<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px;margin-bottom:8px;display:flex;align-items:center;gap:10px;"><img src="'+s.icon+'" style="width:44px;height:44px;object-fit:contain;"><div style="flex:1;"><div style="color:#e0c080;">'+s.name+'</div><div style="color:#aaa;font-size:0.7em;">'+s.description+'</div></div>';
    if (s.unlocked) h+='<div style="color:#4caf50;font-size:0.7em;">Открыт</div>';
    else h+='<button onclick="SherwoodUI._unlockTalent(\''+id+'\')" style="background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Изучить ('+s.cost+' 🪙)</button>';
    h+='</div>'; }
    h += '</div>';
    this._openScreen('🌿 Таланты', 'talents', h);
},

_unlockTalent: function(id) { if(!Sherwood.Combat||!Sherwood.Combat.unlockSkill) return; var r=Sherwood.Combat.unlockSkill(id); if(r.success){this.updateDisplay();this.talents();} else this._showNotification(r.reason||'Ошибка'); },

    // ========== ПОДЗЕМКА ==========
    subway: function() { this.showDungeon(); },
    showDungeon: function() {
        this._playSound('click'); this._playMusic('dungeon_ambient');
        var dungeons = Sherwood.Dungeon ? Sherwood.Dungeon.getAvailable() : {}, list = '';
        for (var id in dungeons) {
            var d = dungeons[id], progress = (Sherwood.Dungeon._progress && Sherwood.Dungeon._progress[id]) ? Sherwood.Dungeon._progress[id] : { level: 1 };
            var tp = 'assets/dungeon_tiles/' + d.tiles + '/tiles', te = d.ext || '.jpeg';
            if (d.tiles === 'dungeon2') tp = 'assets/dungeon_tiles/dungeon2/tiles2.'; if (d.tiles === 'dungeon3') tp = 'assets/dungeon_tiles/dungeon3/tiles3.';
            list += '<div style="background:url(\'assets/backgrounds/skill_page.jpeg\') center/cover no-repeat;border:1px solid #555;border-radius:12px;padding:14px;margin-bottom:12px;position:relative;overflow:hidden;"><div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:0;"></div><div style="position:relative;z-index:1;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;"><div style="width:60px;height:60px;border-radius:10px;background:url(\'' + d.bg + '\') center/cover no-repeat;border:2px solid #c9a040;flex-shrink:0;"></div><div><div style="color:#e0c080;font-size:1.1em;font-weight:bold;">' + d.name + '</div><div style="color:#aaa;font-size:0.75em;">' + (d.icon||'') + ' Уровень ' + (progress.level||1) + '/7</div></div></div><div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;">';
            for (var lvl = 1; lvl <= 7; lvl++) { var unlocked = lvl <= (progress.level || 1), img = unlocked ? (tp + lvl + te) : 'assets/interface/closed_level_lock_icon.png'; list += '<div onclick="' + (unlocked ? 'SherwoodUI._startDungeon(\'' + id + '\',' + lvl + ')' : '') + '" style="width:48px;height:48px;background-image:url(\'' + img + '\');background-size:cover;background-position:center;border:2px solid ' + (unlocked ? '#c9a040' : '#555') + ';border-radius:6px;cursor:' + (unlocked ? 'pointer' : 'default') + ';display:flex;align-items:center;justify-content:center;position:relative;"><span style="position:absolute;bottom:1px;right:3px;font-size:0.6em;color:' + (unlocked ? '#000' : '#888') + ';">' + lvl + '</span></div>'; }
            list += '</div><div style="text-align:center;color:#666;font-size:0.7em;margin-top:6px;">' + ((progress.level||1) >= 7 ? '✅ Пройдено' : 'Следующий: ' + ((progress.level||1) + 1)) + '</div></div></div>';
        }
        var tickets = Sherwood.getPlayer() ? Sherwood.getPlayer().dungeon.tickets : 0, html = '<div style="color:#aaa;font-size:0.85em;margin-bottom:12px;text-align:center;">🎫 Билетов: ' + tickets + '</div>' + (list || '<div style="color:#aaa;text-align:center;">Нет подземелий</div>');
        try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = 'none'; }); }); } catch(e) {}
        this.container.style.background = "url('" + this._bg.dungeon_select + "') center/cover no-repeat";
        if (this._screenLayer) { this._screenLayer.innerHTML = '<div style="min-height:100%;background:rgba(0,0,0,0.7);padding:16px;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;"><button onclick="SherwoodUI.loadHome()" style="background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;"><img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.1em;">🏰 Подземелья</span></div><div style="flex:1;">' + html + '</div></div>'; this._screenLayer.style.display = 'block'; }
    },
    _startDungeon: function(id, level) { if (!Sherwood.Dungeon || !Sherwood.Dungeon.generate) return; var d = Sherwood.Dungeon.generate(id, level); if (!d) { this._showNotification('❌ Нет билетов!'); return; } this._playSound('dungeon_enter'); this._playMusic('dungeon_ambient'); this._renderDungeon(); },
    _showNotification: function(msg) { var log = document.getElementById('dungeon-log'); if (log) { log.textContent = msg; log.style.color = '#f44336'; setTimeout(function() { log.style.color = '#aaa'; }, 2000); } },

    _renderDungeon: function() {
    var d = Sherwood.Dungeon.getDungeon(); if (!d) { this.showDungeon(); return; }
    var dungeons = Sherwood.Dungeon.getAvailable(), dd = dungeons[d.id] || { bg: this._bg.dungeon_forest, tiles: "dungeon1", ext: ".jpeg" };
    this.container.style.background = "url(" + dd.bg + ") center/cover no-repeat";
    try { if (this._mainElements) this._mainElements.forEach(function(sel) { document.querySelectorAll(sel).forEach(function(el) { el.style.display = "none"; }); }); } catch(e) {}
    var size = d.size, cs = Math.floor(Math.min(this.container.clientWidth, this.container.clientHeight - 80) / 5);
    var floorBg = "assets/dungeon_tiles/" + dd.tiles + "/floorBg_" + (d.id === "forest" ? "1" : d.id === "swamp" ? "2" : "3") + ".png";
    var px = d.px, py = d.py;
    var gridW = cs * size, gridH = cs * size;
    var scrollX = Math.max(0, Math.min(px * cs - this.container.clientWidth / 2 + cs / 2, gridW - this.container.clientWidth));
    var scrollY = Math.max(0, Math.min(py * cs - (this.container.clientHeight - 80) / 2 + cs / 2, gridH - (this.container.clientHeight - 80)));
    var html = "<div style='position:relative;width:" + gridW + "px;height:" + gridH + "px;background-color:#000;overflow:hidden;'>";
    html += "<div style='position:absolute;left:" + (-scrollX) + "px;top:" + (-scrollY) + "px;width:" + gridW + "px;height:" + gridH + "px;'>";
    for (var y = 0; y < size; y++) { for (var x = 0; x < size; x++) { html += "<div style='position:absolute;left:" + (x*cs) + "px;top:" + (y*cs) + "px;width:" + cs + "px;height:" + cs + "px;background-image:url(assets/interface/labyrinth_asset.png);background-size:cover;background-position:center;z-index:0;'></div>"; } }
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            if (!d.grid[y] || !d.grid[y][x]) continue;
            var cell = d.grid[y][x], isPlayer = (x === px && y === py);
            if (cell.open) { html += "<div style='position:absolute;left:" + (x*cs) + "px;top:" + (y*cs) + "px;width:" + cs + "px;height:" + cs + "px;background-image:url(" + floorBg + ");background-size:cover;background-position:center;z-index:1;'></div>"; }
            var onclick = "", glow = "";
            if (!isPlayer) {
                var clickDist = Math.abs(px - x) + Math.abs(py - y);
                if (cell.open) {
                    onclick = "onclick='SherwoodUI._dungeonMove(" + x + "," + y + ")'";
                } else if (clickDist === 1 && cell.type !== 0) {
                    onclick = "onclick='SherwoodUI._dungeonMove(" + x + "," + y + ")'";
                    glow = "box-shadow:inset 0 0 12px rgba(255,255,200,0.5);";
                }
            }
            var content = "";
            if (!isPlayer && cell.open) {
                if (cell.monster) content = "<img src='assets/all_beasts/" + (cell.monsterId || "image (1).png") + "' style='width:90%;height:90%;object-fit:contain;'>";
                else if (cell.chest) content = "<img src='" + (cell.looted ? "assets/interface/open_chest_first_dungeon.png" : "assets/interface/locked_chest_first_dungeon.png") + "' style='width:80%;height:80%;object-fit:contain;'>";
                else if (cell.altar) content = "<img src='assets/interface/altar_of_the_first_dungeon.png' style='width:80%;height:80%;object-fit:contain;'>";
                else if (cell.cauldron) content = "<img src='assets/interface/cauldron_first_dungeon.png' style='width:80%;height:80%;object-fit:contain;'>";
                else if (cell.potion) content = "<img src='assets/interface/resource_life_potion.png' style='width:70%;height:70%;object-fit:contain;'>";
                else if (cell.exit) content = cell.locked ? "<img src='assets/interface/closed_level_lock_icon.png' style='width:80%;height:80%;object-fit:contain;'>" : "<img src='assets/interface/exit_completion_dungeon.png' style='width:80%;height:80%;object-fit:contain;'>";
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
            html += "<div " + onclick + " style='position:absolute;left:" + (x*cs) + "px;top:" + (y*cs) + "px;width:" + cs + "px;height:" + cs + "px;display:flex;align-items:center;justify-content:center;font-size:" + (cs*0.35) + "px;z-index:2;cursor:" + (onclick ? "pointer" : "default") + ";" + glow + "'>" + (content||"") + "</div>";
        }
    }
    html += "</div></div>";
    var hp = Sherwood.getPlayer().stats.hp || 0;
    if (this._screenLayer) { this._screenLayer.innerHTML = "<div style='min-height:100%;background:rgba(0,0,0,0.4);display:flex;flex-direction:column;'><div style='padding:4px;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;'><button onclick='SherwoodUI._leaveDungeon()' style='background:transparent;border:none;cursor:pointer;padding:0;width:36px;height:36px;'><img src='assets/all_buttons/back.png' style='width:100%;height:100%;object-fit:contain;'></button><div style='color:#70a0e0;font-weight:bold;font-size:0.85em;'>" + (d.id||"") + " " + (d.level||1) + "</div><div style='color:#4caf50;font-size:0.85em;'>HP " + hp + "</div></div><div style='background:rgba(0,0,0,0.5);padding:3px;text-align:center;flex-shrink:0;'><span style='font-size:10px;color:#aaa;'>" + (d.monstersKilled||0) + "/" + (d.totalMonsters||0) + " | " + (d.monstersKilled >= d.totalMonsters ? "EXIT OPEN" : "KILL ALL") + "</span></div><div style='flex:1;overflow:auto;'>" + html + "</div></div>"; this._screenLayer.style.display = "block"; }
},

_dungeonMove: function(tx, ty) {
    var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
    if (tx === d.px && ty === d.py) return;
    var cell = d.grid[ty][tx];
    if (!cell) return;
    var dist = Math.abs(d.px - tx) + Math.abs(d.py - ty);
    if (!cell.open && dist !== 1) return;
    if (!cell.open && dist === 1 && cell.type === 0) return;
    if (cell.open && dist > 1) {
        this._walkPath(tx, ty);
        return;
    }
    this._doStep(tx, ty);
},

_walkPath: function(toX, toY) {
    var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
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
                    self._renderDungeon();
                    return;
                }
                self._doStep(cur.path[i].x, cur.path[i].y);
                i++;
                setTimeout(nextStep, 150);
            }
            nextStep();
            return;
        }
        for (var i = 0; i < dirs.length; i++) {
            var nx = cur.x + dirs[i][0], ny = cur.y + dirs[i][1];
            if (nx >= 0 && nx < size && ny >= 0 && ny < size && !visited[ny + ',' + nx]) {
                var c = d.grid[ny][nx];
                if (c && c.open) {
                    visited[ny + ',' + nx] = true;
                    queue.push({x: nx, y: ny, path: cur.path.concat([{x: nx, y: ny}])});
                }
            }
        }
    }
},

_doStep: function(tx, ty) {
    var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
    
    if (tx > d.px) d.heroDirection = 'right';
    else if (tx < d.px) d.heroDirection = 'left';
    else if (ty > d.py) d.heroDirection = 'down';
    else if (ty < d.py) d.heroDirection = 'up';
    
    var res = Sherwood.Dungeon.move(tx, ty);
    if (!res || !res.ok) { this._renderDungeon(); return; }
    
    this._playSound('steps');
    this._renderDungeon();
    this.updateDisplay();
    
    if (res.type === 'battle') { d.isMoving = false; this._stopMusic(); this._playSound('trap'); Sherwood.Combat.start(res.monsterId, res.boss, 'dungeon'); setTimeout(function() { SherwoodUI._showCombatScreen(); }, 400); return; }
    if (res.type === 'chest') { this._playSound('chest_open'); }
    if (res.type === 'altar') { this._playSound('altar'); var p = Sherwood.getPlayer(); p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + Math.floor(p.stats.maxHp * 0.3)); }
    if (res.type === 'cauldron') { this._playSound('bottle_health'); var p = Sherwood.getPlayer(); p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + Math.floor(p.stats.maxHp * 0.2)); }
    if (res.type === 'potion') { this._playSound('bottle_health'); var p = Sherwood.getPlayer(); var heal = d.id === 'cave' ? Math.floor(p.stats.maxHp * 0.4) : Math.floor(p.stats.maxHp * 0.2); p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal); }
    if (res.type === 'exit') { this._stopBattleMusic(); var reward = Sherwood.Dungeon.complete(); this.updateDisplay(); this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.showDungeon(); }; this._showVictoryScreen({ exp: reward.exp, gold: reward.gold, silver: reward.silver }); }
    if (res.type === 'exit_locked') { this._showNotification('Locked! Kill all monsters!'); }
},

_leaveDungeon: function() { if (Sherwood.Dungeon) Sherwood.Dungeon.leave(); this._stopBattleMusic(); this._playMusic('main_theme'); this.showDungeon(); },

// ========== БОЙ (ЕДИНЫЙ) ==========
_showBattleScreen: function(enemyData, mode, modeTitle, extraInfo, onAttack, onFlee) {
    var e = enemyData, p = Sherwood.getPlayer();
    var ehp = e.maxHp > 0 ? Math.round((e.hp / e.maxHp) * 100) : 100, php = p.stats.maxHp > 0 ? Math.round((p.stats.hp / p.stats.maxHp) * 100) : 100;
    var h = '<div style="text-align:center;">';
    h += '<div style="color:#e0c080;font-size:0.85em;margin-bottom:4px;">' + modeTitle + '</div>';
    
    h += '<div style="position:relative;width:300px;height:26px;margin:2px auto;">';
    h += '<img src="assets/interface/life_scale.png" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:1;">';
    h += '<div style="position:absolute;top:3px;left:12px;right:12px;bottom:3px;overflow:hidden;z-index:0;">';
    h += '<div id="enemy-hp-bar" style="background:url(assets/interface/filling_the_poisoned_health_bar.jpeg) left/auto 100%;height:100%;width:' + ehp + '%;transition:width 0.5s ease-out;"></div>';
    h += '</div>';
    h += '<span id="enemy-hp-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.65em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;">' + e.hp + '/' + e.maxHp + '</span></div>';
    
    h += '<div style="color:#f44336;font-weight:bold;font-size:1em;">' + e.name + '</div>';
    var imgPath = (mode === 'arena') ? e.image : 'assets/all_beasts/' + e.image;
    h += '<div style="margin:4px 0;position:relative;display:inline-block;"><img src="assets/interface/frame_of_beasts.png" style="width:180px;height:180px;position:absolute;top:-8px;left:-8px;z-index:0;pointer-events:none;"><img src="' + imgPath + '" id="enemy-card" style="width:160px;height:160px;object-fit:contain;position:relative;z-index:1;border-radius:12px;transition:filter 0.15s;"></div>';
    
    var skills = Sherwood.Combat ? Sherwood.Combat.getSkills() : {};
    var unlockedSkills = [];
    for (var id in skills) { if (skills[id].unlocked) unlockedSkills.push(skills[id]); }
    
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:4px;margin:2px 0;">';
    for (var i = 0; i < Math.min(2, unlockedSkills.length); i++) {
        var sk = unlockedSkills[i];
        h += '<button onclick="SherwoodUI._useSkill(\'' + sk.id + '\')" style="background:rgba(201,168,76,0.2);border:1px solid #c9a040;border-radius:6px;width:50px;height:50px;cursor:pointer;padding:2px;"><img src="' + sk.icon + '" style="width:100%;height:100%;object-fit:contain;"><div style="color:#fff;font-size:0.4em;">' + sk.name + '</div></button>';
    }
    h += '<button onclick="' + onAttack + '" style="background:url(assets/skills/skill_shot_normal.png) center/contain no-repeat;width:60px;height:60px;border:2px solid #c9a040;border-radius:50%;cursor:pointer;"></button>';
    for (var i = 2; i < unlockedSkills.length; i++) {
        var sk = unlockedSkills[i];
        h += '<button onclick="SherwoodUI._useSkill(\'' + sk.id + '\')" style="background:rgba(201,168,76,0.2);border:1px solid #c9a040;border-radius:6px;width:50px;height:50px;cursor:pointer;padding:2px;"><img src="' + sk.icon + '" style="width:100%;height:100%;object-fit:contain;"><div style="color:#fff;font-size:0.4em;">' + sk.name + '</div></button>';
    }
    h += '</div>';
    
    h += '<div style="position:relative;width:300px;height:26px;margin:2px auto;">';
    h += '<img src="assets/interface/life_scale.png" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:1;">';
    h += '<div style="position:absolute;top:3px;left:12px;right:12px;bottom:3px;overflow:hidden;z-index:0;">';
    h += '<div id="player-hp-bar" style="background:url(assets/interface/life_interface_asset_horizontal_progress_bar.jpeg) left/auto 100%;height:100%;width:' + php + '%;transition:width 0.5s ease-out;"></div>';
    h += '</div>';
    h += '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.65em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;">HP ' + p.stats.hp + '/' + p.stats.maxHp + '</span></div>';
    
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin:2px 0;color:#aaa;font-size:0.65em;"><span style="color:#f44336;">ATK ' + p.stats.attack + '</span> <span style="color:#2196f3;">DEF ' + p.stats.defense + '</span> <span style="color:#ff9800;">AGI ' + p.stats.agility + '</span></div>';
    h += '<div id="battle-dialog" style="background:rgba(0,0,0,0.75);border:1px solid #555;border-radius:8px;padding:6px;margin:2px 8%;min-height:50px;max-height:50px;overflow-y:auto;color:#aaa;font-size:0.65em;text-align:left;line-height:1.3;"></div>';
    h += '</div>';
    this._openScreen('Battle', 'dungeon_fight', h);
},

_useSkill: function(skillId) {
    if (!Sherwood.Combat) return;
    this._playHitSounds();
    var r = Sherwood.Combat.useSkill(skillId);
    if (r && r.error) { this._showDialog(r.error, '#ff9800'); this._showCombatScreen(); return; }
    this._handleCombat(r);
},

_showDialog: function(msg, color) { var dlg = document.getElementById('battle-dialog'); if (dlg) { dlg.innerHTML += '<div style="color:' + (color||'#fff') + ';margin:1px 0;">' + msg + '</div>'; dlg.scrollTop = dlg.scrollHeight; } },
_hitEnemyCard: function() { var card = document.getElementById('enemy-card'); if (!card) return; card.style.filter = 'brightness(1.5) saturate(2.5) hue-rotate(-15deg)'; setTimeout(function() { card.style.filter = ''; }, 250); },
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
    this._showBattleScreen({ name: b.enemyName, image: b.enemyImage, hp: b.enemyHp, maxHp: b.enemyMaxHp }, "dungeon", (b.isBoss ? "BOSS: " : "") + b.enemyName, "", "SherwoodUI._combatAttack()", "SherwoodUI._combatFlee"); 
},
_combatAttack: function() { this._playHitSounds(); this._handleCombat(Sherwood.Combat.attack()); },
_combatFlee: function() { var r = Sherwood.Combat.flee(); if (r.success) { this._stopBattleMusic(); this._leaveDungeon(); return; } if (r.lose) { this._showDialog('💀 Поражение...', '#f44336'); this._stopBattleMusic(); var self = this; setTimeout(function() { self._leaveDungeon(); }, 1200); return; } this._showDialog('❌ Побег не удался! Враг: -' + r.damage, '#ff9800'); this._showCombatScreen(); },
_handleCombat: function(r) {
    if (!r) return;
    if (r.win) {
        if (Sherwood.Dungeon && Sherwood.Dungeon.killMonster) Sherwood.Dungeon.killMonster();
        if (Sherwood.Bestiary && r.enemyImage) Sherwood.Bestiary.registerKill(r.enemyImage);
        this._stopBattleMusic(); this.updateDisplay();
        this._renderDungeon();
    } else if (r.lose) {
        this._stopBattleMusic(); this.updateDisplay();
        var scrolls = Math.random() < 0.08 ? 1 : 0;
        if (scrolls) Sherwood.addResource('scrolls', scrolls);
        this._pendingRewards = { exp: Math.floor(r.exp * 0.3), silver: Math.floor(r.gold * 1.5), scrolls: scrolls };
        this._afterRewardAction = function() { SherwoodUI._leaveDungeon(); };
        this._showDefeatScreen(this._pendingRewards);
    } else {
        this._hitEnemyCard();
        this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
        this._showDialog((r.crit ? '💥 КРИТ! ' : '⚔️ ') + 'Вы нанесли ' + r.damage + ' урона', r.crit ? '#ff6a00' : '#fff');
        if (r.armorDmg) this._showDialog('🛡️ Снято брони: ' + r.armorDmg, '#2196f3');
        if (r.enemy && r.enemy.damage) { var self = this; setTimeout(function() { self._showDialog('💢 ' + (r.enemyName || 'Враг') + ' нанёс ' + r.enemy.damage + ' урона', '#f44336'); }, 700); }
        this.updateDisplay(); var self = this; setTimeout(function() { self._showCombatScreen(); }, 1000);
    }
},

    // ===== КВЕСТЫ =====
    quest: function() { this._playSound('click'); if (!Sherwood.Quests) { this._showPlaceholder('📜 Квесты','quests'); return; } var prog = Sherwood.Quests.getProgress(), chapters = Sherwood.Quests.getAllChapters(), energy = Sherwood.Quests.getEnergy(); var cooldown = Sherwood.Quests.isOnCooldown(), cdRemain = Sherwood.Quests.getCooldownRemaining(), accel = Sherwood.Quests.getAccelCost(); var currentChapter = prog.currentChapter || 1, ch = Sherwood.Quests.getChapter(currentChapter); if (!ch) { this._showPlaceholder('📜 Квесты','quests'); return; } var completed = prog.completed && prog.completed.indexOf(ch.id) !== -1, unlocked = Sherwood.Quests.isUnlocked(ch.id); var html = '<div style="text-align:center;margin-bottom:8px;"><span style="color:#ff9800;">⚡ '+energy.current+'/'+energy.max+'</span>'; if (cooldown) html += ' <span style="color:#f44336;">⏳ '+cdRemain+' мин.</span>'; html += '</div>'; if (cooldown) html += '<div style="text-align:center;margin-bottom:8px;"><button onclick="SherwoodUI._questAccel()" style="background:#ff9800;border:none;border-radius:6px;padding:6px 14px;color:#fff;cursor:pointer;font-size:0.7em;">⚡ Ускорить ('+(accel.currency==='free'?'Бесплатно':accel.cost+' 🪙')+')</button></div>'; html += '<div style="background:url(\'assets/backgrounds/skill_page.jpeg\') center/cover no-repeat;border:2px solid '+(completed?'#4caf50':unlocked?'#c9a040':'#f44336')+';border-radius:12px;padding:14px;margin-bottom:8px;position:relative;overflow:hidden;"><div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,'+(completed?'0.3':'0.5')+');z-index:0;"></div><div style="position:relative;z-index:1;"><div style="color:#e0c080;font-weight:bold;font-size:1.1em;">Глава '+ch.id+': '+ch.name+'</div><div style="color:#aaa;font-size:0.7em;margin:6px 0;">'+ch.lore+'</div><div style="text-align:center;margin:10px 0;"><img src="assets/all_beasts/'+ch.boss.image+'" style="width:200px;height:200px;object-fit:contain;border:2px solid #f44336;border-radius:12px;" onerror="this.style.display=\'none\'"><div style="color:#f44336;font-weight:bold;margin-top:4px;">'+ch.boss.name+'</div><div style="color:#aaa;font-size:0.65em;">❤️ '+ch.boss.hp+' | ⚔️ '+ch.boss.atk+' | 🛡️ '+ch.boss.def+'</div></div><div style="display:flex;justify-content:space-between;color:#aaa;font-size:0.7em;"><span>👹 Этапов: '+ch.stages+'</span><span>⚡ Энергия: '+ch.energyCost+'</span></div>'; if (unlocked && !completed && !cooldown) html += '<button onclick="SherwoodUI._startQuest('+ch.id+')" style="width:100%;margin-top:10px;background:#c9a040;border:none;border-radius:8px;padding:10px;color:#000;font-weight:bold;cursor:pointer;">⚔️ В бой</button>'; if (completed) html += '<div style="text-align:center;color:#4caf50;font-weight:bold;margin-top:8px;">✅ Пройдено</div>'; html += '</div></div><div style="display:flex;gap:6px;justify-content:center;">'; if (currentChapter>1) html += '<button onclick="SherwoodUI._prevChapter()" style="background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:6px 14px;color:#fff;cursor:pointer;font-size:0.7em;">← Пред.</button>'; if (currentChapter<15 && prog.completed.indexOf(currentChapter)!==-1) html += '<button onclick="SherwoodUI._nextChapter()" style="background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:6px 14px;color:#fff;cursor:pointer;font-size:0.7em;">След. →</button>'; html += '</div><div style="text-align:center;color:#aaa;font-size:0.6em;margin-top:4px;">Попыток сегодня: '+Sherwood.Quests.getAttemptsToday()+'</div><div id="quest-info" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:4px;"></div>'; this._openScreen('📜 Квесты','quests',html); },
    _prevChapter: function() { var p=Sherwood.getPlayer(),cur=p.questProgress.currentChapter||1; if(cur>1) p.questProgress.currentChapter=cur-1; Sherwood.saveGame(); this.quest(); },
    _nextChapter: function() { var p=Sherwood.getPlayer(),cur=p.questProgress.currentChapter||1; if(cur<15&&p.questProgress.completed.indexOf(cur)!==-1) p.questProgress.currentChapter=cur+1; Sherwood.saveGame(); this.quest(); },
    _questAccel: function() { var r=Sherwood.Quests.accelerate(); if(!r.success) { var info=document.getElementById('quest-info'); if(info) info.textContent='❌ '+r.reason; return; } this.quest(); },
    _startQuest: function(id) { var r=Sherwood.Quests.startChapter(id),info=document.getElementById('quest-info'); if(!r.success) { if(info) info.textContent='❌ '+(r.reason||'Ошибка'); if(r.cooldown) this.quest(); return; } this._stopMusic(); this._showQuestBattle(); },
    _showQuestBattle: function() { var b=Sherwood.Quests.getBattle(); if(!b) { this.quest(); return; } var e=b.enemy; this._showBattleScreen({ name:e.name, image:e.image, hp:e.hp, maxHp:e.maxHp },'quest','📜 Глава '+b.chapter.id+' — Этап '+b.stage+'/'+b.total,'','SherwoodUI._questAttack()','SherwoodUI._questFlee()'); },
    _questAttack: function() { this._playHitSounds(); this._handleQuestResult(Sherwood.Quests.attack()); },
    _questFlee: function() { this._stopBattleMusic(); Sherwood.Quests.flee(); this.quest(); },
    _handleQuestResult: function(r) {
        if (!r) return;
        if (r.enemyDead) {
            var b = Sherwood.Quests.getBattle();
            if (b && b.enemy && b.enemy.image) {
                if (Sherwood.Bestiary) Sherwood.Bestiary.registerKill(b.enemy.image);
            }
            this._showDialog('✅ Враг повержен!','#4caf50');
            this.updateDisplay();
            if (r.chapterComplete) {
                this._showDialog('🎉 Глава пройдена! +'+r.rewards.exp+'XP +'+r.rewards.gold+'🪙','#ffd700');
                this._playSound('victory');
                this._stopBattleMusic();
                var scrolls = Math.random() < 0.25 ? 1 + Math.floor(Math.random() * 3) : 0;
                if (scrolls) Sherwood.addResource('scrolls', scrolls);
                this._pendingRewards = { exp: r.rewards.exp, gold: r.rewards.gold, silver: r.rewards.silver, scrolls: scrolls };
                this._afterRewardAction = function() { SherwoodUI._playMusic('forest_ambient'); SherwoodUI.quest(); };
                this._showVictoryScreen(this._pendingRewards);
            } else {
                var self = this;
                setTimeout(function() { self._showQuestBattle(); }, 1200);
            }
        } else if (r.playerDead) {
            this._showDialog('💀 Поражение...','#f44336');
            this._playSound('defeat');
            this._stopBattleMusic();
            var scrolls = Math.random() < 0.08 ? 1 : 0;
            if (scrolls) Sherwood.addResource('scrolls', scrolls);
            this._pendingRewards = { exp: Math.floor(r.rewards ? r.rewards.exp * 0.3 : 10), silver: Math.floor(r.rewards ? r.rewards.silver * 0.5 : 50), scrolls: scrolls };
            this._afterRewardAction = function() { SherwoodUI.quest(); };
            this._showDefeatScreen(this._pendingRewards);
        } else {
            this._hitEnemyCard();
            this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
            this._showDialog((r.crit ? '💥 КРИТ! ' : '⚔️ ') + 'Вы нанесли ' + r.damage + ' урона', r.crit ? '#ff6a00' : '#fff');
            if (r.enemyDamage) {
                var self = this;
                setTimeout(function() { self._showDialog('💢 Враг нанёс ' + r.enemyDamage + ' урона', '#f44336'); }, 700);
            }
            var self = this;
            setTimeout(function() { self._showQuestBattle(); }, 1000);
        }
    },

    // ===== ТАВЕРНА =====
    tavern: function() {
        this._playSound('click');
        this._playMusic('tavern_ambient');
        if (!Sherwood.Tavern) { this._showPlaceholder('🍺 Таверна','tavern'); return; }
        var rows = Sherwood.Tavern.getAvailableRows ? Sherwood.Tavern.getAvailableRows() : [];
        var active = Sherwood.Tavern.getCurrentQuest ? Sherwood.Tavern.getCurrentQuest() : null;
        var cooldown = Sherwood.Tavern.isOnCooldown ? Sherwood.Tavern.isOnCooldown() : false;
        var cdRemain = Sherwood.Tavern.getCooldownRemaining ? Sherwood.Tavern.getCooldownRemaining() : 0;
        var battleMode = Sherwood.Tavern.getBattleMode ? Sherwood.Tavern.getBattleMode() : false;
        var html = '';
        if (active && active.quest && active.row) {
            var q = active.quest;
            html += '<div style="background:rgba(0,0,0,0.6);border:2px solid #c9a040;border-radius:10px;padding:14px;margin-bottom:12px;"><div style="display:flex;align-items:center;gap:10px;"><img src="assets/interface/old_huntsman_bertram.png" style="width:80px;height:80px;object-fit:contain;" onerror="this.style.display=\'none\'"><div style="color:#ffd700;font-weight:bold;">⚔️ ' + active.row.npc + '</div></div><div style="color:#fff;font-size:0.9em;">' + q.name + '</div><div style="color:#aaa;font-size:0.7em;">' + q.desc + '</div><div style="color:#f44336;font-size:0.7em;margin-top:4px;">Противник: ' + q.enemy.name + ' (❤️' + q.enemy.hp + ')</div><div style="color:#aaa;font-size:0.7em;">Режим: ' + (battleMode ? '⚔️ Ручной бой' : '⚡ Автобой') + '</div><div style="display:flex;gap:8px;margin-top:8px;">';
            if (battleMode) html += '<button onclick="SherwoodUI._tavernBattle()" style="background:#c9a040;border:none;border-radius:6px;padding:8px 16px;color:#000;cursor:pointer;">⚔️ В бой</button>';
            else html += '<button onclick="SherwoodUI._tavernAuto()" style="background:#4caf50;border:none;border-radius:6px;padding:8px 16px;color:#fff;cursor:pointer;">⚡ Автобой</button>';
            html += '<button onclick="SherwoodUI._tavernCancel()" style="background:rgba(244,67,54,0.2);border:1px solid #f44336;border-radius:6px;padding:8px 12px;color:#f44336;cursor:pointer;">Отменить</button></div></div>';
        }
        if (cooldown) html += '<div style="text-align:center;color:#ff9800;padding:12px;background:rgba(0,0,0,0.4);border-radius:8px;margin-bottom:12px;">⏳ Перезарядка: ' + cdRemain + ' мин.</div>';
        if (!active && !cooldown) {
            for (var r = 0; r < rows.length; r++) {
                var row = rows[r];
                if (!row || !row.quests) continue;
                html += '<div style="margin-bottom:12px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><img src="assets/interface/old_huntsman_bertram.png" style="width:60px;height:60px;object-fit:contain;" onerror="this.style.display=\'none\'"><div><div style="color:#e0c080;font-weight:bold;">📜 ' + row.name + '</div><div style="color:#aaa;font-size:0.7em;">' + row.npc + '</div></div></div>';
                for (var q = 0; q < row.quests.length; q++) {
                    var quest = row.quests[q];
                    html += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;"><div><div style="color:#e0c080;font-size:0.85em;">' + quest.name + '</div><div style="color:#aaa;font-size:0.65em;">' + quest.desc + '</div><div style="color:#f44336;font-size:0.6em;">Противник: ' + quest.enemy.name + '</div><div style="color:#ffd700;font-size:0.6em;">🏆 +' + quest.reward.exp + 'XP +' + quest.reward.gold + '🪙</div></div><button onclick="SherwoodUI._tavernStart(' + r + ',' + q + ')" style="background:#c9a040;border:none;border-radius:4px;padding:6px 12px;color:#000;cursor:pointer;font-size:0.7em;">Взять</button></div>';
                }
                html += '</div>';
            }
        }
        html += '<div style="text-align:center;color:#aaa;font-size:0.7em;margin-top:4px;">✅ Всего: ' + (Sherwood.Tavern.getCompletedCount ? Sherwood.Tavern.getCompletedCount() : 0) + ' | След: ' + (battleMode ? '⚔️ Бой' : '⚡ Авто') + '</div><div id="tavern-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:4px;"></div>';
        this._openScreen('🍺 Таверна', 'tavern', html);
    },
    _tavernStart: function(r, q) {
        var result = Sherwood.Tavern.startQuest(r, q);
        if (!result || !result.success) {
            var log = document.getElementById('tavern-log');
            if (log) log.textContent = '❌ ' + (result ? result.reason : 'Ошибка');
            return;
        }
        if (result.mode === 'battle') { this._stopMusic(); this._showTavernBattle(); }
        else this._tavernAuto();
    },
    _tavernBattle: function() { this._stopMusic(); this._showTavernBattle(); },
    _showTavernBattle: function() {
        var active = Sherwood.Tavern.getCurrentQuest ? Sherwood.Tavern.getCurrentQuest() : null;
        if (!active || !active.quest || !active.row) {
            this.tavern();
            return;
        }
        var e = active.quest.enemy;
        if (!e.maxHp) e.maxHp = e.hp || 100;
        this._showBattleScreen(
            { name: e.name, image: e.image, hp: e.hp || 100, maxHp: e.maxHp },
            'tavern',
            '🍺 ' + active.row.npc + ' — ' + active.quest.name,
            '',
            'SherwoodUI._tavernBattleAttack()',
            'SherwoodUI._tavernCancel()'
        );
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
            this._showDialog('🏆 Победа! +' + r.reward.exp + 'XP +' + r.reward.gold + '🪙', '#ffd700');
            this._stopBattleMusic();
            this.updateDisplay();
            var self = this;
            setTimeout(function() { self._playMusic('tavern_ambient'); self.tavern(); }, 1500);
        } else {
            var edmg = Math.max(1, Math.floor((e.atk * e.atk) / (e.atk + p.stats.defense)));
            p.stats.hp = Math.max(0, p.stats.hp - edmg);
            this._hitEnemyCard();
            this._updateEnemyHP(e.hp, e.maxHp);
            this._showDialog((crit ? '💥 КРИТ! ' : '⚔️ ') + 'Вы нанесли ' + dmg + ' урона', crit ? '#ff6a00' : '#fff');
            if (p.stats.hp <= 0) {
                var self = this;
                setTimeout(function() { self._showDialog('💀 Поражение...', '#f44336'); }, 700);
                Sherwood.Tavern.failQuest();
                p.stats.hp = 1;
                this._stopBattleMusic();
                setTimeout(function() { self._playMusic('tavern_ambient'); self.tavern(); }, 1500);
            } else {
                var self = this;
                setTimeout(function() { self._showDialog('💢 Враг нанёс ' + edmg + ' урона', '#f44336'); }, 700);
                setTimeout(function() { self._showTavernBattle(); }, 1200);
            }
        }
        this.updateDisplay();
    },
    _tavernAuto: function() {
        var r = Sherwood.Tavern.autoBattle ? Sherwood.Tavern.autoBattle() : { completed: false };
        var log = document.getElementById('tavern-log');
        if (r.completed) {
            if (log) log.textContent = '🎉 Выполнено! +' + r.reward.exp + 'XP';
            this.updateDisplay();
        } else if (r.failed) {
            if (log) log.textContent = '❌ Неудача! -' + r.damage + ' HP';
        }
        var self = this;
        setTimeout(function() { self.tavern(); }, 800);
    },
    _tavernCancel: function() {
        this._stopBattleMusic();
        if (Sherwood.Tavern.cancelQuest) Sherwood.Tavern.cancelQuest();
        this._playMusic('tavern_ambient');
        this.tavern();
    },

    // ===== ЕЖЕДНЕВНЫЕ =====
    daily: function() { this._playSound('click'); if (!Sherwood.Daily) { this._showPlaceholder('📋 Ежедневные задания','daily'); return; } var dailyQuests=Sherwood.Daily.getDailyQuests(),dailyCompleted=Sherwood.Daily.getDailyCompleted(),p=Sherwood.getPlayer(),currentChapter=p.questProgress?(p.questProgress.currentChapter||1):1,chapterQuests=Sherwood.Daily.getChapterQuests(currentChapter),chapterCompleted=p.daily?(p.daily.chapterCompleted||[]):[],html=''; var t1b=(!SherwoodUI._dailyTab||SherwoodUI._dailyTab===1)?'#c9a040':'rgba(255,255,255,0.1)',t1c=(!SherwoodUI._dailyTab||SherwoodUI._dailyTab===1)?'#000':'#fff',t2b=(SherwoodUI._dailyTab===2)?'#c9a040':'rgba(255,255,255,0.1)',t2c=(SherwoodUI._dailyTab===2)?'#000':'#fff'; html+='<div style="display:flex;gap:4px;margin-bottom:12px;"><button onclick="SherwoodUI._dailyTab=1;SherwoodUI.daily();" style="flex:1;background:'+t1b+';border:1px solid #555;border-radius:6px;padding:8px;color:'+t1c+';cursor:pointer;font-size:0.8em;">📋 Ежедневные</button><button onclick="SherwoodUI._dailyTab=2;SherwoodUI.daily();" style="flex:1;background:'+t2b+';border:1px solid #555;border-radius:6px;padding:8px;color:'+t2c+';cursor:pointer;font-size:0.8em;">📜 Глава '+currentChapter+'</button></div>'; if (!SherwoodUI._dailyTab||SherwoodUI._dailyTab===1) { for (var i=0;i<dailyQuests.length;i++) { var q=dailyQuests[i],claimed=dailyCompleted.indexOf(q.id)!==-1; html+='<div style="background:rgba(0,0,0,0.5);border:1px solid '+(q.completed?(claimed?'#4caf50':'#ffd700'):'#555')+';border-radius:8px;padding:10px;margin-bottom:6px;"><div style="color:#e0c080;font-size:0.85em;">'+q.name+'</div><div style="color:#aaa;font-size:0.65em;">'+q.desc+'</div><div style="background:rgba(0,0,0,0.3);border-radius:4px;height:8px;margin:6px 0;overflow:hidden;"><div style="background:'+(q.completed?'#4caf50':'#c9a040')+';height:100%;width:'+Math.round((q.progress||0)/q.target*100)+'%;"></div></div><div style="color:#aaa;font-size:0.6em;">'+(q.progress||0)+'/'+q.target+' | 🏆 +'+q.reward.gold+'🪙 +'+q.reward.exp+'XP</div>'; if(q.completed&&!claimed) html+='<button onclick="SherwoodUI._claimDaily('+i+')" style="margin-top:4px;background:#4caf50;border:none;border-radius:4px;padding:4px 10px;color:#fff;cursor:pointer;font-size:0.6em;">Забрать</button>'; if(claimed) html+='<span style="color:#4caf50;font-size:0.6em;">✅ Получено</span>'; html+='</div>'; } } else { for (var j=0;j<chapterQuests.length;j++) { var q=chapterQuests[j],claimed=chapterCompleted.indexOf(q.id)!==-1; html+='<div style="background:rgba(0,0,0,0.5);border:1px solid '+(q.completed?(claimed?'#4caf50':'#ffd700'):'#555')+';border-radius:8px;padding:10px;margin-bottom:6px;"><div style="color:#e0c080;font-size:0.85em;">'+q.name+'</div><div style="color:#aaa;font-size:0.65em;">'+q.desc+'</div><div style="background:rgba(0,0,0,0.3);border-radius:4px;height:8px;margin:6px 0;overflow:hidden;"><div style="background:'+(q.completed?'#4caf50':'#c9a040')+';height:100%;width:'+Math.round((q.progress||0)/q.target*100)+'%;"></div></div><div style="color:#aaa;font-size:0.6em;">'+(q.progress||0)+'/'+q.target+' | 🏆 +'+q.reward.gold+'🪙 +'+q.reward.exp+'XP</div>'; if(q.completed&&!claimed) html+='<button onclick="SherwoodUI._claimChapter('+currentChapter+','+j+')" style="margin-top:4px;background:#4caf50;border:none;border-radius:4px;padding:4px 10px;color:#fff;cursor:pointer;font-size:0.6em;">Забрать</button>'; if(claimed) html+='<span style="color:#4caf50;font-size:0.6em;">✅ Получено</span>'; html+='</div>'; } } html+='<div id="daily-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:4px;"></div>'; this._openScreen('📋 Задания','daily',html); },
    _claimDaily: function(i) { var r=Sherwood.Daily.claimDailyReward(i),log=document.getElementById('daily-log'); if(r.success) { if(log) log.textContent='✅ Награда получена!'; this.updateDisplay(); } else { if(log) log.textContent='❌ '+r.reason; } var self=this; setTimeout(function(){self.daily();},800); },
    _claimChapter: function(ch,i) { var r=Sherwood.Daily.claimChapterReward(ch,i),log=document.getElementById('daily-log'); if(r.success) { if(log) log.textContent='✅ Награда получена!'; this.updateDisplay(); } else { if(log) log.textContent='❌ '+r.reason; } var self=this; setTimeout(function(){self.daily();},800); },

    // ===== ПОРТАЛЫ =====
    portal: function() { this._playSound('click'); if(!Sherwood.Portal) { this._showPlaceholder('🌀 Порталы','portal'); return; } if(Sherwood.Portal.isInPortal()) { this._showPortalBattle(); return; } var portals=Sherwood.Portal.getAllPortals(),player=Sherwood.getPlayer(),h=''; for (var i=0;i<portals.length;i++) { var p=portals[i],check=Sherwood.Portal.canEnter(p.id),unlocked=Sherwood.Portal.isPortalUnlocked(p.id),completed=player.portal&&player.portal.completed&&player.portal.completed.indexOf(p.id)!==-1,badge='',bo='0.4',bc='#555',ca=''; if(completed) { badge='<span style="color:#4caf50;">✅</span>'; bo='0.3'; bc='#4caf50'; } else if(check.can) { badge='<span style="color:#ffd700;">⚔️</span>'; bo='0.6'; bc='#c9a040'; ca='onclick="SherwoodUI._enterPortal('+p.id+')" style="cursor:pointer;"'; } else if(!unlocked) { badge='<span style="color:#f44336;">🔒</span>'; bo='0.2'; bc='#f44336'; } else { badge='<span style="color:#ff9800;">⚠️ АТК '+p.statRequirement.attack+'+ ЗЩТ '+p.statRequirement.defense+'+</span>'; } h+='<div '+ca+' style="background:url(\''+p.bg+'\') center/cover no-repeat;border:2px solid '+bc+';border-radius:10px;padding:12px;margin-bottom:8px;position:relative;overflow:hidden;"><div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,'+bo+');z-index:0;"></div><div style="position:relative;z-index:1;display:flex;align-items:center;gap:10px;"><div style="font-size:2em;">'+p.icon+'</div><div style="flex:1;"><div style="color:#e0c080;font-weight:bold;">'+p.name+'</div><div style="color:#aaa;font-size:0.7em;">'+p.enemies.length+' врагов | 3 часа</div>'+badge+'</div></div></div>'; } this._openScreen('🌀 Порталы','portal',h||'<div style="color:#aaa;text-align:center;">Нет порталов</div>'); },
    _enterPortal: function(id) { var r=Sherwood.Portal.enterPortal(id); if(!r.success) return; this._stopMusic(); this._playSound('dungeon_enter'); this._showPortalBattle(); },
    _showPortalBattle: function() { var b=Sherwood.Portal.getCurrentBattle(); if(!b) { this.portal(); return; } var e=b.enemy,ehp=Math.round(((e.hp||e.maxHp)/(e.maxHp||1))*100),tm=Math.floor(b.timeRemaining/60),ts=b.timeRemaining%60,h='<div style="text-align:center;"><div style="color:#aaa;font-size:0.7em;">⏱️ '+tm+':'+(ts<10?'0':'')+ts+' | 💀 '+b.deathCount+'</div><div style="color:#e0c080;">'+b.portal.name+' — '+b.level+'/'+b.totalLevels+'</div><div style="margin:12px 0;"><div style="font-size:4em;">'+(e.isBoss?'👑':'👹')+'</div><div style="color:#f44336;font-weight:bold;">'+e.name+'</div><div style="background:rgba(0,0,0,0.5);border-radius:6px;height:14px;margin:4px 20%;overflow:hidden;"><div style="background:#f44336;height:100%;width:'+ehp+'%;"></div></div><div style="color:#aaa;">❤️ '+Math.max(0,e.hp||e.maxHp)+'/'+(e.maxHp||'?')+'</div></div><div style="color:#4caf50;">❤️ '+Sherwood.getPlayer().stats.hp+'</div><button onclick="SherwoodUI._portalAttack()" style="background:#c9a040;border:none;border-radius:8px;padding:10px 24px;color:#000;font-weight:bold;cursor:pointer;margin:4px;">⚔️ Атака</button><button onclick="SherwoodUI._portalFlee()" style="margin-top:6px;background:rgba(244,67,54,0.2);border:1px solid #f44336;border-radius:6px;padding:6px 16px;color:#f44336;cursor:pointer;font-size:0.7em;">🏃 Бежать</button><div id="portal-log" style="color:#aaa;font-size:0.75em;margin-top:8px;"></div></div>'; this._openScreen('🌀 Портал','portal',h); },
    _portalAttack: function() { this._handlePortalResult(Sherwood.Portal.portalAttack()); },
    _handlePortalResult: function(r) { if(!r) return; var log=document.getElementById('portal-log'); if(r.portalComplete) { if(log) log.textContent='🎉 Портал пройден!'; this._stopBattleMusic(); this.updateDisplay(); var self=this; setTimeout(function(){self._playMusic('forest_ambient');self.portal();},2000); } else if(r.portalFailed) { if(log) log.textContent='💀 Провал!'; this._stopBattleMusic(); var self=this; setTimeout(function(){self._playMusic('forest_ambient');self.portal();},2000); } else if(r.dead&&r.resurrected) { if(log) log.textContent='💀 Смерть #'+r.deathCount+'! Выкуп: '+r.cost.cost+' '+r.cost.currency; this.updateDisplay(); this._showPortalBattle(); } else if(r.enemyDead) { if(log) log.textContent='✅ Враг повержен!'; this.updateDisplay(); if(r.nextEnemy) { var self=this; setTimeout(function(){self._showPortalBattle();},1000); } } else { if(log) log.textContent='-'+r.damage+' | Враг: -'+(r.enemyDamage||0); this.updateDisplay(); this._showPortalBattle(); } },
    _portalFlee: function() { this._stopBattleMusic(); Sherwood.Portal.fleePortal(); this._playMusic('forest_ambient'); this.portal(); },

    // ===== РЕЙД =====
    raid: function() { this._playSound('click'); if(!Sherwood.Raid) { this._showPlaceholder('⚔️ Рейд','raid'); return; } if(Sherwood.Raid.isRaidActive()) { this._showRaidBattle(); return; } var raids=Sherwood.Raid.getAvailableRaids(),check=Sherwood.Raid.canJoinRaid(),h=''; for (var i=0;i<raids.length;i++) { var r=raids[i]; h+='<div style="background:rgba(0,0,0,0.5);border:2px solid '+(check.can?'#c9a040':'#f44336')+';border-radius:10px;padding:14px;margin-bottom:8px;text-align:center;"><div style="color:#e0c080;font-weight:bold;">'+r.name+'</div><div style="color:#aaa;">❤️ '+r.maxHp+' | ⚔️ '+r.attack+' | 3 этапа</div>'+(check.can?'<button onclick="SherwoodUI._startRaid('+i+')" style="margin-top:8px;background:#c9a040;border:none;border-radius:6px;padding:8px 20px;color:#000;font-weight:bold;cursor:pointer;">В бой!</button>':'<div style="color:#f44336;">'+check.reason+'</div>')+'</div>'; } this._openScreen('⚔️ Рейд','raid',h||'<div style="color:#aaa;text-align:center;">Нет рейдов</div>'); },
    _startRaid: function(i) { this._stopMusic(); Sherwood.Raid.startRaid(i); this._playSound('dungeon_enter'); this._showRaidBattle(); },
    _showRaidBattle: function() { var s=Sherwood.Raid.getRaidStatus(); if(!s) { this.raid(); return; } var stage=s.stage,enemy=null; for (var i=0;i<stage.enemies.length;i++) { if(stage.enemies[i].hp>0) { enemy=stage.enemies[i]; break; } } if(!enemy) { this._raidAttack(); return; } this._showBattleScreen({ name:enemy.name, image:enemy.image, hp:enemy.hp, maxHp:enemy.maxHp },'raid','⚔️ '+s.boss.name+' — Этап '+s.stageIndex+'/'+s.totalStages,'','SherwoodUI._raidAttack()','SherwoodUI._raidFlee()'); },
    _raidAttack: function() { this._playHitSounds(); var r=Sherwood.Raid.raidAttack(); if(!r) return; if(r.raidComplete) { this._showDialog('🎉 Рейд пройден! +'+r.rewards.exp+'XP +'+r.rewards.gold+'🪙','#ffd700'); this._stopBattleMusic(); this.updateDisplay(); var scrolls=Math.random()<0.3?1+Math.floor(Math.random()*3):0; if(scrolls) Sherwood.addResource('scrolls',scrolls); this._pendingRewards={exp:r.rewards.exp,gold:r.rewards.gold,silver:r.rewards.silver,scrolls:scrolls}; this._afterRewardAction=function(){SherwoodUI._playMusic('forest_ambient');SherwoodUI.raid();}; this._showVictoryScreen(this._pendingRewards); } else if(r.stageComplete) { this._showDialog('✅ Этап пройден!','#4caf50'); var self=this; setTimeout(function(){self._showRaidBattle();},1200); } else if(r.playerDead) { this._showDialog('💀 Вы погибли!','#f44336'); this._stopBattleMusic(); var scrolls=Math.random()<0.08?1:0; if(scrolls) Sherwood.addResource('scrolls',scrolls); this._pendingRewards={exp:Math.floor(50),silver:Math.floor(100),scrolls:scrolls}; this._afterRewardAction=function(){SherwoodUI._playMusic('forest_ambient');SherwoodUI.raid();}; this._showDefeatScreen(this._pendingRewards); } else { this._hitEnemyCard(); this._updateEnemyHP(r.enemyHp,r.enemyMaxHp); this._showDialog((r.crit?'💥 КРИТ! ':'⚔️ ')+'Вы нанесли '+r.damage+' урона',r.crit?'#ff6a00':'#fff'); if(r.enemyDamage) { var self=this; setTimeout(function(){self._showDialog('💢 Враг нанёс '+r.enemyDamage+' урона','#f44336');},700); } this.updateDisplay(); var self=this; setTimeout(function(){self._showRaidBattle();},1000); } },
    _raidFlee: function() { this._stopBattleMusic(); Sherwood.Raid.fleeRaid(); this._playMusic('forest_ambient'); this.raid(); },

    // ===== АРЕНА =====
    arena: function() { this._playSound('click'); if(!Sherwood.Arena) { this._showPlaceholder('🏟️ Арена','arena'); return; } if(Sherwood.Arena.isInMatch()) { this._showArenaMatch(); return; } var opps=Sherwood.Arena.getOpponents(),stats=Sherwood.Arena.getStats(),h='<div style="text-align:center;margin-bottom:8px;color:#e0c080;">🏆 '+stats.rank+' | 🏅 '+stats.wins+' | 💀 '+stats.losses+'</div>'; for (var i=0;i<opps.length;i++) { var o=opps[i]; var skinFile = o.skin || 'assets/hero_skins/skin_1_basic.png'; h+='<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:10px;"><img src="'+skinFile+'" style="width:40px;height:40px;border-radius:50%;" onerror="this.src=\'assets/hero_skins/skin_1_basic.png\'"><div style="flex:1;"><div style="color:#fff;">'+o.name+'</div><div style="color:#aaa;font-size:0.7em;">⚔️'+o.stats.attack+' 🛡️'+o.stats.defense+' ❤️'+o.stats.maxHp+'</div></div><button onclick="SherwoodUI._startArenaMatch('+o.id+')" style="background:#c9a040;border:none;border-radius:4px;padding:6px 12px;color:#000;cursor:pointer;font-size:0.7em;">Бой</button></div>'; } h+='<button onclick="SherwoodUI._refreshArena()" style="width:100%;margin-top:8px;background:rgba(255,255,255,0.1);border:1px solid #666;border-radius:6px;padding:8px;color:#fff;cursor:pointer;">🔄 Обновить</button>'; this._openScreen('🏟️ Арена','arena',h); },
    _startArenaMatch: function(i) { this._stopMusic(); Sherwood.Arena.startMatch(i); this._showArenaMatch(); },
    _refreshArena: function() { Sherwood.Arena.refreshOpponents(); this.arena(); },
    _showArenaMatch: function() {
        var m = Sherwood.Arena.getCurrentMatch(); if (!m) { this.arena(); return; }
        var o = m.opponent, p = m.player;
        this._showBattleScreen(
            { name: o.name, image: o.skin, hp: o.stats.hp, maxHp: o.stats.maxHp },
            'arena',
            '🏟️ Арена — ' + o.name,
            '',
            'SherwoodUI._arenaAttack()',
            'SherwoodUI._arenaFlee()'
        );
    },
    _arenaAttack: function() {
        this._playHitSounds();
        var r = Sherwood.Arena.arenaAttack();
        var log = document.getElementById('arena-log');
        if (!r) {
            if (log) log.textContent = '❌ Ошибка боя';
            return;
        }
        if (r.win) {
            this._showDialog('🏆 Победа! +' + (r.rewards ? r.rewards.exp : 0) + 'XP', '#ffd700');
            this._stopBattleMusic();
            this.updateDisplay();
            var self = this;
            setTimeout(function() { self._playMusic('forest_ambient'); self.arena(); }, 1500);
        } else if (r.win === false) {
            this._showDialog('💀 Поражение', '#f44336');
            this._stopBattleMusic();
            var self = this;
            setTimeout(function() { self._playMusic('forest_ambient'); self.arena(); }, 1500);
        } else {
            this._hitEnemyCard();
            this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
            this._showDialog((r.crit ? '💥 КРИТ! ' : '⚔️ ') + 'Вы нанесли ' + r.playerDamage + ' урона', r.crit ? '#ff6a00' : '#fff');
            if (r.opponentDamage) {
                var self = this;
                setTimeout(function() { self._showDialog('💢 Враг нанёс ' + r.opponentDamage + ' урона', '#f44336'); }, 700);
            }
            this.updateDisplay();
            this._showArenaMatch();
        }
    },
    _arenaFlee: function() { this._stopBattleMusic(); Sherwood.Arena.fleeMatch(); this._playMusic('forest_ambient'); this.arena(); },

    // ========== НАСТРОЙКИ / ЧАТ / РЫНОК / ПРОФИЛЬ / СУМКА ==========
    settings: function() { this._playSound('click'); var p=Sherwood.getPlayer(),nm=p?p.name:'Охотник',h='<div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;"><div style="color:#fff;margin-bottom:8px;">👤 Имя</div><div style="display:flex;gap:8px;"><input id="pni" value="'+nm+'" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:8px 12px;color:#fff;font-family:\'Georgia\',serif;font-size:0.9em;"><button onclick="SherwoodUI._changePlayerName()" style="background:#c9a040;border:none;border-radius:6px;padding:8px 16px;color:#000;font-weight:bold;cursor:pointer;">Сохранить</button></div><div id="name-status" style="color:#aaa;font-size:0.7em;margin-top:4px;"></div></div><div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;"><span style="color:#fff;">🔊 Звуки</span><label style="position:relative;width:50px;height:26px;background:'+(this._soundEnabled?'#4caf50':'#555')+';border-radius:13px;cursor:pointer;"><input type="checkbox" '+(this._soundEnabled?'checked':'')+' onchange="SherwoodUI._toggleSound(this.checked)" style="display:none;"><span style="position:absolute;top:2px;left:'+(this._soundEnabled?'26px':'2px')+';width:22px;height:22px;background:#fff;border-radius:50%;transition:0.2s;"></span></label></div><div style="display:flex;justify-content:space-between;align-items:center;"><span style="color:#fff;">🎵 Музыка</span><label style="position:relative;width:50px;height:26px;background:'+(this._musicEnabled?'#4caf50':'#555')+';border-radius:13px;cursor:pointer;"><input type="checkbox" '+(this._musicEnabled?'checked':'')+' onchange="SherwoodUI._toggleMusic(this.checked)" style="display:none;"><span style="position:absolute;top:2px;left:'+(this._musicEnabled?'26px':'2px')+';width:22px;height:22px;background:#fff;border-radius:50%;transition:0.2s;"></span></label></div></div><button onclick="SherwoodUI._exitGame()" style="width:100%;background:#f44336;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;">🚪 Выйти</button>'; this._openScreen('⚙️ Настройки','settings',h); },
    _changePlayerName: function() { var inp=document.getElementById('pni'),st=document.getElementById('name-status'); if(!inp||!st) return; var nm=inp.value.trim(); if(!nm) { st.textContent='❌ Пустое имя'; st.style.color='#f44336'; return; } var p=Sherwood.getPlayer(); if(p) { p.name=nm; Sherwood.saveGame(); if(Sherwood.Chat) Sherwood.Chat.setUsername(nm); st.textContent='✅ Сохранено!'; st.style.color='#4caf50'; } },
    _toggleSound: function(en) { this._soundEnabled=en; this._saveAudioSettings(); if(!en) for(var k in this._sounds) { this._sounds[k].pause(); this._sounds[k].currentTime=0; } this.settings(); },
    _toggleMusic: function(en) { this._musicEnabled=en; this._saveAudioSettings(); if(!en) { this._stopMusic(); this._stopBattleMusic(); } else this._playMusic('forest_ambient'); this.settings(); },
    _exitGame: function() { if(confirm('Выйти в главное меню?')) { if(Sherwood.saveGameNow) Sherwood.saveGameNow(); else if(Sherwood.saveGame) Sherwood.saveGame(); this._stopMusic(); this._stopBattleMusic(); if(this._screenLayer) { this._screenLayer.style.display='none'; this._screenLayer.innerHTML=''; } if(this._mainElements) this._mainElements.forEach(function(sel){document.querySelectorAll(sel).forEach(function(el){el.style.display='';});}); this.container.style.background=''; document.getElementById('mainInterface').classList.remove('active'); document.getElementById('loadingScreen').classList.remove('hidden'); this.updateDisplay(); } },
    chat: function() { this._playSound('click'); if(!Sherwood.Chat) { this._showPlaceholder('💬 Чат','chat'); return; } var msgs=Sherwood.Chat.getRecentMessages(50),h=''; for (var i=0;i<msgs.length;i++) { var m=msgs[i]; if(m.isSystem) h+='<div style="color:#888;font-size:0.75em;text-align:center;margin:4px 0;">['+m.time+'] '+m.text+'</div>'; else { var me=m.sender===Sherwood.Chat.getUsername(); h+='<div style="margin-bottom:6px;display:flex;flex-direction:column;align-items:'+(me?'flex-end':'flex-start')+';"><div style="color:#c9a040;font-size:0.65em;">'+m.sender+' <span style="color:#666;">'+m.time+'</span></div><div style="background:'+(me?'rgba(201,168,76,0.2)':'rgba(255,255,255,0.08)')+';border-radius:8px;padding:6px 10px;color:#ddd;font-size:0.8em;max-width:80%;word-break:break-word;">'+m.text+'</div></div>'; } } var c='<div style="display:flex;flex-direction:column;height:100%;"><div id="chat-msgs" style="flex:1;background:rgba(0,0,0,0.5);border-radius:8px;padding:12px;margin-bottom:8px;overflow-y:auto;color:#ccc;font-size:0.85em;min-height:300px;">'+(h||'<div style="color:#666;text-align:center;">Пусто</div>')+'</div><div style="display:flex;gap:8px;"><input id="chat-input" placeholder="Сообщение..." style="flex:1;background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:8px;padding:10px;color:#fff;font-family:\'Georgia\',serif;font-size:0.85em;" onkeydown="if(event.key===\'Enter\')SherwoodUI._sendChat()"><button onclick="SherwoodUI._sendChat()" style="background:transparent;border:none;cursor:pointer;padding:0;width:44px;height:44px;"><img src="assets/all_buttons/send_text.png" style="width:100%;height:100%;object-fit:contain;"></button></div></div>'; this._openScreen('💬 Чат','chat',c); setTimeout(function(){var el=document.getElementById('chat-msgs');if(el)el.scrollTop=el.scrollHeight;},100); },
    _sendChat: function() { var inp=document.getElementById('chat-input'); if(!inp) return; var t=inp.value.trim(); if(!t) return; inp.value=''; Sherwood.Chat.sendMessage(t); this.chat(); },
    market: function() { this._playSound('click'); if(!Sherwood.BlackMarket) { this._showPlaceholder('💰 Рынок','market'); return; } var items=Sherwood.BlackMarket.getShopItems(),h=''; for (var i=0;i<items.length;i++) { var item=items[i]; h+='<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px;margin-bottom:6px;display:flex;align-items:center;gap:10px;"><img src="'+item.icon+'" style="width:44px;height:44px;border-radius:4px;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'"><div style="flex:1;"><div style="color:#e0c080;">'+item.name+'</div><div style="color:#aaa;font-size:0.7em;">'+(item.type==='consumable'?'Расходник':item.type==='resource'?'Ресурс':'Экипировка')+'</div></div><div style="text-align:right;"><div style="color:'+(item.currency==='gold'?'#ffd700':'#c0c0c0')+';">'+item.price+' '+(item.currency==='gold'?'🪙':'⚪')+'</div><button onclick="SherwoodUI._buyItem('+item.shopIndex+')" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Купить</button></div></div>'; } this._openScreen('💰 Рынок','market',(h||'<div style="color:#aaa;text-align:center;">Товаров нет</div>')+'<div id="market-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:8px;"></div>'); },
    _buyItem: function(i) { var r=Sherwood.BlackMarket.buyItem(i),log=document.getElementById('market-log'); if(r.success) { if(log) log.textContent='✅ Куплено!'; this.updateDisplay(); } else { if(log) log.textContent='❌ '+(r.reason||'Ошибка'); } var self=this; setTimeout(function(){self.market();},800); },
    bag: function() { this._playSound('click'); var bag=Sherwood.Bag,items=bag?bag.getItems():[],max=bag?bag.getMaxSlots():10,h=''; for (var i=0;i<max;i++) { var item=items[i]; if(item) { var gc=Sherwood.GradeColors?Sherwood.GradeColors[item.grade]:'#9d9d9d'; h+='<div onclick="SherwoodUI._bagAction('+i+')" style="background:url(\'assets/interface/bag_cell.jpeg\') center/contain no-repeat;background-size:cover;width:60px;height:60px;border:2px solid '+gc+';border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;padding:4px;"><img src="'+(item.icon||'assets/interface/labyrinth_of_icons.png')+'" style="width:32px;height:32px;object-fit:contain;">'+(item.quantity>1?'<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.6em;background:rgba(0,0,0,0.7);padding:0 4px;border-radius:4px;">'+item.quantity+'</span>':'')+'</div>'; } else { h+='<div style="background:url(\'assets/interface/bag_cell.jpeg\') center/contain no-repeat;background-size:cover;width:60px;height:60px;border:2px solid #333;border-radius:6px;display:flex;align-items:center;justify-content:center;opacity:0.4;"><span style="color:#555;font-size:0.6em;">пусто</span></div>'; } } var expInfo=Sherwood.Bag.getExpansionInfo(),expBtn=expInfo.canExpand?'<button onclick="SherwoodUI._expandBag()" style="margin-top:8px;background:#c9a040;border:none;border-radius:6px;padding:6px 14px;color:#000;cursor:pointer;font-size:0.7em;">Расширить +5 ('+expInfo.cost+' 🪙)</button>':'<span style="color:#666;font-size:0.6em;">Максимум для вашего уровня</span>'; var c='<div style="color:#aaa;font-size:0.8em;margin-bottom:4px;">'+items.length+'/'+max+'</div>'+expBtn+'<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-width:340px;margin:12px auto 0;">'+h+'</div><div id="bag-info" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:12px;min-height:20px;">Нажми на предмет</div>'; this._openScreen('🎒 Сумка','bag',c); },
    _expandBag: function() { var r=Sherwood.Bag.expandBag(),info=document.getElementById('bag-info'); if(r.success) { if(info) info.textContent='✅ Сумка расширена до '+r.newSlots+' ячеек!'; this.updateDisplay(); } else { if(info) info.textContent='❌ '+(r.reason||'Ошибка'); } var self=this; setTimeout(function(){self.bag();},800); },
    _bagAction: function(i) {
        var bag = Sherwood.Bag; if (!bag) return;
        var items = bag.getItems(); if (i >= items.length) return;
        var item = items[i]; if (!item) return;
        var info = document.getElementById('bag-info'); if (!info) return;
        var a = '';
        if (item.part === 'ring' || item.part === 'amulet') {
            a += '<button onclick="Sherwood.Bag.equipItem(' + i + ');SherwoodUI.bag();" style="background:#9c27b0;border:none;border-radius:4px;padding:4px 12px;color:#fff;cursor:pointer;margin:0 4px;">Надеть</button>';
        } else if (item.part) {
            a += '<button onclick="Sherwood.Bag.equipItem(' + i + ');SherwoodUI.bag();" style="background:#4caf50;border:none;border-radius:4px;padding:4px 12px;color:#fff;cursor:pointer;margin:0 4px;">Надеть</button>';
        }
        a += '<button onclick="Sherwood.Bag.sellItem(' + i + ');SherwoodUI.bag();" style="background:#ff9800;border:none;border-radius:4px;padding:4px 12px;color:#fff;cursor:pointer;margin:0 4px;">Продать</button>';
        a += '<button onclick="Sherwood.Bag.discardItem(' + i + ');SherwoodUI.bag();" style="background:#f44336;border:none;border-radius:4px;padding:4px 12px;color:#fff;cursor:pointer;margin:0 4px;">Выкинуть</button>';
        info.innerHTML = '<div style="color:#fff;font-size:0.9em;">' + (item.name || 'Предмет') + '</div><div style="color:#aaa;font-size:0.7em;">' + (item.grade || 'обычный') + ' x' + (item.quantity || 1) + '</div><div style="margin-top:6px;">' + a + '</div>';
    },
    profile: function() {
        this._playSound('click');
        var p = Sherwood.getPlayer();
        var eq = Sherwood.Bag ? Sherwood.Bag.getEquipment() : {};
        var ring = eq.ring, amulet = eq.amulet;
        var trophies = p.trophies || [];
        var lastTrophy = trophies.length > 0 ? trophies[trophies.length - 1].name : 'Нет трофеев';

        var activeSkin = (Sherwood.Forge && Sherwood.Forge.getActiveSkin) ? Sherwood.Forge.getActiveSkin() : 'skin_1_basic';
        var unlockedSkins = (Sherwood.Forge && Sherwood.Forge.getUnlockedSkins) ? Sherwood.Forge.getUnlockedSkins() : ['skin_1_basic'];

        var allSkins = ['skin_1_basic', 'skin_2', 'skin_3', 'skin_4', 'skin_5', 'skin_6', 'skin_7', 'skin_8', 'skin_9', 'skin_10', 'skin_11', 'skin_12', 'skin_13', 'skin_14', 'skin_15'];

        var tabContent = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;">';
        for (var i = 0; i < allSkins.length; i++) {
            var sid = allSkins[i];
            var owned = unlockedSkins.indexOf(sid) !== -1;
            var isActive = activeSkin === sid;
            tabContent += '<div style="background:rgba(0,0,0,0.5);border:2px solid ' + (isActive ? '#ffd700' : owned ? '#4caf50' : '#555') + ';border-radius:8px;padding:8px;text-align:center;">';
            tabContent += '<img src="assets/hero_skins/' + sid + '.png" style="width:56px;height:56px;object-fit:contain;border-radius:4px;" onerror="this.src=\'assets/hero_skins/skin_1_basic.png\'">';
            tabContent += '<div style="color:#e0c080;font-size:0.6em;margin-top:4px;">' + sid.replace('skin_', 'Скин ') + '</div>';
            if (owned) {
                tabContent += isActive ? '<div style="color:#ffd700;font-size:0.55em;">✅ Активен</div>' : '<button onclick="SherwoodUI._equipSkinFromProfile(\'' + sid + '\')" style="margin-top:4px;background:#4caf50;border:none;border-radius:4px;padding:2px 8px;color:#fff;cursor:pointer;font-size:0.55em;">Надеть</button>';
            } else {
                tabContent += '<div style="color:#888;font-size:0.5em;">🔒 Закрыт</div>';
            }
            tabContent += '</div>';
        }
        tabContent += '</div>';

        var h = '<div style="text-align:center;margin-bottom:12px;">';
        h += '<img src="assets/hero_skins/' + activeSkin + '.png" style="width:90px;height:90px;border-radius:12px;border:2px solid #c9a040;object-fit:contain;" onerror="this.src=\'assets/hero_skins/skin_1_basic.png\'">';
        h += '<div style="color:#e0c080;font-weight:bold;margin-top:4px;">' + p.name + '</div>';
        h += '<div style="color:#aaa;">Уровень ' + p.level + '</div>';
        h += '</div>';

        h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:rgba(0,0,0,0.4);border-radius:10px;padding:12px;margin-bottom:12px;">';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><img src="' + this._statIcons.attack + '" style="width:22px;height:22px;"><span style="color:#f44336;">' + p.stats.attack + '</span></div>';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><img src="' + this._statIcons.defense + '" style="width:22px;height:22px;"><span style="color:#2196f3;">' + p.stats.defense + '</span></div>';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><img src="' + this._statIcons.agility + '" style="width:22px;height:22px;"><span style="color:#ff9800;">' + p.stats.agility + '</span></div>';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><img src="' + this._statIcons.hp + '" style="width:22px;height:22px;"><span style="color:#4caf50;">' + p.stats.hp + '</span></div>';
        h += '</div>';

        h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">';
        h += '<div style="background:url(\'assets/interface/bag_cell.jpeg\') center/contain no-repeat;background-size:cover;border:2px solid #c9a040;border-radius:8px;padding:8px;text-align:center;cursor:pointer;" onclick="SherwoodUI._showProfileInfo(\'trophies\')"><img src="assets/all_trophies/trophies_chapters/chapter_1_broken_hunting_horn_of_the_league.png" style="width:32px;height:32px;margin:0 auto;"><div style="color:#aaa;font-size:0.5em;margin-top:4px;">' + lastTrophy + '</div></div>';
        h += '<div style="background:url(\'assets/interface/bag_cell.jpeg\') center/contain no-repeat;background-size:cover;border:2px solid #ffd700;border-radius:8px;padding:8px;text-align:center;cursor:pointer;" onclick="SherwoodUI._showProfileInfo(\'ring\')"><img src="assets/interface/ring_first_level.png" style="width:32px;height:32px;margin:0 auto;"><div style="color:#aaa;font-size:0.5em;margin-top:4px;">' + (ring ? ring.name : 'Пусто') + '</div></div>';
        h += '<div style="background:url(\'assets/interface/bag_cell.jpeg\') center/contain no-repeat;background-size:cover;border:2px solid #9c27b0;border-radius:8px;padding:8px;text-align:center;cursor:pointer;" onclick="SherwoodUI._showProfileInfo(\'amulet\')"><img src="assets/interface/sherwood_amulet_level_one.png" style="width:32px;height:32px;margin:0 auto;"><div style="color:#aaa;font-size:0.5em;margin-top:4px;">' + (amulet ? amulet.name : 'Пусто') + '</div></div>';
        h += '</div>';

        h += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">';
        h += '<button onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.training();" style="background:rgba(255,152,0,0.2);border:1px solid #ff9800;border-radius:8px;padding:12px;color:#fff;cursor:pointer;font-size:0.8em;"><img src="assets/all_buttons/training.png" style="width:24px;height:24px;display:block;margin:0 auto 4px;">Тренировка</button>';
        h += '<button onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.forge();" style="background:rgba(121,85,72,0.2);border:1px solid #795548;border-radius:8px;padding:12px;color:#fff;cursor:pointer;font-size:0.8em;"><img src="assets/all_buttons/forge.png" style="width:24px;height:24px;display:block;margin:0 auto 4px;">Кузница</button>';
        h += '<button onclick="SherwoodUI._previousScreen=\'profile\';SherwoodUI.bestiary();" style="background:rgba(96,125,139,0.2);border:1px solid #607d8b;border-radius:8px;padding:12px;color:#fff;cursor:pointer;font-size:0.8em;"><img src="assets/all_buttons/bestiary.png" style="width:24px;height:24px;display:block;margin:0 auto 4px;">Бестиарий</button>';
        h += '</div>';

        h += '<div style="background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;margin-bottom:12px;">';
        h += '<div style="color:#e0c080;font-weight:bold;margin-bottom:8px;">🎨 Скины</div>';
        h += tabContent;
        h += '</div>';

        h += '<div id="profile-info" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:12px;"></div>';
        this._openScreen('👤 Профиль', 'profile', h);
    },

    _equipSkinFromProfile: function(sid) {
        if (Sherwood.Forge && Sherwood.Forge.equipSkin) {
            Sherwood.Forge.equipSkin(sid);
            var heroImg = document.querySelector('.hero-frame img');
            if (heroImg) heroImg.src = 'assets/hero_skins/' + sid + '.png';
            this.profile();
        }
    },

    _showProfileInfo: function(type) { var info=document.getElementById('profile-info'); if(!info) return; if(type==='trophies') { var t=Sherwood.getPlayer().trophies||[]; info.innerHTML=t.length?t.map(function(x){return'🏆 '+x.name;}).join(' | '):'🏆 Трофеев нет'; } else if(type==='ring') { var r=Sherwood.Bag?Sherwood.Bag.getEquipment().ring:null; info.innerHTML=r?'💍 '+r.name+' (Ур.'+(r.level||1)+')':'💍 Кольцо не надето'; } else if(type==='amulet') { var a=Sherwood.Bag?Sherwood.Bag.getEquipment().amulet:null; info.innerHTML=a?'📿 '+a.name+' (Ур.'+(a.level||1)+')':'📿 Амулет не надет'; } },
    training: function() { var gb=this._previousScreen==='profile'?'SherwoodUI.profile()':'SherwoodUI.loadHome()'; this._previousScreen=null; this._playSound('click'); var p=Sherwood.getPlayer(),tl=p.trainingLevels||{},stats=['attack','defense','hp','agility'],names={attack:'Атака',defense:'Защита',hp:'Здоровье',agility:'Ловкость'},colors={attack:'#f44336',defense:'#2196f3',hp:'#4caf50',agility:'#ff9800'},h='<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">'; for (var i=0;i<stats.length;i++) { var s=stats[i],lvl=tl[s]||0; h+='<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:12px;text-align:center;"><div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;"><img src="'+this._statIcons[s]+'" style="width:28px;height:28px;"><span style="color:#e0c080;">'+names[s]+'</span></div><div style="color:#aaa;font-size:0.8em;">Ур. '+lvl+'/200</div><div style="color:'+colors[s]+';font-size:0.7em;">+'+(s==='hp'?10:s==='agility'?1:2)+' за ур.</div><button onclick="SherwoodUI._doTraining(\''+s+'\')" style="margin-top:8px;background:#c9a040;border:none;border-radius:4px;padding:6px 16px;color:#000;cursor:pointer;font-size:0.8em;">Тренировать</button></div>'; } h+='</div><div id="training-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:12px;"></div>'; this._openScreen('💪 Тренировка','training',h,gb); },
    _doTraining: function(stat) { var p=Sherwood.getPlayer(); if(!p) return; if(!p.trainingLevels) p.trainingLevels={attack:0,defense:0,hp:0,agility:0}; var cur=p.trainingLevels[stat]||0; if(cur>=200) { var log=document.getElementById('training-log'); if(log) log.textContent='❌ Макс. уровень!'; return; } var cost=Math.round(10*Math.pow(cur+1,1.15)); if((p.resources.silver||0)<cost) { var log=document.getElementById('training-log'); if(log) log.textContent='❌ Нужно '+cost+' серебра!'; return; } p.resources.silver-=cost; p.trainingLevels[stat]=cur+1; if(Sherwood._recalcStats) Sherwood._recalcStats(); if(Sherwood.saveGame) Sherwood.saveGame(); this.updateDisplay(); this.training(); var log=document.getElementById('training-log'); if(log) log.textContent='✅ '+stat+' → '+(cur+1)+' (-'+cost+' сер.)'; },

    forge: function() {
        var gb = this._previousScreen === 'profile' ? 'SherwoodUI.profile()' : 'SherwoodUI.loadHome()';
        this._previousScreen = null;
        this._playSound('click');
        if (!Sherwood.Forge) { this._showPlaceholder('⚒️ Кузница', 'forge', gb); return; }

        var items = Sherwood.Bag ? Sherwood.Bag.getItems() : [];
        var enhanceItems = items.filter(function(i) { return i.part || i.type === 'equipment'; });
        var skins = Sherwood.Forge.getCraftSkins();
        var player = Sherwood.getPlayer();
        var unlocked = player.unlockedSkins || [];
        var active = player.activeSkin || 'skin_1_basic';

        var ringInfo = Sherwood.Forge.getRingCraftInfo();
        var amuletInfo = Sherwood.Forge.getAmuletCraftInfo();
        var arrowInfo = Sherwood.Forge.getArrowCraftInfo();
        var arrowCount = Sherwood.Forge.getArrowCount();

        var h = '';

        h += '<div style="margin-bottom:12px;"><div style="color:#e0c080;margin-bottom:4px;">⚒️ Заточка</div>';
        for (var i = 0; i < enhanceItems.length; i++) {
            var item = enhanceItems[i], idx = items.indexOf(item), lvl = item.enhancement || 0;
            h += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:6px;padding:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;"><div><div style="color:#e0c080;font-size:0.8em;">' + item.name + '</div><div style="color:#aaa;font-size:0.6em;">Заточка: +' + lvl + '</div></div><button onclick="SherwoodUI._enhanceItem(' + idx + ')" style="background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Точить</button></div>';
        }
        h += enhanceItems.length === 0 ? '<div style="color:#aaa;font-size:0.7em;">Нет предметов</div>' : '';
        h += '</div>';

        h += '<div style="margin-bottom:12px;"><div style="color:#e0c080;margin-bottom:4px;">🏹 Стрелы Шервудской лощины</div>';
        h += '<div style="color:#aaa;font-size:0.7em;">В сумке: ' + arrowCount + ' шт.</div>';
        h += '<div style="color:#aaa;font-size:0.65em;">🌿 Веток: ' + arrowInfo.branches + ' | 🪶 Перьев: ' + arrowInfo.feathers + ' | 🦴 Костей: ' + arrowInfo.bones + '</div>';
        if (arrowInfo.canCraft > 0) {
            h += '<button onclick="SherwoodUI._craftArrow(1)" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Создать 1 стрелу</button>';
            if (arrowInfo.canCraft >= 10) h += '<button onclick="SherwoodUI._craftArrow(10)" style="margin-left:4px;background:#ff9800;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Создать 10</button>';
            if (arrowInfo.canCraft >= 100) h += '<button onclick="SherwoodUI._craftArrow(100)" style="margin-left:4px;background:#f44336;border:none;border-radius:4px;padding:4px 10px;color:#fff;cursor:pointer;font-size:0.7em;">Создать всё</button>';
        } else {
            h += '<div style="color:#888;font-size:0.6em;">Нужно: 1 Ветка + 1 Перо + 1 Кость</div>';
        }
        h += '</div>';

        h += '<div style="margin-bottom:12px;"><div style="color:#e0c080;margin-bottom:4px;">💍 Кольца</div>';
        h += '<div style="color:#aaa;font-size:0.7em;">Уровень: ' + ringInfo.currentLevel + '/' + ringInfo.maxLevel + ' | 📜 Скрижалей: ' + ringInfo.scrolls + '</div>';
        if (ringInfo.canCraft) {
            h += '<button onclick="SherwoodUI._craftRing()" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Улучшить (' + ringInfo.cost + ' 📜)</button>';
        } else {
            h += '<div style="color:#888;font-size:0.6em;">' + (ringInfo.reason || 'Нужно ' + ringInfo.cost + ' скрижалей') + '</div>';
        }
        h += '</div>';

        h += '<div style="margin-bottom:12px;"><div style="color:#e0c080;margin-bottom:4px;">📿 Амулеты</div>';
        h += '<div style="color:#aaa;font-size:0.7em;">Уровень: ' + amuletInfo.currentLevel + '/' + amuletInfo.maxLevel + ' | 📜 Скрижалей: ' + amuletInfo.scrolls + '</div>';
        if (amuletInfo.canCraft) {
            h += '<button onclick="SherwoodUI._craftAmulet()" style="margin-top:4px;background:#c9a040;border:none;border-radius:4px;padding:4px 10px;color:#000;cursor:pointer;font-size:0.7em;">Улучшить (' + amuletInfo.cost + ' 📜)</button>';
        } else {
            h += '<div style="color:#888;font-size:0.6em;">' + (amuletInfo.reason || 'Нужно ' + amuletInfo.cost + ' скрижалей') + '</div>';
        }
        h += '</div>';

        h += '<div><div style="color:#e0c080;margin-bottom:4px;">🎨 Облики</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
        for (var i = 0; i < skins.length; i++) {
            var skin = skins[i], owned = unlocked.indexOf(skin.id) !== -1, isActive = active === skin.id;
            h += '<div style="background:rgba(0,0,0,0.5);border:2px solid ' + (isActive ? '#ffd700' : owned ? '#4caf50' : '#555') + ';border-radius:8px;padding:8px;text-align:center;">';
            h += '<img src="' + skin.icon + '" style="width:48px;height:48px;object-fit:contain;border-radius:4px;" onerror="this.src=\'assets/hero_skins/skin_1_basic.png\'">';
            h += '<div style="color:#e0c080;font-size:0.7em;">' + skin.name + '</div>';
            if (owned) {
                h += isActive ? '<div style="color:#ffd700;font-size:0.6em;">Активен</div>' : '<button onclick="SherwoodUI._equipSkin(\'' + skin.id + '\')" style="margin-top:4px;background:#4caf50;border:none;border-radius:4px;padding:3px 8px;color:#fff;cursor:pointer;font-size:0.6em;">Надеть</button>';
            } else {
                h += '<div style="color:#aaa;font-size:0.55em;">Гл.' + skin.chapter + ' | ' + skin.cost.ingots + ' сл. ' + skin.cost.scrolls + ' скр. ' + skin.cost.silver + ' сер.</div>';
                h += '<button onclick="SherwoodUI._craftSkin(\'' + skin.id + '\')" style="margin-top:4px;background:#ff9800;border:none;border-radius:4px;padding:3px 8px;color:#fff;cursor:pointer;font-size:0.6em;">Создать</button>';
            }
            h += '</div>';
        }
        h += '</div></div><div id="forge-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:8px;"></div>';
        this._openScreen('⚒️ Кузница', 'forge', h, gb);
    },

    _enhanceItem: function(idx) {
        var r = Sherwood.Forge.enhanceItem(idx);
        var log = document.getElementById('forge-log');
        if (r.enhanced) { if (log) log.textContent = '✅ Улучшено! +' + r.newLevel; }
        else if (r.broken) { if (log) log.textContent = '💔 Сломано!'; }
        else if (r.failed) { if (log) log.textContent = '❌ Неудача'; }
        else { if (log) log.textContent = '❌ ' + (r.reason || 'Ошибка'); }
        this.updateDisplay();
        var self = this; setTimeout(function() { self.forge(); }, 800);
    },

    _craftArrow: function(count) {
        var r = Sherwood.Forge.craftArrowBatch(count);
        var log = document.getElementById('forge-log');
        if (r.success) { if (log) log.textContent = '✅ Создано стрел: ' + (r.crafted || 1); }
        else { if (log) log.textContent = '❌ ' + (r.reason || 'Ошибка'); }
        this.updateDisplay();
        var self = this; setTimeout(function() { self.forge(); }, 800);
    },

    _craftRing: function() {
        var r = Sherwood.Forge.craftRing();
        var log = document.getElementById('forge-log');
        if (r.success) { if (log) log.textContent = '💍 Кольцо улучшено до ' + r.newLevel + '!'; }
        else { if (log) log.textContent = '❌ ' + (r.reason || 'Ошибка'); }
        this.updateDisplay();
        var self = this; setTimeout(function() { self.forge(); }, 800);
    },

    _craftAmulet: function() {
        var r = Sherwood.Forge.craftAmulet();
        var log = document.getElementById('forge-log');
        if (r.success) { if (log) log.textContent = '📿 Амулет улучшен до ' + r.newLevel + '!'; }
        else { if (log) log.textContent = '❌ ' + (r.reason || 'Ошибка'); }
        this.updateDisplay();
        var self = this; setTimeout(function() { self.forge(); }, 800);
    },

    _craftSkin: function(sid) {
        var r = Sherwood.Forge.craftSkin(sid);
        var log = document.getElementById('forge-log');
        if (r.success) { if (log) log.textContent = '✅ Облик создан!'; }
        else { if (log) log.textContent = '❌ ' + (r.reason || 'Ошибка'); }
        this.updateDisplay();
        var self = this; setTimeout(function() { self.forge(); }, 800);
    },

    _equipSkin: function(sid) {
        Sherwood.Forge.equipSkin(sid);
        var heroImg = document.querySelector('.hero-frame img');
        if (heroImg) heroImg.src = 'assets/hero_skins/' + sid + '.png';
        this.forge();
    },

    bestiary: function() { 
    var gb=this._previousScreen==='profile'?'SherwoodUI.profile()':'SherwoodUI.loadHome()'; 
    this._previousScreen=null; this._playSound('click'); 
    if(!Sherwood.Bestiary) { this._showPlaceholder('📖 Бестиарий','bestiary',gb); return; } 
    var progress=Sherwood.Bestiary.getDiscoveryProgress(),
        zones=['Проклятая чаща','Первородное болото','Базальтовые шахты','Квест','Рейд'],
        h='<div style="text-align:center;margin-bottom:8px;color:#aaa;">📖 Открыто: '+progress.discovered+'/'+progress.total+' ('+progress.percent+'%)</div><div style="background:rgba(0,0,0,0.3);border-radius:6px;height:10px;margin-bottom:12px;overflow:hidden;"><div style="background:#c9a040;height:100%;width:'+progress.percent+'%;"></div></div>'; 
    for (var z=0;z<zones.length;z++) { 
        var beasts=Sherwood.Bestiary.getBeastsByZone(zones[z]); 
        if(beasts.length===0) continue; 
        h+='<div style="color:#e0c080;font-weight:bold;margin:10px 0 6px;">📍 '+zones[z]+'</div>'; 
        for (var i=0;i<beasts.length;i++) { 
            var b=beasts[i], disc=b.kills>0;
            h+='<div onclick="SherwoodUI._showBeastInfo(\''+b.id+'\')" style="background:rgba(0,0,0,0.5);border:1px solid '+(disc?'#4caf50':'#555')+';border-radius:8px;padding:8px;margin-bottom:4px;display:flex;align-items:center;gap:8px;cursor:pointer;">';
            h+='<img src="assets/all_beasts/'+b.id+'" style="width:40px;height:40px;object-fit:contain;border-radius:4px;'+(disc?'':'filter:grayscale(1);opacity:0.5;')+'" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h+='<div style="flex:1;"><div style="color:'+(disc?'#fff':'#888')+';">'+(disc?b.name:'???')+'</div><div style="color:#aaa;font-size:0.6em;">'+b.floor+' | '+b.type+'</div></div>';
            h+='<div style="color:#aaa;font-size:0.7em;">Убито: '+b.kills+'</div>';
            if(disc && !b.rewardClaimed) h+='<button onclick="event.stopPropagation();SherwoodUI._claimBestiaryReward(\''+b.id+'\')" style="background:#ff9800;border:none;border-radius:4px;padding:2px 6px;color:#fff;cursor:pointer;font-size:0.55em;">+'+b.reward+'⚪</button>';
            if(disc && b.rewardClaimed) h+='<span style="color:#4caf50;font-size:0.55em;">✅</span>';
            h+='</div>';
        }
    }
    this._openScreen('📖 Бестиарий','bestiary',h||'<div style="color:#aaa;text-align:center;">Бестиарий пуст</div>',gb); 
},

_showBeastInfo: function(beastId) {
    var b = Sherwood.Bestiary.getBeast(beastId);
    if (!b) return;
    var h = '<div style="text-align:center;padding:16px;">';
    h += '<img src="assets/all_beasts/' + b.id + '" style="width:120px;height:120px;object-fit:contain;border:2px solid #c9a040;border-radius:8px;">';
    h += '<div style="color:#e0c080;font-size:1.1em;margin:8px 0;">' + b.name + '</div>';
    h += '<div style="color:#aaa;font-size:0.8em;">' + b.floor + ' | ' + b.type + '</div>';
    h += '<div style="color:#ccc;font-size:0.8em;margin:12px 0;">' + b.lore + '</div>';
    h += '<div style="color:#aaa;font-size:0.75em;">Убито: ' + b.kills + ' | Награда: ' + (b.reward || 50) + ' ⚪</div>';
    if (!b.rewardClaimed && b.kills > 0) h += '<button onclick="SherwoodUI._claimBestiaryReward(\'' + b.id + '\')" style="margin-top:8px;background:#ff9800;border:none;border-radius:6px;padding:6px 16px;color:#fff;cursor:pointer;">Забрать ' + (b.reward || 50) + ' ⚪</button>';
    if (b.rewardClaimed) h += '<div style="color:#4caf50;margin-top:8px;">✅ Награда получена</div>';
    h += '</div>';
    this._openScreen(b.name, 'bestiary', h, 'SherwoodUI.bestiary()');
},

_claimBestiaryReward: function(beastId) {
    if (!Sherwood.Bestiary) return;
    var r = Sherwood.Bestiary.claimReward(beastId);
    if (r.success) { this.updateDisplay(); this.bestiary(); }
},

(function() {
    var self = SherwoodUI;
    var buttons = document.querySelectorAll('#mainInterface .btn[data-action]');
    for (var i = 0; i < buttons.length; i++) {
        (function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var a = el.dataset.action;
                if (a && typeof self[a] === 'function') { try { self._playSound('click'); } catch(e) {} self[a](); }
            });
        })(buttons[i]);
    }
})();

document.addEventListener('DOMContentLoaded', function() { if (typeof SherwoodUI !== 'undefined' && SherwoodUI.init) SherwoodUI.init(); });

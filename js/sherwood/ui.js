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
        this._mainElements = ['.bg-layer', '.arch-layer', '.hero-frame', '.top-panel', '#top-buttons-bar', '.bottom-stats'];
        this.container = document.getElementById('game-container'); if (!this.container) return;
        this._screenLayer = document.createElement('div'); this._screenLayer.id = 'screen-layer';
        this._screenLayer.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:50;display:none;';
        this.container.appendChild(this._screenLayer);
        try { this._initSounds(); } catch(e) {}
        this.bindPlayButton();
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
            if (k === 'main_theme' && Sherwood.Combat && Sherwood.Combat._battle) return;
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
                try { self._playSound('click'); self._playMusic('main_theme'); } catch(e) {}
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

    // ========== ПОДЗЕМКА ==========
    subway: function() { this.showDungeon(); },
    showDungeon: function() {
        this._playSound('click');
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
    _startDungeon: function(id, level) { if (!Sherwood.Dungeon || !Sherwood.Dungeon.generate) return; var d = Sherwood.Dungeon.generate(id, level); if (!d) { this._showNotification('❌ Нет билетов!'); return; } this._playSound('dungeon_enter'); this._renderDungeon(); },
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
                    if (cell.open) onclick = "onclick='SherwoodUI._dungeonMove(" + x + "," + y + ")'";
                    else if (clickDist === 1 && cell.type !== 0) { onclick = "onclick='SherwoodUI._dungeonMove(" + x + "," + y + ")'"; glow = "box-shadow:inset 0 0 12px rgba(255,255,200,0.5);"; }
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
        var cell = d.grid[ty][tx]; if (!cell) return;
        var dist = Math.abs(d.px - tx) + Math.abs(d.py - ty);
        if (!cell.open && dist !== 1) return;
        if (!cell.open && dist === 1 && cell.type === 0) return;
        if (cell.open && dist > 1) { this._walkPath(tx, ty); return; }
        this._doStep(tx, ty);
    },

    _walkPath: function(toX, toY) {
        var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
        var size = d.size, visited = {}, queue = [{x: d.px, y: d.py, path: []}];
        visited[d.py + ',' + d.px] = true;
        var dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        while (queue.length > 0) {
            var cur = queue.shift();
            if (cur.x === toX && cur.y === toY) {
                if (cur.path.length === 0) return;
                d.isMoving = true; this._renderDungeon();
                var self = this, i = 0;
                function nextStep() {
                    if (i >= cur.path.length) { d.isMoving = false; self._renderDungeon(); return; }
                    self._doStep(cur.path[i].x, cur.path[i].y);
                    i++; setTimeout(nextStep, 150);
                }
                nextStep(); return;
            }
            for (var i = 0; i < dirs.length; i++) {
                var nx = cur.x + dirs[i][0], ny = cur.y + dirs[i][1];
                if (nx >= 0 && nx < size && ny >= 0 && ny < size && !visited[ny + ',' + nx]) {
                    var c = d.grid[ny][nx];
                    if (c && c.open) { visited[ny + ',' + nx] = true; queue.push({x: nx, y: ny, path: cur.path.concat([{x: nx, y: ny}])}); }
                }
            }
        }
    },

    _doStep: function(tx, ty) {
        var d = Sherwood.Dungeon.getDungeon(); if (!d) return;
        if (tx > d.px) d.heroDirection = 'right'; else if (tx < d.px) d.heroDirection = 'left'; else if (ty > d.py) d.heroDirection = 'down'; else if (ty < d.py) d.heroDirection = 'up';
        var res = Sherwood.Dungeon.move(tx, ty);
        if (!res || !res.ok) { this._renderDungeon(); return; }
        this._playSound('steps'); this._renderDungeon(); this.updateDisplay();
        if (res.type === 'battle') { d.isMoving = false; this._stopMusic(); this._playSound('trap'); Sherwood.Combat.start(res.monsterId, res.boss, 'dungeon'); setTimeout(function() { SherwoodUI._showCombatScreen(); }, 400); return; }
        if (res.type === 'chest') { this._playSound('chest_open'); }
        if (res.type === 'altar') { this._playSound('altar'); var p = Sherwood.getPlayer(); p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + Math.floor(p.stats.maxHp * 0.3)); }
        if (res.type === 'cauldron') { this._playSound('bottle_health'); var p = Sherwood.getPlayer(); p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + Math.floor(p.stats.maxHp * 0.2)); }
        if (res.type === 'potion') { this._playSound('bottle_health'); var p = Sherwood.getPlayer(); var heal = d.id === 'cave' ? Math.floor(p.stats.maxHp * 0.4) : Math.floor(p.stats.maxHp * 0.2); p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal); }
        if (res.type === 'exit') { this._stopBattleMusic(); var reward = Sherwood.Dungeon.complete(); this.updateDisplay(); this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.showDungeon(); }; this._showVictoryScreen({ exp: reward.exp, gold: reward.gold, silver: reward.silver }); }
        if (res.type === 'exit_locked') { this._showNotification('Locked! Kill all monsters!'); }
    },

    _leaveDungeon: function() { if (Sherwood.Dungeon) Sherwood.Dungeon.leave(); this._stopBattleMusic(); this._playMusic('main_theme'); this.showDungeon(); },

    // ========== БОЙ ==========
    _showBattleScreen: function(enemyData, mode, modeTitle, extraInfo, onAttack, onFlee) {
        var e = enemyData, p = Sherwood.getPlayer();
        var ehp = e.maxHp > 0 ? Math.round((e.hp / e.maxHp) * 100) : 100, php = p.stats.maxHp > 0 ? Math.round((p.stats.hp / p.stats.maxHp) * 100) : 100;
        var h = '<div style="text-align:center;">';
        h += '<div style="color:#e0c080;font-size:0.85em;margin-bottom:6px;">' + modeTitle + '</div>';
        h += '<div style="position:relative;width:300px;height:80px;margin:4px auto;">';
        h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:0;">';
        h += '<div style="position:absolute;top:20px;left:14px;right:14px;bottom:20px;overflow:hidden;z-index:1;">';
        h += '<div id="enemy-hp-bar" style="background:url(assets/interface/filling_the_poisoned_health_bar.jpeg) left/auto 100%;height:100%;width:' + ehp + '%;transition:width 0.5s ease-out;"></div>';
        h += '</div>';
        h += '<span id="enemy-hp-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.7em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;">' + e.hp + '/' + e.maxHp + '</span></div>';
        h += '<div style="color:#f44336;font-weight:bold;font-size:1.1em;">' + e.name + '</div>';
        var imgPath = (mode === 'arena') ? e.image : 'assets/all_beasts/' + e.image;
        h += '<div style="margin:8px 0;position:relative;display:inline-block;"><img src="assets/interface/frame_of_beasts.png" style="width:280px;height:280px;position:absolute;top:-14px;left:-14px;z-index:0;pointer-events:none;"><img src="' + imgPath + '" id="enemy-card" style="width:250px;height:250px;object-fit:contain;position:relative;z-index:1;border-radius:16px;transition:filter 0.15s;" onerror="this.style.display=\'none\'"></div>';
        h += '<button onclick="' + onAttack + '" style="margin:6px auto;background:url(assets/skills/skill_shot_normal.png) center/contain no-repeat;width:72px;height:72px;border:3px solid #c9a040;border-radius:50%;cursor:pointer;display:block;"></button>';
        h += '<div style="position:relative;width:300px;height:80px;margin:6px auto;">';
        h += '<img src="assets/interface/life_scale.png" style="width:100%;height:155%;position:absolute;top:0;left:0;z-index:0;">';
        h += '<div style="position:absolute;top:20px;left:14px;right:14px;bottom:20px;overflow:hidden;z-index:1;">';
        h += '<div id="player-hp-bar" style="background:url(assets/interface/life_interface_asset_horizontal_progress_bar.jpeg) left/auto 100%;height:100%;width:' + php + '%;transition:width 0.5s ease-out;"></div>';
        h += '</div>';
        h += '<span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:0.7em;z-index:2;text-shadow:0 0 6px #000;font-weight:bold;">HP ' + p.stats.hp + '/' + p.stats.maxHp + '</span></div>';
        h += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin:4px 0;color:#aaa;font-size:0.7em;"><span style="color:#f44336;">ATK ' + p.stats.attack + '</span> <span style="color:#2196f3;">DEF ' + p.stats.defense + '</span> <span style="color:#ff9800;">AGI ' + p.stats.agility + '</span><img src="assets/hero_skins/skin_1_basic.png" style="width:56px;height:56px;border-radius:50%;border:2px solid #c9a040;"></div>';
        h += '<div id="battle-dialog" style="background:rgba(0,0,0,0.75);border:1px solid #555;border-radius:8px;padding:8px;margin:4px 8%;min-height:90px;max-height:90px;overflow-y:auto;color:#aaa;font-size:0.7em;text-align:left;line-height:1.4;"></div>';
        h += '</div>';
        this._openScreen('Battle', 'dungeon_fight', h);
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
    _showCombatScreen: function() { var b = Sherwood.Combat.getState(); if (!b) { this._renderDungeon(); return; } this._showBattleScreen({ name: b.enemyName, image: b.enemyImage, hp: b.enemyHp, maxHp: b.enemyMaxHp }, 'dungeon', (b.isBoss ? 'BOSS: ' : '') + b.enemyName, '', 'SherwoodUI._combatAttack()', 'SherwoodUI._combatFlee()'); },
    _combatAttack: function() { this._playHitSounds(); this._handleCombat(Sherwood.Combat.attack()); },
    _combatFlee: function() { var r = Sherwood.Combat.flee(); if (r.success) { this._stopBattleMusic(); this._leaveDungeon(); return; } if (r.lose) { this._showDialog('Поражение...', '#f44336'); this._stopBattleMusic(); var self = this; setTimeout(function() { self._leaveDungeon(); }, 1200); return; } this._showDialog('Побег не удался! Враг: -' + r.damage, '#ff9800'); this._showCombatScreen(); },
    _handleCombat: function(r) {
        if (!r) return;
        if (r.win) {
            if (Sherwood.Dungeon && Sherwood.Dungeon.killMonster) Sherwood.Dungeon.killMonster();
            if (Sherwood.Bestiary && r.enemyImage) Sherwood.Bestiary.registerKill(r.enemyImage);
            this._stopBattleMusic(); this.updateDisplay(); this._renderDungeon();
        } else if (r.lose) {
            this._stopBattleMusic(); this.updateDisplay();
            var scrolls = Math.random() < 0.08 ? 1 : 0;
            if (scrolls) Sherwood.addResource('scrolls', scrolls);
            this._pendingRewards = { exp: Math.floor(r.exp * 0.3), silver: Math.floor(r.gold * 1.5), scrolls: scrolls };
            this._afterRewardAction = function() { SherwoodUI._leaveDungeon(); };
            this._showDefeatScreen(this._pendingRewards);
        } else {
            this._hitEnemyCard(); this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
            this._showDialog((r.crit ? 'КРИТ! ' : '') + 'Вы нанесли ' + r.damage + ' урона', r.crit ? '#ff6a00' : '#fff');
            if (r.armorDmg) this._showDialog('Снято брони: ' + r.armorDmg, '#2196f3');
            if (r.enemy && r.enemy.damage) { var self = this; setTimeout(function() { self._showDialog('Враг нанёс ' + r.enemy.damage + ' урона', '#f44336'); }, 700); }
            this.updateDisplay(); var self = this; setTimeout(function() { self._showCombatScreen(); }, 1000);
        }
    },

    // ===== КВЕСТЫ =====
    quest: function() { this._playSound('click'); if (!Sherwood.Quests) { this._showPlaceholder('Квесты','quests'); return; } var prog = Sherwood.Quests.getProgress(), energy = Sherwood.Quests.getEnergy(); var cooldown = Sherwood.Quests.isOnCooldown(), cdRemain = Sherwood.Quests.getCooldownRemaining(), accel = Sherwood.Quests.getAccelCost(); var currentChapter = prog.currentChapter || 1, ch = Sherwood.Quests.getChapter(currentChapter); if (!ch) { this._showPlaceholder('Квесты','quests'); return; } var completed = prog.completed && prog.completed.indexOf(ch.id) !== -1, unlocked = Sherwood.Quests.isUnlocked(ch.id); var html = '<div style="text-align:center;margin-bottom:8px;"><span style="color:#ff9800;">⚡ '+energy.current+'/'+energy.max+'</span>'; if (cooldown) html += ' <span style="color:#f44336;">⏳ '+cdRemain+' мин.</span>'; html += '</div>'; if (cooldown) html += '<div style="text-align:center;margin-bottom:8px;"><button onclick="SherwoodUI._questAccel()" style="background:#ff9800;border:none;border-radius:6px;padding:6px 14px;color:#fff;cursor:pointer;font-size:0.7em;">Ускорить ('+(accel.currency==='free'?'Бесплатно':accel.cost+' 🪙')+')</button></div>'; html += '<div style="background:url(\'assets/backgrounds/skill_page.jpeg\') center/cover no-repeat;border:2px solid '+(completed?'#4caf50':unlocked?'#c9a040':'#f44336')+';border-radius:12px;padding:14px;margin-bottom:8px;position:relative;overflow:hidden;"><div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,'+(completed?'0.3':'0.5')+');z-index:0;"></div><div style="position:relative;z-index:1;"><div style="color:#e0c080;font-weight:bold;font-size:1.1em;">Глава '+ch.id+': '+ch.name+'</div><div style="color:#aaa;font-size:0.7em;margin:6px 0;">'+ch.lore+'</div><div style="text-align:center;margin:10px 0;"><img src="assets/all_beasts/'+ch.boss.image+'" style="width:200px;height:200px;object-fit:contain;border:2px solid #f44336;border-radius:12px;" onerror="this.style.display=\'none\'"><div style="color:#f44336;font-weight:bold;margin-top:4px;">'+ch.boss.name+'</div><div style="color:#aaa;font-size:0.65em;">❤️ '+ch.boss.hp+' | ⚔️ '+ch.boss.atk+' | 🛡️ '+ch.boss.def+'</div></div><div style="display:flex;justify-content:space-between;color:#aaa;font-size:0.7em;"><span>👹 Этапов: '+ch.stages+'</span><span>⚡ Энергия: '+ch.energyCost+'</span></div>'; if (unlocked && !completed && !cooldown) html += '<button onclick="SherwoodUI._startQuest('+ch.id+')" style="width:100%;margin-top:10px;background:#c9a040;border:none;border-radius:8px;padding:10px;color:#000;font-weight:bold;cursor:pointer;">⚔️ В бой</button>'; if (completed) html += '<div style="text-align:center;color:#4caf50;font-weight:bold;margin-top:8px;">✅ Пройдено</div>'; html += '</div></div><div style="display:flex;gap:6px;justify-content:center;">'; if (currentChapter>1) html += '<button onclick="SherwoodUI._prevChapter()" style="background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:6px 14px;color:#fff;cursor:pointer;font-size:0.7em;">← Пред.</button>'; if (currentChapter<15 && prog.completed.indexOf(currentChapter)!==-1) html += '<button onclick="SherwoodUI._nextChapter()" style="background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:6px 14px;color:#fff;cursor:pointer;font-size:0.7em;">След. →</button>'; html += '</div><div style="text-align:center;color:#aaa;font-size:0.6em;margin-top:4px;">Попыток сегодня: '+(Sherwood.Quests.getAttemptsToday?Sherwood.Quests.getAttemptsToday():0)+'</div><div id="quest-info" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:4px;"></div>'; this._openScreen('📜 Квесты','quests',html); },
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
            if (b && b.enemy && b.enemy.image) { if (Sherwood.Bestiary) Sherwood.Bestiary.registerKill(b.enemy.image); }
            this._showDialog('✅ Враг повержен!','#4caf50'); this.updateDisplay();
            if (r.chapterComplete) {
                this._showDialog('🎉 Глава пройдена! +'+r.rewards.exp+'XP +'+r.rewards.gold+'🪙','#ffd700');
                this._playSound('victory'); this._stopBattleMusic();
                var scrolls = Math.random() < 0.25 ? 1 + Math.floor(Math.random() * 3) : 0;
                if (scrolls) Sherwood.addResource('scrolls', scrolls);
                this._pendingRewards = { exp: r.rewards.exp, gold: r.rewards.gold, silver: r.rewards.silver, scrolls: scrolls };
                this._afterRewardAction = function() { SherwoodUI._playMusic('main_theme'); SherwoodUI.quest(); };
                this._showVictoryScreen(this._pendingRewards);
            } else { var self = this; setTimeout(function() { self._showQuestBattle(); }, 1200); }
        } else if (r.playerDead) {
            this._showDialog('💀 Поражение...','#f44336'); this._playSound('defeat'); this._stopBattleMusic();
            var scrolls = Math.random() < 0.08 ? 1 : 0; if (scrolls) Sherwood.addResource('scrolls', scrolls);
            this._pendingRewards = { exp: Math.floor(r.rewards ? r.rewards.exp * 0.3 : 10), silver: Math.floor(r.rewards ? r.rewards.silver * 0.5 : 50), scrolls: scrolls };
            this._afterRewardAction = function() { SherwoodUI.quest(); }; this._showDefeatScreen(this._pendingRewards);
        } else {
            this._hitEnemyCard(); this._updateEnemyHP(r.enemyHp, r.enemyMaxHp);
            this._showDialog((r.crit ? '💥 КРИТ! ' : '⚔️ ') + 'Вы нанесли ' + r.damage + ' урона', r.crit ? '#ff6a00' : '#fff');
            if (r.enemyDamage) { var self = this; setTimeout(function() { self._showDialog('💢 Враг нанёс ' + r.enemyDamage + ' урона', '#f44336'); }, 700); }
            var self = this; setTimeout(function() { self._showQuestBattle(); }, 1000);
        }
    },

    // ===== ТАВЕРНА =====
    tavern: function() {
        this._playSound('click');
        if (!Sherwood.Tavern) { this._showPlaceholder('Таверна','tavern'); return; }
        var rows = Sherwood.Tavern.getAvailableRows ? Sherwood.Tavern.getAvailableRows() : [];
        var active = Sherwood.Tavern.getCurrentQuest ? Sherwood.Tavern.getCurrentQuest() : null;
        var cooldown = Sherwood.Tavern.isOnCooldown ? Sherwood.Tavern.isOnCooldown() : false;
        var cdRemain = Sherwood.Tavern.getCooldownRemaining ? Sherwood.Tavern.getCooldownRemaining() : 0;
        var html = '';
        if (active && active.quest && active.row) {
            var q = active.quest;
            html += '<div style="background:rgba(0,0,0,0.6);border:2px solid #c9a040;border-radius:10px;padding:14px;margin-bottom:12px;"><div style="display:flex;align-items:center;gap:10px;"><img src="assets/interface/old_huntsman_bertram.png" style="width:80px;height:80px;object-fit:contain;"><div style="color:#ffd700;font-weight:bold;">⚔️ ' + active.row.npc + '</div></div><div style="color:#fff;font-size:0.9em;">' + q.name + '</div><div style="color:#aaa;font-size:0.7em;">' + q.desc + '</div><div style="color:#f44336;font-size:0.7em;margin-top:4px;">Противник: ' + q.enemy.name + ' (❤️' + q.enemy.hp + ')</div><div style="display:flex;gap:8px;margin-top:8px;"><button onclick="SherwoodUI._tavernBattle()" style="background:#c9a040;border:none;border-radius:6px;padding:8px 16px;color:#000;cursor:pointer;">⚔️ В бой</button><button onclick="SherwoodUI._tavernCancel()" style="background:rgba(244,67,54,0.2);border:1px solid #f44336;border-radius:6px;padding:8px 12px;color:#f44336;cursor:pointer;">Отменить</button></div></div>';
        }
        if (cooldown) html += '<div style="text-align:center;color:#ff9800;padding:12px;background:rgba(0,0,0,0.4);border-radius:8px;margin-bottom:12px;">⏳ Перезарядка: ' + cdRemain + ' мин.</div>';
        if (!active && !cooldown) {
            for (var r = 0; r < rows.length; r++) {
                var row = rows[r]; if (!row || !row.quests) continue;
                html += '<div style="margin-bottom:12px;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;"><img src="assets/interface/old_huntsman_bertram.png" style="width:60px;height:60px;object-fit:contain;"><div><div style="color:#e0c080;font-weight:bold;">📜 ' + row.name + '</div><div style="color:#aaa;font-size:0.7em;">' + row.npc + '</div></div></div>';
                for (var q = 0; q < row.quests.length; q++) {
                    var quest = row.quests[q];
                    html += '<div style="background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;"><div><div style="color:#e0c080;font-size:0.85em;">' + quest.name + '</div><div style="color:#aaa;font-size:0.65em;">' + quest.desc + '</div><div style="color:#f44336;font-size:0.6em;">Противник: ' + quest.enemy.name + '</div><div style="color:#ffd700;font-size:0.6em;">🏆 +' + quest.reward.exp + 'XP +' + quest.reward.gold + '🪙</div></div><button onclick="SherwoodUI._tavernStart(' + r + ',' + q + ')" style="background:#c9a040;border:none;border-radius:4px;padding:6px 12px;color:#000;cursor:pointer;font-size:0.7em;">Взять</button></div>';
                }
                html += '</div>';
            }
        }
        html += '<div id="tavern-log" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:4px;"></div>';
        this._openScreen('🍺 Таверна', 'tavern', html);
    },
    _tavernStart: function(r, q) { var result = Sherwood.Tavern.startQuest(r, q); if (!result || !result.success) { var log = document.getElementById('tavern-log'); if (log) log.textContent = '❌ ' + (result ? result.reason : 'Ошибка'); return; } this._stopMusic(); this._showTavernBattle(); },
    _tavernBattle: function() { this._stopMusic(); this._showTavernBattle(); },
    _showTavernBattle: function() {
        var active = Sherwood.Tavern.getCurrentQuest ? Sherwood.Tavern.getCurrentQuest() : null;
        if (!active || !active.quest || !active.row) { this.tavern(); return; }
        var e = active.quest.enemy; if (!e.maxHp) e.maxHp = e.hp || 100;
        this._showBattleScreen({ name: e.name, image: e.image, hp: e.hp || 100, maxHp: e.maxHp }, 'tavern', '🍺 ' + active.row.npc + ' — ' + active.quest.name, '', 'SherwoodUI._tavernBattleAttack()', 'SherwoodUI._tavernCancel()');
    },
    _tavernBattleAttack: function() {
        this._playHitSounds();
        var active = Sherwood.Tavern.getCurrentQuest ? Sherwood.Tavern.getCurrentQuest() : null;
        if (!active || !active.quest || !active.quest.enemy) { this.tavern(); return; }
        var p = Sherwood.getPlayer(), e = active.quest.enemy;
        if (!e.maxHp) e.maxHp = e.hp || 100;
        var dmg = Math.max(1, Math.floor((p.stats.attack * p.stats.attack) / (p.stats.attack + (e.def || 5))));
        var crit = Math.random() * 100 < 15; if (crit) dmg = Math.floor(dmg * 1.8);
        e.hp -= dmg;
        if (e.hp <= 0) {
            var r = Sherwood.Tavern.completeQuest();
            this._showDialog('Победа! +' + r.reward.exp + 'XP +' + r.reward.gold + 'G', '#ffd700');
            this._stopBattleMusic(); this.updateDisplay();
            var self = this; setTimeout(function() { self._playMusic('main_theme'); self.tavern(); }, 1500);
        } else {
            var edmg = Math.max(1, Math.floor((e.atk * e.atk) / (e.atk + p.stats.defense)));
            p.stats.hp = Math.max(0, p.stats.hp - edmg);
            this._hitEnemyCard(); this._updateEnemyHP(e.hp, e.maxHp);
            this._showDialog((crit ? 'КРИТ! ' : '') + 'Вы нанесли ' + dmg + ' урона', crit ? '#ff6a00' : '#fff');
            if (p.stats.hp <= 0) {
                var self = this; setTimeout(function() { self._showDialog('Поражение...', '#f44336'); }, 700);
                Sherwood.Tavern.failQuest(); p.stats.hp = 1;
                this._stopBattleMusic(); setTimeout(function() { self._playMusic('main_theme'); self.tavern(); }, 1500);
            } else {
                var self = this; setTimeout(function() { self._showDialog('Враг нанёс ' + edmg + ' урона', '#f44336'); }, 700);
                setTimeout(function() { self._showTavernBattle(); }, 1200);
            }
        }
        this.updateDisplay();
    },
    _tavernCancel: function() { this._stopBattleMusic(); if (Sherwood.Tavern.cancelQuest) Sherwood.Tavern.cancelQuest(); this._playMusic('main_theme'); this.tavern(); },

    // ===== ОБЩИЕ МЕТОДЫ =====
    hearth: function() { this._playSound('click'); this._openScreen('Очаг', 'hearth', '<div style="text-align:center;padding:20px;"><div style="font-size:3em;">🔥</div><div style="color:#e0c080;">Очаг Шервуда</div></div>'); },
    talents: function() { this._playSound('click'); this._openScreen('Таланты', 'talents', '<div style="text-align:center;padding:20px;"><div style="color:#e0c080;">Таланты</div></div>'); },
    daily: function() { this._playSound('click'); this._showPlaceholder('Задания','daily'); },
    portal: function() { this._playSound('click'); this._showPlaceholder('Порталы','portal'); },
    raid: function() { this._playSound('click'); this._showPlaceholder('Рейд','raid'); },
    arena: function() { this._playSound('click'); this._showPlaceholder('Арена','arena'); },
    bag: function() { this._playSound('click'); this._showPlaceholder('Сумка','bag'); },
    market: function() { this._playSound('click'); this._showPlaceholder('Рынок','market'); },
    profile: function() { this._playSound('click'); this._showPlaceholder('Профиль','profile'); },
    settings: function() { this._playSound('click'); this._showPlaceholder('Настройки','settings'); },
    chat: function() { this._playSound('click'); this._showPlaceholder('Чат','chat'); },

    _toggleSound: function(en) { this._soundEnabled = en; this._saveAudioSettings(); },
    _toggleMusic: function(en) { this._musicEnabled = en; this._saveAudioSettings(); if (!en) { this._stopMusic(); } else { this._playMusic('main_theme'); } },
    _exitGame: function() { if (confirm('Выйти?')) { location.reload(); } }
};

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

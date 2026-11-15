/**
 * Sherwood Settings — Настройки игры
 */

if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

window.Settings = {
    _settings: {
        soundVolume: 0.5,
        musicVolume: 0.5,
        graphics: 'high'
    },

    // Версия игры (можешь менять тут, когда обновляешь игру, и в service-worker.js)
    GAME_VERSION: 'v1.0.2',

    init: function() {
        this._loadSettings();
        this._applyVolumes();
        this._applyGraphics();
        console.log('⚙️ Настройки загружены');
    },

    _loadSettings: function() {
        try {
            var saved = localStorage.getItem('sherwood_settings');
            if (saved) {
                var parsed = JSON.parse(saved);
                if (typeof parsed.soundVolume === 'number') this._settings.soundVolume = parsed.soundVolume;
                if (typeof parsed.musicVolume === 'number') this._settings.musicVolume = parsed.musicVolume;
                if (parsed.graphics) this._settings.graphics = parsed.graphics;
            }
        } catch(e) {}
    },

    saveSettings: function() {
        try {
            localStorage.setItem('sherwood_settings', JSON.stringify(this._settings));
        } catch(e) {}
    },

    // === ГЕТТЕРЫ ДЛЯ AUDIO.JS ===
    getMusicVolume: function() { return this._settings.musicVolume; },
    getSoundVolume: function() { return this._settings.soundVolume; },
    isMusicEnabled: function() { return true; },
    isSoundEnabled: function() { return true; },

    // === ГРАФИКА ===
    _applyGraphics: function() {
        var val = this._settings.graphics;
        if (val === 'low') {
            document.querySelectorAll('img').forEach(function(img) { img.style.imageRendering = 'pixelated'; });
            if (typeof renderer !== 'undefined' && renderer) renderer.setPixelRatio(0.75);
        } else if (val === 'medium') {
            document.querySelectorAll('img').forEach(function(img) { img.style.imageRendering = 'auto'; });
            if (typeof renderer !== 'undefined' && renderer) renderer.setPixelRatio(1);
        } else {
            document.querySelectorAll('img').forEach(function(img) { img.style.imageRendering = 'auto'; });
            if (typeof renderer !== 'undefined' && renderer) renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }
    },

    _applyVolumes: function() {
        var self = this;
        if (window.AudioManager && AudioManager.updateVolume) {
            AudioManager.updateVolume();
        }
        try { if (window.audioPlayer) window.audioPlayer.volume = self._settings.musicVolume; } catch(e) {}
        if (typeof UI !== 'undefined' && UI._currentMusic) {
            try { UI._currentMusic.volume = self._settings.musicVolume; } catch(e) {}
        }
        document.querySelectorAll('audio').forEach(function(audio) {
            try {
                var src = audio.src || '';
                if (src.indexOf('music') !== -1 || audio.loop) {
                    audio.volume = self._settings.musicVolume;
                } else {
                    audio.volume = self._settings.soundVolume;
                }
            } catch(e) {}
        });
    },

    showUI: function() {
        if (typeof UI === 'undefined') return;
        UI._playSound('click');

        // Отступ сверху 70px, чтобы кнопка "Назад" не перекрывала контент
        var h = '<div style="max-width:400px; margin:0 auto; padding:70px 20px 30px 20px; color:#e0c080; font-family:Georgia,serif;">';
        
        // --- ГРОМКОСТЬ ЗВУКОВ ---
        h += '<div style="margin-bottom:25px;">';
        h += '<div style="font-size:1.1em; margin-bottom:8px;">🔊 Громкость звуков</div>';
        h += '<input type="range" id="soundVolume" min="0" max="1" step="0.05" value="' + this._settings.soundVolume + '" oninput="Settings._setSoundVolume(this.value)" style="width:100%; accent-color:#c8a050; cursor:pointer;">';
        h += '<div style="text-align:right; color:#aaa; font-size:0.8em;" id="soundVolumeVal">' + Math.round(this._settings.soundVolume * 100) + '%</div>';
        h += '</div>';

        // --- ГРОМКОСТЬ МУЗЫКИ ---
        h += '<div style="margin-bottom:30px;">';
        h += '<div style="font-size:1.1em; margin-bottom:8px;">🎵 Громкость музыки</div>';
        h += '<input type="range" id="musicVolume" min="0" max="1" step="0.05" value="' + this._settings.musicVolume + '" oninput="Settings._setMusicVolume(this.value)" style="width:100%; accent-color:#c8a050; cursor:pointer;">';
        h += '<div style="text-align:right; color:#aaa; font-size:0.8em;" id="musicVolumeVal">' + Math.round(this._settings.musicVolume * 100) + '%</div>';
        h += '</div>';

        // --- ГРАФИКА ---
        h += '<div style="margin-bottom:35px;">';
        h += '<div style="font-size:1.1em; margin-bottom:10px;">🖥️ Графика</div>';
        h += '<div style="display:flex; gap:10px; justify-content:center;">';
        var gOptions = [
            { id: 'low', name: 'Низкая' },
            { id: 'medium', name: 'Средняя' },
            { id: 'high', name: 'Высокая' }
        ];
        for (var i = 0; i < gOptions.length; i++) {
            var opt = gOptions[i];
            var isActive = this._settings.graphics === opt.id;
            var bg = isActive ? '#c9a040' : 'rgba(0,0,0,0.6)';
            var color = isActive ? '#000' : '#c8a050';
            h += '<button onclick="Settings._setGraphics(\'' + opt.id + '\')" style="flex:1; padding:10px 5px; background:' + bg + '; border:2px solid #c8a050; border-radius:8px; color:' + color + '; font-weight:bold; cursor:pointer; font-size:0.9em; transition:all 0.2s;">' + opt.name + '</button>';
        }
        h += '</div>';
        h += '</div>';

        // --- УДАЛИТЬ ПЕРСОНАЖА ---
        h += '<div style="margin-top:30px; text-align:center; border-top:1px solid rgba(90,50,0,0.3); padding-top:20px;">';
        h += '<button onclick="Settings.resetCharacter()" style="background:#3a1010; border:2px solid #aa3333; border-radius:8px; padding:12px 24px; color:#ff8888; font-family:Georgia,serif; font-size:16px; font-weight:bold; cursor:pointer; width:100%;">';
        h += '🗑️ Удалить персонажа';
        h += '</button>';
        h += '<div style="color:#888; font-size:0.8em; margin-top:10px;">Удалит весь прогресс, ресурсы и скины.</div>';
        h += '</div>';

        // --- ВЕРСИЯ И ОБНОВЛЕНИЕ ---
        h += '<div style="margin-top:30px; text-align:center; padding-top:20px; border-top:1px solid rgba(90,50,0,0.3);">';
        h += '<div style="color:#aaa; font-size:0.9em; margin-bottom:12px;">Версия игры: <b style="color:#c8a050;">' + this.GAME_VERSION + '</b></div>';
        h += '<button onclick="Settings.forceUpdateGame()" style="background:linear-gradient(180deg,#3a2a10,#1a1208); border:2px solid #c8a050; border-radius:8px; padding:12px 24px; color:#ffd700; font-family:Georgia,serif; font-size:16px; font-weight:bold; cursor:pointer; width:100%;">';
        h += '🔄 Проверить обновления';
        h += '</button>';
        h += '</div>';

        h += '</div>';

        UI._openScreenScrollable('⚙️ Настройки', 'settings', h, 'UI.loadHome()');
    },

    _setSoundVolume: function(val) {
        this._settings.soundVolume = parseFloat(val);
        var valEl = document.getElementById('soundVolumeVal');
        if (valEl) valEl.textContent = Math.round(this._settings.soundVolume * 100) + '%';
        this.saveSettings();
        if (window.AudioManager) AudioManager.playSoundEffect('click');
    },

    _setMusicVolume: function(val) {
        this._settings.musicVolume = parseFloat(val);
        var valEl = document.getElementById('musicVolumeVal');
        if (valEl) valEl.textContent = Math.round(this._settings.musicVolume * 100) + '%';
        
        var vol = this._settings.musicVolume;
        try { if (window.audioPlayer) window.audioPlayer.volume = vol; } catch(e) {}
        try { if (window.AudioManager && AudioManager.updateVolume) AudioManager.updateVolume(); } catch(e) {}
        try { if (typeof UI !== 'undefined' && UI._currentMusic) UI._currentMusic.volume = vol; } catch(e) {}
        
        this.saveSettings();
    },

    _setGraphics: function(mode) {
        this._settings.graphics = mode;
        this.saveSettings();
        this._applyGraphics();
        if (UI && UI._showToast) UI._showToast('Графика: ' + (mode === 'low' ? 'Низкая' : mode === 'medium' ? 'Средняя' : 'Высокая'));
        this.showUI();
    },

    resetCharacter: function() {
        if (!confirm('Ты уверен, что хочешь УДАЛИТЬ ПЕРСОНАЖА? Весь прогресс будет потерян навсегда.')) return;
        if (!confirm('Точно? Это действие нельзя отменить!')) return;
        try {
            localStorage.removeItem('sherwood_save');
            localStorage.removeItem('active_skin');
            localStorage.removeItem('sherwood_settings');
        } catch(e) {}
        if (UI && UI._showToast) UI._showToast('🗑️ Персонаж удалён. Перезагрузка...');
        setTimeout(function() { window.location.reload(); }, 1500);
    },

        forceUpdateGame: function(silent) {
        if (!silent && !confirm('Проверить и установить обновления? Страница перезагрузится.')) return;
        
        if (UI && UI._showToast && !silent) UI._showToast('⏳ Проверка обновлений...');

        // 1. Удаляем все Service Workers
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (let registration of registrations) {
                    registration.unregister();
                }
            });
        }

        // 2. Удаляем все кэши (с ожиданием завершения)
        if ('caches' in window) {
            caches.keys().then(function(names) {
                return Promise.all(names.map(function(name) {
                    return caches.delete(name);
                }));
            });
        }

        // 3. Через 1.5 секунды перезагружаем с обходом кэша
        setTimeout(function() {
            var url = window.location.href.split('?')[0];
            window.location.href = url + '?v=' + Date.now();
        }, silent ? 200 : 1500);
    }
}; 
console.log('⚙️ Настройки загружены!');

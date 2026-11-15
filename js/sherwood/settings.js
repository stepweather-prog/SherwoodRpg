/**
 * Sherwood Settings — Настройки игры
 */

if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

window.Settings = {
    _settings: {
        soundVolume: 0.5,
        musicVolume: 0.5
    },

    init: function() {
        this._loadSettings();
        this._applyVolumes();
        console.log('⚙️ Настройки загружены');
    },

    _loadSettings: function() {
        try {
            var saved = localStorage.getItem('sherwood_settings');
            if (saved) {
                var parsed = JSON.parse(saved);
                if (typeof parsed.soundVolume === 'number') this._settings.soundVolume = parsed.soundVolume;
                if (typeof parsed.musicVolume === 'number') this._settings.musicVolume = parsed.musicVolume;
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

    _applyVolumes: function() {
        var self = this;
        // 1. Обновляем AudioManager
        if (window.AudioManager && AudioManager.updateVolume) {
            AudioManager.updateVolume();
        }
        // 2. Обновляем audioPlayer из main.js (главная музыка)
        try {
            if (window.audioPlayer) window.audioPlayer.volume = this._settings.musicVolume;
        } catch(e) {}
        // 3. Обновляем UI._currentMusic
        if (typeof UI !== 'undefined' && UI._currentMusic) {
            try { UI._currentMusic.volume = this._settings.musicVolume; } catch(e) {}
        }
        // 4. Пробегаемся по всем <audio> на странице
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

        var h = '<div style="max-width:400px; margin:0 auto; padding:20px; color:#e0c080; font-family:Georgia,serif;">';
        
        // --- ГРОМКОСТЬ ЗВУКОВ ---
        h += '<div style="margin-bottom:20px;">';
        h += '<div style="font-size:1.1em; margin-bottom:5px;">🔊 Громкость звуков</div>';
        h += '<input type="range" id="soundVolume" min="0" max="1" step="0.05" value="' + this._settings.soundVolume + '" oninput="Settings._setSoundVolume(this.value)" style="width:100%; accent-color:#c8a050; cursor:pointer;">';
        h += '<div style="text-align:right; color:#aaa; font-size:0.8em;" id="soundVolumeVal">' + Math.round(this._settings.soundVolume * 100) + '%</div>';
        h += '</div>';

        // --- ГРОМКОСТЬ МУЗЫКИ ---
        h += '<div style="margin-bottom:30px;">';
        h += '<div style="font-size:1.1em; margin-bottom:5px;">🎵 Громкость музыки</div>';
        h += '<input type="range" id="musicVolume" min="0" max="1" step="0.05" value="' + this._settings.musicVolume + '" oninput="Settings._setMusicVolume(this.value)" style="width:100%; accent-color:#c8a050; cursor:pointer;">';
        h += '<div style="text-align:right; color:#aaa; font-size:0.8em;" id="musicVolumeVal">' + Math.round(this._settings.musicVolume * 100) + '%</div>';
        h += '</div>';

        // --- ОПАСНАЯ ЗОНА (УДАЛЕНИЕ) ---
        h += '<div style="margin-top:40px; text-align:center; border-top:1px solid rgba(90,50,0,0.3); padding-top:20px;">';
        
        h += '<button onclick="Settings.resetCharacter()" style="background:#3a1010; border:2px solid #aa3333; border-radius:8px; padding:10px 20px; color:#ff8888; font-family:Georgia,serif; font-size:16px; font-weight:bold; cursor:pointer;">';
        h += '🗑️ Удалить персонажа';
        h += '</button>';
        h += '<div style="color:#888; font-size:0.8em; margin-top:10px;">Удалит весь прогресс, ресурсы и скины.</div>';
        h += '</div>';

        // --- ОБНОВЛЕНИЕ ---
        h += '<div style="margin-top:20px; text-align:center; padding-top:20px;">';
        
        h += '<button onclick="Settings.forceUpdateGame()" style="background:linear-gradient(180deg,#3a2a10,#1a1208); border:2px solid #c8a050; border-radius:8px; padding:10px 20px; color:#ffd700; font-family:Georgia,serif; font-size:16px; font-weight:bold; cursor:pointer;">';
        h += 'Очистить игру';
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
        // Проверка звука
        if (window.AudioManager) AudioManager.playSoundEffect('click');
    },

    _setMusicVolume: function(val) {
        this._settings.musicVolume = parseFloat(val);
        var valEl = document.getElementById('musicVolumeVal');
        if (valEl) valEl.textContent = Math.round(this._settings.musicVolume * 100) + '%';
        
        // ВАЖНО: принудительно обновляем audioPlayer из main.js
        try {
            if (window.audioPlayer) window.audioPlayer.volume = this._settings.musicVolume;
        } catch(e) {}
        
        // А также AudioManager и UI._currentMusic
        if (window.AudioManager && AudioManager.updateVolume) {
            AudioManager.updateVolume();
        }
        if (typeof UI !== 'undefined' && UI._currentMusic) {
            try { UI._currentMusic.volume = this._settings.musicVolume; } catch(e) {}
        }
        
        this.saveSettings();
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

    forceUpdateGame: function() {
        if (!confirm('Обновить игру до последней версии? Это очистит кэш и перезагрузит страницу.')) return;
        if (UI && UI._showToast) UI._showToast('⏳ Обновление...');
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (let registration of registrations) { registration.unregister(); }
            });
        }
        if ('caches' in window) {
            caches.keys().then(function(names) { for (let name of names) { caches.delete(name); } });
        }
        setTimeout(function() {
            var url = window.location.href.split('?')[0];
            window.location.href = url + '?updated=' + Date.now();
        }, 1000);
    }
};

console.log('⚙️ Настройки загружены!');

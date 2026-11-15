/**
 * Sherwood Settings — Настройки игры
 * Громкость, обновление, сброс.
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

    _applyVolumes: function() {
        // Применяем ко всем звукам
        if (UI && UI._sounds) {
            for (var key in UI._sounds) {
                if (key.indexOf('theme') !== -1 || key.indexOf('dungeon') !== -1) {
                    // Музыка
                    UI._sounds[key].volume = this._settings.musicVolume;
                } else {
                    // Звуки
                    UI._sounds[key].volume = this._settings.soundVolume;
                }
            }
        }
        // Применяем к текущей музыке
        if (UI && UI._currentMusic) {
            UI._currentMusic.volume = this._settings.musicVolume;
        }
    },

    showUI: function() {
        if (typeof UI === 'undefined') return;
        UI._playSound('click');

        var self = this;

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

        // --- КНОПКА ОБНОВЛЕНИЯ ---
        h += '<div style="margin-top:40px; text-align:center; border-top:1px solid rgba(90,50,0,0.3); padding-top:20px;">';
        h += '<div style="font-size:1em; margin-bottom:10px;">🔄 Обновление</div>';
        h += '<button onclick="Settings.forceUpdateGame()" style="background:linear-gradient(180deg,#3a2a10,#1a1208); border:2px solid #c8a050; border-radius:8px; padding:10px 20px; color:#ffd700; font-family:Georgia,serif; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.5); display:inline-flex; align-items:center; gap:8px;">';
        h += '<span style="font-size:20px;">🔄</span> Очистить кэш и обновить';
        h += '</button>';
        h += '<div style="color:#888; font-size:0.8em; margin-top:10px;">Нажми, если видишь старые картинки или ошибки</div>';
        h += '</div>';

        h += '</div>';

        UI._openScreenScrollable('⚙️ Настройки', 'settings', h, 'UI.loadHome()');
    },

    _setSoundVolume: function(val) {
        this._settings.soundVolume = parseFloat(val);
        var valEl = document.getElementById('soundVolumeVal');
        if (valEl) valEl.textContent = Math.round(this._settings.soundVolume * 100) + '%';
        
        // Применяем ко всем звукам, кроме музыки
        if (UI && UI._sounds) {
            for (var key in UI._sounds) {
                if (key.indexOf('theme') === -1 && key.indexOf('dungeon') === -1) {
                    UI._sounds[key].volume = this._settings.soundVolume;
                }
            }
        }
        this.saveSettings();
        UI._playSound('click'); // Проверка, что звук играет
    },

    _setMusicVolume: function(val) {
        this._settings.musicVolume = parseFloat(val);
        var valEl = document.getElementById('musicVolumeVal');
        if (valEl) valEl.textContent = Math.round(this._settings.musicVolume * 100) + '%';
        
        // Применяем к текущей музыке
        if (UI && UI._currentMusic) {
            UI._currentMusic.volume = this._settings.musicVolume;
        }
        this.saveSettings();
    },

    forceUpdateGame: function() {
        if (!confirm('Обновить игру до последней версии? Это очистит кэш и перезагрузит страницу.')) return;

        if (UI && UI._showToast) UI._showToast('⏳ Обновление...');

        // 1. Удаляем Service Worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (let registration of registrations) {
                    registration.unregister();
                }
            });
        }

        // 2. Удаляем все кэши
        if ('caches' in window) {
            caches.keys().then(function(names) {
                for (let name of names) {
                    caches.delete(name);
                }
            });
        }

        // 3. Перезагружаем страницу с обходом кэша
        setTimeout(function() {
            var url = window.location.href.split('?')[0];
            window.location.href = url + '?updated=' + Date.now();
        }, 1000);
    }
};

console.log('⚙️ Настройки загружены!');

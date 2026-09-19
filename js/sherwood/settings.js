/**
 * Sherwood Settings — Настройки игры
 */

if (typeof Settings === 'undefined') {
    var Settings = {
        data: {
            musicEnabled: true,
            soundEnabled: true,
            musicVolume: 0.6,
            soundVolume: 0.5,
            nameChanges: 0,
        },

        init: function() {
            var saved = localStorage.getItem('sherwood_settings');
            if (saved) {
                try {
                    this.data = JSON.parse(saved);
                } catch(e) {
                    console.warn('⚠️ Ошибка загрузки настроек:', e);
                }
            }
            // Значения по умолчанию для новых полей
            if (typeof this.data.musicVolume !== 'number') this.data.musicVolume = 0.6;
            if (typeof this.data.soundVolume !== 'number') this.data.soundVolume = 0.5;

            // Применяем громкость ко всем уже загруженным аудио
            this._applyVolumes();
            console.log('⚙️ Настройки загружены');
        },

        save: function() {
            localStorage.setItem('sherwood_settings', JSON.stringify(this.data));
        },

        get: function(key) {
            return this.data[key];
        },

        set: function(key, value) {
            this.data[key] = value;
            this.save();
        },

        isMusicEnabled: function() { return this.data.musicEnabled; },
        isSoundEnabled: function() { return this.data.soundEnabled; },
        getMusicVolume: function() { return this.data.musicVolume; },
        getSoundVolume: function() { return this.data.soundVolume; },

        // === ПРИМЕНЕНИЕ ГРОМКОСТИ КО ВСЕМ ЗВУКАМ И МУЗЫКЕ ===
        _applyVolumes: function() {
            var soundVol = this.data.soundEnabled ? this.data.soundVolume : 0;
            var musicVol = this.data.musicEnabled ? this.data.musicVolume : 0;

            // UI._sounds — объект Audio, используем в ui_screens.js
            if (typeof UI !== 'undefined' && UI._sounds) {
                for (var k in UI._sounds) {
                    try {
                        if (k.indexOf('dungeon_') === 0 || k.indexOf('main_theme') === 0 || k.indexOf('city_theme') === 0) {
                            UI._sounds[k].volume = musicVol;
                        } else {
                            UI._sounds[k].volume = soundVol;
                        }
                    } catch(e) {}
                }
            }

            // window.audioPlayer — старая музыка в main.js
            if (typeof window.audioPlayer !== 'undefined' && window.audioPlayer) {
                try { window.audioPlayer.volume = musicVol; } catch(e) {}
            }
        },

        // ========== UI ==========

        showUI: function() {
            if (typeof UI === 'undefined') {
                if (typeof showGenericScreen === 'function') {
                    showGenericScreen('Настройки', '⚙️');
                }
                return;
            }
            UI._playSound('click');

            var p = Sherwood.getPlayer();
            var nm = p ? p.name : 'Охотник';
            var nameChanges = p ? (p.nameChanges || 0) : 0;
            var soundVolume = Math.round((this.data.soundVolume || 0) * 100);
            var musicVolume = Math.round((this.data.musicVolume || 0) * 100);

            var h = '<div style="padding:10px;max-width:400px;margin:0 auto;">';

            // === ИМЯ ===
            h += '<div style="background:rgba(0,0,0,0.5);border-radius:8px;padding:12px;margin-bottom:10px;">';
            h += '<div style="color:#e0c080;font-weight:bold;margin-bottom:6px;">👤 Имя</div>';
            h += '<div style="display:flex;gap:8px;">';
            h += '<input id="settings-name-input" value="' + nm + '" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:6px 10px;color:#fff;font-size:0.9em;">';
            h += '<button onclick="Settings._changeNameFromUI()" style="background:#c9a040;border:none;border-radius:6px;padding:6px 14px;color:#000;font-weight:bold;cursor:pointer;font-size:0.8em;">Сохранить</button>';
            h += '</div>';
            if (nameChanges === 0) {
                h += '<div style="color:#4caf50;font-size:0.65em;margin-top:4px;">✅ Первая смена имени — бесплатно</div>';
            } else {
                h += '<div style="color:#ffd700;font-size:0.65em;margin-top:4px;">💰 Смена имени: 500 золота</div>';
            }
            h += '<div id="settings-name-status" style="color:#aaa;font-size:0.65em;margin-top:4px;"></div>';
            h += '</div>';

            // === ЗВУК И МУЗЫКА (ПОЛЗУНКИ) ===
            h += '<div style="background:rgba(0,0,0,0.5);border-radius:8px;padding:12px;margin-bottom:10px;">';

            // Звуки
            h += '<div style="margin-bottom:12px;">';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
            h += '<span style="color:#e0c080;font-size:0.9em;">🔊 Звуки</span>';
            h += '<span id="sound-vol-label" style="color:#fff;font-size:0.8em;font-weight:bold;">' + soundVolume + '%</span>';
            h += '</div>';
            h += '<input type="range" min="0" max="100" value="' + soundVolume + '" id="sound-volume-slider" oninput="Settings._onSoundVolumeChange(this.value)" style="width:100%;cursor:pointer;">';
            h += '</div>';

            // Музыка
            h += '<div>';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">';
            h += '<span style="color:#e0c080;font-size:0.9em;">🎵 Музыка</span>';
            h += '<span id="music-vol-label" style="color:#fff;font-size:0.8em;font-weight:bold;">' + musicVolume + '%</span>';
            h += '</div>';
            h += '<input type="range" min="0" max="100" value="' + musicVolume + '" id="music-volume-slider" oninput="Settings._onMusicVolumeChange(this.value)" style="width:100%;cursor:pointer;">';
            h += '</div>';

            h += '</div>';

            // === КНОПКИ ===
            h += '<button onclick="Settings._saveProgressFromUI()" style="width:100%;background:#4caf50;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:bold;font-size:0.9em;cursor:pointer;margin-bottom:8px;">💾 Сохранить прогресс</button>';
            h += '<button onclick="Settings._deleteCharacterFromUI()" style="width:100%;background:#f44336;border:none;border-radius:8px;padding:10px;color:#fff;font-weight:bold;font-size:0.9em;cursor:pointer;">🗑️ Удалить персонажа</button>';

            h += '</div>';

            UI._openScreenScrollable('⚙️ Настройки', 'settings', h);
        },

        // === ПОЛЗУНОК ЗВУКА ===
        _onSoundVolumeChange: function(val) {
            var v = parseInt(val, 10) / 100;
            this.data.soundVolume = v;
            if (v > 0 && !this.data.soundEnabled) this.data.soundEnabled = true;
            if (v === 0) this.data.soundEnabled = false;
            this.save();

            // Обновить метку
            var label = document.getElementById('sound-vol-label');
            if (label) label.textContent = Math.round(v * 100) + '%';

            // Применить к звукам
            this._applyVolumes();

            // Проиграть тестовый звук (если громкость > 0)
            if (v > 0 && typeof UI !== 'undefined' && UI._playSound) {
                UI._playSound('click');
            }
        },

        // === ПОЛЗУНОК МУЗЫКИ ===
        _onMusicVolumeChange: function(val) {
            var v = parseInt(val, 10) / 100;
            this.data.musicVolume = v;
            if (v > 0 && !this.data.musicEnabled) this.data.musicEnabled = true;
            if (v === 0) this.data.musicEnabled = false;
            this.save();

            // Обновить метку
            var label = document.getElementById('music-vol-label');
            if (label) label.textContent = Math.round(v * 100) + '%';

            // Применить к музыке
            this._applyVolumes();
        },

        _changeNameFromUI: function() {
            var inp = document.getElementById('settings-name-input');
            var st = document.getElementById('settings-name-status');
            if (!inp || !st) return;

            var nm = inp.value.trim();
            if (!nm) {
                st.textContent = '❌ Пустое имя';
                st.style.color = '#f44336';
                return;
            }

            var p = Sherwood.getPlayer();
            if (!p) return;

            if (!p.nameChanges) p.nameChanges = 0;

            if (p.nameChanges === 0) {
                p.name = nm;
                p.nameChanges = 1;
                Sherwood.saveGame();
                st.textContent = '✅ Имя изменено бесплатно!';
                st.style.color = '#4caf50';
            } else {
                if ((p.resources.gold || 0) < 500) {
                    st.textContent = '❌ Нужно 500 золота для смены имени';
                    st.style.color = '#f44336';
                    return;
                }
                Sherwood.spendResource('gold', 500);
                p.name = nm;
                p.nameChanges++;
                Sherwood.saveGame();
                st.textContent = '✅ Имя изменено за 500 золота!';
                st.style.color = '#4caf50';
            }

            UI.updateDisplay();
            this.showUI();
        },

        _saveProgressFromUI: function() {
            if (Sherwood.saveGameNow) {
                Sherwood.saveGameNow();
                UI._showToast('💾 Прогресс сохранён!');
            } else if (Sherwood.saveGame) {
                Sherwood.saveGame();
                UI._showToast('💾 Прогресс сохранён!');
            }
        },

        // === ПОЛНОЕ УДАЛЕНИЕ ПЕРСОНАЖА ===
        _deleteCharacterFromUI: function() {
            var confirmed = confirm('⚠️ УДАЛИТЬ ПЕРСОНАЖА?\n\nВесь прогресс будет удалён БЕЗВОЗВРАТНО:\n• Уровень, опыт, статы\n• Ресурсы, сумка, оборудование\n• Прогресс подземок, порталов, рейда\n• Трофеи, облики, таланты\n• Все сохранения\n\nПродолжить?');
            if (!confirmed) return;

            var confirmed2 = confirm('⚠️ ПОСЛЕДНЕЕ ПРЕДУПРЕЖДЕНИЕ\n\nТочно удалить? Это нельзя отменить!');
            if (!confirmed2) return;

            try {
                // 1. Удаляем сохранение игры
                localStorage.removeItem('sherwood_save_data');
                localStorage.removeItem('sherwood_save');
                localStorage.removeItem('sherwood_settings');
                localStorage.removeItem('active_skin');

                // 2. Удаляем активного игрока из памяти
                if (Sherwood._player) {
                    Sherwood._player = null;
                }

                // 3. Создаём нового (чистого) игрока
                Sherwood._createNewPlayer();

                // 4. Сохраняем чистого игрока
                if (Sherwood.saveGameNow) Sherwood.saveGameNow();
                else if (Sherwood.saveGame) Sherwood.saveGame();

                // 5. Обновляем UI
                if (typeof UI !== 'undefined') {
                    if (UI.updateDisplay) UI.updateDisplay();
                    UI._showToast('🗑️ Персонаж удалён. Начинаем с нуля!');
                }

                // 6. Возвращаемся на главный экран (перезагрузка гарантирует полную очистку)
                setTimeout(function() {
                    try {
                        if (typeof UI !== 'undefined' && UI._stopMusic) UI._stopMusic();
                    } catch(e) {}
                    location.reload();
                }, 800);
            } catch(e) {
                console.error('Ошибка удаления персонажа:', e);
                UI._showToast('❌ Ошибка при удалении');
            }
        }
    };
}

Settings.init();

window.Settings = Settings;
window.Sherwood = window.Sherwood || {};
window.Sherwood.Settings = Settings;

console.log('⚙️ Настройки загружены!');

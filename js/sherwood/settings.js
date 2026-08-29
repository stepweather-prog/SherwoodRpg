/**
 * Sherwood Settings — Настройки игры
 */

if (typeof Settings === 'undefined') {
    var Settings = {
        data: {
            musicEnabled: true,
            soundEnabled: true,
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

        toggleMusic: function() {
            this.data.musicEnabled = !this.data.musicEnabled;
            this.save();
            return this.data.musicEnabled;
        },

        toggleSound: function() {
            this.data.soundEnabled = !this.data.soundEnabled;
            this.save();
            return this.data.soundEnabled;
        },

        isMusicEnabled: function() {
            return this.data.musicEnabled;
        },

        isSoundEnabled: function() {
            return this.data.soundEnabled;
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
            var musicEnabled = this.isMusicEnabled();
            var soundEnabled = this.isSoundEnabled();

            var h = '<div style="padding:10px;max-width:400px;margin:0 auto;">';

            // Имя
            h += '<div style="background:rgba(0,0,0,0.5);border-radius:8px;padding:12px;margin-bottom:10px;">';
            h += '<div style="color:#e0c080;font-weight:bold;margin-bottom:6px;">👤 Имя</div>';
            h += '<div style="display:flex;gap:8px;">';
            h += '<input id="settings-name-input" value="' + nm + '" style="flex:1;background:rgba(255,255,255,0.1);border:1px solid #555;border-radius:6px;padding:6px 10px;color:#fff;font-size:0.9em;">';
            h += '<button onclick="Settings._changeNameFromUI()" class="btn" style="padding:4px 14px;font-size:0.8em;">Сохранить</button>';
            h += '</div>';
            if (nameChanges === 0) {
                h += '<div style="color:#4caf50;font-size:0.65em;margin-top:4px;">✅ Первая смена имени — бесплатно</div>';
            } else {
                h += '<div style="color:#ffd700;font-size:0.65em;margin-top:4px;">💰 Смена имени: 500 золота</div>';
            }
            h += '<div id="settings-name-status" style="color:#aaa;font-size:0.65em;margin-top:4px;"></div>';
            h += '</div>';

            // Звук и музыка
            h += '<div style="background:rgba(0,0,0,0.5);border-radius:8px;padding:12px;margin-bottom:10px;">';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">';
            h += '<span style="color:#e0c080;">🔊 Звуки</span>';
            h += '<button onclick="Settings._toggleSoundFromUI()" style="width:50px;height:26px;background:' + (soundEnabled ? '#4caf50' : '#555') + ';border:none;border-radius:13px;cursor:pointer;position:relative;">';
            h += '<span style="position:absolute;top:3px;' + (soundEnabled ? 'right:3px;' : 'left:3px;') + 'width:20px;height:20px;background:#fff;border-radius:50%;transition:0.2s;"></span>';
            h += '</button>';
            h += '</div>';
            h += '<div style="display:flex;justify-content:space-between;align-items:center;">';
            h += '<span style="color:#e0c080;">🎵 Музыка</span>';
            h += '<button onclick="Settings._toggleMusicFromUI()" style="width:50px;height:26px;background:' + (musicEnabled ? '#4caf50' : '#555') + ';border:none;border-radius:13px;cursor:pointer;position:relative;">';
            h += '<span style="position:absolute;top:3px;' + (musicEnabled ? 'right:3px;' : 'left:3px;') + 'width:20px;height:20px;background:#fff;border-radius:50%;transition:0.2s;"></span>';
            h += '</button>';
            h += '</div>';
            h += '</div>';

            // Кнопки
            h += '<button onclick="Settings._saveProgressFromUI()" class="btn btn-success" style="width:100%;padding:8px;margin-bottom:6px;font-size:0.9em;">💾 Сохранить прогресс</button>';
            h += '<button onclick="Settings._resetFromUI()" class="btn btn-danger" style="width:100%;padding:8px;font-size:0.9em;">🔄 Сбросить персонажа (5000 золота)</button>';
            h += '</div>';

            UI._openScreenScrollable('⚙️ Настройки', 'settings', h);
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

        _toggleSoundFromUI: function() {
            this.toggleSound();
            this.showUI();
        },

        _toggleMusicFromUI: function() {
            this.toggleMusic();
            if (typeof UI !== 'undefined') {
                if (this.isMusicEnabled()) {
                    UI._playMusic('main_theme');
                } else {
                    UI._stopMusic();
                }
            }
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

        _resetFromUI: function() {
            var p = Sherwood.getPlayer();
            if (!p) return;

            if ((p.resources.gold || 0) < 5000) {
                UI._showToast('❌ Нужно 5000 золота для сброса');
                return;
            }

            if (!confirm('⚠️ Сбросить персонажа за 5000 золота? Весь прогресс будет удалён!')) return;

            var remainingGold = (p.resources.gold || 0) - 5000;
            var remainingSilver = p.resources.silver || 0;

            Sherwood._createNewPlayer();
            p = Sherwood.getPlayer();
            p.resources.gold = remainingGold;
            p.resources.silver = remainingSilver;
            p.nameChanges = 0;

            Sherwood._recalcStats();
            Sherwood.saveGameNow();

            UI._showToast('🔄 Персонаж сброшен!');
            if (typeof UI !== 'undefined' && UI.loadHome) {
                UI.loadHome();
            }
        }
    };
}

Settings.init();

window.Settings = Settings;
window.Sherwood = window.Sherwood || {};
window.Sherwood.Settings = Settings;

console.log('⚙️ Настройки загружены!');

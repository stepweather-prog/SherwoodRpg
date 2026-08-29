/**
 * Sherwood Settings — Настройки игры
 * Совмещённый модуль без зависимости от SherwoodUI
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
            console.log('🎵 Музыка:', this.data.musicEnabled ? 'вкл' : 'выкл');
            console.log('🔊 Звук:', this.data.soundEnabled ? 'вкл' : 'выкл');
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
        
        // ============================================================
        //  UI — ПОКАЗ НАСТРОЕК
        // ============================================================
        
        showUI: function() {
            if (typeof window.showSettingsScreen === 'function') {
                window.showSettingsScreen();
                return;
            }
            this._renderSettingsUI();
        },
        
        _renderSettingsUI: function() {
            var old = document.getElementById('settings-screen');
            if (old) old.remove();
            
            var musicEnabled = this.isMusicEnabled();
            var soundEnabled = this.isSoundEnabled();
            
            var screenHTML = `
            <div id="settings-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/settings_visual.png') center/cover no-repeat;display:flex;flex-direction:column;">
                <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
                    <button onclick="Settings.closeUI()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                        <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
                    </button>
                    <span style="color:#e0c080;font-size:1.2em;">⚙️ Настройки</span>
                </div>
                
                <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;color:#fff;font-family:monospace;">
                    <div style="background:rgba(0,0,0,0.7);border:2px solid #8B4513;border-radius:12px;padding:30px;max-width:400px;width:100%;">
                        
                        <div style="margin-bottom:15px;">
                            <button onclick="Settings.toggleMusicFromUI()" class="btn ${musicEnabled ? 'btn-gold' : ''}" style="width:100%;padding:12px;font-size:16px;">
                                ${musicEnabled ? '🔊 Музыка: Включена' : '🔇 Музыка: Выключена'}
                            </button>
                        </div>
                        
                        <div style="margin-bottom:20px;">
                            <button onclick="Settings.toggleSoundFromUI()" class="btn ${soundEnabled ? 'btn-gold' : ''}" style="width:100%;padding:12px;font-size:16px;">
                                ${soundEnabled ? '🔊 Звук: Включён' : '🔇 Звук: Выключён'}
                            </button>
                        </div>
                        
                        <hr style="border-color:#333;margin:10px 0;">
                        
                        <button onclick="Settings.resetFromUI()" class="btn btn-danger" style="width:100%;padding:12px;font-size:14px;">
                            🔄 Сбросить прогресс
                        </button>
                        
                        <div style="color:#555;font-size:11px;margin-top:15px;text-align:center;">
                            Имя игрока: ${Sherwood.getPlayer ? Sherwood.getPlayer().name || 'Охотник' : 'Охотник'}
                            <br>Уровень: ${Sherwood.getPlayer ? Sherwood.getPlayer().level || 1 : 1}
                        </div>
                    </div>
                </div>
            </div>`;
            
            document.body.insertAdjacentHTML('beforeend', screenHTML);
        },
        
        // ============================================================
        //  UI ХЭНДЛЕРЫ
        // ============================================================
        
        toggleMusicFromUI: function() {
            var enabled = this.toggleMusic();
            
            // Обновляем музыку в main.js
            if (typeof window.toggleMusicSetting === 'function') {
                window.toggleMusicSetting();
            } else {
                // Если функция не определена, просто обновляем UI
                this._renderSettingsUI();
            }
            
            this._renderSettingsUI();
        },
        
        toggleSoundFromUI: function() {
            this.toggleSound();
            this._renderSettingsUI();
        },
        
        resetFromUI: function() {
            if (confirm('⚠️ Точно сбросить весь прогресс? Это действие необратимо!')) {
                localStorage.removeItem('sherwood_save');
                localStorage.removeItem('sherwood_settings');
                localStorage.removeItem('sherwood_dungeon_progress');
                localStorage.removeItem('sherwood_save_data');
                location.reload();
            }
        },
        
        // ============================================================
        //  ЗАКРЫТИЕ
        // ============================================================
        
        closeUI: function() {
            var screen = document.getElementById('settings-screen');
            if (screen) screen.remove();
            
            if (typeof window.showHomeScreen === 'function') {
                window.showHomeScreen();
            }
        }
    };
}

// ---------- ИНИЦИАЛИЗАЦИЯ ----------
Settings.init();

// ---------- ЭКСПОРТ В ГЛОБАЛЬНЫЙ ОБЪЕКТ ----------
window.Settings = Settings;
window.Sherwood = window.Sherwood || {};
window.Sherwood.Settings = Settings;

console.log('⚙️ Настройки загружены!');

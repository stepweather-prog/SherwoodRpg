// js/settings.js — совмещённый модуль настроек
const Settings = {
    data: {
        musicEnabled: true,
        soundEnabled: true,
        nameChanges: 0,
    },
    
    init: function() {
        const saved = localStorage.getItem('sherwood_settings');
        if (saved) {
            try {
                this.data = JSON.parse(saved);
            } catch(e) {
                console.warn('Ошибка загрузки настроек');
            }
        }
        
        // Совместимость со старым UI
        if (typeof SherwoodUI !== 'undefined') {
            SherwoodUI._soundEnabled = this.data.soundEnabled;
            SherwoodUI._musicEnabled = this.data.musicEnabled;
        }
    },
    
    save: function() {
        localStorage.setItem('sherwood_settings', JSON.stringify(this.data));
        
        if (typeof SherwoodUI !== 'undefined') {
            SherwoodUI._soundEnabled = this.data.soundEnabled;
            SherwoodUI._musicEnabled = this.data.musicEnabled;
        }
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
    
    // Методы для старого UI
    toggleSoundSetting: function() {
        return this.toggleSound();
    },
    
    toggleMusicSetting: function() {
        return this.toggleMusic();
    }
};

Settings.init();

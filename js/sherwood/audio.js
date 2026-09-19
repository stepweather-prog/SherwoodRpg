// js/audio.js — ПОЛНЫЙ ПЛЕЙЛИСТ (ВСЕ ТРЕКИ + ЗВУКОВЫЕ ЭФФЕКТЫ)
const AudioManager = {
    cityTracks: [
        'assets/assets2/music/city_theme1.ogg',
        'assets/assets2/music/main_theme_6.ogg',
        'assets/assets2/music/main_theme_5.ogg',
        'assets/assets2/music/main_theme_4.ogg',
        'assets/assets2/music/main_theme_3.ogg',
        'assets/assets2/music/main_theme_2.ogg',
        'assets/assets2/music/main_theme.ogg',
        'assets/assets2/music/dungeon_1.ogg',
        'assets/assets2/music/dungeon_2.ogg',
        'assets/assets2/music/dungeon_3.ogg'
    ],
    soundEffects: [
        'assets/assets2/tune/click.wav',
        'assets/assets2/tune/hit.wav',
        'assets/assets2/tune/chest_open.wav',
        'assets/assets2/tune/altar.wav',
        'assets/assets2/tune/cauldron.wav',
        'assets/assets2/tune/potion.wav',
        'assets/assets2/tune/loot_fly.wav',
        'assets/assets2/tune/trap.wav',
        'assets/assets2/tune/tile_open.wav',
        'assets/assets2/tune/steps.wav',
        'assets/assets2/tune/bag_drop.wav',
        'assets/assets2/tune/defeat.wav',
        'assets/assets2/tune/levelup.wav',
        'assets/assets2/tune/forge.wav',
        'assets/assets2/tune/heal.wav',
        'assets/assets2/tune/victory.wav'
    ],
    currentTrackIndex: 0,
    currentMusic: null,
    audioContext: null,

    init() {
        this.currentTrackIndex = 0;
        this.currentMusic = null;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {}
    },

    // === ГРОМКОСТЬ МУЗЫКИ ИЗ НАСТРОЕК ===
    _getMusicVolume: function() {
        if (typeof Settings !== 'undefined' && Settings.getMusicVolume) {
            return Settings.getMusicVolume();
        }
        return 0.5;
    },
    _isMusicEnabled: function() {
        if (typeof Settings !== 'undefined' && Settings.isMusicEnabled) {
            return Settings.isMusicEnabled();
        }
        return true;
    },

    // === ГРОМКОСТЬ ЗВУКОВ ИЗ НАСТРОЕК ===
    _getSoundVolume: function() {
        if (typeof Settings !== 'undefined' && Settings.getSoundVolume) {
            return Settings.getSoundVolume();
        }
        return 0.5;
    },
    _isSoundEnabled: function() {
        if (typeof Settings !== 'undefined' && Settings.isSoundEnabled) {
            return Settings.isSoundEnabled();
        }
        return true;
    },

    playCityTheme() {
        if (!this._isMusicEnabled()) return;

        this.stopCityTheme();

        const trackSrc = this.cityTracks[this.currentTrackIndex];
        this.currentMusic = new Audio(trackSrc);
        this.currentMusic.loop = false;
        this.currentMusic.volume = this._getMusicVolume();   // ← из Settings

        this.currentMusic.addEventListener('ended', () => {
            this.playNextTrack();
        });

        this.currentMusic.play().catch(() => {});
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.cityTracks.length;
    },

    playNextTrack() {
        if (!this._isMusicEnabled()) return;

        this.stopCityTheme();

        const trackSrc = this.cityTracks[this.currentTrackIndex];
        this.currentMusic = new Audio(trackSrc);
        this.currentMusic.loop = false;
        this.currentMusic.volume = this._getMusicVolume();   // ← из Settings

        this.currentMusic.addEventListener('ended', () => {
            this.playNextTrack();
        });

        this.currentMusic.play().catch(() => {});
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.cityTracks.length;
    },

    // === ОБНОВИТЬ ГРОМКОСТЬ УЖЕ ИГРАЮЩЕГО ТРЕКА ===
    updateVolume: function() {
        if (this.currentMusic) {
            try { this.currentMusic.volume = this._getMusicVolume(); } catch(e) {}
        }
    },

    playSoundEffect(soundKey) {
        if (!this._isSoundEnabled()) return;

        const soundMap = {
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

        if (!soundMap[soundKey]) return;

        const audio = new Audio(soundMap[soundKey]);
        audio.volume = this._getSoundVolume();   // ← из Settings
        audio.play().catch(() => {});
    },

    stopCityTheme() {
        if (this.currentMusic) {
            try {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            } catch(e) {}
            this.currentMusic = null;
        }
    }
};

// Инициализация
AudioManager.init();

window.AudioManager = AudioManager;

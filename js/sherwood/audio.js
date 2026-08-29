// js/audio.js — ОБНОВЛЁННЫЙ ПЛЕЙЛИСТ (6 ТРЕКОВ, ПО ПОРЯДКУ)
const AudioManager = {
    cityTracks: [
        'assets/assets2/music/city_theme1.ogg',
        'assets/assets2/music/city_theme2.ogg',
        'assets/assets2/music/city_theme3.ogg',
        'assets/assets2/music/city_theme4.ogg',
        'assets/assets2/music/city_theme5.ogg',
        'assets/assets2/music/main_theme_6.ogg'
    ],
    currentTrackIndex: 0,
    currentMusic: null,
    
    init() {
        this.currentTrackIndex = 0;
    },
    
    playCityTheme() {
        // Проверяем настройки (музыка выключена — не играем)
        if (typeof Settings !== 'undefined' && Settings.isMusicEnabled && !Settings.isMusicEnabled()) {
            return;
        }
        
        this.stopCityTheme();
        
        const trackSrc = this.cityTracks[this.currentTrackIndex];
        this.currentMusic = new Audio(trackSrc);
        
        // НЕ зацикливаем один трек, а ждём его окончания, чтобы запустить следующий
        this.currentMusic.loop = false;
        this.currentMusic.volume = 0.5;
        
        // Когда трек закончился — играем следующий по порядку
        this.currentMusic.addEventListener('ended', () => {
            this.playNextTrack();
        });
        
        this.currentMusic.play().catch(() => {});
        
        // Переключаем индекс на следующий
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.cityTracks.length;
    },
    
    playNextTrack() {
        if (typeof Settings !== 'undefined' && Settings.isMusicEnabled && !Settings.isMusicEnabled()) {
            return;
        }
        
        this.stopCityTheme();
        
        const trackSrc = this.cityTracks[this.currentTrackIndex];
        this.currentMusic = new Audio(trackSrc);
        
        this.currentMusic.loop = false;
        this.currentMusic.volume = 0.5;
        
        this.currentMusic.addEventListener('ended', () => {
            this.playNextTrack();
        });
        
        this.currentMusic.play().catch(() => {});
        
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.cityTracks.length;
    },
    
    stopCityTheme() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }
};

// Инициализация
AudioManager.init();

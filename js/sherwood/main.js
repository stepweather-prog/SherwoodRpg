// ============================================================
//  js/main.js — ЧИСТОВАЯ ВЕРСИЯ (ТОЛЬКО НАВИГАЦИЯ)
// ============================================================

// ---------- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ----------
const loadingScreen = document.getElementById('loadingScreen');
const homeScreen = document.getElementById('homeScreen');
const playButton = document.getElementById('playButton');
const hero = document.getElementById('hero');
const menuScreen = document.getElementById('menuScreen');

let currentScreen = 'loading';

// ---------- ДАННЫЕ ИГРОКА ----------
const PlayerStats = {
    exp: 0,
    damage: 100,
    armor: 100,
    hp: 100,
    maxHp: 100,
    gold: 150,
    silver: 150,
    level: 1,
    skillPoints: 3,
    stats: {
        strength: 5,
        armor: 3,
        health: 5
    },
    skills: {
        heal: false,
        fireball: false,
        shield: false
    }
};

// ---------- МУЗЫКА ----------
const musicPlaylist = [
    'assets/assets2/music/city_theme1.ogg',
    'assets/assets2/music/main_theme_6.ogg'
];
let currentMusicIndex = 0;
let isMusicPlaying = false;
let audioPlayer = null;

function playNextMusic() {
    if (!isMusicPlaying) return;
    if (!audioPlayer) {
        audioPlayer = new Audio();
        audioPlayer.loop = false;
        audioPlayer.addEventListener('ended', playNextMusic);
    }
    audioPlayer.src = musicPlaylist[currentMusicIndex];
    audioPlayer.play().catch(() => {});
    currentMusicIndex++;
    if (currentMusicIndex >= musicPlaylist.length) currentMusicIndex = 0;
}

function startMainMusic() {
    isMusicPlaying = true;
    playNextMusic();
}

function stopMainMusic() {
    isMusicPlaying = false;
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    }
}

// ---------- СОХРАНЕНИЕ ----------
function saveGameData() {
    try {
        const data = { player: PlayerStats, timestamp: Date.now() };
        localStorage.setItem('sherwood_save', JSON.stringify(data));
        console.log('💾 Игра сохранена');
    } catch(e) {
        console.error('❌ Ошибка сохранения:', e);
    }
}

function loadGameData() {
    try {
        const raw = localStorage.getItem('sherwood_save');
        if (raw) {
            const data = JSON.parse(raw);
            if (data.player) {
                Object.assign(PlayerStats, data.player);
                console.log('📂 Загружено сохранение');
                updateTopBar();
                return true;
            }
        }
    } catch(e) {
        console.error('❌ Ошибка загрузки:', e);
    }
    return false;
}

// ---------- ОБНОВЛЕНИЕ HUD ----------
function updateTopBar() {
    const ids = ['expVal', 'dmgVal', 'armorVal', 'hpVal', 'goldVal', 'silverVal', 'levelVal'];
    const values = [
        PlayerStats.exp,
        PlayerStats.damage,
        PlayerStats.armor,
        `${PlayerStats.hp}/${PlayerStats.maxHp}`,
        PlayerStats.gold,
        PlayerStats.silver,
        PlayerStats.level
    ];
    ids.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.innerText = values[i];
    });
}

// ---------- КАРУСЕЛЬ ----------
let currentSectionIndex = 0;
const sections = [
    { name: 'Профиль', icon: 'player_profile.png' },
    { name: 'Квесты', icon: 'quest.png' },
    { name: 'Таверна', icon: 'tavern.png' },
    { name: 'Порталы', icon: 'portal.png' },
    { name: 'Подземка', icon: 'subway.png' },
    { name: 'Рынок', icon: 'sherwood_market.png' },
    { name: 'Кузница', icon: 'forge.png' },
    { name: 'Бестиарий', icon: 'bestiary.png' },
    { name: 'Рейд', icon: 'raid.png' },
    { name: 'Настройки', icon: 'settings.png' }
];

function initMainCarousel() {
    const woodSign = document.getElementById('sectionName');
    const sectionIcon = document.getElementById('sectionIcon');
    const leftArrow = document.getElementById('carouselLeftArrow');
    const rightArrow = document.getElementById('carouselRightArrow');

    if (!woodSign || !sectionIcon) return;

    if (leftArrow) leftArrow.onclick = (e) => { e.stopPropagation(); prevSection(); };
    if (rightArrow) rightArrow.onclick = (e) => { e.stopPropagation(); nextSection(); };
    if (hero) hero.onclick = () => cycleSkin();

    const gameZone = document.getElementById('gameZone');
    if (gameZone) {
        let touchStartX = 0;
        gameZone.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
        gameZone.addEventListener('touchend', (e) => {
            const delta = e.changedTouches[0].clientX - touchStartX;
            if (delta < -50) nextSection();
            else if (delta > 50) prevSection();
        });
    }
    updateSectionDisplay();
}

function updateSectionDisplay() {
    const woodSign = document.getElementById('sectionName');
    const sectionIcon = document.getElementById('sectionIcon');
    if (!woodSign || !sectionIcon) return;
    const section = sections[currentSectionIndex];
    woodSign.textContent = section.name;
    sectionIcon.src = `assets/assets2/icons/${section.icon}`;
}

function nextSection() {
    currentSectionIndex = (currentSectionIndex + 1) % sections.length;
    updateSectionDisplay();
}

function prevSection() {
    currentSectionIndex = (currentSectionIndex - 1 + sections.length) % sections.length;
    updateSectionDisplay();
}

// ---------- ВХОД В РАЗДЕЛ ----------
function enterSection() {
    const section = sections[currentSectionIndex];
    if (!section) return;
    console.log(`🚪 Вход в раздел: ${section.name}`);

    // ВСЕ ЭКРАНЫ ВЫНЕСЕНЫ В ui_screens.js
    switch(section.name) {
        case 'Подземка':   showDungeonScreen(); break;
        case 'Квесты':     showQuestsScreen(); break;
        case 'Таверна':    showTavernScreen(); break;
        case 'Порталы':    showPortalsScreen(); break;
        case 'Рейд':       showRaidScreen(); break;
        case 'Бестиарий':  showBestiaryScreen(); break;
        case 'Кузница':    showForgeScreen(); break;
        case 'Рынок':      showMarketScreen(); break;
        case 'Профиль':    showProfileScreen(); break;
        case 'Настройки':  showSettingsScreen(); break;
        default:           showGenericScreen(section.name, '📌');
    }
}

// ---------- ВОЗВРАТ НА ГЛАВНУЮ ----------
function showHomeScreen() {
    closeAllScreens();
    homeScreen.style.display = 'flex';
    menuScreen.style.display = 'none';
    currentScreen = 'home';
    updateTopBar();
    initMainCarousel();
    if (!isMusicPlaying) startMainMusic();
    console.log('🏠 Возврат на главную');
}

// ---------- ЗАКРЫТИЕ ВСЕХ ЭКРАНОВ ----------
function closeAllScreens() {
    const ids = [
        'quests-screen', 'tavern-screen', 'dungeon-screen',
        'portals-screen', 'raid-screen', 'bestiary-screen',
        'profile-screen', 'settings-screen', 'daily-screen',
        'talents-screen', 'generic-screen', 'section-screen',
        'battle-overlay', 'portal-battle-overlay', 'raid-battle-overlay'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.remove();
    });
}

// ---------- СМЕНА СКИНА ----------
function cycleSkin() {
    const skins = [
        'skin1_01.png',
        'skin1_02.png',
        'skin1_03.png',
        'skin2_01.png',
        'skin2_02.png',
        'skin2_03.png'
    ];
    
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;
    
    const currentSrc = heroEl.src;
    const currentSkin = currentSrc.split('/').pop();
    
    let currentIndex = skins.indexOf(currentSkin);
    if (currentIndex === -1) currentIndex = 0;
    
    const nextIndex = (currentIndex + 1) % skins.length;
    const nextSkin = skins[nextIndex];
    
    heroEl.src = 'assets/hero_skins/' + nextSkin;
    console.log('🎭 Скин изменён:', nextSkin);
    
    try {
        localStorage.setItem('active_skin', nextSkin);
    } catch(e) {}
}

function loadSavedSkin() {
    const heroEl = document.getElementById('hero');
    if (!heroEl) return;
    
    try {
        const savedSkin = localStorage.getItem('active_skin');
        if (savedSkin) {
            heroEl.src = 'assets/hero_skins/' + savedSkin;
            console.log('🎭 Загружен скин:', savedSkin);
        }
    } catch(e) {}
}

// ---------- КЛИКИ ----------
(function setupClicks() {
    setTimeout(function() {
        console.log('🔧 Настройка кликов...');
        
        const sectionIcon = document.getElementById('sectionIcon');
        if (sectionIcon) {
            sectionIcon.style.cursor = 'pointer';
            sectionIcon.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('🖱️ Клик по иконке раздела!');
                enterSection();
            });
            console.log('✅ Иконка раздела: вход');
        }
        
        const sectionName = document.getElementById('sectionName');
        if (sectionName) {
            sectionName.style.cursor = 'pointer';
            sectionName.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('🖱️ Клик по названию раздела!');
                enterSection();
            });
            console.log('✅ Название раздела: вход');
        }
        
        const heroEl = document.getElementById('hero');
        if (heroEl) {
            heroEl.style.cursor = 'pointer';
            heroEl.addEventListener('click', function(e) {
                e.stopPropagation();
                console.log('🖱️ Клик по герою → смена скина!');
                cycleSkin();
            });
            console.log('✅ Герой: смена скина');
        }
        
        console.log('🔧 Клики настроены!');
    }, 1000);
})();

// ---------- ЗАПУСК ----------
playButton.addEventListener('click', () => {
    loadingScreen.style.display = 'none';
    homeScreen.style.display = 'flex';
    currentScreen = 'home';
    updateTopBar();
    initMainCarousel();
    startMainMusic();
    loadSavedSkin();
    
    if (typeof Sherwood !== 'undefined') {
        const modules = ['Quests', 'Tavern', 'Portal', 'Raid', 'Bestiary', 'Dungeon2D5', 'Forge', 'BlackMarket'];
        modules.forEach(name => {
            if (Sherwood[name] && typeof Sherwood[name].init === 'function') {
                try {
                    Sherwood[name].init();
                    console.log(`✅ ${name} инициализирован`);
                } catch(e) {
                    console.warn(`⚠️ Ошибка в ${name}:`, e);
                }
            }
        });
    }
});

// ---------- ЭКСПОРТ ----------
window.PlayerStats = PlayerStats;
window.updateTopBar = updateTopBar;
window.showHomeScreen = showHomeScreen;
window.enterSection = enterSection;
window.closeAllScreens = closeAllScreens;
window.saveGameData = saveGameData;
window.loadGameData = loadGameData;
window.startMainMusic = startMainMusic;
window.stopMainMusic = stopMainMusic;
window.cycleSkin = cycleSkin;
window.loadSavedSkin = loadSavedSkin;

console.log('🌳 Sherwood RPG загружена!');
console.log(`📊 Уровень: ${PlayerStats.level}, HP: ${PlayerStats.hp}/${PlayerStats.maxHp}`);
console.log('💾 Сохранение:', localStorage.getItem('sherwood_save') ? 'есть' : 'нет');

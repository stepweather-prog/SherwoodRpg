// ============================================================
//  js/main.js — ПОЛНАЯ ВЕРСИЯ
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

// ============================================================
//  СКРЫТИЕ / ПОКАЗ ЭЛЕМЕНТОВ ГЛАВНОГО ЭКРАНА
// ============================================================

function hideHomeElements() {
    const ids = [
        'arch', 'hero', 'sectionIcon', 'sectionName',
        'carouselLeftArrow', 'carouselRightArrow',
        'leftDivider', 'rightDivider', 'topBar',
        'substrate' // ДОБАВИТЬ ЭТО
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

function showHomeElements() {
    const ids = [
        'arch', 'hero', 'sectionIcon', 'sectionName',
        'carouselLeftArrow', 'carouselRightArrow',
        'leftDivider', 'rightDivider', 'topBar',
        'substrate' // ДОБАВИТЬ ЭТО
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = '';
    });
}

// ============================================================
//  ВХОД В РАЗДЕЛ
// ============================================================

function enterSection() {
    const section = sections[currentSectionIndex];
    if (!section) return;
    console.log(`🚪 Вход в раздел: ${section.name}`);

    hideHomeElements();

    const layer = document.getElementById('ui-screen-layer');
    if (layer) {
        layer.style.display = 'block';
    }

    switch(section.name) {
        case 'Профиль':
            UI.profile();
            break;
        case 'Квесты':
            UI.quests();
            break;
        case 'Таверна':
            UI.tavern();
            break;
        case 'Порталы':
            UI.portals();
            break;
        case 'Подземка':
            UI.dungeon();
            break;
        case 'Рынок':
            UI.market();
            break;
        case 'Кузница':
            UI.forge();
            break;
        case 'Бестиарий':
            UI.bestiary();
            break;
        case 'Рейд':
            UI.raid();
            break;
        case 'Настройки':
            UI.settings();
            break;
        default:
            showGenericScreen(section.name, '📌');
    }
}

// ---------- ВОЗВРАТ НА ГЛАВНУЮ ----------
function showHomeScreen() {
    const layer = document.getElementById('ui-screen-layer');
    if (layer) {
        layer.style.display = 'none';
        layer.innerHTML = '';
    }
    
    showHomeElements();
    
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
        'battle-overlay', 'portal-battle-overlay', 'raid-battle-overlay',
        'combat-overlay', 'dungeon2d5-container'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === 'dungeon2d5-container') {
                el.style.display = 'none';
            } else {
                el.remove();
            }
        }
    });
}

// ---------- УНИВЕРСАЛЬНЫЙ ЭКРАН-ЗАГЛУШКА ----------
function showGenericScreen(title, icon) {
    closeAllScreens();
    const screenHTML = `
    <div id="generic-screen" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:300;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeGenericScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">${title}</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;">
            <div style="font-size:64px;margin-bottom:20px;">${icon}</div>
            <div style="font-size:24px;color:#ffa500;">${title}</div>
            <div style="color:#888;font-size:14px;margin-top:10px;">В разработке</div>
            <button onclick="closeGenericScreen()" class="btn" style="margin-top:20px;padding:10px 30px;">Назад</button>
        </div>
    </div>`;
    document.getElementById('gameZone').insertAdjacentHTML('beforeend', screenHTML);
}

function closeGenericScreen() {
    const screen = document.getElementById('generic-screen');
    if (screen) screen.remove();
    showHomeScreen();
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
// Создаём кнопку программно
(function createPlayButton() {
    const gameZone = document.getElementById('gameZone');
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (!gameZone || !loadingScreen) return;
    
    const btn = document.createElement('button');
    btn.id = 'playButton';
    btn.textContent = 'ВОЙТИ';
    btn.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:200px;height:60px;background:#c9a040;border:none;border-radius:10px;color:#000;font-weight:bold;font-size:1.2em;cursor:pointer;z-index:2001;font-family:Georgia,serif;letter-spacing:2px;box-shadow:0 4px 15px rgba(0,0,0,0.5);';
    
    loadingScreen.appendChild(btn);
    
    btn.addEventListener('click', function() {
        btn.style.display = 'none';
        loadingScreen.style.display = 'none';
        
        const video = document.createElement('video');
        video.src = 'assets/assets2/animation/LoadingSherwoodRpg.webm';
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;object-fit:fill;z-index:3000;';
        
        gameZone.appendChild(video);
        
        video.onended = function() {
            video.remove();
            homeScreen.style.display = 'flex';
            currentScreen = 'home';
            updateTopBar();
            initMainCarousel();
            startMainMusic();
            loadSavedSkin();
        };
        
        video.onerror = function() {
            video.remove();
            homeScreen.style.display = 'flex';
            currentScreen = 'home';
            updateTopBar();
            initMainCarousel();
            startMainMusic();
            loadSavedSkin();
        };
    });
})();

function initGameModules() {
    if (typeof Sherwood !== 'undefined') {
        const modules = [
            'Quests', 'Tavern', 'Portal', 'Raid', 'Bestiary',
            'Dungeon', 'Dungeon2D5', 'Forge', 'BlackMarket',
            'Bag', 'Wallet', 'Training', 'Hearth', 'Combat'
        ];
        modules.forEach(name => {
            if (Sherwood[name] && typeof Sherwood[name].init === 'function') {
                try {
                    Sherwood[name].init();
                    console.log(name + ' инициализирован');
                } catch(e) {
                    console.warn('Ошибка в ' + name + ':', e);
                }
            }
        });
    }

    if (typeof UI !== 'undefined' && UI.init) {
        UI.init();
    }

    if (typeof Settings !== 'undefined' && Settings.init) {
        Settings.init();
    }
}

// ---------- ЭКСПОРТ ----------
window.PlayerStats = PlayerStats;
window.updateTopBar = updateTopBar;
window.showHomeScreen = showHomeScreen;
window.enterSection = enterSection;
window.closeAllScreens = closeAllScreens;
window.showGenericScreen = showGenericScreen;
window.closeGenericScreen = closeGenericScreen;
window.cycleSkin = cycleSkin;
window.loadSavedSkin = loadSavedSkin;
window.saveGameData = saveGameData;
window.loadGameData = loadGameData;
window.startMainMusic = startMainMusic;
window.stopMainMusic = stopMainMusic;
window.hideHomeElements = hideHomeElements;
window.showHomeElements = showHomeElements;

console.log('🌳 Sherwood RPG загружена!');
console.log(`📊 Уровень: ${PlayerStats.level}, HP: ${PlayerStats.hp}/${PlayerStats.maxHp}`);
console.log('💾 Сохранение:', localStorage.getItem('sherwood_save') ? 'есть' : 'нет');

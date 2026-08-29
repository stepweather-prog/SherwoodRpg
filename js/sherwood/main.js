// js/main.js — ЧИСТАЯ ВЕРСИЯ С КАРУСЕЛЬЮ НА ГЛАВНОЙ

// ---------- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ----------
const loadingScreen = document.getElementById('loadingScreen');
const homeScreen = document.getElementById('homeScreen');
const playButton = document.getElementById('playButton');
const hero = document.getElementById('hero');
const menuScreen = document.getElementById('menuScreen');

let currentScreen = 'loading';

// ---------- ДАННЫЕ ИГРОКА ----------
const PlayerStats = {
    exp: 1250,
    damage: 150,
    armor: 45,
    hp: 100,
    maxHp: 100,
    gold: 50,
    silver: 120,
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
// ---------- МУЗЫКА НА ГЛАВНОЙ (ПЛЕЙЛИСТ) ----------
const musicPlaylist = [
    'assets/assets2/music/city_theme1.ogg',
    'assets/assets2/music/city_theme2.ogg',
    'assets/assets2/music/city_theme3.ogg',
    'assets/assets2/music/city_theme4.ogg',
    'assets/assets2/music/city_theme5.ogg',
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
    if (currentMusicIndex >= musicPlaylist.length) {
        currentMusicIndex = 0;
    }
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
// ---------- ОБНОВЛЕНИЕ HUD ----------
function updateTopBar() {
    const expEl = document.getElementById('expVal');
    const dmgEl = document.getElementById('dmgVal');
    const armorEl = document.getElementById('armorVal');
    const hpEl = document.getElementById('hpVal');
    const goldEl = document.getElementById('goldVal');
    const silverEl = document.getElementById('silverVal');
    const levelEl = document.getElementById('levelVal');

    if (expEl) expEl.innerText = PlayerStats.exp;
    if (dmgEl) dmgEl.innerText = PlayerStats.damage;
    if (armorEl) armorEl.innerText = PlayerStats.armor;
    if (hpEl) hpEl.innerText = `${PlayerStats.hp}/${PlayerStats.maxHp}`;
    if (goldEl) goldEl.innerText = PlayerStats.gold;
    if (silverEl) silverEl.innerText = PlayerStats.silver;
    if (levelEl) levelEl.innerText = PlayerStats.level;
}

// ---------- ЗАГРУЗКА ----------
playButton.addEventListener('click', () => {
    loadingScreen.style.display = 'none';
    homeScreen.style.display = 'flex';
    currentScreen = 'home';
    updateTopBar();
    initMainCarousel(); // Запускаем карусель
    startMainMusic();   // Запускаем музыку
});

// ---------- КАРУСЕЛЬ РАЗДЕЛОВ НА ГЛАВНОЙ ----------
let currentSectionIndex = 0;
const sections = ['Профиль', 'Квесты', 'Таверна', 'Порталы', 'Подземка', 'Рынок', 'Кузница', 'Настройки'];

let woodSign = null;
let sectionIcon = null;
let leftArrow = null;
let rightArrow = null;
let touchStartX = 0;

function initMainCarousel() {
    woodSign = document.getElementById('sectionName');
    sectionIcon = document.getElementById('sectionIcon');
    leftArrow = document.getElementById('carouselLeftArrow');
    rightArrow = document.getElementById('carouselRightArrow');

    if (!woodSign || !sectionIcon) return;

    if (leftArrow) leftArrow.onclick = () => prevSection();
    if (rightArrow) rightArrow.onclick = () => nextSection();

    const gameZone = document.getElementById('gameZone');
    if (gameZone) {
        gameZone.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        });
        gameZone.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const deltaX = touchEndX - touchStartX;
            if (deltaX < -50) nextSection();
            else if (deltaX > 50) prevSection();
        });
    }

    updateSectionDisplay();
}

function updateSectionDisplay() {
    if (!woodSign || !sectionIcon) return;
    
    const currentSection = sections[currentSectionIndex];
    woodSign.textContent = currentSection;
    
    const iconMap = {
        'Профиль': 'assets/assets2/icons/player_profile.png',
        'Квесты': 'assets/assets2/icons/quest.png',
        'Таверна': 'assets/assets2/icons/tavern.png',
        'Порталы': 'assets/assets2/icons/portal.png',
        'Подземка': 'assets/assets2/icons/subway.png',
        'Рынок': 'assets/assets2/icons/sherwood_market.png',
        'Кузница': 'assets/assets2/icons/forge.png',
        'Настройки': 'assets/assets2/icons/settings.png',
    };
    
    sectionIcon.src = iconMap[currentSection] || '';
}

function nextSection() {
    currentSectionIndex = (currentSectionIndex + 1) % sections.length;
    updateSectionDisplay();
}

function prevSection() {
    currentSectionIndex = (currentSectionIndex - 1 + sections.length) % sections.length;
    updateSectionDisplay();
}

// ---------- НАВИГАЦИЯ ----------
function showHomeScreen() {
    homeScreen.style.display = 'flex';
    menuScreen.style.display = 'none';
    currentScreen = 'home';
    updateTopBar();
    initMainCarousel();
}

// ---------- ЭКРАНЫ РЕЖИМОВ ----------
function showSectionScreen(building) {
    if (building.icon === 'Подземка') { showDungeonScreen(); return; }
    if (building.icon === 'Таверна') { showTavernScreen(); return; }
    if (building.icon === 'Таланты') { showTalentsScreen(); return; }
    if (building.icon === 'Настройки') { showSettingsScreen(); return; }
    if (building.icon === 'Квесты') { showQuestsScreen(); return; }
    if (building.icon === 'Порталы') { showPortalsScreen(); return; }
    if (building.icon === 'Рейд') { showRaidScreen(); return; }
    if (building.icon === 'Ежедневные') { showDailyScreen(); return; }
    if (building.icon === 'Профиль') { showProfileScreen(); return; }
    if (building.icon === 'Сумка') { showBagScreen(); return; }
    if (building.icon === 'Кузница') { showForgeScreen(); return; }
    if (building.icon === 'Рынок') { showMarketScreen(); return; }
    if (building.icon === 'Бестиарий') { showBestiaryScreen(); return; }
    if (building.icon === 'Очаг') { showHearthScreen(); return; }
    if (building.icon === 'Кошель') { showWalletScreen(); return; }
    
    const screenHTML = `
    <div id="section-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeSectionScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">${building.name}</span>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;">
            <div style="font-size:48px;margin-bottom:20px;">🚧</div>
            <div style="font-size:20px;color:#ffa500;">${building.name}</div>
            <div style="color:#888;font-size:14px;">В разработке</div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeSectionScreen() {
    const screen = document.getElementById('section-screen');
    if (screen) screen.remove();
}

// ============================================================
//  КВЕСТЫ
// ============================================================
function showQuestsScreen() {
    closeQuestsScreen();
    let chapters = [];
    let progress = { completed: [], currentChapter: 1 };
    
    if (typeof Sherwood !== 'undefined' && Sherwood.Quests) {
        try {
            if (typeof Sherwood.Quests.getAllChapters === 'function') {
                chapters = Sherwood.Quests.getAllChapters();
            } else if (Sherwood.Quests.CHAPTERS) {
                chapters = Sherwood.Quests.CHAPTERS;
            }
            if (typeof Sherwood.Quests.getProgress === 'function') {
                progress = Sherwood.Quests.getProgress();
            }
        } catch(e) {}
    }
    
    if (chapters.length === 0) {
        chapters = [
            { id: 1, name: 'Кровь Великого Дуба', boss: { name: 'Лесничий-Отступник' }, stages: 5, rewards: { exp: 200, gold: 50 } },
            { id: 2, name: 'Кара Скверны', boss: { name: 'Вожак Искаженной Стаи' }, stages: 5, rewards: { exp: 400, gold: 100 } }
        ];
        progress.completed = [];
    }
    
    const completed = progress.completed || [];
    const screenHTML = `
    <div id="quests-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/quest.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);">
            <button onclick="closeQuestsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">📋 Квесты</span>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
            <div style="max-width:600px;margin:0 auto;">
                <div style="text-align:center;margin-bottom:15px;">
                    <div style="color:#ffa500;font-size:16px;">🏆 Пройдено: ${completed.length}/${chapters.length}</div>
                </div>
                <div id="quests-list" style="display:flex;flex-direction:column;gap:8px;"></div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
    
    const container = document.getElementById('quests-list');
    if (container) {
        container.innerHTML = chapters.map(ch => {
            const isCompleted = completed.includes(ch.id);
            return `
            <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;border-left:4px solid ${isCompleted ? '#52b788' : '#ffa500'};">
                <div style="color:#ffd700;font-weight:bold;">${ch.id}. ${ch.name}</div>
                <div style="color:#aaa;font-size:12px;">Босс: ${ch.boss ? ch.boss.name : 'Неизвестен'}</div>
                <div style="color:#888;font-size:12px;">Награда: +${ch.rewards.exp} XP, +${ch.rewards.gold} Gold</div>
                ${isCompleted ? '<div style="color:#52b788;">✅ Пройдена</div>' : ''}
            </div>`;
        }).join('');
    }
}

function closeQuestsScreen() {
    const screen = document.getElementById('quests-screen');
    if (screen) screen.remove();
    const battle = document.getElementById('battle-overlay');
    if (battle) battle.remove();
}

// ---------- ОСТАЛЬНЫЕ ЭКРАНЫ ----------
function showDungeonScreen() { document.body.insertAdjacentHTML('beforeend', `<div id="dungeon-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/sherwood_thicket.png') center/cover no-repeat;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);"><button onclick="closeDungeonScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;"><img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.2em;">Подземелья</span></div><div style="flex:1;overflow-y:auto;padding:20px;"><div style="display:flex;flex-direction:column;align-items:center;gap:30px;"><div onclick="enterDungeon('forest')" style="text-align:center;cursor:pointer;"><img src="assets/assets2/icons/the_cursed_thicket.png" style="width:180px;height:180px;object-fit:contain;"><div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-top:8px;">Проклятая чаща</div></div></div></div></div>`); }
function closeDungeonScreen() { const screen = document.getElementById('dungeon-screen'); if (screen) screen.remove(); }
function enterDungeon(dungeonId) { closeDungeonScreen(); alert('Вход: ' + dungeonId); }

function showPortalsScreen() { document.body.insertAdjacentHTML('beforeend', `<div id="portals-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/portal.png') center/cover no-repeat;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);"><button onclick="closePortalsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;"><img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.2em;">🌀 Порталы</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;"><div style="font-size:48px;margin-bottom:20px;">🌀</div><div style="font-size:20px;color:#4a8ab7;">Порталы</div><div style="color:#888;font-size:14px;text-align:center;max-width:400px;margin-top:10px;">Путешествуй между мирами. Открывается на 5 уровне.</div><div style="color:#ffa500;margin-top:20px;">Уровень: ${PlayerStats.level}</div>${PlayerStats.level >= 5 ? '<button class="btn btn-success" onclick="alert(\'🌀 Вход в портал!\')">Войти в портал</button>' : '<div style="color:#888;">🔒 Доступно с 5 уровня</div>'}</div></div>`); }
function closePortalsScreen() { const screen = document.getElementById('portals-screen'); if (screen) screen.remove(); }

function showRaidScreen() { document.body.insertAdjacentHTML('beforeend', `<div id="raid-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/background_raid.png') center/cover no-repeat;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);"><button onclick="closeRaidScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;"><img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.2em;">⚔️ Рейд</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;"><div style="font-size:48px;margin-bottom:20px;">⚔️</div><div style="font-size:20px;color:#ff6b35;">Рейд</div><div style="color:#888;font-size:14px;text-align:center;max-width:400px;margin-top:10px;">Объединяйся с другими игроками для битвы с боссами.</div><div style="color:#ffa500;margin-top:20px;">Уровень: ${PlayerStats.level}</div>${PlayerStats.level >= 10 ? '<button class="btn btn-danger" onclick="alert(\'⚔️ Начинаем рейд!\')">Начать рейд</button>' : '<div style="color:#888;">🔒 Доступно с 10 уровня</div>'}</div></div>`); }
function closeRaidScreen() { const screen = document.getElementById('raid-screen'); if (screen) screen.remove(); }

function showTalentsScreen() { document.body.insertAdjacentHTML('beforeend', `<div id="talents-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/visual_talents.png') center/cover no-repeat;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);"><button onclick="closeTalentsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;"><img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.2em;">⭐ Таланты</span></div><div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;"><div style="text-align:center;margin-bottom:20px;"><div style="color:#ffd700;font-size:18px;">⭐ Очки талантов: ${PlayerStats.skillPoints || 0}</div></div></div></div>`); }
function closeTalentsScreen() { const screen = document.getElementById('talents-screen'); if (screen) screen.remove(); }

function showDailyScreen() { document.body.insertAdjacentHTML('beforeend', `<div id="daily-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/tasks_day.png') center/cover no-repeat;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);"><button onclick="closeDailyScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;"><img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.2em;">📅 Ежедневные</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;"><div style="font-size:48px;margin-bottom:20px;">📅</div><div style="font-size:20px;color:#ffd93d;">Ежедневные задания</div></div></div>`); }
function closeDailyScreen() { const screen = document.getElementById('daily-screen'); if (screen) screen.remove(); }

function showProfileScreen() { document.body.insertAdjacentHTML('beforeend', `<div id="profile-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/profile_visual.png') center/cover no-repeat;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);"><button onclick="closeProfileScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;"><img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.2em;">👤 Профиль</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;"><div style="font-size:60px;margin-bottom:10px;">👤</div><div style="font-size:24px;color:#ffa500;">Герой</div><div style="color:#888;">Уровень ${PlayerStats.level}</div></div></div>`); }
function closeProfileScreen() { const screen = document.getElementById('profile-screen'); if (screen) screen.remove(); }

function showBagScreen() { showGenericScreen('Сумка', '🎒'); }
function showForgeScreen() { showGenericScreen('Кузница', '🔧'); }
function showMarketScreen() { showGenericScreen('Рынок', '🏪'); }
function showBestiaryScreen() { showGenericScreen('Бестиарий', '📖'); }
function showHearthScreen() { showGenericScreen('Очаг', '🔥'); }
function showWalletScreen() { showGenericScreen('Кошель', '💰'); }

function showGenericScreen(title, icon) {
    document.body.insertAdjacentHTML('beforeend', `<div id="generic-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);"><button onclick="closeGenericScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;"><img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.2em;">${title}</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;"><div style="font-size:64px;margin-bottom:20px;">${icon}</div><div style="font-size:24px;color:#ffa500;">${title}</div><div style="color:#888;font-size:14px;margin-top:10px;">В разработке</div></div></div>`);
}

function closeGenericScreen() { const screen = document.getElementById('generic-screen'); if (screen) screen.remove(); }

function showSettingsScreen() {
    const musicEnabled = typeof Settings !== 'undefined' ? Settings.isMusicEnabled() : true;
    document.body.insertAdjacentHTML('beforeend', `<div id="settings-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/settings_visual.png') center/cover no-repeat;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);"><button onclick="closeSettingsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;"><img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.2em;">Настройки</span></div><div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:20px;gap:20px;"><button onclick="toggleMusicSetting()" style="background:#c9a040;border:none;border-radius:8px;padding:15px 40px;color:#000;font-weight:bold;cursor:pointer;font-size:1.1em;">${musicEnabled ? '🔊 Музыка: Включена' : '🔇 Музыка: Выключена'}</button><button onclick="resetGameData()" style="background:#6a2d2d;border:none;border-radius:8px;padding:15px 40px;color:#fff;font-weight:bold;cursor:pointer;font-size:1.1em;">🔄 Сбросить прогресс</button></div></div>`);
}

function closeSettingsScreen() { const screen = document.getElementById('settings-screen'); if (screen) screen.remove(); }
function toggleMusicSetting() { closeSettingsScreen(); showSettingsScreen(); }
function resetGameData() { if (confirm('Точно сбросить весь прогресс?')) { localStorage.removeItem('sherwood_save'); location.reload(); } }

function showTavernScreen() {
    document.body.insertAdjacentHTML('beforeend', `<div id="tavern-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/section_tavern.png') center/cover no-repeat;display:flex;flex-direction:column;"><div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);"><button onclick="closeTavernScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;"><img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;"></button><span style="color:#e0c080;font-size:1.2em;">🍺 Таверна</span></div><div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;"><div style="text-align:center;font-size:20px;color:#ffa500;">Добро пожаловать в таверну!</div></div></div>`);
}

function closeTavernScreen() { const screen = document.getElementById('tavern-screen'); if (screen) screen.remove(); }

// ---------- ЭКСПОРТ ГЛОБАЛЬНЫХ ФУНКЦИЙ ----------
window.PlayerStats = PlayerStats;
window.updateTopBar = updateTopBar;
window.showHomeScreen = showHomeScreen;
window.showSectionScreen = showSectionScreen;
window.closeSectionScreen = closeSectionScreen;
window.showDungeonScreen = showDungeonScreen;
window.closeDungeonScreen = closeDungeonScreen;
window.enterDungeon = enterDungeon;
window.showQuestsScreen = showQuestsScreen;
window.closeQuestsScreen = closeQuestsScreen;
window.showPortalsScreen = showPortalsScreen;
window.closePortalsScreen = closePortalsScreen;
window.showRaidScreen = showRaidScreen;
window.closeRaidScreen = closeRaidScreen;
window.showTalentsScreen = showTalentsScreen;
window.closeTalentsScreen = closeTalentsScreen;
window.showDailyScreen = showDailyScreen;
window.closeDailyScreen = closeDailyScreen;
window.showProfileScreen = showProfileScreen;
window.closeProfileScreen = closeProfileScreen;
window.showBagScreen = showBagScreen;
window.showForgeScreen = showForgeScreen;
window.showMarketScreen = showMarketScreen;
window.showBestiaryScreen = showBestiaryScreen;
window.showHearthScreen = showHearthScreen;
window.showWalletScreen = showWalletScreen;
window.closeGenericScreen = closeGenericScreen;
window.showSettingsScreen = showSettingsScreen;
window.closeSettingsScreen = closeSettingsScreen;
window.toggleMusicSetting = toggleMusicSetting;
window.resetGameData = resetGameData;
window.showTavernScreen = showTavernScreen;
window.closeTavernScreen = closeTavernScreen;
window.saveGameData = saveGameData;
window.loadGameData = loadGameData;

// ---------- АВТОЗАГРУЗКА ----------
console.log('🌳 Sherwood RPG загружена!');

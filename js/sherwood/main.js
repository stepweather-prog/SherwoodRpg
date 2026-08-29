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
    if (hero) hero.onclick = () => enterSection();

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
    closeAllScreens();
    console.log(`🚪 Вход в раздел: ${section.name}`);

    switch(section.name) {
        case 'Подземка':
            if (typeof Sherwood !== 'undefined' && Sherwood.Dungeon2D5) {
                if (typeof Sherwood.Dungeon2D5.render === 'function') {
                    stopMainMusic();
                    Sherwood.Dungeon2D5.render();
                    return;
                }
            }
            showGenericScreen('Подземка', '🏚️');
            break;

        case 'Квесты':
            if (typeof Sherwood !== 'undefined' && Sherwood.Quests) {
                if (typeof Sherwood.Quests.showUI === 'function') {
                    Sherwood.Quests.showUI();
                    return;
                }
            }
            showGenericScreen('Квесты', '📋');
            break;

        case 'Таверна':
            if (typeof Sherwood !== 'undefined' && Sherwood.Tavern) {
                if (typeof Sherwood.Tavern.showUI === 'function') {
                    Sherwood.Tavern.showUI();
                    return;
                }
            }
            showGenericScreen('Таверна', '🍺');
            break;

        case 'Порталы':
            if (typeof Sherwood !== 'undefined' && Sherwood.Portal) {
                if (typeof Sherwood.Portal.showUI === 'function') {
                    Sherwood.Portal.showUI();
                    return;
                }
            }
            showGenericScreen('Порталы', '🌀');
            break;

        case 'Рейд':
            if (typeof Sherwood !== 'undefined' && Sherwood.Raid) {
                if (typeof Sherwood.Raid.showUI === 'function') {
                    Sherwood.Raid.showUI();
                    return;
                }
            }
            showGenericScreen('Рейд', '⚔️');
            break;

        case 'Бестиарий':
            if (typeof Sherwood !== 'undefined' && Sherwood.Bestiary) {
                if (typeof Sherwood.Bestiary.showUI === 'function') {
                    Sherwood.Bestiary.showUI();
                    return;
                }
            }
            showGenericScreen('Бестиарий', '📖');
            break;

        case 'Кузница':
            if (typeof Sherwood !== 'undefined' && Sherwood.Forge) {
                if (typeof Sherwood.Forge.showUI === 'function') {
                    Sherwood.Forge.showUI();
                    return;
                }
            }
            showGenericScreen('Кузница', '🔧');
            break;

        case 'Рынок':
            if (typeof Sherwood !== 'undefined' && Sherwood.BlackMarket) {
                if (typeof Sherwood.BlackMarket.showUI === 'function') {
                    Sherwood.BlackMarket.showUI();
                    return;
                }
            }
            showGenericScreen('Рынок', '🏪');
            break;

        case 'Профиль':
            showProfileScreen();
            break;

        case 'Настройки':
            showSettingsScreen();
            break;

        default:
            showGenericScreen(section.name, '📌');
    }
}

// ============================================================
//  ВОЗВРАТ НА ГЛАВНУЮ
// ============================================================

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

// ---------- УНИВЕРСАЛЬНЫЙ ЭКРАН ----------
function showGenericScreen(title, icon) {
    closeAllScreens();
    const screenHTML = `
    <div id="generic-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:rgba(0,0,0,0.92);display:flex;flex-direction:column;">
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
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeGenericScreen() {
    const screen = document.getElementById('generic-screen');
    if (screen) screen.remove();
}

// ============================================================
//  ПРОФИЛЬ С ТАЛАНТАМИ
// ============================================================

function showProfileScreen() {
    closeAllScreens();
    
    const allTalents = typeof Talents !== 'undefined' ? Talents.list : [];
    const learned = typeof Talents !== 'undefined' ? Talents.getLearned() : {};
    const player = PlayerStats;
    const learnedCount = Object.keys(learned).filter(id => learned[id] && learned[id].level > 0).length;

    const screenHTML = `
    <div id="profile-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/profile_visual.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
            <button onclick="closeProfileScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">👤 Профиль</span>
            <span style="color:#888;font-size:12px;margin-left:auto;">⭐ Талантов: ${learnedCount}</span>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
            <div style="max-width:800px;margin:0 auto;">
                <!-- Статистика -->
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
                    <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;">
                        <div style="color:#ff6b6b;font-size:12px;">❤️ HP</div>
                        <div style="font-size:18px;font-weight:bold;">${player.hp}/${player.maxHp}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;">
                        <div style="color:#4ecdc4;font-size:12px;">⚔️ Атака</div>
                        <div style="font-size:18px;font-weight:bold;">${player.damage}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;">
                        <div style="color:#a8d8ea;font-size:12px;">🛡️ Защита</div>
                        <div style="font-size:18px;font-weight:bold;">${player.armor}</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;text-align:center;">
                        <div style="color:#ffd700;font-size:12px;">📊 Уровень</div>
                        <div style="font-size:18px;font-weight:bold;">${player.level}</div>
                    </div>
                </div>

                <!-- Скрижаль опыта -->
                <div style="background:rgba(255,215,0,0.05);border:1px solid #ffd700;border-radius:8px;padding:12px;margin-bottom:20px;">
                    <div style="display:flex;align-items:center;gap:10px;">
                        <img src="assets/assets2/icons/tablet_of_experience.png" style="width:40px;height:40px;object-fit:contain;" onerror="this.style.display='none'">
                        <div style="flex:1;">
                            <div style="color:#ffd700;font-weight:bold;">📜 Скрижаль опыта</div>
                            <div style="color:#aaa;font-size:12px;">
                                Очков опыта: <span style="color:#ffd700;font-weight:bold;">${player.skillPoints || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Таланты -->
                <div style="color:#ffa500;font-weight:bold;font-size:16px;margin-bottom:10px;">⭐ Изученные таланты</div>
                ${learnedCount === 0 ? `
                    <div style="text-align:center;color:#888;padding:30px;background:rgba(255,255,255,0.03);border-radius:8px;">
                        <div style="font-size:40px;margin-bottom:10px;">📖</div>
                        <div>Нет изученных талантов</div>
                        <div style="font-size:12px;color:#555;margin-top:5px;">Изучи их в Таверне у Егеря</div>
                    </div>
                ` : `
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        ${allTalents.map(talent => {
                            const data = learned[talent.id];
                            if (!data || data.level === 0) return '';
                            const level = data.level;
                            const isMax = level >= talent.maxLevel;
                            const isEnabled = data.enabled !== false;
                            return `
                            <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:6px;border:1px solid ${isEnabled ? '#52b788' : '#555'};">
                                <div style="display:flex;align-items:center;gap:8px;">
                                    <img src="assets/assets2/talents/${talent.icon}" style="width:32px;height:32px;object-fit:contain;" onerror="this.style.display='none'">
                                    <div style="flex:1;">
                                        <div style="color:${isEnabled ? '#ffd700' : '#666'};font-weight:bold;font-size:13px;">
                                            ${talent.name} ${isMax ? '✅ MAX' : `(${level}/${talent.maxLevel})`}
                                        </div>
                                        <div style="color:#888;font-size:10px;">${talent.desc}</div>
                                    </div>
                                </div>
                                <div style="display:flex;gap:6px;margin-top:6px;justify-content:flex-end;">
                                    ${!isMax ? `
                                        <button onclick="upgradeTalentFromProfile('${talent.id}')" class="btn btn-gold" style="padding:3px 10px;font-size:10px;">
                                            ⬆ Прокачать (${player.skillPoints || 0} опыта)
                                        </button>
                                    ` : ''}
                                    <button onclick="toggleTalentFromProfile('${talent.id}')" class="btn ${isEnabled ? 'btn-success' : 'btn-danger'}" style="padding:3px 10px;font-size:10px;">
                                        ${isEnabled ? '✅ Вкл' : '❌ Выкл'}
                                    </button>
                                </div>
                            </div>
                        `}).join('')}
                    </div>
                `}
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeProfileScreen() {
    const screen = document.getElementById('profile-screen');
    if (screen) screen.remove();
}

function upgradeTalentFromProfile(id) {
    if (typeof Talents === 'undefined') {
        alert('❌ Система талантов не загружена');
        return;
    }
    const player = PlayerStats;
    if (!player.skillPoints || player.skillPoints <= 0) {
        alert('❌ Нет очков опыта для прокачки!');
        return;
    }
    const talent = Talents.list.find(t => t.id === id);
    if (!talent) { alert('❌ Талант не найден'); return; }
    const current = Talents.getLearned()[id];
    if (!current || current.level === 0) { alert('❌ Талант не изучен'); return; }
    if (current.level >= talent.maxLevel) { alert('❌ Максимальный уровень!'); return; }
    
    player.skillPoints--;
    const result = Talents.upgrade(id);
    if (result.success) {
        updateTopBar();
        saveGameData();
        showProfileScreen();
    } else {
        player.skillPoints++;
        alert('❌ ' + result.reason);
    }
}

function toggleTalentFromProfile(id) {
    if (typeof Talents === 'undefined') return;
    const result = Talents.toggle(id);
    if (result.success) showProfileScreen();
}

// ---------- НАСТРОЙКИ ----------
function showSettingsScreen() {
    closeAllScreens();
    const musicEnabled = typeof Settings !== 'undefined' ? Settings.isMusicEnabled() : true;
    const screenHTML = `
    <div id="settings-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/settings_visual.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeSettingsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">⚙️ Настройки</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;gap:20px;">
            <button onclick="toggleMusicSetting()" style="background:#c9a040;border:none;border-radius:8px;padding:15px 40px;color:#000;font-weight:bold;cursor:pointer;font-size:1.1em;">
                ${musicEnabled ? '🔊 Музыка: Включена' : '🔇 Музыка: Выключена'}
            </button>
            <button onclick="resetGameData()" style="background:#6a2d2d;border:none;border-radius:8px;padding:15px 40px;color:#fff;font-weight:bold;cursor:pointer;font-size:1.1em;">
                🔄 Сбросить прогресс
            </button>
            <button onclick="closeSettingsScreen()" class="btn" style="padding:10px 30px;">↩️ Назад</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeSettingsScreen() {
    const screen = document.getElementById('settings-screen');
    if (screen) screen.remove();
}

function toggleMusicSetting() {
    if (typeof Settings !== 'undefined' && Settings.toggleMusic) {
        Settings.toggleMusic();
        if (!Settings.isMusicEnabled()) stopMainMusic();
        else startMainMusic();
    } else {
        isMusicPlaying = !isMusicPlaying;
        if (isMusicPlaying) startMainMusic();
        else stopMainMusic();
    }
    closeSettingsScreen();
    showSettingsScreen();
}

function resetGameData() {
    if (confirm('⚠️ Точно сбросить весь прогресс?')) {
        localStorage.removeItem('sherwood_save');
        location.reload();
    }
}

// ---------- ЕЖЕДНЕВНЫЕ ----------
function showDailyScreen() {
    closeAllScreens();
    const screenHTML = `
    <div id="daily-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/tasks_day.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeDailyScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">📅 Ежедневные</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;">
            <div style="font-size:48px;margin-bottom:20px;">📅</div>
            <div style="font-size:20px;color:#ffd93d;">Ежедневные задания</div>
            <div style="color:#888;font-size:14px;text-align:center;max-width:400px;margin-top:10px;">Выполняй ежедневные задания и получай награды.</div>
            <button onclick="closeDailyScreen()" class="btn" style="margin-top:20px;padding:10px 30px;">Назад</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeDailyScreen() {
    const screen = document.getElementById('daily-screen');
    if (screen) screen.remove();
}

// ---------- ЗАПУСК ----------
playButton.addEventListener('click', () => {
    loadingScreen.style.display = 'none';
    homeScreen.style.display = 'flex';
    currentScreen = 'home';
    updateTopBar();
    initMainCarousel();
    startMainMusic();
    
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
window.showGenericScreen = showGenericScreen;
window.closeGenericScreen = closeGenericScreen;
window.showProfileScreen = showProfileScreen;
window.closeProfileScreen = closeProfileScreen;
window.upgradeTalentFromProfile = upgradeTalentFromProfile;
window.toggleTalentFromProfile = toggleTalentFromProfile;
window.showSettingsScreen = showSettingsScreen;
window.closeSettingsScreen = closeSettingsScreen;
window.showDailyScreen = showDailyScreen;
window.closeDailyScreen = closeDailyScreen;
window.toggleMusicSetting = toggleMusicSetting;
window.resetGameData = resetGameData;
window.saveGameData = saveGameData;
window.loadGameData = loadGameData;
window.startMainMusic = startMainMusic;
window.stopMainMusic = stopMainMusic;

// ---------- АВТОЗАГРУЗКА ----------
console.log('🌳 Sherwood RPG загружена!');
console.log(`📊 Уровень: ${PlayerStats.level}, HP: ${PlayerStats.hp}/${PlayerStats.maxHp}`);
console.log('💾 Сохранение:', localStorage.getItem('sherwood_save') ? 'есть' : 'нет');

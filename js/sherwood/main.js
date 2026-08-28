// ============================================================
//  js/main.js — ПОЛНАЯ ВЕРСИЯ С ИНТЕГРАЦИЕЙ ВСЕХ МОДУЛЕЙ
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
    
    // Загружаем сохранение
    loadGameData();
});

hero.addEventListener('click', () => {
    homeScreen.style.display = 'none';
    menuScreen.style.display = 'block';
    currentScreen = 'menu';
    
    if (AudioManager && AudioManager.playCityTheme) {
        AudioManager.playCityTheme();
    }
    
    showLoadingOverlay();
    
    const startMenu = () => {
        hideLoadingOverlay();
        if (typeof Menu !== 'undefined' && Menu.init) {
            Menu.init();
        }
    };
    
    // Проверяем загрузку текстур
    if (typeof Textures !== 'undefined' && Textures.loaded) {
        startMenu();
    } else if (typeof Textures !== 'undefined' && Textures.load) {
        Textures.load(startMenu);
    } else {
        startMenu();
    }
});

// ---------- ЗАГРУЗОЧНЫЙ ОВЕРЛЕЙ ----------
function showLoadingOverlay() {
    let overlay = document.getElementById('loading-overlay');
    if (overlay) return;
    
    overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        z-index: 1000;
        background: url('assets/assets2/backgrounds/loading.png') center/cover no-repeat;
        display: flex; justify-content: center; align-items: center;
    `;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
        width: 60px; height: 60px;
        border: 4px solid #c9a040; border-top: 4px solid transparent;
        border-radius: 50%; animation: spin 1s linear infinite;
    `;
    
    overlay.appendChild(spinner);
    document.body.appendChild(overlay);
    
    if (!document.getElementById('spin-keyframes')) {
        const style = document.createElement('style');
        style.id = 'spin-keyframes';
        style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }
}

function hideLoadingOverlay() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.remove();
}

// ---------- СОХРАНЕНИЕ/ЗАГРУЗКА ----------
function saveGameData() {
    try {
        const data = {
            player: PlayerStats,
            timestamp: Date.now()
        };
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

// ---------- НАВИГАЦИЯ ----------
function showHomeScreen() {
    if (typeof Menu !== 'undefined' && Menu.destroy) {
        Menu.destroy();
    }
    homeScreen.style.display = 'flex';
    menuScreen.style.display = 'none';
    currentScreen = 'home';
    updateTopBar();
}

function showSectionScreen(building) {
    // Проверяем специальные экраны
    if (building.icon === 'Подземка') { 
        showDungeonScreen(); 
        return; 
    }
    if (building.icon === 'Таверна') { 
        showTavernScreen(); 
        return; 
    }
    if (building.icon === 'Таланты') { 
        showTalentsScreen(); 
        return; 
    }
    if (building.icon === 'Настройки') { 
        showSettingsScreen(); 
        return; 
    }
    if (building.icon === 'Квесты') { 
        showQuestsScreen(); 
        return; 
    }
    if (building.icon === 'Порталы') { 
        showPortalsScreen(); 
        return; 
    }
    if (building.icon === 'Рейд') { 
        showRaidScreen(); 
        return; 
    }
    if (building.icon === 'Ежедневные') { 
        showDailyScreen(); 
        return; 
    }
    if (building.icon === 'Профиль') { 
        showProfileScreen(); 
        return; 
    }
    if (building.icon === 'Сумка') { 
        showBagScreen(); 
        return; 
    }
    if (building.icon === 'Кузница') { 
        showForgeScreen(); 
        return; 
    }
    if (building.icon === 'Рынок') { 
        showMarketScreen(); 
        return; 
    }
    if (building.icon === 'Бестиарий') { 
        showBestiaryScreen(); 
        return; 
    }
    if (building.icon === 'Очаг') { 
        showHearthScreen(); 
        return; 
    }
    if (building.icon === 'Арена') { 
        showArenaScreen(); 
        return; 
    }
    if (building.icon === 'Чат') { 
        showChatScreen(); 
        return; 
    }
    if (building.icon === 'Кошель') { 
        showWalletScreen(); 
        return; 
    }
    
    // Универсальный экран
    const backgrounds = {
        'Порталы': 'assets/assets2/backgrounds/portal.png',
        'Чат': 'assets/assets2/backgrounds/chat_background.png',
        'Рейд': 'assets/assets2/backgrounds/background_raid.png',
        'Арена': 'assets/assets2/backgrounds/pvp_arena.png',
        'Квесты': 'assets/assets2/backgrounds/quest.png',
        'Ежедневные': 'assets/assets2/backgrounds/tasks_day.png',
        'Кузница': 'assets/assets2/backgrounds/forge.png',
        'Тренировка': 'assets/assets2/backgrounds/training.png',
        'Бестиарий': 'assets/assets2/backgrounds/bestiary_visual.png',
        'Очаг': 'assets/assets2/backgrounds/fireplace_visual.png',
        'Профиль': 'assets/assets2/backgrounds/profile_visual.png',
        'Сумка': 'assets/assets2/backgrounds/bag.png',
        'Рынок': 'assets/assets2/backgrounds/market.png',
        'Кошель': 'assets/assets2/backgrounds/wallet_vis.png',
    };
    
    const bg = backgrounds[building.icon] || '';
    
    const screenHTML = `
    <div id="section-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('${bg}') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeSectionScreen()" style="background:transparent;border:none;cursor:pointer;padding:0;width:60px;height:60px;">
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
//  ЭКРАНЫ РЕЖИМОВ
// ============================================================

// ---------- ПОДЗЕМКА ----------
function showDungeonScreen() {
    // Если есть Dungeon2D5 — используем его
    if (typeof Sherwood !== 'undefined' && Sherwood.Dungeon2D5) {
        Sherwood.Dungeon2D5.render();
        return;
    }
    
    const screenHTML = `
    <div id="dungeon-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/sherwood_thicket.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeDungeonScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">Подземелья</span>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;scrollbar-width:none;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:30px;padding-bottom:40px;">
                <div onclick="enterDungeon('forest')" style="text-align:center;cursor:pointer;">
                    <img src="assets/assets2/icons/the_cursed_thicket.png" style="width:180px;height:180px;object-fit:contain;">
                    <div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-top:8px;">Проклятая чаща</div>
                </div>
                <div onclick="enterDungeon('swamp')" style="text-align:center;cursor:pointer;">
                    <img src="assets/assets2/icons/primordial_swamp.png" style="width:180px;height:180px;object-fit:contain;">
                    <div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-top:8px;">Первородное болото</div>
                </div>
                <div onclick="enterDungeon('cave')" style="text-align:center;cursor:pointer;">
                    <img src="assets/assets2/icons/basalt_grotto.png" style="width:180px;height:180px;object-fit:contain;">
                    <div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-top:8px;">Базальтовый грот</div>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeDungeonScreen() {
    const screen = document.getElementById('dungeon-screen');
    if (screen) screen.remove();
    if (typeof Sherwood !== 'undefined' && Sherwood.Dungeon2D5 && Sherwood.Dungeon2D5.destroy) {
        Sherwood.Dungeon2D5.destroy();
    }
}

function enterDungeon(dungeonId) {
    closeDungeonScreen();
    
    if (typeof Sherwood !== 'undefined' && Sherwood.Dungeon2D5) {
        // Используем существующий Dungeon2D5
        console.log('🏚️ Вход в подземелье:', dungeonId);
        // Тут можно установить ID данжена
        Sherwood.Dungeon2D5.render();
    } else {
        alert('🚧 Подземелье "' + dungeonId + '" в разработке');
    }
}

// ---------- КВЕСТЫ ----------
function showQuestsScreen() {
    if (typeof Sherwood !== 'undefined' && Sherwood.Quests) {
        Sherwood.Quests.showQuestsUI();
        return;
    }
    
    const screenHTML = `
    <div id="quests-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/quest.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeQuestsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">Квесты</span>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
            <div style="text-align:center;font-size:18px;color:#ffa500;margin-bottom:20px;">📋 Доступные квесты</div>
            <div id="quests-list"></div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
    renderQuestsList();
}

function closeQuestsScreen() {
    const screen = document.getElementById('quests-screen');
    if (screen) screen.remove();
}

function renderQuestsList() {
    const container = document.getElementById('quests-list');
    if (!container) return;
    
    // Заглушка
    const quests = [
        { name: 'Первое испытание', desc: 'Убей 5 гоблинов', progress: '2/5', reward: '+50 опыта' },
        { name: 'Собиратель', desc: 'Найди 3 сундука', progress: '1/3', reward: '+30 золота' },
        { name: 'Боец', desc: 'Победи босса', progress: '0/1', reward: '+100 опыта' }
    ];
    
    container.innerHTML = quests.map(q => `
        <div style="background:rgba(255,255,255,0.05);padding:12px;margin:8px 0;border-radius:6px;border-left:3px solid #ffa500;">
            <div style="font-weight:bold;color:#ffd700;">${q.name}</div>
            <div style="color:#aaa;font-size:13px;">${q.desc}</div>
            <div style="display:flex;justify-content:space-between;margin-top:4px;font-size:12px;">
                <span style="color:#888;">Прогресс: ${q.progress}</span>
                <span style="color:#52b788;">${q.reward}</span>
            </div>
        </div>
    `).join('');
}

// ---------- ПОРТАЛЫ ----------
function showPortalsScreen() {
    if (typeof Sherwood !== 'undefined' && Sherwood.Portal) {
        Sherwood.Portal.showPortalsUI();
        return;
    }
    
    const screenHTML = `
    <div id="portals-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/portal.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closePortalsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">🌀 Порталы</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;">
            <div style="font-size:48px;margin-bottom:20px;">🌀</div>
            <div style="font-size:20px;color:#4a8ab7;">Порталы</div>
            <div style="color:#888;font-size:14px;text-align:center;max-width:400px;margin-top:10px;">
                Путешествуй между мирами. Открывается на 5 уровне.
            </div>
            <div style="color:#ffa500;margin-top:20px;">Уровень: ${PlayerStats.level}</div>
            ${PlayerStats.level >= 5 ? 
                '<button class="btn btn-success" onclick="alert(\'🌀 Вход в портал!\')">Войти в портал</button>' :
                '<div style="color:#888;">🔒 Доступно с 5 уровня</div>'
            }
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closePortalsScreen() {
    const screen = document.getElementById('portals-screen');
    if (screen) screen.remove();
}

// ---------- РЕЙД ----------
function showRaidScreen() {
    if (typeof Sherwood !== 'undefined' && Sherwood.Raid) {
        Sherwood.Raid.showRaidUI();
        return;
    }
    
    const screenHTML = `
    <div id="raid-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/background_raid.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeRaidScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">⚔️ Рейд</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;">
            <div style="font-size:48px;margin-bottom:20px;">⚔️</div>
            <div style="font-size:20px;color:#ff6b35;">Рейд</div>
            <div style="color:#888;font-size:14px;text-align:center;max-width:400px;margin-top:10px;">
                Объединяйся с другими игроками для битвы с боссами.
            </div>
            <div style="color:#ffa500;margin-top:20px;">Уровень: ${PlayerStats.level}</div>
            ${PlayerStats.level >= 10 ? 
                '<button class="btn btn-danger" onclick="alert(\'⚔️ Начинаем рейд!\')">Начать рейд</button>' :
                '<div style="color:#888;">🔒 Доступно с 10 уровня</div>'
            }
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeRaidScreen() {
    const screen = document.getElementById('raid-screen');
    if (screen) screen.remove();
}

// ---------- ТАЛАНТЫ ----------
function showTalentsScreen() {
    if (typeof Talents !== 'undefined' && Talents.showUI) {
        Talents.showUI();
        return;
    }
    
    const screenHTML = `
    <div id="talents-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/visual_talents.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeTalentsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">⭐ Таланты</span>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
            <div style="text-align:center;margin-bottom:20px;">
                <div style="color:#ffd700;font-size:18px;">⭐ Очки талантов: ${PlayerStats.skillPoints || 0}</div>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;max-width:600px;margin:0 auto;">
                <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;text-align:center;border:1px solid #ff6b6b;">
                    <div style="font-size:28px;">💪</div>
                    <div style="color:#ff6b6b;font-weight:bold;">Сила</div>
                    <div style="font-size:24px;color:#fff;">${PlayerStats.stats?.strength || 5}</div>
                    <button onclick="upgradeStat('strength')" class="btn btn-success" style="margin-top:8px;padding:4px 20px;font-size:12px;">+1</button>
                </div>
                <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;text-align:center;border:1px solid #4ecdc4;">
                    <div style="font-size:28px;">🛡️</div>
                    <div style="color:#4ecdc4;font-weight:bold;">Броня</div>
                    <div style="font-size:24px;color:#fff;">${PlayerStats.stats?.armor || 3}</div>
                    <button onclick="upgradeStat('armor')" class="btn btn-success" style="margin-top:8px;padding:4px 20px;font-size:12px;">+1</button>
                </div>
                <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;text-align:center;border:1px solid #ffd93d;">
                    <div style="font-size:28px;">❤️</div>
                    <div style="color:#ffd93d;font-weight:bold;">Жизнь</div>
                    <div style="font-size:24px;color:#fff;">${PlayerStats.stats?.health || 5}</div>
                    <button onclick="upgradeStat('health')" class="btn btn-success" style="margin-top:8px;padding:4px 20px;font-size:12px;">+1</button>
                </div>
                <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;text-align:center;border:1px solid #a8d8ea;">
                    <div style="font-size:28px;">🌀</div>
                    <div style="color:#a8d8ea;font-weight:bold;">Скиллы</div>
                    <div style="font-size:12px;color:#888;">Открываются за 2 очка</div>
                    <button onclick="alert('🌀 Открыть скилл')" class="btn" style="margin-top:8px;padding:4px 20px;font-size:12px;">Открыть</button>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeTalentsScreen() {
    const screen = document.getElementById('talents-screen');
    if (screen) screen.remove();
}

function upgradeStat(stat) {
    if (!PlayerStats.skillPoints || PlayerStats.skillPoints <= 0) {
        alert('❌ Нет очков талантов!');
        return;
    }
    
    if (!PlayerStats.stats) PlayerStats.stats = { strength: 5, armor: 3, health: 5 };
    
    PlayerStats.stats[stat]++;
    PlayerStats.skillPoints--;
    
    // Пересчёт характеристик
    PlayerStats.damage = PlayerStats.stats.strength * 2 + PlayerStats.level * 2;
    PlayerStats.armor = Math.floor(PlayerStats.stats.armor * 1.5) + PlayerStats.level;
    PlayerStats.maxHp = PlayerStats.stats.health * 5 + PlayerStats.level * 10;
    PlayerStats.hp = Math.min(PlayerStats.hp, PlayerStats.maxHp);
    
    updateTopBar();
    saveGameData();
    closeTalentsScreen();
    showTalentsScreen();
}

// ---------- ЕЖЕДНЕВНЫЕ ----------
function showDailyScreen() {
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
            <div style="color:#888;font-size:14px;text-align:center;max-width:400px;margin-top:10px;">
                Выполняй ежедневные задания и получай награды.
            </div>
            <div style="margin-top:20px;width:100%;max-width:400px;">
                <div style="background:rgba(255,255,255,0.05);padding:10px;margin:5px 0;border-radius:4px;display:flex;justify-content:space-between;">
                    <span>⚔️ Убить 10 монстров</span>
                    <span style="color:#52b788;">3/10</span>
                </div>
                <div style="background:rgba(255,255,255,0.05);padding:10px;margin:5px 0;border-radius:4px;display:flex;justify-content:space-between;">
                    <span>📦 Найти 3 сундука</span>
                    <span style="color:#52b788;">1/3</span>
                </div>
                <div style="background:rgba(255,255,255,0.05);padding:10px;margin:5px 0;border-radius:4px;display:flex;justify-content:space-between;">
                    <span>👑 Победить босса</span>
                    <span style="color:#888;">0/1</span>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeDailyScreen() {
    const screen = document.getElementById('daily-screen');
    if (screen) screen.remove();
}

// ---------- ПРОФИЛЬ ----------
function showProfileScreen() {
    const screenHTML = `
    <div id="profile-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/profile_visual.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeProfileScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">👤 Профиль</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;">
            <div style="font-size:60px;margin-bottom:10px;">👤</div>
            <div style="font-size:24px;color:#ffa500;">Герой</div>
            <div style="color:#888;">Уровень ${PlayerStats.level}</div>
            <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;max-width:300px;">
                <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:4px;text-align:center;">
                    <div style="color:#ff6b6b;">❤️ HP</div>
                    <div>${PlayerStats.hp}/${PlayerStats.maxHp}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:4px;text-align:center;">
                    <div style="color:#ffd700;">💰 Золото</div>
                    <div>${PlayerStats.gold}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:4px;text-align:center;">
                    <div style="color:#4ecdc4;">⚔️ Атака</div>
                    <div>${PlayerStats.damage}</div>
                </div>
                <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:4px;text-align:center;">
                    <div style="color:#a8d8ea;">🛡️ Защита</div>
                    <div>${PlayerStats.armor}</div>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeProfileScreen() {
    const screen = document.getElementById('profile-screen');
    if (screen) screen.remove();
}

// ---------- ОСТАЛЬНЫЕ ЭКРАНЫ (ЗАГЛУШКИ) ----------
function showBagScreen() { showGenericScreen('Сумка', '🎒'); }
function showForgeScreen() { showGenericScreen('Кузница', '🔧'); }
function showMarketScreen() { showGenericScreen('Рынок', '🏪'); }
function showBestiaryScreen() { showGenericScreen('Бестиарий', '📖'); }
function showHearthScreen() { showGenericScreen('Очаг', '🔥'); }
function showArenaScreen() { showGenericScreen('Арена', '⚔️'); }
function showChatScreen() { showGenericScreen('Чат', '💬'); }
function showWalletScreen() { showGenericScreen('Кошель', '💰'); }

function showGenericScreen(title, icon) {
    const screenHTML = `
    <div id="generic-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:rgba(0,0,0,0.9);display:flex;flex-direction:column;">
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
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeGenericScreen() {
    const screen = document.getElementById('generic-screen');
    if (screen) screen.remove();
}

// ---------- НАСТРОЙКИ ----------
function showSettingsScreen() {
    const musicEnabled = typeof Settings !== 'undefined' ? Settings.isMusicEnabled() : true;
    
    const screenHTML = `
    <div id="settings-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/settings_visual.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeSettingsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">Настройки</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;padding:20px;gap:20px;">
            <button onclick="toggleMusicSetting()" style="background:#c9a040;border:none;border-radius:8px;padding:15px 40px;color:#000;font-weight:bold;cursor:pointer;font-size:1.1em;">
                ${musicEnabled ? '🔊 Музыка: Включена' : '🔇 Музыка: Выключена'}
            </button>
            <button onclick="resetGameData()" style="background:#6a2d2d;border:none;border-radius:8px;padding:15px 40px;color:#fff;font-weight:bold;cursor:pointer;font-size:1.1em;">
                🔄 Сбросить прогресс
            </button>
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
        const enabled = Settings.toggleMusic();
        if (!enabled && AudioManager && AudioManager.stopCityTheme) {
            AudioManager.stopCityTheme();
        } else if (enabled && AudioManager && AudioManager.playCityTheme) {
            AudioManager.playCityTheme();
        }
    }
    closeSettingsScreen();
    showSettingsScreen();
}

function resetGameData() {
    if (confirm('Точно сбросить весь прогресс?')) {
        localStorage.removeItem('sherwood_save');
        location.reload();
    }
}

// ---------- ТАВЕРНА ----------
function showTavernScreen() {
    if (typeof Sherwood !== 'undefined' && Sherwood.Tavern) {
        Sherwood.Tavern.init();
    }
    
    const screenHTML = `
    <div id="tavern-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/section_tavern.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeTavernScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">🍺 Таверна</span>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;scrollbar-width:none;">
            <div id="tavern-content">
                <div style="text-align:center;color:#fff;font-family:monospace;">
                    <div style="font-size:48px;">🍺</div>
                    <div style="font-size:20px;color:#ffa500;">Добро пожаловать в таверну!</div>
                    <div style="color:#888;margin-top:10px;">Здесь можно взять контракты и прокачать таланты.</div>
                    <div style="display:flex;gap:10px;justify-content:center;margin-top:20px;">
                        <button onclick="showTavernContracts()" class="btn">📋 Контракты</button>
                        <button onclick="showTavernTalents()" class="btn btn-gold">⭐ Таланты</button>
                    </div>
                    <div id="tavern-tab-content" style="margin-top:20px;"></div>
                </div>
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeTavernScreen() {
    const screen = document.getElementById('tavern-screen');
    if (screen) screen.remove();
}

function showTavernContracts() {
    const container = document.getElementById('tavern-tab-content');
    if (!container) return;
    
    container.innerHTML = `
        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;border:1px solid #ffa500;">
            <div style="color:#ffd700;font-weight:bold;">📋 Контракт: Убить гоблинов</div>
            <div style="color:#aaa;font-size:14px;">Убей 5 гоблинов в подземке</div>
            <div style="display:flex;justify-content:space-between;margin-top:10px;">
                <span style="color:#888;">Прогресс: 0/5</span>
                <span style="color:#ffd700;">Награда: 50 золота</span>
            </div>
            <button class="btn btn-success" style="margin-top:10px;width:100%;">Взять контракт</button>
        </div>
    `;
}

function showTavernTalents() {
    const container = document.getElementById('tavern-tab-content');
    if (!container) return;
    
    const talents = [
        { name: 'Сила', desc: '+5 к атаке', icon: '💪' },
        { name: 'Защита', desc: '+3 к броне', icon: '🛡️' },
        { name: 'Живучесть', desc: '+20 HP', icon: '❤️' }
    ];
    
    container.innerHTML = talents.map(t => `
        <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:6px;margin:8px 0;display:flex;justify-content:space-between;align-items:center;border:1px solid #333;">
            <div>
                <span style="font-size:24px;">${t.icon}</span>
                <span style="color:#ffd700;font-weight:bold;margin-left:10px;">${t.name}</span>
                <div style="color:#888;font-size:12px;">${t.desc}</div>
            </div>
            <button class="btn btn-success" style="padding:4px 15px;font-size:12px;">Изучить</button>
        </div>
    `).join('');
}

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
window.upgradeStat = upgradeStat;
window.showDailyScreen = showDailyScreen;
window.closeDailyScreen = closeDailyScreen;
window.showProfileScreen = showProfileScreen;
window.closeProfileScreen = closeProfileScreen;
window.showBagScreen = showBagScreen;
window.showForgeScreen = showForgeScreen;
window.showMarketScreen = showMarketScreen;
window.showBestiaryScreen = showBestiaryScreen;
window.showHearthScreen = showHearthScreen;
window.showArenaScreen = showArenaScreen;
window.showChatScreen = showChatScreen;
window.showWalletScreen = showWalletScreen;
window.closeGenericScreen = closeGenericScreen;
window.showSettingsScreen = showSettingsScreen;
window.closeSettingsScreen = closeSettingsScreen;
window.toggleMusicSetting = toggleMusicSetting;
window.resetGameData = resetGameData;
window.showTavernScreen = showTavernScreen;
window.closeTavernScreen = closeTavernScreen;
window.showTavernContracts = showTavernContracts;
window.showTavernTalents = showTavernTalents;
window.saveGameData = saveGameData;
window.loadGameData = loadGameData;
window.showLoadingOverlay = showLoadingOverlay;
window.hideLoadingOverlay = hideLoadingOverlay;

// ---------- АВТОЗАГРУЗКА ПРИ СТАРТЕ ----------
console.log('🌳 Sherwood RPG загружена!');
console.log(`📊 Уровень: ${PlayerStats.level}, HP: ${PlayerStats.hp}/${PlayerStats.maxHp}`);
console.log('💾 Сохранение:', localStorage.getItem('sherwood_save') ? 'есть' : 'нет');

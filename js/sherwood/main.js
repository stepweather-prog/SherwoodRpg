// js/main.js — ПОЛНАЯ ВЕРСИЯ С ИСПРАВЛЕННЫМИ КВЕСТАМИ

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
//  КВЕСТЫ - ИСПРАВЛЕННАЯ ВЕРСИЯ
// ============================================================

function showQuestsScreen() {
    // Закрываем предыдущий экран если есть
    closeQuestsScreen();
    
    // Получаем данные из Sherwood.Quests
    let chapters = [];
    let progress = { completed: [], currentChapter: 1 };
    let attemptsToday = 0;
    let isOnCooldown = false;
    let cooldownRemain = 0;
    
    if (typeof Sherwood !== 'undefined' && Sherwood.Quests) {
        try {
            // Получаем все главы
            if (typeof Sherwood.Quests.getAllChapters === 'function') {
                chapters = Sherwood.Quests.getAllChapters();
            } else if (Sherwood.Quests.CHAPTERS) {
                chapters = Sherwood.Quests.CHAPTERS;
            }
            
            // Получаем прогресс
            if (typeof Sherwood.Quests.getProgress === 'function') {
                progress = Sherwood.Quests.getProgress();
            }
            
            // Получаем попытки
            if (typeof Sherwood.Quests.getAttemptsToday === 'function') {
                attemptsToday = Sherwood.Quests.getAttemptsToday();
            }
            
            // Проверяем перезарядку
            if (typeof Sherwood.Quests.isOnCooldown === 'function') {
                isOnCooldown = Sherwood.Quests.isOnCooldown();
            }
            if (typeof Sherwood.Quests.getCooldownRemaining === 'function') {
                cooldownRemain = Sherwood.Quests.getCooldownRemaining();
            }
            
            console.log('📋 Данные квестов загружены:', { chapters: chapters.length, progress });
        } catch(e) {
            console.error('❌ Ошибка загрузки данных квестов:', e);
        }
    }
    
    // Если глав нет - создаём тестовые
    if (chapters.length === 0) {
        chapters = [
            { id: 1, name: 'Кровь Великого Дуба', boss: { name: 'Лесничий-Отступник' }, stages: 5, rewards: { exp: 200, gold: 50 } },
            { id: 2, name: 'Кара Скверны', boss: { name: 'Вожак Искаженной Стаи' }, stages: 5, rewards: { exp: 400, gold: 100 } },
            { id: 3, name: 'Старый Егерь', boss: { name: 'Альфа-Гончая Егеря' }, stages: 5, rewards: { exp: 600, gold: 150 } },
            { id: 4, name: 'Спуск в Чащобу', boss: { name: 'Падший Друид' }, stages: 5, rewards: { exp: 800, gold: 200 } },
            { id: 5, name: 'Искажённая Экосистема', boss: { name: 'Голод Чащи' }, stages: 5, rewards: { exp: 1000, gold: 250 } }
        ];
        progress.completed = [];
        progress.currentChapter = 1;
    }
    
    const completed = progress.completed || [];
    const currentChapter = progress.currentChapter || 1;
    
    // Создаём экран
    const screenHTML = `
    <div id="quests-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/quest.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <!-- Верхняя панель -->
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
            <button onclick="closeQuestsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">📋 Квесты</span>
            <span style="color:#888;font-size:12px;margin-left:auto;">
                ⚔️ ${attemptsToday}/5 сегодня
                ${isOnCooldown ? `⏳ ${cooldownRemain} мин` : '✅ готов'}
            </span>
        </div>
        
        <!-- Контент -->
        <div style="flex:1;overflow-y:auto;padding:20px;scrollbar-width:none;color:#fff;font-family:monospace;">
            <div style="max-width:600px;margin:0 auto;">
                <div style="text-align:center;margin-bottom:15px;">
                    <div style="color:#ffa500;font-size:16px;">🏆 Пройдено: ${completed.length}/${chapters.length}</div>
                    <div style="color:#888;font-size:12px;">Текущая глава: ${currentChapter}</div>
                </div>
                
                <div id="quests-list" style="display:flex;flex-direction:column;gap:8px;"></div>
                
                ${isOnCooldown ? `
                <div style="text-align:center;margin-top:15px;padding:10px;background:rgba(255,165,0,0.1);border:1px solid #ffa500;border-radius:6px;">
                    <div style="color:#ffa500;">⏳ Перезарядка: ${cooldownRemain} минут</div>
                    <button onclick="accelerateQuest()" class="btn btn-gold" style="margin-top:8px;padding:6px 20px;font-size:12px;">⏩ Ускорить</button>
                </div>
                ` : ''}
            </div>
        </div>
    </div>`;
    
    document.body.insertAdjacentHTML('beforeend', screenHTML);
    
    // Заполняем список квестов
    renderQuestsList(chapters, completed, currentChapter);
}

function renderQuestsList(chapters, completed, currentChapter) {
    const container = document.getElementById('quests-list');
    if (!container) return;
    
    container.innerHTML = chapters.map(ch => {
        const isCompleted = completed.includes(ch.id);
        const isCurrent = ch.id === currentChapter;
        const isLocked = ch.id > currentChapter && !isCompleted;
        
        let statusText = '';
        let statusColor = '#888';
        let statusIcon = '📋';
        let canStart = false;
        
        if (isCompleted) {
            statusText = '✅ Пройдена';
            statusColor = '#52b788';
            statusIcon = '✅';
            canStart = false;
        } else if (isLocked) {
            statusText = '🔒 Закрыта';
            statusColor = '#555';
            statusIcon = '🔒';
            canStart = false;
        } else if (isCurrent) {
            statusText = '⚔️ Текущая';
            statusColor = '#ffd700';
            statusIcon = '⚔️';
            canStart = true;
        } else {
            statusText = '📖 Доступна';
            statusColor = '#ffa500';
            statusIcon = '📖';
            canStart = true;
        }
        
        // Проверяем, есть ли активный бой
        let hasActiveBattle = false;
        if (typeof Sherwood !== 'undefined' && Sherwood.Quests) {
            try {
                const battle = Sherwood.Quests.getBattle ? Sherwood.Quests.getBattle() : null;
                hasActiveBattle = battle !== null && battle.chapter && battle.chapter.id === ch.id;
            } catch(e) {}
        }
        
        return `
        <div style="background:rgba(255,255,255,0.05);padding:12px 16px;border-radius:8px;border-left:4px solid ${statusColor};transition:all 0.3s;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div style="flex:1;">
                    <div style="font-weight:bold;color:${statusColor};">
                        ${statusIcon} ${ch.id}. ${ch.name}
                    </div>
                    <div style="color:#aaa;font-size:12px;margin-top:2px;">
                        Босс: ${ch.boss ? ch.boss.name : 'Неизвестен'} 
                        ${ch.stages ? `| Этапов: ${ch.stages}` : ''}
                    </div>
                    ${ch.rewards ? `
                    <div style="color:#ffd700;font-size:11px;margin-top:2px;">
                        Награда: +${ch.rewards.exp} опыта, +${ch.rewards.gold} золота
                    </div>
                    ` : ''}
                </div>
                <div style="text-align:right;min-width:80px;">
                    <div style="font-size:12px;color:${statusColor};">${statusText}</div>
                    ${canStart ? `
                        ${hasActiveBattle ? 
                            `<button class="btn btn-danger" style="margin-top:4px;padding:4px 12px;font-size:11px;" onclick="continueQuestBattle(${ch.id})">⚔️ Продолжить</button>` :
                            `<button class="btn btn-success" style="margin-top:4px;padding:4px 12px;font-size:11px;" onclick="startQuestChapter(${ch.id})">Начать</button>`
                        }
                    ` : ''}
                    ${isCompleted ? `<div style="color:#52b788;font-size:20px;margin-top:4px;">🏆</div>` : ''}
                </div>
            </div>
        </div>
    `}).join('');
    
    // Добавляем информацию о текущем бое, если есть
    if (typeof Sherwood !== 'undefined' && Sherwood.Quests) {
        try {
            const battle = Sherwood.Quests.getBattle ? Sherwood.Quests.getBattle() : null;
            if (battle && battle.enemy) {
                const battleHtml = `
                <div style="margin-top:15px;padding:12px;background:rgba(255,0,0,0.1);border:2px solid #ff6b6b;border-radius:8px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <div style="color:#ff6b6b;font-weight:bold;">⚔️ ТЕКУЩИЙ БОЙ</div>
                            <div style="color:#fff;">${battle.enemy.name}</div>
                            <div style="color:#888;font-size:12px;">Этап ${battle.stage}/${battle.total}</div>
                        </div>
                        <button class="btn btn-danger" onclick="continueQuestBattle(${battle.chapter.id})">⚔️ В бой!</button>
                    </div>
                </div>
                `;
                container.insertAdjacentHTML('beforeend', battleHtml);
            }
        } catch(e) {}
    }
}

function startQuestChapter(chapterId) {
    if (typeof Sherwood === 'undefined' || !Sherwood.Quests) {
        alert('⚔️ Квестовая система не загружена. Проверь подключение quests.js');
        return;
    }
    
    try {
        const result = Sherwood.Quests.startChapter(chapterId);
        
        if (result && result.success) {
            // Закрываем экран квестов
            closeQuestsScreen();
            
            // Показываем экран битвы
            if (typeof Sherwood.Quests.showBattleUI === 'function') {
                Sherwood.Quests.showBattleUI();
            } else {
                // Создаём простой экран битвы
                showSimpleBattleUI(result);
            }
        } else {
            alert(result?.reason || '❌ Не удалось начать главу');
        }
    } catch(e) {
        console.error('❌ Ошибка старта главы:', e);
        alert('❌ Ошибка: ' + e.message);
    }
}

function continueQuestBattle(chapterId) {
    closeQuestsScreen();
    
    if (typeof Sherwood !== 'undefined' && Sherwood.Quests) {
        if (typeof Sherwood.Quests.showBattleUI === 'function') {
            Sherwood.Quests.showBattleUI();
        } else {
            // Пытаемся получить текущий бой
            const battle = Sherwood.Quests.getBattle ? Sherwood.Quests.getBattle() : null;
            if (battle) {
                showSimpleBattleUI({ chapter: battle.chapter, enemy: battle.enemy, stage: battle.stage, total: battle.total });
            } else {
                alert('❌ Нет активного боя');
            }
        }
    }
}

function showSimpleBattleUI(data) {
    const enemy = data.enemy || { name: 'Враг', hp: 100, maxHp: 100 };
    const chapter = data.chapter || { id: 1, name: 'Глава' };
    const stage = data.stage || 1;
    const total = data.total || 5;
    
    const overlay = document.createElement('div');
    overlay.id = 'battle-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.95);
        z-index: 400;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Courier New', monospace;
        color: #fff;
    `;
    
    overlay.innerHTML = `
        <div style="background:linear-gradient(180deg,#1a0f08,#2d1a10);border:3px solid #8B4513;border-radius:12px;padding:30px;max-width:500px;width:90%;">
            <div style="text-align:center;margin-bottom:15px;">
                <div style="color:#ffa500;font-size:20px;font-weight:bold;">⚔️ БИТВА</div>
                <div style="color:#888;font-size:14px;">${chapter.name} - Этап ${stage}/${total}</div>
            </div>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
                <div>
                    <div style="color:#ff6b6b;">👾 ${enemy.name}</div>
                    <div style="font-size:24px;font-weight:bold;">❤️ ${enemy.hp}</div>
                    <div style="width:150px;height:8px;background:#333;border-radius:4px;overflow:hidden;">
                        <div style="width:${(enemy.hp/enemy.maxHp)*100}%;height:100%;background:linear-gradient(90deg,#ff0000,#ff4444);"></div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="color:#4ecdc4;">🧙 Герой</div>
                    <div style="font-size:24px;font-weight:bold;">❤️ ${PlayerStats.hp}</div>
                    <div style="width:150px;height:8px;background:#333;border-radius:4px;overflow:hidden;margin-left:auto;">
                        <div style="width:${(PlayerStats.hp/PlayerStats.maxHp)*100}%;height:100%;background:linear-gradient(90deg,#00ff00,#44ff44);"></div>
                    </div>
                </div>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:15px;">
                <button onclick="simpleBattleAttack()" style="padding:12px;background:#6a2d2d;border:2px solid #ff6b6b;border-radius:6px;color:#fff;cursor:pointer;font-size:16px;font-weight:bold;">⚔️ АТАКА</button>
                <button onclick="simpleBattleSkip()" style="padding:12px;background:#4a4a4a;border:1px solid #666;border-radius:6px;color:#aaa;cursor:pointer;font-size:14px;">💤 Отдых</button>
            </div>
            
            <div id="battle-log" style="margin-top:10px;padding:8px;background:rgba(0,0,0,0.5);border-radius:4px;height:60px;overflow-y:auto;font-size:12px;color:#888;"></div>
            
            <button onclick="document.getElementById('battle-overlay').remove()" style="margin-top:10px;padding:6px 20px;background:#333;border:none;border-radius:4px;color:#888;cursor:pointer;">✖ Выход</button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Сохраняем данные боя
    window._simpleBattle = {
        enemy: enemy,
        chapter: chapter,
        stage: stage,
        total: total
    };
}

function simpleBattleAttack() {
    const battle = window._simpleBattle;
    if (!battle) return;
    
    const enemy = battle.enemy;
    
    // Урон игрока
    let damage = PlayerStats.damage + Math.floor(Math.random() * 5) - 2;
    damage = Math.max(1, damage - Math.floor((enemy.def || 0) / 2));
    
    // Крит
    let isCrit = Math.random() * 100 < 15;
    if (isCrit) damage *= 2;
    
    enemy.hp -= damage;
    if (enemy.hp < 0) enemy.hp = 0;
    
    addBattleLog(`💢 ${isCrit ? '💥 КРИТ! ' : ''}${damage} урона! (${enemy.hp}/${enemy.maxHp})`);
    
    if (enemy.hp <= 0) {
        addBattleLog('🏆 Враг повержен!');
        // Награда
        const expReward = 20 + PlayerStats.level * 5;
        const goldReward = 10 + PlayerStats.level * 3;
        PlayerStats.exp += expReward;
        PlayerStats.gold += goldReward;
        addBattleLog(`✨ +${expReward} опыта, +${goldReward} золота`);
        updateTopBar();
        saveGameData();
        return;
    }
    
    // Атака врага
    let enemyDamage = Math.floor((enemy.atk || 10) * (0.7 + Math.random() * 0.6));
    enemyDamage = Math.max(1, enemyDamage - Math.floor(PlayerStats.armor / 3));
    PlayerStats.hp -= enemyDamage;
    if (PlayerStats.hp < 0) PlayerStats.hp = 0;
    
    addBattleLog(`💢 Враг нанёс ${enemyDamage} урона! (${PlayerStats.hp}/${PlayerStats.maxHp})`);
    updateTopBar();
    
    if (PlayerStats.hp <= 0) {
        addBattleLog('💀 Ты погиб!');
        PlayerStats.gold = Math.floor(PlayerStats.gold * 0.8);
        PlayerStats.hp = Math.floor(PlayerStats.maxHp * 0.3);
        saveGameData();
        updateTopBar();
    }
    
    // Обновляем UI
    updateBattleUI();
}

function simpleBattleSkip() {
    const heal = Math.floor(PlayerStats.maxHp * 0.08);
    PlayerStats.hp = Math.min(PlayerStats.maxHp, PlayerStats.hp + heal);
    addBattleLog(`💤 Отдых: +${heal} HP`);
    updateTopBar();
    updateBattleUI();
}

function addBattleLog(msg) {
    const log = document.getElementById('battle-log');
    if (log) {
        log.innerHTML += `<div>${msg}</div>`;
        log.scrollTop = log.scrollHeight;
    }
}

function updateBattleUI() {
    const battle = window._simpleBattle;
    if (!battle) return;
    
    const enemy = battle.enemy;
    
    // Обновляем HP игрока и врага
    const allDivs = document.querySelectorAll('#battle-overlay [style*="font-size:24px"][style*="font-weight:bold;"]');
    if (allDivs.length >= 2) {
        allDivs[0].textContent = `❤️ ${enemy.hp}`;
        allDivs[1].textContent = `❤️ ${PlayerStats.hp}`;
    }
    
    // Обновляем полоски
    const bars = document.querySelectorAll('#battle-overlay [style*="height:8px;background:#333;border-radius:4px;overflow:hidden;"] > div');
    if (bars.length >= 2) {
        bars[0].style.width = (enemy.hp / enemy.maxHp * 100) + '%';
        bars[1].style.width = (PlayerStats.hp / PlayerStats.maxHp * 100) + '%';
    }
}

function accelerateQuest() {
    if (typeof Sherwood !== 'undefined' && Sherwood.Quests) {
        if (typeof Sherwood.Quests.accelerate === 'function') {
            const result = Sherwood.Quests.accelerate();
            if (result && result.success) {
                alert('✅ Перезарядка сброшена!');
                closeQuestsScreen();
                setTimeout(() => showQuestsScreen(), 300);
            } else {
                alert(result?.reason || '❌ Не удалось ускорить');
            }
        } else {
            alert('⏳ Ускорение пока недоступно');
        }
    }
}

function closeQuestsScreen() {
    const screen = document.getElementById('quests-screen');
    if (screen) screen.remove();
    
    // Закрываем также экран битвы если есть
    const battle = document.getElementById('battle-overlay');
    if (battle) battle.remove();
}

// ============================================================
//  ОСТАЛЬНЫЕ ЭКРАНЫ
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
        console.log('🏚️ Вход в подземелье:', dungeonId);
        Sherwood.Dungeon2D5.render();
    } else {
        alert('🚧 Подземелье "' + dungeonId + '" в разработке');
    }
}

// ---------- ПОРТАЛЫ ----------
function showPortalsScreen() {
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
window.startQuestChapter = startQuestChapter;
window.continueQuestBattle = continueQuestBattle;
window.accelerateQuest = accelerateQuest;
window.simpleBattleAttack = simpleBattleAttack;
window.simpleBattleSkip = simpleBattleSkip;
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

// ---------- АВТОЗАГРУЗКА ----------
console.log('🌳 Sherwood RPG загружена!');
console.log(`📊 Уровень: ${PlayerStats.level}, HP: ${PlayerStats.hp}/${PlayerStats.maxHp}`);
console.log('💾 Сохранение:', localStorage.getItem('sherwood_save') ? 'есть' : 'нет');

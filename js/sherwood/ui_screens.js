// ============================================================
//  js/sherwood/ui_screens.js — ВСЕ ЭКРАНЫ РАЗДЕЛОВ
// ============================================================

// ---------- ПОДЗЕМКА ----------
function showDungeonScreen() {
    closeAllScreens();
    
    // Если есть Dungeon2D5 — используем его
    if (typeof Sherwood !== 'undefined' && Sherwood.Dungeon2D5) {
        if (typeof Sherwood.Dungeon2D5.render === 'function') {
            stopMainMusic();
            Sherwood.Dungeon2D5.render();
            return;
        }
    }
    
    const screenHTML = `
    <div id="dungeon-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/sherwood_thicket.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeDungeonScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">🏚️ Подземелья</span>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;">
            <div style="display:flex;flex-direction:column;align-items:center;gap:30px;">
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
    if (typeof startMainMusic === 'function') startMainMusic();
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

// ---------- КВЕСТЫ ----------
function showQuestsScreen() {
    closeAllScreens();
    
    // Если есть Sherwood.Quests с методом showUI
    if (typeof Sherwood !== 'undefined' && Sherwood.Quests) {
        if (typeof Sherwood.Quests.showUI === 'function') {
            Sherwood.Quests.showUI();
            return;
        }
    }
    
    // Заглушка
    const screenHTML = `
    <div id="quests-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/quest.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeQuestsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">📋 Квесты</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;">
            <div style="font-size:48px;margin-bottom:20px;">📋</div>
            <div style="font-size:20px;color:#ffa500;">Квесты</div>
            <div style="color:#888;font-size:14px;text-align:center;max-width:400px;">Выполняй задания и получай награды.</div>
            <button onclick="closeQuestsScreen()" class="btn" style="margin-top:20px;padding:10px 30px;">Назад</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeQuestsScreen() {
    const screen = document.getElementById('quests-screen');
    if (screen) screen.remove();
    if (typeof showHomeScreen === 'function') showHomeScreen();
}

// ---------- ТАВЕРНА ----------
function showTavernScreen() {
    closeAllScreens();
    
    if (typeof Sherwood !== 'undefined' && Sherwood.Tavern) {
        if (typeof Sherwood.Tavern.showUI === 'function') {
            Sherwood.Tavern.showUI();
            return;
        }
    }
    
    const screenHTML = `
    <div id="tavern-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/section_tavern.png') center/cover no-repeat;display:flex;flex-direction:column;">
        <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
            <button onclick="closeTavernScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
            </button>
            <span style="color:#e0c080;font-size:1.2em;">🍺 Таверна</span>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;font-family:monospace;padding:20px;">
            <div style="font-size:48px;margin-bottom:20px;">🍺</div>
            <div style="font-size:20px;color:#ffa500;">Добро пожаловать в таверну!</div>
            <button onclick="closeTavernScreen()" class="btn" style="margin-top:20px;padding:10px 30px;">Назад</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeTavernScreen() {
    const screen = document.getElementById('tavern-screen');
    if (screen) screen.remove();
    if (typeof showHomeScreen === 'function') showHomeScreen();
}

// ---------- ПОРТАЛЫ ----------
function showPortalsScreen() {
    closeAllScreens();
    
    if (typeof Sherwood !== 'undefined' && Sherwood.Portal) {
        if (typeof Sherwood.Portal.showUI === 'function') {
            Sherwood.Portal.showUI();
            return;
        }
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
            <div style="color:#888;font-size:14px;text-align:center;max-width:400px;">Путешествуй между мирами.</div>
            <button onclick="closePortalsScreen()" class="btn" style="margin-top:20px;padding:10px 30px;">Назад</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closePortalsScreen() {
    const screen = document.getElementById('portals-screen');
    if (screen) screen.remove();
    if (typeof showHomeScreen === 'function') showHomeScreen();
}

// ---------- РЕЙД ----------
function showRaidScreen() {
    closeAllScreens();
    
    if (typeof Sherwood !== 'undefined' && Sherwood.Raid) {
        if (typeof Sherwood.Raid.showUI === 'function') {
            Sherwood.Raid.showUI();
            return;
        }
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
            <div style="color:#888;font-size:14px;text-align:center;max-width:400px;">Объединяйся с другими игроками.</div>
            <button onclick="closeRaidScreen()" class="btn" style="margin-top:20px;padding:10px 30px;">Назад</button>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', screenHTML);
}

function closeRaidScreen() {
    const screen = document.getElementById('raid-screen');
    if (screen) screen.remove();
    if (typeof showHomeScreen === 'function') showHomeScreen();
}

// ---------- БЕСТИАРИЙ ----------
function showBestiaryScreen() {
    closeAllScreens();
    
    if (typeof Sherwood !== 'undefined' && Sherwood.Bestiary) {
        if (typeof Sherwood.Bestiary.showUI === 'function') {
            Sherwood.Bestiary.showUI();
            return;
        }
    }
    showGenericScreen('Бестиарий', '📖');
}

// ---------- КУЗНИЦА ----------
function showForgeScreen() {
    closeAllScreens();
    
    if (typeof Sherwood !== 'undefined' && Sherwood.Forge) {
        if (typeof Sherwood.Forge.showUI === 'function') {
            Sherwood.Forge.showUI();
            return;
        }
    }
    showGenericScreen('Кузница', '🔧');
}

// ---------- РЫНОК ----------
function showMarketScreen() {
    closeAllScreens();
    
    if (typeof Sherwood !== 'undefined' && Sherwood.BlackMarket) {
        if (typeof Sherwood.BlackMarket.showUI === 'function') {
            Sherwood.BlackMarket.showUI();
            return;
        }
    }
    showGenericScreen('Рынок', '🏪');
}

// ---------- ПРОФИЛЬ ----------
function showProfileScreen() {
    closeAllScreens();
    
    const allTalents = typeof Talents !== 'undefined' ? Talents.list : [];
    const learned = typeof Talents !== 'undefined' ? Talents.getLearned() : {};
    const player = window.PlayerStats || { hp: 100, maxHp: 100, damage: 100, armor: 100, level: 1 };
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
                                        <button onclick="window.upgradeTalentFromProfile && window.upgradeTalentFromProfile('${talent.id}')" class="btn btn-gold" style="padding:3px 10px;font-size:10px;">
                                            ⬆ Прокачать (${player.skillPoints || 0} опыта)
                                        </button>
                                    ` : ''}
                                    <button onclick="window.toggleTalentFromProfile && window.toggleTalentFromProfile('${talent.id}')" class="btn ${isEnabled ? 'btn-success' : 'btn-danger'}" style="padding:3px 10px;font-size:10px;">
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
    if (typeof showHomeScreen === 'function') showHomeScreen();
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
            <button onclick="window.toggleMusicSetting && window.toggleMusicSetting()" style="background:#c9a040;border:none;border-radius:8px;padding:15px 40px;color:#000;font-weight:bold;cursor:pointer;font-size:1.1em;">
                ${musicEnabled ? '🔊 Музыка: Включена' : '🔇 Музыка: Выключена'}
            </button>
            <button onclick="if(confirm('⚠️ Точно сбросить весь прогресс?')){localStorage.clear();location.reload();}" style="background:#6a2d2d;border:none;border-radius:8px;padding:15px 40px;color:#fff;font-weight:bold;cursor:pointer;font-size:1.1em;">
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
    if (typeof showHomeScreen === 'function') showHomeScreen();
}

// ---------- УНИВЕРСАЛЬНЫЙ ЭКРАН-ЗАГЛУШКА ----------
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
    if (typeof showHomeScreen === 'function') showHomeScreen();
}

console.log('🖥️ UI экраны загружены!');

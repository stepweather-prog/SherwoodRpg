/**
 * Sherwood UI — Полный контроллер интерфейса
 */

const SherwoodUI = {
    // ============================================================
    //  КОНСТАНТЫ
    // ============================================================

    _bg: {
        main: 'assets/backgrounds/homepage_screen.jpeg',
        dungeon_select: 'assets/backgrounds/thick.jpeg',
        dungeon_forest: 'assets/backgrounds/underground_1_floor_1.jpg',
        dungeon_swamp: 'assets/backgrounds/underground_2_floor_1.jpeg',
        dungeon_cave: 'assets/backgrounds/underground_3_floor_1.jpeg',
        dungeon_fight: 'assets/backgrounds/subway_battle2.jpeg',
        bag: 'assets/backgrounds/bag.jpeg',
        profile: 'assets/backgrounds/character_page.jpeg',
        bestiary: 'assets/backgrounds/bestiary.jpeg',
        quests: 'assets/backgrounds/background_of_skills.jpeg',
        training: 'assets/backgrounds/training_background.jpeg',
        blacksmith: 'assets/backgrounds/forge.jpeg',
        tavern: 'assets/backgrounds/tavern.jpeg',
        market: 'assets/backgrounds/market.jpeg',
        arena: 'assets/backgrounds/arena.jpeg',
        raid: 'assets/backgrounds/background_raid.png',
        settings: 'assets/backgrounds/settings_page.jpeg'
    },

    // ============================================================
    //  АУДИО
    // ============================================================

    _sounds: {},
    _currentMusic: null,
    _currentMusicKey: null,
    _soundEnabled: true,
    _musicEnabled: true,

    _audioFiles: {
        'forest_ambient': 'assets/sounds/forest_ambient.ogg',
        'dungeon_ambient': 'assets/sounds/dungeon_ambient.wav',
        'tavern_ambient': 'assets/sounds/tavern_ambient.wav',
        'click': 'assets/sounds/button_click.ogg',
        'shot': 'assets/sounds/shot.mp3',
        'arrow_hit': 'assets/sounds/arrow_hit.wav',
        'victory': 'assets/sounds/victory.wav',
        'defeat': 'assets/sounds/defeat.wav',
        'levelup': 'assets/sounds/levelup.wav',
        'chest_open': 'assets/sounds/chest_open.wav',
        'trap': 'assets/sounds/trap_trigger.wav',
        'dungeon_enter': 'assets/sounds/dungeon_enter.wav'
    },

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    init() {
        this.container = document.getElementById('game-container');
        if (!this.container) {
            console.error('❌ Контейнер #game-container не найден!');
            return;
        }

        this._initSounds();
        this.bindButtons();
        this.bindPlayButton();
        this.updateDisplay();
        this.loadHome();

        this._loadAudioSettings();

        console.log('🏹 Sherwood UI инициализирован!');
    },

    // ============================================================
    //  АУДИО
    // ============================================================

    _initSounds() {
        for (const [key, path] of Object.entries(this._audioFiles)) {
            const audio = new Audio(path);
            audio.preload = 'auto';
            this._sounds[key] = audio;
        }
    },

    _playSound(key) {
        if (!this._soundEnabled) return;
        const sound = this._sounds[key];
        if (sound) {
            sound.currentTime = 0;
            sound.volume = 0.5;
            sound.play().catch(() => {});
        }
    },

    _playMusic(key) {
        if (!this._musicEnabled) return;
        if (this._currentMusicKey === key && this._currentMusic && !this._currentMusic.paused) return;

        this._stopMusic();
        const music = this._sounds[key];
        if (music) {
            music.loop = true;
            music.volume = 0.3;
            music.currentTime = 0;
            music.play().catch(() => {});
            this._currentMusic = music;
            this._currentMusicKey = key;
        }
    },

    _stopMusic() {
        if (this._currentMusic) {
            this._currentMusic.pause();
            this._currentMusic.currentTime = 0;
            this._currentMusic = null;
            this._currentMusicKey = null;
        }
    },

    _saveAudioSettings() {
        localStorage.setItem('sherwood_audio_settings', JSON.stringify({
            soundEnabled: this._soundEnabled,
            musicEnabled: this._musicEnabled
        }));
    },

    _loadAudioSettings() {
        const saved = localStorage.getItem('sherwood_audio_settings');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this._soundEnabled = data.soundEnabled !== undefined ? data.soundEnabled : true;
                this._musicEnabled = data.musicEnabled !== undefined ? data.musicEnabled : true;
            } catch (e) {}
        }
    },

    // ============================================================
    //  КНОПКИ
    // ============================================================

    bindButtons() {
        document.querySelectorAll('.btn, .top-btn, .settings-btn').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = el.dataset.action;
                if (action && this[action]) {
                    this._playSound('click');
                    this[action]();
                } else {
                    console.log('🔘 Кнопка:', action || 'без action');
                }
            });
        });
    },

    bindPlayButton() {
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this._playSound('click');
                document.getElementById('loadingScreen').classList.add('hidden');
                document.getElementById('mainInterface').classList.add('active');
                this._playMusic('forest_ambient');
                console.log('🎮 Игра запущена!');
            });
        }
    },

    // ============================================================
    //  ОБНОВЛЕНИЕ ДАННЫХ
    // ============================================================

    updateDisplay(data) {
        const d = data || {
            gold: 1234,
            silver: 5678,
            level: 5,
            exp: 350,
            expMax: 500,
            attack: 124,
            defense: 87,
            agility: 43,
            hp: 320
        };

        const goldEl = document.getElementById('gold-display');
        const silverEl = document.getElementById('silver-display');
        const expEl = document.getElementById('exp-display');
        const expMaxEl = document.getElementById('exp-max-display');

        if (goldEl) goldEl.textContent = this._formatNumber(d.gold);
        if (silverEl) silverEl.textContent = this._formatNumber(d.silver);
        if (expEl) expEl.textContent = this._formatNumber(d.exp);
        if (expMaxEl) expMaxEl.textContent = this._formatNumber(d.expMax);

        const attackEl = document.querySelector('.stat-values .attack');
        const defenseEl = document.querySelector('.stat-values .defense');
        const agilityEl = document.querySelector('.stat-values .agility');
        const hpEl = document.querySelector('.stat-values .hp');

        if (attackEl) attackEl.textContent = d.attack;
        if (defenseEl) defenseEl.textContent = d.defense;
        if (agilityEl) agilityEl.textContent = d.agility;
        if (hpEl) hpEl.textContent = d.hp;
    },

    _formatNumber(n) {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    },

    // ============================================================
    //  НАВИГАЦИЯ
    // ============================================================

    loadHome() {
        document.querySelectorAll('.bg-layer, .statue-left, .statue-right, .divider-left, .divider-right, .arch-layer, .hero-frame, .top-panel, .top-actions, .left-buttons, .right-buttons, .bottom-stats')
            .forEach(el => {
                if (el) el.style.display = '';
            });

        const placeholder = document.querySelector('.placeholder-screen');
        if (placeholder) placeholder.remove();

        this.container.style.background = "url('" + this._bg.main + "') center/cover no-repeat";
        this._playMusic('forest_ambient');

        console.log('🏠 Главный экран');
    },

    // ============================================================
    //  ПОДЗЕМКА
    // ============================================================

    showDungeon() {
        this._hideMainInterface();
        this.container.style.background = "url('" + this._bg.dungeon_select + "') center/cover no-repeat";
        this._playMusic('dungeon_ambient');

        const dungeons = Sherwood.Dungeon.getAvailableDungeons();
        let list = '';

        for (const [id, data] of Object.entries(dungeons)) {
            const progress = Sherwood.Dungeon._playerProgress[id];
            list += `
                <div style="background:rgba(0,0,0,0.7);border:1px solid #555;border-radius:10px;padding:12px;margin-bottom:10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:#e0c080;font-size:1.1em;">${data.icon} ${data.name}</span>
                        <span style="color:#aaa;font-size:0.8em;">Уровень ${data.level}/7</span>
                    </div>
                    <div style="display:flex;gap:6px;margin:8px 0;flex-wrap:wrap;">
                        ${[1,2,3,4,5,6,7].map(level => `
                            <button onclick="SherwoodUI._startDungeon('${id}',${level})" 
                                    style="background:${level <= data.level ? '#c9a040' : '#444'};border:none;border-radius:4px;padding:4px 8px;color:${level <= data.level ? '#000' : '#888'};cursor:${level <= data.level ? 'pointer' : 'default'};font-size:0.8em;">
                                ${level <= data.level ? '⭐' : '🔒'} ${level}
                            </button>
                        `).join('')}
                    </div>
                    <div style="color:#666;font-size:0.7em;">${data.level >= 7 ? '✅ Пройдено' : `Следующий: ${data.level + 1}`}</div>
                </div>
            `;
        }

        this.container.innerHTML = `
            <div style="min-height:100%;background:rgba(0,0,0,0.7);padding:16px;max-width:500px;margin:0 auto;">
                <button onclick="SherwoodUI.loadHome()" style="background:rgba(255,255,255,0.1);border:1px solid #666;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer;margin-bottom:12px;">← Назад</button>
                <h2 style="color:#70a0e0;">🏰 Подземелья</h2>
                <div style="color:#aaa;font-size:0.8em;margin-bottom:12px;">🎫 Билетов: ${Sherwood.getPlayer()?.dungeon?.tickets || 0}</div>
                ${list}
            </div>
        `;
    },

    _startDungeon(dungeonId, level) {
        const d = Sherwood.Dungeon.generateDungeon(dungeonId, level);
        if (!d) {
            alert('Нет билетов!');
            return;
        }
        this._playSound('dungeon_enter');
        this._playMusic('dungeon_ambient');
        this._renderDungeon();
    },

    _renderDungeon() {
        const d = Sherwood.Dungeon.getDungeon();
        if (!d) { this.showDungeon(); return; }

        const bgMap = {
            forest: this._bg.dungeon_forest,
            swamp: this._bg.dungeon_swamp,
            cave: this._bg.dungeon_cave
        };
        this.container.style.background = "url('" + (bgMap[d.dungeonId] || this._bg.dungeon_forest) + "') center/cover no-repeat";

        const size = d.size;
        const cellSize = Math.min(50, Math.floor((this.container.clientWidth - 32) / size));
        const grid = d.grid;

        let gridHtml = '';

        for (let y = 0; y < size; y++) {
            gridHtml += '<div style="display:flex;justify-content:center;gap:2px;margin-bottom:2px;">';
            for (let x = 0; x < size; x++) {
                const cell = grid[y][x];
                const isPlayer = d.playerPos.x === x && d.playerPos.y === y;
                const isVisible = cell.visible || cell.explored;

                let bgImage = 'assets/icons/Dungeon tiles1.jpeg';
                let content = '';
                let borderColor = 'rgba(255,255,255,0.05)';
                let extraStyle = '';
                let clickHandler = '';

                if (isVisible) {
                    bgImage = 'assets/icons/level_seamless_horizontal_loop_1.jpg';
                    borderColor = 'rgba(255,255,255,0.1)';

                    if (cell.type === 'start') { content = '🏠'; }
                    else if (cell.type === 'exit') { content = '🚪'; borderColor = '#4caf50'; }
                    else if (cell.type === 'chest') { content = cell.looted ? '📭' : '📦'; borderColor = '#ffc107'; }
                    else if (cell.hasMonster) {
                        content = cell.isBoss ? '👑' : '👹';
                        borderColor = cell.isBoss ? '#ff6a00' : '#f44336';
                    }

                    const isAdjacent = Math.abs(x - d.playerPos.x) + Math.abs(y - d.playerPos.y) === 1;
                    if (isAdjacent && !isPlayer && cell.walkable) {
                        clickHandler = `onclick="SherwoodUI._dungeonMove(${x},${y})"`;
                        extraStyle = 'cursor:pointer;';
                        if (!cell.hasMonster && cell.type !== 'exit') {
                            borderColor = '#4caf50';
                        }
                    }
                } else {
                    bgImage = 'assets/icons/Dungeon tiles1.jpeg';
                    content = '';
                }

                if (isPlayer) {
                    content = '<img src="assets/interface/labyrinth_of_icons.png" style="width:80%;height:80%;object-fit:contain;">';
                    borderColor = '#ffd700';
                    extraStyle += 'box-shadow:0 0 16px rgba(255,215,0,0.5);';
                }

                gridHtml += `
                    <div ${clickHandler} style="
                        width:${cellSize}px;
                        height:${cellSize}px;
                        background-image:url('${bgImage}');
                        background-size:cover;
                        background-position:center;
                        border:2px solid ${borderColor};
                        border-radius:4px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        font-size:${cellSize * 0.4}px;
                        transition:0.15s;
                        ${extraStyle}
                        ${isPlayer ? 'background-color:rgba(255,215,0,0.1);' : ''}
                    ">
                        ${content}
                    </div>
                `;
            }
            gridHtml += '</div>';
        }

        this.container.innerHTML = `
            <div style="min-height:100%;background:rgba(0,0,0,0.5);padding:12px;display:flex;flex-direction:column;align-items:center;">
                <div style="width:100%;max-width:${cellSize * size + 20}px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <button onclick="SherwoodUI._leaveDungeon()" style="background:rgba(0,0,0,0.7);border:1px solid rgba(255,255,255,0.2);color:#ccc;padding:6px 12px;border-radius:6px;cursor:pointer;">← Выйти</button>
                        <div style="color:#70a0e0;font-weight:bold;">${d.dungeonId} Ур.${d.level}</div>
                        <div style="color:#4caf50;">❤️${Sherwood.getPlayer()?.stats?.hp || 0}</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.5);border-radius:6px;padding:6px;margin-bottom:8px;">
                        <div style="display:flex;justify-content:space-around;font-size:11px;color:#aaa;">
                            <span>👹 ${d.monstersKilled}/${d.totalMonsters}</span>
                            <span>📦 ${d.chestsOpened}</span>
                            <span>🚶 ${d.steps}</span>
                        </div>
                    </div>
                    ${gridHtml}
                    <div id="dungeon-log" style="text-align:center;font-size:12px;color:#aaa;min-height:20px;margin-top:8px;background:rgba(0,0,0,0.6);border-radius:6px;padding:6px;"></div>
                </div>
            </div>
        `;
    },

    _dungeonMove(x, y) {
        const dx = x - this._dungeon.playerPos.x;
        const dy = y - this._dungeon.playerPos.y;
        const result = Sherwood.Dungeon.movePlayer(dx, dy);

        const log = document.getElementById('dungeon-log');

        if (!result.success) {
            if (log) log.textContent = '🚫 ' + (result.reason || 'Нельзя');
            return;
        }

        if (result.type === 'battle') {
            if (log) log.textContent = '⚔️ Бой с ' + (result.isBoss ? 'БОССОМ!' : 'монстром!');
            this._playSound('shot');
            const battle = Sherwood.Combat.startPvE(result.monsterId);
            if (battle) {
                battle.dungeonTile = result.tile;
                Sherwood.once('BATTLE_VICTORY', () => {
                    Sherwood.Dungeon.onMonsterDefeated(result.tile);
                    this._playSound('victory');
                    this._renderDungeon();
                });
                Sherwood.once('BATTLE_DEFEAT', () => {
                    this._playSound('defeat');
                    this._leaveDungeon();
                });
                this._renderBattle();
            }
            return;
        }

        if (result.type === 'chest') {
            this._playSound('chest_open');
            if (log) log.textContent = '🎁 +' + result.reward.gold + '🪙 +' + result.reward.silver + '⚪';
            this._renderDungeon();
            return;
        }

        if (result.type === 'exit') {
            if (log) log.textContent = '🏆 Подземка пройдена!';
            this._playSound('victory');
            this._renderDungeon();
            setTimeout(() => {
                this._playMusic('forest_ambient');
                this.showDungeon();
            }, 2000);
            return;
        }

        if (log) log.textContent = '🚶 Шаг';
        this._renderDungeon();
    },

    _leaveDungeon() {
        Sherwood.Dungeon.leaveDungeon();
        this._playMusic('forest_ambient');
        this.showDungeon();
    },

    // ============================================================
    //  БОЙ
    // ============================================================

    _renderBattle() {
        this.container.innerHTML = `
            <div style="min-height:100%;background:url('${this._bg.dungeon_fight}') center/cover no-repeat;position:relative;">
                <div style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);"></div>
                <div style="position:relative;z-index:1;padding:20px;text-align:center;color:#fff;">
                    <h2 style="color:#ffd700;">⚔️ БОЙ ⚔️</h2>
                    <div style="font-size:2em;margin:20px 0;">👹</div>
                    <div style="color:#aaa;">Боевая система в разработке</div>
                    <button onclick="SherwoodUI._leaveDungeon()" style="margin-top:20px;background:#c9a040;border:none;padding:10px 30px;border-radius:8px;cursor:pointer;font-weight:bold;">Назад</button>
                </div>
            </div>
        `;
    },

    // ============================================================
    //  СУМКА (10 ячеек, 2 ряда)
    // ============================================================

    bag() {
        this._hideMainInterface();
        this.container.style.background = "url('" + this._bg.bag + "') center/cover no-repeat";
        this._playSound('click');

        const bag = Sherwood.Bag;
        const items = bag.getItems();
        const maxSlots = 10;

        let itemsHtml = '';
        for (let i = 0; i < maxSlots; i++) {
            const item = items[i] || null;
            if (item) {
                const gradeColor = Sherwood.Models?.GradeColors?.[item.grade] || '#9d9d9d';
                itemsHtml += `
                    <div style="background:url('assets/interface/bag_cell.jpeg') center/contain no-repeat;background-size:cover;width:60px;height:60px;border:2px solid ${gradeColor};border-radius:6px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;padding:4px;" onclick="SherwoodUI._bagAction(${i})">
                        <img src="${item.icon || 'assets/icons/default_item.png'}" style="width:32px;height:32px;object-fit:contain;">
                        ${item.quantity > 1 ? `<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.6em;background:rgba(0,0,0,0.7);padding:0 4px;border-radius:4px;">${item.quantity}</span>` : ''}
                        <span style="position:absolute;top:2px;left:4px;color:${gradeColor};font-size:0.4em;">${item.grade ? item.grade[0] : ''}</span>
                    </div>
                `;
            } else {
                itemsHtml += `
                    <div style="background:url('assets/interface/bag_cell.jpeg') center/contain no-repeat;background-size:cover;width:60px;height:60px;border:2px solid #333;border-radius:6px;display:flex;align-items:center;justify-content:center;opacity:0.4;">
                        <span style="color:#555;font-size:0.6em;">пусто</span>
                    </div>
                `;
            }
        }

        this.container.innerHTML = `
            <div style="min-height:100%;background:rgba(0,0,0,0.7);padding:16px;max-width:500px;margin:0 auto;">
                <button onclick="SherwoodUI.loadHome()" style="background:rgba(255,255,255,0.1);border:1px solid #666;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer;margin-bottom:12px;">← Назад</button>
                <h2 style="color:#e0c080;">🎒 Сумка</h2>
                <div style="color:#aaa;font-size:0.8em;margin-bottom:12px;">${items.length}/${maxSlots}</div>
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-width:340px;margin:0 auto;">
                    ${itemsHtml}
                </div>
                <div id="bag-info" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:12px;min-height:20px;">Нажми на предмет для действий</div>
            </div>
        `;
    },

    _bagAction(index) {
        const bag = Sherwood.Bag;
        const items = bag.getItems();
        if (index >= items.length) return;
        const item = items[index];
        if (!item) return;

        const info = document.getElementById('bag-info');
        if (!info) return;

        let actions = '';
        if (item.part) {
            actions += `<button onclick="Sherwood.Bag.equipItem(${index});SherwoodUI.bag();" style="background:#4caf50;border:none;border-radius:4px;padding:4px 12px;color:#fff;cursor:pointer;margin:0 4px;">Надеть</button>`;
        }
        actions += `<button onclick="Sherwood.Bag.sellItem(${index});SherwoodUI.bag();" style="background:#ff9800;border:none;border-radius:4px;padding:4px 12px;color:#fff;cursor:pointer;margin:0 4px;">Продать</button>`;
        actions += `<button onclick="Sherwood.Bag.dismantleItem(${index});SherwoodUI.bag();" style="background:#f44336;border:none;border-radius:4px;padding:4px 12px;color:#fff;cursor:pointer;margin:0 4px;">Разобрать</button>`;

        info.innerHTML = `
            <div style="color:#fff;font-size:0.9em;">${item.name}</div>
            <div style="color:#aaa;font-size:0.7em;">${item.grade || 'обычный'}</div>
            <div style="margin-top:6px;">${actions}</div>
        `;
    },

    // ============================================================
    //  ПРОФИЛЬ (с тренировкой, кузницей, бестиарием)
    // ============================================================

    profile() {
        this._hideMainInterface();
        this.container.style.background = "url('" + this._bg.profile + "') center/cover no-repeat";
        this._playSound('click');

        const p = Sherwood.getPlayer();
        const bag = Sherwood.Bag;
        const equipment = bag.getEquipment();

        // Сборка информации о кольцах и амулетах
        const ringItem = equipment.ring;
        const amuletItem = equipment.amulet;
        const lastTrophy = this._getLastTrophy();

        const ringDisplay = ringItem ? ringItem.name : 'Пусто';
        const amuletDisplay = amuletItem ? amuletItem.name : 'Пусто';
        const trophyDisplay = lastTrophy || 'Нет трофеев';

        this.container.innerHTML = `
            <div style="min-height:100%;background:rgba(0,0,0,0.7);padding:16px;max-width:500px;margin:0 auto;">
                <button onclick="SherwoodUI.loadHome()" style="background:rgba(255,255,255,0.1);border:1px solid #666;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer;margin-bottom:12px;">← Назад</button>

                <!-- СКИН ГЕРОЯ -->
                <div style="text-align:center;margin-bottom:12px;">
                    <img src="assets/hero_skins/skin_1_basic.png" style="width:80px;height:80px;border-radius:50%;border:2px solid #c9a040;display:inline-block;">
                    <div style="color:#e0c080;font-weight:bold;font-size:1.1em;margin-top:4px;">${p ? p.name : 'Охотник'}</div>
                    <div style="color:#aaa;font-size:0.8em;">Уровень ${p ? p.level : 1}</div>
                </div>

                <!-- СТАТЫ -->
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;background:rgba(0,0,0,0.4);border-radius:10px;padding:12px;margin-bottom:12px;">
                    <div style="text-align:center;"><span style="color:#f44336;">⚔️ ${p ? p.stats.attack : 0}</span></div>
                    <div style="text-align:center;"><span style="color:#2196f3;">🛡️ ${p ? p.stats.defense : 0}</span></div>
                    <div style="text-align:center;"><span style="color:#ff9800;">💨 ${p ? p.stats.agility : 0}</span></div>
                    <div style="text-align:center;"><span style="color:#4caf50;">❤️ ${p ? p.stats.hp : 0}</span></div>
                </div>

                <!-- ТРОФЕИ, КОЛЬЦА, АМУЛЕТЫ -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px;">
                    <div style="background:url('assets/interface/bag_cell.jpeg') center/contain no-repeat;background-size:cover;border:2px solid #c9a040;border-radius:8px;padding:8px;text-align:center;cursor:pointer;" onclick="SherwoodUI.showTrophies()">
                        <div style="font-size:1.2em;">🏆</div>
                        <div style="color:#aaa;font-size:0.55em;word-break:break-all;">${trophyDisplay}</div>
                    </div>
                    <div style="background:url('assets/interface/bag_cell.jpeg') center/contain no-repeat;background-size:cover;border:2px solid #ffd700;border-radius:8px;padding:8px;text-align:center;cursor:pointer;" onclick="SherwoodUI.showRingInfo()">
                        <div style="font-size:1.2em;">💍</div>
                        <div style="color:#aaa;font-size:0.55em;word-break:break-all;">${ringDisplay}</div>
                    </div>
                    <div style="background:url('assets/interface/bag_cell.jpeg') center/contain no-repeat;background-size:cover;border:2px solid #9c27b0;border-radius:8px;padding:8px;text-align:center;cursor:pointer;" onclick="SherwoodUI.showAmuletInfo()">
                        <div style="font-size:1.2em;">📿</div>
                        <div style="color:#aaa;font-size:0.55em;word-break:break-all;">${amuletDisplay}</div>
                    </div>
                </div>

                <!-- КНОПКИ: ТРЕНИРОВКА, КУЗНИЦА, БЕСТИАРИЙ -->
                <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;">
                    <button onclick="SherwoodUI.training()" style="background:rgba(255,152,0,0.2);border:1px solid #ff9800;border-radius:8px;padding:12px;color:#fff;cursor:pointer;font-size:0.8em;">
                        💪 Тренировка
                    </button>
                    <button onclick="SherwoodUI.forge()" style="background:rgba(121,85,72,0.2);border:1px solid #795548;border-radius:8px;padding:12px;color:#fff;cursor:pointer;font-size:0.8em;">
                        ⚒️ Кузница
                    </button>
                    <button onclick="SherwoodUI.bestiary()" style="background:rgba(96,125,139,0.2);border:1px solid #607d8b;border-radius:8px;padding:12px;color:#fff;cursor:pointer;font-size:0.8em;">
                        📖 Бестиарий
                    </button>
                </div>

                <div id="profile-info" style="text-align:center;color:#aaa;font-size:0.7em;margin-top:12px;min-height:20px;">Нажми на иконку для информации</div>
            </div>
        `;
    },

    _getLastTrophy() {
        const trophies = Sherwood.getPlayer()?.trophies || [];
        if (trophies.length === 0) return null;
        return trophies[trophies.length - 1].name || 'Трофей';
    },

    showTrophies() {
        const trophies = Sherwood.getPlayer()?.trophies || [];
        const info = document.getElementById('profile-info');
        if (!info) return;
        if (trophies.length === 0) {
            info.innerHTML = '🏆 Трофеев пока нет';
            return;
        }
        info.innerHTML = trophies.map(t => `🏆 ${t.name || 'Трофей'}`).join(' | ');
    },

    showRingInfo() {
        const ring = Sherwood.Bag.getEquipment().ring;
        const info = document.getElementById('profile-info');
        if (!info) return;
        if (!ring) {
            info.innerHTML = '💍 Кольцо не надето';
            return;
        }
        info.innerHTML = `💍 ${ring.name} (Ур.${ring.level || 1}) ${ring.stats ? Object.entries(ring.stats).map(([k,v]) => `${k}+${v}`).join(' ') : ''}`;
    },

    showAmuletInfo() {
        const amulet = Sherwood.Bag.getEquipment().amulet;
        const info = document.getElementById('profile-info');
        if (!info) return;
        if (!amulet) {
            info.innerHTML = '📿 Амулет не надет';
            return;
        }
        info.innerHTML = `📿 ${amulet.name} (Ур.${amulet.level || 1}) ${amulet.stats ? Object.entries(amulet.stats).map(([k,v]) => `${k}+${v}`).join(' ') : ''}`;
    },

    // ============================================================
    //  ТРЕНИРОВКА
    // ============================================================

    training() {
        this._showPlaceholder('💪 Тренировка', 'training.jpeg');
    },

    // ============================================================
    //  КУЗНИЦА
    // ============================================================

    forge() {
        this._showPlaceholder('⚒️ Кузница', 'forge.jpeg');
    },

    // ============================================================
    //  БЕСТИАРИЙ
    // ============================================================

    bestiary() {
        this._showPlaceholder('📖 Бестиарий', 'bestiary.jpeg');
    },

    // ============================================================
    //  НАСТРОЙКИ
    // ============================================================

    settings() {
        this._hideMainInterface();
        this.container.style.background = "url('" + this._bg.settings + "') center/cover no-repeat";
        this._playSound('click');

        this.container.innerHTML = `
            <div style="min-height:100%;background:rgba(0,0,0,0.7);padding:16px;max-width:500px;margin:0 auto;">
                <button onclick="SherwoodUI.loadHome()" style="background:rgba(255,255,255,0.1);border:1px solid #666;color:#fff;padding:6px 14px;border-radius:6px;cursor:pointer;margin-bottom:12px;">← Назад</button>
                <h2 style="color:#e0c080;">⚙️ Настройки</h2>

                <div style="margin-top:20px;">
                    <div style="background:rgba(0,0,0,0.5);border-radius:10px;padding:16px;margin-bottom:12px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <span style="color:#fff;">🔊 Звуки</span>
                            <label style="position:relative;width:50px;height:26px;background:${this._soundEnabled ? '#4caf50' : '#555'};border-radius:13px;cursor:pointer;transition:0.2s;">
                                <input type="checkbox" ${this._soundEnabled ? 'checked' : ''} onchange="SherwoodUI._toggleSound(this.checked)" style="display:none;">
                                <span style="position:absolute;top:2px;left:${this._soundEnabled ? '26px' : '2px'};width:22px;height:22px;background:#fff;border-radius:50%;transition:0.2s;"></span>
                            </label>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <span style="color:#fff;">🎵 Музыка</span>
                            <label style="position:relative;width:50px;height:26px;background:${this._musicEnabled ? '#4caf50' : '#555'};border-radius:13px;cursor:pointer;transition:0.2s;">
                                <input type="checkbox" ${this._musicEnabled ? 'checked' : ''} onchange="SherwoodUI._toggleMusic(this.checked)" style="display:none;">
                                <span style="position:absolute;top:2px;left:${this._musicEnabled ? '26px' : '2px'};width:22px;height:22px;background:#fff;border-radius:50%;transition:0.2s;"></span>
                            </label>
                        </div>
                    </div>

                    <button onclick="SherwoodUI._exitGame()" style="width:100%;background:#f44336;border:none;border-radius:8px;padding:12px;color:#fff;font-weight:bold;font-size:1em;cursor:pointer;margin-top:12px;">
                        🚪 Выйти из игры
                    </button>
                </div>
            </div>
        `;
    },

    _toggleSound(enabled) {
        this._soundEnabled = enabled;
        this._saveAudioSettings();
        if (!enabled) {
            for (const sound of Object.values(this._sounds)) {
                sound.pause();
                sound.currentTime = 0;
            }
        }
        this.settings();
    },

    _toggleMusic(enabled) {
        this._musicEnabled = enabled;
        this._saveAudioSettings();
        if (!enabled) {
            this._stopMusic();
        } else {
            this._playMusic('forest_ambient');
        }
        this.settings();
    },

    _exitGame() {
        if (confirm('Вы уверены, что хотите выйти?')) {
            Sherwood.saveGame();
            window.location.href = 'about:blank';
            this.container.style.display = 'none';
            document.getElementById('app-container').style.display = 'flex';
            this._stopMusic();
        }
    },

    // ============================================================
    //  ПРОЧИЕ РЕЖИМЫ
    // ============================================================

    quest() { this._showPlaceholder('📜 Квесты', 'quest_chapter_1.jpeg'); },
    subway() { this.showDungeon(); },
    raid() { this._showPlaceholder('⚔️ Рейд', 'background_raid.png'); },
    portal() { this._showPlaceholder('🌀 Порталы', 'portal_1.jpeg'); },
    arena() { this._showPlaceholder('🏟️ Арена', 'arena.jpeg'); },
    tavern() { this._showPlaceholder('🍺 Таверна', 'tavern.jpeg'); },
    daily() { this._showPlaceholder('📋 Ежедневные задания', 'tasks.jpeg'); },
    market() { this._showPlaceholder('💰 Рынок', 'market.jpeg'); },

    // ============================================================
    //  ВСПОМОГАТЕЛЬНЫЕ
    // ============================================================

    _hideMainInterface() {
        document.querySelectorAll('.bg-layer, .statue-left, .statue-right, .divider-left, .divider-right, .arch-layer, .hero-frame, .top-panel, .top-actions, .left-buttons, .right-buttons, .bottom-stats')
            .forEach(el => {
                if (el) el.style.display = 'none';
            });
        const placeholder = document.querySelector('.placeholder-screen');
        if (placeholder) placeholder.remove();
    },

    _showPlaceholder(title, bg) {
        this._hideMainInterface();
        this.container.style.background = "url('assets/backgrounds/" + bg + "') center/cover no-repeat";
        this._playSound('click');

        const div = document.createElement('div');
        div.className = 'placeholder-screen';
        div.style.cssText = `
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(0,0,0,0.3);
            color: #e0c080;
            padding: 20px;
            z-index: 100;
        `;
        div.innerHTML = `
            <div style="font-size:3em;margin-bottom:16px;">🏗️</div>
            <div style="font-size:1.2em;margin-bottom:8px;">${title}</div>
            <div style="font-size:0.7em;color:#888;">В разработке</div>
            <button onclick="SherwoodUI.loadHome()" style="margin-top:20px;background:rgba(201,168,76,0.2);border:1px solid rgba(201,168,76,0.3);color:#e0c080;padding:8px 24px;border-radius:20px;cursor:pointer;font-family:'Georgia',serif;font-size:0.8em;">← На главную</button>
        `;
        this.container.appendChild(div);
        console.log('📌 Плейсхолдер:', title);
    }
};

// ============================================================
//  ЗАПУСК
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    SherwoodUI.init();
});

/**
 * Sherwood RPG — UI Controller
 * Полный контроллер интерфейса
 */

const SherwoodUI = {

    // ========================================
    // КОНСТАНТЫ
    // ========================================

    SCREENS: {
        HOME: 'home',
        QUEST: 'quest',
        SUBWAY: 'subway',
        RAID: 'raid',
        PORTAL: 'portal',
        ARENA: 'arena',
        TAVERN: 'tavern',
        DAILY: 'daily',
        TRAINING: 'training',
        FORGE: 'forge',
        BAG: 'bag',
        MARKET: 'market',
        BESTIARY: 'bestiary',
        PROFILE: 'profile',
        SETTINGS: 'settings'
    },

    // ========================================
    // ИНИЦИАЛИЗАЦИЯ
    // ========================================

    init() {
        this.container = document.getElementById('game-container');
        if (!this.container) {
            console.error('❌ Контейнер #game-container не найден!');
            return;
        }
        this.bindButtons();
        this.loadHome();
        console.log('🏹 Sherwood UI инициализирован!');
    },

    // ========================================
    // ПРИВЯЗКА КНОПОК
    // ========================================

    bindButtons() {
        document.querySelectorAll('.btn').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                const action = el.dataset.action;
                if (action && this[action]) {
                    this[action]();
                } else {
                    console.log('🔘 Кнопка:', action || 'без action');
                }
            });
        });
    },

    // ========================================
    // НАВИГАЦИЯ
    // ========================================

    // --- Главный экран ---
    home() {
        this.loadHome();
    },

    // --- Боевые режимы (левая колонка) ---
    quest() {
        console.log('📜 Квесты — в разработке');
        this.showPlaceholder('📜 Квесты');
    },
    subway() {
        console.log('🏚️ Подземка — в разработке');
        this.showPlaceholder('🏚️ Подземка');
    },
    raid() {
        console.log('⚔️ Рейд — в разработке');
        this.showPlaceholder('⚔️ Рейд');
    },
    portal() {
        console.log('🌀 Порталы — в разработке');
        this.showPlaceholder('🌀 Порталы');
    },
    arena() {
        console.log('🏟️ Арена — в разработке');
        this.showPlaceholder('🏟️ Арена');
    },
    tavern() {
        console.log('🍺 Таверна — в разработке');
        this.showPlaceholder('🍺 Таверна');
    },

    // --- Небоевые режимы (правая колонка) ---
    daily() {
        console.log('📋 Ежедневные задания — в разработке');
        this.showPlaceholder('📋 Ежедневные задания');
    },
    training() {
        console.log('💪 Тренировка — в разработке');
        this.showPlaceholder('💪 Тренировка');
    },
    forge() {
        console.log('⚒️ Кузница — в разработке');
        this.showPlaceholder('⚒️ Кузница');
    },
    bag() {
        console.log('🎒 Сумка — в разработке');
        this.showPlaceholder('🎒 Сумка');
    },
    market() {
        console.log('💰 Рынок — в разработке');
        this.showPlaceholder('💰 Рынок');
    },
    bestiary() {
        console.log('📖 Бестиарий — в разработке');
        this.showPlaceholder('📖 Бестиарий');
    },
    profile() {
        console.log('👤 Профиль — в разработке');
        this.showPlaceholder('👤 Профиль');
    },

    // --- Системное ---
    settings() {
        console.log('⚙️ Настройки — в разработке');
        this.showPlaceholder('⚙️ Настройки');
    },

    // ========================================
    // ОТОБРАЖЕНИЕ ЭКРАНОВ
    // ========================================

    loadHome() {
        // Показываем главный экран (он уже есть в HTML)
        // Просто сбрасываем состояния
        document.querySelector('.bg-layer').style.display = 'block';
        document.querySelector('.statue-left').style.display = 'block';
        document.querySelector('.statue-right').style.display = 'block';
        document.querySelector('.divider-left').style.display = 'block';
        document.querySelector('.divider-right').style.display = 'block';
        document.querySelector('.arch-layer').style.display = 'block';
        document.querySelector('.hero-frame').style.display = 'flex';
        document.querySelector('.top-panel').style.display = 'flex';
        document.querySelector('.left-buttons').style.display = 'flex';
        document.querySelector('.right-buttons').style.display = 'flex';
        document.querySelector('.bottom-stats').style.display = 'flex';
        // Убираем placeholder, если он был
        const placeholder = document.querySelector('.placeholder-screen');
        if (placeholder) placeholder.remove();
        console.log('🏠 Главный экран');
    },

    showPlaceholder(title) {
        // Убираем главный экран
        document.querySelector('.bg-layer').style.display = 'none';
        document.querySelector('.statue-left').style.display = 'none';
        document.querySelector('.statue-right').style.display = 'none';
        document.querySelector('.divider-left').style.display = 'none';
        document.querySelector('.divider-right').style.display = 'none';
        document.querySelector('.arch-layer').style.display = 'none';
        document.querySelector('.hero-frame').style.display = 'none';
        document.querySelector('.top-panel').style.display = 'none';
        document.querySelector('.left-buttons').style.display = 'none';
        document.querySelector('.right-buttons').style.display = 'none';
        document.querySelector('.bottom-stats').style.display = 'none';

        // Убираем старый placeholder
        const old = document.querySelector('.placeholder-screen');
        if (old) old.remove();

        // Создаём новый
        const div = document.createElement('div');
        div.className = 'placeholder-screen';
        div.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(10, 10, 15, 0.9);
            z-index: 100;
            color: #e0c080;
            font-family: 'Georgia', serif;
            padding: 20px;
        `;
        div.innerHTML = `
            <div style="font-size: 3em; margin-bottom: 16px;">🏗️</div>
            <div style="font-size: 1.2em; margin-bottom: 8px;">${title}</div>
            <div style="font-size: 0.7em; color: #888;">В разработке</div>
            <button onclick="SherwoodUI.home()" style="
                margin-top: 20px;
                background: rgba(201, 168, 76, 0.2);
                border: 1px solid rgba(201, 168, 76, 0.3);
                color: #e0c080;
                padding: 8px 24px;
                border-radius: 20px;
                cursor: pointer;
                font-family: 'Georgia', serif;
                font-size: 0.8em;
            ">← На главную</button>
        `;
        this.container.appendChild(div);
    }
};

// ========================================
// ЗАПУСК
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    SherwoodUI.init();
});

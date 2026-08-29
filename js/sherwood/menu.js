// js/menu.js — НОВАЯ РАБОЧАЯ ВЕРСИЯ (БЕЗ СТАРОГО UI)
const Menu = {
    buildings: [
        { icon: 'Квесты', name: 'Квесты' },
        { icon: 'Арена', name: 'Арена' },
        { icon: 'Рынок', name: 'Рынок' },
        { icon: 'Таверна', name: 'Таверна' },
        { icon: 'Кузница', name: 'Кузница' },
        { icon: 'Тренировка', name: 'Тренировка' },
        { icon: 'Бестиарий', name: 'Бестиарий' },
        { icon: 'Очаг', name: 'Очаг' },
        { icon: 'Порталы', name: 'Порталы' },
        
        { icon: 'Профиль', name: 'Профиль' },
        { icon: 'Рейд', name: 'Рейд' },
        { icon: 'Подземка', name: 'Подземка' },
        { icon: 'Сумка', name: 'Сумка' },
        { icon: 'Настройки', name: 'Настройки' },
        { icon: 'Таланты', name: 'Таланты' },
        { icon: 'Ежедневные', name: 'Ежедневные' },
        { icon: 'Кошель', name: 'Кошель' },
    ],
    
    currentIndex: 0,
    screen: null,
    iconContainer: null,
    track: null,
    isAnimating: false,
    stepVideo: null,
    stepTimer: null,
    
    init() {
        this.screen = document.getElementById('menuScreen');
        this.screen.style.display = 'block';
        this.screen.innerHTML = '';
        this.screen.style.position = 'relative';
        this.screen.style.overflow = 'hidden';
        
        // Потолок
        const ceiling = document.createElement('div');
        ceiling.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:25%;background:url("assets/assets2/Sherwood_Square/1area_ceiling_moon.png") center/cover no-repeat;z-index:1;';
        this.screen.appendChild(ceiling);
        
       // СЛОЙ 2: Стена
const wall = document.createElement('div');
wall.style.cssText = 'position:absolute;top:25%;left:0;width:100%;height:75%;background:url("assets/Sherwood_Square/wall_area_1.png") center/cover no-repeat;z-index:2;';
this.screen.appendChild(wall);
       
        
        // Иконки
        this.iconContainer = document.createElement('div');
        this.iconContainer.style.cssText = 'position:absolute;top:15%;left:0;width:100%;height:50%;overflow:hidden;z-index:3;';
        this.screen.appendChild(this.iconContainer);
        this.buildCarousel();
        
        // Разделитель верхний
        const topSeam = document.createElement('img');
        topSeam.src = 'assets/assets2/game_details/seam_top.png';
        topSeam.style.cssText = 'position:absolute;top:25%;left:0;width:100%;height:auto;transform:translateY(-50%);z-index:4;pointer-events:none;object-fit:cover;display:block;';
        this.screen.appendChild(topSeam);
        
        
        
        // Анимация
        this.stepVideo = document.createElement('video');
        this.stepVideo.src = 'assets/assets2/animation/step_up.webm';
        this.stepVideo.loop = false;
        this.stepVideo.muted = true;
        this.stepVideo.playsInline = true;
        this.stepVideo.style.cssText = 'position:absolute;bottom:1%;left:50%;transform:translateX(-50%);width:40vw;max-width:240px;z-index:5;pointer-events:none;';
        this.screen.appendChild(this.stepVideo);
        
        // Кнопка домой
        const homeBtn = document.createElement('img');
        homeBtn.src = 'assets/assets2/Sherwood_Square/oak_area.png';
        homeBtn.style.cssText = 'position:absolute;top:2%;left:2%;width:8vw;max-width:80px;cursor:pointer;z-index:6;';
        homeBtn.onclick = () => { if (typeof showHomeScreen === 'function') showHomeScreen(); };
        this.screen.appendChild(homeBtn);
        
        // Стрелки
        const leftArrow = document.createElement('img');
        leftArrow.src = 'assets/assets2/icons/left.png';
        leftArrow.style.cssText = 'position:absolute;left:2%;top:50%;transform:translateY(-50%);width:16vw;max-width:120px;cursor:pointer;z-index:6;';
        leftArrow.onclick = () => this.prev();
        this.screen.appendChild(leftArrow);
        
        const rightArrow = document.createElement('img');
        rightArrow.src = 'assets/assets2/icons/right.png';
        rightArrow.style.cssText = 'position:absolute;right:2%;top:50%;transform:translateY(-50%);width:16vw;max-width:120px;cursor:pointer;z-index:6;';
        rightArrow.onclick = () => this.next();
        this.screen.appendChild(rightArrow);
    },
    
    buildCarousel() {
        this.iconContainer.innerHTML = '';
        
        this.track = document.createElement('div');
        this.track.style.cssText = 'display:flex;width:100%;height:100%;transition:transform 0.4s ease;';
        this.iconContainer.appendChild(this.track);
        
        this.buildings.forEach((building) => {
            const section = document.createElement('div');
            section.style.cssText = 'min-width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;position:relative;';
            
            // Иконка
            const img = new Image();
            img.src = `assets/assets2/icons/${this.getIconFile(building.icon)}`;
            img.style.cssText = 'width:45%;height:auto;max-height:45%;object-fit:contain;pointer-events:none;z-index:2;position:relative;margin-bottom:10px;';
            
            // Панель
            const panel = document.createElement('img');
            panel.src = 'assets/assets2/icons/all_stat.png';
            panel.style.cssText = 'width:80%;height:50px;object-fit:contain;pointer-events:none;z-index:1;position:relative;';
            
            // Подпись (на панели)
            const label = document.createElement('div');
            label.textContent = building.name;
            label.style.cssText = 'position:absolute;bottom:28%;left:50%;transform:translateX(-50%);width:60%;text-align:center;color:#ffa500;font-size:0.85em;font-weight:bold;pointer-events:none;text-shadow:0 1px 3px #000;z-index:1;';
            
            section.appendChild(img);
            section.appendChild(panel);
            section.appendChild(label);
            section.onclick = () => this.interact(building);
            
            this.track.appendChild(section);
        });
        
        this.updatePosition(false);
    },
    
    getIconFile(icon) {
        const map = {
            'Квесты': 'quest.png',
            'Арена': 'arena.png',
            'Рынок': 'sherwood_market.png',
            'Таверна': 'tavern.png',
            'Кузница': 'forge.png',
            'Тренировка': 'training.png',
            'Бестиарий': 'bestiary.png',
            'Очаг': 'button_hearth.png',
            'Порталы': 'portal.png',
            'Чат': 'chat_button.png',
            'Профиль': 'player_profile.png',
            'Рейд': 'raid.png',
            'Подземка': 'subway.png',
            'Сумка': 'hero_bag.png',
            'Настройки': 'settings.png',
            'Таланты': 'ranger_skills_button.png',
            'Ежедневные': 'daily_quests.png',
            'Кошель': 'wallet.png',
        };
        return map[icon] || 'arena.png';
    },
    
    updatePosition(animate = true) {
        const offset = -this.currentIndex * 100;
        this.track.style.transition = animate ? 'transform 0.4s ease' : 'none';
        this.track.style.transform = `translateX(${offset}%)`;
    },
    
    next() {
        if (this.isAnimating) return;
        this.currentIndex = (this.currentIndex + 1) % this.buildings.length;
        this.updatePosition();
        this.playStepAnimation();
    },
    
    prev() {
        if (this.isAnimating) return;
        this.currentIndex = (this.currentIndex - 1 + this.buildings.length) % this.buildings.length;
        this.updatePosition();
        this.playStepAnimation();
    },
    
    playStepAnimation() {
        if (this.stepVideo) {
            this.isAnimating = true;
            this.stepVideo.currentTime = 0;
            this.stepVideo.play().catch(() => {});
            
            clearTimeout(this.stepTimer);
            this.stepTimer = setTimeout(() => {
                this.stepVideo.pause();
                this.isAnimating = false;
            }, 400);
        }
    },
    
    interact(building) {
        if (building.icon === 'Подземка') {
            if (typeof showDungeonScreen === 'function') showDungeonScreen();
        } 
        else if (building.icon === 'Квесты') {
            // Создаём экран квестов
            const screenHTML = `
            <div id="quests-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/quest.png') center/cover no-repeat;display:flex;flex-direction:column;">
                <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.5);">
                    <button onclick="closeQuestsScreen()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                        <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
                    </button>
                    <span style="color:#e0c080;font-size:1.2em;">Квесты</span>
                </div>
                <div style="flex:1;overflow-y:auto;padding:20px;" id="quests-content"></div>
            </div>`;
            
            document.body.insertAdjacentHTML('beforeend', screenHTML);
            
            // Запускаем модуль квестов
            if (typeof Sherwood !== 'undefined' && Sherwood.Quests) {
                Sherwood.Quests.init();
            }
        } 
        else {
            if (typeof showSectionScreen === 'function') showSectionScreen(building);
        }
    },
    
    destroy() {
        if (this.screen) this.screen.style.display = 'none';
        clearTimeout(this.stepTimer);
        if (this.stepVideo) this.stepVideo.pause();
    }
};

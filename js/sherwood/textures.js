// js/textures.js
const Textures = {
    floor: null,
    ceiling: null,
    wall: null,
    oak: null,
    buildings: {},
    seamBottom: null,
    seamTop: null,
    
    loaded: false,
    totalTextures: 0,
    loadedTextures: 0,
    
    load(callback) {
        if (this.loaded) {
            if (callback) callback();
            return;
        }
        
        // Стена
        this.loadImage('assets/assets2/Sherwood_Square/wall_area_1.png', (img) => {
            this.wall = img;
            this.checkLoaded(callback);
        });
        
        // Пол
        this.loadImage('assets/assets2/Sherwood_Square/floor1.png', (img) => {
            this.floor = img;
            this.checkLoaded(callback);
        });
        
        // Потолок
        this.loadImage('assets/assets2/Sherwood_Square/1area_ceiling_moon.png', (img) => {
            this.ceiling = img;
            this.checkLoaded(callback);
        });
        
        // Дуб
        this.loadImage('assets/assets2/Sherwood_Square/oak_area.png', (img) => {
            this.oak = img;
            this.checkLoaded(callback);
        });
        
        // Швы
        this.loadImage('assets/assets2/game_details/seam_bottom.png', (img) => {
            this.seamBottom = img;
            this.checkLoaded(callback);
        });
        
        this.loadImage('assets/assets2/game_details/seam_top.png', (img) => {
            this.seamTop = img;
            this.checkLoaded(callback);
        });
        
        // Слоты
        this.loadImage('assets/assets2/game_details/bag_cell.png', (img) => {
            this.buildings['bag_cell'] = img;
            this.checkLoaded(callback);
        });
        
        this.loadImage('assets/assets2/game_details/2wallet_cell.png', (img) => {
            this.buildings['wallet_cell'] = img;
            this.checkLoaded(callback);
        });
        
        // Иконки
        const buildingIcons = {
            'Чат': 'chat_button.png',
            'Профиль': 'player_profile.png',
            'Арена': 'arena.png',
            'Порталы': 'portal.png',
            'Таверна': 'tavern.png',
            'Подземка': 'subway.png',
            'Кузница': 'forge.png',
            'Тренировка': 'training.png',
            'Бестиарий': 'bestiary.png',
            'Очаг': 'button_hearth.png',
            'Рынок': 'sherwood_market.png',
            'Трофейный зал': 'hero_bag.png',
            'Квесты': 'quest.png',
            'Рейд': 'raid.png',
            'all_stat': 'all_stat.png',
            'Сумка': 'hero_bag.png',
            'Настройки': 'settings.png',
            'Таланты': 'ranger_skills_button.png',
            'Ежедневные': 'daily_quests.png',
            'Кошель': 'wallet.png',
            'Кузница_icon': 'forge.png',
        };
        
        this.totalTextures = 1 + 1 + 1 + 1 + 2 + 2 + Object.keys(buildingIcons).length;
        
        for (const [name, file] of Object.entries(buildingIcons)) {
            this.loadImage(`assets/assets2/icons/${file}`, (img) => {
                this.buildings[name] = img;
                this.checkLoaded(callback);
            });
        }
    },
    
    loadImage(src, callback) {
        const img = new Image();
        img.onload = () => callback(img);
        img.onerror = () => {
            console.warn('Не удалось загрузить:', src);
            callback(null);
        };
        img.src = src;
    },
    
    checkLoaded(callback) {
        this.loadedTextures++;
        
        if (this.loadedTextures >= this.totalTextures) {
            this.loaded = true;
            console.log('Все текстуры загружены!');
            if (callback) callback();
        }
    }
};

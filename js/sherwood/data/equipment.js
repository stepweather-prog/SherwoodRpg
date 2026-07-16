/**
 * Sherwood Equipment Database
 * Все предметы экипировки
 */

Sherwood.EquipmentDB = {
    grades: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    
    // Множители статов по редкости
    gradeMultipliers: {
        common: 1.0,
        uncommon: 1.4,
        rare: 1.9,
        epic: 2.6,
        legendary: 3.5
    },
    
    items: [
        // ===== ГОЛОВА =====
        {
            id: 'cloth_hood',
            part: 'head',
            grade: 'common',
            name: 'Тканый капюшон',
            nameFemale: 'Тканый капюшон',
            stats: { defense: 2 },
            price: { gold: 10 },
            description: 'Простой капюшон из грубой ткани.'
        },
        {
            id: 'leather_hood',
            part: 'head',
            grade: 'uncommon',
            name: 'Кожаный капюшон',
            nameFemale: 'Кожаный капюшон',
            stats: { defense: 3, agility: 1 },
            price: { gold: 30 },
            description: 'Капюшон из дублёной кожи.'
        },
        {
            id: 'ranger_hood',
            part: 'head',
            grade: 'rare',
            name: 'Капюшон следопыта',
            nameFemale: 'Капюшон следопыта',
            stats: { defense: 5, agility: 3 },
            price: { gold: 80 },
            description: 'Капюшон, позволяющий сливаться с лесом.'
        },
        {
            id: 'invisibility_cloak',
            part: 'head',
            grade: 'epic',
            name: 'Плащ-невидимка',
            nameFemale: 'Плащ-невидимка',
            stats: { defense: 8, agility: 5, dodgeChance: 5 },
            price: { gold: 250 },
            description: 'Легендарный плащ, скрывающий от глаз врагов.'
        },
        {
            id: 'sherwood_crown',
            part: 'head',
            grade: 'legendary',
            name: 'Корона Шервуда',
            nameFemale: 'Корона Шервуда',
            stats: { defense: 12, agility: 8, critChance: 5 },
            price: { gold: 1000 },
            description: 'Корона короля разбойников.'
        },
        
        // ===== ПЛЕЧИ =====
        {
            id: 'cloth_mantle',
            part: 'shoulders',
            grade: 'common',
            name: 'Тканая мантия',
            nameFemale: 'Тканая мантия',
            stats: { defense: 1, hp: 10 },
            price: { gold: 8 },
            description: 'Лёгкая мантия из ткани.'
        },
        {
            id: 'leather_pauldrons',
            part: 'shoulders',
            grade: 'uncommon',
            name: 'Кожаные наплечники',
            nameFemale: 'Кожаные наплечники',
            stats: { defense: 3, hp: 15 },
            price: { gold: 25 },
            description: 'Наплечники из дублёной кожи.'
        },
        {
            id: 'wolf_fur_mantle',
            part: 'shoulders',
            grade: 'rare',
            name: 'Волчья мантия',
            nameFemale: 'Волчья мантия',
            stats: { defense: 5, hp: 25, agility: 2 },
            price: { gold: 70 },
            description: 'Мантия из шкуры лесного волка.'
        },
        {
            id: 'dragon_shoulders',
            part: 'shoulders',
            grade: 'epic',
            name: 'Драконьи наплечники',
            nameFemale: 'Драконьи наплечники',
            stats: { defense: 8, hp: 40, attack: 3 },
            price: { gold: 200 },
            description: 'Наплечники из драконьей чешуи.'
        },
        
        // ===== ТОРС =====
        {
            id: 'cloth_armor',
            part: 'torso',
            grade: 'common',
            name: 'Стёганая броня',
            nameFemale: 'Стёганая броня',
            stats: { defense: 3, hp: 15 },
            price: { gold: 15 },
            description: 'Простая стёганая броня.'
        },
        {
            id: 'leather_armor',
            part: 'torso',
            grade: 'uncommon',
            name: 'Кожаная броня',
            nameFemale: 'Кожаная броня',
            stats: { defense: 5, hp: 20 },
            price: { gold: 40 },
            description: 'Броня из дублёной кожи.'
        },
        {
            id: 'chainmail',
            part: 'torso',
            grade: 'rare',
            name: 'Кольчуга',
            nameFemale: 'Кольчуга',
            stats: { defense: 8, hp: 35 },
            price: { gold: 100 },
            description: 'Кольчуга крестоносца.'
        },
        {
            id: 'robin_armor',
            part: 'torso',
            grade: 'epic',
            name: 'Броня Робина',
            nameFemale: 'Броня Робина',
            stats: { defense: 12, hp: 50, agility: 5 },
            price: { gold: 300 },
            description: 'Броня легендарного разбойника.'
        },
        {
            id: 'sherwood_armor',
            part: 'torso',
            grade: 'legendary',
            name: 'Доспех Шервуда',
            nameFemale: 'Доспех Шервуда',
            stats: { defense: 18, hp: 80, agility: 8 },
            price: { gold: 1200 },
            description: 'Лучший доспех во всём Шервудском лесу.'
        },
        
        // ===== РУКИ =====
        {
            id: 'cloth_gloves',
            part: 'hands',
            grade: 'common',
            name: 'Тканые перчатки',
            nameFemale: 'Тканые перчатки',
            stats: { attack: 1, agility: 1 },
            price: { gold: 8 },
            description: 'Простые тканые перчатки.'
        },
        {
            id: 'archer_gloves',
            part: 'hands',
            grade: 'uncommon',
            name: 'Перчатки лучника',
            nameFemale: 'Перчатки лучника',
            stats: { attack: 3, agility: 2 },
            price: { gold: 25 },
            description: 'Перчатки для стрельбы из лука.'
        },
        {
            id: 'marksman_gloves',
            part: 'hands',
            grade: 'rare',
            name: 'Перчатки снайпера',
            nameFemale: 'Перчатки снайпера',
            stats: { attack: 5, agility: 4, critChance: 3 },
            price: { gold: 80 },
            description: 'Перчатки мастера-лучника.'
        },
        {
            id: 'shadow_gloves',
            part: 'hands',
            grade: 'epic',
            name: 'Теневые перчатки',
            nameFemale: 'Теневые перчатки',
            stats: { attack: 8, agility: 6, critChance: 5 },
            price: { gold: 250 },
            description: 'Перчатки из мира теней.'
        },
        
        // ===== НОГИ =====
        {
            id: 'cloth_pants',
            part: 'legs',
            grade: 'common',
            name: 'Тканые штаны',
            nameFemale: 'Тканые штаны',
            stats: { defense: 1, hp: 10 },
            price: { gold: 8 },
            description: 'Простые штаны из ткани.'
        },
        {
            id: 'leather_pants',
            part: 'legs',
            grade: 'uncommon',
            name: 'Кожаные штаны',
            nameFemale: 'Кожаные штаны',
            stats: { defense: 3, hp: 15 },
            price: { gold: 25 },
            description: 'Штаны из дублёной кожи.'
        },
        {
            id: 'ranger_pants',
            part: 'legs',
            grade: 'rare',
            name: 'Штаны следопыта',
            nameFemale: 'Штаны следопыта',
            stats: { defense: 5, hp: 25, agility: 3 },
            price: { gold: 75 },
            description: 'Удобные штаны для долгих переходов.'
        },
        
        // ===== СТУПНИ =====
        {
            id: 'cloth_boots',
            part: 'feet',
            grade: 'common',
            name: 'Тканые сапоги',
            nameFemale: 'Тканые сапоги',
            stats: { agility: 1, hp: 5 },
            price: { gold: 8 },
            description: 'Простые сапоги.'
        },
        {
            id: 'leather_boots',
            part: 'feet',
            grade: 'uncommon',
            name: 'Кожаные сапоги',
            nameFemale: 'Кожаные сапоги',
            stats: { agility: 2, hp: 10 },
            price: { gold: 25 },
            description: 'Сапоги из дублёной кожи.'
        },
        {
            id: 'scout_boots',
            part: 'feet',
            grade: 'rare',
            name: 'Сапоги разведчика',
            nameFemale: 'Сапоги разведчика',
            stats: { agility: 4, hp: 15, dodgeChance: 3 },
            price: { gold: 80 },
            description: 'Бесшумные сапоги для скрытного передвижения.'
        },
        
        // ===== ОРУЖИЕ 1 (ЛУК) =====
        {
            id: 'yew_bow',
            part: 'weapon1',
            grade: 'common',
            name: 'Тисовый лук',
            nameFemale: 'Тисовый лук',
            stats: { attack: 5 },
            price: { gold: 15 },
            description: 'Простой лук из тиса.'
        },
        {
            id: 'longbow',
            part: 'weapon1',
            grade: 'uncommon',
            name: 'Длинный лук',
            nameFemale: 'Длинный лук',
            stats: { attack: 8, agility: 1 },
            price: { gold: 45 },
            description: 'Мощный длинный лук.'
        },
        {
            id: 'elven_bow',
            part: 'weapon1',
            grade: 'rare',
            name: 'Эльфийский лук',
            nameFemale: 'Эльфийский лук',
            stats: { attack: 12, agility: 3, critChance: 5 },
            price: { gold: 120 },
            description: 'Изящный лук эльфийской работы.'
        },
        {
            id: 'sherwood_bow',
            part: 'weapon1',
            grade: 'epic',
            name: 'Лук Шервуда',
            nameFemale: 'Лук Шервуда',
            stats: { attack: 18, agility: 6, critChance: 10 },
            price: { gold: 350 },
            description: 'Легендарный лук Робин Гуда.'
        },
        {
            id: 'dragon_bow',
            part: 'weapon1',
            grade: 'legendary',
            name: 'Драконий лук',
            nameFemale: 'Драконий лук',
            stats: { attack: 25, agility: 8, critChance: 15 },
            price: { gold: 1500 },
            description: 'Лук, вырезанный из кости древнего дракона.'
        },
        
        // ===== ОРУЖИЕ 2 (КИНЖАЛ/МЕЧ) =====
        {
            id: 'rusty_dagger',
            part: 'weapon2',
            grade: 'common',
            name: 'Ржавый кинжал',
            nameFemale: 'Ржавый кинжал',
            stats: { attack: 3, agility: 1 },
            price: { gold: 10 },
            description: 'Старый ржавый кинжал.'
        },
        {
            id: 'hunting_knife',
            part: 'weapon2',
            grade: 'uncommon',
            name: 'Охотничий нож',
            nameFemale: 'Охотничий нож',
            stats: { attack: 5, agility: 2 },
            price: { gold: 30 },
            description: 'Надёжный охотничий нож.'
        },
        {
            id: 'assassin_dagger',
            part: 'weapon2',
            grade: 'rare',
            name: 'Кинжал ассасина',
            nameFemale: 'Кинжал ассасина',
            stats: { attack: 8, agility: 4, critChance: 5 },
            price: { gold: 90 },
            description: 'Смертоносный кинжал.'
        },
        {
            id: 'sword',
            part: 'weapon2',
            grade: 'epic',
            name: 'Меч-полуторник',
            nameFemale: 'Меч-полуторник',
            stats: { attack: 14, defense: 3, critChance: 8 },
            price: { gold: 280 },
            description: 'Универсальный меч для ближнего боя.'
        }
    ],
    
    // Поиск предмета по ID
    findById(id) {
        return this.items.find(item => item.id === id) || null;
    },
    
    // Поиск предметов по части тела
    findByPart(part) {
        return this.items.filter(item => item.part === part);
    },
    
    // Поиск предметов по редкости
    findByGrade(grade) {
        return this.items.filter(item => item.grade === grade);
    }
};

/**
 * Sherwood Bestiary
 * Все монстры игры с характеристиками
 */

Sherwood.Monsters = {
    // ===== ЛЕСНЫЕ ТВАРИ =====
    
    forest_spider: {
        id: 'forest_spider',
        name: 'Лесной паук',
        nameGenitive: 'Лесного паука',
        location: 'forest',
        icon: '🕷️',
        stats: { attack: 6, defense: 2, hp: 30 },
        reward: { gold: 3, silver: 20, exp: 10 },
        bestiaryBonus: {
            kills: 10,
            stats: { attack: 1 },
            reward: { gold: 50 }
        },
        description: 'Мелкие, но ядовитые пауки, плетущие сети в чаще.'
    },
    
    swamp_ghoul: {
        id: 'swamp_ghoul',
        name: 'Болотный упырь',
        nameGenitive: 'Болотного упыря',
        location: 'swamp',
        icon: '🧟',
        stats: { attack: 8, defense: 3, hp: 40 },
        reward: { gold: 5, silver: 30, exp: 15 },
        bestiaryBonus: {
            kills: 15,
            stats: { defense: 1 },
            reward: { gold: 75 }
        },
        description: 'Восставшие из болотной трясины мертвецы.'
    },
    
    dire_wolf: {
        id: 'dire_wolf',
        name: 'Гнилой волк',
        nameGenitive: 'Гнилого волка',
        location: 'deep_forest',
        icon: '🐺',
        stats: { attack: 12, defense: 5, hp: 55 },
        reward: { gold: 8, silver: 45, exp: 25 },
        bestiaryBonus: {
            kills: 20,
            stats: { attack: 2 },
            reward: { gold: 100 }
        },
        description: 'Огромные волки с гниющей шерстью и светящимися глазами.'
    },
    
    cave_troll: {
        id: 'cave_troll',
        name: 'Пещерный тролль',
        nameGenitive: 'Пещерного тролля',
        location: 'cave',
        icon: '👹',
        stats: { attack: 18, defense: 12, hp: 120 },
        reward: { gold: 20, silver: 100, exp: 50 },
        bestiaryBonus: {
            kills: 30,
            stats: { hp: 20 },
            reward: { gold: 200 }
        },
        description: 'Громадные создания, обитающие в глубинах пещер.'
    },
    
    // ===== МАГИЧЕСКИЕ СУЩЕСТВА =====
    
    evil_fairy: {
        id: 'evil_fairy',
        name: 'Злая фея',
        nameGenitive: 'Злой феи',
        location: 'magic_glade',
        icon: '🧚',
        stats: { attack: 15, defense: 8, hp: 70 },
        reward: { gold: 12, silver: 60, exp: 30 },
        bestiaryBonus: {
            kills: 25,
            stats: { agility: 2 },
            reward: { gold: 150 }
        },
        description: 'Коварные феи, заманивающие путников в ловушки.'
    },
    
    leshy: {
        id: 'leshy',
        name: 'Леший-путаник',
        nameGenitive: 'Лешего-путаника',
        location: 'deep_forest',
        icon: '🌿',
        stats: { attack: 14, defense: 10, hp: 90 },
        reward: { gold: 15, silver: 80, exp: 35 },
        bestiaryBonus: {
            kills: 20,
            stats: { dodgeChance: 2 },
            reward: { gold: 120 }
        },
        description: 'Духи леса, сбивающие с пути и путающие следы.'
    },
    
    swamp_kikimora: {
        id: 'swamp_kikimora',
        name: 'Болотная кикимора',
        nameGenitive: 'Болотной кикиморы',
        location: 'swamp',
        icon: '👻',
        stats: { attack: 13, defense: 7, hp: 75 },
        reward: { gold: 10, silver: 55, exp: 28 },
        bestiaryBonus: {
            kills: 18,
            stats: { critChance: 1 },
            reward: { gold: 90 }
        },
        description: 'Зловредные духи болот, насылающие кошмары.'
    },
    
    // ===== ЛЮДИ =====
    
    guard: {
        id: 'guard',
        name: 'Стражник шерифа',
        nameGenitive: 'Стражника шерифа',
        location: 'roads',
        icon: '🛡️',
        stats: { attack: 10, defense: 8, hp: 60 },
        reward: { gold: 8, silver: 40, exp: 20 },
        bestiaryBonus: {
            kills: 15,
            stats: { defense: 2 },
            reward: { gold: 80 }
        },
        description: 'Воины на службе у Ноттингемского шерифа.'
    },
    
    mercenary: {
        id: 'mercenary',
        name: 'Наёмник',
        nameGenitive: 'Наёмника',
        location: 'roads',
        icon: '⚔️',
        stats: { attack: 16, defense: 10, hp: 85 },
        reward: { gold: 15, silver: 70, exp: 35 },
        bestiaryBonus: {
            kills: 20,
            stats: { attack: 2 },
            reward: { gold: 100 }
        },
        description: 'Опытные воины, продающие свой меч за золото.'
    },
    
    knight_commander: {
        id: 'knight_commander',
        name: 'Рыцарь-командор',
        nameGenitive: 'Рыцаря-командора',
        location: 'castle',
        icon: '👑',
        stats: { attack: 22, defense: 18, hp: 200 },
        reward: { gold: 40, silver: 200, exp: 80 },
        bestiaryBonus: {
            kills: 10,
            stats: { attack: 3, defense: 3 },
            reward: { gold: 300 }
        },
        description: 'Элитные рыцари в тяжёлых доспехах.'
    },
    
    // ===== БОССЫ =====
    
    sheriff_nottingham: {
        id: 'sheriff_nottingham',
        name: 'Шериф Ноттингемский',
        nameGenitive: 'Шерифа Ноттингемского',
        isBoss: true,
        location: 'castle',
        icon: '🎯',
        stats: { attack: 30, defense: 22, hp: 500 },
        reward: { gold: 200, silver: 1000, exp: 300 },
        bestiaryBonus: null, // Боссы не дают бонусов бестиария
        description: 'Главный враг всех вольных стрелков Шервудского леса.'
    },
    
    black_knight: {
        id: 'black_knight',
        name: 'Чёрный рыцарь',
        nameGenitive: 'Чёрного рыцаря',
        isBoss: true,
        location: 'castle',
        icon: '⚫',
        stats: { attack: 35, defense: 28, hp: 650 },
        reward: { gold: 300, silver: 1500, exp: 500 },
        bestiaryBonus: null,
        description: 'Таинственный рыцарь в чёрных доспехах, не знающий пощады.'
    },
    
    ancient_ent: {
        id: 'ancient_ent',
        name: 'Древний энт',
        nameGenitive: 'Древнего энта',
        isBoss: true,
        location: 'deep_forest',
        icon: '🌳',
        stats: { attack: 28, defense: 35, hp: 800 },
        reward: { gold: 250, silver: 1200, exp: 400 },
        bestiaryBonus: null,
        description: 'Пробудившееся древнее дерево, хранитель леса.'
    }
};

// Группировка по локациям
Sherwood.MonsterLocations = {
    forest: ['forest_spider'],
    swamp: ['swamp_ghoul', 'swamp_kikimora'],
    deep_forest: ['dire_wolf', 'leshy', 'ancient_ent'],
    cave: ['cave_troll'],
    magic_glade: ['evil_fairy'],
    roads: ['guard', 'mercenary'],
    castle: ['knight_commander', 'sheriff_nottingham', 'black_knight']
};

/**
 * Sherwood Game Models
 * Модели данных и константы
 */

Sherwood.Models = {
    // Типы предметов
    EquipmentPart: {
        HEAD: 'head',
        SHOULDERS: 'shoulders',
        TORSO: 'torso',
        HANDS: 'hands',
        LEGS: 'legs',
        FEET: 'feet',
        WEAPON_1: 'weapon1',
        WEAPON_2: 'weapon2'
    },
    
    // Редкость предметов
    ItemGrade: {
        COMMON: 'common',
        UNCOMMON: 'uncommon',
        RARE: 'rare',
        EPIC: 'epic',
        LEGENDARY: 'legendary'
    },
    
    // Цвета для редкости
    GradeColors: {
        common: '#9d9d9d',
        uncommon: '#1eff00',
        rare: '#0070dd',
        epic: '#a335ee',
        legendary: '#ff8000'
    },
    
    // Типы ресурсов
    ResourceType: {
        GOLD: 'gold',
        SILVER: 'silver',
        TROPHIES: 'trophies'
    },
    
    // Состояния игры
    GameScreen: {
        MAIN_MENU: 'main_menu',
        PROFILE: 'profile',
        EQUIPMENT: 'equipment',
        QUESTS: 'quests',
        DUNGEON: 'dungeon',
        ARENA: 'arena',
        RAID: 'raid',
        TAVERN: 'tavern',
        PORTAL: 'portal',
        BLACK_MARKET: 'black_market',
        BESTIARY: 'bestiary',
        EVENTS: 'events',
        BATTLE: 'battle'
    },
    
    // Типы действий (как ActionType в оригинале)
    ActionType: {
        // Игрок
        PLAYER_LEVEL_UP: 'PLAYER_LEVEL_UP',
        EXP_ADDED: 'EXP_ADDED',
        RESOURCE_CHANGED: 'RESOURCE_CHANGED',
        
        // Экипировка
        ITEM_EQUIPPED: 'ITEM_EQUIPPED',
        ITEM_UNEQUIPPED: 'ITEM_UNEQUIPPED',
        ITEM_ACQUIRED: 'ITEM_ACQUIRED',
        ITEM_SOLD: 'ITEM_SOLD',
        
        // Бестиарий
        BESTIARY_UPDATED: 'BESTIARY_UPDATED',
        BESTIARY_BONUS_UNLOCKED: 'BESTIARY_BONUS_UNLOCKED',
        
        // Бой
        BATTLE_START: 'BATTLE_START',
        BATTLE_ATTACK: 'BATTLE_ATTACK',
        BATTLE_SKILL: 'BATTLE_SKILL',
        BATTLE_ENEMY_ATTACK: 'BATTLE_ENEMY_ATTACK',
        BATTLE_VICTORY: 'BATTLE_VICTORY',
        BATTLE_DEFEAT: 'BATTLE_DEFEAT',
        BATTLE_END: 'BATTLE_END',
        
        // Интерфейс
        SCREEN_CHANGED: 'SCREEN_CHANGED',
        GAME_INITIALIZED: 'GAME_INITIALIZED',
        GAME_RESET: 'GAME_RESET'
    }
};

// Экспортируем для удобства
Sherwood.ActionType = Sherwood.Models.ActionType;
Sherwood.GameScreen = Sherwood.Models.GameScreen;
Sherwood.EquipmentPart = Sherwood.Models.EquipmentPart;
Sherwood.ItemGrade = Sherwood.Models.ItemGrade;

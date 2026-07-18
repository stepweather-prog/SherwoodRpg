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
        WEAPON_2: 'weapon2',
        BELT: 'belt',
        AMULET: 'amulet',
        RING: 'ring'
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
    },

    // ==========================================================
    // СИСТЕМА ЧАЩОБЫ (Age of Revenge 2 стиль)
    // ==========================================================

    // Типы клеток в данже
    DungeonTileType: {
        WALL: 'wall',
        FLOOR: 'floor',
        START: 'start',
        EXIT: 'exit',
        ENEMY: 'enemy',
        CHEST: 'chest',
        TRAP: 'trap',
        HEAL: 'heal'
    },

    // Сложность данжа
    DungeonDifficulty: {
        EASY: 'easy',
        NORMAL: 'normal',
        HARD: 'hard'
    },

    // Статус данжа
    DungeonStatus: {
        ACTIVE: 'active',
        COMPLETED: 'completed',
        ABANDONED: 'abandoned',
        FAILED: 'failed'
    },

    // Настройки данжа по сложности
    DungeonConfig: {
        easy: {
            enemyCount: 4,
            chestCount: 2,
            roomCount: 3,
            monsterTier: 0,
            trapCount: 1,
            healCount: 2
        },
        normal: {
            enemyCount: 6,
            chestCount: 3,
            roomCount: 4,
            monsterTier: 1,
            trapCount: 2,
            healCount: 2
        },
        hard: {
            enemyCount: 8,
            chestCount: 4,
            roomCount: 5,
            monsterTier: 2,
            trapCount: 3,
            healCount: 1
        }
    },

    // Радиус видимости в данже
    DUNGEON_VISIBILITY_RADIUS: 2,

    // ==========================================================
    // БОЕВАЯ СИСТЕМА
    // ==========================================================

    // Типы навыков
    SkillType: {
        POWER_SHOT: 'power_shot',
        TRIPLE_SHOT: 'triple_shot',
        POISON_ARROW: 'poison_arrow',
        STUNNING_SHOT: 'stunning_shot'
    },

    // Конфиг навыков
    SkillConfig: {
        power_shot: {
            name: 'Мощный выстрел',
            damageMultiplier: 1.8,
            cooldown: 3,
            cost: 0,
            description: 'Наносит 180% урона'
        },
        triple_shot: {
            name: 'Тройной выстрел',
            damageMultiplier: 0.7,
            cooldown: 4,
            cost: 0,
            description: '3 выстрела по 70% урона'
        },
        poison_arrow: {
            name: 'Отравленная стрела',
            damageMultiplier: 1.0,
            cooldown: 5,
            cost: 0,
            description: 'Отравляет врага на 3 хода'
        },
        stunning_shot: {
            name: 'Оглушающий выстрел',
            damageMultiplier: 0.5,
            cooldown: 6,
            cost: 0,
            description: 'Оглушает врага на 1 ход'
        }
    },

    // ==========================================================
    // СИСТЕМА КВЕСТОВ
    // ==========================================================

    // Типы заданий
    QuestTaskType: {
        KILL_MONSTERS: 'kill_monsters',
        COLLECT_ITEMS: 'collect_items',
        EXPLORE_DUNGEON: 'explore_dungeon',
        OPEN_CHESTS: 'open_chests',
        WIN_BATTLES: 'win_battles'
    }
};

// ==========================================================
// ЭКСПОРТ ДЛЯ УДОБСТВА
// ==========================================================

Sherwood.ActionType = Sherwood.Models.ActionType;
Sherwood.GameScreen = Sherwood.Models.GameScreen;
Sherwood.EquipmentPart = Sherwood.Models.EquipmentPart;
Sherwood.ItemGrade = Sherwood.Models.ItemGrade;
Sherwood.GradeColors = Sherwood.Models.GradeColors;
Sherwood.ResourceType = Sherwood.Models.ResourceType;

// Система чащобы
Sherwood.DungeonTileType = Sherwood.Models.DungeonTileType;
Sherwood.DungeonDifficulty = Sherwood.Models.DungeonDifficulty;
Sherwood.DungeonStatus = Sherwood.Models.DungeonStatus;
Sherwood.DungeonConfig = Sherwood.Models.DungeonConfig;
Sherwood.DUNGEON_VISIBILITY_RADIUS = Sherwood.Models.DUNGEON_VISIBILITY_RADIUS;

// Боевая система
Sherwood.SkillType = Sherwood.Models.SkillType;
Sherwood.SkillConfig = Sherwood.Models.SkillConfig;

// Система квестов
Sherwood.QuestTaskType = Sherwood.Models.QuestTaskType;

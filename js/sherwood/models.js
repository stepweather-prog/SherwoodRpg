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
        TROPHIES: 'trophies',
        WOOD: 'wood',
        SCRAPS: 'scraps',
        FEATHERS: 'feathers'
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
        BATTLE: 'battle',
        BAG: 'bag',
        SETTINGS: 'settings',
        TRAINING: 'training',
        FORGE: 'forge'
    },
    
    // Типы действий
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
        ITEM_DISMANTLED: 'ITEM_DISMANTLED',
        
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
        GAME_RESET: 'GAME_RESET',
        
        // Сумка
        BAG_FULL: 'BAG_FULL',
        LOOT_ACQUIRED: 'LOOT_ACQUIRED',
        
        // Подземка
        DUNGEON_ERROR: 'DUNGEON_ERROR',
        DUNGEON_CHEST_OPENED: 'DUNGEON_CHEST_OPENED'
    },

    // ============================================================
    //  СИСТЕМА ЧАЩОБЫ
    // ============================================================

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

    // ============================================================
    //  БОЕВАЯ СИСТЕМА
    // ============================================================

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
            id: 'power_shot',
            name: 'Мощный выстрел',
            damageMultiplier: 1.8,
            cooldown: 3,
            cost: 0,
            description: 'Наносит 180% урона',
            icon: 'assets/skills/skill_critical_shot.gif'
        },
        triple_shot: {
            id: 'triple_shot',
            name: 'Тройной выстрел',
            damageMultiplier: 0.7,
            cooldown: 4,
            cost: 0,
            description: '3 выстрела по 70% урона',
            icon: 'assets/skills/triple_shot_skill.png'
        },
        poison_arrow: {
            id: 'poison_arrow',
            name: 'Отравленная стрела',
            damageMultiplier: 1.0,
            cooldown: 5,
            cost: 0,
            description: 'Отравляет врага на 3 хода',
            icon: 'assets/skills/poison_shot_skill.gif'
        },
        stunning_shot: {
            id: 'stunning_shot',
            name: 'Оглушающий выстрел',
            damageMultiplier: 0.5,
            cooldown: 6,
            cost: 0,
            description: 'Оглушает врага на 1 ход',
            icon: 'assets/skills/control_skill.png'
        }
    },

    // ============================================================
    //  СИСТЕМА КВЕСТОВ
    // ============================================================

    // Типы заданий
    QuestTaskType: {
        KILL_MONSTERS: 'kill_monsters',
        COLLECT_ITEMS: 'collect_items',
        EXPLORE_DUNGEON: 'explore_dungeon',
        OPEN_CHESTS: 'open_chests',
        WIN_BATTLES: 'win_battles',
        KILL_BOSS: 'kill_boss'
    },

    // ============================================================
    //  СИСТЕМА ПОДЗЕМЕЛИЙ (DUNGEON)
    // ============================================================

    // Подземки
    DUNGEON_TYPES: {
        FOREST: 'forest',
        SWAMP: 'swamp',
        CAVE: 'cave'
    },

    // Максимальный уровень подземки
    DUNGEON_MAX_LEVEL: 7,

    // Количество звёзд для открытия следующего уровня
    DUNGEON_STARS_TO_UNLOCK: 2,

    // ============================================================
    //  СИСТЕМА ТРЕНИРОВОК
    // ============================================================

    // Максимальный уровень тренировки
    TRAINING_MAX_LEVEL: 200,

    // Количество улучшений за тренировку
    TRAINING_BONUS: {
        attack: 2,
        defense: 2,
        hp: 10,
        agility: 1
    },

    // ============================================================
    //  ЛИМИТЫ ПЕРСОНАЖА
    // ============================================================

    MAX_LEVEL: 100,
    MAX_SKILL_LEVEL: 80,
    MAX_JEWELRY_LEVEL: 50,
    MAX_TRAINING_LEVEL: 200,
    MAX_STAT_VALUE: 30000,

    // ============================================================
    //  ЭКОНОМИКА
    // ============================================================

    // Стоимость входа в подземку за золото (циклическая)
    DUNGEON_GOLD_PRICES: [25, 40, 60, 80, 100, 150, 200],

    // Реген жетонов (минуты)
    DUNGEON_TICKET_REGENERATION: 40,

    // Максимум жетонов
    DUNGEON_MAX_TICKETS: 5
};

// ============================================================
//  ЭКСПОРТ ДЛЯ УДОБСТВА
// ============================================================

Sherwood.ActionType = Sherwood.Models.ActionType;
Sherwood.GameScreen = Sherwood.Models.GameScreen;
Sherwood.EquipmentPart = Sherwood.Models.EquipmentPart;
Sherwood.ItemGrade = Sherwood.Models.ItemGrade;
Sherwood.GradeColors = Sherwood.Models.GradeColors;
Sherwood.ResourceType = Sherwood.Models.ResourceType;

// Система данжа
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

// Подземелья
Sherwood.DUNGEON_TYPES = Sherwood.Models.DUNGEON_TYPES;
Sherwood.DUNGEON_MAX_LEVEL = Sherwood.Models.DUNGEON_MAX_LEVEL;
Sherwood.DUNGEON_STARS_TO_UNLOCK = Sherwood.Models.DUNGEON_STARS_TO_UNLOCK;

// Тренировки
Sherwood.TRAINING_MAX_LEVEL = Sherwood.Models.TRAINING_MAX_LEVEL;
Sherwood.TRAINING_BONUS = Sherwood.Models.TRAINING_BONUS;

// Лимиты
Sherwood.MAX_LEVEL = Sherwood.Models.MAX_LEVEL;
Sherwood.MAX_SKILL_LEVEL = Sherwood.Models.MAX_SKILL_LEVEL;
Sherwood.MAX_JEWELRY_LEVEL = Sherwood.Models.MAX_JEWELRY_LEVEL;
Sherwood.MAX_TRAINING_LEVEL = Sherwood.Models.MAX_TRAINING_LEVEL;
Sherwood.MAX_STAT_VALUE = Sherwood.Models.MAX_STAT_VALUE;

// Экономика
Sherwood.DUNGEON_GOLD_PRICES = Sherwood.Models.DUNGEON_GOLD_PRICES;
Sherwood.DUNGEON_TICKET_REGENERATION = Sherwood.Models.DUNGEON_TICKET_REGENERATION;
Sherwood.DUNGEON_MAX_TICKETS = Sherwood.Models.DUNGEON_MAX_TICKETS;

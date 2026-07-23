/**
 * Sherwood RPG — Core v2
 * Ядро игры: игрок, сохранение, ресурсы, статы, события
 */

// ============================================================
//  ГЛОБАЛЬНЫЙ ОБЪЕКТ
// ============================================================

if (typeof Sherwood === 'undefined') {
    var Sherwood = {};
}

// ============================================================
//  ИГРОК
// ============================================================

Sherwood._player = null;
Sherwood._saveTimeout = null;

Sherwood.getPlayer = function() {
    if (!this._player) {
        this._loadGame();
    }
    return this._player;
};

Sherwood.setPlayer = function(player) {
    this._player = player;
    this.saveGame();
};

// ============================================================
//  СОХРАНЕНИЕ (С DEBOUNCE)
// ============================================================

Sherwood._saveKey = 'sherwood_save_data';

Sherwood.saveGame = function() {
    if (!this._player) return;

    // Debounce — сохраняем не чаще раза в 300мс
    if (this._saveTimeout) {
        clearTimeout(this._saveTimeout);
    }
    this._saveTimeout = setTimeout(() => {
        try {
            localStorage.setItem(this._saveKey, JSON.stringify(this._player));
        } catch(e) {
            console.warn('⚠️ Не удалось сохранить игру:', e);
        }
    }, 300);
};

/**
 * Принудительное сохранение без задержки (для выхода из игры)
 */
Sherwood.saveGameNow = function() {
    if (this._saveTimeout) {
        clearTimeout(this._saveTimeout);
        this._saveTimeout = null;
    }
    if (!this._player) return;
    try {
        localStorage.setItem(this._saveKey, JSON.stringify(this._player));
    } catch(e) {
        console.warn('⚠️ Не удалось сохранить игру:', e);
    }
};

Sherwood._loadGame = function() {
    try {
        const data = localStorage.getItem(this._saveKey);
        if (data) {
            this._player = JSON.parse(data);
            // Проверка целостности — все обязательные поля
            this._ensurePlayerDefaults();
            return;
        }
    } catch(e) {
        console.warn('⚠️ Ошибка загрузки:', e);
    }

    // Создаём нового игрока
    this._createNewPlayer();
    this.saveGameNow();
};

Sherwood._ensurePlayerDefaults = function() {
    const p = this._player;
    if (!p) return;

    if (!p.name) p.name = 'Охотник';
    if (!p.level) p.level = 1;
    if (p.exp === undefined || p.exp === null) p.exp = 0;
    if (!p.expToLevel) p.expToLevel = 100;
    if (!p.stats) p.stats = { attack: 10, defense: 5, agility: 3, hp: 100, maxHp: 100 };
    if (!p.resources) p.resources = { gold: 0, silver: 100, trophies: 0 };
    if (!p.inventory) p.inventory = [];
    if (!p.equipment) p.equipment = {};
    if (!p.dungeon) p.dungeon = { tickets: 5, maxTickets: 5 };
    if (!p.bagSize) p.bagSize = 10;
    if (!p.bestiary) p.bestiary = {};
    if (!p.questProgress) p.questProgress = {};
    if (!p.trophies) p.trophies = [];
    if (!p.trainingLevels) p.trainingLevels = { attack: 0, defense: 0, hp: 0, agility: 0 };
    if (!p.unlockedSkins) p.unlockedSkins = [];
    if (!p.activeSkin) p.activeSkin = 'skin_1_basic';
    if (!p.settings) p.settings = {};
};

Sherwood._createNewPlayer = function() {
    this._player = {
        name: 'Охотник',
        level: 1,
        exp: 0,
        expToLevel: 100,
        stats: { attack: 10, defense: 5, agility: 3, hp: 100, maxHp: 100 },
        resources: { gold: 0, silver: 100, trophies: 0 },
        inventory: [],
        equipment: {},
        dungeon: { tickets: 5, maxTickets: 5 },
        bagSize: 10,
        bestiary: {},
        questProgress: {},
        trophies: [],
        trainingLevels: { attack: 0, defense: 0, hp: 0, agility: 0 },
        unlockedSkins: [],
        activeSkin: 'skin_1_basic',
        settings: {}
    };
};

// ============================================================
//  РЕСУРСЫ
// ============================================================

Sherwood.addResource = function(type, amount) {
    const player = this.getPlayer();
    if (!player) return;
    if (!player.resources) player.resources = {};
    player.resources[type] = (player.resources[type] || 0) + amount;
    this.dispatch({ type: 'RESOURCE_CHANGED', payload: { type, amount } });
    this.saveGame();
};

/**
 * Проверка, хватает ли ресурса
 */
Sherwood.hasResource = function(type, amount) {
    const player = this.getPlayer();
    if (!player || !player.resources) return false;
    return (player.resources[type] || 0) >= amount;
};

/**
 * Потратить ресурс (вернёт false если не хватает)
 */
Sherwood.spendResource = function(type, amount) {
    if (!this.hasResource(type, amount)) return false;
    const player = this.getPlayer();
    player.resources[type] -= amount;
    this.dispatch({ type: 'RESOURCE_CHANGED', payload: { type, amount: -amount } });
    this.saveGame();
    return true;
};

// ============================================================
//  ОПЫТ И УРОВЕНЬ
// ============================================================

Sherwood.addExp = function(amount) {
    const player = this.getPlayer();
    if (!player) return;
    if (player.level >= 100) return; // Кап уровня

    player.exp += amount;
    while (player.exp >= player.expToLevel && player.level < 100) {
        player.exp -= player.expToLevel;
        player.level++;
        player.expToLevel = Math.min(Math.floor(player.expToLevel * 1.3), 999999);
        this.dispatch({ type: 'PLAYER_LEVEL_UP', payload: { level: player.level } });
    }
    // Кап на 100 уровне
    if (player.level >= 100) {
        player.exp = 0;
        player.expToLevel = 0;
    }
    this._recalcStats();
    this.saveGame();
};

// ============================================================
//  СОБЫТИЯ
// ============================================================

Sherwood._events = {};

Sherwood.on = function(event, callback) {
    if (!this._events[event]) this._events[event] = [];
    this._events[event].push(callback);
};

Sherwood.once = function(event, callback) {
    const self = this;
    const wrapper = function(data) {
        callback(data);
        self.off(event, wrapper);
    };
    this.on(event, wrapper);
};

Sherwood.off = function(event, callback) {
    if (!this._events[event]) return;
    this._events[event] = this._events[event].filter(cb => cb !== callback);
};

Sherwood.dispatch = function(event) {
    const callbacks = this._events[event.type] || [];
    callbacks.forEach(cb => {
        try {
            cb(event.payload);
        } catch(e) {
            console.warn('⚠️ Ошибка в обработчике события', event.type, e);
        }
    });
};

// ============================================================
//  ПЕРЕСЧЁТ СТАТОВ (С БИЖУТЕРИЕЙ И ТРОФЕЯМИ)
// ============================================================

Sherwood._recalcStats = function() {
    const player = this.getPlayer();
    if (!player) return;

    let bonusAttack = 0;
    let bonusDefense = 0;
    let bonusAgility = 0;
    let bonusHp = 0;

    // Экипировка (включая кольца и амулеты)
    for (const part of Object.values(player.equipment || {})) {
        if (part && part.stats) {
            bonusAttack += part.stats.attack || 0;
            bonusDefense += part.stats.defense || 0;
            bonusAgility += part.stats.agility || 0;
            bonusHp += part.stats.hp || 0;
        }
    }

    // Тренировки
    const tl = player.trainingLevels || {};
    bonusAttack += (tl.attack || 0) * 2;
    bonusDefense += (tl.defense || 0) * 2;
    bonusAgility += (tl.agility || 0) * 1;
    bonusHp += (tl.hp || 0) * 10;

    // Трофеи (постоянные пассивные бусты)
    for (const trophy of (player.trophies || [])) {
        if (trophy.bonus) {
            bonusAttack += trophy.bonus.attack || 0;
            bonusDefense += trophy.bonus.defense || 0;
            bonusAgility += trophy.bonus.agility || 0;
            bonusHp += trophy.bonus.hp || 0;
        }
    }

    // Базовые статы от уровня
    const baseStats = {
        attack: 10 + (player.level - 1) * 2,
        defense: 5 + (player.level - 1) * 1,
        agility: 3 + (player.level - 1) * 0.5,
        maxHp: 100 + (player.level - 1) * 15
    };

    // Итоговые статы с капом
    const MAX_STAT = 30000;
    player.stats.attack = Math.min(Math.floor(baseStats.attack + bonusAttack), MAX_STAT);
    player.stats.defense = Math.min(Math.floor(baseStats.defense + bonusDefense), MAX_STAT);
    player.stats.agility = Math.min(Math.floor(baseStats.agility + bonusAgility), MAX_STAT);
    player.stats.maxHp = Math.min(Math.floor(baseStats.maxHp + bonusHp), MAX_STAT);

    // HP сохраняем, но не превышаем новый максимум
    const oldHp = player.stats.hp;
    if (oldHp === undefined || oldHp === null || oldHp > player.stats.maxHp) {
        player.stats.hp = player.stats.maxHp;
    }

    this.saveGame();
};

// ============================================================
//  ТРОФЕИ
// ============================================================

/**
 * Выдать трофей (только если ещё не получен)
 * @param {string} id - уникальный id трофея
 * @param {string} name - название
 * @param {object} bonus - бонусы {attack, defense, agility, hp}
 * @param {string} icon - путь к иконке
 * @param {string} category - категория: 'chapter', 'subway', 'portal'
 * @returns {boolean} - true если трофей новый
 */
Sherwood.addTrophy = function(id, name, bonus, icon, category) {
    const player = this.getPlayer();
    if (!player) return false;
    if (!player.trophies) player.trophies = [];

    // Проверяем, нет ли уже такого трофея
    if (player.trophies.find(t => t.id === id)) {
        return false;
    }

    player.trophies.push({
        id: id,
        name: name,
        bonus: bonus || {},
        icon: icon || '',
        category: category || 'chapter',
        acquiredAt: Date.now()
    });

    this._recalcStats();
    this.saveGame();
    this.dispatch({ type: 'TROPHY_ACQUIRED', payload: { id, name } });
    return true;
};

/**
 * Получить все трофеи игрока
 */
Sherwood.getTrophies = function() {
    const player = this.getPlayer();
    return player ? (player.trophies || []) : [];
};

/**
 * Есть ли у игрока трофей
 */
Sherwood.hasTrophy = function(id) {
    const player = this.getPlayer();
    if (!player || !player.trophies) return false;
    return player.trophies.some(t => t.id === id);
};

// ============================================================
//  ИНИЦИАЛИЗАЦИЯ
// ============================================================

Sherwood.init = function() {
    this.getPlayer();
    this._recalcStats();

    // Инициализация подсистем
    if (typeof Sherwood.Dungeon !== 'undefined' && Sherwood.Dungeon.init) {
        Sherwood.Dungeon.init();
    }
    if (typeof Sherwood.Bag !== 'undefined' && Sherwood.Bag.init) {
        Sherwood.Bag.init();
    }

    console.log('🏹 Sherwood RPG v2 готов!');
    this.dispatch({ type: 'GAME_INITIALIZED' });
};

// ============================================================
//  АВТОЗАПУСК
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    if (typeof Sherwood !== 'undefined' && Sherwood.init) {
        Sherwood.init();
    }
});

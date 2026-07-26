/**
 * Sherwood Equipment Database
 * Только аксессуары — оружие и доспехи заменены скинами
 */

Sherwood.EquipmentDB = {
    grades: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    
    gradeMultipliers: {
        common: 1.0,
        uncommon: 1.4,
        rare: 1.9,
        epic: 2.6,
        legendary: 3.5
    },
    
    upgradeCosts: {
        common: { gold: 15, silver: 30 },
        uncommon: { gold: 30, silver: 60 },
        rare: { gold: 60, silver: 120 },
        epic: { gold: 120, silver: 250 },
        legendary: { gold: 250, silver: 500 }
    },
    
    items: [
        // ===== ПОЯС =====
        {
            id: 'cloth_belt',
            part: 'belt',
            grade: 'common',
            name: 'Тканый пояс',
            stats: { hp: 5 },
            price: { gold: 6 },
            description: 'Простой тканый пояс.'
        },
        {
            id: 'leather_belt',
            part: 'belt',
            grade: 'uncommon',
            name: 'Кожаный пояс',
            stats: { hp: 10, defense: 1 },
            price: { gold: 20 },
            description: 'Пояс из дублёной кожи.'
        },
        {
            id: 'ranger_belt',
            part: 'belt',
            grade: 'rare',
            name: 'Пояс следопыта',
            stats: { hp: 20, defense: 2, agility: 1 },
            price: { gold: 60 },
            description: 'Удобный пояс с множеством карманов.'
        },
        {
            id: 'sherwood_belt',
            part: 'belt',
            grade: 'epic',
            name: 'Пояс Шервуда',
            stats: { hp: 35, defense: 3, agility: 2 },
            price: { gold: 200 },
            description: 'Пояс лесных королей.'
        },
        {
            id: 'legendary_belt',
            part: 'belt',
            grade: 'legendary',
            name: 'Пояс Вечности',
            stats: { hp: 50, defense: 5, agility: 3 },
            price: { gold: 600 },
            description: 'Пояс, сплетённый из корней древнего дуба.'
        },
        
        // ===== АМУЛЕТ =====
        {
            id: 'copper_amulet',
            part: 'amulet',
            grade: 'common',
            name: 'Медный амулет',
            stats: { hp: 5, defense: 1 },
            price: { gold: 12 },
            description: 'Простой медный амулет.'
        },
        {
            id: 'silver_amulet',
            part: 'amulet',
            grade: 'uncommon',
            name: 'Серебряный амулет',
            stats: { hp: 15, defense: 2, agility: 1 },
            price: { gold: 35 },
            description: 'Амулет из чистого серебра.'
        },
        {
            id: 'golden_amulet',
            part: 'amulet',
            grade: 'rare',
            name: 'Золотой амулет',
            stats: { hp: 30, defense: 4, agility: 2 },
            price: { gold: 100 },
            description: 'Драгоценный амулет с рубином.'
        },
        {
            id: 'sherwood_amulet',
            part: 'amulet',
            grade: 'epic',
            name: 'Амулет Шервуда',
            stats: { hp: 50, defense: 6, agility: 4, critChance: 3 },
            price: { gold: 300 },
            description: 'Амулет, хранящий силу древнего леса.'
        },
        {
            id: 'legendary_amulet',
            part: 'amulet',
            grade: 'legendary',
            name: 'Амулет Легенды',
            stats: { hp: 80, defense: 8, agility: 6, critChance: 5 },
            price: { gold: 900 },
            description: 'Амулет, в котором заключена душа Шервуда.'
        },
        
        // ===== КОЛЬЦО =====
        {
            id: 'copper_ring',
            part: 'ring',
            grade: 'common',
            name: 'Медное кольцо',
            stats: { attack: 1, defense: 1 },
            price: { gold: 10 },
            description: 'Простое медное кольцо.'
        },
        {
            id: 'silver_ring',
            part: 'ring',
            grade: 'uncommon',
            name: 'Серебряное кольцо',
            stats: { attack: 3, defense: 2 },
            price: { gold: 30 },
            description: 'Кольцо из чистого серебра.'
        },
        {
            id: 'golden_ring',
            part: 'ring',
            grade: 'rare',
            name: 'Золотое кольцо',
            stats: { attack: 5, defense: 3, hp: 10 },
            price: { gold: 90 },
            description: 'Драгоценное кольцо с изумрудом.'
        },
        {
            id: 'sherwood_ring',
            part: 'ring',
            grade: 'epic',
            name: 'Кольцо Шервуда',
            stats: { attack: 8, defense: 4, hp: 20, critChance: 3 },
            price: { gold: 280 },
            description: 'Кольцо лесных королей.'
        },
        {
            id: 'legendary_ring',
            part: 'ring',
            grade: 'legendary',
            name: 'Кольцо Вечности',
            stats: { attack: 12, defense: 6, hp: 30, critChance: 5 },
            price: { gold: 800 },
            description: 'Кольцо, выкованное из звездного металла.'
        }
    ],
    
    // ============================================================
    //  МЕТОДЫ
    // ============================================================
    
    findById: function(id) {
        if (!id) return null;
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].id === id) {
                return this.items[i];
            }
        }
        return null;
    },
    
    findByPart: function(part) {
        if (!part) return [];
        var result = [];
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].part === part) {
                result.push(this.items[i]);
            }
        }
        return result;
    },
    
    findByGrade: function(grade) {
        if (!grade) return [];
        var result = [];
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].grade === grade) {
                result.push(this.items[i]);
            }
        }
        return result;
    },
    
    findByPartAndGrade: function(part, grade) {
        var result = this.findByPart(part);
        var filtered = [];
        for (var i = 0; i < result.length; i++) {
            if (result[i].grade === grade) {
                filtered.push(result[i]);
            }
        }
        return filtered;
    },
    
    getRandomItem: function(grade) {
        var pool = grade ? this.findByGrade(grade) : this.items;
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    },
    
    getRandomItemByPart: function(part, grade) {
        var pool = grade ? this.findByPartAndGrade(part, grade) : this.findByPart(part);
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    },
    
    getAllParts: function() {
        return ['belt', 'amulet', 'ring'];
    },
    
    getAllGrades: function() {
        return this.grades;
    },
    
    getGradeMultiplier: function(grade) {
        return this.gradeMultipliers[grade] || 1.0;
    },
    
    getUpgradeCost: function(grade, level) {
        var base = this.upgradeCosts[grade] || this.upgradeCosts.common;
        var mult = 1 + (level || 0) * 0.15;
        return {
            gold: Math.floor(base.gold * mult),
            silver: Math.floor(base.silver * mult)
        };
    },
    
    getItemName: function(item) {
        return item ? item.name : '';
    },
    
    formatStats: function(stats) {
        if (!stats) return '';
        var parts = [];
        if (stats.attack) parts.push('⚔️ +' + stats.attack);
        if (stats.defense) parts.push('🛡️ +' + stats.defense);
        if (stats.agility) parts.push('💨 +' + stats.agility);
        if (stats.hp) parts.push('❤️ +' + stats.hp);
        if (stats.critChance) parts.push('💥 +' + stats.critChance + '%');
        if (stats.dodgeChance) parts.push('🌀 +' + stats.dodgeChance + '%');
        return parts.join(' ');
    },
    
    createItemWithLevel: function(itemId, enhancementLevel) {
        var template = this.findById(itemId);
        if (!template) return null;
        
        var item = JSON.parse(JSON.stringify(template));
        var mult = 1 + (enhancementLevel || 0) * 0.2;
        
        if (item.stats) {
            for (var stat in item.stats) {
                if (item.stats.hasOwnProperty(stat)) {
                    item.stats[stat] = Math.floor(item.stats[stat] * mult);
                }
            }
        }
        
        item.enhancement = enhancementLevel || 0;
        return item;
    },
    
    // Проверка, является ли предмет аксессуаром
    isAccessory: function(item) {
        if (!item || !item.part) return false;
        return ['belt', 'amulet', 'ring'].indexOf(item.part) !== -1;
    }
};

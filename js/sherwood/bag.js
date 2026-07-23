/**
 * Sherwood Bag System — Инвентарь, лут, экипировка
 */

Sherwood.Bag = {
    // ============================================================
    //  ДАННЫЕ
    // ============================================================

    _inventory: [],
    _equipment: {
        head: null,
        torso: null,
        hands: null,
        legs: null,
        feet: null,
        weapon1: null,
        weapon2: null,
        belt: null,
        amulet: null,
        ring: null
    },
    _maxSlots: 10,

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    init: function() {
        const player = Sherwood.getPlayer();
        if (!player) return;

        this._inventory = player.inventory || [];
        this._equipment = player.equipment || this._equipment;
        this._maxSlots = player.bagSize || 10;

        // Стартовый лук только если инвентарь пуст
        if (this._inventory.length === 0 && !this._equipment.weapon1) {
            this._inventory.push({
                id: 'starter_bow',
                name: 'Лук новичка',
                icon: 'assets/interface/labyrinth_of_icons.png',
                part: 'weapon1',
                grade: 'common',
                type: 'weapon',
                stats: { attack: 5 },
                sellPrice: 10
            });
            this._save();
        }

        console.log('🎒 Сумка инициализирована, предметов:', this._inventory.length);
    },

    // ============================================================
    //  ОСНОВНЫЕ МЕТОДЫ
    // ============================================================

    getItems: function() {
        return this._inventory;
    },

    getEquipment: function() {
        return this._equipment;
    },

    getMaxSlots: function() {
        return this._maxSlots;
    },

    getFreeSlots: function() {
        return this._maxSlots - this._inventory.length;
    },

    isFull: function() {
        return this._inventory.length >= this._maxSlots;
    },

    // ============================================================
    //  ДОБАВЛЕНИЕ ПРЕДМЕТОВ
    // ============================================================

    addItem: function(item) {
        if (!item) return false;
        if (this.isFull()) {
            Sherwood.dispatch({
                type: 'BAG_FULL',
                payload: { item: item }
            });
            return false;
        }

        if (item.stackable && item.quantity) {
            for (let i = 0; i < this._inventory.length; i++) {
                const existing = this._inventory[i];
                if (existing.id === item.id && existing.stackable) {
                    existing.quantity += item.quantity;
                    this._save();
                    return true;
                }
            }
        }

        this._inventory.push({ ...item });
        this._save();

        Sherwood.dispatch({
            type: 'ITEM_ACQUIRED',
            payload: { item: item }
        });

        return true;
    },

    // ============================================================
    //  УДАЛЕНИЕ ПРЕДМЕТОВ
    // ============================================================

    removeItem: function(index, quantity) {
        if (typeof quantity === 'undefined') quantity = 1;
        if (index < 0 || index >= this._inventory.length) return false;

        const item = this._inventory[index];
        if (!item) return false;

        if (item.stackable && item.quantity > quantity) {
            item.quantity -= quantity;
            this._save();
            return true;
        }

        this._inventory.splice(index, 1);
        this._save();
        return true;
    },

    // ============================================================
    //  ЭКИПИРОВКА
    // ============================================================

    equipItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;

        const item = this._inventory[index];
        if (!item || !item.part) return false;

        const part = item.part;
        const oldItem = this._equipment[part];

        if (oldItem) {
            this._inventory.push(oldItem);
        }

        this._equipment[part] = item;
        this._inventory.splice(index, 1);

        if (typeof Sherwood._recalcStats === 'function') {
            Sherwood._recalcStats();
        }

        Sherwood.dispatch({
            type: 'ITEM_EQUIPPED',
            payload: { part: part, item: item }
        });

        this._save();
        return true;
    },

    unequipItem: function(part) {
        if (!part || !this._equipment[part]) return false;

        const item = this._equipment[part];
        if (this.isFull()) {
            Sherwood.dispatch({
                type: 'BAG_FULL',
                payload: { item: item }
            });
            return false;
        }

        this._inventory.push(item);
        this._equipment[part] = null;

        if (typeof Sherwood._recalcStats === 'function') {
            Sherwood._recalcStats();
        }

        Sherwood.dispatch({
            type: 'ITEM_UNEQUIPPED',
            payload: { part: part, item: item }
        });

        this._save();
        return true;
    },

    // ============================================================
    //  ПРОДАЖА
    // ============================================================

    sellItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;

        const item = this._inventory[index];
        if (!item) return false;

        // Цена продажи: явная sellPrice или 40% от buyPrice, минимум 5 серебра
        let price = item.sellPrice;
        if (!price && item.buyPrice) {
            price = Math.floor(item.buyPrice * 0.4);
        }
        if (!price || price < 5) {
            price = 5;
        }

        Sherwood.addResource('silver', price);

        this._inventory.splice(index, 1);
        this._save();

        Sherwood.dispatch({
            type: 'ITEM_SOLD',
            payload: { item: item, price: price }
        });

        return true;
    },

    // ============================================================
    //  РАЗБОР
    // ============================================================

    dismantleItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;

        const item = this._inventory[index];
        if (!item) return false;

        const gradeMultiplier = {
            'common': 1,
            'uncommon': 2,
            'rare': 4,
            'epic': 8,
            'legendary': 16
        };
        const mult = gradeMultiplier[item.grade] || 1;

        const materials = {
            silver: (5 + Math.floor(Math.random() * 10)) * mult,
            wood: Math.floor(Math.random() * 3) * mult,
            scraps: Math.floor(Math.random() * 2) * mult
        };

        if (item.grade === 'rare' || item.grade === 'epic' || item.grade === 'legendary') {
            materials.gold = Math.floor(Math.random() * 5) * mult;
        }

        if (materials.gold) Sherwood.addResource('gold', materials.gold);
        if (materials.silver) Sherwood.addResource('silver', materials.silver);
        if (materials.wood) Sherwood.addResource('wood', materials.wood);
        if (materials.scraps) Sherwood.addResource('scraps', materials.scraps);

        this._inventory.splice(index, 1);
        this._save();

        Sherwood.dispatch({
            type: 'ITEM_DISMANTLED',
            payload: { item: item, materials: materials }
        });

        return true;
    },

    // ============================================================
    //  ПОЛУЧЕНИЕ ЛУТА
    // ============================================================

    addLoot: function(loot) {
        if (!loot) return;

        if (loot.gold) Sherwood.addResource('gold', loot.gold);
        if (loot.silver) Sherwood.addResource('silver', loot.silver);
        if (loot.exp) Sherwood.addExp(loot.exp);

        if (loot.items && loot.items.length > 0) {
            for (let i = 0; i < loot.items.length; i++) {
                this.addItem(loot.items[i]);
            }
        }

        Sherwood.dispatch({
            type: 'LOOT_ACQUIRED',
            payload: { loot: loot }
        });
    },

    // ============================================================
    //  СОХРАНЕНИЕ
    // ============================================================

    _save: function() {
        const player = Sherwood.getPlayer();
        if (!player) return;

        player.inventory = this._inventory;
        player.equipment = this._equipment;
        player.bagSize = this._maxSlots;
        Sherwood.saveGame();
    }
};

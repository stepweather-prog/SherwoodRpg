Sherwood.Bag = {
    _inventory: [],
    _equipment: { head: null, torso: null, hands: null, legs: null, feet: null, weapon1: null, weapon2: null, belt: null, amulet: null, ring: null },
    _maxSlots: 10,

    // Расширение сумки по уровням (каждые ~4.6 уровня +5 ячеек, кап 150 на 70 уровне)
    _slotsPerLevel: function(level) {
        if (level >= 70) return 150;
        return Math.min(150, 10 + Math.floor((level - 1) / 4.6) * 5);
    },

    _expansionCost: function(currentSlots) {
        return 50 + currentSlots * 10;
    },

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        this._inventory = player.inventory || [];
        this._equipment = player.equipment || this._equipment;
        this._maxSlots = this._slotsPerLevel(player.level || 1);
        if (player.bagSize && player.bagSize > this._maxSlots) this._maxSlots = player.bagSize;
        if (this._inventory.length === 0 && !this._equipment.weapon1) {
            this._inventory.push({
                id: 'starter_bow',
                name: 'Лук новичка',
                icon: 'assets/interface/labyrinth_of_icons.png',
                part: 'weapon1',
                grade: 'common',
                type: 'weapon',
                stats: { attack: 5 },
                sellPrice: 10,
                quantity: 1,
                maxStack: 10
            });
            this._save();
        }
    },

    getItems: function() { return this._inventory; },
    getEquipment: function() { return this._equipment; },
    getMaxSlots: function() { return this._maxSlots; },
    getFreeSlots: function() { return this._maxSlots - this._inventory.length; },
    isFull: function() { return this._inventory.length >= this._maxSlots; },

    getExpansionInfo: function() {
        var player = Sherwood.getPlayer();
        var levelSlots = this._slotsPerLevel(player.level || 1);
        return {
            current: this._maxSlots,
            maxByLevel: levelSlots,
            canExpand: this._maxSlots < levelSlots,
            cost: this._expansionCost(this._maxSlots),
            nextSlots: Math.min(this._maxSlots + 5, levelSlots)
        };
    },

    expandBag: function() {
        var info = this.getExpansionInfo();
        if (!info.canExpand) return { success: false, reason: 'Достигнут лимит для вашего уровня' };
        var player = Sherwood.getPlayer();
        if ((player.resources.gold || 0) < info.cost) return { success: false, reason: 'Недостаточно золота' };
        player.resources.gold -= info.cost;
        this._maxSlots = info.nextSlots;
        player.bagSize = this._maxSlots;
        this._save();
        Sherwood.saveGame();
        return { success: true, newSlots: this._maxSlots };
    },

    addItem: function(item) {
        if (!item) return false;
        if (this.isFull()) {
            Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: item } });
            return false;
        }
        var maxStack = item.maxStack || 10;
        if (item.quantity && item.id) {
            for (var i = 0; i < this._inventory.length; i++) {
                var existing = this._inventory[i];
                if (existing.id === item.id && (existing.quantity || 1) < maxStack) {
                    existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
                    if (existing.quantity > maxStack) existing.quantity = maxStack;
                    this._save();
                    return true;
                }
            }
        }
        item.quantity = item.quantity || 1;
        item.maxStack = maxStack;
        this._inventory.push(Object.assign({}, item));
        this._save();
        Sherwood.dispatch({ type: 'ITEM_ACQUIRED', payload: { item: item } });
        return true;
    },

    removeItem: function(index, quantity) {
        if (typeof quantity === 'undefined') quantity = 1;
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item) return false;
        if (item.quantity && item.quantity > quantity) {
            item.quantity -= quantity;
            this._save();
            return true;
        }
        this._inventory.splice(index, 1);
        this._save();
        return true;
    },

    equipItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item || !item.part) return false;
        var part = item.part;
        var oldItem = this._equipment[part];
        if (oldItem) this._inventory.push(oldItem);
        this._equipment[part] = item;
        this._inventory.splice(index, 1);
        if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
        Sherwood.dispatch({ type: 'ITEM_EQUIPPED', payload: { part: part, item: item } });
        this._save();
        return true;
    },

    unequipItem: function(part) {
        if (!part || !this._equipment[part]) return false;
        var item = this._equipment[part];
        if (this.isFull()) { Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: item } }); return false; }
        this._inventory.push(item);
        this._equipment[part] = null;
        if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
        Sherwood.dispatch({ type: 'ITEM_UNEQUIPPED', payload: { part: part, item: item } });
        this._save();
        return true;
    },

    sellItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item) return false;
        var price = item.sellPrice;
        if (!price && item.buyPrice) price = Math.floor(item.buyPrice * 0.4);
        if (!price || price < 5) price = 5;
        price = price * (item.quantity || 1);
        Sherwood.addResource('silver', price);
        this._inventory.splice(index, 1);
        this._save();
        Sherwood.dispatch({ type: 'ITEM_SOLD', payload: { item: item, price: price } });
        return true;
    },

    dismantleItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item) return false;
        var gm = { common: 1, uncommon: 2, rare: 4, epic: 8, legendary: 16 };
        var mult = gm[item.grade] || 1;
        var materials = {
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
        Sherwood.dispatch({ type: 'ITEM_DISMANTLED', payload: { item: item, materials: materials } });
        return true;
    },

    addLoot: function(loot) {
        if (!loot) return;
        if (loot.gold) Sherwood.addResource('gold', loot.gold);
        if (loot.silver) Sherwood.addResource('silver', loot.silver);
        if (loot.exp) Sherwood.addExp(loot.exp);
        if (loot.items && loot.items.length > 0) {
            for (var i = 0; i < loot.items.length; i++) this.addItem(loot.items[i]);
        }
        Sherwood.dispatch({ type: 'LOOT_ACQUIRED', payload: { loot: loot } });
    },

    _save: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        player.inventory = this._inventory;
        player.equipment = this._equipment;
        player.bagSize = this._maxSlots;
        Sherwood.saveGame();
    }
};

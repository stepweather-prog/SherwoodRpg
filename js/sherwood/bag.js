Sherwood.Bag = {
    _inventory: [],
    _equipment: { head: null, torso: null, hands: null, legs: null, feet: null, weapon1: null, weapon2: null, belt: null, amulet: null, ring: null },
    _maxSlots: 10,
    _expansionLevel: 0,

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        this._inventory = player.inventory || [];
        this._equipment = player.equipment || this._equipment;
        this._expansionLevel = player.bagExpansion || 0;
        this._maxSlots = 10 + this._expansionLevel * 10;
        if (player.bagSize && player.bagSize > this._maxSlots) this._maxSlots = player.bagSize;
        // Стартовый скин
        if (!player.unlockedSkins || player.unlockedSkins.length === 0) {
            player.unlockedSkins = ['skin_1_basic'];
            player.activeSkin = 'skin_1_basic';
            Sherwood.saveGame();
        }
    },

    getItems: function() { return this._inventory; },
    getEquipment: function() { return this._equipment; },
    getMaxSlots: function() { return this._maxSlots; },
    getFreeSlots: function() { return this._maxSlots - this._inventory.length; },
    isFull: function() { return this._inventory.length >= this._maxSlots; },

    getExpansionInfo: function() {
        var costSkin = 1000 + this._expansionLevel * 500;
        var costSilver = 5000 + this._expansionLevel * 2500;
        return {
            current: this._maxSlots,
            level: this._expansionLevel,
            canExpand: this._maxSlots < 150,
            costSkin: costSkin,
            costSilver: costSilver,
            nextSlots: Math.min(this._maxSlots + 10, 150)
        };
    },

    expandBag: function() {
        var info = this.getExpansionInfo();
        if (!info.canExpand) return { success: false, reason: 'Максимум 150 слотов' };
        var skins = 0;
        for (var i = 0; i < this._inventory.length; i++) {
            if (this._inventory[i].id && this._inventory[i].id.indexOf('skin_') === 0) {
                skins += this._inventory[i].quantity || 1;
            }
        }
        if (skins < info.costSkin) return { success: false, reason: 'Нужно ' + info.costSkin + ' шкур' };
        var player = Sherwood.getPlayer();
        if ((player.resources.silver || 0) < info.costSilver) return { success: false, reason: 'Нужно ' + info.costSilver + ' серебра' };
        var toRemove = info.costSkin;
        for (var i = this._inventory.length - 1; i >= 0 && toRemove > 0; i--) {
            if (this._inventory[i].id && this._inventory[i].id.indexOf('skin_') === 0) {
                var qty = this._inventory[i].quantity || 1;
                if (qty <= toRemove) {
                    toRemove -= qty;
                    this._inventory.splice(i, 1);
                } else {
                    this._inventory[i].quantity -= toRemove;
                    toRemove = 0;
                }
            }
        }
        player.resources.silver -= info.costSilver;
        this._expansionLevel++;
        this._maxSlots = 10 + this._expansionLevel * 10;
        player.bagSize = this._maxSlots;
        player.bagExpansion = this._expansionLevel;
        this._save();
        Sherwood.saveGame();
        return { success: true, newSlots: this._maxSlots, level: this._expansionLevel };
    },

    addItem: function(item) {
        if (!item) return false;
        if (this.isFull()) { Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: item } }); return false; }
        var maxStack = item.maxStack || 99;
        if (item.id) {
            for (var i = 0; i < this._inventory.length; i++) {
                var existing = this._inventory[i];
                if (existing.id === item.id && (existing.quantity || 1) < maxStack) {
                    existing.quantity = (existing.quantity || 1) + (item.quantity || 1);
                    if (existing.quantity > maxStack) {
                        var overflow = existing.quantity - maxStack;
                        existing.quantity = maxStack;
                        var newItem = Object.assign({}, item);
                        newItem.quantity = overflow;
                        if (this.isFull()) return false;
                        this._inventory.push(newItem);
                    }
                    this._save();
                    return true;
                }
            }
        }
        var newItem = Object.assign({}, item);
        newItem.quantity = newItem.quantity || 1;
        newItem.maxStack = maxStack;
        this._inventory.push(newItem);
        this._save();
        Sherwood.dispatch({ type: 'ITEM_ACQUIRED', payload: { item: newItem } });
        return true;
    },

    removeItem: function(index, quantity) {
        if (typeof quantity === 'undefined') quantity = 1;
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item) return false;
        if (item.quantity && item.quantity > quantity) { item.quantity -= quantity; this._save(); return true; }
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
        if (part === 'ring' || part === 'amulet') {
            this._equipment[part] = item;
            this._inventory.splice(index, 1);
            if (oldItem) this._inventory.push(oldItem);
            if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
            Sherwood.dispatch({ type: 'ITEM_EQUIPPED', payload: { part: part, item: item } });
            this._save();
            return true;
        }
        if (oldItem) {
            if (this.isFull()) { Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: oldItem } }); return false; }
            this._inventory.push(oldItem);
        }
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
        this._save();
        return true;
    },

    discardItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;
        this._inventory.splice(index, 1);
        this._save();
        return true;
    },

    sellItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item) return false;
        var price = item.sellPrice || 5;
        if (item.quantity && item.quantity > 1) price = price * item.quantity;
        Sherwood.addResource('silver', price);
        this._inventory.splice(index, 1);
        this._save();
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
    },

    _save: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        player.inventory = this._inventory;
        player.equipment = this._equipment;
        player.bagSize = this._maxSlots;
        player.bagExpansion = this._expansionLevel;
        Sherwood.saveGame();
    }
};

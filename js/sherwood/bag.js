Sherwood.Bag = {
    _inventory: [],
    _equipment: { head: null, torso: null, hands: null, legs: null, feet: null, weapon1: null, weapon2: null, belt: null, amulet: null, ring: null },
    _maxSlots: 10,
    _expansionLevel: 0,
    
    _resources: {
        gold: 0,
        silver: 0,
        skins: 0,
        entranceTickets: 0,
        autoFightTickets: 0,
        amuletTablets: 0,
        ringTablets: 0,
        skinTablets: 0,
        portalToken1: 0,
        portalToken2: 0,
        portalToken3: 0
    },

    _resourceIds: {
        'skin_of_the_sherwood_creature': 'skins',
        'entrance_ticket': 'entranceTickets',
        'dungeon_ticket': 'entranceTickets',
        'autofight_ticket': 'autoFightTickets',
        'auto_ticket': 'autoFightTickets',
        'amulet_tablet': 'amuletTablets',
        'amulet_scroll': 'amuletTablets',
        'ring_tablet': 'ringTablets',
        'ring_scroll': 'ringTablets',
        'skin_tablet': 'skinTablets',
        'appearance_tablet': 'skinTablets',
        'portal_token_1': 'portalToken1',
        'portal_token_2': 'portalToken2',
        'portal_token_3': 'portalToken3'
    },

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        this._inventory = player.inventory || [];
        this._equipment = player.equipment || this._equipment;
        this._expansionLevel = player.bagExpansion || 0;
        this._maxSlots = 10 + this._expansionLevel * 10;
        if (player.bagSize && player.bagSize > this._maxSlots) this._maxSlots = player.bagSize;
        
        // ИСПРАВЛЕНО: используем правильный ID скина
        if (!player.unlockedSkins || player.unlockedSkins.length === 0) {
            player.unlockedSkins = ['skin1_01'];
            player.activeSkin = 'skin1_01';
            Sherwood.saveGame();
        }
        
        // Восстановление ресурсов
        if (player.bagResources) {
            this._resources = player.bagResources;
            if (this._resources.gold === undefined) this._resources.gold = player.resources ? (player.resources.gold || 0) : 0;
            if (this._resources.silver === undefined) this._resources.silver = player.resources ? (player.resources.silver || 0) : 0;
            if (this._resources.portalToken1 === undefined) this._resources.portalToken1 = 0;
            if (this._resources.portalToken2 === undefined) this._resources.portalToken2 = 0;
            if (this._resources.portalToken3 === undefined) this._resources.portalToken3 = 0;
        } else {
            this._resources.gold = player.resources ? (player.resources.gold || 0) : 0;
            this._resources.silver = player.resources ? (player.resources.silver || 0) : 0;
        }
        
        // Конвертация ресурсных предметов из инвентаря
        for (var i = this._inventory.length - 1; i >= 0; i--) {
            var item = this._inventory[i];
            var resKey = this._resourceIds[item.id];
            if (resKey) {
                this._resources[resKey] = (this._resources[resKey] || 0) + (item.quantity || 1);
                this._inventory.splice(i, 1);
            }
        }
        
        // Установка maxStack
        for (var i = 0; i < this._inventory.length; i++) {
            if (!this._inventory[i].maxStack || this._inventory[i].maxStack < 100) {
                this._inventory[i].maxStack = 100;
            }
        }
        
        this._save();
    },

    getItems: function() { return this._inventory; },
    getEquipment: function() { return this._equipment; },
    getMaxSlots: function() { return this._maxSlots; },
    getFreeSlots: function() { return this._maxSlots - this._inventory.length; },
    isFull: function() { return this._inventory.length >= this._maxSlots; },
    
    getResources: function() { return this._resources; },
    
    getResource: function(type) { return this._resources[type] || 0; },
    
    addResource: function(type, amount) {
        if (!amount || amount <= 0) return;
        if (this._resources[type] === undefined) this._resources[type] = 0;
        this._resources[type] += amount;
        this._save();
    },
    
    spendResource: function(type, amount) {
        if ((this._resources[type] || 0) < amount) return false;
        this._resources[type] -= amount;
        this._save();
        return true;
    },

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

        if (this._resources.skins < info.costSkin) {
            return { success: false, reason: 'Нужно ' + info.costSkin + ' шкур (у вас ' + this._resources.skins + ')' };
        }

        if (this._resources.silver < info.costSilver) {
            return { success: false, reason: 'Нужно ' + info.costSilver + ' серебра' };
        }

        this._resources.silver -= info.costSilver;
        this._resources.skins -= info.costSkin;

        this._expansionLevel++;
        this._maxSlots = 10 + this._expansionLevel * 10;
        var player = Sherwood.getPlayer();
        player.bagSize = this._maxSlots;
        player.bagExpansion = this._expansionLevel;

        this._save();
        Sherwood.saveGame();
        return { success: true, newSlots: this._maxSlots, level: this._expansionLevel };
    },

    addItem: function(item) {
        if (!item) return false;
        
        var resKey = this._resourceIds[item.id];
        if (resKey) {
            this._resources[resKey] = (this._resources[resKey] || 0) + (item.quantity || 1);
            this._save();
            Sherwood.dispatch({ type: 'ITEM_ACQUIRED', payload: { item: item } });
            return true;
        }

        var maxStack = item.maxStack || 150;
        var quantity = item.quantity || 1;

        if (item.id) {
            for (var i = 0; i < this._inventory.length; i++) {
                var existing = this._inventory[i];
                if (existing.id === item.id && existing.name === item.name && (existing.quantity || 1) < maxStack) {
                    var space = maxStack - (existing.quantity || 1);
                    var add = Math.min(quantity, space);
                    existing.quantity = (existing.quantity || 1) + add;
                    quantity -= add;
                    if (quantity <= 0) {
                        this._save();
                        Sherwood.dispatch({ type: 'ITEM_ACQUIRED', payload: { item: item } });
                        return true;
                    }
                }
            }
        }

        while (quantity > 0) {
            if (this.isFull()) {
                Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: item } });
                return false;
            }
            var addQty = Math.min(quantity, maxStack);
            var newItem = Object.assign({}, item);
            newItem.quantity = addQty;
            newItem.maxStack = maxStack;
            this._inventory.push(newItem);
            quantity -= addQty;
        }

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

        if (part === 'ring' || part === 'amulet') {
            if (oldItem) {
                if (this.isFull()) {
                    Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: oldItem } });
                    return false;
                }
                this._inventory.push(oldItem);
            }
            this._equipment[part] = item;
            this._inventory.splice(index, 1);
            if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
            Sherwood.dispatch({ type: 'ITEM_EQUIPPED', payload: { part: part, item: item } });
            this._save();
            return true;
        }

        if (oldItem) {
            if (this.isFull()) {
                Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: oldItem } });
                return false;
            }
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

        if (this.isFull()) {
            Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: item } });
            return false;
        }

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
        var qty = item.quantity || 1;
        var totalPrice = price * qty;

        this._resources.silver += totalPrice;
        this._inventory.splice(index, 1);
        this._save();
        return { success: true, price: totalPrice };
    },

    addLoot: function(loot) {
        if (!loot) return;
        if (loot.gold) this._resources.gold += loot.gold;
        if (loot.silver) this._resources.silver += loot.silver;
        if (loot.exp) Sherwood.addExp(loot.exp);
        if (loot.items && loot.items.length > 0) {
            for (var i = 0; i < loot.items.length; i++) {
                this.addItem(loot.items[i]);
            }
        }
        if (loot.skins) this._resources.skins += loot.skins;
        if (loot.entranceTickets) this._resources.entranceTickets += loot.entranceTickets;
        if (loot.autoFightTickets) this._resources.autoFightTickets += loot.autoFightTickets;
        if (loot.amuletTablets) this._resources.amuletTablets += loot.amuletTablets;
        if (loot.ringTablets) this._resources.ringTablets += loot.ringTablets;
        if (loot.skinTablets) this._resources.skinTablets += loot.skinTablets;
        if (loot.portalToken1) this._resources.portalToken1 += loot.portalToken1;
        if (loot.portalToken2) this._resources.portalToken2 += loot.portalToken2;
        if (loot.portalToken3) this._resources.portalToken3 += loot.portalToken3;
        this._save();
    },

    getSkinCount: function() {
        return this._resources.skins;
    },

    _save: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        player.inventory = this._inventory;
        player.equipment = this._equipment;
        player.bagSize = this._maxSlots;
        player.bagExpansion = this._expansionLevel;
        player.bagResources = this._resources;
        if (player.resources) {
            player.resources.gold = this._resources.gold;
            player.resources.silver = this._resources.silver;
        }
        Sherwood.saveGame();
    }
};

/**
 * Sherwood Bag — Сумка
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

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

        if (!player.unlockedSkins || player.unlockedSkins.length === 0) {
            player.unlockedSkins = ['skin1_01'];
            player.activeSkin = 'skin1_01';
            Sherwood.saveGame();
        }

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

        for (var i = this._inventory.length - 1; i >= 0; i--) {
            var item = this._inventory[i];
            var resKey = this._resourceIds[item.id];
            if (resKey) {
                this._resources[resKey] = (this._resources[resKey] || 0) + (item.quantity || 1);
                this._inventory.splice(i, 1);
            }
        }

        for (var i = 0; i < this._inventory.length; i++) {
            if (!this._inventory[i].maxStack || this._inventory[i].maxStack < 100) {
                this._inventory[i].maxStack = 100;
            }
        }

        this._save();
        console.log('🎒 Сумка инициализирована');
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
    },

    // ========== UI ==========

    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Сумка', '🎒');
            }
            return;
        }
        UI._playSound('click');

        var items = this._inventory;
        var max = this._maxSlots;
        var resources = this._resources;
        var expInfo = this.getExpansionInfo();

        var h = '<div style="padding:10px;max-width:400px;margin:0 auto;">';

        // Ресурсы
        var resDefs = [
            { key: 'gold', icon: 'assets/interface/resource_gold.png' },
            { key: 'silver', icon: 'assets/interface/resource_silver.png' },
            { key: 'skins', icon: 'assets/interface/skin_of_the_sherwood_creature.png' },
            { key: 'entranceTickets', icon: 'assets/interface/resource_key_to_locked_levels.png' },
            { key: 'autoFightTickets', icon: 'assets/interface/ticket_autofight.png' },
            { key: 'amuletTablets', icon: 'assets/interface/amulet_crafting_tablet_resource.png' },
            { key: 'ringTablets', icon: 'assets/interface/ring_crafting_tablet_resource.png' },
            { key: 'skinTablets', icon: 'assets/interface/resource_appearance_crafting_tablet.png' },
            { key: 'portalToken1', icon: 'assets/interface/resource_token_on_entrance_portal_1.png' },
            { key: 'portalToken2', icon: 'assets/interface/resource_token_on_entrance_portal_2.png' },
            { key: 'portalToken3', icon: 'assets/interface/resource_token_on_entrance_portal_3.png' }
        ];

        h += '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-bottom:12px;">';
        for (var r = 0; r < resDefs.length; r++) {
            var rd = resDefs[r];
            var count = resources[rd.key] || 0;
            h += '<div style="position:relative;width:50px;height:50px;"><img src="assets/interface/visual_resource.png" style="width:100%;height:100%;object-fit:contain;"><img src="' + rd.icon + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'"><span style="position:absolute;top:0;right:2px;color:#fff;font-size:0.5em;font-weight:bold;text-shadow:0 1px 2px #000;">' + count + '</span></div>';
        }
        h += '</div>';

        h += '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;text-align:center;margin-bottom:6px;">📦 ' + items.length + '/' + max + ' ячеек</div>';

        // Расширение
        if (expInfo.canExpand) {
            h += '<button onclick="Sherwood.Bag._expandFromUI()" class="btn btn-gold" style="width:100%;padding:6px;font-size:0.75em;margin-bottom:10px;">⬆ Расширить +10 (' + expInfo.costSilver + ' сер. + ' + expInfo.costSkin + ' шкур)</button>';
        } else {
            h += '<div style="color:#666;font-size:0.7em;text-align:center;margin-bottom:10px;">Максимум 150 слотов</div>';
        }

        // Сетка предметов
        h += '<div id="bag-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
        for (var i = 0; i < max; i++) {
            var item = items[i];
            if (item) {
                var gc = Sherwood.GradeColors ? Sherwood.GradeColors[item.grade] : '#9d9d9d';
                h += '<div draggable="true" data-bag-index="' + i + '" ondragstart="Sherwood.Bag._dragStart(event,' + i + ')" ondragover="Sherwood.Bag._dragOver(event)" ondrop="Sherwood.Bag._drop(event,' + i + ')" onclick="Sherwood.Bag._action(' + i + ')" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:80px;height:80px;border:2px solid ' + gc + ';border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;padding:4px;">';
                h += '<img src="' + (item.icon || 'assets/interface/labyrinth_of_icons.png') + '" style="width:36px;height:36px;object-fit:contain;">';
                if (item.quantity > 1) {
                    h += '<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.6em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 6px;border-radius:4px;">' + item.quantity + '</span>';
                }
                h += '</div>';
            } else {
                h += '<div data-bag-index="' + i + '" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:80px;height:80px;border:2px solid #555;border-radius:8px;"></div>';
            }
        }
        h += '</div>';

        h += '<div id="bag-info" style="text-align:center;color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:12px;min-height:24px;">Нажми на предмет</div>';
        h += '</div>';

        UI._openScreenScrollable('🎒 Сумка', 'bag', h);
    },

    _dragStart: function(e, index) {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
    },

    _dragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    _drop: function(e, targetIndex) {
        e.preventDefault();
        var sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;
        var items = this._inventory;
        if (sourceIndex >= items.length) return;
        var sourceItem = items[sourceIndex];
        var targetItem = items[targetIndex];

        if (targetItem && sourceItem.id === targetItem.id && sourceItem.name === targetItem.name) {
            var maxStack = sourceItem.maxStack || 100;
            var totalQty = (sourceItem.quantity || 1) + (targetItem.quantity || 1);
            if (totalQty <= maxStack) {
                targetItem.quantity = totalQty;
                items.splice(sourceIndex, 1);
            } else {
                targetItem.quantity = maxStack;
                sourceItem.quantity = totalQty - maxStack;
            }
        } else {
            items[sourceIndex] = targetItem;
            items[targetIndex] = sourceItem;
        }
        this._save();
        this.showUI();
    },

    _expandFromUI: function() {
        var r = this.expandBag();
        var info = document.getElementById('bag-info');
        if (r.success) {
            if (info) info.textContent = '✅ Сумка расширена до ' + r.newSlots + ' ячеек!';
            UI.updateDisplay();
            this.showUI();
        } else {
            if (info) info.textContent = '❌ ' + (r.reason || 'Ошибка');
            UI._showToast(r.reason || 'Ошибка');
        }
    },

    _action: function(i) {
        var items = this._inventory;
        if (i >= items.length) return;
        var item = items[i];
        if (!item) return;
        var info = document.getElementById('bag-info');
        if (!info) return;

        var a = '';
        if (item.part) {
            a += '<button onclick="Sherwood.Bag.equipItem(' + i + ');Sherwood.Bag.showUI();" style="background:#4caf50;border:none;border-radius:6px;padding:4px 12px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;font-size:0.7em;">🔧 Надеть</button>';
        }
        a += '<button onclick="Sherwood.Bag.sellItem(' + i + ');Sherwood.Bag.showUI();" style="background:#ff9800;border:none;border-radius:6px;padding:4px 12px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;font-size:0.7em;">💰 Продать</button>';
        a += '<button onclick="Sherwood.Bag.discardItem(' + i + ');Sherwood.Bag.showUI();" style="background:#f44336;border:none;border-radius:6px;padding:4px 12px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;font-size:0.7em;">🗑️ Выкинуть</button>';

        info.innerHTML = '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;">' + (item.name || 'Предмет') + '</div><div style="color:#aaa;font-size:0.7em;">' + (item.grade || 'обычный') + ' x' + (item.quantity || 1) + '</div><div style="margin-top:6px;">' + a + '</div>';
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Bag = Sherwood.Bag;

console.log('🎒 Сумка загружена!');

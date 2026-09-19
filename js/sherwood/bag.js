/**
 * Sherwood Bag — Сумка
 *  — +5 ячеек за уровень игрока
 *  — весь лут (кроме золота/серебра) падает в ячейки, стак 100
 *  — UI: только сетка ячеек, без верхних ресурсов, фон не растягивается
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

// Скрываем скроллбар у .bag-scroll
(function() {
    var s = document.createElement('style');
    s.textContent = '.bag-scroll::-webkit-scrollbar{width:0;height:0;background:transparent;} .bag-scroll{-ms-overflow-style:none;scrollbar-width:none;}';
    document.head.appendChild(s);
})();

Sherwood.Bag = {
    _inventory: [],
    _equipment: { head: null, torso: null, hands: null, legs: null, feet: null, weapon1: null, weapon2: null, belt: null, amulet: null, ring: null },
    _maxSlots: 25,
    _expansionLevel: 0,

    // Золото/серебро живут в player.resources, здесь — только для совместимости
    _resources: {
        gold: 0,
        silver: 0
    },

    // Описание предметов, в которые превращаются бывшие "ресурсы"
    _resourceDefs: {
        skins:            { id: 'skin_of_the_sherwood_creature', name: 'Шкура шервудского зверя', icon: 'assets/interface/skin_of_the_sherwood_creature.png', maxStack: 100, sellPrice: 3 },
        entranceTickets:  { id: 'entrance_ticket', name: 'Ключ от закрытого уровня', icon: 'assets/interface/resource_key_to_locked_levels.png', maxStack: 100, sellPrice: 10 },
        autoFightTickets: { id: 'autofight_ticket', name: 'Билет авто-боя', icon: 'assets/interface/ticket_autofight.png', maxStack: 100, sellPrice: 5 },
        amuletTablets:    { id: 'amulet_tablet', name: 'Амулетная табличка', icon: 'assets/interface/amulet_crafting_tablet_resource.png', maxStack: 100, sellPrice: 8 },
        ringTablets:      { id: 'ring_tablet', name: 'Кольцевая табличка', icon: 'assets/interface/ring_crafting_tablet_resource.png', maxStack: 100, sellPrice: 8 },
        skinTablets:      { id: 'skin_tablet', name: 'Табличка внешности', icon: 'assets/interface/resource_appearance_crafting_tablet.png', maxStack: 100, sellPrice: 8 },
        skinDrawings:     { id: 'skin_drawing', name: 'Чертёж облика', icon: 'assets/interface/skin_drawing.png', maxStack: 100, sellPrice: 12 },
        portalToken1:     { id: 'portal_token_1', name: 'Токен портала I', icon: 'assets/interface/resource_token_on_entrance_portal_1.png', maxStack: 100, sellPrice: 20 },
        portalToken2:     { id: 'portal_token_2', name: 'Токен портала II', icon: 'assets/interface/resource_token_on_entrance_portal_2.png', maxStack: 100, sellPrice: 40 },
        portalToken3:     { id: 'portal_token_3', name: 'Токен портала III', icon: 'assets/interface/resource_token_on_entrance_portal_3.png', maxStack: 100, sellPrice: 80 },
        branchDamnedYew:  { id: 'branch_damned_yew', name: 'Ветвь проклятого тиса', icon: 'assets/interface/branch_of_the_damned_yew.png', maxStack: 100, sellPrice: 15 }
    },

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;

        this._inventory = player.inventory || [];
        this._equipment = player.equipment || this._equipment;

        // +5 ячеек за уровень
        this._recalcMaxSlots();

        // Стартовые облики
        if (!player.unlockedSkins || player.unlockedSkins.length === 0) {
            player.unlockedSkins = [
                'skin1_01', 'skin1_02', 'skin1_03',
                'skin2_01', 'skin2_02', 'skin2_03',
                'skin3_01', 'skin3_02', 'skin3_03',
                'skin4_01', 'skin4_02', 'skin4_03',
                'skin5_01', 'skin5_02', 'skin5_03',
                'skin6_01', 'skin6_02', 'skin6_03',
                'skin7_01', 'skin7_02', 'skin7_03',
                'skin8_01', 'skin8_02', 'skin8_03',
                'skin9_01', 'skin9_02', 'skin9_03',
                'skin10_01', 'skin10_02', 'skin10_03',
                'skin11_01', 'skin11_02', 'skin11_03',
                'skin12_01', 'skin12_02', 'skin12_03',
                'skin13_01', 'skin13_02', 'skin13_03',
                'skin14_01', 'skin14_02', 'skin14_03',
                'skin15_01', 'skin15_02', 'skin15_03',
                'skin16_01', 'skin16_02', 'skin16_03',
                'bonus_skin_2', 'bonus_skin_4', 'bonus_skin_6',
                'bonus_skin_8', 'bonus_skin_10', 'bonus_skin_12',
                'bonus_skin_14', 'bonus_skin_sec'
            ];
            player.activeSkin = 'skin1_01';
            Sherwood.saveGame();
        }

        // Золото/серебро — из player.resources
        this._resources.gold = player.resources ? (player.resources.gold || 0) : 0;
        this._resources.silver = player.resources ? (player.resources.silver || 0) : 0;

        // Конвертация старых bagResources в предметы
        if (player.bagResources) {
            var oldRes = player.bagResources;
            var mapToDef = {
                skins: 'skins',
                entranceTickets: 'entranceTickets',
                autoFightTickets: 'autoFightTickets',
                amuletTablets: 'amuletTablets',
                ringTablets: 'ringTablets',
                skinTablets: 'skinTablets',
                skinDrawings: 'skinDrawings',
                portalToken1: 'portalToken1',
                portalToken2: 'portalToken2',
                portalToken3: 'portalToken3',
                branchDamnedYew: 'branchDamnedYew'
            };
            for (var oldKey in mapToDef) {
                var count = oldRes[oldKey] || 0;
                if (count > 0) {
                    this._addAsItem(mapToDef[oldKey], count);
                }
            }
            delete player.bagResources;
        }

        // Стак не больше 100
        for (var i = 0; i < this._inventory.length; i++) {
            if (!this._inventory[i].maxStack || this._inventory[i].maxStack > 100) {
                this._inventory[i].maxStack = 100;
            }
            if (this._inventory[i].quantity > 100) {
                var extra = this._inventory[i].quantity - 100;
                this._inventory[i].quantity = 100;
                this._addAsItem(this._inventory[i].resKey || null, extra);
            }
        }

        this._save();
        console.log('🎒 Сумка инициализирована: ' + this._maxSlots + ' слотов (уровень ' + (player.level || 1) + ')');
    },

    _recalcMaxSlots: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        var lvl = player.level || 1;
        // База 20 + 5 за каждый уровень
        this._maxSlots = 20 + (lvl - 1) * 5;
        player.bagSize = this._maxSlots;
    },

    // Добавить "ресурс" как предмет в ячейки (стак 100)
    _addAsItem: function(defKey, amount) {
        if (!amount || amount <= 0) return;
        var def = this._resourceDefs[defKey];
        if (!def) return;

        var remaining = amount;
        var maxStack = 100;

        // Сначала доливаем в существующие стаки
        for (var i = 0; i < this._inventory.length && remaining > 0; i++) {
            var it = this._inventory[i];
            if (it.id === def.id && (it.quantity || 1) < maxStack) {
                var space = maxStack - (it.quantity || 1);
                var add = Math.min(remaining, space);
                it.quantity = (it.quantity || 1) + add;
                remaining -= add;
            }
        }

        // Новые ячейки
        while (remaining > 0) {
            if (this._inventory.length >= this._maxSlots) {
                if (Sherwood.dispatch) Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: def } });
                break;
            }
            var put = Math.min(remaining, maxStack);
            this._inventory.push({
                id: def.id,
                name: def.name,
                icon: def.icon,
                quantity: put,
                maxStack: maxStack,
                sellPrice: def.sellPrice,
                resKey: defKey
            });
            remaining -= put;
        }
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

        // Золото/серебро — в player.resources
        if (type === 'gold' || type === 'silver') {
            this._resources[type] = (this._resources[type] || 0) + amount;
            var player = Sherwood.getPlayer();
            if (player) {
                if (!player.resources) player.resources = {};
                player.resources[type] = (player.resources[type] || 0) + amount;
            }
            this._save();
            return;
        }

        // Остальное — как предметы в ячейки
        if (this._resourceDefs[type]) {
            this._addAsItem(type, amount);
            this._save();
            if (Sherwood.dispatch) Sherwood.dispatch({ type: 'RESOURCE_CHANGED' });
            return;
        }

        // Неизвестный ресурс — просто в _resources
        this._resources[type] = (this._resources[type] || 0) + amount;
        this._save();
    },

    spendResource: function(type, amount) {
        if ((this._resources[type] || 0) < amount) return false;
        this._resources[type] -= amount;
        this._save();
        return true;
    },

    getExpansionInfo: function() {
        return {
            current: this._maxSlots,
            level: this._expansionLevel,
            canExpand: false,
            costSkin: 0,
            costSilver: 0,
            nextSlots: this._maxSlots
        };
    },

    expandBag: function() {
        return { success: false, reason: 'Ячейки расширяются автоматически при повышении уровня (+5 за уровень)' };
    },

    addItem: function(item) {
        if (!item) return false;

        // Если это известный ресурс по id — кладём как наш стандартный предмет
        for (var key in this._resourceDefs) {
            if (this._resourceDefs[key].id === item.id) {
                this._addAsItem(key, item.quantity || 1);
                this._save();
                if (Sherwood.dispatch) Sherwood.dispatch({ type: 'ITEM_ACQUIRED', payload: { item: item } });
                return true;
            }
        }

        var maxStack = item.maxStack || 100;
        if (maxStack > 100) maxStack = 100;
        var quantity = item.quantity || 1;

        // Сначала доливаем в существующие стаки
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
                        if (Sherwood.dispatch) Sherwood.dispatch({ type: 'ITEM_ACQUIRED', payload: { item: item } });
                        return true;
                    }
                }
            }
        }

        while (quantity > 0) {
            if (this.isFull()) {
                if (Sherwood.dispatch) Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: item } });
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
        if (Sherwood.dispatch) Sherwood.dispatch({ type: 'ITEM_ACQUIRED', payload: { item: item } });
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

        if (oldItem) {
            if (this.isFull()) {
                if (Sherwood.dispatch) Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: oldItem } });
                return false;
            }
            this._inventory.push(oldItem);
        }

        this._equipment[part] = item;
        this._inventory.splice(index, 1);
        if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
        if (Sherwood.dispatch) Sherwood.dispatch({ type: 'ITEM_EQUIPPED', payload: { part: part, item: item } });
        this._save();
        return true;
    },

    unequipItem: function(part) {
        if (!part || !this._equipment[part]) return false;
        var item = this._equipment[part];
        if (this.isFull()) {
            if (Sherwood.dispatch) Sherwood.dispatch({ type: 'BAG_FULL', payload: { item: item } });
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
        var player = Sherwood.getPlayer();
        if (player) {
            if (!player.resources) player.resources = {};
            player.resources.silver = (player.resources.silver || 0) + totalPrice;
        }
        this._inventory.splice(index, 1);
        this._save();
        return { success: true, price: totalPrice };
    },

    addLoot: function(loot) {
        if (!loot) return;
        if (loot.gold) this.addResource('gold', loot.gold);
        if (loot.silver) this.addResource('silver', loot.silver);
        if (loot.exp && Sherwood.addExp) Sherwood.addExp(loot.exp);

        // Ресурсы — как предметы
        if (loot.skins)           this._addAsItem('skins', loot.skins);
        if (loot.entranceTickets) this._addAsItem('entranceTickets', loot.entranceTickets);
        if (loot.autoFightTickets)this._addAsItem('autoFightTickets', loot.autoFightTickets);
        if (loot.amuletTablets)   this._addAsItem('amuletTablets', loot.amuletTablets);
        if (loot.ringTablets)     this._addAsItem('ringTablets', loot.ringTablets);
        if (loot.skinTablets)     this._addAsItem('skinTablets', loot.skinTablets);
        if (loot.skinDrawings)    this._addAsItem('skinDrawings', loot.skinDrawings);
        if (loot.portalToken1)    this._addAsItem('portalToken1', loot.portalToken1);
        if (loot.portalToken2)    this._addAsItem('portalToken2', loot.portalToken2);
        if (loot.portalToken3)    this._addAsItem('portalToken3', loot.portalToken3);
        if (loot.branchDamnedYew) this._addAsItem('branchDamnedYew', loot.branchDamnedYew);

        // Произвольные предметы
        if (loot.items && loot.items.length > 0) {
            for (var i = 0; i < loot.items.length; i++) {
                this.addItem(loot.items[i]);
            }
        }
        this._save();
    },

    getSkinCount: function() {
        var total = 0;
        for (var i = 0; i < this._inventory.length; i++) {
            if (this._inventory[i].id === 'skin_of_the_sherwood_creature') {
                total += this._inventory[i].quantity || 0;
            }
        }
        return total;
    },

    _save: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        player.inventory = this._inventory;
        player.equipment = this._equipment;
        player.bagSize = this._maxSlots;
        if (player.resources) {
            player.resources.gold = this._resources.gold;
            player.resources.silver = this._resources.silver;
        }
        Sherwood.saveGame();
    },

    // ========== UI ==========
    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') showGenericScreen('Сумка', '🎒');
            return;
        }
        UI._playSound('click');

        this._recalcMaxSlots();

        var items = this._inventory;
        var max = this._maxSlots;

        // Фон fixed — не растягивается при скролле
        var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/backgrounds/bag.png\') center/cover no-repeat fixed;overflow:hidden;">';

        // Шапка со счётчиком
        h += '<div style="position:absolute;top:56px;left:0;right:0;text-align:center;color:#e0c080;font-size:0.9em;font-weight:bold;text-shadow:0 2px 4px #000;z-index:5;padding:6px 0;">📦 ' + items.length + ' / ' + max + ' ячеек</div>';

        // Скролл-контейнер с сеткой
        h += '<div class="bag-scroll" style="position:absolute;top:96px;left:0;right:0;bottom:0;overflow-y:auto;padding:10px 12px 20px 12px;">';

        h += '<div id="bag-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;justify-items:center;">';
        for (var i = 0; i < max; i++) {
            var item = items[i];
            if (item) {
                var gc = Sherwood.GradeColors ? (Sherwood.GradeColors[item.grade] || '#9d9d9d') : '#9d9d9d';
                h += '<div draggable="true" data-bag-index="' + i + '" ondragstart="Sherwood.Bag._dragStart(event,' + i + ')" ondragover="Sherwood.Bag._dragOver(event)" ondrop="Sherwood.Bag._drop(event,' + i + ')" onclick="Sherwood.Bag._action(' + i + ')" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:80px;height:80px;border:2px solid ' + gc + ';border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:pointer;padding:4px;">';
                h += '<img src="' + (item.icon || 'assets/interface/labyrinth_of_icons.png') + '" style="width:36px;height:36px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                if ((item.quantity || 1) > 1) {
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

        h += '</div>';

        // Отключаем скролл родительского слоя — крутится только сетка
        try {
            if (UI._screenLayer) UI._screenLayer.style.overflow = 'hidden';
        } catch(e) {}

        UI._openScreenScrollable('🎒 Сумка', null, h);
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
            var maxStack = Math.min(sourceItem.maxStack || 100, 100);
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

/**
 * Sherwood Bag — Сумка */

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
    _maxSlots: 10,
    _expansionLevel: 0,

    // Золото/серебро живут в player.resources, здесь — только для совместимости
    _resources: {
        gold: 0,
        silver: 0
    },

    // Описание предметов, в которые превращаются бывшие "ресурсы"
    _resourceDefs: {
        skins:            { id: 'skin_of_the_sherwood_creature', name: 'Шкура шервудского зверя', icon: 'assets/interface/skin_of_the_sherwood_creature.png', maxStack: 50, sellPrice: 3 },
        entranceTickets:  { id: 'entrance_ticket', name: 'Ключ от закрытого уровня', icon: 'assets/interface/resource_key_to_locked_levels.png', maxStack: 50, sellPrice: 10 },
        autoFightTickets: { id: 'autofight_ticket', name: 'Билет авто-боя', icon: 'assets/interface/ticket_autofight.png', maxStack: 50, sellPrice: 5 },
        amuletTablets:    { id: 'amulet_tablet', name: 'Амулетная табличка', icon: 'assets/interface/amulet_crafting_tablet_resource.png', maxStack: 50, sellPrice: 8 },
        ringTablets:      { id: 'ring_tablet', name: 'Кольцевая табличка', icon: 'assets/interface/ring_crafting_tablet_resource.png', maxStack: 50, sellPrice: 8 },
        skinTablets:      { id: 'skin_tablet', name: 'Табличка внешности', icon: 'assets/interface/resource_appearance_crafting_tablet.png', maxStack: 50, sellPrice: 8 },
        skinDrawings:     { id: 'skin_drawing', name: 'Чертёж облика', icon: 'assets/interface/skin_drawing.png', maxStack: 50, sellPrice: 12 },
        portalToken1:     { id: 'portal_token_1', name: 'Токен портала I', icon: 'assets/interface/resource_token_on_entrance_portal_1.png', maxStack: 50, sellPrice: 20 },
        portalToken2:     { id: 'portal_token_2', name: 'Токен портала II', icon: 'assets/interface/resource_token_on_entrance_portal_2.png', maxStack: 50, sellPrice: 40 },
        portalToken3:     { id: 'portal_token_3', name: 'Токен портала III', icon: 'assets/interface/resource_token_on_entrance_portal_3.png', maxStack: 50, sellPrice: 80 },
        branchDamnedYew:  { id: 'branch_damned_yew', name: 'Ветвь проклятого тиса', icon: 'assets/interface/branch_of_the_damned_yew.png', maxStack: 50, sellPrice: 15 },
        arrows:           { id: 'sherwood_arrow', name: 'Шервудская стрела', icon: 'assets/interface/sherwood_hollow_arrow.png', maxStack: 50, sellPrice: 2 }
    },

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;

        this._inventory = player.inventory || [];
        this._equipment = player.equipment || this._equipment;

        // Если bagSize уже сохранён — берём его, иначе 10
        this._maxSlots = player.bagSize || 10;
        player.bagSize = this._maxSlots;

        // Стартовые облики
        if (!player.unlockedSkins || player.unlockedSkins.length === 0) {
                        player.unlockedSkins = [
                'skin1_01', 'skin9_01', 'skin8_01', 'skin4_01', 'skin16_03', 'bonus_skin_sec'
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

        // ===== СТАРТОВЫЕ ПРЕДМЕТЫ =====
        var hasAnyEntrance = false;
        var hasAnyAutoFight = false;
        var hasAnyPortalToken = false;
        for (var i = 0; i < this._inventory.length; i++) {
            if (this._inventory[i].id === 'entrance_ticket') hasAnyEntrance = true;
            if (this._inventory[i].id === 'autofight_ticket') hasAnyAutoFight = true;
            if (this._inventory[i].id === 'portal_token_1') hasAnyPortalToken = true;
        }
        if (!hasAnyEntrance && !player._starterTicketsGiven) {
            this._addAsItem('entranceTickets', 20);
        }
        if (!hasAnyAutoFight && !player._starterAutoFightGiven) {
            this._addAsItem('autoFightTickets', 10);
        }
        if (!hasAnyPortalToken && !player._starterPortalTokenGiven) {
            this._addAsItem('portalToken1', 10);
        }
        // Помечаем, чтобы не выдавать повторно
        player._starterTicketsGiven = true;
        player._starterAutoFightGiven = true;
        player._starterPortalTokenGiven = true;
        // ==============================

        // ===== РЕГЕНЕРАЦИЯ КЛЮЧЕЙ ПОДЗЕМКИ =====
        this._initTicketRegen(player);
        // =========================================

        // Стак не больше 50
        for (var i = 0; i < this._inventory.length; i++) {
            if (!this._inventory[i].maxStack || this._inventory[i].maxStack > 50) {
                this._inventory[i].maxStack = 50;
            }
            if (this._inventory[i].quantity > 50) {
                var extra = this._inventory[i].quantity - 50;
                this._inventory[i].quantity = 50;
                this._addAsItem(this._inventory[i].resKey || null, extra);
            }
        }

        this._save();
        console.log('🎒 Сумка инициализирована: ' + this._maxSlots + ' слотов');
    },

    _initTicketRegen: function(player) {
        if (!player.ticketRegen) {
            player.ticketRegen = {
                lastRegenTime: Date.now(),
                maxTickets: 10,
                regenIntervalMs: 40 * 60 * 1000 // 40 минут
            };
        }
        // Проверяем прямо сейчас
        this._checkTicketRegen();
    },

    _checkTicketRegen: function() {
        var player = Sherwood.getPlayer();
        if (!player || !player.ticketRegen) return;

        var regen = player.ticketRegen;
        var now = Date.now();
        var elapsed = now - regen.lastRegenTime;
        var interval = regen.regenIntervalMs;
        var max = regen.maxTickets;

        var currentCount = this.getTicketCount('entrance');

        if (currentCount >= max) {
            // Если уже максимум — просто сбрасываем таймер на "сейчас", чтобы не копилось
            regen.lastRegenTime = now;
            return;
        }

        if (elapsed >= interval) {
            var ticketsToAdd = Math.floor(elapsed / interval);
            var canAdd = Math.min(ticketsToAdd, max - currentCount);
            if (canAdd > 0) {
                this._addAsItem('entranceTickets', canAdd);
                // Сдвигаем время на количество добавленных интервалов
                regen.lastRegenTime = now - (elapsed % interval);
                this._save();
                console.log('🔑 Начислено ' + canAdd + ' ключей подземки (регенерация)');
            }
            // Если после добавления всё равно меньше максимума — таймер сдвинут правильно
            if (this.getTicketCount('entrance') >= max) {
                regen.lastRegenTime = now;
            }
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
        var costSkins = 1000;
        var nextSlots = this._maxSlots + 5;
        return {
            current: this._maxSlots,
            level: this._expansionLevel,
            canExpand: true,
            costSkins: costSkins,
            costGold: costSkins * 15,
            nextSlots: nextSlots
        };
    },

    expandBag: function() {
        var costSkins = 1000;
        var player = Sherwood.getPlayer();
        if (!player) return { success: false, reason: 'Ошибка игрока' };

        var totalSkins = this.getSkinCount();
        if (totalSkins < costSkins) {
            return { success: false, reason: 'Не хватает шкур! Нужно 1000, у вас ' + totalSkins };
        }

        // Списываем 1000 шкур
        this._removeSkins(costSkins);

        // Добавляем 5 ячеек
        this._maxSlots += 5;
        player.bagSize = this._maxSlots;
        this._expansionLevel++;
        this._save();
        return { success: true, newMaxSlots: this._maxSlots };
    },

    _removeSkins: function(amount) {
        var remaining = amount;
        for (var i = this._inventory.length - 1; i >= 0 && remaining > 0; i--) {
            var it = this._inventory[i];
            if (it.id === 'skin_of_the_sherwood_creature') {
                var qty = it.quantity || 1;
                if (qty <= remaining) {
                    this._inventory.splice(i, 1);
                    remaining -= qty;
                } else {
                    it.quantity -= remaining;
                    remaining = 0;
                }
            }
        }
        this._save();
    },

    buySkins: function(count) {
        var costGold = count * 15;
        var player = Sherwood.getPlayer();
        if (!player) return { success: false, reason: 'Ошибка игрока' };
        if ((player.resources.gold || 0) < costGold) {
            return { success: false, reason: 'Не хватает золота! Нужно ' + costGold };
        }
        player.resources.gold -= costGold;
        this._resources.gold -= costGold;
        this._addAsItem('skins', count);
        this._save();
        return { success: true, bought: count, cost: costGold };
    },

    // Добавить "ресурс" как предмет в ячейки (стак 50)
    _addAsItem: function(defKey, amount) {
        if (!amount || amount <= 0) return;
        var def = this._resourceDefs[defKey];
        if (!def) return;

        var remaining = amount;
        var maxStack = 50;

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

        var maxStack = item.maxStack || 50;
        if (maxStack > 50) maxStack = 50;
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

    sellItem: function(index, amount) {
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item) return false;

        var qty = item.quantity || 1;
        if (typeof amount === 'undefined' || amount > qty) amount = qty;

        var price = item.sellPrice || 5;
        var totalPrice = price * amount;

        this._resources.silver += totalPrice;
        var player = Sherwood.getPlayer();
        if (player) {
            if (!player.resources) player.resources = {};
            player.resources.silver = (player.resources.silver || 0) + totalPrice;
        }

        if (amount >= qty) {
            this._inventory.splice(index, 1);
        } else {
            item.quantity -= amount;
        }

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
        if (loot.arrows)          this._addAsItem('arrows', loot.arrows);

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

    getTicketCount: function(type) {
        var total = 0;
        var targetId = type === 'entrance' ? 'entrance_ticket' : (type === 'autofight' ? 'autofight_ticket' : 'portal_token_1');
        for (var i = 0; i < this._inventory.length; i++) {
            if (this._inventory[i].id === targetId) {
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

        // Перед открытием проверяем регенерацию
        this._checkTicketRegen();

        var items = this._inventory;
        var max = this._maxSlots;
        var skinsCount = this.getSkinCount();
        var entranceCount = this.getTicketCount('entrance');
        var autofightCount = this.getTicketCount('autofight');
        var portalTokenCount = this.getTicketCount('portal');

        // Фон fixed — не растягивается при скролле
        var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:url(\'assets/assets2/backgrounds/bag.png\') center/cover no-repeat fixed;overflow:hidden;">';

        // Шапка с ресурсами
        h += '<div style="position:absolute;top:56px;left:0;right:0;text-align:center;color:#e0c080;font-size:0.8em;font-weight:bold;text-shadow:0 2px 4px #000;z-index:5;padding:6px 0;display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">';
        h += '<span>🪙 ' + this._resources.gold + '</span>';
        h += '<span>🥈 ' + this._resources.silver + '</span>';
        h += '<span>🐺 ' + skinsCount + '</span>';
        h += '<span>🔑 ' + entranceCount + '</span>';
        h += '<span>⚔️ ' + autofightCount + '</span>';
        h += '<span>🔮 ' + portalTokenCount + '</span>';
        h += '</div>';

        // Счётчик ячеек чуть ниже
        h += '<div style="position:absolute;top:90px;left:0;right:0;text-align:center;color:#aaa;font-size:0.75em;z-index:5;padding:4px 0;">📦 ' + items.length + ' / ' + max + ' ячеек</div>';

        // Скролл-контейнер с сеткой
        h += '<div class="bag-scroll" style="position:absolute;top:120px;left:0;right:0;bottom:0;overflow-y:auto;padding:10px 12px 20px 12px;">';

        h += '<div id="bag-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;justify-items:center;">';
        for (var i = 0; i < max; i++) {
            var item = items[i];
            if (item) {
                var gc = Sherwood.GradeColors ? (Sherwood.GradeColors[item.grade] || '#9d9d9d') : '#9d9d9d';
                h += '<div draggable="true" data-bag-index="' + i + '" ondragstart="Sherwood.Bag._dragStart(event,' + i + ')" ondragover="Sherwood.Bag._dragOver(event)" ondragleave="Sherwood.Bag._dragLeave(event)" ondrop="Sherwood.Bag._drop(event,' + i + ')" onclick="Sherwood.Bag._action(' + i + ')" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:80px;height:80px;border:2px solid ' + gc + ';border-radius:8px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;cursor:grab;padding:4px;transition: border-color 0.15s;">';
                h += '<img src="' + (item.icon || 'assets/interface/labyrinth_of_icons.png') + '" style="width:36px;height:36px;object-fit:contain;pointer-events:none;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                if ((item.quantity || 1) > 1) {
                    h += '<span style="position:absolute;bottom:2px;right:4px;color:#fff;font-size:0.6em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 6px;border-radius:4px;pointer-events:none;">' + item.quantity + '</span>';
                }
                h += '</div>';
            } else {
                h += '<div data-bag-index="' + i + '" ondragover="Sherwood.Bag._dragOver(event)" ondragleave="Sherwood.Bag._dragLeave(event)" ondrop="Sherwood.Bag._drop(event,' + i + ')" style="background:url(\'assets/interface/bag_cell.png\') center/contain no-repeat;background-size:cover;width:80px;height:80px;border:2px solid #555;border-radius:8px;transition: border-color 0.15s;"></div>';
            }
        }
        h += '</div>';

        // ===== КНОПКА РАСШИРЕНИЯ =====
        h += '<div style="margin-top:16px;text-align:center;">';
        h += '<button onclick="Sherwood.Bag._showExpandUI()" style="background:linear-gradient(180deg,#6b5a3a,#3a2e1a);border:2px solid #c8a050;border-radius:8px;padding:10px 24px;color:#ffd27a;font-size:0.85em;font-weight:bold;cursor:pointer;box-shadow:0 0 15px rgba(200,160,80,0.4);">📦 Расширить сумку</button>';
        h += '<div style="color:#888;font-size:0.65em;margin-top:4px;">5 ячеек за 1000 🐺 шкур</div>';
        h += '</div>';

        h += '<div id="bag-info" style="text-align:center;color:#e0c080;font-size:0.8em;font-weight:bold;margin-top:12px;min-height:24px;">Нажми на предмет</div>';
        h += '</div>';

        h += '</div>';

        // Отключаем скролл родительского слоя — крутится только сетка
        try {
            if (UI._screenLayer) UI._screenLayer.style.overflow = 'hidden';
        } catch(e) {}

        UI._openScreenScrollable('🎒 Сумка', null, h, 'UI.profile()');
    },

    _showExpandUI: function() {
        var info = document.getElementById('bag-info');
        if (!info) return;

        var costSkins = 1000;
        var totalSkins = this.getSkinCount();
        var missing = Math.max(0, costSkins - totalSkins);
        var buyCost = missing * 15;

        var h = '<div style="background:rgba(0,0,0,0.6);border:2px solid #c8a050;border-radius:8px;padding:12px;margin-top:8px;text-align:left;">';
        h += '<div style="color:#ffd27a;font-size:0.9em;font-weight:bold;text-align:center;margin-bottom:8px;">📦 Расширение сумки</div>';
        h += '<div style="color:#fff;font-size:0.75em;margin-bottom:4px;">Текущие ячейки: <b>' + this._maxSlots + '</b></div>';
        h += '<div style="color:#fff;font-size:0.75em;margin-bottom:4px;">Шкур в сумке: <b>' + totalSkins + '</b> / 1000</div>';

        if (totalSkins >= costSkins) {
            h += '<div style="color:#4caf50;font-size:0.75em;margin-bottom:8px;">✅ Достаточно шкур для расширения!</div>';
            h += '<button onclick="var r=Sherwood.Bag.expandBag();if(r.success){UI._showToast(\'Сумка расширена до \'+r.newMaxSlots+\' ячеек!\');Sherwood.Bag.showUI();}else{UI._showToast(r.reason);}" style="width:100%;background:#4caf50;border:none;border-radius:6px;padding:8px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.8em;">✅ Расширить на 5 ячеек (1000 🐺)</button>';
        } else {
            h += '<div style="color:#ff5555;font-size:0.75em;margin-bottom:8px;">Не хватает <b>' + missing + '</b> шкур</div>';
            h += '<div style="color:#fff;font-size:0.75em;margin-bottom:8px;">Докупить ' + missing + ' шт. за <b>' + buyCost + '</b> 🪙 золота?</div>';
            h += '<button onclick="var r=Sherwood.Bag.buySkins(' + missing + ');if(r.success){UI._showToast(\'Куплено \'+r.bought+\' шкур за \'+r.cost+\' золота\');Sherwood.Bag._showExpandUI();}else{UI._showToast(r.reason);}" style="width:100%;background:#ff9800;border:none;border-radius:6px;padding:8px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.8em;margin-bottom:6px;">💰 Докупить за ' + buyCost + ' 🪙</button>';
            h += '<div style="color:#888;font-size:0.65em;text-align:center;">1 шкура = 15 золота</div>';
        }

        h += '<button onclick="document.getElementById(\'bag-info\').innerHTML=\'\';" style="width:100%;background:#555;border:none;border-radius:6px;padding:6px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.75em;margin-top:6px;">Отмена</button>';
        h += '</div>';

        info.innerHTML = h;
    },

    _dragStart: function(e, index) {
        e.dataTransfer.setData('text/plain', index);
        e.dataTransfer.effectAllowed = 'move';
    },

    _dragOver: function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        // Визуальная подсветка
        if (e.currentTarget) {
            e.currentTarget.style.borderColor = '#ffd700';
        }
    },

    _dragLeave: function(e) {
        // Убираем подсветку
        if (e.currentTarget) {
            var item = this._inventory[parseInt(e.currentTarget.dataset.bagIndex)];
            var gc = item && Sherwood.GradeColors ? (Sherwood.GradeColors[item.grade] || '#9d9d9d') : '#9d9d9d';
            e.currentTarget.style.borderColor = item ? gc : '#555';
        }
    },

    _drop: function(e, targetIndex) {
        e.preventDefault();
        
        // Убираем подсветку у целевой ячейки
        if (e.currentTarget) {
            var tItem = this._inventory[targetIndex];
            var gc = tItem && Sherwood.GradeColors ? (Sherwood.GradeColors[tItem.grade] || '#9d9d9d') : '#9d9d9d';
            e.currentTarget.style.borderColor = tItem ? gc : '#555';
        }

        var sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;
        
        var items = this._inventory;
        if (sourceIndex >= items.length) return;
        var sourceItem = items[sourceIndex];
        var targetItem = items[targetIndex];

        // Если оба предмета одинаковые — объединяем стаки
        if (targetItem && sourceItem.id === targetItem.id && sourceItem.name === targetItem.name) {
            var maxStack = Math.min(sourceItem.maxStack || 50, 50);
            var totalQty = (sourceItem.quantity || 1) + (targetItem.quantity || 1);
            if (totalQty <= maxStack) {
                targetItem.quantity = totalQty;
                items.splice(sourceIndex, 1);
            } else {
                targetItem.quantity = maxStack;
                sourceItem.quantity = totalQty - maxStack;
            }
        } else {
            // Меняем местами (или переносим в пустую)
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

        // Кнопка "Надеть" (если экипировка)
        var a = '';
        if (item.part) {
            a += '<button onclick="Sherwood.Bag.equipItem(' + i + ');Sherwood.Bag.showUI();" style="background:#4caf50;border:none;border-radius:6px;padding:4px 12px;color:#fff;font-weight:bold;cursor:pointer;margin:0 4px;font-size:0.7em;">🔧 Надеть</button>';
        }

        // Продажа: ползунок и кнопки
        var qty = item.quantity || 1;
        var sellPrice = item.sellPrice || 5;

        a += '<div style="margin-top:8px;background:rgba(0,0,0,0.4);padding:8px;border-radius:6px;">';
        a += '<div style="color:#fff;font-size:0.7em;margin-bottom:4px;">Продать <span id="sell-qty-label">' + qty + '</span> шт. за <span id="sell-total-label">' + (qty * sellPrice) + '</span> 🥈</div>';
        if (qty > 1) {
            a += '<input type="range" min="1" max="' + qty + '" value="' + qty + '" id="sell-slider" style="width:100%;margin:4px 0;" oninput="var v=parseInt(this.value);document.getElementById(\'sell-qty-label\').textContent=v;document.getElementById(\'sell-total-label\').textContent=v*' + sellPrice + ';document.getElementById(\'sell-one-btn\').textContent=\'Продать \'+v+\' шт.\';">';
        }
        a += '<div style="display:flex;gap:4px;margin-top:4px;">';
        a += '<button id="sell-one-btn" onclick="var amt=parseInt(document.getElementById(\'sell-slider\')?document.getElementById(\'sell-slider\').value:' + qty + ');Sherwood.Bag.sellItem(' + i + ', amt);Sherwood.Bag.showUI();" style="flex:1;background:#ff9800;border:none;border-radius:4px;padding:4px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.65em;">Продать ' + qty + ' шт.</button>';
        a += '<button onclick="Sherwood.Bag.sellItem(' + i + ',' + qty + ');Sherwood.Bag.showUI();" style="flex:1;background:#ffb300;border:none;border-radius:4px;padding:4px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.65em;">Продать всё</button>';
        a += '</div>';
        a += '</div>';

        // Кнопка "Выкинуть"
        a += '<div style="margin-top:6px;">';
        a += '<button onclick="Sherwood.Bag.discardItem(' + i + ');Sherwood.Bag.showUI();" style="background:#f44336;border:none;border-radius:6px;padding:4px 12px;color:#fff;font-weight:bold;cursor:pointer;font-size:0.7em;">🗑️ Выкинуть</button>';
        a += '</div>';

        info.innerHTML = '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;">' + (item.name || 'Предмет') + '</div><div style="color:#aaa;font-size:0.7em;">' + (item.grade || 'обычный') + ' x' + (item.quantity || 1) + '</div><div style="margin-top:6px;">' + a + '</div>';
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Bag = Sherwood.Bag;

console.log('🎒 Сумка загружена!');

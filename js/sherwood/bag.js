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
            if (this._resources.skins === undefined) this._resources.skins = 0;
            if (this._resources.entranceTickets === undefined) this._resources.entranceTickets = 0;
            if (this._resources.autoFightTickets === undefined) this._resources.autoFightTickets = 0;
            if (this._resources.amuletTablets === undefined) this._resources.amuletTablets = 0;
            if (this._resources.ringTablets === undefined) this._resources.ringTablets = 0;
            if (this._resources.skinTablets === undefined) this._resources.skinTablets = 0;
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
        console.log('📦 Предметов:', this._inventory.length);
        console.log('💰 Ресурсы:', this._resources);
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

    moveItem: function(sourceIndex, targetIndex) {
        if (sourceIndex < 0 || sourceIndex >= this._inventory.length) return { success: false };
        if (targetIndex < 0 || targetIndex >= this._maxSlots) return { success: false };
        if (sourceIndex === targetIndex) return { success: true };
        
        var sourceItem = this._inventory[sourceIndex];
        var targetItem = this._inventory[targetIndex];
        
        if (targetItem && sourceItem.id === targetItem.id && sourceItem.name === targetItem.name) {
            var maxStack = sourceItem.maxStack || 100;
            var totalQty = (sourceItem.quantity || 1) + (targetItem.quantity || 1);
            if (totalQty <= maxStack) {
                targetItem.quantity = totalQty;
                this._inventory.splice(sourceIndex, 1);
            } else {
                targetItem.quantity = maxStack;
                sourceItem.quantity = totalQty - maxStack;
            }
        } else {
            this._inventory[sourceIndex] = targetItem;
            this._inventory[targetIndex] = sourceItem;
        }
        
        this._save();
        return { success: true };
    },

    equipItem: function(index) {
        if (index < 0 || index >= this._inventory.length) return false;
        var item = this._inventory[index];
        if (!item || !item.part) return false;

        var part = item.part;
        var oldItem = this._equipment[part];

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

    // ============================================================
    //  UI — ПОКАЗ СУМКИ
    // ============================================================

    showUI: function() {
        this._renderBagUI();
    },

    _renderBagUI: function() {
        var old = document.getElementById('bag-screen');
        if (old) old.remove();
        
        var items = this._inventory;
        var resources = this._resources;
        var maxSlots = this._maxSlots;
        var freeSlots = this.getFreeSlots();
        var equipment = this._equipment;
        
        var screenHTML = `
        <div id="bag-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/bag.png') center/cover no-repeat;display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
                <button onclick="Sherwood.Bag.closeUI()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                    <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
                </button>
                <span style="color:#e0c080;font-size:1.2em;">🎒 Сумка</span>
                <span style="color:#888;font-size:12px;margin-left:auto;">
                    📦 ${items.length}/${maxSlots}
                </span>
            </div>
            
            <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
                <div style="max-width:700px;margin:0 auto;">
                    <!-- Ресурсы -->
                    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:15px;background:rgba(0,0,0,0.5);padding:10px;border-radius:8px;">
                        <div style="text-align:center;">
                            <div style="color:#ffd700;font-size:12px;">💰 Золото</div>
                            <div style="font-weight:bold;">${resources.gold || 0}</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="color:#c0c0c0;font-size:12px;">🥈 Серебро</div>
                            <div style="font-weight:bold;">${resources.silver || 0}</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="color:#8B4513;font-size:12px;">🪙 Шкуры</div>
                            <div style="font-weight:bold;">${resources.skins || 0}</div>
                        </div>
                        <div style="text-align:center;">
                            <div style="color:#a8d8ea;font-size:12px;">🎫 Билеты</div>
                            <div style="font-weight:bold;">${resources.entranceTickets || 0}</div>
                        </div>
                    </div>
                    
                    <!-- Слоты сумки -->
                    <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;">
                        ${Array.from({length: maxSlots}, function(_, i) {
                            var item = items[i] || null;
                            if (item) {
                                return `
                                <div style="background:rgba(255,255,255,0.05);padding:8px;border-radius:4px;border:1px solid #555;text-align:center;position:relative;">
                                    <div style="font-size:20px;">${item.icon || '📦'}</div>
                                    <div style="font-size:9px;color:#aaa;word-break:break-all;">${item.name || item.id || 'Предмет'}</div>
                                    ${item.quantity > 1 ? `<div style="font-size:10px;color:#ffd700;">×${item.quantity}</div>` : ''}
                                    ${item.part ? `<div style="font-size:8px;color:#4a8ab7;">${item.part}</div>` : ''}
                                    <div style="display:flex;gap:2px;margin-top:4px;flex-wrap:wrap;justify-content:center;">
                                        ${item.part ? `<button onclick="Sherwood.Bag.equipItem(${i})" style="padding:1px 6px;font-size:8px;background:#2d6a4f;border:none;border-radius:2px;color:#fff;cursor:pointer;">🔧</button>` : ''}
                                        <button onclick="Sherwood.Bag.sellItemFromUI(${i})" style="padding:1px 6px;font-size:8px;background:#6a2d2d;border:none;border-radius:2px;color:#fff;cursor:pointer;">💰</button>
                                        <button onclick="Sherwood.Bag.discardFromUI(${i})" style="padding:1px 6px;font-size:8px;background:#333;border:none;border-radius:2px;color:#888;cursor:pointer;">✖</button>
                                    </div>
                                </div>`;
                            } else {
                                return `
                                <div style="background:rgba(255,255,255,0.02);padding:8px;border-radius:4px;border:1px dashed #333;text-align:center;">
                                    <div style="font-size:12px;color:#333;">⬜</div>
                                </div>`;
                            }
                        }).join('')}
                    </div>
                    
                    <!-- Экипировка -->
                    <div style="margin-top:15px;padding:10px;background:rgba(0,0,0,0.5);border-radius:8px;">
                        <div style="color:#ffa500;font-weight:bold;font-size:14px;margin-bottom:6px;">🛡️ Экипировка</div>
                        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;font-size:11px;">
                            ${Object.keys(equipment).map(function(part) {
                                var item = equipment[part];
                                return `
                                <div style="background:rgba(255,255,255,0.03);padding:4px 8px;border-radius:4px;display:flex;justify-content:space-between;align-items:center;">
                                    <span style="color:#888;">${part}:</span>
                                    ${item ? 
                                        `<span style="color:#4ecdc4;">${item.name || item.id} ${item.quantity > 1 ? '×'+item.quantity : ''}</span>` :
                                        `<span style="color:#444;">пусто</span>`
                                    }
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                    
                    <!-- Расширение -->
                    <div style="margin-top:10px;padding:8px 12px;background:rgba(255,215,0,0.05);border:1px solid #ffd700;border-radius:6px;display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <span style="color:#ffd700;">📦 Слотов: ${maxSlots}</span>
                            ${maxSlots < 150 ? `<span style="color:#888;font-size:12px;margin-left:8px;">(${freeSlots} свободно)</span>` : ''}
                        </div>
                        ${maxSlots < 150 ? `
                            <button onclick="Sherwood.Bag.expandFromUI()" class="btn btn-gold" style="padding:4px 15px;font-size:11px;">
                                ⬆ Расширить
                            </button>
                        ` : `<span style="color:#52b788;">✅ MAX</span>`}
                    </div>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', screenHTML);
    },

    expandFromUI: function() {
        var result = this.expandBag();
        if (result.success) {
            alert('✅ Сумка расширена! Теперь ' + result.newSlots + ' слотов.');
            this._renderBagUI();
        } else {
            alert('❌ ' + result.reason);
        }
    },

    sellItemFromUI: function(index) {
        var result = this.sellItem(index);
        if (result.success) {
            this._renderBagUI();
        }
    },

    discardFromUI: function(index) {
        if (confirm('Точно выбросить предмет?')) {
            this.discardItem(index);
            this._renderBagUI();
        }
    },

    // ============================================================
    //  closeUI — ВОЗВРАТ НА ГЛАВНУЮ
    // ============================================================
    closeUI: function() {
        var screen = document.getElementById('bag-screen');
        if (screen) screen.remove();
        
        if (typeof window.showHomeScreen === 'function') {
            window.showHomeScreen();
        }
    }
};

// ---------- ЭКСПОРТ ----------
window.Sherwood = window.Sherwood || {};
window.Sherwood.Bag = Sherwood.Bag;

console.log('🎒 Сумка загружена!');

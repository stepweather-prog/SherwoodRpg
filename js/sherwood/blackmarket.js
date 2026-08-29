/**
 * Sherwood BlackMarket — Чёрный рынок
 */

Sherwood.BlackMarket = (function() {
    'use strict';

    var SHOP_SLOTS = 6;
    var REFRESH_COST_GOLD = 150;
    var MAX_REFRESHES_PER_DAY = 1;

    var CONSUMABLES = [
        { id: 'bone',               name: 'Кость бестии',           icon: 'assets/interface/bone_growth_of_the_beast.png', price: 80,   currency: 'silver', gives: { bones: 15 },              desc: '+15 костей' },
        { id: 'branch',             name: 'Ветка проклятого тиса', icon: 'assets/interface/branch_of_the_damned_yew.png', price: 80,   currency: 'silver', gives: { branches: 15 },            desc: '+15 веток' },
        { id: 'feather',            name: 'Перо шервудской твари', icon: 'assets/interface/feather_beast_1.png',           price: 80,   currency: 'silver', gives: { feathers: 15 },            desc: '+15 перьев' },
        { id: 'skin',               name: 'Шкура бестии',           icon: 'assets/interface/skin_of_the_sherwood_creature.png', price: 150,  currency: 'silver', gives: { skins: 5 },               desc: '+5 шкур' },
        { id: 'dungeon_ticket',     name: 'Тикет подземки',        icon: 'assets/interface/resource_key_to_locked_levels.png', price: 200,  currency: 'silver', gives: { entranceTickets: 1 },      desc: '+1 тикет входа' },
        { id: 'autofight_ticket',   name: 'Тикет автобоя',         icon: 'assets/interface/ticket_autofight.png',               price: 300,  currency: 'silver', gives: { autoFightTickets: 1 },     desc: '+1 тикет автобоя' },
        { id: 'portal_token_1',     name: 'Токен портала I',       icon: 'assets/interface/resource_token_on_entrance_portal_1.png', price: 500,  currency: 'silver', gives: { portalToken1: 1 },  desc: '+1 токен' },
        { id: 'portal_token_2',     name: 'Токен портала II',      icon: 'assets/interface/resource_token_on_entrance_portal_2.png', price: 750,  currency: 'silver', gives: { portalToken2: 1 },  desc: '+1 токен' },
        { id: 'portal_token_3',     name: 'Токен портала III',     icon: 'assets/interface/resource_token_on_entrance_portal_3.png', price: 1000, currency: 'silver', gives: { portalToken3: 1 },  desc: '+1 токен' },
        { id: 'wood',               name: 'Древесина',             icon: 'assets/interface/resource_wood.png',               price: 100,  currency: 'silver', gives: { wood: 20 },                desc: '+20 древесины' },
        { id: 'skin_drawing',       name: 'Чертёж скина',          icon: 'assets/interface/skin_drawing.png',               price: 500,  currency: 'gold',   gives: { skinDrawings: 1 },       desc: '+1 чертёж скина' }
    ];

    var RINGS = [
        { chapter: 1,  price: 500,   stats: { attack: 5,   defense: 3 } },
        { chapter: 2,  price: 1000,  stats: { attack: 10,  defense: 6 } },
        { chapter: 3,  price: 2000,  stats: { attack: 18,  defense: 10 } },
        { chapter: 4,  price: 3500,  stats: { attack: 28,  defense: 16 } },
        { chapter: 5,  price: 5500,  stats: { attack: 40,  defense: 24 } },
        { chapter: 6,  price: 8000,  stats: { attack: 55,  defense: 34 } },
        { chapter: 7,  price: 10000, stats: { attack: 68,  defense: 42 } },
        { chapter: 8,  price: 12000, stats: { attack: 75,  defense: 48 } },
        { chapter: 9,  price: 16000, stats: { attack: 88,  defense: 56 } },
        { chapter: 10, price: 20000, stats: { attack: 100, defense: 65 } },
        { chapter: 11, price: 26000, stats: { attack: 118, defense: 78 } },
        { chapter: 12, price: 35000, stats: { attack: 140, defense: 90 } },
        { chapter: 13, price: 47000, stats: { attack: 168, defense: 110 } },
        { chapter: 14, price: 60000, stats: { attack: 200, defense: 130 } }
    ];

    var AMULETS = [
        { chapter: 1,  price: 500,   stats: { hp: 50,   defense: 3 } },
        { chapter: 2,  price: 1000,  stats: { hp: 100,  defense: 6 } },
        { chapter: 3,  price: 2000,  stats: { hp: 180,  defense: 10 } },
        { chapter: 4,  price: 3500,  stats: { hp: 280,  defense: 16 } },
        { chapter: 5,  price: 5500,  stats: { hp: 400,  defense: 24 } },
        { chapter: 6,  price: 8000,  stats: { hp: 550,  defense: 34 } },
        { chapter: 7,  price: 10000, stats: { hp: 700,  defense: 42 } },
        { chapter: 8,  price: 13000, stats: { hp: 900,  defense: 52 } },
        { chapter: 9,  price: 17000, stats: { hp: 1150, defense: 64 } },
        { chapter: 10, price: 22000, stats: { hp: 1500, defense: 78 } }
    ];

    var RESOURCE_HANDLERS = {
        wood:            { method: 'addItem',    itemDef: { id: 'wood',    name: 'Дерево', icon: 'assets/interface/resource_wood.png',                  grade: 'common', type: 'resource', maxStack: 99, sellPrice: 2 } },
        branches:        { method: 'addItem',    itemDef: { id: 'branch',  name: 'Ветка',  icon: 'assets/interface/branch_of_the_damned_yew.png',       grade: 'common', type: 'resource', maxStack: 99, sellPrice: 3 } },
        bones:           { method: 'addItem',    itemDef: { id: 'bone',    name: 'Кость',  icon: 'assets/interface/bone_growth_of_the_beast.png',       grade: 'common', type: 'resource', maxStack: 99, sellPrice: 3 } },
        feathers:        { method: 'addItem',    itemDef: { id: 'feather', name: 'Перо',   icon: 'assets/interface/feather_beast_1.png',                 grade: 'common', type: 'resource', maxStack: 99, sellPrice: 3 } },
        skins:           { method: 'addResource', bagKey: 'skins' },
        entranceTickets: { method: 'addResource', bagKey: 'entranceTickets' },
        autoFightTickets:{ method: 'addResource', bagKey: 'autoFightTickets' },
        portalToken1:    { method: 'addResource', bagKey: 'portalToken1' },
        portalToken2:    { method: 'addResource', bagKey: 'portalToken2' },
        portalToken3:    { method: 'addResource', bagKey: 'portalToken3' },
        skinDrawings:    { method: 'addResource', bagKey: 'skinTablets' }
    };

    var _shopItems = [];
    var _purchasedToday = {};
    var _refreshCountToday = 0;
    var _lastRefreshDate = '';
    var _listeners = {};

    function _getPlayer() { return Sherwood.getPlayer(); }
    function _getToday() { return new Date().toDateString(); }

    function _emit(event, data) {
        var cbs = _listeners[event];
        if (!cbs) return;
        for (var i = 0; i < cbs.length; i++) cbs[i](data);
    }

    function _getCurrentChapter() {
        var p = _getPlayer();
        if (!p || !p.questProgress || !p.questProgress.currentChapter) return 1;
        return p.questProgress.currentChapter;
    }

    function _ensureMarketData(p) {
        if (!p.marketData) {
            p.marketData = {
                shopItems: [],
                purchasedToday: {},
                refreshCountToday: 0,
                lastRefreshDate: '',
                ownedJewelry: { rings: [], amulets: [] }
            };
        }
        if (!p.marketData.ownedJewelry) p.marketData.ownedJewelry = { rings: [], amulets: [] };
        if (!p.marketData.shopItems) p.marketData.shopItems = [];
        if (!p.marketData.purchasedToday) p.marketData.purchasedToday = {};
        if (p.marketData.refreshCountToday === undefined) p.marketData.refreshCountToday = 0;
        if (!p.marketData.lastRefreshDate) p.marketData.lastRefreshDate = '';
    }

    function _grantResources(gives) {
        if (!gives) return;

        for (var resKey in gives) {
            if (!gives.hasOwnProperty(resKey)) continue;
            var amount = gives[resKey];
            var handler = RESOURCE_HANDLERS[resKey];

            if (!handler) continue;

            switch (handler.method) {
                case 'addItem':
                    if (Sherwood.Bag && Sherwood.Bag.addItem) {
                        Sherwood.Bag.addItem(Object.assign({}, handler.itemDef, { quantity: amount }));
                    }
                    break;

                case 'addResource':
                    if (Sherwood.Bag && Sherwood.Bag.addResource) {
                        Sherwood.Bag.addResource(handler.bagKey, amount);
                    }
                    break;
            }
        }
    }

    function _buildPool() {
        var pool = [];
        for (var i = 0; i < CONSUMABLES.length; i++) {
            pool.push(Object.assign({}, CONSUMABLES[i]));
        }
        return pool;
    }

    function _shuffle(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
        }
        return arr;
    }

    function _generateShop() {
        var pool = _buildPool();
        _shuffle(pool);

        var selected = [];
        var count = Math.min(SHOP_SLOTS, pool.length);

        for (var i = 0; i < count; i++) {
            var item = Object.assign({}, pool[i], { slot: i, tab: 1 });
            selected.push(item);
        }

        return selected;
    }

    function _saveMarketData() {
        var p = _getPlayer();
        if (!p) return;
        p.marketData.shopItems = _shopItems;
        p.marketData.purchasedToday = _purchasedToday;
        p.marketData.refreshCountToday = _refreshCountToday;
        p.marketData.lastRefreshDate = _lastRefreshDate;
        Sherwood.saveGame();
    }

    function _getRingIconSuffix(chapter) {
        var map = {
            1: 'first_level', 2: 'second_level', 3: 'third_level',
            4: 'fourth_level', 5: 'fifth_level', 6: 'chapter_six',
            7: 'chapter_seven', 8: 'chapter_eight', 9: 'chapter_nine',
            10: 'chapter_ten', 11: 'chapter_eleven', 12: 'chapter_twelve',
            13: 'chapter_thirteen', 14: 'the_ring_chapter_fourteen'
        };
        return map[chapter] || 'chapter_' + chapter;
    }

    function _getAmuletIconSuffix(chapter) {
        var map = {
            1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five',
            6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten'
        };
        return map[chapter] || String(chapter);
    }

    return {
        RINGS: RINGS,
        AMULETS: AMULETS,
        CONSUMABLES: CONSUMABLES,

        init: function() {
            var p = _getPlayer();
            if (!p) return;

            _ensureMarketData(p);
            var today = _getToday();
            var isNewDay = p.marketData.lastRefreshDate !== today;

            if (isNewDay) {
                _shopItems = _generateShop();
                _purchasedToday = {};
                _refreshCountToday = 0;
                _lastRefreshDate = today;
                _saveMarketData();
            } else {
                _shopItems = p.marketData.shopItems || [];
                _purchasedToday = p.marketData.purchasedToday || {};
                _refreshCountToday = p.marketData.refreshCountToday || 0;
                _lastRefreshDate = p.marketData.lastRefreshDate;
                
                if (_shopItems.length === 0) {
                    _shopItems = _generateShop();
                    _saveMarketData();
                }
            }

            _emit('init', { shopItems: _shopItems });
            console.log('🏪 Чёрный рынок инициализирован');
        },

        getShopItems: function() {
            return _shopItems.slice();
        },

        canRefresh: function() {
            return _refreshCountToday < MAX_REFRESHES_PER_DAY;
        },

        refresh: function() {
            if (!this.canRefresh()) {
                return { success: false, reason: 'Лимит обновлений на сегодня исчерпан' };
            }

            var p = _getPlayer();
            if ((p.resources.gold || 0) < REFRESH_COST_GOLD) {
                return { success: false, reason: 'Нужно ' + REFRESH_COST_GOLD + ' золота' };
            }

            Sherwood.spendResource('gold', REFRESH_COST_GOLD);
            _refreshCountToday++;
            _purchasedToday = {};
            _shopItems = _generateShop();
            _saveMarketData();

            _emit('shopRefreshed', { shopItems: _shopItems });

            return { success: true, shopItems: _shopItems };
        },

        isPurchased: function(itemIdOrIndex) {
            var item = null;
            
            for (var i = 0; i < _shopItems.length; i++) {
                if (_shopItems[i].id === itemIdOrIndex) { item = _shopItems[i]; break; }
            }
            
            if (!item) {
                var idx = parseInt(itemIdOrIndex, 10);
                if (!isNaN(idx) && idx >= 0 && idx < _shopItems.length) {
                    item = _shopItems[idx];
                }
            }
            
            if (!item) return true;
            return !!_purchasedToday[item.id];
        },

        buyItem: function(itemIdOrIndex) {
            var item = null;
            
            for (var i = 0; i < _shopItems.length; i++) {
                if (_shopItems[i].id === itemIdOrIndex) { item = _shopItems[i]; break; }
            }
            
            if (!item) {
                var idx = parseInt(itemIdOrIndex, 10);
                if (!isNaN(idx) && idx >= 0 && idx < _shopItems.length) {
                    item = _shopItems[idx];
                }
            }
            
            if (!item) {
                for (var j = 0; j < _shopItems.length; j++) {
                    if (_shopItems[j].slot === parseInt(itemIdOrIndex, 10)) { item = _shopItems[j]; break; }
                }
            }
            
            if (!item) return { success: false, reason: 'Товар не найден' };
            if (_purchasedToday[item.id]) return { success: false, reason: 'Уже куплено сегодня' };

            var p = _getPlayer();
            if (!p) return { success: false, reason: 'Ошибка загрузки игрока' };

            if ((p.resources[item.currency] || 0) < item.price) {
                var currencyName = item.currency === 'gold' ? 'золота' : 'серебра';
                return { success: false, reason: 'Недостаточно ' + currencyName };
            }

            Sherwood.spendResource(item.currency, item.price);
            _grantResources(item.gives);
            _purchasedToday[item.id] = true;
            _saveMarketData();

            var result = { success: true, item: item };
            _emit('itemPurchased', result);

            return result;
        },

        getAvailableRings: function() {
            var chapter = _getCurrentChapter();
            var result = [];
            for (var i = 0; i < RINGS.length; i++) {
                if (RINGS[i].chapter <= chapter) {
                    result.push({
                        id: 'ring_' + RINGS[i].chapter,
                        name: 'Кольцо главы ' + RINGS[i].chapter,
                        icon: 'assets/interface/ring_' + _getRingIconSuffix(RINGS[i].chapter) + '.png',
                        chapter: RINGS[i].chapter,
                        price: RINGS[i].price,
                        stats: RINGS[i].stats
                    });
                }
            }
            return result;
        },

        getAvailableAmulets: function() {
            var chapter = _getCurrentChapter();
            var result = [];
            for (var i = 0; i < AMULETS.length; i++) {
                if (AMULETS[i].chapter <= chapter) {
                    result.push({
                        id: 'amulet_' + AMULETS[i].chapter,
                        name: 'Амулет главы ' + AMULETS[i].chapter,
                        icon: 'assets/interface/sherwood_amulet_level_' + _getAmuletIconSuffix(AMULETS[i].chapter) + '.png',
                        chapter: AMULETS[i].chapter,
                        price: AMULETS[i].price,
                        stats: AMULETS[i].stats
                    });
                }
            }
            return result;
        },

        buyJewelry: function(type, jewelryId) {
            if (type !== 'ring' && type !== 'amulet') {
                return { success: false, reason: 'Неверный тип: ' + type };
            }

            var source = type === 'ring' ? RINGS : AMULETS;
            var item = null;
            var chapter = null;

            var parts = jewelryId.split('_');
            chapter = parseInt(parts[parts.length - 1], 10);

            for (var i = 0; i < source.length; i++) {
                if (source[i].chapter === chapter) { item = source[i]; break; }
            }

            if (!item) return { success: false, reason: 'Изделие не найдено' };

            var p = _getPlayer();
            if (!p) return { success: false, reason: 'Ошибка загрузки игрока' };

            _ensureMarketData(p);

            if (p.marketData.ownedJewelry[type + 's'].indexOf(jewelryId) !== -1) {
                return { success: false, reason: 'Уже куплено' };
            }

            if (chapter > _getCurrentChapter()) {
                return { success: false, reason: 'Глава ' + chapter + ' ещё не открыта' };
            }

            if ((p.resources.silver || 0) < item.price) {
                return { success: false, reason: 'Недостаточно серебра' };
            }

            Sherwood.spendResource('silver', item.price);

            var equipItem = {
                id: jewelryId,
                name: type === 'ring' ? 'Кольцо главы ' + chapter : 'Амулет главы ' + chapter,
                icon: type === 'ring'
                    ? 'assets/interface/ring_' + _getRingIconSuffix(chapter) + '.png'
                    : 'assets/interface/sherwood_amulet_level_' + _getAmuletIconSuffix(chapter) + '.png',
                part: type,
                stats: item.stats,
                grade: 'rare',
                type: 'equipment',
                quantity: 1,
                sellPrice: 0
            };

            if (Sherwood.Bag && Sherwood.Bag._equipment) {
                Sherwood.Bag._equipment[type] = equipItem;
            }

            p.marketData.ownedJewelry[type + 's'].push(jewelryId);

            if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
            Sherwood.saveGame();

            var result = { success: true, type: type, item: equipItem };
            _emit('jewelryPurchased', result);

            return result;
        },

        isJewelryOwned: function(type, jewelryId) {
            var p = _getPlayer();
            if (!p || !p.marketData || !p.marketData.ownedJewelry) return false;
            var list = p.marketData.ownedJewelry[type + 's'] || [];
            return list.indexOf(jewelryId) !== -1;
        },

        on: function(event, callback) {
            if (!_listeners[event]) _listeners[event] = [];
            _listeners[event].push(callback);
        },

        off: function(event, callback) {
            if (!_listeners[event]) return;
            _listeners[event] = _listeners[event].filter(function(cb) { return cb !== callback; });
        },

        // ============================================================
        //  UI — ПОКАЗ ЧЁРНОГО РЫНКА
        // ============================================================

        showUI: function() {
            this._renderMarketUI();
        },

        _renderMarketUI: function() {
            var old = document.getElementById('market-screen');
            if (old) old.remove();

            var p = _getPlayer();
            var gold = p.resources ? p.resources.gold || 0 : 0;
            var silver = p.resources ? p.resources.silver || 0 : 0;
            var shopItems = this.getShopItems();
            var canRefresh = this.canRefresh();
            var rings = this.getAvailableRings();
            var amulets = this.getAvailableAmulets();

            var screenHTML = `
            <div id="market-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/market.png') center/cover no-repeat;display:flex;flex-direction:column;">
                <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
                    <button onclick="Sherwood.BlackMarket.closeUI()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                        <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
                    </button>
                    <span style="color:#e0c080;font-size:1.2em;">🏪 Чёрный рынок</span>
                    <span style="color:#888;font-size:12px;margin-left:auto;">
                        💰 ${gold} | 🥈 ${silver}
                    </span>
                </div>

                <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
                    <div style="max-width:700px;margin:0 auto;">

                        <!-- Вкладки -->
                        <div style="display:flex;gap:6px;margin-bottom:15px;">
                            <button onclick="Sherwood.BlackMarket._switchTab(1)" class="btn btn-gold" id="market-tab-1" style="flex:1;padding:8px;font-size:13px;">📦 Товары</button>
                            <button onclick="Sherwood.BlackMarket._switchTab(2)" class="btn" id="market-tab-2" style="flex:1;padding:8px;font-size:13px;">💍 Кольца</button>
                            <button onclick="Sherwood.BlackMarket._switchTab(3)" class="btn" id="market-tab-3" style="flex:1;padding:8px;font-size:13px;">📿 Амулеты</button>
                        </div>

                        <!-- Контент -->
                        <div id="market-content">
                            ${this._renderShopTab(shopItems, canRefresh)}
                        </div>
                    </div>
                </div>
            </div>`;

            document.body.insertAdjacentHTML('beforeend', screenHTML);
            this._currentTab = 1;
        },

        _renderShopTab: function(shopItems, canRefresh) {
            var html = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span style="color:#888;font-size:12px;">🔄 Обновлений сегодня: ${_refreshCountToday}/${MAX_REFRESHES_PER_DAY}</span>
                ${canRefresh ? `<button onclick="Sherwood.BlackMarket.refreshMarket()" class="btn btn-gold" style="padding:4px 15px;font-size:11px;">🔄 Обновить (150💰)</button>` : '<span style="color:#555;font-size:12px;">⏳ Лимит исчерпан</span>'}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">`;

            for (var i = 0; i < shopItems.length; i++) {
                var item = shopItems[i];
                var purchased = this.isPurchased(item.id);
                var currencyIcon = item.currency === 'gold' ? '💰' : '🥈';
                var canBuy = !purchased && (item.currency === 'gold' ? gold : silver) >= item.price;

                html += `
                <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:6px;border:1px solid ${purchased ? '#333' : '#555'};${purchased ? 'opacity:0.5;' : ''}">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <img src="${item.icon}" style="width:32px;height:32px;object-fit:contain;" onerror="this.style.display='none'">
                        <div style="flex:1;">
                            <div style="font-size:13px;font-weight:bold;color:${purchased ? '#555' : '#ffd700'};">${item.name}</div>
                            <div style="font-size:11px;color:#888;">${item.desc || ''}</div>
                            <div style="font-size:11px;color:#aaa;">${currencyIcon} ${item.price}</div>
                        </div>
                    </div>
                    ${!purchased ? `<button onclick="Sherwood.BlackMarket.buyMarketItem('${item.id}')" class="btn btn-success" style="width:100%;margin-top:6px;padding:4px;font-size:11px;">Купить</button>` : '<div style="color:#52b788;font-size:12px;text-align:center;margin-top:6px;">✅ Куплено</div>'}
                </div>`;
            }

            html += '</div>';
            return html;
        },

        _renderJewelryTab: function(type, items) {
            var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">';

            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                var owned = this.isJewelryOwned(type, item.id);
                var p = _getPlayer();
                var silver = p.resources ? p.resources.silver || 0 : 0;

                html += `
                <div style="background:rgba(255,255,255,0.05);padding:10px;border-radius:6px;border:1px solid ${owned ? '#52b788' : '#555'};${owned ? 'border-color:#52b788;' : ''}">
                    <div style="display:flex;align-items:center;gap:8px;">
                        <img src="${item.icon}" style="width:32px;height:32px;object-fit:contain;" onerror="this.style.display='none'">
                        <div style="flex:1;">
                            <div style="font-size:13px;font-weight:bold;color:${owned ? '#52b788' : '#ffd700'};">${item.name}</div>
                            <div style="font-size:11px;color:#888;">
                                ⚔️ +${item.stats.attack || 0} | 🛡️ +${item.stats.defense || 0} | ❤️ +${item.stats.hp || 0}
                            </div>
                            <div style="font-size:11px;color:#aaa;">🥈 ${item.price}</div>
                        </div>
                    </div>
                    ${!owned ? `<button onclick="Sherwood.BlackMarket.buyJewelryFromUI('${type}','${item.id}')" class="btn btn-success" style="width:100%;margin-top:6px;padding:4px;font-size:11px;">Купить</button>` : '<div style="color:#52b788;font-size:12px;text-align:center;margin-top:6px;">✅ Владеете</div>'}
                </div>`;
            }

            html += '</div>';
            return html;
        },

        _switchTab: function(tab) {
            this._currentTab = tab;
            var content = document.getElementById('market-content');
            if (!content) return;

            // Обновляем стили вкладок
            for (var i = 1; i <= 3; i++) {
                var btn = document.getElementById('market-tab-' + i);
                if (btn) {
                    btn.className = 'btn' + (i === tab ? ' btn-gold' : '');
                }
            }

            var shopItems = this.getShopItems();
            var canRefresh = this.canRefresh();
            var rings = this.getAvailableRings();
            var amulets = this.getAvailableAmulets();

            if (tab === 1) {
                content.innerHTML = this._renderShopTab(shopItems, canRefresh);
            } else if (tab === 2) {
                content.innerHTML = this._renderJewelryTab('ring', rings);
            } else if (tab === 3) {
                content.innerHTML = this._renderJewelryTab('amulet', amulets);
            }
        },

        refreshMarket: function() {
            var result = this.refresh();
            if (result.success) {
                this._renderMarketUI();
            } else {
                alert('❌ ' + result.reason);
            }
        },

        buyMarketItem: function(itemId) {
            var result = this.buyItem(itemId);
            if (result.success) {
                this._renderMarketUI();
            } else {
                alert('❌ ' + result.reason);
            }
        },

        buyJewelryFromUI: function(type, jewelryId) {
            var result = this.buyJewelry(type, jewelryId);
            if (result.success) {
                this._renderMarketUI();
            } else {
                alert('❌ ' + result.reason);
            }
        },

        // ============================================================
        //  closeUI — ВОЗВРАТ НА ГЛАВНУЮ
        // ============================================================
        closeUI: function() {
            var screen = document.getElementById('market-screen');
            if (screen) screen.remove();

            if (typeof window.showHomeScreen === 'function') {
                window.showHomeScreen();
            }
        }
    };

})();

// ---------- ЭКСПОРТ ----------
window.Sherwood = window.Sherwood || {};
window.Sherwood.BlackMarket = Sherwood.BlackMarket;

console.log('🏪 Чёрный рынок загружен!');

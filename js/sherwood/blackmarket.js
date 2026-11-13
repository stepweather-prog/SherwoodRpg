/**
 * Sherwood BlackMarket — Чёрный рынок
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.BlackMarket = (function() {
    'use strict';

    var SHOP_SLOTS = 6;
    var REFRESH_COST_GOLD = 150;
    var MAX_REFRESHES_PER_DAY = 1;

    var CONSUMABLES = [
        { id: 'bone', name: 'Кость бестии', icon: 'assets/interface/bone_growth_of_the_beast.png', price: 80, currency: 'silver', gives: { bones: 15 }, desc: '+15 костей' },
        { id: 'branch', name: 'Ветка проклятого тиса', icon: 'assets/interface/branch_of_the_damned_yew.png', price: 80, currency: 'silver', gives: { branches: 15 }, desc: '+15 веток' },
        { id: 'feather', name: 'Перо шервудской твари', icon: 'assets/interface/feather_beast_1.png', price: 80, currency: 'silver', gives: { feathers: 15 }, desc: '+15 перьев' },
        { id: 'dungeon_ticket', name: 'Тикет подземки', icon: 'assets/interface/resource_key_to_locked_levels.png', price: 200, currency: 'silver', gives: { entranceTickets: 1 }, desc: '+1 тикет входа' },
        { id: 'autofight_ticket', name: 'Тикет автобоя', icon: 'assets/interface/ticket_autofight.png', price: 300, currency: 'silver', gives: { autoFightTickets: 1 }, desc: '+1 тикет автобоя' },
        { id: 'portal_token_1', name: 'Токен портала I', icon: 'assets/interface/resource_token_on_entrance_portal_1.png', price: 500, currency: 'silver', gives: { portalToken1: 1 }, desc: '+1 токен' },
        { id: 'skin_drawing', name: 'Чертёж заточки', icon: 'assets/interface/skin_drawing.png', price: 500, currency: 'gold', gives: { skinDrawings: 1 }, desc: '+1 чертёж заточки' }
    ];

    var RESOURCE_HANDLERS = {
        branches: { method: 'addItem', itemDef: { id: 'branch', name: 'Ветка', icon: 'assets/interface/branch_of_the_damned_yew.png', grade: 'common', type: 'resource', maxStack: 99, sellPrice: 3 } },
        bones: { method: 'addItem', itemDef: { id: 'bone', name: 'Кость', icon: 'assets/interface/bone_growth_of_the_beast.png', grade: 'common', type: 'resource', maxStack: 99, sellPrice: 3 } },
        feathers: { method: 'addItem', itemDef: { id: 'feather', name: 'Перо', icon: 'assets/interface/feather_beast_1.png', grade: 'common', type: 'resource', maxStack: 99, sellPrice: 3 } },
        skins: { method: 'addResource', bagKey: 'skins' },
        entranceTickets: { method: 'addResource', bagKey: 'entranceTickets' },
        autoFightTickets: { method: 'addResource', bagKey: 'autoFightTickets' },
        portalToken1: { method: 'addResource', bagKey: 'portalToken1' },
        skinDrawings: { method: 'addResource', bagKey: 'skinTablets' }
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
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
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

    return {
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

        getShopItems: function() { return _shopItems.slice(); },

        canRefresh: function() { return _refreshCountToday < MAX_REFRESHES_PER_DAY; },

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

        on: function(event, callback) {
            if (!_listeners[event]) _listeners[event] = [];
            _listeners[event].push(callback);
        },

        off: function(event, callback) {
            if (!_listeners[event]) return;
            _listeners[event] = _listeners[event].filter(function(cb) { return cb !== callback; });
        },

        // ========== UI ==========

        showUI: function() {
            if (typeof UI === 'undefined') {
                if (typeof showGenericScreen === 'function') {
                    showGenericScreen('Рынок', '🏪');
                }
                return;
            }
            UI._playSound('click');

            var p = _getPlayer();
            var gold = p.resources ? p.resources.gold || 0 : 0;
            var silver = p.resources ? p.resources.silver || 0 : 0;
            var shopItems = this.getShopItems();
            var canRefresh = this.canRefresh();

            var h = '<div style="padding:10px;max-width:400px;margin:0 auto;">';

                        // Шапка с иконками ресурсов (иконка и число в одну строку)
            h += '<div style="display:flex;justify-content:center;align-items:center;gap:24px;margin-bottom:12px;font-size:0.95em;color:#e0c080;">';
            h += '<span style="display:flex;align-items:center;gap:4px;line-height:1;"><img src="assets/interface/resource_gold.png" style="width:20px;height:20px;object-fit:contain;display:block;"> ' + gold + '</span>';
            h += '<span style="display:flex;align-items:center;gap:4px;line-height:1;"><img src="assets/interface/resource_silver.png" style="width:20px;height:20px;object-fit:contain;display:block;"> ' + silver + '</span>';
            h += '</div>';

            if (canRefresh) {
                h += '<button onclick="Sherwood.BlackMarket._refreshFromUI()" class="btn" style="width:100%;padding:8px;margin-bottom:12px;font-size:0.85em;background:linear-gradient(180deg,#6b5a3a,#3a2e1a);border:2px solid #c8a050;border-radius:8px;color:#ffd27a;font-weight:bold;cursor:pointer;">🔄 Обновить за 150 <img src="assets/interface/resource_gold.png" style="width:16px;height:16px;object-fit:contain;vertical-align:middle;"></button>';
            } else {
                h += '<div style="color:#888;font-size:0.7em;text-align:center;margin-bottom:12px;">Обновлений сегодня больше нет</div>';
            }

            // Сетка карточек (как таланты)
            h += '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(110px, 1fr));gap:12px;justify-items:center;">';
            for (var i = 0; i < shopItems.length; i++) {
                var item = shopItems[i];
                var purchased = this.isPurchased(i);
                var borderColor = purchased ? '#4caf50' : '#6b5a3a';
                var opacity = purchased ? '0.5' : '1';
                var currencyIcon = item.currency === 'gold' ? 'assets/interface/resource_gold.png' : 'assets/interface/resource_silver.png';

                h += '<div style="display:flex;flex-direction:column;align-items:center;width:100%;opacity:' + opacity + ';">';

                // Карточка
                h += '<div onclick="' + (purchased ? '' : 'Sherwood.BlackMarket._buyFromUI(' + i + ')') + '" style="position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;padding:10px;background:rgba(10,8,5,0.9);border:2px solid ' + borderColor + ';width:100%;box-shadow:0 4px 15px rgba(0,0,0,0.9);aspect-ratio:1/1;cursor:' + (purchased ? 'default' : 'pointer') + ';transition:transform 0.1s;">';
                
                // Иконка предмета
                h += '<img src="' + item.icon + '" style="width:50px;height:50px;object-fit:contain;filter:drop-shadow(0 0 6px rgba(255,165,0,0.5));" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                
                // Название (снизу)
                h += '<div style="position:absolute;bottom:6px;left:0;right:0;text-align:center;color:#fff;font-size:0.55em;font-weight:bold;text-shadow:0 1px 2px #000;padding:0 2px;line-height:1.1;">' + item.name + '</div>';
                
                // Цена (если не куплено) — с иконкой валюты
                if (!purchased) {
                    h += '<div style="position:absolute;top:2px;right:4px;display:flex;align-items:center;gap:2px;text-shadow:0 1px 2px #000;">';
                    h += '<span style="color:#fff;font-size:0.55em;font-weight:bold;">' + item.price + '</span>';
                    h += '<img src="' + currencyIcon + '" style="width:14px;height:14px;object-fit:contain;">';
                    h += '</div>';
                } else {
                    h += '<div style="position:absolute;top:2px;right:4px;color:#4caf50;font-size:0.6em;">✅</div>';
                }

                h += '</div>'; // конец карточки
                h += '</div>'; // конец колонки
            }
            h += '</div>';

            h += '<div id="market-log" style="text-align:center;color:#aaa;font-size:0.75em;margin-top:12px;min-height:20px;"></div>';
            h += '</div>';

            UI._openScreenScrollable('🏪 Рынок', 'market', h);
        },

        _refreshFromUI: function() {
            var r = this.refresh();
            if (r.success) {
                UI._showToast('Товары обновлены!');
                this.showUI();
            } else {
                UI._showToast(r.reason);
            }
        },

        _buyFromUI: function(i) {
            var r = this.buyItem(i);
            var log = document.getElementById('market-log');
            if (r.success) {
                if (log) log.textContent = '✅ Куплено!';
                UI._playSound('loot_fly');
                UI.updateDisplay();
                this.showUI();
            } else {
                if (log) log.textContent = '❌ ' + (r.reason || 'Ошибка');
                UI._showToast(r.reason || 'Ошибка');
            }
        }
    };

})();

window.Sherwood = window.Sherwood || {};
window.Sherwood.BlackMarket = Sherwood.BlackMarket;

console.log('🏪 Чёрный рынок загружен!');

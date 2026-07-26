/**
 * Sherwood BlackMarket — Рынок
 * Исправлен: генерация предметов, цены, валюта, типы товаров
 */

Sherwood.BlackMarket = {
    _shopItems: [],
    _lastRefresh: null,

    SHOP_TEMPLATES: [
        // ТОЛЬКО СКРИЖАЛИ И РЕСУРСЫ (кольца и амулеты УБРАНЫ)
        { id: 'ring_crafting', name: 'Скрижаль колец', icon: 'assets/interface/ring_crafting_tablet_resource.png', price: 150, currency: 'silver', type: 'resource', gives: { scrolls: 5 }, desc: '+5 скрижалей колец' },
        { id: 'amulet_crafting', name: 'Скрижаль амулетов', icon: 'assets/interface/amulet_crafting_tablet_resource.png', price: 150, currency: 'silver', type: 'resource', gives: { scrolls: 5 }, desc: '+5 скрижалей амулетов' },
        { id: 'appearance_tablet', name: 'Скрижаль обликов', icon: 'assets/interface/resource_appearance_crafting_tablet.png', price: 200, currency: 'silver', type: 'resource', gives: { scrolls: 8 }, desc: '+8 скрижалей обликов' },
        { id: 'ingot_pack', name: 'Набор слитков', icon: 'assets/ingots resource crafting skin/ingot_chapter_1.png', price: 500, currency: 'silver', type: 'resource', gives: { ingots: 10 }, desc: '+10 слитков' },
        { id: 'wood_pack', name: 'Древесина', icon: 'assets/interface/resource_wood.png', price: 100, currency: 'silver', type: 'resource', gives: { wood: 20 }, desc: '+20 древесины' },
        { id: 'feather_pack', name: 'Перья', icon: 'assets/interface/resource_feathers.png', price: 80, currency: 'silver', type: 'resource', gives: { feathers: 15 }, desc: '+15 перьев' },
        // Зелья — оставляем
        { id: 'health_potion', name: 'Зелье здоровья', icon: 'assets/interface/resource_life_potion.png', price: 50, currency: 'gold', type: 'consumable', effect: { heal: 100 }, desc: 'Восстанавливает 100 HP' },
        { id: 'high_health_potion', name: 'Большое зелье', icon: 'assets/interface/resource_high_level_health_potion.png', price: 120, currency: 'gold', type: 'consumable', effect: { heal: 300 }, desc: 'Восстанавливает 300 HP' },
        // Жетоны порталов
        { id: 'portal_token_1', name: 'Жетон портала', icon: 'assets/interface/resource_token_on_entrance_portal_1.png', price: 300, currency: 'gold', type: 'consumable', effect: { portalToken: 1 }, desc: '+1 жетон портала' }
    ],

    // СЛИТКИ ДЛЯ РАЗНЫХ ГЛАВ
    _INGOT_TYPES: [
        { id: 'ingot_chapter_1', name: 'Слиток главы 1', icon: 'assets/ingots resource crafting skin/ingot_chapter_1.png' },
        { id: 'ingot_chapter_2', name: 'Слиток главы 2', icon: 'assets/ingots resource crafting skin/ingot_chapter_2.png' },
        { id: 'ingot_chapter_3', name: 'Слиток главы 3', icon: 'assets/ingots resource crafting skin/ingot_chapter_3.png' },
        { id: 'ingot_chapter_4', name: 'Слиток главы 4', icon: 'assets/ingots resource crafting skin/ingot_chapter_4.png' },
        { id: 'ingot_chapter_5', name: 'Слиток главы 5', icon: 'assets/ingots resource crafting skin/ingot_chapter_5.png' },
        { id: 'ingot_chapter_6', name: 'Слиток главы 6', icon: 'assets/ingots resource crafting skin/ingot_chapter_6.png' },
        { id: 'ingot_chapter_7', name: 'Слиток главы 7', icon: 'assets/ingots resource crafting skin/ingot_chapter_7.png' },
        { id: 'ingot_chapter_8', name: 'Слиток главы 8', icon: 'assets/ingots resource crafting skin/ingot_chapter_8.png' },
        { id: 'ingot_chapter_9', name: 'Слиток главы 9', icon: 'assets/ingots resource crafting skin/ingot_chapter_9.png' },
        { id: 'ingot_chapter_10', name: 'Слиток главы 10', icon: 'assets/ingots resource crafting skin/ingot_chapter_10.png' },
        { id: 'ingot_chapter_11', name: 'Слиток главы 11', icon: 'assets/ingots resource crafting skin/ingot_chapter_11.png' },
        { id: 'ingot_chapter_12', name: 'Слиток главы 12', icon: 'assets/ingots resource crafting skin/ingot_chapter_12.png' },
        { id: 'ingot_chapter_13', name: 'Слиток главы 13', icon: 'assets/ingots resource crafting skin/ingot_chapter_13.png' },
        { id: 'ingot_chapter_14', name: 'Слиток главы 14', icon: 'assets/ingots resource crafting skin/ingot_chapter_14.png' }
    ],

    init: function() {
        this._refreshShop();
    },

    _refreshShop: function() {
        var pool = this.SHOP_TEMPLATES.slice();
        this._shopItems = [];

        // Добавляем случайные слитки в пул (если они нужны)
        // Берём 6 случайных товаров из шаблонов
        var shuffled = pool.sort(function() { return Math.random() - 0.5; });
        var count = Math.min(6, shuffled.length);

        for (var i = 0; i < count; i++) {
            var item = Object.assign({}, shuffled[i], { shopIndex: i });
            // Если это набор слитков — добавляем конкретный тип
            if (item.id === 'ingot_pack') {
                var ingot = this._INGOT_TYPES[Math.floor(Math.random() * this._INGOT_TYPES.length)];
                item.name = ingot.name;
                item.icon = ingot.icon;
                item.gives = { ingots: 5 };
                item.desc = '+5 ' + ingot.name;
            }
            this._shopItems.push(item);
        }

        this._lastRefresh = Date.now();
    },

    getShopItems: function() {
        return this._shopItems;
    },

    buyItem: function(shopIndex) {
        if (shopIndex < 0 || shopIndex >= this._shopItems.length) {
            return { success: false, reason: 'Товар не найден' };
        }

        var item = this._shopItems[shopIndex];
        var player = Sherwood.getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };

        if ((player.resources[item.currency] || 0) < item.price) {
            return { success: false, reason: 'Недостаточно средств' };
        }

        // Списываем
        player.resources[item.currency] -= item.price;

        // Применяем эффект
        if (item.type === 'consumable') {
            if (item.effect) {
                if (item.effect.heal) {
                    player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + item.effect.heal);
                }
                if (item.effect.addTickets) {
                    player.dungeon.tickets = Math.min(player.dungeon.maxTickets, player.dungeon.tickets + item.effect.addTickets);
                }
                if (item.effect.portalToken) {
                    player.resources.portalTokens = (player.resources.portalTokens || 0) + 1;
                }
            }
        } else if (item.type === 'resource' && item.gives) {
            for (var res in item.gives) {
                if (item.gives.hasOwnProperty(res)) {
                    if (res === 'scrolls') {
                        player.resources.scrolls = (player.resources.scrolls || 0) + item.gives[res];
                    } else if (res === 'ingots') {
                        player.resources.ingots = (player.resources.ingots || 0) + item.gives[res];
                    } else if (res === 'wood') {
                        player.resources.wood = (player.resources.wood || 0) + item.gives[res];
                    } else if (res === 'feathers') {
                        player.resources.feathers = (player.resources.feathers || 0) + item.gives[res];
                    } else {
                        player.resources[res] = (player.resources[res] || 0) + item.gives[res];
                    }
                }
            }
        }

        // Обновляем инвентарь игрока
        Sherwood._recalcStats();
        Sherwood.saveGame();

        return { success: true, item: item };
    },

    // Получить цену для конкретного товара
    getItemPrice: function(itemId) {
        for (var i = 0; i < this._shopItems.length; i++) {
            if (this._shopItems[i].id === itemId) {
                return { price: this._shopItems[i].price, currency: this._shopItems[i].currency };
            }
        }
        return null;
    },

    // Обновить ассортимент (можно вызвать вручную)
    refresh: function() {
        this._refreshShop();
    }
};

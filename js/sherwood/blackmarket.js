Sherwood.BlackMarket = {
    _shopItems: [],
    _lastRefresh: null,
    _shopTab: 1,
    _purchasedToday: {},
    _refreshCountToday: 0,
    _maxRefreshesPerDay: 1,

    _ALL_GOODS: [
        { id: 'bone', name: 'Кость бестии', icon: 'assets/interface/bone_growth_of_the_beast.png', price: 80, currency: 'silver', gives: { bones: 15 }, quantity: 15, desc: '+15 костей' },
        { id: 'branch', name: 'Ветка проклятого тиса', icon: 'assets/interface/branch_of_the_damned_yew.png', price: 80, currency: 'silver', gives: { branches: 15 }, quantity: 15, desc: '+15 веток' },
        { id: 'feather', name: 'Перо шервудской твари', icon: 'assets/interface/feather_beast_1.png', price: 80, currency: 'silver', gives: { feathers: 15 }, quantity: 15, desc: '+15 перьев' },
        { id: 'skin', name: 'Шкура бестии', icon: 'assets/interface/skin_of_the_sherwood_creature.png', price: 150, currency: 'silver', gives: { skins: 5 }, quantity: 5, desc: '+5 шкур' },
        { id: 'dungeon_ticket', name: 'Тикет подземки', icon: 'assets/interface/resource_key_to_locked_levels.png', price: 200, currency: 'silver', gives: { entranceTickets: 1 }, quantity: 1, desc: '+1 тикет входа' },
        { id: 'autofight_ticket', name: 'Тикет автобоя', icon: 'assets/interface/ticket_autofight.png', price: 300, currency: 'silver', gives: { autoFightTickets: 1 }, quantity: 1, desc: '+1 тикет автобоя' },
        { id: 'portal_token_1', name: 'Токен портала I', icon: 'assets/interface/resource_token_on_entrance_portal_1.png', price: 500, currency: 'silver', gives: { portalToken1: 1 }, quantity: 1, desc: '+1 токен' },
        { id: 'portal_token_2', name: 'Токен портала II', icon: 'assets/interface/resource_token_on_entrance_portal_2.png', price: 750, currency: 'silver', gives: { portalToken2: 1 }, quantity: 1, desc: '+1 токен' },
        { id: 'portal_token_3', name: 'Токен портала III', icon: 'assets/interface/resource_token_on_entrance_portal_3.png', price: 1000, currency: 'silver', gives: { portalToken3: 1 }, quantity: 1, desc: '+1 токен' },
        { id: 'wood', name: 'Древесина', icon: 'assets/interface/resource_wood.png', price: 100, currency: 'silver', gives: { wood: 20 }, quantity: 20, desc: '+20 древесины' },
    ],

    _INGOT_TYPES: [
        { id: 'ingot_chapter_1', name: 'Слиток главы 1', icon: 'assets/ingots resource crafting skin/ingot_chapter_1.png', chapter: 1 },
        { id: 'ingot_chapter_2', name: 'Слиток главы 2', icon: 'assets/ingots resource crafting skin/ingot_chapter_2.png', chapter: 2 },
        { id: 'ingot_chapter_3', name: 'Слиток главы 3', icon: 'assets/ingots resource crafting skin/ingot_chapter_3.png', chapter: 3 },
        { id: 'ingot_chapter_5', name: 'Слиток главы 5', icon: 'assets/ingots resource crafting skin/ingot_chapter_5.png', chapter: 5 },
        { id: 'ingot_chapter_6', name: 'Слиток главы 6', icon: 'assets/ingots resource crafting skin/ingot_chapter_6.png', chapter: 6 },
        { id: 'ingot_chapter_7', name: 'Слиток главы 7', icon: 'assets/ingots resource crafting skin/ingot_chapter_7.png', chapter: 7 },
        { id: 'ingot_chapter_8', name: 'Слиток главы 8', icon: 'assets/ingots resource crafting skin/ingot_chapter_8.png', chapter: 8 },
        { id: 'ingot_chapter_9', name: 'Слиток главы 9', icon: 'assets/ingots resource crafting skin/ingot_chapter_9.png', chapter: 9 },
        { id: 'ingot_chapter_10', name: 'Слиток главы 10', icon: 'assets/ingots resource crafting skin/ingot_chapter_10.png', chapter: 10 },
        { id: 'ingot_chapter_11', name: 'Слиток главы 11', icon: 'assets/ingots resource crafting skin/ingot_chapter_11.png', chapter: 11 },
        { id: 'ingot_chapter_12', name: 'Слиток главы 12', icon: 'assets/ingots resource crafting skin/ingot_chapter_12.png', chapter: 12 },
        { id: 'ingot_chapter_13', name: 'Слиток главы 13', icon: 'assets/ingots resource crafting skin/ingot_chapter_13.png', chapter: 13 },
        { id: 'ingot_chapter_14', name: 'Слиток главы 14', icon: 'assets/ingots resource crafting skin/ingot_chapter_14.png', chapter: 14 }
    ],

    // Кольца по главам (для вкладки Ювелирка)
    _RINGS: [
        { id: 'ring_1', name: 'Кольцо главы 1', icon: 'assets/interface/ring_first_level.png', chapter: 1, price: 500, stats: { attack: 5, defense: 3 } },
        { id: 'ring_2', name: 'Кольцо главы 2', icon: 'assets/interface/ring_second_level.png', chapter: 2, price: 1000, stats: { attack: 10, defense: 6 } },
        { id: 'ring_3', name: 'Кольцо главы 3', icon: 'assets/interface/ring_third_level.png', chapter: 3, price: 2000, stats: { attack: 18, defense: 10 } },
        { id: 'ring_4', name: 'Кольцо главы 4', icon: 'assets/interface/ring_fourth_level.png', chapter: 4, price: 3500, stats: { attack: 28, defense: 16 } },
        { id: 'ring_5', name: 'Кольцо главы 5', icon: 'assets/interface/ring_fifth_level.png', chapter: 5, price: 5500, stats: { attack: 40, defense: 24 } },
        { id: 'ring_6', name: 'Кольцо главы 6', icon: 'assets/interface/ring_chapter_six.png', chapter: 6, price: 8000, stats: { attack: 55, defense: 34 } },
        { id: 'ring_8', name: 'Кольцо главы 8', icon: 'assets/interface/ring_chapter_eight.png', chapter: 8, price: 12000, stats: { attack: 75, defense: 48 } },
        { id: 'ring_10', name: 'Кольцо главы 10', icon: 'assets/interface/ring_chapter_ten.png', chapter: 10, price: 20000, stats: { attack: 100, defense: 65 } },
        { id: 'ring_12', name: 'Кольцо главы 12', icon: 'assets/interface/ring_chapter_twelve.png', chapter: 12, price: 35000, stats: { attack: 140, defense: 90 } },
        { id: 'ring_14', name: 'Кольцо главы 14', icon: 'assets/interface/the_ring_chapter_fourteen.png', chapter: 14, price: 60000, stats: { attack: 200, defense: 130 } }
    ],

    // Амулеты по главам
    _AMULETS: [
        { id: 'amulet_1', name: 'Амулет главы 1', icon: 'assets/interface/sherwood_amulet_level_one.png', chapter: 1, price: 500, stats: { hp: 50, defense: 3 } },
        { id: 'amulet_2', name: 'Амулет главы 2', icon: 'assets/interface/sherwood_amulet_level_two.png', chapter: 2, price: 1000, stats: { hp: 100, defense: 6 } },
        { id: 'amulet_3', name: 'Амулет главы 3', icon: 'assets/interface/sherwood_amulet_level_three.png', chapter: 3, price: 2000, stats: { hp: 180, defense: 10 } },
        { id: 'amulet_4', name: 'Амулет главы 4', icon: 'assets/interface/sherwood_amulet_level_four.png', chapter: 4, price: 3500, stats: { hp: 280, defense: 16 } },
        { id: 'amulet_5', name: 'Амулет главы 5', icon: 'assets/interface/sherwood_amulet_level_five.png', chapter: 5, price: 5500, stats: { hp: 400, defense: 24 } }
    ],

    init: function() {
        var player = Sherwood.getPlayer();
        var today = new Date().toDateString();
        
        if (!player.marketData) player.marketData = {};
        if (player.marketData.lastRefreshDate !== today) {
            player.marketData.lastRefreshDate = today;
            player.marketData.purchasedToday = {};
            player.marketData.refreshCountToday = 0;
            Sherwood.saveGame();
        }
        
        this._purchasedToday = player.marketData.purchasedToday || {};
        this._refreshCountToday = player.marketData.refreshCountToday || 0;
        
        if (!player.marketData.shopItems || player.marketData.lastRefreshDate !== today) {
            this._refreshShop();
        } else {
            this._shopItems = player.marketData.shopItems;
        }
    },

    _refreshShop: function() {
        var player = Sherwood.getPlayer();
        var chapter = player.questProgress ? (player.questProgress.currentChapter || 1) : 1;
        
        var pool = this._ALL_GOODS.slice();
        
        for (var i = 0; i < this._INGOT_TYPES.length; i++) {
            var ingot = this._INGOT_TYPES[i];
            if (ingot.chapter <= chapter) {
                pool.push({
                    id: ingot.id, name: ingot.name, icon: ingot.icon,
                    price: 25 + ingot.chapter * 5, currency: 'gold',
                    gives: { ingots: 1 }, quantity: 1, desc: '+1 ' + ingot.name
                });
            }
        }
        
        this._shopItems = [];
        var shuffled = pool.sort(function() { return Math.random() - 0.5; });
        for (var i = 0; i < Math.min(6, shuffled.length); i++) {
            var item = Object.assign({}, shuffled[i]);
            item.shopIndex = i;
            item.tab = 1;
            this._shopItems.push(item);
        }
        
        player.marketData.shopItems = this._shopItems;
        player.marketData.purchasedToday = this._purchasedToday;
        player.marketData.refreshCountToday = this._refreshCountToday;
        player.marketData.lastRefreshDate = new Date().toDateString();
        Sherwood.saveGame();
    },

    getShopItems: function() { return this._shopItems; },

    canRefresh: function() { return this._refreshCountToday < this._maxRefreshesPerDay; },

    refresh: function() {
        if (!this.canRefresh()) return { success: false, reason: 'Лимит обновлений на сегодня' };
        var player = Sherwood.getPlayer();
        if ((player.resources.gold || 0) < 150) return { success: false, reason: 'Нужно 150 золота' };
        Sherwood.spendResource('gold', 150);
        this._refreshCountToday++;
        this._purchasedToday = {};
        player.marketData.refreshCountToday = this._refreshCountToday;
        player.marketData.purchasedToday = this._purchasedToday;
        this._refreshShop();
        Sherwood.saveGame();
        return { success: true };
    },

    // Получить доступные кольца для текущей главы
    getAvailableRings: function() {
        var player = Sherwood.getPlayer();
        var chapter = player.questProgress ? (player.questProgress.currentChapter || 1) : 1;
        var available = [];
        for (var i = 0; i < this._RINGS.length; i++) {
            if (this._RINGS[i].chapter <= chapter) available.push(this._RINGS[i]);
        }
        return available;
    },

    // Получить доступные амулеты для текущей главы
    getAvailableAmulets: function() {
        var player = Sherwood.getPlayer();
        var chapter = player.questProgress ? (player.questProgress.currentChapter || 1) : 1;
        var available = [];
        for (var i = 0; i < this._AMULETS.length; i++) {
            if (this._AMULETS[i].chapter <= chapter) available.push(this._AMULETS[i]);
        }
        return available;
    },

    // Купить кольцо
    buyRing: function(ringId) {
        var ring = null;
        for (var i = 0; i < this._RINGS.length; i++) {
            if (this._RINGS[i].id === ringId) { ring = this._RINGS[i]; break; }
        }
        if (!ring) return { success: false, reason: 'Кольцо не найдено' };
        
        var player = Sherwood.getPlayer();
        if ((player.resources.silver || 0) < ring.price) return { success: false, reason: 'Недостаточно серебра' };
        
        Sherwood.spendResource('silver', ring.price);
        
        var item = {
            id: ring.id,
            name: ring.name,
            icon: ring.icon,
            part: 'ring',
            stats: ring.stats,
            grade: 'rare',
            type: 'equipment',
            quantity: 1,
            sellPrice: Math.floor(ring.price * 0.3)
        };
        
        Sherwood.Bag.addItem(item);
        Sherwood.saveGame();
        return { success: true };
    },

    // Купить амулет
    buyAmulet: function(amuletId) {
        var amulet = null;
        for (var i = 0; i < this._AMULETS.length; i++) {
            if (this._AMULETS[i].id === amuletId) { amulet = this._AMULETS[i]; break; }
        }
        if (!amulet) return { success: false, reason: 'Амулет не найден' };
        
        var player = Sherwood.getPlayer();
        if ((player.resources.silver || 0) < amulet.price) return { success: false, reason: 'Недостаточно серебра' };
        
        Sherwood.spendResource('silver', amulet.price);
        
        var item = {
            id: amulet.id,
            name: amulet.name,
            icon: amulet.icon,
            part: 'amulet',
            stats: amulet.stats,
            grade: 'rare',
            type: 'equipment',
            quantity: 1,
            sellPrice: Math.floor(amulet.price * 0.3)
        };
        
        Sherwood.Bag.addItem(item);
        Sherwood.saveGame();
        return { success: true };
    },

    buyItem: function(shopIndex) {
        if (shopIndex < 0 || shopIndex >= this._shopItems.length) {
            return { success: false, reason: 'Товар не найден' };
        }

        var item = this._shopItems[shopIndex];
        
        if (this._purchasedToday[item.id]) {
            return { success: false, reason: 'Уже куплено сегодня' };
        }

        var player = Sherwood.getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };

        var currency = item.currency;
        if ((player.resources[currency] || 0) < item.price) {
            return { success: false, reason: 'Недостаточно средств' };
        }
        Sherwood.spendResource(currency, item.price);

        if (item.gives) {
            for (var res in item.gives) {
                if (item.gives.hasOwnProperty(res)) {
                    var amount = item.gives[res];
                    
                    if (res === 'wood' || res === 'branches' || res === 'bones' || res === 'feathers') {
                        var itemDefs = {
                            wood: { id: 'wood', name: 'Дерево', icon: 'assets/interface/resource_wood.png', grade: 'common', type: 'resource', maxStack: 99, sellPrice: 2 },
                            branches: { id: 'branch', name: 'Ветка', icon: 'assets/interface/branch_of_the_damned_yew.png', grade: 'common', type: 'resource', maxStack: 99, sellPrice: 3 },
                            bones: { id: 'bone', name: 'Кость', icon: 'assets/interface/bone_growth_of_the_beast.png', grade: 'common', type: 'resource', maxStack: 99, sellPrice: 3 },
                            feathers: { id: 'feather', name: 'Перо', icon: 'assets/interface/feather_beast_1.png', grade: 'common', type: 'resource', maxStack: 99, sellPrice: 3 }
                        };
                        var def = itemDefs[res];
                        if (def) Sherwood.Bag.addItem(Object.assign({}, def, { quantity: amount }));
                    } else if (res === 'skins' || res === 'entranceTickets' || res === 'autoFightTickets' || res === 'portalToken1' || res === 'portalToken2' || res === 'portalToken3') {
                        Sherwood.Bag.addResource(res, amount);
                    } else if (res === 'ingots') {
                        player.resources.ingots = (player.resources.ingots || 0) + amount;
                    }
                }
            }
        }

        this._purchasedToday[item.id] = true;
        player.marketData.purchasedToday = this._purchasedToday;
        Sherwood.saveGame();
        return { success: true, item: item };
    },

    isPurchased: function(shopIndex) {
        if (shopIndex < 0 || shopIndex >= this._shopItems.length) return true;
        return !!this._purchasedToday[this._shopItems[shopIndex].id];
    }
};

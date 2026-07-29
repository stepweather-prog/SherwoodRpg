Sherwood.BlackMarket = {
    _shopItems: [],
    _lastRefresh: null,

    SHOP_TEMPLATES: [
        { id: 'scrolls', name: 'Скрижали', icon: 'assets/interface/resource_appearance_crafting_tablet.png', price: 200, currency: 'silver', type: 'resource', gives: { scrolls: 10 }, desc: '+10 скрижалей' },
        { id: 'wood_pack', name: 'Древесина', icon: 'assets/interface/resource_wood.png', price: 100, currency: 'silver', type: 'resource', gives: { wood: 20 }, desc: '+20 древесины' },
        { id: 'feather_pack', name: 'Перья', icon: 'assets/interface/feather_beast_1.png', price: 80, currency: 'silver', type: 'resource', gives: { feathers: 15 }, desc: '+15 перьев' },
        { id: 'branch_pack', name: 'Ветки', icon: 'assets/interface/branch_of_the_damned_yew.png', price: 80, currency: 'silver', type: 'resource', gives: { branches: 15 }, desc: '+15 веток' },
        { id: 'bone_pack', name: 'Кости', icon: 'assets/interface/bone_growth_of_the_beast.png', price: 80, currency: 'silver', type: 'resource', gives: { bones: 15 }, desc: '+15 костей' },
        { id: 'skin_pack', name: 'Шкуры', icon: 'assets/interface/skin_of_the_sherwood_creature.png', price: 150, currency: 'silver', type: 'resource', gives: { skins: 5 }, desc: '+5 шкур' },
        { id: 'ticket_autofight', name: 'Билет автобоя', icon: 'assets/interface/ticket_autofight.png', price: 300, currency: 'silver', type: 'consumable', gives: { tickets: 1 }, desc: '+1 билет автобоя' }
    ],

    _INGOT_TYPES: [
        { id: 'ingot_chapter_1', name: 'Слиток главы 1', icon: 'assets/ingots resource crafting skin/ingot_chapter_1.png' },
        { id: 'ingot_chapter_2', name: 'Слиток главы 2', icon: 'assets/ingots resource crafting skin/ingot_chapter_2.png' },
        { id: 'ingot_chapter_3', name: 'Слиток главы 3', icon: 'assets/ingots resource crafting skin/ingot_chapter_3.png' },
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
        var player = Sherwood.getPlayer();
        var chapter = player.questProgress ? (player.questProgress.currentChapter || 1) : 1;
        
        this._shopItems = [];
        
        // Базовые товары
        for (var i = 0; i < this.SHOP_TEMPLATES.length; i++) {
            var item = Object.assign({}, this.SHOP_TEMPLATES[i], { shopIndex: this._shopItems.length });
            this._shopItems.push(item);
        }
        
        // Слиток текущей главы
        var ingot = null;
        for (var i = 0; i < this._INGOT_TYPES.length; i++) {
            if (this._INGOT_TYPES[i].id === 'ingot_chapter_' + chapter) {
                ingot = this._INGOT_TYPES[i];
                break;
            }
        }
        if (!ingot) {
            ingot = { id: 'ingot_chapter_1', name: 'Слиток главы 1', icon: 'assets/ingots resource crafting skin/ingot_chapter_1.png' };
        }
        this._shopItems.push({
            id: 'ingot_current',
            name: ingot.name,
            icon: ingot.icon,
            price: 500,
            currency: 'silver',
            type: 'resource',
            gives: { ingots: 5 },
            desc: '+5 ' + ingot.name,
            shopIndex: this._shopItems.length
        });

        // Скины со скидкой
        var skins = Sherwood.Forge ? Sherwood.Forge.getCraftSkins() : [];
        var unlocked = player.unlockedSkins || [];
        for (var i = 0; i < skins.length; i++) {
            var skin = skins[i];
            if (skin.id === 'skin_1_basic') continue;
            if (unlocked.indexOf(skin.id) !== -1) continue;
            
            var skinData = Sherwood.SKIN_BONUSES ? Sherwood.SKIN_BONUSES[skin.id] : null;
            if (!skinData || skinData.chapter > chapter) continue;
            
            var playerScrolls = player.resources.scrolls || 0;
            var playerIngots = player.resources.ingots || 0;
            var playerSilver = player.resources.silver || 0;
            
            var needScrolls = Math.max(0, skin.cost.scrolls - playerScrolls);
            var needIngots = Math.max(0, skin.cost.ingots - playerIngots);
            var needSilver = Math.max(0, skin.cost.silver - playerSilver);
            
            var totalPrice = needScrolls * 30 + needIngots * 100 + needSilver;
            var discount = skin.cost.scrolls * 30 + skin.cost.ingots * 100 + skin.cost.silver - totalPrice;
            
            this._shopItems.push({
                id: 'skin_' + skin.id,
                name: skin.name + ' (Скидка ' + discount + ')',
                icon: skin.icon,
                price: totalPrice,
                currency: 'silver',
                type: 'skin',
                skinId: skin.id,
                desc: 'Не хватает: ' + needScrolls + ' скр. ' + needIngots + ' сл. ' + needSilver + ' сер.',
                shopIndex: this._shopItems.length
            });
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

        player.resources[item.currency] -= item.price;

        if (item.type === 'skin') {
            if (!player.unlockedSkins) player.unlockedSkins = [];
            player.unlockedSkins.push(item.skinId);
            player.resources.scrolls = Math.max(0, (player.resources.scrolls || 0) - Math.max(0, (Sherwood.Forge.getCraftSkins().find(function(s) { return s.id === item.skinId; }) || { cost: { scrolls: 0 } }).cost.scrolls - (player.resources.scrolls || 0)));
        } else if (item.gives) {
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
                    } else if (res === 'branches') {
                        player.resources.branches = (player.resources.branches || 0) + item.gives[res];
                    } else if (res === 'bones') {
                        player.resources.bones = (player.resources.bones || 0) + item.gives[res];
                    } else if (res === 'skins') {
                        for (var j = 0; j < item.gives[res]; j++) {
                            Sherwood.Bag.addItem({
                                id: 'skin_of_the_sherwood_creature',
                                name: 'Шкура шервудской твари',
                                icon: 'assets/interface/skin_of_the_sherwood_creature.png',
                                grade: 'common', type: 'resource', quantity: 1, maxStack: 50, sellPrice: 5
                            });
                        }
                    } else if (res === 'tickets') {
                        player.dungeon.tickets = Math.min(player.dungeon.maxTickets, (player.dungeon.tickets || 0) + item.gives[res]);
                    } else {
                        player.resources[res] = (player.resources[res] || 0) + item.gives[res];
                    }
                }
            }
        }

        Sherwood._recalcStats();
        Sherwood.saveGame();

        return { success: true, item: item };
    },

    getItemPrice: function(itemId) {
        for (var i = 0; i < this._shopItems.length; i++) {
            if (this._shopItems[i].id === itemId) {
                return { price: this._shopItems[i].price, currency: this._shopItems[i].currency };
            }
        }
        return null;
    },

    refresh: function() {
        this._refreshShop();
    }
};

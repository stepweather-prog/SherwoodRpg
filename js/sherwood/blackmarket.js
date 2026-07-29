Sherwood.BlackMarket = {
    _shopItems: [],
    _lastRefresh: null,
    _shopTab: 1,

    SHOP_TEMPLATES: [
        { id: 'scrolls', name: 'Скрижали', icon: 'assets/interface/resource_appearance_crafting_tablet.png', price: 30, currency: 'gold', type: 'resource', gives: { scrolls: 1 }, desc: '+1 скрижаль' },
        { id: 'ingot_current', name: 'Слиток', icon: 'assets/ingots resource crafting skin/ingot_chapter_1.png', price: 25, currency: 'gold', type: 'resource', gives: { ingots: 1 }, desc: '+1 слиток' },
        { id: 'wood_pack', name: 'Древесина', icon: 'assets/interface/resource_wood.png', price: 100, currency: 'silver', type: 'resource', gives: { wood: 20 }, desc: '+20 древесины' },
        { id: 'feather_pack', name: 'Перья', icon: 'assets/interface/feather_beast_1.png', price: 80, currency: 'silver', type: 'resource', gives: { feathers: 15 }, desc: '+15 перьев' },
        { id: 'branch_pack', name: 'Ветки', icon: 'assets/interface/branch_of_the_damned_yew.png', price: 80, currency: 'silver', type: 'resource', gives: { branches: 15 }, desc: '+15 веток' },
        { id: 'bone_pack', name: 'Кости', icon: 'assets/interface/bone_growth_of_the_beast.png', price: 80, currency: 'silver', type: 'resource', gives: { bones: 15 }, desc: '+15 костей' },
        { id: 'skin_pack', name: 'Шкуры', icon: 'assets/interface/skin_of_the_sherwood_creature.png', price: 150, currency: 'silver', type: 'resource', gives: { skins: 5 }, desc: '+5 шкур' },
        { id: 'ticket_autofight', name: 'Билет автобоя', icon: 'assets/interface/ticket_autofight.png', price: 300, currency: 'silver', type: 'consumable', gives: { tickets: 1 }, desc: '+1 билет автобоя' }
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
            var item = Object.assign({}, this.SHOP_TEMPLATES[i]);
            // Слиток текущей главы
            if (item.id === 'ingot_current') {
                var ingot = null;
                for (var j = 0; j < this._INGOT_TYPES.length; j++) {
                    if (this._INGOT_TYPES[j].id === 'ingot_chapter_' + chapter) {
                        ingot = this._INGOT_TYPES[j];
                        break;
                    }
                }
                if (ingot) {
                    item.name = ingot.name;
                    item.icon = ingot.icon;
                }
            }
            item.shopIndex = this._shopItems.length;
            item.tab = 1;
            this._shopItems.push(item);
        }

        // Скины со скидкой
        var skins = Sherwood.Forge ? Sherwood.Forge.getCraftSkins() : [];
        var unlocked = player.unlockedSkins || [];
        var playerScrolls = player.resources.scrolls || 0;
        var playerIngots = player.resources.ingots || 0;
        var playerSilver = player.resources.silver || 0;
        
        for (var i = 0; i < skins.length; i++) {
            var skin = skins[i];
            if (skin.id === 'skin_1_basic') continue;
            if (unlocked.indexOf(skin.id) !== -1) continue;
            
            var skinData = Sherwood.SKIN_BONUSES ? Sherwood.SKIN_BONUSES[skin.id] : null;
            if (!skinData || skinData.chapter > chapter) continue;
            
            var needScrolls = Math.max(0, skin.cost.scrolls - playerScrolls);
            var needIngots = Math.max(0, skin.cost.ingots - playerIngots);
            var needSilver = Math.max(0, skin.cost.silver - playerSilver);
            
            var totalPrice = needScrolls * 30 + needIngots * 100 + needSilver;
            var fullPrice = skin.cost.scrolls * 30 + skin.cost.ingots * 100 + skin.cost.silver;
            var discount = fullPrice - totalPrice;
            
            var descText = '';
            if (needScrolls > 0) descText += needScrolls + ' скр. ';
            if (needIngots > 0) descText += needIngots + ' сл. ';
            if (needSilver > 0) descText += needSilver + ' сер. ';
            if (discount > 0) descText = 'Скидка ' + discount + ' | ' + descText;
            
            this._shopItems.push({
                id: 'skin_' + skin.id,
                name: skin.name,
                icon: skin.icon,
                price: totalPrice,
                currency: 'silver',
                type: 'skin',
                skinId: skin.id,
                desc: descText || 'Бесплатно',
                shopIndex: this._shopItems.length,
                tab: 2
            });
        }

        this._lastRefresh = Date.now();
    },

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
        } else if (item.gives) {
            for (var res in item.gives) {
                if (item.gives.hasOwnProperty(res)) {
                    if (res === 'scrolls') {
                        player.resources.scrolls = (player.resources.scrolls || 0) + item.gives[res];
                    } else if (res === 'ingots') {
                        player.resources.ingots = (player.resources.ingots || 0) + item.gives[res];
                    } else if (res === 'wood') {
                        Sherwood.Bag.addItem({
                            id: 'wood', name: 'Дерево',
                            icon: 'assets/interface/resource_wood.png',
                            grade: 'common', type: 'resource', quantity: item.gives[res], maxStack: 99, sellPrice: 2
                        });
                    } else if (res === 'feathers') {
                        Sherwood.Bag.addItem({
                            id: 'feather', name: 'Перо',
                            icon: 'assets/interface/feather_beast_1.png',
                            grade: 'common', type: 'resource', quantity: item.gives[res], maxStack: 99, sellPrice: 3
                        });
                    } else if (res === 'branches') {
                        Sherwood.Bag.addItem({
                            id: 'branch', name: 'Ветка',
                            icon: 'assets/interface/branch_of_the_damned_yew.png',
                            grade: 'common', type: 'resource', quantity: item.gives[res], maxStack: 99, sellPrice: 3
                        });
                    } else if (res === 'bones') {
                        Sherwood.Bag.addItem({
                            id: 'bone', name: 'Кость',
                            icon: 'assets/interface/bone_growth_of_the_beast.png',
                            grade: 'common', type: 'resource', quantity: item.gives[res], maxStack: 99, sellPrice: 3
                        });
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

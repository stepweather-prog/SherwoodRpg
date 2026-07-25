Sherwood.Forge = {
    _enhanceChances: [
        { level: 1, chance: 100, break: false },
        { level: 2, chance: 95, break: false },
        { level: 3, chance: 85, break: false },
        { level: 4, chance: 75, break: false },
        { level: 5, chance: 65, break: false },
        { level: 6, chance: 55, break: false },
        { level: 7, chance: 45, break: false },
        { level: 8, chance: 35, break: true },
        { level: 9, chance: 25, break: true },
        { level: 10, chance: 15, break: true },
        { level: 11, chance: 10, break: true },
        { level: 12, chance: 7, break: true },
        { level: 13, chance: 5, break: true },
        { level: 14, chance: 3, break: true },
        { level: 15, chance: 1, break: true }
    ],

    _enhanceCosts: function(level) {
        return { gold: 10 + level * 15, silver: 50 + level * 30 };
    },

    getEnhanceInfo: function(itemGrade) {
        var maxLevel = itemGrade === 'legendary' ? 20 : itemGrade === 'epic' ? 17 : itemGrade === 'rare' ? 14 : itemGrade === 'uncommon' ? 11 : 8;
        return { maxLevel: maxLevel };
    },

    enhanceItem: function(itemIndex) {
        var bag = Sherwood.Bag;
        var items = bag.getItems();
        if (itemIndex < 0 || itemIndex >= items.length) return { success: false, reason: 'Предмет не найден' };
        var item = items[itemIndex];
        if (!item.part && !item.type) return { success: false, reason: 'Нельзя улучшить' };
        var currentLevel = item.enhancement || 0;
        var info = this.getEnhanceInfo(item.grade || 'common');
        if (currentLevel >= info.maxLevel) return { success: false, reason: 'Максимальный уровень' };
        var nextLevel = currentLevel + 1;
        var cost = this._enhanceCosts(nextLevel);
        var player = Sherwood.getPlayer();
        if ((player.resources.gold || 0) < cost.gold || (player.resources.silver || 0) < cost.silver) {
            return { success: false, reason: 'Недостаточно ресурсов' };
        }
        player.resources.gold -= cost.gold;
        player.resources.silver -= cost.silver;
        var chanceData = this._enhanceChances.find(function(c) { return c.level === nextLevel; }) || { chance: 50, break: false };
        var roll = Math.random() * 100;
        if (roll < chanceData.chance) {
            item.enhancement = nextLevel;
            if (item.stats) {
                item.stats.attack = (item.stats.attack || 0) + Math.floor(nextLevel * 1.5);
                item.stats.defense = (item.stats.defense || 0) + Math.floor(nextLevel * 0.8);
            }
            Sherwood._recalcStats();
            Sherwood.saveGame();
            return { success: true, enhanced: true, newLevel: nextLevel };
        } else if (chanceData.break) {
            bag.removeItem(itemIndex);
            Sherwood._recalcStats();
            Sherwood.saveGame();
            return { success: true, broken: true, item: item };
        } else {
            Sherwood.saveGame();
            return { success: true, failed: true, currentLevel: currentLevel };
        }
    },

    // ========== КРАФТ СТРЕЛ ==========
    getArrowCraftInfo: function() {
        var bag = Sherwood.Bag;
        var items = bag.getItems();
        var branches = 0, feathers = 0, bones = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.id && item.id.indexOf('branch') === 0) branches += item.quantity || 1;
            if (item.id && item.id.indexOf('feather') === 0) feathers += item.quantity || 1;
            if (item.id && item.id.indexOf('bone') === 0) bones += item.quantity || 1;
        }
        var canCraft = Math.min(branches, feathers, bones);
        return { branches: branches, feathers: feathers, bones: bones, canCraft: canCraft };
    },

    craftArrow: function() {
        var info = this.getArrowCraftInfo();
        if (info.canCraft <= 0) return { success: false, reason: 'Недостаточно ингредиентов' };
        var bag = Sherwood.Bag;
        // Удаляем по одному каждого ингредиента
        var removed = { branch: false, feather: false, bone: false };
        var items = bag.getItems();
        for (var i = items.length - 1; i >= 0; i--) {
            var item = items[i];
            if (!removed.branch && item.id && item.id.indexOf('branch') === 0) {
                bag.removeItem(i, 1); removed.branch = true;
            } else if (!removed.feather && item.id && item.id.indexOf('feather') === 0) {
                bag.removeItem(i, 1); removed.feather = true;
            } else if (!removed.bone && item.id && item.id.indexOf('bone') === 0) {
                bag.removeItem(i, 1); removed.bone = true;
            }
            if (removed.branch && removed.feather && removed.bone) break;
        }
        bag.addItem({
            id: 'arrow_' + Date.now(),
            name: 'Стрела Шервудской лощины',
            icon: 'assets/interface/sherwood_hollow_arrow.png',
            grade: 'rare',
            type: 'resource',
            quantity: 1,
            maxStack: 999,
            sellPrice: 25
        });
        return { success: true };
    },

    craftArrowBatch: function(count) {
        var info = this.getArrowCraftInfo();
        count = Math.min(count || 1, info.canCraft);
        if (count <= 0) return { success: false, reason: 'Недостаточно ингредиентов' };
        for (var i = 0; i < count; i++) this.craftArrow();
        return { success: true, crafted: count };
    },

    getArrowCount: function() {
        var bag = Sherwood.Bag;
        var items = bag.getItems();
        var count = 0;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id && items[i].id.indexOf('arrow_') === 0) count += items[i].quantity || 1;
        }
        return count;
    },

    // ========== КРАФТ КОЛЕЦ ==========
    getRingCraftInfo: function() {
        var player = Sherwood.getPlayer();
        var ring = player.equipment ? (player.equipment.ring || null) : null;
        var currentLevel = ring ? (ring.level || 1) : 1;
        var maxLevel = 50;
        if (currentLevel >= maxLevel) return { canCraft: false, reason: 'Максимальный уровень', currentLevel: currentLevel, maxLevel: maxLevel };
        var cost = Math.floor(5 * Math.pow(currentLevel + 1, 1.5));
        var scrolls = player.resources.scrolls || 0;
        return { currentLevel: currentLevel, maxLevel: maxLevel, cost: cost, scrolls: scrolls, canCraft: scrolls >= cost };
    },

    craftRing: function() {
        var info = this.getRingCraftInfo();
        if (!info.canCraft) return { success: false, reason: info.reason || 'Недостаточно скрижалей' };
        var player = Sherwood.getPlayer();
        player.resources.scrolls -= info.cost;
        var newLevel = info.currentLevel + 1;
        var bonus = Sherwood.getJewelryBonus ? Sherwood.getJewelryBonus(newLevel, 5) : newLevel * 10;
        player.equipment.ring = {
            name: 'Кольцо силы ' + newLevel,
            icon: 'assets/interface/ring_first_level.png',
            part: 'ring',
            grade: newLevel >= 40 ? 'legendary' : newLevel >= 30 ? 'epic' : newLevel >= 20 ? 'rare' : newLevel >= 10 ? 'uncommon' : 'common',
            level: newLevel,
            stats: { attack: bonus, defense: Math.floor(bonus * 0.5) }
        };
        if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, newLevel: newLevel, bonus: bonus };
    },

    // ========== КРАФТ АМУЛЕТА ==========
    getAmuletCraftInfo: function() {
        var player = Sherwood.getPlayer();
        var amulet = player.equipment ? (player.equipment.amulet || null) : null;
        var currentLevel = amulet ? (amulet.level || 1) : 1;
        var maxLevel = 50;
        if (currentLevel >= maxLevel) return { canCraft: false, reason: 'Максимальный уровень', currentLevel: currentLevel, maxLevel: maxLevel };
        var cost = Math.floor(5 * Math.pow(currentLevel + 1, 1.5));
        var scrolls = player.resources.scrolls || 0;
        return { currentLevel: currentLevel, maxLevel: maxLevel, cost: cost, scrolls: scrolls, canCraft: scrolls >= cost };
    },

    craftAmulet: function() {
        var info = this.getAmuletCraftInfo();
        if (!info.canCraft) return { success: false, reason: info.reason || 'Недостаточно скрижалей' };
        var player = Sherwood.getPlayer();
        player.resources.scrolls -= info.cost;
        var newLevel = info.currentLevel + 1;
        var bonus = Sherwood.getJewelryBonus ? Sherwood.getJewelryBonus(newLevel, 3) : newLevel * 6;
        player.equipment.amulet = {
            name: 'Амулет защиты ' + newLevel,
            icon: 'assets/interface/sherwood_amulet_level_one.png',
            part: 'amulet',
            grade: newLevel >= 40 ? 'legendary' : newLevel >= 30 ? 'epic' : newLevel >= 20 ? 'rare' : newLevel >= 10 ? 'uncommon' : 'common',
            level: newLevel,
            stats: { hp: bonus * 2, defense: bonus }
        };
        if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, newLevel: newLevel, bonus: bonus };
    },

    // ========== КРАФТ ОБЛИКОВ (СКИНЫ) ==========
    getCraftSkins: function() {
        return [
            { id: 'skin_1_basic', name: 'Охотник', chapter: 1, cost: { ingots: 0, scrolls: 0, silver: 0 }, icon: 'assets/hero_skins/skin_1_basic.png' },
            { id: 'skin_2', name: 'Следопыт', chapter: 2, cost: { ingots: 10, scrolls: 5, silver: 5000 }, icon: 'assets/hero_skins/skin_2.png' },
            { id: 'skin_3', name: 'Лесной страж', chapter: 3, cost: { ingots: 25, scrolls: 15, silver: 12000 }, icon: 'assets/hero_skins/skin_3.png' },
            { id: 'skin_4', name: 'Болотный охотник', chapter: 4, cost: { ingots: 50, scrolls: 30, silver: 25000 }, icon: 'assets/hero_skins/skin_4.png' },
            { id: 'skin_5', name: 'Пещерный воин', chapter: 5, cost: { ingots: 80, scrolls: 50, silver: 40000 }, icon: 'assets/hero_skins/skin_5.png' },
            { id: 'skin_6', name: 'Рыцарь Шервуда', chapter: 6, cost: { ingots: 120, scrolls: 75, silver: 60000 }, icon: 'assets/hero_skins/skin_6.png' },
            { id: 'skin_7', name: 'Теневой лучник', chapter: 7, cost: { ingots: 170, scrolls: 100, silver: 85000 }, icon: 'assets/hero_skins/skin_7.png' },
            { id: 'skin_8', name: 'Изумрудный следопыт', chapter: 8, cost: { ingots: 230, scrolls: 140, silver: 115000 }, icon: 'assets/hero_skins/skin_8.png' },
            { id: 'skin_9', name: 'Проклятый охотник', chapter: 9, cost: { ingots: 300, scrolls: 180, silver: 150000 }, icon: 'assets/hero_skins/skin_9.png' },
            { id: 'skin_10', name: 'Владыка порталов', chapter: 10, cost: { ingots: 400, scrolls: 240, silver: 200000 }, icon: 'assets/hero_skins/skin_10.png' },
            { id: 'skin_11', name: 'Страж бездны', chapter: 11, cost: { ingots: 550, scrolls: 330, silver: 280000 }, icon: 'assets/hero_skins/skin_11.png' },
            { id: 'skin_12', name: 'Королевский егерь', chapter: 12, cost: { ingots: 750, scrolls: 450, silver: 380000 }, icon: 'assets/hero_skins/skin_12.png' },
            { id: 'skin_13', name: 'Хранитель склепа', chapter: 13, cost: { ingots: 1000, scrolls: 600, silver: 500000 }, icon: 'assets/hero_skins/skin_13.png' },
            { id: 'skin_14', name: 'Отродье Шервуда', chapter: 14, cost: { ingots: 1300, scrolls: 700, silver: 750000 }, icon: 'assets/hero_skins/skin_14.png' },
            { id: 'skin_15', name: 'Вечный Хранитель', chapter: 15, cost: { ingots: 1500, scrolls: 800, silver: 1000000 }, icon: 'assets/hero_skins/skin_15.png' }
        ];
    },

    canCraftSkin: function(skinId) {
        var skin = this.getCraftSkins().find(function(s) { return s.id === skinId; });
        if (!skin) return { can: false, reason: 'Скин не найден' };
        var player = Sherwood.getPlayer();
        var progress = player.questProgress || { completed: [] };
        if (skin.chapter > 1 && progress.completed.indexOf(skin.chapter - 1) === -1) {
            return { can: false, reason: 'Нужно пройти главу ' + skin.chapter };
        }
        if (player.unlockedSkins && player.unlockedSkins.indexOf(skinId) !== -1) {
            return { can: false, reason: 'Уже разблокирован' };
        }
        var resources = player.resources || {};
        if ((resources.ingots || 0) < skin.cost.ingots) return { can: false, reason: 'Недостаточно слитков' };
        if ((resources.scrolls || 0) < skin.cost.scrolls) return { can: false, reason: 'Недостаточно скрижалей' };
        if ((resources.silver || 0) < skin.cost.silver) return { can: false, reason: 'Недостаточно серебра' };
        return { can: true };
    },

    craftSkin: function(skinId) {
        var check = this.canCraftSkin(skinId);
        if (!check.can) return check;
        var skin = this.getCraftSkins().find(function(s) { return s.id === skinId; });
        var player = Sherwood.getPlayer();
        player.resources.ingots -= skin.cost.ingots;
        player.resources.scrolls -= skin.cost.scrolls;
        player.resources.silver -= skin.cost.silver;
        if (!player.unlockedSkins) player.unlockedSkins = [];
        player.unlockedSkins.push(skinId);
        Sherwood.saveGame();
        return { success: true, skin: skin };
    },

    equipSkin: function(skinId) {
        var player = Sherwood.getPlayer();
        if (!player.unlockedSkins || player.unlockedSkins.indexOf(skinId) === -1) {
            return { success: false, reason: 'Скин не разблокирован' };
        }
        player.activeSkin = skinId;
        Sherwood.saveGame();
        return { success: true, skinId: skinId };
    },

    getActiveSkin: function() {
        var player = Sherwood.getPlayer();
        return player.activeSkin || 'skin_1_basic';
    }
};

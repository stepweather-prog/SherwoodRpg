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

    // ========== ЗАТОЧКА ==========

    getEnhanceInfo: function(itemGrade) {
        var maxLevel = itemGrade === 'legendary' ? 20 : 
                       itemGrade === 'epic' ? 17 : 
                       itemGrade === 'rare' ? 14 : 
                       itemGrade === 'uncommon' ? 11 : 8;
        return { maxLevel: maxLevel };
    },

    enhanceItem: function(itemIndex) {
        var bag = Sherwood.Bag;
        var items = bag.getItems();
        if (itemIndex < 0 || itemIndex >= items.length) {
            return { success: false, reason: 'Предмет не найден' };
        }
        var item = items[itemIndex];
        if (!item.part && !item.type) {
            return { success: false, reason: 'Нельзя улучшить' };
        }

        var currentLevel = item.enhancement || 0;
        var info = this.getEnhanceInfo(item.grade || 'common');
        if (currentLevel >= info.maxLevel) {
            return { success: false, reason: 'Максимальный уровень' };
        }

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
            // Успех
            item.enhancement = nextLevel;
            if (item.stats) {
                item.stats.attack = (item.stats.attack || 0) + Math.floor(nextLevel * 1.5);
                item.stats.defense = (item.stats.defense || 0) + Math.floor(nextLevel * 0.8);
            }
            Sherwood._recalcStats();
            Sherwood.saveGame();
            return { success: true, enhanced: true, newLevel: nextLevel };
        } else if (chanceData.break) {
            // Поломка
            bag.removeItem(itemIndex);
            Sherwood._recalcStats();
            Sherwood.saveGame();
            return { success: true, broken: true, item: item };
        } else {
            // Неудача (без поломки)
            Sherwood.saveGame();
            return { success: true, failed: true, currentLevel: currentLevel };
        }
    },

    // ========== СТРЕЛЫ ==========

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
        if (info.canCraft <= 0) {
            return { success: false, reason: 'Недостаточно ингредиентов' };
        }

        var bag = Sherwood.Bag;
        var removed = { branch: false, feather: false, bone: false };
        var items = bag.getItems();

        for (var i = items.length - 1; i >= 0; i--) {
            var item = items[i];
            if (!removed.branch && item.id && item.id.indexOf('branch') === 0) {
                bag.removeItem(i, 1);
                removed.branch = true;
            } else if (!removed.feather && item.id && item.id.indexOf('feather') === 0) {
                bag.removeItem(i, 1);
                removed.feather = true;
            } else if (!removed.bone && item.id && item.id.indexOf('bone') === 0) {
                bag.removeItem(i, 1);
                removed.bone = true;
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
        if (count <= 0) {
            return { success: false, reason: 'Недостаточно ингредиентов' };
        }

        for (var i = 0; i < count; i++) {
            this.craftArrow();
        }

        return { success: true, crafted: count };
    },

    getArrowCount: function() {
        var bag = Sherwood.Bag;
        var items = bag.getItems();
        var count = 0;

        for (var i = 0; i < items.length; i++) {
            if (items[i].id && items[i].id.indexOf('arrow_') === 0) {
                count += items[i].quantity || 1;
            }
        }

        return count;
    },

    // ========== КОЛЬЦА ==========

    getRingCraftInfo: function() {
        var player = Sherwood.getPlayer();
        var ring = player.equipment ? (player.equipment.ring || null) : null;
        var currentLevel = ring ? (ring.level || 1) : 1;
        var maxLevel = 50;

        if (currentLevel >= maxLevel) {
            return { canCraft: false, reason: 'Максимальный уровень', currentLevel: currentLevel, maxLevel: maxLevel };
        }

        var cost = Math.floor(5 * Math.pow(currentLevel + 1, 1.5));
        var scrolls = player.resources.scrolls || 0;

        return {
            currentLevel: currentLevel,
            maxLevel: maxLevel,
            cost: cost,
            scrolls: scrolls,
            canCraft: scrolls >= cost
        };
    },

    craftRing: function() {
        var info = this.getRingCraftInfo();
        if (!info.canCraft) {
            return { success: false, reason: info.reason || 'Недостаточно скрижалей' };
        }

        var player = Sherwood.getPlayer();
        player.resources.scrolls -= info.cost;

        var newLevel = info.currentLevel + 1;
        var bonus = Sherwood.getJewelryBonus ? Sherwood.getJewelryBonus(newLevel, 5) : newLevel * 10;

        var grade = newLevel >= 40 ? 'legendary' :
                    newLevel >= 30 ? 'epic' :
                    newLevel >= 20 ? 'rare' :
                    newLevel >= 10 ? 'uncommon' : 'common';

        player.equipment.ring = {
            name: 'Кольцо силы ' + newLevel,
            icon: 'assets/interface/ring_first_level.png',
            part: 'ring',
            grade: grade,
            level: newLevel,
            stats: { attack: bonus, defense: Math.floor(bonus * 0.5) }
        };

        if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, newLevel: newLevel, bonus: bonus };
    },

    // ========== АМУЛЕТЫ ==========

    getAmuletCraftInfo: function() {
        var player = Sherwood.getPlayer();
        var amulet = player.equipment ? (player.equipment.amulet || null) : null;
        var currentLevel = amulet ? (amulet.level || 1) : 1;
        var maxLevel = 50;

        if (currentLevel >= maxLevel) {
            return { canCraft: false, reason: 'Максимальный уровень', currentLevel: currentLevel, maxLevel: maxLevel };
        }

        var cost = Math.floor(5 * Math.pow(currentLevel + 1, 1.5));
        var scrolls = player.resources.scrolls || 0;

        return {
            currentLevel: currentLevel,
            maxLevel: maxLevel,
            cost: cost,
            scrolls: scrolls,
            canCraft: scrolls >= cost
        };
    },

    craftAmulet: function() {
        var info = this.getAmuletCraftInfo();
        if (!info.canCraft) {
            return { success: false, reason: info.reason || 'Недостаточно скрижалей' };
        }

        var player = Sherwood.getPlayer();
        player.resources.scrolls -= info.cost;

        var newLevel = info.currentLevel + 1;
        var bonus = Sherwood.getJewelryBonus ? Sherwood.getJewelryBonus(newLevel, 3) : newLevel * 6;

        var grade = newLevel >= 40 ? 'legendary' :
                    newLevel >= 30 ? 'epic' :
                    newLevel >= 20 ? 'rare' :
                    newLevel >= 10 ? 'uncommon' : 'common';

        player.equipment.amulet = {
            name: 'Амулет защиты ' + newLevel,
            icon: 'assets/interface/sherwood_amulet_level_one.png',
            part: 'amulet',
            grade: grade,
            level: newLevel,
            stats: { hp: bonus * 2, defense: bonus }
        };

        if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, newLevel: newLevel, bonus: bonus };
    },

    // ========== СКИНЫ ==========

    getCraftSkins: function() {
    var allSkins = [
        'skin1_01','skin1_02','skin1_03',
        'skin2_01','skin2_02','skin2_03','bonus_skin_2',
        'skin3_01','skin3_02','skin3_03',
        'skin4_01','skin4_02','skin4_03','bonus_skin_4',
        'skin5_01','skin5_02','skin5_03',
        'skin6_01','skin6_02','skin6_03','bonus_skin_6',
        'skin7_01','skin7_02','skin7_03',
        'skin8_01','skin8_02','skin8_03','bonus_skin_8',
        'skin9_01','skin9_02','skin9_03',
        'skin10_01','skin10_02','skin10_03','bonus_skin_10',
        'skin11_01','skin11_02','skin11_03',
        'skin12_01','skin12_02','skin12_03','bonus_skin_12',
        'skin13_01','skin13_02','skin13_03',
        'skin14_01','skin14_02','skin14_03','bonus_skin_14',
        'skin15_01','skin15_02','skin15_03',
        'skin16_01','skin16_02','skin16_03','bonus_skin_sec'
    ];
    var result = [];
    for (var i = 0; i < allSkins.length; i++) {
        var sid = allSkins[i];
        var data = Sherwood.SKIN_BONUSES[sid];
        if (data) {
            result.push({
                id: sid,
                name: data.name,
                chapter: data.chapter,
                cost: { ingots: 0, scrolls: 0, silver: 0 },
                icon: 'assets/hero_skins/' + sid + '.png'
            });
        }
    }
    return result;
},

getUnlockedSkins: function() {
    var player = Sherwood.getPlayer();
    return player.unlockedSkins || ['skin1_01'];
},

canCraftSkin: function(skinId) {
    var player = Sherwood.getPlayer();
    if (!player) return { can: false, reason: 'Игрок не найден' };
    if (player.unlockedSkins && player.unlockedSkins.indexOf(skinId) !== -1) {
        return { can: false, reason: 'Уже разблокирован' };
    }
    return { can: true };
},

    craftSkin: function(skinId) {
        var check = this.canCraftSkin(skinId);
        if (!check.can) return check;

        var skin = null;
        var skins = this.getCraftSkins();
        for (var i = 0; i < skins.length; i++) {
            if (skins[i].id === skinId) {
                skin = skins[i];
                break;
            }
        }
        if (!skin) return { success: false, reason: 'Скин не найден' };

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
    },

    // Получение информации о скине по ID
    getSkinInfo: function(skinId) {
        var skins = this.getCraftSkins();
        for (var i = 0; i < skins.length; i++) {
            if (skins[i].id === skinId) {
                return skins[i];
            }
        }
        return null;
    }
};

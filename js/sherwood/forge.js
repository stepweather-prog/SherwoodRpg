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

        Sherwood.spendResource('gold', cost.gold);
        Sherwood.spendResource('silver', cost.silver);

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

    // ========== ЗАТОЧКА ЭКИПИРОВКИ ==========

    enhanceEquipped: function(type) {
        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };
        
        if (type === 'ring') {
            var ring = Sherwood.Bag && Sherwood.Bag._equipment ? Sherwood.Bag._equipment.ring : null;
            if (!ring) return { success: false, reason: 'Нет кольца' };
            
            var currentLevel = ring.enhancement || 0;
            var cost = Math.round(50 * Math.pow(1.3, currentLevel));
            
            if ((p.resources.silver || 0) < cost) {
                return { success: false, reason: 'Нужно ' + cost + ' серебра' };
            }
            
            p.resources.silver -= cost;
            ring.enhancement = currentLevel + 1;
            if (!ring.stats) ring.stats = {};
            ring.stats.attack = (ring.stats.attack || 0) + 2;
            ring.stats.defense = (ring.stats.defense || 0) + 2;
            Sherwood.Bag._save();
            
        } else if (type === 'amulet') {
            var amulet = Sherwood.Bag && Sherwood.Bag._equipment ? Sherwood.Bag._equipment.amulet : null;
            if (!amulet) return { success: false, reason: 'Нет амулета' };
            
            var currentLevel = amulet.enhancement || 0;
            var cost = Math.round(50 * Math.pow(1.3, currentLevel));
            
            if ((p.resources.silver || 0) < cost) {
                return { success: false, reason: 'Нужно ' + cost + ' серебра' };
            }
            
            p.resources.silver -= cost;
            amulet.enhancement = currentLevel + 1;
            if (!amulet.stats) amulet.stats = {};
            amulet.stats.hp = (amulet.stats.hp || 0) + 5;
            amulet.stats.defense = (amulet.stats.defense || 0) + 2;
            Sherwood.Bag._save();
            
        } else if (type === 'skin') {
            var activeSkin = this.getActiveSkin ? this.getActiveSkin() : null;
            if (!activeSkin) return { success: false, reason: 'Нет скина' };
            
            if (!p.activeSkinLevels) p.activeSkinLevels = {};
            var currentLevel = p.activeSkinLevels[activeSkin] || 0;
            var cost = Math.round(50 * Math.pow(1.3, currentLevel));
            
            if ((p.resources.silver || 0) < cost) {
                return { success: false, reason: 'Нужно ' + cost + ' серебра' };
            }
            
            p.resources.silver -= cost;
            p.activeSkinLevels[activeSkin] = currentLevel + 1;
        } else {
            return { success: false, reason: 'Неизвестный тип' };
        }
        
        if (Sherwood._recalcStats) Sherwood._recalcStats();
        if (Sherwood.saveGame) Sherwood.saveGame();
        
        return { success: true };
    },

    getEnhanceCost: function(type) {
        var p = Sherwood.getPlayer();
        if (!p) return 0;
        
        if (type === 'ring') {
            var ring = Sherwood.Bag && Sherwood.Bag._equipment ? Sherwood.Bag._equipment.ring : null;
            if (!ring) return 0;
            return Math.round(50 * Math.pow(1.3, ring.enhancement || 0));
        } else if (type === 'amulet') {
            var amulet = Sherwood.Bag && Sherwood.Bag._equipment ? Sherwood.Bag._equipment.amulet : null;
            if (!amulet) return 0;
            return Math.round(50 * Math.pow(1.3, amulet.enhancement || 0));
        } else if (type === 'skin') {
            var activeSkin = this.getActiveSkin ? this.getActiveSkin() : null;
            if (!activeSkin) return 0;
            if (!p.activeSkinLevels) p.activeSkinLevels = {};
            return Math.round(50 * Math.pow(1.3, p.activeSkinLevels[activeSkin] || 0));
        }
        return 0;
    },

    getEnhanceLevel: function(type) {
        var p = Sherwood.getPlayer();
        if (!p) return 0;
        
        if (type === 'ring') {
            var ring = Sherwood.Bag && Sherwood.Bag._equipment ? Sherwood.Bag._equipment.ring : null;
            return ring ? (ring.enhancement || 0) : 0;
        } else if (type === 'amulet') {
            var amulet = Sherwood.Bag && Sherwood.Bag._equipment ? Sherwood.Bag._equipment.amulet : null;
            return amulet ? (amulet.enhancement || 0) : 0;
        } else if (type === 'skin') {
            var activeSkin = this.getActiveSkin ? this.getActiveSkin() : null;
            if (!activeSkin) return 0;
            if (!p.activeSkinLevels) p.activeSkinLevels = {};
            return p.activeSkinLevels[activeSkin] || 0;
        }
        return 0;
    },

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
                    cost: { 
                        drawings: Math.ceil(data.chapter / 3), 
                        tablets: Math.ceil(data.chapter / 2)
                    },
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

        var resources = Sherwood.Bag ? Sherwood.Bag.getResources() : {};
        var player = Sherwood.getPlayer();
        
        var haveDrawings = resources.skinTablets || 0;
        var haveScrolls = resources.skinTablets || 0;
        var haveGold = player.resources.gold || 0;

        var needDrawings = Math.max(0, skin.cost.drawings - haveDrawings);
        var needScrolls = Math.max(0, skin.cost.tablets - haveScrolls);

        var drawingCostGold = 500;
        var scrollCostGold = 100;

        var totalGoldNeeded = 
            needDrawings * drawingCostGold + 
            needScrolls * scrollCostGold;

        if (totalGoldNeeded > haveGold) {
            return { 
                success: false, 
                reason: 'Не хватает: ' + totalGoldNeeded + ' золота для докупки (у вас ' + haveGold + ')' 
            };
        }

        if (totalGoldNeeded > 0) {
            Sherwood.spendResource('gold', totalGoldNeeded);
        }

        if (skin.cost.drawings > 0) {
            if (haveDrawings >= skin.cost.drawings) {
                Sherwood.Bag.spendResource('skinTablets', skin.cost.drawings);
            } else {
                Sherwood.Bag.spendResource('skinTablets', haveDrawings);
            }
        }

        if (!player.unlockedSkins) player.unlockedSkins = [];
        player.unlockedSkins.push(skinId);

        Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, skin: skin, goldSpent: totalGoldNeeded };
    },

    equipSkin: function(skinId) {
        var player = Sherwood.getPlayer();
        if (!player.unlockedSkins || player.unlockedSkins.indexOf(skinId) === -1) {
            return { success: false, reason: 'Скин не разблокирован' };
        }
        player.activeSkin = skinId;
        Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, skinId: skinId };
    },

    getActiveSkin: function() {
        var player = Sherwood.getPlayer();
        return player.activeSkin || 'skin_1_basic';
    },

    getSkinInfo: function(skinId) {
        var skins = this.getCraftSkins();
        for (var i = 0; i < skins.length; i++) {
            if (skins[i].id === skinId) {
                return skins[i];
            }
        }
        return null;
    },

    // ========== КОЛЬЦА ==========

    getRingCraftInfo: function() {
        var ring = Sherwood.Bag ? Sherwood.Bag._equipment.ring : null;
        var currentLevel = ring ? (ring.level || 1) : 1;
        var maxLevel = 50;
        var cost = Math.floor(5 * Math.pow(currentLevel + 1, 1.5));
        var tablets = Sherwood.Bag ? Sherwood.Bag.getResource('ringTablets') : 0;
        var gold = Sherwood.getPlayer().resources.gold || 0;

        return {
            currentLevel: currentLevel,
            maxLevel: maxLevel,
            cost: cost,
            tablets: tablets,
            gold: gold,
            canCraft: currentLevel < maxLevel && (tablets >= cost || gold >= (cost - tablets) * 100)
        };
    },

    craftRing: function() {
        var info = this.getRingCraftInfo();
        if (info.currentLevel >= info.maxLevel) {
            return { success: false, reason: 'Максимальный уровень' };
        }

        var haveTablets = info.tablets;
        var needTablets = Math.max(0, info.cost - haveTablets);
        var goldNeeded = needTablets * 100;

        var player = Sherwood.getPlayer();
        if (goldNeeded > (player.resources.gold || 0)) {
            return { success: false, reason: 'Нужно ' + needTablets + ' скрижалей или ' + goldNeeded + ' золота' };
        }

        if (haveTablets >= info.cost) {
            Sherwood.Bag.spendResource('ringTablets', info.cost);
        } else {
            Sherwood.Bag.spendResource('ringTablets', haveTablets);
            Sherwood.spendResource('gold', goldNeeded);
        }

        var newLevel = info.currentLevel + 1;
        var bonus = Sherwood.getJewelryBonus ? Sherwood.getJewelryBonus(newLevel, 5) : newLevel * 10;

        var grade = newLevel >= 40 ? 'legendary' :
                    newLevel >= 30 ? 'epic' :
                    newLevel >= 20 ? 'rare' :
                    newLevel >= 10 ? 'uncommon' : 'common';
var ringIcon = 'assets/interface/ring_first_level.png';
if (newLevel >= 60) ringIcon = 'assets/interface/the_ring_chapter_fourteen.png';
else if (newLevel >= 50) ringIcon = 'assets/interface/ring_chapter_twelve.png';
else if (newLevel >= 40) ringIcon = 'assets/interface/ring_chapter_ten.png';
else if (newLevel >= 30) ringIcon = 'assets/interface/ring_chapter_eight.png';
else if (newLevel >= 20) ringIcon = 'assets/interface/ring_chapter_six.png';
else if (newLevel >= 15) ringIcon = 'assets/interface/ring_fifth_level.png';
else if (newLevel >= 12) ringIcon = 'assets/interface/ring_fourth_level.png';
else if (newLevel >= 8) ringIcon = 'assets/interface/ring_third_level.png';
else if (newLevel >= 4) ringIcon = 'assets/interface/the_ring_chapter_fourteen.png';
        Sherwood.Bag._equipment.ring = {
            name: 'Кольцо силы ' + newLevel,
            icon: ringIcon,
            part: 'ring',
            grade: grade,
            level: newLevel,
            stats: { attack: bonus, defense: Math.floor(bonus * 0.5) }
        };

        Sherwood.Bag._save();
        Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, newLevel: newLevel, bonus: bonus };
    },

    // ========== АМУЛЕТЫ ==========

    getAmuletCraftInfo: function() {
        var amulet = Sherwood.Bag ? Sherwood.Bag._equipment.amulet : null;
        var currentLevel = amulet ? (amulet.level || 1) : 1;
        var maxLevel = 50;
        var cost = Math.floor(5 * Math.pow(currentLevel + 1, 1.5));
        var tablets = Sherwood.Bag ? Sherwood.Bag.getResource('amuletTablets') : 0;
        var gold = Sherwood.getPlayer().resources.gold || 0;

        return {
            currentLevel: currentLevel,
            maxLevel: maxLevel,
            cost: cost,
            tablets: tablets,
            gold: gold,
            canCraft: currentLevel < maxLevel && (tablets >= cost || gold >= (cost - tablets) * 100)
        };
    },

    craftAmulet: function() {
        var info = this.getAmuletCraftInfo();
        if (info.currentLevel >= info.maxLevel) {
            return { success: false, reason: 'Максимальный уровень' };
        }

        var haveTablets = info.tablets;
        var needTablets = Math.max(0, info.cost - haveTablets);
        var goldNeeded = needTablets * 100;

        var player = Sherwood.getPlayer();
        if (goldNeeded > (player.resources.gold || 0)) {
            return { success: false, reason: 'Нужно ' + needTablets + ' скрижалей или ' + goldNeeded + ' золота' };
        }

        if (haveTablets >= info.cost) {
            Sherwood.Bag.spendResource('amuletTablets', info.cost);
        } else {
            Sherwood.Bag.spendResource('amuletTablets', haveTablets);
            Sherwood.spendResource('gold', goldNeeded);
        }

        var newLevel = info.currentLevel + 1;
        var bonus = Sherwood.getJewelryBonus ? Sherwood.getJewelryBonus(newLevel, 3) : newLevel * 6;

        var grade = newLevel >= 40 ? 'legendary' :
                    newLevel >= 30 ? 'epic' :
                    newLevel >= 20 ? 'rare' :
                    newLevel >= 10 ? 'uncommon' : 'common';

        var amuletIcon = 'assets/interface/sherwood_amulet_level_one.png';
        if (newLevel >= 40) amuletIcon = 'assets/interface/sherwood_amulet_level_five.png';
        else if (newLevel >= 30) amuletIcon = 'assets/interface/sherwood_amulet_level_four.png';
        else if (newLevel >= 20) amuletIcon = 'assets/interface/sherwood_amulet_level_three.png';
        else if (newLevel >= 10) amuletIcon = 'assets/interface/sherwood_amulet_level_two.png';

        Sherwood.Bag._equipment.amulet = {
            name: 'Амулет защиты ' + newLevel,
            icon: amuletIcon,
            part: 'amulet',
            grade: grade,
            level: newLevel,
            stats: { hp: bonus * 2, defense: bonus }
        };

        Sherwood.Bag._save();
        Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, newLevel: newLevel, bonus: bonus };
    }
};

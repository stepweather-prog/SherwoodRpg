/**
 * Sherwood Forge — Кузница
 * Улучшение предметов, крафт стрел, скины, кольца, амулеты
 */

if (typeof Sherwood === 'undefined') { var Sherwood = {}; }

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

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    init: function() {
        console.log('🔧 Кузница инициализирована');
    },

    // ============================================================
    //  ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ============================================================

    _getPlayer: function() {
        return Sherwood.getPlayer();
    },

    _getBag: function() {
        return Sherwood.Bag;
    },

    _save: function() {
        Sherwood.saveGame();
    },

    _recalcStats: function() {
        if (typeof Sherwood._recalcStats === 'function') {
            Sherwood._recalcStats();
        }
    },

    _enhanceCosts: function(level) {
        return { gold: 10 + level * 15, silver: 50 + level * 30 };
    },

    // ============================================================
    //  ИНФОРМАЦИЯ ОБ УЛУЧШЕНИИ
    // ============================================================

    getEnhanceInfo: function(itemGrade) {
        var maxLevel = itemGrade === 'legendary' ? 20 : 
                       itemGrade === 'epic' ? 17 : 
                       itemGrade === 'rare' ? 14 : 
                       itemGrade === 'uncommon' ? 11 : 8;
        return { maxLevel: maxLevel };
    },

    // ============================================================
    //  УЛУЧШЕНИЕ ПРЕДМЕТА ИЗ СУМКИ
    // ============================================================

    enhanceItem: function(itemIndex) {
        var bag = this._getBag();
        if (!bag) return { success: false, reason: 'Сумка не найдена' };

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
        var player = this._getPlayer();

        if (!player) return { success: false, reason: 'Игрок не найден' };

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
            this._recalcStats();
            this._save();
            return { success: true, enhanced: true, newLevel: nextLevel };
        } else if (chanceData.break) {
            bag.removeItem(itemIndex);
            this._recalcStats();
            this._save();
            return { success: true, broken: true, item: item };
        } else {
            this._save();
            return { success: true, failed: true, currentLevel: currentLevel };
        }
    },

    // ============================================================
    //  ЗАТОЧКА ЭКИПИРОВКИ
    // ============================================================

    enhanceEquipped: function(type) {
        var p = this._getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };

        var bag = this._getBag();
        if (!bag) return { success: false, reason: 'Сумка не найдена' };

        if (type === 'ring') {
            var ring = bag._equipment ? bag._equipment.ring : null;
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
            bag._save();

        } else if (type === 'amulet') {
            var amulet = bag._equipment ? bag._equipment.amulet : null;
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
            bag._save();

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

        this._recalcStats();
        this._save();

        return { success: true };
    },

    getEnhanceCost: function(type) {
        var p = this._getPlayer();
        if (!p) return 0;

        var bag = this._getBag();
        if (!bag) return 0;

        if (type === 'ring') {
            var ring = bag._equipment ? bag._equipment.ring : null;
            if (!ring) return 0;
            return Math.round(50 * Math.pow(1.3, ring.enhancement || 0));
        } else if (type === 'amulet') {
            var amulet = bag._equipment ? bag._equipment.amulet : null;
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
        var p = this._getPlayer();
        if (!p) return 0;

        var bag = this._getBag();
        if (!bag) return 0;

        if (type === 'ring') {
            var ring = bag._equipment ? bag._equipment.ring : null;
            return ring ? (ring.enhancement || 0) : 0;
        } else if (type === 'amulet') {
            var amulet = bag._equipment ? bag._equipment.amulet : null;
            return amulet ? (amulet.enhancement || 0) : 0;
        } else if (type === 'skin') {
            var activeSkin = this.getActiveSkin ? this.getActiveSkin() : null;
            if (!activeSkin) return 0;
            if (!p.activeSkinLevels) p.activeSkinLevels = {};
            return p.activeSkinLevels[activeSkin] || 0;
        }
        return 0;
    },

    // ============================================================
    //  СТРЕЛЫ
    // ============================================================

    getArrowCraftInfo: function() {
        var bag = this._getBag();
        if (!bag) return { branches: 0, feathers: 0, bones: 0, canCraft: 0 };

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

        var bag = this._getBag();
        if (!bag) return { success: false, reason: 'Сумка не найдена' };

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

        this._save();
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
        var bag = this._getBag();
        if (!bag) return 0;

        var items = bag.getItems();
        var count = 0;

        for (var i = 0; i < items.length; i++) {
            if (items[i].id && items[i].id.indexOf('arrow_') === 0) {
                count += items[i].quantity || 1;
            }
        }

        return count;
    },

    // ============================================================
    //  СКИНЫ
    // ============================================================

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
            var data = Sherwood.SKIN_BONUSES && Sherwood.SKIN_BONUSES[sid];
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
        var player = this._getPlayer();
        return player ? (player.unlockedSkins || ['skin1_01']) : ['skin1_01'];
    },

    canCraftSkin: function(skinId) {
        var player = this._getPlayer();
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

        var bag = this._getBag();
        if (!bag) return { success: false, reason: 'Сумка не найдена' };

        var resources = bag.getResources ? bag.getResources() : {};
        var player = this._getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };

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
                bag.spendResource('skinTablets', skin.cost.drawings);
            } else {
                bag.spendResource('skinTablets', haveDrawings);
            }
        }

        if (!player.unlockedSkins) player.unlockedSkins = [];
        player.unlockedSkins.push(skinId);

        this._recalcStats();
        this._save();
        return { success: true, skin: skin, goldSpent: totalGoldNeeded };
    },

    equipSkin: function(skinId) {
        var player = this._getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };

        if (!player.unlockedSkins || player.unlockedSkins.indexOf(skinId) === -1) {
            return { success: false, reason: 'Скин не разблокирован' };
        }
        player.activeSkin = skinId;
        this._recalcStats();
        this._save();
        return { success: true, skinId: skinId };
    },

    getActiveSkin: function() {
        var player = this._getPlayer();
        return player ? (player.activeSkin || 'skin1_01') : 'skin1_01';
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

    // ============================================================
    //  КОЛЬЦА
    // ============================================================

    getRingCraftInfo: function() {
        var bag = this._getBag();
        if (!bag) return { currentLevel: 1, maxLevel: 50, cost: 5, tablets: 0, gold: 0, canCraft: false };

        var ring = bag._equipment ? bag._equipment.ring : null;
        var currentLevel = ring ? (ring.level || 1) : 1;
        var maxLevel = 50;
        var cost = Math.floor(5 * Math.pow(currentLevel + 1, 1.5));
        var tablets = bag.getResource ? bag.getResource('ringTablets') : 0;
        var player = this._getPlayer();
        var gold = player ? (player.resources.gold || 0) : 0;

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

        var bag = this._getBag();
        if (!bag) return { success: false, reason: 'Сумка не найдена' };

        var haveTablets = info.tablets;
        var needTablets = Math.max(0, info.cost - haveTablets);
        var goldNeeded = needTablets * 100;

        var player = this._getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };

        if (goldNeeded > (player.resources.gold || 0)) {
            return { success: false, reason: 'Нужно ' + needTablets + ' скрижалей или ' + goldNeeded + ' золота' };
        }

        if (haveTablets >= info.cost) {
            bag.spendResource('ringTablets', info.cost);
        } else {
            bag.spendResource('ringTablets', haveTablets);
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

        bag._equipment.ring = {
            name: 'Кольцо силы ' + newLevel,
            icon: ringIcon,
            part: 'ring',
            grade: grade,
            level: newLevel,
            stats: { attack: bonus, defense: Math.floor(bonus * 0.5) }
        };

        bag._save();
        this._recalcStats();
        this._save();
        return { success: true, newLevel: newLevel, bonus: bonus };
    },

    // ============================================================
    //  АМУЛЕТЫ
    // ============================================================

    getAmuletCraftInfo: function() {
        var bag = this._getBag();
        if (!bag) return { currentLevel: 1, maxLevel: 50, cost: 5, tablets: 0, gold: 0, canCraft: false };

        var amulet = bag._equipment ? bag._equipment.amulet : null;
        var currentLevel = amulet ? (amulet.level || 1) : 1;
        var maxLevel = 50;
        var cost = Math.floor(5 * Math.pow(currentLevel + 1, 1.5));
        var tablets = bag.getResource ? bag.getResource('amuletTablets') : 0;
        var player = this._getPlayer();
        var gold = player ? (player.resources.gold || 0) : 0;

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

        var bag = this._getBag();
        if (!bag) return { success: false, reason: 'Сумка не найдена' };

        var haveTablets = info.tablets;
        var needTablets = Math.max(0, info.cost - haveTablets);
        var goldNeeded = needTablets * 100;

        var player = this._getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };

        if (goldNeeded > (player.resources.gold || 0)) {
            return { success: false, reason: 'Нужно ' + needTablets + ' скрижалей или ' + goldNeeded + ' золота' };
        }

        if (haveTablets >= info.cost) {
            bag.spendResource('amuletTablets', info.cost);
        } else {
            bag.spendResource('amuletTablets', haveTablets);
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

        bag._equipment.amulet = {
            name: 'Амулет защиты ' + newLevel,
            icon: amuletIcon,
            part: 'amulet',
            grade: grade,
            level: newLevel,
            stats: { hp: bonus * 2, defense: bonus }
        };

        bag._save();
        this._recalcStats();
        this._save();
        return { success: true, newLevel: newLevel, bonus: bonus };
    },

    // ============================================================
    //  UI — ПОКАЗ КУЗНИЦЫ
    // ============================================================

    showUI: function() {
        if (typeof window.showForgeScreen === 'function') {
            window.showForgeScreen();
            return;
        }
        this._renderForgeUI();
    },

    _renderForgeUI: function() {
        var old = document.getElementById('forge-screen');
        if (old) old.remove();

        var p = this._getPlayer();
        var bag = this._getBag();
        if (!p || !bag) return;

        var gold = p.resources.gold || 0;
        var silver = p.resources.silver || 0;

        var ringInfo = this.getRingCraftInfo();
        var amuletInfo = this.getAmuletCraftInfo();
        var arrowInfo = this.getArrowCraftInfo();

        var screenHTML = `
        <div id="forge-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/forge.png') center/cover no-repeat;display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
                <button onclick="Sherwood.Forge.closeUI()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                    <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
                </button>
                <span style="color:#e0c080;font-size:1.2em;">🔧 Кузница</span>
                <span style="color:#888;font-size:12px;margin-left:auto;">
                    💰 ${gold} | 🥈 ${silver}
                </span>
            </div>

            <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
                <div style="max-width:600px;margin:0 auto;">

                    <!-- Стрелы -->
                    <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;margin-bottom:10px;">
                        <div style="color:#ffa500;font-weight:bold;">🏹 Стрелы</div>
                        <div style="color:#888;font-size:12px;">
                            Ветки: ${arrowInfo.branches} | Перья: ${arrowInfo.feathers} | Кости: ${arrowInfo.bones}
                        </div>
                        <div style="display:flex;gap:8px;margin-top:6px;">
                            <button onclick="Sherwood.Forge.craftArrowFromUI()" class="btn btn-success" style="padding:4px 15px;font-size:12px;">Сделать 1</button>
                            <button onclick="Sherwood.Forge.craftArrowBatchFromUI(10)" class="btn btn-gold" style="padding:4px 15px;font-size:12px;">Сделать 10</button>
                            <button onclick="Sherwood.Forge.craftArrowBatchFromUI(50)" class="btn btn-danger" style="padding:4px 15px;font-size:12px;">Сделать 50</button>
                        </div>
                        <div style="color:#888;font-size:11px;margin-top:4px;">Всего стрел: ${this.getArrowCount()}</div>
                    </div>

                    <!-- Кольцо -->
                    <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;margin-bottom:10px;">
                        <div style="color:#4a8ab7;font-weight:bold;">💍 Кольцо (Ур. ${ringInfo.currentLevel}/${ringInfo.maxLevel})</div>
                        <div style="color:#888;font-size:12px;">
                            Скрижалей: ${ringInfo.tablets} | Нужно: ${ringInfo.cost}
                        </div>
                        ${ringInfo.canCraft ? 
                            `<button onclick="Sherwood.Forge.craftRingFromUI()" class="btn btn-gold" style="margin-top:6px;padding:4px 20px;font-size:12px;">Улучшить</button>` :
                            `<div style="color:#555;font-size:12px;">🔒 Недостаточно ресурсов</div>`
                        }
                    </div>

                    <!-- Амулет -->
                    <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;margin-bottom:10px;">
                        <div style="color:#a8d8ea;font-weight:bold;">📿 Амулет (Ур. ${amuletInfo.currentLevel}/${amuletInfo.maxLevel})</div>
                        <div style="color:#888;font-size:12px;">
                            Скрижалей: ${amuletInfo.tablets} | Нужно: ${amuletInfo.cost}
                        </div>
                        ${amuletInfo.canCraft ? 
                            `<button onclick="Sherwood.Forge.craftAmuletFromUI()" class="btn btn-gold" style="margin-top:6px;padding:4px 20px;font-size:12px;">Улучшить</button>` :
                            `<div style="color:#555;font-size:12px;">🔒 Недостаточно ресурсов</div>`
                        }
                    </div>

                    <!-- Заточка экипировки -->
                    <div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;">
                        <div style="color:#ffd700;font-weight:bold;">⚡ Заточка</div>
                        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">
                            <button onclick="Sherwood.Forge.enhanceEquippedFromUI('ring')" class="btn" style="padding:4px 12px;font-size:11px;">💍 Кольцо (${this.getEnhanceLevel('ring')})</button>
                            <button onclick="Sherwood.Forge.enhanceEquippedFromUI('amulet')" class="btn" style="padding:4px 12px;font-size:11px;">📿 Амулет (${this.getEnhanceLevel('amulet')})</button>
                            <button onclick="Sherwood.Forge.enhanceEquippedFromUI('skin')" class="btn" style="padding:4px 12px;font-size:11px;">🎭 Скин (${this.getEnhanceLevel('skin')})</button>
                        </div>
                        <div style="color:#888;font-size:11px;margin-top:4px;">Стоимость: серебро (растёт с уровнем)</div>
                    </div>

                </div>
            </div>
        </div>`;

        document.body.insertAdjacentHTML('beforeend', screenHTML);
    },

    // ============================================================
    //  UI ХЭНДЛЕРЫ
    // ============================================================

    craftArrowFromUI: function() {
        var result = this.craftArrow();
        if (result.success) {
            this._renderForgeUI();
        } else {
            alert('❌ ' + result.reason);
        }
    },

    craftArrowBatchFromUI: function(count) {
        var result = this.craftArrowBatch(count);
        if (result.success) {
            alert('✅ Сделано ' + result.crafted + ' стрел!');
            this._renderForgeUI();
        } else {
            alert('❌ ' + result.reason);
        }
    },

    craftRingFromUI: function() {
        var result = this.craftRing();
        if (result.success) {
            alert('✅ Кольцо улучшено до ' + result.newLevel + ' уровня!');
            this._renderForgeUI();
        } else {
            alert('❌ ' + result.reason);
        }
    },

    craftAmuletFromUI: function() {
        var result = this.craftAmulet();
        if (result.success) {
            alert('✅ Амулет улучшен до ' + result.newLevel + ' уровня!');
            this._renderForgeUI();
        } else {
            alert('❌ ' + result.reason);
        }
    },

    enhanceEquippedFromUI: function(type) {
        var result = this.enhanceEquipped(type);
        if (result.success) {
            alert('✅ Успешно заточено!');
            this._renderForgeUI();
        } else {
            alert('❌ ' + result.reason);
        }
    },

    closeUI: function() {
        var screen = document.getElementById('forge-screen');
        if (screen) screen.remove();

        if (typeof window.showHomeScreen === 'function') {
            window.showHomeScreen();
        }
    }
};

// ---------- ЭКСПОРТ ----------
window.Sherwood = window.Sherwood || {};
window.Sherwood.Forge = Sherwood.Forge;

console.log('🔧 Кузница загружена!');

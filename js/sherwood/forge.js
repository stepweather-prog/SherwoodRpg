/**
 * Sherwood Forge — Кузница
 * Улучшение предметов, крафт стрел, скины (100 уровней, 4 стадии), кольца, амулеты
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Forge = {
    _enhanceChances: [
        { level: 1, chance: 100, break: false }, { level: 2, chance: 95, break: false }, { level: 3, chance: 85, break: false },
        { level: 4, chance: 75, break: false }, { level: 5, chance: 65, break: false }, { level: 6, chance: 55, break: false },
        { level: 7, chance: 45, break: false }, { level: 8, chance: 35, break: true }, { level: 9, chance: 25, break: true },
        { level: 10, chance: 15, break: true }, { level: 11, chance: 10, break: true }, { level: 12, chance: 7, break: true },
        { level: 13, chance: 5, break: true }, { level: 14, chance: 3, break: true }, { level: 15, chance: 1, break: true }
    ],

    ARROW_RECIPE: { branches: 1, feathers: 1, bones: 1 },
    _currentTab: 'arrows', // По умолчанию открываются стрелы

    _enhanceCosts: function(level) {
        return { gold: 10 + level * 15, silver: 50 + level * 30 };
    },

    init: function() {
        console.log('🔧 Кузница инициализирована');
    },

    // ============================================================
    //  СТРЕЛЫ
    // ============================================================
    getArrowCraftInfo: function() {
        var bag = Sherwood.Bag;
        if (!bag) return { branches: 0, feathers: 0, bones: 0, canCraft: 0, arrowsCount: 0 };
        var items = bag.getItems();
        var branches = 0, feathers = 0, bones = 0, arrows = 0;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.id === 'branch_damned_yew' || item.resKey === 'branchDamnedYew') branches += item.quantity || 1;
            if (item.id === 'feather_beast_1' || item.resKey === 'feathers') feathers += item.quantity || 1;
            if (item.id === 'bone_growth_of_the_beast' || item.resKey === 'bones') bones += item.quantity || 1;
            if (item.id === 'sherwood_arrow') arrows += item.quantity || 1;
        }
        var canCraft = Math.min(
            Math.floor(branches / this.ARROW_RECIPE.branches),
            Math.floor(feathers / this.ARROW_RECIPE.feathers),
            Math.floor(bones / this.ARROW_RECIPE.bones)
        );
        return { branches: branches, feathers: feathers, bones: bones, canCraft: canCraft, arrowsCount: arrows };
    },

    craftArrow: function() {
        var info = this.getArrowCraftInfo();
        if (info.canCraft <= 0) return { success: false, reason: 'Нужно: 1 ветка, 1 перо, 1 кость' };
        var bag = Sherwood.Bag;
        if (!bag) return { success: false, reason: 'Сумка не найдена' };
        var needBranch = this.ARROW_RECIPE.branches, needFeather = this.ARROW_RECIPE.feathers, needBone = this.ARROW_RECIPE.bones;
        var items = bag.getItems();
        for (var i = items.length - 1; i >= 0 && (needBranch > 0 || needFeather > 0 || needBone > 0); i--) {
            var item = items[i];
            var isBranch = (item.id === 'branch_damned_yew' || item.resKey === 'branchDamnedYew');
            var isFeather = (item.id === 'feather_beast_1' || item.resKey === 'feathers');
            var isBone = (item.id === 'bone_growth_of_the_beast' || item.resKey === 'bones');
            if (isBranch && needBranch > 0) { var qty = item.quantity || 1; if (qty <= needBranch) { needBranch -= qty; bag.removeItem(i, qty); } else { bag.removeItem(i, needBranch); needBranch = 0; } }
            else if (isFeather && needFeather > 0) { var qty = item.quantity || 1; if (qty <= needFeather) { needFeather -= qty; bag.removeItem(i, qty); } else { bag.removeItem(i, needFeather); needFeather = 0; } }
            else if (isBone && needBone > 0) { var qty = item.quantity || 1; if (qty <= needBone) { needBone -= qty; bag.removeItem(i, qty); } else { bag.removeItem(i, needBone); needBone = 0; } }
        }
        if (needBranch > 0 || needFeather > 0 || needBone > 0) return { success: false, reason: 'Не удалось списать ресурсы' };
        bag.addItem({ id: 'sherwood_arrow', name: 'Шервудская стрела', icon: 'assets/interface/sherwood_hollow_arrow.png', grade: 'rare', type: 'resource', quantity: 1, maxStack: 50, sellPrice: 2 });
        Sherwood.saveGame();
        return { success: true, crafted: 1 };
    },

    craftArrowBatch: function(count) {
        var info = this.getArrowCraftInfo();
        count = Math.min(count || 1, info.canCraft);
        if (count <= 0) return { success: false, reason: 'Нужно: 1 ветка, 1 перо, 1 кость' };
        var totalArrows = 0;
        for (var i = 0; i < count; i++) { var r = this.craftArrow(); if (r.success) totalArrows += r.crafted; }
        return { success: true, crafted: totalArrows };
    },

    // ============================================================
    //  СКИНЫ
    // ============================================================
    getCraftSkins: function() {
        // skin1_01 убран, так как это базовый скин
        var allSkins = ['skin9_01', 'skin8_01', 'skin4_01', 'skin16_03'];
        var result = [];
        for (var i = 0; i < allSkins.length; i++) {
            var sid = allSkins[i];
            var data = Sherwood.SKIN_BONUSES && Sherwood.SKIN_BONUSES[sid];
            if (data) { result.push({ id: sid, name: data.name, chapter: data.chapter, costCreate: Math.ceil(data.chapter / 2), costUpgrade: 5 + Math.floor(data.chapter / 2) }); }
        }
        return result;
    },

    getSkinInfo: function(skinId) {
        var skins = this.getCraftSkins();
        for (var i = 0; i < skins.length; i++) { if (skins[i].id === skinId) return skins[i]; }
        return null;
    },

    _getSkinIcon: function(skinId, level) {
        if (level <= 0) level = 1;
        var baseName = skinId.substring(0, skinId.lastIndexOf('_') + 1); 
        var numStr = level < 10 ? '0' + level : '' + level;
        return 'assets/hero_skins/' + baseName + numStr + '.png'; 
    },

    craftSkin: function(skinId) {
        var player = Sherwood.getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };
        if (!player.skinLevels) player.skinLevels = {};
        var currentLevel = player.skinLevels[skinId] || 0;
        var info = this.getSkinInfo(skinId);
        if (!info) return { success: false, reason: 'Скин не найден' };
        var bag = Sherwood.Bag;
        if (!bag) return { success: false, reason: 'Сумка не найдена' };
        
        var haveTablets = 0;
        var items = bag.getItems();
        for (var i = 0; i < items.length; i++) { if (items[i].id === 'skin_tablet') haveTablets += items[i].quantity || 1; }

        if (currentLevel === 0) {
            if (haveTablets < info.costCreate) return { success: false, reason: 'Нужно ' + info.costCreate + ' скрижалей' };
            bag.spendResource('skinTablets', info.costCreate);
            player.skinLevels[skinId] = 1;
            if (!player.unlockedSkins) player.unlockedSkins = [];
            if (player.unlockedSkins.indexOf(skinId) === -1) player.unlockedSkins.push(skinId);
            Sherwood._recalcStats(); Sherwood.saveGame();
            return { success: true, action: 'created', level: 1 };
        }

        if (currentLevel >= 100) return { success: false, reason: 'Максимальный уровень (100)' };
        var nextLevel = currentLevel + 1;
        var upgradeCost = info.costCreate + (info.costUpgrade * nextLevel);
        if (haveTablets < upgradeCost) return { success: false, reason: 'Нужно ' + upgradeCost + ' скрижалей' };
        bag.spendResource('skinTablets', upgradeCost);
        player.skinLevels[skinId] = nextLevel;
        Sherwood._recalcStats(); Sherwood.saveGame();
        return { success: true, action: 'upgraded', level: nextLevel };
    },

    equipSkin: function(skinId) {
        var player = Sherwood.getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };
        if (!player.unlockedSkins || player.unlockedSkins.indexOf(skinId) === -1) return { success: false, reason: 'Скин не разблокирован' };
        player.activeSkin = skinId; Sherwood._recalcStats(); Sherwood.saveGame();
        return { success: true, skinId: skinId };
    },

    // ============================================================
    //  КОЛЬЦО и АМУЛЕТ
    // ============================================================
    getRingCraftInfo: function() {
        var bag = Sherwood.Bag;
        if (!bag) return { currentLevel: 0, maxLevel: 50, cost: 100, tablets: 0, canCraft: false, isNew: true };
        var ring = bag._equipment ? bag._equipment.ring : null;
        var currentLevel = ring ? (ring.level || 1) : 0;
        var cost = currentLevel === 0 ? 100 : 50 + (currentLevel - 1) * 50;
        var tablets = bag.getResource ? bag.getResource('ringTablets') : 0;
        return { currentLevel: currentLevel, maxLevel: 50, cost: cost, tablets: tablets, canCraft: currentLevel < 50 && tablets >= cost, isNew: currentLevel === 0 };
    },

    craftRing: function() {
        var info = this.getRingCraftInfo();
        if (info.currentLevel >= info.maxLevel) return { success: false, reason: 'Максимальный уровень' };
        if (info.tablets < info.cost) return { success: false, reason: 'Нужно ' + info.cost + ' скрижалей' };
        var bag = Sherwood.Bag;
        bag.spendResource('ringTablets', info.cost);
        var newLevel = info.currentLevel + 1;
        var bonus = newLevel * 25;
        var ringIcon = 'assets/interface/ring_first_level.png';
        if (newLevel >= 50) ringIcon = 'assets/interface/ring_chapter_fourteen.png';
        else if (newLevel >= 40) ringIcon = 'assets/interface/ring_chapter_twelve.png';
        else if (newLevel >= 30) ringIcon = 'assets/interface/ring_chapter_eight.png';
        else if (newLevel >= 20) ringIcon = 'assets/interface/ring_chapter_six.png';
        else if (newLevel >= 10) ringIcon = 'assets/interface/ring_fifth_level.png';
        var grade = newLevel >= 40 ? 'legendary' : newLevel >= 30 ? 'epic' : newLevel >= 20 ? 'rare' : newLevel >= 10 ? 'uncommon' : 'common';
        bag._equipment.ring = { name: 'Кольцо силы ' + newLevel, icon: ringIcon, part: 'ring', grade: grade, level: newLevel, stats: { attack: bonus, defense: bonus, hp: bonus } };
        bag._save(); Sherwood._recalcStats(); Sherwood.saveGame();
        return { success: true, newLevel: newLevel };
    },

    getAmuletCraftInfo: function() {
        var bag = Sherwood.Bag;
        if (!bag) return { currentLevel: 0, maxLevel: 50, cost: 100, tablets: 0, canCraft: false, isNew: true };
        var amulet = bag._equipment ? bag._equipment.amulet : null;
        var currentLevel = amulet ? (amulet.level || 1) : 0;
        var cost = currentLevel === 0 ? 100 : 50 + (currentLevel - 1) * 50;
        var tablets = bag.getResource ? bag.getResource('amuletTablets') : 0;
        return { currentLevel: currentLevel, maxLevel: 50, cost: cost, tablets: tablets, canCraft: currentLevel < 50 && tablets >= cost, isNew: currentLevel === 0 };
    },

    craftAmulet: function() {
        var info = this.getAmuletCraftInfo();
        if (info.currentLevel >= info.maxLevel) return { success: false, reason: 'Максимальный уровень' };
        if (info.tablets < info.cost) return { success: false, reason: 'Нужно ' + info.cost + ' скрижалей' };
        var bag = Sherwood.Bag;
        bag.spendResource('amuletTablets', info.cost);
        var newLevel = info.currentLevel + 1;
        var raw = 5 * Math.pow(1.4, newLevel - 1);
        var bonus = this.roundToNice(raw);
        var amuletIcon = 'assets/interface/sherwood_amulet_level_one.png';
        if (newLevel >= 50) amuletIcon = 'assets/interface/sherwood_amulet_level_five.png';
        else if (newLevel >= 40) amuletIcon = 'assets/interface/sherwood_amulet_level_four.png';
        else if (newLevel >= 30) amuletIcon = 'assets/interface/sherwood_amulet_level_three.png';
        else if (newLevel >= 20) amuletIcon = 'assets/interface/sherwood_amulet_level_two.png';
        var grade = newLevel >= 40 ? 'legendary' : newLevel >= 30 ? 'epic' : newLevel >= 20 ? 'rare' : newLevel >= 10 ? 'uncommon' : 'common';
        bag._equipment.amulet = { name: 'Амулет защиты ' + newLevel, icon: amuletIcon, part: 'amulet', grade: grade, level: newLevel, stats: { attack: bonus, defense: bonus, hp: bonus * 2 } };
        bag._save(); Sherwood._recalcStats(); Sherwood.saveGame();
        return { success: true, newLevel: newLevel };
    },

    // ============================================================
    //  УЛУЧШЕНИЕ СНАРЯЖЕНИЯ (ЗАТОЧКА)
    // ============================================================
    roundToNice: function(val) {
        if (val <= 10) return Math.ceil(val);
        if (val <= 50) return Math.ceil(val / 5) * 5;
        if (val <= 200) return Math.ceil(val / 10) * 10;
        if (val <= 500) return Math.ceil(val / 25) * 25;
        if (val <= 1000) return Math.ceil(val / 50) * 50;
        return Math.ceil(val / 100) * 100;
    },

    getSharpeningInfo: function() {
        var p = Sherwood.getPlayer();
        if (!p) return { level: 0, cost: 5, drawings: 0, canSharpen: false };
        if (!p.sharpeningLevel) p.sharpeningLevel = 0;
        var currentLevel = p.sharpeningLevel;
        var cost = 5 + currentLevel * 5;
        var drawings = 0;
        var bag = Sherwood.Bag;
        if (bag) { var items = bag.getItems(); for (var i = 0; i < items.length; i++) { if (items[i].id === 'skin_drawing') drawings += items[i].quantity || 1; } }
        return { level: currentLevel, cost: cost, drawings: drawings, canSharpen: drawings >= cost };
    },

    sharpen: function() {
        var info = this.getSharpeningInfo();
        if (!info.canSharpen) return { success: false, reason: 'Нужно ' + info.cost + ' чертежей' };
        var bag = Sherwood.Bag;
        if (!bag) return { success: false, reason: 'Сумка не найдена' };
        var need = info.cost;
        var items = bag.getItems();
        for (var i = items.length - 1; i >= 0 && need > 0; i--) {
            var item = items[i];
            if (item.id === 'skin_drawing') { var qty = item.quantity || 1; if (qty <= need) { need -= qty; bag.removeItem(i, qty); } else { bag.removeItem(i, need); need = 0; } }
        }
        if (need > 0) return { success: false, reason: 'Не удалось списать чертежи' };
        var p = Sherwood.getPlayer();
        p.sharpeningLevel = (p.sharpeningLevel || 0) + 1;
        Sherwood._recalcStats(); Sherwood.saveGame();
        return { success: true, newLevel: p.sharpeningLevel };
    },

    // Заглушки для старого UI
    getEnhanceLevel: function(type) {
        if (type === 'ring') return this.getRingCraftInfo().currentLevel;
        if (type === 'amulet') return this.getAmuletCraftInfo().currentLevel;
        return 0;
    },
    getEnhanceCost: function(type) {
        if (type === 'ring') return this.getRingCraftInfo().cost;
        if (type === 'amulet') return this.getAmuletCraftInfo().cost;
        return 0;
    },
    enhanceEquipped: function(type) {
        if (type === 'ring') return this.craftRing();
        if (type === 'amulet') return this.craftAmulet();
        return { success: false, reason: 'Неизвестный тип' };
    },

    // ============================================================
    //  UI КУЗНИЦЫ (В СТИЛЕ ТАВЕРНЫ)
    // ============================================================
    showUI: function() {
        if (typeof UI === 'undefined') return;
        UI._playSound('click');

        var self = this;
        var player = Sherwood.getPlayer();
        var bag = Sherwood.Bag;
        
        var skinTablets = 0, ringTablets = 0, amuletTablets = 0, skinDrawings = 0;
        if (bag) {
            var items = bag.getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === 'skin_drawing') skinDrawings += items[i].quantity || 1;
                if (items[i].id === 'skin_tablet') skinTablets += items[i].quantity || 1;
                if (items[i].id === 'ring_tablet') ringTablets += items[i].quantity || 1;
                if (items[i].id === 'amulet_tablet') amuletTablets += items[i].quantity || 1;
            }
        }

        if (UI._screenLayer) {
            UI._screenLayer.style.overflow = 'hidden';
        }

        var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;background:url(\'assets/assets2/backgrounds/forge.png\') center/cover no-repeat;scrollbar-width:none;-ms-overflow-style:none;">';
        h += '<style>.forge-scroll::-webkit-scrollbar{display:none;}.forge-scroll{scrollbar-width:none;}</style>';

        // --- СВОЯ КНОПКА НАЗАД ---
        h += '<button onclick="UI.camp()" style="position:absolute;top:15px;left:15px;z-index:9999;background:rgba(0,0,0,0.8);border:2px solid #c8a050;border-radius:8px;padding:8px 16px;color:#c8a050;font-size:18px;font-weight:bold;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.5);">← Назад</button>';

        // Контент поверх
        h += '<div class="forge-scroll" style="position:relative;z-index:10;width:100%;min-height:100%;padding-top:60px;padding-bottom:40px;">';

        // === ПЛАШКИ ВКЛАДОК ===
        h += '<div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:20px;">';
        
        h += '<div onclick="Sherwood.Forge._currentTab=\'arrows\'; Sherwood.Forge.showUI();" style="width:300px;height:60px;background:url(\'assets/interface/all_stat.png\') center/100% 100% no-repeat;display:flex;align-items:center;justify-content:center;cursor:pointer;' + (this._currentTab === 'arrows' ? 'filter:drop-shadow(0 0 10px #ffd700);' : 'opacity:0.7;') + '">';
        h += '<span style="color:#ffa500;font-size:18px;font-weight:bold;text-shadow:0 2px 4px #000;">Стрелы</span></div>';

        h += '<div onclick="Sherwood.Forge._currentTab=\'jewelry\'; Sherwood.Forge.showUI();" style="width:300px;height:60px;background:url(\'assets/interface/all_stat.png\') center/100% 100% no-repeat;display:flex;align-items:center;justify-content:center;cursor:pointer;' + (this._currentTab === 'jewelry' ? 'filter:drop-shadow(0 0 10px #ffd700);' : 'opacity:0.7;') + '">';
        h += '<span style="color:#ffa500;font-size:18px;font-weight:bold;text-shadow:0 2px 4px #000;">Ювелирка</span></div>';

        h += '<div onclick="Sherwood.Forge._currentTab=\'skins\'; Sherwood.Forge.showUI();" style="width:300px;height:60px;background:url(\'assets/interface/all_stat.png\') center/100% 100% no-repeat;display:flex;align-items:center;justify-content:center;cursor:pointer;' + (this._currentTab === 'skins' ? 'filter:drop-shadow(0 0 10px #ffd700);' : 'opacity:0.7;') + '">';
        h += '<span style="color:#ffa500;font-size:18px;font-weight:bold;text-shadow:0 2px 4px #000;">Облики</span></div>';
        h += '</div>';

        // === ПЕРГАМЕНТ ===
        h += '<div style="width:95%;max-width:460px;margin:0 auto 30px auto;position:relative;">';
        h += '<div style="width:100%;min-height:350px;background:url(\'assets/assets2/game_details/parchment_tasks.png\') center/100% 100% no-repeat;padding:40px 25px;display:flex;flex-direction:column;justify-content:center;overflow:hidden;">';

        // --- КОНТЕНТ ВКЛАДОК ---
        if (this._currentTab === 'arrows') {
            var arrowInfo = this.getArrowCraftInfo();
            h += '<div style="text-align:center;color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:15px;text-shadow:0 2px 4px #000;">Крафт стрел</div>';
            
            // Иконки ресурсов
            h += '<div style="display:flex;justify-content:center;gap:15px;margin-bottom:15px;">';
            h += '<div style="text-align:center;"><img src="assets/interface/branch_of_the_damned_yew.png" style="width:40px;height:40px;object-fit:contain;"><div style="color:#e0c080;font-size:0.9em;margin-top:4px;text-shadow:0 2px 4px #000;">' + arrowInfo.branches + '</div></div>';
            h += '<div style="text-align:center;"><img src="assets/interface/feather_beast_1.png" style="width:40px;height:40px;object-fit:contain;"><div style="color:#e0c080;font-size:0.9em;margin-top:4px;text-shadow:0 2px 4px #000;">' + arrowInfo.feathers + '</div></div>';
            h += '<div style="text-align:center;"><img src="assets/interface/bone_growth_of_the_beast.png" style="width:40px;height:40px;object-fit:contain;"><div style="color:#e0c080;font-size:0.9em;margin-top:4px;text-shadow:0 2px 4px #000;">' + arrowInfo.bones + '</div></div>';
            h += '</div>';
            
            h += '<div style="text-align:center;color:#e0c080;font-size:0.9em;margin-bottom:20px;text-shadow:0 2px 4px #000;">Рецепт: 1 ветка + 1 перо + 1 кость = 1 стрела</div>';
            
            // Кнопки крафта
            h += '<div style="display:flex;flex-direction:column;gap:8px;max-width:200px;margin:0 auto;">';
            h += '<button onclick="Sherwood.Forge._craftArrowFromUI(1)" style="background:#5a3a00;border:1px solid #c8a050;border-radius:6px;padding:10px;color:#ffd700;font-weight:bold;cursor:pointer;font-size:0.95em;box-shadow:0 2px 4px rgba(0,0,0,0.3);">Сделать 1</button>';
            h += '<button onclick="Sherwood.Forge._craftArrowFromUI(5)" style="background:#5a3a00;border:1px solid #c8a050;border-radius:6px;padding:10px;color:#ffd700;font-weight:bold;cursor:pointer;font-size:0.95em;box-shadow:0 2px 4px rgba(0,0,0,0.3);">Сделать 5</button>';
            h += '<button onclick="Sherwood.Forge._craftArrowFromUI(10)" style="background:#5a3a00;border:1px solid #c8a050;border-radius:6px;padding:10px;color:#ffd700;font-weight:bold;cursor:pointer;font-size:0.95em;box-shadow:0 2px 4px rgba(0,0,0,0.3);">Сделать 10</button>';
            h += '</div>';
            
            h += '<div style="text-align:center;color:#e0c080;font-size:0.9em;margin-top:20px;text-shadow:0 2px 4px #000;">Всего стрел в сумке: ' + arrowInfo.arrowsCount + '</div>';
            
        } else if (this._currentTab === 'jewelry') {
            var ringInfo = this.getRingCraftInfo();
            var amuletInfo = this.getAmuletCraftInfo();
            
            h += '<div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:15px;padding:5px;">';
            
            // Кольцо
            h += '<div style="display:flex;flex-direction:column;align-items:center;background:rgba(0,0,0,0.06);border:2px solid rgba(90,50,0,0.4);border-radius:10px;padding:12px;box-sizing:border-box;">';
            var ringIconSrc = bag._equipment && bag._equipment.ring ? bag._equipment.ring.icon : 'assets/interface/ring_first_level.png';
            h += '<img src="' + ringIconSrc + '" style="width:60px;height:60px;object-fit:contain;margin-bottom:8px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));">';
            h += '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;text-align:center;margin-bottom:4px;text-shadow:0 2px 4px #000;">Кольцо ' + (ringInfo.isNew ? '' : 'Ур. ' + ringInfo.currentLevel) + '</div>';
            h += '<div style="color:#e0c080;font-size:0.85em;margin-bottom:12px;text-align:center;text-shadow:0 2px 4px #000;">Скрижали: ' + ringInfo.tablets + ' / ' + ringInfo.cost + '</div>';
            if (ringInfo.canCraft) {
                h += '<button onclick="Sherwood.Forge._craftRingFromUI()" style="margin-top:auto;background:#5a3a00;border:1px solid #c8a050;border-radius:6px;padding:8px 12px;color:#ffd700;font-weight:bold;cursor:pointer;font-size:0.9em;width:100%;box-shadow:0 2px 4px rgba(0,0,0,0.3);">' + (ringInfo.isNew ? 'Создать' : 'Улучшить') + '</button>';
            } else {
                h += '<div style="color:#e0c080;font-size:0.85em;font-weight:bold;margin-top:auto;text-shadow:0 2px 4px #000;">🔒 Мало скрижалей</div>';
            }
            h += '</div>';

            // Амулет
            h += '<div style="display:flex;flex-direction:column;align-items:center;background:rgba(0,0,0,0.06);border:2px solid rgba(90,50,0,0.4);border-radius:10px;padding:12px;box-sizing:border-box;">';
            var amuletIconSrc = bag._equipment && bag._equipment.amulet ? bag._equipment.amulet.icon : 'assets/interface/sherwood_amulet_level_one.png';
            h += '<img src="' + amuletIconSrc + '" style="width:60px;height:60px;object-fit:contain;margin-bottom:8px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));">';
            h += '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;text-align:center;margin-bottom:4px;text-shadow:0 2px 4px #000;">Амулет ' + (amuletInfo.isNew ? '' : 'Ур. ' + amuletInfo.currentLevel) + '</div>';
            h += '<div style="color:#e0c080;font-size:0.85em;margin-bottom:12px;text-align:center;text-shadow:0 2px 4px #000;">Скрижали: ' + amuletInfo.tablets + ' / ' + amuletInfo.cost + '</div>';
            if (amuletInfo.canCraft) {
                h += '<button onclick="Sherwood.Forge._craftAmuletFromUI()" style="margin-top:auto;background:#5a3a00;border:1px solid #c8a050;border-radius:6px;padding:8px 12px;color:#ffd700;font-weight:bold;cursor:pointer;font-size:0.9em;width:100%;box-shadow:0 2px 4px rgba(0,0,0,0.3);">' + (amuletInfo.isNew ? 'Создать' : 'Улучшить') + '</button>';
            } else {
                h += '<div style="color:#e0c080;font-size:0.85em;font-weight:bold;margin-top:auto;text-shadow:0 2px 4px #000;">🔒 Мало скрижалей</div>';
            }
            h += '</div>';
            
            h += '</div>';

        } else if (this._currentTab === 'skins') {
            var skins = this.getCraftSkins();
            
            h += '<div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:15px;padding:5px;">';
            for (var s = 0; s < skins.length; s++) {
                var sk = skins[s];
                var sLvl = (player && player.skinLevels && player.skinLevels[sk.id]) ? player.skinLevels[sk.id] : 0;
                var isUnlocked = sLvl > 0;
                var nextCost = sLvl === 0 ? sk.costCreate : (sk.costCreate + sk.costUpgrade * sLvl);
                var btnText = sLvl === 0 ? 'Создать' : (sLvl >= 100 ? 'Максимум' : 'Улучшить');
                var iconPath = this._getSkinIcon(sk.id, sLvl);

                h += '<div style="display:flex;flex-direction:column;align-items:center;background:rgba(0,0,0,0.06);border:2px solid rgba(90,50,0,0.4);border-radius:10px;padding:12px;box-sizing:border-box;">';
                
                h += '<img src="' + iconPath + '" style="width:80px;height:80px;object-fit:contain;margin-bottom:8px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.5));">';
                
                h += '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;text-align:center;height:36px;line-height:1.2;overflow:hidden;margin-bottom:6px;text-shadow:0 2px 4px #000;">' + sk.name + '</div>';
                
                if (sLvl >= 100) {
                    h += '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;margin-top:auto;text-shadow:0 2px 4px #000;">✅ Максимум</div>';
                } else {
                    h += '<div style="color:#e0c080;font-size:0.85em;margin-bottom:10px;text-align:center;font-weight:bold;text-shadow:0 2px 4px #000;">' + (isUnlocked ? 'Ур. '+sLvl+' | ' : '') + 'Цена: ' + nextCost + '</div>';
                    h += '<button onclick="Sherwood.Forge._craftSkinFromUI(\'' + sk.id + '\')" style="margin-top:auto;background:#5a3a00;border:1px solid #c8a050;border-radius:6px;padding:8px 12px;color:#ffd700;font-weight:bold;cursor:pointer;font-size:0.9em;width:100%;box-shadow:0 2px 4px rgba(0,0,0,0.3);">' + btnText + '</button>';
                }
                h += '</div>';
            }
            h += '</div>';
        }

        // --- ПОДВАЛ (УЛУЧШЕНИЕ СНАРЯЖЕНИЯ) ---
        var sharpenInfo = this.getSharpeningInfo();
        h += '<div style="margin-top:20px;padding-top:15px;border-top:1px solid rgba(90,50,0,0.2);text-align:center;">';
        h += '<div style="color:#e0c080;font-size:1em;font-weight:bold;margin-bottom:5px;text-shadow:0 2px 4px #000;">⚡ Улучшение снаряжения</div>';
        h += '<div style="color:#e0c080;font-size:0.9em;margin-bottom:10px;text-shadow:0 2px 4px #000;">Чертежей: ' + sharpenInfo.drawings + ' / ' + sharpenInfo.cost + '</div>';
        if (sharpenInfo.canSharpen) {
            h += '<button onclick="Sherwood.Forge._sharpenFromUI()" style="background:#5a3a00;border:1px solid #c8a050;border-radius:6px;padding:8px 20px;color:#ffd700;font-weight:bold;cursor:pointer;font-size:0.9em;">Улучшить</button>';
        } else {
            h += '<div style="color:#e0c080;font-size:0.9em;font-weight:bold;text-shadow:0 2px 4px #000;">🔒 Недостаточно чертежей</div>';
        }
        h += '</div>';

        h += '</div>'; // конец пергамента
        h += '</div>'; // конец контейнера

        h += '</div>'; // .forge-scroll
        h += '</div>'; // фон

        UI._openScreenScrollable('Кузница', null, h, 'UI.camp()');
    },

    // ============================================================
    //  ОБРАБОТЧИКИ КНОПОК UI
    // ============================================================
    _craftArrowFromUI: function(count) {
        var r = this.craftArrowBatch(count);
        if (r.success) { UI._showToast('✅ Сделано стрел: ' + r.crafted); this.showUI(); } else { UI._showToast('❌ ' + r.reason); }
    },
    _craftRingFromUI: function() {
        var r = this.craftRing();
        if (r.success) { UI._showToast(r.newLevel === 1 ? '✅ Кольцо создано!' : '✅ Кольцо улучшено до ' + r.newLevel + ' ур.!'); this.showUI(); } else { UI._showToast('❌ ' + r.reason); }
    },
    _craftAmuletFromUI: function() {
        var r = this.craftAmulet();
        if (r.success) { UI._showToast(r.newLevel === 1 ? '✅ Амулет создан!' : '✅ Амулет улучшен до ' + r.newLevel + ' ур.!'); this.showUI(); } else { UI._showToast('❌ ' + r.reason); }
    },
    _craftSkinFromUI: function(skinId) {
        var r = this.craftSkin(skinId);
        if (r.success) { UI._showToast(r.action === 'created' ? '✅ Скин создан!' : '✅ Скин улучшен до ур. ' + r.level); this.showUI(); } else { UI._showToast('❌ ' + r.reason); }
    },
    _sharpenFromUI: function() {
        var r = this.sharpen();
        if (r.success) { UI._playSound('forge'); UI._showToast('✅ Улучшение повышено до ' + r.newLevel + ' уровня!'); UI.updateDisplay(); this.showUI(); } else { UI._showToast('❌ ' + r.reason); }
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Forge = Sherwood.Forge;

console.log('🔧 Кузница загружена!');

/**
 * Sherwood Forge — Кузница
 * Улучшение предметов, крафт стрел, скины (крафт + прокачка), кольца, амулеты, заточка
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

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

    ARROW_RECIPE: { branches: 1, feathers: 1, bones: 1 },

    _enhanceCosts: function(level) {
        return { gold: 10 + level * 15, silver: 50 + level * 30 };
    },

    init: function() {
        console.log('🔧 Кузница инициализирована');
    },

    getEnhanceInfo: function(itemGrade) {
        var maxLevel = itemGrade === 'legendary' ? 20 :
                       itemGrade === 'epic' ? 17 :
                       itemGrade === 'rare' ? 14 :
                       itemGrade === 'uncommon' ? 11 : 8;
        return { maxLevel: maxLevel };
    },

    // ============================================================
    //  КРАФТ СТРЕЛ (1 ветка + 1 перо + 1 кость)
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

        var needBranch = this.ARROW_RECIPE.branches;
        var needFeather = this.ARROW_RECIPE.feathers;
        var needBone = this.ARROW_RECIPE.bones;

        var items = bag.getItems();
        for (var i = items.length - 1; i >= 0 && (needBranch > 0 || needFeather > 0 || needBone > 0); i--) {
            var item = items[i];
            var isBranch = (item.id === 'branch_damned_yew' || item.resKey === 'branchDamnedYew');
            var isFeather = (item.id === 'feather_beast_1' || item.resKey === 'feathers');
            var isBone = (item.id === 'bone_growth_of_the_beast' || item.resKey === 'bones');
            
            if (isBranch && needBranch > 0) {
                var qty = item.quantity || 1;
                if (qty <= needBranch) { needBranch -= qty; bag.removeItem(i, qty); }
                else { bag.removeItem(i, needBranch); needBranch = 0; }
            } else if (isFeather && needFeather > 0) {
                var qty = item.quantity || 1;
                if (qty <= needFeather) { needFeather -= qty; bag.removeItem(i, qty); }
                else { bag.removeItem(i, needFeather); needFeather = 0; }
            } else if (isBone && needBone > 0) {
                var qty = item.quantity || 1;
                if (qty <= needBone) { needBone -= qty; bag.removeItem(i, qty); }
                else { bag.removeItem(i, needBone); needBone = 0; }
            }
        }
        if (needBranch > 0 || needFeather > 0 || needBone > 0) return { success: false, reason: 'Не удалось списать ресурсы' };

        bag.addItem({
            id: 'sherwood_arrow', name: 'Шервудская стрела',
            icon: 'assets/interface/sherwood_hollow_arrow.png',
            grade: 'rare', type: 'resource', quantity: 1, maxStack: 50, sellPrice: 2
        });
        Sherwood.saveGame();
        return { success: true, crafted: 1 };
    },

    craftArrowBatch: function(count) {
        var info = this.getArrowCraftInfo();
        count = Math.min(count || 1, info.canCraft);
        if (count <= 0) return { success: false, reason: 'Нужно: 1 ветка, 1 перо, 1 кость' };
        var totalArrows = 0;
        for (var i = 0; i < count; i++) {
            var r = this.craftArrow();
            if (r.success) totalArrows += r.crafted;
        }
        return { success: true, crafted: totalArrows };
    },

    // ============================================================
    //  СКИНЫ (Крафт за скрижали, Улучшение за скрижали)
    // ============================================================
    getCraftSkins: function() {
        var allSkins = ['skin1_01', 'skin9_01', 'skin8_01', 'skin4_01', 'skin16_03'];
        var result = [];
        for (var i = 0; i < allSkins.length; i++) {
            var sid = allSkins[i];
            var data = Sherwood.SKIN_BONUSES && Sherwood.SKIN_BONUSES[sid];
            if (data) {
                result.push({
                    id: sid,
                    name: data.name,
                    chapter: data.chapter,
                    costCreate: Math.ceil(data.chapter / 2),
                    costUpgrade: 5 + Math.floor(data.chapter / 2)
                });
            }
        }
        return result;
    },

    getSkinInfo: function(skinId) {
        var skins = this.getCraftSkins();
        for (var i = 0; i < skins.length; i++) {
            if (skins[i].id === skinId) return skins[i];
        }
        return null;
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
        var haveTablets = bag.getResource ? bag.getResource('skinTablets') : 0;

        // Если скина нет, крафтим 1 уровень
        if (currentLevel === 0) {
            if (haveTablets < info.costCreate) return { success: false, reason: 'Нужно ' + info.costCreate + ' скрижалей' };
            bag.spendResource('skinTablets', info.costCreate);
            player.skinLevels[skinId] = 1;
            if (!player.unlockedSkins) player.unlockedSkins = [];
            if (player.unlockedSkins.indexOf(skinId) === -1) player.unlockedSkins.push(skinId);
            Sherwood._recalcStats();
            Sherwood.saveGame();
            return { success: true, action: 'created', level: 1 };
        }

        // Если уже есть, улучшаем
        if (currentLevel >= 10) return { success: false, reason: 'Максимальный уровень (10)' };
        
        var nextLevel = currentLevel + 1;
        var upgradeCost = info.costCreate + (info.costUpgrade * nextLevel);

        if (haveTablets < upgradeCost) return { success: false, reason: 'Нужно ' + upgradeCost + ' скрижалей для улучшения' };

        bag.spendResource('skinTablets', upgradeCost);
        player.skinLevels[skinId] = nextLevel;
        
        Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, action: 'upgraded', level: nextLevel };
    },

    equipSkin: function(skinId) {
        var player = Sherwood.getPlayer();
        if (!player) return { success: false, reason: 'Игрок не найден' };
        if (!player.unlockedSkins || player.unlockedSkins.indexOf(skinId) === -1) {
            return { success: false, reason: 'Скин не разблокирован' };
        }
        player.activeSkin = skinId;
        Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, skinId: skinId };
    },

    // ============================================================
    //  КОЛЬЦО и АМУЛЕТ (строго за скрижали)
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
        bag._save();
        Sherwood._recalcStats();
        Sherwood.saveGame();
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
        bag._save();
        Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, newLevel: newLevel };
    },

    // ============================================================
    //  ЗАТОЧКА (только за чертежи)
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
        if (bag) {
            var items = bag.getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === 'skin_drawing') drawings += items[i].quantity || 1;
            }
        }
        return { level: currentLevel, cost: cost, drawings: drawings, canSharpen: drawings >= cost };
    },

    sharpen: function() {
        var info = this.getSharpeningInfo();
        if (!info.canSharpen) return { success: false, reason: 'Нужно ' + info.cost + ' чертежей заточки' };
        var bag = Sherwood.Bag;
        if (!bag) return { success: false, reason: 'Сумка не найдена' };
        var need = info.cost;
        var items = bag.getItems();
        for (var i = items.length - 1; i >= 0 && need > 0; i--) {
            var item = items[i];
            if (item.id === 'skin_drawing') {
                var qty = item.quantity || 1;
                if (qty <= need) { need -= qty; bag.removeItem(i, qty); }
                else { bag.removeItem(i, need); need = 0; }
            }
        }
        if (need > 0) return { success: false, reason: 'Не удалось списать чертежи' };
        var p = Sherwood.getPlayer();
        p.sharpeningLevel = (p.sharpeningLevel || 0) + 1;
        Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, newLevel: p.sharpeningLevel };
    },

    // ============================================================
    //  UI КУЗНИЦЫ (с шапкой ресурсов и сеткой скинов)
    // ============================================================
    showUI: function() {
        if (typeof UI === 'undefined') return;
        UI._playSound('click');

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
        
        var ringInfo = this.getRingCraftInfo();
        var amuletInfo = this.getAmuletCraftInfo();
        var arrowInfo = this.getArrowCraftInfo();
        var sharpenInfo = this.getSharpeningInfo();

        var h = '<div style="padding:10px;max-width:400px;margin:0 auto;">';

        // --- 1. ШАПКА С РЕСУРСАМИ ---
        h += '<div style="display:flex;justify-content:center;gap:12px;background:rgba(0,0,0,0.7);border:2px solid #6b5a3a;border-radius:10px;padding:8px;margin-bottom:12px;flex-wrap:wrap;">';
        h += '<div style="display:flex;align-items:center;gap:4px;color:#fff;font-size:0.8em;"><img src="assets/interface/resource_appearance_crafting_tablet.png" style="width:24px;height:24px;"> ' + skinTablets + '</div>';
        h += '<div style="display:flex;align-items:center;gap:4px;color:#fff;font-size:0.8em;"><img src="assets/interface/ring_crafting_tablet_resource.png" style="width:24px;height:24px;"> ' + ringTablets + '</div>';
        h += '<div style="display:flex;align-items:center;gap:4px;color:#fff;font-size:0.8em;"><img src="assets/interface/amulet_crafting_tablet_resource.png" style="width:24px;height:24px;"> ' + amuletTablets + '</div>';
        h += '<div style="display:flex;align-items:center;gap:4px;color:#fff;font-size:0.8em;"><img src="assets/interface/skin_drawing.png" style="width:24px;height:24px;"> ' + skinDrawings + '</div>';
        h += '</div>';

        // --- 2. СТРЕЛЫ ---
        h += '<div style="background:rgba(0,0,0,0.5);border:2px solid #6b5a3a;border-radius:12px;padding:12px;margin-bottom:12px;">';
        h += '<div style="color:#ffa500;font-weight:bold;font-size:1em;margin-bottom:6px;">🏹 Стрелы</div>';
        h += '<div style="color:#aaa;font-size:0.75em;margin-bottom:4px;">Веток: ' + arrowInfo.branches + ' | Перьев: ' + arrowInfo.feathers + ' | Костей: ' + arrowInfo.bones + '</div>';
        h += '<div style="color:#aaa;font-size:0.75em;margin-bottom:8px;">Рецепт: 1 ветка + 1 перо + 1 кость = 1 стрела</div>';
        h += '<div style="display:flex;gap:6px;flex-wrap:wrap;">';
        h += '<button onclick="Sherwood.Forge._craftArrowFromUI(1)" style="background:#c9a040;border:none;border-radius:6px;padding:6px 12px;color:#000;font-weight:bold;cursor:pointer;font-size:0.75em;">Сделать 1</button>';
        h += '<button onclick="Sherwood.Forge._craftArrowFromUI(5)" style="background:#c9a040;border:none;border-radius:6px;padding:6px 12px;color:#000;font-weight:bold;cursor:pointer;font-size:0.75em;">Сделать 5</button>';
        h += '<button onclick="Sherwood.Forge._craftArrowFromUI(10)" style="background:#c9a040;border:none;border-radius:6px;padding:6px 12px;color:#000;font-weight:bold;cursor:pointer;font-size:0.75em;">Сделать 10</button>';
        h += '</div>';
        h += '<div style="color:#888;font-size:0.7em;margin-top:6px;">Всего стрел в сумке: ' + arrowInfo.arrowsCount + '</div>';
        h += '</div>';

        // --- 3. КОЛЬЦО и АМУЛЕТ ---
        h += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-bottom:12px;">';
        h += '<div style="display:flex;flex-direction:column;align-items:center;">';
        h += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;padding:10px;background:rgba(10,8,5,0.9);border:2px solid #6b5a3a;width:100%;box-shadow:0 4px 15px rgba(0,0,0,0.9);aspect-ratio:1/1;">';
        h += '<img src="assets/interface/ring_crafting_tablet_resource.png" style="width:50px;height:50px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(255,165,0,0.6));"></div>';
        h += '<div style="color:#ffd27a;font-size:0.8em;font-weight:bold;margin-top:8px;text-align:center;text-shadow:0 2px 4px #000;">Кольцо ' + (ringInfo.isNew ? '(нет)' : 'Ур. ' + ringInfo.currentLevel) + '</div>';
        h += '<div style="color:#aaa;font-size:0.65em;margin-top:2px;">Скрижалей: ' + ringInfo.tablets + ' / ' + ringInfo.cost + '</div>';
        if (ringInfo.canCraft) h += '<button onclick="Sherwood.Forge._craftRingFromUI()" style="margin-top:6px;background:#c9a040;border:none;border-radius:6px;padding:6px 16px;color:#000;font-weight:bold;cursor:pointer;font-size:0.75em;">' + (ringInfo.isNew ? 'Создать' : 'Улучшить') + '</button>';
        else h += '<div style="color:#555;font-size:0.7em;margin-top:4px;">🔒 Недостаточно</div>';
        h += '</div>';

        h += '<div style="display:flex;flex-direction:column;align-items:center;">';
        h += '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:12px;padding:10px;background:rgba(10,8,5,0.9);border:2px solid #6b5a3a;width:100%;box-shadow:0 4px 15px rgba(0,0,0,0.9);aspect-ratio:1/1;">';
        h += '<img src="assets/interface/amulet_crafting_tablet_resource.png" style="width:50px;height:50px;object-fit:contain;filter:drop-shadow(0 0 8px rgba(255,165,0,0.6));"></div>';
        h += '<div style="color:#ffd27a;font-size:0.8em;font-weight:bold;margin-top:8px;text-align:center;text-shadow:0 2px 4px #000;">Амулет ' + (amuletInfo.isNew ? '(нет)' : 'Ур. ' + amuletInfo.currentLevel) + '</div>';
        h += '<div style="color:#aaa;font-size:0.65em;margin-top:2px;">Скрижалей: ' + amuletInfo.tablets + ' / ' + amuletInfo.cost + '</div>';
        if (amuletInfo.canCraft) h += '<button onclick="Sherwood.Forge._craftAmuletFromUI()" style="margin-top:6px;background:#c9a040;border:none;border-radius:6px;padding:6px 16px;color:#000;font-weight:bold;cursor:pointer;font-size:0.75em;">' + (amuletInfo.isNew ? 'Создать' : 'Улучшить') + '</button>';
        else h += '<div style="color:#555;font-size:0.7em;margin-top:4px;">🔒 Недостаточно</div>';
        h += '</div>';
        h += '</div>';

        // --- 4. СКИНЫ ---
        var skins = this.getCraftSkins();
        if (skins.length > 0) {
            h += '<div style="margin-bottom:12px;">';
            h += '<div style="color:#ffd700;font-weight:bold;font-size:1em;margin-bottom:8px;text-align:center;">🖼️ Скины</div>';
            h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">';
            for (var s = 0; s < skins.length; s++) {
                var sk = skins[s];
                var sLvl = (player && player.skinLevels && player.skinLevels[sk.id]) ? player.skinLevels[sk.id] : 0;
                var isUnlocked = sLvl > 0;
                var nextCost = sLvl === 0 ? sk.costCreate : (sk.costCreate + sk.costUpgrade * (sLvl + 1));
                var btnText = sLvl === 0 ? 'Создать' : (sLvl >= 10 ? 'Макс' : 'Улучшить');
                
                h += '<div style="display:flex;flex-direction:column;align-items:center;background:rgba(10,8,5,0.9);border:2px solid ' + (isUnlocked ? '#4caf50' : '#6b5a3a') + ';border-radius:12px;padding:8px;">';
                h += '<img src="assets/hero_skins/' + sk.id + '.png" style="width:60px;height:60px;object-fit:contain;margin-bottom:4px;">';
                h += '<div style="color:#ffd27a;font-size:0.7em;font-weight:bold;text-align:center;height:20px;overflow:hidden;">' + sk.name + '</div>';
                
                if (sLvl >= 10) {
                    h += '<div style="color:#4caf50;font-size:0.7em;margin-top:4px;">✅ Макс (10)</div>';
                } else {
                    h += '<div style="color:#aaa;font-size:0.65em;margin-top:4px;text-align:center;">' + (isUnlocked ? 'Ур. '+sLvl+' | ' : '') + 'Нужно: ' + nextCost + '</div>';
                    h += '<button onclick="Sherwood.Forge._craftSkinFromUI(\'' + sk.id + '\')" style="margin-top:6px;background:#c9a040;border:none;border-radius:6px;padding:4px 10px;color:#000;font-weight:bold;cursor:pointer;font-size:0.7em;">' + btnText + '</button>';
                }
                h += '</div>';
            }
            h += '</div>';
            h += '</div>';
        }

        // --- 5. ЗАТОЧКА ---
        h += '<div style="background:rgba(0,0,0,0.5);border:2px solid #6b5a3a;border-radius:12px;padding:12px;">';
        h += '<div style="color:#ffd700;font-weight:bold;font-size:1em;margin-bottom:6px;">⚡ Заточка скина (Ур. ' + sharpenInfo.level + ')</div>';
        h += '<div style="color:#aaa;font-size:0.75em;margin-bottom:8px;">Чертежей: ' + sharpenInfo.drawings + ' / ' + sharpenInfo.cost + ' | +5 ко всем статам</div>';
        if (sharpenInfo.canSharpen) {
            h += '<button onclick="Sherwood.Forge._sharpenFromUI()" style="background:#c9a040;border:none;border-radius:6px;padding:6px 20px;color:#000;font-weight:bold;cursor:pointer;font-size:0.8em;">Улучшить</button>';
        } else {
            h += '<div style="color:#555;font-size:0.7em;">🔒 Недостаточно чертежей</div>';
        }
        h += '</div>';

        h += '</div>';
        UI._openScreenScrollable('Кузница', 'forge', h, 'UI.loadHome()');
    },

    _craftArrowFromUI: function(count) {
        var r = this.craftArrowBatch(count);
        if (r.success) {
            UI._showToast('✅ Сделано стрел: ' + r.crafted);
            this.showUI();
        } else {
            UI._showToast('❌ ' + r.reason);
        }
    },

    _craftRingFromUI: function() {
        var r = this.craftRing();
        if (r.success) {
            UI._showToast(r.newLevel === 1 ? '✅ Кольцо создано!' : '✅ Кольцо улучшено до ' + r.newLevel + ' ур.!');
            this.showUI();
        } else {
            UI._showToast('❌ ' + r.reason);
        }
    },

    _craftAmuletFromUI: function() {
        var r = this.craftAmulet();
        if (r.success) {
            UI._showToast(r.newLevel === 1 ? '✅ Амулет создан!' : '✅ Амулет улучшен до ' + r.newLevel + ' ур.!');
            this.showUI();
        } else {
            UI._showToast('❌ ' + r.reason);
        }
    },

    _craftSkinFromUI: function(skinId) {
        var r = this.craftSkin(skinId);
        if (r.success) {
            UI._showToast(r.action === 'created' ? '✅ Скин создан!' : '✅ Скин улучшен до ур. ' + r.level);
            this.showUI();
        } else {
            UI._showToast('❌ ' + r.reason);
        }
    },

    _sharpenFromUI: function() {
        var r = this.sharpen();
        if (r.success) {
            UI._playSound('forge');
            UI._showToast('✅ Заточка улучшена до ' + r.newLevel + ' уровня!');
            UI.updateDisplay();
            this.showUI();
        } else {
            UI._showToast('❌ ' + r.reason);
        }
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Forge = Sherwood.Forge;

console.log('🔧 Кузница загружена!');

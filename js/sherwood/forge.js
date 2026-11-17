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
    //  ПОДСЧЁТ И СПИСАНИЕ РЕСУРСОВ-ПРЕДМЕТОВ (скрижали, чертежи)
    //  Они лежат в сумке ПРЕДМЕТАМИ, поэтому getItems + removeItem
    // ============================================================
    _countInBag: function(ids) {
        var bag = Sherwood.Bag;
        if (!bag || !bag.getItems) return 0;
        var items = bag.getItems();
        var total = 0;
        for (var i = 0; i < items.length; i++) {
            if (ids.indexOf(items[i].id) !== -1) total += items[i].quantity || 1;
        }
        return total;
    },

    _spendFromBag: function(ids, amount) {
        var bag = Sherwood.Bag;
        if (!bag || !bag.getItems) return false;
        var items = bag.getItems();
        var need = amount;
        for (var i = items.length - 1; i >= 0 && need > 0; i--) {
            var item = items[i];
            if (ids.indexOf(item.id) !== -1) {
                var qty = item.quantity || 1;
                var take = Math.min(qty, need);
                bag.removeItem(i, take);
                need -= take;
            }
        }
        return need <= 0;
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
            if (item.id === 'branch_damned_yew' || item.id === 'branch' || item.resKey === 'branchDamnedYew') branches += item.quantity || 1;
            if (item.id === 'feather_beast_1' || item.id === 'feather' || item.resKey === 'feathers') feathers += item.quantity || 1;
            if (item.id === 'bone_growth_of_the_beast' || item.id === 'bone' || item.resKey === 'bones') bones += item.quantity || 1;
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
            var isBranch = (item.id === 'branch_damned_yew' || item.id === 'branch' || item.resKey === 'branchDamnedYew');
            var isFeather = (item.id === 'feather_beast_1' || item.id === 'feather' || item.resKey === 'feathers');
            var isBone = (item.id === 'bone_growth_of_the_beast' || item.id === 'bone' || item.resKey === 'bones');
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

        var haveTablets = this._countInBag(['skin_tablet']);

        if (currentLevel === 0) {
            if (haveTablets < info.costCreate) return { success: false, reason: 'Нужно ' + info.costCreate + ' скрижалей' };
            if (!this._spendFromBag(['skin_tablet'], info.costCreate)) return { success: false, reason: 'Не удалось списать скрижали' };
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
        if (!this._spendFromBag(['skin_tablet'], upgradeCost)) return { success: false, reason: 'Не удалось списать скрижали' };
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
        var tablets = this._countInBag(['ring_tablet']);
        return { currentLevel: currentLevel, maxLevel: 50, cost: cost, tablets: tablets, canCraft: currentLevel < 50 && tablets >= cost, isNew: currentLevel === 0 };
    },

    craftRing: function() {
        var info = this.getRingCraftInfo();
        if (info.currentLevel >= info.maxLevel) return { success: false, reason: 'Максимальный уровень' };
        if (info.tablets < info.cost) return { success: false, reason: 'Нужно ' + info.cost + ' скрижалей' };
        if (!this._spendFromBag(['ring_tablet'], info.cost)) return { success: false, reason: 'Не удалось списать скрижали' };
        var bag = Sherwood.Bag;
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
        var tablets = this._countInBag(['amulet_tablet']);
        return { currentLevel: currentLevel, maxLevel: 50, cost: cost, tablets: tablets, canCraft: currentLevel < 50 && tablets >= cost, isNew: currentLevel === 0 };
    },

    craftAmulet: function() {
        var info = this.getAmuletCraftInfo();
        if (info.currentLevel >= info.maxLevel) return { success: false, reason: 'Максимальный уровень' };
        if (info.tablets < info.cost) return { success: false, reason: 'Нужно ' + info.cost + ' скрижалей' };
        if (!this._spendFromBag(['amulet_tablet'], info.cost)) return { success: false, reason: 'Не удалось списать скрижали' };
        var bag = Sherwood.Bag;
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
        var drawings = this._countInBag(['skin_drawing']);
        return { level: currentLevel, cost: cost, drawings: drawings, canSharpen: drawings >= cost };
    },

    sharpen: function() {
        var info = this.getSharpeningInfo();
        if (!info.canSharpen) return { success: false, reason: 'Нужно ' + info.cost + ' чертежей' };
        if (!this._spendFromBag(['skin_drawing'], info.cost)) return { success: false, reason: 'Не удалось списать чертежи' };
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
    //  UI КУЗНИЦЫ (ЯЧЕЙКИ В СТИЛЕ КЕСЕТА)
    // ============================================================
    showUI: function() {
        if (typeof UI === 'undefined') return;
        UI._playSound('click');

        var self = this;
        var player = Sherwood.getPlayer();
        var bag = Sherwood.Bag;

        if (UI._screenLayer) {
            UI._screenLayer.style.overflow = 'hidden';
        }

        var BTN = 'background:#5a3a00;border:1px solid #c8a050;border-radius:8px;padding:8px 18px;color:#ffd700;font-weight:bold;cursor:pointer;font-size:0.85em;box-shadow:0 2px 4px rgba(0,0,0,0.3);box-sizing:border-box;';
        var BTN_OFF = 'background:rgba(0,0,0,0.5);border:1px solid #555;border-radius:8px;padding:8px 18px;color:#777;font-weight:bold;cursor:not-allowed;font-size:0.85em;box-sizing:border-box;';

        // Ячейка в стиле кесета: wallet_cell.png + иконка + бейдж-количество, подпись снизу
        function cell(icon, badge, label, sub, dim) {
            var c = '<div style="display:flex;flex-direction:column;align-items:center;">';
            c += '<div style="width:92px;height:92px;background:url(\'assets/interface/wallet_cell.png\') center/100% 100% no-repeat;display:flex;align-items:center;justify-content:center;position:relative;' + (dim ? 'opacity:0.45;' : '') + '">';
            c += '<img src="' + icon + '" style="width:46px;height:46px;object-fit:contain;" onerror="this.style.display=\'none\'">';
            if (badge !== null && badge !== undefined && badge !== '') {
                c += '<span style="position:absolute;bottom:7px;right:9px;color:#fff;font-size:0.72em;font-weight:bold;text-shadow:0 0 4px #000,0 1px 2px #000;">' + badge + '</span>';
            }
            c += '</div>';
            c += '<div style="color:#e0c080;font-size:0.72em;font-weight:bold;margin-top:5px;text-align:center;text-shadow:0 1px 3px #000;max-width:110px;">' + label + '</div>';
            if (sub) {
                c += '<div style="color:#b09a6a;font-size:0.65em;margin-top:2px;text-align:center;text-shadow:0 1px 3px #000;max-width:110px;">' + sub + '</div>';
            }
            c += '</div>';
            return c;
        }

        function tabBtn(tab, label) {
            var active = (self._currentTab === tab);
            return '<button onclick="Sherwood.Forge._currentTab=\'' + tab + '\'; Sherwood.Forge.showUI();" style="flex:1;max-width:150px;padding:10px 6px;border-radius:8px;border:2px solid ' + (active ? '#ffd700' : '#6b5a3a') + ';background:' + (active ? 'rgba(90,50,0,0.9)' : 'rgba(0,0,0,0.6)') + ';color:' + (active ? '#ffd700' : '#c8a050') + ';font-weight:bold;font-size:0.95em;cursor:pointer;text-shadow:0 2px 4px #000;box-sizing:border-box;">' + label + '</button>';
        }

        var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;overflow-y:auto;overflow-x:hidden;background:url(\'assets/assets2/backgrounds/forge.png\') center/cover no-repeat;scrollbar-width:none;-ms-overflow-style:none;">';
        h += '<style>.forge-scroll::-webkit-scrollbar{display:none;}.forge-scroll{scrollbar-width:none;}</style>';

        h += '<button onclick="UI.camp()" style="position:absolute;top:15px;left:15px;z-index:9999;background:rgba(0,0,0,0.8);border:2px solid #c8a050;border-radius:8px;padding:8px 16px;color:#c8a050;font-size:18px;font-weight:bold;cursor:pointer;box-shadow:0 4px 10px rgba(0,0,0,0.5);">← Назад</button>';

        h += '<div class="forge-scroll" style="position:relative;z-index:10;width:100%;min-height:100%;padding:70px 10px 40px;box-sizing:border-box;">';

        // === ВКЛАДКИ (один ряд) ===
        h += '<div style="display:flex;justify-content:center;gap:8px;margin-bottom:20px;">';
        h += tabBtn('arrows', 'Стрелы');
        h += tabBtn('jewelry', 'Ювелирка');
        h += tabBtn('skins', 'Облики');
        h += '</div>';

        // === КОЛОНКА ДЛЯ ИЗДЕЛИЯ: ячейка + кнопка под ней ===
        function cellWithBtn(icon, badge, label, sub, dim, btnHtml) {
            var c = '<div style="display:flex;flex-direction:column;align-items:center;">';
            c += cell(icon, badge, label, sub, dim);
            if (btnHtml) c += '<div style="margin-top:8px;">' + btnHtml + '</div>';
            c += '</div>';
            return c;
        }

        if (this._currentTab === 'arrows') {
            var arrowInfo = this.getArrowCraftInfo();

            h += '<div style="text-align:center;color:#e0c080;font-size:1.05em;font-weight:bold;margin-bottom:16px;text-shadow:0 2px 4px #000;">Крафт стрел</div>';

            // Материалы: 3 ячейки кесета, под каждой — название
            h += '<div style="display:flex;justify-content:center;align-items:flex-start;gap:10px;margin-bottom:6px;">';
            h += cell('assets/interface/branch_of_the_damned_yew.png', arrowInfo.branches, 'Ветка', null, arrowInfo.branches <= 0);
            h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;padding-top:34px;text-shadow:0 1px 3px #000;">+</div>';
            h += cell('assets/interface/feather_beast_1.png', arrowInfo.feathers, 'Перо', null, arrowInfo.feathers <= 0);
            h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;padding-top:34px;text-shadow:0 1px 3px #000;">+</div>';
            h += cell('assets/interface/bone_growth_of_the_beast.png', arrowInfo.bones, 'Кость', null, arrowInfo.bones <= 0);
            h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;padding-top:34px;text-shadow:0 1px 3px #000;">=</div>';
            h += cell('assets/interface/sherwood_hollow_arrow.png', arrowInfo.arrowsCount, 'Стрела', null, false);
            h += '</div>';

            h += '<div style="text-align:center;color:#b09a6a;font-size:0.8em;margin-bottom:14px;text-shadow:0 1px 3px #000;">Рецепт: 1 ветка + 1 перо + 1 кость = 1 стрела</div>';

            if (arrowInfo.canCraft > 0) {
                h += '<div style="text-align:center;color:#52b788;font-size:0.85em;font-weight:bold;margin-bottom:8px;text-shadow:0 1px 3px #000;">Доступно к крафту: ' + arrowInfo.canCraft + '</div>';
                h += '<div style="display:flex;justify-content:center;gap:8px;">';
                h += '<button onclick="Sherwood.Forge._craftArrowFromUI(1)" style="' + BTN + '">Сделать 1</button>';
                h += '<button onclick="Sherwood.Forge._craftArrowFromUI(5)" style="' + BTN + '">Сделать 5</button>';
                h += '<button onclick="Sherwood.Forge._craftArrowFromUI(10)" style="' + BTN + '">Сделать 10</button>';
                h += '</div>';
            } else {
                h += '<div style="display:flex;justify-content:center;">';
                h += '<div style="' + BTN_OFF + '">🔒 Не хватает запчастей</div>';
                h += '</div>';
                h += '<div style="text-align:center;color:#b09a6a;font-size:0.75em;margin-top:8px;text-shadow:0 1px 3px #000;">Запчасти продаются на Чёрном рынке и выпадают с врагов</div>';
            }

        } else if (this._currentTab === 'jewelry') {
            var ringInfo = this.getRingCraftInfo();
            var amuletInfo = this.getAmuletCraftInfo();

            h += '<div style="text-align:center;color:#e0c080;font-size:1.05em;font-weight:bold;margin-bottom:16px;text-shadow:0 2px 4px #000;">Ювелирная мастерская</div>';

            h += '<div style="display:flex;justify-content:center;align-items:flex-start;gap:30px;flex-wrap:wrap;">';

            var ringBtn = ringInfo.canCraft
                ? '<button onclick="Sherwood.Forge._craftRingFromUI()" style="' + BTN + '">' + (ringInfo.isNew ? 'Создать' : 'Улучшить') + '</button>'
                : '<div style="' + BTN_OFF + '">🔒 Мало скрижалей</div>';
            h += cellWithBtn(
                bag._equipment && bag._equipment.ring ? bag._equipment.ring.icon : 'assets/interface/ring_first_level.png',
                ringInfo.isNew ? '' : ringInfo.currentLevel,
                ringInfo.isNew ? 'Кольцо' : 'Кольцо, ур. ' + ringInfo.currentLevel,
                'Скрижали: ' + ringInfo.tablets + ' / ' + ringInfo.cost,
                !ringInfo.canCraft,
                ringBtn
            );

            var amuletBtn = amuletInfo.canCraft
                ? '<button onclick="Sherwood.Forge._craftAmuletFromUI()" style="' + BTN + '">' + (amuletInfo.isNew ? 'Создать' : 'Улучшить') + '</button>'
                : '<div style="' + BTN_OFF + '">🔒 Мало скрижалей</div>';
            h += cellWithBtn(
                bag._equipment && bag._equipment.amulet ? bag._equipment.amulet.icon : 'assets/interface/sherwood_amulet_level_one.png',
                amuletInfo.isNew ? '' : amuletInfo.currentLevel,
                amuletInfo.isNew ? 'Амулет' : 'Амулет, ур. ' + amuletInfo.currentLevel,
                'Скрижали: ' + amuletInfo.tablets + ' / ' + amuletInfo.cost,
                !amuletInfo.canCraft,
                amuletBtn
            );

            h += '</div>';

        } else if (this._currentTab === 'skins') {
            var skins = this.getCraftSkins();

            h += '<div style="text-align:center;color:#e0c080;font-size:1.05em;font-weight:bold;margin-bottom:16px;text-shadow:0 2px 4px #000;">Облики леса</div>';

            h += '<div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap;">';
            for (var s = 0; s < skins.length; s++) {
                var sk = skins[s];
                var sLvl = (player && player.skinLevels && player.skinLevels[sk.id]) ? player.skinLevels[sk.id] : 0;
                var nextCost = sLvl === 0 ? sk.costCreate : (sk.costCreate + sk.costUpgrade * sLvl);
                var iconPath = this._getSkinIcon(sk.id, sLvl);

                var btn;
                if (sLvl >= 100) {
                    btn = '<div style="color:#52b788;font-size:0.8em;font-weight:bold;text-shadow:0 1px 3px #000;">✅ Максимум</div>';
                } else {
                    btn = '<button onclick="Sherwood.Forge._craftSkinFromUI(\'' + sk.id + '\')" style="' + BTN + '">' + (sLvl === 0 ? 'Создать' : 'Улучшить') + '</button>';
                }

                h += cellWithBtn(
                    iconPath,
                    sLvl > 0 ? sLvl : '',
                    sk.name,
                    sLvl >= 100 ? '' : (sLvl > 0 ? 'Ур. ' + sLvl + ' | Цена: ' + nextCost : 'Цена: ' + nextCost),
                    sLvl >= 100,
                    btn
                );
            }
            h += '</div>';
        }

        // --- ПОДВАЛ (УЛУЧШЕНИЕ СНАРЯЖЕНИЯ) ---
        var sharpenInfo = this.getSharpeningInfo();
        h += '<div style="margin-top:24px;padding-top:14px;border-top:1px solid rgba(200,160,80,0.25);text-align:center;">';
        h += '<div style="color:#e0c080;font-size:0.95em;font-weight:bold;margin-bottom:10px;text-shadow:0 1px 3px #000;">⚡ Улучшение снаряжения</div>';
        h += '<div style="display:flex;justify-content:center;">';
        var sharpBtn = sharpenInfo.canSharpen
            ? '<button onclick="Sherwood.Forge._sharpenFromUI()" style="' + BTN + '">Улучшить</button>'
            : '<div style="' + BTN_OFF + '">🔒 Недостаточно чертежей</div>';
        h += cellWithBtn(
            'assets/interface/skin_drawing.png',
            sharpenInfo.drawings,
            'Чертежи',
            sharpenInfo.drawings + ' / ' + sharpenInfo.cost,
            !sharpenInfo.canSharpen,
            sharpBtn
        );
        h += '</div>';
        h += '</div>';

        h += '</div>';
        h += '</div>';

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

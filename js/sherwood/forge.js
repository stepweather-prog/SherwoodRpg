/**
 * Sherwood Forge — Кузница
 * Улучшение предметов, крафт стрел, скины, кольца, амулеты, заточка
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Forge = {
    // Сколько веток тиса на 1 стрелу (устарело, теперь рецепт: 1 ветка + 1 перо + 1 кость)
    BRANCHES_PER_ARROW: 3,

    // Рецепт стрелы
    ARROW_RECIPE: { branches: 1, feathers: 1, bones: 1 },

    _enhanceCosts: function(level) {
        return { gold: 10 + level * 15, silver: 50 + level * 30 };
    },

    init: function() {
        console.log('🔧 Кузница инициализирована');
    },

    // ============================================================
    //  ОКРУГЛЕНИЕ ДО РОВНЫХ ЗНАЧЕНИЙ
    // ============================================================
    roundToNice: function(val) {
        if (val <= 10) return Math.ceil(val);
        if (val <= 50) return Math.ceil(val / 5) * 5;
        if (val <= 200) return Math.ceil(val / 10) * 10;
        if (val <= 500) return Math.ceil(val / 25) * 25;
        if (val <= 1000) return Math.ceil(val / 50) * 50;
        if (val <= 5000) return Math.ceil(val / 100) * 100;
        if (val <= 20000) return Math.ceil(val / 500) * 500;
        return Math.ceil(val / 1000) * 1000;
    },

    // ============================================================
    //  КРАФТ СТРЕЛ
    //  1 ветка + 1 перо + 1 кость = 1 стрела
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
        return {
            branches: branches,
            feathers: feathers,
            bones: bones,
            canCraft: canCraft,
            arrowsCount: arrows
        };
    },

    craftArrow: function() {
        var info = this.getArrowCraftInfo();
        if (info.canCraft <= 0) {
            return { success: false, reason: 'Нужно: 1 ветка, 1 перо, 1 кость' };
        }
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
        if (needBranch > 0 || needFeather > 0 || needBone > 0) {
            return { success: false, reason: 'Не удалось списать ресурсы' };
        }

        bag.addItem({
            id: 'sherwood_arrow',
            name: 'Шервудская стрела',
            icon: 'assets/interface/sherwood_hollow_arrow.png',
            grade: 'rare',
            type: 'resource',
            quantity: 1,
            maxStack: 50,
            sellPrice: 2
        });
        Sherwood.saveGame();
        return { success: true, crafted: 1 };
    },

    craftArrowBatch: function(count) {
        var info = this.getArrowCraftInfo();
        count = Math.min(count || 1, info.canCraft);
        if (count <= 0) {
            return { success: false, reason: 'Нужно: 1 ветка, 1 перо, 1 кость' };
        }
        var totalArrows = 0;
        for (var i = 0; i < count; i++) {
            var r = this.craftArrow();
            if (r.success) totalArrows += r.crafted;
        }
        return { success: true, crafted: totalArrows };
    },

    getArrowCount: function() {
        var bag = Sherwood.Bag;
        if (!bag) return 0;
        var items = bag.getItems();
        var count = 0;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === 'sherwood_arrow') count += items[i].quantity || 1;
        }
        return count;
    },

    // ============================================================
    //  КОЛЬЦО
    // ============================================================
    getRingCraftInfo: function() {
        var bag = Sherwood.Bag;
        if (!bag) return { currentLevel: 0, maxLevel: 50, cost: 100, tablets: 0, canCraft: false, isNew: true };

        var ring = bag._equipment ? bag._equipment.ring : null;
        var currentLevel = ring ? (ring.level || 1) : 0;
        var maxLevel = 50;
        
        var cost = currentLevel === 0 ? 100 : 50 + (currentLevel - 1) * 50;
        var tablets = bag.getResource ? bag.getResource('ringTablets') : 0;
        
        return {
            currentLevel: currentLevel,
            maxLevel: maxLevel,
            cost: cost,
            tablets: tablets,
            canCraft: currentLevel < maxLevel && tablets >= cost,
            isNew: currentLevel === 0
        };
    },

    craftRing: function() {
        var info = this.getRingCraftInfo();
        if (info.currentLevel >= info.maxLevel) return { success: false, reason: 'Максимальный уровень' };
        if (info.tablets < info.cost) return { success: false, reason: 'Нужно ' + info.cost + ' скрижалей, у вас ' + info.tablets };

        var bag = Sherwood.Bag;
        if (!bag) return { success: false, reason: 'Сумка не найдена' };

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

        bag._equipment.ring = {
            name: 'Кольцо силы ' + newLevel,
            icon: ringIcon,
            part: 'ring',
            grade: grade,
            level: newLevel,
            stats: { attack: bonus, defense: bonus, hp: bonus }
        };

        bag._save();
        Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, newLevel: newLevel, bonus: bonus };
    },

    // ============================================================
    //  АМУЛЕТ
    // ============================================================
    getAmuletCraftInfo: function() {
        var bag = Sherwood.Bag;
        if (!bag) return { currentLevel: 0, maxLevel: 50, cost: 100, tablets: 0, canCraft: false, isNew: true };

        var amulet = bag._equipment ? bag._equipment.amulet : null;
        var currentLevel = amulet ? (amulet.level || 1) : 0;
        var maxLevel = 50;
        
        var cost = currentLevel === 0 ? 100 : 50 + (currentLevel - 1) * 50;
        var tablets = bag.getResource ? bag.getResource('amuletTablets') : 0;
        
        return {
            currentLevel: currentLevel,
            maxLevel: maxLevel,
            cost: cost,
            tablets: tablets,
            canCraft: currentLevel < maxLevel && tablets >= cost,
            isNew: currentLevel === 0
        };
    },

    craftAmulet: function() {
        var info = this.getAmuletCraftInfo();
        if (info.currentLevel >= info.maxLevel) return { success: false, reason: 'Максимальный уровень' };
        if (info.tablets < info.cost) return { success: false, reason: 'Нужно ' + info.cost + ' скрижалей, у вас ' + info.tablets };

        var bag = Sherwood.Bag;
        if (!bag) return { success: false, reason: 'Сумка не найдена' };

        bag.spendResource('amuletTablets', info.cost);

        var newLevel = info.currentLevel + 1;
        var raw = 5 * Math.pow(1.4, newLevel - 1);
        var bonus = this.roundToNice(raw);

        var amuletIcon = 'assets/interface/sherwood_amulet_level_one.png';
        if (newLevel >= 50) amuletIcon = 'assets/interface/sherwood_amulet_level_five.png';
        else if (newLevel >= 40) amuletIcon = 'assets/interface/sherwood_amulet_level_four.png';
        else if (newLevel >= 30) amuletIcon = 'assets/interface/sherwood_amulet_level_three.png';
        else if (newLevel >= 20) amuletIcon = 'assets/interface/sherwood_amulet_level_two.png';
        else if (newLevel >= 10) amuletIcon = 'assets/interface/sherwood_amulet_level_two.png';

        var grade = newLevel >= 40 ? 'legendary' : newLevel >= 30 ? 'epic' : newLevel >= 20 ? 'rare' : newLevel >= 10 ? 'uncommon' : 'common';

        bag._equipment.amulet = {
            name: 'Амулет защиты ' + newLevel,
            icon: amuletIcon,
            part: 'amulet',
            grade: grade,
            level: newLevel,
            stats: { attack: bonus, defense: bonus, hp: bonus * 2 }
        };

        bag._save();
        Sherwood._recalcStats();
        Sherwood.saveGame();
        return { success: true, newLevel: newLevel, bonus: bonus };
    },

    // ============================================================
    //  ЗАТОЧКА (ГЛОБАЛЬНАЯ)
    // ============================================================
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
        
        return {
            level: currentLevel,
            cost: cost,
            drawings: drawings,
            canSharpen: drawings >= cost
        };
    },

    sharpen: function() {
        var info = this.getSharpeningInfo();
        if (!info.canSharpen) return { success: false, reason: 'Нужно ' + info.cost + ' чертежей заточки, у вас ' + info.drawings };
        
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
    //  UI КУЗНИЦЫ (вызывается из лагеря/таверны)
    // ============================================================
    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') showGenericScreen('Кузница', '');
            return;
        }
        UI._playSound('click');

        var player = Sherwood.getPlayer();
        var bag = Sherwood.Bag;
        var resources = bag ? bag.getResources() : {};
        var skinDrawings = 0;
        if (bag) {
            var items = bag.getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === 'skin_drawing') skinDrawings += items[i].quantity || 1;
            }
        }
        
        var ringInfo = this.getRingCraftInfo();
        var amuletInfo = this.getAmuletCraftInfo();
        var arrowInfo = this.getArrowCraftInfo();
        var sharpenInfo = this.getSharpeningInfo();

        var h = '<div style="padding:10px;max-width:400px;margin:0 auto;">';

        // Стрелы
        h += '<div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;margin-bottom:10px;">';
        h += '<div style="color:#ffa500;font-weight:bold;">🏹 Стрелы</div>';
        h += '<div style="color:#888;font-size:11px;">Веток: ' + arrowInfo.branches + ' | Перьев: ' + arrowInfo.feathers + ' | Костей: ' + arrowInfo.bones + '</div>';
        h += '<div style="color:#888;font-size:11px;">Рецепт: 1 ветка + 1 перо + 1 кость = 1 стрела</div>';
        h += '<div style="color:#888;font-size:11px;">Можно сделать: ' + arrowInfo.canCraft + '</div>';
        h += '<div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">';
        h += '<button onclick="Sherwood.Forge._craftArrowFromUI(1)" class="btn btn-success" style="padding:4px 12px;font-size:11px;">Сделать 1</button>';
        h += '<button onclick="Sherwood.Forge._craftArrowFromUI(5)" class="btn btn-gold" style="padding:4px 12px;font-size:11px;">Сделать 5</button>';
        h += '<button onclick="Sherwood.Forge._craftArrowFromUI(10)" class="btn btn-danger" style="padding:4px 12px;font-size:11px;">Сделать 10</button>';
        h += '</div>';
        h += '<div style="color:#888;font-size:10px;margin-top:4px;">Всего стрел в сумке: ' + arrowInfo.arrowsCount + '</div>';
        h += '</div>';

        // Кольцо
        h += '<div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;margin-bottom:10px;">';
        h += '<div style="color:#4a8ab7;font-weight:bold;">💍 Кольцо ' + (ringInfo.isNew ? '(нет)' : '(Ур. ' + ringInfo.currentLevel + '/' + ringInfo.maxLevel + ')') + '</div>';
        h += '<div style="color:#888;font-size:11px;">Скрижалей: ' + ringInfo.tablets + ' | Нужно: ' + ringInfo.cost + '</div>';
        if (ringInfo.canCraft) {
            h += '<button onclick="Sherwood.Forge._craftRingFromUI()" class="btn btn-gold" style="margin-top:6px;padding:4px 20px;font-size:12px;">' + (ringInfo.isNew ? 'Создать' : 'Улучшить') + '</button>';
        } else {
            h += '<div style="color:#555;font-size:11px;">🔒 Недостаточно скрижалей</div>';
        }
        h += '</div>';

        // Амулет
        h += '<div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;margin-bottom:10px;">';
        h += '<div style="color:#a8d8ea;font-weight:bold;">📿 Амулет ' + (amuletInfo.isNew ? '(нет)' : '(Ур. ' + amuletInfo.currentLevel + '/' + amuletInfo.maxLevel + ')') + '</div>';
        h += '<div style="color:#888;font-size:11px;">Скрижалей: ' + amuletInfo.tablets + ' | Нужно: ' + amuletInfo.cost + '</div>';
        if (amuletInfo.canCraft) {
            h += '<button onclick="Sherwood.Forge._craftAmuletFromUI()" class="btn btn-gold" style="margin-top:6px;padding:4px 20px;font-size:12px;">' + (amuletInfo.isNew ? 'Создать' : 'Улучшить') + '</button>';
        } else {
            h += '<div style="color:#555;font-size:11px;">🔒 Недостаточно скрижалей</div>';
        }
        h += '</div>';

        // Заточка
        h += '<div style="background:rgba(255,255,255,0.05);padding:12px;border-radius:8px;">';
        h += '<div style="color:#ffd700;font-weight:bold;">⚡ Заточка (Ур. ' + sharpenInfo.level + ')</div>';
        h += '<div style="color:#888;font-size:11px;">Чертежей: ' + sharpenInfo.drawings + ' | Нужно: ' + sharpenInfo.cost + '</div>';
        h += '<div style="color:#888;font-size:10px;">+5 ко всем статам за уровень</div>';
        if (sharpenInfo.canSharpen) {
            h += '<button onclick="Sherwood.Forge._sharpenFromUI()" class="btn btn-gold" style="margin-top:6px;padding:4px 20px;font-size:12px;">Заточить</button>';
        } else {
            h += '<div style="color:#555;font-size:11px;">🔒 Недостаточно чертежей</div>';
        }
        h += '</div>';

        h += '</div>';
        UI._openScreenScrollable('🔧 Кузница', 'forge', h);
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
            UI._showToast(r.newLevel === 1 ? '✅ Кольцо создано!' : '✅ Кольцо улучшено до ' + r.newLevel + ' уровня!');
            this.showUI();
        } else {
            UI._showToast('❌ ' + r.reason);
        }
    },

    _craftAmuletFromUI: function() {
        var r = this.craftAmulet();
        if (r.success) {
            UI._showToast(r.newLevel === 1 ? '✅ Амулет создан!' : '✅ Амулет улучшен до ' + r.newLevel + ' уровня!');
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

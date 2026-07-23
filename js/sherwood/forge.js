/**
 * Sherwood Forge — Кузница (заточка, крафт обликов)
 */

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
        return {
            gold: 10 + level * 15,
            silver: 50 + level * 30
        };
    },

    getEnhanceInfo: function(itemGrade) {
        const maxLevel = itemGrade === 'legendary' ? 20 : itemGrade === 'epic' ? 17 : itemGrade === 'rare' ? 14 : itemGrade === 'uncommon' ? 11 : 8;
        return { maxLevel: maxLevel };
    },

    enhanceItem: function(itemIndex) {
        const bag = Sherwood.Bag;
        const items = bag.getItems();
        if (itemIndex < 0 || itemIndex >= items.length) return { success: false, reason: 'Предмет не найден' };
        
        const item = items[itemIndex];
        if (!item.part && !item.type) return { success: false, reason: 'Нельзя улучшить' };
        
        const currentLevel = item.enhancement || 0;
        const info = this.getEnhanceInfo(item.grade || 'common');
        if (currentLevel >= info.maxLevel) return { success: false, reason: 'Максимальный уровень' };
        
        const nextLevel = currentLevel + 1;
        const cost = this._enhanceCosts(nextLevel);
        const player = Sherwood.getPlayer();
        
        if ((player.resources.gold || 0) < cost.gold || (player.resources.silver || 0) < cost.silver) {
            return { success: false, reason: 'Недостаточно ресурсов' };
        }
        
        player.resources.gold -= cost.gold;
        player.resources.silver -= cost.silver;
        
        const chanceData = this._enhanceChances.find(c => c.level === nextLevel) || { chance: 50, break: false };
        const roll = Math.random() * 100;
        
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
        const skin = this.getCraftSkins().find(s => s.id === skinId);
        if (!skin) return { can: false, reason: 'Скин не найден' };
        
        const player = Sherwood.getPlayer();
        const progress = player.questProgress || { completed: [] };
        if (skin.chapter > 1 && !progress.completed.includes(skin.chapter - 1)) {
            return { can: false, reason: 'Глава не пройдена' };
        }
        
        if (player.unlockedSkins && player.unlockedSkins.includes(skinId)) {
            return { can: false, reason: 'Уже разблокирован' };
        }
        
        const resources = player.resources || {};
        if ((resources.ingots || 0) < skin.cost.ingots) return { can: false, reason: 'Недостаточно слитков' };
        if ((resources.scrolls || 0) < skin.cost.scrolls) return { can: false, reason: 'Недостаточно скрижалей' };
        if ((resources.silver || 0) < skin.cost.silver) return { can: false, reason: 'Недостаточно серебра' };
        
        return { can: true };
    },

    craftSkin: function(skinId) {
        const check = this.canCraftSkin(skinId);
        if (!check.can) return check;
        
        const skin = this.getCraftSkins().find(s => s.id === skinId);
        const player = Sherwood.getPlayer();
        
        player.resources.ingots -= skin.cost.ingots;
        player.resources.scrolls -= skin.cost.scrolls;
        player.resources.silver -= skin.cost.silver;
        
        if (!player.unlockedSkins) player.unlockedSkins = [];
        player.unlockedSkins.push(skinId);
        
        Sherwood.saveGame();
        return { success: true, skin: skin };
    },

    equipSkin: function(skinId) {
        const player = Sherwood.getPlayer();
        if (!player.unlockedSkins || !player.unlockedSkins.includes(skinId)) {
            return { success: false, reason: 'Скин не разблокирован' };
        }
        player.activeSkin = skinId;
        Sherwood.saveGame();
        return { success: true, skinId: skinId };
    },

    getActiveSkin: function() {
        const player = Sherwood.getPlayer();
        return player.activeSkin || 'skin_1_basic';
    }
};

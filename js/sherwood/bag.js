/**
 * Sherwood Bag System — Инвентарь, лут, экипировка
 */

Sherwood.Bag = {
    // ============================================================
    //  ДАННЫЕ
    // ============================================================

    _inventory: [],
    _equipment: {
        head: null,
        torso: null,
        hands: null,
        legs: null,
        feet: null,
        weapon1: null,
        weapon2: null,
        belt: null,
        amulet: null,
        ring: null
    },
    _maxSlots: 30,

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    init() {
        const player = Sherwood.getPlayer();
        if (!player) return;

        this._inventory = player.inventory || [];
        this._equipment = player.equipment || this._equipment;
        this._maxSlots = player.bagSize || 30;

        // Подписываемся на события
        Sherwood.on('DUNGEON_CHEST_OPENED', (data) => {
            this.addItem(data.item);
        });

        Sherwood.on('BOSS_DEFEATED', (data) => {
            if (data.reward && data.reward.item) {
                this.addItem(data.reward.item);
            }
        });

        Sherwood.on('QUEST_CHAPTER_COMPLETED', (data) => {
            if (data.reward && data.reward.item) {
                this.addItem(data.reward.item);
            }
        });
    },

    // ============================================================
    //  ОСНОВНЫЕ МЕТОДЫ
    // ============================================================

    getItems() {
        return this._inventory;
    },

    getEquipment() {
        return this._equipment;
    },

    getMaxSlots() {
        return this._maxSlots;
    },

    getFreeSlots() {
        return this._maxSlots - this._inventory.length;
    },

    isFull() {
        return this._inventory.length >= this._maxSlots;
    },

    // ============================================================
    //  ДОБАВЛЕНИЕ ПРЕДМЕТОВ
    // ============================================================

    addItem(item) {
        if (!item) return false;
        if (this.isFull()) {
            Sherwood.dispatch({
                type: 'BAG_FULL',
                payload: { item }
            });
            return false;
        }

        // Если предмет стакается
        if (item.stackable && item.quantity) {
            const existing = this._inventory.find(i =>
                i.id === item.id && i.stackable
            );
            if (existing) {
                existing.quantity += item.quantity;
                this._save();
                return true;
            }
        }

        // Новый предмет
        this._inventory.push({ ...item });
        this._save();

        Sherwood.dispatch({
            type: 'ITEM_ACQUIRED',
            payload: { item }
        });

        return true;
    },

    // ============================================================
    //  УДАЛЕНИЕ ПРЕДМЕТОВ
    // ============================================================

    removeItem(index, quantity = 1) {
        if (index < 0 || index >= this._inventory.length) return false;

        const item = this._inventory[index];
        if (!item) return false;

        if (item.stackable && item.quantity > quantity) {
            item.quantity -= quantity;
            this._save();
            return true;
        }

        this._inventory.splice(index, 1);
        this._save();
        return true;
    },

    // ============================================================
    //  ЭКИПИРОВКА
    // ============================================================

    equipItem(index) {
        if (index < 0 || index >= this._inventory.length) return false;

        const item = this._inventory[index];
        if (!item || !item.part) return false;

        const part = item.part;
        const oldItem = this._equipment[part];

        // Снимаем старый предмет в инвентарь
        if (oldItem) {
            this._inventory.push(oldItem);
        }

        // Надеваем новый
        this._equipment[part] = item;
        this._inventory.splice(index, 1);

        // Пересчитываем статы
        Sherwood._recalcStats();

        Sherwood.dispatch({
            type: 'ITEM_EQUIPPED',
            payload: { part, item }
        });

        this._save();
        return true;
    },

    unequipItem(part) {
        if (!part || !this._equipment[part]) return false;

        const item = this._equipment[part];
        if (this.isFull()) {
            Sherwood.dispatch({
                type: 'BAG_FULL',
                payload: { item }
            });
            return false;
        }

        this._inventory.push(item);
        this._equipment[part] = null;

        Sherwood._recalcStats();

        Sherwood.dispatch({
            type: 'ITEM_UNEQUIPPED',
            payload: { part, item }
        });

        this._save();
        return true;
    },

    // ============================================================
    //  ПРОДАЖА / РАЗБОР
    // ============================================================

    sellItem(index) {
        if (index < 0 || index >= this._inventory.length) return false;

        const item = this._inventory[index];
        if (!item) return false;

        const price = item.sellPrice || Math.floor((item.buyPrice || 10) * 0.4);
        Sherwood.addResource('silver', price);

        this._inventory.splice(index, 1);
        this._save();

        Sherwood.dispatch({
            type: 'ITEM_SOLD',
            payload: { item, price }
        });

        return true;
    },

    dismantleItem(index) {
        if (index < 0 || index >= this._inventory.length) return false;

        const item = this._inventory[index];
        if (!item) return false;

        // Ресурсы на разбор
        const materials = this._getDismantleMaterials(item);
        for (const [material, count] of Object.entries(materials)) {
            Sherwood.addResource(material, count);
        }

        this._inventory.splice(index, 1);
        this._save();

        Sherwood.dispatch({
            type: 'ITEM_DISMANTLED',
            payload: { item, materials }
        });

        return true;
    },

    _getDismantleMaterials(item) {
        const grade = item.grade || 'common';
        const base = {
            wood: 1,
            silver: 5,
            scraps: 1
        };

        const multipliers = {
            common: 1,
            uncommon: 2,
            rare: 4,
            epic: 8,
            legendary: 16
        };

        const mult = multipliers[grade] || 1;
        const result = {};

        // В зависимости от типа предмета
        if (item.type === 'weapon') {
            result.wood = (base.wood + Math.floor(Math.random() * 3)) * mult;
            result.silver = (base.silver + Math.floor(Math.random() * 10)) * mult;
            result.scraps = (base.scraps + Math.floor(Math.random() * 2)) * mult;
            if (grade === 'rare' || grade === 'epic' || grade === 'legendary') {
                result.gold = Math.floor(Math.random() * 5) * mult;
            }
        } else if (item.type === 'armor') {
            result.wood = (base.wood + Math.floor(Math.random() * 2)) * mult;
            result.silver = (base.silver + Math.floor(Math.random() * 15)) * mult;
            result.scraps = (base.scraps + Math.floor(Math.random() * 3)) * mult;
            if (grade === 'epic' || grade === 'legendary') {
                result.gold = Math.floor(Math.random() * 8) * mult;
            }
        } else {
            result.wood = base.wood * mult;
            result.silver = base.silver * mult;
            result.scraps = base.scraps * mult;
        }

        return result;
    },

    // ============================================================
    //  СОХРАНЕНИЕ
    // ============================================================

    _save() {
        const player = Sherwood.getPlayer();
        if (!player) return;

        player.inventory = this._inventory;
        player.equipment = this._equipment;
        player.bagSize = this._maxSlots;
        Sherwood.saveGame();
    },

    // ============================================================
    //  ВИЗУАЛЬНОЕ ОТОБРАЖЕНИЕ (для ui.js)
    // ============================================================

    getInventoryHTML() {
        if (this._inventory.length === 0) {
            return '<div class="bag-empty">🎒 Сумка пуста</div>';
        }

        let html = '<div class="bag-grid">';
        this._inventory.forEach((item, index) => {
            const gradeColor = Sherwood.Models?.GradeColors?.[item.grade] || '#9d9d9d';
            html += `
                <div class="bag-slot" style="border-color: ${gradeColor};" data-index="${index}">
                    <div class="bag-item-icon">
                        <img src="${item.icon || 'assets/icons/default_item.png'}" alt="${item.name}">
                        ${item.quantity > 1 ? `<span class="bag-item-count">${item.quantity}</span>` : ''}
                    </div>
                    <div class="bag-item-grade" style="color: ${gradeColor};">${item.grade || 'common'}</div>
                </div>
            `;
        });
        html += '</div>';

        return html;
    },

    getEquipmentHTML() {
        const parts = ['head', 'torso', 'hands', 'legs', 'feet', 'weapon1', 'weapon2', 'belt', 'amulet', 'ring'];
        const partNames = {
            head: 'Голова',
            torso: 'Тело',
            hands: 'Руки',
            legs: 'Ноги',
            feet: 'Ступни',
            weapon1: 'Оружие 1',
            weapon2: 'Оружие 2',
            belt: 'Пояс',
            amulet: 'Амулет',
            ring: 'Кольцо'
        };

        let html = '<div class="equipment-grid">';
        parts.forEach(part => {
            const item = this._equipment[part];
            const hasItem = !!item;
            const gradeColor = hasItem ? (Sherwood.Models?.GradeColors?.[item.grade] || '#9d9d9d') : '#444';

            html += `
                <div class="equipment-slot" data-part="${part}" style="border-color: ${gradeColor};">
                    <div class="equipment-slot-label">${partNames[part]}</div>
                    ${hasItem ? `
                        <div class="equipment-item">
                            <img src="${item.icon || 'assets/icons/default_item.png'}" alt="${item.name}">
                            <span class="equipment-item-name">${item.name}</span>
                            <button onclick="Sherwood.Bag.unequipItem('${part}')" class="unequip-btn">✕</button>
                        </div>
                    ` : '<div class="equipment-empty">Пусто</div>'}
                </div>
            `;
        });
        html += '</div>';

        return html;
    },

    // ============================================================
    //  ПОЛУЧЕНИЕ ЛУТА ИЗ ПОДЗЕМКИ
    // ============================================================

    addLoot(loot) {
        if (!loot) return;

        const player = Sherwood.getPlayer();
        if (!player) return;

        // Золото
        if (loot.gold) {
            Sherwood.addResource('gold', loot.gold);
        }

        // Серебро
        if (loot.silver) {
            Sherwood.addResource('silver', loot.silver);
        }

        // Опыт
        if (loot.exp) {
            Sherwood.addExp(loot.exp);
        }

        // Предметы
        if (loot.items && loot.items.length > 0) {
            loot.items.forEach(item => {
                this.addItem(item);
            });
        }

        // Слитки
        if (loot.ingots) {
            for (const [ingotId, count] of Object.entries(loot.ingots)) {
                const ingotItem = {
                    id: ingotId,
                    name: this._getIngotName(ingotId),
                    icon: 'assets/interface/resource_crafting.png',
                    stackable: true,
                    quantity: count,
                    type: 'ingot',
                    grade: 'common'
                };
                this.addItem(ingotItem);
            }
        }

        // Скрижали
        if (loot.tablets) {
            for (const [tabletId, count] of Object.entries(loot.tablets)) {
                const tabletItem = {
                    id: tabletId,
                    name: this._getTabletName(tabletId),
                    icon: 'assets/interface/tablet_icon.png',
                    stackable: true,
                    quantity: count,
                    type: 'tablet',
                    grade: 'rare'
                };
                this.addItem(tabletItem);
            }
        }

        Sherwood.dispatch({
            type: 'LOOT_ACQUIRED',
            payload: { loot }
        });
    },

    _getIngotName(id) {
        const names = {
            'ingot_chapter_1': 'Слиток главы 1',
            'ingot_chapter_2': 'Слиток главы 2',
            'ingot_chapter_3': 'Слиток главы 3',
            'ingot_chapter_4': 'Слиток главы 4',
            'ingot_chapter_5': 'Слиток главы 5',
            'ingot_chapter_6': 'Слиток главы 6',
            'ingot_chapter_7': 'Слиток главы 7',
            'ingot_chapter_8': 'Слиток главы 8',
            'ingot_chapter_9': 'Слиток главы 9',
            'ingot_chapter_10': 'Слиток главы 10',
            'ingot_chapter_11': 'Слиток главы 11',
            'ingot_chapter_12': 'Слиток главы 12',
            'ingot_chapter_13': 'Слиток главы 13',
            'ingot_chapter_14': 'Слиток главы 14'
        };
        return names[id] || id.replace('_', ' ');
    },

    _getTabletName(id) {
        const names = {
            'tablet_skin': 'Скрижаль облика',
            'tablet_ring': 'Скрижаль кольца',
            'tablet_amulet': 'Скрижаль амулета'
        };
        return names[id] || id.replace('_', ' ');
    }
};

// ============================================================
//  ПОДКЛЮЧЕНИЕ К ГЛОБАЛЬНОМУ ОБЪЕКТУ
// ============================================================

if (typeof Sherwood !== 'undefined') {
    Sherwood.Bag = Sherwood.Bag || Sherwood.Bag;
}

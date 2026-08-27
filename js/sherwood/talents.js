// js/talents.js
const Talents = {
    list: [
        { id: 'healing', name: 'Исцеление', icon: 'healing.png', desc: 'Восстанавливает HP в бою', baseCost: 100, maxLevel: 10, type: 'active' },
        { id: 'healer', name: 'Целитель', icon: 'Healer.png', desc: 'Усиливает исцеление', baseCost: 150, maxLevel: 5, type: 'passive' },
        { id: 'numbness', name: 'Онемение', icon: 'Numbness.png', desc: 'Снижает урон от врагов', baseCost: 120, maxLevel: 8, type: 'passive' },
        { id: 'ricochet', name: 'Рикошет', icon: 'Ricochet.png', desc: 'Атака бьёт двух врагов', baseCost: 200, maxLevel: 5, type: 'passive' },
        { id: 'riot', name: 'Бунт', icon: 'Riot.png', desc: 'Увеличивает шанс крита', baseCost: 180, maxLevel: 8, type: 'passive' },
        { id: 'silence', name: 'Тишина', icon: 'Silence.png', desc: 'Блокирует способности врага', baseCost: 160, maxLevel: 5, type: 'active' },
        { id: 'blocking', name: 'Блок', icon: 'blocking.png', desc: 'Шанс заблокировать удар', baseCost: 100, maxLevel: 10, type: 'passive' },
        { id: 'evil_eye', name: 'Сглаз', icon: 'evil_eye.png', desc: 'Снижает защиту врага', baseCost: 140, maxLevel: 6, type: 'active' },
        { id: 'force_elements', name: 'Сила стихий', icon: 'force of the elements.png', desc: 'Добавляет стихийный урон', baseCost: 250, maxLevel: 5, type: 'passive' },
        { id: 'funnel', name: 'Воронка', icon: 'funnel.png', desc: 'Вытягивает HP из врага', baseCost: 220, maxLevel: 5, type: 'active' },
        { id: 'ignore', name: 'Игнор', icon: 'ignore.png', desc: 'Игнорирует часть брони', baseCost: 130, maxLevel: 8, type: 'passive' },
        { id: 'inspiration', name: 'Вдохновение', icon: 'inspiration.png', desc: 'Увеличивает получаемый опыт', baseCost: 170, maxLevel: 6, type: 'passive' },
        { id: 'knot', name: 'Узел', icon: 'knot.png', desc: 'Сковывает врага', baseCost: 150, maxLevel: 5, type: 'active' },
        { id: 'parry', name: 'Парирование', icon: 'parry.png', desc: 'Отражает атаку', baseCost: 190, maxLevel: 6, type: 'passive' },
        { id: 'poisoning', name: 'Отравление', icon: 'poisoning.png', desc: 'Наносит урон ядом', baseCost: 160, maxLevel: 8, type: 'active' },
        { id: 'simple_attack', name: 'Простая атака', icon: 'simple_attack.png', desc: 'Базовая атака', baseCost: 50, maxLevel: 20, type: 'active' },
        { id: 'stunning', name: 'Оглушение', icon: 'stunning.png', desc: 'Оглушает врага', baseCost: 140, maxLevel: 5, type: 'active' },
        { id: 'vampirism', name: 'Вампиризм', icon: 'vampirism.png', desc: 'Восстанавливает HP от атак', baseCost: 200, maxLevel: 6, type: 'passive' },
    ],
    
    getLearned() {
        const p = Sherwood.getPlayer();
        if (!p.talents) p.talents = {};
        return p.talents;
    },
    
    learn(id) {
        const talent = this.list.find(t => t.id === id);
        if (!talent) return { success: false, reason: 'Талант не найден' };
        
        const p = Sherwood.getPlayer();
        const cost = this.getCost(id, 0);
        
        if (!p.resources || (p.resources.gold || 0) < cost) {
            return { success: false, reason: 'Недостаточно золота' };
        }
        
        p.resources.gold -= cost;
        if (!p.talents) p.talents = {};
        p.talents[id] = { level: 1, enabled: true };
        Sherwood.saveGame();
        return { success: true };
    },
    
    upgrade(id) {
        const talent = this.list.find(t => t.id === id);
        if (!talent) return { success: false, reason: 'Талант не найден' };
        
        const p = Sherwood.getPlayer();
        const current = p.talents && p.talents[id];
        if (!current) return { success: false, reason: 'Талант не изучен' };
        if (current.level >= talent.maxLevel) return { success: false, reason: 'Максимальный уровень' };
        
        const cost = this.getCost(id, current.level);
        if ((p.resources.gold || 0) < cost) {
            return { success: false, reason: 'Недостаточно золота' };
        }
        
        p.resources.gold -= cost;
        current.level++;
        Sherwood.saveGame();
        return { success: true };
    },
    
    toggle(id) {
        const p = Sherwood.getPlayer();
        const current = p.talents && p.talents[id];
        if (!current) return { success: false };
        current.enabled = !current.enabled;
        Sherwood.saveGame();
        return { success: true, enabled: current.enabled };
    },
    
    getCost(id, level) {
        const talent = this.list.find(t => t.id === id);
        if (!talent) return 0;
        return Math.floor(talent.baseCost * Math.pow(1.5, level));
    },
    
    getLevel(id) {
        const p = Sherwood.getPlayer();
        return (p.talents && p.talents[id]) ? p.talents[id].level : 0;
    },
    
    isEnabled(id) {
        const p = Sherwood.getPlayer();
        return (p.talents && p.talents[id]) ? p.talents[id].enabled : false;
    }
};

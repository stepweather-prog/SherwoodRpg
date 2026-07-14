// src/game/core/Player.js
export class Player {
    constructor() {
        this.load();
    }
    
    load() {
        // Загружаем из localStorage или создаем нового
        const saved = localStorage.getItem('robinhood_player');
        if (saved) {
            Object.assign(this, JSON.parse(saved));
        } else {
            this.hp = 100;
            this.maxHp = 100;
            this.attack = 5;
            this.defense = 3;
            this.gold = 50;
            this.level = 1;
            this.experience = 0;
            this.inventory = [];
            this.equipment = {
                weapon: null,
                armor: null,
                shield: null
            };
            this.save();
        }
    }
    
    save() {
        localStorage.setItem('robinhood_player', JSON.stringify(this));
    }
    
    addGold(amount) {
        this.gold += amount;
        this.save();
        return this.gold;
    }
    
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.defense);
        this.hp -= actualDamage;
        if (this.hp < 0) this.hp = 0;
        this.save();
        return actualDamage;
    }
    
    heal(amount) {
        this.hp = Math.min(this.maxHp, this.hp + amount);
        this.save();
        return this.hp;
    }
    
    addExperience(exp) {
        this.experience += exp;
        while (this.experience >= this.getExpForLevel()) {
            this.experience -= this.getExpForLevel();
            this.level++;
            // Увеличиваем статы при повышении уровня
            this.maxHp += 10;
            this.hp = this.maxHp;
            this.attack += 1;
            this.defense += 1;
            this.gold += 10;
            this.save();
            return true; // level up
        }
        this.save();
        return false;
    }
    
    getExpForLevel() {
        return Math.floor(this.level * 20 + 10);
    }
}
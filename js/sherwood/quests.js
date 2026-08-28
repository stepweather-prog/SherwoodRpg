// ===== ОБНОВЛЯЕМ Sherwood.Quests - БЕЗ ПОБЕГА =====

// Переопределяем flee - теперь это "пропустить ход" или просто убираем
Sherwood.Quests.flee = function() {
    // Теперь это не побег, а пропуск хода (восстановление)
    const p = Sherwood.getPlayer();
    if (!p) return { success: false, reason: 'Нет игрока' };
    
    // Восстанавливаем немного HP, но пропускаем ход
    const healAmount = Math.floor(p.stats.maxHp * 0.05);
    p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + healAmount);
    Sherwood.saveGame();
    
    return { 
        success: true, 
        message: `💚 Отдых: +${healAmount} HP`,
        healed: healAmount,
        playerHp: p.stats.hp
    };
};

// ===== МЕНЯЕМ БОЕВОЙ ЦИКЛ =====

// Добавляем функцию "пропустить ход" вместо побега
Sherwood.Quests.skipTurn = function() {
    if (!this._inBattle) return null;
    
    const p = Sherwood.getPlayer();
    const e = this._currentEnemy;
    if (!e) return null;
    
    // Восстанавливаем немного HP
    const healAmount = Math.floor(p.stats.maxHp * 0.08);
    p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + healAmount);
    
    // Враг атакует
    const enemyDamage = Math.max(1, Math.floor((e.atk - p.stats.defense) * 0.3 + e.atk * 0.05));
    p.stats.hp = Math.max(0, p.stats.hp - enemyDamage);
    
    const result = {
        type: 'skip',
        healed: healAmount,
        enemyDamage: enemyDamage,
        playerHp: p.stats.hp,
        playerDead: p.stats.hp <= 0
    };
    
    if (p.stats.hp <= 0) {
        this._inBattle = false;
        result.lose = true;
    }
    
    Sherwood.saveGame();
    return result;
};

// ===== ОБНОВЛЯЕМ UI БОЯ =====

// Добавляем функцию показа экрана битвы без побега
Sherwood.Quests.showBattleUI = function() {
    const battle = this.getBattle();
    if (!battle) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'questBattleOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:200;display:flex;flex-direction:column;align-items:center;justify-content:center;';
    
    const enemy = battle.enemy;
    const p = Sherwood.getPlayer();
    const isBoss = enemy.isBoss || false;
    
    let html = `
        <div style="background:linear-gradient(180deg,#1a0f08,#2d1a10);border:3px solid ${isBoss ? '#ff6b35' : '#8B4513'};border-radius:12px;padding:20px;max-width:500px;width:90%;color:#fff;font-family:monospace;">
            <div style="text-align:center;margin-bottom:10px;">
                <div style="font-size:20px;font-weight:bold;color:${isBoss ? '#ff6b35' : '#ffa500'};">
                    ${isBoss ? '👑 БОСС' : '⚔️ БИТВА'}
                </div>
                <div style="font-size:14px;">${battle.enemy.name}</div>
                <div style="font-size:12px;color:#888;">Глава ${battle.chapter.id}: ${battle.chapter.name}</div>
            </div>
            
            <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                <div>
                    <div style="font-size:12px;color:#888;">Враг</div>
                    <div style="font-size:18px;font-weight:bold;color:#ff6b6b;">❤️ ${enemy.hp}</div>
                    <div style="width:150px;height:8px;background:#333;border-radius:4px;overflow:hidden;">
                        <div style="width:${(enemy.hp/enemy.maxHp)*100}%;height:100%;background:linear-gradient(90deg,#ff0000,#ff4444);transition:width 0.3s;"></div>
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:12px;color:#888;">${p.name}</div>
                    <div style="font-size:18px;font-weight:bold;color:#4ecdc4;">❤️ ${p.stats.hp}</div>
                    <div style="width:150px;height:8px;background:#333;border-radius:4px;overflow:hidden;margin-left:auto;">
                        <div id="playerHpBarQuest" style="width:${(p.stats.hp/p.stats.maxHp)*100}%;height:100%;background:linear-gradient(90deg,#00ff00,#44ff44);transition:width 0.3s;"></div>
                    </div>
                </div>
            </div>
            
            <div id="questBattleLog" style="background:rgba(0,0,0,0.5);border:1px solid #333;border-radius:4px;padding:6px;height:60px;overflow-y:auto;font-size:12px;margin-bottom:8px;"></div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                <button onclick="Sherwood.Quests.playerAttack()" style="padding:12px;background:#6a2d2d;border:2px solid #ff6b6b;border-radius:6px;color:#fff;cursor:pointer;font-size:16px;font-weight:bold;">⚔️ АТАКА</button>
                <button onclick="Sherwood.Quests.useSkillInQuest()" style="padding:12px;background:#2d4a6a;border:2px solid #4a8ab7;border-radius:6px;color:#fff;cursor:pointer;font-size:14px;font-weight:bold;">🌀 СКИЛЛ</button>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px;">
                <button onclick="Sherwood.Quests.skipTurn()" style="padding:8px;background:#4a4a4a;border:1px solid #666;border-radius:4px;color:#aaa;cursor:pointer;font-size:12px;">💤 Пропустить ход (+8% HP)</button>
                <button onclick="Sherwood.Quests.usePotion()" style="padding:8px;background:#2d6a4f;border:1px solid #52b788;border-radius:4px;color:#fff;cursor:pointer;font-size:12px;">🧪 Зелье HP</button>
            </div>
        </div>
    `;
    
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
    this._battleOverlay = overlay;
};

// ===== АТАКА ИГРОКА =====

Sherwood.Quests.playerAttack = function() {
    const result = this.attack();
    if (!result) return;
    
    // Обновляем лог
    this.addBattleLog(`💢 ${result.damage}${result.crit ? ' 💥КРИТ!' : ''} урона!`);
    
    if (result.enemyDead) {
        if (result.chapterComplete) {
            this.addBattleLog('🏆 ГЛАВА ПРОЙДЕНА!');
            setTimeout(() => {
                this.closeBattleUI();
                if (typeof Menu !== 'undefined' && Menu.showQuestsScreen) {
                    Menu.showQuestsScreen();
                }
                if (result.rewards) {
                    alert(`🏆 Глава пройдена!\n+${result.rewards.exp} опыта\n+${result.rewards.gold} золота\n+${result.rewards.silver} серебра`);
                }
            }, 1500);
        } else {
            this.addBattleLog(`✅ ${result.enemyName || 'Враг'} повержен!`);
            setTimeout(() => {
                this.updateBattleUI();
            }, 500);
        }
        return;
    }
    
    if (result.playerDead) {
        this.addBattleLog('💀 ТЫ ПАЛ В БОЮ!');
        setTimeout(() => {
            this.closeBattleUI();
            if (typeof Menu !== 'undefined' && Menu.showQuestsScreen) {
                Menu.showQuestsScreen();
            }
            alert('💀 Ты погиб в битве! Потеряно 20% золота.');
            // Штраф за смерть
            const p = Sherwood.getPlayer();
            if (p && p.resources) {
                p.resources.gold = Math.floor((p.resources.gold || 0) * 0.8);
                Sherwood.saveGame();
            }
        }, 1500);
        return;
    }
    
    // Атака врага
    if (result.enemyDamage) {
        this.addBattleLog(`💢 Враг нанёс ${result.enemyDamage} урона!`);
    }
    
    this.updateBattleUI();
};

// ===== ИСПОЛЬЗОВАНИЕ СКИЛЛА В КВЕСТЕ =====

Sherwood.Quests.useSkillInQuest = function() {
    const p = Sherwood.getPlayer();
    if (!p) return;
    
    // Проверяем доступные скиллы
    const skills = [];
    if (p.skills && p.skills.heal) skills.push('heal');
    if (p.skills && p.skills.fireball) skills.push('fireball');
    if (p.skills && p.skills.shield) skills.push('shield');
    
    if (skills.length === 0) {
        this.addBattleLog('❌ Нет доступных скиллов!');
        return;
    }
    
    // Показываем выбор скиллов
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,0.95);border:2px solid #8B4513;border-radius:8px;padding:20px;z-index:201;min-width:200px;';
    
    let html = '<div style="color:#ffa500;text-align:center;margin-bottom:10px;">🌀 ВЫБЕРИ СКИЛЛ</div>';
    
    if (p.skills.heal) {
        html += `<button onclick="Sherwood.Quests.castHeal()" style="display:block;width:100%;padding:8px;margin:4px 0;background:#2d6a4f;border:1px solid #52b788;border-radius:4px;color:#fff;cursor:pointer;">💚 Исцеление (10 MP)</button>`;
    }
    if (p.skills.fireball) {
        html += `<button onclick="Sherwood.Quests.castFireball()" style="display:block;width:100%;padding:8px;margin:4px 0;background:#6a2d2d;border:1px solid #b75252;border-radius:4px;color:#fff;cursor:pointer;">🔥 Огненный шар (15 MP)</button>`;
    }
    if (p.skills.shield) {
        html += `<button onclick="Sherwood.Quests.castShield()" style="display:block;width:100%;padding:8px;margin:4px 0;background:#2d4a6a;border:1px solid #5288b7;border-radius:4px;color:#fff;cursor:pointer;">🛡️ Щит (8 MP)</button>`;
    }
    
    html += `<button onclick="this.parentElement.remove()" style="display:block;width:100%;padding:6px;margin-top:8px;background:#333;border:1px solid #555;border-radius:4px;color:#888;cursor:pointer;">✖ Отмена</button>`;
    
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
};

// ===== СКИЛЛЫ =====

Sherwood.Quests.castHeal = function() {
    const p = Sherwood.getPlayer();
    if (!p) return;
    
    if ((p.stats.mp || 0) < 10) {
        this.addBattleLog('❌ Недостаточно маны!');
        return;
    }
    
    p.stats.mp = (p.stats.mp || 0) - 10;
    const heal = Math.floor(p.stats.maxHp * 0.3);
    p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
    
    this.addBattleLog(`💚 Исцеление! +${heal} HP`);
    this.closeSkillMenu();
    this.enemyAttackAfterSkill();
    this.updateBattleUI();
    Sherwood.saveGame();
};

Sherwood.Quests.castFireball = function() {
    const p = Sherwood.getPlayer();
    const e = this._currentEnemy;
    if (!p || !e) return;
    
    if ((p.stats.mp || 0) < 15) {
        this.addBattleLog('❌ Недостаточно маны!');
        return;
    }
    
    p.stats.mp = (p.stats.mp || 0) - 15;
    let damage = Math.floor((p.stats.attack * 2 + 10) * (0.9 + Math.random() * 0.2));
    e.hp -= damage;
    if (e.hp < 0) e.hp = 0;
    
    this.addBattleLog(`🔥 Огненный шар! ${damage} урона!`);
    this.closeSkillMenu();
    
    if (e.hp <= 0) {
        // Обработка смерти врага
        this._handleEnemyDeath();
        return;
    }
    
    this.enemyAttackAfterSkill();
    this.updateBattleUI();
    Sherwood.saveGame();
};

Sherwood.Quests.castShield = function() {
    const p = Sherwood.getPlayer();
    if (!p) return;
    
    if ((p.stats.mp || 0) < 8) {
        this.addBattleLog('❌ Недостаточно маны!');
        return;
    }
    
    p.stats.mp = (p.stats.mp || 0) - 8;
    p._shieldActive = true;
    
    this.addBattleLog('🛡️ Щит активирован! Защита +50% на 1 ход');
    this.closeSkillMenu();
    this.enemyAttackAfterSkill();
    this.updateBattleUI();
    Sherwood.saveGame();
};

Sherwood.Quests.closeSkillMenu = function() {
    document.querySelectorAll('[style*="z-index:201"]').forEach(el => el.remove());
};

// ===== АТАКА ВРАГА ПОСЛЕ СКИЛЛА =====

Sherwood.Quests.enemyAttackAfterSkill = function() {
    const p = Sherwood.getPlayer();
    const e = this._currentEnemy;
    if (!p || !e || e.hp <= 0) return;
    
    let enemyDamage = Math.max(1, Math.floor((e.atk - p.stats.defense) * 0.3 + e.atk * 0.05));
    
    // Щит уменьшает урон
    if (p._shieldActive) {
        enemyDamage = Math.floor(enemyDamage * 0.5);
        p._shieldActive = false;
        this.addBattleLog('🛡️ Щит поглотил часть урона!');
    }
    
    p.stats.hp = Math.max(0, p.stats.hp - enemyDamage);
    this.addBattleLog(`💢 Враг нанёс ${enemyDamage} урона!`);
    
    if (p.stats.hp <= 0) {
        this.addBattleLog('💀 ТЫ ПАЛ В БОЮ!');
        setTimeout(() => {
            this.closeBattleUI();
            if (typeof Menu !== 'undefined' && Menu.showQuestsScreen) {
                Menu.showQuestsScreen();
            }
        }, 1500);
    }
    
    Sherwood.saveGame();
};

// ===== ЗЕЛЬЕ =====

Sherwood.Quests.usePotion = function() {
    const p = Sherwood.getPlayer();
    if (!p) return;
    
    const potions = p.inventory ? p.inventory.potions || 0 : 0;
    if (potions <= 0) {
        this.addBattleLog('❌ Нет зелий!');
        return;
    }
    
    p.inventory.potions = potions - 1;
    const heal = Math.floor(p.stats.maxHp * 0.25);
    p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
    
    this.addBattleLog(`🧪 Зелье! +${heal} HP`);
    this.enemyAttackAfterSkill();
    this.updateBattleUI();
    Sherwood.saveGame();
};

// ===== ОБНОВЛЕНИЕ UI =====

Sherwood.Quests.updateBattleUI = function() {
    const overlay = document.getElementById('questBattleOverlay');
    if (!overlay) return;
    
    const p = Sherwood.getPlayer();
    const e = this._currentEnemy;
    if (!p || !e) return;
    
    // Обновляем HP бары
    const hpBar = document.getElementById('playerHpBarQuest');
    if (hpBar) {
        hpBar.style.width = (p.stats.hp / p.stats.maxHp * 100) + '%';
    }
    
    // Обновляем текст
    const enemyHpElements = overlay.querySelectorAll('[style*="font-size:18px"][style*="color:#ff6b6b;"]');
    if (enemyHpElements.length > 0) {
        enemyHpElements[0].textContent = `❤️ ${e.hp}`;
    }
    
    // Обновляем лог
    const log = document.getElementById('questBattleLog');
    if (log && this._battleLog) {
        log.innerHTML = this._battleLog.slice(-5).join('<br>');
        log.scrollTop = log.scrollHeight;
    }
};

Sherwood.Quests.addBattleLog = function(msg) {
    if (!this._battleLog) this._battleLog = [];
    this._battleLog.push(msg);
    if (this._battleLog.length > 20) this._battleLog.shift();
    
    const log = document.getElementById('questBattleLog');
    if (log) {
        log.innerHTML = this._battleLog.slice(-5).join('<br>');
        log.scrollTop = log.scrollHeight;
    }
};

Sherwood.Quests.closeBattleUI = function() {
    if (this._battleOverlay) {
        this._battleOverlay.remove();
        this._battleOverlay = null;
    }
    document.querySelectorAll('[style*="z-index:201"]').forEach(el => el.remove());
};

// ===== ПЕРЕОПРЕДЕЛЯЕМ startChapter =====

const _origStartChapter = Sherwood.Quests.startChapter;
Sherwood.Quests.startChapter = function(id) {
    const result = _origStartChapter.call(this, id);
    
    if (result && result.success) {
        // Показываем UI битвы вместо старого
        setTimeout(() => {
            this.closeBattleUI();
            this._battleLog = [];
            this.showBattleUI();
        }, 300);
    }
    
    return result;
};

// ===== ИНИЦИАЛИЗАЦИЯ =====

console.log('🔥 Sherwood.Quests обновлён - БЕЗ ПОБЕГОВ!');
console.log('⚔️ Только вперёд, только победа или смерть!');

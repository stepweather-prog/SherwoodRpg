/**
 * Sherwood Combat System
 * Пошаговая боевая система + PvP через P2P WebRTC
 */

Sherwood.Combat = {
    // Активный бой
    _battle: null,
    
    // ===== ЗАПУСК БОЯ =====
    
    // PvE бой (против монстра)
    startPvE(monsterId) {
        const monster = Sherwood.Monsters[monsterId];
        if (!monster) return null;
        
        const player = Sherwood.getPlayer();
        
        this._battle = {
            type: 'pve',
            monsterId: monsterId,
            monster: {
                name: monster.name,
                stats: { ...monster.stats },
                currentHp: monster.stats.hp
            },
            player: {
                stats: { ...player.stats },
                currentHp: player.stats.hp
            },
            turn: 'player', // player или enemy
            log: [],
            status: 'active',
            skillsUsed: [],
            cooldowns: {}
        };
        
        Sherwood.dispatch({
            type: 'BATTLE_START',
            payload: {
                type: 'pve',
                monster: this._battle.monster,
                player: this._battle.player
            }
        });
        
        return this._battle;
    },
    
    // PvP бой (через P2P канал)
    startPvP(channelId) {
        if (!channelId || !window.P2PPong?._channels[channelId]) return null;
        
        const player = Sherwood.getPlayer();
        
        this._battle = {
            type: 'pvp',
            channelId: channelId,
            player: {
                name: player.name,
                stats: { ...player.stats },
                currentHp: player.stats.hp
            },
            opponent: {
                name: 'Противник',
                stats: null, // Придёт от оппонента
                currentHp: null
            },
            turn: 'player',
            log: [],
            status: 'waiting_opponent',
            skillsUsed: [],
            cooldowns: {}
        };
        
        // Отправляем запрос на PvP бой
        window.P2PPong.sendMessage(channelId, JSON.stringify({
            type: 'pvp_challenge',
            stats: player.stats,
            name: player.name
        }));
        
        Sherwood.dispatch({
            type: 'BATTLE_START',
            payload: { type: 'pvp', status: 'waiting_opponent' }
        });
        
        return this._battle;
    },
    
    // Принять PvP вызов
    acceptPvP(channelId, opponentStats, opponentName) {
        const player = Sherwood.getPlayer();
        
        this._battle = {
            type: 'pvp',
            channelId: channelId,
            player: {
                name: player.name,
                stats: { ...player.stats },
                currentHp: player.stats.hp
            },
            opponent: {
                name: opponentName,
                stats: opponentStats,
                currentHp: opponentStats.hp
            },
            turn: 'opponent', // Тот кто принял вызов — ходит вторым
            log: [],
            status: 'active',
            skillsUsed: [],
            cooldowns: {}
        };
        
        Sherwood.dispatch({
            type: 'BATTLE_START',
            payload: {
                type: 'pvp',
                status: 'active',
                opponent: this._battle.opponent
            }
        });
        
        return this._battle;
    },
    
    // ===== БОЕВЫЕ ДЕЙСТВИЯ =====
    
    // Атака игрока
    playerAttack() {
        if (!this._battle || this._battle.status !== 'active') return null;
        if (this._battle.turn !== 'player') return null;
        
        const result = this._calculateDamage(
            this._battle.player.stats,
            this._getTarget().stats,
            this._battle.player.stats.attack
        );
        
        this._applyDamage('enemy', result);
        this._battle.turn = 'enemy';
        
        const logEntry = {
            actor: 'player',
            action: 'attack',
            damage: result.damage,
            crit: result.crit,
            dodge: result.dodge,
            target: this._getTargetName()
        };
        this._battle.log.push(logEntry);
        
        Sherwood.dispatch({ type: 'BATTLE_ATTACK', payload: logEntry });
        
        // Проверяем победу
        if (this._checkVictory()) return;
        
        // Ход противника (с задержкой)
        if (this._battle.type === 'pve') {
            setTimeout(() => this._enemyTurn(), 800 + Math.random() * 700);
        } else {
            // В PvP отправляем ход оппоненту
            this._sendPvPAction('attack', result);
        }
        
        return result;
    },
    
    // Использование навыка
    playerUseSkill(skillId) {
        if (!this._battle || this._battle.status !== 'active') return null;
        if (this._battle.turn !== 'player') return null;
        
        const skills = this._getPlayerSkills();
        const skill = skills[skillId];
        if (!skill) return null;
        
        // Проверка кулдауна
        if (this._battle.cooldowns[skillId]) return null;
        
        const result = this._calculateSkillDamage(skill);
        this._applyDamage('enemy', result);
        this._battle.turn = 'enemy';
        this._battle.skillsUsed.push(skillId);
        this._battle.cooldowns[skillId] = skill.cooldown || 3;
        
        const logEntry = {
            actor: 'player',
            action: 'skill',
            skillId: skillId,
            skillName: skill.name,
            damage: result.damage,
            effect: result.effect,
            target: this._getTargetName()
        };
        this._battle.log.push(logEntry);
        
        Sherwood.dispatch({ type: 'BATTLE_SKILL', payload: logEntry });
        
        if (this._checkVictory()) return;
        
        setTimeout(() => this._enemyTurn(), 800 + Math.random() * 700);
        
        return result;
    },
    
    // Ход противника (PvE)
    _enemyTurn() {
        if (!this._battle || this._battle.status !== 'active') return;
        
        const enemy = this._getTarget();
        const result = this._calculateDamage(
            enemy.stats,
            this._battle.player.stats,
            enemy.stats.attack
        );
        
        this._applyDamage('player', result);
        this._battle.turn = 'player';
        
        // Уменьшаем кулдауны
        Object.keys(this._battle.cooldowns).forEach(key => {
            this._battle.cooldowns[key]--;
            if (this._battle.cooldowns[key] <= 0) {
                delete this._battle.cooldowns[key];
            }
        });
        
        const logEntry = {
            actor: 'enemy',
            action: 'attack',
            damage: result.damage,
            crit: result.crit,
            dodge: result.dodge,
            target: 'player'
        };
        this._battle.log.push(logEntry);
        
        Sherwood.dispatch({ type: 'BATTLE_ENEMY_ATTACK', payload: logEntry });
        
        if (this._checkDefeat()) return;
    },
    
    // ===== РАСЧЁТ УРОНА =====
    
    _calculateDamage(attackerStats, defenderStats, baseDamage) {
        // Шанс уклонения
        const dodgeChance = Math.min(defenderStats.dodgeChance || 0, 50);
        if (Math.random() * 100 < dodgeChance) {
            return { damage: 0, dodge: true, crit: false };
        }
        
        // Шанс крита
        const critChance = Math.min(attackerStats.critChance || 0, 60);
        const isCrit = Math.random() * 100 < critChance;
        
        // Расчёт урона
        let damage = baseDamage;
        
        // Крит x2
        if (isCrit) damage *= 2;
        
        // Защита снижает урон
        const defense = defenderStats.defense || 0;
        damage = Math.max(1, damage - Math.floor(defense / 3));
        
        // Случайный разброс ±20%
        const variance = 0.8 + Math.random() * 0.4;
        damage = Math.floor(damage * variance);
        
        return { damage, dodge: false, crit: isCrit };
    },
    
    _calculateSkillDamage(skill) {
        const attackerStats = this._battle.player.stats;
        const defenderStats = this._getTarget().stats;
        
        let damage = skill.baseDamage + Math.floor(attackerStats.attack * skill.attackRatio);
        
        // Крит для навыков
        const critChance = Math.min((attackerStats.critChance || 0) + (skill.bonusCrit || 0), 70);
        const isCrit = Math.random() * 100 < critChance;
        if (isCrit) damage = Math.floor(damage * 1.8);
        
        const defense = defenderStats.defense || 0;
        damage = Math.max(1, damage - Math.floor(defense / 4));
        
        const result = { damage: Math.floor(damage), crit: isCrit, effect: skill.effect || null };
        
        // Применяем эффекты
        if (skill.effect === 'bleed') {
            result.bleedDamage = Math.floor(damage * 0.3);
        } else if (skill.effect === 'stun') {
            result.stunTurns = 1;
        }
        
        return result;
    },
    
    _applyDamage(target, result) {
        if (target === 'enemy') {
            const monster = this._getTarget();
            monster.currentHp = Math.max(0, monster.currentHp - result.damage);
        } else {
            this._battle.player.currentHp = Math.max(0, 
                this._battle.player.currentHp - result.damage);
        }
    },
    
    // ===== ПРОВЕРКИ =====
    
    _checkVictory() {
        if (this._getTarget().currentHp <= 0) {
            this._battle.status = 'victory';
            const monster = Sherwood.Monsters[this._battle.monsterId];
            
            if (monster?.reward) {
                Sherwood.addExp(monster.reward.exp);
                Sherwood.addResource('gold', monster.reward.gold);
                Sherwood.addResource('silver', monster.reward.silver);
            }
            
            if (this._battle.monsterId) {
                Sherwood.updateBestiary(this._battle.monsterId);
            }
            
            Sherwood.dispatch({
                type: 'BATTLE_VICTORY',
                payload: { monster: this._getTarget(), reward: monster?.reward }
            });
            
            return true;
        }
        return false;
    },
    
    _checkDefeat() {
        if (this._battle.player.currentHp <= 0) {
            this._battle.status = 'defeat';
            
            Sherwood.dispatch({
                type: 'BATTLE_DEFEAT',
                payload: { player: this._battle.player }
            });
            
            return true;
        }
        return false;
    },
    
    // ===== PvP ДЕЙСТВИЯ =====
    
    _sendPvPAction(action, data) {
        if (this._battle?.type === 'pvp' && this._battle.channelId) {
            window.P2PPong.sendMessage(this._battle.channelId, JSON.stringify({
                type: 'pvp_action',
                action: action,
                data: data
            }));
        }
    },
    
    // Обработка PvP действия от оппонента
    handlePvPAction(action, data) {
        if (!this._battle || this._battle.type !== 'pvp') return;
        
        switch (action) {
            case 'attack':
                this._applyDamage('player', data);
                this._battle.turn = 'player';
                this._checkDefeat();
                Sherwood.dispatch({ type: 'BATTLE_ENEMY_ATTACK', payload: data });
                break;
                
            case 'skill':
                this._applyDamage('player', data);
                this._battle.turn = 'player';
                this._checkDefeat();
                Sherwood.dispatch({ type: 'BATTLE_ENEMY_ATTACK', payload: data });
                break;
        }
    },
    
    // ===== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ =====
    
    _getTarget() {
        if (this._battle.type === 'pve') {
            return this._battle.monster;
        }
        return this._battle.opponent;
    },
    
    _getTargetName() {
        if (this._battle.type === 'pve') {
            return this._battle.monster.name;
        }
        return this._battle.opponent.name;
    },
    
    // Навыки игрока (можно расширить)
    _getPlayerSkills() {
        return {
            power_shot: {
                id: 'power_shot',
                name: 'Мощный выстрел',
                baseDamage: 20,
                attackRatio: 1.5,
                cooldown: 3,
                bonusCrit: 10,
                description: 'Усиленный выстрел с повышенным шансом крита'
            },
            triple_shot: {
                id: 'triple_shot',
                name: 'Тройной выстрел',
                baseDamage: 10,
                attackRatio: 0.8,
                cooldown: 4,
                hits: 3,
                description: 'Три быстрых выстрела подряд'
            },
            poison_arrow: {
                id: 'poison_arrow',
                name: 'Отравленная стрела',
                baseDamage: 15,
                attackRatio: 1.0,
                cooldown: 5,
                effect: 'bleed',
                description: 'Стрела с ядом, наносит урон со временем'
            },
            stunning_shot: {
                id: 'stunning_shot',
                name: 'Оглушающий выстрел',
                baseDamage: 5,
                attackRatio: 0.5,
                cooldown: 6,
                effect: 'stun',
                description: 'Выстрел, оглушающий противника на ход'
            }
        };
    },
    
    // Получить текущий бой
    getBattle() {
        return this._battle;
    },
    
    // Сбежать из боя
    flee() {
        if (this._battle?.type === 'pve' && this._battle.status === 'active') {
            // 70% шанс побега
            if (Math.random() < 0.7) {
                this._battle.status = 'fled';
                Sherwood.dispatch({ type: 'BATTLE_END', payload: { result: 'fled' } });
                return true;
            }
        }
        return false;
    },
    
    // Завершить бой
    endBattle() {
        this._battle = null;
        Sherwood.dispatch({ type: 'BATTLE_END', payload: { result: 'ended' } });
    }
};

/**
 * Sherwood Dungeon System
 * Чащоба — исследование глубин леса
 */

Sherwood.Dungeon = {
    _dungeon: null,
    _gridSize: 5,
    _tileTypes: ['empty', 'monster', 'chest', 'trap', 'heal', 'exit'],
    
    // ===== ИНИЦИАЛИЗАЦИЯ =====
    init() {
        Sherwood.on('DUNGEON_ENTER', () => this._onDungeonEnter());
    },
    
    // ===== ГЕНЕРАЦИЯ ПОДЗЕМЕЛЬЯ =====
    
    generateDungeon(difficulty = 'normal') {
        const player = Sherwood.getPlayer();
        
        // Проверка билетов
        if (player.dungeon.tickets <= 0) {
            Sherwood.dispatch({
                type: 'DUNGEON_ERROR',
                payload: { message: 'Нет билетов в Чащобу!' }
            });
            return null;
        }
        
        player.dungeon.tickets--;
        
        const size = this._gridSize;
        const grid = [];
        
        // Создаём пустую сетку
        for (let y = 0; y < size; y++) {
            grid[y] = [];
            for (let x = 0; x < size; x++) {
                grid[y][x] = { type: 'fog', explored: false };
            }
        }
        
        // Размещаем игрока в центре
        const startX = Math.floor(size / 2);
        const startY = Math.floor(size / 2);
        grid[startY][startX] = { type: 'start', explored: true };
        
        // Размещаем контент
        const totalCells = size * size;
        const monsterCount = difficulty === 'hard' ? 8 : difficulty === 'easy' ? 3 : 5;
        const chestCount = difficulty === 'hard' ? 2 : difficulty === 'easy' ? 3 : 2;
        const healCount = 2;
        const trapCount = difficulty === 'hard' ? 4 : 2;
        
        this._placeTiles(grid, 'monster', monsterCount);
        this._placeTiles(grid, 'chest', chestCount);
        this._placeTiles(grid, 'heal', healCount);
        this._placeTiles(grid, 'trap', trapCount);
        
        // Размещаем выход в дальнем углу
        const corners = [
            { x: 0, y: 0 },
            { x: size - 1, y: 0 },
            { x: 0, y: size - 1 },
            { x: size - 1, y: size - 1 }
        ];
        const exit = corners[Math.floor(Math.random() * corners.length)];
        grid[exit.y][exit.x] = { type: 'exit', explored: false };
        
        // Определяем монстров для этого уровня
        const availableMonsters = this._getMonstersForDifficulty(difficulty);
        
        this._dungeon = {
            grid: grid,
            size: size,
            playerPos: { x: startX, y: startY },
            difficulty: difficulty,
            monsters: availableMonsters,
            tilesExplored: 1,
            totalTiles: totalCells,
            monstersKilled: 0,
            chestsOpened: 0,
            hpLost: 0,
            status: 'active'
        };
        
        Sherwood.dispatch({
            type: 'DUNGEON_STARTED',
            payload: this._dungeon
        });
        
        return this._dungeon;
    },
    
    _placeTiles(grid, type, count) {
        const size = grid.length;
        let placed = 0;
        
        while (placed < count) {
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            
            if (grid[y][x].type === 'fog') {
                grid[y][x] = { type, explored: false, ...this._getTileData(type) };
                placed++;
            }
        }
    },
    
    _getTileData(type) {
        switch (type) {
            case 'monster':
                return {
                    monsterId: null, // Будет определено при открытии
                    monsterStats: null
                };
            case 'chest':
                return {
                    looted: false,
                    reward: {
                        gold: 10 + Math.floor(Math.random() * 40),
                        silver: 50 + Math.floor(Math.random() * 150)
                    }
                };
            case 'trap':
                return {
                    damage: 10 + Math.floor(Math.random() * 20),
                    triggered: false
                };
            case 'heal':
                return {
                    healAmount: 20 + Math.floor(Math.random() * 30),
                    used: false
                };
            default:
                return {};
        }
    },
    
    _getMonstersForDifficulty(difficulty) {
        const allMonsters = Object.values(Sherwood.Monsters).filter(m => !m.isBoss);
        
        switch (difficulty) {
            case 'easy':
                return allMonsters.filter(m => m.stats.hp <= 40);
            case 'hard':
                return allMonsters.filter(m => m.stats.hp >= 70);
            default:
                return allMonsters;
        }
    },
    
    // ===== ДЕЙСТВИЯ В ПОДЗЕМЕЛЬЕ =====
    
    // Перемещение игрока
    movePlayer(direction) {
        if (!this._dungeon || this._dungeon.status !== 'active') return null;
        
        const pos = { ...this._dungeon.playerPos };
        
        switch (direction) {
            case 'up': pos.y--; break;
            case 'down': pos.y++; break;
            case 'left': pos.x--; break;
            case 'right': pos.x++; break;
            default: return null;
        }
        
        // Проверка границ
        if (pos.x < 0 || pos.x >= this._dungeon.size || 
            pos.y < 0 || pos.y >= this._dungeon.size) {
            return { success: false, reason: 'edge' };
        }
        
        this._dungeon.playerPos = pos;
        const tile = this._dungeon.grid[pos.y][pos.x];
        
        // Открываем туман войны вокруг игрока
        this._revealFog(pos);
        
        // Обрабатываем тайл
        const result = this._processTile(tile, pos);
        
        Sherwood.dispatch({
            type: 'DUNGEON_MOVED',
            payload: { position: pos, tile, result }
        });
        
        return result;
    },
    
    _revealFog(pos) {
        const size = this._dungeon.size;
        const radius = 1; // Радиус обзора
        
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = pos.x + dx;
                const ny = pos.y + dy;
                
                if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                    if (!this._dungeon.grid[ny][nx].explored) {
                        this._dungeon.grid[ny][nx].explored = true;
                        this._dungeon.tilesExplored++;
                    }
                }
            }
        }
    },
    
    _processTile(tile, pos) {
        switch (tile.type) {
            case 'empty':
            case 'start':
                return { type: 'empty' };
                
            case 'monster':
                if (!tile.monsterId) {
                    // Выбираем случайного монстра
                    const monsters = this._dungeon.monsters;
                    const monster = monsters[Math.floor(Math.random() * monsters.length)];
                    tile.monsterId = monster.id;
                    tile.monsterStats = { ...monster.stats };
                }
                return { type: 'monster', monsterId: tile.monsterId, tile: tile };
                
            case 'chest':
                if (!tile.looted) {
                    tile.looted = true;
                    this._dungeon.chestsOpened++;
                    
                    // Выдаём награду
                    Sherwood.addResource('gold', tile.reward.gold);
                    Sherwood.addResource('silver', tile.reward.silver);
                    
                    // Шанс на предмет
                    if (Math.random() < 0.2) {
                        const items = Sherwood.EquipmentDB.findByGrade('common');
                        const item = items[Math.floor(Math.random() * items.length)];
                        Sherwood.getPlayer().inventory.push({...item});
                        return { type: 'chest', reward: tile.reward, item: item };
                    }
                    
                    return { type: 'chest', reward: tile.reward };
                }
                return { type: 'chest', looted: true };
                
            case 'trap':
                if (!tile.triggered) {
                    tile.triggered = true;
                    const player = Sherwood.getPlayer();
                    const damage = tile.damage;
                    player.stats.hp = Math.max(0, player.stats.hp - damage);
                    this._dungeon.hpLost += damage;
                    
                    if (player.stats.hp <= 0) {
                        this._dungeon.status = 'failed';
                    }
                    
                    return { type: 'trap', damage };
                }
                return { type: 'trap', triggered: true };
                
            case 'heal':
                if (!tile.used) {
                    tile.used = true;
                    const player = Sherwood.getPlayer();
                    player.stats.hp = Math.min(
                        player.stats.maxHp,
                        player.stats.hp + tile.healAmount
                    );
                    return { type: 'heal', healAmount: tile.healAmount };
                }
                return { type: 'heal', used: true };
                
            case 'exit':
                this._dungeon.status = 'completed';
                this._calculateDungeonReward();
                return { type: 'exit' };
                
            default:
                return { type: 'fog' };
        }
    },
    
    // Бой с монстром в подземелье
    fightMonster(tile) {
        if (!tile.monsterId) return null;
        
        const battle = Sherwood.Combat.startPvE(tile.monsterId);
        if (battle) {
            // Помечаем, что это бой в подземелье
            battle.dungeonTile = tile;
            
            // Подписываемся на результат
            const onBattleEnd = (data) => {
                Sherwood.off('BATTLE_VICTORY', victoryHandler);
                Sherwood.off('BATTLE_DEFEAT', defeatHandler);
                
                if (data.result === 'victory' || data.type === 'BATTLE_VICTORY') {
                    this._dungeon.monstersKilled++;
                    tile.type = 'empty';
                    tile.monsterId = null;
                }
            };
            
            const victoryHandler = () => onBattleEnd({ result: 'victory' });
            const defeatHandler = () => onBattleEnd({ result: 'defeat' });
            
            Sherwood.on('BATTLE_VICTORY', victoryHandler);
            Sherwood.on('BATTLE_DEFEAT', defeatHandler);
        }
        
        return battle;
    },
    
    _calculateDungeonReward() {
        const player = Sherwood.getPlayer();
        const d = this._dungeon;
        
        const exploredBonus = Math.floor(d.tilesExplored / d.totalTiles * 100);
        const killBonus = d.monstersKilled * 20;
        const chestBonus = d.chestsOpened * 30;
        
        const totalReward = {
            gold: exploredBonus + killBonus,
            silver: exploredBonus * 3 + chestBonus * 2,
            exp: exploredBonus + killBonus * 2
        };
        
        Sherwood.addResource('gold', totalReward.gold);
        Sherwood.addResource('silver', totalReward.silver);
        Sherwood.addExp(totalReward.exp);
        
        Sherwood.dispatch({
            type: 'DUNGEON_COMPLETED',
            payload: { dungeon: d, reward: totalReward }
        });
    },
    
    // ===== ПОЛУЧЕНИЕ ДАННЫХ =====
    getDungeon() {
        return this._dungeon;
    },
    
    getTileAt(x, y) {
        if (!this._dungeon) return null;
        if (x < 0 || x >= this._dungeon.size || y < 0 || y >= this._dungeon.size) return null;
        return this._dungeon.grid[y][x];
    },
    
    // Выйти из подземелья
    leaveDungeon() {
        if (this._dungeon?.status === 'active') {
            this._dungeon.status = 'abandoned';
            Sherwood.dispatch({
                type: 'DUNGEON_LEFT',
                payload: this._dungeon
            });
        }
        this._dungeon = null;
    }
};

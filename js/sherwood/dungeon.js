/**
 * Sherwood Dungeon System
 * Чащоба — подземелье с плитками
 */

Sherwood.Dungeon = {
    _dungeon: null,
    _gridSize: 6,
    
    // Плитки для закрытых клеток (14 штук)
    _closedTiles: Array.from({length: 14}, (_, i) => `assets/icons/Dungeon tiles${i + 1}.jpeg`),
    
    // Плитки для открытых путей (5 штук)
    _pathTiles: Array.from({length: 5}, (_, i) => `assets/icons/Sherwood dungeon path${i + 1}.jpeg`),
    
    init() {
        // Предзагрузка плиток
        this._closedTiles.forEach(src => {
            const img = new Image();
            img.src = src;
        });
        this._pathTiles.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    },
    
    generateDungeon(difficulty = 'normal') {
        const player = Sherwood.getPlayer();
        
        if (player.dungeon.tickets <= 0) {
            Sherwood.dispatch({ type: 'DUNGEON_ERROR', payload: { message: 'Нет билетов!' } });
            return null;
        }
        
        player.dungeon.tickets--;
        
        const size = this._gridSize;
        const grid = [];
        const totalTiles = size * size;
        
        // Создаём сетку из закрытых плиток
        for (let y = 0; y < size; y++) {
            grid[y] = [];
            for (let x = 0; x < size; x++) {
                grid[y][x] = {
                    type: 'hidden',
                    explored: false,
                    closedTile: this._closedTiles[Math.floor(Math.random() * this._closedTiles.length)],
                    pathTile: this._pathTiles[Math.floor(Math.random() * this._pathTiles.length)]
                };
            }
        }
        
        // Стартовая позиция (центр)
        const startX = Math.floor(size / 2);
        const startY = Math.floor(size / 2);
        grid[startY][startX] = {
            type: 'start',
            explored: true,
            pathTile: this._pathTiles[Math.floor(Math.random() * this._pathTiles.length)]
        };
        
        // Определяем монстров по сложности
        const monsterCount = difficulty === 'hard' ? 10 : difficulty === 'easy' ? 5 : 7;
        const chestCount = difficulty === 'hard' ? 2 : 3;
        const healCount = 2;
        const trapCount = difficulty === 'hard' ? 5 : 3;
        
        // Размещаем контент
        this._placeContent(grid, 'monster', monsterCount);
        this._placeContent(grid, 'chest', chestCount);
        this._placeContent(grid, 'heal', healCount);
        this._placeContent(grid, 'trap', trapCount);
        
        // Выход в углу
        const corners = [{x:0,y:0},{x:size-1,y:0},{x:0,y:size-1},{x:size-1,y:size-1}];
        const exit = corners[Math.floor(Math.random() * corners.length)];
        if (grid[exit.y][exit.x].type === 'hidden') {
            grid[exit.y][exit.x] = {
                type: 'exit',
                explored: false,
                closedTile: this._closedTiles[Math.floor(Math.random() * this._closedTiles.length)],
                pathTile: this._pathTiles[Math.floor(Math.random() * this._pathTiles.length)]
            };
        }
        
        this._dungeon = {
            grid: grid,
            size: size,
            playerPos: { x: startX, y: startY },
            difficulty: difficulty,
            tilesExplored: 1,
            totalTiles: totalTiles,
            monstersKilled: 0,
            chestsOpened: 0,
            trapsTriggered: 0,
            hpHealed: 0,
            status: 'active',
            steps: 0
        };
        
        return this._dungeon;
    },
    
    _placeContent(grid, type, count) {
        const size = grid.length;
        let placed = 0;
        const maxAttempts = 100;
        let attempts = 0;
        
        while (placed < count && attempts < maxAttempts) {
            attempts++;
            const x = Math.floor(Math.random() * size);
            const y = Math.floor(Math.random() * size);
            
            if (grid[y][x].type === 'hidden') {
                const pathTile = this._pathTiles[Math.floor(Math.random() * this._pathTiles.length)];
                const closedTile = this._closedTiles[Math.floor(Math.random() * this._closedTiles.length)];
                
                switch (type) {
                    case 'monster':
                        grid[y][x] = {
                            type: 'monster',
                            explored: false,
                            monsterId: null,
                            monsterStats: null,
                            closedTile: closedTile,
                            pathTile: pathTile
                        };
                        break;
                    case 'chest':
                        grid[y][x] = {
                            type: 'chest',
                            explored: false,
                            looted: false,
                            reward: {
                                gold: 15 + Math.floor(Math.random() * 50),
                                silver: 60 + Math.floor(Math.random() * 200)
                            },
                            closedTile: closedTile,
                            pathTile: pathTile
                        };
                        break;
                    case 'heal':
                        grid[y][x] = {
                            type: 'heal',
                            explored: false,
                            used: false,
                            healAmount: 25 + Math.floor(Math.random() * 40),
                            closedTile: closedTile,
                            pathTile: pathTile
                        };
                        break;
                    case 'trap':
                        grid[y][x] = {
                            type: 'trap',
                            explored: false,
                            triggered: false,
                            damage: 8 + Math.floor(Math.random() * 20),
                            closedTile: closedTile,
                            pathTile: pathTile
                        };
                        break;
                }
                placed++;
            }
        }
    },
    
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
        
        if (pos.x < 0 || pos.x >= this._dungeon.size || 
            pos.y < 0 || pos.y >= this._dungeon.size) {
            return { success: false, reason: 'edge' };
        }
        
        this._dungeon.playerPos = pos;
        this._dungeon.steps++;
        const tile = this._dungeon.grid[pos.y][pos.x];
        
        // Открываем соседние клетки
        this._revealAdjacent(pos);
        
        // Обрабатываем клетку
        return this._processTile(tile, pos);
    },
    
    _revealAdjacent(pos) {
        const size = this._dungeon.size;
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = pos.x + dx;
                const ny = pos.y + dy;
                
                if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                    if (!this._dungeon.grid[ny][nx].explored) {
                        this._dungeon.grid[ny][nx].explored = true;
                        this._dungeon.tilesExplored++;
                        
                        // Если это hidden — превращаем в empty
                        if (this._dungeon.grid[ny][nx].type === 'hidden') {
                            this._dungeon.grid[ny][nx].type = 'empty';
                        }
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
                    const monsters = this._getMonstersForDifficulty();
                    const monster = monsters[Math.floor(Math.random() * monsters.length)];
                    tile.monsterId = monster.id;
                    tile.monsterStats = { ...monster.stats };
                }
                return { type: 'monster', monsterId: tile.monsterId, tile: tile };
                
            case 'chest':
                if (!tile.looted) {
                    tile.looted = true;
                    this._dungeon.chestsOpened++;
                    Sherwood.addResource('gold', tile.reward.gold);
                    Sherwood.addResource('silver', tile.reward.silver);
                    
                    if (Math.random() < 0.25) {
                        const items = Sherwood.EquipmentDB.findByGrade('common');
                        if (items.length > 0) {
                            const item = items[Math.floor(Math.random() * items.length)];
                            Sherwood.getPlayer().inventory.push({...item});
                            return { type: 'chest', reward: tile.reward, item: item };
                        }
                    }
                    return { type: 'chest', reward: tile.reward };
                }
                return { type: 'chest', looted: true };
                
            case 'trap':
                if (!tile.triggered) {
                    tile.triggered = true;
                    this._dungeon.trapsTriggered++;
                    const player = Sherwood.getPlayer();
                    player.stats.hp = Math.max(0, player.stats.hp - tile.damage);
                    
                    if (player.stats.hp <= 0) {
                        this._dungeon.status = 'failed';
                    }
                    return { type: 'trap', damage: tile.damage };
                }
                return { type: 'trap', triggered: true };
                
            case 'heal':
                if (!tile.used) {
                    tile.used = true;
                    this._dungeon.hpHealed += tile.healAmount;
                    const player = Sherwood.getPlayer();
                    player.stats.hp = Math.min(player.stats.maxHp, player.stats.hp + tile.healAmount);
                    return { type: 'heal', healAmount: tile.healAmount };
                }
                return { type: 'heal', used: true };
                
            case 'exit':
                this._dungeon.status = 'completed';
                this._calculateReward();
                return { type: 'exit' };
                
            default:
                return { type: 'hidden' };
        }
    },
    
    _getMonstersForDifficulty() {
        const all = Object.values(Sherwood.Monsters).filter(m => !m.isBoss);
        const diff = this._dungeon.difficulty;
        
        if (diff === 'easy') return all.filter(m => m.stats.hp <= 45);
        if (diff === 'hard') return all.filter(m => m.stats.hp >= 60);
        return all;
    },
    
    fightMonster(tile) {
        if (!tile.monsterId) return null;
        const battle = Sherwood.Combat.startPvE(tile.monsterId);
        if (battle) {
            battle.dungeonTile = tile;
            
            const onEnd = (result) => {
                Sherwood.off('BATTLE_VICTORY', victoryHandler);
                Sherwood.off('BATTLE_DEFEAT', defeatHandler);
                
                if (result === 'victory') {
                    this._dungeon.monstersKilled++;
                    tile.type = 'empty';
                    tile.monsterId = null;
                }
            };
            
            const victoryHandler = () => onEnd('victory');
            const defeatHandler = () => onEnd('defeat');
            
            Sherwood.on('BATTLE_VICTORY', victoryHandler);
            Sherwood.on('BATTLE_DEFEAT', defeatHandler);
        }
        return battle;
    },
    
    _calculateReward() {
        const d = this._dungeon;
        const exploredBonus = Math.floor(d.tilesExplored / d.totalTiles * 150);
        const killBonus = d.monstersKilled * 30;
        const chestBonus = d.chestsOpened * 50;
        
        const reward = {
            gold: exploredBonus + killBonus,
            silver: exploredBonus * 3 + chestBonus * 2,
            exp: exploredBonus + killBonus * 2
        };
        
        Sherwood.addResource('gold', reward.gold);
        Sherwood.addResource('silver', reward.silver);
        Sherwood.addExp(reward.exp);
        
        // Бонус за исследование всей карты
        if (d.tilesExplored >= d.totalTiles * 0.8) {
            Sherwood.addResource('trophies', 3);
            reward.trophies = 3;
        }
        
        Sherwood.dispatch({ type: 'DUNGEON_COMPLETED', payload: { dungeon: d, reward } });
        
        return reward;
    },
    
    getDungeon() { return this._dungeon; },
    
    leaveDungeon() {
        if (this._dungeon?.status === 'active') {
            this._dungeon.status = 'abandoned';
        }
        this._dungeon = null;
    }
};

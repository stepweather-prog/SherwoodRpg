/**
 * Sherwood Dungeon System
 * Чащоба — лабиринт с туннелем и туманом войны
 */

Sherwood.Dungeon = {
    _dungeon: null,
    _gridSize: 6,
    _closedTiles: Array.from({length: 14}, (_, i) => `assets/icons/Dungeon tiles${i + 1}.jpeg`),
    _pathTile: 'assets/lor/level_seamless_horizontal_loop_1.jpg',
    
    init() {
        this._closedTiles.forEach(src => { const img = new Image(); img.src = src; });
        const img = new Image(); img.src = this._pathTile;
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
        
        for (let y = 0; y < size; y++) {
            grid[y] = [];
            for (let x = 0; x < size; x++) {
                grid[y][x] = {
                    type: 'wall',
                    explored: false,
                    closedTile: this._closedTiles[Math.floor(Math.random() * this._closedTiles.length)],
                    pathTile: this._pathTile
                };
            }
        }
        
        const tunnel = this._generateTunnel(size);
        const pathSet = new Set(tunnel.map(p => `${p.x},${p.y}`));
        
        const start = tunnel[0];
        grid[start.y][start.x] = {
            type: 'start',
            explored: true,
            pathTile: this._pathTile
        };
        
        const exit = tunnel[tunnel.length - 1];
        grid[exit.y][exit.x] = {
            type: 'exit',
            explored: false,
            closedTile: this._closedTiles[Math.floor(Math.random() * this._closedTiles.length)],
            pathTile: this._pathTile
        };
        
        for (let i = 1; i < tunnel.length - 1; i++) {
            const p = tunnel[i];
            grid[p.y][p.x].type = 'empty';
            grid[p.y][p.x].pathTile = this._pathTile;
        }
        
        const monsterCount = difficulty === 'hard' ? 5 : difficulty === 'easy' ? 3 : 4;
        const chestCount = 2;
        const healCount = 2;
        const trapCount = difficulty === 'hard' ? 4 : 2;
        
        this._placeOnTunnel(grid, tunnel, 'monster', monsterCount, difficulty);
        this._placeOnTunnel(grid, tunnel, 'chest', chestCount);
        this._placeOnTunnel(grid, tunnel, 'heal', healCount);
        this._placeOnTunnel(grid, tunnel, 'trap', trapCount);
        
        this._dungeon = {
            grid, size, tunnel, pathSet,
            playerPos: { x: start.x, y: start.y },
            difficulty,
            tilesExplored: 1,
            tunnelLength: tunnel.length,
            monstersKilled: 0,
            chestsOpened: 0,
            trapsTriggered: 0,
            hpHealed: 0,
            status: 'active'
        };
        
        this._revealCell(start.x, start.y);
        
        return this._dungeon;
    },
    
    _generateTunnel(size) {
        const maze = [];
        for (let y = 0; y < size; y++) {
            maze[y] = [];
            for (let x = 0; x < size; x++) {
                maze[y][x] = { x, y, visited: false, walls: { top: true, right: true, bottom: true, left: true } };
            }
        }
        
        const startX = Math.floor(size / 2);
        const startY = Math.floor(size / 2);
        
        const stack = [];
        let current = maze[startY][startX];
        current.visited = true;
        stack.push(current);
        
        const directions = [
            { dx: 0, dy: -1, wall: 'top', opposite: 'bottom' },
            { dx: 1, dy: 0, wall: 'right', opposite: 'left' },
            { dx: 0, dy: 1, wall: 'bottom', opposite: 'top' },
            { dx: -1, dy: 0, wall: 'left', opposite: 'right' }
        ];
        
        while (stack.length > 0) {
            const shuffled = [...directions].sort(() => Math.random() - 0.5);
            let moved = false;
            
            for (const dir of shuffled) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                
                if (nx >= 0 && nx < size && ny >= 0 && ny < size && !maze[ny][nx].visited) {
                    current.walls[dir.wall] = false;
                    maze[ny][nx].walls[dir.opposite] = false;
                    maze[ny][nx].visited = true;
                    stack.push(maze[ny][nx]);
                    current = maze[ny][nx];
                    moved = true;
                    break;
                }
            }
            
            if (!moved) {
                current = stack.pop();
            }
        }
        
        const tunnel = [];
        const visited = new Set();
        
        function collectPath(x, y) {
            const key = `${x},${y}`;
            if (visited.has(key)) return;
            if (x < 0 || x >= size || y < 0 || y >= size) return;
            visited.add(key);
            tunnel.push({x, y});
            
            const cell = maze[y][x];
            if (!cell.walls.top) collectPath(x, y - 1);
            if (!cell.walls.right) collectPath(x + 1, y);
            if (!cell.walls.bottom) collectPath(x, y + 1);
            if (!cell.walls.left) collectPath(x - 1, y);
        }
        
        collectPath(startX, startY);
        
        let maxDist = 0;
        let exitPos = tunnel[0];
        tunnel.forEach(pos => {
            const dist = Math.abs(pos.x - startX) + Math.abs(pos.y - startY);
            if (dist > maxDist) {
                maxDist = dist;
                exitPos = pos;
            }
        });
        
        const exitIndex = tunnel.findIndex(p => p.x === exitPos.x && p.y === exitPos.y);
        if (exitIndex >= 0) {
            tunnel.splice(exitIndex, 1);
            tunnel.push(exitPos);
        }
        
        return tunnel;
    },
    
    _placeOnTunnel(grid, tunnel, type, count, difficulty) {
        let placed = 0;
        const available = tunnel.slice(1, -1).filter(p => grid[p.y][p.x].type === 'empty');
        
        while (placed < count && available.length > 0) {
            const idx = Math.floor(Math.random() * available.length);
            const p = available.splice(idx, 1)[0];
            
            grid[p.y][p.x].type = type;
            grid[p.y][p.x].pathTile = this._pathTile;
            
            if (type === 'monster') {
                const tier = difficulty === 'hard' ? 2 : 1;
                const monster = this._getRandomMonster(tier);
                grid[p.y][p.x].monsterId = monster.id;
                grid[p.y][p.x].monsterIcon = monster.icon;
                grid[p.y][p.x].monsterName = monster.name;
            } else if (type === 'chest') {
                grid[p.y][p.x].looted = false;
                grid[p.y][p.x].reward = {
                    gold: 15 + Math.floor(Math.random() * 50),
                    silver: 60 + Math.floor(Math.random() * 200)
                };
            } else if (type === 'heal') {
                grid[p.y][p.x].used = false;
                grid[p.y][p.x].healAmount = 25 + Math.floor(Math.random() * 40);
            } else if (type === 'trap') {
                grid[p.y][p.x].triggered = false;
                grid[p.y][p.x].damage = 8 + Math.floor(Math.random() * 20);
            }
            
            placed++;
        }
    },
    
    _getRandomMonster(tier) {
        const dungeonMonsters = Object.values(Sherwood.Monsters).filter(m => 
            m.tier === tier && !m.isBoss && 
            ['swamp', 'deep_forest', 'cave'].includes(m.location)
        );
        
        if (dungeonMonsters.length === 0) {
            return { id: 'swamp_ghoul_1', name: 'Монстр', icon: 'assets/monsters/Swamp Ghoul1.png' };
        }
        
        return dungeonMonsters[Math.floor(Math.random() * dungeonMonsters.length)];
    },
    
    moveToTile(x, y) {
        if (!this._dungeon || this._dungeon.status !== 'active') return null;
        
        const dx = Math.abs(x - this._dungeon.playerPos.x);
        const dy = Math.abs(y - this._dungeon.playerPos.y);
        
        if (dx > 1 || dy > 1 || (dx === 0 && dy === 0)) {
            return { success: false, reason: 'too_far' };
        }
        if (dx === 1 && dy === 1) {
            return { success: false, reason: 'too_far' };
        }
        
        const key = `${x},${y}`;
        if (!this._dungeon.pathSet.has(key)) return { success: false, reason: 'wall' };
        
        this._dungeon.playerPos = { x, y };
        const tile = this._dungeon.grid[y][x];
        this._revealCell(x, y);
        
        return this._processTile(tile, x, y);
    },
    
    _revealCell(x, y) {
        const size = this._dungeon.size;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                    const key = `${nx},${ny}`;
                    if (this._dungeon.pathSet.has(key) && !this._dungeon.grid[ny][nx].explored) {
                        this._dungeon.grid[ny][nx].explored = true;
                        this._dungeon.tilesExplored++;
                    }
                }
            }
        }
    },
    
    _processTile(tile, x, y) {
        tile.explored = true;
        
        switch (tile.type) {
            case 'empty':
            case 'start':
                return { type: 'empty' };
                
            case 'monster':
                if (!tile.monsterId) {
                    const monster = this._getRandomMonster(this._dungeon.difficulty === 'hard' ? 2 : 1);
                    tile.monsterId = monster.id;
                    tile.monsterIcon = monster.icon;
                    tile.monsterName = monster.name;
                }
                return { type: 'monster', monsterId: tile.monsterId, monsterIcon: tile.monsterIcon, monsterName: tile.monsterName, tile };
                
            case 'chest':
                if (!tile.looted) {
                    tile.looted = true;
                    this._dungeon.chestsOpened++;
                    Sherwood.addResource('gold', tile.reward.gold);
                    Sherwood.addResource('silver', tile.reward.silver);
                    let item = null;
                    if (Math.random() < 0.25) {
                        const items = Sherwood.EquipmentDB.items.filter(i => i.grade === 'common');
                        if (items.length > 0) {
                            item = items[Math.floor(Math.random() * items.length)];
                            Sherwood.getPlayer().inventory.push({...item});
                        }
                    }
                    return { type: 'chest', reward: tile.reward, item };
                }
                return { type: 'chest', looted: true };
                
            case 'trap':
                if (!tile.triggered) {
                    tile.triggered = true;
                    this._dungeon.trapsTriggered++;
                    const player = Sherwood.getPlayer();
                    player.stats.hp = Math.max(0, player.stats.hp - tile.damage);
                    if (player.stats.hp <= 0) this._dungeon.status = 'failed';
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
                return { type: 'wall' };
        }
    },
    
    fightMonster(tile) {
        if (!tile.monsterId) return null;
        const battle = Sherwood.Combat.startPvE(tile.monsterId);
        if (battle) {
            battle.dungeonTile = tile;
            Sherwood.once('BATTLE_VICTORY', () => {
                this._dungeon.monstersKilled++;
                tile.type = 'empty';
                tile.monsterId = null;
                tile.monsterIcon = null;
                tile.monsterName = null;
            });
            Sherwood.once('BATTLE_DEFEAT', () => {});
        }
        return battle;
    },
    
    _calculateReward() {
        const d = this._dungeon;
        const exploredBonus = Math.floor(d.tilesExplored / d.tunnelLength * 150);
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
        if (d.tilesExplored >= d.tunnelLength * 0.8) {
            Sherwood.addResource('trophies', 3);
            reward.trophies = 3;
        }
        return reward;
    },
    
    getDungeon() { return this._dungeon; },
    
    leaveDungeon() {
        if (this._dungeon?.status === 'active') this._dungeon.status = 'abandoned';
        this._dungeon = null;
    }
};

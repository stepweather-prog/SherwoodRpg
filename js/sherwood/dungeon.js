/**
 * Sherwood Dungeon System
 * Исправленная версия с правильными путями к тайлам
 */

Sherwood.Dungeon = {
    _dungeon: null,
    _gridSize: 8,
    
    _tiles: {
        floor: 'assets/lor/level_seamless_horizontal_loop_1.jpg',
        wall: 'assets/icons/Dungeon tiles1.jpeg'
    },
    
    init() {
        const img = new Image();
        img.src = this._tiles.floor;
        const img2 = new Image();
        img2.src = this._tiles.wall;
    },
    
    generateDungeon(difficulty) {
        const player = Sherwood.getPlayer();
        if (!player || player.dungeon.tickets <= 0) return null;
        player.dungeon.tickets--;
        
        const size = 8;
        const grid = [];
        
        // Создаём сетку со стенами
        for (let y = 0; y < size; y++) {
            grid[y] = [];
            for (let x = 0; x < size; x++) {
                grid[y][x] = {
                    type: 'wall',
                    explored: false,
                    visible: false,
                    walkable: false,
                    tile: 'assets/icons/Dungeon tiles1.jpeg'
                };
            }
        }
        
        // Генерируем комнаты
        const rooms = this._generateRooms(size);
        rooms.forEach(room => {
            for (let y = room.y; y < room.y + room.h; y++) {
                for (let x = room.x; x < room.x + room.w; x++) {
                    if (x < size && y < size) {
                        grid[y][x].type = 'floor';
                        grid[y][x].walkable = true;
                        grid[y][x].tile = this._tiles.floor;
                    }
                }
            }
        });
        
        // Соединяем комнаты
        for (let i = 0; i < rooms.length - 1; i++) {
            const a = rooms[i];
            const b = rooms[i + 1];
            const ax = a.x + Math.floor(a.w / 2);
            const ay = a.y + Math.floor(a.h / 2);
            const bx = b.x + Math.floor(b.w / 2);
            const by = b.y + Math.floor(b.h / 2);
            this._carveCorridor(grid, ax, ay, bx, by);
        }
        
        // Старт
        const startRoom = rooms[0];
        const startX = startRoom.x + Math.floor(startRoom.w / 2);
        const startY = startRoom.y + Math.floor(startRoom.h / 2);
        grid[startY][startX].type = 'start';
        grid[startY][startX].explored = true;
        grid[startY][startX].visible = true;
        grid[startY][startX].tile = this._tiles.floor;
        
        // Выход
        const exitRoom = rooms[rooms.length - 1];
        const exitX = exitRoom.x + Math.floor(exitRoom.w / 2);
        const exitY = exitRoom.y + Math.floor(exitRoom.h / 2);
        grid[exitY][exitX].type = 'exit';
        grid[exitY][exitX].walkable = true;
        grid[exitY][exitX].tile = this._tiles.floor;
        
        // Враги
        const enemyCount = difficulty === 'hard' ? 8 : difficulty === 'easy' ? 4 : 6;
        this._placeEnemies(grid, rooms, enemyCount, difficulty);
        
        // Сундуки
        const chestCount = difficulty === 'hard' ? 4 : difficulty === 'easy' ? 2 : 3;
        this._placeChests(grid, rooms, chestCount);
        
        // Статистика
        let totalWalkable = 0;
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (grid[y][x].walkable) totalWalkable++;
            }
        }
        
        this._dungeon = {
            grid, size,
            playerPos: { x: startX, y: startY },
            difficulty,
            status: 'active',
            monstersKilled: 0,
            chestsOpened: 0,
            totalEnemies: enemyCount,
            totalChests: chestCount,
            totalWalkable,
            exploredWalkable: 1,
            steps: 0
        };
        
        this._updateVisibility(startX, startY);
        return this._dungeon;
    },
    
    _generateRooms(size) {
        const rooms = [];
        const count = 4 + Math.floor(Math.random() * 2);
        for (let i = 0; i < count; i++) {
            const w = 2 + Math.floor(Math.random() * 2);
            const h = 2 + Math.floor(Math.random() * 2);
            const x = 1 + Math.floor(Math.random() * (size - w - 1));
            const y = 1 + Math.floor(Math.random() * (size - h - 1));
            let overlap = false;
            for (const r of rooms) {
                if (x < r.x + r.w + 1 && x + w + 1 > r.x && y < r.y + r.h + 1 && y + h + 1 > r.y) {
                    overlap = true;
                    break;
                }
            }
            if (!overlap) rooms.push({ x, y, w, h });
        }
        if (rooms.length === 0) rooms.push({ x: 2, y: 2, w: 3, h: 3 });
        return rooms;
    },
    
    _carveCorridor(grid, x1, y1, x2, y2) {
        let x = x1, y = y1;
        while (x !== x2) {
            if (grid[y] && grid[y][x] && grid[y][x].type === 'wall') {
                grid[y][x].type = 'floor';
                grid[y][x].walkable = true;
                grid[y][x].tile = this._tiles.floor;
            }
            x += (x < x2) ? 1 : -1;
        }
        while (y !== y2) {
            if (grid[y] && grid[y][x] && grid[y][x].type === 'wall') {
                grid[y][x].type = 'floor';
                grid[y][x].walkable = true;
                grid[y][x].tile = this._tiles.floor;
            }
            y += (y < y2) ? 1 : -1;
        }
    },
    
    _placeEnemies(grid, rooms, count, difficulty) {
        let placed = 0;
        const cells = [];
        for (const room of rooms) {
            for (let y = room.y; y < room.y + room.h; y++) {
                for (let x = room.x; x < room.x + room.w; x++) {
                    if (grid[y] && grid[y][x] && grid[y][x].walkable && grid[y][x].type === 'floor') {
                        cells.push({ x, y });
                    }
                }
            }
        }
        while (placed < count && cells.length > 0) {
            const idx = Math.floor(Math.random() * cells.length);
            const cell = cells.splice(idx, 1)[0];
            const monster = this._getRandomMonster(difficulty === 'hard' ? 2 : 1);
            if (grid[cell.y] && grid[cell.y][cell.x]) {
                grid[cell.y][cell.x].type = 'enemy';
                grid[cell.y][cell.x].monsterId = monster.id;
                grid[cell.y][cell.x].monsterIcon = monster.icon;
                grid[cell.y][cell.x].monsterName = monster.name;
                grid[cell.y][cell.x].walkable = false;
                placed++;
            }
        }
    },
    
    _placeChests(grid, rooms, count) {
        let placed = 0;
        const cells = [];
        for (const room of rooms) {
            for (let y = room.y; y < room.y + room.h; y++) {
                for (let x = room.x; x < room.x + room.w; x++) {
                    if (grid[y] && grid[y][x] && grid[y][x].walkable && grid[y][x].type === 'floor') {
                        cells.push({ x, y });
                    }
                }
            }
        }
        while (placed < count && cells.length > 0) {
            const idx = Math.floor(Math.random() * cells.length);
            const cell = cells.splice(idx, 1)[0];
            if (grid[cell.y] && grid[cell.y][cell.x]) {
                grid[cell.y][cell.x].type = 'chest';
                grid[cell.y][cell.x].looted = false;
                grid[cell.y][cell.x].reward = {
                    gold: 20 + Math.floor(Math.random() * 60),
                    silver: 80 + Math.floor(Math.random() * 300)
                };
                placed++;
            }
        }
    },
    
    _getRandomMonster(tier) {
        const monsters = Object.values(Sherwood.Monsters || {});
        const available = monsters.filter(m => m && !m.isBoss);
        if (available.length === 0) {
            return { id: 'swamp_ghoul_1', name: 'Монстр', icon: 'assets/monsters/Swamp Ghoul1.png' };
        }
        return available[Math.floor(Math.random() * available.length)];
    },
    
    _updateVisibility(x, y) {
        const d = this._dungeon;
        if (!d) return;
        const radius = 2;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < d.size && ny >= 0 && ny < d.size) {
                    if (Math.abs(dx) + Math.abs(dy) <= radius) {
                        d.grid[ny][nx].visible = true;
                        if (d.grid[ny][nx].walkable) d.grid[ny][nx].explored = true;
                    }
                }
            }
        }
    },
    
    moveToTile(x, y) {
        const d = this._dungeon;
        if (!d || d.status !== 'active') return null;
        if (Math.abs(x - d.playerPos.x) + Math.abs(y - d.playerPos.y) !== 1) {
            return { success: false, reason: 'too_far' };
        }
        const cell = d.grid[y][x];
        if (!cell || !cell.walkable) return { success: false, reason: 'wall' };
        if (cell.type === 'enemy') return { success: false, reason: 'enemy' };
        
        d.playerPos = { x, y };
        d.steps++;
        this._updateVisibility(x, y);
        
        let explored = 0;
        for (let gy = 0; gy < d.size; gy++) {
            for (let gx = 0; gx < d.size; gx++) {
                if (d.grid[gy][gx] && d.grid[gy][gx].explored) explored++;
            }
        }
        d.exploredWalkable = explored;
        
        if (cell.type === 'chest' && !cell.looted) {
            cell.looted = true;
            d.chestsOpened++;
            Sherwood.addResource('gold', cell.reward.gold);
            Sherwood.addResource('silver', cell.reward.silver);
            return { type: 'chest', reward: cell.reward };
        }
        if (cell.type === 'exit') {
            d.status = 'completed';
            this._calculateReward();
            return { type: 'exit' };
        }
        return { type: 'empty' };
    },
    
    attackEnemy(x, y) {
        const d = this._dungeon;
        if (!d || d.status !== 'active') return null;
        if (Math.abs(x - d.playerPos.x) + Math.abs(y - d.playerPos.y) !== 1) {
            return { success: false, reason: 'too_far' };
        }
        const cell = d.grid[y][x];
        if (!cell || cell.type !== 'enemy') return { success: false, reason: 'no_enemy' };
        return { success: true, tile: cell };
    },
    
    fightMonster(tile) {
        if (!tile || !tile.monsterId) return null;
        const battle = Sherwood.Combat.startPvE(tile.monsterId);
        if (battle) {
            battle.dungeonTile = tile;
            Sherwood.once('BATTLE_VICTORY', () => {
                if (this._dungeon && tile) {
                    this._dungeon.monstersKilled++;
                    tile.type = 'floor';
                    tile.walkable = true;
                    tile.monsterId = null;
                    tile.monsterIcon = null;
                    tile.monsterName = null;
                    tile.tile = this._tiles.floor;
                }
            });
        }
        return battle;
    },
    
    _calculateReward() {
        const d = this._dungeon;
        if (!d) return;
        const pct = d.totalWalkable > 0 ? d.exploredWalkable / d.totalWalkable : 0;
        const gold = d.monstersKilled * 35 + d.chestsOpened * 55 + Math.floor(pct * 150);
        const exp = d.monstersKilled * 30 + d.chestsOpened * 40 + Math.floor(pct * 100);
        Sherwood.addResource('gold', gold);
        Sherwood.addExp(exp);
        if (pct >= 0.8) Sherwood.addResource('trophies', 3);
    },
    
    getDungeon() { return this._dungeon; },
    
    leaveDungeon() {
        if (this._dungeon) this._dungeon.status = 'abandoned';
        this._dungeon = null;
    }
};

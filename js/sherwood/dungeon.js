Sherwood.Dungeon = {
    TILE: { WALL: 0, EMPTY: 1, MONSTER: 2, CHEST: 3, BOSS: 4, SPAWN: 5, EXIT: 6, ALTAR: 7, CAULDRON: 8, POTION: 9 },
    _dungeon: null,
    _progress: null,
    _ticketTimer: null,

    init: function() {
        var saved = localStorage.getItem('sherwood_dungeon_progress');
        this._progress = saved ? JSON.parse(saved) : { forest: { level: 1 }, swamp: { level: 1 }, cave: { level: 1 } };
        this._startTicketRegeneration();
    },

    _startTicketRegeneration: function() {
        var self = this;
        if (this._ticketTimer) clearInterval(this._ticketTimer);
        this._ticketTimer = setInterval(function() {
            var p = Sherwood.getPlayer();
            if (p && p.dungeon) {
                if (p.dungeon.tickets < p.dungeon.maxTickets) {
                    p.dungeon.tickets = Math.min(p.dungeon.maxTickets, p.dungeon.tickets + 1);
                    Sherwood.saveGame();
                }
            }
        }, 40 * 60 * 1000);
    },

    getAvailable: function() {
    var list = {};
    var duns = {
        forest: { name: 'Проклятая чаща', icon: '🌲', bg: 'assets/backgrounds/underground_1_floor_1.jpg', tiles: 'dungeon1', ext: '.jpeg', unlockLevel: 1 },
        swamp: { name: 'Первородное болото', icon: '🌿', bg: 'assets/backgrounds/underground_2_floor_1.jpeg', tiles: 'dungeon2', ext: '.png', unlockLevel: 4, requiredDungeon: 'forest' },
        cave: { name: 'Базальтовые шахты', icon: '🪨', bg: 'assets/backgrounds/underground_3_floor_1.jpeg', tiles: 'dungeon3', ext: '.png', unlockLevel: 4, requiredDungeon: 'swamp' }
    };
    for (var id in duns) {
        var dd = duns[id];
        var prog = this._progress[id] || { level: 1 };
        var requiredProg = dd.requiredDungeon ? (this._progress[dd.requiredDungeon] || { level: 1 }) : { level: 99 };
        if (id === 'forest' || (requiredProg.level >= dd.unlockLevel)) {
            list[id] = { id: id, name: dd.name, icon: dd.icon, bg: dd.bg, tiles: dd.tiles, ext: dd.ext, level: prog.level };
        }
    }
    return list;
},

    generate: function(dungeonId, level) {
    var p = Sherwood.getPlayer();
    if (!p || !p.dungeon || p.dungeon.tickets <= 0) return null;
    p.dungeon.tickets--;
    Sherwood.saveGame();

    var size = 14;
    var grid = [];
    for (var y = 0; y < size; y++) {
        grid[y] = [];
        for (var x = 0; x < size; x++) {
            grid[y][x] = { type: this.TILE.WALL, open: false };
        }
    }

    // Генерация лабиринта DFS
    var startX = 1, startY = 1;
    grid[startY][startX].type = this.TILE.EMPTY;
    
    var stack = [{x: startX, y: startY}];
    var dirs = [[0,-2],[0,2],[-2,0],[2,0]];
    
    while (stack.length > 0) {
        var current = stack[stack.length - 1];
        var neighbors = [];
        
        for (var d = 0; d < dirs.length; d++) {
            var nx = current.x + dirs[d][0];
            var ny = current.y + dirs[d][1];
            if (nx > 0 && nx < size-1 && ny > 0 && ny < size-1 && grid[ny][nx].type === this.TILE.WALL) {
                neighbors.push({x: nx, y: ny, dx: dirs[d][0], dy: dirs[d][1]});
            }
        }
        
        if (neighbors.length > 0) {
            var next = neighbors[Math.floor(Math.random() * neighbors.length)];
            grid[current.y + next.dy/2][current.x + next.dx/2].type = this.TILE.EMPTY;
            grid[next.y][next.x].type = this.TILE.EMPTY;
            stack.push({x: next.x, y: next.y});
        } else {
            stack.pop();
        }
    }

    var spawnX = startX, spawnY = startY;
    grid[spawnY][spawnX].type = this.TILE.SPAWN;
    grid[spawnY][spawnX].open = true;

    var empties = [];
    for (var y = 1; y < size-1; y++) {
        for (var x = 1; x < size-1; x++) {
            if (grid[y][x].type === this.TILE.EMPTY && !(x === spawnX && y === spawnY)) {
                empties.push({x:x, y:y});
            }
        }
    }
    empties.sort(function() { return Math.random() - 0.5; });

    var monsters = {
        forest: { easy: ['image (1).png','image (3).png','image (74).png'], medium: ['image (9).png','image (29).png','image (75).png'], boss: 'image (15).png' },
        swamp: { easy: ['image (12).png','image (13).png','image (59).png'], medium: ['image (14).png','image (16).png','image (52).png'], boss: 'image (54).png' },
        cave: { easy: ['image (32).png','image (35).png','image (10).png'], medium: ['image (33).png','image (36).png','image (49).png'], boss: 'image (34).png' }
    };
    var pool = monsters[dungeonId] || monsters['forest'];
    var monList = level <= 3 ? pool.easy : pool.medium;
    var monsterCount = level <= 3 ? 6 : 8;
    if (level === 7) monsterCount = 10;

    var allCells = empties.slice();
    
    var placedMonsters = 0;
    var monsterCells = [];
    for (var i = 0; i < allCells.length && placedMonsters < monsterCount; i++) {
        var cell = allCells[i];
        if (Math.abs(cell.x - spawnX) + Math.abs(cell.y - spawnY) < 3) continue;
        var tooClose = false;
        for (var m = 0; m < monsterCells.length; m++) {
            if (Math.abs(cell.x - monsterCells[m].x) + Math.abs(cell.y - monsterCells[m].y) < 2) {
                tooClose = true; break;
            }
        }
        if (!tooClose) {
            grid[cell.y][cell.x].type = this.TILE.MONSTER;
            grid[cell.y][cell.x].monster = true;
            grid[cell.y][cell.x].monsterId = monList[Math.floor(Math.random() * monList.length)];
            monsterCells.push(cell);
            cell.used = true;
            placedMonsters++;
        }
    }

    var isBossLevel = (level === 7);
    if (isBossLevel) {
        for (var i = 0; i < allCells.length; i++) {
            var cell = allCells[i];
            if (cell.used) continue;
            if (Math.abs(cell.x - spawnX) + Math.abs(cell.y - spawnY) < 5) continue;
            var tooClose = false;
            for (var m = 0; m < monsterCells.length; m++) {
                if (Math.abs(cell.x - monsterCells[m].x) + Math.abs(cell.y - monsterCells[m].y) < 3) {
                    tooClose = true; break;
                }
            }
            if (!tooClose) {
                grid[cell.y][cell.x].type = this.TILE.BOSS;
                grid[cell.y][cell.x].monster = true;
                grid[cell.y][cell.x].monsterId = pool.boss;
                grid[cell.y][cell.x].isBoss = true;
                cell.used = true;
                break;
            }
        }
    }

    var specials = [
        { type: this.TILE.POTION, count: 5, prop: 'potion' },
        { type: this.TILE.CAULDRON, count: 3, prop: 'cauldron' },
        { type: this.TILE.ALTAR, count: 2, prop: 'altar' }
    ];
    for (var t = 0; t < specials.length; t++) {
        var st = specials[t];
        var placed = 0;
        for (var i = 0; i < allCells.length && placed < st.count; i++) {
            var cell = allCells[i];
            if (cell.used) continue;
            if (Math.abs(cell.x - spawnX) + Math.abs(cell.y - spawnY) < 2) continue;
            grid[cell.y][cell.x].type = st.type;
            grid[cell.y][cell.x][st.prop] = true;
            cell.used = true;
            placed++;
        }
    }

    var exitPlaced = false;
    for (var i = allCells.length - 1; i >= 0; i--) {
        var cell = allCells[i];
        if (cell.used) continue;
        if (Math.abs(cell.x - spawnX) + Math.abs(cell.y - spawnY) < 4) continue;
        grid[cell.y][cell.x].type = this.TILE.EXIT;
        grid[cell.y][cell.x].exit = true;
        grid[cell.y][cell.x].locked = true;
        exitPlaced = true;
        break;
    }

    var totalMonsters = 0;
    for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
            if (grid[y][x].monster) totalMonsters++;
        }
    }

    this._dungeon = {
        id: dungeonId, level: level, size: size, grid: grid,
        px: spawnX, py: spawnY,
        monstersKilled: 0, totalMonsters: totalMonsters,
        chestsOpened: 0, isBossLevel: isBossLevel,
        heroDirection: 'down', isMoving: false,
        chestPlaced: false
    };
    return this._dungeon;
},

    getDungeon: function() { return this._dungeon; },

    move: function(tx, ty) {
    var d = this._dungeon;
    if (!d) return { ok: false, reason: 'No dungeon' };
    var cell = d.grid[ty][tx];
    if (!cell) return { ok: false, reason: 'No cell' };
    if (cell.type === this.TILE.WALL) return { ok: false, reason: 'Wall' };

    cell.open = true;
    d.px = tx;
    d.py = ty;

    var cellType = cell.type;

    if (cellType === this.TILE.MONSTER || cellType === this.TILE.BOSS) {
        return { ok: true, type: 'battle', monsterId: cell.monsterId, boss: cell.isBoss || false };
    }
    if (cellType === this.TILE.CHEST && !cell.looted) {
        return { ok: true, type: 'chest' };
    }
    if (cellType === this.TILE.ALTAR && cell.altar) {
        return { ok: true, type: 'altar' };
    }
    if (cellType === this.TILE.CAULDRON && cell.cauldron) {
        return { ok: true, type: 'cauldron' };
    }
    if (cellType === this.TILE.POTION && cell.potion) {
        return { ok: true, type: 'potion' };
    }
    if (cell.lootBag && !cell.lootCollected) {
        return { ok: true, type: 'lootBag' };
    }
    if (cell.exit) {
        if (cell.locked) {
            if (d.monstersKilled >= d.totalMonsters) {
                cell.locked = false;
                return { ok: true, type: 'exit' };
            }
            return { ok: true, type: 'exit_locked' };
        }
        return { ok: true, type: 'exit' };
    }
    return { ok: true, type: 'move' };
},

    _moveSilent: function(tx, ty) {
    var d = this._dungeon;
    if (!d) return;
    d.grid[ty][tx].open = true;
    d.px = tx;
    d.py = ty;
},

    killMonster: function() {
    if (!this._dungeon) return;
    var d = this._dungeon;
    d.monstersKilled++;
    var cell = d.grid[d.py][d.px];
    if (cell && cell.monster) {
        cell.monster = false;
        cell.monsterId = null;
        cell.isBoss = false;
        cell.type = this.TILE.EMPTY;
    }
    // Мешок с каждой бестии
    if (cell) {
        cell.lootBag = true;
        cell.lootCollected = false;
        cell.reward = { gold: 1 + Math.floor(Math.random() * 3), silver: 50 + Math.floor(Math.random() * 100) };
    }
    // Последний монстр — сундук вместо мешка
    if (d.monstersKilled >= d.totalMonsters && !d.chestPlaced && cell) {
        d.chestPlaced = true;
        cell.lootBag = false;
        cell.chest = true;
        cell.type = this.TILE.CHEST;
        cell.looted = false;
        cell.reward = { gold: 2 + Math.floor(Math.random() * 5), silver: 300 + Math.floor(Math.random() * 500) };
    }
    if (d.monstersKilled >= d.totalMonsters) {
        for (var y = 0; y < d.size; y++) {
            for (var x = 0; x < d.size; x++) {
                if (d.grid[y][x].exit) d.grid[y][x].locked = false;
            }
        }
    }
},
    
    complete: function() {
        var d = this._dungeon;
        if (!d) return { gold: 0, exp: 0 };
        var gold = (d.isBossLevel ? 10 : 3) + d.chestsOpened * 2;
        var silver = d.monstersKilled * 50 + d.chestsOpened * 50 + 100;
        var exp = d.monstersKilled * 30 + d.chestsOpened * 20 + 20;
        Sherwood.addResource('gold', gold);
        Sherwood.addResource('silver', silver);
        Sherwood.addExp(exp);
        if (typeof Sherwood.Daily !== 'undefined') Sherwood.Daily.updateProgress('dungeon_floors', 1);
        var prog = this._progress[d.id] || { level: 1 };
        if (d.level >= prog.level) prog.level = Math.min(8, d.level + 1);
        this._progress[d.id] = prog;
        localStorage.setItem('sherwood_dungeon_progress', JSON.stringify(this._progress));
        this._dungeon = null;
        return { gold: gold, silver: silver, exp: exp };
    },
      
    leave: function() { this._dungeon = null; }
};

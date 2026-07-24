Sherwood.Dungeon = {
    TILE: { WALL: 0, EMPTY: 1, MONSTER: 2, CHEST: 3, BOSS: 4, SPAWN: 5, EXIT: 6, ALTAR: 7, CAULDRON: 8, POTION: 9 },
    _dungeon: null,
    _progress: null,

    init: function() {
        var saved = localStorage.getItem('sherwood_dungeon_progress');
        this._progress = saved ? JSON.parse(saved) : { forest: { level: 1 }, swamp: { level: 1 }, cave: { level: 1 } };
    },

    getAvailable: function() {
        var list = {};
        var duns = {
            forest: { name: 'Проклятая чаща', icon: '🌲', bg: 'assets/backgrounds/underground_1_floor_1.jpg', tiles: 'dungeon1', ext: '.jpeg' },
            swamp: { name: 'Первородное болото', icon: '🌿', bg: 'assets/backgrounds/underground_2_floor_1.jpeg', tiles: 'dungeon2', ext: '.png' },
            cave: { name: 'Базальтовые шахты', icon: '🪨', bg: 'assets/backgrounds/underground_3_floor_1.jpeg', tiles: 'dungeon3', ext: '.png' }
        };
        for (var id in duns) {
            var dd = duns[id];
            var prog = this._progress[id] || { level: 1 };
            list[id] = { id: id, name: dd.name, icon: dd.icon, bg: dd.bg, tiles: dd.tiles, ext: dd.ext, level: prog.level };
        }
        return list;
    },

    generate: function(dungeonId, level) {
        var p = Sherwood.getPlayer();
        if (p.dungeon.tickets <= 0) return null;
        p.dungeon.tickets--;
        var w = 6 + Math.floor(level / 3); if (w > 10) w = 10;
        var h = w;
        var grid = [];
        for (var y = 0; y < h; y++) {
            grid[y] = [];
            for (var x = 0; x < w; x++) {
                grid[y][x] = { type: this.TILE.WALL, open: false, monster: false, chest: false, altar: false, cauldron: false, potion: false, exit: false, boss: false, locked: false, monsterId: null };
            }
        }
        var cx = Math.floor(Math.random() * w), cy = Math.floor(Math.random() * h);
        grid[cy][cx].type = this.TILE.EMPTY; grid[cy][cx].open = true;
        var emptyCount = 1, target = Math.floor(w * h * 0.6);
        var dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        while (emptyCount < target) {
            var dir = dirs[Math.floor(Math.random() * 4)];
            var nx = cx + dir[0], ny = cy + dir[1];
            if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
                if (grid[ny][nx].type === this.TILE.WALL) { grid[ny][nx].type = this.TILE.EMPTY; emptyCount++; }
                cx = nx; cy = ny;
            }
        }
        var spawnX = Math.floor(Math.random() * w), spawnY = Math.floor(Math.random() * h);
        while (grid[spawnY][spawnX].type !== this.TILE.EMPTY) { spawnX = Math.floor(Math.random() * w); spawnY = Math.floor(Math.random() * h); }
        grid[spawnY][spawnX].type = this.TILE.SPAWN; grid[spawnY][spawnX].open = true;
        var empties = [];
        for (var y = 0; y < h; y++) { for (var x = 0; x < w; x++) { if (grid[y][x].type === this.TILE.EMPTY && !(x === spawnX && y === spawnY)) empties.push({x:x, y:y}); } }
        empties.sort(function() { return Math.random() - 0.5; });
        // 10 врагов
        var totalMonsters = 10;
        for (var i = 0; i < totalMonsters; i++) { if (empties.length === 0) break; var mc = empties.pop(); grid[mc.y][mc.x].type = this.TILE.MONSTER; grid[mc.y][mc.x].monster = true; }
        // Алтарь
        if (empties.length > 0) { var ac = empties.pop(); grid[ac.y][ac.x].type = this.TILE.ALTAR; grid[ac.y][ac.x].altar = true; }
        // Котёл
        if (empties.length > 0) { var cc = empties.pop(); grid[cc.y][cc.x].type = this.TILE.CAULDRON; grid[cc.y][cc.x].cauldron = true; }
        // 5 банок
        for (var i = 0; i < 5; i++) { if (empties.length === 0) break; var pc = empties.pop(); grid[pc.y][pc.x].type = this.TILE.POTION; grid[pc.y][pc.x].potion = true; }
        // Выход (закрыт пока все 10 не убиты)
        var bestDist = -1, exitX = spawnX, exitY = spawnY;
        for (var i = 0; i < empties.length; i++) { var dist = Math.abs(empties[i].x - spawnX) + Math.abs(empties[i].y - spawnY); if (dist > bestDist) { bestDist = dist; exitX = empties[i].x; exitY = empties[i].y; } }
        if (bestDist >= 0) { grid[exitY][exitX].type = this.TILE.EXIT; grid[exitY][exitX].exit = true; grid[exitY][exitX].locked = true; }
        // Монстры
        var monsters = {
            forest: { easy: ['image (1).png','image (3).png','image (74).png'], medium: ['image (9).png','image (29).png','image (75).png'], boss: 'image (15).png' },
            swamp: { easy: ['image (12).png','image (13).png','image (59).png'], medium: ['image (14).png','image (16).png','image (52).png'], boss: 'image (54).png' },
            cave: { easy: ['image (32).png','image (35).png','image (10).png'], medium: ['image (33).png','image (36).png','image (49).png'], boss: 'image (34).png' }
        };
        var pool = monsters[dungeonId] || monsters['forest'];
        var monList = level <= 3 ? pool.easy : pool.medium;

        this._dungeon = {
            id: dungeonId, level: level, size: w, grid: grid,
            px: spawnX, py: spawnY, movesLeft: 999, monstersKilled: 0, totalMonsters: totalMonsters,
            chestsOpened: 0, monsterPool: monList, isBossLevel: level === 7
        };
        return this._dungeon;
    },

    getDungeon: function() { return this._dungeon; },

    move: function(tx, ty) {
        var d = this._dungeon;
        if (!d) return { ok: false };
        var cell = d.grid[ty][tx];
        if (cell.type === this.TILE.WALL) return { ok: false, reason: 'Стена' };
        // Если клетка открыта — телепорт
        if (cell.open) {
            d.px = tx; d.py = ty;
            if (cell.exit && !cell.locked) return { ok: true, type: 'exit' };
            return { ok: true, type: 'move' };
        }
        // Открываем клетку
        cell.open = true;
        d.px = tx; d.py = ty;
        if (cell.type === this.TILE.MONSTER) {
            var mid = d.monsterPool[Math.floor(Math.random() * d.monsterPool.length)];
            cell.monsterId = mid;
            return { ok: true, type: 'battle', monsterId: mid, boss: false };
        }
        if (cell.type === this.TILE.CHEST) {
            d.chestsOpened++;
            var g = 25 + Math.floor(Math.random() * 80), s = 100 + Math.floor(Math.random() * 400);
            Sherwood.addResource('gold', g); Sherwood.addResource('silver', s);
            cell.type = this.TILE.EMPTY; cell.chest = false;
            return { ok: true, type: 'chest', gold: g, silver: s };
        }
        if (cell.type === this.TILE.ALTAR) { cell.type = this.TILE.EMPTY; cell.altar = false; return { ok: true, type: 'altar' }; }
        if (cell.type === this.TILE.CAULDRON) { cell.type = this.TILE.EMPTY; cell.cauldron = false; return { ok: true, type: 'cauldron' }; }
        if (cell.type === this.TILE.POTION) { cell.type = this.TILE.EMPTY; cell.potion = false; return { ok: true, type: 'potion' }; }
        if (cell.exit && cell.locked) return { ok: true, type: 'exit_locked' };
        return { ok: true, type: 'move' };
    },

    killMonster: function() {
        if (!this._dungeon) return;
        this._dungeon.monstersKilled++;
        if (this._dungeon.monstersKilled >= this._dungeon.totalMonsters) {
            for (var y = 0; y < this._dungeon.size; y++) {
                for (var x = 0; x < this._dungeon.size; x++) {
                    if (this._dungeon.grid[y][x].exit) this._dungeon.grid[y][x].locked = false;
                }
            }
        }
    },

    complete: function() {
        var d = this._dungeon; if (!d) return;
        var gold = d.monstersKilled * 35 + 30, exp = d.monstersKilled * 30 + 20;
        Sherwood.addResource('gold', gold); Sherwood.addResource('silver', gold * 2); Sherwood.addExp(exp);
        if (d.isBossLevel) {
            var prog = this._progress[d.id] || { level: 1 };
            if (d.level >= prog.level) prog.level = Math.min(8, d.level + 1);
            this._progress[d.id] = prog;
            localStorage.setItem('sherwood_dungeon_progress', JSON.stringify(this._progress));
        }
        this._dungeon = null;
        return { gold: gold, exp: exp };
    },

    leave: function() { this._dungeon = null; }
};

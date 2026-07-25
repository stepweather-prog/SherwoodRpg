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
        var size = 14 + Math.floor(level / 2); if (size > 22) size = 22;
        var grid = [];
        for (var y = 0; y < size; y++) {
            grid[y] = [];
            for (var x = 0; x < size; x++) {
                grid[y][x] = { type: 0, open: false, monster: false, chest: false, altar: false, cauldron: false, potion: false, exit: false, boss: false, locked: false, monsterId: null };
            }
        }
        // Бурим коридоры
        var cx = 1 + Math.floor(Math.random() * (size - 2));
        var cy = 1 + Math.floor(Math.random() * (size - 2));
        grid[cy][cx].type = 1;
        var emptyCount = 1;
        var target = Math.floor(size * size * 0.35);
        var dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        var steps = 0;
        while (emptyCount < target && steps < 10000) {
            steps++;
            var dir = dirs[Math.floor(Math.random() * 4)];
            var nx = cx + dir[0], ny = cy + dir[1];
            if (nx >= 1 && nx < size-1 && ny >= 1 && ny < size-1) {
                if (grid[ny][nx].type === 0) {
                    grid[ny][nx].type = 1;
                    emptyCount++;
                }
                cx = nx; cy = ny;
            }
        }
        // Спавн
        var spawnX = 1 + Math.floor(Math.random() * (size - 2));
        var spawnY = 1 + Math.floor(Math.random() * (size - 2));
        while (grid[spawnY][spawnX].type !== 1) { spawnX = 1 + Math.floor(Math.random() * (size - 2)); spawnY = 1 + Math.floor(Math.random() * (size - 2)); }
        grid[spawnY][spawnX].type = 5; grid[spawnY][spawnX].open = true;
        // Собираем пустые клетки
        var empties = [];
        for (var y = 1; y < size-1; y++) {
            for (var x = 1; x < size-1; x++) {
                if (grid[y][x].type === 1 && !(x === spawnX && y === spawnY)) {
                    empties.push({x:x, y:y});
                }
            }
        }
        empties.sort(function() { return Math.random() - 0.5; });
        // 10 монстров
        var totalMonsters = 10;
        var maxMonsters = Math.min(totalMonsters, Math.floor(empties.length * 0.15));
        for (var i = 0; i < maxMonsters; i++) {
            var mc = empties.pop();
            grid[mc.y][mc.x].type = 2; grid[mc.y][mc.x].monster = true;
        }
        // 4 алтаря
        var altars = Math.min(4, empties.length);
        for (var i = 0; i < altars; i++) {
            var ac = empties.pop();
            grid[ac.y][ac.x].type = 7; grid[ac.y][ac.x].altar = true;
        }
        // 4 котла
        var cauldrons = Math.min(4, empties.length);
        for (var i = 0; i < cauldrons; i++) {
            var cc = empties.pop();
            grid[cc.y][cc.x].type = 8; grid[cc.y][cc.x].cauldron = true;
        }
        // 5 банок здоровья
        var potions = Math.min(5, empties.length);
        for (var i = 0; i < potions; i++) {
            var pc = empties.pop();
            grid[pc.y][pc.x].type = 9; grid[pc.y][pc.x].potion = true;
        }
        // Выход
        var bestDist = -1, exitX = spawnX, exitY = spawnY;
        for (var i = 0; i < empties.length; i++) {
            var dist = Math.abs(empties[i].x - spawnX) + Math.abs(empties[i].y - spawnY);
            if (dist > bestDist) { bestDist = dist; exitX = empties[i].x; exitY = empties[i].y; }
        }
        if (bestDist >= 0) { grid[exitY][exitX].type = 6; grid[exitY][exitX].exit = true; grid[exitY][exitX].locked = true; }
        // Монстры
        var monsters = {
            forest: { easy: ['image (1).png','image (3).png','image (74).png'], medium: ['image (9).png','image (29).png','image (75).png'], boss: 'image (15).png' },
            swamp: { easy: ['image (12).png','image (13).png','image (59).png'], medium: ['image (14).png','image (16).png','image (52).png'], boss: 'image (54).png' },
            cave: { easy: ['image (32).png','image (35).png','image (10).png'], medium: ['image (33).png','image (36).png','image (49).png'], boss: 'image (34).png' }
        };
        var pool = monsters[dungeonId] || monsters['forest'];
        var monList = level <= 3 ? pool.easy : pool.medium;
        this._dungeon = {
            id: dungeonId, level: level, size: size, grid: grid,
            px: spawnX, py: spawnY, movesLeft: 999, monstersKilled: 0, totalMonsters: maxMonsters,
            chestsOpened: 0, monsterPool: monList, isBossLevel: level === 7,
            heroDirection: 'down', heroFrame: 0
        };
        return this._dungeon;
    },

    getDungeon: function() { return this._dungeon; },

    move: function(tx, ty) {
        var d = this._dungeon;
        if (!d) return { ok: false, reason: 'Нет подземки' };
        var dist = Math.abs(d.px - tx) + Math.abs(d.py - ty);
        if (dist !== 1) return { ok: false, reason: 'Далеко' };
        var cell = d.grid[ty][tx];
        if (!cell) return { ok: false, reason: 'Нет клетки' };
        if (cell.type === 0) return { ok: false, reason: 'Стена' };
        cell.open = true;
        d.px = tx; d.py = ty;
        if (cell.type === 2) { var mid = d.monsterPool[Math.floor(Math.random() * d.monsterPool.length)]; cell.monsterId = mid; return { ok: true, type: 'battle', monsterId: mid, boss: false }; }
        if (cell.type === 3) { d.chestsOpened++; var g = 25 + Math.floor(Math.random() * 80), s = 100 + Math.floor(Math.random() * 400); Sherwood.addResource('gold', g); Sherwood.addResource('silver', s); cell.type = 1; cell.chest = false; return { ok: true, type: 'chest', gold: g, silver: s }; }
        if (cell.type === 7) { cell.type = 1; cell.altar = false; return { ok: true, type: 'altar' }; }
        if (cell.type === 8) { cell.type = 1; cell.cauldron = false; return { ok: true, type: 'cauldron' }; }
        if (cell.type === 9) { cell.type = 1; cell.potion = false; return { ok: true, type: 'potion' }; }
        if (cell.exit && cell.locked) return { ok: true, type: 'exit_locked' };
        if (cell.exit && !cell.locked) return { ok: true, type: 'exit' };
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

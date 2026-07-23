Sherwood.Dungeon = {
    _dungeon: null,
    _progress: null,

    init: function() {
        var saved = localStorage.getItem('sherwood_dungeon_progress');
        this._progress = saved ? JSON.parse(saved) : { forest: { level: 1 }, swamp: { level: 1 }, cave: { level: 1 } };
    },

    getAvailable: function() {
        var list = {};
        var dungeons = {
            forest: { name: 'Проклятая чаща', icon: '🌲', bg: 'assets/backgrounds/underground_1_floor_1.jpg', tiles: 'dungeon1', ext: '.jpeg' },
            swamp: { name: 'Первородное болото', icon: '🌿', bg: 'assets/backgrounds/underground_2_floor_1.jpeg', tiles: 'dungeon2', ext: '.png' },
            cave: { name: 'Базальтовые шахты', icon: '🪨', bg: 'assets/backgrounds/underground_3_floor_1.jpeg', tiles: 'dungeon3', ext: '.png' }
        };
        for (var id in dungeons) {
            var d = dungeons[id];
            var prog = this._progress[id] || { level: 1 };
            list[id] = { id: id, name: d.name, icon: d.icon, bg: d.bg, tiles: d.tiles, ext: d.ext, level: prog.level };
        }
        return list;
    },

    generate: function(dungeonId, level) {
        var p = Sherwood.getPlayer();
        if (p.dungeon.tickets <= 0) return null;
        p.dungeon.tickets--;
        var size = 8;
        var grid = [];
        for (var y = 0; y < size; y++) {
            grid[y] = [];
            for (var x = 0; x < size; x++) {
                grid[y][x] = { type: 'floor', open: false, monster: false, chest: false, exit: false };
            }
        }
        // Комнаты
        var rooms = [];
        for (var i = 0; i < 3; i++) {
            var rw = 2 + Math.floor(Math.random() * 2);
            var rh = 2 + Math.floor(Math.random() * 2);
            var rx = 1 + Math.floor(Math.random() * (size - rw - 2));
            var ry = 1 + Math.floor(Math.random() * (size - rh - 2));
            rooms.push({ x: rx, y: ry, w: rw, h: rh });
        }
        // Старт и выход
        var sr = rooms[0], er = rooms[rooms.length - 1];
        var sx = sr.x + Math.floor(sr.w / 2), sy = sr.y + Math.floor(sr.h / 2);
        var ex = er.x + Math.floor(er.w / 2), ey = er.y + Math.floor(er.h / 2);
        // Монстры
        var monsterCount = level === 7 ? 6 : 4;
        var placed = 0;
        while (placed < monsterCount) {
            var mx = 1 + Math.floor(Math.random() * (size - 2));
            var my = 1 + Math.floor(Math.random() * (size - 2));
            if ((mx === sx && my === sy) || (mx === ex && my === ey)) continue;
            if (grid[my][mx].monster) continue;
            grid[my][mx].monster = true;
            grid[my][mx].boss = (level === 7 && placed === monsterCount - 1);
            placed++;
        }
        // Сундук только на 7 этаже
        if (level === 7) {
            var cx, cy;
            do { cx = 1 + Math.floor(Math.random() * (size - 2)); cy = 1 + Math.floor(Math.random() * (size - 2)); }
            while ((cx === sx && cy === sy) || (cx === ex && cy === ey) || grid[cy][cx].monster);
            grid[cy][cx].chest = true;
        }
        // Выход
        grid[ey][ex].exit = true;
        // Открываем старт
        grid[sy][sx].open = true;

        this._dungeon = {
            id: dungeonId, level: level, size: size, grid: grid,
            px: sx, py: sy, ex: ex, ey: ey,
            monstersKilled: 0, totalMonsters: monsterCount,
            chestsOpened: 0, steps: 0
        };
        return this._dungeon;
    },

    getDungeon: function() { return this._dungeon; },

    move: function(dx, dy) {
        var d = this._dungeon; if (!d) return null;
        var nx = d.px + dx, ny = d.py + dy;
        if (nx < 0 || nx >= d.size || ny < 0 || ny >= d.size) return { ok: false };
        var cell = d.grid[ny][nx];
        if (!cell.open) {
            cell.open = true;
            d.steps++;
            if (cell.monster) return { ok: true, type: 'battle', boss: cell.boss || false };
            if (cell.chest) { d.chestsOpened++; var g = 20 + Math.floor(Math.random() * 60); var s = 80 + Math.floor(Math.random() * 300); Sherwood.addResource('gold', g); Sherwood.addResource('silver', s); return { ok: true, type: 'chest', gold: g, silver: s }; }
            if (cell.exit) { d.steps++; return { ok: true, type: 'exit' }; }
        }
        if (cell.open && !cell.monster) {
            d.px = nx; d.py = ny;
            d.steps++;
            return { ok: true, type: 'move' };
        }
        return { ok: false };
    },

    killMonster: function() {
        var d = this._dungeon; if (!d) return;
        var cell = d.grid[d.py][d.px];
        cell.monster = false;
        cell.boss = false;
        d.monstersKilled++;
        d.px = d.px; d.py = d.py;
    },

    complete: function() {
        var d = this._dungeon; if (!d) return;
        var gold = d.monstersKilled * 35 + d.chestsOpened * 55 + 20;
        var exp = d.monstersKilled * 30 + d.chestsOpened * 40 + 15;
        Sherwood.addResource('gold', gold);
        Sherwood.addExp(exp);
        if (d.level === 7) {
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

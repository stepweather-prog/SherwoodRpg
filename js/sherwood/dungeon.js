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
        // Регенерация билетов каждые 40 минут
        if (this._ticketTimer) clearInterval(this._ticketTimer);
        this._ticketTimer = setInterval(function() {
            var p = Sherwood.getPlayer();
            if (p && p.dungeon) {
                if (p.dungeon.tickets < p.dungeon.maxTickets) {
                    p.dungeon.tickets = Math.min(p.dungeon.maxTickets, p.dungeon.tickets + 1);
                    Sherwood.saveGame();
                }
            }
        }, 40 * 60 * 1000); // 40 минут
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
        if (!p || !p.dungeon || p.dungeon.tickets <= 0) return null;
        p.dungeon.tickets--;
        Sherwood.saveGame();

        // Размер карты — 12x12 для мобильного экрана
        var size = 12;
        var grid = [];
        for (var y = 0; y < size; y++) {
            grid[y] = [];
            for (var x = 0; x < size; x++) {
                grid[y][x] = { type: this.TILE.WALL, open: false };
            }
        }

        // Генерация лабиринта методом бурильщика
        var cx = Math.floor(size / 2);
        var cy = Math.floor(size / 2);
        grid[cy][cx].type = this.TILE.EMPTY;
        var emptyCount = 1;
        var target = Math.floor(size * size * 0.35);
        var dirs = [[0,-1],[0,1],[-1,0],[1,0]];

        while (emptyCount < target) {
            var dir = dirs[Math.floor(Math.random() * 4)];
            var nx = cx + dir[0], ny = cy + dir[1];
            if (nx > 0 && nx < size-1 && ny > 0 && ny < size-1) {
                if (grid[ny][nx].type === this.TILE.WALL) {
                    grid[ny][nx].type = this.TILE.EMPTY;
                    emptyCount++;
                }
                cx = nx;
                cy = ny;
            }
        }

        // Точка входа
        var spawnX = Math.floor(size / 2);
        var spawnY = Math.floor(size / 2);
        // Ищем открытую клетку ближе к центру
        for (var y = Math.floor(size/2)-2; y <= Math.floor(size/2)+2; y++) {
            for (var x = Math.floor(size/2)-2; x <= Math.floor(size/2)+2; x++) {
                if (x >= 0 && x < size && y >= 0 && y < size && grid[y][x].type === this.TILE.EMPTY) {
                    spawnX = x; spawnY = y;
                }
            }
        }
        grid[spawnY][spawnX].type = this.TILE.SPAWN;
        grid[spawnY][spawnX].open = true;

        // Собираем пустые клетки
        var empties = [];
        for (var y = 1; y < size-1; y++) {
            for (var x = 1; x < size-1; x++) {
                if (grid[y][x].type === this.TILE.EMPTY && !(x === spawnX && y === spawnY)) {
                    empties.push({x:x, y:y});
                }
            }
        }
        empties.sort(function() { return Math.random() - 0.5; });

        // Монстры (6-8 штук)
        var monsters = {
            forest: { easy: ['image (1).png','image (3).png','image (74).png'], medium: ['image (9).png','image (29).png','image (75).png'], boss: 'image (15).png' },
            swamp: { easy: ['image (12).png','image (13).png','image (59).png'], medium: ['image (14).png','image (16).png','image (52).png'], boss: 'image (54).png' },
            cave: { easy: ['image (32).png','image (35).png','image (10).png'], medium: ['image (33).png','image (36).png','image (49).png'], boss: 'image (34).png' }
        };
        var pool = monsters[dungeonId] || monsters['forest'];
        var monList = level <= 3 ? pool.easy : pool.medium;
        var monsterCount = level <= 3 ? 6 : 8;
        if (level === 7) monsterCount = 8;

        var placedMonsters = 0;
        var monsterCells = [];
        for (var i = 0; i < empties.length && placedMonsters < monsterCount; i++) {
            var cell = empties[i];
            var tooClose = false;
            if (Math.abs(cell.x - spawnX) + Math.abs(cell.y - spawnY) < 3) continue;
            for (var m = 0; m < monsterCells.length; m++) {
                if (Math.abs(cell.x - monsterCells[m].x) + Math.abs(cell.y - monsterCells[m].y) < 3) {
                    tooClose = true;
                    break;
                }
            }
            if (!tooClose) {
                grid[cell.y][cell.x].type = this.TILE.MONSTER;
                grid[cell.y][cell.x].monster = true;
                grid[cell.y][cell.x].monsterId = monList[Math.floor(Math.random() * monList.length)];
                monsterCells.push(cell);
                placedMonsters++;
            }
        }

        // Алтари и котлы
        var specialTypes = [
            { type: this.TILE.ALTAR, count: 3, prop: 'altar' },
            { type: this.TILE.CAULDRON, count: 3, prop: 'cauldron' },
            { type: this.TILE.POTION, count: 4, prop: 'potion' },
            { type: this.TILE.CHEST, count: 4, prop: 'chest' }
        ];
        for (var t = 0; t < specialTypes.length; t++) {
            var st = specialTypes[t];
            for (var i = 0; i < st.count && empties.length > 0; i++) {
                var idx = Math.floor(Math.random() * empties.length);
                var cell = empties.splice(idx, 1)[0];
                grid[cell.y][cell.x].type = st.type;
                grid[cell.y][cell.x][st.prop] = true;
                if (st.type === this.TILE.CHEST) {
                    grid[cell.y][cell.x].looted = false;
                    grid[cell.y][cell.x].reward = { gold: 20 + Math.floor(Math.random() * 60), silver: 80 + Math.floor(Math.random() * 300) };
                }
            }
        }

        // Выход — в самой дальней клетке
        var bestDist = -1, exitX = spawnX, exitY = spawnY;
        for (var i = 0; i < empties.length; i++) {
            var dist = Math.abs(empties[i].x - spawnX) + Math.abs(empties[i].y - spawnY);
            if (dist > bestDist) { bestDist = dist; exitX = empties[i].x; exitY = empties[i].y; }
        }
        if (bestDist >= 0) {
            grid[exitY][exitX].type = this.TILE.EXIT;
            grid[exitY][exitX].exit = true;
            grid[exitY][exitX].locked = true;
        }

        // Босс на 7-м уровне
        var isBossLevel = (level === 7);
        if (isBossLevel) {
            var bossCell = null;
            // Ищем клетку рядом с выходом для босса
            for (var y = -2; y <= 2; y++) {
                for (var x = -2; x <= 2; x++) {
                    var nx = exitX + x, ny = exitY + y;
                    if (nx >= 0 && nx < size && ny >= 0 && ny < size && grid[ny][nx].type === this.TILE.EMPTY) {
                        bossCell = {x: nx, y: ny};
                        break;
                    }
                }
                if (bossCell) break;
            }
            if (bossCell) {
                grid[bossCell.y][bossCell.x].type = this.TILE.BOSS;
                grid[bossCell.y][bossCell.x].monster = true;
                grid[bossCell.y][bossCell.x].monsterId = pool.boss;
                grid[bossCell.y][bossCell.x].isBoss = true;
            }
        }

        // Открываем стартовую видимость
        this._revealArea(grid, size, spawnX, spawnY, 2);

        this._dungeon = {
            id: dungeonId,
            level: level,
            size: size,
            grid: grid,
            px: spawnX,
            py: spawnY,
            monstersKilled: 0,
            totalMonsters: placedMonsters + (isBossLevel ? 1 : 0),
            chestsOpened: 0,
            isBossLevel: isBossLevel,
            heroDirection: 'down',
            heroFrame: 0
        };
        return this._dungeon;
    },

    _revealArea: function(grid, size, cx, cy, radius) {
        for (var y = cy - radius; y <= cy + radius; y++) {
            for (var x = cx - radius; x <= cx + radius; x++) {
                if (x >= 0 && x < size && y >= 0 && y < size) {
                    if (Math.abs(x - cx) + Math.abs(y - cy) <= radius) {
                        if (grid[y][x].type !== this.TILE.WALL) {
                            grid[y][x].open = true;
                        }
                    }
                }
            }
        }
    },

    getDungeon: function() {
        return this._dungeon;
    },

    move: function(tx, ty) {
        var d = this._dungeon;
        if (!d) return { ok: false, reason: 'Нет подземки' };
        var dist = Math.abs(d.px - tx) + Math.abs(d.py - ty);
        if (dist !== 1) return { ok: false, reason: 'Далеко' };
        var cell = d.grid[ty][tx];
        if (!cell) return { ok: false, reason: 'Нет клетки' };
        if (cell.type === this.TILE.WALL) return { ok: false, reason: 'Стена' };
        cell.open = true;
        d.px = tx;
        d.py = ty;
        this._revealArea(d.grid, d.size, tx, ty, 2);

        if (cell.type === this.TILE.MONSTER || cell.type === this.TILE.BOSS) {
            return { ok: true, type: 'battle', monsterId: cell.monsterId, boss: cell.isBoss || false };
        }
        if (cell.type === this.TILE.CHEST && !cell.looted) {
            cell.looted = true;
            d.chestsOpened++;
            var g = cell.reward.gold || 20 + Math.floor(Math.random() * 60);
            var s = cell.reward.silver || 80 + Math.floor(Math.random() * 300);
            Sherwood.addResource('gold', g);
            Sherwood.addResource('silver', s);
            cell.type = this.TILE.EMPTY;
            return { ok: true, type: 'chest', gold: g, silver: s };
        }
        if (cell.type === this.TILE.ALTAR) {
            cell.type = this.TILE.EMPTY;
            cell.altar = false;
            return { ok: true, type: 'altar' };
        }
        if (cell.type === this.TILE.CAULDRON) {
            cell.type = this.TILE.EMPTY;
            cell.cauldron = false;
            return { ok: true, type: 'cauldron' };
        }
        if (cell.type === this.TILE.POTION) {
            cell.type = this.TILE.EMPTY;
            cell.potion = false;
            return { ok: true, type: 'potion' };
        }
        if (cell.exit && cell.locked) {
            // Проверяем, всех ли монстров убили
            var allDead = d.monstersKilled >= d.totalMonsters;
            if (allDead) {
                cell.locked = false;
                return { ok: true, type: 'exit' };
            }
            return { ok: true, type: 'exit_locked' };
        }
        if (cell.exit && !cell.locked) {
            return { ok: true, type: 'exit' };
        }
        return { ok: true, type: 'move' };
    },

    killMonster: function() {
        if (!this._dungeon) return;
        this._dungeon.monstersKilled++;
        // Проверяем, всех ли убили
        if (this._dungeon.monstersKilled >= this._dungeon.totalMonsters) {
            for (var y = 0; y < this._dungeon.size; y++) {
                for (var x = 0; x < this._dungeon.size; x++) {
                    if (this._dungeon.grid[y][x].exit) {
                        this._dungeon.grid[y][x].locked = false;
                    }
                }
            }
        }
    },

    complete: function() {
        var d = this._dungeon;
        if (!d) return { gold: 0, exp: 0 };
        var gold = d.monstersKilled * 35 + d.chestsOpened * 25 + 30;
        var exp = d.monstersKilled * 30 + d.chestsOpened * 20 + 20;
        Sherwood.addResource('gold', gold);
        Sherwood.addResource('silver', gold * 2);
        Sherwood.addExp(exp);

        // Сохраняем прогресс для любого уровня
        var prog = this._progress[d.id] || { level: 1 };
        if (d.level >= prog.level) {
            prog.level = Math.min(8, d.level + 1);
        }
        this._progress[d.id] = prog;
        localStorage.setItem('sherwood_dungeon_progress', JSON.stringify(this._progress));

        this._dungeon = null;
        return { gold: gold, exp: exp };
    },

    leave: function() {
        this._dungeon = null;
    }
};

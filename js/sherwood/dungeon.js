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
        }, 90 * 60 * 1000);
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

    // Лабиринт через backtracking
    function carve(x, y) {
        var dirs = [[0,-2],[0,2],[-2,0],[2,0]];
        dirs.sort(function() { return Math.random() - 0.5; });
        
        for (var i = 0; i < dirs.length; i++) {
            var nx = x + dirs[i][0], ny = y + dirs[i][1];
            if (nx > 0 && nx < size-1 && ny > 0 && ny < size-1 && grid[ny][nx].type === this.TILE.WALL) {
                grid[ny][nx].type = this.TILE.EMPTY;
                grid[y + dirs[i][1]/2][x + dirs[i][0]/2].type = this.TILE.EMPTY;
                carve.call(this, nx, ny);
            }
        }
    }

    var startX = 1, startY = 1;
    if (startX % 2 === 0) startX++;
    if (startY % 2 === 0) startY++;
    grid[startY][startX].type = this.TILE.EMPTY;
    carve.call(this, startX, startY);

    // Добавляем тупики и ответвления
    var empties = [];
    for (var y = 1; y < size-1; y++) {
        for (var x = 1; x < size-1; x++) {
            if (grid[y][x].type === this.TILE.EMPTY) {
                empties.push({x: x, y: y});
            }
        }
    }
    
    // Дополнительные проходы для нелинейности
    var extraPassages = Math.floor(empties.length * 0.15);
    for (var i = 0; i < extraPassages; i++) {
        var idx = Math.floor(Math.random() * empties.length);
        var cell = empties[idx];
        var dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        dirs.sort(function() { return Math.random() - 0.5; });
        for (var d = 0; d < dirs.length; d++) {
            var nx = cell.x + dirs[d][0], ny = cell.y + dirs[d][1];
            var nx2 = cell.x + dirs[d][0]*2, ny2 = cell.y + dirs[d][1]*2;
            if (nx2 > 0 && nx2 < size-1 && ny2 > 0 && ny2 < size-1 && grid[ny2][nx2].type === this.TILE.EMPTY && grid[ny][nx].type === this.TILE.WALL) {
                grid[ny][nx].type = this.TILE.EMPTY;
                break;
            }
        }
    }

    // Обновляем список пустых клеток
    empties = [];
    for (var y = 1; y < size-1; y++) {
        for (var x = 1; x < size-1; x++) {
            if (grid[y][x].type === this.TILE.EMPTY) {
                empties.push({x: x, y: y});
            }
        }
    }

    // Спавн
    var spawnX = startX, spawnY = startY;
    grid[spawnY][spawnX].type = this.TILE.SPAWN;
    grid[spawnY][spawnX].open = true;

    // Убираем спавн из списка
    empties = empties.filter(function(e) { return !(e.x === spawnX && e.y === spawnY); });
    empties.sort(function() { return Math.random() - 0.5; });

    var monsters = {
        forest: { easy: ['image (1).png','image (3).png','image (74).png'], medium: ['image (9).png','image (29).png','image (75).png'], boss: 'image (15).png' },
        swamp: { easy: ['image (12).png','image (13).png','image (59).png'], medium: ['image (14).png','image (16).png','image (52).png'], boss: 'image (54).png' },
        cave: { easy: ['image (32).png','image (35).png','image (10).png'], medium: ['image (33).png','image (36).png','image (49).png'], boss: 'image (34).png' }
    };
    var pool = monsters[dungeonId] || monsters['forest'];
    var monList = level <= 3 ? pool.easy : pool.medium;
    var monsterCount = 10;
    var minToKill = 10;

    var placedMonsters = 0;
    var monsterCells = [];
    for (var i = 0; i < empties.length && placedMonsters < monsterCount; i++) {
        var cell = empties[i];
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

    var specials = [
        { type: this.TILE.POTION, count: 5, prop: 'potion' },
        { type: this.TILE.CAULDRON, count: 4, prop: 'cauldron' },
        { type: this.TILE.ALTAR, count: 4, prop: 'altar' }
    ];
    for (var t = 0; t < specials.length; t++) {
        var st = specials[t];
        var placed = 0;
        for (var i = 0; i < empties.length && placed < st.count; i++) {
            var cell = empties[i];
            if (cell.used) continue;
            if (Math.abs(cell.x - spawnX) + Math.abs(cell.y - spawnY) < 2) continue;
            grid[cell.y][cell.x].type = st.type;
            grid[cell.y][cell.x][st.prop] = true;
            cell.used = true;
            placed++;
        }
    }

    // Выход — самая дальняя точка от спавна
    var exitCell = null;
    var maxDist = 0;
    for (var i = 0; i < empties.length; i++) {
        var cell = empties[i];
        if (cell.used) continue;
        var dist = Math.abs(cell.x - spawnX) + Math.abs(cell.y - spawnY);
        if (dist > maxDist) {
            maxDist = dist;
            exitCell = cell;
        }
    }
    if (exitCell) {
        grid[exitCell.y][exitCell.x].type = this.TILE.EXIT;
        grid[exitCell.y][exitCell.x].exit = true;
        grid[exitCell.y][exitCell.x].locked = true;
    }

    this._dungeon = {
        id: dungeonId, level: level, size: size, grid: grid,
        px: spawnX, py: spawnY,
        monstersKilled: 0, totalMonsters: monsterCount,
        minToKill: minToKill,
        chestsOpened: 0, isBossLevel: (level === 7),
        heroDirection: 'down', isMoving: false,
        chestPlaced: false
    };
    return this._dungeon;
},

killMonster: function() {
    if (!this._dungeon) return;
    var d = this._dungeon;
    d.monstersKilled++;
    
    // Ищем монстра вокруг игрока и на клетке игрока
    var cell = null;
    var checkDirs = [[0,0],[0,-1],[0,1],[-1,0],[1,0]];
    for (var i = 0; i < checkDirs.length; i++) {
        var nx = d.px + checkDirs[i][0], ny = d.py + checkDirs[i][1];
        if (nx >= 0 && nx < d.size && ny >= 0 && ny < d.size && d.grid[ny][nx].monster) {
            cell = d.grid[ny][nx];
            break;
        }
    }
    
    if (cell && cell.monster) {
        cell.monster = false;
        cell.monsterId = null;
        cell.isBoss = false;
        
        // Последний убитый — сундук на ЭТОЙ клетке
        if (d.monstersKilled >= d.totalMonsters) {
            cell.chest = true;
            cell.looted = false;
            cell.type = this.TILE.CHEST;
        } else {
            // Остальные — мешок на клетке монстра
            cell.lootBag = true;
            cell.lootCollected = false;
            cell.type = this.TILE.EMPTY;
        }
    }
    
    // Открываем выход когда все убиты
    if (d.monstersKilled >= d.minToKill) {
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
        
        var prog = this._progress[d.id] || { level: 1 };
        var firstTime = d.level >= prog.level;
        
        var gold = firstTime ? ((d.isBossLevel ? 10 : 3) + d.chestsOpened * 2) : 0;
        var silver = d.monstersKilled * 50 + d.chestsOpened * 50 + 100;
        if (!firstTime) silver += 200;
        
        var exp = d.monstersKilled * 30 + d.chestsOpened * 20 + 20;
        
        Sherwood.addResource('gold', gold);
        Sherwood.addResource('silver', silver);
        Sherwood.addExp(exp);
        
        if (!firstTime) {
            var p = Sherwood.getPlayer();
            if (!p.keset) p.keset = { silver: 0, maxSilver: 2500000, minWithdraw: 10000 };
            var multiplier = d.id === 'cave' ? 1.5 : d.id === 'swamp' ? 1.2 : 1;
            var kesetSilver = Math.floor((d.monstersKilled * 20 + d.chestsOpened * 30) * d.level * multiplier);
            p.keset.silver = Math.min(p.keset.maxSilver, (p.keset.silver || 0) + kesetSilver);
        }
        
        if (typeof Sherwood.Daily !== 'undefined') Sherwood.Daily.updateProgress('dungeon_floors', 1);
        
        if (d.level >= prog.level) prog.level = Math.min(8, d.level + 1);
        this._progress[d.id] = prog;
        localStorage.setItem('sherwood_dungeon_progress', JSON.stringify(this._progress));
        
        if (firstTime && d.level >= 1) {
            var trophyBonuses = {
                forest: { base: { attack: 7, defense: 7, hp: 70 }, name: 'Древний Тотем Владыки Чащи', icon: 'assets/all_trophies/subway_trophies/totem_of_the_forest_core.png' },
                swamp: { base: { attack: 14, defense: 14, hp: 140 }, name: 'Идол Болотного Левиафана', icon: 'assets/all_trophies/subway_trophies/Idol_of_the_sunken_mire.png' },
                cave: { base: { attack: 28, defense: 28, hp: 280 }, name: 'Сердце Пещерного Исполина', icon: 'assets/all_trophies/subway_trophies/heart_of_the_crystal_abyss.png' }
            };
            var tb = trophyBonuses[d.id];
            if (tb && typeof Sherwood.addTrophy === 'function') {
                var newLevel = prog.level - 1;
                if (newLevel >= 1 && newLevel <= 7) {
                    var bonus = {
                        attack: tb.base.attack * newLevel,
                        defense: tb.base.defense * newLevel,
                        hp: tb.base.hp * newLevel
                    };
                    Sherwood.addTrophy('dungeon_' + d.id + '_' + newLevel, tb.name + ' (Череп ' + newLevel + ')', bonus, tb.icon, 'dungeon');
                }
            }
        }
        
        this._dungeon = null;
        return { gold: gold, silver: silver, exp: exp };
    },

    leave: function() { this._dungeon = null; }
};

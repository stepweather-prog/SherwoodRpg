/**
 * Sherwood Dungeon — Единый файл (Логика + 3D рендер)
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

// ============================================================
//  Sherwood.Dungeon — ЛОГИКА И ГЕНЕРАЦИЯ
// ============================================================
Sherwood.Dungeon = {
    TILE: { WALL: 0, EMPTY: 1, MONSTER: 2, CHEST: 3, BOSS: 4, SPAWN: 5, EXIT: 6, ALTAR: 7, CAULDRON: 8, POTION: 9 },
    _dungeon: null,
    _ticketTimer: null,
    _autoFightTimer: null,
    _autoFightActive: false,
    _autoFightEndTime: 0,
    _autoFightDungeonId: null,
    _autoFightLevel: 0,

    BEASTS: {
        forest: {
            1: { normal: ['plague_crow.png','bone_vulture.png','executioner_crow.png','plague_pixie.png','putrid_sprite.png'], boss: 'forest_strangler.png', stats: { atk: 3500, def: 2500, hp: 6000 } },
            2: { normal: ['warped_imp.png','bristle_boar.png','quill_beast.png','grave_borer.png','acid_devourer.png'], boss: 'shard_back.png', stats: { atk: 4200, def: 3200, hp: 10000 } },
            3: { normal: ['bone_borer.png','bark_beetle.png','blight_beetle_warden.png','armored_beetle.png','blighted_werewolf.png'], boss: 'blight_lord_beetle.png', stats: { atk: 5000, def: 4000, hp: 15000 } },
            4: { normal: ['blight_alpha.png','yew_blight_wolf.png','swamp_slugmouth.png','swamp_gorgymouth.png','swamp_drowner.png','bog_brute.png'], boss: null, stats: { atk: 6000, def: 5000, hp: 22000 } },
            5: { normal: ['blighted_oak_golem.png','oak_golem.png','twigtangle.png','woodland_terror.png','leshy.png'], boss: 'root_executioner.png', stats: { atk: 7000, def: 6000, hp: 30000 } },
            6: { normal: ['leshy_servant.png','spectral_stag.png','forest_blight_cyclops.png','blight_troglodyte.png','blight_oozemouth.png'], boss: 'blight_lord_leshy.png', stats: { atk: 8000, def: 7000, hp: 40000 } }
        },
        swamp: {
            1: { normal: ['bog_trapper.png','blight_spitter.png','swamp_spider.png','ocular_arachnid.png','blight_horn_worm.png'], boss: 'searing_arachnid.png', stats: { atk: 8500, def: 7000, hp: 50000 } },
            2: { normal: ['swamp_centipede.png','water_hag.png','marsh_witch.png','blight_snail.png','ancient_blight_snail.png'], boss: 'sherwood_lizard.png', stats: { atk: 9500, def: 8000, hp: 70000 } },
            3: { normal: ['peat_lord.png','lost_maiden.png','bog_witch.png','swamp_kikimora.png','blight_boletus.png'], boss: 'swamp_vodyanoy.png', stats: { atk: 10500, def: 9000, hp: 95000 } },
            4: { normal: ['swamp_drake.png','blight_cerberus.png','putrid_wolf.png','ripper_wolf.png','blight_fox.png'], boss: 'fox_pack_lord.png', stats: { atk: 11500, def: 10000, hp: 125000 } },
            5: { normal: ['swamp_viper.png','putrid_rat.png','oppressor_firefly.png','executioner_cricket.png','thorn_moth.png'], boss: 'plague_bat.png', stats: { atk: 12500, def: 11000, hp: 160000 } },
            6: { normal: ['ash_stalker.png','ash_assassin.png','bone_keeper.png','blight_blade.png','ash_wraith.png'], boss: 'ash_overlord.png', stats: { atk: 13500, def: 12000, hp: 200000 } }
        },
        cave: {
            1: { normal: ['basalt_devourer.png','grotto_brute.png','cave_watcher.png','runic_sentinel.png','ancient_watcher.png'], boss: 'lost_treasure_hunter.png', stats: { atk: 15000, def: 13000, hp: 150000 } },
            2: { normal: ['blight_moss_ogre.png','warped_worm.png','grotto_slug.png','underground_terror.png','shadow_maiden.png'], boss: 'cursed_priestess.png', stats: { atk: 17000, def: 15000, hp: 250000 } },
            3: { normal: ['root_daughter.png','bone_arachnid.png','necromantic_arachnid.png','animated_yew.png','rusty_servant.png'], boss: 'mistress_of_the_roots.png', stats: { atk: 19000, def: 17000, hp: 400000 } },
            4: { normal: ['tormentor.png','grave_archer.png','rusty_dread.png','chaos_swordsman.png','chaos_knight.png'], boss: 'chaos_lord.png', stats: { atk: 21000, def: 19000, hp: 600000 } },
            5: { normal: ['chaos_harpy.png','blight_kite.png','harpy_chieftain.png','harpy_witch.png','harpy_hatchling.png'], boss: 'lord_of_the_feathered.png', stats: { atk: 23000, def: 21000, hp: 850000 } },
            6: { normal: ['cave_tormentor.png','blight_keeper.png','blight_king.png','underworld_guardian.png','blind_render.png'], boss: 'corruption_raccoon.png', stats: { atk: 25000, def: 23000, hp: 1200000 } }
        }
    },

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;

        if (!p.dungeonProgress) {
            p.dungeonProgress = {
                forest: { level: 1, cups: {} },
                swamp: { level: 1, cups: {} },
                cave: { level: 1, cups: {} }
            };
        }

        for (var id in p.dungeonProgress) {
            if (!p.dungeonProgress[id].cups) p.dungeonProgress[id].cups = {};
            for (var lvl in p.dungeonProgress[id].cups) {
                if (typeof p.dungeonProgress[id].cups[lvl] === 'number') {
                    var count = p.dungeonProgress[id].cups[lvl];
                    p.dungeonProgress[id].cups[lvl] = { count: count, rewardsClaimed: [false, false, false] };
                }
            }
        }

        if (!p.dungeon) {
            p.dungeon = { tickets: 15, maxTickets: 20, ticketTimer: 3600 };
        }
        if (!p.dungeon.maxTickets) p.dungeon.maxTickets = 20;
        if (!p.dungeon.ticketTimer) p.dungeon.ticketTimer = 3600;

        Sherwood.saveGame();

        this._startTicketRegeneration();

        if (p.dungeon && p.dungeon.autoFight) {
            var af = p.dungeon.autoFight;
            if (af.active && af.endTime > Date.now()) {
                this._autoFightActive = true;
                this._autoFightEndTime = af.endTime;
                this._autoFightDungeonId = af.dungeonId;
                this._autoFightLevel = af.level;
                this._startAutoFightTimer();
            } else if (af.active && af.endTime <= Date.now()) {
                this._completeAutoFight(af.dungeonId, af.level);
            }
        }

        console.log('🏚️ Dungeon инициализирован');
    },

    _startTicketRegeneration: function() {
        var self = this;
        if (this._ticketTimer) clearInterval(this._ticketTimer);
        this._ticketTimer = setInterval(function() {
            var p = Sherwood.getPlayer();
            if (p && p.dungeon) {
                if (!p.dungeon.ticketTimer) p.dungeon.ticketTimer = 3600;
                p.dungeon.ticketTimer--;
                if (p.dungeon.ticketTimer <= 0) {
                    if (p.dungeon.tickets < p.dungeon.maxTickets) {
                        p.dungeon.tickets = Math.min(p.dungeon.maxTickets, p.dungeon.tickets + 1);
                    }
                    p.dungeon.ticketTimer = 3600;
                }
                Sherwood.saveGame();
            }
        }, 1000);
    },

    _getProgress: function() {
        var p = Sherwood.getPlayer();
        if (!p) return null;
        if (!p.dungeonProgress) {
            p.dungeonProgress = {
                forest: { level: 1, cups: {} },
                swamp: { level: 1, cups: {} },
                cave: { level: 1, cups: {} }
            };
            Sherwood.saveGame();
        }
        return p.dungeonProgress;
    },

    _saveProgress: function() {
        Sherwood.saveGame();
    },

    _getCurrentCupIndex: function(dungeonId, level) {
        var progress = this._getProgress();
        if (!progress) return 0;
        if (!progress[dungeonId]) return 0;
        if (!progress[dungeonId].cups) return 0;
        var cupData = progress[dungeonId].cups[level];
        if (!cupData) return 0;
        return Math.min(cupData.count || 0, 2);
    },

    _getCupDifficulty: function(cupIndex) {
        return {
            monsterCount: 10 + (cupIndex * 3),
            minToKill: 10 + (cupIndex * 2),
            chestCount: 1 + cupIndex,
            potionCount: 5 + cupIndex,
            cauldronCount: 4 + cupIndex,
            altarCount: 4 + cupIndex
        };
    },

    _getCupReward: function(dungeonId, level, cupIndex) {
        var baseExp = 300 + (level * 200);
        var baseSilver = 50 + (level * 50);
        var baseGold = 10 + (level * 5);
        var cupMult = 1 + (cupIndex * 0.5);
        return {
            exp: Math.floor(baseExp * cupMult),
            silver: Math.floor(baseSilver * cupMult),
            gold: Math.floor(baseGold * cupMult)
        };
    },

    _getFarmReward: function(d) {
        return {
            exp: d.monstersKilled * 10 + d.chestsOpened * 5,
            gold: 1 + Math.floor(Math.random() * 3),
            silver: d.monstersKilled * 20 + d.chestsOpened * 20
        };
    },

    _addCup: function(dungeonId, level) {
        var progress = this._getProgress();
        if (!progress) return;

        if (!progress[dungeonId]) {
            progress[dungeonId] = { level: 1, cups: {} };
        }
        if (!progress[dungeonId].cups) {
            progress[dungeonId].cups = {};
        }
        if (!progress[dungeonId].cups[level]) {
            progress[dungeonId].cups[level] = { count: 0, rewardsClaimed: [false, false, false] };
        }

        var cupData = progress[dungeonId].cups[level];
        if (cupData.count < 3) {
            cupData.count++;
            cupData.rewardsClaimed[cupData.count - 1] = true;
            this._saveProgress();
        }
    },

    getAvailable: function() {
        var progress = this._getProgress();
        if (!progress) return {};

        var list = {};
        var duns = {
            forest: { name: 'Проклятая чаща', bg: 'assets/backgrounds/underground_1_floor_1.jpg', tiles: 'dungeon1', ext: '.jpeg', requiredDungeon: null, requiredCups: 0 },
            swamp: { name: 'Первородное болото', bg: 'assets/backgrounds/underground_2_floor_1.jpeg', tiles: 'dungeon2', ext: '.png', requiredDungeon: 'forest', requiredCups: 3 },
            cave: { name: 'Базальтовый грот', bg: 'assets/backgrounds/underground_3_floor_1.jpeg', tiles: 'dungeon3', ext: '.png', requiredDungeon: 'swamp', requiredCups: 3 }
        };

        for (var id in duns) {
            var dd = duns[id];
            var prog = progress[id] || { level: 1, cups: {} };
            var isUnlocked = true;

            if (dd.requiredDungeon) {
                var reqProg = progress[dd.requiredDungeon] || { level: 1, cups: {} };
                var lastLevel = reqProg.level > 1 ? reqProg.level - 1 : 1;
                var lastCups = reqProg.cups[lastLevel] ? (reqProg.cups[lastLevel].count || 0) : 0;
                if (lastLevel < 6 || lastCups < dd.requiredCups) {
                    isUnlocked = false;
                }
            }

            list[id] = {
                id: id,
                name: dd.name,
                bg: dd.bg,
                tiles: dd.tiles,
                ext: dd.ext,
                level: prog.level,
                cups: prog.cups || {},
                unlocked: isUnlocked
            };
        }

        return list;
    },

    getDungeon: function() {
        return this._dungeon;
    },

    generate: function(dungeonId, level) {
        var p = Sherwood.getPlayer();
        if (!p) return null;

        var bagTickets = 0;
        try {
            bagTickets = Sherwood.Bag.getResource('entranceTickets') || 0;
        } catch(e) {
            bagTickets = 0;
        }

        var dungeonTickets = (p.dungeon && p.dungeon.tickets) ? p.dungeon.tickets : 0;

        if (bagTickets <= 0 && dungeonTickets <= 0) {
            return null;
        }

        if (bagTickets > 0) {
            try {
                Sherwood.Bag.spendResource('entranceTickets', 1);
            } catch(e) {
                if (dungeonTickets > 0) {
                    p.dungeon.tickets--;
                } else {
                    return null;
                }
            }
        } else {
            p.dungeon.tickets--;
        }

        Sherwood.saveGame();

        var size = 14;
        var grid = [];
        for (var y = 0; y < size; y++) {
            grid[y] = [];
            for (var x = 0; x < size; x++) {
                grid[y][x] = { type: this.TILE.WALL, open: false, isPath: false };
            }
        }

        var self = this;

        function carve(x, y) {
            grid[y][x].type = self.TILE.EMPTY;

            var dirs = [[0,-2],[0,2],[-2,0],[2,0]];
            for (var i = dirs.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var temp = dirs[i];
                dirs[i] = dirs[j];
                dirs[j] = temp;
            }

            for (var i = 0; i < dirs.length; i++) {
                var nx = x + dirs[i][0];
                var ny = y + dirs[i][1];

                if (nx > 0 && nx < size-1 && ny > 0 && ny < size-1 && grid[ny][nx].type === self.TILE.WALL) {
                    grid[ny][nx].type = self.TILE.EMPTY;
                    grid[y + dirs[i][1]/2][x + dirs[i][0]/2].type = self.TILE.EMPTY;
                    carve(nx, ny);
                }
            }
        }

        var startX = 1, startY = 1;
        carve(startX, startY);

        for (var y = 1; y < size-1; y++) {
            for (var x = 1; x < size-1; x++) {
                if (grid[y][x].type === self.TILE.EMPTY) {
                    grid[y][x].isPath = true;
                    grid[y][x].type = self.TILE.WALL;
                    grid[y][x].open = false;
                }
            }
        }

        var empties = [];
        for (var y = 1; y < size-1; y++) {
            for (var x = 1; x < size-1; x++) {
                if (grid[y][x].isPath) empties.push({x: x, y: y});
            }
        }

        var spawnX = startX, spawnY = startY;
        grid[spawnY][spawnX].type = self.TILE.SPAWN;
        grid[spawnY][spawnX].open = true;
        grid[spawnY][spawnX].isPath = true;

        empties = empties.filter(function(e) { return !(e.x === spawnX && e.y === spawnY); });
        empties.sort(function() { return Math.random() - 0.5; });

        var cupIndex = this._getCurrentCupIndex(dungeonId, level);
        var difficulty = this._getCupDifficulty(cupIndex);

        var monsterCount = difficulty.monsterCount;
        var minToKill = difficulty.minToKill;

        var beastData = this.BEASTS[dungeonId] || this.BEASTS['forest'];
        var floorData = beastData[level] || beastData[1];
        var monList = floorData.normal || ['plague_crow.png'];
        var bossImage = floorData.boss || null;
        var monsterStats = floorData.stats || { atk: 100, def: 50, hp: 500 };

        var placedMonsters = 0;
        var monsterCells = [];

        for (var i = 0; i < empties.length && placedMonsters < monsterCount; i++) {
            var cell = empties[i];
            if (Math.abs(cell.x - spawnX) + Math.abs(cell.y - spawnY) < 3) continue;

            var tooClose = false;
            for (var m = 0; m < monsterCells.length; m++) {
                if (Math.abs(cell.x - monsterCells[m].x) + Math.abs(cell.y - monsterCells[m].y) < 2) {
                    tooClose = true;
                    break;
                }
            }

            if (!tooClose) {
                grid[cell.y][cell.x].type = self.TILE.MONSTER;
                grid[cell.y][cell.x].monster = true;
                grid[cell.y][cell.x].monsterId = monList[Math.floor(Math.random() * monList.length)];
                grid[cell.y][cell.x].monsterStats = {
                    atk: monsterStats.atk,
                    def: monsterStats.def,
                    hp: monsterStats.hp
                };
                monsterCells.push(cell);
                cell.used = true;
                placedMonsters++;
            }
        }

        if (bossImage) {
            var farthestCell = null;
            var maxDist = 0;

            for (var bi = 0; bi < empties.length; bi++) {
                var bCell = empties[bi];
                if (bCell.used) continue;
                var bDist = Math.abs(bCell.x - spawnX) + Math.abs(bCell.y - spawnY);
                if (bDist > maxDist) {
                    maxDist = bDist;
                    farthestCell = bCell;
                }
            }

            if (farthestCell) {
                grid[farthestCell.y][farthestCell.x].type = self.TILE.BOSS;
                grid[farthestCell.y][farthestCell.x].monster = true;
                grid[farthestCell.y][farthestCell.x].monsterId = bossImage;
                grid[farthestCell.y][farthestCell.x].isBoss = true;
                grid[farthestCell.y][farthestCell.x].monsterStats = {
                    atk: monsterStats.atk * 1.5,
                    def: monsterStats.def * 1.5,
                    hp: monsterStats.hp * 2
                };
                farthestCell.used = true;
            }
        }

        var specials = [
            { type: self.TILE.POTION, count: difficulty.potionCount, prop: 'potion' },
            { type: self.TILE.CAULDRON, count: difficulty.cauldronCount, prop: 'cauldron' },
            { type: self.TILE.ALTAR, count: difficulty.altarCount, prop: 'altar' }
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
            grid[exitCell.y][exitCell.x].type = self.TILE.EXIT;
            grid[exitCell.y][exitCell.x].exit = true;
            grid[exitCell.y][exitCell.x].locked = true;
        }

        this._dungeon = {
            id: dungeonId,
            level: level,
            size: size,
            grid: grid,
            px: spawnX,
            py: spawnY,
            monstersKilled: 0,
            totalMonsters: monsterCount + (bossImage ? 1 : 0),
            minToKill: minToKill,
            chestsOpened: 0,
            isBossLevel: (level === 6),
            heroDirection: 'down',
            isMoving: false,
            chestPlaced: false,
            bossImage: bossImage,
            collectedLoot: []
        };

        return this._dungeon;
    },

    move: function(tx, ty) {
        var d = this._dungeon;
        if (!d) return { ok: false };

        var cell = d.grid[ty][tx];
        if (!cell) return { ok: false };
        if (!cell.isPath) return { ok: false };

        cell.open = true;
        cell.type = this.TILE.EMPTY;
        d.px = tx;
        d.py = ty;

        if (cell.monster) {
            return {
                ok: true,
                type: 'battle',
                monsterId: cell.monsterId,
                monsterStats: cell.monsterStats,
                boss: cell.isBoss || false
            };
        }

        if (cell.chest && !cell.looted) return { ok: true, type: 'chest' };
        if (cell.altar && !cell.altarCollected) return { ok: true, type: 'altar' };
        if (cell.cauldron && !cell.cauldronCollected) return { ok: true, type: 'cauldron' };
        if (cell.potion && !cell.potionCollected) return { ok: true, type: 'potion' };
        if (cell.lootBag && !cell.lootCollected) return { ok: true, type: 'lootBag' };

        if (cell.exit) {
            if (cell.locked) {
                if (d.monstersKilled >= d.minToKill) {
                    cell.locked = false;
                    return { ok: true, type: 'exit' };
                }
                return { ok: true, type: 'exit_locked' };
            }
            return { ok: true, type: 'exit' };
        }

        return { ok: true, type: 'move' };
    },

    killMonster: function() {
        if (!this._dungeon) return;

        var d = this._dungeon;
        d.monstersKilled++;

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
            var wasBoss = cell.isBoss;

            cell.monster = false;
            cell.monsterId = null;
            cell.isBoss = false;

            if (wasBoss || d.monstersKilled >= d.totalMonsters) {
                cell.chest = true;
                cell.looted = false;
                cell.type = this.TILE.CHEST;
            } else {
                cell.lootBag = true;
                cell.lootCollected = false;
                cell.type = this.TILE.EMPTY;
            }
        }

        if (typeof Sherwood.Daily !== 'undefined') {
            Sherwood.Daily.updateProgress('dungeon_kills', 1);
        }

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

        if (typeof Sherwood.Daily !== 'undefined') {
            Sherwood.Daily.updateProgress('dungeon_floors', 1);
        }

        var progress = this._getProgress();
        if (!progress) {
            progress = {
                forest: { level: 1, cups: {} },
                swamp: { level: 1, cups: {} },
                cave: { level: 1, cups: {} }
            };
        }
        if (!progress[d.id]) progress[d.id] = { level: 1, cups: {} };
        if (!progress[d.id].cups) progress[d.id].cups = {};

        var cupIndex = this._getCurrentCupIndex(d.id, d.level);

        if (cupIndex < 3) {
            var reward = this._getCupReward(d.id, d.level, cupIndex);
            this._addCup(d.id, d.level);

            Sherwood.addExp(reward.exp);
            Sherwood.addResource('gold', reward.gold);
            Sherwood.addResource('silver', reward.silver);

            var items = d.collectedLoot ? d.collectedLoot.slice() : [];

            var prog = progress[d.id];
            var cups = prog.cups[d.level] ? (prog.cups[d.level].count || 0) : 0;

            if (cups >= 3 && d.level >= prog.level) {
                prog.level = Math.min(7, d.level + 1);
                this._saveProgress();
            }

            if (typeof Sherwood.Daily !== 'undefined') {
                Sherwood.Daily.updateProgress('dungeon_floors', 1);
            }

            var dungeonId = d.id;
            var dungeonLevel = d.level;
            this._dungeon = null;

            return {
                gold: reward.gold,
                silver: reward.silver,
                exp: reward.exp,
                items: items,
                cupEarned: true,
                cupIndex: cupIndex + 1,
                totalCups: 3,
                dungeonId: dungeonId,
                dungeonLevel: dungeonLevel
            };
        } else {
            var farmReward = this._getFarmReward(d);

            Sherwood.addExp(farmReward.exp);
            Sherwood.addResource('gold', farmReward.gold);
            Sherwood.addResource('silver', farmReward.silver);

            var dungeonId = d.id;
            var dungeonLevel = d.level;
            this._dungeon = null;

            return {
                gold: farmReward.gold,
                silver: farmReward.silver,
                exp: farmReward.exp,
                items: [],
                cupEarned: false,
                totalCups: 3,
                dungeonId: dungeonId,
                dungeonLevel: dungeonLevel
            };
        }
    },

    leave: function() {
        this._dungeon = null;
    },

    // ========== АВТОБОЙ ==========
    isAutoFightActive: function() {
        return this._autoFightActive;
    },

    getAutoFightRemaining: function() {
        if (!this._autoFightActive) return 0;
        return Math.max(0, Math.ceil((this._autoFightEndTime - Date.now()) / 1000 / 60));
    },

    _startAutoFightTimer: function() {
        var self = this;
        if (this._autoFightTimer) clearInterval(this._autoFightTimer);
        this._autoFightTimer = setInterval(function() {
            if (self._autoFightActive && Date.now() >= self._autoFightEndTime) {
                self._completeAutoFight(self._autoFightDungeonId, self._autoFightLevel);
            }
        }, 1000);
    },

    _completeAutoFight: function(dungeonId, level) {
        this._autoFightActive = false;
        this._autoFightEndTime = 0;
        if (this._autoFightTimer) clearInterval(this._autoFightTimer);

        var p = Sherwood.getPlayer();
        if (p && p.dungeon) {
            p.dungeon.autoFight = { active: false, endTime: 0, dungeonId: null, level: 0 };
            Sherwood.saveGame();
        }

        if (!this._getProgress()) {
            this._progress = {
                forest: { level: 1, cups: {} },
                swamp: { level: 1, cups: {} },
                cave: { level: 1, cups: {} }
            };
        }

        var cupIndex = this._getCurrentCupIndex(dungeonId, level);
        var gold = 0, silver = 0, exp = 0;

        if (cupIndex < 3) {
            var reward = this._getCupReward(dungeonId, level, cupIndex);
            gold = reward.gold;
            silver = reward.silver;
            exp = reward.exp;
            Sherwood.addResource('gold', gold);
            Sherwood.addResource('silver', silver);
            Sherwood.addExp(exp);
            this._addCup(dungeonId, level);
        } else {
            gold = 1 + Math.floor(Math.random() * 3);
            silver = 20 + Math.floor(Math.random() * 50);
            exp = 50 + Math.floor(Math.random() * 50);
            Sherwood.addResource('gold', gold);
            Sherwood.addResource('silver', silver);
            Sherwood.addExp(exp);
        }

        Sherwood.dispatch({
            type: 'AUTO_FIGHT_COMPLETE',
            payload: {
                dungeonId: dungeonId,
                level: level,
                rewards: { gold: gold, silver: silver, exp: exp }
            }
        });
    },

    startAutoFight: function(dungeonId, level, instant) {
        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };

        if (instant) {
            var tickets = 0;
            try {
                tickets = Sherwood.Bag.getResource('autoFightTickets') || 0;
            } catch(e) {
                tickets = 0;
            }
            if (tickets <= 0) return { success: false, reason: 'Нет тикетов автобоя' };
            Sherwood.Bag.spendResource('autoFightTickets', 1);
            this._completeAutoFight(dungeonId, level);
            return { success: true, instant: true };
        } else {
            if ((p.resources.gold || 0) < 50) return { success: false, reason: 'Нужно 50 золота' };
            p.resources.gold -= 50;
            var endTime = Date.now() + 10 * 60 * 1000;

            this._autoFightActive = true;
            this._autoFightEndTime = endTime;
            this._autoFightDungeonId = dungeonId;
            this._autoFightLevel = level;

            if (!p.dungeon) p.dungeon = { tickets: 5, maxTickets: 5 };
            p.dungeon.autoFight = { active: true, endTime: endTime, dungeonId: dungeonId, level: level };
            Sherwood.saveGame();
            this._startAutoFightTimer();

            return { success: true, instant: false, endTime: endTime };
        }
    },

    // ========== UI ==========
    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Подземка', '🏚️');
            }
            return;
        }
        UI._playSound('click');

        var dungeons = this.getAvailable();
        var p = Sherwood.getPlayer();
        var tickets = p ? (p.dungeon ? p.dungeon.tickets : 0) : 0;
        var maxTickets = p ? (p.dungeon ? p.dungeon.maxTickets : 20) : 20;
        var autoTickets = Sherwood.Bag ? Sherwood.Bag.getResource('autoFightTickets') : 0;
        var afActive = this.isAutoFightActive();

        var h = '<div style="padding:10px;max-width:400px;margin:0 auto;">';

        // Билеты
        h += '<div style="display:flex;justify-content:center;gap:16px;margin-bottom:8px;">';
        h += '<div style="position:relative;width:50px;height:50px;"><img src="assets/interface/resource_key_to_locked_levels.png" style="width:100%;height:100%;object-fit:contain;"><span style="position:absolute;bottom:0;right:0;color:#fff;font-size:0.6em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 5px;border-radius:3px;">' + tickets + '/' + maxTickets + '</span></div>';
        h += '<div style="position:relative;width:50px;height:50px;"><img src="assets/interface/ticket_autofight.png" style="width:100%;height:100%;object-fit:contain;"><span style="position:absolute;bottom:0;right:0;color:#fff;font-size:0.6em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 5px;border-radius:3px;">' + autoTickets + '</span></div>';
        h += '</div>';

        if (afActive) {
            var afRemain = this.getAutoFightRemaining();
            h += '<div style="text-align:center;background:rgba(201,160,64,0.3);border:1px solid #c9a040;border-radius:8px;padding:6px;margin-bottom:10px;"><div style="color:#ffd700;font-size:0.8em;">⚔️ Автобой активен</div><div style="color:#aaa;font-size:0.7em;">Осталось: ' + afRemain + ' мин.</div></div>';
        }

        // Список подземелий
        var dungeonList = [
            { id: 'forest', name: 'Проклятая чаща', icon: 'the_cursed_thicket.png' },
            { id: 'swamp', name: 'Первородное болото', icon: 'primordial_swamp.png' },
            { id: 'cave', name: 'Базальтовый грот', icon: 'basalt_grotto.png' }
        ];

        for (var i = 0; i < dungeonList.length; i++) {
            var dl = dungeonList[i];
            var d = dungeons[dl.id];
            if (!d) continue;

            h += '<div style="text-align:center;margin-bottom:16px;background:rgba(0,0,0,0.3);border-radius:8px;padding:12px;">';
            h += '<div style="color:#e0c080;font-size:1em;font-weight:bold;">' + dl.name + '</div>';
            h += '<img src="assets/dungeon_tiles/visual_dungeon/' + dl.icon + '" style="width:120px;height:120px;object-fit:contain;display:block;margin:0 auto 6px;">';
            h += '<div style="color:#888;font-size:0.7em;">Уровень: ' + d.level + ' | Кубков: ' + Object.keys(d.cups).length + '</div>';
            if (d.unlocked) {
                h += '<button onclick="Sherwood.Dungeon._showLevels(\'' + dl.id + '\')" class="btn btn-gold" style="padding:6px 20px;font-size:0.8em;margin-top:6px;">⚔️ Войти</button>';
            } else {
                h += '<div style="color:#f44336;font-size:0.7em;margin-top:4px;">🔒 Заблокировано</div>';
            }
            h += '</div>';
        }

        h += '</div>';

        UI._openScreenScrollable('🏚️ Подземка', 'dungeon_select', h);
    },

    _showLevels: function(dungeonId) {
        var dungeons = this.getAvailable();
        var d = dungeons[dungeonId];
        if (!d) return;

        var progress = this._getProgress()[dungeonId] || { level: 1, cups: {} };
        var cups = progress.cups || {};

        var dungeonNames = { forest: 'Проклятая чаща', swamp: 'Первородное болото', cave: 'Базальтовый грот' };
        var dungeonIcons = { forest: 'the_cursed_thicket.png', swamp: 'primordial_swamp.png', cave: 'basalt_grotto.png' };

        var h = '<div style="padding:10px;text-align:center;max-width:400px;margin:0 auto;">';
        h += '<img src="assets/dungeon_tiles/visual_dungeon/' + (dungeonIcons[dungeonId] || 'the_cursed_thicket.png') + '" style="width:80px;height:80px;object-fit:contain;display:block;margin:0 auto 8px;">';
        h += '<div style="color:#e0c080;font-size:1em;font-weight:bold;margin-bottom:10px;">' + (dungeonNames[dungeonId] || dungeonId) + '</div>';

        h += '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-width:260px;margin:0 auto;">';
        for (var lvl = 1; lvl <= 6; lvl++) {
            var unlocked = lvl <= progress.level;
            var cupCount = cups[lvl] ? (cups[lvl].count || 0) : 0;

            h += '<div style="text-align:center;">';
            h += '<div style="display:flex;justify-content:center;gap:2px;margin-bottom:2px;min-height:20px;">';
            for (var c = 0; c < 3; c++) {
                if (c < cupCount) {
                    h += '<img src="assets/interface/resource_cup_for_completed_tasks.png" style="width:20px;height:20px;object-fit:contain;">';
                } else {
                    h += '<div style="width:20px;height:20px;"></div>';
                }
            }
            h += '</div>';
            h += '<div onclick="' + (unlocked ? 'Sherwood.Dungeon._showActions(\'' + dungeonId + '\',' + lvl + ')' : '') + '" style="width:80px;height:80px;background:rgba(0,0,0,0.5);border:2px solid ' + (unlocked ? '#c9a040' : '#555') + ';border-radius:8px;cursor:' + (unlocked ? 'pointer' : 'default') + ';display:flex;align-items:center;justify-content:center;position:relative;margin:0 auto;">';
            h += '<span style="font-size:1.5em;font-weight:bold;color:' + (unlocked ? '#c9a040' : '#555') + ';">' + lvl + '</span>';
            h += '</div>';
            h += '</div>';
        }
        h += '</div>';
        h += '</div>';

        UI._openScreenScrollable('🏚️ ' + (dungeonNames[dungeonId] || dungeonId), 'dungeon_select', h);
    },

    _showActions: function(dungeonId, level) {
        var progress = this._getProgress()[dungeonId] || { level: 1, cups: {} };
        var cups = progress.cups || {};
        var cupCount = cups[level] ? (cups[level].count || 0) : 0;
        var maxCups = 3;
        var autoTickets = Sherwood.Bag ? Sherwood.Bag.getResource('autoFightTickets') : 0;

        var h = '<div style="padding:20px;text-align:center;max-width:400px;margin:0 auto;">';
        h += '<div style="color:#e0c080;font-size:1.2em;font-weight:bold;margin-bottom:8px;">Этаж ' + level + '</div>';

        h += '<div style="margin-bottom:12px;">';
        for (var c = 0; c < maxCups; c++) {
            h += '<img src="assets/interface/resource_cup_for_completed_tasks.png" style="width:32px;height:32px;object-fit:contain;margin:0 2px;' + (c >= cupCount ? 'opacity:0.3;' : '') + '">';
        }
        h += '<div style="color:#aaa;font-size:0.7em;">' + cupCount + '/' + maxCups + ' кубков</div>';
        h += '</div>';

        h += '<button onclick="Sherwood.Dungeon._startDungeon(\'' + dungeonId + '\',' + level + ')" class="btn btn-gold" style="padding:10px 30px;font-size:0.9em;width:100%;margin-bottom:6px;">⚔️ Войти вручную</button>';

        if (cupCount >= 1 && cupCount < 3) {
            if (this.isAutoFightActive()) {
                h += '<div style="background:#555;border-radius:8px;padding:8px;color:#999;font-size:0.8em;">Автобой уже активен</div>';
            } else {
                h += '<button onclick="Sherwood.Dungeon._startAutoFight(\'' + dungeonId + '\',' + level + ',false)" class="btn" style="padding:8px;font-size:0.8em;width:100%;margin-bottom:4px;background:#ff9800;">⏳ Автобой (10 мин) — 50 золота</button>';
                if (autoTickets > 0) {
                    h += '<button onclick="Sherwood.Dungeon._startAutoFight(\'' + dungeonId + '\',' + level + ',true)" class="btn btn-success" style="padding:8px;font-size:0.8em;width:100%;">⚡ Мгновенный автобой — 1 тикет (' + autoTickets + ' шт.)</button>';
                } else {
                    h += '<div style="background:#555;border-radius:8px;padding:8px;color:#999;font-size:0.7em;">Мгновенный автобой — нет тикетов</div>';
                }
            }
        }

        h += '</div>';

        UI._openScreenScrollable('🏚️ Этаж ' + level, 'dungeon_select', h);
    },

    _startDungeon: function(id, level) {
        if (!this.generate(id, level)) {
            UI._showToast('❌ Нет билетов!');
            return;
        }
        UI._stopMusic();
        UI._playMusic('dungeon_3');

        if (typeof Sherwood.Dungeon2D5 !== 'undefined') {
            if (!Sherwood.Dungeon2D5._container) {
                Sherwood.Dungeon2D5.init();
            }
            Sherwood.Dungeon2D5.render();
        } else {
            UI._showToast('🏚️ 3D подземка в разработке');
        }
    },

    _startAutoFight: function(dungeonId, level, instant) {
        var r = this.startAutoFight(dungeonId, level, instant);
        if (r.success) {
            if (r.instant) {
                UI._showToast('✅ Автобой завершён!');
                this.showUI();
            } else {
                UI._showToast('⏳ Автобой запущен на 10 минут!');
                this.showUI();
            }
        } else {
            UI._showToast('❌ ' + r.reason);
        }
    }
};

// ============================================================
//  Sherwood.Dungeon2D5 — 3D РЕНДЕР И УПРАВЛЕНИЕ
// ============================================================
Sherwood.Dungeon2D5 = {
    _scene: null,
    _camera: null,
    _renderer: null,
    _group: null,
    _dungeon: null,
    _dir: 0,
    _isMoving: false,
    _fromX: 0,
    _fromY: 0,
    _toX: 0,
    _toY: 0,
    _moveT: 0,
    _renderLoop: null,
    _joystick: null,
    _joystickVideo: null,
    _interactBtn: null,
    _interactBtnImg: null,
    _interactType: null,
    _topPanel: null,
    _exitBtn: null,
    _hpBar: null,
    _killCounter: null,
    _minimap: null,
    _minimapCtx: null,
    _minimapFrame: null,
    _particles: [],
    _brazierVideo: null,
    _brazierTexture: null,
    _brazierCanvas: null,
    _brazierCtx: null,
    _walls: [],
    _floors: [],
    _ceilings: [],
    _images: {},
    _monsterImages: {},
    _cachedMats: {},
    _currentDungeonId: null,
    _particleTexture: null,
    _w: 480,
    _h: 800,
    _container: null,

    init: function() {
        this._container = document.createElement('div');
        this._container.id = 'dungeon2d5-container';
        this._container.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:transparent;';
        document.body.appendChild(this._container);

        this._w = window.innerWidth || 480;
        this._h = window.innerHeight || 800;

        this._setupThree();
        this._setupControls();
        this._loadCommonTextures();
        console.log('🏚️ Dungeon2D5 инициализирован');
    },

    _loadCommonTextures: function() {
        var loader = new THREE.TextureLoader();
        function loadTex(src) {
            var tex = loader.load(src);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            return tex;
        }

        this._images.wall_openable = loadTex('assets/interface/labyrinth_asset.png');
        this._images.potion = loadTex('assets/interface/resource_life_potion.png');
        this._images.loot_bag = loadTex('assets/interface/loot_bag_of_beasts.png');
        this._images.loot_bag_empty = loadTex('assets/interface/empty_bag_of_loot_beasts.png');
        this._images.exit_locked = loadTex('assets/interface/closed_level_lock_icon.png');

        this._brazierVideo = document.createElement('video');
        this._brazierVideo.src = 'assets/animation/stone_brazier_fire.webm';
        this._brazierVideo.loop = true;
        this._brazierVideo.muted = true;
        this._brazierVideo.playsInline = true;
        this._brazierVideo.autoplay = true;
        this._brazierVideo.play().catch(function() {});
    },

    _loadDungeonTextures: function(dungeonId) {
        var loader = new THREE.TextureLoader();
        function loadTex(src) {
            var tex = loader.load(src);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            return tex;
        }

        this._walls = [];
        this._floors = [];
        this._ceilings = [];
        this._cachedMats = {};

        var wallPrefix = '';
        var floorPrefix = '';
        var ceilPrefix = '';
        var altarFile = 'altar_of_the_first_dungeon.png';
        var cauldronFile = 'cauldron_first_dungeon.png';
        var chestLockedFile = 'locked_chest_first_dungeon.png';
        var chestOpenFile = 'open_chest_first_dungeon.png';
        var exitFile = 'exit_completion_dungeon.png';

        if (dungeonId === 'swamp') {
            wallPrefix = 'swamp_';
            floorPrefix = 'swamp_';
            ceilPrefix = 'swamp_';
            altarFile = 'altar_of_the_second_dungeon.png';
            cauldronFile = 'cauldron_of_the_second_dungeon.png';
            chestLockedFile = 'locked_chest_second_dungeon.png';
            chestOpenFile = 'open_chest_of_the_second_dungeon.png';
            exitFile = 'completion_of_the_second_underground_level.png';
        } else if (dungeonId === 'cave') {
            wallPrefix = 'grotto_';
            floorPrefix = 'grotto_';
            ceilPrefix = 'grotto_';
            altarFile = 'the_third_altar_of_the_dungeon.png';
            cauldronFile = 'the_third_cauldron_of_the_dungeon.png';
            chestLockedFile = 'locked_chest_third_dungeon.png';
            chestOpenFile = 'open_chest_third_dungeon.png';
            exitFile = 'completion_of_level_three_subway.png';
        }

        for (var i = 1; i <= 6; i++) {
            this._walls.push(loadTex('assets/dungeon_tiles/visual_dungeon/' + wallPrefix + 'wall_' + i + '.png'));
        }
        for (var i = 1; i <= 6; i++) {
            if (dungeonId === 'forest') {
                this._floors.push(loadTex('assets/dungeon_tiles/dungeon1/' + floorPrefix + 'tiles_' + i + '.png'));
            } else {
                this._floors.push(loadTex('assets/dungeon_tiles/visual_dungeon/' + floorPrefix + 'tiles_' + i + '.png'));
            }
        }
        for (var i = 1; i <= 6; i++) {
            this._ceilings.push(loadTex('assets/dungeon_tiles/visual_dungeon/' + ceilPrefix + 'ceiling_dungeon_' + i + '.png'));
        }

        this._images.altar = loadTex('assets/interface/' + altarFile);
        this._images.cauldron = loadTex('assets/interface/' + cauldronFile);
        this._images.chest_locked = loadTex('assets/interface/' + chestLockedFile);
        this._images.chest_open = loadTex('assets/interface/' + chestOpenFile);
        this._images.exit = loadTex('assets/interface/' + exitFile);
    },

    _setupThree: function() {
        this._scene = new THREE.Scene();
        this._scene.background = null;

        this._camera = new THREE.PerspectiveCamera(70, this._w / this._h, 0.1, 30);
        this._camera.rotation.order = 'YXZ';

        this._renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'low-power',
            alpha: true
        });
        this._renderer.setSize(this._w, this._h);
        this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this._renderer.setClearColor(0x000000, 0);

        if (this._container) {
            this._container.appendChild(this._renderer.domElement);
        }

        this._scene.add(new THREE.AmbientLight(0x664422, 0.8));
        var mainLight = new THREE.DirectionalLight(0xffcc88, 0.9);
        mainLight.position.set(5, 10, 5);
        this._scene.add(mainLight);

        var fillLight = new THREE.DirectionalLight(0x996633, 0.4);
        fillLight.position.set(-5, 2, -5);
        this._scene.add(fillLight);

        this._group = new THREE.Group();
        this._scene.add(this._group);
    },

    _setupControls: function() {
        var self = this;

        this._topPanel = document.createElement('div');
        this._topPanel.style.cssText = 'position:absolute;top:10px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:0 10px;z-index:15;';

        this._exitBtn = document.createElement('button');
        this._exitBtn.style.cssText = 'width:40px;height:40px;background:transparent;border:none;cursor:pointer;';
        this._exitBtn.innerHTML = '<img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;">';
        this._exitBtn.addEventListener('click', function() {
            self.destroy();
            if (typeof UI !== 'undefined' && UI.loadHome) {
                UI.loadHome();
            }
        });
        this._topPanel.appendChild(this._exitBtn);

        this._killCounter = document.createElement('div');
        this._killCounter.style.cssText = 'color:#e0c080;font-size:14px;font-weight:bold;text-shadow:0 0 5px #000;';
        this._killCounter.textContent = '0/0';
        this._topPanel.appendChild(this._killCounter);

        this._hpBar = document.createElement('div');
        this._hpBar.style.cssText = 'position:relative;width:150px;height:30px;';
        this._hpBar.innerHTML = '<img src="assets/interface/life_scale.png" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:0;"><div style="position:absolute;top:6px;left:15px;right:15px;bottom:6px;overflow:hidden;z-index:1;"><div id="hp-fill-2d5" style="background:url(\'assets/interface/life_interface_asset_horizontal_progress_bar.jpeg\') left/auto 100%;height:100%;width:100%;"></div></div><span id="hp-text-2d5" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:12px;z-index:2;font-weight:bold;"></span>';
        this._topPanel.appendChild(this._hpBar);

        if (this._container) {
            this._container.appendChild(this._topPanel);
        }

        this._joystick = document.createElement('div');
        this._joystick.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);width:300px;height:300px;z-index:10;background:url("assets/dungeon_tiles/visual_dungeon/joystick.png") center/contain no-repeat;';

        this._joystickVideo = document.createElement('video');
        this._joystickVideo.src = 'assets/assets2/animation/step_up.webm';
        this._joystickVideo.loop = true;
        this._joystickVideo.muted = true;
        this._joystickVideo.playsInline = true;
        this._joystickVideo.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;object-fit:contain;pointer-events:none;border-radius:50%;';
        this._joystick.appendChild(this._joystickVideo);

        var arrowAreas = [
            { d: 'forward', top: '10%', left: '38%', width: '24%', height: '24%' },
            { d: 'left', top: '38%', left: '10%', width: '24%', height: '24%' },
            { d: 'right', top: '38%', left: '66%', width: '24%', height: '24%' }
        ];

        arrowAreas.forEach(function(a) {
            var btn = document.createElement('button');
            btn.style.cssText = 'position:absolute;top:' + a.top + ';left:' + a.left + ';width:' + a.width + ';height:' + a.height + ';background:rgba(255,215,0,0.1);border:none;cursor:pointer;z-index:12;transition:background 0.1s, transform 0.1s, box-shadow 0.1s;border-radius:50%;box-shadow:0 0 10px rgba(255,215,0,0.2);';

            btn.addEventListener('mousedown', function(e) {
                e.stopPropagation();
                btn.style.background = 'rgba(255,215,0,0.2)';
                btn.style.boxShadow = '0 0 20px rgba(255,215,0,0.4)';
                btn.style.transform = 'scale(0.9)';
                if (a.d === 'forward') self._moveForward();
                else if (a.d === 'left') self._turnLeft();
                else if (a.d === 'right') self._turnRight();
            });

            btn.addEventListener('mouseup', function() {
                btn.style.background = 'rgba(255,215,0,0.1)';
                btn.style.boxShadow = '0 0 10px rgba(255,215,0,0.2)';
                btn.style.transform = 'scale(1)';
            });

            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                btn.style.background = 'rgba(255,215,0,0.2)';
                btn.style.boxShadow = '0 0 20px rgba(255,215,0,0.4)';
                btn.style.transform = 'scale(0.9)';
                if (a.d === 'forward') self._moveForward();
                else if (a.d === 'left') self._turnLeft();
                else if (a.d === 'right') self._turnRight();
            }, { passive: false });

            btn.addEventListener('touchend', function() {
                btn.style.background = 'rgba(255,215,0,0.1)';
                btn.style.boxShadow = '0 0 10px rgba(255,215,0,0.2)';
                btn.style.transform = 'scale(1)';
            });

            self._joystick.appendChild(btn);
        });

        if (this._container) {
            this._container.appendChild(this._joystick);
        }

        this._interactBtn = document.createElement('button');
        this._interactBtn.style.cssText = 'position:absolute;bottom:350px;left:50%;transform:translateX(-50%);width:90px;height:90px;border-radius:50%;background:rgba(0,0,0,0.85);border:3px solid #ffd700;cursor:pointer;display:none;align-items:center;justify-content:center;z-index:11;';
        this._interactBtnImg = document.createElement('img');
        this._interactBtnImg.style.cssText = 'width:64px;height:64px;object-fit:contain;';
        this._interactBtn.appendChild(this._interactBtnImg);
        this._interactBtn.addEventListener('click', function() { self._onInteract(); });

        if (this._container) {
            this._container.appendChild(this._interactBtn);
        }

        this._setupMinimap();

        this._renderer.domElement.addEventListener('click', function(e) { self._handleWallClick(e); });
        this._renderer.domElement.addEventListener('touchend', function(e) {
            if (e.changedTouches && e.changedTouches[0]) {
                self._handleWallClick(e.changedTouches[0]);
            }
        });
    },

    _setupMinimap: function() {
        this._minimap = document.createElement('canvas');
        this._minimap.width = 140;
        this._minimap.height = 140;
        this._minimap.style.cssText = 'position:absolute;top:55px;right:10px;width:140px;height:140px;border-radius:50%;z-index:15;';
        this._minimapCtx = this._minimap.getContext('2d');

        this._minimapFrame = document.createElement('img');
        this._minimapFrame.src = 'assets/interface/visual_resource.png';
        this._minimapFrame.style.cssText = 'position:absolute;top:50px;right:5px;width:150px;height:150px;z-index:16;pointer-events:none;';

        if (this._container) {
            this._container.appendChild(this._minimap);
            this._container.appendChild(this._minimapFrame);
        }
    },

    _isAdjacentToOpen: function(d, col, row) {
        var dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        for (var i = 0; i < dirs.length; i++) {
            var nx = col + dirs[i][0];
            var ny = row + dirs[i][1];
            if (nx >= 0 && nx < d.size && ny >= 0 && ny < d.size) {
                if (d.grid[ny][nx] && d.grid[ny][nx].open) return true;
            }
        }
        return false;
    },

    _updateMinimap: function() {
        if (!this._minimapCtx || !this._dungeon) return;
        var ctx = this._minimapCtx;
        var d = this._dungeon;
        var mapSize = 140;
        var center = mapSize / 2;
        var radius = mapSize / 2 - 4;
        var cellSize = (radius * 2) / d.size;
        ctx.clearRect(0, 0, mapSize, mapSize);
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, mapSize, mapSize);
        var offsetX = center - (d.px * cellSize + cellSize / 2);
        var offsetY = center - (d.py * cellSize + cellSize / 2);
        for (var row = 0; row < d.size; row++) {
            for (var col = 0; col < d.size; col++) {
                var cell = d.grid[row][col];
                var x = col * cellSize + offsetX;
                var y = row * cellSize + offsetY;
                if (x + cellSize < 0 || x > mapSize || y + cellSize < 0 || y > mapSize) continue;
                if (cell && cell.open) {
                    ctx.fillStyle = '#4a4a4a';
                    ctx.fillRect(x, y, cellSize, cellSize);
                } else if (cell && cell.isPath && this._isAdjacentToOpen(d, col, row)) {
                    ctx.fillStyle = '#8b6914';
                    ctx.fillRect(x, y, cellSize, cellSize);
                } else {
                    ctx.fillStyle = '#1a1a1a';
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }
        }
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(center, center, cellSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    _handleWallClick: function(e) {
        if (this._isMoving) return;
        var d = this._dungeon;
        if (!d) return;
        var rect = this._renderer.domElement.getBoundingClientRect();
        var mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        var mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this._camera);
        var intersects = raycaster.intersectObjects(this._group.children, false);
        for (var i = 0; i < intersects.length; i++) {
            var obj = intersects[i].object;
            if (obj.userData && obj.userData.openable) {
                var dist = Math.abs(obj.userData.gridX - d.px) + Math.abs(obj.userData.gridY - d.py);
                if (dist === 1) this._openWall(obj.userData.gridX, obj.userData.gridY);
                break;
            }
        }
    },

    _openWall: function(gridX, gridY) {
        var d = this._dungeon;
        if (!d) return;
        var cell = d.grid[gridY][gridX];
        if (!cell || !cell.isPath) return;
        cell.open = true;
        cell.type = 1;
        if (cell.monster) {
            this._buildMesh();
            this._updateCamera();
            this._renderer.render(this._scene, this._camera);
            if (typeof Sherwood.Combat !== 'undefined' && Sherwood.Combat.start) {
                Sherwood.Combat.start(cell.monsterId, cell.isBoss || false, 'dungeon');
            }
        } else {
            this._buildMesh();
            this._updateMinimap();
            this._checkInteract();
        }
    },

    _moveForward: function() {
        if (this._isMoving) return;
        var d = this._dungeon;
        if (!d) return;
        var dx = 0, dy = 0;
        if (this._dir === 0) dy = -1;
        else if (this._dir === 1) dx = 1;
        else if (this._dir === 2) dy = 1;
        else dx = -1;
        var nx = d.px + dx;
        var ny = d.py + dy;
        if (nx < 0 || nx >= d.size || ny < 0 || ny >= d.size) return;
        var cell = d.grid[ny][nx];
        if (!cell || !cell.isPath) return;
        if (!cell.open) { cell.open = true; cell.type = 1; }
        this._fromX = d.px;
        this._fromY = d.py;
        this._toX = nx;
        this._toY = ny;
        this._moveT = 0;
        this._isMoving = true;

        if (this._joystickVideo) {
            this._joystickVideo.currentTime = 0;
            this._joystickVideo.play().catch(function() {});
        }
    },

    _turnLeft: function() {
        if (this._isMoving) return;
        this._dir = (this._dir + 3) % 4;
        this._updateCamera();
        this._buildMesh();
        this._updateMinimap();
    },

    _turnRight: function() {
        if (this._isMoving) return;
        this._dir = (this._dir + 1) % 4;
        this._updateCamera();
        this._buildMesh();
        this._updateMinimap();
    },

    _onInteract: function() {
        if (!this._interactType) return;
        var d = this._dungeon;
        if (!d) return;
        var cell = d.grid[d.py][d.px];
        if (!cell) return;
        switch(this._interactType) {
            case 'lootBag': if (cell.lootBag && !cell.lootCollected) this._collectLootBag(); break;
            case 'chest': if (cell.chest && !cell.looted) this._collectChest(); break;
            case 'altar': if (cell.altar && !cell.altarCollected) this._collectAltar(); break;
            case 'cauldron': if (cell.cauldron && !cell.cauldronCollected) this._collectCauldron(); break;
            case 'potion': if (cell.potion && !cell.potionCollected) this._collectPotion(); break;
            case 'exit': if (cell.exit && !cell.locked) this._completeDungeon(); break;
        }
        this._interactType = null;
        this._interactBtn.style.display = 'none';
        this._buildMesh();
        this._updateMinimap();
        this._checkInteract();
    },

    _collectLootBag: function() {
        var d = this._dungeon;
        if (!d) return;
        var cell = d.grid[d.py][d.px];
        if (!cell || !cell.lootBag || cell.lootCollected) return;
        cell.lootCollected = true;
        if (typeof Sherwood.Bag !== 'undefined' && Sherwood.Bag.addLoot) {
            Sherwood.Bag.addLoot({
                silver: 50 + Math.floor(Math.random() * 100),
                gold: 5 + Math.floor(Math.random() * 20),
                items: []
            });
        }
        if (typeof UI !== 'undefined' && UI._showToast) {
            UI._showToast('💰 Найден мешок с лутом!');
        }
    },

    _collectChest: function() {
        var d = this._dungeon;
        if (!d) return;
        var cell = d.grid[d.py][d.px];
        if (!cell || !cell.chest || cell.looted) return;
        cell.looted = true;
        if (typeof Sherwood.Bag !== 'undefined' && Sherwood.Bag.addLoot) {
            Sherwood.Bag.addLoot({
                silver: 100 + Math.floor(Math.random() * 200),
                gold: 10 + Math.floor(Math.random() * 50),
                items: []
            });
        }
        if (typeof UI !== 'undefined' && UI._showToast) {
            UI._showToast('📦 Сундук открыт!');
        }
    },

    _collectAltar: function() {
        var d = this._dungeon;
        if (!d) return;
        var cell = d.grid[d.py][d.px];
        if (!cell || !cell.altar || cell.altarCollected) return;
        cell.altarCollected = true;
        if (typeof Sherwood.Bag !== 'undefined' && Sherwood.Bag.addLoot) {
            Sherwood.Bag.addLoot({
                silver: 200 + Math.floor(Math.random() * 300),
                exp: 50 + Math.floor(Math.random() * 100)
            });
        }
        if (typeof UI !== 'undefined' && UI._showToast) {
            UI._showToast('✨ Алтарь благословил тебя!');
        }
    },

    _collectCauldron: function() {
        var d = this._dungeon;
        if (!d) return;
        var cell = d.grid[d.py][d.px];
        if (!cell || !cell.cauldron || cell.cauldronCollected) return;
        cell.cauldronCollected = true;
        if (typeof Sherwood.Bag !== 'undefined' && Sherwood.Bag.addLoot) {
            Sherwood.Bag.addLoot({
                silver: 150 + Math.floor(Math.random() * 250),
                gold: 5 + Math.floor(Math.random() * 15)
            });
        }
        if (typeof UI !== 'undefined' && UI._showToast) {
            UI._showToast('🧪 Котёл с зельем!');
        }
    },

    _collectPotion: function() {
        var d = this._dungeon;
        if (!d) return;
        var cell = d.grid[d.py][d.px];
        if (!cell || !cell.potion || cell.potionCollected) return;
        cell.potionCollected = true;
        var p = Sherwood.getPlayer();
        if (p && p.stats) {
            var heal = Math.floor(p.stats.maxHp * 0.2);
            p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
            Sherwood.saveGame();
        }
        if (typeof UI !== 'undefined' && UI._showToast) {
            UI._showToast('💚 Зелье восстановило HP!');
        }
    },

    _completeDungeon: function() {
        if (typeof Sherwood.Dungeon !== 'undefined' && Sherwood.Dungeon.complete) {
            var reward = Sherwood.Dungeon.complete();
            if (typeof Sherwood.Bag !== 'undefined' && Sherwood.Bag.addLoot) {
                Sherwood.Bag.addLoot(reward);
            }
        }
        this.destroy();
        if (typeof UI !== 'undefined' && UI.loadHome) {
            UI.loadHome();
        }
        if (typeof UI !== 'undefined' && UI._showToast) {
            UI._showToast('🏆 Подземка пройдена!');
        }
    },

    _checkInteract: function() {
        var d = this._dungeon;
        if (!d) return;
        var cell = d.grid[d.py][d.px];
        if (!cell) return;
        var type = null, icon = null;
        if (cell.lootBag && !cell.lootCollected) { type = 'lootBag'; icon = this._images.loot_bag; }
        else if (cell.chest && !cell.looted) { type = 'chest'; icon = this._images.chest_locked; }
        else if (cell.altar && !cell.altarCollected) { type = 'altar'; icon = this._images.altar; }
        else if (cell.cauldron && !cell.cauldronCollected) { type = 'cauldron'; icon = this._images.cauldron; }
        else if (cell.potion && !cell.potionCollected) { type = 'potion'; icon = this._images.potion; }
        else if (cell.exit && !cell.locked) { type = 'exit'; icon = this._images.exit; }
        if (type && icon && icon.image) {
            this._interactType = type;
            this._interactBtnImg.src = icon.image.src;
            this._interactBtn.style.display = 'flex';
        } else {
            this._interactType = null;
            this._interactBtn.style.display = 'none';
        }
    },

    _createParticles: function() {
        var d = this._dungeon;
        if (!d) return;
        var center = Math.floor(d.size / 2);

        if (!this._particleTexture) {
            var particleCanvas = document.createElement('canvas');
            particleCanvas.width = 32;
            particleCanvas.height = 32;
            var pctx = particleCanvas.getContext('2d');
            var gradient = pctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            gradient.addColorStop(0, 'rgba(255,255,200,1)');
            gradient.addColorStop(0.3, 'rgba(255,220,100,0.8)');
            gradient.addColorStop(1, 'rgba(255,200,50,0)');
            pctx.fillStyle = gradient;
            pctx.fillRect(0, 0, 32, 32);
            this._particleTexture = new THREE.CanvasTexture(particleCanvas);
        }

        for (var row = 0; row < d.size; row++) {
            for (var col = 0; col < d.size; col++) {
                var cell = d.grid[row][col];
                if (!cell || !cell.open) continue;
                var hasItem = (cell.chest && !cell.looted) || (cell.lootBag && !cell.lootCollected) ||
                    (cell.altar && !cell.altarCollected) || (cell.cauldron && !cell.cauldronCollected) ||
                    (cell.potion && !cell.potionCollected) || (cell.exit && cell.locked);
                if (hasItem) {
                    for (var i = 0; i < 3; i++) {
                        var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
                            map: this._particleTexture,
                            transparent: true,
                            opacity: 0.8,
                            blending: THREE.AdditiveBlending,
                            depthWrite: false
                        }));
                        sprite.position.set(
                            col - center + (Math.random() - 0.5) * 0.4,
                            0.1 + Math.random() * 0.4,
                            row - center + (Math.random() - 0.5) * 0.4
                        );
                        sprite.scale.set(0.06, 0.06, 1);
                        sprite.userData = {
                            baseY: 0.1 + Math.random() * 0.3,
                            speed: 0.5 + Math.random() * 0.8,
                            phase: Math.random() * Math.PI * 2,
                            offsetX: (Math.random() - 0.5) * 0.4,
                            offsetZ: (Math.random() - 0.5) * 0.4,
                            gridX: col,
                            gridY: row
                        };
                        this._group.add(sprite);
                        this._particles.push(sprite);
                    }
                }
            }
        }
    },

    _updateParticles: function(time) {
        var d = this._dungeon;
        if (!d) return;
        var center = Math.floor(d.size / 2);
        for (var i = 0; i < this._particles.length; i++) {
            var p = this._particles[i];
            if (!p.visible) continue;
            var cell = d.grid[p.userData.gridY][p.userData.gridX];
            var hasItem = cell && ((cell.chest && !cell.looted) || (cell.lootBag && !cell.lootCollected) ||
                (cell.altar && !cell.altarCollected) || (cell.cauldron && !cell.cauldronCollected) ||
                (cell.potion && !cell.potionCollected) || (cell.exit && cell.locked));
            if (!hasItem) { p.visible = false; continue; }
            p.position.y = p.userData.baseY + Math.sin(time * p.userData.speed + p.userData.phase) * 0.12;
            p.position.x = p.userData.gridX - center + p.userData.offsetX + Math.sin(time * 0.4 + p.userData.phase) * 0.06;
            p.position.z = p.userData.gridY - center + p.userData.offsetZ + Math.cos(time * 0.4 + p.userData.phase) * 0.06;
        }
    },

    _processBrazierFrame: function() {
        var self = this;

        function processFrame() {
            if (!self._brazierVideo || !self._brazierCtx) return;
            if (self._brazierVideo.readyState >= 2) {
                self._brazierCtx.drawImage(self._brazierVideo, 0, 0, 256, 256);
                var imageData = self._brazierCtx.getImageData(0, 0, 256, 256);
                var data = imageData.data;
                for (var i = 0; i < data.length; i += 4) {
                    var r = data[i], g = data[i + 1], b = data[i + 2];
                    if (g > 80 && g > r * 1.4 && g > b * 1.4) data[i + 3] = 0;
                }
                self._brazierCtx.putImageData(imageData, 0, 0);
                self._brazierTexture.needsUpdate = true;
            }
            requestAnimationFrame(processFrame);
        }
        processFrame();
    },

    _addBraziers: function() {
        var d = this._dungeon;
        if (!d) return;
        var center = Math.floor(d.size / 2);
        if (!this._brazierVideo) return;
        if (!this._brazierCanvas) {
            this._brazierCanvas = document.createElement('canvas');
            this._brazierCanvas.width = 256;
            this._brazierCanvas.height = 256;
            this._brazierCtx = this._brazierCanvas.getContext('2d', { willReadFrequently: true });
            this._brazierTexture = new THREE.CanvasTexture(this._brazierCanvas);
            this._brazierTexture.minFilter = THREE.LinearFilter;
            this._brazierTexture.magFilter = THREE.LinearFilter;
            this._processBrazierFrame();
        }
        for (var row = 1; row < d.size - 1; row++) {
            for (var col = 1; col < d.size - 1; col++) {
                var isPerimeter = (row === 1 || row === d.size - 2 || col === 1 || col === d.size - 2);
                if (!isPerimeter) continue;
                var cell = d.grid[row][col];
                if (!cell || !cell.open) continue;
                if ((row + col) % 5 !== 0) continue;
                var offsetX = 0.35, offsetZ = 0.35;
                var dirs = [
                    { dx: -1, dy: 0, ox: 0.35, oz: 0 },
                    { dx: 1, dy: 0, ox: -0.35, oz: 0 },
                    { dx: 0, dy: -1, ox: 0, oz: 0.35 },
                    { dx: 0, dy: 1, ox: 0, oz: -0.35 }
                ];
                for (var i = 0; i < dirs.length; i++) {
                    var nx = col + dirs[i].dx, ny = row + dirs[i].dy;
                    if (nx >= 0 && nx < d.size && ny >= 0 && ny < d.size) {
                        var neighbor = d.grid[ny][nx];
                        if (neighbor && !neighbor.open && !neighbor.isPath) {
                            offsetX = dirs[i].ox;
                            offsetZ = dirs[i].oz;
                            break;
                        }
                    }
                }
                var sprite = new THREE.Sprite(new THREE.SpriteMaterial({
                    map: this._brazierTexture,
                    transparent: true,
                    depthWrite: false
                }));
                sprite.position.set(col - center + offsetX, 0.1, row - center + offsetZ);
                sprite.scale.set(0.18, 0.18, 1);
                this._group.add(sprite);
            }
        }
    },

    _buildMesh: function() {
        var d = this._dungeon;
        if (!d) return;
        while (this._group.children.length > 0) this._group.remove(this._group.children[0]);
        this._particles = [];

        var size = d.size, wallHeight = 1.2, cellSize = 1, center = Math.floor(size / 2);

        if (!this._cachedMats.ceil) {
            this._cachedMats.ceil = new THREE.MeshStandardMaterial({
                map: this._ceilings[0],
                roughness: 0.9
            });
        }
        if (!this._cachedMats.floorMats) {
            this._cachedMats.floorMats = this._floors.map(function(tex) {
                return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 });
            });
        }
        if (!this._cachedMats.wallMats) {
            this._cachedMats.wallMats = this._walls.map(function(tex) {
                return new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
            });
        }
        if (!this._cachedMats.openableMat) {
            this._cachedMats.openableMat = new THREE.MeshStandardMaterial({
                map: this._images.wall_openable,
                roughness: 0.7
            });
        }

        var floorGeo = new THREE.PlaneGeometry(cellSize, cellSize);
        var ceilGeo = new THREE.PlaneGeometry(cellSize, cellSize);
        var wallGeo = new THREE.BoxGeometry(cellSize, wallHeight, cellSize);

        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                var x = col - center, z = row - center;
                var cell = d.grid[row][col];

                var floor = new THREE.Mesh(floorGeo, this._cachedMats.floorMats[Math.abs(col * 3 + row * 5) % this._floors.length]);
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(x, 0, z);
                this._group.add(floor);

                var ceil = new THREE.Mesh(ceilGeo, this._cachedMats.ceil);
                ceil.rotation.x = Math.PI / 2;
                ceil.position.set(x, wallHeight, z);
                this._group.add(ceil);

                if (cell && !cell.open && !cell.isPath) {
                    var wall = new THREE.Mesh(wallGeo, this._cachedMats.wallMats[Math.abs(col * 7 + row * 13) % this._walls.length]);
                    wall.position.set(x, wallHeight / 2, z);
                    wall.userData = { openable: false, gridX: col, gridY: row };
                    this._group.add(wall);
                }

                if (cell && !cell.open && cell.isPath && this._isAdjacentToOpen(d, col, row)) {
                    var wall = new THREE.Mesh(wallGeo, this._cachedMats.openableMat);
                    wall.position.set(x, wallHeight / 2, z);
                    wall.userData = { openable: true, gridX: col, gridY: row };
                    this._group.add(wall);
                }
            }
        }

        this._addObjectSprites();
        this._addBraziers();
        this._createParticles();
    },

    _addObjectSprites: function() {
        var d = this._dungeon;
        if (!d) return;
        var size = d.size, center = Math.floor(size / 2);

        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                var cell = d.grid[row][col];
                if (!cell) continue;
                if (!cell.open && !cell.isPath) continue;
                if (!cell.open && cell.isPath && !this._isAdjacentToOpen(d, col, row)) continue;

                if (!cell.monster && !cell.lootBag && !cell.chest && !cell.altar && !cell.cauldron && !cell.potion && !cell.exit) continue;

                var tex = null;
                if (cell.monster) {
                    var id = cell.monsterId || 'plague_crow.png';
                    if (!this._monsterImages[id]) {
                        var loader = new THREE.TextureLoader();
                        this._monsterImages[id] = loader.load('assets/all_beasts/' + id);
                    }
                    tex = this._monsterImages[id];
                } else if (cell.lootCollected && cell.lootBag !== undefined) tex = this._images.loot_bag_empty;
                else if (cell.lootBag && !cell.lootCollected) tex = this._images.loot_bag;
                else if (cell.chest && !cell.looted) tex = this._images.chest_locked;
                else if (cell.chest && cell.looted) tex = this._images.chest_open;
                else if (cell.altar && !cell.altarCollected) tex = this._images.altar;
                else if (cell.altar && cell.altarCollected) tex = this._images.altar;
                else if (cell.cauldron && !cell.cauldronCollected) tex = this._images.cauldron;
                else if (cell.cauldron && cell.cauldronCollected) tex = this._images.cauldron;
                else if (cell.potion && !cell.potionCollected) tex = this._images.potion;
                else if (cell.exit && cell.locked) tex = this._images.exit_locked;
                else if (cell.exit && !cell.locked) tex = this._images.exit;

                if (tex && tex.image) {
                    var sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
                    var scale = 0.5, sy = 0.15;
                    if (cell.exit && cell.locked) { scale = 0.5; sy = 0.15; }
                    else if (cell.exit && !cell.locked) { scale = 1.6; sy = 0.55; }
                    else if (cell.monster) { scale = 0.7; sy = 0.35; }
                    else if (cell.chest) { scale = 0.4; sy = 0.12; }
                    else if (cell.lootBag !== undefined) { scale = 0.35; sy = 0.1; }
                    else if (cell.potion) { scale = 0.25; sy = 0.1; }
                    else if (cell.altar) { scale = 0.4; sy = 0.18; }
                    else if (cell.cauldron) { scale = 0.35; sy = 0.1; }

                    sprite.position.set(col - center, sy, row - center);
                    sprite.scale.set(scale, scale, 1);
                    this._group.add(sprite);
                }
            }
        }
    },

    _updateCamera: function() {
        var d = this._dungeon;
        if (!d) return;
        var center = Math.floor(d.size / 2);
        var posX = d.px - center, posZ = d.py - center;
        if (this._isMoving) {
            var t = this._ease(this._moveT);
            posX = (this._fromX - center) + ((this._toX - center) - (this._fromX - center)) * t;
            posZ = (this._fromY - center) + ((this._toY - center) - (this._fromY - center)) * t;
        }
        this._camera.position.set(posX, 0.5, posZ);
        this._camera.quaternion.setFromEuler(new THREE.Euler(0, -this._dir * Math.PI / 2, 0, 'YXZ'));
    },

    _updateHP: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        var hp = p.stats.hp || 0, maxHp = p.stats.maxHp || 100;
        var fill = document.getElementById('hp-fill-2d5');
        var text = document.getElementById('hp-text-2d5');
        if (fill) fill.style.width = Math.round((hp / maxHp) * 100) + '%';
        if (text) text.textContent = hp + '/' + maxHp;
        var d = this._dungeon;
        if (d && this._killCounter) {
            this._killCounter.textContent = (d.monstersKilled || 0) + '/' + (d.totalMonsters || 0);
        }
    },

    _ease: function(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },

    render: function() {
        document.getElementById('gameZone').style.background = 'transparent';
        document.getElementById('menuScreen').style.background = 'transparent';
        if (UI && UI._screenLayer) {
            UI._screenLayer.style.background = 'transparent';
            UI._screenLayer.style.backgroundImage = 'none';
        }
        
        if (!this._container) {
            this.init();
        }
        
        // Показываем подземку (без видео)
        this._dungeon = Sherwood.Dungeon.getDungeon();
        if (!this._dungeon) {
            console.warn('🏚️ Данжена нет, создаём новый');
            if (typeof Sherwood.Dungeon !== 'undefined' && Sherwood.Dungeon.generate) {
                this._dungeon = Sherwood.Dungeon.generate('forest', 1);
            } else {
                UI._showToast('❌ Ошибка генерации подземки');
                this.destroy();
                if (typeof UI !== 'undefined' && UI.loadHome) {
                    UI.loadHome();
                }
                return;
            }
        }

        if (!this._scene) this.init();

        if (!this._currentDungeonId || this._currentDungeonId !== this._dungeon.id) {
            this._currentDungeonId = this._dungeon.id;
            this._loadDungeonTextures(this._dungeon.id);
        }

        if (this._container) {
            this._container.style.display = 'block';
        }

        this._isMoving = false;
        this._buildMesh();
        this._updateCamera();
        this._updateHP();
        this._updateMinimap();
        this._checkInteract();
        if (this._renderLoop) cancelAnimationFrame(this._renderLoop);
        this._startLoop();
    },

    _startLoop: function() {
        var self = this;
        var lastTime = performance.now();
        var frameSkip = 0;

        function loop(time) {
            self._renderLoop = requestAnimationFrame(loop);

            frameSkip++;
            if (frameSkip < 2) return;
            frameSkip = 0;

            var dt = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;

            if (self._isMoving) {
                self._moveT += dt * 2.5;
                if (self._moveT >= 1) {
                    self._moveT = 1;
                    self._isMoving = false;

                    if (self._joystickVideo) {
                        setTimeout(function() {
                            if (!self._isMoving && self._joystickVideo) {
                                self._joystickVideo.pause();
                            }
                        }, 1000);
                    }

                    var d = self._dungeon;
                    if (d) {
                        d.px = self._toX;
                        d.py = self._toY;
                        var cell = d.grid[d.py][d.px];
                        if (cell && cell.exit && !cell.locked) {
                            self._completeDungeon();
                            return;
                        }
                        if (cell && cell.monster) {
                            self._updateCamera();
                            self._updateMinimap();
                            self._renderer.render(self._scene, self._camera);
                            if (typeof Sherwood.Combat !== 'undefined' && Sherwood.Combat.start) {
                                Sherwood.Combat.start(cell.monsterId, cell.isBoss || false, 'dungeon');
                            }
                            return;
                        }
                        self._buildMesh();
                        self._updateCamera();
                        self._checkInteract();
                        self._updateMinimap();
                    }
                }
            }
            self._updateCamera();
            self._updateHP();
            self._updateMinimap();
            self._updateParticles(time / 1000);
            self._renderer.render(self._scene, self._camera);
        }
        this._renderLoop = requestAnimationFrame(loop);
    },

    destroy: function() {
        if (this._renderLoop) {
            cancelAnimationFrame(this._renderLoop);
            this._renderLoop = null;
        }
        if (this._brazierVideo) {
            this._brazierVideo.pause();
            this._brazierVideo = null;
        }
        if (this._joystickVideo) {
            this._joystickVideo.pause();
            this._joystickVideo = null;
        }

        if (this._container) {
            this._container.style.display = 'none';
        }

        if (this._group) {
            while (this._group.children.length > 0) {
                this._group.remove(this._group.children[0]);
            }
        }

        this._dungeon = null;
        this._isMoving = false;
        this._dir = 0;
        this._particles = [];
        this._cachedMats = {};
        this._currentDungeonId = null;

        console.log('🏚️ Подземка закрыта');
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Dungeon = Sherwood.Dungeon;
window.Sherwood.Dungeon2D5 = Sherwood.Dungeon2D5;

console.log('🏚️ Dungeon + Dungeon2D5 объединены!');

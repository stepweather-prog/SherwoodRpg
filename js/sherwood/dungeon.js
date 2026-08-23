Sherwood.Dungeon = {
    TILE: { WALL: 0, EMPTY: 1, MONSTER: 2, CHEST: 3, BOSS: 4, SPAWN: 5, EXIT: 6, ALTAR: 7, CAULDRON: 8, POTION: 9 },
    _dungeon: null,
    _progress: null,
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
            5: { normal: ['oak_golem.png','blighted_oak_golem.png','twigtangle.png','woodland_terror.png','leshy.png'], boss: 'root_executioner.png', stats: { atk: 7000, def: 6000, hp: 30000 } },
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
        var saved = localStorage.getItem('sherwood_dungeon_progress');
        if (saved) {
            this._progress = JSON.parse(saved);
        } else {
            this._progress = { forest: { level: 1, cups: {} }, swamp: { level: 1, cups: {} }, cave: { level: 1, cups: {} } };
        }

        for (var id in this._progress) {
            if (!this._progress[id].cups) this._progress[id].cups = {};
            for (var lvl in this._progress[id].cups) {
                if (typeof this._progress[id].cups[lvl] === 'number') {
                    var count = this._progress[id].cups[lvl];
                    this._progress[id].cups[lvl] = { count: count, rewardsClaimed: [false, false, false] };
                }
            }
        }

        var p = Sherwood.getPlayer();
        if (p && p.dungeon) {
            if (!p.dungeon.maxTickets) p.dungeon.maxTickets = 20;
            if (!p.dungeon.ticketTimer) p.dungeon.ticketTimer = 3600;
        }

        this._startTicketRegeneration();

        var p2 = Sherwood.getPlayer();
        if (p2 && p2.dungeon && p2.dungeon.autoFight) {
            var af = p2.dungeon.autoFight;
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

        if (!this._progress) this._progress = { forest: { level: 1, cups: {} }, swamp: { level: 1, cups: {} }, cave: { level: 1, cups: {} } };
        var progress = this._progress[dungeonId] || { level: 1, cups: {} };
        var cupIndex = this._getCurrentCupIndex(dungeonId, level);

        if (cupIndex < 3) {
            var reward = this._getCupReward(dungeonId, level, cupIndex);
            Sherwood.addResource('gold', reward.gold);
            Sherwood.addResource('silver', reward.silver);
            Sherwood.addExp(reward.exp);
            this._addCup(dungeonId, level);
        } else {
            var gold = 1 + Math.floor(Math.random() * 3);
            var silver = 20 + Math.floor(Math.random() * 50);
            var exp = 50 + Math.floor(Math.random() * 50);
            Sherwood.addResource('gold', gold);
            Sherwood.addResource('silver', silver);
            Sherwood.addExp(exp);
        }

        Sherwood.dispatch({
            type: 'AUTO_FIGHT_COMPLETE',
            payload: { dungeonId: dungeonId, level: level, rewards: { gold: gold, silver: silver, exp: exp } }
        });
    },

    _getCurrentCupIndex: function(dungeonId, level) {
        if (!this._progress) return 0;
        if (!this._progress[dungeonId]) return 0;
        if (!this._progress[dungeonId].cups) return 0;
        var cupData = this._progress[dungeonId].cups[level];
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
        if (!this._progress) {
            this._progress = { forest: { level: 1, cups: {} }, swamp: { level: 1, cups: {} }, cave: { level: 1, cups: {} } };
        }
        if (!this._progress[dungeonId]) this._progress[dungeonId] = { level: 1, cups: {} };
        if (!this._progress[dungeonId].cups) this._progress[dungeonId].cups = {};
        if (!this._progress[dungeonId].cups[level]) {
            this._progress[dungeonId].cups[level] = { count: 0, rewardsClaimed: [false, false, false] };
        }

        var cupData = this._progress[dungeonId].cups[level];
        if (cupData.count < 3) {
            cupData.count++;
            cupData.rewardsClaimed[cupData.count - 1] = true;
            localStorage.setItem('sherwood_dungeon_progress', JSON.stringify(this._progress));
        }
    },

    getAvailable: function() {
        if (!this._progress) {
            this._progress = { forest: { level: 1, cups: {} }, swamp: { level: 1, cups: {} }, cave: { level: 1, cups: {} } };
        }
        var list = {};
        var duns = {
            forest: { name: 'Проклятая чаща', bg: 'assets/backgrounds/underground_1_floor_1.jpg', tiles: 'dungeon1', ext: '.jpeg', requiredDungeon: null, requiredCups: 0 },
            swamp: { name: 'Первородное болото', bg: 'assets/backgrounds/underground_2_floor_1.jpeg', tiles: 'dungeon2', ext: '.png', requiredDungeon: 'forest', requiredCups: 3 },
            cave: { name: 'Базальтовый грот', bg: 'assets/backgrounds/underground_3_floor_1.jpeg', tiles: 'dungeon3', ext: '.png', requiredDungeon: 'swamp', requiredCups: 3 }
        };

        for (var id in duns) {
            var dd = duns[id];
            var prog = this._progress[id] || { level: 1, cups: {} };
            var isUnlocked = true;

            if (dd.requiredDungeon) {
                var reqProg = this._progress[dd.requiredDungeon] || { level: 1, cups: {} };
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
        if (!p || !p.dungeon || p.dungeon.tickets <= 0) return null;
        p.dungeon.tickets--;
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
            totalMonsters: monsterCount,
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

        if (!this._progress) {
            this._progress = { forest: { level: 1, cups: {} }, swamp: { level: 1, cups: {} }, cave: { level: 1, cups: {} } };
        }
        if (!this._progress[d.id]) this._progress[d.id] = { level: 1, cups: {} };
        if (!this._progress[d.id].cups) this._progress[d.id].cups = {};

        var cupIndex = this._getCurrentCupIndex(d.id, d.level);

        if (cupIndex < 3) {
            var reward = this._getCupReward(d.id, d.level, cupIndex);
            this._addCup(d.id, d.level);

            Sherwood.addExp(reward.exp);
            Sherwood.addResource('gold', reward.gold);
            Sherwood.addResource('silver', reward.silver);

            var items = d.collectedLoot ? d.collectedLoot.slice() : [];

            var prog = this._progress[d.id];
            var cups = prog.cups[d.level] ? (prog.cups[d.level].count || 0) : 0;

            if (cups >= 3 && d.level >= prog.level) {
                prog.level = Math.min(7, d.level + 1);
                localStorage.setItem('sherwood_dungeon_progress', JSON.stringify(this._progress));
            }

            if (typeof Sherwood.Daily !== 'undefined') Sherwood.Daily.updateProgress('dungeon_floors', 1);

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

    isAutoFightActive: function() {
        return this._autoFightActive;
    },

    getAutoFightRemaining: function() {
        if (!this._autoFightActive) return 0;
        return Math.max(0, Math.ceil((this._autoFightEndTime - Date.now()) / 1000 / 60));
    },

    startAutoFight: function(dungeonId, level, instant) {
        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };

        if (instant) {
            var tickets = Sherwood.Bag.getResource('autoFightTickets');
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
    }
};

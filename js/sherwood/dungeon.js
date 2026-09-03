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
            p.dungeon = { tickets: 15, maxTickets: 15, autoTickets: 3 };
        }
        if (!p.dungeon.maxTickets) p.dungeon.maxTickets = 15;
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

    _getCurrentCupIndex: function(dungeonId, level) {
        var progress = this._getProgress();
        if (!progress) return 0;
        if (!progress[dungeonId]) return 0;
        if (!progress[dungeonId].cups) return 0;
        var cupData = progress[dungeonId].cups[level];
        if (!cupData) return 0;
        return Math.min(cupData.count || 0, 2);
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
        var monsterCount = 10 + (cupIndex * 3);
        var minToKill = 10 + (cupIndex * 2);

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
        h += '<div style="display:flex;justify-content:center;gap:16px;margin-bottom:8px;">';
        h += '<div style="position:relative;width:50px;height:50px;"><img src="assets/interface/resource_key_to_locked_levels.png" style="width:100%;height:100%;object-fit:contain;"><span style="position:absolute;bottom:0;right:0;color:#fff;font-size:0.6em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 5px;border-radius:3px;">' + tickets + '/' + maxTickets + '</span></div>';
        h += '<div style="position:relative;width:50px;height:50px;"><img src="assets/interface/ticket_autofight.png" style="width:100%;height:100%;object-fit:contain;"><span style="position:absolute;bottom:0;right:0;color:#fff;font-size:0.6em;font-weight:bold;background:rgba(0,0,0,0.8);padding:1px 5px;border-radius:3px;">' + autoTickets + '</span></div>';
        h += '</div>';
        if (afActive) {
            var afRemain = this.getAutoFightRemaining();
            h += '<div style="text-align:center;background:rgba(201,160,64,0.3);border:1px solid #c9a040;border-radius:8px;padding:6px;margin-bottom:10px;"><div style="color:#ffd700;font-size:0.8em;">⚔️ Автобой активен</div><div style="color:#aaa;font-size:0.7em;">Осталось: ' + afRemain + ' мин.</div></div>';
        }
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
        UI._openScreenScrollable('🏚️ Подземка', null, h);
    },

    _showLevels: function(dungeonId) {
        var dungeons = this.getAvailable();
        var d = dungeons[dungeonId];
        if (!d) return;
        var progress = this._getProgress()[dungeonId] || { level: 1, cups: {} };
        var cups = progress.cups || {};
        var dungeonNames = { forest: 'Проклятая чаща', swamp: 'Первородное болото', cave: 'Базальтовый грот' };
        var dungeonIcons = { forest: 'the_cursed_thicket.png', swamp: 'primordial_swamp.png', cave: 'basalt_grotto.png' };
        var tilePrefix = { forest: 'dungeon1', swamp: 'dungeon2', cave: 'dungeon3' };
        var h = '<div style="padding:10px;text-align:center;max-width:400px;margin:0 auto;">';
        h += '<img src="assets/dungeon_tiles/visual_dungeon/' + (dungeonIcons[dungeonId] || 'the_cursed_thicket.png') + '" style="width:80px;height:80px;object-fit:contain;display:block;margin:0 auto 8px;">';
        h += '<div style="color:#e0c080;font-size:1em;font-weight:bold;margin-bottom:10px;">' + (dungeonNames[dungeonId] || dungeonId) + '</div>';
        h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:320px;margin:0 auto;">';
        for (var lvl = 1; lvl <= 6; lvl++) {
            var unlocked = lvl <= progress.level;
            var cupCount = cups[lvl] ? (cups[lvl].count || 0) : 0;
            var tilePath = 'assets/dungeon_tiles/' + tilePrefix[dungeonId] + '/tiles_' + lvl + '.png';
            var onClick = '';
            if (unlocked) {
                onClick = 'onclick="Sherwood.Dungeon._startDungeon(\'' + dungeonId + '\',' + lvl + ')"';
            }
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
            h += '<div ' + onClick + ' style="width:80px;height:80px;background:rgba(0,0,0,0.5);border:2px solid ' + (unlocked ? '#c9a040' : '#555') + ';border-radius:8px;cursor:' + (unlocked ? 'pointer' : 'default') + ';display:flex;align-items:center;justify-content:center;position:relative;margin:0 auto;">';
            h += '<img src="' + tilePath + '" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;opacity:' + (unlocked ? 1 : 0.3) + ';" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
            h += '<span style="position:relative;z-index:2;font-size:2em;font-weight:bold;color:' + (unlocked ? '#fff' : '#999') + ';text-shadow:0 2px 4px #000;">' + lvl + '</span>';
            h += '</div>';
            h += '</div>';
        }
        h += '</div>';
        h += '</div>';
        UI._openScreenScrollable('🏚️ ' + (dungeonNames[dungeonId] || dungeonId), null, h);
    },

    _startDungeon: function(id, level) {
        if (!this.generate(id, level)) {
            UI._showToast('❌ Нет билетов!');
            return;
        }
        UI._stopMusic();
        UI._playMusic('dungeon_3');
        if (typeof Sherwood.Dungeon2D5 !== 'undefined' && Sherwood.Dungeon2D5.render) {
            Sherwood.Dungeon2D5.render();
        } else {
            UI._showToast('🏚️ 3D подземка в разработке');
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
    _yaw: 0,
    _renderLoop: null,
    _joystick: null,
    _joystickImg: null,
    _interactBtn: null,
    _interactBtnImg: null,
    _interactType: null,
    _topPanel: null,
    _exitBtn: null,
    _hpBar: null,
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
    _w: 480,
    _h: 800,

    init: function() {
        this._w = UI._screenLayer ? UI._screenLayer.clientWidth : 480;
        this._h = UI._screenLayer ? UI._screenLayer.clientHeight : 800;
        this._loadTextures();
        this._setupThree();
        this._setupControls();
    },

    _loadTextures: function() {
        const loader = new THREE.TextureLoader();
        function loadTex(src) { const tex = loader.load(src); tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping; return tex; }
        for (let i = 1; i <= 6; i++) this._walls.push(loadTex('assets/dungeon_tiles/visual_dungeon/wall_' + i + '.png'));
        for (let i = 1; i <= 6; i++) this._floors.push(loadTex('assets/dungeon_tiles/dungeon1/tiles_' + i + '.png'));
        for (let i = 1; i <= 6; i++) this._ceilings.push(loadTex('assets/dungeon_tiles/visual_dungeon/ceiling_dungeon_' + i + '.png'));
        this._images.wall_openable = loadTex('assets/interface/labyrinth_asset.png');
        const objs = { altar: 'altar_of_the_first_dungeon.png', cauldron: 'cauldron_first_dungeon.png', potion: 'resource_life_potion.png', chest_locked: 'locked_chest_first_dungeon.png', chest_open: 'open_chest_first_dungeon.png', loot_bag: 'loot_bag_of_beasts.png', loot_bag_empty: 'empty_bag_of_loot_beasts.png', exit: 'exit_completion_dungeon.png', exit_locked: 'closed_level_lock_icon.png' };
        for (let key in objs) this._images[key] = loadTex('assets/interface/' + objs[key]);
        this._brazierVideo = document.createElement('video');
        this._brazierVideo.src = 'assets/animation/stone_brazier_fire.webm';
        this._brazierVideo.loop = true;
        this._brazierVideo.muted = true;
        this._brazierVideo.playsInline = true;
        this._brazierVideo.autoplay = true;
        this._brazierVideo.play().catch(function() {});
    },

    _setupThree: function() {
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x1a0f08);
        this._camera = new THREE.PerspectiveCamera(70, this._w / this._h, 0.1, 30);
        this._camera.rotation.order = 'YXZ';
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setSize(this._w, this._h);
        this._renderer.setPixelRatio(1);
        this._renderer.setClearColor(0x1a0f08, 1);
        this._scene.add(new THREE.AmbientLight(0x664422, 0.8));
        const mainLight = new THREE.DirectionalLight(0xffcc88, 0.9);
        mainLight.position.set(5, 10, 5);
        this._scene.add(mainLight);
        const fillLight = new THREE.DirectionalLight(0x996633, 0.4);
        fillLight.position.set(-5, 2, -5);
        this._scene.add(fillLight);
        this._group = new THREE.Group();
        this._scene.add(this._group);
    },

    _setupMinimap: function() {
        this._minimap = document.createElement('canvas');
        this._minimap.width = 100;
        this._minimap.height = 100;
        this._minimap.style.cssText = 'position:absolute;top:55px;right:15px;width:100px;height:100px;border-radius:50%;z-index:15;';
        this._minimapCtx = this._minimap.getContext('2d');
        this._minimapFrame = document.createElement('img');
        this._minimapFrame.src = 'assets/interface/visual_resource.png';
        this._minimapFrame.style.cssText = 'position:absolute;top:50px;right:10px;width:110px;height:110px;z-index:16;pointer-events:none;';
    },

    _isAdjacentToOpen: function(d, col, row) {
        const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
        for (let i = 0; i < dirs.length; i++) {
            const nx = col + dirs[i][0];
            const ny = row + dirs[i][1];
            if (nx >= 0 && nx < d.size && ny >= 0 && ny < d.size) {
                if (d.grid[ny][nx] && d.grid[ny][nx].open) return true;
            }
        }
        return false;
    },

    _updateMinimap: function() {
        if (!this._minimapCtx || !this._dungeon) return;
        const ctx = this._minimapCtx;
        const d = this._dungeon;
        const mapSize = 100;
        const center = mapSize / 2;
        const radius = mapSize / 2 - 2;
        const cellSize = (radius * 2) / d.size;
        ctx.clearRect(0, 0, mapSize, mapSize);
        ctx.save();
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, mapSize, mapSize);
        for (let row = 0; row < d.size; row++) {
            for (let col = 0; col < d.size; col++) {
                const cell = d.grid[row][col];
                const x = col * cellSize;
                const y = row * cellSize;
                if (cell && cell.open) { ctx.fillStyle = '#4a4a4a'; ctx.fillRect(x, y, cellSize, cellSize); }
                else if (cell && cell.isPath && this._isAdjacentToOpen(d, col, row)) { ctx.fillStyle = '#8b6914'; ctx.fillRect(x, y, cellSize, cellSize); }
                else { ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x, y, cellSize, cellSize); }
            }
        }
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.arc(d.px * cellSize + cellSize / 2, d.py * cellSize + cellSize / 2, cellSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    },

    _setupControls: function() {
        const self = this;
        this._setupMinimap();
        this._topPanel = document.createElement('div');
        this._topPanel.style.cssText = 'position:absolute;top:10px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;padding:0 10px;z-index:15;';
        this._exitBtn = document.createElement('button');
        this._exitBtn.style.cssText = 'width:40px;height:40px;background:transparent;border:none;cursor:pointer;';
        this._exitBtn.innerHTML = '<img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;">';
        this._exitBtn.addEventListener('click', function() { UI.loadHome(); });
        this._topPanel.appendChild(this._exitBtn);
        this._hpBar = document.createElement('div');
        this._hpBar.style.cssText = 'position:relative;width:150px;height:30px;';
        this._hpBar.innerHTML = '<img src="assets/interface/life_scale.png" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:0;"><div style="position:absolute;top:6px;left:15px;right:15px;bottom:6px;overflow:hidden;z-index:1;"><div id="hp-fill-2d5" style="background:red;height:100%;width:100%;"></div></div><span id="hp-text-2d5" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:12px;z-index:2;font-weight:bold;"></span>';
        this._topPanel.appendChild(this._hpBar);
        this._joystick = document.createElement('div');
        this._joystick.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);width:300px;height:300px;z-index:10;background:url("assets/dungeon_tiles/visual_dungeon/joystick.png") center/contain no-repeat;';
        this._joystickImg = document.createElement('img');
        this._joystickImg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;object-fit:contain;pointer-events:none;';
        this._joystickImg.src = 'assets/animation/step_up.png';
        this._joystick.appendChild(this._joystickImg);
        const arrowAreas = [
            { d: 'forward', top: '5%', left: '35%', width: '30%', height: '30%' },
            { d: 'left', top: '35%', left: '5%', width: '30%', height: '30%' },
            { d: 'right', top: '35%', left: '65%', width: '30%', height: '30%' }
        ];
        arrowAreas.forEach(function(a) {
            const btn = document.createElement('button');
            btn.style.cssText = 'position:absolute;top:' + a.top + ';left:' + a.left + ';width:' + a.width + ';height:' + a.height + ';background:transparent;border:none;cursor:pointer;z-index:12;transition:background 0.1s, transform 0.1s;';
            btn.addEventListener('mousedown', function(e) {
                e.stopPropagation();
                btn.style.background = 'rgba(255,255,255,0.2)';
                btn.style.transform = 'scale(0.9)';
                if (a.d === 'forward') self._moveForward();
                else if (a.d === 'left') self._turnLeft();
                else if (a.d === 'right') self._turnRight();
            });
            btn.addEventListener('mouseup', function() {
                btn.style.background = 'transparent';
                btn.style.transform = 'scale(1)';
            });
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                btn.style.background = 'rgba(255,255,255,0.2)';
                btn.style.transform = 'scale(0.9)';
                if (a.d === 'forward') self._moveForward();
                else if (a.d === 'left') self._turnLeft();
                else if (a.d === 'right') self._turnRight();
            }, { passive: false });
            btn.addEventListener('touchend', function() {
                btn.style.background = 'transparent';
                btn.style.transform = 'scale(1)';
            });
            self._joystick.appendChild(btn);
        });
        this._interactBtn = document.createElement('button');
        this._interactBtn.style.cssText = 'position:absolute;bottom:350px;left:50%;transform:translateX(-50%);width:90px;height:90px;border-radius:50%;background:rgba(0,0,0,0.85);border:3px solid #ffd700;cursor:pointer;display:none;align-items:center;justify-content:center;z-index:11;';
        this._interactBtnImg = document.createElement('img');
        this._interactBtnImg.style.cssText = 'width:64px;height:64px;object-fit:contain;';
        this._interactBtn.appendChild(this._interactBtnImg);
        this._interactBtn.addEventListener('click', function() { self._onInteract(); });
        this._renderer.domElement.addEventListener('click', function(e) { self._handleWallClick(e); });
        this._renderer.domElement.addEventListener('touchend', function(e) { if (e.changedTouches && e.changedTouches[0]) self._handleWallClick(e.changedTouches[0]); });
    },

    _handleWallClick: function(e) {
        if (this._isMoving) return;
        const d = this._dungeon;
        if (!d) return;
        const rect = this._renderer.domElement.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), this._camera);
        const intersects = raycaster.intersectObjects(this._group.children, false);
        for (let i = 0; i < intersects.length; i++) {
            const obj = intersects[i].object;
            if (obj.userData && obj.userData.openable) {
                const dist = Math.abs(obj.userData.gridX - d.px) + Math.abs(obj.userData.gridY - d.py);
                if (dist === 1) this._openWall(obj.userData.gridX, obj.userData.gridY);
                break;
            }
        }
    },

    _openWall: function(gridX, gridY) {
        const d = this._dungeon;
        if (!d) return;
        const cell = d.grid[gridY][gridX];
        if (!cell || !cell.isPath) return;
        cell.open = true;
        cell.type = 1;
        if (cell.monster) {
            this._buildMesh();
            this._updateCamera();
            this._renderer.render(this._scene, this._camera);
            Sherwood.Combat.start(cell.monsterId, cell.isBoss || false, 'dungeon');
            setTimeout(function() { UI._showBattleScreen(); }, 400);
        } else {
            if (UI && UI._playSound) UI._playSound('tile_open');
            this._buildMesh();
            this._updateMinimap();
            this._checkInteract();
        }
    },

    _moveForward: function() {
        if (this._isMoving) return;
        const d = this._dungeon;
        if (!d) return;
        let dx = 0, dy = 0;
        if (this._dir === 0) dy = -1;
        else if (this._dir === 1) dx = 1;
        else if (this._dir === 2) dy = 1;
        else dx = -1;
        const nx = d.px + dx;
        const ny = d.py + dy;
        if (nx < 0 || nx >= d.size || ny < 0 || ny >= d.size) return;
        const cell = d.grid[ny][nx];
        if (!cell || !cell.isPath) return;
        if (!cell.open) { cell.open = true; cell.type = 1; }
        this._fromX = d.px;
        this._fromY = d.py;
        this._toX = nx;
        this._toY = ny;
        this._moveT = 0;
        this._isMoving = true;
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
        const d = this._dungeon;
        if (!d) return;
        const cell = d.grid[d.py][d.px];
        if (!cell) return;
        switch(this._interactType) {
            case 'lootBag': if (cell.lootBag && !cell.lootCollected) UI._collectLootBag(); break;
            case 'chest': if (cell.chest && !cell.looted) UI._collectChest(); break;
            case 'altar': if (cell.altar && !cell.altarCollected) UI._collectAltar(); break;
            case 'cauldron': if (cell.cauldron && !cell.cauldronCollected) UI._collectCauldron(); break;
            case 'potion': if (cell.potion && !cell.potionCollected) UI._collectPotion(); break;
            case 'exit': if (cell.exit && !cell.locked) UI._completeDungeon(); break;
        }
        this._interactType = null;
        this._interactBtn.style.display = 'none';
        this._buildMesh();
        this._updateMinimap();
        this._checkInteract();
    },

    _checkInteract: function() {
        const d = this._dungeon;
        if (!d) return;
        const cell = d.grid[d.py][d.px];
        if (!cell) return;
        let type = null, icon = null;
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
        const d = this._dungeon;
        if (!d) return;
        const center = Math.floor(d.size / 2);
        const particleCanvas = document.createElement('canvas');
        particleCanvas.width = 32;
        particleCanvas.height = 32;
        const pctx = particleCanvas.getContext('2d');
        const gradient = pctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,200,1)');
        gradient.addColorStop(0.3, 'rgba(255,220,100,0.8)');
        gradient.addColorStop(1, 'rgba(255,200,50,0)');
        pctx.fillStyle = gradient;
        pctx.fillRect(0, 0, 32, 32);
        const particleTexture = new THREE.CanvasTexture(particleCanvas);
        for (let row = 0; row < d.size; row++) {
            for (let col = 0; col < d.size; col++) {
                const cell = d.grid[row][col];
                if (!cell || !cell.open) continue;
                const hasItem = (cell.chest && !cell.looted) || (cell.lootBag && !cell.lootCollected) || (cell.altar && !cell.altarCollected) || (cell.cauldron && !cell.cauldronCollected) || (cell.potion && !cell.potionCollected) || (cell.exit && cell.locked);
                if (hasItem) {
                    for (let i = 0; i < 8; i++) {
                        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: particleTexture, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
                        sprite.position.set(col - center + (Math.random() - 0.5) * 0.5, 0.2 + Math.random() * 0.6, row - center + (Math.random() - 0.5) * 0.5);
                        sprite.scale.set(0.08, 0.08, 1);
                        sprite.userData = { baseY: 0.2 + Math.random() * 0.4, speed: 0.5 + Math.random() * 1, phase: Math.random() * Math.PI * 2, offsetX: (Math.random() - 0.5) * 0.5, offsetZ: (Math.random() - 0.5) * 0.5, gridX: col, gridY: row };
                        this._group.add(sprite);
                        this._particles.push(sprite);
                    }
                }
            }
        }
    },

    _updateParticles: function(time) {
        const d = this._dungeon;
        if (!d) return;
        const center = Math.floor(d.size / 2);
        for (let i = 0; i < this._particles.length; i++) {
            const p = this._particles[i];
            const cell = d.grid[p.userData.gridY][p.userData.gridX];
            const hasItem = cell && ((cell.chest && !cell.looted) || (cell.lootBag && !cell.lootCollected) || (cell.altar && !cell.altarCollected) || (cell.cauldron && !cell.cauldronCollected) || (cell.potion && !cell.potionCollected) || (cell.exit && cell.locked));
            if (!hasItem) { p.visible = false; continue; }
            p.visible = true;
            p.position.y = p.userData.baseY + Math.sin(time * p.userData.speed + p.userData.phase) * 0.2;
            p.position.x = p.userData.gridX - center + p.userData.offsetX + Math.sin(time * 0.5 + p.userData.phase) * 0.1;
            p.position.z = p.userData.gridY - center + p.userData.offsetZ + Math.cos(time * 0.5 + p.userData.phase) * 0.1;
        }
    },

    _processBrazierFrame: function() {
        const self = this;
        function processFrame() {
            if (!self._brazierVideo || !self._brazierCtx) return;
            if (self._brazierVideo.readyState >= 2) {
                self._brazierCtx.drawImage(self._brazierVideo, 0, 0, 256, 256);
                const imageData = self._brazierCtx.getImageData(0, 0, 256, 256);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i+1], b = data[i+2];
                    if (g > 80 && g > r * 1.4 && g > b * 1.4) data[i+3] = 0;
                }
                self._brazierCtx.putImageData(imageData, 0, 0);
                self._brazierTexture.needsUpdate = true;
            }
            requestAnimationFrame(processFrame);
        }
        processFrame();
    },

    _addBraziers: function() {
        const d = this._dungeon;
        if (!d) return;
        const center = Math.floor(d.size / 2);
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
        for (let row = 1; row < d.size - 1; row++) {
            for (let col = 1; col < d.size - 1; col++) {
                const isPerimeter = (row === 1 || row === d.size - 2 || col === 1 || col === d.size - 2);
                if (!isPerimeter) continue;
                const cell = d.grid[row][col];
                if (!cell || !cell.open) continue;
                if ((row + col) % 3 !== 0) continue;
                let offsetX = 0.35, offsetZ = 0.35;
                const dirs = [{ dx: -1, dy: 0, ox: 0.35, oz: 0 }, { dx: 1, dy: 0, ox: -0.35, oz: 0 }, { dx: 0, dy: -1, ox: 0, oz: 0.35 }, { dx: 0, dy: 1, ox: 0, oz: -0.35 }];
                for (let i = 0; i < dirs.length; i++) {
                    const nx = col + dirs[i].dx, ny = row + dirs[i].dy;
                    if (nx >= 0 && nx < d.size && ny >= 0 && ny < d.size) {
                        const neighbor = d.grid[ny][nx];
                        if (neighbor && !neighbor.open && !neighbor.isPath) { offsetX = dirs[i].ox; offsetZ = dirs[i].oz; break; }
                    }
                }
                const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: this._brazierTexture, transparent: true, depthWrite: false }));
                sprite.position.set(col - center + offsetX, 0.25, row - center + offsetZ);
                sprite.scale.set(0.3, 0.3, 1);
                this._group.add(sprite);
            }
        }
    },

    _buildMesh: function() {
        const d = this._dungeon;
        if (!d) return;
        while (this._group.children.length > 0) this._group.remove(this._group.children[0]);
        this._particles = [];
        const size = d.size, wallHeight = 1.2, cellSize = 1, center = Math.floor(size / 2);
        const ceilMat = new THREE.MeshStandardMaterial({ map: this._ceilings[0], roughness: 0.9 });
        const wallMats = this._walls.map(tex => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const x = col - center, z = row - center;
                const cell = d.grid[row][col];
                const floor = new THREE.Mesh(new THREE.PlaneGeometry(cellSize, cellSize), new THREE.MeshStandardMaterial({ map: this._floors[Math.abs(col * 3 + row * 5) % this._floors.length], roughness: 0.9 }));
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(x, 0, z);
                this._group.add(floor);
                const ceil = new THREE.Mesh(new THREE.PlaneGeometry(cellSize, cellSize), ceilMat);
                ceil.rotation.x = Math.PI / 2;
                ceil.position.set(x, wallHeight, z);
                this._group.add(ceil);
                if (cell && !cell.open && !cell.isPath) {
                    const wall = new THREE.Mesh(new THREE.BoxGeometry(cellSize, wallHeight, cellSize), wallMats[Math.abs(col * 7 + row * 13) % wallMats.length]);
                    wall.position.set(x, wallHeight / 2, z);
                    wall.userData = { openable: false, gridX: col, gridY: row };
                    this._group.add(wall);
                }
                if (cell && !cell.open && cell.isPath && this._isAdjacentToOpen(d, col, row)) {
                    const wall = new THREE.Mesh(new THREE.BoxGeometry(cellSize, wallHeight, cellSize), new THREE.MeshStandardMaterial({ map: this._images.wall_openable, roughness: 0.7 }));
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
        const d = this._dungeon;
        if (!d) return;
        const size = d.size, center = Math.floor(size / 2);
        for (let row = 0; row < size; row++) {
            for (let col =  < size; col++) {
                const cell = d.grid[row][col];
                if (!cell) continue;
                if (!cell.open && !cell.isPath) continue;
                if (!cell.open && cell.isPath && !this._isAdjacentToOpen(d, col, row)) continue;
                let tex = null;
                if (cell.monster) {
                    const id = cell.monsterId || 'plague_crow.png';
                    if (!this._monsterImages[id]) {
                        const loader = new THREE.TextureLoader();
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
                    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
                    let scale = 0.5, sy = 0.3;
                    if (cell.exit) { scale = 0.8; sy = 0.5; }
                    else if (cell.chest) { scale = 0.45; sy = 0.2; }
                    else if (cell.lootBag !== undefined) { scale = 0.4; sy = 0.15; }
                    sprite.position.set(col - center, sy, row - center);
                    sprite.scale.set(scale, scale, 1);
                    this._group.add(sprite);
                }
            }
        }
    },

    _updateCamera: function() {
        const d = this._dungeon;
        if (!d) return;
        const center = Math.floor(d.size / 2);
        let posX = d.px - center, posZ = d.py - center;
        if (this._isMoving) {
            const t = this._ease(this._moveT);
            posX = (this._fromX - center) + ((this._toX - center) - (this._fromX - center)) * t;
            posZ = (this._fromY - center) + ((this._toY - center) - (this._fromY - center)) * t;
        }
        this._camera.position.set(posX, 0.5, posZ);
        this._camera.quaternion.setFromEuler(new THREE.Euler(0, -this._dir * Math.PI / 2, 0, 'YXZ'));
    },

    _updateHP: function() {
        const p = Sherwood.getPlayer();
        if (!p) return;
        const hp = p.stats.hp || 0, maxHp = p.stats.maxHp || 100;
        const fill = document.getElementById('hp-fill-2d5');
        const text = document.getElementById('hp-text-2d5');
        if (fill) fill.style.width = Math.round((hp / maxHp) * 100) + '%';
        if (text) text.textContent = hp + '/' + maxHp;
    },

    _ease: function(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; },

    render: function() {
        this._dungeon = Sherwood.Dungeon.getDungeon();
        if (!this._dungeon) return;
        if (!this._scene) this.init();
        if (this._renderer.domElement.parentNode !== UI._screenLayer) {
            UI._screenLayer.innerHTML = '';
            UI._screenLayer.appendChild(this._renderer.domElement);
            UI._screenLayer.appendChild(this._topPanel);
            UI._screenLayer.appendChild(this._minimap);
            UI._screenLayer.appendChild(this._minimapFrame);
            UI._screenLayer.appendChild(this._joystick);
            UI._screenLayer.appendChild(this._interactBtn);
        }
        UI._screenLayer.style.display = 'block';
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
        const self = this;
        let lastTime = performance.now();
        function loop(time) {
            self._renderLoop = requestAnimationFrame(loop);
            const dt = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;
            if (self._isMoving) {
                self._moveT += dt * 2.5;
                if (Math.floor(self._moveT * 10) % 2 === 0) {
                    self._joystickImg.src = 'assets/animation/step_up.png';
                } else {
                    self._joystickImg.src = 'assets/animation/step_down.png';
                }
                if (self._moveT >= 1) {
                    self._moveT = 1;
                    self._isMoving = false;
                    self._joystickImg.src = 'assets/animation/step_up.png';
                    const d = self._dungeon;
                    if (d) {
                        d.px = self._toX;
                        d.py = self._toY;
                        const cell = d.grid[d.py][d.px];
                        if (cell && cell.monster) {
                            self._updateCamera();
                            self._updateMinimap();
                            self._renderer.render(self._scene, self._camera);
                            Sherwood.Combat.start(cell.monsterId, cell.isBoss || false, 'dungeon');
                            setTimeout(function() { UI._showBattleScreen(); }, 400);
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
        if (this._renderLoop) { cancelAnimationFrame(this._renderLoop); this._renderLoop = null; }
        if (this._brazierVideo) { this._brazierVideo.pause(); this._brazierVideo = null; }
        if (this._renderer && this._renderer.domElement.parentNode) this._renderer.domElement.parentNode.removeChild(this._renderer.domElement);
        if (this._joystick && this._joystick.parentNode) this._joystick.parentNode.removeChild(this._joystick);
        if (this._interactBtn && this._interactBtn.parentNode) this._interactBtn.parentNode.removeChild(this._interactBtn);
        if (this._topPanel && this._topPanel.parentNode) this._topPanel.parentNode.removeChild(this._topPanel);
        if (this._minimap && this._minimap.parentNode) this._minimap.parentNode.removeChild(this._minimap);
        if (this._minimapFrame && this._minimapFrame.parentNode) this._minimapFrame.parentNode.removeChild(this._minimapFrame);
        this._dungeon = null;
        this._isMoving = false;
        this._dir = 0;
        this._particles = [];
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Dungeon = Sherwood.Dungeon;
window.Sherwood.Dungeon2D5 = Sherwood.Dungeon2D5;

console.log('🏚️ Dungeon + Dungeon2D5 объединены!');

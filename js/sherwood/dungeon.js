Sherwood.Dungeon = {
    _dungeon: null,

    // === ПРОГРЕСС ПОДЗЕМКИ ===
    _ensureProgress: function() {
        var p = Sherwood.getPlayer();
        if (!p) return null;
        if (!p.dungeonProgress) p.dungeonProgress = {};
        if (!p.dungeonProgress.byDungeon) p.dungeonProgress.byDungeon = {};
        if (!p.dungeonProgress.floors || p.dungeonProgress.floors.length !== 6) {
            p.dungeonProgress.floors = [
                { cups: 0 }, { cups: 0 }, { cups: 0 },
                { cups: 0 }, { cups: 0 }, { cups: 0 }
            ];
        }
        return p.dungeonProgress;
    },

    getFloorCups: function(floor) {
        var prog = this._ensureProgress();
        if (!prog) return 0;
        return prog.floors[floor - 1].cups || 0;
    },

    isFloorAvailable: function(floor, diff) {
        var prog = this._ensureProgress();
        if (!prog) return false;
        var N = floor, K = diff;
        if (N < 1 || N > 6 || K < 1 || K > 3) return false;
        var thisCups = prog.floors[N - 1].cups || 0;
        var prevCups = (N > 1) ? (prog.floors[N - 2].cups || 0) : 0;
        if (K === 1) {
            if (N === 1) return true;
            return prevCups >= 2;
        }
        if (K === 2) return thisCups >= 1;
        if (K === 3) return thisCups >= 2;
        return false;
    },

    grantCup: function(floor, diff) {
        var prog = this._ensureProgress();
        if (!prog) return;
        var cur = prog.floors[floor - 1].cups || 0;
        if (diff > cur) prog.floors[floor - 1].cups = diff;
        Sherwood.saveGame();
        console.log('🏆 Кубок выдан: этаж ' + floor + ', сложность ' + diff + ', всего кубков: ' + this.getTotalCups());
    },

    // === СУММА ВСЕХ КУБКОВ ===
    getTotalCups: function() {
        var prog = this._ensureProgress();
        if (!prog) return 0;
        var total = 0;
        for (var i = 0; i < prog.floors.length; i++) {
            total += prog.floors[i].cups || 0;
        }
        return total;
    },

    // === БИЛЕТЫ ПОДЗЕМКИ (в сумке) ===
    getEntranceTickets: function() {
        if (Sherwood.Bag && Sherwood.Bag.getTicketCount) return Sherwood.Bag.getTicketCount('entrance');
        return 0;
    },

    spendEntranceTicket: function() {
        if (Sherwood.Bag && Sherwood.Bag.removeItem) {
            var items = Sherwood.Bag.getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === 'entrance_ticket') {
                    Sherwood.Bag.removeItem(i, 1);
                    return true;
                }
            }
        }
        return false;
    },

    // === БИЛЕТЫ АВТОБОЯ (в сумке) ===
    getAutoFightTickets: function() {
        if (Sherwood.Bag && Sherwood.Bag.getTicketCount) return Sherwood.Bag.getTicketCount('autofight');
        return 0;
    },

    spendAutoFightTicket: function() {
        if (Sherwood.Bag && Sherwood.Bag.removeItem) {
            var items = Sherwood.Bag.getItems();
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === 'autofight_ticket') {
                    Sherwood.Bag.removeItem(i, 1);
                    return true;
                }
            }
        }
        return false;
    },

    // === ДОКУПКА БИЛЕТОВ ===
    getBuyTicketCost: function(type) {
        var p = Sherwood.getPlayer();
        if (!p) return 0;
        if (!p._ticketBuyCount) p._ticketBuyCount = { entrance: 0, autofight: 0 };
        var count = p._ticketBuyCount[type] || 0;
        if (type === 'entrance') {
            return 30 + Math.floor(count / 3) * 5;
        } else {
            return 20 + Math.floor(count / 3) * 5;
        }
    },

    buyTicket: function(type) {
        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };
        var cost = this.getBuyTicketCost(type);
        if ((p.resources.gold || 0) < cost) {
            return { success: false, reason: 'Не хватает ' + cost + ' золота' };
        }
        p.resources.gold -= cost;
        if (!p._ticketBuyCount) p._ticketBuyCount = { entrance: 0, autofight: 0 };
        p._ticketBuyCount[type] = (p._ticketBuyCount[type] || 0) + 1;

        if (type === 'entrance') {
            Sherwood.Bag._addAsItem('entranceTickets', 1);
        } else {
            Sherwood.Bag._addAsItem('autoFightTickets', 1);
        }
        Sherwood.saveGame();
        return { success: true, cost: cost };
    },

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        this._ensureProgress();
        Sherwood.saveGame();
        console.log('🏚️ Dungeon логика инициализирована');
    },

    generate: function(dungeonId, level) {
        // Проверяем билет подземки
        if (!this.spendEntranceTicket()) {
            return null;
        }

        var size = 15;
        var map = [];
        for (var i = 0; i < size; i++) {
            map[i] = [];
            for (var j = 0; j < size; j++) {
                map[i][j] = 1;
            }
        }

        var stack = [];
        var startX = 1, startY = 1;
        map[startY][startX] = 0;
        stack.push({x: startX, y: startY});
        var dirs = [{x: 0, y: -2}, {x: 0, y: 2}, {x: -2, y: 0}, {x: 2, y: 0}];

        while (stack.length > 0) {
            var current = stack[stack.length - 1];
            var neighbors = [];
            for (var d = 0; d < dirs.length; d++) {
                var dir = dirs[d];
                var nx = current.x + dir.x;
                var ny = current.y + dir.y;
                if (nx > 0 && nx < size-1 && ny > 0 && ny < size-1 && map[ny][nx] === 1) {
                    neighbors.push({x: nx, y: ny, dx: dir.x/2, dy: dir.y/2});
                }
            }
            if (neighbors.length > 0) {
                var next = neighbors[Math.floor(Math.random() * neighbors.length)];
                map[next.y][next.x] = 0;
                map[current.y + next.dy][current.x + next.dx] = 0;
                stack.push({x: next.x, y: next.y});
            } else {
                stack.pop();
            }
        }
        map[size-2][size-2] = 0;

        this._dungeon = {
            id: dungeonId,
            level: level,
            size: size,
            map: map,
            grid: map,
            px: 1,
            py: 1,
            monstersKilled: 0,
            totalMonsters: 5,
            minToKill: 3
        };
        return this._dungeon;
    },

    getDungeon: function() {
        return this._dungeon;
    },

    _startDungeon: function(id, level) {
        if (!this.generate(id, level)) {
            UI._showToast('❌ Нет билетов!');
            return;
        }
        UI._stopMusic();
        if (typeof Sherwood.Dungeon2D5 !== 'undefined' && Sherwood.Dungeon2D5.render) {
            Sherwood.Dungeon2D5.render();
        } else {
            UI._showToast('⚠️ 3D подземка недоступна');
        }
    },

    // === ВХОД НА ЭТАЖ (ручной) ===
    _enterFloor: function(floor, diff) {
        UI._playSound('click');
        UI._stopMusic();

        var tickets = this.getEntranceTickets();
        if (tickets <= 0) {
            UI._showToast('❌ Нет ключей! Докупить за ' + this.getBuyTicketCost('entrance') + ' золота?');
            // Здесь можно показать окно докупки, но пока просто тост
            return;
        }

        try {
            if (window.stopMainMusic) window.stopMainMusic();
            if (window.audioPlayer) {
                window.audioPlayer.pause();
                window.audioPlayer.currentTime = 0;
                window.audioPlayer.src = '';
            }
            if (window.isMusicPlaying !== undefined) window.isMusicPlaying = false;
        } catch(e){}

        UI._lastFloor = floor;
        UI._lastDiff = diff;

        // Списываем билет
        this.spendEntranceTicket();

        var iframe = document.createElement('iframe');
        iframe.src = 'dungeon.html?dungeon=1&floor=' + floor + '&diff=' + diff;
        iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;z-index:100;';
        if (UI._screenLayer) {
            UI._screenLayer.innerHTML = '';
            UI._screenLayer.appendChild(iframe);
            UI._screenLayer.style.display = 'block';
        }
    },

    // === АВТОБОЙ ===
    startAutoFight: function(floor, diff) {
        var cups = this.getFloorCups(floor);
        if (cups < diff) {
            return { success: false, reason: 'Этаж не пройден на этой сложности' };
        }

        var tickets = this.getAutoFightTickets();
        if (tickets <= 0) {
            return { success: false, reason: 'Нет билетов автобоя! Докупить за ' + this.getBuyTicketCost('autofight') + ' золота?' };
        }

        this.spendAutoFightTicket();

        // Имитация прохождения: выдаём кубок и награды через 3 секунды
        var self = this;
        setTimeout(function() {
            self.grantCup(floor, diff);
            var p = Sherwood.getPlayer();
            if (p) {
                p.resources.gold = (p.resources.gold || 0) + 100;
                p.resources.silver = (p.resources.silver || 0) + 50;
                if (Sherwood.addExp) Sherwood.addExp(200);
                Sherwood.saveGame();
            }
            UI._showToast('✅ Автобой завершён! Этаж ' + floor + ', сложность ' + diff);
        }, 3000);

        return { success: true };
    },

    // === БЕСПЛАТНЫЙ АВТОБОЙ (15 минут) ===
    startFreeAutoFight: function(floor, diff) {
        var cups = this.getFloorCups(floor);
        if (cups < diff) {
            return { success: false, reason: 'Этаж не пройден на этой сложности' };
        }

        var p = Sherwood.getPlayer();
        if (!p) return { success: false, reason: 'Игрок не найден' };

        if (!p._freeAutoFightTimers) p._freeAutoFightTimers = {};

        var key = floor + '_' + diff;
        if (p._freeAutoFightTimers[key]) {
            return { success: false, reason: 'Уже идёт автобой на этом этаже' };
        }

        p._freeAutoFightTimers[key] = Date.now() + 15 * 60 * 1000;
        Sherwood.saveGame();

        UI._showToast('⏳ Бесплатный автобой начат. Награды через 15 минут.');

        return { success: true };
    },

    // === ПРОВЕРКА ЗАВЕРШЁННЫХ БЕСПЛАТНЫХ АВТОБОЕВ ===
    checkFreeAutoFights: function() {
        var p = Sherwood.getPlayer();
        if (!p || !p._freeAutoFightTimers) return;

        var now = Date.now();
        for (var key in p._freeAutoFightTimers) {
            if (now >= p._freeAutoFightTimers[key]) {
                var parts = key.split('_');
                var floor = parseInt(parts[0]);
                var diff = parseInt(parts[1]);
                this.grantCup(floor, diff);
                p.resources.gold = (p.resources.gold || 0) + 100;
                p.resources.silver = (p.resources.silver || 0) + 50;
                if (Sherwood.addExp) Sherwood.addExp(200);
                delete p._freeAutoFightTimers[key];
                UI._showToast('✅ Бесплатный автобой завершён! Этаж ' + floor);
            }
        }
        Sherwood.saveGame();
    },

    showUI: function() {
        if (typeof UI === 'undefined') return;
        UI._playSound('click');

        var h = '<div style="text-align:center;padding:10px;background:url(\'assets/assets2/Sherwood_Square/substrate.png\') center/cover no-repeat;">';
        h += '<div style="color:#e0c080;font-size:22px;font-weight:bold;margin-bottom:20px;">🏚️ Подземка</div>';
        h += '<img src="assets/dungeon_tiles/visual_dungeon/the_cursed_thicket.png" style="width:120px;height:120px;object-fit:contain;margin:0 auto 15px;display:block;">';
        h += '<div style="display:flex;justify-content:center;gap:10px;margin-bottom:20px;">';
        h += '<button onclick="Sherwood.Dungeon._startDungeon(\'forest\', 1)" style="padding:12px 24px;background:#c9a040;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;">⚔️ Войти в Проклятую чащу</button>';
        h += '</div>';
        h += '</div>';

        UI._openScreenScrollable('🏚️ Подземка', null, h, 'UI.loadHome()');
    },

    showFloors: function(dungeonId) {
        if (typeof UI === 'undefined') return;
        UI._playSound('click');
        UI._stopMusic();

        try {
            if (window.stopMainMusic) window.stopMainMusic();
            if (UI._currentMusic) {
                UI._currentMusic.pause();
                UI._currentMusic.currentTime = 0;
                UI._currentMusic = null;
                UI._currentMusicKey = null;
            }
        } catch(e){}

        var h = '<div style="position:absolute;top:0;left:0;width:100%;min-height:100%;background:url(\'assets/assets2/backgrounds/visual_dungeon.png\') center/cover no-repeat;padding:60px 12px 20px;box-sizing:border-box;">';
        h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:420px;margin:0 auto;">';

        for (var n = 1; n <= 6; n++) {
            var cups = this.getFloorCups(n);
            var f1 = this.isFloorAvailable(n, 1);
            var f2 = this.isFloorAvailable(n, 2);
            var f3 = this.isFloorAvailable(n, 3);

            h += '<div style="position:relative;width:100%;padding-bottom:100%;background:url(\'assets/dungeon_tiles/visual_dungeon/grotto_tiles_1.png\') center/cover no-repeat;border:2px solid #6b5a3a;border-radius:10px;box-shadow:0 4px 12px rgba(0,0,0,0.7);">';
            h += '<div style="position:absolute;top:4px;left:50%;transform:translateX(-50%);color:#ffa500;font-size:16px;font-weight:bold;text-shadow:0 0 6px #000,0 2px 4px #000;white-space:nowrap;">ЭТАЖ ' + n + '</div>';

            if (!f1) {
                h += '<img src="assets/assets2/game_details/closed_level_lock_icon.png" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:44px;height:44px;object-fit:contain;opacity:0.9;pointer-events:none;">';
            }

            h += '<div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);display:flex;gap:4px;">';
            for (var k = 1; k <= 3; k++) {
                var hasCup = cups >= k;
                var isOpen = (k === 1 && f1) || (k === 2 && f2) || (k === 3 && f3);
                var borderColor = hasCup ? '#ffd700' : (isOpen ? '#8b6b3a' : '#333');
                var bgColor = hasCup ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)';
                var clickAttr = isOpen ? 'onclick="event.stopPropagation();Sherwood.Dungeon._enterFloor(' + n + ',' + k + ')"' : '';
                var cursor = isOpen ? 'pointer' : 'not-allowed';

                h += '<div ' + clickAttr + ' style="cursor:' + cursor + ';width:26px;height:26px;border-radius:50%;background:' + bgColor + ';border:2px solid ' + borderColor + ';display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;pointer-events:auto;">';
                if (hasCup) {
                    h += '<img src="assets/interface/resource_cup_for_completed_tasks.png" style="width:20px;height:20px;object-fit:contain;">';
                } else if (!isOpen) {
                    h += '<span style="color:#666;font-size:12px;font-weight:bold;">🔒</span>';
                } else {
                    h += '<span style="color:#8b6b3a;font-size:11px;font-weight:bold;">' + k + '</span>';
                }
                h += '</div>';
            }
            h += '</div>';
            h += '</div>';
        }

        h += '</div>';
        h += '</div>';

        UI._openScreenScrollable('🏚️ Проклятая чаща', null, h, 'UI.dungeon()');
    }
};

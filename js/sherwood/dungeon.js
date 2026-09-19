/**
 * Sherwood Dungeon — Рабочая версия (перенос твоего newlabir.html)
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

// ============================================================
//  ЛОГИКА (Sherwood.Dungeon)
// ============================================================
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
        console.log('🏆 Кубок выдан: этаж ' + floor + ', сложность ' + diff + ', чаш теперь: ' + prog.floors[floor - 1].cups);
    },

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.dungeon) {
            p.dungeon = { tickets: 15, maxTickets: 15 };
        }
        this._ensureProgress();
        Sherwood.saveGame();
        console.log('🏚️ Dungeon логика инициализирована');
    },

    generate: function(dungeonId, level) {
        var p = Sherwood.getPlayer();
        if (!p) return null;
        if ((p.dungeon && p.dungeon.tickets) <= 0) return null;
        p.dungeon.tickets--;
        Sherwood.saveGame();

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
    },

    _enterFloor: function(floor, diff) {
        UI._playSound('click');
        UI._stopMusic();

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

        var iframe = document.createElement('iframe');
        iframe.src = 'dungeon.html?dungeon=1&floor=' + floor + '&diff=' + diff;
        iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;z-index:100;';
        if (UI._screenLayer) {
            UI._screenLayer.innerHTML = '';
            UI._screenLayer.appendChild(iframe);
            UI._screenLayer.style.display = 'block';
        }
    }
};

// ============================================================
//  РЕНДЕР (Sherwood.Dungeon2D5)
// ============================================================
Sherwood.Dungeon2D5 = {
    _scene: null,
    _camera: null,
    _renderer: null,
    _group: null,
    _dungeon: null,
    _dir: 0,
    _isMoving: false,
    _isTurning: false,
    _yaw: 0,
    _renderLoop: null,
    _w: 480,
    _h: 800,

    init: function() {
        this._w = UI._screenLayer ? UI._screenLayer.clientWidth : 480;
        this._h = UI._screenLayer ? UI._screenLayer.clientHeight : 800;
        this._setupThree();
        this._setupControls();
    },

    _setupThree: function() {
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x1a1208);
        this._scene.fog = new THREE.Fog(0x1a1208, 7, 16);

        this._camera = new THREE.PerspectiveCamera(65, this._w / this._h, 0.1, 25);
        this._camera.position.set(0, 0.65, 0);
        this._camera.rotation.order = 'YXZ';

        this._renderer = new THREE.WebGLRenderer({ antialias: false });
        this._renderer.setSize(this._w, this._h);
        this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        this._renderer.setClearColor(0x1a1208, 1);

        this._scene.add(new THREE.AmbientLight(0x887766, 1.0));
        const mainLight = new THREE.DirectionalLight(0xffeedd, 1.2);
        mainLight.position.set(5, 10, 5);
        this._scene.add(mainLight);
        const fillLight = new THREE.DirectionalLight(0x998877, 0.6);
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
        this._exitBtn.addEventListener('click', function() { UI.loadHome(); });
        this._topPanel.appendChild(this._exitBtn);

        this._joystick = document.createElement('div');
        this._joystick.style.cssText = 'position:fixed;bottom:50px;left:50%;transform:translateX(-50%);width:180px;height:180px;z-index:30;pointer-events:auto;';

        var arrowAreas = [
            { id: 'forward', top: '0px', left: '62px', icon: '▲', func: function() { self._moveForward(); } },
            { id: 'left', top: '62px', left: '0px', icon: '◀', func: function() { self._turnLeft(); } },
            { id: 'right', top: '62px', left: '124px', icon: '▶', func: function() { self._turnRight(); } },
            { id: 'back', top: '124px', left: '62px', icon: '▼', func: function() { self._moveBackward(); } }
        ];

        arrowAreas.forEach(function(a) {
            var btn = document.createElement('button');
            btn.style.cssText = 'position:absolute;width:56px;height:56px;background:rgba(10,8,5,0.9);border:2px solid #6b5a3a;border-radius:50%;color:#c8a050;font-size:24px;display:flex;align-items:center;justify-content:center;pointer-events:auto;-webkit-tap-highlight-color:transparent;text-shadow:0 0 8px #8b6b3a;box-shadow:0 0 10px rgba(139,107,58,0.3);top:' + a.top + ';left:' + a.left + ';';
            btn.textContent = a.icon;
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                a.func();
            });
            btn.addEventListener('click', function() {
                a.func();
            });
            self._joystick.appendChild(btn);
        });
    },

    _createWallTexture: function() {
        var canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#5a4a3a';
        ctx.fillRect(0, 0, 128, 128);
        for (var i = 0; i < 50; i++) {
            ctx.fillStyle = 'rgba(' + (40 + Math.random()*40) + ', ' + (30 + Math.random()*30) + ', ' + (20 + Math.random()*20) + ', 0.5)';
            ctx.fillRect(Math.random()*128, Math.random()*128, Math.random()*20+5, Math.random()*20+5);
        }
        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 4; col++) {
                var offset = row % 2 === 0 ? 0 : 16;
                ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                ctx.strokeRect(col*32 + offset, row*16, 32, 16);
            }
        }
        var tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    },

    _createFloorTexture: function() {
        var canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(0, 0, 128, 128);
        for (var i = 0; i < 80; i++) {
            ctx.fillStyle = 'rgba(' + (30 + Math.random()*30) + ', ' + (20 + Math.random()*20) + ', ' + (10 + Math.random()*15) + ', 0.3)';
            ctx.fillRect(Math.random()*128, Math.random()*128, Math.random()*10+2, Math.random()*10+2);
        }
        var tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    },

    _createCeilTexture: function() {
        var canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        var ctx = canvas.getContext('2d');
        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(0, 0, 128, 128);
        for (var i = 0; i < 30; i++) {
            ctx.fillStyle = 'rgba(30, 20, 10, 0.5)';
            ctx.fillRect(Math.random()*128, Math.random()*128, Math.random()*15+3, Math.random()*15+3);
        }
        var tex = new THREE.CanvasTexture(canvas);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        return tex;
    },

    _buildMesh: function() {
        var d = this._dungeon;
        if (!d) return;
        while (this._group.children.length > 0) this._group.remove(this._group.children[0]);

        var size = d.size, wallHeight = 1.1, cellSize = 1, center = Math.floor(size / 2);

        var wallMat = new THREE.MeshStandardMaterial({ map: this._createWallTexture(), roughness: 0.7, metalness: 0.05, emissive: new THREE.Color(0x1a0f08), emissiveIntensity: 0.2 });
        var floorMat = new THREE.MeshStandardMaterial({ map: this._createFloorTexture(), roughness: 0.9, metalness: 0.0 });
        var ceilMat = new THREE.MeshStandardMaterial({ map: this._createCeilTexture(), roughness: 0.9, metalness: 0.0 });

        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                var x = col - center, z = row - center;
                var cell = d.grid[row][col];

                var floor = new THREE.Mesh(new THREE.PlaneGeometry(cellSize, cellSize), floorMat);
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(x, 0, z);
                this._group.add(floor);

                var ceil = new THREE.Mesh(new THREE.PlaneGeometry(cellSize, cellSize), ceilMat);
                ceil.rotation.x = Math.PI / 2;
                ceil.position.set(x, wallHeight, z);
                this._group.add(ceil);

                if (cell && !cell.open && !cell.isPath) {
                    var wall = new THREE.Mesh(new THREE.BoxGeometry(cellSize, wallHeight, cellSize), wallMat);
                    wall.position.set(x, wallHeight / 2, z);
                    this._group.add(wall);
                }

                if (cell && !cell.open && cell.isPath && this._isAdjacentToOpen(d, col, row)) {
                    var wall2 = new THREE.Mesh(new THREE.BoxGeometry(cellSize, wallHeight, cellSize), wallMat);
                    wall2.position.set(x, wallHeight / 2, z);
                    wall2.userData = { openable: true, gridX: col, gridY: row };
                    this._group.add(wall2);
                }
            }
        }

        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                if (d.grid[row][col].open === true && row % 2 === 0 && col % 2 === 0) {
                    var x = col - center, z = row - center;
                    var torch = new THREE.Mesh(
                        new THREE.SphereGeometry(0.05, 6, 6),
                        new THREE.MeshStandardMaterial({
                            color: 0xffaa55,
                            emissive: new THREE.Color(0xff6600),
                            emissiveIntensity: 1.0
                        })
                    );
                    torch.position.set(x, wallHeight - 0.05, z);
                    this._group.add(torch);

                    var light = new THREE.PointLight(0xff8844, 0.5, 4);
                    light.position.set(x, wallHeight - 0.1, z);
                    this._group.add(light);
                }
            }
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

    _updateCamera: function() {
        var d = this._dungeon;
        if (!d) return;
        var center = Math.floor(d.size / 2);
        var posX = d.px - center, posZ = d.py - center;
        this._camera.position.set(posX, 0.65, posZ);
        this._camera.quaternion.setFromEuler(new THREE.Euler(0, -this._dir * Math.PI / 2, 0, 'YXZ'));
    },

    _moveForward: function() {
        if (this._isMoving || this._isTurning) return;
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
    },

    _moveBackward: function() {
        if (this._isMoving || this._isTurning) return;
        var d = this._dungeon;
        if (!d) return;
        var dx = 0, dy = 0;
        if (this._dir === 0) dy = 1;
        else if (this._dir === 1) dx = -1;
        else if (this._dir === 2) dy = -1;
        else dx = 1;
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
    },

    _turnLeft: function() {
        if (this._isMoving || this._isTurning) return;
        this._dir = (this._dir + 3) % 4;
        this._updateCamera();
        this._buildMesh();
    },

    _turnRight: function() {
        if (this._isMoving || this._isTurning) return;
        this._dir = (this._dir + 1) % 4;
        this._updateCamera();
        this._buildMesh();
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
            UI._screenLayer.appendChild(this._joystick);
        }

        UI._screenLayer.style.display = 'block';
        this._isMoving = false;
        this._buildMesh();
        this._updateCamera();
        if (this._renderLoop) cancelAnimationFrame(this._renderLoop);
        this._startLoop();
    },

    _startLoop: function() {
        var self = this;
        var lastTime = performance.now();

        function loop(time) {
            self._renderLoop = requestAnimationFrame(loop);
            var dt = Math.min((time - lastTime) / 1000, 0.1);
            lastTime = time;

            if (self._isMoving) {
                self._moveT += dt * 2.5;
                if (self._moveT >= 1) {
                    self._moveT = 1;
                    self._isMoving = false;
                    var d = self._dungeon;
                    if (d) {
                        d.px = self._toX;
                        d.py = self._toY;
                        self._buildMesh();
                        self._updateCamera();
                    }
                }
            }

            self._updateCamera();
            self._renderer.render(self._scene, self._camera);
        }
        this._renderLoop = requestAnimationFrame(loop);
    },

    destroy: function() {
        if (this._renderLoop) {
            cancelAnimationFrame(this._renderLoop);
            this._renderLoop = null;
        }
        if (this._renderer && this._renderer.domElement.parentNode) this._renderer.domElement.parentNode.removeChild(this._renderer.domElement);
        if (this._joystick && this._joystick.parentNode) this._joystick.parentNode.removeChild(this._joystick);
        if (this._topPanel && this._topPanel.parentNode) this._topPanel.parentNode.removeChild(this._topPanel);
        this._dungeon = null;
        this._isMoving = false;
        this._dir = 0;
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Dungeon = Sherwood.Dungeon;
window.Sherwood.Dungeon2D5 = Sherwood.Dungeon2D5;

console.log('🏚️ Dungeon загружен!');

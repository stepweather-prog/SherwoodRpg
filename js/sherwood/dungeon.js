/**
 * Sherwood Dungeon — Единый файл
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

// ============================================================
//  ЛОГИКА (Sherwood.Dungeon)
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
        if (!p.dungeon) {
            p.dungeon = { tickets: 15, maxTickets: 15, autoTickets: 3 };
        }
        Sherwood.saveGame();
        console.log('🏚️ Dungeon логика инициализирована');
    },

    generate: function(dungeonId, level) {
        var p = Sherwood.getPlayer();
        if (!p) return null;
        var dungeonTickets = (p.dungeon && p.dungeon.tickets) ? p.dungeon.tickets : 0;
        if (dungeonTickets <= 0) return null;
        p.dungeon.tickets--;
        Sherwood.saveGame();
        
        var size = 14;
        var grid = [];
        for (var y = 0; y < size; y++) {
            grid[y] = [];
            for (var x = 0; x < size; x++) {
                grid[y][x] = { type: 0, open: false, isPath: false };
            }
        }
        
        var self = this;
        function carve(x, y) {
            grid[y][x].type = 1;
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
                if (nx > 0 && nx < size-1 && ny > 0 && ny < size-1 && grid[ny][nx].type === 0) {
                    grid[ny][nx].type = 1;
                    grid[y + dirs[i][1]/2][x + dirs[i][0]/2].type = 1;
                    carve(nx, ny);
                }
            }
        }
        
        var startX = 1, startY = 1;
        carve(startX, startY);
        
        for (var y = 1; y < size-1; y++) {
            for (var x = 1; x < size-1; x++) {
                if (grid[y][x].type === 1) {
                    grid[y][x].isPath = true;
                    grid[y][x].type = 0;
                    grid[y][x].open = false;
                }
            }
        }
        
        grid[startY][startX].open = true;
        grid[startY][startX].isPath = true;
        
        this._dungeon = {
            id: dungeonId,
            level: level,
            size: size,
            grid: grid,
            px: startX,
            py: startY,
            monstersKilled: 0,
            totalMonsters: 10,
            minToKill: 5
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
        
        var h = '<div style="text-align:center;padding:10px;">';
        h += '<div style="color:#e0c080;font-size:22px;font-weight:bold;margin-bottom:20px;">🏚️ Подземка</div>';
        h += '<div style="display:flex;justify-content:center;gap:10px;margin-bottom:20px;">';
        h += '<button onclick="Sherwood.Dungeon._startDungeon(\'forest\', 1)" style="padding:12px 24px;background:#c9a040;border:none;border-radius:8px;color:#000;font-weight:bold;cursor:pointer;font-size:14px;">⚔️ Войти в Проклятую чащу</button>';
        h += '</div>';
        h += '</div>';
        
        UI._openScreenScrollable('🏚️ Подземка', null, h, 'UI.loadHome()');
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
    _fromX: 0,
    _fromY: 0,
    _toX: 0,
    _toY: 0,
    _moveT: 0,
    _renderLoop: null,
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
        this._joystick.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);width:300px;height:300px;z-index:10;background:url("assets/dungeon_tiles/visual_dungeon/joystick.png") center/contain no-repeat;';
        
        var arrowAreas = [
            { d: 'forward', top: '10%', left: '38%', width: '24%', height: '24%' },
            { d: 'left', top: '38%', left: '10%', width: '24%', height: '24%' },
            { d: 'right', top: '38%', left: '66%', width: '24%', height: '24%' }
        ];
        arrowAreas.forEach(function(a) {
            var btn = document.createElement('button');
            btn.style.cssText = 'position:absolute;top:' + a.top + ';left:' + a.left + ';width:' + a.width + ';height:' + a.height + ';background:rgba(255,215,0,0.1);border:none;cursor:pointer;z-index:12;transition:background 0.1s, transform 0.1s;';
            btn.addEventListener('mousedown', function(e) {
                e.stopPropagation();
                btn.style.background = 'rgba(255,215,0,0.2)';
                btn.style.transform = 'scale(0.9)';
                if (a.d === 'forward') self._moveForward();
                else if (a.d === 'left') self._turnLeft();
                else if (a.d === 'right') self._turnRight();
            });
            btn.addEventListener('mouseup', function() {
                btn.style.background = 'rgba(255,215,0,0.1)';
                btn.style.transform = 'scale(1)';
            });
            self._joystick.appendChild(btn);
        });
        
        this._renderer.domElement.addEventListener('click', function(e) { self._handleWallClick(e); });
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

    _buildMesh: function() {
        var d = this._dungeon;
        if (!d) return;
        while (this._group.children.length > 0) this._group.remove(this._group.children[0]);
        var size = d.size, wallHeight = 1.2, cellSize = 1, center = Math.floor(size / 2);
        var ceilMat = new THREE.MeshStandardMaterial({ map: this._ceilings[0], roughness: 0.9 });
        var wallMats = this._walls.map(tex => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                var x = col - center, z = row - center;
                var cell = d.grid[row][col];
                var floor = new THREE.Mesh(new THREE.PlaneGeometry(cellSize, cellSize), new THREE.MeshStandardMaterial({ map: this._floors[Math.abs(col * 3 + row * 5) % this._floors.length], roughness: 0.9 }));
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(x, 0, z);
                this._group.add(floor);
                var ceil = new THREE.Mesh(new THREE.PlaneGeometry(cellSize, cellSize), ceilMat);
                ceil.rotation.x = Math.PI / 2;
                ceil.position.set(x, wallHeight, z);
                this._group.add(ceil);
                if (cell && !cell.open && !cell.isPath) {
                    var wall = new THREE.Mesh(new THREE.BoxGeometry(cellSize, wallHeight, cellSize), wallMats[Math.abs(col * 7 + row * 13) % wallMats.length]);
                    wall.position.set(x, wallHeight / 2, z);
                    wall.userData = { openable: false, gridX: col, gridY: row };
                    this._group.add(wall);
                }
                if (cell && !cell.open && cell.isPath && this._isAdjacentToOpen(d, col, row)) {
                    var wall = new THREE.Mesh(new THREE.BoxGeometry(cellSize, wallHeight, cellSize), new THREE.MeshStandardMaterial({ map: this._images.wall_openable, roughness: 0.7 }));
                    wall.position.set(x, wallHeight / 2, z);
                    wall.userData = { openable: true, gridX: col, gridY: row };
                    this._group.add(wall);
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
        this._checkInteract();
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
                        self._checkInteract();
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

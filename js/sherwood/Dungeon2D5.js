Sherwood.Dungeon2D5 = {
    _scene: null,
    _camera: null,
    _renderer: null,
    _group: null,
    _dungeon: null,
    _dir: 0,
    _isMoving: false,
    _isTurning: false,
    _fromX: 0,
    _fromY: 0,
    _toX: 0,
    _toY: 0,
    _moveT: 0,
    _turnT: 0,
    _turnFrom: 0,
    _yaw: 0,
    _renderLoop: null,
    _joystick: null,
    _joystickImg: null,
    _interactBtn: null,
    _interactBtnImg: null,
    _interactType: null,
    _walls: [],
    _floors: [],
    _ceilings: [],
    _images: {},
    _animImages: {},
    _monsterImages: {},
    _w: 480,
    _h: 800,

    init: function() {
        this._w = SherwoodUI.container ? SherwoodUI.container.clientWidth : 480;
        this._h = SherwoodUI.container ? SherwoodUI.container.clientHeight : 800;
        
        this._loadTextures();
        this._setupThree();
        this._setupControls();
    },

    _loadTextures: function() {
        const loader = new THREE.TextureLoader();
        
        function loadTex(src) {
            const tex = loader.load(src);
            tex.wrapS = THREE.RepeatWrapping;
            tex.wrapT = THREE.RepeatWrapping;
            return tex;
        }
        
        for (let i = 1; i <= 6; i++) {
            this._walls.push(loadTex('assets/dungeon_tiles/visual_dungeon/wall_' + i + '.png'));
        }
        for (let i = 8; i <= 13; i++) {
            this._floors.push(loadTex('assets/dungeon_tiles/dungeon1/tiles' + i + '.jpeg'));
        }
        for (let i = 1; i <= 6; i++) {
            this._ceilings.push(loadTex('assets/dungeon_tiles/visual_dungeon/ceiling_dungeon_' + i + '.png'));
        }
        
        this._images.wall_openable = loadTex('assets/interface/labyrinth_asset.png');
        
        const objs = {
            altar: 'altar_of_the_first_dungeon.png',
            cauldron: 'cauldron_first_dungeon.png',
            potion: 'resource_life_potion.png',
            chest_locked: 'locked_chest_first_dungeon.png',
            chest_open: 'open_chest_first_dungeon.png',
            loot_bag: 'loot_bag_of_beasts.png',
            loot_bag_empty: 'empty_bag_of_loot_beasts.png',
            exit: 'exit_completion_dungeon.png',
            exit_locked: 'closed_level_lock_icon.png'
        };
        
        for (let key in objs) {
            this._images[key] = loadTex('assets/interface/' + objs[key]);
        }
        
        this._animImages.down = loadTex('assets/animation/step_down.png');
        this._animImages.up = loadTex('assets/animation/step_up.png');
        this._animImages.left = loadTex('assets/animation/step_left.png');
        this._animImages.right = loadTex('assets/animation/step_right.png');
    },

    _setupThree: function() {
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(0x1a0f08);
        this._scene.fog = new THREE.Fog(0x1a0f08, 6, 12);
        
        this._camera = new THREE.PerspectiveCamera(70, this._w / this._h, 0.1, 30);
        this._camera.rotation.order = 'YXZ';
        
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setSize(this._w, this._h);
        this._renderer.setPixelRatio(1);
        this._renderer.setClearColor(0x1a0f08, 1);
        
        const ambient = new THREE.AmbientLight(0x442211, 0.6);
        this._scene.add(ambient);
        
        const mainLight = new THREE.DirectionalLight(0xffcc88, 0.8);
        mainLight.position.set(5, 10, 5);
        this._scene.add(mainLight);
        
        const fillLight = new THREE.DirectionalLight(0x885533, 0.3);
        fillLight.position.set(-5, 2, -5);
        this._scene.add(fillLight);
        
        this._group = new THREE.Group();
        this._scene.add(this._group);
    },

    _setupControls: function() {
        const self = this;
        
        this._joystick = document.createElement('div');
        this._joystick.style.cssText = 'position:absolute;bottom:130px;left:50%;transform:translateX(-50%);width:200px;height:200px;border-radius:50%;background:rgba(0,0,0,0.65);border:3px solid #c9a040;z-index:10;';
        
        this._joystickImg = document.createElement('img');
        this._joystickImg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;object-fit:contain;';
        this._joystickImg.src = this._animImages.down && this._animImages.down.image ? this._animImages.down.image.src : '';
        this._joystick.appendChild(this._joystickImg);
        
        const arrows = [
            { d: 'forward', cx: 100, cy: 10, rot: 0 },
            { d: 'left', cx: 10, cy: 100, rot: -90 },
            { d: 'right', cx: 190, cy: 100, rot: 90 }
        ];
        
        arrows.forEach(function(a) {
            const btn = document.createElement('button');
            btn.style.cssText = 'position:absolute;left:' + (a.cx - 28) + 'px;top:' + (a.cy - 28) + 'px;width:56px;height:56px;border-radius:50%;background:#c9a040;border:2px solid #8b6914;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:12;';
            btn.innerHTML = '<span style="transform:rotate(' + a.rot + 'deg);font-size:24px;color:#000;font-weight:bold;">▲</span>';
            
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (a.d === 'forward') self._moveForward();
                else if (a.d === 'left') self._turnLeft();
                else if (a.d === 'right') self._turnRight();
            });
            
            self._joystick.appendChild(btn);
        });
        
        const bottomBtn = document.createElement('div');
        bottomBtn.style.cssText = 'position:absolute;left:72px;top:172px;width:56px;height:56px;border-radius:50%;background:rgba(0,0,0,0.3);border:2px solid #555;z-index:12;';
        this._joystick.appendChild(bottomBtn);
        
        this._interactBtn = document.createElement('button');
        this._interactBtn.style.cssText = 'position:absolute;bottom:360px;left:50%;transform:translateX(-50%);width:90px;height:90px;border-radius:50%;background:rgba(0,0,0,0.85);border:3px solid #ffd700;cursor:pointer;display:none;align-items:center;justify-content:center;z-index:11;';
        this._interactBtnImg = document.createElement('img');
        this._interactBtnImg.style.cssText = 'width:64px;height:64px;object-fit:contain;';
        this._interactBtn.appendChild(this._interactBtnImg);
        this._interactBtn.addEventListener('click', function() { self._onInteract(); });
        
        // Клик по канвасу для открытия стен
        this._renderer.domElement.addEventListener('click', function(e) {
            self._handleWallClick(e);
        });
        
        this._renderer.domElement.addEventListener('touchend', function(e) {
            if (e.changedTouches && e.changedTouches[0]) {
                self._handleWallClick(e.changedTouches[0]);
            }
        });
    },

    _handleWallClick: function(e) {
        if (this._isMoving || this._isTurning) return;
        
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
                const gridX = obj.userData.gridX;
                const gridY = obj.userData.gridY;
                
                const dir = ((Math.round(this._yaw / (Math.PI / 2)) % 4) + 4) % 4;
                
                let dx = 0, dy = 0;
                if (dir === 0) dy = -1;
                else if (dir === 1) dx = 1;
                else if (dir === 2) dy = 1;
                else dx = -1;
                
                const frontX = d.px + dx;
                const frontY = d.py + dy;
                
                if (gridX === frontX && gridY === frontY) {
                    this._openWall(gridX, gridY);
                    break;
                }
            }
        }
    },

    _openWall: function(gridX, gridY) {
        const d = this._dungeon;
        if (!d) return;
        
        const cell = d.grid[gridY][gridX];
        if (!cell) return;
        
        cell.open = true;
        
        if (cell.monster) {
            const monsterId = cell.monsterId;
            const isBoss = cell.isBoss || false;
            
            d.px = gridX;
            d.py = gridY;
            
            this._buildMesh();
            this._updateCamera();
            this._updateJoystickAnim();
            this._renderer.render(this._scene, this._camera);
            
            Sherwood.Combat.start(monsterId, isBoss, 'dungeon');
            setTimeout(function() {
                SherwoodUI._showCombatScreen();
            }, 400);
        } else {
            if (SherwoodUI && SherwoodUI._playSound) {
                SherwoodUI._playSound('tile_open');
            }
            this._buildMesh();
            this._checkInteract();
        }
    },

    _moveForward: function() {
        if (this._isMoving || this._isTurning) return;
        
        const d = this._dungeon;
        if (!d) return;
        
        const dir = ((Math.round(this._yaw / (Math.PI / 2)) % 4) + 4) % 4;
        
        let dx = 0, dy = 0;
        if (dir === 0) dy = -1;
        else if (dir === 1) dx = 1;
        else if (dir === 2) dy = 1;
        else dx = -1;
        
        const nx = d.px + dx;
        const ny = d.py + dy;
        
        if (nx < 0 || nx >= d.size || ny < 0 || ny >= d.size) return;
        
        const cell = d.grid[ny][nx];
        if (!cell || !cell.open) return;
        
        this._fromX = d.px;
        this._fromY = d.py;
        this._toX = nx;
        this._toY = ny;
        this._moveT = 0;
        this._isMoving = true;
    },

    _turnLeft: function() {
        if (this._isMoving || this._isTurning) return;
        this._turnFrom = this._yaw;
        this._yaw += Math.PI / 2;
        this._turnT = 0;
        this._isTurning = true;
    },

    _turnRight: function() {
        if (this._isMoving || this._isTurning) return;
        this._turnFrom = this._yaw;
        this._yaw -= Math.PI / 2;
        this._turnT = 0;
        this._isTurning = true;
    },

    _onInteract: function() {
        if (!this._interactType) return;
        
        const d = this._dungeon;
        if (!d) return;
        
        const cell = d.grid[d.py][d.px];
        if (!cell) return;
        
        switch(this._interactType) {
            case 'lootBag': if (cell.lootBag && !cell.lootCollected) SherwoodUI._collectLootBag(); break;
            case 'chest': if (cell.chest && !cell.looted) SherwoodUI._collectChest(); break;
            case 'altar': if (cell.altar && !cell.altarCollected) SherwoodUI._collectAltar(); break;
            case 'cauldron': if (cell.cauldron && !cell.cauldronCollected) SherwoodUI._collectCauldron(); break;
            case 'potion': if (cell.potion && !cell.potionCollected) SherwoodUI._collectPotion(); break;
            case 'exit': if (cell.exit && !cell.locked) SherwoodUI._doStep(d.px, d.py); break;
        }
        
        this._interactType = null;
        this._interactBtn.style.display = 'none';
    },

    _checkInteract: function() {
        const d = this._dungeon;
        if (!d) return;
        
        const cell = d.grid[d.py][d.px];
        if (!cell) return;
        
        let type = null;
        let icon = null;
        
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

    _buildMesh: function() {
        const d = this._dungeon;
        if (!d) return;
        
        while (this._group.children.length > 0) {
            this._group.remove(this._group.children[0]);
        }
        
        const size = d.size;
        const wallHeight = 1.2;
        const cellSize = 1;
        const center = Math.floor(size / 2);
        
        const wallMats = this._walls.map(function(tex) {
            return new THREE.MeshStandardMaterial({
                map: tex,
                roughness: 0.7,
                metalness: 0.1
            });
        });
        
        const floorMats = this._floors.map(function(tex) {
            return new THREE.MeshStandardMaterial({
                map: tex,
                roughness: 0.9,
                metalness: 0.0
            });
        });
        
        const ceilMats = this._ceilings.map(function(tex) {
            return new THREE.MeshStandardMaterial({
                map: tex,
                roughness: 0.9,
                metalness: 0.0
            });
        });
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const x = col - center;
                const z = row - center;
                const cell = d.grid[row][col];
                const isWall = cell && !cell.open;
                
                const texIdx = (Math.abs(col * 7 + row * 13) + Math.round(this._yaw / (Math.PI / 2))) % 6;
                
                const floor = new THREE.Mesh(
                    new THREE.PlaneGeometry(cellSize, cellSize),
                    floorMats[texIdx % floorMats.length]
                );
                floor.rotation.x = -Math.PI / 2;
                floor.position.set(x, 0, z);
                this._group.add(floor);
                
                const ceil = new THREE.Mesh(
                    new THREE.PlaneGeometry(cellSize, cellSize),
                    ceilMats[texIdx % ceilMats.length]
                );
                ceil.rotation.x = Math.PI / 2;
                ceil.position.set(x, wallHeight, z);
                this._group.add(ceil);
                
                if (isWall) {
                    let canOpen = false;
                    const dirs = [[0,-1],[0,1],[-1,0],[1,0]];
                    for (let di = 0; di < dirs.length; di++) {
                        const nx = col + dirs[di][0];
                        const ny = row + dirs[di][1];
                        if (nx >= 0 && nx < size && ny >= 0 && ny < size) {
                            const neighbor = d.grid[ny][nx];
                            if (neighbor && neighbor.open) {
                                canOpen = true;
                                break;
                            }
                        }
                    }
                    
                    let mat;
                    if (canOpen && this._images.wall_openable) {
                        mat = new THREE.MeshStandardMaterial({
                            map: this._images.wall_openable,
                            roughness: 0.7,
                            metalness: 0.1,
                            transparent: true,
                            opacity: 0.85
                        });
                    } else {
                        mat = wallMats[texIdx % wallMats.length];
                    }
                    
                    const wall = new THREE.Mesh(
                        new THREE.BoxGeometry(cellSize, wallHeight, cellSize),
                        mat
                    );
                    wall.position.set(x, wallHeight / 2, z);
                    wall.userData = { openable: canOpen, gridX: col, gridY: row };
                    this._group.add(wall);
                }
            }
        }
        
        this._addObjectSprites();
    },

    _addObjectSprites: function() {
        const d = this._dungeon;
        if (!d) return;
        
        const size = d.size;
        const center = Math.floor(size / 2);
        
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const cell = d.grid[row][col];
                if (!cell || !cell.open) continue;
                
                let tex = null;
                
                if (cell.monster) {
                    const id = cell.monsterId || 'plague_crow.png';
                    if (!this._monsterImages[id]) {
                        const loader = new THREE.TextureLoader();
                        this._monsterImages[id] = loader.load('assets/all_beasts/' + id);
                    }
                    tex = this._monsterImages[id];
                } else if (cell.lootBag && !cell.lootCollected) tex = this._images.loot_bag;
                else if (cell.chest && !cell.looted) tex = this._images.chest_locked;
                else if (cell.altar && !cell.altarCollected) tex = this._images.altar;
                else if (cell.cauldron && !cell.cauldronCollected) tex = this._images.cauldron;
                else if (cell.potion && !cell.potionCollected) tex = this._images.potion;
                else if (cell.exit && cell.locked) tex = this._images.exit_locked;
                else if (cell.exit && !cell.locked) tex = this._images.exit;
                
                if (tex && tex.image) {
                    const spriteMat = new THREE.SpriteMaterial({
                        map: tex,
                        transparent: true
                    });
                    const sprite = new THREE.Sprite(spriteMat);
                    sprite.position.set(col - center, 0.5, row - center);
                    sprite.scale.set(0.6, 0.6, 1);
                    this._group.add(sprite);
                }
            }
        }
    },

    _updateCamera: function() {
        const d = this._dungeon;
        if (!d) return;
        
        const center = Math.floor(d.size / 2);
        
        let posX = d.px - center;
        let posZ = d.py - center;
        
        if (this._isMoving) {
            const t = this._ease(this._moveT);
            posX = (this._fromX - center) + ((this._toX - center) - (this._fromX - center)) * t;
            posZ = (this._fromY - center) + ((this._toY - center) - (this._fromY - center)) * t;
        }
        
        this._camera.position.set(posX, 0.7, posZ);
        
        let yaw = this._yaw;
        if (this._isTurning) {
            const t = this._ease(this._turnT);
            const diff = this._yaw - this._turnFrom;
            yaw = this._turnFrom + diff * t;
        }
        
        const euler = new THREE.Euler(0, yaw, 0, 'YXZ');
        this._camera.quaternion.setFromEuler(euler);
    },

    _updateJoystickAnim: function() {
        if (!this._joystickImg) return;
        
        const dirIndex = ((Math.round(this._yaw / (Math.PI / 2)) % 4) + 4) % 4;
        const dirIcons = ['down', 'right', 'up', 'left'];
        const iconName = dirIcons[dirIndex] || 'down';
        
        if (this._animImages[iconName] && this._animImages[iconName].image) {
            this._joystickImg.src = this._animImages[iconName].image.src;
        }
    },

    _ease: function(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    render: function() {
        this._dungeon = Sherwood.Dungeon.getDungeon();
        if (!this._dungeon) return;
        
        if (!this._scene) this.init();
        
        if (this._renderer.domElement.parentNode !== SherwoodUI._screenLayer) {
            SherwoodUI._screenLayer.innerHTML = '';
            SherwoodUI._screenLayer.appendChild(this._renderer.domElement);
            SherwoodUI._screenLayer.appendChild(this._joystick);
            SherwoodUI._screenLayer.appendChild(this._interactBtn);
        }
        
        SherwoodUI._screenLayer.style.display = 'block';
        
        this._yaw = 0;
        this._isMoving = false;
        this._isTurning = false;
        
        this._buildMesh();
        this._updateCamera();
        this._updateJoystickAnim();
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
                if (self._moveT >= 1) {
                    self._moveT = 1;
                    self._isMoving = false;
                    
                    const d = self._dungeon;
                    if (d) {
                        d.px = self._toX;
                        d.py = self._toY;
                        
                        const cell = d.grid[d.py][d.px];
                        if (cell && cell.monster) {
                            self._updateCamera();
                            self._updateJoystickAnim();
                            self._renderer.render(self._scene, self._camera);
                            
                            const monsterId = cell.monsterId;
                            const isBoss = cell.isBoss || false;
                            
                            Sherwood.Combat.start(monsterId, isBoss, 'dungeon');
                            setTimeout(function() {
                                SherwoodUI._showCombatScreen();
                            }, 400);
                            return;
                        }
                        
                        self._checkInteract();
                        self._buildMesh();
                    }
                }
            }
            
            if (self._isTurning) {
                self._turnT += dt * 3;
                if (self._turnT >= 1) {
                    self._turnT = 1;
                    self._isTurning = false;
                }
            }
            
            self._updateCamera();
            self._updateJoystickAnim();
            self._renderer.render(self._scene, self._camera);
        }
        
        this._renderLoop = requestAnimationFrame(loop);
    },

    destroy: function() {
        if (this._renderLoop) {
            cancelAnimationFrame(this._renderLoop);
            this._renderLoop = null;
        }
        
        if (this._renderer && this._renderer.domElement.parentNode) {
            this._renderer.domElement.parentNode.removeChild(this._renderer.domElement);
        }
        if (this._joystick && this._joystick.parentNode) {
            this._joystick.parentNode.removeChild(this._joystick);
        }
        if (this._interactBtn && this._interactBtn.parentNode) {
            this._interactBtn.parentNode.removeChild(this._interactBtn);
        }
        
        this._dungeon = null;
        this._isMoving = false;
        this._isTurning = false;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (typeof Sherwood !== 'undefined' && typeof SherwoodUI !== 'undefined') {
        Sherwood.Dungeon2D5.init();
    }
});

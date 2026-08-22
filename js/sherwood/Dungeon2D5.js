Sherwood.Dungeon2D5 = {
    _scene: null,
    _camera: null,
    _renderer: null,
    _group: null,
    _dungeon: null,
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
        for (let i = 1; i <= 6; i++) this._walls.push(loadTex('assets/dungeon_tiles/visual_dungeon/wall_' + i + '.png'));
        for (let i = 1; i <= 6; i++) this._floors.push(loadTex('assets/dungeon_tiles/dungeon1/tiles_' + i + '.png'));
        for (let i = 1; i <= 6; i++) this._ceilings.push(loadTex('assets/dungeon_tiles/visual_dungeon/ceiling_dungeon_' + i + '.png'));
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
        this._exitBtn.addEventListener('click', function() { SherwoodUI._leaveDungeon(); });
        this._topPanel.appendChild(this._exitBtn);
        
        this._hpBar = document.createElement('div');
        this._hpBar.style.cssText = 'position:relative;width:150px;height:30px;';
        this._hpBar.innerHTML = '<img src="assets/interface/life_scale.png" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:0;">' +
            '<div style="position:absolute;top:6px;left:15px;right:15px;bottom:6px;overflow:hidden;z-index:1;">' +
            '<div id="hp-fill-2d5" style="background:red;height:100%;width:100%;"></div></div>' +
            '<span id="hp-text-2d5" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:12px;z-index:2;font-weight:bold;"></span>';
        this._topPanel.appendChild(this._hpBar);
        
        this._joystick = document.createElement('div');
        this._joystick.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);width:300px;height:300px;z-index:10;background:url("assets/dungeon_tiles/visual_dungeon/joystick.png") center/contain no-repeat;';
        
        this._joystickImg = document.createElement('img');
        this._joystickImg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;object-fit:contain;pointer-events:none;';
        this._joystickImg.src = 'assets/animation/step_down.png';
        this._joystick.appendChild(this._joystickImg);
        
        const arrowAreas = [
            { d: 'forward', top: '5%', left: '35%', width: '30%', height: '30%' },
            { d: 'left', top: '35%', left: '5%', width: '30%', height: '30%' },
            { d: 'right', top: '35%', left: '65%', width: '30%', height: '30%' }
        ];
        
        arrowAreas.forEach(function(a) {
            const btn = document.createElement('button');
            btn.style.cssText = 'position:absolute;top:' + a.top + ';left:' + a.left + ';width:' + a.width + ';height:' + a.height + ';background:transparent;border:none;cursor:pointer;z-index:12;transition:transform 0.1s;';
            btn.addEventListener('mousedown', function(e) {
                e.stopPropagation();
                btn.style.transform = 'scale(0.8)';
                if (a.d === 'forward') self._moveForward();
                else if (a.d === 'left') self._turnLeft();
                else if (a.d === 'right') self._turnRight();
            });
            btn.addEventListener('mouseup', function() { btn.style.transform = 'scale(1)'; });
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                btn.style.transform = 'scale(0.8)';
                if (a.d === 'forward') self._moveForward();
                else if (a.d === 'left') self._turnLeft();
                else if (a.d === 'right') self._turnRight();
            }, { passive: false });
            btn.addEventListener('touchend', function() { btn.style.transform = 'scale(1)'; });
            self._joystick.appendChild(btn);
        });
        
        this._interactBtn = document.createElement('button');
        this._interactBtn.style.cssText = 'position:absolute;bottom:350px;left:50%;transform:translateX(-50%);width:90px;height:90px;border-radius:50%;background:rgba(0,0,0,0.85);border:3px solid #ffd700;cursor:pointer;display:none;align-items:center;justify-content:center;z-index:11;';
        this._interactBtnImg = document.createElement('img');
        this._interactBtnImg.style.cssText = 'width:64px;height:64px;object-fit:contain;';
        this._interactBtn.appendChild(this._interactBtnImg);
        this._interactBtn.addEventListener('click', function() { self._onInteract(); });
        
        this._renderer.domElement.addEventListener('click', function(e) { self._handleWallClick(e); });
        this._renderer.domElement.addEventListener('touchend', function(e) {
            if (e.changedTouches && e.changedTouches[0]) self._handleWallClick(e.changedTouches[0]);
        });
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
            setTimeout(function() { SherwoodUI._showCombatScreen(); }, 400);
        } else {
            if (SherwoodUI && SherwoodUI._playSound) SherwoodUI._playSound('tile_open');
            this._buildMesh();
            this._updateMinimap();
            this._checkInteract();
        }
    },

    _moveForward: function() {
        if (this._isMoving) return;
        const d = this._dungeon;
        if (!d) return;
        const dirIndex = ((Math.round(this._yaw / (Math.PI / 2)) % 4) + 4) % 4;
        let dx = 0, dy = 0;
        if (dirIndex === 0) dy = -1;
        else if (dirIndex === 1) dx = 1;
        else if (dirIndex === 2) dy = 1;
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
        this._joystickImg.src = 'assets/animation/step_up.png';
    },

    _turnLeft: function() {
        if (this._isMoving) return;
        this._yaw -= Math.PI / 2;
        this._updateCamera();
        this._buildMesh();
        this._updateMinimap();
    },

    _turnRight: function() {
        if (this._isMoving) return;
        this._yaw += Math.PI / 2;
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
            case 'lootBag': if (cell.lootBag && !cell.lootCollected) SherwoodUI._collectLootBag(); break;
            case 'chest': if (cell.chest && !cell.looted) SherwoodUI._collectChest(); break;
            case 'altar': if (cell.altar && !cell.altarCollected) SherwoodUI._collectAltar(); break;
            case 'cauldron': if (cell.cauldron && !cell.cauldronCollected) SherwoodUI._collectCauldron(); break;
            case 'potion': if (cell.potion && !cell.potionCollected) SherwoodUI._collectPotion(); break;
            case 'exit': if (cell.exit && !cell.locked) SherwoodUI._doStep(d.px, d.py); break;
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
            for (let col = 0; col < size; col++) {
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
        this._camera.quaternion.setFromEuler(new THREE.Euler(0, this._yaw, 0, 'YXZ'));
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
        if (this._renderer.domElement.parentNode !== SherwoodUI._screenLayer) {
            SherwoodUI._screenLayer.innerHTML = '';
            SherwoodUI._screenLayer.appendChild(this._renderer.domElement);
            SherwoodUI._screenLayer.appendChild(this._topPanel);
            SherwoodUI._screenLayer.appendChild(this._minimap);
            SherwoodUI._screenLayer.appendChild(this._minimapFrame);
            SherwoodUI._screenLayer.appendChild(this._joystick);
            SherwoodUI._screenLayer.appendChild(this._interactBtn);
        }
        SherwoodUI._screenLayer.style.display = 'block';
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
                if (self._moveT >= 1) {
                    self._moveT = 1;
                    self._isMoving = false;
                    self._joystickImg.src = 'assets/animation/step_down.png';
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
                            setTimeout(function() { SherwoodUI._showCombatScreen(); }, 400);
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
        this._yaw = 0;
        this._particles = [];
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (typeof Sherwood !== 'undefined' && typeof SherwoodUI !== 'undefined') {
        Sherwood.Dungeon2D5.init();
    }
});

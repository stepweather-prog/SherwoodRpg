Sherwood.Dungeon2D5 = {
    _canvas: null,
    _ctx: null,
    _dungeon: null,
    _playerDir: 0,
    _targetDir: 0,
    _isTurning: false,
    _turnProgress: 0,
    _turnFromDir: 0,
    _turnDiff: 0,
    _isMoving: false,
    _moveProgress: 0,
    _moveFromX: 0,
    _moveFromY: 0,
    _moveToX: 0,
    _moveToY: 0,
    _animFrame: 0,
    _animTimer: null,
    _walls: [],
    _floors: [],
    _ceilings: [],
    _joystick: null,
    _joystickInner: null,
    _joystickInnerImg: null,
    _interactBtn: null,
    _interactBtnImg: null,
    _interactType: null,
    _renderLoop: null,
    _cellSize: 1,
    _wallHeight: 1.6,
    _cameraHeight: 0.5,
    _fov: 60,
    _nearPlane: 0.1,
    _farPlane: 20,
    _images: {},
    _animImages: {},
    _loaded: false,
    _screenWidth: 480,
    _screenHeight: 800,

    init: function() {
        this._screenWidth = SherwoodUI.container ? SherwoodUI.container.clientWidth : 480;
        this._screenHeight = SherwoodUI.container ? SherwoodUI.container.clientHeight : 800;
        
        this._canvas = document.createElement('canvas');
        this._canvas.width = this._screenWidth;
        this._canvas.height = this._screenHeight;
        this._canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;';
        this._ctx = this._canvas.getContext('2d');
        
        this._loadImages();
        this._setupControls();
    },

    _loadImages: function() {
        const basePath = 'assets/dungeon_tiles/visual_dungeon/';
        const floorPath = 'assets/dungeon_tiles/dungeon1/';
        const interfacePath = 'assets/interface/';
        const animPath = 'assets/animation/';
        
        // Стены
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = basePath + 'wall_' + i + '.png';
            this._walls.push(img);
        }
        
        // Полы
        for (let i = 8; i <= 13; i++) {
            const img = new Image();
            img.src = floorPath + 'tiles' + i + '.jpeg';
            this._floors.push(img);
        }
        
        // Потолки
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = basePath + 'ceiling_dungeon_' + i + '.png';
            this._ceilings.push(img);
        }
        
        // Объекты
        this._images.altar = this._createImage(interfacePath + 'altar_of_the_first_dungeon.png');
        this._images.cauldron = this._createImage(interfacePath + 'cauldron_first_dungeon.png');
        this._images.potion = this._createImage(interfacePath + 'resource_life_potion.png');
        this._images.chest_locked = this._createImage(interfacePath + 'locked_chest_first_dungeon.png');
        this._images.chest_open = this._createImage(interfacePath + 'open_chest_first_dungeon.png');
        this._images.loot_bag = this._createImage(interfacePath + 'loot_bag_of_beasts.png');
        this._images.loot_bag_empty = this._createImage(interfacePath + 'empty_bag_of_loot_beasts.png');
        this._images.exit = this._createImage(interfacePath + 'exit_completion_dungeon.png');
        this._images.exit_locked = this._createImage(interfacePath + 'closed_level_lock_icon.png');
        
        // Анимации ходьбы
        this._animImages.down = this._createImage(animPath + 'step_down.png');
        this._animImages.up = this._createImage(animPath + 'step_up.png');
        this._animImages.left = this._createImage(animPath + 'step_left.png');
        this._animImages.right = this._createImage(animPath + 'step_right.png');
        
        // Монстры (загружаются динамически)
        this._monsterImages = {};
    },

    _createImage: function(src) {
        const img = new Image();
        img.src = src;
        return img;
    },

    _getMonsterImage: function(monsterId) {
        if (!monsterId) return null;
        if (!this._monsterImages[monsterId]) {
            this._monsterImages[monsterId] = this._createImage('assets/all_beasts/' + monsterId);
        }
        return this._monsterImages[monsterId];
    },

    _setupControls: function() {
        // Джойстик
        this._joystick = document.createElement('div');
        this._joystick.id = 'joystick-2d5';
        this._joystick.style.cssText = 'position:absolute;bottom:120px;left:50%;transform:translateX(-50%);width:180px;height:180px;border-radius:50%;background:rgba(0,0,0,0.5);border:2px solid #c9a040;z-index:10;';
        
        // Внутренний круг для анимации ходьбы
        this._joystickInner = document.createElement('div');
        this._joystickInner.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:110px;height:110px;border-radius:50%;background:rgba(0,0,0,0.7);border:1px solid #8b6914;display:flex;align-items:center;justify-content:center;overflow:hidden;';
        this._joystickInnerImg = document.createElement('img');
        this._joystickInnerImg.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        this._joystickInner.appendChild(this._joystickInnerImg);
        this._joystick.appendChild(this._joystickInner);
        
        // Стрелки по краям
        const arrows = [
            { dir: 'up', rotation: 0, top: '-25px', left: '50%' },
            { dir: 'right', rotation: 90, top: '50%', left: 'calc(100% + 25px)' },
            { dir: 'down', rotation: 180, top: 'calc(100% + 25px)', left: '50%' },
            { dir: 'left', rotation: -90, top: '50%', left: '-25px' }
        ];
        
        const self = this;
        
        arrows.forEach((arrow) => {
            const btn = document.createElement('button');
            btn.style.cssText = 'position:absolute;width:50px;height:50px;background:#c9a040;border:2px solid #8b6914;border-radius:50%;cursor:pointer;color:#000;font-size:24px;font-weight:bold;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 8px rgba(0,0,0,0.5);z-index:12;transition:transform 0.15s, background 0.15s;';
            btn.style.top = arrow.top;
            btn.style.left = arrow.left;
            btn.style.transform = 'translate(-50%, -50%)';
            btn.innerHTML = '<span style="transform:rotate(' + arrow.rotation + 'deg);display:block;">▲</span>';
            
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                btn.style.background = '#ffd700';
                self._onArrowClick(arrow.dir);
            });
            
            btn.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                btn.style.background = '#ffd700';
                self._onArrowClick(arrow.dir);
            });
            
            btn.addEventListener('touchend', function(e) {
                btn.style.background = '#c9a040';
            });
            
            btn.addEventListener('mouseup', function(e) {
                btn.style.background = '#c9a040';
            });
            
            this._joystick.appendChild(btn);
        });
        
        // Кнопка взаимодействия
        this._interactBtn = document.createElement('button');
        this._interactBtn.id = 'interact-btn-2d5';
        this._interactBtn.style.cssText = 'position:absolute;bottom:340px;left:50%;transform:translateX(-50%);width:80px;height:80px;border-radius:50%;background:rgba(0,0,0,0.8);border:3px solid #ffd700;cursor:pointer;display:none;z-index:11;align-items:center;justify-content:center;box-shadow:0 0 20px rgba(255,215,0,0.5);';
        this._interactBtnImg = document.createElement('img');
        this._interactBtnImg.style.cssText = 'width:56px;height:56px;object-fit:contain;';
        this._interactBtn.appendChild(this._interactBtnImg);
        
        this._interactBtn.addEventListener('click', function() {
            self._onInteract();
        });
        
        this._interactBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            self._onInteract();
        });
    },

    _onArrowClick: function(dir) {
        if (this._isTurning || this._isMoving) return;
        
        switch(dir) {
            case 'up':
                this._moveForward();
                break;
            case 'right':
                this._startTurn((this._playerDir + 1) % 4);
                break;
            case 'down':
                this._startTurn((this._playerDir + 2) % 4);
                break;
            case 'left':
                this._startTurn((this._playerDir + 3) % 4);
                break;
        }
    },

    _startTurn: function(targetDir) {
        if (targetDir === this._playerDir) return;
        
        let diff = (targetDir - this._playerDir + 4) % 4;
        if (diff === 3) diff = -1;
        
        this._turnFromDir = this._playerDir;
        this._targetDir = targetDir;
        this._turnDiff = diff;
        this._turnProgress = 0;
        this._isTurning = true;
    },

    _moveForward: function() {
        const d = Sherwood.Dungeon.getDungeon();
        if (!d) return;
        
        let dx = 0, dy = 0;
        switch(this._playerDir) {
            case 0: dy = -1; break;
            case 1: dx = 1; break;
            case 2: dy = 1; break;
            case 3: dx = -1; break;
        }
        
        const newX = d.px + dx;
        const newY = d.py + dy;
        
        if (newX < 0 || newX >= d.size || newY < 0 || newY >= d.size) return;
        
        const cell = d.grid[newY][newX];
        if (!cell || !cell.open) return;
        
        this._moveFromX = d.px;
        this._moveFromY = d.py;
        this._moveToX = newX;
        this._moveToY = newY;
        this._moveProgress = 0;
        this._isMoving = true;
    },

    _onInteract: function() {
        if (!this._interactType) return;
        
        const d = Sherwood.Dungeon.getDungeon();
        if (!d) return;
        
        const cell = d.grid[d.py][d.px];
        if (!cell) return;
        
        switch(this._interactType) {
            case 'lootBag':
                if (cell.lootBag && !cell.lootCollected) {
                    SherwoodUI._collectLootBag();
                }
                break;
            case 'chest':
                if (cell.chest && !cell.looted) {
                    SherwoodUI._collectChest();
                }
                break;
            case 'altar':
                if (cell.altar && !cell.altarCollected) {
                    SherwoodUI._collectAltar();
                }
                break;
            case 'cauldron':
                if (cell.cauldron && !cell.cauldronCollected) {
                    SherwoodUI._collectCauldron();
                }
                break;
            case 'potion':
                if (cell.potion && !cell.potionCollected) {
                    SherwoodUI._collectPotion();
                }
                break;
            case 'exit':
                if (cell.exit && !cell.locked) {
                    SherwoodUI._doStep(d.px, d.py);
                }
                break;
        }
        
        this._interactBtn.style.display = 'none';
        this._interactType = null;
    },

    _checkInteract: function() {
        const d = Sherwood.Dungeon.getDungeon();
        if (!d) return;
        
        const cell = d.grid[d.py][d.px];
        if (!cell) return;
        
        let type = null;
        let icon = null;
        
        if (cell.lootBag && !cell.lootCollected) {
            type = 'lootBag';
            icon = this._images.loot_bag;
        } else if (cell.chest && !cell.looted) {
            type = 'chest';
            icon = this._images.chest_locked;
        } else if (cell.altar && !cell.altarCollected) {
            type = 'altar';
            icon = this._images.altar;
        } else if (cell.cauldron && !cell.cauldronCollected) {
            type = 'cauldron';
            icon = this._images.cauldron;
        } else if (cell.potion && !cell.potionCollected) {
            type = 'potion';
            icon = this._images.potion;
        } else if (cell.exit && !cell.locked) {
            type = 'exit';
            icon = this._images.exit;
        }
        
        if (type) {
            this._interactType = type;
            this._interactBtnImg.src = icon.src;
            this._interactBtn.style.display = 'flex';
        } else {
            this._interactType = null;
            this._interactBtn.style.display = 'none';
        }
    },

    render: function(dungeonData) {
        this._dungeon = dungeonData;
        this._playerDir = 0;
        this._targetDir = 0;
        this._isTurning = false;
        this._isMoving = false;
        
        if (this._canvas.parentNode !== SherwoodUI._screenLayer) {
            SherwoodUI._screenLayer.innerHTML = '';
            SherwoodUI._screenLayer.appendChild(this._canvas);
            SherwoodUI._screenLayer.appendChild(this._joystick);
            SherwoodUI._screenLayer.appendChild(this._interactBtn);
        }
        
        SherwoodUI._screenLayer.style.display = 'block';
        
        this._checkInteract();
        this._renderFrame();
        
        if (this._renderLoop) cancelAnimationFrame(this._renderLoop);
        this._animate();
    },

    _animate: function() {
        const self = this;
        
        const loop = () => {
            if (!this._dungeon) return;
            
            if (this._isTurning) {
                this._turnProgress += 0.1;
                if (this._turnProgress >= 1) {
                    this._turnProgress = 1;
                    this._playerDir = this._targetDir;
                    this._isTurning = false;
                }
                this._renderFrame();
            }
            
            if (this._isMoving) {
                this._moveProgress += 0.07;
                
                if (this._moveProgress >= 1) {
                    this._moveProgress = 1;
                    this._isMoving = false;
                    
                    const d = Sherwood.Dungeon.getDungeon();
                    if (d) {
                        const result = Sherwood.Dungeon.move(this._moveToX, this._moveToY);
                        
                        if (result && result.type === 'battle') {
                            SherwoodUI._dungeonMove(this._moveToX, this._moveToY);
                            return;
                        }
                        
                        if (result && result.ok) {
                            this._checkInteract();
                        }
                    }
                }
                this._renderFrame();
            }
            
            this._renderLoop = requestAnimationFrame(loop);
        };
        
        this._renderLoop = requestAnimationFrame(loop);
    },

    _renderFrame: function() {
        if (!this._ctx || !this._dungeon) return;
        
        const ctx = this._ctx;
        const w = this._screenWidth;
        const h = this._screenHeight;
        
        ctx.fillStyle = '#1a0f08';
        ctx.fillRect(0, 0, w, h);
        
        const horizonY = h * 0.45;
        
        let angle = this._playerDir * Math.PI / 2;
        if (this._isTurning) {
            const turnAngle = this._turnDiff * Math.PI / 2 * this._easeInOut(this._turnProgress);
            angle = this._turnFromDir * Math.PI / 2 + turnAngle;
        }
        
        let offsetX = 0, offsetY = 0;
        if (this._isMoving) {
            const moveOffset = this._easeInOut(this._moveProgress);
            switch(this._playerDir) {
                case 0: offsetY = -moveOffset; break;
                case 1: offsetX = moveOffset; break;
                case 2: offsetY = moveOffset; break;
                case 3: offsetX = -moveOffset; break;
            }
        }
        
        this._drawCeiling(ctx, w, horizonY);
        this._drawWalls(ctx, w, horizonY, angle, offsetX, offsetY);
        this._drawFloor(ctx, w, h, horizonY, angle, offsetX, offsetY);
        this._drawObjects(ctx, w, h, horizonY, angle, offsetX, offsetY);
        
        if (this._isMoving) {
            this._updateJoystickAnim();
        } else {
            this._joystickInnerImg.src = this._animImages.down.src;
        }
    },

    _easeInOut: function(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    _drawCeiling: function(ctx, w, horizonY) {
        const ceilingImg = this._ceilings[Math.floor(Math.random() * this._ceilings.length)];
        if (ceilingImg && ceilingImg.complete) {
            ctx.drawImage(ceilingImg, 0, 0, w, horizonY);
        } else {
            ctx.fillStyle = '#1a0a00';
            ctx.fillRect(0, 0, w, horizonY);
        }
    },

    _drawWalls: function(ctx, w, horizonY, angle, offsetX, offsetY) {
        const d = this._dungeon;
        const screenH = this._screenHeight;
        
        for (let depth = 0; depth < 4; depth++) {
            const dist = depth + 1;
            const scale = 1 / (dist * 1.3);
            const wallWidth = w * scale;
            const wallHeight = (screenH - horizonY) * scale * 1.5;
            
            const px = d.px + offsetX;
            const py = d.py + offsetY;
            
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);
            
            const wallX = Math.round(px + dirX * dist);
            const wallY = Math.round(py + dirY * dist);
            
            if (wallX < 0 || wallX >= d.size || wallY < 0 || wallY >= d.size) continue;
            
            const cell = d.grid[wallY][wallX];
            if (!cell || !cell.open) {
                const wallImg = this._walls[Math.floor(Math.random() * this._walls.length)];
                const x = w / 2 - wallWidth / 2;
                const y = horizonY - wallHeight;
                
                if (wallImg && wallImg.complete) {
                    ctx.drawImage(wallImg, x, y, wallWidth, wallHeight);
                } else {
                    ctx.fillStyle = '#5a3a22';
                    ctx.fillRect(x, y, wallWidth, wallHeight);
                }
                
                const darkness = Math.min(0.5, depth * 0.15);
                ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
                ctx.fillRect(x, y, wallWidth, wallHeight);
            }
        }
    },

    _drawFloor: function(ctx, w, h, horizonY, angle, offsetX, offsetY) {
        const d = this._dungeon;
        const floorImg = this._floors[Math.floor(Math.random() * this._floors.length)];
        
        if (floorImg && floorImg.complete) {
            ctx.drawImage(floorImg, 0, horizonY, w, h - horizonY);
        } else {
            ctx.fillStyle = '#2a1a0a';
            ctx.fillRect(0, horizonY, w, h - horizonY);
        }
        
        // Перспективная сетка
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        
        const numLines = 10;
        for (let i = 1; i <= numLines; i++) {
            const t = i / numLines;
            const y = horizonY + (h - horizonY) * t * t;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(w, y);
            ctx.stroke();
        }
        
        for (let i = -5; i <= 5; i++) {
            const xTop = w / 2 + i * 20;
            const xBottom = w / 2 + i * (w / 5);
            ctx.beginPath();
            ctx.moveTo(xTop, horizonY);
            ctx.lineTo(xBottom, h);
            ctx.stroke();
        }
    },

    _drawObjects: function(ctx, w, h, horizonY, angle, offsetX, offsetY) {
        const d = this._dungeon;
        
        const px = d.px + offsetX;
        const py = d.py + offsetY;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        
        const cellX = Math.round(px + dirX);
        const cellY = Math.round(py + dirY);
        
        if (cellX < 0 || cellX >= d.size || cellY < 0 || cellY >= d.size) return;
        
        const cell = d.grid[cellY][cellX];
        if (!cell || !cell.open) return;
        
        let objImg = null;
        
        if (cell.monster) {
            objImg = this._getMonsterImage(cell.monsterId);
        } else if (cell.lootBag && !cell.lootCollected) {
            objImg = this._images.loot_bag;
        } else if (cell.lootBag && cell.lootCollected) {
            objImg = this._images.loot_bag_empty;
        } else if (cell.chest && !cell.looted) {
            objImg = this._images.chest_locked;
        } else if (cell.chest && cell.looted) {
            objImg = this._images.chest_open;
        } else if (cell.altar && !cell.altarCollected) {
            objImg = this._images.altar;
        } else if (cell.cauldron && !cell.cauldronCollected) {
            objImg = this._images.cauldron;
        } else if (cell.potion && !cell.potionCollected) {
            objImg = this._images.potion;
        } else if (cell.exit && cell.locked) {
            objImg = this._images.exit_locked;
        } else if (cell.exit && !cell.locked) {
            objImg = this._images.exit;
        }
        
        if (objImg && objImg.complete) {
            const objSize = Math.min(w * 0.35, 170);
            const x = w / 2 - objSize / 2;
            const y = horizonY + (h - horizonY) * 0.25 - objSize / 2;
            ctx.drawImage(objImg, x, y, objSize, objSize);
        }
    },

    _updateJoystickAnim: function() {
        switch(this._playerDir) {
            case 0: this._joystickInnerImg.src = this._animImages.down.src; break;
            case 1: this._joystickInnerImg.src = this._animImages.right.src; break;
            case 2: this._joystickInnerImg.src = this._animImages.up.src; break;
            case 3: this._joystickInnerImg.src = this._animImages.left.src; break;
        }
    },

    destroy: function() {
        if (this._renderLoop) {
            cancelAnimationFrame(this._renderLoop);
            this._renderLoop = null;
        }
        
        if (this._canvas && this._canvas.parentNode) {
            this._canvas.parentNode.removeChild(this._canvas);
        }
        if (this._joystick && this._joystick.parentNode) {
            this._joystick.parentNode.removeChild(this._joystick);
        }
        if (this._interactBtn && this._interactBtn.parentNode) {
            this._interactBtn.parentNode.removeChild(this._interactBtn);
        }
        
        this._dungeon = null;
        this._isTurning = false;
        this._isMoving = false;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (typeof Sherwood !== 'undefined' && typeof SherwoodUI !== 'undefined') {
        Sherwood.Dungeon2D5.init();
    }
});

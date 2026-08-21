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
    _images: {},
    _animImages: {},
    _monsterImages: {},
    _screenWidth: 480,
    _screenHeight: 800,
    _lastFrameTime: 0,
    _bobPhase: 0,

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
        
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = basePath + 'wall_' + i + '.png';
            this._walls.push(img);
        }
        
        for (let i = 8; i <= 13; i++) {
            const img = new Image();
            img.src = floorPath + 'tiles' + i + '.jpeg';
            this._floors.push(img);
        }
        
        for (let i = 1; i <= 6; i++) {
            const img = new Image();
            img.src = basePath + 'ceiling_dungeon_' + i + '.png';
            this._ceilings.push(img);
        }
        
        const objects = {
            altar: 'altar_of_the_first_dungeon.png',
            cauldron: 'cauldron_first_dungeon.png',
            potion: 'resource_life_potion.png',
            chest_locked: 'locked_chest_first_dungeon.png',
            chest_open: 'open_chest_first_dungeon.png',
            loot_bag: 'loot_bag_of_beasts.png',
            loot_bag_empty: 'empty_bag_of_loot_beasts.png',
            exit: 'exit_completion_dungeon.png',
            exit_locked: 'closed_level_lock_icon.png',
            wall_openable: 'labyrinth_asset.png'
        };
        
        for (const key in objects) {
            const img = new Image();
            img.src = interfacePath + objects[key];
            this._images[key] = img;
        }
        
        const anims = {
            down: 'step_down.png',
            up: 'step_up.png',
            left: 'step_left.png',
            right: 'step_right.png'
        };
        
        for (const key in anims) {
            const img = new Image();
            img.src = animPath + anims[key];
            this._animImages[key] = img;
        }
    },

    _getMonsterImage: function(monsterId) {
        if (!monsterId) return null;
        if (!this._monsterImages[monsterId]) {
            const img = new Image();
            img.src = 'assets/all_beasts/' + monsterId;
            this._monsterImages[monsterId] = img;
        }
        return this._monsterImages[monsterId];
    },

    _setupControls: function() {
        const self = this;
        
        this._joystick = document.createElement('div');
        this._joystick.id = 'joystick-2d5';
        this._joystick.style.cssText = 'position:absolute;bottom:140px;left:50%;transform:translateX(-50%);width:200px;height:200px;border-radius:50%;background:rgba(0,0,0,0.6);border:3px solid #c9a040;z-index:10;';
        
        this._joystickInner = document.createElement('div');
        this._joystickInner.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;border-radius:50%;background:rgba(0,0,0,0.8);border:2px solid #8b6914;display:flex;align-items:center;justify-content:center;overflow:hidden;pointer-events:none;';
        
        this._joystickInnerImg = document.createElement('img');
        this._joystickInnerImg.style.cssText = 'width:100%;height:100%;object-fit:contain;';
        this._joystickInner.appendChild(this._joystickInnerImg);
        this._joystick.appendChild(this._joystickInner);
        
        const arrows = [
            { dir: 'up', cx: 100, cy: 10 },
            { dir: 'right', cx: 190, cy: 100 },
            { dir: 'down', cx: 100, cy: 190 },
            { dir: 'left', cx: 10, cy: 100 }
        ];
        
        arrows.forEach((arrow) => {
            const btn = document.createElement('button');
            btn.style.cssText = 'position:absolute;width:56px;height:56px;background:#c9a040;border:2px solid #8b6914;border-radius:50%;cursor:pointer;color:#000;font-size:28px;font-weight:bold;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.6);z-index:12;left:' + (arrow.cx - 28) + 'px;top:' + (arrow.cy - 28) + 'px;transition:transform 0.1s, background 0.1s;';
            
            let arrowChar = '▲';
            let rotation = 0;
            if (arrow.dir === 'right') rotation = 90;
            if (arrow.dir === 'down') rotation = 180;
            if (arrow.dir === 'left') rotation = -90;
            
            btn.innerHTML = '<span style="transform:rotate(' + rotation + 'deg);display:block;">' + arrowChar + '</span>';
            
            btn.addEventListener('mousedown', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self._onArrowClick(arrow.dir);
            });
            
            btn.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self._onArrowClick(arrow.dir);
            }, { passive: false });
            
            this._joystick.appendChild(btn);
        });
        
        this._interactBtn = document.createElement('button');
        this._interactBtn.id = 'interact-btn-2d5';
        this._interactBtn.style.cssText = 'position:absolute;bottom:380px;left:50%;transform:translateX(-50%);width:90px;height:90px;border-radius:50%;background:rgba(0,0,0,0.85);border:3px solid #ffd700;cursor:pointer;display:none;z-index:11;align-items:center;justify-content:center;box-shadow:0 0 25px rgba(255,215,0,0.6);';
        
        this._interactBtnImg = document.createElement('img');
        this._interactBtnImg.style.cssText = 'width:64px;height:64px;object-fit:contain;';
        this._interactBtn.appendChild(this._interactBtnImg);
        
        this._interactBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            self._onInteract();
        });
        
        this._interactBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            e.stopPropagation();
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
                this._startTurn(1);
                break;
            case 'down':
                this._startTurn(2);
                break;
            case 'left':
                this._startTurn(-1);
                break;
        }
    },

    _startTurn: function(direction) {
        if (direction === 0) return;
        this._turnFromDir = this._playerDir;
        this._targetDir = (this._playerDir + direction + 4) % 4;
        this._turnDiff = direction;
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
        this._bobPhase = 0;
    },

    _onInteract: function() {
        if (!this._interactType) return;
        
        const d = Sherwood.Dungeon.getDungeon();
        if (!d) return;
        
        const cell = d.grid[d.py][d.px];
        if (!cell) return;
        
        switch(this._interactType) {
            case 'lootBag':
                if (cell.lootBag && !cell.lootCollected) SherwoodUI._collectLootBag();
                break;
            case 'chest':
                if (cell.chest && !cell.looted) SherwoodUI._collectChest();
                break;
            case 'altar':
                if (cell.altar && !cell.altarCollected) SherwoodUI._collectAltar();
                break;
            case 'cauldron':
                if (cell.cauldron && !cell.cauldronCollected) SherwoodUI._collectCauldron();
                break;
            case 'potion':
                if (cell.potion && !cell.potionCollected) SherwoodUI._collectPotion();
                break;
            case 'exit':
                if (cell.exit && !cell.locked) SherwoodUI._doStep(d.px, d.py);
                break;
        }
        
        this._hideInteract();
    },

    _checkInteract: function() {
        const d = Sherwood.Dungeon.getDungeon();
        if (!d) return;
        
        const cell = d.grid[d.py][d.px];
        if (!cell) return;
        
        let type = null;
        let icon = null;
        
        if (cell.lootBag && !cell.lootCollected) {
            type = 'lootBag'; icon = this._images.loot_bag;
        } else if (cell.chest && !cell.looted) {
            type = 'chest'; icon = this._images.chest_locked;
        } else if (cell.altar && !cell.altarCollected) {
            type = 'altar'; icon = this._images.altar;
        } else if (cell.cauldron && !cell.cauldronCollected) {
            type = 'cauldron'; icon = this._images.cauldron;
        } else if (cell.potion && !cell.potionCollected) {
            type = 'potion'; icon = this._images.potion;
        } else if (cell.exit && !cell.locked) {
            type = 'exit'; icon = this._images.exit;
        }
        
        if (type) {
            this._interactType = type;
            this._interactBtnImg.src = icon.src;
            this._interactBtn.style.display = 'flex';
        } else {
            this._hideInteract();
        }
    },

    _hideInteract: function() {
        this._interactType = null;
        this._interactBtn.style.display = 'none';
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
        this._lastFrameTime = performance.now();
        this._animate();
    },

    _animate: function() {
        const self = this;
        
        const loop = (timestamp) => {
            if (!this._dungeon) return;
            
            const dt = Math.min((timestamp - this._lastFrameTime) / 1000, 0.1);
            this._lastFrameTime = timestamp;
            
            if (this._isTurning) {
                this._turnProgress += dt * 2.5;
                if (this._turnProgress >= 1) {
                    this._turnProgress = 1;
                    this._playerDir = this._targetDir;
                    this._isTurning = false;
                }
            }
            
            if (this._isMoving) {
                this._moveProgress += dt * 3;
                this._bobPhase += dt * 8;
                
                if (this._moveProgress >= 1) {
                    this._moveProgress = 1;
                    this._isMoving = false;
                    
                    const d = Sherwood.Dungeon.getDungeon();
                    if (d) {
                        const result = Sherwood.Dungeon.move(this._moveToX, this._moveToY);
                        
                        if (result && result.type === 'battle') {
                            this._renderFrame();
                            SherwoodUI._dungeonMove(this._moveToX, this._moveToY);
                            return;
                        }
                        
                        if (result && result.ok) {
                            this._checkInteract();
                        }
                    }
                }
            }
            
            this._renderFrame();
            this._renderLoop = requestAnimationFrame(loop);
        };
        
        this._renderLoop = requestAnimationFrame(loop);
    },

    _easeInOut: function(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    _renderFrame: function() {
        if (!this._ctx || !this._dungeon) return;
        
        const ctx = this._ctx;
        const w = this._screenWidth;
        const h = this._screenHeight;
        
        ctx.fillStyle = '#1a0f08';
        ctx.fillRect(0, 0, w, h);
        
        const horizonY = h * 0.42;
        
        // Угол поворота с плавной анимацией
        let angle = this._playerDir;
        if (this._isTurning) {
            const smooth = this._easeInOut(this._turnProgress);
            angle = this._turnFromDir + this._turnDiff * smooth;
        }
        
        // Смещение при ходьбе с покачиванием
        let offsetX = 0, offsetY = 0;
        if (this._isMoving) {
            const moveDist = this._easeInOut(this._moveProgress);
            const bob = Math.sin(this._bobPhase) * 0.03;
            
            switch(this._playerDir) {
                case 0: offsetY = -moveDist; offsetX = bob; break;
                case 1: offsetX = moveDist; offsetY = bob; break;
                case 2: offsetY = moveDist; offsetX = bob; break;
                case 3: offsetX = -moveDist; offsetY = bob; break;
            }
        }
        
        // Нормализованный угол в радианах
        const angleRad = angle * Math.PI / 2;
        const dirX = Math.cos(angleRad);
        const dirY = Math.sin(angleRad);
        const planeX = -dirY;
        const planeY = dirX;
        
        // Рисуем потолок
        this._drawCeiling(ctx, w, horizonY, angle);
        
        // Рисуем пол
        this._drawFloor(ctx, w, h, horizonY, angle);
        
        // Raycasting для стен
        this._drawWallsRaycast(ctx, w, h, horizonY, dirX, dirY, planeX, planeY, offsetX, offsetY);
        
        // Рисуем объекты на клетках
        this._drawObjectsRaycast(ctx, w, h, horizonY, dirX, dirY, planeX, planeY, offsetX, offsetY);
        
        // Обновляем джойстик
        if (this._isMoving) {
            this._updateJoystickAnim();
        } else {
            this._joystickInnerImg.src = this._animImages.down.src;
        }
    },

    _drawCeiling: function(ctx, w, horizonY, angle) {
        const ceilingImg = this._ceilings[Math.abs(Math.floor(angle + 0.5)) % this._ceilings.length];
        if (ceilingImg && ceilingImg.complete && ceilingImg.naturalWidth > 0) {
            ctx.drawImage(ceilingImg, 0, 0, w, horizonY);
        } else {
            const grad = ctx.createLinearGradient(0, 0, 0, horizonY);
            grad.addColorStop(0, '#2a1a0a');
            grad.addColorStop(1, '#1a0f08');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, horizonY);
        }
    },

    _drawFloor: function(ctx, w, h, horizonY, angle) {
        const floorImg = this._floors[Math.abs(Math.floor(angle + 0.5)) % this._floors.length];
        if (floorImg && floorImg.complete && floorImg.naturalWidth > 0) {
            ctx.drawImage(floorImg, 0, horizonY, w, h - horizonY);
        } else {
            const grad = ctx.createLinearGradient(0, horizonY, 0, h);
            grad.addColorStop(0, '#3a2a1a');
            grad.addColorStop(1, '#1a0f08');
            ctx.fillStyle = grad;
            ctx.fillRect(0, horizonY, w, h - horizonY);
        }
        
        // Затемнение к низу
        const darkGrad = ctx.createLinearGradient(0, horizonY, 0, h);
        darkGrad.addColorStop(0, 'rgba(0,0,0,0)');
        darkGrad.addColorStop(1, 'rgba(0,0,0,0.4)');
        ctx.fillStyle = darkGrad;
        ctx.fillRect(0, horizonY, w, h - horizonY);
    },

    _drawWallsRaycast: function(ctx, w, h, horizonY, dirX, dirY, planeX, planeY, offsetX, offsetY) {
        const d = this._dungeon;
        const screenW = w;
        const screenH = h;
        
        const posX = d.px + offsetX;
        const posY = d.py + offsetY;
        
        const wallHeight = screenH - horizonY;
        
        // Для каждого столбца экрана
        for (let x = 0; x < screenW; x += 2) {
            const cameraX = 2 * x / screenW - 1;
            const rayDirX = dirX + planeX * cameraX;
            const rayDirY = dirY + planeY * cameraX;
            
            let mapX = Math.floor(posX);
            let mapY = Math.floor(posY);
            
            const deltaDistX = Math.abs(1 / (rayDirX || 0.0001));
            const deltaDistY = Math.abs(1 / (rayDirY || 0.0001));
            
            let stepX, stepY, sideDistX, sideDistY;
            
            if (rayDirX < 0) {
                stepX = -1;
                sideDistX = (posX - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1 - posX) * deltaDistX;
            }
            
            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = (posY - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1 - posY) * deltaDistY;
            }
            
            let hit = false;
            let side = 0;
            let maxDepth = 10;
            
            while (!hit && maxDepth > 0) {
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }
                
                if (mapX < 0 || mapX >= d.size || mapY < 0 || mapY >= d.size) {
                    hit = true;
                    break;
                }
                
                const cell = d.grid[mapY][mapX];
                if (cell && !cell.open) {
                    hit = true;
                }
                
                maxDepth--;
            }
            
            if (!hit) continue;
            
            let perpWallDist;
            if (side === 0) {
                perpWallDist = (mapX - posX + (1 - stepX) / 2) / (rayDirX || 0.0001);
            } else {
                perpWallDist = (mapY - posY + (1 - stepY) / 2) / (rayDirY || 0.0001);
            }
            
            if (perpWallDist < 0.1) perpWallDist = 0.1;
            
            const lineHeight = wallHeight / perpWallDist;
            const drawStart = horizonY - lineHeight / 2;
            const drawEnd = horizonY + lineHeight / 2;
            
            // Выбор текстуры стены на основе координат
            const wallIndex = (Math.abs(mapX * 7 + mapY * 13) + this._playerDir) % this._walls.length;
            const wallImg = this._walls[wallIndex];
            
            // Точка на стене для текстуры
            let wallX;
            if (side === 0) {
                wallX = posY + perpWallDist * rayDirY;
            } else {
                wallX = posX + perpWallDist * rayDirX;
            }
            wallX -= Math.floor(wallX);
            
            const texX = Math.floor(wallX * wallImg.width);
            
            if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
                ctx.drawImage(
                    wallImg,
                    texX, 0, 2, wallImg.height,
                    x, drawStart, 2, drawEnd - drawStart
                );
            } else {
                ctx.fillStyle = side === 0 ? '#5a3a22' : '#4a2a12';
                ctx.fillRect(x, drawStart, 2, drawEnd - drawStart);
            }
            
            // Затемнение по расстоянию
            const darkness = Math.min(0.7, perpWallDist / 8);
            ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
            ctx.fillRect(x, drawStart, 2, drawEnd - drawStart);
            
            // Боковое затемнение
            if (side === 1) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
                ctx.fillRect(x, drawStart, 2, drawEnd - drawStart);
            }
        }
    },

    _drawObjectsRaycast: function(ctx, w, h, horizonY, dirX, dirY, planeX, planeY, offsetX, offsetY) {
        const d = this._dungeon;
        const posX = d.px + offsetX;
        const posY = d.py + offsetY;
        
        // Ищем объекты на видимых клетках
        for (let dist = 1; dist <= 3; dist++) {
            const cellX = Math.round(posX + dirX * dist);
            const cellY = Math.round(posY + dirY * dist);
            
            if (cellX < 0 || cellX >= d.size || cellY < 0 || cellY >= d.size) continue;
            
            const cell = d.grid[cellY][cellX];
            if (!cell || !cell.open) continue;
            
            // Определяем, видна ли клетка (впереди по центру или сбоку)
            const dx = cellX - posX;
            const dy = cellY - posY;
            
            // Проекция на экран
            const invDet = 1 / (planeX * dirY - dirX * planeY);
            const transformX = invDet * (dy * planeX - dx * planeY);
            const transformY = invDet * (-dy * dirX + dx * dirY);
            
            if (transformY <= 0.1) continue;
            
            const screenX = (w / 2) * (1 + transformX / transformY);
            
            if (screenX < -50 || screenX > w + 50) continue;
            
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
            
            if (!objImg || !objImg.complete || objImg.naturalWidth === 0) continue;
            
            const objSize = (h - horizonY) / transformY * 0.6;
            const objBottom = horizonY + (h - horizonY) / transformY * 0.5;
            const objX = screenX - objSize / 2;
            const objY = objBottom - objSize;
            
            ctx.globalAlpha = Math.min(1, 2 / dist);
            ctx.drawImage(objImg, objX, objY, objSize, objSize);
            ctx.globalAlpha = 1;
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

Sherwood.Dungeon2D5 = {
    _canvas: null,
    _ctx: null,
    _dungeon: null,
    _dir: 0,
    _isMoving: false,
    _isTurning: false,
    _moveX: 0,
    _moveY: 0,
    _fromX: 0,
    _fromY: 0,
    _toX: 0,
    _toY: 0,
    _moveT: 0,
    _turnT: 0,
    _turnDir: 0,
    _bobT: 0,
    _renderLoop: null,
    _walls: [],
    _floors: [],
    _ceilings: [],
    _images: {},
    _animImages: {},
    _monsterImages: {},
    _joystick: null,
    _joystickImg: null,
    _interactBtn: null,
    _interactBtnImg: null,
    _interactType: null,
    _w: 480,
    _h: 800,

    init: function() {
        this._w = SherwoodUI.container ? SherwoodUI.container.clientWidth : 480;
        this._h = SherwoodUI.container ? SherwoodUI.container.clientHeight : 800;
        
        this._canvas = document.createElement('canvas');
        this._canvas.width = this._w;
        this._canvas.height = this._h;
        this._canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;';
        this._ctx = this._canvas.getContext('2d');
        
        this._loadImages();
        this._setupControls();
    },

    _loadImages: function() {
        for (let i = 1; i <= 6; i++) {
            let img = new Image();
            img.src = 'assets/dungeon_tiles/visual_dungeon/wall_' + i + '.png';
            this._walls.push(img);
        }
        for (let i = 8; i <= 13; i++) {
            let img = new Image();
            img.src = 'assets/dungeon_tiles/dungeon1/tiles' + i + '.jpeg';
            this._floors.push(img);
        }
        for (let i = 1; i <= 6; i++) {
            let img = new Image();
            img.src = 'assets/dungeon_tiles/visual_dungeon/ceiling_dungeon_' + i + '.png';
            this._ceilings.push(img);
        }
        
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
            let img = new Image();
            img.src = 'assets/interface/' + objs[key];
            this._images[key] = img;
        }
        
        this._animImages.down = this._makeImg('assets/animation/step_down.png');
        this._animImages.up = this._makeImg('assets/animation/step_up.png');
        this._animImages.left = this._makeImg('assets/animation/step_left.png');
        this._animImages.right = this._makeImg('assets/animation/step_right.png');
    },

    _makeImg: function(src) {
        let img = new Image();
        img.src = src;
        return img;
    },

    _getMonsterImg: function(id) {
        if (!id) return null;
        if (!this._monsterImages[id]) {
            this._monsterImages[id] = this._makeImg('assets/all_beasts/' + id);
        }
        return this._monsterImages[id];
    },

    _setupControls: function() {
        const self = this;
        
        this._joystick = document.createElement('div');
        this._joystick.style.cssText = 'position:absolute;bottom:130px;left:50%;transform:translateX(-50%);width:200px;height:200px;border-radius:50%;background:rgba(0,0,0,0.65);border:3px solid #c9a040;z-index:10;';
        
        this._joystickImg = document.createElement('img');
        this._joystickImg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;object-fit:contain;';
        this._joystickImg.src = this._animImages.down.src;
        this._joystick.appendChild(this._joystickImg);
        
        const arrows = [
            { d: 0, cx: 100, cy: 10, ch: '▲', rot: 0 },
            { d: 1, cx: 190, cy: 100, ch: '▲', rot: 90 },
            { d: 2, cx: 100, cy: 190, ch: '▲', rot: 180 },
            { d: 3, cx: 10, cy: 100, ch: '▲', rot: -90 }
        ];
        
        arrows.forEach(function(a) {
            let btn = document.createElement('button');
            btn.style.cssText = 'position:absolute;left:' + (a.cx - 28) + 'px;top:' + (a.cy - 28) + 'px;width:56px;height:56px;border-radius:50%;background:#c9a040;border:2px solid #8b6914;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:12;';
            btn.innerHTML = '<span style="transform:rotate(' + a.rot + 'deg);font-size:24px;color:#000;font-weight:bold;">' + a.ch + '</span>';
            
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (a.d === 0) self._moveForward();
                else self._turnTo(a.d);
            });
            
            self._joystick.appendChild(btn);
        });
        
        this._interactBtn = document.createElement('button');
        this._interactBtn.style.cssText = 'position:absolute;bottom:360px;left:50%;transform:translateX(-50%);width:90px;height:90px;border-radius:50%;background:rgba(0,0,0,0.85);border:3px solid #ffd700;cursor:pointer;display:none;align-items:center;justify-content:center;z-index:11;';
        this._interactBtnImg = document.createElement('img');
        this._interactBtnImg.style.cssText = 'width:64px;height:64px;object-fit:contain;';
        this._interactBtn.appendChild(this._interactBtnImg);
        this._interactBtn.addEventListener('click', function() { self._onInteract(); });
    },

    _moveForward: function() {
        if (this._isMoving || this._isTurning) return;
        
        const d = Sherwood.Dungeon.getDungeon();
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
        if (!cell || !cell.open) return;
        
        this._fromX = d.px;
        this._fromY = d.py;
        this._toX = nx;
        this._toY = ny;
        this._moveT = 0;
        this._isMoving = true;
    },

    _turnTo: function(newDir) {
        if (this._isMoving || this._isTurning) return;
        if (newDir === this._dir) return;
        
        let diff = newDir - this._dir;
        if (diff === 3) diff = -1;
        if (diff === -3) diff = 1;
        
        this._turnDir = diff;
        this._turnT = 0;
        this._isTurning = true;
    },

    _onInteract: function() {
        if (!this._interactType) return;
        
        const d = Sherwood.Dungeon.getDungeon();
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
        const d = Sherwood.Dungeon.getDungeon();
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
        this._dir = 0;
        this._isMoving = false;
        this._isTurning = false;
        
        if (this._canvas.parentNode !== SherwoodUI._screenLayer) {
            SherwoodUI._screenLayer.innerHTML = '';
            SherwoodUI._screenLayer.appendChild(this._canvas);
            SherwoodUI._screenLayer.appendChild(this._joystick);
            SherwoodUI._screenLayer.appendChild(this._interactBtn);
        }
        
        SherwoodUI._screenLayer.style.display = 'block';
        
        this._checkInteract();
        this._draw();
        
        if (this._renderLoop) cancelAnimationFrame(this._renderLoop);
        this._animate();
    },

    _animate: function() {
        const self = this;
        
        const loop = function() {
            if (!self._dungeon) return;
            
            if (self._isTurning) {
                self._turnT += 0.08;
                if (self._turnT >= 1) {
                    self._turnT = 1;
                    self._dir = (self._dir + self._turnDir + 4) % 4;
                    self._isTurning = false;
                }
                self._draw();
            }
            
            if (self._isMoving) {
                self._moveT += 0.06;
                if (self._moveT >= 1) {
                    self._moveT = 1;
                    self._isMoving = false;
                    
                    const d = Sherwood.Dungeon.getDungeon();
                    if (d) {
                        const result = Sherwood.Dungeon.move(self._toX, self._toY);
                        if (result && result.type === 'battle') {
                            self._draw();
                            SherwoodUI._dungeonMove(self._toX, self._toY);
                            return;
                        }
                        if (result && result.ok) {
                            self._checkInteract();
                        }
                    }
                }
                self._draw();
            }
            
            self._renderLoop = requestAnimationFrame(loop);
        };
        
        this._renderLoop = requestAnimationFrame(loop);
    },

    _ease: function(t) {
        return t * t * (3 - 2 * t);
    },

    _draw: function() {
        const ctx = this._ctx;
        const w = this._w;
        const h = this._h;
        const d = this._dungeon;
        
        if (!ctx || !d) return;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
        
        // Текущая позиция с учётом движения
        let posX = d.px;
        let posY = d.py;
        let dir = this._dir;
        
        if (this._isMoving) {
            const t = this._ease(this._moveT);
            posX = this._fromX + (this._toX - this._fromX) * t;
            posY = this._fromY + (this._toY - this._fromY) * t;
        }
        
        if (this._isTurning) {
            const t = this._ease(this._turnT);
            dir = this._dir + this._turnDir * t;
        }
        
        // Направление взгляда
        let dirX = 0, dirY = 0;
        if (dir === 0) { dirX = 0; dirY = -1; }
        else if (dir === 1) { dirX = 1; dirY = 0; }
        else if (dir === 2) { dirX = 0; dirY = 1; }
        else { dirX = -1; dirY = 0; }
        
        // Если поворачиваем - интерполируем направление
        if (this._isTurning) {
            const t = this._ease(this._turnT);
            const angle = dir * Math.PI / 2;
            dirX = Math.cos(angle);
            dirY = Math.sin(angle);
        }
        
        // Горизонт
        const horizon = h * 0.45;
        
        // Рисуем потолок
        const ceilIdx = Math.floor(((this._dir % 6) + 6) % 6);
        const ceilImg = this._ceilings[ceilIdx];
        if (ceilImg && ceilImg.complete && ceilImg.naturalWidth > 0) {
            ctx.drawImage(ceilImg, 0, 0, w, horizon);
        } else {
            ctx.fillStyle = '#1a0f08';
            ctx.fillRect(0, 0, w, horizon);
        }
        
        // Рисуем пол
        const floorIdx = Math.floor(((this._dir % 6) + 6) % 6);
        const floorImg = this._floors[floorIdx];
        if (floorImg && floorImg.complete && floorImg.naturalWidth > 0) {
            ctx.drawImage(floorImg, 0, horizon, w, h - horizon);
        } else {
            ctx.fillStyle = '#2a1a0a';
            ctx.fillRect(0, horizon, w, h - horizon);
        }
        
        // Raycasting стены
        this._castWalls(ctx, w, h, horizon, posX, posY, dirX, dirY);
        
        // Объекты
        this._drawObjects(ctx, w, h, horizon, posX, posY, dirX, dirY);
        
        // Обновляем джойстик
        this._updateJoystick();
    },

    _castWalls: function(ctx, w, h, horizon, posX, posY, dirX, dirY) {
        const d = this._dungeon;
        
        for (let x = 0; x < w; x += 2) {
            const cameraX = 2 * x / w - 1;
            
            let rayX = dirX;
            let rayY = dirY;
            
            // Перпендикуляр для плоскости камеры
            const planeX = -dirY * 0.66;
            const planeY = dirX * 0.66;
            
            rayX = dirX + planeX * cameraX;
            rayY = dirY + planeY * cameraX;
            
            let mapX = Math.floor(posX);
            let mapY = Math.floor(posY);
            
            const deltaX = Math.abs(1 / (rayX === 0 ? 0.0001 : rayX));
            const deltaY = Math.abs(1 / (rayY === 0 ? 0.0001 : rayY));
            
            let stepX, stepY, sideX, sideY;
            
            if (rayX < 0) { stepX = -1; sideX = (posX - mapX) * deltaX; }
            else { stepX = 1; sideX = (mapX + 1 - posX) * deltaX; }
            
            if (rayY < 0) { stepY = -1; sideY = (posY - mapY) * deltaY; }
            else { stepY = 1; sideY = (mapY + 1 - posY) * deltaY; }
            
            let hit = false;
            let side = 0;
            
            for (let i = 0; i < 20; i++) {
                if (sideX < sideY) {
                    sideX += deltaX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideY += deltaY;
                    mapY += stepY;
                    side = 1;
                }
                
                if (mapX < 0 || mapX >= d.size || mapY < 0 || mapY >= d.size) break;
                
                const cell = d.grid[mapY][mapX];
                if (cell && !cell.open) {
                    hit = true;
                    break;
                }
            }
            
            if (!hit) continue;
            
            let dist;
            if (side === 0) {
                dist = (mapX - posX + (1 - stepX) / 2) / (rayX === 0 ? 0.0001 : rayX);
            } else {
                dist = (mapY - posY + (1 - stepY) / 2) / (rayY === 0 ? 0.0001 : rayY);
            }
            
            if (dist < 0.05) dist = 0.05;
            
            const wallH = (h - horizon) / dist;
            const startY = horizon - wallH / 2;
            const endY = horizon + wallH / 2;
            
            const wallIdx = (Math.abs(mapX * 3 + mapY * 5) + this._dir) % 6;
            const wallImg = this._walls[wallIdx];
            
            if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
                let texX;
                if (side === 0) texX = posY + dist * rayY;
                else texX = posX + dist * rayX;
                texX -= Math.floor(texX);
                const srcX = Math.floor(texX * wallImg.naturalWidth);
                
                ctx.drawImage(
                    wallImg,
                    srcX, 0, 2, wallImg.naturalHeight,
                    x, startY, 2, endY - startY
                );
            } else {
                ctx.fillStyle = side === 0 ? '#5a3a22' : '#4a2a12';
                ctx.fillRect(x, startY, 2, endY - startY);
            }
            
            const dark = Math.min(0.7, dist / 10);
            ctx.fillStyle = 'rgba(0,0,0,' + dark + ')';
            ctx.fillRect(x, startY, 2, endY - startY);
        }
    },

    _drawObjects: function(ctx, w, h, horizon, posX, posY, dirX, dirY) {
        const d = this._dungeon;
        
        const planeX = -dirY * 0.66;
        const planeY = dirX * 0.66;
        
        for (let dist = 1; dist <= 3; dist++) {
            const checkX = Math.round(posX + dirX * dist);
            const checkY = Math.round(posY + dirY * dist);
            
            if (checkX < 0 || checkX >= d.size || checkY < 0 || checkY >= d.size) continue;
            
            const cell = d.grid[checkY][checkX];
            if (!cell || !cell.open) continue;
            
            // Проверяем, перед камерой ли объект
            const relX = checkX - posX;
            const relY = checkY - posY;
            
            const invDet = 1 / (planeX * dirY - dirX * planeY);
            if (invDet === Infinity || invDet === -Infinity || isNaN(invDet)) continue;
            
            const transformX = invDet * (relY * planeX - relX * planeY);
            const transformY = invDet * (-relY * dirX + relX * dirY);
            
            if (transformY <= 0.1) continue;
            
            const screenX = (w / 2) * (1 + transformX / transformY);
            
            if (screenX < -100 || screenX > w + 100) continue;
            
            let img = null;
            
            if (cell.monster) {
                img = this._getMonsterImg(cell.monsterId);
            } else if (cell.lootBag && !cell.lootCollected) {
                img = this._images.loot_bag;
            } else if (cell.chest && !cell.looted) {
                img = this._images.chest_locked;
            } else if (cell.altar && !cell.altarCollected) {
                img = this._images.altar;
            } else if (cell.cauldron && !cell.cauldronCollected) {
                img = this._images.cauldron;
            } else if (cell.potion && !cell.potionCollected) {
                img = this._images.potion;
            } else if (cell.exit && cell.locked) {
                img = this._images.exit_locked;
            } else if (cell.exit && !cell.locked) {
                img = this._images.exit;
            }
            
            if (!img || !img.complete || img.naturalWidth === 0) continue;
            
            const objSize = (h - horizon) / transformY * 0.5;
            const objBottom = horizon + (h - horizon) * 0.5;
            const objX = screenX - objSize / 2;
            const objY = objBottom - objSize;
            
            const alpha = Math.min(1, 2.5 / dist);
            ctx.globalAlpha = alpha;
            ctx.drawImage(img, objX, objY, objSize, objSize);
            ctx.globalAlpha = 1;
        }
    },

    _updateJoystick: function() {
        if (this._isMoving) {
            const anims = [this._animImages.down, this._animImages.right, this._animImages.up, this._animImages.left];
            const img = anims[this._dir];
            if (img && img.complete) {
                this._joystickImg.src = img.src;
            }
        } else {
            this._joystickImg.src = this._animImages.down.src;
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
    }
};

document.addEventListener('DOMContentLoaded', function() {
    if (typeof Sherwood !== 'undefined' && typeof SherwoodUI !== 'undefined') {
        Sherwood.Dungeon2D5.init();
    }
});

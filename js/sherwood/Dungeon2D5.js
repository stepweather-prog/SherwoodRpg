// ========== 3D ПОДЗЕМКА (Raycasting на Canvas 2D) ==========
Sherwood.Dungeon2D5 = {
    _canvas: null,
    _ctx: null,
    _dungeon: null,
    _dir: 0,                    // Направление: 0-север, 1-восток, 2-юг, 3-запад
    _isMoving: false,
    _isTurning: false,
    _fromX: 0, _fromY: 0,
    _toX: 0, _toY: 0,
    _moveT: 0,
    _turnT: 0,
    _turnDir: 0,
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
    _lastTime: 0,
    _bobOffset: 0,

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
        // Загрузка текстур стен
        for (let i = 1; i <= 6; i++) {
            let img = new Image();
            img.src = 'assets/dungeon_tiles/visual_dungeon/wall_' + i + '.png';
            img.onload = () => { if (this._renderLoop) this._draw(); };
            this._walls.push(img);
        }
        
        // Загрузка текстур пола
        for (let i = 8; i <= 13; i++) {
            let img = new Image();
            img.src = 'assets/dungeon_tiles/dungeon1/tiles' + i + '.jpeg';
            img.onload = () => { if (this._renderLoop) this._draw(); };
            this._floors.push(img);
        }
        
        // Загрузка текстур потолка
        for (let i = 1; i <= 6; i++) {
            let img = new Image();
            img.src = 'assets/dungeon_tiles/visual_dungeon/ceiling_dungeon_' + i + '.png';
            img.onload = () => { if (this._renderLoop) this._draw(); };
            this._ceilings.push(img);
        }
        
        // Загрузка интерактивных объектов
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
            img.onload = () => { if (this._renderLoop) this._draw(); };
            this._images[key] = img;
        }
        
        // Загрузка анимаций
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
        
        // Джойстик
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
        
        // Кнопка взаимодействия
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
        
        if (cell.monster) {
            SherwoodUI._startCombat(cell);
            return;
        }
        
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

        if (type && icon) {
            this._interactType = type;
            this._interactBtnImg.src = icon.src;
            this._interactBtn.style.display = 'flex';
        } else {
            this._interactType = null;
            this._interactBtn.style.display = 'none';
        }
    },

    _ease: function(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    // ===== RAYCASTING РЕНДЕРИНГ =====
    _draw: function() {
        const ctx = this._ctx;
        const w = this._w;
        const h = this._h;
        const d = this._dungeon;
        
        if (!ctx || !d) return;
        
        // Текущая позиция игрока
        let posX = d.px + 0.5;
        let posY = d.py + 0.5;
        
        if (this._isMoving) {
            const t = this._ease(this._moveT);
            posX = this._fromX + 0.5 + (this._toX - this._fromX) * t;
            posY = this._fromY + 0.5 + (this._toY - this._fromY) * t;
        }
        
        // Направление взгляда
        let dirAngle = this._dir * Math.PI / 2;
        if (this._isTurning) {
            const t = this._ease(this._turnT);
            dirAngle = (this._dir + this._turnDir * t) * Math.PI / 2;
        }
        
        const dirX = Math.sin(dirAngle);
        const dirY = -Math.cos(dirAngle);
        const planeX = Math.cos(dirAngle) * 0.66;
        const planeY = Math.sin(dirAngle) * 0.66;
        
        const horizon = Math.floor(h * 0.45);
        const numRays = Math.floor(w / 2);
        
        // Отрисовка потолка
        const ceilImg = this._ceilings[this._dir % this._ceilings.length];
        if (ceilImg && ceilImg.complete && ceilImg.naturalWidth > 0) {
            ctx.drawImage(ceilImg, 0, 0, w, horizon);
        } else {
            ctx.fillStyle = '#1a0f08';
            ctx.fillRect(0, 0, w, horizon);
        }
        
        // Отрисовка пола
        const floorImg = this._floors[this._dir % this._floors.length];
        if (floorImg && floorImg.complete && floorImg.naturalWidth > 0) {
            ctx.drawImage(floorImg, 0, horizon, w, h - horizon);
        } else {
            ctx.fillStyle = '#2a1a0a';
            ctx.fillRect(0, horizon, w, h - horizon);
        }
        
        // Raycasting для стен
        for (let x = 0; x < numRays; x++) {
            const cameraX = 2 * x / numRays - 1;
            const rayDirX = dirX + planeX * cameraX;
            const rayDirY = dirY + planeY * cameraX;
            
            let mapX = Math.floor(posX);
            let mapY = Math.floor(posY);
            
            const deltaDistX = Math.abs(1 / rayDirX);
            const deltaDistY = Math.abs(1 / rayDirY);
            
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
            let maxDist = 20;
            
            while (!hit && maxDist > 0) {
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
                } else if (d.grid[mapY][mapX] && !d.grid[mapY][mapX].open) {
                    hit = true;
                }
                maxDist--;
            }
            
            let perpWallDist;
            if (side === 0) {
                perpWallDist = (mapX - posX + (1 - stepX) / 2) / rayDirX;
            } else {
                perpWallDist = (mapY - posY + (1 - stepY) / 2) / rayDirY;
            }
            
            if (perpWallDist < 0.01) perpWallDist = 0.01;
            
            const lineHeight = Math.floor(h / perpWallDist);
            const drawStart = Math.max(0, horizon - lineHeight / 2);
            const drawEnd = Math.min(h, horizon + lineHeight / 2);
            
            // Выбор текстуры
            const wallImg = this._walls[(mapX + mapY) % this._walls.length];
            
            if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
                let wallX;
                if (side === 0) {
                    wallX = posY + perpWallDist * rayDirY;
                } else {
                    wallX = posX + perpWallDist * rayDirX;
                }
                wallX -= Math.floor(wallX);
                
                let texX = Math.floor(wallX * wallImg.width);
                if ((side === 0 && rayDirX > 0) || (side === 1 && rayDirY < 0)) {
                    texX = wallImg.width - texX - 1;
                }
                
                ctx.drawImage(
                    wallImg,
                    texX, 0, 1, wallImg.height,
                    x * 2, drawStart, 2, drawEnd - drawStart
                );
                
                // Затемнение
                const darkness = Math.min(1, perpWallDist / 12);
                ctx.fillStyle = `rgba(0, 0, 0, ${darkness * 0.6})`;
                ctx.fillRect(x * 2, drawStart, 2, drawEnd - drawStart);
            } else {
                const shade = side === 0 ? 200 : 150;
                ctx.fillStyle = `rgb(${shade}, ${shade - 50}, ${shade - 100})`;
                ctx.fillRect(x * 2, drawStart, 2, drawEnd - drawStart);
            }
        }
        
        // Отрисовка объектов (спрайтов)
        this._renderSprites(posX, posY, dirAngle, d);
        
        // Виньетка
        const vignette = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.7);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
        
        this._updateJoystick();
    },

    _renderSprites: function(posX, posY, dirAngle, dungeon) {
        const ctx = this._ctx;
        const w = this._w;
        const h = this._h;
        const horizon = Math.floor(h * 0.45);
        
        const sprites = [];
        
        // Сбор спрайтов
        for (let y = 0; y < dungeon.size; y++) {
            for (let x = 0; x < dungeon.size; x++) {
                const cell = dungeon.grid[y][x];
                if (!cell || !cell.open) continue;
                
                let img = null;
                let type = null;
                
                if (cell.monster) {
                    img = this._getMonsterImg(cell.monsterId);
                    type = 'monster';
                } else if (cell.chest && !cell.looted) {
                    img = this._images.chest_locked;
                    type = 'chest';
                } else if (cell.altar && !cell.altarCollected) {
                    img = this._images.altar;
                    type = 'altar';
                } else if (cell.cauldron && !cell.cauldronCollected) {
                    img = this._images.cauldron;
                    type = 'cauldron';
                } else if (cell.potion && !cell.potionCollected) {
                    img = this._images.potion;
                    type = 'potion';
                } else if (cell.lootBag && !cell.lootCollected) {
                    img = this._images.loot_bag;
                    type = 'lootBag';
                } else if (cell.exit) {
                    img = cell.locked ? this._images.exit_locked : this._images.exit;
                    type = 'exit';
                }
                
                if (img && img.complete && img.naturalWidth > 0) {
                    sprites.push({
                        x: x + 0.5,
                        y: y + 0.5,
                        img: img,
                        dist: Math.sqrt((x + 0.5 - posX) ** 2 + (y + 0.5 - posY) ** 2)
                    });
                }
            }
        }
        
        // Сортировка по расстоянию (дальние первыми)
        sprites.sort((a, b) => b.dist - a.dist);
        
        // Отрисовка спрайтов
        sprites.forEach(sprite => {
            if (sprite.dist > 8) return;
            
            const spriteAngle = Math.atan2(sprite.y - posY, sprite.x - posX);
            let relAngle = spriteAngle - dirAngle;
            
            while (relAngle > Math.PI) relAngle -= 2 * Math.PI;
            while (relAngle < -Math.PI) relAngle += 2 * Math.PI;
            
            if (Math.abs(relAngle) > Math.PI / 2.5) return;
            
            const screenX = (relAngle / (Math.PI / 3) + 1) * w / 2;
            const spriteHeight = Math.floor(h / sprite.dist * 0.7);
            const spriteWidth = Math.floor(spriteHeight * 0.8);
            
            // Затемнение в зависимости от расстояния
            const darkness = Math.min(1, sprite.dist / 10);
            ctx.globalAlpha = 1 - darkness * 0.5;
            
            ctx.drawImage(
                sprite.img,
                screenX - spriteWidth / 2,
                horizon - spriteHeight / 2,
                spriteWidth,
                spriteHeight
            );
            
            ctx.globalAlpha = 1;
        });
    },

    _updateJoystick: function() {
        if (!this._joystickImg) return;
        
        const dirIcons = ['up', 'right', 'down', 'left'];
        const iconName = dirIcons[this._dir] || 'down';
        
        if (this._animImages[iconName] && this._animImages[iconName].complete) {
            this._joystickImg.src = this._animImages[iconName].src;
        }
    },

    render: function() {
        this._dungeon = Sherwood.Dungeon.getDungeon();
        if (this._dungeon && this._ctx) {
            this._checkInteract();
            this._draw();
        }
    },

    _startRenderLoop: function() {
        const self = this;
        let lastTime = performance.now();

        function render(time) {
            self._renderLoop = requestAnimationFrame(render);
            
            let dt = (time - lastTime) / 1000;
            if (dt > 0.1) dt = 0.1;
            lastTime = time;

            const d = Sherwood.Dungeon.getDungeon();
            if (!d) return;
            
            self._dungeon = d;

            if (self._isMoving) {
                self._moveT += dt * 4;
                if (self._moveT >= 1) {
                    self._moveT = 1;
                    self._isMoving = false;
                    d.px = self._toX;
                    d.py = self._toY;
                    self._checkInteract();
                }
            }

            if (self._isTurning) {
                self._turnT += dt * 6;
                if (self._turnT >= 1) {
                    self._turnT = 1;
                    self._isTurning = false;
                    self._dir = (self._dir + self._turnDir + 4) % 4;
                }
            }

            self._draw();
        }

        this._renderLoop = requestAnimationFrame(render);
    },

    update: function() {
        if (this._dungeon) {
            this._checkInteract();
            this._draw();
        }
    },

    show: function() {
        if (!this._canvas) this.init();
        
        this._dungeon = Sherwood.Dungeon.getDungeon();
        
        if (this._canvas.parentNode !== SherwoodUI.container) {
            SherwoodUI.container.appendChild(this._canvas);
            if (this._joystick && !this._joystick.parentNode) {
                SherwoodUI.container.appendChild(this._joystick);
            }
            if (this._interactBtn && !this._interactBtn.parentNode) {
                SherwoodUI.container.appendChild(this._interactBtn);
            }
        }
        
        this._checkInteract();
        this._startRenderLoop();
    },

    hide: function() {
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
    }
};

// ========== 3D ПОДЗЕМКА (Псевдо-3D рендеринг на спрайтах) ==========
Sherwood.Dungeon2D5 = {
    _canvas: null,
    _ctx: null,
    _dungeon: null,
    _dir: 0,                    // Направление: 0-север, 1-восток, 2-юг, 3-запад
    _isMoving: false,           // Флаг движения
    _isTurning: false,          // Флаг поворота
    _fromX: 0, _fromY: 0,       // Начальная позиция движения
    _toX: 0, _toY: 0,           // Конечная позиция движения
    _moveT: 0,                  // Прогресс движения (0-1)
    _turnT: 0,                  // Прогресс поворота (0-1)
    _turnDir: 0,                // Направление поворота
    _bobT: 0,                   // Таймер для эффекта покачивания
    _renderLoop: null,          // ID цикла рендеринга
    _walls: [],                 // Текстуры стен
    _floors: [],                // Текстуры пола
    _ceilings: [],              // Текстуры потолка
    _images: {},                // Изображения объектов
    _animImages: {},            // Анимации движения
    _monsterImages: {},         // Изображения монстров
    _joystick: null,            // Джойстик управления
    _joystickImg: null,         // Иконка джойстика
    _interactBtn: null,         // Кнопка взаимодействия
    _interactBtnImg: null,      // Иконка кнопки взаимодействия
    _interactType: null,        // Тип интерактивного объекта
    _w: 480,                    // Ширина канваса
    _h: 800,                    // Высота канваса

    // Инициализация компонента
    init: function() {
        this._w = SherwoodUI.container ? SherwoodUI.container.clientWidth : 480;
        this._h = SherwoodUI.container ? SherwoodUI.container.clientHeight : 800;
        
        // Создание канваса
        this._canvas = document.createElement('canvas');
        this._canvas.width = this._w;
        this._canvas.height = this._h;
        this._canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:1;';
        this._ctx = this._canvas.getContext('2d');
        
        this._loadImages();
        this._setupControls();
    },

    // Загрузка всех изображений
    _loadImages: function() {
        // Загрузка текстур стен
        for (let i = 1; i <= 6; i++) {
            let img = new Image();
            img.src = 'assets/dungeon_tiles/visual_dungeon/wall_' + i + '.png';
            img.onload = () => { 
                if (this._renderLoop) this._draw(); 
            };
            this._walls.push(img);
        }
        
        // Загрузка текстур пола
        for (let i = 8; i <= 13; i++) {
            let img = new Image();
            img.src = 'assets/dungeon_tiles/dungeon1/tiles' + i + '.jpeg';
            img.onload = () => { 
                if (this._renderLoop) this._draw(); 
            };
            this._floors.push(img);
        }
        
        // Загрузка текстур потолка
        for (let i = 1; i <= 6; i++) {
            let img = new Image();
            img.src = 'assets/dungeon_tiles/visual_dungeon/ceiling_dungeon_' + i + '.png';
            img.onload = () => { 
                if (this._renderLoop) this._draw(); 
            };
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
            img.onload = () => { 
                if (this._renderLoop) this._draw(); 
            };
            this._images[key] = img;
        }
        
        // Загрузка анимаций движения
        this._animImages.down = this._makeImg('assets/animation/step_down.png');
        this._animImages.up = this._makeImg('assets/animation/step_up.png');
        this._animImages.left = this._makeImg('assets/animation/step_left.png');
        this._animImages.right = this._makeImg('assets/animation/step_right.png');
    },

    // Создание объекта изображения
    _makeImg: function(src) {
        let img = new Image();
        img.src = src;
        return img;
    },

    // Получение изображения монстра
    _getMonsterImg: function(id) {
        if (!id) return null;
        if (!this._monsterImages[id]) {
            this._monsterImages[id] = this._makeImg('assets/all_beasts/' + id);
        }
        return this._monsterImages[id];
    },

    // Настройка элементов управления
    _setupControls: function() {
        const self = this;
        
        // Создание джойстика
        this._joystick = document.createElement('div');
        this._joystick.style.cssText = 'position:absolute;bottom:130px;left:50%;transform:translateX(-50%);width:200px;height:200px;border-radius:50%;background:rgba(0,0,0,0.65);border:3px solid #c9a040;z-index:10;';
        
        // Центральная иконка направления
        this._joystickImg = document.createElement('img');
        this._joystickImg.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:120px;object-fit:contain;';
        this._joystickImg.src = this._animImages.down.src;
        this._joystick.appendChild(this._joystickImg);
        
        // Кнопки направлений
        const arrows = [
            { d: 0, cx: 100, cy: 10, ch: '▲', rot: 0, label: 'Вперед' },
            { d: 1, cx: 190, cy: 100, ch: '▲', rot: 90, label: 'Вправо' },
            { d: 2, cx: 100, cy: 190, ch: '▲', rot: 180, label: 'Назад' },
            { d: 3, cx: 10, cy: 100, ch: '▲', rot: -90, label: 'Влево' }
        ];
        
        arrows.forEach(function(a) {
            let btn = document.createElement('button');
            btn.style.cssText = 'position:absolute;left:' + (a.cx - 28) + 'px;top:' + (a.cy - 28) + 'px;width:56px;height:56px;border-radius:50%;background:#c9a040;border:2px solid #8b6914;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:12;transition:all 0.2s;';
            btn.innerHTML = '<span style="transform:rotate(' + a.rot + 'deg);font-size:24px;color:#000;font-weight:bold;">' + a.ch + '</span>';
            btn.title = a.label;
            
            // Обработка клика
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                if (a.d === 0) {
                    self._moveForward();  // Движение вперед
                } else {
                    self._turnTo(a.d);    // Поворот
                }
            });
            
            // Эффект нажатия
            btn.addEventListener('mousedown', function() {
                btn.style.transform = 'scale(0.9)';
                btn.style.background = '#8b6914';
            });
            
            btn.addEventListener('mouseup', function() {
                btn.style.transform = 'scale(1)';
                btn.style.background = '#c9a040';
            });
            
            self._joystick.appendChild(btn);
        });
        
        // Кнопка взаимодействия
        this._interactBtn = document.createElement('button');
        this._interactBtn.style.cssText = 'position:absolute;bottom:360px;left:50%;transform:translateX(-50%);width:90px;height:90px;border-radius:50%;background:rgba(0,0,0,0.85);border:3px solid #ffd700;cursor:pointer;display:none;align-items:center;justify-content:center;z-index:11;transition:all 0.3s;animation:pulse 2s infinite;';
        this._interactBtnImg = document.createElement('img');
        this._interactBtnImg.style.cssText = 'width:64px;height:64px;object-fit:contain;';
        this._interactBtn.appendChild(this._interactBtnImg);
        this._interactBtn.addEventListener('click', function() { 
            self._onInteract(); 
        });
        
        // Добавление CSS анимации
        if (!document.getElementById('dungeon-2d5-styles')) {
            const style = document.createElement('style');
            style.id = 'dungeon-2d5-styles';
            style.textContent = `
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(255, 215, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 215, 0, 0); }
                }
            `;
            document.head.appendChild(style);
        }
    },

    // Движение вперед
    _moveForward: function() {
        if (this._isMoving || this._isTurning) return;
        
        const d = Sherwood.Dungeon.getDungeon();
        if (!d) return;
        
        // Вычисление смещения в зависимости от направления
        let dx = 0, dy = 0;
        if (this._dir === 0) dy = -1;       // Север
        else if (this._dir === 1) dx = 1;    // Восток
        else if (this._dir === 2) dy = 1;    // Юг
        else dx = -1;                         // Запад
        
        const nx = d.px + dx;
        const ny = d.py + dy;
        
        // Проверка границ
        if (nx < 0 || nx >= d.size || ny < 0 || ny >= d.size) return;
        
        const cell = d.grid[ny][nx];
        if (!cell || !cell.open) return;  // Если стена - не идем
        
        // Проверка на монстра
        if (cell.monster) {
            SherwoodUI._startCombat(cell);
            return;
        }
        
        // Начало движения
        this._fromX = d.px;
        this._fromY = d.py;
        this._toX = nx;
        this._toY = ny;
        this._moveT = 0;
        this._isMoving = true;
        this._bobT = 0;
    },

    // Поворот в указанном направлении
    _turnTo: function(newDir) {
        if (this._isMoving || this._isTurning) return;
        if (newDir === this._dir) return;
        
        // Вычисление кратчайшего поворота
        let diff = newDir - this._dir;
        if (diff === 3) diff = -1;
        if (diff === -3) diff = 1;
        
        this._turnDir = diff;
        this._turnT = 0;
        this._isTurning = true;
    },

    // Обработка взаимодействия с объектом
    _onInteract: function() {
        if (!this._interactType) return;
        
        const d = Sherwood.Dungeon.getDungeon();
        if (!d) return;
        
        const cell = d.grid[d.py][d.px];
        if (!cell) return;
        
        // Вызов соответствующего обработчика
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
        
        // Скрываем кнопку взаимодействия
        this._interactType = null;
        this._interactBtn.style.display = 'none';
        this._draw();
    },

    // Проверка наличия интерактивных объектов на текущей клетке
    _checkInteract: function() {
        const d = Sherwood.Dungeon.getDungeon();
        if (!d) return;
        
        const cell = d.grid[d.py][d.px];
        if (!cell) return;
        
        let type = null;
        let icon = null;
        
        // Определение типа объекта для взаимодействия
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

        // Показываем или скрываем кнопку взаимодействия
        if (type && icon) {
            this._interactType = type;
            this._interactBtnImg.src = icon.src;
            this._interactBtn.style.display = 'flex';
        } else {
            this._interactType = null;
            this._interactBtn.style.display = 'none';
        }
    },

    // Функция плавности анимации
    _ease: function(t) {
        // Плавное замедление в конце
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },

    // Основная функция отрисовки
    _draw: function() {
        const ctx = this._ctx;
        const w = this._w;
        const h = this._h;
        const d = this._dungeon;
        
        if (!ctx || !d) return;
        
        // Очистка экрана
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);
        
        // Текущая позиция с интерполяцией при движении
        let posX = d.px;
        let posY = d.py;
        
        if (this._isMoving) {
            const t = this._ease(this._moveT);
            posX = this._fromX + (this._toX - this._fromX) * t;
            posY = this._fromY + (this._toY - this._fromY) * t;
        }
        
        // Определение клетки перед игроком
        let frontX = Math.round(posX);
        let frontY = Math.round(posY);
        
        if (this._dir === 0) frontY = Math.round(posY - 1);
        else if (this._dir === 1) frontX = Math.round(posX + 1);
        else if (this._dir === 2) frontY = Math.round(posY + 1);
        else frontX = Math.round(posX - 1);
        
        // Проверка наличия стены
        let hasWall = false;
        if (frontX >= 0 && frontX < d.size && frontY >= 0 && frontY < d.size) {
            const cell = d.grid[frontY][frontX];
            if (cell && !cell.open) {
                hasWall = true;
            }
        }
        
        const horizon = h * 0.45;  // Линия горизонта
        
        // Выбор текстур на основе позиции и направления
        const texIdx = Math.abs((this._dir + Math.floor(posX + posY)) % 6);
        
        const ceilImg = this._ceilings[texIdx];
        const floorImg = this._floors[texIdx];
        const wallImg = this._walls[texIdx];
        
        // Отрисовка потолка
        if (ceilImg && ceilImg.complete && ceilImg.naturalWidth > 0) {
            ctx.drawImage(ceilImg, 0, 0, w, horizon);
        } else {
            ctx.fillStyle = '#1a0f08';
            ctx.fillRect(0, 0, w, horizon);
        }
        
        // Тень на потолке
        const ceilGradient = ctx.createLinearGradient(0, 0, 0, horizon);
        ceilGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        ceilGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = ceilGradient;
        ctx.fillRect(0, 0, w, horizon);
        
        // Отрисовка пола
        if (floorImg && floorImg.complete && floorImg.naturalWidth > 0) {
            ctx.drawImage(floorImg, 0, horizon, w, h - horizon);
        } else {
            ctx.fillStyle = '#2a1a0a';
            ctx.fillRect(0, horizon, w, h - horizon);
        }
        
        // Тень на полу
        const floorGradient = ctx.createLinearGradient(0, horizon, 0, h);
        floorGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        floorGradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        ctx.fillStyle = floorGradient;
        ctx.fillRect(0, horizon, w, h - horizon);
        
        // Отрисовка стены, если она есть
        if (hasWall) {
            let wallScale = 0.6;
            
            // Увеличение стены при приближении
            if (this._isMoving) {
                const t = this._moveT;
                wallScale = 0.6 + t * 0.4;
            }
            
            // Эффект покачивания при ходьбе
            let bobOffset = 0;
            if (this._isMoving) {
                bobOffset = Math.sin(this._bobT * Math.PI * 2) * 2;
            }
            
            const wallH = (h - horizon) * wallScale;
            const wallW = w * wallScale;
            const wallX = (w - wallW) / 2;
            const wallY = horizon - wallH / 2 + bobOffset;
            
            if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
                ctx.drawImage(wallImg, wallX, wallY, wallW, wallH);
                
                // Блик на стене
                const wallGradient = ctx.createLinearGradient(wallX, wallY, wallX + wallW, wallY);
                wallGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
                wallGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
                wallGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
                ctx.fillStyle = wallGradient;
                ctx.fillRect(wallX, wallY, wallW, wallH);
            } else {
                ctx.fillStyle = '#5a3a22';
                ctx.fillRect(wallX, wallY, wallW, wallH);
            }
        } else {
            // Открытый проход
            const grad = ctx.createLinearGradient(0, horizon, 0, h);
            grad.addColorStop(0, '#2a1a0a');
            grad.addColorStop(1, '#1a0f08');
            ctx.fillStyle = grad;
            ctx.fillRect(0, horizon, w, h - horizon);
            
            // Эффект глубины
            const depthGradient = ctx.createRadialGradient(w/2, horizon, 0, w/2, horizon, w/2);
            depthGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
            depthGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
            ctx.fillStyle = depthGradient;
            ctx.fillRect(0, horizon, w, h - horizon);
        }
        
        // Отрисовка объектов на клетке перед игроком
        if (frontX >= 0 && frontX < d.size && frontY >= 0 && frontY < d.size) {
            const cell = d.grid[frontY][frontX];
            if (cell && cell.open) {
                this._drawObjectOnCell(ctx, w, h, horizon, cell);
            }
        }
        
        // Виньетка (затемнение по краям)
        const vignette = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.7);
        vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
        vignette.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, w, h);
        
        // Обновление иконки джойстика
        this._updateJoystick();
    },

    // Отрисовка объекта на клетке
    _drawObjectOnCell: function(ctx, w, h, horizon, cell) {
        let img = null;
        
        // Выбор изображения в зависимости от типа объекта
        if (cell.monster) {
            img = this._getMonsterImg(cell.monsterId);
        } else if (cell.lootBag && !cell.lootCollected) {
            img = this._images.loot_bag;
        } else if (cell.lootBag && cell.lootCollected) {
            img = this._images.loot_bag_empty;
        } else if (cell.chest && !cell.looted) {
            img = this._images.chest_locked;
        } else if (cell.chest && cell.looted) {
            img = this._images.chest_open;
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
        
        if (!img || !img.complete || img.naturalWidth === 0) return;
        
        const objSize = Math.min(w * 0.3, 140);
        const objX = (w - objSize) / 2;
        const objY = horizon + (h - horizon) * 0.3 - objSize / 2;
        
        // Свечение для интерактивных объектов
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 20;
        ctx.drawImage(img, objX, objY, objSize, objSize);
        ctx.shadowBlur = 0;
    },

    // Обновление иконки джойстика
    _updateJoystick: function() {
        if (!this._joystickImg) return;
        
        const dirIcons = ['up', 'right', 'down', 'left'];
        const iconName = dirIcons[this._dir] || 'down';
        
        if (this._animImages[iconName] && this._animImages[iconName].complete) {
            this._joystickImg.src = this._animImages[iconName].src;
        }
    },

    // Запуск цикла рендеринга
    _startRenderLoop: function() {
        const self = this;
        let lastTime = performance.now();

        function render(time) {
            self._renderLoop = requestAnimationFrame(render);
            
            // Вычисление delta time
            let dt = (time - lastTime) / 1000;
            if (dt > 0.1) dt = 0.1;
            lastTime = time;

            const d = Sherwood.Dungeon.getDungeon();
            if (!d) return;
            
            self._dungeon = d;

            // Обработка движения
            if (self._isMoving) {
                self._moveT += dt * 4;
                self._bobT += dt;
                if (self._moveT >= 1) {
                    self._moveT = 1;
                    self._isMoving = false;
                    d.px = self._toX;
                    d.py = self._toY;
                    self._checkInteract();
                }
            }

            // Обработка поворота
            if (self._isTurning) {
                self._turnT += dt * 6;
                if (self._turnT >= 1) {
                    self._turnT = 1;
                    self._isTurning = false;
                    self._dir = (self._dir + self._turnDir + 4) % 4;
                }
            }

            // Отрисовка сцены
            self._draw();
            
            // Проверка интерактивных объектов
            if (!self._isMoving && !self._isTurning) {
                self._checkInteract();
            }
        }

        this._renderLoop = requestAnimationFrame(render);
    },

    // Обновление компонента
    update: function() {
        if (this._dungeon) {
            this._checkInteract();
            this._draw();
        }
    },

    // Показ компонента
    show: function() {
        if (!this._canvas) this.init();
        
        this._dungeon = Sherwood.Dungeon.getDungeon();
        
        // Добавление элементов в DOM
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

    // Скрытие компонента
    hide: function() {
        if (this._renderLoop) {
            cancelAnimationFrame(this._renderLoop);
            this._renderLoop = null;
        }
        
        // Удаление элементов из DOM
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

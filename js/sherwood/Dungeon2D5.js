// ========== 3D ПОДЗЕМКА (Canvas 2D Raycasting / Настоящий 2.5D Doom-style) ==========
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

    // ===== ДОПИСАННЫЙ МЕТОД ПРОВЕРКИ ИНТЕРАКТИВНЫХ ОБЪЕКТОВ =====
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

    // ===== НАСТОЯЩИЙ ИГРОВОЙ ЦИКЛ РЕНДЕРИНГА И РАСЧЕТА ЛУЧЕЙ (RAYCASTING) =====
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

            // Обработка интерполяции плавного движения
            let viewX = d.px + 0.5;
            let viewY = d.py + 0.5;
            if (self._isMoving) {
                self._moveT += dt * 4; // Скорость шага
                if (self._moveT >= 1) {
                    self._moveT = 1;
                    self._isMoving = false;
                    d.px = self._toX;
                    d.py = self._toY;

_draw: function() {
    const ctx = this._ctx;
    const w = this._w;
    const h = this._h;
    const d = this._dungeon;
    
    if (!ctx || !d) return;
    
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    
    let posX = d.px;
    let posY = d.py;
    
    if (this._isMoving) {
        const t = this._ease(this._moveT);
        posX = this._fromX + (this._toX - this._fromX) * t;
        posY = this._fromY + (this._toY - this._fromY) * t;
    }
    
    // Направления
    let dirFront = { x: 0, y: -1 };
    let dirLeft = { x: -1, y: 0 };
    let dirRight = { x: 1, y: 0 };
    
    if (this._dir === 1) { // Восток
        dirFront = { x: 1, y: 0 };
        dirLeft = { x: 0, y: -1 };
        dirRight = { x: 0, y: 1 };
    } else if (this._dir === 2) { // Юг
        dirFront = { x: 0, y: 1 };
        dirLeft = { x: 1, y: 0 };
        dirRight = { x: -1, y: 0 };
    } else if (this._dir === 3) { // Запад
        dirFront = { x: -1, y: 0 };
        dirLeft = { x: 0, y: 1 };
        dirRight = { x: 0, y: -1 };
    }
    
    // Клетки
    const frontCell = this._getCell(posX + dirFront.x, posY + dirFront.y);
    const leftCell = this._getCell(posX + dirLeft.x, posY + dirLeft.y);
    const rightCell = this._getCell(posX + dirRight.x, posY + dirRight.y);
    
    // Размеры зон
    const horizon = h * 0.40;
    const floorTop = horizon;
    const floorH = h - horizon;
    const ceilH = horizon;
    
    // Индексы текстур
    const texIdx = Math.abs((this._dir + Math.floor(d.px) + Math.floor(d.py)) % 6);
    
    const ceilImg = this._ceilings[texIdx];
    const floorImg = this._floors[texIdx];
    const wallImg = this._walls[texIdx];
    
    // === ПОТОЛОК ===
    if (ceilImg && ceilImg.complete && ceilImg.naturalWidth > 0) {
        ctx.drawImage(ceilImg, 0, 0, w, ceilH);
    } else {
        ctx.fillStyle = '#1a0f08';
        ctx.fillRect(0, 0, w, ceilH);
    }
    
    // === ПОЛ ===
    if (floorImg && floorImg.complete && floorImg.naturalWidth > 0) {
        ctx.drawImage(floorImg, 0, floorTop, w, floorH);
    } else {
        ctx.fillStyle = '#2a1a0a';
        ctx.fillRect(0, floorTop, w, floorH);
    }
    
    // === КОРИДОР (центр) ===
    const corridorW = w * 0.4;
    const corridorX = (w - corridorW) / 2;
    
    // Затемнение коридора
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(corridorX, horizon, corridorW, floorH);
    
    // === ПЕРЕДНЯЯ СТЕНА ===
    if (frontCell && !frontCell.open) {
        const frontWallH = floorH;
        const frontWallW = corridorW;
        
        if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
            ctx.drawImage(wallImg, corridorX, horizon, frontWallW, frontWallH);
        } else {
            ctx.fillStyle = '#5a3a22';
            ctx.fillRect(corridorX, horizon, frontWallW, frontWallH);
        }
    } else if (frontCell && frontCell.open) {
        // Открытый проход — видно дальше
        const grad = ctx.createLinearGradient(0, horizon, 0, h);
        grad.addColorStop(0, '#3a2a1a');
        grad.addColorStop(1, '#1a0f08');
        ctx.fillStyle = grad;
        ctx.fillRect(corridorX, horizon, corridorW, floorH);
        
        // Объект на передней клетке
        this._drawCellObject(ctx, corridorX, corridorW, horizon, floorH, frontCell);
    }
    
    // === ЛЕВАЯ СТЕНА ===
    const leftW = corridorX;
    if (leftCell && !leftCell.open) {
        if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
            ctx.drawImage(wallImg, 0, horizon, leftW, floorH);
        } else {
            ctx.fillStyle = '#4a2a12';
            ctx.fillRect(0, horizon, leftW, floorH);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(0, horizon, leftW, floorH);
    } else {
        // Открытая боковая клетка
        const grad = ctx.createLinearGradient(0, horizon, leftW, horizon);
        grad.addColorStop(0, '#2a1a0a');
        grad.addColorStop(1, '#1a0f08');
        ctx.fillStyle = grad;
        ctx.fillRect(0, horizon, leftW, floorH);
    }
    
    // === ПРАВАЯ СТЕНА ===
    const rightW = corridorX;
    const rightX = corridorX + corridorW;
    if (rightCell && !rightCell.open) {
        if (wallImg && wallImg.complete && wallImg.naturalWidth > 0) {
            ctx.drawImage(wallImg, rightX, horizon, rightW, floorH);
        } else {
            ctx.fillStyle = '#4a2a12';
            ctx.fillRect(rightX, horizon, rightW, floorH);
        }
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(rightX, horizon, rightW, floorH);
    } else {
        const grad = ctx.createLinearGradient(rightX, horizon, rightX + rightW, horizon);
        grad.addColorStop(0, '#1a0f08');
        grad.addColorStop(1, '#2a1a0a');
        ctx.fillStyle = grad;
        ctx.fillRect(rightX, horizon, rightW, floorH);
    }
    
    // Разделительные линии
    ctx.strokeStyle = 'rgba(0,0,0,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(corridorX, horizon);
    ctx.lineTo(corridorX, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(corridorX + corridorW, horizon);
    ctx.lineTo(corridorX + corridorW, h);
    ctx.stroke();
    
    // Джойстик
    this._updateJoystick();
},

_getCell: function(x, y) {
    const d = this._dungeon;
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || ix >= d.size || iy < 0 || iy >= d.size) return null;
    return d.grid[iy][ix];
},

_drawCellObject: function(ctx, x, w, horizon, floorH, cell) {
    let img = null;
    
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
    
    const objSize = Math.min(w * 0.6, 100);
    const objX = x + (w - objSize) / 2;
    const objY = horizon + floorH * 0.35 - objSize / 2;
    
    ctx.globalAlpha = 0.85;
    ctx.drawImage(img, objX, objY, objSize, objSize);
    ctx.globalAlpha = 1;
},

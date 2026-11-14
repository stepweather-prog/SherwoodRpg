/**
 * battle_visuals.js — Единый визуальный стиль боя
 * Отвечает ТОЛЬКО за отрисовку врага, HP-бара, проверку стрел и кнопок.
 * Не трогает логику урона и статы.
 */

if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

Sherwood.BattleVisuals = {
    
    // ============================================================
    //  1. НАСТРОЙКА ВРАГА (Спрайт)
    //  Вызывать при создании врага в бою.
    //  isBoss — true/false, чтобы правильно подобрать размер.
    // ============================================================
    setupEnemySprite: function(sprite, isBoss) {
        if (!sprite) return;
        
        // Уменьшаем и опускаем вниз (эталон — подземка)
        var scale = isBoss ? 2.3 : 2.0;
        sprite.scale.set(scale, scale, 1);
        
        // Центр внизу, чтобы HP-бар привязывался к макушке
        sprite.center.set(0.5, 0);
        
        // Опускаем вниз (чтобы не висел в воздухе)
        sprite.position.set(0, -0.4, 0);
        
        // Отключаем тест глубины, чтобы спрайт был поверх фона
        if (sprite.material) {
            sprite.material.depthTest = false;
            sprite.material.depthWrite = false;
        }
        sprite.renderOrder = 10;
    },

    // ============================================================
    //  2. ОБНОВЛЕНИЕ HP-БАРА ВРАГА
    //  Вызывать в цикле animate(), когда бой активен.
    // ============================================================
    updateMobHpBar: function(sprite, camera, domElementId) {
        if (!sprite) return;
        
        var worldPos = new THREE.Vector3();
        sprite.getWorldPosition(worldPos);
        
        // Поднимаем ровно на макушку (половина высоты спрайта + 0.1)
        worldPos.y += (sprite.scale.y * 0.5) + 0.1;
        
        worldPos.project(camera);
        
        var x = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
        var y = (-worldPos.y * 0.5 + 0.5) * window.innerHeight;
        
        var el = document.getElementById(domElementId || 'mob-hp');
        if (el) {
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.transform = 'translate(-50%, -100%)';
        }
    },

    // ============================================================
    //  3. ПРОВЕРКА СТРЕЛ
    //  Возвращает объект с результатом: есть ли стрелы, какой штраф к урону.
    // ============================================================
    checkArrows: function(arrowsCount, arrowsNeeded) {
        if (typeof arrowsNeeded === 'undefined') arrowsNeeded = 3;
        return {
            hasArrows: arrowsCount >= arrowsNeeded,
            arrowsNeeded: arrowsNeeded,
            currentArrows: arrowsCount,
            damagePenalty: (arrowsCount >= arrowsNeeded) ? 1.0 : 0.5 // -50% урона, если нет стрел
        };
    },

    // ============================================================
    //  4. ЭФФЕКТ УДАРА (Всплывающий спрайт)
    // ============================================================
    showHitEffect: function(sprite, camera, domElementId) {
        if (!sprite) return;
        var el = document.getElementById(domElementId || 'hit-effect');
        var img = document.getElementById('hit-effect-img');
        if (!el || !img) return;

        var worldPos = new THREE.Vector3();
        sprite.getWorldPosition(worldPos);
        
        // Сдвигаем эффект немного в сторону от врага
        worldPos.x += (Math.random() - 0.5) * 2;
        worldPos.project(camera);
        
        var x = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
        var y = (-worldPos.y * 0.5 + 0.5) * window.innerHeight;
        
        el.style.left = (x + (Math.random() < 0.5 ? -120 : 120)) + 'px';
        el.style.top = (y + (Math.random() - 0.5) * 60) + 'px';
        el.style.display = 'block';
        
        setTimeout(function() { el.style.display = 'none'; }, 200);
    },

    // ============================================================
    //  5. КНОПКА АТАКИ (Кулдаун и блокировка)
    // ============================================================
    updateAttackButton: function(isActive, cooldown, iconId, overlayId) {
        var icon = document.getElementById(iconId || 'attack-icon-img');
        var overlay = document.getElementById(overlayId || 'attack-cooldown-overlay');
        if (!icon) return;

        if (isActive) {
            if (cooldown > 0) {
                if (overlay) {
                    overlay.style.display = 'flex';
                    overlay.textContent = cooldown.toFixed(1) + 's';
                }
                icon.style.opacity = '0.4';
            } else {
                if (overlay) overlay.style.display = 'none';
                icon.style.opacity = '1';
            }
        }
    }
};

console.log('⚔️ BattleVisuals (единый стиль боя) загружен!');

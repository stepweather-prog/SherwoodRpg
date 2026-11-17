/**
 * Sherwood Battle Visuals — единая боевая система (эталон dungeon.html)
 
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.BattleVisuals = (function () {
    'use strict';

    // ============================================================
    //  КОНСТАНТЫ ЭТАЛОНА (dungeon.html)
    // ============================================================
    var CFG = {
        ARROWS_MAX: 25,
        ARROWS_NEEDED: 1,
        ARROW_DAMAGE_MULT: 0.5,

        FILTH_SELF_RATE: 10,
        FILTH_SELF_AMOUNT: 7,
        FILTH_PER_HIT: 5,
        FILTH_DEATH_TIME: 20,
        FILTH_DEATH_TICK: 3,
        FILTH_DEATH_DMG: 150,

        ENEMY_ATTACK_INTERVAL: 1000,

        COOLDOWN_ATTACK: 1,

        SKILL_COST_STUN: 20,
        SKILL_COST_NUMB: 40,
        SKILL_COST_RAGE: 60,
        SKILL_CD_STUN: 20000,
        SKILL_CD_NUMB: 25000,
        SKILL_CD_RAGE: 8000,

        VAMPIRIC_CHANCE: 0.30,
        VAMPIRIC_PCT: 0.30,

        SHAKE_AMOUNT: 0.06,
        SHAKE_DECAY: 0.85,

        KNOCKBACK_DIST: 0.10,
        KNOCKBACK_TIME: 0.25,

        TALENT_RICOCHET_CHANCE: 0.45
    };

    var FX_DIR = 'assets/assets2/animation/';
    var BLOOD_OVERLAYS = [
        FX_DIR + 'Fine_blood_spray_texture.png',
        FX_DIR + 'Fine_blood_spray_texture_1.png',
        FX_DIR + 'Fine_blood_spray_texture_2.png'
    ];
    var ARROW_FX_VIDEO = FX_DIR + 'sherwood_hollow_arrow.webm';
    var ARROW_FX_SIZE = 360;
    var ARROW_FX_EXPLODE_Y = 0.29;

    var HIT_SPRITES = [
        'assets/assets2/game_details/strike_claws.png',
        'assets/assets2/game_details/strike_claws_1.png',
        'assets/assets2/game_details/strike_claws_2.png',
        'assets/assets2/game_details/strike_claws_4.png',
        'assets/assets2/game_details/strike_claws_5.png',
        'assets/assets2/game_details/strike_claws_6.png'
    ];

    // ============================================================
    //  СОСТОЯНИЕ
    // ============================================================
    var S = {
        ctx: {},
        scene: null,
        camFPS: null,
        camFPSBase: { y: 0.55, z: 3.6, lookY: 0.45 },
        loader: null,
        hitFlashSprite: null,
        bloodTextures: [],

        active: false,
        dead: false,
        enemy: null,
        enemyObj: null,
        enemySprite: null,

        arrows: 25,
        filthTimer: 0,
        filthFullSince: 0,
        filthDamageTimer: 0,
        playerAttackCooldown: 0,
        playerStunned: 0,
        enemyStunned: 0,
        vampirismBuff: 0,
        vampirismReady: false,
        rageCharges: 0,
        playerHitFirst: false,
        skillCooldowns: {},
        battleTimer: null,

        cameraShake: 0,
        knockback: { active: false, sprite: null, ox: 0, oz: 0, t: 0, dur: 0.25, dx: 0, dz: 0 },
        hitFlashTimer: null,
        domReady: false
    };

    var TALENT_DATA = {
        'stunning': { icon: 'assets/assets2/talents/stunning.png', name: 'Оглушение', filthCost: 20, stunTime: 10, cooldown: 20000 },
        'numbness': { icon: 'assets/assets2/talents/numbness.png', name: 'Онемение', filthCost: 40, cooldown: 25000 },
        'ricochet': { icon: 'assets/assets2/talents/ricochet.png', name: 'Рикошет', chance: 0.45 }
    };

    // ============================================================
    //  DOM
    // ============================================================
    var DOM = {

        ensure: function () {
            if (S.domReady) return;
            var d = document;

            function mk(id, css, tag) {
                var el = d.getElementById(id);
                if (!el) {
                    el = d.createElement(tag || 'div');
                    el.id = id;
                    el.style.cssText = css;
                    d.body.appendChild(el);
                }
                return el;
            }

            // HP-бар врага (за спрайтом)
            mk('mob-hp-bar', 'position:absolute;width:0;height:0;pointer-events:none;z-index:40;display:none;');

            // Сферы героя
            var life = mk('hero-life', 'position:absolute;bottom:10px;left:-20px;width:110px;height:110px;z-index:50;');
            if (!life.dataset.bvInit) {
                life.dataset.bvInit = '1';
                life.innerHTML = '<img src="assets/assets2/game_details/sphere_of_life.png" style="position:absolute;top:0;left:0;width:135%;height:135%;object-fit:contain;">' +
                    '<img id="life-fill" src="assets/assets2/game_details/filling_life.png" style="position:absolute;top:0;left:0;width:135%;height:135%;object-fit:contain;clip-path:inset(0 0 0 0);top:-10px;">' +
                    '<span id="hp-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:16px;font-weight:bold;text-shadow:0 0 4px #000,0 0 8px #000;">HP: 0</span>';
            }

            var mana = mk('hero-mana', 'position:absolute;bottom:10px;right:10px;width:110px;height:110px;z-index:50;');
            if (!mana.dataset.bvInit) {
                mana.dataset.bvInit = '1';
                mana.innerHTML = '<img src="assets/assets2/game_details/sphere_of_filth.png" style="position:absolute;top:0;left:0;width:135%;height:135%;object-fit:contain;">' +
                    '<img id="mana-fill" src="assets/assets2/game_details/filling_with_filth.png" style="position:absolute;top:0;left:0;width:135%;height:135%;object-fit:contain;clip-path:inset(0 0 0 0);top:-10px;">' +
                    '<span id="mana-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:16px;font-weight:bold;text-shadow:0 0 4px #000,0 0 8px #000;">Скверна: 0%</span>';
            }

            // Счётчик стрел
            var arrows = mk('arrow-counter', 'position:fixed;top:12px;left:50%;transform:translateX(calc(-50% - 70px));color:#e0c080;font-size:16px;font-weight:bold;text-shadow:0 0 8px #000;z-index:35;pointer-events:none;background:rgba(0,0,0,0.55);padding:4px 14px;border:2px solid #6b5a3a;border-radius:6px;display:flex;align-items:center;gap:6px;');
            if (!arrows.dataset.bvInit) {
                arrows.dataset.bvInit = '1';
                arrows.innerHTML = '<img src="assets/interface/sherwood_hollow_arrow.png" style="width:22px;height:22px;object-fit:contain;" alt=""><span id="arrow-count-text">25</span>';
            }

            // Боевой UI
            var controls = mk('battle-controls', 'position:absolute;bottom:120px;left:50%;transform:translateX(-50%);display:none;flex-direction:column;align-items:center;gap:15px;z-index:45;');
            if (!controls.dataset.bvInit) {
                controls.dataset.bvInit = '1';
                controls.innerHTML =
                    '<div id="attack-icon" style="position:absolute;bottom:100%;left:50%;transform:translateX(calc(-50% - 20px));margin-bottom:70px;width:85px;height:85px;cursor:pointer;pointer-events:auto;padding:0;border:none;background:none;flex-shrink:0;">' +
                    '<img id="attack-icon-img" src="assets/assets2/talents/simple_attack.png" style="width:85px;height:85px;object-fit:contain;border-radius:8px;border:3px solid rgba(200,160,80,0.8);background:rgba(0,0,0,0.6);padding:3px;box-sizing:border-box;transition:all 0.2s;display:block;">' +
                    '<div id="attack-cooldown-overlay" style="position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);border-radius:8px;display:none;align-items:center;justify-content:center;color:#ff5555;font-weight:bold;font-size:20px;">0.0s</div>' +
                    '</div>' +
                    '<div id="skills-row" style="display:flex;flex-direction:row;justify-content:center;align-items:center;gap:15px;flex-wrap:nowrap;"></div>';
            }

            // Эффект удара
            var hit = mk('hit-effect', 'position:absolute;display:none;pointer-events:none;z-index:60;transform:translate(-50%,-50%);');
            if (!hit.dataset.bvInit) {
                hit.dataset.bvInit = '1';
                hit.innerHTML = '<img id="hit-effect-img" src="" style="width:180px;height:180px;object-fit:contain;filter:drop-shadow(0 0 20px rgba(255,0,0,0.6));" alt="">';
            }

            // Кровавый оверлей
            var blood = mk('blood-overlay', 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:150;pointer-events:none;opacity:0;background-position:center center;background-repeat:no-repeat;background-size:cover;transition:opacity 0.1s ease-out;');
            if (!blood.dataset.bvInit) {
                blood.dataset.bvInit = '1';
                blood.style.backgroundImage = 'url(' + BLOOD_OVERLAYS[0] + ')';
            }

            // Прицел
            mk('crosshair', 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#c8a050;font-size:22px;pointer-events:none;z-index:20;text-shadow:0 0 12px #8b6b3a;opacity:0.8;display:none;');

            // Эффект полёта стрелы (webm с зелёным хромакеем)
            var af = mk('arrow-flight-layer', 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:70;display:none;');
            if (!af.dataset.bvInit) {
                af.dataset.bvInit = '1';
                var v = d.createElement('video');
                v.id = 'arrow-flight-video';
                v.src = ARROW_FX_VIDEO;
                v.muted = true;
                v.playsInline = true;
                v.setAttribute('playsinline', '');
                v.style.cssText = 'position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;';
                v.preload = 'auto';
                af.appendChild(v);
                var c = d.createElement('canvas');
                c.id = 'arrow-flight-canvas';
                c.width = ARROW_FX_SIZE;
                c.height = ARROW_FX_SIZE;
                c.style.cssText = 'position:absolute;left:0;top:0;';
                af.appendChild(c);
            }

            S.domReady = true;
        },

        // ===== ЭФФЕКТ ПОЛЁТА СТРЕЛЫ (хромакей) =====
        arrowFlight: function (sprite, camera) {
            try {
                var layer = document.getElementById('arrow-flight-layer');
                var video = document.getElementById('arrow-flight-video');
                var canvas = document.getElementById('arrow-flight-canvas');
                if (!layer || !video || !canvas) return;

                // Проекция врага в экранные координаты
                var pos = new window.THREE.Vector3();
                if (sprite && sprite.position) pos.copy(sprite.position);
                pos.y += 0.55;
                pos.project(camera);
                var sx = (pos.x * 0.5 + 0.5) * window.innerWidth;
                var sy = (-pos.y * 0.5 + 0.5) * window.innerHeight;

                layer.style.display = 'block';
                canvas.style.left = (sx - ARROW_FX_SIZE / 2) + 'px';
                canvas.style.top = (sy - ARROW_FX_SIZE / 2) + 'px';

                var cctx = canvas.getContext('2d');
                var running = true;

                function drawFrame() {
                    if (!running) return;
                    if (video.readyState >= 2) {
                        cctx.clearRect(0, 0, ARROW_FX_SIZE, ARROW_FX_SIZE);
                        cctx.drawImage(video, 0, 0, ARROW_FX_SIZE, ARROW_FX_SIZE);
                        var img = cctx.getImageData(0, 0, ARROW_FX_SIZE, ARROW_FX_SIZE);
                        var data = img.data;
                        for (var i = 0; i < data.length; i += 4) {
                            var r = data[i], g = data[i + 1], b = data[i + 2];
                            if (g > 90 && g > r * 1.35 && g > b * 1.35) {
                                data[i + 3] = 0;
                            } else if (g > 70 && g > r * 1.15 && g > b * 1.15) {
                                data[i + 3] = Math.max(0, 255 - (g - 70) * 6);
                            }
                        }
                        cctx.putImageData(img, 0, 0);
                    }
                    if (!video.paused && !video.ended) {
                        requestAnimationFrame(drawFrame);
                    } else {
                        running = false;
                        layer.style.display = 'none';
                    }
                }

                video.currentTime = 0;
                var p = video.play();
                if (p && p.catch) p.catch(function () { running = false; layer.style.display = 'none'; });
                requestAnimationFrame(drawFrame);
            } catch (e) {}
        },

        hideArrowFlight: function () {
            try {
                var layer = document.getElementById('arrow-flight-layer');
                var video = document.getElementById('arrow-flight-video');
                if (video) { try { video.pause(); } catch (e) {} }
                if (layer) layer.style.display = 'none';
            } catch (e) {}
        },

        // ===== ЦЕНТРАЛЬНЫЙ ТЕКСТ =====
        centerText: function (text, color) {
            if (S.ctx.onCenterText) { S.ctx.onCenterText(text, color); return; }
            var el = document.createElement('div');
            el.textContent = text;
            el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:' + (color || '#fff') + ';font-size:36px;font-weight:bold;text-shadow:0 0 12px #000;pointer-events:none;z-index:200;';
            document.body.appendChild(el);
            setTimeout(function () { el.remove(); }, 1500);
        },

        // ===== UI БОЯ =====
        showBattleUI: function (show) {
            var controls = document.getElementById('battle-controls');
            var crosshair = document.getElementById('crosshair');
            if (controls) controls.style.display = show ? 'flex' : 'none';
            if (crosshair) crosshair.style.display = show ? 'block' : 'none';
        },

        updateMobName: function (name) {
            var el = document.getElementById('mob-hp-name');
            if (el) el.textContent = name || 'Враг';
        },

        updateMobHp: function (hp, maxHp) {
            var fill = document.getElementById('mob-hp-fill');
            var text = document.getElementById('mob-hp-text');
            var bar = document.getElementById('mob-hp-bar');
            var pct = maxHp > 0 ? Math.max(0, hp / maxHp) : 0;
            if (fill) fill.style.clipPath = 'inset(0 ' + ((1 - pct) * 100) + '% 0 0)';
            if (text) text.textContent = 'HP: ' + Math.max(0, Math.ceil(hp)) + '/' + maxHp;
            if (bar) bar.style.display = S.active ? 'block' : 'none';
        },

        updateHeroSpheres: function (p) {
            if (!p || !p.stats) return;
            var hpPct = Math.max(0, Math.min(1, (p.stats.hp || 0) / (p.stats.maxHp || 1)));
            var lifeFill = document.getElementById('life-fill');
            if (lifeFill) lifeFill.style.clipPath = 'inset(' + ((1 - hpPct) * 100) + '% 0 0 0)';
            var hpText = document.getElementById('hp-text');
            if (hpText) hpText.textContent = 'HP: ' + Math.max(0, Math.ceil(p.stats.hp || 0));

            var filthPct = Math.max(0, Math.min(1, (p.stats.filth || 0) / (p.stats.maxFilth || 100)));
            var manaFill = document.getElementById('mana-fill');
            if (manaFill) manaFill.style.clipPath = 'inset(' + ((1 - filthPct) * 100) + '% 0 0 0)';
            var manaText = document.getElementById('mana-text');
            if (manaText) manaText.textContent = 'Скверна: ' + Math.round(filthPct * 100) + '%';
        },

        updateArrowCounter: function (n) {
            var text = document.getElementById('arrow-count-text');
            var counter = document.getElementById('arrow-counter');
            if (text) text.textContent = n;
            if (counter) {
                if (n <= 5) counter.classList.add('low');
                else counter.classList.remove('low');
            }
        },

        updateAttackButton: function (cd) {
            var overlay = document.getElementById('attack-cooldown-overlay');
            if (!overlay) return;
            if (cd > 0) {
                overlay.style.display = 'flex';
                overlay.textContent = cd.toFixed(1) + 's';
            } else {
                overlay.style.display = 'none';
            }
        },

        // ===== ЭФФЕКТ УДАРА =====
        hitEffect: function (sprite, camera) {
            var hit = document.getElementById('hit-effect');
            var img = document.getElementById('hit-effect-img');
            if (!hit || !img || !sprite) return;
            var pos = new window.THREE.Vector3();
            pos.copy(sprite.position);
            pos.y += 0.4;
            pos.project(camera);
            var sx = (pos.x * 0.5 + 0.5) * window.innerWidth;
            var sy = (-pos.y * 0.5 + 0.5) * window.innerHeight;
            hit.style.left = sx + 'px';
            hit.style.top = sy + 'px';
            img.src = HIT_SPRITES[Math.floor(Math.random() * HIT_SPRITES.length)];
            hit.style.display = 'block';
            if (S.hitFlashTimer) clearTimeout(S.hitFlashTimer);
            S.hitFlashTimer = setTimeout(function () { hit.style.display = 'none'; }, 200);
        },

        // ===== КРОВЬ НА ЭКРАНЕ =====
        bloodOverlay: function (intensity) {
            var blood = document.getElementById('blood-overlay');
            if (!blood) return;
            if (S.bloodTextures.length === 0) {
                for (var i = 0; i < BLOOD_OVERLAYS.length; i++) {
                    var t = new Image();
                    t.src = BLOOD_OVERLAYS[i];
                    S.bloodTextures.push(t);
                }
            }
            var idx = Math.floor(Math.random() * BLOOD_OVERLAYS.length);
            blood.style.backgroundImage = 'url(' + BLOOD_OVERLAYS[idx] + ')';
            blood.style.opacity = String(Math.min(1, intensity));
            if (S.bloodHideTimer) clearTimeout(S.bloodHideTimer);
            S.bloodHideTimer = setTimeout(function () { blood.style.opacity = '0'; }, 350);
        },

        // ===== СКИЛЛЫ =====
        renderSkills: function () {
            var row = document.getElementById('skills-row');
            if (!row) return;
            row.innerHTML = '';
            var p = Logic.getPlayer();
            var learned = (S.ctx.Talents && typeof S.ctx.Talents.getLearned === 'function') ? S.ctx.Talents.getLearned() : [];

            function addSkill(id, icon, title) {
                var btn = document.createElement('img');
                btn.className = 'skill-btn';
                btn.src = icon;
                btn.title = title;
                btn.dataset.skill = id;
                btn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    Logic.useSkill(id);
                });
                row.appendChild(btn);
            }

            if (learned.indexOf('stunning') !== -1) {
                addSkill('stunning', TALENT_DATA.stunning.icon, 'Оглушение (20 скверны)');
            }
            if (learned.indexOf('numbness') !== -1) {
                addSkill('numbness', TALENT_DATA.numbness.icon, 'Онемение (40 скверны)');
            }
            if (learned.indexOf('ricochet') !== -1) {
                addSkill('ricochet', TALENT_DATA.ricochet.icon, 'Рикошет (60 скверны)');
            }
        },

        updateSkillCooldowns: function () {
            var row = document.getElementById('skills-row');
            if (!row) return;
            var btns = row.querySelectorAll('.skill-btn');
            for (var i = 0; i < btns.length; i++) {
                var id = btns[i].dataset.skill;
                var until = S.skillCooldowns[id] || 0;
                var now = Date.now();
                if (until > now) {
                    btns[i].classList.add('on-cooldown');
                    var left = ((until - now) / 1000).toFixed(1);
                    btns[i].title = 'Кулдаун: ' + left + 's';
                } else {
                    btns[i].classList.remove('on-cooldown');
                }
            }
        },

        // ===== HP-БАР ЗА СПРАЙТОМ =====
        positionMobHpBar: function (sprite, camera) {
            var bar = document.getElementById('mob-hp-bar');
            if (!bar || !sprite) return;
            var pos = new window.THREE.Vector3();
            pos.copy(sprite.position);
            pos.y += 0.85;
            pos.project(camera);
            var sx = (pos.x * 0.5 + 0.5) * window.innerWidth;
            var sy = (-pos.y * 0.5 + 0.5) * window.innerHeight;
            bar.style.left = (sx - 150) + 'px';
            bar.style.top = (sy - 100) + 'px';
        }
    };

    // ============================================================
    //  FX (тряска, нокбэк, вспышки, HP-бар)
    // ============================================================
    var FX = {

        initScene: function () {
            S.cameraShake = 0;
        },

        shake: function (amount) {
            S.cameraShake = Math.max(S.cameraShake, amount || CFG.SHAKE_AMOUNT);
        },

        updateShake: function () {
            if (!S.ctx.camFPS) return;
            var cam = S.ctx.camFPS;
            if (S.cameraShake > 0.001) {
                var base = S.camFPSBase;
                cam.position.x = (Math.random() - 0.5) * S.cameraShake;
                cam.position.y = (base.y || 0.55) + (Math.random() - 0.5) * S.cameraShake;
                if (base.z) cam.position.z = base.z + (Math.random() - 0.5) * S.cameraShake;
                cam.lookAt(0, base.lookY || 0.45, 0);
                S.cameraShake *= CFG.SHAKE_DECAY;
            } else if (S.cameraShake !== 0) {
                var b = S.camFPSBase;
                cam.position.set(0, b.y || 0.55, b.z || 3.6);
                cam.lookAt(0, b.lookY || 0.45, 0);
                S.cameraShake = 0;
            }
        },

        knockback: function (sprite, dirX, dirZ) {
            if (!sprite) return;
            S.knockback.active = true;
            S.knockback.sprite = sprite;
            S.knockback.ox = sprite.position.x;
            S.knockback.oz = sprite.position.z;
            S.knockback.dx = dirX || 0;
            S.knockback.dz = (dirZ !== undefined) ? dirZ : CFG.KNOCKBACK_DIST;
            S.knockback.t = 0;
            S.knockback.dur = CFG.KNOCKBACK_TIME;
        },

        updateKnockback: function (dt) {
            var kb = S.knockback;
            if (!kb.active || !kb.sprite) return;
            kb.t += dt;
            var k = Math.min(1, kb.t / kb.dur);
            var eased = Math.sin(k * Math.PI) * (1 - k * 0.5);
            kb.sprite.position.x = kb.ox + kb.dx * eased;
            kb.sprite.position.z = kb.oz + kb.dz * eased;
            if (k >= 1) {
                kb.sprite.position.x = kb.ox;
                kb.sprite.position.z = kb.oz;
                kb.active = false;
                kb.sprite = null;
            }
        },

        setupEnemySprite: function (sprite, isBoss) {
            if (!sprite) return;
            sprite.position.set(0, -0.4, 0);
            if (isBoss) {
                sprite.scale.set(2.2, 2.2, 1);
            } else {
                sprite.scale.set(1.6, 1.6, 1);
            }
        },

        updateMobHpBarFor: function (sprite, camera) {
            DOM.positionMobHpBar(sprite, camera);
        }
    };

    // ============================================================
    //  ЛОГИКА БОЯ (формулы эталона)
    // ============================================================
    var Logic = {

        getPlayer: function () {
            try {
                if (S.ctx.getPlayer) return S.ctx.getPlayer();
                if (typeof parent !== 'undefined' && parent.Sherwood && parent.Sherwood.getPlayer) return parent.Sherwood.getPlayer();
            } catch (e) {}
            return null;
        },

        loadArrows: function () {
            var p = Logic.getPlayer();
            var stored = 0;
            try {
                if (p && p.bag && typeof p.bag.arrows === 'number') stored = p.bag.arrows;
            } catch (e) {}
            S.arrows = Math.max(0, Math.min(CFG.ARROWS_MAX, stored || CFG.ARROWS_MAX));
            DOM.updateArrowCounter(S.arrows);
        },

        loadArrowsFromBag: function () {
            Logic.loadArrows();
        },

        returnArrowsToBag: function () {
            var p = Logic.getPlayer();
            try {
                if (p && p.bag) p.bag.arrows = S.arrows;
            } catch (e) {}
        },

        // ===== АТАКА ИГРОКА =====
        attack: function () {
            if (!S.active || !S.enemy) return;
            if (S.playerAttackCooldown > 0) return;
            if (S.playerStunned > 0) return;

            var p = Logic.getPlayer();
            if (!p || !p.stats) return;

            S.playerAttackCooldown = CFG.COOLDOWN_ATTACK;

            var usedArrow = false;
            if (S.arrows >= CFG.ARROWS_NEEDED) {
                S.arrows -= CFG.ARROWS_NEEDED;
                usedArrow = true;
                DOM.updateArrowCounter(S.arrows);
                DOM.arrowFlight(S.enemySprite, S.camFPS);
            }

            var atk = p.stats.atk || 0;
            var def = S.enemy.def || 0;
            var dmg = Math.max(50, atk * 1.5 - def * 0.5 + Math.random() * 20);
            if (!usedArrow) dmg *= CFG.ARROW_DAMAGE_MULT;

            // Рикошет (талант)
            var learned = (S.ctx.Talents && typeof S.ctx.Talents.isLearned === 'function') ? S.ctx.Talents.isLearned('ricochet') : false;
            if (learned && Math.random() < CFG.TALENT_RICOCHET_CHANCE) {
                dmg *= 2;
                DOM.centerText('РИКОШЕТ!', '#ffd700');
            }

            S.enemy.hp -= dmg;
            S.playerHitFirst = true;

            DOM.hitEffect(S.enemySprite, S.camFPS);
            FX.shake(CFG.SHAKE_AMOUNT);
            FX.knockback(S.enemySprite, 0, CFG.KNOCKBACK_DIST);
            DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);

            if (S.ctx.playSoundHit) S.ctx.playSoundHit();

            // Скверна за удар
            Logic.addFilth(CFG.FILTH_PER_HIT);

            if (S.enemy.hp <= 0) {
                Logic._kill();
                return;
            }

            // Ответ врага
            Logic._enemyHitsPlayer();
        },

        // ===== ОТВЕТ ВРАГА =====
        _enemyHitsPlayer: function () {
            var p = Logic.getPlayer();
            if (!p || !p.stats) return;

            var eAtk = S.enemy.atk || 0;
            var pDef = p.stats.def || 0;
            var dmg = Math.max(5, eAtk * 0.5 - pDef * 0.25 + Math.random() * 10);

            // Блок (талант blocking — снижает урон)
            var blocking = (S.ctx.Talents && typeof S.ctx.Talents.isLearned === 'function') ? S.ctx.Talents.isLearned('blocking') : false;
            if (blocking) dmg *= 0.7;

            p.stats.hp = Math.max(0, p.stats.hp - dmg);

            // Вампиризм врага (30% шанс восстановить 30% нанесённого)
            if (S.vampirismReady && S.vampirismBuff > 0) {
                S.enemy.hp = Math.min(S.enemy.maxHp, S.enemy.hp + dmg * CFG.VAMPIRIC_PCT);
                DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);
            }

            DOM.bloodOverlay(dmg / (p.stats.maxHp || 100));
            DOM.updateHeroSpheres(p);
            if (S.ctx.onHpChanged) S.ctx.onHpChanged();

            if (p.stats.hp <= 0) {
                Logic._death('enemy');
            }
        },

        // ===== СКИЛЛЫ =====
        useSkill: function (id) {
            if (!S.active || !S.enemy) return;
            var p = Logic.getPlayer();
            if (!p || !p.stats) return;

            var now = Date.now();
            if ((S.skillCooldowns[id] || 0) > now) return;

            var t = TALENT_DATA[id];
            if (!t || !t.filthCost) return;
            if ((p.stats.filth || 0) < t.filthCost) {
                DOM.centerText('Недостаточно скверны!', '#aa44ff');
                return;
            }

            Logic.spendFilth(t.filthCost);
            S.skillCooldowns[id] = now + t.cooldown;

            if (id === 'stunning') {
                S.enemyStunned = t.stunTime;
                DOM.centerText('ОГЛУШЕНИЕ!', '#ffd700');
            } else if (id === 'numbness') {
                S.playerStunned = 0;
                S.enemyStunned = Math.max(S.enemyStunned, 5);
                DOM.centerText('ОНЕМЕНИЕ!', '#88aaff');
            } else if (id === 'ricochet') {
                S.rageCharges = 3;
                DOM.centerText('РИКОШЕТ АКТИВЕН!', '#ffd700');
            }

            DOM.updateSkillCooldowns();
        },

        // ===== СКВЕРНА =====
        getFilth: function () {
            var p = Logic.getPlayer();
            return (p && p.stats) ? (p.stats.filth || 0) : 0;
        },

        setFilth: function (v) {
            var p = Logic.getPlayer();
            if (!p || !p.stats) return;
            var max = p.stats.maxFilth || 100;
            v = Math.max(0, Math.min(max, v));
            if (p && p.stats) p.stats.filth = v;
        },

        addFilth: function (n) { Logic.setFilth(Logic.getFilth() + n); },
        spendFilth: function (n) { Logic.setFilth(Logic.getFilth() - n); },

        _updateFilth: function (dt) {
            if (!S.active || S.dead) return;
            var p = Logic.getPlayer();
            if (!p || !p.stats) return;
            if (typeof p.stats.filth !== 'number') p.stats.filth = 0;
            if (typeof p.stats.maxFilth !== 'number') p.stats.maxFilth = 100;

            S.filthTimer += dt;
            if (S.filthTimer >= CFG.FILTH_SELF_RATE) {
                S.filthTimer -= CFG.FILTH_SELF_RATE;
                Logic.addFilth(CFG.FILTH_SELF_AMOUNT);
            }

            if (p.stats.filth >= p.stats.maxFilth) {
                S.filthFullSince += dt;
                if (S.filthFullSince >= CFG.FILTH_DEATH_TIME) {
                    S.filthDamageTimer += dt;
                    if (S.filthDamageTimer >= CFG.FILTH_DEATH_TICK) {
                        S.filthDamageTimer = 0;
                        p.stats.hp = Math.max(0, p.stats.hp - CFG.FILTH_DEATH_DMG);
                        DOM.centerText('СКВЕРНА ПОГЛОЩАЕТ!', '#aa44ff');
                        DOM.updateHeroSpheres(p);
                        if (S.ctx.onHpChanged) S.ctx.onHpChanged();
                        if (p.stats.hp <= 0) {
                            DOM.centerText('СКВЕРНА ПОГЛОТИЛА ТЕБЯ', '#aa44ff');
                            Logic._death('filth');
                        }
                    }
                }
            } else {
                S.filthFullSince = 0;
                S.filthDamageTimer = 0;
            }
        },

        // ===== ГЛАВНЫЙ ЦИКЛ =====
        update: function (dt) {
            if (S.playerAttackCooldown > 0) S.playerAttackCooldown = Math.max(0, S.playerAttackCooldown - dt);
            if (S.playerStunned > 0) S.playerStunned = Math.max(0, S.playerStunned - dt);
            if (S.enemyStunned > 0) S.enemyStunned = Math.max(0, S.enemyStunned - dt);
            if (S.vampirismBuff > 0) S.vampirismBuff = Math.max(0, S.vampirismBuff - dt);

            Logic._updateFilth(dt);
            FX.updateShake();
            FX.updateKnockback(dt);

            if (S.active && S.enemy && S.enemySprite) {
                FX.updateMobHpBarFor(S.enemySprite, S.camFPS);
                DOM.updateAttackButton(S.playerAttackCooldown);
            }

            DOM.updateSkillCooldowns();
            DOM.updateHeroSpheres(Logic.getPlayer());
        },

        // ===== ЖИЗНЕННЫЙ ЦИКЛ БОЯ =====
        stopTimer: function () {
            if (S.battleTimer) { clearInterval(S.battleTimer); S.battleTimer = null; }
        },

        start: function (enemy) {
            if (!enemy) return;
            Logic.stopTimer();
            S.active = true;
            S.dead = false;
            S.playerHitFirst = false;
            S.playerAttackCooldown = 0;
            S.playerStunned = 0;
            S.enemyStunned = 0;
            S.rageCharges = 0;
            S.enemyObj = enemy;
            S.enemy = {
                hp: enemy.hp,
                maxHp: enemy.maxHp || enemy.hp,
                atk: enemy.atk || 0,
                def: enemy.def || 0,
                isBoss: !!enemy.isBoss,
                img: enemy.img || enemy.imagePath || '',
                name: enemy.name || ''
            };
            S.enemySprite = enemy.sprite || enemy.mesh || null;

            S.vampirismBuff = 0;
            S.vampirismReady = Math.random() < 0.30;
            if (S.vampirismReady) {
                S.vampirismBuff = 30;
                DOM.centerText('ВАМПИРИЗМ!', '#ff6666');
            }

            if (!S.enemy.name && S.ctx.getMobName) S.enemy.name = S.ctx.getMobName(S.enemy.img);

            DOM.showBattleUI(true);
            DOM.updateMobName(S.enemy.name || 'Враг');
            DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);
            DOM.updateArrowCounter(S.arrows);
            if (S.ctx.playSoundHit) S.ctx.playSoundHit();
            FX.updateMobHpBarFor(S.enemySprite, S.camFPS);

            S.battleTimer = setInterval(function () {
                if (!S.active || !S.enemy || !S.playerHitFirst) return;
                if (S.enemyStunned > 0 || S.playerStunned > 0) return;
                Logic._enemyHitsPlayer();
            }, CFG.ENEMY_ATTACK_INTERVAL);

            if (S.ctx.onBattleStart) S.ctx.onBattleStart(S.enemy);
        },

        stop: function () {
            Logic.stopTimer();
            S.active = false;
            S.dead = false;
            S.playerHitFirst = false;
            DOM.showBattleUI(false);
            DOM.hideArrowFlight();
            if (S.ctx.onBattleStop) S.ctx.onBattleStop();
        },

        _kill: function () {
            var enemy = S.enemy;
            var stats = {
                hp: 0,
                maxHp: enemy ? enemy.maxHp : 0,
                atk: enemy ? enemy.atk : 0,
                def: enemy ? enemy.def : 0
            };
            Logic.stopTimer();
            S.active = false;
            S.playerHitFirst = false;
            DOM.showBattleUI(false);
            if (S.ctx.onEnemyKilled) S.ctx.onEnemyKilled(enemy, stats);
        },

        _death: function (reason) {
            if (S.dead) return;
            S.dead = true;
            Logic.stopTimer();
            S.active = false;
            S.playerHitFirst = false;
            DOM.showBattleUI(false);
            if (S.ctx.onDeath) S.ctx.onDeath(reason);
        }
    };

    function init(ctx) {
        S.ctx = ctx || {};
        if (S.ctx.THREE) window.THREE = S.ctx.THREE;
        if (typeof window.THREE === 'undefined') {
            throw new Error('BattleVisuals.init: не найден THREE — передай его в ctx.THREE');
        }
        DOM.ensure();
        if (S.ctx.camFPS) S.camFPS = S.ctx.camFPS;
        if (S.ctx.camFPSOptions) S.camFPSBase = S.ctx.camFPSOptions;
        S.scene = S.ctx.scene || null;
        S.loader = S.ctx.loader || new window.THREE.TextureLoader();
        FX.initScene();
        Logic.loadArrows();
        DOM.updateArrowCounter(S.arrows);
    }

    return {
        CFG: CFG,

        init: init,
        startBattle: Logic.start,
        stopBattle: Logic.stop,
        attack: Logic.attack,
        useSkill: Logic.useSkill,
        update: function (dt) { Logic.update(dt); },

        isActive: function () { return S.active; },
        getEnemy: function () { return S.enemy; },
        getCurrentEnemyStats: function () {
            return S.enemy ? { hp: S.enemy.hp, maxHp: S.enemy.maxHp, atk: S.enemy.atk, def: S.enemy.def } : null;
        },
        getEnemyObj: function () { return S.enemyObj; },

        setupEnemySprite: FX.setupEnemySprite,
        setEnemySprite: function (sprite) {
            S.enemySprite = sprite;
            if (S.enemy) S.enemy.sprite = sprite;
        },

        loadArrows: Logic.loadArrows,
        loadArrowsFromBag: Logic.loadArrowsFromBag,
        returnArrowsToBag: Logic.returnArrowsToBag,
        getArrows: function () { return S.arrows; },

        renderLearnedTalents: DOM.renderSkills,

        showArrowFlight: DOM.arrowFlight,
        hideArrowFlight: DOM.hideArrowFlight,

        onEnemyKilled: null,
        onDeath: null
    };
})();

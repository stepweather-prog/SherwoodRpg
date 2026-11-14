/**
 * battle_visuals.js — ЕДИНАЯ СИСТЕМА БОЯ (логика + визуал + DOM)
 * Дублирует бой из dungeon.html 1-в-1: скверна, стрелы, урон, таланты,
 * скиллы, HP-бар, сферы, кровь, нокбэк, тряска камеры.
 *
 * Подключение:
 *   <script src="battle_visuals.js"></script>
 * Далее:
 *   Sherwood.BattleVisuals.init({ ...ctx });
 */
if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

Sherwood.BattleVisuals = (function () {
    'use strict';

    // ============================================================
    //  КОНФИГ (1-в-1 из dungeon.html)
    // ============================================================
    var CFG = {
        ARROWS_MAX_START: 25,
        ARROWS_NEEDED: 3,
        PLAYER_ATTACK_CD: 1.0,
        FILTH_SELF_RATE: 10,
        FILTH_SELF_AMOUNT: 7,
        FILTH_HIT_AMOUNT: 5,
        FILTH_DEATH_TIME: 20,
        FILTH_DEATH_TICK: 3,
        FILTH_DEATH_DMG: 150
    };

    // ============================================================
    //  СОСТОЯНИЕ
    // ============================================================
    var S = {
        ctx: null,
        scene: null,
        group: null,
        loader: null,

        battleRoom: null,
        bgMesh: null,
        camFPS: null,
        camFPSBase: { y: 0.55, z: 3.6, lookY: 0.45 },
        hitFlashSprite: null,
        bloodTextures: [],

        active: false,
        enemy: null,
        enemySprite: null,
        enemyObj: null,

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
        deathTimer: null,
        domReady: false
    };

    var TALENT_DATA = {
        'stunning': { icon: 'assets/assets2/talents/stunning.png', name: 'Оглушение' },
        'rage':     { icon: 'assets/assets2/talents/Riot.png',     name: 'Ярость' },
        'healing':  { icon: 'assets/assets2/talents/healing.png',  name: 'Лечение' }
    };

    // ============================================================
    //  DOM — создаём/находим все элементы 1-в-1 как в dungeon.html
    // ============================================================
    var DOM = {
        refs: {},

        ensure: function () {
            if (S.domReady) return;
            S.domReady = true;
            var r = this.refs;
            var body = document.body || document.documentElement;

            // --- mob-hp ---
            if (!document.getElementById('mob-hp')) {
                var hp = document.createElement('div');
                hp.id = 'mob-hp';
                hp.innerHTML =
                    '<div id="mob-hp-name">Враг</div>' +
                    '<img class="frame" src="assets/assets2/game_details/life_of_mobs.png" alt="">' +
                    '<img id="mob-hp-fill" class="fill" src="assets/assets2/game_details/mob_life_filling.png" alt="">' +
                    '<span id="mob-hp-text">HP: 1000</span>';
                body.appendChild(hp);
            }
            r.mobHp = document.getElementById('mob-hp');
            r.mobHpName = document.getElementById('mob-hp-name');
            r.mobHpFill = document.getElementById('mob-hp-fill');
            r.mobHpText = document.getElementById('mob-hp-text');

            // --- hit-effect ---
            if (!document.getElementById('hit-effect')) {
                var he = document.createElement('div');
                he.id = 'hit-effect';
                he.innerHTML = '<img id="hit-effect-img" src="" alt="">';
                body.appendChild(he);
            }
            r.hitEffect = document.getElementById('hit-effect');
            r.hitEffectImg = document.getElementById('hit-effect-img');

            // --- battle-controls / attack-icon / skills-row ---
            if (!document.getElementById('battle-controls')) {
                var bc = document.createElement('div');
                bc.id = 'battle-controls';
                bc.innerHTML =
                    '<div id="attack-icon">' +
                        '<img id="attack-icon-img" src="assets/assets2/talents/simple_attack.png">' +
                        '<div id="attack-cooldown-overlay">0.0s</div>' +
                    '</div>' +
                    '<div id="skills-row"></div>';
                body.appendChild(bc);
            }
            r.battleControls = document.getElementById('battle-controls');
            r.attackIcon = document.getElementById('attack-icon');
            r.attackIconImg = document.getElementById('attack-icon-img');
            r.attackCooldownOverlay = document.getElementById('attack-cooldown-overlay');
            r.skillsRow = document.getElementById('skills-row');

            // --- crosshair ---
            if (!document.getElementById('crosshair')) {
                var ch = document.createElement('div');
                ch.id = 'crosshair';
                ch.textContent = '✚';
                body.appendChild(ch);
            }
            r.crosshair = document.getElementById('crosshair');

            // --- blood-overlay ---
            if (!document.getElementById('blood-overlay')) {
                var bo = document.createElement('div');
                bo.id = 'blood-overlay';
                body.appendChild(bo);
            }
            r.bloodOverlay = document.getElementById('blood-overlay');

            // --- arrow-counter ---
            if (!document.getElementById('arrow-counter')) {
                var ac = document.createElement('div');
                ac.id = 'arrow-counter';
                ac.innerHTML = '<img src="assets/interface/sherwood_hollow_arrow.png" alt=""><span id="arrow-count-text">25</span>';
                body.appendChild(ac);
            }
            r.arrowCounter = document.getElementById('arrow-counter');
            r.arrowCountText = document.getElementById('arrow-count-text');

            // --- kill-counter ---
            if (!document.getElementById('kill-counter')) {
                var kc = document.createElement('div');
                kc.id = 'kill-counter';
                kc.innerHTML = '<span id="kill-count-text">Врагов: 0 / 0</span>';
                body.appendChild(kc);
            }
            r.killCounter = document.getElementById('kill-counter');
            r.killCountText = document.getElementById('kill-count-text');

            // --- hero-life ---
            if (!document.getElementById('hero-life')) {
                var hl = document.createElement('div');
                hl.id = 'hero-life';
                hl.innerHTML =
                    '<img src="assets/assets2/game_details/sphere_of_life.png" alt="">' +
                    '<img id="life-fill" src="assets/assets2/game_details/filling_life.png" alt="">' +
                    '<span id="hp-text">HP: 0</span>';
                body.appendChild(hl);
            }
            r.lifeFill = document.getElementById('life-fill');
            r.hpText = document.getElementById('hp-text');

            // --- hero-mana ---
            if (!document.getElementById('hero-mana')) {
                var hm = document.createElement('div');
                hm.id = 'hero-mana';
                hm.innerHTML =
                    '<img src="assets/assets2/game_details/sphere_of_filth.png" alt="">' +
                    '<img id="mana-fill" src="assets/assets2/game_details/filling_with_filth.png" alt="">' +
                    '<span id="mana-text">Скверна: 0%</span>';
                body.appendChild(hm);
            }
            r.manaFill = document.getElementById('mana-fill');
            r.manaText = document.getElementById('mana-text');

            this.injectStyles();

            // клик по кнопке атаки
            if (r.attackIcon && !r.attackIcon._battleBound) {
                r.attackIcon._battleBound = true;
                r.attackIcon.addEventListener('click', function (e) {
                    e.stopPropagation();
                    if (S.active) { Sherwood.BattleVisuals.attack(); return; }
                    if (S.ctx && S.ctx.onAttackButton) S.ctx.onAttackButton();
                });
            }
        },

        injectStyles: function () {
            if (document.getElementById('battle-system-styles')) return;
            var st = document.createElement('style');
            st.id = 'battle-system-styles';
            st.textContent = `
#mob-hp { position:absolute; width:300px; height:200px; z-index:50; left:50%; top:30%; transform:translate(-50%,-50%); display:none; pointer-events:none; }
#mob-hp .frame { position:absolute; top:0; left:0; width:100%; height:100%; object-fit:fill; z-index:2; }
#mob-hp .fill { position:absolute; top:45%; left:10%; width:80%; height:12%; object-fit:cover; clip-path:inset(0 50% 0 0); z-index:1; }
#mob-hp-text { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:20px; font-weight:bold; z-index:3; text-shadow:0 0 6px #000,0 2px 6px #000; }
#mob-hp-name { position:absolute; top:-14px; left:50%; transform:translateX(-50%); color:#ffd27a; font-size:16px; font-weight:bold; text-shadow:0 0 6px #000,0 2px 4px #000; white-space:nowrap; z-index:4; pointer-events:none; }
#crosshair { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#c8a050; font-size:22px; pointer-events:none; z-index:20; text-shadow:0 0 12px #8b6b3a; opacity:0.8; display:none; }
#hit-effect { position:absolute; display:none; pointer-events:none; z-index:60; transform:translate(-50%,-50%); }
#hit-effect-img { width:180px; height:180px; object-fit:contain; filter:drop-shadow(0 0 20px rgba(255,0,0,0.6)); }
#battle-controls { position:absolute; bottom:120px; left:50%; transform:translateX(-50%); display:none; flex-direction:column; align-items:center; gap:15px; z-index:45; }
#attack-icon { position:absolute; bottom:100%; left:50%; transform:translateX(calc(-50% - 20px)); margin-bottom:70px; width:85px; height:85px; cursor:pointer; pointer-events:auto; padding:0; border:none; background:none; flex-shrink:0; display:none; }
#attack-icon img { width:85px; height:85px; object-fit:contain; border-radius:8px; border:3px solid rgba(200,160,80,0.8); background:rgba(0,0,0,0.6); padding:3px; transition:all 0.2s; display:block; box-sizing:border-box; }
#attack-cooldown-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); border-radius:8px; display:none; align-items:center; justify-content:center; color:#ff5555; font-weight:bold; font-size:20px; }
.skill-btn { cursor:pointer; border-radius:8px; border:3px solid rgba(200,160,80,0.8); background:rgba(0,0,0,0.6); padding:3px; width:85px; height:85px; object-fit:contain; transition:all 0.2s; display:block; flex-shrink:0; box-sizing:border-box; }
.skill-btn.on-cooldown { opacity:0.3; filter:grayscale(1); cursor:not-allowed; }
#skills-row { display:none; flex-direction:row; justify-content:center; align-items:center; gap:15px; flex-wrap:nowrap; }
#blood-overlay { position:fixed; top:0; left:0; width:100%; height:100%; z-index:150; pointer-events:none; opacity:0; background-position:center; background-repeat:no-repeat; background-size:cover; transition:opacity 0.1s ease-out; }
#arrow-counter { position:fixed; top:12px; left:50%; transform:translateX(calc(-50% - 70px)); color:#e0c080; font-size:16px; font-weight:bold; text-shadow:0 0 8px #000; z-index:35; pointer-events:none; background:rgba(0,0,0,0.55); padding:4px 14px; border:2px solid #6b5a3a; border-radius:6px; display:flex; align-items:center; gap:6px; }
#arrow-counter img { width:22px; height:22px; object-fit:contain; }
#arrow-counter.low { color:#ff5555; border-color:#ff5555; animation:pulseRed 1s infinite; }
@keyframes pulseRed { 0%,100%{box-shadow:0 0 4px #ff5555;} 50%{box-shadow:0 0 16px #ff5555;} }
#kill-counter { position:fixed; top:12px; left:50%; transform:translateX(calc(-50% + 70px)); color:#ff8080; font-size:16px; font-weight:bold; text-shadow:0 0 8px #000; z-index:35; pointer-events:none; background:rgba(0,0,0,0.55); padding:4px 14px; border:2px solid #6b3a3a; border-radius:6px; display:flex; align-items:center; gap:6px; white-space:nowrap; }
#kill-counter.clear { color:#55ff55; border-color:#55aa55; box-shadow:0 0 10px #55aa55; }
#hero-life { position:absolute; bottom:10px; left:-20px; width:110px; height:110px; z-index:50; }
#hero-life img { position:absolute; top:0; left:0; width:135%; height:135%; object-fit:contain; }
#life-fill { clip-path:inset(0 0 0 0); top:-10px !important; }
#hero-life span { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:16px; font-weight:bold; text-shadow:0 0 4px #000,0 0 8px #000; }
#hero-mana { position:absolute; bottom:10px; right:10px; width:110px; height:110px; z-index:50; }
#hero-mana img { position:absolute; top:0; left:0; width:135%; height:135%; object-fit:contain; }
#mana-fill { clip-path:inset(0 0 0 0); top:-10px !important; }
#hero-mana span { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#fff; font-size:16px; font-weight:bold; text-shadow:0 0 4px #000,0 0 8px #000; }
@media (max-width:900px){
  #hero-life,#hero-mana{width:90px!important;height:90px!important;bottom:6px!important;}
  #hero-life span,#hero-mana span{font-size:13px!important;}
  #mob-hp{width:220px!important;height:150px!important;}
  #mob-hp-text{font-size:15px!important;}
  #mob-hp-name{font-size:13px!important;top:-12px!important;}
  #hit-effect-img{width:130px!important;height:130px!important;}
  #battle-controls{bottom:100px;gap:10px;}
  #attack-icon{width:70px;height:70px;margin-bottom:50px;}
  #attack-icon img{width:70px;height:70px;}
  .skill-btn{width:70px;height:70px;}
  #skills-row{gap:10px;}
  #arrow-counter{transform:translateX(calc(-50% - 55px));font-size:13px!important;padding:3px 10px!important;}
  #kill-counter{transform:translateX(calc(-50% + 55px));font-size:13px!important;padding:3px 10px!important;}
  #arrow-counter img{width:18px!important;height:18px!important;}
}`;
            document.head.appendChild(st);
        },

        showBattleUI: function (on) {
            var r = this.refs;
            if (r.battleControls) r.battleControls.style.display = on ? 'flex' : 'none';
            if (r.attackIcon) r.attackIcon.style.display = on ? 'block' : 'none';
            if (r.skillsRow) r.skillsRow.style.display = on ? 'flex' : 'none';
            if (r.crosshair) r.crosshair.style.display = on ? 'block' : 'none';
            if (r.mobHp) r.mobHp.style.display = on ? 'block' : 'none';
        },

        updateArrowCounter: function (n) {
            var r = this.refs;
            if (r.arrowCountText) r.arrowCountText.textContent = n;
            if (r.arrowCounter) {
                if (n <= 3) r.arrowCounter.classList.add('low');
                else r.arrowCounter.classList.remove('low');
            }
        },

        updateMobHp: function (hp, max) {
            var r = this.refs;
            if (r.mobHpText) r.mobHpText.textContent = 'HP: ' + hp + '/' + max;
            if (r.mobHpFill) r.mobHpFill.style.clipPath = 'inset(0 ' + (100 - (hp / max * 100)) + '% 0 0)';
        },

        updateMobName: function (name) {
            var r = this.refs;
            if (r.mobHpName) r.mobHpName.textContent = name || 'Враг';
        },

        updateHeroSpheres: function (p) {
            var r = this.refs;
            if (!p || !p.stats) return;
            var hpPct = p.stats.hp / p.stats.maxHp;
            if (r.lifeFill) r.lifeFill.style.clipPath = 'inset(' + Math.max(0, (1 - hpPct) * 100) + '% 0 0 0)';
            if (r.hpText) r.hpText.textContent = 'HP: ' + Math.floor(p.stats.hp);

            if (typeof p.stats.filth === 'undefined') p.stats.filth = 0;
            if (typeof p.stats.maxFilth === 'undefined') p.stats.maxFilth = 100;
            var fPct = p.stats.filth / p.stats.maxFilth;
            if (r.manaFill) r.manaFill.style.clipPath = 'inset(' + Math.max(0, (1 - fPct) * 100) + '% 0 0 0)';
            if (r.manaText) {
                if (p.stats.filth >= p.stats.maxFilth) {
                    var left = Math.ceil(CFG.FILTH_DEATH_TIME - (performance.now() / 1000 - S.filthFullSince));
                    if (left < 0) left = 0;
                    r.manaText.textContent = '⚠ ' + left + 'с';
                    r.manaText.style.color = '#ff4444';
                } else {
                    r.manaText.textContent = 'Скверна: ' + Math.floor(p.stats.filth) + '%';
                    r.manaText.style.color = '#fff';
                }
            }
        },

        updateAttackButton: function (cd) {
            var r = this.refs;
            if (!r.attackCooldownOverlay || !r.attackIconImg) return;
            if (cd > 0) {
                r.attackCooldownOverlay.style.display = 'flex';
                r.attackCooldownOverlay.textContent = cd.toFixed(1) + 's';
                r.attackIconImg.style.opacity = '0.4';
            } else {
                r.attackCooldownOverlay.style.display = 'none';
                r.attackIconImg.style.opacity = '1';
            }
        },

        updateKillCounter: function (killed, total) {
            var r = this.refs;
            if (!r.killCountText) return;
            r.killCountText.textContent = 'Врагов: ' + killed + ' / ' + total;
            if (r.killCounter) {
                if (killed >= total && total > 0) r.killCounter.classList.add('clear');
                else r.killCounter.classList.remove('clear');
            }
        },

        showBlood: function () {
            var el = this.refs.bloodOverlay;
            if (!el) return;
            var texs = [
                'assets/assets2/animation/Fine_blood_spray_texture.png',
                'assets/assets2/animation/Fine_blood_spray_texture (1).png',
                'assets/assets2/animation/Fine_blood_spray_texture (2).png'
            ];
            el.style.backgroundImage = 'url("' + texs[Math.floor(Math.random() * texs.length)] + '")';
            el.style.transition = 'opacity 0.1s ease-out';
            el.style.opacity = '1';
            clearTimeout(el._t1); clearTimeout(el._t2);
            el._t1 = setTimeout(function () {
                el.style.transition = 'opacity 0.2s ease-out';
                el.style.opacity = '0';
            }, 200);
            el._t2 = setTimeout(function () { el.style.backgroundImage = ''; }, 200);
        },

        showHitEffect: function (sprite, camera) {
            var el = this.refs.hitEffect;
            var img = this.refs.hitEffectImg;
            if (!el || !img || !sprite || !camera) return;
            var worldPos = new THREE.Vector3();
            sprite.getWorldPosition(worldPos);
            worldPos.x += (Math.random() - 0.5) * 2;
            worldPos.project(camera);
            var x = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
            var y = (-worldPos.y * 0.5 + 0.5) * window.innerHeight;
            el.style.left = (x + (Math.random() < 0.5 ? -120 : 120)) + 'px';
            el.style.top = (y + (Math.random() - 0.5) * 60) + 'px';
            el.style.display = 'block';
            setTimeout(function () { el.style.display = 'none'; }, 200);
        },

        centerText: function (text, color) {
            if (S.ctx && typeof S.ctx.onCenterText === 'function') {
                S.ctx.onCenterText(text, color);
                return;
            }
            // fallback
            var el = document.createElement('div');
            el.textContent = text;
            var fs = window.innerWidth <= 600 ? '22px' : '36px';
            el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);opacity:0;color:' + (color || '#fff') + ';font-size:' + fs + ';font-weight:bold;text-shadow:0 0 12px #000,0 4px 8px #000;pointer-events:none;z-index:200;transition:all 0.9s cubic-bezier(.2,.7,.3,1);font-family:"Times New Roman",serif;letter-spacing:2px;';
            document.body.appendChild(el);
            requestAnimationFrame(function () {
                el.style.opacity = '1';
                el.style.transform = 'translate(-50%,-50%) scale(1.1)';
            });
            setTimeout(function () {
                el.style.opacity = '0';
                el.style.transform = 'translate(-50%,-120%) scale(0.9)';
            }, 900);
            setTimeout(function () { el.remove(); }, 1900);
        }
    };

    // ============================================================
    //  SCENE — battleRoom, bgMesh, camFPS, hitFlashSprite (1-в-1)
    // ============================================================
    var Scene = {
        init: function (threeScene, threeGroup, loader, bgPath) {
            S.scene = threeScene;
            S.group = threeGroup;
            S.loader = loader || new THREE.TextureLoader();

            S.battleRoom = new THREE.Group();
            S.battleRoom.visible = false;
            S.scene.add(S.battleRoom);

            var bgTex = S.loader.load(bgPath || 'assets/assets2/dungeon_details/wall_5.png');
            var bgGeo = new THREE.PlaneGeometry(30, 20);
            var bgMat = new THREE.MeshBasicMaterial({ map: bgTex });
            S.bgMesh = new THREE.Mesh(bgGeo, bgMat);
            S.bgMesh.position.set(0, 0, -8);
            S.battleRoom.add(S.bgMesh);

            var bloodSprites = [
                'assets/assets2/animation/blood_1.png',
                'assets/assets2/animation/blood_2.png',
                'assets/assets2/animation/blood_3.png',
                'assets/assets2/animation/blood_4.png',
                'assets/assets2/animation/blood_5.png'
            ];
            S.bloodTextures = bloodSprites.map(function (p) { return S.loader.load(p); });

            S.hitFlashSprite = new THREE.Sprite(new THREE.SpriteMaterial({
                map: S.bloodTextures[0], transparent: true, opacity: 0.85,
                depthTest: false, depthWrite: false
            }));
            S.hitFlashSprite.scale.set(0.4, 0.4, 1);
            S.hitFlashSprite.visible = false;
            S.scene.add(S.hitFlashSprite);
        },

        setupEnemySprite: function (sprite, isBoss) {
            if (!sprite) return;
            var scale = isBoss ? 2.3 : 2.0;
            sprite.scale.set(scale, scale, 1);
            sprite.center.set(0.5, 0);
            sprite.position.set(0, -0.4, 0);
            if (sprite.material) {
                sprite.material.depthTest = false;
                sprite.material.depthWrite = false;
            }
            sprite.renderOrder = 10;
        },

        enter: function (enemyObj) {
            S.battleRoom.visible = true;
            S.battleRoom.position.set(0, 0, 0);

            if (S.group) S.group.visible = false;
            if (S.ctx.onCameraEnter) {
                try { S.ctx.onCameraEnter(); } catch (e) {}
            } else if (S.camFPS) {
                // fallback: сами переключаем камеру
            }

            var sprite = enemyObj.mesh;
            if (sprite && sprite.parent) sprite.parent.remove(sprite);
            if (sprite) {
                S.battleRoom.add(sprite);
                this.setupEnemySprite(sprite, !!enemyObj.isBoss);
                sprite.visible = true;
                S.enemySprite = sprite;
            }

            if (S.camFPS) {
                S.camFPS.position.set(0, S.camFPSBase.y, S.camFPSBase.z);
                S.camFPS.lookAt(0, S.camFPSBase.lookY, 0);
            }
        },

        exit: function (enemyObj) {
            S.battleRoom.visible = false;

            var sprite = S.enemySprite;
            if (sprite && sprite.parent) sprite.parent.remove(sprite);

            if (enemyObj && enemyObj.mesh) {
                var mesh = enemyObj.mesh;
                mesh.material.depthTest = true;
                mesh.material.depthWrite = false;
                mesh.renderOrder = 0;
                if (S.group) S.group.add(mesh);

                var returnScale = enemyObj.isBoss ? 0.95 : 0.85;
                mesh.scale.set(returnScale, returnScale, 1);
                mesh.center.set(0.5, 0.5);
                if (typeof enemyObj.x === 'number' && typeof enemyObj.y === 'number') {
                    var cellSize = 1, size = S.ctx.mapSize || 16;
                    var cx = Math.floor(size / 2);
                    mesh.position.set(enemyObj.x - cx, returnScale / 2 + 0.1, enemyObj.y - cx);
                }
            }
            S.enemySprite = null;

            if (S.group) S.group.visible = true;
            if (S.ctx.onCameraExit) { try { S.ctx.onCameraExit(); } catch (e) {} }
        },

        updateMobHpBar: function () {
            if (!S.active || !S.enemySprite || !S.camFPS) return;
            var worldPos = new THREE.Vector3();
            S.enemySprite.getWorldPosition(worldPos);
            worldPos.y += (S.enemySprite.scale.y * 0.5) + 0.1;
            worldPos.project(S.camFPS);
            var x = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
            var y = (-worldPos.y * 0.5 + 0.5) * window.innerHeight;
            var el = DOM.refs.mobHp;
            if (el) {
                el.style.left = x + 'px';
                el.style.top = y + 'px';
                el.style.transform = 'translate(-50%, -140%)';
            }
        },

        shake: function (amount) { S.cameraShake = amount; },

        updateShake: function () {
            if (!S.active || !S.camFPS) return;
            var c = S.camFPS;
            c.position.x = (Math.random() - 0.5) * S.cameraShake;
            c.position.z = S.camFPSBase.z + (Math.random() - 0.5) * S.cameraShake;
            c.position.y = S.camFPSBase.y + (Math.random() - 0.5) * S.cameraShake;
            c.lookAt(0, S.camFPSBase.lookY, 0);
            S.cameraShake *= 0.85;
            if (S.cameraShake < 0.001) S.cameraShake = 0;
        },

        knockback: function (sprite, fromX, fromZ) {
            if (!sprite) return;
            S.knockback.active = true;
            S.knockback.sprite = sprite;
            S.knockback.ox = sprite.position.x;
            S.knockback.oz = sprite.position.z;
            var dx = sprite.position.x - fromX, dz = sprite.position.z - fromZ;
            var len = Math.hypot(dx, dz) || 1, power = 0.10;
            S.knockback.dx = (dx / len) * power;
            S.knockback.dz = (dz / len) * power;
            S.knockback.t = 0;
        },

        updateKnockback: function (dt) {
            if (!S.knockback.active || !S.knockback.sprite) return;
            S.knockback.t += dt;
            var k = Math.min(S.knockback.t / S.knockback.dur, 1);
            var ease = Math.sin(k * Math.PI);
            var spr = S.knockback.sprite;
            spr.position.x = S.knockback.ox + S.knockback.dx * ease;
            spr.position.z = S.knockback.oz + S.knockback.dz * ease;
            if (k >= 1) {
                spr.position.x = S.knockback.ox;
                spr.position.z = S.knockback.oz;
                S.knockback.active = false;
                S.knockback.sprite = null;
            }
        },

        showHitFlash: function () {
            if (!S.enemySprite || !S.hitFlashSprite) return;
            var w = S.enemySprite.scale.x, h = S.enemySprite.scale.y;
            var ox = (Math.random() - 0.5) * w * 0.7;
            var oy = (Math.random() - 0.5) * h * 0.7;
            S.hitFlashSprite.position.copy(S.enemySprite.position);
            S.hitFlashSprite.position.x += ox;
            S.hitFlashSprite.position.y += oy;
            S.hitFlashSprite.material.map = S.bloodTextures[Math.floor(Math.random() * S.bloodTextures.length)];
            S.hitFlashSprite.material.needsUpdate = true;
            S.hitFlashSprite.visible = true;
            clearTimeout(S.hitFlashTimer);
            S.hitFlashTimer = setTimeout(function () { S.hitFlashSprite.visible = false; }, 150);
        }
    };

    // ============================================================
    //  LOGIC — скверна, стрелы, урон, таланты, скиллы (1-в-1)
    // ============================================================
    var Logic = {
        getPlayer: function () {
            try { return S.ctx && S.ctx.getPlayer ? S.ctx.getPlayer() : null; } catch (e) { return null; }
        },

        // --- стрелы ---
        loadArrows: function () {
            var p = this.getPlayer(), cnt = 0;
            try { if (p && p.resources && typeof p.resources.arrows === 'number') cnt = p.resources.arrows; } catch (e) {}
            S.arrows = Math.min(CFG.ARROWS_MAX_START, cnt);
            DOM.updateArrowCounter(S.arrows);
            return S.arrows;
        },
        addArrows: function (n) {
            S.arrows += n;
            DOM.updateArrowCounter(S.arrows);
            return S.arrows;
        },
        spendArrowsForAttack: function () {
            var need = CFG.ARROWS_NEEDED;
            if (S.arrows >= need) {
                S.arrows -= need;
                DOM.updateArrowCounter(S.arrows);
                return 1.0;
            }
            if (S.arrows > 0) S.arrows = 0;
            DOM.updateArrowCounter(S.arrows);
            DOM.centerText('НЕТ СТРЕЛ! -50% урона', '#ff5555');
            return 0.5;
        },

        // --- скверна ---
        getFilth: function () {
            var p = this.getPlayer();
            if (!p) return { cur: 0, max: 100 };
            if (typeof p.stats.filth === 'undefined') p.stats.filth = 0;
            if (typeof p.stats.maxFilth === 'undefined') p.stats.maxFilth = 100;
            return { cur: p.stats.filth, max: p.stats.maxFilth };
        },
        setFilth: function (v) {
            var p = this.getPlayer();
            if (!p) return;
            if (!p.stats.maxFilth) p.stats.maxFilth = 100;
            p.stats.filth = Math.max(0, Math.min(p.stats.maxFilth, v));
            if (p.stats.filth >= p.stats.maxFilth) {
                if (S.filthFullSince === 0) S.filthFullSince = performance.now() / 1000;
            } else {
                S.filthFullSince = 0;
                S.filthDamageTimer = 0;
            }
            DOM.updateHeroSpheres(p);
        },
        addFilth: function (amount) { var f = this.getFilth(); this.setFilth(f.cur + amount); },
        spendFilth: function (amount) {
            var f = this.getFilth();
            if (f.cur < amount) return false;
            this.setFilth(f.cur - amount);
            return true;
        },

        // --- тик (в animate) ---
        update: function (dt) {
            if (S.playerAttackCooldown > 0) S.playerAttackCooldown = Math.max(0, S.playerAttackCooldown - dt);
            if (S.playerStunned > 0) S.playerStunned = Math.max(0, S.playerStunned - dt);
            if (S.enemyStunned > 0) S.enemyStunned = Math.max(0, S.enemyStunned - dt);
            if (S.vampirismBuff > 0) S.vampirismBuff = Math.max(0, S.vampirismBuff - dt);

            var p = this.getPlayer();
            if (!p) return;
            if (typeof p.stats.filth === 'undefined') p.stats.filth = 0;
            if (typeof p.stats.maxFilth === 'undefined') p.stats.maxFilth = 100;

            S.filthTimer += dt;
            if (S.filthTimer >= CFG.FILTH_SELF_RATE) {
                S.filthTimer -= CFG.FILTH_SELF_RATE;
                if (p.stats.filth < p.stats.maxFilth) {
                    p.stats.filth = Math.min(p.stats.maxFilth, p.stats.filth + CFG.FILTH_SELF_AMOUNT);
                    DOM.updateHeroSpheres(p);
                }
            }

            if (p.stats.filth >= p.stats.maxFilth) {
                if (S.filthFullSince === 0) S.filthFullSince = performance.now() / 1000;
                if (performance.now() / 1000 - S.filthFullSince >= CFG.FILTH_DEATH_TIME) {
                    S.filthDamageTimer += dt;
                    if (S.filthDamageTimer >= CFG.FILTH_DEATH_TICK) {
                        S.filthDamageTimer -= CFG.FILTH_DEATH_TICK;
                        p.stats.hp = Math.max(0, p.stats.hp - CFG.FILTH_DEATH_DMG);
                        DOM.showBlood();
                        DOM.centerText('-' + CFG.FILTH_DEATH_DMG + ' HP (скверна)', '#ff2020');
                        DOM.updateHeroSpheres(p);
                        if (p.stats.hp <= 0) {
                            S.filthFullSince = 0;
                            S.filthDamageTimer = 0;
                            this._death('filth');
                            return;
                        }
                    }
                }
            } else {
                S.filthFullSince = 0;
                S.filthDamageTimer = 0;
            }

            DOM.updateAttackButton(S.playerAttackCooldown);
            if (S.active) DOM.updateHeroSpheres(p);
        },

        // --- старт / стоп ---
        start: function (enemyObj) {
            if (S.active) return;
            S.active = true;
            S.playerHitFirst = false;
            S.enemy = {
                hp: enemyObj.hp, maxHp: enemyObj.maxHp,
                atk: enemyObj.atk, def: enemyObj.def,
                isBoss: !!enemyObj.isBoss, img: enemyObj.img,
                x: enemyObj.x, y: enemyObj.y, objRef: enemyObj
            };
            S.enemyObj = enemyObj;
            S.enemyStunned = 0;
            S.vampirismReady = false;

            // вампиризм
            var p = this.getPlayer();
            if (p && p.talents && p.talents['vampirism'] > 0) {
                if (Math.random() < 0.30) {
                    S.vampirismReady = true;
                    S.vampirismBuff = 20;
                    DOM.centerText('ВАМПИРИЗМ!', '#a020f0');
                }
            }

            // камера, UI
            Scene.enter(enemyObj);
            DOM.showBattleUI(true);
            var name = 'Враг';
            if (S.ctx.getMobName) { try { name = S.ctx.getMobName(enemyObj.img); } catch (e) {} }
            DOM.updateMobName(name);
            DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);
            if (S.ctx.playSoundHit) { try { S.ctx.playSoundHit(); } catch (e) {} }
            Scene.updateMobHpBar();

            // автоатака врага
            var self = this;
            if (S.battleTimer) clearInterval(S.battleTimer);
            S.battleTimer = setInterval(function () { self._enemyAutoAttack(); }, 1000);

            if (S.ctx.onBattleStart) { try { S.ctx.onBattleStart(enemyObj); } catch (e) {} }
        },

        stop: function () {
            S.active = false;
            S.playerHitFirst = false;
            S.enemyStunned = 0;
            S.playerAttackCooldown = 0;
            if (S.battleTimer) { clearInterval(S.battleTimer); S.battleTimer = null; }

            var enemyObj = S.enemyObj;
            S.enemy = null;
            S.enemyObj = null;

            DOM.showBattleUI(false);
            Scene.exit(enemyObj);

            if (S.ctx.onBattleStop) { try { S.ctx.onBattleStop(enemyObj); } catch (e) {} }
        },

        // --- удар игрока ---
        attack: function () {
            if (!S.active || !S.enemy) return;
            if (S.playerStunned > 0) { DOM.centerText('ОГЛУШЁН!', '#888'); return; }
            if (S.playerAttackCooldown > 0) return;
            S.playerAttackCooldown = CFG.PLAYER_ATTACK_CD;
            S.playerHitFirst = true;

            var p = this.getPlayer();
            if (!p) return;

            if (S.ctx.playSoundHit) { try { S.ctx.playSoundHit(); } catch (e) {} }

            var arrowMult = this.spendArrowsForAttack();

            var baseDmg = Math.max(50,
                Math.floor(p.stats.attack * 1.5) -
                Math.floor(S.enemy.def * 0.5) +
                Math.floor(Math.random() * 20)
            );
            if (arrowMult < 1) baseDmg = Math.floor(baseDmg * arrowMult);
            if (p.talents && p.talents['ignore']) baseDmg += Math.floor(baseDmg * p.talents['ignore'] * 0.05);
            if (S.rageCharges > 0) {
                baseDmg = Math.floor(baseDmg * 1.2);
                S.rageCharges--;
                if (S.rageCharges <= 0) DOM.centerText('Ярость кончилась', '#888');
            }

            var dmg = baseDmg;
            S.enemy.hp = Math.max(0, S.enemy.hp - dmg);
            if (S.enemyObj) S.enemyObj.hp = S.enemy.hp;

            if (S.vampirismReady && S.vampirismBuff > 0 && p.talents && p.talents['vampirism'] > 0) {
                var vampPercent = Math.min(50, 5 + (p.talents['vampirism'] - 1) * 5) / 100;
                var heal = Math.floor(dmg * vampPercent);
                if (heal > 0) {
                    p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
                    DOM.updateHeroSpheres(p);
                }
            }

            DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);

            if (S.enemySprite) {
                Scene.showHitFlash();
                Scene.knockback(S.enemySprite, 0, 0);
                Scene.shake(0.06);
            }

            if (S.enemy.hp <= 0) { this._enemyKilled(); return; }

            if (S.enemyStunned > 0) return;
            this._enemyHitsPlayer();
        },

        _enemyAutoAttack: function () {
            if (!S.active || !S.enemy || !S.playerHitFirst) return;
            if (S.enemyStunned > 0 || S.playerStunned > 0) return;
            this._enemyHitsPlayer();
        },

        _enemyHitsPlayer: function () {
            var p = this.getPlayer();
            if (!p || !S.enemy) return;

            var edmg = Math.max(5, Math.floor(S.enemy.atk * 0.5));
            if (p.talents) {
                if (p.talents['blocking']) edmg = Math.floor(edmg * (1 - 0.1 * p.talents['blocking']));
                if (p.talents['numbness']) edmg = Math.floor(edmg * (1 - 0.08 * p.talents['numbness']));
            }

            if (p.talents && p.talents['ricochet'] > 0 && Math.random() < 0.45) {
                S.enemy.hp = Math.max(0, S.enemy.hp - edmg);
                if (S.enemyObj) S.enemyObj.hp = S.enemy.hp;
                DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);
                DOM.centerText('РИКОШЕТ!', '#a020f0');
                if (S.enemy.hp <= 0) { this._enemyKilled(); }
                return;
            }

            p.stats.hp = Math.max(0, p.stats.hp - edmg);
            this.addFilth(CFG.FILTH_HIT_AMOUNT);
            DOM.updateHeroSpheres(p);
            DOM.showBlood();
            if (S.ctx.onHpChanged) { try { S.ctx.onHpChanged(); } catch (e) {} }

            if (p.stats.hp <= 0) { this._death('enemy'); }
        },

        // --- скиллы ---
        useSkill: function (skillId) {
            if (!S.active || !S.enemy) return;
            if (S.skillCooldowns[skillId] && Date.now() < S.skillCooldowns[skillId]) return;
            var p = this.getPlayer();
            if (!p) return;

            var lvl = 0;
            try { if (S.ctx.Talents && S.ctx.Talents.getTalentLevel) lvl = S.ctx.Talents.getTalentLevel(skillId); } catch (e) {}
            if (lvl <= 0) { DOM.centerText('Скилл не изучен!', '#ff5555'); return; }

            var cdMs = 10000;
            if (skillId === 'stunning') {
                if (!this.spendFilth(20)) { DOM.centerText('Мало скверны!', '#ff5555'); return; }
                S.enemyStunned = 10;
                DOM.centerText('ОГЛУШЕНИЕ!', '#ffd700');
                cdMs = 20000;
            } else if (skillId === 'rage') {
                var f = this.getFilth();
                if (f.cur < f.max) { DOM.centerText('Нужна полная скверна!', '#ff5555'); return; }
                if (!this.spendFilth(65)) return;
                S.rageCharges = 3;
                DOM.centerText('ЯРОСТЬ!', '#ff4400');
                cdMs = 25000;
            } else if (skillId === 'healing') {
                if (!this.spendFilth(5 * lvl)) { DOM.centerText('Мало скверны!', '#ff5555'); return; }
                var heal = 10 * lvl;
                p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
                DOM.centerText('+' + heal + ' HP', '#4caf50');
                DOM.updateHeroSpheres(p);
                cdMs = 8000;
            }

            S.skillCooldowns[skillId] = Date.now() + cdMs;
            var icon = document.querySelector('img[data-skill-id="' + skillId + '"]');
            if (icon) {
                icon.classList.add('on-cooldown');
                setTimeout(function () { icon.classList.remove('on-cooldown'); }, cdMs);
            }
            if (S.ctx.playSoundAltar) { try { S.ctx.playSoundAltar(); } catch (e) {} }
        },

        // --- смерть врага ---
        _enemyKilled: function () {
            if (!S.active) return;
            var killed = S.enemyObj;
            S.active = false;
            S.playerHitFirst = false;
            S.enemyStunned = 0;
            if (S.battleTimer) { clearInterval(S.battleTimer); S.battleTimer = null; }

            var killedSnapshot = S.enemy;
            S.enemy = null;
            S.enemyObj = null;

            DOM.showBattleUI(false);
            Scene.exit(killed);

            if (S.ctx.onEnemyKilled) {
                try { S.ctx.onEnemyKilled(killed, killedSnapshot); } catch (e) {}
            }
        },

        _death: function (reason) {
            if (S.battleTimer) { clearInterval(S.battleTimer); S.battleTimer = null; }
            S.active = false;
            var enemyObj = S.enemyObj;
            S.enemy = null;
            S.enemyObj = null;
            DOM.showBattleUI(false);
            Scene.exit(enemyObj);
            if (S.ctx.onDeath) { try { S.ctx.onDeath(reason); } catch (e) {} }
        },

        // --- таланты (кнопки скиллов) ---
        renderLearnedTalents: function () {
            var row = DOM.refs.skillsRow;
            if (!row) return;
            var p = this.getPlayer();
            if (!p) return;
            if (!p.talents) p.talents = {};
            row.innerHTML = '';
            for (var id in TALENT_DATA) {
                var lvl = 0;
                try { if (S.ctx.Talents && S.ctx.Talents.getTalentLevel) lvl = S.ctx.Talents.getTalentLevel(id); } catch (e) {}
                if (lvl > 0) {
                    var img = document.createElement('img');
                    img.src = TALENT_DATA[id].icon;
                    img.className = 'skill-btn';
                    img.dataset.skillId = id;
                    img.onclick = (function (sid) {
                        return function () { Sherwood.BattleVisuals.useSkill(sid); };
                    })(id);
                    row.appendChild(img);
                }
            }
        }
    };

    // ============================================================
    //  ПУБЛИЧНЫЙ API
    // ============================================================
    return {
        CFG: CFG,

        init: function (ctx) {
            S.ctx = ctx || {};
            DOM.ensure();

            if (ctx.camFPS) {
                S.camFPS = ctx.camFPS;
                if (ctx.camFPSOptions) {
                    if (typeof ctx.camFPSOptions.y === 'number') S.camFPSBase.y = ctx.camFPSOptions.y;
                    if (typeof ctx.camFPSOptions.z === 'number') S.camFPSBase.z = ctx.camFPSOptions.z;
                    if (typeof ctx.camFPSOptions.lookY === 'number') S.camFPSBase.lookY = ctx.camFPSOptions.lookY;
                }
            }

            if (ctx.scene) Scene.init(ctx.scene, ctx.group, ctx.loader, ctx.bgPath);
            Logic.loadArrows();
            console.log('⚔️ BattleVisuals инициализирован');
        },

        // --- бой ---
        start: function (enemyObj) { Logic.start(enemyObj); },
        stop: function () { Logic.stop(); },
        attack: function () { Logic.attack(); },
        useSkill: function (id) { Logic.useSkill(id); },
        isActive: function () { return S.active; },
        getEnemy: function () { return S.enemy; },
        getEnemyObj: function () { return S.enemyObj; },

        // --- тик ---
        update: function (dt) {
            Logic.update(dt);
            if (S.active) {
                Scene.updateShake();
                Scene.updateMobHpBar();
            }
            Scene.updateKnockback(dt);
        },

        // --- стрелы ---
        getArrows: function () { return S.arrows; },
        addArrows: function (n) { return Logic.addArrows(n); },
        loadArrowsFromBag: function () { return Logic.loadArrows(); },
        updateArrowCounter: function () { DOM.updateArrowCounter(S.arrows); },

        // --- скверна ---
        getFilth: function () { return Logic.getFilth(); },
        setFilth: function (v) { Logic.setFilth(v); },
        addFilth: function (n) { Logic.addFilth(n); },
        spendFilth: function (n) { return Logic.spendFilth(n); },
        updateHeroSpheres: function () { DOM.updateHeroSpheres(Logic.getPlayer()); },

        // --- таланты ---
        renderLearnedTalents: function () { Logic.renderLearnedTalents(); },

        // --- счётчик убийств ---
        updateKillCounter: function (killed, total) { DOM.updateKillCounter(killed, total); },

        // --- утилиты ---
        showBloodOverlay: function () { DOM.showBlood(); },
        showCenterText: function (t, c) { DOM.centerText(t, c); },
        showHitEffect: function (sprite, cam) { DOM.showHitEffect(sprite, cam); },

        // --- геттеры состояния ---
        isBattleActive: function () { return S.active; },
        getCurrentEnemyStats: function () { return S.enemy; },
        getPlayerArrows: function () { return S.arrows; },
        getPlayerAttackCooldown: function () { return S.playerAttackCooldown; },
        getPlayerStunned: function () { return S.playerStunned; },
        getEnemyStunned: function () { return S.enemyStunned; }
    };
})();

console.log('⚔️ BattleVisuals (единый бой: логика + визуал) загружен!');

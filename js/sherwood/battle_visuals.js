/**
 * battle_visuals.js — ЕДИНАЯ БОЕВАЯ СИСТЕМА */
if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

Sherwood.BattleVisuals = (function () {
    'use strict';

    var CFG = {
        ARROWS_MAX_START: 25,
        ARROWS_NEEDED: 3,
        PLAYER_ATTACK_CD: 1.0,
        FILTH_SELF_RATE: 10,
        FILTH_SELF_AMOUNT: 7,
        FILTH_HIT_AMOUNT: 5,
        FILTH_DEATH_TIME: 20,
        FILTH_DEATH_TICK: 3,
        FILTH_DEATH_DMG: 150,
        ENEMY_ATTACK_INTERVAL: 1000,
        CAMERA_SHAKE: 0.06
    };

    var S = {
        ctx: {},
        scene: null,
        camFPS: null,
        camFPSBase: { y: 0.55, z: 3.6, lookY: 0.45 },
        loader: null,
        hitFlashSprite: null,
        bloodTextures: [],

        active: false,
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
        'rage':     { icon: 'assets/assets2/talents/Riot.png',     name: 'Ярость',     filthCost: 65, charges: 3, cooldown: 25000 },
        'healing':  { icon: 'assets/assets2/talents/healing.png',  name: 'Лечение',  filthPerLvl: 5, healPerLvl: 10, cooldown: 8000 }
    };

    var HIT_SPRITES = [
        'strike_claws.png', 'strike_claws_1.png', 'strike_claws_2.png',
        'strike_claws_4.png', 'strike_claws_5.png', 'strike_claws_6.png'
    ];

        var FX_DIR = 'assets/assets2/animation/';
    var HIT_EFFECT_IMG = FX_DIR + 'strike_claws.png';
    var BLOOD_OVERLAYS = [
        FX_DIR + 'Fine_blood_spray_texture.png',
        FX_DIR + 'Fine_blood_spray_texture (1).png',
        FX_DIR + 'Fine_blood_spray_texture (2).png'
    ];

    var DOM = {
        els: {},

        find: function (id) { return document.getElementById(id); },

        findOrCreate: function (id, make) {
            var el = document.getElementById(id);
            if (!el) {
                el = make();
                el.id = id;
                document.body.appendChild(el);
            }
            this.els[id] = el;
            return el;
        },

        ensure: function () {
            this.findOrCreate('mob-hp', function () {
                var d = document.createElement('div');
                d.style.cssText = 'position:absolute;width:300px;height:200px;z-index:50;left:50%;top:30%;transform:translate(-50%,-50%);display:none;pointer-events:none;';
                d.innerHTML = '<div id="mob-hp-name" style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);color:#ffd27a;font-size:16px;font-weight:bold;text-shadow:0 0 6px #000,0 2px 4px #000;white-space:nowrap;z-index:4;pointer-events:none;">Враг</div>' +
                    '<img class="frame" src="assets/assets2/game_details/life_of_mobs.png" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:fill;z-index:2;" alt="">' +
                    '<img id="mob-hp-fill" class="fill" src="assets/assets2/game_details/mob_life_filling.png" style="position:absolute;top:45%;left:10%;width:80%;height:12%;object-fit:cover;clip-path:inset(0 50% 0 0);z-index:1;" alt="">' +
                    '<span id="mob-hp-text" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:20px;font-weight:bold;z-index:3;text-shadow:0 0 6px #000,0 2px 6px #000;">HP: 0/0</span>';
                return d;
            });
            this.findOrCreate('hit-effect', function () {
                var d = document.createElement('div');
                d.style.cssText = 'position:absolute;display:none;pointer-events:none;z-index:60;transform:translate(-50%,-50%);';
                d.innerHTML = '<img id="hit-effect-img" src="" style="width:180px;height:180px;object-fit:contain;filter:drop-shadow(0 0 20px rgba(255,0,0,0.6));" alt="">';
                return d;
            });
            this.findOrCreate('blood-overlay', function () {
                var d = document.createElement('div');
                d.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:150;pointer-events:none;opacity:0;background-position:center center;background-repeat:no-repeat;background-size:cover;transition:opacity 0.1s ease-out;';
                return d;
            });
            this.findOrCreate('skills-row', function () {
                var d = document.createElement('div');
                d.style.cssText = 'display:none;flex-direction:row;justify-content:center;align-items:center;gap:15px;flex-wrap:nowrap;';
                return d;
            });
            this.findOrCreate('arrow-counter', function () {
                var d = document.createElement('div');
                d.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(calc(-50% - 70px));color:#e0c080;font-size:16px;font-weight:bold;text-shadow:0 0 8px #000;z-index:35;pointer-events:none;background:rgba(0,0,0,0.55);padding:4px 14px;border:2px solid #6b5a3a;border-radius:6px;display:flex;align-items:center;gap:6px;';
                d.innerHTML = '<img src="assets/interface/sherwood_hollow_arrow.png" style="width:22px;height:22px;object-fit:contain;" alt=""><span id="arrow-count-text">25</span>';
                return d;
            });
            this.findOrCreate('kill-counter', function () {
                var d = document.createElement('div');
                d.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(calc(-50% + 70px));color:#ff8080;font-size:16px;font-weight:bold;text-shadow:0 0 8px #000;z-index:35;pointer-events:none;background:rgba(0,0,0,0.55);padding:4px 14px;border:2px solid #6b3a3a;border-radius:6px;display:flex;align-items:center;gap:6px;white-space:nowrap;';
                d.innerHTML = '<span id="kill-count-text"></span>';
                return d;
            });
            this.injectStyles();
            S.domReady = true;
        },

        injectStyles: function () {
            if (document.getElementById('battle-system-styles')) return;
            var css = [
                '.skill-btn { cursor:pointer;border-radius:8px;border:3px solid rgba(200,160,80,0.8);background:rgba(0,0,0,0.6);padding:3px;width:85px;height:85px;object-fit:contain;transition:all 0.2s;display:block;flex-shrink:0;box-sizing:border-box; }',
                '.skill-btn.on-cooldown { opacity:0.3;filter:grayscale(1);cursor:not-allowed; }',
                '@keyframes bvCenterFade { 0% { opacity:0; transform:translate(-50%,-50%) scale(0.6); } 15% { opacity:1; transform:translate(-50%,-50%) scale(1.15); } 30% { transform:translate(-50%,-50%) scale(1); } 80% { opacity:1; } 100% { opacity:0; transform:translate(-50%,-80%) scale(1); } }',
                '.bv-center-text { position:fixed;top:38%;left:50%;transform:translate(-50%,-50%);z-index:9000;pointer-events:none;font-family:Georgia,serif;font-size:2.2em;font-weight:bold;text-shadow:0 0 12px #000,0 2px 6px #000;animation:bvCenterFade 1.4s ease-out forwards;white-space:nowrap; }'
            ].join('\n');
            var st = document.createElement('style');
            st.id = 'battle-system-styles';
            st.textContent = css;
            document.head.appendChild(st);
        },

        showBattleUI: function (on) {
            var bc = this.find('battle-controls');
            var ai = this.find('attack-icon');
            var sr = this.find('skills-row');
            if (bc) bc.style.display = on ? 'flex' : 'none';
            if (ai) ai.style.display = on ? 'block' : 'none';
            if (sr) sr.style.display = on ? 'flex' : 'none';
            if (this.els['mob-hp']) this.els['mob-hp'].style.display = on ? 'block' : 'none';
        },

        updateArrowCounter: function (n) {
            var box = this.find('arrow-counter');
            var txt = this.find('arrow-count-text');
            if (txt) txt.textContent = n;
            else if (box) box.textContent = 'Стрелы: ' + n;
            if (box) {
                if (n <= 3) box.classList.add('low');
                else box.classList.remove('low');
            }
        },

        updateMobHp: function (hp, maxHp) {
            if (!maxHp) maxHp = 1;
            var pct = Math.max(0, Math.min(1, hp / maxHp));
            var fill = this.find('mob-hp-fill');
            if (fill) fill.style.clipPath = 'inset(0 ' + (1 - pct) * 100 + '% 0 0)';
            var txt = this.find('mob-hp-text');
            if (txt) txt.textContent = 'HP: ' + Math.max(0, Math.floor(hp)) + '/' + maxHp;
        },

        updateMobName: function (name) {
            var el = this.find('mob-hp-name');
            if (el) el.textContent = name || 'Враг';
        },

        updateHeroSpheres: function (p) {
            if (!p || !p.stats) return;
            var hpPct = Math.max(0, Math.min(1, p.stats.hp / (p.stats.maxHp || 1)));
            var lifeFill = this.find('life-fill');
            if (lifeFill) lifeFill.style.clipPath = 'inset(' + Math.max(0, (1 - hpPct) * 100) + '% 0 0 0)';
            var hpText = this.find('hp-text');
            if (hpText) hpText.textContent = 'HP: ' + Math.floor(p.stats.hp);
            var filth = (typeof p.stats.filth === 'number') ? p.stats.filth : 0;
            var maxFilth = p.stats.maxFilth || 100;
            var fPct = Math.max(0, Math.min(1, filth / maxFilth));
            var manaFill = this.find('mana-fill');
            if (manaFill) manaFill.style.clipPath = 'inset(' + Math.max(0, (1 - fPct) * 100) + '% 0 0 0)';
            var manaText = this.find('mana-text');
            if (manaText) {
                var label = 'Скверна: ' + Math.floor(fPct * 100) + '%';
                if (fPct >= 1) {
                    var left = Math.max(0, Math.ceil(CFG.FILTH_DEATH_TIME - S.filthFullSince));
                    label = '⚠ СКВЕРНА! ' + left + 'с';
                }
                manaText.textContent = label;
            }
        },

        updateAttackButton: function (cd) {
            var ov = this.find('attack-cooldown-overlay');
            var icon = this.find('attack-icon');
            if (!ov) return;
            if (cd > 0) {
                ov.style.display = 'flex';
                ov.textContent = cd.toFixed(1) + 's';
                if (icon) icon.style.pointerEvents = 'none';
            } else {
                ov.style.display = 'none';
                if (icon) icon.style.pointerEvents = 'auto';
            }
        },

        updateKillCounter: function (killed, total) {
            var box = this.find('kill-counter');
            var txt = this.find('kill-count-text');
            var label = killed + ' / ' + total;
            if (txt) txt.textContent = label;
            else if (box) box.textContent = label;
            if (box) {
                if (total > 0 && killed >= total) box.classList.add('clear');
                else box.classList.remove('clear');
            }
        },

        showBlood: function () {
            var el = this.find('blood-overlay');
            if (!el) return;
            el.style.backgroundImage = 'url(' + BLOOD_OVERLAYS[Math.floor(Math.random() * BLOOD_OVERLAYS.length)] + ')';
            el.style.opacity = '1';
            clearTimeout(this._bloodT);
            this._bloodT = setTimeout(function () { el.style.opacity = '0'; }, 200);
        },

        showHitEffect: function (sprite, camera) {
            var box = this.find('hit-effect');
            var img = this.find('hit-effect-img');
            if (!box || !img || !sprite || !camera) return;
            img.src = HIT_EFFECT_IMG;
            var worldPos = sprite.position.clone();
            worldPos.y += sprite.scale.y * 0.5;
            worldPos.project(camera);
            var x = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
            var y = (-worldPos.y * 0.5 + 0.5) * window.innerHeight;
            x += (Math.random() - 0.5) * 240;
            box.style.left = x + 'px';
            box.style.top = y + 'px';
            box.style.display = 'block';
            clearTimeout(this._hitT);
            this._hitT = setTimeout(function () { box.style.display = 'none'; }, 200);
        },

        centerText: function (text, color) {
            if (S.ctx && S.ctx.onCenterText) { S.ctx.onCenterText(text, color); return; }
            var el = document.createElement('div');
            el.className = 'bv-center-text';
            el.style.color = color || '#fff';
            el.textContent = text;
            document.body.appendChild(el);
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1500);
        }
    };

    var FX = {
        initScene: function () {
            var T = window.THREE;
            if (!S.scene || !T) return;
            S.bloodTextures = [];
            for (var i = 0; i < HIT_SPRITES.length; i++) {
                try { S.bloodTextures.push(S.loader.load(FX_DIR + HIT_SPRITES[i])); } catch (e) {}
            }
            var mat = new T.SpriteMaterial({
                map: S.bloodTextures[0] || null,
                transparent: true,
                opacity: 0.85,
                depthTest: false,
                depthWrite: false
            });
            S.hitFlashSprite = new T.Sprite(mat);
            S.hitFlashSprite.scale.set(0.4, 0.4, 1);
            S.hitFlashSprite.visible = false;
            S.hitFlashSprite.renderOrder = 20;
            S.scene.add(S.hitFlashSprite);
        },

        setupEnemySprite: function (sprite, isBoss) {
            if (!sprite) return;
            var scale = isBoss ? 2.3 : 2.0;
            sprite.scale.set(scale, scale, 1);
            if (sprite.material) {
                sprite.material.depthTest = false;
                sprite.material.depthWrite = false;
            }
            if (!sprite.center) sprite.center = new window.THREE.Vector2(0.5, 0.5);
            sprite.center.set(0.5, 0);
            sprite.position.set(0, -0.4, 0);
            sprite.renderOrder = 10;
            S.enemySprite = sprite;
        },

        hitFlash: function (sprite) {
            if (!S.hitFlashSprite || !sprite) return;
            var spriteW = sprite.scale.x, spriteH = sprite.scale.y;
            var ox = (Math.random() - 0.5) * spriteW * 0.7;
            var oy = (Math.random() - 0.5) * spriteH * 0.7;
            S.hitFlashSprite.position.copy(sprite.position);
            S.hitFlashSprite.position.x += ox;
            S.hitFlashSprite.position.y += oy + (spriteH / 2);
            if (S.bloodTextures.length) {
                S.hitFlashSprite.material.map = S.bloodTextures[Math.floor(Math.random() * S.bloodTextures.length)];
                S.hitFlashSprite.material.needsUpdate = true;
            }
            S.hitFlashSprite.material.rotation = Math.random() * Math.PI * 2;
            S.hitFlashSprite.visible = true;
            clearTimeout(S.hitFlashTimer);
            S.hitFlashTimer = setTimeout(function () { S.hitFlashSprite.visible = false; }, 150);
        },

        shake: function (amount) {
            if (!S.camFPS) return;
            var o = S.camFPSBase || {};
            S.camBase = {
                x: 0,
                y: (o.y !== undefined) ? o.y : 0.55,
                z: (o.z !== undefined) ? o.z : 3.6,
                lookY: (o.lookY !== undefined) ? o.lookY : 0.45
            };
            S.cameraShake = amount;
        },

        updateShake: function () {
            if (!S.camFPS || !S.camBase) return;
            if (S.active && S.cameraShake > 0) {
                S.camFPS.position.x = S.camBase.x + (Math.random() - 0.5) * S.cameraShake;
                S.camFPS.position.y = S.camBase.y + (Math.random() - 0.5) * S.cameraShake;
                S.camFPS.position.z = S.camBase.z + (Math.random() - 0.5) * S.cameraShake;
                S.camFPS.lookAt(0, S.camBase.lookY, 0);
                S.cameraShake *= 0.85;
            } else if (S.cameraShake !== 0) {
                S.cameraShake = 0;
                S.camFPS.position.set(S.camBase.x, S.camBase.y, S.camBase.z);
                S.camFPS.lookAt(0, S.camBase.lookY, 0);
            }
        },

        knockback: function (sprite, fromX, fromZ) {
            if (!sprite) return;
            S.knockback.active = true;
            S.knockback.t = 0;
            S.knockback.ox = sprite.position.x;
            S.knockback.oz = sprite.position.z;
            S.knockback.dx = 0;
            S.knockback.dz = 0.10;
            S.knockback.dur = 0.25;
            S.knockback.sprite = sprite;
        },

        updateKnockback: function (dt) {
            var k = S.knockback;
            if (!k.active || !k.sprite) return;
            k.t += dt;
            var kk = Math.min(k.t / k.dur, 1);
            var ease = Math.sin(kk * Math.PI);
            k.sprite.position.x = k.ox + k.dx * ease;
            k.sprite.position.z = k.oz + k.dz * ease;
            if (kk >= 1) {
                k.sprite.position.x = k.ox;
                k.sprite.position.z = k.oz;
                k.active = false;
            }
        },

        updateMobHpBar: function (sprite, camera) {
            if (!S.active || !S.enemy) return;
            var sp = sprite || S.enemySprite;
            var cam = camera || S.camFPS;
            this.updateMobHpBarFor(sp, cam);
        },

        updateMobHpBarFor: function (sprite, camera) {
            if (!sprite || !camera) return;
            var el = document.getElementById('mob-hp');
            if (!el) return;
            var worldPos = sprite.position.clone();
            worldPos.y += (sprite.scale.y / 2) + 0.1;
            worldPos.project(camera);
            var x = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
            var y = (-worldPos.y * 0.5 + 0.5) * window.innerHeight;
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.transform = 'translate(-50%, -140%)';
        }
    };

    var Logic = {
        getPlayer: function () {
            try { if (S.ctx && S.ctx.getPlayer) return S.ctx.getPlayer(); } catch (e) {}
            return null;
        },

        getMobName: function (img) {
            if (S.enemy && S.enemy.img === img && S.enemy.name) return S.enemy.name;
            if (S.ctx && S.ctx.getMobName) {
                try { return S.ctx.getMobName(img); } catch (e) {}
            }
            if (!img) return 'Враг';
            return img.split('/').pop().replace('.png', '');
        },

        _syncEnemyHp: function () {
            if (S.ctx && S.ctx.onEnemyHpChanged && S.enemy) {
                try { S.ctx.onEnemyHpChanged(S.enemy.hp); } catch (e) {}
            }
        },

        // ===== СТРЕЛЫ =====
        loadArrows: function () {
            var p = Logic.getPlayer();
            if (p && p.resources && typeof p.resources.arrows === 'number') {
                S.arrows = Math.min(p.resources.arrows, CFG.ARROWS_MAX_START);
            }
            DOM.updateArrowCounter(S.arrows);
        },

        addArrows: function (n) {
            S.arrows = Math.max(0, S.arrows + n);
            DOM.updateArrowCounter(S.arrows);
        },

        returnArrowsToBag: function () {
            var p = Logic.getPlayer();
            if (p && p.resources) p.resources.arrows = S.arrows;
        },

        spendArrowsForAttack: function () {
            if (S.arrows >= CFG.ARROWS_NEEDED) {
                S.arrows -= CFG.ARROWS_NEEDED;
                DOM.updateArrowCounter(S.arrows);
                return 1;
            }
            DOM.updateArrowCounter(S.arrows);
            return 0.5;
        },

        // ===== СКВЕРНА =====
        getFilth: function () {
            var p = Logic.getPlayer();
            if (p && p.stats && typeof p.stats.filth === 'number') return p.stats.filth;
            return 0;
        },

        setFilth: function (v) {
            var p = Logic.getPlayer();
            var max = (p && p.stats && p.stats.maxFilth) ? p.stats.maxFilth : 100;
            v = Math.max(0, Math.min(max, v));
            if (p && p.stats) p.stats.filth = v;
        },

        addFilth: function (n) { Logic.setFilth(Logic.getFilth() + n); },
        spendFilth: function (n) { Logic.setFilth(Logic.getFilth() - n); },

        _updateFilth: function (dt) {
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
            S.playerHitFirst = false;
            DOM.showBattleUI(false);
        },

        // ===== УДАР ИГРОКА (эталон) =====
        attack: function () {
            if (!S.active || !S.enemy) return;
            if (S.playerStunned > 0) { DOM.centerText('ОГЛУШЁН!', '#ffaa00'); return; }
            if (S.playerAttackCooldown > 0) return;

            var p = Logic.getPlayer();
            if (!p || !p.stats) return;

            S.playerAttackCooldown = CFG.PLAYER_ATTACK_CD;
            S.playerHitFirst = true;

            var mult = 1;
            if (S.arrows >= CFG.ARROWS_NEEDED) {
                S.arrows -= CFG.ARROWS_NEEDED;
            } else {
                mult = 0.5;
                DOM.centerText('НЕТ СТРЕЛ!', '#ffaa00');
            }
            DOM.updateArrowCounter(S.arrows);

            var baseDmg = Math.max(50, Math.floor(p.stats.attack * 1.5) - Math.floor(S.enemy.def * 0.5) + Math.floor(Math.random() * 20));
            var dmg = Math.floor(baseDmg * mult);
            if (S.rageCharges > 0) {
                dmg *= 2;
                S.rageCharges--;
            }

            S.enemy.hp = Math.max(0, S.enemy.hp - dmg);
            Logic._syncEnemyHp();

            if (S.vampirismBuff > 0) {
                var heal = Math.floor(dmg * 0.3);
                p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
            }

            DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);
            DOM.updateHeroSpheres(p);

            if (S.enemySprite) {
                FX.hitFlash(S.enemySprite);
                FX.knockback(S.enemySprite, 0, 0);
            }
            FX.shake(CFG.CAMERA_SHAKE);
            DOM.showHitEffect(S.enemySprite, S.camFPS);
            if (S.ctx.playSoundHit) S.ctx.playSoundHit();

            if (S.enemy.hp <= 0) { Logic._enemyKilled(); return; }
            if (S.enemyStunned > 0) return;
            Logic._enemyHitsPlayer();
        },

        // ===== ОТВЕТ ВРАГА (эталон) =====
        _enemyHitsPlayer: function () {
            if (!S.active || !S.enemy) return;
            var p = Logic.getPlayer();
            if (!p || !p.stats) return;

            var edmg = Math.max(5, Math.floor(S.enemy.atk * 0.5));
            var talents = (p.talents) ? p.talents : {};

            if (talents.blocking && Math.random() < 0.1 * talents.blocking) {
                DOM.centerText('БЛОК!', '#88ff88');
                return;
            }
            if (talents.numbness && Math.random() < 0.05 * talents.numbness) {
                DOM.centerText('ОЦЕПЕНЕНИЕ!', '#88ccff');
                return;
            }
            if (talents.ricochet && Math.random() < 0.45) {
                S.enemy.hp = Math.max(0, S.enemy.hp - edmg);
                DOM.centerText('РИКОШЕТ!', '#ffcc00');
                DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);
                Logic._syncEnemyHp();
                if (S.enemy.hp <= 0) Logic._enemyKilled();
                return;
            }

            p.stats.hp = Math.max(0, p.stats.hp - edmg);
            Logic.addFilth(CFG.FILTH_HIT_AMOUNT);
            DOM.showBlood();
            DOM.updateHeroSpheres(p);
            if (S.ctx.onHpChanged) S.ctx.onHpChanged();

            if (p.stats.hp <= 0) Logic._death('enemy');
        },

        // ===== ТАЛАНТЫ (эталон) =====
        useSkill: function (sid) {
            if (!S.active || !S.enemy) return;
            var d = TALENT_DATA[sid];
            if (!d) return;
            var p = Logic.getPlayer();
            if (!p || !p.stats) return;
            var lvl = (p.talents && p.talents[sid]) ? p.talents[sid] : 0;
            if (lvl <= 0) return;

            var now = Date.now();
            if (S.skillCooldowns[sid] && now < S.skillCooldowns[sid]) return;

            if (sid === 'stunning') {
                if (Logic.getFilth() < d.filthCost) { DOM.centerText('МАЛО СКВЕРНЫ!', '#ffaa00'); return; }
                Logic.spendFilth(d.filthCost);
                S.enemyStunned = d.stunTime;
                DOM.centerText('ОГЛУШЕНИЕ!', '#88ccff');
            } else if (sid === 'rage') {
                if (Logic.getFilth() < d.filthCost) { DOM.centerText('МАЛО СКВЕРНЫ!', '#ffaa00'); return; }
                Logic.spendFilth(d.filthCost);
                S.rageCharges = d.charges;
                DOM.centerText('ЯРОСТЬ!', '#ff4444');
            } else if (sid === 'healing') {
                var cost = d.filthPerLvl * lvl;
                var heal = d.healPerLvl * lvl;
                if (Logic.getFilth() < cost) { DOM.centerText('МАЛО СКВЕРНЫ!', '#ffaa00'); return; }
                Logic.spendFilth(cost);
                p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
                DOM.centerText('+' + heal + ' HP', '#66ff66');
            }

            S.skillCooldowns[sid] = now + d.cooldown;
            DOM.updateHeroSpheres(p);
            Logic.updateSkillCooldowns();
            if (S.ctx.playSoundAltar) S.ctx.playSoundAltar();
        },

        updateSkillCooldowns: function () {
            var row = document.getElementById('skills-row');
            if (!row) return;
            var now = Date.now();
            var btns = row.querySelectorAll('.skill-btn');
            for (var i = 0; i < btns.length; i++) {
                var sid = btns[i].getAttribute('data-skill');
                var cdEnd = S.skillCooldowns[sid] || 0;
                if (cdEnd > now) btns[i].classList.add('on-cooldown');
                else btns[i].classList.remove('on-cooldown');
            }
        },

        renderLearnedTalents: function () {
            var row = document.getElementById('skills-row');
            if (!row) return;
            row.innerHTML = '';
            var p = Logic.getPlayer();
            var talents = (p && p.talents) ? p.talents : {};
            Object.keys(TALENT_DATA).forEach(function (sid) {
                if (!talents[sid]) return;
                var d = TALENT_DATA[sid];
                var img = document.createElement('img');
                img.src = d.icon;
                img.className = 'skill-btn';
                img.setAttribute('data-skill', sid);
                img.addEventListener('click', function (e) {
                    e.stopPropagation();
                    window.Sherwood.BattleVisuals.useSkill(sid);
                });
                row.appendChild(img);
            });
        },

        // ===== ИТОГИ =====
        _enemyKilled: function () {
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
        getEnemySprite: function () { return S.enemySprite; },
        updateMobHpBar: function (sprite, camera) { FX.updateMobHpBar(sprite, camera); },
        shake: function (amount) { FX.shake(amount); },

        getArrows: function () { return S.arrows; },
        addArrows: Logic.addArrows,
        loadArrowsFromBag: Logic.loadArrows,
        returnArrowsToBag: Logic.returnArrowsToBag,
        spendArrowsForAttack: Logic.spendArrowsForAttack,
        updateArrowCounter: function (n) {
            if (typeof n === 'number') S.arrows = n;
            DOM.updateArrowCounter(S.arrows);
        },

        getFilth: Logic.getFilth,
        setFilth: Logic.setFilth,
        addFilth: Logic.addFilth,
        spendFilth: Logic.spendFilth,
        updateHeroSpheres: function () { DOM.updateHeroSpheres(Logic.getPlayer()); },

        renderLearnedTalents: Logic.renderLearnedTalents,
        updateKillCounter: function (killed, total) { DOM.updateKillCounter(killed, total); },

        showBloodOverlay: function () { DOM.showBlood(); },
        showCenterText: function (text, color) { DOM.centerText(text, color); },
        showHitEffect: function (sprite, camera) { DOM.showHitEffect(sprite, camera); },

        getPlayerAttackCooldown: function () { return S.playerAttackCooldown; },
        getPlayerStunned: function () { return S.playerStunned; },
        getEnemyStunned: function () { return S.enemyStunned; },
        getMobName: function (img) { return Logic.getMobName(img); }
    };
})();

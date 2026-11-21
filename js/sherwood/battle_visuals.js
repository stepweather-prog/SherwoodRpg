/**
 * battle_visuals.js — ЕДИНАЯ БОЕВАЯ СИСТЕМА (точный порт эталона из dungeon.html)
 *
 * Перенесено 1-в-1 из подземки:
 *   — стрелы (25 макс, 3 на удар, без стрел -50% урона)
 *   — скверна (+7 сама / +5 за полученный удар, смерть через 20с переполнения, -150 HP раз в 3с)
 *   — удар игрока: кулдаун 1с, max(50, atk*1.5 - def*0.5 + rand(20)), таланты ignore/rage/vampirism
 *   — ответ врага: max(5, atk*0.5), таланты blocking/numbness/ricochet
 *   — автоатака врага раз в 1000мс после первого удара игрока
 *   — скиллы: оглушение / ярость / лечение (за скверну, кулдауны как в эталоне)
 *   — визуал: флэш крови на спрайте, нокбэк, тряска камеры, HP-бар за врагом,
 *     сферы HP/скверны, кровавый оверлей, центральный текст, счётчик убийств
 *
 * Хост (portal_battle.html / wave_battle.html) только:
 *   — создаёт сцену, камеру и спрайт врага (через setupEnemySprite)
 *   — зовёт init({...}), startBattle({...}), в animate() — update(dt)
 *   — реагирует на колбэки onEnemyKilled / onDeath
 */
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
        dead: false,
        enemy: null,
        enemyObj: null,
        enemySprite: null,

        arrows: 25,
        arrowsSynced: false,
        arrowsStart: 0,
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
        skillFx: { sprite: null, cache: {}, active: null, t: 0 },
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
    var ARROW_FX_VIDEO = FX_DIR + 'sherwood_hollow_arrow.webm';

    var SKILL_FX_DIR = 'assets/assets2/animation/skills/';
    // Спрайт-анимации скилов временно отключены (будут переделаны).
    // Вернуть: поставить true — и все вызовы playSkillFx заработают снова.
    var SKILL_FX_ENABLED = false;
    var SKILL_FX_SETS = {
        'healing':   { frames: 8, fps: 12, scale: 3.2, y: 0.45, atEnemy: false },
        'rage':      { frames: 8, fps: 12, scale: 3.6, y: 0.45, atEnemy: false },
        'vampirism': { frames: 8, fps: 14, scale: 3.2, y: 0.45, atEnemy: false },
        'ricochet':  { frames: 8, fps: 14, scale: 2.2, y: 0.6,  atEnemy: true },
        'blocking':  { frames: 8, fps: 14, scale: 2.4, y: 0.35, atEnemy: false }
    };

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
                '.skill-btn { cursor:pointer;border-radius:8px;border:3px solid rgba(200,160,80,0.8);background:rgba(0,0,0,0.6);padding:3px;width:70px;height:70px;object-fit:contain;transition:all 0.2s;display:block;flex-shrink:0;box-sizing:border-box; }',
                '.skill-wrap { position:relative; flex-shrink:0; }',
                '.skill-cd-fill { position:absolute; top:0; left:0; width:100%; height:0%; background:rgba(0,0,0,0.7); border-radius:8px; pointer-events:none; z-index:2; }',
                '.skill-btn.on-cooldown { opacity:0.3;filter:grayscale(1);cursor:not-allowed; }',
                '@keyframes bvCenterFade { 0% { opacity:0; transform:translate(-50%,-50%) scale(0.85); } 15% { opacity:1; transform:translate(-50%,-50%) scale(1); } 80% { opacity:1; } 100% { opacity:0; transform:translate(-50%,-90%) scale(1); } }',
                '.bv-center-text { position:fixed;top:12%;left:50%;transform:translate(-50%,-50%);z-index:9000;pointer-events:none;font-family:Georgia,serif;font-size:1.15em;font-weight:bold;text-shadow:0 0 8px #000,0 2px 4px #000;animation:bvCenterFade 1.2s ease-out forwards;white-space:nowrap; }',
                '#hero-avatar { position:fixed;bottom:6px;left:112px;width:64px;height:64px;z-index:55;border-radius:50%;border:3px solid rgba(200,160,80,0.85);background:#000;overflow:hidden;pointer-events:none;box-shadow:0 0 12px rgba(0,0,0,0.8); }',
                '#hero-avatar img { position:absolute;height:280%;width:auto;max-width:none;top:-6%;left:50%;transform:translateX(-50%); }',
                '#enemy-avatar { position:fixed;top:14%;left:calc(50% + 220px);width:64px;height:64px;z-index:55;border-radius:50%;border:3px solid rgba(180,60,60,0.85);background:#000;overflow:hidden;pointer-events:none;box-shadow:0 0 12px rgba(0,0,0,0.8);transform:translate(-50%,-50%);display:none; }',
                '#enemy-avatar img { position:absolute;height:280%;width:auto;max-width:none;top:-36%;left:50%;transform:translateX(-50%); }',
                '@keyframes bvAvatarHurt { 0% { filter:none; box-shadow:0 0 0 #f00; } 25% { filter:brightness(2.2) saturate(2) drop-shadow(0 0 14px #f33); } 100% { filter:none; } }',
                '#hero-avatar.hurt { animation:bvAvatarHurt 0.5s ease-out; }',
                '@keyframes bvAvatarHit { 0% { filter:none; } 30% { filter:brightness(2.5); } 100% { filter:none; } }',
                '#enemy-avatar.hit { animation:bvAvatarHit 0.3s ease-out; }',
                '@keyframes bvAvatarBlock { 0% { box-shadow:0 0 0 rgba(120,200,255,0); } 30% { box-shadow:0 0 24px 6px rgba(120,200,255,0.9); } 100% { box-shadow:0 0 0 rgba(120,200,255,0); } }',
                '#hero-avatar.block { animation:bvAvatarBlock 0.6s ease-out; }',
                '@keyframes bvDmgFloat { 0% { opacity:0; transform:translateY(10px) scale(0.8); } 20% { opacity:1; transform:translateY(0) scale(1.1); } 100% { opacity:0; transform:translateY(-52px) scale(1); } }',
                '.bv-dmg-float { position:fixed;z-index:9100;pointer-events:none;font-family:Georgia,serif;font-size:22px;font-weight:bold;color:#ff5544;text-shadow:0 0 6px #000,0 2px 4px #000;animation:bvDmgFloat 1.1s ease-out forwards; }',
                '#dmg-vignette { position:fixed;top:0;left:0;width:100%;height:100%;z-index:149;pointer-events:none;opacity:0;box-shadow:inset 0 0 140px 40px rgba(180,0,0,0.75);transition:opacity 0.12s ease-out; }',
                // Пояс героя: левый карман — стрелы, два правых — зелья (лекарство / скверна)
                '#arrow-counter { display:none !important; }',
                '#hero-belt { position:fixed;bottom:6px;left:190px;width:300px;aspect-ratio:38/11;z-index:54;pointer-events:none;background:url("assets/assets2/game_details/sash.png") center/cover no-repeat; }',
                '.belt-slot { position:absolute;top:14%;height:69%;border-radius:8px;pointer-events:auto;cursor:pointer;display:flex;align-items:center;justify-content:center; }',
                '.belt-slot img { width:80%;height:80%;object-fit:contain;filter:drop-shadow(0 0 6px rgba(0,0,0,0.9));display:block;pointer-events:none; }',
                '.belt-slot.belt-slot-empty img { opacity:0.28; }',
                '.belt-badge { position:absolute;right:-6px;bottom:-6px;min-width:22px;height:22px;padding:0 4px;background:rgba(0,0,0,0.85);border:1px solid rgba(200,160,80,0.9);border-radius:11px;color:#ffd27a;font-size:13px;font-weight:bold;text-align:center;line-height:22px;box-sizing:border-box;z-index:3;pointer-events:none; }'
            ].join('\n');
            var st = document.createElement('style');
            st.id = 'battle-system-styles';
            st.textContent = css;
            document.head.appendChild(st);
        },

        ensureAvatars: function () {
            this.findOrCreate('hero-avatar', function () {
                var d = document.createElement('div');
                d.innerHTML = '<img src="" alt="">';
                return d;
            });
            this.findOrCreate('enemy-avatar', function () {
                var d = document.createElement('div');
                d.innerHTML = '<img src="" alt="">';
                return d;
            });
            this.findOrCreate('dmg-vignette', function () {
                return document.createElement('div');
            });
            this.setHeroSkin();
        },

        setHeroSkin: function () {
            var box = this.find('hero-avatar');
            if (!box) return;
            var img = box.querySelector('img') || box;
            var skin = null;
            try { skin = localStorage.getItem('active_skin'); } catch (e) {}
            var url = 'assets/hero_skins/' + (skin || 'skin1_01.png');
            img.src = url;
        },

        // ===== ПОЯС ГЕРОЯ (sash.png): карман стрел + 2 кармана зелий =====
        ensureBelt: function () {
            if (this.find('hero-belt')) return;
            var b = document.createElement('div');
            b.id = 'hero-belt';
            b.innerHTML =
                '<div class="belt-slot belt-slot-empty" id="belt-sl-arrows" style="left:9.3%;width:17.1%;">' +
                    '<img src="assets/interface/sherwood_hollow_arrow.png" alt="">' +
                    '<div class="belt-badge" id="belt-count-arrows">0</div>' +
                '</div>' +
                '<div class="belt-slot belt-slot-empty" id="belt-sl-healing" style="left:61%;width:17.6%;" data-potion="healing">' +
                    '<img src="assets/assets2/game_details/resource_life_potion.png" alt="">' +
                    '<div class="belt-badge" id="belt-count-healing">0</div>' +
                '</div>' +
                '<div class="belt-slot belt-slot-empty" id="belt-sl-filth" style="left:79.6%;width:17.6%;" data-potion="filth">' +
                    '<img src="assets/assets2/game_details/potion_of_filth.png" alt="">' +
                    '<div class="belt-badge" id="belt-count-filth">0</div>' +
                '</div>';
            document.body.appendChild(b);
            var self = this;
            var slots = b.querySelectorAll('.belt-slot');
            for (var i = 0; i < slots.length; i++) {
                (function (slot) {
                    var type = slot.getAttribute('data-potion');
                    if (!type) return;
                    var drink = function (e) { e.preventDefault(); e.stopPropagation(); self.useBeltPotion(type); };
                    slot.addEventListener('click', drink);
                    slot.addEventListener('touchstart', drink);
                })(slots[i]);
            }
            this.updateBelt();
            this._layoutBelt();
            var self2 = this;
            if (!this._beltResizeBound) {
                this._beltResizeBound = true;
                window.addEventListener('resize', function () { self2._layoutBelt(); });
            }
        },

        // Пояс располагается из JS: между аватаром героя и сферой маны (у сферы img 135% — учесть свес)
        _layoutBelt: function () {
            var belt = this.find('hero-belt');
            if (!belt) return;
            var av = document.getElementById('hero-avatar');
            if (!av) return;
            var left = av.getBoundingClientRect().right + 10;
            var rightLimit = window.innerWidth - 145; // фолбэк, если сферы нет
            var mana = document.getElementById('hero-mana');
            if (mana) {
                var mr = mana.getBoundingClientRect();
                var overhang = mr.width * 0.35 / 2 + 5; // img 135% вылезает за элемент
                rightLimit = mr.left - overhang - 10;
            }
            var width = rightLimit - left;
            var minW = Math.min(200, Math.max(90, window.innerWidth - left));
            if (width < minW) width = minW;
            belt.style.left = left + 'px';
            belt.style.width = Math.min(width, window.innerWidth - left) + 'px';
            belt.style.bottom = '6px';
        },

        updateBelt: function () {
            var p = null;
            try { p = Logic.getPlayer(); } catch (e) {}
            var arrows = 0;
            if (S.active || S.arrowsSynced) arrows = S.arrows;
            else if (p && p.resources && typeof p.resources.arrows === 'number') arrows = p.resources.arrows;
            arrows = Math.max(0, Math.min(25, arrows));
            var belt = (p && p.belt) ? p.belt : {};
            var healing = Math.max(0, Math.min(2, belt.healing || 0));
            var filth = Math.max(0, Math.min(2, belt.filth || 0));
            var map = [['belt-count-arrows', arrows, 'belt-sl-arrows'], ['belt-count-healing', healing, 'belt-sl-healing'], ['belt-count-filth', filth, 'belt-sl-filth']];
            for (var i = 0; i < map.length; i++) {
                var t = document.getElementById(map[i][0]);
                if (t) t.textContent = String(map[i][1]);
                var slot = document.getElementById(map[i][2]);
                if (slot) slot.classList[map[i][1] > 0 ? 'remove' : 'add']('belt-slot-empty');
            }
        },

        useBeltPotion: function (type) {
            var p = Logic.getPlayer();
            if (!p || !p.stats) return false;
            if (!p.belt) p.belt = { healing: 0, filth: 0 };
            if (!(p.belt[type] > 0)) { DOM.centerText('КАРМАН ПУСТ!', '#ffaa00'); return false; }
            p.belt[type]--;
            if (type === 'healing') {
                var heal = Math.floor((p.stats.maxHp || 100) * 0.5);
                p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
                DOM.centerText('+' + heal + ' HP', '#66ff66');
                DOM.floatDamageNumber('+' + heal, '#66ff66', 'hero');
                DOM.webmFx('healing', { elId: 'hero-avatar' });
            } else {
                var max = p.stats.maxFilth || 100;
                p.stats.filth = Math.max(0, (p.stats.filth || 0) - max * 0.8);
                DOM.centerText('СКВЕРНА -80%', '#aa66ff');
                DOM.floatDamageNumber('-СКВЕРНА', '#aa66ff', 'hero');
            }
            DOM.updateBelt();
            DOM.updateHeroSpheres(p);
            if (S.ctx && S.ctx.playSoundAltar) S.ctx.playSoundAltar();
            if (S.ctx && S.ctx.onHpChanged) S.ctx.onHpChanged();
            try { if (typeof Sherwood !== 'undefined' && Sherwood.saveGame) Sherwood.saveGame(); } catch (e) {}
            return true;
        },

        setEnemySkin: function (imgPath) {
            var box = this.find('enemy-avatar');
            if (!box) return;
            var img = box.querySelector('img') || box;
            img.src = imgPath || '';
        },

        _replayClass: function (el, cls) {
            if (!el) return;
            el.classList.remove(cls);
            void el.offsetWidth;
            el.classList.add(cls);
            setTimeout(function () { el.classList.remove(cls); }, 700);
        },

        heroAvatarHurt: function () { this._replayClass(this.find('hero-avatar'), 'hurt'); },
        heroAvatarBlock: function () { this._replayClass(this.find('hero-avatar'), 'block'); },
        enemyAvatarHit: function () { this._replayClass(this.find('enemy-avatar'), 'hit'); },

        showDamageVignette: function () {
            var el = this.find('dmg-vignette');
            if (!el) return;
            el.style.opacity = '1';
            clearTimeout(this._dmgVignetteT);
            this._dmgVignetteT = setTimeout(function () { el.style.opacity = '0'; }, 220);
        },

        floatDamageNumber: function (text, color, target) {
            var el = document.createElement('div');
            el.className = 'bv-dmg-float';
            el.style.color = color || '#ff5544';
            el.textContent = text;
            var placed = false;
            if (target === 'hero' || target === 'enemy') {
                var av = this.find(target === 'hero' ? 'hero-avatar' : 'enemy-avatar');
                if (av && av.style.display !== 'none') {
                    var r = av.getBoundingClientRect();
                    el.style.left = Math.max(6, r.left + r.width / 2 - 20 + Math.floor(Math.random() * 40)) + 'px';
                    el.style.top = (r.top + 4) + 'px';
                    el.style.bottom = 'auto';
                    placed = true;
                }
            }
            if (!placed) {
                el.style.left = (30 + Math.floor(Math.random() * 40)) + 'px';
                el.style.bottom = '135px';
            }
            document.body.appendChild(el);
            setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 1200);
        },

        showBattleUI: function (on) {
            var bc = this.find('battle-controls');
            var ai = this.find('attack-icon');
            var sr = this.find('skills-row');
            if (bc) bc.style.display = on ? 'flex' : 'none';
            if (ai) ai.style.display = on ? 'block' : 'none';
            if (sr) sr.style.display = on ? 'flex' : 'none';
            if (this.els['mob-hp']) this.els['mob-hp'].style.display = on ? 'block' : 'none';
            var ea = this.find('enemy-avatar');
            if (ea) ea.style.display = on ? 'block' : 'none';
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
            this.updateBelt();
        },

        updateMobHp: function (hp, maxHp) {
            if (!maxHp) maxHp = 1;
            var pct = Math.max(0, Math.min(1, hp / maxHp));
            var fill = this.find('mob-hp-fill');
            if (fill) fill.style.clipPath = 'inset(0 ' + (1 - pct) * 100 + '% 0 0)';
            var txt = this.find('mob-hp-text');
            if (txt) txt.textContent = String(Math.max(0, Math.floor(hp)));
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
            if (hpText) hpText.textContent = String(Math.floor(p.stats.hp));
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
            this.updateBelt();
        },

        updateAttackButton: function (cd) {
            var ov = this.find('attack-cooldown-overlay');
            var icon = this.find('attack-icon');
            if (!ov) return;
            if (cd > 0) {
                if (cd > (this._attackCdMax || 0)) this._attackCdMax = cd;
                var pct = Math.max(2, Math.min(100, (cd / (this._attackCdMax || 1)) * 100));
                ov.style.display = 'block';
                ov.textContent = '';
                ov.style.top = '0';
                ov.style.height = pct + '%';
                if (icon) icon.style.pointerEvents = 'none';
            } else {
                this._attackCdMax = 0;
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

        arrowFlight: function (sprite, camera) {
            var self = this;
            if (!sprite || !camera) return;
            if (this._arrowfx) { cancelAnimationFrame(this._arrowfx); this._arrowfx = null; }
            if (this._arrowCanvas && this._arrowCanvas.parentNode) this._arrowCanvas.parentNode.removeChild(this._arrowCanvas);

            var video = this._arrowVideo;
            if (!video) {
                video = document.createElement('video');
                video.src = ARROW_FX_VIDEO;
                video.muted = true;
                video.playsInline = true;
                video.preload = 'auto';
                video.style.display = 'none';
                document.body.appendChild(video);
                video.onended = function () { self.hideArrowFlight(); };
                video.onerror = function () { self.hideArrowFlight(); };
                this._arrowVideo = video;
            }

            var canvas = document.createElement('canvas');
            canvas.width = 360; canvas.height = 360;
            var size = Math.min(460, Math.max(280, Math.floor(window.innerWidth * 0.42)));
            canvas.style.cssText = 'position:fixed;pointer-events:none;z-index:40;width:' + size + 'px;height:' + size + 'px;left:0;top:0;display:none;';
            document.body.appendChild(canvas);
            this._arrowCanvas = canvas;

            var worldPos = sprite.position.clone();
            worldPos.y += sprite.scale.y * 0.5;
            worldPos.project(camera);
            var ex = (worldPos.x * 0.5 + 0.5) * window.innerWidth;
            var ey = (-worldPos.y * 0.5 + 0.5) * window.innerHeight;
            canvas.style.left = (ex - size / 2) + 'px';
            canvas.style.top = (ey - size * 0.22) + 'px';

            var ctx2d = canvas.getContext('2d', { willReadFrequently: true });
            function keyFrame() {
                self._arrowfx = null;
                if (!self._arrowCanvas) return;
                if (video.readyState < 2 || video.paused || video.ended) { self.hideArrowFlight(); return; }
                ctx2d.drawImage(video, 0, 0, 360, 360);
                var im = ctx2d.getImageData(0, 0, 360, 360);
                var d = im.data;
                for (var i = 0; i < d.length; i += 4) {
                    var r = d[i], g = d[i + 1], b = d[i + 2];
                    if (g > 50 && g > r * 1.15 && g > b * 1.15) {
                        d[i + 3] = 0;
                    } else if (g > 50 && g > r && g > b) {
                        d[i + 1] = (r + b) >> 1;
                    }
                }
                ctx2d.putImageData(im, 0, 0);
                self._arrowfx = requestAnimationFrame(keyFrame);
            }

            try { video.currentTime = 0; } catch (e) {}
            var pr = video.play();
            var start = function () { canvas.style.display = 'block'; self._arrowfx = requestAnimationFrame(keyFrame); };
            if (pr && pr.then) { pr.then(start).catch(function () { self.hideArrowFlight(); }); }
            else { start(); }
        },

        hideArrowFlight: function () {
            if (this._arrowfx) { cancelAnimationFrame(this._arrowfx); this._arrowfx = null; }
            if (this._arrowCanvas && this._arrowCanvas.parentNode) this._arrowCanvas.parentNode.removeChild(this._arrowCanvas);
            this._arrowCanvas = null;
            if (this._arrowVideo) { try { this._arrowVideo.pause(); } catch (e) {} }
        },

        // ===== WEBM-ЭФФЕКТ СКИЛА: чёрный фон -> прозрачность (лумакей) =====
        webmFx: function (name, opts) {
            var self = this;
            opts = opts || {};
            if (!this._webmVideos) this._webmVideos = {};
            var v = this._webmVideos[name];
            if (!v) {
                v = document.createElement('video');
                v.src = SKILL_FX_DIR + name + '/' + name + '.webm';
                v.muted = true;
                v.playsInline = true;
                v.preload = 'auto';
                v.style.display = 'none';
                document.body.appendChild(v);
                v.onerror = function () { self._webmHideFx(name); };
                this._webmVideos[name] = v;
            }
            if (this._webmCanvases && this._webmCanvases[name]) {
                var old = this._webmCanvases[name];
                if (this._webmRafs && this._webmRafs[name]) cancelAnimationFrame(this._webmRafs[name]);
                if (old.parentNode) old.parentNode.removeChild(old);
                delete this._webmCanvases[name];
            }

            var cw = opts.size || 512;
            var canvas = document.createElement('canvas');
            canvas.width = cw; canvas.height = cw;
            var scr = Math.min(window.innerWidth, window.innerHeight);
            var px = Math.floor(Math.min(cw, scr * (opts.scale || 0.55)));
            var xf = (opts.x !== undefined) ? opts.x : 0.5;
            var yf = (opts.y !== undefined) ? opts.y : 0.55;
            var cl = Math.floor(window.innerWidth * xf - px / 2);
            var ct = Math.floor(window.innerHeight * yf - px / 2);
            if (opts.elId) {
                var ael = document.getElementById(opts.elId);
                if (ael && ael.style.display !== 'none') {
                    var ar = ael.getBoundingClientRect();
                    var acx = ar.left + ar.width / 2;
                    if (opts.circle) {
                        // Режим круга: вписать эффект в кружок элемента, по центру
                        var mul = (opts.sizeMul !== undefined) ? opts.sizeMul : 1.1;
                        px = Math.max(70, Math.min(200, Math.round(ar.width * mul)));
                        var acy = ar.top + ar.height / 2;
                        cl = Math.max(4, Math.min(window.innerWidth - px - 4, Math.floor(acx - px / 2)));
                        ct = Math.max(4, Math.floor(acy - px / 2));
                    } else {
                        px = Math.max(80, Math.min(200, Math.round(ar.width * 2.0)));
                        cl = Math.max(4, Math.min(window.innerWidth - px - 4, Math.floor(acx - px / 2)));
                        ct = Math.max(4, Math.floor(ar.top + 6 - px));
                    }
                }
            }
            canvas.style.cssText = 'position:fixed;pointer-events:none;z-index:58;width:' + px + 'px;height:' + px + 'px;left:' + cl + 'px;top:' + ct + 'px;' + (opts.circle ? 'border-radius:50%;' : '');
            document.body.appendChild(canvas);
            if (!this._webmCanvases) this._webmCanvases = {};
            if (!this._webmRafs) this._webmRafs = {};
            this._webmCanvases[name] = canvas;

            var ctx2d = canvas.getContext('2d', { willReadFrequently: true });
            var thrLow = (opts.keyLow !== undefined) ? opts.keyLow : 28;
            var thrHigh = (opts.keyHigh !== undefined) ? opts.keyHigh : 105;
            function frame() {
                self._webmRafs[name] = null;
                var c = self._webmCanvases && self._webmCanvases[name];
                if (!c) return;
                if (v.ended || v.paused) { self._webmHideFx(name); return; }
                if (v.readyState >= 2) {
                    try {
                        ctx2d.drawImage(v, 0, 0, cw, cw);
                        var im = ctx2d.getImageData(0, 0, cw, cw);
                        var d = im.data;
                        for (var i = 0; i < d.length; i += 4) {
                            var m = d[i] > d[i + 1] ? (d[i] > d[i + 2] ? d[i] : d[i + 2]) : (d[i + 1] > d[i + 2] ? d[i + 1] : d[i + 2]);
                            if (m <= thrLow) {
                                d[i + 3] = 0;
                            } else if (m < thrHigh) {
                                d[i + 3] = Math.floor((m - thrLow) * 255 / (thrHigh - thrLow));
                            }
                        }
                        ctx2d.putImageData(im, 0, 0);
                    } catch (e) {}
                }
                self._webmRafs[name] = requestAnimationFrame(frame);
            }
            try { v.currentTime = 0; } catch (e) {}
            this._webmCanvases[name] = canvas;
            var pr = v.play();
            var start = function () { self._webmRafs[name] = requestAnimationFrame(frame); };
            if (pr && pr.then) { pr.then(start).catch(function () { self._webmHideFx(name); }); }
            else { start(); }
        },

        _webmHideFx: function (name) {
            if (this._webmRafs && this._webmRafs[name]) { cancelAnimationFrame(this._webmRafs[name]); this._webmRafs[name] = null; }
            if (this._webmCanvases && this._webmCanvases[name]) {
                var c = this._webmCanvases[name];
                if (c.parentNode) c.parentNode.removeChild(c);
                delete this._webmCanvases[name];
            }
            if (this._webmVideos && this._webmVideos[name]) { try { this._webmVideos[name].pause(); } catch (e) {} }
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
            if (SKILL_FX_ENABLED) {
                var skillSids = Object.keys(SKILL_FX_SETS);
                for (var k = 0; k < skillSids.length; k++) {
                    var ksid = skillSids[k], kset = SKILL_FX_SETS[ksid], kframes = [];
                    for (var kf = 1; kf <= kset.frames; kf++) {
                        try { kframes.push(S.loader.load(SKILL_FX_DIR + ksid + '/' + ksid + '_' + kf + '.png')); } catch (e) {}
                    }
                    if (kframes.length) S.skillFx.cache[ksid] = kframes;
                }
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

        playSkillFx: function (sid, enemySprite, scaleMult) {
            if (!SKILL_FX_ENABLED) return;
            var T = window.THREE;
            var set = SKILL_FX_SETS[sid];
            if (!set || !S.scene || !T) return;
            if (!S.skillFx.cache[sid]) {
                var frames = [];
                if (S.loader) {
                    for (var i = 1; i <= set.frames; i++) {
                        try { frames.push(S.loader.load(SKILL_FX_DIR + sid + '/' + sid + '_' + i + '.png')); } catch (e) {}
                    }
                }
                if (!frames.length) return;
                S.skillFx.cache[sid] = frames;
            }
            if (!S.skillFx.sprite) {
                var mat = new T.SpriteMaterial({ transparent: true, opacity: 1, depthTest: false, depthWrite: false });
                S.skillFx.sprite = new T.Sprite(mat);
                S.skillFx.sprite.renderOrder = 15;
                S.scene.add(S.skillFx.sprite);
            }
            var spr = S.skillFx.sprite;
            var sc = set.scale * (scaleMult || 1);
            spr.scale.set(sc, sc, 1);
            var atEnemy = set.atEnemy && enemySprite;
            var baseX = atEnemy ? enemySprite.position.x : 0;
            var baseY = atEnemy ? (enemySprite.position.y + enemySprite.scale.y * 0.5) : set.y;
            spr.position.set(baseX, baseY, 1.2);
            spr.material.map = S.skillFx.cache[sid][0];
            spr.material.needsUpdate = true;
            spr.visible = true;
            S.skillFx.active = sid;
            S.skillFx.t = 0;
        },

        updateSkillFx: function (dt) {
            var fx = S.skillFx;
            if (!fx.active || !fx.sprite) return;
            var set = SKILL_FX_SETS[fx.active];
            fx.t += dt;
            var idx = Math.floor(fx.t * set.fps);
            if (idx >= set.frames || fx.active === null) {
                fx.active = null;
                fx.sprite.visible = false;
                return;
            }
            fx.sprite.material.map = fx.cache[fx.active][idx];
            fx.sprite.material.needsUpdate = true;
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
            var ea = DOM.find('enemy-avatar');
            if (ea && ea.style.display !== 'none') {
                var r = el.getBoundingClientRect();
                ea.style.left = Math.min(window.innerWidth - 65, Math.max(r.right + 10, 260)) + 'px';
                ea.style.top = (r.top + r.height * 0.5 + 20) + 'px';
            }
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
        // Стрелы лежат в сумке ПРЕДМЕТАМИ (id sherwood_arrow);
        // player.resources.arrows — зеркало, которое читает dungeon.html (эталон)
        _bagArrowCount: function () {
            try {
                var bag = (typeof Sherwood !== 'undefined') ? Sherwood.Bag : null;
                if (bag && bag.getItems) {
                    var items = bag.getItems();
                    var total = 0;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i] && items[i].id === 'sherwood_arrow') total += items[i].quantity || 0;
                    }
                    return total;
                }
            } catch (e) {}
            return -1;
        },

        loadArrows: function () {
            var p = Logic.getPlayer();
            var fromResources = (p && p.resources && typeof p.resources.arrows === 'number') ? p.resources.arrows : -1;
            var fromBag = Logic._bagArrowCount();
            var cnt = (fromResources >= 0) ? fromResources : Math.max(fromBag, 0);
            S.arrowsStart = Math.max(cnt, 0);
            S.arrows = Math.min(S.arrowsStart, CFG.ARROWS_MAX_START);
            S.arrowsSynced = true;
            DOM.updateArrowCounter(S.arrows);
        },

        addArrows: function (n) {
            S.arrows = Math.max(0, S.arrows + n);
            DOM.updateArrowCounter(S.arrows);
        },

        returnArrowsToBag: function () {
            var p = Logic.getPlayer();
            // Колчан в бою ограничен 25, но всё сверх лимита остаётся в сумке
            var overflow = Math.max(0, (S.arrowsStart || 0) - CFG.ARROWS_MAX_START);
            var newTotal = S.arrows + overflow;
            if (p) {
                if (!p.resources) p.resources = {};
                p.resources.arrows = newTotal;
            }
            try {
                var bag = (typeof Sherwood !== 'undefined') ? Sherwood.Bag : null;
                if (bag && bag.getItems) {
                    var items = bag.getItems();
                    var total = 0;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i] && items[i].id === 'sherwood_arrow') total += items[i].quantity || 0;
                    }
                    var diff = newTotal - total;
                    if (diff > 0 && bag._addAsItem) {
                        bag._addAsItem('arrows', diff);
                    } else if (diff < 0) {
                        var need = -diff;
                        for (var j = items.length - 1; j >= 0 && need > 0; j--) {
                            if (items[j] && items[j].id === 'sherwood_arrow') {
                                var q = items[j].quantity || 0;
                                var take = Math.min(q, need);
                                if (bag.removeItem) bag.removeItem(j, take);
                                need -= take;
                            }
                        }
                    }
                    if (diff !== 0 && bag._save) bag._save();
                }
            } catch (e) {}
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
            FX.updateSkillFx(dt);

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
            S.dead = false;
            S.battleStartAt = Date.now();
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
                img: enemy.img || enemy.imagePath || enemy.image || '',
                name: enemy.name || ''
            };
            S.enemySprite = enemy.sprite || enemy.mesh || null;

            S.vampirismBuff = 0;
            S.vampirismReady = Math.random() < 0.30;
            if (S.vampirismReady) {
                S.vampirismBuff = 30;
                FX.playSkillFx('vampirism', S.enemySprite);
                DOM.centerText('ВАМПИРИЗМ!', '#ff6666');
            }

            if (!S.enemy.name && S.ctx.getMobName) S.enemy.name = S.ctx.getMobName(S.enemy.img);
            DOM.setEnemySkin(S.enemy.img);

            DOM.showBattleUI(true);
            DOM.updateMobName(S.enemy.name || 'Враг');
            DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);
            DOM.updateArrowCounter(S.arrows);
            if (S.vampirismReady) DOM.webmFx('vampirism', { elId: 'enemy-avatar', circle: true, sizeMul: 1.1, keyLow: 40, keyHigh: 130 });
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
            DOM.hideArrowFlight();
            DOM.showBattleUI(false);
        },

        // Защита от «призрачного» тапа: тап/клик, которым игрок входил в бой,
        // может доехать до кнопки удара уже в новом iframe — игнорируем 450мс с начала боя
        _entryGuard: function () {
            return (S.battleStartAt && Date.now() - S.battleStartAt < 450);
        },

        // ===== УДАР ИГРОКА (эталон) =====
        attack: function () {
            if (!S.active || !S.enemy) return;
            if (S.playerStunned > 0) { DOM.centerText('ОГЛУШЁН!', '#ffaa00'); return; }
            if (S.playerAttackCooldown > 0) return;
            if (Logic._entryGuard()) return;

            var p = Logic.getPlayer();
            if (!p || !p.stats) return;

            S.playerAttackCooldown = CFG.PLAYER_ATTACK_CD;
            S.playerHitFirst = true;

            var mult = 1;
            if (S.arrows >= CFG.ARROWS_NEEDED) {
                S.arrows -= CFG.ARROWS_NEEDED;
                DOM.arrowFlight(S.enemySprite, S.camFPS);
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
                DOM.floatDamageNumber('+' + heal, '#66ff66', 'hero');
                FX.playSkillFx('vampirism', S.enemySprite, 0.55);
                DOM.webmFx('vampirism', { elId: 'enemy-avatar', circle: true, sizeMul: 1.1, keyLow: 40, keyHigh: 130 });
            }

            DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);
            DOM.updateHeroSpheres(p);

            if (S.enemySprite) {
                FX.hitFlash(S.enemySprite);
                FX.knockback(S.enemySprite, 0, 0);
            }
            DOM.enemyAvatarHit();
            DOM.floatDamageNumber('-' + dmg, '#ffcc55', 'enemy');
            FX.shake(CFG.CAMERA_SHAKE);
            DOM.showHitEffect(S.enemySprite, S.camFPS);
            if (S.ctx.playSoundHit) S.ctx.playSoundHit();

            if (S.enemy.hp <= 0) { Logic._enemyKilled(); return; }
            if (S.enemyStunned > 0) return;
            Logic._enemyHitsPlayer();
        },

        // ===== УМЕНИЯ ВРАГА: обычные враги ~12% на ход, боссы ~22% =====
        _enemySkill: function () {
            if (!S.enemy) return null;
            var chance = S.enemy.isBoss ? 0.22 : 0.12;
            if (Math.random() >= chance) return null;
            var roll = Math.random();
            if (roll < 0.4) {
                DOM.centerText('ТЯЖЁЛЫЙ УДАР!', '#ff6622');
                return { mult: 1.6 };
            }
            if (roll < 0.7) {
                S.playerStunned = 2;
                DOM.centerText('ВРАГ ОГЛУШАЕТ!', '#ffaa00');
                return { stun: true };
            }
            var heal = Math.max(10, Math.floor(S.enemy.maxHp * (S.enemy.isBoss ? 0.06 : 0.04)));
            S.enemy.hp = Math.min(S.enemy.maxHp, S.enemy.hp + heal);
            DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);
            Logic._syncEnemyHp();
            DOM.centerText('ВРАГ ИСЦЕЛЯЕТСЯ!', '#66ff66');
            DOM.enemyAvatarHit();
            FX.playSkillFx('healing', S.enemySprite);
            DOM.webmFx('healing', { elId: 'enemy-avatar' });
            DOM.floatDamageNumber('+' + heal, '#66ff66', 'enemy');
            return { heal: true };
        },

        // ===== ОТВЕТ ВРАГА (эталон) =====
        _enemyHitsPlayer: function () {
            if (!S.active || !S.enemy) return;
            var p = Logic.getPlayer();
            if (!p || !p.stats) return;

            var edmg = Math.max(5, Math.floor(S.enemy.atk * 0.5));
            var talents = (p.talents) ? p.talents : {};

            var enemySkill = Logic._enemySkill();
            if (enemySkill && enemySkill.mult) edmg = Math.floor(edmg * enemySkill.mult);
            else if (enemySkill) return;

            if (talents.blocking && Math.random() < 0.1 * talents.blocking) {
                FX.playSkillFx('blocking');
                DOM.centerText('БЛОК!', '#88ff88');
                DOM.heroAvatarBlock();
                return;
            }
            if (talents.numbness && Math.random() < 0.05 * talents.numbness) {
                DOM.centerText('ОЦЕПЕНЕНИЕ!', '#88ccff');
                DOM.heroAvatarBlock();
                return;
            }
            if (talents.ricochet && Math.random() < 0.45) {
                S.enemy.hp = Math.max(0, S.enemy.hp - edmg);
                FX.playSkillFx('ricochet', S.enemySprite);
                DOM.centerText('РИКОШЕТ!', '#ffcc00');
                DOM.enemyAvatarHit();
                DOM.floatDamageNumber('-' + edmg, '#ffcc55', 'enemy');
                DOM.updateMobHp(S.enemy.hp, S.enemy.maxHp);
                Logic._syncEnemyHp();
                if (S.enemy.hp <= 0) Logic._enemyKilled();
                return;
            }

            p.stats.hp = Math.max(0, p.stats.hp - edmg);
            Logic.addFilth(CFG.FILTH_HIT_AMOUNT);
            DOM.showBlood();
            DOM.showDamageVignette();
            DOM.heroAvatarHurt();
            DOM.floatDamageNumber('-' + edmg, '#ff5544', 'hero');
            FX.shake(CFG.CAMERA_SHAKE);
            DOM.updateHeroSpheres(p);
            if (S.ctx.onHpChanged) S.ctx.onHpChanged();

            if (p.stats.hp <= 0) Logic._death('enemy');
        },

        // ===== ТАЛАНТЫ (эталон) =====
        useSkill: function (sid) {
            if (!S.active || !S.enemy) return;
            if (Logic._entryGuard()) return;
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
                FX.playSkillFx('rage');
                DOM.centerText('ЯРОСТЬ!', '#ff4444');
            } else if (sid === 'healing') {
                var cost = d.filthPerLvl * lvl;
                var heal = d.healPerLvl * lvl;
                if (Logic.getFilth() < cost) { DOM.centerText('МАЛО СКВЕРНЫ!', '#ffaa00'); return; }
                Logic.spendFilth(cost);
                p.stats.hp = Math.min(p.stats.maxHp, p.stats.hp + heal);
                DOM.centerText('+' + heal + ' HP', '#66ff66');
                DOM.floatDamageNumber('+' + heal, '#66ff66', 'hero');
                FX.playSkillFx('healing');
                DOM.webmFx('healing', { elId: 'hero-avatar' });
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
            var anyActive = false;
            for (var i = 0; i < btns.length; i++) {
                var sid = btns[i].getAttribute('data-skill');
                var cdEnd = S.skillCooldowns[sid] || 0;
                var remain = cdEnd - now;
                if (remain > 0) {
                    btns[i].classList.add('on-cooldown');
                    anyActive = true;
                } else {
                    btns[i].classList.remove('on-cooldown');
                }
                // Тёмное заполнение, убывающее снизу вверх — как тень кулдауна на кнопке удара
                var wrap = btns[i].parentNode;
                var fill = (wrap && wrap.classList && wrap.classList.contains('skill-wrap')) ? wrap.querySelector('.skill-cd-fill') : null;
                if (fill) {
                    var d = TALENT_DATA[sid];
                    var total = (d && d.cooldown) ? d.cooldown : cdEnd - now;
                    var pct = (remain > 0 && total > 0) ? Math.max(0, Math.min(100, (remain / total) * 100)) : 0;
                    fill.style.top = '0';
                    fill.style.height = pct + '%';
                }
            }
            if (this._skillCdRaf) { cancelAnimationFrame(this._skillCdRaf); this._skillCdRaf = null; }
            if (anyActive) {
                var self = this;
                this._skillCdRaf = requestAnimationFrame(function () { self.updateSkillCooldowns(); });
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
                var wrap = document.createElement('div');
                wrap.className = 'skill-wrap';
                var fill = document.createElement('div');
                fill.className = 'skill-cd-fill';
                fill.style.height = '0%';
                wrap.appendChild(img);
                wrap.appendChild(fill);
                img.addEventListener('click', function (e) {
                    e.stopPropagation();
                    window.Sherwood.BattleVisuals.useSkill(sid);
                });
                row.appendChild(wrap);
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
        DOM.ensureAvatars();
        DOM.ensureBelt();
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
            if (typeof n === 'number') { S.arrows = n; S.arrowsSynced = true; }
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
        showArrowFlight: function (sprite, camera) { DOM.arrowFlight(sprite, camera); },
        hideArrowFlight: function () { DOM.hideArrowFlight(); },
        playWebmFx: function (name, opts) { DOM.webmFx(name, opts); },
        floatDamageText: function (text, color, target) { DOM.floatDamageNumber(text, color, target); },
        useBeltPotion: function (type) { return DOM.useBeltPotion(type); },
        updateBelt: function () { DOM.updateBelt(); },

        getPlayerAttackCooldown: function () { return S.playerAttackCooldown; },
        getPlayerStunned: function () { return S.playerStunned; },
        getEnemyStunned: function () { return S.enemyStunned; },
        getMobName: function (img) { return Logic.getMobName(img); }
    };
})();

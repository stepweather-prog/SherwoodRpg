/**
 * Sherwood Wave — Режим "Скверная волна"
 * Каждый уникальный враг убивается 5 раз, финальный босс — 1 раз.
  */
if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

Sherwood.Wave = {
    ENEMIES: [
        // --- ЧАЩОБА (по порядку узлов) ---
        'plague_crow.png', 'bog_trapper.png', 'basalt_devourer.png', 'fallen_forester.png', // Глава 1
        'warped_imp.png', 'blight_spitter.png', 'grotto_brute.png', 'blight_alpha_stag.png', // Глава 2
        'bone_borer.png', 'swamp_spider.png', 'cave_watcher.png', 'huntsman_alpha_hound.png', // Глава 3
        'blight_alpha.png', 'ocular_arachnid.png', 'runic_sentinel.png', 'fallen_druid.png', // Глава 4
        'oak_golem.png', 'water_hag.png', 'blight_moss_ogre.png', 'thicket_hunger.png', // Глава 5
        'leshy_servant.png', 'marsh_witch.png', 'warped_worm.png', 'blight_lord_leshy.png', // Глава 6
        'peat_lord.png', 'blight_snail.png', 'grotto_slug.png', 'echo_devourer.png', // Глава 7
        'swamp_drake.png', 'ancient_blight_snail.png', 'underground_terror.png', 'mistress_of_the_mires.png', // Глава 8
        'blight_cerberus.png', 'putrid_wolf.png', 'root_daughter.png', 'rift_warden.png', // Глава 9
        'ripper_wolf.png', 'blight_fox.png', 'bone_arachnid.png', 'the_hive_mother.png', // Глава 10
        'swamp_viper.png', 'necromantic_arachnid.png', 'animated_yew.png', 'the_cursed_outlaw_king.png', // Глава 11
        'oppressor_firefly.png', 'rusty_dread.png', 'chaos_swordsman.png', 'ancient_crypt_warden.png', // Глава 12
        'chaos_harpy.png', 'thorn_moth.png', 'cave_tormentor.png', 'echo_of_the_triumvirate.png', // Глава 13
        'blight_kite.png', 'blind_render.png', 'blight_keeper.png', 'sacred_tree_executioner.png', // Глава 14
        'blight_king.png', 'corruption_raccoon.png', 'lord_of_the_feathered.png', 'sherwood_abomination.png', // Глава 15
        'chaos_knight.png', 'ash_overlord.png', 'underworld_guardian.png', 'the_primordial_core.png', // Глава 16 (секретная)

        // --- ПОДЗЕМКА (уникальные) ---
        'bark_beetle.png', 'armored_beetle.png', 'yew_blight_wolf.png', 'swamp_slugmouth.png',
        'swamp_gorgymouth.png', 'swamp_drowner.png', 'twigtangle.png', 'woodland_terror.png',
        'leshy.png', 'root_executioner.png', 'spectral_stag.png', 'forest_blight_cyclops.png',
        'blight_troglodyte.png', 'blight_oozemouth.png',
        'swamp_centipede.png', 'blight_horn_worm.png', 'searing_arachnid.png',
        'lost_maiden.png', 'bog_witch.png', 'swamp_kikimora.png', 'blight_boletus.png',
        'swamp_vodyanoy.png', 'sherwood_lizard.png',
        'fox_pack_lord.png', 'putrid_rat.png', 'executioner_cricket.png',
        'plague_bat.png', 'ash_stalker.png', 'ash_assassin.png', 'bone_keeper.png',
        'blight_blade.png', 'ash_wraith.png',
        'ancient_watcher.png', 'lost_treasure_hunter.png',
        'shadow_maiden.png', 'cursed_priestess.png', 'mistress_of_the_roots.png',
        'rusty_servant.png', 'tormentor.png', 'grave_archer.png',
        'chaos_lord.png',
        'harpy_witch.png', 'harpy_hatchling.png', 'harpy_chieftain.png'
    ],

    BOSS: 'the_primordial_core.png',
    KILLS_PER_ENEMY: 5,

    MOB_NAMES: {},

    _currentIndex: 0,
    _killCount: 0,
    _killsForCurrent: 0,
    _startTime: 0,
    _isActive: false,
    _uniqueEnemies: [],

    init: function() {
        var seen = {};
        this._uniqueEnemies = [];
        for (var i = 0; i < this.ENEMIES.length; i++) {
            var e = this.ENEMIES[i];
            if (!seen[e]) {
                seen[e] = true;
                this._uniqueEnemies.push(e);
            }
        }
        if (!seen[this.BOSS]) this._uniqueEnemies.push(this.BOSS);
        console.log('🌊 Скверная волна: ' + this._uniqueEnemies.length + ' уникальных врагов.');
    },

    getMobName: function(imgPath) {
        if (!imgPath) return 'Враг';
        var file = imgPath.split('/').pop().replace('.png', '');
        if (this.MOB_NAMES[file]) return this.MOB_NAMES[file];
        if (typeof Sherwood.Dungeon !== 'undefined' && Sherwood.Dungeon.getMobName) {
            try { return Sherwood.Dungeon.getMobName(imgPath); } catch (e) {}
        }
        var words = file.split('_');
        for (var i = 0; i < words.length; i++) {
            words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
        }
        return words.join(' ');
    },

    startWave: function() {
        if (this._uniqueEnemies.length === 0) this.init();

        var self = this;
        this._playIntroVideo(function() {
            self._currentIndex = 0;
            self._killCount = 0;
            self._killsForCurrent = 0;
            self._startTime = Date.now();
            self._isActive = true;
            self._openBattle();
        });
    },

    _playIntroVideo: function(onComplete) {
        var video = document.createElement('video');
        video.src = 'assets/assets2/animation/raid_entrance.webm';
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        var videoStyles = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);object-fit:fill;z-index:99999;background:#000;';
        if (window.innerWidth < 480) { video.style.cssText = videoStyles + 'width:100vw;height:100vh;'; }
        else if (window.innerWidth >= 480 && window.innerHeight <= 800) { video.style.cssText = videoStyles + 'width:480px;height:100vh;'; }
        else { video.style.cssText = videoStyles + 'width:480px;height:800px;'; }

        document.body.appendChild(video);

        var finished = false;
        function finish() {
            if (finished) return;
            finished = true;
            try { video.remove(); } catch(e) {}
            if (onComplete) onComplete();
        }

        video.onended = finish;
        video.onerror = finish;
        setTimeout(finish, 10000);
    },

    getCurrentEnemy: function() {
        if (!this._isActive) return null;
        if (this._currentIndex >= this._uniqueEnemies.length) return null;

        var fileName = this._uniqueEnemies[this._currentIndex];
        var isBoss = (fileName === this.BOSS);

        var path = isBoss ? 'assets/beast_quest/' + fileName : 'assets/all_beasts/' + fileName;

        return {
            name: this.getMobName(fileName),
            imagePath: path,
            isBoss: isBoss,
            hp: 1000 + (this._currentIndex * 300),
            atk: 100 + (this._currentIndex * 25),
            def: 50 + (this._currentIndex * 10)
        };
    },

    onEnemyKilled: function() {
        if (!this._isActive) return;
        this._killCount++;
        this._killsForCurrent++;

        var current = this._uniqueEnemies[this._currentIndex];
        var needed = (current === this.BOSS) ? 1 : this.KILLS_PER_ENEMY;

        if (this._killsForCurrent >= needed) {
            this._killsForCurrent = 0;
            this._currentIndex++;
            if (this._currentIndex >= this._uniqueEnemies.length) {
                this.finishWave();
                return;
            }
        }

        this._loadNext();
    },

    _loadNext: function() {
        var iframe = document.querySelector('iframe[src*="wave_battle"]');
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.postMessage({ type: 'next_enemy' }, '*');
        }
    },

    finishWave: function() {
        this._isActive = false;
        var timeSec = Math.floor((Date.now() - this._startTime) / 1000);
        var mins = Math.floor(timeSec / 60);
        var secs = timeSec % 60;

        var reward = {
            exp: 10000 + this._killCount * 200,
            gold: 5000 + this._killCount * 100,
            silver: 10000 + this._killCount * 200
        };

        Sherwood.addExp(reward.exp);
        Sherwood.addResource('gold', reward.gold);
        Sherwood.addResource('silver', reward.silver);
        Sherwood.saveGame();

        try {
            if (typeof UI !== 'undefined' && UI._showVictoryScreen) {
                UI._afterRewardAction = function() { UI.camp(); };
                UI._showVictoryScreen({ exp: reward.exp, gold: reward.gold, silver: reward.silver, items: [] });
            } else if (typeof UI !== 'undefined' && UI._showToast) {
                UI._showToast('🏆 Волна пройдена! Время: ' + mins + 'м ' + secs + 'с. Убито: ' + this._killCount);
                setTimeout(function() { UI.camp(); }, 2000);
            }
        } catch (e) {
            console.warn('Не удалось показать экран победы:', e);
        }
    },

    abortWave: function() {
        this._isActive = false;
        this._currentIndex = 0;
        this._killCount = 0;
        this._killsForCurrent = 0;
    },

    _openBattle: function() {
        if (typeof UI === 'undefined') return;
        UI._stopMusic();

        var iframe = document.createElement('iframe');
        iframe.src = 'wave_battle.html';
        iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;z-index:100;';
        if (UI._screenLayer) {
            UI._screenLayer.innerHTML = '';
            UI._screenLayer.appendChild(iframe);
            UI._screenLayer.style.display = 'block';
        }
    },

    getElapsedTime: function() {
        if (!this._isActive) return 0;
        return Math.floor((Date.now() - this._startTime) / 1000);
    },

    getKillCount: function() {
        return this._killCount;
    },

    getTotalEnemies: function() {
        return this._uniqueEnemies.length;
    },

    getTotalFights: function() {
        var n = this._uniqueEnemies.length;
        if (n === 0) return 0;
        return (n - 1) * this.KILLS_PER_ENEMY + 1;
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Wave = Sherwood.Wave;

setTimeout(function() { Sherwood.Wave.init(); }, 100);

console.log('🌊 Скверная волна загружена!');

/**
 * Sherwood Wave — Режим "Скверная волна"
 * Все враги по 5 штук, в конце - Изначальный Ужас.
 * Порядок: Чащоба -> Подземка -> Порталы -> Босс.
 */

if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

Sherwood.Wave = {
    // 1. ЧАЩОБА (все 64 узла)
    // 2. ПОДЗЕМКА (уникальные враги)
    // 3. ПОРТАЛЫ (боссы и стражи)
    // 4. ФИНАЛЬНЫЙ БОСС
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
        'blight_troglodyte.png', 'blight_oozemouth.png', 'blight_spitter.png', // Дубль, убираем? Оставляем один раз.
        'bog_trapper.png', 'swamp_centipede.png', 'blight_horn_worm.png', 'searing_arachnid.png',
        'lost_maiden.png', 'bog_witch.png', 'swamp_kikimora.png', 'blight_boletus.png',
        'swamp_vodyanoy.png', 'sherwood_lizard.png', 'blight_cerberus.png', // Дубль
        'blight_fox.png', 'fox_pack_lord.png', 'putrid_rat.png', 'executioner_cricket.png',
        'plague_bat.png', 'ash_stalker.png', 'ash_assassin.png', 'bone_keeper.png',
        'blight_blade.png', 'ash_wraith.png', 'ash_overlord.png', // Дубль
        'basalt_devourer.png', // Дубль
        'grotto_brute.png', // Дубль
        'cave_watcher.png', // Дубль
        'runic_sentinel.png', // Дубль
        'ancient_watcher.png', 'lost_treasure_hunter.png', 'warped_worm.png', // Дубль
        'underground_terror.png', // Дубль
        'shadow_maiden.png', 'cursed_priestess.png', 'mistress_of_the_roots.png', 'necromantic_arachnid.png', // Дубль
        'root_daughter.png', // Дубль
        'animated_yew.png', // Дубль
        'rusty_servant.png', 'tormentor.png', 'grave_archer.png', 'chaos_swordsman.png', // Дубль
        'chaos_knight.png', // Дубль
        'chaos_lord.png', 'blight_kite.png', // Дубль
        'harpy_witch.png', 'harpy_hatchling.png', 'harpy_chieftain.png', 'lord_of_the_feathered.png', // Дубль
        'cave_tormentor.png', // Дубль
        'blight_keeper.png', // Дубль
        'blight_king.png', // Дубль
        'underground_guardian.png', // Дубль
        'corruption_raccoon.png', // Дубль
        'blind_render.png', // Дубль
        'the_cursed_outlaw_king.png', // Дубль
        'ancient_crypt_warden.png', // Дубль
        'echo_of_the_triumvirate.png', // Дубль
        'sacred_tree_executioner.png', // Дубль
        'sherwood_abomination.png', // Дубль
        'the_primordial_core.png' // Дубль
    ],

    // Босс в конце (уже есть в списке, но можно вынести отдельно, если нужно)
    BOSS: 'the_primordial_core.png',

    _currentIndex: 0,
    _killCount: 0,
    _startTime: 0,
    _isActive: false,
    _uniqueEnemies: [],

    // Убираем дубли при инициализации
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
        // Добавляем босса в конец, если его там нет
        if (seen[this.BOSS] === undefined) {
            this._uniqueEnemies.push(this.BOSS);
        }
        console.log('🌊 Скверная волна: ' + this._uniqueEnemies.length + ' уникальных врагов.');
    },

    startWave: function() {
        if (this._uniqueEnemies.length === 0) this.init();
        this._currentIndex = 0;
        this._killCount = 0;
        this._startTime = Date.now();
        this._isActive = true;
        this._openBattle();
    },

    getCurrentEnemy: function() {
        if (!this._isActive) return null;
        if (this._currentIndex >= this._uniqueEnemies.length) return null;
        
        var fileName = this._uniqueEnemies[this._currentIndex];
        var isBoss = (fileName === this.BOSS);
        
        // Определяем путь: если босс - из beast_quest, иначе из all_beasts
        var path = isBoss ? 'assets/beast_quest/' + fileName : 'assets/all_beasts/' + fileName;

        return {
            name: fileName.replace('.png', ''),
            imagePath: path,
            isBoss: isBoss,
            hp: 1000 + (this._currentIndex * 300),
            atk: 100 + (this._currentIndex * 25),
            def: 50 + (this._currentIndex * 10)
        };
    },

    onEnemyKilled: function() {
        this._killCount++;
        this._currentIndex++;

        if (this._currentIndex >= this._uniqueEnemies.length) {
            this.finishWave();
            return;
        }

        // Сигнал в iframe, что нужно загрузить следующего
        if (window.parent && window.parent.Sherwood && window.parent.Sherwood.Wave) {
            window.parent.Sherwood.Wave._loadNext();
        }
    },

    _loadNext: function() {
        // Отправляем сообщение в iframe
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
        
        if (parent.UI && parent.UI._showToast) {
            parent.UI._showToast('🏆 Волна пройдена! Время: ' + mins + 'м ' + secs + 'с. Убито: ' + this._killCount);
        }
        
        setTimeout(function() {
            parent.UI.camp();
        }, 2000);
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
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Wave = Sherwood.Wave;

// Инициализируем при загрузке
setTimeout(function() { Sherwood.Wave.init(); }, 100);

console.log('🌊 Скверная волна загружена!');

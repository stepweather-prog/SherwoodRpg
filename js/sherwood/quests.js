// ============================================================
//  js/sherwood/quests.js — ПОЛНЫЙ РАБОЧИЙ ФАЙЛ
//  Взят из старого SherwoodUI
// ============================================================

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Quests = {
    CHAPTERS: [
        {
            id: 1, name: 'Кровь Великого Дуба',
            stages: 5,
            enemies: [
                { name: 'Чумной Ворон', image: 'plague_crow.png', hp: 1000, atk: 400, def: 200, exp: 30, gold: 15 },
                { name: 'Болотный Капкан', image: 'bog_trapper.png', hp: 1200, atk: 450, def: 250, exp: 32, gold: 16 },
                { name: 'Базальтовый Пожиратель', image: 'basalt_devourer.png', hp: 1500, atk: 500, def: 300, exp: 35, gold: 18 }
            ],
            boss: { name: 'Лесничий-Отступник', image: 'fallen_forester.png', hp: 8000, atk: 800, def: 800, exp: 150, gold: 100 },
            rewards: { exp: 200, gold: 50, silver: 500 },
            lore: 'Шервудский лес веками был щитом для королевства...'
        },
        {
            id: 2, name: 'Кара Скверны',
            stages: 5,
            enemies: [
                { name: 'Искажённый Бес', image: 'warped_imp.png', hp: 4000, atk: 1200, def: 800, exp: 40, gold: 20 },
                { name: 'Скверноплюй', image: 'blight_spitter.png', hp: 4500, atk: 1250, def: 850, exp: 42, gold: 21 },
                { name: 'Громила Грота', image: 'grotto_brute.png', hp: 5000, atk: 1300, def: 900, exp: 45, gold: 22 }
            ],
            boss: { name: 'Вожак Искаженной Стаи', image: 'blight_alpha_stag.png', hp: 35000, atk: 2500, def: 2000, exp: 200, gold: 130 },
            rewards: { exp: 400, gold: 100, silver: 1000 },
            lore: 'Смерть Дуба вызвала цепную реакцию...'
        },
        {
            id: 3, name: 'Старый Егерь',
            stages: 5,
            enemies: [
                { name: 'Костяной Короед-Трупоед', image: 'bone_borer.png', hp: 9000, atk: 2500, def: 1800, exp: 50, gold: 25 },
                { name: 'Болотный Паук', image: 'swamp_spider.png', hp: 9500, atk: 2600, def: 1900, exp: 52, gold: 26 },
                { name: 'Пещерный Наблюдатель', image: 'cave_watcher.png', hp: 10000, atk: 2700, def: 2000, exp: 55, gold: 28 }
            ],
            boss: { name: 'Альфа-Гончая Егеря', image: 'huntsman_alpha_hound.png', hp: 90000, atk: 4500, def: 3500, exp: 250, gold: 160 },
            rewards: { exp: 600, gold: 150, silver: 1500 },
            lore: 'На окраине гибнущего леса, в заброшенном домике егеря...'
        },
        {
            id: 4, name: 'Спуск в Шервудскую Чащобу',
            stages: 5,
            enemies: [
                { name: 'Альфа-Скверноискатель', image: 'blight_alpha.png', hp: 16000, atk: 4000, def: 3000, exp: 60, gold: 30 },
                { name: 'Окулярный Арахнид', image: 'ocular_arachnid.png', hp: 17000, atk: 4100, def: 3100, exp: 62, gold: 31 },
                { name: 'Рунический Страж', image: 'runic_sentinel.png', hp: 18000, atk: 4200, def: 3200, exp: 65, gold: 32 }
            ],
            boss: { name: 'Падший Друид', image: 'fallen_druid.png', hp: 180000, atk: 7000, def: 5500, exp: 300, gold: 200 },
            rewards: { exp: 800, gold: 200, silver: 2000 },
            lore: 'Чтобы остановить расползающееся зло, нужно ударить в его источник...'
        },
        {
            id: 5, name: 'Искажённая Экосистема',
            stages: 5,
            enemies: [
                { name: 'Голем Дуба', image: 'oak_golem.png', hp: 25000, atk: 5500, def: 4200, exp: 70, gold: 35 },
                { name: 'Водная Баба', image: 'water_hag.png', hp: 27000, atk: 5600, def: 4300, exp: 72, gold: 36 },
                { name: 'Огр Скверного Мха', image: 'blight_moss_ogre.png', hp: 29000, atk: 5700, def: 4400, exp: 75, gold: 38 }
            ],
            boss: { name: 'Голод Чащи', image: 'thicket_hunger.png', hp: 300000, atk: 9500, def: 7500, exp: 350, gold: 250 },
            rewards: { exp: 1000, gold: 250, silver: 2500 },
            lore: 'Спуск в сырые туннели чащобы открывает первую волну кошмаров...'
        },
        {
            id: 6, name: 'Слепая Ярость Духов',
            stages: 5,
            enemies: [
                { name: 'Слуга Лешего', image: 'leshy_servant.png', hp: 35000, atk: 7000, def: 5500, exp: 80, gold: 40 },
                { name: 'Болотная Ведунья', image: 'marsh_witch.png', hp: 37000, atk: 7100, def: 5600, exp: 82, gold: 41 },
                { name: 'Искажённый Червь', image: 'warped_worm.png', hp: 39000, atk: 7200, def: 5700, exp: 85, gold: 42 }
            ],
            boss: { name: 'Древний Владыка', image: 'blight_lord_leshy.png', hp: 450000, atk: 12000, def: 9500, exp: 400, gold: 300 },
            rewards: { exp: 1500, gold: 350, silver: 3500 },
            lore: 'Спуск глубже приводит Лучника в каменные залы...'
        },
        {
            id: 7, name: 'Эхо Прошлых Поражений',
            stages: 5,
            enemies: [
                { name: 'Торфяной Владыка', image: 'peat_lord.png', hp: 48000, atk: 8500, def: 6800, exp: 90, gold: 45 },
                { name: 'Улитка Скверны', image: 'blight_snail.png', hp: 50000, atk: 8600, def: 6900, exp: 92, gold: 46 },
                { name: 'Гротный Слизень', image: 'grotto_slug.png', hp: 52000, atk: 8700, def: 7000, exp: 95, gold: 48 }
            ],
            boss: { name: 'Пожиратель Эха', image: 'echo_devourer.png', hp: 650000, atk: 14500, def: 11500, exp: 450, gold: 350 },
            rewards: { exp: 2000, gold: 500, silver: 5000 },
            lore: 'Подземка поглощает не только плоть, но и души...'
        },
        {
            id: 8, name: 'Ужас Болотных Недр',
            stages: 5,
            enemies: [
                { name: 'Болотный Дракончик', image: 'swamp_drake.png', hp: 62000, atk: 10000, def: 8200, exp: 110, gold: 55 },
                { name: 'Древняя Улитка Скверны', image: 'ancient_blight_snail.png', hp: 65000, atk: 10100, def: 8300, exp: 112, gold: 56 },
                { name: 'Подземный Ужас', image: 'underground_terror.png', hp: 68000, atk: 10200, def: 8400, exp: 115, gold: 58 }
            ],
            boss: { name: 'Повелительница Топей', image: 'mistress_of_the_mires.png', hp: 900000, atk: 17000, def: 13500, exp: 500, gold: 400 },
            rewards: { exp: 2500, gold: 650, silver: 6500 },
            lore: 'В самых потайных, покрытых слизью гротах...'
        },
        {
            id: 9, name: 'Разломы Безумия',
            stages: 5,
            enemies: [
                { name: 'Цербер Скверны', image: 'blight_cerberus.png', hp: 78000, atk: 11500, def: 9500, exp: 130, gold: 65 },
                { name: 'Гниющий Волк', image: 'putrid_wolf.png', hp: 81000, atk: 11600, def: 9600, exp: 132, gold: 66 },
                { name: 'Дочь Корней', image: 'root_daughter.png', hp: 84000, atk: 11700, def: 9700, exp: 135, gold: 68 }
            ],
            boss: { name: 'Страж Разломов', image: 'rift_warden.png', hp: 1200000, atk: 19500, def: 15500, exp: 550, gold: 450 },
            rewards: { exp: 3000, gold: 800, silver: 8000 },
            lore: 'Скверна, переполнив чащобу, прожгла ткань реальности...'
        },
        {
            id: 10, name: 'Портал Нашествия — Улей Плоти',
            stages: 5,
            enemies: [
                { name: 'Волк-Потрошитель', image: 'ripper_wolf.png', hp: 95000, atk: 13000, def: 11000, exp: 150, gold: 75 },
                { name: 'Гнилостная Лиса', image: 'blight_fox.png', hp: 98000, atk: 13100, def: 11100, exp: 152, gold: 76 },
                { name: 'Костяной Арахнид', image: 'bone_arachnid.png', hp: 101000, atk: 13200, def: 11200, exp: 155, gold: 78 }
            ],
            boss: { name: 'Матка Лесных Короедов', image: 'the_hive_mother.png', hp: 1600000, atk: 22000, def: 17500, exp: 600, gold: 500 },
            rewards: { exp: 4000, gold: 1000, silver: 10000 },
            lore: 'Первый разлом превратил пещеры в гнездо чумы...'
        },
        {
            id: 11, name: 'Портал Искажения — Костяной Трон',
            stages: 5,
            enemies: [
                { name: 'Болотная Гадюка', image: 'swamp_viper.png', hp: 115000, atk: 14500, def: 12500, exp: 170, gold: 85 },
                { name: 'Арахнид-Некромант', image: 'necromantic_arachnid.png', hp: 118000, atk: 14600, def: 12600, exp: 172, gold: 86 },
                { name: 'Оживший Тис', image: 'animated_yew.png', hp: 121000, atk: 14700, def: 12700, exp: 175, gold: 88 }
            ],
            boss: { name: 'Проклятый Король Разбойников', image: 'the_cursed_outlaw_king.png', hp: 2100000, atk: 24500, def: 19500, exp: 700, gold: 600 },
            rewards: { exp: 5000, gold: 1500, silver: 15000 },
            lore: 'Второй портал перенес Лучника в проклятый склеп...'
        },
        {
            id: 12, name: 'Портал Безумия — Кровоточащий Кап',
            stages: 5,
            enemies: [
                { name: 'Светляк-Угнетатель', image: 'oppressor_firefly.png', hp: 135000, atk: 16000, def: 14000, exp: 190, gold: 95 },
                { name: 'Ржавый Страх', image: 'rusty_dread.png', hp: 138000, atk: 16100, def: 14100, exp: 192, gold: 96 },
                { name: 'Мечник Хаоса', image: 'chaos_swordsman.png', hp: 141000, atk: 16200, def: 14200, exp: 195, gold: 98 }
            ],
            boss: { name: 'Древний Хранитель Склепа', image: 'ancient_crypt_warden.png', hp: 2700000, atk: 27000, def: 21500, exp: 800, gold: 700 },
            rewards: { exp: 6000, gold: 2000, silver: 20000 },
            lore: 'Третий портал вел в хтоническое капище...'
        },
        {
            id: 13, name: 'Триумвират Зла',
            stages: 5,
            enemies: [
                { name: 'Гарпия Хаоса', image: 'chaos_harpy.png', hp: 160000, atk: 17500, def: 15500, exp: 210, gold: 105 },
                { name: 'Терновый Мотыль', image: 'thorn_moth.png', hp: 163000, atk: 17600, def: 15600, exp: 212, gold: 106 },
                { name: 'Пещерный Терзатель', image: 'cave_tormentor.png', hp: 166000, atk: 17700, def: 15700, exp: 215, gold: 108 }
            ],
            boss: { name: 'Эхо Трех Порталов', image: 'echo_of_the_triumvirate.png', hp: 3400000, atk: 29500, def: 23500, exp: 900, gold: 800 },
            rewards: { exp: 7500, gold: 2500, silver: 25000 },
            lore: 'Закрыв три разлома, Лучник думал, что победил...'
        },
        {
            id: 14, name: 'Сломанная Печать',
            stages: 5,
            enemies: [
                { name: 'Коршун Скверны', image: 'blight_kite.png', hp: 185000, atk: 19000, def: 17000, exp: 230, gold: 115 },
                { name: 'Слепой Терзатель', image: 'blind_render.png', hp: 188000, atk: 19100, def: 17100, exp: 232, gold: 116 },
                { name: 'Хранитель Скверны', image: 'blight_keeper.png', hp: 191000, atk: 19200, def: 17200, exp: 235, gold: 118 }
            ],
            boss: { name: 'Палач Священного Древа', image: 'sacred_tree_executioner.png', hp: 4200000, atk: 32000, def: 25500, exp: 1000, gold: 900 },
            rewards: { exp: 9000, gold: 3000, silver: 30000 },
            lore: 'Слияние энергий Порталов пробудило кое-что древнее...'
        },
        {
            id: 15, name: 'Последний Выстрел',
            stages: 5,
            enemies: [
                { name: 'Скверный Король', image: 'blight_king.png', hp: 210000, atk: 20500, def: 18500, exp: 260, gold: 130 },
                { name: 'Енот Порчи', image: 'corruption_raccoon.png', hp: 213000, atk: 20600, def: 18600, exp: 262, gold: 131 },
                { name: 'Хозяин Пернатых', image: 'lord_of_the_feathered.png', hp: 216000, atk: 20700, def: 18700, exp: 265, gold: 132 }
            ],
            boss: { name: 'Шервудское Отродье', image: 'sherwood_abomination.png', hp: 5200000, atk: 34500, def: 27500, exp: 1500, gold: 1200 },
            rewards: { exp: 12000, gold: 5000, silver: 50000 },
            lore: 'Поглотив энергию мертвого Палача, Оскверненное Сердце пробудилось...'
        },
        {
            id: 16, name: 'Шрам, который не заживёт (Секретная глава)',
            stages: 5,
            enemies: [
                { name: 'Рыцарь Хаоса', image: 'chaos_knight.png', hp: 240000, atk: 22000, def: 20000, exp: 200, gold: 50 },
                { name: 'Владыка Пепла', image: 'ash_overlord.png', hp: 245000, atk: 22200, def: 20200, exp: 210, gold: 55 },
                { name: 'Страж Преисподней', image: 'underworld_guardian.png', hp: 250000, atk: 22400, def: 20400, exp: 220, gold: 60 }
            ],
            boss: { name: 'Изначальный Стержень', image: 'the_primordial_core.png', hp: 1500000, atk: 30000, def: 25000, exp: 1000, gold: 300 },
            rewards: { exp: 2000, gold: 500, silver: 1500 },
            isSecret: true,
            lore: 'После победы над Отродьем на поверхности леса зияет огромная воронка...'
        }
    ],

    _currentQuest: null,
    _currentEnemy: null,
    _currentStage: 0,
    _inBattle: false,
    _battleLog: [],
    _battleOverlay: null,

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.questProgress) p.questProgress = { completed: [], currentChapter: 1 };
        console.log('📋 Квесты инициализированы');
    },

    getChapter: function(id) {
        for (var i = 0; i < this.CHAPTERS.length; i++) {
            if (this.CHAPTERS[i].id === id) return this.CHAPTERS[i];
        }
        return null;
    },

    getAllChapters: function() { return this.CHAPTERS; },
    getProgress: function() {
        var p = Sherwood.getPlayer();
        return p ? p.questProgress : { completed: [], currentChapter: 1 };
    },
    getBattle: function() {
        if (!this._inBattle || !this._currentEnemy) return null;
        return { chapter: this._currentQuest, enemy: this._currentEnemy, stage: this._currentStage + 1, total: this._currentQuest ? this._currentQuest.stages : 5 };
    },
    isOnCooldown: function() { return false; },
    getCooldownRemaining: function() { return 0; },

    startChapter: function(id) {
        var ch = this.getChapter(id);
        if (!ch) return { success: false, reason: 'Глава не найдена' };
        var p = Sherwood.getPlayer();
        if (p.questProgress.completed.indexOf(id) !== -1) {
            return { success: false, reason: 'Глава уже пройдена' };
        }
        this._currentQuest = ch;
        this._currentStage = 0;
        this._inBattle = true;
        this._currentEnemy = JSON.parse(JSON.stringify(ch.enemies[0]));
        this._battleLog = [];
        return { success: true, chapter: ch, enemy: this._currentEnemy, stage: 1, total: ch.stages };
    },

    attack: function() {
        if (!this._inBattle || !this._currentEnemy) return { error: 'Нет активного боя' };
        var p = Sherwood.getPlayer();
        var enemy = this._currentEnemy;
        var ch = this._currentQuest;
        var dmg = Math.max(1, p.stats.attack - enemy.def + Math.floor(Math.random() * 20));
        var crit = Math.random() * 100 < 15;
        if (crit) dmg = Math.floor(dmg * 1.8);
        enemy.hp -= dmg;
        if (enemy.hp < 0) enemy.hp = 0;
        var result = { damage: dmg, crit: crit, enemyHp: enemy.hp, enemyMaxHp: enemy.maxHp, enemyName: enemy.name, enemyDead: enemy.hp <= 0 };
        if (enemy.hp <= 0) {
            this._currentStage++;
            if (this._currentStage >= ch.stages) {
                p.questProgress.completed.push(ch.id);
                p.questProgress.currentChapter = ch.id + 1;
                Sherwood.saveGame();
                Sherwood.addExp(ch.rewards.exp);
                Sherwood.addResource('gold', ch.rewards.gold);
                Sherwood.addResource('silver', ch.rewards.silver);
                this._inBattle = false;
                result.chapterComplete = true;
                result.rewards = ch.rewards;
                return result;
            }
            if (this._currentStage === ch.stages - 1) {
                this._currentEnemy = JSON.parse(JSON.stringify(ch.boss));
                result.nextEnemy = this._currentEnemy;
                result.isBoss = true;
            } else {
                var nextEnemy = JSON.parse(JSON.stringify(ch.enemies[this._currentStage]));
                var mult = 1 + (this._currentStage * 0.2);
                nextEnemy.hp = Math.floor(nextEnemy.hp * mult);
                nextEnemy.atk = Math.floor(nextEnemy.atk * mult);
                nextEnemy.def = Math.floor(nextEnemy.def * mult);
                this._currentEnemy = nextEnemy;
                result.nextEnemy = nextEnemy;
            }
            result.enemyDead = true;
            result.stageComplete = true;
            return result;
        }
        var edmg = Math.max(1, enemy.atk - p.stats.defense + Math.floor(Math.random() * 15));
        p.stats.hp = Math.max(0, p.stats.hp - edmg);
        result.enemyDamage = edmg;
        result.playerHp = p.stats.hp;
        if (p.stats.hp <= 0) {
            this._inBattle = false;
            result.playerDead = true;
            p.stats.hp = 1;
            Sherwood.saveGame();
            return result;
        }
        Sherwood.saveGame();
        return result;
    },

    flee: function() {
        this._inBattle = false;
        this._currentEnemy = null;
        this._currentQuest = null;
        return { success: true };
    },

    // ========== UI ==========

    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Квесты', '📋');
            }
            return;
        }
        UI._playSound('click');
        var prog = this.getProgress();
        var currentChapter = prog.currentChapter || 1;
        var ch = this.getChapter(currentChapter);
        if (!ch) { UI._showPlaceholder('Квесты', 'quests'); return; }

        var completed = prog.completed && prog.completed.indexOf(ch.id) !== -1;
        var isActive = this._inBattle && this._currentQuest && this._currentQuest.id === ch.id;

        var displayEnemy, displayImage, isBossStage = false;
        if (completed) {
            displayEnemy = ch.boss;
            displayImage = 'assets/beast_quest/' + ch.boss.image;
            isBossStage = true;
        } else if (isActive && this._currentEnemy) {
            displayEnemy = this._currentEnemy;
            displayImage = 'assets/all_beasts/' + displayEnemy.image;
            if (this._currentStage >= ch.stages - 1) {
                displayImage = 'assets/beast_quest/' + ch.boss.image;
                isBossStage = true;
            }
        } else {
            displayEnemy = ch.enemies[0];
            displayImage = 'assets/all_beasts/' + ch.enemies[0].image;
        }
        var cardImg = isBossStage ? 'assets/interface/quest_boss.png' : 'assets/interface/quest_regular.png';

        var h = '<div style="text-align:center;">';
        h += '<div style="color:#e0c080;font-size:1.1em;font-weight:bold;margin-bottom:4px;">Глава ' + ch.id + ' — ' + ch.name + '</div>';
        h += '<div style="color:#fff;font-size:1em;font-weight:bold;margin-bottom:4px;">' + displayEnemy.name + '</div>';
        h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:20px;">HP ' + displayEnemy.hp + ' | АТК ' + (displayEnemy.atk || 0) + ' | ЗЩТ ' + (displayEnemy.def || 0) + '</div>';
        h += '<div style="position:relative;display:block;width:360px;height:360px;margin:0 auto 24px;"><img src="' + cardImg + '" style="width:360px;height:360px;object-fit:contain;position:absolute;top:0;left:0;"><img src="' + displayImage + '" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:210px;height:210px;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'"></div>';

        if (completed) {
            h += '<div style="color:#4caf50;font-size:1em;font-weight:bold;">✅ Пройдено</div>';
        } else if (isActive) {
            h += '<div style="color:#ffa500;font-size:0.9em;margin-bottom:8px;">⚔️ Этап ' + (this._currentStage + 1) + '/' + ch.stages + '</div>';
            h += '<button onclick="Sherwood.Quests._showQuestBattle()" style="background:#c9a040;border:none;border-radius:8px;padding:12px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">⚔️ В бой</button>';
        } else {
            h += '<button onclick="Sherwood.Quests._startQuest(' + ch.id + ')" style="background:#c9a040;border:none;border-radius:8px;padding:12px 30px;color:#000;font-weight:bold;cursor:pointer;font-size:0.9em;">⚔️ Начать главу</button>';
        }
        h += '<div style="margin-top:8px;color:#888;font-size:0.7em;">🏆 Награда: +' + ch.rewards.exp + ' опыта, +' + ch.rewards.gold + ' золота</div>';
        h += '</div>';
        UI._openScreenScrollable('Квесты', 'quests', h);
    },

    _startQuest: function(id) {
        var r = this.startChapter(id);
        if (!r.success) { UI._showToast(r.reason || 'Ошибка'); this.showUI(); return; }
        this._showQuestBattle();
    },

    _showQuestBattle: function() {
        if (!this._inBattle || !this._currentEnemy) { this.showUI(); return; }
        var b = this.getBattle();
        if (!b) return;
        var ch = this._currentQuest;
        var enemy = this._currentEnemy;
        UI._showBattleScreen({
            name: enemy.name,
            image: 'assets/all_beasts/' + (enemy.image || 'plague_crow.png'),
            hp: enemy.hp,
            maxHp: enemy.maxHp || enemy.hp,
            attack: enemy.atk || 0,
            defense: enemy.def || 0
        }, 'quest', ch.name + ' — Этап ' + b.stage + '/' + b.total, '', 'Sherwood.Quests._questAttack()', 'Sherwood.Quests._questFlee()');
    },

    _questAttack: function() {
        UI._playHitSounds();
        var result = this.attack();
        if (result.error) { UI._showDialog(result.error, '#ff9800'); return; }
        if (result.chapterComplete) {
            UI._showDialog('🏆 Глава пройдена!', '#ffd700');
            UI._playSound('victory');
            UI._stopMusic();
            UI._pendingRewards = result.rewards;
            UI._afterRewardAction = function() {
                UI._playMusic('main_theme');
                Sherwood.Quests.showUI();
            };
            UI._showVictoryScreen(UI._pendingRewards);
            return;
        }
        if (result.playerDead) {
            UI._showDialog('💀 Поражение...', '#f44336');
            UI._playSound('defeat');
            UI._stopMusic();
            UI._pendingRewards = { exp: 10, silver: 50 };
            UI._afterRewardAction = function() { Sherwood.Quests.showUI(); };
            UI._showDefeatScreen(UI._pendingRewards);
            return;
        }
        if (result.enemyDead) {
            UI._showDialog('✅ Враг повержен!', '#4caf50');
            UI._updateEnemyHP(0, result.enemyMaxHp || 100);
            if (result.stageComplete) UI._playSound('victory');
            var self = this;
            setTimeout(function() { self._showQuestBattle(); }, 1000);
            return;
        }
        UI._hitEnemyCard();
        UI._updateEnemyHP(result.enemyHp, result.enemyMaxHp);
        UI._showDialog((result.crit ? '💥 КРИТ! ' : '') + 'Урон: ' + result.damage, result.crit ? '#ff6a00' : '#fff');
        if (result.enemyDamage) {
            var self = this;
            setTimeout(function() {
                UI._showDialog('💢 Враг нанёс ' + result.enemyDamage + ' урона', '#f44336');
                UI.updateDisplay();
            }, 700);
        }
        var self = this;
        setTimeout(function() { self._showQuestBattle(); }, 1200);
    },

    _questFlee: function() {
        this.flee();
        UI._stopMusic();
        this.showUI();
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Quests = Sherwood.Quests;

console.log('📋 Квесты загружены!');

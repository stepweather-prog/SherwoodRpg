/**
 * Sherwood Thicket — Шервудская чащоба
 * Квестовая тропа: 65 узлов, 3 сложности, кубки как в подземке
 */

if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

Sherwood.Thicket = {

    // ============================================================
    //  ДАННЫЕ УЗЛОВ — 65 штук
    // ============================================================
    NODES: [
        // ========== ГЛАВА 1: Кровь Великого Дуба ==========
        { id: 1,  chapter: 1, chapterName: 'Кровь Великого Дуба', name: 'Чумной Ворон',            image: 'plague_crow.png',        imageDir: 'all_beasts',   hp: 1000,  atk: 400,   def: 200,  exp: 30,  gold: 25,  isBoss: false },
        { id: 2,  chapter: 1, chapterName: 'Кровь Великого Дуба', name: 'Болотный Капкан',         image: 'bog_trapper.png',        imageDir: 'all_beasts',   hp: 1200,  atk: 450,   def: 250,  exp: 32,  gold: 60,  isBoss: false },
        { id: 3,  chapter: 1, chapterName: 'Кровь Великого Дуба', name: 'Базальтовый Пожиратель',  image: 'basalt_devourer.png',    imageDir: 'all_beasts',   hp: 1500,  atk: 500,   def: 300,  exp: 35,  gold: 80,  isBoss: false },
        { id: 4,  chapter: 1, chapterName: 'Кровь Великого Дуба', name: 'Лесничий-Отступник',      image: 'fallen_forester.png',    imageDir: 'beast_quest',  hp: 4000,  atk: 800,   def: 800,  exp: 150, gold: 100, isBoss: true },

        // ========== ГЛАВА 2: Кара Скверны ==========
        { id: 5,  chapter: 2, chapterName: 'Кара Скверны', name: 'Искажённый Бес',         image: 'warped_imp.png',          imageDir: 'all_beasts',   hp: 4000,  atk: 1200,  def: 800,  exp: 40,  gold: 200, isBoss: false },
        { id: 6,  chapter: 2, chapterName: 'Кара Скверны', name: 'Скверноплюй',            image: 'blight_spitter.png',      imageDir: 'all_beasts',   hp: 4500,  atk: 1250,  def: 850,  exp: 42,  gold: 200, isBoss: false },
        { id: 7,  chapter: 2, chapterName: 'Кара Скверны', name: 'Громила Грота',          image: 'grotto_brute.png',        imageDir: 'all_beasts',   hp: 5000,  atk: 1300,  def: 900,  exp: 45,  gold: 200, isBoss: false },
        { id: 8,  chapter: 2, chapterName: 'Кара Скверны', name: 'Вожак Искаженной Стаи',  image: 'blight_alpha_stag.png',   imageDir: 'beast_quest',  hp: 8000,  atk: 2500,  def: 2000, exp: 200, gold: 230, isBoss: true },

        // ========== ГЛАВА 3: Старый Егерь ==========
        { id: 9,  chapter: 3, chapterName: 'Старый Егерь', name: 'Костяной Короед-Трупоед', image: 'bone_borer.png',          imageDir: 'all_beasts',   hp: 9000,  atk: 2500,  def: 1800, exp: 50,  gold: 25,  isBoss: false },
        { id: 10, chapter: 3, chapterName: 'Старый Егерь', name: 'Болотный Паук',           image: 'swamp_spider.png',        imageDir: 'all_beasts',   hp: 9500,  atk: 2600,  def: 1900, exp: 52,  gold: 26,  isBoss: false },
        { id: 11, chapter: 3, chapterName: 'Старый Егерь', name: 'Пещерный Наблюдатель',    image: 'cave_watcher.png',        imageDir: 'all_beasts',   hp: 10000, atk: 2700,  def: 2000, exp: 55,  gold: 28,  isBoss: false },
        { id: 12, chapter: 3, chapterName: 'Старый Егерь', name: 'Альфа-Гончая Егеря',      image: 'huntsman_alpha_hound.png',imageDir: 'beast_quest',  hp: 11000, atk: 4500,  def: 3500, exp: 250, gold: 160, isBoss: true },

        // ========== ГЛАВА 4: Спуск в Шервудскую Чащобу ==========
        { id: 13, chapter: 4, chapterName: 'Спуск в Шервудскую Чащобу', name: 'Альфа-Скверноискатель', image: 'blight_alpha.png',       imageDir: 'all_beasts',  hp: 16000, atk: 4000,  def: 3000, exp: 60,  gold: 30,  isBoss: false },
        { id: 14, chapter: 4, chapterName: 'Спуск в Шервудскую Чащобу', name: 'Окулярный Арахнид',     image: 'ocular_arachnid.png',    imageDir: 'all_beasts',  hp: 17000, atk: 4100,  def: 3100, exp: 62,  gold: 31,  isBoss: false },
        { id: 15, chapter: 4, chapterName: 'Спуск в Шервудскую Чащобу', name: 'Рунический Страж',      image: 'runic_sentinel.png',     imageDir: 'all_beasts',  hp: 18000, atk: 4200,  def: 3200, exp: 65,  gold: 32,  isBoss: false },
        { id: 16, chapter: 4, chapterName: 'Спуск в Шервудскую Чащобу', name: 'Падший Друид',          image: 'fallen_druid.png',       imageDir: 'beast_quest', hp: 20000, atk: 7000,  def: 5500, exp: 300, gold: 200, isBoss: true },

        // ========== ГЛАВА 5: Искажённая Экосистема ==========
        { id: 17, chapter: 5, chapterName: 'Искажённая Экосистема', name: 'Голем Дуба',           image: 'oak_golem.png',          imageDir: 'all_beasts',   hp: 25000, atk: 5500,  def: 4200, exp: 70,  gold: 35,  isBoss: false },
        { id: 18, chapter: 5, chapterName: 'Искажённая Экосистема', name: 'Водная Баба',          image: 'water_hag.png',          imageDir: 'all_beasts',   hp: 27000, atk: 5600,  def: 4300, exp: 72,  gold: 36,  isBoss: false },
        { id: 19, chapter: 5, chapterName: 'Искажённая Экосистема', name: 'Огр Скверного Мха',    image: 'blight_moss_ogre.png',   imageDir: 'all_beasts',   hp: 29000, atk: 5700,  def: 4400, exp: 75,  gold: 38,  isBoss: false },
        { id: 20, chapter: 5, chapterName: 'Искажённая Экосистема', name: 'Голод Чащи',           image: 'thicket_hunger.png',     imageDir: 'beast_quest',  hp: 30000, atk: 9500,  def: 7500, exp: 350, gold: 250, isBoss: true },

        // ========== ГЛАВА 6: Слепая Ярость Духов ==========
        { id: 21, chapter: 6, chapterName: 'Слепая Ярость Духов', name: 'Слуга Лешего',       image: 'leshy_servant.png',      imageDir: 'all_beasts',   hp: 35000, atk: 7000,  def: 5500, exp: 80,  gold: 40,  isBoss: false },
        { id: 22, chapter: 6, chapterName: 'Слепая Ярость Духов', name: 'Болотная Ведунья',   image: 'marsh_witch.png',        imageDir: 'all_beasts',   hp: 37000, atk: 7100,  def: 5600, exp: 82,  gold: 41,  isBoss: false },
        { id: 23, chapter: 6, chapterName: 'Слепая Ярость Духов', name: 'Искажённый Червь',   image: 'warped_worm.png',        imageDir: 'all_beasts',   hp: 39000, atk: 7200,  def: 5700, exp: 85,  gold: 42,  isBoss: false },
        { id: 24, chapter: 6, chapterName: 'Слепая Ярость Духов', name: 'Древний Владыка',    image: 'blight_lord_leshy.png',  imageDir: 'beast_quest',  hp: 45000, atk: 12000, def: 9500, exp: 400, gold: 300, isBoss: true },

        // ========== ГЛАВА 7: Эхо Прошлых Поражений ==========
        { id: 25, chapter: 7, chapterName: 'Эхо Прошлых Поражений', name: 'Торфяной Владыка',  image: 'peat_lord.png',          imageDir: 'all_beasts',   hp: 48000, atk: 8500,  def: 6800, exp: 90,  gold: 45,  isBoss: false },
        { id: 26, chapter: 7, chapterName: 'Эхо Прошлых Поражений', name: 'Улитка Скверны',    image: 'blight_snail.png',       imageDir: 'all_beasts',   hp: 50000, atk: 8600,  def: 6900, exp: 92,  gold: 46,  isBoss: false },
        { id: 27, chapter: 7, chapterName: 'Эхо Прошлых Поражений', name: 'Гротный Слизень',   image: 'grotto_slug.png',        imageDir: 'all_beasts',   hp: 52000, atk: 8700,  def: 7000, exp: 95,  gold: 48,  isBoss: false },
        { id: 28, chapter: 7, chapterName: 'Эхо Прошлых Поражений', name: 'Пожиратель Эха',    image: 'echo_devourer.png',      imageDir: 'beast_quest',  hp: 65000, atk: 14500, def: 11500,exp: 450, gold: 350, isBoss: true },

        // ========== ГЛАВА 8: Ужас Болотных Недр ==========
        { id: 29, chapter: 8, chapterName: 'Ужас Болотных Недр', name: 'Болотный Дракончик',    image: 'swamp_drake.png',           imageDir: 'all_beasts',   hp: 62000, atk: 10000, def: 8200, exp: 110, gold: 55,  isBoss: false },
        { id: 30, chapter: 8, chapterName: 'Ужас Болотных Недр', name: 'Древняя Улитка Скверны',image: 'ancient_blight_snail.png',  imageDir: 'all_beasts',   hp: 65000, atk: 10100, def: 8300, exp: 112, gold: 56,  isBoss: false },
        { id: 31, chapter: 8, chapterName: 'Ужас Болотных Недр', name: 'Подземный Ужас',        image: 'underground_terror.png',    imageDir: 'all_beasts',   hp: 68000, atk: 10200, def: 8400, exp: 115, gold: 58,  isBoss: false },
        { id: 32, chapter: 8, chapterName: 'Ужас Болотных Недр', name: 'Повелительница Топей',  image: 'mistress_of_the_mires.png', imageDir: 'beast_quest',  hp: 90000, atk: 17000, def: 13500,exp: 500, gold: 400, isBoss: true },

        // ========== ГЛАВА 9: Разломы Безумия ==========
        { id: 33, chapter: 9, chapterName: 'Разломы Безумия', name: 'Цербер Скверны',   image: 'blight_cerberus.png',   imageDir: 'all_beasts',   hp: 78000, atk: 11500, def: 9500,  exp: 130, gold: 65,  isBoss: false },
        { id: 34, chapter: 9, chapterName: 'Разломы Безумия', name: 'Гниющий Волк',     image: 'putrid_wolf.png',       imageDir: 'all_beasts',   hp: 81000, atk: 11600, def: 9600,  exp: 132, gold: 66,  isBoss: false },
        { id: 35, chapter: 9, chapterName: 'Разломы Безумия', name: 'Дочь Корней',      image: 'root_daughter.png',     imageDir: 'all_beasts',   hp: 84000, atk: 11700, def: 9700,  exp: 135, gold: 68,  isBoss: false },
        { id: 36, chapter: 9, chapterName: 'Разломы Безумия', name: 'Страж Разломов',   image: 'rift_warden.png',       imageDir: 'beast_quest',  hp: 120000,atk: 19500, def: 15500, exp: 550, gold: 450, isBoss: true },

        // ========== ГЛАВА 10: Портал Нашествия — Улей Плоти ==========
        { id: 37, chapter: 10, chapterName: 'Портал Нашествия — Улей Плоти', name: 'Волк-Потрошитель', image: 'ripper_wolf.png',    imageDir: 'all_beasts',  hp: 95000, atk: 13000, def: 11000, exp: 150, gold: 75,  isBoss: false },
        { id: 38, chapter: 10, chapterName: 'Портал Нашествия — Улей Плоти', name: 'Гнилостная Лиса',  image: 'blight_fox.png',     imageDir: 'all_beasts',  hp: 98000, atk: 13100, def: 11100, exp: 152, gold: 76,  isBoss: false },
        { id: 39, chapter: 10, chapterName: 'Портал Нашествия — Улей Плоти', name: 'Костяной Арахнид', image: 'bone_arachnid.png',  imageDir: 'all_beasts',  hp: 101000,atk: 13200, def: 11200, exp: 155, gold: 78,  isBoss: false },
        { id: 40, chapter: 10, chapterName: 'Портал Нашествия — Улей Плоти', name: 'Матка Лесных Короедов', image: 'the_hive_mother.png', imageDir: 'beast_quest', hp: 160000, atk: 22000, def: 17500, exp: 600, gold: 500, isBoss: true },

        // ========== ГЛАВА 11: Портал Искажения — Костяной Трон ==========
        { id: 41, chapter: 11, chapterName: 'Портал Искажения — Костяной Трон', name: 'Болотная Гадюка',         image: 'swamp_viper.png',              imageDir: 'all_beasts',  hp: 115000,atk: 14500, def: 12500, exp: 170, gold: 85,  isBoss: false },
        { id: 42, chapter: 11, chapterName: 'Портал Искажения — Костяной Трон', name: 'Арахнид-Некромант',       image: 'necromantic_arachnid.png',     imageDir: 'all_beasts',  hp: 118000,atk: 14600, def: 12600, exp: 172, gold: 86,  isBoss: false },
        { id: 43, chapter: 11, chapterName: 'Портал Искажения — Костяной Трон', name: 'Оживший Тис',             image: 'animated_yew.png',             imageDir: 'all_beasts',  hp: 121000,atk: 14700, def: 12700, exp: 175, gold: 88,  isBoss: false },
        { id: 44, chapter: 11, chapterName: 'Портал Искажения — Костяной Трон', name: 'Проклятый Король Разбойников', image: 'the_cursed_outlaw_king.png', imageDir: 'beast_quest', hp: 210000, atk: 24500, def: 19500, exp: 700, gold: 600, isBoss: true },

        // ========== ГЛАВА 12: Портал Безумия — Кровоточащий Кап ==========
        { id: 45, chapter: 12, chapterName: 'Портал Безумия — Кровоточащий Кап', name: 'Светляк-Угнетатель', image: 'oppressor_firefly.png',   imageDir: 'all_beasts',  hp: 135000,atk: 16000, def: 14000, exp: 190, gold: 95,  isBoss: false },
        { id: 46, chapter: 12, chapterName: 'Портал Безумия — Кровоточащий Кап', name: 'Ржавый Страх',       image: 'rusty_dread.png',         imageDir: 'all_beasts',  hp: 138000,atk: 16100, def: 14100, exp: 192, gold: 96,  isBoss: false },
        { id: 47, chapter: 12, chapterName: 'Портал Безумия — Кровоточащий Кап', name: 'Мечник Хаоса',       image: 'chaos_swordsman.png',     imageDir: 'all_beasts',  hp: 141000,atk: 16200, def: 14200, exp: 195, gold: 98,  isBoss: false },
        { id: 48, chapter: 12, chapterName: 'Портал Безумия — Кровоточащий Кап', name: 'Древний Хранитель Склепа', image: 'ancient_crypt_warden.png', imageDir: 'beast_quest', hp: 270000, atk: 27000, def: 21500, exp: 800, gold: 700, isBoss: true },

        // ========== ГЛАВА 13: Триумвират Зла ==========
        { id: 49, chapter: 13, chapterName: 'Триумвират Зла', name: 'Гарпия Хаоса',       image: 'chaos_harpy.png',              imageDir: 'all_beasts',  hp: 160000,atk: 17500, def: 15500, exp: 210, gold: 105, isBoss: false },
        { id: 50, chapter: 13, chapterName: 'Триумвират Зла', name: 'Терновый Мотыль',    image: 'thorn_moth.png',               imageDir: 'all_beasts',  hp: 163000,atk: 17600, def: 15600, exp: 212, gold: 106, isBoss: false },
        { id: 51, chapter: 13, chapterName: 'Триумвират Зла', name: 'Пещерный Терзатель', image: 'cave_tormentor.png',           imageDir: 'all_beasts',  hp: 166000,atk: 17700, def: 15700, exp: 215, gold: 108, isBoss: false },
        { id: 52, chapter: 13, chapterName: 'Триумвират Зла', name: 'Эхо Трех Порталов',  image: 'echo_of_the_triumvirate.png',  imageDir: 'beast_quest', hp: 340000, atk: 29500, def: 23500, exp: 900, gold: 800, isBoss: true },

        // ========== ГЛАВА 14: Сломанная Печать ==========
        { id: 53, chapter: 14, chapterName: 'Сломанная Печать', name: 'Коршун Скверны',     image: 'blight_kite.png',          imageDir: 'all_beasts',  hp: 185000,atk: 19000, def: 17000, exp: 230, gold: 115, isBoss: false },
        { id: 54, chapter: 14, chapterName: 'Сломанная Печать', name: 'Слепой Терзатель',   image: 'blind_render.png',         imageDir: 'all_beasts',  hp: 188000,atk: 19100, def: 17100, exp: 232, gold: 116, isBoss: false },
        { id: 55, chapter: 14, chapterName: 'Сломанная Печать', name: 'Хранитель Скверны',  image: 'blight_keeper.png',        imageDir: 'all_beasts',  hp: 191000,atk: 19200, def: 17200, exp: 235, gold: 118, isBoss: false },
        { id: 56, chapter: 14, chapterName: 'Сломанная Печать', name: 'Палач Священного Древа', image: 'sacred_tree_executioner.png', imageDir: 'beast_quest', hp: 420000, atk: 32000, def: 25500, exp: 1000, gold: 900, isBoss: true },

        // ========== ГЛАВА 15: Последний Выстрел ==========
        { id: 57, chapter: 15, chapterName: 'Последний Выстрел', name: 'Скверный Король',     image: 'blight_king.png',          imageDir: 'all_beasts',  hp: 210000,atk: 20500, def: 18500, exp: 260, gold: 130, isBoss: false },
        { id: 58, chapter: 15, chapterName: 'Последний Выстрел', name: 'Енот Порчи',          image: 'corruption_raccoon.png',   imageDir: 'all_beasts',  hp: 213000,atk: 20600, def: 18600, exp: 262, gold: 131, isBoss: false },
        { id: 59, chapter: 15, chapterName: 'Последний Выстрел', name: 'Хозяин Пернатых',     image: 'lord_of_the_feathered.png',imageDir: 'all_beasts',  hp: 216000,atk: 20700, def: 18700, exp: 265, gold: 132, isBoss: false },
        { id: 60, chapter: 15, chapterName: 'Последний Выстрел', name: 'Шервудское Отродье',  image: 'sherwood_abomination.png', imageDir: 'beast_quest', hp: 520000, atk: 34500, def: 27500, exp: 1500, gold: 1200, isBoss: true },

        // ========== ГЛАВА 16: Шрам, который не заживёт (Секретная) ==========
        { id: 61, chapter: 16, chapterName: 'Шрам, который не заживёт', name: 'Рыцарь Хаоса',         image: 'chaos_knight.png',         imageDir: 'all_beasts',  hp: 240000,atk: 22000, def: 20000, exp: 200, gold: 50,  isBoss: false },
        { id: 62, chapter: 16, chapterName: 'Шрам, который не заживёт', name: 'Владыка Пепла',        image: 'ash_overlord.png',         imageDir: 'all_beasts',  hp: 245000,atk: 22200, def: 20200, exp: 210, gold: 55,  isBoss: false },
        { id: 63, chapter: 16, chapterName: 'Шрам, который не заживёт', name: 'Страж Преисподней',    image: 'underworld_guardian.png',  imageDir: 'all_beasts',  hp: 250000,atk: 22400, def: 20400, exp: 220, gold: 60,  isBoss: false },
        { id: 64, chapter: 16, chapterName: 'Шрам, который не заживёт', name: 'Изначальный Стержень', image: 'the_primordial_core.png',  imageDir: 'beast_quest', hp: 560000,atk: 36000, def: 29000, exp: 1600, gold: 1300, isBoss: true },

        // ========== РЕЙД-БОСС (финальный узел) ==========
        { id: 65, chapter: 0, chapterName: 'Рейд', name: 'Изначальный Ужас', image: 'original_horror.png', imageDir: 'beast_quest', hp: 580000, atk: 38000, def: 30000, exp: 20000, gold: 15000, isBoss: true, isRaidBoss: true }
    ],

    // Множители сложности: [лёгкая, средняя, сложная]
    DIFF_MULT: [1.0, 1.5, 2.2],
    DIFF_NAMES: ['Лёгкая', 'Средняя', 'Сложная'],

    // ============================================================
    //  СОСТОЯНИЕ
    // ============================================================
    _currentNode: null,
    _currentDiff: 1,
    _inBattle: false,

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================
    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.thicket) {
            p.thicket = {
                cupsByNode: {},      // { nodeId: 0..3 }
                lastViewedNode: 1
            };
        }
        console.log('🌲 Шервудская чащоба инициализирована. Узлов:', this.NODES.length);
    },

    // ============================================================
    //  ДОСТУП К ДАННЫМ
    // ============================================================
    getNode: function(nodeId) {
        for (var i = 0; i < this.NODES.length; i++) {
            if (this.NODES[i].id === nodeId) return this.NODES[i];
        }
        return null;
    },

    getProgress: function() {
        var p = Sherwood.getPlayer();
        if (!p) return { cupsByNode: {}, lastViewedNode: 1 };
        if (!p.thicket) {
            p.thicket = { cupsByNode: {}, lastViewedNode: 1 };
        }
        return p.thicket;
    },

    getCups: function(nodeId) {
        var prog = this.getProgress();
        return prog.cupsByNode[nodeId] || 0;
    },

    setCups: function(nodeId, value) {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.thicket) p.thicket = { cupsByNode: {}, lastViewedNode: 1 };
        var cur = p.thicket.cupsByNode[nodeId] || 0;
        if (value > cur) p.thicket.cupsByNode[nodeId] = value;
        Sherwood.saveGame();
    },

    setLastViewed: function(nodeId) {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.thicket) p.thicket = { cupsByNode: {}, lastViewedNode: 1 };
        p.thicket.lastViewedNode = nodeId;
        Sherwood.saveGame();
    },

    // ============================================================
    //  РАЗБЛОКИРОВКА
    // ============================================================
    isNodeAvailable: function(nodeId, diff) {
        if (nodeId === 1) return diff === 1 || this.getCups(1) >= (diff - 1);

        // Узел N+1 открыт, если у узла N ≥ 1 кубок
        var prevCups = this.getCups(nodeId - 1);
        if (prevCups < 1) return false;

        if (diff === 1) return true;

        // Сложность 2 — если у ЭТОГО узла ≥ 1 кубок
        // Сложность 3 — если у ЭТОГО узла ≥ 2 кубка
        var thisCups = this.getCups(nodeId);
        if (diff === 2) return thisCups >= 1;
        if (diff === 3) return thisCups >= 2;
        return false;
    },

    // Индекс следующего доступного узла (для скролла)
    getCurrentProgressNode: function() {
        for (var i = 0; i < this.NODES.length; i++) {
            var id = this.NODES[i].id;
            if (this.getCups(id) < 3) return id;
        }
        return this.NODES[this.NODES.length - 1].id;
    },

    // ============================================================
    //  СТАРТ БОЯ
    // ============================================================
    startNode: function(nodeId, diff) {
        if (!this.isNodeAvailable(nodeId, diff)) {
            return { success: false, reason: 'Узел заблокирован' };
        }
        var node = this.getNode(nodeId);
        if (!node) return { success: false, reason: 'Узел не найден' };

        this._currentNode = node;
        this._currentDiff = diff;
        this._inBattle = true;

        this.setLastViewed(nodeId);

        // Открываем боевой iframe
        this._openBattle(nodeId, diff);

        return { success: true };
    },

    _openBattle: function(nodeId, diff) {
    if (typeof UI === 'undefined') return;
    UI._stopMusic();

    var self = this;
    var node = this.getNode(nodeId);

    // 🆕 Рейд-босс (узел 65) — сначала видео
    if (node && node.isRaidBoss) {
        var video = document.createElement('video');
        video.src = 'assets/assets2/animation/raid_entrance.webm';
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;

        var videoStyles = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);object-fit:fill;z-index:3000;background:#000;';
        if (window.innerWidth < 480) {
            video.style.cssText = videoStyles + 'width:100vw;height:100vh;';
        } else if (window.innerWidth >= 480 && window.innerHeight <= 800) {
            video.style.cssText = videoStyles + 'width:480px;height:100vh;';
        } else {
            video.style.cssText = videoStyles + 'width:480px;height:800px;';
        }

        document.body.appendChild(video);

        var opened = false;
        function openIframe() {
            if (opened) return;
            opened = true;
            video.remove();
            self._openThicketIframe(nodeId, diff);
        }

        video.onended = openIframe;
        video.onerror = openIframe;
        setTimeout(function() {
            if (document.body.contains(video)) openIframe();
        }, 5000);
        return;
    }

    // Обычный узел — сразу iframe
    this._openThicketIframe(nodeId, diff);
},

// 🆕 Вынес в отдельный метод
_openThicketIframe: function(nodeId, diff) {
    var iframe = document.createElement('iframe');
    iframe.src = 'thicket_hall.html?node=' + nodeId + '&diff=' + diff;
    iframe.style.cssText = 'width:100%;height:100%;border:none;position:absolute;top:0;left:0;z-index:100;';
    if (UI._screenLayer) {
        UI._screenLayer.innerHTML = '';
        UI._screenLayer.appendChild(iframe);
        UI._screenLayer.style.display = 'block';
    }
},

    // ============================================================
    //  ПОБЕДА / ПОРАЖЕНИЕ
    // ============================================================
    _onWin: function(nodeId, diff) {
        var node = this.getNode(nodeId);
        if (!node) return;

        // Ставим кубок
        this.setCups(nodeId, diff);
        this._inBattle = false;

        // Награда по сложности
        var mult = this.DIFF_MULT[diff - 1] || 1.0;
        var reward = {
            exp: Math.floor(node.exp * mult),
            gold: Math.floor(node.gold * mult),
            silver: Math.floor(node.gold * mult * 3)
        };

        Sherwood.addExp(reward.exp);
        Sherwood.addResource('gold', reward.gold);
        Sherwood.addResource('silver', reward.silver);

        if (typeof UI !== 'undefined' && UI.updateDisplay) UI.updateDisplay();

        // Записываем бестию в бестиарий
        if (Sherwood.Bestiary && Sherwood.Bestiary.registerKill) {
            Sherwood.Bestiary.registerKill(node.image);
        }

        UI._afterRewardAction = function() {
            UI._playMusic('main_theme');
            Sherwood.Thicket.showUI();
        };
        UI._showVictoryScreen(reward);
    },

    _onDefeat: function(nodeId) {
        this._inBattle = false;

        var reward = {
            exp: 50,
            silver: 20
        };

        Sherwood.addExp(reward.exp);
        Sherwood.addResource('silver', reward.silver);

        if (typeof UI !== 'undefined' && UI.updateDisplay) UI.updateDisplay();

        // Восстанавливаем HP/MP
        var p = Sherwood.getPlayer();
        if (p && p.stats) {
            p.stats.hp = p.stats.maxHp;
            p.stats.mana = p.stats.maxMana || 100;
            Sherwood.saveGame();
        }

        UI._afterRewardAction = function() {
            UI._playMusic('main_theme');
            Sherwood.Thicket.showUI();
        };
        UI._showDefeatScreen(reward);
    },

    _flee: function() {
        this._inBattle = false;
        this._currentNode = null;
        if (typeof UI !== 'undefined') {
            UI._stopMusic();
            this.showUI();
        }
    },

    // ============================================================
    //  УТИЛИТЫ
    // ============================================================
    getImagePath: function(node) {
        var dir = 'assets/all_beasts/';
        if (node.imageDir === 'beast_quest') dir = 'assets/beast_quest/';
        else if (node.imageDir === 'portal_beasts') dir = 'assets/portal_beasts/';
        return dir + node.image;
    },

    // Для thicket_hall.html — берём текущего врага с множителем сложности
    getCurrentEnemy: function() {
        if (!this._currentNode) return null;
        var n = this._currentNode;
        var mult = this.DIFF_MULT[this._currentDiff - 1] || 1.0;
        return {
            name: n.name,
            image: n.image,
            imageDir: n.imageDir,
            imagePath: this.getImagePath(n),
            hp: Math.floor(n.hp * mult),
            maxHp: Math.floor(n.hp * mult),
            atk: Math.floor(n.atk * mult),
            def: Math.floor(n.def * mult),
            isBoss: n.isBoss,
            isRaidBoss: n.isRaidBoss || false,
            nodeId: n.id,
            diff: this._currentDiff
        };
    },

    // Для UI (заглушка — реализуем в Этапе 2)
    showUI: function() {
        if (typeof UI === 'undefined') return;
        UI._showPlaceholder('Шервудская чащоба', 'quests');
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Thicket = Sherwood.Thicket;

console.log('🌲 Шервудская чащоба загружена! Узлов:', Sherwood.Thicket.NODES.length);

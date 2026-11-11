/**
 * Sherwood Thicket — Шервудская чащоба
 * Квестовая тропа: 65 узлов, 3 сложности, кубки как в подземке
 * Визуал: вертикальная тропа-змейка
 */

if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

Sherwood.Thicket = {

    NODES: [
        // ========== ГЛАВА 1: Кровь Великого Дуба ==========
        { id: 1,  chapter: 1, chapterName: 'Кровь Великого Дуба', name: 'Чумной Ворон',            image: 'plague_crow.png',        imagePath: 'assets/all_beasts/plague_crow.png',        hp: 1000,  atk: 400,   def: 200,  exp: 30,  gold: 25,  isBoss: false },
        { id: 2,  chapter: 1, chapterName: 'Кровь Великого Дуба', name: 'Болотный Капкан',         image: 'bog_trapper.png',        imagePath: 'assets/all_beasts/bog_trapper.png',        hp: 1200,  atk: 450,   def: 250,  exp: 32,  gold: 60,  isBoss: false },
        { id: 3,  chapter: 1, chapterName: 'Кровь Великого Дуба', name: 'Базальтовый Пожиратель',  image: 'basalt_devourer.png',    imagePath: 'assets/all_beasts/basalt_devourer.png',    hp: 1500,  atk: 500,   def: 300,  exp: 35,  gold: 80,  isBoss: false },
        { id: 4,  chapter: 1, chapterName: 'Кровь Великого Дуба', name: 'Лесничий-Отступник',      image: 'fallen_forester.png',    imagePath: 'assets/beast_quest/fallen_forester.png',   hp: 4000,  atk: 800,   def: 800,  exp: 150, gold: 100, isBoss: true },

        // ========== ГЛАВА 2: Кара Скверны ==========
        { id: 5,  chapter: 2, chapterName: 'Кара Скверны', name: 'Искажённый Бес',         image: 'warped_imp.png',          imagePath: 'assets/all_beasts/warped_imp.png',          hp: 4000,  atk: 1200,  def: 800,  exp: 40,  gold: 200, isBoss: false },
        { id: 6,  chapter: 2, chapterName: 'Кара Скверны', name: 'Скверноплюй',            image: 'blight_spitter.png',      imagePath: 'assets/all_beasts/blight_spitter.png',      hp: 4500,  atk: 1250,  def: 850,  exp: 42,  gold: 200, isBoss: false },
        { id: 7,  chapter: 2, chapterName: 'Кара Скверны', name: 'Громила Грота',          image: 'grotto_brute.png',        imagePath: 'assets/all_beasts/grotto_brute.png',        hp: 5000,  atk: 1300,  def: 900,  exp: 45,  gold: 200, isBoss: false },
        { id: 8,  chapter: 2, chapterName: 'Кара Скверны', name: 'Вожак Искаженной Стаи',  image: 'blight_alpha_stag.png',   imagePath: 'assets/beast_quest/blight_alpha_stag.png',  hp: 8000,  atk: 2500,  def: 2000, exp: 200, gold: 230, isBoss: true },

        // ========== ГЛАВА 3: Старый Егерь ==========
        { id: 9,  chapter: 3, chapterName: 'Старый Егерь', name: 'Костяной Короед-Трупоед', image: 'bone_borer.png',          imagePath: 'assets/all_beasts/bone_borer.png',          hp: 9000,  atk: 2500,  def: 1800, exp: 50,  gold: 25,  isBoss: false },
        { id: 10, chapter: 3, chapterName: 'Старый Егерь', name: 'Болотный Паук',           image: 'swamp_spider.png',        imagePath: 'assets/all_beasts/swamp_spider.png',        hp: 9500,  atk: 2600,  def: 1900, exp: 52,  gold: 26,  isBoss: false },
        { id: 11, chapter: 3, chapterName: 'Старый Егерь', name: 'Пещерный Наблюдатель',    image: 'cave_watcher.png',        imagePath: 'assets/all_beasts/cave_watcher.png',        hp: 10000, atk: 2700,  def: 2000, exp: 55,  gold: 28,  isBoss: false },
        { id: 12, chapter: 3, chapterName: 'Старый Егерь', name: 'Альфа-Гончая Егеря',      image: 'huntsman_alpha_hound.png',imagePath: 'assets/beast_quest/huntsman_alpha_hound.png',hp: 11000, atk: 4500,  def: 3500, exp: 250, gold: 160, isBoss: true },

        // ========== ГЛАВА 4: Спуск в Шервудскую Чащобу ==========
        { id: 13, chapter: 4, chapterName: 'Спуск в Шервудскую Чащобу', name: 'Альфа-Скверноискатель', image: 'blight_alpha.png',       imagePath: 'assets/all_beasts/blight_alpha.png',       hp: 16000, atk: 4000,  def: 3000, exp: 60,  gold: 30,  isBoss: false },
        { id: 14, chapter: 4, chapterName: 'Спуск в Шервудскую Чащобу', name: 'Окулярный Арахнид',     image: 'ocular_arachnid.png',    imagePath: 'assets/all_beasts/ocular_arachnid.png',    hp: 17000, atk: 4100,  def: 3100, exp: 62,  gold: 31,  isBoss: false },
        { id: 15, chapter: 4, chapterName: 'Спуск в Шервудскую Чащобу', name: 'Рунический Страж',      image: 'runic_sentinel.png',     imagePath: 'assets/all_beasts/runic_sentinel.png',     hp: 18000, atk: 4200,  def: 3200, exp: 65,  gold: 32,  isBoss: false },
        { id: 16, chapter: 4, chapterName: 'Спуск в Шервудскую Чащобу', name: 'Падший Друид',          image: 'fallen_druid.png',       imagePath: 'assets/beast_quest/fallen_druid.png',      hp: 20000, atk: 7000,  def: 5500, exp: 300, gold: 200, isBoss: true },

        // ========== ГЛАВА 5: Искажённая Экосистема ==========
        { id: 17, chapter: 5, chapterName: 'Искажённая Экосистема', name: 'Голем Дуба',           image: 'oak_golem.png',          imagePath: 'assets/all_beasts/oak_golem.png',          hp: 25000, atk: 5500,  def: 4200, exp: 70,  gold: 35,  isBoss: false },
        { id: 18, chapter: 5, chapterName: 'Искажённая Экосистема', name: 'Водная Баба',          image: 'water_hag.png',          imagePath: 'assets/all_beasts/water_hag.png',          hp: 27000, atk: 5600,  def: 4300, exp: 72,  gold: 36,  isBoss: false },
        { id: 19, chapter: 5, chapterName: 'Искажённая Экосистема', name: 'Огр Скверного Мха',    image: 'blight_moss_ogre.png',   imagePath: 'assets/all_beasts/blight_moss_ogre.png',   hp: 29000, atk: 5700,  def: 4400, exp: 75,  gold: 38,  isBoss: false },
        { id: 20, chapter: 5, chapterName: 'Искажённая Экосистема', name: 'Голод Чащи',           image: 'thicket_hunger.png',     imagePath: 'assets/beast_quest/thicket_hunger.png',    hp: 30000, atk: 9500,  def: 7500, exp: 350, gold: 250, isBoss: true },

        // ========== ГЛАВА 6: Слепая Ярость Духов ==========
        { id: 21, chapter: 6, chapterName: 'Слепая Ярость Духов', name: 'Слуга Лешего',       image: 'leshy_servant.png',      imagePath: 'assets/all_beasts/leshy_servant.png',      hp: 35000, atk: 7000,  def: 5500, exp: 80,  gold: 40,  isBoss: false },
        { id: 22, chapter: 6, chapterName: 'Слепая Ярость Духов', name: 'Болотная Ведунья',   image: 'marsh_witch.png',        imagePath: 'assets/all_beasts/marsh_witch.png',        hp: 37000, atk: 7100,  def: 5600, exp: 82,  gold: 41,  isBoss: false },
        { id: 23, chapter: 6, chapterName: 'Слепая Ярость Духов', name: 'Искажённый Червь',   image: 'warped_worm.png',        imagePath: 'assets/all_beasts/warped_worm.png',        hp: 39000, atk: 7200,  def: 5700, exp: 85,  gold: 42,  isBoss: false },
        { id: 24, chapter: 6, chapterName: 'Слепая Ярость Духов', name: 'Древний Владыка',    image: 'blight_lord_leshy.png',  imagePath: 'assets/beast_quest/blight_lord_leshy.png', hp: 45000, atk: 12000, def: 9500, exp: 400, gold: 300, isBoss: true },

        // ========== ГЛАВА 7: Эхо Прошлых Поражений ==========
        { id: 25, chapter: 7, chapterName: 'Эхо Прошлых Поражений', name: 'Торфяной Владыка',  image: 'peat_lord.png',          imagePath: 'assets/all_beasts/peat_lord.png',          hp: 48000, atk: 8500,  def: 6800, exp: 90,  gold: 45,  isBoss: false },
        { id: 26, chapter: 7, chapterName: 'Эхо Прошлых Поражений', name: 'Улитка Скверны',    image: 'blight_snail.png',       imagePath: 'assets/all_beasts/blight_snail.png',       hp: 50000, atk: 8600,  def: 6900, exp: 92,  gold: 46,  isBoss: false },
        { id: 27, chapter: 7, chapterName: 'Эхо Прошлых Поражений', name: 'Гротный Слизень',   image: 'grotto_slug.png',        imagePath: 'assets/all_beasts/grotto_slug.png',        hp: 52000, atk: 8700,  def: 7000, exp: 95,  gold: 48,  isBoss: false },
        { id: 28, chapter: 7, chapterName: 'Эхо Прошлых Поражений', name: 'Пожиратель Эха',    image: 'echo_devourer.png',      imagePath: 'assets/beast_quest/echo_devourer.png',     hp: 65000, atk: 14500, def: 11500,exp: 450, gold: 350, isBoss: true },

        // ========== ГЛАВА 8: Ужас Болотных Недр ==========
        { id: 29, chapter: 8, chapterName: 'Ужас Болотных Недр', name: 'Болотный Дракончик',    image: 'swamp_drake.png',           imagePath: 'assets/all_beasts/swamp_drake.png',           hp: 62000, atk: 10000, def: 8200, exp: 110, gold: 55,  isBoss: false },
        { id: 30, chapter: 8, chapterName: 'Ужас Болотных Недр', name: 'Древняя Улитка Скверны',image: 'ancient_blight_snail.png',  imagePath: 'assets/all_beasts/ancient_blight_snail.png',  hp: 65000, atk: 10100, def: 8300, exp: 112, gold: 56,  isBoss: false },
        { id: 31, chapter: 8, chapterName: 'Ужас Болотных Недр', name: 'Подземный Ужас',        image: 'underground_terror.png',    imagePath: 'assets/all_beasts/underground_terror.png',    hp: 68000, atk: 10200, def: 8400, exp: 115, gold: 58,  isBoss: false },
        { id: 32, chapter: 8, chapterName: 'Ужас Болотных Недр', name: 'Повелительница Топей',  image: 'mistress_of_the_mires.png', imagePath: 'assets/beast_quest/mistress_of_the_mires.png',hp: 90000, atk: 17000, def: 13500,exp: 500, gold: 400, isBoss: true },

        // ========== ГЛАВА 9: Разломы Безумия ==========
        { id: 33, chapter: 9, chapterName: 'Разломы Безумия', name: 'Цербер Скверны',   image: 'blight_cerberus.png',   imagePath: 'assets/all_beasts/blight_cerberus.png',   hp: 78000, atk: 11500, def: 9500,  exp: 130, gold: 65,  isBoss: false },
        { id: 34, chapter: 9, chapterName: 'Разломы Безумия', name: 'Гниющий Волк',     image: 'putrid_wolf.png',       imagePath: 'assets/all_beasts/putrid_wolf.png',       hp: 81000, atk: 11600, def: 9600,  exp: 132, gold: 66,  isBoss: false },
        { id: 35, chapter: 9, chapterName: 'Разломы Безумия', name: 'Дочь Корней',      image: 'root_daughter.png',     imagePath: 'assets/all_beasts/root_daughter.png',     hp: 84000, atk: 11700, def: 9700,  exp: 135, gold: 68,  isBoss: false },
        { id: 36, chapter: 9, chapterName: 'Разломы Безумия', name: 'Страж Разломов',   image: 'rift_warden.png',       imagePath: 'assets/beast_quest/rift_warden.png',      hp: 120000,atk: 19500, def: 15500, exp: 550, gold: 450, isBoss: true },

        // ========== ГЛАВА 10: Портал Нашествия — Улей Плоти ==========
        { id: 37, chapter: 10, chapterName: 'Портал Нашествия — Улей Плоти', name: 'Волк-Потрошитель', image: 'ripper_wolf.png',    imagePath: 'assets/all_beasts/ripper_wolf.png',    hp: 95000, atk: 13000, def: 11000, exp: 150, gold: 75,  isBoss: false },
        { id: 38, chapter: 10, chapterName: 'Портал Нашествия — Улей Плоти', name: 'Гнилостная Лиса',  image: 'blight_fox.png',     imagePath: 'assets/all_beasts/blight_fox.png',     hp: 98000, atk: 13100, def: 11100, exp: 152, gold: 76,  isBoss: false },
        { id: 39, chapter: 10, chapterName: 'Портал Нашествия — Улей Плоти', name: 'Костяной Арахнид', image: 'bone_arachnid.png',  imagePath: 'assets/all_beasts/bone_arachnid.png',  hp: 101000,atk: 13200, def: 11200, exp: 155, gold: 78,  isBoss: false },
        { id: 40, chapter: 10, chapterName: 'Портал Нашествия — Улей Плоти', name: 'Матка Лесных Короедов', image: 'the_hive_mother.png', imagePath: 'assets/beast_quest/the_hive_mother.png', hp: 160000, atk: 22000, def: 17500, exp: 600, gold: 500, isBoss: true },

        // ========== ГЛАВА 11: Портал Искажения — Костяной Трон ==========
        { id: 41, chapter: 11, chapterName: 'Портал Искажения — Костяной Трон', name: 'Болотная Гадюка',         image: 'swamp_viper.png',              imagePath: 'assets/all_beasts/swamp_viper.png',              hp: 115000,atk: 14500, def: 12500, exp: 170, gold: 85,  isBoss: false },
        { id: 42, chapter: 11, chapterName: 'Портал Искажения — Костяной Трон', name: 'Арахнид-Некромант',       image: 'necromantic_arachnid.png',     imagePath: 'assets/all_beasts/necromantic_arachnid.png',     hp: 118000,atk: 14600, def: 12600, exp: 172, gold: 86,  isBoss: false },
        { id: 43, chapter: 11, chapterName: 'Портал Искажения — Костяной Трон', name: 'Оживший Тис',             image: 'animated_yew.png',             imagePath: 'assets/all_beasts/animated_yew.png',             hp: 121000,atk: 14700, def: 12700, exp: 175, gold: 88,  isBoss: false },
        { id: 44, chapter: 11, chapterName: 'Портал Искажения — Костяной Трон', name: 'Проклятый Король Разбойников', image: 'the_cursed_outlaw_king.png', imagePath: 'assets/beast_quest/the_cursed_outlaw_king.png', hp: 210000, atk: 24500, def: 19500, exp: 700, gold: 600, isBoss: true },

        // ========== ГЛАВА 12: Портал Безумия — Кровоточащий Кап ==========
        { id: 45, chapter: 12, chapterName: 'Портал Безумия — Кровоточащий Кап', name: 'Светляк-Угнетатель', image: 'oppressor_firefly.png',   imagePath: 'assets/all_beasts/oppressor_firefly.png',   hp: 135000,atk: 16000, def: 14000, exp: 190, gold: 95,  isBoss: false },
        { id: 46, chapter: 12, chapterName: 'Портал Безумия — Кровоточащий Кап', name: 'Ржавый Страх',       image: 'rusty_dread.png',         imagePath: 'assets/all_beasts/rusty_dread.png',         hp: 138000,atk: 16100, def: 14100, exp: 192, gold: 96,  isBoss: false },
        { id: 47, chapter: 12, chapterName: 'Портал Безумия — Кровоточащий Кап', name: 'Мечник Хаоса',       image: 'chaos_swordsman.png',     imagePath: 'assets/all_beasts/chaos_swordsman.png',     hp: 141000,atk: 16200, def: 14200, exp: 195, gold: 98,  isBoss: false },
        { id: 48, chapter: 12, chapterName: 'Портал Безумия — Кровоточащий Кап', name: 'Древний Хранитель Склепа', image: 'ancient_crypt_warden.png', imagePath: 'assets/beast_quest/ancient_crypt_warden.png', hp: 270000, atk: 27000, def: 21500, exp: 800, gold: 700, isBoss: true },

        // ========== ГЛАВА 13: Триумвират Зла ==========
        { id: 49, chapter: 13, chapterName: 'Триумвират Зла', name: 'Гарпия Хаоса',       image: 'chaos_harpy.png',              imagePath: 'assets/all_beasts/chaos_harpy.png',              hp: 160000,atk: 17500, def: 15500, exp: 210, gold: 105, isBoss: false },
        { id: 50, chapter: 13, chapterName: 'Триумвират Зла', name: 'Терновый Мотыль',    image: 'thorn_moth.png',               imagePath: 'assets/all_beasts/thorn_moth.png',               hp: 163000,atk: 17600, def: 15600, exp: 212, gold: 106, isBoss: false },
        { id: 51, chapter: 13, chapterName: 'Триумвират Зла', name: 'Пещерный Терзатель', image: 'cave_tormentor.png',           imagePath: 'assets/all_beasts/cave_tormentor.png',           hp: 166000,atk: 17700, def: 15700, exp: 215, gold: 108, isBoss: false },
        { id: 52, chapter: 13, chapterName: 'Триумвират Зла', name: 'Эхо Трех Порталов',  image: 'echo_of_the_triumvirate.png',  imagePath: 'assets/beast_quest/echo_of_the_triumvirate.png', hp: 340000, atk: 29500, def: 23500, exp: 900, gold: 800, isBoss: true },

        // ========== ГЛАВА 14: Сломанная Печать ==========
        { id: 53, chapter: 14, chapterName: 'Сломанная Печать', name: 'Коршун Скверны',     image: 'blight_kite.png',          imagePath: 'assets/all_beasts/blight_kite.png',          hp: 185000,atk: 19000, def: 17000, exp: 230, gold: 115, isBoss: false },
        { id: 54, chapter: 14, chapterName: 'Сломанная Печать', name: 'Слепой Терзатель',   image: 'blind_render.png',         imagePath: 'assets/all_beasts/blind_render.png',         hp: 188000,atk: 19100, def: 17100, exp: 232, gold: 116, isBoss: false },
        { id: 55, chapter: 14, chapterName: 'Сломанная Печать', name: 'Хранитель Скверны',  image: 'blight_keeper.png',        imagePath: 'assets/all_beasts/blight_keeper.png',        hp: 191000,atk: 19200, def: 17200, exp: 235, gold: 118, isBoss: false },
        { id: 56, chapter: 14, chapterName: 'Сломанная Печать', name: 'Палач Священного Древа', image: 'sacred_tree_executioner.png', imagePath: 'assets/beast_quest/sacred_tree_executioner.png', hp: 420000, atk: 32000, def: 25500, exp: 1000, gold: 900, isBoss: true },

        // ========== ГЛАВА 15: Последний Выстрел ==========
        { id: 57, chapter: 15, chapterName: 'Последний Выстрел', name: 'Скверный Король',     image: 'blight_king.png',          imagePath: 'assets/all_beasts/blight_king.png',          hp: 210000,atk: 20500, def: 18500, exp: 260, gold: 130, isBoss: false },
        { id: 58, chapter: 15, chapterName: 'Последний Выстрел', name: 'Енот Порчи',          image: 'corruption_raccoon.png',   imagePath: 'assets/all_beasts/corruption_raccoon.png',   hp: 213000,atk: 20600, def: 18600, exp: 262, gold: 131, isBoss: false },
        { id: 59, chapter: 15, chapterName: 'Последний Выстрел', name: 'Хозяин Пернатых',     image: 'lord_of_the_feathered.png',imagePath: 'assets/all_beasts/lord_of_the_feathered.png',hp: 216000,atk: 20700, def: 18700, exp: 265, gold: 132, isBoss: false },
        { id: 60, chapter: 15, chapterName: 'Последний Выстрел', name: 'Шервудское Отродье',  image: 'sherwood_abomination.png', imagePath: 'assets/beast_quest/sherwood_abomination.png', hp: 520000, atk: 34500, def: 27500, exp: 1500, gold: 1200, isBoss: true },

        // ========== ГЛАВА 16: Шрам, который не заживёт (Секретная) ==========
        { id: 61, chapter: 16, chapterName: 'Шрам, который не заживёт', name: 'Рыцарь Хаоса',         image: 'chaos_knight.png',         imagePath: 'assets/all_beasts/chaos_knight.png',         hp: 240000,atk: 22000, def: 20000, exp: 200, gold: 50,  isBoss: false },
        { id: 62, chapter: 16, chapterName: 'Шрам, который не заживёт', name: 'Владыка Пепла',        image: 'ash_overlord.png',         imagePath: 'assets/all_beasts/ash_overlord.png',         hp: 245000,atk: 22200, def: 20200, exp: 210, gold: 55,  isBoss: false },
        { id: 63, chapter: 16, chapterName: 'Шрам, который не заживёт', name: 'Страж Преисподней',    image: 'underworld_guardian.png',  imagePath: 'assets/all_beasts/underworld_guardian.png',  hp: 250000,atk: 22400, def: 20400, exp: 220, gold: 60,  isBoss: false },
        { id: 64, chapter: 16, chapterName: 'Шрам, который не заживёт', name: 'Изначальный Стержень', image: 'the_primordial_core.png',  imagePath: 'assets/beast_quest/the_primordial_core.png', hp: 560000,atk: 36000, def: 29000, exp: 1600, gold: 1300, isBoss: true },

        // ========== РЕЙД-БОСС ==========
        { id: 65, chapter: 0, chapterName: 'Рейд', name: 'Изначальный Ужас', image: 'original_horror.png', imagePath: 'assets/assets2/mobs/raid_mobs/original_horror.png', hp: 580000, atk: 38000, def: 30000, exp: 20000, gold: 15000, isBoss: true, isRaidBoss: true }
    ],

    DIFF_MULT: [1.0, 1.5, 2.2],
    DIFF_NAMES: ['Лёгкая', 'Средняя', 'Сложная'],

    _currentNode: null,
    _currentDiff: 1,
    _inBattle: false,
    _selectedChapter: 1,

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.thicket) {
            p.thicket = { cupsByNode: {}, lastViewedNode: 1 };
        }
        console.log('🌲 Шервудская чащоба инициализирована. Узлов:', this.NODES.length);
    },

    getNode: function(nodeId) {
        for (var i = 0; i < this.NODES.length; i++) {
            if (this.NODES[i].id === nodeId) return this.NODES[i];
        }
        return null;
    },

    getProgress: function() {
        var p = Sherwood.getPlayer();
        if (!p) return { cupsByNode: {}, lastViewedNode: 1 };
        if (!p.thicket) p.thicket = { cupsByNode: {}, lastViewedNode: 1 };
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

    isNodeAvailable: function(nodeId, diff) {
        if (nodeId === 1) return diff === 1 || this.getCups(1) >= (diff - 1);
        var prevCups = this.getCups(nodeId - 1);
        if (prevCups < 1) return false;
        if (diff === 1) return true;
        var thisCups = this.getCups(nodeId);
        if (diff === 2) return thisCups >= 1;
        if (diff === 3) return thisCups >= 2;
        return false;
    },

    getCurrentProgressNode: function() {
        for (var i = 0; i < this.NODES.length; i++) {
            var id = this.NODES[i].id;
            if (this.getCups(id) < 3) return id;
        }
        return this.NODES[this.NODES.length - 1].id;
    },

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
        this._openBattle(nodeId, diff);
        return { success: true };
    },

    _openBattle: function(nodeId, diff) {
        if (typeof UI === 'undefined') return;
        UI._stopMusic();

        var self = this;
        var node = this.getNode(nodeId);

        if (node && node.isRaidBoss) {
            var video = document.createElement('video');
            video.src = 'assets/assets2/animation/raid_entrance.webm';
            video.autoplay = true; video.muted = true; video.playsInline = true;
            var videoStyles = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);object-fit:fill;z-index:3000;background:#000;';
            if (window.innerWidth < 480) { video.style.cssText = videoStyles + 'width:100vw;height:100vh;'; }
            else if (window.innerWidth >= 480 && window.innerHeight <= 800) { video.style.cssText = videoStyles + 'width:480px;height:100vh;'; }
            else { video.style.cssText = videoStyles + 'width:480px;height:800px;'; }
            document.body.appendChild(video);
            var opened = false;
            function openIframe() {
                if (opened) return; opened = true; video.remove();
                self._openThicketIframe(nodeId, diff);
            }
            video.onended = openIframe;
            video.onerror = openIframe;
            setTimeout(function() { if (document.body.contains(video)) openIframe(); }, 5000);
            return;
        }

        this._openThicketIframe(nodeId, diff);
    },

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

    _onWin: function(nodeId, diff) {
        var node = this.getNode(nodeId);
        if (!node) return;
        this.setCups(nodeId, diff);
        this._inBattle = false;

        var mult = this.DIFF_MULT[diff - 1] || 1.0;
        var reward = {
            exp: Math.floor(node.exp * mult),
            gold: Math.floor(node.gold * mult * 2),
            silver: Math.floor(node.gold * mult * 5)
        };
        Sherwood.addExp(reward.exp);
        Sherwood.addResource('gold', reward.gold);
        Sherwood.addResource('silver', reward.silver);

        var ticketChance = diff === 1 ? 0.1 : (diff === 2 ? 0.3 : 0.5);
        if (Math.random() < ticketChance) {
            if (parent.Sherwood && parent.Sherwood.Bag && parent.Sherwood.Bag.addResource) {
                parent.Sherwood.Bag.addResource('portalToken1', 1);
                if (typeof UI !== 'undefined' && UI._showToast) UI._showToast('🎫 Выпал Токен портала I!');
            }
        }

        if (typeof UI !== 'undefined' && UI.updateDisplay) UI.updateDisplay();
        if (Sherwood.Bestiary && Sherwood.Bestiary.registerKill) Sherwood.Bestiary.registerKill(node.image);

        UI._afterRewardAction = function() {
            UI._playMusic('main_theme');
            Sherwood.Thicket.showUI();
        };
        UI._showVictoryScreen(reward);
    },

    _onDefeat: function(nodeId) {
        this._inBattle = false;
        var reward = { exp: 200, silver: 150 };
        Sherwood.addExp(reward.exp);
        Sherwood.addResource('silver', reward.silver);

        if (typeof UI !== 'undefined' && UI.updateDisplay) UI.updateDisplay();
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
        if (typeof UI !== 'undefined') { UI._stopMusic(); this.showUI(); }
    },

    getImagePath: function(node) { return node.imagePath; },

    getCurrentEnemy: function() {
        if (!this._currentNode) return null;
        var n = this._currentNode;
        var mult = this.DIFF_MULT[this._currentDiff - 1] || 1.0;
        return {
            name: n.name, image: n.image, imagePath: n.imagePath,
            hp: Math.floor(n.hp * mult), maxHp: Math.floor(n.hp * mult),
            atk: Math.floor(n.atk * mult), def: Math.floor(n.def * mult),
            isBoss: n.isBoss, isRaidBoss: n.isRaidBoss || false,
            nodeId: n.id, diff: this._currentDiff
        };
    },

    // ============================================================
    //  UI — ВЕРТИКАЛЬНАЯ ТРОПА-ЗМЕЙКА (КРАСИВАЯ)
    // ============================================================
    showUI: function() {
        if (typeof UI === 'undefined') return;
        UI._playSound('click');

        var self = this;
        var chapters = {};
        for (var i = 0; i < this.NODES.length; i++) {
            var n = this.NODES[i];
            if (!chapters[n.chapter]) chapters[n.chapter] = { name: n.chapterName, nodes: [] };
            chapters[n.chapter].nodes.push(n);
        }

        var chapterKeys = Object.keys(chapters).sort(function(a, b) { return parseInt(a) - parseInt(b); });
        var selectedChapter = this._selectedChapter || 1;

        var h = '<div style="width:100%;max-width:380px;margin:0 auto;box-sizing:border-box;padding:10px;">';
        
        // Вкладки глав
        h += '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin-bottom:20px;">';
        for (var c = 0; c < chapterKeys.length; c++) {
            var chId = parseInt(chapterKeys[c]);
            var isActive = (chId === selectedChapter);
            h += '<div onclick="Sherwood.Thicket._selectChapter(' + chId + ')" style="cursor:pointer;padding:5px 10px;border-radius:6px;border:2px solid ' + (isActive ? '#c9a040' : '#444') + ';background:' + (isActive ? 'rgba(60,40,15,0.9)' : 'rgba(20,20,20,0.7)') + ';color:' + (isActive ? '#ffd27a' : '#888') + ';font:bold 12px \'Times New Roman\',serif;white-space:nowrap;box-shadow:' + (isActive ? '0 0 8px rgba(201,160,64,0.5)' : 'none') + ';">' + (chId === 0 ? 'Рейд' : 'Гл. ' + chId) + '</div>';
        }
        h += '</div>';

        // Заголовок
        var chData = chapters[selectedChapter];
        if (chData) {
            h += '<div style="color:#c8a050;font-size:14px;text-align:center;margin-bottom:15px;text-shadow:0 2px 4px #000;font-weight:bold;">' + chData.name + '</div>';
            
            // ТРОПА (вертикальная змейка)
            h += '<div style="position:relative;display:flex;flex-direction:column;align-items:center;padding:10px 0;">';

            // Рисуем вертикальную линию (тропу) на фоне
            h += '<div style="position:absolute;top:0;left:50%;transform:translateX(-50%);width:4px;height:100%;background:linear-gradient(180deg, #6b5a3a, #3a2a1a, #6b5a3a);border-radius:2px;z-index:0;"></div>';

            for (var ni = 0; ni < chData.nodes.length; ni++) {
                var node = chData.nodes[ni];
                var cups = this.getCups(node.id);
                var available = this.isNodeAvailable(node.id, 1);

                var borderColor = cups >= 3 ? '#ffd700' : (available ? '#c9a040' : '#333');
                var opacity = available ? 1 : 0.5;
                
                // Смещение для змейки (четные влево, нечетные вправо)
                var offset = (ni % 2 === 0) ? -50 : 50;
                var marginBottom = (ni === chData.nodes.length - 1) ? 0 : 30;

                // Узел
                h += '<div onclick="Sherwood.Thicket._showNodePanel(' + node.id + ')" style="position:relative;z-index:1;display:flex;align-items:center;gap:10px;margin-bottom:' + marginBottom + 'px;margin-left:' + (offset > 0 ? 'auto' : '0') + ';margin-right:' + (offset < 0 ? 'auto' : '0') + ';cursor:pointer;opacity:' + opacity + ';background:rgba(10,8,5,0.95);border:2px solid ' + borderColor + ';border-radius:10px;padding:8px;width:140px;box-shadow:0 4px 10px rgba(0,0,0,0.8);">';

                // Иконка
                h += '<div style="width:36px;height:36px;flex-shrink:0;background:rgba(0,0,0,0.5);border-radius:6px;overflow:hidden;">';
                h += '<img src="' + node.imagePath + '" style="width:100%;height:100%;object-fit:contain;" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                h += '</div>';

                // Текст
                h += '<div style="flex:1;min-width:0;">';
                h += '<div style="color:#fff;font-size:10px;font-weight:bold;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + node.name + '</div>';
                
                // Кубки
                h += '<div style="display:flex;gap:2px;margin-top:4px;">';
                for (var k = 1; k <= 3; k++) {
                    h += '<div style="width:6px;height:6px;border-radius:50%;border:1px solid ' + (cups >= k ? '#ffd700' : '#555') + ';background:' + (cups >= k ? '#ffd700' : 'transparent') + ';"></div>';
                }
                h += '</div>';
                h += '</div>';

                h += '</div>';
            }
            h += '</div>';
        }

        h += '</div>';

        UI._screenLayer.innerHTML = '';
        var bgStyle = 'background-image:url(\'' + (UI._bg.quests || '') + '\');background-size:cover;background-position:center;background-repeat:no-repeat;';
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' + bgStyle + 'display:flex;flex-direction:column;overflow:hidden;';
        
        wrapper.innerHTML =
            '<style>.thicket-scroll::-webkit-scrollbar { display: none; } .thicket-scroll { scrollbar-width: none; }</style>' +
            '<div style="position:absolute;top:0;left:0;right:0;height:60px;display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,rgba(0,0,0,0.95),transparent);z-index:10;">' +
                '<button onclick="UI.loadHome()" style="position:absolute;left:10px;top:14px;background:transparent;border:none;color:#e0c080;font-size:20px;cursor:pointer;">←</button>' +
                '<span style="color:#e0c080;font-size:18px;font-weight:bold;text-shadow:0 2px 4px #000;">🌲 Шервудская чащоба</span>' +
            '</div>' +
            '<div class="thicket-scroll" style="flex:1;overflow-y:auto;padding:70px 12px 20px;box-sizing:border-box;display:flex;justify-content:center;">' + h + '</div>';
        UI._screenLayer.appendChild(wrapper);
        UI._screenLayer.style.display = 'block';
        UI._screenLayer.style.overflow = 'hidden';
    },

    _selectChapter: function(chId) {
        this._selectedChapter = chId;
        this.showUI();
    },

    _showNodePanel: function(nodeId) {
        var self = this;
        var node = this.getNode(nodeId);
        if (!node) return;
        this.setLastViewed(nodeId);

        var cups = this.getCups(nodeId);
        var imgPath = this.getImagePath(node);

        var h = '<div style="width:100%;max-width:340px;margin:0 auto;box-sizing:border-box;text-align:center;position:relative;">';

        h += '<div style="position:relative;z-index:1;margin:0 auto 16px;width:160px;height:160px;border:3px solid #c9a040;border-radius:16px;box-shadow:0 0 30px rgba(201,160,64,0.4), inset 0 0 40px rgba(0,0,0,0.8);background:radial-gradient(circle, rgba(0,0,0,0.2), rgba(0,0,0,0.7));display:flex;align-items:center;justify-content:center;overflow:hidden;pointer-events:none;">';
        h += '<img src="' + imgPath + '" style="width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;" onerror="this.style.display=\'none\'">';
        h += '</div>';

        h += '<div style="position:relative;z-index:10;">';
        h += '<div style="color:#ffd27a;font:bold 20px \'Times New Roman\',serif;text-shadow:0 2px 4px #000;margin-bottom:6px;">' + node.name + '</div>';

        if (node.chapter > 0) {
            h += '<div style="color:#aaa;font-size:0.8em;margin-bottom:4px;">Глава ' + node.chapter + ' — ' + node.chapterName + '</div>';
        } else {
            h += '<div style="color:#ff6b35;font-size:0.85em;font-weight:bold;margin-bottom:4px;">' + node.chapterName + '</div>';
        }
        if (node.isBoss) {
            h += '<div style="color:#ff6b35;font-size:0.8em;font-weight:bold;margin-bottom:8px;">' + (node.isRaidBoss ? '👑 РЕЙД-БОСС' : '☠ БОСС') + '</div>';
        }

        h += '<div style="color:#c8a050;font-size:0.85em;margin-bottom:16px;">Кубков: ' + cups + ' / 3</div>';

        h += '<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:20px;">';
        for (var d = 1; d <= 3; d++) {
            var available = this.isNodeAvailable(nodeId, d);
            var passed = cups >= d;
            var mult = this.DIFF_MULT[d - 1];
            var diffName = this.DIFF_NAMES[d - 1];

            var bg = passed ? 'linear-gradient(180deg,#5a4020,#3a2a10)' : (available ? 'linear-gradient(180deg,#3a2a10,#1a1208)' : 'rgba(20,20,20,0.7)');
            var border = passed ? '#ffd700' : (available ? '#c9a040' : '#333');
            var color = passed ? '#ffd700' : (available ? '#ffd27a' : '#666');
            var cursor = available ? 'pointer' : 'not-allowed';
            var clickAttr = ' onclick="Sherwood.Thicket._enterNode(' + nodeId + ',' + d + ')"';

            h += '<div' + clickAttr + ' style="position:relative;z-index:20;background:' + bg + ';border:2px solid ' + border + ';border-radius:8px;padding:10px 16px;cursor:' + cursor + ';display:flex;justify-content:space-between;align-items:center;pointer-events:auto;user-select:none;">';
            h += '<div style="text-align:left;color:' + color + ';font:bold 14px \'Times New Roman\',serif;letter-spacing:1px;pointer-events:none;">' + diffName + '</div>';
            h += '<div style="color:' + color + ';font-size:0.8em;pointer-events:none;">';
            if (passed) h += '✓ Пройдено';
            else if (available) h += '×' + mult.toFixed(1) + ' HP/ATK';
            else h += '🔒 Закрыто';
            h += '</div></div>';
        }
        h += '</div>';

        h += '<button onclick="Sherwood.Thicket.showUI()" style="position:relative;z-index:20;background:transparent;border:2px solid #6b5a3a;border-radius:8px;padding:8px 20px;color:#c8a050;font:bold 13px \'Times New Roman\',serif;cursor:pointer;letter-spacing:1px;pointer-events:auto;">← К ТРОПЕ</button>';
        h += '</div></div>';

        UI._screenLayer.innerHTML = '';
        var bgStyle = 'background-image:url(\'' + (UI._bg.quests || '') + '\');background-size:cover;background-position:center;background-repeat:no-repeat;';
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' + bgStyle + 'display:flex;flex-direction:column;overflow:hidden;';
        wrapper.innerHTML =
            '<style>.thicket-scroll::-webkit-scrollbar { display: none; } .thicket-scroll { scrollbar-width: none; }</style>' +
            '<div style="position:absolute;top:0;left:0;right:0;height:60px;display:flex;flex-direction:row;align-items:center;justify-content:center;z-index:10;background:linear-gradient(180deg,rgba(0,0,0,0.9),transparent);">' +
                '<button onclick="Sherwood.Thicket.showUI()" style="position:absolute;left:10px;top:14px;background:transparent;border:none;cursor:pointer;color:#e0c080;font-size:20px;font-weight:bold;text-shadow:0 2px 4px #000;"> ← </button>' +
                '<span style="color:#e0c080;font-size:18px;font-weight:bold;text-shadow:0 2px 4px #000;">' + node.name + '</span>' +
            '</div>' +
            '<div class="thicket-scroll" style="flex:1;overflow-y:auto;padding:70px 16px 20px;box-sizing:border-box;display:flex;justify-content:center;align-items:flex-start;">' + h + '</div>';
        UI._screenLayer.appendChild(wrapper);
        UI._screenLayer.style.display = 'block';
        UI._screenLayer.style.overflow = 'hidden';
    },

    _enterNode: function(nodeId, diff) {
        if (!this.isNodeAvailable(nodeId, diff)) {
            if (typeof UI !== 'undefined' && UI._showToast) UI._showToast('Узел заблокирован');
            return;
        }
        this.startNode(nodeId, diff);
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Thicket = Sherwood.Thicket;

console.log('🌲 Шервудская чащоба загружена! Узлов:', Sherwood.Thicket.NODES.length);

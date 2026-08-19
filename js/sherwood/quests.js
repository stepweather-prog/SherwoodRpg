Sherwood.Quests = {
    _currentChapter: null,
    _currentStage: 0,
    _currentEnemy: null,
    _inBattle: false,
    _attemptsToday: 0,
    _lastAttempt: 0,
    _freeAccelUsed: false,

    CHAPTERS: [
        {
            id: 1, name: 'Кровь Великого Дуба',
            lore: 'Шервуд не всегда был могильником. В его сердце стоял Древний Дуб — не просто дерево, а щит, веками сдерживающий то, что спит под землей. Королевские Охотники пришли не за лесом. Они хотели сломить дух Шервуда, осквернив Дуб.',
            boss: { name: 'Лесничий-Отступник', image: 'fallen_forester.png', hp: 400, atk: 28, def: 15, exp: 150, gold: 100 },
            stages: 6, rewards: { exp: 200, gold: 50, silver: 500 },
            enemies: [
                { name: 'Лесной Душегуб', image: 'forest_strangler.png', hp: 100, atk: 15, def: 8, exp: 30, gold: 15 },
                { name: 'Чумной Ворон', image: 'plague_crow.png', hp: 120, atk: 18, def: 10, exp: 35, gold: 18 },
                { name: 'Костяной Стервятник', image: 'bone_vulture.png', hp: 140, atk: 20, def: 12, exp: 40, gold: 20 },
                { name: 'Ворон-Палач', image: 'executioner_crow.png', hp: 160, atk: 22, def: 13, exp: 45, gold: 22 },
                { name: 'Чумная Пикси', image: 'plague_pixie.png', hp: 180, atk: 25, def: 14, exp: 50, gold: 25 }
            ]
        },
        {
            id: 2, name: 'Кара Скверны',
            lore: 'Древний Дуб не просто рос в Шервуде. Он был выращен магией друидов над разломом, из которого сочилась безграничная сила. Когда дерево пало, разлом открылся. Скверна полезла из-под земли.',
            boss: { name: 'Вожак Искаженной Стаи', image: 'blight_alpha_stag.png', hp: 550, atk: 35, def: 18, exp: 200, gold: 130 },
            stages: 6, rewards: { exp: 400, gold: 100, silver: 1000 },
            enemies: [
                { name: 'Шервудский Дикобраз', image: 'shard_back.png', hp: 150, atk: 20, def: 10, exp: 40, gold: 20 },
                { name: 'Искажённый Бес', image: 'warped_imp.png', hp: 170, atk: 22, def: 12, exp: 45, gold: 22 },
                { name: 'Шипастый Секач', image: 'bristle_boar.png', hp: 190, atk: 25, def: 13, exp: 50, gold: 25 },
                { name: 'Кристальный Иглобрюх', image: 'quill_beast.png', hp: 210, atk: 28, def: 15, exp: 55, gold: 28 },
                { name: 'Личинка Короеда', image: 'grave_borer.png', hp: 230, atk: 30, def: 16, exp: 60, gold: 30 }
            ]
        },
        {
            id: 3, name: 'Старый Егерь',
            lore: 'Я был егерем в Шервуде всю свою жизнь. Когда Охотники пришли осквернять Дуб, я ничего не сделал. Ты должен спуститься под корни. Но ход преграждён.',
            boss: { name: 'Альфа-Гончая Егеря', image: 'huntsman_alpha_hound.png', hp: 700, atk: 42, def: 22, exp: 250, gold: 160 },
            stages: 6, rewards: { exp: 600, gold: 150, silver: 1500 },
            enemies: [
                { name: 'Повелитель Гнили', image: 'blight_lord_beetle.png', hp: 200, atk: 28, def: 14, exp: 50, gold: 25 },
                { name: 'Костяной Короед-Трупоед', image: 'bone_borer.png', hp: 220, atk: 30, def: 16, exp: 55, gold: 28 },
                { name: 'Жук-Короед', image: 'bark_beetle.png', hp: 240, atk: 32, def: 17, exp: 60, gold: 30 },
                { name: 'Чумной Короед-Страж', image: 'blight_beetle_warden.png', hp: 260, atk: 35, def: 18, exp: 65, gold: 32 },
                { name: 'Бронированный Короед', image: 'armored_beetle.png', hp: 280, atk: 38, def: 20, exp: 70, gold: 35 }
            ]
        },
        {
            id: 4, name: 'Спуск в Шервудскую Чащобу',
            lore: 'Под корнями Шервуда — сеть пещер и затопленных туннелей. Первым на твоём пути встаёт Падший Друид. Он думает, что всё ещё защищает лес. От таких, как ты.',
            boss: { name: 'Падший Друид', image: 'fallen_druid.png', hp: 850, atk: 48, def: 25, exp: 300, gold: 200 },
            stages: 6, rewards: { exp: 800, gold: 200, silver: 2000 },
            enemies: [
                { name: 'Корневой Палач', image: 'root_executioner.png', hp: 250, atk: 32, def: 16, exp: 60, gold: 30 },
                { name: 'Альфа-Скверноискатель', image: 'blight_alpha.png', hp: 270, atk: 35, def: 18, exp: 65, gold: 32 },
                { name: 'Волк Тисовой Скверны', image: 'yew_blight_wolf.png', hp: 290, atk: 38, def: 19, exp: 70, gold: 35 },
                { name: 'Болотный Слизнерот', image: 'swamp_slugmouth.png', hp: 310, atk: 40, def: 21, exp: 75, gold: 38 },
                { name: 'Скверножаб', image: 'swamp_gorgymouth.png', hp: 330, atk: 42, def: 22, exp: 80, gold: 40 }
            ]
        },
        {
            id: 5, name: 'Искажённая Экосистема',
            lore: 'Чем глубже, тем хуже. Твари здесь уже не похожи на зверей. Скверна переплавила их во что-то новое.',
            boss: { name: 'Голод Чащи', image: 'thicket_hunger.png', hp: 1000, atk: 55, def: 28, exp: 350, gold: 250 },
            stages: 6, rewards: { exp: 1000, gold: 250, silver: 2500 },
            enemies: [
                { name: 'Древний Владыка', image: 'blight_lord_leshy.png', hp: 300, atk: 38, def: 19, exp: 70, gold: 35 },
                { name: 'Голем Дуба', image: 'oak_golem.png', hp: 320, atk: 40, def: 21, exp: 75, gold: 38 },
                { name: 'Голем Скверного Дуба', image: 'blighted_oak_golem.png', hp: 340, atk: 42, def: 22, exp: 80, gold: 40 },
                { name: 'Хворост', image: 'twigtangle.png', hp: 360, atk: 45, def: 24, exp: 85, gold: 42 },
                { name: 'Древесный Ужас', image: 'woodland_terror.png', hp: 380, atk: 48, def: 25, exp: 90, gold: 45 }
            ]
        },
        {
            id: 6, name: 'Слепая Ярость Духов',
            lore: 'Глубже, где корни пробивают каменные своды, правит Леший. Рядом бродит Лесное лихо. Древний Владыка — последний страж первого яруса.',
            boss: { name: 'Древний Владыка', image: 'blight_lord_leshy.png', hp: 1200, atk: 62, def: 32, exp: 400, gold: 300 },
            stages: 6, rewards: { exp: 1500, gold: 350, silver: 3500 },
            enemies: [
                { name: 'Выжигающий Арахнид', image: 'searing_arachnid.png', hp: 350, atk: 42, def: 22, exp: 80, gold: 40 },
                { name: 'Слуга Лешего', image: 'leshy_servant.png', hp: 380, atk: 45, def: 24, exp: 85, gold: 42 },
                { name: 'Призрачный Олень', image: 'spectral_stag.png', hp: 410, atk: 48, def: 26, exp: 90, gold: 45 },
                { name: 'Лесное Лихо', image: 'forest_blight_cyclops.png', hp: 440, atk: 50, def: 28, exp: 95, gold: 48 },
                { name: 'Лихо-Троглодит', image: 'blight_troglodyte.png', hp: 470, atk: 55, def: 30, exp: 100, gold: 50 }
            ]
        },
        {
            id: 7, name: 'Эхо Прошлых Поражений',
            lore: 'Подземка забирает не только плоть. Погибшие здесь охотники и разбойники не нашли покоя.',
            boss: { name: 'Пожиратель Эха', image: 'echo_devourer.png', hp: 1400, atk: 70, def: 35, exp: 450, gold: 350 },
            stages: 6, rewards: { exp: 2000, gold: 500, silver: 5000 },
            enemies: [
                { name: 'Шервудский Ящер', image: 'sherwood_lizard.png', hp: 420, atk: 48, def: 26, exp: 90, gold: 45 },
                { name: 'Торфяной Владыка', image: 'peat_lord.png', hp: 450, atk: 52, def: 28, exp: 100, gold: 50 },
                { name: 'Заблудшая Дева', image: 'lost_maiden.png', hp: 480, atk: 55, def: 30, exp: 110, gold: 55 },
                { name: 'Болотная Ведьма', image: 'bog_witch.png', hp: 510, atk: 58, def: 32, exp: 120, gold: 60 },
                { name: 'Болотная Кикимора', image: 'swamp_kikimora.png', hp: 550, atk: 62, def: 35, exp: 130, gold: 65 }
            ]
        },
        {
            id: 8, name: 'Ужас Болотных Недр',
            lore: 'В самых тёмных гротах обитает Повелительница Топей. Она топит заживо.',
            boss: { name: 'Повелительница Топей', image: 'mistress_of_the_mires.png', hp: 1600, atk: 78, def: 38, exp: 500, gold: 400 },
            stages: 6, rewards: { exp: 2500, gold: 650, silver: 6500 },
            enemies: [
                { name: 'Водяной Скверны', image: 'swamp_vodyanoy.png', hp: 500, atk: 55, def: 30, exp: 110, gold: 55 },
                { name: 'Болотный Дракончик', image: 'swamp_drake.png', hp: 530, atk: 58, def: 32, exp: 120, gold: 60 },
                { name: 'Цербер Скверны', image: 'blight_cerberus.png', hp: 560, atk: 62, def: 34, exp: 130, gold: 65 },
                { name: 'Гниющий Волк', image: 'putrid_wolf.png', hp: 590, atk: 65, def: 36, exp: 140, gold: 70 },
                { name: 'Волк-Потрошитель', image: 'ripper_wolf.png', hp: 620, atk: 70, def: 38, exp: 150, gold: 75 }
            ]
        },
        {
            id: 9, name: 'Разломы Безумия',
            lore: 'Скверна переполнила Чащобу и прожгла реальность. Три разлома. Пока Страж жив, врата не закрыть.',
            boss: { name: 'Страж Разломов', image: 'rift_warden.png', hp: 1800, atk: 86, def: 42, exp: 550, gold: 450 },
            stages: 6, rewards: { exp: 3000, gold: 800, silver: 8000 },
            enemies: [
                { name: 'Повелитель Стаи', image: 'fox_pack_lord.png', hp: 580, atk: 62, def: 34, exp: 130, gold: 65 },
                { name: 'Базальтовый Пожиратель', image: 'basalt_devourer.png', hp: 610, atk: 65, def: 36, exp: 140, gold: 70 },
                { name: 'Громила Грота', image: 'grotto_brute.png', hp: 640, atk: 68, def: 38, exp: 150, gold: 75 },
                { name: 'Пещерный Наблюдатель', image: 'cave_watcher.png', hp: 670, atk: 72, def: 40, exp: 160, gold: 80 },
                { name: 'Рунический Страж', image: 'runic_sentinel.png', hp: 700, atk: 75, def: 42, exp: 170, gold: 85 }
            ]
        },
        {
            id: 10, name: 'Портал Нашествия — Улей Плоти',
            lore: 'Первый разлом — гнездо. В центре улья — Матка. Ослепи стража. Порази матку.',
            boss: { name: 'Матка Лесных Короедов', image: 'the_hive_mother.png', hp: 2000, atk: 95, def: 46, exp: 600, gold: 500 },
            stages: 6, rewards: { exp: 4000, gold: 1000, silver: 10000 },
            enemies: [
                { name: 'Чумная Летучая Мышь', image: 'plague_bat.png', hp: 650, atk: 68, def: 36, exp: 150, gold: 75 },
                { name: 'Огр Скверного Мха', image: 'blight_moss_ogre.png', hp: 680, atk: 72, def: 38, exp: 160, gold: 80 },
                { name: 'Искажённый Червь', image: 'warped_worm.png', hp: 710, atk: 75, def: 40, exp: 170, gold: 85 },
                { name: 'Гротный Слизень', image: 'grotto_slug.png', hp: 740, atk: 78, def: 42, exp: 180, gold: 90 },
                { name: 'Подземный Ужас', image: 'underground_terror.png', hp: 770, atk: 82, def: 44, exp: 190, gold: 95 }
            ]
        },
        {
            id: 11, name: 'Портал Искажения — Костяной Трон',
            lore: 'Второй разлом — склеп. Проклятый Король Разбойников умоляет об одном — убить его.',
            boss: { name: 'Проклятый Король Разбойников', image: 'the_cursed_outlaw_king.png', hp: 2300, atk: 105, def: 50, exp: 700, gold: 600 },
            stages: 6, rewards: { exp: 5000, gold: 1500, silver: 15000 },
            enemies: [
                { name: 'Пропавший Кладоискатель', image: 'lost_treasure_hunter.png', hp: 720, atk: 75, def: 40, exp: 170, gold: 85 },
                { name: 'Дочь Корней', image: 'root_daughter.png', hp: 750, atk: 78, def: 42, exp: 180, gold: 90 },
                { name: 'Костяной Арахнид', image: 'bone_arachnid.png', hp: 780, atk: 82, def: 44, exp: 190, gold: 95 },
                { name: 'Арахнид-Некромант', image: 'necromantic_arachnid.png', hp: 810, atk: 85, def: 46, exp: 200, gold: 100 },
                { name: 'Оживший Тис', image: 'animated_yew.png', hp: 840, atk: 88, def: 48, exp: 210, gold: 105 }
            ]
        },
        {
            id: 12, name: 'Портал Безумия — Кровоточащий Кап',
            lore: 'Третий портал — капище. Древний Хранитель Склепа. Последнее испытание перед спуском к Сердцу Шервуда.',
            boss: { name: 'Древний Хранитель Склепа', image: 'ancient_crypt_warden.png', hp: 2600, atk: 115, def: 55, exp: 800, gold: 700 },
            stages: 6, rewards: { exp: 6000, gold: 2000, silver: 20000 },
            enemies: [
                { name: 'Проклятая Жрица', image: 'cursed_priestess.png', hp: 800, atk: 82, def: 44, exp: 190, gold: 95 },
                { name: 'Истязатель', image: 'tormentor.png', hp: 830, atk: 85, def: 46, exp: 200, gold: 100 },
                { name: 'Могильный Лучник', image: 'grave_archer.png', hp: 860, atk: 88, def: 48, exp: 210, gold: 105 },
                { name: 'Ржавый Страх', image: 'rusty_dread.png', hp: 890, atk: 92, def: 50, exp: 220, gold: 110 },
                { name: 'Мечник Хаоса', image: 'chaos_swordsman.png', hp: 920, atk: 95, def: 52, exp: 230, gold: 115 }
            ]
        },
        {
            id: 13, name: 'Триумвират Зла',
            lore: 'Три разлома закрыты. Но их энергия слилась в Осквернённом Сердце Шервуда.',
            boss: { name: 'Эхо Трех Порталов', image: 'echo_of_the_triumvirate.png', hp: 3000, atk: 130, def: 60, exp: 900, gold: 800 },
            stages: 6, rewards: { exp: 7500, gold: 2500, silver: 25000 },
            enemies: [
                { name: 'Повелительница корней', image: 'mistress_of_the_roots.png', hp: 880, atk: 90, def: 48, exp: 210, gold: 105 },
                { name: 'Гарпия Хаоса', image: 'chaos_harpy.png', hp: 910, atk: 95, def: 50, exp: 220, gold: 110 },
                { name: 'Коршун Скверны', image: 'blight_kite.png', hp: 940, atk: 98, def: 52, exp: 230, gold: 115 },
                { name: 'Вождь Гарпий', image: 'harpy_chieftain.png', hp: 970, atk: 102, def: 54, exp: 240, gold: 120 },
                { name: 'Гарпия-Ведьма', image: 'harpy_witch.png', hp: 1000, atk: 105, def: 56, exp: 250, gold: 125 }
            ]
        },
        {
            id: 14, name: 'Сломанная Печать',
            lore: 'Перед Сердцем — последний страж. Капитан Охотников. Он стал Палачом Священного Древа.',
            boss: { name: 'Палач Священного Древа', image: 'sacred_tree_executioner.png', hp: 3500, atk: 145, def: 68, exp: 1000, gold: 900 },
            stages: 6, rewards: { exp: 9000, gold: 3000, silver: 30000 },
            enemies: [
                { name: 'Лорд Хаоса', image: 'chaos_lord.png', hp: 950, atk: 95, def: 50, exp: 230, gold: 115 },
                { name: 'Пещерный Терзатель', image: 'cave_tormentor.png', hp: 980, atk: 98, def: 52, exp: 240, gold: 120 },
                { name: 'Хранитель Скверны', image: 'blight_keeper.png', hp: 1010, atk: 102, def: 54, exp: 250, gold: 125 },
                { name: 'Скверный Король', image: 'blight_king.png', hp: 1040, atk: 105, def: 56, exp: 260, gold: 130 },
                { name: 'Страж Преисподней', image: 'underworld_guardian.png', hp: 1070, atk: 110, def: 58, exp: 270, gold: 135 }
            ]
        },
        {
            id: 15, name: 'Последний Выстрел',
            lore: 'Палач повержен. Из бездны поднимается Шервудское Отродье. Натяни тетиву. Пронзи ядро.',
            boss: { name: 'Шервудское Отродье', image: 'sherwood_abomination.png', hp: 4500, atk: 170, def: 80, exp: 1500, gold: 1200 },
            stages: 6, rewards: { exp: 12000, gold: 5000, silver: 50000 },
            enemies: [
                { name: 'Хозяин Пернатых', image: 'lord_of_the_feathered.png', hp: 1050, atk: 105, def: 55, exp: 260, gold: 130 },
                { name: 'Гарпия-Ведьма', image: 'harpy_witch.png', hp: 1080, atk: 108, def: 57, exp: 270, gold: 135 },
                { name: 'Птенец Гарпии', image: 'harpy_hatchling.png', hp: 1110, atk: 112, def: 59, exp: 280, gold: 140 },
                { name: 'Слепой Терзатель', image: 'blind_render.png', hp: 1140, atk: 115, def: 61, exp: 290, gold: 145 },
                { name: 'Енот Порчи', image: 'corruption_raccoon.png', hp: 1170, atk: 118, def: 63, exp: 300, gold: 150 }
            ]
        }
    ],

    SECRET_CHAPTER: {
        id: 'secret', name: 'Шрам, который не заживёт',
        lore: 'Отродье пало. Но скверна не исчезла. На дне — Изначальный Стержень. Глаз того, кто спит под Шервудом.',
        boss: { name: 'Изначальный Стержень', image: 'the_primordial_core.png', hp: 2500, atk: 100, def: 50, exp: 1000, gold: 300 },
        stages: 6, rewards: { exp: 2000, gold: 500, silver: 1500 },
        enemies: [
            { name: 'Рыцарь Хаоса', image: 'chaos_knight.png', hp: 800, atk: 60, def: 30, exp: 200, gold: 50 },
            { name: 'Владыка Пепла', image: 'ash_overlord.png', hp: 1000, atk: 70, def: 35, exp: 250, gold: 60 },
            { name: 'Корневой Палач', image: 'root_executioner.png', hp: 900, atk: 75, def: 28, exp: 200, gold: 50 },
            { name: 'Лорд Хаоса', image: 'chaos_lord.png', hp: 950, atk: 65, def: 32, exp: 220, gold: 55 },
            { name: 'Енот Порчи', image: 'corruption_raccoon.png', hp: 2200, atk: 90, def: 45, exp: 800, gold: 250 }
        ],
        trophy: { attack: 300, defense: 200, hp: 2500, name: 'Лук Жнеца Душ', icon: 'assets/all_trophies/soul_reaper\'s_bow_trophy.png' }
    },

    TROPHY_DATA: {
        1: { attack: 7, defense: 7, hp: 70, name: 'Сломанный Охотничий Рог', icon: 'assets/all_trophies/trophies_chapters/chapter_1_broken_hunting_horn_of_the_league.png' },
        2: { attack: 12, defense: 12, hp: 120, name: 'Песочные Часы Разбойников', icon: 'assets/all_trophies/trophies_chapters/chapter_2_the_hourglass_of_the_robbers.png' },
        3: { attack: 18, defense: 18, hp: 180, name: 'Наконечник Стрелы Шерифа', icon: 'assets/all_trophies/trophies_chapters/chapter_3_heavy_tip.png' },
        4: { attack: 22, defense: 22, hp: 220, name: 'Коготь Чумной Гарпии', icon: 'assets/all_trophies/trophies_chapters/chapter_4_the_claw_of_the_plague_harpy.png' },
        5: { attack: 30, defense: 30, hp: 300, name: 'Шлем-Клетка Палача', icon: 'assets/all_trophies/trophies_chapters/chapter_5_executioner\'s_cage_helmet.png' },
        6: { attack: 37, defense: 37, hp: 370, name: 'Слиток Подземного Железа', icon: 'assets/all_trophies/trophies_chapters/chapter_6_ingot_of_underground_iron.png' },
        7: { attack: 45, defense: 45, hp: 450, name: 'Костяной Диск Наемников', icon: 'assets/all_trophies/trophies_chapters/chapter_7_mercenary_bone_disc.png' },
        8: { attack: 52, defense: 52, hp: 520, name: 'Изумрудная Друза Пещер', icon: 'assets/all_trophies/trophies_chapters/chapter_8_emerald_druse_of_caves.png' },
        9: { attack: 60, defense: 60, hp: 600, name: 'Проклятый Ключ Стража', icon: 'assets/all_trophies/trophies_chapters/chapter_9_cursed_guardian_Key.png' },
        10: { attack: 75, defense: 75, hp: 750, name: 'Зеркало Слепого Провидца', icon: 'assets/all_trophies/trophies_chapters/chapter_10_the_mirror_of_the_blind_seer.png' },
        11: { attack: 90, defense: 90, hp: 900, name: 'Забрало Королевского Шлема', icon: 'assets/all_trophies/trophies_chapters/chapter_11_visor_of_the_royal_helmet.png' },
        12: { attack: 112, defense: 112, hp: 1120, name: 'Наконечник Скипетра Власти', icon: 'assets/all_trophies/trophies_chapters/chapter_12_tip_of_the_scepter_of_power.png' },
        13: { attack: 135, defense: 135, hp: 1350, name: 'Кубок Оскверненного Грааля', icon: 'assets/all_trophies/trophies_chapters/chapter_13_cup_of_the_defiled_grail.png' },
        14: { attack: 165, defense: 165, hp: 1650, name: 'Наконечник Знамени Командора', icon: 'assets/all_trophies/trophies_chapters/chapter_14_the_commander\'s_banner\'s_tip.png' },
        15: { attack: 225, defense: 225, hp: 2250, name: 'Живое Око Бездны', icon: 'assets/all_trophies/trophies_chapters/chapter_15_Living_eye_of_the_abyss.png' }
    },

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p.questProgress) p.questProgress = { completed: [], currentChapter: 1, secretCompleted: false };
        if (!p.questAttempts) p.questAttempts = { today: 0, lastDate: '', freeAccel: false, accelUsed: 0, lastAttempt: 0 };
        var today = new Date().toDateString();
        if (p.questAttempts.lastDate !== today) { p.questAttempts.today = 0; p.questAttempts.lastDate = today; p.questAttempts.freeAccel = false; }
        this._attemptsToday = p.questAttempts.today || 0;
        this._freeAccelUsed = p.questAttempts.freeAccel || false;
        this._lastAttempt = p.questAttempts.lastAttempt || 0;
    },

    getChapter: function(id) {
        if (id === 'secret') return this.SECRET_CHAPTER;
        for (var i = 0; i < this.CHAPTERS.length; i++) { if (this.CHAPTERS[i].id === id) return this.CHAPTERS[i]; }
        return null;
    },
    getAllChapters: function() { return this.CHAPTERS; },
    getProgress: function() { return Sherwood.getPlayer().questProgress; },
    isUnlocked: function() { return true; },
    isOnCooldown: function() { return Date.now() - this._lastAttempt < 30 * 60 * 1000; },
    getCooldownRemaining: function() { var r = 30 * 60 * 1000 - (Date.now() - this._lastAttempt); return r <= 0 ? 0 : Math.ceil(r / 60000); },
    getAccelCost: function() {
        var p = Sherwood.getPlayer();
        var used = p.questAttempts ? (p.questAttempts.accelUsed || 0) : 0;
        if (used === 0 && !this._freeAccelUsed) return { cost: 0, currency: 'free' };
        var costs = [30, 60, 100, 150, 220, 300];
        var idx = Math.min(used - (this._freeAccelUsed ? 0 : 1), costs.length - 1);
        if (idx < 0) idx = 0;
        return { cost: costs[idx], currency: 'gold' };
    },
    accelerate: function() {
        if (!this.isOnCooldown()) return { success: false, reason: 'Нет перезарядки' };
        var info = this.getAccelCost();
        var p = Sherwood.getPlayer();
        if (info.currency === 'free') { this._freeAccelUsed = true; p.questAttempts.freeAccel = true; }
        else { if ((p.resources.gold || 0) < info.cost) return { success: false, reason: 'Недостаточно золота' }; p.resources.gold -= info.cost; p.questAttempts.accelUsed = (p.questAttempts.accelUsed || 0) + 1; }
        this._lastAttempt = 0; p.questAttempts.lastAttempt = 0;
        Sherwood.saveGame(); return { success: true };
    },
    getAttemptsToday: function() { return this._attemptsToday; },
    getBattle: function() {
        if (!this._currentEnemy) return null;
        return { chapter: this._currentChapter, stage: this._currentStage + 1, total: this._currentChapter.stages, enemy: this._currentEnemy };
    },
    startChapter: function(id) {
        var ch = this.getChapter(id);
        if (!ch) return { success: false, reason: 'Глава не найдена' };
        if (this.isOnCooldown()) return { success: false, reason: 'Перезарядка ' + this.getCooldownRemaining() + ' мин.', cooldown: true };
        var p = Sherwood.getPlayer();
        p.stats.hp = p.stats.maxHp;
        if (this._currentChapter && this._currentChapter.id === id && this._currentEnemy) {
            this._inBattle = true; this._lastAttempt = Date.now(); p.questAttempts.lastAttempt = this._lastAttempt;
            Sherwood.saveGame();
            return { success: true, chapter: ch, enemy: this._currentEnemy, stage: this._currentStage + 1, total: ch.stages };
        }
        this._currentChapter = ch; this._currentStage = 0;
        var firstEnemy = ch.enemies[0];
        this._currentEnemy = { name: firstEnemy.name, image: firstEnemy.image, hp: firstEnemy.hp, maxHp: firstEnemy.hp, atk: firstEnemy.atk, def: firstEnemy.def, exp: firstEnemy.exp, gold: firstEnemy.gold, isBoss: false };
        this._inBattle = true; this._lastAttempt = Date.now();
        p.questAttempts.today = (p.questAttempts.today || 0) + 1; p.questAttempts.lastAttempt = this._lastAttempt;
        this._attemptsToday = p.questAttempts.today;
        Sherwood.saveGame();
        return { success: true, chapter: ch, enemy: this._currentEnemy, stage: 1, total: ch.stages };
    },
    attack: function() {
        if (!this._inBattle) return null;
        var p = Sherwood.getPlayer(); var e = this._currentEnemy; if (!e) return null;
        var armorReduction = e.def / (e.def + p.stats.attack * 1.5);
        var dmg = Math.max(1, Math.floor(p.stats.attack * (1 - armorReduction)));
        var crit = Math.random() * 100 < 15; if (crit) dmg = Math.floor(dmg * 1.8);
        e.hp -= dmg; if (e.hp < 0) e.hp = 0;
        var r = { damage: dmg, crit: crit, enemyHp: e.hp, enemyMaxHp: e.maxHp, enemyDead: e.hp <= 0 };
        if (e.hp <= 0) {
            if (Sherwood.Bestiary && e.image) Sherwood.Bestiary.registerKill(e.image);
            Sherwood.addExp(e.exp);
            if (this._attemptsToday <= 4) Sherwood.addResource('gold', e.gold);
            if (Math.random() < 0.15) Sherwood.addResource('scrolls', 1);
            this._currentStage++; var ch = this._currentChapter;
            if (this._currentStage >= ch.stages) {
                this._inBattle = false; r.chapterComplete = true; r.rewards = ch.rewards;
                var p2 = Sherwood.getPlayer();
                if (p2.questProgress.completed.indexOf(ch.id) === -1) {
                    p2.questProgress.completed.push(ch.id);
                    if (ch.id < 15) p2.questProgress.currentChapter = ch.id + 1;
                    var td = this.TROPHY_DATA[ch.id];
                    if (td && typeof Sherwood.addTrophy === 'function') { Sherwood.addTrophy('chapter_' + ch.id, td.name, { attack: td.attack, defense: td.defense, hp: td.hp }, td.icon, 'chapter'); }
                    if (ch.id === 15 && !p2.questProgress.secretCompleted) { p2.questProgress.secretCompleted = false; }
                }
                this._currentChapter = null; this._currentEnemy = null; this._currentStage = 0;
            } else if (this._currentStage < ch.enemies.length) {
                var nextEnemy = ch.enemies[this._currentStage];
                this._currentEnemy = { name: nextEnemy.name, image: nextEnemy.image, hp: nextEnemy.hp, maxHp: nextEnemy.hp, atk: nextEnemy.atk, def: nextEnemy.def, exp: nextEnemy.exp, gold: nextEnemy.gold, isBoss: false };
                r.stageComplete = true;
            } else {
                var bossEnemy = ch.boss;
                this._currentEnemy = { name: bossEnemy.name, image: bossEnemy.image, hp: bossEnemy.hp, maxHp: bossEnemy.hp, atk: bossEnemy.atk, def: bossEnemy.def, exp: bossEnemy.exp, gold: bossEnemy.gold, isBoss: true };
                r.stageComplete = true;
            }
        } else {
            var armorReductionE = p.stats.defense / (p.stats.defense + e.atk * 1.5);
            var edmg = Math.max(1, Math.floor(e.atk * (1 - armorReductionE)));
            p.stats.hp = Math.max(0, p.stats.hp - edmg);
            r.enemyDamage = edmg; r.playerHp = p.stats.hp; r.playerDead = p.stats.hp <= 0;
            if (p.stats.hp <= 0) { this._inBattle = false; r.lose = true; }
        }
        Sherwood.saveGame();
        return r;
    },
    flee: function() { this._inBattle = false; this._currentEnemy = null; return { success: true }; }
};

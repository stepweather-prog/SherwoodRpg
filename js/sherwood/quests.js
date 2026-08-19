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
            lore: 'Шервуд не всегда был могильником. В его сердце стоял Древний Дуб — щит, веками сдерживающий то, что спит под землей.',
            boss: { name: 'Лесничий-Отступник', image: 'fallen_forester.png', hp: 8000, atk: 800, def: 800, exp: 150, gold: 100 },
            stages: 6, rewards: { exp: 200, gold: 50, silver: 500 },
            enemies: [
                { name: 'Чумной Ворон', image: 'plague_crow.png', hp: 1000, atk: 400, def: 200, exp: 30, gold: 15 },
                { name: 'Костяной Стервятник', image: 'bone_vulture.png', hp: 1500, atk: 500, def: 250, exp: 35, gold: 18 },
                { name: 'Ворон-Палач', image: 'executioner_crow.png', hp: 2000, atk: 550, def: 300, exp: 40, gold: 20 },
                { name: 'Чумная Пикси', image: 'plague_pixie.png', hp: 2500, atk: 600, def: 400, exp: 45, gold: 22 },
                { name: 'Лесной Душегуб', image: 'forest_strangler.png', hp: 3000, atk: 600, def: 500, exp: 50, gold: 25 }
            ]
        },
        {
            id: 2, name: 'Кара Скверны',
            lore: 'Древний Дуб был выращен магией друидов над разломом. Когда дерево пало, разлом открылся.',
            boss: { name: 'Вожак Искаженной Стаи', image: 'blight_alpha_stag.png', hp: 35000, atk: 2500, def: 2000, exp: 200, gold: 130 },
            stages: 6, rewards: { exp: 400, gold: 100, silver: 1000 },
            enemies: [
                { name: 'Искажённый Бес', image: 'warped_imp.png', hp: 4000, atk: 1200, def: 800, exp: 40, gold: 20 },
                { name: 'Шипастый Секач', image: 'bristle_boar.png', hp: 5500, atk: 1400, def: 900, exp: 45, gold: 22 },
                { name: 'Кристальный Иглобрюх', image: 'quill_beast.png', hp: 7000, atk: 1600, def: 1000, exp: 50, gold: 25 },
                { name: 'Личинка Короеда', image: 'grave_borer.png', hp: 9000, atk: 1800, def: 1200, exp: 55, gold: 28 },
                { name: 'Шервудский Дикобраз', image: 'shard_back.png', hp: 12000, atk: 2000, def: 1500, exp: 60, gold: 30 }
            ]
        },
        {
            id: 3, name: 'Старый Егерь',
            lore: 'Ты должен спуститься под корни. Но ход преграждён.',
            boss: { name: 'Альфа-Гончая Егеря', image: 'huntsman_alpha_hound.png', hp: 90000, atk: 4500, def: 3500, exp: 250, gold: 160 },
            stages: 6, rewards: { exp: 600, gold: 150, silver: 1500 },
            enemies: [
                { name: 'Костяной Короед-Трупоед', image: 'bone_borer.png', hp: 9000, atk: 2500, def: 1800, exp: 50, gold: 25 },
                { name: 'Жук-Короед', image: 'bark_beetle.png', hp: 12000, atk: 2800, def: 2000, exp: 55, gold: 28 },
                { name: 'Чумной Короед-Страж', image: 'blight_beetle_warden.png', hp: 16000, atk: 3100, def: 2300, exp: 60, gold: 30 },
                { name: 'Бронированный Короед', image: 'armored_beetle.png', hp: 22000, atk: 3400, def: 2700, exp: 65, gold: 32 },
                { name: 'Повелитель Гнили', image: 'blight_lord_beetle.png', hp: 30000, atk: 3500, def: 3000, exp: 70, gold: 35 }
            ]
        },
        {
            id: 4, name: 'Спуск в Шервудскую Чащобу',
            lore: 'Первым на твоём пути встаёт Падший Друид.',
            boss: { name: 'Падший Друид', image: 'fallen_druid.png', hp: 180000, atk: 7000, def: 5500, exp: 300, gold: 200 },
            stages: 6, rewards: { exp: 800, gold: 200, silver: 2000 },
            enemies: [
                { name: 'Альфа-Скверноискатель', image: 'blight_alpha.png', hp: 16000, atk: 4000, def: 3000, exp: 60, gold: 30 },
                { name: 'Волк Тисовой Скверны', image: 'yew_blight_wolf.png', hp: 21000, atk: 4300, def: 3300, exp: 65, gold: 32 },
                { name: 'Болотный Слизнерот', image: 'swamp_slugmouth.png', hp: 28000, atk: 4700, def: 3700, exp: 70, gold: 35 },
                { name: 'Скверножаб', image: 'swamp_gorgymouth.png', hp: 38000, atk: 5100, def: 4200, exp: 75, gold: 38 },
                { name: 'Корневой Палач', image: 'root_executioner.png', hp: 55000, atk: 5500, def: 4500, exp: 80, gold: 40 }
            ]
        },
        {
            id: 5, name: 'Искажённая Экосистема',
            lore: 'Чем глубже, тем хуже. Твари здесь уже не похожи на зверей.',
            boss: { name: 'Голод Чащи', image: 'thicket_hunger.png', hp: 300000, atk: 9500, def: 7500, exp: 350, gold: 250 },
            stages: 6, rewards: { exp: 1000, gold: 250, silver: 2500 },
            enemies: [
                { name: 'Голем Дуба', image: 'oak_golem.png', hp: 25000, atk: 5500, def: 4200, exp: 70, gold: 35 },
                { name: 'Голем Скверного Дуба', image: 'blighted_oak_golem.png', hp: 33000, atk: 5900, def: 4600, exp: 75, gold: 38 },
                { name: 'Хворост', image: 'twigtangle.png', hp: 44000, atk: 6400, def: 5100, exp: 80, gold: 40 },
                { name: 'Древесный Ужас', image: 'woodland_terror.png', hp: 60000, atk: 6900, def: 5600, exp: 85, gold: 42 },
                { name: 'Древний Владыка', image: 'blight_lord_leshy.png', hp: 90000, atk: 7500, def: 6000, exp: 90, gold: 45 }
            ]
        },
        {
            id: 6, name: 'Слепая Ярость Духов',
            lore: 'Глубже, где корни пробивают каменные своды, правит Леший.',
            boss: { name: 'Древний Владыка', image: 'blight_lord_leshy.png', hp: 450000, atk: 12000, def: 9500, exp: 400, gold: 300 },
            stages: 6, rewards: { exp: 1500, gold: 350, silver: 3500 },
            enemies: [
                { name: 'Слуга Лешего', image: 'leshy_servant.png', hp: 35000, atk: 7000, def: 5500, exp: 80, gold: 40 },
                { name: 'Призрачный Олень', image: 'spectral_stag.png', hp: 46000, atk: 7500, def: 6000, exp: 85, gold: 42 },
                { name: 'Лесное Лихо', image: 'forest_blight_cyclops.png', hp: 62000, atk: 8100, def: 6600, exp: 90, gold: 45 },
                { name: 'Лихо-Троглодит', image: 'blight_troglodyte.png', hp: 84000, atk: 8800, def: 7300, exp: 95, gold: 48 },
                { name: 'Выжигающий Арахнид', image: 'searing_arachnid.png', hp: 130000, atk: 9500, def: 7500, exp: 100, gold: 50 }
            ]
        },
        {
            id: 7, name: 'Эхо Прошлых Поражений',
            lore: 'Подземка забирает не только плоть. Погибшие не нашли покоя.',
            boss: { name: 'Пожиратель Эха', image: 'echo_devourer.png', hp: 650000, atk: 14500, def: 11500, exp: 450, gold: 350 },
            stages: 6, rewards: { exp: 2000, gold: 500, silver: 5000 },
            enemies: [
                { name: 'Торфяной Владыка', image: 'peat_lord.png', hp: 48000, atk: 8500, def: 6800, exp: 90, gold: 45 },
                { name: 'Заблудшая Дева', image: 'lost_maiden.png', hp: 64000, atk: 9100, def: 7400, exp: 100, gold: 50 },
                { name: 'Болотная Ведьма', image: 'bog_witch.png', hp: 86000, atk: 9800, def: 8100, exp: 110, gold: 55 },
                { name: 'Болотная Кикимора', image: 'swamp_kikimora.png', hp: 116000, atk: 10600, def: 8900, exp: 120, gold: 60 },
                { name: 'Шервудский Ящер', image: 'sherwood_lizard.png', hp: 180000, atk: 11500, def: 9000, exp: 130, gold: 65 }
            ]
        },
        {
            id: 8, name: 'Ужас Болотных Недр',
            lore: 'В самых тёмных гротах обитает Повелительница Топей.',
            boss: { name: 'Повелительница Топей', image: 'mistress_of_the_mires.png', hp: 900000, atk: 17000, def: 13500, exp: 500, gold: 400 },
            stages: 6, rewards: { exp: 2500, gold: 650, silver: 6500 },
            enemies: [
                { name: 'Болотный Дракончик', image: 'swamp_drake.png', hp: 62000, atk: 10000, def: 8200, exp: 110, gold: 55 },
                { name: 'Цербер Скверны', image: 'blight_cerberus.png', hp: 83000, atk: 10700, def: 8900, exp: 120, gold: 60 },
                { name: 'Гниющий Волк', image: 'putrid_wolf.png', hp: 112000, atk: 11500, def: 9700, exp: 130, gold: 65 },
                { name: 'Волк-Потрошитель', image: 'ripper_wolf.png', hp: 152000, atk: 12400, def: 10600, exp: 140, gold: 70 },
                { name: 'Водяной Скверны', image: 'swamp_vodyanoy.png', hp: 240000, atk: 13500, def: 10500, exp: 150, gold: 75 }
            ]
        },
        {
            id: 9, name: 'Разломы Безумия',
            lore: 'Три разлома. Пока Страж жив, врата не закрыть.',
            boss: { name: 'Страж Разломов', image: 'rift_warden.png', hp: 1200000, atk: 19500, def: 15500, exp: 550, gold: 450 },
            stages: 6, rewards: { exp: 3000, gold: 800, silver: 8000 },
            enemies: [
                { name: 'Базальтовый Пожиратель', image: 'basalt_devourer.png', hp: 78000, atk: 11500, def: 9500, exp: 130, gold: 65 },
                { name: 'Громила Грота', image: 'grotto_brute.png', hp: 105000, atk: 12300, def: 10300, exp: 140, gold: 70 },
                { name: 'Пещерный Наблюдатель', image: 'cave_watcher.png', hp: 142000, atk: 13200, def: 11200, exp: 150, gold: 75 },
                { name: 'Рунический Страж', image: 'runic_sentinel.png', hp: 192000, atk: 14200, def: 12200, exp: 160, gold: 80 },
                { name: 'Повелитель Стаи', image: 'fox_pack_lord.png', hp: 310000, atk: 15500, def: 12000, exp: 170, gold: 85 }
            ]
        },
        {
            id: 10, name: 'Портал Нашествия — Улей Плоти',
            lore: 'Первый разлом — гнездо. В центре улья — Матка.',
            boss: { name: 'Матка Лесных Короедов', image: 'the_hive_mother.png', hp: 1600000, atk: 22000, def: 17500, exp: 600, gold: 500 },
            stages: 6, rewards: { exp: 4000, gold: 1000, silver: 10000 },
            enemies: [
                { name: 'Огр Скверного Мха', image: 'blight_moss_ogre.png', hp: 95000, atk: 13000, def: 11000, exp: 150, gold: 75 },
                { name: 'Искажённый Червь', image: 'warped_worm.png', hp: 128000, atk: 13900, def: 11900, exp: 160, gold: 80 },
                { name: 'Гротный Слизень', image: 'grotto_slug.png', hp: 174000, atk: 14900, def: 12900, exp: 170, gold: 85 },
                { name: 'Подземный Ужас', image: 'underground_terror.png', hp: 236000, atk: 16000, def: 14000, exp: 180, gold: 90 },
                { name: 'Чумная Летучая Мышь', image: 'plague_bat.png', hp: 390000, atk: 17500, def: 13500, exp: 190, gold: 95 }
            ]
        },
        {
            id: 11, name: 'Портал Искажения — Костяной Трон',
            lore: 'Проклятый Король Разбойников умоляет об одном — убить его.',
            boss: { name: 'Проклятый Король Разбойников', image: 'the_cursed_outlaw_king.png', hp: 2100000, atk: 24500, def: 19500, exp: 700, gold: 600 },
            stages: 6, rewards: { exp: 5000, gold: 1500, silver: 15000 },
            enemies: [
                { name: 'Дочь Корней', image: 'root_daughter.png', hp: 115000, atk: 14500, def: 12500, exp: 170, gold: 85 },
                { name: 'Костяной Арахнид', image: 'bone_arachnid.png', hp: 156000, atk: 15500, def: 13500, exp: 180, gold: 90 },
                { name: 'Арахнид-Некромант', image: 'necromantic_arachnid.png', hp: 212000, atk: 16600, def: 14600, exp: 190, gold: 95 },
                { name: 'Оживший Тис', image: 'animated_yew.png', hp: 288000, atk: 17800, def: 15800, exp: 200, gold: 100 },
                { name: 'Пропавший Кладоискатель', image: 'lost_treasure_hunter.png', hp: 480000, atk: 19500, def: 15000, exp: 210, gold: 105 }
            ]
        },
        {
            id: 12, name: 'Портал Безумия — Кровоточащий Кап',
            lore: 'Третий портал. Древний Хранитель Склепа. Последнее испытание.',
            boss: { name: 'Древний Хранитель Склепа', image: 'ancient_crypt_warden.png', hp: 2700000, atk: 27000, def: 21500, exp: 800, gold: 700 },
            stages: 6, rewards: { exp: 6000, gold: 2000, silver: 20000 },
            enemies: [
                { name: 'Истязатель', image: 'tormentor.png', hp: 135000, atk: 16000, def: 14000, exp: 190, gold: 95 },
                { name: 'Могильный Лучник', image: 'grave_archer.png', hp: 184000, atk: 17100, def: 15100, exp: 200, gold: 100 },
                { name: 'Ржавый Страх', image: 'rusty_dread.png', hp: 250000, atk: 18300, def: 16300, exp: 210, gold: 105 },
                { name: 'Мечник Хаоса', image: 'chaos_swordsman.png', hp: 340000, atk: 19600, def: 17600, exp: 220, gold: 110 },
                { name: 'Проклятая Жрица', image: 'cursed_priestess.png', hp: 580000, atk: 21500, def: 16500, exp: 230, gold: 115 }
            ]
        },
        {
            id: 13, name: 'Триумвират Зла',
            lore: 'Три разлома закрыты. Но их энергия слилась воедино.',
            boss: { name: 'Эхо Трех Порталов', image: 'echo_of_the_triumvirate.png', hp: 3400000, atk: 29500, def: 23500, exp: 900, gold: 800 },
            stages: 6, rewards: { exp: 7500, gold: 2500, silver: 25000 },
            enemies: [
                { name: 'Гарпия Хаоса', image: 'chaos_harpy.png', hp: 160000, atk: 17500, def: 15500, exp: 210, gold: 105 },
                { name: 'Коршун Скверны', image: 'blight_kite.png', hp: 218000, atk: 18700, def: 16700, exp: 220, gold: 110 },
                { name: 'Вождь Гарпий', image: 'harpy_chieftain.png', hp: 296000, atk: 20000, def: 18000, exp: 230, gold: 115 },
                { name: 'Гарпия-Ведьма', image: 'harpy_witch.png', hp: 400000, atk: 21400, def: 19400, exp: 240, gold: 120 },
                { name: 'Повелительница корней', image: 'mistress_of_the_roots.png', hp: 700000, atk: 23500, def: 18000, exp: 250, gold: 125 }
            ]
        },
        {
            id: 14, name: 'Сломанная Печать',
            lore: 'Перед Сердцем — последний страж. Палач Священного Древа.',
            boss: { name: 'Палач Священного Древа', image: 'sacred_tree_executioner.png', hp: 4200000, atk: 32000, def: 25500, exp: 1000, gold: 900 },
            stages: 6, rewards: { exp: 9000, gold: 3000, silver: 30000 },
            enemies: [
                { name: 'Пещерный Терзатель', image: 'cave_tormentor.png', hp: 185000, atk: 19000, def: 17000, exp: 230, gold: 115 },
                { name: 'Хранитель Скверны', image: 'blight_keeper.png', hp: 252000, atk: 20300, def: 18300, exp: 240, gold: 120 },
                { name: 'Скверный Король', image: 'blight_king.png', hp: 342000, atk: 21700, def: 19700, exp: 250, gold: 125 },
                { name: 'Страж Преисподней', image: 'underworld_guardian.png', hp: 460000, atk: 23200, def: 21200, exp: 260, gold: 130 },
                { name: 'Лорд Хаоса', image: 'chaos_lord.png', hp: 830000, atk: 25500, def: 19500, exp: 270, gold: 135 }
            ]
        },
        {
            id: 15, name: 'Последний Выстрел',
            lore: 'Палач повержен. Из бездны поднимается Шервудское Отродье.',
            boss: { name: 'Шервудское Отродье', image: 'sherwood_abomination.png', hp: 5200000, atk: 34500, def: 27500, exp: 1500, gold: 1200 },
            stages: 6, rewards: { exp: 12000, gold: 5000, silver: 50000 },
            enemies: [
                { name: 'Гарпия-Ведьма', image: 'harpy_witch.png', hp: 210000, atk: 20500, def: 18500, exp: 260, gold: 130 },
                { name: 'Птенец Гарпии', image: 'harpy_hatchling.png', hp: 286000, atk: 21900, def: 19900, exp: 270, gold: 135 },
                { name: 'Слепой Терзатель', image: 'blind_render.png', hp: 388000, atk: 23400, def: 21400, exp: 280, gold: 140 },
                { name: 'Енот Порчи', image: 'corruption_raccoon.png', hp: 520000, atk: 25000, def: 23000, exp: 290, gold: 145 },
                { name: 'Хозяин Пернатых', image: 'lord_of_the_feathered.png', hp: 980000, atk: 27500, def: 21000, exp: 300, gold: 150 }
            ]
        }
    ],

    SECRET_CHAPTER: {
        id: 'secret', name: 'Шрам, который не заживёт',
        lore: 'Отродье пало. Но скверна не исчезла.',
        boss: { name: 'Изначальный Стержень', image: 'the_primordial_core.png', hp: 1500000, atk: 30000, def: 25000, exp: 1000, gold: 300 },
        stages: 6, rewards: { exp: 2000, gold: 500, silver: 1500 },
        enemies: [
            { name: 'Рыцарь Хаоса', image: 'chaos_knight.png', hp: 240000, atk: 22000, def: 20000, exp: 200, gold: 50 },
            { name: 'Владыка Пепла', image: 'ash_overlord.png', hp: 350000, atk: 24000, def: 22000, exp: 250, gold: 60 },
            { name: 'Корневой Палач', image: 'root_executioner.png', hp: 500000, atk: 26000, def: 24000, exp: 300, gold: 70 },
            { name: 'Лорд Хаоса', image: 'chaos_lord.png', hp: 700000, atk: 28000, def: 26000, exp: 400, gold: 80 },
            { name: 'Енот Порчи', image: 'corruption_raccoon.png', hp: 1000000, atk: 30000, def: 28000, exp: 800, gold: 250 }
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
        var rawDamage = Math.max(1, Math.floor((p.stats.attack - e.def) * 0.4 + p.stats.attack * 0.1));
        var crit = Math.random() * 100 < 15; if (crit) rawDamage = Math.floor(rawDamage * 1.8);
        e.hp -= rawDamage; if (e.hp < 0) e.hp = 0;
        var r = { damage: rawDamage, crit: crit, enemyHp: e.hp, enemyMaxHp: e.maxHp, enemyDead: e.hp <= 0 };
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
            var enemyDamage = Math.max(1, Math.floor((e.atk - p.stats.defense) * 0.3 + e.atk * 0.05));
            p.stats.hp = Math.max(0, p.stats.hp - enemyDamage);
            r.enemyDamage = enemyDamage; r.playerHp = p.stats.hp; r.playerDead = p.stats.hp <= 0;
            if (p.stats.hp <= 0) { this._inBattle = false; r.lose = true; }
        }
        Sherwood.saveGame();
        return r;
    },
    flee: function() { this._inBattle = false; this._currentEnemy = null; return { success: true }; }
};

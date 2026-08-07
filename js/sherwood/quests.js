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
            id: 1, name: 'Проклятие Зелёного Сердца',
            lore: 'Шервудский лес отравлен. Из расколотых недр хлынула сизая порча. Первыми жертвами стали рудокопы — их раздувшиеся тела намертво обвил неоновый мох.',
            boss: { name: 'Лесное Лихо', image: 'image (46).png', hp: 400, atk: 28, def: 15, exp: 150, gold: 100 },
            stages: 6, rewards: { exp: 200, gold: 50, silver: 500 },
            enemies: [
                { name: 'Леший', image: 'image (1).png', hp: 100, atk: 15, def: 8, exp: 30, gold: 15 },
                { name: 'Проклятый олень', image: 'image (3).png', hp: 120, atk: 18, def: 10, exp: 35, gold: 18 },
                { name: 'Древесный голем', image: 'image (74).png', hp: 140, atk: 20, def: 12, exp: 40, gold: 20 },
                { name: 'Рогатый Леший', image: 'image (9).png', hp: 160, atk: 22, def: 13, exp: 45, gold: 22 },
                { name: 'Олень (Фаза тарана)', image: 'image (29).png', hp: 180, atk: 25, def: 14, exp: 50, gold: 25 }
            ]
        },
        {
            id: 2, name: 'Чёрный орден',
            lore: 'Древний Орден Следопытов спустился под землю, чтобы сдержать безумие. Но магия проклятия обратила их замысел против них самих.',
            boss: { name: 'Разъярённое Лихо', image: 'image (47).png', hp: 550, atk: 35, def: 18, exp: 200, gold: 130 },
            stages: 6, rewards: { exp: 400, gold: 100, silver: 1000 },
            enemies: [
                { name: 'Болотный утопленник', image: 'image (12).png', hp: 150, atk: 20, def: 10, exp: 40, gold: 20 },
                { name: 'Кикимора болотная', image: 'image (13).png', hp: 170, atk: 22, def: 12, exp: 45, gold: 22 },
                { name: 'Болотный упырь', image: 'image (17).png', hp: 190, atk: 25, def: 13, exp: 50, gold: 25 },
                { name: 'Упырь (Когти)', image: 'image (59).png', hp: 210, atk: 28, def: 15, exp: 55, gold: 28 },
                { name: 'Костяной гигант', image: 'image (14).png', hp: 230, atk: 30, def: 16, exp: 60, gold: 30 }
            ]
        },
        {
            id: 3, name: 'Рождение Охотника',
            lore: 'Шериф бросил войска и запечатал ворота подземки. Один из лучших стрелков Ордена поклялся не возвращаться, пока Шервуд не будет очищен.',
            boss: { name: 'Хозяин чащи', image: 'image (19).png', hp: 700, atk: 42, def: 22, exp: 250, gold: 160 },
            stages: 6, rewards: { exp: 600, gold: 150, silver: 1500 },
            enemies: [
                { name: 'Рогатая кикимора', image: 'image (16).png', hp: 200, atk: 28, def: 14, exp: 50, gold: 25 },
                { name: 'Кикимора (Выпад)', image: 'image (52).png', hp: 220, atk: 30, def: 16, exp: 55, gold: 28 },
                { name: 'Кикимора (Крик)', image: 'image (53).png', hp: 240, atk: 32, def: 17, exp: 60, gold: 30 },
                { name: 'Упырь (Удар)', image: 'image (60).png', hp: 260, atk: 35, def: 18, exp: 65, gold: 32 },
                { name: 'Упырь (Прыжок)', image: 'image (61).png', hp: 280, atk: 38, def: 20, exp: 70, gold: 35 }
            ]
        },
        {
            id: 4, name: 'Бестии Смертной Чащи',
            lore: 'Скверна перекинулась на фауну. Некогда благородные волки превратились в чудовищ с пульсирующими бирюзовыми венами.',
            boss: { name: 'Призрак Ордена', image: 'image (41).png', hp: 850, atk: 48, def: 25, exp: 300, gold: 200 },
            stages: 6, rewards: { exp: 800, gold: 200, silver: 2000 },
            enemies: [
                { name: 'Скелетный гигант', image: 'image (63).png', hp: 250, atk: 32, def: 16, exp: 60, gold: 30 },
                { name: 'Трёхглавый пёс', image: 'image (10).png', hp: 270, atk: 35, def: 18, exp: 65, gold: 32 },
                { name: 'Заражённый секач', image: 'image (11).png', hp: 290, atk: 38, def: 19, exp: 70, gold: 35 },
                { name: 'Волк-оборотень', image: 'image (32).png', hp: 310, atk: 40, def: 21, exp: 75, gold: 38 },
                { name: 'Дьявольский ёж', image: 'image (35).png', hp: 330, atk: 42, def: 22, exp: 80, gold: 40 }
            ]
        },
        {
            id: 5, name: 'Шепот Тёмного Лешего',
            lore: 'Леший — вековой хранитель Шервуда — ослеп от ярости. Его тело срослось с чёрной корой и острыми камнями.',
            boss: { name: 'Фантомный дух', image: 'image (42).png', hp: 1000, atk: 55, def: 28, exp: 350, gold: 250 },
            stages: 6, rewards: { exp: 1000, gold: 250, silver: 2500 },
            enemies: [
                { name: 'Оборотень (Ярость)', image: 'image (33).png', hp: 300, atk: 38, def: 19, exp: 70, gold: 35 },
                { name: 'Ёж (Ярость)', image: 'image (36).png', hp: 320, atk: 40, def: 21, exp: 75, gold: 38 },
                { name: 'Костяной ликантроп', image: 'image (49).png', hp: 340, atk: 42, def: 22, exp: 80, gold: 40 },
                { name: 'Ликантроп (Замах)', image: 'image (50).png', hp: 360, atk: 45, def: 24, exp: 85, gold: 42 },
                { name: 'Голем (Замах)', image: 'image (75).png', hp: 380, atk: 48, def: 25, exp: 90, gold: 45 }
            ]
        },
        {
            id: 6, name: 'Твари Искажённой Эволюции',
            lore: 'В кромешной тьме затопленных гротов зародились новые формы жизни.',
            boss: { name: 'Химера корней', image: 'image (20).png', hp: 1200, atk: 62, def: 32, exp: 400, gold: 300 },
            stages: 6, rewards: { exp: 1500, gold: 350, silver: 3500 },
            enemies: [
                { name: 'Утопленник', image: 'image (62).png', hp: 350, atk: 42, def: 22, exp: 80, gold: 40 },
                { name: 'Рогатый владыка', image: 'image (18).png', hp: 380, atk: 45, def: 24, exp: 85, gold: 42 },
                { name: 'Проклятый титан', image: 'image (15).png', hp: 410, atk: 48, def: 26, exp: 90, gold: 45 },
                { name: 'Кикимора ярости', image: 'image (54).png', hp: 440, atk: 50, def: 28, exp: 95, gold: 48 },
                { name: 'Кристаллический ёж', image: 'image (37).png', hp: 470, atk: 55, def: 30, exp: 100, gold: 50 }
            ]
        },
        {
            id: 7, name: 'Эхо Прошлых Сражений',
            lore: 'Подземка поглощала не только плоть, но и души.',
            boss: { name: 'Кислотный Кошмар', image: 'image (27).png', hp: 1400, atk: 70, def: 35, exp: 450, gold: 350 },
            stages: 6, rewards: { exp: 2000, gold: 500, silver: 5000 },
            enemies: [
                { name: 'Волк-оборотень', image: 'image (34).png', hp: 420, atk: 48, def: 26, exp: 90, gold: 45 },
                { name: 'Лесное Лихо', image: 'image (46).png', hp: 450, atk: 52, def: 28, exp: 100, gold: 50 },
                { name: 'Разъярённое Лихо', image: 'image (47).png', hp: 480, atk: 55, def: 30, exp: 110, gold: 55 },
                { name: 'Лихо (Атака)', image: 'image (48).png', hp: 510, atk: 58, def: 32, exp: 120, gold: 60 },
                { name: 'Лесная нимфа', image: 'image (19).png', hp: 550, atk: 62, def: 35, exp: 130, gold: 65 }
            ]
        },
        {
            id: 8, name: 'Ужас Болотных Недр',
            lore: 'В покрытых слизью пещерах зародилась Кикимора болотная.',
            boss: { name: 'Очи Алтаря', image: 'image (5).png', hp: 1600, atk: 78, def: 38, exp: 500, gold: 400 },
            stages: 6, rewards: { exp: 2500, gold: 650, silver: 6500 },
            enemies: [
                { name: 'Призрак Ордена', image: 'image (41).png', hp: 500, atk: 55, def: 30, exp: 110, gold: 55 },
                { name: 'Фантомный дух', image: 'image (42).png', hp: 530, atk: 58, def: 32, exp: 120, gold: 60 },
                { name: 'Химера корней', image: 'image (20).png', hp: 560, atk: 62, def: 34, exp: 130, gold: 65 },
                { name: 'Кислотный Кошмар', image: 'image (27).png', hp: 590, atk: 65, def: 36, exp: 140, gold: 70 },
                { name: 'Очи Алтаря', image: 'image (5).png', hp: 620, atk: 70, def: 38, exp: 150, gold: 75 }
            ]
        },
        {
            id: 9, name: 'Первые Трофеи',
            lore: 'Охотник научился использовать остатки тварей.',
            boss: { name: 'Пожиратель душ', image: 'image (38).png', hp: 1800, atk: 86, def: 42, exp: 550, gold: 450 },
            stages: 6, rewards: { exp: 3000, gold: 800, silver: 8000 },
            enemies: [
                { name: 'Пожиратель душ', image: 'image (38).png', hp: 580, atk: 62, def: 34, exp: 130, gold: 65 },
                { name: 'Извергатель', image: 'image (39).png', hp: 610, atk: 65, def: 36, exp: 140, gold: 70 },
                { name: 'Топор Палача', image: 'image (31).png', hp: 640, atk: 68, def: 38, exp: 150, gold: 75 },
                { name: 'Проклятый Король', image: 'image (44).png', hp: 670, atk: 72, def: 40, exp: 160, gold: 80 },
                { name: 'Безумие Короны', image: 'image (45).png', hp: 700, atk: 75, def: 42, exp: 170, gold: 85 }
            ]
        },
        {
            id: 10, name: 'Открытие Порталов',
            lore: 'Скверна прожгла ткань реальности.',
            boss: { name: 'Извергатель ярости', image: 'image (39).png', hp: 2000, atk: 95, def: 46, exp: 600, gold: 500 },
            stages: 6, rewards: { exp: 4000, gold: 1000, silver: 10000 },
            enemies: [
                { name: 'Инсектоид', image: 'image (55).png', hp: 650, atk: 68, def: 36, exp: 150, gold: 75 },
                { name: 'Джаггернаут', image: 'image (79).png', hp: 680, atk: 72, def: 38, exp: 160, gold: 80 },
                { name: 'Изумрудный призрак', image: 'image (77).png', hp: 710, atk: 75, def: 40, exp: 170, gold: 85 },
                { name: 'Шервудское Отродье', image: 'image (2).png', hp: 740, atk: 78, def: 42, exp: 180, gold: 90 },
                { name: 'Лесное Лихо', image: 'image (46).png', hp: 770, atk: 82, def: 44, exp: 190, gold: 95 }
            ]
        },
        {
            id: 11, name: 'Королева Короедов',
            lore: 'Из Портала Нашествия вышла Матка Лесных Короедов.',
            boss: { name: 'Топор Палача', image: 'image (31).png', hp: 2300, atk: 105, def: 50, exp: 700, gold: 600 },
            stages: 6, rewards: { exp: 5000, gold: 1500, silver: 15000 },
            enemies: [
                { name: 'Разъярённое Лихо', image: 'image (47).png', hp: 720, atk: 75, def: 40, exp: 170, gold: 85 },
                { name: 'Хозяин чащи', image: 'image (19).png', hp: 750, atk: 78, def: 42, exp: 180, gold: 90 },
                { name: 'Призрак Ордена', image: 'image (41).png', hp: 780, atk: 82, def: 44, exp: 190, gold: 95 },
                { name: 'Фантомный дух', image: 'image (42).png', hp: 810, atk: 85, def: 46, exp: 200, gold: 100 },
                { name: 'Химера корней', image: 'image (20).png', hp: 840, atk: 88, def: 48, exp: 210, gold: 105 }
            ]
        },
        {
            id: 12, name: 'Призрачный Король',
            lore: 'В центре зала восседал Проклятый Король Разбойников.',
            boss: { name: 'Проклятый Король', image: 'image (44).png', hp: 2600, atk: 115, def: 55, exp: 800, gold: 700 },
            stages: 6, rewards: { exp: 6000, gold: 2000, silver: 20000 },
            enemies: [
                { name: 'Кислотный Кошмар', image: 'image (27).png', hp: 800, atk: 82, def: 44, exp: 190, gold: 95 },
                { name: 'Очи Алтаря', image: 'image (5).png', hp: 830, atk: 85, def: 46, exp: 200, gold: 100 },
                { name: 'Пожиратель душ', image: 'image (38).png', hp: 860, atk: 88, def: 48, exp: 210, gold: 105 },
                { name: 'Извергатель', image: 'image (39).png', hp: 890, atk: 92, def: 50, exp: 220, gold: 110 },
                { name: 'Топор Палача', image: 'image (31).png', hp: 920, atk: 95, def: 52, exp: 230, gold: 115 }
            ]
        },
        {
            id: 13, name: 'Хранитель Склепа',
            lore: 'Третий портал вёл в хтоническое капище.',
            boss: { name: 'Безумие Короны', image: 'image (45).png', hp: 3000, atk: 130, def: 60, exp: 900, gold: 800 },
            stages: 6, rewards: { exp: 7500, gold: 2500, silver: 25000 },
            enemies: [
                { name: 'Проклятый Король', image: 'image (44).png', hp: 880, atk: 90, def: 48, exp: 210, gold: 105 },
                { name: 'Безумие Короны', image: 'image (45).png', hp: 910, atk: 95, def: 50, exp: 220, gold: 110 },
                { name: 'Инсектоид', image: 'image (55).png', hp: 940, atk: 98, def: 52, exp: 230, gold: 115 },
                { name: 'Джаггернаут', image: 'image (79).png', hp: 970, atk: 102, def: 54, exp: 240, gold: 120 },
                { name: 'Изумрудный призрак', image: 'image (77).png', hp: 1000, atk: 105, def: 56, exp: 250, gold: 125 }
            ]
        },
        {
            id: 14, name: 'Пробуждение Отродья',
            lore: 'Из разлома поднялся ультимативный бог хаоса.',
            boss: { name: 'Мясной инсектоид', image: 'image (55).png', hp: 3500, atk: 145, def: 68, exp: 1000, gold: 900 },
            stages: 6, rewards: { exp: 9000, gold: 3000, silver: 30000 },
            enemies: [
                { name: 'Шервудское Отродье', image: 'image (2).png', hp: 950, atk: 95, def: 50, exp: 230, gold: 115 },
                { name: 'Лесное Лихо', image: 'image (46).png', hp: 980, atk: 98, def: 52, exp: 240, gold: 120 },
                { name: 'Разъярённое Лихо', image: 'image (47).png', hp: 1010, atk: 102, def: 54, exp: 250, gold: 125 },
                { name: 'Пожиратель душ', image: 'image (38).png', hp: 1040, atk: 105, def: 56, exp: 260, gold: 130 },
                { name: 'Безумие Короны', image: 'image (45).png', hp: 1070, atk: 110, def: 58, exp: 270, gold: 135 }
            ]
        },
        {
            id: 15, name: 'Доспех Вечности',
            lore: 'Финальная битва за Шервуд.',
            boss: { name: 'Джаггернаут', image: 'image (79).png', hp: 4500, atk: 170, def: 80, exp: 1500, gold: 1200 },
            stages: 6, rewards: { exp: 12000, gold: 5000, silver: 50000 },
            enemies: [
                { name: 'Джаггернаут', image: 'image (79).png', hp: 1050, atk: 105, def: 55, exp: 260, gold: 130 },
                { name: 'Изумрудный призрак', image: 'image (77).png', hp: 1080, atk: 108, def: 57, exp: 270, gold: 135 },
                { name: 'Отродье', image: 'image (2).png', hp: 1110, atk: 112, def: 59, exp: 280, gold: 140 },
                { name: 'Инсектоид', image: 'image (55).png', hp: 1140, atk: 115, def: 61, exp: 290, gold: 145 },
                { name: 'Топор Палача', image: 'image (31).png', hp: 1170, atk: 118, def: 63, exp: 300, gold: 150 }
            ]
        }
    ],

    SECRET_CHAPTER: {
        id: 'secret',
        name: 'Глубины Изумрудного Склепа',
        lore: 'Победа над Палачом открыла проход в древний Изумрудный Склеп.',
        boss: { name: 'Чернильный Истязатель', image: 'abyssal_ooze.png', hp: 2500, atk: 100, def: 50, exp: 1000, gold: 300 },
        stages: 6,
        rewards: { exp: 2000, gold: 500, silver: 1500 },
        enemies: [
            { name: 'Костяной Собиратель', image: 'bone_collector.png', hp: 800, atk: 60, def: 30, exp: 200, gold: 50 },
            { name: 'Чрево Леса', image: 'hollow_abomination.png', hp: 1000, atk: 70, def: 35, exp: 250, gold: 60 },
            { name: 'Снайпер Гробниц', image: 'crypt_stalker.png', hp: 900, atk: 75, def: 28, exp: 200, gold: 50 },
            { name: 'Егерь Ловчих Сетей', image: 'thorny_trapper.png', hp: 950, atk: 65, def: 32, exp: 220, gold: 55 },
            { name: 'Безликий Палач', image: 'the_faceless_executioner.png', hp: 2200, atk: 90, def: 45, exp: 800, gold: 250 }
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
        for (var i = 0; i < this.CHAPTERS.length; i++) {
            if (this.CHAPTERS[i].id === id) return this.CHAPTERS[i];
        }
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
            this._inBattle = true;
            this._lastAttempt = Date.now();
            p.questAttempts.lastAttempt = this._lastAttempt;
            Sherwood.saveGame();
            return { success: true, chapter: ch, enemy: this._currentEnemy, stage: this._currentStage + 1, total: ch.stages };
        }
        
        this._currentChapter = ch;
        this._currentStage = 0;
        var firstEnemy = ch.enemies[0];
        this._currentEnemy = { name: firstEnemy.name, image: firstEnemy.image, hp: firstEnemy.hp, maxHp: firstEnemy.hp, atk: firstEnemy.atk, def: firstEnemy.def, exp: firstEnemy.exp, gold: firstEnemy.gold, isBoss: false };
        this._inBattle = true;
        this._lastAttempt = Date.now();
        p.questAttempts.today = (p.questAttempts.today || 0) + 1;
        p.questAttempts.lastAttempt = this._lastAttempt;
        this._attemptsToday = p.questAttempts.today;
        Sherwood.saveGame();
        return { success: true, chapter: ch, enemy: this._currentEnemy, stage: 1, total: ch.stages };
    },
    attack: function() {
        if (!this._inBattle) return null;
        var p = Sherwood.getPlayer();
        var e = this._currentEnemy;
        var dmg = Math.max(1, Math.floor((p.stats.attack * p.stats.attack) / (p.stats.attack + e.def)));
        var crit = Math.random() * 100 < 15;
        if (crit) dmg = Math.floor(dmg * 1.8);
        e.hp -= dmg;
        if (e.hp < 0) e.hp = 0;
        var r = { damage: dmg, crit: crit, enemyHp: e.hp, enemyMaxHp: e.maxHp, enemyDead: e.hp <= 0 };
        if (e.hp <= 0) {
            if (Sherwood.Bestiary && e.image) Sherwood.Bestiary.registerKill(e.image);
            Sherwood.addExp(e.exp);
            if (this._attemptsToday <= 4) Sherwood.addResource('gold', e.gold);
            if (Math.random() < 0.15) Sherwood.addResource('scrolls', 1);
            this._currentStage++;
            var ch = this._currentChapter;
            if (this._currentStage >= ch.stages) {
                this._inBattle = false;
                r.chapterComplete = true;
                r.rewards = ch.rewards;
                var p2 = Sherwood.getPlayer();
                if (p2.questProgress.completed.indexOf(ch.id) === -1) {
                    p2.questProgress.completed.push(ch.id);
                    if (ch.id < 15) p2.questProgress.currentChapter = ch.id + 1;
                    
                    var td = this.TROPHY_DATA[ch.id];
                    if (td && typeof Sherwood.addTrophy === 'function') {
                        Sherwood.addTrophy('chapter_' + ch.id, td.name, { attack: td.attack, defense: td.defense, hp: td.hp }, td.icon, 'chapter');
                    }
                    if (ch.id === 15 && !p2.questProgress.secretCompleted) {
                        p2.questProgress.secretCompleted = false;
                    }
                }
                this._currentChapter = null;
                this._currentEnemy = null;
                this._currentStage = 0;
            } else {
                var nextEnemy = ch.enemies[this._currentStage];
                this._currentEnemy = { name: nextEnemy.name, image: nextEnemy.image, hp: nextEnemy.hp, maxHp: nextEnemy.hp, atk: nextEnemy.atk, def: nextEnemy.def, exp: nextEnemy.exp, gold: nextEnemy.gold, isBoss: false };
                this._inBattle = false;
                r.stageComplete = true;
            }
        } else {
            var edmg = Math.max(1, Math.floor((e.atk * e.atk) / (e.atk + p.stats.defense)));
            p.stats.hp = Math.max(0, p.stats.hp - edmg);
            r.enemyDamage = edmg; r.playerHp = p.stats.hp; r.playerDead = p.stats.hp <= 0;
            if (p.stats.hp <= 0) { this._inBattle = false; r.lose = true; }
        }
        Sherwood.saveGame();
        return r;
    },
    flee: function() { this._inBattle = false; this._currentEnemy = null; return { success: true }; }
};

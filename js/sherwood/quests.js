/**
 * Sherwood Quests — Сюжетная кампания (15 глав)
 */

Sherwood.Quests = {
    // ============================================================
    //  ГЛАВЫ
    // ============================================================

    _chapters: [
        {
            id: 1,
            name: 'Проклятие Зелёного Сердца',
            description: 'Шервудский лес отравлен. Из расколотых недр хлынула порча.',
            bossName: 'Лесное Лихо',
            bossImage: 'image (46).png',
            stages: 5,
            energyCost: 5,
            enemies: [
                { name: 'Проклятый олень', image: 'image (3).png', hp: 80, attack: 12, defense: 3, exp: 25, gold: 15 },
                { name: 'Древесный голем', image: 'image (74).png', hp: 120, attack: 15, defense: 8, exp: 35, gold: 20 },
                { name: 'Леший', image: 'image (1).png', hp: 100, attack: 14, defense: 5, exp: 30, gold: 18 },
                { name: 'Рогатый Леший', image: 'image (9).png', hp: 150, attack: 18, defense: 10, exp: 40, gold: 25 },
                { name: 'Лесное Лихо (Босс)', image: 'image (46).png', hp: 400, attack: 28, defense: 15, exp: 150, gold: 100, isBoss: true }
            ],
            rewards: { gold: 200, exp: 300, silver: 500 },
            trophy: { id: 'trophy_ch1', name: 'Сломанный охотничий рог', icon: 'assets/all_trophies/trophies_chapters/chapter_1_broken_hunting_horn_of_the_league.png', bonus: { attack: 5 } }
        },
        {
            id: 2,
            name: 'Чёрный орден и Базальтовая доска',
            description: 'Древний Орден запечатал скверну, но пробудил нечто худшее.',
            bossName: 'Разъярённое Лихо',
            bossImage: 'image (47).png',
            stages: 5,
            energyCost: 6,
            enemies: [
                { name: 'Лесное Лихо', image: 'image (46).png', hp: 130, attack: 16, defense: 6, exp: 30, gold: 20 },
                { name: 'Проклятый олень (Фаза тарана)', image: 'image (29).png', hp: 160, attack: 20, defense: 8, exp: 35, gold: 22 },
                { name: 'Рогатый Леший V2', image: 'image (9).png', hp: 180, attack: 22, defense: 12, exp: 45, gold: 28 },
                { name: 'Лесное Лихо (Атака)', image: 'image (48).png', hp: 200, attack: 25, defense: 14, exp: 50, gold: 30 },
                { name: 'Разъярённое Лихо (Босс)', image: 'image (47).png', hp: 550, attack: 35, defense: 18, exp: 200, gold: 130, isBoss: true }
            ],
            rewards: { gold: 280, exp: 400, silver: 700 },
            trophy: { id: 'trophy_ch2', name: 'Песочные часы разбойников', icon: 'assets/all_trophies/trophies_chapters/chapter_2_the_hourglass_of_the_robbers.png', bonus: { defense: 3 } }
        },
        {
            id: 3,
            name: 'Рождение Охотника',
            description: 'Выживший стрелок Ордена начинает свой путь.',
            bossName: 'Хозяин смертной чащи',
            bossImage: 'image (19).png',
            stages: 5,
            energyCost: 7,
            enemies: [
                { name: 'Лесной дух', image: 'image (1).png', hp: 160, attack: 18, defense: 7, exp: 35, gold: 22 },
                { name: 'Проклятый олень', image: 'image (3).png', hp: 190, attack: 22, defense: 9, exp: 40, gold: 25 },
                { name: 'Рогатый владыка Леший', image: 'image (18).png', hp: 220, attack: 26, defense: 14, exp: 50, gold: 32 },
                { name: 'Древесный голем (Атака)', image: 'image (75).png', hp: 250, attack: 28, defense: 16, exp: 55, gold: 35 },
                { name: 'Хозяин смертной чащи (Босс)', image: 'image (19).png', hp: 700, attack: 42, defense: 22, exp: 250, gold: 160, isBoss: true }
            ],
            rewards: { gold: 350, exp: 500, silver: 900 },
            trophy: { id: 'trophy_ch3', name: 'Тяжёлый наконечник', icon: 'assets/all_trophies/trophies_chapters/chapter_3_heavy_tip.png', bonus: { attack: 8 } }
        },
        {
            id: 4,
            name: 'Бестии Смертной Чащи',
            description: 'Скверна мутировала лесную фауну.',
            bossName: 'Призрак Чёрного Ордена',
            bossImage: 'image (41).png',
            stages: 5,
            energyCost: 8,
            enemies: [
                { name: 'Проклятый волк', image: 'image (32).png', hp: 200, attack: 22, defense: 8, exp: 40, gold: 28 },
                { name: 'Дьявольская жаба', image: 'image (35).png', hp: 230, attack: 25, defense: 10, exp: 45, gold: 30 },
                { name: 'Волк-оборотень (Ярость)', image: 'image (33).png', hp: 260, attack: 30, defense: 12, exp: 55, gold: 38 },
                { name: 'Костяной ликантроп', image: 'image (49).png', hp: 290, attack: 33, defense: 15, exp: 60, gold: 42 },
                { name: 'Призрак Чёрного Ордена (Босс)', image: 'image (41).png', hp: 850, attack: 48, defense: 25, exp: 300, gold: 200, isBoss: true }
            ],
            rewards: { gold: 420, exp: 600, silver: 1100 },
            trophy: { id: 'trophy_ch4', name: 'Коготь чумной гарпии', icon: 'assets/all_trophies/trophies_chapters/chapter_4_the_claw_of_the_plague_harpy.png', bonus: { agility: 3 } }
        },
        {
            id: 5,
            name: 'Шепот Тёмного Лешего',
            description: 'Древние духи природы ослепли от ярости.',
            bossName: 'Фантомный дух',
            bossImage: 'image (42).png',
            stages: 5,
            energyCost: 9,
            enemies: [
                { name: 'Рогатая кикимора', image: 'image (16).png', hp: 250, attack: 26, defense: 10, exp: 45, gold: 32 },
                { name: 'Болотный утопленник', image: 'image (12).png', hp: 280, attack: 28, defense: 14, exp: 50, gold: 36 },
                { name: 'Костяной гигант', image: 'image (14).png', hp: 320, attack: 34, defense: 18, exp: 60, gold: 44 },
                { name: 'Проклятый титан Леший', image: 'image (15).png', hp: 360, attack: 38, defense: 20, exp: 70, gold: 50 },
                { name: 'Фантомный дух (Босс)', image: 'image (42).png', hp: 1000, attack: 55, defense: 28, exp: 350, gold: 250, isBoss: true }
            ],
            rewards: { gold: 500, exp: 700, silver: 1300 },
            trophy: { id: 'trophy_ch5', name: 'Шлем-клетка палача', icon: 'assets/all_trophies/trophies_chapters/chapter_5_executioner\'s_cage_helmet.png', bonus: { hp: 30 } }
        },
        {
            id: 6,
            name: 'Твари Искажённой Эволюции',
            description: 'В кромешной тьме зародились новые формы жизни.',
            bossName: 'Химера корней',
            bossImage: 'image (20).png',
            stages: 5,
            energyCost: 10,
            enemies: [
                { name: 'Ненасытный тритон', image: 'image (68).png', hp: 300, attack: 30, defense: 12, exp: 50, gold: 36 },
                { name: 'Зубастая фея', image: 'image (56).png', hp: 330, attack: 33, defense: 14, exp: 55, gold: 40 },
                { name: 'Дьявольский ёж (Ярость)', image: 'image (36).png', hp: 370, attack: 38, defense: 16, exp: 65, gold: 48 },
                { name: 'Кислотный тритон', image: 'image (69).png', hp: 410, attack: 42, defense: 18, exp: 75, gold: 55 },
                { name: 'Химера корней (Босс)', image: 'image (20).png', hp: 1200, attack: 62, defense: 32, exp: 400, gold: 300, isBoss: true }
            ],
            rewards: { gold: 580, exp: 800, silver: 1500 },
            trophy: { id: 'trophy_ch6', name: 'Слиток подземного железа', icon: 'assets/all_trophies/trophies_chapters/chapter_6_ingot_of_underground_iron.png', bonus: { attack: 10, defense: 5 } }
        },
        {
            id: 7,
            name: 'Эхо Прошлых Сражений',
            description: 'Подземка поглощает не только плоть, но и души.',
            bossName: 'Кислотный Кошмар',
            bossImage: 'image (27).png',
            stages: 5,
            energyCost: 11,
            enemies: [
                { name: 'Одичалый дух', image: 'image (41).png', hp: 350, attack: 34, defense: 14, exp: 55, gold: 40 },
                { name: 'Пугающая сущность', image: 'image (5).png', hp: 390, attack: 38, defense: 16, exp: 65, gold: 46 },
                { name: 'Призрак разбойника', image: 'image (43).png', hp: 430, attack: 44, defense: 18, exp: 75, gold: 54 },
                { name: 'Моргающий ужас', image: 'image (5).png', hp: 470, attack: 48, defense: 20, exp: 85, gold: 62 },
                { name: 'Кислотный Кошмар (Босс)', image: 'image (27).png', hp: 1400, attack: 70, defense: 35, exp: 450, gold: 350, isBoss: true }
            ],
            rewards: { gold: 660, exp: 900, silver: 1800 },
            trophy: { id: 'trophy_ch7', name: 'Костяной диск наёмника', icon: 'assets/all_trophies/trophies_chapters/chapter_7_mercenary_bone_disc.png', bonus: { defense: 8 } }
        },
        {
            id: 8,
            name: 'Ужас Болотных Недр',
            description: 'В покрытых слизью пещерах зародились самые опасные твари.',
            bossName: 'Очи Алтаря Безумия',
            bossImage: 'image (5).png',
            stages: 5,
            energyCost: 12,
            enemies: [
                { name: 'Кикимора болотная', image: 'image (13).png', hp: 400, attack: 38, defense: 16, exp: 60, gold: 45 },
                { name: 'Шервудский падальщик', image: 'image (65).png', hp: 440, attack: 44, defense: 18, exp: 70, gold: 52 },
                { name: 'Болотный упырь', image: 'image (17).png', hp: 480, attack: 50, defense: 20, exp: 80, gold: 60 },
                { name: 'Костяной гигант утопленник', image: 'image (14).png', hp: 520, attack: 55, defense: 24, exp: 90, gold: 68 },
                { name: 'Очи Алтаря Безумия (Босс)', image: 'image (5).png', hp: 1600, attack: 78, defense: 38, exp: 500, gold: 400, isBoss: true }
            ],
            rewards: { gold: 750, exp: 1000, silver: 2100 },
            trophy: { id: 'trophy_ch8', name: 'Изумрудная друза пещер', icon: 'assets/all_trophies/trophies_chapters/chapter_8_emerald_druse_of_caves.png', bonus: { agility: 5, hp: 20 } }
        },
        {
            id: 9,
            name: 'Первые Трофеи и Синий Комплект',
            description: 'Охотник учится использовать остатки тварей.',
            bossName: 'Пожиратель душ',
            bossImage: 'image (38).png',
            stages: 5,
            energyCost: 13,
            enemies: [
                { name: 'Кровавая сущность', image: 'image (38).png', hp: 450, attack: 42, defense: 18, exp: 65, gold: 50 },
                { name: 'Заражённый секач', image: 'image (11).png', hp: 500, attack: 50, defense: 20, exp: 75, gold: 58 },
                { name: 'Трёхглавый пёс', image: 'image (10).png', hp: 540, attack: 56, defense: 24, exp: 85, gold: 66 },
                { name: 'Склизкий упырь', image: 'image (17).png', hp: 580, attack: 62, defense: 26, exp: 95, gold: 74 },
                { name: 'Пожиратель душ (Босс)', image: 'image (38).png', hp: 1800, attack: 86, defense: 42, exp: 550, gold: 450, isBoss: true }
            ],
            rewards: { gold: 850, exp: 1200, silver: 2400 },
            trophy: { id: 'trophy_ch9', name: 'Ключ проклятого стража', icon: 'assets/all_trophies/trophies_chapters/chapter_9_cursed_guardian_Key.png', bonus: { attack: 12 } }
        },
        {
            id: 10,
            name: 'Открытие Трёх Порталов',
            description: 'Скверна прожгла ткань реальности.',
            bossName: 'Извергатель ярости',
            bossImage: 'image (39).png',
            stages: 5,
            energyCost: 14,
            enemies: [
                { name: 'Разъярённая сущность', image: 'image (39).png', hp: 520, attack: 48, defense: 20, exp: 70, gold: 55 },
                { name: 'Искажённая плоть', image: 'image (28).png', hp: 570, attack: 56, defense: 22, exp: 80, gold: 64 },
                { name: 'Кастующая сущность', image: 'image (40).png', hp: 620, attack: 62, defense: 26, exp: 90, gold: 72 },
                { name: 'Кровавый упырь', image: 'image (38).png', hp: 660, attack: 68, defense: 28, exp: 100, gold: 80 },
                { name: 'Извергатель ярости (Босс)', image: 'image (39).png', hp: 2000, attack: 95, defense: 46, exp: 600, gold: 500, isBoss: true }
            ],
            rewards: { gold: 950, exp: 1400, silver: 2700 },
            trophy: { id: 'trophy_ch10', name: 'Зеркало слепого провидца', icon: 'assets/all_trophies/trophies_chapters/chapter_10_the_mirror_of_the_blind_seer.png', bonus: { defense: 10, agility: 3 } }
        },
        {
            id: 11,
            name: 'Портал Нашествия — Королева Короедов',
            description: 'Из врат вышла Матка Лесных Короедов.',
            bossName: 'Топор Палача',
            bossImage: 'image (31).png',
            stages: 5,
            energyCost: 15,
            enemies: [
                { name: 'Хитиновый страж', image: 'image (21).png', hp: 580, attack: 52, defense: 24, exp: 75, gold: 60 },
                { name: 'Янтарный страж', image: 'image (22).png', hp: 630, attack: 60, defense: 28, exp: 85, gold: 68 },
                { name: 'Токсичный страж', image: 'image (24).png', hp: 680, attack: 66, defense: 30, exp: 95, gold: 76 },
                { name: 'Мясной инсектоид', image: 'image (25).png', hp: 730, attack: 74, defense: 32, exp: 110, gold: 88 },
                { name: 'Топор Палача (Босс)', image: 'image (31).png', hp: 2300, attack: 105, defense: 50, exp: 700, gold: 600, isBoss: true }
            ],
            rewards: { gold: 1100, exp: 1600, silver: 3100 },
            trophy: { id: 'trophy_ch11', name: 'Забрало королевского шлема', icon: 'assets/all_trophies/trophies_chapters/chapter_11_visor_of_the_royal_helmet.png', bonus: { hp: 50 } }
        },
        {
            id: 12,
            name: 'Портал Искажения — Призрачный Король',
            description: 'Реальность вывернулась наизнанку.',
            bossName: 'Проклятый Король',
            bossImage: 'image (44).png',
            stages: 5,
            energyCost: 16,
            enemies: [
                { name: 'Палач плоти', image: 'image (31).png', hp: 650, attack: 58, defense: 26, exp: 80, gold: 65 },
                { name: 'Искажённый палач', image: 'image (31).png', hp: 710, attack: 68, defense: 30, exp: 95, gold: 76 },
                { name: 'Падальщик (База)', image: 'image (65).png', hp: 770, attack: 76, defense: 34, exp: 105, gold: 86 },
                { name: 'Падальщик (Пике)', image: 'image (66).png', hp: 830, attack: 84, defense: 36, exp: 120, gold: 96 },
                { name: 'Проклятый Король (Босс)', image: 'image (44).png', hp: 2600, attack: 115, defense: 55, exp: 800, gold: 700, isBoss: true }
            ],
            rewards: { gold: 1250, exp: 1800, silver: 3500 },
            trophy: { id: 'trophy_ch12', name: 'Наконечник скипетра власти', icon: 'assets/all_trophies/trophies_chapters/chapter_12_tip_of_the_scepter_of_power.png', bonus: { attack: 15, defense: 8 } }
        },
        {
            id: 13,
            name: 'Портал Безумия — Хранитель Склепа',
            description: 'Деревья кровоточат, из коры растут глаза.',
            bossName: 'Безумие Мёртвой Короны',
            bossImage: 'image (45).png',
            stages: 5,
            energyCost: 17,
            enemies: [
                { name: 'Страж роя (Атака)', image: 'image (23).png', hp: 720, attack: 66, defense: 30, exp: 90, gold: 72 },
                { name: 'Мясной террор', image: 'image (25).png', hp: 790, attack: 76, defense: 34, exp: 105, gold: 84 },
                { name: 'Рогатый террор', image: 'image (26).png', hp: 860, attack: 86, defense: 38, exp: 120, gold: 96 },
                { name: 'Палач (Сшитая кожа)', image: 'image (31).png', hp: 920, attack: 94, defense: 40, exp: 135, gold: 108 },
                { name: 'Безумие Мёртвой Короны (Босс)', image: 'image (45).png', hp: 3000, attack: 130, defense: 60, exp: 900, gold: 800, isBoss: true }
            ],
            rewards: { gold: 1400, exp: 2000, silver: 4000 },
            trophy: { id: 'trophy_ch13', name: 'Чаша осквернённого грааля', icon: 'assets/all_trophies/trophies_chapters/chapter_13_cup_of_the_defiled_grail.png', bonus: { hp: 60, agility: 5 } }
        },
        {
            id: 14,
            name: 'Пробуждение Шервудского Отродья',
            description: 'Три портала слились воедино.',
            bossName: 'Мясной инсектоид',
            bossImage: 'image (55).png',
            stages: 5,
            energyCost: 18,
            enemies: [
                { name: 'Мясной рой', image: 'image (25).png', hp: 800, attack: 74, defense: 34, exp: 100, gold: 80 },
                { name: 'Рогатый ужас', image: 'image (55).png', hp: 880, attack: 84, defense: 38, exp: 115, gold: 94 },
                { name: 'Король (Фаза 2)', image: 'image (45).png', hp: 960, attack: 94, defense: 42, exp: 130, gold: 106 },
                { name: 'Изумрудный призрак', image: 'image (77).png', hp: 1030, attack: 104, defense: 46, exp: 150, gold: 120 },
                { name: 'Мясной инсектоид (Босс)', image: 'image (55).png', hp: 3500, attack: 145, defense: 68, exp: 1000, gold: 900, isBoss: true }
            ],
            rewards: { gold: 1600, exp: 2400, silver: 4600 },
            trophy: { id: 'trophy_ch14', name: 'Наконечник знамени командира', icon: 'assets/all_trophies/trophies_chapters/chapter_14_the_commander\'s_banner\'s_tip.png', bonus: { attack: 18, hp: 40 } }
        },
        {
            id: 15,
            name: 'Доспех Вечности',
            description: 'Финальная битва за Шервуд.',
            bossName: 'Древний Рунический Джаггернаут',
            bossImage: 'image (79).png',
            stages: 5,
            energyCost: 20,
            enemies: [
                { name: 'Изумрудный призрак', image: 'image (77).png', hp: 900, attack: 82, defense: 38, exp: 110, gold: 90 },
                { name: 'Призрак (Каст)', image: 'image (78).png', hp: 990, attack: 94, defense: 42, exp: 130, gold: 106 },
                { name: 'Древний хранитель', image: 'image (79).png', hp: 1080, attack: 106, defense: 48, exp: 150, gold: 124 },
                { name: 'Рунический голем', image: 'image (79).png', hp: 1170, attack: 118, defense: 52, exp: 170, gold: 140 },
                { name: 'Древний Рунический Джаггернаут (Босс)', image: 'image (79).png', hp: 4500, attack: 170, defense: 80, exp: 1500, gold: 1200, isBoss: true }
            ],
            rewards: { gold: 2000, exp: 3000, silver: 5500 },
            trophy: { id: 'trophy_ch15', name: 'Живой глаз бездны', icon: 'assets/all_trophies/trophies_chapters/chapter_15_Living_eye_of_the_abyss.png', bonus: { attack: 25, defense: 15, hp: 80, agility: 10 } }
        }
    ],

    // ============================================================
    //  СОСТОЯНИЕ
    // ============================================================

    _currentChapter: null,
    _currentStage: 0,
    _currentEnemy: null,
    _inBattle: false,

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    init: function() {
        const player = Sherwood.getPlayer();
        if (!player.questProgress) {
            player.questProgress = { completed: [], currentChapter: 1, currentStage: 0 };
        }
        if (!player.questEnergy) {
            player.questEnergy = { current: 50, max: 50 };
        }
        console.log('📜 Квесты инициализированы!');
    },

    // ============================================================
    //  ПОЛУЧЕНИЕ ДАННЫХ
    // ============================================================

    getChapter: function(chapterId) {
        return this._chapters.find(c => c.id === chapterId) || null;
    },

    getAllChapters: function() {
        return this._chapters;
    },

    getCurrentProgress: function() {
        const player = Sherwood.getPlayer();
        return player.questProgress || { completed: [], currentChapter: 1, currentStage: 0 };
    },

    isChapterUnlocked: function(chapterId) {
        const progress = this.getCurrentProgress();
        if (chapterId === 1) return true;
        return progress.completed.includes(chapterId - 1);
    },

    isChapterCompleted: function(chapterId) {
        const progress = this.getCurrentProgress();
        return progress.completed.includes(chapterId);
    },

    // ============================================================
    //  ЗАПУСК ГЛАВЫ
    // ============================================================

    startChapter: function(chapterId) {
        const chapter = this.getChapter(chapterId);
        if (!chapter) return { success: false, reason: 'Глава не найдена' };
        if (!this.isChapterUnlocked(chapterId)) return { success: false, reason: 'Глава заблокирована' };
        if (this.isChapterCompleted(chapterId)) return { success: false, reason: 'Глава уже пройдена' };

        const player = Sherwood.getPlayer();
        if ((player.questEnergy?.current || 0) < chapter.energyCost) {
            return { success: false, reason: 'Недостаточно энергии' };
        }

        player.questEnergy.current -= chapter.energyCost;
        this._currentChapter = chapter;
        this._currentStage = 0;
        this._currentEnemy = chapter.enemies[0];
        this._inBattle = true;

        return {
            success: true,
            chapter: chapter,
            stage: 1,
            totalStages: chapter.stages,
            enemy: this._currentEnemy
        };
    },

    // ============================================================
    //  БОЙ В КВЕСТЕ
    // ============================================================

    getCurrentBattle: function() {
        if (!this._inBattle || !this._currentEnemy) return null;
        return {
            chapter: this._currentChapter,
            stage: this._currentStage + 1,
            totalStages: this._currentChapter.stages,
            enemy: this._currentEnemy
        };
    },

    /**
     * Игрок атакует врага.
     * Возвращает результат: урон, убит ли враг, награда.
     */
    playerAttack: function() {
        if (!this._inBattle || !this._currentEnemy) return null;

        const player = Sherwood.getPlayer();
        const enemy = this._currentEnemy;

        // Расчёт урона игрока
        const baseDamage = player.stats.attack;
        const critChance = Math.min(player.stats.agility * 0.3, 50);
        const isCrit = Math.random() * 100 < critChance;
        const damage = isCrit ? Math.floor(baseDamage * 1.8) : baseDamage;
        const actualDamage = Math.max(1, damage - enemy.defense);

        enemy.hp -= actualDamage;
        const enemyDead = enemy.hp <= 0;

        const result = {
            damage: actualDamage,
            isCrit: isCrit,
            enemyHp: Math.max(0, enemy.hp),
            enemyMaxHp: enemy.maxHp || enemy.hp + actualDamage,
            enemyDead: enemyDead,
            enemyName: enemy.name
        };

        // Сохраняем макс HP врага для прогресс-бара
        if (!enemy.maxHp) enemy.maxHp = enemy.hp + actualDamage;

        if (enemyDead) {
            result.rewards = {
                exp: enemy.exp,
                gold: enemy.gold,
                silver: Math.floor(enemy.gold * 1.5)
            };

            // Выдаём награду
            Sherwood.addExp(enemy.exp);
            Sherwood.addResource('gold', enemy.gold);
            Sherwood.addResource('silver', Math.floor(enemy.gold * 1.5));

            // Следующий этап
            this._currentStage++;
            if (this._currentStage >= this._currentChapter.stages) {
                // Глава пройдена
                result.chapterComplete = true;
                result.chapterRewards = this._currentChapter.rewards;
                this._completeChapter();
            } else {
                this._currentEnemy = this._currentChapter.enemies[this._currentStage];
                result.nextEnemy = this._currentEnemy;
                result.nextStage = this._currentStage + 1;
            }
        }

        // Контратака врага если он жив
        if (!enemyDead) {
            const enemyDamage = Math.max(1, enemy.attack - player.stats.defense);
            player.stats.hp = Math.max(0, player.stats.hp - enemyDamage);
            result.enemyDamage = enemyDamage;
            result.playerHp = player.stats.hp;
            result.playerDead = player.stats.hp <= 0;
        }

        return result;
    },

    /**
     * Использовать навык против врага
     */
    playerSkill: function(skillId) {
        if (!this._inBattle || !this._currentEnemy) return null;

        const skillConfig = Sherwood.SkillConfig && Sherwood.SkillConfig[skillId];
        if (!skillConfig) return { success: false, reason: 'Навык не найден' };

        const player = Sherwood.getPlayer();
        const enemy = this._currentEnemy;

        const baseDamage = Math.floor(player.stats.attack * skillConfig.damageMultiplier);
        const actualDamage = Math.max(1, baseDamage - enemy.defense);

        enemy.hp -= actualDamage;
        const enemyDead = enemy.hp <= 0;
        if (!enemy.maxHp) enemy.maxHp = enemy.hp + actualDamage;

        const result = {
            success: true,
            skillId: skillId,
            skillName: skillConfig.name,
            damage: actualDamage,
            enemyHp: Math.max(0, enemy.hp),
            enemyMaxHp: enemy.maxHp,
            enemyDead: enemyDead,
            enemyName: enemy.name
        };

        if (enemyDead) {
            result.rewards = {
                exp: enemy.exp,
                gold: enemy.gold,
                silver: Math.floor(enemy.gold * 1.5)
            };
            Sherwood.addExp(enemy.exp);
            Sherwood.addResource('gold', enemy.gold);
            Sherwood.addResource('silver', Math.floor(enemy.gold * 1.5));

            this._currentStage++;
            if (this._currentStage >= this._currentChapter.stages) {
                result.chapterComplete = true;
                result.chapterRewards = this._currentChapter.rewards;
                this._completeChapter();
            } else {
                this._currentEnemy = this._currentChapter.enemies[this._currentStage];
                result.nextEnemy = this._currentEnemy;
                result.nextStage = this._currentStage + 1;
            }
        } else {
            const enemyDamage = Math.max(1, enemy.attack - player.stats.defense);
            player.stats.hp = Math.max(0, player.stats.hp - enemyDamage);
            result.enemyDamage = enemyDamage;
            result.playerHp = player.stats.hp;
            result.playerDead = player.stats.hp <= 0;
        }

        return result;
    },

    // ============================================================
    //  ЗАВЕРШЕНИЕ ГЛАВЫ
    // ============================================================

    _completeChapter: function() {
        const player = Sherwood.getPlayer();
        const chapter = this._currentChapter;

        // Отмечаем главу как пройденную
        if (!player.questProgress.completed.includes(chapter.id)) {
            player.questProgress.completed.push(chapter.id);
        }

        // Выдаём награды за главу
        if (chapter.rewards) {
            Sherwood.addExp(chapter.rewards.exp || 0);
            Sherwood.addResource('gold', chapter.rewards.gold || 0);
            Sherwood.addResource('silver', chapter.rewards.silver || 0);
        }

        // Выдаём трофей
        if (chapter.trophy && typeof Sherwood.addTrophy === 'function') {
            Sherwood.addTrophy(
                chapter.trophy.id,
                chapter.trophy.name,
                chapter.trophy.bonus,
                chapter.trophy.icon,
                'chapter'
            );
        }

        // Открываем следующую главу
        const nextChapter = this.getChapter(chapter.id + 1);
        if (nextChapter) {
            player.questProgress.currentChapter = nextChapter.id;
        }

        this._inBattle = false;
        this._currentChapter = null;
        this._currentEnemy = null;
        Sherwood._recalcStats();
        Sherwood.saveGame();
    },

    // ============================================================
    //  ВЫХОД ИЗ БОЯ
    // ============================================================

    fleeBattle: function() {
        this._inBattle = false;
        this._currentChapter = null;
        this._currentEnemy = null;
        this._currentStage = 0;
        return { success: true };
    },

    // ============================================================
    //  ЭНЕРГИЯ
    // ============================================================

    getEnergy: function() {
        const player = Sherwood.getPlayer();
        return player.questEnergy || { current: 50, max: 50 };
    },

    addEnergy: function(amount) {
        const player = Sherwood.getPlayer();
        if (!player.questEnergy) player.questEnergy = { current: 50, max: 50 };
        player.questEnergy.current = Math.min(player.questEnergy.current + amount, player.questEnergy.max);
        Sherwood.saveGame();
    },

    restoreEnergy: function() {
        const player = Sherwood.getPlayer();
        if (!player.questEnergy) player.questEnergy = { current: 50, max: 50 };
        player.questEnergy.current = player.questEnergy.max;
        Sherwood.saveGame();
    }
};

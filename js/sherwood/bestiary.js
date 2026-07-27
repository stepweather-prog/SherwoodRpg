/**
 * Sherwood Bestiary — Бестиарий
 */

Sherwood.Bestiary = {
    _beasts: {},

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.bestiary) player.bestiary = {};
        this._beasts = player.bestiary;
    },

    BEASTS: {
        // ===== ПОДЗЕМКА 1 — ЛЕС =====
        'image (1).png': {
            name: 'Леший',
            zone: 'Проклятая чаща',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Вековой хранитель Шервуда, ослепший от ярости. Его тело срослось с чёрной корой и острыми камнями.',
            reward: 30
        },
        'image (3).png': {
            name: 'Проклятый олень',
            zone: 'Проклятая чаща',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Лесной олень, чьи рога пропитались порчей.',
            reward: 30
        },
        'image (74).png': {
            name: 'Древесный голем',
            zone: 'Проклятая чаща',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Ожившее дерево, питающееся гнилью подземных вод.',
            reward: 30
        },
        'image (9).png': {
            name: 'Рогатый Леший',
            zone: 'Проклятая чаща',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Леший, чьи рога проросли сквозь череп.',
            reward: 50
        },
        'image (29).png': {
            name: 'Олень (Фаза тарана)',
            zone: 'Проклятая чаща',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Олень в боевой стойке, готовый протаранить врага.',
            reward: 50
        },
        'image (75).png': {
            name: 'Голем (Замах)',
            zone: 'Проклятая чаща',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Голем, размахивающий каменными лапами.',
            reward: 50
        },
        'image (18).png': {
            name: 'Рогатый владыка Леший',
            zone: 'Проклятая чаща',
            floor: '7',
            type: 'Босс',
            lore: 'Верховный леший, повелевающий корнями.',
            reward: 100
        },
        'image (15).png': {
            name: 'Проклятый титан Леший',
            zone: 'Проклятая чаща',
            floor: '7',
            type: 'Босс',
            lore: 'Титан из чёрной коры и базальта.',
            reward: 100
        },

        // ===== ПОДЗЕМКА 2 — БОЛОТО =====
        'image (12).png': {
            name: 'Болотный утопленник',
            zone: 'Первородное болото',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Раздувшийся труп рудокопа, обвитый неоновым мхом.',
            reward: 35
        },
        'image (13).png': {
            name: 'Кикимора болотная',
            zone: 'Первородное болото',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Паукообразное существо, крадущееся в темноте.',
            reward: 35
        },
        'image (17).png': {
            name: 'Болотный упырь',
            zone: 'Первородное болото',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Склизкий трупоед с болотных топей.',
            reward: 35
        },
        'image (59).png': {
            name: 'Упырь (Когти)',
            zone: 'Первородное болото',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Упырь, обнаживший ядовитые когти.',
            reward: 35
        },
        'image (62).png': {
            name: 'Утопленник (Мертвец недр)',
            zone: 'Первородное болото',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Восставший мертвец из глубоких шахт.',
            reward: 35
        },
        'image (14).png': {
            name: 'Костяной гигант',
            zone: 'Первородное болото',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Гигант из костей павших воинов.',
            reward: 60
        },
        'image (16).png': {
            name: 'Рогатая кикимора',
            zone: 'Первородное болото',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Кикимора с костяными рогами.',
            reward: 60
        },
        'image (52).png': {
            name: 'Кикимора (Выпад)',
            zone: 'Первородное болото',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Кикимора в агрессивной стойке.',
            reward: 60
        },
        'image (53).png': {
            name: 'Кикимора (Крик)',
            zone: 'Первородное болото',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Кикимора, издающая леденящий крик.',
            reward: 60
        },
        'image (60).png': {
            name: 'Упырь (Удар)',
            zone: 'Первородное болото',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Упырь, заносящий когти для удара.',
            reward: 60
        },
        'image (61).png': {
            name: 'Упырь (Прыжок)',
            zone: 'Первородное болото',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Упырь в прыжке на жертву.',
            reward: 60
        },
        'image (63).png': {
            name: 'Скелетный гигант',
            zone: 'Первородное болото',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Огромный скелет неизвестного зверя.',
            reward: 60
        },
        'image (54).png': {
            name: 'Кикимора багровой ярости',
            zone: 'Первородное болото',
            floor: '7',
            type: 'Босс',
            lore: 'Кикимора в состоянии кровавого безумия.',
            reward: 120
        },

        // ===== ПОДЗЕМКА 3 — ПЕЩЕРЫ =====
        'image (10).png': {
            name: 'Трёхглавый пёс',
            zone: 'Базальтовые шахты',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Цербер из глубин базальтовых шахт.',
            reward: 40
        },
        'image (11).png': {
            name: 'Заражённый секач',
            zone: 'Базальтовые шахты',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Кабан, мутировавший от базальтовой пыли.',
            reward: 40
        },
        'image (32).png': {
            name: 'Волк-оборотень',
            zone: 'Базальтовые шахты',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Волк с неоново-бирюзовыми венами.',
            reward: 40
        },
        'image (35).png': {
            name: 'Дьявольский ёж',
            zone: 'Базальтовые шахты',
            floor: '1-3',
            type: 'Обычный',
            lore: 'Ёж размером с кабана с ядовитыми иглами.',
            reward: 40
        },
        'image (33).png': {
            name: 'Оборотень (Ярость)',
            zone: 'Базальтовые шахты',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Оборотень в фазе ярости.',
            reward: 70
        },
        'image (36).png': {
            name: 'Ёж (Ярость)',
            zone: 'Базальтовые шахты',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Ёж с кристаллическими иглами.',
            reward: 70
        },
        'image (49).png': {
            name: 'Костяной ликантроп',
            zone: 'Базальтовые шахты',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Ликантроп с костяным гребнем.',
            reward: 70
        },
        'image (50).png': {
            name: 'Ликантроп (Замах)',
            zone: 'Базальтовые шахты',
            floor: '4-6',
            type: 'Элитный',
            lore: 'Ликантроп, заносящий лапу для удара.',
            reward: 70
        },
        'image (37).png': {
            name: 'Кристаллический ёж',
            zone: 'Базальтовые шахты',
            floor: '7',
            type: 'Босс',
            lore: 'Ёж с иглами из чистого кристалла.',
            reward: 150
        },
        'image (34).png': {
            name: 'Волк-оборотень (Босс)',
            zone: 'Базальтовые шахты',
            floor: '7',
            type: 'Босс',
            lore: 'Вожак стаи оборотней.',
            reward: 150
        },

        // ===== КВЕСТОВЫЕ БОССЫ =====
        'image (46).png': {
            name: 'Лесное Лихо',
            zone: 'Квест',
            floor: 'Глава 1',
            type: 'Босс',
            lore: 'Костлявый гуманоид с гипнотизирующим глазом.',
            reward: 80
        },
        'image (47).png': {
            name: 'Разъярённое Лихо',
            zone: 'Квест',
            floor: 'Глава 2',
            type: 'Босс',
            lore: 'Лихо в ярости, шипы удлиняются.',
            reward: 90
        },
        'image (48).png': {
            name: 'Лихо (Атака)',
            zone: 'Квест',
            floor: 'Глава 2',
            type: 'Босс',
            lore: 'Лихо в фазе атаки.',
            reward: 90
        },
        'image (19).png': {
            name: 'Лесная нимфа',
            zone: 'Квест',
            floor: 'Глава 3',
            type: 'Босс',
            lore: 'Дух чащи в маске-черепе.',
            reward: 100
        },
        'image (41).png': {
            name: 'Призрак Чёрного Ордена',
            zone: 'Квест',
            floor: 'Глава 4',
            type: 'Босс',
            lore: 'Призрак вора из пепла и дыма.',
            reward: 110
        },
        'image (42).png': {
            name: 'Фантомный дух',
            zone: 'Квест',
            floor: 'Глава 5',
            type: 'Босс',
            lore: 'Фантом с неоновыми глазами.',
            reward: 120
        },
        'image (20).png': {
            name: 'Химера корней',
            zone: 'Квест',
            floor: 'Глава 6',
            type: 'Босс',
            lore: 'Чудовище с пастью-щитом.',
            reward: 130
        },
        'image (27).png': {
            name: 'Кислотный Кошмар',
            zone: 'Квест',
            floor: 'Глава 7',
            type: 'Босс',
            lore: 'Багровая химера с кислотой.',
            reward: 140
        },
        'image (5).png': {
            name: 'Очи Алтаря Безумия',
            zone: 'Квест',
            floor: 'Глава 8',
            type: 'Босс',
            lore: 'Монстр, усеянный глазами.',
            reward: 150
        },
        'image (38).png': {
            name: 'Пожиратель душ',
            zone: 'Квест',
            floor: 'Глава 9',
            type: 'Босс',
            lore: 'Чёрный силуэт с черепами.',
            reward: 160
        },
        'image (39).png': {
            name: 'Извергатель ярости',
            zone: 'Квест',
            floor: 'Глава 10',
            type: 'Босс',
            lore: 'Тварь с рогами и чёрным дымом.',
            reward: 170
        },
        'image (31).png': {
            name: 'Топор Палача',
            zone: 'Квест',
            floor: 'Глава 11',
            type: 'Босс',
            lore: 'Монстр со сшитой кожей и цепями.',
            reward: 180
        },
        'image (44).png': {
            name: 'Проклятый Король',
            zone: 'Квест',
            floor: 'Глава 12',
            type: 'Босс',
            lore: 'Рыцарь с кишками вместо тела.',
            reward: 190
        },
        'image (45).png': {
            name: 'Безумие Мёртвой Короны',
            zone: 'Квест',
            floor: 'Глава 13',
            type: 'Босс',
            lore: 'Король с 6 глазами и когтями.',
            reward: 200
        },
        'image (55).png': {
            name: 'Мясной инсектоид',
            zone: 'Квест',
            floor: 'Глава 14',
            type: 'Босс',
            lore: 'Жук с мясными щупальцами.',
            reward: 220
        },
        'image (79).png': {
            name: 'Рунический Джаггернаут',
            zone: 'Квест',
            floor: 'Глава 15',
            type: 'Босс',
            lore: 'Финальный страж с изумрудными рунами.',
            reward: 250
        },
        'image (77).png': {
            name: 'Изумрудный призрак',
            zone: 'Квест',
            floor: 'Глава 15',
            type: 'Босс',
            lore: 'Парящий череп с зелёными глазами.',
            reward: 250
        },
        'image (2).png': {
            name: 'Шервудское Отродье',
            zone: 'Рейд',
            floor: 'Мировой босс',
            type: 'Легендарный',
            lore: 'Многорукий титан в золотых латах.',
            reward: 500
        },

        // ===== СЕКРЕТНАЯ ГЛАВА =====
        'bone_collector': {
            name: 'Костяной Собиратель',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Элитный',
            lore: 'Кошмар анатомии. Его собственный скелет и ребра вывернуты наружу, образуя живую клетку, заполненную гнилой плотью.',
            reward: 80
        },
        'hollow_abomination': {
            name: 'Чрево Леса',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Штурмовик',
            lore: 'Тварь, полностью лишенная головы. Её торс вертикально разорван от плеч до паха, обнажая гигантскую пасть, усаженную сотнями острых человеческих зубов.',
            reward: 80
        },
        'crypt_stalker': {
            name: 'Снайпер Гробниц',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Дальний бой',
            lore: 'Оживший прах древнего стража. Иссохший скелет в ржавых латах, который застывает на поле боя в мертвой симметрии.',
            reward: 80
        },
        'thorny_trapper': {
            name: 'Егерь Ловчих Сетей',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Контроль',
            lore: 'Следопыт, который полностью сросся с ядовитым подземным терновником. Его руки состоят из колючих черных лоз.',
            reward: 80
        },
        'abyssal_ooze': {
            name: 'Чернильный Истязатель',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Босс',
            lore: 'Хтонический владыка глубин склепа. Огромная, наползающая волна черной жижи и смолы, внутри которой кричат лица поглощенных им грешников.',
            reward: 200
        },
        'the_faceless_executioner': {
            name: 'Безликий Палач',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Босс',
            lore: 'Скверна Чернолесья выжгла его плоть, оставив лишь ядовитый неон внутри костяной маски.',
            reward: 200
        },
        'forest_horror': {
            name: 'Лесной Ужас',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Обычный',
            lore: 'Порождение изумрудной скверны, вышедшее из глубин склепа.',
            reward: 50
        },
        'rottenheart_berserker': {
            name: 'Берсерк Гнилого Сердца',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Штурмовик',
            lore: 'Боец, чьё сердце превратилось в гниющий источник бесконечной ярости.',
            reward: 90
        },
        'big_eyed_muscleman': {
            name: 'Глазастый Качок',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Обычный',
            lore: 'Мутировавший страж с единственным гигантским глазом, парализующим волю.',
            reward: 50
        },
        'blind_sin_weaver': {
            name: 'Слепой Ткач Грехов',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Элитный',
            lore: 'Слепой ткач, плетущий сети из грехов павших воинов.',
            reward: 100
        },
        'many_faced_nightmare': {
            name: 'Многоликий Кошмар',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Босс',
            lore: 'Существо с сотнями лиц, каждое из которых кричит о своей смерти.',
            reward: 250
        },
        'desecrated_vine_golem': {
            name: 'Голем Осквернённой Лозы',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Тяжёлый',
            lore: 'Ожившая лоза, пропитанная скверной и превратившаяся в каменного голема.',
            reward: 100
        },
        'secret_boss_the_rotting_patriarch': {
            name: 'Гниющий Патриарх',
            zone: 'Изумрудный Склеп',
            floor: 'Секретная глава',
            type: 'Секретный босс',
            lore: 'Древнейший обитатель склепа, чья гниль стала источником всей скверны Шервуда.',
            reward: 500
        }
    },

    registerKill: function(beastId) {
        if (!beastId) return;
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.bestiary) player.bestiary = {};

        if (!player.bestiary[beastId]) {
            var beastData = this.BEASTS[beastId];
            if (!beastData) {
                beastData = { name: beastId, zone: 'Неизвестно', type: 'Обычный', lore: 'Нет данных', reward: 0 };
            }
            player.bestiary[beastId] = {
                id: beastId,
                name: beastData.name || beastId,
                zone: beastData.zone || 'Неизвестно',
                type: beastData.type || 'Обычный',
                floor: beastData.floor || '?',
                lore: beastData.lore || 'Нет данных',
                reward: beastData.reward || 0,
                kills: 0,
                rewardClaimed: false
            };
        }
        player.bestiary[beastId].kills = (player.bestiary[beastId].kills || 0) + 1;
        this._beasts = player.bestiary;
        Sherwood.saveGame();
    },

    claimReward: function(beastId) {
        var player = Sherwood.getPlayer();
        if (!player || !player.bestiary || !player.bestiary[beastId]) return { success: false, reason: 'Бестия не найдена' };
        var beast = player.bestiary[beastId];
        if (beast.rewardClaimed) return { success: false, reason: 'Уже получено' };
        if (beast.kills <= 0) return { success: false, reason: 'Бестия не убита' };
        
        var reward = beast.reward || 50;
        Sherwood.addResource('silver', reward);
        beast.rewardClaimed = true;
        this._beasts = player.bestiary;
        Sherwood.saveGame();
        return { success: true, reward: reward };
    },

    getBeast: function(beastId) {
        return this._beasts[beastId] || null;
    },

    getAllBeasts: function() {
        return this._beasts;
    },

    getAllBeastEntries: function() {
        return this.BEASTS;
    },

    getKillCount: function(beastId) {
        return this._beasts[beastId] ? this._beasts[beastId].kills : 0;
    },

    getTotalKills: function() {
        var total = 0;
        for (var id in this._beasts) {
            if (this._beasts.hasOwnProperty(id)) {
                total += this._beasts[id].kills || 0;
            }
        }
        return total;
    },

    getDiscoveryProgress: function() {
        var totalBeasts = Object.keys(this.BEASTS).length;
        var discovered = Object.keys(this._beasts).length;
        return {
            discovered: discovered,
            total: totalBeasts,
            percent: Math.round((discovered / totalBeasts) * 100)
        };
    },

    getBeastsByZone: function(zone) {
        var result = [];
        for (var id in this.BEASTS) {
            if (this.BEASTS.hasOwnProperty(id)) {
                var data = this.BEASTS[id];
                if (data.zone === zone) {
                    var playerBeast = this._beasts[id];
                    var kills = playerBeast ? playerBeast.kills : 0;
                    var rewardClaimed = playerBeast ? playerBeast.rewardClaimed : false;
                    result.push({
                        id: id,
                        name: data.name,
                        zone: data.zone,
                        floor: data.floor,
                        type: data.type,
                        lore: data.lore,
                        reward: data.reward || 50,
                        kills: kills,
                        rewardClaimed: rewardClaimed
                    });
                }
            }
        }
        return result;
    },

    getZones: function() {
        var zones = [];
        for (var id in this.BEASTS) {
            if (this.BEASTS.hasOwnProperty(id)) {
                var zone = this.BEASTS[id].zone;
                if (zones.indexOf(zone) === -1) {
                    zones.push(zone);
                }
            }
        }
        return zones;
    }
};

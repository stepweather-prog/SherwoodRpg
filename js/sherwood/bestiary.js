/**
 * Sherwood Bestiary — Бестиарий Шервуда
 * Полный сборник всех тварей с визуальным UI
 */

Sherwood.Bestiary = {
    _beasts: {},
    _discovered: {},
    _currentFilter: 'all',
    _currentZone: 'all',
    _searchQuery: '',

    // ============================================================
    //  ДАННЫЕ БЕСТИАРИЯ
    // ============================================================

    BEASTS: {
        // ========== ПОДЗЕМКА 1: Проклятая чаща ==========
        'plague_crow.png': { 
            name: 'Чумной Ворон', 
            zone: 'Проклятая чаща', 
            floor: 'Этаж 1', 
            type: 'Птица', 
            reward: 50, 
            icon: '🐦',
            rarity: 'common',
            lore: 'Птица, чьи перья пропитались токсичной пылью. Разносит заразу, выклёвывая глаза ещё живых жертв.' 
        },
        'forest_strangler.png': { 
            name: 'Лесной Душегуб', 
            zone: 'Проклятая чаща', 
            floor: 'Этаж 1', 
            type: 'Босс', 
            reward: 200, 
            icon: '🌿',
            rarity: 'rare',
            lore: 'Скопище удушающих лоз, принявшее гуманоидную форму. Притягивает жертв в свою древесную утробу, где те медленно перевариваются заживо.' 
        },
        'warped_imp.png': { 
            name: 'Искажённый Бес', 
            zone: 'Проклятая чаща', 
            floor: 'Этаж 2', 
            type: 'Демон', 
            reward: 60, 
            icon: '👿',
            rarity: 'common',
            lore: 'Юркая тварь, появившаяся из искажённой магии. Заманивает жертв вглубь пещер ложными звуками.' 
        },
        'shard_back.png': { 
            name: 'Шервудский Дикобраз', 
            zone: 'Проклятая чаща', 
            floor: 'Этаж 2', 
            type: 'Босс', 
            reward: 250, 
            icon: '🦔',
            rarity: 'rare',
            lore: 'Исполинский мутант, чьи иглы способны пробивать базальт. Его панцирь почти не имеет уязвимых мест.' 
        },
        'bone_borer.png': { 
            name: 'Костяной Короед-Трупоед', 
            zone: 'Проклятая чаща', 
            floor: 'Этаж 3', 
            type: 'Насекомое', 
            reward: 70, 
            icon: '🪲',
            rarity: 'common',
            lore: 'Поедает кости павших, вплетая их в свой хитиновый панцирь для дополнительной защиты.' 
        },
        'blight_lord_beetle.png': { 
            name: 'Повелитель Гнили', 
            zone: 'Проклятая чаща', 
            floor: 'Этаж 3', 
            type: 'Босс', 
            reward: 300, 
            icon: '🪲',
            rarity: 'rare',
            lore: 'Колоссальная матка жуков. Из её раздутого брюха каждое мгновение вылупляются новые твари.' 
        },
        'blight_alpha.png': { 
            name: 'Альфа-Скверноискатель', 
            zone: 'Проклятая чаща', 
            floor: 'Этаж 4', 
            type: 'Зверь', 
            reward: 80, 
            icon: '🐺',
            rarity: 'uncommon',
            lore: 'Вожак стаи мутировавших псов. Его пасть постоянно источает фосфоресцирующую ядовитую слюну.' 
        },
        'oak_golem.png': { 
            name: 'Голем Дуба', 
            zone: 'Проклятая чаща', 
            floor: 'Этаж 5', 
            type: 'Голем', 
            reward: 90, 
            icon: '🗿',
            rarity: 'uncommon',
            lore: 'Первозданная форма лесного стража до осквернения. Светится изумрудной магией, но атакует любого чужака.' 
        },
        'root_executioner.png': { 
            name: 'Корневой Палач', 
            zone: 'Проклятая чаща', 
            floor: 'Этаж 5', 
            type: 'Босс', 
            reward: 350, 
            icon: '🌳',
            rarity: 'epic',
            lore: 'Труп, оплетённый пульсирующей лозой. Из его разорванной груди торчит чёрный корень-сердце. Руки превратились в древесные серпы, он выныривает из-под земли за спиной жертвы.' 
        },
        'blight_lord_leshy.png': { 
            name: 'Древний Владыка', 
            zone: 'Проклятая чаща', 
            floor: 'Этаж 6', 
            type: 'Босс', 
            reward: 400, 
            icon: '🌲',
            rarity: 'epic',
            lore: 'Финальная форма Лешего. Обугленное железное дерево, рога увенчаны черепами жертв. Поднимает мертвецов и насылает рои чумных мух.' 
        },

        // ========== ПОДЗЕМКА 2: Первородное болото ==========
        'bog_trapper.png': { 
            name: 'Болотный Капкан', 
            zone: 'Первородное болото', 
            floor: 'Этаж 1', 
            type: 'Растение', 
            reward: 50, 
            icon: '🌱',
            rarity: 'common',
            lore: 'Хищный цветок, маскирующийся под корягу. Резко захлопывает деревянные шипы-клыки, когда на него наступают.' 
        },
        'searing_arachnid.png': { 
            name: 'Выжигающий Арахнид', 
            zone: 'Первородное болото', 
            floor: 'Этаж 1', 
            type: 'Босс', 
            reward: 200, 
            icon: '🕷️',
            rarity: 'rare',
            lore: 'Паук, вплетший в свой панцирь тлеющие угли. Опутывает жертву в кокон и сжигает заживо зелёным пламенем.' 
        },
        'water_hag.png': { 
            name: 'Водная Баба', 
            zone: 'Первородное болото', 
            floor: 'Этаж 2', 
            type: 'Ведьма', 
            reward: 60, 
            icon: '🧙',
            rarity: 'common',
            lore: 'Склизкая карга, маскирующаяся под бревно. Швыряется кусками грязи, разъедающей глаза.' 
        },
        'sherwood_lizard.png': { 
            name: 'Шервудский Ящер', 
            zone: 'Первородное болото', 
            floor: 'Этаж 2', 
            type: 'Босс', 
            reward: 250, 
            icon: '🦎',
            rarity: 'rare',
            lore: 'Колоссальный рептилоид с угольной чешуёй. В груди полыхает магия скверны. Сокрушает врагов когтями и хвостом.' 
        },
        'swamp_vodyanoy.png': { 
            name: 'Водяной Скверны', 
            zone: 'Первородное болото', 
            floor: 'Этаж 3', 
            type: 'Босс', 
            reward: 300, 
            icon: '💧',
            rarity: 'rare',
            lore: 'Развращённый дух болот. Маскируется в мутной воде, создаёт водовороты из грязи и утаскивает на дно.' 
        },
        'fox_pack_lord.png': { 
            name: 'Повелитель Стаи', 
            zone: 'Первородное болото', 
            floor: 'Этаж 4', 
            type: 'Босс', 
            reward: 350, 
            icon: '🦊',
            rarity: 'epic',
            lore: 'Огромный лис-переросток. Его грудная клетка разорвана, а внутренности оплетены тисовыми корнями. Призывает бесконечные волны лисиц.' 
        },
        'plague_bat.png': { 
            name: 'Чумная Летучая Мышь', 
            zone: 'Первородное болото', 
            floor: 'Этаж 5', 
            type: 'Босс', 
            reward: 350, 
            icon: '🦇',
            rarity: 'epic',
            lore: 'Размером с виверну. Её укус превращает плоть жертвы в лужу гноя за считанные секунды.' 
        },
        'ash_overlord.png': { 
            name: 'Владыка Пепла', 
            zone: 'Первородное болото', 
            floor: 'Этаж 6', 
            type: 'Босс', 
            reward: 400, 
            icon: '🔥',
            rarity: 'legendary',
            lore: 'Призрачный колосс из пепла и застывшей магмы. Впитал боль всех сожжённых заживо армий Шерифа.' 
        },

        // ========== ПОДЗЕМКА 3: Базальтовый грот ==========
        'basalt_devourer.png': { 
            name: 'Базальтовый Пожиратель', 
            zone: 'Базальтовый грот', 
            floor: 'Этаж 1', 
            type: 'Тварь', 
            reward: 50, 
            icon: '🪨',
            rarity: 'common',
            lore: 'Литофаг, питающийся камнем. Прожирает себе путь прямо сквозь стены, нападая врасплох.' 
        },
        'lost_treasure_hunter.png': { 
            name: 'Пропавший Кладоискатель', 
            zone: 'Базальтовый грот', 
            floor: 'Этаж 1', 
            type: 'Босс', 
            reward: 200, 
            icon: '💀',
            rarity: 'rare',
            lore: 'Безумный зомби в золочёной броне. Охраняет пустые сундуки, разя призраками былых богатств.' 
        },
        'cursed_priestess.png': { 
            name: 'Проклятая Жрица', 
            zone: 'Базальтовый грот', 
            floor: 'Этаж 2', 
            type: 'Босс', 
            reward: 250, 
            icon: '🔮',
            rarity: 'rare',
            lore: 'Уродливая тварь, чьё тело разорвано изнутри тёмными щупальцами Бездны. Приносит живых в жертву хаосу.' 
        },
        'mistress_of_the_roots.png': { 
            name: 'Повелительница корней', 
            zone: 'Базальтовый грот', 
            floor: 'Этаж 3', 
            type: 'Босс', 
            reward: 300, 
            icon: '🌿',
            rarity: 'epic',
            lore: 'Женщина-монстр, оплетённая мхом и ветвями, с открытой грудной клеткой, обнажающей скелет. Её глаза и рот излучают магию скверны.' 
        },
        'chaos_lord.png': { 
            name: 'Лорд Хаоса', 
            zone: 'Базальтовый грот', 
            floor: 'Этаж 4', 
            type: 'Босс', 
            reward: 350, 
            icon: '👾',
            rarity: 'epic',
            lore: 'Зловещий владыка в рогатом капюшоне. Окружён тёмной дымкой и щупальцами. Концентрирует мощную воронку зелёной магии, разрывая реальность.' 
        },
        'lord_of_the_feathered.png': { 
            name: 'Хозяин Пернатых', 
            zone: 'Базальтовый грот', 
            floor: 'Этаж 5', 
            type: 'Босс', 
            reward: 350, 
            icon: '🦅',
            rarity: 'epic',
            lore: 'Древний птиче-человек с огромным размахом крыльев. Его доспехи и перья трещат от концентрированной фиолетовой магии Бездны.' 
        },
        'corruption_raccoon.png': { 
            name: 'Енот Порчи', 
            zone: 'Базальтовый грот', 
            floor: 'Этаж 6', 
            type: 'Босс', 
            reward: 400, 
            icon: '🦝',
            rarity: 'legendary',
            lore: 'Симбиот Бездны. Клокочковатая шерсть и пустые глазницы излучают смесь фиолетового и синего пламени. Носит маски павших боссов, поглощая их силу.' 
        },

        // ========== БОССЫ КВЕСТОВ ==========
        'fallen_forester.png': { 
            name: 'Лесничий-Отступник', 
            zone: 'Квест', 
            floor: 'Глава 1', 
            type: 'Босс', 
            reward: 100, 
            icon: '🌲',
            rarity: 'rare',
            lore: 'Бывший лесничий, предавший Шервуд ради золота Королевских Охотников.' 
        },
        'blight_alpha_stag.png': { 
            name: 'Вожак Искаженной Стаи', 
            zone: 'Квест', 
            floor: 'Глава 2', 
            type: 'Босс', 
            reward: 120, 
            icon: '🦌',
            rarity: 'rare',
            lore: 'Олень-вожак, поглощённый скверной. Ведёт стаю мутантов через лес.' 
        },
        'huntsman_alpha_hound.png': { 
            name: 'Альфа-Гончая Егеря', 
            zone: 'Квест', 
            floor: 'Глава 3', 
            type: 'Босс', 
            reward: 140, 
            icon: '🐕',
            rarity: 'rare',
            lore: 'Верный пёс егеря, превращённый скверной в безжалостного убийцу.' 
        },
        'fallen_druid.png': { 
            name: 'Падший Друид', 
            zone: 'Квест', 
            floor: 'Глава 4', 
            type: 'Босс', 
            reward: 160, 
            icon: '🧝',
            rarity: 'epic',
            lore: 'Последний хранитель Дуба. Поглощён скверной, но всё ещё верит, что защищает лес.' 
        },
        'thicket_hunger.png': { 
            name: 'Голод Чащи', 
            zone: 'Квест', 
            floor: 'Глава 5', 
            type: 'Босс', 
            reward: 180, 
            icon: '🌿',
            rarity: 'epic',
            lore: 'Бесформенный ком лоз, костей и пастей. Чувствует каждый шаг жертвы.' 
        },
        'echo_devourer.png': { 
            name: 'Пожиратель Эха', 
            zone: 'Квест', 
            floor: 'Глава 7', 
            type: 'Босс', 
            reward: 200, 
            icon: '👻',
            rarity: 'epic',
            lore: 'Сгусток чёрного дыма и призрачных клинков. Кричит голосами мертвецов.' 
        },
        'mistress_of_the_mires.png': { 
            name: 'Повелительница Топей', 
            zone: 'Квест', 
            floor: 'Глава 8', 
            type: 'Босс', 
            reward: 220, 
            icon: '🧙',
            rarity: 'epic',
            lore: 'Существо из гнили, воды и мёртвой плоти. Топит жертв заживо.' 
        },
        'rift_warden.png': { 
            name: 'Страж Разломов', 
            zone: 'Квест', 
            floor: 'Глава 9', 
            type: 'Босс', 
            reward: 240, 
            icon: '🌀',
            rarity: 'epic',
            lore: 'Левитирующая тварь из вывернутой породы и десятков глаз. Охраняет врата.' 
        },
        'the_hive_mother.png': { 
            name: 'Матка Лесных Короедов', 
            zone: 'Квест', 
            floor: 'Глава 10', 
            type: 'Босс', 
            reward: 260, 
            icon: '🪲',
            rarity: 'epic',
            lore: 'Колоссальная матка с панцирем, усыпанным моргающими глазами.' 
        },
        'the_cursed_outlaw_king.png': { 
            name: 'Проклятый Король Разбойников', 
            zone: 'Квест', 
            floor: 'Глава 11', 
            type: 'Босс', 
            reward: 280, 
            icon: '👑',
            rarity: 'legendary',
            lore: 'Король, поглощённый тьмой. Умоляет убить его, но не может умереть.' 
        },
        'ancient_crypt_warden.png': { 
            name: 'Древний Хранитель Склепа', 
            zone: 'Квест', 
            floor: 'Глава 12', 
            type: 'Босс', 
            reward: 300, 
            icon: '🗿',
            rarity: 'legendary',
            lore: 'Титан из чёрного дуба и камня с пульсирующей опухолью вместо сердца.' 
        },
        'echo_of_the_triumvirate.png': { 
            name: 'Эхо Трех Порталов', 
            zone: 'Квест', 
            floor: 'Глава 13', 
            type: 'Босс', 
            reward: 320, 
            icon: '🌀',
            rarity: 'legendary',
            lore: 'Чистое искажение, принявшее форму. Сплав силы трёх разломов.' 
        },
        'sacred_tree_executioner.png': { 
            name: 'Палач Священного Древа', 
            zone: 'Квест', 
            floor: 'Глава 14', 
            type: 'Босс', 
            reward: 340, 
            icon: '⚔️',
            rarity: 'legendary',
            lore: 'Капитан Охотников, распятый корнями. Стал палачом того, что осквернил.' 
        },
        'sherwood_abomination.png': { 
            name: 'Шервудское Отродье', 
            zone: 'Квест', 
            floor: 'Глава 15', 
            type: 'Босс', 
            reward: 400, 
            icon: '👾',
            rarity: 'mythic',
            lore: 'Многорукий исполин из базальта и гнилой древесины. Ядро — там, где билось сердце Дуба.' 
        },
        'the_primordial_core.png': { 
            name: 'Изначальный Стержень', 
            zone: 'Квест', 
            floor: 'Секретная глава', 
            type: 'Босс', 
            reward: 500, 
            icon: '🖤',
            rarity: 'mythic',
            lore: 'Глаз того, кто спит под Шервудом с начала времён. Сфера из жидкого обсидиана.' 
        },

        // ========== БОССЫ ПОРТАЛОВ ==========
        'the_reaper_commander.png': { 
            name: 'Жнец-Полководец', 
            zone: 'Портал', 
            floor: 'Портал Нашествия', 
            type: 'Босс', 
            reward: 300, 
            icon: '🦗',
            rarity: 'epic',
            lore: 'Колоссальный богомол-мутант, чей хитиновый панцирь покрыт шрамами от бесконечных войн.' 
        },
        'the_dark_weaver.png': { 
            name: 'Ткачиха Мрака', 
            zone: 'Портал', 
            floor: 'Портал Черных Пауков', 
            type: 'Босс', 
            reward: 300, 
            icon: '🕷️',
            rarity: 'epic',
            lore: 'Гротескная гибрид: верхняя часть — изуродованная эльфийская жрица, нижняя — колоссальный паук.' 
        },
        'the_decayed_titan.png': { 
            name: 'Истлевший Титан', 
            zone: 'Портал', 
            floor: 'Портал Увядания', 
            type: 'Босс', 
            reward: 300, 
            icon: '🗿',
            rarity: 'epic',
            lore: 'Гигантский энт, заражённый некротической скверной. В груди вращается сфера чистой энтропии.' 
        },
        'the_eternal_prisoner.png': { 
            name: 'Вечный Узник', 
            zone: 'Портал', 
            floor: 'Портал Цепей', 
            type: 'Босс', 
            reward: 300, 
            icon: '⛓️',
            rarity: 'legendary',
            lore: 'Колоссальный рыцарь, чьё тело заковано в раскалённые латы. Цепи с крюками пронзают его плоть.' 
        },
        'the_blood_alpha.png': { 
            name: 'Кровавый Вожак', 
            zone: 'Портал', 
            floor: 'Портал Ликантропов', 
            type: 'Босс', 
            reward: 300, 
            icon: '🐺',
            rarity: 'legendary',
            lore: 'Титанический оборотень размером с двухэтажный дом. Шерсть слиплась от запекшейся крови.' 
        },
        'the_basalt_reaper.png': { 
            name: 'Базальтовый Жнец', 
            zone: 'Портал', 
            floor: 'Портал Скорпиона', 
            type: 'Босс', 
            reward: 300, 
            icon: '🦂',
            rarity: 'legendary',
            lore: 'Колоссальный скорпион, мутировавший от поедания чёрной магии. Панцирь тверже обсидиана.' 
        },
        'embodiment_of_distortion.png': { 
            name: 'Воплощение Искажения', 
            zone: 'Портал', 
            floor: 'Портал Искажения', 
            type: 'Босс', 
            reward: 400, 
            icon: '🌀',
            rarity: 'mythic',
            lore: 'Левитирующая масса из десятков безумных глаз, вывернутых конечностей и щупалец.' 
        },

        // ========== РЕЙД ==========
        'original_horror.png': { 
            name: 'Изначальный Ужас', 
            zone: 'Рейд', 
            floor: 'Мировой рейд', 
            type: 'Босс', 
            reward: 1000, 
            icon: '🖤',
            rarity: 'mythic',
            lore: 'Спящий в Корнях. Древнее зло, которое спало под Шервудом с начала времён. Теперь оно пробудилось.' 
        }
    },

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.bestiary) player.bestiary = {};
        this._discovered = player.bestiary;
        console.log('📖 Бестиарий инициализирован');
        console.log('📚 Всего существ:', Object.keys(this.BEASTS).length);
    },

    // ============================================================
    //  МЕТОДЫ
    // ============================================================

    registerKill: function(beastImage) {
        if (!beastImage) return;
        var beast = this.BEASTS[beastImage];
        if (!beast) return;
        
        if (!this._discovered[beastImage]) {
            this._discovered[beastImage] = { kills: 0, rewardClaimed: false };
        }
        
        this._discovered[beastImage].kills++;
        
        var player = Sherwood.getPlayer();
        player.bestiary = this._discovered;
        Sherwood.saveGame();
    },

    getBeast: function(beastId) {
        var beastData = this.BEASTS[beastId];
        if (!beastData) return null;
        var discovery = this._discovered[beastId] || { kills: 0, rewardClaimed: false };
        return Object.assign({}, beastData, {
            id: beastId,
            kills: discovery.kills || 0,
            rewardClaimed: discovery.rewardClaimed || false
        });
    },

    getBeastsByZone: function(zone) {
        var beasts = [];
        for (var id in this.BEASTS) {
            if (this.BEASTS[id].zone === zone) {
                beasts.push(this.getBeast(id));
            }
        }
        return beasts;
    },

    getBeastsByType: function(type) {
        var beasts = [];
        for (var id in this.BEASTS) {
            if (this.BEASTS[id].type === type) {
                beasts.push(this.getBeast(id));
            }
        }
        return beasts;
    },

    getAllBeasts: function() {
        var beasts = [];
        for (var id in this.BEASTS) {
            beasts.push(this.getBeast(id));
        }
        return beasts;
    },

    getDiscoveryProgress: function() {
        var total = Object.keys(this.BEASTS).length;
        var discovered = 0;
        for (var id in this._discovered) {
            if (this._discovered[id] && this._discovered[id].kills > 0) discovered++;
        }
        return {
            total: total,
            discovered: discovered,
            percent: total > 0 ? Math.round((discovered / total) * 100) : 0
        };
    },

    claimReward: function(beastId) {
        var beast = this.getBeast(beastId);
        if (!beast) return { success: false, reason: 'Бестия не найдена' };
        if (beast.kills <= 0) return { success: false, reason: 'Бестия не убита' };
        if (beast.rewardClaimed) return { success: false, reason: 'Награда уже получена' };
        
        Sherwood.addResource('silver', beast.reward || 50);
        this._discovered[beastId].rewardClaimed = true;
        
        var player = Sherwood.getPlayer();
        player.bestiary = this._discovered;
        Sherwood.saveGame();
        
        return { success: true, reward: beast.reward || 50 };
    },

    getBeastsByZoneAndFloor: function(zone, floor) {
        var beasts = [];
        for (var id in this.BEASTS) {
            var beast = this.BEASTS[id];
            if (beast.zone === zone && beast.floor === floor) {
                beasts.push(this.getBeast(id));
            }
        }
        return beasts;
    },

    getRarityColor: function(rarity) {
        var colors = {
            'common': '#888',
            'uncommon': '#52b788',
            'rare': '#4a8ab7',
            'epic': '#9b59b6',
            'legendary': '#ffa500',
            'mythic': '#ff6b35'
        };
        return colors[rarity] || '#888';
    },

    // ============================================================
    //  UI — БЕСТИАРИЙ
    // ============================================================

    showUI: function() {
        this._renderBestiaryUI();
    },

    _renderBestiaryUI: function() {
        var old = document.getElementById('bestiary-screen');
        if (old) old.remove();
        
        var progress = this.getDiscoveryProgress();
        var allBeasts = this.getAllBeasts();
        var zones = this._getAllZones();
        var types = this._getAllTypes();
        
        var screenHTML = `
        <div id="bestiary-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/bestiary_visual.png') center/cover no-repeat;display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
                <button onclick="Sherwood.Bestiary.closeUI()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                    <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
                </button>
                <span style="color:#e0c080;font-size:1.2em;">📖 Бестиарий Шервуда</span>
                <span style="color:#888;font-size:12px;margin-left:auto;">
                    📊 ${progress.discovered}/${progress.total} (${progress.percent}%)
                </span>
            </div>
            
            <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
                <div style="max-width:800px;margin:0 auto;">
                    <!-- Фильтры -->
                    <div style="display:flex;gap:8px;margin-bottom:15px;flex-wrap:wrap;">
                        <button onclick="Sherwood.Bestiary.setFilter('all')" class="btn ${this._currentFilter === 'all' ? 'btn-gold' : ''}" style="padding:6px 15px;font-size:12px;">Все</button>
                        ${types.map(function(t) {
                            return `<button onclick="Sherwood.Bestiary.setFilter('${t}')" class="btn ${this._currentFilter === t ? 'btn-gold' : ''}" style="padding:6px 15px;font-size:12px;">${t}</button>`;
                        }, this).join('')}
                    </div>
                    
                    <div style="display:flex;gap:8px;margin-bottom:15px;flex-wrap:wrap;">
                        <button onclick="Sherwood.Bestiary.setZone('all')" class="btn ${this._currentZone === 'all' ? 'btn-gold' : ''}" style="padding:4px 12px;font-size:11px;">Все зоны</button>
                        ${zones.map(function(z) {
                            return `<button onclick="Sherwood.Bestiary.setZone('${z}')" class="btn ${this._currentZone === z ? 'btn-gold' : ''}" style="padding:4px 12px;font-size:11px;">${z}</button>`;
                        }, this).join('')}
                    </div>
                    
                    <!-- Список существ -->
                    <div id="bestiary-list" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
                        ${this._renderBeastList()}
                    </div>
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', screenHTML);
    },

    _getAllZones: function() {
        var zones = {};
        for (var id in this.BEASTS) {
            zones[this.BEASTS[id].zone] = true;
        }
        return Object.keys(zones);
    },

    _getAllTypes: function() {
        var types = {};
        for (var id in this.BEASTS) {
            types[this.BEASTS[id].type] = true;
        }
        return Object.keys(types);
    },

    setFilter: function(type) {
        this._currentFilter = type;
        this._updateList();
    },

    setZone: function(zone) {
        this._currentZone = zone;
        this._updateList();
    },

    _updateList: function() {
        var container = document.getElementById('bestiary-list');
        if (container) {
            container.innerHTML = this._renderBeastList();
        }
    },

    _renderBeastList: function() {
        var allBeasts = this.getAllBeasts();
        var filtered = allBeasts.filter(function(b) {
            if (!b) return false;
            if (this._currentFilter !== 'all' && b.type !== this._currentFilter) return false;
            if (this._currentZone !== 'all' && b.zone !== this._currentZone) return false;
            return true;
        }, this);
        
        filtered.sort(function(a, b) {
            var aDiscovered = a.kills > 0 ? 1 : 0;
            var bDiscovered = b.kills > 0 ? 1 : 0;
            return aDiscovered - bDiscovered;
        });
        
        if (filtered.length === 0) {
            return '<div style="grid-column:1/-1;text-align:center;color:#888;padding:40px;">Нет существ с такими фильтрами</div>';
        }
        
        return filtered.map(function(beast) {
            var discovered = beast.kills > 0;
            var rarityColor = this.getRarityColor(beast.rarity || 'common');
            var rewardClaimed = beast.rewardClaimed || false;
            
            return `
            <div style="background:rgba(255,255,255,${discovered ? '0.05' : '0.02'});padding:12px;border-radius:6px;border-left:3px solid ${discovered ? rarityColor : '#333'};${!discovered ? 'opacity:0.6;' : ''}">
                <div style="display:flex;align-items:center;gap:10px;">
                    <div style="font-size:28px;">${beast.icon || '❓'}</div>
                    <div style="flex:1;">
                        <div style="font-weight:bold;color:${discovered ? rarityColor : '#555'};">
                            ${discovered ? beast.name : '???'}
                            ${beast.type === 'Босс' ? ' 👑' : ''}
                        </div>
                        <div style="font-size:11px;color:#888;">
                            ${beast.zone} | ${beast.floor}
                            ${discovered ? `| 🗡️ ${beast.kills}` : ''}
                        </div>
                        ${discovered ? `
                            <div style="font-size:12px;color:#aaa;margin-top:4px;max-height:40px;overflow:hidden;text-overflow:ellipsis;">
                                ${beast.lore}
                            </div>
                            <div style="font-size:11px;color:#ffd700;margin-top:4px;">
                                🏆 Награда: ${beast.reward} серебра
                                ${rewardClaimed ? '✅' : `<button onclick="Sherwood.Bestiary.claimFromUI('${beast.id}')" class="btn btn-success" style="padding:2px 10px;font-size:10px;margin-left:6px;">Забрать</button>`}
                            </div>
                        ` : `
                            <div style="font-size:12px;color:#444;">❓ Неизвестное существо</div>
                        `}
                    </div>
                </div>
            </div>`;
        }, this).join('');
    },

    claimFromUI: function(beastId) {
        var result = this.claimReward(beastId);
        if (result.success) {
            alert('✅ Получено ' + result.reward + ' серебра!');
            this._updateList();
        } else {
            alert('❌ ' + result.reason);
        }
    },

    // ============================================================
    //  closeUI — ВОЗВРАТ НА ГЛАВНУЮ
    // ============================================================
    closeUI: function() {
        var screen = document.getElementById('bestiary-screen');
        if (screen) screen.remove();
        
        // === ИСПРАВЛЕНИЕ: вместо Menu.show() ===
        if (typeof window.showHomeScreen === 'function') {
            window.showHomeScreen();
        }
    }
};

// ---------- ЭКСПОРТ ----------
window.Sherwood = window.Sherwood || {};
window.Sherwood.Bestiary = Sherwood.Bestiary;

console.log('📖 Бестиарий загружен!');
console.log('📚 Всего существ:', Object.keys(Sherwood.Bestiary.BEASTS).length);

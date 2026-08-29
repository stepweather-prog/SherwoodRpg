/**
 * Sherwood Bestiary — Бестиарий Шервуда
 * Полный сборник всех тварей с визуальным UI
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Bestiary = {
    _beasts: {},
    _discovered: {},
    _currentFilter: 'all',
    _currentZone: 'all',
    _searchQuery: '',
    _bestiaryTab: 0,

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
            lore: 'Птица, чьи перья пропитались токсичной пылью...'
        },
        'forest_strangler.png': {
            name: 'Лесной Душегуб',
            zone: 'Проклятая чаща',
            floor: 'Этаж 1',
            type: 'Босс',
            reward: 200,
            icon: '🌿',
            rarity: 'rare',
            lore: 'Скопище удушающих лоз, принявшее гуманоидную форму...'
        },
        'warped_imp.png': {
            name: 'Искажённый Бес',
            zone: 'Проклятая чаща',
            floor: 'Этаж 2',
            type: 'Демон',
            reward: 60,
            icon: '👿',
            rarity: 'common',
            lore: 'Юркая тварь, появившаяся из искажённой магии...'
        },
        'shard_back.png': {
            name: 'Шервудский Дикобраз',
            zone: 'Проклятая чаща',
            floor: 'Этаж 2',
            type: 'Босс',
            reward: 250,
            icon: '🦔',
            rarity: 'rare',
            lore: 'Исполинский мутант, чьи иглы способны пробивать базальт...'
        },
        'bone_borer.png': {
            name: 'Костяной Короед-Трупоед',
            zone: 'Проклятая чаща',
            floor: 'Этаж 3',
            type: 'Насекомое',
            reward: 70,
            icon: '🪲',
            rarity: 'common',
            lore: 'Поедает кости павших, вплетая их в свой хитиновый панцирь...'
        },
        'blight_lord_beetle.png': {
            name: 'Повелитель Гнили',
            zone: 'Проклятая чаща',
            floor: 'Этаж 3',
            type: 'Босс',
            reward: 300,
            icon: '🪲',
            rarity: 'rare',
            lore: 'Колоссальная матка жуков. Из её раздутого брюха каждое мгновение вылупляются новые твари...'
        },
        'blight_alpha.png': {
            name: 'Альфа-Скверноискатель',
            zone: 'Проклятая чаща',
            floor: 'Этаж 4',
            type: 'Зверь',
            reward: 80,
            icon: '🐺',
            rarity: 'uncommon',
            lore: 'Вожак стаи мутировавших псов...'
        },
        'oak_golem.png': {
            name: 'Голем Дуба',
            zone: 'Проклятая чаща',
            floor: 'Этаж 5',
            type: 'Голем',
            reward: 90,
            icon: '🗿',
            rarity: 'uncommon',
            lore: 'Первозданная форма лесного стража до осквернения...'
        },
        'root_executioner.png': {
            name: 'Корневой Палач',
            zone: 'Проклятая чаща',
            floor: 'Этаж 5',
            type: 'Босс',
            reward: 350,
            icon: '🌳',
            rarity: 'epic',
            lore: 'Труп, оплетённый пульсирующей лозой...'
        },
        'blight_lord_leshy.png': {
            name: 'Древний Владыка',
            zone: 'Проклятая чаща',
            floor: 'Этаж 6',
            type: 'Босс',
            reward: 400,
            icon: '🌲',
            rarity: 'epic',
            lore: 'Финальная форма Лешего...'
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
            lore: 'Хищный цветок, маскирующийся под корягу...'
        },
        'searing_arachnid.png': {
            name: 'Выжигающий Арахнид',
            zone: 'Первородное болото',
            floor: 'Этаж 1',
            type: 'Босс',
            reward: 200,
            icon: '🕷️',
            rarity: 'rare',
            lore: 'Паук, вплетший в свой панцирь тлеющие угли...'
        },
        'water_hag.png': {
            name: 'Водная Баба',
            zone: 'Первородное болото',
            floor: 'Этаж 2',
            type: 'Ведьма',
            reward: 60,
            icon: '🧙',
            rarity: 'common',
            lore: 'Склизкая карга, маскирующаяся под бревно...'
        },
        'sherwood_lizard.png': {
            name: 'Шервудский Ящер',
            zone: 'Первородное болото',
            floor: 'Этаж 2',
            type: 'Босс',
            reward: 250,
            icon: '🦎',
            rarity: 'rare',
            lore: 'Колоссальный рептилоид с угольной чешуёй...'
        },
        'swamp_vodyanoy.png': {
            name: 'Водяной Скверны',
            zone: 'Первородное болото',
            floor: 'Этаж 3',
            type: 'Босс',
            reward: 300,
            icon: '💧',
            rarity: 'rare',
            lore: 'Развращённый дух болот...'
        },
        'fox_pack_lord.png': {
            name: 'Повелитель Стаи',
            zone: 'Первородное болото',
            floor: 'Этаж 4',
            type: 'Босс',
            reward: 350,
            icon: '🦊',
            rarity: 'epic',
            lore: 'Огромный лис-переросток...'
        },
        'plague_bat.png': {
            name: 'Чумная Летучая Мышь',
            zone: 'Первородное болото',
            floor: 'Этаж 5',
            type: 'Босс',
            reward: 350,
            icon: '🦇',
            rarity: 'epic',
            lore: 'Размером с виверну...'
        },
        'ash_overlord.png': {
            name: 'Владыка Пепла',
            zone: 'Первородное болото',
            floor: 'Этаж 6',
            type: 'Босс',
            reward: 400,
            icon: '🔥',
            rarity: 'legendary',
            lore: 'Призрачный колосс из пепла и застывшей магмы...'
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
            lore: 'Литофаг, питающийся камнем...'
        },
        'lost_treasure_hunter.png': {
            name: 'Пропавший Кладоискатель',
            zone: 'Базальтовый грот',
            floor: 'Этаж 1',
            type: 'Босс',
            reward: 200,
            icon: '💀',
            rarity: 'rare',
            lore: 'Безумный зомби в золочёной броне...'
        },
        'cursed_priestess.png': {
            name: 'Проклятая Жрица',
            zone: 'Базальтовый грот',
            floor: 'Этаж 2',
            type: 'Босс',
            reward: 250,
            icon: '🔮',
            rarity: 'rare',
            lore: 'Уродливая тварь, чьё тело разорвано изнутри тёмными щупальцами...'
        },
        'mistress_of_the_roots.png': {
            name: 'Повелительница корней',
            zone: 'Базальтовый грот',
            floor: 'Этаж 3',
            type: 'Босс',
            reward: 300,
            icon: '🌿',
            rarity: 'epic',
            lore: 'Женщина-монстр, оплетённая мхом и ветвями...'
        },
        'chaos_lord.png': {
            name: 'Лорд Хаоса',
            zone: 'Базальтовый грот',
            floor: 'Этаж 4',
            type: 'Босс',
            reward: 350,
            icon: '👾',
            rarity: 'epic',
            lore: 'Зловещий владыка в рогатом капюшоне...'
        },
        'lord_of_the_feathered.png': {
            name: 'Хозяин Пернатых',
            zone: 'Базальтовый грот',
            floor: 'Этаж 5',
            type: 'Босс',
            reward: 350,
            icon: '🦅',
            rarity: 'epic',
            lore: 'Древний птиче-человек с огромным размахом крыльев...'
        },
        'corruption_raccoon.png': {
            name: 'Енот Порчи',
            zone: 'Базальтовый грот',
            floor: 'Этаж 6',
            type: 'Босс',
            reward: 400,
            icon: '🦝',
            rarity: 'legendary',
            lore: 'Симбиот Бездны...'
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
            lore: 'Бывший лесничий, предавший Шервуд ради золота...'
        },
        'blight_alpha_stag.png': {
            name: 'Вожак Искаженной Стаи',
            zone: 'Квест',
            floor: 'Глава 2',
            type: 'Босс',
            reward: 120,
            icon: '🦌',
            rarity: 'rare',
            lore: 'Олень-вожак, поглощённый скверной...'
        },
        'huntsman_alpha_hound.png': {
            name: 'Альфа-Гончая Егеря',
            zone: 'Квест',
            floor: 'Глава 3',
            type: 'Босс',
            reward: 140,
            icon: '🐕',
            rarity: 'rare',
            lore: 'Верный пёс егеря, превращённый скверной в безжалостного убийцу...'
        },
        'fallen_druid.png': {
            name: 'Падший Друид',
            zone: 'Квест',
            floor: 'Глава 4',
            type: 'Босс',
            reward: 160,
            icon: '🧝',
            rarity: 'epic',
            lore: 'Последний хранитель Дуба...'
        },
        'thicket_hunger.png': {
            name: 'Голод Чащи',
            zone: 'Квест',
            floor: 'Глава 5',
            type: 'Босс',
            reward: 180,
            icon: '🌿',
            rarity: 'epic',
            lore: 'Бесформенный ком лоз, костей и пастей...'
        },
        'echo_devourer.png': {
            name: 'Пожиратель Эха',
            zone: 'Квест',
            floor: 'Глава 7',
            type: 'Босс',
            reward: 200,
            icon: '👻',
            rarity: 'epic',
            lore: 'Сгусток чёрного дыма и призрачных клинков...'
        },
        'mistress_of_the_mires.png': {
            name: 'Повелительница Топей',
            zone: 'Квест',
            floor: 'Глава 8',
            type: 'Босс',
            reward: 220,
            icon: '🧙',
            rarity: 'epic',
            lore: 'Существо из гнили, воды и мёртвой плоти...'
        },
        'rift_warden.png': {
            name: 'Страж Разломов',
            zone: 'Квест',
            floor: 'Глава 9',
            type: 'Босс',
            reward: 240,
            icon: '🌀',
            rarity: 'epic',
            lore: 'Левитирующая тварь из вывернутой породы и десятков глаз...'
        },
        'the_hive_mother.png': {
            name: 'Матка Лесных Короедов',
            zone: 'Квест',
            floor: 'Глава 10',
            type: 'Босс',
            reward: 260,
            icon: '🪲',
            rarity: 'epic',
            lore: 'Колоссальная матка с панцирем, усыпанным моргающими глазами...'
        },
        'the_cursed_outlaw_king.png': {
            name: 'Проклятый Король Разбойников',
            zone: 'Квест',
            floor: 'Глава 11',
            type: 'Босс',
            reward: 280,
            icon: '👑',
            rarity: 'legendary',
            lore: 'Король, поглощённый тьмой...'
        },
        'ancient_crypt_warden.png': {
            name: 'Древний Хранитель Склепа',
            zone: 'Квест',
            floor: 'Глава 12',
            type: 'Босс',
            reward: 300,
            icon: '🗿',
            rarity: 'legendary',
            lore: 'Титан из чёрного дуба и камня...'
        },
        'echo_of_the_triumvirate.png': {
            name: 'Эхо Трех Порталов',
            zone: 'Квест',
            floor: 'Глава 13',
            type: 'Босс',
            reward: 320,
            icon: '🌀',
            rarity: 'legendary',
            lore: 'Чистое искажение, принявшее форму...'
        },
        'sacred_tree_executioner.png': {
            name: 'Палач Священного Древа',
            zone: 'Квест',
            floor: 'Глава 14',
            type: 'Босс',
            reward: 340,
            icon: '⚔️',
            rarity: 'legendary',
            lore: 'Капитан Охотников, распятый корнями...'
        },
        'sherwood_abomination.png': {
            name: 'Шервудское Отродье',
            zone: 'Квест',
            floor: 'Глава 15',
            type: 'Босс',
            reward: 400,
            icon: '👾',
            rarity: 'mythic',
            lore: 'Многорукий исполин из базальта и гнилой древесины...'
        },
        'the_primordial_core.png': {
            name: 'Изначальный Стержень',
            zone: 'Квест',
            floor: 'Секретная глава',
            type: 'Босс',
            reward: 500,
            icon: '🖤',
            rarity: 'mythic',
            lore: 'Глаз того, кто спит под Шервудом с начала времён...'
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
            lore: 'Колоссальный богомол-мутант...'
        },
        'the_dark_weaver.png': {
            name: 'Ткачиха Мрака',
            zone: 'Портал',
            floor: 'Портал Черных Пауков',
            type: 'Босс',
            reward: 300,
            icon: '🕷️',
            rarity: 'epic',
            lore: 'Гротескная гибрид...'
        },
        'the_decayed_titan.png': {
            name: 'Истлевший Титан',
            zone: 'Портал',
            floor: 'Портал Увядания',
            type: 'Босс',
            reward: 300,
            icon: '🗿',
            rarity: 'epic',
            lore: 'Гигантский энт, заражённый некротической скверной...'
        },
        'the_eternal_prisoner.png': {
            name: 'Вечный Узник',
            zone: 'Портал',
            floor: 'Портал Цепей',
            type: 'Босс',
            reward: 300,
            icon: '⛓️',
            rarity: 'legendary',
            lore: 'Колоссальный рыцарь, чьё тело заковано в раскалённые латы...'
        },
        'the_blood_alpha.png': {
            name: 'Кровавый Вожак',
            zone: 'Портал',
            floor: 'Портал Ликантропов',
            type: 'Босс',
            reward: 300,
            icon: '🐺',
            rarity: 'legendary',
            lore: 'Титанический оборотень...'
        },
        'the_basalt_reaper.png': {
            name: 'Базальтовый Жнец',
            zone: 'Портал',
            floor: 'Портал Скорпиона',
            type: 'Босс',
            reward: 300,
            icon: '🦂',
            rarity: 'legendary',
            lore: 'Колоссальный скорпион...'
        },
        'embodiment_of_distortion.png': {
            name: 'Воплощение Искажения',
            zone: 'Портал',
            floor: 'Портал Искажения',
            type: 'Босс',
            reward: 400,
            icon: '🌀',
            rarity: 'mythic',
            lore: 'Левитирующая масса из десятков безумных глаз...'
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
            lore: 'Спящий в Корнях...'
        }
    },

    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.bestiary) player.bestiary = {};
        this._discovered = player.bestiary;
        console.log('📖 Бестиарий инициализирован');
    },

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
        return { total: total, discovered: discovered, percent: total > 0 ? Math.round((discovered / total) * 100) : 0 };
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

    // ========== UI ==========

    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Бестиарий', '📖');
            }
            return;
        }
        UI._playSound('click');

        var progress = this.getDiscoveryProgress();
        var tabs = ['Проклятая чаща', 'Первородное болото', 'Базальтовый грот', 'Квест', 'Портал'];
        if (!this._bestiaryTab) this._bestiaryTab = 0;

        var h = '<div style="padding:10px;max-width:400px;margin:0 auto;">';
        h += '<div style="text-align:center;margin-bottom:8px;color:#aaa;">📊 Открыто: ' + progress.discovered + '/' + progress.total + ' (' + progress.percent + '%)</div>';
        h += '<div style="background:rgba(0,0,0,0.3);border-radius:6px;height:10px;margin-bottom:8px;overflow:hidden;"><div style="background:#c9a040;height:100%;width:' + progress.percent + '%;"></div></div>';

        h += '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px;justify-content:center;">';
        for (var t = 0; t < tabs.length; t++) {
            var active = (this._bestiaryTab === t) ? '#c9a040' : 'rgba(255,255,255,0.1)';
            var color = (this._bestiaryTab === t) ? '#000' : '#fff';
            h += '<button onclick="Sherwood.Bestiary._bestiaryTab=' + t + ';Sherwood.Bestiary.showUI();" style="background:' + active + ';border:1px solid #555;border-radius:6px;padding:4px 10px;color:' + color + ';cursor:pointer;font-size:0.7em;">' + tabs[t] + '</button>';
        }
        h += '</div>';

        var beasts = this.getBeastsByZone(tabs[this._bestiaryTab]);
        if (beasts.length === 0) {
            h += '<div style="color:#aaa;text-align:center;padding:20px;">Нет бестий</div>';
        } else {
            h += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
            for (var i = 0; i < beasts.length; i++) {
                var b = beasts[i];
                var disc = b.kills > 0;
                var beastImgPath = 'assets/all_beasts/' + b.id;
                if (b.zone === 'Квест') beastImgPath = 'assets/beast_quest/' + b.id;
                if (b.zone === 'Портал') beastImgPath = 'assets/portal_beasts/' + b.id;

                h += '<div onclick="Sherwood.Bestiary._showBeastInfo(\'' + b.id + '\')" style="background:rgba(0,0,0,0.5);border:1px solid ' + (disc ? '#4caf50' : '#555') + ';border-radius:8px;padding:8px;display:flex;flex-direction:column;align-items:center;cursor:pointer;">';
                h += '<img src="' + beastImgPath + '" style="width:60px;height:60px;object-fit:contain;border-radius:4px;' + (disc ? '' : 'filter:grayscale(1);opacity:0.5;') + '" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                h += '<div style="color:' + (disc ? '#fff' : '#888') + ';font-size:0.6em;text-align:center;margin-top:2px;">' + (disc ? b.name : '???') + '</div>';
                h += '<div style="color:#aaa;font-size:0.5em;">Убито: ' + b.kills + '</div>';
                if (disc && !b.rewardClaimed) {
                    h += '<button onclick="event.stopPropagation();Sherwood.Bestiary._claimFromUI(\'' + b.id + '\')" style="background:#ff9800;border:none;border-radius:4px;padding:2px 8px;color:#fff;cursor:pointer;font-size:0.5em;margin-top:2px;">+' + b.reward + ' Сер.</button>';
                }
                if (disc && b.rewardClaimed) {
                    h += '<span style="color:#4caf50;font-size:0.5em;margin-top:2px;">✓</span>';
                }
                h += '</div>';
            }
            h += '</div>';
        }
        h += '</div>';

        UI._openScreenScrollable('📖 Бестиарий', 'bestiary', h);
    },

    _showBeastInfo: function(beastId) {
        var b = this.getBeast(beastId);
        if (!b) return;
        var disc = b.kills > 0;
        var beastImgPath = 'assets/all_beasts/' + beastId;
        if (b.zone === 'Квест') beastImgPath = 'assets/beast_quest/' + beastId;
        if (b.zone === 'Портал') beastImgPath = 'assets/portal_beasts/' + beastId;

        var h = '<div style="display:flex;gap:12px;padding:12px;">';
        h += '<div style="width:120px;flex-shrink:0;"><img src="' + beastImgPath + '" style="width:120px;height:120px;object-fit:contain;border:2px solid #c9a040;border-radius:10px;' + (disc ? '' : 'filter:grayscale(1);opacity:0.5;') + '" onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
        h += '<div style="text-align:center;color:#e0c080;font-weight:bold;margin-top:4px;">' + b.name + '</div>';
        h += '<div style="text-align:center;color:#aaa;font-size:0.7em;">' + b.floor + ' | ' + b.type + '</div></div>';
        h += '<div style="flex:1;"><div style="color:#ccc;font-size:0.8em;line-height:1.4;">' + (disc ? b.lore : 'Убейте эту бестию чтобы открыть лор.') + '</div>';
        h += '<div style="color:#aaa;font-size:0.7em;margin-top:8px;">Убито: ' + b.kills + ' | Награда: ' + (b.reward || 50) + ' Сер.</div>';
        if (disc && !b.rewardClaimed) {
            h += '<button onclick="Sherwood.Bestiary._claimFromUI(\'' + beastId + '\')" style="margin-top:8px;background:#ff9800;border:none;border-radius:6px;padding:6px 16px;color:#fff;cursor:pointer;">Забрать ' + (b.reward || 50) + ' Сер.</button>';
        }
        if (disc && b.rewardClaimed) {
            h += '<div style="color:#4caf50;margin-top:8px;">Награда получена</div>';
        }
        h += '</div></div>';

        UI._openScreen(b.name, 'bestiary', h, 'Sherwood.Bestiary.showUI()');
    },

    _claimFromUI: function(beastId) {
        var r = this.claimReward(beastId);
        if (r.success) {
            UI._playSound('loot_fly');
            UI.updateDisplay();
            this.showUI();
        } else {
            UI._showToast(r.reason || 'Ошибка');
        }
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Bestiary = Sherwood.Bestiary;

console.log('📖 Бестиарий загружен!');

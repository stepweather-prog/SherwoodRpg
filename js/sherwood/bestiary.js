/**
 * Sherwood Bestiary — Бестиарий Шервуда (Ведьмак-стиль)
 * Две вкладки: Боссы / Бестии Шервуда
 * Вертикальная карусель, только открытые, награды-сюрпризы
 */

if (typeof Sherwood === 'undefined') { window.Sherwood = {}; }

Sherwood.Bestiary = {

    // ============================================================
    //  ДАННЫЕ БЕСТИЙ
    // ============================================================
    BEASTS: {
        // ========== ПОДЗЕМКА 1: Проклятая чаща ==========
        'plague_crow.png':        { name: 'Чумной Ворон',              zone: 'Проклятая чаща',     floor: 'Этаж 1', type: 'Птица',     rarity: 'common',    lore: 'Птица, чьи перья пропитались токсичной пылью...' },
        'forest_strangler.png':   { name: 'Лесной Душегуб',            zone: 'Проклятая чаща',     floor: 'Этаж 1', type: 'Босс',      rarity: 'rare',      lore: 'Скопище удушающих лоз, принявшее гуманоидную форму...' },
        'warped_imp.png':         { name: 'Искажённый Бес',            zone: 'Проклятая чаща',     floor: 'Этаж 2', type: 'Демон',     rarity: 'common',    lore: 'Юркая тварь, появившаяся из искажённой магии...' },
        'shard_back.png':         { name: 'Шервудский Дикобраз',       zone: 'Проклятая чаща',     floor: 'Этаж 2', type: 'Босс',      rarity: 'rare',      lore: 'Исполинский мутант, чьи иглы способны пробивать базальт...' },
        'bone_borer.png':         { name: 'Костяной Короед-Трупоед',   zone: 'Проклятая чаща',     floor: 'Этаж 3', type: 'Насекомое', rarity: 'common',    lore: 'Поедает кости павших, вплетая их в свой хитиновый панцирь...' },
        'blight_lord_beetle.png': { name: 'Повелитель Гнили',          zone: 'Проклятая чаща',     floor: 'Этаж 3', type: 'Босс',      rarity: 'rare',      lore: 'Колоссальная матка жуков. Из её раздутого брюха каждое мгновение вылупляются новые твари...' },
        'blight_alpha.png':       { name: 'Альфа-Скверноискатель',     zone: 'Проклятая чаща',     floor: 'Этаж 4', type: 'Зверь',     rarity: 'uncommon',  lore: 'Вожак стаи мутировавших псов...' },
        'oak_golem.png':          { name: 'Голем Дуба',                zone: 'Проклятая чаща',     floor: 'Этаж 5', type: 'Голем',     rarity: 'uncommon',  lore: 'Первозданная форма лесного стража до осквернения...' },
        'root_executioner.png':   { name: 'Корневой Палач',            zone: 'Проклятая чаща',     floor: 'Этаж 5', type: 'Босс',      rarity: 'epic',      lore: 'Труп, оплетённый пульсирующей лозой...' },
        'blight_lord_leshy.png':  { name: 'Древний Владыка',           zone: 'Проклятая чаща',     floor: 'Этаж 6', type: 'Босс',      rarity: 'epic',      lore: 'Финальная форма Лешего...' },

        // ========== ПОДЗЕМКА 2: Первородное болото ==========
        'bog_trapper.png':         { name: 'Болотный Капкан',          zone: 'Первородное болото', floor: 'Этаж 1', type: 'Растение',  rarity: 'common',    lore: 'Хищный цветок, маскирующийся под корягу...' },
        'searing_arachnid.png':    { name: 'Выжигающий Арахнид',       zone: 'Первородное болото', floor: 'Этаж 1', type: 'Босс',      rarity: 'rare',      lore: 'Паук, вплетший в свой панцирь тлеющие угли...' },
        'water_hag.png':           { name: 'Водная Баба',              zone: 'Первородное болото', floor: 'Этаж 2', type: 'Ведьма',    rarity: 'common',    lore: 'Склизкая карга, маскирующаяся под бревно...' },
        'sherwood_lizard.png':     { name: 'Шервудский Ящер',          zone: 'Первородное болото', floor: 'Этаж 2', type: 'Босс',      rarity: 'rare',      lore: 'Колоссальный рептилоид с угольной чешуёй...' },
        'swamp_vodyanoy.png':      { name: 'Водяной Скверны',          zone: 'Первородное болото', floor: 'Этаж 3', type: 'Босс',      rarity: 'rare',      lore: 'Развращённый дух болот...' },
        'fox_pack_lord.png':       { name: 'Повелитель Стаи',          zone: 'Первородное болото', floor: 'Этаж 4', type: 'Босс',      rarity: 'epic',      lore: 'Огромный лис-переросток...' },
        'plague_bat.png':          { name: 'Чумная Летучая Мышь',      zone: 'Первородное болото', floor: 'Этаж 5', type: 'Босс',      rarity: 'epic',      lore: 'Размером с виверну...' },
        'ash_overlord.png':        { name: 'Владыка Пепла',            zone: 'Первородное болото', floor: 'Этаж 6', type: 'Босс',      rarity: 'legendary', lore: 'Призрачный колосс из пепла и застывшей магмы...' },

        // ========== ПОДЗЕМКА 3: Базальтовый грот ==========
        'basalt_devourer.png':     { name: 'Базальтовый Пожиратель',   zone: 'Базальтовый грот',   floor: 'Этаж 1', type: 'Тварь',     rarity: 'common',    lore: 'Литофаг, питающийся камнем...' },
        'lost_treasure_hunter.png':{ name: 'Пропавший Кладоискатель',  zone: 'Базальтовый грот',   floor: 'Этаж 1', type: 'Босс',      rarity: 'rare',      lore: 'Безумный зомби в золочёной броне...' },
        'cursed_priestess.png':    { name: 'Проклятая Жрица',          zone: 'Базальтовый грот',   floor: 'Этаж 2', type: 'Босс',      rarity: 'rare',      lore: 'Уродливая тварь, чьё тело разорвано изнутри тёмными щупальцами...' },
        'mistress_of_the_roots.png':{ name: 'Повелительница Корней',   zone: 'Базальтовый грот',   floor: 'Этаж 3', type: 'Босс',      rarity: 'epic',      lore: 'Женщина-монстр, оплетённая мхом и ветвями...' },
        'chaos_lord.png':          { name: 'Лорд Хаоса',               zone: 'Базальтовый грот',   floor: 'Этаж 4', type: 'Босс',      rarity: 'epic',      lore: 'Зловещий владыка в рогатом капюшоне...' },
        'lord_of_the_feathered.png':{ name: 'Хозяин Пернатых',         zone: 'Базальтовый грот',   floor: 'Этаж 5', type: 'Босс',      rarity: 'epic',      lore: 'Древний птице-человек с огромным размахом крыльев...' },
        'corruption_raccoon.png':  { name: 'Енот Порчи',               zone: 'Базальтовый грот',   floor: 'Этаж 6', type: 'Босс',      rarity: 'legendary', lore: 'Симбиот Бездны...' },

        // ========== ПОДЗЕМКА 4: Разлом времени (бывшие квесты) ==========
        'fallen_forester.png':        { name: 'Лесничий-Отступник',          zone: 'Разлом времени', floor: 'Глава 1',        type: 'Босс', rarity: 'rare',      lore: 'Бывший лесничий, предавший Шервуд ради золота...' },
        'blight_alpha_stag.png':      { name: 'Вожак Искаженной Стаи',       zone: 'Разлом времени', floor: 'Глава 2',        type: 'Босс', rarity: 'rare',      lore: 'Олень-вожак, поглощённый скверной...' },
        'huntsman_alpha_hound.png':   { name: 'Альфа-Гончая Егеря',          zone: 'Разлом времени', floor: 'Глава 3',        type: 'Босс', rarity: 'rare',      lore: 'Верный пёс егеря, превращённый скверной в безжалостного убийцу...' },
        'fallen_druid.png':           { name: 'Падший Друид',                zone: 'Разлом времени', floor: 'Глава 4',        type: 'Босс', rarity: 'epic',      lore: 'Последний хранитель Дуба...' },
        'thicket_hunger.png':         { name: 'Голод Чащи',                  zone: 'Разлом времени', floor: 'Глава 5',        type: 'Босс', rarity: 'epic',      lore: 'Бесформенный ком лоз, костей и пастей...' },
        'echo_devourer.png':          { name: 'Пожиратель Эха',              zone: 'Разлом времени', floor: 'Глава 7',        type: 'Босс', rarity: 'epic',      lore: 'Сгусток чёрного дыма и призрачных клинков...' },
        'mistress_of_the_mires.png':  { name: 'Повелительница Топей',        zone: 'Разлом времени', floor: 'Глава 8',        type: 'Босс', rarity: 'epic',      lore: 'Существо из гнили, воды и мёртвой плоти...' },
        'rift_warden.png':            { name: 'Страж Разломов',              zone: 'Разлом времени', floor: 'Глава 9',        type: 'Босс', rarity: 'epic',      lore: 'Левитирующая тварь из вывернутой породы и десятков глаз...' },
        'the_hive_mother.png':        { name: 'Матка Лесных Короедов',       zone: 'Разлом времени', floor: 'Глава 10',       type: 'Босс', rarity: 'epic',      lore: 'Колоссальная матка с панцирем, усыпанным моргающими глазами...' },
        'the_cursed_outlaw_king.png': { name: 'Проклятый Король Разбойников',zone: 'Разлом времени', floor: 'Глава 11',       type: 'Босс', rarity: 'legendary', lore: 'Король, поглощённый тьмой...' },
        'ancient_crypt_warden.png':   { name: 'Древний Хранитель Склепа',    zone: 'Разлом времени', floor: 'Глава 12',       type: 'Босс', rarity: 'legendary', lore: 'Титан из чёрного дуба и камня...' },
        'echo_of_the_triumvirate.png':{ name: 'Эхо Трех Порталов',           zone: 'Разлом времени', floor: 'Глава 13',       type: 'Босс', rarity: 'legendary', lore: 'Чистое искажение, принявшее форму...' },
        'sacred_tree_executioner.png':{ name: 'Палач Священного Древа',      zone: 'Разлом времени', floor: 'Глава 14',       type: 'Босс', rarity: 'legendary', lore: 'Капитан Охотников, распятый корнями...' },
        'sherwood_abomination.png':   { name: 'Шервудское Отродье',          zone: 'Разлом времени', floor: 'Глава 15',       type: 'Босс', rarity: 'mythic',    lore: 'Многорукий исполин из базальта и гнилой древесины...' },
        'the_primordial_core.png':    { name: 'Изначальный Стержень',        zone: 'Разлом времени', floor: 'Секретная глава',type: 'Босс', rarity: 'mythic',    lore: 'Глаз того, кто спит под Шервудом с начала времён...' },

        // ========== БОССЫ ПОРТАЛОВ ==========
        'the_reaper_commander.png':   { name: 'Жнец-Полководец',      zone: 'Портал', floor: 'Портал Нашествия',      type: 'Босс', rarity: 'epic',      lore: 'Колоссальный богомол-мутант...' },
        'the_dark_weaver.png':        { name: 'Ткачиха Мрака',        zone: 'Портал', floor: 'Портал Черных Пауков',  type: 'Босс', rarity: 'epic',      lore: 'Гротескный гибрид...' },
        'the_decayed_titan.png':      { name: 'Истлевший Титан',      zone: 'Портал', floor: 'Портал Увядания',       type: 'Босс', rarity: 'epic',      lore: 'Гигантский энт, заражённый некротической скверной...' },
        'the_eternal_prisoner.png':   { name: 'Вечный Узник',         zone: 'Портал', floor: 'Портал Цепей',          type: 'Босс', rarity: 'legendary', lore: 'Колоссальный рыцарь, чьё тело заковано в раскалённые латы...' },
        'the_blood_alpha.png':        { name: 'Кровавый Вожак',       zone: 'Портал', floor: 'Портал Ликантропов',    type: 'Босс', rarity: 'legendary', lore: 'Титанический оборотень...' },
        'the_basalt_reaper.png':      { name: 'Базальтовый Жнец',     zone: 'Портал', floor: 'Портал Скорпиона',      type: 'Босс', rarity: 'legendary', lore: 'Колоссальный скорпион...' },
        'embodiment_of_distortion.png':{ name: 'Воплощение Искажения',zone: 'Портал', floor: 'Портал Искажения',      type: 'Босс', rarity: 'mythic',    lore: 'Левитирующая масса из десятков безумных глаз...' },

        // ========== РЕЙД ==========
        'original_horror.png': { name: 'Изначальный Ужас', zone: 'Рейд', floor: 'Мировой рейд', type: 'Босс', rarity: 'mythic', lore: 'Спящий в Корнях...' }
    },

    // ============================================================
    //  ВКЛАДКИ
    // ============================================================
    TABS: [
        { key: 'bosses', name: 'Боссы',          filter: function(b) { return b.type === 'Босс'; } },
        { key: 'beasts', name: 'Бестии Шервуда', filter: function(b) { return b.type !== 'Босс'; } }
    ],

    _currentTab: 0,
    _currentIndex: 0,
    _discovered: {},

    // ============================================================
    //  ИНИЦИАЛИЗАЦИЯ
    // ============================================================
    init: function() {
        var player = Sherwood.getPlayer();
        if (!player) return;
        if (!player.bestiary) player.bestiary = {};
        this._discovered = player.bestiary;
        console.log('📖 Бестиарий инициализирован');
    },

    // ============================================================
    //  РЕГИСТРАЦИЯ УБИЙСТВА
    // ============================================================
    registerKill: function(beastImage) {
        if (!beastImage) return;

        var key = beastImage;
        if (!this.BEASTS[key] && this.BEASTS[key + '.png']) key = key + '.png';

        var beast = this.BEASTS[key];
        if (!beast) {
            console.warn('📖 Бестиарий: неизвестная бестия', beastImage);
            return;
        }
        if (!this._discovered[key]) {
            this._discovered[key] = { kills: 0, rewardClaimed: false };
        }
        this._discovered[key].kills++;
        var player = Sherwood.getPlayer();
        if (player) {
            player.bestiary = this._discovered;
            Sherwood.saveGame();
        }
        console.log('📖 Открыта бестия:', beast.name, '(всего убийств:', this._discovered[key].kills + ')');
    },

    // ============================================================
    //  ПОЛУЧЕНИЕ ДАННЫХ
    // ============================================================
    getBeast: function(beastId) {
        var beastData = this.BEASTS[beastId];
        if (!beastData) return null;
        var discovery = this._discovered[beastId] || { kills: 0, rewardClaimed: false };
        return {
            id: beastId,
            name: beastData.name,
            zone: beastData.zone,
            floor: beastData.floor,
            type: beastData.type,
            rarity: beastData.rarity,
            lore: beastData.lore,
            kills: discovery.kills || 0,
            rewardClaimed: discovery.rewardClaimed || false
        };
    },

    getDiscoveredBeasts: function(tabIndex) {
        var tab = this.TABS[tabIndex];
        if (!tab) return [];
        var result = [];
        for (var id in this.BEASTS) {
            if (!this._discovered[id] || this._discovered[id].kills <= 0) continue;
            var b = this.getBeast(id);
            if (b && tab.filter(b)) result.push(b);
        }
        result.sort(function(a, b) {
            if (a.rewardClaimed !== b.rewardClaimed) return a.rewardClaimed ? 1 : -1;
            return 0;
        });
        return result;
    },

    getBeastsByFloor: function(dungeonId, floor) {
        var zoneMap = { 1: 'Проклятая чаща', 2: 'Первородное болото', 3: 'Базальтовый грот', 4: 'Разлом времени' };
        var zone = zoneMap[dungeonId];
        if (!zone) return [];
        var floorStr = 'Этаж ' + floor;
        var result = [];
        for (var id in this.BEASTS) {
            var b = this.BEASTS[id];
            if (b.zone === zone && b.floor === floorStr) {
                result.push({ id: id, name: b.name, type: b.type });
            }
        }
        return result;
    },

    getDiscoveryProgress: function() {
        var total = Object.keys(this.BEASTS).length;
        var discovered = 0;
        for (var id in this._discovered) {
            if (this._discovered[id] && this._discovered[id].kills > 0) discovered++;
        }
        return { total: total, discovered: discovered, percent: total > 0 ? Math.round((discovered / total) * 100) : 0 };
    },

    // ============================================================
    //  НАГРАДЫ
    // ============================================================
    _rollRewards: function(rarity) {
        var table = {
            common:    { gold: [0, 5],     exp: [10, 20],   tabletChance: 0    },
            uncommon:  { gold: [5, 10],    exp: [20, 35],   tabletChance: 0.05 },
            rare:      { gold: [10, 25],   exp: [40, 60],   tabletChance: 0.10 },
            epic:      { gold: [25, 50],   exp: [80, 120],  tabletChance: 0.20 },
            legendary: { gold: [50, 100],  exp: [150, 250], tabletChance: 0.35 },
            mythic:    { gold: [100, 200], exp: [300, 500], tabletChance: 0.50 }
        };
        var r = table[rarity] || table.common;

        function randRange(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

        var rewards = {
            gold: randRange(r.gold[0], r.gold[1]),
            exp: randRange(r.exp[0], r.exp[1]),
            tablets: 0,
            tabletType: null
        };

        if (Math.random() < r.tabletChance) {
            rewards.tablets = 1 + Math.floor(Math.random() * 2);
            rewards.tabletType = Math.random() < 0.5 ? 'ringTablets' : 'amuletTablets';
        }
        return rewards;
    },

    claimReward: function(beastId) {
        var beast = this.getBeast(beastId);
        if (!beast) return { success: false, reason: 'Бестия не найдена' };
        if (beast.kills <= 0) return { success: false, reason: 'Бестия не убита' };
        if (beast.rewardClaimed) return { success: false, reason: 'Награда уже получена' };

        var rewards = this._rollRewards(beast.rarity);

        if (rewards.gold > 0) Sherwood.addResource('gold', rewards.gold);
        if (rewards.exp > 0) Sherwood.addExp(rewards.exp);
        if (rewards.tablets > 0 && rewards.tabletType) {
            Sherwood.addResource(rewards.tabletType, rewards.tablets);
        }

        this._discovered[beastId].rewardClaimed = true;
        var player = Sherwood.getPlayer();
        if (player) player.bestiary = this._discovered;
        Sherwood.saveGame();

        return { success: true, rewards: rewards };
    },

    // ============================================================
    //  УТИЛИТЫ
    // ============================================================
    getRarityColor: function(rarity) {
        var colors = {
            'common':    '#888888',
            'uncommon':  '#52b788',
            'rare':      '#4a8ab7',
            'epic':      '#9b59b6',
            'legendary': '#ffa500',
            'mythic':    '#ff6b35'
        };
        return colors[rarity] || '#888888';
    },

    getRarityName: function(rarity) {
        var names = {
            'common':    'Обычная',
            'uncommon':  'Необычная',
            'rare':      'Редкая',
            'epic':      'Эпическая',
            'legendary': 'Легендарная',
            'mythic':    'Мифическая'
        };
        return names[rarity] || 'Обычная';
    },

    _beastImagePath: function(beast) {
        if (beast.zone === 'Разлом времени') return 'assets/beast_quest/' + beast.id;
        if (beast.zone === 'Портал')        return 'assets/portal_beasts/' + beast.id;
        return 'assets/all_beasts/' + beast.id;
    },

    // ============================================================
    //  UI — СПИСОК (карусель)
    // ============================================================
    showUI: function() {
        if (typeof UI === 'undefined') return;
        UI._playSound('click');

        var self = this;
        var currentTab = this._currentTab || 0;
        var beasts = this.getDiscoveredBeasts(currentTab);

        if (this._currentIndex >= beasts.length) this._currentIndex = 0;
        if (this._currentIndex < 0) this._currentIndex = 0;

        var h = '';

        // --- Табы ---
        h += '<div style="display:flex;gap:6px;justify-content:center;margin-bottom:14px;padding:0 8px;">';
        for (var t = 0; t < this.TABS.length; t++) {
            var tab = this.TABS[t];
            var active = (t === currentTab);
            var bg = active ? '#c9a040' : 'rgba(0,0,0,0.6)';
            var color = active ? '#000' : '#c9a040';
            var border = active ? '#ffd27a' : '#6b5a3a';
            h += '<button onclick="Sherwood.Bestiary._currentTab=' + t + ';Sherwood.Bestiary._currentIndex=0;Sherwood.Bestiary.showUI();" ' +
                 'style="flex:1;max-width:180px;background:' + bg + ';border:2px solid ' + border + ';border-radius:8px;padding:10px 14px;color:' + color + ';cursor:pointer;font:bold 14px \'Times New Roman\',serif;text-shadow:0 2px 4px #000;letter-spacing:1px;">' +
                 tab.name + '</button>';
        }
        h += '</div>';

        // --- Карусель или пустой экран ---
        if (beasts.length === 0) {
            h += '<div style="text-align:center;padding:80px 24px;color:#c8a050;">';
            h += '<div style="font-size:3em;margin-bottom:16px;opacity:0.6;">📖</div>';
            h += '<div style="font-size:1.1em;font-weight:bold;margin-bottom:8px;">Пока никого не открыто</div>';
            h += '<div style="color:#888;font-size:0.9em;line-height:1.5;">Победи первую бестию в бою —<br>и она появится здесь.</div>';
            h += '</div>';
        } else {
            h += '<div id="beast-carousel" style="position:relative;width:100%;height:calc(100vh - 220px);min-height:420px;overflow:hidden;touch-action:pan-y;user-select:none;">';

            for (var i = 0; i < beasts.length; i++) {
                var b = beasts[i];
                var rarityColor = this.getRarityColor(b.rarity);
                var imgPath = this._beastImagePath(b);

                h += '<div class="beast-slide" data-index="' + i + '" ' +
                     'style="position:absolute;top:0;left:0;width:100%;height:100%;' +
                     'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
                     'transition:transform 0.35s cubic-bezier(0.22,1,0.36,1);' +
                     'transform:translateY(' + ((i - this._currentIndex) * 100) + '%);' +
                     'cursor:pointer;" ' +
                     'onclick="if(!Sherwood.Bestiary._wasDragging)Sherwood.Bestiary._showBeastInfo(\'' + b.id + '\');">';

                h += '<div style="position:relative;width:260px;height:260px;max-width:80vw;max-height:80vw;' +
                     'background:radial-gradient(circle at 50% 50%, rgba(0,0,0,0.0) 30%, rgba(0,0,0,0.4) 100%);' +
                     'border:3px solid ' + rarityColor + ';border-radius:16px;' +
                     'box-shadow:0 0 30px ' + rarityColor + '44, inset 0 0 40px rgba(0,0,0,0.8);' +
                     'display:flex;align-items:center;justify-content:center;overflow:hidden;">';
                h += '<img src="' + imgPath + '" style="width:100%;height:100%;object-fit:contain;" ' +
                     'onerror="this.src=\'assets/interface/labyrinth_of_icons.png\'">';
                h += '</div>';

                h += '<div style="margin-top:20px;color:#ffd27a;font:bold 22px \'Times New Roman\',serif;' +
                     'text-shadow:0 0 12px #000,0 3px 6px #000;text-align:center;padding:0 20px;letter-spacing:1px;">' +
                     b.name + '</div>';

                if (!b.rewardClaimed) {
                    h += '<div style="margin-top:8px;color:#ffa500;font-size:0.85em;font-weight:bold;text-shadow:0 0 8px #000;">✦ Награда доступна ✦</div>';
                } else {
                    h += '<div style="margin-top:8px;color:#4caf50;font-size:0.85em;">✓ Награда получена</div>';
                }

                h += '</div>';
            }
            h += '</div>';

            if (beasts.length > 1) {
                h += '<div style="text-align:center;color:#6b5a3a;font-size:0.75em;margin-top:6px;">▲ свайп вверх / вниз ▼</div>';
            }
        }

        UI._screenLayer.innerHTML = '';
        var bgStyle = 'background-image:url(\'' + (UI._bg.bestiary || '') + '\');' +
                      'background-size:cover;background-position:center;background-repeat:no-repeat;';
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' + bgStyle +
                                'display:flex;flex-direction:column;overflow:hidden;';
        wrapper.innerHTML = '<div style="position:absolute;top:0;left:0;right:0;height:60px;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:10px;z-index:10;background:linear-gradient(180deg,rgba(0,0,0,0.9),transparent);">' +
                            '<button onclick="UI.loadHome()" style="position:absolute;left:10px;top:14px;background:transparent;border:none;cursor:pointer;color:#e0c080;font-size:20px;font-weight:bold;text-shadow:0 2px 4px #000;"> ← </button>' +
                            '<span style="color:#e0c080;font-size:18px;font-weight:bold;text-shadow:0 2px 4px #000;">📖 Бестиарий</span>' +
                            '</div>' +
                            '<div style="flex:1;overflow-y:auto;padding:70px 12px 20px;box-sizing:border-box;">' + h + '</div>';
        UI._screenLayer.appendChild(wrapper);
        UI._screenLayer.style.display = 'block';
        UI._screenLayer.style.width = '100%';
        UI._screenLayer.style.height = '100%';
        UI._screenLayer.style.overflow = 'hidden';

        // --- Свайп ---
        this._wasDragging = false;
        var carousel = document.getElementById('beast-carousel');
        if (carousel && beasts.length > 1) {
            var startY = 0;
            var currentY = 0;
            var dragging = false;
            var slides = carousel.querySelectorAll('.beast-slide');

            function updateSlides(deltaY) {
                for (var s = 0; s < slides.length; s++) {
                    var offset = (s - self._currentIndex) * 100;
                    var extraPx = deltaY;
                    slides[s].style.transition = 'none';
                    slides[s].style.transform = 'translateY(calc(' + offset + '% + ' + extraPx + 'px))';
                }
            }
            function snapToIndex() {
                for (var s = 0; s < slides.length; s++) {
                    var offset = (s - self._currentIndex) * 100;
                    slides[s].style.transition = 'transform 0.3s cubic-bezier(0.22,1,0.36,1)';
                    slides[s].style.transform = 'translateY(' + offset + '%)';
                }
            }

            carousel.addEventListener('touchstart', function(e) {
                startY = e.touches[0].clientY;
                currentY = startY;
                dragging = true;
                self._wasDragging = false;
            }, { passive: true });

            carousel.addEventListener('touchmove', function(e) {
                if (!dragging) return;
                currentY = e.touches[0].clientY;
                var delta = currentY - startY;
                if (Math.abs(delta) > 8) self._wasDragging = true;
                updateSlides(delta);
            }, { passive: true });

            carousel.addEventListener('touchend', function() {
                if (!dragging) return;
                dragging = false;
                var delta = currentY - startY;
                if (Math.abs(delta) > 50) {
                    if (delta < 0 && self._currentIndex < beasts.length - 1) {
                        self._currentIndex++;
                    } else if (delta > 0 && self._currentIndex > 0) {
                        self._currentIndex--;
                    }
                }
                snapToIndex();
                setTimeout(function() { self._wasDragging = false; }, 100);
            }, { passive: true });
        }
    },

    // ============================================================
    //  ДЕТАЛЬНАЯ КАРТОЧКА (без картинки, текст по центру)
    // ============================================================
    _showBeastInfo: function(beastId) {
        var b = this.getBeast(beastId);
        if (!b) return;

        UI._playSound('click');
        var rarityColor = this.getRarityColor(b.rarity);
        var rarityName = this.getRarityName(b.rarity);

        var h = '<div style="width:100%;max-width:520px;margin:0 auto;box-sizing:border-box;">';

        // Имя, редкость, тип, зона — по центру, без картинки
        h += '<div style="text-align:center;padding:8px 0;">';
        h += '<div style="color:#ffd27a;font:bold 24px \'Times New Roman\',serif;text-shadow:0 2px 4px #000;margin-bottom:8px;">' + b.name + '</div>';
        h += '<div style="color:' + rarityColor + ';font-size:0.95em;font-weight:bold;margin-bottom:8px;">' + rarityName + '</div>';
        h += '<div style="color:#aaa;font-size:0.85em;line-height:1.6;">' + b.type + '<br>' + b.zone + ' · ' + b.floor + '</div>';
        h += '<div style="color:#c8a050;font-size:0.9em;margin-top:10px;">Убито: ' + b.kills + '</div>';
        h += '</div>';

        // Лор
        h += '<div style="margin-top:18px;padding:14px;background:rgba(0,0,0,0.7);' +
             'border-left:3px solid #6b5a3a;border-radius:6px;' +
             'color:#c0b090;font-style:italic;font-size:0.9em;line-height:1.6;">' +
             b.lore + '</div>';

        // Награда
        h += '<div style="margin-top:18px;text-align:center;">';
        if (b.rewardClaimed) {
            h += '<div style="color:#4caf50;font-size:1em;padding:12px;">✓ Награда уже получена</div>';
        } else {
            h += '<button onclick="Sherwood.Bestiary._claimFromUI(\'' + beastId + '\')" ' +
                 'style="background:linear-gradient(180deg,#d9b050,#a88030);border:2px solid #ffd27a;' +
                 'border-radius:10px;padding:14px 40px;color:#1a1208;cursor:pointer;' +
                 'font:bold 16px \'Times New Roman\',serif;letter-spacing:1px;' +
                 'box-shadow:0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 #ffe8a0;">' +
                 'ЗАБРАТЬ НАГРАДУ</button>';
        }
        h += '</div>';
        h += '</div>';

        UI._screenLayer.innerHTML = '';
        var bgStyle = 'background-image:url(\'' + (UI._bg.bestiary || '') + '\');' +
                      'background-size:cover;background-position:center;background-repeat:no-repeat;';
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' + bgStyle +
                                'display:flex;flex-direction:column;overflow:hidden;';
        wrapper.innerHTML = '<div style="position:absolute;top:0;left:0;right:0;height:60px;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:10px;z-index:10;background:linear-gradient(180deg,rgba(0,0,0,0.9),transparent);">' +
                            '<button onclick="Sherwood.Bestiary.showUI()" style="position:absolute;left:10px;top:14px;background:transparent;border:none;cursor:pointer;color:#e0c080;font-size:20px;font-weight:bold;text-shadow:0 2px 4px #000;"> ← </button>' +
                            '<span style="color:#e0c080;font-size:18px;font-weight:bold;text-shadow:0 2px 4px #000;">' + b.name + '</span>' +
                            '</div>' +
                            '<div style="flex:1;overflow-y:auto;padding:70px 16px 20px;box-sizing:border-box;">' + h + '</div>';
        UI._screenLayer.appendChild(wrapper);
        UI._screenLayer.style.display = 'block';
        UI._screenLayer.style.overflow = 'hidden';
    },

    // ============================================================
    //  ПОЛУЧЕНИЕ НАГРАДЫ
    // ============================================================
    _claimFromUI: function(beastId) {
        var r = this.claimReward(beastId);
        if (!r.success) {
            UI._showToast(r.reason || 'Ошибка');
            return;
        }
        UI._playSound('loot_fly');
        UI.updateDisplay();
        this._showRewardPopup(r.rewards);
    },

    _showRewardPopup: function(rewards) {
        var h = '';
        h += '<div style="text-align:center;padding:20px;color:#ffd27a;">';
        h += '<div style="font-size:2.4em;margin-bottom:12px;">✨</div>';
        h += '<div style="font:bold 20px \'Times New Roman\',serif;letter-spacing:1px;margin-bottom:18px;">ВЫПАЛО</div>';
        h += '<div style="display:flex;flex-direction:column;gap:10px;align-items:center;font-size:1em;">';
        if (rewards.gold > 0) {
            h += '<div style="display:flex;align-items:center;gap:10px;color:#ffd700;font-weight:bold;">' +
                 '<span style="font-size:1.4em;">💰</span> ' + rewards.gold + ' золота</div>';
        }
        if (rewards.exp > 0) {
            h += '<div style="display:flex;align-items:center;gap:10px;color:#9fd6ff;font-weight:bold;">' +
                 '<span style="font-size:1.4em;">⭐</span> ' + rewards.exp + ' опыта</div>';
        }
        if (rewards.tablets > 0) {
            var tName = rewards.tabletType === 'ringTablets' ? 'скрижали колец' : 'скрижали амулетов';
            h += '<div style="display:flex;align-items:center;gap:10px;color:#c8a050;font-weight:bold;">' +
                 '<span style="font-size:1.4em;">📜</span> ' + rewards.tablets + ' ' + tName + '</div>';
        }
        h += '</div>';
        h += '<button onclick="Sherwood.Bestiary.showUI()" ' +
             'style="margin-top:24px;background:linear-gradient(180deg,#d9b050,#a88030);border:2px solid #ffd27a;' +
             'border-radius:10px;padding:12px 40px;color:#1a1208;cursor:pointer;' +
             'font:bold 15px \'Times New Roman\',serif;letter-spacing:1px;' +
             'box-shadow:0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 #ffe8a0;">ОТЛИЧНО</button>';
        h += '</div>';

        UI._screenLayer.innerHTML = '';
        var wrapper = document.createElement('div');
        wrapper.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;' +
                                'background:radial-gradient(circle, rgba(30,20,10,0.95), rgba(0,0,0,0.98));' +
                                'display:flex;align-items:center;justify-content:center;';
        wrapper.innerHTML = h;
        UI._screenLayer.appendChild(wrapper);
        UI._screenLayer.style.display = 'block';
        UI._screenLayer.style.overflow = 'hidden';
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Bestiary = Sherwood.Bestiary;

console.log('📖 Бестиарий загружен (Ведьмак-стиль)');

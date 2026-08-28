/**
 * Sherwood Tavern — Таверна «Весёлый Разбойник»
 * Егерь Гаррет выдаёт сюжетные квесты по главам
 */

Sherwood.Tavern = {
    // ---------- ДАННЫЕ КВЕСТОВ ПО ГЛАВАМ ----------
    CHAPTERS: [
        {
            id: 1,
            title: 'Кровь Великого Дуба',
            quest: 'Останови осквернение леса, найди источник проклятия',
            enemy: { name: 'Лесничий-Отступник', hp: 8000, atk: 800, def: 800, exp: 150, gold: 100 },
            reward: { exp: 200, gold: 50, silver: 500 },
            lore: 'Шервудский лес веками был щитом для королевства, а его сердце — Древний Шервудский Дуб. Дерево было не просто растением, а живым сосудом первородной магии. Но однажды в лес пришел Орден Королевских Охотников. Ослепленные жадностью, они решили высечь из исполина трон для тирана, не внемля крикам природы. Главный лесничий первым вонзил топор в живую кору. Дуб истек черной, кипящей смолой. Это было не просто убийство дерева — это было осквернение самого духа Шервуда. Земля содрогнулась, проклятие вырвалось наружу, и Зеленое Сердце леса остановилось навсегда.'
        },
        {
            id: 2,
            title: 'Кара Скверны',
            quest: 'Очисти лес от искажённых тварей, уничтожь Вожака стаи',
            enemy: { name: 'Вожак Искаженной Стаи', hp: 35000, atk: 2500, def: 2000, exp: 200, gold: 130 },
            reward: { exp: 400, gold: 100, silver: 1000 },
            lore: 'Смерть Дуба вызвала цепную реакцию. Скверна, подобно заразной болезни, проникла в корни и водоносные слои. Фауна леса мутировала в невиданных тварей: благородные олени обросли костяными шипами, волки обзавелись второй пастью, а птицы забыли, как летать, став наземными хищниками с железными перьями. Вожак искаженной стаи, некогда гордый олень, чьи рога превратились в костяную корону, возглавил полчища чудовищ.'
        },
        {
            id: 3,
            title: 'Старый Егерь',
            quest: 'Найди слепого ветерана Гаррета, упокой Альфа-Гончую',
            enemy: { name: 'Альфа-Гончая Егеря', hp: 90000, atk: 4500, def: 3500, exp: 250, gold: 160 },
            reward: { exp: 600, gold: 150, silver: 1500 },
            lore: 'На окраине гибнущего леса, в заброшенном домике егеря, влачит свои дни слепой ветеран по имени Гаррет. Бывший главный охотник короля, он отказался рубить Дуб и в наказание был растерзан своими же псами, которых уже коснулось безумие. Выживший, но покалеченный, Гаррет стал хранителем страшных тайн. Именно он встречает выживших и рассказывает им правду: Шервуд больше не лес, это чрево монстров.'
        },
        {
            id: 4,
            title: 'Спуск в Шервудскую Чащобу',
            quest: 'Спустись в подземелье, победи Падшего Друида',
            enemy: { name: 'Падший Друид', hp: 180000, atk: 7000, def: 5500, exp: 300, gold: 200 },
            reward: { exp: 800, gold: 200, silver: 2000 },
            lore: 'Чтобы остановить расползающееся зло, нужно ударить в его источник. Лучник, один из последних лесных следопытов, спускается в Подземку, известную как Шервудская чащоба. Это гигантская сеть затопленных пещер, подземных рек и переплетенных гигантских корней мертвого Дуба. Здесь, во мраке, скверна концентрируется сильнее всего.'
        },
        {
            id: 5,
            title: 'Искажённая Экосистема',
            quest: 'Пробейся через туннели чащобы, уничтожь Голод Чащи',
            enemy: { name: 'Голод Чащи', hp: 300000, atk: 9500, def: 7500, exp: 350, gold: 250 },
            reward: { exp: 1000, gold: 250, silver: 2500 },
            lore: 'Спуск в сырые туннели чащобы открывает первую волну кошмаров. Птицы-падальщики, жуки-мутанты и проклятые волки, чьи шкуры облезли, а сквозь мышцы пульсируют неоново-бирюзовые вены, охотятся стаями. Обычный поход за провизией здесь превращается в отчаянную битву за каждый вдох в токсичном воздухе.'
        },
        {
            id: 6,
            title: 'Слепая Ярость Духов',
            quest: 'Пробейся к Древнему Владыке, одолей Лешего',
            enemy: { name: 'Древний Владыка', hp: 450000, atk: 12000, def: 9500, exp: 400, gold: 300 },
            reward: { exp: 1500, gold: 350, silver: 3500 },
            lore: 'Спуск глубже приводит Лучника в каменные залы, где корни пробивают своды пещер. Здесь обитает Леший — вековой хранитель, ослепший от боли и ярости. Его тело срослось с потрескавшейся черной корой и острыми камнями, превратив духа в мстительного деревянного колосса.'
        },
        {
            id: 7,
            title: 'Эхо Прошлых Поражений',
            quest: 'Уничтожь Пожирателя Эха в глубинах подземки',
            enemy: { name: 'Пожиратель Эха', hp: 650000, atk: 14500, def: 11500, exp: 450, gold: 350 },
            reward: { exp: 2000, gold: 500, silver: 5000 },
            lore: 'Подземка поглощает не только плоть, но и души. Погибшие здесь отряды охотников и павшие разбойники не нашли покоя. Скверна сплела их остаточные души воедино, создав Пожирателя Эха — левитирующую массу из черного дыма, сотен безумных глаз и призрачных клинков. У него нет своего голоса: он кричит голосами всех, кто погиб во тьме Шервуда.'
        },
        {
            id: 8,
            title: 'Ужас Болотных Недр',
            quest: 'Спустись в болотные гроты, убей Повелительницу Топей',
            enemy: { name: 'Повелительница Топей', hp: 900000, atk: 17000, def: 13500, exp: 500, gold: 400 },
            reward: { exp: 2500, gold: 650, silver: 6500 },
            lore: 'В самых потайных, покрытых слизью гротах кроется Повелительница Топей — страшная метаморфоза Болотной Кикиморы и Водяного, вобравшая в себя всю злобу болотного яруса. Это гигантская полуженщина-полужаба, чье тело состоит из гниющей тины и кислотных нарывов.'
        },
        {
            id: 9,
            title: 'Разломы Безумия',
            quest: 'Закрой три магических разлома, победи Стража Разломов',
            enemy: { name: 'Страж Разломов', hp: 1200000, atk: 19500, def: 15500, exp: 550, gold: 450 },
            reward: { exp: 3000, gold: 800, silver: 8000 },
            lore: 'Скверна, переполнив чащобу, прожгла ткань реальности, открыв три гигантских магических разлома. Из этих врат хлынула чужеродная энергия, искажающая саму геометрию подземелий. Первый — Портал Нашествия. Второй — Портал Искажения. Третий — Портал Безумия.'
        },
        {
            id: 10,
            title: 'Портал Нашествия — Улей Плоти',
            quest: 'Войди в Портал Нашествия, уничтожь Матку Лесных Короедов',
            enemy: { name: 'Матка Лесных Короедов', hp: 1600000, atk: 22000, def: 17500, exp: 600, gold: 500 },
            reward: { exp: 4000, gold: 1000, silver: 10000 },
            lore: 'Первый разлом превратил пещеры в гнездо чумы. Из врат вышла Матка Лесных Короедов — колоссальная инсектоидная королева, чей панцирь усыпан моргающими глазами. Её охранял Хитиновый страж роя.'
        },
        {
            id: 11,
            title: 'Портал Искажения — Костяной Трон',
            quest: 'Войди в Портал Искажения, убей Проклятого Короля Разбойников',
            enemy: { name: 'Проклятый Король Разбойников', hp: 2100000, atk: 24500, def: 19500, exp: 700, gold: 600 },
            reward: { exp: 5000, gold: 1500, silver: 15000 },
            lore: 'Второй портал перенес Лучника в проклятый склеп, где реальность вывернулась наизнанку. В центре зала, объятого водопадом из кусков плоти, восседал Проклятый Король Разбойников. Когда-то он искал в пещерах богатства, но скверна поглотила его: вместо тела внутри ребер шевелился клубок из сотен склизких языков.'
        },
        {
            id: 12,
            title: 'Портал Безумия — Кровоточащий Кап',
            quest: 'Войди в Портал Безумия, победи Древнего Хранителя Склепа',
            enemy: { name: 'Древний Хранитель Склепа', hp: 2700000, atk: 27000, def: 21500, exp: 800, gold: 700 },
            reward: { exp: 6000, gold: 2000, silver: 20000 },
            lore: 'Третий портал вел в хтоническое капище, где деревья кровоточили, а из их коры росли человеческие глаза. Здесь путника ждал Древний Хранитель Склепа — титан из черного дуба и камня, чье сердце было пульсирующей мясной опухолью.'
        },
        {
            id: 13,
            title: 'Триумвират Зла',
            quest: 'Сразись с Эхом Трёх Порталов в Осквернённом Сердце',
            enemy: { name: 'Эхо Трех Порталов', hp: 3400000, atk: 29500, def: 23500, exp: 900, gold: 800 },
            reward: { exp: 7500, gold: 2500, silver: 25000 },
            lore: 'Закрыв три разлома, Лучник думал, что победил. Но энергии Порталов никуда не исчезли — они слились воедино в самом глубоком разломе, именуемом Оскверненным Сердцем Шервуда. Реальность окончательно треснула. Энергия нашествия, искажения и безумия сплелась в единую сущность — Эхо Трех Порталов.'
        },
        {
            id: 14,
            title: 'Сломанная Печать',
            quest: 'Уничтожь Палача Священного Древа — последнюю преграду',
            enemy: { name: 'Палач Священного Древа', hp: 4200000, atk: 32000, def: 25500, exp: 1000, gold: 900 },
            reward: { exp: 9000, gold: 3000, silver: 30000 },
            lore: 'Слияние энергий Порталов пробудило кое-что древнее. Тот самый капитан Королевских Охотников, что воткнул первый топор в Великий Дуб, был погребен под обломками. Выжившие корни мертвого дерева, впитав силу разломов, проросли сквозь его плоть, распяв его на гигантском каменном пне. Он стал Палачом Священного Древа.'
        },
        {
            id: 15,
            title: 'Последний Выстрел',
            quest: 'Порази ядро Шервудского Отродья, запечатай Сердце',
            enemy: { name: 'Шервудское Отродье', hp: 5200000, atk: 34500, def: 27500, exp: 1500, gold: 1200 },
            reward: { exp: 12000, gold: 5000, silver: 50000 },
            lore: 'Поглотив энергию мертвого Палача, Оскверненное Сердце пробудилось. Из недр разлома поднялся ультимативный бог хаоса — Шервудское Отродье. Это колоссальный, многорукий темный исполин, облаченный в растрескавшийся базальт. Дух Великого Дуба, искаженный до предела, призвал к себе остатки всех павших монстров, чтобы они стали его живым щитом.'
        },
        {
            id: 16,
            title: 'Шрам, который не заживёт (Секретная глава)',
            quest: 'Спустись в воронку и запечатай Изначальный Стержень',
            enemy: { name: 'Изначальный Стержень', hp: 1500000, atk: 30000, def: 25000, exp: 1000, gold: 300 },
            reward: { exp: 2000, gold: 500, silver: 1500 },
            isSecret: true,
            lore: 'После победы над Отродьем на поверхности леса зияет огромная воронка. Старый егерь Гаррет открывает путь к секретному спуску. На самом дне осталась лишь пульсирующая тьма. Изначальный Стержень — не физическое существо, а «глаз» истинного зла, Того, кто Спит в Камне. Это локальный аватар хтонического божества, выглядящий как парящая сфера из жидкого фиолетового обсидиана. Он меняет гравитацию, создает черные дыры и насылает видения. Его невозможно убить обычным оружием.'
        }
    ],

    // ---------- СОСТОЯНИЕ ----------
    _currentQuest: null,
    _completedChapters: [],
    _currentChapterIndex: 0,
    _isInBattle: false,
    _battleEnemy: null,

    // ---------- ИНИЦИАЛИЗАЦИЯ ----------
    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        
        if (!p.tavern) {
            p.tavern = {
                completedChapters: [],
                currentChapter: 0,
                isInBattle: false
            };
        }
        
        this._completedChapters = p.tavern.completedChapters || [];
        this._currentChapterIndex = p.tavern.currentChapter || 0;
        this._isInBattle = p.tavern.isInBattle || false;
        
        // Если есть текущий бой - восстанавливаем
        if (this._isInBattle && p.tavern.battleEnemy) {
            this._battleEnemy = p.tavern.battleEnemy;
            this._currentQuest = this.getCurrentChapter();
        }
        
        console.log('🍺 Таверна инициализирована');
        console.log('📖 Глав пройдено:', this._completedChapters.length);
        console.log('📚 Всего глав:', this.CHAPTERS.length);
    },

    // ---------- ПОЛУЧЕНИЕ ГЛАВ ----------
    getAllChapters: function() {
        return this.CHAPTERS;
    },

    getCurrentChapter: function() {
        if (this._currentChapterIndex < this.CHAPTERS.length) {
            return this.CHAPTERS[this._currentChapterIndex];
        }
        return null;
    },

    getNextChapter: function() {
        var nextIndex = this._currentChapterIndex + 1;
        if (nextIndex < this.CHAPTERS.length) {
            return this.CHAPTERS[nextIndex];
        }
        return null;
    },

    isChapterCompleted: function(chapterId) {
        return this._completedChapters.indexOf(chapterId) !== -1;
    },

    // ---------- НАЧАЛО КВЕСТА ----------
    startQuest: function() {
        // Проверяем, все ли главы пройдены
        if (this._completedChapters.length >= this.CHAPTERS.length) {
            return { success: false, reason: 'Все главы пройдены! Ты спас Шервуд!' };
        }
        
        // Проверяем, есть ли текущий квест
        if (this._currentQuest && this._isInBattle) {
            return { success: false, reason: 'У тебя уже есть активный квест!' };
        }
        
        var chapter = this.getCurrentChapter();
        if (!chapter) {
            return { success: false, reason: 'Нет доступных глав' };
        }
        
        // Проверяем, не пройдена ли уже эта глава
        if (this.isChapterCompleted(chapter.id)) {
            // Переходим к следующей
            this._currentChapterIndex++;
            return this.startQuest();
        }
        
        this._currentQuest = chapter;
        this._isInBattle = true;
        this._battleEnemy = {
            name: chapter.enemy.name,
            hp: chapter.enemy.hp,
            maxHp: chapter.enemy.hp,
            atk: chapter.enemy.atk,
            def: chapter.enemy.def,
            exp: chapter.enemy.exp,
            gold: chapter.enemy.gold
        };
        
        this._saveState();
        
        return {
            success: true,
            chapter: chapter,
            enemy: this._battleEnemy,
            isSecret: chapter.isSecret || false
        };
    },

    // ---------- БОЙ ----------
    attack: function() {
        if (!this._isInBattle || !this._battleEnemy) {
            return { error: 'Нет активного боя' };
        }
        
        var p = Sherwood.getPlayer();
        var enemy = this._battleEnemy;
        var chapter = this._currentQuest;
        
        // Урон игрока
        var dmg = this._calculateDamage(p.stats.attack, enemy.def);
        var crit = Math.random() * 100 < 15;
        if (crit) dmg = Math.floor(dmg * 1.8);
        
        enemy.hp -= dmg;
        if (enemy.hp < 0) enemy.hp = 0;
        
        var result = {
            damage: dmg,
            crit: crit,
            enemyHp: enemy.hp,
            enemyMaxHp: enemy.maxHp,
            enemyName: enemy.name,
            enemyDead: enemy.hp <= 0
        };
        
        // Проверка победы
        if (enemy.hp <= 0) {
            return this._completeChapter(result);
        }
        
        // Атака врага
        var edmg = this._calculateDamage(enemy.atk, p.stats.defense);
        p.stats.hp = Math.max(0, p.stats.hp - edmg);
        result.enemyDamage = edmg;
        result.playerHp = p.stats.hp;
        
        // Проверка смерти игрока
        if (p.stats.hp <= 0) {
            result.playerDead = true;
            result.lose = true;
            this._isInBattle = false;
            this._battleEnemy = null;
            this._currentQuest = null;
            this._saveState();
            p.stats.hp = 1;
            Sherwood.saveGame();
            return result;
        }
        
        this._saveState();
        Sherwood.saveGame();
        return result;
    },

    _completeChapter: function(result) {
        var chapter = this._currentQuest;
        var p = Sherwood.getPlayer();
        
        // Отмечаем главу как пройденную
        if (this._completedChapters.indexOf(chapter.id) === -1) {
            this._completedChapters.push(chapter.id);
        }
        
        // Награда
        var reward = chapter.reward;
        Sherwood.addExp(reward.exp);
        Sherwood.addResource('silver', reward.silver || 0);
        if (reward.gold) Sherwood.addResource('gold', reward.gold);
        
        // Сбрасываем бой
        this._isInBattle = false;
        this._battleEnemy = null;
        this._currentQuest = null;
        
        // Переходим к следующей главе
        this._currentChapterIndex++;
        
        // Проверка на секретную главу
        if (this._completedChapters.length >= 15 && !this._isSecretUnlocked) {
            this._isSecretUnlocked = true;
            result.secretUnlocked = true;
        }
        
        this._saveState();
        Sherwood.saveGame();
        
        result.win = true;
        result.reward = reward;
        result.chapterComplete = true;
        result.nextChapter = this.getCurrentChapter();
        result.allComplete = this._completedChapters.length >= this.CHAPTERS.length;
        
        return result;
    },

    _calculateDamage: function(attack, defense) {
        var base = attack - Math.floor(defense / 2);
        if (base < 1) base = 1;
        var variance = 0.8 + Math.random() * 0.4;
        return Math.floor(base * variance);
    },

    // ---------- ПОЛУЧЕНИЕ ИНФОРМАЦИИ ----------
    getCurrentQuest: function() {
        if (!this._currentQuest) return null;
        return {
            chapter: this._currentQuest,
            enemy: this._battleEnemy,
            isInBattle: this._isInBattle
        };
    },

    getCompletedCount: function() {
        return this._completedChapters.length;
    },

    getTotalChapters: function() {
        return this.CHAPTERS.length;
    },

    isOnCooldown: function() {
        return false; // Сюжетные квесты без перезарядки
    },

    getCooldownRemaining: function() {
        return 0;
    },

    getBattleMode: function() {
        return this._isInBattle;
    },

    // ---------- ОТКАЗ ОТ КВЕСТА ----------
    cancelQuest: function() {
        this._isInBattle = false;
        this._battleEnemy = null;
        this._currentQuest = null;
        this._saveState();
    },

    // ---------- СОХРАНЕНИЕ ----------
    _saveState: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.tavern) p.tavern = {};
        
        p.tavern.completedChapters = this._completedChapters;
        p.tavern.currentChapter = this._currentChapterIndex;
        p.tavern.isInBattle = this._isInBattle;
        p.tavern.battleEnemy = this._battleEnemy;
        p.tavern.secretUnlocked = this._isSecretUnlocked || false;
        
        Sherwood.saveGame();
    },

    // ---------- UI — ПОКАЗ ТАВЕРНЫ ----------
    showUI: function() {
        if (typeof window.showTavernScreen === 'function') {
            window.showTavernScreen();
            return;
        }
        this._renderTavernUI();
    },

    _renderTavernUI: function() {
        var old = document.getElementById('tavern-screen');
        if (old) old.remove();
        
        var current = this.getCurrentChapter();
        var completed = this.getCompletedCount();
        var total = this.getTotalChapters();
        var isInBattle = this._isInBattle;
        var enemy = this._battleEnemy;
        
        var screenHTML = `
        <div id="tavern-screen" style="position:fixed;top:0;left:0;width:100%;height:100%;z-index:300;background:url('assets/assets2/backgrounds/section_tavern.png') center/cover no-repeat;display:flex;flex-direction:column;">
            <div style="display:flex;align-items:center;gap:12px;padding:12px;background:rgba(0,0,0,0.7);backdrop-filter:blur(5px);">
                <button onclick="Sherwood.Tavern.closeUI()" style="background:transparent;border:none;cursor:pointer;width:60px;height:60px;">
                    <img src="assets/assets2/icons/back.png" style="width:100%;height:100%;object-fit:contain;">
                </button>
                <span style="color:#e0c080;font-size:1.2em;">🍺 Таверна «Весёлый Разбойник»</span>
                <span style="color:#888;font-size:12px;margin-left:auto;">
                    📖 ${completed}/${total} глав
                </span>
            </div>
            
            <div style="flex:1;overflow-y:auto;padding:20px;color:#fff;font-family:monospace;">
                <div style="max-width:600px;margin:0 auto;">
                    ${this._renderContent()}
                </div>
            </div>
        </div>`;
        
        document.body.insertAdjacentHTML('beforeend', screenHTML);
    },

    _renderContent: function() {
        var current = this.getCurrentChapter();
        var completed = this.getCompletedCount();
        var total = this.getTotalChapters();
        var isInBattle = this._isInBattle;
        var enemy = this._battleEnemy;
        
        // Если все главы пройдены
        if (completed >= total) {
            return `
            <div style="text-align:center;padding:40px 20px;">
                <div style="font-size:64px;margin-bottom:20px;">🏆</div>
                <div style="font-size:24px;color:#ffd700;font-weight:bold;">Шервуд спасён!</div>
                <div style="color:#888;margin-top:10px;">Ты прошёл все главы и запечатал зло.</div>
                <div style="color:#aaa;margin-top:20px;font-size:14px;font-style:italic;">«Шрам остался, но лес начинает оживать...»</div>
            </div>`;
        }
        
        if (!current) {
            return `
            <div style="text-align:center;padding:40px 20px;">
                <div style="font-size:48px;margin-bottom:20px;">📖</div>
                <div style="color:#888;">Нет доступных глав</div>
                <button onclick="Sherwood.Tavern.startQuest()" class="btn btn-gold" style="margin-top:15px;padding:12px 40px;">
                    Начать следующую главу
                </button>
            </div>`;
        }
        
        var isCompleted = this.isChapterCompleted(current.id);
        var isSecret = current.isSecret || false;
        
        var html = '';
        
        // Лор главы
        html += `
        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;border-left:4px solid ${isSecret ? '#9b59b6' : '#ffa500'};margin-bottom:15px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="color:#ffa500;font-weight:bold;font-size:18px;">
                    ${isSecret ? '🔮 ' : ''}Глава ${current.id}: ${current.title}
                </span>
                ${isSecret ? '<span style="color:#9b59b6;font-size:12px;">🔮 Секретная глава</span>' : ''}
            </div>
            <div style="color:#aaa;font-size:13px;margin-top:8px;line-height:1.6;max-height:120px;overflow-y:auto;">
                ${current.lore}
            </div>
            <div style="color:#888;font-size:12px;margin-top:8px;">
                🎯 Квест: ${current.quest}
            </div>
            <div style="color:#ffd700;font-size:12px;margin-top:4px;">
                🏆 Награда: +${current.reward.exp} опыта, +${current.reward.gold} золота, +${current.reward.silver} серебра
            </div>
        </div>`;
        
        // Босс
        if (isInBattle && enemy) {
            html += `
            <div style="background:rgba(255,0,0,0.1);border:2px solid #ff6b6b;border-radius:8px;padding:15px;margin-bottom:15px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="color:#ff6b6b;font-weight:bold;">⚔️ БИТВА!</div>
                        <div style="font-size:18px;color:#fff;">${enemy.name}</div>
                        <div style="color:#aaa;font-size:13px;">❤️ ${enemy.hp}/${enemy.maxHp}</div>
                        <div style="width:200px;height:8px;background:#333;border-radius:4px;overflow:hidden;margin-top:4px;">
                            <div style="width:${(enemy.hp/enemy.maxHp)*100}%;height:100%;background:linear-gradient(90deg,#ff0000,#ff4444);"></div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <button onclick="Sherwood.Tavern.attackAndUpdate()" class="btn btn-danger" style="padding:12px 30px;font-size:16px;">⚔️ АТАКА</button>
                        <button onclick="Sherwood.Tavern.cancelQuest()" class="btn" style="padding:4px 15px;font-size:11px;margin-top:4px;">✖ Отступить</button>
                    </div>
                </div>
            </div>`;
        } else if (!isCompleted) {
            html += `
            <button onclick="Sherwood.Tavern.startQuest()" class="btn btn-gold" style="width:100%;padding:15px;font-size:18px;font-weight:bold;">
                ⚔️ Начать главу
            </button>`;
        } else {
            html += `
            <div style="text-align:center;padding:10px;background:rgba(82,183,136,0.1);border:1px solid #52b788;border-radius:6px;">
                <span style="color:#52b788;">✅ Глава пройдена!</span>
                <button onclick="Sherwood.Tavern.skipToNext()" class="btn" style="margin-left:10px;padding:4px 15px;font-size:12px;">➡️ Следующая</button>
            </div>`;
        }
        
        // Прогресс
        html += `
        <div style="margin-top:15px;padding:10px;background:rgba(255,255,255,0.03);border-radius:6px;">
            <div style="color:#888;font-size:12px;">Прогресс: ${completed}/${total} глав</div>
            <div style="width:100%;height:4px;background:#222;border-radius:2px;overflow:hidden;margin-top:4px;">
                <div style="width:${(completed/total)*100}%;height:100%;background:linear-gradient(90deg,#ffa500,#ffd700);"></div>
            </div>
        </div>`;
        
        return html;
    },

    attackAndUpdate: function() {
        var result = this.attack();
        if (result.error) {
            alert(result.error);
            return;
        }
        
        // Обновляем UI
        this._renderTavernUI();
        
        // Показываем результат
        if (result.win) {
            if (result.allComplete) {
                alert('🏆 ПОБЕДА! Ты спас Шервуд!');
            } else if (result.secretUnlocked) {
                alert('🔮 Открыта секретная глава!');
            } else {
                alert('⚔️ Победа! Глава пройдена!');
            }
        } else if (result.lose) {
            alert('💀 Ты погиб... Но егерь вытащил тебя. Отдохни и попробуй снова.');
        }
        
        // Обновляем сохранения
        saveGameData();
    },

    skipToNext: function() {
        this._currentChapterIndex++;
        this._saveState();
        this._renderTavernUI();
    },

    closeUI: function() {
        var screen = document.getElementById('tavern-screen');
        if (screen) screen.remove();
        if (typeof Menu !== 'undefined' && Menu.show) {
            Menu.show();
        }
    }
};

// ---------- ЭКСПОРТ ----------
window.Sherwood = window.Sherwood || {};
window.Sherwood.Tavern = Sherwood.Tavern;

console.log('🍺 Таверна с сюжетными квестами загружена!');
console.log('📖 Всего глав:', Sherwood.Tavern.CHAPTERS.length);

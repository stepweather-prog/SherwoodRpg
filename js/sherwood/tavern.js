/**
 * Sherwood Tavern — Таверна «Весёлый Разбойник»
 * Егерь Гаррет выдаёт сюжетные квесты по главам
 */

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Tavern = {
    // ---------- ДАННЫЕ КВЕСТОВ ПО ГЛАВАМ ----------
    CHAPTERS: [
        {
            id: 1,
            title: 'Кровь Великого Дуба',
            quest: 'Останови осквернение леса, найди источник проклятия',
            enemy: { name: 'Лесничий-Отступник', hp: 8000, atk: 800, def: 800, exp: 150, gold: 100 },
            reward: { exp: 200, gold: 50, silver: 500 },
            lore: 'Шервудский лес веками был щитом для королевства, а его сердце — Древний Шервудский Дуб...'
        },
        {
            id: 2,
            title: 'Кара Скверны',
            quest: 'Очисти лес от искажённых тварей, уничтожь Вожака стаи',
            enemy: { name: 'Вожак Искаженной Стаи', hp: 35000, atk: 2500, def: 2000, exp: 200, gold: 130 },
            reward: { exp: 400, gold: 100, silver: 1000 },
            lore: 'Смерть Дуба вызвала цепную реакцию...'
        },
        {
            id: 3,
            title: 'Старый Егерь',
            quest: 'Найди слепого ветерана Гаррета, упокой Альфа-Гончую',
            enemy: { name: 'Альфа-Гончая Егеря', hp: 90000, atk: 4500, def: 3500, exp: 250, gold: 160 },
            reward: { exp: 600, gold: 150, silver: 1500 },
            lore: 'На окраине гибнущего леса, в заброшенном домике егеря...'
        },
        {
            id: 4,
            title: 'Спуск в Шервудскую Чащобу',
            quest: 'Спустись в подземелье, победи Падшего Друида',
            enemy: { name: 'Падший Друид', hp: 180000, atk: 7000, def: 5500, exp: 300, gold: 200 },
            reward: { exp: 800, gold: 200, silver: 2000 },
            lore: 'Чтобы остановить расползающееся зло, нужно ударить в его источник...'
        },
        {
            id: 5,
            title: 'Искажённая Экосистема',
            quest: 'Пробейся через туннели чащобы, уничтожь Голод Чащи',
            enemy: { name: 'Голод Чащи', hp: 300000, atk: 9500, def: 7500, exp: 350, gold: 250 },
            reward: { exp: 1000, gold: 250, silver: 2500 },
            lore: 'Спуск в сырые туннели чащобы открывает первую волну кошмаров...'
        },
        {
            id: 6,
            title: 'Слепая Ярость Духов',
            quest: 'Пробейся к Древнему Владыке, одолей Лешего',
            enemy: { name: 'Древний Владыка', hp: 450000, atk: 12000, def: 9500, exp: 400, gold: 300 },
            reward: { exp: 1500, gold: 350, silver: 3500 },
            lore: 'Спуск глубже приводит Лучника в каменные залы...'
        },
        {
            id: 7,
            title: 'Эхо Прошлых Поражений',
            quest: 'Уничтожь Пожирателя Эха в глубинах подземки',
            enemy: { name: 'Пожиратель Эха', hp: 650000, atk: 14500, def: 11500, exp: 450, gold: 350 },
            reward: { exp: 2000, gold: 500, silver: 5000 },
            lore: 'Подземка поглощает не только плоть, но и души...'
        },
        {
            id: 8,
            title: 'Ужас Болотных Недр',
            quest: 'Спустись в болотные гроты, убей Повелительницу Топей',
            enemy: { name: 'Повелительница Топей', hp: 900000, atk: 17000, def: 13500, exp: 500, gold: 400 },
            reward: { exp: 2500, gold: 650, silver: 6500 },
            lore: 'В самых потайных, покрытых слизью гротах...'
        },
        {
            id: 9,
            title: 'Разломы Безумия',
            quest: 'Закрой три магических разлома, победи Стража Разломов',
            enemy: { name: 'Страж Разломов', hp: 1200000, atk: 19500, def: 15500, exp: 550, gold: 450 },
            reward: { exp: 3000, gold: 800, silver: 8000 },
            lore: 'Скверна, переполнив чащобу, прожгла ткань реальности...'
        },
        {
            id: 10,
            title: 'Портал Нашествия — Улей Плоти',
            quest: 'Войди в Портал Нашествия, уничтожь Матку Лесных Короедов',
            enemy: { name: 'Матка Лесных Короедов', hp: 1600000, atk: 22000, def: 17500, exp: 600, gold: 500 },
            reward: { exp: 4000, gold: 1000, silver: 10000 },
            lore: 'Первый разлом превратил пещеры в гнездо чумы...'
        },
        {
            id: 11,
            title: 'Портал Искажения — Костяной Трон',
            quest: 'Войди в Портал Искажения, убей Проклятого Короля Разбойников',
            enemy: { name: 'Проклятый Король Разбойников', hp: 2100000, atk: 24500, def: 19500, exp: 700, gold: 600 },
            reward: { exp: 5000, gold: 1500, silver: 15000 },
            lore: 'Второй портал перенес Лучника в проклятый склеп...'
        },
        {
            id: 12,
            title: 'Портал Безумия — Кровоточащий Кап',
            quest: 'Войди в Портал Безумия, победи Древнего Хранителя Склепа',
            enemy: { name: 'Древний Хранитель Склепа', hp: 2700000, atk: 27000, def: 21500, exp: 800, gold: 700 },
            reward: { exp: 6000, gold: 2000, silver: 20000 },
            lore: 'Третий портал вел в хтоническое капище...'
        },
        {
            id: 13,
            title: 'Триумвират Зла',
            quest: 'Сразись с Эхом Трёх Порталов в Осквернённом Сердце',
            enemy: { name: 'Эхо Трех Порталов', hp: 3400000, atk: 29500, def: 23500, exp: 900, gold: 800 },
            reward: { exp: 7500, gold: 2500, silver: 25000 },
            lore: 'Закрыв три разлома, Лучник думал, что победил...'
        },
        {
            id: 14,
            title: 'Сломанная Печать',
            quest: 'Уничтожь Палача Священного Древа — последнюю преграду',
            enemy: { name: 'Палач Священного Древа', hp: 4200000, atk: 32000, def: 25500, exp: 1000, gold: 900 },
            reward: { exp: 9000, gold: 3000, silver: 30000 },
            lore: 'Слияние энергий Порталов пробудило кое-что древнее...'
        },
        {
            id: 15,
            title: 'Последний Выстрел',
            quest: 'Порази ядро Шервудского Отродья, запечатай Сердце',
            enemy: { name: 'Шервудское Отродье', hp: 5200000, atk: 34500, def: 27500, exp: 1500, gold: 1200 },
            reward: { exp: 12000, gold: 5000, silver: 50000 },
            lore: 'Поглотив энергию мертвого Палача, Оскверненное Сердце пробудилось...'
        },
        {
            id: 16,
            title: 'Шрам, который не заживёт (Секретная глава)',
            quest: 'Спустись в воронку и запечатай Изначальный Стержень',
            enemy: { name: 'Изначальный Стержень', hp: 1500000, atk: 30000, def: 25000, exp: 1000, gold: 300 },
            reward: { exp: 2000, gold: 500, silver: 1500 },
            isSecret: true,
            lore: 'После победы над Отродьем на поверхности леса зияет огромная воронка...'
        }
    ],

    _currentQuest: null,
    _completedChapters: [],
    _currentChapterIndex: 0,
    _isInBattle: false,
    _battleEnemy: null,
    _isSecretUnlocked: false,
    _tab: 1,

    // ---------- ИНИЦИАЛИЗАЦИЯ ----------
    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.tavern) {
            p.tavern = { completedChapters: [], currentChapter: 0, isInBattle: false, secretUnlocked: false };
        }
        this._completedChapters = p.tavern.completedChapters || [];
        this._currentChapterIndex = p.tavern.currentChapter || 0;
        this._isInBattle = p.tavern.isInBattle || false;
        this._isSecretUnlocked = p.tavern.secretUnlocked || false;
        if (this._isInBattle && p.tavern.battleEnemy) {
            this._battleEnemy = p.tavern.battleEnemy;
            this._currentQuest = this.getCurrentChapter();
        }
        console.log('🍺 Таверна инициализирована');
    },

    // ---------- МЕТОДЫ ----------
    getAllChapters: function() { return this.CHAPTERS; },
    getCurrentChapter: function() {
        if (this._currentChapterIndex < this.CHAPTERS.length) {
            return this.CHAPTERS[this._currentChapterIndex];
        }
        return null;
    },
    getCompletedCount: function() { return this._completedChapters.length; },
    getTotalChapters: function() { return this.CHAPTERS.length; },
    isChapterCompleted: function(id) { return this._completedChapters.indexOf(id) !== -1; },

    startQuest: function() {
        if (this._completedChapters.length >= this.CHAPTERS.length) {
            return { success: false, reason: 'Все главы пройдены!' };
        }
        if (this._currentQuest && this._isInBattle) {
            return { success: false, reason: 'Уже есть активный квест!' };
        }
        var chapter = this.getCurrentChapter();
        if (!chapter) return { success: false, reason: 'Нет доступных глав' };
        if (this.isChapterCompleted(chapter.id)) {
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
        return { success: true, chapter: chapter, enemy: this._battleEnemy };
    },

    attack: function() {
        if (!this._isInBattle || !this._battleEnemy) return { error: 'Нет активного боя' };
        var p = Sherwood.getPlayer();
        var enemy = this._battleEnemy;
        var dmg = Math.max(1, p.stats.attack - enemy.def + Math.floor(Math.random() * 20));
        var crit = Math.random() * 100 < 15;
        if (crit) dmg = Math.floor(dmg * 1.8);
        enemy.hp -= dmg;
        if (enemy.hp < 0) enemy.hp = 0;
        var result = { damage: dmg, crit: crit, enemyHp: enemy.hp, enemyMaxHp: enemy.maxHp, enemyDead: enemy.hp <= 0 };
        if (enemy.hp <= 0) return this._completeChapter(result);
        var edmg = Math.max(1, enemy.atk - p.stats.defense + Math.floor(Math.random() * 15));
        p.stats.hp = Math.max(0, p.stats.hp - edmg);
        result.enemyDamage = edmg;
        result.playerHp = p.stats.hp;
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
        if (this._completedChapters.indexOf(chapter.id) === -1) {
            this._completedChapters.push(chapter.id);
        }
        var reward = chapter.reward;
        Sherwood.addExp(reward.exp);
        Sherwood.addResource('silver', reward.silver || 0);
        if (reward.gold) Sherwood.addResource('gold', reward.gold);
        this._isInBattle = false;
        this._battleEnemy = null;
        this._currentQuest = null;
        this._currentChapterIndex++;
        if (this._completedChapters.length >= 15 && !this._isSecretUnlocked) {
            this._isSecretUnlocked = true;
            result.secretUnlocked = true;
        }
        this._saveState();
        Sherwood.saveGame();
        result.win = true;
        result.reward = reward;
        result.chapterComplete = true;
        result.allComplete = this._completedChapters.length >= this.CHAPTERS.length;
        return result;
    },

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

    // ---------- UI ----------
    showUI: function() {
        if (typeof UI === 'undefined') {
            if (typeof showGenericScreen === 'function') {
                showGenericScreen('Таверна', '🍺');
            }
            return;
        }
        UI._playSound('click');
        var current = this.getCurrentChapter();
        var completed = this.getCompletedCount();
        var total = this.getTotalChapters();
        var isInBattle = this._isInBattle;
        var enemy = this._battleEnemy;

        var h = '<div style="padding:10px;text-align:center;">';
        if (current) {
            var isCompleted = this.isChapterCompleted(current.id);
            var isSecret = current.isSecret || false;
            h += '<div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;border-left:4px solid ' + (isSecret ? '#9b59b6' : '#ffa500') + ';margin-bottom:15px;text-align:left;">';
            h += '<div style="color:#ffa500;font-weight:bold;font-size:18px;">' + (isSecret ? '🔮 ' : '') + 'Глава ' + current.id + ': ' + current.title + '</div>';
            h += '<div style="color:#aaa;font-size:13px;margin-top:8px;line-height:1.6;">' + current.lore + '</div>';
            h += '<div style="color:#888;font-size:12px;margin-top:8px;">🎯 ' + current.quest + '</div>';
            h += '<div style="color:#ffd700;font-size:12px;">🏆 Награда: +' + current.reward.exp + ' опыта, +' + current.reward.gold + ' золота</div>';
            h += '</div>';
            if (isInBattle && enemy) {
                h += '<div style="background:rgba(255,0,0,0.1);border:2px solid #ff6b6b;border-radius:8px;padding:15px;margin-bottom:15px;">';
                h += '<div style="color:#ff6b6b;font-weight:bold;">⚔️ БИТВА!</div>';
                h += '<div style="font-size:18px;color:#fff;">' + enemy.name + '</div>';
                h += '<div style="color:#aaa;font-size:13px;">❤️ ' + enemy.hp + '/' + enemy.maxHp + '</div>';
                h += '<div style="width:200px;height:8px;background:#333;border-radius:4px;overflow:hidden;margin:4px auto;"><div style="width:' + (enemy.hp/enemy.maxHp*100) + '%;height:100%;background:linear-gradient(90deg,#ff0000,#ff4444);"></div></div>';
                h += '<button onclick="Sherwood.Tavern.attackFromUI()" class="btn btn-danger" style="padding:10px 30px;font-size:16px;">⚔️ АТАКА</button>';
                h += '<button onclick="Sherwood.Tavern.cancelFromUI()" class="btn" style="padding:4px 15px;font-size:11px;margin-left:8px;">✖ Отступить</button>';
                h += '</div>';
            } else if (!isCompleted) {
                h += '<button onclick="Sherwood.Tavern.startFromUI()" class="btn btn-gold" style="padding:15px 40px;font-size:18px;font-weight:bold;">⚔️ Начать главу</button>';
            } else {
                h += '<div style="color:#52b788;">✅ Глава пройдена!</div>';
                h += '<button onclick="Sherwood.Tavern.nextFromUI()" class="btn" style="margin-top:8px;padding:4px 20px;font-size:12px;">➡️ Следующая</button>';
            }
        } else if (completed >= total) {
            h += '<div style="font-size:64px;margin-bottom:20px;">🏆</div>';
            h += '<div style="font-size:24px;color:#ffd700;font-weight:bold;">Шервуд спасён!</div>';
            h += '<div style="color:#888;margin-top:10px;">Ты прошёл все главы.</div>';
        }
        h += '<div style="margin-top:15px;padding:10px;background:rgba(255,255,255,0.03);border-radius:6px;font-size:12px;color:#888;">Прогресс: ' + completed + '/' + total + '</div>';
        h += '</div>';
        UI._openScreenScrollable('🍺 Таверна', 'tavern', h);
    },

    startFromUI: function() {
        var r = this.startQuest();
        if (!r.success) { UI._showToast(r.reason || 'Ошибка'); this.showUI(); return; }
        this.showUI();
    },

    attackFromUI: function() {
        var r = this.attack();
        if (r.error) { UI._showToast(r.error); return; }
        if (r.win) {
            UI._showToast(r.allComplete ? '🏆 Шервуд спасён!' : '⚔️ Победа! Глава пройдена!');
            this.showUI();
        } else if (r.lose) {
            UI._showToast('💀 Ты погиб...');
            this.showUI();
        } else {
            this.showUI();
        }
    },

    cancelFromUI: function() {
        this._isInBattle = false;
        this._battleEnemy = null;
        this._currentQuest = null;
        this._saveState();
        this.showUI();
    },

    nextFromUI: function() {
        this._currentChapterIndex++;
        this._saveState();
        this.showUI();
    },

    closeUI: function() {
        if (typeof UI !== 'undefined' && UI._screenLayer) {
            UI._screenLayer.style.display = 'none';
        }
        if (typeof showHomeScreen === 'function') {
            showHomeScreen();
        }
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Tavern = Sherwood.Tavern;

console.log('🍺 Таверна загружена!');

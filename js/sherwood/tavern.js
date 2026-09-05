// ============================================================
//  js/sherwood/tavern.js — Таверна Гаррета
// ============================================================

if (typeof Sherwood === 'undefined') {
    window.Sherwood = {};
}

Sherwood.Tavern = {
    CHAPTERS: [
        { id: 1, title: 'Кровь Великого Дуба', quest: 'Останови осквернение леса, найди источник проклятия', enemy: { name: 'Лесничий-Отступник', hp: 8000, atk: 800, def: 800, exp: 150, gold: 100 }, reward: { exp: 200, gold: 50, silver: 500 }, lore: 'Шервудский лес веками был щитом для королевства, а его сердце — Древний Шервудский Дуб...' },
        { id: 2, title: 'Кара Скверны', quest: 'Очисти лес от искажённых тварей, уничтожь Вожака стаи', enemy: { name: 'Вожак Искаженной Стаи', hp: 35000, atk: 2500, def: 2000, exp: 200, gold: 130 }, reward: { exp: 400, gold: 100, silver: 1000 }, lore: 'Смерть Дуба вызвала цепную реакцию...' },
        { id: 3, title: 'Старый Егерь', quest: 'Найди слепого ветерана Гаррета, упокой Альфа-Гончую', enemy: { name: 'Альфа-Гончая Егеря', hp: 90000, atk: 4500, def: 3500, exp: 250, gold: 160 }, reward: { exp: 600, gold: 150, silver: 1500 }, lore: 'На окраине гибнущего леса, в заброшенном домике егеря...' },
        { id: 4, title: 'Спуск в Шервудскую Чащобу', quest: 'Спустись в подземелье, победи Падшего Друида', enemy: { name: 'Падший Друид', hp: 180000, atk: 7000, def: 5500, exp: 300, gold: 200 }, reward: { exp: 800, gold: 200, silver: 2000 }, lore: 'Чтобы остановить расползающееся зло, нужно ударить в его источник...' },
        { id: 5, title: 'Искажённая Экосистема', quest: 'Пробейся через туннели чащобы, уничтожь Голод Чащи', enemy: { name: 'Голод Чащи', hp: 300000, atk: 9500, def: 7500, exp: 350, gold: 250 }, reward: { exp: 1000, gold: 250, silver: 2500 }, lore: 'Спуск в сырые туннели чащобы открывает первую волну кошмаров...' },
        { id: 6, title: 'Слепая Ярость Духов', quest: 'Пробейся к Древнему Владыке, одолей Лешего', enemy: { name: 'Древний Владыка', hp: 450000, atk: 12000, def: 9500, exp: 400, gold: 300 }, reward: { exp: 1500, gold: 350, silver: 3500 }, lore: 'Спуск глубже приводит Лучника в каменные залы...' },
        { id: 7, title: 'Эхо Прошлых Поражений', quest: 'Уничтожь Пожирателя Эха в глубинах подземки', enemy: { name: 'Пожиратель Эха', hp: 650000, atk: 14500, def: 11500, exp: 450, gold: 350 }, reward: { exp: 2000, gold: 500, silver: 5000 }, lore: 'Подземка поглощает не только плоть, но и души...' },
        { id: 8, title: 'Ужас Болотных Недр', quest: 'Спустись в болотные гроты, убей Повелительницу Топей', enemy: { name: 'Повелительница Топей', hp: 900000, atk: 17000, def: 13500, exp: 500, gold: 400 }, reward: { exp: 2500, gold: 650, silver: 6500 }, lore: 'В самых потайных, покрытых слизью гротах...' },
        { id: 9, title: 'Разломы Безумия', quest: 'Закрой три магических разлома, победи Стража Разломов', enemy: { name: 'Страж Разломов', hp: 1200000, atk: 19500, def: 15500, exp: 550, gold: 450 }, reward: { exp: 3000, gold: 800, silver: 8000 }, lore: 'Скверна, переполнив чащобу, прожгла ткань реальности...' },
        { id: 10, title: 'Портал Нашествия — Улей Плоти', quest: 'Войди в Портал Нашествия, уничтожь Матку Лесных Короедов', enemy: { name: 'Матка Лесных Короедов', hp: 1600000, atk: 22000, def: 17500, exp: 600, gold: 500 }, reward: { exp: 4000, gold: 1000, silver: 10000 }, lore: 'Первый разлом превратил пещеры в гнездо чумы...' },
        { id: 11, title: 'Портал Искажения — Костяной Трон', quest: 'Войди в Портал Искажения, убей Проклятого Короля Разбойников', enemy: { name: 'Проклятый Король Разбойников', hp: 2100000, atk: 24500, def: 19500, exp: 700, gold: 600 }, reward: { exp: 5000, gold: 1500, silver: 15000 }, lore: 'Второй портал перенес Лучника в проклятый склеп...' },
        { id: 12, title: 'Портал Безумия — Кровоточащий Кап', quest: 'Войди в Портал Безумия, победи Древнего Хранителя Склепа', enemy: { name: 'Древний Хранитель Склепа', hp: 2700000, atk: 27000, def: 21500, exp: 800, gold: 700 }, reward: { exp: 6000, gold: 2000, silver: 20000 }, lore: 'Третий портал вел в хтоническое капище...' },
        { id: 13, title: 'Триумвират Зла', quest: 'Сразись с Эхом Трёх Порталов в Осквернённом Сердце', enemy: { name: 'Эхо Трех Порталов', hp: 3400000, atk: 29500, def: 23500, exp: 900, gold: 800 }, reward: { exp: 7500, gold: 2500, silver: 25000 }, lore: 'Закрыв три разлома, Лучник думал, что победил...' },
        { id: 14, title: 'Сломанная Печать', quest: 'Уничтожь Палача Священного Древа — последнюю преграду', enemy: { name: 'Палач Священного Древа', hp: 4200000, atk: 32000, def: 25500, exp: 1000, gold: 900 }, reward: { exp: 9000, gold: 3000, silver: 30000 }, lore: 'Слияние энергий Порталов пробудило кое-что древнее...' },
        { id: 15, title: 'Последний Выстрел', quest: 'Порази ядро Шервудского Отродья, запечатай Сердце', enemy: { name: 'Шервудское Отродье', hp: 5200000, atk: 34500, def: 27500, exp: 1500, gold: 1200 }, reward: { exp: 12000, gold: 5000, silver: 50000 }, lore: 'Поглотив энергию мертвого Палача, Оскверненное Сердце пробудилось...' },
        { id: 16, title: 'Шрам, который не заживёт (Секретная глава)', quest: 'Спустись в воронку и запечатай Изначальный Стержень', enemy: { name: 'Изначальный Стержень', hp: 1500000, atk: 30000, def: 25000, exp: 1000, gold: 300 }, reward: { exp: 2000, gold: 500, silver: 1500 }, isSecret: true, lore: 'После победы над Отродьем на поверхности леса зияет огромная воронка...' }
    ],

    _currentQuest: null,
    _completedChapters: [],
    _currentChapterIndex: 0,
    _isSecretUnlocked: false,

    init: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.tavern) {
            p.tavern = { completedChapters: [], currentChapter: 0, secretUnlocked: false };
        }
        this._completedChapters = p.tavern.completedChapters || [];
        this._currentChapterIndex = p.tavern.currentChapter || 0;
        this._isSecretUnlocked = p.tavern.secretUnlocked || false;
        console.log('Таверна инициализирована');
    },

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

    acceptQuest: function() {
        var chapter = this.getCurrentChapter();
        if (!chapter) return { success: false, reason: 'Нет доступных глав' };
        if (this.isChapterCompleted(chapter.id)) return { success: false, reason: 'Глава уже пройдена' };
        if (this._currentQuest) return { success: false, reason: 'Уже есть активный квест' };
        this._currentQuest = chapter;
        this._saveState();
        return { success: true, chapter: chapter };
    },

    completeQuest: function() {
        if (!this._currentQuest) return { success: false, reason: 'Нет активного квеста' };
        var chapter = this._currentQuest;
        if (this._completedChapters.indexOf(chapter.id) === -1) {
            this._completedChapters.push(chapter.id);
        }
        this._currentQuest = null;
        this._currentChapterIndex++;
        if (this._completedChapters.length >= 15 && !this._isSecretUnlocked) {
            this._isSecretUnlocked = true;
        }
        this._saveState();
        return { success: true, chapter: chapter };
    },

    _saveState: function() {
        var p = Sherwood.getPlayer();
        if (!p) return;
        if (!p.tavern) p.tavern = {};
        p.tavern.completedChapters = this._completedChapters;
        p.tavern.currentChapter = this._currentChapterIndex;
        p.tavern.secretUnlocked = this._isSecretUnlocked || false;
        Sherwood.saveGame();
    },

    showUI: function() {
        if (typeof SherwoodUI === 'undefined' || !SherwoodUI._openScreenScrollable) {
            console.error('UI не загружен!');
            return;
        }
        
        SherwoodUI._playSound('click');
        var current = this.getCurrentChapter();
        var completed = this.getCompletedCount();
        var total = this.getTotalChapters();

        // 1. Скрываем прокрутку на уровне слоя
        if (SherwoodUI._screenLayer) {
            SherwoodUI._screenLayer.style.overflow = 'hidden';
        }

        // 2. Строим HTML с фоновым изображением и видео-анимацией
        var h = '<div style="position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden;background:url(\'assets/assets2/backgrounds/tavern.png\') center/cover no-repeat;">';

        // 3. Добавляем видео егеря (Зациклено, уменьшено до 60% и стоит по центру, чуть правее)
        h += '<div style="position:absolute;top:50%;left:55%;transform:translate(-50%,-50%);width:60%;height:60%;pointer-events:none;">';
        h += '<video src="assets/assets2/animation/Garret.webm" autoplay loop muted playsinline style="width:100%;height:100%;object-fit:contain;pointer-events:none;"></video>';
        h += '</div>';

        // 4. Помещаем весь игровой контент ПОВЕРХ видео
        h += '<div style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:10;overflow-y:hidden;scrollbar-width:none;">';

        // 5. Кнопка назад (кликабельная, поверх всего)
        h += '<button onclick="Sherwood.Tavern.closeUI()" style="position:absolute;top:20px;left:20px;z-index:30;background:transparent;border:none;cursor:pointer;padding:0;width:50px;height:50px;">';
        h += '<img src="assets/all_buttons/back.png" style="width:100%;height:100%;object-fit:contain;">';
        h += '</button>';

        // 6. ПЕРВЫМИ идут вкладки «Таланты» и «Тренировка» (опущены ниже и с меньшим отступом)
        h += '<div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:80px;">';
        
        h += '<div onclick="Sherwood.Talents.showUI()" style="width:300px;height:80px;background:url(\'assets/interface/all_stat.png\') center/100% 100% no-repeat;display:flex;align-items:center;justify-content:center;cursor:pointer;">';
        h += '<span style="color:#ffa500;font-size:20px;font-weight:bold;text-shadow:0 2px 4px #000;">Таланты</span>';
        h += '</div>';
        
        h += '<div onclick="SherwoodUI.training()" style="width:300px;height:80px;background:url(\'assets/interface/all_stat.png\') center/100% 100% no-repeat;display:flex;align-items:center;justify-content:center;cursor:pointer;">';
        h += '<span style="color:#ffa500;font-size:20px;font-weight:bold;text-shadow:0 2px 4px #000;">Тренировка</span>';
        h += '</div>';
        
        h += '</div>';

        // 7. Панель с заданиями (пергамент, 90% ширины и 300px высоты, поднята выше)
        h += '<div style="width:90%;margin:0 auto;margin-top:140px;">';
        h += '<div style="width:100%;height:300px;background:url(\'assets/assets2/game_details/parchment_tasks.png\') center/100% 100% no-repeat;padding:30px 20px;display:flex;flex-direction:column;justify-content:center;overflow:hidden;">';
        
        if (current) {
            var isCompleted = this.isChapterCompleted(current.id);
            var isAccepted = this._currentQuest !== null;
            
            // Заголовок (оранжевый, с тенью)
            h += '<div style="text-align:center;color:#ffa500;font-size:14px;font-weight:bold;margin-bottom:10px;text-shadow:0 2px 4px #000;word-wrap:break-word;word-break:break-word;line-height:1.6;">' + current.title + '</div>';
            
            // Текст задания (один цвет - белый, крупнее, с тенью)
            h += '<div style="text-align:center;color:#fff;font-size:12px;line-height:1.8;margin-bottom:10px;text-shadow:0 2px 4px #000;word-wrap:break-word;word-break:break-word;">' + current.lore + '</div>';
            h += '<div style="text-align:center;color:#fff;font-size:12px;line-height:1.8;margin-bottom:10px;text-shadow:0 2px 4px #000;word-wrap:break-word;word-break:break-word;">' + current.quest + '</div>';
            
            // Награда (белый, крупный)
            h += '<div style="text-align:center;color:#fff;font-size:12px;line-height:1.8;text-shadow:0 2px 4px #000;">+' + current.reward.exp + ' опыта, +' + current.reward.gold + ' золота, +' + current.reward.silver + ' серебра</div>';
            
            if (isCompleted) {
                h += '<div style="text-align:center;color:#52b788;margin-top:15px;font-size:16px;font-weight:bold;">Глава пройдена!</div>';
            } else if (isAccepted) {
                h += '<div style="text-align:center;color:#ffa500;margin-top:15px;font-size:16px;font-weight:bold;">Квест принят!</div>';
            } else {
                h += '<button onclick="Sherwood.Tavern.acceptFromUI()" style="margin-top:15px;background:#5a3a00;border:none;border-radius:6px;padding:8px 20px;color:#ffd700;font-weight:bold;cursor:pointer;font-size:14px;width:60%;max-width:200px;margin-left:auto;margin-right:auto;display:block;">Принять квест</button>';
            }
        } else if (completed >= total) {
            h += '<div style="text-align:center;color:#ffa500;font-size:22px;font-weight:bold;text-shadow:0 2px 4px #000;">Шервуд спасён!</div>';
        }
        h += '</div>';
        h += '</div>';
        
        // 8. Прогресс (самый низ)
        h += '<div style="margin-top:30px;margin-bottom:30px;text-align:center;color:#ffa500;font-size:16px;text-shadow:0 2px 4px #000;">Прогресс: ' + completed + '/' + total + ' глав</div>';
        
        h += '</div>'; // Закрываем контент поверх видео
        h += '</div>'; // Закрываем главный контейнер

        // ВАЖНО: передаем null вместо 'tavern' для фона, чтобы старый фон не перекрывался!
        SherwoodUI._openScreenScrollable('Таверна', null, h);
    },

    acceptFromUI: function() {
        var r = this.acceptQuest();
        if (!r.success) {
            SherwoodUI._showToast(r.reason || 'Ошибка');
            return;
        }
        SherwoodUI._showToast('Квест принят: ' + r.chapter.title);
        this.showUI();
    },

    closeUI: function() {
        if (typeof SherwoodUI !== 'undefined' && SherwoodUI.loadHome) {
            SherwoodUI.loadHome();
        }
    }
};

window.Sherwood = window.Sherwood || {};
window.Sherwood.Tavern = Sherwood.Tavern;

console.log('Таверна загружена!');

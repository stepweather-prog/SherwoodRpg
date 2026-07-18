/**
 * Sherwood Tavern
 * Таверна «Весёлый Разбойник» — система квестов с Робин Гудом
 * 
 * Механика:
 * - Открывается после прохождения Главы 1 в Дубе
 * - 15 глав, в каждой 9 бестий + 1 босс (всего 150 существ)
 * - Бестии идут по нарастающей сложности
 * - Побеждённые бестии попадают в Бестиарий
 * - После каждой главы — Робин Гуд даёт квесты в таверне
 * - В таверне: 5 автобоев + 5 ручных боев с усиленными бестиями
 * - Всего в таверне нужно победить 100 боев (не автобоев)
 * - 10 квестов в день, лимит обновляется
 * - Награда — серебро
 */

Sherwood.Tavern = {
    _tavernData: null,
    _dailyQuests: [],
    _lastRefresh: null,
    _chapterProgress: 0,
    _beastiaryUnlocked: [],
    _bossesDefeated: [],
    
    // 15 глав по 10 существ (9 бестий + 1 босс)
    CHAPTERS: {
        1: { name: 'Лесные твари', tier: 1, boss: 'Серый волк-вожак' },
        2: { name: 'Болотные отродья', tier: 1, boss: 'Болотный князь' },
        3: { name: 'Глубины леса', tier: 2, boss: 'Древний леший' },
        4: { name: 'Проклятые земли', tier: 2, boss: 'Вендиго-мутант' },
        5: { name: 'Сумеречный лес', tier: 2, boss: 'Теневой олень' },
        6: { name: 'Гнилые топи', tier: 3, boss: 'Тритон-людоед' },
        7: { name: 'Каменные недра', tier: 3, boss: 'Короед-великан' },
        8: { name: 'Логово химер', tier: 3, boss: 'Химера-ужас' },
        9: { name: 'Кровавый туман', tier: 4, boss: 'Кровавый палач' },
        10: { name: 'Склепы древних', tier: 4, boss: 'Древний хранитель' },
        11: { name: 'Пепелище', tier: 4, boss: 'Огненный элементаль' },
        12: { name: 'Ледяная пустошь', tier: 5, boss: 'Ледяной великан' },
        13: { name: 'Город мёртвых', tier: 5, boss: 'Король-личи' },
        14: { name: 'Бездна', tier: 5, boss: 'Порождение тьмы' },
        15: { name: 'Шервудская угроза', tier: 6, boss: 'Древний Робин Гуд (Тень)' }
    },

    init() {
        this._loadData();
        this._checkRefresh();
    },

    _loadData() {
        const saved = localStorage.getItem('sherwood_tavern');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this._tavernData = data;
                this._dailyQuests = data.quests || [];
                this._lastRefresh = data.lastRefresh || null;
                this._chapterProgress = data.chapterProgress || 0;
                this._beastiaryUnlocked = data.beastiaryUnlocked || [];
                this._bossesDefeated = data.bossesDefeated || [];
                return;
            } catch(e) {}
        }
        
        // Первый запуск
        this._tavernData = {
            quests: [],
            lastRefresh: null,
            chapterProgress: 0,
            beastiaryUnlocked: [],
            bossesDefeated: [],
            totalBattlesWon: 0,
            tavernBattlesWon: 0,
            autoBattlesWon: 0
        };
        this._dailyQuests = [];
        this._lastRefresh = null;
        this._chapterProgress = 0;
        this._beastiaryUnlocked = [];
        this._bossesDefeated = [];
        this._saveData();
    },

    _saveData() {
        this._tavernData.quests = this._dailyQuests;
        this._tavernData.lastRefresh = this._lastRefresh;
        this._tavernData.chapterProgress = this._chapterProgress;
        this._tavernData.beastiaryUnlocked = this._beastiaryUnlocked;
        this._tavernData.bossesDefeated = this._bossesDefeated;
        localStorage.setItem('sherwood_tavern', JSON.stringify(this._tavernData));
    },

    _checkRefresh() {
        const today = new Date().toDateString();
        if (this._lastRefresh !== today) {
            this._lastRefresh = today;
            this._tavernData.tavernBattlesWon = 0;
            this._generateDailyQuests();
            this._saveData();
        }
    },

    _generateDailyQuests() {
        this._dailyQuests = [];
        
        // 5 автобоев
        for (let i = 0; i < 5; i++) {
            this._dailyQuests.push({
                id: `auto_battle_${i}`,
                type: 'auto',
                name: `Автобой ${i+1}`,
                description: 'Сразиться с лесными тварями (авто)',
                completed: false,
                claimed: false,
                reward: { silver: 50 + i * 10 },
                isAuto: true
            });
        }
        
        // 5 ручных боев с усиленными бестиями
        const availableBeasts = this._getAvailableBeasts();
        for (let i = 0; i < 5 && i < availableBeasts.length; i++) {
            const beast = availableBeasts[i];
            this._dailyQuests.push({
                id: `manual_battle_${i}`,
                type: 'manual',
                name: `Бой с ${beast.name}`,
                description: `Победить ${beast.name}`,
                monsterId: beast.id,
                completed: false,
                claimed: false,
                reward: { silver: 100 + i * 20 },
                isAuto: false,
                beastData: beast
            });
        }
    },

    _getAvailableBeasts() {
        const allBeasts = [];
        for (let chapter = 1; chapter <= this._chapterProgress; chapter++) {
            const beasts = this._getChapterBeasts(chapter);
            allBeasts.push(...beasts);
        }
        // Исключаем уже побеждённых в таверне
        return allBeasts.filter(b => !this._beastiaryUnlocked.includes(b.id));
    },

    _getChapterBeasts(chapter) {
        const monsters = Object.values(Sherwood.Monsters || {});
        const tier = this.CHAPTERS[chapter]?.tier || 1;
        // Фильтруем монстров по тиру и не боссов
        const filtered = monsters.filter(m => 
            m.tier === tier && !m.isBoss && m.id !== this.CHAPTERS[chapter]?.bossId
        );
        // Берём 9 случайных
        return filtered.sort(() => Math.random() - 0.5).slice(0, 9);
    },

    canAccessTavern() {
        // Проверяем, пройдена ли Глава 1 в Дубе
        return this._chapterProgress >= 1;
    },

    startAutoBattle(questId) {
        const quest = this._dailyQuests.find(q => q.id === questId);
        if (!quest || quest.completed) return null;
        
        // Автобой — симуляция
        const win = Math.random() > 0.3;
        if (win) {
            quest.completed = true;
            this._tavernData.autoBattlesWon++;
            this._saveData();
            return { success: true, isAuto: true };
        }
        return { success: false, isAuto: true };
    },

    startManualBattle(questId) {
        const quest = this._dailyQuests.find(q => q.id === questId);
        if (!quest || quest.completed || !quest.beastData) return null;
        
        // Запускаем бой с усиленной бестией
        const monsterId = quest.beastData.id;
        const battle = Sherwood.Combat.startPvE(monsterId);
        if (battle) {
            battle.isTavernBattle = true;
            battle.questId = questId;
            Sherwood.once('BATTLE_VICTORY', () => {
                quest.completed = true;
                this._tavernData.tavernBattlesWon++;
                this._tavernData.totalBattlesWon++;
                this._beastiaryUnlocked.push(monsterId);
                this._saveData();
            });
            return battle;
        }
        return null;
    },

    claimQuest(questId) {
        const quest = this._dailyQuests.find(q => q.id === questId);
        if (!quest || !quest.completed || quest.claimed) return false;
        
        quest.claimed = true;
        Sherwood.addResource('silver', quest.reward.silver);
        this._saveData();
        return true;
    },

    getDailyQuests() {
        this._checkRefresh();
        return this._dailyQuests;
    },

    getChapterProgress() {
        return this._chapterProgress;
    },

    getBeastiaryUnlocked() {
        return this._beastiaryUnlocked;
    },

    getBossesDefeated() {
        return this._bossesDefeated;
    },

    getTotalBattlesWon() {
        return this._tavernData.totalBattlesWon || 0;
    },

    getTavernBattlesWon() {
        return this._tavernData.tavernBattlesWon || 0;
    },

    // Вызывается при победе над боссом в Дубе
    completeChapter(chapter) {
        if (chapter > this._chapterProgress) {
            this._chapterProgress = chapter;
            // Записываем босса в побеждённых
            const bossName = this.CHAPTERS[chapter]?.boss;
            if (bossName) {
                this._bossesDefeated.push(bossName);
            }
            this._saveData();
            return true;
        }
        return false;
    },

    // Проверка на прохождение 100 боев
    isTavernComplete() {
        return this._tavernData.totalBattlesWon >= 100;
    },

    getRemainingBattles() {
        return Math.max(0, 100 - (this._tavernData.totalBattlesWon || 0));
    }
};

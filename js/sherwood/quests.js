/**
 * Sherwood Quests System — Система квестов и прогрессии
 */

Sherwood.Quests = {
    _quests: {},
    _activeQuest: null,
    _lastBattleTime: 0,
    _cooldownMinutes: 30,

    _definitions: {
        chapter1_intro: {
            id: 'chapter1_intro',
            chapter: 1,
            name: 'Пробуждение леса',
            description: 'Шервудский лес пробудился. Докажи, что ты достоин звания вольного стрелка.',
            tasks: [
                { id: 'kill_spiders', type: 'kill', description: 'Убить лесных пауков', monsterId: 'forest_spider', target: 5, progress: 0, reward: { gold: 25, silver: 100, exp: 50 } },
                { id: 'collect_gold', type: 'collect', description: 'Накопить золотых монет', resource: 'gold', target: 50, progress: 0, reward: { gold: 15, silver: 50, exp: 30 } },
                { id: 'equip_bow', type: 'equip', description: 'Экипировать лук', part: 'weapon1', completed: false, reward: { item: 'longbow' } }
            ],
            chapterReward: { gold: 100, silver: 300, exp: 200, item: 'leather_hood' },
            requiredLevel: 1
        },
        chapter2_swamp: {
            id: 'chapter2_swamp',
            chapter: 2,
            name: 'Болотные твари',
            description: 'Болота кишат нежитью. Очисти их от скверны.',
            tasks: [
                { id: 'kill_ghouls', type: 'kill', description: 'Убить болотных упырей', monsterId: 'swamp_ghoul', target: 8, progress: 0, reward: { gold: 40, silver: 150, exp: 80

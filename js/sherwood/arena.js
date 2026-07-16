/**
 * Sherwood Arena
 * PvP Турнир лучников через P2P WebRTC
 */

Sherwood.Arena = {
    _activeArena: null,
    _opponentStats: null,
    
    init() {
        // Заглушка — полная реализация после подключения PvP
    },
    
    findMatch() {
        const player = Sherwood.getPlayer();
        if (player.arena.tickets <= 0) {
            Sherwood.dispatch({ type: 'ARENA_ERROR', payload: { message: 'Нет билетов на арену!' } });
            return null;
        }
        
        player.arena.tickets--;
        
        this._activeArena = {
            status: 'searching',
            player: {
                name: player.name,
                stats: { ...player.stats }
            }
        };
        
        Sherwood.dispatch({ type: 'ARENA_SEARCHING', payload: this._activeArena });
        
        // Имитация поиска (в будущем — P2P)
        setTimeout(() => {
            this._activeArena.status = 'matched';
            this._opponentStats = this._generateBot(player.level);
            Sherwood.dispatch({ 
                type: 'ARENA_MATCH_FOUND', 
                payload: { opponent: this._opponentStats } 
            });
        }, 2000);
        
        return this._activeArena;
    },
    
    _generateBot(level) {
        const variation = Math.floor(Math.random() * 5) - 2;
        const botLevel = Math.max(1, level + variation);
        
        return {
            name: ['Меткий стрелок', 'Лесной охотник', 'Бывалый лучник'][Math.floor(Math.random() * 3)],
            stats: {
                attack: 10 + botLevel * 3 + Math.floor(Math.random() * 5),
                defense: 5 + botLevel * 2 + Math.floor(Math.random() * 3),
                hp: 100 + botLevel * 15,
                maxHp: 100 + botLevel * 15,
                agility: 8 + Math.floor(botLevel / 2),
                critChance: 5,
                dodgeChance: 3
            }
        };
    },
    
    startMatch() {
        if (!this._opponentStats) return null;
        return Sherwood.Combat.startPvP('arena_bot', this._opponentStats);
    },
    
    getActiveArena() {
        return this._activeArena;
    },
    
    cancelSearch() {
        if (this._activeArena) {
            this._activeArena.status = 'cancelled';
            Sherwood.dispatch({ type: 'ARENA_CANCELLED', payload: null });
            this._activeArena = null;
        }
    }
};

/**
 * Sherwood Black Market
 * Разбойничий схрон — торговля предметами
 */

Sherwood.BlackMarket = {
    _listings: [],
    _lastRefresh: null,
    
    init() {
        this._loadListings();
    },
    
    _loadListings() {
        const saved = localStorage.getItem('sherwood_market');
        
        if (saved) {
            const data = JSON.parse(saved);
            const today = new Date().toDateString();
            
            if (data.date === today) {
                this._listings = data.listings;
                this._lastRefresh = data.date;
                return;
            }
        }
        
        this._generateDailyListings();
    },
    
    _generateDailyListings() {
        const allItems = Sherwood.EquipmentDB.items;
        this._listings = [];
        
        const rarities = ['common', 'uncommon', 'rare'];
        const itemsByRarity = {};
        
        rarities.forEach(rarity => {
            itemsByRarity[rarity] = allItems.filter(item => item.grade === rarity);
        });
        
        // 2 обычных, 2 необычных, 1 редкий
        const selection = [
            ...this._pickRandom(itemsByRarity['common'] || [], 2),
            ...this._pickRandom(itemsByRarity['uncommon'] || [], 2),
            ...this._pickRandom(itemsByRarity['rare'] || [], 1)
        ];
        
        selection.forEach(item => {
            if (item) {
                const priceMod = 0.8 + Math.random() * 0.6;
                this._listings.push({
                    ...item,
                    price: {
                        gold: Math.floor(item.price.gold * priceMod),
                        silver: Math.floor((item.price.gold * priceMod) * 10)
                    }
                });
            }
        });
        
        this._lastRefresh = new Date().toDateString();
        this._saveListings();
    },
    
    _pickRandom(array, count) {
        const shuffled = [...array].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    },
    
    _saveListings() {
        try {
            localStorage.setItem('sherwood_market', JSON.stringify({
                date: this._lastRefresh,
                listings: this._listings
            }));
        } catch(e) {}
    },
    
    getListings() {
        return this._listings;
    },
    
    buyItem(index) {
        const listing = this._listings[index];
        if (!listing) return false;
        
        const player = Sherwood.getPlayer();
        const price = listing.price.gold;
        
        if (player.resources.gold >= price) {
            player.resources.gold -= price;
            
            const item = { ...listing };
            delete item.price;
            player.inventory.push(item);
            
            this._listings.splice(index, 1);
            this._saveListings();
            
            Sherwood.dispatch({
                type: 'ITEM_ACQUIRED',
                payload: { item, source: 'blackmarket' }
            });
            
            return true;
        }
        return false;
    }
};

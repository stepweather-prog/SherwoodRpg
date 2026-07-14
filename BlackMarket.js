// src/game/core/BlackMarket.js
export class BlackMarket {
    constructor(p2p) {
        this.p2p = p2p;
        this.listings = [];
        this.myListings = [];
        
        // Слушаем объявления о продаже
        this.p2p.on('game-action', (data) => {
            if (data.action === 'market-listing') {
                this.addListing(data.data);
            }
        });
    }
    
    listItem(item, price) {
        const listing = {
            id: Date.now() + Math.random(),
            item: item,
            price: price,
            seller: this.p2p._myNick,
            sellerId: this.p2p._peerId,
            timestamp: Date.now()
        };
        
        this.myListings.push(listing);
        this.p2p.sendGameAction(
            this.p2p._chId,
            'market-listing',
            listing
        );
        
        return listing;
    }
    
    addListing(data) {
        // Проверяем, не дублируется ли объявление
        if (!this.listings.find(l => l.id === data.id)) {
            this.listings.push(data);
            this.p2p._emit('market-update', this.listings);
        }
    }
    
    buyItem(listingId) {
        const listing = this.listings.find(l => l.id === listingId);
        if (!listing) return false;
        
        // Отправляем запрос на покупку
        this.p2p.sendGameAction(
            this.p2p._chId,
            'market-buy',
            { listingId: listingId, buyer: this.p2p._myNick }
        );
        
        return true;
    }
    
    getListings() {
        return this.listings;
    }
}
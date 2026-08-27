// js/hearth.js
Sherwood.Hearth = {
    init: function() {
        // Ничего не требуется
    },

    show: function() {
        SherwoodUI._playSound('click');
        var p = Sherwood.getPlayer();
        var bonusActive = p.hearthBonus && p.hearthBonus.active;
        var bonusEnd = p.hearthBonus ? p.hearthBonus.endTime || 0 : 0;
        var now = Date.now(), cooldownEnd = p.hearthCooldown || 0;
        var wood = 0;
        
        try {
            var bag = Sherwood.Bag.getItems();
            for (var i = 0; i < bag.length; i++) {
                if (bag[i].id === 'wood' || bag[i].name === 'Дерево') {
                    wood += bag[i].quantity || 0;
                }
            }
        } catch(e) {}
        
        var canActivate = wood >= 100 && now > cooldownEnd;
        var h = '<div style="text-align:center;padding:20px;">';
        h += '<div style="font-size:3em;">&#128293;</div>';
        h += '<div style="color:#e0c080;font-size:1.2em;margin:12px 0;">Очаг Шервуда</div>';
        h += '<div style="color:#aaa;font-size:0.85em;">Дерева в сумке: ' + wood + ' / 100</div>';
        
        if (bonusActive && now < bonusEnd) {
            var rem = Math.ceil((bonusEnd - now) / 3600000);
            h += '<div style="color:#4caf50;margin:12px 0;">&#9989; Бонус +50% к трофеям активен! Осталось: ' + rem + ' ч.</div>';
        } else if (now <= cooldownEnd) {
            var cd = Math.ceil((cooldownEnd - now) / 3600000);
            h += '<div style="color:#ff9800;margin:12px 0;">&#9203; Перезарядка: ' + cd + ' ч.</div>';
        } else if (canActivate) {
            h += '<button onclick="Sherwood.Hearth.activate()" style="margin-top:12px;background:#c9a040;border:none;border-radius:8px;padding:10px 24px;color:#000;font-weight:bold;cursor:pointer;">Подкинуть дров (100)</button>';
        } else {
            h += '<div style="color:#f44336;margin:12px 0;">Недостаточно дерева (нужно 100)</div>';
        }
        
        h += '</div>';
        SherwoodUI._openScreen('Очаг', 'hearth', h);
    },

    activate: function() {
        var p = Sherwood.getPlayer();
        var spent = 0;
        
        try {
            var bag = Sherwood.Bag.getItems();
            for (var i = bag.length - 1; i >= 0 && spent < 100; i--) {
                if (bag[i].id === 'wood' || bag[i].name === 'Дерево') {
                    var q = bag[i].quantity || 1;
                    var take = Math.min(q, 100 - spent);
                    spent += take;
                    if (q <= take) bag.splice(i, 1);
                    else bag[i].quantity -= take;
                }
            }
            Sherwood.Bag._save();
        } catch(e) {}
        
        p.hearthBonus = { active: true, endTime: Date.now() + 86400000 };
        p.hearthCooldown = Date.now() + 86400000 + 86400000;
        
        if (typeof Sherwood._recalcStats === 'function') Sherwood._recalcStats();
        Sherwood.saveGame();
        
        this.show();
    }
};

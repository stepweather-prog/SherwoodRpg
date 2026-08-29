// js/textures.js — Упрощённая версия (только для совместимости)

if (typeof Textures === 'undefined') {
    var Textures = {
        loaded: true,
        load: function(callback) {
            console.log('🖼️ Textures: загрузка пропущена (используется новая система)');
            if (callback) callback();
        }
    };
}

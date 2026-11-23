// ============================================================
//  AUDIO-VOLUME.JS — глобальная громкость для всей игры
//  Обёртка над window.Audio: любой new Audio(src) в любом режиме
//  (главная, лагерь, подземка, портал, волна, чащоба)
//  автоматически получает громкость из настроек:
//    /music/ в пути  -> громкость музыки
//    остальное       -> громкость звуков
//  Патч применяется при создании объекта и при смене настроек
//  (broadcast 'sherwood_volume' из settings.js -> iframe-ы).
// ============================================================
(function () {
    'use strict';
    if (window.__sherwoodVolumePatched) return;
    window.__sherwoodVolumePatched = true;

    // Настройки ищем в своём окне или в родителе (боевые страницы — iframe)
    function getSettings() {
        try { if (window.Settings && Settings.getMusicVolume) return window.Settings; } catch (e) {}
        try { if (window.parent && parent.Settings && parent.Settings.getMusicVolume) return parent.Settings; } catch (e) {}
        return null;
    }

    function isMusicSrc(src) {
        return typeof src === 'string' && src.indexOf('/music/') !== -1;
    }

    // Все созданные объекты лежат здесь — чтобы менять громкость на лету
    var registry = [];

    function computeVolume(src) {
        var s = getSettings();
        var mv = s ? s.getMusicVolume() : 0.5;
        var sv = s ? s.getSoundVolume() : 0.5;
        var me = s ? (s.isMusicEnabled ? s.isMusicEnabled() : true) : true;
        var se = s ? (s.isSoundEnabled ? s.isSoundEnabled() : true) : true;
        return isMusicSrc(src) ? (me ? mv : 0) : (se ? sv : 0);
    }

    function applyAll() {
        for (var i = 0; i < registry.length; i++) {
            try { registry[i].a.volume = computeVolume(registry[i].src); } catch (e) {}
        }
    }

    var NativeAudio = window.Audio;
    function VolumeAudio(src) {
        var a = new NativeAudio(src);
        try {
            var rec = { a: a, src: src };
            registry.push(rec);
            a.addEventListener('ended', function () { rec.src = null; });
            a.volume = computeVolume(src);
        } catch (e) {}
        return a;
    }
    VolumeAudio.prototype = NativeAudio.prototype;

    window.Audio = VolumeAudio;

    window.SherwoodVolume = {
        apply: applyAll
    };

    // Смена настроек в родительском окне
    window.addEventListener('message', function (ev) {
        if (ev.data && ev.data.type === 'sherwood_volume') applyAll();
    });

    // На случай прямой правки localStorage в devtools
    window.addEventListener('storage', function (ev) {
        if (ev.key === 'sherwood_settings') applyAll();
    });
})();

// ============================================================
//  SERVICE-WORKER.JS — Офлайн-режим для Sherwood RPG
// ============================================================

const CACHE_NAME = 'sherwood-v1';

// Список файлов, которые нужно закэшировать при установке
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './css/style.css',
    './css/mobile.css',
    './assets/interface/logo.png',
    
    // JS-файлы
    './js/sherwood/core.js',
    './js/sherwood/models.js',
    './js/sherwood/ui_screens.js',
    './js/sherwood/main.js',
    './js/sherwood/bag.js',
    './js/sherwood/talents.js',
    './js/sherwood/Training.js',
    './js/sherwood/settings.js',
    './js/sherwood/tavern.js',
    './js/sherwood/thicket.js',
    './js/sherwood/portal.js',
    './js/sherwood/dungeon.js',
    './js/sherwood/bestiary.js',
    './js/sherwood/blackmarket.js',
    './js/sherwood/forge.js',
    './js/sherwood/combat.js',
    './js/sherwood/hearth.js',
    './js/sherwood/router.js',
    './js/sherwood/crypto-worker.js' // <-- добавил твой воркер
];

// 1. Установка: кэшируем все файлы из списка
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS_TO_CACHE);
        }).then(function() {
            return self.skipWaiting(); // Активируем сразу
        })
    );
});

// 2. Активация: удаляем старые версии кэша
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(function() {
            return self.clients.claim(); // Берем контроль над страницами
        })
    );
});

// 3. Перехват запросов
self.addEventListener('fetch', function(event) {
    // Не кэшируем запросы к сторонним доменам (например, three.js с unpkg)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function(response) {
            // Если файл есть в кэше — отдаем его
            if (response) {
                return response;
            }
            
            // Если нет — идем в сеть
            return fetch(event.request).then(function(networkResponse) {
                // Если ответ невалидный — просто возвращаем
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                
                // Иначе кэшируем новый файл (например, видео или картинку, которую запросили впервые)
                var responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, responseToCache);
                });
                
                return networkResponse;
            });
        }).catch(function() {
            // Если нет сети и нет в кэше — показываем index.html
            return caches.match('./index.html');
        })
    );
});

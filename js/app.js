// js/app.js
// Главный файл — инициализация всего приложения

document.addEventListener('DOMContentLoaded', function() {
    console.log('📱 DOM загружен');

    // Кнопки настроения
    var moodBtns = document.querySelectorAll('.mood-btn');
    for (var i = 0; i < moodBtns.length; i++) {
        moodBtns[i].addEventListener('click', function() {
            setMood(this.dataset.mood);
        });
    }

    // Кнопки управления
    document.getElementById('buildBtn').addEventListener('click', buildRoute);
    document.getElementById('goBtn').addEventListener('click', startNavigation);
    document.getElementById('resetBtn').addEventListener('click', resetRoute);
    document.getElementById('arriveBtn').addEventListener('click', arrive);

    // Кнопка геолокации
    document.getElementById('myLocationBtn').addEventListener('click', function() {
        getUserLocation(function() {
            if (userLocation && map) {
                map.setCenter(userLocation, 17);
            }
        });
    });

    // Карточки маршрутов
    var cards = document.querySelectorAll('.route-card');
    for (var i = 0; i < cards.length; i++) {
        cards[i].addEventListener('click', function(e) {
            if (e.target.classList.contains('call-btn')) return;
            if (this.dataset.route === '3') {
                showToast('🔒 Закрытая роща. Нажмите "Позвонить"', 'warning', 4000);
            } else {
                showToast('🗺️ Маршрут выбран! Нажмите "Маршрут"', 'info', 3000);
                selectedPoints = [2, 3, 7];
                loadPoints();
            }
        });
    }

    // Яндекс.Карты
    if (typeof ymaps !== 'undefined') {
        ymaps.ready(function() {
            console.log('✅ ymaps.ready!');
            initMap();
        });
    } else {
        console.error('❌ ymaps не найден');
    }
});

console.log('✅ app.js загружен');
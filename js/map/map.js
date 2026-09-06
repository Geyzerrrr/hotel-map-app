// js/map/map.js
// Карта, метки, геолокация

var map = null;
var placemarks = [];
var routeLine = null;
var userMarker = null;
var userLocation = [55.955087, 36.374705];
var selectedPoints = [];
var currentMood = 'all';
var isLockedAccessGranted = false;
var routePointsIds = [];
var isGpsActive = false;

// ==========================================
// ИНИЦИАЛИЗАЦИЯ КАРТЫ
// ==========================================
function initMap() {
    console.log('🗺️ initMap');
    if (typeof ymaps === 'undefined') {
        console.error('❌ ymaps не определен!');
        // Пробуем загрузить карты снова
        setTimeout(function() {
            if (typeof ymaps !== 'undefined') {
                ymaps.ready(initMap);
            }
        }, 2000);
        return;
    }
    
    var hotelLocation = [55.955087, 36.374705];
    try {
        map = new ymaps.Map('map', {
            center: hotelLocation,
            zoom: 15,
            controls: ['zoomControl']
        });
        console.log('✅ Карта создана!');
        
        // Метка отеля
        var hotelMarker = new ymaps.Placemark(
            hotelLocation,
            { hintContent: '🏨 Отель' },
            { preset: 'islands#redDotIcon' }
        );
        map.geoObjects.add(hotelMarker);
        
        // Метка пользователя
        addUserMarker(hotelLocation);
        
        loadPoints();
        updateButtons();
        checkWeekend();
        fetchRealWeather(hotelLocation[0], hotelLocation[1]);
        
        // Обработка ошибок карты
        map.events.add('error', function(e) {
            console.error('Ошибка карты:', e);
        });
        
    } catch (e) {
        console.error('❌ Ошибка карты:', e);
        // Показываем сообщение об ошибке
        document.getElementById('map').innerHTML = 
            '<div style="padding:40px;text-align:center;color:#666;">' +
            '⚠️ Ошибка загрузки карты<br>' +
            '<small>Попробуйте обновить страницу</small>' +
            '</div>';
    }
}

// ... остальной код map.js без изменений ...

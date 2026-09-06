// js/map/map.js
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
// ДОБАВЛЕНИЕ МЕТКИ ПОЛЬЗОВАТЕЛЯ
// ==========================================
function addUserMarker(location) {
    if (userMarker) map.geoObjects.remove(userMarker);
    userMarker = new ymaps.Placemark(
        location,
        { hintContent: isGpsActive ? '🚶 Вы здесь' : '🏨 Отель (старт)' },
        { preset: isGpsActive ? 'islands#blueCircleIcon' : 'islands#greenDotIcon' }
    );
    map.geoObjects.add(userMarker);
}

// ==========================================
// ГЕОЛОКАЦИЯ
// ==========================================
function getUserLocation(callback) {
    if (isGpsActive && userLocation) { if (callback) callback(); return; }
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function(pos) {
                userLocation = [pos.coords.latitude, pos.coords.longitude];
                isGpsActive = true;
                addUserMarker(userLocation);
                map.setCenter(userLocation, 17);
                if (callback) callback();
            },
            function() {
                isGpsActive = false;
                userLocation = [55.955087, 36.374705];
                addUserMarker(userLocation);
                if (callback) callback();
            },
            { enableHighAccuracy: true }
        );
    } else {
        userLocation = [55.955087, 36.374705];
        addUserMarker(userLocation);
        if (callback) callback();
    }
}

// ==========================================
// ИНИЦИАЛИЗАЦИЯ КАРТЫ
// ==========================================
function initMap() {
    if (typeof ymaps === 'undefined') return;
    var hotelLocation = [55.955087, 36.374705];
    try {
        map = new ymaps.Map('map', {
            center: hotelLocation,
            zoom: 15,
            controls: ['zoomControl']
        });
        
        // Метка отеля
        map.geoObjects.add(new ymaps.Placemark(hotelLocation, { hintContent: '🏨 Отель' }, { preset: 'islands#redDotIcon' }));
        addUserMarker(hotelLocation);
        
        // ВАЖНО: СОЗДАЕМ ДОРОГИ ГЛОБАЛЬНО!
        window.ROADS = [
            { from: [55.955087, 36.374705], to: [55.956000, 36.375000] },
            { from: [55.956000, 36.375000], to: [55.957000, 36.376000] },
            { from: [55.955087, 36.374705], to: [55.954000, 36.373500] },
            { from: [55.954000, 36.373500], to: [55.953000, 36.372500] },
            { from: [55.957000, 36.376000], to: [55.958000, 36.377000] },
            { from: [55.953000, 36.372500], to: [55.952000, 36.371500] }
        ];
        console.log('✅ ROADS созданы:', window.ROADS.length);

        loadPoints();
        updateButtons();
        checkWeekend();
        
    } catch (e) {
        console.error('❌ Ошибка карты:', e);
    }
}

// ==========================================
// ЗАГРУЗКА ТОЧЕК (без onerror!)
// ==========================================
function loadPoints() {
    if (!map) return;
    var pointsToShow = LOCATIONS.filter(function(loc) {
        if (routePointsIds.length > 0) return loc.id === 1 || routePointsIds.indexOf(loc.id) !== -1;
        if (currentMood === 'all') return true;
        return loc.tags.indexOf(currentMood) !== -1;
    });

    for (var i = 0; i < placemarks.length; i++) map.geoObjects.remove(placemarks[i]);
    placemarks = [];

    for (var i = 0; i < pointsToShow.length; i++) {
        var loc = pointsToShow[i];
        if (loc.id === 1) continue;
        
        var isLocked = loc.locked === true;
        var isSelected = selectedPoints.indexOf(loc.id) !== -1;
        var iconColor = isLocked ? '#FF6F00' : '#2E7D32';
        var iconPreset = isSelected ? 'islands#greenCircleDotIcon' : 'islands#circleIcon';
        
        var tagsHtml = '';
        for (var t = 0; t < loc.tags.length; t++) {
            var tagClass = 'tag' + (isLocked ? ' locked' : '');
            tagsHtml += '<span class="' + tagClass + '">#' + loc.tags[t] + '</span>';
        }
        
        var lockHtml = isLocked ? '<span class="locked-label">🔒 Требуется приглашение</span>' : '';
        var buttonText = isSelected ? '✅ В маршруте' : '➕ Добавить';
        var buttonClass = 'add-btn';
        if (isSelected) buttonClass += ' added';
        if (isLocked && !isLockedAccessGranted) {
            buttonText = '📞 Позвонить';
            buttonClass += ' locked-btn';
        }
        
        // УБРАЛИ onerror! Теперь картинка просто скрывается через CSS, если не загрузилась
        var balloonHtml = 
            '<div class="point-card">' +
                (loc.photo ? '<img src="' + loc.photo + '" style="display:block; max-width:100%;">' : '') +
                '<h3>' + loc.name + '</h3>' +
                '<div class="tags">' + tagsHtml + '</div>' +
                '<p class="desc">' + loc.description + '</p>' +
                lockHtml +
                '<button class="' + buttonClass + '" onclick="handlePointAction(' + loc.id + ')">' + buttonText + '</button>' +
            '</div>';
        
        var placemark = new ymaps.Placemark(
            [loc.lat, loc.lon],
            { hintContent: loc.name, balloonContent: balloonHtml },
            { preset: iconPreset, iconColor: iconColor }
        );
        
        placemark.properties.set('locationId', loc.id);
        map.geoObjects.add(placemark);
        placemarks.push(placemark);
    }
}

// ==========================================
// ОСТАЛЬНЫЕ ФУНКЦИИ (без изменений, кроме глобальных)
// ==========================================
function setRoutePoints(pointIds) {
    routePointsIds = pointIds || [];
    loadPoints();
}

function clearRoutePoints() {
    routePointsIds = [];
    loadPoints();
}

function handlePointAction(pointId) {
    var loc = findLocationById(pointId);
    if (!loc) return;
    
    if (loc.locked && !isLockedAccessGranted) {
        showToast('🔒 ' + loc.name + ' требует приглашения. Позвоните на ресепшен.', 'warning', 4000);
        return;
    }
    
    var index = selectedPoints.indexOf(pointId);
    if (index > -1) {
        selectedPoints.splice(index, 1);
        showToast('❌ ' + loc.name + ' удалена', 'info', 2000);
    } else {
        if (selectedPoints.length < 6) {
            selectedPoints.push(pointId);
            showToast('✅ ' + loc.name + ' добавлена', 'success', 2000);
        } else {
            showToast('⚠️ Максимум 6 точек', 'error', 2000);
        }
    }
    loadPoints();
    updateButtons();
}
window.handlePointAction = handlePointAction;

function checkWeekend() {
    var today = new Date();
    var day = today.getDay();
    if (day === 0 || day === 6) {
        showToast('📅 Выходной. Возможна высокая загрузка.', 'warning', 5000);
    }
}

function setMood(mood) {
    if (isNavigating) {
        showToast('⛔ Сначала завершите прогулку', 'error', 3000);
        return;
    }
    currentMood = mood;
    var buttons = document.querySelectorAll('.mood-btn');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.toggle('active', buttons[i].dataset.mood === mood);
    }
    if (routePointsIds.length === 0) loadPoints();
}

// Глобальные функции
window.setRoutePoints = setRoutePoints;
window.clearRoutePoints = clearRoutePoints;
window.loadPoints = loadPoints;
window.setMood = setMood;
window.getUserLocation = getUserLocation;
window.initMap = initMap;

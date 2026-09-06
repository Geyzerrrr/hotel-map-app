// js/map/map.js
// Карта, метки, геолокация

var map = null;
var placemarks = [];
var routeLine = null;
var userMarker = null;
var userLocation = [55.955087, 36.374705]; // ПО УМОЛЧАНИЮ ОТЕЛЬ
var selectedPoints = [];
var currentMood = 'all';
var isLockedAccessGranted = false;
var routePointsIds = [];
var isGpsActive = false; // флаг: используем GPS или отель

// ==========================================
// ИНИЦИАЛИЗАЦИЯ КАРТЫ
// ==========================================
function initMap() {
    console.log('🗺️ initMap');
    if (typeof ymaps === 'undefined') {
        console.error('❌ ymaps не определен!');
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
        
        // Метка пользователя (по умолчанию — отель)
        addUserMarker(hotelLocation);
        
        loadPoints();
        updateButtons();
        checkWeekend();
        fetchRealWeather(hotelLocation[0], hotelLocation[1]);
        
    } catch (e) {
        console.error('❌ Ошибка карты:', e);
    }
}

// ==========================================
// ДОБАВЛЕНИЕ МЕТКИ ПОЛЬЗОВАТЕЛЯ
// ==========================================
function addUserMarker(location) {
    if (userMarker) {
        map.geoObjects.remove(userMarker);
    }
    userMarker = new ymaps.Placemark(
        location,
        { hintContent: isGpsActive ? '🚶 Вы здесь' : '🏨 Отель (старт)' },
        {
            preset: isGpsActive ? 'islands#blueCircleIcon' : 'islands#greenDotIcon',
            iconColor: isGpsActive ? '#1565C0' : '#2E7D32'
        }
    );
    map.geoObjects.add(userMarker);
}

// ==========================================
// ПОЛУЧЕНИЕ ГЕОЛОКАЦИИ (только по запросу)
// ==========================================
function getUserLocation(callback) {
    // Если GPS уже активен — просто возвращаем текущую позицию
    if (isGpsActive && userLocation) {
        if (callback) callback();
        return;
    }
    
    // Запрашиваем геолокацию
    if (navigator.geolocation) {
        showToast('📍 Определяем ваше местоположение...', 'info', 2000);
        navigator.geolocation.getCurrentPosition(
            function(pos) {
                userLocation = [pos.coords.latitude, pos.coords.longitude];
                isGpsActive = true;
                addUserMarker(userLocation);
                map.setCenter(userLocation, 17);
                if (callback) callback();
                showToast('✅ Ваше местоположение определено', 'success', 2000);
            },
            function() {
                // Если GPS недоступен — остаемся в отеле
                isGpsActive = false;
                userLocation = [55.955087, 36.374705];
                addUserMarker(userLocation);
                if (callback) callback();
                showToast('⚠️ Не удалось определить местоположение, используем отель', 'warning', 3000);
            },
            { enableHighAccuracy: true }
        );
    } else {
        isGpsActive = false;
        userLocation = [55.955087, 36.374705];
        addUserMarker(userLocation);
        if (callback) callback();
    }
}

// ==========================================
// СБРОС НА ОТЕЛЬ
// ==========================================
function resetToHotel() {
    isGpsActive = false;
    userLocation = [55.955087, 36.374705];
    addUserMarker(userLocation);
    if (map) {
        map.setCenter(userLocation, 17);
    }
    showToast('📍 Местоположение сброшено на отель', 'info', 2000);
}
window.resetToHotel = resetToHotel;

// ==========================================
// ЦЕНТРИРОВАНИЕ НА ПОЛЬЗОВАТЕЛЕ
// ==========================================
function centerOnUser() {
    if (isGpsActive && userLocation) {
        map.setCenter(userLocation, 17);
        showToast('📍 Возврат к вашему местоположению', 'info', 1500);
    } else {
        // Если GPS не активен — запрашиваем геолокацию
        getUserLocation(function() {
            if (userLocation) {
                map.setCenter(userLocation, 17);
            }
        });
    }
}
window.centerOnUser = centerOnUser;

// ==========================================
// ЗАГРУЗКА ТОЧЕК НА КАРТУ
// ==========================================
function loadPoints() {
    if (!map) return;
    
    var pointsToShow = [];
    
    if (routePointsIds.length > 0) {
        pointsToShow = LOCATIONS.filter(function(loc) {
            return loc.id === 1 || routePointsIds.indexOf(loc.id) !== -1;
        });
    } else {
        pointsToShow = LOCATIONS.filter(function(loc) {
            if (currentMood === 'all') return true;
            return loc.tags.indexOf(currentMood) !== -1;
        });
    }

    for (var i = 0; i < placemarks.length; i++) {
        map.geoObjects.remove(placemarks[i]);
    }
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
        
        var balloonHtml = 
            '<div class="point-card">' +
                (loc.photo ? '<img src="' + loc.photo + '" onerror="this.style.display=\'none\'">' : '') +
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
// ПОГОДА
// ==========================================
function fetchRealWeather(lat, lon) {
    var API_KEY = 'YOUR_API_KEY';
    var url = 'https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&units=metric&lang=ru&appid=' + API_KEY;
    
    if (API_KEY === 'YOUR_API_KEY') {
        document.getElementById('weatherTemp').textContent = '22°';
        document.getElementById('weatherIcon').textContent = '☀️';
        return;
    }
    
    fetch(url)
        .then(function(response) {
            if (!response.ok) throw new Error('Ошибка погоды');
            return response.json();
        })
        .then(function(data) {
            var temp = Math.round(data.main.temp);
            var icon = getWeatherEmoji(data.weather[0].icon);
            document.getElementById('weatherTemp').textContent = temp + '°';
            document.getElementById('weatherIcon').textContent = icon;
        })
        .catch(function(error) {
            document.getElementById('weatherTemp').textContent = '--°';
            document.getElementById('weatherIcon').textContent = '🌤️';
        });
}

function getWeatherEmoji(iconCode) {
    var emojis = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return emojis[iconCode] || '🌤️';
}

// ==========================================
// УПРАВЛЕНИЕ ТОЧКАМИ МАРШРУТА
// ==========================================
function setRoutePoints(pointIds) {
    routePointsIds = pointIds || [];
    loadPoints();
}

function clearRoutePoints() {
    routePointsIds = [];
    loadPoints();
}

// ==========================================
// ОСТАЛЬНЫЕ ФУНКЦИИ
// ==========================================
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
    if (routePointsIds.length === 0) {
        loadPoints();
    }
}

// ==========================================
// ДЕЛАЕМ ФУНКЦИИ ГЛОБАЛЬНЫМИ
// ==========================================
window.setRoutePoints = setRoutePoints;
window.clearRoutePoints = clearRoutePoints;
window.loadPoints = loadPoints;
window.setMood = setMood;
window.getUserLocation = getUserLocation;
window.initMap = initMap;
window.resetToHotel = resetToHotel;
window.centerOnUser = centerOnUser;

console.log('✅ map.js загружен');
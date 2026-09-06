// js/navigation/navigation.js
// НАВИГАЦИЯ ЧЕРЕЗ API ЯНДЕКСА (исправленная версия)

var isNavigating = false;
var currentRoutePoints = [];
var currentPointIndex = 0;
var arrived = false;
var trackingInterval = null;

// ==========================================
// ПОСТРОЕНИЕ МАРШРУТА (ЧЕРЕЗ ЯНДЕКС API)
// ==========================================
function buildRoute(theme) {
    // 1. Если навигация уже идет — запрещаем
    if (isNavigating) {
        showToast('⛔ Сначала завершите прогулку (нажмите "Пришли")', 'error', 3000);
        return;
    }

    // 2. Получаем геолокацию пользователя
    if (!userLocation) {
        getUserLocation(function() {
            buildRoute(theme);
        });
        return;
    }

    // 3. Определяем, какие точки брать
    var pointsToUse = [];

    if (theme && theme !== 'all' && theme !== 'undefined') {
        var filtered = LOCATIONS.filter(function(loc) {
            return loc.id !== 1 && loc.tags.indexOf(theme) !== -1 && (!loc.locked || isLockedAccessGranted);
        });
        // Перемешиваем
        for (var i = filtered.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = filtered[i];
            filtered[i] = filtered[j];
            filtered[j] = temp;
        }
        var count = Math.min(filtered.length, 3 + Math.floor(Math.random() * 2));
        for (var i = 0; i < count; i++) {
            pointsToUse.push(filtered[i]);
        }
        showToast('🌍 Строим маршрут по теме: ' + theme, 'info', 2000);
        
    } else if (selectedPoints && selectedPoints.length >= 2) {
        for (var i = 0; i < selectedPoints.length; i++) {
            var loc = findLocationById(selectedPoints[i]);
            if (loc) pointsToUse.push(loc);
        }
        showToast('🗺️ Маршрут по вашим точкам', 'info', 2000);
    } else {
        var allAvailable = LOCATIONS.filter(function(loc) {
            return loc.id !== 1 && (!loc.locked || isLockedAccessGranted);
        });
        for (var i = allAvailable.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = allAvailable[i];
            allAvailable[i] = allAvailable[j];
            allAvailable[j] = temp;
        }
        var count = Math.min(allAvailable.length, 3 + Math.floor(Math.random() * 2));
        for (var i = 0; i < count; i++) {
            pointsToUse.push(allAvailable[i]);
        }
        showToast('🎲 Случайный маршрут', 'info', 2000);
    }

    if (pointsToUse.length < 2) {
        showToast('⚠️ Недостаточно точек для маршрута', 'error', 3000);
        return;
    }

    // 4. Сохраняем ID точек для фильтрации на карте
    var routeIds = [];
    for (var i = 0; i < pointsToUse.length; i++) {
        routeIds.push(pointsToUse[i].id);
    }
    if (window.setRoutePoints) {
        window.setRoutePoints(routeIds);
    }

    // 5. ГОТОВИМ СПИСОК ТОЧЕК ДЛЯ ЯНДЕКСА
    // ПРАВИЛЬНЫЙ ФОРМАТ: массив объектов с координатами
    var waypoints = [];
    
    // СТАРТ: отель или текущее местоположение
    var startPoint = userLocation || [55.955087, 36.374705];
    waypoints.push({
        type: 'waypoint',
        point: startPoint
    });
    
    // ПРОМЕЖУТОЧНЫЕ ТОЧКИ
    for (var i = 0; i < pointsToUse.length; i++) {
        waypoints.push({
            type: 'waypoint',
            point: [pointsToUse[i].lat, pointsToUse[i].lon]
        });
    }
    
    // ФИНИШ: возврат в отель
    waypoints.push({
        type: 'waypoint',
        point: [55.955087, 36.374705]
    });

    // 6. ОТПРАВЛЯЕМ ЗАПРОС К ЯНДЕКСУ
    showToast('⏳ Строим маршрут...', 'info', 3000);
    
    ymaps.route(waypoints, {
        routingMode: 'auto',
        multiRoute: true,
        avoidTraffic: false
    }).then(function(route) {
        // Успешно получили маршрут
        var routePoints = [];
        var paths = route.getPaths();
        
        for (var i = 0; i < paths.getLength(); i++) {
            var path = paths.get(i);
            var segments = path.getSegments();
            for (var j = 0; j < segments.getLength(); j++) {
                var segment = segments.get(j);
                var coords = segment.getCoordinates();
                for (var k = 0; k < coords.length; k++) {
                    routePoints.push(coords[k]);
                }
            }
        }
        
        if (routePoints.length < 3) {
            showToast('⚠️ Маршрут слишком короткий, используем прямые линии', 'warning', 3000);
            buildFallbackRoute(waypoints);
            return;
        }
        
        currentRoutePoints = routePoints;
        currentPointIndex = 0;
        arrived = false;

        // Удаляем старую линию маршрута
        if (routeLine) {
            map.geoObjects.remove(routeLine);
            routeLine = null;
        }

        routeLine = new ymaps.Polyline(
            routePoints,
            { hintContent: '🚶 Маршрут от Яндекса' },
            {
                strokeColor: '#2E7D32',
                strokeWidth: 6,
                strokeOpacity: 0.9,
                strokeStyle: 'solid'
            }
        );
        map.geoObjects.add(routeLine);

        try {
            map.setBounds(route.getBounds(), { checkZoomRange: true, zoomMargin: 30 });
        } catch(e) {
            // Если не удалось установить bounds - центрируем на первой точке
            if (routePoints.length > 0) {
                map.setCenter(routePoints[0], 15);
            }
        }

        // Получаем информацию о маршруте
        var distance = 0;
        var time = 0;
        try {
            distance = route.getPaths().get(0).getProperties().get('distance') || 0;
            time = route.getPaths().get(0).getProperties().get('duration') || 0;
        } catch(e) {
            distance = calculateDistance(routePoints);
            time = Math.round(distance / 4.5 * 60);
        }
        
        var distanceKm = (distance / 1000).toFixed(1);
        var timeStr = formatTime(Math.round(time / 60));

        selectedPoints = [];
        if (window.loadPoints) {
            window.loadPoints();
        }

        showToast(
            '✅ Маршрут построен!\n📏 ' + distanceKm + ' км • ⏱️ ' + timeStr + ' • ' + pointsToUse.length + ' точек',
            'success',
            5000
        );

        updateButtons();

    }).catch(function(error) {
        console.error('Ошибка построения маршрута:', error);
        showToast('⚠️ Не удалось построить маршрут. Используем прямые линии.', 'error', 4000);
        buildFallbackRoute(waypoints);
    });
}

// ==========================================
// ЗАПАСНОЙ ВАРИАНТ (прямые линии)
// ==========================================
function buildFallbackRoute(waypoints) {
    var routePoints = [];
    // Извлекаем координаты из waypoints
    var coords = [];
    for (var i = 0; i < waypoints.length; i++) {
        if (waypoints[i].point) {
            coords.push(waypoints[i].point);
        } else if (Array.isArray(waypoints[i])) {
            coords.push(waypoints[i]);
        }
    }
    
    if (coords.length < 2) {
        showToast('⚠️ Недостаточно точек для маршрута', 'error', 3000);
        return;
    }
    
    for (var i = 0; i < coords.length - 1; i++) {
        var start = coords[i];
        var end = coords[i + 1];
        if (!start || !end) continue;
        for (var t = 0; t <= 20; t++) {
            var frac = t / 20;
            var lat = start[0] + (end[0] - start[0]) * frac;
            var lon = start[1] + (end[1] - start[1]) * frac;
            routePoints.push([lat, lon]);
        }
    }
    
    if (routePoints.length < 3) {
        showToast('⚠️ Не удалось построить даже прямой маршрут', 'error', 3000);
        return;
    }
    
    currentRoutePoints = routePoints;
    currentPointIndex = 0;
    arrived = false;
    
    if (routeLine) {
        map.geoObjects.remove(routeLine);
        routeLine = null;
    }
    
    routeLine = new ymaps.Polyline(
        routePoints,
        { hintContent: '🚶 Прямой маршрут' },
        {
            strokeColor: '#FF6F00',
            strokeWidth: 4,
            strokeOpacity: 0.8,
            strokeStyle: 'dash'
        }
    );
    map.geoObjects.add(routeLine);
    
    try {
        map.setBounds(routeLine.geometry.getBounds(), { checkZoomRange: true, zoomMargin: 30 });
    } catch(e) {}
    
    updateButtons();
    showToast('⚠️ Используется прямой маршрут (без дорог)', 'warning', 3000);
}

// ==========================================
// РЕКОМЕНДУЕМЫЕ МАРШРУТЫ
// ==========================================
function buildRecommendedRoute(routeId) {
    if (routeLine) {
        map.geoObjects.remove(routeLine);
        routeLine = null;
    }
    
    var theme = '';
    if (routeId === 1) {
        theme = 'water';
        showToast('🌊 Строим маршрут к озерам...', 'info', 2000);
    } else if (routeId === 2) {
        theme = 'forest';
        showToast('🌲 Строим маршрут по лесу...', 'info', 2000);
    } else if (routeId === 3) {
        showToast('🔒 Закрытая роща доступна по приглашению. Нажмите "Позвонить"', 'warning', 4000);
        return;
    }
    if (theme) {
        buildRoute(theme);
    }
}

// ==========================================
// НАВИГАЦИЯ (ПОШЛИ)
// ==========================================
function startNavigation() {
    if (currentRoutePoints.length < 2) {
        showToast('⚠️ Сначала постройте маршрут', 'error', 3000);
        return;
    }
    if (isNavigating) return;
    
    isNavigating = true;
    currentPointIndex = 0;
    arrived = false;
    
    document.getElementById('navInfo').classList.add('show');
    updateButtons();
    showToast('🚶 Начинаем прогулку!', 'success', 3000);
    
    if (trackingInterval) clearInterval(trackingInterval);
    
    // Функция обновления позиции
    var updatePosition = function() {
        if (!isNavigating) {
            if (trackingInterval) clearInterval(trackingInterval);
            return;
        }
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function(pos) {
                    var newPos = [pos.coords.latitude, pos.coords.longitude];
                    userLocation = newPos;
                    isGpsActive = true;
                    
                    // Обновляем маркер пользователя
                    if (userMarker) {
                        map.geoObjects.remove(userMarker);
                    }
                    userMarker = new ymaps.Placemark(
                        newPos,
                        { hintContent: '🚶 Вы здесь' },
                        { preset: 'islands#blueCircleIcon' }
                    );
                    map.geoObjects.add(userMarker);
                    
                    // Проверяем, достигли ли мы следующей точки
                    if (currentPointIndex < currentRoutePoints.length - 1) {
                        var nextPoint = currentRoutePoints[Math.min(currentPointIndex + 2, currentRoutePoints.length - 1)];
                        if (nextPoint) {
                            var dist = getDistance(newPos, nextPoint);
                            if (dist < 0.015) { // ~15 метров
                                currentPointIndex = Math.min(currentPointIndex + 2, currentRoutePoints.length - 1);
                            }
                        }
                    }
                    
                    // Проверяем, не достигли ли конца маршрута
                    if (currentPointIndex >= currentRoutePoints.length - 2) {
                        var endPoint = currentRoutePoints[currentRoutePoints.length - 1];
                        var distToEnd = getDistance(newPos, endPoint);
                        if (distToEnd < 0.020) { // ~20 метров до отеля
                            arrived = true;
                            isNavigating = false;
                            if (trackingInterval) clearInterval(trackingInterval);
                            document.getElementById('navInfo').classList.remove('show');
                            updateButtons();
                            showToast('🎉 Вы вернулись в отель! Нажмите "Пришли"', 'success', 4000);
                            return;
                        }
                    }
                    
                    // Обновляем информацию о расстоянии
                    var remaining = 0;
                    var startIdx = Math.min(currentPointIndex, currentRoutePoints.length - 1);
                    for (var i = startIdx; i < currentRoutePoints.length - 1; i++) {
                        remaining += getDistance(currentRoutePoints[i], currentRoutePoints[i + 1]);
                    }
                    document.getElementById('remainingDistance').textContent = remaining.toFixed(1);
                    
                    // Определяем название ближайшей точки
                    var nearestName = '🏁 Отель';
                    if (currentPointIndex < currentRoutePoints.length - 2) {
                        var nextPoint = currentRoutePoints[Math.min(currentPointIndex + 2, currentRoutePoints.length - 1)];
                        var minDist = Infinity;
                        for (var i = 0; i < LOCATIONS.length; i++) {
                            var loc = LOCATIONS[i];
                            var d = getDistance(nextPoint, [loc.lat, loc.lon]);
                            if (d < minDist && loc.id !== 1) {
                                minDist = d;
                                nearestName = loc.name;
                            }
                        }
                    }
                    document.getElementById('nextPointName').textContent = nearestName;
                },
                function(err) {
                    console.warn('Ошибка геолокации:', err);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        }
    };
    
    // Первое обновление
    updatePosition();
    // Запускаем интервал
    trackingInterval = setInterval(updatePosition, 3000);
}

// ==========================================
// ЗАВЕРШЕНИЕ ПРОГУЛКИ
// ==========================================
function arrive() {
    if (currentRoutePoints.length < 2) {
        showToast('⚠️ Сначала постройте маршрут', 'error', 3000);
        return;
    }
    if (isNavigating) {
        if (confirm('Вы вернулись в отель?')) {
            isNavigating = false;
            arrived = false;
            if (trackingInterval) clearInterval(trackingInterval);
            document.getElementById('navInfo').classList.remove('show');
            document.getElementById('ratingModal').classList.remove('hidden');
            updateButtons();
        }
        return;
    }
    document.getElementById('ratingModal').classList.remove('hidden');
}

// ==========================================
// СБРОС
// ==========================================
function resetRoute() {
    if (isNavigating) {
        if (!confirm('⛔ Прогулка будет прервана?')) return;
    }
    isNavigating = false;
    arrived = false;
    if (trackingInterval) clearInterval(trackingInterval);
    document.getElementById('navInfo').classList.remove('show');
    
    if (routeLine) {
        map.geoObjects.remove(routeLine);
        routeLine = null;
    }
    
    if (window.clearRoutePoints) {
        window.clearRoutePoints();
    }
    
    selectedPoints = [];
    currentRoutePoints = [];
    currentPointIndex = 0;
    
    if (window.loadPoints) {
        window.loadPoints();
    }
    
    updateButtons();
    showToast('🔄 Маршрут сброшен', 'info', 2000);
}

// ==========================================
// ОЦЕНКА
// ==========================================
function saveRating(rating) {
    document.getElementById('ratingModal').classList.add('hidden');
    var messages = {
        'good': '😊 Отлично! Рады, что вам понравилось!',
        'normal': '😐 Спасибо за честную оценку!',
        'bad': '😞 Спасибо, учтём ваши пожелания!'
    };
    showToast(messages[rating] || 'Спасибо!', 'success', 3000);
    setTimeout(function() { resetRoute(); }, 500);
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================
function getDistance(p1, p2) {
    if (!p1 || !p2) return 0;
    var dx = (p1[0] - p2[0]) * 111;
    var dy = (p1[1] - p2[1]) * 111 * Math.cos((p1[0] + p2[0]) / 2 * 0.01745);
    return Math.sqrt(dx * dx + dy * dy);
}

function calculateDistance(points) {
    var total = 0;
    for (var i = 0; i < points.length - 1; i++) {
        total += getDistance(points[i], points[i + 1]);
    }
    return total;
}

function formatTime(minutes) {
    if (!minutes || minutes < 0) return '0 мин';
    if (minutes < 60) return Math.round(minutes) + ' мин';
    var h = Math.floor(minutes / 60);
    var m = Math.round(minutes % 60);
    return h + ' ч ' + m + ' мин';
}

// ==========================================
// ДЕЛАЕМ ФУНКЦИИ ГЛОБАЛЬНЫМИ
// ==========================================
window.buildRoute = buildRoute;
window.buildRecommendedRoute = buildRecommendedRoute;
window.startNavigation = startNavigation;
window.arrive = arrive;
window.resetRoute = resetRoute;
window.saveRating = saveRating;

console.log('✅ navigation.js загружен');

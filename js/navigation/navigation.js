// js/navigation/navigation.js
var isNavigating = false;
var currentRoutePoints = [];
var currentPointIndex = 0;
var arrived = false;
var trackingInterval = null;

function buildRoute(theme) {
    if (isNavigating) {
        showToast('⛔ Сначала завершите прогулку (нажмите "Пришли")', 'error', 3000);
        return;
    }

    if (!userLocation) {
        getUserLocation(function() { buildRoute(theme); });
        return;
    }

    var pointsToUse = [];

    if (theme && theme !== 'all' && theme !== 'undefined') {
        var filtered = LOCATIONS.filter(function(loc) {
            return loc.id !== 1 && loc.tags.indexOf(theme) !== -1 && (!loc.locked || isLockedAccessGranted);
        });
        // перемешиваем
        for (var i = filtered.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = filtered[i]; filtered[i] = filtered[j]; filtered[j] = temp;
        }
        var count = Math.min(filtered.length, 3 + Math.floor(Math.random() * 2));
        for (var i = 0; i < count; i++) pointsToUse.push(filtered[i]);
    } else if (selectedPoints && selectedPoints.length >= 2) {
        for (var i = 0; i < selectedPoints.length; i++) {
            var loc = findLocationById(selectedPoints[i]);
            if (loc) pointsToUse.push(loc);
        }
    } else {
        var allAvailable = LOCATIONS.filter(function(loc) {
            return loc.id !== 1 && (!loc.locked || isLockedAccessGranted);
        });
        // перемешиваем
        for (var i = allAvailable.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = allAvailable[i]; allAvailable[i] = allAvailable[j]; allAvailable[j] = temp;
        }
        var count = Math.min(allAvailable.length, 3 + Math.floor(Math.random() * 2));
        for (var i = 0; i < count; i++) pointsToUse.push(allAvailable[i]);
    }

    if (pointsToUse.length < 2) {
        showToast('⚠️ Недостаточно точек для маршрута', 'error', 3000);
        return;
    }

    var routeIds = [];
    for (var i = 0; i < pointsToUse.length; i++) routeIds.push(pointsToUse[i].id);
    if (window.setRoutePoints) window.setRoutePoints(routeIds);

    showToast('⏳ Строим маршрут по дорогам...', 'info', 3000);
    
    // ✅ ГЛАВНОЕ ИСПРАВЛЕНИЕ: Проверяем ROADS и передаем их в функцию!
    if (typeof findPathOnRoads === 'function' && window.ROADS && window.ROADS.length > 0) {
        try {
            var allRoutePoints = [];
            var currentPoint = userLocation;
            
            for (var i = 0; i < pointsToUse.length; i++) {
                var targetPoint = [pointsToUse[i].lat, pointsToUse[i].lon];
                
                // Передаем window.ROADS третьим аргументом!
                var segment = findPathOnRoads(currentPoint, targetPoint, window.ROADS);
                
                if (i === 0) {
                    allRoutePoints = allRoutePoints.concat(segment);
                } else {
                    for (var j = 1; j < segment.length; j++) allRoutePoints.push(segment[j]);
                }
                currentPoint = targetPoint;
            }
            
            var hotelPoint = [55.955087, 36.374705];
            var returnSegment = findPathOnRoads(currentPoint, hotelPoint, window.ROADS);
            for (var j = 1; j < returnSegment.length; j++) allRoutePoints.push(returnSegment[j]);
            
            if (allRoutePoints.length > 2) {
                currentRoutePoints = allRoutePoints;
                currentPointIndex = 0;
                arrived = false;

                if (routeLine) {
                    map.geoObjects.remove(routeLine);
                    routeLine = null;
                }

                routeLine = new ymaps.Polyline(
                    allRoutePoints,
                    { hintContent: '🚶 Ваш маршрут' },
                    { strokeColor: '#2E7D32', strokeWidth: 6, strokeOpacity: 0.9, strokeStyle: 'solid' }
                );
                map.geoObjects.add(routeLine);

                try {
                    map.setBounds(routeLine.geometry.getBounds(), { checkZoomRange: true, zoomMargin: 30 });
                } catch(e) {
                    if (allRoutePoints.length > 0) map.setCenter(allRoutePoints[0], 15);
                }

                var distance = calculateDistance(allRoutePoints);
                var time = Math.round(distance / 4.5 * 60);
                var distanceKm = distance.toFixed(1);
                var timeStr = formatTime(time);

                selectedPoints = [];
                if (window.loadPoints) window.loadPoints();

                showToast('✅ Маршрут построен! 📏 ' + distanceKm + ' км • ⏱️ ' + timeStr + ' • ' + pointsToUse.length + ' точек', 'success', 5000);

                updateButtons();
                return;
            }
        } catch(e) {
            console.error('Ошибка построения маршрута:', e);
        }
    } else {
        console.warn('❌ window.ROADS пуст! Маршрут не может быть построен.');
    }
    
    // Запасной вариант
    showToast('⚠️ Не удалось построить маршрут по дорогам, используем прямые линии', 'warning', 3000);
    buildFallbackRoute(pointsToUse);
}

// ... (остальные функции buildFallbackRoute, startNavigation, arrive, resetRoute, saveRating оставляем без изменений, они не вызывают ошибок)

function buildFallbackRoute(pointsToUse) {
    var waypoints = [userLocation];
    for (var i = 0; i < pointsToUse.length; i++) waypoints.push([pointsToUse[i].lat, pointsToUse[i].lon]);
    waypoints.push([55.955087, 36.374705]);
    
    var routePoints = [];
    for (var i = 0; i < waypoints.length - 1; i++) {
        var start = waypoints[i];
        var end = waypoints[i + 1];
        if (!start || !end) continue;
        for (var t = 0; t <= 20; t++) {
            var frac = t / 20;
            routePoints.push([start[0] + (end[0] - start[0]) * frac, start[1] + (end[1] - start[1]) * frac]);
        }
    }
    
    if (routePoints.length < 3) {
        showToast('⚠️ Не удалось построить маршрут', 'error', 3000);
        return;
    }
    
    currentRoutePoints = routePoints;
    currentPointIndex = 0;
    arrived = false;
    
    if (routeLine) map.geoObjects.remove(routeLine);
    routeLine = new ymaps.Polyline(routePoints, { hintContent: '🚶 Прямой маршрут' }, { strokeColor: '#FF6F00', strokeWidth: 4, strokeOpacity: 0.8, strokeStyle: 'dash' });
    map.geoObjects.add(routeLine);
    
    try { map.setBounds(routeLine.geometry.getBounds(), { checkZoomRange: true, zoomMargin: 30 }); } catch(e) {}
    
    updateButtons();
    showToast('⚠️ Используется прямой маршрут (без дорог)', 'warning', 3000);
}

// Остальной код (startNavigation, arrive, resetRoute, saveRating, calculateDistance и т.д.) оставьте как был
// Не забудьте только в конце сделать window.buildRoute = buildRoute; и т.д.
window.buildRoute = buildRoute;
window.buildRecommendedRoute = buildRecommendedRoute;
window.startNavigation = startNavigation;
window.arrive = arrive;
window.resetRoute = resetRoute;
window.saveRating = saveRating;

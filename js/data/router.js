// js/core/router.js
// Поиск пути по дорогам (A*) — ИСПРАВЛЕННАЯ ВЕРСИЯ

// ==========================================
// ПОИСК ПУТИ ПО ДОРОГАМ (ОСНОВНАЯ ФУНКЦИЯ)
// ==========================================
function findPathOnRoads(start, end) {
    // 1. Находим ближайшие точки на дорогах
    var startNode = findNearestRoadPoint(start);
    var endNode = findNearestRoadPoint(end);
    
    // 2. Если точки уже на дороге или рядом — используем их
    if (!startNode || !endNode) {
        return [start, end];
    }
    
    // 3. Строим полный граф дорог
    var graph = buildGraph();
    
    // 4. Ищем путь A*
    var path = findPathAStar(graph, startNode, endNode);
    
    // 5. Если путь не найден — пробуем соединить через промежуточные точки
    if (path.length < 2) {
        // Пытаемся найти путь через все узлы
        var allNodes = getAllRoadNodes();
        var bestPath = null;
        var bestDist = Infinity;
        
        for (var i = 0; i < allNodes.length; i++) {
            var testPath = findPathAStar(graph, startNode, allNodes[i]);
            if (testPath.length > 1) {
                var testPath2 = findPathAStar(graph, allNodes[i], endNode);
                if (testPath2.length > 1) {
                    var combined = testPath.concat(testPath2.slice(1));
                    var dist = calculateDistance(combined);
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestPath = combined;
                    }
                }
            }
        }
        
        if (bestPath && bestPath.length > 1) {
            path = bestPath;
        } else {
            // Если всё равно нет пути — соединяем прямой линией
            return [start, end];
        }
    }
    
    // 6. Добавляем начальную и конечную точки
    var result = [start];
    for (var i = 0; i < path.length; i++) {
        result.push(path[i]);
    }
    result.push(end);
    
    return result;
}

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================

// Поиск ближайшей точки на дороге
function findNearestRoadPoint(point) {
    var minDist = Infinity;
    var nearest = null;
    
    for (var i = 0; i < ROADS.length; i++) {
        var road = ROADS[i];
        var dist1 = getDistance(point, road.from);
        var dist2 = getDistance(point, road.to);
        
        if (dist1 < minDist) {
            minDist = dist1;
            nearest = road.from;
        }
        if (dist2 < minDist) {
            minDist = dist2;
            nearest = road.to;
        }
    }
    
    return nearest;
}

// Получить все уникальные узлы дорог
function getAllRoadNodes() {
    var nodes = [];
    var seen = {};
    
    for (var i = 0; i < ROADS.length; i++) {
        var road = ROADS[i];
        var key1 = road.from[0].toFixed(6) + ',' + road.from[1].toFixed(6);
        var key2 = road.to[0].toFixed(6) + ',' + road.to[1].toFixed(6);
        
        if (!seen[key1]) {
            seen[key1] = true;
            nodes.push(road.from);
        }
        if (!seen[key2]) {
            seen[key2] = true;
            nodes.push(road.to);
        }
    }
    
    return nodes;
}

// ==========================================
// ПОСТРОЕНИЕ ГРАФА
// ==========================================
function buildGraph() {
    var graph = {};
    
    for (var i = 0; i < ROADS.length; i++) {
        var road = ROADS[i];
        var fromKey = road.from[0].toFixed(6) + ',' + road.from[1].toFixed(6);
        var toKey = road.to[0].toFixed(6) + ',' + road.to[1].toFixed(6);
        
        if (!graph[fromKey]) graph[fromKey] = {};
        if (!graph[toKey]) graph[toKey] = {};
        
        var dist = getDistance(road.from, road.to);
        graph[fromKey][toKey] = dist;
        graph[toKey][fromKey] = dist;
    }
    
    return graph;
}

// ==========================================
// АЛГОРИТМ A*
// ==========================================
function findPathAStar(graph, start, end) {
    var startKey = start[0].toFixed(6) + ',' + start[1].toFixed(6);
    var endKey = end[0].toFixed(6) + ',' + end[1].toFixed(6);
    
    if (!graph[startKey] || !graph[endKey]) {
        return [start, end];
    }
    
    var openSet = [startKey];
    var cameFrom = {};
    var gScore = {};
    var fScore = {};
    
    for (var key in graph) {
        gScore[key] = Infinity;
        fScore[key] = Infinity;
    }
    
    gScore[startKey] = 0;
    fScore[startKey] = getDistance(start, end);
    
    while (openSet.length > 0) {
        var current = openSet[0];
        var minIdx = 0;
        for (var i = 1; i < openSet.length; i++) {
            if (fScore[openSet[i]] < fScore[current]) {
                current = openSet[i];
                minIdx = i;
            }
        }
        
        if (current === endKey) {
            var path = [end];
            var c = current;
            while (cameFrom[c]) {
                c = cameFrom[c];
                var coords = c.split(',');
                path.unshift([parseFloat(coords[0]), parseFloat(coords[1])]);
            }
            path.unshift(start);
            return path;
        }
        
        openSet.splice(minIdx, 1);
        
        var neighbors = graph[current];
        for (var neighbor in neighbors) {
            var tentativeG = gScore[current] + neighbors[neighbor];
            
            if (tentativeG < gScore[neighbor]) {
                cameFrom[neighbor] = current;
                gScore[neighbor] = tentativeG;
                var nCoords = neighbor.split(',');
                fScore[neighbor] = tentativeG + getDistance(
                    [parseFloat(nCoords[0]), parseFloat(nCoords[1])], 
                    end
                );
                
                if (openSet.indexOf(neighbor) === -1) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    
    return [start, end];
}

// ==========================================
// РАСЧЕТ РАССТОЯНИЯ
// ==========================================
function getDistance(p1, p2) {
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
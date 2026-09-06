// js/core/utils.js
// Вспомогательные функции

function getDistance(p1, p2) {
    var dx = (p1[0] - p2[0]) * 111;
    var dy = (p1[1] - p2[1]) * 111 * Math.cos((p1[0] + p2[0]) / 2 * 0.01745);
    return Math.sqrt(dx * dx + dy * dy);
}

function findLocationById(id) {
    for (var i = 0; i < LOCATIONS.length; i++) {
        if (LOCATIONS[i].id === id) return LOCATIONS[i];
    }
    return null;
}

function formatTime(minutes) {
    if (minutes < 60) return minutes + ' мин';
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return h + ' ч ' + m + ' мин';
}

function calculateDistance(points) {
    var total = 0;
    for (var i = 0; i < points.length - 1; i++) {
        total += getDistance(points[i], points[i + 1]);
    }
    return total;
}
function formatTime(minutes) {
    if (minutes < 60) return minutes + ' мин';
    var h = Math.floor(minutes / 60);
    var m = minutes % 60;
    return h + ' ч ' + m + ' мин';
}
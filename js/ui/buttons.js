// js/ui/buttons.js
// Обновление состояния кнопок

function updateButtons() {
    var goBtn = document.getElementById('goBtn');
    var arriveBtn = document.getElementById('arriveBtn');
    if (isNavigating) {
        goBtn.textContent = '🚶 Идём...';
        goBtn.classList.add('active');
        goBtn.disabled = false;
    } else {
        goBtn.textContent = '🚶 Пошли';
        goBtn.classList.remove('active');
        goBtn.disabled = (currentRoutePoints.length < 2);
    }
    arriveBtn.disabled = (currentRoutePoints.length < 2);
}
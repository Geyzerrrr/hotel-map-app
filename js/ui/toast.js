// js/ui/toast.js
// Всплывающие уведомления

function showToast(message, type, duration) {
    type = type || 'info';
    duration = duration || 4000;
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    var closeBtn = document.createElement('button');
    closeBtn.className = 'close-toast';
    closeBtn.textContent = '✕';
    closeBtn.onclick = function() {
        toast.classList.remove('show');
        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 400);
    };
    toast.appendChild(closeBtn);
    container.appendChild(toast);
    setTimeout(function() { toast.classList.add('show'); }, 50);
    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() { if (toast.parentNode) toast.remove(); }, 400);
    }, duration);
}

function callManager() {
    showToast('📞 Набираем ресепшен...', 'info', 2000);
    setTimeout(function() {
        if (confirm('Связаться с менеджером?')) {
            window.location.href = 'tel:+79991234567';
        }
    }, 500);
}
let currentHours = 0;
let currentMinutes = 0;
let defaultHours = 0;
let defaultMinutes = 0;

function getDefaultTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 20);
    return {
        hours: now.getHours(),
        minutes: now.getMinutes()
    };
}

function initializeTime() {
    const defaultTime = getDefaultTime();
    defaultHours = defaultTime.hours;
    defaultMinutes = defaultTime.minutes;
    currentHours = defaultHours;
    currentMinutes = defaultMinutes;
    return { hours: currentHours, minutes: currentMinutes };
}

function createWheel(elementId, min, max, initialValue) {
    const wheel = document.getElementById(elementId + 'Wheel');
    const row = document.getElementById(elementId + 'Row');
    const totalVisible = 7;

    let currentValue = initialValue;
    let currentPosition = 3;

    function updateWheel() {
        while (row.firstChild) row.removeChild(row.firstChild);

        for (let i = -3; i <= 3; i++) {
            const value = (currentValue + i + (max - min + 1)) % (max - min + 1) + min;
            const digit = document.createElement('span');
            digit.className = 'time-digit';
            digit.textContent = String(value).padStart(2, '0');

            if (i === 0) {
                digit.classList.add('selected');
            }

            row.appendChild(digit);
        }

        row.style.transform = `translateY(${60 - (currentPosition * 40)}px)`;

        if (elementId === 'hours') {
            currentHours = currentValue;
        } else if (elementId === 'minutes') {
            currentMinutes = currentValue;
        }

        updateOrderTime();
    }

    function handleScroll(deltaY) {
        if (deltaY < 0) {
            if (currentValue < max) {
                currentValue++;
            } else {
                currentValue = min;
            }
        } else {
            if (currentValue > min) {
                currentValue--;
            } else {
                currentValue = max;
            }
        }

        updateWheel();
    }

    wheel.addEventListener('wheel', (e) => {
        e.preventDefault();
        handleScroll(e.deltaY);
    });

    let startY = 0;
    let isScrolling = false;

    wheel.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isScrolling = true;
    });

    wheel.addEventListener('touchmove', (e) => {
        if (!isScrolling) return;
        e.preventDefault();

        const currentY = e.touches[0].clientY;
        const deltaY = startY - currentY;

        if (Math.abs(deltaY) > 10) {
            handleScroll(deltaY);
            startY = currentY;
        }
    });

    wheel.addEventListener('touchend', () => {
        isScrolling = false;
    });

    updateWheel();
}

function updateOrderTime() {
    const orderTimeElement = document.getElementById('orderTime');
    orderTimeElement.textContent = `Заказ к времени: ${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
}

function resetToDefaultTime() {
    const defaultTime = getDefaultTime();
    currentHours = defaultTime.hours;
    currentMinutes = defaultTime.minutes;
    updateOrderTime();

    document.getElementById('hoursRow').innerHTML = '';
    document.getElementById('minutesRow').innerHTML = '';
    createWheel('hours', 0, 23, defaultTime.hours);
    createWheel('minutes', 0, 59, defaultTime.minutes);
}

const { hours, minutes } = initializeTime();
createWheel('hours', 0, 23, hours);
createWheel('minutes', 0, 59, minutes);

const toggle = document.getElementById('timeToggle');
const timePicker = document.getElementById('timePicker');
toggle.addEventListener('change', function() {
    if (this.checked) {
        // Включаем кастомное время - показываем пикер
        timePicker.classList.add('active');
        updateOrderTime();
    } else {
        // Выключаем - скрываем пикер и сбрасываем на время по умолчанию
        timePicker.classList.remove('active');
        resetToDefaultTime();
    }
});

// Инициализируем с дефолтным временем при загрузке
updateOrderTime();
let originalPhone;
let new_phone = '';
const phoneProfileInput = document.getElementById('userPhone');

function formatPhone(phone) {
    // Убираем всё кроме цифр
    const digits = phone.replace(/\D/g, '');

    // Проверяем, что номер из 11 цифр и начинается с 7 или 8
    if (digits.length !== 11 || !['7', '8'].includes(digits[0])) return phone;

    const core = digits.slice(1); // 10 последних цифр
    const formatted = `+7 (${core.slice(0, 3)}) ${core.slice(3, 6)}-${core.slice(6, 8)}-${core.slice(8, 10)}`;
    return formatted;
}

async function enableEditing(elementId) {
    const element = document.getElementById(elementId);
    const saveButtonId = elementId === 'userFio' ? 'saveName' : 'savePhone';
    const saveButton = document.getElementById(saveButtonId);

    // Включаем редактирование
    element.contentEditable = true;
    element.focus();
    element.classList.add('editing');
    saveButton.classList.add('visible');

    // Если редактируем телефон — активируем IMask
    if (elementId === 'userPhone') {
        // Создаём временный input внутри div для IMask
        const input = document.createElement('input');
        input.type = 'text';
        input.value = element.textContent.trim();
        input.className = 'phone-temp-input';
        element.replaceWith(input);
        input.focus();

        // Применяем IMask
        phoneMaskInstance = IMask(input, {
            mask: '+{7} (000) 000-00-00',
        });

        // При нажатии Enter — сохраняем
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                savePhoneEditing();
            }
        });
    } else {
        // Для имени — обработка Enter
        element.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEditing(elementId, saveButtonId);
            }
        });
    }
}

// Функция для сохранения изменений имени
function saveEditing(elementId, saveButtonId) {
    const element = document.getElementById(elementId);
    const saveButton = document.getElementById(saveButtonId);

    // Выключаем редактирование
    element.contentEditable = false;
    element.classList.remove('editing');

    // Скрываем кнопку сохранения
    saveButton.classList.remove('visible');

    // Сохраняем данные
    console.log(`Сохранено имя: ${element.textContent}`);
}
function nonSaveEditing(elementId, saveButtonId) {
    const element = document.getElementById(elementId);
    element.innerText = localStorage.getItem("phone");
    const saveButton = document.getElementById(saveButtonId);

    // Выключаем редактирование
    element.contentEditable = false;
    element.classList.remove('editing');

    // Скрываем кнопку сохранения
    saveButton.classList.remove('visible');

    // Сохраняем данные
    console.log(`Сохранено имя: ${element.textContent}`);
}

// Функция для сохранения изменений телефона
async function savePhoneEditing() {
    const input = document.querySelector('.phone-temp-input');
    const saveButton = document.getElementById('savePhone');
    const newPhone = input.value.replace(/\D/g, '');

    // Создаём обратно div
    const phoneDiv = document.createElement('div');
    phoneDiv.className = 'profile-phone';
    phoneDiv.id = 'userPhone';
    phoneDiv.textContent = input.value;

    // Заменяем input обратно на div
    input.replaceWith(phoneDiv);

    if (newPhone !== originalPhone) {
        const verify = await sendVerify(newPhone);
        if (verify) {
            saveButton.classList.remove('visible');
            phoneDiv.classList.remove('editing');

            const verificationBlock = document.getElementById('verificationBlock');
            verificationBlock.classList.add('visible');

            startCountdown();
            console.log(`SMS с кодом отправлена на номер: ${newPhone}`);

            originalPhone = newPhone;
            new_phone = newPhone;
        } else {
            showNotification('Данный номер уже зарегистрирован');
            nonSaveEditing('userPhone', 'savePhone');
        }
    } else {
        saveEditing('userPhone', 'savePhone');
    }
}

async function startCountdown() {
    timeLeft = 30;
    const timerElement = document.getElementById('verificationTimer');
    const resendButton = document.getElementById('verificationResend');

    // Скрываем кнопку и показываем таймер
    resendButton.classList.remove('visible');
    timerElement.style.display = 'block';

    // Обновляем таймер каждую секунду
    countdown = setInterval(() => {
        timeLeft--;
        timerElement.textContent = `Отправить код повторно через 0:${timeLeft.toString().padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(countdown);
            timerElement.style.display = 'none';
            resendButton.classList.add('visible');
        }
    }, 1000);
}

// Функция для повторной отправки кода
function resendVerificationCode() {
    const phoneElement = document.getElementById('userPhone');
    console.log(`SMS с кодом повторно отправлена на номер: ${phoneElement.textContent}`);
    startCountdown();
}

async function sendVerify(phone) {
    return fetch(`${host}/api/v1/verify/phone/send`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
    })
        .then(response => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                if (data.call_id) {
                    localStorage.setItem('call_id', data.call_id);
                    return true;
                }
            }
            return null;
        });
}

async function checkVerify(phone, code) {
    const token = localStorage.getItem("access_token");
    const call_id = localStorage.getItem("call_id");
    return fetch(`${host}/api/v1/phone/change`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ phone, call_id, code })
    })
        .then(response => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                if (data.access_token) {

                    const formattedPhone = formatPhone(phone);
                    localStorage.setItem("phone", formattedPhone);
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);
                    return true;
                }
            }
            return false;
        });
}

// Обработчик ввода кода подтверждения
document.getElementById('verificationCode').addEventListener('input', async function (e) {
    const code = e.target.value;

    if (code.length === 4 && /^\d+$/.test(code)) {
        const result = await checkVerify(new_phone, code);
        if (result) {
            // В реальном приложении здесь будет проверка кода через API
            console.log("Код подтвержден:", code);

            // Скрываем элементы ввода
            document.getElementById('verificationCode').style.display = 'none';
            document.getElementById('verificationTimer').style.display = 'none';
            document.getElementById('verificationResend').style.display = 'none';
            document.querySelector('.verification-label').style.display = 'none';

            // Показываем флип-контейнер
            const flipContainer = document.getElementById('flipContainer');
            flipContainer.classList.add('visible');

            // Запускаем флип-анимацию
            setTimeout(() => {
                flipContainer.classList.add('flipped');

                // Запускаем конфетти
                startConfetti();
            }, 100);

            // Через 3 секунды скрываем блок подтверждения
            setTimeout(() => {
                document.getElementById('verificationBlock').classList.remove('visible');
                document.getElementById('verificationCode').value = '';
                clearInterval(countdown);

                // Сбрасываем флип-анимацию
                setTimeout(() => {
                    flipContainer.classList.remove('flipped');
                    flipContainer.classList.remove('visible');
                    // Восстанавливаем элементы ввода
                    document.getElementById('verificationCode').style.display = 'block';
                    document.getElementById('verificationTimer').style.display = 'block';
                    document.getElementById('verificationResend').style.display = 'none';
                    document.querySelector('.verification-label').style.display = 'block';
                }, 500);
            }, 3000);
        }
    }
});

// Функция для запуска конфетти
function startConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.classList.add('confetti-active');

    const confettiPieces = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];

    // Создаем частицы конфетти
    for (let i = 0; i < 150; i++) {
        confettiPieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 10 + 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: Math.random() * 3 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5
        });
    }

    // Анимация конфетти
    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let stillFalling = false;

        confettiPieces.forEach(piece => {
            ctx.save();
            ctx.translate(piece.x, piece.y);
            ctx.rotate(piece.rotation * Math.PI / 180);
            ctx.fillStyle = piece.color;
            ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
            ctx.restore();

            piece.y += piece.speed;
            piece.rotation += piece.rotationSpeed;

            if (piece.y < canvas.height) {
                stillFalling = true;
            }
        });

        if (stillFalling) {
            requestAnimationFrame(animateConfetti);
        } else {
            // Очищаем canvas после завершения анимации
            setTimeout(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.classList.remove('confetti-active');
            }, 1000);
        }
    }

    animateConfetti();
}
const port = '';

// const host = "https://loyality-backend.ponarth.com";
const host = "http://127.0.0.1:8000";
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function sendPhoneVerification(phone, maxRetries = 2, retryDelay = 1000) {
    let retryCount = 0;


    const executeRequest = () => {
        return fetch(`${host}/api/v1/verify/phone/send`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone })
        })
            .then(async response => {
                console.log(response);
                const data = await response.json();

                if (data.status_code === 400) {
                    const formatScore = (value) => {
                        if (!value) return "0.00";
                        const num = parseFloat(value);
                        return num >= 1000 ? `${(num / 1000).toFixed(2)}k` : num.toFixed(2);
                    };

                        const formattedScore = data.scores ? formatScore(data.scores) : "0.00";
                        localStorage.setItem('scoreAmount', formattedScore);
                        localStorage.setItem('h1Element', ` ${data.first} ${data.third}, Вы уже оформили карту `);

                        if (data) {

                            function formatTimePassed(startDate) {
                                const start = new Date(startDate);
                                const now = new Date();
                                const diff = now - start;

                                if (start.toDateString() === now.toDateString()) {
                                    return "Вы сегодня зарегистрировали карту";
                                }


                                const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
                                if (totalDays >= 365) {
                                    const years = Math.floor(totalDays / 365);
                                    return `${years} ${getRussianWord(years, 'год', 'года', 'лет')}`;
                                }
                                else if (totalDays >= 30) {
                                    const months = Math.floor(totalDays / 30);
                                    return `${months} ${getRussianWord(months, 'месяц', 'месяца', 'месяцев')}`;
                                }
                                else {
                                    return `${totalDays} ${getRussianWord(totalDays, 'день', 'дня', 'дней')}`;
                                }

                                function getRussianWord(number, one, two, five) {
                                    number = Math.abs(number);
                                    if (number > 10 && number < 20) return five;
                                    const lastDigit = number % 10;
                                    if (lastDigit === 1) return one;
                                    if (lastDigit > 1 && lastDigit < 5) return two;
                                    return five;
                                }
                            }
                            localStorage.setItem('userInfo', JSON.stringify({
                                firstName: data.first,
                                thirdName: data.third,
                                registrationDate: data.date_added ?
                                    new Date(data.date_added).toLocaleDateString() : 'Не указана'
                            }));
                        }
                        if (data && data.date_added) {
                            const registrationDate = new Date(data.date_added);
                            const day = registrationDate.getDate();
                            const month = (registrationDate.getMonth() + 1).toString().padStart(2, '0');
                            const year = registrationDate.getFullYear();

                            localStorage.setItem('registrationdate', `Дата оформления карты: ${day}.${month}.${year}`);

                            const timePassed = formatTimePassed(data.date_added);
                            if (timePassed === "Вы сегодня зарегистрировали карту") {
                                localStorage.setItem('timePassed', timePassed);
                            } else {
                                localStorage.setItem('timePassed', `Вы уже с нами ${timePassed}!`);
                            }
                        }




                window.location.href = './Product selection.html';
                return;
            }
                else if (data.call_id) {
                    return data;
                }
                else if (data.status_code === 422) {
                    document.getElementById('phone').value = '';
                    throw new Error("Невалидный номер");
                }
                else {
                    throw new Error("Неизвестная ошибка сервера");
                }
            })
            .catch(error => {
                console.error(`Ошибка (попытка ${retryCount + 1}/${maxRetries}):`, error.message);

                if (retryCount < maxRetries - 1) {
                    retryCount++;
                    return new Promise(resolve => setTimeout(resolve, retryDelay))
                        .then(executeRequest);
                } else {
                    return {
                        error: true,
                        status: error.status || 500,
                        message: error.message || 'Слишком много запросов',
                        details: error.details || null,
                        timestamp: new Date().toISOString()
                    };
                }
            });
    };

    return executeRequest();
}

document.addEventListener('DOMContentLoaded', function () {



    document.getElementById('verification-form').addEventListener('submit', function (event) {
        event.preventDefault();
        const confirmButton = document.getElementById('confirm-code');
        const smsCode = document.getElementById('sms-code').value;
        const callId = localStorage.getItem('call_id');
        const phone = document.getElementById('phone').value;

        if (confirmButton.style.display !== 'none') {
            confirmButton.click();
            if (smsCode && callId) {
                confirmPhoneCode(phone, callId, smsCode)
                    .then(response => {
                        console.log('Код подтверждения успешно отправлен:', response);
                    })
                    .catch(error => {
                        console.error('Ошибка при подтверждении кода:', error);
                        confirmButton.textContent = '';
                        alert('Ошибка при подтверждении кода. Проверьте код и попробуйте снова.');
                    });
            } else {
                alert('Пожалуйста, введите код из СМС.');
            }
        }
        else {
            document.getElementById('send-code').click();
        }
    });
});


function confirmPhoneCode(phone, callId, code) {
    return fetch(`${host}/api/v1/verify/phone/check`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone, call_id: callId, code })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.status_code === 200) {
                localStorage.setItem('call_id', data.call_id || callId);
                window.location.href = './registration.html';
                return data;
            } else {
                throw new Error(data.message || 'Ошибка подтверждения кода');
            }
        });
}

function registerDiscount(callId) {
    const birthDateStr = localStorage.getItem('birth_date');

    let formattedDate = birthDateStr;
    if (birthDateStr) {
        const dateObj = new Date(birthDateStr.split('.').reverse().join('-'));
        if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toISOString().split('T')[0];
        }
    }

    return fetch(`${host}/api/v1/register-discount`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'last_name': localStorage.getItem('last_name'),
            'first_name': localStorage.getItem('first_name'),
            'patronymic': localStorage.getItem('patronymic'),
            'birth_date': formattedDate,
            'gender': localStorage.getItem('gender'),
            'call_id': callId
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message);
                });
            }
            return response.json();
        });
}

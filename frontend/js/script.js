const port = '';

// let host = "https://loyality-backend.ponarth.com";
let host = "http://192.168.0.6:8013";
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const urlParams = new URLSearchParams(window.location.search);
const referalId = urlParams.get("referal_id");

if (referalId) {
    localStorage.setItem("referal_id", referalId);
}

const mainTabRadios = document.querySelectorAll('input[name="main-tab-type"]');

if (mainTabRadios) {
    mainTabRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            radio.checked = true;
        });
    });

    function getCurrentTab() {
        const active = document.querySelector('input[name="main-tab-type"]:checked');
        if (!active) return null;

        return active.id.replace("main-glass-", "");
    }
}


function sendPhoneVerification(phone, maxRetries = 2, retryDelay = 1000) {
    let retryCount = 0;
    const call_type = getCurrentTab();
    const callInfo = document.getElementById('call-info');
    const noCallInfo = document.getElementById('nocall-info');
    const smsCode = document.getElementById('sms-code')

    const executeRequest = () => {
        return fetch(`${host}/api/v1/verify/phone/send`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, call_type: call_type })
        })
            .then(async response => {
                const data = await response.json();
                console.log("Ответ сервера:", data);
                if (data.call_id) {
                    if (call_type == 'telegram') {
                        callInfo.innerText = 'Введите 4-х значный код отправленный';
                        noCallInfo.innerText = 'Если сообщение не пришло';
                        smsCode.placeholder = 'Введите 4-х значный код';
                    } else {
                        callInfo.innerText = 'Введите последние 4 цифры входящего звонка';
                        noCallInfo.innerText = 'Если звонок не поступил';
                        smsCode.placeholder = 'Введите последние 4 цифры';
                    }
                    return data;
                }
                else if (data.status_code === 422) {
                    document.getElementById('phone').value = '';
                    throw new Error("Невалидный номер");
                }
                else if (data.detail.error) {
                    return {
                        error: true,
                        message: data.detail.message
                    }
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
        const callType = localStorage.getItem('call_type');
        const phone = document.getElementById('phone').value;

        if (confirmButton.style.display !== 'none') {
            confirmButton.click();
            if (smsCode && callId) {
                confirmPhoneCode(phone, callId, smsCode, callType)
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


function confirmPhoneCode(phone, callId, code, callType) {
    let url = `${host}/api/v1/verify/phone/check`
    if (callType == 'auth') {
        url = `${host}/api/v1/login`
    }
    return fetch(url, {
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
            if (data.status_code === 200 || data.access_token) {
                localStorage.setItem('call_id', data.call_id || callId);
                localStorage.setItem('phone', phone);

                if (callType == 'auth') {
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);

                    window.location.href = './profile.html';
                    return data;
                }

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

    const savedReferal = localStorage.getItem("referal_id") || null;

    return fetch(`${host}/api/v1/register-discount`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'full_name': localStorage.getItem('fio'),
            'birth_date': formattedDate,
            'gender': localStorage.getItem('gender'),
            'call_id': callId,
            'referal_discount_card_id': parseInt(savedReferal) || null
        })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.message);
                });
            }
            return response.json();
        })
        .then(data => {
            localStorage.removeItem("referal_id");
            console.log(data)
            const currentDate = new Date();
            const day = currentDate.getDate();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            const year = currentDate.getFullYear();

            localStorage.setItem('timePassed', `Вы сегодня зарегистрировали карту! <br> Дата оформления карты: ${day}.${month}.${year}`);

            localStorage.setItem('scoreAmount', '150.00');
            localStorage.setItem('h1Element', `Поздравляем!`);
            localStorage.setItem('new_user_score', 'true');
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);


            window.location.href = './profile.html';

            return data;
        });
}

function isTokenExpired() {
    const token = localStorage.getItem("access_token");
    if (!token || !token.includes('.')) {
        return true;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (!payload.exp) return true;

        const now = Math.floor(Date.now() / 1000);
        return payload.exp <= now;
    } catch (e) {
        console.error("Ошибка при парсинге токена:", e);
        return true;
    }
}
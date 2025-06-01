const port = '';
const host = "loyality-backend.ponarth.com";

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function sendPhoneVerification(phone) {
    return fetch(`https://${host}/api/v1/verify/phone/send`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
    })
        .then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            const formatScore = (value) => {
                if (!value) return "0.00";

                const num = parseFloat(value);

                if (num >= 1000) {
                    const inThousands = (num / 1000).toFixed(2);
                    return `${inThousands}k`;
                } else {
                    return num.toFixed(2);
                }
            };
            if (data.status_code === 400) {
                const score = data.scores;
                const formattedScore = score ? formatScore(score) : "0.00";
                localStorage.setItem('scoreAmount', formattedScore);
                localStorage.setItem('h1Element', "Ваша карта уже была добавлена!")

                window.location.href = './Product selection.html';
            }
            else if (data.call_id) {
                return data;
            }else if (data.status_code = 422){
                document.getElementById('phone').value = '';
                alert("Невалидный номер");
            }
        })
        .catch(error => {
            console.error('Fetch error:', error.message);
            return {
                error: true,
                status: error.status || 500,
                message: error.message || 'Слишком много запросов',
                details: error.details || null,
                timestamp: new Date().toISOString()
            };
        });;
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
                        if (response.status_code === 200) {
                            registerDiscount(callId)
                                .then(discountResponse => {
                                    console.log('Ответ от регистрации скидки:', discountResponse);
                                    const score = discountResponse.scores;
                                    const scoreElement = document.getElementById('scoreAmount');

                                    if (scoreElement) {
                                        const displayScore = score ? (Math.round(parseFloat(score) * 100) / 100).toFixed(2) : '0.00';
                                        scoreElement.textContent = displayScore;
                                    } else {
                                        console.error('Элемент с ID scoreAmount не найден.');
                                    }
                                localStorage.setItem('h1Element', "Ваша карта добавлена!")
                                    window.location.href = './Product selection.html';
                                })
                                .catch(error => {
                                    console.error('Ошибка при регистрации скидки:', error);
                                    alert('Ошибка при регистрации скидки. Пожалуйста, попробуйте снова.');
                                });
                        } else {
                            alert('Ошибка подтверждения кода. Проверьте код и попробуйте снова.');
                        }
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
    return fetch(`https://${host}/api/v1/verify/phone/check`, {
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
                return data;
            } else {
                throw new Error(data.message || 'Ошибка подтверждения кода');
            }
        });
}

function registerDiscount(callId) {
    return fetch(`https://${host}/api/v1/register-discount`, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'last_name': localStorage.getItem('last_name'),
            'first_name': localStorage.getItem('first_name'),
            'patronymic': localStorage.getItem('patronymic'),
            'birth_date': localStorage.getItem('birth_date'),
            'gender': localStorage.getItem('gender'),
            'call_id': callId
        })
    })
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log('Ответ от сервера:', data);

            if (data.status_code === 200 || data.status_code === 400) {
                return data;
            } else {
                throw new Error(data.message || 'Ошибка при регистрации скидки');
            }
        })
}

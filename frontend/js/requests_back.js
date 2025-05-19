document.querySelector('.send-sms').addEventListener('click', function() {
    const phoneInput = document.getElementById('phone');
    const phone = phoneInput.value;

    if (phone) {
        sendPhoneVerification(phone)
            .then(response => {
                console.log('Код отправлен:', response);
                localStorage.setItem('call_id', response.call_id);
                alert('Код подтверждения отправлен на указанный номер.');
            })
    } else {
        alert('Пожалуйста, введите номер телефона.');
    }
});

function sendPhoneVerification(phone) {
    return fetch('http://127.0.0.1:8013/api/v1/verify/phone/send', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phone })
    })
    .then(response => {
        return response.json();
    })
    .then(data => {
        if (data.status_code === 400) {
            const score = data.scores;
            localStorage.setItem('scoreAmount', score ? score : "0");
            localStorage.setItem('h1Element', "Ваша карта уже была добавлена!")

            window.location.href = './Product selection.html';
        }
    });
}




document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('verification-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const smsCode = document.getElementById('sms-code').value;
        const callId = localStorage.getItem('call_id');
        const phone = document.getElementById('phone').value;

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
                                    scoreElement.textContent = score ? score : '0';
                                } else {
                                    console.error('Элемент с ID scoreAmount не найден.');
                                }
                                console.log('Перенаправление на Product selection.html');
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
                    alert('Ошибка при подтверждении кода. Проверьте код и попробуйте снова.');
                });
        } else {
            alert('Пожалуйста, введите код из СМС.');
        }
    });
});


function confirmPhoneCode(phone, callId, code) {
    return fetch('http://127.0.0.1:8013/api/v1/verify/phone/check', {
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
    return fetch('http://127.0.0.1:8013/api/v1/register-discount', {
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

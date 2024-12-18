// script.js
document.addEventListener('DOMContentLoaded', function () {
    const radioButtons = document.querySelectorAll('.radio-btn');

    // Устанавливаем класс inactive для всех кнопок, кроме той, которая имеет класс selected
    radioButtons.forEach(button => {
        if (!button.classList.contains('selected')) {
            button.classList.add('inactive');
        }
    });

    radioButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Удаляем классы selected и inactive со всех кнопок
            radioButtons.forEach(btn => {
                btn.classList.remove('selected');
                btn.classList.remove('inactive');
            });

            // Добавляем класс selected к выбранной кнопке
            this.classList.add('selected');

            // Добавляем класс inactive к остальным кнопкам
            radioButtons.forEach(btn => {
                if (btn !== this) {
                    btn.classList.add('inactive');
                }
            });
        });
    });

    const radioButtonsVolume1 = document.querySelectorAll('.radio-btn-volume1');

    // Устанавливаем класс inactive для всех кнопок, кроме той, которая имеет класс selected
    radioButtonsVolume1.forEach(button => {
        if (!button.classList.contains('selected')) {
            button.classList.add('inactive');
        }
    });

    radioButtonsVolume1.forEach(button => {
        button.addEventListener('click', function () {
            // Удаляем классы selected и inactive со всех кнопок
            radioButtonsVolume1.forEach(btn => {
                btn.classList.remove('selected');
                btn.classList.remove('inactive');
            });

            // Добавляем класс selected к выбранной кнопке
            this.classList.add('selected');

            // Добавляем класс inactive к остальным кнопкам
            radioButtonsVolume1.forEach(btn => {
                if (btn !== this) {
                    btn.classList.add('inactive');
                }
            });
        });
    });

    const radioButtonsVolume2 = document.querySelectorAll('.radio-btn-volume2');

    // Устанавливаем класс inactive для всех кнопок, кроме той, которая имеет класс selected
    radioButtonsVolume2.forEach(button => {
        if (!button.classList.contains('selected')) {
            button.classList.add('inactive');
        }
    });

    radioButtonsVolume2.forEach(button => {
        button.addEventListener('click', function () {
            // Удаляем классы selected и inactive со всех кнопок
            radioButtonsVolume2.forEach(btn => {
                btn.classList.remove('selected');
                btn.classList.remove('inactive');
            });

            // Добавляем класс selected к выбранной кнопке
            this.classList.add('selected');

            // Добавляем класс inactive к остальным кнопкам
            radioButtonsVolume2.forEach(btn => {
                if (btn !== this) {
                    btn.classList.add('inactive');
                }
            });
        });
    });

    // Вторая страница
    const radioButtonsVolume = document.querySelectorAll('.radio-btn-volume');
    // Устанавливаем класс inactive для всех кнопок, кроме той, которая имеет класс selected
    radioButtonsVolume.forEach(button => {
        if (!button.classList.contains('selected')) {
            button.classList.add('inactive');
        }
    });

    radioButtonsVolume.forEach(button => {
        button.addEventListener('click', function () {
            // Удаляем классы selected и inactive со всех кнопок
            radioButtonsVolume.forEach(btn => {
                btn.classList.remove('selected');
                btn.classList.remove('inactive');
            });

            // Добавляем класс selected к выбранной кнопке
            this.classList.add('selected');

            // Добавляем класс inactive к остальным кнопкам
            radioButtonsVolume.forEach(btn => {
                if (btn !== this) {
                    btn.classList.add('inactive');
                }
            });
        });
    });



    // const cartButton = document.querySelector('.cart-button');
    // let itemCount = 2;

    // // Функция для обновления количества товаров в корзине
    // function updateCartCount(count) {
    //     itemCount = count;
    //     cartButton.setAttribute('data-count', itemCount);
    // }

    // // Пример: добавляем товары в корзину
    // function addToCart() {
    //     updateCartCount(itemCount + 1);
    // }

    // // Пример: удаляем товары из корзины
    // function removeFromCart() {
    //     if (itemCount > 0) {
    //         updateCartCount(itemCount - 1);
    //     }
    // }
    // // Пример: добавляем события для кнопок
    // document.addEventListener('click', function (event) {
    //     if (event.target.classList.contains('add-to-cart')) {
    //         addToCart();
    //     } else if (event.target.classList.contains('remove-from-cart')) {
    //         removeFromCart();
    //     }
    // });

    // // Инициализация количества товаров в корзине
    // updateCartCount(0);

});
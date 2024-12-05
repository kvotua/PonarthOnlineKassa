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
});
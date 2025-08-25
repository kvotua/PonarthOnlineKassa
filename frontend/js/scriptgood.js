// const host = "https://loyality-backend.ponarth.com";
const host = "http://127.0.0.1:8000";

let allProducts = [];
let sections = [];

// Функция для преобразования названий секций
function getSectionDisplayName(originalName) {
    const nameMap = {
        "Ponarth классика (РОЗЛИВ)": "Классика",
        "Ponarth крафт (РОЗЛИВ)": "Крафт",
        "Бутылочное пиво и безалкогольные напитки ": "Напитки",
        "Рыба вяленая и копченая": "Рыба",
        "Снеки, закуски": "Снеки",
        "Мерч и сувенирная продукция": "Мерч",
        "Пэт-тара, стаканы и CO2": "Стаканы",
        "0,5 БУТЫЛОЧНОЕ ПИВО PONARTH)": "Бутылочное",
    };

    return nameMap[originalName] || originalName;
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadSections();
    await fetchBeerProducts();
});

// Загрузка секций
async function loadSections() {
    const sectionsContainer = document.getElementById('sectionsContainer');

    try {
        const response = await fetch(`${host}/api/v1/sections`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let sections = await response.json();

        // ФИЛЬТРАЦИЯ: Убираем секцию "Пэт-тара, стаканы и CO2"
        sections = sections.filter(section => section.name !== "Пэт-тара, стаканы и CO2");

        sectionsContainer.innerHTML = '';

        if (sections.length === 0) {
            sectionsContainer.innerHTML = '<div class="error">Секции не найдены</div>';
        } else {
            // Добавляем кнопку "Все" для отображения всех товаров
            const allButton = document.createElement('button');
            allButton.className = 'radio-btn selected';
            allButton.textContent = 'Все';
            allButton.dataset.sectionId = 'all';
            sectionsContainer.appendChild(allButton);

            // Добавляем кнопки для каждой секции с преобразованными названиями
            sections.forEach(section => {
                const displayName = getSectionDisplayName(section.name);
                const button = document.createElement('button');
                button.className = 'radio-btn';
                button.textContent = displayName;
                button.dataset.sectionId = section.id;
                button.dataset.originalName = section.name;
                sectionsContainer.appendChild(button);
            });

            // Добавляем обработчик кликов на кнопки секций
            sectionsContainer.addEventListener('click', function(e) {
                if (e.target.classList.contains('radio-btn')) {
                    // Убираем выделение со всех кнопок
                    document.querySelectorAll('.radio-btn').forEach(btn => {
                        btn.classList.remove('selected');
                    });

                    // Добавляем выделение нажатой кнопке
                    e.target.classList.add('selected');

                    // Фильтруем товары по выбранной секции
                    const sectionId = e.target.dataset.sectionId;

                    if (sectionId === 'all') {
                        // При показе всех товаров исключаем раздел "Пэт-тара, стаканы и CO2"
                        const filteredProducts = allProducts.filter(product => {
                            return product.section_name !== "Пэт-тара, стаканы и CO2";
                        });
                        displayProducts(filteredProducts);
                    } else {
                        const originalName = e.target.dataset.originalName;
                        const filteredProducts = allProducts.filter(product => {
                            return product.section_name === originalName;
                        });
                        displayProducts(filteredProducts);
                    }
                }
            });
        }
    } catch (error) {
        sectionsContainer.innerHTML = '';
        const errorElement = document.createElement('div');
        errorElement.className = 'error';
        errorElement.textContent = `Ошибка загрузки секций: ${error.message}`;
        sectionsContainer.appendChild(errorElement);
        console.error('Error:', error);
    }
}

// Загрузка товаров
async function fetchBeerProducts() {
    const beerContainer = document.getElementById('beerContainer');

    beerContainer.innerHTML = `
                <div class="beer-grid">
                    <div class="loading">Загрузка товаров...</div>
                </div>
            `;

    try {
        const response = await fetch(`${host}/api/v1/goods-with-prices`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allProducts = await response.json();

        // При первоначальной загрузке также исключаем раздел "Пэт-тара, стаканы и CO2"
        const filteredProducts = allProducts.filter(product => {
            return product.section_name !== "Пэт-тара, стаканы и CO2";
        });

        displayProducts(filteredProducts);
    } catch (error) {
        const beerGrid = beerContainer.querySelector('.beer-grid');
        beerGrid.innerHTML = '';
        const errorElement = document.createElement('div');
        errorElement.className = 'error';
        errorElement.textContent = `Ошибка загрузки товаров: ${error.message}`;
        beerGrid.appendChild(errorElement);
        console.error('Error:', error);
    }
}

// Функция для отображения товаров
function displayProducts(products) {
    const beerContainer = document.getElementById('beerContainer');
    const beerGrid = document.createElement('div');
    beerGrid.className = 'beer-grid';

    if (products.length === 0) {
        beerGrid.innerHTML = '<div class="error">Товары не найдены</div>';
    } else {
        products.forEach(product => {
            const beerElement = document.createElement('div');
            beerElement.className = 'beer-1';
            beerElement.innerHTML = `
                        <div class="product-card">
                            <a href="Product information.html?id=${product.id}">
                                <img class="light-beer" alt="${product.name}" src="img/light_beer.png">
                            </a>
                            <h2>${product.name}</h2>
                            <h2 class="cost">${product.price_real.toFixed(2)} р.</h2>
                            <div class="panelmenu">
                                <div class="btn-container">
                                    <button class="radio-btn-volume1">0,5</button>
                                    <button class="radio-btn-volume1 selected">1</button>
                                    <button class="radio-btn-volume1">1,5</button>
                                    <button class="radio-btn-volume1">2</button>
                                </div>
                                <div class="counter-container1">
                                    <button class="subtract">
                                        <div class="circle-1">
                                            <div class="horizontal-line"></div>
                                        </div>
                                    </button>
                                    <span class="counter1">0</span>
                                    <button class="add">
                                        <div class="circle-1 selected">
                                            <div class="horizontal-line selected"></div>
                                            <div class="vertical-line selected"></div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
            beerGrid.appendChild(beerElement);
        });
    }

    beerContainer.innerHTML = '';
    beerContainer.appendChild(beerGrid);

    // Добавляем обработчики событий для кнопок товаров
    addEventListeners();
}

// Добавление обработчиков событий для кнопок товаров
function addEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add')) {
            const counter = e.target.closest('.counter-container1').querySelector('.counter1');
            counter.textContent = parseInt(counter.textContent) + 1;
        }

        if (e.target.closest('.subtract')) {
            const counter = e.target.closest('.counter-container1').querySelector('.counter1');
            const currentValue = parseInt(counter.textContent);
            if (currentValue > 0) {
                counter.textContent = currentValue - 1;
            }
        }

        if (e.target.classList.contains('radio-btn-volume1')) {
            const container = e.target.closest('.btn-container');
            container.querySelectorAll('.radio-btn-volume1').forEach(btn => {
                btn.classList.remove('selected');
            });
            e.target.classList.add('selected');
        }
    });
}
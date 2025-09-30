// const host = "https://loyality-backend.ponarth.com";
const host = "http://127.0.0.1:8000";

let allProducts = [];
let sections = [];
let currentPage = 1;
const productsPerPage = 20;
let isLoading = false;
let currentProducts = [];

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
    // Existing code for loading sections and products
    await loadSections();
    await fetchBeerProducts();

    // Добавляем обработчик скролла для бесконечной подгрузки
    setupInfiniteScroll();

    initializeSearch();
});

// Настройка бесконечного скролла на choice-container
function setupInfiniteScroll() {
    const choiceContainer = document.querySelector('.choice-container');

    choiceContainer.addEventListener('scroll', function() {
        if (isLoading) return;

        const scrollTop = choiceContainer.scrollTop;
        const scrollHeight = choiceContainer.scrollHeight;
        const clientHeight = choiceContainer.clientHeight;

        // Проверяем, достигли ли мы нижней части контейнера (за 100px до конца)
        if (scrollTop + clientHeight >= scrollHeight - 100) {
            loadMoreProducts();
        }
    });
}

// Загрузка дополнительных товаров
function loadMoreProducts() {
    if (isLoading) return;

    const totalPages = Math.ceil(currentProducts.length / productsPerPage);
    if (currentPage >= totalPages) return; // Все товары уже показаны

    isLoading = true;

    // Показываем индикатор загрузки
    showLoadingIndicator();

    // Задержка 1 секунда перед подгрузкой
    setTimeout(() => {
        currentPage++;
        displayProducts(currentProducts, true); // true - значит добавляем к существующим

        isLoading = false;
        hideLoadingIndicator();

        // Проверяем, нужно ли скрыть индикатор навсегда (если все товары загружены)
        const totalPages = Math.ceil(currentProducts.length / productsPerPage);
        if (currentPage >= totalPages) {
            hideLoadingIndicator(true);
        }

    }, 1000);
}

// Показать индикатор загрузки
function showLoadingIndicator() {
    let loadingIndicator = document.getElementById('loadingIndicator');
    if (!loadingIndicator) {
        loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loadingIndicator';
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Загрузка...</span>
        `;
        document.getElementById('beerContainer').appendChild(loadingIndicator);
    }
    loadingIndicator.style.display = 'flex';
}

// Скрыть индикатор загрузки
function hideLoadingIndicator(hidePermanently = false) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        if (hidePermanently) {
            loadingIndicator.style.display = 'none';
        } else {
            // Можно добавить логику для временного скрытия, если нужно
        }
    }
}

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
                    // Сбрасываем страницу на первую при смене секции
                    currentPage = 1;
                    isLoading = false;

                    document.querySelectorAll('.radio-btn').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    e.target.classList.add('selected');
                    const sectionId = e.target.dataset.sectionId;
                    if (sectionId === 'all') {
                        const filteredProducts = allProducts.filter(product => {
                            return product.section_name !== "Пэт-тара, стаканы и CO2";
                        });
                        currentProducts = filteredProducts;
                        displayProducts(currentProducts);
                    } else {
                        const originalName = e.target.dataset.originalName;
                        const filteredProducts = allProducts.filter(product => {
                            return product.section_name === originalName;
                        });
                        currentProducts = filteredProducts;
                        displayProducts(currentProducts);
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
        const filteredProducts = allProducts.filter(product => {
            return product.section_name !== "Пэт-тара, стаканы и CO2";
        });
        currentProducts = filteredProducts;
        displayProducts(currentProducts);
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

// Функция для отображения товаров с бесконечной подгрузкой
function displayProducts(products, append = false) {
    const beerContainer = document.getElementById('beerContainer');

    // Если не append, очищаем контейнер и создаем новую сетку
    if (!append) {
        beerContainer.innerHTML = '';

        const beerGrid = document.createElement('div');
        beerGrid.className = 'beer-grid';
        beerGrid.id = 'beerGrid';
        beerContainer.appendChild(beerGrid);
    }

    const beerGrid = document.getElementById('beerGrid') || beerContainer.querySelector('.beer-grid');

    // Рассчитываем индексы товаров для текущей страницы
    const startIndex = 0; // Всегда показываем с начала при смене секции
    const endIndex = currentPage * productsPerPage;
    const productsToShow = products.slice(startIndex, endIndex);

    if (productsToShow.length === 0 && !append) {
        beerGrid.innerHTML = '<div class="error">Товары не найдены</div>';
    } else {
        // Если append = false, очищаем сетку перед добавлением новых товаров
        if (!append) {
            beerGrid.innerHTML = '';
        }

        // Добавляем только новые товары (для append = true)
        const currentItemCount = beerGrid.children.length;
        const newProducts = productsToShow.slice(currentItemCount);

        newProducts.forEach(product => {
            const beerElement = document.createElement('div');
            beerElement.className = 'beer-1';
            beerElement.innerHTML = `
                        <div class="product-card">
                            <a href="Product information.html?id=${product.id}">
                                <img class="light-beer" alt="${product.name}" src="img/light_beer.png">
                            </a>
                            <h2>${product.name}</h2>
                            <h3 class="cost">${product.price_real.toFixed(2)}</h3>
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

    // Удаляем старый индикатор загрузки если он есть
    const oldIndicator = document.getElementById('loadingIndicator');
    if (oldIndicator) {
        oldIndicator.remove();
    }

    // Добавляем индикатор загрузки в конец, если есть еще товары для подгрузки
    const totalPages = Math.ceil(products.length / productsPerPage);
    if (currentPage < totalPages) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loadingIndicator';
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.style.display = 'none'; // Скрыт по умолчанию
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Загрузка...</span>
        `;
        beerContainer.appendChild(loadingIndicator);
    }

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

// Переменные для поиска
let searchTimeout;
let isSearching = false;

// Инициализация поиска
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');

    // Обработчик ввода текста
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.trim();

        // Показываем/скрываем кнопку очистки
        clearSearchBtn.style.display = searchTerm ? 'block' : 'none';

        // Сбрасываем предыдущий таймер
        clearTimeout(searchTimeout);

        if (searchTerm.length >= 2) {
            // Запускаем поиск с задержкой 500ms
            searchTimeout = setTimeout(() => {
                performSearch(searchTerm);
            }, 500);
        } else if (searchTerm.length === 0) {
            // Если поле пустое, показываем все товары
            resetSearch();
        }
    });

    // Обработчик очистки поиска
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        resetSearch();
        searchInput.focus();
    });

    // Обработчик клавиши Escape
    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            resetSearch();
        }
    });
}

// Функция выполнения поиска
async function performSearch(searchTerm) {
    if (isSearching) return;

    isSearching = true;
    currentPage = 1;

    try {
        // Показываем индикатор загрузки
        showSearchLoading();

        // Выполняем запрос к API поиска
        const response = await fetch(`${host}/api/v1/goods/search/${encodeURIComponent(searchTerm)}`);

        if (!response.ok) {
            if (response.status === 404) {
                currentProducts = [];
                displaySearchResults([], searchTerm);
                return;
            } else {
                throw new Error(`Ошибка сервера: ${response.status}`);
            }
        }

        const searchResults = await response.json();

        // Обновляем текущие товары результатами поиска
        currentProducts = searchResults.filter(product => {
            return product.section_name !== "Пэт-тара, стаканы и CO2";
        });

        // Показываем результаты
        displaySearchResults(currentProducts, searchTerm);

    } catch (error) {
        console.error('Ошибка поиска:', error);

        // Если ошибка сети или другие ошибки - показываем "Товар не найден"
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            showSearchError("Товар не найден");
        } else {
            showSearchError("Товар не найден");
        }
    } finally {
        isSearching = false;
        hideSearchLoading();
    }
}

// Функция сброса поиска
function resetSearch() {
    currentPage = 1;
    // Возвращаем отфильтрованные товары (без секции "Пэт-тара")
    currentProducts = allProducts.filter(product => {
        return product.section_name !== "Пэт-тара, стаканы и CO2";
    });

    // Убираем информацию о поиске
    const existingInfo = document.getElementById('searchResultsInfo');
    if (existingInfo) {
        existingInfo.remove();
    }

    displayProducts(currentProducts);

    document.querySelectorAll('.radio-btn').forEach(btn => {
        if (btn.dataset.sectionId === 'all') {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
}

//  Результаты поиска
function displaySearchResults(products, searchTerm) {
    const beerContainer = document.getElementById('beerContainer');

    const existingInfo = document.getElementById('searchResultsInfo');
    if (existingInfo) {
        existingInfo.remove();
    }

    //  информацию о результатах поиска
    const resultsInfo = document.createElement('div');
    resultsInfo.id = 'searchResultsInfo';
    resultsInfo.className = 'search-results-info';

    if (products.length === 0) {
        resultsInfo.innerHTML = `По запросу "<strong>${searchTerm}</strong>" ничего не найдено`;
    } else {
        resultsInfo.innerHTML = `Найдено ${products.length} товаров по запросу "<strong>${searchTerm}</strong>"`;
    }

    beerContainer.insertBefore(resultsInfo, beerContainer.firstChild);

    // Показываем товары
    displayProducts(products);

    // Снимаем выделение с секций
    document.querySelectorAll('.radio-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// Показать индикатор загрузки поиска
function showSearchLoading() {
    const beerContainer = document.getElementById('beerContainer');
    beerContainer.innerHTML = `
        <div class="loading-search">
            <div class="loading-spinner"></div>
            <span>Ищем товары...</span>
        </div>
    `;
}

// Скрыть индикатор загрузки поиска
function hideSearchLoading() {
    // Автоматически скроется при отображении результатов
}

// Показать ошибку поиска
function showSearchError(errorMessage) {
    const beerContainer = document.getElementById('beerContainer');
    beerContainer.innerHTML = `
        <div class="error">
            ${errorMessage}<br>
            <button onclick="resetSearch()" style="margin-top: 10px; padding: 8px 16px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.3); border-radius: 20px; color: white; cursor: pointer;">
                Показать все товары
            </button>
        </div>
    `;
}

//  CSS для индикатора загрузки поиска
const searchLoadingStyles = `
.loading-search {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px;
    color: rgba(255, 255, 255, 0.8);
}

.loading-search .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 15px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
`;

//  стили в документ
const styleSheet = document.createElement('style');
styleSheet.textContent = searchLoadingStyles;
document.head.appendChild(styleSheet);
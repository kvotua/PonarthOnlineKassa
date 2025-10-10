// const host = "https://loyality-backend.ponarth.com";
const host = "http://127.0.0.1:8000";

let allProducts = [];
let sections = [];
let currentPage = 1;
const productsPerPage = 20;
let isLoading = false;
let currentProducts = [];

// Store container prices globally
let containerPrices = {
    0.5: 0,
    1: 0,
    1.5: 0,
    2: 0
};

// Простой store для корзины
let cartStore = {
    cartItems: [],
    totalAmount: 0
};

// Флаг для отслеживания инициализации обработчиков
let eventListenersInitialized = false;

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

// Загрузка цен тары
async function fetchContainerPrices() {
    try {
        const response = await fetch(`${host}/api/v1/goods-with-prices`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки тары');
        }
        const products = await response.json();
        const containers = products.filter(product => product.section_name === "Пэт-тара, стаканы и CO2");

        containers.forEach(container => {
            if (container.name === "Бутылка 0.5л ") {
                containerPrices[0.5] = container.price_real;
            } else if (container.name === "Бутылка 1 литра" || container.name === "Бутылка 1л") {
                containerPrices[1] = container.price_real;
            } else if (container.name === "Бутылка 1.5л") {
                containerPrices[1.5] = container.price_real;
            } else if (container.name === "Бутылка 2 литра") {
                containerPrices[2] = container.price_real;
            }
        });
        console.log('Container prices:', containerPrices);
    } catch (error) {
        console.error('Ошибка загрузки цен на тару:', error);
        containerPrices = {
            0.5: 7.85,
            1: 10.00,
            1.5: 6.90,
            2: 8.00
        };
    }
}

// Функции для работы с корзиной
function loadCartState() {
    const savedState = localStorage.getItem('cartState');
    if (savedState) {
        try {
            cartStore = JSON.parse(savedState);
        } catch (e) {
            console.error('Error parsing cartState:', e);
        }
    }
}

function saveCartState() {
    localStorage.setItem('cartState', JSON.stringify(cartStore));
}

function updateCart(itemKey, newQuantity, productData = null) {
    const existingItemIndex = cartStore.cartItems.findIndex(item => item.itemKey === itemKey);

    if (existingItemIndex !== -1) {
        if (newQuantity > 0) {
            // Обновляем существующий товар
            cartStore.cartItems[existingItemIndex].quantity = newQuantity;
            cartStore.cartItems[existingItemIndex].liquidPrice =
                cartStore.cartItems[existingItemIndex].pricePerLiter *
                cartStore.cartItems[existingItemIndex].volume *
                newQuantity;
            cartStore.cartItems[existingItemIndex].containerPrice =
                cartStore.cartItems[existingItemIndex].containerCost *
                newQuantity;
            cartStore.cartItems[existingItemIndex].totalPrice =
                cartStore.cartItems[existingItemIndex].liquidPrice +
                cartStore.cartItems[existingItemIndex].containerPrice;
        } else {
            // Удаляем товар если количество 0
            cartStore.cartItems.splice(existingItemIndex, 1);
        }
    } else if (productData && newQuantity > 0) {
        // Добавляем новый товар
        cartStore.cartItems.push({
            ...productData,
            quantity: newQuantity,
            liquidPrice: productData.pricePerLiter * productData.volume * newQuantity,
            containerPrice: productData.containerCost * newQuantity,
            totalPrice: (productData.pricePerLiter * productData.volume + productData.containerCost) * newQuantity
        });
    }

    // Пересчитываем общую сумму
    cartStore.totalAmount = cartStore.cartItems.reduce((total, item) => total + item.totalPrice, 0);

    // Сохраняем в localStorage
    saveCartState();
}

// Функция для обновления цены в карточке товара
function updateProductPrice(productElement) {
    const selectedVolume = parseFloat(productElement.querySelector('.radio-btn-volume1.selected').dataset.volume);
    const basePrice = parseFloat(productElement.querySelector('.cost').dataset.basePrice || 0);

    // Calculate product cost (only the liquid) - как в scriptinfomenu.js
    const productCost = basePrice * selectedVolume;

    // Get container cost for the selected volume
    const containerCost = containerPrices[selectedVolume] || 0;

    // Общая цена (напиток + тара)
    const total = productCost + containerCost;

    // Обновляем отображение цены
    const costElement = productElement.querySelector('.cost');
    costElement.textContent = `${total.toFixed(2)} р.`;
}

document.addEventListener('DOMContentLoaded', async function() {
    // Загружаем состояние корзины
    loadCartState();

    // Загружаем цены тары перед всеми операциями
    await fetchContainerPrices();

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

    if (choiceContainer) {
        choiceContainer.addEventListener('scroll', function() {
            if (isLoading) return;

            const scrollTop = choiceContainer.scrollTop;
            const scrollHeight = choiceContainer.scrollHeight;
            const clientHeight = choiceContainer.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - 100) {
                loadMoreProducts();
            }
        });
    }
}

// Загрузка дополнительных товаров
function loadMoreProducts() {
    if (isLoading) return;

    const totalPages = Math.ceil(currentProducts.length / productsPerPage);
    if (currentPage >= totalPages) return;

    isLoading = true;
    showLoadingIndicator();

    setTimeout(() => {
        currentPage++;
        displayProducts(currentProducts, true);
        isLoading = false;
        hideLoadingIndicator();

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
        sections = sections.filter(section => section.name !== "Пэт-тара, стаканы и CO2");
        sectionsContainer.innerHTML = '';
        if (sections.length === 0) {
            sectionsContainer.innerHTML = '<div class="error">Секции не найдены</div>';
        } else {
            const allButton = document.createElement('button');
            allButton.className = 'radio-btn selected';
            allButton.textContent = 'Все';
            allButton.dataset.sectionId = 'all';
            sectionsContainer.appendChild(allButton);

            sections.forEach(section => {
                const displayName = getSectionDisplayName(section.name);
                const button = document.createElement('button');
                button.className = 'radio-btn';
                button.textContent = displayName;
                button.dataset.sectionId = section.id;
                button.dataset.originalName = section.name;
                sectionsContainer.appendChild(button);
            });

            sectionsContainer.addEventListener('click', function(e) {
                if (e.target.classList.contains('radio-btn')) {
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

    if (!append) {
        beerContainer.innerHTML = '';
        const beerGrid = document.createElement('div');
        beerGrid.className = 'beer-grid';
        beerGrid.id = 'beerGrid';
        beerContainer.appendChild(beerGrid);
    }

    const beerGrid = document.getElementById('beerGrid') || beerContainer.querySelector('.beer-grid');
    const startIndex = 0;
    const endIndex = currentPage * productsPerPage;
    const productsToShow = products.slice(startIndex, endIndex);

    if (productsToShow.length === 0 && !append) {
        beerGrid.innerHTML = '<div class="error">Товары не найдены</div>';
    } else {
        if (!append) {
            beerGrid.innerHTML = '';
        }

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
                            <h3 class="cost" data-base-price="${product.price_real}">${product.price_real.toFixed(2)} р.</h3>
                            <div class="panelmenu">
                                <div class="btn-container">
                                    <button class="radio-btn-volume1" data-volume="0.5">0,5</button>
                                    <button class="radio-btn-volume1 selected" data-volume="1">1</button>
                                    <button class="radio-btn-volume1" data-volume="1.5">1,5</button>
                                    <button class="radio-btn-volume1" data-volume="2">2</button>
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

            // Инициализируем цену для нового товара
            updateProductPrice(beerElement);
        });
    }

    const oldIndicator = document.getElementById('loadingIndicator');
    if (oldIndicator) {
        oldIndicator.remove();
    }

    const totalPages = Math.ceil(products.length / productsPerPage);
    if (currentPage < totalPages) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loadingIndicator';
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.style.display = 'none';
        loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <span>Загрузка...</span>
        `;
        beerContainer.appendChild(loadingIndicator);
    }

    // Инициализируем обработчики только один раз
    if (!eventListenersInitialized) {
        addEventListeners();
        eventListenersInitialized = true;
    }
}

// Добавление обработчиков событий для кнопок товаров (ТОЛЬКО ОДИН РАЗ)
function addEventListeners() {
    // Используем делегирование событий для обработки кликов на динамически созданных элементах
    document.addEventListener('click', function(e) {
        // Обработчик добавления количества
        if (e.target.closest('.add')) {
            const counter = e.target.closest('.counter-container1').querySelector('.counter1');
            const currentValue = parseInt(counter.textContent);
            counter.textContent = currentValue + 1;
            updateCartFromCard(e.target.closest('.beer-1'));
        }

        // Обработчик уменьшения количества
        if (e.target.closest('.subtract')) {
            const counter = e.target.closest('.counter-container1').querySelector('.counter1');
            const currentValue = parseInt(counter.textContent);
            if (currentValue > 0) {
                counter.textContent = currentValue - 1;
                updateCartFromCard(e.target.closest('.beer-1'));
            }
        }

        // Обработчик выбора объема
        if (e.target.classList.contains('radio-btn-volume1')) {
            const container = e.target.closest('.btn-container');
            container.querySelectorAll('.radio-btn-volume1').forEach(btn => {
                btn.classList.remove('selected');
            });
            e.target.classList.add('selected');

            // Обновляем цену при смене объема
            updateProductPrice(e.target.closest('.beer-1'));
            updateCartFromCard(e.target.closest('.beer-1'));
        }
    });
}

// Обновление корзины из карточки товара
function updateCartFromCard(productElement) {
    const quantity = parseInt(productElement.querySelector('.counter1').textContent);
    const selectedVolume = parseFloat(productElement.querySelector('.radio-btn-volume1.selected').dataset.volume);
    const basePrice = parseFloat(productElement.querySelector('.cost').dataset.basePrice || 0);
    const productId = productElement.querySelector('a').href.split('id=')[1];
    const productName = productElement.querySelector('h2').textContent;
    const image = productElement.querySelector('img').src;

    const containerCost = containerPrices[selectedVolume] || 0;
    const itemKey = `${productId}_${selectedVolume}`;

    const productData = {
        id: productId,
        name: productName,
        volume: selectedVolume,
        pricePerLiter: basePrice,
        containerCost: containerCost,
        image: image,
        itemKey: itemKey
    };

    updateCart(itemKey, quantity, productData);
}

// Переменные для поиска
let searchTimeout;
let isSearching = false;

// Инициализация поиска
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearch');

    if (searchInput && clearSearchBtn) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.trim();
            clearSearchBtn.style.display = searchTerm ? 'block' : 'none';
            clearTimeout(searchTimeout);

            if (searchTerm.length >= 2) {
                searchTimeout = setTimeout(() => {
                    performSearch(searchTerm);
                }, 500);
            } else if (searchTerm.length === 0) {
                resetSearch();
            }
        });

        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            resetSearch();
            searchInput.focus();
        });

        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                searchInput.value = '';
                clearSearchBtn.style.display = 'none';
                resetSearch();
            }
        });
    }
}

// Функция выполнения поиска
async function performSearch(searchTerm) {
    if (isSearching) return;

    isSearching = true;
    currentPage = 1;

    try {
        showSearchLoading();
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
        currentProducts = searchResults.filter(product => {
            return product.section_name !== "Пэт-тара, стаканы и CO2";
        });

        displaySearchResults(currentProducts, searchTerm);

    } catch (error) {
        console.error('Ошибка поиска:', error);
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
    currentProducts = allProducts.filter(product => {
        return product.section_name !== "Пэт-тара, стаканы и CO2";
    });

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

// Результаты поиска
function displaySearchResults(products, searchTerm) {
    const beerContainer = document.getElementById('beerContainer');

    const existingInfo = document.getElementById('searchResultsInfo');
    if (existingInfo) {
        existingInfo.remove();
    }

    const resultsInfo = document.createElement('div');
    resultsInfo.id = 'searchResultsInfo';
    resultsInfo.className = 'search-results-info';

    if (products.length === 0) {
        resultsInfo.innerHTML = `По запросу "<strong>${searchTerm}</strong>" ничего не найдено`;
    } else {
        resultsInfo.innerHTML = `Найдено ${products.length} товаров по запросу "<strong>${searchTerm}</strong>"`;
    }

    beerContainer.insertBefore(resultsInfo, beerContainer.firstChild);
    displayProducts(products);

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

// Добавляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
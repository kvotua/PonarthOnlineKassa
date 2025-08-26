const host = "http://127.0.0.1:8000";

// Store container prices globally
let containerPrices = {
    0.5: 0,
    1: 0,
    1.5: 0,
    2: 0
};

eva.replace();

// Fetch container prices from the "Пэт-тара, стаканы и CO2" section
async function fetchContainerPrices() {
    try {
        const response = await fetch(`${host}/api/v1/goods-with-prices`);
        if (!response.ok) {
            throw new Error('Ошибка загрузки тары');
        }
        const products = await response.json();
        // Filter container products
        const containers = products.filter(product => product.section_name === "Пэт-тара, стаканы и CO2");

        // Map container prices to volumes based on product names
        containers.forEach(container => {
            if (container.name === "Бутылка 0.5л") {
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
        // Fallback prices from search results
        containerPrices = {
            0.5: 7.85, // From web:9
            1: 10.00,   // Approximate average from web:6, web:12
            1.5: 6.90,  // From web:4
            2: 8.00     // Approximate average from web:22
        };
    }
}

async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`${host}/api/v1/goods-with-prices/${productId}`);
        if (!response.ok) {
            throw new Error('Товар не найден');
        }
        const product = await response.json();
        const basePrice = product.price_real;
        // Update DOM with product details
        document.getElementById('totalPrice').dataset.basePrice = basePrice;
        document.getElementById('totalPrice').dataset.productId = productId;
        document.getElementById('productTitle').dataset.productName = product.name;
        document.getElementById('productImage').src = product.image || 'img/light_beer.png';
        document.getElementById('productImage').alt = product.name;
        document.getElementById('productTitle').textContent = `${product.name} | ${basePrice.toFixed(2)} р. - 1 л`;
        document.getElementById('productDescription').innerHTML = `
            Крепость — 4,5%. Напиток относят к категории премиум-лагеров в американском стиле.
            Для него характерны сладковатое солодовое тело с карамельными тонами и нюансами сухофруктов и специй.
            Пиво подают охлаждённым, с кусочком лайма в горлышке бутылки.
            <br><br>
            <b>OG</b> - 15; IBU - 20; ABV - 10
        `;
        updateTotalPrice();
    } catch (error) {
        document.getElementById('productTitle').textContent = 'Ошибка загрузки товара';
        document.getElementById('productDescription').textContent = error.message;
        console.error('Error:', error);
    }
}

function updateQuantity(e) {
    const counter = document.querySelector('.counter3');
    let value = parseInt(counter.textContent);
    if (e.target.closest('.add')) {
        value++;
    } else if (e.target.closest('.subtract') && value > 0) {
        value--;
    }
    counter.textContent = value;
    updateTotalPrice();
}

function updateTotalPrice() {
    const quantity = parseInt(document.querySelector('.counter3').textContent);
    const basePrice = parseFloat(document.getElementById('totalPrice').dataset.basePrice || 0);
    const selectedVolume = parseFloat(document.querySelector('.radio-btn-volume.selected').dataset.volume || 1);

    // Calculate product cost
    const productCost = basePrice * selectedVolume * quantity;

    // Get container cost for the selected volume
    const containerCost = containerPrices[selectedVolume] || 0;
    const totalContainerCost = containerCost * quantity;

    // Total price including container cost
    const total = productCost + totalContainerCost;

    document.getElementById('totalPrice').textContent = `Итого: ${total.toFixed(2)} р.`;
}

function addToCart() {
    const quantity = parseInt(document.querySelector('.counter3').textContent);
    if (quantity === 0) {
        alert("Пожалуйста, выберите количество товара");
        return false;
    }
    const selectedVolume = parseFloat(document.querySelector('.radio-btn-volume.selected').dataset.volume);
    const basePrice = parseFloat(document.getElementById('totalPrice').dataset.basePrice || 0);
    const productId = document.getElementById('totalPrice').dataset.productId;
    const productName = document.getElementById('productTitle').dataset.productName;
    const image = document.getElementById('productImage').src;

    // Get container cost for the selected volume
    const containerCost = containerPrices[selectedVolume] || 0;

    const cartItem = {
        id: productId,
        name: productName,
        volume: selectedVolume,
        quantity: quantity,
        pricePerLiter: basePrice,
        containerCost: containerCost, // Include container cost
        totalPrice: (basePrice * selectedVolume + containerCost) * quantity, // Include container cost in total
        image: image
    };

    // Dispatch to Redux store
    store.dispatch({
        type: 'ADD_TO_CART',
        payload: cartItem
    });

    // Save to localStorage
    localStorage.setItem('cartState', JSON.stringify(store.getState()));

    console.log("Товар добавлен в корзину:", cartItem);
    console.log("Текущее состояние корзины:", store.getState());
    return true;
}

function addToCartAndRedirect() {
    if (addToCart()) {
        window.location.href = 'bascket.html';
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Load cart state from localStorage into Redux store
    const savedState = localStorage.getItem('cartState');
    if (savedState) {
        try {
            store.dispatch({ type: 'INITIALIZE_STATE', payload: JSON.parse(savedState) });
        } catch (e) {
            console.error('Error parsing cartState:', e);
        }
    }

    // Fetch container prices before product details
    await fetchContainerPrices();

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        fetchProductDetails(productId);
    } else {
        document.getElementById('productTitle').textContent = 'Товар не найден';
    }

    // Initialize event handlers
    document.querySelectorAll('.radio-btn-volume').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.radio-btn-volume').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            updateTotalPrice();
        });
    });

    document.querySelector('.add').addEventListener('click', updateQuantity);
    document.querySelector('.subtract').addEventListener('click', updateQuantity);

    // Set initial counter value
    document.querySelector('.counter3').textContent = '0';
});
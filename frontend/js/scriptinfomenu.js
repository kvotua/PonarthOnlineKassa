const host = "http://127.0.0.1:8000";

eva.replace();

async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`${host}/api/v1/goods-with-prices/${productId}`);
        if (!response.ok) {
            throw new Error('Товар не найден');
        }
        const product = await response.json();
        const basePrice = product.price_real;
        // Обновите DOM с подробной информацией о продукте
        document.getElementById('totalPrice').dataset.basePrice = basePrice;
        document.getElementById('totalPrice').dataset.productId = productId;
        document.getElementById('productTitle').dataset.productName = product.name;
        document.getElementById('productImage').src = product.image || 'img/light_beer.png';
        document.getElementById('productImage').alt = product.name;
        document.getElementById('productTitle').textContent = `${product.name} | ${basePrice.toFixed(2)} р. `;
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

    // Расчет стоимости
    const total = basePrice * selectedVolume * quantity;

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

    const cartItem = {
        id: productId,
        name: productName,
        volume: selectedVolume,
        quantity: quantity,
        pricePerLiter: basePrice,
        totalPrice: basePrice * selectedVolume * quantity, // Только стоимость продукта
        image: image
    };

    // Отправка в магазин Redux
    store.dispatch({
        type: 'ADD_TO_CART',
        payload: cartItem
    });

    // Сохранить в localStorage
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
    // Загрузить состояние корзины из localStorage в Redux store
    const savedState = localStorage.getItem('cartState');
    if (savedState) {
        try {
            store.dispatch({ type: 'INITIALIZE_STATE', payload: JSON.parse(savedState) });
        } catch (e) {
            console.error('Error parsing cartState:', e);
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
        fetchProductDetails(productId);
    } else {
        document.getElementById('productTitle').textContent = 'Товар не найден';
    }

    // Инициализировать обработчики событий
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
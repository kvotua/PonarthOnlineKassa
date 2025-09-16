document.addEventListener('DOMContentLoaded', function() {
    // Restore state from localStorage
    const savedState = localStorage.getItem('cartState');
    let initialState = { cartItems: [], totalAmount: 0 };
    if (savedState) {
        try {
            initialState = JSON.parse(savedState);
        } catch (e) {
            console.error('Error parsing cartState:', e);
        }
    }
    // Initialize Redux store with restored state
    store.dispatch({ type: 'INITIALIZE_STATE', payload: initialState });
    displayCartItems(initialState.cartItems);
    initializeEventHandlers();
});

function truncateText(text, maxLength) {
    if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
    }
    return text;
}

function displayCartItems(cartItems) {
    const cartContainer = document.getElementById('cart-container');
    const totalContainer = document.getElementById('total-container');

    if (cartItems.length === 0) {
        cartContainer.innerHTML = '<p>Корзина пуста</p>';
        totalContainer.innerHTML = '';
        return;
    }

    let html = '';
    let total = 0;

    cartItems.forEach((item) => {
        const truncatedName = truncateText(item.name, 8);

        // Отдельный элемент для напитка
        html += `
<div class="item" data-item-key="${item.itemKey}">
    <div class="image-container">
        <img src="${item.image}" alt="${item.name}">
        <span class="volume-label">${item.volume}л</span>
    </div>
    <span class="item-name" title="${item.name}">${truncatedName}</span>
    <div class="quantity">
        <button class="subtract" data-item-key="${item.itemKey}">
            <div class="circle-1">
                <div class="horizontal-line"></div>
            </div>
        </button>
        <span class="item-quantity">${item.quantity}</span>
        <button class="add" data-item-key="${item.itemKey}">
            <div class="circle-1 selected">
                <div class="horizontal-line selected"></div>
                <div class="vertical-line selected"></div>
            </div>
        </button>
    </div>
    <span class="price">${item.liquidPrice.toFixed(0)}₽</span>
    <svg class="delete-btn" data-item-key="${item.itemKey}" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5.48438" y="7.05225" width="2.21625" height="17.73" rx="1" transform="rotate(-45 5.48438 7.05225)" fill="#F93F64"/>
        <rect x="18.0215" y="5.48535" width="2.21625" height="17.73" rx="1" transform="rotate(45 18.0215 5.48535)" fill="#F93F64"/>
    </svg>
</div>
`;

        // Отдельный элемент для тары (если есть стоимость тары)
        if (item.containerPrice > 0) {
            html += `
<div class="item container-item" data-item-key="${item.itemKey}_container">
    <div class="image-container">
        <img src="${item.image}" alt="${item.name}">
        <span class="volume-label">${item.volume}л</span>
    </div>
    <span class="item-name" title="Тара">Бутылка</span>
    <div class="quantity1">
        <span class="item-quantity">${item.quantity}</span>
    </div>
    <span class="price">${item.containerPrice.toFixed(2)}₽</span>
    <div class="delete-placeholder" style="width: 26px; height: 26px;"></div>
</div>
`;
        }

        total += item.totalPrice;
    });

    cartContainer.innerHTML = html;
    totalContainer.innerHTML = `
        <span class="total">Итого к оплате:</span>
        <span class="total-price">${total.toFixed(0)} ₽</span>
    `;
}

function initializeEventHandlers() {
    const cartContainer = document.getElementById('cart-container');

    // Event delegation for add, subtract, and delete buttons
    cartContainer.addEventListener('click', (event) => {
        const target = event.target.closest('button, .delete-btn');
        if (!target) return;

        const itemKey = target.dataset.itemKey;
        if (!itemKey) return;

        // Игнорируем клики по элементам тары
        if (itemKey.includes('_container')) return;

        if (target.classList.contains('add')) {
            const currentState = store.getState();
            const item = currentState.cartItems.find(item => item.itemKey === itemKey);
            if (item) {
                const newQuantity = item.quantity + 1;
                store.dispatch({
                    type: 'UPDATE_QUANTITY',
                    payload: { itemKey, newQuantity }
                });
                localStorage.setItem('cartState', JSON.stringify(store.getState()));
                displayCartItems(store.getState().cartItems);
            }
        } else if (target.classList.contains('subtract')) {
            const currentState = store.getState();
            const item = currentState.cartItems.find(item => item.itemKey === itemKey);
            if (item && item.quantity > 0) {
                const newQuantity = item.quantity - 1;
                store.dispatch({
                    type: 'UPDATE_QUANTITY',
                    payload: { itemKey, newQuantity }
                });
                localStorage.setItem('cartState', JSON.stringify(store.getState()));
                displayCartItems(store.getState().cartItems);
            }
        } else if (target.classList.contains('delete-btn')) {
            store.dispatch({
                type: 'REMOVE_FROM_CART',
                payload: itemKey
            });
            localStorage.setItem('cartState', JSON.stringify(store.getState()));
            displayCartItems(store.getState().cartItems);
        }
    });
}

// Subscribe to store changes to update UI
store.subscribe(() => {
    displayCartItems(store.getState().cartItems);
});
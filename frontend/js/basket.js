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
        html += `
<div class="item" data-item-key="${item.itemKey}">
    <div class="image-container">
        <img src="${item.image}" alt="${item.name}">
        <span class="volume-label">${item.volume}</span>
    </div>
    <span class="item-name">${item.name}</span>
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
    <span class="price">${item.totalPrice.toFixed(0)}₽</span>
    <svg class="delete-btn" data-item-key="${item.itemKey}" width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5.48438" y="7.05225" width="2.21625" height="17.73" rx="1" transform="rotate(-45 5.48438 7.05225)" fill="#F93F64"/>
        <rect x="18.0215" y="5.48535" width="2.21625" height="17.73" rx="1" transform="rotate(45 18.0215 5.48535)" fill="#F93F64"/>
    </svg>
</div>
`;
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

        if (target.classList.contains('add')) {
            const item = document.querySelector(`.item[data-item-key="${itemKey}"]`);
            const quantityElement = item.querySelector('.item-quantity');
            let quantity = parseInt(quantityElement.textContent);
            quantity++;
            store.dispatch({
                type: 'UPDATE_QUANTITY',
                payload: { itemKey, newQuantity: quantity }
            });
            localStorage.setItem('cartState', JSON.stringify(store.getState()));
            displayCartItems(store.getState().cartItems);
        } else if (target.classList.contains('subtract')) {
            const item = document.querySelector(`.item[data-item-key="${itemKey}"]`);
            const quantityElement = item.querySelector('.item-quantity');
            let quantity = parseInt(quantityElement.textContent);
            if (quantity > 0) {
                quantity--;
                store.dispatch({
                    type: 'UPDATE_QUANTITY',
                    payload: { itemKey, newQuantity: quantity }
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
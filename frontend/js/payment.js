document.addEventListener('DOMContentLoaded', function() {
    // Извлекает состояние корзины из localStorage
    const savedState = localStorage.getItem('cartState');
    let totalAmount = 0;

    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            totalAmount = state.totalAmount || 0;
        } catch (e) {
            console.error('Error parsing cartState:', e);
        }
    }

    // Отображение общей цены
    const totalPriceDisplay = document.getElementById('totalPriceDisplay');
    if (totalPriceDisplay) {
        totalPriceDisplay.textContent = `${totalAmount.toFixed(0)} рублей`;
    }
});
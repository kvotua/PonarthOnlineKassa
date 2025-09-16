const savedState = localStorage.getItem('cartState');
const initialState = savedState ? JSON.parse(savedState) : {
    cartItems: [],
    totalAmount: 0
};

function cartReducer(state = initialState, action) {
    switch (action.type) {
        case 'INITIALIZE_STATE':
            return {
                ...state,
                ...action.payload
            };

        case 'ADD_TO_CART':
            const newItem = action.payload;
            const existingItemIndex = state.cartItems.findIndex(
                item => item.itemKey === newItem.itemKey
            );

            let updatedItems;

            if (existingItemIndex !== -1) {
                updatedItems = [...state.cartItems];
                updatedItems[existingItemIndex].quantity += newItem.quantity;
                updatedItems[existingItemIndex].liquidPrice =
                    updatedItems[existingItemIndex].pricePerLiter *
                    updatedItems[existingItemIndex].volume *
                    updatedItems[existingItemIndex].quantity;
                updatedItems[existingItemIndex].containerPrice =
                    updatedItems[existingItemIndex].containerCost *
                    updatedItems[existingItemIndex].quantity;
                updatedItems[existingItemIndex].totalPrice =
                    updatedItems[existingItemIndex].liquidPrice +
                    updatedItems[existingItemIndex].containerPrice;
            } else {
                updatedItems = [...state.cartItems, newItem];
            }

            const newTotalAmount = updatedItems.reduce((total, item) => total + item.totalPrice, 0);

            return {
                ...state,
                cartItems: updatedItems,
                totalAmount: newTotalAmount
            };

        case 'UPDATE_QUANTITY':
            const { itemKey: updateKey, newQuantity } = action.payload;
            const updatedItemsWithQuantity = state.cartItems.map(item => {
                if (item.itemKey === updateKey) {
                    const quantity = Math.max(0, newQuantity);
                    return {
                        ...item,
                        quantity: quantity,
                        liquidPrice: item.pricePerLiter * item.volume * quantity,
                        containerPrice: item.containerCost * quantity,
                        totalPrice: (item.pricePerLiter * item.volume + item.containerCost) * quantity
                    };
                }
                return item;
            }).filter(item => item.quantity > 0);

            const newTotalAfterUpdate = updatedItemsWithQuantity.reduce((total, item) => total + item.totalPrice, 0);

            return {
                ...state,
                cartItems: updatedItemsWithQuantity,
                totalAmount: newTotalAfterUpdate
            };

        case 'REMOVE_FROM_CART':
            const filteredItems = state.cartItems.filter(item => item.itemKey !== action.payload);
            const newTotalAfterRemove = filteredItems.reduce((total, item) => total + item.totalPrice, 0);

            return {
                ...state,
                cartItems: filteredItems,
                totalAmount: newTotalAfterRemove
            };

        case 'CLEAR_CART':
            return {
                ...state,
                cartItems: [],
                totalAmount: 0
            };

        default:
            return state;
    }
}

const store = Redux.createStore(cartReducer);
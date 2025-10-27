const coinButton = document.getElementById('coinButton');
const emojiButton = document.getElementById('emojiButton');
const coinModalOverlay = document.getElementById('coinModalOverlay');
const emojiModalOverlay = document.getElementById('emojiModalOverlay');
const closeCoinButton = document.getElementById('closeCoinButton');
const closeEmojiButton = document.getElementById('closeEmojiButton');
const body = document.body;
const emojiNotification = document.getElementById('emojiNotification');

const coinTabRadios = document.querySelectorAll('input[name="coin-tab-type"]');
const coinTabContents = document.querySelectorAll('#coinModalOverlay .tab-content');

const emojiTabRadios = document.querySelectorAll('input[name="emoji-tab-type"]');
const emojiTabContents = document.querySelectorAll('#emojiModalOverlay .tab-content');

const sortButton = document.getElementById('sortButton');
const sortDropdown = document.getElementById('sortDropdown');
const searchInput = document.querySelector('.search-input');
const operationsList = document.getElementById('operationsList');

const phoneInput = document.getElementById('phoneInput');
const recipientInfo = document.getElementById('recipientInfo');
const recipientName = document.getElementById('recipientName');
const recipientPhone = document.getElementById('recipientPhone');
const sendButton = document.getElementById('sendButton');
const notification = document.getElementById('notification');
const transferSortButton = document.getElementById('transferSortButton');
const transferSortDropdown = document.getElementById('transferSortDropdown');
const transferHistoryList = document.getElementById('transferHistoryList');
const transferSearchInput = document.getElementById('transferSearchInput');

const profileOperationsList = document.getElementById('profileOperationsList');
const editNameButton = document.getElementById('editNameButton');
const editPhoneButton = document.getElementById('editPhoneButton');
const changePasswordButton = document.getElementById('changePasswordButton');
const telegramToggle = document.getElementById('telegramToggle');
const telegramInputContainer = document.getElementById('telegramInputContainer');
const telegramInput = document.getElementById('telegramInput');

const unusedCouponsList = document.getElementById('unusedCouponsList');
const scratchAllButton = document.getElementById('scratchAllButton');
const prizesGrid = document.getElementById('prizesGrid');
const prizesHistoryList = document.getElementById('prizesHistoryList');

const operationsData = [
    {
        id: 1,
        date: "15 мая 2023",
        totalAmount: 3250,
        items: [
            { name: "Хлеб", price: 50 },
            { name: "Молоко", price: 80 },
            { name: "Сыр", price: 250 },
            { name: "Мясо", price: 500 }
        ],
        pointsEarned: 32,
        pointsBefore: 1218,
        pointsAfter: 1250,
        hasPrize: true
    },
    {
        id: 2,
        date: "14 мая 2023",
        totalAmount: 1780,
        items: [
            { name: "Кофе", price: 250 },
            { name: "Десерт", price: 350 },
            { name: "Сок", price: 180 }
        ],
        pointsEarned: 18,
        pointsBefore: 1200,
        pointsAfter: 1218,
        hasPrize: false
    },
    {
        id: 3,
        date: "12 мая 2023",
        totalAmount: 4500,
        items: [
            { name: "Книга", price: 800 },
            { name: "Ручка", price: 50 },
            { name: "Блокнот", price: 150 }
        ],
        pointsEarned: 45,
        pointsBefore: 1155,
        pointsAfter: 1200,
        hasPrize: false
    }
];

const transferHistoryData = [
    {
        id: 1,
        name: "Иван Иванов",
        date: "15 мая 2023",
        amount: -2500,
        type: "Перевод",
        receiptNumber: null
    },
    {
        id: 2,
        name: "Мария Петрова",
        date: "10 мая 2023",
        amount: 1500,
        type: "Поступление",
        receiptNumber: null
    },
    {
        id: 3,
        name: "Супермаркет 'Продукты'",
        date: "8 мая 2023",
        amount: 45,
        type: "Начисление баллов",
        receiptNumber: "Чек №458792"
    },
    {
        id: 4,
        name: "Кофейня 'Aroma'",
        date: "5 мая 2023",
        amount: -30,
        type: "Списание баллов",
        receiptNumber: "Чек №321567"
    },
    {
        id: 5,
        name: "Алексей Смирнов",
        date: "1 мая 2023",
        amount: -10000,
        type: "Перевод",
        receiptNumber: null
    }
];

const unusedCouponsData = [
    { id: 1, date: "15 мая 2023", receipt: "Чек №458792" },
    { id: 2, date: "10 мая 2023", receipt: "Чек №321567" },
    { id: 3, date: "8 мая 2023", receipt: "Чек №289345" }
];

const prizesData = [
    { id: 1, icon: "🐟", name: "Рыбка" },
    { id: 2, icon: "🐠", name: "Рыбка" },
    { id: 3, icon: "🐡", name: "Рыбка" },
    { id: 4, icon: "🎁", name: "Подарок" },
    { id: 5, icon: "🏆", name: "Трофей" },
    { id: 6, icon: "⭐", name: "Звезда" }
];

const prizesHistoryData = [
    { id: 1, icon: "🐟", name: "Рыбка", date: "15 мая 2023" },
    { id: 2, icon: "🐠", name: "Рыбка", date: "10 мая 2023" },
    { id: 3, icon: "🐡", name: "Рыбка", date: "8 мая 2023" },
    { id: 4, icon: "🎁", name: "Подарок", date: "5 мая 2023" }
];

const usersDatabase = [
    { phone: "+79161234567", name: "Иван Иванов" },
    { phone: "+79169876543", name: "Мария Петрова" },
    { phone: "+79165554433", name: "Алексей Смирнов" },
    { phone: "+79167778899", name: "Ольга Козлова" }
];

function showNotification(message) {
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function openCoinModal() {
    emojiModalOverlay.style.display = 'none';

    coinModalOverlay.style.display = 'block';

    body.classList.remove('modal-closing');
    body.classList.add('modal-open');

    loadOperations();
    loadTransferHistory();
}

function openEmojiModal() {
    coinModalOverlay.style.display = 'none';

    emojiModalOverlay.style.display = 'block';

    body.classList.remove('modal-closing');
    body.classList.add('modal-open');

    loadProfileOperations();
    loadUnusedCoupons();
    loadPrizesGrid();
    loadPrizesHistory();
}

function switchCoinTab(tabName) {
    coinTabContents.forEach(content => {
        content.classList.remove('active');
    });

    document.getElementById(`coin-${tabName}-content`).classList.add('active');
}

function switchEmojiTab(tabName) {
    emojiTabContents.forEach(content => {
        content.classList.remove('active');
    });

    document.getElementById(`emoji-${tabName}-content`).classList.add('active');
}

function closeModal() {
    body.classList.add('modal-closing');
    body.classList.remove('modal-open');

    setTimeout(() => {
        body.classList.remove('modal-closing');
        coinModalOverlay.style.display = 'none';
        emojiModalOverlay.style.display = 'none';
    }, 400);
}

coinButton.addEventListener('click', openCoinModal);
emojiButton.addEventListener('click', openEmojiModal);
closeCoinButton.addEventListener('click', closeModal);
closeEmojiButton.addEventListener('click', closeModal);

coinModalOverlay.addEventListener('click', function (event) {
    if (event.target === coinModalOverlay) {
        closeModal();
    }
});

emojiModalOverlay.addEventListener('click', function (event) {
    if (event.target === emojiModalOverlay) {
        closeModal();
    }
});

coinTabRadios.forEach(radio => {
    radio.addEventListener('change', function () {
        if (this.checked) {
            const tabName = this.id.replace('coin-glass-', '');
            switchCoinTab(tabName);
        }
    });
});

emojiTabRadios.forEach(radio => {
    radio.addEventListener('change', function () {
        if (this.checked) {
            const tabName = this.id.replace('emoji-glass-', '');
            switchEmojiTab(tabName);
        }
    });
});

sortButton.addEventListener('click', function () {
    sortDropdown.style.display = sortDropdown.style.display === 'block' ? 'none' : 'block';
});

document.querySelectorAll('.sort-option').forEach(option => {
    option.addEventListener('click', function () {
        const sortType = this.getAttribute('data-sort');
        sortDropdown.style.display = 'none';

        sortButton.querySelector('span').textContent = this.textContent;
    });
});

transferSortButton.addEventListener('click', function () {
    transferSortDropdown.style.display = transferSortDropdown.style.display === 'block' ? 'none' : 'block';
});

document.querySelectorAll('#transferSortDropdown .sort-option').forEach(option => {
    option.addEventListener('click', function () {
        const sortType = this.getAttribute('data-sort');
        transferSortDropdown.style.display = 'none';

        transferSortButton.querySelector('span').textContent = this.textContent;
    });
});

document.addEventListener('click', function (event) {
    if (!sortButton.contains(event.target) && !sortDropdown.contains(event.target)) {
        sortDropdown.style.display = 'none';
    }

    if (!transferSortButton.contains(event.target) && !transferSortDropdown.contains(event.target)) {
        transferSortDropdown.style.display = 'none';
    }
});

function loadOperations() {
    operationsList.innerHTML = '';

    operationsData.forEach(operation => {
        const operationCard = document.createElement('div');
        operationCard.className = 'operation-card';

        let itemsHTML = '';
        operation.items.forEach(item => {
            itemsHTML += `
                        <div class="operation-item">
                            <span class="operation-item-name">${item.name}</span>
                            <span class="operation-item-price">${item.price} ₽</span>
                        </div>
                    `;
        });

        operationCard.innerHTML = `
                    <div class="operation-header">
                        <div class="operation-date">${operation.date}</div>
                        <div class="operation-amount">${operation.totalAmount} ₽</div>
                    </div>
                    <div class="operation-items">
                        ${itemsHTML}
                    </div>
                    <div class="operation-points">
                        <div class="points-earned">+${operation.pointsEarned} баллов</div>
                        <div class="points-total">${operation.pointsBefore} → ${operation.pointsAfter}</div>
                    </div>
                    <div class="operation-footer">
                        <div class="prize-icon">${operation.hasPrize ? '🎁' : ''}</div>
                        <button class="share-button">Поделиться</button>
                    </div>
                `;

        operationsList.appendChild(operationCard);
    });
}

function loadProfileOperations() {
    profileOperationsList.innerHTML = '';

    const recentOperations = operationsData.slice(0, 2);

    recentOperations.forEach(operation => {
        const operationCard = document.createElement('div');
        operationCard.className = 'operation-card';

        operationCard.innerHTML = `
                    <div class="operation-header">
                        <div class="operation-date">${operation.date}</div>
                        <div class="operation-amount">${operation.totalAmount} ₽</div>
                    </div>
                    <div class="operation-points">
                        <div class="points-earned">+${operation.pointsEarned} баллов</div>
                    </div>
                `;

        profileOperationsList.appendChild(operationCard);
    });
}

function loadTransferHistory() {
    transferHistoryList.innerHTML = '';

    transferHistoryData.forEach(transfer => {
        const transferItem = document.createElement('div');
        transferItem.className = 'transfer-history-item';

        const receiptInfo = transfer.receiptNumber ?
            `<div class="receipt-number">${transfer.receiptNumber}</div>` : '';

        transferItem.innerHTML = `
                    <div class="transfer-info">
                        <div class="transfer-name">${transfer.name}</div>
                        <div class="transfer-date">${transfer.date}</div>
                        <div class="transfer-type">${transfer.type}</div>
                        ${receiptInfo}
                    </div>
                    <div class="transfer-amount ${transfer.amount > 0 ? 'positive' : 'negative'}">
                        ${transfer.amount > 0 ? '+' : ''}${transfer.amount} ${transfer.type.includes('балл') ? 'баллов' : '₽'}
                    </div>
                `;

        transferHistoryList.appendChild(transferItem);
    });
}

function loadUnusedCoupons() {
    unusedCouponsList.innerHTML = '';

    unusedCouponsData.forEach(coupon => {
        const couponItem = document.createElement('div');
        couponItem.className = 'unused-coupon-item';
        couponItem.innerHTML = `
                    <div class="unused-coupon-info">
                        <div class="unused-coupon-date">${coupon.date}</div>
                        <div class="unused-coupon-receipt">${coupon.receipt}</div>
                    </div>
                    <button class="scratch-button" data-coupon-id="${coupon.id}">Стереть</button>
                `;
        unusedCouponsList.appendChild(couponItem);
    });

    emojiNotification.textContent = unusedCouponsData.length;
}

function loadPrizesGrid() {
    prizesGrid.innerHTML = '';

    prizesData.forEach(prize => {
        const prizeItem = document.createElement('div');
        prizeItem.className = 'prize-item';
        prizeItem.innerHTML = `
                    <div class="prize-icon">${prize.icon}</div>
                    <div class="prize-name">${prize.name}</div>
                `;
        prizesGrid.appendChild(prizeItem);
    });
}

function loadPrizesHistory() {
    prizesHistoryList.innerHTML = '';

    prizesHistoryData.forEach(prize => {
        const prizeItem = document.createElement('div');
        prizeItem.className = 'prize-history-item';
        prizeItem.innerHTML = `
                    <div class="prize-history-icon">${prize.icon}</div>
                    <div class="prize-history-info">
                        <div class="prize-history-name">${prize.name}</div>
                        <div class="prize-history-date">${prize.date}</div>
                    </div>
                `;
        prizesHistoryList.appendChild(prizeItem);
    });
}

function filterTransferHistory() {
    const searchTerm = transferSearchInput.value.toLowerCase();

    if (!searchTerm) {
        loadTransferHistory();
        return;
    }

    const filteredData = transferHistoryData.filter(transfer =>
        transfer.name.toLowerCase().includes(searchTerm) ||
        transfer.date.toLowerCase().includes(searchTerm) ||
        transfer.type.toLowerCase().includes(searchTerm)
    );

    transferHistoryList.innerHTML = '';

    filteredData.forEach(transfer => {
        const transferItem = document.createElement('div');
        transferItem.className = 'transfer-history-item';

        const receiptInfo = transfer.receiptNumber ?
            `<div class="receipt-number">${transfer.receiptNumber}</div>` : '';

        transferItem.innerHTML = `
                    <div class="transfer-info">
                        <div class="transfer-name">${transfer.name}</div>
                        <div class="transfer-date">${transfer.date}</div>
                        <div class="transfer-type">${transfer.type}</div>
                        ${receiptInfo}
                    </div>
                    <div class="transfer-amount ${transfer.amount > 0 ? 'positive' : 'negative'}">
                        ${transfer.amount > 0 ? '+' : ''}${transfer.amount} ${transfer.type.includes('балл') ? 'баллов' : '₽'}
                    </div>
                `;

        transferHistoryList.appendChild(transferItem);
    });
}


function editName() {
    const currentName = document.querySelector('.profile-name').textContent;
    const newName = prompt('Введите новое имя и фамилию:', currentName);

    if (newName && newName.trim() !== '') {
        document.querySelector('.profile-name').textContent = newName.trim();
        showNotification('Имя успешно изменено');
    }
}

function editPhone() {
    const currentPhone = document.querySelector('.profile-phone').textContent;
    const newPhone = prompt('Введите новый номер телефона:', currentPhone);

    if (newPhone && newPhone.trim() !== '') {
        document.querySelector('.profile-phone').textContent = newPhone.trim();
        showNotification('Номер телефона успешно изменен');
    }
}

function changePassword() {
    showNotification('Функция изменения пароля будет доступна в следующем обновлении');
}

function openScratchCard(couponId) {
    showNotification(`Открывается экран царапания для купона ${couponId}`);
}

function handleTelegramToggle() {
    if (telegramToggle.checked) {
        telegramInputContainer.style.display = 'block';
    } else {
        telegramInputContainer.style.display = 'none';
    }
}

transferSearchInput.addEventListener('input', filterTransferHistory);

phoneInput.addEventListener('input', function () {
    const phone = this.value;

    recipientInfo.style.display = 'none';
    sendButton.disabled = true;

    if (phone.replace(/\D/g, '').length >= 11) {
        const user = checkPhoneNumber(phone);

        if (user) {
            recipientName.textContent = user.name;
            recipientPhone.textContent = user.phone;
            recipientInfo.style.display = 'block';
            sendButton.disabled = false;
        } else {
            showNotification('Номер телефона не найден в системе');
        }
    }
});

sendButton.addEventListener('click', function () {
    showNotification('Перевод успешно отправлен');

    phoneInput.value = '';
    recipientInfo.style.display = 'none';
    sendButton.disabled = true;

    loadTransferHistory();
});

editNameButton.addEventListener('click', editName);
editPhoneButton.addEventListener('click', editPhone);
changePasswordButton.addEventListener('click', changePassword);

telegramToggle.addEventListener('change', handleTelegramToggle);

document.addEventListener('click', function (event) {
    if (event.target.classList.contains('scratch-button')) {
        const couponId = event.target.getAttribute('data-coupon-id');
        if (couponId) {
            openScratchCard(couponId);
        }
    }
});

scratchAllButton.addEventListener('click', function () {
    showNotification('Открывается экран царапания для всех купонов');
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && body.classList.contains('modal-open')) {
        closeModal();
    }
});

loadOperations();
loadTransferHistory();
loadProfileOperations();
loadUnusedCoupons();
loadPrizesGrid();
loadPrizesHistory();
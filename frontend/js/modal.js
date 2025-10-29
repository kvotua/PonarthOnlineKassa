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

const rewardsGrid = document.getElementById('rewardsGrid');
const unusedCouponsList = document.getElementById('unusedCouponsList');
const viewAllCouponsButton = document.getElementById('viewAllCouponsButton');
const prizesGrid = document.getElementById('prizesGrid');
const prizesHistoryList = document.getElementById('prizesHistoryList');

const scratchGameContainer = document.getElementById('scratch-game-container');
const backButton = document.getElementById('backButton');
const gameCardsContainer = document.getElementById('game-cards-container');
const gameCardIndicator = document.getElementById('game-card-indicator');
const fishContainer = document.getElementById("fish-container");
const basket = document.getElementById('basket');
const prizeCounter = document.getElementById('prize-counter');

let operationsData = [];

// const operationsData = [
//     {
//         id: 1,
//         date: "15 мая 2023",
//         totalAmount: 3250,
//         items: [
//             { name: "Хлеб", price: 50 },
//             { name: "Молоко", price: 80 },
//             { name: "Сыр", price: 250 },
//             { name: "Мясо", price: 500 }
//         ],
//         pointsEarned: 32,
//         pointsBefore: 1218,
//         pointsAfter: 1250,
//         hasPrize: true
//     },
//     {
//         id: 2,
//         date: "14 мая 2023",
//         totalAmount: 1780,
//         items: [
//             { name: "Кофе", price: 250 },
//             { name: "Десерт", price: 350 },
//             { name: "Сок", price: 180 }
//         ],
//         pointsEarned: 18,
//         pointsBefore: 1200,
//         pointsAfter: 1218,
//         hasPrize: false
//     },
//     {
//         id: 3,
//         date: "12 мая 2023",
//         totalAmount: 4500,
//         items: [
//             { name: "Книга", price: 800 },
//             { name: "Ручка", price: 50 },
//             { name: "Блокнот", price: 150 }
//         ],
//         pointsEarned: 45,
//         pointsBefore: 1155,
//         pointsAfter: 1200,
//         hasPrize: false
//     }
// ];

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

const rewardsData = [
    { id: 1, icon: "🏆", name: "Кэшбэк 5%", description: "На все покупки в этом месяце", status: "Активно" },
    { id: 2, icon: "⭐", name: "Бесплатная доставка", description: "Действует 30 дней", status: "Активно" },
    { id: 3, icon: "🎁", name: "Подарочная карта", description: "1000 ₽ в магазине электроники", status: "Доступно" },
    { id: 4, icon: "🔔", name: "Уведомления о скидках", description: "Персональные предложения", status: "Активно" },
    { id: 5, icon: "💎", name: "VIP статус", description: "Привилегии для постоянных клиентов", status: "Скоро" },
    { id: 6, icon: "👑", name: "Золотой статус", description: "Эксклюзивные предложения", status: "Заблокировано" }
];

const unusedCouponsData = [
    { id: 1, date: "15 мая 2023", receipt: "Чек №458792" },
    { id: 2, date: "10 мая 2023", receipt: "Чек №321567" },
    { id: 3, date: "8 мая 2023", receipt: "Чек №289345" }
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

let isOpening = false;
let isAnimating = false;

function openCoinModal() {
    if (isAnimating) return;

    isOpening = true;
    isAnimating = true;

    emojiModalOverlay.style.display = 'none';
    coinModalOverlay.style.display = 'block';

    body.classList.add('modal-open');

    const modal = document.querySelector('#coinModalOverlay .modal-content');

    modal.style.transition = 'none';
    modal.style.transform = `translateY(${window.innerHeight}px)`;

    requestAnimationFrame(() => {
        modal.style.transition = 'transform 0.36s cubic-bezier(0.25, 1, 0.5, 1)';
        modal.style.transform = `translateY(${window.innerHeight * 0.3}px)`;

        setTimeout(() => {
            modal.style.transition = 'transform 0.4s ease';
            modal.style.transform = `translateY(${window.innerHeight * 0.4}px)`;

            setTimeout(() => {
                isOpening = false;
                isAnimating = false;
            }, 600);
        }, 360);
    });

    loadOperations();
    loadTransferHistory();
}

function openEmojiModal() {
    if (isAnimating) return;

    isOpening = true;
    isAnimating = true;

    coinModalOverlay.style.display = 'none';
    emojiModalOverlay.style.display = 'block';

    body.classList.add('modal-open');

    const modal = document.querySelector('#emojiModalOverlay .modal-content');

    modal.style.transition = 'none';
    modal.style.transform = `translateY(${window.innerHeight}px)`;

    requestAnimationFrame(() => {
        modal.style.transition = 'transform 0.36s cubic-bezier(0.25, 1, 0.5, 1)';
        modal.style.transform = `translateY(${window.innerHeight * 0.3}px)`;

        setTimeout(() => {
            modal.style.transition = 'transform 0.36s ease';
            modal.style.transform = `translateY(${window.innerHeight * 0.4}px)`;

            setTimeout(() => {
                isOpening = false;
                isAnimating = false;
            }, 600);
        }, 360);
    });

    loadProfileOperations();
    loadRewardsGrid();
    loadUnusedCoupons();
    loadPrizesHistory();
}

function closeModal() {
    document.querySelectorAll('.modal-content').forEach(content => {
        content.style.transition = 'transform 0.1s ease';
        content.style.transform = 'translateY(100%)';
    });

    setTimeout(() => {
        body.classList.remove('modal-open');
        coinModalOverlay.style.display = 'none';
        emojiModalOverlay.style.display = 'none';
    }, 100);
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
        operation.goods.forEach(item => {
            itemsHTML += `
                        <div class="operation-item">
                            <span class="operation-item-name">${item.good_name}</span>
                            <span class="operation-item-dots"></span>
                            <span class="operation-item-price">${item.price} ₽</span>
                        </div>
                    `;
        });

        const dateObj = new Date(operation.date);

        const formattedDate = dateObj.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        operationCard.innerHTML = `
                    <div class="operation-header">
                        <div class="operation-date">${formattedDate}</div>
                        <div class="operation-prices">
                            ${operation.price_total !== operation.price_real
                ? `<div class="operation-amount">${operation.price_real}</div>
                                <div class="operation-total-amount">${operation.price_total} ₽</div>`
                : `<div class="operation-total-amount">${operation.price_total} ₽</div>`
            }
                        </div>
                    </div>
                    <div class="operation-items">
                        ${itemsHTML}
                    </div>
                    <div class="operation-points">
                        <div class="points-earned">+${parseFloat(operation.score_added)} баллов</div>
                        <div class="points-total">${operation.previous_scores} → ${parseFloat(operation.previous_scores) + parseFloat(operation.score_added)}</div>
                    </div>
                    <div class="operation-footer">
                        <div class="prize-icon">${!operation.order_id ? '🎁' : ''}</div>
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

function loadRewardsGrid() {
    rewardsGrid.innerHTML = '';

    rewardsData.forEach(reward => {
        const rewardItem = document.createElement('div');
        rewardItem.className = 'reward-grid-item';
        rewardItem.innerHTML = `
                    <div class="reward-grid-icon">${reward.icon}</div>
                    <div class="reward-grid-name">${reward.name}</div>
                    <div class="reward-grid-description">${reward.description}</div>
                    <div class="reward-grid-status">${reward.status}</div>
                `;
        rewardsGrid.appendChild(rewardItem);
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
                `;
        unusedCouponsList.appendChild(couponItem);
    });

    emojiNotification.textContent = unusedCouponsData.length;
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

let isScratchingAllowed = false;

function initScratchGame() {
    const cards = [1, 2, 3];
    let prizeCount = 0;
    let currentActiveCard = 1;

    const cardsContainer = document.getElementById('cards-container');
    const cardIndicator = document.getElementById('card-indicator');
    const indicatorDots = document.querySelectorAll('.indicator-dot');

    function updateCardIndicator(cardNumber) {
        indicatorDots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.getAttribute('data-card') == cardNumber) {
                dot.classList.add('active');
            }
        });
    }

    cardsContainer.addEventListener('scroll', () => {
        const scrollPosition = cardsContainer.scrollTop;
        const cardHeight = cardsContainer.clientHeight;
        const currentCard = Math.floor(scrollPosition / cardHeight) + 1;

        if (currentCard !== currentActiveCard) {
            currentActiveCard = currentCard;
            updateCardIndicator(currentCard);
        }
    });

    cardIndicator.addEventListener('click', (e) => {
        if (e.target.classList.contains('indicator-dot')) {
            const cardNumber = e.target.getAttribute('data-card');
            const cardIndex = parseInt(cardNumber) - 1;
            const cardHeight = cardsContainer.clientHeight;

            cardsContainer.scrollTo({
                top: cardIndex * cardHeight,
                behavior: 'smooth'
            });

            currentActiveCard = cardNumber;
            updateCardIndicator(cardNumber);
        }
    });

    cards.forEach(cardNumber => {
        const scratchWin = document.getElementById(`scratch-win-${cardNumber}`);
        const coin = document.getElementById(`coin-${cardNumber}`);
        const canvas = document.getElementById(`canvas-${cardNumber}`);
        const ctx = canvas.getContext("2d");
        const cardFish = document.getElementById(`card-fish-${cardNumber}`);
        const startButton = scratchWin.querySelector('.start-button');
        const instruction = scratchWin.querySelector('.instruction');

        const scratcher = scratchWin.querySelector('.scratch-win__scratcher');

        const width = scratcher.offsetWidth;
        const height = scratcher.offsetHeight;

        canvas.width = width;
        canvas.height = height;

        const gradient = ctx.createLinearGradient(0, 0, width, height);

        gradient.addColorStop(0, "#d4af37");
        gradient.addColorStop(0.3, "#a67c00");
        gradient.addColorStop(0.5, "#d4af37");
        gradient.addColorStop(0.8, "#a67c00");
        gradient.addColorStop(1, "#d4af37");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        scratchWin.classList.add("scratch-win--ready");

        const confetti = document.getElementById("confetti");
        const maxPixels = width * height;
        let isWinTriggered = false;

        const calculateTransparency = () => {
            const imageData = ctx.getImageData(0, 0, width, height).data;
            const alphaValues = imageData.filter(
                (value, index) => index % 4 === 3 && value === 0
            );

            return alphaValues.length / maxPixels;
        };

        const updatePrizeCounter = () => {
            prizeCount++;
            prizeCounter.textContent = prizeCount;
            prizeCounter.classList.add('increase');

            setTimeout(() => {
                prizeCounter.classList.remove('increase');
            }, 500);
        };

        const createFishAnimation = () => {
            basket.classList.add('show');
            prizeCounter.classList.add('show');

            cardFish.classList.add('fish-grow');

            setTimeout(() => {
                fishContainer.style.display = 'block';

                const fish = document.createElement('div');
                fish.className = 'fish-animation';
                fish.textContent = cardFish.textContent;

                const cardRect = scratchWin.getBoundingClientRect();
                const scratcherRect = scratchWin.querySelector('.scratch-win__scratcher').getBoundingClientRect();

                fish.style.left = `${scratcherRect.left + scratcherRect.width / 2}px`;
                fish.style.top = `${scratcherRect.top + scratcherRect.height / 2}px`;

                fishContainer.appendChild(fish);

                setTimeout(() => {
                    basket.classList.add('shake');
                    updatePrizeCounter();

                    setTimeout(() => {
                        fish.remove();
                        isScratchingAllowed = false;
                        document.body.style.cursor = 'default';
                        fishContainer.style.display = 'none';
                    }, 500);
                }, 1800);
            }, 800);
        };

        const mouseFunction = (mouse) => {
            if (!isScratchingAllowed) return;

            if (mouse.type === 'touchmove') {
                mouse.preventDefault();
            }

            const clientX = mouse.clientX ? mouse.clientX : mouse.touches[0].clientX;
            const clientY = mouse.clientY ? mouse.clientY : mouse.touches[0].clientY;
            coin.style = `--top: ${clientY}px; --left: ${clientX}px;`;

            const canvasPosition = canvas.getBoundingClientRect();
            const canvasX = clientX - canvasPosition.left;
            const canvasY = clientY - canvasPosition.top;

            if (canvasX > 0 && canvasX < width && canvasY > 0 && canvasY < height) {
                ctx.clearRect(canvasX - 20, canvasY - 20, 40, 40);

                const transparency = calculateTransparency();

                if (transparency > 0.7 && !isWinTriggered) {
                    isWinTriggered = true;
                    confetti.classList.add("confetti--active");
                    createFishAnimation();
                }
            }
        };

        const touchStartHandler = (e) => {
            if (isScratchingAllowed) {
                e.preventDefault();
            }
        };

        startButton.addEventListener('click', () => {
            isScratchingAllowed = true;
            scratchWin.classList.add("scratch-win--active");
            startButton.classList.add('hidden');
            instruction.classList.add('hidden');
            document.body.style.cursor = 'pointer';

            canvas.addEventListener('touchstart', touchStartHandler, { passive: false });
        });

        window.addEventListener("mousemove", mouseFunction);
        window.addEventListener("touchmove", mouseFunction, { passive: false });
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

function openScratchGame() {
    closeModal();

    scratchGameContainer.style.display = 'flex';

    initScratchGame();
}

function closeScratchGame() {
    isScratchingAllowed = false;
    scratchGameContainer.style.display = 'none';
    initScratchGame();
}

viewAllCouponsButton.addEventListener('click', openScratchGame);
backButton.addEventListener('click', closeScratchGame);

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && body.classList.contains('modal-open')) {
        closeModal();
    }
});

document.querySelectorAll('.modal-content').forEach(modal => {
    let isDragging = false;
    let startY = 0;
    let startTranslateY = 0;
    let lastY = 0;
    let velocity = 0;
    let lastTime = 0;

    if (!modal.dataset.initialized) {
        const initialTranslate = window.innerHeight * 0.4;
        modal.style.transform = `translateY(${initialTranslate}px)`;
        modal.dataset.initialized = "true";
    }

    const getCurrentTranslate = () => {
        const style = window.getComputedStyle(modal);
        const matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m42;
    };

    const onPointerDown = (e) => {
        if (isOpening || isAnimating) return;

        isDragging = true;
        startY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        startTranslateY = getCurrentTranslate();
        lastY = startY;
        lastTime = performance.now();
        velocity = 0;

        modal.style.transition = 'none';

        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchmove', onPointerMove, { passive: false });
        window.addEventListener('touchend', onPointerUp);
    };

    const onPointerMove = (e) => {
        if (!isDragging || isOpening) return;

        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        const deltaY = clientY - startY;
        let newTranslateY = startTranslateY + deltaY;

        const modalHeight = modal.offsetHeight;
        const viewportHeight = window.innerHeight;

        const minTranslateY = viewportHeight - modalHeight;

        if (newTranslateY < minTranslateY) {
            newTranslateY = minTranslateY;
        }

        modal.style.transform = `translateY(${newTranslateY}px)`;

        const now = performance.now();
        const dt = now - lastTime;
        velocity = (clientY - lastY) / dt * 16;
        lastY = clientY;
        lastTime = now;

        e.preventDefault();
    };

    const onPointerUp = () => {
        if (!isDragging || isOpening) return;
        isDragging = false;

        let currentTranslate = getCurrentTranslate();
        const modalHeight = modal.offsetHeight;
        const viewportHeight = window.innerHeight;

        const inertiaDistance = velocity * 10;
        let targetTranslate = currentTranslate + inertiaDistance;

        const minTranslateY = viewportHeight - modalHeight;
        const initialTranslate = viewportHeight * 0.4;
        const closeThreshold = viewportHeight * 0.7;

        if (targetTranslate < minTranslateY) {
            targetTranslate = minTranslateY;
        }
        if (targetTranslate > viewportHeight) {
            targetTranslate = viewportHeight;
        }

        if (currentTranslate > closeThreshold || targetTranslate > closeThreshold) {
            modal.style.transition = 'transform 0.2s ease';
            modal.style.transform = 'translateY(100%)';

            setTimeout(() => {
                body.classList.remove('modal-open');
                coinModalOverlay.style.display = 'none';
                emojiModalOverlay.style.display = 'none';
            }, 200);
            return;
        } else if (targetTranslate < initialTranslate - 50 || velocity < -2) {
        } else if (targetTranslate > initialTranslate + 50 || velocity > 2) {
            targetTranslate = initialTranslate;
        } else {
            targetTranslate = initialTranslate;
        }

        modal.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        modal.style.transform = `translateY(${targetTranslate}px)`;

        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
        window.removeEventListener('touchmove', onPointerMove);
        window.removeEventListener('touchend', onPointerUp);
    };

    modal.addEventListener('mousedown', onPointerDown);
    modal.addEventListener('touchstart', onPointerDown, { passive: false });
});


document.addEventListener('DOMContentLoaded', async function () {
    let phone_number = localStorage.getItem("phone");
    let card_num = phone_number

    if (phone_number) {
        card_num = phone_number.replace(/\D/g, '');
        card_num = card_num.slice(1);
    }

    await fetch(`${host}/api/v1/profile?card_num=${card_num}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            console.log('fetch2')
            if (!response.ok) {
                return [];
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            const fioElement = document.getElementById("userFio");
            const userBday = document.getElementById("userBday");
            const userPhone = document.getElementById("userPhone");

            const dateObj = new Date(data.bday);

            const formattedDate = dateObj.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            fioElement.textContent = `${data.first} ${data.second}`
            userBday.textContent = `${formattedDate}`
            userPhone.textContent = `${phone_number}`
        });

    operationsData = await fetch(`${host}/api/v1/basket/all?card_num=${card_num}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                return [];
            }
            return response.json();
        })
        .then(data => {
            return data;
        });


    // loadOperations();
    // loadTransferHistory();
    // loadProfileOperations();
    // loadRewardsGrid();
    // loadUnusedCoupons();
    // loadPrizesHistory();
})
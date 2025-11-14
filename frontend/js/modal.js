const botUsername = "ponarthcrew_bot";

const coinButton = document.getElementById('coinButton');
const emojiButton = document.getElementById('emojiButton');
const coinModalOverlay = document.getElementById('coinModalOverlay');
const emojiModalOverlay = document.getElementById('emojiModalOverlay');
const closeCoinButton = document.getElementById('closeCoinButton');
const closeEmojiButton = document.getElementById('closeEmojiButton');
const body = document.body;
const emojiNotification = document.getElementById('emojiNotification');

const mainContainer = document.getElementById('mainContainer');
const loadingBar = document.getElementById('loading');

const coinTabRadios = document.querySelectorAll('input[name="coin-tab-type"]');
const coinTabContents = document.querySelectorAll('#coinModalOverlay .tab-content');

const emojiTabRadios = document.querySelectorAll('input[name="emoji-tab-type"]');
const emojiTabContents = document.querySelectorAll('#emojiModalOverlay .tab-content');

const sortButton = document.getElementById('sortButton');
const sortDropdown = document.getElementById('sortDropdown');
const searchInput = document.querySelector('.search-input');
const operationsList = document.getElementById('operationsList');

const phoneInput = document.getElementById('phoneInput');
const scoresInput = document.getElementById('scoresInput');

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
const telegramToggle = document.getElementById('telegramToggle');
const telegramInputContainer = document.getElementById('telegramInputContainer');
const telegramInput = document.getElementById('telegramInput');

let showTelegramInputContainer = true;

telegramInput.onclick = () => {
    const url = `https://t.me/${botUsername}?start=start`;

    window.open(url, "_blank");
};

const unusedCouponsSection = document.getElementById('unusedCouponsSection');
const rewardsGrid = document.getElementById('rewardsGrid');
const unusedCouponsList = document.getElementById('unusedCouponsList');
const viewAllCouponsButton = document.getElementById('viewAllCouponsButton');
const prizesGrid = document.getElementById('prizesGrid');
const prizesHistoryList = document.getElementById('prizesHistoryList');
const prizesHistorySection = document.getElementById('prizesHistorySection');

const scratchGameContainer = document.getElementById('scratch-game-container');
const backButton = document.getElementById('backButton');
const gameCardsContainer = document.getElementById('game-cards-container');
const gameCardIndicator = document.getElementById('game-card-indicator');
const fishContainer = document.getElementById("fish-container");
const basket = document.getElementById('basket');
const prizeCounter = document.getElementById('prize-counter');

let operationsData = [];
let rewardsData = [];
let unusedCouponsData = [];
let prizesHistoryData = [];
let transferHistoryData = [];

let lastOperations = [];

// const transferHistoryData = [
//     {
//         id: 1,
//         name: "Иван Иванов",
//         date: "15 мая 2023",
//         amount: -2500,
//         type: "Перевод",
//         receiptNumber: null
//     },
//     {
//         id: 2,
//         name: "Мария Петрова",
//         date: "10 мая 2023",
//         amount: 1500,
//         type: "Поступление",
//         receiptNumber: null
//     },
//     {
//         id: 3,
//         name: "Супермаркет 'Продукты'",
//         date: "8 мая 2023",
//         amount: -45,
//         type: "Начисление баллов",
//         receiptNumber: 5678
//     },
//     {
//         id: 4,
//         name: "Кофейня 'Aroma'",
//         date: "5 мая 2023",
//         amount: -30,
//         type: "Списание баллов",
//         receiptNumber: 1234
//     },
//     {
//         id: 5,
//         name: "Алексей Смирнов",
//         date: "1 мая 2023",
//         amount: -10000,
//         type: "Перевод",
//         receiptNumber: null
//     }
// ];

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

    const modalHeight = modal.offsetHeight;
    const viewportHeight = window.innerHeight;
    let minTranslateY = viewportHeight - modalHeight;

    let initialBefore = window.innerHeight * 0.3;
    let initial = window.innerHeight * 0.4;

    if (initial >= modalHeight) {
        initial = minTranslateY;
        initialBefore = minTranslateY;
    }

    requestAnimationFrame(() => {
        modal.style.transition = 'transform 0.36s cubic-bezier(0.25, 1, 0.5, 1)';
        modal.style.transform = `translateY(${initialBefore}px)`;

        setTimeout(() => {
            modal.style.transition = 'transform 0.36s ease';
            modal.style.transform = `translateY(${initial}px)`;

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
        const modalHeight = content.offsetHeight;
        const viewportHeight = window.innerHeight;
        let minTranslateY = viewportHeight - modalHeight;

        let initialBefore = window.innerHeight * 0.3;
        let initial = window.innerHeight * 0.4;

        if (initial >= modalHeight) {
            initial = minTranslateY + 10;
            initialBefore = minTranslateY;
        }
        content.style.transition = 'transform 0.1s ease';
        content.style.transform = `translateY(${viewportHeight}px)`;
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

    if (tabName == 'profile') {
        const modal = document.querySelector('#emojiModalOverlay .modal-content');

        const modalHeight = modal.offsetHeight;
        const viewportHeight = window.innerHeight;
        let minTranslateY = viewportHeight - modalHeight;

        let initialBefore = window.innerHeight * 0.3;
        let initial = window.innerHeight * 0.4;

        modal.style.transition = 'transform 0.2s ease';
        modal.style.transform = `translateY(${initial}px)`;
    }

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
        sortOperations(sortType);
        loadOperations();

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
        sortTransfers(sortType);
        loadTransferHistory();

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

function sortTransfers(type) {
    if (!Array.isArray(transferHistoryData)) return;

    switch (type) {
        case 'date-newest':
            transferHistoryData.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-oldest':
            transferHistoryData.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-high':
            transferHistoryData.sort((a, b) => b.amount - a.amount);
            break;
        case 'amount-low':
            transferHistoryData.sort((a, b) => a.amount - b.amount);
            break;
    }
}

function sortOperations(type) {
    if (!Array.isArray(operationsData)) return;

    switch (type) {
        case 'date-newest':
            operationsData.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'date-oldest':
            operationsData.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case 'amount-high':
            operationsData.sort((a, b) => b.price_total - a.price_total);
            break;
        case 'amount-low':
            operationsData.sort((a, b) => a.price_total - b.price_total);
            break;
    }
}

function loadOperations(operationsFiltered) {
    operationsList.innerHTML = '';

    const dataToRender = operationsFiltered || operationsData;

    dataToRender.forEach(operation => {
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
                        <div class="prize-icon">${operation.gift_emoji ? operation.gift_emoji : ''}</div>
                        <button class="share-button">Поделиться</button>
                    </div>
                `;

        operationsList.appendChild(operationCard);

        operationsList.addEventListener('click', (e) => {
            const shareBtn = e.target.closest('.share-button');
            if (!shareBtn) return;

            const operationCard = shareBtn.closest('.operation-card');
            if (!operationCard) return;

            const index = Array.from(operationsList.children).indexOf(operationCard);
            const operation = dataToRender[index];
            if (!operation || !operation.order_id) return;

            const shareUrl = `${window.location.origin}/bill.html?order_id=${operation.order_id}`;

            if (navigator.share) {
                navigator.share({
                    title: 'Мой чек',
                    url: shareUrl
                }).catch(err => console.error('Ошибка шаринга:', err));
            } else {
                window.open(shareUrl, '_blank');
            }
        });



    });
}

function loadProfileOperations() {
    profileOperationsList.innerHTML = '';

    const recentOperations = lastOperations.slice(0, 5);

    recentOperations.forEach(operation => {
        const operationCard = document.createElement('div');
        operationCard.className = 'operation-card';

        const dateObj = new Date(operation.date_added);

        const formattedDate = dateObj.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const score = parseFloat(operation.scores);
        const pointsClass = score > 0 ? "points-earned" : "points-spent";
        const pointsText = score > 0 ? `+${score} баллов` : `${score} баллов`;

        operationCard.innerHTML = `
            <div class="operation-header">
                <div class="operation-date">${formattedDate}</div>
                <div class="operation-total-amount">${operation.title == 'Перевод' ? operation.title : operation.title + " ₽"}</div>
            </div>
            <div class="operation-points">
                <div class="${pointsClass}">${pointsText}</div>
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
                    <div class="reward-grid-icon">🎁</div>
                    <div class="reward-grid-name">${reward.title}</div>
                    <div class="reward-grid-description">${reward.description}</div>
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
            `<div class="receipt-number">Чек №${transfer.receiptNumber}</div>` : '';

        const dateObj = new Date(transfer.date);

        const formattedDate = dateObj.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        transferItem.innerHTML = `
                    <div class="transfer-info">
                        <div class="transfer-name">${transfer.name}</div>
                        <div class="transfer-date">${formattedDate}</div>
                        <div class="transfer-type">${transfer.type}</div>
                        ${receiptInfo}
                    </div>
                    <div class="transfer-amount ${transfer.amount > 0 ? 'positive' : 'negative'}">
                        ${transfer.amount > 0 ? '+' : ''}${transfer.amount} баллов
                    </div>
                `;

        transferHistoryList.appendChild(transferItem);
    });
}

function loadUnusedCoupons() {
    unusedCouponsList.innerHTML = '';

    if (!unusedCouponsData || unusedCouponsData.length === 0) {
        unusedCouponsSection.style.display = 'none';
        return;
    } else {
        unusedCouponsSection.style.display = 'flex';
    }

    unusedCouponsData.forEach(coupon => {
        const dateObj = new Date(coupon.present_date);

        const formattedDate = dateObj.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const couponItem = document.createElement('div');
        couponItem.className = 'unused-coupon-item';
        couponItem.innerHTML = `
                    <div class="unused-coupon-info">
                        <div class="unused-coupon-date">${formattedDate}</div>
                        <div class="unused-coupon-receipt">Чек №${coupon.order_id}</div>
                    </div>
                `;
        unusedCouponsList.appendChild(couponItem);
    });

    emojiNotification.textContent = unusedCouponsData.length;
    if (unusedCouponsData.length === 0) {
        emojiNotification.style.display = 'none';
    }
}

function loadPrizesHistory() {
    prizesHistoryList.innerHTML = '';

    if (!prizesHistoryData || prizesHistoryData.length === 0) {
        prizesHistorySection.style.display = 'none';
        return;
    } else {
        prizesHistorySection.style.display = 'block';
    }

    prizesHistoryData.forEach(prize => {
        const dateObj = new Date(prize.date_cancelled);

        const formattedDate = dateObj.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        const prizeItem = document.createElement('div');
        prizeItem.className = 'prize-history-item';
        prizeItem.innerHTML = `
                    <div class="prize-history-icon"><img href="${prize.image || 'https://www.diybeer.com/media/wysiwyg/Beer-Glasses/Steam_Beer_700x700px.png'}"/></div>
                    <div class="prize-history-info">
                        <div class="prize-history-name">${prize.title}</div>
                        <div class="prize-history-date">${formattedDate}</div>
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

    const filteredData = transferHistoryData.filter(transfer => {
        const dateObj = new Date(transfer.date);
        const formattedDate = dateObj.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        const term = searchTerm.toLowerCase();

        return (
            transfer.name.toLowerCase().includes(term) ||
            transfer.date.toLowerCase().includes(term) ||
            formattedDate.toLowerCase().includes(term) ||
            transfer.amount.toString().toLowerCase().includes(term) ||
            transfer.type.toLowerCase().includes(term)
        );
    });

    transferHistoryList.innerHTML = '';

    filteredData.forEach(transfer => {
        const transferItem = document.createElement('div');
        transferItem.className = 'transfer-history-item';

        const receiptInfo = transfer.receiptNumber ?
            `<div class="receipt-number">Чек №${transfer.receiptNumber}</div>` : '';

        const dateObj = new Date(transfer.date);

        const formattedDate = dateObj.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        transferItem.innerHTML = `
                    <div class="transfer-info">
                        <div class="transfer-name">${transfer.name}</div>
                        <div class="transfer-date">${formattedDate}</div>
                        <div class="transfer-type">${transfer.type}</div>
                        ${receiptInfo}
                    </div>
                    <div class="transfer-amount ${transfer.amount > 0 ? 'positive' : 'negative'}">
                        ${transfer.amount > 0 ? '+' : ''}${transfer.amount} баллов
                    </div>
                `;

        transferHistoryList.appendChild(transferItem);
    });
}

function openScratchCard(couponId) {
    showNotification(`Открывается экран царапания для купона ${couponId}`);
}

async function handleTelegramToggle() {
    if (showTelegramInputContainer) {
        if (telegramToggle.checked) {
            telegramInputContainer.style.display = 'block';
        } else {
            telegramInputContainer.style.display = 'none';
        }
    }
    await saveTelegramSend(telegramToggle.checked)
}

async function saveTelegramSend(toggle) {
    const token = localStorage.getItem("access_token");
    await fetch(`${host}/api/v1/telegram`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ send_telegram: toggle })
    })
}

function searchOperations() {
    const query = searchInput.value.trim().toLowerCase();

    if (!query) {
        loadOperations();
        return;
    }

    const filtered = operationsData.filter(operation => {
        return operation.goods.some(item =>
            item.good_name.toLowerCase().includes(query)
        );
    });

    loadOperations(filtered);
}

searchInput.addEventListener('input', searchOperations);

transferSearchInput.addEventListener('input', filterTransferHistory);

IMask(phoneInput, {
    mask: '+{7} (000) 000-00-00',
});

async function updateSendButton() {
    const phone = phoneInput.value.replace(/\D/g, '');
    const scores = parseFloat(scoresInput.value);

    if (phone.length >= 11 && scores > 0) {
        const userInfo = await parseUser(phone);
        if (userInfo) {
            recipientInfo.style.display = 'block';
            recipientName.innerText = userInfo;
            recipientPhone.innerText = phoneInput.value;
            sendButton.disabled = false;
        } else {
            recipientInfo.style.display = 'none';
            sendButton.disabled = true;
        }
    } else {
        recipientInfo.style.display = 'none';
        sendButton.disabled = true;
    }
}

phoneInput.addEventListener('input', updateSendButton);

scoresInput.addEventListener('input', updateSendButton);

sendButton.addEventListener('click', async function () {
    const phoneNumber = phoneInput.value.replace(/\D/g, '');
    const scores = parseFloat(scoresInput.value);

    if (phoneNumber && scores > 0) {
        await sendTransfer(phoneNumber, scores);
    }
});

telegramToggle.addEventListener('change', handleTelegramToggle);

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
        const modalHeight = modal.offsetHeight;
        const viewportHeight = window.innerHeight;
        const initialTranslate = window.innerHeight * 0.4;

        let minTranslateY = viewportHeight - modalHeight;

        if (minTranslateY <= initialTranslate) {
            minTranslateY = initialTranslate;
        }

        modal.style.transform = `translateY(${minTranslateY}px)`;
        modal.dataset.initialized = "true";
    }

    const getCurrentTranslate = () => {
        const style = window.getComputedStyle(modal);
        const matrix = new WebKitCSSMatrix(style.transform);
        return matrix.m42;
    };

    const modalObserver = new ResizeObserver(() => {
        const modalHeight = modal.offsetHeight;
        const viewportHeight = window.innerHeight;
        let minTranslateY = viewportHeight - modalHeight;

        const style = window.getComputedStyle(modal);
        const matrix = new WebKitCSSMatrix(style.transform);
        const currentTranslate = matrix.m42;

        if (currentTranslate < minTranslateY) {
            modal.style.transition = 'transform 0.2s ease';
            modal.style.transform = `translateY(${minTranslateY}px)`;
        }
    });

    modalObserver.observe(modal);

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

        let minTranslateY = viewportHeight - modalHeight;

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
        let closeThreshold = viewportHeight * 0.7;

        if (targetTranslate < minTranslateY) {
            targetTranslate = minTranslateY;
        }
        if (targetTranslate > viewportHeight) {
            targetTranslate = viewportHeight;
        }

        console.log('modalHeight:', modalHeight, 'minTranslateY:', minTranslateY, 'targetTranslate:', targetTranslate, 'closeThreshold:', closeThreshold);

        if (currentTranslate > closeThreshold || targetTranslate > closeThreshold) {
            modal.style.transition = 'transform 0.2s ease';
            modal.style.transform = `translateY(${viewportHeight}px)`;

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

        if (targetTranslate < minTranslateY) {
            targetTranslate = minTranslateY;
        }

        console.log('modalHeight:', modalHeight, 'targetTranslate:', targetTranslate, 'closeThreshold:', closeThreshold);

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

function updateProgress(progress) {
    const progressCircle = document.querySelector('.progress-circle');
    const progressText = document.querySelector('.progress-text');

    progressCircle.style.background = `conic-gradient(#4cd964 0%, #4cd964 ${progress}%, rgba(255, 255, 255, 0.2) ${progress}%, rgba(255, 255, 255, 0.2) 100%)`;
    progressText.textContent = `${progress}%`;
}

function updateRank(referals) {
    const userStatus = document.querySelector('.user-status');
    const progressInfo = document.querySelector('.ref-progress-info');

    let rank = "";
    let nextRank = "";
    let progress = 0;
    let remaining = 0;

    if (referals === 0) {
        rank = "Одиночка";
        nextRank = "Командира отряда";
        progress = 0;
        remaining = 1; // до 1

    } else if (referals >= 1 && referals <= 11) {
        rank = "Командир отряда";
        nextRank = "Командира взвода";
        const min = 1, max = 12;
        progress = ((referals - min) / (max - min)) * 100;
        remaining = 12 - referals;

    } else if (referals >= 12 && referals <= 49) {
        rank = "Командир взвода";
        nextRank = "Командира роты";
        const min = 12, max = 50;
        progress = ((referals - min) / (max - min)) * 100;
        remaining = 50 - referals;

    } else {
        rank = "Командир роты";
        nextRank = null;
        progress = 100;
        remaining = 0;
    }

    // Обновляем круг
    updateProgress(progress.toFixed(0));

    // Обновляем текст
    userStatus.innerText = rank;

    if (nextRank) {
        progressInfo.innerHTML = `До ${nextRank}<br>осталось <span class="highlight">${remaining}</span> друзей`;
    } else {
        progressInfo.innerHTML = `Вы достигли максимального звания`;
    }
}

async function fetchReferals() {
    let phone_number = localStorage.getItem("phone");
    const token = localStorage.getItem("access_token");
    await fetch(`${host}/api/v1/referal`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                const refReferalsValue = document.getElementById('refReferalsValue');
                // const refLastMonthValue = document.getElementById('refLastMonthValue');
                const refCurrentMonthValue = document.getElementById('refCurrentMonthValue');
                const refTotalValue = document.getElementById('refTotalValue');

                updateRank(data.referals);

                refReferalsValue.innerText = `${data.referals}`;
                // refLastMonthValue.innerText = `${data.last_month} ₽`;
                refCurrentMonthValue.innerText = `${data.current_month} ₽`;
                refTotalValue.innerText = `${data.total} ₽`;
            }
        });
}

async function parseUser(phoneNumber) {
    const token = localStorage.getItem("access_token");
    const response = await fetch(`${host}/api/v1/user?phone=${phoneNumber}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (data.status_code) {
        return null;
    } else {
        return data;
    }
}

async function sendTransfer(phoneNumber, scores) {
    const token = localStorage.getItem("access_token");

    try {
        const response = await fetch(`${host}/api/v1/transfer`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ phone: phoneNumber, scores: scores })
        });

        const data = await response.json();

        if (data.status_code === 200) {
            phoneInput.value = '';
            scoresInput.value = '';
            recipientInfo.style.display = 'none';
            sendButton.disabled = true;

            await fetchOperations();
            await fetchProfile();
            loadTransferHistory();
        } else {
            showNotification(data.message);
        }
    } catch (err) {
        console.error("Transfer error:", err);
        showNotification("Произошлка ошибка, попробуйте позже");
    }
}

async function fetchOperations() {
    let phone_number = localStorage.getItem("phone");
    const token = localStorage.getItem("access_token");
    await fetch(`${host}/api/v1/transfers`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                transferHistoryData = data;
            }
        });
}

async function fetchLastOperations() {
    const token = localStorage.getItem("access_token");
    await fetch(`${host}/api/v1/last_operations`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                const profileOperations = document.getElementById('profileOperations')

                profileOperations.textContent = data ? `${parseInt(data.length)}` : "0";
                lastOperations = data;
            }
        });
}

async function fetchProfile() {
    let phone_number = localStorage.getItem("phone");
    const token = localStorage.getItem("access_token");
    await fetch(`${host}/api/v1/profile`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
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
            console.log(data);

            document.getElementById("shareReferal").addEventListener("click", async () => {
                const shareLink = `https://loyality-system.ponarth.com/?referal_id=${data.id}`;

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: "Моя реферальная ссылка",
                            text: "Поделись ссылкой и получи бонус!",
                            url: shareLink
                        });
                        console.log("Ссылка успешно отправлена");
                    } catch (err) {
                        console.log("Пользователь отменил", err);
                    }
                } else {
                    try {
                        await navigator.clipboard.writeText(shareLink);
                        showNotification("Ссылка скопирована в буфер обмена!");
                    } catch (err) {
                        console.error("Ошибка копирования:", err);
                        const tempInput = document.createElement("input");
                        tempInput.value = shareLink;
                        tempInput.style.display = 'none';
                        document.body.appendChild(tempInput);
                        tempInput.select();
                        document.execCommand("copy");
                        document.body.removeChild(tempInput);
                        showNotification("Ссылка скопирована!");
                    }
                }
            });

            // shareLink.value = `https://loyality-system.ponarth.com/?referal_id=${data.id}`;

            const fioElement = document.getElementById("userFio");
            const userBday = document.getElementById("userBday");
            const userPhone = document.getElementById("userPhone");

            const dateObj = new Date(data.bday);

            const formattedDate = dateObj.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            fioElement.textContent = `${data.second} ${data.first} ${data.third}`;
            userBday.textContent = `${formattedDate}`;
            userPhone.textContent = `${phone_number}`;
            originalPhone = phone_number.replace(/\D/g, '');

            rewardsData = data.gifts.filter(gift =>
                gift.status === 'activated'
            );
            unusedCouponsData = data.gifts.filter(gift =>
                gift.status === 'waiting' || gift.status === 'given'
            );
            prizesHistoryData = data.gifts.filter(gift =>
                gift.status === 'used'
            );

            if (data.gifts.length === 0) {
                const profileTabs = document.getElementById('profileTabs');
                const title = document.getElementById('profileModalTitle');

                const rewardsInput = profileTabs.querySelector('#emoji-glass-rewards');
                const rewardsLabel = profileTabs.querySelector('#emoji-glass-tab-label');
                const glider = profileTabs.querySelector('.glass-glider');

                if (title) title.innerText = 'Профиль';

                if (rewardsInput) rewardsInput.remove();
                if (rewardsLabel) rewardsLabel.remove();
                if (glider) glider.style.width = '100%';
            }

            emojiNotification.textContent = unusedCouponsData.length;
            if (unusedCouponsData.length === 0) {
                emojiNotification.style.display = 'none';
            }

            const scoreCoinElement = document.getElementById('scoreCoinAmount');
            const scoreModal = document.getElementById('balanceAmount')
            const profilePoints = document.getElementById('profilePoints')
            const profileRewards = document.getElementById('profileRewards')

            const score = data.total_score
            scoreCoinElement.textContent = score ? `${parseInt(score)} баллов` : "0 баллов";
            scoreModal.textContent = score ? `${parseInt(score)} баллов` : "0 баллов";
            profilePoints.textContent = score ? `${parseInt(score)}` : "0";
            profileRewards.textContent = rewardsData ? `${parseInt(rewardsData.length)}` : "0";

            telegramToggle.checked = data.send_telegram && data.chat_id > 0;
            if (telegramToggle.checked) {
                telegramInputContainer.style.display = 'block';
            } else {
                telegramInputContainer.style.display = 'none';
            }

            if (data.chat_id) {
                if (data.chat_id > 0) {
                    showTelegramInputContainer = false;
                    telegramInputContainer.style.display = 'none';
                }
            }
        });
}

document.addEventListener('DOMContentLoaded', async function () {

    const iframe = document.getElementById('banner-widget');
    const originalWidth = 1097;
    const originalHeight = 626;

    function resizeIframe() {
        const currentWidth = iframe.offsetWidth;
        if (!currentWidth) {
            requestAnimationFrame(resizeIframe);
            return;
        }
        const newHeight = currentWidth * (originalHeight / originalWidth);
        iframe.style.height = newHeight + 'px';
    }

    resizeIframe();

    window.addEventListener('resize', resizeIframe);

    let phone_number = localStorage.getItem("phone");

    const token = localStorage.getItem("access_token");

    try {
        await fetchProfile();
        await fetchReferals();
        await fetchOperations();
        await fetchLastOperations();

        operationsData = await fetch(`${host}/api/v1/basket/all`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
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
    } finally {
        mainContainer.style.display = 'flex';
        loadingBar.style.display = 'none';
    }


    // loadOperations();
    // loadTransferHistory();
    // loadProfileOperations();
    // loadRewardsGrid();
    // loadUnusedCoupons();
    // loadPrizesHistory();
})
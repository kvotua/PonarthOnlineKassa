
let isScratchingAllowed = false;

function initScratchGame() {
    const cardsData = unusedCouponsData;
    let prizeCount = 0;
    let currentActiveCard = 0;

    const cardsContainer = document.getElementById('cards-container');
    const cardIndicator = document.getElementById('card-indicator');

    cardsContainer.innerHTML = '';
    cardIndicator.innerHTML = '';

    cardsData.forEach((card, index) => {
        const cardNumber = index;

        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'card-wrapper';
        cardWrapper.innerHTML = `
            <div class="scratch-win" id="scratch-win-${cardNumber}">
                <div class="logo-container">
                    <div class="logo-text">ЛОГОТИП</div>
                </div>

                <div class="scratch-win__scratcher">
                    <div class="scratch-win__background">
                        <img src="${card.image || 'https://www.diybeer.com/media/wysiwyg/Beer-Glasses/Steam_Beer_700x700px.png'}" 
                             alt="${card.title}" 
                             id="card-fish-${cardNumber}" 
                             style="width: 80px; height: 80px; margin-bottom: 1rem;" />
                        <div>${card.title}</div>
                    </div>
                    <canvas id="canvas-${cardNumber}" class="scratch-win__foreground"></canvas>
                </div>

                <div class="scratch-win__title">Царапай и выигрывай</div>
                <div class="progress-info">Сотрите защитный слой</div>
                <button class="start-button" data-card="${cardNumber}">Приступить</button>
            </div>
        `;
        cardsContainer.appendChild(cardWrapper);

        const coin = document.createElement('div');
        coin.id = `coin-${cardNumber}`;
        coin.className = 'scratch-win__coin';
        coin.innerHTML = `
            <div class="scratch-win__coin-side"></div>
            <div class="scratch-win__coin-base"></div>
        `;
        document.getElementById('scratch-game-container').appendChild(coin);

        const dot = document.createElement('div');
        dot.className = index === 0 ? 'indicator-dot active' : 'indicator-dot';
        dot.setAttribute('data-card', cardNumber);
        cardIndicator.appendChild(dot);
    });

    const indicatorDots = document.querySelectorAll('.indicator-dot');

    function updateCardIndicator(cardNumber) {
        indicatorDots.forEach(dot => {
            dot.classList.remove('active');
            if (parseInt(dot.getAttribute('data-card')) === cardNumber) {
                dot.classList.add('active');
            }
        });
    }

    cardsContainer.addEventListener('scroll', () => {
        const scrollPosition = cardsContainer.scrollTop;
        const cardHeight = cardsContainer.clientHeight;
        const currentCard = Math.floor(scrollPosition / cardHeight);

        if (currentCard !== currentActiveCard) {
            currentActiveCard = currentCard;
            updateCardIndicator(currentCard);
        }
    });

    cardIndicator.addEventListener('click', (e) => {
        if (e.target.classList.contains('indicator-dot')) {
            const cardNumber = parseInt(e.target.getAttribute('data-card'));
            const cardHeight = cardsContainer.clientHeight;

            cardsContainer.scrollTo({
                top: cardNumber * cardHeight,
                behavior: 'smooth'
            });

            currentActiveCard = cardNumber;
            updateCardIndicator(cardNumber);
        }
    });

    cardsData.forEach((card, index) => {
        const cardNumber = index;
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
        let isScratchingAllowed = false;

        const calculateTransparency = () => {
            const imageData = ctx.getImageData(0, 0, width, height).data;
            const alphaValues = imageData.filter((value, i) => i % 4 === 3 && value === 0);
            return alphaValues.length / maxPixels;
        };

        const prizeCounter = document.getElementById('prize-counter');
        const basket = document.getElementById('basket');
        const fishContainer = document.getElementById('fish-container');

        const updatePrizeCounter = () => {
            prizeCount++;
            prizeCounter.textContent = prizeCount;
            prizeCounter.classList.add('increase');
            setTimeout(() => prizeCounter.classList.remove('increase'), 500);
        };

        const createFishAnimation = () => {
            basket.classList.add('show');
            prizeCounter.classList.add('show');

            const fishClone = cardFish.cloneNode(true);
            fishClone.style.position = 'fixed';
            fishClone.style.width = `${cardFish.offsetWidth}px`;
            fishClone.style.height = `${cardFish.offsetHeight}px`;
            fishClone.style.zIndex = 1001;
            fishClone.style.transition = 'transform 2s ease-in-out, opacity 2s ease-in-out';

            const rect = cardFish.getBoundingClientRect();
            fishClone.style.left = `${rect.left}px`;
            fishClone.style.top = `${rect.top}px`;
            fishClone.style.transform = 'translate(0, 0)';
            fishClone.style.opacity = '1';

            fishContainer.style.display = 'block';
            fishContainer.appendChild(fishClone);

            const basketRect = basket.getBoundingClientRect();
            const deltaX = basketRect.left + basketRect.width / 2 - rect.left - rect.width / 2;
            const deltaY = basketRect.top + basketRect.height / 2 - rect.top - rect.height / 2;

            setTimeout(() => {
                fishClone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.5)`;
                fishClone.style.opacity = '0';
            }, 50);

            setTimeout(async () => {
                fishClone.remove();
                isScratchingAllowed = false;
                document.body.style.cursor = 'default';
                fishContainer.style.display = 'none';
                basket.classList.add('shake');
                updatePrizeCounter();

                try {
                    await activateGift(card.id);
                } catch (err) {
                    console.error('Ошибка при активации подарка:', err);
                }
            }, 2050);
        };

        const mouseFunction = (e) => {
            if (!isScratchingAllowed) return;
            if (e.type === 'touchmove') e.preventDefault();

            const clientX = e.clientX ?? e.touches[0].clientX;
            const clientY = e.clientY ?? e.touches[0].clientY;
            coin.style = `--top: ${clientY}px; --left: ${clientX}px;`;

            const canvasRect = canvas.getBoundingClientRect();
            const x = clientX - canvasRect.left;
            const y = clientY - canvasRect.top;

            if (x > 0 && x < width && y > 0 && y < height) {
                ctx.clearRect(x - 20, y - 20, 40, 40);
                const transparency = calculateTransparency();
                if (transparency > 0.7 && !isWinTriggered) {
                    isWinTriggered = true;
                    confetti.classList.add("confetti--active");
                    createFishAnimation();
                }
            }
        };

        const touchStartHandler = (e) => {
            if (isScratchingAllowed) e.preventDefault();
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

async function activateGift(gift_id) {
    const token = localStorage.getItem("access_token");
    await fetch(`${host}/api/v1/gift/open?gift_id=${gift_id}`, {
        method: 'PATCH',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        }
    })
    await fetchProfile();
}

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
    openEmojiModal();
}

viewAllCouponsButton.addEventListener('click', openScratchGame);
backButton.addEventListener('click', closeScratchGame);
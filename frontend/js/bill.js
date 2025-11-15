const urlParamsBill = new URLSearchParams(window.location.search);
const orderId = urlParamsBill.get('order_id');

const billContainer = document.getElementById('billContainer');
const billDate = document.getElementById('billDate');
const billStaff = document.getElementById('billStaff');
const billBuyer = document.getElementById('billBuyer');

if (!orderId) {
  billDate.style.display = 'none';
  billStaff.style.display = 'none';
  billBuyer.style.display = 'none';
  billContainer.innerHTML = `<div class="bill-error">Не указан номер чека.</div>`;
} else {
  fetch(`${host}/api/v1/orders/bill?order_id=${orderId}`)
    .then(res => {
      if (!res.ok) throw new Error('Ошибка при загрузке данных');
      return res.json();
    })
    .then(bill => {
      renderBill(bill);
    })
    .catch(err => {
      console.error(err);
      billContainer.innerHTML = `<div class="bill-error">Не удалось загрузить чек.</div>`;
    });
}

function renderBill(bill) {
  const date = new Date(bill.date).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const types = {
    1: 'л.',
    2: 'кг.',
    3: 'шт.'
  }

  const goodsHTML = bill.goods.map(good => `
    <div class="receipt-item">
        <div class="receipt-item-name">
            ${good.good_name}
            <span class="receipt-item-quantity">${good.count} ${types[good.type]}</span>
        </div>
        <div class="receipt-item-price">${good.price} ₽</div>
    </div>
`).join('');


  const dateObj = new Date(bill.date);

  const formattedDate = dateObj.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
  });

  const billHTML = `
  <div class="bill">
    <div class="receipt-header">
        <div class="receipt-info">
            <div class="receipt-title">Сумма чека <span class="receipt-number">#${bill.order_id}</span><br>от ${formattedDate}</div>
        </div>
        <div class="receipt-total-amount">${bill.price_total} ₽</div>
    </div>
    <div class="receipt-items">
        ${goodsHTML}
    </div>

    <div class="receipt-points-info">
        <div class="receipt-points-label">Накоплено баллов</div>
        <div class="receipt-points-change">
            <div class="receipt-points-before">${bill.previous_scores}</div>
            <div class="receipt-points-arrow">→</div>
            <div class="receipt-points-after">${parseFloat(bill.previous_scores) + parseFloat(bill.score_added)}</div>
        </div>
    </div>
    ${bill.gift.emoji ?
        `
        <div class="receipt-gifts-info">
            <div class="receipt-gifts-label">Подарки в чеке</div>
            <div class="receipt-gifts-icons">
                <div class="receipt-gift-icon">${bill.gift.emoji}</div>
            </div>
        </div>
        ` : ''
    }

    <div class="receipt-footer" style="flex-direction: column; align-items: start;">
        <div class="receipt-served-by">Обслуживал: ${bill.user.short_fio}</div>
        <div class="receipt-served-by">Покупатель: ${bill.buyer}</div>
    </div>
  </div>
`;

  billContainer.innerHTML = billHTML;

  document.querySelectorAll('.bill-item-name').forEach(nameEl => {
    const lineHeight = parseFloat(window.getComputedStyle(nameEl).lineHeight);
    const height = nameEl.offsetHeight;

    if (height > lineHeight + 1) {
      nameEl.classList.add('multiline');
    }
  });
}
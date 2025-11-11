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

  billDate.innerText = `Чек от ${date}`
  billStaff.innerText = `Обслуживал: ${bill.user.short_fio}`
  billBuyer.innerText = `Покупатель: ${bill.buyer}`

  const types = {
    1: 'литр',
    2: 'кг',
    3: 'шт'
  }

  const goodsHTML = bill.goods.map(good => `
  <div class="bill-item">
    <span class="bill-item-name">${good.count < 1 ? good.good_name : `${good.good_name} × ${good.count} ${types[good.type]}`}</span>
    <span class="bill-item-dots"></span>
    <span class="bill-item-price">${good.price.toFixed(2)} ₽</span>
  </div>
`).join('');

  const totalHTML = bill.price_total !== bill.price_real
    ? `<div class="bill-total">
        Итого: 
        <span style="text-decoration: line-through; opacity:0.6; margin-left: 4px;">${bill.price_real}₽</span>
        <span style="margin-left:4px;">${bill.price_total}₽</span><br>
        Баллы начислены: +${bill.score_added}
     </div>`
    : `<div class="bill-total">
        Итого: ${bill.price_total}₽<br>
        Баллы начислены: +${bill.score_added}
     </div>`;

  const billHTML = `
  <div class="bill">
    <div class="bill-header">
      <span>Чек №${bill.order_id}</span>
    </div>
    <div class="bill-items">${goodsHTML}</div>
    ${totalHTML}
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
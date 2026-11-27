const cartBox = document.querySelector('#cart');
const payLink = document.querySelector('#pay');

function renderCart() {
  const cart = getCart();
  cartBox.innerHTML = '';

  if (cart.length === 0) {
    cartBox.textContent = t('cartEmpty');
    return;
  }

  const table = document.createElement('table');
  const headRow = table.insertRow();
  ['colNum', 'colName', 'colPrice', 'colQty', 'colSum', ''].forEach(function (key) {
    const th = document.createElement('th');
    th.textContent = key ? t(key) : '';
    headRow.appendChild(th);
  });

  let total = 0;
  cart.forEach(function (item, index) {
    const product = findProduct(item.id);
    if (!product) return;
    const sum = product.price * item.qty;
    total += sum;

    const row = table.insertRow();
    row.dataset.id = item.id;
    row.insertCell().textContent = index + 1 + '.';
    row.insertCell().textContent = t('gameFormat').replace('{name}', product.name);
    row.insertCell().textContent = product.price.toFixed(2);

    const qtyCell = row.insertCell();
    const qty = document.createElement('input');
    qty.type = 'number';
    qty.min = 1;
    qty.value = item.qty;
    qty.className = 'qty';
    qtyCell.appendChild(qty);

    row.insertCell().textContent = sum.toFixed(2);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'remove';
    del.textContent = t('remove');
    row.insertCell().appendChild(del);
  });

  const footer = table.insertRow();
  const label = footer.insertCell();
  label.colSpan = 4;
  label.textContent = t('total');
  const totalCell = footer.insertCell();
  totalCell.colSpan = 2;
  totalCell.textContent = `${total.toFixed(2)} ${t('currency')}`;

  cartBox.appendChild(table);
}

// Зміна кількості
cartBox.addEventListener('change', function (event) {
  if (!event.target.classList.contains('qty')) return;
  const id = Number(event.target.closest('tr').dataset.id);
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  item.qty = Math.max(1, parseInt(event.target.value, 10) || 1);
  saveCart(cart);
  renderCart();
});

// Видалення товару
cartBox.addEventListener('click', function (event) {
  if (!event.target.classList.contains('remove')) return;
  const id = Number(event.target.closest('tr').dataset.id);
  saveCart(getCart().filter(i => i.id !== id));
  renderCart();
});

// Оплата
payLink.addEventListener('click', function (event) {
  event.preventDefault();
  if (getCart().length === 0) {
    openModal(t('cartEmpty'), [{ text: t('ok') }]);
    return;
  }
  saveCart([]);
  renderCart();
  openModal(t('thanks'), [{ text: t('ok') }]);
});

initLanguage()
  .then(function () {
    setupLanguageSelect(renderCart);
    renderCart();
  })
  .catch(function (error) {
    console.error('Помилка завантаження:', error);
    cartBox.textContent = 'Failed to load / Не вдалося завантажити.';
  });

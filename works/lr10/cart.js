const cartBox = document.querySelector('#cart');
const payLink = document.querySelector('#pay');

function renderCart() {
  const cart = getCart();
  cartBox.innerHTML = '';

  if (cart.length === 0) {
    cartBox.textContent = 'Корзина пуста';
    return;
  }

  const table = document.createElement('table');
  table.innerHTML = '<tr><th>№</th><th>Назва товару</th><th>Ціна за од.</th><th>К-сть</th><th>Сума</th><th></th></tr>';

  let total = 0;
  cart.forEach(function (item, index) {
    const product = findProduct(item.id);
    const sum = product.price * item.qty;
    total += sum;

    const row = table.insertRow();
    row.dataset.id = item.id;
    row.insertCell().textContent = index + 1 + '.';
    row.insertCell().textContent = `Гра «${product.name}»`;
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
    del.textContent = 'видалити';
    row.insertCell().appendChild(del);
  });

  const footer = table.insertRow();
  const label = footer.insertCell();
  label.colSpan = 4;
  label.textContent = 'Разом до оплати:';
  const totalCell = footer.insertCell();
  totalCell.colSpan = 2;
  totalCell.textContent = `${total.toFixed(2)} грн.`;

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
    openModal('Корзина пуста', [{ text: 'OK' }]);
    return;
  }
  saveCart([]);
  renderCart();
  openModal('Дякуємо за замовлення!', [{ text: 'OK' }]);
});

renderCart();

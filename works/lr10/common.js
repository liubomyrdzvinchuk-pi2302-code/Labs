// Каталог настільних ігор (варіант 4)
const PRODUCTS = [
  { id: 1, name: 'Каркассон', price: 650, icon: '🏰', badge: 'Хіт продажів' },
  { id: 2, name: 'Монополія', price: 899, icon: '🎩', badge: '' },
  { id: 3, name: 'Uno', price: 180, icon: '🃏', badge: 'Хіт продажів' },
  { id: 4, name: 'Дженга', price: 420, icon: '🧱', badge: '' },
  { id: 5, name: 'Шахи', price: 350, icon: '♟️', badge: 'Новинка' },
  { id: 6, name: 'Доббль', price: 290, icon: '🎯', badge: '' },
  { id: 7, name: 'Манчкін', price: 560, icon: '⚔️', badge: '' },
  { id: 8, name: 'Скрабл', price: 480, icon: '🔤', badge: '' }
];

const CART_KEY = 'lr10-cart';

function getCart() {
  try {
    const data = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(data) ? data : [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {}
}

function findProduct(id) {
  return PRODUCTS.find(p => p.id === id);
}

// Модальне вікно: повідомлення, необов'язкове поле кількості та кнопки
function openModal(message, buttons, withQuantity) {
  const dialog = document.createElement('dialog');

  const text = document.createElement('p');
  text.textContent = message;
  dialog.appendChild(text);

  let qty = null;
  if (withQuantity) {
    qty = document.createElement('input');
    qty.type = 'number';
    qty.min = 1;
    qty.value = 1;
    dialog.appendChild(qty);
  }

  const row = document.createElement('p');
  buttons.forEach(function (b) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = b.text;
    btn.addEventListener('click', function () {
      dialog.close();
      if (b.onClick) b.onClick(qty ? Math.max(1, parseInt(qty.value, 10) || 1) : null);
    });
    row.append(btn, ' ');
  });
  dialog.appendChild(row);

  dialog.addEventListener('close', function () {
    dialog.remove();
  });

  document.body.appendChild(dialog);
  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
  return dialog;
}

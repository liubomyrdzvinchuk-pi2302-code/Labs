const productsBox = document.querySelector('#products');
const cartLink = document.querySelector('#cart-link');
const cartCount = document.querySelector('#cart-count');

// Кількість найменувань у корзині (а не штук)
function updateCartCount() {
  cartCount.textContent = getCart().length;
}

function renderProducts() {
  PRODUCTS.forEach(function (p) {
    const card = document.createElement('div');
    card.className = 'card';

    if (p.badge) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = p.badge;
      card.appendChild(badge);
    }

    const icon = document.createElement('img');
    icon.src = p.image;
    icon.alt = p.name;
    icon.width = 170;
    icon.height = 120;
    icon.style.objectFit = 'cover';

    const name = document.createElement('h3');
    name.textContent = p.name;

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = `${p.price} грн`;

    const add = document.createElement('button');
    add.type = 'button';
    add.textContent = 'Додати у корзину';
    add.dataset.id = p.id;

    card.append(icon, name, price, add);
    productsBox.appendChild(card);
  });
}

// Додавання у корзину
function addToCart(id, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) item.qty += quantity;
  else cart.push({ id: id, qty: quantity });
  saveCart(cart);
  updateCartCount();
}

productsBox.addEventListener('click', function (event) {
  if (event.target.tagName !== 'BUTTON') return;
  const id = Number(event.target.dataset.id);

  openModal('Вкажіть кількість:', [
    {
      text: 'Додати до корзини',
      onClick: function (quantity) {
        addToCart(id, quantity);
        openModal('Товар додано', [
          { text: 'Перейти у корзину', onClick: function () { location.href = 'cart.html'; } },
          { text: 'Повернутись до покупок' }
        ]);
      }
    }
  ], true);
});

// Клік по корзині: порожня - модальне вікно, інакше перехід
cartLink.addEventListener('click', function (event) {
  if (getCart().length === 0) {
    event.preventDefault();
    openModal('Корзина пуста', [{ text: 'OK' }]);
  }
});

renderProducts();
updateCartCount();

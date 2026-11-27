const productsBox = document.querySelector('#product-container');
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

    const img = document.createElement('img');
    img.src = p.image;
    img.alt = p.name;
    img.width = 200;
    img.height = 140;

    const name = document.createElement('h3');
    name.textContent = p.name;

    const category = document.createElement('p');
    category.className = 'category';
    category.textContent = p.category;

    const description = document.createElement('p');
    description.textContent = p.description;

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = `${p.price} ${t('currency')}`;

    const add = document.createElement('button');
    add.type = 'button';
    add.textContent = t('addToCart');
    add.dataset.id = p.id;

    card.append(img, name, category, description, price, add);
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

  openModal(t('qtyPrompt'), [
    {
      text: t('addConfirm'),
      onClick: function (quantity) {
        addToCart(id, quantity);
        openModal(t('added'), [
          { text: t('goCart'), onClick: function () { location.href = 'cart.html'; } },
          { text: t('backShop') }
        ]);
      }
    }
  ], true);
});

// Клік по корзині: порожня - модальне вікно, інакше перехід
cartLink.addEventListener('click', function (event) {
  if (getCart().length === 0) {
    event.preventDefault();
    openModal(t('cartEmpty'), [{ text: t('ok') }]);
  }
});

const pageTitle = document.createElement('h1');
productsBox.before(pageTitle);

// Показ сторінки обраною мовою
function showPage() {
  document.title = PAGE_TITLE;
  pageTitle.textContent = PAGE_TITLE;
  cartLink.setAttribute('aria-label', t('cartAria'));
  productsBox.replaceChildren();
  renderProducts();
  updateCartCount();
}

initLanguage()
  .then(function () {
    setupLanguageSelect(showPage);
    showPage();
  })
  .catch(function (error) {
    console.error('Помилка завантаження:', error);
    productsBox.textContent = 'Failed to load / Не вдалося завантажити.';
  });

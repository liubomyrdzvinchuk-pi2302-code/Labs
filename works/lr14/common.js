// мови
const LANGS = { uk: 'Українська', en: 'English' };
const LANG_KEY = 'lr14-lang';
const CART_KEY = 'lr14-cart';

let PRODUCTS = [];
let UI = {};
let PAGE_TITLE = '';
let currentLang = 'uk';

function getSavedLang() {
  try {
    const lang = localStorage.getItem(LANG_KEY);
    return LANGS[lang] ? lang : null;
  } catch (e) {
    return null;
  }
}

function saveLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch (e) {}
}

async function loadJson(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('HTTP ' + response.status);
  }
  return response.json();
}

// Завантаження перекладів інтерфейсу та товарів обраною мовою
async function loadLanguage(lang) {
  const results = await Promise.all([
    loadJson(`locales/${lang}.json`),
    loadJson(`products.${lang}.json`)
  ]);
  UI = results[0];
  PRODUCTS = results[1].products;
  PAGE_TITLE = results[1].title;
  currentLang = lang;
  document.documentElement.lang = lang;
  applyTexts();
}

function t(key) {
  return UI[key] !== undefined ? UI[key] : key;
}

// Оновлення статичних текстів (атрибут data-i18n)
function applyTexts() {
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    el.textContent = t(el.dataset.i18n);
  });
  const select = document.querySelector('#lang-select');
  if (select) select.value = currentLang;
}

// Перемикач мови на сторінці
function setupLanguageSelect(onChange) {
  const select = document.querySelector('#lang-select');
  Object.keys(LANGS).forEach(function (code) {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = LANGS[code];
    select.appendChild(option);
  });
  select.value = currentLang;

  select.addEventListener('change', async function () {
    saveLang(select.value);
    try {
      await loadLanguage(select.value);
      onChange();
    } catch (error) {
      console.error('Помилка завантаження мови:', error);
    }
  });
}

// Модальне вікно вибору мови (перший візит)
function chooseLanguage() {
  return new Promise(function (resolve) {
    const buttons = Object.keys(LANGS).map(function (code) {
      return { text: LANGS[code], onClick: function () { resolve(code); } };
    });
    const dialog = openModal('Оберіть мову / Choose language', buttons);
    dialog.addEventListener('cancel', function (event) {
      event.preventDefault();
    });
  });
}

async function initLanguage() {
  let lang = getSavedLang();
  if (!lang) {
    lang = await chooseLanguage();
    saveLang(lang);
  }
  await loadLanguage(lang);
}

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

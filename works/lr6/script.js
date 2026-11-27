// ==============================
// DOM
// ==============================
const tabsContainer = document.querySelector('#tabs');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

const topLeft = document.querySelector('#top-left');
const topRight = document.querySelector('#top-right');
const bottomRight = document.querySelector('#bottom-right');
const bottomLeft = document.querySelector('#bottom-left');

const topLeftValue = document.querySelector('#top-left-value');
const topRightValue = document.querySelector('#top-right-value');
const bottomRightValue = document.querySelector('#bottom-right-value');
const bottomLeftValue = document.querySelector('#bottom-left-value');

// Індивідуальний варіант 4: opacity та cursor
const opacity = document.querySelector('#opacity');
const opacityValue = document.querySelector('#opacity-value');
const cursor = document.querySelector('#cursor');

const preview = document.querySelector('#preview');
const previewButton = document.querySelector('#preview-button');
const coordinates = document.querySelector('#coordinates');

const cssCode = document.querySelector('#css-code');
const copyButton = document.querySelector('#copy-button');
const copyMessage = document.querySelector('#copy-message');

const presetForm = document.querySelector('#preset-form');
const presetName = document.querySelector('#preset-name');
const presetError = document.querySelector('#preset-error');

const scrollTopButton = document.querySelector('#scroll-top');

let radius = '0px 0px 0px 0px';

// ==============================
// TABS
// ==============================
function hideTabs() {
  tabs.forEach(function (tab) {
    tab.classList.remove('active');
  });

  tabContents.forEach(function (content) {
    content.classList.remove('active');
  });
}

function showTab(tabName) {
  const tab = document.querySelector(`[data-tab="${tabName}"]`);
  const content = document.querySelector(`[data-content="${tabName}"]`);

  tab.classList.add('active');
  content.classList.add('active');
}

tabs.forEach(function (tab) {
  tab.addEventListener('click', function (event) {
    console.log(event.type);
    console.log(event.target);
    console.log(event.currentTarget);

    const tabName = event.currentTarget.dataset.tab;

    hideTabs();
    showTab(tabName);
  });
});

// ==============================
// CSS CODE
// ==============================
function updateCSS() {
  cssCode.value =
    `border-radius: ${radius};\n` +
    `opacity: ${opacity.value};\n` +
    `cursor: ${cursor.value};`;
}

// ==============================
// BORDER RADIUS
// ==============================
function generateBorderRadius() {
  const topLeftRadius = topLeft.value;
  const topRightRadius = topRight.value;
  const bottomRightRadius = bottomRight.value;
  const bottomLeftRadius = bottomLeft.value;

  radius = `${topLeftRadius}px ${topRightRadius}px ${bottomRightRadius}px ${bottomLeftRadius}px`;

  preview.style.borderRadius = radius;

  topLeftValue.textContent = `${topLeftRadius} px`;
  topRightValue.textContent = `${topRightRadius} px`;
  bottomRightValue.textContent = `${bottomRightRadius} px`;
  bottomLeftValue.textContent = `${bottomLeftRadius} px`;

  updateCSS();
}

topLeft.addEventListener('input', generateBorderRadius);
topRight.addEventListener('input', generateBorderRadius);
bottomRight.addEventListener('input', generateBorderRadius);
bottomLeft.addEventListener('input', generateBorderRadius);

// ==============================
// OPACITY ТА CURSOR (варіант 4)
// ==============================
opacity.addEventListener('input', function () {
  preview.style.opacity = opacity.value;
  opacityValue.textContent = opacity.value;
  updateCSS();
});

cursor.addEventListener('change', function () {
  preview.style.cursor = cursor.value;
  updateCSS();
});

// ==============================
// COPY
// ==============================
function copyCSS() {
  navigator.clipboard.writeText(cssCode.value).then(function () {
    copyMessage.textContent = 'CSS-код скопійовано';
  }).catch(function () {
    cssCode.select();
    document.execCommand('copy');
    copyMessage.textContent = 'CSS-код скопійовано';
  });
}

copyButton.addEventListener('click', copyCSS);

// ==============================
// FORM
// ==============================
function validatePresetName() {
  if (presetName.value.trim() === '') {
    presetName.classList.add('error');
    presetError.textContent = 'Введіть назву пресета';
    return false;
  }

  presetName.classList.remove('error');
  presetError.textContent = '';
  return true;
}

presetName.addEventListener('focus', function () {
  presetName.classList.add('focused');
});

presetName.addEventListener('blur', function () {
  presetName.classList.remove('focused');
  validatePresetName();
});

function handlePresetSubmit(event) {
  event.preventDefault();

  if (!validatePresetName()) {
    return;
  }

  console.log(`Пресет: ${presetName.value.trim()}`);
  console.log(cssCode.value);
}

presetForm.addEventListener('submit', handlePresetSubmit);

// ==============================
// KEYBOARD
// ==============================
function handleKeyDown(event) {
  if (event.key === 'Escape') {
    topLeft.value = 0;
    topRight.value = 0;
    bottomRight.value = 0;
    bottomLeft.value = 0;

    generateBorderRadius();
  }
}

document.addEventListener('keydown', handleKeyDown);

// ==============================
// START
// ==============================
generateBorderRadius();

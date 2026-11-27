const STORAGE_KEY = 'todo-list';

const input = document.querySelector('#new-task');
const list = document.querySelector('#list');
const sortSelect = document.querySelector('#sort');

let tasks = loadTasks();

// ---------- збереження в браузері ----------
function loadTasks() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (data && Array.isArray(data.tasks)) {
      sortSelect.value = data.sort || 'new';
      return data.tasks;
    }
  } catch (e) {}
  return [];
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks: tasks, sort: sortSelect.value }));
  } catch (e) {}
}

// ---------- дата у форматі 12.12.22, 16:09 ----------
function formatDate(timestamp) {
  const d = new Date(timestamp);
  const two = n => String(n).padStart(2, '0');
  return `${two(d.getDate())}.${two(d.getMonth() + 1)}.${two(d.getFullYear() % 100)}, ${two(d.getHours())}:${two(d.getMinutes())}`;
}

// ---------- відображення ----------
function sortedTasks() {
  const copy = [...tasks];
  const byNew = (a, b) => b.created - a.created;
  if (sortSelect.value === 'undone') {
    return copy.sort((a, b) => (a.done - b.done) || byNew(a, b));
  }
  if (sortSelect.value === 'done') {
    return copy.sort((a, b) => (b.done - a.done) || byNew(a, b));
  }
  return copy.sort(byNew);
}

function render() {
  list.innerHTML = '';

  sortedTasks().forEach(function (task) {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    if (task.done) li.classList.add('done');

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'check';
    check.checked = task.done;

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = task.text;

    const date = document.createElement('span');
    date.className = 'date';
    date.textContent = formatDate(task.created);

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove';
    remove.textContent = '×';
    remove.setAttribute('aria-label', 'Видалити');

    li.append(check, text, date, remove);
    list.appendChild(li);
  });
}

// ---------- додавання ----------
input.addEventListener('keydown', function (event) {
  if (event.key !== 'Enter') return;

  const value = input.value.trim();
  if (value === '') return;

  tasks.push({ id: Date.now() + Math.random(), text: value, created: Date.now(), done: false });
  input.value = '';
  saveTasks();
  render();
});

// ---------- виконання та видалення (делегування) ----------
list.addEventListener('click', function (event) {
  const li = event.target.closest('li');
  if (!li) return;
  const task = tasks.find(t => String(t.id) === li.dataset.id);

  if (event.target.classList.contains('check')) {
    task.done = event.target.checked;
    saveTasks();
    render();
  }

  if (event.target.classList.contains('remove')) {
    tasks = tasks.filter(t => t !== task);
    saveTasks();
    render();
  }
});

// ---------- редагування (подвійний клік) ----------
list.addEventListener('dblclick', function (event) {
  if (!event.target.classList.contains('text')) return;

  const li = event.target.closest('li');
  const task = tasks.find(t => String(t.id) === li.dataset.id);

  const edit = document.createElement('input');
  edit.type = 'text';
  edit.className = 'edit';
  edit.value = task.text;
  event.target.replaceWith(edit);
  edit.focus();

  edit.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      const value = edit.value.trim();
      if (value !== '') task.text = value;
      saveTasks();
      render();
    }
    if (e.key === 'Escape') {
      render();
    }
  });

  edit.addEventListener('blur', function () {
    if (edit.isConnected) render();
  });
});

// ---------- сортування ----------
sortSelect.addEventListener('change', function () {
  saveTasks();
  render();
});

render();

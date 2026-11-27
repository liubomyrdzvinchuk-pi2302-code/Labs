import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Замініть значення власними (Project Settings -> API Keys).
// Тільки Publishable key (sb_publishable_...). Secret key вставляти заборонено.
const SUPABASE_URL = 'SUPABASE_PROJECT_URL';
const SUPABASE_KEY = 'SUPABASE_PUBLISHABLE_KEY';

const $ = (selector) => document.querySelector(selector);

const authStatus = $('#auth-status');
const authForms = $('#auth-forms');
const userPanel = $('#user-panel');
const userInfo = $('#user-info');
const status = $('#status');
const list = $('#games-list');
const adminPanel = $('#admin-panel');
const formStatus = $('#form-status');
const gameForm = $('#game-form');
const gameIdInput = $('#game-id');
const titleInput = $('#title');
const genreInput = $('#genre');
const playersInput = $('#players');
const saveButton = $('#save-button');
const cancelButton = $('#cancel-button');

if (SUPABASE_URL.startsWith('SUPABASE') || SUPABASE_KEY.startsWith('SUPABASE')) {
  authStatus.textContent = 'Вкажіть Project URL та Publishable key у файлі js/app.js.';
  throw new Error('Supabase не налаштовано');
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY);

let isAdmin = false;
let games = [];

function resetGameForm() {
  gameForm.reset();
  gameIdInput.value = '';
  playersInput.value = 2;
  saveButton.textContent = 'Додати гру';
  cancelButton.hidden = true;
}

function setAdminState(value) {
  isAdmin = value;
  adminPanel.hidden = !value;
  if (!value) resetGameForm();
}

function showGames() {
  list.replaceChildren();

  if (games.length === 0) {
    status.textContent = 'Записів немає.';
    return;
  }

  for (const game of games) {
    const item = document.createElement('li');
    const description = document.createElement('span');
    description.textContent = `${game.title} – ${game.genre}, гравців: ${game.players}`;
    item.append(description);

    if (isAdmin) {
      const actions = document.createElement('div');
      actions.className = 'game-actions';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.textContent = 'Редагувати';
      editButton.addEventListener('click', () => startEditing(game));

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.textContent = 'Видалити';
      deleteButton.addEventListener('click', () => deleteGame(game.id));

      actions.append(editButton, deleteButton);
      item.append(actions);
    }

    list.append(item);
  }

  status.textContent = `Знайдено ігор: ${games.length}`;
}

async function loadGames() {
  status.textContent = 'Завантаження ігор...';
  list.replaceChildren();

  try {
    const { data, error } = await db
      .from('games')
      .select('id, title, genre, players')
      .order('id', { ascending: true });
    if (error) throw error;

    games = data ?? [];
    showGames();
  } catch (error) {
    console.error('Помилка читання:', error);
    games = [];
    status.textContent = 'Не вдалося завантажити ігри.';
  }
}

async function updateAuthState() {
  setAdminState(false);
  userPanel.hidden = true;
  authForms.hidden = true;

  try {
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) {
      authForms.hidden = false;
      authStatus.textContent = 'Вхід не виконано.';
      return;
    }

    userInfo.textContent = `Користувач: ${data.user.email}`;
    userPanel.hidden = false;

    try {
      const { data: result, error: roleError } = await db.rpc('check_admin');
      if (roleError) throw roleError;
      setAdminState(result === true);
      authStatus.textContent = isAdmin
        ? 'Виконано вхід адміністратора.'
        : 'Виконано вхід звичайного користувача.';
    } catch (roleError) {
      console.error('Помилка перевірки ролі:', roleError);
      authStatus.textContent = 'Вхід виконано, але роль не вдалося перевірити.';
    }
  } catch (error) {
    console.error('Помилка автентифікації:', error);
    authForms.hidden = false;
    authStatus.textContent = 'Не вдалося перевірити сеанс.';
  } finally {
    await loadGames();
  }
}

// ---------- реєстрація ----------
$('#register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  authStatus.textContent = 'Реєстрація...';

  try {
    const { data, error } = await db.auth.signUp({
      email: $('#register-email').value.trim(),
      password: $('#register-password').value
    });
    if (error) throw error;
    form.reset();

    if (data.session) {
      await updateAuthState();
    } else {
      authStatus.textContent = 'Перевірте електронну пошту для підтвердження реєстрації.';
    }
  } catch (error) {
    console.error('Помилка реєстрації:', error);
    authStatus.textContent = 'Не вдалося зареєструвати користувача.';
  } finally {
    button.disabled = false;
  }
});

// ---------- вхід та вихід ----------
$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  authStatus.textContent = 'Виконується вхід...';

  try {
    const { error } = await db.auth.signInWithPassword({
      email: $('#login-email').value.trim(),
      password: $('#login-password').value
    });
    if (error) throw error;
    form.reset();
    await updateAuthState();
  } catch (error) {
    console.error('Помилка входу:', error);
    authStatus.textContent = 'Не вдалося виконати вхід.';
  } finally {
    button.disabled = false;
  }
});

$('#logout-button').addEventListener('click', async () => {
  try {
    const { error } = await db.auth.signOut();
    if (error) throw error;
    await updateAuthState();
  } catch (error) {
    console.error('Помилка виходу:', error);
    authStatus.textContent = 'Не вдалося завершити сеанс.';
  }
});

// ---------- редагування ----------
function startEditing(game) {
  if (!isAdmin) return;
  gameIdInput.value = String(game.id);
  titleInput.value = game.title;
  genreInput.value = game.genre;
  playersInput.value = game.players;
  saveButton.textContent = 'Зберегти зміни';
  cancelButton.hidden = false;
  formStatus.textContent = `Редагування гри № ${game.id}`;
}

cancelButton.addEventListener('click', () => {
  resetGameForm();
  formStatus.textContent = '';
});

// ---------- додавання та збереження змін ----------
gameForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!isAdmin) return;

  const title = titleInput.value.trim();
  const genre = genreInput.value.trim();
  const players = Number(playersInput.value);
  const gameId = gameIdInput.value;

  if (
    !title || !genre || title.length > 150 || genre.length > 150 ||
    !Number.isInteger(players) || players < 1 || players > 99
  ) {
    formStatus.textContent = 'Перевірте назву, жанр та кількість гравців.';
    return;
  }

  saveButton.disabled = true;
  formStatus.textContent = 'Збереження запису...';

  try {
    const query = gameId
      ? db.from('games').update({ title, genre, players }).eq('id', Number(gameId))
      : db.from('games').insert({ title, genre, players });

    const { error } = await query;
    if (error) throw error;

    resetGameForm();
    await loadGames();
    formStatus.textContent = gameId ? 'Зміни збережено.' : 'Гру додано.';
  } catch (error) {
    console.error('Помилка збереження:', error);
    formStatus.textContent = 'Не вдалося зберегти запис.';
  } finally {
    saveButton.disabled = false;
  }
});

// ---------- видалення з підтвердженням ----------
async function deleteGame(gameId) {
  if (!isAdmin || !confirm('Видалити вибрану гру?')) return;

  formStatus.textContent = 'Видалення гри...';

  try {
    const { error } = await db.from('games').delete().eq('id', gameId);
    if (error) throw error;
    await loadGames();
    formStatus.textContent = 'Гру видалено.';
  } catch (error) {
    console.error('Помилка видалення:', error);
    formStatus.textContent = 'Не вдалося видалити гру.';
  }
}

await updateAuthState();

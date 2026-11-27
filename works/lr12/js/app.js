import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Замініть значення власними (Project Settings -> API Keys).
// Використовується ТІЛЬКИ publishable key (sb_publishable_...), secret key вставляти заборонено.
const supabaseUrl = 'SUPABASE_PROJECT_URL';
const supabaseKey = 'SUPABASE_PUBLISHABLE_KEY';

const status = document.querySelector('#status');
const list = document.querySelector('#games-list');

if (supabaseUrl.startsWith('SUPABASE') || supabaseKey.startsWith('SUPABASE')) {
  status.textContent = 'Вкажіть Project URL та Publishable key у файлі js/app.js.';
  throw new Error('Supabase не налаштовано');
}

const db = createClient(supabaseUrl, supabaseKey);

async function loadGames() {
  status.textContent = 'Завантаження ігор...';
  list.replaceChildren();

  const { data, error } = await db
    .from('games')
    .select('id, title, genre, players')
    .order('id', { ascending: true });

  if (error) {
    console.error('Помилка завантаження:', error);
    status.textContent = 'Не вдалося завантажити ігри.';
    return;
  }

  if (data.length === 0) {
    status.textContent = 'У каталозі поки немає жодної гри.';
    return;
  }

  for (const game of data) {
    const item = document.createElement('li');
    item.textContent = `${game.title} – ${game.genre}, гравців: ${game.players}`;
    list.append(item);
  }

  status.textContent = `Знайдено ігор: ${data.length}`;
}

const gameForm = document.querySelector('#game-form');
const titleInput = document.querySelector('#title');
const genreInput = document.querySelector('#genre');
const playersInput = document.querySelector('#players');

gameForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const genre = genreInput.value.trim();
  const players = Number(playersInput.value);

  if (
    title.length === 0 || title.length > 150 ||
    genre.length === 0 || genre.length > 150 ||
    !Number.isInteger(players) || players < 1 || players > 99
  ) {
    status.textContent = 'Перевірте назву, жанр та кількість гравців.';
    return;
  }

  const submitButton = gameForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  status.textContent = 'Додавання гри...';

  try {
    const { error } = await db
      .from('games')
      .insert({ title, genre, players });

    if (error) {
      console.error('Помилка додавання:', error);
      status.textContent = 'Не вдалося додати гру.';
      return;
    }

    gameForm.reset();
    playersInput.value = 2;
    await loadGames();
    status.textContent = 'Гру додано. ' + status.textContent;
  } catch (error) {
    console.error('Помилка запиту:', error);
    status.textContent = 'Не вдалося виконати запит.';
  } finally {
    submitButton.disabled = false;
  }
});

loadGames();

const STORAGE_KEY = 'arcade.highscores.v1';

function readDb() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function writeDb(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function getHighscores(gameId) {
  const db = readDb();
  if (!gameId) return db;
  return db[gameId] || [];
}

export function saveHighscore(gameId, entry) {
  const db = readDb();
  const arr = Array.isArray(db[gameId]) ? db[gameId] : [];
  arr.push({ ...entry, createdAt: Date.now() });
  arr.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  db[gameId] = arr.slice(0, 10);
  writeDb(db);
  return db[gameId];
}

export function clearHighscores(gameId) {
  const db = readDb();
  if (gameId) {
    delete db[gameId];
  } else {
    for (const key of Object.keys(db)) delete db[key];
  }
  writeDb(db);
}
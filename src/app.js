import { Router } from './router.js';
import { getHighscores } from './storage.js';

function el(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild;
}

function setActiveNav(path) {
  const links = document.querySelectorAll('nav a');
  links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${path}`));
}

function renderNav(router) {
  const nav = document.getElementById('nav');
  nav.innerHTML = '';
  const links = [
    { href: '#/', label: 'Home' },
    { href: '#/ttt', label: 'Tic-Tac-Toe' },
    { href: '#/snake', label: 'Snake' },
    { href: '#/memory', label: 'Memory' },
  ];
  for (const { href, label } of links) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    a.addEventListener('click', (e) => { e.preventDefault(); router.navigate(href.slice(1)); });
    nav.appendChild(a);
  }
}

function renderHome(target) {
  target.innerHTML = '';
  const hero = el(`
    <section class="hero">
      <div class="card">
        <h2 class="hero-title">Welcome to the Arcade</h2>
        <p class="hero-subtitle">Play simple classics. Highscores are stored locally in your browser.</p>
        <div style="display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;">
          <a class="btn primary" href="#/ttt">Play Tic-Tac-Toe</a>
          <a class="btn" href="#/snake">Play Snake</a>
          <a class="btn" href="#/memory">Play Memory</a>
        </div>
      </div>
      <div class="card">
        <h3 style="margin-top:0">Top Scores</h3>
        <div id="leaderboards"></div>
      </div>
    </section>
  `);
  target.appendChild(hero);

  const leaderboardsEl = hero.querySelector('#leaderboards');
  const db = getHighscores();
  const gameTitles = { ttt: 'Tic-Tac-Toe', snake: 'Snake', memory: 'Memory' };
  const keys = Object.keys(gameTitles);
  if (keys.every(k => !db[k]?.length)) {
    leaderboardsEl.innerHTML = '<p class="hero-subtitle">No scores yet. Play a game!</p>';
  } else {
    for (const key of keys) {
      const list = db[key] || [];
      const section = el(`
        <section style="margin-bottom:12px;">
          <h4 style="margin:8px 0;">${gameTitles[key]}</h4>
          <table class="table">
            <thead><tr><th>#</th><th>Name</th><th>Score</th><th>Date</th></tr></thead>
            <tbody></tbody>
          </table>
        </section>
      `);
      const tbody = section.querySelector('tbody');
      list.slice(0,5).forEach((row, idx) => {
        const tr = document.createElement('tr');
        const d = new Date(row.createdAt || Date.now());
        tr.innerHTML = `<td>${idx + 1}</td><td>${row.name ?? 'Player'}</td><td>${row.score ?? 0}</td><td>${d.toLocaleDateString()}</td>`;
        tbody.appendChild(tr);
      });
      if (list.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="4" style="color:var(--muted)">No scores yet</td>`;
        tbody.appendChild(tr);
      }
      leaderboardsEl.appendChild(section);
    }
  }
}

function renderComingSoon(target, title) {
  target.innerHTML = '';
  const section = el(`
    <section class="card">
      <h2 style="margin-top:0">${title}</h2>
      <p class="hero-subtitle">This game is coming soon. In the meantime, try Tic-Tac-Toe.</p>
      <a class="btn primary" href="#/ttt">Play Tic-Tac-Toe</a>
    </section>
  `);
  target.appendChild(section);
}

function renderNotFound(target) {
  target.innerHTML = '';
  target.appendChild(el(`
    <section class="card">
      <h2 style="margin-top:0">Page not found</h2>
      <a class="btn" href="#/">Go home</a>
    </section>
  `));
}

function start() {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const app = document.getElementById('app');
  const router = new Router({
    targetElement: app,
    routes: {
      '/': (t, r) => { setActiveNav('/'); renderHome(t); },
      '/ttt': (t, r) => import('../games/ttt.js').then(m => { setActiveNav('/ttt'); return m.renderTicTacToe(t); }),
      '/snake': (t, r) => import('../games/snake.js').then(m => { setActiveNav('/snake'); return m.renderSnake(t); }),
      '/memory': (t, r) => import('../games/memory.js').then(m => { setActiveNav('/memory'); return m.renderMemory(t); }),
      '/404': (t, r) => { setActiveNav(''); renderNotFound(t); },
    }
  });

  renderNav(router);
  router.init();
}

start();
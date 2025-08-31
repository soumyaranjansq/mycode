import { saveHighscore } from '../src/storage.js';

const GAME_ID = 'ttt';

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (const [a,b,c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  if (board.every(Boolean)) return 'draw';
  return null;
}

function aiMove(board) {
  const opponent = 'X';
  const self = 'O';
  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  // 1) Win if possible
  for (const line of lines) {
    const [a,b,c] = line;
    const vals = [board[a], board[b], board[c]];
    if (vals.filter(v => v === self).length === 2 && vals.includes(null)) {
      const idx = line[vals.indexOf(null)];
      return idx;
    }
  }
  // 2) Block opponent
  for (const line of lines) {
    const [a,b,c] = line;
    const vals = [board[a], board[b], board[c]];
    if (vals.filter(v => v === opponent).length === 2 && vals.includes(null)) {
      const idx = line[vals.indexOf(null)];
      return idx;
    }
  }
  // 3) Take center
  if (board[4] === null) return 4;
  // 4) Corners
  const corners = [0,2,6,8].filter(i => board[i] === null);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // 5) Any side
  const sides = [1,3,5,7].filter(i => board[i] === null);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];
  return null;
}

function renderScoreForm(onSubmit) {
  const form = el(`
    <form style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
      <input type="text" name="name" placeholder="Your name" style="padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:#0000; color:inherit;" required />
      <button class="btn primary" type="submit">Save score</button>
    </form>
  `);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || 'Player').slice(0, 30);
    onSubmit(name);
  });
  return form;
}

export function renderTicTacToe(target) {
  target.innerHTML = '';
  const state = {
    board: Array(9).fill(null),
    turn: 'X',
    over: false,
    result: null,
    moves: 0,
  };

  const root = el(`
    <section class="card">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
        <h2 style="margin:0">Tic-Tac-Toe</h2>
        <div style="display:flex; gap:8px; align-items:center; color:var(--muted)">
          <span>Turn:</span><strong id="turn">X</strong>
          <span>Moves:</span><strong id="moves">0</strong>
        </div>
      </div>
      <div class="board" id="board" style="margin-top:12px;"></div>
      <div id="status" style="margin-top:12px;"></div>
      <div style="display:flex; gap:8px; margin-top:12px;">
        <button class="btn" id="reset">Reset</button>
      </div>
    </section>
  `);
  target.appendChild(root);

  const boardEl = root.querySelector('#board');
  const statusEl = root.querySelector('#status');
  const turnEl = root.querySelector('#turn');
  const movesEl = root.querySelector('#moves');

  function updateStatus() {
    const winner = checkWinner(state.board);
    if (winner) {
      state.over = true;
      state.result = winner;
      boardEl.querySelectorAll('.cell').forEach(c => c.classList.add('disabled'));
      if (winner === 'draw') {
        statusEl.innerHTML = '<p class="hero-subtitle">It\'s a draw!</p>';
      } else if (winner === 'X') {
        statusEl.innerHTML = '<p class="hero-subtitle">You win! Save your score.</p>';
        const score = Math.max(0, 100 - (state.moves - 5) * 10);
        const form = renderScoreForm((name) => {
          saveHighscore(GAME_ID, { name, score });
          statusEl.innerHTML = `<p class="hero-subtitle">Saved! <a class="btn" href="#/">Back to Home</a></p>`;
        });
        statusEl.appendChild(el(`<p style="margin:6px 0">Score: <strong>${score}</strong></p>`));
        statusEl.appendChild(form);
      } else {
        statusEl.innerHTML = '<p class="hero-subtitle">AI wins. Try again!</p>';
      }
    } else {
      turnEl.textContent = state.turn;
      movesEl.textContent = String(state.moves);
    }
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    state.board.forEach((val, idx) => {
      const c = el(`<div class="cell" data-idx="${idx}">${val ? val : ''}</div>`);
      if (state.over || val) c.classList.add('disabled');
      c.addEventListener('click', () => onPlayerMove(idx));
      boardEl.appendChild(c);
    });
    updateStatus();
  }

  function onPlayerMove(idx) {
    if (state.over || state.board[idx] !== null || state.turn !== 'X') return;
    state.board[idx] = 'X';
    state.turn = 'O';
    state.moves += 1;
    renderBoard();
    if (state.over) return;
    window.setTimeout(() => {
      const aiIdx = aiMove(state.board);
      if (aiIdx !== null) {
        state.board[aiIdx] = 'O';
        state.turn = 'X';
      }
      renderBoard();
    }, 250);
  }

  root.querySelector('#reset').addEventListener('click', () => {
    state.board = Array(9).fill(null);
    state.turn = 'X';
    state.over = false;
    state.result = null;
    state.moves = 0;
    renderBoard();
  });

  renderBoard();
}
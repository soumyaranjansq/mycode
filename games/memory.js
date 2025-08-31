import { saveHighscore } from '../src/storage.js';

const GAME_ID = 'memory';

function el(html) {
	const t = document.createElement('template');
	t.innerHTML = html.trim();
	return t.content.firstElementChild;
}

function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export function renderMemory(target) {
	target.innerHTML = '';

	const symbols = ['🍎','🍌','🍒','🍇','🍉','🍋','🍓','🥝'];
	const deck = shuffle([...symbols, ...symbols]).map((s, i) => ({ id: i, symbol: s, matched: false }));

	const state = {
		firstPick: null,
		secondPick: null,
		moves: 0,
		matchedCount: 0,
		startAt: Date.now(),
		elapsedMs: 0,
		timerId: 0,
		lock: false,
		gameOver: false,
	};

	const root = el(`
		<section class="card">
			<div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
				<h2 style="margin:0">Memory Match</h2>
				<div style="display:flex; gap:12px; color:var(--muted); align-items:center;">
					<span>Moves:</span><strong id="moves">0</strong>
					<span>Time:</span><strong id="time">0.0s</strong>
				</div>
			</div>
			<div id="grid" style="display:grid; grid-template-columns: repeat(4, minmax(64px, 1fr)); gap:12px; margin-top:12px;"></div>
			<div id="status" style="margin-top:12px;"></div>
			<div style="display:flex; gap:8px; margin-top:12px;">
				<button class="btn" id="reset">Reset</button>
			</div>
		</section>
	`);
	target.appendChild(root);

	const gridEl = root.querySelector('#grid');
	const movesEl = root.querySelector('#moves');
	const timeEl = root.querySelector('#time');
	const statusEl = root.querySelector('#status');

	function formatTime(ms) {
		return (ms / 1000).toFixed(1) + 's';
	}

	function updateTimer() {
		state.elapsedMs = Date.now() - state.startAt;
		timeEl.textContent = formatTime(state.elapsedMs);
	}

	function renderGrid() {
		gridEl.innerHTML = '';
		for (const card of deck) {
			const button = el(`<button class="btn" data-id="${card.id}" style="aspect-ratio:1/1; font-size:28px; display:grid; place-items:center; ${card.matched ? 'opacity:0.6' : ''}">${(card === state.firstPick || card === state.secondPick || card.matched) ? card.symbol : '❓'}</button>`);
			button.addEventListener('click', () => onPick(card));
			gridEl.appendChild(button);
		}
	}

	function onPick(card) {
		if (state.lock || state.gameOver) return;
		if (card.matched) return;
		if (state.firstPick && state.firstPick.id === card.id) return;

		if (!state.firstPick) {
			state.firstPick = card;
			renderGrid();
			return;
		}

		state.secondPick = card;
		state.lock = true;
		renderGrid();
		window.setTimeout(() => {
			if (state.firstPick.symbol === state.secondPick.symbol) {
				state.firstPick.matched = true;
				state.secondPick.matched = true;
				state.matchedCount += 2;
			} 
			state.moves += 1;
			movesEl.textContent = String(state.moves);
			state.firstPick = null;
			state.secondPick = null;
			state.lock = false;
			renderGrid();
			checkComplete();
		}, 450);
	}

	function checkComplete() {
		if (state.matchedCount === deck.length && !state.gameOver) {
			state.gameOver = true;
			clearInterval(state.timerId);
			updateTimer();
			const base = 1000;
			const timePenalty = Math.floor(state.elapsedMs / 10);
			const movePenalty = Math.max(0, (state.moves - 8)) * 20;
			const score = Math.max(0, base - timePenalty - movePenalty);
			statusEl.innerHTML = `<p class=\"hero-subtitle\">Completed! Score: <strong>${score}</strong>. Save your score below.</p>`;
			const form = el(`
				<form style="margin-top:8px; display:flex; gap:8px; flex-wrap:wrap;">
					<input type="text" name="name" placeholder="Your name" style="padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.12); background:#0000; color:inherit;" required />
					<button class="btn primary" type="submit">Save score</button>
				</form>
			`);
			form.addEventListener('submit', (e) => {
				e.preventDefault();
				const data = new FormData(form);
				const name = String(data.get('name') || 'Player').slice(0, 30);
				saveHighscore(GAME_ID, { name, score });
				statusEl.innerHTML = `<p class=\"hero-subtitle\">Saved! <a class=\"btn\" href=\"#/\">Back to Home</a></p>`;
			});
			statusEl.appendChild(form);
		}
	}

	function reset() {
		for (const c of deck) { c.matched = false; }
		shuffle(deck);
		state.firstPick = null;
		state.secondPick = null;
		state.moves = 0;
		state.matchedCount = 0;
		state.startAt = Date.now();
		state.elapsedMs = 0;
		state.lock = false;
		state.gameOver = false;
		movesEl.textContent = '0';
		statusEl.innerHTML = '';
		renderGrid();
	}

	root.querySelector('#reset').addEventListener('click', () => reset());

	state.timerId = window.setInterval(updateTimer, 200);
	reset();

	return () => {
		clearInterval(state.timerId);
	};
}
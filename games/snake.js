import { saveHighscore } from '../src/storage.js';

const GAME_ID = 'snake';

function el(html) {
	const t = document.createElement('template');
	t.innerHTML = html.trim();
	return t.content.firstElementChild;
}

export function renderSnake(target) {
	target.innerHTML = '';

	const state = {
		gridSize: 20,
		tileSize: 20,
		snake: [{ x: 10, y: 10 }],
		direction: { x: 1, y: 0 },
		nextDirection: { x: 1, y: 0 },
		food: { x: 5, y: 5 },
		score: 0,
		gameOver: false,
		paused: false,
		stepMs: 120,
		rafId: 0,
		lastTime: 0,
		accum: 0,
	};

	const root = el(`
		<section class="card">
			<div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
				<h2 style="margin:0">Snake</h2>
				<div style="display:flex; gap:12px; color:var(--muted); align-items:center;">
					<span>Score:</span><strong id="score">0</strong>
				</div>
			</div>
			<canvas id="canvas" class="game-canvas" width="400" height="400" style="margin-top:12px;"></canvas>
			<div id="status" style="margin-top:12px;"></div>
			<div style="display:flex; gap:8px; margin-top:12px;">
				<button class="btn" id="reset">Reset</button>
				<button class="btn" id="pause">Pause</button>
			</div>
			<p class="hero-subtitle" style="margin-top:12px;">Use <span class="kbd">WASD</span> or arrow keys. Avoid walls and yourself.</p>
		</section>
	`);
	target.appendChild(root);

	const canvas = root.querySelector('#canvas');
	const statusEl = root.querySelector('#status');
	const scoreEl = root.querySelector('#score');
	const ctx = canvas.getContext('2d');

	// Handle HiDPI
	const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
	function resizeCanvas() {
		const logical = state.gridSize * state.tileSize;
		canvas.style.width = logical + 'px';
		canvas.style.height = logical + 'px';
		canvas.width = logical * dpr;
		canvas.height = logical * dpr;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	}
	resizeCanvas();

	function placeFood() {
		let x, y;
		do {
			x = Math.floor(Math.random() * state.gridSize);
			y = Math.floor(Math.random() * state.gridSize);
		} while (state.snake.some(s => s.x === x && s.y === y));
		state.food = { x, y };
	}
	placeFood();

	function draw() {
		ctx.fillStyle = '#0b0f1a';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Grid background
		ctx.fillStyle = 'rgba(255,255,255,0.04)';
		for (let i = 0; i < state.gridSize; i++) {
			for (let j = 0; j < state.gridSize; j++) {
				if ((i + j) % 2 === 0) {
					ctx.fillRect(i * state.tileSize, j * state.tileSize, state.tileSize, state.tileSize);
				}
			}
		}

		// Food
		ctx.fillStyle = '#ff79c6';
		ctx.fillRect(state.food.x * state.tileSize + 2, state.food.y * state.tileSize + 2, state.tileSize - 4, state.tileSize - 4);

		// Snake
		for (let idx = 0; idx < state.snake.length; idx++) {
			const s = state.snake[idx];
			ctx.fillStyle = idx === 0 ? '#8be9fd' : '#1a9fbf';
			ctx.fillRect(s.x * state.tileSize + 1, s.y * state.tileSize + 1, state.tileSize - 2, state.tileSize - 2);
		}
	}

	function step() {
		if (state.paused || state.gameOver) return;
		state.direction = state.nextDirection;
		const head = { ...state.snake[0] };
		head.x += state.direction.x;
		head.y += state.direction.y;

		// Wall collision
		if (head.x < 0 || head.y < 0 || head.x >= state.gridSize || head.y >= state.gridSize) {
			return onGameOver();
		}
		// Self collision
		if (state.snake.some(s => s.x === head.x && s.y === head.y)) {
			return onGameOver();
		}

		state.snake.unshift(head);
		if (head.x === state.food.x && head.y === state.food.y) {
			state.score += 10;
			scoreEl.textContent = String(state.score);
			placeFood();
			// Slight speed up every 50 points
			if (state.score % 50 === 0 && state.stepMs > 60) state.stepMs -= 6;
		} else {
			state.snake.pop();
		}
	}

	function loop(ts) {
		state.rafId = requestAnimationFrame(loop);
		if (!state.lastTime) state.lastTime = ts;
		const delta = ts - state.lastTime;
		state.lastTime = ts;
		state.accum += delta;
		while (state.accum >= state.stepMs) {
			state.accum -= state.stepMs;
			step();
		}
		draw();
	}

	function onGameOver() {
		state.gameOver = true;
		statusEl.innerHTML = '<p class="hero-subtitle">Game over! Save your score.</p>';
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
			saveHighscore(GAME_ID, { name, score: state.score });
			statusEl.innerHTML = `<p class=\"hero-subtitle\">Saved! <a class=\"btn\" href=\"#/\">Back to Home</a></p>`;
		});
		statusEl.appendChild(form);
	}

	function reset() {
		state.snake = [{ x: 10, y: 10 }];
		state.direction = { x: 1, y: 0 };
		state.nextDirection = { x: 1, y: 0 };
		state.score = 0;
		scoreEl.textContent = '0';
		state.gameOver = false;
		state.paused = false;
		state.stepMs = 120;
		state.lastTime = 0;
		state.accum = 0;
		placeFood();
	}

	function onKey(e) {
		const k = e.key;
		if (k === 'ArrowUp' || k.toLowerCase() === 'w') {
			if (state.direction.y !== 1) state.nextDirection = { x: 0, y: -1 };
		} else if (k === 'ArrowDown' || k.toLowerCase() === 's') {
			if (state.direction.y !== -1) state.nextDirection = { x: 0, y: 1 };
		} else if (k === 'ArrowLeft' || k.toLowerCase() === 'a') {
			if (state.direction.x !== 1) state.nextDirection = { x: -1, y: 0 };
		} else if (k === 'ArrowRight' || k.toLowerCase() === 'd') {
			if (state.direction.x !== -1) state.nextDirection = { x: 1, y: 0 };
		} else if (k.toLowerCase() === 'p' || k === ' ') {
			state.paused = !state.paused;
			root.querySelector('#pause').textContent = state.paused ? 'Resume' : 'Pause';
		}
	}

	root.querySelector('#reset').addEventListener('click', () => { reset(); });
	root.querySelector('#pause').addEventListener('click', () => {
		state.paused = !state.paused;
		root.querySelector('#pause').textContent = state.paused ? 'Resume' : 'Pause';
	});

	window.addEventListener('keydown', onKey);
	reset();
	state.rafId = requestAnimationFrame(loop);

	return () => {
		window.removeEventListener('keydown', onKey);
		cancelAnimationFrame(state.rafId);
	};
}
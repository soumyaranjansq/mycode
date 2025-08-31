(function() {
	const canvas = document.getElementById('board');
	const ctx = canvas.getContext('2d');
	const scoreEl = document.getElementById('score');
	const highEl = document.getElementById('high');
	const restartBtn = document.getElementById('restart');

	const gridSize = 24;
	const cell = canvas.width / gridSize;

	let gameLoopId = 0;
	let lastTickTime = 0;
	let tickMs = 120;

	const directionQueue = [];
	let direction = { x: 1, y: 0 };

	let snake = [ { x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 } ];
	let food = spawnFood();
	let score = 0;
	let high = Number(localStorage.getItem('snake-high') || 0);
	highEl.textContent = String(high);

	function spawnFood() {
		while (true) {
			const x = Math.floor(Math.random() * gridSize);
			const y = Math.floor(Math.random() * gridSize);
			if (!snake.some(s => s.x === x && s.y === y)) return { x, y };
		}
	}

	function reset() {
		score = 0;
		scoreEl.textContent = '0';
		direction = { x: 1, y: 0 };
		directionQueue.length = 0;
		snake = [ { x: 8, y: 12 }, { x: 7, y: 12 }, { x: 6, y: 12 } ];
		food = spawnFood();
		lastTickTime = 0;
		cancelAnimationFrame(gameLoopId);
		gameLoopId = requestAnimationFrame(loop);
	}

	function loop(ts) {
		gameLoopId = requestAnimationFrame(loop);
		if (ts - lastTickTime < tickMs) return;
		lastTickTime = ts;
		update();
		render();
	}

	function update() {
		if (directionQueue.length > 0) {
			const next = directionQueue.shift();
			if (next && (next.x !== -direction.x || next.y !== -direction.y)) {
				direction = next;
			}
		}

		const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
		if (head.x < 0) head.x = gridSize - 1;
		if (head.y < 0) head.y = gridSize - 1;
		head.x %= gridSize; head.y %= gridSize;

		// self collision
		if (snake.some((s, i) => i !== 0 && s.x === head.x && s.y === head.y)) {
			if (score > high) { high = score; localStorage.setItem('snake-high', String(high)); highEl.textContent = String(high); }
			reset();
			return;
		}

		snake.unshift(head);
		if (head.x === food.x && head.y === food.y) {
			score += 1;
			scoreEl.textContent = String(score);
			if (score % 5 === 0 && tickMs > 60) tickMs -= 5;
			food = spawnFood();
		} else {
			snake.pop();
		}
	}

	function render() {
		ctx.fillStyle = '#0a0c10';
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// grid glow
		ctx.strokeStyle = 'rgba(255,255,255,0.04)';
		ctx.lineWidth = 1;
		for (let i = 0; i <= gridSize; i++) {
			ctx.beginPath(); ctx.moveTo(i * cell + 0.5, 0); ctx.lineTo(i * cell + 0.5, canvas.height); ctx.stroke();
			ctx.beginPath(); ctx.moveTo(0, i * cell + 0.5); ctx.lineTo(canvas.width, i * cell + 0.5); ctx.stroke();
		}

		// food
		const foodGrad = ctx.createLinearGradient(0, 0, cell, cell);
		foodGrad.addColorStop(0, '#06d6a0');
		foodGrad.addColorStop(1, '#0ea5e9');
		ctx.fillStyle = foodGrad;
		drawRoundedRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4, 4);
		ctx.fill();

		// snake
		for (let i = 0; i < snake.length; i++) {
			const part = snake[i];
			const t = i / Math.max(1, snake.length - 1);
			const hue = 260 - t * 180;
			ctx.fillStyle = `hsl(${hue} 80% 60%)`;
			drawRoundedRect(part.x * cell + 2, part.y * cell + 2, cell - 4, cell - 4, i === 0 ? 6 : 4);
			ctx.fill();
		}
	}

	function drawRoundedRect(x, y, w, h, r) {
		r = Math.min(r, w / 2, h / 2);
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.arcTo(x + w, y, x + w, y + h, r);
		ctx.arcTo(x + w, y + h, x, y + h, r);
		ctx.arcTo(x, y + h, x, y, r);
		ctx.arcTo(x, y, x + w, y, r);
		ctx.closePath();
	}

	function queueDirection(nx, ny) {
		const last = directionQueue.at(-1) || direction;
		if (last.x === nx && last.y === ny) return;
		directionQueue.push({ x: nx, y: ny });
	}

	// keyboard
	window.addEventListener('keydown', (e) => {
		switch (e.key) {
			case 'ArrowUp': case 'w': case 'W': queueDirection(0, -1); break;
			case 'ArrowDown': case 's': case 'S': queueDirection(0, 1); break;
			case 'ArrowLeft': case 'a': case 'A': queueDirection(-1, 0); break;
			case 'ArrowRight': case 'd': case 'D': queueDirection(1, 0); break;
		}
	});

	// touch
	let touchStartX = 0, touchStartY = 0;
	canvas.addEventListener('touchstart', (e) => {
		const t = e.touches[0];
		touchStartX = t.clientX; touchStartY = t.clientY;
	});
	canvas.addEventListener('touchend', (e) => {
		const t = e.changedTouches[0];
		const dx = t.clientX - touchStartX;
		const dy = t.clientY - touchStartY;
		if (Math.abs(dx) > Math.abs(dy)) {
			queueDirection(Math.sign(dx), 0);
		} else {
			queueDirection(0, Math.sign(dy));
		}
	});

	restartBtn.addEventListener('click', reset);

	// start
	gameLoopId = requestAnimationFrame(loop);
})();


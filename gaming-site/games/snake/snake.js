(function(){
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const restartBtn = document.getElementById('restart');
  const scoreEl = document.getElementById('score');
  const grid = 24;
  let snake = [{x: 5, y: 5}];
  let dir = {x: 1, y: 0};
  let apple = spawnApple();
  let score = 0;
  let loopId = null;

  function spawnApple(){
    return { x: Math.floor(Math.random()* (canvas.width/grid)), y: Math.floor(Math.random()* (canvas.height/grid)) };
  }
  function drawCell(x,y,color){
    ctx.fillStyle = color;
    ctx.fillRect(x*grid, y*grid, grid-2, grid-2);
  }
  function tick(){
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    // wrap around
    head.x = (head.x + canvas.width/grid) % (canvas.width/grid);
    head.y = (head.y + canvas.height/grid) % (canvas.height/grid);
    // self collision
    if (snake.some((p)=> p.x===head.x && p.y===head.y)) { gameOver(); return; }
    snake.unshift(head);
    if (head.x===apple.x && head.y===apple.y){
      score += 10;
      scoreEl.textContent = `Score: ${score}`;
      apple = spawnApple();
    } else {
      snake.pop();
    }
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawCell(apple.x, apple.y, '#fbbc04');
    snake.forEach((p,i)=> drawCell(p.x,p.y, i===0 ? '#34d399' : '#10b981'));
  }
  function loop(){
    tick();
  }
  function start(){
    if (loopId) clearInterval(loopId);
    loopId = setInterval(loop, 120);
  }
  function gameOver(){
    clearInterval(loopId);
    saveScore('Snake', 'Player', score);
    alert('Game Over! Score: '+score);
  }
  function saveScore(game, player, scoreValue){
    const key = 'arcade_leaderboard';
    const list = JSON.parse(localStorage.getItem(key)||'[]');
    list.push({ game, player, score: scoreValue, ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(list));
  }
  window.addEventListener('keydown', (e)=>{
    if (e.key==='ArrowUp' && dir.y!==1){ dir = {x:0,y:-1}; }
    else if (e.key==='ArrowDown' && dir.y!==-1){ dir = {x:0,y:1}; }
    else if (e.key==='ArrowLeft' && dir.x!==1){ dir = {x:-1,y:0}; }
    else if (e.key==='ArrowRight' && dir.x!==-1){ dir = {x:1,y:0}; }
  });
  restartBtn.addEventListener('click', ()=>{
    snake = [{x:5,y:5}]; dir={x:1,y:0}; apple=spawnApple(); score=0; scoreEl.textContent='Score: 0'; start();
  });
  start();
})();
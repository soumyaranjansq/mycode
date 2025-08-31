(function(){
  const boardEl = document.getElementById('board');
  const statusEl = document.getElementById('status');
  const resetBtn = document.getElementById('reset');
  const winning = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  let board = Array(9).fill(null);
  let current = 'X';
  function render(){
    boardEl.innerHTML = '';
    board.forEach((val, idx)=>{
      const cell = document.createElement('button');
      cell.className = 'cell';
      cell.setAttribute('role','gridcell');
      cell.setAttribute('aria-label', `Cell ${idx+1}`);
      cell.textContent = val || '';
      cell.disabled = Boolean(val) || Boolean(winner(board));
      cell.addEventListener('click', ()=> move(idx));
      boardEl.appendChild(cell);
    });
    const w = winner(board);
    if (w){
      statusEl.textContent = `${w} wins!`;
      saveScore('Tic-Tac-Toe', w, 1);
    } else if (board.every(Boolean)) {
      statusEl.textContent = 'Draw!';
    } else {
      statusEl.textContent = `${current}'s turn`;
    }
  }
  function move(idx){
    if (board[idx]) return;
    board[idx] = current;
    current = current === 'X' ? 'O' : 'X';
    render();
  }
  function winner(b){
    for (const [a,b2,c] of winning){
      if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
    }
    return null;
  }
  function saveScore(game, player, score){
    const key = 'arcade_leaderboard';
    const list = JSON.parse(localStorage.getItem(key)||'[]');
    list.push({ game, player, score, ts: Date.now() });
    localStorage.setItem(key, JSON.stringify(list));
  }
  resetBtn.addEventListener('click', ()=>{ board = Array(9).fill(null); current = 'X'; render(); });
  render();
})();
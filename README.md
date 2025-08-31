# Arcade (Static Web Games)

A small static arcade featuring Tic-Tac-Toe, Snake, and Memory Match. Built with vanilla HTML/CSS/JS and no build step.

## Run locally

Any static server works. Examples:

```bash
# Python 3
python3 -m http.server 8000 --directory .
# Then open http://localhost:8000/
```

You can also use Node-based servers like `npx serve`.

## Features

- Tic-Tac-Toe with simple AI and score saving
- Snake on canvas with keyboard controls and highscores
- Memory Match with time/moves-based scoring
- Hash-based client router and responsive UI
- LocalStorage-backed highscores and a home leaderboard

## Project structure

- `index.html` entry point
- `assets/styles.css` theme and layout
- `src/router.js` tiny hash router
- `src/app.js` routes and main UI
- `src/storage.js` localStorage helpers
- `games/ttt.js` Tic-Tac-Toe
- `games/snake.js` Snake
- `games/memory.js` Memory Match

## Notes

- Highscores are saved per-browser via localStorage.
- No frameworks or bundlers required; modern browsers only.
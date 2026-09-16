# Session log

This log is only the kanban board.

## 2026-09-16 — session 1

Runs: http://127.0.0.1:49218/ (`npm start`)

Landed:
- Vite React demo on port 49218
- `Board` with three columns and North Loop Photo sample jobs
- Add a card (blank title is a miss)
- Remove a card
- Download JSON

Next session:
- Drag a card to another column
- Reorder inside a column
- JSON download still works after a move

## 2026-09-16 — session 2

Runs: http://127.0.0.1:49218/ (`npm start`)

Landed:
- Drag a card to another column
- Reorder inside a column
- Drop line while dragging
- Download JSON still writes the board after a move

Next session:
- Load JSON from a file
- Miss on a bad file or blank title
- Add or remove a column
- Empty board is a real state

## 2026-09-16 — session 3

Runs: http://127.0.0.1:49218/ (`npm start`)

Landed:
- Load JSON from a file
- Miss on a file that is not JSON, or not a board
- Add a column. Blank name is a miss
- Remove a column
- Empty board copy, then add a column to recover

Next session:
- Screenshots (page, result, miss)
- Demo video
- README Demo with github.com player
- LinkedIn draft
- Mark SHIPPED

## 2026-09-16 — session 4 (expand A)

Runs: http://127.0.0.1:49218/ (`npm start`)

Landed:
- Click a card to open an edit page
- Body, owner, due, badges, checklist
- Save, cancel (no save), blank title miss
- Old JSON `note` loads as `body`
- Sample jobs have real (fake) details

Next session:
- Expand B: preset column colors
- Cards pick up the column color
- Badges on compact cards

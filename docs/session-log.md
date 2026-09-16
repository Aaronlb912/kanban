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

## 2026-09-16 — session 5 (expand B)

Runs: http://127.0.0.1:49218/ (`npm start`)

Landed:
- Column color presets (Ink, Ochre, Clay, Moss, Slate, Plum)
- Cards use the column color
- Change a column color, cards follow
- Badges on compact cards
- Old JSON with no color loads as Ink

Next session:
- Expand C: one Add card page
- Remove per-column add forms
- Column picker on the new-card page

## 2026-09-16 — session 6 (expand C)

Runs: http://127.0.0.1:49218/ (`npm start`)

Landed:
- One Add card in the header
- New-card page with column picker
- Per-column add forms removed
- Miss if no title, no column, or no columns on the board

Next session:
- Expand D: board list
- Blank template
- Duplicate and remove a board

## 2026-09-16 — session 7 (expand D)

Runs: http://127.0.0.1:49218/ (`npm start`)

Landed:
- Board list. Open, duplicate, remove
- New blank board: To do, In progress, Done, no cards
- Miss on a blank board name, or removing the last board
- North Loop Photo stays as the sample

Next session:
- Expand E: persist, search, rename, styling

## 2026-09-16 — session 8 (expand E)

Runs: http://127.0.0.1:49218/ (`npm start`)

Landed:
- Demo saves the workspace in localStorage. Refresh keeps boards.
- Reset sample on the board list (asks first)
- Search and badge filter on the open board
- Rename the board and a column
- Move a column left or right
- Duplicate a card from the edit page
- Escape cancels new/edit
- Download this board or all boards. Load JSON can be one board or all.

Next session:
- Screenshots, demo video, README Demo, LinkedIn, SHIPPED

## 2026-09-16 — pages, gist, README

Runs: http://127.0.0.1:49218/ (`npm start`)
Live: https://aaronlb912.github.io/kanban/

Landed:
- Public Pages demo. Get the files on the Boards page.
- Private gist save from the Boards page. Token stays in the browser.
- README on GitHub: who, what, run, copy `src/lib/`, import, props,
  live URL, gist, closed jobs in the JSON example.

Next session:
- Screenshots, demo video, README Demo, LinkedIn, SHIPPED only if he
  asks.

## 2026-09-16 — session 9 SHIPPED

Runs: http://127.0.0.1:49218/ (`npm start`)
Live: https://aaronlb912.github.io/kanban/

Landed:
- docs/media/kanban-page.png, kanban-result.png, kanban-miss.png
- docs/media/kanban-demo.mp4 in the README Demo with a github.com
  player
- LinkedIn draft at docs/linkedin-post.md (local, not committed)

SHIPPED.

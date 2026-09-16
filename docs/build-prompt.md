# TARGET 2026-09-16

Kanban board. Columns and cards. Add work. Move it. JSON in, JSON out.
Drop `src/lib/` into a React app you already have.

Kind: board. Not a search. Not a table editor.

Local URL: http://127.0.0.1:49218/

Pages:
- `/` the board, add a card, drag, JSON download. Later: JSON load.
  No other routes.

Auth: none.

Sample: North Loop Photo jobs in `src/lib/sample-board.js`. Fake names.

## Session plan

- [x] Session 1: scaffold, board with columns and cards, add a card,
      JSON download, demo running.
- [x] Session 2: drag cards between columns and reorder in a column.
- [ ] Session 3: load JSON, miss states (blank title, bad file), add or
      remove a column, empty board.
- [ ] Session 4: screenshots, demo video, README Demo, LinkedIn draft,
      SHIPPED.

## Usefulness check

1. Who else? A shop, studio, or small crew that already has a React app
   and needs a job board on a page. They finish "what is where" on the
   board, then save JSON.
2. Their data? Yes. Pass a board object, or load JSON. Cards are their
   jobs, not the sample names.
3. Make it theirs? Yes. Board title, column names, card copy, CSS in
   `src/lib/board.css`.
4. Take it? Yes. Copy `src/lib/` into their React `src/` and import
   `Board`.
5. No account? Yes. No signup. No npm publish.
6. Coworker test? Yes. Zip `src/lib/`. They drop it in and import.
7. Keep a copy? Yes. Download JSON. The useful output is also the
   component running in their app with their jobs.
8. Miss and recover? Yes (session 3). Blank card title. Bad JSON. Empty
   board. Then add a real card.
9. README says how? Partial until ship. Session 1: who, run, URL. Later:
   copy `src/lib/`, import, props, Demo stills and mp4.

## This session

Session 2. Drag a card to another column. Reorder inside a column.
JSON download still has the board after a move.

## Next session

Load JSON from a file. Miss on a bad file or blank title. Add or
remove a column. Empty board is a real state.

## SHIPPED means

All four session boxes checked. Usefulness 1-9 all yes. README has copy
`src/lib/`, import, props, three tool screenshots, and a github.com
player URL. Log marked SHIPPED. This product appended to the
multi-session React prompt's shipped list. No second product in this
repo.

# Kanban board

Columns and cards for jobs that move. Keep more than one board. Add a
card. Drag it. Load and download JSON. Drop `src/lib/` into a React app
you already have.

The demo starts on a photo studio board (North Loop Photo). Names are
fake. Make a blank board for your own jobs.

## Who it is for

A shop, studio, or small crew that already runs React and needs a job
board on a page. Put your columns and jobs in. Save the JSON.

## What you get

Copy `src/lib/`. That folder is the component.

- `Workspace.jsx` - board list plus the open board
- `Board.jsx` - one board
- `Column.jsx` - one column
- `Card.jsx` - compact card
- `CardPage.jsx` - new card and edit card
- `board.css` - the look
- `board-json.js` - download, load parse, blank template, and move
  helpers
- `sample-board.js` - North Loop Photo sample
- `index.js` - the import

No account. Nothing sends mail. Boards opens the list. A new board
starts empty with To do, In progress, and Done. Duplicate a board.
You cannot remove the last one. Add card in the header opens a page;
pick the column there. Click a card to edit the job (details, owner,
due date, badges, checklist). Badges show on the card. Each column has
a color; cards in that column use it. Drag a card to another column, or
up and down in the same column. Add or remove a column. An empty board
is a real state. Load JSON for your jobs. Old JSON with only `title`
and `note` still loads; `note` becomes `body`. Missing column color
becomes Ink.

## Run the demo

```
npm install
npm start
```

Open http://127.0.0.1:49218/

## Use it in your own React app

1. Copy `src/lib/` into your project.
2. Import the workspace (several boards) or the board (one board):

```jsx
import { useState } from 'react'
import { Workspace, sampleWorkspace } from './lib/index.js'

export function Jobs() {
  const [workspace, setWorkspace] = useState(sampleWorkspace)
  return <Workspace value={workspace} onChange={setWorkspace} />
}
```

One board only:

```jsx
import { Board, sampleBoard } from './lib/index.js'

export function OneBoard() {
  const [board, setBoard] = useState(sampleBoard)
  return <Board value={board} onChange={setBoard} />
}
```

3. Replace `sampleWorkspace` with your boards. Or start from the
   sample, edit on the page, then Download JSON. Load JSON brings a
   saved board back into the open board.

Workspace object:

```json
{
  "activeBoardId": "board-north-loop",
  "boards": [{
    "id": "board-north-loop",
    "title": "North Loop Photo",
    "note": "Studio jobs this week.",
    "columns": [
      {
        "id": "intake",
        "title": "Intake",
        "color": "#8a6a2a",
        "cards": [{
          "id": "c-rae",
          "title": "Rae Chen, senior portraits",
          "body": "Sitting on Saturday.",
          "owner": "Mira Patel",
          "due": "2026-09-19",
          "badges": [{ "id": "b-rush", "label": "rush" }],
          "checklist": [{ "id": "ch-1", "text": "Contract signed", "done": true }]
        }]
      }
    ]
  }]
}
```

A file that is not JSON, or not a board, shows an error. The open
board stays until a good file loads.

## Make it yours

Change board titles and column titles. Pick a column color (Ink, Ochre,
Clay, Moss, Slate, Plum). Add or remove columns on the page. Click a
card to edit it. Edit `src/lib/board.css`. Card objects are
`{ id, title, body, owner, due, badges, checklist }`. A `note` field
still loads as `body`. A blank board is To do / In progress / Done with
no cards.

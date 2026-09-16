# Kanban board

Columns and cards for jobs that move. Add a card. Download JSON. Drop
`src/lib/` into a React app you already have.

The demo is a photo studio board (North Loop Photo). Names are fake.

## Who it is for

A shop, studio, or small crew that already runs React and needs a job
board on a page. Put your columns and jobs in. Save the JSON.

## What you get

Copy `src/lib/`. That folder is the component.

- `Board.jsx` - the board
- `Column.jsx` - one column, add a card
- `Card.jsx` - one card
- `board.css` - the look
- `board-json.js` - download and move helpers
- `sample-board.js` - North Loop Photo sample
- `index.js` - the import

No account. Nothing sends mail. Drag a card to another column, or up
and down in the same column.

## Run the demo

```
npm install
npm start
```

Open http://127.0.0.1:49218/

## Use it in your own React app

1. Copy `src/lib/` into your project.
2. Import the board:

```jsx
import { useState } from 'react'
import { Board, sampleBoard } from './lib/index.js'

export function Jobs() {
  const [board, setBoard] = useState(sampleBoard)
  return <Board value={board} onChange={setBoard} />
}
```

3. Replace `sampleBoard` with your title, columns, and cards. Or start
   from the sample and edit the jobs on the page, then Download JSON.

## Make it yours

Change `value.title` and column titles. Edit `src/lib/board.css`. Card
objects are `{ id, title, note }`.

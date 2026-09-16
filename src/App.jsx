import { useState } from 'react'
import { Board, normalizeBoard, sampleBoard } from './lib/index.js'

export default function App() {
  const [board, setBoard] = useState(() => normalizeBoard(sampleBoard))

  return <Board value={board} onChange={setBoard} />
}

import { useState } from 'react'
import { Board, sampleBoard } from './lib/index.js'

export default function App() {
  const [board, setBoard] = useState(sampleBoard)

  return <Board value={board} onChange={setBoard} />
}

import { useState } from 'react'
import { Board } from './Board.jsx'
import {
  blankBoard,
  cardCount,
  cloneBoard,
  normalizeWorkspace,
} from './board-json.js'

export function Workspace({ value, onChange }) {
  const workspace = normalizeWorkspace(value)
  const [page, setPage] = useState('board')
  const [title, setTitle] = useState('')
  const [miss, setMiss] = useState('')

  const active =
    workspace.boards.find((board) => board.id === workspace.activeBoardId) ||
    workspace.boards[0]

  function setWorkspace(next) {
    setMiss('')
    onChange(next)
  }

  function openBoard(id) {
    setWorkspace({ ...workspace, activeBoardId: id })
    setPage('board')
  }

  function updateActive(next) {
    setWorkspace({
      boards: workspace.boards.map((board) =>
        board.id === active.id ? next : board,
      ),
      activeBoardId: next.id,
    })
  }

  function addBoard(event) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setMiss('Need a board title.')
      return
    }
    const board = blankBoard(trimmed)
    setTitle('')
    setWorkspace({
      boards: [...workspace.boards, board],
      activeBoardId: board.id,
    })
    setPage('board')
  }

  function duplicateBoard(id) {
    const src = workspace.boards.find((board) => board.id === id)
    if (!src) return
    const copy = cloneBoard(src)
    setWorkspace({
      boards: [...workspace.boards, copy],
      activeBoardId: workspace.activeBoardId,
    })
  }

  function removeBoard(id) {
    if (workspace.boards.length < 2) {
      setMiss('Keep at least one board.')
      return
    }
    const boards = workspace.boards.filter((board) => board.id !== id)
    const activeBoardId =
      workspace.activeBoardId === id ? boards[0].id : workspace.activeBoardId
    setWorkspace({ boards, activeBoardId })
  }

  if (page === 'board' && active) {
    return (
      <Board
        key={active.id}
        value={active}
        onChange={updateActive}
        onBoards={() => {
          setMiss('')
          setPage('list')
        }}
      />
    )
  }

  return (
    <div className="kb">
      <header className="kb-top">
        <div>
          <p className="kb-kicker">Job boards</p>
          <h1>Boards</h1>
          <p className="kb-hint">
            Open a board to work it. North Loop Photo is the sample. A new
            board starts empty: To do, In progress, Done.
          </p>
        </div>
      </header>
      {miss ? <p className="kb-miss">{miss}</p> : null}
      {workspace.boards.length === 0 ? (
        <p className="kb-empty-board">No boards. Make one to start.</p>
      ) : (
        <ul className="kb-board-list">
          {workspace.boards.map((board) => (
            <li key={board.id} className="kb-board-row">
              <div>
                <p className="kb-board-name">{board.title}</p>
                <p className="kb-board-meta">
                  {board.columns.length} columns, {cardCount(board)} cards
                </p>
              </div>
              <div className="kb-actions">
                <button type="button" onClick={() => openBoard(board.id)}>
                  Open
                </button>
                <button
                  type="button"
                  className="kb-card-remove"
                  onClick={() => duplicateBoard(board.id)}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className="kb-card-remove"
                  onClick={() => removeBoard(board.id)}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form className="kb-add-column" onSubmit={addBoard}>
        <label>
          Board name
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Front desk"
          />
        </label>
        <button type="submit">New board</button>
      </form>
    </div>
  )
}

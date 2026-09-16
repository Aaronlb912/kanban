import { useState } from 'react'
import { Board } from './Board.jsx'
import {
  blankBoard,
  cardCount,
  cloneBoard,
  downloadWorkspace,
  normalizeWorkspace,
  closedCount,
} from './board-json.js'

export function Workspace({
  value,
  onChange,
  onResetSample,
  cloud,
  cloudNote,
  cloudMiss,
  onSignInCloud,
  onPullCloud,
  onForgetCloud,
}) {
  const workspace = normalizeWorkspace(value)
  const [page, setPage] = useState('board')
  const [title, setTitle] = useState('')
  const [miss, setMiss] = useState('')

  const connected = Boolean(cloud && cloud.signedIn)

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
        copyKind={connected ? 'private' : 'demo'}
        onBoards={() => {
          setMiss('')
          setPage('list')
        }}
        onLoadWorkspace={(next) => {
          setWorkspace(normalizeWorkspace(next))
          setPage('board')
        }}
        onDownloadAll={() => downloadWorkspace(workspace)}
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
            Jobs stay on this computer until you sign in below. Get the
            files if you want the board in your own app.
          </p>
        </div>
        <div className="kb-actions">
          <button type="button" className="kb-btn-ghost" onClick={() => downloadWorkspace(workspace)}>
            Download all boards
          </button>
          <a
            className="kb-btn-ghost"
            href="https://github.com/Aaronlb912/kanban"
          >
            Get the files
          </a>
          {onResetSample ? (
            <button type="button" className="kb-btn-ghost" onClick={onResetSample}>
              Reset sample
            </button>
          ) : null}
        </div>
      </header>
      {miss ? <p className="kb-miss">{miss}</p> : null}
      {cloudMiss ? <p className="kb-miss">{cloudMiss}</p> : null}
      {cloudNote ? <p className="kb-note">{cloudNote}</p> : null}
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
                  {closedCount(board) ? `, ${closedCount(board)} closed` : ''}
                </p>
              </div>
              <div className="kb-actions">
                <button type="button" onClick={() => openBoard(board.id)}>
                  Open
                </button>
                <button
                  type="button"
                  className="kb-btn-ghost"
                  onClick={() => duplicateBoard(board.id)}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className="kb-btn-ghost"
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
      {onSignInCloud ? (
        <div className="kb-cloud">
          <h2>Keep these boards on your other devices</h2>
          <p className="kb-hint">
            Sign in. A window opens. Make a free account, or use one you
            already have. This page remembers you. On your phone, open the
            same demo and sign in with that same account. No keys to copy.
          </p>
          {connected ? (
            <p className="kb-note">
              {cloud.name
                ? `Signed in as ${cloud.name}.`
                : 'Signed in. Boards save to this account.'}
            </p>
          ) : (
            <p className="kb-note">
              Until you sign in, boards stay in this browser only.
            </p>
          )}
          <div className="kb-actions">
            {connected ? null : (
              <button type="button" onClick={onSignInCloud}>
                Sign in
              </button>
            )}
            {connected ? (
              <button type="button" className="kb-btn-ghost" onClick={onPullCloud}>
                Load saved boards
              </button>
            ) : null}
            {connected ? (
              <button type="button" className="kb-quiet" onClick={onForgetCloud}>
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}

import { useEffect, useState } from 'react'
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
  onConnectCloud,
  onPullCloud,
  onForgetCloud,
}) {
  const workspace = normalizeWorkspace(value)
  const [page, setPage] = useState('board')
  const [title, setTitle] = useState('')
  const [miss, setMiss] = useState('')
  const [token, setToken] = useState('')
  const [gistId, setGistId] = useState(cloud && cloud.gistId ? cloud.gistId : '')

  useEffect(() => {
    if (cloud && cloud.gistId) setGistId(cloud.gistId)
  }, [cloud])

  const connected = Boolean(cloud && cloud.token && cloud.gistId)

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
            Jobs stay on this computer until you save a private copy below.
            Get the files if you want the board in your own app.
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
      {onConnectCloud ? (
        <form
          className="kb-cloud"
          onSubmit={(event) => {
            event.preventDefault()
            onConnectCloud(token, gistId)
          }}
        >
          <h2>Keep these boards on your other devices</h2>
          <p className="kb-hint">
            A gist is a private GitHub note. This page can save your boards
            there so your laptop and phone share the same list.
          </p>
          <ol className="kb-steps">
            <li>Sign in to GitHub. A free account is enough.</li>
            <li>
              Open{' '}
              <a
                href="https://github.com/settings/tokens/new?scopes=gist&description=Kanban%20boards"
                target="_blank"
                rel="noreferrer"
              >
                this GitHub key page</a>. Pick how long the key lasts. Click
              Generate token.
            </li>
            <li>
              Copy the code GitHub shows. It only shows once. Keep it to
              yourself.
            </li>
            <li>Paste that code in GitHub key below.</li>
            <li>
              First time: leave Gist ID blank. Click Connect. The page will
              show a Gist ID. Write that down.
            </li>
            <li>
              On another device, paste the same GitHub key and that Gist ID,
              then Connect.
            </li>
          </ol>
          {connected ? (
            <p className="kb-note">
              Your Gist ID is {cloud.gistId}. Copy that. You need it on your
              other devices.
            </p>
          ) : (
            <p className="kb-note">
              Until you connect, boards stay in this browser only.
            </p>
          )}
          <label>
            GitHub key
            <input
              type="password"
              autoComplete="off"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Paste the code from GitHub"
            />
          </label>
          <label>
            Gist ID (first time: leave this blank)
            <input
              value={gistId}
              onChange={(event) => setGistId(event.target.value)}
              placeholder="Leave blank the first time"
            />
          </label>
          <div className="kb-actions">
            <button type="submit">{connected ? 'Reconnect' : 'Connect'}</button>
            {connected ? (
              <button type="button" className="kb-btn-ghost" onClick={onPullCloud}>
                Load from GitHub
              </button>
            ) : null}
            {connected ? (
              <button
                type="button"
                className="kb-quiet"
                onClick={() => {
                  setToken('')
                  setGistId('')
                  onForgetCloud()
                }}
              >
                Forget this browser
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </div>
  )
}

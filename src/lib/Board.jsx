import { useEffect, useRef, useState } from 'react'
import { Column } from './Column.jsx'
import { CardPage } from './CardPage.jsx'
import {
  boardBadges,
  cardMatches,
  cloneCard,
  downloadBoard,
  findCard,
  moveCard,
  placeColumn,
  newColumnId,
  nextColumnColor,
  normalizeCard,
  parseFile,
  closeCard as closeOutCard,
  reopenCard,
  removeClosedCard,
  updateClosedCard,
  updateCard,
} from './board-json.js'
import './board.css'

export function Board({
  value,
  onChange,
  onBoards,
  onLoadWorkspace,
  onDownloadAll,
  copyKind,
}) {
  const drag = useRef(null)
  const fileInput = useRef(null)
  const [dragId, setDragId] = useState(null)
  const [colDragId, setColDragId] = useState(null)
  const [over, setOver] = useState(null)
  const [colOver, setColOver] = useState(null)
  const [miss, setMiss] = useState('')
  const [columnName, setColumnName] = useState('')
  const [boardTitle, setBoardTitle] = useState(value.title)
  const [query, setQuery] = useState('')
  const [badge, setBadge] = useState('')
  const [renaming, setRenaming] = useState(false)
  const [view, setView] = useState({ name: 'board' })
  const [showClosed, setShowClosed] = useState(false)
  const skipClick = useRef(false)
  const titleInput = useRef(null)

  useEffect(() => {
    setBoardTitle(value.title)
  }, [value.title])

  useEffect(() => {
    if (renaming && titleInput.current) titleInput.current.focus()
  }, [renaming])

  const filtering = Boolean(query.trim() || badge)
  const badges = boardBadges(value)

  function removeCard(columnId, cardId) {
    onChange({
      ...value,
      columns: value.columns.map((column) => {
        if (column.id !== columnId) return column
        return {
          ...column,
          cards: column.cards.filter((card) => card.id !== cardId),
        }
      }),
    })
  }

  function startDrag(event, columnId, cardId) {
    if (filtering || event.target.closest('button')) {
      event.preventDefault()
      return
    }
    drag.current = { type: 'card', columnId, cardId }
    setDragId(cardId)
    setColDragId(null)
    setColOver(null)
    event.dataTransfer.setData('text/plain', cardId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function startColumnDrag(event, columnId) {
    if (event.target.closest('button, input, select')) {
      event.preventDefault()
      return
    }
    drag.current = { type: 'column', columnId }
    setColDragId(columnId)
    setDragId(null)
    setOver(null)
    event.dataTransfer.setData('text/plain', columnId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function columnBox(event) {
    const el =
      event.currentTarget.closest && event.currentTarget.closest('.kb-column')
        ? event.currentTarget.closest('.kb-column')
        : event.currentTarget
    return el.getBoundingClientRect()
  }

  function overColumnSlot(event, columnId) {
    if (!drag.current || drag.current.type !== 'column') return
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'move'
    const rect = columnBox(event)
    const before = event.clientX < rect.left + rect.width / 2
    if (!colOver || colOver.columnId !== columnId || colOver.before !== before) {
      setColOver({ columnId, before })
    }
  }

  function dropColumnAt(event, columnId) {
    const from = drag.current
    if (!from || from.type !== 'column') return
    event.preventDefault()
    event.stopPropagation()
    const destIndex = value.columns.findIndex((column) => column.id === columnId)
    if (destIndex < 0) return
    const rect = columnBox(event)
    const before = event.clientX < rect.left + rect.width / 2
    const toIndex = before ? destIndex : destIndex + 1
    onChange(placeColumn(value, from.columnId, toIndex))
    drag.current = null
    setColDragId(null)
    setColOver(null)
    skipClick.current = true
  }

  function overCard(event, columnId, cardIndex) {
    if (drag.current && drag.current.type === 'column') {
      overColumnSlot(event, columnId)
      return
    }
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'move'
    const rect = event.currentTarget.getBoundingClientRect()
    const after = event.clientY > rect.top + rect.height / 2
    const index = after ? cardIndex + 1 : cardIndex
    if (!over || over.columnId !== columnId || over.index !== index) {
      setOver({ columnId, index })
    }
  }

  function overColumn(event, columnId) {
    if (drag.current && drag.current.type === 'column') {
      overColumnSlot(event, columnId)
      return
    }
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const column = value.columns.find((item) => item.id === columnId)
    const index = column ? column.cards.length : 0
    if (!over || over.columnId !== columnId || over.index !== index) {
      setOver({ columnId, index })
    }
  }

  function dropAt(event, columnId, index) {
    event.preventDefault()
    event.stopPropagation()
    if (filtering) return
    const from = drag.current
    if (!from || from.type !== 'card') return
    onChange(moveCard(value, from.columnId, from.cardId, columnId, index))
    drag.current = null
    setDragId(null)
    setOver(null)
    skipClick.current = true
  }

  function dropOnCard(event, columnId, cardIndex) {
    if (drag.current && drag.current.type === 'column') {
      dropColumnAt(event, columnId)
      return
    }
    const rect = event.currentTarget.getBoundingClientRect()
    const after = event.clientY > rect.top + rect.height / 2
    dropAt(event, columnId, after ? cardIndex + 1 : cardIndex)
  }

  function dropOnColumn(event, columnId) {
    if (drag.current && drag.current.type === 'column') {
      dropColumnAt(event, columnId)
      return
    }
    const column = value.columns.find((item) => item.id === columnId)
    dropAt(event, columnId, column ? column.cards.length : 0)
  }

  function endDrag() {
    drag.current = null
    setDragId(null)
    setColDragId(null)
    setOver(null)
    setColOver(null)
  }

  function setColumnColor(columnId, color) {
    onChange({
      ...value,
      columns: value.columns.map((column) => {
        if (column.id !== columnId) return column
        return { ...column, color }
      }),
    })
  }

  function renameColumn(columnId, title) {
    const trimmed = title.trim()
    if (!trimmed) {
      setMiss('Need a column name.')
      return
    }
    setMiss('')
    onChange({
      ...value,
      columns: value.columns.map((column) => {
        if (column.id !== columnId) return column
        return { ...column, title: trimmed }
      }),
    })
  }

  function removeColumn(columnId) {
    setMiss('')
    onChange({
      ...value,
      columns: value.columns.filter((column) => column.id !== columnId),
    })
  }

  function addColumn(event) {
    event.preventDefault()
    const trimmed = columnName.trim()
    if (!trimmed) {
      setMiss('Need a column name.')
      return
    }
    setMiss('')
    setColumnName('')
    onChange({
      ...value,
      columns: [
        ...value.columns,
        { id: newColumnId(), title: trimmed, color: nextColumnColor(value.columns), cards: [] },
      ],
    })
  }

  function saveBoardTitle(event) {
    if (event && event.preventDefault) event.preventDefault()
    const raw = titleInput.current ? titleInput.current.value : boardTitle
    const trimmed = raw.trim()
    if (!trimmed) {
      setMiss('Need a board title.')
      setBoardTitle(value.title)
      return
    }
    setMiss('')
    setBoardTitle(trimmed)
    setRenaming(false)
    if (trimmed !== value.title) onChange({ ...value, title: trimmed })
  }

  function cancelRename() {
    setBoardTitle(value.title)
    setRenaming(false)
    setMiss('')
  }

  function loadFile(event) {
    const file = event.target.files && event.target.files[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseFile(String(reader.result || ''))
      if (!parsed.ok) {
        setMiss(parsed.error)
        return
      }
      setMiss('')
      if (parsed.kind === 'workspace') {
        if (onLoadWorkspace) onLoadWorkspace(parsed.workspace)
        else onChange(parsed.workspace.boards[0])
        return
      }
      onChange(parsed.board)
    }
    reader.onerror = () => {
      setMiss('Could not read that file.')
    }
    reader.readAsText(file)
  }

  function closeOut(columnId, cardId) {
    onChange(closeOutCard(value, columnId, cardId))
  }

  function putBack(cardId, columnId) {
    onChange(reopenCard(value, cardId, columnId))
  }

  function openCard(columnId, cardId) {
    if (skipClick.current) {
      skipClick.current = false
      return
    }
    setView({ name: 'edit', columnId, cardId })
  }

  function openClosed(cardId) {
    setView({ name: 'edit', cardId, closed: true })
  }

  function openNew() {
    if (value.columns.length === 0) {
      setMiss('Add a column first.')
      return
    }
    setMiss('')
    setView({ name: 'new', card: normalizeCard({ title: '' }) })
  }

  function createCard(nextCard, columnId) {
    onChange({
      ...value,
      columns: value.columns.map((column) => {
        if (column.id !== columnId) return column
        return { ...column, cards: [...column.cards, nextCard] }
      }),
    })
    setView({ name: 'board' })
    setMiss('')
  }

  function saveCard(nextCard, nextColumnId) {
    const found = findCard(value, nextCard.id)
    if (found && found.closed) {
      onChange(updateClosedCard(value, nextCard))
      setView({ name: 'board' })
      setMiss('')
      return
    }
    const columnId = found && found.column ? found.column.id : view.columnId
    let board = updateCard(value, columnId, nextCard)
    if (nextColumnId && nextColumnId !== columnId) {
      const dest = board.columns.find((column) => column.id === nextColumnId)
      const at = dest ? dest.cards.length : 0
      board = moveCard(board, columnId, nextCard.id, nextColumnId, at)
    }
    onChange(board)
    setView({ name: 'board' })
    setMiss('')
  }

  function closeOpenCard(nextCard, nextColumnId) {
    let board = updateCard(value, view.columnId, nextCard)
    const fromId = nextColumnId && nextColumnId !== view.columnId ? nextColumnId : view.columnId
    if (nextColumnId && nextColumnId !== view.columnId) {
      const dest = board.columns.find((column) => column.id === nextColumnId)
      const at = dest ? dest.cards.length : 0
      board = moveCard(board, view.columnId, nextCard.id, nextColumnId, at)
    }
    onChange(closeOutCard(board, fromId, nextCard.id))
    setView({ name: 'board' })
    setMiss('')
  }

  function reopenOpenCard(nextCard, nextColumnId) {
    const board = updateClosedCard(value, nextCard)
    onChange(reopenCard(board, nextCard.id, nextColumnId))
    setView({ name: 'board' })
    setMiss('')
  }

  function cancelEdit() {
    setView({ name: 'board' })
    setMiss('')
  }

  function removeOpenCard(cardId) {
    const found = findCard(value, cardId)
    if (found && found.closed) onChange(removeClosedCard(value, cardId))
    else if (found && found.column) removeCard(found.column.id, cardId)
    setView({ name: 'board' })
  }

  function duplicateOpenCard() {
    const found = findCard(value, view.cardId)
    if (!found) return
    const copy = cloneCard(found.card)
    const destId = found.closed
      ? found.card.fromColumnId &&
        value.columns.some((column) => column.id === found.card.fromColumnId)
        ? found.card.fromColumnId
        : value.columns[0]
          ? value.columns[0].id
          : ''
      : found.column.id
    if (!destId) return
    onChange({
      ...value,
      columns: value.columns.map((column) => {
        if (column.id !== destId) return column
        if (found.closed) return { ...column, cards: [...column.cards, copy] }
        const index = column.cards.findIndex((card) => card.id === found.card.id)
        const cards = [...column.cards]
        cards.splice(index + 1, 0, copy)
        return { ...column, cards }
      }),
    })
    setView({ name: 'edit', columnId: destId, cardId: copy.id })
  }

  const open =
    view.name === 'edit' ? findCard(value, view.cardId) : null

  if (view.name === 'new' && view.card) {
    return (
      <CardPage
        mode="new"
        board={value}
        columnId={value.columns[0] ? value.columns[0].id : ''}
        card={view.card}
        onSave={createCard}
        onCancel={cancelEdit}
      />
    )
  }

  if (view.name === 'edit' && open) {
    const editColumnId = open.closed
      ? open.card.fromColumnId &&
        value.columns.some((column) => column.id === open.card.fromColumnId)
        ? open.card.fromColumnId
        : value.columns[0]
          ? value.columns[0].id
          : ''
      : open.column.id
    return (
      <CardPage
        key={open.card.id}
        mode="edit"
        closed={open.closed}
        board={value}
        columnId={editColumnId}
        card={open.card}
        onSave={saveCard}
        onCancel={cancelEdit}
        onRemove={removeOpenCard}
        onDuplicate={duplicateOpenCard}
        onClose={closeOpenCard}
        onReopen={reopenOpenCard}
      />
    )
  }

  return (
    <div className="kb">
      <header className="kb-top">
        <div>
          <p className="kb-kicker">
            {copyKind === 'private' ? 'Private copy' : 'Public demo'}
          </p>
          {renaming ? (
            <div className="kb-title-form">
              <label>
                Board name
                <input
                  ref={titleInput}
                  className="kb-title-input"
                  value={boardTitle}
                  onChange={(event) => setBoardTitle(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      saveBoardTitle(event)
                    }
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      cancelRename()
                    }
                  }}
                />
              </label>
              <div className="kb-actions">
                <button type="button" onClick={saveBoardTitle}>
                  Save name
                </button>
                <button type="button" className="kb-btn-ghost" onClick={cancelRename}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="kb-title-row">
              <h1>{value.title}</h1>
              <button
                type="button"
                className="kb-quiet"
                onClick={() => {
                  setBoardTitle(value.title)
                  setRenaming(true)
                }}
              >
                Edit name
              </button>
            </div>
          )}
          {value.note ? <p className="kb-note">{value.note}</p> : null}
          <p className="kb-hint">
            Add card opens a page. Search finds jobs, including closed ones.
            Close out sends a finished job off the board. Drag a column by its name.
          </p>
        </div>
        <div className="kb-actions">
          {onBoards ? (
            <button type="button" className="kb-btn-ghost" onClick={onBoards}>
              Boards
            </button>
          ) : null}
          <button type="button" onClick={openNew}>
            Add card
          </button>
          <button type="button" className="kb-btn-ghost" onClick={() => downloadBoard(value)}>
            Download this board
          </button>
          {onDownloadAll ? (
            <button type="button" className="kb-btn-ghost" onClick={onDownloadAll}>
              Download all boards
            </button>
          ) : null}
          <button
            type="button"
            className="kb-btn-ghost"
            onClick={() => fileInput.current && fileInput.current.click()}
          >
            Load JSON
          </button>
          <input
            ref={fileInput}
            className="kb-file"
            type="file"
            accept="application/json,.json"
            onChange={loadFile}
          />
        </div>
      </header>
      <div className="kb-tools">
        <label>
          Search
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Title, details, owner, badge"
          />
        </label>
        {badges.length > 0 ? (
          <label>
            Badge
            <select value={badge} onChange={(event) => setBadge(event.target.value)}>
              <option value="">All badges</option>
              {badges.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      {miss ? <p className="kb-miss">{miss}</p> : null}
      {value.columns.length === 0 ? (
        <p className="kb-empty-board">No columns on this board. Add one to start.</p>
      ) : (
        <div className="kb-columns">
          {value.columns.map((column) => {
            const cards = filtering
              ? column.cards.filter((card) => cardMatches(card, query, badge))
              : column.cards
            return (
              <Column
                key={column.id}
                column={column}
                cards={cards}
                filtering={filtering}
                dragId={dragId}
                colDragId={colDragId}
                over={over}
                colOver={colOver}
                onRemoveCard={removeCard}
                onRemoveColumn={removeColumn}
                onRename={renameColumn}
                onColor={setColumnColor}
                onOpenCard={openCard}
                onCloseCard={closeOut}
                onDragStart={startDrag}
                onColumnDragStart={startColumnDrag}
                onColumnDragOver={overColumnSlot}
                onColumnDrop={dropColumnAt}
                onDragOverCard={overCard}
                onDragOverColumn={overColumn}
                onDropCard={dropOnCard}
                onDropColumn={dropOnColumn}
                onDragEnd={endDrag}
              />
            )
          })}
        </div>
      )}
      <form className="kb-add-column" onSubmit={addColumn}>
        <label>
          Column
          <input
            value={columnName}
            onChange={(event) => setColumnName(event.target.value)}
            placeholder="On hold"
          />
        </label>
        <button type="submit">Add column</button>
      </form>
      <ClosedJobs
        items={value.closed || []}
        filtering={filtering}
        query={query}
        badge={badge}
        shown={showClosed}
        onToggle={() => setShowClosed(!showClosed)}
        onOpen={openClosed}
        onReopen={putBack}
        onRemove={(cardId) => onChange(removeClosedCard(value, cardId))}
      />
    </div>
  )
}

function ClosedJobs({
  items,
  filtering,
  query,
  badge,
  shown,
  onToggle,
  onOpen,
  onReopen,
  onRemove,
}) {
  const matches = filtering
    ? items.filter((card) => cardMatches(card, query, badge))
    : items
  const visible = filtering || shown ? matches : []
  const count = items.length

  return (
    <section className="kb-closed" aria-label="Closed jobs">
      <header className="kb-closed-head">
        <div className="kb-column-name">
          <h2>Closed jobs</h2>
          <span className="kb-count">{count}</span>
        </div>
        {count > 0 && !filtering ? (
          <button type="button" className="kb-quiet" onClick={onToggle}>
            {shown ? 'Hide' : 'Show'}
          </button>
        ) : null}
      </header>
      {count === 0 ? (
        <p className="kb-empty">
          Close out a finished job and it lands here. Search still finds it.
        </p>
      ) : filtering && matches.length === 0 ? (
        <p className="kb-empty">No closed jobs match.</p>
      ) : visible.length === 0 ? (
        <p className="kb-empty">Hidden so they stay off the board. Show if you need one.</p>
      ) : (
        <ul className="kb-closed-list">
          {visible.map((card) => (
            <li key={card.id} className="kb-closed-row">
              <div>
                <p className="kb-closed-name">{card.title}</p>
                <p className="kb-closed-meta">
                  {card.closedAt ? `Closed ${card.closedAt}` : 'Closed'}
                  {card.fromColumnTitle ? ` · was ${card.fromColumnTitle}` : ''}
                  {card.owner ? ` · ${card.owner}` : ''}
                </p>
              </div>
              <div className="kb-closed-actions">
                <button type="button" className="kb-quiet" onClick={() => onOpen(card.id)}>
                  Open
                </button>
                <button type="button" className="kb-quiet" onClick={() => onReopen(card.id)}>
                  Put back
                </button>
                <button type="button" className="kb-quiet" onClick={() => onRemove(card.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

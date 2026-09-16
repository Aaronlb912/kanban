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
  moveColumn,
  newColumnId,
  nextColumnColor,
  normalizeCard,
  parseFile,
  updateCard,
} from './board-json.js'
import './board.css'

export function Board({ value, onChange, onBoards, onLoadWorkspace, onDownloadAll }) {
  const drag = useRef(null)
  const fileInput = useRef(null)
  const [dragId, setDragId] = useState(null)
  const [over, setOver] = useState(null)
  const [miss, setMiss] = useState('')
  const [columnName, setColumnName] = useState('')
  const [boardTitle, setBoardTitle] = useState(value.title)
  const [query, setQuery] = useState('')
  const [badge, setBadge] = useState('')
  const [view, setView] = useState({ name: 'board' })
  const skipClick = useRef(false)
  const titleInput = useRef(null)

  useEffect(() => {
    setBoardTitle(value.title)
  }, [value.title])

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
    drag.current = { columnId, cardId }
    setDragId(cardId)
    event.dataTransfer.setData('text/plain', cardId)
    event.dataTransfer.effectAllowed = 'move'
  }

  function overCard(event, columnId, cardIndex) {
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
    if (!from) return
    onChange(moveCard(value, from.columnId, from.cardId, columnId, index))
    drag.current = null
    setDragId(null)
    setOver(null)
    skipClick.current = true
  }

  function dropOnCard(event, columnId, cardIndex) {
    const rect = event.currentTarget.getBoundingClientRect()
    const after = event.clientY > rect.top + rect.height / 2
    dropAt(event, columnId, after ? cardIndex + 1 : cardIndex)
  }

  function dropOnColumn(event, columnId) {
    const column = value.columns.find((item) => item.id === columnId)
    dropAt(event, columnId, column ? column.cards.length : 0)
  }

  function endDrag() {
    drag.current = null
    setDragId(null)
    setOver(null)
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

  function shiftColumn(columnId, dir) {
    onChange(moveColumn(value, columnId, dir))
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
    if (trimmed !== value.title) onChange({ ...value, title: trimmed })
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

  function openCard(columnId, cardId) {
    if (skipClick.current) {
      skipClick.current = false
      return
    }
    setView({ name: 'edit', columnId, cardId })
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
    let board = updateCard(value, view.columnId, nextCard)
    if (nextColumnId && nextColumnId !== view.columnId) {
      const dest = board.columns.find((column) => column.id === nextColumnId)
      const at = dest ? dest.cards.length : 0
      board = moveCard(board, view.columnId, nextCard.id, nextColumnId, at)
    }
    onChange(board)
    setView({ name: 'board' })
    setMiss('')
  }

  function cancelEdit() {
    setView({ name: 'board' })
    setMiss('')
  }

  function removeOpenCard(cardId) {
    removeCard(view.columnId, cardId)
    setView({ name: 'board' })
  }

  function duplicateOpenCard() {
    const found = findCard(value, view.cardId)
    if (!found) return
    const copy = cloneCard(found.card)
    onChange({
      ...value,
      columns: value.columns.map((column) => {
        if (column.id !== found.column.id) return column
        const index = column.cards.findIndex((card) => card.id === found.card.id)
        const cards = [...column.cards]
        cards.splice(index + 1, 0, copy)
        return { ...column, cards }
      }),
    })
    setView({ name: 'edit', columnId: found.column.id, cardId: copy.id })
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
    return (
      <CardPage
        key={open.card.id}
        mode="edit"
        board={value}
        columnId={open.column.id}
        card={open.card}
        onSave={saveCard}
        onCancel={cancelEdit}
        onRemove={removeOpenCard}
        onDuplicate={duplicateOpenCard}
      />
    )
  }

  return (
    <div className="kb">
      <header className="kb-top">
        <div>
          <p className="kb-kicker">Job board</p>
          <div className="kb-title-form">
            <label>
              Board name
              <input
                ref={titleInput}
                className="kb-title-input"
                value={boardTitle}
                onChange={(event) => setBoardTitle(event.target.value)}
                onBlur={saveBoardTitle}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    saveBoardTitle(event)
                  }
                }}
              />
            </label>
          </div>
          {value.note ? <p className="kb-note">{value.note}</p> : null}
          <p className="kb-hint">
            Add card opens a page. Search finds jobs. Click a card to edit it.
          </p>
        </div>
        <div className="kb-actions">
          {onBoards ? (
            <button type="button" className="kb-card-remove" onClick={onBoards}>
              Boards
            </button>
          ) : null}
          <button type="button" onClick={openNew}>
            Add card
          </button>
          <button type="button" onClick={() => downloadBoard(value)}>
            Download this board
          </button>
          {onDownloadAll ? (
            <button type="button" onClick={onDownloadAll}>
              Download all boards
            </button>
          ) : null}
          <button type="button" onClick={() => fileInput.current && fileInput.current.click()}>
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
          {value.columns.map((column, index) => {
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
                over={over}
                canMoveLeft={index > 0}
                canMoveRight={index < value.columns.length - 1}
                onRemoveCard={removeCard}
                onRemoveColumn={removeColumn}
                onRename={renameColumn}
                onMove={shiftColumn}
                onColor={setColumnColor}
                onOpenCard={openCard}
                onDragStart={startDrag}
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
    </div>
  )
}

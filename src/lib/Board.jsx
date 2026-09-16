import { useRef, useState } from 'react'
import { Column } from './Column.jsx'
import {
  downloadBoard,
  moveCard,
  newCardId,
  newColumnId,
  parseBoard,
} from './board-json.js'
import './board.css'

export function Board({ value, onChange }) {
  const drag = useRef(null)
  const fileInput = useRef(null)
  const [dragId, setDragId] = useState(null)
  const [over, setOver] = useState(null)
  const [miss, setMiss] = useState('')
  const [columnName, setColumnName] = useState('')

  function addCard(columnId, fields) {
    onChange({
      ...value,
      columns: value.columns.map((column) => {
        if (column.id !== columnId) return column
        return {
          ...column,
          cards: [
            ...column.cards,
            {
              id: newCardId(),
              title: fields.title,
              note: fields.note || '',
            },
          ],
        }
      }),
    })
  }

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
    if (event.target.closest('button')) {
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
    const from = drag.current
    if (!from) return
    onChange(moveCard(value, from.columnId, from.cardId, columnId, index))
    drag.current = null
    setDragId(null)
    setOver(null)
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
        { id: newColumnId(), title: trimmed, cards: [] },
      ],
    })
  }

  function loadFile(event) {
    const file = event.target.files && event.target.files[0]
    event.target.value = ''
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseBoard(String(reader.result || ''))
      if (!parsed.ok) {
        setMiss(parsed.error)
        return
      }
      setMiss('')
      onChange(parsed.board)
    }
    reader.onerror = () => {
      setMiss('Could not read that file.')
    }
    reader.readAsText(file)
  }

  return (
    <div className="kb">
      <header className="kb-top">
        <div>
          <p className="kb-kicker">Job board</p>
          <h1>{value.title}</h1>
          {value.note ? <p className="kb-note">{value.note}</p> : null}
          <p className="kb-hint">Drag a card to move it. Load JSON for your jobs.</p>
        </div>
        <div className="kb-actions">
          <button type="button" onClick={() => downloadBoard(value)}>
            Download JSON
          </button>
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
      {miss ? <p className="kb-miss">{miss}</p> : null}
      {value.columns.length === 0 ? (
        <p className="kb-empty-board">No columns on this board. Add one to start.</p>
      ) : (
        <div className="kb-columns">
          {value.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              dragId={dragId}
              over={over}
              onAddCard={addCard}
              onRemoveCard={removeCard}
              onRemoveColumn={removeColumn}
              onDragStart={startDrag}
              onDragOverCard={overCard}
              onDragOverColumn={overColumn}
              onDropCard={dropOnCard}
              onDropColumn={dropOnColumn}
              onDragEnd={endDrag}
            />
          ))}
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

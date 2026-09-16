import { useState } from 'react'
import { Card } from './Card.jsx'
import { COLUMN_COLORS, normalizeColor } from './board-json.js'

export function Column({
  column,
  dragId,
  over,
  onAddCard,
  onRemoveCard,
  onRemoveColumn,
  onColor,
  onOpenCard,
  onDragStart,
  onDragOverCard,
  onDragOverColumn,
  onDropCard,
  onDropColumn,
  onDragEnd,
}) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [miss, setMiss] = useState('')

  function submit(event) {
    event.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) {
      setMiss('Need a job title.')
      return
    }
    onAddCard(column.id, { title: trimmed, note: note.trim() })
    setTitle('')
    setNote('')
    setMiss('')
  }

  const dropOnEnd =
    over && over.columnId === column.id && over.index === column.cards.length

  const color = normalizeColor(column.color)

  return (
    <section
      className={`kb-column${over && over.columnId === column.id ? ' kb-column-over' : ''}`}
      style={{ '--kb-col': color }}
      aria-labelledby={`col-${column.id}`}
    >
      <header className="kb-column-head">
        <h2 id={`col-${column.id}`}>{column.title}</h2>
        <span className="kb-count">{column.cards.length}</span>
        <label className="kb-color">
          Color
          <select
            value={color}
            onChange={(event) => onColor(column.id, event.target.value)}
          >
            {COLUMN_COLORS.map((item) => (
              <option key={item.hex} value={item.hex}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="kb-card-remove"
          onClick={() => onRemoveColumn(column.id)}
        >
          Remove column
        </button>
      </header>
      <div
        className="kb-cards"
        onDragOver={(event) => onDragOverColumn(event, column.id)}
        onDrop={(event) => onDropColumn(event, column.id)}
      >
        {column.cards.length === 0 ? (
          <p className="kb-empty">Nothing in this column.</p>
        ) : (
          column.cards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              dragging={dragId === card.id}
              dropLine={
                over && over.columnId === column.id && over.index === index
                  ? 'before'
                  : ''
              }
              onRemove={(cardId) => onRemoveCard(column.id, cardId)}
              onOpen={(cardId) => onOpenCard(column.id, cardId)}
              onDragStart={(event) => onDragStart(event, column.id, card.id)}
              onDragOver={(event) => onDragOverCard(event, column.id, index)}
              onDrop={(event) => onDropCard(event, column.id, index)}
              onDragEnd={onDragEnd}
            />
          ))
        )}
        {dropOnEnd && column.cards.length > 0 ? (
          <div className="kb-drop-end" />
        ) : null}
      </div>
      <form className="kb-add" onSubmit={submit}>
        <label>
          Job
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Name, job"
          />
        </label>
        <label>
          Note
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Due date, who to call"
          />
        </label>
        {miss ? <p className="kb-miss">{miss}</p> : null}
        <button type="submit">Add card</button>
      </form>
    </section>
  )
}

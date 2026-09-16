import { useEffect, useState } from 'react'
import { Card } from './Card.jsx'
import { COLUMN_COLORS, normalizeColor } from './board-json.js'

export function Column({
  column,
  cards,
  filtering,
  dragId,
  over,
  canMoveLeft,
  canMoveRight,
  onRemoveCard,
  onRemoveColumn,
  onRename,
  onMove,
  onColor,
  onOpenCard,
  onDragStart,
  onDragOverCard,
  onDragOverColumn,
  onDropCard,
  onDropColumn,
  onDragEnd,
}) {
  const visible = cards || column.cards
  const [title, setTitle] = useState(column.title)

  useEffect(() => {
    setTitle(column.title)
  }, [column.title])

  function commitTitle() {
    const trimmed = title.trim()
    if (!trimmed) {
      setTitle(column.title)
      onRename(column.id, '')
      return
    }
    if (trimmed !== column.title) onRename(column.id, trimmed)
  }

  const dropOnEnd =
    !filtering &&
    over &&
    over.columnId === column.id &&
    over.index === column.cards.length

  const color = normalizeColor(column.color)

  return (
    <section
      className={`kb-column${over && over.columnId === column.id ? ' kb-column-over' : ''}`}
      style={{ '--kb-col': color }}
      aria-label={column.title}
    >
      <header className="kb-column-head">
        <label className="kb-column-title">
          Column name
          <input
            id={`col-${column.id}`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                event.currentTarget.blur()
              }
            }}
          />
        </label>
        <span className="kb-count">
          {filtering ? `${visible.length} / ${column.cards.length}` : column.cards.length}
        </span>
        <div className="kb-column-tools">
          <button
            type="button"
            className="kb-card-remove"
            disabled={!canMoveLeft}
            onClick={() => onMove(column.id, -1)}
          >
            Left
          </button>
          <button
            type="button"
            className="kb-card-remove"
            disabled={!canMoveRight}
            onClick={() => onMove(column.id, 1)}
          >
            Right
          </button>
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
        </div>
      </header>
      <div
        className="kb-cards"
        onDragOver={(event) => onDragOverColumn(event, column.id)}
        onDrop={(event) => onDropColumn(event, column.id)}
      >
        {visible.length === 0 ? (
          <p className="kb-empty">
            {filtering ? 'Nothing matches.' : 'Nothing in this column.'}
          </p>
        ) : (
          visible.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              dragging={dragId === card.id}
              dropLine={
                !filtering &&
                over &&
                over.columnId === column.id &&
                over.index === index
                  ? 'before'
                  : ''
              }
              lockDrag={filtering}
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
    </section>
  )
}

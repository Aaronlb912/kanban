import { Column } from './Column.jsx'
import { downloadBoard, newCardId } from './board-json.js'
import './board.css'

export function Board({ value, onChange }) {
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

  return (
    <div className="kb">
      <header className="kb-top">
        <div>
          <p className="kb-kicker">Job board</p>
          <h1>{value.title}</h1>
          {value.note ? <p className="kb-note">{value.note}</p> : null}
        </div>
        <button type="button" onClick={() => downloadBoard(value)}>
          Download JSON
        </button>
      </header>
      <div className="kb-columns">
        {value.columns.map((column) => (
          <Column
            key={column.id}
            column={column}
            onAddCard={addCard}
            onRemoveCard={removeCard}
          />
        ))}
      </div>
    </div>
  )
}

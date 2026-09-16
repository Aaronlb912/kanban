export function downloadBoard(board, filename = 'board.json') {
  const blob = new Blob([JSON.stringify(board, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function newCardId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `c-${Date.now()}`
}

export function moveCard(board, fromColumnId, cardId, toColumnId, toIndex) {
  const fromCol = board.columns.find((column) => column.id === fromColumnId)
  const toCol = board.columns.find((column) => column.id === toColumnId)
  if (!fromCol || !toCol) return board

  const fromIndex = fromCol.cards.findIndex((card) => card.id === cardId)
  if (fromIndex < 0) return board

  const card = fromCol.cards[fromIndex]
  const columns = board.columns.map((column) => ({
    ...column,
    cards: [...column.cards],
  }))
  const nextFrom = columns.find((column) => column.id === fromColumnId)
  const nextTo = columns.find((column) => column.id === toColumnId)
  nextFrom.cards.splice(fromIndex, 1)

  let insertAt = toIndex
  if (fromColumnId === toColumnId && fromIndex < toIndex) {
    insertAt -= 1
  }
  if (insertAt < 0) insertAt = 0
  if (insertAt > nextTo.cards.length) insertAt = nextTo.cards.length
  nextTo.cards.splice(insertAt, 0, card)

  return { ...board, columns }
}

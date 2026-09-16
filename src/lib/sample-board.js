export const sampleBoard = {
  id: 'board-north-loop',
  title: 'North Loop Photo',
  note: 'Studio jobs this week. Names are fake.',
  columns: [
    {
      id: 'intake',
      title: 'Intake',
      color: '#8a6a2a',
      cards: [
        {
          id: 'c-rae',
          title: 'Rae Chen, senior portraits',
          body: 'Sitting on Saturday. Contact rae@example.com',
          owner: 'Mira Patel',
          due: '2026-09-19',
          badges: [{ id: 'b-rush', label: 'rush' }],
          checklist: [
            { id: 'ch-rae-1', text: 'Contract signed', done: true },
            { id: 'ch-rae-2', text: 'Outfit list', done: false },
          ],
        },
        {
          id: 'c-pat',
          title: 'Pat Ortiz, product set',
          body: 'Oak Street Hardware. 12 SKUs on white.',
          owner: 'Mira Patel',
          due: '2026-09-22',
          badges: [{ id: 'b-shop', label: 'shop' }],
          checklist: [],
        },
      ],
    },
    {
      id: 'edit',
      title: 'In edit',
      color: '#7a3b2e',
      cards: [
        {
          id: 'c-dana',
          title: 'Dana Kim, wedding proof',
          body: 'Gallery due Wednesday. dana@example.com',
          owner: 'Jules Nguyen',
          due: '2026-09-17',
          badges: [{ id: 'b-wedding', label: 'wedding' }],
          checklist: [
            { id: 'ch-dana-1', text: 'Color grade', done: true },
            { id: 'ch-dana-2', text: 'Export proofs', done: false },
          ],
        },
      ],
    },
    {
      id: 'ready',
      title: 'Ready for pickup',
      color: '#3d5a45',
      cards: [
        {
          id: 'c-eli',
          title: 'Eli Vargas, class composites',
          body: 'Paid. Front desk envelope.',
          owner: 'Mira Patel',
          due: '2026-09-16',
          badges: [{ id: 'b-paid', label: 'paid' }],
          checklist: [{ id: 'ch-eli-1', text: 'Print check', done: true }],
        },
      ],
    },
  ],
  closed: [
    {
      id: 'c-sam',
      title: 'Sam Lee, passport photos',
      body: 'Picked up last Tuesday. Envelope in the paid drawer.',
      owner: 'Mira Patel',
      due: '2026-09-09',
      badges: [{ id: 'b-sam-paid', label: 'paid' }],
      checklist: [{ id: 'ch-sam-1', text: 'Print check', done: true }],
      closedAt: '2026-09-09',
      fromColumnId: 'ready',
      fromColumnTitle: 'Ready for pickup',
    },
  ],
}

export const sampleWorkspace = {
  boards: [sampleBoard],
  activeBoardId: sampleBoard.id,
}

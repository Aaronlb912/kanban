import { useState } from 'react'
import { Workspace, normalizeWorkspace, sampleWorkspace } from './lib/index.js'

export default function App() {
  const [workspace, setWorkspace] = useState(() =>
    normalizeWorkspace(sampleWorkspace),
  )

  return <Workspace value={workspace} onChange={setWorkspace} />
}

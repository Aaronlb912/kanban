import { useEffect, useRef, useState } from 'react'
import { Workspace, normalizeWorkspace, sampleWorkspace } from './lib/index.js'
import {
  cloudSignIn,
  cloudSignOut,
  cloudSignedIn,
  cloudUserName,
  pullCloudWorkspace,
  pushCloudWorkspace,
} from './lib/cloud-store.js'

const STORAGE_KEY = 'kanban-workspace'

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return normalizeWorkspace(sampleWorkspace)
    return normalizeWorkspace(JSON.parse(raw))
  } catch {
    return normalizeWorkspace(sampleWorkspace)
  }
}

function writeStored(workspace) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace))
  } catch {
    // Demo still runs if storage is blocked.
  }
}

export default function App() {
  const [workspace, setWorkspace] = useState(readStored)
  const [cloud, setCloud] = useState({ signedIn: false, name: '' })
  const [cloudNote, setCloudNote] = useState('')
  const [cloudMiss, setCloudMiss] = useState('')
  const pending = useRef(null)
  const timer = useRef(null)
  const signedIn = useRef(false)

  useEffect(() => {
    try {
      localStorage.removeItem('kanban-gist')
    } catch {
      // Old gist keys can stay if storage is blocked.
    }
    let gone = false
    async function boot() {
      if (!cloudSignedIn()) return
      const name = await cloudUserName()
      if (gone) return
      signedIn.current = true
      setCloud({ signedIn: true, name })
      setCloudNote('Loading your boards.')
      const pulled = await pullCloudWorkspace()
      if (gone) return
      if (!pulled.ok) {
        setCloudMiss(pulled.error)
        setCloudNote('')
        return
      }
      if (pulled.data) {
        const next = normalizeWorkspace(pulled.data)
        setWorkspace(next)
        writeStored(next)
      }
      setCloudMiss('')
      setCloudNote(name ? `Signed in as ${name}.` : 'Signed in. Saving to your account.')
    }
    boot()
    return () => {
      gone = true
    }
  }, [])

  function change(next) {
    const normalized = normalizeWorkspace(next)
    setWorkspace(normalized)
    writeStored(normalized)
    pending.current = normalized
    if (timer.current) clearTimeout(timer.current)
    if (!signedIn.current) return
    timer.current = setTimeout(() => {
      const body = pending.current
      if (!body) return
      setCloudNote('Saving.')
      pushCloudWorkspace(body).then((result) => {
        if (!result.ok) {
          setCloudMiss(result.error)
          setCloudNote('')
          return
        }
        setCloudMiss('')
        setCloudNote('Saved.')
      })
    }, 800)
  }

  async function signInCloud() {
    setCloudMiss('')
    const result = await cloudSignIn()
    if (!result.ok) {
      setCloudMiss(result.error)
      return
    }
    signedIn.current = true
    setCloud({ signedIn: true, name: result.name })
    const pulled = await pullCloudWorkspace()
    if (!pulled.ok) {
      setCloudMiss(pulled.error)
      return
    }
    if (pulled.data) {
      const next = normalizeWorkspace(pulled.data)
      setWorkspace(next)
      writeStored(next)
      setCloudNote(
        result.name
          ? `Signed in as ${result.name}. Loaded your boards.`
          : 'Signed in. Loaded your boards.',
      )
      return
    }
    const pushed = await pushCloudWorkspace(workspace)
    if (!pushed.ok) {
      setCloudMiss(pushed.error)
      return
    }
    setCloudNote(
      result.name
        ? `Signed in as ${result.name}. Boards will follow this account.`
        : 'Signed in. Boards will follow this account.',
    )
  }

  async function pullCloud() {
    if (!signedIn.current) {
      setCloudMiss('Sign in first.')
      return
    }
    const pulled = await pullCloudWorkspace()
    if (!pulled.ok) {
      setCloudMiss(pulled.error)
      return
    }
    if (!pulled.data) {
      setCloudNote('No saved boards on this account yet.')
      return
    }
    const next = normalizeWorkspace(pulled.data)
    setWorkspace(next)
    writeStored(next)
    setCloudMiss('')
    setCloudNote('Loaded your boards.')
  }

  function forgetCloud() {
    cloudSignOut()
    signedIn.current = false
    setCloud({ signedIn: false, name: '' })
    setCloudNote('This browser is only saving on this computer now.')
    setCloudMiss('')
  }

  function resetSample() {
    if (!window.confirm('Replace stored boards with the North Loop sample?')) {
      return
    }
    change(normalizeWorkspace(sampleWorkspace))
  }

  return (
    <Workspace
      value={workspace}
      onChange={change}
      onResetSample={resetSample}
      cloud={cloud}
      cloudNote={cloudNote}
      cloudMiss={cloudMiss}
      onSignInCloud={signInCloud}
      onPullCloud={pullCloud}
      onForgetCloud={forgetCloud}
    />
  )
}

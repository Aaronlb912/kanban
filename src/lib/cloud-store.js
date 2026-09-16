const FILE = 'kanban-boards.json'

export function cloudReady() {
  return Boolean(typeof window !== 'undefined' && window.puter && window.puter.auth)
}

export function cloudSignedIn() {
  return cloudReady() && window.puter.auth.isSignedIn()
}

export async function cloudUserName() {
  try {
    const user = await window.puter.auth.getUser()
    if (!user || typeof user !== 'object') return ''
    if (typeof user.username === 'string' && user.username.trim()) return user.username.trim()
    if (typeof user.email === 'string' && user.email.trim()) return user.email.trim()
    return ''
  } catch {
    return ''
  }
}

export async function cloudSignIn() {
  if (!cloudReady()) {
    return { ok: false, error: 'Sign-in is not available on this page.' }
  }
  try {
    await window.puter.auth.signIn()
    return { ok: true, name: await cloudUserName() }
  } catch (err) {
    const msg = String((err && (err.message || err.code)) || err || '')
    if (/popup/i.test(msg)) {
      return { ok: false, error: 'The sign-in window was blocked. Allow popups and try again.' }
    }
    if (/closed|cancel/i.test(msg)) {
      return { ok: false, error: 'Sign-in was cancelled.' }
    }
    return { ok: false, error: 'Could not sign in.' }
  }
}

export function cloudSignOut() {
  if (cloudReady()) window.puter.auth.signOut()
}

function missing(err) {
  const code = err && (err.code || err.error)
  const msg = String((err && err.message) || err || '')
  return (
    code === 'subject_does_not_exist' ||
    code === 'item_with_name_does_not_exist' ||
    /not found|does not exist|no such/i.test(msg)
  )
}

export async function pullCloudWorkspace() {
  try {
    const blob = await window.puter.fs.read(FILE)
    const text = await blob.text()
    if (!text.trim()) return { ok: true, data: null }
    return { ok: true, data: JSON.parse(text) }
  } catch (err) {
    if (missing(err)) return { ok: true, data: null }
    return { ok: false, error: 'Could not load your saved boards.' }
  }
}

export async function pushCloudWorkspace(workspace) {
  try {
    await window.puter.fs.write(FILE, JSON.stringify(workspace, null, 2), {
      overwrite: true,
      createMissingParents: true,
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save your boards.' }
  }
}

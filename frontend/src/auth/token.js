const TOKEN_STORAGE_KEY = 'jwt'
const TOKEN_CHANGE_EVENT = 'auth:token-changed'

export function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
  else localStorage.removeItem(TOKEN_STORAGE_KEY)

  // Keep same-tab consumers in sync (storage event doesn't fire in same tab)
  window.dispatchEvent(
    new CustomEvent(TOKEN_CHANGE_EVENT, {
      detail: { token: token || null },
    })
  )
}

export function clearToken() {
  setToken(null)
}

export function onTokenChange(handler) {
  const sameTabListener = (e) => handler(e?.detail?.token ?? getToken())
  const crossTabListener = (e) => {
    if (e.key !== TOKEN_STORAGE_KEY) return
    handler(e.newValue)
  }

  window.addEventListener(TOKEN_CHANGE_EVENT, sameTabListener)
  window.addEventListener('storage', crossTabListener)

  return () => {
    window.removeEventListener(TOKEN_CHANGE_EVENT, sameTabListener)
    window.removeEventListener('storage', crossTabListener)
  }
}

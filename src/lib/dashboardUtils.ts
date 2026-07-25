export function storeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function storeSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('storage set failed', e)
  }
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) throw new Error(`request failed: ${res.status}`)
  return res.json()
}

export function hashHue(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360
  return h
}

export function faviconFor(url: string) {
  try {
    const u = new URL(url)
    return 'https://www.google.com/s2/favicons?sz=64&domain=' + u.hostname
  } catch {
    return ''
  }
}

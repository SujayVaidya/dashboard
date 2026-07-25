export interface ShortcutItem {
  _id: string
  name: string
  siteUrl: string
  iconUrl?: string
}

export interface Prefs {
  lat?: number
  lon?: number
  label?: string
}

export interface ChecklistItem {
  _id: string
  text: string
  done: boolean
}

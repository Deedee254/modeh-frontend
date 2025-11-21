import { useRuntimeConfig } from '#imports'

export function resolveAssetUrl(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null
  try {
    if (/^(?:https?:)?\/\//.test(value)) return value
    if (/^(?:data:|blob:)/.test(value)) return value
  } catch (e) {}
  const config = useRuntimeConfig()
  const base = config?.public?.apiBase || ''
  if (!base) return value.startsWith('/') ? value : `/${value}`
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const cleanPath = value.startsWith('/') ? value : `/${value}`
  return `${cleanBase}${cleanPath}`
}

export default resolveAssetUrl

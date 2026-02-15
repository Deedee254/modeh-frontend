import { useRuntimeConfig } from '#imports'

/**
 * Resolves relative asset URLs to full URLs based on API base.
 * Supports full URLs, data URIs, and relative paths.
 */
export function resolveAssetUrl(value: string | null | undefined): string | null {
  if (!value || typeof value !== 'string') return null
  try {
    // Already a full URL or data URI
    if (/^(?:https?:)?\/\//.test(value)) return value
    if (/^(?:data:|blob:)/.test(value)) return value
  } catch (e) { }

  const config = useRuntimeConfig()
  let base = config?.public?.apiBase || ''
  if (!base) return value.startsWith('/') ? value : `/${value}`

  // If apiBase points to an /api subpath, we should strip it for storage assets
  // which are typically served from the domain root in Laravel/Sanctum.
  if (base.toLowerCase().endsWith('/api') && (value.startsWith('/storage') || value.startsWith('storage'))) {
    base = base.slice(0, -4)
  }

  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base
  const cleanPath = value.startsWith('/') ? value : `/${value}`
  return `${cleanBase}${cleanPath}`
}

/**
 * Generates a letter avatar SVG data URI.
 * Takes the first letter of a name and returns a colorful avatar.
 * @param name - User's name to extract first letter from
 * @returns SVG data URI for avatar
 */
export function generateLetterAvatar(name: string | null | undefined): string {
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    // Fallback for missing name
    return "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect fill='%23e5e7eb' width='100%25' height='100%25'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23999' font-size='28' font-weight='600'%3E%3F%3C/text%3E%3C/svg%3E"
  }

  const letter = name.trim().charAt(0).toUpperCase()

  // Color palette - consistent colors based on letter hash
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#85C1E2',
    '#F06292', '#29B6F6', '#66BB6A', '#FFCA28', '#EF5350'
  ]
  const bgColor = colors[letter.charCodeAt(0) % colors.length]

  // SVG with letter avatar
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
    <defs>
      <style>
        .avatar-bg { fill: ${bgColor}; }
        .avatar-text { font-size: 32px; font-weight: 700; fill: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      </style>
    </defs>
    <rect class='avatar-bg' width='100%' height='100%'/>
    <text class='avatar-text' x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'>${letter}</text>
  </svg>`

  // Encode to data URI
  const encoded = encodeURIComponent(svg)
  return `data:image/svg+xml;utf8,${encoded}`
}

/**
 * Resolves avatar URL with fallback to letter-based avatar.
 * This is the primary function to use for all avatars across the app.
 * Standardizes on single 'avatar' field name for consistency.
 * @param avatarUrl - Avatar URL from backend (avatar_url, avatar, image, etc.)
 * @param name - User/entity name for letter avatar fallback
 * @returns Full avatar URL or letter avatar SVG data URI
 */
export function resolveAvatar(
  avatarUrl: string | null | undefined,
  name: string | null | undefined
): string {
  // First try to resolve the URL if it exists
  if (avatarUrl) {
    const resolved = resolveAssetUrl(avatarUrl)
    if (resolved) return resolved
  }

  // Fallback to letter-based avatar
  return generateLetterAvatar(name)
}

/**
 * Resolve an avatar from a user-like object by checking common fields.
 * Handles nested profile data and berbagai alias (avatar_url, image, picture, etc.)
 */
export function resolveUserAvatar(
  user: any,
  name?: string | null
): string {
  if (!user) return generateLetterAvatar(name)

  // Extract avatar URL by checking common field names
  // Prioritize u.avatar_url, u.avatar, u.avatarUrl, u.image, u.picture, u.photo
  let avatarUrl = user.avatar_url || user.avatar || user.avatarUrl || user.image || user.picture || user.photo || null

  // If not found, check nested profile (likely from Laravel)
  if (!avatarUrl && user.profile) {
    const p = user.profile
    avatarUrl = p.avatar_url || p.avatar || p.image || p.photo || null
  }

  const userName = name || user.name || user.displayName || user.display_name || null

  return resolveAvatar(avatarUrl, userName)
}

export default resolveAssetUrl


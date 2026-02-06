export function useQuizMedia() {
  const isImage = (url: string) => {
    if (!url) return false
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith('data:image/')
  }

  const isAudio = (url: string) => {
    if (!url) return false
    return /\.(mp3|wav|ogg|m4a)$/i.test(url) || url.startsWith('data:audio/')
  }

  const isYouTube = (url: string) => {
    if (!url) return false
    return /youtube\.com|youtu\.be/.test(url)
  }

  const getAudioType = (url: string) => {
    if (!url) return ''
    if (url.endsWith('.mp3')) return 'audio/mpeg'
    if (url.endsWith('.wav')) return 'audio/wav'
    if (url.endsWith('.ogg')) return 'audio/ogg'
    if (url.endsWith('.m4a')) return 'audio/mp4'
    return ''
  }

  const formatYouTubeUrl = (url: string) => {
    if (!url) return ''
    // Extract the canonical 11-character video ID from common YouTube URL forms
    try {
      const m = url.match(/(?:youtube\.com\/(?:.*v=|v\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
      if (m && m[1]) return `https://www.youtube.com/embed/${m[1]}`
      // If url itself looks like a raw id
      if (/^[A-Za-z0-9_-]{11}$/.test(url)) return `https://www.youtube.com/embed/${url}`
      // Fallback: attempt to parse v= parameter
      const m2 = url.match(/[?&]v=([^&]+)/)
      if (m2 && m2[1]) return `https://www.youtube.com/embed/${m2[1]}`
      // Last resort: return original URL (may already be embed)
      return url
    } catch (e) {
      // Never throw from this helper
      console.error('formatYouTubeUrl error', e)
      return url
    }
  }

  return { isImage, isAudio, isYouTube, getAudioType, formatYouTubeUrl }
}


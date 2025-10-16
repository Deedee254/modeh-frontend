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
    // Convert standard YouTube URLs to embed format
    return url.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/, 'https://www.youtube.com/embed/$1')
  }

  return { isImage, isAudio, isYouTube, getAudioType, formatYouTubeUrl }
}

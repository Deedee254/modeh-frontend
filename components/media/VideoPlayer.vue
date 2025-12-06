<template>
  <div class="w-full rounded-xl overflow-hidden bg-black">
    <template v-if="isYouTube(src)">
      <div class="relative" style="padding-top:56.25%">
        <iframe
          :src="formatYouTubeUrl(src)"
          class="absolute inset-0 w-full h-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
    </template>

    <template v-else-if="isVimeo(src)">
      <div class="relative" style="padding-top:56.25%">
        <iframe
          :src="formatVimeoUrl(src)"
          class="absolute inset-0 w-full h-full"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          referrerpolicy="no-referrer"
        ></iframe>
      </div>
    </template>

    <template v-else-if="isVideo(src)">
      <video class="w-full h-auto" controls preload="metadata" :poster="poster">
        <source :src="src" :type="getVideoType(src)" />
        Your browser does not support the video tag.
      </video>
    </template>

    <template v-else>
      <div class="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500">
        <span>No playable video available</span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ src: { type: [String, null], default: null }, poster: { type: String, default: null } })

const src = computed(() => props.src || '')

function isYouTube(url) {
  return typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be'))
}

function isVimeo(url) {
  return typeof url === 'string' && url.includes('vimeo.com')
}

function isVideo(url) {
  return typeof url === 'string' && /\.(mp4|webm|ogg)$/i.test(url)
}

function getVideoType(url) {
  const ext = String(url).split('.').pop().toLowerCase()
  return `video/${ext}`
}

function formatYouTubeUrl(url) {
  if (!url) return ''
  // trim whitespace
  url = url.trim()
  
  // If already an embed URL, just return it
  if (url.includes('/embed/')) {
     return url
  }

  // Robust Regex for ID extraction
  // Covers: youtu.be, youtube.com/watch?v=, youtube.com/v/, youtube.com/embed/
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  let videoId = (match && match[2].length === 11) ? match[2] : null;

  if (!videoId) {
    // Basic fallback for simple v= param if regex fails (unlikely for valid urls)
    try {
      if (url.includes('v=')) {
         const parts = url.split('v=')
         if (parts[1]) videoId = parts[1].split('&')[0]
      }
    } catch (e) {}
  }

  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1` : url;
}

function formatVimeoUrl(url) {
  try {
    const id = url.split('vimeo.com/')[1]
    return id ? `https://player.vimeo.com/video/${id}?dnt=1&title=0&byline=0&portrait=0` : url
  } catch (e) { return url }
}
</script>

<style scoped>
/* keep iframe responsive */
.relative iframe { display: block; }
</style>


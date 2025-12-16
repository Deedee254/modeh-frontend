<template>
  <div v-if="hasMedia" class="space-y-2 rounded-lg border border-gray-200 dark:border-gray-700 p-2 sm:p-3 bg-gray-50 dark:bg-gray-900/50">
    <!-- YouTube Video Preview -->
    <div v-if="youtubeUrl" class="rounded-lg overflow-hidden bg-gray-900">
      <iframe 
        :src="getYoutubeEmbedUrl(youtubeUrl)" 
        class="w-full aspect-video rounded-lg" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen
        loading="lazy"
      ></iframe>
    </div>
    
    <!-- Image Preview -->
    <img 
      v-if="isImageMedia && mediaUrl" 
      :src="mediaUrl" 
      class="w-full h-auto rounded-lg max-h-64 object-contain"
      :alt="alt || 'Question media'"
    />
    
    <!-- Audio Preview -->
    <audio 
      v-if="isAudioMedia && mediaUrl" 
      controls 
      class="w-full rounded-lg"
    >
      <source :src="mediaUrl" />
    </audio>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQuizMedia } from '~/composables/quiz/useQuizMedia'

interface Props {
  youtubeUrl?: string | null
  mediaUrl?: string | null
  mediaType?: string | null
  alt?: string
}

const props = withDefaults(defineProps<Props>(), {
  youtubeUrl: null,
  mediaUrl: null,
  mediaType: null,
  alt: 'Question media'
})

const { isImage, isAudio } = useQuizMedia()

const hasMedia = computed(() => !!(props.youtubeUrl || props.mediaUrl))
const isImageMedia = computed(() => props.mediaType === 'image' && !!props.mediaUrl)
const isAudioMedia = computed(() => props.mediaType === 'audio' && !!props.mediaUrl)

function getYoutubeEmbedUrl(url: string): string {
  if (!url) return ''
  let videoId = ''
  
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split('?')[0] || ''
  } else if (url.includes('youtube.com/watch')) {
    try {
      videoId = new URL(url).searchParams.get('v') || ''
    } catch (e) {
      const match = url.match(/[?&]v=([^&]+)/)
      videoId = match?.[1] || ''
    }
  } else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split('?')[0] || ''
  }
  
  return videoId ? `https://www.youtube.com/embed/${videoId}` : url
}
</script>

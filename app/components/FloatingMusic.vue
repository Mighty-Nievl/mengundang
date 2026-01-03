<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'

const props = defineProps<{
  url: string,
  startTime?: number,
  fade?: boolean
}>()

const isPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)
const ytPlayer = ref<any>(null)
const isYouTube = computed(() => {
  return props.url.includes('youtube.com') || props.url.includes('youtu.be')
})

const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2] && match[2].length === 11) ? match[2] : null;
}

onMounted(() => {
    if (isYouTube.value) {
        loadYouTubeAPI()
    }
})

watch(() => props.url, (newUrl) => {
    if (isYouTube.value) {
        const videoId = getYouTubeId(newUrl)
        if (ytPlayer.value && videoId) {
            ytPlayer.value.loadVideoById({
                videoId: videoId,
                startSeconds: props.startTime || 0
            })
        } else {
             loadYouTubeAPI()
        }
    }
})

const loadYouTubeAPI = () => {
  if (typeof (window as any).YT !== 'undefined' && (window as any).YT.Player) {
    initPlayer()
  } else {
    const tag = document.createElement('script')
    tag.src = "https://www.youtube.com/iframe_api"
    const firstScriptTag = document.getElementsByTagName('script')[0]
    if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    } else {
        document.head.appendChild(tag)
    }
    ;(window as any).onYouTubeIframeAPIReady = initPlayer
  }
}

const initPlayer = () => {
    const videoId = getYouTubeId(props.url)
    if (!videoId) return

    ytPlayer.value = new (window as any).YT.Player('yt-player-container', {
        height: '0',
        width: '0',
        videoId: videoId,
        playerVars: {
            'playsinline': 1,
            'controls': 0,
            'loop': 1,
            'start': props.startTime || 0, // YouTube Start Time
            'origin': window.location.origin,
            'enablejsapi': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    })
}

const onPlayerReady = (event: any) => {
    if(props.fade) event.target.setVolume(0)
    else event.target.setVolume(100)
}

const onPlayerStateChange = (event: any) => {
    if (event.data === (window as any).YT.PlayerState.ENDED) {
        event.target.playVideo(); 
    }
}

const fadeInAudio = (element: HTMLAudioElement) => {
    if (!props.fade) {
        element.volume = 1
        return
    }
    element.volume = 0
    let vol = 0
    const interval = setInterval(() => {
        if (vol < 1) {
            vol += 0.05
            element.volume = Math.min(vol, 1)
        } else {
            clearInterval(interval)
        }
    }, 200) // Fade over 4 seconds (200ms * 20 steps)
}

const fadeInYouTube = () => {
    if (!props.fade || !ytPlayer.value) {
        if(ytPlayer.value) ytPlayer.value.setVolume(100)
        return
    }
    ytPlayer.value.setVolume(0)
    let vol = 0
    const interval = setInterval(() => {
        if (vol < 100) {
            vol += 5
            if(ytPlayer.value) ytPlayer.value.setVolume(Math.min(vol, 100))
        } else {
            clearInterval(interval)
        }
    }, 200)
}

const togglePlay = () => {
  if (isYouTube.value) {
      if (!ytPlayer.value) return
      if (isPlaying.value) {
          ytPlayer.value.pauseVideo()
      } else {
          ytPlayer.value.playVideo()
      }
      isPlaying.value = !isPlaying.value
  } else {
      if (!audioRef.value) return
      if (isPlaying.value) {
        audioRef.value.pause()
      } else {
        if(props.startTime && audioRef.value.currentTime === 0) {
            audioRef.value.currentTime = props.startTime
        }
        audioRef.value.play()
        fadeInAudio(audioRef.value)
      }
      isPlaying.value = !isPlaying.value
  }
}

// Auto play method called by parent
const playMusic = () => {
  if (isYouTube.value) {
       if (ytPlayer.value?.playVideo && typeof ytPlayer.value.playVideo === 'function') {
           ytPlayer.value.playVideo()
           fadeInYouTube()
           isPlaying.value = true
       }
  } else {
      if(audioRef.value) {
        if(props.startTime) audioRef.value.currentTime = props.startTime
        audioRef.value.play().then(() => {
          fadeInAudio(audioRef.value!)
          isPlaying.value = true
        }).catch(e => {
          console.log("Autoplay prevented:", e)
        })
      }
  }
}

defineExpose({ playMusic })

</script>

<template>
  <div class="fixed bottom-6 right-6 z-40">
    <!-- Hidden YT Player -->
    <div v-if="isYouTube" id="yt-player-container" class="hidden"></div>
    
    <!-- HTML5 Audio for non-YT -->
    <audio v-else ref="audioRef" loop preload="auto">
      <source :src="url" type="audio/mp3">
    </audio>
    
    <button @click="togglePlay" class="w-12 h-12 bg-white/80 backdrop-blur border border-gold-200 rounded-full flex items-center justify-center text-gold-600 shadow-lg shadow-gold-500/20 animate-pulse hover:animate-none transition-all">
      <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  </div>
</template>

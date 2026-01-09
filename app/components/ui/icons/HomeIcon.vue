<script setup lang="ts">
import { ref } from 'vue'
import { animate } from 'motion'

interface Props {
  size?: number | string
  color?: string
  strokeWidth?: number
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  color: 'currentColor',
  strokeWidth: 2,
  className: ''
})

const scope = ref<SVGElement | null>(null)

const startAnimation = async () => {
  if (!scope.value) return
  
  animate(
    scope.value.querySelectorAll('.roof'),
    { y: [-2, 0], opacity: [0.6, 1] },
    { duration: 0.4, ease: "easeOut" }
  )
  
  await animate(
    scope.value.querySelectorAll('.house'),
    { scale: [0.95, 1] },
    { duration: 0.3, ease: "easeOut" }
  )
  
  animate(
    scope.value.querySelectorAll('.door'), 
    { scaleY: [0, 1] }, 
    { duration: 0.3, ease: "easeOut" }
  )
}

const stopAnimation = () => {
  if (!scope.value) return
  
  animate(
    scope.value.querySelectorAll('.roof, .house, .door'),
    { y: 0, opacity: 1, scale: 1, scaleY: 1 },
    { duration: 0.2, ease: "easeInOut" }
  )
}

defineExpose({
  startAnimation,
  stopAnimation
})
</script>

<template>
  <svg
    ref="scope"
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :stroke="color"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="['cursor-pointer', className]"
    @mouseenter="startAnimation"
    @mouseleave="stopAnimation"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path class="roof" d="M5 12l-2 0l9 -9l9 9l-2 0" />
    <path
      class="house"
      style="transform-origin: center"
      d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"
    />
    <path
      class="door"
      style="transform-origin: center bottom"
      d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"
    />
  </svg>
</template>

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
  
  await animate(
    scope.value.querySelectorAll('.heart'),
    { scale: [1, 1.15, 1, 1.25, 1] },
    { duration: 0.6, ease: 'easeOut' }
  )
}

const stopAnimation = () => {
  if (!scope.value) return
  
  animate(
    scope.value.querySelectorAll('.heart'), 
    { scale: 1 }, 
    { duration: 0.2, ease: 'easeOut' }
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
    style="overflow: visible"
    @mouseenter="startAnimation"
    @mouseleave="stopAnimation"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path
      class="heart"
      style="transform-origin: 50% 50%"
      d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"
    />
  </svg>
</template>

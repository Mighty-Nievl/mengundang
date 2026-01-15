<script setup lang="ts">
/**
 * Custom OG Image Template for Wedding Invitations
 * Size: 1200x630px (Facebook/Twitter recommended)
 * 
 * Features:
 * - Background photo from user
 * - Gradient overlay for text readability
 * - Couple names with premium typography
 * - Logo watermark in corner
 * - Decorative gold border
 */

// Props from defineOgImage
const props = defineProps<{
  groomName?: string
  brideName?: string
  backgroundImage?: string
  weddingDate?: string
}>()

// Defaults
const groom = props.groomName || 'Groom'
const bride = props.brideName || 'Bride'
const bgImage = props.backgroundImage || 'https://mengundang.site/cover.png'
const dateText = props.weddingDate || ''
</script>

<template>
  <div class="og-container">
    <!-- Background Image -->
    <div class="og-background" :style="{ backgroundImage: `url(${bgImage})` }"></div>
    
    <!-- Gradient Overlay -->
    <div class="og-overlay"></div>
    
    <!-- Decorative Border -->
    <div class="og-border">
      <div class="og-border-inner"></div>
    </div>
    
    <!-- Content -->
    <div class="og-content">
      <!-- Top Decoration -->
      <div class="og-decoration-top">✦</div>
      
      <!-- The Wedding Of Text -->
      <p class="og-subtitle">THE WEDDING OF</p>
      
      <!-- Couple Names -->
      <h1 class="og-title">
        {{ groom }}
        <span class="og-ampersand">&</span>
        {{ bride }}
      </h1>
      
      <!-- Wedding Date (if available) -->
      <p v-if="dateText" class="og-date">{{ dateText }}</p>
      
      <!-- Bottom Decoration -->
      <div class="og-decoration-bottom">✦</div>
    </div>
    
    <!-- Logo Watermark -->
    <div class="og-watermark">
      <img src="https://mengundang.site/logo_loader.webp" alt="Logo" class="og-logo" />
      <span class="og-brand">mengundang.site</span>
    </div>
  </div>
</template>

<style scoped>
.og-container {
  width: 1200px;
  height: 630px;
  position: relative;
  overflow: hidden;
  font-family: 'Playfair Display', serif;
}

.og-background {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: brightness(0.7);
}

.og-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.7) 100%
  );
}

/* Gold Border */
.og-border {
  position: absolute;
  inset: 16px;
  border: 2px solid rgba(212, 175, 55, 0.6);
  pointer-events: none;
}

.og-border-inner {
  position: absolute;
  inset: 8px;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

/* Content */
.og-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  z-index: 10;
}

.og-decoration-top,
.og-decoration-bottom {
  color: #D4AF37;
  font-size: 24px;
  letter-spacing: 0.5em;
  opacity: 0.8;
}

.og-decoration-top {
  margin-bottom: 16px;
}

.og-decoration-bottom {
  margin-top: 16px;
}

.og-subtitle {
  color: #D4AF37;
  font-size: 18px;
  font-weight: 400;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  margin-bottom: 20px;
}

.og-title {
  color: #FFFFFF;
  font-size: 72px;
  font-weight: 700;
  text-shadow: 2px 4px 20px rgba(0, 0, 0, 0.5);
  margin: 0;
  line-height: 1.2;
}

.og-ampersand {
  display: block;
  font-size: 48px;
  font-weight: 400;
  font-style: italic;
  color: #D4AF37;
  margin: 8px 0;
}

.og-date {
  color: rgba(255, 255, 255, 0.9);
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.2em;
  margin-top: 24px;
}

/* Watermark */
.og-watermark {
  position: absolute;
  bottom: 32px;
  right: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 20;
}

.og-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.og-brand {
  color: rgba(255, 255, 255, 0.7);
  font-family: 'Lato', sans-serif;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.1em;
}
</style>

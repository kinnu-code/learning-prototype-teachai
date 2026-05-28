<template>
  <div ref="panelRef" class="flex-1 overflow-y-auto px-10 py-8" @scroll="handleScroll">
    <!-- Phase 1: Skim -->
    <template v-if="store.phase === 1">
      <!-- AI intro banner -->
      <div class="bg-learn-100 border border-learn-500 rounded-xl p-5 mb-8 flex gap-3">
        <span class="text-learn-700 text-p20 mt-0.5">✦</span>
        <p class="text-p16 text-learn-700">
          Best to start with a quick skim. This primes your memory, creates hooks for new knowledge, and surfaces questions worth asking before you dive in.
        </p>
      </div>

      <!-- Skim content -->
      <div class="skim-content prose max-w-none" v-html="skimHtml" />

      <!-- End-of-skim prompt (shown after scrolling near bottom) -->
      <Transition name="fade">
        <div v-if="showSkimEnd" class="mt-12 bg-white rounded-xl border border-beige-200 p-6 shadow-sm">
          <p class="text-p16 text-gray-600 mb-4">
            What do you think you already know about this topic? What key things do you want to learn? What questions do you want answered? Feel free to share in the chat →
          </p>
          <button @click="goToRead" class="btn-primary">
            Read full text now
          </button>
        </div>
      </Transition>
    </template>

    <!-- Phase 2: Full read -->
    <template v-else-if="store.phase === 2">
      <div class="prose max-w-none" v-html="fullHtml" />

      <div class="mt-12 bg-white rounded-xl border border-beige-200 p-6 shadow-sm">
        <p class="text-p16 text-gray-600 mb-4">
          Now try teaching what you've just read to our rubber duck — it's one of the best ways to lock in new knowledge.
        </p>
        <button @click="goToTeach" class="btn-primary">
          Teach the rubber duck
        </button>
      </div>
    </template>

    <!-- Phase 3: Teach (reading panel shows dimmed reference) -->
    <template v-else-if="store.phase === 3">
      <!-- Sticky header -->
      <div class="sticky top-0 z-10 bg-beige-100/90 backdrop-blur-sm border-b border-beige-300 -mx-10 px-10 py-3 mb-6">
        <p class="text-p14 text-beige-500">
          📖 Reference text — use the chat to teach the rubber duck everything about this topic.
        </p>
      </div>
      <div class="prose max-w-none opacity-50" v-html="fullHtml" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useAppStore } from '../stores/appStore'
import { renderSkimHtml, renderFullHtml } from '../composables/useContent'

const store = useAppStore()
const panelRef = ref(null)
const showSkimEnd = ref(false)

const skimHtml = computed(() => store.rawMarkdown ? renderSkimHtml(store.rawMarkdown) : '')
const fullHtml = computed(() => store.rawMarkdown ? renderFullHtml(store.rawMarkdown) : '')

function handleScroll() {
  if (store.phase !== 1) return
  const el = panelRef.value
  if (!el) return
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 120
  if (nearBottom) showSkimEnd.value = true
}

function goToRead() {
  store.markSkimDone()
  store.setPhase(2)
  nextTick(() => {
    panelRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

function goToTeach() {
  store.setPhase(3)
  nextTick(() => {
    panelRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

// Scroll to top when phase changes
watch(() => store.phase, () => {
  nextTick(() => panelRef.value?.scrollTo({ top: 0 }))
})
</script>

<style scoped>
/* Skim mode: dim paragraph and list text via color (not opacity — opacity is inherited and can't be overridden by children) */
.skim-content :deep(p),
.skim-content :deep(li) {
  color: rgba(135, 117, 85, 0.18);
}
/* Highlighted keywords shine through at full color */
.skim-content :deep(.skim-highlight) {
  color: #287B90;
  font-weight: 600;
}
/* strong inside dimmed paragraphs should also highlight if tagged, otherwise stay dim */
.skim-content :deep(p strong),
.skim-content :deep(li strong) {
  color: rgba(40, 123, 144, 0.35);
}

/* Prose base styles */
:deep(.prose) {
  color: #877555;
  font-family: var(--font-body);
}
:deep(.prose h1) {
  font-family: var(--font-header);
  font-size: 28px;
  line-height: 34px;
  color: #287B90;
  margin-top: 2rem;
  margin-bottom: 0.75rem;
}
:deep(.prose h2) {
  font-family: var(--font-header);
  font-size: 22px;
  line-height: 26px;
  color: #287B90;
  margin-top: 1.75rem;
  margin-bottom: 0.5rem;
}
:deep(.prose h3) {
  font-family: var(--font-header);
  font-size: 18px;
  line-height: 24px;
  color: #287B90;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
:deep(.prose p) {
  font-size: 16px;
  line-height: 26px;
  margin-bottom: 1rem;
}
:deep(.prose ul), :deep(.prose ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}
:deep(.prose li) {
  font-size: 16px;
  line-height: 24px;
  margin-bottom: 0.25rem;
}
:deep(.prose blockquote) {
  border-left: 3px solid #79B8C8;
  padding-left: 1rem;
  color: #AEA390;
  font-style: italic;
  margin: 1rem 0;
}
:deep(.prose table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.25rem;
}
:deep(.prose th) {
  background: #EBFBFF;
  color: #287B90;
  font-family: var(--font-header);
  padding: 8px 12px;
  text-align: left;
  border: 1px solid #DDDDDD;
}
:deep(.prose td) {
  padding: 8px 12px;
  border: 1px solid #DDDDDD;
  font-size: 14px;
}
:deep(.prose strong) {
  color: #287B90;
  font-weight: 600;
}
:deep(.prose code) {
  background: #F1ECE0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 14px;
}

/* Buttons */
.btn-primary {
  background: #1a1a1a;
  color: white;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 600;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover {
  background: #333;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

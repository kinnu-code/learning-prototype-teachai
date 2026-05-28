<template>
  <div class="h-screen flex overflow-hidden bg-white raster-light-subtle">
    <!-- Reading Panel (65%) -->
    <div class="flex-1 flex flex-col overflow-hidden border-r border-beige-300">
      <ReadingPanel />
    </div>

    <!-- Chat Panel (35%) -->
    <div class="w-[380px] shrink-0 flex flex-col overflow-hidden">
      <ChatPanel />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore'
import { parseContent } from '../composables/useContent'
import ReadingPanel from '../components/ReadingPanel.vue'
import ChatPanel from '../components/ChatPanel.vue'

const router = useRouter()
const store = useAppStore()

onMounted(async () => {
  if (!store.hasApiKey) {
    router.replace('/')
    return
  }

  // Load content if not already loaded
  if (!store.rawMarkdown) {
    try {
      const res = await fetch('/content/topic.md')
      const raw = await res.text()
      const { title, concepts, body } = parseContent(raw)
      store.rawMarkdown = body
      store.topicTitle = title
      store.conceptChecklist = concepts

      // Init concept tracking if not yet set
      if (!store.concepts.length && concepts.length) {
        store.setConcepts(concepts.map(label => ({ label, known: false })))
      }
    } catch (e) {
      console.error('Failed to load content:', e)
    }
  }
})
</script>

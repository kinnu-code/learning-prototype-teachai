<template>
  <div :class="['flex gap-2', role === 'user' ? 'justify-end' : 'justify-start']">
    <!-- AI avatar -->
    <div
      v-if="role === 'assistant'"
      class="w-7 h-7 rounded-full bg-learn-100 flex items-center justify-center text-sm shrink-0 mt-0.5"
    >
      {{ isRubberDuck ? '🦆' : '✦' }}
    </div>

    <!-- Bubble -->
    <div
      :class="[
        'max-w-[85%] rounded-2xl px-4 py-2.5 text-p14',
        role === 'user'
          ? 'bg-gray-900 text-white rounded-br-sm'
          : 'bg-beige-100 text-gray-600 rounded-bl-sm border border-beige-200'
      ]"
      v-html="rendered"
    />

    <!-- User avatar -->
    <div
      v-if="role === 'user'"
      class="w-7 h-7 rounded-full bg-beige-200 flex items-center justify-center text-sm shrink-0 mt-0.5"
    >
      👤
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import { useAppStore } from '../stores/appStore'

const props = defineProps({
  role: String,
  content: String,
})

const store = useAppStore()

const isRubberDuck = computed(() => store.phase === 3 && props.role === 'assistant')

const rendered = computed(() => {
  if (props.role === 'assistant') {
    return marked.parse(props.content || '')
  }
  return props.content
})
</script>

<style scoped>
:deep(p) { margin: 0 0 0.5em 0; }
:deep(p:last-child) { margin-bottom: 0; }
:deep(strong) { font-weight: 600; }
:deep(em) { font-style: italic; }
:deep(code) { background: rgba(0,0,0,0.08); padding: 1px 4px; border-radius: 3px; font-size: 13px; }
</style>

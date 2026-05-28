<template>
  <div class="flex flex-col h-full bg-white border-l border-beige-200">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-beige-200 shrink-0">
      <div class="flex items-center gap-3">
        <!-- Rubber duck avatar (phase 3 only) -->
        <template v-if="store.phase === 3">
          <div class="w-10 h-10 rounded-full bg-learn-100 flex items-center justify-center text-xl shrink-0">
            🦆
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-p14 font-semibold text-beige-700">Rubber Duck</p>
            <div class="mt-1">
              <ProgressBar :value="store.progress" />
            </div>
          </div>
        </template>
        <template v-else>
          <div class="w-10 h-10 rounded-full bg-learn-100 flex items-center justify-center text-xl shrink-0">
            ✦
          </div>
          <div>
            <p class="text-p14 font-semibold text-beige-700">Learning Assistant</p>
            <p class="text-p12 text-beige-500">Ask me anything about the text</p>
          </div>
        </template>
      </div>
    </div>

    <!-- Message thread -->
    <div ref="threadRef" class="flex-1 overflow-y-auto px-4 py-4 space-y-3">
      <ChatMessage
        v-for="(msg, i) in store.chatHistory"
        :key="i"
        :role="msg.role"
        :content="msg.content"
      />
      <!-- Typing indicator -->
      <div v-if="loading" class="flex gap-2 items-center text-beige-400 text-p12 px-2">
        <span class="animate-pulse">●●●</span>
      </div>
    </div>

    <!-- Pills -->
    <div class="px-4 py-2 border-t border-beige-200 shrink-0">
      <PillBar :pills="currentPills" @pill="handlePill" />
    </div>

    <!-- Text input -->
    <div class="px-4 pb-4 shrink-0">
      <div class="flex gap-2 bg-beige-100 border border-beige-300 rounded-xl p-2">
        <textarea
          v-model="userInput"
          ref="inputRef"
          :placeholder="inputPlaceholder"
          :disabled="teachingComplete"
          rows="2"
          class="flex-1 bg-transparent resize-none text-p14 text-gray-600 focus:outline-none placeholder-beige-400 leading-relaxed disabled:opacity-50"
          @keydown.enter.exact.prevent="sendMessage"
        />
        <button
          @click="sendMessage"
          :disabled="!userInput.trim() || loading"
          class="self-end p-2 rounded-lg bg-gray-900 hover:bg-gray-700 disabled:opacity-30 transition-colors shrink-0"
        >
          <img src="/lara-send.svg" alt="Send" class="w-4 h-4 invert" />
        </button>
      </div>
      <p class="text-p10 text-beige-400 mt-1 text-right">Enter to send</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore'
import { useOpenAI } from '../composables/useOpenAI'
import ChatMessage from './ChatMessage.vue'
import PillBar from './PillBar.vue'
import ProgressBar from './ProgressBar.vue'

const router = useRouter()
const store = useAppStore()
const { rubberDuckTurn, freeChat, initRubberDuck } = useOpenAI()

const threadRef = ref(null)
const inputRef = ref(null)
const userInput = ref('')
const loading = ref(false)
const teachingComplete = ref(false)

const inputPlaceholder = computed(() => {
  if (teachingComplete.value) return 'The duck has learned everything!'
  if (store.phase === 3) return 'Teach the rubber duck...'
  return 'Ask me anything...'
})

// Context-sensitive pills
const currentPills = computed(() => {
  if (store.phase === 1) return [
    { id: 'read-now', label: 'Read full text now' },
    { id: 'already-know', label: 'I already know this topic' },
    { id: 'key-terms', label: 'What are the key terms?' },
  ]
  if (store.phase === 2) return [
    { id: 'teach-duck', label: 'Teach the rubber duck' },
    { id: 'summarise', label: 'Summarise this for me' },
    { id: 'explain', label: 'Explain a concept' },
  ]
  if (store.phase === 3 && teachingComplete.value) return [
    { id: 'start-practice', label: 'Start practice questions' },
    { id: 'back-to-read', label: 'Go back to the text' },
  ]
  if (store.phase === 3) return [
    { id: 'hint', label: 'Give me a hint' },
    { id: 'gaps', label: "What haven't I covered?" },
    { id: 'stuck', label: "I'm stuck — help me" },
    { id: 'skip', label: 'Skip to practice' },
  ]
  return []
})

async function handlePill(id) {
  if (id === 'read-now' || id === 'teach-duck') {
    // Transition phase directly
    if (id === 'read-now') {
      store.markSkimDone()
      store.setPhase(2)
    } else {
      store.setPhase(3)
      await startRubberDuck()
    }
    return
  }

  if (id === 'skip' || id === 'start-practice') {
    router.push('/practice')
    return
  }

  if (id === 'back-to-read') {
    store.setPhase(2)
    teachingComplete.value = false
    return
  }

  // Map pill to a pre-defined prompt
  const prompts = {
    'already-know': "I already know this topic quite well. What should I pay attention to?",
    'key-terms': "What are the most important key terms in this text?",
    'summarise': "Can you give me a concise summary of this text?",
    'explain': "Can you explain the main concept of this text in simple terms?",
    'hint': "Give me a hint about what I should explain next to the rubber duck.",
    'gaps': "What concepts haven't I covered yet in my teaching?",
    'stuck': "I'm stuck. Can you guide me on what to explain next without giving away the answer?",
  }

  const prompt = prompts[id]
  if (prompt) {
    userInput.value = prompt
    await sendMessage()
  }
}

async function startRubberDuck() {
  if (!store.rawMarkdown || loading.value) return

  // Add rubber duck opening message if chat is empty or phase just switched
  const hasRubberDuckIntro = store.chatHistory.some(
    m => m.role === 'assistant' && m.content.includes("no idea what this topic")
  )
  if (hasRubberDuckIntro) return

  loading.value = true
  try {
    // Init concepts via AI if not already done from frontmatter
    if (store.concepts.length === 0 && store.conceptChecklist.length > 0) {
      const initConcepts = await initRubberDuck(store.rawMarkdown, store.conceptChecklist)
      store.setConcepts(initConcepts)
    }

    store.addChatMessage('assistant', "🦆 I have no idea what this topic is about. Please teach me everything! Start from the beginning — what is this all about?")
  } finally {
    loading.value = false
  }
}

async function sendMessage() {
  const text = userInput.value.trim()
  if (!text || loading.value) return

  userInput.value = ''
  store.addChatMessage('user', text)
  loading.value = true
  scrollToBottom()

  try {
    let reply

    if (store.phase === 3) {
      const result = await rubberDuckTurn(
        store.rawMarkdown,
        text,
        store.concepts,
        store.chatHistory.slice(-12)
      )
      store.setConcepts(result.updatedConcepts)
      store.setProgress(result.progress)
      reply = result.reply

      // Check for completion
      if (result.progress >= 95 && !teachingComplete.value) {
        reply = "🎉 Wow — I actually feel like I understand this topic now, and it's all thanks to you!\n\nTeaching really is one of the best ways to lock in new knowledge. You clearly know your stuff.\n\nWhenever you're ready, you can move on to practice questions to test what you've learned — or head back to re-read the text if you'd like to review anything first."
        store.addChatMessage('assistant', reply)
        teachingComplete.value = true
        return
      }
    } else {
      reply = await freeChat(text, store.rawMarkdown, store.chatHistory.slice(-12))
    }

    store.addChatMessage('assistant', reply)
  } catch (e) {
    store.addChatMessage('assistant', `Sorry, something went wrong: ${e.message}`)
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (threadRef.value) {
      threadRef.value.scrollTop = threadRef.value.scrollHeight
    }
  })
}

// Watch phase to trigger rubber duck intro
watch(() => store.phase, async (p) => {
  if (p === 3) {
    teachingComplete.value = false
    await nextTick()
    await startRubberDuck()
  }
})

// Watch chat history to auto-scroll
watch(() => store.chatHistory.length, () => scrollToBottom())

onMounted(() => {
  scrollToBottom()

  // Add welcome message if chat is empty
  if (store.chatHistory.length === 0) {
    store.addChatMessage(
      'assistant',
      `Welcome! I'm here to help as you work through **${store.topicTitle || 'this topic'}**. Start with the skim in the reading panel, or ask me anything.`
    )
  }
})
</script>

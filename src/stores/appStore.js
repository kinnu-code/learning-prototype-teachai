import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAppStore = defineStore('app', () => {
  // Persisted keys
  const KEYS = {
    apiKey: 'teachai_api_key',
    phase: 'teachai_phase',
    concepts: 'teachai_concepts',
    progress: 'teachai_progress',
    chatHistory: 'teachai_chat_history',
    skimDone: 'teachai_skim_done',
  }

  const apiKey = ref(localStorage.getItem(KEYS.apiKey) || '')
  const phase = ref(parseInt(localStorage.getItem(KEYS.phase) || '1'))
  const concepts = ref(JSON.parse(localStorage.getItem(KEYS.concepts) || '[]'))
  const progress = ref(parseInt(localStorage.getItem(KEYS.progress) || '0'))
  const chatHistory = ref(JSON.parse(localStorage.getItem(KEYS.chatHistory) || '[]'))
  const skimDone = ref(localStorage.getItem(KEYS.skimDone) === 'true')

  // Content loaded from .md file
  const rawMarkdown = ref('')
  const topicTitle = ref('')
  const conceptChecklist = ref([]) // from frontmatter

  function setApiKey(key) {
    apiKey.value = key
    localStorage.setItem(KEYS.apiKey, key)
  }

  function setPhase(p) {
    phase.value = p
    localStorage.setItem(KEYS.phase, String(p))
  }

  function setConcepts(list) {
    concepts.value = list
    localStorage.setItem(KEYS.concepts, JSON.stringify(list))
  }

  function setProgress(pct) {
    progress.value = pct
    localStorage.setItem(KEYS.progress, String(pct))
  }

  function addChatMessage(role, content) {
    chatHistory.value.push({ role, content })
    localStorage.setItem(KEYS.chatHistory, JSON.stringify(chatHistory.value))
  }

  function clearChatHistory() {
    chatHistory.value = []
    localStorage.removeItem(KEYS.chatHistory)
  }

  function markSkimDone() {
    skimDone.value = true
    localStorage.setItem(KEYS.skimDone, 'true')
  }

  function resetAll() {
    phase.value = 1
    concepts.value = []
    progress.value = 0
    chatHistory.value = []
    skimDone.value = false
    Object.values(KEYS).forEach(k => {
      if (k !== KEYS.apiKey) localStorage.removeItem(k)
    })
  }

  const hasApiKey = computed(() => !!apiKey.value.trim())

  return {
    apiKey, phase, concepts, progress, chatHistory, skimDone,
    rawMarkdown, topicTitle, conceptChecklist,
    setApiKey, setPhase, setConcepts, setProgress,
    addChatMessage, clearChatHistory, markSkimDone, resetAll,
    hasApiKey,
  }
})

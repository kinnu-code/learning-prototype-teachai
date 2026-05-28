<template>
  <div class="min-h-screen bg-beige-100 raster-light flex items-center justify-center p-6">
    <div class="bg-white rounded-2xl shadow-lg p-10 w-full max-w-md border border-beige-200">
      <!-- Logo / wordmark -->
      <div class="mb-8 text-center">
        <h1 class="text-h34 text-beige-700">teachAI</h1>
        <p class="text-p14 text-beige-500 mt-1">Active learning, powered by you</p>
      </div>

      <!-- Welcome copy -->
      <p class="text-p16 text-gray-600 mb-6">
        To get started, enter your OpenAI API key. It's stored only in your browser — never sent anywhere except directly to OpenAI.
      </p>

      <!-- API key input -->
      <label class="block mb-2 text-p14 text-beige-700 font-semibold" for="api-key">
        OpenAI API Key
      </label>
      <input
        id="api-key"
        v-model="keyInput"
        type="password"
        placeholder="sk-..."
        class="w-full border border-beige-300 rounded-lg px-4 py-3 text-p16 text-gray-600 bg-beige-100 focus:outline-none focus:ring-2 focus:ring-learn-500 mb-2"
        @keydown.enter="handleStart"
      />
      <p v-if="error" class="text-p12 text-error mb-4">{{ error }}</p>

      <!-- Start button -->
      <button
        @click="handleStart"
        :disabled="!keyInput.trim()"
        class="mt-4 w-full bg-gray-900 text-white text-p16 font-semibold rounded-lg px-6 py-3 hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Start learning
      </button>

      <!-- Privacy note -->
      <p class="text-p12 text-beige-500 mt-4 text-center">
        Your key is saved in <code class="text-p12 bg-beige-200 px-1 rounded">localStorage</code> and never leaves your device.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore'

const router = useRouter()
const store = useAppStore()

const keyInput = ref('')
const error = ref('')

onMounted(() => {
  // If a key is already stored, skip setup
  if (store.hasApiKey) {
    router.replace('/learn')
  }
})

function handleStart() {
  error.value = ''
  const key = keyInput.value.trim()
  if (!key) return
  if (!key.startsWith('sk-')) {
    error.value = 'That doesn\'t look like a valid OpenAI key (should start with sk-).'
    return
  }
  store.setApiKey(key)
  router.push('/learn')
}
</script>

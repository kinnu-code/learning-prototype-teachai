<template>
  <div class="min-h-screen bg-beige-100 raster-light flex items-center justify-center p-6">
    <div class="bg-white rounded-2xl shadow-lg p-10 w-full max-w-lg border border-beige-200 text-center">
      <img src="/highfive.svg" alt="High five" class="w-24 h-24 mx-auto mb-6 opacity-80" />

      <h1 class="text-h28 text-beige-700 mb-3">Practice Questions</h1>
      <p class="text-p16 text-gray-600 mb-2">
        This is where you'll put your knowledge to the test.
      </p>
      <p class="text-p14 text-beige-500 mb-8">
        Coming soon — great teaching session though!
      </p>

      <button
        @click="startOver"
        class="bg-gray-900 text-white text-p16 font-semibold rounded-lg px-8 py-3 hover:bg-gray-700 transition-colors"
      >
        Start over
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAppStore } from '../stores/appStore'

const router = useRouter()
const store = useAppStore()

function startOver() {
  store.resetAll()
  router.push('/learn')
}
</script>

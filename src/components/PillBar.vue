<template>
  <div class="flex flex-wrap gap-2 py-1">
    <button
      v-for="pill in pills"
      :key="pill.id"
      @click="$emit('pill', pill.id)"
      class="text-p12 font-semibold px-3 py-1.5 rounded-full border border-learn-500 text-learn-700 bg-learn-100 hover:bg-learn-500 hover:text-white transition-colors whitespace-nowrap"
    >
      {{ pill.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  pills: {
    type: Array,
    default: () => [],
  },
})
defineEmits(['pill'])
</script>

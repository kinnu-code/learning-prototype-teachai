<template>
  <div class="w-full">
    <div class="flex justify-between items-center mb-1">
      <span class="text-p10 text-beige-500">Rubber duck knowledge</span>
      <span class="text-p10 font-semibold text-learn-700">{{ value }}%</span>
    </div>
    <div class="h-2 bg-beige-200 rounded-full overflow-hidden">
      <div
        class="h-full bg-learn-500 rounded-full transition-all duration-700 ease-out"
        :style="{ width: `${value}%` }"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  value: {
    type: Number,
    default: 0,
  },
})
</script>

<script setup>
import { ref, computed } from 'vue';

// Props & Emits for v-model
const props = defineProps({
  modelValue: { // The string of excluded characters
    type: String,
    required: true,
  },
});
const emit = defineEmits(['update:modelValue']);

// Local state for toggling visibility
const showKeyboard = ref(false);

// Character Sets
const charSets = {
  Numbers: '0123456789'.split(''),
  Lowercase: 'abcdefghijklmnopqrstuvwxyz'.split(''),
  Uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
  Symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-=\\'.split(''),
};

// Computed set for efficient checking of excluded characters
const excludedSet = computed(() => new Set(props.modelValue.split('')));

// Method to toggle character exclusion
function toggleExclude(char) {
  const currentSet = new Set(excludedSet.value);

  if (currentSet.has(char)) {
    currentSet.delete(char);
  } else {
    currentSet.add(char);
  }

  // Update the excluded chars string
  const newExcluded = Array.from(currentSet).join('');

  console.log("Excluding characters:", newExcluded);

  // Emit the updated value - this will trigger password regeneration in parent
  emit('update:modelValue', newExcluded);
}
</script>

<template>
  <div>
    <button @click="showKeyboard = !showKeyboard"
      class="w-full px-5 py-3 text-left font-medium text-indigo-800 bg-indigo-50 rounded-xl hover:bg-indigo-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 flex justify-between items-center transition-all duration-300 group border border-indigo-100"
      aria-controls="keyboard-excluder-panel" :aria-expanded="showKeyboard">
      <span class="group-hover:text-indigo-900 text-base sm:text-lg transition-colors">Exclude Specific
        Characters</span>
      <svg class="w-5 h-5 transform transition-transform duration-300 text-indigo-600 group-hover:text-indigo-800"
        :class="{ 'rotate-180': showKeyboard }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-show="showKeyboard" id="keyboard-excluder-panel"
      class="mt-3 p-5 sm:p-6 border border-slate-200 rounded-xl bg-white shadow-sm transition-all duration-300"
      role="region" aria-labelledby="keyboard-excluder-heading">
      <p id="keyboard-excluder-heading" class="text-sm text-slate-600 mb-5">Click characters below to exclude them from
        the generated password.</p>
      <div class="space-y-5">
        <div v-for="(chars, setName) in charSets" :key="setName" class="pb-4 last:pb-2">
          <h4 class="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">{{ setName }}</h4>
          <div class="flex flex-wrap gap-2">
            <button v-for="char in chars" :key="char" @click="toggleExclude(char)" :class="[
              'w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center font-mono text-sm border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-indigo-500',
              excludedSet.has(char)
                ? 'bg-red-50 text-red-800 border-red-200 line-through hover:bg-red-100 hover:border-red-300 scale-95 opacity-70 transform relative animate-pulse-once'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 hover:scale-105'
            ]" :aria-pressed="excludedSet.has(char)"
              :aria-label="`${excludedSet.has(char) ? 'Include' : 'Exclude'} character ${char}`">
              {{ char }}
              <span v-if="excludedSet.has(char)"
                class="absolute inset-0 border-2 border-red-400 rounded-lg animate-ping-once opacity-0"></span>
            </button>
          </div>
        </div>
      </div>
      <div v-if="modelValue" class="mt-5 pt-4 border-t border-slate-200">
        <span class="text-sm font-medium text-slate-700">Currently Excluded:</span>
        <span class="ml-2 font-mono text-sm text-red-700 break-all bg-red-50 px-2 py-1 rounded-lg">{{ modelValue
        }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Props: Receive the settings object from the parent
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

// Emits: Notify the parent about changes
const emit = defineEmits(['update:modelValue']);

// Computed property managing the settings object.
// Using get/set ensures the prop isn't mutated directly and emits updates.
const localSettings = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  },
});

// Helper computed properties for individual settings for cleaner v-model usage in the template.
// Setters update the localSettings computed property, which triggers the emit.
const length = computed({
  get: () => localSettings.value.length,
  set: (val) => {
    // Ensure length is a positive integer
    const newLength = parseInt(val) || 1;
    localSettings.value = { ...localSettings.value, length: newLength };
  },
});

const excludeLowercase = computed({
  get: () => localSettings.value.excludeLowercase,
  set: (val) => {
    localSettings.value = { ...localSettings.value, excludeLowercase: val };
  },
});

const excludeNumbers = computed({
  get: () => localSettings.value.excludeNumbers,
  set: (val) => {
    localSettings.value = { ...localSettings.value, excludeNumbers: val };
  },
});

const excludeUppercase = computed({
  get: () => localSettings.value.excludeUppercase,
  set: (val) => {
    localSettings.value = { ...localSettings.value, excludeUppercase: val };
  },
});

const excludeSymbols = computed({
  get: () => localSettings.value.excludeSymbols,
  set: (val) => {
    localSettings.value = { ...localSettings.value, excludeSymbols: val };
  },
});

const ruleNoLeadingSpecial = computed({
  get: () => localSettings.value.ruleNoLeadingSpecial,
  set: (val) => {
    localSettings.value = { ...localSettings.value, ruleNoLeadingSpecial: val };
  },
});

</script>

<template>
  <div class="space-y-6 md:space-y-7">
    <!-- Length Slider -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <label for="length-range" class="text-slate-700 font-medium mb-3 sm:mb-0 sm:mr-5 shrink-0 text-base">Password
        Length:</label>
      <div class="flex items-center space-x-4">
        <input type="range" id="length-range" min="6" max="64" v-model.number="length"
          @input="length = $event.target.value"
          class="w-full sm:w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          aria-labelledby="length-label">
        <input type="number" id="length-number" min="6" max="64" v-model.number="length"
          class="w-16 px-2 py-1.5 border border-slate-300 rounded-lg text-center focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none"
          @focus="$event.target.select()" aria-label="Password length number input">
      </div>
      <!-- Hidden label for aria-labelledby -->
      <span id="length-label" class="sr-only">Password Length</span>
    </div>

    <!-- Character Type Checkboxes -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
      <div class="flex items-center p-3 rounded-lg hover:bg-white/80 transition-colors">
        <input type="checkbox" id="exclude-lowercase" v-model="excludeLowercase"
          class="w-5 h-5 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2 cursor-pointer" />
        <label for="exclude-lowercase" class="ml-3 text-slate-700 cursor-pointer select-none">
          <span class="font-medium">Exclude Lowercase</span>
          <span class="text-slate-500 text-sm">(a-z)</span>
        </label>
      </div>
      <div class="flex items-center p-3 rounded-lg hover:bg-white/80 transition-colors">
        <input type="checkbox" id="exclude-numbers" v-model="excludeNumbers"
          class="w-5 h-5 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2 cursor-pointer" />
        <label for="exclude-numbers" class="ml-3 text-slate-700 cursor-pointer select-none">
          <span class="font-medium">Exclude Numbers</span>
          <span class="text-slate-500 text-sm">(0-9)</span>
        </label>
      </div>
      <div class="flex items-center p-3 rounded-lg hover:bg-white/80 transition-colors">
        <input type="checkbox" id="exclude-uppercase" v-model="excludeUppercase"
          class="w-5 h-5 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2 cursor-pointer" />
        <label for="exclude-uppercase" class="ml-3 text-slate-700 cursor-pointer select-none">
          <span class="font-medium">Exclude Uppercase</span>
          <span class="text-slate-500 text-sm">(A-Z)</span>
        </label>
      </div>
      <div class="flex items-center p-3 rounded-lg hover:bg-white/80 transition-colors">
        <input type="checkbox" id="exclude-symbols" v-model="excludeSymbols"
          class="w-5 h-5 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2 cursor-pointer" />
        <label for="exclude-symbols" class="ml-3 text-slate-700 cursor-pointer select-none">
          <span class="font-medium">Exclude Symbols</span>
          <span class="text-slate-500 text-sm">(!@#...)</span>
        </label>
      </div>
    </div>

    <!-- Rule Checkboxes -->
    <div class="pt-4 border-t border-slate-200">
      <h3 class="text-base sm:text-lg font-medium text-indigo-800 mb-4">Common Rules:</h3>
      <div class="flex items-center p-3 rounded-lg hover:bg-white/80 transition-colors">
        <input type="checkbox" id="no-leading-special" v-model="ruleNoLeadingSpecial"
          class="w-5 h-5 text-indigo-600 bg-slate-100 border-slate-300 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-2 cursor-pointer" />
        <label for="no-leading-special" class="ml-3 text-slate-700 cursor-pointer select-none font-medium">
          Disallow Leading Numbers/Symbols
        </label>
      </div>
    </div>

  </div>
</template>

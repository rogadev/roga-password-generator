<script setup>
import { defineProps, computed, ref } from "vue";
import get from "../functions/get.js";

const props = defineProps(["length", "special", "upper", "lower", "number"]);

const password = computed(() =>
  get(props.length, props.lower, props.upper, props.number, props.special)
);

const copied = ref(false);

const copy = () => {
  navigator.clipboard.writeText(password.value);
  copied.value = true;
};
</script>

<template>
  <div class="mb-2 mt-8 p-2 text-center">
    <div @click="copy" class="cursor-pointer font-bold text-xl">
      {{ copied ? "Copied!" : password }}
    </div>
    <p class="text-xs text-gray-600 italic">click to copy</p>
  </div>
</template>
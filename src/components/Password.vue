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
  <div class="p-4">
    <h3>Your password: (click to copy)</h3>
    <div @click="copy" class="cursor-pointer font-bold">
      {{ copied ? "Copied!" : password }}
    </div>
  </div>
</template>
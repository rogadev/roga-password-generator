<script setup>
import { defineProps, computed } from "vue";
import get from "../functions/get.js";

const props = defineProps(["length", "special", "upper", "lower", "number"]);

const password = computed(() =>
  get(props.length, props.lower, props.upper, props.number, props.special)
);

const copy = () => {
  navigator.clipboard.writeText(password.value);
  //confirm(`Copied to clipboard: ${password.value}`);
};
</script>

<template>
  <div class="p-4">
    <h1>Your password:</h1>
    <div @click="copy" class="cursor-pointer font-bold">{{ password }}</div>
  </div>
</template>
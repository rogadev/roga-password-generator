<script setup>
import { computed, ref } from "vue";
import Password from "./components/Password.vue";

const key = ref(1);
const length = ref(12);
const special = ref(false);
const upper = ref(true);
const lower = ref(true);
const number = ref(false);
</script>

<template>
  <div class="p-8">
    <label for="length" class="pr-4">Length</label>
    <input
      class="border rounded shadow"
      type="number"
      id="length"
      name="length"
      v-model="length"
    />
    <br />
    <label for="special" class="pr-4">Special Characters</label>
    <input
      class="border rounded shadow"
      type="checkbox"
      id="special"
      name="special"
      v-model="special"
    />
    <br />
    <label for="upper" class="pr-4">Upper Case</label>
    <input
      class="border rounded shadow"
      type="checkbox"
      id="upper"
      name="upper"
      v-model="upper"
    />
    <br />
    <label for="lower" class="pr-4">Lower Case</label>
    <input
      class="border rounded shadow"
      type="checkbox"
      id="lower"
      name="lower"
      v-model="lower"
    />
    <br />
    <label for="number" class="pr-4">Numbers</label>
    <input
      class="border rounded shadow"
      type="checkbox"
      id="number"
      name="number"
      v-model="number"
    />

    <Password
      :length="length"
      :special="special"
      :upper="upper"
      :lower="lower"
      :number="number"
    />
  </div>
</template>

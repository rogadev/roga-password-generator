<script setup>
import { ref } from "vue";
import Password from "./components/Password.vue";

const key = ref(1);
const length = ref(12);
const special = ref(true);
const upper = ref(true);
const lower = ref(true);
const number = ref(true);

function incKey() {
  key.value++;
}
</script>

<template>
  <div class="p-8">
    <label for="length" class="pr-4">Length</label>
    <input
      class="border rounded shadow px-2 py-1 mb-3"
      type="number"
      id="length"
      name="length"
      v-model="length"
    />
    <br />
    <input
      class="border rounded shadow"
      type="checkbox"
      id="special"
      name="special"
      v-model="special"
    />
    <label for="special" class="pl-4">Special Characters</label>
    <br />
    <input
      class="border rounded shadow"
      type="checkbox"
      id="upper"
      name="upper"
      v-model="upper"
    />
    <label for="upper" class="pl-4">Upper Case</label>
    <br />
    <input
      class="border rounded shadow"
      type="checkbox"
      id="lower"
      name="lower"
      v-model="lower"
    />
    <label for="lower" class="pl-4">Lower Case</label>
    <br />
    <input
      class="border rounded shadow"
      type="checkbox"
      id="number"
      name="number"
      v-model="number"
    />
    <label for="number" class="pl-4">Numbers</label>
    <br />
    <button
      class="
        bg-teal-200
        border border-teal-300
        shadow
        rounded
        mt-4
        px-2
        py-1
        hover:bg-teal-300
      "
      v-on:click="incKey"
    >
      Try Another
    </button>

    <Password
      :key="key"
      :length="length"
      :special="special"
      :upper="upper"
      :lower="lower"
      :number="number"
    />
  </div>
</template>

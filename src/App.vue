<script setup>
import { ref } from "vue";
import Password from "./components/Password.vue";

const key = ref(1);
const length = ref(12);
const special = ref(true);
const upper = ref(true);
const lower = ref(true);
const number = ref(true);

function generateNewPassword() {
  key.value++;
}
</script>

<template>
  <div
    class="
      flex flex-col
      justify-center
      items-center
      h-screen
      w-screen
      bg-gradient-to-br
      from-indigo-500
      via-purple-500
      to-pink-500
    "
  >
    <div>
      <div class="border rounded-lg p-8 max-w-fit shadow-xl bg-white">
        <h1
          class="
            text-center
            pb-5
            my-2
            text-xl text-transparent
            font-semibold
            bg-clip-text bg-gradient-to-r
            from-indigo-700
            to-pink-700
          "
        >
          Roga's Password Generator
        </h1>
        <div class="w-fit mx-auto">
          <div class="mt-4 min-w-[280px] mx-auto">
            <label for="length" class="pr-4 text-center">Length</label>
            <!-- on click select all text -->
            <input
              class="border rounded shadow px-2 py-1 mb-3"
              type="number"
              id="length"
              name="length"
              v-model="length"
              @focus="$event.target.select()"
            />
          </div>

          <div class="mt-4 pl-6">
            <div>
              <input
                class="border rounded shadow"
                type="checkbox"
                id="special"
                name="special"
                v-model="special"
              />
              <label for="special" class="pl-4">Special Characters</label>
            </div>
            <div>
              <input
                class="border rounded shadow"
                type="checkbox"
                id="upper"
                name="upper"
                v-model="upper"
              />
              <label for="upper" class="pl-4">Upper Case</label>
            </div>
            <div>
              <input
                class="border rounded shadow"
                type="checkbox"
                id="lower"
                name="lower"
                v-model="lower"
              />
              <label for="lower" class="pl-4">Lower Case</label>
            </div>
            <div>
              <input
                class="border rounded shadow"
                type="checkbox"
                id="number"
                name="number"
                v-model="number"
              />
              <label for="number" class="pl-4">Numbers</label>
            </div>
          </div>
        </div>

        <Password
          :key="key"
          :length="length"
          :special="special"
          :upper="upper"
          :lower="lower"
          :number="number"
        />

        <div class="my-2 flex flex-row justify-center">
          <button
            class="
              bg-purple-800
              border border-purple-800
              text-white
              shadow
              rounded
              my-4
              px-4
              py-2
              hover:bg-purple-900
            "
            v-on:click="generateNewPassword"
          >
            Try Another
          </button>
        </div>

        <h3 class="text-gray-600 text-center mb-2 mt-8 text-sm">Made with:</h3>
        <div class="flex flex-row h-7 w-full justify-evenly">
          <svg
            role="img"
            class="fill-[#4FC08D]"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Vue.js</title>
            <path
              d="M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z"
            />
          </svg>
          <svg
            role="img"
            class="fill-[#06B6D4]"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Tailwind CSS</title>
            <path
              d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"
            />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

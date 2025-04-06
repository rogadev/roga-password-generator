<script setup>
import { ref, reactive, onMounted } from 'vue';
import { getParamsFromURL, updateURLParams, buildQueryString } from '../utils/urlParams';
import { generatePassword } from '../utils/password';
import OptionsPanel from './OptionsPanel.vue';
import KeyboardExcluder from './KeyboardExcluder.vue';
import NetworkMonitor from './NetworkMonitor.vue';

// --- State ---
const settings = reactive({
  length: 16,
  excludeLowercase: false,
  excludeNumbers: false,
  excludeUppercase: false,
  excludeSymbols: false,
  excludedChars: '',
  ruleNoLeadingSpecial: false,
});

const generatedPassword = ref('');
const generationError = ref(''); // To display errors from generatePassword
const copyStatus = ref('idle'); // idle, copying, success, error
const shareUrlStatus = ref('idle'); // idle, copying, success, error

// --- Logic ---
function handleSettingsChanged(newSettings) {
  // Update local settings
  Object.assign(settings, newSettings);
  // Generate a new password with updated settings
  generateNewPassword();
  // Update URL params to reflect current settings
  updateURLParams(settings);
}

function handleExcludedCharsChanged(newExcludedChars) {
  // Update excluded chars
  settings.excludedChars = newExcludedChars;
  // Generate a new password with updated excluded chars
  generateNewPassword();
  // Update URL params to reflect current settings
  updateURLParams(settings);
}

/**
 * Generates a new password based on the current settings.
 * Updates the generatedPassword or generationError refs.
 */
function generateNewPassword() {
  generationError.value = ''; // Clear previous error
  try {
    // Use current reactive settings
    const password = generatePassword({ ...settings });
    if (password.startsWith('Error:')) {
      generationError.value = password;
      generatedPassword.value = '';
    } else {
      generatedPassword.value = password;
    }
  } catch (error) {
    console.error("Password generation failed:", error);
    generationError.value = "An unexpected error occurred.";
    generatedPassword.value = '';
  }
}

// Function to read initial settings from URL
function loadSettingsFromURL() {
  const urlSettings = getParamsFromURL();

  // Apply URL settings to our reactive settings object
  Object.assign(settings, urlSettings);
}

/**
 * Copies the generated password to the clipboard.
 * Updates the copyStatus ref based on the operation result.
 */
async function copyPassword() {
  if (!generatedPassword.value || !navigator.clipboard) {
    copyStatus.value = 'error';
    return;
  }
  copyStatus.value = 'copying';
  try {
    await navigator.clipboard.writeText(generatedPassword.value);
    copyStatus.value = 'success';
    // Reset status after a short delay
    setTimeout(() => {
      if (copyStatus.value === 'success') { // Avoid resetting if user clicks again quickly
        copyStatus.value = 'idle';
      }
    }, 1500);
  } catch (err) {
    console.error('Failed to copy password: ', err);
    copyStatus.value = 'error';
    setTimeout(() => { // Reset error status too
      if (copyStatus.value === 'error') {
        copyStatus.value = 'idle';
      }
    }, 2000);
  }
}

/**
 * Generates a shareable URL containing the current password settings.
 * @returns {string} The shareable URL.
 */
function getShareableUrl() {
  const url = new URL(window.location.href);
  const paramsString = buildQueryString(settings);
  url.search = paramsString;
  return url.href;
}

/**
 * Copies the shareable URL (containing current settings) to the clipboard.
 * Updates the shareUrlStatus ref based on the operation result.
 */
async function copyShareableUrl() {
  const shareableUrl = getShareableUrl();

  if (!navigator.clipboard) {
    shareUrlStatus.value = 'error';
    return;
  }

  shareUrlStatus.value = 'copying';
  try {
    await navigator.clipboard.writeText(shareableUrl);
    shareUrlStatus.value = 'success';

    // Reset status after a short delay
    setTimeout(() => {
      if (shareUrlStatus.value === 'success') {
        shareUrlStatus.value = 'idle';
      }
    }, 1500);
  } catch (err) {
    console.error('Failed to copy URL: ', err);
    shareUrlStatus.value = 'error';
    setTimeout(() => {
      if (shareUrlStatus.value === 'error') {
        shareUrlStatus.value = 'idle';
      }
    }, 2000);
  }
}

// --- Lifecycle ---
onMounted(() => {
  // First, load settings from URL if present
  loadSettingsFromURL();

  // Then generate initial password with the loaded settings
  generateNewPassword();
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-800 p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center">
    <div
      class="w-full max-w-3xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 border border-white/20">
      <h1 class="
        text-center
        pb-2
        mb-6 md:mb-8
        text-2xl sm:text-3xl md:text-4xl
        font-bold
        text-transparent
        bg-clip-text bg-gradient-to-r
        from-indigo-600
        via-purple-600
        to-fuchsia-500
      ">
        Password Generator
      </h1>

      <!-- Password Display Area -->
      <div class="mb-8 relative">
        <div v-if="generatedPassword" @click="copyPassword"
          class="p-5 pr-28 bg-gradient-to-r from-slate-100 to-white rounded-xl font-mono text-base sm:text-lg break-all text-center shadow-inner text-slate-800 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors duration-200"
          aria-live="polite">
          {{ generatedPassword }}
          <div v-if="copyStatus === 'success'"
            class="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl">
            <span class="text-green-600 font-medium text-base sm:text-lg">Copied to clipboard!</span>
          </div>
        </div>

        <!-- Error Display -->
        <div v-if="generationError"
          class="p-4 sm:p-5 bg-red-50 text-red-800 rounded-xl text-center shadow-inner text-sm sm:text-base border border-red-100"
          role="alert">
          {{ generationError }}
        </div>

        <!-- Button Controls -->
        <div v-if="generatedPassword && !generationError"
          class="absolute top-1/2 right-3 transform -translate-y-1/2 flex items-center space-x-2">
          <!-- Generate New Password Button -->
          <button @click="generateNewPassword()"
            class="p-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 group text-slate-500 hover:bg-slate-100 hover:text-indigo-600"
            aria-label="Generate new password">
            <!-- Tooltip -->
            <span
              class="absolute bottom-full right-0 mb-2 hidden group-hover:block group-focus:block bg-slate-800 text-white text-xs rounded-lg py-1.5 px-3 z-10 whitespace-nowrap">
              Generate new password
            </span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <!-- Share URL Button -->
          <button @click.stop="copyShareableUrl"
            class="p-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 group"
            :class="{
              'text-slate-500 hover:bg-slate-100 hover:text-indigo-600': shareUrlStatus === 'idle',
              'text-green-600 bg-green-50 scale-110': shareUrlStatus === 'success',
              'text-red-600 bg-red-50': shareUrlStatus === 'error',
              'text-slate-400 cursor-default': shareUrlStatus === 'copying'
            }" aria-label="Copy shareable URL">
            <!-- Tooltip -->
            <span
              class="absolute bottom-full right-0 mb-2 hidden group-hover:block group-focus:block bg-slate-800 text-white text-xs rounded-lg py-1.5 px-3 z-10 whitespace-nowrap"
              v-if="shareUrlStatus === 'idle' || shareUrlStatus === 'error'">
              {{ shareUrlStatus === 'error' ? 'Failed to copy URL' : 'Copy shareable URL' }}
            </span>
            <span v-if="shareUrlStatus === 'success'" aria-live="polite" class="text-sm font-medium">URL Copied!</span>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
        <p v-if="copyStatus === 'error'" class="text-xs text-red-600 mt-1 text-right" aria-live="assertive">
          Failed to copy!
        </p>
        <p v-if="shareUrlStatus === 'error'" class="text-xs text-red-600 mt-1 text-right" aria-live="assertive">
          Failed to copy URL!
        </p>
      </div>

      <!-- Options Panel Integration -->
      <div
        class="mb-8 p-6 sm:p-7 border border-slate-200 rounded-xl bg-gradient-to-b from-white to-slate-50/80 shadow-sm">
        <h2 class="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 text-slate-800">Options</h2>
        <OptionsPanel v-model="settings" @update:modelValue="handleSettingsChanged" />
      </div>

      <!-- Keyboard Excluder Integration -->
      <div class="mb-8">
        <KeyboardExcluder v-model="settings.excludedChars" @update:modelValue="handleExcludedCharsChanged" />
      </div>

      <!-- Network Monitor Integration -->
      <div class="mt-10 sm:mt-12">
        <NetworkMonitor />
      </div>

    </div>
  </div>
</template>

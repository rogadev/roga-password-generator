<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

// --- State ---
const showMonitor = ref(false);
const testStatus = ref('idle'); // idle, testing, success, error
const latency = ref(null);
const requestLog = ref([]); // Array to store logged requests { id, method, url, timestamp }
const originalFetch = ref(null);
// Use module-scope variables for XHR originals as they modify prototypes
let originalXHROpen = null;
let originalXHRSend = null;
let requestCounter = 0;

// --- Network Test --- //
/**
 * Runs a simple network latency test by sending a HEAD request to Google.
 * Updates the test status and latency refs.
 * Logs the test attempt, result, or error to the request log.
 */
async function runNetworkTest() {
  testStatus.value = 'testing';
  latency.value = null;
  const startTime = performance.now();

  try {
    // Log the request before making it
    requestCounter++;
    const testUrl = `https://www.google.com?t=${Date.now()}`;
    const logEntry = {
      id: requestCounter,
      type: 'TEST',
      method: 'HEAD',
      url: testUrl,
      timestamp: new Date()
    };

    requestLog.value.unshift(logEntry);

    // Use 'no-cors' to ping an external resource
    await fetch(testUrl, {
      method: 'HEAD', // Use HEAD to minimize data transfer
      mode: 'no-cors',
      cache: 'no-store', // Avoid hitting browser cache
    });

    const endTime = performance.now();
    latency.value = Math.round(endTime - startTime);
    testStatus.value = 'success';

    // Log the response
    requestCounter++;
    requestLog.value.unshift({
      id: requestCounter,
      type: 'RESPONSE',
      method: 'HEAD',
      url: `${testUrl} (${latency.value} ms)`,
      timestamp: new Date()
    });
  } catch (error) {
    // Errors in 'no-cors' are typically opaque network errors.
    console.warn('Network test failed (likely network error):', error);
    const endTime = performance.now();
    latency.value = Math.round(endTime - startTime); // Still record time taken until failure
    testStatus.value = 'error';

    // Log the error
    requestCounter++;
    requestLog.value.unshift({
      id: requestCounter,
      type: 'ERROR',
      method: 'HEAD',
      url: `Test failed after ${latency.value} ms`,
      timestamp: new Date()
    });
  }
}

// --- Request Interception --- //
/**
 * Starts intercepting global fetch and XMLHttpRequest calls.
 * Wraps the native functions to log requests.
 */
function startIntercepting() {
  // --- Fetch Interception ---
  if (window.fetch && !originalFetch.value) { // Check if already wrapped
    originalFetch.value = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] instanceof Request ? args[0].url : args[0];
      const method = args[0] instanceof Request ? args[0].method : (args[1]?.method || 'GET');
      requestCounter++;
      const logEntry = { id: requestCounter, type: 'fetch', method, url: String(url), timestamp: new Date() };
      requestLog.value.unshift(logEntry);
      // Limit log size
      if (requestLog.value.length > 50) {
        requestLog.value.pop();
      }
      // Call original fetch
      return originalFetch.value.apply(window, args);
    };
    console.log("[Network Monitor] Fetch interception started.");
  }

  // --- XMLHttpRequest Interception --- 
  if (window.XMLHttpRequest && !originalXHROpen && !originalXHRSend) { // Check if already wrapped
    originalXHROpen = window.XMLHttpRequest.prototype.open;
    originalXHRSend = window.XMLHttpRequest.prototype.send;

    window.XMLHttpRequest.prototype.open = function (method, url, ...rest) {
      // Store method and url on the instance for retrieval in send wrapper,
      // as the send function doesn't have direct access to these arguments.
      this._requestMethod = method;
      this._requestURL = url;
      return originalXHROpen.apply(this, [method, url, ...rest]);
    };

    window.XMLHttpRequest.prototype.send = function (...args) {
      if (this._requestMethod && this._requestURL) {
        requestCounter++;
        const logEntry = {
          id: requestCounter,
          type: 'XHR',
          method: this._requestMethod,
          url: String(this._requestURL), // Ensure URL is a string
          timestamp: new Date()
        };
        requestLog.value.unshift(logEntry);
        if (requestLog.value.length > 50) {
          requestLog.value.pop();
        }
      } else {
        // Fallback logging if open wasn't wrapped correctly or called unusually
        console.warn("[Network Monitor] Intercepted XHR send() called, but method/URL not captured via open wrapper.");
      }
      // Call original send
      return originalXHRSend.apply(this, args);
    };
    console.log("[Network Monitor] XHR interception started.");
  }
}

/**
 * Stops intercepting network requests and restores the original
 * global fetch and XMLHttpRequest functions.
 */
function stopIntercepting() {
  // --- Fetch Restoration ---
  if (originalFetch.value) {
    window.fetch = originalFetch.value;
    originalFetch.value = null; // Clear the stored reference
    console.log("[Network Monitor] Fetch interception stopped.");
  }
  // --- XHR Restoration ---
  if (originalXHROpen) {
    window.XMLHttpRequest.prototype.open = originalXHROpen;
    originalXHROpen = null; // Clear the stored reference
  }
  if (originalXHRSend) {
    window.XMLHttpRequest.prototype.send = originalXHRSend;
    originalXHRSend = null; // Clear the stored reference
    console.log("[Network Monitor] XHR interception stopped.");
  }
}

onMounted(() => {
  // Start intercepting when component mounts
  startIntercepting();
});

onUnmounted(() => {
  // Clean up wrappers when component is destroyed
  stopIntercepting();
});

</script>

<template>
  <div>
    <button @click="showMonitor = !showMonitor"
      class="w-full px-5 py-3 text-left font-medium text-blue-800 bg-blue-50 rounded-xl hover:bg-blue-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 flex justify-between items-center transition-all duration-300 group mb-3 border border-blue-100"
      aria-controls="network-monitor-panel" :aria-expanded="showMonitor">
      <span class="group-hover:text-blue-900 text-base sm:text-lg transition-colors">Network Activity Monitor</span>
      <svg class="w-5 h-5 transform transition-transform duration-300 text-blue-600 group-hover:text-blue-800"
        :class="{ 'rotate-180': showMonitor }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <div v-show="showMonitor" id="network-monitor-panel"
      class="p-5 sm:p-6 border border-slate-200 rounded-xl bg-white shadow-sm space-y-6 transition-all duration-300"
      role="region" aria-labelledby="network-monitor-heading">
      <p id="network-monitor-heading" class="text-sm text-slate-600">
        This tool monitors application network requests (<code
          class="bg-slate-100 px-1.5 py-0.5 rounded-md text-xs">fetch</code>/<code
          class="bg-slate-100 px-1.5 py-0.5 rounded-md text-xs">XHR</code>)
        to demonstrate that password generation occurs locally. It cannot monitor all browser activity.
      </p>

      <!-- Network Test Section -->
      <div class="pt-4 border-t border-slate-200">
        <h4 class="text-base font-medium text-blue-800 mb-3">Latency Test</h4>
        <div class="flex items-center gap-4 flex-wrap">
          <button @click="runNetworkTest" :disabled="testStatus === 'testing'"
            class="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500 shadow-sm">
            <span v-if="testStatus === 'testing'">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg"
                fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
              Testing...
            </span>
            <span v-else>Ping Google</span>
          </button>
          <div v-if="testStatus === 'success'" class="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg"
            aria-live="polite">
            Approx latency: <strong>{{ latency }} ms</strong>
          </div>
          <div v-if="testStatus === 'error'" class="text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded-lg"
            aria-live="polite">
            Test failed (after {{ latency }} ms)
          </div>
          <div v-if="testStatus === 'idle'" class="text-sm text-slate-500">
            (Run a quick test)
          </div>
        </div>
      </div>

      <!-- Request Log Section -->
      <div class="pt-4 border-t border-slate-200">
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-base font-medium text-blue-800">Application Network Log</h4>
          <button v-if="requestLog.length > 0" @click="requestLog = []"
            class="px-3 py-1 text-xs text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-red-500 shadow-sm">
            Clear Log
          </button>
        </div>
        <div v-if="requestLog.length === 0"
          class="text-sm text-slate-500 italic px-3 py-5 bg-slate-50/80 rounded-lg text-center">
          No network requests detected yet.
        </div>
        <div v-else
          class="max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-3 bg-slate-50/80 space-y-2 text-xs"
          aria-live="polite">
          <div v-for="req in requestLog" :key="req.id"
            class="border-b border-slate-100 pb-2 last:border-b-0 font-mono flex flex-wrap items-center gap-x-2">
            <span class="inline-block text-slate-400 w-6 text-right shrink-0">#{{ req.id }}</span>
            <span
              class="inline-block font-semibold px-1.5 py-0.5 rounded-md text-white text-[10px] leading-none shrink-0"
              :class="{
                'bg-gradient-to-r from-blue-500 to-blue-600': req.type === 'fetch',
                'bg-gradient-to-r from-orange-500 to-orange-600': req.type === 'XHR',
                'bg-gradient-to-r from-purple-500 to-purple-600': req.type === 'TEST',
                'bg-gradient-to-r from-green-500 to-green-600': req.type === 'RESPONSE',
                'bg-gradient-to-r from-red-500 to-red-600': req.type === 'ERROR'
              }">
              {{ req.method }}
            </span>
            <span class="break-all min-w-0 text-slate-700">{{ req.url }}</span>
            <span class="text-slate-400 ml-auto whitespace-nowrap pl-2">({{ req.timestamp.toLocaleTimeString()
            }})</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

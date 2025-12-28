Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_BACKEND_URL: 'http://localhost:3001', // mock value
        // add other VITE_ variables as needed
      },
    },
  },
});
// Removed import.meta polyfill, now using process.env in env.js 
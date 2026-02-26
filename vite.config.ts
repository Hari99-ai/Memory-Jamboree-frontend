// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'   // <-- Important!



// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react()
//   ],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, 'src'), 
//     },
//   },
//   base: './', // Important for Electron to load assets correctly
//   server: {
//     port: 5173,
//     strictPort: true,
//   },
//   build: {
//     outDir: 'dist',
//     emptyOutDir: true,
//   },
// })

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  // IMPORTANT: must be "/" for live web deployment
  base: "/",

  server: {
    port: 5173,
    strictPort: true,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});

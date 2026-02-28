
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

  base: "/",

  server: {
    port: 5173,
    strictPort: true,

    proxy: {
      // 🔥 Proxy phone monitoring API
      "/phone_monitoring": {
        target: "https://aidev.gravitinfosystems.com:5000",
        changeOrigin: true,
        secure: false,
      },

      // (Optional) proxy other backend APIs if needed
      "/api": {
        target: "https://aidev.gravitinfosystems.com:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
})

// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// import path from "path";

// export default defineConfig({
//   plugins: [react()],

//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "src"),
//     },
//   },

//   // IMPORTANT: must be "/" for live web deployment
//   base: "/",

//   server: {
//     port: 5173,
//     strictPort: true,
//   },

//   build: {
//     outDir: "dist",
//     emptyOutDir: true,
//   },
// });

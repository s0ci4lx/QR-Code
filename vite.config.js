// vite.config.js

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import daisyui from "daisyui";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss({
      plugins: [daisyui],
    }),
  ], // <-- ปิด Array ของ plugins ที่นี่

  // vvvv  ย้ายมาวางตรงนี้ครับ vvvv
  // ให้ daisyui อยู่ระดับเดียวกับ plugins
  daisyui: {
    themes: ["cupcake", "forest"],
  },
});
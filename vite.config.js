// vite.config.js

import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";
import daisyui from 'daisyui'; // <-- 1. Import daisyui เข้ามา

export default defineConfig({
  plugins: [
    vue(), // แนะนำให้วาง vue() ไว้ก่อน
    tailwindcss({
      plugins: [daisyui], // <-- 2. ใส่ daisyui เข้าไปเป็น plugin ของ tailwind
    }),
  ],

});
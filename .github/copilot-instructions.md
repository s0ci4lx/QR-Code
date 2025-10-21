ไฟล์นี้ให้คำแนะนำสั้น ๆ เพื่อช่วยตัวแทนโค้ดอัตโนมัติเริ่มทำงานในโปรเจกต์นี้ได้เร็วและถูกต้อง

สรุปสั้น ๆ
- สถาปัตยกรรม: Single‑Page client-side app (ไม่มี router, ไม่มี backend). ทั้ง UI และ logic อยู่ใน `src/App.vue` (Vue 3 SFC, `<script setup>`).
- จุดเข้าโปรแกรม: `src/main.js` ทำการ mount แอปลงใน element with id "app" (ดู `index.html`).
- Styling: Tailwind CSS + DaisyUI (config: `vite.config.js`, styles: `src/style.css`).
- QR generation: ใช้แพ็กเกจ `qrcode` ใน `src/App.vue` (เรียก `QRCode.toDataURL(text, options)`) — ทำงานทั้งหมดฝั่งไคลเอนต์

คำสั่งที่ใช้บ่อย
- เริ่ม dev server: `npm run dev` (Vite, พอร์ต 5173)
- สร้าง build: `npm run build` → ผลลัพธ์ที่ `dist`
- ดู build แบบ local: `npm run preview`

ข้อควรปฏิบัติของโปรเจกต์ (เฉพาะนี้)
- เก็บ logic ขนาดเล็กทั้งหมดใน `src/App.vue` และใช้ Composition API refs (`text`, `qrCodeDataUrl`, `isLoading`, `errorMessage`, `theme`).
- การสลับธีม: เปลี่ยน `theme` ref และผูก `:data-theme="theme"` บนคอนเทนเนอร์หลัก (ธีมที่ใช้: `cupcake`, `forest`).
- ค่าเริ่มต้นของการสร้าง QR อยู่ใน `generateQR()` (errorCorrectionLevel: "H", type: "image/png", quality: 0.95, margin: 1, width: 300). หากเปลี่ยน ให้อัปเดตทั้งโค้ดและข้อความ UI ที่อธิบายการเปลี่ยนด้วย
- การดาวน์โหลด: `downloadQR()` สร้างชื่อไฟล์ในรูปแบบ `qrcode-YYYYMMDD-HHMM.png` — ถ้าจะเปลี่ยนรูปแบบชื่อไฟล์ ให้แก้ทั้งโค้ดและ UI
- ข้อผิดพลาด: `generateQR` จะ `console.error(err)` และตั้งค่า `errorMessage` เพื่อแสดงให้ผู้ใช้ — รักษาพฤติกรรมทั้งสองไว้

ไฟล์ที่มักจะแก้
- `src/App.vue` — ฟังก์ชัน `generateQR`, `downloadQR` และ UI
- `src/style.css` — ปรับสไตล์เพิ่มเติม
- `vite.config.js`, `package.json` — ปรับ build/plugin
- `netlify.toml` — ปรับการ deploy

ข้อจำกัดที่ค้นพบได้
- ไม่มีชุดทดสอบหรือ CI ในรีโป: อย่าเพิ่มโครงสร้างทดสอบขนาดใหญ่โดยไม่ได้ตกลงก่อน
- ไม่มี backend หรือ secrets ในรีโป: ฟีเจอร์ที่ต้องการคีย์ต้องมี backend แยกต่างหากและไม่ commit คีย์ลง repo

วิธีล้างไฟล์ Node ที่เผลอถูก push ขึ้นไป (คำแนะนำ)
1) เพิ่ม `.gitignore` เพื่อไม่ให้ `node_modules/` และไฟล์ build ถูกติดตาม
2) บนเครื่อง dev ให้รัน (ฉันจะไม่รันคำสั่งให้โดยไม่มีอนุญาต):

```bash
git rm -r --cached node_modules
git commit -m "chore: remove tracked node_modules and ignore"
git push
```

หากต้องการ ฉันช่วยตรวจว่าไฟล์ใดถูก track โดยไม่ตั้งใจ (เช่น `node_modules/`) ก่อนที่คุณจะรันคำสั่งดังกล่าวได้ — บอกฉันว่าต้องการให้ตรวจอะไรเพิ่มเติม

ถ้าต้องการ ขยายไฟล์นี้เป็นภาษาอังกฤษหรือเพิ่มเช็คลิสต์ PR แจ้งมาได้เลย
# Copilot instructions (ภาษาไทย)

ไฟล์นี้ให้คำแนะนำสั้นๆ สำหรับตัวแทนโค้ดอัตโนมัติเพื่อให้ทำงานในโปรเจกต์นี้ได้อย่างรวดเร็วและถูกต้อง

สรุปภาพรวมสถาปัตยกรรม (สำคัญ)
- โปรเจกต์เป็น Single-Page client-side app (ไม่มี router, ไม่มี backend). ทั้ง UI และ logic อยู่ใน `src/App.vue` (Vue 3 SFC, `<script setup>`).
- จุดเข้าโปรแกรม: `src/main.js` ซึ่ง mount แอปลงใน element id #app (ดู `index.html`).
- Styling: Tailwind CSS + DaisyUI (config ใน `vite.config.js`, styles ใน `src/style.css`).
- การสร้าง QR: ใช้แพ็กเกจ `qrcode` ใน `src/App.vue` โดยเรียก `QRCode.toDataURL(text, options)` — ทุกอย่างเกิดในฝั่งไคลเอนต์

คำสั่งสำคัญ (workflow)
- เริ่ม dev server: `npm run dev` (Vite, พอร์ต 5173 โดยค่าเริ่มต้น)
- build production: `npm run build` -> ผลลัพธ์ออกที่ `dist`
- ดู build แบบ local: `npm run preview`
- การ deploy (Netlify): `netlify.toml` ตั้งให้รัน `npm run build` และ publish โฟลเดอร์ `dist`

ข้อกำหนดและรูปแบบเฉพาะโปรเจกต์
- โค้ดหลักทั้งหมดอยู่ใน `src/App.vue`: หากต้องการเพิ่มฟีเจอร์เล็กๆ ให้ทำในไฟล์นี้และใช้ Composition API refs (ดู `text`, `qrCodeDataUrl`, `isLoading`, `errorMessage`, `theme`).
- การสลับธีม: เปลี่ยนค่าตัวแปร `theme` และผูก `:data-theme="theme"` ที่ container ด้านบน (ธีม: `cupcake`, `forest` ใน `vite.config.js`).
- ตัวเลือก QR เริ่มต้น: errorCorrectionLevel: "H", type: "image/png", quality: 0.95, margin: 1, width: 300 (ดู `generateQR()`)
- ชื่อไฟล์ดาวน์โหลด: `downloadQR()` สร้างไฟล์ชื่อรูปแบบ `qrcode-YYYYMMDD-HHMM.png` — ถ้าจะเปลี่ยนชื่อ ให้แก้ทั้งโค้ดและ UI ที่อธิบาย
- การจัดการความผิดพลาด: ฟังก์ชัน `generateQR` จะจับข้อผิดพลาด, `console.error(err)` สำหรับ debugging และตั้ง `errorMessage` เพื่อแจ้งผู้ใช้ — รักษาพฤติกรรมนี้ไว้

ไฟล์ที่ควรแก้เมื่อทำงานทั่วไป
- เปลี่ยนพฤติกรรมการสร้างหรือรูปแบบไฟล์: `src/App.vue` (`generateQR`, `downloadQR`)
- ปรับ UI/สไตล์: `src/App.vue`, `src/style.css`
- ปรับการ build/plugin: `vite.config.js`, `package.json`
- ปรับการ deploy: `netlify.toml`

จำกัดที่ค้นพบได้เท่านั้น (อย่าสมมติ)
- ไม่มี tests หรือ CI ในรีโปนี้: อย่าเพิ่มโครงสร้างทดสอบขนาดใหญ่โดยไม่ได้คุยกับเจ้าของโปรเจกต์ก่อน
- ไม่มี backend หรือ secrets: หากต้องการฟีเจอร์ที่ต้องใช้คีย์ ให้เพิ่ม backend และจัดการ secrets นอก repo (ห้าม commit)

หมายเหตุการทำความสะอาดไฟล์ Node ที่เผลอถูก push ขึ้นไป
1) เพิ่ม `.gitignore` (ตัวอย่างใน repo ถูกแก้ไขแล้ว) เพื่อไม่ให้ `node_modules/` และไฟล์ build ถูกติดตาม
2) ในเครื่อง dev ให้รัน (ด้วยสิทธิ์ของคุณ) หากต้องลบโฟลเดอร์ที่ถูก track ออก:

```bash
git rm -r --cached node_modules
git commit -m "chore: remove tracked node_modules and ignore"
git push
```

หากต้องการ ฉันสามารถช่วยสร้าง commit message, หรือตรวจสอบไฟล์ที่ถูก track โดยไม่ตั้งใจก่อนที่คุณจะรันคำสั่งด้านบน — บอกฉันว่าต้องการตรวจอะไรเพิ่มเติม
# Copilot instructions for this repository

This is a small single-page Vue 3 + Vite application that generates PNG QR codes entirely in the browser. Keep suggestions and edits tightly scoped, concrete, and consistent with the repository's existing patterns.

Key facts (what to know immediately)
- Architecture: single-page client-side app (no router, no backend). The entire UI and logic live in `src/App.vue` (Vue 3 Single File Component using `<script setup>`).
- Entry point: `src/main.js` mounts `App` to the `#app` element in `index.html`.
- Styling: Tailwind CSS + DaisyUI. Tailwind configuration is wired inside `vite.config.js`; styles are in `src/style.css`.
- QR generation: uses the `qrcode` npm package. Calls are in `src/App.vue` using `QRCode.toDataURL(text, options)`.

Developer workflows (explicit commands)
- Run dev server: `npm run dev` (Vite, default port 5173).
- Build production bundle: `npm run build` (outputs to `dist`).
- Preview production build locally: `npm run preview`.
- Netlify deployment: `netlify.toml` is configured to run `npm run build` and publish `dist`.

Project-specific conventions
- Single-file SFC focus: Add small features directly in `src/App.vue`. Prefer Composition API refs (see `text`, `qrCodeDataUrl`, `isLoading`) rather than adding global state.
- Theme toggle: The app toggles DaisyUI themes by changing the `theme` ref and binding `:data-theme="theme"` on the root container. Themes available: `cupcake`, `forest` (see `vite.config.js`).
- QR options and download: Default QR options (errorCorrectionLevel: "H", type: "image/png", quality: 0.95, margin: 1, width: 300). The download filename format is `qrcode-YYYYMMDD-HHMM.png` (see `downloadQR()` in `src/App.vue`). Preserve these defaults or update UI docs when changing them.
- UI controls live in template: Buttons, inputs and conditional states (`v-if=# Copilot instructions for this repository

This is a small single-page Vue 3 + Vite application that generates PNG QR codes in the browser.
Keep suggestions and edits tightly scoped, concrete, and consistent with the existing patterns.

Key facts (what to know immediately)
- Architecture: Single-page app (no router) using Vue 3 SFCs with <script setup>. Main UI is a single component at `src/App.vue`.
- Entry point: `src/main.js` mounts the `App` component to `#app` in `index.html`.
- Build system: Vite. Scripts in `package.json`: `dev` (vite), `build` (vite build), `preview` (vite preview).
- Styling: Tailwind + DaisyUI. Tailwind/DaisyUI plugin config sits in `vite.config.js` and styles in `src/style.css`.
- QR generation: uses the `qrcode` npm package. Generation occurs in `src/App.vue` via `QRCode.toDataURL(text, options)`.

Developer workflows (explicit commands)
- Start local dev server: `npm run dev` (open http://localhost:5173 by default).
- Build for production: `npm run build` (output dir: `dist`).
- Preview production build locally: `npm run preview`.
- Netlify deployment: `netlify.toml` declares `npm run build` and `publish = "dist"`.

Project-specific patterns and conventions
- Single-file component pattern: Keep logic in `src/App.vue` using Composition API refs (e.g. `text`, `qrCodeDataUrl`, `isLoading`). Follow current structure when adding new reactive values or functions.
- UI theme switch: `data-theme` is set on the root element in the template. Themes are those listed in `vite.config.js` (`cupcake`, `forest`). Toggle pattern via checkbox updating the `theme` ref.
- QR options: The project uses high error correction and fixed size options in `src/App.vue` (errorCorrectionLevel: "H", width: 300, margin: 1). If you change defaults, update both generation and any UI that documents QR size.
- Download filename: the app constructs `qrcode-YYYYMMDD-HHMM.png` in `downloadQR()` — preserve this naming format when adding export features.
- No routing, no backend: this is a pure client-side generator. Avoid introducing server-side dependencies unless adding an explicit new integration and updating `netlify.toml`.

Where to edit for common tasks
- Change QR generation behavior or file type: `src/App.vue` (generateQR and downloadQR functions).
- Add UI elements or style tweaks: `src/App.vue` and `src/style.css` (tailwind + daisyui classes).
- Add build/dev config: `vite.config.js` and `package.json` scripts.
- Deployment settings: `netlify.toml`.

Error handling and logging conventions
- The app logs QR generation errors to the browser console (see catch block in `generateQR` in `src/App.vue`). Keep console.error for unexpected errors; surface user-friendly messages via `errorMessage` ref.

Quick examples (copyable snippets are in the repo)
- QR call used in repo: `qrCodeDataUrl.value = await QRCode.toDataURL(text.value, { errorCorrectionLevel: "H", type: "image/png", quality: 0.95, margin: 1, width: 300 })` (see `src/App.vue`).
- Theme is applied via `:data-theme="theme"` on the top-level container in `src/App.vue`.

When creating PRs
- Keep changes small and focused. For UI/UX tweaks, attach before/after screenshots.
- If you add a new dependency, ensure it's minimal and update `package.json`. For anything requiring build changes, include a short note about `npm run build` and Netlify considerations.

Limitations and discoverable gaps (do not assume)
- There are no tests and no CI configured. Do not add test scaffolding without opening an issue first.
- No backend or API keys are present. Any integration requiring secrets must be coordinated and not committed to the repo.

If something is unclear or you need extra conventions added, ask the repository owner for guidance and include links to the exact file(s) you plan to modify.

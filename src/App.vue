<script setup>
import { ref } from "vue";
import QRCode from "qrcode";

// --- State Management ---
const text = ref("");
const qrCodeDataUrl = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const theme = ref("cupcake"); // State สำหรับสลับ Theme (ค่าเริ่มต้นคือ 'cupcake')

// --- Functions ---

// Function to generate QR Code
const generateQR = async () => {
  if (!text.value.trim()) {
    errorMessage.value = "Please enter text or a URL.";
    qrCodeDataUrl.value = "";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const options = {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 300,
    };
    qrCodeDataUrl.value = await QRCode.toDataURL(text.value, options);
  } catch (err) {
    console.error(err);
    errorMessage.value = "Could not generate QR code.";
    qrCodeDataUrl.value = "";
  } finally {
    isLoading.value = false;
  }
};

// Function to download the QR Code (ปรับปรุงให้มีวันที่และเวลา)
const downloadQR = () => {
  if (!qrCodeDataUrl.value) return;

  // 1. สร้าง object Date เพื่อดึงเวลาปัจจุบัน
  const now = new Date();

  // 2. ดึงค่า ปี, เดือน, วัน, ชั่วโมง, นาที และทำให้เป็นเลข 2 หลักเสมอ (เช่น 09, 05)
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // getMonth() เริ่มจาก 0 เลยต้อง +1
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // 3. ประกอบร่างชื่อไฟล์ตาม format ที่ต้องการ
  // เพิ่มวินาทีในชื่อไฟล์เป็น qrcode-YYYYMMDD-HHMMSS.png
  const filename = `tp-qr-${year}${month}${day}-${hours}${minutes}${seconds}.png`;

  // 4. สร้าง Link สำหรับดาวน์โหลดโดยใช้ชื่อไฟล์ใหม่
  const link = document.createElement("a");
  link.href = qrCodeDataUrl.value;
  link.download = filename; // <-- ใช้ชื่อไฟล์แบบไดนามิก
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Function to clear all values
const createNew = () => {
  text.value = "";
  qrCodeDataUrl.value = "";
  errorMessage.value = "";
};
</script>

<template>
  <div
    :data-theme="theme"
    class="min-h-screen bg-base-200 flex items-center justify-center p-4"
  >
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <label class="swap swap-rotate absolute top-4 right-4">
          <input
            type="checkbox"
            @change="theme = theme === 'cupcake' ? 'forest' : 'cupcake'"
          />
          <svg
            class="swap-on fill-current w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29l.71-.71A1,1,0,0,0,7.05,5.64l-.71.71A1,1,0,0,0,5.64,7.05ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM20,12a1,1,0,0,0-1-1H18a1,1,0,0,0,0,2h1A1,1,0,0,0,20,12ZM17,5.64a1,1,0,0,0-.71-.29,1,1,0,0,0-.7.29l-.71.71a1,1,0,1,0,1.41,1.41l.71-.71A1,1,0,0,0,17,5.64ZM12,15a3,3,0,1,0,0-6A3,3,0,0,0,12,15Zm0,2a5,5,0,1,0,0-10A5,5,0,0,0,12,17Z"
            />
          </svg>
          <svg
            class="swap-off fill-current w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
          >
            <path
              d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22a10.14,10.14,0,0,0,9.57,9.57A8.14,8.14,0,0,1,12.14,19.69Z"
            />
          </svg>
        </label>

        <h1 class="card-title text-3xl mb-4 mt-8">QR Code Generator</h1>

        <form @submit.prevent="generateQR" class="w-full">
          <div class="form-control">
            <div class="input-group">
              <div class="relative w-full">
                <input
                  v-model="text"
                  type="text"
                  placeholder="Enter text or URL..."
                  class="input input-bordered w-full pr-10"
                />

                <button
                  v-if="text"
                  @click.prevent="text = ''"
                  type="button"
                  class="btn btn-ghost btn-sm btn-circle absolute top-1/2 right-2 -translate-y-1/2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-6 h-6"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18 18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <button
                type="submit"
                class="btn btn-primary mt-2"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="loading loading-spinner"></span>
                <span v-else>Generate</span>
              </button>
            </div>
          </div>
        </form>

        <p v-if="errorMessage" class="text-error mt-2">{{ errorMessage }}</p>

        <div
          v-if="qrCodeDataUrl"
          class="mt-2 flex flex-col items-center gap-4 w-full"
        >
          <img
            :src="qrCodeDataUrl"
            alt="Generated QR Code"
            class="border-4 border-base-300 rounded-lg"
          />
          <div class="flex gap-2 w-full mt-2">
            <button @click="downloadQR" class="btn btn-success flex-1">
              Download PNG
            </button>
            <button @click="createNew" class="btn btn-ghost flex-1">
              Create New
            </button>
          </div>
        </div>

        <div v-else class="hero my-4">
          <div class="hero-content text-center text-base-content/60">
            <div class="max-w-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-16 h-16 mx-auto mb-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3.75 4.875c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 3.75 19.125v-4.5ZM13.5 4.875c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 13.5 9.375v-4.5ZM13.5 14.625c0-1.036.84-1.875 1.875-1.875h4.5c1.036 0 1.875.84 1.875 1.875v4.5c0 1.036-.84 1.875-1.875 1.875h-4.5A1.875 1.875 0 0 1 13.5 19.125v-4.5Z"
                />
              </svg>
              <p>
                Enter text or a URL above to generate your QR code instantly.
              </p>
            </div>
          </div>
        </div>

        <p class="mt-8 text-sm text-base-content/60">
          Crafted by
          <span class="font-bold text-base-content">Witchapol L.</span>
        </p>
      </div>
    </div>
  </div>
</template>

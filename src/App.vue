<script setup>
import { ref } from "vue";
import QRCode from "qrcode";

// State management
const text = ref("");
const qrCodeDataUrl = ref("");
const errorMessage = ref("");

// Function to generate QR Code
const generateQR = async () => {
  if (!text.value.trim()) {
    errorMessage.value = "Please enter text or a URL.";
    qrCodeDataUrl.value = "";
    return;
  }

  try {
    const options = {
      errorCorrectionLevel: "H",
      type: "image/png",
      quality: 0.95,
      margin: 1,
      width: 300,
    };
    qrCodeDataUrl.value = await QRCode.toDataURL(text.value, options);
    errorMessage.value = "";
  } catch (err) {
    console.error(err);
    errorMessage.value = "Could not generate QR code.";
    qrCodeDataUrl.value = "";
  }
};

// Function to download the QR Code
const downloadQR = () => {
  if (!qrCodeDataUrl.value) return;
  const link = document.createElement("a");
  link.href = qrCodeDataUrl.value;
  link.download = "qrcode.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ฟังก์ชันสำหรับเคลียร์ค่าทั้งหมด (เวอร์ชันที่ถูกต้องสำหรับโค้ดปัจจุบัน)
const createNew = () => {
  text.value = "";
  qrCodeDataUrl.value = "";
  errorMessage.value = "";
};
</script>

<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <h1 class="card-title text-3xl mb-4">QR Code Generator</h1>

        <form @submit.prevent="generateQR" class="w-full">
          <div class="form-control">
            <div class="input-group">
              <input
                v-model="text"
                type="text"
                placeholder="Enter text or URL..."
                class="input input-bordered w-full"
              />
              <button type="submit" class="btn btn-primary mt-2">
                Generate
              </button>
            </div>
          </div>
        </form>

        <p v-if="errorMessage" class="text-error mt-2">{{ errorMessage }}</p>

        <div
          v-if="qrCodeDataUrl"
          class="mt-6 flex flex-col items-center gap-4 w-full"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import QRCode from "qrcode";
import jsQR from "jsqr";

// --- State Management ---
const text = ref("");
const qrCodeDataUrl = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const theme = ref("cupcake");
const showScanner = ref(false);
const showHistory = ref(false);
const showCustomize = ref(false);
const isCustomizing = ref(false); // Flag to prevent adding to history during customization

// --- QR History ---
const qrHistory = ref([]);
const MAX_HISTORY = 10;

// --- QR Customization ---
const qrOptions = ref({
  errorCorrectionLevel: "H",
  width: 300,
  margin: 1,
  color: {
    dark: "#000000",
    light: "#FFFFFF"
  }
});


// --- Toast Notification ---
const toast = ref({
  show: false,
  message: "",
  type: "success" // success, error, info
});

// --- Language State & Translations ---
const lang = ref("th");

const translations = ref({
  en: {
    title: "QR Code Generator",
    placeholder: "Enter text or URL...",
    generateBtn: "Generate",
    downloadBtn: "Download",
    copyBtn: "Copy",
    shareBtn: "Share",
    newBtn: "New",
    scanBtn: "Scan",
    historyBtn: "History",
    customizeBtn: "Customize",
    applyBtn: "Apply",
    errorEmpty: "Please enter text or a URL.",
    errorGenerate: "Could not generate QR code.",
    errorCopy: "Could not copy to clipboard.",
    errorShare: "Could not share QR code.",
    altQR: "Generated QR Code",
    heroText: "Enter text or a URL above to generate your QR code instantly.",
    craftedBy: "Crafted by",
    successCopy: "Copied to clipboard!",
    successDownload: "Downloaded successfully!",
    successShare: "Shared successfully!",
    successApply: "Settings applied!",
    scanTitle: "Scan QR Code",
    scanFromCamera: "Scan from Camera",
    scanFromFile: "Upload Image",
    scanClose: "Close",
    scanResult: "Scanned Result:",
    historyTitle: "QR Code History",
    historyEmpty: "No history yet",
    historyClear: "Clear All",
    customizeTitle: "Customize QR Code",
    customizeDark: "Dark Color",
    customizeLight: "Light Color",
    customizeSize: "Size",
    customizeMargin: "Margin",
    customizeErrorLevel: "Error Correction",
    autoGenerate: "Auto-generate",
    previewMode: "(Preview Mode)"
  },
  th: {
    title: "เครื่องมือสร้าง QR Code",
    placeholder: "ป้อนข้อความหรือ URL...",
    generateBtn: "สร้าง",
    downloadBtn: "ดาวน์โหลด",
    copyBtn: "คัดลอก",
    shareBtn: "แชร์",
    newBtn: "สร้างใหม่",
    scanBtn: "สแกน",
    historyBtn: "ประวัติ",
    customizeBtn: "ปรับแต่ง",
    applyBtn: "ยืนยัน",
    errorEmpty: "กรุณาป้อนข้อความหรือ URL",
    errorGenerate: "ไม่สามารถสร้าง QR Code ได้",
    errorCopy: "ไม่สามารถคัดลอกได้",
    errorShare: "ไม่สามารถแชร์ได้",
    altQR: "รูป QR Code ที่สร้างขึ้น",
    heroText: "ป้อนข้อความหรือ URL ด้านบนเพื่อสร้าง QR Code ของคุณทันที",
    craftedBy: "สร้างสรรค์โดย",
    successCopy: "คัดลอกสำเร็จ!",
    successDownload: "ดาวน์โหลดสำเร็จ!",
    successShare: "แชร์สำเร็จ!",
    successApply: "ปรับการตั้งค่าสำเร็จ!",
    scanTitle: "สแกน QR Code",
    scanFromCamera: "สแกนจากกล้อง",
    scanFromFile: "อัปโหลดรูปภาพ",
    scanClose: "ปิด",
    scanResult: "ผลการสแกน:",
    historyTitle: "ประวัติ QR Code",
    historyEmpty: "ยังไม่มีประวัติ",
    historyClear: "ลบทั้งหมด",
    customizeTitle: "ปรับแต่ง QR Code",
    customizeDark: "สีเข้ม",
    customizeLight: "สีอ่อน",
    customizeSize: "ขนาด",
    customizeMargin: "ระยะขอบ",
    customizeErrorLevel: "ระดับการแก้ไขข้อผิดพลาด",
    autoGenerate: "สร้างอัตโนมัติ",
    previewMode: "(โหมดดูตัวอย่าง)"
  }
});

// --- Auto-generate toggle ---
const autoGenerate = ref(true);
let debounceTimer = null;

// --- Functions ---

// Load preferences from localStorage
onMounted(() => {
  const savedTheme = localStorage.getItem("qr-theme");
  const savedLang = localStorage.getItem("qr-lang");
  const savedHistory = localStorage.getItem("qr-history");
  const savedAutoGen = localStorage.getItem("qr-auto-generate");
  const savedOptions = localStorage.getItem("qr-options");

  if (savedTheme) theme.value = savedTheme;
  if (savedLang) lang.value = savedLang;
  if (savedHistory) qrHistory.value = JSON.parse(savedHistory);
  if (savedAutoGen) autoGenerate.value = savedAutoGen === "true";
  if (savedOptions) qrOptions.value = JSON.parse(savedOptions);
});

// Watch for preference changes
watch(theme, (newTheme) => {
  localStorage.setItem("qr-theme", newTheme);
});

watch(lang, (newLang) => {
  localStorage.setItem("qr-lang", newLang);
});

watch(autoGenerate, (newVal) => {
  localStorage.setItem("qr-auto-generate", newVal.toString());
});

// Reset customizing mode when closing customize panel
watch(showCustomize, (newVal) => {
  if (!newVal && isCustomizing.value && qrCodeDataUrl.value) {
    // ถ้าปิด panel ขณะที่กำลังปรับแต่ง ให้ถามว่าจะบันทึกหรือไม่
    // แต่สำหรับเวอร์ชันนี้ เราจะบันทึกอัตโนมัติ
    isCustomizing.value = false;
    addToHistory(text.value, qrCodeDataUrl.value);
  }
});

watch(qrOptions, (newOptions) => {
  localStorage.setItem("qr-options", JSON.stringify(newOptions));
  if (text.value && qrCodeDataUrl.value) {
    isCustomizing.value = true; // Set flag before generating
    generateQR();
  }
}, { deep: true });

// Auto-generate with debounce
watch(text, (newText) => {
  if (autoGenerate.value && newText.trim()) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      isCustomizing.value = false; // Reset flag for new text input
      generateQR();
    }, 500);
  }
});

// Show toast notification
const showToast = (message, type = "success") => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3000);
};

// Function to generate QR Code
const generateQR = async () => {
  if (!text.value.trim()) {
    errorMessage.value = translations.value[lang.value].errorEmpty;
    qrCodeDataUrl.value = "";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const options = {
      errorCorrectionLevel: qrOptions.value.errorCorrectionLevel,
      type: "image/png",
      quality: 0.95,
      margin: qrOptions.value.margin,
      width: qrOptions.value.width,
      color: qrOptions.value.color
    };
    qrCodeDataUrl.value = await QRCode.toDataURL(text.value, options);
    
    // Add to history only if not customizing
    if (!isCustomizing.value) {
      addToHistory(text.value, qrCodeDataUrl.value);
    }
  } catch (err) {
    console.error(err);
    errorMessage.value = translations.value[lang.value].errorGenerate;
    qrCodeDataUrl.value = "";
  } finally {
    isLoading.value = false;
  }
};

// Add to history
const addToHistory = (textValue, dataUrl) => {
  const newItem = {
    id: Date.now(),
    text: textValue,
    dataUrl: dataUrl,
    timestamp: new Date().toISOString()
  };
  
  qrHistory.value = [newItem, ...qrHistory.value.slice(0, MAX_HISTORY - 1)];
  localStorage.setItem("qr-history", JSON.stringify(qrHistory.value));
};

// Apply customization and save to history
const applyCustomization = () => {
  if (qrCodeDataUrl.value) {
    isCustomizing.value = false; // ปิดโหมดปรับแต่ง
    addToHistory(text.value, qrCodeDataUrl.value); // เพิ่มเข้าประวัติ
    showToast(translations.value[lang.value].successApply, "success");
  }
};

// Load from history
const loadFromHistory = (item) => {
  text.value = item.text;
  qrCodeDataUrl.value = item.dataUrl;
  showHistory.value = false;
};

// Clear history
const clearHistory = () => {
  qrHistory.value = [];
  localStorage.removeItem("qr-history");
};

// Function to copy QR Code to clipboard
const copyQR = async () => {
  if (!qrCodeDataUrl.value) return;

  try {
    const blob = await (await fetch(qrCodeDataUrl.value)).blob();
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);
    
    // ถ้ากำลังปรับแต่งอยู่ ให้บันทึกเข้าประวัติเมื่อคัดลอก
    if (isCustomizing.value) {
      isCustomizing.value = false;
      addToHistory(text.value, qrCodeDataUrl.value);
    }
    
    showToast(translations.value[lang.value].successCopy, "success");
  } catch (err) {
    console.error(err);
    showToast(translations.value[lang.value].errorCopy, "error");
  }
};

// Function to share QR Code
const shareQR = async () => {
  if (!qrCodeDataUrl.value) return;

  try {
    const blob = await (await fetch(qrCodeDataUrl.value)).blob();
    const file = new File([blob], "qr-code.png", { type: "image/png" });
    
    if (navigator.share && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: "QR Code",
        text: text.value,
        files: [file]
      });
      showToast(translations.value[lang.value].successShare, "success");
    } else {
      showToast(translations.value[lang.value].errorShare, "error");
    }
  } catch (err) {
    if (err.name !== "AbortError") {
      console.error(err);
      showToast(translations.value[lang.value].errorShare, "error");
    }
  }
};

// Function to download the QR Code
const downloadQR = () => {
  if (!qrCodeDataUrl.value) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  
  const filename = `tp-qr-${year}${month}${day}-${hours}${minutes}${seconds}.png`;

  const link = document.createElement("a");
  link.href = qrCodeDataUrl.value;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // ถ้ากำลังปรับแต่งอยู่ ให้บันทึกเข้าประวัติเมื่อดาวน์โหลด
  if (isCustomizing.value) {
    isCustomizing.value = false;
    addToHistory(text.value, qrCodeDataUrl.value);
  }
  
  showToast(translations.value[lang.value].successDownload, "success");
};

// Function to clear all values
const createNew = () => {
  text.value = "";
  qrCodeDataUrl.value = "";
  errorMessage.value = "";
  isCustomizing.value = false; // รีเซ็ตโหมดปรับแต่ง
};

// --- QR Scanner Functions ---
const videoRef = ref(null);
const canvasRef = ref(null);
const fileInputRef = ref(null);
const scannedResult = ref("");
const isScanning = ref(false);
let stream = null;

const startCamera = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "environment" } 
    });
    if (videoRef.value) {
      videoRef.value.srcObject = stream;
      videoRef.value.play();
      isScanning.value = true;
      scanFromCamera();
    }
  } catch (err) {
    console.error(err);
    showToast("Cannot access camera", "error");
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
  isScanning.value = false;
};

const scanFromCamera = () => {
  if (!isScanning.value || !videoRef.value || !canvasRef.value) return;

  const video = videoRef.value;
  const canvas = canvasRef.value;
  const ctx = canvas.getContext("2d");

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.height = video.videoHeight;
    canvas.width = video.videoWidth;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      scannedResult.value = code.data;
      text.value = code.data;
      stopCamera();
      showScanner.value = false;
      if (!autoGenerate.value) {
        generateQR();
      }
      return;
    }
  }

  requestAnimationFrame(scanFromCamera);
};

const scanFromFile = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.value;
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        scannedResult.value = code.data;
        text.value = code.data;
        showScanner.value = false;
        if (!autoGenerate.value) {
          generateQR();
        }
        showToast("QR Code scanned successfully!", "success");
      } else {
        showToast("No QR Code found in image", "error");
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

const openScanner = () => {
  showScanner.value = true;
  scannedResult.value = "";
};

const closeScanner = () => {
  showScanner.value = false;
  stopCamera();
};

// Keyboard shortcuts
const handleKeydown = (event) => {
  // Esc to clear
  if (event.key === "Escape") {
    if (showScanner.value) {
      closeScanner();
    } else if (showHistory.value) {
      showHistory.value = false;
    } else if (showCustomize.value) {
      showCustomize.value = false;
    } else {
      createNew();
    }
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});
</script>

<template>
  <div
    :data-theme="theme"
    class="min-h-screen bg-base-200 flex items-center justify-center p-4 relative"
  >
    <!-- Toast Notification -->
    <div 
      v-if="toast.show"
      class="toast toast-top toast-center z-50"
    >
      <div 
        :class="{
          'alert alert-success': toast.type === 'success',
          'alert alert-error': toast.type === 'error',
          'alert alert-info': toast.type === 'info'
        }"
      >
        <span>{{ toast.message }}</span>
      </div>
    </div>

    <!-- Main Card -->
    <div class="card w-full max-w-md bg-base-100 shadow-xl transition-all duration-300">
      <div class="card-body items-center text-center">
        
        <!-- Language Toggle -->
        <button 
          @click="lang = lang === 'en' ? 'th' : 'en'" 
          class="btn btn-ghost btn-sm absolute top-4 left-4 font-bold"
        >
          <span v-if="lang === 'en'">TH</span>
          <span v-else>EN</span>
        </button>

        <!-- Theme Toggle -->
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

        <h1 class="card-title text-2xl sm:text-3xl mb-4 mt-8">{{ translations[lang].title }}</h1>

        <!-- Action Buttons -->
        <div class="flex gap-2 mb-4 flex-wrap justify-center">
          <button 
            @click="openScanner" 
            class="btn btn-sm btn-outline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            {{ translations[lang].scanBtn }}
          </button>
          
          <button 
            @click="showHistory = !showHistory" 
            :class="[
              'btn btn-sm',
              showHistory ? 'btn-primary' : 'btn-outline'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            {{ translations[lang].historyBtn }}
          </button>
          
          <button 
            @click="showCustomize = !showCustomize" 
            :class="[
              'btn btn-sm',
              showCustomize ? 'btn-primary' : 'btn-outline'
            ]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
            </svg>
            {{ translations[lang].customizeBtn }}
          </button>
        </div>

        <!-- Auto-generate Toggle -->
        <div class="form-control w-full mb-2">
          <label class="label cursor-pointer justify-center gap-2">
            <span class="label-text text-sm">{{ translations[lang].autoGenerate }}</span> 
            <input 
              type="checkbox" 
              v-model="autoGenerate"
              class="toggle toggle-sm toggle-primary" 
            />
          </label>
        </div>

        <!-- Customization Panel -->
        <div 
          v-if="showCustomize"
          class="w-full p-4 bg-base-200 rounded-lg mb-4 space-y-3 transition-all duration-300"
        >
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-lg">{{ translations[lang].customizeTitle }}</h3>
            <span 
              v-if="isCustomizing && qrCodeDataUrl" 
              class="badge badge-warning badge-sm"
            >
              {{ translations[lang].previewMode }}
            </span>
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ translations[lang].customizeDark }}</span>
            </label>
            <input 
              type="color" 
              v-model="qrOptions.color.dark"
              class="w-full h-10 rounded cursor-pointer"
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ translations[lang].customizeLight }}</span>
            </label>
            <input 
              type="color" 
              v-model="qrOptions.color.light"
              class="w-full h-10 rounded cursor-pointer"
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ translations[lang].customizeSize }}: {{ qrOptions.width }}px</span>
            </label>
            <input 
              type="range" 
              min="200" 
              max="600" 
              v-model.number="qrOptions.width"
              class="range range-sm range-primary"
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ translations[lang].customizeMargin }}: {{ qrOptions.margin }}</span>
            </label>
            <input 
              type="range" 
              min="0" 
              max="10" 
              v-model.number="qrOptions.margin"
              class="range range-sm range-primary"
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">{{ translations[lang].customizeErrorLevel }}</span>
            </label>
            <select v-model="qrOptions.errorCorrectionLevel" class="select select-bordered select-sm w-full">
              <option value="L">L (7%)</option>
              <option value="M">M (15%)</option>
              <option value="Q">Q (25%)</option>
              <option value="H">H (30%)</option>
            </select>
          </div>
          
          <!-- Apply Button -->
          <button 
            v-if="isCustomizing && qrCodeDataUrl"
            @click="applyCustomization"
            class="btn btn-success btn-sm w-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
            </svg>
            {{ translations[lang].applyBtn }}
          </button>
        </div>

        <!-- History Panel -->
        <div 
          v-if="showHistory"
          class="w-full p-4 bg-base-200 rounded-lg mb-4 max-h-96 overflow-y-auto transition-all duration-300"
        >
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-bold text-lg">{{ translations[lang].historyTitle }}</h3>
            <button 
              v-if="qrHistory.length > 0"
              @click="clearHistory"
              class="btn btn-error btn-xs"
            >
              {{ translations[lang].historyClear }}
            </button>
          </div>
          
          <div v-if="qrHistory.length === 0" class="text-center py-8 text-base-content/60">
            {{ translations[lang].historyEmpty }}
          </div>
          
          <div v-else class="space-y-2">
            <div 
              v-for="item in qrHistory" 
              :key="item.id"
              @click="loadFromHistory(item)"
              class="flex items-center gap-3 p-2 bg-base-100 rounded cursor-pointer hover:bg-base-300 transition-colors"
            >
              <img :src="item.dataUrl" class="w-12 h-12 rounded" />
              <div class="flex-1 text-left text-sm truncate">
                {{ item.text }}
              </div>
            </div>
          </div>
        </div>

        <!-- Input Form -->
        <form @submit.prevent="generateQR" class="w-full">
          <div class="form-control">
            <div class="input-group flex-col sm:flex-row gap-2">
              <div class="relative w-full">
                <input
                  v-model="text"
                  type="text"
                  :placeholder="translations[lang].placeholder"
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
                v-if="!autoGenerate"
                type="submit"
                class="btn btn-primary w-full sm:w-auto mt-2"
                :disabled="isLoading"
              >
                <span v-if="isLoading" class="loading loading-spinner"></span>
                <span v-else>{{ translations[lang].generateBtn }}</span>
              </button>
            </div>
          </div>
        </form>

        <p v-if="errorMessage" class="text-error mt-2 text-sm">{{ errorMessage }}</p>

        <!-- QR Code Display with Animation -->
        <div
          v-if="qrCodeDataUrl"
          class="mt-2 flex flex-col items-center gap-4 w-full animate-fade-in"
        >
          <img
            :src="qrCodeDataUrl"
            :alt="translations[lang].altQR"
            class="border-4 border-base-300 rounded-lg shadow-lg transition-transform hover:scale-105"
          />
          <div class="grid grid-cols-2 gap-2 w-full">
            <button @click="copyQR" class="btn btn-info btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
              </svg>
              {{ translations[lang].copyBtn }}
            </button>
            
            <button @click="shareQR" class="btn btn-secondary btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
              {{ translations[lang].shareBtn }}
            </button>
            
            <button @click="downloadQR" class="btn btn-success btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {{ translations[lang].downloadBtn }}
            </button>
            
            <button @click="createNew" class="btn btn-ghost btn-sm">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {{ translations[lang].newBtn }}
            </button>
          </div>
        </div>

        <!-- Hero Section -->
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
              <p class="text-sm sm:text-base">
                {{ translations[lang].heroText }}
              </p>
            </div>
          </div>
        </div>

        <p class="mt-8 text-xs sm:text-sm text-base-content/60">
          {{ translations[lang].craftedBy }}
          <span class="font-bold text-base-content">Witchapol L.</span>
        </p>
      </div>
    </div>

    <!-- Scanner Modal -->
    <div 
      v-if="showScanner"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeScanner"
    >
      <div class="card w-full max-w-md bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">{{ translations[lang].scanTitle }}</h2>
          
          <div class="flex flex-col gap-4">
            <button 
              @click="startCamera"
              :disabled="isScanning"
              class="btn btn-primary"
            >
              {{ translations[lang].scanFromCamera }}
            </button>
            
            <input 
              type="file" 
              ref="fileInputRef"
              accept="image/*"
              @change="scanFromFile"
              class="file-input file-input-bordered w-full"
            />
            
            <video 
              ref="videoRef"
              v-show="isScanning"
              class="w-full rounded-lg border-2 border-primary"
              autoplay 
              playsinline
            ></video>
            
            <canvas 
              ref="canvasRef"
              class="hidden"
            ></canvas>
            
            <div v-if="scannedResult" class="alert alert-success">
              <span>{{ translations[lang].scanResult }} {{ scannedResult }}</span>
            </div>
          </div>
          
          <div class="card-actions justify-end mt-4">
            <button @click="closeScanner" class="btn">
              {{ translations[lang].scanClose }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}

/* Smooth transitions */
* {
  transition-property: background-color, border-color, color;
  transition-duration: 200ms;
  transition-timing-function: ease-in-out;
}

/* Responsive text */
@media (max-width: 640px) {
  .card-title {
    font-size: 1.5rem;
  }
}
</style>
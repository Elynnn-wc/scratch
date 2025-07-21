document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("scratchCanvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const prizeLayer = document.getElementById("prizeLayer");
  const prizeImage = document.getElementById("prizeImage");
  const prizeText = document.getElementById("prizeText");
  const popupOverlay = document.getElementById("popupOverlay");
  const popupPrizeImage = document.getElementById("popupPrizeImage");
  const popupPrizeText = document.getElementById("popupPrizeText");
  const claimCodeInput = document.getElementById("claimCode");
  const copyCodeBtn = document.getElementById("copyCodeBtn");
  const popupClose = document.getElementById("popupClose");
  const resetArea = document.getElementById("secretResetArea");

  let isDrawing = false;
  let hasRevealed = false;
  let resetClickCount = 0;
  let selectedPrize = null;

  const STORAGE_KEY = "hasScratched";

  const prizes = [
    { name: "ANGPAO $3 🧧", weight: 10 },
    { name: "ANGPAO $5 🧧", weight: 30 },
    { name: "ANGPAO $8 🧧", weight: 40 },
    { name: "ANGPAO $12 🧧", weight: 20 },
    { name: "ANGPAO $68 🧧", weight: 0 },
    { name: "ANGPAO $88 🧧", weight: 0 },
  ];

  const prizeImageUrl = "https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png";

  function pickPrize() {
    const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
    let random = Math.random() * totalWeight;
    for (const prize of prizes) {
      if (random < prize.weight) return prize;
      random -= prize.weight;
    }
    return prizes[0];
  }

  function generateCode() {
    return "RB" + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  function showPopup() {
    popupPrizeImage.src = prizeImageUrl;
    popupPrizeText.textContent = selectedPrize.name;
    claimCodeInput.value = generateCode();
    popupOverlay.style.display = "flex";
  }

  function resetGame() {
    hasRevealed = false;
    localStorage.removeItem(STORAGE_KEY);
    selectedPrize = pickPrize();

    // Fill canvas with gray
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#999";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hide prize layer until scratched
    prizeLayer.style.visibility = "hidden";
    prizeImage.src = prizeImageUrl;
    prizeText.textContent = selectedPrize.name;
  }

  function revealPrize() {
    hasRevealed = true;
    localStorage.setItem(STORAGE_KEY, "true");
    prizeLayer.style.visibility = "visible";
    showPopup();
  }

  function getFilledPercentage() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let cleared = 0;
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 128) cleared++;
    }
    return (cleared / (canvas.width * canvas.height)) * 100;
  }

  function getCanvasPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  function draw(e) {
    if (!isDrawing || hasRevealed || localStorage.getItem(STORAGE_KEY)) return;

    const pos = getCanvasPosition(e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    if (getFilledPercentage() > 80 && !hasRevealed) {
      revealPrize();
    }
  }

  canvas.addEventListener("mousedown", e => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    isDrawing = true;
    draw(e);
  });

  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", () => isDrawing = false);
  canvas.addEventListener("mouseleave", () => isDrawing = false);

  canvas.addEventListener("touchstart", e => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    isDrawing = true;
    draw(e);
    e.preventDefault();
  });

  canvas.addEventListener("touchmove", draw);
  canvas.addEventListener("touchend", () => isDrawing = false);

  popupClose.addEventListener("click", () => {
    popupOverlay.style.display = "none";
  });

  copyCodeBtn.addEventListener("click", () => {
    claimCodeInput.select();
    document.execCommand("copy");
  });

  resetArea.addEventListener("click", () => {
    resetClickCount++;
    if (resetClickCount >= 5) {
      resetClickCount = 0;
      resetGame();
    }
  });

  // Init
  if (!localStorage.getItem(STORAGE_KEY)) {
    resetGame();
  } else {
    // 已经刮过则直接显示遮罩但不能再次刮
    ctx.fillStyle = "#999";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
});

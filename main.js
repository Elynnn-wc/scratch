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

  const prizes = [
    { name: "ANGPAO $3 🧧", weight: 10 },
    { name: "ANGPAO $5 🧧", weight: 30 },
    { name: "ANGPAO $8 🧧", weight: 40 },
    { name: "ANGPAO $12 🧧", weight: 20 },
    { name: "ANGPAO $68 🧧", weight: 0 },
    { name: "ANGPAO $88 🧧", weight: 0 },
  ];

  const prizeImageUrl = "https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png";

  let selectedPrize = null;

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
    selectedPrize = pickPrize();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#999";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    prizeLayer.style.visibility = "visible";
    prizeImage.src = prizeImageUrl;
    prizeText.textContent = selectedPrize.name;
  }

  function revealPrize() {
    hasRevealed = true;
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
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function draw(e) {
    if (!isDrawing || hasRevealed) return;
    const pos = getCanvasPosition(e);
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();

    if (getFilledPercentage() > 80) {
      revealPrize();
    }
  }

  canvas.addEventListener("mousedown", e => { isDrawing = true; draw(e); });
  canvas.addEventListener("mouseup", () => { isDrawing = false; });
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("touchstart", e => { isDrawing = true; draw(e); e.preventDefault(); });
  canvas.addEventListener("touchend", () => { isDrawing = false; });
  canvas.addEventListener("touchmove", draw);

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
  resetGame();
});

const canvas = document.getElementById("scratchCanvas");
const ctx = canvas.getContext("2d");
const prizeLayer = document.getElementById("prizeLayer");
const prizeImage = document.getElementById("prizeImage");
const prizeText = document.getElementById("prizeText");
const popupOverlay = document.getElementById("popupOverlay");
const popupPrizeImage = document.getElementById("popupPrizeImage");
const popupPrizeText = document.getElementById("popupPrizeText");
const claimCode = document.getElementById("claimCode");
const copyCodeBtn = document.getElementById("copyCodeBtn");
const popupClose = document.getElementById("popupClose");
const secretResetArea = document.getElementById("secretResetArea");

let isDrawing = false;
let revealed = false;
let resetCount = 0;
let revealedPixels = 0;
let totalPixels = 0;

// 🎁 奖品列表
const prizes = [
  { text: "ANGPAO $3 🧧", image: "https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png", weight: 10 },
  { text: "ANGPAO $5 🧧", image: "https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png", weight: 30 },
  { text: "ANGPAO $8 🧧", image: "https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png", weight: 40 },
  { text: "ANGPAO $12 🧧", image: "https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png", weight: 20 },
  { text: "ANGPAO $68 🧧", image: "https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png", weight: 0 },
  { text: "ANGPAO $88 🧧", image: "https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png", weight: 0 }
];

// 随机奖品
function pickPrize() {
  const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const prize of prizes) {
    if (rand < prize.weight) return prize;
    rand -= prize.weight;
  }
  return prizes[0];
}

let selectedPrize = pickPrize();

// 初始化 Canvas
function resizeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.fillStyle = "#999";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  totalPixels = canvas.width * canvas.height;
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// 显示奖品
function revealPrize() {
  revealed = true;
  prizeImage.src = selectedPrize.image;
  prizeText.textContent = selectedPrize.text;
  prizeImage.style.display = "block";
  prizeText.style.display = "block";
  setTimeout(() => {
    popupPrizeImage.src = selectedPrize.image;
    popupPrizeText.textContent = selectedPrize.text;
    claimCode.value = "RB" + Math.floor(100000 + Math.random() * 900000);
    popupOverlay.style.display = "flex";
    new Audio("https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3").play();
  }, 500);
}

// 刮奖处理
function scratch(x, y) {
  if (revealed) return;
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();
  revealedPixels += Math.PI * 15 * 15;
  let percent = revealedPixels / totalPixels;
  if (percent > 0.3) {
    prizeImage.style.display = "block";
  }
  if (percent > 0.5) {
    prizeText.style.display = "block";
  }
  if (percent > 0.8 && !revealed) {
    revealPrize();
  }
}

// 事件监听
function getOffset(e) {
  const rect = canvas.getBoundingClientRect();
  if (e.touches) {
    return {
      x: e.touches[0].clientX - rect.left,
      y: e.touches[0].clientY - rect.top
    };
  } else {
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
}

canvas.addEventListener("mousedown", e => {
  if (revealed) return;
  isDrawing = true;
  const pos = getOffset(e);
  scratch(pos.x, pos.y);
});

canvas.addEventListener("mousemove", e => {
  if (!isDrawing || revealed) return;
  const pos = getOffset(e);
  scratch(pos.x, pos.y);
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
});

canvas.addEventListener("touchstart", e => {
  if (revealed) return;
  isDrawing = true;
  const pos = getOffset(e);
  scratch(pos.x, pos.y);
});

canvas.addEventListener("touchmove", e => {
  if (!isDrawing || revealed) return;
  const pos = getOffset(e);
  scratch(pos.x, pos.y);
});

canvas.addEventListener("touchend", () => {
  isDrawing = false;
});

// 复制按钮
copyCodeBtn.addEventListener("click", () => {
  claimCode.select();
  document.execCommand("copy");
  copyCodeBtn.textContent = "Copied!";
});

// 关闭弹窗后不再允许刮
popupClose.addEventListener("click", () => {
  popupOverlay.style.display = "none";
});

// 隐藏区域管理员重置
secretResetArea.addEventListener("click", () => {
  resetCount++;
  if (resetCount >= 5) {
    location.reload();
  }
});

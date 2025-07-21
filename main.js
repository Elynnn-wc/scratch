const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
const prizeLayer = document.getElementById('prizeLayer');
const prizeText = document.getElementById('prizeText').querySelector('strong');
const prizeImage = document.getElementById('prizeImage');
const popupOverlay = document.getElementById('popupOverlay');
const popupPrizeText = document.getElementById('popupPrizeText');
const popupPrizeImage = document.getElementById('popupPrizeImage');
const claimCodeInput = document.getElementById('claimCode');
const bgMusic = document.getElementById('bgMusic');
const winSound = document.getElementById('winSound');

let isDrawing = false;
let revealed = false;
let clearedPixels = 0;
let totalPixels = canvas.width * canvas.height;
let startMusic = false;

const prizes = [
  { text: "RM 8 Bonus", img: "https://cdn-icons-png.flaticon.com/512/866/866218.png" },
  { text: "Free Spin", img: "https://cdn-icons-png.flaticon.com/512/2910/2910764.png" },
  { text: "RM 5 Bonus", img: "https://cdn-icons-png.flaticon.com/512/3500/3500833.png" },
  { text: "No Luck This Time", img: "https://cdn-icons-png.flaticon.com/512/753/753345.png" },
  { text: "RM 10 Bonus", img: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png" }
];

function drawMask() {
  ctx.fillStyle = '#999';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function revealPrize() {
  const prize = prizes[Math.floor(Math.random() * prizes.length)];
  prizeText.textContent = prize.text;
  prizeImage.src = prize.img;
  popupPrizeText.textContent = prize.text;
  popupPrizeImage.src = prize.img;
  claimCodeInput.value = generateCode();
  popupOverlay.style.display = 'block';

  // Play win sound
  bgMusic.pause();
  winSound.currentTime = 0;
  winSound.play();
}

function generateCode() {
  return 'LB7-' + Math.random().toString(36).substr(2, 6).toUpperCase();
}

function getPos(e) {
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

function scratch(e) {
  if (!isDrawing || revealed) return;

  const pos = getPos(e);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 15, 0, Math.PI * 2);
  ctx.fill();

  // Count cleared pixels every 20 scratches
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let clear = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] === 0) clear++;
  }

  const percentCleared = clear / (canvas.width * canvas.height);
  if (percentCleared > 0.5 && !revealed) {
    revealed = true;
    prizeLayer.classList.add('revealed');
    revealPrize();
  }
}

// Prevent right-click + long press
canvas.oncontextmenu = function (e) {
  e.preventDefault();
  return false;
};

canvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  scratch(e);
  if (!startMusic) {
    bgMusic.play();
    startMusic = true;
  }
});
canvas.addEventListener('mousemove', scratch);
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mouseleave', () => isDrawing = false);

canvas.addEventListener('touchstart', (e) => {
  isDrawing = true;
  scratch(e);
  if (!startMusic) {
    bgMusic.play();
    startMusic = true;
  }
});
canvas.addEventListener('touchmove', scratch);
canvas.addEventListener('touchend', () => isDrawing = false);

document.getElementById('popupClose').addEventListener('click', () => {
  // 不允许用户关闭弹窗（如果你想开放关闭，解除注释）
  // popupOverlay.style.display = 'none';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  revealed = false;
  prizeLayer.classList.remove('revealed');
  drawMask();
  bgMusic.pause();
  bgMusic.currentTime = 0;
  startMusic = false;
});

// Secret Reset area
let secretClickCount = 0;
document.getElementById('secretResetArea').addEventListener('click', () => {
  secretClickCount++;
  if (secretClickCount >= 5) {
    revealed = false;
    drawMask();
    prizeLayer.classList.remove('revealed');
    popupOverlay.style.display = 'none';
    secretClickCount = 0;
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }
});

function copyCode() {
  const code = document.getElementById("claimCode");
  code.select();
  code.setSelectionRange(0, 9999);
  document.execCommand("copy");
  alert("Code copied: " + code.value);
}

// Init
window.onload = () => {
  drawMask();
};

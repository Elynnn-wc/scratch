const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
const prizeLayer = document.getElementById('prizeLayer');
const popupOverlay = document.getElementById('popupOverlay');
const popupPrizeText = document.getElementById('popupPrizeText');
const popupPrizeImage = document.getElementById('popupPrizeImage');
const claimCodeInput = document.getElementById('claimCode');
const copyBtn = document.getElementById('copyCodeBtn');
const resetBtn = document.getElementById('resetBtn');
const secretResetArea = document.getElementById('secretResetArea');

let isDrawing = false;
let hasRevealed = false;
let revealedPercentage = 0;
let resetClickCount = 0;

const prizes = [
  { text: 'ANGPAO $3 🧧', chance: 10 },
  { text: 'ANGPAO $5 🧧', chance: 30 },
  { text: 'ANGPAO $8 🧧', chance: 40 },
  { text: 'ANGPAO $12 🧧', chance: 20 },
  { text: 'ANGPAO $68 🧧', chance: 0 },
  { text: 'ANGPAO $88 🧧', chance: 0 },
];

function pickPrize() {
  const total = prizes.reduce((sum, prize) => sum + prize.chance, 0);
  const rand = Math.random() * total;
  let cumulative = 0;
  for (let prize of prizes) {
    cumulative += prize.chance;
    if (rand < cumulative) return prize;
  }
  return prizes[0];
}

const selectedPrize = pickPrize();
document.getElementById('prizeText').innerText = selectedPrize.text;
document.getElementById('prizeImage').src = 'https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png';

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
ctx.fillStyle = '#999';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.globalCompositeOperation = 'destination-out';

function getBrushPos(xRef, yRef) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((xRef - rect.left) / (rect.right - rect.left) * canvas.width),
    y: Math.floor((yRef - rect.top) / (rect.bottom - rect.top) * canvas.height)
  };
}

function drawDot(mouseX, mouseY) {
  ctx.beginPath();
  ctx.arc(mouseX, mouseY, 20, 0, 2 * Math.PI, true);
  ctx.fill();
}

function checkReveal() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let pixels = imageData.data;
  let cleared = 0;

  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) cleared++;
  }
  let percent = cleared / (canvas.width * canvas.height) * 100;
  if (percent > 80 && !hasRevealed) {
    hasRevealed = true;
    revealPrize();
  }
}

function revealPrize() {
  prizeLayer.style.visibility = 'visible';
  popupPrizeText.textContent = selectedPrize.text;
  popupPrizeImage.src = 'https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png';
  const code = 'RB-' + Math.random().toString(36).substr(2, 6).toUpperCase();
  claimCodeInput.value = code;
  popupOverlay.style.display = 'flex';
  new Audio('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3').play();
}

canvas.addEventListener('mousedown', (e) => {
  if (hasRevealed) return;
  isDrawing = true;
});
canvas.addEventListener('mouseup', () => {
  if (hasRevealed) return;
  isDrawing = false;
});
canvas.addEventListener('mousemove', (e) => {
  if (isDrawing && !hasRevealed) {
    const pos = getBrushPos(e.clientX, e.clientY);
    drawDot(pos.x, pos.y);
    checkReveal();
  }
});

canvas.addEventListener('touchstart', (e) => {
  if (hasRevealed) return;
  isDrawing = true;
  e.preventDefault();
});
canvas.addEventListener('touchend', () => {
  if (hasRevealed) return;
  isDrawing = false;
});
canvas.addEventListener('touchmove', (e) => {
  if (isDrawing && !hasRevealed) {
    const touch = e.touches[0];
    const pos = getBrushPos(touch.clientX, touch.clientY);
    drawDot(pos.x, pos.y);
    checkReveal();
  }
  e.preventDefault();
}, { passive: false });

document.getElementById('popupClose').addEventListener('click', () => {
  popupOverlay.style.display = 'none';
});

copyBtn.addEventListener('click', () => {
  claimCodeInput.select();
  document.execCommand('copy');
  copyBtn.textContent = 'Copied!';
  setTimeout(() => {
    copyBtn.textContent = 'Copy';
  }, 1500);
});

secretResetArea.addEventListener('click', () => {
  resetClickCount++;
  if (resetClickCount >= 5) {
    resetGame();
    resetClickCount = 0;
  }
});

function resetGame() {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#999';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'destination-out';
  hasRevealed = false;
  revealedPercentage = 0;
  prizeLayer.style.visibility = 'hidden';
  popupOverlay.style.display = 'none';
  copyBtn.textContent = 'Copy';
  selectedPrize = pickPrize();
  document.getElementById('prizeText').innerText = selectedPrize.text;
  claimCodeInput.value = '';
}

// Prevent right click context menu
canvas.addEventListener('contextmenu', (e) => e.preventDefault());

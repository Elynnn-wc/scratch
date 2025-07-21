// main.js

const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let revealed = false;
let resetClickCount = 0;
const resetClickThreshold = 5;
const scratchLimit = 0.8; // 80%

const prizeLayer = document.getElementById('prizeLayer');
const prizeImage = document.getElementById('prizeImage');
const prizeText = document.getElementById('prizeText');

const popupOverlay = document.getElementById('popupOverlay');
const popupPrizeImage = document.getElementById('popupPrizeImage');
const popupPrizeText = document.getElementById('popupPrizeText');
const claimCode = document.getElementById('claimCode');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const popupClose = document.getElementById('popupClose');
const secretResetArea = document.getElementById('secretResetArea');

const prizes = [
  { name: 'ANGPAO $3 🧧', chance: 0.1 },
  { name: 'ANGPAO $5 🧧', chance: 0.3 },
  { name: 'ANGPAO $8 🧧', chance: 0.4 },
  { name: 'ANGPAO $12 🧧', chance: 0.2 },
  { name: 'ANGPAO $68 🧧', chance: 0.0 },
  { name: 'ANGPAO $88 🧧', chance: 0.0 }
];

const prizeImageSrc = 'https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png';

let canScratch = localStorage.getItem('hasScratched') !== 'true';
let currentPrize;

function selectPrize() {
  const rand = Math.random();
  let total = 0;
  for (let prize of prizes) {
    total += prize.chance;
    if (rand <= total) return prize;
  }
  return prizes[0];
}

function getBrushPos(e) {
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  return { x, y };
}

function drawPoint(x, y) {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, 25, 0, Math.PI * 2);
  ctx.fill();
}

function getClearedPercentage() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let cleared = 0;
  for (let i = 3; i < imgData.data.length; i += 4) {
    if (imgData.data[i] === 0) cleared++;
  }
  return cleared / (canvas.width * canvas.height) * 4;
}

function checkScratchPercent() {
  if (revealed) return;
  const percent = getClearedPercentage();
  if (percent >= scratchLimit) {
    revealPrize();
  }
}

function revealPrize() {
  revealed = true;
  canScratch = false;
  localStorage.setItem('hasScratched', 'true');

  // Slowly fade in prize content
  prizeImage.style.opacity = 0;
  prizeText.style.opacity = 0;
  prizeImage.style.display = 'block';
  prizeText.style.display = 'block';

  setTimeout(() => { prizeImage.style.opacity = 1; }, 50);
  setTimeout(() => { prizeText.style.opacity = 1; }, 150);

  setTimeout(() => {
    popupOverlay.style.display = 'flex';
    popupPrizeImage.src = prizeImage.src;
    popupPrizeText.textContent = currentPrize.name;
    claimCode.textContent = 'RB-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }, 1000);
}

function resetGame() {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#999999';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  revealed = false;
  canScratch = true;
  localStorage.removeItem('hasScratched');
  popupOverlay.style.display = 'none';
  prizeImage.style.display = 'none';
  prizeText.style.display = 'none';

  currentPrize = selectPrize();
  prizeText.textContent = currentPrize.name;
  prizeImage.src = prizeImageSrc;
}

function scratchHandler(e) {
  if (!canScratch || revealed) return;
  const pos = getBrushPos(e);
  drawPoint(pos.x, pos.y);
  checkScratchPercent();
  e.preventDefault();
}

canvas.addEventListener('mousedown', (e) => { isDrawing = true; scratchHandler(e); });
canvas.addEventListener('mousemove', (e) => { if (isDrawing) scratchHandler(e); });
canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('touchstart', (e) => { isDrawing = true; scratchHandler(e); });
canvas.addEventListener('touchmove', (e) => { if (isDrawing) scratchHandler(e); });
canvas.addEventListener('touchend', () => { isDrawing = false; });

popupClose.addEventListener('click', () => {
  popupOverlay.style.display = 'none';
});

copyCodeBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(claimCode.textContent);
  alert('Claim code copied!');
});

secretResetArea.addEventListener('click', () => {
  resetClickCount++;
  if (resetClickCount >= resetClickThreshold) {
    resetClickCount = 0;
    resetGame();
  }
});

if (canScratch) {
  resetGame();
} else {
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#999999';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  prizeImage.style.display = 'block';
  prizeText.style.display = 'block';
}

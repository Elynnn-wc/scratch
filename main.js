// Scratch Card Logic
const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
const prizeLayer = document.getElementById('prizeLayer');
const prizeText = document.getElementById('prizeText');
const prizeImage = document.querySelector('#prizeLayer img');
const popupOverlay = document.getElementById('popupOverlay');
const popupPrizeText = document.getElementById('popupPrizeText');
const popupPrizeImage = document.getElementById('popupPrizeImage');
const claimCodeElem = document.getElementById('claimCode');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const popupClose = document.getElementById('popupClose');
const secretResetArea = document.getElementById('secretResetArea');

let isDrawing = false;
let lastX, lastY;
let revealed = false;
let scratchCount = 0;
let resetClicks = 0;

let prizeList = [
  { text: 'ANGPAO $3 🧧', chance: 10 },
  { text: 'ANGPAO $5 🧧', chance: 30 },
  { text: 'ANGPAO $8 🧧', chance: 40 },
  { text: 'ANGPAO $12 🧧', chance: 20 },
  { text: 'ANGPAO $68 🧧', chance: 0 },
  { text: 'ANGPAO $88 🧧', chance: 0 }
];

function pickPrize() {
  const total = prizeList.reduce((sum, prize) => sum + prize.chance, 0);
  let rand = Math.random() * total;
  for (let prize of prizeList) {
    if (rand < prize.chance) return prize.text;
    rand -= prize.chance;
  }
  return prizeList[0].text;
}

let chosenPrize = pickPrize();
let claimCode = Math.random().toString(36).substring(2, 8).toUpperCase();
prizeText.textContent = chosenPrize;

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
ctx.fillStyle = '#999';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.globalCompositeOperation = 'destination-out';

// Only show result if not already revealed (check localStorage)
if (localStorage.getItem('hasScratched') === 'true') {
  revealed = true;
  canvas.style.pointerEvents = 'none';
}

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
    y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
  };
}

function handleScratch(e) {
  if (revealed) return;
  const { x, y } = getMousePos(e);
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, 2 * Math.PI);
  ctx.fill();
  scratchCount++;
  if (checkRevealed()) showResult();
}

function checkRevealed() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let cleared = 0;
  for (let i = 0; i < imgData.data.length; i += 4) {
    if (imgData.data[i + 3] === 0) cleared++;
  }
  const percent = cleared / (canvas.width * canvas.height) * 100;
  return percent > 80;
}

function showResult() {
  revealed = true;
  localStorage.setItem('hasScratched', 'true'); // Mark as scratched
  prizeImage.style.display = 'block';
  prizeText.style.display = 'block';
  popupPrizeText.textContent = chosenPrize;
  popupPrizeImage.src = prizeImage.src;
  claimCodeElem.value = claimCode;
  popupOverlay.style.display = 'flex';
  canvas.style.pointerEvents = 'none';
}

canvas.addEventListener('mousedown', e => {
  isDrawing = true;
  handleScratch(e);
});
canvas.addEventListener('mousemove', e => {
  if (isDrawing) handleScratch(e);
});
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('touchstart', e => {
  isDrawing = true;
  handleScratch(e);
}, { passive: true });
canvas.addEventListener('touchmove', e => {
  if (isDrawing) handleScratch(e);
}, { passive: true });
canvas.addEventListener('touchend', () => isDrawing = false);

popupClose.addEventListener('click', () => {
  popupOverlay.style.display = 'none';
});

copyCodeBtn.addEventListener('click', () => {
  claimCodeElem.select();
  document.execCommand('copy');
  copyCodeBtn.textContent = 'Copied!';
});

secretResetArea.addEventListener('click', () => {
  resetClicks++;
  if (resetClicks >= 5) {
    localStorage.removeItem('hasScratched');
    location.reload();
  }
});

// main.js

const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
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

let isDrawing = false;
let scratchCount = 0;
let revealed = false;
let resetCounter = 0;
let alreadyScratched = localStorage.getItem('alreadyScratched') === 'true';

const prizes = [
  { text: 'ANGPAO $3 🧧', chance: 10 },
  { text: 'ANGPAO $5 🧧', chance: 30 },
  { text: 'ANGPAO $8 🧧', chance: 40 },
  { text: 'ANGPAO $12 🧧', chance: 20 },
  { text: 'ANGPAO $68 🧧', chance: 0 },
  { text: 'ANGPAO $88 🧧', chance: 0 },
];

const prizeImageUrl = 'https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png';

canvas.width = 300;
canvas.height = 150;

function pickPrize() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  for (const prize of prizes) {
    cumulative += prize.chance;
    if (rand < cumulative) return prize;
  }
  return prizes[0];
}

const selectedPrize = pickPrize();
prizeImage.src = prizeImageUrl;
prizeText.textContent = selectedPrize.text;

ctx.fillStyle = '#AAA';
ctx.fillRect(0, 0, canvas.width, canvas.height);

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('touchstart', startDraw);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('touchend', endDraw);

function startDraw(e) {
  if (revealed || alreadyScratched) return;
  isDrawing = true;
}

function draw(e) {
  if (!isDrawing || revealed || alreadyScratched) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, 2 * Math.PI);
  ctx.fill();
  scratchCount++;

  if (getScratchPercentage() > 80) {
    revealPrize();
  }
}

function endDraw() {
  isDrawing = false;
}

function getScratchPercentage() {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let cleared = 0;
  for (let i = 0; i < imgData.data.length; i += 4) {
    if (imgData.data[i + 3] === 0) cleared++;
  }
  return (cleared / (canvas.width * canvas.height)) * 100;
}

function revealPrize() {
  if (revealed) return;
  revealed = true;
  alreadyScratched = true;
  localStorage.setItem('alreadyScratched', 'true');

  prizeImage.style.opacity = 1;
  prizeText.style.opacity = 1;

  setTimeout(() => {
    showPopup();
  }, 800);
}

function showPopup() {
  popupPrizeImage.src = prizeImageUrl;
  popupPrizeText.textContent = selectedPrize.text;
  claimCode.textContent = generateCode();
  popupOverlay.style.display = 'flex';
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

copyCodeBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(claimCode.textContent);
  alert('Claim code copied!');
});

popupClose.addEventListener('click', () => {
  popupOverlay.style.display = 'none';
});

secretResetArea.addEventListener('click', () => {
  resetCounter++;
  if (resetCounter >= 5) {
    localStorage.removeItem('alreadyScratched');
    location.reload();
  }
});

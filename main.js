const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
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
let revealed = false;
let resetClicks = 0;

const prizeList = [
  { text: 'ANGPAO $3 🧧', chance: 10 },
  { text: 'ANGPAO $5 🧧', chance: 30 },
  { text: 'ANGPAO $8 🧧', chance: 40 },
  { text: 'ANGPAO $12 🧧', chance: 20 },
  { text: 'ANGPAO $68 🧧', chance: 0 },
  { text: 'ANGPAO $88 🧧', chance: 0 }
];

// Pick prize
function pickPrize() {
  const total = prizeList.reduce((sum, p) => sum + p.chance, 0);
  let rand = Math.random() * total;
  for (const prize of prizeList) {
    if (rand < prize.chance) return prize;
    rand -= prize.chance;
  }
  return prizeList[0];
}

let chosenPrize = pickPrize();
let claimCode = Math.random().toString(36).substring(2, 8).toUpperCase();

// Init canvas
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;
ctx.fillStyle = '#aaa';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.globalCompositeOperation = 'destination-out';

// Show prize if already scratched
if (localStorage.getItem('hasScratched') === 'true') {
  canvas.style.pointerEvents = 'none';
  revealed = true;
}

// Draw erase
function getPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.touches ? e.touches[0].clientX : e.clientX) - rect.left,
    y: (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
  };
}

function scratch(e) {
  if (revealed) return;
  const { x, y } = getPos(e);
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();
  if (checkReveal()) showPopup();
}

function checkReveal() {
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let count = 0;
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] < 128) count++;
  }
  const cleared = count / (canvas.width * canvas.height) * 100;
  return cleared > 80;
}

function showPopup() {
  revealed = true;
  canvas.style.pointerEvents = 'none';
  localStorage.setItem('hasScratched', 'true');
  prizeText.textContent = chosenPrize.text;
  prizeText.style.display = 'block';
  prizeImage.style.display = 'block';
  popupPrizeText.textContent = chosenPrize.text;
  popupPrizeImage.src = prizeImage.src;
  claimCodeElem.value = claimCode;
  popupOverlay.style.display = 'flex';
}

canvas.addEventListener('mousedown', e => { isDrawing = true; scratch(e); });
canvas.addEventListener('mousemove', e => { if (isDrawing) scratch(e); });
canvas.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('touchstart', e => { isDrawing = true; scratch(e); }, { passive: true });
canvas.addEventListener('touchmove', e => { if (isDrawing) scratch(e); }, { passive: true });
canvas.addEventListener('touchend', () => isDrawing = false);

// Popup
popupClose.addEventListener('click', () => popupOverlay.style.display = 'none');
copyCodeBtn.addEventListener('click', () => {
  claimCodeElem.select();
  document.execCommand('copy');
  copyCodeBtn.textContent = 'Copied!';
});

// Admin reset
secretResetArea.addEventListener('click', () => {
  resetClicks++;
  if (resetClicks >= 5) {
    localStorage.removeItem('hasScratched');
    location.reload();
  }
});

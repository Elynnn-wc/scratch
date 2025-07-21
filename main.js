const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
const isTouchDevice = 'ontouchstart' in window;
const moveEvent = isTouchDevice ? 'touchmove' : 'mousemove';
const downEvent = isTouchDevice ? 'touchstart' : 'mousedown';
const upEvent = isTouchDevice ? 'touchend' : 'mouseup';

const resetBtn = document.getElementById('resetBtn');
const popup = document.getElementById('popupOverlay');
const popupPrizeText = document.getElementById('popupPrizeText');
const popupPrizeImage = document.getElementById('popupPrizeImage');
const prizeImage = document.getElementById('prizeImage');
const prizeText = document.getElementById('prizeText');
const winSound = document.getElementById('winSound');
const claimCode = document.getElementById('claimCode');

const prizes = [
  { text: 'ANGPAO $3 🧧', chance: 10 },
  { text: 'ANGPAO $5 🧧', chance: 30 },
  { text: 'ANGPAO $8 🧧', chance: 40 },
  { text: 'ANGPAO $12 🧧', chance: 20 },
  { text: 'ANGPAO $68 🧧', chance: 0 },
  { text: 'ANGPAO $88 🧧', chance: 0 }
];

function getRandomPrize() {
  const weighted = [];
  prizes.forEach((p, i) => {
    for (let j = 0; j < p.chance; j++) weighted.push(i);
  });
  const index = weighted[Math.floor(Math.random() * weighted.length)];
  return prizes[index];
}

const selectedPrize = JSON.parse(localStorage.getItem('scratchPrize')) || getRandomPrize();
prizeText.innerHTML = `<strong>${selectedPrize.text}</strong>`;
localStorage.setItem('scratchPrize', JSON.stringify(selectedPrize));

function copyCode() {
  claimCode.select();
  document.execCommand('copy');
}

function showPopup(prize) {
  popupPrizeText.innerHTML = `<strong>${prize.text}</strong>`;
  popupPrizeImage.src = prizeImage.src;
  popup.style.display = 'flex';
  winSound.play();
  const code = 'RB' + Math.floor(100000 + Math.random() * 900000);
  claimCode.value = code;
  claimCode.style.color = '#111';
  canvas.style.pointerEvents = 'none';
  localStorage.setItem('scratched', 'yes');
}

document.getElementById('popupClose').onclick = () => popup.style.display = 'none';

let isDrawing = false;
let revealed = false;
let scratchDisabled = localStorage.getItem('scratched') === 'yes';
let resetTap = 0;

function handleScratch(e) {
  if (scratchDisabled || revealed) return;
  if (!isDrawing) return;
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, 15, 0, Math.PI * 2);
  ctx.fill();

  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let count = 0;
  for (let i = 0; i < pixels.data.length; i += 4) {
    if (pixels.data[i + 3] === 0) count++;
  }
  const percentage = count / (canvas.width * canvas.height) * 100;
  if (percentage > 50 && !revealed) {
    revealed = true;
    showPopup(selectedPrize);
  }
}

canvas.addEventListener(downEvent, () => {
  if (scratchDisabled) return;
  isDrawing = true;
});
canvas.addEventListener(upEvent, () => isDrawing = false);
canvas.addEventListener(moveEvent, handleScratch);

document.getElementById('secretResetArea').addEventListener('click', () => {
  resetTap++;
  if (resetTap >= 5) {
    localStorage.removeItem('scratched');
    localStorage.removeItem('scratchPrize');
    location.reload();
  }
});

function initCanvas() {
  ctx.fillStyle = '#999';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (scratchDisabled) canvas.style.pointerEvents = 'none';
}

initCanvas();

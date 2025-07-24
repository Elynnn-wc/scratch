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
const bgMusic = document.getElementById('bgMusic');
const claimCode = document.getElementById('claimCode');
const countdownEl = document.getElementById('countdownMessage');

const prizes = [
  { text: 'ANGPAO $3 🧧', chance: 0 },
  { text: 'ANGPAO $5 🧧', chance: 0 },
  { text: 'ANGPAO $8 🧧', chance: 90 },
  { text: 'ANGPAO $12 🧧', chance: 10 },
  { text: 'ANGPAO $68 🧧', chance: 0 },
  { text: 'ANGPAO $88 🧧', chance: 0 }
];

let bgMusicStarted = false;
bgMusic.loop = false;

function getRandomPrize() {
  const weighted = [];
  prizes.forEach((p, i) => {
    for (let j = 0; j < p.chance; j++) weighted.push(i);
  });
  const index = weighted[Math.floor(Math.random() * weighted.length)];
  return prizes[index];
}

let scratchDisabled = false;
const nowDate = new Date();
const today = nowDate.toISOString().split('T')[0];
const lastPlay = localStorage.getItem('lastPlayDate');

if (lastPlay === today) {
  scratchDisabled = true;
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

  bgMusic.pause();
  bgMusic.currentTime = 0;
  bgMusicStarted = false;

  winSound.play().catch(err => console.warn("Win sound failed:", err));

  const code = 'RB' + Math.floor(100000 + Math.random() * 900000);
  claimCode.value = code;
  claimCode.style.color = '#111';
  canvas.style.pointerEvents = 'none';
  localStorage.setItem('lastPlayDate', today);

  const prizeLayer = document.getElementById('prizeLayer');
  if (prizeLayer) prizeLayer.classList.add('revealed');
}

document.getElementById('popupClose').onclick = () => {};

let isDrawing = false;
let revealed = false;
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
  const percentage = (count / (canvas.width * canvas.height)) * 100;
  if (percentage > 50 && !revealed) {
    revealed = true;
    showPopup(selectedPrize);
  }
}

canvas.addEventListener(downEvent, () => {
  if (scratchDisabled) return;
  isDrawing = true;
});
canvas.addEventListener(upEvent, () => (isDrawing = false));
canvas.addEventListener(moveEvent, handleScratch);

document.getElementById('secretResetArea').addEventListener('click', () => {
  resetTap++;
  if (resetTap >= 5) {
    localStorage.removeItem('lastPlayDate');
    localStorage.removeItem('scratchPrize');
    location.reload();
  }
});

function initCanvas() {
  const grad = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 6,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 1.2
  );
  grad.addColorStop(0, '#ff74d4');
  grad.addColorStop(1, '#f11010');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  if (scratchDisabled) canvas.style.pointerEvents = 'none';
}

initCanvas();

function startBgMusicOnce() {
  if (!bgMusicStarted) {
    bgMusic.play().catch(err => console.warn("BG music play failed:", err));
    bgMusicStarted = true;
  }
}

const startButton = document.getElementById('startButton');
if (startButton) {
  startButton.addEventListener('click', startBgMusicOnce, { once: true });
} else {
  document.addEventListener('click', startBgMusicOnce, { once: true });
}

document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());

// 倒计时至午夜自动解锁
(function countdownToMidnight() {
  const now = Date.now();
  const nextMid = new Date();
  nextMid.setHours(24, 0, 0, 0);
  const diff = nextMid.getTime() - now;

  function update() {
    const ms = nextMid.getTime() - Date.now();
    if (ms <= 0) {
      countdownEl.innerText = '✅ Ready to Scratch!';
      countdownEl.classList.add('ready');
      canvas.style.pointerEvents = 'auto';
      scratchDisabled = false;
      return;
    }
    const h = String(Math.floor(ms / 3600000)).padStart(2, '0');
    const m = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    countdownEl.innerText = `Come back in ${h}:${m}:${s}`;
    if (scratchDisabled) requestAnimationFrame(update);
  }
  canvas.style.pointerEvents = scratchDisabled ? 'none' : 'auto';
  update();
})();

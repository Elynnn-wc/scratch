const canvas = document.getElementById('scratchCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let revealedPixels = 0;
let totalPixels = 0;
let scratched = false;
let resetCount = 0;

const prizeLayer = document.getElementById('prizeLayer');
const prizeImage = document.getElementById('prizeImage');
const prizeText = document.getElementById('prizeText');
const popupOverlay = document.getElementById('popupOverlay');
const popupPrizeImage = document.getElementById('popupPrizeImage');
const popupPrizeText = document.getElementById('popupPrizeText');
const claimCodeDiv = document.getElementById('claimCode');
const copyCodeBtn = document.getElementById('copyCodeBtn');
const popupClose = document.getElementById('popupClose');
const resetArea = document.getElementById('secretResetArea');

// 奖品列表与机率
const prizes = [
  { name: 'ANGPAO $3 🧧', image: 'https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png', chance: 10 },
  { name: 'ANGPAO $5 🧧', image: 'https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png', chance: 30 },
  { name: 'ANGPAO $8 🧧', image: 'https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png', chance: 40 },
  { name: 'ANGPAO $12 🧧', image: 'https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png', chance: 20 },
  { name: 'ANGPAO $68 🧧', image: 'https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png', chance: 0 },
  { name: 'ANGPAO $88 🧧', image: 'https://static.vecteezy.com/system/resources/thumbnails/053/236/126/small_2x/paper-pack-reward-angpao-chinese-icon-png.png', chance: 0 },
];

function pickPrize() {
  const rand = Math.random() * 100;
  let sum = 0;
  for (const prize of prizes) {
    sum += prize.chance;
    if (rand <= sum) return prize;
  }
  return prizes[0]; // fallback
}

let selectedPrize = localStorage.getItem('selectedPrize') 
  ? JSON.parse(localStorage.getItem('selectedPrize')) 
  : pickPrize();

if (!localStorage.getItem('hasScratched')) {
  localStorage.setItem('selectedPrize', JSON.stringify(selectedPrize));
}

function drawCover() {
  ctx.fillStyle = '#888';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  totalPixels = canvas.width * canvas.height;
}

function revealPrize() {
  prizeImage.src = selectedPrize.image;
  prizeText.innerText = selectedPrize.name;
  prizeImage.style.opacity = 1;
  prizeText.style.opacity = 1;

  setTimeout(() => {
    popupPrizeImage.src = selectedPrize.image;
    popupPrizeText.innerText = selectedPrize.name;
    claimCodeDiv.innerText = 'RB' + Math.floor(Math.random() * 1000000);
    popupOverlay.style.display = 'flex';
    const audio = new Audio('https://cdn.pixabay.com/download/audio/2022/03/15/audio_a586d42270.mp3'); // 🎵中奖音效
    audio.play();
  }, 800);
}

function scratch(x, y) {
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let clearPixels = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    if (imageData.data[i + 3] < 128) {
      clearPixels++;
    }
  }
  const percent = clearPixels / (canvas.width * canvas.height);
  if (percent > 0.8 && !scratched) {
    scratched = true;
    localStorage.setItem('hasScratched', 'true');
    revealPrize();
  }
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

if (localStorage.getItem('hasScratched')) {
  drawCover();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#444';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  canvas.style.pointerEvents = 'none';
  revealPrize();
} else {
  drawCover();
}

canvas.addEventListener('mousedown', e => {
  if (localStorage.getItem('hasScratched')) return;
  isDrawing = true;
  const pos = getPos(e);
  scratch(pos.x, pos.y);
});

canvas.addEventListener('mousemove', e => {
  if (!isDrawing) return;
  const pos = getPos(e);
  scratch(pos.x, pos.y);
});

canvas.addEventListener('mouseup', () => {
  isDrawing = false;
});

canvas.addEventListener('touchstart', e => {
  if (localStorage.getItem('hasScratched')) return;
  isDrawing = true;
  const pos = getPos(e);
  scratch(pos.x, pos.y);
});

canvas.addEventListener('touchmove', e => {
  const pos = getPos(e);
  scratch(pos.x, pos.y);
  e.preventDefault();
}, { passive: false });

canvas.addEventListener('touchend', () => {
  isDrawing = false;
});

// Reset admin area
resetArea.addEventListener('click', () => {
  resetCount++;
  if (resetCount >= 5) {
    localStorage.removeItem('hasScratched');
    localStorage.removeItem('selectedPrize');
    window.location.reload();
  }
});

popupClose.addEventListener('click', () => {
  popupOverlay.style.display = 'none';
});

copyCodeBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(claimCodeDiv.innerText).then(() => {
    alert('Copied!');
  });
});

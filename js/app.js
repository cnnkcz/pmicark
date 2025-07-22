const wheel = document.getElementById('wheel');
const ctx = wheel.getContext('2d');
const form = document.getElementById('participant-form');
const nameInput = document.getElementById('participant-name');
const spinBtn = document.getElementById('spin-btn');
const winnerDiv = document.getElementById('winner');
const togglePanelBtn = document.getElementById('toggle-panel-btn');
const participantsPanel = document.getElementById('participants-panel');
const countdownDiv = document.getElementById('countdown');
const confettiCanvas = document.getElementById('confetti-canvas');
const mainContent = document.getElementById('main-content');

// PMI renkleri ve tonları
const pmiColors = [
  '#6a1b9a', '#8e24aa', '#ab47bc', '#ce93d8', '#f3e5f5',
  '#ffb300', '#ff7043', '#29b6f6', '#66bb6a', '#d4e157',
];

let participants = [];
let spinning = false;
let angle = 0;
let spinTimeout = null;
let spinAngleStart = 0;
let spinTime = 0;
let spinTimeTotal = 0;
let confettiActive = false;

function drawWheel() {
  ctx.clearRect(0, 0, wheel.width, wheel.height);
  const num = participants.length || 1;
  const arc = Math.PI * 2 / num;
  for (let i = 0; i < num; i++) {
    ctx.beginPath();
    ctx.moveTo(325, 325);
    ctx.arc(325, 325, 325, arc * i + angle, arc * (i + 1) + angle);
    ctx.closePath();
    ctx.fillStyle = pmiColors[i % pmiColors.length];
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.save();
    ctx.translate(325, 325);
    ctx.rotate(arc * i + arc / 2 + angle);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px Arial';
    const text = participants[i] || 'Katılımcı';
    ctx.fillText(text, 295, 20);
    ctx.restore();
  }
  // Ok
  ctx.beginPath();
  ctx.moveTo(325, 0);
  ctx.lineTo(315, 40);
  ctx.lineTo(335, 40);
  ctx.closePath();
  ctx.fillStyle = '#ffb300';
  ctx.fill();
  winnerDiv.textContent = '';
  winnerDiv.classList.remove('active');
  mainContent.classList.remove('shifted');
}

drawWheel();

const participantList = document.createElement('ul');
participantList.id = 'participant-list';
participantsPanel.appendChild(participantList);

function updateParticipantList() {
  participantList.innerHTML = '';
  participants.forEach((name, idx) => {
    const li = document.createElement('li');
    li.textContent = name;
    const delBtn = document.createElement('button');
    delBtn.textContent = '✖';
    delBtn.className = 'delete-btn';
    delBtn.onclick = function() {
      participants.splice(idx, 1);
      drawWheel();
      updateParticipantList();
    };
    li.appendChild(delBtn);
    participantList.appendChild(li);
  });
}

form.addEventListener('submit', function(e) {
  e.preventDefault();
  const name = nameInput.value.trim();
  if (name) {
    participants.push(name);
    nameInput.value = '';
    drawWheel();
    updateParticipantList();
  }
});

function rotateWheel() {
  angle += spinAngleStart * Math.PI / 180;
  drawWheel();
  spinTime += 30;
  if (spinTime < spinTimeTotal) {
    spinAngleStart *= 0.97;
    spinTimeout = setTimeout(rotateWheel, 30);
  } else {
    finishSpin();
  }
}

function showCountdown(callback) {
  let count = 3;
  countdownDiv.textContent = count;
  countdownDiv.style.display = 'block';
  spinBtn.disabled = true;
  const interval = setInterval(() => {
    count--;
    if (count > 0) {
      countdownDiv.textContent = count;
    } else {
      clearInterval(interval);
      countdownDiv.style.display = 'none';
      spinBtn.disabled = false;
      callback();
    }
  }, 1000);
}

function launchConfetti() {
  if (confettiActive) return;
  confettiActive = true;
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = confettiCanvas.offsetWidth;
  confettiCanvas.height = confettiCanvas.offsetHeight;
  const W = confettiCanvas.width;
  const H = confettiCanvas.height;
  const confettiCount = 120;
  const confetti = [];
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      x: Math.random() * W,
      y: Math.random() * -H,
      r: Math.random() * 8 + 4,
      d: Math.random() * confettiCount,
      color: pmiColors[Math.floor(Math.random() * pmiColors.length)],
      tilt: Math.random() * 10 - 10,
      tiltAngle: 0,
      tiltAngleIncremental: (Math.random() * 0.07) + 0.05
    });
  }
  let angle = 0;
  function drawConfetti() {
    ctx.clearRect(0, 0, W, H);
    angle += 0.01;
    for (let i = 0; i < confettiCount; i++) {
      let c = confetti[i];
      c.tiltAngle += c.tiltAngleIncremental;
      c.y += (Math.cos(angle + c.d) + 3 + c.r / 2) / 2;
      c.x += Math.sin(angle);
      c.tilt = Math.sin(c.tiltAngle) * 15;
      ctx.beginPath();
      ctx.lineWidth = c.r;
      ctx.strokeStyle = c.color;
      ctx.moveTo(c.x + c.tilt + c.r / 3, c.y);
      ctx.lineTo(c.x + c.tilt, c.y + c.tilt + 10);
      ctx.stroke();
    }
  }
  function animateConfetti() {
    drawConfetti();
    if (confettiActive) {
      requestAnimationFrame(animateConfetti);
    }
  }
  animateConfetti();
  setTimeout(() => { confettiActive = false; ctx.clearRect(0, 0, W, H); }, 3500);
}

spinBtn.addEventListener('click', function() {
  if (spinning || participants.length === 0) return;
  showCountdown(() => {
    spinning = true;
    spinAngleStart = Math.random() * 10 + 20;
    spinTime = 0;
    spinTimeTotal = Math.random() * 1000 + 7000; // 7-8 saniye
    rotateWheel();
  });
});

function finishSpin() {
  spinning = false;
  const num = participants.length;
  const arc = Math.PI * 2 / num;
  const degrees = angle * 180 / Math.PI + 90;
  const index = num - Math.floor((degrees % 360) / (360 / num)) - 1;
  const winner = participants[index >= 0 ? index : (index + num) % num];
  setTimeout(() => {
    winnerDiv.innerHTML = `<span>KAZANAN: ${winner}</span><br><span>TEBRİKLER!</span>`;
    winnerDiv.classList.add('active');
    mainContent.classList.add('shifted');
    launchConfetti();
  }, 500);
}

togglePanelBtn.addEventListener('click', function() {
  participantsPanel.classList.toggle('open');
  if (participantsPanel.classList.contains('open')) {
    updateParticipantList();
  }
}); 
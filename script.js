const wand = document.getElementById("wand");
const submitBtn = document.getElementById("submit");
const question = document.getElementById("question");
const answerInput = document.getElementById("answer");
const blobContainer = document.getElementById("blobs");
const beamCanvas = document.getElementById("beams-canvas");
const scoreEl = document.getElementById("score");

beamCanvas.width = document.body.offsetWidth;
beamCanvas.height = document.body.offsetHeight;

const ctx = beamCanvas.getContext("2d");

ctx.strokeStyle = "#6e66b2";
ctx.lineWidth = 6;

const operations = ["+", "-", "x", "/"];

let score = 0;
let wandHealth = 50;
let currBlob = null;
let blobBeamInterval = null;

const emitBeam = () => {
  if (currBlob === null) return;

  const beam = document.createElement("div");
  beam.classList.add("blob-beam");
  beam.style.left = `${
    currBlob.blob.offsetLeft + currBlob.blob.offsetWidth / 2
  }px`;
  beam.style.top = `${
    currBlob.blob.offsetTop + currBlob.blob.offsetHeight / 2
  }px`;

  blobContainer.appendChild(beam);

  const wandPosition = coords(wand, 65);

  const deltaX =
    wandPosition[0] -
    (currBlob.blob.offsetLeft + currBlob.blob.offsetWidth / 2);

  const deltaY =
    wandPosition[1] -
    (currBlob.blob.offsetTop + currBlob.blob.offsetHeight / 2);

  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  const beamSpeed = 0.01;

  const animate = () => {
    if (beam.parentNode === null) return;

    const x = parseFloat(beam.style.left);
    const y = parseFloat(beam.style.top);

    if (
      Math.abs(x - wandPosition[0]) < 1 &&
      Math.abs(y - wandPosition[1]) < 1
    ) {
      wandHealth--;
      if (wandHealth === 0) {
        clearInterval(blobBeamInterval);
        throw new Error("Game Over");
      }
      beam.remove();
      return;
    }

    const angle = Math.atan2(deltaY, deltaX);
    const vx = Math.cos(angle) * beamSpeed * distance;
    const vy = Math.sin(angle) * beamSpeed * distance;

    beam.style.left = `${x + vx}px`;
    beam.style.top = `${y + vy}px`;

    requestAnimationFrame(animate);
  };

  animate();
};

const genQ = () => {
  const a = 1 + Math.floor(Math.random() * 10);
  const b = 1 + Math.floor(Math.random() * 10);
  const op = operations[Math.floor(Math.random() * 4)];
  question.textContent = `${a}${op}${b}`;
};

const initBlob = () => {
  blobContainer.innerHTML = "";
  const scale = 0.5 + Math.random() * 2;
  const rotation = Math.random() * Math.PI;
  const left = Math.floor(Math.random() * document.body.offsetWidth);
  const top = Math.floor(Math.random() * document.body.offsetHeight);

  const blob = document.createElement("div");
  blob.classList.add("blob");
  blob.style.transform = `scale(${scale}) rotate(${rotation}rad)`;
  blob.style.left = `${left}px`;
  blob.style.top = `${top}px`;

  blobContainer.appendChild(blob);

  currBlob = {
    blob: blob,
    health: scale * 100,
  };
};

const coords = (el, offset = 0) => [
  el.offsetLeft + offset,
  el.offsetTop + offset,
];

const animateBeam = () => {
  ctx.beginPath();
  ctx.moveTo(...coords(wand, 65));
  ctx.lineTo(...coords(currBlob.blob, currBlob.blob.offsetWidth / 2));
  ctx.closePath();

  ctx.stroke();

  setTimeout(
    () => ctx.clearRect(0, 0, beamCanvas.width, beamCanvas.height),
    250
  );
};

const incrementScore = () => {
  scoreEl.textContent = ++score;
};

const submitAnswer = () => {
  const answer = parseInt(answerInput.value);
  const correctAnswer = Math.floor(
    eval(question.textContent.replace("x", "*"))
  );
  if (answer === correctAnswer) {
    genQ();
    animateBeam();
    answerInput.value = "";

    currBlob.health -= (correctAnswer.toString().length * 100) / 4;
    if (currBlob.health < 0) {
      incrementScore();
      initBlob();
    }
  } else {
    // TODO
  }
};

const init = () => {
  answerInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") submitAnswer();
  });

  submitBtn.addEventListener("click", submitAnswer);

  initBlob();
  genQ();

  blobBeamInterval = setInterval(emitBeam, 500);
};

init();

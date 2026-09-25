// Configuração do Endpoint da API
const API_URL = 'http://localhost:3000/api/pontuacoes';

// Elementos do DOM
const imgMosquito = document.getElementById("mosquito");
const virtualCursor = document.getElementById("virtual-cursor");
const videoElement = document.getElementById("webcam");

const screenStart = document.getElementById("screen-start");
const screenGameOver = document.getElementById("screen-gameover");
const hud = document.getElementById("hud");

const inputNickname = document.getElementById("input-nickname");
const btnStart = document.getElementById("btn-start");
const btnRestart = document.getElementById("btn-restart");

const hudNickname = document.getElementById("hud-nickname");
const hudScore = document.getElementById("hud-score");
const hudLives = document.getElementById("hud-lives");

const goNickname = document.getElementById("go-nickname");
const goScore = document.getElementById("go-score");
const apiStatus = document.getElementById("api-status");
const cameraStatus = document.getElementById("camera-status");

// Estado da Partida
let gameState = {
  nickname: 'Player',
  score: 0,
  misses: 0,
  maxMisses: 3,
  isPlaying: false,
  mosquitoTimer: null,
  isHandClosed: false,
  handX: 0,
  handY: 0
};

// --- ESTRUTURA DO MEDIAPIPE HANDS ---
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.6,
  minTrackingConfidence: 0.6
});

hands.onResults(onHandResults);

// Processamento dos pontos de referência da mão
function onHandResults(results) {
  if (!gameState.isPlaying || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    virtualCursor.classList.add("hidden");
    return;
  }

  virtualCursor.classList.remove("hidden");
  const landmarks = results.multiHandLandmarks[0];

  // Coordenadas invertidas no eixo X (espelhamento da webcam)
  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];

  // Converter coordenadas normalizadas (0 a 1) para pixels na janela
  const screenX = (1 - indexTip.x) * window.innerWidth;
  const screenY = indexTip.y * window.innerHeight;

  gameState.handX = screenX;
  gameState.handY = screenY;

  // Atualiza posição do cursor virtual na tela
  virtualCursor.style.left = `${screenX}px`;
  virtualCursor.style.top = `${screenY}px`;

  // Calcular distância entre Indicador (8) e Polegar (4) em 3D
  const distance = Math.hypot(
    indexTip.x - thumbTip.x,
    indexTip.y - thumbTip.y,
    indexTip.z - thumbTip.z
  );

  // Limiar de disparo de clique (Mão Fechada / Pinça)
  const PINCH_THRESHOLD = 0.08;

  if (distance < PINCH_THRESHOLD) {
    if (!gameState.isHandClosed) {
      gameState.isHandClosed = true;
      virtualCursor.classList.add("clicking");
      executarCliqueVirtual(screenX, screenY);
    }
  } else {
    gameState.isHandClosed = false;
    virtualCursor.classList.remove("clicking");
  }
}

// Simula acerto do clique sobre a hitbox do mosquito
function executarCliqueVirtual(x, y) {
  if (!gameState.isPlaying) return;

  const rect = imgMosquito.getBoundingClientRect();

  if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
    eliminarMosquito();
  }
}

// --- MECÂNICA DO JOGO ---

function mudarPosicaoMosquito() {
  if (!gameState.isPlaying) return;

  // Se o mosquito já estiver visível e a posição for trocada, conta como um erro
  if (!imgMosquito.classList.contains("hidden")) {
    registrarErro();
    if (!gameState.isPlaying) return;
  }

  const topPos = Math.max(100, Math.ceil(Math.random() * (window.innerHeight - 180)));
  const leftPos = Math.max(50, Math.ceil(Math.random() * (window.innerWidth - 150)));

  imgMosquito.style.top = `${topPos}px`;
  imgMosquito.style.left = `${leftPos}px`;
  imgMosquito.classList.remove("hidden");
}

function eliminarMosquito() {
  if (!gameState.isPlaying) return;

  gameState.score += 1;
  hudScore.textContent = gameState.score;

  imgMosquito.classList.add("hidden");

  // Reinicia o temporizador do mosquito após ser atingido
  clearInterval(gameState.mosquitoTimer);
  mudarPosicaoMosquito();
  gameState.mosquitoTimer = setInterval(mudarPosicaoMosquito, 2500);
}

function registrarErro() {
  gameState.misses += 1;
  atualizarCoracoes();

  if (gameState.misses >= gameState.maxMisses) {
    encerrarJogo();
  }
}

function atualizarCoracoes() {
  let heartsHTML = '';
  for (let i = 0; i < gameState.maxMisses; i++) {
    if (i < gameState.maxMisses - gameState.misses) {
      heartsHTML += '<i class="fa-solid fa-heart"></i>';
    } else {
      heartsHTML += '<i class="fa-regular fa-heart opacity-30 text-slate-500"></i>';
    }
  }
  hudLives.innerHTML = heartsHTML;
}

// Suporte para cliques com o mouse físico padrão
imgMosquito.addEventListener("click", eliminarMosquito);

// --- INICIALIZAÇÃO E INTEGRAÇÃO DA CÂMERA ---

btnStart.addEventListener("click", async () => {
  const name = inputNickname.value.trim();
  gameState.nickname = name.length > 0 ? name : "Player";

  cameraStatus.classList.remove("hidden");
  btnStart.disabled = true;

  try {
    const camera = new Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 640,
      height: 480
    });

    await camera.start();
    iniciarPartida();
  } catch (err) {
    alert("Não foi possível acessar a webcam. Verifique as permissões!");
    btnStart.disabled = false;
    cameraStatus.classList.add("hidden");
  }
});

function iniciarPartida() {
  gameState.score = 0;
  gameState.misses = 0;
  gameState.isPlaying = true;

  hudNickname.textContent = gameState.nickname;
  hudScore.textContent = "0";
  atualizarCoracoes();

  screenStart.classList.add("hidden");
  screenGameOver.classList.add("hidden");
  hud.classList.remove("hidden");

  mudarPosicaoMosquito();
  gameState.mosquitoTimer = setInterval(mudarPosicaoMosquito, 2500);
}

function encerrarJogo() {
  gameState.isPlaying = false;
  clearInterval(gameState.mosquitoTimer);

  imgMosquito.classList.add("hidden");
  virtualCursor.classList.add("hidden");

  goNickname.textContent = gameState.nickname;
  goScore.textContent = gameState.score;

  screenGameOver.classList.remove("hidden");

  salvarPontuacaoAPI(gameState.nickname, gameState.score);
}

// Registrar pontuação na API Node.js / MySQL
async function salvarPontuacaoAPI(nickname, pontos) {
  apiStatus.textContent = "Enviando pontuação...";
  apiStatus.className = "text-xs font-semibold text-amber-400";

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, pontos })
    });

    if (response.ok) {
      apiStatus.textContent = "Pontuação salva no ranking com sucesso!";
      apiStatus.className = "text-xs font-semibold text-emerald-400";
    } else {
      throw new Error("Falha na resposta da API");
    }
  } catch (error) {
    apiStatus.textContent = "Servidor offline. Pontuação não registrada.";
    apiStatus.className = "text-xs font-semibold text-red-400";
  }
}

btnRestart.addEventListener("click", iniciarPartida);
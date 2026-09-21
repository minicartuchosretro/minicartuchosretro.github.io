// --- REGISTRO DEL SERVICE WORKER ---
if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');

// --- VARIABLES GLOBALES ---
const params = new URLSearchParams(window.location.search);
const gameId = params.get("game");
const isPlaying = params.get("play") === "true";

// --- INSTALACIÓN PWA (CON SOPORTE PARA IPHONE) ---
let deferredPrompt = null;
const installBtn = document.getElementById('pwa-install-btn');
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
  if (installBtn) installBtn.style.display = 'none';
} else if (isIOS && !gameId) {
  if (installBtn) installBtn.style.display = 'flex';
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault(); deferredPrompt = e;
  if (installBtn && !gameId && !isIOS) installBtn.style.display = 'flex';
});

async function triggerPwaInstall() {
  if (isIOS) {
    showToast("🍎 En iPhone: Toca el botón 'Compartir' (abajo al centro) y elige 'Agregar a inicio'", 5500);
  } else if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted' && installBtn) installBtn.style.display = 'none';
    deferredPrompt = null;
  } else {
    showToast("ℹ️ Toca los tres puntos (⋮) del navegador y selecciona 'Instalar aplicación'", 4500);
  }
}

window.addEventListener('appinstalled', () => {
  if (installBtn) installBtn.style.display = 'none';
  deferredPrompt = null;
  showToast("✅ ¡Mini Retro Cartuchos instalada con éxito!", 3000);
});

// --- SISTEMA DE DESBLOQUEO ---
let unlockedGames = JSON.parse(localStorage.getItem('retroc_unlocked') || '[]');

if (gameId && GAMES[gameId] && !unlockedGames.includes(gameId)) {
  unlockedGames.push(gameId);
  localStorage.setItem('retroc_unlocked', JSON.stringify(unlockedGames));
  sessionStorage.setItem('newly_unlocked', gameId);
  
  const isSecret = GAMES[gameId].hidden;
  const overlayIcon = document.getElementById('unlock-icon');
  const overlayText = document.getElementById('unlock-text');
  const overlay = document.getElementById('unlock-overlay');
  
  if (overlayIcon && overlayText && overlay) {
    if (isSecret) {
      // Estilo Zelda Épico
      overlayIcon.innerText = "🗡️"; 
      overlayText.innerText = "¡Has descubierto un Cartucho Legendario!";
      overlayIcon.style.textShadow = "0 0 40px #fef08a";
      overlayText.style.textShadow = "0 0 25px #fef08a";
      overlayText.style.color = "#4ade80"; // Verde místico
      
      const secretAudio = new Audio('./secret.mp3');
      secretAudio.play().catch(e => console.log("Audio bloqueado por el navegador", e));
      
      overlay.classList.add('show-secret');
      if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 800]); // Vibración épica
      setTimeout(() => overlay.classList.remove('show-secret'), 4500);
      
    } else {
      // Estilo Cartucho Normal
      overlayIcon.innerText = "✨";
      overlayText.innerText = "¡Cartucho Encontrado!";
      overlayIcon.style.textShadow = "0 0 20px #fbbf24";
      overlayText.style.textShadow = "0 0 15px #fbbf24";
      overlayText.style.color = "#fff";

      const normalAudio = new Audio('./normal.mp3');
      normalAudio.play().catch(e => console.log("Audio bloqueado por el navegador", e));
      
      overlay.classList.add('show-normal');
      if (navigator.vibrate) navigator.vibrate([100, 150, 100, 150]);
      setTimeout(() => overlay.classList.remove('show-normal'), 2200);
    }
  }
}

checkCollectionRewards();

function checkCollectionRewards() {
  const collections = {};
  Object.keys(GAMES).forEach(key => {
    const g = GAMES[key];
    if (g.collection && !g.hidden) {
      if (!collections[g.collection]) collections[g.collection] = [];
      collections[g.collection].push(key);
    }
  });

  Object.keys(collections).forEach(collName => {
    const allUnlocked = collections[collName].every(k => unlockedGames.includes(k));
    if (allUnlocked) {
      Object.keys(GAMES).forEach(rKey => {
        const rewardGame = GAMES[rKey];
        if (rewardGame.reward && rewardGame.requiredCollection === collName) {
          if (!unlockedGames.includes(rKey)) {
            unlockedGames.push(rKey);
            localStorage.setItem('retroc_unlocked', JSON.stringify(unlockedGames));
            sessionStorage.setItem('newly_unlocked', rKey);
            
            // Sonido de Colección Completada
            setTimeout(() => {
              const collAudio = new Audio('./collection.mp3');
              collAudio.play().catch(e => console.log("Audio bloqueado", e));
              showToast(`🎉 ¡Colección "${collName}" completada! Se ha desbloqueado una sorpresa.`, 6000);
            }, 1000);
          }
        }
      });
    }
  });
}

// --- RUTAS Y NAVEGACIÓN ---
if (!gameId) {
  document.getElementById('hub-view').classList.add('active-view');
  renderHub();
} else if (gameId && !isPlaying) {
  document.getElementById('info-view').classList.add('active-view');
  renderInfo();
} else if (gameId && isPlaying) {
  document.getElementById('emulator-view').classList.add('active-view');
  if (typeof initEmulator === "function") initEmulator();
}

function switchTab(tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active-tab-content'));
  document.getElementById(`tab-${tabId}`).classList.add('active');
  document.getElementById(`view-${tabId}`).classList.add('active-tab-content');
}

function renderHub() {
  const unlockedContainer = document.getElementById('unlocked-list');
  const lockedContainer = document.getElementById('locked-list');
  const vaultContainer = document.getElementById('vault-list');
  const vaultTab = document.getElementById('tab-vault');
  
  unlockedContainer.innerHTML = ''; lockedContainer.innerHTML = ''; vaultContainer.innerHTML = '';
  let uCount = 0; let lCount = 0; let vCount = 0;

  Object.keys(GAMES).forEach(key => {
    const game = GAMES[key];
    const isUnlocked = unlockedGames.includes(key);
    const card = document.createElement('div');
    card.id = `card-${key}`;

    if (game.hidden) {
      if (isUnlocked) {
        vCount++; card.className = 'game-card card-vault';
        card.onclick = () => window.location.href = `?game=${key}`;
        card.innerHTML = `<img class="card-thumb" src="${game.icon}" alt="${game.title}"><div class="card-details"><span class="card-name">${game.title}</span><span class="card-subtext">${game.reward ? '⭐ Recompensa de Colección' : '✨ Cartucho Secreto'}</span></div><span style="color:#fbbf24; font-size:1.2rem;">▶</span>`;
        vaultContainer.appendChild(card);
      }
      return; 
    }

    if (isUnlocked) {
      uCount++; card.className = 'game-card';
      card.onclick = () => window.location.href = `?game=${key}`;
      card.innerHTML = `<img class="card-thumb" src="${game.icon}" alt="${game.title}"><div class="card-details"><span class="card-name">${game.title}</span><span class="card-subtext">${game.collection ? game.collection : 'Toca para ver detalles'}</span></div><span style="color:#4ade80; font-size:1.2rem;">▶</span>`;
      unlockedContainer.appendChild(card);
    } else {
      lCount++; card.className = 'game-card card-locked';
      card.onclick = () => showToast("🔒 Escanea el cartucho NFC físico para desbloquear", 3000);
      card.innerHTML = `<img class="card-thumb" src="${game.icon}" alt="${game.title}"><div class="card-details"><span class="card-name">${game.title}</span><span class="card-subtext">${game.collection ? game.collection + ' • ' : ''}Bloqueado</span></div><span style="color:#52525b; font-size:1.1rem;">🔒</span>`;
      lockedContainer.appendChild(card);
    }
  });

  document.getElementById('count-unlocked').innerText = uCount;
  document.getElementById('count-locked').innerText = lCount;
  document.getElementById('count-vault').innerText = vCount;
  vaultTab.style.display = vCount > 0 ? 'block' : 'none';

  if (uCount === 0) unlockedContainer.innerHTML = '<div class="empty-message">No tienes cartuchos desbloqueados aún.<br><br>¡Acerca uno a tu teléfono para empezar!</div>';
  if (lCount === 0) lockedContainer.innerHTML = '<div class="empty-message">¡Felicidades! Tienes todos los cartuchos del catálogo desbloqueados.</div>';

  setTimeout(() => {
    const newlyUnlocked = sessionStorage.getItem('newly_unlocked');
    if (newlyUnlocked) {
      const targetCard = document.getElementById(`card-${newlyUnlocked}`);
      if (targetCard) {
        if (GAMES[newlyUnlocked].hidden) switchTab('vault');
        else switchTab('unlocked');
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('card-pulse');
        setTimeout(() => { targetCard.classList.remove('card-pulse'); }, 6000);
      }
      sessionStorage.removeItem('newly_unlocked');
    }
  }, 300);
}

// --- EASTER EGG (LOGO) ---
let logoClicks = 0; let clickTimer = null; const logoEl = document.getElementById('secret-logo');
if (logoEl) {
  logoEl.addEventListener('click', () => {
    logoClicks++; clearTimeout(clickTimer); clickTimer = setTimeout(() => { logoClicks = 0; }, 2500);
    if (logoClicks >= 5) {
      logoClicks = 0; if (navigator.vibrate) navigator.vibrate([80, 50, 80, 50, 150]);
      showToast(PISTAS_SECRETAS[Math.floor(Math.random() * PISTAS_SECRETAS.length)], 5500);
    }
  });
}

function renderInfo() {
  const game = GAMES[gameId];
  if(!game) { goHome(); return; }
  document.getElementById('info-cover').src = game.icon;
  document.getElementById('info-title').innerText = game.title;
  document.getElementById('info-desc').innerText = game.desc;
}

function startGame() { window.location.href = `?game=${gameId}&play=true`; }
function goHome() { window.location.href = `./`; }

function showToast(text, duration) {
  let t = document.createElement('div'); t.innerText = text;
  t.style.cssText = "position:fixed; top:70px; left:50%; transform:translateX(-50%); background:rgba(15,15,18,0.95); color:#fff; padding:12px 20px; border-radius:24px; z-index:9999999; font-weight:bold; font-size:13.5px; text-align:center; box-shadow:0 4px 14px rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.15); transition:opacity 0.3s; width:85%; max-width:360px;";
  document.body.appendChild(t); setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, duration);
}

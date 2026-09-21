// --- INICIALIZACIÓN DEL EMULADOR ---
function initEmulator() {
  const selected = GAMES[gameId];
  if (!selected) { document.getElementById("msg").innerHTML = "Error al cargar"; return; }

  // 1. Mostrar la frase aleatoria inmediatamente
  document.getElementById("msg").innerText = FRASES_CARGA[Math.floor(Math.random() * FRASES_CARGA.length)];

  // 2. Esperar 2 segundos (2000 milisegundos) antes de cargar el juego
  setTimeout(() => {
    window.EJS_player = '#display'; 
    window.EJS_core = selected.system; 
    window.EJS_gameUrl = selected.rom;
    window.EJS_gameName = selected.title; 
    window.EJS_startOnLoaded = true; 
    window.EJS_pathtodata = 'https://cdn.emulatorjs.org/stable/data/';

    document.addEventListener('touchstart', function(e) {
      let target = e.target;
      while (target && target !== document.body) {
        const cls = (target.className || '').toString().toLowerCase(); 
        const elemId = (target.id || '').toString().toLowerCase();
        if (cls.includes('button') || cls.includes('dpad') || cls.includes('direction') || cls.includes('up') || cls.includes('down') || cls.includes('left') || cls.includes('right') || elemId.includes('button') || elemId.includes('dpad')) {
          if (navigator.vibrate) navigator.vibrate(15); break;
        }
        target = target.parentNode;
      }
    }, { passive: true });

    function styleBtn(el, bg, border, textColor = '#ffffff') {
      el.style.setProperty('background', bg, 'important'); el.style.setProperty('border', border, 'important');
      el.style.setProperty('color', textColor, 'important'); el.style.setProperty('text-shadow', '0 1px 2px rgba(0,0,0,0.8)', 'important');
      el.querySelectorAll('*').forEach(child => { child.style.setProperty('color', textColor, 'important'); child.style.setProperty('fill', textColor, 'important'); });
    }

    const observer = new MutationObserver(() => {
      document.querySelectorAll('div, button, span').forEach(el => {
        const cls = (el.className || '').toString().toLowerCase(); const elemId = (el.id || '').toString().toLowerCase();
        const txt = (el.innerText || el.textContent || '').trim().toUpperCase(); const isDpad = cls.includes('dpad') || elemId.includes('dpad') || cls.includes('direction') || cls.includes('joystick') || cls.includes('up') || cls.includes('down') || cls.includes('left') || cls.includes('right');
        
        if (cls.includes('button-a') || elemId.includes('button-a') || txt === 'A') styleBtn(el, 'rgba(230, 57, 70, 0.88)', '2px solid #9e1c11', '#ffffff');
        else if (cls.includes('button-b') || elemId.includes('button-b') || txt === 'B') styleBtn(el, 'rgba(255, 183, 3, 0.88)', '2px solid #b28300', '#ffffff');
        else if (cls.includes('button-x') || elemId.includes('button-x') || txt === 'X') styleBtn(el, 'rgba(29, 112, 184, 0.88)', '2px solid #144b7d', '#ffffff');
        else if (cls.includes('button-y') || elemId.includes('button-y') || txt === 'Y') styleBtn(el, 'rgba(42, 157, 143, 0.88)', '2px solid #1c6b60', '#ffffff');
        else if (!isDpad && (cls.includes('button-l') || txt === 'L' || txt === 'L1' || cls.includes('button-r') || txt === 'R' || txt === 'R1')) styleBtn(el, 'rgba(153, 153, 161, 0.85)', '2px solid #777780', '#ffffff');
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const s = document.createElement('script'); 
    s.src = 'https://cdn.emulatorjs.org/stable/data/loader.js';
    s.onload = () => { 
      document.getElementById('msg').style.display = 'none'; 
      showToast("👆 Toca '⛶ Pantalla' arriba a la derecha para iniciar", 5000); 
    };
    document.body.appendChild(s); 
    initDB();
  }, 2000); // Fin del tiempo de espera
}

// --- GUARDADO LOCAL ---
let savesDB;
function initDB() {
  const dbReq = indexedDB.open("RetroC_SavesDB", 1);
  dbReq.onupgradeneeded = e => { if (!e.target.result.objectStoreNames.contains("states")) e.target.result.createObjectStore("states"); };
  dbReq.onsuccess = e => { savesDB = e.target.result; };
}

async function quickSave() {
  if (window.EJS_emulator && window.EJS_emulator.gameManager && savesDB) {
    try {
      const state = await window.EJS_emulator.gameManager.getState(); savesDB.transaction("states", "readwrite").objectStore("states").put(state, gameId);
      showToast("💾 Partida Guardada", 2000); if (navigator.vibrate) navigator.vibrate(30);
    } catch (e) { showToast("❌ Error al guardar", 2000); }
  }
}

async function quickLoad() {
  if (window.EJS_emulator && window.EJS_emulator.gameManager && savesDB) {
    try {
      savesDB.transaction("states", "readonly").objectStore("states").get(gameId).onsuccess = async e => {
        if (e.target.result) { await window.EJS_emulator.gameManager.loadState(e.target.result); showToast("📂 Partida Cargada", 2000); if (navigator.vibrate) navigator.vibrate(30); }
        else showToast("❌ No hay partida guardada", 2000);
      };
    } catch (e) { showToast("❌ Error al cargar", 2000); }
  }
}

function toggleFullScreen() {
  const elem = document.documentElement; const btn = document.getElementById('fs-btn');
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    if (elem.requestFullscreen) elem.requestFullscreen(); else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    btn.innerText = '✕ Salir FC';
  } else {
    if (document.exitFullscreen) document.exitFullscreen(); else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    btn.innerText = '⛶ Pantalla';
  }
}

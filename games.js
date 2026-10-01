const GAMES = {
  // COLECCIÓN 1: TRILOGÍA KONG (SNES)
  "dkc1": { 
    title: "Donkey Kong Country", 
    rom: "./roms/dkc1.smc", 
    system: "snes", 
    icon: "./icons/dkc1.png",
    collection: "Trilogía DK", 
    desc: "Acompaña a Donkey Kong y Diddy Kong en una aventura revolucionaria para recuperar su reserva de bananas."
  },
  "dkc2": { 
    title: "Donkey Kong Country 2", 
    rom: "./roms/dkc2.sfc", 
    system: "snes", 
    icon: "./icons/dkc2.png",
    collection: "Trilogía DK", 
    desc: "¡Diddy y Dixie al rescate! Explora los peligros de la Isla Cocodrilo y enfréntate al Capitán K. Rool."
  },
  "dkc3": { 
    title: "Donkey Kong Country 3", 
    rom: "./roms/dkc3.sfc", 
    system: "snes", 
    icon: "./icons/dkc3.png",
    collection: "Trilogía DK",
    desc: "Dixie y el pequeño Kiddy Kong se adentran en el misterioso Kremisferio Norte en el cierre de la trilogía."
  },

  // PREMIO AUTOMÁTICO DE COLECCIÓN
  "mario_world": { 
    title: "Super Mario World", 
    rom: "./roms/smw.smc", 
    system: "snes", 
    icon: "./icons/smw.png",
    hidden: true,
    reward: true,
    requiredCollection: "Trilogía DK",
    desc: "¡Felicidades por completar la Trilogía DK! Como recompensa, has desbloqueado este clásico legendario."
  },

  // GAME BOY ADVANCE (GBA)
  "metroid_zm": {
    title: "Metroid: Zero Mission",
    rom: "./roms/metroid_zm.gba",
    system: "gba",
    icon: "./icons/metroid_zm.png",
    desc: "Revive la primera misión de Samus Aran en el planeta Zebes con gráficos y habilidades renovadas."
  },

  // CARTUCHO SECRETO FÍSICO (LA BÓVEDA)
  "doom": { 
    title: "DOOM", 
    rom: "./roms/doom.sfc", 
    system: "snes", 
    icon: "./icons/doom.png",
    hidden: true,
    desc: "El clásico shooter que definió el género. Enfréntate a las hordas demoníacas en las instalaciones de Marte."
  }
};

const MAX_TRIES = 5;
const STRIPE_PREMIUM_URL = "https://stripe.com/payments/checkout";

const tabButtons = document.querySelectorAll(".tab-btn");
const panels = {
  roblox: document.getElementById("panel-roblox"),
  discord: document.getElementById("panel-discord"),
};

const toastEl = document.getElementById("toast");
const premiumModal = document.getElementById("premium-modal");
const premiumYes = document.getElementById("premium-yes");
const premiumNo = document.getElementById("premium-no");

const generatorState = {
  roblox: {
    triesUsed: 0,
    lastName: "",
    resultEl: document.getElementById("roblox-result"),
    triesEl: document.getElementById("roblox-tries"),
    actionsEl: document.getElementById("roblox-actions"),
    generateBtn: document.getElementById("roblox-generate"),
    copyBtn: document.getElementById("roblox-copy"),
    retryBtn: document.getElementById("roblox-retry"),
  },
  discord: {
    triesUsed: 0,
    lastName: "",
    resultEl: document.getElementById("discord-result"),
    triesEl: document.getElementById("discord-tries"),
    actionsEl: document.getElementById("discord-actions"),
    generateBtn: document.getElementById("discord-generate"),
    copyBtn: document.getElementById("discord-copy"),
    retryBtn: document.getElementById("discord-retry"),
  },
};

const namePools = {
  roblox: {
    prefixes: ["Pixel", "Nova", "Turbo", "Shadow", "Aero", "Blaze", "Orbit", "Frost", "Vortex", "Flare"],
    cores: ["Rider", "Knight", "Crafter", "Scout", "Builder", "Hunter", "Pilot", "Sprinter", "Phantom", "Wizard"],
    endings: ["X", "Zone", "Dash", "Playz", "9000", "Byte", "Flux", "Prime", "Arc", "GG"],
  },
  discord: {
    prefixes: ["neon", "echo", "void", "lunar", "cipher", "drift", "atomic", "fable", "glitch", "night"],
    cores: ["fox", "pulse", "agent", "stream", "pirate", "wizard", "ronin", "spark", "raven", "myst"],
    endings: [".gg", "_tv", "x", ".exe", "_01", "live", "_core", "hub", "bot", "lab"],
  },
};

let modalContext = "roblox";

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function aiGenerateName(type) {
  const pool = namePools[type];
  const style = Math.random();

  // Light-weight client-side AI style blend: it combines learned-like chunks.
  if (style < 0.33) {
    return `${pick(pool.prefixes)}${pick(pool.cores)}${Math.floor(Math.random() * 99)}`;
  }

  if (style < 0.66) {
    return `${pick(pool.prefixes)}_${pick(pool.cores)}${pick(pool.endings)}`;
  }

  return `${pick(pool.prefixes)}${pick(pool.cores)}${pick(pool.endings)}`;
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.setTimeout(() => {
    toastEl.classList.remove("show");
  }, 1600);
}

function updateTriesUI(type) {
  const state = generatorState[type];
  const left = Math.max(MAX_TRIES - state.triesUsed, 0);
  state.triesEl.textContent = `Tries left: ${left}/5`;
}

function openPremiumModal(type) {
  modalContext = type;
  premiumModal.hidden = false;
}

function closePremiumModal() {
  premiumModal.hidden = true;
}

function generateFor(type) {
  const state = generatorState[type];

  if (state.triesUsed >= MAX_TRIES) {
    openPremiumModal(type);
    return;
  }

  const generated = aiGenerateName(type);
  state.lastName = generated;
  state.triesUsed += 1;
  state.resultEl.textContent = generated;
  state.actionsEl.hidden = false;
  updateTriesUI(type);

  if (state.triesUsed >= MAX_TRIES) {
    showToast("No tries left. Premium unlocks unlimited names.");
  }
}

async function copyName(type) {
  const state = generatorState[type];
  if (!state.lastName) return;

  try {
    await navigator.clipboard.writeText(state.lastName);
    showToast("Copied to clipboard");
  } catch {
    showToast("Copy blocked by browser");
  }
}

function switchTab(type) {
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === type);
  });

  Object.keys(panels).forEach((key) => {
    panels[key].classList.toggle("active", key === type);
  });
}

function wireGenerator(type) {
  const state = generatorState[type];
  state.generateBtn.addEventListener("click", () => generateFor(type));
  state.retryBtn.addEventListener("click", () => generateFor(type));
  state.copyBtn.addEventListener("click", () => copyName(type));
}

premiumYes.addEventListener("click", () => {
  closePremiumModal();
  showToast("Opening Stripe checkout...");
  window.open(STRIPE_PREMIUM_URL, "_blank", "noopener,noreferrer");
});

premiumNo.addEventListener("click", () => {
  closePremiumModal();
  showToast("Premium skipped");
});

premiumModal.addEventListener("click", (event) => {
  if (event.target === premiumModal) {
    closePremiumModal();
  }
});

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    switchTab(btn.dataset.tab);
  });
});

wireGenerator("roblox");
wireGenerator("discord");
updateTriesUI("roblox");
updateTriesUI("discord");

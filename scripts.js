const DOM = {
  loginPage: document.getElementById('loginPage'),
  mainPage: document.getElementById('mainPage'),
  adminPanel: document.getElementById('adminPanel'),
  // ... otros elementos frecuentemente usados
};

const character = {
  attributes: {
    fuerza: 10,
    inteligencia: 10,
    agilidad: 10,
    metabolismo: 10,
    am: 10
  },
  baseHealth: 10,
  currentHealth: 10,
  experience: 0,
  level: 1,
  baseArmor: 10,
  armor: 10,
  baseMistyculas: 10,
  currentMistyculas: 10,
  maxMistyculas: 10,
  actions: { action: 1 },
  skills: [],
  spells: [],
  pets: [],
  items: []
};

const expTable = [
  { level: 1, exp: 0 },
  { level: 2, exp: 300 },
  //... hasta nivel 20
];

const EventSystem = {
  events: {},
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  },
  emit(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach(callback => callback(data));
    }
  }
};

// Funciones principales
function sanitizeInput(input) {
  return input.replace(/[<>]/g, '').trim();
}

function login() {
  const username = sanitizeInput(document.getElementById("username").value.trim());
  const password = sanitizeInput(document.getElementById("password").value.trim());
  if(username === "admin" && password === "admin") {
    localStorage.setItem("role", "admin");
    showMain();
  } else if(username && password) {
    localStorage.setItem("role", "user");
    showMain();
  } else {
    alert("Ingrese credenciales válidas.");
  }
}

// ... Resto de las funciones JavaScript ...
// Copia el resto de las funciones del script original

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Inicialización cuando el DOM está listo
  cargarEstadoPersonaje();
});

// Modal event listener
modalSaveBtn.addEventListener("click", function() {
  if(modalCallback) modalCallback();
  closeModal();
});

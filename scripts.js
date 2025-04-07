// Simple login simulation
function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    // Hardcoded credentials: admin/admin for admin role
    if (username === "admin" && password === "admin") {
      localStorage.setItem("role", "admin");
      showMain();
    } else if (username && password) {
      localStorage.setItem("role", "user");
      showMain();
    } else {
      alert("Ingrese credenciales válidas.");
    }
  }
  
  function showMain() {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("mainPage").style.display = "block";
    resetAcciones();
    actualizarTodo();
    if (localStorage.getItem("role") === "admin") {
      document.getElementById("adminPanel").style.display = "block";
    }
  }
  
  // Admin function to simulate user creation (dummy function)
  function crearUsuario() {
    let newUser = prompt("Ingrese el nombre del nuevo usuario:");
    if (newUser) {
      alert("Usuario '" + newUser + "' creado (simulación).");
    }
  }
  
  // Character sheet functions
  function calcularMod(valor) {
    return Math.floor((valor - 10) / 2);
  }
  function actualizarAtributos() {
    document.getElementById("modFuerza").textContent = calcularMod(character.attributes.fuerza);
    document.getElementById("modInt").textContent = calcularMod(character.attributes.inteligencia);
    document.getElementById("modAgil").textContent = calcularMod(character.attributes.agilidad);
    document.getElementById("modMetab").textContent = calcularMod(character.attributes.metabolismo);
    document.getElementById("modAM").textContent = calcularMod(character.attributes.am);
  }
  function actualizarNivelXP() {
    let lvl = 1, baseXP = 0;
    for (let i = 0; i < expTable.length; i++) {
      if (character.experience >= expTable[i].exp) {
        lvl = expTable[i].level;
        baseXP = expTable[i].exp;
      } else break;
    }
    character.level = lvl;
    const next = expTable.find(e => e.level === lvl + 1);
    const xpExcess = character.experience - baseXP;
    const xpNeeded = next ? next.exp - baseXP : 0;
    document.getElementById("calcXP").textContent = xpExcess + " / " + xpNeeded;
    document.getElementById("calcNivel").textContent = character.level + " / 20";
  }
  function actualizarVida() {
    const modMet = calcularMod(character.attributes.metabolismo);
    character.maxHealth = Math.floor(character.baseHealth * character.level * (modMet > 0 ? modMet : 1));
    if (character.currentHealth > character.maxHealth) character.currentHealth = character.maxHealth;
    document.getElementById("calcVida").textContent = character.currentHealth + " / " + character.maxHealth;
  }
  function actualizarArmor() {
    const modAgil = calcularMod(character.attributes.agilidad);
    const modMet = calcularMod(character.attributes.metabolismo);
    character.armor = character.baseArmor + modAgil + modMet;
    document.getElementById("calcArmor").textContent = character.armor;
  }
  function actualizarMistyculas() {
    const modInt = calcularMod(character.attributes.inteligencia);
    const modAM = calcularMod(character.attributes.am);
    character.maxMistyculas = character.baseMistyculas * (modInt > 0 ? modInt : 1) * (modAM > 0 ? modAM : 1);
    if (character.currentMistyculas > character.maxMistyculas) character.currentMistyculas = character.maxMistyculas;
    document.getElementById("calcMistyculas").textContent = character.currentMistyculas + " / " + character.maxMistyculas;
  }
  function actualizarAcciones() {
    document.getElementById("accionesDisplay").textContent = "Acciones restantes: " + character.actions.action;
  }
  function resetAcciones() {
    const modAgil = calcularMod(character.attributes.agilidad);
    character.actions.action = character.level + modAgil + 1;
    actualizarAcciones();
  }
  function actualizarTodo() {
    actualizarAtributos();
    actualizarNivelXP();
    actualizarVida();
    actualizarArmor();
    actualizarMistyculas();
    actualizarAcciones();
  }
  function agregarXP() {
    const xp = parseInt(document.getElementById("inputXP").value);
    if (isNaN(xp) || xp < 0) return;
    character.experience += xp;
    actualizarTodo();
  }
  function aplicarDaño() {
    const dmg = parseInt(document.getElementById("inputDamage").value);
    if (isNaN(dmg) || dmg < 0) return;
    character.currentHealth -= dmg;
    if (character.currentHealth < 0) character.currentHealth = 0;
    actualizarVida();
  }
  function aplicarCura() {
    const cura = parseInt(document.getElementById("inputHeal").value);
    if (isNaN(cura) || cura < 0) return;
    character.currentHealth += cura;
    if (character.currentHealth > character.maxHealth) character.currentHealth = character.maxHealth;
    actualizarVida();
  }
  function regenerarMisty() {
    const regen = parseInt(document.getElementById("inputMistyRegen").value);
    if (isNaN(regen) || regen < 0) return;
    character.currentMistyculas += regen;
    if (character.currentMistyculas > character.maxMistyculas) character.currentMistyculas = character.maxMistyculas;
    actualizarMistyculas();
  }
  
  // Eventos para atributos
  document.getElementById("attrFuerza").addEventListener("change", () => {
    character.attributes.fuerza = parseInt(document.getElementById("attrFuerza").value);
    actualizarTodo();
  });
  document.getElementById("attrInt").addEventListener("change", () => {
    character.attributes.inteligencia = parseInt(document.getElementById("attrInt").value);
    actualizarTodo();
  });
  document.getElementById("attrAgil").addEventListener("change", () => {
    character.attributes.agilidad = parseInt(document.getElementById("attrAgil").value);
    actualizarTodo();
  });
  document.getElementById("attrMetab").addEventListener("change", () => {
    character.attributes.metabolismo = parseInt(document.getElementById("attrMetab").value);
    actualizarTodo();
  });
  document.getElementById("attrAM").addEventListener("change", () => {
    character.attributes.am = parseInt(document.getElementById("attrAM").value);
    actualizarTodo();
  });
  
  // Datos del personaje
  document.getElementById("charName").addEventListener("change", function() { character.name = this.value; });
  document.getElementById("charRace").addEventListener("change", function() { character.race = this.value; });
  document.getElementById("charLang").addEventListener("change", function() { character.languages = this.value; });
  document.getElementById("charPerso").addEventListener("change", function() { character.personality = this.value; });
  
  // Imagen
  document.getElementById("imgContainer").addEventListener("click", function() {
    document.getElementById("imgUpload").click();
  });
  document.getElementById("imgUpload").addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      character.image = ev.target.result;
      document.getElementById("imgContainer").innerHTML = `<img src="${character.image}" style="width:100%; height:100%; object-fit:cover;">`;
    }
    reader.readAsDataURL(file);
  });
  
  /* Funciones para aplicar costos de acción */
  function aplicarAccionCompleja() {
    if (character.actions.action < 2) { alert("No tienes suficientes acciones."); return; }
    character.actions.action -= 2;
    actualizarAcciones();
  }
  function aplicarAccionMenor() {
    if (character.actions.action < 1) { alert("No tienes suficientes acciones."); return; }
    character.actions.action -= 1;
    actualizarAcciones();
  }
  function aplicarReaccion() {
    if (character.actions.action < 3) { alert("No tienes suficientes acciones."); return; }
    character.actions.action -= 3;
    actualizarAcciones();
  }
  function aplicarAccionObjeto() {
    if (character.actions.action < 1) { alert("No tienes suficientes acciones."); return; }
    character.actions.action -= 1;
    actualizarAcciones();
  }
  function aplicarAccionBonus() {
    character.actions.action += 1;
    actualizarAcciones();
  }
  function aplicarAccionLegendaria() {
    let cost = parseInt(prompt("Ingrese el costo para la acción legendaria (entre 10 y 20):"));
    if (isNaN(cost) || cost < 10 || cost > 20) { alert("Costo inválido."); return; }
    if (character.actions.action < cost) { alert("No tienes suficientes acciones."); return; }
    character.actions.action -= cost;
    actualizarAcciones();
  }
  
  /* Modal Genérico */
  const modalOverlay = document.getElementById("modalOverlay");
  const modalBody = document.getElementById("modalBody");
  const modalSaveBtn = document.getElementById("modalSaveBtn");
  let modalCallback = null;
  
  function openModal(modalId, itemId = null) {
    modalOverlay.style.display = "flex";
    if (modalId === 'skillModal') {
      let skill = itemId ? character.skills.find(s => s.id === itemId) : null;
      modalBody.innerHTML = `
        <h3>${ skill ? "Editar" : "Crear" } Habilidad</h3>
        <label>Nombre:</label>
        <input type="text" id="modalSkillName" placeholder="Nombre" value="${ skill ? skill.name : "" }">
        <label>Descripción:</label>
        <textarea id="modalSkillDesc" placeholder="Descripción">${ skill ? skill.desc : "" }</textarea>
        <label>Fórmula:</label>
        <input type="text" id="modalSkillFormula" placeholder="Ej: Fuerza d InteligenciaMod+2" value="${ skill ? skill.formula : "" }">
        <div class="formula-buttons">
          <div class="formula-btn" onclick="insertFormula('Fuerza', 'modalSkillFormula')">Fuerza</div>
          <div class="formula-btn" onclick="insertFormula('Inteligencia', 'modalSkillFormula')">Inteligencia</div>
          <div class="formula-btn" onclick="insertFormula('Agilidad', 'modalSkillFormula')">Agilidad</div>
          <div class="formula-btn" onclick="insertFormula('Metabolismo', 'modalSkillFormula')">Metabolismo</div>
          <div class="formula-btn" onclick="insertFormula('A.M', 'modalSkillFormula')">A.M</div>
          <div class="formula-btn" onclick="insertFormula('FuerzaMod', 'modalSkillFormula')">FuerzaMod</div>
          <div class="formula-btn" onclick="insertFormula('InteligenciaMod', 'modalSkillFormula')">InteligenciaMod</div>
          <div class="formula-btn" onclick="insertFormula('AgilidadMod', 'modalSkillFormula')">AgilidadMod</div>
          <div class="formula-btn" onclick="insertFormula('MetabolismoMod', 'modalSkillFormula')">MetabolismoMod</div>
          <div class="formula-btn" onclick="insertFormula('AMMod', 'modalSkillFormula')">AMMod</div>
          <div class="formula-btn" onclick="insertFormula('Mistyculas', 'modalSkillFormula')">Mistyculas</div>
          <div class="formula-btn" onclick="insertFormula('Armadura', 'modalSkillFormula')">Armadura</div>
          <div class="formula-btn" onclick="insertFormula('VidaBase', 'modalSkillFormula')">VidaBase</div>
          <div class="formula-btn" onclick="insertFormula('VidaActual', 'modalSkillFormula')">VidaActual</div>
          <div class="formula-btn" onclick="insertFormula(' d ', 'modalSkillFormula')">d</div>
          <div class="formula-btn" onclick="insertFormula('+', 'modalSkillFormula')">+</div>
          <div class="formula-btn" onclick="insertFormula('-', 'modalSkillFormula')">-</div>
          <div class="formula-btn" onclick="insertFormula('*', 'modalSkillFormula')">*</div>
          <div class="formula-btn" onclick="insertFormula('/', 'modalSkillFormula')">/</div>
          <div class="formula-btn" onclick="insertFormula('(', 'modalSkillFormula')">(</div>
          <div class="formula-btn" onclick="insertFormula(')', 'modalSkillFormula')">)</div>
        </div>
        <label>Costo de Acción:</label>
        <input type="number" id="modalSkillActionCost" value="${ skill ? skill.actionCost : 1 }" min="0">
        <label>Costo de Místyculas:</label>
        <input type="number" id="modalSkillMistyCost" value="${ skill ? skill.mistyCost : 0 }" min="0">
      `;
      modalCallback = function() {
        const newSkill = {
          id: skill ? skill.id : Date.now().toString(),
          name: document.getElementById("modalSkillName").value,
          desc: document.getElementById("modalSkillDesc").value,
          formula: document.getElementById("modalSkillFormula").value,
          actionCost: parseInt(document.getElementById("modalSkillActionCost").value),
          mistyCost: parseInt(document.getElementById("modalSkillMistyCost").value)
        };
        if (skill) {
          const index = character.skills.findIndex(s => s.id === skill.id);
          character.skills[index] = newSkill;
        } else {
          character.skills.push(newSkill);
        }
        renderList('skillsList', character.skills);
      };
    }
    else if (modalId === 'spellModal') {
      let spell = itemId ? character.spells.find(s => s.id === itemId) : null;
      modalBody.innerHTML = `
        <h3>${ spell ? "Editar" : "Crear" } Hechizo</h3>
        <label>Nombre:</label>
        <input type="text" id="modalSpellName" placeholder="Nombre" value="${ spell ? spell.name : "" }">
        <label>Descripción:</label>
        <textarea id="modalSpellDesc" placeholder="Descripción">${ spell ? spell.desc : "" }</textarea>
        <label>Fórmula:</label>
        <input type="text" id="modalSpellFormula" placeholder="Ej: 1d10+Inteligencia" value="${ spell ? spell.formula : "" }">
        <div class="formula-buttons">
          <div class="formula-btn" onclick="insertFormula('Fuerza', 'modalSpellFormula')">Fuerza</div>
          <div class="formula-btn" onclick="insertFormula('Inteligencia', 'modalSpellFormula')">Inteligencia</div>
          <div class="formula-btn" onclick="insertFormula('Agilidad', 'modalSpellFormula')">Agilidad</div>
          <div class="formula-btn" onclick="insertFormula('Metabolismo', 'modalSpellFormula')">Metabolismo</div>
          <div class="formula-btn" onclick="insertFormula('A.M', 'modalSpellFormula')">A.M</div>
          <div class="formula-btn" onclick="insertFormula('FuerzaMod', 'modalSpellFormula')">FuerzaMod</div>
          <div class="formula-btn" onclick="insertFormula('InteligenciaMod', 'modalSpellFormula')">InteligenciaMod</div>
          <div class="formula-btn" onclick="insertFormula('AgilidadMod', 'modalSpellFormula')">AgilidadMod</div>
          <div class="formula-btn" onclick="insertFormula('MetabolismoMod', 'modalSpellFormula')">MetabolismoMod</div>
          <div class="formula-btn" onclick="insertFormula('AMMod', 'modalSpellFormula')">AMMod</div>
          <div class="formula-btn" onclick="insertFormula('Mistyculas', 'modalSpellFormula')">Mistyculas</div>
          <div class="formula-btn" onclick="insertFormula('Armadura', 'modalSpellFormula')">Armadura</div>
          <div class="formula-btn" onclick="insertFormula('VidaBase', 'modalSpellFormula')">VidaBase</div>
          <div class="formula-btn" onclick="insertFormula('VidaActual', 'modalSpellFormula')">VidaActual</div>
          <div class="formula-btn" onclick="insertFormula(' d ', 'modalSpellFormula')">d</div>
          <div class="formula-btn" onclick="insertFormula('+', 'modalSpellFormula')">+</div>
          <div class="formula-btn" onclick="insertFormula('-', 'modalSpellFormula')">-</div>
          <div class="formula-btn" onclick="insertFormula('*', 'modalSpellFormula')">*</div>
          <div class="formula-btn" onclick="insertFormula('/', 'modalSpellFormula')">/</div>
          <div class="formula-btn" onclick="insertFormula('(', 'modalSpellFormula')">(</div>
          <div class="formula-btn" onclick="insertFormula(')', 'modalSpellFormula')">)</div>
        </div>
        <label>Costo de Acción:</label>
        <input type="number" id="modalSpellActionCost" value="${ spell ? spell.actionCost : 1 }" min="0">
        <label>Costo de Místyculas:</label>
        <input type="number" id="modalSpellMistyCost" value="${ spell ? spell.mistyCost : 0 }" min="0">
      `;
      modalCallback = function() {
        const newSpell = {
          id: spell ? spell.id : Date.now().toString(),
          name: document.getElementById("modalSpellName").value,
          desc: document.getElementById("modalSpellDesc").value,
          formula: document.getElementById("modalSpellFormula").value,
          actionCost: parseInt(document.getElementById("modalSpellActionCost").value),
          mistyCost: parseInt(document.getElementById("modalSpellMistyCost").value)
        };
        if (spell) {
            const index = character.spells.findIndex(s => s.id === spell.id);
            character.spells[index] = newSpell;
          } else {
            character.spells.push(newSpell);
          }
          renderList('spellsList', character.spells);
        };
      }
      else if (modalId === 'petModal') {
        let pet = itemId ? character.pets.find(p => p.id === itemId) : null;
        modalBody.innerHTML = `
          <h3>${ pet ? "Editar" : "Crear" } Mascota</h3>
          <label>Nombre:</label>
          <input type="text" id="modalPetName" placeholder="Nombre" value="${ pet ? pet.name : "" }">
          <label>Tipo:</label>
          <input type="text" id="modalPetType" placeholder="Tipo" value="${ pet ? pet.type : "" }">
          <label>Imagen:</label>
          <input type="file" id="modalPetImage">
        `;
        modalCallback = function () {
          let newPet = {
            id: pet ? pet.id : Date.now().toString(),
            name: document.getElementById("modalPetName").value,
            type: document.getElementById("modalPetType").value,
            image: pet ? pet.image : null
          };
          const file = document.getElementById("modalPetImage").files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = function (ev) {
              newPet.image = ev.target.result;
              if (pet) {
                const index = character.pets.findIndex(p => p.id === pet.id);
                character.pets[index] = newPet;
              } else {
                character.pets.push(newPet);
              }
              renderList('petsList', character.pets);
            }
            reader.readAsDataURL(file);
          } else {
            if (pet) {
              const index = character.pets.findIndex(p => p.id === pet.id);
              character.pets[index] = newPet;
            } else {
              character.pets.push(newPet);
            }
            renderList('petsList', character.pets);
          }
        };
      }
      else if (modalId === 'itemModal') {
        let itemObj = itemId ? character.items.find(i => i.id === itemId) : null;
        modalBody.innerHTML = `
          <h3>${ itemObj ? "Editar" : "Crear" } Objeto</h3>
          <label>Nombre:</label>
          <input type="text" id="modalItemName" placeholder="Nombre" value="${ itemObj ? itemObj.name : "" }">
          <label>Tipo:</label>
          <input type="text" id="modalItemType" placeholder="Tipo" value="${ itemObj ? itemObj.type : "" }">
          <label>Efectos:</label>
          <textarea id="modalItemEffects" placeholder="Efectos">${ itemObj ? itemObj.effects : "" }</textarea>
        `;
        modalCallback = function () {
          const newItem = {
            id: itemObj ? itemObj.id : Date.now().toString(),
            name: document.getElementById("modalItemName").value,
            type: document.getElementById("modalItemType").value,
            effects: document.getElementById("modalItemEffects").value
          };
          if (itemObj) {
            const index = character.items.findIndex(i => i.id === itemObj.id);
            character.items[index] = newItem;
          } else {
            character.items.push(newItem);
          }
          renderList('itemsList', character.items);
        };
      }
      else if (modalId === 'formulasModal') {
        const modFuerza = calcularMod(character.attributes.fuerza);
        const modInt = calcularMod(character.attributes.inteligencia);
        const modAgil = calcularMod(character.attributes.agilidad);
        const modMetab = calcularMod(character.attributes.metabolismo);
        const modAM = calcularMod(character.attributes.am);
        const movimiento = (modFuerza + modAgil) * 10;
        const carga = (modMetab + modFuerza) * 10;
        const acciones = character.level + modAgil + 1;
        const resistencia = character.level + modMetab;
        const tamano = modMetab * 10;
        const altura = tamano * 10;
        const peso = tamano * 5;
        const vida = character.baseHealth * character.level * (modMetab > 0 ? modMetab : 1);
        const sabiduria = modInt + character.level;
        const misty = character.baseMistyculas * (modInt > 0 ? modInt : 1) * (modAM > 0 ? modAM : 1);
        const regenMisty = character.level + character.attributes.inteligencia + character.attributes.am;
        const regenVida = character.level + character.attributes.metabolismo + character.attributes.am;
        modalBody.innerHTML = `
          <h3>Fórmulas Avanzadas</h3>
          <p><strong>Daño Cuerpo a Cuerpo:</strong> Arma + Fuerza</p>
          <p><strong>Movimiento:</strong> (Fuerza mod + Agilidad mod) × 10 = ${movimiento} pies</p>
          <p><strong>Carga:</strong> (Metabolismo mod + Fuerza mod) × 10 = ${carga} libras</p>
          <p><strong>Armadura:</strong> 10 + (Agilidad mod + Metabolismo mod) = ${character.baseArmor + modAgil + modMetab}</p>
          <p><strong>Acciones:</strong> Nivel + Agilidad mod + 1 = ${acciones}</p>
          <p><strong>Resistencia a Efectos:</strong> Nivel + Metabolismo mod = ${resistencia}</p>
          <p><strong>Tamaño:</strong> Metabolismo mod × 10 = ${tamano} | Altura = ${altura} cm | Peso = ${peso} kg</p>
          <p><strong>Vida:</strong> Vida Base × (Metabolismo mod > 0 ? Metabolismo mod : 1) × Nivel = ${vida}</p>
          <p><strong>Sabiduría:</strong> Inteligencia mod + Nivel = ${sabiduria}</p>
          <p><strong>Mistyculas:</strong> Mistyculas Base × (Inteligencia mod > 0 ? Inteligencia mod : 1) × (A.M mod > 0 ? A.M mod : 1) = ${misty}</p>
          <p><strong>Regeneración de Místyculas:</strong> Nivel + Inteligencia + A.M = ${regenMisty}</p>
          <p><strong>Regeneración de Vida:</strong> Nivel + Metabolismo + A.M = ${regenVida}</p>
        `;
        modalCallback = null;
      }
      else if (modalId === 'editStatsModal') {
        modalBody.innerHTML = `
          <h3>Editar Estadísticas</h3>
          <label>Vida Base:</label>
          <input type="number" id="modalBaseHealth" value="${character.baseHealth}">
          <label>Vida Actual:</label>
          <input type="number" id="modalCurrentHealth" value="${character.currentHealth}">
          <label>XP Actual:</label>
          <input type="number" id="modalXP" value="${character.experience}">
          <label>Mistyculas Base:</label>
          <input type="number" id="modalBaseMisty" value="${character.baseMistyculas}">
          <label>Mistyculas Actuales:</label>
          <input type="number" id="modalCurrentMisty" value="${character.currentMistyculas}">
          <label>Armadura Base:</label>
          <input type="number" id="modalArmorBase" value="${character.baseArmor}">
        `;
        modalCallback = function () {
          character.baseHealth = parseInt(document.getElementById("modalBaseHealth").value);
          character.currentHealth = parseInt(document.getElementById("modalCurrentHealth").value);
          character.experience = parseInt(document.getElementById("modalXP").value);
          character.baseMistyculas = parseInt(document.getElementById("modalBaseMisty").value);
          character.currentMistyculas = parseInt(document.getElementById("modalCurrentMisty").value);
          character.baseArmor = parseInt(document.getElementById("modalArmorBase").value);
          actualizarTodo();
        };
      }
      }
      function closeModal() {
        modalOverlay.style.display = "none";
        modalBody.innerHTML = "";
        modalCallback = null;
      }
      modalSaveBtn.addEventListener("click", function () {
        if (modalCallback) modalCallback();
        closeModal();
      });
      function insertFormula(text, inputId) {
        const input = document.getElementById(inputId);
        input.value += text;
      }
      function renderList(elementId, list) {
        const container = document.getElementById(elementId);
        container.innerHTML = "";
        if (list.length === 0) { container.innerHTML = "<p>No hay elementos.</p>"; return; }
        list.forEach(item => {
          const div = document.createElement("div");
          div.className = "item";
          let extra = "";
          if (item.formula)
            extra = " | Fórmula: " + item.formula;
          else if (item.type && !item.formula)
            extra = " (" + item.type + ")";
          if (item.image)
            extra += `<br><img src="${item.image}" alt="Mascota" style="max-width:100px; margin-top:5px;">`;
          div.innerHTML = `<span><strong>${item.name}</strong>${item.desc ? " - " + item.desc : ""}${extra}</span>
            <div>
              <button class="btn" onclick="editarItem('${elementId}', '${item.id}')">Editar</button>
              <button class="btn" onclick="eliminarItem('${elementId}', '${item.id}')">Eliminar</button>
              ${(elementId === 'skillsList' || elementId === 'spellsList')
              ? `<button class="btn" onclick="usarItem('${elementId}', '${item.id}')">Usar</button>`
              : ""
            }
            </div>`;
          container.appendChild(div);
        });
      }
      function eliminarItem(listId, id) {
        if (listId === "skillsList") {
          character.skills = character.skills.filter(s => s.id !== id);
          renderList(listId, character.skills);
        } else if (listId === "spellsList") {
          character.spells = character.spells.filter(s => s.id !== id);
          renderList(listId, character.spells);
        } else if (listId === "petsList") {
          character.pets = character.pets.filter(p => p.id !== id);
          renderList(listId, character.pets);
        } else if (listId === "itemsList") {
          character.items = character.items.filter(i => i.id !== id);
          renderList(listId, character.items);
        }
      }
      function editarItem(listId, id) {
        if (listId === "skillsList") { openModal('skillModal', id); }
        else if (listId === "spellsList") { openModal('spellModal', id); }
        else if (listId === "petsList") { openModal('petModal', id); }
        else if (listId === "itemsList") { openModal('itemModal', id); }
      }
      function usarItem(listId, id) {
        if (listId === "skillsList") {
          const skill = character.skills.find(s => s.id === id);
          if (character.currentMistyculas < skill.mistyCost) { alert("No tienes suficientes místyculas."); return; }
          if (character.actions.action < skill.actionCost) { alert("No tienes suficientes acciones."); return; }
          character.currentMistyculas -= skill.mistyCost;
          character.actions.action -= skill.actionCost;
          actualizarMistyculas();
          actualizarAcciones();
          const resultado = eval(skill.formula);
          alert("Habilidad usada: " + skill.name + "\nResultado: " + resultado);
        } else if (listId === "spellsList") {
          const spell = character.spells.find(s => s.id === id);
          if (character.currentMistyculas < spell.mistyCost) { alert("No tienes suficientes místyculas."); return; }
          if (character.actions.action < spell.actionCost) { alert("No tienes suficientes acciones."); return; }
          character.currentMistyculas -= spell.mistyCost;
          character.actions.action -= spell.actionCost;
          actualizarMistyculas();
          actualizarAcciones();
          const resultado = eval(spell.formula);
          alert("Hechizo lanzado: " + spell.name + "\nResultado: " + resultado);
        }
      }
      actualizarTodo();
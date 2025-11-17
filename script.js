// ===================================================================================
// CONFIGURACIÓN Y ESTADO GLOBAL
// ===================================================================================

const XP_TABLE = {
    1: 300, 2: 900, 3: 2700, 4: 6500, 5: 14000, 6: 23000, 7: 34000, 8: 48000, 9: 64000, 10: 85000,
    11: 100000, 12: 120000, 13: 145000, 14: 165000, 15: 195000, 16: 225000, 17: 250000, 18: 280000, 19: 315000, 20: Infinity
};
const SKILL_POINTS_PER_LEVEL = {
    1: 3, 2: 3, 3: 4, 4: 4, 5: 5, 6: 5, 7: 6, 8: 6, 9: 7, 10: 7,
    11: 8, 12: 8, 13: 9, 14: 9, 15: 10, 16: 10, 17: 11, 18: 12, 19: 12, 20: 13
};
const RARITIES = ['Intrínseco', 'Común', 'Raro', 'Épico', 'Legendario', 'Mítico / Único', 'Genesis'];
const LOCAL_STORAGE_KEY = 'characterSheetData_v4.5';
const THEME_STORAGE_KEY = 'characterSheetTheme_v4.5';

const ELEMENTS_CONFIG = {
    fuego: { name: 'Fuego', emoji: '🔥', color: 'bg-red-100 dark:bg-red-900/50' },
    aire: { name: 'Aire', emoji: '💨', color: 'bg-sky-100 dark:bg-sky-900/50' },
    agua: { name: 'Agua', emoji: '💧', color: 'bg-blue-100 dark:bg-blue-900/50' },
    electricidad: { name: 'Electricidad', emoji: '⚡', color: 'bg-yellow-100 dark:bg-yellow-900/50' },
    tierra: { name: 'Tierra', emoji: '🌍', color: 'bg-amber-100 dark:bg-amber-900/50' },
    luz: { name: 'Luz', emoji: '☀️', color: 'bg-yellow-50 dark:bg-yellow-800/50' },
    oscuridad: { name: 'Oscuridad', emoji: '🌙', color: 'bg-slate-200 dark:bg-slate-800' }
};

let character;
let tempLinkedEffects = [];

// ===================================================================================
// FUNCIONES DE INICIALIZACIÓN Y GUARDADO
// ===================================================================================

function getDefaultCharacter() {
    return {
        identity: { name: '', race: '', notes: '', personality: '', image: 'https://placehold.co/100x100/e0e0e0/2c3e50?text=Avatar', titles: '', spirits: '', size: '' },
        attributes: { FUE: { name: 'Fuerza', value: 10, upgrades: 0 }, AGI: { name: 'Agilidad', value: 10, upgrades: 0 }, MET: { name: 'Metabolismo', value: 10, upgrades: 0 }, INT: { name: 'Inteligencia', value: 10, upgrades: 0 }, APM: { name: 'Aptitud Mágica', value: 10, upgrades: 0 } },
        elements: { fuego: { name: 'Fuego', level: 0, upgrades: 0 }, aire: { name: 'Aire', level: 0, upgrades: 0 }, agua: { name: 'Agua', level: 0, upgrades: 0 }, electricidad: { name: 'Electricidad', level: 0, upgrades: 0 }, tierra: { name: 'Tierra', level: 0, upgrades: 0 }, luz: { name: 'Luz', level: 0, upgrades: 0 }, oscuridad: { name: 'Oscuridad', level: 0, upgrades: 0 } },
        spiritRelations: { fuego: { relation: 0, bonus: -10 }, aire: { relation: 0, bonus: -10 }, agua: { relation: 0, bonus: -10 }, electricidad: { relation: 0, bonus: -10 }, tierra: { relation: 0, bonus: -10 }, luz: { relation: 0, bonus: -10 }, oscuridad: { relation: 0, bonus: -10 } },
        fusionElements: [],
        stats: { level: { name: 'Nivel', base: 1, current: 1 }, xp: { name: 'Experiencia', base: 0, current: 0 }, health: { name: 'Vida', base: 25, current: 25, max: 25 }, armor: { name: 'Armadura', base: 10, current: 10 }, mana: { name: 'Místyculas', base: 100, current: 100, max: 100 }, actions: { name: 'Acciones', base: 2, current: 3 }, movement: { name: 'Movimiento (pies)', base: 30, current: 30 }, magicSave: { name: 'Salvación Magia', base: 10, current: 10 }, load: { name: 'Carga', base: 10, current: 10 }, resistance: { name: 'Resistencia', base: 0, current: 0 }, wisdom: { name: 'Sabiduría', base: 0, current: 0 } },
        skillPoints: 0,
        combat: { currentActions: 3 },
        equipment: [{ slotName: 'Arma', type: 'arma', item: null, isCustom: false, isDamageFormulaActive: false }, { slotName: 'Armadura', type: 'armadura', item: null, isCustom: false, isDamageFormulaActive: false }, { slotName: 'Accesorio 1', type: 'accesorio', item: null, isCustom: false, isDamageFormulaActive: false }, { slotName: 'Accesorio 2', type: 'accesorio', item: null, isCustom: false, isDamageFormulaActive: false }],
        inventory: { skills: [], techniques: [], items: [], pets: [] },
        statusEffects: [],
        resources: []
    };
}

function saveCharacterToLocalStorage() {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(character));
    } catch (error) { console.error("Error saving character:", error); showNotification("Error de Guardado", "No se pudo guardar el personaje."); }
}

function loadCharacterFromLocalStorage() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return null;
    try {
        const parsedData = JSON.parse(data);
        const defaultChar = getDefaultCharacter();
        let migratedData = { ...defaultChar, ...parsedData };
        migratedData.identity = { ...defaultChar.identity, ...parsedData.identity };
        migratedData.stats = { ...defaultChar.stats, ...parsedData.stats };
        migratedData.inventory = { ...defaultChar.inventory, ...parsedData.inventory };
        migratedData.attributes = { ...defaultChar.attributes };
        for (const key in defaultChar.attributes) if (parsedData.attributes && parsedData.attributes[key]) migratedData.attributes[key] = { ...defaultChar.attributes[key], ...parsedData.attributes[key] };
        migratedData.elements = { ...defaultChar.elements };
        for (const key in defaultChar.elements) {
            if (parsedData.elements && parsedData.elements[key]) {
                if (typeof parsedData.elements[key] === 'number') migratedData.elements[key] = { ...defaultChar.elements[key], level: parsedData.elements[key] };
                else migratedData.elements[key] = { ...defaultChar.elements[key], ...parsedData.elements[key] };
            }
        }
        if (!migratedData.fusionElements) migratedData.fusionElements = [];
        if (!migratedData.skillPoints) migratedData.skillPoints = 0;
        if (!migratedData.spiritRelations) migratedData.spiritRelations = defaultChar.spiritRelations;
        if (!migratedData.statusEffects) migratedData.statusEffects = [];
        if (!migratedData.resources) migratedData.resources = [];
        ['skills', 'techniques'].forEach(type => {
            if (migratedData.inventory[type]) {
                migratedData.inventory[type].forEach(item => {
                    if (item.level === undefined) item.level = 0;
                    if (item.upgrades === undefined) item.upgrades = 0;
                });
            }
        });
        return migratedData;
    } catch (error) { console.error("Error parsing character data:", error); showNotification("Error de Carga", "Datos locales corruptos. Se cargará un personaje por defecto."); localStorage.removeItem(LOCAL_STORAGE_KEY); return null; }
}

function saveAndRefresh() {
    calculateDerivedStats();
    updateUI();
    saveCharacterToLocalStorage();
}

// ===================================================================================
// LÓGICA DE CÁLCULO Y NIVELACIÓN
// ===================================================================================

function getXpForNextLevel() { const currentLevel = character.stats.level.current; if (currentLevel >= 20) return Infinity; return XP_TABLE[currentLevel]; }
function getModifier(attributeValue) { return Math.floor((attributeValue - 10) / 2); }

function calculateDerivedStats() {
    if (!character) return;
    const tempHealth = character.stats.health.current;
    const tempMana = character.stats.mana.current;
    const tempAttributes = JSON.parse(JSON.stringify(character.attributes));
    const tempStats = JSON.parse(JSON.stringify(character.stats));

    character.equipment.forEach(slot => {
        if (slot.item) {
            slot.item.effects.forEach(effect => {
                const [type, key, value] = effect.split(':');
                if (type === 'attr' && tempAttributes[key]) tempAttributes[key].value += parseFloat(value);
            });
        }
    });

    character.statusEffects.forEach(status => {
        status.linkedEffects.forEach(effect => {
            if (effect.applyOn === 'continuo' && effect.target === 'self') {
                const keys = effect.attribute.split('.');
                if (keys[0] === 'attributes' && tempAttributes[keys[1]]) {
                    if (effect.modification === 'fijo') tempAttributes[keys[1]].value += effect.value;
                    else tempAttributes[keys[1]].value *= (1 + effect.value / 100);
                }
            }
        });
    });

    const mods = { FUE: getModifier(tempAttributes.FUE.value), AGI: getModifier(tempAttributes.AGI.value), MET: getModifier(tempAttributes.MET.value), INT: getModifier(tempAttributes.INT.value), APM: getModifier(tempAttributes.APM.value) };
    const level = character.stats.level.current;

    let maxHealth = tempStats.health.base + (mods.MET * level);
    let armor = tempStats.armor.base + mods.AGI + mods.MET; // CORRECCIÓN: Usar base
    let maxMana = tempStats.mana.base * Math.max(1, mods.INT) * Math.max(1, mods.APM);
    let actions = tempStats.actions.base + mods.AGI + level;
    let movement = tempStats.movement.base + (mods.AGI * 5);
    let magicSave = tempStats.magicSave.base + mods.APM + mods.MET; // CORRECCIÓN: Usar base
    let load = tempStats.load.base + (mods.FUE * 2);
    let wisdom = level + mods.INT;
    let resistance = level + mods.MET;

    character.equipment.forEach(slot => {
        if (slot.item) {
            slot.item.effects.forEach(effect => {
                const [type, key, value] = effect.split(':');
                if (type === 'stat') {
                    if (key === 'health') maxHealth += parseFloat(value);
                    if (key === 'mana') maxMana += parseFloat(value);
                    if (key === 'armor') armor += parseFloat(value);
                    if (key === 'actions') actions += parseFloat(value);
                    if (key === 'movement') movement += parseFloat(value);
                    if (key === 'load') load += parseFloat(value);
                    if (key === 'resistance') resistance += parseFloat(value);
                    if (key === 'wisdom') wisdom += parseFloat(value);
                    if (key === 'magicSave') magicSave += parseFloat(value);
                }
            });
        }
    });

    character.statusEffects.forEach(status => {
        status.linkedEffects.forEach(effect => {
            if (effect.applyOn === 'continuo' && effect.target === 'self') {
                const keys = effect.attribute.split('.');
                if (keys[0] === 'stats') {
                    let statToModify = keys[1] === 'health' ? 'maxHealth' : keys[1] === 'mana' ? 'maxMana' : keys[1];
                    const statMap = { maxHealth, armor, maxMana, actions, movement, magicSave, load, wisdom, resistance };
                    if (statMap.hasOwnProperty(statToModify)) {
                        if (effect.modification === 'fijo') statMap[statToModify] += effect.value;
                        else statMap[statToModify] *= (1 + effect.value / 100);
                        if (statToModify === 'maxHealth') maxHealth = statMap.maxHealth;
                        if (statToModify === 'maxMana') maxMana = statMap.maxMana;
                        if (statToModify === 'armor') armor = statMap.armor;
                        if (statToModify === 'actions') actions = statMap.actions;
                        if (statToModify === 'movement') movement = statMap.movement;
                        if (statToModify === 'magicSave') magicSave = statMap.magicSave;
                        if (statToModify === 'load') load = statMap.load;
                        if (statToModify === 'wisdom') wisdom = statMap.wisdom;
                        if (statToModify === 'resistance') resistance = statMap.resistance;
                    }
                }
            }
        });
    });

    character.stats.health.max = Math.round(maxHealth);
    character.stats.mana.max = Math.round(maxMana);
    character.stats.armor.current = Math.round(armor);
    character.stats.actions.current = Math.round(actions);
    character.stats.movement.current = Math.round(movement);
    character.stats.magicSave.current = Math.round(magicSave);
    character.stats.load.current = Math.round(load);
    character.stats.wisdom.current = Math.round(wisdom);
    character.stats.resistance.current = Math.round(resistance);
    
    character.stats.health.current = Math.min(tempHealth, character.stats.health.max);
    character.stats.mana.current = Math.min(tempMana, character.stats.mana.max);
    character.combat.currentActions = Math.min(character.combat.currentActions, character.stats.actions.current);
}

function addXP(amount) {
    if (character.stats.level.current >= 20) { showNotification("Nivel Máximo", "Ya has alcanzado el nivel máximo."); return; }
    character.stats.xp.current += amount;
    showNotification("Experiencia Ganada", `¡Has ganado ${amount} XP!`);
    let levelsGained = 0, healthGained = 0, skillPointsGained = 0;
    let xpNeeded = getXpForNextLevel();
    while (character.stats.xp.current >= xpNeeded) {
        if (character.stats.level.current >= 20) { character.stats.xp.current = xpNeeded; break; }
        const currentLevelBeforeUp = character.stats.level.current;
        character.stats.xp.current -= xpNeeded;
        character.stats.level.current++; character.stats.level.base++;
        levelsGained++;
        const healthRoll = Math.floor(Math.random() * 8) + 1;
        character.stats.health.base += healthRoll; healthGained += healthRoll;
        skillPointsGained += SKILL_POINTS_PER_LEVEL[currentLevelBeforeUp] || 0;
        xpNeeded = getXpForNextLevel();
    }
    if (levelsGained > 0) { character.skillPoints += skillPointsGained; openLevelUpModal(levelsGained, healthGained, skillPointsGained); }
    saveAndRefresh();
}

// ===================================================================================
// RENDERIZADO DE LA INTERFAZ (UI)
// ===================================================================================

function updateUI() {
    if (!character) return;

    // Identity
    document.getElementById('char-name').value = character.identity.name;
    document.getElementById('char-race').value = character.identity.race;
    document.getElementById('char-notes').value = character.identity.notes;
    document.getElementById('char-personality').value = character.identity.personality;
    document.getElementById('character-image-preview').src = character.identity.image;
    document.getElementById('char-titles').value = character.identity.titles;
    document.getElementById('char-spirits').value = character.identity.spirits;
    document.getElementById('char-size').value = character.identity.size;

    // Attributes
    const attributesContainer = document.getElementById('attributes-container'); attributesContainer.innerHTML = '';
    let baseAttributes = JSON.parse(JSON.stringify(character.attributes));
    let finalAttributes = JSON.parse(JSON.stringify(character.attributes));
    character.equipment.forEach(slot => { if (slot.item) slot.item.effects.forEach(effect => { const [type, effectKey, value] = effect.split(':'); if (type === 'attr' && finalAttributes[effectKey]) finalAttributes[effectKey].value += parseFloat(value); }); });
    character.statusEffects.forEach(status => { status.linkedEffects.forEach(effect => { if (effect.applyOn === 'continuo' && effect.target === 'self' && effect.attribute.startsWith('attributes.')) { const key = effect.attribute.split('.')[1]; if (finalAttributes[key]) { if (effect.modification === 'fijo') finalAttributes[key].value += effect.value; else finalAttributes[key].value *= (1 + effect.value / 100); } } }); });
    for (const key in baseAttributes) {
        const baseAttr = baseAttributes[key]; const finalAttr = finalAttributes[key]; const bonus = Math.round(finalAttr.value - baseAttr.value); const mod = getModifier(finalAttr.value);
        const div = document.createElement('div'); div.className = 'grid grid-cols-6 items-center gap-2';
        div.innerHTML = `<label for="attr-${key}" class="font-semibold col-span-2">${baseAttr.name}</label><input type="number" id="attr-${key}" class="input-field text-center" value="${baseAttr.value}"><span class="text-green-600 font-medium text-center">(+${bonus})</span><div class="bg-gray-200 dark:bg-gray-600 text-center font-bold rounded-md py-2">${mod >= 0 ? '+' : ''}${mod}</div><button class="btn btn-primary" onclick="rollAttributeCheck('${key}')" title="Lanzar 1d20 + Modificador">🎲</button>`;
        attributesContainer.appendChild(div);
    }

    // XP, Level & Skill Points
    document.getElementById('skill-points-display').textContent = character.skillPoints;
    const xpNeeded = getXpForNextLevel();
    document.getElementById('level-display').textContent = character.stats.level.current;
    document.getElementById('current-xp-display').textContent = character.stats.xp.current;
    document.getElementById('needed-xp-display').textContent = isFinite(xpNeeded) ? xpNeeded : "MAX";
    const xpPercentage = isFinite(xpNeeded) ? (character.stats.xp.current / xpNeeded) * 100 : 100;
    document.getElementById('xp-bar').style.width = `${Math.min(xpPercentage, 100)}%`;

    // Stats
    const statsContainer = document.getElementById('stats-container'); statsContainer.innerHTML = '';
    const statsToDisplay = { health: { name: 'Vida', base: character.stats.health.max, current: character.stats.health.current }, mana: { name: 'Místyculas', base: character.stats.mana.max, current: character.stats.mana.current }, armor: { name: 'Armadura', current: character.stats.armor.current }, actions: { name: 'Acciones', current: character.stats.actions.current }, movement: { name: 'Movimiento (pies)', current: character.stats.movement.current }, magicSave: { name: 'Salvación Magia', current: character.stats.magicSave.current }, load: { name: 'Carga', current: character.stats.load.current }, resistance: { name: 'Resistencia', current: character.stats.resistance.current }, wisdom: { name: 'Sabiduría', current: character.stats.wisdom.current } };
    for (const key in statsToDisplay) {
        const stat = statsToDisplay[key]; const div = document.createElement('div'); div.className = 'flex justify-between items-center stat-block p-2 rounded-md';
        if (key === 'health' || key === 'mana') { div.innerHTML = `<span class="font-medium">${stat.name}</span><div class="flex items-center gap-1"><input type="number" id="stat-${key}-current" value="${stat.current}" class="input-field w-16 text-center"><span>/</span><span class="font-bold">${stat.base}</span></div>`; }
        else if (['resistance', 'wisdom', 'magicSave'].includes(key)) { div.innerHTML = `<span class="font-medium">${stat.name}</span><div class="flex items-center gap-2"><span class="font-bold">${stat.current}</span><button class="btn btn-primary" onclick="rollStatCheck('${key}')" title="Lanzar 1d20 + Valor">🎲</button></div>`; }
        else { div.innerHTML = `<span class="font-medium">${stat.name}</span><span class="font-bold">${stat.current}</span>`; }
        statsContainer.appendChild(div);
    }

    // Combat
    document.getElementById('current-actions').textContent = character.combat.currentActions;
    document.getElementById('max-actions').textContent = character.stats.actions.current;

    // Elements
    renderElements();
    
    // Equipment
    renderEquipmentSlots();

    // Inventory
    renderInventoryTabs();
    renderInventoryList('skills');
    renderInventoryList('techniques');
    renderInventoryList('items');
    renderInventoryList('pets');

    // Status Effects
    renderStatusEffects();

    // Resources
    renderResources();
}

function renderElements() {
    const container = document.getElementById('elements-container'); container.innerHTML = '';
    for (const key in character.elements) {
        const element = character.elements[key]; const config = ELEMENTS_CONFIG[key];
        const div = document.createElement('div'); div.className = `p-3 rounded-lg border ${config.color} border-gray-300 dark:border-gray-600`;
        div.innerHTML = `<div class="flex justify-between items-center"><span class="font-semibold">${config.emoji} ${element.name}</span><span class="text-sm font-bold">Nvl. ${element.level}</span></div><div class="mt-2"><input type="range" id="element-${key}" min="0" max="10" value="${element.level}" class="w-full"></div>`;
        container.appendChild(div);
    }
    const fusionContainer = document.getElementById('fusion-elements-container'); fusionContainer.innerHTML = '';
    if (character.fusionElements.length > 0) { character.fusionElements.forEach(fusion => { const div = document.createElement('div'); div.className = 'p-2 rounded bg-gray-100 dark:bg-gray-800'; div.innerHTML = `<p class="font-semibold">${fusion.name} (Nvl. ${fusion.level})</p><p class="text-sm text-gray-600 dark:text-gray-400">${fusion.description}</p>`; fusionContainer.appendChild(div); }); }
}

function renderEquipmentSlots() {
    const container = document.getElementById('equipment-slots'); container.innerHTML = '';
    character.equipment.forEach(slot => {
        const div = document.createElement('div'); div.className = 'flex justify-between items-center p-2 border rounded-md';
        const item = slot.item;
        if (item) { div.innerHTML = `<span class="font-medium">${slot.slotName}:</span><span class="rarity-text item-name-${item.rarity.toLowerCase().replace(/[^a-z0-9]/g, '')}">${item.name}</span><button class="btn btn-danger text-sm" onclick="unequipItem('${slot.slotName}')">Quitar</button>`; }
        else { div.innerHTML = `<span class="font-medium">${slot.slotName}:</span><span class="text-gray-500">Vacío</span><button class="btn btn-secondary text-sm" onclick="openEquipItemModal('${slot.slotName}', '${slot.type}')">Equipar</button>`; }
        container.appendChild(div);
    });
}

function renderInventoryTabs() {
    const tabs = document.querySelectorAll('#inventory-tabs .tab-button'); const panes = document.querySelectorAll('.tab-pane');
    tabs.forEach(tab => { tab.addEventListener('click', () => { tabs.forEach(t => t.classList.remove('active')); panes.forEach(p => p.classList.add('hidden')); tab.classList.add('active'); const targetPane = document.getElementById(`tab-content-${tab.dataset.tab}`); if (targetPane) targetPane.classList.remove('hidden'); }); });
}

function renderInventoryList(type) {
    const list = document.getElementById(`${type}-list`); if (!list) return; list.innerHTML = '';
    const items = character.inventory[type];
    if (items.length === 0) { list.innerHTML = '<p class="text-center text-gray-500">No hay elementos aquí.</p>'; return; }
    items.forEach((item, index) => {
        const card = document.createElement('div'); card.className = `item-card p-3 rounded-md`; card.dataset.rarity = item.rarity;
        let content = `<div class="flex justify-between items-start"><div><p class="font-bold">${item.name}</p><p class="text-sm rarity-text">${item.rarity}</p>`;
        if (item.level !== undefined) content += `<p class="text-sm">Nivel: ${item.level} (Mejoras: ${item.upgrades})</p>`;
        content += `<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${item.description}</p></div>`;
        content += `<div class="flex gap-1"><button class="btn btn-secondary text-xs" onclick="editInventoryItem('${type}', ${index})">Editar</button><button class="btn btn-danger text-xs" onclick="deleteInventoryItem('${type}', ${index})">Borrar</button></div></div>`;
        card.innerHTML = content; list.appendChild(card);
    });
}

function renderStatusEffects() {
    const list = document.getElementById('status-effects-list'); list.innerHTML = '';
    if (character.statusEffects.length === 0) { list.innerHTML = '<p class="text-center text-gray-500">Sin efectos activos.</p>'; return; }
    character.statusEffects.forEach((status, index) => {
        const card = document.createElement('div'); card.className = `status-card p-3 rounded-md`; card.dataset.type = status.type;
        let durationText = status.duration === -1 ? 'Infinito' : status.duration;
        card.innerHTML = `<div class="flex justify-between items-start"><div><p class="font-bold">${status.name}</p><p class="text-sm text-gray-600 dark:text-gray-400">${status.description}</p><p class="text-sm font-medium">Duración: ${durationText} turnos</p></div><button class="btn btn-danger text-xs" onclick="removeStatusEffect(${index})">Quitar</button></div>`;
        list.appendChild(card);
    });
}

function renderResources() {
    const container = document.getElementById('resources-container'); container.innerHTML = '';
    if (character.resources.length === 0) { container.innerHTML = '<p class="text-center text-gray-500">No hay recursos definidos.</p>'; return; }
    character.resources.forEach((resource, index) => {
        const div = document.createElement('div'); div.className = 'flex justify-between items-center p-2 border rounded-md';
        div.innerHTML = `<span class="font-medium">${resource.name}:</span><div class="flex items-center gap-2"><input type="number" id="resource-${index}" value="${resource.current}" class="input-field w-16 text-center"><span>/</span><span>${resource.max}</span></div>`;
        container.appendChild(div);
    });
}


// ===================================================================================
// MANEJADORES DE EVENTOS Y MODALES
// ===================================================================================

window.onload = () => {
    character = loadCharacterFromLocalStorage() || getDefaultCharacter();
    applyStoredTheme();
    updateUI();
    setupGlobalEventListeners();
};

function setupGlobalEventListeners() {
    // Identity
    document.getElementById('character-image-upload').addEventListener('change', handleImageUpload);
    ['char-name', 'char-race', 'char-notes', 'char-personality', 'char-titles', 'char-spirits', 'char-size'].forEach(id => {
        document.getElementById(id).addEventListener('input', saveAndRefresh);
    });

    // Attributes
    document.getElementById('attributes-container').addEventListener('input', (e) => {
        if (e.target.id.startsWith('attr-')) { const key = e.target.id.split('-')[1]; character.attributes[key].value = parseInt(e.target.value) || 0; saveAndRefresh(); }
    });

    // Elements
    document.getElementById('elements-container').addEventListener('input', (e) => {
        if (e.target.id.startsWith('element-')) { const key = e.target.id.split('-')[1]; character.elements[key].level = parseInt(e.target.value); saveAndRefresh(); }
    });

    // XP
    document.getElementById('add-xp-btn').addEventListener('click', () => {
        const input = document.getElementById('xp-to-add'); const amount = parseInt(input.value);
        if (amount > 0) { addXP(amount); input.value = ''; } else { showNotification("Error", "Por favor, introduce una cantidad válida de XP."); }
    });

    // Stats
    document.getElementById('stats-container').addEventListener('input', (e) => {
        if (e.target.id.startsWith('stat-')) { const key = e.target.id.split('-')[1]; character.stats[key].current = parseInt(e.target.value) || 0; saveAndRefresh(); }
    });
    document.getElementById('restore-stats-btn').addEventListener('click', () => { character.stats.health.current = character.stats.health.max; character.stats.mana.current = character.stats.mana.max; character.combat.currentActions = character.stats.actions.current; saveAndRefresh(); showNotification("Restaurado", "Vida, Místyculas y Acciones restauradas."); });
    document.getElementById('edit-base-stats-btn').addEventListener('click', openEditBaseStatsModal);

    // Combat
    document.getElementById('end-turn-btn').addEventListener('click', () => { character.combat.currentActions = character.stats.actions.current; processStatusEffects(); saveAndRefresh(); showNotification("Turno Finalizado", "Puntos de Acción restaurados. Se han procesado los efectos de estado."); });

    // Status Effects
    document.getElementById('add-status-effect-btn').addEventListener('click', openAddStatusEffectModal);

    // Equipment
    document.getElementById('manage-slots-btn').addEventListener('click', openManageSlotsModal);

    // Inventory
    document.getElementById('add-skill-btn').addEventListener('click', () => openAddItemModal('skills'));
    document.getElementById('add-technique-btn').addEventListener('click', () => openAddItemModal('techniques'));
    document.getElementById('add-item-btn').addEventListener('click', () => openAddItemModal('items'));
    document.getElementById('add-pet-btn').addEventListener('click', () => openAddItemModal('pets'));

    // Resources
    document.getElementById('add-resource-btn').addEventListener('click', openManageResourcesModal);
    document.getElementById('resources-container').addEventListener('input', (e) => {
        if (e.target.id.startsWith('resource-')) { const index = parseInt(e.target.id.split('-')[1]); character.resources[index].current = parseInt(e.target.value) || 0; saveAndRefresh(); }
    });

    // Data Management
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
    document.getElementById('export-json-btn').addEventListener('click', exportCharacter);
    document.getElementById('import-json-btn').addEventListener('click', () => document.getElementById('json-import-input').click());
    document.getElementById('json-import-input').addEventListener('change', importCharacter);
    document.getElementById('clear-local-data-btn').addEventListener('click', clearLocalData);
    document.getElementById('spend-skill-points-btn').addEventListener('click', openSpendSkillPointsModal);
}

// --- Modal Functions ---
function openModal(content, secondary = false) { const modal = secondary ? document.getElementById('modal-secondary') : document.getElementById('modal'); const contentEl = secondary ? document.getElementById('modal-secondary-content') : document.getElementById('modal-content'); contentEl.innerHTML = content; modal.classList.add('active'); }
function closeModal(secondary = false) { const modal = secondary ? document.getElementById('modal-secondary') : document.getElementById('modal'); modal.classList.remove('active'); }
function showNotification(title, message) { document.getElementById('notification-title').textContent = title; document.getElementById('notification-message').textContent = message; document.getElementById('notification-modal').classList.add('active'); }

function openLevelUpModal(levels, health, points) {
    let levelUpMessage = `¡Felicidades! Has subido ${levels} nivel(es) y ahora eres nivel ${character.stats.level.current}.\n\nHas ganado +${health} de vida base.\nHas obtenido ${points} Puntos de Habilidad (PH) para gastar.`;
    openModal(`<h3 class="text-2xl font-bold mb-4 text-green-500">¡Subida de Nivel!</h3><p class="whitespace-pre-wrap mb-4">${levelUpMessage}</p><div class="text-center mb-4"><button class="btn btn-primary" onclick="openSpendSkillPointsModal(); closeModal();">Gastar Puntos de Habilidad</button></div><div class="flex justify-end mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cerrar</button></div>`);
}

function openSpendSkillPointsModal() {
    if (character.skillPoints <= 0) { showNotification("Sin Puntos", "No tienes Puntos de Habilidad (PH) para gastar."); return; }
    let content = `<h3 class="text-xl font-bold mb-4">Gastar Puntos de Habilidad (PH: <span id="modal-ph-display">${character.skillPoints}</span>)</h3><div class="space-y-4 modal-scrollable-content">`;
    // Attributes
    content += `<h4 class="font-semibold border-b pb-2">Atributos (+1 por PH)</h4>`;
    for (const key in character.attributes) { const attr = character.attributes[key]; content += `<div class="flex justify-between items-center"><span>${attr.name} (${attr.value})</span><button class="btn btn-primary" onclick="spendPoint('attribute', '${key}')">Mejorar</button></div>`; }
    // Elements
    content += `<h4 class="font-semibold border-b pb-2 mt-4">Afinidad Elemental (+1 por PH)</h4>`;
    for (const key in character.elements) { const element = character.elements[key]; content += `<div class="flex justify-between items-center"><span>${ELEMENTS_CONFIG[key].emoji} ${element.name} (${element.level})</span><button class="btn btn-primary" onclick="spendPoint('element', '${key}')">Mejorar</button></div>`; }
    content += `</div><div class="flex justify-end mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cerrar</button></div>`;
    openModal(content);
}

function spendPoint(type, key) {
    if (character.skillPoints <= 0) { showNotification("Sin Puntos", "No te quedan PH."); closeModal(); return; }
    if (type === 'attribute') { character.attributes[key].value++; character.attributes[key].upgrades++; }
    else if (type === 'element') { character.elements[key].level++; character.elements[key].upgrades++; }
    character.skillPoints--;
    saveAndRefresh();
    document.getElementById('modal-ph-display').textContent = character.skillPoints; // Update modal display
}

function openEditBaseStatsModal() {
    let content = `<h3 class="text-xl font-bold mb-4">Editar Estadísticas Base</h3><div class="space-y-3">`;
    for (const key in character.stats) {
        if (character.stats[key].hasOwnProperty('base')) {
            const stat = character.stats[key];
            content += `<div class="flex justify-between items-center"><label for="base-stat-${key}" class="font-medium">${stat.name}:</label><input type="number" id="base-stat-${key}" value="${stat.base}" class="input-field w-20"></div>`;
        }
    }
    content += `</div><div class="flex justify-end mt-6 space-x-2"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveBaseStats()">Guardar</button></div>`;
    openModal(content);
}

function saveBaseStats() {
    for (const key in character.stats) {
        if (character.stats[key].hasOwnProperty('base')) {
            const input = document.getElementById(`base-stat-${key}`);
            if (input) character.stats[key].base = parseInt(input.value) || 0;
        }
    }
    saveAndRefresh();
    closeModal();
    showNotification("Guardado", "Estadísticas base actualizadas.");
}

function openAddItemModal(type) {
    const isTechnique = type === 'techniques';
    const itemTitle = type === 'skills' ? 'Habilidad' : type === 'techniques' ? 'Técnica/Hechizo' : type === 'items' ? 'Objeto' : 'Mascota';
    let content = `<h3 class="text-xl font-bold mb-4">Añadir ${itemTitle}</h3><form id="add-item-form" class="space-y-3">`;
    content += `<div><label class="block text-sm font-medium">Nombre</label><input type="text" id="new-item-name" class="input-field" required></div>`;
    content += `<div><label class="block text-sm font-medium">Descripción</label><textarea id="new-item-description" class="input-field" rows="3"></textarea></div>`;
    content += `<div><label class="block text-sm font-medium">Rareza</label><select id="new-item-rarity" class="input-field">${RARITIES.map(r => `<option value="${r}">${r}</option>`).join('')}</select></div>`;
    if (type === 'skills' || type === 'techniques') { content += `<div><label class="block text-sm font-medium">Nivel Inicial</label><input type="number" id="new-item-level" class="input-field" value="0" min="0"></div>`; }
    if (isTechnique) { content += `<div><label class="block text-sm font-medium">Coste de Místyculas</label><input type="number" id="new-item-cost" class="input-field" value="0" min="0"></div>`; }
    content += `</form><div class="flex justify-end mt-6 space-x-2"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="addInventoryItem('${type}')">Añadir</button></div>`;
    openModal(content);
}

function addInventoryItem(type) {
    const name = document.getElementById('new-item-name').value.trim();
    if (!name) { showNotification("Error", "El nombre es obligatorio."); return; }
    const newItem = {
        name: name,
        description: document.getElementById('new-item-description').value.trim(),
        rarity: document.getElementById('new-item-rarity').value,
        level: parseInt(document.getElementById('new-item-level')?.value) || 0,
        upgrades: 0,
    };
    if (type === 'techniques') { newItem.cost = parseInt(document.getElementById('new-item-cost')?.value) || 0; }
    character.inventory[type].push(newItem);
    saveAndRefresh();
    closeModal();
    showNotification("Añadido", `${name} ha sido añadido a tu inventario.`);
}

function editInventoryItem(type, index) {
    const item = character.inventory[type][index];
    const itemTitle = type === 'skills' ? 'Habilidad' : type === 'techniques' ? 'Técnica/Hechizo' : type === 'items' ? 'Objeto' : 'Mascota';
    let content = `<h3 class="text-xl font-bold mb-4">Editar ${itemTitle}</h3><form id="edit-item-form" class="space-y-3">`;
    content += `<div><label class="block text-sm font-medium">Nombre</label><input type="text" id="edit-item-name" class="input-field" value="${item.name}" required></div>`;
    content += `<div><label class="block text-sm font-medium">Descripción</label><textarea id="edit-item-description" class="input-field" rows="3">${item.description}</textarea></div>`;
    content += `<div><label class="block text-sm font-medium">Rareza</label><select id="edit-item-rarity" class="input-field">${RARITIES.map(r => `<option value="${r}" ${r===item.rarity?'selected':''}>${r}</option>`).join('')}</select></div>`;
    if (item.level !== undefined) { content += `<div><label class="block text-sm font-medium">Nivel</label><input type="number" id="edit-item-level" class="input-field" value="${item.level}" min="0"></div><div><label class="block text-sm font-medium">Mejoras</label><input type="number" id="edit-item-upgrades" class="input-field" value="${item.upgrades}" min="0"></div>`; }
    if (item.cost !== undefined) { content += `<div><label class="block text-sm font-medium">Coste de Místyculas</label><input type="number" id="edit-item-cost" class="input-field" value="${item.cost}" min="0"></div>`; }
    content += `</form><div class="flex justify-end mt-6 space-x-2"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="saveInventoryItem('${type}', ${index})">Guardar</button></div>`;
    openModal(content);
}

function saveInventoryItem(type, index) {
    const item = character.inventory[type][index];
    item.name = document.getElementById('edit-item-name').value.trim();
    item.description = document.getElementById('edit-item-description').value.trim();
    item.rarity = document.getElementById('edit-item-rarity').value;
    if (item.level !== undefined) { item.level = parseInt(document.getElementById('edit-item-level').value) || 0; item.upgrades = parseInt(document.getElementById('edit-item-upgrades').value) || 0; }
    if (item.cost !== undefined) { item.cost = parseInt(document.getElementById('edit-item-cost').value) || 0; }
    saveAndRefresh();
    closeModal();
    showNotification("Guardado", `${item.name} ha sido actualizado.`);
}

function deleteInventoryItem(type, index) {
    const item = character.inventory[type][index];
    if (confirm(`¿Estás seguro de que quieres borrar "${item.name}"?`)) {
        character.inventory[type].splice(index, 1);
        saveAndRefresh();
        showNotification("Borrado", `${item.name} ha sido eliminado.`);
    }
}

function openEquipItemModal(slotName, slotType) {
    const availableItems = character.inventory.items.filter(item => item.type === slotType || !item.type);
    if (availableItems.length === 0) { showNotification("Sin Objetos", `No tienes objetos del tipo "${slotType}" para equipar.`); return; }
    let content = `<h3 class="text-xl font-bold mb-4">Equipar en ${slotName}</h3><div class="space-y-2 modal-scrollable-content">`;
    availableItems.forEach((item, index) => {
        const originalIndex = character.inventory.items.indexOf(item);
        content += `<div class="p-2 border rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" onclick="equipItem('${slotName}', ${originalIndex})"><p class="font-bold">${item.name}</p><p class="text-sm rarity-text">${item.rarity}</p></div>`;
    });
    content += `</div><div class="flex justify-end mt-6"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button></div>`;
    openModal(content);
}

function equipItem(slotName, itemIndex) {
    const slot = character.equipment.find(s => s.slotName === slotName);
    const item = character.inventory.items[itemIndex];
    if (slot && item) {
        if (slot.item) { // If slot is occupied, return item to inventory
            character.inventory.items.push(slot.item);
        }
        slot.item = item;
        character.inventory.items.splice(itemIndex, 1);
        saveAndRefresh();
        closeModal();
        showNotification("Equipado", `${item.name} ha sido equipado en ${slotName}.`);
    }
}

function unequipItem(slotName) {
    const slot = character.equipment.find(s => s.slotName === slotName);
    if (slot && slot.item) {
        character.inventory.items.push(slot.item);
        slot.item = null;
        saveAndRefresh();
        showNotification("Quitado", `El objeto de ${slotName} ha sido devuelto al inventario.`);
    }
}

function openManageSlotsModal() {
    let content = `<h3 class="text-xl font-bold mb-4">Gestionar Slots de Equipamiento</h3><div class="space-y-3">`;
    character.equipment.forEach(slot => {
        content += `<div class="flex justify-between items-center p-2 border rounded"><span>${slot.slotName}</span><button class="btn btn-danger text-sm" onclick="removeSlot('${slot.slotName}')">Eliminar Slot</button></div>`;
    });
    content += `</div><div class="mt-4"><input type="text" id="new-slot-name" class="input-field" placeholder="Nombre del nuevo slot"></div><div class="flex justify-end mt-6 space-x-2"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="addSlot()">Añadir Slot</button></div>`;
    openModal(content);
}

function addSlot() {
    const name = document.getElementById('new-slot-name').value.trim();
    if (name) { character.equipment.push({ slotName: name, type: 'accesorio', item: null }); saveAndRefresh(); closeModal(); openManageSlotsModal(); }
}

function removeSlot(slotName) {
    const slot = character.equipment.find(s => s.slotName === slotName);
    if (slot && slot.item) { character.inventory.items.push(slot.item); }
    character.equipment = character.equipment.filter(s => s.slotName !== slotName);
    saveAndRefresh();
    closeModal();
    openManageSlotsModal();
}

function openAddStatusEffectModal() {
    tempLinkedEffects = [];
    let content = `<h3 class="text-xl font-bold mb-4">Añadir Estado</h3><form id="add-status-form" class="space-y-3">`;
    content += `<div><label class="block text-sm font-medium">Nombre</label><input type="text" id="status-name" class="input-field" required></div>`;
    content += `<div><label class="block text-sm font-medium">Descripción</label><textarea id="status-description" class="input-field" rows="2"></textarea></div>`;
    content += `<div><label class="block text-sm font-medium">Tipo</label><select id="status-type" class="input-field"><option value="Buff">Buff</option><option value="Debuff">Debuff</option><option value="Neutral">Neutral</option></select></div>`;
    content += `<div><label class="block text-sm font-medium">Duración (turnos, -1 para infinito)</label><input type="number" id="status-duration" class="input-field" value="-1"></div>`;
    content += `<div class="border-t pt-3"><h4 class="font-semibold mb-2">Efectos Vinculados</h4><div id="linked-effects-container"></div><button type="button" class="btn btn-secondary" onclick="addLinkedEffectToModal()">Añadir Efecto</button></div>`;
    content += `</form><div class="flex justify-end mt-6 space-x-2"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="addStatusEffect()">Añadir Estado</button></div>`;
    openModal(content);
    renderLinkedEffectsInModal();
}

function addLinkedEffectToModal() {
    tempLinkedEffects.push({ attribute: 'stats.health', modification: 'fijo', value: 0, applyOn: 'continuo', target: 'self' });
    renderLinkedEffectsInModal();
}

function renderLinkedEffectsInModal() {
    const container = document.getElementById('linked-effects-container');
    if (!container) return;
    container.innerHTML = '';
    tempLinkedEffects.forEach((effect, index) => {
        const div = document.createElement('div'); div.className = 'grid grid-cols-5 gap-2 items-center';
        div.innerHTML = `
            <select class="input-field" data-index="${index}" data-field="attribute"><option value="stats.health">Vida</option><option value="stats.mana">Místyculas</option><option value="stats.armor">Armadura</option><option value="attributes.FUE">Fuerza</option><option value="attributes.AGI">Agilidad</option></select>
            <select class="input-field" data-index="${index}" data-field="modification"><option value="fijo">Fijo (+/-)</option><option value="porcentaje">Porcentaje (%)</option></select>
            <input type="number" class="input-field" data-index="${index}" data-field="value" value="${effect.value}">
            <select class="input-field" data-index="${index}" data-field="applyOn"><option value="continuo">Continuo</option><option value="inicio_turno">Inicio Turno</option></select>
            <button class="btn btn-danger" onclick="removeLinkedEffect(${index})">X</button>
        `;
        container.appendChild(div);
    });
}

function removeLinkedEffect(index) { tempLinkedEffects.splice(index, 1); renderLinkedEffectsInModal(); }

function addStatusEffect() {
    const name = document.getElementById('status-name').value.trim();
    if (!name) { showNotification("Error", "El nombre es obligatorio."); return; }
    const newStatus = {
        name: name,
        description: document.getElementById('status-description').value.trim(),
        type: document.getElementById('status-type').value,
        duration: parseInt(document.getElementById('status-duration').value) || -1,
        linkedEffects: []
    };
    // Capture values from dynamically created inputs
    tempLinkedEffects.forEach((effect, index) => {
        newStatus.linkedEffects.push({
            attribute: document.querySelector(`[data-index="${index}"][data-field="attribute"]`).value,
            modification: document.querySelector(`[data-index="${index}"][data-field="modification"]`).value,
            value: parseFloat(document.querySelector(`[data-index="${index}"][data-field="value"]`).value) || 0,
            applyOn: document.querySelector(`[data-index="${index}"][data-field="applyOn"]`).value,
            target: 'self'
        });
    });
    character.statusEffects.push(newStatus);
    saveAndRefresh();
    closeModal();
    showNotification("Añadido", `El estado "${name}" ha sido aplicado.`);
}

function removeStatusEffect(index) {
    const status = character.statusEffects[index];
    if (confirm(`¿Quitar el estado "${status.name}"?`)) {
        character.statusEffects.splice(index, 1);
        saveAndRefresh();
    }
}

function processStatusEffects() {
    character.statusEffects.forEach((status, index) => {
        if (status.duration > 0) { status.duration--; }
        if (status.duration === 0) {
            showNotification("Estado Expirado", `El estado "${status.name}" ha terminado.`);
            character.statusEffects.splice(index, 1);
        }
    });
}

function openManageResourcesModal() {
    let content = `<h3 class="text-xl font-bold mb-4">Gestionar Recursos</h3><div class="space-y-2 modal-scrollable-content">`;
    if (character.resources.length === 0) { content += '<p>No hay recursos definidos. Añade uno abajo.</p>'; }
    character.resources.forEach((resource, index) => {
        content += `<div class="flex justify-between items-center p-2 border rounded"><span>${resource.name} (Max: ${resource.max})</span><button class="btn btn-danger text-sm" onclick="removeResource(${index})">Eliminar</button></div>`;
    });
    content += `</div><div class="mt-4 border-t pt-4 space-y-2"><input type="text" id="new-resource-name" class="input-field" placeholder="Nombre del recurso"><input type="number" id="new-resource-max" class="input-field" placeholder="Cantidad Máxima"></div><div class="flex justify-end mt-6 space-x-2"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-primary" onclick="addResource()">Añadir Recurso</button></div>`;
    openModal(content);
}

function addResource() {
    const name = document.getElementById('new-resource-name').value.trim();
    const max = parseInt(document.getElementById('new-resource-max').value) || 0;
    if (name && max > 0) {
        character.resources.push({ name: name, max: max, current: max });
        saveAndRefresh();
        closeModal();
        openManageResourcesModal();
    }
}

function removeResource(index) {
    character.resources.splice(index, 1);
    saveAndRefresh();
    closeModal();
    openManageResourcesModal();
}


// ===================================================================================
// UTILIDADES Y OTRAS FUNCIONES
// ===================================================================================

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => { character.identity.image = e.target.result; document.getElementById('character-image-preview').src = e.target.result; saveAndRefresh(); };
        reader.readAsDataURL(file);
    }
}

function rollAttributeCheck(attrKey) {
    const attr = character.attributes[attrKey];
    const mod = getModifier(attr.value);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + mod;
    showNotification(`Tirada de ${attr.name}`, `1d20 + ${mod} = ${roll} + ${mod} = ${total}`);
}

function rollStatCheck(statKey) {
    const stat = character.stats[statKey];
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + stat.current;
    showNotification(`Tirada de ${stat.name}`, `1d20 + ${stat.current} = ${roll} + ${stat.current} = ${total}`);
}

function useAction(cost, name) {
    if (character.combat.currentActions >= cost) {
        character.combat.currentActions -= cost;
        saveAndRefresh();
        showNotification("Acción Usada", `Has usado "${name}" por ${cost} PA.`);
    } else {
        showNotification("Insuficientes PA", `No tienes suficientes Puntos de Acción para usar "${name}".`);
    }
}

function exportCharacter() {
    const dataStr = JSON.stringify(character, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `character_${character.identity.name || 'sin_nombre'}.json`;
    const linkElement = document.createElement('a'); linkElement.setAttribute('href', dataUri); linkElement.setAttribute('download', exportFileDefaultName); linkElement.click();
}

function importCharacter(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try { character = JSON.parse(e.target.result); saveAndRefresh(); showNotification("Importado", "Personaje cargado correctamente."); }
            catch (error) { showNotification("Error de Importación", "El archivo no es un JSON válido."); }
        };
        reader.readAsText(file);
    }
}

function clearLocalData() {
    openModal(`<h3 class="text-xl font-bold mb-4">Confirmar Eliminación</h3><p>¿Seguro que quieres borrar todos los datos del personaje? Esta acción no se puede deshacer y la página se recargará.</p><div class="flex justify-end mt-6 space-x-2"><button class="btn btn-secondary" onclick="closeModal()">Cancelar</button><button class="btn btn-danger" id="confirm-delete-btn">Sí, borrar todo</button></div>`);
    document.getElementById('confirm-delete-btn').onclick = () => { localStorage.removeItem(LOCAL_STORAGE_KEY); localStorage.removeItem(THEME_STORAGE_KEY); location.reload(); };
}

function applyStoredTheme() {
    const theme = localStorage.getItem(THEME_STORAGE_KEY) || 'default';
    if (theme !== 'default') { document.body.classList.add(theme); }
}

function toggleTheme() {
    const themes = ['theme-dark', 'theme-forest', 'theme-ocean', 'theme-fire', 'theme-dusk'];
    const currentTheme = themes.find(t => document.body.classList.contains(t));
    if (currentTheme) { document.body.classList.remove(currentTheme); localStorage.setItem(THEME_STORAGE_KEY, 'default'); }
    else { const nextTheme = themes[Math.floor(Math.random() * themes.length)]; document.body.classList.add(nextTheme); localStorage.setItem(THEME_STORAGE_KEY, nextTheme); }
}

function drag(ev) { ev.dataTransfer.setData("text", ev.target.id); } // Simplified drag start

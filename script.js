document.addEventListener('DOMContentLoaded', () => {

// ===================================================================================
// CONFIGURACIÓN Y ESTADO
// ===================================================================================
const XP_TABLE = {
    1: 300, 2: 900, 3: 2700, 4: 6500, 5: 14000, 6: 23000, 7: 34000, 8: 48000, 9: 64000, 10: 85000,
    11: 100000, 12: 120000, 13: 145000, 14: 165000, 15: 195000, 16: 225000, 17: 250000, 18: 280000, 19: 315000, 20: Infinity
};
const SKILL_POINTS_PER_LEVEL = {
    1: 3, 2: 3, 3: 4, 4: 4, 5: 5, 6: 5, 7: 6, 8: 6, 9: 7, 10: 7,
    11: 8, 12: 8, 13: 9, 14: 9, 15: 10, 16: 10, 17: 11, 18: 12, 19: 12, 20: 13
};
const EVOLUTION_LEVELS = [5, 10, 15, 20];
const RARITIES = ['Intrínseco', 'Común', 'Raro', 'Épico', 'Legendario', 'Mítico / Único', 'Genesis'];
const LOCAL_STORAGE_KEY = 'characterSheetData_v4.5'; // Updated version key
const THEME_STORAGE_KEY = 'characterSheetTheme_v4.5'; // Updated version key

const ELEMENTS_CONFIG = {
    fuego: { name: 'Fuego', emoji: '🔥', color: 'bg-red-100 dark:bg-red-900/50' },
    aire: { name: 'Aire', emoji: '💨', color: 'bg-sky-100 dark:bg-sky-900/50' },
    agua: { name: 'Agua', emoji: '💧', color: 'bg-blue-100 dark:bg-blue-900/50' },
    electricidad: { name: 'Electricidad', emoji: '⚡', color: 'bg-yellow-100 dark:bg-yellow-900/50' },
    tierra: { name: 'Tierra', emoji: '🌍', color: 'bg-amber-100 dark:bg-amber-900/50' },
    luz: { name: 'Luz', emoji: '☀️', color: 'bg-yellow-50 dark:bg-yellow-800/50' },
    oscuridad: { name: 'Oscuridad', emoji: '🌙', color: 'bg-slate-200 dark:bg-slate-800' }
};

let character; // Se inicializará en window.onload
let tempLinkedEffects = []; // Almacén temporal para el constructor de estados

function getDefaultCharacter() {
    return {
        identity: {
            name: '', race: '', notes: '', personality: '',
            image: 'https://placehold.co/100x100/e0e0e0/2c3e50?text=Avatar',
            titles: '', spirits: '', size: ''
        },
        attributes: {
            FUE: { name: 'Fuerza', value: 10, upgrades: 0 }, AGI: { name: 'Agilidad', value: 10, upgrades: 0 },
            MET: { name: 'Metabolismo', value: 10, upgrades: 0 }, INT: { name: 'Inteligencia', value: 10, upgrades: 0 },
            APM: { name: 'Aptitud Mágica', value: 10, upgrades: 0 },
        },
        elements: {
            fuego: { name: 'Fuego', level: 0, upgrades: 0 }, aire: { name: 'Aire', level: 0, upgrades: 0 }, 
            agua: { name: 'Agua', level: 0, upgrades: 0 }, electricidad: { name: 'Electricidad', level: 0, upgrades: 0 }, 
            tierra: { name: 'Tierra', level: 0, upgrades: 0 }, luz: { name: 'Luz', level: 0, upgrades: 0 }, 
            oscuridad: { name: 'Oscuridad', level: 0, upgrades: 0 }
        },
        spiritRelations: {
            fuego: { relation: 0, bonus: -10 }, aire: { relation: 0, bonus: -10 },
            agua: { relation: 0, bonus: -10 }, electricidad: { relation: 0, bonus: -10 },
            tierra: { relation: 0, bonus: -10 }, luz: { relation: 0, bonus: -10 },
            oscuridad: { relation: 0, bonus: -10 }
        },
        fusionElements: [], // { name: '', description: '', level: 0, upgrades: 0 }
        stats: {
            level: { name: 'Nivel', base: 1, current: 1 }, xp: { name: 'Experiencia', base: 0, current: 0 },
            health: { name: 'Vida', base: 25, current: 25, max: 25 }, armor: { name: 'Armadura', base: 10, current: 10 },
            mana: { name: 'Místyculas', base: 100, current: 100, max: 100 }, actions: { name: 'Acciones', base: 2, current: 3 },
            movement: { name: 'Movimiento (pies)', base: 30, current: 30 },
            magicSave: { name: 'Salvación Magia', base: 10, current: 10 },
            load: { name: 'Carga', base: 10, current: 10 },
            resistance: { name: 'Resistencia', base: 0, current: 0 }, wisdom: { name: 'Sabiduría', base: 0, current: 0 },
        },
        skillPoints: 0,
        combat: { currentActions: 3, },
        equipment: [
            { slotName: 'Arma', type: 'arma', item: null, isCustom: false, isDamageFormulaActive: false },
            { slotName: 'Armadura', type: 'armadura', item: null, isCustom: false, isDamageFormulaActive: false },
            { slotName: 'Accesorio 1', type: 'accesorio', item: null, isCustom: false, isDamageFormulaActive: false },
            { slotName: 'Accesorio 2', type: 'accesorio', item: null, isCustom: false, isDamageFormulaActive: false },
        ],
        inventory: { skills: [], techniques: [], items: [], pets: [], },
        statusEffects: [],
        resources: [] // Para recursos personalizables
    };
}

// ===================================================================================
// GUARDADO Y CARGA DE DATOS
// ===================================================================================

function saveAndRefresh() {
    calculateDerivedStats();
    updateUI();
    saveCharacterToLocalStorage();
}

function saveCharacterToLocalStorage() {
    try {
        character.identity.name = document.getElementById('char-name').value;
        character.identity.race = document.getElementById('char-race').value;
        character.identity.notes = document.getElementById('char-notes').value;
        character.identity.personality = document.getElementById('char-personality').value;
        character.identity.titles = document.getElementById('char-titles').value;
        character.identity.spirits = document.getElementById('char-spirits').value;
        character.identity.size = document.getElementById('char-size').value;
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(character));
    } catch (error) {
        console.error("Error saving character:", error);
        showNotification("Error de Guardado", "No se pudo guardar el personaje.");
    }
}

function loadCharacterFromLocalStorage() {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) return null;
    try {
        const parsedData = JSON.parse(data);
        const defaultChar = getDefaultCharacter();
        // Migración robusta
        let migratedData = { ...defaultChar, ...parsedData };
        migratedData.identity = { ...defaultChar.identity, ...parsedData.identity };
        migratedData.stats = { ...defaultChar.stats, ...parsedData.stats };
        migratedData.inventory = { ...defaultChar.inventory, ...parsedData.inventory };
        
        migratedData.attributes = { ...defaultChar.attributes };
        for(const key in defaultChar.attributes) {
            if(parsedData.attributes && parsedData.attributes[key]) {
                 migratedData.attributes[key] = { ...defaultChar.attributes[key], ...parsedData.attributes[key] };
            }
        }

        migratedData.elements = { ...defaultChar.elements };
        for(const key in defaultChar.elements) {
            if(parsedData.elements && parsedData.elements[key]) {
                 if(typeof parsedData.elements[key] === 'number') {
                     migratedData.elements[key] = { ...defaultChar.elements[key], level: parsedData.elements[key] };
                 } else {
                     migratedData.elements[key] = { ...defaultChar.elements[key], ...parsedData.elements[key] };
                 }
            }
        }

        // Asegurar que las nuevas propiedades existan
        if (!migratedData.fusionElements) migratedData.fusionElements = [];
        if (!migratedData.skillPoints) migratedData.skillPoints = 0;
        if (!migratedData.spiritRelations) migratedData.spiritRelations = defaultChar.spiritRelations;
        if (!migratedData.statusEffects) migratedData.statusEffects = [];
        if (!migratedData.resources) migratedData.resources = [];
        
        // CORRECCIÓN: Asegurar que las habilidades/técnicas antiguas sin nivel se inicialicen en 0.
        ['skills', 'techniques'].forEach(type => {
            if (migratedData.inventory[type]) {
                migratedData.inventory[type].forEach(item => {
                    if (item.level === undefined) item.level = 0;
                    if (item.upgrades === undefined) item.upgrades = 0;
                });
            }
        });

        return migratedData;
    } catch (error) {
        console.error("Error parsing character data:", error);
        showNotification("Error de Carga", "Datos locales corruptos. Se cargará un personaje por defecto.");
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return null;
    }
}

function clearLocalData() {
    openModal(`
        <h3 class="text-xl font-bold mb-4">Confirmar Eliminación</h3>
        <p>¿Seguro que quieres borrar todos los datos del personaje? Esta acción no se puede deshacer y la página se recargará.</p>
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-danger" id="confirm-delete-btn">Sí, borrar todo</button>
        </div>
    `);
    document.getElementById('confirm-delete-btn').onclick = () => {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        localStorage.removeItem(THEME_STORAGE_KEY);
        location.reload();
    };
}


// ===================================================================================
// LÓGICA DE CÁLCULO Y NIVELACIÓN
// ===================================================================================

function getXpForNextLevel() {
    const currentLevel = character.stats.level.current;
    if (currentLevel >= 20) return Infinity;
    return XP_TABLE[currentLevel];
}

function addXP(amount) {
    if (character.stats.level.current >= 20) {
        showNotification("Nivel Máximo", "Ya has alcanzado el nivel máximo.");
        return;
    }
    character.stats.xp.current += amount;
    showNotification("Experiencia Ganada", `¡Has ganado ${amount} XP!`);
    
    let levelsGained = 0;
    let healthGained = 0;
    let skillPointsGained = 0;
    let xpNeeded = getXpForNextLevel();

    while (character.stats.xp.current >= xpNeeded) {
        if (character.stats.level.current >= 20) {
            character.stats.xp.current = xpNeeded;
            break;
        }
        
        const currentLevelBeforeUp = character.stats.level.current;
        character.stats.xp.current -= xpNeeded;
        character.stats.level.current++;
        character.stats.level.base++;
        levelsGained++;
        
        const healthRoll = Math.floor(Math.random() * 8) + 1;
        character.stats.health.base += healthRoll; // Se suma directamente a la base
        healthGained += healthRoll;

        skillPointsGained += SKILL_POINTS_PER_LEVEL[currentLevelBeforeUp] || 0;

        xpNeeded = getXpForNextLevel();
    }
    
    if (levelsGained > 0) {
        character.skillPoints += skillPointsGained;
        openLevelUpModal(levelsGained, healthGained, skillPointsGained);
    }

    saveAndRefresh();
}

function openLevelUpModal(levels, health, points) {
    let levelUpMessage = `¡Felicidades! Has subido ${levels} nivel(es) y ahora eres nivel ${character.stats.level.current}.`;
    levelUpMessage += `\n\nHas ganado +${health} de vida base.`;
    levelUpMessage += `\nHas obtenido ${points} Puntos de Habilidad (PH) para gastar.`;
    
    openModal(`
        <h3 class="text-2xl font-bold mb-4 text-green-500">¡Subida de Nivel!</h3>
        <p class="whitespace-pre-wrap mb-4">${levelUpMessage}</p>
        <div class="text-center mb-4">
             <button class="btn btn-primary" onclick="openSpendSkillPointsModal()">Gastar Puntos de Habilidad</button>
        </div>
        <div class="flex justify-end mt-6">
            <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
        </div>
    `);
}


function getModifier(attributeValue) {
    return Math.floor((attributeValue - 10) / 2);
}

function calculateDerivedStats() {
    if (!character) return;

    // Guardar valores actuales para no perderlos
    const tempHealth = character.stats.health.current;
    const tempMana = character.stats.mana.current;

    // Crear copias temporales para calcular bonificaciones
    const tempAttributes = JSON.parse(JSON.stringify(character.attributes));
    const tempStats = JSON.parse(JSON.stringify(character.stats));

    // 1. Aplicar bonificaciones de equipo a los atributos temporales
    character.equipment.forEach(slot => {
        if (slot.item) {
            slot.item.effects.forEach(effect => {
                const [type, key, value] = effect.split(':');
                if (type === 'attr' && tempAttributes[key]) {
                    tempAttributes[key].value += parseFloat(value);
                }
            });
        }
    });

    // 2. Aplicar bonificaciones de estados (continuos) a los atributos temporales
    character.statusEffects.forEach(status => {
        status.linkedEffects.forEach(effect => {
            if (effect.applyOn === 'continuo' && effect.target === 'self') {
                const keys = effect.attribute.split('.');
                if (keys[0] === 'attributes' && tempAttributes[keys[1]]) {
                    if (effect.modification === 'fijo') {
                        tempAttributes[keys[1]].value += effect.value;
                    } else { // Porcentaje
                        tempAttributes[keys[1]].value *= (1 + effect.value / 100);
                    }
                }
            }
        });
    });

    // Calcular modificadores con atributos ya bonificados
    const mods = {
        FUE: getModifier(tempAttributes.FUE.value), AGI: getModifier(tempAttributes.AGI.value),
        MET: getModifier(tempAttributes.MET.value), INT: getModifier(tempAttributes.INT.value),
        APM: getModifier(tempAttributes.APM.value)
    };
    const level = character.stats.level.current;

    // 3. Calcular estadísticas base derivadas
    let maxHealth = tempStats.health.base + (mods.MET * level);
    // CORRECCIÓN: Usar el valor base del personaje en lugar de un número fijo.
    let armor = tempStats.armor.base + mods.AGI + mods.MET;
    let maxMana = tempStats.mana.base * Math.max(1, mods.INT) * Math.max(1, mods.APM);
    let actions = tempStats.actions.base + mods.AGI + level;
    let movement = tempStats.movement.base + (mods.AGI * 5);
    // CORRECCIÓN: Usar el valor base del personaje en lugar de un número fijo.
    let magicSave = tempStats.magicSave.base + mods.APM + mods.MET;
    let load = tempStats.load.base + (mods.FUE * 2);
    let wisdom = level + mods.INT;
    let resistance = level + mods.MET;
    
    // 4. Aplicar bonificaciones de equipo a las estadísticas
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

    // 5. Aplicar bonificaciones de estados (continuos) a las estadísticas
    character.statusEffects.forEach(status => {
        status.linkedEffects.forEach(effect => {
            if (effect.applyOn === 'continuo' && effect.target === 'self') {
                const keys = effect.attribute.split('.');
                if (keys[0] === 'stats') {
                    let statToModify;
                    if (keys[1] === 'health') statToModify = 'maxHealth';
                    else if (keys[1] === 'mana') statToModify = 'maxMana';
                    else statToModify = keys[1];

                    // Objeto para mapear nombres de variables locales
                    const statMap = { maxHealth, armor, maxMana, actions, movement, magicSave, load, wisdom, resistance };

                    if (statMap.hasOwnProperty(statToModify)) {
                         if (effect.modification === 'fijo') {
                            statMap[statToModify] += effect.value;
                        } else { // Porcentaje
                            statMap[statToModify] *= (1 + effect.value / 100);
                        }
                        // Reasignar el valor modificado a la variable local
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

    // 6. Asignar los valores finales al objeto `character`
    character.stats.health.max = Math.round(maxHealth);
    character.stats.mana.max = Math.round(maxMana);
    character.stats.armor.current = Math.round(armor);
    character.stats.actions.current = Math.round(actions);
    character.stats.movement.current = Math.round(movement);
    character.stats.magicSave.current = Math.round(magicSave);
    character.stats.load.current = Math.round(load);
    character.stats.wisdom.current = Math.round(wisdom);
    character.stats.resistance.current = Math.round(resistance);
    
    // Restaurar vida/maná actuales, ajustando al nuevo máximo
    character.stats.health.current = Math.min(tempHealth, character.stats.health.max);
    character.stats.mana.current = Math.min(tempMana, character.stats.mana.max);
    
    // Restaurar PA, ajustando al nuevo máximo
    character.combat.currentActions = Math.min(character.combat.currentActions, character.stats.actions.current);
}


// ===================================================================================
// RENDERIZADO Y ACTUALIZACIÓN DE LA UI
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
    const attributesContainer = document.getElementById('attributes-container');
    attributesContainer.innerHTML = '';
    let baseAttributes = JSON.parse(JSON.stringify(character.attributes));
    let finalAttributes = JSON.parse(JSON.stringify(character.attributes));

    // Aplicar bonos de equipo y estados para la visualización
    character.equipment.forEach(slot => {
        if (slot.item) slot.item.effects.forEach(effect => {
            const [type, effectKey, value] = effect.split(':');
            if (type === 'attr' && finalAttributes[effectKey]) finalAttributes[effectKey].value += parseFloat(value);
        });
    });
    character.statusEffects.forEach(status => {
        status.linkedEffects.forEach(effect => {
            if (effect.applyOn === 'continuo' && effect.target === 'self' && effect.attribute.startsWith('attributes.')) {
                const key = effect.attribute.split('.')[1];
                if (finalAttributes[key]) {
                    if (effect.modification === 'fijo') finalAttributes[key].value += effect.value;
                    else finalAttributes[key].value *= (1 + effect.value / 100);
                }
            }
        });
    });

    for (const key in baseAttributes) {
        const baseAttr = baseAttributes[key];
        const finalAttr = finalAttributes[key];
        const bonus = Math.round(finalAttr.value - baseAttr.value);
        const mod = getModifier(finalAttr.value);
        const div = document.createElement('div');
        div.className = 'grid grid-cols-6 items-center gap-2';
        div.innerHTML = `
            <label for="attr-${key}" class="font-semibold col-span-2">${baseAttr.name}</label>
            <input type="number" id="attr-${key}" class="input-field text-center" value="${baseAttr.value}">
            <span class="text-green-600 font-medium text-center">(+${bonus})</span>
            <div class="bg-gray-200 dark:bg-gray-600 text-center font-bold rounded-md py-2">${mod >= 0 ? '+' : ''}${mod}</div>
            <button class="btn btn-primary" onclick="rollAttributeCheck('${key}')" title="Lanzar 1d20 + Modificador">🎲</button>
        `;
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
    const statsContainer = document.getElementById('stats-container');
    statsContainer.innerHTML = '';
    const statsToDisplay = {
        health: { name: 'Vida', base: character.stats.health.max, current: character.stats.health.current },
        mana: { name: 'Místyculas', base: character.stats.mana.max, current: character.stats.mana.current },
        armor: { name: 'Armadura', current: character.stats.armor.current },
        actions: { name: 'Acciones', current: character.stats.actions.current },
        movement: { name: 'Movimiento (pies)', current: character.stats.movement.current },
        magicSave: { name: 'Salvación Magia', current: character.stats.magicSave.current },
        load: { name: 'Carga', current: character.stats.load.current },
        resistance: { name: 'Resistencia', current: character.stats.resistance.current },
        wisdom: { name: 'Sabiduría', current: character.stats.wisdom.current },
    };

    for (const key in statsToDisplay) {
        const stat = statsToDisplay[key];
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center stat-block p-2 rounded-md';
        if (key === 'health' || key === 'mana') {
             div.innerHTML = `
                <span class="font-medium">${stat.name}</span>
                <div class="flex items-center gap-1">
                    <input type="number" id="stat-${key}-current" value="${stat.current}" class="input-field w-16 text-center">
                    <span>/</span>
                    <span class="font-bold">${stat.base}</span>
                </div>
            `;
            statsContainer.appendChild(div);
        } else if (['resistance', 'wisdom', 'magicSave'].includes(key)) {
            div.innerHTML = `
                <span class="font-medium">${stat.name}</span>
                <div class="flex items-center gap-2">
                    <span class="font-bold">${stat.current}</span>
                    <button class="btn btn-primary" onclick="rollStatCheck('${key}')" title="Lanzar 1d20 + Valor">🎲</button>
                </div>
            `;
            statsContainer.appendChild(div);
        } else {
            div.innerHTML = `
                <span class="font-medium">${stat.name}</span>
                <span class="font-bold">${stat.current}</span>
            `;
            statsContainer.appendChild(div);
        }
    }

    // Combat
    document.getElementById('current-actions').textContent = character.combat.currentActions;
    document.getElementById('max-actions').textContent = character.stats.actions.current;
    
    // Elements
    renderElements();
    renderFusionElements();
    renderSpiritAmulet();
    
    // Equipment
    renderEquipmentSlots();
    
    // Inventory
    renderInventoryTab('skills');
    renderInventoryTab('techniques');
    renderInventoryTab('items');
    renderInventoryTab('pets');
    document.getElementById('technique-slots').textContent = character.inventory.techniques.length;

    // Status Effects
    renderStatusEffects();
    
    // Resources
    renderResources();
}

function renderElements() {
    const container = document.getElementById('elements-container');
    container.innerHTML = '';
    for (const key in character.elements) {
        const element = character.elements[key];
        const config = ELEMENTS_CONFIG[key];
        const div = document.createElement('div');
        div.className = `p-3 rounded-lg border ${config.color} border-gray-300 dark:border-gray-600`;
        div.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="font-bold text-lg">${config.emoji} ${config.name}</span>
                <div class="flex items-center gap-1">
                    <input type="number" id="element-${key}" class="input-field w-16 text-center" value="${element.level}" min="0">
                    <span class="text-sm text-gray-500">(${element.upgrades})</span>
                </div>
            </div>
            <div class="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div class="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full" style="width: ${element.level}%"></div>
            </div>
        `;
        container.appendChild(div);
    }
}

function renderFusionElements() {
    const container = document.getElementById('fusion-elements-container');
    container.innerHTML = '<h3 class="font-semibold mb-2">Elementos de Fusión</h3>';
    if (character.fusionElements.length === 0) {
        container.innerHTML += '<p class="text-sm text-gray-500">No tienes elementos de fusión.</p>';
        return;
    }
    character.fusionElements.forEach(el => {
        const div = document.createElement('div');
        div.className = 'p-2 bg-gray-100 dark:bg-gray-700 rounded-md';
        div.innerHTML = `<strong>${el.name}</strong> (Nivel ${el.level}) - ${el.description}`;
        container.appendChild(div);
    });
}

function renderSpiritAmulet() {
    const container = document.getElementById('spirit-amulet-container');
    container.innerHTML = '<h3 class="font-semibold mb-2">Amuleto de Espíritus</h3>';
    // This is a placeholder for future functionality
    container.innerHTML += '<p class="text-sm text-gray-500">Funcionalidad no implementada.</p>';
}

function renderEquipmentSlots() {
    const container = document.getElementById('equipment-slots');
    container.innerHTML = '';
    character.equipment.forEach(slot => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 border rounded-md';
        const item = slot.item;
        const itemDisplay = item ? `
            <span class="rarity-text" data-rarity="${item.rarity}">${item.name}</span>
            <span class="text-sm text-gray-500">(${item.rarity})</span>
        ` : '<span class="text-gray-400">Vacío</span>';
        div.innerHTML = `
            <span class="font-medium">${slot.slotName}:</span>
            <div class="flex items-center gap-2">
                ${itemDisplay}
                <button class="btn btn-secondary text-xs" onclick="manageEquipmentSlot('${slot.slotName}')">Gestionar</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderInventoryTab(type) {
    const listContainer = document.getElementById(`${type}-list`);
    listContainer.innerHTML = '';
    const items = character.inventory[type];
    if (items.length === 0) {
        listContainer.innerHTML = `<p class="text-center text-gray-500">No tienes ${type === 'skills' ? 'habilidades' : type === 'techniques' ? 'técnicas/hechizos' : type === 'items' ? 'objetos' : 'mascotas'}.</p>`;
        return;
    }
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `item-card p-3 rounded-md cursor-pointer` + (item.rarity ? ` data-rarity="${item.rarity}"` : '');
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold">${item.name}</p>
                    ${item.rarity ? `<span class="rarity-text text-xs">${item.rarity}</span>` : ''}
                    ${item.level !== undefined ? `<span class="text-xs ml-2">Nivel: ${item.level}</span>` : ''}
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${item.description || ''}</p>
                </div>
                <button class="btn btn-danger text-xs" onclick="removeInventoryItem('${type}', ${index})">X</button>
            </div>
        `;
        listContainer.appendChild(div);
    });
}

function renderStatusEffects() {
    const listContainer = document.getElementById('status-effects-list');
    listContainer.innerHTML = '';
    if (character.statusEffects.length === 0) {
        listContainer.innerHTML = '<p class="text-center text-gray-500">No tienes efectos activos.</p>';
        return;
    }
    character.statusEffects.forEach((status, index) => {
        const div = document.createElement('div');
        div.className = `status-card p-3 rounded-md cursor-pointer` + (status.type ? ` data-type="${status.type}"` : '');
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-bold">${status.name}</p>
                    <p class="text-sm">${status.duration} turnos</p>
                </div>
                <button class="btn btn-danger text-xs" onclick="removeStatusEffect(${index})">X</button>
            </div>
        `;
        listContainer.appendChild(div);
    });
}

function renderResources() {
    const container = document.getElementById('resources-container');
    container.innerHTML = '';
    if (character.resources.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No tienes recursos personalizados.</p>';
        return;
    }
    character.resources.forEach((res, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 border rounded-md';
        div.innerHTML = `
            <span class="font-medium">${res.name}:</span>
            <div class="flex items-center gap-2">
                <input type="number" class="input-field w-16 text-center" value="${res.current}" min="0">
                <span>/</span>
                <span>${res.max}</span>
                <button class="btn btn-danger text-xs" onclick="removeResource(${index})">X</button>
            </div>
        `;
        container.appendChild(div);
    });
}


// ===================================================================================
// MANEJO DE EVENTOS Y MODALES
// ===================================================================================

function openModal(content, isSecondary = false) {
    const modalOverlay = isSecondary ? document.getElementById('modal-secondary') : document.getElementById('modal');
    const modalContent = isSecondary ? document.getElementById('modal-secondary-content') : document.getElementById('modal-content');
    modalContent.innerHTML = content;
    modalOverlay.classList.add('active');
}

function closeModal(isSecondary = false) {
    const modalOverlay = isSecondary ? document.getElementById('modal-secondary') : document.getElementById('modal');
    modalOverlay.classList.remove('active');
}

function showNotification(title, message) {
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-message').textContent = message;
    document.getElementById('notification-modal').classList.add('active');
}

// Event Listeners
document.getElementById('add-xp-btn').addEventListener('click', () => {
    const input = document.getElementById('xp-to-add');
    const amount = parseInt(input.value);
    if (!isNaN(amount) && amount > 0) {
        addXP(amount);
        input.value = '';
    }
});

document.getElementById('end-turn-btn').addEventListener('click', () => {
    character.combat.currentActions = character.stats.actions.current;
    // Update status effects duration
    character.statusEffects = character.statusEffects.map(status => ({
        ...status,
        duration: status.duration - 1
    })).filter(status => status.duration > 0);
    saveAndRefresh();
    showNotification("Turno Finalizado", "Tus Puntos de Acción han sido restaurados y los efectos de estado han avanzado.");
});

document.getElementById('theme-toggle-btn').addEventListener('click', () => {
    const body = document.body;
    const themes = ['', 'theme-dark', 'theme-forest', 'theme-ocean', 'theme-fire', 'theme-dusk'];
    let currentTheme = themes.find(theme => body.classList.contains(theme)) || '';
    let nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
    body.className = body.className.replace(new RegExp(`\\b(${themes.join('|')})\\b`, 'g'), '').trim();
    if (themes[nextIndex]) body.classList.add(themes[nextIndex]);
    localStorage.setItem(THEME_STORAGE_KEY, themes[nextIndex]);
});

document.getElementById('export-json-btn').addEventListener('click', () => {
    saveCharacterToLocalStorage(); // Ensure latest data is saved
    const dataStr = JSON.stringify(character, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${character.identity.name || 'personaje'}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
});

document.getElementById('import-json-btn').addEventListener('click', () => {
    document.getElementById('json-import-input').click();
});

document.getElementById('json-import-input').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                character = importedData;
                saveAndRefresh();
                showNotification("Importación Exitosa", "Los datos del personaje han sido cargados.");
            } catch (error) {
                showNotification("Error de Importación", "El archivo seleccionado no es un JSON válido.");
            }
        };
        reader.readAsText(file);
    }
});

document.getElementById('clear-local-data-btn').addEventListener('click', clearLocalData);

document.getElementById('character-image-upload').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            character.identity.image = e.target.result;
            document.getElementById('character-image-preview').src = e.target.result;
            saveCharacterToLocalStorage();
        };
        reader.readAsDataURL(file);
    }
});

// Tab switching
document.querySelectorAll('#inventory-tabs button').forEach(button => {
    button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        document.querySelectorAll('#inventory-tabs button').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
        button.classList.add('active');
        document.getElementById(`tab-content-${tabName}`).classList.remove('hidden');
    });
});

// Placeholder event listeners for buttons that need modals
document.getElementById('spend-skill-points-btn').addEventListener('click', () => openSpendSkillPointsModal());
document.getElementById('restore-stats-btn').addEventListener('click', () => { character.stats.health.current = character.stats.health.max; character.stats.mana.current = character.stats.mana.max; saveAndRefresh(); showNotification("Recuperado", "Vida y Místyculas restauradas al máximo."); });
document.getElementById('edit-base-stats-btn').addEventListener('click', () => showNotification("Próximamente", "El editor de estadísticas base estará disponible en futuras versiones."));
document.getElementById('add-status-effect-btn').addEventListener('click', () => openAddStatusEffectModal());
document.getElementById('manage-slots-btn').addEventListener('click', () => showNotification("Próximamente", "La gestión de slots estará disponible en futuras versiones."));
document.getElementById('add-resource-btn').addEventListener('click', () => openManageResourcesModal());
document.getElementById('add-skill-btn').addEventListener('click', () => openAddItemModal('skills'));
document.getElementById('add-technique-btn').addEventListener('click', () => openAddItemModal('techniques'));
document.getElementById('add-item-btn').addEventListener('click', () => openAddItemModal('items'));
document.getElementById('add-pet-btn').addEventListener('click', () => openAddItemModal('pets'));

// ===================================================================================
// MODALS CONTENT GENERATORS
// ===================================================================================

function openSpendSkillPointsModal() {
    if (character.skillPoints <= 0) {
        showNotification("Sin Puntos", "No tienes Puntos de Habilidad (PH) para gastar.");
        return;
    }
    let content = `
        <h3 class="text-xl font-bold mb-4">Gastar Puntos de Habilidad (PH: ${character.skillPoints})</h3>
        <div class="space-y-4">
            <div>
                <h4 class="font-semibold mb-2">Mejorar Atributos (Costo: 1 PH)</h4>
                <div class="grid grid-cols-1 gap-2">
    `;
    for (const key in character.attributes) {
        const attr = character.attributes[key];
        content += `
            <div class="flex justify-between items-center p-2 border rounded">
                <span>${attr.name} (${attr.value})</span>
                <button class="btn btn-primary" onclick="spendPointOn('attr', '${key}')">Mejorar</button>
            </div>
        `;
    }
    content += `
                </div>
            </div>
            <div>
                <h4 class="font-semibold mb-2">Mejorar Afinidad Elemental (Costo: 1 PH)</h4>
                <div class="grid grid-cols-2 gap-2">
    `;
    for (const key in character.elements) {
        const el = character.elements[key];
        content += `
            <div class="flex justify-between items-center p-2 border rounded">
                <span>${ELEMENTS_CONFIG[key].emoji} ${el.name} (${el.level})</span>
                <button class="btn btn-primary" onclick="spendPointOn('element', '${key}')">Mejorar</button>
            </div>
        `;
    }
    content += `
                </div>
            </div>
        </div>
        <div class="flex justify-end mt-6">
            <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
        </div>
    `;
    openModal(content);
}

function spendPointOn(type, key) {
    if (character.skillPoints <= 0) return;
    if (type === 'attr') {
        character.attributes[key].value++;
        character.attributes[key].upgrades++;
    } else if (type === 'element') {
        character.elements[key].level++;
        character.elements[key].upgrades++;
    }
    character.skillPoints--;
    saveAndRefresh();
    openSpendSkillPointsModal(); // Refresh modal
}

function openAddStatusEffectModal() {
    tempLinkedEffects = [];
    let content = `
        <h3 class="text-xl font-bold mb-4">Añadir Efecto de Estado</h3>
        <div class="space-y-4">
            <div><label class="block text-sm font-medium">Nombre</label><input type="text" id="status-name" class="input-field" placeholder="Ej: Envenenado"></div>
            <div><label class="block text-sm font-medium">Tipo</label>
                <select id="status-type" class="input-field">
                    <option value="Buff">Buff</option><option value="Debuff">Debuff</option><option value="Neutral">Neutral</option>
                </select>
            </div>
            <div><label class="block text-sm font-medium">Duración (turnos)</label><input type="number" id="status-duration" class="input-field" value="3" min="1"></div>
            <div>
                <h4 class="font-semibold mb-2">Efectos Vinculados</h4>
                <div id="linked-effects-list" class="space-y-2 mb-2"></div>
                <button class="btn btn-secondary w-full" onclick="addLinkedEffectToStatus()">Añadir Efecto</button>
            </div>
        </div>
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveStatusEffect()">Guardar Estado</button>
        </div>
    `;
    openModal(content);
}

function addLinkedEffectToStatus() {
    // This would open another modal or a more complex form. For simplicity, we'll add a placeholder.
    tempLinkedEffects.push({ attribute: 'stats.health', modification: 'fijo', value: -5, applyOn: 'turno', target: 'self' });
    renderLinkedEffectsList();
}

function renderLinkedEffectsList() {
    const list = document.getElementById('linked-effects-list');
    if (!list) return;
    list.innerHTML = tempLinkedEffects.map((effect, index) => `<p class="text-sm p-1 bg-gray-100 rounded">Efecto ${index + 1}: ${effect.attribute} ${effect.modification} ${effect.value}</p>`).join('');
}

function saveStatusEffect() {
    const name = document.getElementById('status-name').value;
    const type = document.getElementById('status-type').value;
    const duration = parseInt(document.getElementById('status-duration').value);
    if (!name || !duration) return;

    character.statusEffects.push({ name, type, duration, linkedEffects: [...tempLinkedEffects] });
    tempLinkedEffects = [];
    saveAndRefresh();
    closeModal();
}

function openManageResourcesModal() {
    let content = `
        <h3 class="text-xl font-bold mb-4">Gestionar Recursos</h3>
        <div class="space-y-4">
            <div>
                <h4 class="font-semibold mb-2">Añadir Recurso</h4>
                <div class="grid grid-cols-2 gap-2">
                    <input type="text" id="new-res-name" class="input-field" placeholder="Nombre">
                    <input type="number" id="new-res-max" class="input-field" placeholder="Máximo">
                </div>
                <button class="btn btn-primary w-full mt-2" onclick="addResource()">Añadir</button>
            </div>
        </div>
        <div class="flex justify-end mt-6">
            <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
        </div>
    `;
    openModal(content);
}

function addResource() {
    const name = document.getElementById('new-res-name').value;
    const max = parseInt(document.getElementById('new-res-max').value);
    if (!name || !max) return;
    character.resources.push({ name, max, current: max });
    saveAndRefresh();
    openManageResourcesModal(); // Refresh modal
}

function openAddItemModal(type) {
    const typeName = type === 'skills' ? 'Habilidad' : type === 'techniques' ? 'Técnica/Hechizo' : type === 'items' ? 'Objeto' : 'Mascota';
    let content = `
        <h3 class="text-xl font-bold mb-4">Añadir ${typeName}</h3>
        <div class="space-y-4 modal-scrollable-content">
            <div><label class="block text-sm font-medium">Nombre</label><input type="text" id="new-item-name" class="input-field" placeholder="Nombre del ${typeName}"></div>
            <div><label class="block text-sm font-medium">Descripción</label><textarea id="new-item-description" class="input-field" rows="3"></textarea></div>
            <div>
                <label class="block text-sm font-medium">Rareza</label>
                <select id="new-item-rarity" class="input-field">
                    ${RARITIES.map(r => `<option value="${r}">${r}</option>`).join('')}
                </select>
            </div>
    `;
    if (type === 'skills' || type === 'techniques') {
        content += `
            <div><label class="block text-sm font-medium">Nivel</label><input type="number" id="new-item-level" class="input-field" value="0" min="0"></div>
        `;
    }
    content += `
        </div>
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveNewItem('${type}')">Guardar</button>
        </div>
    `;
    openModal(content);
}

function saveNewItem(type) {
    const name = document.getElementById('new-item-name').value;
    const description = document.getElementById('new-item-description').value;
    const rarity = document.getElementById('new-item-rarity').value;
    if (!name) return;

    const newItem = { name, description, rarity };
    if (type === 'skills' || type === 'techniques') {
        newItem.level = parseInt(document.getElementById('new-item-level').value) || 0;
        newItem.upgrades = 0;
    }
    
    character.inventory[type].push(newItem);
    saveAndRefresh();
    closeModal();
}

// ===================================================================================
// HELPER FUNCTIONS
// ===================================================================================

function useAction(cost, name) {
    if (character.combat.currentActions < cost) {
        showNotification("Acción Inválida", `No tienes suficientes Puntos de Acción. Necesitas ${cost}.`);
        return;
    }
    character.combat.currentActions -= cost;
    updateUI();
    showNotification("Acción Realizada", `Has usado '${name}' por ${cost} PA.`);
}

function rollAttributeCheck(attrKey) {
    const attr = character.attributes[attrKey];
    const mod = getModifier(attr.value);
    const roll = Math.floor(Math.random() * 20) + 1 + mod;
    showNotification(`Tirada de ${attr.name}`, `1d20 + ${mod} = ${roll}`);
}

function rollStatCheck(statKey) {
    const stat = character.stats[statKey];
    const roll = Math.floor(Math.random() * 20) + 1 + stat.current;
    showNotification(`Tirada de ${stat.name}`, `1d20 + ${stat.current} = ${roll}`);
}

function removeInventoryItem(type, index) {
    character.inventory[type].splice(index, 1);
    saveAndRefresh();
}

function removeStatusEffect(index) {
    character.statusEffects.splice(index, 1);
    saveAndRefresh();
}

function removeResource(index) {
    character.resources.splice(index, 1);
    saveAndRefresh();
}

function manageEquipmentSlot(slotName) {
    showNotification("Próximamente", `La gestión del slot '${slotName}' estará disponible en futuras versiones.`);
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

// ===================================================================================
// INITIALIZATION
// ===================================================================================

window.onload = () => {
    // Load theme first
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || '';
    if (savedTheme) document.body.classList.add(savedTheme);

    // Load character data
    character = loadCharacterFromLocalStorage() || getDefaultCharacter();
    
    // Initial render
    updateUI();

    // Add event listeners for dynamic inputs
    document.getElementById('attributes-container').addEventListener('change', (e) => {
        if (e.target.id.startsWith('attr-')) {
            const key = e.target.id.split('-')[1];
            character.attributes[key].value = parseInt(e.target.value) || 0;
            saveAndRefresh();
        }
    });

    document.getElementById('elements-container').addEventListener('change', (e) => {
        if (e.target.id.startsWith('element-')) {
            const key = e.target.id.split('-')[1];
            character.elements[key].level = parseInt(e.target.value) || 0;
            saveAndRefresh();
        }
    });

    document.getElementById('stats-container').addEventListener('change', (e) => {
        if (e.target.id.startsWith('stat-')) {
            const parts = e.target.id.split('-');
            const key = parts[1];
            const type = parts[2];
            if (type === 'current') {
                character.stats[key].current = parseInt(e.target.value) || 0;
                saveAndRefresh();
            }
        }
    });

    // Auto-save on input changes for identity fields
    ['char-name', 'char-race', 'char-notes', 'char-personality', 'char-titles', 'char-spirits', 'char-size'].forEach(id => {
        document.getElementById(id).addEventListener('input', saveCharacterToLocalStorage);
    });
};

}); // End DOMContentLoaded
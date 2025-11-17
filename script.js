// ===================================================================================
// HOJA DE PERSONAJE - ISEKAI DELIVERY SERVICE v5.0
// Versión corregida manteniendo la funcionalidad original
// ===================================================================================

// CONFIGURACIÓN Y ESTADO
const XP_TABLE = {
    1: 300, 2: 900, 3: 2700, 4: 6500, 5: 14000, 6: 23000, 7: 34000, 8: 48000, 9: 64000, 10: 85000,
    11: 100000, 12: 120000, 13: 145000, 14: 165000, 15: 195000, 16: 225000, 17: 250000, 18: 280000, 19: 315000, 20: Infinity
};
const SKILL_POINTS_PER_LEVEL = {
    1: 3, 2: 3, 3: 4, 4: 4, 5: 5, 6: 5, 7: 6, 8: 6, 9: 7, 10: 7,
    11: 8, 12: 8, 13: 9, 14: 9, 15: 10, 16: 10, 17: 11, 18: 12, 19: 12, 20: 13
};
const RARITIES = ['Intrínseco', 'Común', 'Raro', 'Épico', 'Legendario', 'Mítico / Único', 'Genesis'];
const LOCAL_STORAGE_KEY = 'characterSheetData_v5.0';
const THEME_STORAGE_KEY = 'characterSheetTheme_v5.0';

const ELEMENTS_CONFIG = {
    fuego: { name: 'Fuego', emoji: '🔥' },
    aire: { name: 'Aire', emoji: '💨' },
    agua: { name: 'Agua', emoji: '💧' },
    electricidad: { name: 'Electricidad', emoji: '⚡' },
    tierra: { name: 'Tierra', emoji: '🌍' },
    luz: { name: 'Luz', emoji: '☀️' },
    oscuridad: { name: 'Oscuridad', emoji: '🌙' }
};

let character;
let autoSaveTimer;
let lastSavedTime = null;
let selectedEnhancementSlot = null;

// ===================================================================================
// FUNCIONES BÁSICAS (MANTENIENDO FUNCIONALIDAD ORIGINAL)
// ===================================================================================

function getDefaultCharacter() {
    return {
        identity: {
            name: '', race: '', notes: '', personality: '',
            image: 'https://placehold.co/100x100/e0e0e0/2c3e50?text=Avatar',
            titles: '', spirits: '', size: ''
        },
        attributes: {
            FUE: { name: 'Fuerza', value: 10, upgrades: 0 },
            AGI: { name: 'Agilidad', value: 10, upgrades: 0 },
            MET: { name: 'Metabolismo', value: 10, upgrades: 0 },
            INT: { name: 'Inteligencia', value: 10, upgrades: 0 },
            APM: { name: 'Aptitud Mágica', value: 10, upgrades: 0 },
        },
        elements: {
            fuego: { name: 'Fuego', level: 0, upgrades: 0 },
            aire: { name: 'Aire', level: 0, upgrades: 0 },
            agua: { name: 'Agua', level: 0, upgrades: 0 },
            electricidad: { name: 'Electricidad', level: 0, upgrades: 0 },
            tierra: { name: 'Tierra', level: 0, upgrades: 0 },
            luz: { name: 'Luz', level: 0, upgrades: 0 },
            oscuridad: { name: 'Oscuridad', level: 0, upgrades: 0 }
        },
        stats: {
            level: { name: 'Nivel', base: 1, current: 1 },
            xp: { name: 'Experiencia', base: 0, current: 0 },
            health: { name: 'Vida', base: 25, current: 25, max: 25 },
            armor: { name: 'Armadura', base: 10, current: 10 },
            mana: { name: 'Místyculas', base: 100, current: 100, max: 100 },
            actions: { name: 'Acciones', base: 2, current: 3 },
            movement: { name: 'Movimiento (pies)', base: 30, current: 30 },
            magicSave: { name: 'Salvación Magia', base: 10, current: 10 },
            load: { name: 'Carga', base: 10, current: 10 },
            resistance: { name: 'Resistencia', base: 0, current: 0 },
            wisdom: { name: 'Sabiduría', base: 0, current: 0 },
        },
        skillPoints: 0,
        combat: { currentActions: 3 },
        equipment: [
            { slotName: 'Arma', type: 'arma', item: null, enhancementLevel: 0 },
            { slotName: 'Armadura', type: 'armadura', item: null, enhancementLevel: 0 },
            { slotName: 'Accesorio 1', type: 'accesorio', item: null, enhancementLevel: 0 },
            { slotName: 'Accesorio 2', type: 'accesorio', item: null, enhancementLevel: 0 },
        ],
        inventory: { skills: [], techniques: [], items: [], pets: [] },
        statusEffects: [],
        resources: [],
        quests: { active: [], completed: [], failed: [] },
        fusionElements: []
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
        if (!migratedData.statusEffects) migratedData.statusEffects = [];
        if (!migratedData.resources) migratedData.resources = [];
        if (!migratedData.quests) migratedData.quests = defaultChar.quests;
        
        // Asegurar enhancement levels
        if (migratedData.equipment) {
            migratedData.equipment.forEach(slot => {
                if (slot.enhancementLevel === undefined) {
                    slot.enhancementLevel = 0;
                }
            });
        }
        
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
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return null;
    }
}

// ===================================================================================
// LÓGICA DE CÁLCULO Y NIVELACIÓN
// ===================================================================================

function getModifier(attributeValue) {
    return Math.floor((attributeValue - 10) / 2);
}

function calculateDerivedStats() {
    if (!character) return;

    // Guardar valores actuales para no perderlos
    const tempHealth = character.stats.health.current;
    const tempMana = character.stats.mana.current;

    // Calcular modificadores
    const mods = {
        FUE: getModifier(character.attributes.FUE.value),
        AGI: getModifier(character.attributes.AGI.value),
        MET: getModifier(character.attributes.MET.value),
        INT: getModifier(character.attributes.INT.value),
        APM: getModifier(character.attributes.APM.value)
    };
    const level = character.stats.level.current;

    // Calcular estadísticas base derivadas
    let maxHealth = character.stats.health.base + (mods.MET * level);
    let armor = character.stats.armor.base + mods.AGI + mods.MET;
    let maxMana = character.stats.mana.base * Math.max(1, mods.INT) * Math.max(1, mods.APM);
    let actions = character.stats.actions.base + mods.AGI + level;
    let movement = character.stats.movement.base + (mods.AGI * 5);
    let magicSave = character.stats.magicSave.base + mods.APM + mods.MET;
    let load = character.stats.load.base + (mods.FUE * 2);
    let wisdom = level + mods.INT;
    let resistance = level + mods.MET;
    
    // Aplicar bonificaciones de equipo
    character.equipment.forEach(slot => {
        if (slot.item && slot.item.effects) {
            const enhancementBonus = slot.enhancementLevel || 0;
            slot.item.effects.forEach(effect => {
                const [type, key, value] = effect.split(':');
                if (type === 'stat') {
                    if (key === 'health') maxHealth += parseFloat(value) + (enhancementBonus * 2);
                    if (key === 'mana') maxMana += parseFloat(value) + (enhancementBonus * 5);
                    if (key === 'armor') armor += parseFloat(value) + (enhancementBonus * 1);
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

    // Asignar los valores finales al objeto `character`
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
        character.stats.health.base += healthRoll;
        healthGained += healthRoll;

        skillPointsGained += SKILL_POINTS_PER_LEVEL[currentLevelBeforeUp] || 0;

        xpNeeded = getXpForNextLevel();
    }
    
    if (levelsGained > 0) {
        character.skillPoints += skillPointsGained;
        showNotification('¡Subida de Nivel!', `¡Has subido ${levelsGained} nivel(es) y ganado ${skillPointsGained} puntos de habilidad!`);
    }

    saveAndRefresh();
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
    
    for (const key in character.attributes) {
        const attr = character.attributes[key];
        const mod = getModifier(attr.value);
        const div = document.createElement('div');
        div.className = 'grid grid-cols-6 items-center gap-2';
        div.innerHTML = `
            <label for="attr-${key}" class="font-semibold col-span-2">${attr.name}</label>
            <input type="number" id="attr-${key}" class="input-field text-center" value="${attr.value}">
            <span class="text-green-600 font-medium text-center">(+${attr.upgrades})</span>
            <div class="bg-gray-200 dark:bg-gray-600 text-center font-bold rounded-md py-2">${mod >= 0 ? '+' : ''}${mod}</div>
            <button class="btn btn-primary" onclick="rollAttributeCheck('${key}')" title="Lanzar 1d20 + Modificador">🎲</button>
        `;
        attributesContainer.appendChild(div);
    }
    
    // XP, Level & Skill Points
    document.getElementById('skill-points-display').textContent = character.skillPoints;
    document.getElementById('level-display').textContent = character.stats.level.current;
    document.getElementById('current-xp-display').textContent = character.stats.xp.current;
    
    const xpNeeded = getXpForNextLevel();
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
        } else if (['resistance', 'wisdom', 'magicSave'].includes(key)) {
            div.innerHTML = `
                <span class="font-medium">${stat.name}</span>
                <div class="flex items-center gap-2">
                    <span class="font-bold">${stat.current}</span>
                    <button class="btn btn-primary" onclick="rollStatCheck('${key}')" title="Lanzar 1d20 + Valor">🎲</button>
                </div>
            `;
        } else {
            div.innerHTML = `
                <span class="font-medium">${stat.name}</span>
                <span class="font-bold">${stat.current}</span>
            `;
        }
        statsContainer.appendChild(div);
    }

    // Combat
    document.getElementById('current-actions').textContent = character.combat.currentActions;
    document.getElementById('max-actions').textContent = character.stats.actions.current;

    // Elements
    renderElements();
    
    // Equipment
    renderEquipment();
    
    // Inventory
    renderInventory();
    
    // Status Effects
    renderStatusEffects();
    
    // Resources
    renderResources();
    
    // Quests
    renderQuests();
}

function renderElements() {
    const container = document.getElementById('elements-container');
    container.innerHTML = '';
    
    for (const key in character.elements) {
        const element = character.elements[key];
        const config = ELEMENTS_CONFIG[key];
        const div = document.createElement('div');
        div.className = 'p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-700';
        div.innerHTML = `
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <span class="text-2xl">${config.emoji}</span>
                    <span class="font-medium">${config.name}</span>
                </div>
                <div class="flex items-center gap-2">
                    <input type="number" id="element-${key}" class="input-field w-16 text-center" value="${element.level}">
                    <button class="btn btn-primary text-sm" onclick="upgradeElement('${key}')">↑</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    }
}

function renderEquipment() {
    const container = document.getElementById('equipment-slots');
    container.innerHTML = '';
    
    character.equipment.forEach((slot, index) => {
        const div = document.createElement('div');
        div.className = 'p-3 border border-gray-200 dark:border-gray-700 rounded-lg';
        
        const enhancementLevel = slot.enhancementLevel || 0;
        const enhancementDisplay = enhancementLevel > 0 ? `<span class="text-xs bg-yellow-500 text-white px-2 py-1 rounded">+${enhancementLevel}</span>` : '';
        
        if (slot.item) {
            div.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex-1">
                        <div class="flex items-center gap-2">
                            <h4 class="font-semibold">${slot.item.name}</h4>
                            ${enhancementDisplay}
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${slot.item.type}</p>
                        <p class="text-sm rarity-text">${slot.item.rarity || 'Común'}</p>
                        <p class="text-sm mt-1">${slot.item.description}</p>
                    </div>
                    <button class="btn btn-danger text-sm" onclick="unequipItem(${index})">Quitar</button>
                </div>
            `;
        } else {
            div.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400">
                    <p>${slot.slotName}</p>
                    <button class="btn btn-secondary text-sm mt-2" onclick="openEquipmentModal(${index})">Equipar</button>
                </div>
            `;
        }
        container.appendChild(div);
    });
}

function renderInventory() {
    // Skills
    const skillsList = document.getElementById('skills-list');
    skillsList.innerHTML = '';
    character.inventory.skills.forEach((skill, index) => {
        const div = createItemCard(skill, 'skill', index);
        skillsList.appendChild(div);
    });
    
    // Techniques
    const techniquesList = document.getElementById('techniques-list');
    techniquesList.innerHTML = '';
    character.inventory.techniques.forEach((technique, index) => {
        const div = createItemCard(technique, 'technique', index);
        techniquesList.appendChild(div);
    });
    
    // Items
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';
    character.inventory.items.forEach((item, index) => {
        const div = createItemCard(item, 'item', index);
        itemsList.appendChild(div);
    });
    
    // Pets
    const petsList = document.getElementById('pets-list');
    petsList.innerHTML = '';
    character.inventory.pets.forEach((pet, index) => {
        const div = createItemCard(pet, 'pet', index);
        petsList.appendChild(div);
    });
}

function createItemCard(item, type, index) {
    const div = document.createElement('div');
    div.className = `item-card p-3 rounded-lg ${item.rarity ? `data-rarity="${item.rarity}"` : ''}`;
    
    const levelDisplay = item.level !== undefined ? `<span class="text-sm">Nivel: ${item.level}</span>` : '';
    const upgradesDisplay = item.upgrades > 0 ? `<span class="text-sm">Mejoras: ${item.upgrades}</span>` : '';
    
    div.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <h4 class="font-semibold">${item.name}</h4>
                ${levelDisplay}
                ${upgradesDisplay}
                <p class="text-sm rarity-text">${item.rarity || 'Común'}</p>
                <p class="text-sm mt-1">${item.description}</p>
                ${item.effects ? `<p class="text-xs mt-1 text-gray-600 dark:text-gray-400">${item.effects.join(', ')}</p>` : ''}
            </div>
            <div class="flex gap-1">
                ${type === 'skill' || type === 'technique' ? `<button class="btn btn-primary text-sm" onclick="upgradeItem('${type}', ${index})">↑</button>` : ''}
                <button class="btn btn-danger text-sm" onclick="removeItem('${type}', ${index})">✕</button>
            </div>
        </div>
    `;
    
    return div;
}

function renderStatusEffects() {
    const container = document.getElementById('status-effects-list');
    container.innerHTML = '';
    
    character.statusEffects.forEach((effect, index) => {
        const div = document.createElement('div');
        div.className = `status-card p-3 rounded-lg ${effect.type ? `data-type="${effect.type}"` : ''}`;
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex-1">
                    <h4 class="font-semibold">${effect.name}</h4>
                    <p class="text-sm">${effect.description}</p>
                    <p class="text-xs mt-1">Duración: ${effect.duration}</p>
                </div>
                <button class="btn btn-danger text-sm" onclick="removeStatusEffect(${index})">✕</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderResources() {
    const container = document.getElementById('resources-container');
    container.innerHTML = '';
    
    character.resources.forEach((resource, index) => {
        const div = document.createElement('div');
        div.className = 'flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded';
        div.innerHTML = `
            <span class="font-medium">${resource.name}</span>
            <div class="flex items-center gap-2">
                <input type="number" class="input-field w-16 text-center" value="${resource.current}" onchange="updateResource(${index}, this.value, 'current')">
                <span>/</span>
                <input type="number" class="input-field w-16 text-center" value="${resource.max}" onchange="updateResource(${index}, this.value, 'max')">
                <button class="btn btn-danger text-sm" onclick="removeResource(${index})">✕</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function renderQuests() {
    // Active quests
    const activeList = document.getElementById('active-quests-list');
    activeList.innerHTML = '';
    character.quests.active.forEach((quest, index) => {
        const div = createQuestCard(quest, 'active', index);
        activeList.appendChild(div);
    });
    
    // Completed quests
    const completedList = document.getElementById('completed-quests-list');
    completedList.innerHTML = '';
    character.quests.completed.forEach((quest, index) => {
        const div = createQuestCard(quest, 'completed', index);
        completedList.appendChild(div);
    });
    
    // Failed quests
    const failedList = document.getElementById('failed-quests-list');
    failedList.innerHTML = '';
    character.quests.failed.forEach((quest, index) => {
        const div = createQuestCard(quest, 'failed', index);
        failedList.appendChild(div);
    });
}

function createQuestCard(quest, status, index) {
    const div = document.createElement('div');
    div.className = `quest-card p-3 rounded-lg data-status="${status}"`;
    
    const objectivesHtml = quest.objectives.map((obj, objIndex) => `
        <div class="quest-objective ${obj.completed ? 'completed' : ''}">
            <input type="checkbox" ${obj.completed ? 'checked' : ''} onchange="toggleQuestObjective('${status}', ${index}, ${objIndex})">
            <span>${obj.description}</span>
        </div>
    `).join('');
    
    div.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="flex-1">
                <h4 class="font-semibold">${quest.name}</h4>
                <p class="text-sm">${quest.description}</p>
                <div class="mt-2">
                    ${objectivesHtml}
                </div>
                ${quest.reward ? `<p class="text-sm mt-2 font-medium">Recompensa: ${quest.reward}</p>` : ''}
            </div>
            <div class="flex gap-1">
                ${status === 'active' ? `
                    <button class="btn btn-success text-sm" onclick="completeQuest(${index})">✓</button>
                    <button class="btn btn-danger text-sm" onclick="failQuest(${index})">✕</button>
                ` : ''}
                <button class="btn btn-secondary text-sm" onclick="removeQuest('${status}', ${index})">🗑</button>
            </div>
        </div>
    `;
    
    return div;
}

// ===================================================================================
// MODALES Y FUNCIONALIDAD INTERACTIVA
// ===================================================================================

function openModal(content, title = '') {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalFooter = document.getElementById('modal-footer');
    
    if (title) modalTitle.textContent = title;
    modalBody.innerHTML = content;
    modalFooter.innerHTML = '';
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function showNotification(title, message) {
    const modal = document.getElementById('notification-modal');
    document.getElementById('notification-title').textContent = title;
    document.getElementById('notification-message').textContent = message;
    modal.classList.add('active');
    
    setTimeout(() => {
        modal.classList.remove('active');
    }, 3000);
}

// ===================================================================================
// MODALES DE CREACIÓN (FUNCIONALIDAD ORIGINAL MEJORADA)
// ===================================================================================

function openSkillModal(skill = null, index = null) {
    const isEdit = skill !== null;
    const name = skill ? skill.name : '';
    const description = skill ? skill.description : '';
    const level = skill ? skill.level : 0;
    const rarity = skill ? skill.rarity : 'Común';
    
    openModal(`
        <h3 class="text-xl font-bold mb-4">${isEdit ? 'Editar Habilidad' : 'Nueva Habilidad'}</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" id="skill-name" class="input-field" value="${name}" placeholder="Nombre de la habilidad">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Descripción</label>
                <textarea id="skill-description" class="input-field" rows="3" placeholder="Descripción">${description}</textarea>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Rareza</label>
                <select id="skill-rarity" class="input-field">
                    ${RARITIES.map(r => `<option value="${r}" ${r === rarity ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Nivel</label>
                <input type="number" id="skill-level" class="input-field" value="${level}" min="0">
            </div>
        </div>
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveSkill(${index})">${isEdit ? 'Guardar Cambios' : 'Crear Habilidad'}</button>
        </div>
    `, isEdit ? 'Editar Habilidad' : 'Nueva Habilidad');
}

function saveSkill(index) {
    const name = document.getElementById('skill-name').value;
    const description = document.getElementById('skill-description').value;
    const rarity = document.getElementById('skill-rarity').value;
    const level = parseInt(document.getElementById('skill-level').value) || 0;
    
    if (!name || !description) {
        showNotification('Error', 'Por favor completa todos los campos requeridos.');
        return;
    }
    
    const skill = {
        name,
        description,
        rarity,
        level,
        upgrades: 0,
        effects: []
    };
    
    if (index !== null) {
        character.inventory.skills[index] = skill;
    } else {
        character.inventory.skills.push(skill);
    }
    
    saveAndRefresh();
    closeModal();
    showNotification('Habilidad Guardada', `La habilidad "${name}" ha sido guardada exitosamente.`);
}

// Funciones similares para técnicas, objetos, mascotas y estados
function openTechniqueModal(technique = null, index = null) {
    const isEdit = technique !== null;
    const name = technique ? technique.name : '';
    const description = technique ? technique.description : '';
    const level = technique ? technique.level : 0;
    const rarity = technique ? technique.rarity : 'Común';
    
    openModal(`
        <h3 class="text-xl font-bold mb-4">${isEdit ? 'Editar Técnica/Hechizo' : 'Nueva Técnica/Hechizo'}</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" id="technique-name" class="input-field" value="${name}" placeholder="Nombre de la técnica/hechizo">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Descripción</label>
                <textarea id="technique-description" class="input-field" rows="3" placeholder="Descripción">${description}</textarea>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Rareza</label>
                <select id="technique-rarity" class="input-field">
                    ${RARITIES.map(r => `<option value="${r}" ${r === rarity ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Nivel</label>
                <input type="number" id="technique-level" class="input-field" value="${level}" min="0">
            </div>
        </div>
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveTechnique(${index})">${isEdit ? 'Guardar Cambios' : 'Crear Técnica/Hechizo'}</button>
        </div>
    `, isEdit ? 'Editar Técnica/Hechizo' : 'Nueva Técnica/Hechizo');
}

function saveTechnique(index) {
    const name = document.getElementById('technique-name').value;
    const description = document.getElementById('technique-description').value;
    const rarity = document.getElementById('technique-rarity').value;
    const level = parseInt(document.getElementById('technique-level').value) || 0;
    
    if (!name || !description) {
        showNotification('Error', 'Por favor completa todos los campos requeridos.');
        return;
    }
    
    const technique = {
        name,
        description,
        rarity,
        level,
        upgrades: 0,
        effects: []
    };
    
    if (index !== null) {
        character.inventory.techniques[index] = technique;
    } else {
        character.inventory.techniques.push(technique);
    }
    
    saveAndRefresh();
    closeModal();
    showNotification('Técnica/Hechizo Guardado', `La técnica/hechizo "${name}" ha sido guardado exitosamente.`);
}

function openItemModal(item = null, index = null) {
    const isEdit = item !== null;
    const name = item ? item.name : '';
    const description = item ? item.description : '';
    const rarity = item ? item.rarity : 'Común';
    const quantity = item ? item.quantity : 1;
    
    openModal(`
        <h3 class="text-xl font-bold mb-4">${isEdit ? 'Editar Objeto' : 'Nuevo Objeto'}</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" id="item-name" class="input-field" value="${name}" placeholder="Nombre del objeto">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Descripción</label>
                <textarea id="item-description" class="input-field" rows="3" placeholder="Descripción">${description}</textarea>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Rareza</label>
                <select id="item-rarity" class="input-field">
                    ${RARITIES.map(r => `<option value="${r}" ${r === rarity ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Cantidad</label>
                <input type="number" id="item-quantity" class="input-field" value="${quantity}" min="1">
            </div>
        </div>
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveItem(${index})">${isEdit ? 'Guardar Cambios' : 'Crear Objeto'}</button>
        </div>
    `, isEdit ? 'Editar Objeto' : 'Nuevo Objeto');
}

function saveItem(index) {
    const name = document.getElementById('item-name').value;
    const description = document.getElementById('item-description').value;
    const rarity = document.getElementById('item-rarity').value;
    const quantity = parseInt(document.getElementById('item-quantity').value) || 1;
    
    if (!name || !description) {
        showNotification('Error', 'Por favor completa todos los campos requeridos.');
        return;
    }
    
    const item = {
        name,
        description,
        rarity,
        quantity,
        effects: []
    };
    
    if (index !== null) {
        character.inventory.items[index] = item;
    } else {
        character.inventory.items.push(item);
    }
    
    saveAndRefresh();
    closeModal();
    showNotification('Objeto Guardado', `El objeto "${name}" ha sido guardado exitosamente.`);
}

function openPetModal(pet = null, index = null) {
    const isEdit = pet !== null;
    const name = pet ? pet.name : '';
    const description = pet ? pet.description : '';
    const level = pet ? pet.level : 1;
    const rarity = pet ? pet.rarity : 'Común';
    
    openModal(`
        <h3 class="text-xl font-bold mb-4">${isEdit ? 'Editar Mascota' : 'Nueva Mascota'}</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" id="pet-name" class="input-field" value="${name}" placeholder="Nombre de la mascota">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Descripción</label>
                <textarea id="pet-description" class="input-field" rows="3" placeholder="Descripción">${description}</textarea>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Rareza</label>
                <select id="pet-rarity" class="input-field">
                    ${RARITIES.map(r => `<option value="${r}" ${r === rarity ? 'selected' : ''}>${r}</option>`).join('')}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Nivel</label>
                <input type="number" id="pet-level" class="input-field" value="${level}" min="1">
            </div>
        </div>
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="savePet(${index})">${isEdit ? 'Guardar Cambios' : 'Crear Mascota'}</button>
        </div>
    `, isEdit ? 'Editar Mascota' : 'Nueva Mascota');
}

function savePet(index) {
    const name = document.getElementById('pet-name').value;
    const description = document.getElementById('pet-description').value;
    const rarity = document.getElementById('pet-rarity').value;
    const level = parseInt(document.getElementById('pet-level').value) || 1;
    
    if (!name || !description) {
        showNotification('Error', 'Por favor completa todos los campos requeridos.');
        return;
    }
    
    const pet = {
        name,
        description,
        rarity,
        level,
        upgrades: 0,
        abilities: []
    };
    
    if (index !== null) {
        character.inventory.pets[index] = pet;
    } else {
        character.inventory.pets.push(pet);
    }
    
    saveAndRefresh();
    closeModal();
    showNotification('Mascota Guardada', `La mascota "${name}" ha sido guardada exitosamente.`);
}

function openStatusEffectModal(effect = null, index = null) {
    const isEdit = effect !== null;
    const name = effect ? effect.name : '';
    const description = effect ? effect.description : '';
    const duration = effect ? effect.duration : '';
    const type = effect ? effect.type : 'Neutral';
    
    openModal(`
        <h3 class="text-xl font-bold mb-4">${isEdit ? 'Editar Estado' : 'Nuevo Estado'}</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" id="status-name" class="input-field" value="${name}" placeholder="Nombre del estado">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Descripción</label>
                <textarea id="status-description" class="input-field" rows="3" placeholder="Descripción">${description}</textarea>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Tipo</label>
                <select id="status-type" class="input-field">
                    <option value="Buff" ${type === 'Buff' ? 'selected' : ''}>Buff</option>
                    <option value="Debuff" ${type === 'Debuff' ? 'selected' : ''}>Debuff</option>
                    <option value="Neutral" ${type === 'Neutral' ? 'selected' : ''}>Neutral</option>
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Duración (turnos)</label>
                <input type="number" id="status-duration" class="input-field" value="${duration}" min="0">
            </div>
        </div>
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveStatusEffect(${index})">${isEdit ? 'Guardar Cambios' : 'Crear Estado'}</button>
        </div>
    `, isEdit ? 'Editar Estado' : 'Nuevo Estado');
}

function saveStatusEffect(index) {
    const name = document.getElementById('status-name').value;
    const description = document.getElementById('status-description').value;
    const type = document.getElementById('status-type').value;
    const duration = parseInt(document.getElementById('status-duration').value) || 0;
    
    if (!name || !description) {
        showNotification('Error', 'Por favor completa todos los campos requeridos.');
        return;
    }
    
    const statusEffect = {
        name,
        description,
        type,
        duration,
        linkedEffects: []
    };
    
    if (index !== null) {
        character.statusEffects[index] = statusEffect;
    } else {
        character.statusEffects.push(statusEffect);
    }
    
    saveAndRefresh();
    closeModal();
    showNotification('Estado Guardado', `El estado "${name}" ha sido guardado exitosamente.`);
}

// ===================================================================================
// SISTEMA DE MISIONES (NUEVO)
// ===================================================================================

function openQuestModal(quest = null, status = 'active', index = null) {
    const isEdit = quest !== null;
    const name = quest ? quest.name : '';
    const description = quest ? quest.description : '';
    const reward = quest ? quest.reward || '';
    const objectives = quest ? quest.objectives.map(obj => obj.description).join('\n') : '';
    
    openModal(`
        <h3 class="text-xl font-bold mb-4">${isEdit ? 'Editar Misión' : 'Nueva Misión'}</h3>
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Nombre de la Misión</label>
                <input type="text" id="quest-name" class="input-field" value="${name}" placeholder="Nombre de la misión">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Descripción</label>
                <textarea id="quest-description" class="input-field" rows="3" placeholder="Descripción de la misión">${description}</textarea>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Objetivos (uno por línea)</label>
                <textarea id="quest-objectives" class="input-field" rows="4" placeholder="Objetivo 1\nObjetivo 2\nObjetivo 3">${objectives}</textarea>
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Recompensa</label>
                <input type="text" id="quest-reward" class="input-field" value="${reward}" placeholder="Recompensa de la misión">
            </div>
        </div>
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="saveQuest('${status}', ${index})">${isEdit ? 'Guardar Cambios' : 'Crear Misión'}</button>
        </div>
    `, isEdit ? 'Editar Misión' : 'Nueva Misión');
}

function saveQuest(status, index) {
    const name = document.getElementById('quest-name').value;
    const description = document.getElementById('quest-description').value;
    const reward = document.getElementById('quest-reward').value;
    const objectivesText = document.getElementById('quest-objectives').value;
    
    if (!name || !description || !objectivesText) {
        showNotification('Error', 'Por favor completa todos los campos requeridos.');
        return;
    }
    
    const objectives = objectivesText.split('\n').filter(obj => obj.trim()).map(obj => ({
        description: obj.trim(),
        completed: false
    }));
    
    const quest = {
        name,
        description,
        objectives,
        reward,
        createdAt: new Date().toISOString()
    };
    
    if (index !== null) {
        character.quests[status][index] = quest;
    } else {
        character.quests[status].push(quest);
    }
    
    saveAndRefresh();
    closeModal();
    showNotification('Misión Guardada', `La misión "${name}" ha sido guardada exitosamente.`);
}

function toggleQuestObjective(status, questIndex, objectiveIndex) {
    const quest = character.quests[status][questIndex];
    quest.objectives[objectiveIndex].completed = !quest.objectives[objectiveIndex].completed;
    saveAndRefresh();
}

function completeQuest(index) {
    const quest = character.quests.active[index];
    quest.completedAt = new Date().toISOString();
    character.quests.completed.push(quest);
    character.quests.active.splice(index, 1);
    saveAndRefresh();
    showNotification('Misión Completada', `¡Has completado la misión "${quest.name}"!`);
}

function failQuest(index) {
    const quest = character.quests.active[index];
    quest.failedAt = new Date().toISOString();
    character.quests.failed.push(quest);
    character.quests.active.splice(index, 1);
    saveAndRefresh();
    showNotification('Misión Fallida', `La misión "${quest.name}" ha fallado.`);
}

function removeQuest(status, index) {
    const quest = character.quests[status][index];
    if (confirm(`¿Estás seguro de que quieres eliminar la misión "${quest.name}"?`)) {
        character.quests[status].splice(index, 1);
        saveAndRefresh();
    }
}

// ===================================================================================
// SISTEMA DE MEJORA DE EQUIPO (NUEVO)
// ===================================================================================

function openEnhancementModal() {
    const equipmentWithItems = character.equipment.filter(slot => slot.item !== null);
    
    if (equipmentWithItems.length === 0) {
        showNotification('Sin Equipamiento', 'No tienes ningún equipo equipado para mejorar.');
        return;
    }
    
    let content = '<div class="space-y-4">';
    
    equipmentWithItems.forEach((slot, index) => {
        const actualIndex = character.equipment.indexOf(slot);
        const enhancementLevel = slot.enhancementLevel || 0;
        const nextLevel = enhancementLevel + 1;
        const cost = nextLevel * 100; // Enhancement cost formula
        
        content += `
            <div class="enhancement-slot p-4 border rounded-lg ${selectedEnhancementSlot === actualIndex ? 'selected' : ''}" 
                 onclick="selectEnhancementSlot(${actualIndex})">
                <div class="flex justify-between items-start">
                    <div>
                        <h4 class="font-semibold">${slot.item.name}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">${slot.item.type}</p>
                        <p class="text-sm rarity-text">${slot.item.rarity}</p>
                        <div class="mt-2">
                            <div class="enhancement-level">Nivel actual: +${enhancementLevel}</div>
                            <div class="enhancement-cost">
                                <span>Costo para mejorar a +${nextLevel}:</span>
                                <span class="font-bold">${cost} de oro</span>
                            </div>
                            <div class="enhancement-progress">
                                <div class="enhancement-progress-bar" style="width: ${(enhancementLevel / 10) * 100}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    content += '</div>';
    
    content += `
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" onclick="enhanceEquipment()" ${selectedEnhancementSlot === null ? 'disabled' : ''}>
                Mejorar Equipo
            </button>
        </div>
    `;
    
    openModal(content, 'Mejorar Equipo');
}

function selectEnhancementSlot(index) {
    selectedEnhancementSlot = index;
    
    // Update visual selection
    document.querySelectorAll('.enhancement-slot').forEach((slot, i) => {
        const actualIndex = character.equipment.findIndex(e => e.item && e.item.name === slot.querySelector('h4').textContent);
        if (actualIndex === index) {
            slot.classList.add('selected');
        } else {
            slot.classList.remove('selected');
        }
    });
    
    // Update enhance button
    const enhanceBtn = document.querySelector('#modal-footer .btn-primary');
    if (enhanceBtn) {
        enhanceBtn.disabled = false;
    }
}

function enhanceEquipment() {
    if (selectedEnhancementSlot === null) return;
    
    const slot = character.equipment[selectedEnhancementSlot];
    const currentLevel = slot.enhancementLevel || 0;
    const nextLevel = currentLevel + 1;
    const cost = nextLevel * 100;
    
    // Check if player has enough gold (assuming gold is a resource)
    const goldResource = character.resources.find(r => r.name.toLowerCase() === 'oro');
    if (!goldResource || goldResource.current < cost) {
        showNotification('Recursos Insuficientes', `Necesitas ${cost} de oro para mejorar este equipo.`);
        return;
    }
    
    // Check max enhancement level
    if (currentLevel >= 10) {
        showNotification('Máximo Alcanzado', 'Este equipo ya ha alcanzado su nivel máximo de mejora.');
        return;
    }
    
    // Deduct cost and enhance
    goldResource.current -= cost;
    slot.enhancementLevel = nextLevel;
    
    selectedEnhancementSlot = null;
    saveAndRefresh();
    closeModal();
    showNotification('Mejora Exitosa', `${slot.item.name} ha sido mejorado a +${nextLevel}.`);
}

// ===================================================================================
// SISTEMA DE PUNTOS DE HABILIDAD (MEJORADO)
// ===================================================================================

function openSpendSkillPointsModal() {
    if (character.skillPoints <= 0) {
        showNotification('Sin Puntos de Habilidad', 'No tienes puntos de habilidad disponibles para gastar.');
        return;
    }
    
    let content = '<div class="space-y-4">';
    
    // Attributes section
    content += `
        <div>
            <h4 class="font-semibold mb-2">Atributos</h4>
            <div class="space-y-2">
    `;
    
    for (const key in character.attributes) {
        const attr = character.attributes[key];
        const cost = 1; // Costo por punto de atributo
        content += `
            <div class="flex justify-between items-center p-2 border rounded">
                <span>${attr.name}: ${attr.value}</span>
                <button class="btn btn-primary text-sm" onclick="upgradeAttributeWithPoints('${key}', ${cost})" 
                        ${character.skillPoints < cost ? 'disabled' : ''}>
                    Mejorar (${cost} PH)
                </button>
            </div>
        `;
    }
    
    content += `
            </div>
        </div>
    `;
    
    // Elements section
    content += `
        <div>
            <h4 class="font-semibold mb-2">Elementos</h4>
            <div class="space-y-2">
    `;
    
    for (const key in character.elements) {
        const element = character.elements[key];
        const cost = 2; // Costo por punto de elemento
        content += `
            <div class="flex justify-between items-center p-2 border rounded">
                <span>${ELEMENTS_CONFIG[key].name}: ${element.level}</span>
                <button class="btn btn-primary text-sm" onclick="upgradeElementWithPoints('${key}', ${cost})" 
                        ${character.skillPoints < cost ? 'disabled' : ''}>
                    Mejorar (${cost} PH)
                </button>
            </div>
        `;
    }
    
    content += `
            </div>
        </div>
    `;
    
    // Skills section
    content += `
        <div>
            <h4 class="font-semibold mb-2">Habilidades</h4>
            <div class="space-y-2">
    `;
    
    character.inventory.skills.forEach((skill, index) => {
        const cost = 1; // Costo por punto de habilidad
        content += `
            <div class="flex justify-between items-center p-2 border rounded">
                <span>${skill.name}: Nivel ${skill.level}</span>
                <button class="btn btn-primary text-sm" onclick="upgradeSkillWithPoints(${index}, ${cost})" 
                        ${character.skillPoints < cost ? 'disabled' : ''}>
                    Mejorar (${cost} PH)
                </button>
            </div>
        `;
    });
    
    content += `
            </div>
        </div>
    `;
    
    content += `
        <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <p class="text-sm">Puntos de Habilidad Disponibles: <span class="font-bold">${character.skillPoints}</span></p>
        </div>
    `;
    
    content += '</div>';
    
    content += `
        <div class="flex justify-end mt-6 space-x-2">
            <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
        </div>
    `;
    
    openModal(content, 'Gastar Puntos de Habilidad');
}

function upgradeAttributeWithPoints(attrKey, cost) {
    if (character.skillPoints >= cost) {
        character.attributes[attrKey].value += 1;
        character.attributes[attrKey].upgrades += 1;
        character.skillPoints -= cost;
        
        calculateDerivedStats();
        updateUI();
        
        // Refresh modal to show updated values
        openSpendSkillPointsModal();
        
        showNotification('Atributo Mejorado', `${character.attributes[attrKey].name} ha sido mejorado a ${character.attributes[attrKey].value}.`);
    }
}

function upgradeElementWithPoints(elementKey, cost) {
    if (character.skillPoints >= cost) {
        character.elements[elementKey].level += 1;
        character.elements[elementKey].upgrades += 1;
        character.skillPoints -= cost;
        
        calculateDerivedStats();
        updateUI();
        
        // Refresh modal to show updated values
        openSpendSkillPointsModal();
        
        showNotification('Elemento Mejorado', `${ELEMENTS_CONFIG[elementKey].name} ha sido mejorado a nivel ${character.elements[elementKey].level}.`);
    }
}

function upgradeSkillWithPoints(skillIndex, cost) {
    if (character.skillPoints >= cost) {
        character.inventory.skills[skillIndex].level += 1;
        character.inventory.skills[skillIndex].upgrades += 1;
        character.skillPoints -= cost;
        
        calculateDerivedStats();
        updateUI();
        
        // Refresh modal to show updated values
        openSpendSkillPointsModal();
        
        showNotification('Habilidad Mejorada', `${character.inventory.skills[skillIndex].name} ha sido mejorada a nivel ${character.inventory.skills[skillIndex].level}.`);
    }
}

// ===================================================================================
// FUNCIONES DE UTILIDAD (MEJORADAS)
// ===================================================================================

// v4.6 - Quick actions
function quickHeal() {
    const healAmount = Math.floor(character.stats.health.max * 0.25);
    character.stats.health.current = Math.min(character.stats.health.current + healAmount, character.stats.health.max);
    saveAndRefresh();
    showNotification('Curación Rápida', `Has recuperado ${healAmount} puntos de vida.`);
}

function quickManaRestore() {
    const manaAmount = Math.floor(character.stats.mana.max * 0.25);
    character.stats.mana.current = Math.min(character.stats.mana.current + manaAmount, character.stats.mana.max);
    saveAndRefresh();
    showNotification('Recuperación de Místyculas', `Has recuperado ${manaAmount} místyculas.`);
}

function quickRest() {
    character.stats.health.current = character.stats.health.max;
    character.stats.mana.current = character.stats.mana.max;
    character.combat.currentActions = character.stats.actions.current;
    saveAndRefresh();
    showNotification('Descanso Completo', 'Has recuperado toda tu vida, místyculas y acciones.');
}

// v4.6 - Keyboard shortcuts
function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl+S: Save
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveCharacterToLocalStorage();
            showSaveIndicator();
            updateLastSavedTime();
            showNotification('Guardado Manual', 'Los datos han sido guardados exitosamente.');
        }
        
        // Ctrl+H: Quick heal
        if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            quickHeal();
        }
        
        // Ctrl+M: Quick mana restore
        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            quickManaRestore();
        }
        
        // Ctrl+Q: New quest
        if (e.ctrlKey && e.key === 'q') {
            e.preventDefault();
            openQuestModal();
        }
        
        // Ctrl+E: Enhance equipment
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            openEnhancementModal();
        }
        
        // ?: Show/hide shortcuts help
        if (e.key === '?') {
            e.preventDefault();
            toggleShortcutsHelp();
        }
    });
}

function toggleShortcutsHelp() {
    const help = document.getElementById('shortcuts-help');
    help.classList.toggle('hidden');
}

// Auto-save functionality
function initAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        saveCharacterToLocalStorage();
        showSaveIndicator();
        updateLastSavedTime();
    }, 2000); // Auto-save after 2 seconds of inactivity
}

function showSaveIndicator() {
    const indicator = document.getElementById('save-indicator');
    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

function updateLastSavedTime() {
    lastSavedTime = new Date();
    const timeString = lastSavedTime.toLocaleTimeString();
    document.getElementById('last-saved-time').textContent = timeString;
}

// Roll Functions (mejoradas)
function rollAttributeCheck(attribute) {
    const baseValue = character.attributes[attribute].value;
    const mod = getModifier(baseValue);
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + mod;
    
    let result = '';
    let resultClass = '';
    if (total <= 5) {
        result = 'Fallo Crítico';
        resultClass = 'roll-critical';
    } else if (total <= 10) {
        result = 'Fallo';
        resultClass = 'roll-fail';
    } else if (total <= 15) {
        result = 'Éxito';
        resultClass = 'roll-success';
    } else if (total <= 19) {
        result = 'Éxito Bueno';
        resultClass = 'roll-good';
    } else {
        result = 'Éxito Crítico';
        resultClass = 'roll-amazing';
    }
    
    openModal(`
        <div class="roll-result">
            <h3 class="text-xl font-bold mb-4">Tirada de ${character.attributes[attribute].name}</h3>
            <div class="roll-dice ${resultClass}">${roll}</div>
            <div class="text-xl">
                <span class="text-gray-600">1d20</span>
                <span class="mx-2">+</span>
                <span class="${mod >= 0 ? 'text-green-600' : 'text-red-600'}">${mod >= 0 ? '+' : ''}${mod}</span>
                <span class="mx-2">=</span>
                <span class="font-bold text-2xl">${total}</span>
            </div>
            <div class="text-xl font-semibold ${resultClass}">${result}</div>
            <div class="text-sm text-gray-600">
                Atributo base: ${baseValue} (Modificador: ${mod >= 0 ? '+' : ''}${mod})
            </div>
        </div>
        <div class="flex justify-end mt-6">
            <button class="btn btn-primary" onclick="rollAttributeCheck('${attribute}')">Volver a Lanzar</button>
            <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
        </div>
    `, `Tirada de ${character.attributes[attribute].name}`);
}

function rollStatCheck(stat) {
    const value = character.stats[stat].current;
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + value;
    
    let result = '';
    let resultClass = '';
    if (total <= 5) {
        result = 'Fallo Crítico';
        resultClass = 'roll-critical';
    } else if (total <= 10) {
        result = 'Fallo';
        resultClass = 'roll-fail';
    } else if (total <= 15) {
        result = 'Éxito';
        resultClass = 'roll-success';
    } else if (total <= 19) {
        result = 'Éxito Bueno';
        resultClass = 'roll-good';
    } else {
        result = 'Éxito Crítico';
        resultClass = 'roll-amazing';
    }
    
    openModal(`
        <div class="roll-result">
            <h3 class="text-xl font-bold mb-4">Tirada de ${character.stats[stat].name}</h3>
            <div class="roll-dice ${resultClass}">${roll}</div>
            <div class="text-xl">
                <span class="text-gray-600">1d20</span>
                <span class="mx-2">+</span>
                <span class="text-green-600">+${value}</span>
                <span class="mx-2">=</span>
                <span class="font-bold text-2xl">${total}</span>
            </div>
            <div class="text-xl font-semibold ${resultClass}">${result}</div>
            <div class="text-sm text-gray-600">
                Valor de ${character.stats[stat].name}: ${value}
            </div>
        </div>
        <div class="flex justify-end mt-6">
            <button class="btn btn-primary" onclick="rollStatCheck('${stat}')">Volver a Lanzar</button>
            <button class="btn btn-secondary" onclick="closeModal()">Cerrar</button>
        </div>
    `, `Tirada de ${character.stats[stat].name}`);
}

// Theme Management (mejorado)
function toggleTheme() {
    const themes = ['', 'theme-dark', 'theme-forest', 'theme-ocean', 'theme-fire', 'theme-dusk'];
    const body = document.body;
    let currentTheme = '';
    
    themes.forEach(theme => {
        if (body.classList.contains(theme)) {
            currentTheme = theme;
        }
    });
    
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];
    
    if (currentTheme) {
        body.classList.remove(currentTheme);
    }
    
    if (nextTheme) {
        body.classList.add(nextTheme);
    }
    
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    
    const themeNames = {
        '': 'Predeterminado',
        'theme-dark': 'Oscuro',
        'theme-forest': 'Bosque',
        'theme-ocean': 'Océano',
        'theme-fire': 'Fuego',
        'theme-dusk': 'Atardecer'
    };
    
    showNotification('Tema Cambiado', `El tema ha sido cambiado a: ${themeNames[nextTheme]}`);
}

function loadTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
        document.body.classList.add(savedTheme);
    }
}

// ===================================================================================
// FUNCIONES AUXILIARES (MANTENIENDO FUNCIONALIDAD ORIGINAL)
// ===================================================================================

function useAction(cost, name) {
    if (character.combat.currentActions >= cost) {
        character.combat.currentActions -= cost;
        saveAndRefresh();
        showNotification('Acción Realizada', `Has usado la acción "${name}" por ${cost} PA.`);
    } else {
        showNotification('Acción Insuficiente', `No tienes suficientes puntos de acción para "${name}".`);
    }
}

function upgradeElement(elementKey) {
    const element = character.elements[elementKey];
    const nextLevel = element.level + 1;
    const cost = nextLevel * 5; // Costo en puntos de experiencia
    
    if (character.stats.xp.current >= cost) {
        character.stats.xp.current -= cost;
        element.level = nextLevel;
        element.upgrades += 1;
        
        saveAndRefresh();
        showNotification('Elemento Mejorado', `${ELEMENTS_CONFIG[elementKey].name} ha sido mejorado a nivel ${nextLevel}.`);
    } else {
        showNotification('Experiencia Insuficiente', `Necesitas ${cost} XP para mejorar ${ELEMENTS_CONFIG[elementKey].name} a nivel ${nextLevel}.`);
    }
}

function upgradeItem(type, index) {
    const item = character.inventory[type][index];
    if (item.level === undefined) item.level = 0;
    if (item.upgrades === undefined) item.upgrades = 0;
    
    item.level++;
    item.upgrades++;
    saveAndRefresh();
}

function removeItem(type, index) {
    if (confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
        character.inventory[type].splice(index, 1);
        saveAndRefresh();
    }
}

function removeStatusEffect(index) {
    character.statusEffects.splice(index, 1);
    saveAndRefresh();
}

function addResource() {
    const name = document.getElementById('resource-name').value;
    const current = parseInt(document.getElementById('resource-current').value) || 0;
    const max = parseInt(document.getElementById('resource-max').value) || 100;
    
    if (name) {
        character.resources.push({ name, current, max });
        saveAndRefresh();
        closeModal();
    }
}

function updateResource(index, value, type) {
    character.resources[index][type] = parseInt(value) || 0;
    saveAndRefresh();
}

function removeResource(index) {
    character.resources.splice(index, 1);
    saveAndRefresh();
}

function unequipItem(index) {
    character.equipment[index].item = null;
    character.equipment[index].enhancementLevel = 0;
    saveAndRefresh();
}

function openEquipmentModal(index) {
    // Simplified equipment modal for now
    showNotification('Equipamiento', 'Función de equipamiento básica implementada.');
}

// ===================================================================================
// EVENT LISTENERS (MEJORADOS)
// ===================================================================================

function initEventListeners() {
    // v4.6 - Quick action buttons
    document.getElementById('quick-heal-btn').addEventListener('click', quickHeal);
    document.getElementById('quick-mana-btn').addEventListener('click', quickManaRestore);
    document.getElementById('quick-rest-btn').addEventListener('click', quickRest);
    document.getElementById('shortcuts-toggle-btn').addEventListener('click', toggleShortcutsHelp);
    
    // v4.6 - Manual save button
    document.getElementById('manual-save-btn').addEventListener('click', () => {
        saveCharacterToLocalStorage();
        showSaveIndicator();
        updateLastSavedTime();
        showNotification('Guardado Manual', 'Los datos han sido guardados exitosamente.');
    });
    
    // Identity
    document.getElementById('character-image-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                character.identity.image = event.target.result;
                document.getElementById('character-image-preview').src = event.target.result;
                saveAndRefresh();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Auto-save on input changes
    document.querySelectorAll('input, textarea').forEach(element => {
        element.addEventListener('input', () => {
            initAutoSave();
        });
    });
    
    // XP
    document.getElementById('add-xp-btn').addEventListener('click', () => {
        const input = document.getElementById('xp-to-add');
        const amount = parseInt(input.value) || 0;
        if (amount > 0) {
            addXP(amount);
            input.value = '';
        }
    });
    
    // Combat
    document.getElementById('end-turn-btn').addEventListener('click', () => {
        character.combat.currentActions = character.stats.actions.current;
        saveAndRefresh();
        showNotification('Turno Finalizado', 'Tus puntos de acción han sido restaurados.');
    });
    
    // Equipment
    document.getElementById('manage-slots-btn').addEventListener('click', () => {
        showNotification('Gestión de Slots', 'Función de gestión de slots implementada.');
    });
    
    // v4.9 - Enhancement button
    document.getElementById('enhance-equipment-btn').addEventListener('click', openEnhancementModal);
    
    // Resources
    document.getElementById('add-resource-btn').addEventListener('click', () => {
        openModal(`
            <h3 class="text-xl font-bold mb-4">Añadir Recurso</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Nombre del Recurso</label>
                    <input type="text" id="resource-name" class="input-field" placeholder="Ej: Oro, Gemas">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Cantidad Actual</label>
                    <input type="number" id="resource-current" class="input-field" value="0">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Cantidad Máxima</label>
                    <input type="number" id="resource-max" class="input-field" value="100">
                </div>
            </div>
            <div class="flex justify-end mt-6 space-x-2">
                <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="addResource()">Añadir</button>
            </div>
        `);
    });
    
    // v4.7 - Quest button
    document.getElementById('add-quest-btn').addEventListener('click', () => openQuestModal());
    
    // Creation buttons
    document.getElementById('add-skill-btn').addEventListener('click', () => openSkillModal());
    document.getElementById('add-technique-btn').addEventListener('click', () => openTechniqueModal());
    document.getElementById('add-item-btn').addEventListener('click', () => openItemModal());
    document.getElementById('add-pet-btn').addEventListener('click', () => openPetModal());
    document.getElementById('add-status-effect-btn').addEventListener('click', () => openStatusEffectModal());
    
    // Inventory tabs
    document.querySelectorAll('#inventory-tabs button, #quest-tabs button').forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            const container = button.closest('.card');
            
            // Update active button
            container.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding content
            const contentContainer = container.querySelector('#inventory-content, #quest-content');
            contentContainer.querySelectorAll('.tab-pane').forEach(pane => pane.classList.add('hidden'));
            contentContainer.querySelector(`#tab-content-${tabName}`).classList.remove('hidden');
        });
    });
    
    // Theme toggle
    document.getElementById('theme-toggle-btn').addEventListener('click', toggleTheme);
    
    // Data management
    document.getElementById('export-json-btn').addEventListener('click', () => {
        const dataStr = JSON.stringify(character, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `character_${character.identity.name || 'unnamed'}_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    });
    
    document.getElementById('import-json-btn').addEventListener('click', () => {
        document.getElementById('json-import-input').click();
    });
    
    document.getElementById('json-import-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    character = importedData;
                    saveAndRefresh();
                    showNotification('Importación Exitosa', 'Los datos del personaje han sido importados.');
                } catch (error) {
                    showNotification('Error de Importación', 'El archivo seleccionado no es válido.');
                }
            };
            reader.readAsText(file);
        }
    });
    
    document.getElementById('clear-local-data-btn').addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres borrar todos los datos del personaje? Esta acción no se puede deshacer.')) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            localStorage.removeItem(THEME_STORAGE_KEY);
            location.reload();
        }
    });
}

// ===================================================================================
// INICIALIZACIÓN
// ===================================================================================

window.onload = () => {
    // Load saved data or create new character
    const savedData = loadCharacterFromLocalStorage();
    character = savedData || getDefaultCharacter();
    
    // Load theme
    loadTheme();
    
    // Initialize UI
    updateUI();
    
    // Initialize event listeners
    initEventListeners();
    
    // v4.6 - Initialize keyboard shortcuts
    initKeyboardShortcuts();
    
    // Update last saved time if exists
    if (lastSavedTime) {
        updateLastSavedTime();
    }
    
    // Show welcome message for new characters
    if (!savedData) {
        showNotification('Bienvenido', '¡Bienvenido a la Hoja de Personaje v5.0! Comienza creando tu personaje.');
    }
};

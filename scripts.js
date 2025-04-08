// Utilidades
const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

/**
 * @class Character
 * @description Clase principal para manejar el personaje
 */
class Character {
    constructor() {
        this.attributes = {
            strength: 10,
            intelligence: 10,
            agility: 10,
            metabolism: 10,
            magicAffinity: 10
        };

        this.stats = {
            baseHealth: 100,
            currentHealth: 100,
            maxHealth: 100,
            baseMistyculas: 50,
            currentMistyculas: 50,
            maxMistyculas: 50,
            baseArmor: 10,
            currentArmor: 10
        };

        this.name = '';
        this.level = 1;
        this.experience = 0;

        this.combat = {
            maxActions: 3,
            currentActions: 3,
            bonusActions: 0
        };

        this.inventory = {
            items: [],
            maxWeight: 0,
            currentWeight: 0
        };

        this.items = {
            weapons: [],
            armor: [],
            accessories: [],
            consumables: [],
            misc: []
        };

        this.elements = {
            fire: { value: 0, level: 'Bajo' },
            water: { value: 0, level: 'Bajo' },
            air: { value: 0, level: 'Bajo' },
            earth: { value: 0, level: 'Bajo' },
            light: { value: 0, level: 'Bajo' },
            dark: { value: 0, level: 'Bajo' }
        };

        this.skills = [];
        this.spells = [];
        this.pets = [];
        this.items = [];

        // Asegurar actualización inicial
        this.updateStats();
        this.updateUI();
    }

    calculateModifier(value) {
        try {
            const sanitizedValue = parseInt(value) || 10;
            return Math.floor((sanitizedValue - 10) / 2);
        } catch (error) {
            console.error('Error calculando modificador:', error);
            return 0;
        }
    }

    updateStats() {
        const metMod = this.calculateModifier(this.attributes.metabolism);
        const intMod = this.calculateModifier(this.attributes.intelligence);
        const agiMod = this.calculateModifier(this.attributes.agility);
        const magMod = this.calculateModifier(this.attributes.magicAffinity);

        // Corregir fórmula de armadura: base + mod agilidad + mod metabolismo
        this.stats.currentArmor = this.stats.baseArmor + agiMod + metMod;

        // Aplicar fórmulas correctamente
        this.stats.maxHealth = this.stats.baseHealth * this.level * (metMod || 1); // Si mod es 0, usar 1
        this.stats.maxMistyculas = this.stats.baseMistyculas * (intMod || 1) * (magMod || 1);

        // Asegurar que los valores actuales no excedan los máximos
        this.stats.currentHealth = Math.min(this.stats.currentHealth, this.stats.maxHealth);
        this.stats.currentMistyculas = Math.min(this.stats.currentMistyculas, this.stats.maxMistyculas);

        // Actualizar acciones después de cambios en atributos o nivel
        this.updateCombatActions();

        this.updateUI();
    }

    updateUI() {
        try {
            // Actualizar atributos
            Object.keys(this.attributes).forEach(attr => {
                const element = document.getElementById(attr);
                const modElement = document.getElementById(`${attr}Mod`);
                if (element) {
                    element.value = this.attributes[attr];
                    if (modElement) {
                        const mod = this.calculateModifier(this.attributes[attr]);
                        modElement.textContent = `(${mod >= 0 ? '+' : ''}${mod})`;
                    }
                }
            });

            // Actualizar estadísticas
            this.updateStatValues();
            this.updateStatBars();
            this.updateXPDisplay(); // Asegurarnos de que se actualiza la XP
        } catch (error) {
            this.showError('Error actualizando la interfaz');
            console.error('Error en updateUI:', error);
        }
    }

    updateStatValues() {
        const stats = {
            'healthValue': `${this.stats.currentHealth}/${this.stats.maxHealth}`,
            'mistyculasValue': `${this.stats.currentMistyculas}/${this.stats.maxMistyculas}`,
            'armorValue': `${this.stats.baseArmor}/${this.stats.currentArmor}`, // Orden corregido
            'levelAndXP': this.formatLevelAndXP()
        };

        // Actualizar los valores en la UI
        Object.entries(stats).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = value;
            }
        });

        // Actualizar XP específicamente
        const xpProgress = document.getElementById('xpProgress');
        if (xpProgress) {
            const percentage = (this.experience / this.calculateNextLevelXP(this.level)) * 100;
            xpProgress.style.width = `${Math.min(100, percentage)}%`;
        }

        // Actualizar barras de progreso
        this.updateStatBars();
    }

    updateStatBars() {
        const bars = {
            'healthBar': (this.stats.currentHealth / this.stats.maxHealth) * 100,
            'mistyculasBar': (this.stats.currentMistyculas / this.stats.maxMistyculas) * 100,
            'armorBar': (this.stats.baseArmor / this.stats.currentArmor) * 100 // Corregido orden
        };

        Object.entries(bars).forEach(([id, percentage]) => {
            const element = document.getElementById(id);
            if (element) {
                element.style.width = `${Math.min(100, percentage)}%`;
            }
        });
    }

    setAttribute(name, value) {
        if (this.attributes.hasOwnProperty(name)) {
            // Solo validamos el mínimo de 10, sin límite superior
            this.attributes[name] = Math.max(10, parseInt(value) || 10);
            this.updateStats();
        }
    }

    showError(message) {
        const statusContainer = document.getElementById('statusMessages');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status-error" role="alert">${message}</div>
            `;
            setTimeout(() => {
                statusContainer.innerHTML = '';
            }, 5000);
        }
    }

    addExperience(amount) {
        if (this.level >= 20) {
            this.showMessage('¡Nivel máximo alcanzado!', 'info');
            return;
        }

        const xpForNextLevel = this.calculateNextLevelXP(this.level);
        const totalXP = this.experience + amount;

        if (totalXP >= xpForNextLevel && this.level < 20) {
            const excess = totalXP - xpForNextLevel;
            this.level++;
            this.experience = this.level >= 20 ? xpForNextLevel : excess;
            this.updateStats();
            this.showLevelUpAnimation();
            
            // Si aún hay excedente y no hemos llegado a nivel 20, seguir subiendo
            if (excess > 0 && this.level < 20) {
                this.addExperience(0);
            }
        } else {
            this.experience = totalXP;
        }
        
        this.updateUI();
    }

    levelUp() {
        this.level++;
        // Actualizar stats al subir de nivel
        this.updateStats();
        this.showLevelUpAnimation();
    }

    calculateNextLevelXP(level) {
        return level * 1000;
    }

    updateXPDisplay() {
        const levelElement = document.getElementById('currentLevel');
        const xpElement = document.getElementById('levelAndXP');
        const xpProgress = document.getElementById('xpProgress');
        
        if (levelElement) levelElement.textContent = this.level;
        
        if (xpElement) {
            const xpNext = this.calculateNextLevelXP(this.level);
            xpElement.textContent = `${this.experience.toLocaleString()} / ${xpNext.toLocaleString()} XP`;
        }
        
        if (xpProgress) {
            const percentage = (this.experience / this.calculateNextLevelXP(this.level)) * 100;
            xpProgress.style.width = `${Math.min(100, percentage)}%`;
        }
    }

    showLevelUpAnimation() {
        const levelElement = document.getElementById('currentLevel');
        if (levelElement) {
            levelElement.classList.add('level-up-animation');
            this.showMessage(`¡Nivel ${this.level} alcanzado!`, 'success');
            setTimeout(() => {
                levelElement.classList.remove('level-up-animation');
            }, 1000);
        }
    }

    showMessage(message, type = 'info') {
        const statusContainer = document.getElementById('statusMessages');
        if (statusContainer) {
            statusContainer.innerHTML = `
                <div class="status-${type}" role="alert">
                    ${message}
                </div>
            `;
            setTimeout(() => {
                statusContainer.innerHTML = '';
            }, 3000);
        }
    }

    editStat(stat, type) {
        const statMap = {
            hp: { base: 'baseHealth', current: 'currentHealth' },
            mp: { base: 'baseMistyculas', current: 'currentMistyculas' },
            armor: { base: 'baseArmor', current: 'currentArmor' }
        };

        if (!statMap[stat]) {
            console.error('Stat no válido:', stat);
            return;
        }

        const currentValue = this.stats[statMap[stat][type]];
        const newValue = prompt(`Editar ${type === 'base' ? 'valor base' : 'valor actual'} de ${stat.toUpperCase()}:`, currentValue);
        
        if (newValue !== null) {
            const value = Math.max(0, parseInt(newValue) || 0);
            this.stats[statMap[stat][type]] = value;
            
            if (type === 'base') {
                this.updateStats(); // Recalcula todos los stats
            } else {
                this.updateUI(); // Solo actualiza la UI
            }

            // Log para debug
            console.log(`${stat} ${type} actualizado a:`, value);
            this.logStats();
        }
    }

    // Métodos de combate
    addBonusAction() {
        this.combat.currentActions++;
        this.combat.bonusActions++;
        this.updateActionDisplay();
        this.showMessage('Acción bonus añadida', 'info');
    }

    newRound() {
        this.updateCombatActions(); // Esto recalculará el máximo y reseteará las acciones
        this.combat.bonusActions = 0;
        this.showMessage('¡Nueva ronda iniciada!', 'info');
    }

    useAction(type) {
        const costs = {
            'simple': 1,
            'complex': 2,
            'reaction': 1,
            'legendary': 3
        };

        const cost = costs[type] || 1;
        if (this.combat.currentActions >= cost) {
            this.combat.currentActions -= cost;
            this.updateActionDisplay();
            return true;
        }
        return false;
    }

    updateActionDisplay() {
        document.getElementById('actionPoints').textContent = this.combat.currentActions;
        document.getElementById('maxActions').textContent = this.combat.maxActions;

        // Actualizar estado visual de los botones
        const buttons = document.querySelectorAll('.action-buttons button');
        buttons.forEach(button => {
            const cost = this.getActionCost(button.textContent);
            button.disabled = this.combat.currentActions < cost;
        });
    }

    getActionCost(actionText) {
        if (actionText.includes('Simple')) return 1;
        if (actionText.includes('Compleja')) return 2;
        if (actionText.includes('Reacción')) return 1;
        if (actionText.includes('Legendaria')) return 3;
        return 1;
    }

    updateCombatActions() {
        const agiMod = this.calculateModifier(this.attributes.agility);
        // Actualizar fórmula de acciones máximas
        this.combat.maxActions = 1 + this.level + Math.max(0, agiMod);
        this.combat.currentActions = this.combat.maxActions;
        this.updateActionDisplay();
    }

    // Agregar método para debug
    logStats() {
        console.log('Stats actuales:', {
            attributes: this.attributes,
            stats: this.stats,
            modifiers: {
                metabolism: this.calculateModifier(this.attributes.metabolism),
                intelligence: this.calculateModifier(this.attributes.intelligence),
                agility: this.calculateModifier(this.attributes.agility),
                magicAffinity: this.calculateModifier(this.attributes.magicAffinity)
            }
        });
    }

    // Nuevo método para formatear nivel y XP
    formatLevelAndXP() {
        // Limitar nivel a 20
        if (this.level > 20) {
            this.level = 20;
            this.experience = this.calculateNextLevelXP(20);
        }

        const xpNext = this.calculateNextLevelXP(this.level);
        return `Nivel ${this.level} [${this.experience.toLocaleString()}/${xpNext.toLocaleString()} XP]`;
    }

    applyDamage() {
        const damage = parseInt(document.getElementById('damageInput').value) || 0;
        if (damage > 0) {
            this.stats.currentHealth = Math.max(0, this.stats.currentHealth - damage);
            this.updateUI();
            document.getElementById('damageInput').value = '';
        }
    }

    applyHeal() {
        const heal = parseInt(document.getElementById('healInput').value) || 0;
        if (heal > 0) {
            this.stats.currentHealth = Math.min(this.stats.maxHealth, this.stats.currentHealth + heal);
            this.updateUI();
            document.getElementById('healInput').value = '';
        }
    }

    recoverMP() {
        const mp = parseInt(document.getElementById('mpRecoveryInput').value) || 0;
        if (mp > 0) {
            this.stats.currentMistyculas = Math.min(this.stats.maxMistyculas, this.stats.currentMistyculas + mp);
            this.updateUI();
            document.getElementById('mpRecoveryInput').value = '';
        }
    }

    addItem(item) {
        const itemData = {
            id: Date.now(),
            name: item.name || 'Objeto sin nombre',
            type: item.type || 'misc',
            weight: item.weight || 0,
            description: item.description || '',
            quantity: item.quantity || 1,
            effects: item.effects || [],
            equipped: false
        };

        if (this.items[itemData.type]) {
            this.items[itemData.type].push(itemData);
            this.updateInventoryWeight();
            this.updateItemsDisplay();
            return true;
        }
        return false;
    }

    removeItem(type, id) {
        if (this.items[type]) {
            this.items[type] = this.items[type].filter(item => item.id !== id);
            this.updateInventoryWeight();
            this.updateItemsDisplay();
        }
    }

    updateInventoryWeight() {
        this.inventory.currentWeight = Object.values(this.items)
            .flat()
            .reduce((total, item) => total + (item.weight * item.quantity), 0);
    }

    equipItem(type, id) {
        const item = this.items[type]?.find(item => item.id === id);
        if (item) {
            // Si es arma o armadura, desequipar otros del mismo tipo
            if (type === 'weapons' || type === 'armor') {
                this.items[type].forEach(i => {
                    if (i.id !== id) i.equipped = false;
                });
            }
            item.equipped = !item.equipped;
            this.updateStats();
            this.updateItemsDisplay();
        }
    }

    useItem(type, id) {
        const item = this.items[type]?.find(item => item.id === id);
        if (item && item.quantity > 0) {
            // Aplicar efectos del item
            if (item.effects) {
                item.effects.forEach(effect => this.applyItemEffect(effect));
            }
            
            item.quantity--;
            if (item.quantity <= 0) {
                this.removeItem(type, id);
            } else {
                this.updateItemsDisplay();
            }
        }
    }

    applyItemEffect(effect) {
        switch (effect.type) {
            case 'heal':
                this.stats.currentHealth = Math.min(
                    this.stats.maxHealth, 
                    this.stats.currentHealth + effect.value
                );
                break;
            case 'mp':
                this.stats.currentMistyculas = Math.min(
                    this.stats.maxMistyculas, 
                    this.stats.currentMistyculas + effect.value
                );
                break;
            case 'buff':
                // Implementar sistema de buffs temporales
                break;
        }
        this.updateUI();
    }

    updateItemsDisplay() {
        Object.entries(this.items).forEach(([type, items]) => {
            const container = document.getElementById(`${type}List`);
            if (container) {
                container.innerHTML = items.map(item => this.createItemHTML(item)).join('');
            }
        });

        // Actualizar peso total
        const weightDisplay = document.getElementById('inventoryWeight');
        if (weightDisplay) {
            weightDisplay.textContent = 
                `${this.inventory.currentWeight}/${this.inventory.maxWeight}`;
        }
    }

    createItemHTML(item) {
        return `
            <div class="item-card ${item.equipped ? 'equipped' : ''}" data-id="${item.id}">
                <div class="item-header">
                    <h3>${item.name}</h3>
                    ${item.quantity > 1 ? `<span class="quantity">x${item.quantity}</span>` : ''}
                </div>
                <div class="item-body">
                    <p>${item.description}</p>
                    <div class="item-stats">
                        <span>Peso: ${item.weight}</span>
                        ${item.effects?.map(effect => 
                            `<span class="effect">${effect.type}: ${effect.value}</span>`
                        ).join('') || ''}
                    </div>
                </div>
                <div class="item-actions">
                    ${this.createItemActionButtons(item)}
                </div>
            </div>
        `;
    }

    createItemActionButtons(item) {
        const buttons = [];
        
        if (['weapons', 'armor', 'accessories'].includes(item.type)) {
            buttons.push(`
                <button onclick="character.equipItem('${item.type}', ${item.id})"
                        class="btn btn-equip">
                    ${item.equipped ? 'Desequipar' : 'Equipar'}
                </button>
            `);
        }
        
        if (item.effects) {
            buttons.push(`
                <button onclick="character.useItem('${item.type}', ${item.id})"
                        class="btn btn-use">
                    Usar
                </button>
            `);
        }
        
        buttons.push(`
            <button onclick="character.removeItem('${item.type}', ${item.id})"
                    class="btn btn-remove">
                Eliminar
            </button>
        `);
        
        return buttons.join('');
    }

    increaseElement(elementName) {
        if (this.elements[elementName]) {
            this.elements[elementName].value = Math.min(100, this.elements[elementName].value + 10);
            this.updateElementLevel(elementName);
            this.updateElementDisplay(elementName);
        }
    }

    decreaseElement(elementName) {
        if (this.elements[elementName]) {
            this.elements[elementName].value = Math.max(0, this.elements[elementName].value - 10);
            this.updateElementLevel(elementName);
            this.updateElementDisplay(elementName);
        }
    }

    updateElementLevel(elementName) {
        const value = this.elements[elementName].value;
        let level;
        if (value < 30) level = 'Bajo';
        else if (value < 70) level = 'Estándar';
        else level = 'Potenciado';
        
        this.elements[elementName].level = level;
    }

    updateElementDisplay(elementName) {
        const element = this.elements[elementName];
        const card = document.querySelector(`.element-card[data-element="${elementName}"]`);
        if (!card) return;

        // Actualizar valor
        const valueDisplay = card.querySelector('.element-value');
        if (valueDisplay) valueDisplay.textContent = element.value;

        // Actualizar barra de progreso
        const progressBar = card.querySelector('.element-progress');
        if (progressBar) progressBar.style.width = `${element.value}%`;

        // Actualizar nivel
        const levelDisplay = card.querySelector('.element-level');
        if (levelDisplay) {
            levelDisplay.textContent = element.level;
            levelDisplay.dataset.level = element.level;
        }
    }

    initializeElements() {
        const elements = ['fire', 'water', 'air', 'earth', 'light', 'dark'];
        const container = document.querySelector('.elements-grid');
        if (!container) return;

        container.innerHTML = elements.map(elem => this.createElementCard(elem)).join('');
        elements.forEach(elem => this.updateElementDisplay(elem));
    }

    createElementCard(elementName) {
        const icons = {
            fire: '🔥',
            water: '💧',
            air: '💨',
            earth: '🌍',
            light: '✨',
            dark: '🌑'
        };

        return `
            <div class="element-card" data-element="${elementName}">
                <div class="element-header">
                    <div class="element-icon">${icons[elementName]}</div>
                    <h3 class="element-title">${elementName.charAt(0).toUpperCase() + elementName.slice(1)}</h3>
                </div>
                <div class="element-stats">
                    <div class="element-input-group">
                        <input type="number" 
                               class="element-input" 
                               id="${elementName}Value" 
                               value="${this.elements[elementName].value}"
                               min="0" 
                               max="100"
                               onchange="character.updateElementValue('${elementName}', this.value)">
                    </div>
                    <div class="element-bar">
                        <div class="element-progress" style="width: 0%"></div>
                    </div>
                </div>
                <div class="element-level" data-level="Bajo">Bajo</div>
            </div>
        `;
    }

    updateElementValue(elementName, value) {
        if (this.elements[elementName]) {
            this.elements[elementName].value = Math.min(100, Math.max(0, parseInt(value) || 0));
            this.updateElementLevel(elementName);
            this.updateElementDisplay(elementName);
        }
    }

    // Métodos para habilidades
    addSkill(skillData) {
        const skill = {
            id: Date.now(),
            name: skillData.name || 'Nueva Habilidad',
            description: skillData.description || '',
            formula: skillData.formula || '',
            actionCost: parseInt(skillData.actionCost) || 1,
            mistyCost: parseInt(skillData.mistyCost) || 0
        };
        this.skills.push(skill);
        this.updateSkillsList();
    }

    // Métodos para hechizos
    addSpell(spellData) {
        const spell = {
            id: Date.now(),
            name: spellData.name || 'Nuevo Hechizo',
            description: spellData.description || '',
            formula: spellData.formula || '',
            actionCost: parseInt(spellData.actionCost) || 1,
            mistyCost: parseInt(spellData.mistyCost) || 0
        };
        this.spells.push(spell);
        this.updateSpellsList();
    }

    // Métodos para mascotas
    addPet(petData) {
        const pet = {
            id: Date.now(),
            name: petData.name || 'Nueva Mascota',
            type: petData.type || '',
            image: petData.image || null
        };
        this.pets.push(pet);
        this.updatePetsList();
    }

    // Métodos para objetos
    addItem(itemData) {
        const item = {
            id: Date.now(),
            name: itemData.name || 'Nuevo Objeto',
            type: itemData.type || '',
            effects: itemData.effects || '',
            description: itemData.description || ''
        };
        this.items.push(item);
        this.updateItemsList();
    }

    // Métodos para actualizar las listas
    updateSkillsList() {
        const container = document.getElementById('skillsList');
        if (!container) return;
        
        container.innerHTML = this.skills.map(skill => `
            <div class="item-card">
                <div class="item-header">
                    <h3>${skill.name}</h3>
                    <div class="item-costs">
                        <span class="cost-action">🎯 ${skill.actionCost}</span>
                        <span class="cost-misty">✨ ${skill.mistyCost}</span>
                    </div>
                </div>
                <p class="item-description">${skill.description}</p>
                <div class="item-formula">${skill.formula}</div>
                <div class="item-controls">
                    <button class="btn btn-use" onclick="character.useSkill(${skill.id})">Usar</button>
                    <button class="btn btn-edit" onclick="character.editSkill(${skill.id})">Editar</button>
                    <button class="btn btn-remove" onclick="character.removeSkill(${skill.id})">Eliminar</button>
                </div>
            </div>
        `).join('') || '<p>No hay habilidades.</p>';
    }

    updateSpellsList() {
        const container = document.getElementById('spellsList');
        if (!container) return;

        container.innerHTML = this.spells.map(spell => `
            <div class="item-card">
                <div class="item-header">
                    <h3>${spell.name}</h3>
                    <div class="item-costs">
                        <span class="cost-action">🎯 ${spell.actionCost}</span>
                        <span class="cost-misty">✨ ${spell.mistyCost}</span>
                    </div>
                </div>
                <p class="item-description">${spell.description}</p>
                <div class="item-formula">${spell.formula}</div>
                <div class="item-controls">
                    <button class="btn btn-use" onclick="character.useSpell(${spell.id})">Lanzar</button>
                    <button class="btn btn-edit" onclick="character.editSpell(${spell.id})">Editar</button>
                    <button class="btn btn-remove" onclick="character.removeSpell(${spell.id})">Eliminar</button>
                </div>
            </div>
        `).join('') || '<p>No hay hechizos.</p>';
    }

    updatePetsList() {
        const container = document.getElementById('petsList');
        if (!container) return;

        container.innerHTML = this.pets.map(pet => `
            <div class="item-card">
                <div class="item-header">
                    <h3>${pet.name}</h3>
                    <span class="pet-type">${pet.type}</span>
                </div>
                ${pet.image ? `<img src="${pet.image}" alt="${pet.name}" class="pet-image">` : ''}
                <div class="item-controls">
                    <button class="btn btn-edit" onclick="character.editPet(${pet.id})">Editar</button>
                    <button class="btn btn-remove" onclick="character.removePet(${pet.id})">Eliminar</button>
                </div>
            </div>
        `).join('') || '<p>No hay mascotas.</p>';
    }

    updateItemsList() {
        const container = document.getElementById('itemsList');
        if (!container) return;

        container.innerHTML = this.items.map(item => `
            <div class="item-card">
                <div class="item-header">
                    <h3>${item.name}</h3>
                    <span class="item-type">${item.type}</span>
                </div>
                <p class="item-description">${item.description}</p>
                <p class="item-effects">${item.effects}</p>
                <div class="item-controls">
                    <button class="btn btn-use" onclick="character.useItem(${item.id})">Usar</button>
                    <button class="btn btn-edit" onclick="character.editItem(${item.id})">Editar</button>
                    <button class="btn btn-remove" onclick="character.removeItem(${item.id})">Eliminar</button>
                </div>
            </div>
        `).join('') || '<p>No hay objetos.</p>';
    }

    // Métodos para usar los elementos
    useSkill(id) {
        const skill = this.skills.find(s => s.id === id);
        if (!skill) return;

        if (this.combat.currentActions < skill.actionCost) {
            this.showMessage('No tienes suficientes acciones', 'error');
            return;
        }

        if (this.stats.currentMistyculas < skill.mistyCost) {
            this.showMessage('No tienes suficientes místyculas', 'error');
            return;
        }

        this.combat.currentActions -= skill.actionCost;
        this.stats.currentMistyculas -= skill.mistyCost;
        this.updateUI();
        this.showMessage(`${skill.name} usada con éxito`, 'success');
    }

    useSpell(id) {
        // Similar a useSkill
    }

    useItem(id) {
        const item = this.items.find(i => i.id === id);
        if (!item) return;
        this.showMessage(`${item.name} usado`, 'success');
    }
}

// Inicialización con manejo de errores
document.addEventListener('DOMContentLoaded', () => {
    try {
        const character = new Character();
        window.character = character;

        // Configurar eventos para edición de stats
        document.querySelectorAll('.stat-edit-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const { stat, type } = e.target.dataset;
                character.editStat(stat, type);
            });
        });

        // Event Listeners con debounce
        const debouncedUpdate = debounce((e) => {
            character.setAttribute(e.target.id, e.target.value);
        }, 250);

        document.querySelectorAll('#attributes input').forEach(input => {
            input.addEventListener('input', debouncedUpdate);
        });

        // Event Listener para nombre del personaje
        document.getElementById('charName').addEventListener('change', (e) => {
            character.name = e.target.value;
        });

        // Inicialización
        character.updateCombatActions(); // Inicializar acciones
        character.updateStats();
        character.updateXPDisplay();

        // Debug inicial
        character.logStats();
        
        // Actualizar UI
        character.updateStats();

        // Inicializar elementos
        character.initializeElements();
    } catch (error) {
        console.error('Error de inicialización:', error);
        document.getElementById('statusMessages').innerHTML = `
            <div class="status-error">Error al inicializar la aplicación</div>
        `;
    }
});

// Sistema de guardado mejorado
const saveSystem = {
    async saveCharacter(character) {
        try {
            const serializedData = JSON.stringify(character);
            await localStorage.setItem('characterData', serializedData);
            document.getElementById('statusMessages').innerHTML = `
                <div class="status-success">Personaje guardado correctamente</div>
            `;
            return true;
        } catch (error) {
            console.error('Error al guardar:', error);
            document.getElementById('statusMessages').innerHTML = `
                <div class="status-error">Error al guardar el personaje</div>
            `;
            return false;
        }
    },

    async loadCharacter() {
        try {
            const data = await localStorage.getItem('characterData');
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error al cargar:', error);
            return null;
        }
    }
};

import { InfoContainer } from '/modules/bg3-hud-core/scripts/components/containers/InfoContainer.js';

const MODULE_ID = 'bg3-hud-dc20rpg';

// DC20 Attributes (from DC20RPG.attributes in config)
const DC20_ATTRIBUTES = {
    mig: { label: 'Might', icon: 'fas fa-dumbbell' },
    agi: { label: 'Agility', icon: 'fas fa-running' },
    int: { label: 'Intelligence', icon: 'fas fa-brain' },
    cha: { label: 'Charisma', icon: 'fas fa-comments' }
};

// DC20 Skills mapped to attributes (from DC20RPG.skills in config)
const DC20_SKILLS = {
    awa: { label: 'Awareness', attr: 'int' },
    ath: { label: 'Athletics', attr: 'mig' },
    inm: { label: 'Intimidation', attr: 'mig' },
    acr: { label: 'Acrobatics', attr: 'agi' },
    tri: { label: 'Trickery', attr: 'agi' },
    ste: { label: 'Stealth', attr: 'agi' },
    inv: { label: 'Investigation', attr: 'int' },
    med: { label: 'Medicine', attr: 'int' },
    sur: { label: 'Survival', attr: 'int' },
    ani: { label: 'Animal', attr: 'cha' },
    ins: { label: 'Insight', attr: 'cha' },
    inf: { label: 'Influence', attr: 'cha' }
};

/**
 * DC20 Info Container
 * Displays ability scores, skills, and saving throws for DC20 RPG
 */
export class Dc20InfoContainer extends InfoContainer {
    constructor(options = {}) {
        super(options);
        this.selectedAttribute = null;
    }

    /**
     * Render the DC20 specific content
     * @returns {Promise<HTMLElement>}
     */
    async renderContent() {
        const content = this.createElement('div', ['bg3-info-content']);

        // Left column: Skills (filtered to selected attribute)
        const skillsColumn = await this._renderSkills();
        content.appendChild(skillsColumn);

        // Center column: Attributes
        const attributesColumn = await this._renderAttributes();
        content.appendChild(attributesColumn);

        // Right column: Saves
        const savesColumn = await this._renderSaves();
        content.appendChild(savesColumn);

        return content;
    }

    /**
     * Handle right-click on info button - open roll select dialog
     * @param {MouseEvent} event - The context menu event
     * @override
     */
    async onButtonRightClick(event) {
        if (!this.actor) return;

        try {
            // Use DC20's RollSelect dialog for attribute/skill/save selection
            const RollSelect = window.DC20?.dialog?.RollSelect;
            if (RollSelect && typeof RollSelect.open === 'function') {
                RollSelect.open(this.actor, { basic: true, save: true, attribute: true, skill: true, trade: true });
            } else if (typeof this.actor.rollInitiative === 'function') {
                await this.actor.rollInitiative({ createCombatants: true });
            }
        } catch (err) {
            console.error('DC20 Info | Roll select failed', err);
        }
    }

    /**
     * Handle attribute click - show related skills
     * @param {string} attrId - The attribute that was clicked
     * @private
     */
    async _onAttributeClick(attrId) {
        if (this.selectedAttribute === attrId) {
            this.selectedAttribute = null;
        } else {
            this.selectedAttribute = attrId;
        }

        // Re-render content
        if (this.panel) {
            this.panel.innerHTML = '';
            const content = await this.renderContent();
            this.panel.appendChild(content);
        }
    }

    /**
     * Render attributes
     * @returns {Promise<HTMLElement>}
     * @private
     */
    async _renderAttributes() {
        const column = this.createElement('div', ['bg3-info-abilities']);

        for (const [attrId, config] of Object.entries(DC20_ATTRIBUTES)) {
            // DC20 stores attributes at system.attributes.[attrId].value
            const attrData = this.actor?.system?.attributes?.[attrId];
            const value = attrData?.value ?? 0;

            const attrDiv = this.createElement('div', ['bg3-info-ability']);

            if (attrId === this.selectedAttribute) {
                attrDiv.classList.add('selected');
            }

            const nameSpan = this.createElement('span', ['bg3-info-ability-name']);
            nameSpan.textContent = config.label;

            const modifierSpan = this.createElement('span', ['bg3-info-ability-modifier']);
            if (value >= 0) modifierSpan.classList.add('positive');
            modifierSpan.textContent = value >= 0 ? `+${value}` : value;

            // Click to show related skills
            this.addEventListener(attrDiv, 'click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                await this._onAttributeClick(attrId);
            });

            attrDiv.appendChild(nameSpan);
            attrDiv.appendChild(modifierSpan);
            column.appendChild(attrDiv);
        }

        return column;
    }

    /**
     * Render skills
     * @returns {Promise<HTMLElement>}
     * @private
     */
    async _renderSkills() {
        const column = this.createElement('div', ['bg3-info-skills']);

        if (!this.selectedAttribute) {
            return column;
        }

        // Header
        const header = this.createElement('div', ['bg3-info-section-header']);
        header.textContent = 'Skills';
        column.appendChild(header);

        for (const [skillId, config] of Object.entries(DC20_SKILLS)) {
            if (config.attr !== this.selectedAttribute) continue;

            // DC20 stores skills at system.skills.[skillId].modifier
            const skillData = this.actor?.system?.skills?.[skillId];
            const modifier = skillData?.modifier ?? 0;

            const skillDiv = this.createElement('div', ['bg3-info-skill']);

            const nameSpan = this.createElement('span', ['bg3-info-skill-name']);
            nameSpan.textContent = config.label;

            const modifierSpan = this.createElement('span', ['bg3-info-skill-modifier']);
            if (modifier >= 0) modifierSpan.classList.add('positive');
            modifierSpan.textContent = modifier >= 0 ? `+${modifier}` : modifier;

            // Click to roll skill
            this.addEventListener(skillDiv, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._rollSkill(skillId);
            });

            skillDiv.appendChild(nameSpan);
            skillDiv.appendChild(modifierSpan);
            column.appendChild(skillDiv);
        }

        return column;
    }

    /**
     * Render saves
     * @returns {Promise<HTMLElement>}
     * @private
     */
    async _renderSaves() {
        const column = this.createElement('div', ['bg3-info-saves']);

        // Header
        const header = this.createElement('div', ['bg3-info-section-header']);
        header.textContent = 'Saves';
        column.appendChild(header);

        // DC20 has Physical and Mental saves
        const saves = [
            { id: 'phy', label: 'Physical' },
            { id: 'men', label: 'Mental' }
        ];

        for (const save of saves) {
            // DC20 stores saves at system.saves.[saveId].value
            const saveData = this.actor?.system?.saves?.[save.id];
            const value = saveData?.value ?? 0;

            const saveDiv = this.createElement('div', ['bg3-info-save']);

            const nameSpan = this.createElement('span', ['bg3-info-save-name']);
            nameSpan.textContent = save.label;

            const modifierSpan = this.createElement('span', ['bg3-info-save-modifier']);
            if (value >= 0) modifierSpan.classList.add('positive');
            modifierSpan.textContent = value >= 0 ? `+${value}` : value;

            // Click to roll save
            this.addEventListener(saveDiv, 'click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this._rollSave(save.id);
            });

            saveDiv.appendChild(nameSpan);
            saveDiv.appendChild(modifierSpan);
            column.appendChild(saveDiv);
        }

        return column;
    }

    /**
     * Roll a skill check using DC20's RollDialog
     * @param {string} skillId - Skill key
     * @private
     */
    async _rollSkill(skillId) {
        // Use DC20's roll API
        const details = game.dc20rpg?.rolls?.prepareCheckDetailsFor?.(this.actor, skillId);
        if (details) {
            const RollDialog = window.DC20?.dialog?.RollDialog;
            if (RollDialog) {
                await RollDialog.open(this.actor, details);
            }
        }
    }

    /**
     * Roll a save using DC20's RollDialog
     * @param {string} saveId - Save key
     * @private
     */
    async _rollSave(saveId) {
        // Use DC20's roll API
        const details = game.dc20rpg?.rolls?.prepareSaveDetailsFor?.(this.actor, saveId);
        if (details) {
            const RollDialog = window.DC20?.dialog?.RollDialog;
            if (RollDialog) {
                await RollDialog.open(this.actor, details);
            }
        }
    }
}

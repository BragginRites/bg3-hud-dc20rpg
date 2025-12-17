import { AutoPopulateFramework } from '/modules/bg3-hud-core/scripts/features/AutoPopulateFramework.js';

const MODULE_ID = 'bg3-hud-dc20rpg';

// DC20 item types that can be placed on the hotbar
const DC20_USABLE_ITEM_TYPES = [
    'weapon',
    'spell',
    'technique',
    'feature',
    'consumable',
    'basicAction',
    'infusion'
];

/**
 * DC20 Auto Populate Implementation
 * Provides DC20-specific item filtering and population logic
 */
export class Dc20AutoPopulate extends AutoPopulateFramework {
    /**
     * Get DC20 item type choices (grouped)
     * @returns {Promise<Array<{group: string, choices: Array<{value: string, label: string}>}>>}
     */
    async getItemTypeChoices() {
        const groups = [];

        // Combat group
        const combatChoices = [
            this._buildChoice('weapon', 'Weapons'),
            this._buildChoice('basicAction', 'BasicActions'),
            this._buildChoice('technique', 'Techniques'),
            this._buildChoice('technique:maneuver', 'Maneuvers')
        ];
        groups.push({
            group: game.i18n.localize(`${MODULE_ID}.AutoPopulate.Groups.Combat`),
            choices: combatChoices
        });

        // Magic group
        const magicChoices = [
            this._buildChoice('spell', 'Spells'),
            this._buildChoice('spell:cantrip', 'Cantrips'),
            this._buildChoice('spell:ritual', 'Rituals'),
            this._buildChoice('infusion', 'Infusions')
        ];
        groups.push({
            group: game.i18n.localize(`${MODULE_ID}.AutoPopulate.Groups.Magic`),
            choices: magicChoices
        });

        // Features group
        const featureChoices = [
            this._buildChoice('feature', 'Features'),
            this._buildChoice('feature:class', 'ClassFeatures'),
            this._buildChoice('feature:ancestry', 'AncestryFeatures')
        ];
        groups.push({
            group: game.i18n.localize(`${MODULE_ID}.AutoPopulate.Groups.Features`),
            choices: featureChoices
        });

        // Consumables group
        const consumableChoices = [
            this._buildChoice('consumable', 'Consumables'),
            this._buildChoice('consumable:potion', 'Potions'),
            this._buildChoice('consumable:scroll', 'Scrolls'),
            this._buildChoice('consumable:bomb', 'Bombs')
        ];
        groups.push({
            group: game.i18n.localize(`${MODULE_ID}.AutoPopulate.Groups.Consumables`),
            choices: consumableChoices
        });

        return groups;
    }

    /**
     * Get items from actor that match selected types
     * @param {Actor} actor - The actor
     * @param {Array<string>} selectedTypes - Selected type values
     * @returns {Promise<Array<{uuid: string}>>}
     */
    async getMatchingItems(actor, selectedTypes) {
        const items = [];

        for (const item of actor.items) {
            // Skip non-usable item types
            if (!DC20_USABLE_ITEM_TYPES.includes(item.type)) {
                continue;
            }

            if (!this._matchesType(item, selectedTypes)) {
                continue;
            }

            // Skip items without usable flag (if defined)
            if (item.system?.usable === false) {
                continue;
            }

            items.push({ uuid: item.uuid });
        }

        return items;
    }

    /**
     * Check if item matches any of the selected types
     * @param {Item} item - The item to check
     * @param {Array<string>} selectedTypes - Selected type values
     * @returns {boolean}
     * @private
     */
    _matchesType(item, selectedTypes) {
        const itemType = item.type;

        for (const selectedType of selectedTypes) {
            if (selectedType.includes(':')) {
                const [mainType, subType] = selectedType.split(':');

                if (itemType !== mainType) continue;

                // Handle subtypes
                if (mainType === 'spell') {
                    const spellType = item.system?.spellType || '';
                    if (subType === 'cantrip' && spellType === 'cantrip') return true;
                    if (subType === 'ritual' && spellType === 'ritual') return true;
                } else if (mainType === 'technique') {
                    const techType = item.system?.techniqueType || '';
                    if (subType === 'maneuver' && techType === 'maneuver') return true;
                } else if (mainType === 'feature') {
                    const featureType = item.system?.featureType || '';
                    if (subType === 'class' && featureType === 'class') return true;
                    if (subType === 'ancestry' && featureType === 'ancestry') return true;
                } else if (mainType === 'consumable') {
                    const consumableType = item.system?.consumableType || '';
                    if (subType === consumableType) return true;
                }
            } else {
                // Direct type match
                if (itemType === selectedType) return true;
            }
        }
        return false;
    }

    /**
     * Build a localized choice entry
     * @param {string} value
     * @param {string} labelKey
     * @returns {{value: string, label: string}}
     * @private
     */
    _buildChoice(value, labelKey) {
        return {
            value,
            label: game.i18n.localize(`${MODULE_ID}.AutoPopulate.ItemTypes.${labelKey}`)
        };
    }
}

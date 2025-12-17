import { FilterContainer } from '/modules/bg3-hud-core/scripts/components/containers/FilterContainer.js';

const MODULE_ID = 'bg3-hud-dc20rpg';

/**
 * DC20 Filter Container
 * Provides action type and category filters for the hotbar
 */
export class Dc20FilterContainer extends FilterContainer {
    /**
     * Create DC20 filter container
     * @param {Object} options - Container options
     */
    constructor(options = {}) {
        super({
            ...options,
            getFilters: () => this.getDc20Filters()
        });
    }

    /**
     * Get DC20-specific filter definitions
     * @returns {Array<Object>} Filter definitions
     */
    getDc20Filters() {
        const filters = [];

        if (!this.actor) return filters;

        // Attack filter
        filters.push({
            id: 'attack',
            label: game.i18n.localize(`${MODULE_ID}.Filters.Attack`),
            symbol: 'fa-sword',
            classes: ['action-type-button'],
            color: '#e74c3c',
            data: { actionType: 'attack' }
        });

        // Spell filter
        filters.push({
            id: 'spells',
            label: game.i18n.localize(`${MODULE_ID}.Filters.Spell`),
            symbol: 'fa-hat-wizard',
            classes: ['action-type-button'],
            color: '#9b59b6',
            data: { itemType: 'spell' }
        });

        // Technique filter
        filters.push({
            id: 'technique',
            label: 'Techniques',
            symbol: 'fa-hand-fist',
            classes: ['action-type-button'],
            color: '#f39c12',
            data: { itemType: 'technique' }
        });

        // Weapon filter
        filters.push({
            id: 'weapon',
            label: 'Weapons',
            symbol: 'fa-sword',
            classes: ['item-type-button'],
            color: '#3498db',
            data: { itemType: 'weapon' }
        });

        // Consumable filter
        filters.push({
            id: 'consumable',
            label: 'Consumables',
            symbol: 'fa-flask',
            classes: ['item-type-button'],
            color: '#2ecc71',
            data: { itemType: 'consumable' }
        });

        return filters;
    }

    /**
     * Check if a cell matches a filter (DC20-specific logic)
     * @param {FilterButton} filter - The filter button
     * @param {HTMLElement} cell - The cell element
     * @returns {boolean}
     */
    matchesFilter(filter, cell) {
        if (!filter || !cell) return false;

        const filterData = filter.data;

        // Handle action type filtering
        if (filterData.actionType) {
            return cell.dataset.actionType === filterData.actionType;
        }

        // Handle item type filtering
        if (filterData.itemType) {
            return cell.dataset.itemType === filterData.itemType;
        }

        // Handle category filtering
        if (filterData.category) {
            return cell.dataset.category === filterData.category;
        }

        // Handle spell type filtering
        if (filterData.spellType) {
            return cell.dataset.spellType === filterData.spellType;
        }

        return false;
    }
}

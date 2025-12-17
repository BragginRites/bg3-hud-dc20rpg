import { AutoSortFramework } from '/modules/bg3-hud-core/scripts/features/AutoSortFramework.js';

/**
 * DC20 Auto Sort Implementation
 * Provides DC20-specific sorting logic
 */
export class Dc20AutoSort extends AutoSortFramework {
    /**
     * Sort items according to DC20 conventions
     * Order: Weapons -> Techniques -> Spells (by type) -> Features -> Consumables
     * @param {Array<Object>} items - Array of cell data objects
     * @returns {Array<Object>} Sorted array
     */
    sortItems(items) {
        return items.sort((a, b) => {
            const typeOrderA = this._getTypeOrder(a);
            const typeOrderB = this._getTypeOrder(b);

            if (typeOrderA !== typeOrderB) {
                return typeOrderA - typeOrderB;
            }

            // Secondary sort by spell type for spells
            if (a.itemData?.itemType === 'spell' && b.itemData?.itemType === 'spell') {
                const spellOrderA = this._getSpellTypeOrder(a.itemData?.spellType);
                const spellOrderB = this._getSpellTypeOrder(b.itemData?.spellType);
                if (spellOrderA !== spellOrderB) {
                    return spellOrderA - spellOrderB;
                }
            }

            // Alphabetical fallback
            return (a.name || '').localeCompare(b.name || '');
        });
    }

    /**
     * Get sort order for item type
     * @param {Object} cellData - Cell data object
     * @returns {number}
     * @private
     */
    _getTypeOrder(cellData) {
        const type = cellData.itemData?.itemType || cellData.type;
        switch (type) {
            case 'weapon': return 0;
            case 'basicAction': return 1;
            case 'technique': return 2;
            case 'spell': return 3;
            case 'infusion': return 4;
            case 'feature': return 5;
            case 'consumable': return 6;
            case 'equipment': return 7;
            default: return 99;
        }
    }

    /**
     * Get sort order for spell type
     * @param {string} spellType - Spell type (cantrip, spell, ritual)
     * @returns {number}
     * @private
     */
    _getSpellTypeOrder(spellType) {
        switch (spellType) {
            case 'cantrip': return 0;
            case 'spell': return 1;
            case 'ritual': return 2;
            default: return 99;
        }
    }
}

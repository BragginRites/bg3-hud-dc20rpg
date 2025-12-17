/**
 * BG3 HUD DC20 RPG Adapter Module
 * Registers DC20 RPG specific components with the BG3 HUD Core
 */

import { registerSettings } from './utils/settings.js';
import { Dc20ActionButtonsContainer } from './components/containers/Dc20ActionButtonsContainer.js';
import { Dc20FilterContainer } from './components/containers/Dc20FilterContainer.js';
import { Dc20InfoContainer } from './components/containers/Dc20InfoContainer.js';
import { Dc20AutoPopulate } from './features/Dc20AutoPopulate.js';
import { Dc20AutoSort } from './features/Dc20AutoSort.js';
import { Dc20MenuBuilder } from './components/menus/Dc20MenuBuilder.js';
import { renderDc20Tooltip } from './utils/tooltipRenderer.js';

const MODULE_ID = 'bg3-hud-dc20rpg';

console.log('BG3 HUD DC20 | Loading adapter');

/**
 * Register settings
 */
Hooks.once('init', () => {
    console.log('BG3 HUD DC20 | Registering settings');
    registerSettings();
});

/**
 * Wait for core to be ready, then register DC20 components
 */
Hooks.on('bg3HudReady', async (BG3HUD_API) => {
    console.log('BG3 HUD DC20 | Received bg3HudReady hook');

    // Verify we're in DC20 system
    if (game.system.id !== 'dc20rpg') {
        console.warn('BG3 HUD DC20 | Not running DC20 RPG system, skipping registration');
        return;
    }

    console.log('BG3 HUD DC20 | Registering DC20 components');

    // Create and register the adapter instance
    const adapter = new Dc20Adapter();
    BG3HUD_API.registerAdapter(adapter);

    // Register container classes
    BG3HUD_API.registerActionButtonsContainer(Dc20ActionButtonsContainer);
    console.log('BG3 HUD DC20 | Action buttons container registered');

    BG3HUD_API.registerFilterContainer(Dc20FilterContainer);
    console.log('BG3 HUD DC20 | Filter container registered');

    BG3HUD_API.registerInfoContainer(Dc20InfoContainer);
    console.log('BG3 HUD DC20 | Info container registered');

    // Register menu builder
    BG3HUD_API.registerMenuBuilder('dc20rpg', Dc20MenuBuilder, { adapter: adapter });
    console.log('BG3 HUD DC20 | Menu builder registered');

    // Register tooltip renderer
    BG3HUD_API.registerTooltipRenderer?.('dc20rpg', renderDc20Tooltip);
    console.log('BG3 HUD DC20 | Tooltip renderer registered');

    console.log('BG3 HUD DC20 | Registration complete');

    // Signal that adapter registration is complete
    Hooks.call('bg3HudRegistrationComplete');
});

/**
 * DC20 Adapter Class
 * Handles system-specific interactions and data transformations
 */
class Dc20Adapter {
    constructor() {
        this.MODULE_ID = MODULE_ID;
        this.systemId = 'dc20rpg';
        this.name = 'DC20 RPG Adapter';

        // Initialize features
        this.autoSort = new Dc20AutoSort();
        this.autoPopulate = new Dc20AutoPopulate();
        this.autoPopulate.setAutoSort(this.autoSort);

        console.log('BG3 HUD DC20 | Dc20Adapter created with autoSort and autoPopulate');
    }

    /**
     * Get default portrait data configuration for DC20
     * Uses DC20's resource paths (health.current, health.max, etc.)
     * @returns {Array<Object>} Default slot configurations
     */
    getPortraitDataDefaults() {
        return [
            { path: 'system.resources.stamina.value', icon: 'fas fa-fist-raised', color: '#e67e22' },
            { path: 'system.resources.mana.value', icon: 'fas fa-hat-wizard', color: '#9b59b6' },
            { path: 'system.movement.ground.current', icon: 'fas fa-running', color: '#2ecc71' },
            { path: '', icon: '', color: '#ffffff' },
            { path: '', icon: '', color: '#ffffff' },
            { path: '', icon: '', color: '#ffffff' }
        ];
    }

    /**
     * Handle cell click (use item/spell/action)
     * Uses DC20's RollDialog API
     * @param {GridCell} cell - The clicked cell
     * @param {MouseEvent} event - The click event
     */
    async onCellClick(cell, event) {
        const data = cell.data;
        if (!data) return;

        console.log('DC20 Adapter | Cell clicked:', data);

        switch (data.type) {
            case 'Item':
                await this._useItem(data.uuid, event);
                break;
            case 'Macro':
                await this._executeMacro(data.uuid);
                break;
            default:
                console.warn('DC20 Adapter | Unknown cell data type:', data.type);
        }
    }

    /**
     * Get context menu items for a cell
     * @param {GridCell} cell - The cell to get menu items for
     * @returns {Array} Menu items
     */
    async getCellMenuItems(cell) {
        const menuBuilder = new Dc20MenuBuilder(this);
        return menuBuilder.buildMenu(cell, cell.data);
    }

    /**
     * Use a DC20 item
     * Uses DC20's native RollDialog.open API
     * @param {string} uuid - Item UUID
     * @param {MouseEvent} event - The triggering event
     * @private
     */
    async _useItem(uuid, event) {
        const item = await fromUuid(uuid);
        if (!item) {
            console.warn('DC20 Adapter | Item not found:', uuid);
            return;
        }

        const actor = item.actor;
        if (!actor) {
            console.warn('DC20 Adapter | Item has no actor:', uuid);
            return;
        }

        // Check if item has actionType (means it's usable)
        const actionType = item.system?.actionType;
        if (!actionType || actionType === '') {
            // Non-usable items (passives) - show item sheet
            item.sheet?.render(true);
            return;
        }

        // Use DC20's RollDialog API (window.DC20.dialog.RollDialog)
        const RollDialog = window.DC20?.dialog?.RollDialog;
        if (RollDialog && typeof RollDialog.open === 'function') {
            // Shift key enables quick roll (skip dialog)
            await RollDialog.open(actor, item, { quickRoll: event?.shiftKey ?? false });
        } else {
            console.warn('DC20 Adapter | RollDialog not available, opening sheet instead');
            item.sheet?.render(true);
        }
    }

    /**
     * Execute a macro
     * @param {string} uuid - Macro UUID
     * @private
     */
    async _executeMacro(uuid) {
        const macro = await fromUuid(uuid);
        if (!macro) {
            console.warn('DC20 Adapter | Macro not found:', uuid);
            return;
        }
        await macro.execute();
    }

    /**
     * Auto-populate passives on token creation
     * In DC20, passives are features with empty actionType
     * @param {Token} token - The newly created token
     */
    async autoPopulatePassives(token) {
        const actor = token.actor;
        if (!actor) return [];

        const passives = [];
        for (const item of actor.items) {
            // Features without actionType are passive
            if (item.type === 'feature' && !item.system?.actionType) {
                passives.push(item.uuid);
            }
        }
        return passives;
    }

    /**
     * Decorate a cell element with DC20-specific dataset attributes
     * Matches DC20's filtering logic from hotbar.mjs
     * @param {HTMLElement} cellElement - The cell element to decorate
     * @param {Object} cellData - The cell's data object
     */
    decorateCellElement(cellElement, cellData) {
        if (!cellData?.itemData) return;

        const itemData = cellData.itemData;

        // Item type
        if (itemData.itemType) {
            cellElement.dataset.itemType = itemData.itemType;
        }

        // Action type (attack, check, etc.)
        if (itemData.actionType) {
            cellElement.dataset.actionType = itemData.actionType;
        }

        // Check type for filtering (att, spe, skill, etc.)
        if (itemData.checkType) {
            cellElement.dataset.checkType = itemData.checkType;
        }

        // Attack check type (attack or spell)
        if (itemData.attackCheckType) {
            cellElement.dataset.attackCheckType = itemData.attackCheckType;
        }

        // Is reaction
        if (itemData.isReaction) {
            cellElement.dataset.isReaction = 'true';
        }
    }

    /**
     * Get display settings from the adapter
     * @returns {Object} Display settings object
     */
    getDisplaySettings() {
        return {
            showItemNames: game.settings.get(MODULE_ID, 'showItemNames'),
            showItemUses: game.settings.get(MODULE_ID, 'showItemUses')
        };
    }

    /**
     * Transform a DC20 item to cell data format
     * Uses DC20's data structure
     * @param {Item} item - The item to transform
     * @returns {Promise<Object>} Cell data object
     */
    async transformItemToCellData(item) {
        const system = item.system || {};
        const charges = system.costs?.charges;
        const quantity = system.quantity ?? 1;

        return {
            uuid: item.uuid,
            name: item.name,
            img: item.img,
            type: 'Item',
            uses: charges?.maxChargesFormula ? {
                value: charges.current ?? 0,
                max: charges.max ?? 0
            } : null,
            quantity: quantity > 1 ? quantity : null,
            itemData: {
                itemType: item.type,
                actionType: system.actionType || '',
                checkType: system.check?.checkKey || '',
                attackCheckType: system.attackFormula?.checkType || '',
                isReaction: system.isReaction || false
            }
        };
    }
}

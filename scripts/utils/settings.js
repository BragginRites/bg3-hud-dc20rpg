import { createSettingsSubmenu } from '/modules/bg3-hud-core/scripts/api/SettingsSubmenu.js';

const MODULE_ID = 'bg3-hud-dc20rpg';

const openAutoPopulateConfiguration = async () => {
    const adapter = ui.BG3HOTBAR?.registry?.activeAdapter;
    if (!adapter || !adapter.autoPopulate) {
        ui.notifications.error('Auto-populate system not available');
        return;
    }

    const currentConfig = game.settings.get(MODULE_ID, 'autoPopulateConfiguration');
    const choices = await adapter.autoPopulate.getItemTypeChoices();

    if (!choices || choices.length === 0) {
        ui.notifications.warn('No item types available for auto-populate');
        return;
    }

    const { AutoPopulateConfigDialog } = await import(
        '/modules/bg3-hud-core/scripts/components/ui/AutoPopulateConfigDialog.js'
    );

    const result = await new AutoPopulateConfigDialog({
        title: 'Configure Auto-Populate Grids',
        choices,
        configuration: currentConfig,
    }).render();

    if (result) {
        await game.settings.set(MODULE_ID, 'autoPopulateConfiguration', result);
        ui.notifications.info('Auto-populate configuration saved');
    }
};

class AutoPopulateConfigMenu extends foundry.applications.api.ApplicationV2 {
    static DEFAULT_OPTIONS = {
        window: { frame: false, positioned: false, resizable: false, minimizable: false },
        position: { width: 'auto', height: 'auto' },
        tag: 'div',
    };

    async render() {
        await openAutoPopulateConfiguration();
        return this;
    }
}

/**
 * Register DC20 RPG adapter module settings
 */
export function registerSettings() {
    // Auto-populate passives setting
    game.settings.register(MODULE_ID, 'autoPopulatePassivesEnabled', {
        name: 'Auto-Populate Passives',
        hint: 'Automatically populate passive features when a token is created.',
        scope: 'world',
        config: false,
        type: Boolean,
        default: true
    });

    // Auto-populate for player characters
    game.settings.register(MODULE_ID, 'autoPopulatePlayerCharacters', {
        name: 'Auto-Populate Player Characters',
        hint: 'Also auto-populate hotbars for player characters (not just NPCs).',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false
    });

    // Display item names setting
    game.settings.register(MODULE_ID, 'showItemNames', {
        name: 'Show Item Names',
        hint: 'Display item names below hotbar icons.',
        scope: 'client',
        config: false,
        type: Boolean,
        default: false
    });

    // Display item uses setting
    game.settings.register(MODULE_ID, 'showItemUses', {
        name: 'Show Item Uses',
        hint: 'Display remaining uses/charges on hotbar icons.',
        scope: 'client',
        config: false,
        type: Boolean,
        default: true
    });

    // Show health overlay setting
    game.settings.register(MODULE_ID, 'showHealthOverlay', {
        name: 'Show Health Overlay',
        hint: 'Display health bar overlay on portrait.',
        scope: 'client',
        config: false,
        type: Boolean,
        default: true
    });

    // Auto-populate on token creation setting
    game.settings.register(MODULE_ID, 'autoPopulateEnabled', {
        name: 'Auto-Populate on Token Creation',
        hint: 'Automatically populate hotbar grids when a new token is placed.',
        scope: 'world',
        config: false,
        type: Boolean,
        default: false
    });

    // Auto-populate configuration setting
    game.settings.register(MODULE_ID, 'autoPopulateConfiguration', {
        name: 'Auto-Populate Configuration',
        hint: 'Configuration for which item types to auto-populate in each grid.',
        restricted: true,
        scope: 'world',
        config: false,
        type: Object,
        default: {
            grid0: ['weapon', 'basicAction'],
            grid1: ['technique', 'spell'],
            grid2: ['consumable', 'feature']
        }
    });

    // Create submenu classes
    const DisplaySettingsMenu = createSettingsSubmenu({
        moduleId: MODULE_ID,
        titleKey: 'Display Settings',
        sections: [
            { legend: 'Display Options', keys: ['showItemNames', 'showItemUses', 'showHealthOverlay'] }
        ]
    });

    const AutoPopulateSettingsMenu = createSettingsSubmenu({
        moduleId: MODULE_ID,
        titleKey: 'Auto-Populate Settings',
        sections: [
            { legend: 'Auto-Populate Options', keys: ['autoPopulateEnabled', 'autoPopulatePassivesEnabled', 'autoPopulatePlayerCharacters'] }
        ]
    });

    // Auto-populate configuration menu
    game.settings.registerMenu(MODULE_ID, 'autoPopulateConfigurationMenu', {
        name: 'Configure Auto-Populate Grids',
        label: 'Configure Grids',
        hint: 'Configure which item types appear in each hotbar grid.',
        icon: 'fas fa-grid-2',
        type: AutoPopulateConfigMenu,
        restricted: true,
    });

    // Display submenu
    game.settings.registerMenu(MODULE_ID, 'displaySettingsMenu', {
        name: 'Display Settings',
        label: 'Display',
        hint: 'Configure display options for the HUD.',
        icon: 'fas fa-list',
        type: DisplaySettingsMenu,
        restricted: true
    });

    // Auto-populate submenu
    game.settings.registerMenu(MODULE_ID, 'autoPopulateSettingsMenu', {
        name: 'Auto-Populate Settings',
        label: 'Auto-Populate',
        hint: 'Configure auto-populate behavior.',
        icon: 'fas fa-list',
        type: AutoPopulateSettingsMenu,
        restricted: true
    });
}

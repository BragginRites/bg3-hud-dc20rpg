const MODULE_ID = 'bg3-hud-dc20rpg';

/**
 * DC20 Menu Builder
 * Provides context menus for DC20 items
 */
export class Dc20MenuBuilder {
    constructor(adapter) {
        this.adapter = adapter;
    }

    /**
     * Build context menu for a cell
     * @param {GridCell} cell - The cell
     * @param {Object} data - Cell data
     * @returns {Array<Object>} Menu items
     */
    async buildMenu(cell, data) {
        if (!data?.uuid) return [];

        const item = await fromUuid(data.uuid);
        if (!item) return [];

        const menuItems = [];

        // Toggle for toggleable items
        if (item.system?.toggle?.toggleable) {
            const isToggledOn = item.system.toggle.toggledOn;
            menuItems.push({
                label: game.i18n.localize(isToggledOn
                    ? `${MODULE_ID}.Context.Disable`
                    : `${MODULE_ID}.Context.Enable`),
                icon: isToggledOn ? 'fas fa-toggle-off' : 'fas fa-toggle-on',
                onClick: async () => {
                    await item.update({ 'system.toggle.toggledOn': !isToggledOn });
                }
            });
        }

        // Send to chat
        menuItems.push({
            label: game.i18n.localize(`${MODULE_ID}.Context.SendToChat`),
            icon: 'fas fa-comment',
            onClick: async () => {
                if (typeof game.dc20rpg?.tools?.sendDescriptionToChat === 'function') {
                    game.dc20rpg.tools.sendDescriptionToChat(item);
                } else {
                    ChatMessage.create({
                        content: `<h3>${item.name}</h3><p>${item.system?.description || ''}</p>`,
                        speaker: ChatMessage.getSpeaker({ actor: item.actor })
                    });
                }
            }
        });

        // Edit item
        menuItems.push({
            label: game.i18n.localize(`${MODULE_ID}.Context.Edit`),
            icon: 'fas fa-edit',
            onClick: () => {
                item.sheet?.render(true);
            }
        });

        // Remove from hotbar
        menuItems.push({
            label: game.i18n.localize(`${MODULE_ID}.Context.Remove`),
            icon: 'fas fa-times',
            onClick: async () => {
                cell.clearData();
            }
        });

        return menuItems;
    }
}

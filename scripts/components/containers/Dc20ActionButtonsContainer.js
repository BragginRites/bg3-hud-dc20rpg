import { createLogger } from '/modules/bg3-hud-core/scripts/utils/logger.js';

const log = createLogger('bg3-hud-dc20rpg');

/**
 * DC20 rest fill for the named Rest HUD part.
 * @param {{ actor?: Actor, token?: Token }} ctx
 * @returns {Array<Object>}
 */
export function getDc20Rests({ actor } = {}) {
    if (!actor) return [];

    return [
        {
            key: 'rest',
            classes: ['rest-button'],
            icon: 'fas fa-bed',
            label: 'Rest',
            tooltip: 'Open rest dialog',
            tooltipDirection: 'LEFT',
            visible: () => !game.combat?.started,
            onClick: async () => {
                try {
                    const RestDialog = window.DC20?.dialog?.RestDialog;
                    if (RestDialog) {
                        new RestDialog(actor).render(true);
                    } else {
                        ui.notifications?.warn('Rest dialog not available');
                    }
                } catch (error) {
                    log.error('Rest failed:', error);
                    ui.notifications?.error('Failed to open rest dialog');
                }
            }
        }
    ];
}

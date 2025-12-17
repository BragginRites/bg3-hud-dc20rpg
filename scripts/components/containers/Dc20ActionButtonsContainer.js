import { ActionButtonsContainer } from '/modules/bg3-hud-core/scripts/components/containers/ActionButtonsContainer.js';

const MODULE_ID = 'bg3-hud-dc20rpg';

/**
 * DC20 Action Buttons Container
 * Provides rest and turn buttons specific to DC20 RPG
 */
export class Dc20ActionButtonsContainer extends ActionButtonsContainer {
    /**
     * Create DC20 action buttons container
     * @param {Object} options - Container options
     * @param {Actor} options.actor - The actor
     * @param {Token} options.token - The token
     */
    constructor(options = {}) {
        super({
            ...options,
            getButtons: () => this.getDc20Buttons()
        });
    }

    /**
     * Get DC20-specific button definitions
     * @returns {Array<Object>} Button definitions
     */
    getDc20Buttons() {
        const buttons = [];

        if (!this.actor) return buttons;

        // End Turn button (visible during combat when it's the actor's turn)
        buttons.push({
            key: 'end-turn',
            classes: ['end-turn-button'],
            icon: 'fas fa-stopwatch',
            label: '',
            tooltip: 'End Turn',
            tooltipDirection: 'LEFT',
            visible: () => {
                // DC20 uses actor.myTurnActive to check if it's the actor's turn
                return !!game.combat?.started &&
                    (this.actor.myTurnActive || game.combat?.combatant?.actor?.id === this.actor.id);
            },
            onClick: async () => {
                if (game.combat) {
                    await game.combat.nextTurn();
                }
            }
        });

        // Rest button (visible outside combat)
        // Uses DC20's RestDialog
        buttons.push({
            key: 'rest',
            classes: ['rest-button'],
            icon: 'fas fa-bed',
            label: 'Rest',
            tooltip: 'Open rest dialog',
            tooltipDirection: 'LEFT',
            visible: () => {
                return !game.combat?.started;
            },
            onClick: async () => {
                if (!this.actor) return;
                try {
                    // Use DC20's RestDialog API (window.DC20.dialog.RestDialog)
                    const RestDialog = window.DC20?.dialog?.RestDialog;
                    if (RestDialog) {
                        new RestDialog(this.actor).render(true);
                    } else {
                        ui.notifications?.warn('Rest dialog not available');
                    }
                } catch (error) {
                    console.error('DC20 Action Buttons | Rest failed:', error);
                    ui.notifications?.error('Failed to open rest dialog');
                }
            }
        });

        return buttons;
    }
}

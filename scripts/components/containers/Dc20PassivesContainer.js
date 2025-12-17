const MODULE_ID = 'bg3-hud-dc20rpg';

/**
 * Create the Dc20PassivesContainer class
 * Extends the core PassivesContainer with DC20-specific functionality
 */
export async function createDc20PassivesContainer() {
    const { PassivesContainer } = await import('/modules/bg3-hud-core/scripts/components/containers/PassivesContainer.js');

    return class Dc20PassivesContainer extends PassivesContainer {
        /**
         * Get passive features from actor
         * Features without actionType are considered passive
         * @param {Actor} actor - The actor
         * @returns {Array<Object>} Passive features
         */
        getPassiveFeatures(actor) {
            if (!actor) return [];

            const passives = [];
            for (const item of actor.items) {
                // Features without action type are passive
                if (item.type === 'feature' && !item.system?.actionType) {
                    passives.push({
                        uuid: item.uuid,
                        name: item.name,
                        img: item.img,
                        description: item.system?.description || ''
                    });
                }
            }
            return passives;
        }

        /**
         * Filter available passive features for configuration
         * @param {Actor} actor - The actor
         * @returns {Array<Object>} All available passive features
         */
        getAvailablePassives(actor) {
            return this.getPassiveFeatures(actor);
        }
    };
}

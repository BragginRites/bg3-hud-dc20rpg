const MODULE_ID = 'bg3-hud-dc20rpg';

/**
 * Create the Dc20PortraitContainer class
 * Extends the core PortraitContainer with DC20-specific functionality
 */
export async function createDc20PortraitContainer() {
    const { PortraitContainer } = await import('/modules/bg3-hud-core/scripts/components/containers/PortraitContainer.js');

    return class Dc20PortraitContainer extends PortraitContainer {
        /**
         * Get health data from DC20 actor
         * @param {Actor} actor - The actor
         * @returns {Object} Health data
         */
        getHealthData(actor) {
            if (!actor) return { current: 0, max: 0, temp: 0 };

            const health = actor.system?.resources?.health || {};
            return {
                current: health.value ?? health.current ?? 0,
                max: health.max ?? 0,
                temp: health.temp ?? health.temporary ?? 0
            };
        }

        /**
         * Get death save data if applicable
         * @param {Actor} actor - The actor
         * @returns {Object|null} Death save data or null
         */
        getDeathSaveData(actor) {
            if (!actor) return null;

            const health = this.getHealthData(actor);
            if (health.current > 0) return null;

            const deathSaves = actor.system?.deathSaves || actor.system?.death || {};
            return {
                successes: deathSaves.successes ?? 0,
                failures: deathSaves.failures ?? 0
            };
        }

        /**
         * Get portrait extra data slots
         * @param {Actor} actor - The actor
         * @returns {Array<Object>} Extra data slots
         */
        getExtraDataSlots(actor) {
            if (!actor) return [];

            const slots = [];

            // Precision Defense
            const precisionDC = actor.system?.defences?.precision?.dc;
            if (precisionDC !== undefined) {
                slots.push({
                    icon: 'fas fa-shield-alt',
                    value: precisionDC,
                    color: '#4a90d9',
                    tooltip: 'Precision Defense'
                });
            }

            // Stamina
            const stamina = actor.system?.resources?.stamina;
            if (stamina) {
                slots.push({
                    icon: 'fas fa-fist-raised',
                    value: `${stamina.value ?? 0}/${stamina.max ?? 0}`,
                    color: '#e67e22',
                    tooltip: 'Stamina'
                });
            }

            // Mana
            const mana = actor.system?.resources?.mana;
            if (mana && mana.max > 0) {
                slots.push({
                    icon: 'fas fa-hat-wizard',
                    value: `${mana.value ?? 0}/${mana.max ?? 0}`,
                    color: '#9b59b6',
                    tooltip: 'Mana'
                });
            }

            // Speed
            const speed = actor.system?.movement?.ground?.current;
            if (speed !== undefined) {
                slots.push({
                    icon: 'fas fa-running',
                    value: speed,
                    color: '#2ecc71',
                    tooltip: 'Ground Speed'
                });
            }

            return slots;
        }

        /**
         * Apply damage to actor
         * @param {Actor} actor - The actor
         * @param {number} amount - Damage amount
         */
        async applyDamage(actor, amount) {
            if (typeof game.dc20rpg?.tools?.applyDamage === 'function') {
                await game.dc20rpg.tools.applyDamage(actor, amount);
            } else {
                // Fallback: direct update
                const health = actor.system?.resources?.health;
                if (health) {
                    const newValue = Math.max(0, (health.value ?? health.current ?? 0) - amount);
                    await actor.update({ 'system.resources.health.value': newValue });
                }
            }
        }

        /**
         * Apply healing to actor
         * @param {Actor} actor - The actor
         * @param {number} amount - Healing amount
         */
        async applyHealing(actor, amount) {
            if (typeof game.dc20rpg?.tools?.applyHealing === 'function') {
                await game.dc20rpg.tools.applyHealing(actor, amount);
            } else {
                // Fallback: direct update
                const health = actor.system?.resources?.health;
                if (health) {
                    const newValue = Math.min(health.max ?? 0, (health.value ?? health.current ?? 0) + amount);
                    await actor.update({ 'system.resources.health.value': newValue });
                }
            }
        }
    };
}

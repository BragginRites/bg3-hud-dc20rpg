const MODULE_ID = 'bg3-hud-dc20rpg';

/**
 * Create the Dc20WeaponSetContainer class
 * Simple 2-slot weapon container for DC20
 */
export async function createDc20WeaponSetContainer() {
    const { WeaponSetContainer } = await import('/modules/bg3-hud-core/scripts/components/containers/WeaponSetContainer.js');

    return class Dc20WeaponSetContainer extends WeaponSetContainer {
        constructor() {
            super();
            this.slots = [null, null]; // Main hand, Off hand
        }

        /**
         * Get weapons from actor
         * @param {Actor} actor - The actor
         * @returns {Array<Object>} Equipped weapons
         */
        getWeapons(actor) {
            if (!actor) return [];

            const weapons = [];
            for (const item of actor.items) {
                if (item.type === 'weapon' && item.system?.statuses?.equipped) {
                    weapons.push({
                        uuid: item.uuid,
                        name: item.name,
                        img: item.img,
                        weaponType: item.system?.weaponType || 'melee'
                    });
                }
            }
            return weapons;
        }

        /**
         * Get weapon slot configuration
         * @returns {Array<Object>} Slot definitions
         */
        getSlots() {
            return [
                { id: 'main', label: 'Main Hand', icon: 'fas fa-hand-rock' },
                { id: 'off', label: 'Off Hand', icon: 'fas fa-hand-paper' }
            ];
        }

        /**
         * Equip a weapon to a slot
         * @param {Actor} actor - The actor
         * @param {string} itemUuid - Item UUID
         * @param {string} slotId - Slot ID (main/off)
         */
        async equipWeapon(actor, itemUuid, slotId) {
            const item = await fromUuid(itemUuid);
            if (!item) return;

            await item.update({ 'system.statuses.equipped': true });
        }

        /**
         * Unequip a weapon from a slot
         * @param {Actor} actor - The actor
         * @param {string} itemUuid - Item UUID
         */
        async unequipWeapon(actor, itemUuid) {
            const item = await fromUuid(itemUuid);
            if (!item) return;

            await item.update({ 'system.statuses.equipped': false });
        }
    };
}

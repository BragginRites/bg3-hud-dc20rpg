import { resolveUseTokenImage } from '/modules/bg3-hud-core/scripts/utils/portraitImage.js';

const MODULE_ID = 'bg3-hud-dc20rpg';

/**
 * Create the Dc20PortraitContainer class
 * Extends the core PortraitContainer with DC20-specific functionality
 */
export async function createDc20PortraitContainer() {
    const { PortraitContainer } = await import('/modules/bg3-hud-core/scripts/components/containers/PortraitContainer.js');

    return class Dc20PortraitContainer extends PortraitContainer {
        /**
         * Resolve whether this actor should use token art.
         * Actor flags override the client default setting.
         * @returns {boolean}
         */
        _useTokenImage() {
            return resolveUseTokenImage(this.actor, MODULE_ID);
        }

        /**
         * Get portrait image URL.
         * @returns {string} Image URL
         */
        getPortraitImage() {
            const useTokenImage = this._useTokenImage();

            if (useTokenImage) {
                return this.token?.document?.texture?.src || this.actor?.img || '';
            } else {
                return this.actor?.img || this.token?.document?.texture?.src || '';
            }
        }

    };
}

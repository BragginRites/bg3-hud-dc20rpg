import { createLogger } from '/modules/bg3-hud-core/scripts/utils/logger.js';
import { resolveUseTokenImage } from '/modules/bg3-hud-core/scripts/utils/portraitImage.js';

const MODULE_ID = 'bg3-hud-dc20rpg';
const log = createLogger('bg3-hud-dc20rpg');

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

        /**
         * Render the DC20 portrait container.
         * @returns {Promise<HTMLElement>}
         */
        async render() {
            this.element = this.createElement('div', ['bg3-portrait-container']);

            if (!this.token || !this.actor) {
                log.warn('Dc20PortraitContainer: No token or actor provided');
                return this.element;
            }

            if (this.infoContainer) {
                try {
                    const infoElement = await this.infoContainer.render();
                    this.element.appendChild(infoElement);
                } catch (error) {
                    log.warn('Dc20PortraitContainer: Failed to render info container', error);
                }
            }

            const imageContainer = this.createElement('div', ['portrait-image-container']);
            const imageSubContainer = this.createElement('div', ['portrait-image-subcontainer']);
            const imageSrc = this.getPortraitImage();
            const mediaElement = this._createMediaElement(imageSrc, this.actor?.name || 'Portrait');

            imageSubContainer.appendChild(mediaElement);
            imageContainer.appendChild(imageSubContainer);

            await this._renderPortraitData(imageContainer);

            this.element.appendChild(imageContainer);
            this._applyPortraitScale(imageSubContainer);
            this._registerPortraitMenu(imageContainer);

            return this.element;
        }
    };
}

const MODULE_ID = 'bg3-hud-dc20rpg';

/**
 * Render DC20-specific tooltip content
 * @param {Object} data - Cell/item data
 * @returns {Promise<string>} HTML content for tooltip
 */
export async function renderDc20Tooltip(data) {
    if (!data?.uuid) return '';

    const item = await fromUuid(data.uuid);
    if (!item) return '';

    const system = item.system || {};
    const parts = [];

    // Header
    parts.push(`<div class="dc20-tooltip-header">`);
    parts.push(`<img src="${item.img}" alt="${item.name}" class="dc20-tooltip-icon">`);
    parts.push(`<div class="dc20-tooltip-title">`);
    parts.push(`<h3>${item.name}</h3>`);
    if (system.tableName) {
        parts.push(`<span class="dc20-tooltip-type">${system.tableName}</span>`);
    }
    parts.push(`</div></div>`);

    // Action info
    const actionInfo = [];
    if (system.actionType) {
        actionInfo.push(`<span class="dc20-action-type">${_localizeActionType(system.actionType)}</span>`);
    }
    if (system.costs) {
        const costs = _formatCosts(system.costs);
        if (costs) actionInfo.push(costs);
    }
    if (actionInfo.length > 0) {
        parts.push(`<div class="dc20-tooltip-action">${actionInfo.join(' • ')}</div>`);
    }

    // Range & Duration
    const rangeInfo = [];
    if (system.range) {
        const range = _formatRange(system.range);
        if (range) rangeInfo.push(`<span><i class="fas fa-ruler"></i> ${range}</span>`);
    }
    if (system.duration?.type) {
        const duration = _formatDuration(system.duration);
        if (duration) rangeInfo.push(`<span><i class="fas fa-clock"></i> ${duration}</span>`);
    }
    if (rangeInfo.length > 0) {
        parts.push(`<div class="dc20-tooltip-range">${rangeInfo.join(' ')}</div>`);
    }

    // Target info
    if (system.target?.type) {
        const target = _formatTarget(system.target);
        if (target) {
            parts.push(`<div class="dc20-tooltip-target"><i class="fas fa-bullseye"></i> ${target}</div>`);
        }
    }

    // Damage formulas
    if (system.formulas) {
        const formulas = _formatFormulas(system.formulas);
        if (formulas) {
            parts.push(`<div class="dc20-tooltip-damage">${formulas}</div>`);
        }
    }

    // Description
    if (system.description) {
        const enriched = await TextEditor.enrichHTML(system.description, { async: true });
        parts.push(`<div class="dc20-tooltip-description">${enriched}</div>`);
    }

    // Uses
    if (system.costs?.charges) {
        const charges = system.costs.charges;
        const current = charges.current ?? charges.value ?? 0;
        const max = charges.max ?? 0;
        if (max > 0) {
            parts.push(`<div class="dc20-tooltip-uses"><i class="fas fa-sync"></i> ${current}/${max} uses</div>`);
        }
    }

    return `<div class="dc20-tooltip">${parts.join('')}</div>`;
}

/**
 * Localize action type
 * @param {string} actionType - Action type key
 * @returns {string} Localized label
 */
function _localizeActionType(actionType) {
    const labels = {
        'attack': 'Attack',
        'spell': 'Spell',
        'reaction': 'Reaction',
        'free': 'Free Action',
        '': 'Passive'
    };
    return labels[actionType] || actionType;
}

/**
 * Format costs display
 * @param {Object} costs - Costs object
 * @returns {string} Formatted costs
 */
function _formatCosts(costs) {
    const parts = [];

    if (costs.ap?.value) {
        parts.push(`${costs.ap.value} AP`);
    }
    if (costs.stamina?.value) {
        parts.push(`${costs.stamina.value} Stamina`);
    }
    if (costs.mana?.value) {
        parts.push(`${costs.mana.value} Mana`);
    }
    if (costs.health?.value) {
        parts.push(`${costs.health.value} HP`);
    }

    return parts.join(', ');
}

/**
 * Format range display
 * @param {Object} range - Range object
 * @returns {string} Formatted range
 */
function _formatRange(range) {
    if (range.normal) {
        if (range.max && range.max !== range.normal) {
            return `${range.normal}/${range.max} ${range.unit || 'spaces'}`;
        }
        return `${range.normal} ${range.unit || 'spaces'}`;
    }
    if (range.melee) {
        return `Melee (${range.melee})`;
    }
    return '';
}

/**
 * Format duration display
 * @param {Object} duration - Duration object
 * @returns {string} Formatted duration
 */
function _formatDuration(duration) {
    if (duration.type === 'instantaneous') return 'Instantaneous';
    if (duration.type === 'sustain') return 'Sustained';
    if (duration.value && duration.timeUnit) {
        return `${duration.value} ${duration.timeUnit}`;
    }
    return duration.type || '';
}

/**
 * Format target display
 * @param {Object} target - Target object
 * @returns {string} Formatted target
 */
function _formatTarget(target) {
    const parts = [];
    if (target.count) parts.push(target.count);
    if (target.type) parts.push(target.type);
    return parts.join(' ');
}

/**
 * Format damage formulas
 * @param {Object} formulas - Formulas object
 * @returns {string} Formatted formulas HTML
 */
function _formatFormulas(formulas) {
    const parts = [];

    for (const [key, formula] of Object.entries(formulas)) {
        if (formula.category === 'damage' && formula.formula) {
            const typeLabel = formula.type || 'damage';
            parts.push(`<span class="dc20-damage-formula">${formula.formula} ${typeLabel}</span>`);
        } else if (formula.category === 'healing' && formula.formula) {
            parts.push(`<span class="dc20-healing-formula">${formula.formula} healing</span>`);
        }
    }

    return parts.join(' + ');
}

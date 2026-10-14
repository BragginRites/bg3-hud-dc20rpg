import { register } from 'node:module';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Dc20FilterContainer.js imports its base class from a Foundry-absolute
// module path that only resolves inside a running Foundry server. Register
// a stub loader (see testFoundryCoreStub.mjs) before importing the module
// under test so this file can load under bare `node --test`.
register(new URL('./testFoundryCoreStub.mjs', import.meta.url));

const { Dc20FilterContainer } = await import('../components/containers/Dc20FilterContainer.js');

describe('Dc20FilterContainer.matchesFilter', () => {
    const container = new Dc20FilterContainer();

    it('returns false when filter or cell is missing', () => {
        const cell = { dataset: { actionType: 'attack' } };
        assert.equal(container.matchesFilter(null, cell), false);
        assert.equal(container.matchesFilter({ data: { actionType: 'attack' } }, null), false);
    });

    it('matches action-type filters against cell.dataset.actionType', () => {
        const filter = { data: { actionType: 'attack' } };
        assert.equal(container.matchesFilter(filter, { dataset: { actionType: 'attack' } }), true);
        assert.equal(container.matchesFilter(filter, { dataset: { actionType: 'spell' } }), false);
    });

    it('matches item-type filters against cell.dataset.itemType', () => {
        const filter = { data: { itemType: 'weapon' } };
        assert.equal(container.matchesFilter(filter, { dataset: { itemType: 'weapon' } }), true);
        assert.equal(container.matchesFilter(filter, { dataset: { itemType: 'consumable' } }), false);
    });

    it('returns false when the filter data has neither actionType nor itemType', () => {
        const filter = { data: {} };
        assert.equal(container.matchesFilter(filter, { dataset: { itemType: 'weapon' } }), false);
    });
});

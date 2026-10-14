import { register } from 'node:module';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Dc20AutoPopulate.js imports its base class from a Foundry-absolute module
// path that only resolves inside a running Foundry server. Register a
// stub loader (see testFoundryCoreStub.mjs) before importing the module
// under test so this file can load under bare `node --test`.
register(new URL('./testFoundryCoreStub.mjs', import.meta.url));

const { Dc20AutoPopulate } = await import('./Dc20AutoPopulate.js');

describe('Dc20AutoPopulate._matchesType', () => {
    const populate = new Dc20AutoPopulate();

    it('matches a direct type against the selected types', () => {
        const item = { type: 'weapon' };
        assert.equal(populate._matchesType(item, ['weapon', 'spell']), true);
    });

    it('does not match a type absent from the selected types', () => {
        const item = { type: 'feature' };
        assert.equal(populate._matchesType(item, ['weapon', 'spell']), false);
    });

    it('matches a subtype selection (spell:cantrip) against item.system.spellType', () => {
        const item = { type: 'spell', system: { spellType: 'cantrip' } };
        assert.equal(populate._matchesType(item, ['spell:cantrip']), true);
    });

    it('does not match a subtype selection when the item subtype differs', () => {
        const item = { type: 'spell', system: { spellType: 'ritual' } };
        assert.equal(populate._matchesType(item, ['spell:cantrip']), false);
    });

    it('matches a consumable subtype directly against item.system.consumableType', () => {
        const item = { type: 'consumable', system: { consumableType: 'potion' } };
        assert.equal(populate._matchesType(item, ['consumable:potion']), true);
    });

    it('returns false when selectedTypes is empty', () => {
        assert.equal(populate._matchesType({ type: 'weapon' }, []), false);
    });
});

describe('Dc20AutoPopulate.getMatchingItems', () => {
    const populate = new Dc20AutoPopulate();

    it('returns matching items as {uuid} entries, filtered by DC20_USABLE_ITEM_TYPES', async () => {
        const actor = {
            items: [
                { uuid: 'uuid-weapon', type: 'weapon' },
                // Not in DC20_USABLE_ITEM_TYPES, must be skipped even though it would
                // otherwise be a direct type match.
                { uuid: 'uuid-race', type: 'race' }
            ]
        };
        const result = await populate.getMatchingItems(actor, ['weapon', 'race']);
        assert.deepEqual(result, [{ uuid: 'uuid-weapon' }]);
    });

    it('skips usable item types that do not match the selected types', async () => {
        const actor = {
            items: [
                { uuid: 'uuid-weapon', type: 'weapon' },
                { uuid: 'uuid-feature', type: 'feature' }
            ]
        };
        const result = await populate.getMatchingItems(actor, ['weapon']);
        assert.deepEqual(result, [{ uuid: 'uuid-weapon' }]);
    });

    it('skips items with system.usable === false even if the type matches', async () => {
        const actor = {
            items: [
                { uuid: 'uuid-usable', type: 'consumable', system: { usable: true } },
                { uuid: 'uuid-unusable', type: 'consumable', system: { usable: false } },
                // Absent `usable` flag defaults to usable (strict false check only).
                { uuid: 'uuid-undefined-usable', type: 'consumable', system: {} }
            ]
        };
        const result = await populate.getMatchingItems(actor, ['consumable']);
        assert.deepEqual(result, [{ uuid: 'uuid-usable' }, { uuid: 'uuid-undefined-usable' }]);
    });

    it('returns an empty array when the actor has no matching items', async () => {
        const actor = { items: [{ uuid: 'uuid-weapon', type: 'weapon' }] };
        const result = await populate.getMatchingItems(actor, ['spell']);
        assert.deepEqual(result, []);
    });
});

import { register } from 'node:module';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// Dc20AutoSort.js imports its base class from a Foundry-absolute module
// path that only resolves inside a running Foundry server. Register a
// stub loader (see testFoundryCoreStub.mjs) before importing the module
// under test so this file can load under bare `node --test`.
register(new URL('./testFoundryCoreStub.mjs', import.meta.url));

const { Dc20AutoSort } = await import('./Dc20AutoSort.js');

describe('Dc20AutoSort._getTypeOrder', () => {
    const sort = new Dc20AutoSort();

    it('orders known item types: weapon, basicAction, technique, spell, infusion, feature, consumable, equipment', () => {
        assert.equal(sort._getTypeOrder({ itemData: { itemType: 'weapon' } }), 0);
        assert.equal(sort._getTypeOrder({ itemData: { itemType: 'basicAction' } }), 1);
        assert.equal(sort._getTypeOrder({ itemData: { itemType: 'technique' } }), 2);
        assert.equal(sort._getTypeOrder({ itemData: { itemType: 'spell' } }), 3);
        assert.equal(sort._getTypeOrder({ itemData: { itemType: 'infusion' } }), 4);
        assert.equal(sort._getTypeOrder({ itemData: { itemType: 'feature' } }), 5);
        assert.equal(sort._getTypeOrder({ itemData: { itemType: 'consumable' } }), 6);
        assert.equal(sort._getTypeOrder({ itemData: { itemType: 'equipment' } }), 7);
    });

    it('falls back to cellData.type when itemData.itemType is absent', () => {
        assert.equal(sort._getTypeOrder({ type: 'weapon' }), 0);
        assert.equal(sort._getTypeOrder({ type: 'feature' }), 5);
    });

    it('sorts unknown or missing types last', () => {
        assert.equal(sort._getTypeOrder({ itemData: { itemType: 'something-else' } }), 99);
        assert.equal(sort._getTypeOrder({}), 99);
    });
});

describe('Dc20AutoSort._getSpellTypeOrder', () => {
    const sort = new Dc20AutoSort();

    it('orders cantrip, spell, ritual', () => {
        assert.equal(sort._getSpellTypeOrder('cantrip'), 0);
        assert.equal(sort._getSpellTypeOrder('spell'), 1);
        assert.equal(sort._getSpellTypeOrder('ritual'), 2);
    });

    it('sorts unknown or missing spell types last', () => {
        assert.equal(sort._getSpellTypeOrder('unknown-spell-type'), 99);
        assert.equal(sort._getSpellTypeOrder(undefined), 99);
    });
});

describe('Dc20AutoSort.sortItems', () => {
    const sort = new Dc20AutoSort();

    it('orders items primarily by item type', () => {
        const items = [
            { name: 'Zed', itemData: { itemType: 'consumable' } },
            { name: 'Alpha', itemData: { itemType: 'weapon' } },
            { name: 'Beta', itemData: { itemType: 'feature' } }
        ];
        const result = sort.sortItems(items).map((item) => item.name);
        assert.deepEqual(result, ['Alpha', 'Beta', 'Zed']);
    });

    it('secondary-sorts spells by spell type (cantrip, spell, ritual)', () => {
        const items = [
            { name: 'Fireball', itemData: { itemType: 'spell', spellType: 'ritual' } },
            { name: 'Prestidigitation', itemData: { itemType: 'spell', spellType: 'cantrip' } },
            { name: 'Magic Missile', itemData: { itemType: 'spell', spellType: 'spell' } }
        ];
        const result = sort.sortItems(items).map((item) => item.name);
        assert.deepEqual(result, ['Prestidigitation', 'Magic Missile', 'Fireball']);
    });

    it('falls back to alphabetical order when type order and spell order are equal', () => {
        const items = [
            { name: 'Zed', itemData: { itemType: 'weapon' } },
            { name: 'Alpha', itemData: { itemType: 'weapon' } },
            { name: 'Mid', itemData: { itemType: 'weapon' } }
        ];
        const result = sort.sortItems(items).map((item) => item.name);
        assert.deepEqual(result, ['Alpha', 'Mid', 'Zed']);
    });

    it('treats a missing name as an empty string for the alphabetical fallback', () => {
        const items = [
            { name: 'Alpha', itemData: { itemType: 'weapon' } },
            { itemData: { itemType: 'weapon' } }
        ];
        const result = sort.sortItems(items).map((item) => item.name || '');
        assert.deepEqual(result, ['', 'Alpha']);
    });
});

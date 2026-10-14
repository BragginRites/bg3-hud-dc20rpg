/**
 * Node ESM loader hook used only by this repo's test suite (see
 * Dc20AutoSort.test.js / Dc20AutoPopulate.test.js).
 *
 * The DC20 adapter classes import their base framework classes from the
 * sibling bg3-hud-core module via a Foundry-VTT-absolute module path, e.g.:
 *   import { AutoSortFramework } from '/modules/bg3-hud-core/scripts/features/AutoSortFramework.js';
 *
 * That path is only resolvable by a running Foundry server (which rewrites
 * "/modules/<id>/..." to the installed module's files); it does not exist on
 * disk, so bare `node --test` can't import the adapter files directly.
 *
 * This hook intercepts just that one specifier prefix and substitutes bare,
 * no-op base classes. That is safe for the methods under test here
 * (`_getTypeOrder`, `_getSpellTypeOrder`, `_matchesType`, `sortItems`,
 * `getMatchingItems`, `matchesFilter`) because they are pure - they don't
 * call `this.<frameworkMethod>()` and don't touch Foundry globals - so the
 * adapter subclass only needs *some* constructable base class to extend,
 * not the real framework behavior.
 */
export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('/modules/bg3-hud-core/')) {
        return { url: `foundry-core-stub:${specifier}`, shortCircuit: true };
    }
    return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
    if (url.startsWith('foundry-core-stub:')) {
        return {
            format: 'module',
            shortCircuit: true,
            source: `
                export class AutoSortFramework {}
                export class AutoPopulateFramework {}
                export class FilterContainer {}
            `
        };
    }
    return nextLoad(url, context);
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOfHint = exports.validateHint = void 0;
const hint_1 = require("../hint");
const utils_1 = require("../utils");
const validateHint = (data, hint, options = {}) => {
    const results = [];
    // prettier-ignore
    const check = (data, hint, crumbs) => {
        const toResult = (x, crumbs) => {
            const r = ({ matches: x, crumbs });
            results.push(r);
            return r;
        };
        // prettier-ignore
        switch (hint.type) {
            case 'string': return toResult(typeof data === 'string', [...crumbs]);
            case 'number': return toResult(typeof data === 'number', [...crumbs]);
            case 'boolean': return toResult(typeof data === 'boolean', [...crumbs]);
            case 'undefined': return toResult(typeof data === 'undefined', [...crumbs]);
            case 'null': return toResult(typeof data === null, [...crumbs]);
            case 'literal-string': return toResult(data === hint.value, [...crumbs]);
            case 'literal-number': return toResult(data === hint.value, [...crumbs]);
            case 'array':
                {
                    if (!Array.isArray(data))
                        return toResult(false, [...crumbs]);
                    return toResult(data.every((x, i) => check(x, hint.of, [...crumbs, i]).matches), [...crumbs]);
                }
                ;
            // prettier-ignore
            case 'record':
                {
                    if (typeof data === 'undefined' || data === null)
                        return toResult(false, [...crumbs]);
                    if (typeof data !== 'object')
                        return toResult(false, [...crumbs]);
                    const keys = Object.keys(data);
                    const values = Object.values(data);
                    return toResult(keys.every((x, i) => check(x, hint.key, [...crumbs, i]).matches) && values.every((x, i) => check(x, hint.value, [...crumbs, i]).matches), [...crumbs]);
                }
                ;
            // prettier-ignore
            case 'mapping':
                {
                    if (typeof data === 'undefined' || data === null)
                        return toResult(false, [...crumbs]);
                    if (typeof data !== 'object')
                        return toResult(false, [...crumbs]);
                    for (const [key, value] of Object.entries(data)) {
                        const valueHint = hint.of[key];
                        if (!valueHint && !options.allowExtraProperties)
                            return toResult(false, [...crumbs, key]);
                        if (!valueHint)
                            continue;
                        if (!check(value, valueHint, [...crumbs, key]))
                            return toResult(false, [...crumbs, key]);
                    }
                    for (const [key, valueHint] of Object.entries(hint.of)) {
                        const isOpt = hint_1.hints.util.isOptional(valueHint);
                        if (!isOpt && !(key in data))
                            return toResult(false, [...crumbs, key]);
                        if (isOpt && !(key in data))
                            continue;
                        if (!check(data[key], valueHint, [...crumbs, key]))
                            toResult(false, [...crumbs, key]);
                    }
                    return toResult(true, [...crumbs]);
                }
                ;
            // prettier-ignore
            case 'union':
                {
                    return toResult(hint.of.some((x, i) => check(data, x, [...crumbs, i]).matches), [...crumbs]);
                }
                ;
            // prettier-ignore
            case 'unknown': return toResult(true, [...crumbs]);
        }
    };
    const root = check(data, hint, []);
    return {
        ...root,
        matches: root.matches && results.every((x) => x.matches),
        stack: (0, utils_1.uniqueBy)(results.toSorted((a, b) => Number(a.matches) - Number(b.matches)), (x) => x.crumbs.toSorted().join("-")),
    };
};
exports.validateHint = validateHint;
const isOfHint = (x, hint) => (0, exports.validateHint)(x, hint).matches;
exports.isOfHint = isOfHint;
//# sourceMappingURL=validate.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traverseHint = void 0;
const traverseHint = (hint, fn) => {
    const traverse = (hint, crumbs) => {
        fn(hint, () => {
            switch (hint.type) {
                case "array": {
                    traverse(hint.of, [...crumbs]);
                    return;
                }
                case "mapping": {
                    Object.entries(hint.of).forEach(([k, v]) => {
                        traverse(v, [...crumbs, k]);
                    });
                    return;
                }
                case "union": {
                    hint.of.forEach((x, i) => traverse(x, [...crumbs, i]));
                    return;
                }
                case "record": {
                    traverse(hint.key, [...crumbs]);
                    traverse(hint.value, [...crumbs]);
                    return;
                }
            }
        }, crumbs);
    };
    return traverse(hint, []);
};
exports.traverseHint = traverseHint;
//# sourceMappingURL=traverse.js.map
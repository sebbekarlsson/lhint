"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypescriptTemplateTransformer = void 0;
const hint_1 = require("../../hint");
const utils_1 = require("../../utils");
exports.TypescriptTemplateTransformer = {
    transform: (x) => {
        const transform = (x, padding, depth) => {
            switch (x.type) {
                case "string":
                    return "string";
                case "number":
                    return "number";
                case "boolean":
                    return "boolean";
                case "null":
                    return "null";
                case "undefined":
                    return "undefined";
                case "unknown":
                    return "unknown";
                case "array":
                    return `Array<${transform(x.of, 0, 0)}>`;
                case "literal-number":
                    return `${x.value}`;
                case "literal-string":
                    return `"${x.value}"`;
                case "union":
                    return x.of.map((it) => transform(it, 0, 0)).join(" | ");
                case "record":
                    return `Record<${transform(x.key, 0, 0)}, ${transform(x.value, 0, 0)}>`;
                case "mapping":
                    return [
                        `${(0, utils_1.mkPad)(depth <= 1 ? 0 : padding)}{\n`,
                        Object.entries(x.of)
                            .map(([k, v]) => {
                            const isOpt = hint_1.hints.util.isOptional(v);
                            return `${(0, utils_1.mkPad)(padding + 2)}${k}${isOpt ? "?" : ""}: ${transform(v, padding + 2, depth + 1)}`;
                        })
                            .join(";\n"),
                        `\n${(0, utils_1.mkPad)(padding)}}`,
                    ].join("");
            }
        };
        return transform(x, 0, 0);
    },
};
//# sourceMappingURL=transformer.js.map
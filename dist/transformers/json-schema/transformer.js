"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSONSchemaTransformer = void 0;
const hint_1 = require("../../hint");
exports.JSONSchemaTransformer = {
    transform: (hint) => {
        const errorNotSupported = (hint) => new Error(`Transforming ${hint.type} is not supported`);
        const transform = (hint) => {
            switch (hint.type) {
                case "number":
                    return { type: "number" };
                case "date":
                    return { type: "string", format: "date" };
                case "string":
                    return { type: "string" };
                case "boolean":
                    return { type: "boolean" };
                case "unknown":
                    throw errorNotSupported(hint);
                case "null":
                    return { type: "null" };
                case "undefined":
                    throw errorNotSupported(hint);
                case "union":
                    return { type: "anyOf", anyOf: hint.of.map((x) => transform(x)) };
                case "array":
                    return { type: "array", items: transform(hint.of) };
                case "literal-number":
                    return { type: "const", const: hint.value };
                case "literal-string":
                    return { type: "const", const: hint.value };
                case "mapping": {
                    const entries = Object.entries(hint.of).map(([k, v]) => ({
                        name: k,
                        hint: v,
                    }));
                    const required = entries.filter((it) => !hint_1.hints.util.isOptional(it.hint));
                    return {
                        type: "object",
                        properties: Object.fromEntries(Object.entries(hint.of).map(([k, v]) => [k, transform(v)])),
                        required: required.map((it) => it.name),
                    };
                }
                // Can't do anything else here
                case "record":
                    return {
                        type: "object",
                        properties: {},
                        additionalProperties: true,
                    };
            }
        };
        return transform(hint);
    },
};
//# sourceMappingURL=transformer.js.map
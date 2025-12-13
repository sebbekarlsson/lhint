"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hints = void 0;
const utils_1 = require("./utils");
var hints;
(function (hints) {
    hints.asHint = (x) => {
        return {
            ...x,
            _hint: true,
        };
    };
    hints.array = (of) => {
        return hints.asHint({
            type: "array",
            of: of,
        });
    };
    hints.union = (of) => {
        return hints.asHint({
            type: "union",
            of: (0, utils_1.uniqueBy)(of, (x) => JSON.stringify(x)),
        });
    };
    hints.optional = (x) => {
        return {
            ...x,
            _meta: {
                ...(x._meta || {}),
                optional: true,
            },
        };
    };
    hints.setOptional = (x, opt) => {
        if (typeof opt === "undefined")
            return x;
        return {
            ...x,
            _meta: {
                ...(x._meta || {}),
                optional: opt,
            },
        };
    };
    hints.string = () => hints.asHint({ type: "string" });
    hints.number = () => hints.asHint({ type: "number" });
    hints.undef = () => hints.asHint({ type: "undefined" });
    hints.nil = () => hints.asHint({ type: "null" });
    hints.boolean = () => hints.asHint({ type: "boolean" });
    function literal(x) {
        if (typeof x === "string")
            return hints.asHint({ type: "literal-string", value: x });
        return hints.asHint({ type: "literal-number", value: x });
    }
    hints.literal = literal;
    hints.mapping = (of) => {
        return hints.asHint({
            type: "mapping",
            of: of,
        });
    };
    hints.record = (key, value) => {
        return hints.asHint({
            type: "record",
            key,
            value,
        });
    };
    hints.notKnown = () => hints.asHint({
        type: "unknown",
    });
    let util;
    (function (util) {
        util.toHumanReadable = (x) => {
            const transform = (x, padding) => {
                switch (x.type) {
                    case "literal-string":
                        return `"${x.value}"`;
                    case "literal-number":
                        return `${x.value}`;
                    case "boolean":
                        return `true or false`;
                    case "null":
                        return "null";
                    case "number":
                        return "number";
                    case "string":
                        return "string / text";
                    case "undefined":
                        return "undefined / empty";
                    case "unknown":
                        return "unknown";
                    case "mapping": {
                        return [
                            `(\n`,
                            Object.entries(x.of)
                                .map(([key, value], _i, arr) => {
                                return `${(0, utils_1.mkPad)(arr.length <= 1 ? 0 : padding + 2)}${key}: ${transform(value, padding + 2)}`;
                            })
                                .join(",\n"),
                            `\n${(0, utils_1.mkPad)(padding)})`,
                        ].join("");
                    }
                    case "record":
                        return `a dictionary where the key is ${transform(x.key, 0)} and the value is ${transform(x.value, 0)}`;
                    case "array":
                        return `array of ${transform(x.of, 0)}`;
                    case "union":
                        return [`any of`, x.of.map((u) => transform(u, 0)).join(", ")].join(" ");
                }
            };
            return transform(x, 0);
        };
        util.isHint = (x) => {
            if (typeof x === "undefined" || x === null)
                return false;
            if (typeof x !== "object")
                return false;
            return x._hint === true;
        };
        util.isSame = (a, b) => {
            if (a.type !== b.type)
                return false;
            if (a.type === "array" && b.type === "array")
                return util.isSame(a.of, b.of);
            if (a.type === "union" && b.type === "union") {
                if (a.of.length != b.of.length)
                    return false;
                const x = a.of.toSorted((xa, xb) => xa.type.localeCompare(xb.type));
                const y = b.of.toSorted((xa, xb) => xa.type.localeCompare(xb.type));
                return (0, utils_1.zipMin)(x, y).every(([z, w]) => util.isSame(z, w));
            }
            if (a.type === "mapping" && b.type === "mapping") {
                const keysA = Object.keys(a.of).toSorted();
                const keysB = Object.keys(b.of).toSorted();
                if (keysA.length !== keysB.length)
                    return false;
                return (0, utils_1.zipMin)(keysA, keysB).every(([z, w]) => {
                    return z === w && a.of[z] && b.of[w] && util.isSame(a.of[z], b.of[w]);
                });
            }
            if (a.type === "record" && b.type === "record") {
                return util.isSame(a.key, b.key) && util.isSame(a.value, b.value);
            }
            return JSON.stringify(a) === JSON.stringify(b);
        };
        util.isExtending = (target, check) => {
            return target.type === check.type;
        };
        util.isNullable = (x) => {
            if (x.type === "null")
                return true;
            if (x.type === "union")
                return !!x.of.find((it) => it.type === "null");
            return false;
        };
        util.isOptional = (x) => {
            if (x._meta?.optional)
                return true;
            if (x.type === "undefined")
                return true;
            if (x.type === "union")
                return !!x.of.find((it) => it.type === "undefined");
            return false;
        };
        function merge(x) {
            if (Array.isArray(x)) {
                if (x.length <= 0)
                    return hints.notKnown();
                if (x.length === 1)
                    return merge(x[0]);
                return hints.union(x);
            }
            switch (x.type) {
                case "union": {
                    if (x.of.length === 1)
                        return merge(x.of[0]);
                    return x;
                }
                case "array":
                    return {
                        ...x,
                        of: merge(x.of),
                    };
                case "mapping":
                    return {
                        ...x,
                        of: Object.fromEntries(Object.entries(x.of).map(([k, v]) => [k, merge(v)])),
                    };
            }
            return x;
        }
        util.merge = merge;
        /**
           @brief Turns `hint` into a more simple version if possible.
         */
        util.refine = (hint) => {
            switch (hint.type) {
                case "array":
                    return { ...hint, of: util.refine(hint.of) };
                case "mapping": {
                    return {
                        ...hint,
                        of: Object.fromEntries(Object.entries(hint.of).map(([k, v]) => [k, util.refine(v)])),
                    };
                }
                case "union": {
                    const ofs = hint.of;
                    if (ofs.every((x) => x.type === "mapping")) {
                        const allKeys = (0, utils_1.unique)(ofs.map((x) => Object.keys(x.of)).flat());
                        const allHints = Object.assign({}, ...allKeys.map((k) => ({ [k]: ofs.map((x) => x.of[k]) })));
                        const keyHints = allKeys.map((k) => {
                            const hts = allHints[k];
                            const isOpt = hts.includes(undefined);
                            const variants = hts.filter((x) => typeof x !== "undefined");
                            const un = util.merge(hints.union(variants));
                            if (isOpt)
                                return { [k]: hints.optional(un) };
                            return { [k]: un };
                        });
                        const obj = Object.assign({}, ...keyHints);
                        return hints.setOptional(util.refine(hints.mapping(obj)), hint._meta?.optional);
                    }
                    return hint;
                }
                default:
                    return hint;
            }
        };
        /**
         * @brief Automatically infer Hint from `x`, without any refinements.
         */
        util.toHint = (x) => {
            if (util.isHint(x))
                return x;
            if (typeof x === "number")
                return hints.number();
            if (typeof x === "string")
                return hints.string();
            if (typeof x === "boolean")
                return hints.boolean();
            if (typeof x === "undefined")
                return hints.undef();
            if (x === null)
                return hints.nil();
            if (Array.isArray(x)) {
                if (x.every(util.isHint)) {
                    return util.merge(x);
                }
                return hints.array(hints.union(x.map((v) => util.toHint(v))));
            }
            if (typeof x === "object") {
                const obj = x;
                return hints.asHint({
                    type: "mapping",
                    of: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, util.toHint(v)])),
                });
            }
            return hints.notKnown();
        };
    })(util = hints.util || (hints.util = {}));
    /**
     * @brief Automatically infer Hint from `x`, with refinements.
     */
    hints.auto = (x) => {
        let y = util.toHint(x);
        y = util.refine(y);
        return y;
    };
})(hints || (exports.hints = hints = {}));
//const x = hints.record(hints.literal('hello'), hints.number());
//const y = hints.mapping({ x: hints.number(), y: hints.number() });
////
//const w: Unhint<typeof y>
//# sourceMappingURL=hint.js.map
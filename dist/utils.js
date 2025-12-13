"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPlainObject = exports.mkPad = exports.range = exports.groupBy = exports.zipMax = exports.zipMin = exports.unique = exports.uniqueBy = void 0;
const uniqueBy = (arr, key) => {
    const seen = new Set();
    return arr.filter((x) => {
        const k = key(x);
        if (seen.has(k))
            return false;
        seen.add(k);
        return true;
    });
};
exports.uniqueBy = uniqueBy;
const unique = (arr) => Array.from(new Set(arr).values());
exports.unique = unique;
const zipMin = (firstCollection, lastCollection) => {
    const length = Math.min(firstCollection.length, lastCollection.length);
    const zipped = [];
    for (let index = 0; index < length; index++) {
        zipped.push([firstCollection[index], lastCollection[index]]);
    }
    return zipped;
};
exports.zipMin = zipMin;
const zipMax = (firstCollection, lastCollection) => {
    const length = Math.max(firstCollection.length, lastCollection.length);
    const zipped = [];
    for (let index = 0; index < length; index++) {
        zipped.push([firstCollection[index], lastCollection[index]]);
    }
    return zipped;
};
exports.zipMax = zipMax;
const groupBy = (items, key) => {
    const obj = {};
    for (const item of items) {
        const k = key(item);
        const list = obj[k] || [];
        list.push(item);
        obj[k] = list;
    }
    return obj;
};
exports.groupBy = groupBy;
const range = (n) => n <= 0 ? [] : Array.from(Array(n).keys());
exports.range = range;
const mkPad = (n, p = " ") => n <= 0
    ? ""
    : (0, exports.range)(n)
        .map(() => p)
        .join("");
exports.mkPad = mkPad;
const isPlainObject = (x) => x !== null &&
    typeof x === "object" &&
    Object.getPrototypeOf(x) === Object.prototype;
exports.isPlainObject = isPlainObject;
//# sourceMappingURL=utils.js.map
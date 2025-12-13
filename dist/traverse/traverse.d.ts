import { Hint } from "../hint";
export type HintTraverseFn = (hint: Hint, next: () => void, crumbs: PropertyKey[]) => void;
export declare const traverseHint: <T extends Hint>(hint: T, fn: HintTraverseFn) => void;
//# sourceMappingURL=traverse.d.ts.map
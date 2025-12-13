export declare const uniqueBy: <T extends Array<unknown>>(arr: T, key: (item: T[number]) => PropertyKey) => T;
export declare const unique: <T>(arr: T[]) => T[];
export declare const zipMin: <S1, S2>(firstCollection: Array<S1>, lastCollection: Array<S2>) => Array<[S1, S2]>;
export declare const zipMax: <S1, S2>(firstCollection: Array<S1>, lastCollection: Array<S2>) => Array<[S1 | undefined, S2 | undefined]>;
export type GetKey<T, K extends PropertyKey = PropertyKey> = (item: T) => K;
export declare const groupBy: <Get extends GetKey<any>, T = Get extends GetKey<infer X> ? X : any, Key = Get extends GetKey<T, infer K> ? K : PropertyKey, Result = Key extends PropertyKey ? Record<Key, T[]> : Record<PropertyKey, unknown[]>>(items: T[], key: Get) => Result;
export declare const range: (n: number) => number[];
export declare const mkPad: (n: number, p?: string) => string;
export declare const isPlainObject: (x: unknown) => x is Record<PropertyKey, unknown>;
//# sourceMappingURL=utils.d.ts.map
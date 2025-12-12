export type ToUnion<T> = T extends Array<any> ? T[number] : T;
export type Or<A, B> = A extends undefined ? B : A;
export type Distribute<T> = T extends T ? T : never;
export type Distributed<T, F> = F extends T ? F : never;
export type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};
//# sourceMappingURL=typeHelpers.d.ts.map
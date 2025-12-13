export type ToUnion<T> = T extends Array<any> ? T[number] : T;

export type Or<A, B> = A extends undefined ? B : A;

export type Distribute<T> = T extends T ? T : never;
export type Distributed<T, F> = F extends T ? F : never;

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type Tuple2<A = unknown, B = unknown> = [A, B];
export type Tuple3<A = unknown, B = unknown, C = unknown> = [A, B, C];

export type IfExtends<Thing, Conds extends Tuple2[]> = {
  [Prop in keyof Conds]: Thing extends Conds[Prop][0] ? Conds[Prop][1] : never;
}[keyof Conds];

export type DeUnion<A, B> = A & B extends infer G
  ? { [Prop in keyof G]: G[Prop] }
  : never;

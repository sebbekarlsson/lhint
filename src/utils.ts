export const uniqueBy = <T extends Array<unknown>>(
  arr: T,
  key: (item: T[number]) => PropertyKey,
): T => {
  const seen = new Set<PropertyKey>();
  return arr.filter((x) => {
    const k = key(x);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }) as T;
};

export const unique = <T>(arr: T[]): T[] => Array.from(new Set(arr).values());

export const zipMin = <S1, S2>(
  firstCollection: Array<S1>,
  lastCollection: Array<S2>,
): Array<[S1, S2]> => {
  const length = Math.min(firstCollection.length, lastCollection.length);
  const zipped: Array<[S1, S2]> = [];

  for (let index = 0; index < length; index++) {
    zipped.push([firstCollection[index]!, lastCollection[index]!]);
  }

  return zipped;
};

export const zipMax = <S1, S2>(
  firstCollection: Array<S1>,
  lastCollection: Array<S2>,
): Array<[S1 | undefined, S2 | undefined]> => {
  const length = Math.max(firstCollection.length, lastCollection.length);
  const zipped: Array<[S1 | undefined, S2 | undefined]> = [];

  for (let index = 0; index < length; index++) {
    zipped.push([firstCollection[index], lastCollection[index]]);
  }

  return zipped;
};

export type GetKey<T, K extends PropertyKey = PropertyKey> = (item: T) => K;
export const groupBy = <
  Get extends GetKey<any>,
  T = Get extends GetKey<infer X> ? X : any,
  Key = Get extends GetKey<T, infer K> ? K : PropertyKey,
  Result = Key extends PropertyKey
    ? Record<Key, T[]>
    : Record<PropertyKey, unknown[]>,
>(
  items: T[],
  key: Get,
): Result => {
  const obj: Result = {} as Result;

  for (const item of items) {
    const k = key(item);
    const list = (obj as unknown as Record<PropertyKey, T[]>)[k] || [];
    list.push(item);
    (obj as unknown as Record<PropertyKey, T[]>)[k] = list;
  }

  return obj;
};

export const range = (n: number): number[] =>
  n <= 0 ? [] : Array.from(Array(n).keys());

export const mkPad = (n: number, p: string = " "): string =>
  n <= 0
    ? ""
    : range(n)
        .map(() => p)
        .join("");

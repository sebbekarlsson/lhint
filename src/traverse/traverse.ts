import { Hint } from "../hint";

export type HintTraverseFn = (
  hint: Hint,
  next: () => void,
  crumbs: PropertyKey[],
) => void;

export const traverseHint = <T extends Hint>(
  hint: T,
  fn: HintTraverseFn,
): void => {
  const traverse = <T extends Hint>(hint: T, crumbs: PropertyKey[]): void => {
    fn(
      hint,
      () => {
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
      },
      crumbs,
    );
  };
  return traverse(hint, []);
};

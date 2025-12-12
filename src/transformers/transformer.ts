import { Hint } from "../hint";

export interface HintTransformer<T = unknown> {
  transform: (hint: Hint) => T;
}

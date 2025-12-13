import { ToUnion } from "./typeHelpers";
import { unique, uniqueBy, zipMin } from "./utils";

export type HintMeta<IsOptional extends boolean = boolean> = {
  optional?: IsOptional;
};

export type HintBase<T, Meta extends HintMeta = HintMeta> = T & {
  _meta?: Meta;
  _hint: true;
};

export type HintString = HintBase<{ type: "string" }>;
export type HintNumber = HintBase<{ type: "number" }>;
export type HintBoolean = HintBase<{ type: "boolean" }>;
export type HintUndefined = HintBase<{ type: "undefined" }>;
export type HintNull = HintBase<{ type: "null" }>;
export type HintUnknown = HintBase<{ type: "unknown" }>;
export type HintLiteralString<T extends string = string> = HintBase<{
  type: "literal-string";
  value: T;
}>;
export type HintLiteralNumber<T extends number = number> = HintBase<{
  type: "literal-number";
  value: T;
}>;

// prettier-ignore
export type Hint =
  | HintString
  | HintNumber
  | HintBoolean
  | HintUndefined
  | HintNull
  | HintUnknown
  | HintLiteralString
  | HintLiteralNumber
  | HintBase<{ type: 'union', of: Array<Hint> }>
  | HintBase<{ type: 'array', of : Hint }>
  | HintBase<{ type: 'mapping', of : Record<PropertyKey, Hint> }>
  | HintBase<{ type: 'record', key: Hint, value: Hint }>

// prettier-ignore
export type Unhint<T extends Hint> =
  T extends HintString ? string :
  T extends HintNumber ? number :
  T extends HintBoolean ? boolean :
  T extends HintUndefined ? undefined :
  T extends HintNull ? null :
  T extends HintLiteralString ? (T extends HintLiteralString<infer V> ? V : HintLiteralString['value']) :
  T extends HintLiteralNumber ? (T extends HintLiteralNumber<infer V> ? V : HintLiteralNumber['value']) :
  T extends { type: 'union', of: infer V } ? V extends Hint ? Unhint<ToUnion<V>> : never : 
  T extends { type: 'array', of: infer V } ? V extends Hint ? Array<Unhint<V>> : never : 
  T extends { type: 'mapping', of: infer V } ? (V extends Record<infer _K, infer _J> ? {[Prop in keyof V]: V[Prop] extends Hint ? Unhint<V[Prop]> : never} : never) : 
  T extends { type: 'record', key: infer K, value: infer J } ? K extends Hint ? J extends Hint ? Record<Unhint<K> extends infer G ? G extends string ? G : never : never, Unhint<J>> : never : never :    //? (Unhint<K> extends PropertyKey ? Record<Unhint<K>, Unhint<J>>  : never) : 
  //T extends { type: 'record', key: infer K, value: infer J }  ? (Unhint<K> extends PropertyKey ? Record<Unhint<K>, Unhint<J>>  : never) : 
  T extends { type: 'unknown' } ? unknown : 
  never

export type WithHintMeta<T extends Hint, Meta extends HintMeta> = T & {
  _meta: Meta;
};

export namespace hints {
  export const asHint = <T>(x: T): HintBase<T> => {
    return {
      ...x,
      _hint: true,
    };
  };

  export const array = <Of extends Hint>(
    of: Of,
  ): { type: "array"; of: Of; _hint: true } => {
    return asHint({
      type: "array",
      of: of,
    });
  };

  export const union = <Of extends Array<Hint>>(
    of: Of,
  ): Extract<Hint, { type: "union" }> => {
    return asHint({
      type: "union",
      of: uniqueBy(of, (x) => JSON.stringify(x)),
    });
  };

  export const optional = <T extends Hint>(
    x: T,
  ): WithHintMeta<T, HintMeta<true>> => {
    return {
      ...x,
      _meta: {
        ...(x._meta || {}),
        optional: true,
      },
    };
  };

  export const setOptional = <T extends Hint, Opt extends boolean | undefined>(
    x: T,
    opt: Opt,
  ): T => {
    if (typeof opt === "undefined") return x;
    return {
      ...x,
      _meta: {
        ...(x._meta || {}),
        optional: opt,
      },
    };
  };

  export const string = (): HintString => asHint({ type: "string" });
  export const number = (): HintNumber => asHint({ type: "number" });
  export const undef = (): HintUndefined => asHint({ type: "undefined" });
  export const nil = (): HintNull => asHint({ type: "null" });
  export const boolean = (): HintBoolean => asHint({ type: "boolean" });

  export function literal<T extends string>(x: T): HintLiteralString<T>;
  export function literal<T extends number>(x: T): HintLiteralNumber<T>;
  export function literal(
    x: string | number,
  ): HintLiteralString | HintLiteralNumber {
    if (typeof x === "string")
      return asHint({ type: "literal-string", value: x });
    return asHint({ type: "literal-number", value: x });
  }

  export const mapping = <Rec extends Record<PropertyKey, Hint>>(
    of: Rec,
  ): { type: "mapping"; of: Rec; _hint: true } => {
    return asHint({
      type: "mapping",
      of: of,
    });
  };

  export const record = <
    Key extends HintNumber | HintString | HintLiteralNumber | HintLiteralString,
    Value extends Hint,
  >(
    key: Key,
    value: Value,
  ): { type: "record"; key: Key; value: Value; _hint: true } => {
    return asHint({
      type: "record",
      key,
      value,
    });
  };

  export const notKnown = (): HintUnknown =>
    asHint({
      type: "unknown",
    });

  export namespace util {
    export const isHint = (x: unknown): x is Hint => {
      if (typeof x === "undefined" || x === null) return false;
      if (typeof x !== "object") return false;
      return (x as Record<PropertyKey, unknown>)._hint === true;
    };

    export const isSame = (a: Hint, b: Hint): boolean => {
      if (a.type !== b.type) return false;

      if (a.type === "array" && b.type === "array") return isSame(a.of, b.of);
      if (a.type === "union" && b.type === "union") {
        if (a.of.length != b.of.length) return false;
        const x = a.of.toSorted((xa, xb) => xa.type.localeCompare(xb.type));
        const y = b.of.toSorted((xa, xb) => xa.type.localeCompare(xb.type));
        return zipMin(x, y).every(([z, w]) => isSame(z, w));
      }

      if (a.type === "mapping" && b.type === "mapping") {
        const keysA = Object.keys(a.of).toSorted();
        const keysB = Object.keys(b.of).toSorted();
        if (keysA.length !== keysB.length) return false;

        return zipMin(keysA, keysB).every(([z, w]) => {
          return z === w && a.of[z] && b.of[w] && isSame(a.of[z]!, b.of[w]!);
        });
      }

      if (a.type === "record" && b.type === "record") {
        return isSame(a.key, b.key) && isSame(a.value, b.value);
      }

      return JSON.stringify(a) === JSON.stringify(b);
    };

    export const isExtending = <H extends Hint>(
      target: Hint,
      check: H,
    ): target is Extract<Hint, { type: H["type"] }> => {
      return target.type === check.type;
    };

    export const isNullable = (x: Hint): boolean => {
      if (x.type === "null") return true;
      if (x.type === "union") return !!x.of.find((it) => it.type === "null");
      return false;
    };

    export const isOptional = (x: Hint): boolean => {
      if (x._meta?.optional) return true;
      if (x.type === "undefined") return true;
      if (x.type === "union")
        return !!x.of.find((it) => it.type === "undefined");
      return false;
    };

    export function merge(x: Hint): Hint;
    export function merge(x: Hint[]): Hint;
    export function merge(x: Hint[] | Hint): Hint {
      if (Array.isArray(x)) {
        if (x.length <= 0) return hints.notKnown();
        if (x.length === 1) return merge(x[0]!);
        return hints.union(x);
      }

      switch (x.type) {
        case "union": {
          if (x.of.length === 1) return merge(x.of[0]!);
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
            of: Object.fromEntries(
              Object.entries(x.of).map(([k, v]) => [k, merge(v)]),
            ),
          };
      }
      return x;
    }

    /**
       @brief Turns `hint` into a more simple version if possible.
     */
    export const refine = (hint: Hint): Hint => {
      switch (hint.type) {
        case "array":
          return { ...hint, of: refine(hint.of) };
        case "mapping": {
          return {
            ...hint,
            of: Object.fromEntries(
              Object.entries(hint.of).map(([k, v]) => [k, refine(v)]),
            ),
          };
        }
        case "union": {
          const ofs = hint.of;
          if (ofs.every((x) => x.type === "mapping")) {
            const allKeys = unique(ofs.map((x) => Object.keys(x.of)).flat());
            const allHints: Record<
              string,
              Array<Hint | undefined>
            > = Object.assign(
              {},
              ...allKeys.map((k) => ({ [k]: ofs.map((x) => x.of[k]) })),
            );
            const keyHints = allKeys.map((k): Record<string, Hint> => {
              const hts = allHints[k]!;
              const isOpt = hts.includes(undefined);
              const variants = hts.filter((x) => typeof x !== "undefined");
              const un = util.merge(hints.union(variants));
              if (isOpt) return { [k]: hints.optional(un) };
              return { [k]: un };
            });
            const obj = Object.assign({}, ...keyHints);
            return hints.setOptional(
              refine(hints.mapping(obj)),
              hint._meta?.optional,
            );
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
    export const toHint = (x: unknown): Hint => {
      if (isHint(x)) return x;
      if (typeof x === "number") return hints.number();
      if (typeof x === "string") return hints.string();
      if (typeof x === "boolean") return hints.boolean();
      if (typeof x === "undefined") return hints.undef();
      if (x === null) return hints.nil();
      if (Array.isArray(x)) {
        if (x.every(isHint)) {
          return util.merge(x);
        }
        return hints.array(hints.union(x.map((v) => toHint(v))));
      }
      if (typeof x === "object") {
        const obj = x as Record<PropertyKey, unknown>;
        return asHint({
          type: "mapping",
          of: Object.fromEntries(
            Object.entries(obj).map(([k, v]) => [k, toHint(v)]),
          ),
        });
      }
      return hints.notKnown();
    };
  }

  /**
   * @brief Automatically infer Hint from `x`, with refinements.
   */
  export const auto = (x: unknown): Hint => {
    let y = util.toHint(x);
    y = util.refine(y);
    return y;
  };
}

//const x = hints.record(hints.literal('hello'), hints.number());
//const y = hints.mapping({ x: hints.number(), y: hints.number() });
////
//const w: Unhint<typeof y>

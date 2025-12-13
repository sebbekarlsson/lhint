import { Hint, hints, Unhint } from "../hint";
import { uniqueBy } from "../utils";

// prettier-ignore
export type ValidationError = {
  path: PropertyKey[];
  message: string;
};

// prettier-ignore
export type ValidationResult<T extends Hint> = {
  ok: true,
  value: Unhint<T>,
} | {
  ok: false,
  error: ValidationError;
};

// prettier-ignore
export type ValidationOptions = {
  allowExtraProperties?: boolean;
}

// prettier-ignore
export type MatchesHintResult_internal = {
  matches: boolean;
  crumbs: PropertyKey[];
}

// prettier-ignore
export type MatchesHintResult = {
  matches: boolean;
  crumbs: PropertyKey[];
  stack: MatchesHintResult_internal[];
}

export const validateHint = <T extends Hint>(
  data: unknown,
  hint: T,
  options: ValidationOptions = {},
): MatchesHintResult => {
  const results: MatchesHintResult_internal[] = [];

  // prettier-ignore
  const check = <T extends Hint>(data: unknown, hint: T, crumbs: PropertyKey[]): MatchesHintResult_internal => {
    const toResult = (x: boolean, crumbs: PropertyKey[]): MatchesHintResult_internal => {
      const r: MatchesHintResult_internal = ({ matches: x, crumbs });
      results.push(r);
      return r;
    }
    // prettier-ignore
    switch (hint.type) {
      case 'string': return toResult(typeof data === 'string', [...crumbs]);
      case 'number': return toResult(typeof data === 'number', [...crumbs]);
      case 'boolean': return toResult(typeof data === 'boolean', [...crumbs]);
      case 'undefined': return toResult(typeof data === 'undefined', [...crumbs]);
      case 'null': return toResult(typeof data === null, [...crumbs]);
      case 'literal-string': return toResult(data === hint.value, [...crumbs]);
      case 'literal-number': return toResult(data === hint.value, [...crumbs]);
      case 'array': {
        if (!Array.isArray(data)) return toResult(false, [...crumbs]);
        return toResult(data.every((x, i) => check(x, hint.of, [...crumbs, i]).matches), [...crumbs]);
      };
      // prettier-ignore
      case 'record': {
        if (typeof data === 'undefined' || data === null) return toResult(false, [...crumbs]);
        if (typeof data !== 'object') return toResult(false, [...crumbs]);
        const keys = Object.keys(data);
        const values = Object.values(data);
        return toResult(keys.every((x, i) => check(x, hint.key, [...crumbs, i]).matches) && values.every((x, i) => check(x, hint.value, [...crumbs, i]).matches), [...crumbs]);
      };
      // prettier-ignore
      case 'mapping': {
        if (typeof data === 'undefined' || data === null) return toResult(false, [...crumbs]);
        if (typeof data !== 'object') return toResult(false, [...crumbs]);

        for (const [key, value] of Object.entries(data)) {
          const valueHint = hint.of[key];
          if (!valueHint && !options.allowExtraProperties) return toResult(false, [...crumbs, key]);
          if (!valueHint) continue;
          if (!check(value, valueHint, [...crumbs, key])) return toResult(false, [...crumbs, key]);
        }

        for (const [key, valueHint] of Object.entries(hint.of)) {
          const isOpt = hints.util.isOptional(valueHint)
          if (!isOpt && !(key in data)) return toResult(false, [...crumbs, key]);
          if (isOpt && !(key in data)) continue;
          if (!check((data as Record<string, unknown>)[key], valueHint, [...crumbs, key])) toResult(false, [...crumbs, key]);
        }
        
        return toResult(true, [...crumbs]);
      };
      // prettier-ignore
      case 'union': {
        return toResult(hint.of.some((x, i) => check(data, x, [...crumbs, i]).matches), [...crumbs]);
      };
      // prettier-ignore
      case 'unknown': return toResult(true, [...crumbs]);
    }
  }

  const root = check(data, hint, []);

  return {
    ...root,
    matches: root.matches && results.every((x) => x.matches),
    stack: uniqueBy(
      results.toSorted((a, b) => Number(a.matches) - Number(b.matches)),
      (x) => x.crumbs.toSorted().join("-"),
    ),
  };
};

export const isOfHint = <T extends Hint>(x: unknown, hint: T): x is Unhint<T> =>
  validateHint(x, hint).matches;

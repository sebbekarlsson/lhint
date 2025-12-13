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
  message: string;
  path: string;
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
    const toResult = (hint: Hint, x: boolean, crumbs: PropertyKey[], message?: string): MatchesHintResult_internal => {
      const makeMessage = (): string => {
        if (x === true) return 'ok';
        const rhs = hints.util.toHumanReadable(hint);
        return `did not match: ${rhs}`;
      }
      
      const r: MatchesHintResult_internal = ({ matches: x, crumbs, message: message || makeMessage(), path:  crumbs.join('.') });
      results.push(r);
      return r;
    }
    // prettier-ignore
    switch (hint.type) {
      case 'string': return toResult(hint, typeof data === 'string', [...crumbs]);
      case 'number': return toResult(hint, typeof data === 'number', [...crumbs]);
      case 'boolean': return toResult(hint, typeof data === 'boolean', [...crumbs]);
      case 'undefined': return toResult(hint, typeof data === 'undefined', [...crumbs]);
      case 'null': return toResult(hint, typeof data === null, [...crumbs]);
      case 'literal-string': return toResult(hint, data === hint.value, [...crumbs]);
      case 'literal-number': return toResult(hint, data === hint.value, [...crumbs]);
      case 'array': {
        if (!Array.isArray(data)) return toResult(hint, false, [...crumbs]);
        return toResult(hint, data.every((x, i) => check(x, hint.of, [...crumbs, i]).matches), [...crumbs]);
      };
      // prettier-ignore
      case 'record': {
        if (typeof data === 'undefined' || data === null) return toResult(hint, false, [...crumbs]);
        if (typeof data !== 'object') return toResult(hint, false, [...crumbs]);
        const keys = Object.keys(data);
        const values = Object.values(data);
        return toResult(hint, keys.every((x, i) => check(x, hint.key, [...crumbs, i]).matches) && values.every((x, i) => check(x, hint.value, [...crumbs, i]).matches), [...crumbs]);
      };
      // prettier-ignore
      case 'mapping': {
        if (typeof data === 'undefined' || data === null) return toResult(hint, false, [...crumbs]);
        if (typeof data !== 'object') return toResult(hint, false, [...crumbs]);

        for (const [key, value] of Object.entries(data)) {
          const valueHint = hint.of[key];
          if (!valueHint && !options.allowExtraProperties) return toResult(hint, false, [...crumbs, key]);
          if (!valueHint) continue;
          if (!check(value, valueHint, [...crumbs, key])) return toResult(valueHint, false, [...crumbs, key]);
        }

        for (const [key, valueHint] of Object.entries(hint.of)) {
          const isOpt = hints.util.isOptional(valueHint)
          if (!isOpt && !(key in data)) return toResult(valueHint, false, [...crumbs, key]);
          if (isOpt && !(key in data)) continue;
          if (!check((data as Record<string, unknown>)[key], valueHint, [...crumbs, key])) return toResult(valueHint, false, [...crumbs, key]);
        }
        
        return toResult(hint, true, [...crumbs]);
      };
      // prettier-ignore
      case 'union': {
        return toResult(hint, hint.of.some((x, i) => check(data, x, [...crumbs, i]).matches), [...crumbs]);
      };
      // prettier-ignore
      case 'unknown': return toResult(hint, true, [...crumbs]);
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

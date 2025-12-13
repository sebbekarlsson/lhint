import { Hint, hints, Unhint } from "../hint";
import { uniqueBy } from "../utils";

// prettier-ignore
export type ValidationResult<T extends Hint> = {
  ok: true,
  value: Unhint<T>,
} | {
  ok: false,
  error: MatchesHintResult;
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
  summary: string;
  value: unknown;
}

export const validateHint = <T extends Hint>(
  dataToCheck: unknown,
  hint: T,
  options: ValidationOptions = {},
): MatchesHintResult => {
  const coerced = hints.util.coerceDeep(dataToCheck, hint);
  const results: MatchesHintResult_internal[] = [];

  // prettier-ignore
  const check = <T extends Hint>(data: unknown, hint: T, crumbs: PropertyKey[], emit: boolean = true): MatchesHintResult_internal => {
    
    const toResult = (hint: Hint, x: boolean, crumbs: PropertyKey[], message?: string): MatchesHintResult_internal => {
      const makeMessage = (): string => {
        if (x === true) return 'ok';
        const rhs = hints.util.toHumanReadable(hint);
        return `did not match: ${rhs}`;
      }
      
      const r: MatchesHintResult_internal = ({ matches: x, crumbs, message: message || makeMessage(), path:  crumbs.join('.') });
      if (emit) {
        results.push(r);
      }
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
          if (!isOpt && !(key in data)) return toResult(valueHint, false, [...crumbs, key], `Missing property: ${key}`);
          if (isOpt && !(key in data)) continue;
          if (!check((data as Record<string, unknown>)[key], valueHint, [...crumbs, key])) return toResult(valueHint, false, [...crumbs, key]);
        }
        
        return toResult(hint, true, [...crumbs]);
      };
      // prettier-ignore
      case 'union': {
        const checks = hint.of.map((x, i) => check(data, x, [...crumbs, i], false));
        if (checks.some(x => x.matches)) return toResult(hint, true, [...crumbs]);
        const err = checks.find(x => !x.matches);
        if (err) return err;
        
        return toResult(hint, false, [...crumbs]);
      };
      // prettier-ignore
      case 'unknown': return toResult(hint, true, [...crumbs]);
      case 'date': return toResult(hint, data instanceof Date, [...crumbs]);
    }
  }

  const root = check(coerced, hint, []);

  const summary: string =
    [
      ...results
        .filter((r) => r.matches === false)
        .map((r) => {
          return `${r.path}: ${r.message}`;
        }),
    ]
      .join("\n")
      .trim() || "ok";

  return {
    ...root,
    matches: root.matches && results.every((x) => x.matches),
    stack: uniqueBy(
      results.toSorted((a, b) => Number(a.matches) - Number(b.matches)),
      (x) => x.crumbs.toSorted().join("-"),
    ),
    summary: summary,
    value: coerced,
  };
};

export const isOfHint = <T extends Hint>(
  x: unknown,
  hint: T,
  options: ValidationOptions = {},
): x is Unhint<T> => validateHint(x, hint, options).matches;

export const validate = <T extends Hint>(
  x: unknown,
  hint: T,
  options: ValidationOptions = {},
): ValidationResult<T> => {
  const result = validateHint(x, hint, options);
  if (!result.matches)
    return {
      ok: false,
      error: result,
    };

  return {
    ok: true,
    value: result.value as Unhint<T>,
  };
};

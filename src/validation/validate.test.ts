import { assert, describe, it } from "vitest";
import { hints } from "../hint";
import { isOfHint, validate, validateHint } from "./validate";

describe("validateHint", () => {
  it("Validates a valid date to true", () => {
    const schema = hints.date();
    const x = new Date();
    const result = validateHint(x, schema);
    console.dir(result, { depth: null });
    assert(result.matches === true);
    assert(isOfHint(x, schema) === true);
  });

  it("Validates a invalid date to false", () => {
    const schema = hints.date();
    const x = "not a date";
    const result = validateHint(x, schema);
    console.dir(result, { depth: null });
    assert(result.matches === false);
    assert(isOfHint(x, schema) === false);
  });

  it("Correctly evaluates to true", () => {
    const schema = hints.mapping({
      firstname: hints.string(),
      lastname: hints.string(),
      age: hints.number(),
      friend: hints.optional(
        hints.mapping({
          name: hints.string(),
        }),
      ),
    });

    const x = {
      firstname: "john",
      lastname: "doe",
      age: 32,
    };

    const result = validateHint(x, schema);
    console.dir(result, { depth: null });

    assert(result.matches === true);
    assert(isOfHint(x, schema) === true);
  });

  it("Correctly evaluates to false", () => {
    const schema = hints.mapping({
      firstname: hints.string(),
      lastname: hints.string(),
      age: hints.number(),
      friend: hints.mapping({
        name: hints.string(),
      }),
    });

    const x = {
      firstname: "john",
      lastname: "doe",
      age: 32,
    };

    const result = validateHint(x, schema);
    console.dir(result, { depth: null });

    assert(result.matches === false);
  });

  it("Correctly evaluates to false where a nested mapping has an incorrect value", () => {
    const schema = hints.mapping({
      firstname: hints.string(),
      lastname: hints.string(),
      age: hints.number(),
      friend: hints.mapping({
        name: hints.string(),
      }),
    });

    const x = {
      firstname: "john",
      lastname: "doe",
      age: 32,
      friend: {
        name: 62931,
      },
    };

    const result = validateHint(x, schema);
    console.dir(result, { depth: null });

    assert(result.matches === false);
  });

  it("Correctly evaluates to false where the value is of a completely different type", () => {
    const schema = hints.mapping({
      firstname: hints.string(),
      lastname: hints.string(),
      age: hints.number(),
      friend: hints.mapping({
        name: hints.string(),
      }),
    });

    const x = 51923;

    const result = validateHint(x, schema);
    console.dir(result, { depth: null });

    assert(result.matches === false);
  });

  it("Correctly validates a union", () => {
    const schema = hints.union([hints.date(), hints.number()]);

    const result = validate(123, schema);
    assert(
      result.ok === true,
      result.ok === true ? "ok" : result.error.summary,
    );
  });

  it("Correctly invalidates a union", () => {
    const schema = hints.union([hints.date(), hints.number()]);

    const result = validate("not valid", schema);
    assert(
      result.ok === false,
      result.ok === true ? "ok" : result.error.summary,
    );
  });

  it("Correctly validates a coerced type", () => {
    const schema = hints.coerced(hints.number(), (x) =>
      typeof x === "string" ? Number(x) : x,
    );
    const result = validate("123", schema);
    assert(
      result.ok === true,
      result.ok === true ? "ok" : result.error.summary,
    );
    assert(result.value === 123);
  });

  it("Correctly invalidates a coerced type", () => {
    const schema = hints.coerced(hints.number(), (x) =>
      typeof x === "string" ? Number(x) : x,
    );
    const result = validate(new Date(), schema);
    assert(
      result.ok === false,
      result.ok === true ? "ok" : result.error.summary,
    );
  });
});

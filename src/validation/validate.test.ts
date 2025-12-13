import { assert, describe, it } from "vitest";
import { hints } from "../hint";
import { isOfHint, validateHint } from "./validate";

describe("validateHint", () => {
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
});

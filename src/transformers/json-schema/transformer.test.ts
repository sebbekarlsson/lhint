import { assert, describe, it } from "vitest";
import { hints } from "../../hint";
import { JSONSchemaTransformer } from "./transformer";

import MOCK_OBJECTS from "#/mock/people.json";

describe("json-schema-transformer", () => {
  it("transforms a primitive", () => {
    const x = hints.number();
    const result = JSONSchemaTransformer.transform(x);
    assert(result.type === "number");
  });

  it("transforms an array", () => {
    const x = hints.array(hints.number());
    const result = JSONSchemaTransformer.transform(x);
    assert(result.type === "array");
    assert(result.items.type === "number");
  });

  it("transforms an object", () => {
    const x = hints.mapping({
      firstname: hints.string(),
      lastname: hints.string(),
      age: hints.number(),
      agreedTOS: hints.boolean(),
      yearBorn: hints.optional(hints.number()),
    });
    const result = JSONSchemaTransformer.transform(x);
    assert(result.type === "object");
    assert(Array.isArray(result.required));
    assert(result.required.length === 4);
    assert(result.properties.firstname?.type === "string");
    assert(result.properties.lastname?.type === "string");
    assert(result.properties.age?.type === "number");
    assert(result.properties.agreedTOS?.type === "boolean");
  });

  it("transforms a union", () => {
    const x = hints.union([hints.number(), hints.boolean()]);
    const result = JSONSchemaTransformer.transform(x);
    assert(result.type === "anyOf");
    assert(result.anyOf.length === 2);
    assert(result.anyOf[0]?.type === "number");
    assert(result.anyOf[1]?.type === "boolean");
  });

  it("transforms mock objects", () => {
    const x = hints.auto(MOCK_OBJECTS);
    const result = JSONSchemaTransformer.transform(x);
    console.dir(result, { depth: null });
  });
});

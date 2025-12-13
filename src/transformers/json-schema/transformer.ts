import { Hint, hints } from "../../hint";
import { HintTransformer } from "../transformer";
import { JSONSchema } from "./types";

export const JSONSchemaTransformer: HintTransformer<JSONSchema> = {
  transform: (hint) => {
    const errorNotSupported = (hint: Hint) =>
      new Error(`Transforming ${hint.type} is not supported`);

    const transform = (hint: Hint): JSONSchema => {
      switch (hint.type) {
        case "number":
          return { type: "number" };
        case "date":
          return { type: "string", format: "date" };
        case "string":
          return { type: "string" };
        case "boolean":
          return { type: "boolean" };
        case "unknown":
          throw errorNotSupported(hint);
        case "null":
          return { type: "null" };
        case "undefined":
          throw errorNotSupported(hint);
        case "union":
          return { type: "anyOf", anyOf: hint.of.map((x) => transform(x)) };
        case "array":
          return { type: "array", items: transform(hint.of) };
        case "literal-number":
          return { type: "const", const: hint.value };
        case "literal-string":
          return { type: "const", const: hint.value };
        case "mapping": {
          const entries = Object.entries(hint.of).map(([k, v]) => ({
            name: k,
            hint: v,
          }));
          const required = entries.filter(
            (it) => !hints.util.isOptional(it.hint),
          );

          return {
            type: "object",
            properties: Object.fromEntries(
              Object.entries(hint.of).map(([k, v]) => [k, transform(v)]),
            ),
            required: required.map((it) => it.name),
          };
        }
        // Can't do anything else here
        case "record":
          return {
            type: "object",
            properties: {},
            additionalProperties: true,
          };
      }
    };

    return transform(hint);
  },
};

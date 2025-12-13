import { Hint, hints } from "../../hint";
import { mkPad } from "../../utils";
import { HintTransformer } from "../transformer";
export const TypescriptTemplateTransformer: HintTransformer<string> = {
  transform: (x: Hint): string => {
    const transform = (x: Hint, padding: number, depth: number): string => {
      switch (x.type) {
        case "string":
          return "string";
        case "date":
          return "Date";
        case "number":
          return "number";
        case "boolean":
          return "boolean";
        case "null":
          return "null";
        case "undefined":
          return "undefined";
        case "unknown":
          return "unknown";
        case "array":
          return `Array<${transform(x.of, 0, 0)}>`;
        case "literal-number":
          return `${x.value}`;
        case "literal-string":
          return `"${x.value}"`;
        case "union":
          return x.of.map((it) => transform(it, 0, 0)).join(" | ");
        case "record":
          return `Record<${transform(x.key, 0, 0)}, ${transform(x.value, 0, 0)}>`;
        case "mapping":
          return [
            `${mkPad(depth <= 1 ? 0 : padding)}{\n`,
            Object.entries(x.of)
              .map(([k, v]) => {
                const isOpt = hints.util.isOptional(v);
                return `${mkPad(padding + 2)}${k}${isOpt ? "?" : ""}: ${transform(v, padding + 2, depth + 1)}`;
              })
              .join(";\n"),
            `\n${mkPad(padding)}}`,
          ].join("");
      }
    };

    return transform(x, 0, 0);
  },
};

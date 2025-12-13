import { existsSync } from "fs";
import { hints } from "../hint";
import { makeCommand, registerCommand, runCommand } from "./command";
import fs from "fs/promises";
import { JSONSchemaTransformer, TypescriptTemplateTransformer } from "../transformers";

const getContent = async (path: string): Promise<unknown> => {
  if (path.startsWith("http")) {
    const req = await fetch(path, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await req.json();
    return data;
  }
  if (existsSync(path)) {
    const content = await fs.readFile(path, { encoding: "utf-8" });
    return JSON.parse(content);
  }
  return JSON.parse(path);
};

registerCommand(
  makeCommand({
    name: "hint",
    hint: hints.mapping({
      source: hints.string(),
    }),
    fn: async ({ source }) => {
      const content = await getContent(source);
      const hint = hints.auto(content);
      console.log(JSON.stringify(hint, undefined, 2));
    },
  }),
);

registerCommand(
  makeCommand({
    name: "transform",
    hint: hints.mapping({
      source: hints.string(),
      format: hints.union([
        hints.literal('typescript'),
        hints.literal('json-schema'),
        hints.literal('hint'),
      ])
    }),
    fn: async ({ source, format }) => {
      const content = await getContent(source);
      const hint = hints.auto(content);

      switch (format) {
        case 'typescript': {
          console.log(TypescriptTemplateTransformer.transform(hint));
          return;
        }
        case 'json-schema': {
          console.log(JSON.stringify(JSONSchemaTransformer.transform(hint), undefined, 2))
          return;
        };
        case 'hint': {
          console.log(JSON.stringify(hint, undefined, 2));
          return;
        };
      }
    },
  }),
);

const main = async () => {
  await runCommand(process.argv);
};

main().catch((e) => console.error(e));

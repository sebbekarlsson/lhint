#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const hint_1 = require("../hint");
const command_1 = require("./command");
const promises_1 = __importDefault(require("fs/promises"));
const transformers_1 = require("../transformers");
const getContent = async (path) => {
    if (path.startsWith("http")) {
        const req = await fetch(path, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        const data = await req.json();
        return data;
    }
    if ((0, fs_1.existsSync)(path)) {
        const content = await promises_1.default.readFile(path, { encoding: "utf-8" });
        return JSON.parse(content);
    }
    return JSON.parse(path);
};
(0, command_1.registerCommand)((0, command_1.makeCommand)({
    name: "hint",
    hint: hint_1.hints.mapping({
        source: hint_1.hints.string(),
    }),
    fn: async ({ source }) => {
        const content = await getContent(source);
        const hint = hint_1.hints.auto(content);
        console.log(JSON.stringify(hint, undefined, 2));
    },
}));
(0, command_1.registerCommand)((0, command_1.makeCommand)({
    name: "transform",
    hint: hint_1.hints.mapping({
        source: hint_1.hints.string(),
        format: hint_1.hints.union([
            hint_1.hints.literal("typescript"),
            hint_1.hints.literal("json-schema"),
            hint_1.hints.literal("hint"),
        ]),
    }),
    fn: async ({ source, format }) => {
        const content = await getContent(source);
        const hint = hint_1.hints.auto(content);
        switch (format) {
            case "typescript": {
                console.log(transformers_1.TypescriptTemplateTransformer.transform(hint));
                return;
            }
            case "json-schema": {
                console.log(JSON.stringify(transformers_1.JSONSchemaTransformer.transform(hint), undefined, 2));
                return;
            }
            case "hint": {
                console.log(JSON.stringify(hint, undefined, 2));
                return;
            }
        }
    },
}));
const main = async () => {
    await (0, command_1.runCommand)(process.argv);
};
main().catch((e) => console.error(e));
//# sourceMappingURL=cli.js.map

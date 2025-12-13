"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const hint_1 = require("../hint");
const validate_1 = require("../validation/validate");
const removePrefix = (x, prefix) => {
    if (!x.startsWith(prefix))
        return x;
    return x.slice(prefix.length);
};
const removePrefixes = (x, prefixes) => {
    for (const prefix of prefixes) {
        x = removePrefix(x, prefix);
    }
    return x;
};
const argsToRecord = (args) => {
    const rec = {};
    for (let i = 0; i < args.length; i++) {
        const key = args[i];
        if (key.startsWith("-")) {
            const value = args[i + 1];
            if (!value)
                continue;
            if (value.startsWith("-")) {
                rec[removePrefixes(key, ["--", "-"])] = true;
                continue;
            }
            rec[removePrefixes(key, ["--", "-"])] = value;
        }
    }
    return rec;
};
const makeCommand = (command) => {
    return {
        ...command,
        run: async (args) => {
            const result = (0, validate_1.validate)(args, command.hint, {
                allowExtraProperties: true,
            });
            if (result.ok) {
                return await command.fn(
                // @ts-ignore
                result.value);
            }
            throw new Error(result.error.summary);
        },
    };
};
const cmd = makeCommand({
    name: "hello",
    hint: hint_1.hints.mapping({
        age: hint_1.hints.coerced(hint_1.hints.number(), (x) => Number(x)),
    }),
    fn: (args) => {
        console.log("hello world", args);
    },
});
const commands = {
    [cmd.name]: cmd,
};
const getCommandName = (args) => {
    const names = args.filter((x) => x !== process.execPath && x !== __filename);
    return names[0] || null;
};
const main = async () => {
    const cmdName = getCommandName(process.argv);
    if (!cmdName) {
        console.error(`No command was specified.`);
        return;
    }
    const cmd = commands[cmdName];
    if (!cmd) {
        console.error(`Command not found: ${cmdName}`);
        return;
    }
    const args = argsToRecord(process.argv);
    return await cmd.run(args);
};
main().catch((e) => console.error(e));
//# sourceMappingURL=cli.js.map
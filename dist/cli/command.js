"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.getCommandName = exports.registerCommand = exports.commands = exports.makeCommand = exports.argsToRecord = void 0;
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
exports.argsToRecord = argsToRecord;
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
exports.makeCommand = makeCommand;
exports.commands = {};
const registerCommand = (cmd) => {
    exports.commands[cmd.name] = cmd;
};
exports.registerCommand = registerCommand;
const getCommandName = (args) => {
    const names = args.filter((x) => x !== process.execPath && x !== __filename && !x.startsWith('/'));
    return names[0] || null;
};
exports.getCommandName = getCommandName;
const runCommand = async (args) => {
    const cmdName = (0, exports.getCommandName)(args);
    if (!cmdName) {
        console.error(`No command was specified.`);
        return;
    }
    const cmd = exports.commands[cmdName];
    if (!cmd) {
        console.error(`Command not found: ${cmdName}`);
        return;
    }
    return await cmd.run((0, exports.argsToRecord)(args));
};
exports.runCommand = runCommand;
//# sourceMappingURL=command.js.map
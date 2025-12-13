import { HintMapping, Unhint } from "../hint";
import { validate } from "../validation/validate";

const removePrefix = (x: string, prefix: string): string => {
  if (!x.startsWith(prefix)) return x;
  return x.slice(prefix.length);
};

const removePrefixes = (x: string, prefixes: string[]): string => {
  for (const prefix of prefixes) {
    x = removePrefix(x, prefix);
  }
  return x;
};

export const argsToRecord = (args: string[]): Record<string, string | boolean> => {
  const rec: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i]!;
    if (key.startsWith("-")) {
      const value = args[i + 1];
      if (!value) continue;
      if (value.startsWith("-")) {
        rec[removePrefixes(key, ["--", "-"])] = true;
        continue;
      }
      rec[removePrefixes(key, ["--", "-"])] = value;
    }
  }
  return rec;
};

export type Command<Args extends HintMapping> = {
  name: string;
  hint: Args;
  fn: (args: Unhint<Args>) => void | Promise<void>;
};

export type RunnableCommand<Args extends HintMapping> = {
  name: string;
  hint: Args;
  fn: (args: Unhint<Args>) => void | Promise<void>;
  run: (args: unknown) => Promise<void>;
};

export const makeCommand = <Args extends HintMapping>(
  command: Command<Args>,
): RunnableCommand<Args> => {
  return {
    ...command,
    run: async (args: unknown) => {
      const result = validate(args as unknown, command.hint, {
        allowExtraProperties: true,
      });
      if (result.ok) {
        return await command.fn(
          // @ts-ignore
          result.value,
        );
      }
      throw new Error(result.error.summary);
    },
  };
};

export const commands: Record<string, RunnableCommand<HintMapping>> = {};

export const registerCommand = (cmd: RunnableCommand<HintMapping>): void => {
  commands[cmd.name] = cmd;
}

export const getCommandName = (args: string[]): string | null => {
  const names = args.filter((x) => x !== process.execPath && x !== __filename && !x.startsWith('/'));
  return names[0] || null;
};

export const runCommand = async (args: string[]): Promise<void> => {
  const cmdName = getCommandName(args);
  if (!cmdName) {
    console.error(`No command was specified.`);
    return;
  }
  const cmd = commands[cmdName];

  if (!cmd) {
    console.error(`Command not found: ${cmdName}`);
    return;
  }

  return await cmd.run(argsToRecord(args));
}

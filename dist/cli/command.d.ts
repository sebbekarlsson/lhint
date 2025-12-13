import { HintMapping, Unhint } from "../hint";
export declare const argsToRecord: (args: string[]) => Record<string, string | boolean>;
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
export declare const makeCommand: <Args extends HintMapping>(command: Command<Args>) => RunnableCommand<Args>;
export declare const commands: Record<string, RunnableCommand<HintMapping>>;
export declare const registerCommand: (cmd: RunnableCommand<HintMapping>) => void;
export declare const getCommandName: (args: string[]) => string | null;
export declare const runCommand: (args: string[]) => Promise<void>;
//# sourceMappingURL=command.d.ts.map
type Command<Args extends Record<string, unknown> = Record<string, unknown>> = {
  name: string;
  fn: (args: Args) => void | Promise<void>;
};

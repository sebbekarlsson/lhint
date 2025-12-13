import { Hint, Unhint } from "../hint";
export type ValidationResult<T extends Hint> = {
    ok: true;
    value: Unhint<T>;
} | {
    ok: false;
    error: MatchesHintResult;
};
export type ValidationOptions = {
    allowExtraProperties?: boolean;
};
export type MatchesHintResult_internal = {
    matches: boolean;
    crumbs: PropertyKey[];
    message: string;
    path: string;
};
export type MatchesHintResult = {
    matches: boolean;
    crumbs: PropertyKey[];
    stack: MatchesHintResult_internal[];
    summary: string;
    value: unknown;
};
export declare const validateHint: <T extends Hint>(dataToCheck: unknown, hint: T, options?: ValidationOptions) => MatchesHintResult;
export declare const isOfHint: <T extends Hint>(x: unknown, hint: T, options?: ValidationOptions) => x is Unhint<T>;
export declare const validate: <T extends Hint>(x: unknown, hint: T, options?: ValidationOptions) => ValidationResult<T>;
//# sourceMappingURL=validate.d.ts.map
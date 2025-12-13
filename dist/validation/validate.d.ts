import { Hint, Unhint } from "../hint";
export type ValidationError = {
    path: PropertyKey[];
    message: string;
};
export type ValidationResult<T extends Hint> = {
    ok: true;
    value: Unhint<T>;
} | {
    ok: false;
    error: ValidationError;
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
};
export declare const validateHint: <T extends Hint>(data: unknown, hint: T, options?: ValidationOptions) => MatchesHintResult;
export declare const isOfHint: <T extends Hint>(x: unknown, hint: T) => x is Unhint<T>;
//# sourceMappingURL=validate.d.ts.map
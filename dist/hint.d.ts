import { ToUnion } from "./typeHelpers";
export type HintMeta<IsOptional extends boolean = boolean> = {
    optional?: IsOptional;
};
export type HintBase<T, Meta extends HintMeta = HintMeta> = T & {
    _meta?: Meta;
    _hint: true;
};
export type HintString = HintBase<{
    type: "string";
}>;
export type HintNumber = HintBase<{
    type: "number";
}>;
export type HintBoolean = HintBase<{
    type: "boolean";
}>;
export type HintUndefined = HintBase<{
    type: "undefined";
}>;
export type HintNull = HintBase<{
    type: "null";
}>;
export type HintUnknown = HintBase<{
    type: "unknown";
}>;
export type HintLiteralString<T extends string = string> = HintBase<{
    type: "literal-string";
    value: T;
}>;
export type HintLiteralNumber<T extends number = number> = HintBase<{
    type: "literal-number";
    value: T;
}>;
export type Hint = HintString | HintNumber | HintBoolean | HintUndefined | HintNull | HintUnknown | HintLiteralString | HintLiteralNumber | HintBase<{
    type: 'union';
    of: Array<Hint>;
}> | HintBase<{
    type: 'array';
    of: Hint;
}> | HintBase<{
    type: 'mapping';
    of: Record<PropertyKey, Hint>;
}> | HintBase<{
    type: 'record';
    key: Hint;
    value: Hint;
}>;
export type Unhint<T extends Hint> = T extends HintString ? string : T extends HintNumber ? number : T extends HintBoolean ? boolean : T extends HintUndefined ? undefined : T extends HintNull ? null : T extends HintLiteralString ? (T extends HintLiteralString<infer V> ? V : HintLiteralString['value']) : T extends HintLiteralNumber ? (T extends HintLiteralNumber<infer V> ? V : HintLiteralNumber['value']) : T extends {
    type: 'union';
    of: infer V;
} ? V extends Hint ? Unhint<ToUnion<V>> : never : T extends {
    type: 'array';
    of: infer V;
} ? V extends Hint ? Array<Unhint<V>> : never : T extends {
    type: 'mapping';
    of: infer V;
} ? (V extends Record<infer _K, infer _J> ? {
    [Prop in keyof V]: V[Prop] extends Hint ? Unhint<V[Prop]> : never;
} : never) : T extends {
    type: 'record';
    key: infer K;
    value: infer J;
} ? K extends Hint ? J extends Hint ? Record<Unhint<K> extends infer G ? G extends string ? G : never : never, Unhint<J>> : never : never : T extends {
    type: 'unknown';
} ? unknown : never;
export type WithHintMeta<T extends Hint, Meta extends HintMeta> = T & {
    _meta: Meta;
};
export declare namespace hints {
    const asHint: <T>(x: T) => HintBase<T>;
    const array: <Of extends Hint>(of: Of) => {
        type: "array";
        of: Of;
        _hint: true;
    };
    const union: <Of extends Array<Hint>>(of: Of) => Extract<Hint, {
        type: "union";
    }>;
    const optional: <T extends Hint>(x: T) => WithHintMeta<T, HintMeta<true>>;
    const setOptional: <T extends Hint, Opt extends boolean | undefined>(x: T, opt: Opt) => T;
    const string: () => HintString;
    const number: () => HintNumber;
    const undef: () => HintUndefined;
    const nil: () => HintNull;
    const boolean: () => HintBoolean;
    function literal<T extends string>(x: T): HintLiteralString<T>;
    function literal<T extends number>(x: T): HintLiteralNumber<T>;
    const mapping: <Rec extends Record<PropertyKey, Hint>>(of: Rec) => {
        type: "mapping";
        of: Rec;
        _hint: true;
    };
    const record: <Key extends HintNumber | HintString | HintLiteralNumber | HintLiteralString, Value extends Hint>(key: Key, value: Value) => {
        type: "record";
        key: Key;
        value: Value;
        _hint: true;
    };
    const notKnown: () => HintUnknown;
    namespace util {
        const isHint: (x: unknown) => x is Hint;
        const isSame: (a: Hint, b: Hint) => boolean;
        const isExtending: <H extends Hint>(target: Hint, check: H) => target is Extract<Hint, {
            type: H["type"];
        }>;
        const isNullable: (x: Hint) => boolean;
        const isOptional: (x: Hint) => boolean;
        function merge(x: Hint): Hint;
        function merge(x: Hint[]): Hint;
        /**
           @brief Turns `hint` into a more simple version if possible.
         */
        const refine: (hint: Hint) => Hint;
        /**
         * @brief Automatically infer Hint from `x`, without any refinements.
         */
        const toHint: (x: unknown) => Hint;
    }
    /**
     * @brief Automatically infer Hint from `x`, with refinements.
     */
    const auto: (x: unknown) => Hint;
}
//# sourceMappingURL=hint.d.ts.map
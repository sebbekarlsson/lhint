export type JSONSchemaPrimitive = {
    type: "string";
} | {
    type: "integer";
} | {
    type: "number";
} | {
    type: "boolean";
} | {
    type: "null";
} | {
    type: "ref";
    $ref: string;
} | {
    type: "const";
    const: string | number;
};
export type JSONSchemaAnyOf = {
    type: "anyOf";
    anyOf: JSONSchemaInstance[];
};
export type JSONSchemaAllOf = {
    type: "allOf";
    allOf: JSONSchemaInstance[];
};
export type JSONSchemaValidation = JSONSchemaAnyOf | JSONSchemaAllOf;
export type JSONSchemaInstance = JSONSchemaPrimitive | JSONSchemaObject | JSONSchemaArray | JSONSchemaValidation;
export type JSONSchemaObject<Obj extends Record<string, unknown> = Record<string, unknown>> = {
    type: "object";
    $schema?: string;
    $id?: string;
    $vocabulary?: Record<string, boolean>;
    properties: Record<keyof Obj, JSONSchemaInstance>;
    additionalProperties?: boolean;
    required?: Array<keyof Obj>;
};
export type JSONSchemaArray = {
    type: "array";
    items: JSONSchemaInstance;
};
export type JSONSchema = JSONSchemaInstance;
//# sourceMappingURL=types.d.ts.map
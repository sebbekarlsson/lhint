import { describe, it } from "vitest";
import { TypescriptTemplateTransformer } from "./transformer";
import { hints } from "../../hint";

type Person = {
  firstname: string;
  lastname: string;
  age: number;
  address?: {
    country: string;
    street?: string;
    zip: string | null;
  };
};

const people: Person[] = [
  { firstname: "john", lastname: "doe", age: 42 },
  {
    firstname: "david",
    lastname: "kent",
    age: 39,
    address: { country: "norway", zip: null },
  },
  {
    firstname: "sarah",
    lastname: "sharp",
    age: 55,
    address: { country: "denmark", zip: "xyz" },
  },
  {
    firstname: "hannah",
    lastname: "ryler",
    age: 24,
    address: { country: "america", zip: null, street: "x road" },
  },
  {
    firstname: "mike",
    lastname: "kepler",
    age: 44,
    address: { country: "england", zip: "abc", street: "x road" },
  },
];

describe("typescript-template-transformer", () => {
  it("Generates valid typescript", () => {
    const x = hints.auto(people);
    const result = TypescriptTemplateTransformer.transform(x);
    console.log(result);
  });
});

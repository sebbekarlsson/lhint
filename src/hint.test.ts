import { assert, describe, it } from "vitest";
import { hints } from "./hint";

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

describe("Hint", () => {
  it("Learns unions from list of objects", () => {
    const x = hints.auto(people);

    assert(x.type === "array");
    assert(x.of.type === "mapping");
    assert(x.of.of.firstname?.type === "string");
    assert(x.of.of.lastname?.type === "string");
    assert(x.of.of.age?.type === "number");
    assert(x.of.of.address?.type === "mapping");
    assert(x.of.of.address?.of?.street?.type === "string");
    assert(x.of.of.address?.of?.street?._meta?.optional === true);
    assert(x.of.of.address?._meta?.optional === true);
  });

  it("Learns about the Date type", () => {
    const date = new Date();
    const x = hints.auto(date);
    assert(x.type === 'date');
  })
});

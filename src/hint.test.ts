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

    console.dir(x, { depth: null });
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
    assert(x.type === "date");
  });

  it("Refines unions", () => {
    type Thing = {
      name: string;
      price?: {
        value: number;
        currency?: string;
      };
      categories: string[];
      variants: Array<{ type: string; value: string }>;
      children?: (Thing | string)[];
    };

    const things: Thing[] = [
      {
        name: "a",
        categories: ["fun", "cool"],
        variants: [
          { type: "color", value: "red" },
          { type: "color", value: "green" },
        ],
        price: {
          value: 50,
          currency: "USD",
        },
        children: [
          {
            name: "z",
            categories: ["art"],
            variants: [{ type: "color", value: "brown" }],
            price: {
              value: 30.3,
              currency: "SEK",
            },
          },
        ],
      },
      {
        name: "b",
        categories: ["sad"],
        variants: [
          { type: "size", value: "medium" },
          { type: "size", value: "large" },
          { type: "color", value: "purple" },
        ],
        children: [
          {
            name: "c",
            categories: ["science", "gaming"],
            variants: [{ type: "color", value: "blue" }],
            price: {
              value: 10,
              currency: "SEK",
            },
          },
        ],
      },
      {
        name: "d",
        categories: ["fiction"],
        variants: [
          { type: "size", value: "medium" },
          { type: "size", value: "large" },
          { type: "color", value: "orange" },
        ],
        price: {
          value: 50,
        },
        children: [
          {
            name: "e",
            categories: ["story"],
            variants: [{ type: "size", value: "x-large" }],
            price: {
              value: 10,
            },
          },
          "hello",
        ],
      },
    ];

    const result = hints.auto(things);
    assert(result.type === "array");
    assert(result.of.type === "mapping");
    assert(result.of.of.children?.type === "array");
    assert(result.of.of.children?.of?.type === "union");
    assert(result.of.of.children?.of?.of.length === 2);
    assert(result.of.of.children?.of?.of[0]?.type === "mapping");
    assert(result.of.of.children?.of?.of[1]?.type === "string");
  });
});

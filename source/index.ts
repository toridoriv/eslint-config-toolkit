import type { WithProperty } from "#typings";

import { merge } from "./utils/transform.ts";

export * from "./eslint/index.ts";
export * from "./prettier/index.ts";

const planet = {
  name: "Earth",
  emoji: "🌍",
  info: {
    type: "terrestrial",
    moons: 1,
  },
};

const cat = {
  species: "cat",
  name: "Mittens",
  age: 3,
};

const dog = {
  species: "dog",
  name: "Rex",
  age: 5,
};

const list1 = [1, 2, 3];
const list2 = [4, 5, 6];

const a = { list: list1, pet: dog, planet };
const b = { list: list2, pet: cat };
const merged = merge(a, b);

console.log(a);
console.log(b);
console.log(merged);

type x = WithProperty<typeof planet, "emoji", number>;

console.log(Object.getOwnPropertyDescriptor(merge, "name"));

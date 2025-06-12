import type { GetKindOf, KindOf } from "#predicates";
import { includes, is } from "#predicates";
import type { AnyArray, AnyMap, AnyObject, AnySet, Expand, KeyOf } from "#typings";
import { coerce } from "#typings";

import { clone } from "./clone.ts";

export type Merge<A, B, Opts extends Merge.Options> = Merge.GetValue<A, B, Merge.ParsedOptions<Opts>>;

export namespace Merge {
  /**
   * The strategy to use when merging.
   */
  export type Strategy = "replace" | "merge";

  /**
   * Strategy for merging arrays, maps, and sets.
   */
  export type Options = {
    /**
     * Strategy for merging arrays. When both objects have an array at the same key, this option determines how to
     * handle the merge.
     * - **replace:** The array from the second object replaces the array from the first object.
     * - **merge:** The arrays from both objects are concatenated.
     *
     * @default merge
     */
    array?: Strategy;
    /**
     * Strategy for merging maps. When both objects have a map at the same key, this option determines how to handle the
     * merge.
     * - **replace:** The map from the second object replaces the map from the first object.
     * - **merge:** The maps from both objects are merged recursively. If a key exists in both maps, the value from the
     * second map will be used.
     *
     * @default merge
     */
    map?: Strategy;
    /**
     * Strategy for merging sets. If `a` and `b` are both sets:
     *
     * - **replace:** the second set replaces the first.
     * - **merge:** both sets are merged, resulting in a new set that contains all unique values from both sets.
     *
     * @default merge
     */
    set?: Strategy;
    /**
     * Strategy for merging regular expressions. If `a` and `b` are both regular expressions:
     *
     * - **replace:** the second regular expression replaces the first.
     * - **merge:** both regular expressions are merged, resulting in a new regular expression that combines the
     * patterns and flags of both.
     */
    regexp?: Strategy;
  };

  /**
   * The given options with the default values filled in.
   */
  export type ParsedOptions<T extends Options> = {
    [K in keyof DefaultOptions]: K extends keyof T
      ? T[K] extends Strategy
        ? T[K]
        : DefaultOptions[K]
      : DefaultOptions[K];
  };

  /**
   * Retrieves the value for a given key in the merged object.
   */
  export type GetValue<A, B, O extends AllOptions> =
    GetKindOf<A> extends GetKindOf<B>
      ? GetKindOf<B> extends Mergeable
        ? ResultByKindOf<A, B, O>[GetKindOf<B>]
        : GetReplaceValue<A, B>
      : GetReplaceValue<A, B>;

  export type Mergeable = (typeof merge.MERGEABLE)[number];

  export type ValueDefinition<T> = {
    data: T;
    kind: GetKindOf<T>;
  };

  export type MergeableDefinition =
    | ValueDefinition<AnyArray>
    | ValueDefinition<AnyMap>
    | ValueDefinition<AnySet>
    | ValueDefinition<AnyObject>;

  type AllOptions = Record<KindOf, Strategy>;

  type DefaultOptions = typeof merge.STRATEGY_BY_TYPE;

  type Sets<A, B> = A extends Set<infer T> ? (B extends Set<infer U> ? Set<T | U> : never) : never;

  type Maps<A, B> =
    A extends Map<infer AK, infer AV> ? (B extends Map<infer BK, infer BV> ? Map<AK | BK, AV | BV> : never) : never;

  type Arrays<A, B> = A extends Array<infer T> ? (B extends Array<infer U> ? Array<T | U> : never) : never;

  export type Objects<T extends AnyObject, U extends AnyObject, Opts extends Merge.Options> = Expand.Recursive<{
    [K in keyof T | keyof U]: K extends keyof T | keyof U ? GetValue<T[K], U[K], ParsedOptions<Opts>> : never;
  }>;

  type GetReplaceValue<A, B> = B extends undefined ? A : B;

  type ResultByKindOf<A, B, O extends AllOptions> = {
    array: O["array"] extends "merge" ? Arrays<A, B> : GetReplaceValue<A, B>;
    set: O["set"] extends "merge" ? Sets<A, B> : GetReplaceValue<A, B>;
    map: O["map"] extends "merge" ? Maps<A, B> : GetReplaceValue<A, B>;
    regexp: A & B;
    object: A extends AnyObject
      ? B extends AnyObject
        ? Objects<A, B, O>
        : GetReplaceValue<A, B>
      : GetReplaceValue<A, B>;
  };
}

/**
 * The default strategy for merging objects based on their type.
 */
merge.STRATEGY_BY_TYPE = Object.freeze({
  array: "merge",
  map: "merge",
  set: "merge",
  object: "merge",
  primitive: "replace",
  date: "replace",
  regexp: "replace",
  error: "replace",
  function: "replace",
});

merge.MERGEABLE = Object.freeze(["array", "map", "set", "object", "regexp"] as const);

/**
 * Merges two values of potentially different types into a single value.
 *
 * The merging strategy is determined by the type of the values and the options provided.
 * If both values are of the same type and that type is mergeable, they will be merged according to the specified
 * options. If they are not of the same type or not mergeable, the function will return a clone of the first defined
 * value.
 *
 * @param a
 * @param b
 * @param options
 * @returns
 */
export function merge<A, B, O extends Merge.Options = {}>(a: A, b: B, options: O = {} as O): Merge<A, B, O> {
  const opts = { ...merge.STRATEGY_BY_TYPE, ...options } as Merge.ParsedOptions<O>;
  const kindA = is.kindOf(a);
  const kindB = is.kindOf(b);

  if (merge.isMergeableKind(kindA) && merge.isMergeableKind(kindB) && kindA === kindB) {
    // @ts-ignore
    return merge[kindA](a, b, opts) as Merge<A, B, O>;
  }

  return clone(coerce([b, a].find(is.defined))) as Merge<A, B, O>;
}

merge.object = function mergeObjects<A extends AnyObject, B extends AnyObject, O extends Merge.Options = {}>(
  a: A,
  b: B,
  options: O = {} as O,
): Merge<A, B, O> {
  if (!is.object(a) || !is.object(b)) {
    throw new TypeError("Both arguments must be objects.");
  }

  const keys = getUnique<(KeyOf<A> | KeyOf<B>)[]>(coerce(Object.keys(a).concat(Object.keys(b))));
  const result: any = {};

  for (const key of keys) {
    result[key] = merge(a[key], b[key], options);
  }

  return result;
};

merge.array = function mergeArrays<A extends AnyArray, B extends AnyArray, O extends Merge.Options = {}>(
  a: A,
  b: B,
  options: O = {} as O,
): Merge<A, B, O> {
  if (!is.array(a) || !is.array(b)) {
    throw new TypeError("Both arguments must be arrays.");
  }

  if (options.array === "replace") {
    return clone(coerce([b, a].find(is.defined))) as Merge<A, B, O>;
  }

  return clone([...a, ...b]) as Merge<A, B, O>;
};

merge.map = function mergeMaps<A extends AnyMap, B extends AnyMap, O extends Merge.Options = {}>(
  a: A,
  b: B,
  options: O = {} as O,
): Merge<A, B, O> {
  if (!is.map(a) || !is.map(b)) {
    throw new TypeError("Both arguments must be maps.");
  }

  if (options.map === "replace") {
    return clone(coerce([b, a].find(is.defined))) as Merge<A, B, O>;
  }

  const result = clone(a);

  for (const [key, value] of b) {
    result.set(key, value);
  }

  return result as Merge<A, B, O>;
};

merge.set = function mergeSets<A extends AnySet, B extends AnySet, O extends Merge.Options = {}>(
  a: A,
  b: B,
  options: O = {} as O,
): Merge<A, B, O> {
  if (!is.set(a) || !is.set(b)) {
    throw new TypeError("Both arguments must be sets.");
  }

  if (options.set === "replace") {
    return clone(coerce([b, a].find(is.defined))) as Merge<A, B, O>;
  }

  const result = clone(new Set(a));

  for (const value of b) {
    result.add(value);
  }

  return result as Merge<A, B, O>;
};

merge.regexp = function mergeRegexp<A extends RegExp, B extends RegExp, O extends Merge.Options = {}>(
  a: A,
  b: B,
  options: O = {} as O,
): Merge<A, B, O> {
  if (!is.regexp(a) || !is.regexp(b)) {
    throw new TypeError("Both arguments must be regular expressions.");
  }

  if (options.regexp === "replace") {
    return clone(b) as Merge<A, B, O>;
  }

  const mergedSource = `${a.source}|${b.source}`;
  const mergedFlags = `${a.flags}${b.flags}`;

  let preresult = new RegExp(mergedSource, mergedFlags) as Merge<A, B, O>;
  const additionalProps = {
    ...Object.getOwnPropertyDescriptors(a.constructor.prototype),
    ...Object.getOwnPropertyDescriptors(b.constructor.prototype),
  };

  if ("constructor" in additionalProps) {
    delete additionalProps["constructor"];
  }

  Object.defineProperties(preresult, additionalProps);
  // preresult = Object.setPrototypeOf(preresult, a.constructor.prototype);
  // preresult = Object.setPrototypeOf(preresult, b.constructor.prototype);

  return preresult;
};

merge.isMergeableKind = function isMergeableKind(kind: KindOf): kind is Merge.Mergeable {
  return includes(merge.MERGEABLE, kind);
};

export function getUnique<T extends AnyArray>(list: T): T {
  return Array.from(new Set(list)) as T;
}

class Regex1 extends RegExp {
  someMethod() {
    return "This is a method in Regex1";
  }
}

class Regex2 extends RegExp {
  anotherMethod() {
    return "This is a method in Regex2";
  }
}

class Person {
  constructor(public name: string) {}
}

const regex1 = new Regex1("hello", "g");
const regex2 = new Regex2("goodbye", "i");
const person = new Person("John");

const merged = merge(regex1, regex2, { regexp: "merge" });

console.log("goodbye".match(merged));
console.log("Hello".match(merged));
console.log(merged.source);

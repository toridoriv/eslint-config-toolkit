import type { AnyArray, AnyFunction, AnyMap, AnyObject, AnySet, AnyWeakMap, AnyWeakSet, Primitive } from "#typings";

const PRIMITIVES = ["string", "number", "bigint", "boolean", "symbol", "undefined", "null"] as const;

export type TypeOfPrimitive = (typeof PRIMITIVES)[number];

/**
 * Checks if the given value is an array.
 *
 * @param value - The value to check.
 * @returns `true` if the value is an array, otherwise `false`.
 */
export function isArray(value: unknown): value is AnyArray {
  return Array.isArray(value);
}

/**
 * Checks if the given value is a function.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a function, otherwise `false`.
 */
export function isFunction(value: unknown): value is AnyFunction {
  return typeof value === "function";
}

export function isObject(value: unknown): value is AnyObject {
  if (isArray(value)) return false;

  return typeof value === "object" && value !== null;
}

export function isDefined<T>(value: T): value is Exclude<T, undefined> {
  return value !== undefined;
}

export function isNotNullable<T>(value: T): value is Exclude<T, null> {
  return value !== null;
}

export function isNotNullish<T>(value: T): value is Exclude<T, null | undefined> {
  return isDefined(value) && isNotNullable(value);
}

export function isPrimitive(value: unknown): value is Primitive {
  return includes(PRIMITIVES, typeOf(value));
}

export function includes<T extends AnyArray, U>(list: T, value: U): list is T & U[] {
  return list.includes(value as any);
}

export function isMap(value: unknown): value is AnyMap {
  return value instanceof Map;
}

export function isSet(value: unknown): value is AnySet {
  return value instanceof Set;
}

export function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

export function isRegExp(value: unknown): value is RegExp {
  return value instanceof RegExp;
}

export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

export function isWeakMap(value: unknown): value is AnyWeakMap {
  return value instanceof WeakMap;
}

export function isWeakSet(value: unknown): value is AnyWeakSet {
  return value instanceof WeakSet;
}

export type TypeOf = TypeOfPrimitive | "object" | "function" | "array" | "map" | "set" | "date" | "regexp" | "error";

export function typeOf(value: unknown): TypeOf {
  if (isArray(value)) return "array";
  if (!isNotNullable(value)) return "null";
  if (isMap(value)) return "map";
  if (isSet(value)) return "set";
  if (isDate(value)) return "date";
  if (isRegExp(value)) return "regexp";
  if (isError(value)) return "error";

  return typeof value;
}
type PrimitiveString = (typeof PRIMITIVES)[number];

export type KindOf = "primitive" | Exclude<TypeOf, PrimitiveString>;

export function isArrowFunction(value: unknown): value is AnyFunction {
  return (
    isFunction(value) &&
    !/^(?:(?:\/\*[^(?:*/)]*\*\/\s*)|(?:\/\/[^\r\n]*))*\s*(?:(?:(?:async\s(?:(?:\/\*[^(?:*/)]*\*\/\s*)|(?:\/\/[^\r\n]*))*\s*)?function|class)(?:\s|(?:(?:\/\*[^(?:*/)]*\*\/\s*)|(?:\/\/[^\r\n]*))*)|(?:[_$\w][\w0-9_$]*\s*(?:\/\*[^(?:*/)]*\*\/\s*)*\s*\()|(?:\[\s*(?:\/\*[^(?:*/)]*\*\/\s*)*\s*(?:(?:['][^']+['])|(?:["][^"]+["]))\s*(?:\/\*[^(?:*/)]*\*\/\s*)*\s*\]\())/.test(
      value.toString(),
    )
  );
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export interface Is {
  array: typeof isArray;
  function: typeof isFunction;
  object: typeof isObject;
  defined: typeof isDefined;
  notNullable: typeof isNotNullable;
  notNullish: typeof isNotNullish;
  typeOf: typeof typeOf;
  primitive: typeof isPrimitive;
  arrowFunction: typeof isArrowFunction;
  string: typeof isString;
  map: typeof isMap;
  set: typeof isSet;
  date: typeof isDate;
  regexp: typeof isRegExp;
  error: typeof isError;
  weakMap: typeof isWeakMap;
  weakSet: typeof isWeakSet;
}

/**
 * A collection of type predicates for common JavaScript types.
 */
export const is: Is = {
  array: isArray,
  function: isFunction,
  object: isObject,
  defined: isDefined,
  notNullable: isNotNullable,
  notNullish: isNotNullish,
  typeOf: typeOf,
  primitive: isPrimitive,
  arrowFunction: isArrowFunction,
  string: isString,
  map: isMap,
  set: isSet,
  date: isDate,
  regexp: isRegExp,
  error: isError,
  weakMap: isWeakMap,
  weakSet: isWeakSet,
};

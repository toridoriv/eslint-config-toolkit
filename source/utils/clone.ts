import type { TypeOf, TypeOfPrimitive } from "#predicates";
import { is } from "#predicates";
import type { AnyArray, AnyFunction, AnyMap, AnyObject, AnySet, Primitive } from "#typings";
import { coerce } from "#typings";

import { defineValue } from "./properties.ts";

/**
 * Creates a deep clone of the given value.
 *
 * @param value - The value to clone.
 * @returns A new value that is a deep clone of the original.
 */
export function clone<T>(value: T): T {
  const type = (is.primitive(value) ? "primitive" : is.typeOf(value)) as "primitive" | Exclude<TypeOf, TypeOfPrimitive>;

  return coerce<AnyFunction>(clone[type])(value);
}

/**
 * Creates a deep clone of an object.
 *
 * @param obj    - The object to clone.
 * @param target - The target object to clone into. If not provided, a new object is created.
 * @returns A new object that is a deep clone of the original.
 */
clone.object = function cloneObject<T extends AnyObject>(obj: T, target: AnyObject = {}): T {
  if (!is.object(obj) && !is.function(obj)) {
    throw new TypeError("Argument must be an object or a function.", {
      cause: {
        received: {
          value: obj,
          type: is.typeOf(obj),
        },
      },
    });
  }

  for (const key in obj) {
    if (!(key in target)) {
      const descriptors = Object.getOwnPropertyDescriptor(obj, key);

      Object.defineProperty(target, key, {
        ...descriptors,
        value: clone(obj[key]),
      });
    }
  }

  return target as T;
};

/**
 * It "clones" a primitive value by returning it as is.
 * This is because primitive values are immutable in JavaScript, so they do not need to be cloned.
 *
 * @param value - The primitive value to clone.
 * @returns The same primitive value that was passed in.
 */
clone.primitive = function clonePrimitive<T extends Primitive>(value: T): T {
  return value;
};

/**
 * Creates a deep clone of an array.
 *
 * **Note:** This function iterates over each element in the array and applies the `clone` function to each element.
 *
 * @param list - The array to clone.
 * @returns A new array that is a deep clone of the original.
 */
clone.array = function cloneArray<T extends AnyArray>(list: T): T {
  return list.map(clone) as T;
};

/**
 * Creates a deep clone of a function.
 *
 * **Note:** This function creates a new function with the same body, name and properties as the original function.
 *
 * @param fn - The function to clone.
 * @returns A new function that is a deep clone of the original.
 */
clone.function = function cloneFunction<T extends AnyFunction>(fn: T): T {
  let body = fn.toString();

  if (!is.arrowFunction(fn) && !body.startsWith("function")) {
    body = `function ${body}`;
  }

  const result = new Function("return " + body)();

  defineValue(result, "name", { value: fn.name, writable: false, configurable: true, enumerable: false });

  return clone.object(fn, result);
};

/**
 * Creates a deep clone of a Date object.
 *
 * @param date - The Date object to clone.
 * @returns A new Date object that is a deep clone of the original.
 * @throws {TypeError} If the argument is not a Date object.
 */
clone.date = function cloneDate(date: Date): Date {
  if (!is.date(date)) {
    throw new TypeError("Argument must be a Date object.", {
      cause: {
        received: {
          value: date,
          type: is.typeOf(date),
        },
      },
    });
  }

  return new Date(date.getTime());
};

/**
 * Creates a deep clone of a Map object.
 * **Note:** This function iterates over each key-value pair in the Map and applies the `clone` function to both the key
 * and value.
 *
 * @param value - The Map object to clone.
 * @returns A new Map object that is a deep clone of the original.
 * @throws {TypeError} If the argument is not a Map object.
 */
clone.map = function cloneMap<T extends AnyMap>(value: T): T {
  if (!is.map(value)) {
    throw new TypeError("Argument must be a Map object.", {
      cause: {
        received: {
          value: value,
          type: is.typeOf(value),
        },
      },
    });
  }

  const result = new Map();

  for (const [key, val] of value) {
    result.set(clone(key), clone(val));
  }

  return coerce(result);
};

/**
 * Creates a deep clone of a Set object.
 * **Note:** This function iterates over each value in the Set and applies the `clone` function to each value.
 *
 * @param value - The Set object to clone.
 * @returns A new Set object that is a deep clone of the original.
 * @throws {TypeError} If the argument is not a Set object.
 */
clone.set = function cloneSet<T extends AnySet>(value: T): T {
  if (!is.set(value)) {
    throw new TypeError("Argument must be a Set object.", {
      cause: {
        received: {
          value: value,
          type: is.typeOf(value),
        },
      },
    });
  }

  return coerce(new Set(clone.array(Array.from(value)))) as T;
};

/**
 * Creates a deep clone of a RegExp object with the same source and flags as the original.
 *
 * @param value - The RegExp object to clone.
 * @returns A new RegExp object that is a deep clone of the original.
 * @throws {TypeError} If the argument is not a RegExp object.
 */
clone.regexp = function cloneRegExp(value: RegExp): RegExp {
  if (!is.regexp(value)) {
    throw new TypeError("Argument must be a RegExp object.", {
      cause: {
        received: {
          value: value,
          type: is.typeOf(value),
        },
      },
    });
  }

  return new RegExp(value.source, value.flags);
};

/**
 * Creates a deep clone of an Error object.
 *
 * @param error - The Error object to clone.
 * @returns A new Error object that is a deep clone of the original.
 * @throws {TypeError} If the argument is not an Error object.
 */
clone.error = function cloneError<T extends Error>(error: T): T {
  if (!is.error(error)) {
    throw new TypeError("Argument must be an Error object.", {
      cause: {
        received: {
          value: error,
          type: is.typeOf(error),
        },
      },
    });
  }

  const clonedError = Object.create(error.constructor.prototype, Object.getOwnPropertyDescriptors(error));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { set, get, ...stackDescriptor } = Object.getOwnPropertyDescriptor(error, "stack") || {};

  Object.defineProperty(clonedError, "stack", {
    ...stackDescriptor,
    value: error.stack,
  });

  return clone.object(error, clonedError);
};

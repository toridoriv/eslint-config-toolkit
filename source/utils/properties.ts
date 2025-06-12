import { includes, is, typeOf } from "#predicates";
import type { WithProperty } from "#typings";
import { coerce } from "#typings";

defineValue.ALLOWED_TYPES = Object.freeze(["object", "function"] as const);

export function defineValue<T extends object, K extends keyof T, V = unknown>(
  obj: T,
  key: K,
  descriptor?: PropertyDescriptor,
  value?: V,
): WithProperty<T, K, V> {
  if (!includes(defineValue.ALLOWED_TYPES, typeOf(obj))) {
    throw new TypeError(`First argument MUST BE one of: ${defineValue.ALLOWED_TYPES.join(", ")}.`, {
      cause: {
        received: {
          value: obj,
          type: typeOf(obj),
        },
      },
    });
  }

  if (!descriptor) {
    Object.getOwnPropertyDescriptor(obj, key) as PropertyDescriptor;
  }

  if (is.defined(value)) {
    (descriptor as PropertyDescriptor).value = value;
  }

  return coerce(Object.defineProperty(obj, key, descriptor as PropertyDescriptor));
}

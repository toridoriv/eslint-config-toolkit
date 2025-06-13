import { describe, expect, it } from "vitest";

import { typeOf } from "#predicates";

import { clone } from "./clone.ts";

describe("clone()", () => {
  const toObject = (value: unknown) => ({ value, type: typeOf(value) });

  describe("when called with a primitive value", () => {
    it.each([null, undefined, true, 42, "hi", Symbol("test"), BigInt(123)].map(toObject))(
      "returns the same value for type $type",
      ({ value }) => {
        expect(clone(value)).to.equal(value);
      },
    );
  });

  describe("when called with an array", () => {
    it("returns a new array", () => {
      const array = [1, 2, 3];
      const cloned = clone(array);

      expect(cloned).to.be.an("array").that.is.not.equal(array);
    });

    it("returns an array with the same quantity of elements", () => {
      const array = [1, 2, 3];
      const cloned = clone(array);

      expect(cloned).to.have.lengthOf(array.length);
    });

    it("returns an array with the same elements", () => {
      const array = [1, 2, 3];
      const cloned = clone(array);

      expect(cloned).to.deep.equal(array);
    });
  });

  describe("when called with an object", () => {
    it("returns a new object", () => {
      const obj = { a: 1, b: 2 };
      const cloned = clone(obj);

      expect(cloned).to.be.an("object").that.is.not.equal(obj);
    });

    it("returns an object with the same properties", () => {
      const obj = { a: 1, b: 2 };
      const cloned = clone(obj);

      expect(cloned).to.deep.equal(obj);
    });

    it("returns an object with the same property descriptors", () => {
      const obj = { a: 1, b: 2 };
      Object.defineProperty(obj, "c", { value: 3, writable: false, enumerable: true });
      const cloned = clone(obj);

      expect(Object.getOwnPropertyDescriptor(cloned, "c")).to.deep.equal(Object.getOwnPropertyDescriptor(obj, "c"));
    });
  });

  describe("when called with a function expression", () => {
    it("returns a new function", () => {
      const fn = function test() {};
      const cloned = clone(fn);

      expect(cloned).to.be.a("function").that.is.not.equal(fn);
    });

    it("returns a function with the same name", () => {
      const fn = function testFunction() {};
      const cloned = clone(fn);

      expect(cloned.name).to.equal(fn.name);
    });

    it("returns a function with the same body", () => {
      const fn = function testFunction() {
        return "Hello";
      };
      const cloned = clone(fn);

      expect(cloned.toString()).to.equal(fn.toString());
    });

    it("returns a function with the same properties", () => {
      const fn = function testFunction() {};
      fn.customProperty = "test";
      const cloned = clone(fn);

      expect(cloned.customProperty).to.equal(fn.customProperty);
    });

    it("returns a function with the same functionality", () => {
      const fn = function testFunction() {
        return "Hello, World!";
      };
      const cloned = clone(fn);

      expect(cloned()).to.equal(fn());
    });
  });

  describe("when called with a method", () => {
    it("returns a new function", () => {
      const obj = {
        testMethod() {
          return "Hello, Method!";
        },
      };
      const cloned = clone(obj.testMethod);

      expect(cloned).to.be.a("function").that.is.not.equal(obj.testMethod);
    });

    it("returns a function with the same functionality", () => {
      const obj = {
        testMethod() {
          return "Hello, Method!";
        },
      };
      const cloned = clone(obj.testMethod);

      expect(cloned()).to.equal(obj.testMethod());
    });
  });

  describe("when called with an arrow function", () => {
    it("returns a new function", () => {
      const fn = () => "Hello, Arrow Function!";
      const cloned = clone(fn);

      expect(cloned).to.be.a("function").that.is.not.equal(fn);
    });

    it("returns a function with the same body", () => {
      const fn = () => "Hello, Arrow Function!";
      const cloned = clone(fn);

      expect(cloned.toString()).to.equal(fn.toString());
    });

    it("returns a function with the same functionality", () => {
      const fn = () => "Hello, Arrow Function!";
      const cloned = clone(fn);

      expect(cloned()).to.equal(fn());
    });
  });

  describe("when called with a date", () => {
    it("returns a new date", () => {
      const date = new Date();
      const cloned = clone(date);

      expect(cloned).to.be.an.instanceOf(Date).that.is.not.equal(date);
    });

    it("returns a date with the same time", () => {
      const date = new Date(2023, 0, 1, 12, 0, 0);
      const cloned = clone(date);

      expect(cloned.getTime()).to.equal(date.getTime());
    });
  });

  describe("when called with a map", () => {
    it("returns a new map", () => {
      const map = new Map([
        ["key1", "value1"],
        ["key2", "value2"],
      ]);
      const cloned = clone(map);

      expect(cloned).to.be.instanceOf(Map).that.is.not.equal(map);
    });

    it("returns a map with the same entries", () => {
      const map = new Map<any, any>([
        ["key1", "value1"],
        [{ key: "key2" }, { value: "value2" }],
      ]);
      const cloned = clone(map);

      expect(cloned.size).to.equal(map.size);
      expect(cloned).to.deep.equal(map);
    });
  });

  describe("when called with a set", () => {
    it("returns a new set", () => {
      const set = new Set([1, 2, 3]);
      const cloned = clone(set);

      expect(cloned).to.be.instanceOf(Set).that.is.not.equal(set);
    });

    it("returns a set with the same values", () => {
      const set = new Set([1, 2, { key: "value" }]);
      const cloned = clone(set);

      expect(cloned.size).to.equal(set.size);
      expect(cloned).to.deep.equal(set);
    });
  });

  describe("when called with a regular expression", () => {
    it("returns a new RegExp", () => {
      const regex = /test/;
      const cloned = clone(regex);

      expect(cloned).to.be.instanceOf(RegExp).that.is.not.equal(regex);
    });

    it("returns a RegExp with the same source and flags", () => {
      const regex = /test/gi;
      const cloned = clone(regex);

      expect(cloned.source).to.equal(regex.source);
      expect(cloned.flags).to.equal(regex.flags);
    });
  });

  describe("when called with an error", () => {
    it("returns a new error", () => {
      const error = new Error("Test error");
      const cloned = clone(error);

      expect(cloned).to.be.instanceOf(Error).that.is.not.equal(error);
    });

    it("returns an error with the same message", () => {
      const error = new Error("Test error");
      const cloned = clone(error);

      expect(cloned.message).to.equal(error.message);
    });

    it("returns an error with the same stack trace", () => {
      const error = new Error("Test error");
      const cloned = clone(error);
      const errorWithoutStack = new Error("Test error");

      delete errorWithoutStack.stack;

      const clonedWithoutStack = clone(errorWithoutStack);

      expect(cloned.stack).to.equal(error.stack);
      expect(clonedWithoutStack.stack).to.equal(errorWithoutStack.stack);
    });

    it("returns an error with the same prototype", () => {
      const error = new TypeError("Test type error");
      const cloned = clone(error);

      expect(cloned).to.be.instanceOf(TypeError);
    });

    it("returns an error with the same properties", () => {
      const error = new AggregateError([new Error("Test error 1"), new Error("Test error 2")]);
      const cloned = clone(error);

      expect(cloned.errors).to.deep.equal(error.errors);
    });

    it("returns an error with the same name", () => {
      const error = new TypeError("Test error");
      const cloned = clone(error);

      expect(cloned.name).to.equal(error.name);
    });
  });
});

describe("clone.object()", () => {
  describe("when called with a value that is not an object or function", () => {
    it("throws an error", () => {
      // @ts-expect-error Testing invalid input
      expect(() => clone.object(42)).to.throw(Error);
    });
  });
});

describe("clone.date()", () => {
  describe("when called with a value that is not a date", () => {
    it("throws an error", () => {
      // @ts-expect-error Testing invalid input
      expect(() => clone.date(42)).to.throw(Error);
    });
  });
});

describe("clone.map()", () => {
  describe("when called with a value that is not a map", () => {
    it("throws an error", () => {
      // @ts-expect-error Testing invalid input
      expect(() => clone.map(42)).to.throw(Error);
    });
  });
});

describe("clone.set()", () => {
  describe("when called with a value that is not a set", () => {
    it("throws an error", () => {
      // @ts-expect-error Testing invalid input
      expect(() => clone.set(42)).to.throw(Error);
    });
  });
});

describe("clone.regexp()", () => {
  describe("when called with a value that is not a regular expression", () => {
    it("throws an error", () => {
      // @ts-expect-error Testing invalid input
      expect(() => clone.regexp(42)).to.throw(Error);
    });
  });
});

describe("clone.error()", () => {
  describe("when called with a value that is not an error", () => {
    it("throws an error", () => {
      // @ts-expect-error Testing invalid input
      expect(() => clone.error(42)).to.throw(Error);
    });
  });
});

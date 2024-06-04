import { upperCaseToCamelCase, parseIntIntervalFromString } from "./utils";

describe("upperCaseToCamelCase", () => {
  it("should convert upper case to camel case", () => {
    expect(upperCaseToCamelCase("HELLO_WORLD")).toBe("helloWorld");
    expect(upperCaseToCamelCase("HELLO_WORLD_TEST")).toBe("helloWorldTest");
    expect(upperCaseToCamelCase("HELLO_WORLD_TESTING")).toBe(
      "helloWorldTesting"
    );
  });
});

describe("parseIntIntervalFromString", () => {
  it("should parse interval from string", () => {
    expect(parseIntIntervalFromString("100,200")).toEqual([100, 200]);
  });

  it("should return undefined if value is invalid", () => {
    expect(parseIntIntervalFromString("100")).toBeUndefined();
    expect(parseIntIntervalFromString("100,")).toBeUndefined();
    expect(parseIntIntervalFromString(",200")).toBeUndefined();
  });
});

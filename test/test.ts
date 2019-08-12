import * as clipboard from "../src/";

describe("clipboard-polyfill", () => {
  test("has writeText", () => {
    expect(clipboard).toHaveProperty("writeText");
  });
});

import * as clipboard from "../clipboard-polyfill";

describe("clipboard-polyfill", () => {
  test("has writeText", () => {
    expect(clipboard).toHaveProperty("writeText");
  });
});

import * as clipboard from "../src/targets/main";

describe("clipboard-polyfill", () => {
  test("has writeText", () => {
    expect(clipboard).toHaveProperty("writeText");
  });
});

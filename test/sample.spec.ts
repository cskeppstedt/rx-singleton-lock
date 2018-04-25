import { expect } from "chai";
import sample from "../lib/sample";
describe("sample", () => {
  it("should work", () => {
    expect(sample()).to.equal(5);
  });
});

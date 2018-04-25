import { expect } from "chai";
import sample from "../lib/sample";
describe("sample", () => {
  it("should work", done => {
    sample(3).subscribe(value => {
      expect(value).to.equal(3);
      done();
    });
  });
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var sample_1 = require("../lib/sample");
describe("sample", function () {
    it("should work", function (done) {
        sample_1.default(3).subscribe(function (value) {
            chai_1.expect(value).to.equal(3);
            done();
        });
    });
});

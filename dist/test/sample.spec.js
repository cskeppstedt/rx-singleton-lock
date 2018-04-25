"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var sample_1 = require("../lib/sample");
describe("sample", function () {
    it("should work", function () {
        chai_1.expect(sample_1.default()).to.equal(5);
    });
});

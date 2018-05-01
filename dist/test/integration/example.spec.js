"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var puppeteer = require("puppeteer");
var elements_html_1 = require("../utils/elements-html");
describe("integration example", function () {
    var browser;
    var page;
    var consoleLogs;
    before(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer.launch({ args: ["--no-sandbox"] })];
                case 1:
                    browser = _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    after(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, browser.close()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    consoleLogs = [];
                    return [4 /*yield*/, browser.newPage()];
                case 1:
                    page = _a.sent();
                    page.on("console", function (msg) {
                        var text = msg.text();
                        if (text.indexOf("Download the React DevTools") === -1) {
                            consoleLogs.push(text);
                        }
                    });
                    return [4 /*yield*/, page.goto("http://localhost:8080")];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it("should have 4 buttons", function () { return __awaiter(_this, void 0, void 0, function () {
        var buttons;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.$$("button")];
                case 1:
                    buttons = _a.sent();
                    chai_1.expect(buttons).to.have.length(4);
                    return [2 /*return*/];
            }
        });
    }); });
    it("should support clicking the sync button", function () { return __awaiter(_this, void 0, void 0, function () {
        var messages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.click("[data-id=sync]")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector("[data-id=message-item-0]")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector("[data-id=message-item-1]")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector("[data-id=message-item-2]")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, page.$$eval("[data-id^=message-item-]", elements_html_1.default)];
                case 5:
                    messages = _a.sent();
                    chai_1.expect(messages).to.eql([
                        "[sync:0] ok.",
                        "[sync:0] stream emit.",
                        "[sync:0] stream completed."
                    ]);
                    chai_1.expect(consoleLogs).to.eql([
                        "(sync) 0, got value: 0",
                        "(sync) 0, completed"
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
    it("should support clicking the sync and lock buttons", function () { return __awaiter(_this, void 0, void 0, function () {
        var messages;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, page.type("[data-id=lock-duration]", "500")];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.click("[data-id=sync]")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, page.click("[data-id=lock]")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector("[data-id=message-item-0]")];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, page.click("[data-id=lock]")];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, page.click("[data-id=sync]")];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, page.click("[data-id=sync]")];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, page.click("[data-id=sync]")];
                case 8:
                    _a.sent();
                    return [4 /*yield*/, page.waitForSelector("[data-id=message-item-18]")];
                case 9:
                    _a.sent();
                    return [4 /*yield*/, page.$$eval("[data-id^=message-item-]", elements_html_1.default)];
                case 10:
                    messages = _a.sent();
                    chai_1.expect(messages).to.eql([
                        "[sync:0] ok.",
                        "[sync:0] stream emit.",
                        "[sync:0] stream completed.",
                        "[singleton:0] locked.",
                        "[singleton:1] (ignored) waiting...",
                        "[sync:1] waiting...",
                        "[sync:2] waiting...",
                        "[sync:3] waiting...",
                        "[singleton:0] stream completed, unlocked.",
                        "[sync:1] ok.",
                        "[sync:1] stream emit.",
                        "[sync:1] stream completed.",
                        "[sync:2] ok.",
                        "[sync:2] stream emit.",
                        "[sync:2] stream completed.",
                        "[sync:3] ok.",
                        "[sync:3] stream emit.",
                        "[sync:3] stream completed.",
                        "[singleton:1] (ignored) stream completed."
                    ]);
                    chai_1.expect(consoleLogs).to.eql([
                        "(sync) 0, got value: 0",
                        "(sync) 0, completed",
                        "(lock) 1, got value: 1",
                        "(lock) 2, got value: 1",
                        "(sync) 3, got value: 3",
                        "(sync) 3, completed",
                        "(sync) 4, got value: 4",
                        "(sync) 4, completed",
                        "(sync) 5, got value: 5",
                        "(sync) 5, completed",
                        "(lock) 1, completed",
                        "(lock) 2, completed"
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
});

import { expect } from "chai";
import * as puppeteer from "puppeteer";
import elementsHtml from "../utils/elements-html";
import ignoreLogMessage from "../utils/ignore-log-message";

const examplePageUrl = "http://localhost:8080";

describe("integration example", () => {
  let browser: puppeteer.Browser;
  let page: puppeteer.Page;
  let consoleLogs: string[];

  before(async () => {
    browser = await puppeteer.launch({ args: ["--no-sandbox"] });
  });
  after(async () => {
    await browser.close();
  });
  beforeEach(async () => {
    consoleLogs = [];
    page = await browser.newPage();
    page.on("console", (msg) => {
      const text = msg.text();
      if (!ignoreLogMessage(text)) {
        consoleLogs.push(text);
      }
    });
    await page.goto(examplePageUrl);
  });

  it("should have 4 buttons", async () => {
    const buttons = await page.$$("button");
    expect(buttons).to.have.length(4);
  });

  it("should support clicking the sync button", async () => {
    await page.click("[data-id=sync]");
    await page.waitForSelector("[data-id=message-item-0]");
    await page.waitForSelector("[data-id=message-item-1]");
    await page.waitForSelector("[data-id=message-item-2]");
    const messages = await page.$$eval(
      "[data-id^=message-item-]",
      elementsHtml
    );

    expect(messages).to.eql([
      "[sync:0] ok.",
      "[sync:0] stream emit.",
      "[sync:0] stream completed.",
    ]);
    expect(consoleLogs).to.eql([
      "(sync) 0, got value: 0",
      "(sync) 0, completed",
    ]);
  });

  it("should support clicking the sync and lock buttons", async () => {
    await page.type("[data-id=lock-duration]", "500");
    await page.click("[data-id=sync]");
    await page.click("[data-id=lock]");
    await page.waitForSelector("[data-id=message-item-0]");

    await page.click("[data-id=lock]");
    await page.click("[data-id=sync]");
    await page.click("[data-id=sync]");
    await page.click("[data-id=sync]");
    await page.waitForSelector("[data-id=message-item-18]");

    const messages = await page.$$eval(
      "[data-id^=message-item-]",
      elementsHtml
    );

    expect(messages).to.eql([
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
      "[singleton:1] (ignored) stream completed.",
    ]);
    expect(consoleLogs).to.eql([
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
      "(lock) 2, completed",
    ]);
  });
});

import { expect } from "chai";
const puppeteer = require("puppeteer");

describe("integration example", () => {
  let browser;
  before(async () => {
    browser = await puppeteer.launch();
  });
  after(async () => {
    await browser.close();
  });

  it("should work", async () => {
    const page = await browser.newPage();
    await page.goto("http://localhost:8080");
    const buttons = await page.$$("button");

    expect(buttons).to.have.length(3);
  });
});

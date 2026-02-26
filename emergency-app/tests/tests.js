const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');
(async function example() {
  let driver = await new Builder().forBrowser('chrome').build(); //it builds in chrome
  try {
    await driver.get('http://localhost:8100/home');
    const button = await driver.wait(
      until.elementLocated(By.css('[data-testid="viewAllAlertsBtn"]')),
      10000
    );
    await button.click();
    await driver.wait(until.urlContains('/alerts'), 10000);
    console.log("Test Successful. clicking view alerts brings you to alerts page");
  } finally {
    await driver.quit();
  }
})();
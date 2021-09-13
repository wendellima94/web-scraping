const cheerio = require("cheerio");
const request = require("request");

const fs = require("fs");

const url =
  "https://storage.googleapis.com/infosimples-output/commercia/case/product.html";

const initial_content = {};
const ducky = {};
const properties = {};
const reviews = {};
const reviews_average_score = {};

request(url, function (err, res, body) {
  const $ = cheerio.load(body);

  initial_content["title"] = $("h2#product_title").text();
  initial_content["brand"] = $("div[class='brand']").text();
  initial_content["categories"] = $("nav[class='current-category']")
    .text()
    .trim()
    .split(/>\s+/);
  initial_content["description"] = $("div[class='product-details']")
    .find("p")
    .text()
    .trim()
    .replace(/\n|\s+$/g, "");

  $("div[class='card-container']").each(function (i, el) {
    ducky["name"] = $(this).children().eq(0).text().trim();
    ducky["current_price"] = $(this).children().eq(1).text().trim();
    ducky["old_price"] = $(this).children().eq(2).text().trim();
  });

  $("div[class='container']").each(function (i, el) {
    properties["label"] = $("tr")
      .children()
      .eq(3)
      .text()
      .trim()
      .replace(/\n|\s+$/g, "");
  });
  $("div[id='additional-properties']").each(function (i, el) {
    properties["value"] = $("tr")
      .children()
      .eq(17)
      .text()
      .trim()
      .replace(/\n|\s+$/g, "");
  });

  $("div[class='pure-u-21-24']").each(function (i, el) {
    reviews["name"] = $(this)
      .find("span[class='review-username']")
      .text()
      .replace(/\n|\s+$/g, "");
    reviews["date"] = $(this)
      .children()
      .eq(1)
      .text()
      .trim()
      .replace(/\n|\s+$/g, "");
    reviews["score"] = $(this)
      .children()
      .eq(2)
      .text()
      .trim()
      .replace(/\n|\s+$/g, "");
  });
  $("div[class='review-box']").each(function (i, el) {
    reviews["text"] = $(this).find("p").text();
  });
  $("div[id='comments']").each(function (i, el) {
    reviews_average_score["reviews_average_score"] = $(this).find("h4").text();
  });

  const skus_content = new Array(ducky);
  const prop_content = new Array(properties);
  const reviews_content = new Array(reviews);

  const finalAnswer = {
    ...initial_content,
    skus_content,
    prop_content,
    reviews_content,
    ...reviews_average_score,
  };

  const jsonData = JSON.stringify(finalAnswer);

  fs.writeFile("produto.json", jsonData, function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log(finalAnswer);
    }
  });
});

// ==UserScript==
// @name           brickmerge® Prices
// @name:de        brickmerge® Preise
// @namespace      https://brickmerge.de/
// @version        1.10
// @license        MIT
// @description    Displays lowest brickmerge® price next to offer price
// @description:de Zeigt den bisherigen Bestpreis von brickmerge® parallel zum aktuellen Preis an
// @author         Philipp Kursawe <pke@pke.fyi>
// @match          https://www.alternate.de/LEGO/*
// @match          https://www.amazon.de/LEGO-*
// @match          https://www.jb-spielwaren.de/*
// @match          https://www.mytoys.de/lego-*
// @match          https://www.toys-for-fun.com/de/lego*
// @match          https://www.proshop.de/LEGO/*
// @match          https://steinehelden.de/*
// @match          https://www.saturn.de/de/product/_lego-*
// @match          https://www.smythstoys.com/de/de-de/spielzeug/lego/*
// @icon           https://www.google.com/s2/favicons?sz=64&domain=brickmerge.de
// @homepageURL	   https://github.com/pke/brickmerge-userscript
// @supportURL     https://github.com/pke/brickmerge-userscript/discussions
// ==/UserScript==

(function() {
  'use strict';

  const resolvers = {
      "www.amazon.de": {
          articleSelector: "#productTitle",
          targetSelector: "#corePriceDisplay_desktop_feature_div,#corePrice_feature_div",
          testURL: "https://www.amazon.de/LEGO-43230-Disney-Kamera-Maus-Minifiguren/dp/B0BV7BMPVS",
      },
      "www.mytoys.de": {
          articleSelector: ".prod-info__name",
          targetSelector: ".prod-info__price-container",
          testURL: "https://www.mytoys.de/lego-lego-disney-43230-kamera--hommage-an-walt-disney-29981540.html",
      },
      "www.smythstoys.com": {
          articleSelector: "h1[itemprop=name]",
          targetSelector: "#product-info div[itemprop=price]",
          testURL: "https://www.smythstoys.com/de/de-de/spielzeug/lego/lego-fuer-erwachsene/lego-icons-set-10266-nasa-apollo-11-mondlandefaehre/p/183613",
      },
      "www.toys-for-fun.com": {
          articleSelector: "h1.page-title span[itemprop=name]",
          targetSelector: ".product-info-price",
          testURL: "https://www.toys-for-fun.com/de/legor-disney-43230-kamera-hommage-an-walt-disney.html",
      },
      "www.jb-spielwaren.de": {
          articleSelector: "h1",
          targetSelector: ".widget-availability",
          testURL: "https://www.jb-spielwaren.de/lego-10293-besuch-des-weihnachtsmanns/a-10293/",
      },
      "steinehelden.de": {
          articleSelector: "h1[itemprop=name]",
          targetSelector: "div[itemprop=offers] .product--tax",
          testURL: "https://steinehelden.de/city-arktis-schneemobil-60376/",
      },
      "www.proshop.de": {
          articleSelector: "h1[data-type=product]",
          targetSelector: "#site-product-price-stock-buy-container span.site-currency-wrapper",
          testURL: "https://www.proshop.de/LEGO/LEGO-Ideas-21343-Wikingerdorf/3195765",
      },
      "www.alternate.de": {
        articleSelector: "head > title",
        targetSelector: "#product-top-right .vat-and-shipping-costs",
        testURL: "https://www.alternate.de/LEGO/10311-Creator-Expert-Orchidee-Konstruktionsspielzeug/html/product/1818749",
      },
      "www.saturn.de": {
        articleSelector: "head > title",
        targetSelector: "div[data-test='mms-branded-price']",
        testURL: "https://www.saturn.de/de/product/_lego-10281-bonsai-baum-2672008.html",
      },
  };

  function renderError(element, error) {
      if (!element) {
          return;
      }
      const errorElement = document.createElement("div");
      errorElement.innerText = error;
      element.append(errorElement);
  }

  function addLowestPrice(element, url, lowestPrice) {
      if (!element) {
          return;
      }
      const brickmergeBox = document.createElement("div");
      const brickmergeLink = `<a href="${url}">${lowestPrice}</a>`;
      brickmergeBox.innerHTML = `<span>brickmerge® Bestpreis: ${brickmergeLink}</span>`;
      element.append(brickmergeBox);
  }

  const resolver = resolvers[document.location.host]
  if (!resolver) {
      return;
  }

  // Fetch the LEGO set number from the title
  const title = document.querySelector(resolver.articleSelector)?.textContent;
  //console.log("title: ", title);
  const [, setNumber] = /(\d+)/.exec(title) || [];
  //console.log("set number: ", setNumber);
  if (setNumber) {
      fetch(`https://www.brickmerge.de/_app.php?find=${setNumber}&json_token=zNrPtJiFeOoOLpDjAMctsNzOrvi8KipF`)
      .then(res => res.json(), () => ({ error: "brickmerge® nicht erreichbar" }))
      .then(({ offers, error, url }) => {
          //console.log("offers", offers);
          if (!offers && !error) {
              return;
          }
          const targets = document.querySelectorAll(resolver.targetSelector)
          if (error) {
              for (let element of targets) {
                  renderError(element, error);
              }
          } else {
              const lowestPrice = Number(offers?.lowPrice).toLocaleString("de-DE", {style: "currency", currency: offers?.priceCurrency || "EUR" });
              if (lowestPrice) {
                  for (let element of targets) {
                      //console.log("target:", element.innerHTML);
                      addLowestPrice(element, url, lowestPrice);
                  }
              }
          }
      });
  }
})();

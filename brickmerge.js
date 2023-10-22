// ==UserScript==
// @name           brickmerge® Prices
// @name:de        brickmerge® Preise
// @namespace      https://brickmerge.de/
// @version        1.11.0
// @license        MIT
// @description    Displays lowest brickmerge® price next to offer price
// @description:de Zeigt den bisherigen Bestpreis von brickmerge® parallel zum aktuellen Preis an
// @author         Philipp Kursawe <pke@pke.fyi>
// @match          https://www.alternate.de/LEGO/*
// @match          https://www.amazon.de/LEGO-*
// @match          https://www.jb-spielwaren.de/*
// @match          https://www.mediamarkt.de/de/product/_lego-*
// @match          https://www.mueller.de/p/lego-*
// @match          https://www.mytoys.de/lego-*
// @match          https://www.otto.de/p/lego-*
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
        targetSelector: "div[data-test='mms-pdp-offer-selection']",
        prepend: true,
        dynamic: true, // Site changes its DOM via script and could remove our element
        styleSelector: "div[data-test='mms-branded-price'] p > span",
        style(element) {
            element.querySelector("a").style = "text-decoration: underline";
            element.style = "text-align: right";
        },
        testURL: "https://www.saturn.de/de/product/_lego-10281-bonsai-baum-2672008.html",
      },
      "www.mediamarkt.de": "www.saturn.de", // just an alias, same as saturn
      "www.otto.de": {
        articleSelector: "head > title",
        targetSelector: ".pdp_price__inner",
        prepend: true,
        testURL: "https://www.otto.de/p/lego-konstruktionsspielsteine-kamera-hommage-an-walt-disney-43230-lego-disney-811-st-made-in-europe-C1725197870/#variationId=1725014125",
      },
      "www.mueller.de": {
        articleSelector: "head > title",
        targetSelector: ".mu-product-price.mu-product-details-page__price",
        testURL: "https://www.mueller.de/p/lego-icons-10281-bonsai-baum-kunstpflanzen-set-fuer-erwachsene-deko-2681620/",
      },
  };

  function renderError(element, error, operation = "append") {
      if (!element) {
          return;
      }
      const errorElement = document.createElement("div");
      errorElement.innerText = error.message;
      element[operation]?.(errorElement);
  }

  function addLowestPrice(element, url, lowestPrice, operation = "append") {
      if (!element) {
          return;
      }
      let brickmergeBox = element.querySelector(".brickmerge-price");
      let isNew = !brickmergeBox;
      console.log("addLowestPrice isNew: ", isNew);
      if (!brickmergeBox) {
          brickmergeBox = document.createElement("div");
          brickmergeBox.className = "brickmerge-price";
      }
      const brickmergeLink = url ? `<a href="${url}">${lowestPrice}</a>` : "...";
      brickmergeBox.innerHTML = `brickmerge® Bestpreis: ${brickmergeLink}`;
      if (isNew) {
          element[operation]?.(brickmergeBox);
      }
      return brickmergeBox;
  }

  function addPriceToTargets(resolver, priceOrError, url, styleClasses) {
      const targets = document.querySelectorAll(resolver.targetSelector);
      if (targets.length === 0) {
          return;
      }
      const error = priceOrError instanceof Error && priceOrError
      const price = error ? undefined : priceOrError
      if (error instanceof Error) {
          for (let element of targets) {
              renderError(element, error, resolver.prepend ? "prepend" : "append");
          }
      } else if (price) {
          for (let element of targets) {
              //console.log("target:", element.innerHTML);
              const box = addLowestPrice(element, url, price, resolver.prepend ? "prepend" : "append");
              if (styleClasses) {
                  box.className = styleClasses;
              }
              if (typeof resolver.style === "function") {
                  resolver.style(box);
              } else if (typeof resolver.style === "string") {
                  box.style = resolver.style;
              }
          }
      }
  }

  let resolver = resolvers[document.location.host]
  // Do we have an alias for another resolver?
  if (typeof resolver === "string") {
      resolver = resolvers[resolver];
  }
  if (!resolver) {
      return;
  }

  // Fetch the LEGO set number from the title
  const title = document.querySelector(resolver.articleSelector)?.textContent;
  //console.log("title: ", title);
  const [, setNumber] = /(\d+)/.exec(title) || [];
  //console.log("set number: ", setNumber);

  const styleNode = document.querySelector(resolver.styleSelector);
  console.log("styleNode", styleNode);
  const styleClasses = styleNode?.className;

  if (setNumber) {
      if (!resolver.dynamic) {
          addPriceToTargets(resolver, "...", "", styleClasses);
      }
      fetch(`https://www.brickmerge.de/_app.php?find=${setNumber}&json_token=zNrPtJiFeOoOLpDjAMctsNzOrvi8KipF`)
      .then(res => res.json(), () => ({ error: "brickmerge® nicht erreichbar" }))
      .then(({ offers, error, url }) => {
          //console.log("offers", offers);
          if (!offers && !error) {
              return;
          }
          const lowestPrice = Number(offers?.lowPrice).toLocaleString("de-DE", {style: "currency", currency: offers?.priceCurrency || "EUR" });
          addPriceToTargets(resolver, error || lowestPrice, url, styleClasses);
      });
  }
})();
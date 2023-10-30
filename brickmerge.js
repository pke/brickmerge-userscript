// ==UserScript==
// @name           brickmerge® Prices
// @name:de        brickmerge® Preise
// @namespace      https://brickmerge.de/
// @version        1.16.0
// @license        MIT
// @description    Displays lowest brickmerge® price next to offer price
// @description:de Zeigt den bisherigen Bestpreis von brickmerge® parallel zum aktuellen Preis an
// @author         Philipp Kursawe <pke@pke.fyi>
// @match          https://www.alternate.de/LEGO/*
// @match          https://www.alza.de/spielzeug/lego-*
// @match          https://www.amazon.de/LEGO-*
// @match          https://www.amazon.de/*LEGO*
// @match          https://www.amazon.de/dp/*
// @match          https://www.amazon.de/*/dp/*
// @match          https://www.ebay.de/itm/*
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
// @match          https://www.thalia.de/shop/home/artikeldetails/*
// @icon           https://www.google.com/s2/favicons?sz=64&domain=brickmerge.de
// @homepageURL	   https://github.com/pke/brickmerge-userscript
// @supportURL     https://github.com/pke/brickmerge-userscript/discussions
// ==/UserScript==

(function() {
  'use strict';

   const style = `
     .brickmerge-price {
       background-color: #b00 !important;
       color: #fff !important;
       margin: 1rem 0 !important;
       padding: 0.3rem !important;
     }
     .brickmerge-price a {
       color: #fff !important;
       font-weight: bold !important;
       text-decoration: underline !important;
     }
     .brickmerge-price a:hover {
       text-decoration: none !important;
     }
     .brickmerge-price img {
       height: 16px;
       width: 16px;
       display: inline;
       vertical-align: middle;
       margin-right: 0.3rem;
     }
     .brickmerge-price img.brickmerge {
       width: initial;
     }
     `;
  const logo = `https://brickmerge-userscript.hypermedia.rocks/images/brickmerge.svg`;

  const resolvers = {
      "www.amazon.de": {
          targetSelector: "#corePriceDisplay_desktop_feature_div,#corePrice_feature_div",
          testURL: "https://www.amazon.de/LEGO-43230-Disney-Kamera-Maus-Minifiguren/dp/B0BV7BMPVS",
      },
      "www.mytoys.de": {
          targetSelector: ".prod-info__price-container",
          testURL: "https://www.mytoys.de/lego-lego-disney-43230-kamera--hommage-an-walt-disney-29981540.html",
      },
      "www.smythstoys.com": {
          targetSelector: "#product-info div[itemprop=price]",
          testURL: "https://www.smythstoys.com/de/de-de/spielzeug/lego/lego-fuer-erwachsene/lego-icons-set-10266-nasa-apollo-11-mondlandefaehre/p/183613",
      },
      "www.toys-for-fun.com": {
          targetSelector: ".product-info-price",
          testURL: "https://www.toys-for-fun.com/de/legor-disney-43230-kamera-hommage-an-walt-disney.html",
      },
      "www.jb-spielwaren.de": {
          targetSelector: ".widget-availability",
          testURL: "https://www.jb-spielwaren.de/lego-10293-besuch-des-weihnachtsmanns/a-10293/",
      },
      "steinehelden.de": {
          articleExtractor: /(\d+)/,
          targetSelector: "div[itemprop=offers] .product--tax",
          testURL: "https://steinehelden.de/city-arktis-schneemobil-60376/",
      },
      "www.proshop.de": {
          targetSelector: "#site-product-price-stock-buy-container span.site-currency-wrapper",
          testURL: "https://www.proshop.de/LEGO/LEGO-Ideas-21343-Wikingerdorf/3195765",
      },
      "www.alternate.de": {
        targetSelector: "#product-top-right .vat-and-shipping-costs",
        testURL: "https://www.alternate.de/LEGO/10311-Creator-Expert-Orchidee-Konstruktionsspielzeug/html/product/1818749",
      },
      "www.saturn.de": {
        targetSelector: "div[data-test='mms-pdp-offer-selection']",
        prepend: true,
        dynamic: true, // Site changes its DOM via script and could remove our element
        styleSelector: "div[data-test='mms-branded-price'] p > span",
        style(element) {
            element.style = "text-align: right";
        },
        testURL: "https://www.saturn.de/de/product/_lego-10281-bonsai-baum-2672008.html",
      },
      "www.mediamarkt.de": "www.saturn.de", // just an alias, same as saturn
      "www.otto.de": {
        targetSelector: ".pdp_price__inner",
        prepend: true,
        testURL: "https://www.otto.de/p/lego-konstruktionsspielsteine-kamera-hommage-an-walt-disney-43230-lego-disney-811-st-made-in-europe-C1725197870/#variationId=1725014125",
      },
      "www.mueller.de": {
        targetSelector: ".mu-product-price.mu-product-details-page__price",
        testURL: "https://www.mueller.de/p/lego-icons-10281-bonsai-baum-kunstpflanzen-set-fuer-erwachsene-deko-2681620/",
      },
      "www.thalia.de": {
        targetSelector: "artikel-informationen",
        style(element) {
            element.classList.add("element-text-small");
        },
        testURL: "https://www.thalia.de/shop/home/artikeldetails/A1068002914",
      },
      "www.ebay.de": {
          parent: true,
          prepend: true,
          style: "text-align: center",
          targetSelector: ".x-bin-price",
          testURL: "https://www.ebay.de/itm/204515604952",
      },
      "www.alza.de": {
          parent: true,
          prepend: true,
          targetSelector: ".price-detail__row",
          testURL: "https://www.alza.de/spielzeug/lego-disney-43230-kamera-hommage-an-walt-disney-d7744520.htm",
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

  function addLowestPrice(element, title = "Bestpreis wird geladen", url, lowestPrice, operation = "append", icon, iconClass = []) {
      if (!element) {
          return;
      }
      let brickmergeBox = element.querySelector(".brickmerge-price");
      let isNew = !brickmergeBox;
      // console.log("addLowestPrice isNew: ", isNew);
      if (!brickmergeBox) {
          brickmergeBox = document.createElement("div");
          brickmergeBox.className = "brickmerge-price";
      }
      const brickmergeLink = url ? `<a href="${url}">${lowestPrice}</a>` : "...";
      const iconImage = icon ? `<img src="${icon}" class="${iconClass.join(" ")}"/>` : "";
      brickmergeBox.innerHTML = `${iconImage}${title}: ${brickmergeLink}`;
      if (isNew) {
          element[operation]?.(brickmergeBox);
      }
      return brickmergeBox;
  }

  function addPriceToTargets(resolver, priceOrError, url, styleClasses, title, icon, iconClass) {
      const targets = document.querySelectorAll(resolver.targetSelector);
      if (targets.length === 0) {
          return;
      }
      if (!document.querySelector("head style.brickmerge")) {
          const styleElement = document.createElement("style");
          styleElement.className = "brickmerge";
          styleElement.type = 'text/css';
          styleElement.innerHTML = style;
          document.head.appendChild(styleElement);
      }
      const error = priceOrError instanceof Error && priceOrError
      const price = error ? undefined : priceOrError
      if (error instanceof Error) {
          for (let element of targets) {
              if (resolver.parent) {
                  element = element.parentElement
              }
              renderError(element, error, resolver.prepend ? "prepend" : "append");
          }
      } else if (price) {
          for (let element of targets) {
              if (resolver.parent) {
                  element = element.parentElement
              }
              //console.log("target:", element.innerHTML);
              const box = addLowestPrice(element, title, url, price, resolver.prepend ? "prepend" : "append", icon, iconClass);
              if (styleClasses) {
                  box.classList.add(...styleClasses.split(" "));
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
  //console.log("title: ", document.title);
  const [, setNumber] = (resolver.articleExtractor || /LEGO.*?(\d+)/i).exec(document.title) || [];
  //console.log("set number: ", setNumber);

  const styleNode = document.querySelector(resolver.styleSelector);
  // console.log("styleNode", styleNode);
  const styleClasses = styleNode?.className;

  if (setNumber) {
      if (!resolver.dynamic) {
          addPriceToTargets(resolver, "...", "", styleClasses);
      }
      fetch("https://brickmerge-userscript.hypermedia.rocks/lowest/" + setNumber)
      .then(res => res.json(), () => ({ error: "brickmerge® nicht erreichbar" }))
      .then(json => {
          const { title, links } = json;
          const icon = links.find(link => link.rel == "icon") || logo;
          const link = links.find(link => link.rel == "self");
          addPriceToTargets(resolver, link.title, link.href, styleClasses, title, icon.href, icon.class);
      });
  }
})();

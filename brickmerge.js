// ==UserScript==
// @name           brickmerge® Prices
// @name:de        brickmerge® Preise
// @namespace      https://brickmerge.de/
// @version        1.3
// @license        MIT
// @description    Displays lowest brickmerge® price next to offer price
// @description:de Zeigt den bisherigen Bestpreis von brickmerge® parallel zum aktuellen Preis an
// @author         Philipp Kursawe <pke@pke.fyi>
// @match          https://www.amazon.de/LEGO-*
// @match          https://www.mytoys.de/lego-*
// @match          https://www.smythstoys.com/de/de-de/spielzeug/lego/*
// @match          https://www.toys-for-fun.com/de/lego*
// @icon           https://www.google.com/s2/favicons?sz=64&domain=brickmerge.de
// @supportURL     https://github.com/pke/brickmerge-userscript/discussions
// @grant          GM_log
// ==/UserScript==

(function() {
    'use strict';

    const resolvers = {
        "www.amazon.de": {
            articleSelector: "#productTitle",
            targetSelector: "#corePriceDisplay_desktop_feature_div,#corePrice_feature_div",
        },
        "www.mytoys.de": {
            articleSelector: ".prod-info__name",
            targetSelector: ".prod-info__price-container",
        },
        "www.smythstoys.com": {
            articleSelector: "h1[itemprop=name]",
            targetSelector: "#product-info div[itemprop=price]",
        },
        "www.toys-for-fun.com": {
            articleSelector: "h1.page-title span[itemprop=name]",
            targetSelector: ".product-info-price",
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
        brickmergeBox.innerHTML = `<span>brickmerge Bestpreis: ${brickmergeLink}</span>`;
        element.append(brickmergeBox);
    }

    const resolver = resolvers[document.location.host]
    if (!resolver) {
        return;
    }

    // Fetch the LEGO set number from the title
    const title = document.querySelector(resolver.articleSelector)?.textContent;
    GM_log?.("title: ", title);
    const [, setNumber] = /(\d+)/.exec(title) || [];
    GM_log?.("set number: ", setNumber);
    if (setNumber) {
        fetch(`https://www.brickmerge.de/_app.php?find=${setNumber}&json_token=zNrPtJiFeOoOLpDjAMctsNzOrvi8KipF`)
        .then(res => res.json(), () => ({ error: "brickmerge® nicht erreichbar" }))
        .then(({ offers, error, url }) => {
            GM_log?.("offers", offers);
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
                        //GM_log("target:", element.innerHTML);
                        addLowestPrice(element, url, lowestPrice);
                    }
                }
            }
        });
    }
})();
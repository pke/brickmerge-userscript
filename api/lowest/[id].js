import UserAgent from "user-agents"
import util from "util"
const trace = util.debuglog("trace")
import semverGt from "semver/functions/gt"

function log(name) {
  return (object) => {
    if (object instanceof Response) {
      trace("%s: [%d %s]", name, object.status, object.statusText)
    } else {
      trace("%s %o", name, object)
    }
    return object
  }
}

function fetchSmytstoysPrice(id) {
  const url = `https://www.smythstoys.com/de/de-de/search/autocomplete/SearchBox?term=${id}`
  return fetch(url, {
    headers: {
      "User-Agent": (new UserAgent()).toString(),
      "Referer": "https://www.smythstoys.com",
    }
   })
  .then(log("smyths-response"))
  .then(result => result.json())
  .then(({products}) => products?.[0])
  .then(log("smyths-product"))
  .then(product => {
    const { namePlainText } = product
    // Get set number from productName and compare to searched id
    const foundSetNumber = /LEGO.*?(\d+)/i.exec(namePlainText)?.[1]
    if (foundSetNumber == id) {
      return product
    } else {
      throw new Error(`LEGO® set with ${id} not found on smythstoys.`)
    }
  })
  .then(({ url, price }) => ({
    title: "Smythstoys Bestpreis",
    icon: "https://image.smythstoys.com/images/ico/de/favicon.ico",
    iconType: "image/png",
    iconClass: "small",
    href: "https://www.smythstoys.com/de/de-de" + url,
    price: price.value,
    currency: price.currencyIso,
  }))
}

function createResponse({ title, href, price, currency = "EUR", icon, iconType = "image/x-icon", iconClass, version = "1.26.0" }) {
  return {
    title,
    links: [
      {
        rel: semverGt(version, "1.26.0") ? ["self"] : "self",
        title: isNaN(price) ? "unbekannt" : Number(price).toLocaleString("de-DE", {style: "currency", currency }),
        href
      },
      icon && {
        rel: semverGt(version, "1.26.0") ? ["icon"] : "icon",
        class: iconClass && [iconClass],
        type: iconType,
        href: icon,
      },
    ].filter(Boolean),
  }
}

function errorResponse(req, res, status, message) {
  // Setting the statusCode with res.statusCode ||= 500 does NOT work!
  res.status(status || 500);
  res.setHeader("Content-Type", "application/problem+json");
  res.json({
    title: "Error",
    status: status,
    detail: message,
  })
}

export default function lowestPrice(req, res) {
  if (req.method !== "GET") {
    return errorResponse(req, res, 405, "Method not allowed")
  }
  const { id } = req.query;
  const [, brickmergeVersion] = /brickmerge\/(\d+.\d+.\d+)/i.exec(req.headers["user-agent"]) || []

  Promise.allSettled([
    fetchBrickmergePrice(id),
    fetchSmytstoysPrice(id),
  ])
  .then(log("allSettled"))
  .then(results => {
    const [brickMergeResult] = results
    const brickMergeAllTimeBestprice = brickMergeResult.status === "fulfilled" && /BESTPREIS/.test(brickMergeResult.value?.title) && brickMergeResult.value?.price
    const [best] = results
      .filter(result => result.status === "fulfilled")
      .map(result => result.value)
      .sort((a, b) => a.price - b.price)
    // Fix shop prices that are not listed on BM (i.e. smythstoys)
    // which can have an even better price than the recorded on BM
    if (best?.price <= brickMergeAllTimeBestprice) {
      best.title = "ALL-TIME-BESTPREIS"
    }
    //console.log("best", best)
    if (best) {
      best.version = brickmergeVersion
      res.status(200);
      res.setHeader("Content-Type", "application/siren+json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(createResponse(best))
    } else {
      res.statusCode = 404
      throw new Error(`LEGO ${id} not found`)
    }
  }).catch(error => {
    errorResponse(req, res, res.statusCode || 500, error.message)
  })
}

function getBrickmergeTitle(additionalProperty = []) {
  if (!Array.isArray(additionalProperty)) {
    additionalProperty = [additionalProperty]
  }
  return additionalProperty.find(prop => prop.name === "All-Time-Bestpreis" && prop.value === "true" ) ? "ALL-TIME-BESTPREIS" : "Bestpreis"
}

function fetchBrickmergePrice(id) {
  const url = `https://www.brickmerge.de/_app.php?find=${id}&json_token=${process.env.API_KEY}`
  log("fetchBrickmergePrice", url)

  return fetch(url)
      .then(log("brickmerge"))
      .then(res => {
        if (res.ok && res.status === 200) {
          return res
        } else if (res.status === 404) {
          throw new Error(`LEGO® set number ${id} not found on brickmerge®`)
        }
        throw new Error("brickmerge® nicht erreichbar")
      })
      .then(res => res.json())
      .then(({ offers, url, additionalProperty }) => ({
        title: getBrickmergeTitle(additionalProperty),
        icon: "https://raw.githubusercontent.com/pke/brickmerge-userscript/master/public/images/brickmerge.svg",
        iconType: "image/svg+xml",
        href: url,
        price: Number(offers?.lowPrice),
        currency: offers?.priceCurrency,
      }));
}

import UserAgent from "user-agents"
import util from "util"
const trace = util.debuglog("trace")

function log(object) {
  if (object instanceof Response) {
    trace("%s %s [%d %s]", object.method, object.host, object.status, object.statusText)
  } else {
    trace(object)
  }
  return object
}

function fetchSmytstoysPrice(id) {
  const url = `https://uath9oahyf-dsn.algolia.net/1/indexes/*/queries`
  return fetch(url, {
    method: "POST",
    headers: {
      "User-Agent": (new UserAgent()).toString(),
      "Content-Type": "application/json",
      "x-algolia-application-id": "UATH9OAHYF",
      "x-algolia-api-key": "5913bdd0fed49d7c87acd04998565993",
      "Referer": "https://www.smythstoys.com",
    },
    body: `{"requests":[{"indexName": "prod_PRODUCTS_DE_de","query": "LEGO ${id}","params": "hitsPerPage=1"}]}`,
   })
  .then(log)
  .then(result => result.json())
  .then(({results}) => results?.[0].hits?.[0])
  .then(log)
  .then(result => {
    const { productName } = result
    // Get set number from productName and compare to searched id
    const foundSetNumber = /LEGO.*?(\d+)/i.exec(productName)?.[1]
    if (foundSetNumber == id) {
      return result
    } else {
      throw new Error(`LEGO® set with ${id} not found on smythstoys.`)
    }
  })
  .then(({ url, priceValue, currency }) => ({
    title: "Smythstoys Bestpreis",
    icon: "https://image.smythstoys.com/images/ico/de/favicon.ico",
    iconType: "image/png",
    iconClass: "small",
    href: "https://www.smythstoys.com/de/de-de" + url,
    price: priceValue,
    currency,
  }))
}

function createResponse({ title, href, price, currency = "EUR", icon, iconType = "image/x-icon", iconClass }) {
  return {
    title,
    links: [
      {
        rel: "self",
        title: Number(price).toLocaleString("de-DE", {style: "currency", currency }),
        href
      },
      icon && {
        rel: "icon",
        class: iconClass && [iconClass],
        type: iconType,
        href: icon,
      }
    ].filter(Boolean),
  }
}

export default function lowestPrice(req, res) {
  const { id } = req.query;

  Promise.allSettled([
    fetchBrickmergePrice(id),
    fetchSmytstoysPrice(id),
  ])
  .then(log)
  .then(results => {
    const [brickMergeResult] = results
    const brickMergeAllTimeBestprice = brickMergeResult.status === "fulfilled" && /BESTPREIS/.test(brickMergeResult.value?.title) && brickMergeResult.value?.price
    const [best] = results
      .filter(result => result.status === "fulfilled")
      .map(result => result.value)
      .sort((a, b) => a.price - b.price)
    // Fix shop prices that are not listed on BM (i.e. smythstoys)
    // which can have an even better price than the recorded on BM
    if (best?.price < brickMergeAllTimeBestprice) {
      best.title = "ALL-TIME-BESTPREIS"
    }
    //console.log("best", best)
    if (best) {
      res.status(200);
      res.setHeader("Content-Type", "application/siren+json");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.json(createResponse(best))
    } else {
      res.statusCode = 404
      throw new Error(`LEGO ${id} not found`)
    }
  }).catch(error => {
    // Setting the statusCode with res.statusCode ||= 500 does NOT work!
    res.status(res.statusCode || 500);
    res.setHeader("Content-Type", "application/problem+json");
    res.json({
      title: "Error",
      status: res.statusCode,
      detail: error.message,
    })
  })
}

function fetchBrickmergePrice(id) {
  const url = `https://www.brickmerge.de/_app.php?find=${id}&json_token=${process.env.API_KEY}`
  log(url)

  return fetch(url)
      .then(log)
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
        title: (/All-Time/.test(additionalProperty?.name) && additionalProperty.value === "true") ? "ALL-TIME-BESTPREIS" : "Bestpreis",
        icon: "https://raw.githubusercontent.com/pke/brickmerge-userscript/master/public/images/brickmerge.svg",
        iconType: "image/svg+xml",
        href: url,
        price: Number(offers?.lowPrice),
        currency: offers?.priceCurrency,
      }));
}

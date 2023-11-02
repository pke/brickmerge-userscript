import { load } from "cheerio"
import UserAgent from "user-agents"

function fetchBrickmergeBestPrice(id) {
  const href = `https://brickmerge.de/${id}`
  return fetch(href, {
    headers: {
      "User-Agent": (new UserAgent()).toString(),
    },
   })
  .then(result => result.text())
  .then(load)
  .then($ => {
    const regex = /(\d+,\d+) €.* (\d+)%.*  (.*)/
    const currency = "EUR"
    const $priceLinks = $("a[href='#offerlist']")
    const $bestPriceElement = $priceLinks.first()
    const [, bestPrice, bestPercent, bestDate] = $bestPriceElement.text().match(regex)
    // Get set number from productName and compare to searched id
    const name = $("title").text()
    const foundSetNumber = /LEGO.*?(\d+)/i.exec(name)?.[1]
    if (foundSetNumber == id) {
      if (bestDate === "heute!") {
        return {
          title: `ALL-TIME-BESTPREIS`,
          icon: "https://raw.githubusercontent.com/pke/brickmerge-userscript/master/public/images/brickmerge.svg",
          iconType: "text/xml+svg",
          href: $("link[rel=canonical]").attr("href"),
          price: bestPrice.replace(",", "."),
          currency,
        }
      } else {
        throw new Error(`LEGO® set ${name} bestprice ${bestPrice} was ${bestDate}.`)
      }
    } else {
      throw new Error(`LEGO® set with ${id} not found on smythstoys.`)
    }
  })
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
  .then(result => result.json())
  //.then(json => { console.log("JSON: ", json); return json })
  .then(({results}) => results?.[0].hits)
  //.then(result => { console.log("Result", result); return result})
  .then(result => result[0])
  .then(result => { console.log("Result", result); return result})
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
    fetchBrickmergeBestPrice(id),
    fetchSmytstoysPrice(id),
  ]).then(results => {
    console.log(results)
    console.log(res.statusCode)
    const [best] = results
      .filter(result => result.status === "fulfilled")
      .map(result => result.value)
      .sort((a, b) => {
        if (/BESTPREIS/.test(a.title)) {
          return -1
        } else if (/BESTPREIS/.test(b.title)) {
          return 1
        }
        return a.price - b.price
      })
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
  console.log(url)

  return fetch(url)
      //.then(res => { console.log(res.headers); return res })
      .then(res => {
        console.log(res.ok, res.status)
        if (res.ok && res.status === 200) {
          return res
        } else if (res.status === 404) {
          throw new Error(`LEGO® set number ${id} not found on brickmerge®`)
        }
        throw new Error("brickmerge® nicht erreichbar")
      })
      .then(res => res.json())
      .then(({ offers, url }) => ({
        title: "Bestpreis",
        icon: "https://raw.githubusercontent.com/pke/brickmerge-userscript/master/public/images/brickmerge.svg",
        iconType: "image/svg+xml",
        href: url,
        price: offers?.lowPrice,
        currency: offers?.priceCurrency,
      }));
}

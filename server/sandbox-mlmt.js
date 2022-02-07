const montlimartbrand = require('./sites/montlimart');
var fs = require('fs');

async function sandbox (eshop = 'https://www.montlimart.com/toute-la-collection.html?limit=all') {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop} source`);

    const products = await montlimartbrand.scrape(eshop);

    console.log(products);
    console.log(products.length);

    // let json = JSON.stringify(products);
    // fs.writeFile('myjsonfile.json', json, 'utf8', callback);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
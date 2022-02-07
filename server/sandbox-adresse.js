const adressebrand = require('./sites/adresse');
var fs = require('fs');

async function sandbox (eshop = 'https://adresse.paris/630-toute-la-collection?id_category=630&n=131') {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop} source`);

    const products = await adressebrand.scrape(eshop);

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
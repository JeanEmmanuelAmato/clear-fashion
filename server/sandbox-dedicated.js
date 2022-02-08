const dedicatedbrand = require('./sites/dedicatedbrand');

async function sandbox (eshop = 'https://www.dedicatedbrand.com/en/men/all-men') {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop} source`);

    const products = await dedicatedbrand.scrape(eshop);

    console.log(products);
    console.log(products.length);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);

// for(let i = 1; i < 11; i++) {
//     let eshop = `https://www.dedicatedbrand.com/en/men/all-men?page=${i}`;
//     sandbox(eshop)
// }
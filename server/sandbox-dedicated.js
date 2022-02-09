const dedicatedbrand = require('./sites/dedicatedbrand');

async function sandbox2 (eshop = 'https://www.dedicatedbrand.com/en/men/all-men') {
  try {
    let result = [];
    for (let i = 1; ; i++)
    {
      let eshop = 'https://www.dedicatedbrand.com/en/men/all-men?p=' + i;
      console.log(`🕵️‍♀️  browsing ${eshop} source`);

      let products = await dedicatedbrand.scrape(eshop);
      if (products.length == 0){
        console.log("End of scraping");

        console.log(`Total number of products : ${result.length}\nTotal number of pages ${i-1}`);
        process.exit(0);
      }
      else{
        console.log(products);
        console.log(products.length);
        console.log('done')
        products.forEach(product => result.push(product));
      }
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
sandbox2()
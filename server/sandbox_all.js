const adressebrand = require('./sites/adresse');
const dedicatedbrand = require('./sites/dedicatedbrand');
const montlimartbrand = require('./sites/montlimart');
const fs = require('fs');


async function sandbox () {
  try {
    let results = []
    // for adresse 
    const eshop_adresse = 'https://adresse.paris/630-toute-la-collection?id_category=630&n=131';
    console.log(`🕵️‍♀️  browsing ${eshop_adresse} source`);
    
    const products_adresse = await adressebrand.scrape(eshop_adresse);

    console.log(products_adresse);
    console.log(products_adresse.length);
    products_adresse.forEach(product => results.push(product));

    // for montlimart
    const eshop_montlimart = 'https://www.montlimart.com/toute-la-collection.html'
    console.log(`🕵️‍♀️  browsing ${eshop_montlimart} source`);

    const products_montlimart = await montlimartbrand.scrape(eshop_montlimart);

    console.log(products_montlimart);
    console.log(products_montlimart.length);
    products_montlimart.forEach(product => results.push(product));
    
    // for dedicated 
    let total_products_dedicated = [];
    for (let i = 1; ; i++)
    {
      let eshop = 'https://www.dedicatedbrand.com/en/men/all-men?p=' + i;
      console.log(`🕵️‍♀️  browsing ${eshop} source`);

      let products_dedicated = await dedicatedbrand.scrape(eshop);
      if (products_dedicated.length == 0){
        console.log("End of scraping");

        console.log(`Total number of products : ${total_products_dedicated.length}\nTotal number of pages ${i-1}`);
        break;
      }
      else{
        console.log(products_dedicated);
        console.log(products_dedicated.length);
        console.log('done')
        products_dedicated.forEach(product => total_products_dedicated.push(product));
      }
    }
    total_products_dedicated.forEach(product => results.push(product));
    console.log(`Total number of products scrapped: ${results.length}`)

    // JSON file
    const data = JSON.stringify(results, null, 2);
    //console.log(data);
    fs.writeFileSync('products_for_all_brands.json', data);

    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

sandbox()
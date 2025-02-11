const fetch = require('node-fetch');
const cheerio = require('cheerio');
const {'v5': uuidv5} = require('uuid');

/**
 * Parse webpage restaurant
 * @param  {String} data - html response
 * @return {Object} products
 */

const parse = (data) => {
    const $ = cheerio.load(data, {'xmlMode': true});
    return $('.item').map((i, element)=> {
        const link = `${$(element).find('a').attr('href')}`;
        const released = new Date();

        return {
            "link": link,
            "brand" : "montlimart",
            "price" : parseInt(
                $(element).find('.price').text()
            ),
            "name" : $(element).find('.product-name').text().trim()
            .replace(/\s/g, ' '),
            "photo" : $(element).find('img').attr('src'),
            "_id" : uuidv5(link, uuidv5.URL),  
            "release date" : released.toLocaleDateString()
        };
    }).get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */

 module.exports.scrape = async url => {
    try {
      const response = await fetch(url);
  
      if (response.ok) {
        const body = await response.text();
  
        return parse(body);
      }
  
      console.error(response);
  
      return null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

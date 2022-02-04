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

    return $('.item').map(element => {
        const link = $(element).find('.product-info h2.product-name').attr('href');

        return {
            'link': link,
            'brand' : montlimart,
            'price' : parseInt(
                $(element).find('span.price').text()
            ),
            'name' : $(element).find('.product-name').text(),
            'photo' : $(element).find('.product-image img').attr('src'),
            '_id' : uuidv5(link, uuidv5.URL)
            
                
        };
    }).get();

};
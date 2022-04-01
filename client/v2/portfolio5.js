// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};
let favorites = [];

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const selectBrand = document.querySelector("#brand-select");
const selectFilter = document.querySelector("#filter-select");
const selectSort = document.querySelector("#sort-select");
const spanNbNewProducts = document.querySelector("#nbNewProducts");
const spanLastReleaseDate = document.querySelector("#last-release-date");
const spanP50 = document.querySelector("#p50");
const spanP90 = document.querySelector("#p90");
const spanP95 = document.querySelector("#p95");
//const listOfItemsForAddingInFavorite = document.querySelector("#favorites-setup");
let btn = document.querySelector("input");

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */

const setCurrentProducts = (products) => {
  currentProducts = products.products;
  currentPagination = products.meta;
};

/**
 * Set up url for fetch 
 *
 * @return {string}
 */

const setURL = (page = 1, size = 12) => {
    let url = `https://server-livid-ten.vercel.app/products/search?limit=${size}&currentPage=${page}`
    
    if (selectBrand.value != '' && selectBrand.value != 'All brands'){
        url = url + `&brand=${selectBrand.value}`;
    }
    switch(selectSort.value){
        case 'price-asc':
            url = url + '&sortby=price.1';
            break;
        case 'price-desc':
            url = url + '&sortby=price.-1';
            break;
        case 'date-asc':
            url = url + '&sortby=date.1';
            break;
        case 'date-desc':
            url = url + '&sortby=date.-1';
            break;
        default:

    }
    switch(selectFilter.value){
        case 'By reasonable price':
            url = url + '&price=51';
            break;
        case 'By recently released':
            break;
        case 'By favorite':
            url = 'no url';
        default:

    }
    
    return url;

}

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */

 const fetchProducts2 = async (page = 1, size = 12) => {
    try {
        const url = setURL(page, size);
        if (url != 'no url'){
            if(selectFilter.value == 'By recently released'){
                const response = await fetch(url);
                const body = await response.json();
                
                body.products = body.products.filter(product => compareReleasedToToday(product['released date']) <= 1.2096e9);

                const meta = setPaginationFavorites(page, size, body.products.length);
                let productsRender = [];
                let start = -size;
                start = start + page*size;
                if (page == meta.pageCount){
                    productsRender = body.products.slice(start);
                }
                else{
                    productsRender = body.products.slice(start, start + size);
                }
                const bodyRecent = {
                    "products": productsRender,
                    "meta": meta
                };

                return bodyRecent;
            }
            else{
                const response = await fetch(url);
                const body = await response.json();
                return body;
            }
            // const response = await fetch(url);
            // const body = await response.json();
            // return body;
            
        }
        else {
            favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (selectBrand.value != '' && selectBrand.value != 'All brands'){
                favorites = favorites.filter(product => product.brand == selectBrand.value);
            }
            switch(selectSort.value){
                case 'price-asc':
                    favorites = favorites.sort(comparePrice);
                    break;
                case 'price-desc':
                    favorites = favorites.sort(comparePrice).reverse();
                    break;
                case 'date-asc':
                    favorites = favorites.sort(compareDate);
                    break;
                case 'date-desc':
                    favorites = favorites.sort(compareDate).reverse()
                    break;
                default:
        
            }
            const meta = setPaginationFavorites(page, size, favorites.length);
            let productsFavorite = [];
            let start = -size;
            start = start + page*size;
            if (page == meta.pageCount){
                productsFavorite = favorites.slice(start);
            }
            else{
                productsFavorite = favorites.slice(start, start + size);
            }
            const body = {
                "products": productsFavorite,
                "meta": meta
            };
            return body;
        }
    } catch (error) {
        console.log(error);
        return {currentProducts, currentPagination};
    }
  };
  
const setPaginationFavorites = (page, limit, count) => {
    const pageCount = Math.ceil(count/limit);
    const meta = {
        "currentPage": page,
        "pageCount": pageCount,
        "pageSize": limit,
        "count": count
    }
    return meta;
}

/**
 * Render list of products
 * @param  {Array} products
 */

const renderProducts = products => {
  let count = -1;
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product._id}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
        <button class="button" onclick = "${count = counter(count)},addToFav('${count}')" >Add to favorites</button>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

function counter(count) {
  return count + 1;
}

  
/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

/**
 * Render page selector
 * @param  {Object} pagination
 */

const renderIndicators = pagination => {
  const {count} = pagination;

  spanNbProducts.innerHTML = count;
};

/**
 * Render the total number of new products available (feature 9)
 * @param {Object} pagination 
 */

const renderNbNewProducts = async (pagination) => {
  const response = await fetch(
    `https://server-livid-ten.vercel.app/products/search?limit=40000` // à revoir car en dur actuellement
  );
  const body = await response.json();

  spanNbNewProducts.innerHTML = body.products.filter(product => compareReleasedToToday(product.released) <= 1.2096e9).length;
}

/**
 * Render the last release date (feature 11)
 * @param {Object} pagination 
 */

 const renderLastReleaseDate = async (pagination) => {
  const response = await fetch(
    `https://server-livid-ten.vercel.app/products/search?limit=40000` // à revoir car en dur actuellement
  );
  const body = await response.json();

  spanLastReleaseDate.innerHTML = body.products.sort(compareDate)[body.products.length-1]["release date"];
}

/**
 * Render percentile price value (feature 10)
 * @param {Object} products 
 */

const renderPercentile = async (pagination, p, spanP) => {
  const response = await fetch(
    `https://server-livid-ten.vercel.app/products/search?limit=40000` // à revoir car en dur actuellement
  );
  const body = await response.json();

  body.products.sort(comparePrice);

  let k = Math.floor(p*pagination.count/100);

  spanP.innerHTML = body.products[k].price;

}

/**
 * Render brandselector (feature 2)
 * @param {Array} products 
 */

const renderBrands = async() => {
  const response = await fetch(
    `https://server-livid-ten.vercel.app/products/brands`
  );
  const body = await response.json();
  const brandsNames = body.brands;
  let options = Array.from(brandsNames, brandname => `<option value="${brandname}">${brandname}</option>`);
  options.unshift("<option value='All brands'>All Brands</option>");
  options = options.join('');
  
  selectBrand.innerHTML = options;
}



const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
};


const renderInfo = (products, pagination) =>{
    renderIndicators(pagination);
    renderNbNewProducts(pagination);
    renderLastReleaseDate(pagination);
    renderBrands();
    renderPercentile(pagination, 50, spanP50);
    renderPercentile(pagination, 90, spanP90);
    renderPercentile(pagination, 95, spanP95);
}
/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', event => {
  fetchProducts2(1, parseInt(event.target.value))
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts2();
  
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
  renderInfo(currentProducts, currentPagination);
});

// Feature 1 - Browse pages 
/**
 * Select the number of page to display
 * @type {[type]}
 */
 
selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts2(parseInt(event.target.value), parseInt(selectShow.value));

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
  
});

// Feature 2 - Filter by brands
/**
 * Select the brand to filter
 * @type {[type]}
 */

 selectBrand.addEventListener('change', async (event) => {
    const products = await fetchProducts2(1, parseInt(selectShow.value));

    setCurrentProducts(products);
    render(currentProducts, currentPagination);
    //renderInfo(currentProducts, currentPagination);
  })
  
  // Features 3, 4 and 15 - Filter by recent products, reasonable priced, and favorite products
  
  function compareReleasedToToday(released){
    let today = new Date();
    released = new Date(released);
    return today - released;
  }
  
  selectFilter.addEventListener('change', async (event) => {
    const products = await fetchProducts2(1, parseInt(selectShow.value));
    
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
    //renderInfo(currentProducts, currentPagination);
  })
  
  // Features 5 and 6 - Sort by Price and Date  
  
  function comparePrice(a,b){
    return a.price - b.price;
  }
  
  function compareDate(a,b){
    a = new Date(a.released);
    b = new Date(b.released);
    return a - b;
  }
  
  selectSort.addEventListener('change', async (event) => {
    const products = await fetchProducts2(currentPagination.currentPage, currentPagination.pageSize);

    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  })
  
  // Feature 9 - Number of recent products indicator : cf the render part 
  
  // Feature 10 - p50, p90 and p95 price value indicator : cf the render part 
  
  // Feature 11 - Last released date indicator : cf the render part
  
  // Feature 13 - Save as favorite 

const addToFav = async(index) => {
    //console.log(index);
    favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let productToAddFav = currentProducts[index];

    if (favorites.length == 0) {
      favorites.push(productToAddFav);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      window.alert(`Le produit "${productToAddFav.name}" de la marque "${productToAddFav.brand}" vient d'être ajouté à vos favoris.`);
    }
    else
    {
      const idList = favorites.map(product => product._id);
      if (idList.includes(productToAddFav._id)){
        let deleteProduct = window.confirm(`Le produit "${productToAddFav.name}" de la marque "${productToAddFav.brand}" a déjà été ajouté à vos favoris...Voulez vous le supprimer de vos favoris ?`);
        if(deleteProduct){
          favorites = favorites.filter(product => product._id != productToAddFav._id);
          localStorage.setItem('favorites', JSON.stringify(favorites));
          window.alert("Produit Supprimé");

          const products = await fetchProducts2();
    
          setCurrentProducts(products);
          render(currentProducts, currentPagination);
        }
        else {
          window.alert("Le produit n'a pas été supprimé de vos favoris.");
        }
      }
      else{
        favorites.push(productToAddFav);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        window.alert(`Le produit "${productToAddFav.name}" de la marque "${productToAddFav.brand}" vient d'être ajouté à vos favoris.`);
      }
    }
  };






























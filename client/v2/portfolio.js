// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

// current products on the page
let currentProducts = [];
let currentPagination = {};

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
//const btn = document.querySelector('.favButton');

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */

const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */

const fetchProducts = async (page = 1, size = 12) => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */

const renderProducts = products => {
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}">${product.name}</a>
        <span>${product.price}</span>
        <span><button class="favButton">Add to favorite</button></span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
  sectionProducts.appendChild(fragment);
};

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
    `https://clear-fashion-api.vercel.app?page=1&size=${pagination.count}` // à revoir car en dur actuellement
  );
  const body = await response.json();

  spanNbNewProducts.innerHTML = body.data.result.filter(product => compareReleasedToToday(product.released) <= 1.2096e9).length;
}

/**
 * Render the last release date (feature 11)
 * @param {Object} pagination 
 */

 const renderLastReleaseDate = async (pagination) => {
  const response = await fetch(
    `https://clear-fashion-api.vercel.app?page=1&size=${pagination.count}` // à revoir car en dur actuellement
  );
  const body = await response.json();

  spanLastReleaseDate.innerHTML = body.data.result.sort(compareDate)[body.data.result.length-1].released;
}

/**
 * Render brandselector
 * @param {Array} products 
 */

const renderBrands = products => {
  const brandsNames = [];
  products.forEach(product => {
    if (!brandsNames.includes(product.brand)){
      brandsNames.push(product.brand);
    }
  })
  let options = Array.from(brandsNames, brandname => `<option value="${brandname}">${brandname}</option>`);
  options.unshift("<option value='none'>none</option>");
  options.unshift("<option disabled value='null'>Select a brand</option>");
  //console.log(options);
  options = options.join('');
  //console.log(options);
  selectBrand.innerHTML = options;
}

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
  renderNbNewProducts(pagination);
  renderLastReleaseDate(pagination);
  renderBrands(products);
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 * @type {[type]}
 */
selectShow.addEventListener('change', event => {
  fetchProducts(1, parseInt(event.target.value))
    .then(setCurrentProducts)
    .then(() => render(currentProducts, currentPagination));
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

// Feature 1 - Browse pages 
/**
 * Select the number of page to display
 * @type {[type]}
 */
 
selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize);

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

// Feature 2 - Filter by brands
/**
 * Select the brand to filter
 * @type {[type]}
 */

selectBrand.addEventListener('click', async (event) => {
  
  if (event.target.value == "none"){
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
  else{
    const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

    products.result = products.result.filter(product => product.brand == event.target.value);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
})

// Features 3 and 4 - Filter by recent products and reasonable price

function compareReleasedToToday(released){
  let today = new Date();
  released = new Date(released);
  return today - released;
}

selectFilter.addEventListener('change', async (event) => {
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

  if (event.target.value == "By reasonable price"){
    products.result = products.result.filter(product => product.price <= 50);
  }
  else if (event.target.value == "By recently released"){
    products.result = products.result.filter(product => compareReleasedToToday(product.released) <= 1.2096e9);
  }
  else{}

  setCurrentProducts(products);
  render(currentProducts, currentPagination);

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
  const products = await fetchProducts(currentPagination.currentPage, currentPagination.pageSize);

  if (event.target.value == "price-asc"){
    products.result = products.result.sort(comparePrice);
  }
  else if (event.target.value == "price-desc"){
    products.result = products.result.sort(comparePrice).reverse();
  }
  else if (event.target.value == "date-asc"){
    products.result = products.result.sort(compareDate);
  }
  else if (event.target.value == "date-desc"){
    products.result = products.result.sort(compareDate).reverse();
  }
  else{}

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
})

// Feature 9 - Number of recent products indicator : cf the render part 

// Feature 10 - p50, p90 and p95 price value indicator : cf the render part 

// Feature 11 - Last released date indicator : cf the render part

// Feature 13 - Save as favorite 

// btn.addEventListener("click", event => {
//   console.log("hello");
// })




































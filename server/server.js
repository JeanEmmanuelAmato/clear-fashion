const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb+srv://AmatoJeanEmmanuel:clearfashion@clearfashion.yjbvj.mongodb.net/ClearFashion?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'clearfashion';
const products = require('./products_for_all_brands.json');
let db, collection;

const connect = async () => {
    try{
        const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
        db =  client.db(MONGODB_DB_NAME);
        console.log(`Connected to ${MONGODB_DB_NAME}...`);
        // console.log(db);
    }catch(e){
        console.error(e);
    } 
}

const insertProduct = async () => {
    try {
        await connect();
        collection = db.collection('products');
        const result = collection.insertMany(products);
        console.log(result);
    }
    catch(e){
        console.error(e);
    }
}

//insertProduct()
const findProductBrand = async (brand) => {
    const products = await collection.find({brand:brand}).toArray();

    console.log(products);
}

const findProductLessThanPrice = async (price) => {
    const products = await collection.find({price : {$lt:price}}).toArray();

    console.log(products);
}

const findProductSortedByPrice = async () => {
    const products = await collection.find().sort({price: 1}).toArray();

    console.log(products);
} 

const doSomeStuff = async () => {
    try {
        await connect();
        collection = db.collection('products');

        // some functions 
        const brands =["adresse", "montlimart", "dedicated"]
        findProductBrand(brands[1])

        findProductLessThanPrice(50)

        findProductSortedByPrice()
    }
    catch(e){
        console.error(e);
    }
}

doSomeStuff()

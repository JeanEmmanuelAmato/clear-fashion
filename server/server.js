const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb+srv://AmatoJeanEmmanuel:clearfashion@clearfashion.yjbvj.mongodb.net/ClearFashion?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'clearfashion';
//const products = require('products_for_all_brands')
let db, collection;

const connect = async () => {
    try{
        const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
        db =  client.db(MONGODB_DB_NAME);
        console.log(`Connected to ${MONGODB_DB_NAME}...`);
        console.log(db);
    }catch(e){
        console.error(e);
    } 
}

connect()


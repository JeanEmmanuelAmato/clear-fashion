const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { calculateLimitAndOffset, paginate } = require('paginate-info');

let db, collection;
const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb+srv://AmatoJeanEmmanuel:clearfashion@clearfashion.yjbvj.mongodb.net/ClearFashion?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'clearfashion';

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

const connect = () => {
  console.log("Trying to connect...");
  MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true}, (error, client)=>{
    if(error) {
      throw error;
  }
    db = client.db(MONGODB_DB_NAME);
    collection = db.collection("products");
    console.log("Connected to `" + MONGODB_DB_NAME + "`!");
    app.listen(PORT);
  });
};

// const connect2 = async () => {
//   try{
//     console.log("Trying to connect to database...");
//     const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
//     db =  client.db(MONGODB_DB_NAME);
//     collection = db.collection("products");
//     console.log(`Connected to ${MONGODB_DB_NAME}...`);
//     app.listen(PORT);
//   }catch(e){
//       console.error(e);
//   } 
// }


connect();
//console.log("Je passe la meeec");
app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/products/search', async(request, response) => {
  // limit/brand/price/sortby/currentPage/
  try {
    let limit = 12;
    let filter = request.query;
    let sortby = "";
    let products;
    let currentPage = 1;
    let count = 0;
    if ("limit" in filter) {
      limit = parseInt(request.query.limit);
      delete filter["limit"];
    }
    if ("sortby" in filter) {
      sortby = request.query.sortby;
      delete filter["sortby"];
    }
    if ("price" in filter) {
      filter["price"] = {$lt:parseInt(filter["price"])}
    }
    if ("currentPage" in filter)
    {
      currentPage = parseInt(request.query.currentPage);
      delete filter["currentPage"];
    }

    let {offset} = calculateLimitAndOffset(currentPage, limit);

    switch (sortby){
      case "price":
        totalProducts = await collection.find(filter).sort({price: 1}).toArray();
        count = totalProducts.length;
        products = await collection.find(filter).sort({price: 1}).skip(offset).limit(limit).toArray();
        break;
      case "date":
        totalProducts = await collection.find(filter).sort({"release date": 1}).toArray();
        count = totalProducts.length;
        products = await collection.find(filter).sort({"release date": 1}).skip(offset).limit(limit).toArray();
        break;
      default:
        totalProducts = await collection.find(filter).toArray();
        count = totalProducts.length;
        products = await collection.find(filter).skip(offset).limit(limit).toArray();
    }
  
    const meta = paginate(currentPage, count, products, limit);
    response.send({products, meta});
    
  }catch (error) {
    response.status(500).send(`${error.message}`);
  }
});

app.get("/products", async(request, response) => {
  try{
    let products = await collection.find({}).toArray();
    response.send(products);
  }
  catch (error) {
    response.status(500).send(error);
  }
});

app.get("/products/:id", (request, response) => {
  console.log(collection)
  collection.findOne({ "_id": request.params.id }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});


//console.log(`📡 Running on port ${PORT}`);

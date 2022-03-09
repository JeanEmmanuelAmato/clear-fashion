const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb+srv://AmatoJeanEmmanuel:clearfashion@clearfashion.yjbvj.mongodb.net/ClearFashion?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'clearfashion';
//const {ObjectId} = require('mongodb');

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.get('/products/search', (request, response) => {
  const brand = request.query.brand;
  collection.findOne({"brand": brand}, (error, result) => {
    if(error) {
        return response.status(500).send(error);
    }
    response.send(result);
  });
});

app.get("/products/:id", (request, response) => {
  collection.findAll({ "_id": request.params.id }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});


app.listen(PORT, () => {
  MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true}, (error, client)=>{
    if(error) {
      throw error;
  }
    db = client.db(MONGODB_DB_NAME);
    collection = db.collection("products");
    console.log("Connected to `" + MONGODB_DB_NAME + "`!");
  });

});

console.log(`📡 Running on port ${PORT}`);


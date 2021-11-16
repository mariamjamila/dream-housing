const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const { ObjectId } = require("bson");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nfwxj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Housing");
    const houseCollection = database.collection("homes");
    const usersCollection= database.collection('users');
    const orderCollection = database.collection('orders');
    const reviewsCollection = database.collection('reviews');
    app.get("/houses", async (req, res) => {
    
      const cursor = houseCollection.find({});
      console.log(cursor);
      const result = await cursor.toArray([]);
      console.log(result);
      res.json(result);
    });
    app.get("/besthouses", async (req, res) => {
    
      const cursor = houseCollection.find({}).limit(6);
      console.log(cursor);
      const result = await cursor.toArray([]);
      console.log(result);
      res.json(result);
    });
    app.get("/purchase/:id", async (req, res) => {
      const id = req.params.id;
      const result = await houseCollection.findOne({_id: ObjectId(id)});
     
      res.json(result);
    });
    app.post('/purchase/:id', async(req,res)=>{
      const user = req.body;
      const houseid = req.params.id;
      const orderData = {...user, approved:false, houseid: houseid};
      const result = await orderCollection.insertOne(orderData);

      res.json(result)
    })
    app.put('/purchase/:id', async(req,res)=>{
      const houseid = req.params.id;
      const updateDoc = {
        $set:{
          approved: true
        }
      }
      const result = await usersCollection.updateOne({_id: ObjectId(req.params.id)}, updateDoc);

      res.json(result);
    });
    app.post('/addProduct', async(req, res)=>{
      const product = req.body;
      const result = await houseCollection.insertOne(product);
      res.send(result);
    })
    app.post('/myOrder',async(req, res)=>{
      const user = req.body.user;

      const cursor = await orderCollection.find({email : user})
      const orders = await cursor.toArray([]);

      const response = [];
      
      for(order of orders){
        const house = await houseCollection.findOne({_id: ObjectId(order.houseid)});
        const orderObj = {...order, house: house};
        response.push(orderObj);
      }
    
        
        

      console.log(response)
      res.json(response);
        
    });
    app.get('/allOrders',async(req, res)=>{
      const user = req.body.user;

      const cursor = await orderCollection.find({})
      const orders = await cursor.toArray([]);

      const response = [];
      
      for(order of orders){
        const house = await houseCollection.findOne({_id: ObjectId(order.houseid)});
        const orderObj = {...order, house: house};
        response.push(orderObj);
      }
    
        
        

      console.log(response)
      res.json(response);
        
    })
    app.get('/users/:email', async(req, res)=>{
         const email = req.params.email;
         const query ={email: email};
         const user = await usersCollection.findOne(query)
         let isAdmin= false;
         if (user?.role==='admin'){
            isAdmin = true;

         }
         res.json({admin: isAdmin})
    })
    app.post('/users', async(req, res)=>{
       const user =req.body;
       const cursor = await usersCollection.insertOne(user)
       const filter = {email: user.email}
       const updateDoc = {
         $set:user
       }
       const result = await usersCollection.updateOne(filter, updateDoc) 
        res.json(result)
        
    });
    app.post('/addReview', async (req, res) => {
 
      const cursor = await reviewsCollection.insertOne(req.body);
      res.json(result);
    });
    app.get('/reviews', async (req, res) => {
      const cursor = await reviewsCollection.find({});
      const reviews = await cursor.toArray([]);

      res.json(reviews);

    });
    app.put('/users/admin', async(req,res)=>{
      const user = req.body;
    
      const filter = {email: user.email}
      const updateDoc = {$set:{role:'admin'}}
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.json(result)
    });
    app.delete('/myOrder/:id', async(req,res)=>{
      const orderid = req.params.id;
      const response = await orderCollection.deleteOne({_id: ObjectId(orderid)});
      res.json(response);

    });
    app.delete('/manageProducts/:id', async(req,res)=>{
      const houseid = req.params.id;
      const response = await houseCollection.deleteOne({_id: ObjectId(houseid)});
      res.json(response);

    });
  } finally {

  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello Housing!");
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

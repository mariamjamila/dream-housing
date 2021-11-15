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
      const result = await orderCollection.insertOne(user)
      res.json(result)
    })
    app.post('/myOrder',async(req, res)=>{
      const user = req.body.user;
      console.log(user);
      const cursor = await orderCollection.find({email : user})
      const result = await cursor.toArray([]);

      const house = await houseCollection.findOne({_id: ObjectId(result._id)})
      console.log(house);
      console.log('hello world')
      console.log(result)
      res.json(result);
        
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
        
    })

    app.put('/users/admin', async(req,res)=>{
      const user = req.body;
    
      const filter = {email: user.email}
      const updateDoc = {$set:{role:'admin'}}
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.json(result)
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

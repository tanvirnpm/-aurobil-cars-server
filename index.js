const express = require('express')
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const port = 5000
app.use(cors())
app.use(bodyParser.json())

const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2blon.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db(`${process.env.DB_NAME}`);
        const userCollection = database.collection(`${process.env.DB_TABLE_USER}`);
        const reviewCollection = database.collection(`${process.env.DB_TABLE_REVIEW}`);
        const productCollection = database.collection(`${process.env.DB_TABLE_PRODUCT}`);
        const ordersCollection = database.collection(`${process.env.DB_TABLE_ORDERS}`);

        // add a new user
        app.post('/user', async (req, res)=>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result)
        })

        // add a new product/car
        app.post('/add-product', async (req, res)=>{
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.json(result)
        })
        // add a user review
        app.post('/add-review', async (req, res)=>{
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result)
        })
        // make an order
        app.post('/make-order', async (req, res)=>{
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result)
        })
        // get all user
        app.get('/get-user', async (req, res)=>{
            const allUser = await userCollection.find({}).toArray();
            res.send(allUser)
        })
        // get all orders
        app.get('/get-all-orders', async (req, res)=>{
            const orders = await ordersCollection.find({}).toArray();
            res.send(orders)
        })
        // get all reviews
        app.get('/get-all-reviews', async (req, res)=>{
            const reviews = await reviewCollection.find({}).toArray();
            res.send(reviews)
        })
        // get all products/cars
        app.get('/get-all-products', async (req, res)=>{
            const allProducts = await productCollection.find({}).toArray();
            res.send(allProducts)
        })

        // get user by email
        app.get('/get-user/:email', async (req,res)=>{
            const userByEmail = await userCollection.find({email: req.params.email}).toArray();
            res.send(userByEmail)
        })
        // get order by email
        app.get('/get-order/:email', async (req,res)=>{
            const orderByEmail = await ordersCollection.find({email: req.params.email}).toArray();
            res.send(orderByEmail)
        })
        // get product/car by chassis number
        app.get('/get-product/:chassis', async (req,res)=>{
            const carByChassis = await productCollection.find({chassis: req.params.chassis}).toArray();
            res.send(carByChassis)
        })

        // make an admin
        app.put('/make/admin/:email', async (req,res)=>{
            const userEmail = req.params.email;
            const filter = {email: userEmail};
            const options = { upsert: true}
            const updateDoc = {
                $set: {
                    admin: true,
                    user: false
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })
        // order to shipped
        app.put('/order/shipped/:id', async (req,res)=>{
            const id = req.params.id;
            const filter = {_id: ObjectId(id)};
            const options = { upsert: true}
            const updateDoc = {
                $set: {
                    status: 'Shipped'
                }
            }
            const result = await ordersCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port || process.env.PORT, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
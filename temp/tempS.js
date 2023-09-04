
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://<username>:<password>@cluster0.rgfriso.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const database = client.db('hungry_bunny');
        const blogsCollection = database.collection('blogs');
        // ----------------- This is playground -----------------

        router.get('/', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 5;
            const skip = (page - 1) * limit;

            const cursor = blogsCollection.find().limit(limit).skip(skip);
            const total = await blogsCollection.estimatedDocumentCount();
            const result = await cursor.toArray();
            res.send(result);
        });


        // ----------------- This is playground -----------------

        router.get('/', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 6;
            const skip = (page - 1) * limit;

            const cursor = restaurantCollection.find().limit(limit).skip(skip);
            const total = await restaurantCollection.estimatedDocumentCount();
            const result = await cursor.toArray();
            res.send(result);
        });
         // ----------------- This is playground -----------------

         router.get('/', async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const cursor = faqCollection.find().limit(limit).skip(skip);
            const total = await faqCollection.estimatedDocumentCount();
            const result = await cursor.toArray();
            res.send(result);
        });

// ----------------- This is playground -----------------






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);

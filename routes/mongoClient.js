const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connect() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected second database!");
    return client;
  } catch (err) {
    console.log(err);
  }
}

async function mongoMiddleware(req, res, next) {
  const client = await connect();
  const database = client.db('hungry_bunny');
  const communityPostCollection = database.collection('community_post');
  const usersCollection = database.collection('users');
  const restaurantCollection = database.collection('restaurant');
  const blogsCollection = database.collection('blogs');
  const faqCollection = database.collection('faq');
  const applicationCollection = database.collection('applications');
  req.mongo = {
    client,
    database,
    communityPostCollection,
    usersCollection,
    restaurantCollection,
    blogsCollection,
    faqCollection,
    applicationCollection
  };
  next();
}

module.exports = mongoMiddleware;
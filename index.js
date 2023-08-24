require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = 5000 || process.env.PORT;
const jwt = require('jsonwebtoken');

const userRouter = require('./routes/userRouter');
// Middleware
app.use(cors());
app.use(express.json());

app.use('/users', userRouter);

// Routes
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'Unauthorize access' })
    }
    const token = authorization?.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ error: true, message: 'forbidden user or token has expired' })
        }
        req.decoded = decoded;
        next()
    })
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rgfriso.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
// const user = ;
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const database = client.db('hungry_bunny');
        const usersCollection = database.collection('users');
        const communityPostCollection = database.collection('community_post');
        const restaurantCollection = database.collection('restaurant');

        app.get('/restaurant', async (req, res) => {
            const cursor = restaurantCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/restaurant/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: new ObjectId(id) }
            const result = await restaurantCollection.findOne(query);
            res.send(result)
        })

        app.post('/set-token', (req, res) => {
            const user = req.body;
            // console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '24h' })
            res.send({ token });
        });



        app.post('/user-info', async (req, res) => {
            const data = req.body;
            const result = await usersCollection.insertOne(data);
            res.send(result);
        });


        app.get('/user-info/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.findOne({ email: email });
            res.send(result);
        });
        app.get('/user-info/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const result = await usersCollection.findOne({ email: email }, { projection: { post: 1, _id: 0 } });
            res.send(result.post);
        });
        // Community Post Routes here

        app.get('/community-post', async (req, res) => {
            const result = await communityPostCollection.find({}).sort({ posted: -1 }).toArray();
            res.send(result);
        });
        // Create a new post
        app.post('/community-post/', verifyJWT, async (req, res) => {
            const data = req.body;
            // Add post 
            const result = await communityPostCollection.insertOne(data);
            res.send(result);
        });
        app.delete('/community-post/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const result = await communityPostCollection.deleteOne({ _id: new ObjectId(id) });
            res.send(result);
        });
        // update user info with post data . 
        app.put('/community-post/:userID', verifyJWT, async (req, res) => {
            const userID = req.params.userID;
            const data = req.body;
            const result = await usersCollection.updateOne({ _id: new ObjectId(userID) }, { $push: { posts: data.postId } });
            res.send(result);
        });

        // Add comment to post
        app.put('/community-post/comment/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = {
                _id: new ObjectId(id),
            }
            const update = {
                $push: {
                    comments: data
                }
            }
            const result = await communityPostCollection.updateOne(filter, update);
            res.send(result);
        });

        // Get only comment via post id
        app.get('/community-post/comment/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const project = { projection: { comments: 1, _id: 0 } };
            const result = await communityPostCollection.findOne(filter, project);
            res.send(result.comments);
        });

        // Update likes
        app.put('/community-post/like/:id/:userID', async (req, res) => {
            const id = req.params.id;
            const userID = req.params.userID;
            const user = await usersCollection.findOne({ _id: new ObjectId(userID) });
            if (user.likedPost.includes(id)) {
                const result = await communityPostCollection.updateOne({ _id: new ObjectId(id) }, { $inc: { likes: -1 }, $pull: { likedBy: userID } });
                const result2 = await usersCollection.updateOne({ _id: new ObjectId(userID) }, { $pull: { likedPost: id } });
                res.send({ result, result2 });
            } else {
                // user hasn't liked the post, add like
                const result = await communityPostCollection.updateOne({ _id: new ObjectId(id) }, { $inc: { likes: 1 }, $push: { likedBy: userID } });
                const result2 = await usersCollection.updateOne({ _id: new ObjectId(userID) }, { $push: { likedPost: id } });
                res.send({ result, result2 });
            }
        });












        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
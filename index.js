require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const userRouter = require('./routes/userRouter');
const communityRouter = require('./routes/communityRouter');
const restaurantRouter = require('./routes/restaurantRouter');

// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Replace with the correct origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express.json());

const server = http.createServer(app);

// Routes
app.use('/user-info', userRouter);
app.use('/community-post', communityRouter)
app.use('/restaurant', restaurantRouter)

const uri = process.env.MONGODB_URI;

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
        client.connect();
        const database = client.db('hungry_bunny');
        const usersCollection = database.collection('users');
        const communityPostCollection = database.collection('community_post');
        const restaurantCollection = database.collection('restaurant');

        // Socket.io chat server
        // Socket.io integration

        const io = socketIo(server, {
            cors: {
                origin: '*', // allow to server to accept request from different origin
            }
        });
        io.on('connection', (socket) => {
            console.log('A user connected');

            socket.on('message', (message) => {
                io.emit('message', message);
            });

            socket.on('disconnect', () => {
                console.log('A user disconnected');
            });
        });
        app.post('/set-token', (req, res) => {
            const user = req.body;
            // console.log(user)
            const token = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '24h' })
            res.send({ token });
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

server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
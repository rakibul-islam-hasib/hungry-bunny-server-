require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const userRouter = require('./routes/userRouter');
const communityRouter = require('./routes/communityRouter');
const restaurantRouter = require('./routes/restaurantRouter');
const mongoMiddleware = require('./routes/mongoClient');
const blogsRouter = require('./routes/blogsRouter');
const faqRouter = require('./routes/faqRouter');
const application = require('./routes/applicationsRoute');
const foodRoute = require('./routes/foodRoute');
const cartRoute = require('./routes/cartRoute');
const payment = require('./routes/paymentRoute');
const foodOrderRoute = require('./routes/foodOrderRoute');

// Middleware
app.use(cors({
    origin: '*', // Replace with the correct origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(express.json());
app.use(mongoMiddleware);   // Connect to MongoDB
const server = http.createServer(app);



// Routes
app.use('/user-info', userRouter);
app.use('/community-post', communityRouter)
app.use('/restaurant', restaurantRouter)
app.use('/blogs', blogsRouter)
app.use('/faq', faqRouter)
app.use('/application', application)
app.use('/food', foodRoute)
app.use('/cart', cartRoute)
app.use('/payment', payment)
app.use('/food-order', foodOrderRoute)


// Socket.io
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
    const token = jwt.sign(user, process.env.ACCESS_SECRET, { expiresIn: '24h' })
    res.send({ token });
});


app.get('/', (req, res) => {
    res.send(`
    <h1> Hungry Bunny API </h1>
    <p> This is server for Hungry Bunny </p>
    <h5> Created by: The Web Warriors</h5>
    <h5>Server is running on ${port}</h5>
    `);
});

server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
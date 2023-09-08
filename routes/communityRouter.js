const express = require('express');
const router = express.Router();
const mongoMiddleware = require('./mongoClient');
const verifyJWT = require('../middleware/verifyJWT');
const { ObjectId } = require('mongodb');

router.use(mongoMiddleware);

router.get('/', async (req, res) => {
    const result = await req.mongo.communityPostCollection.find({}).sort({ posted: -1 }).toArray();
    res.send(result);
});

router.get('/comment/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const project = { projection: { comments: 1, _id: 0 } };
    const result = await req.mongo.communityPostCollection.findOne(filter, project);
    res.send(result.comments);
});


router.post('/', verifyJWT, async (req, res) => {
    const data = req.body;
    // Add post 
    const result = await req.mongo.communityPostCollection.insertOne(data);
    res.send(result);
});
router.delete('/:id', verifyJWT, async (req, res) => {
    const id = req.params.id;
    const result = await req.mongo.communityPostCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
});
// update user info with post data . 
router.put('/:userID', verifyJWT, async (req, res) => {
    const userID = req.params.userID;
    const data = req.body;
    const result = await req.mongo.usersCollection.updateOne({ _id: new ObjectId(userID) }, { $push: { posts: data.postId } });
    res.send(result);
});

// Add comment to post
router.put('/comment/:id', verifyJWT, async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    data._id = new ObjectId();
    const filter = {
        _id: new ObjectId(id),
    }
    const update = {
        $push: {
            comments: data
        }
    }
    const result = await req.mongo.communityPostCollection.updateOne(filter, update);
    res.send(result);
});

// Get only comment via post id
router.get('/comment/:id', async (req, res) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const project = { projection: { comments: 1, _id: 0 } };
    const result = await req.mongo.communityPostCollection.findOne(filter, project);
    res.send(result.comments);
});

// Delete comment via post id and comment id
router.delete('/comment/:id/:commentID', verifyJWT, async (req, res) => {
    const id = req.params.id;
    const commentID = req.params.commentID;
    const filter = { _id: new ObjectId(id) };
    const update = {
        $pull: {
            comments: { _id: new ObjectId(commentID) }
        }
    }
    const result = await req.mongo.communityPostCollection.updateOne(filter, update);
    res.send(result);
});


// Update likes
router.put('/like/:id/:userID', async (req, res) => {
    const id = req.params.id;
    const userID = req.params.userID;
    const user = await req.mongo.usersCollection.findOne({ _id: new ObjectId(userID) });
    if (user.likedPost.includes(id)) {
        const result = await req.mongo.communityPostCollection.updateOne({ _id: new ObjectId(id) }, { $inc: { likes: -1 }, $pull: { likedBy: userID } });
        const result2 = await req.mongo.usersCollection.updateOne({ _id: new ObjectId(userID) }, { $pull: { likedPost: id } });
        res.send({ result, result2 });
    } else {
        // user hasn't liked the post, add like
        const result = await req.mongo.communityPostCollection.updateOne({ _id: new ObjectId(id) }, { $inc: { likes: 1 }, $push: { likedBy: userID } });
        const result2 = await req.mongo.usersCollection.updateOne({ _id: new ObjectId(userID) }, { $push: { likedPost: id } });
        res.send({ result, result2 });
    }
});



module.exports = router;
const verifyAdmin = (req, res, next) => {
    const email = req.decoded.email;
    console.log(email)
    const userCollection = req.mongo.usersCollection;
    const filter = { email: email }
    const user = userCollection.findOne(filter);
    const authorizedError = {
        error: true,
        result: 'You are not authorized to perform this operation',
        solution: 'Please contact the administrator'
    }
    const userNotFoundError = {
        error: true,
        result: 'User not found',
        solution: 'Please contact the administrator'
    }
    if (!user) return res.status(401).send(userNotFoundError)
    else if (user.email !== 'admin') return res.status(401).send(authorizedError)
    // if (user.role !== 'admin') return res.status(401).send(error);
    next();
}
module.exports = verifyAdmin;
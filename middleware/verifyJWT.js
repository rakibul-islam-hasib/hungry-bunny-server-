const jwt = require('jsonwebtoken');
/**
 * Middleware function to verify JWT token in the request header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} - Returns the next middleware function or error response
 */
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    // console.log(authorization)
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

module.exports = verifyJWT;

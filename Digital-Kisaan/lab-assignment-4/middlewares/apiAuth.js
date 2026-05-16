const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized: Missing or invalid token format." });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.apiUser = decoded; // append decoded payload to req
        next();
    } catch (err) {
        return res.status(403).json({ error: "Forbidden: Invalid or expired token." });
    }
};

module.exports = { verifyToken };

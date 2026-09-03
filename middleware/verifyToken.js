const jwt = require('jsonwebtoken');

// Protects private routes by verifying the JWT stored in the httpOnly cookie
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'unauthorized access' });
    }
    req.user = decoded; // { email: ... }
    next();
  });
};

module.exports = verifyToken;

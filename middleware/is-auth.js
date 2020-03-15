const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  //get req header -- Authorization: "Bearer the123456token"
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    req.isAuth = false;
    return next();
  }

  //get token from header
  const token = authHeader.split(' ')[1];

  if (!token || token === '') {
    req.isAuth = false;
    return next();
  }

  //verify token
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
  } catch (err) {
    req.isAuth = false;
    return next();
  }

  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }

  //if valid token
  req.isAuth = true;
  req.userId = decodedToken.userId;
  next();
};

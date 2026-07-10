const jwt = require('jsonwebtoken');

const requireAuth = (req, res, next) => {
  // 1. Look for the token in the request headers
  const token = req.header('Authorization')?.replace('Bearer ', '');

  console.log("THE TOKEN RECEIVED IS:", token);
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied. You must be logged in to do this.' });
  }

  try {
    // 2. Verify the token is real (using the same secret you used in login/register)
    // Note: If you changed process.env.GOOGLE_CLIENT_SECRET to JWT_SECRET earlier, update it here!
    const decoded = jwt.verify(token, process.env.GOOGLE_CLIENT_SECRET);
    
    // 3. Attach the decoded user ID to the request so the next function can use it
    req.user = decoded; 
    
    // 4. Let them pass to the actual route
    next(); 
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = requireAuth;
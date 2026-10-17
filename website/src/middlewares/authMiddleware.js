import { verifyToken } from '../utils/jwtUtils.js';

export const authMiddleware = (req, res, next) => {
  const publicRoutes = ['/loginPage'];

  

  // Check if the request is for a public route
  if (publicRoutes.includes(req.path)) {
    
    const token = req.cookies?.authToken || req.headers.authorization?.split(' ')[1];

    
    
    if (token) {
      try {
        const decoded = verifyToken(token); // Verify token
        req.user = decoded; // Attach user data to request

        // Redirect authenticated users from loginPage to their dashboard

        
        return res.redirect(`/${decoded.role}/dashboard/${decoded.id}`);
      } catch (err) {
        console.error('Token verification failed on public route:', err.message);
      }
    }

    // If no token or invalid token, allow access to public route
    // console.log('No token or invalid token on public route');
    
    return next();
  }

  // For protected routes, check for token
  const token = req.cookies?.authToken || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    // console.log('No token found');
    
    return res.status(401).redirect('/loginPage'); // Redirect to loginPage if no token
  }

  try {
    const decoded = verifyToken(token); // Verify token
    req.user = decoded; // Attach user data to request
    
    next(); // Allow access to the protected route
  } catch (err) {
    console.error('Token verification failed:', err.message);
    // console.log('Token verification failed');
    
    return res.status(401).redirect('/loginPage'); // Redirect if token is invalid
  }
};

import jwt from 'jsonwebtoken';

/**
 * Protects /admin/* routes.
 *
 * Previously every admin endpoint (user blocking, review deletion,
 * Aadhaar approvals, platform stats) was publicly reachable — the only
 * "authentication" was a client-side password check. This middleware
 * requires a short-lived admin JWT issued by POST /admin/verify.
 *
 * The token can be supplied either as an `Authorization: Bearer <token>`
 * header or as an `admin_token` httpOnly cookie.
 */
export const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  let token = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.cookies && req.cookies.admin_token) {
    token = req.cookies.admin_token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required.'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET
    );

    if (decoded.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required.'
      });
    }

    req.admin = { role: 'admin', issuedAt: decoded.iat };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Admin session expired. Please sign in again.'
    });
  }
};

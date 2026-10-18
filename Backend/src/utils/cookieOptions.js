/**
 * Centralised cookie option builder.
 *
 * Secure-by-default: cookies are httpOnly + secure unless explicitly
 * disabled through environment variables (useful for local HTTP dev).
 *
 * Env overrides:
 *   COOKIE_HTTP_ONLY=false  -> allow JS access (NOT recommended)
 *   COOKIE_SECURE=false     -> send over plain HTTP (local dev only)
 *   COOKIE_SAME_SITE=lax    -> same-site policy (default "none" for
 *                              cross-subdomain deployments; requires secure)
 *   COOKIE_DOMAIN=.example.com -> share cookie across subdomains (optional)
 */
export const getCookieOptions = (maxAge) => {
  const options = {
    httpOnly: process.env.COOKIE_HTTP_ONLY !== 'false',
    secure: process.env.COOKIE_SECURE !== 'false',
    sameSite: process.env.COOKIE_SAME_SITE || 'none',
    path: '/',
    maxAge
  };

  // Browsers reject SameSite=None cookies that are not Secure.
  if (options.sameSite === 'none') {
    options.secure = process.env.COOKIE_SECURE !== 'false';
  }

  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
};

export const ACCESS_TOKEN_TTL = 60 * 60 * 1000; // 1 hour
export const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
export const REMEMBER_ME_REFRESH_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

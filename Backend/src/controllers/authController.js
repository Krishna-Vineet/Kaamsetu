import Client from '../models/Client.js';
import Worker from '../models/Worker.js';
import OTP from '../models/OTP.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from "resend";
import { getCookieOptions, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, REMEMBER_ME_REFRESH_TTL } from '../utils/cookieOptions.js';

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, phone, role, password } = req.body;

    // Validate input
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!email) missingFields.push('email');
    if (!phone) missingFields.push('phone');
    if (!role) missingFields.push('role');
    if (!password) missingFields.push('password');
    
    if (missingFields.length > 0) {
      console.log('Missing required fields:', missingFields);
      const isAre = missingFields.length === 1 ? 'is' : 'are';
      const fields = missingFields.join(', ').replace(/, ([^,]*)$/, ' and $1');
      return res.status(400).json({
        success: false,
        message: `${fields} ${isAre} required`
      });
    }

    // Validate role
    if (!['client', 'worker'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid role (client or worker)'
      });
    }

    // Check if user already exists
    const Model = role === 'client' ? Client : Worker;
    const existingUser = await Model.findOne({
      $or: [
        { 'email.email': email.toLowerCase() },
        { 'phone.phone': phone }
      ]
    });

    if (existingUser) {
      // If a permanent user already exists with this email/phone, prevent duplicate registration
      if (!existingUser.isTemporary) {
        console.log('User already exists:', email);
        const field = existingUser.email?.email === email.toLowerCase() ? 'email' : 'phone';
        return res.status(409).json({
          success: false,
          message: `An account with this ${field} already exists. Try logging in or use a different ${field}.`,
          field
        });
      }

      // existingUser is temporary: resend OTP and ask user to verify instead of blocking
      try {
        console.log('Temporary user exists, resending OTP for:', email);

        // Generate a fresh OTP
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Remove any existing OTPs for this email
        await OTP.deleteMany({ data: email.toLowerCase() });

        // Save new OTP
        const otp = new OTP({ data: email.toLowerCase(), code: otpCode });
        await otp.save();

        // Send OTP email (use existing name on the temp account if present)
        await sendOTPEmail(email, otpCode, existingUser.name || name);

        return res.status(200).json({
          success: true,
          message: 'OTP resent. Please verify your email.',
          requiresVerification: true
        });
      } catch (err) {
        console.error('Error resending OTP for temporary user:', err);
        return res.status(500).json({ success: false, message: 'Unable to resend verification code. Please try again later.' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user data
    const userData = {
      name,
      email: { email: email.toLowerCase(), verified: false },
      phone: { phone, verified: false },
      password: hashedPassword,
      isTemporary: true
    };

    // (No-op) We already handled existing temporary users above by resending OTP.

    // Create new user
    const user = new Model(userData);
    await user.save();
    console.log('Temporary user created:', user._id);

    // Generate OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove existing OTP
    await OTP.deleteMany({ data: email.toLowerCase() });

    // Save OTP
    const otp = new OTP({
      data: email.toLowerCase(),
      code: otpCode
    });
    await otp.save();
    console.log('OTP generated and saved');

    // Send OTP email
    await sendOTPEmail(email, otpCode, name);
    console.log('OTP email sent');

    res.json({
      success: true,
      message: 'Registration initiated. Please verify your email.',
      requiresVerification: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  try {
    const { data, code } = req.body;

    // NOTE: never log the OTP itself — treat it like a password.

    if (!data || !code) {
      const missingFields = [];
      if (!data) missingFields.push('email');
      if (!code) missingFields.push('OTP');
      
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(' and ')} ${missingFields.length === 1 ? 'is' : 'are'} required`,
        code: 'MISSING_FIELDS',
        fields: missingFields
      });
    }

    // Find OTP
    const otpRecord = await OTP.findOne({ data: data.toLowerCase() });

    if (!otpRecord) {
      console.log('OTP not found for:', data);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
        code: 'INVALID_OTP'
      });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      console.log('Max attempts reached for:', data);
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please register again.',
        code: 'MAX_ATTEMPTS_REACHED'
      });
    }

    // Verify OTP
    if (otpRecord.code !== code) {
      // Increment failed attempts
      otpRecord.attempts += 1;
      await otpRecord.save();
      
      const remainingAttempts = 3 - otpRecord.attempts;
      let message = 'The OTP you entered is incorrect. ';
      
      if (remainingAttempts > 0) {
        message += `You have ${remainingAttempts} ${remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining.`;
      } else {
        message = 'You have used all your OTP attempts. Please request a new code.';
      }
      
      return res.status(400).json({
        success: false,
        message,
        code: 'INCORRECT_OTP',
        remainingAttempts,
        canRetry: remainingAttempts > 0
      });
    }

    // Find user in both collections
    let user = await Client.findOne({ 'email.email': data.toLowerCase() });
    let role = 'client';

    if (!user) {
      user = await Worker.findOne({ 'email.email': data.toLowerCase() });
      role = 'worker';
    }

    if (!user) {
      console.log('OTP verified but no user found for:', data);
      return res.status(404).json({
        success: false,
        message: 'No account found for this email. Please register first.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Make user permanent and verify email
    user.isTemporary = false;
    user.email.verified = true;
    await user.save();
    console.log('User verified and made permanent:', user._id);

    // Clean up OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { userId: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { userId: user._id, role },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Set auth cookies (secure-by-default: httpOnly + secure)
    res.cookie('access_token', accessToken, getCookieOptions(ACCESS_TOKEN_TTL));
    res.cookie('refresh_token', refreshToken, getCookieOptions(REFRESH_TOKEN_TTL));

    res.json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email.email,
        role
      },
      role
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    // Clear all auth cookies (options must match the ones they were set with)
    const base = getCookieOptions();
    delete base.maxAge;
    res.clearCookie('token', base);
    res.clearCookie('access_token', base);
    res.clearCookie('refresh_token', base);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

// GET /api/auth/verify
export const verifyAuth = async (req, res) => {
  try {
    // Get access token from cookie
    const accessToken = req.cookies.access_token || req.cookies.token;
    
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }
    
    try {
      // Verify the token
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      
      // Find user based on role
      let user;
      if (decoded.role === 'client') {
        user = await Client.findById(decoded.userId);
      } else if (decoded.role === 'worker') {
        user = await Worker.findById(decoded.userId);
      }
      
      if (!user || user.isTemporary) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      }
      
      // User is authenticated
      return res.json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email.email,
          role: decoded.role,
          profilePicture: user.profilePicture,
          blocked: user.blocked === true
        }
      });
    } catch (error) {
      // If token is expired but we have a refresh token, try to refresh
      if (error.name === 'TokenExpiredError' && req.cookies.refresh_token) {
        // Call refreshToken function
        return refreshToken(req, res);
      }
      
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying authentication'
    });
  }
};

// POST /api/auth/refresh-token
export const refreshToken = async (req, res) => {
  try {
    // Get refresh token from cookie
    const refreshToken = req.cookies.refresh_token;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }
    
    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );
    
    // Find user
    let user;
    if (decoded.role === 'client') {
      user = await Client.findById(decoded.userId);
    } else if (decoded.role === 'worker') {
      user = await Worker.findById(decoded.userId);
    }
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link is invalid or has expired. Please request a new one.',
        code: 'INVALID_OR_EXPIRED_TOKEN',
        canRetry: true
      });
    }
    
    // Generate new access token
    const accessToken = jwt.sign(
      { userId: user._id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { userId: user._id, role: decoded.role },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Set new tokens as cookies (secure-by-default: httpOnly + secure)
    res.cookie('access_token', accessToken, getCookieOptions(ACCESS_TOKEN_TTL));
    res.cookie('refresh_token', newRefreshToken, getCookieOptions(REFRESH_TOKEN_TTL));
    
    res.json({
      success: true,
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { data, password, rememberMe } = req.body;

    console.log('Login attempt:', { data, rememberMe });

    if (!data || !password) {
      const missingFields = [];
      if (!data) missingFields.push('email/phone');
      if (!password) missingFields.push('password');
      
      return res.status(400).json({
        success: false,
        message: `${missingFields.join(' and ')} ${missingFields.length === 1 ? 'is' : 'are'} required`
      });
    }

    // Find user in both collections
    let user = await Client.findOne({
      $or: [
        { 'email.email': data.toLowerCase() },
        { 'phone.phone': data }
      ]
    });
    let role = 'client';

    if (!user) {
      user = await Worker.findOne({
        $or: [
          { 'email.email': data.toLowerCase() },
          { 'phone.phone': data }
        ]
      });
      role = 'worker';
    }

    if (user && user.isTemporary) {
      console.log('Temporary user found, please complete registration:', data);
      return res.status(401).json({
        success: false,
        message: 'Please complete your registration first. Check your email for the verification link.',
        code: 'REGISTRATION_INCOMPLETE'
      });
    }
    
    if (!user) {
      console.log('User not found:', data);
      return res.status(404).json({
        success: false,
        message: 'No account found with this email/phone. Please check your details or sign up.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if email is verified
    if (!user.email.verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link or request a new one.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password for user:', user._id);
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please try again or reset your password.',
        code: 'INVALID_CREDENTIALS',
        remainingAttempts: 4 // This should be implemented based on your security requirements
      });
    }

    // Generate access token (short-lived)
    const accessToken = jwt.sign(
      { userId: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // 1 hour
    );
    
    // Generate refresh token (long-lived)
    const refreshToken = jwt.sign(
      { userId: user._id, role },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: rememberMe ? '30d' : '7d' }
    );

    // Set auth cookies (secure-by-default: httpOnly + secure)
    res.cookie('access_token', accessToken, getCookieOptions(ACCESS_TOKEN_TTL));
    res.cookie('refresh_token', refreshToken,
      getCookieOptions(rememberMe ? REMEMBER_ME_REFRESH_TTL : REFRESH_TOKEN_TTL));

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email.email,
        role,
        profilePicture: user.profilePicture,
        blocked: user.blocked === true
      },
      role
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};



// ─────────────────────────────────────────────────────────────────────────────
// Password reset flow
//
//   1. POST /auth/forgot-password   { email }            -> emails a 6-digit OTP
//   2. POST /auth/verify-reset-otp  { data, code }       -> returns a short-lived resetToken
//   3. POST /auth/reset-password    { resetToken, password } -> updates the password
//
// The resetToken is a purpose-scoped JWT (10 min) — it can ONLY be used to
// reset a password, never to authenticate.
// ─────────────────────────────────────────────────────────────────────────────

// POST /auth/resend-otp
// Resends a registration OTP for a temporary (unverified) account.
export const resendOtp = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        code: 'MISSING_FIELDS'
      });
    }

    const email = data.toLowerCase();

    // Only resend for temporary (mid-registration) accounts
    let user = await Client.findOne({ 'email.email': email, isTemporary: true });
    if (!user) {
      user = await Worker.findOne({ 'email.email': email, isTemporary: true });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No pending registration found for this email.',
        code: 'NO_PENDING_REGISTRATION'
      });
    }

    const existing = await OTP.findOne({ data: email });
    if (existing && existing.resendCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many OTP requests. Please wait a few minutes and try again.',
        code: 'RATE_LIMITED'
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ data: email });
    await new OTP({
      data: email,
      code: otpCode,
      resendCount: existing ? existing.resendCount + 1 : 0
    }).save();

    await sendOTPEmail(email, otpCode, user.name);

    return res.status(200).json({
      success: true,
      message: 'A new verification code has been sent.'
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to resend the code. Please try again later.'
    });
  }
};

const RESET_TOKEN_TTL = '10m';

const findPermanentUserByEmail = async (email) => {
  let user = await Client.findOne({ 'email.email': email.toLowerCase(), isTemporary: false });
  if (user) return { user, role: 'client' };
  user = await Worker.findOne({ 'email.email': email.toLowerCase(), isTemporary: false });
  if (user) return { user, role: 'worker' };
  return { user: null, role: null };
};

// POST /auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
        code: 'MISSING_FIELDS'
      });
    }

    const { user } = await findPermanentUserByEmail(email);

    // Anti-enumeration: identical response whether or not the account exists.
    if (!user) {
      return res.status(200).json({
        success: true,
        email,
        message: 'If an account exists with this email, a reset code is on its way.'
      });
    }

    // Throttle: max 5 resends per 10-minute window.
    const existing = await OTP.findOne({ data: email.toLowerCase() });
    if (existing && existing.resendCount >= 5) {
      return res.status(429).json({
        success: false,
        message: 'Too many reset requests. Please wait a few minutes and try again.',
        code: 'RATE_LIMITED'
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await OTP.deleteMany({ data: email.toLowerCase() });
    await new OTP({
      data: email.toLowerCase(),
      code: otpCode,
      resendCount: existing ? existing.resendCount + 1 : 0
    }).save();

    await sendPasswordResetEmail(email, otpCode, user.name);

    return res.status(200).json({
      success: true,
      email,
      message: 'If an account exists with this email, a reset code is on its way.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process the reset request. Please try again later.'
    });
  }
};

// POST /auth/verify-reset-otp
export const verifyResetOtp = async (req, res) => {
  try {
    const { data, code } = req.body;

    if (!data || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP are required',
        code: 'MISSING_FIELDS'
      });
    }

    const otpRecord = await OTP.findOne({ data: data.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
        code: 'INVALID_OTP'
      });
    }

    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Too many failed attempts. Please request a new code.',
        code: 'MAX_ATTEMPTS_REACHED'
      });
    }

    if (otpRecord.code !== code) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remainingAttempts = 3 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: remainingAttempts > 0
          ? `The OTP you entered is incorrect. You have ${remainingAttempts} ${remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining.`
          : 'You have used all your OTP attempts. Please request a new code.',
        code: 'INCORRECT_OTP',
        remainingAttempts,
        canRetry: remainingAttempts > 0
      });
    }

    const { user, role } = await findPermanentUserByEmail(data);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found for this email.',
        code: 'USER_NOT_FOUND'
      });
    }

    // One OTP, one reset token — prevent replay.
    await OTP.deleteOne({ _id: otpRecord._id });

    const resetToken = jwt.sign(
      { userId: user._id, role, purpose: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: RESET_TOKEN_TTL }
    );

    return res.status(200).json({
      success: true,
      resetToken,
      message: 'OTP verified. You can now set a new password.'
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed. Please try again.'
    });
  }
};

// POST /auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;

    if (!resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required',
        code: 'MISSING_FIELDS'
      });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
        code: 'WEAK_PASSWORD'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.name === 'TokenExpiredError'
          ? 'Your reset session has expired. Please request a new code.'
          : 'Invalid reset session. Please start over.',
        code: 'INVALID_OR_EXPIRED_TOKEN',
        canRetry: true
      });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reset session. Please start over.',
        code: 'INVALID_OR_EXPIRED_TOKEN'
      });
    }

    const Model = decoded.role === 'client' ? Client : Worker;
    const user = await Model.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Account not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to reset the password. Please try again later.'
    });
  }
};

export const sendPasswordResetEmail = async (email, otp, name) => {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || "KaamSetu"} <${process.env.EMAIL_FROM}>`,
      to: [email],
      subject: "Reset Your Password - KaamSetu",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password reset request</h2>
          <p>Hi ${name || "there"}, use the code below to reset your KaamSetu password:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #333; border-radius: 5px;">
            ${otp}
          </div>
          <p>This code expires in 10 minutes. If you didn't request this, you can safely ignore this email — your password won't change.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Error sending password reset email:", error);
      throw error;
    }

    console.log("✅ Password reset email sent:", data?.id || email);
  } catch (err) {
    console.error("❌ Unexpected error in sendPasswordResetEmail:", err);
    throw err;
  }
};

// Mail send


// Mail client is created lazily so a missing RESEND_API_KEY doesn't crash
// the whole API at boot — only endpoints that actually send mail surface a
// clear configuration error.
let resendClient = null;
const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured — cannot send email.');
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

export const sendOTPEmail = async (email, otp, name) => {
  try {
    const resend = getResend();
    const { data, error } = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || "KaamSetu"} <${process.env.EMAIL_FROM}>`,
      to: [email],
      subject: "Verify Your Email - KaamSetu",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Kaamsetu, ${name || "User"}!</h2>
          <p>Your OTP is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #333; border-radius: 5px;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `,
    });

    if (error) {
      console.error("❌ Error sending OTP email:", error);
      throw error;
    }

    console.log("✅ OTP email sent successfully:", data);
  } catch (err) {
    console.error("❌ Unexpected error in sendOTPEmail:", err);
    throw err;
  }
};

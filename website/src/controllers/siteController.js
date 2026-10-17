
import {User} from '../models/User.js';
import { generateToken } from '../utils/jwtUtils.js';
import bcrypt from 'bcrypt';



export const renderHomepage = (req, res) => {
  res.sendFile('src/public/html/homepage.html', { root: '.' });
};

export const renderFAQ = (req, res) => {
  res.sendFile('src/public/html/faq.html', { root: '.' });
};

export const renderPolicy = (req, res) => {
  res.sendFile('src/public/html/policy.html', { root: '.' });
};

export const renderTerms = (req, res) => {
  res.sendFile('src/public/html/terms.html', { root: '.' });
};

export const renderLogin = (req, res) => {

  if (req?.user) {
    try {
      const user = awaitUser.findById(req.user._id);
      
      // Redirect based on role
      if (user) res.redirectUrl(`/${user.role}/dashboard/${user._id}`);
    } catch (err) {
      console.error('Invalid token:', err.message);
      // If token is invalid, render login page
      res.status(401).sendFile('src/public/html/login.html', { root: '.' });
    }
  } else {
    // No token, render login page
    res.status(401).sendFile('src/public/html/login.html', { root: '.' });
  }
};

export const renderClientRegistration = (req, res) => {
  res.sendFile('src/public/html/client-registration.html', { root: '.' });
};

export const renderLaborRegistration = (req, res) => {
  res.sendFile('src/public/html/labor-registration.html', { root: '.' });
};


export const handleLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found. Please check your email.' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password. Please try again.' });
        }

        // Generate a token for the user
        const token = generateToken({ id: user._id, role: user.role });

        // Determine redirect URL based on user role
        let redirectUrl = `/${user.role}/dashboard/${user._id}`;

        // Set token in HTTP-only cookie and send response
        res
            .status(200)
            .cookie('authToken', token, {
                httpOnly: true,  // Prevent client-side scripts from accessing the token
                secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
                sameSite: 'strict',  // CSRF protection
                maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
            })
            .json({ message: 'Login successful!', redirectUrl });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Something went wrong. Please try again later.' });
    }
};

export const logout = (req, res) => {
  res.clearCookie('authToken').status(200).redirect('/');
};
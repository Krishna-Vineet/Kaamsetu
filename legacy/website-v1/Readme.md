# KaamSetu

## What is KaamSetu?
KaamSetu is a job marketplace web application designed to connect clients (who post jobs) with labors (who seek jobs). It provides a platform for job posting, application, management, dispute resolution, and payment handling, with dedicated dashboards for Admin, Client, and Labor roles.

## Why KaamSetu?
- **Bridges the gap** between job providers and job seekers in a streamlined, secure, and transparent manner.
- **Simplifies job management** for both clients and labors.
- **Ensures accountability** with dispute management and payment tracking.
- **Role-based access** for secure and organized workflows.

## User Roles
- **Admin:** Manages users, jobs, disputes, and payments. Has access to all data and can resolve disputes.
- **Client:** Can register, post jobs, manage their jobs, handle payments, and view their profile.
- **Labor:** Can register, browse/apply for jobs, manage their job history, handle payments, and view their profile.

## Features (Implemented)
- User registration and login for Clients and Labors
- Admin, Client, and Labor dashboards
- Job posting and management (Clients)
- Job browsing and application (Labors)
- Payment management for completed jobs
- Dispute management (Admin)
- Profile management for all users
- Static and dynamic pages (EJS views, HTML)
- JWT and cookie-based authentication
- Role-based access control
- Logging and error handling
- Security via Helmet, CORS, and Content Security Policy

## Features To Be Implemented
- Email notifications and verification
- Real-time chat between clients and labors
- Ratings and reviews for jobs and users
- Advanced job search and filtering
- Mobile responsiveness and PWA support
- Admin analytics dashboard
- File uploads for job attachments

## Routes Overview
- `/` : Site routes (homepage, FAQ, policy, terms, etc.)
- `/auth` : Authentication (login, registration)
- `/client` : Client dashboard and job management
- `/labor` : Labor dashboard and job browsing
- `/admin` : Admin dashboard and management
- `/disputes` : Dispute management
- `/jobs` : Job-related actions
- `/payments` : Payment processing
- `/public` : Static assets (CSS, JS, images, HTML)

### Example API Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /client/jobs` - List client jobs
- `POST /client/jobs` - Post a new job
- `GET /labor/jobs` - List available jobs for labor
- `POST /jobs/:id/apply` - Labor applies for a job
- `POST /payments/pay` - Make a payment
- `POST /disputes/create` - Create a dispute

## Authentication
- Uses JWT tokens stored in HTTP-only cookies for secure authentication.
- Middleware checks for valid JWT and user role before granting access to protected routes.
- Passwords are securely hashed before storage.
- On login, a JWT is issued and set as a cookie; on logout, the cookie is cleared.

## Registration
- Separate registration forms for Clients and Labors.
- User details are validated and stored in MongoDB.
- On successful registration, user is redirected to login or dashboard.
- Duplicate email/username checks are performed.

## Project Structure
- `server.js` : Main server entry point
- `src/controllers/` : Business logic for each module
- `src/models/` : Mongoose schemas for Users, Jobs, Payments, Disputes, etc.
- `src/routes/` : Express route definitions
- `src/middlewares/` : Auth, error, role, and upload handling
- `src/utils/` : Utility functions (JWT, email, file, time, etc.)
- `src/views/` : EJS templates for server-rendered pages
- `public/` : Static assets (CSS, JS, images, HTML)

## How to Run
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up a `.env` file with `MONGO_URI` and other required variables
4. Start the server: `npm start` or `node server.js`
5. Visit `http://localhost:3000` in your browser

## Tech Stack
- Node.js, Express.js
- MongoDB, Mongoose
- EJS, HTML, CSS, JavaScript
- Helmet, CORS, dotenv, body-parser, cookie-parser

## Troubleshooting & FAQ
- **MongoDB connection error:** Ensure your `MONGO_URI` in `.env` is correct and MongoDB is running.
- **Port already in use:** Change the `PORT` in `.env` or stop the process using the port.
- **Static files not loading:** Check the `public/` directory structure and static middleware setup.
- **Authentication issues:** Clear cookies and try logging in again; check JWT secret in `.env`.

## Contributing
Contributions are welcome! Please fork the repository, create a feature branch, and submit a pull request.

## License
This project is licensed under the MIT License.

---

For more details, see the codebase and individual module documentation.

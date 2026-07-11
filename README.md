# Shortify <img src="public/assets/logo_favicon.png" alt="Shortify logo" width="36" style="vertical-align: middle;" />

**Live:** https://shortify.h208.me

![Shortify](https://img.shields.io/badge/Shortify-URL%20Shortener-brightgreen)

Shortify is a full‑stack URL shortener that lets you create short links, manage them from a dashboard, and track link analytics.

## Features
- Shorten long URLs into 6‑character short links
- User authentication (signup/login)
- Email OTP verification during signup (OTP managed via Redis)
- Dashboard to manage all your links
- Basic analytics (visit / click count per link)
- Password‑protected short links (protected links show a password prompt before redirecting)
- Edit destination URL for an existing short link
- Enable/disable password protection on an existing short link
- Reset click count
- Delete a short link

## Tech Stack
### Frontend
- **EJS** (templating)
- **HTML / CSS**
- **Javascript**

### Backend
- **Node.js**
- **Express.js**
- **PostgreSQL** (`pg`)
- **Redis** (used for temporary OTP storage and session/credential-related caching)
- **JWT** authentication (stored in HTTP‑only cookies)
- **bcrypt** (password hashing)
- **Nodemailer** (email OTP)

## Environment Variables
Copy `.env.example` to `.env` and fill in the values. Important variables include:

- DATABASE_URL — PostgreSQL connection string
- JWT_SECRET — secret for signing JWTs
- EMAIL_USER / EMAIL_PASS — SMTP credentials used by Nodemailer
- REDIS_HOST — hostname for Redis (e.g. `redis` when using docker-compose)

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/hitheshn208/shortify.git
   ```

2. Navigate into the project directory:
   ```bash
   cd shortify
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create your environment file:
   - Copy `.env.example` to `.env`
   - Fill in the required values (see "Environment Variables" above)

5. Start the server:
   ```bash
   npm run dev
   ```

## Docker (recommended)
This project is Dockerized and includes a Dockerfile, .dockerignore, and a docker-compose configuration that runs the app together with Redis and PostgreSQL.

To build and run with Docker Compose:

```bash
# build and start services (app, postgres, redis)
docker-compose up --build
```

Notes:
- docker-compose sets up a `redis` service and the application is configured to use the `REDIS_HOST` environment variable (set to `redis` in the compose file).
- Redis is used to store OTPs temporarily for email verification and to assist with credential-related caching.

## Deployment
Live: [https://shortify.h208.me](https://shortify.h208.me)

## Usage
1. Create an account and verify your email via OTP.
2. From the dashboard, paste a long URL and generate a short link.
3. (Optional) Enable password protection for the link.
4. Share the short URL and track visits from the dashboard.

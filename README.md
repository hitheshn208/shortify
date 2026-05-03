# Shortify <img src="public/assets/logo_favicon.png" alt="Shortify logo" width="36" style="vertical-align: middle;" />

**Live:** https://shortify.h208.me

![Shortify](https://img.shields.io/badge/Shortify-URL%20Shortener-brightgreen)

Shortify is a full‑stack URL shortener that lets you create short links, manage them from a dashboard, and track link analytics.

## Features
- Shorten long URLs into 6‑character short links
- User authentication (signup/login)
- Email OTP verification during signup
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
- **JAVASCRIPT**

### Backend
- **Node.js**
- **Express.js**
- **PostgreSQL** (`pg`)
- **JWT** authentication (stored in HTTP‑only cookies)
- **bcrypt** (password hashing)
- **Nodemailer** (email OTP)

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
   - Fill in the required values

5. Start the server:
   ```bash
   npm run dev
   ```

## Deployment
Live: [https://shortify.h208.me](https://shortify.h208.me)

## Usage
1. Create an account and verify your email via OTP.
2. From the dashboard, paste a long URL and generate a short link.
3. (Optional) Enable password protection for the link.
4. Share the short URL and track visits from the dashboard.

# Wanderlust

**Full-Stack Travel & Luxury Stay Booking Platform (MVC)**

Wanderlust is a production-minded full-stack marketplace for discovering, listing, and booking premium stays. It delivers secure authentication, host/guest workflows, and a modern luxury UI in a clean Node.js + Express + MongoDB architecture.

## Why This Project Stands Out

- Real-world full-stack architecture using clear MVC separation
- Complete listing-to-booking lifecycle with host and guest flows
- Portfolio-ready UI/UX with responsive, component-based pages
- Production-focused configuration with modular routes and controllers

## Core Capabilities

- User authentication (Signup/Login)
- Listing CRUD (create, edit, delete)
- Booking system
- Reviews & ratings
- Wishlist functionality
- Map integration
- Host dashboard/reservations management

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, EJS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** Passport.js
- **Tools:** Cloudinary, map integration, Nodemailer

## Architecture Snapshot

```bash
/config
/controllers
/models
/routes
/middleware
/utils
/public
/views
app.js
```

## Quick Setup

```bash
git clone <repo>
cd project
npm install
```

Create `.env`:

```env
DB_URL=your_database_url
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
SESSION_SECRET=your_secret
```

Run:

```bash
npm start
# or
node app.js
```

## Screenshots

(Add homepage, listing page, booking page screenshots here)

## Live Demo

(Add deployment URL here)

## Roadmap

- Payment gateway integration
- Advanced listing search/filters
- Admin moderation dashboard
- Real-time booking notifications
- Host analytics and insights

## Author

- **Name:** Your Name
- **Role:** Full-Stack Developer
- **LinkedIn:** (Add LinkedIn profile URL here)
- **GitHub:** (Add GitHub profile URL here)

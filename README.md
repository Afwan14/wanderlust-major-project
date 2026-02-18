# Wanderlust

Quick recruiter version: [README_MINIMAL.md](README_MINIMAL.md)

**Full-Stack Travel & Luxury Stay Booking Platform**

Wanderlust is a premium marketplace-style web application for discovering, listing, and booking luxury stays.
Built with a clean MVC architecture, it combines secure authentication, host-side listing management, and guest booking workflows in a polished, modern user experience.
The project is designed as a production-minded full-stack platform suitable for real-world scale and professional portfolios.

## ✨ Features

### Core Features

- Secure user authentication (Signup/Login)
- Create, edit, and delete listings
- End-to-end booking system
- Reviews and ratings workflow
- Wishlist save/unsave functionality
- Map integration for location experience
- Host-side reservation and listing management

### UI/UX Features

- Modern luxury, premium marketplace interface
- Fully responsive design across devices
- Component-based layout organization
- Smooth interaction patterns and transitions

## 🛠 Tech Stack

### Frontend

- HTML
- CSS
- JavaScript
- EJS

### Backend

- Node.js
- Express.js

### Database

- MongoDB
- Mongoose

### Authentication

- Passport.js

### Other Tools

- Cloudinary (image handling)
- Map integration
- Nodemailer (email flows)
- MVC architecture

## 🏗 Architecture

Wanderlust follows a classic **MVC (Model-View-Controller)** pattern to keep the codebase scalable and maintainable.

- **Models** define data schema and persistence rules.
- **Views** render server-side UI with EJS templates.
- **Controllers** handle business logic and request processing.
- **Routes** stay modular and map endpoints to controllers.
- **Middleware and utilities** isolate cross-cutting concerns (validation, auth checks, helpers).

This separation of concerns keeps features clean, testable, and easier to extend.

## 📂 Project Structure

```bash
WANDERLUST-MAJORPROJECT/
├── config/
├── controllers/
├── models/
├── routes/
├── middleware/
├── utils/
├── public/
├── views/
└── app.js
```

## 🚀 Installation & Setup

```bash
git clone <repo>
cd project
npm install
```

Create a `.env` file in the project root:

```env
DB_URL=your_database_url
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
SESSION_SECRET=your_secret
```

Run the application:

```bash
npm start
```

If `npm start` is not configured in your local scripts, run:

```bash
node app.js
```

## 🔐 Environment Variables

Required:

- `DB_URL`
- `SESSION_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_KEY`
- `CLOUDINARY_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`

Project compatibility keys (if used in current config):

- `CLOUD_NAME`
- `CLOUD_API_KEY`
- `CLOUD_API_SECRET`
- `MAP_TOKEN`
- `BASE_URL`
- `NODE_ENV`

## 📸 Screenshots

(Add homepage, listing page, booking page screenshots here)

## 🌍 Deployment

Live Demo: _(Add deployment URL here)_

## 📈 Future Improvements

- Payment gateway integration for secure online transactions
- Advanced search and filter system for listings
- Admin dashboard for moderation and platform management
- Real-time notifications for bookings and host updates
- Booking analytics and insights for hosts

## 👨‍💻 Author

- **Name:** Your Name
- **Role:** Full-Stack Developer
- **LinkedIn:** _(Add LinkedIn profile URL here)_
- **GitHub:** _(Add GitHub profile URL here)_

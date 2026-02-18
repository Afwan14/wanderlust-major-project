// Quick test to check email configuration
require("dotenv").config();

console.log("=================================");
console.log("Email Configuration Check");
console.log("=================================");

if (process.env.EMAIL_USER) {
  console.log("✅ EMAIL_USER is set:", process.env.EMAIL_USER);
} else {
  console.log("❌ EMAIL_USER is NOT set");
}

if (process.env.EMAIL_PASS) {
  console.log("✅ EMAIL_PASS is set:", process.env.EMAIL_PASS.substring(0, 4) + "****");
} else {
  console.log("❌ EMAIL_PASS is NOT set");
}

if (process.env.BASE_URL) {
  console.log("✅ BASE_URL is set:", process.env.BASE_URL);
} else {
  console.log("❌ BASE_URL is NOT set");
}

console.log("=================================");

if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.BASE_URL) {
  console.log("✅ All email configuration is complete!");
  console.log("\nYou can now test email sending.");
} else {
  console.log("❌ Email configuration is incomplete.");
  console.log("\nPlease add missing variables to your .env file:");
  if (!process.env.EMAIL_USER) console.log("  - EMAIL_USER=your_email@gmail.com");
  if (!process.env.EMAIL_PASS) console.log("  - EMAIL_PASS=your_app_password");
  if (!process.env.BASE_URL) console.log("  - BASE_URL=http://localhost:8080");
}

console.log("=================================");

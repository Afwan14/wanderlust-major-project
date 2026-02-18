const { sendSupportEmail } = require("../utils/emailService.js");

module.exports.renderHelpPage = (req, res) => {
  res.render("help/index");
};

module.exports.submitSupportForm = async (req, res) => {
  const { name, email, topic, message } = req.body;

  if (!name || !email || !topic || !message) {
    req.flash("error", "Please fill in all fields");
    return res.redirect("/help#contact");
  }

  const topicDisplay =
    {
      booking: "Booking Support",
      hosting: "Hosting Question",
      payment: "Payment Issue",
      account: "Account Help",
      other: "Other",
    }[topic] || topic;

  await sendSupportEmail(name, email, topicDisplay, message);

  console.log(`✅ Support request received from ${name} (${email})`);

  req.flash(
    "success",
    "Thank you for reaching out! We've received your message and will respond within 24 hours."
  );
  res.redirect("/help");
};

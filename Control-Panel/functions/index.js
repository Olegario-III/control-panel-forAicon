const functions = require("firebase-functions");
const nodemailer = require("nodemailer");

// Load Gmail credentials from Firebase config
const gmailUser = functions.config().email.user;
const gmailPass = functions.config().email.pass;

// Setup email transport (Gmail + App Password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: gmailUser,
    pass: gmailPass,
  },
});

// Callable function for sending email replies
exports.sendReply = functions.https.onCall(async (data, context) => {
  const { to, message, inquiryId } = data;

  if (!to || !message) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing email or message."
    );
  }

  const mailOptions = {
    from: `"Aicon Support" <${gmailUser}>`,
    to,
    subject: `Reply to your inquiry (#${inquiryId})`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Email send failed:", error);
    throw new functions.https.HttpsError("internal", "Failed to send email.");
  }
});

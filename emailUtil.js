const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "a6cc510cabdb68",
    pass: "ce10bd22c78d2d",
  },
});

async function sendWelcomeEmail(toEmail, username) {
  const mailOptions = {
    from: '"ChatSystem" <CSTeam@chatsystem.com>',
    to: toEmail,
    subject: "Welcome to ChatSystem",
    text: `Hello ${username},\n\nWelcome to ChatSystem! We’re glad you joined us.\n\nBest Regards,\nChatSystem Team`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.messageId);
  } catch (error) {
    console.error("Error sending email: ", error);
  }
}

module.exports = sendWelcomeEmail;

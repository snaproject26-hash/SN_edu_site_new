const nodemailer = require("nodemailer");

const mailUser = process.env.EMAIL_USER || "sna.project26@gmail.com";
const mailPass = process.env.EMAIL_PASS || "simb rukh otdi zacr";

/**
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
 */
const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      // host:process.env.MAIL_HOST,
      service: "gmail",
      auth: {
        user: mailUser,
        pass: mailPass,
      },
    });

    let info = await transporter.sendMail({
      from: `"StudyNotion" <${mailUser}>`, // sender address
      to: email,
      subject: title,
      html: body,
    });
    console.log(info);
    return info;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = mailSender;

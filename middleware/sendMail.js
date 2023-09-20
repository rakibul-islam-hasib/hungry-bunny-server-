// Import nodemailer
const nodemailer = require('nodemailer');

async function main() {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.mailgun.org",
        port: 587,
        auth: {
            user: "postmaster@sandbox7a6121dc768840b1b76359f4ace3fb35.mailgun.org",
            pass: "276a0e3f59318ef194bd3b07f3df25af-4b98b89f-e05e26b5",
        },
    });
    let info = await transporter.sendMail({
        from: 'postmaster@sandbox7a6121dc768840b1b76359f4ace3fb35.mailgun.org',
        to: "boraborhasib@gmail.com",
        subject: "Hello",
        text: "Testing some Mailgun awesomness"
    });

    console.log("Message sent: %s", info.messageId);

}

main().catch(console.error);
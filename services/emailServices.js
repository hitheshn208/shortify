const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const transporter = nodemailer.createTransport(
    {
        secure: true,
        host: 'smtp.gmail.com',
        port: process.env.EMAIL_PORT,
        auth:{
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        }
    }
)
exports.sendOtp = (to, otp)=>{
    const Message = createMessage(otp);
    transporter.sendMail({
        to: to,
        subject: "Your OTP Code - Shortify",
        html: Message
    })
    // console.log("Email Sent ", otp);
}

function createMessage(otp)
{
    return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Verify Your Email</title>
            </head>
            <body style="margin:0; margin-block: 10px; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">

            <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden;">
            <!-- Header -->
            <tr>
            <td style="background:#0b4fc2; color:white; text-align:center; padding:20px;">
                <h2 style="margin:0;">Shortify</h2>
            </td>
            </tr>

            <!-- Body -->
            <tr>
            <td style="padding:30px; text-align:center;">
                
                <h3 style="margin-bottom:10px;">Verify Your Email</h3>
                <p style="color:#555; font-size:14px;">
                Use the OTP below to complete your verification. This code is valid for <b>10 minutes</b>.
                </p>

                <!-- OTP Box -->
                <div style="margin:30px 0;">
                <span style="display:inline-block; padding:15px 25px; font-size:24px; letter-spacing:5px; background:#f0f0f0; border-radius:6px; font-weight:bold;">
                    ${otp}
                </span>
                </div>

                <p style="color:#777; font-size:13px;">
                If you didn't request this, you can safely ignore this email.
                </p>

            </td>
            </tr>

            <!-- Footer -->
            <tr>
            <td style="background:#f9f9f9; text-align:center; padding:15px; font-size:12px; color:#999;">
                © 2026 Shortify. All rights reserved.
            </td>
            </tr>
            </table>
        </body>
        </html>`
}
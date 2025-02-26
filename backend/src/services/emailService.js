import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // Set to false for port 25
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
  }
});

export const sendPaymentLink = async (email, paymentLink) => {
  try {
    logger.info('Sending payment link email', { to: email });
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Complete Your Payment',
      html: `
        <h2>Complete Your Payment</h2>
        <p>Please click the link below to complete your payment:</p>
        <p><a href="${paymentLink}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Pay Now</a></p>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${paymentLink}</p>
        <p>This payment link will expire in 24 hours.</p>
      `,
    });

    logger.info('Payment link email sent successfully', { to: email });
  } catch (error) {
    logger.error('Error sending payment link email:', error);
    // Don't throw the error, just log it
    // This way, the payment process can continue even if email sending fails
  }
};

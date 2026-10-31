import nodemailer from 'nodemailer';

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

// Configure transporter using env variables
const createTransporter = () => {
  // 1. SendGrid SMTP
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
  }

  // 2. Resend SMTP
  if (process.env.RESEND_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY
      }
    });
  }

  // 3. Custom / Standard SMTP
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: Number(process.env.EMAIL_PORT) === 465,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  // 4. Gmail or service-based SMTP
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_USER !== 'your_email@gmail.com') {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  return null;
};

export const sendOrderEmail = async (toEmail, subject, contentHtml) => {
  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.warn(`[Email Service Notice] Email sending skipped (provider not configured). Destination: ${toEmail}`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"FarmConnect Marketplace" <no-reply@farmconnect.com>',
      to: toEmail,
      subject: subject,
      html: contentHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Order notification email sent to ${toEmail} (MessageId: ${info.messageId})`);
  } catch (error) {
    console.error(`❌ Order email delivery error: ${error.message}`);
  }
};

export const sendOrderConfirmationEmail = async (order, customerEmail) => {
  if (!customerEmail) return;

  const itemsList = order.items.map(item => 
    `<li><strong>${item.product?.name || 'Product'}</strong> - Qty: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}</li>`
  ).join('');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1a202c; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0F5A32; margin-top: 0;">🎉 Order Confirmation - FarmConnect</h2>
      <p>Thank you for buying directly from verified Indian farmers!</p>
      <div style="background: #f7fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <p style="margin: 4px 0;"><strong>Order ID:</strong> #${order._id}</p>
        <p style="margin: 4px 0;"><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
        <p style="margin: 4px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p style="margin: 4px 0;"><strong>Delivery Status:</strong> ${order.deliveryStatus || 'Pending'}</p>
      </div>
      <h3>Items Ordered:</h3>
      <ul style="padding-left: 20px; line-height: 1.6;">${itemsList}</ul>
      <p style="margin-top: 24px; font-size: 12px; color: #718096; border-top: 1px solid #edf2f7; padding-top: 12px;">
        FarmConnect Platform &bull; Empowering Local Agriculture
      </p>
    </div>
  `;

  await sendOrderEmail(customerEmail, `FarmConnect Order Confirmation #${order._id}`, html);
};

export const sendOrderStatusUpdateEmail = async (order, customerEmail, newStatus) => {
  if (!customerEmail) return;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1a202c; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #0F5A32; margin-top: 0;">📦 Order Status Update - #${order._id}</h2>
      <p>Your order status has been updated to: <strong style="color: #059669; font-size: 16px;">${newStatus}</strong></p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p style="margin-top: 16px;">You can track real-time delivery status and route directly in your FarmConnect orders dashboard.</p>
      <p style="margin-top: 24px; font-size: 12px; color: #718096; border-top: 1px solid #edf2f7; padding-top: 12px;">
        FarmConnect Platform &bull; Connecting Farmers Directly to Consumers
      </p>
    </div>
  `;

  await sendOrderEmail(customerEmail, `FarmConnect Order Update: ${newStatus} (#${order._id})`, html);
};

export const sendVerificationOTPEmail = async (toEmail, otp, recipientName = 'User') => {
  if (!toEmail) {
    return { 
      success: false, 
      error: 'MISSING_RECIPIENT', 
      message: 'Recipient email address is required.' 
    };
  }

  const transporter = createTransporter();
  if (!transporter) {
    return { 
      success: false, 
      error: 'PROVIDER_NOT_CONFIGURED', 
      message: 'Email delivery is not configured on the server. Please configure EMAIL_USER and EMAIL_PASS (or RESEND_API_KEY / SENDGRID_API_KEY) in the server environment variables.' 
    };
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; color: #1f2937; max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0F5A32; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Farm<span style="color: #1f2937;">Connect</span></h1>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Direct Farmer-to-Consumer Marketplace</p>
      </div>

      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px 20px; text-align: center; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #166534; font-weight: 600; margin: 0 0 8px 0;">Hello ${escapeHtml(recipientName)},</p>
        <p style="font-size: 13px; color: #374151; margin: 0 0 16px 0;">Your FarmConnect registration verification code is:</p>
        <div style="display: inline-block; background: #ffffff; border: 2px dashed #0F5A32; border-radius: 12px; padding: 12px 36px; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #0F5A32; font-family: monospace;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #6b7280; margin: 16px 0 0 0;">This code is valid for <strong>10 minutes</strong>. Never share this code with anyone.</p>
      </div>

      <div style="font-size: 12px; color: #9ca3af; text-align: center; line-height: 1.5; border-top: 1px solid #f3f4f6; padding-top: 16px;">
        <p style="margin: 0;">If you did not request this verification code, please ignore this email.</p>
        <p style="margin: 4px 0 0 0;">&copy; ${new Date().getFullYear()} FarmConnect India &bull; Empowering Local Agriculture</p>
      </div>
    </div>
  `;

  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"FarmConnect Security" <no-reply@farmconnect.com>',
      to: toEmail,
      subject: `Your FarmConnect Verification Code`,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Verification OTP successfully accepted by provider for delivery to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Verification OTP delivery failed. Provider rejected or could not deliver the message.');
    return { 
      success: false, 
      error: 'DELIVERY_FAILED', 
      message: 'Email provider could not deliver the verification code. Check provider credentials and verified sender configuration.' 
    };
  }
};

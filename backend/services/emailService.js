import nodemailer from 'nodemailer';

// Configure transporter using env variables or fallback test account
const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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
      console.log(`[Email Service Simulation] To: ${toEmail} | Subject: ${subject}`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"FarmConnect Marketplace" <no-reply@farmconnect.com>',
      to: toEmail,
      subject: subject,
      html: contentHtml
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email sent successfully to ${toEmail}: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ Email sending error: ${error.message}`);
  }
};

export const sendOrderConfirmationEmail = async (order, customerEmail) => {
  if (!customerEmail) return;

  const itemsList = order.items.map(item => 
    `<li><strong>${item.product?.name || 'Product'}</strong> - Qty: ${item.quantity} × ₹${item.price} = ₹${item.quantity * item.price}</li>`
  ).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1a202c; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #166534;">🎉 Order Confirmation - FarmConnect</h2>
      <p>Thank you for buying directly from Indian farmers!</p>
      <p><strong>Order ID:</strong> #${order._id}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <h3>Items Ordered:</h3>
      <ul>${itemsList}</ul>
      <p style="margin-top: 20px; font-size: 12px; color: #718096;">FarmConnect Platform - Connecting Farmers Directly to Consumers</p>
    </div>
  `;

  await sendOrderEmail(customerEmail, `Order Confirmation #${order._id}`, html);
};

export const sendOrderStatusUpdateEmail = async (order, customerEmail, newStatus) => {
  if (!customerEmail) return;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1a202c; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded: 12px;">
      <h2 style="color: #166534;">📦 Order Status Update - #${order._id}</h2>
      <p>Your order status has been updated to: <strong style="color: #059669; font-size: 18px;">${newStatus}</strong></p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p>Track your order status on your FarmConnect Dashboard anytime.</p>
    </div>
  `;

  await sendOrderEmail(customerEmail, `Order Status Update: ${newStatus} (#${order._id})`, html);
};

export const sendVerificationOTPEmail = async (toEmail, otp, recipientName = 'User') => {
  if (!toEmail) {
    return { success: false, error: 'MISSING_RECIPIENT', message: 'Recipient email is required.' };
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.warn(`[OTP Email Warning] No real email provider configured. EMAIL_USER and EMAIL_PASS are missing or empty.`);
    return { 
      success: false, 
      error: 'PROVIDER_NOT_CONFIGURED', 
      message: 'Email provider is not configured on the server. Please set valid EMAIL_USER and EMAIL_PASS credentials.' 
    };
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 32px 24px; color: #1f2937; max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #0F5A32; font-size: 26px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">Farm<span style="color: #1f2937;">Connect</span></h1>
        <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Direct Farmer-to-Consumer Marketplace</p>
      </div>

      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%); border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #166534; font-weight: 600; margin: 0 0 8px 0;">Hello ${recipientName},</p>
        <p style="font-size: 13px; color: #374151; margin: 0 0 16px 0;">Your FarmConnect registration verification code is:</p>
        <div style="display: inline-block; background: #ffffff; border: 2px dashed #0F5A32; border-radius: 12px; padding: 12px 32px; letter-spacing: 8px; font-size: 32px; font-weight: 800; color: #0F5A32; font-family: monospace;">
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
      subject: `Your FarmConnect Verification Code: ${otp}`,
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Verification OTP successfully sent to ${toEmail} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Verification OTP delivery failed to ${toEmail}: ${error.message}`);
    return { 
      success: false, 
      error: 'DELIVERY_FAILED', 
      message: `Failed to deliver verification code: ${error.message}` 
    };
  }
};

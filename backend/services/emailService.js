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

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);


// Resend ücretsiz planda varsayılan olarak "onboarding@resend.dev" adresi kullanılır.
// Kendi alan adını (domain) doğruladıktan sonra "orders@yourdomain.com" yapabilirsin.
const FROM_EMAIL = "NXT Store <onboarding@resend.dev>";

// 1. Sipariş Alındı Emaili
export async function sendOrderReceivedEmail(toEmail: string, orderId: string, totalAmount: string) {
  try{
    await resend.emails.send ({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `Order Confirmation #${orderId} - NXT Store`,
      html:`
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
          <h2 style="color: #0f172a;">Thank you for your order! 🎉</h2>
          <p style="color: #475569;">We have received your order and are currently preparing it.</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">Order ID: <span style="font-family: monospace;">${orderId}</span></p>
            <p style="margin: 5px 0 0 0; font-weight: bold; color: #16a34a;">Total: ${totalAmount}</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">You can track your order status in your account dashboard.</p>
        </div>
      `,
 });
  } catch (error) {
    console.error("Failed to send Order Received email:", error);
  }
}


// 2. Sipariş Kargoya Verildi Emaili
export async function sendOrderShippedEmail(toEmail: string, orderId: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `Your Order #${orderId} Has Been Shipped! 🚚`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
          <h2 style="color: #00786f;">Your package is on its way! 📦</h2>
          <p style="color: #475569;">Great news! Your order has been shipped and is heading towards your delivery address.</p>
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #bfdbfe;">
            <p style="margin: 0; font-weight: bold;">Order ID: <span style="font-family: monospace;">${orderId}</span></p>
            <p style="margin: 5px 0 0 0; color: #00645d; font-size: 14px;">Status: Shipped</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">Thank you for shopping with NXT Store!</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send Order Shipped email:", error);
  }
}


// 3. Sipariş İptal Edildi Emaili
export async function sendOrderCancelledEmail(toEmail: string, orderId: string, cancelledBy: "USER" | "ADMIN") {
  try {
    const isByAdmin = cancelledBy === "ADMIN";
    await resend.emails.send({
      from: FROM_EMAIL,
      to: [toEmail],
      subject: `Order Cancellation #${orderId} - NXT Store`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-lg: 8px;">
          <h2 style="color: #dc2626;">Order Cancelled ❌</h2>
          <p style="color: #475569;">
            ${isByAdmin 
              ? "Your order was cancelled by our store administrator. If a payment was collected, your full refund has been initiated." 
              : "Your order cancellation request has been successfully processed."}
          </p>
          <div style="background-color: #fef2f2; padding: 16px; border-radius: 6px; margin: 20px 0; border: 1px solid #fecaca;">
            <p style="margin: 0; font-weight: bold;">Order ID: <span style="font-family: monospace;">${orderId}</span></p>
            <p style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 14px;">Status: Cancelled by (${cancelledBy})</p>
          </div>
          <p style="color: #64748b; font-size: 14px;">If you have any questions, please contact our support team.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send Order Cancelled email:", error);
  }
}
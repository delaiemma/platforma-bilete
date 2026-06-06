/**
 * @fileoverview Email service for handling all email-related operations in the ticket management system.
 * This service provides functionality for sending ticket confirmations, contact confirmations,
 * cancellation notifications, password resets, and registration confirmations using Nodemailer.
 * It also handles PDF ticket generation using Puppeteer for email attachments.
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

/**
 * Creates and configures a Nodemailer transporter for sending emails via Gmail.
 * Uses environment variables for authentication credentials.
 *
 * @returns {import('nodemailer').Transporter} Configured Nodemailer transporter instance
 */
const createTransporter = () => {

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-app-password'
        }
    });
};

/**
 * Converts an image file to a base64-encoded data URI for embedding in HTML emails.
 * Reads the image from the public/images directory and encodes it as a base64 string.
 *
 * @param {string} imagePath - Relative path to the image file within the public/images directory
 * @returns {string|null} Base64-encoded data URI (e.g., "data:image/jpg;base64,...") or null if the file doesn't exist or an error occurs
 */
const convertImageToBase64 = (imagePath) => {
    try {
        const fullPath = path.join(__dirname, '..', 'public', 'images', imagePath);
        if (fs.existsSync(fullPath)) {
            const imageBuffer = fs.readFileSync(fullPath);
            const base64Image = imageBuffer.toString('base64');
            const ext = path.extname(imagePath).substring(1);
            return `data:image/${ext};base64,${base64Image}`;
        }
        return null;
    } catch (error) {
        console.error('Error converting image to base64:', error);
        return null;
    }
};

/**
 * Generates an HTML representation of a ticket for email display and PDF conversion.
 * Creates a fully styled, self-contained HTML document with embedded styles and QR codes.
 *
 * @param {Object} ticket - Ticket data object containing all information needed for the ticket
 * @param {Object} ticket.event - Event information
 * @param {string} ticket.event.title - Event title
 * @param {string} [ticket.event.type] - Event type (concert, seminar, etc.)
 * @param {string} ticket.event.date - Event date
 * @param {string} ticket.event.time - Event time
 * @param {string} ticket.event.location - Event venue location
 * @param {string} ticket.event.city - Event city
 * @param {string} [ticket.event.image_path] - Path to event image
 * @param {Object} ticket.user - User information
 * @param {number} ticket.quantity - Number of tickets
 * @param {number|string} ticket.totalPrice - Total price for all tickets
 * @param {Array<Object>} ticket.qrCodes - Array of QR code data for each ticket
 * @param {string} ticket.qrCodes[].qrCodeData - Base64-encoded QR code image data URI
 * @param {string} ticket.qrCodes[].ticketId - Unique ticket identifier
 * @param {string} [ticket.qrCodes[].seat] - Seat assignment if applicable
 * @returns {string} Complete HTML document as a string
 */
const generateTicketHTML = (ticket) => {
    const { event, user, quantity, totalPrice, qrCodes } = ticket;

    const eventImageBase64 = event.image_path && event.image_path !== 'default.jpg'
        ? convertImageToBase64(event.image_path)
        : null;

    const formattedDate = event.date
        ? new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : '';

    const formattedTime = event.time
        ? String(event.time).substring(0, 5)
        : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: white;
            padding: 0;
            margin: 0;
        }
        .wrap {
            width: 560px;
            background: white;
            border-radius: 0;
            overflow: hidden;
        }
        /* ── HEADER ── */
        .header {
            background: #111;
            color: white;
            padding: 28px 30px 22px;
        }
        .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }
        .brand {
            font-size: 13px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #aaa;
        }
        .badge {
            background: #fff;
            color: #111;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            padding: 4px 10px;
            border-radius: 20px;
        }
        .event-title {
            font-size: 26px;
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 6px;
        }
        .event-type {
            font-size: 13px;
            color: #888;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        /* ── IMAGE ── */
        .event-img {
            width: 100%;
            height: 200px;
            object-fit: cover;
            display: block;
        }
        .no-img {
            width: 100%;
            height: 60px;
            background: #1a1a1a;
        }
        /* ── INFO GRID ── */
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 0;
            border-bottom: 1px solid #eee;
        }
        .info-cell {
            padding: 16px 24px;
            border-right: 1px solid #eee;
            border-bottom: 1px solid #eee;
        }
        .info-cell:nth-child(2n) { border-right: none; }
        .info-cell:nth-last-child(-n+2) { border-bottom: none; }
        .info-label {
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
            text-transform: uppercase;
            color: #aaa;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #111;
        }
        /* ── DASHED DIVIDER ── */
        .divider {
            border: none;
            border-top: 2px dashed #ddd;
            margin: 0 24px;
        }
        /* ── QR SECTION ── */
        .qr-block {
            display: flex;
            align-items: center;
            padding: 20px 24px;
            gap: 20px;
            border-bottom: 1px solid #eee;
        }
        .qr-img {
            width: 90px;
            height: 90px;
            flex-shrink: 0;
            border: 1px solid #eee;
            padding: 4px;
        }
        .qr-info { flex: 1; }
        .qr-scan {
            font-size: 11px;
            color: #aaa;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .qr-seat {
            font-size: 18px;
            font-weight: 700;
            color: #111;
            margin-bottom: 4px;
        }
        .qr-ticketid {
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #999;
            word-break: break-all;
        }
        /* ── FOOTER ── */
        .footer {
            background: #f8f8f8;
            padding: 16px 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .footer-brand {
            font-size: 16px;
            font-weight: 700;
            font-style: italic;
            color: #333;
        }
        .footer-note {
            font-size: 11px;
            color: #aaa;
            text-align: right;
        }
    </style>
</head>
<body>
<div class="wrap">

    <!-- Header -->
    <div class="header">
        <div class="header-top">
            <span class="brand">Ticket</span>
            <span class="badge">E-Ticket</span>
        </div>
        <div class="event-title">${event.title}</div>
        ${event.type ? `<div class="event-type">${event.type}</div>` : ''}
    </div>

    <!-- Event image -->
    ${eventImageBase64
        ? `<img src="${eventImageBase64}" alt="${event.title}" class="event-img">`
        : '<div class="no-img"></div>'
    }

    <!-- Info grid -->
    <div class="info-grid">
        <div class="info-cell">
            <div class="info-label">Data</div>
            <div class="info-value">${formattedDate}</div>
        </div>
        <div class="info-cell">
            <div class="info-label">Ora</div>
            <div class="info-value">${formattedTime}</div>
        </div>
        <div class="info-cell">
            <div class="info-label">Locatie</div>
            <div class="info-value">${event.location}, ${event.city}</div>
        </div>
        <div class="info-cell">
            <div class="info-label">Total</div>
            <div class="info-value">$${parseFloat(totalPrice).toFixed(2)} &nbsp;(${quantity} bilet${quantity > 1 ? 'e' : ''})</div>
        </div>
    </div>

    <hr class="divider">

    <!-- QR codes -->
    ${qrCodes.map((qr, idx) => `
        <div class="qr-block">
            <img src="${qr.qrCodeData}" alt="QR" class="qr-img">
            <div class="qr-info">
                <div class="qr-scan">Scanati la intrare</div>
                ${qr.seat
                    ? `<div class="qr-seat">Loc ${qr.seat}</div>`
                    : `<div class="qr-seat">Bilet ${idx + 1}${qrCodes.length > 1 ? ' din ' + qrCodes.length : ''}</div>`
                }
                <div class="qr-ticketid">${qr.ticketId}</div>
            </div>
        </div>
        ${qr.isAccessibility ? `
        <div style="background:#fff8e1;border-left:3px solid #f59e0b;margin:0 24px 8px;padding:12px 16px;font-size:12px;color:#92400e;line-height:1.6;">
            ♿ <strong>Accessibility Seat</strong> — Upon entry, you must present a valid document confirming your disability (disability certificate or equivalent).
        </div>` : ''}
    `).join('')}

    <!-- Footer -->
    <div class="footer">
        <div class="footer-brand">Ticket</div>
        <div class="footer-note">Prezentati acest bilet la intrare<br>© 2025 Ticket</div>
    </div>

</div>
</body>
</html>
    `;
};

/**
 * Generates a PDF document from ticket data using Puppeteer.
 * Launches a headless browser, renders the ticket HTML, and converts it to a PDF buffer.
 *
 * @async
 * @param {Object} ticket - Ticket data object (same structure as generateTicketHTML)
 * @param {Object} ticket.event - Event information
 * @param {Object} ticket.user - User information
 * @param {number} ticket.quantity - Number of tickets
 * @param {number|string} ticket.totalPrice - Total price
 * @param {Array<Object>} ticket.qrCodes - QR code data
 * @returns {Promise<Buffer>} PDF file as a Buffer
 * @throws {Error} If PDF generation fails or browser operations fail
 */
const generateTicketPDF = async (ticket) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();

        await page.setViewport({ width: 560, height: 800 });

        const html = generateTicketHTML(ticket);

        await page.setContent(html, {
            waitUntil: 'networkidle0'
        });

        const contentHeight = await page.evaluate(() => document.documentElement.scrollHeight);

        const pdfBuffer = await page.pdf({
            width: '560px',
            height: `${contentHeight}px`,
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        await browser.close();
        return pdfBuffer;

    } catch (error) {
        await browser.close();
        throw error;
    }
};

/**
 * Sends an email with ticket PDF attachments to the user after a successful purchase.
 * Generates PDF tickets for each event and attaches them to the email.
 *
 * @async
 * @param {string} userEmail - Recipient's email address
 * @param {string} userName - Recipient's name for personalization
 * @param {Array<Object>} tickets - Array of ticket objects to include in the email
 * @param {Object} tickets[].event - Event information
 * @param {string} tickets[].event.title - Event title
 * @param {Array<Object>} tickets[].qrCodes - QR codes for the tickets
 * @param {string} tickets[].qrCodes[].ticketId - Unique ticket ID
 * @returns {Promise<{success: boolean, messageId: string}>} Result object with success status and email message ID
 * @throws {Error} If email sending fails or PDF generation fails
 *
 * @description
 * Side effects:
 * - Launches Puppeteer browser instances for PDF generation
 * - Sends email via SMTP using configured transporter
 * - Logs progress and results to console
 */
const sendTicketEmail = async (userEmail, userName, tickets) => {
    try {
        const transporter = createTransporter();

        console.log(`📸 Generating ${tickets.length} ticket image(s)...`);

        const attachments = [];
        for (let i = 0; i < tickets.length; i++) {
            const ticket = tickets[i];
            console.log(`  Generating image ${i + 1}/${tickets.length} for ${ticket.event.title}...`);

            const pdfBuffer = await generateTicketPDF(ticket);

            const firstTicketId = ticket.qrCodes[0].ticketId;

            attachments.push({
                filename: `ticket-${firstTicketId}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            });
        }

        console.log(`✅ Generated ${attachments.length} ticket image(s)`);

        const messageText = `Bună ${userName}!\n\n🎉 Biletul tău este atașat la acest email.\n\nPrezintă codul QR de pe bilet la intrarea în locație pentru scanare.\n\nDistractie placută!\n\n---\nTicket - Event Management System`;

        const mailOptions = {
            from: process.env.EMAIL_USER || 'Ticket <your-email@gmail.com>',
            to: userEmail,
            subject: `🎫 Biletul tău - ${tickets.length} eveniment(e)`,
            text: messageText,
            attachments: attachments
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
};

/**
 * Sends a confirmation email to users who submit a contact form.
 * Acknowledges receipt of their message and provides support contact information.
 *
 * @async
 * @param {string} userEmail - Recipient's email address
 * @param {string} userName - Recipient's name for personalization
 * @returns {Promise<{success: boolean, messageId: string}>} Result object with success status and email message ID
 * @throws {Error} If email sending fails
 *
 * @description
 * Side effects:
 * - Sends email via SMTP using configured transporter
 * - Logs success or error messages to console
 */
const sendContactConfirmationEmail = async (userEmail, userName) => {
    try {
        const transporter = createTransporter();

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message Received</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf8;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 60px 20px 40px;">
                <!-- Logo/Brand -->
                <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36px; font-weight: 700; color: #1a1a1a; letter-spacing: 0px; margin-bottom: 8px;">
                    Ticket
                </div>
                <div style="width: 60px; height: 2px; background-color: #1a1a1a; margin: 0 auto;"></div>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e8e6e0; border-radius: 2px;">
                    <tr>
                        <td style="padding: 48px 48px 32px;">
                            <h1 style="margin: 0 0 12px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1.3; letter-spacing: 0px;">
                                Message Received
                            </h1>
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #666666;">
                                Hi ${userName}, thank you for contacting us. We have received your message and will get back to you soon.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px;">
                            <div style="border-top: 1px solid #e8e6e0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 48px;">
                            <div style="background-color: #fafaf8; border-left: 3px solid #1a1a1a; padding: 20px 24px; border-radius: 2px; margin-bottom: 32px;">
                                <div style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
                                    What's Next?
                                </div>
                                <div style="font-size: 14px; line-height: 1.7; color: #666666;">
                                    A member of our team will review your message and respond shortly, usually within 24-48 hours.
                                </div>
                            </div>

                            <table role="presentation" style="width: 100%; border-collapse: collapse; margin-bottom: 32px;">
                                <tr>
                                    <td style="padding: 14px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top; width: 35%;">
                                        <div style="font-size: 13px; color: #999999;">Email Support</div>
                                    </td>
                                    <td style="padding: 14px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top;">
                                        <div style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${process.env.EMAIL_USER || 'support@ticket.com'}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 14px 0; vertical-align: top;">
                                        <div style="font-size: 13px; color: #999999;">Phone Support</div>
                                    </td>
                                    <td style="padding: 14px 0; vertical-align: top;">
                                        <div style="font-size: 14px; color: #1a1a1a; font-weight: 500;">0753916751</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px;">
                            <div style="border-top: 1px solid #e8e6e0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 48px 48px;">
                            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #666666;">
                                Thank you for your patience, and we look forward to helping you!
                            </p>
                            <p style="margin: 16px 0 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 17px; font-style: italic; color: #1a1a1a;">
                                The Ticket Team
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #fafaf8; padding: 32px 48px; border-top: 1px solid #e8e6e0; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #999999;">
                                This email was sent automatically. Please do not reply directly to this message.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #cccccc;">
                                &copy; ${new Date().getFullYear()} Ticket. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="height: 60px;"></td>
        </tr>
    </table>
</body>
</html>
        `;

        const textContent = `Message Received

Hi ${userName},

Thank you for contacting us. We have received your message and will get back to you soon.

What's Next?
A member of our team will review your message and respond shortly, usually within 24-48 hours.

Contact Information:
Email Support: ${process.env.EMAIL_USER || 'support@ticket.com'}
Phone Support: 0753916751

Thank you for your patience, and we look forward to helping you!

The Ticket Team

---
© ${new Date().getFullYear()} Ticket. All rights reserved.
This email was sent automatically. Please do not reply directly to this message.`;

        const mailOptions = {
            from: `Ticket <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: '✅ We received your message - Ticket Support',
            text: textContent,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Contact confirmation email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Error sending contact confirmation email:', error);
        throw error;
    }
};

/**
 * Sends a cancellation confirmation email when a user cancels their ticket purchase.
 * Includes refund information and cancellation details.
 *
 * @async
 * @param {Object} cancellationData - Cancellation details
 * @param {string} cancellationData.email - Recipient's email address
 * @param {string} cancellationData.userName - User's name for personalization
 * @param {string} cancellationData.eventTitle - Title of the cancelled event
 * @param {string} cancellationData.eventDate - Date of the cancelled event
 * @param {number} cancellationData.quantity - Number of tickets cancelled
 * @param {number|string} cancellationData.refundAmount - Amount to be refunded
 * @param {string|number} cancellationData.purchaseId - Original purchase ID
 * @param {string} [cancellationData.refundId] - Refund transaction ID if available
 * @param {string} [cancellationData.refundStatus] - Status of the refund
 * @returns {Promise<{success: boolean, messageId: string}>} Result object with success status and email message ID
 * @throws {Error} If email sending fails
 *
 * @description
 * Side effects:
 * - Sends email via SMTP using configured transporter
 * - Logs success or error messages to console
 */
const sendCancellationEmail = async (cancellationData) => {
    const transporter = createTransporter();

    const {
        email,
        userName,
        eventTitle,
        eventDate,
        quantity,
        refundAmount,
        purchaseId,
        refundId,
        refundStatus
    } = cancellationData;

    const refundAmountNum = parseFloat(refundAmount) || 0;

    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Cancelled</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf8;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 60px 20px 40px;">
                <!-- Logo/Brand -->
                <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36px; font-weight: 700; color: #1a1a1a; letter-spacing: 0px; margin-bottom: 8px;">
                    Ticket
                </div>
                <div style="width: 60px; height: 2px; background-color: #1a1a1a; margin: 0 auto;"></div>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e8e6e0; border-radius: 2px;">
                    <tr>
                        <td style="padding: 48px 48px 32px;">
                            <h1 style="margin: 0 0 12px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1.3; letter-spacing: 0px;">
                                Booking Cancelled
                            </h1>
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #666666;">
                                Hi ${userName}, your booking has been successfully cancelled and your payment has been refunded.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px;">
                            <div style="border-top: 1px solid #e8e6e0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 48px;">
                            <div style="margin-bottom: 32px;">
                                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #999999; margin-bottom: 10px;">
                                    Event
                                </div>
                                <h2 style="margin: 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 28px; font-weight: 700; color: #1a1a1a; line-height: 1.3;">
                                    ${eventTitle}
                                </h2>
                            </div>
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 14px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top; width: 35%;">
                                        <div style="font-size: 13px; color: #999999;">Date</div>
                                    </td>
                                    <td style="padding: 14px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top;">
                                        <div style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${formattedDate}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 14px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top;">
                                        <div style="font-size: 13px; color: #999999;">Quantity</div>
                                    </td>
                                    <td style="padding: 14px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top;">
                                        <div style="font-size: 14px; color: #1a1a1a; font-weight: 500;">${quantity} ${quantity === 1 ? 'ticket' : 'tickets'}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 14px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top;">
                                        <div style="font-size: 13px; color: #999999;">Purchase ID</div>
                                    </td>
                                    <td style="padding: 14px 0; border-bottom: 1px solid #f5f5f5; vertical-align: top;">
                                        <div style="font-size: 14px; color: #1a1a1a; font-weight: 500;">#${purchaseId}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 18px 0 0; vertical-align: top;">
                                        <div style="font-size: 13px; color: #999999;">Refund Amount</div>
                                    </td>
                                    <td style="padding: 18px 0 0; vertical-align: top;">
                                        <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; color: #1a1a1a; font-weight: 700;">
                                            $${refundAmountNum.toFixed(2)}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px;">
                            <div style="border-top: 1px solid #e8e6e0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 48px;">
                            <div style="background-color: #fafaf8; border-left: 3px solid #1a1a1a; padding: 20px 24px; border-radius: 2px;">
                                <div style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
                                    Refund Processing
                                </div>
                                <div style="font-size: 14px; line-height: 1.7; color: #666666;">
                                    Your refund will be processed within 5-10 business days to your original payment method. ${refundId ? `Refund ID: ${refundId}` : ''}
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px 48px;">
                            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #666666;">
                                We appreciate your understanding and look forward to welcoming you to a future event.
                            </p>
                            <p style="margin: 16px 0 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 17px; font-style: italic; color: #1a1a1a;">
                                The Ticket Team
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #fafaf8; padding: 32px 48px; border-top: 1px solid #e8e6e0; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #999999;">
                                Questions? Contact us at ${process.env.EMAIL_USER || 'support@ticket.com'}
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #cccccc;">
                                &copy; ${new Date().getFullYear()} Ticket. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="height: 60px;"></td>
        </tr>
    </table>
</body>
</html>
    `;

    const mailOptions = {
        from: `"Ticket Platform" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Ticket Cancellation Confirmed - ${eventTitle}`,
        html: htmlContent
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Cancellation email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending cancellation email:', error);
        throw error;
    }
};

/**
 * Sends a password reset email with a secure reset link to the user.
 * The reset link typically expires after 1 hour for security purposes.
 *
 * @async
 * @param {string} userEmail - Recipient's email address
 * @param {string} userName - User's name for personalization
 * @param {string} resetLink - Secure password reset URL with token
 * @returns {Promise<{success: boolean, messageId: string}>} Result object with success status and email message ID
 * @throws {Error} If email sending fails
 *
 * @description
 * Side effects:
 * - Sends email via SMTP using configured transporter
 * - Logs success or error messages to console
 */
const sendPasswordResetEmail = async (userEmail, userName, resetLink) => {
    try {
        const transporter = createTransporter();

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf8;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 60px 20px 40px;">
                <!-- Logo/Brand -->
                <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36px; font-weight: 700; color: #1a1a1a; letter-spacing: 0px; margin-bottom: 8px;">
                    Ticket
                </div>
                <div style="width: 60px; height: 2px; background-color: #1a1a1a; margin: 0 auto;"></div>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e8e6e0; border-radius: 2px;">
                    <tr>
                        <td style="padding: 48px 48px 32px;">
                            <h1 style="margin: 0 0 12px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1.3; letter-spacing: 0px;">
                                Reset Your Password
                            </h1>
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #666666;">
                                Hi ${userName}, we received a request to reset your password. Click the button below to create a new password.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px;">
                            <div style="border-top: 1px solid #e8e6e0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 48px;">
                            <div align="center" style="margin-bottom: 32px;">
                                <a href="${resetLink}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 2px; border: 1px solid #1a1a1a; transition: all 0.2s;">
                                    Reset Password
                                </a>
                            </div>

                            <div style="background-color: #fafaf8; border-left: 3px solid #1a1a1a; padding: 20px 24px; border-radius: 2px; margin-bottom: 24px;">
                                <div style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
                                    ⏱ Link Expires Soon
                                </div>
                                <div style="font-size: 14px; line-height: 1.7; color: #666666;">
                                    This password reset link will expire in <strong>1 hour</strong> for security reasons. If you need a new link, please request another password reset.
                                </div>
                            </div>

                            <div style="background-color: #fff9e6; border-left: 3px solid #f5a623; padding: 20px 24px; border-radius: 2px;">
                                <div style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
                                    🔒 Security Notice
                                </div>
                                <div style="font-size: 14px; line-height: 1.7; color: #666666;">
                                    If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px;">
                            <div style="border-top: 1px solid #e8e6e0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 48px 48px;">
                            <p style="margin: 0 0 12px; font-size: 13px; color: #999999;">
                                If the button doesn't work, copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0; font-size: 13px; color: #0066cc; word-break: break-all;">
                                ${resetLink}
                            </p>
                            <p style="margin: 24px 0 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 17px; font-style: italic; color: #1a1a1a;">
                                The Ticket Team
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #fafaf8; padding: 32px 48px; border-top: 1px solid #e8e6e0; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #999999;">
                                Need help? Contact us at ${process.env.EMAIL_USER || 'support@ticket.com'}
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #cccccc;">
                                &copy; ${new Date().getFullYear()} Ticket. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="height: 60px;"></td>
        </tr>
    </table>
</body>
</html>
        `;

        const textContent = `Reset Your Password

Hi ${userName},

We received a request to reset your password. Click the link below to create a new password:

${resetLink}

⏱ IMPORTANT: This link will expire in 1 hour for security reasons.

🔒 Security Notice: If you didn't request this password reset, please ignore this email. Your password will remain unchanged.

The Ticket Team

---
Need help? Contact us at ${process.env.EMAIL_USER || 'support@ticket.com'}
© ${new Date().getFullYear()} Ticket. All rights reserved.`;

        const mailOptions = {
            from: `Ticket <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: '🔑 Reset Your Password - Ticket',
            text: textContent,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Password reset email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        throw error;
    }
};

/**
 * Sends a welcome email to newly registered users confirming their account creation.
 * Provides information about available features and a link to browse events.
 *
 * @async
 * @param {string} userEmail - Recipient's email address
 * @param {string} userName - User's name for personalization
 * @returns {Promise<{success: boolean, messageId: string}>} Result object with success status and email message ID
 * @throws {Error} If email sending fails
 *
 * @description
 * Side effects:
 * - Sends email via SMTP using configured transporter
 * - Logs success or error messages to console
 */
const sendRegistrationConfirmationEmail = async (userEmail, userName) => {
    try {
        const transporter = createTransporter();

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Ticket</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf8;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 60px 20px 40px;">
                <!-- Logo/Brand -->
                <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36px; font-weight: 700; color: #1a1a1a; letter-spacing: 0px; margin-bottom: 8px;">
                    Ticket
                </div>
                <div style="width: 60px; height: 2px; background-color: #1a1a1a; margin: 0 auto;"></div>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e8e6e0; border-radius: 2px;">
                    <tr>
                        <td style="padding: 48px 48px 32px;">
                            <h1 style="margin: 0 0 12px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1.3; letter-spacing: 0px;">
                                Welcome to Ticket!
                            </h1>
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #666666;">
                                Hi ${userName}, your account has been successfully created. We're excited to have you with us!
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px;">
                            <div style="border-top: 1px solid #e8e6e0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 48px;">
                            <div style="background-color: #fafaf8; border-left: 3px solid #1a1a1a; padding: 20px 24px; border-radius: 2px; margin-bottom: 32px;">
                                <div style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 8px;">
                                    🎉 Account Created
                                </div>
                                <div style="font-size: 14px; line-height: 1.7; color: #666666;">
                                    Your Ticket account is now active and ready to use. You can start browsing events and booking tickets right away.
                                </div>
                            </div>

                            <div style="margin-bottom: 24px;">
                                <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px; color: #999999; margin-bottom: 14px;">
                                    What You Can Do
                                </div>
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f5f5f5;">
                                            <div style="font-size: 14px; color: #1a1a1a; font-weight: 500; margin-bottom: 4px;">
                                                🎫 Browse Events
                                            </div>
                                            <div style="font-size: 13px; color: #999999;">
                                                Discover concerts, seminars, parties and more
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0; border-bottom: 1px solid #f5f5f5;">
                                            <div style="font-size: 14px; color: #1a1a1a; font-weight: 500; margin-bottom: 4px;">
                                                🎟️ Book Tickets
                                            </div>
                                            <div style="font-size: 13px; color: #999999;">
                                                Secure your seats with just a few clicks
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 12px 0;">
                                            <div style="font-size: 14px; color: #1a1a1a; font-weight: 500; margin-bottom: 4px;">
                                                📧 Get Updates
                                            </div>
                                            <div style="font-size: 13px; color: #999999;">
                                                Receive your tickets and event notifications via email
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            <div align="center" style="margin: 32px 0;">
                                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" style="display: inline-block; background-color: #1a1a1a; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 48px; border-radius: 2px; border: 1px solid #1a1a1a;">
                                    Browse Events
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px;">
                            <div style="border-top: 1px solid #e8e6e0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 40px 48px 48px;">
                            <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #666666;">
                                If you have any questions, feel free to reach out to our support team at ${process.env.EMAIL_USER || 'support@ticket.com'}
                            </p>
                            <p style="margin: 16px 0 0; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 17px; font-style: italic; color: #1a1a1a;">
                                The Ticket Team
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #fafaf8; padding: 32px 48px; border-top: 1px solid #e8e6e0; text-align: center;">
                            <p style="margin: 0 0 8px; font-size: 13px; color: #999999;">
                                This is an automated confirmation email
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #cccccc;">
                                &copy; ${new Date().getFullYear()} Ticket. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td style="height: 60px;"></td>
        </tr>
    </table>
</body>
</html>
        `;

        const textContent = `Welcome to Ticket!

Hi ${userName},

Your account has been successfully created. We're excited to have you with us!

🎉 Account Created
Your Ticket account is now active and ready to use. You can start browsing events and booking tickets right away.

What You Can Do:

🎫 Browse Events
   Discover concerts, seminars, parties and more

🎟️ Book Tickets
   Secure your seats with just a few clicks

📧 Get Updates
   Receive your tickets and event notifications via email

Visit us at: ${process.env.CLIENT_URL || 'http://localhost:5173'}

If you have any questions, feel free to reach out to our support team at ${process.env.EMAIL_USER || 'support@ticket.com'}

The Ticket Team

---
© ${new Date().getFullYear()} Ticket. All rights reserved.`;

        const mailOptions = {
            from: `Ticket <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: '🎉 Welcome to Ticket - Account Created Successfully',
            text: textContent,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Registration confirmation email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };

    } catch (error) {
        console.error('❌ Error sending registration confirmation email:', error);
        throw error;
    }
};

const sendWaitlistEmail = async ({ email, userName, eventTitle, eventId, expiresAt }) => {
    const transporter = createTransporter();

    const formattedExpiry = new Date(expiresAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const eventUrl = `http://localhost:5173/event/${eventId}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loc disponibil</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf8;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 60px 20px 40px;">
                <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px;">
                    Ticket
                </div>
                <div style="width: 60px; height: 2px; background-color: #1a1a1a; margin: 0 auto;"></div>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e8e6e0; border-radius: 2px;">
                    <tr>
                        <td style="padding: 48px 48px 32px;">
                            <h1 style="margin: 0 0 12px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1.3;">
                                S-a eliberat un loc!
                            </h1>
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #666666;">
                                Bună ${userName}, un loc s-a eliberat la evenimentul pentru care ești pe lista de așteptare.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px;">
                            <div style="border-top: 1px solid #e8e6e0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 48px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f0ede8;">
                                        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999999;">Eveniment</span>
                                        <div style="font-size: 16px; color: #1a1a1a; margin-top: 4px; font-weight: 500;">${eventTitle}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999999;">Oferta expiră la ora</span>
                                        <div style="font-size: 16px; color: #c0392b; margin-top: 4px; font-weight: 500;">${formattedExpiry} (10 minute)</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px 48px;">
                            <a href="${eventUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 14px; letter-spacing: 0.5px;">
                                Cumpără biletul acum →
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 48px; background-color: #fafaf8; border-top: 1px solid #e8e6e0;">
                            <p style="margin: 0; font-size: 13px; color: #999999; line-height: 1.5;">
                                Dacă nu cumperi biletul în 10 minute, locul va fi oferit următoarei persoane din listă.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Ticket" <noreply@ticket.ro>',
        to: email,
        subject: `Loc disponibil la "${eventTitle}" — acționează în 10 minute`,
        html: htmlContent
    });

    console.log(`✅ Waitlist email sent to: ${email}`);
};

const sendUpgradeEmail = async ({ email, userName, eventTitle, fromZone, toZone, newRow, newSeat, token, expiresAt }) => {
    const transporter = createTransporter();

    const formattedExpiry = new Date(expiresAt).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });

    const upgradeUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/upgrade/${token}`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ofertă upgrade loc</title>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&display=swap" rel="stylesheet">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fafaf8;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 60px 20px 40px;">
                <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 36px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px;">
                    Ticket
                </div>
                <div style="width: 60px; height: 2px; background-color: #1a1a1a; margin: 0 auto;"></div>
            </td>
        </tr>
        <tr>
            <td align="center" style="padding: 0 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e8e6e0; border-radius: 2px;">
                    <tr>
                        <td style="padding: 48px 48px 32px;">
                            <h1 style="margin: 0 0 12px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 32px; font-weight: 700; color: #1a1a1a; line-height: 1.3;">
                                Upgrade gratuit disponibil!
                            </h1>
                            <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #666666;">
                                Bună ${userName}, îți oferim un upgrade gratuit la un loc mai bun pentru evenimentul tău.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px;">
                            <div style="border-top: 1px solid #e8e6e0;"></div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 32px 48px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f0ede8;">
                                        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999999;">Eveniment</span>
                                        <div style="font-size: 16px; color: #1a1a1a; margin-top: 4px; font-weight: 500;">${eventTitle}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f0ede8;">
                                        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999999;">Upgrade</span>
                                        <div style="font-size: 16px; color: #1a1a1a; margin-top: 4px; font-weight: 500;">${fromZone} → <strong>${toZone}</strong></div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #f0ede8;">
                                        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999999;">Noul tău loc</span>
                                        <div style="font-size: 16px; color: #1a1a1a; margin-top: 4px; font-weight: 500;">Rândul ${newRow}, Locul ${newSeat}</div>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #999999;">Oferta expiră la ora</span>
                                        <div style="font-size: 16px; color: #c0392b; margin-top: 4px; font-weight: 500;">${formattedExpiry} (30 minute)</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 48px 48px;">
                            <a href="${upgradeUrl}" style="display: inline-block; padding: 14px 32px; background-color: #1a1a1a; color: #ffffff; text-decoration: none; font-size: 14px; letter-spacing: 0.5px;">
                                Acceptă upgrade-ul gratuit →
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 24px 48px; background-color: #fafaf8; border-top: 1px solid #e8e6e0;">
                            <p style="margin: 0; font-size: 13px; color: #999999; line-height: 1.5;">
                                Upgrade-ul este complet gratuit. Dacă nu acționezi în 30 de minute, oferta va expira și vei păstra locul original.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Ticket" <noreply@ticket.ro>',
        to: email,
        subject: `Upgrade gratuit: ${fromZone} → ${toZone} la "${eventTitle}"`,
        html: htmlContent
    });

    console.log(`✅ Upgrade email sent to: ${email}`);
};

module.exports = {
    sendTicketEmail,
    sendContactConfirmationEmail,
    sendCancellationEmail,
    sendPasswordResetEmail,
    sendRegistrationConfirmationEmail,
    sendWaitlistEmail,
    sendUpgradeEmail,
    generateTicketHTML
};

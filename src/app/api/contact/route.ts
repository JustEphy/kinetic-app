import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, category, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !category || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      );
    }

    // TODO: Implement actual email sending logic
    // Options:
    // 1. Use a service like SendGrid, Mailgun, or Resend
    // 2. Use nodemailer with SMTP
    // 3. Store in database and have admin view submissions
    // 4. Forward to your actual support email

    // For now, we'll just log the submission
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      category,
      message,
      timestamp: new Date().toISOString(),
    });

    // Simulate email sending (replace with actual implementation)
    // Example with SendGrid (commented out - requires setup):
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    const msg = {
      to: 'support@kinetic.app',
      from: process.env.SENDGRID_FROM_EMAIL,
      replyTo: email,
      subject: `[${category.toUpperCase()}] ${subject}`,
      text: `
        From: ${name} (${email})
        Category: ${category}
        Subject: ${subject}
        
        Message:
        ${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Category:</strong> ${category}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };
    
    await sgMail.send(msg);
    */

    // Return success response
    return NextResponse.json(
      { 
        success: true,
        message: 'Your message has been received. We\'ll get back to you soon!' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again later.' },
      { status: 500 }
    );
  }
}

// Handle GET requests (not allowed)
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

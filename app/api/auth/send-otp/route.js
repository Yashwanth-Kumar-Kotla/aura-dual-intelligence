import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createOTP } from "../../../../lib/otp";
import { getUserByEmail } from "../../../../lib/users";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, purpose = "login" } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (purpose === "login") {
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        return NextResponse.json(
          { error: "No account found with this email. Please sign up first." },
          { status: 404 }
        );
      }
    }

    if (purpose === "signup") {
      const existingUser = await getUserByEmail(normalizedEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in instead." },
          { status: 409 }
        );
      }
    }

    const otpCode = await createOTP(normalizedEmail, purpose);

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    try {
      const fromEmail = process.env.RESEND_FROM_EMAIL || "Aura Duo <onboarding@resend.dev>";
      const emailResult = await resend.emails.send({
        from: fromEmail,
        to: normalizedEmail,
        subject: `Your Aura Duo verification code: ${otpCode}`,
        html: `
          <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; font-size: 24px; margin: 0;">Aura Duo</h1>
            </div>
            <div style="background: #f9fafb; border-radius: 12px; padding: 30px; text-align: center;">
              <h2 style="color: #111827; font-size: 20px; margin: 0 0 10px 0;">Your verification code</h2>
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 20px 0;">
                Use this code to ${purpose === "login" ? "log in" : "sign up"} to your account.
              </p>
              <div style="background: white; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; display: inline-block; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otpCode}</span>
              </div>
              <p style="color: #6b7280; font-size: 12px; margin: 20px 0 0 0;">This code will expire in 10 minutes.</p>
            </div>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
        `,
      });

      if (emailResult?.error) {
        throw new Error(emailResult.error.message || "Failed to send email");
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "OTP sent successfully. Please check your email." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    if (error.message?.includes("Too many OTP requests") || error.message?.includes("Please wait")) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}

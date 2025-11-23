/**
 * Verify OTP API Route
 * 
 * Verifies the OTP code entered by the user.
 * If valid, creates a session (for login) or creates account + session (for signup).
 */

import { NextResponse } from "next/server";
import { verifyOTP } from "../../../../lib/otp";
import { getUserByEmail, createUser } from "../../../../lib/users";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, code, purpose, signupData } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and OTP code are required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Verify OTP
    const verification = verifyOTP(normalizedEmail, code);

    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error },
        { status: 400 }
      );
    }

    // Handle signup flow
    if (purpose === 'signup' || verification.purpose === 'signup') {
      // Check if user already exists (race condition check)
      const existingUser = getUserByEmail(normalizedEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: "Account already exists. Please log in instead." },
          { status: 409 }
        );
      }

      // Validate signup data
      if (!signupData || !signupData.name || !signupData.password) {
        return NextResponse.json(
          { error: "Signup data is required" },
          { status: 400 }
        );
      }

      // Validate password
      const { validatePassword } = await import("../../../../lib/passwordValidation");
      const passwordValidation = validatePassword(signupData.password);
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          { error: passwordValidation.errors[0] || "Password does not meet requirements" },
          { status: 400 }
        );
      }

      // Create new user with name and password
      const newUser = await createUser({
        email: normalizedEmail,
        password: signupData.password, // Will be hashed in createUser
        name: signupData.name.trim(),
      });

      // Return success - client will create session
      return NextResponse.json(
        {
          success: true,
          message: "Account created successfully",
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          },
        },
        { status: 200 }
      );
    }

    // Handle login flow
    if (purpose === 'login') {
      const user = getUserByEmail(normalizedEmail);
      if (!user) {
        return NextResponse.json(
          { error: "User not found. Please sign up first." },
          { status: 404 }
        );
      }

      // Return success - client will create session
      return NextResponse.json(
        {
          success: true,
          message: "OTP verified successfully",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { error: "Invalid OTP purpose" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}


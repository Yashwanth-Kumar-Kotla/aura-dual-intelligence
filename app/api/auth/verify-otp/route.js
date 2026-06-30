import { NextResponse } from "next/server";
import { verifyOTP } from "../../../../lib/otp";
import { getUserByEmail, createUser } from "../../../../lib/users";
import { validatePassword } from "../../../../lib/passwordValidation";

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

    const normalizedEmail = email.toLowerCase().trim();

    const verification = await verifyOTP(normalizedEmail, code);
    if (!verification.valid) {
      return NextResponse.json({ error: verification.error }, { status: 400 });
    }

    if (purpose === "signup" || verification.purpose === "signup") {
      const existingUser = await getUserByEmail(normalizedEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: "Account already exists. Please log in instead." },
          { status: 409 }
        );
      }

      if (!signupData?.name || !signupData?.password) {
        return NextResponse.json({ error: "Signup data is required" }, { status: 400 });
      }

      const passwordValidation = validatePassword(signupData.password);
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          { error: passwordValidation.errors[0] || "Password does not meet requirements" },
          { status: 400 }
        );
      }

      const newUser = await createUser({
        email: normalizedEmail,
        password: signupData.password,
        name: signupData.name.trim(),
      });

      return NextResponse.json(
        { success: true, message: "Account created successfully", user: { id: newUser.id, email: newUser.email, name: newUser.name } },
        { status: 200 }
      );
    }

    if (purpose === "login") {
      const user = await getUserByEmail(normalizedEmail);
      if (!user) {
        return NextResponse.json(
          { error: "User not found. Please sign up first." },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, message: "OTP verified successfully", user: { id: user.id, email: user.email, name: user.name } },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid OTP purpose" }, { status: 400 });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}

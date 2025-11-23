/**
 * Signup API Route
 * 
 * This endpoint handles user registration.
 * When a user signs up, we:
 * 1. Validate their input (email, password, name)
 * 2. Check if email already exists
 * 3. Hash the password (NEVER store plain text!)
 * 4. Save the user to our storage
 * 5. Return success or error
 */

import { NextResponse } from "next/server";
import { createUser, getUserByEmail } from "../../../../lib/users";
import { validatePassword } from "../../../../lib/passwordValidation";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;
    
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }
    
    // Check email format (basic validation)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }
    
    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] || "Password does not meet requirements" },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    if (getUserByEmail(email)) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 } // 409 Conflict
      );
    }
    
    // Create user (password will be hashed inside createUser)
    const user = await createUser({ email, password, name });
    
    // Return success (don't return password!)
    return NextResponse.json(
      { 
        message: "User created successfully",
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}


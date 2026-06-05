import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db, fieldValue } from "@/lib/db";
import { signJwt } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name, organizationName } = await request.json();

    if (!email || !password || !organizationName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const userSnap = await db.collection("users").where("email", "==", email).limit(1).get();

    if (!userSnap.empty) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const userRef = db.collection("users").doc();
    const userId = userRef.id;

    await userRef.set({
      email,
      password: hashedPassword,
      name: name || null,
      createdAt: fieldValue.serverTimestamp(),
    });

    const orgRef = db.collection("organizations").doc();
    const orgId = orgRef.id;
    await orgRef.set({
      userId,
      name: organizationName,
      createdAt: fieldValue.serverTimestamp(),
    });

    const companyRef = db.collection("companies").doc();
    await companyRef.set({
      organizationId: orgId,
      name: `${organizationName} Company`,
      createdAt: fieldValue.serverTimestamp(),
    });

    const token = await signJwt({ userId, email });

    const response = NextResponse.json({
      message: "User registered successfully",
      user: { id: userId, email, name },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { signJwt } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, name, organizationName } = await request.json();

    if (!email || !password || !organizationName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        organizations: {
          create: {
            name: organizationName,
          },
        },
      },
      include: {
        organizations: true,
      },
    });

    const token = await signJwt({ userId: user.id, email: user.email });

    const response = NextResponse.json({
      message: "User registered successfully",
      user: { id: user.id, email: user.email, name: user.name },
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

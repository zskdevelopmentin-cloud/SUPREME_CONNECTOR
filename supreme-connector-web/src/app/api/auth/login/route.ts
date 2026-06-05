import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signJwt } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const userSnap = await db.collection("users").where("email", "==", email).limit(1).get();

    if (userSnap.empty) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const userDoc = userSnap.docs[0];
    const user = userDoc.data();
    const userId = userDoc.id;

    if (!(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const orgsSnap = await db.collection("organizations").where("userId", "==", userId).get();
    const organizations = [];
    
    for (const orgDoc of orgsSnap.docs) {
      const orgData = orgDoc.data();
      const companiesSnap = await db.collection("companies").where("organizationId", "==", orgDoc.id).get();
      const companies = companiesSnap.docs.map(cDoc => ({
        id: cDoc.id,
        ...cDoc.data()
      }));
      
      organizations.push({
        id: orgDoc.id,
        name: orgData.name,
        companies
      });
    }

    const token = await signJwt({ userId, email: user.email });

    const response = NextResponse.json({
      message: "Login successful",
      user: { 
        id: userId, 
        email: user.email, 
        name: user.name,
        organizations
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

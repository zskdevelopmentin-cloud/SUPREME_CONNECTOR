import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });

    const logsSnap = await db.collection("sync_logs")
      .where("companyId", "==", companyId)
      .orderBy("createdAt", "desc")
      .limit(10)
      .get();

    const logs = logsSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null
    }));

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

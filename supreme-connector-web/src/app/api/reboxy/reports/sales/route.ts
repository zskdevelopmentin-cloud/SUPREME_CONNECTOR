import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) return NextResponse.json({ error: "companyId is required" }, { status: 400 });

    const salesSnap = await db.collection("salesInvoices")
      .where("companyId", "==", companyId)
      .orderBy("date", "desc")
      .limit(100)
      .get();

    const sales = salesSnap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      updatedAt: doc.data().updatedAt?.toDate() || null
    }));

    return NextResponse.json({ sales });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

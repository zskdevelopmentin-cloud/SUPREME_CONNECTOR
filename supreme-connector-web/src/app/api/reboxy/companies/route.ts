import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const companiesSnap = await db.collection("companies").get();
    const companies: any[] = [];

    for (const doc of companiesSnap.docs) {
      const cData = doc.data();
      
      const connectorsSnap = await db.collection("connectors").where("companyId", "==", doc.id).get();
      const connectors = connectorsSnap.docs.map(c => ({
        id: c.id,
        status: c.data().status,
        lastSyncedAt: c.data().lastSyncedAt?.toDate() || null
      }));

      companies.push({
        id: doc.id,
        ...cData,
        createdAt: cData.createdAt?.toDate() || null,
        connectors
      });
    }

    return NextResponse.json({ companies });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
